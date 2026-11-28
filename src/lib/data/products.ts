import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/utils'
import type { Categoria, MediaItem, ProductoConMedia } from '@/types'

function sortMediaAsc(media: MediaItem[] | null | undefined): MediaItem[] {
  if (!media || media.length === 0) return []
  return [...media].sort((a, b) => a.orden - b.orden)
}

function normalizeProductos(
  rows: unknown[] | null | undefined,
  options?: { preferGalleryOnlyForAlbums?: boolean }
): ProductoConMedia[] {
  if (!rows) return []
  return (rows as ProductoConMedia[]).map((row) => {
    let sorted = sortMediaAsc(row.media)
    if (
      options?.preferGalleryOnlyForAlbums &&
      row.categorias?.slug === 'albumes-figuritas'
    ) {
      const galleryOnly = sorted.filter((m) => m.rol !== 'PRESENTACION')
      if (galleryOnly.length > 0) {
        sorted = galleryOnly
      }
    }
    return {
      ...row,
      media: sorted,
    }
  })
}

export const getCategories = cache(async (): Promise<Categoria[]> => {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('id', { ascending: true })

    if (error || !data) return []
    return data
  } catch (err) {
    console.warn('Error al obtener las categorías desde Supabase:', err)
    return []
  }
})

export async function getCategoryBySlug(slug: string): Promise<Categoria | null> {
  const categories = await getCategories()
  return categories.find((cat) => cat.slug === slug) ?? null
}

/**
 * Obtiene productos con su categoría y su galería `media` ordenada ascendentemente por `orden`.
 */
export async function getProducts(categorySlug?: string): Promise<ProductoConMedia[]> {
  const isAllProjects = !categorySlug || categorySlug === 'proyectos'

  if (!isSupabaseConfigured()) return []

  try {
    const supabase = await createClient()

    const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de consulta Supabase')), 3500)
    )

    if (isAllProjects) {
      const query = supabase
        .from('productos')
        .select('*, categorias(*), media(*)')
        .order('creado_en', { ascending: false })
        .order('orden', { referencedTable: 'media', ascending: true })

      const result = (await Promise.race([query, timeoutPromise])) as {
        data: unknown[] | null
        error: unknown
      }

      return normalizeProductos(result.data, { preferGalleryOnlyForAlbums: true })
    }

    const query = supabase
      .from('productos')
      .select('*, categorias!inner(*), media(*)')
      .eq('categorias.slug', categorySlug)
      .order('creado_en', { ascending: false })
      .order('orden', { referencedTable: 'media', ascending: true })

    const result = (await Promise.race([query, timeoutPromise])) as {
      data: unknown[] | null
      error: unknown
    }

    return normalizeProductos(result.data, { preferGalleryOnlyForAlbums: true })
  } catch (err) {
    console.warn('Error al conectar con Supabase:', err)
    return []
  }
}

/**
 * Etiquetas de vinos marcadas con `mostrar_en_espiral = true` para el InfiniteSpiral del Hero.
 */
export async function getSpiralWineImages(): Promise<{ src: string; alt: string }[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias!inner(*), media(*)')
      .eq('categorias.slug', 'etiquetas-vinos')
      .eq('mostrar_en_espiral', true)
      .order('creado_en', { ascending: false })
      .order('orden', { referencedTable: 'media', ascending: true })

    if (error || !data) return []

    return normalizeProductos(data)
      .map((prod) => {
        const firstImage = prod.media.find((m) => m.tipo === 'IMAGEN')
        if (!firstImage) return null
        return {
          src: firstImage.url,
          alt: firstImage.alt_text || prod.nombre,
        }
      })
      .filter((item): item is { src: string; alt: string } => item !== null)
  } catch {
    return []
  }
}

/**
 * Etiquetas de vinos marcadas con `mostrar_en_galeria = true` para la galería de Etiquetas de Vinos.
 */
export async function getGalleryWineProducts(): Promise<ProductoConMedia[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias!inner(*), media(*)')
      .eq('categorias.slug', 'etiquetas-vinos')
      .eq('mostrar_en_galeria', true)
      .order('creado_en', { ascending: false })
      .order('orden', { referencedTable: 'media', ascending: true })

    if (error || !data) return []
    return normalizeProductos(data)
  } catch {
    return []
  }
}

/**
 * Álbumes marcados con `mostrar_en_seccion = true` para mostrar su video de presentación en AlbumsShowcase.
 */
export async function getShowcaseAlbums(): Promise<ProductoConMedia[]> {
  if (!isSupabaseConfigured()) return []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('productos')
      .select('*, categorias!inner(*), media(*)')
      .eq('categorias.slug', 'albumes-figuritas')
      .eq('mostrar_en_seccion', true)
      .order('creado_en', { ascending: false })
      .order('orden', { referencedTable: 'media', ascending: true })

    if (error || !data) return []
    return normalizeProductos(data)
  } catch {
    return []
  }
}
