import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Trash2, Package } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const products: Product[] = (productsData as Product[]) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Panel de Administración</h1>
          <p className="text-sm text-neutral-500">
            Gestiona los productos y trabajos visuales mostrados en la vidriera.
          </p>
        </div>
        <Link
          href="/admin/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white font-medium text-sm hover:bg-neutral-800 transition shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
          <span className="font-semibold text-sm text-neutral-700">Listado de Trabajos ({products.length})</span>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 space-y-3">
            <Package className="w-10 h-10 mx-auto text-neutral-300" />
            <p className="text-sm">No hay productos cargados todavía.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {products.map((product) => (
              <div key={product.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                    <Image
                      src={product.image_url}
                      alt={product.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm">{product.title}</h3>
                    <p className="text-xs text-neutral-500 capitalize">{product.category.replace('-', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-neutral-400 hover:text-red-600 rounded-lg transition hover:bg-red-50"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
