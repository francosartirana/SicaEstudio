export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MediaRol = 'PRESENTACION' | 'GALERIA'

export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: number
          nombre: string
          slug: string
          creado_en: string
        }
        Insert: {
          id?: number
          nombre: string
          slug: string
          creado_en?: string
        }
        Update: {
          id?: number
          nombre?: string
          slug?: string
          creado_en?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          categoria_id: number
          mostrar_en_espiral: boolean
          mostrar_en_galeria: boolean
          mostrar_en_seccion: boolean
          creado_en: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          categoria_id: number
          mostrar_en_espiral?: boolean
          mostrar_en_galeria?: boolean
          mostrar_en_seccion?: boolean
          creado_en?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          categoria_id?: number
          mostrar_en_espiral?: boolean
          mostrar_en_galeria?: boolean
          mostrar_en_seccion?: boolean
          creado_en?: string
        }
        Relationships: [
          {
            foreignKeyName: 'productos_categoria_id_fkey'
            columns: ['categoria_id']
            isOneToOne: false
            referencedRelation: 'categorias'
            referencedColumns: ['id']
          },
        ]
      }
      media: {
        Row: {
          id: string
          producto_id: string
          url: string
          storage_path: string | null
          tipo: Database['public']['Enums']['tipo_media']
          rol: MediaRol
          orden: number
          alt_text: string | null
          creado_en: string
        }
        Insert: {
          id?: string
          producto_id: string
          url: string
          storage_path?: string | null
          tipo: Database['public']['Enums']['tipo_media']
          rol?: MediaRol
          orden?: number
          alt_text?: string | null
          creado_en?: string
        }
        Update: {
          id?: string
          producto_id?: string
          url?: string
          storage_path?: string | null
          tipo?: Database['public']['Enums']['tipo_media']
          rol?: MediaRol
          orden?: number
          alt_text?: string | null
          creado_en?: string
        }
        Relationships: [
          {
            foreignKeyName: 'media_producto_id_fkey'
            columns: ['producto_id']
            isOneToOne: false
            referencedRelation: 'productos'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      tipo_media: 'IMAGEN' | 'VIDEO'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
