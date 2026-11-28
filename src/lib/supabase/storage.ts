'use client'

import { createClient } from '@/lib/supabase/client'
import type { TipoMedia } from '@/types'

export const PORTFOLIO_BUCKET = 'portfolio'
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'] as const
export const ALLOWED_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  ...ALLOWED_VIDEO_MIME_TYPES,
] as const

export interface DirectUploadResult {
  url: string
  storage_path: string
  tipo: TipoMedia
}

export function detectTipoMedia(mimeType: string): TipoMedia | null {
  if ((ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) {
    return 'IMAGEN'
  }
  if ((ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(mimeType)) {
    return 'VIDEO'
  }
  return null
}

function sanitizeSegment(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'general'
}

/**
 * Sube imágenes y videos directamente desde el navegador hacia el bucket `portfolio`
 * evitando el límite de 4.5 MB de Server Actions en Vercel.
 */
export async function uploadPortfolioMedia(
  file: File,
  folderSlug: string,
  onProgress?: (percent: number) => void
): Promise<DirectUploadResult> {
  const tipo = detectTipoMedia(file.type)
  if (!tipo) {
    throw new Error(
      `Formato no soportado (${file.type || 'desconocido'}). Usá JPG, PNG, WebP, MP4 o WebM.`
    )
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`El archivo "${file.name}" supera el límite de 50 MB.`)
  }

  onProgress?.(10)

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Tu sesión expiró. Volvé a iniciar sesión para subir archivos.')
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const uniqueSuffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  const folder = sanitizeSegment(folderSlug)
  const storagePath = `${folder}/${Date.now()}-${uniqueSuffix}.${ext}`

  onProgress?.(35)

  const { error: uploadError } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (uploadError) {
    throw new Error(`Error al subir "${file.name}": ${uploadError.message}`)
  }

  onProgress?.(90)

  const { data: publicUrlData } = supabase.storage
    .from(PORTFOLIO_BUCKET)
    .getPublicUrl(storagePath)

  onProgress?.(100)

  return {
    url: publicUrlData.publicUrl,
    storage_path: storagePath,
    tipo,
  }
}

export async function removePortfolioFilesFromBrowser(storagePaths: string[]): Promise<void> {
  const validPaths = storagePaths.filter(Boolean)
  if (validPaths.length === 0) return

  const supabase = createClient()
  await supabase.storage.from(PORTFOLIO_BUCKET).remove(validPaths)
}
