'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse, Categoria } from '@/types'

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const createCategorySchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().trim().optional(),
})

const updateCategorySchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().trim().optional(),
})

export async function createCategoryAction(input: {
  nombre: string
  slug?: string
}): Promise<ActionResponse<Categoria>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'No autorizado. Iniciá sesión nuevamente.' }
  }

  const parsed = createCategorySchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || 'Datos inválidos',
    }
  }

  const finalSlug = toSlug(parsed.data.slug || parsed.data.nombre)
  if (!finalSlug) {
    return { success: false, message: 'El slug generado no es válido.' }
  }

  const { data, error } = await supabase
    .from('categorias')
    .insert({
      nombre: parsed.data.nombre,
      slug: finalSlug,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return {
        success: false,
        message: 'Ya existe una categoría con ese nombre o slug.',
        error: error.message,
      }
    }
    return {
      success: false,
      message: 'No se pudo crear la categoría.',
      error: error.message,
    }
  }

  revalidatePath('/', 'layout')

  return {
    success: true,
    message: 'Categoría creada correctamente.',
    data,
  }
}

export async function updateCategoryAction(input: {
  id: number
  nombre: string
  slug?: string
}): Promise<ActionResponse<Categoria>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'No autorizado. Iniciá sesión nuevamente.' }
  }

  const parsed = updateCategorySchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || 'Datos inválidos',
    }
  }

  const finalSlug = toSlug(parsed.data.slug || parsed.data.nombre)
  if (!finalSlug) {
    return { success: false, message: 'El slug generado no es válido.' }
  }

  const { data, error } = await supabase
    .from('categorias')
    .update({
      nombre: parsed.data.nombre,
      slug: finalSlug,
    })
    .eq('id', parsed.data.id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return {
        success: false,
        message: 'Ya existe otra categoría con ese nombre o slug.',
        error: error.message,
      }
    }
    return {
      success: false,
      message: 'No se pudo actualizar la categoría.',
      error: error.message,
    }
  }

  revalidatePath('/', 'layout')

  return {
    success: true,
    message: 'Categoría actualizada correctamente.',
    data,
  }
}

export async function deleteCategoryAction(id: number): Promise<ActionResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'No autorizado. Iniciá sesión nuevamente.' }
  }

  const { error } = await supabase.from('categorias').delete().eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return {
        success: false,
        message:
          'No se puede eliminar esta categoría porque tiene productos asociados. Eliminá o reasigná los productos primero.',
        error: error.message,
      }
    }
    return {
      success: false,
      message: 'No se pudo eliminar la categoría.',
      error: error.message,
    }
  }

  revalidatePath('/', 'layout')

  return {
    success: true,
    message: 'Categoría eliminada correctamente.',
  }
}
