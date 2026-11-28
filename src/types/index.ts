import type { Database, MediaRol } from './database'

export type { MediaRol }
export type TipoMedia = Database['public']['Enums']['tipo_media']

export type Categoria = Database['public']['Tables']['categorias']['Row']
export type CategoriaInsert = Database['public']['Tables']['categorias']['Insert']
export type CategoriaUpdate = Database['public']['Tables']['categorias']['Update']

export type Producto = Database['public']['Tables']['productos']['Row']
export type ProductoInsert = Database['public']['Tables']['productos']['Insert']
export type ProductoUpdate = Database['public']['Tables']['productos']['Update']

export type MediaItem = Database['public']['Tables']['media']['Row']
export type MediaInsert = Database['public']['Tables']['media']['Insert']
export type MediaUpdate = Database['public']['Tables']['media']['Update']

export interface ProductoConMedia extends Producto {
  categorias?: Categoria | null
  media: MediaItem[]
}

export interface UploadedMediaDraft {
  id?: string
  url: string
  storage_path: string | null
  tipo: TipoMedia
  rol?: MediaRol
  orden: number
  alt_text: string | null
}

export interface ActionResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}
