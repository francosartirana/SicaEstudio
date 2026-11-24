'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse } from '@/types'

const productSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  category: z.enum(['etiquetas-vinos', 'albumes-figuritas', 'tarjetas-empresariales']),
  whatsapp_custom_message: z.string().optional(),
})

export async function createProductAction(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient()

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    whatsapp_custom_message: formData.get('whatsapp_custom_message') || undefined,
  }

  const validated = productSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      success: false,
      message: 'Datos del formulario inválidos',
      error: validated.error.issues[0]?.message || 'Error de validación',
    }
  }

  const imageFile = formData.get('image') as File | null
  if (!imageFile || imageFile.size === 0) {
    return {
      success: false,
      message: 'Debes proporcionar una imagen válida',
    }
  }

  // 1. Subir imagen a Supabase Storage
  const fileExt = imageFile.name.split('.').pop()
  const filePath = `${validated.data.category}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, imageFile, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    return {
      success: false,
      message: 'Error al subir la imagen al Storage',
      error: uploadError.message,
    }
  }

  // 2. Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from('products')
    .getPublicUrl(filePath)

  // 3. Insertar registro en la base de datos
  const { error: insertError } = await supabase.from('products').insert({
    title: validated.data.title,
    description: validated.data.description,
    category: validated.data.category,
    whatsapp_custom_message: validated.data.whatsapp_custom_message || null,
    image_url: publicUrlData.publicUrl,
  })

  if (insertError) {
    return {
      success: false,
      message: 'Error al registrar el producto en la base de datos',
      error: insertError.message,
    }
  }

  // 4. Revalidar rutas para actualizar la caché
  revalidatePath('/')
  revalidatePath(`/${validated.data.category}`)
  revalidatePath('/admin')

  return {
    success: true,
    message: 'Producto creado exitosamente',
  }
}

export async function deleteProductAction(productId: string, imagePath?: string): Promise<ActionResponse> {
  const supabase = await createClient()

  if (imagePath) {
    await supabase.storage.from('products').remove([imagePath])
  }

  const { error } = await supabase.from('products').delete().eq('id', productId)

  if (error) {
    return {
      success: false,
      message: 'Error al eliminar el producto',
      error: error.message,
    }
  }

  revalidatePath('/')
  revalidatePath('/admin')

  return {
    success: true,
    message: 'Producto eliminado exitosamente',
  }
}
