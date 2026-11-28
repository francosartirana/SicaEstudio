import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/utils'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import type { Categoria, MediaItem, ProductoConMedia } from '@/types'

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect('/login?error=supabase_not_configured')
  }

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?redirectTo=/admin')
  }

  const [{ data: categoriesData }, { data: productsData }] = await Promise.all([
    supabase.from('categorias').select('*').order('id', { ascending: true }),
    supabase
      .from('productos')
      .select('*, categorias(*), media(*)')
      .order('creado_en', { ascending: false })
      .order('orden', { referencedTable: 'media', ascending: true }),
  ])

  const categories: Categoria[] = categoriesData || []
  const products: ProductoConMedia[] = ((productsData as ProductoConMedia[]) || []).map(
    (prod) => ({
      ...prod,
      media: [...((prod.media as MediaItem[]) || [])].sort(
        (a, b) => a.orden - b.orden
      ),
    })
  )

  return (
    <AdminDashboard
      initialCategories={categories}
      initialProducts={products}
    />
  )
}
