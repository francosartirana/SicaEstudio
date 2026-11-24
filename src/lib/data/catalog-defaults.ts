import type { Product } from '@/types'

export const FALLBACK_ALBUM_CATALOG: Product[] = [
  {
    id: 'catalog-album-1',
    title: 'Álbum Coleccionable • Recuerdos y Viajes',
    description:
      'Álbum de fotos personalizado estilo figuritas con sobres sellados y cromos autoadhesivos de alta definición.',
    category: 'albumes-figuritas',
    image_url:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-02-20T18:00:00Z',
  },
  {
    id: 'catalog-album-2',
    title: 'Álbum Temático • Cumpleaños & Festejos',
    description:
      'Edición de 24 páginas ilustrada a medida con la temática del evento, tapa laminada y figuritas listas para pegar.',
    category: 'albumes-figuritas',
    image_url:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'catalog-album-3',
    title: 'Álbum de Autor • Parejas y Aniversarios',
    description:
      'Diseño editorial minimalista para regalar historias compartidas, con papel de alto gramaje y detalles en oro.',
    category: 'albumes-figuritas',
    image_url:
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-03-10T14:00:00Z',
  },
]

export const PUBLIC_WINE_PROJECTS: Product[] = [
  {
    id: 'proyecto-vino-1',
    title: 'Etiqueta de Autor • Malbec Clásico',
    description:
      'Etiqueta personalizada para botella de vino tinto con tipografía editorial y terminación en papel texturado.',
    category: 'etiquetas-vinos',
    image_url: '/botella1.jpg',
    created_at: '2026-03-01T12:00:00Z',
  },
  {
    id: 'proyecto-vino-2',
    title: 'Etiqueta Reserva • Blend de Altura',
    description:
      'Diseño de etiqueta de autor para ediciones especiales, regalos corporativos y celebraciones únicas.',
    category: 'etiquetas-vinos',
    image_url: '/botella2.jpg',
    created_at: '2026-03-02T12:00:00Z',
  },
  {
    id: 'proyecto-vino-3',
    title: 'Etiqueta Edición Especial • Celebración',
    description:
      'Composición personalizada con detalles dorados y estética minimalista pensada para momentos memorables.',
    category: 'etiquetas-vinos',
    image_url: '/botella3.jpg',
    created_at: '2026-03-03T12:00:00Z',
  },
  {
    id: 'proyecto-vino-4',
    title: 'Etiqueta Boutique • Colección Privada',
    description:
      'Etiqueta a medida para bodegas boutique y obsequios exclusivos con identidad visual propia.',
    category: 'etiquetas-vinos',
    image_url: '/botella4.jpg',
    created_at: '2026-03-04T12:00:00Z',
  },
  {
    id: 'proyecto-vino-5',
    title: 'Etiqueta Rosé • Edición Limitada',
    description:
      'Propuesta delicada y moderna para botellas conmemorativas, bodas y eventos privados.',
    category: 'etiquetas-vinos',
    image_url: '/botella5.jpg',
    created_at: '2026-03-05T12:00:00Z',
  },
]
