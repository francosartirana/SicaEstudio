export type ProductCategory =
  | 'etiquetas-vinos'
  | 'albumes-figuritas'
  | 'tarjetas-empresariales'
  | string

export interface Product {
  id: string
  title: string
  description: string
  category: ProductCategory
  image_url: string
  featured?: boolean
  whatsapp_custom_message?: string
  created_at: string
  updated_at?: string
}

export interface ActionResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}
