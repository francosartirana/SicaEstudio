'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse, ProductoConMedia, UploadedMediaDraft } from '@/types'

const PORTFOLIO_BUCKET = 'portfolio'

const mediaDraftSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url('La URL del archivo multimedia no es válida'),
  storage_path: z.string().nullable(),
  tipo: z.enum(['IMAGEN', 'VIDEO']),
  rol: z.enum(['PRESENTACION', 'GALERIA']).optional().default('GALERIA'),
  orden: z.number().int().min(0),
  alt_text: z.string().nullable(),
})

const createProductSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().trim().optional().nullable(),
  categoria_id: z.number().int().positive('Seleccioná una categoría válida'),
  mostrar_en_espiral: z.boolean().optional().default(false),
  mostrar_en_galeria: z.boolean().optional().default(false),
  mostrar_en_seccion: z.boolean().optional().default(false),
  media: z
    .array(mediaDraftSchema)
    .min(1, 'Debés subir al menos una imagen o video para el producto'),
})

const updateProductSchema = createProductSchema.extend({
  id: z.string().uuid('ID de producto inválido'),
  removedStoragePaths: z.array(z.string()).optional(),
})

export async function createProductAction(input: {
  nombre: string
  descripcion?: string | null
  categoria_id: number
  mostrar_en_espiral?: boolean
  mostrar_en_galeria?: boolean
  mostrar_en_seccion?: boolean
  media: UploadedMediaDraft[]
}): Promise<ActionResponse<ProductoConMedia>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'No autorizado. Iniciá sesión nuevamente.' }
  }

  const parsed = createProductSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || 'Datos del producto inválidos',
    }
  }

  const { data: createdProduct, error: productError } = await supabase
    .from('productos')
    .insert({
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion || null,
      categoria_id: parsed.data.categoria_id,
      mostrar_en_espiral: parsed.data.mostrar_en_espiral,
      mostrar_en_galeria: parsed.data.mostrar_en_galeria,
      mostrar_en_seccion: parsed.data.mostrar_en_seccion,
    })
    .select()
    .single()

  if (productError || !createdProduct) {
    return {
      success: false,
      message: 'No se pudo crear el producto en la base de datos.',
      error: productError?.message,
    }
  }

  const mediaRows = parsed.data.media.map((item, index) => ({
    producto_id: createdProduct.id,
    url: item.url,
    storage_path: item.storage_path,
    tipo: item.tipo,
    rol: item.rol,
    orden: index,
    alt_text: item.alt_text || parsed.data.nombre,
  }))

  const { data: insertedMedia, error: mediaError } = await supabase
    .from('media')
    .insert(mediaRows)
    .select()

  if (mediaError) {
    await supabase.from('productos').delete().eq('id', createdProduct.id)
    return {
      success: false,
      message: 'Error al guardar los archivos multimedia del producto.',
      error: mediaError.message,
    }
  }

  revalidatePath('/', 'layout')

  return {
    success: true,
    message: 'Producto creado exitosamente.',
    data: {
      ...createdProduct,
      media: insertedMedia ?? [],
    },
  }
}

export async function updateProductAction(input: {
  id: string
  nombre: string
  descripcion?: string | null
  categoria_id: number
  mostrar_en_espiral?: boolean
  mostrar_en_galeria?: boolean
  mostrar_en_seccion?: boolean
  media: UploadedMediaDraft[]
  removedStoragePaths?: string[]
}): Promise<ActionResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'No autorizado. Iniciá sesión nuevamente.' }
  }

  const parsed = updateProductSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || 'Datos inválidos',
    }
  }

  const { error: updateError } = await supabase
    .from('productos')
    .update({
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion || null,
      categoria_id: parsed.data.categoria_id,
      mostrar_en_espiral: parsed.data.mostrar_en_espiral,
      mostrar_en_galeria: parsed.data.mostrar_en_galeria,
      mostrar_en_seccion: parsed.data.mostrar_en_seccion,
    })
    .eq('id', parsed.data.id)

  if (updateError) {
    return {
      success: false,
      message: 'No se pudo actualizar el producto.',
      error: updateError.message,
    }
  }

  const { error: deleteMediaError } = await supabase
    .from('media')
    .delete()
    .eq('producto_id', parsed.data.id)

  if (deleteMediaError) {
    return {
      success: false,
      message: 'No se pudo actualizar la galería del producto.',
      error: deleteMediaError.message,
    }
  }

  const mediaRows = parsed.data.media.map((item, index) => ({
    producto_id: parsed.data.id,
    url: item.url,
    storage_path: item.storage_path,
    tipo: item.tipo,
    rol: item.rol,
    orden: index,
    alt_text: item.alt_text || parsed.data.nombre,
  }))

  const { error: insertMediaError } = await supabase.from('media').insert(mediaRows)

  if (insertMediaError) {
    return {
      success: false,
      message: 'Error al guardar el nuevo orden de la galería.',
      error: insertMediaError.message,
    }
  }

  const pathsToRemove = (parsed.data.removedStoragePaths || []).filter(Boolean)
  if (pathsToRemove.length > 0) {
    await supabase.storage.from(PORTFOLIO_BUCKET).remove(pathsToRemove)
  }

  revalidatePath('/', 'layout')

  return {
    success: true,
    message: 'Producto actualizado exitosamente.',
  }
}

export async function deleteProductAction(
  productId: string,
  knownStoragePaths?: string[]
): Promise<ActionResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'No autorizado. Iniciá sesión nuevamente.' }
  }

  let storagePaths = (knownStoragePaths || []).filter(Boolean)

  if (knownStoragePaths === undefined) {
    const { data: mediaList } = await supabase
      .from('media')
      .select('storage_path')
      .eq('producto_id', productId)

    storagePaths = (mediaList || [])
      .map((m) => m.storage_path)
      .filter((p): p is string => Boolean(p))
  }

  const { error: deleteError } = await supabase
    .from('productos')
    .delete()
    .eq('id', productId)

  if (deleteError) {
    return {
      success: false,
      message: 'Error al eliminar el producto.',
      error: deleteError.message,
    }
  }

  if (storagePaths.length > 0) {
    await supabase.storage.from(PORTFOLIO_BUCKET).remove(storagePaths)
  }

  revalidatePath('/', 'layout')

  return {
    success: true,
    message: 'Producto y archivos multimedia eliminados exitosamente.',
  }
}
