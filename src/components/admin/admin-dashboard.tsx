'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Trash2,
  Pencil,
  Upload,
  ArrowUp,
  ArrowDown,
  ImageIcon,
  Video,
  Package,
  FolderOpen,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GripVertical,
  Search,
  LayoutGrid,
  ExternalLink,
  LogOut,
  Sparkles,
  Layers,
} from 'lucide-react'
import type { Categoria, ProductoConMedia, UploadedMediaDraft } from '@/types'
import { createClient } from '@/lib/supabase/client'
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/lib/actions/categories'
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '@/lib/actions/products'
import {
  uploadPortfolioMedia,
  removePortfolioFilesFromBrowser,
} from '@/lib/supabase/storage'

interface UploadProgressItem {
  id: string
  fileName: string
  progress: number
  error?: string
}

interface AdminDashboardProps {
  initialCategories: Categoria[]
  initialProducts: ProductoConMedia[]
}

type AdminView = 'general' | 'productos' | 'categorias'

export function AdminDashboard({
  initialCategories,
  initialProducts,
}: AdminDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [activeView, setActiveView] = useState<AdminView>('general')
  const [adminSearch, setAdminSearch] = useState('')
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all')
  const [signingOut, setSigningOut] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // --- Estado de Categorías ---
  const [newCatNombre, setNewCatNombre] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')
  const [editingCatId, setEditingCatId] = useState<number | null>(null)
  const [editCatNombre, setEditCatNombre] = useState('')
  const [editCatSlug, setEditCatSlug] = useState('')

  // --- Estado de Modal Producto (<dialog> nativo) ---
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const pressedOutsideRef = useRef(false)

  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductoConMedia | null>(null)
  const [prodNombre, setProdNombre] = useState('')
  const [prodDescripcion, setProdDescripcion] = useState('')
  const [prodCategoriaId, setProdCategoriaId] = useState<number>(
    initialCategories[0]?.id ?? 0
  )
  const [mostrarEnEspiral, setMostrarEnEspiral] = useState(false)
  const [mostrarEnGaleria, setMostrarEnGaleria] = useState(false)
  const [mostrarEnSeccion, setMostrarEnSeccion] = useState(false)
  const [presentationVideo, setPresentationVideo] =
    useState<UploadedMediaDraft | null>(null)
  const [presentationUpload, setPresentationUpload] =
    useState<UploadProgressItem | null>(null)
  const [mediaDrafts, setMediaDrafts] = useState<UploadedMediaDraft[]>([])
  const [removedStoragePaths, setRemovedStoragePaths] = useState<string[]>([])
  const [newlyUploadedPaths, setNewlyUploadedPaths] = useState<string[]>([])
  const [uploads, setUploads] = useState<UploadProgressItem[]>([])
  const [isDraggingFiles, setIsDraggingFiles] = useState(false)
  const [draggedMediaIndex, setDraggedMediaIndex] = useState<number | null>(null)

  const selectedCategory = initialCategories.find((c) => c.id === prodCategoriaId)
  const selectedCategorySlug = selectedCategory?.slug || ''
  const isWineCategory = selectedCategorySlug === 'etiquetas-vinos'
  const isAlbumCategory = selectedCategorySlug === 'albumes-figuritas'

  // Sincronizar apertura/cierre del <dialog> nativo
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isProductModalOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isProductModalOpen && dialog.open) {
      dialog.close()
    }
  }, [isProductModalOpen])

  const showSuccess = (message: string) => {
    setFeedback({ type: 'success', message })
  }

  const showError = (message: string, detail?: string) => {
    setFeedback({
      type: 'error',
      message: detail ? `${message} (${detail})` : message,
    })
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.replace('/login')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  // ============================================================================
  // Handlers de Categorías
  // ============================================================================
  function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)
    startTransition(async () => {
      const res = await createCategoryAction({
        nombre: newCatNombre,
        slug: newCatSlug || undefined,
      })
      if (!res.success) {
        showError(res.message, res.error)
        return
      }
      setNewCatNombre('')
      setNewCatSlug('')
      showSuccess(res.message)
      router.refresh()
    })
  }

  function startEditCategory(cat: Categoria) {
    setEditingCatId(cat.id)
    setEditCatNombre(cat.nombre)
    setEditCatSlug(cat.slug)
  }

  function handleUpdateCategory(id: number) {
    setFeedback(null)
    startTransition(async () => {
      const res = await updateCategoryAction({
        id,
        nombre: editCatNombre,
        slug: editCatSlug || undefined,
      })
      if (!res.success) {
        showError(res.message, res.error)
        return
      }
      setEditingCatId(null)
      showSuccess(res.message)
      router.refresh()
    })
  }

  function handleDeleteCategory(cat: Categoria) {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return
    setFeedback(null)
    startTransition(async () => {
      const res = await deleteCategoryAction(cat.id)
      if (!res.success) {
        showError(res.message, res.error)
        return
      }
      showSuccess(res.message)
      router.refresh()
    })
  }

  // ============================================================================
  // Handlers de Productos y Subida Directa
  // ============================================================================
  function openCreateProductModal() {
    setEditingProduct(null)
    setProdNombre('')
    setProdDescripcion('')
    setProdCategoriaId(initialCategories[0]?.id ?? 0)
    setMostrarEnEspiral(false)
    setMostrarEnGaleria(false)
    setMostrarEnSeccion(false)
    setPresentationVideo(null)
    setPresentationUpload(null)
    setMediaDrafts([])
    setRemovedStoragePaths([])
    setNewlyUploadedPaths([])
    setUploads([])
    setIsProductModalOpen(true)
  }

  function openEditProductModal(product: ProductoConMedia) {
    setEditingProduct(product)
    setProdNombre(product.nombre)
    setProdDescripcion(product.descripcion || '')
    setProdCategoriaId(product.categoria_id)
    setMostrarEnEspiral(Boolean(product.mostrar_en_espiral))
    setMostrarEnGaleria(Boolean(product.mostrar_en_galeria))
    setMostrarEnSeccion(Boolean(product.mostrar_en_seccion))

    const pres = product.media.find((m) => m.rol === 'PRESENTACION')
    setPresentationVideo(
      pres
        ? {
            id: pres.id,
            url: pres.url,
            storage_path: pres.storage_path,
            tipo: pres.tipo,
            rol: 'PRESENTACION',
            orden: 0,
            alt_text: pres.alt_text,
          }
        : null
    )
    setPresentationUpload(null)

    const galleryItems = product.media.filter((m) => m.rol !== 'PRESENTACION')
    setMediaDrafts(
      galleryItems.map((m, idx) => ({
        id: m.id,
        url: m.url,
        storage_path: m.storage_path,
        tipo: m.tipo,
        rol: 'GALERIA',
        orden: idx,
        alt_text: m.alt_text,
      }))
    )
    setRemovedStoragePaths([])
    setNewlyUploadedPaths([])
    setUploads([])
    setIsProductModalOpen(true)
  }

  async function closeProductModalWithCleanup() {
    if (newlyUploadedPaths.length > 0) {
      await removePortfolioFilesFromBrowser(newlyUploadedPaths)
    }
    setIsProductModalOpen(false)
    setEditingProduct(null)
    setNewlyUploadedPaths([])
    setRemovedStoragePaths([])
  }

  async function handleFilesSelected(files: FileList | File[]) {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const folderSlug = selectedCategorySlug || 'general'

    for (const file of fileArray) {
      const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setUploads((prev) => [
        ...prev,
        { id: uploadId, fileName: file.name, progress: 5 },
      ])

      try {
        const uploaded = await uploadPortfolioMedia(file, folderSlug, (percent) => {
          setUploads((prev) =>
            prev.map((item) =>
              item.id === uploadId ? { ...item, progress: percent } : item
            )
          )
        })

        setNewlyUploadedPaths((prev) => [...prev, uploaded.storage_path])
        setMediaDrafts((prev) => [
          ...prev,
          {
            url: uploaded.url,
            storage_path: uploaded.storage_path,
            tipo: uploaded.tipo,
            rol: 'GALERIA',
            orden: prev.length,
            alt_text: prodNombre || file.name.replace(/\.[^.]+$/, ''),
          },
        ])

        setUploads((prev) => prev.filter((item) => item.id !== uploadId))
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al subir archivo al Storage'
        setUploads((prev) =>
          prev.map((item) =>
            item.id === uploadId ? { ...item, progress: 0, error: message } : item
          )
        )
      }
    }
  }

  function moveMediaItem(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= mediaDrafts.length || fromIndex === toIndex) return
    setMediaDrafts((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next.map((item, idx) => ({ ...item, orden: idx }))
    })
  }

  async function removeMediaDraft(index: number) {
    const target = mediaDrafts[index]
    if (!target) return

    if (target.storage_path) {
      if (newlyUploadedPaths.includes(target.storage_path)) {
        await removePortfolioFilesFromBrowser([target.storage_path])
        setNewlyUploadedPaths((prev) =>
          prev.filter((p) => p !== target.storage_path)
        )
      } else {
        setRemovedStoragePaths((prev) => [...prev, target.storage_path!])
      }
    }

    setMediaDrafts((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...item, orden: idx }))
    )
  }

  async function handlePresentationVideoSelected(file: File) {
    const uploadId = `pres-${Date.now()}`
    setPresentationUpload({ id: uploadId, fileName: file.name, progress: 5 })

    try {
      const uploaded = await uploadPortfolioMedia(
        file,
        selectedCategorySlug || 'albumes-figuritas',
        (percent) => {
          setPresentationUpload((prev) =>
            prev ? { ...prev, progress: percent } : null
          )
        }
      )

      if (uploaded.tipo !== 'VIDEO') {
        await removePortfolioFilesFromBrowser([uploaded.storage_path])
        setPresentationUpload({
          id: uploadId,
          fileName: file.name,
          progress: 0,
          error: 'El video de presentación debe ser formato MP4 o WebM.',
        })
        return
      }

      if (presentationVideo?.storage_path) {
        if (newlyUploadedPaths.includes(presentationVideo.storage_path)) {
          await removePortfolioFilesFromBrowser([presentationVideo.storage_path])
          setNewlyUploadedPaths((prev) =>
            prev.filter((p) => p !== presentationVideo.storage_path)
          )
        } else {
          setRemovedStoragePaths((prev) => [
            ...prev,
            presentationVideo.storage_path!,
          ])
        }
      }

      setNewlyUploadedPaths((prev) => [...prev, uploaded.storage_path])
      setPresentationVideo({
        url: uploaded.url,
        storage_path: uploaded.storage_path,
        tipo: 'VIDEO',
        rol: 'PRESENTACION',
        orden: 0,
        alt_text: prodNombre || file.name.replace(/\.[^.]+$/, ''),
      })
      setPresentationUpload(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al subir video de presentación'
      setPresentationUpload({
        id: uploadId,
        fileName: file.name,
        progress: 0,
        error: message,
      })
    }
  }

  async function removePresentationVideo() {
    if (!presentationVideo) return
    if (presentationVideo.storage_path) {
      if (newlyUploadedPaths.includes(presentationVideo.storage_path)) {
        await removePortfolioFilesFromBrowser([presentationVideo.storage_path])
        setNewlyUploadedPaths((prev) =>
          prev.filter((p) => p !== presentationVideo.storage_path)
        )
      } else {
        setRemovedStoragePaths((prev) => [
          ...prev,
          presentationVideo.storage_path!,
        ])
      }
    }
    setPresentationVideo(null)
  }

  function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault()
    if (
      uploads.some((u) => !u.error) ||
      (presentationUpload && !presentationUpload.error)
    ) {
      showError('Esperá a que terminen de subirse todos los archivos.')
      return
    }
    setFeedback(null)

    startTransition(async () => {
      const galleryMedia = mediaDrafts.map((item, idx) => ({
        ...item,
        rol: 'GALERIA' as const,
        orden: idx,
      }))

      const combinedMedia: UploadedMediaDraft[] =
        isAlbumCategory && presentationVideo
          ? [{ ...presentationVideo, rol: 'PRESENTACION', orden: 0 }, ...galleryMedia]
          : galleryMedia

      const flags = {
        mostrar_en_espiral: isWineCategory ? mostrarEnEspiral : false,
        mostrar_en_galeria: isWineCategory ? mostrarEnGaleria : false,
        mostrar_en_seccion: isAlbumCategory ? mostrarEnSeccion : false,
      }

      if (editingProduct) {
        const res = await updateProductAction({
          id: editingProduct.id,
          nombre: prodNombre,
          descripcion: prodDescripcion || null,
          categoria_id: prodCategoriaId,
          ...flags,
          media: combinedMedia,
          removedStoragePaths,
        })
        if (!res.success) {
          showError(res.message, res.error)
          return
        }
        setNewlyUploadedPaths([])
        setRemovedStoragePaths([])
        setIsProductModalOpen(false)
        setEditingProduct(null)
        showSuccess(res.message)
        router.refresh()
        return
      }

      const res = await createProductAction({
        nombre: prodNombre,
        descripcion: prodDescripcion || null,
        categoria_id: prodCategoriaId,
        ...flags,
        media: combinedMedia,
      })

      if (!res.success) {
        showError(res.message, res.error)
        return
      }

      setNewlyUploadedPaths([])
      setIsProductModalOpen(false)
      showSuccess(res.message)
      router.refresh()
    })
  }

  function handleDeleteProduct(product: ProductoConMedia) {
    if (
      !confirm(
        `¿Eliminar "${product.nombre}" y todos sus archivos multimedia asociados?`
      )
    ) {
      return
    }
    setFeedback(null)
    const storagePaths = product.media
      .map((m) => m.storage_path)
      .filter((p): p is string => Boolean(p))

    startTransition(async () => {
      const res = await deleteProductAction(product.id, storagePaths)
      if (!res.success) {
        showError(res.message, res.error)
        return
      }
      showSuccess(res.message)
    })
  }

  const activeUploadsCount = uploads.filter((u) => !u.error).length

  const filteredAdminProducts = initialProducts.filter((product) => {
    const q = adminSearch.trim().toLowerCase()
    const matchesName = !q || product.nombre.toLowerCase().includes(q)
    const matchesCategory =
      adminCategoryFilter === 'all' ||
      String(product.categoria_id) === adminCategoryFilter
    return matchesName && matchesCategory
  })

  // Métricas Bento reales (sin gráficos ficticios)
  const totalMediaCount = initialProducts.reduce((acc, p) => acc + p.media.length, 0)
  const totalImagesCount = initialProducts.reduce(
    (acc, p) => acc + p.media.filter((m) => m.tipo === 'IMAGEN').length,
    0
  )
  const totalVideosCount = totalMediaCount - totalImagesCount
  const featuredCount = initialProducts.filter(
    (p) => p.mostrar_en_espiral || p.mostrar_en_galeria || p.mostrar_en_seccion
  ).length

  const navItems: { id: AdminView; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'general', label: 'Vista General', icon: LayoutGrid },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'categorias', label: 'Categorías', icon: FolderOpen },
  ]

  // Sub-bloque reutilizable de Categorías (para Bento lateral o vista dedicada)
  const categoriesCardContent = (
    <div className="bg-white rounded-3xl border border-[#E8DECF] p-5 shadow-[0_6px_24px_rgba(28,25,23,0.03)] flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#F5EFE6] border border-[#E8DECF] flex items-center justify-center text-[#5A6347]">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#1C1917] leading-tight">
              Categorías
            </h2>
            <p className="text-xs text-[#57534E]">
              {initialCategories.length}{' '}
              {initialCategories.length === 1 ? 'activa' : 'activas'}
            </p>
          </div>
        </div>
      </div>

      {/* Form rápido para crear categoría */}
      <form
        onSubmit={handleCreateCategory}
        className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E8DECF]/90 space-y-2.5"
      >
        <input
          type="text"
          required
          value={newCatNombre}
          onChange={(e) => setNewCatNombre(e.target.value)}
          placeholder="Nombre (ej: Etiquetas de Autor)"
          aria-label="Nombre de nueva categoría"
          className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#E8DECF] rounded-xl text-[#1C1917] placeholder:text-[#78716C]/80 focus:outline-none focus:border-[#A18417]"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={newCatSlug}
            onChange={(e) => setNewCatSlug(e.target.value)}
            placeholder="slug-opcional"
            aria-label="Slug de nueva categoría"
            className="flex-1 min-w-0 px-3 py-2 text-xs font-mono bg-white border border-[#E8DECF] rounded-xl text-[#1C1917] placeholder:text-[#78716C]/70 focus:outline-none focus:border-[#A18417]"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] text-xs font-medium transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isPending ? '...' : 'Agregar'}
          </button>
        </div>
      </form>

      {/* Lista de categorías */}
      <div className="divide-y divide-[#E8DECF]/70 flex-1">
        {initialCategories.length === 0 ? (
          <p className="text-xs text-[#78716C] py-6 text-center">
            No hay categorías creadas todavía.
          </p>
        ) : (
          initialCategories.map((cat) => (
            <div
              key={cat.id}
              className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-2"
            >
              {editingCatId === cat.id ? (
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    value={editCatNombre}
                    onChange={(e) => setEditCatNombre(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#FAF7F0] border border-[#DDC385] rounded-lg focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editCatSlug}
                    onChange={(e) => setEditCatSlug(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF7F0] border border-[#DDC385] rounded-lg focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateCategory(cat.id)}
                      disabled={isPending}
                      className="px-3 py-1 rounded-lg bg-[#1C1917] text-[#FAF7F0] text-xs font-medium cursor-pointer"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCatId(null)}
                      className="px-2.5 py-1 rounded-lg border border-[#E8DECF] text-[#57534E] text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#1C1917] truncate">
                      {cat.nombre}
                    </p>
                    <p className="text-[11px] text-[#57534E] font-mono truncate">
                      /{cat.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEditCategory(cat)}
                      className="p-2 text-[#57534E] hover:text-[#1C1917] rounded-xl hover:bg-[#F5EFE6] transition cursor-pointer"
                      aria-label={`Editar categoría ${cat.nombre}`}
                      title="Editar categoría"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-2 text-[#78716C] hover:text-red-700 rounded-xl hover:bg-red-50 transition cursor-pointer"
                      aria-label={`Eliminar categoría ${cat.nombre}`}
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )

  // Sub-bloque reutilizable de Productos
  const productsCardContent = (
    <div className="bg-white rounded-3xl border border-[#E8DECF] p-5 shadow-[0_6px_24px_rgba(28,25,23,0.03)] flex flex-col gap-4 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#FAF7EC] border border-[#E8D99E] flex items-center justify-center text-[#A18417]">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#1C1917] leading-tight">
              Catálogo de Productos
            </h2>
            <p className="text-xs text-[#57534E] tabular-nums">
              Mostrando {filteredAdminProducts.length} de {initialProducts.length}
            </p>
          </div>
        </div>

        {/* Buscador y filtro por categoría */}
        {initialProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Buscar por nombre..."
                aria-label="Buscar producto por nombre"
                className="w-full sm:w-48 pl-8 pr-7 py-2 text-xs bg-[#FAF7F0] border border-[#E8DECF] rounded-full text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#A18417] focus:bg-white transition"
              />
              {adminSearch && (
                <button
                  type="button"
                  onClick={() => setAdminSearch('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={adminCategoryFilter}
              onChange={(e) => setAdminCategoryFilter(e.target.value)}
              aria-label="Filtrar productos por categoría"
              className="px-3 py-2 text-xs font-medium bg-[#FAF7F0] border border-[#E8DECF] rounded-full text-[#1C1917] hover:border-[#DDC385] focus:outline-none focus:border-[#A18417] cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              {initialCategories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Listado */}
      {initialProducts.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-[#E8DECF] bg-[#FAF7F0]/60 text-center text-[#57534E] space-y-2">
          <Package className="w-9 h-9 mx-auto text-[#C4B59D]" />
          <p className="text-sm font-semibold text-[#1C1917]">
            No hay productos cargados todavía
          </p>
          <p className="text-xs">
            Usá el botón &ldquo;Nuevo Producto&rdquo; para comenzar a cargar el catálogo.
          </p>
        </div>
      ) : filteredAdminProducts.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-[#E8DECF] bg-[#FAF7F0]/60 text-center text-[#57534E] space-y-2.5">
          <p className="text-sm font-semibold text-[#1C1917]">
            No hay productos que coincidan con los filtros
          </p>
          <button
            type="button"
            onClick={() => {
              setAdminSearch('')
              setAdminCategoryFilter('all')
            }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#1C1917] text-[#FAF7F0] text-xs font-medium hover:bg-[#292524] transition cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#E8DECF]/70">
          {filteredAdminProducts.map((product) => {
            const cover = product.media[0]
            return (
              <div
                key={product.id}
                className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-2xl bg-[#F5EFE6] overflow-hidden shrink-0 border border-[#E8DECF] flex items-center justify-center">
                    {cover ? (
                      cover.tipo === 'VIDEO' ? (
                        <video
                          src={cover.url}
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={cover.url}
                          alt={cover.alt_text || product.nombre}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[#A8A29E]" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h3 className="font-semibold text-[#1C1917] text-sm truncate">
                      {product.nombre}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F5EFE6] text-[#5A6347] font-semibold border border-[#E8DECF]">
                        {product.categorias?.nombre || 'Sin categoría'}
                      </span>
                      <span className="text-[#78716C] tabular-nums">
                        • {product.media.length}{' '}
                        {product.media.length === 1 ? 'archivo' : 'archivos'}
                      </span>
                      {product.mostrar_en_espiral && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF7EC] text-[#846C12] border border-[#E8D99E] font-medium">
                          Espiral
                        </span>
                      )}
                      {product.mostrar_en_galeria && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF7EC] text-[#846C12] border border-[#E8D99E] font-medium">
                          Galería
                        </span>
                      )}
                      {product.mostrar_en_seccion && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF7EC] text-[#846C12] border border-[#E8D99E] font-medium">
                          Sección
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditProductModal(product)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8DECF] bg-[#FAF7F0] text-[#1C1917] hover:border-[#DDC385] hover:bg-[#F5EFE6] text-xs font-medium transition cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#A18417]" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(product)}
                    disabled={isPending}
                    className="p-2 text-[#78716C] hover:text-red-700 rounded-full transition hover:bg-red-50 cursor-pointer"
                    aria-label={`Eliminar producto ${product.nombre}`}
                    title="Eliminar producto y archivos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F6F3EC] p-3 sm:p-5 lg:p-6">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-5">
        {/* =================================================================
            SIDEBAR BENTO (Desktop)
           ================================================================= */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between bg-white rounded-3xl border border-[#E8DECF] p-5 shadow-[0_6px_24px_rgba(28,25,23,0.03)] sticky top-6 h-[calc(100vh-3rem)]">
          <div className="space-y-6">
            {/* Marca */}
            <Link href="/admin" className="flex items-center gap-3 px-1 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#DDC385] bg-[#F0D79E] shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="SicaEstudio"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-serif font-bold text-base text-[#1C1917] leading-none">
                  SicaEstudio
                </p>
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF7EC] text-[#846C12] border border-[#E8D99E]">
                  Admin
                </span>
              </div>
            </Link>

            {/* Buscador rápido lateral */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={adminSearch}
                onChange={(e) => {
                  setAdminSearch(e.target.value)
                  if (activeView === 'categorias') setActiveView('general')
                }}
                placeholder="Buscar producto..."
                aria-label="Búsqueda rápida de productos"
                className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAF7F0] border border-[#E8DECF] rounded-xl text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#A18417]"
              />
            </div>

            {/* Navegación modular */}
            <nav className="space-y-1" aria-label="Navegación administrativa">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-[#F5EFE6] text-[#1C1917] border border-[#DDC385]/70 shadow-2xs'
                        : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF7F0] border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#A18417]' : 'text-[#78716C]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                )
              })}

              <Link
                href="/"
                target="_blank"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF7F0] transition"
              >
                <span className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-[#5A6347]" />
                  <span>Ver web pública</span>
                </span>
              </Link>
            </nav>
          </div>

          {/* Footer de sesión */}
          <div className="pt-4 border-t border-[#E8DECF]/80">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#FAF7F0] hover:bg-[#F5EFE6] border border-[#E8DECF] text-[#1C1917] text-xs font-medium transition disabled:opacity-50 cursor-pointer"
            >
              {signingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5 text-[#8C533E]" />
              )}
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* =================================================================
            ÁREA PRINCIPAL BENTO
           ================================================================= */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* Header mobile (< lg) */}
          <div className="lg:hidden bg-white rounded-3xl border border-[#E8DECF] p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#DDC385] bg-[#F0D79E] shrink-0">
                  <Image
                    src="/logo.jpg"
                    alt="SicaEstudio"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
                <span className="font-serif font-bold text-base text-[#1C1917]">
                  SicaEstudio Admin
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  target="_blank"
                  className="p-2 rounded-full bg-[#FAF7F0] border border-[#E8DECF] text-[#57534E]"
                  aria-label="Ver web pública"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="p-2 rounded-full bg-[#FAF7F0] border border-[#E8DECF] text-[#8C533E]"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-[#FAF7F0] p-1 rounded-full border border-[#E8DECF]">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition ${
                    activeView === item.id
                      ? 'bg-[#1C1917] text-[#FAF7F0]'
                      : 'text-[#57534E]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Encabezado principal + Acción primaria */}
          <div className="bg-white rounded-3xl border border-[#E8DECF] px-6 py-5 shadow-[0_6px_24px_rgba(28,25,23,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
                Panel de Administración
              </h1>
              <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
                Gestioná el catálogo de SicaEstudio, categorías y multimedia en Storage.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateProductModal}
              disabled={initialCategories.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] font-medium text-sm transition shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-[#DDC385]" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`flex items-start gap-2.5 p-4 rounded-2xl border text-sm ${
                feedback.type === 'success'
                  ? 'bg-[#FAF7EC] border-[#DDC385] text-[#1C1917]'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#5A6347]" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span className="flex-1">{feedback.message}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-current/60 hover:text-current cursor-pointer"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Fila Bento de Resumen (4 módulos compactos) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl border border-[#E8DECF] p-5 shadow-[0_6px_24px_rgba(28,25,23,0.03)] space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-[#57534E]">
                <span>Productos</span>
                <span className="w-7 h-7 rounded-xl bg-[#FAF7EC] text-[#A18417] flex items-center justify-center">
                  <Package className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="font-serif text-3xl font-bold text-[#1C1917] tabular-nums">
                {initialProducts.length}
              </p>
              <p className="text-[11px] text-[#57534E]">Publicados en catálogo</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DECF] p-5 shadow-[0_6px_24px_rgba(28,25,23,0.03)] space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-[#57534E]">
                <span>Categorías</span>
                <span className="w-7 h-7 rounded-xl bg-[#F5EFE6] text-[#5A6347] flex items-center justify-center">
                  <FolderOpen className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="font-serif text-3xl font-bold text-[#1C1917] tabular-nums">
                {initialCategories.length}
              </p>
              <p className="text-[11px] text-[#57534E]">Secciones activas</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DECF] p-5 shadow-[0_6px_24px_rgba(28,25,23,0.03)] space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-[#57534E]">
                <span>Multimedia</span>
                <span className="w-7 h-7 rounded-xl bg-[#F5EFE6] text-[#5A6347] flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="font-serif text-3xl font-bold text-[#1C1917] tabular-nums">
                {totalMediaCount}
              </p>
              <p className="text-[11px] text-[#57534E] tabular-nums">
                {totalImagesCount} fotos · {totalVideosCount} videos
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DECF] p-5 shadow-[0_6px_24px_rgba(28,25,23,0.03)] space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-[#57534E]">
                <span>Destacados</span>
                <span className="w-7 h-7 rounded-xl bg-[#FAF7EC] text-[#A18417] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="font-serif text-3xl font-bold text-[#1C1917] tabular-nums">
                {featuredCount}
              </p>
              <p className="text-[11px] text-[#57534E]">En Espiral / Galería / Inicio</p>
            </div>
          </div>

          {/* Grilla Bento Principal */}
          {activeView === 'general' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              <div className="xl:col-span-8">{productsCardContent}</div>
              <div className="xl:col-span-4">{categoriesCardContent}</div>
            </div>
          )}

          {activeView === 'productos' && <div>{productsCardContent}</div>}

          {activeView === 'categorias' && <div>{categoriesCardContent}</div>}
        </main>
      </div>

      {/* ===================================================================
          MODAL NATIVO (<dialog>) CREAR / EDITAR PRODUCTO
         =================================================================== */}
      <dialog
        ref={dialogRef}
        aria-labelledby="product-modal-title"
        onCancel={(e) => {
          e.preventDefault()
          void closeProductModalWithCleanup()
        }}
        onPointerDown={(e) => {
          const dialog = dialogRef.current
          if (!dialog) return
          const r = dialog.getBoundingClientRect()
          pressedOutsideRef.current =
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
        }}
        onPointerUp={(e) => {
          const dialog = dialogRef.current
          if (!dialog || !pressedOutsideRef.current) return
          const r = dialog.getBoundingClientRect()
          const releasedOutside =
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          pressedOutsideRef.current = false
          if (releasedOutside) {
            void closeProductModalWithCleanup()
          }
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] rounded-3xl border border-[#E8DECF] bg-white p-0 text-[#1C1917] shadow-2xl open:flex open:flex-col overflow-hidden"
      >
        <div className="sticky top-0 z-10 bg-white border-b border-[#E8DECF] px-6 py-4 flex items-center justify-between shrink-0">
          <h1
            id="product-modal-title"
            className="font-serif font-bold text-xl text-[#1C1917]"
          >
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <button
            type="button"
            onClick={() => void closeProductModalWithCleanup()}
            aria-label="Cerrar modal"
            className="p-2 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5EFE6] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveProduct} className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prod-nombre"
                className="block text-xs font-semibold text-[#1C1917] mb-1.5"
              >
                Nombre del producto
              </label>
              <input
                id="prod-nombre"
                type="text"
                required
                autoFocus
                value={prodNombre}
                onChange={(e) => setProdNombre(e.target.value)}
                placeholder="Ej: Álbum Coleccionable Mundial"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#E8DECF] rounded-xl focus:outline-none focus:border-[#A18417] focus:bg-white transition"
              />
            </div>

            <div>
              <label
                htmlFor="prod-categoria"
                className="block text-xs font-semibold text-[#1C1917] mb-1.5"
              >
                Categoría
              </label>
              <select
                id="prod-categoria"
                value={prodCategoriaId}
                onChange={(e) => setProdCategoriaId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#E8DECF] rounded-xl focus:outline-none focus:border-[#A18417] focus:bg-white transition cursor-pointer"
              >
                {initialCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="prod-descripcion"
              className="block text-xs font-semibold text-[#1C1917] mb-1.5"
            >
              Descripción
            </label>
            <textarea
              id="prod-descripcion"
              rows={3}
              value={prodDescripcion}
              onChange={(e) => setProdDescripcion(e.target.value)}
              placeholder="Detalles del diseño, papeles, terminaciones o medidas..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F0] border border-[#E8DECF] rounded-xl focus:outline-none focus:border-[#A18417] focus:bg-white transition"
            />
          </div>

          {/* Opciones específicas según categoría */}
          {isWineCategory && (
            <div className="p-4 rounded-2xl border border-[#E8DECF] bg-[#FAF7F0] space-y-3">
              <p className="text-xs font-semibold text-[#1C1917]">
                Opciones de visualización para Etiquetas de Vinos
              </p>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={mostrarEnEspiral}
                  onChange={(e) => setMostrarEnEspiral(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#DDC385] accent-[#A18417]"
                />
                <span className="text-xs text-[#1C1917] leading-snug">
                  <strong className="font-semibold">Mostrar en el espiral</strong>
                  <span className="block text-[11px] text-[#57534E]">
                    Suma la primera foto al espiral 3D del Hero en la página de inicio.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={mostrarEnGaleria}
                  onChange={(e) => setMostrarEnGaleria(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#DDC385] accent-[#A18417]"
                />
                <span className="text-xs text-[#1C1917] leading-snug">
                  <strong className="font-semibold">Mostrar en galería</strong>
                  <span className="block text-[11px] text-[#57534E]">
                    Muestra la primera imagen junto con su nombre y descripción en la galería de Etiquetas de Vinos.
                  </span>
                </span>
              </label>
            </div>
          )}

          {isAlbumCategory && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-[#E8DECF] bg-[#FAF7F0]">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={mostrarEnSeccion}
                    onChange={(e) => setMostrarEnSeccion(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#DDC385] accent-[#A18417]"
                  />
                  <span className="text-xs text-[#1C1917] leading-snug">
                    <strong className="font-semibold">Mostrar en sección</strong>
                    <span className="block text-[11px] text-[#57534E]">
                      Muestra el video presentación al inicio de la sección Álbumes Personalizados.
                    </span>
                  </span>
                </label>
              </div>

              {/* Input 1: Video Presentación */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#1C1917]">
                    Video presentación (inicio de Álbumes Personalizados)
                  </label>
                  <span className="text-[11px] text-[#57534E]">
                    MP4 o WebM (máx. 50 MB)
                  </span>
                </div>

                {presentationVideo ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-[#E8DECF] bg-[#FAF7F0]">
                    <div className="w-16 h-24 rounded-xl bg-[#F5EFE6] overflow-hidden shrink-0 border border-[#E8DECF]">
                      <video
                        src={presentationVideo.url}
                        muted
                        playsInline
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7EC] text-[#846C12] border border-[#E8D99E]">
                        <Video className="w-3 h-3" />
                        Video presentación
                      </span>
                      <p className="text-xs text-[#57534E] truncate">
                        Listo para mostrarse al inicio de la sección si activás el checkbox.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removePresentationVideo}
                      className="p-2 rounded-full text-[#78716C] hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      aria-label="Quitar video de presentación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-[#DDC385] hover:border-[#A18417] bg-[#FAF7F0] rounded-2xl cursor-pointer transition">
                    <Video className="w-5 h-5 text-[#A18417]" />
                    <span className="text-xs font-medium text-[#1C1917] text-center">
                      Hacé click para subir el video de presentación
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          void handlePresentationVideoSelected(file)
                          e.target.value = ''
                        }
                      }}
                    />
                  </label>
                )}

                {presentationUpload && (
                  <div className="p-3 rounded-xl border border-[#E8DECF] bg-[#FAF7F0] text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-[#1C1917]">
                        {presentationUpload.fileName}
                      </span>
                      {presentationUpload.error ? (
                        <button
                          type="button"
                          onClick={() => setPresentationUpload(null)}
                          className="text-red-700 font-medium cursor-pointer"
                        >
                          Cerrar
                        </button>
                      ) : (
                        <span className="text-[#57534E] tabular-nums">
                          {presentationUpload.progress}%
                        </span>
                      )}
                    </div>
                    {presentationUpload.error ? (
                      <p className="text-red-700">{presentationUpload.error}</p>
                    ) : (
                      <div className="w-full h-1.5 bg-[#E8DECF] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#A18417] transition-all duration-300"
                          style={{ width: `${presentationUpload.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Zona de Subida Directa a Storage (Galería Multimedia) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#1C1917]">
                {isAlbumCategory
                  ? 'Galería Multimedia (sección Proyectos, orden = 0 es Portada)'
                  : 'Galería Multimedia (orden = 0 es la Portada)'}
              </label>
              <span className="text-[11px] text-[#57534E]">
                JPG, PNG, WebP, MP4 o WebM (máx. 50 MB)
              </span>
            </div>

            <label
              onDragOver={(e) => {
                e.preventDefault()
                setIsDraggingFiles(true)
              }}
              onDragLeave={() => setIsDraggingFiles(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDraggingFiles(false)
                if (e.dataTransfer.files) {
                  void handleFilesSelected(e.dataTransfer.files)
                }
              }}
              className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-2xl cursor-pointer transition ${
                isDraggingFiles
                  ? 'border-[#A18417] bg-[#FAF7EC]'
                  : 'border-[#E8DECF] hover:border-[#DDC385] bg-[#FAF7F0]'
              }`}
            >
              <Upload className="w-6 h-6 text-[#A18417]" />
              <span className="text-xs font-medium text-[#1C1917] text-center">
                Arrastrá imágenes o videos acá, o hacé click para seleccionar
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    void handleFilesSelected(e.target.files)
                    e.target.value = ''
                  }
                }}
              />
            </label>

            {/* Barras de progreso de subida */}
            {uploads.length > 0 && (
              <div className="space-y-2">
                {uploads.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl border border-[#E8DECF] bg-[#FAF7F0] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-[#1C1917]">
                        {u.fileName}
                      </span>
                      {u.error ? (
                        <button
                          type="button"
                          onClick={() =>
                            setUploads((prev) =>
                              prev.filter((item) => item.id !== u.id)
                            )
                          }
                          className="text-red-700 font-medium cursor-pointer"
                        >
                          Cerrar
                        </button>
                      ) : (
                        <span className="text-[#57534E] tabular-nums">
                          {u.progress}%
                        </span>
                      )}
                    </div>
                    {u.error ? (
                      <p className="text-red-700">{u.error}</p>
                    ) : (
                      <div className="w-full h-1.5 bg-[#E8DECF] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#A18417] transition-all duration-300"
                          style={{ width: `${u.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Vista previa y ordenamiento */}
            {mediaDrafts.length > 0 && (
              <div className="space-y-2">
                {mediaDrafts.map((item, idx) => (
                  <div
                    key={`${item.url}-${idx}`}
                    draggable
                    onDragStart={() => setDraggedMediaIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedMediaIndex !== null) {
                        moveMediaItem(draggedMediaIndex, idx)
                        setDraggedMediaIndex(null)
                      }
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-2xl border border-[#E8DECF] bg-white"
                  >
                    <GripVertical className="w-4 h-4 text-[#A8A29E] shrink-0 cursor-grab" />

                    <div className="relative w-16 h-16 rounded-xl bg-[#F5EFE6] overflow-hidden shrink-0 border border-[#E8DECF]">
                      {item.tipo === 'VIDEO' ? (
                        <video
                          src={item.url}
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.alt_text || 'Preview'}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F5EFE6] text-[#5A6347]">
                          {item.tipo === 'VIDEO' ? (
                            <Video className="w-3 h-3" />
                          ) : (
                            <ImageIcon className="w-3 h-3" />
                          )}
                          {item.tipo}
                        </span>
                        {idx === 0 ? (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF7EC] text-[#846C12] border border-[#E8D99E]">
                            Portada (orden 0)
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#57534E]">
                            Orden {idx}
                          </span>
                        )}
                      </div>

                      <input
                        type="text"
                        value={item.alt_text || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setMediaDrafts((prev) =>
                            prev.map((m, i) =>
                              i === idx ? { ...m, alt_text: val } : m
                            )
                          )
                        }}
                        placeholder="Texto alternativo (alt)"
                        className="w-full px-2.5 py-1 text-xs bg-[#FAF7F0] border border-[#E8DECF] rounded-lg focus:outline-none focus:border-[#A18417]"
                      />
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveMediaItem(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg border border-[#E8DECF] text-[#57534E] hover:bg-[#F5EFE6] disabled:opacity-30 cursor-pointer"
                        aria-label="Subir orden"
                        title="Subir orden"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMediaItem(idx, idx + 1)}
                        disabled={idx === mediaDrafts.length - 1}
                        className="p-1.5 rounded-lg border border-[#E8DECF] text-[#57534E] hover:bg-[#F5EFE6] disabled:opacity-30 cursor-pointer"
                        aria-label="Bajar orden"
                        title="Bajar orden"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeMediaDraft(idx)}
                        className="p-1.5 rounded-lg text-[#78716C] hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        aria-label="Quitar archivo"
                        title="Quitar archivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#E8DECF] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => void closeProductModalWithCleanup()}
              className="px-4 py-2.5 rounded-full border border-[#E8DECF] text-sm font-medium text-[#57534E] hover:bg-[#F5EFE6] hover:text-[#1C1917] transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isPending ||
                activeUploadsCount > 0 ||
                Boolean(presentationUpload && !presentationUpload.error) ||
                (mediaDrafts.length === 0 && !(isAlbumCategory && presentationVideo))
              }
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] text-sm font-medium transition disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  )
}
