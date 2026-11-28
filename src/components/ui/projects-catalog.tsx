'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpAZ,
  ArrowDownZA,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Search,
  X,
} from 'lucide-react';
import type { Categoria, ProductoConMedia } from '@/types';
import { buildWhatsAppLink } from '@/lib/whatsapp';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type SortOrder = 'default' | 'asc' | 'desc';

function buildWhatsAppUrl(productTitle: string, categoryName?: string | null) {
  const text = categoryName
    ? `¡Hola SicaEstudio! Vi el proyecto "${productTitle}" (${categoryName}) y quisiera consultar para encargar un diseño similar.`
    : `¡Hola SicaEstudio! Vi el proyecto "${productTitle}" y quisiera consultar para encargarlo.`;
  return buildWhatsAppLink(text);
}

interface ProjectsCatalogProps {
  label: string;
  description: string;
  products: ProductoConMedia[];
  categories?: Categoria[];
}

export default function ProjectsCatalog({
  label,
  description,
  products,
  categories = [],
}: ProjectsCatalogProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [selectedProduct, setSelectedProduct] = useState<ProductoConMedia | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    if (!selectedProduct) return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyTouchAction = document.body.style.touchAction;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.touchAction = prevBodyTouchAction;
    };
  }, [selectedProduct]);

  const openProductModal = (product: ProductoConMedia) => {
    setActiveMediaIndex(0);
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = products.filter((p) => {
      const matchesName = !q || p.nombre.toLowerCase().includes(q);
      const matchesCat =
        selectedCategory === 'all' || String(p.categoria_id) === selectedCategory;
      return matchesName && matchesCat;
    });

    if (sortOrder === 'asc') {
      return [...filtered].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      );
    }

    if (sortOrder === 'desc') {
      return [...filtered].sort((a, b) =>
        b.nombre.localeCompare(a.nombre, 'es', { sensitivity: 'base' })
      );
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, sortOrder]);

  const toggleSort = (order: 'asc' | 'desc') => {
    setSortOrder((prev) => (prev === order ? 'default' : order));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-40 pb-20 space-y-8 sm:space-y-10">
      <div
        inert={Boolean(selectedProduct)}
        className={`space-y-8 sm:space-y-10 ${selectedProduct ? 'pointer-events-none select-none' : ''}`}
      >
      {/* Encabezado animado */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE_OUT }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Volver a la Vidriera Principal
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight">
          {label}
        </h1>
        <p className="text-[#57534E] text-sm mt-2 max-w-2xl leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Barra de búsqueda y filtros por nombre (entre título y cards) */}
      {products.length > 0 && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: EASE_OUT }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-[#E8DECF] bg-white/80 backdrop-blur-sm shadow-2xs"
        >
          {/* Buscador por nombre */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre..."
              aria-label="Buscar proyectos por nombre"
              className="w-full pl-10 pr-9 py-2.5 text-sm text-[#1C1917] placeholder:text-[#78716C]/80 bg-[#FAF7F0] border border-[#E8DECF] rounded-full focus:outline-none focus:border-[#A18417] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#E8DECF]/50 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros de categoría, ordenamiento ascendente / descendente + contador */}
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filtrar por categoría"
                className="px-3.5 py-2 rounded-full text-xs font-medium text-[#1C1917] bg-[#FAF7F0] border border-[#E8DECF] hover:border-[#DDC385] focus:outline-none focus:border-[#A18417] transition cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            )}

            <span className="text-xs text-[#78716C] mr-1 tabular-nums">
              {filteredAndSorted.length}{' '}
              {filteredAndSorted.length === 1 ? 'resultado' : 'resultados'}
            </span>

            <div className="inline-flex items-center gap-1.5" role="group" aria-label="Ordenar por nombre">
              <button
                type="button"
                onClick={() => toggleSort('asc')}
                aria-pressed={sortOrder === 'asc'}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 cursor-pointer select-none border ${
                  sortOrder === 'asc'
                    ? 'bg-[#1C1917] text-[#FAF7F0] border-[#1C1917] shadow-xs'
                    : 'bg-[#FAF7F0] text-[#57534E] border-[#E8DECF] hover:border-[#DDC385] hover:text-[#1C1917]'
                }`}
              >
                <ArrowUpAZ className="w-3.5 h-3.5 text-[#A18417]" />
                <span>A–Z</span>
              </button>

              <button
                type="button"
                onClick={() => toggleSort('desc')}
                aria-pressed={sortOrder === 'desc'}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 cursor-pointer select-none border ${
                  sortOrder === 'desc'
                    ? 'bg-[#1C1917] text-[#FAF7F0] border-[#1C1917] shadow-xs'
                    : 'bg-[#FAF7F0] text-[#57534E] border-[#E8DECF] hover:border-[#DDC385] hover:text-[#1C1917]'
                }`}
              >
                <ArrowDownZA className="w-3.5 h-3.5 text-[#A18417]" />
                <span>Z–A</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grilla de Cards */}
      <div className="space-y-6">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E8DECF] p-16 text-center text-[#78716C] space-y-2">
            <p className="font-semibold text-[#1C1917]">
              Aún no hay trabajos en esta categoría
            </p>
            <p className="text-xs">¡Pronto subiremos nuevos proyectos a esta sección!</p>
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-[#E8DECF] bg-white/60 p-12 text-center text-[#78716C] space-y-3"
          >
            <p className="font-serif font-semibold text-base text-[#1C1917]">
              No encontramos proyectos con esos filtros
            </p>
            <p className="text-xs">Probá con otro nombre o cambiá la categoría seleccionada.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSortOrder('default');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1917] text-[#FAF7F0] text-xs font-medium hover:bg-[#292524] transition cursor-pointer"
            >
              Mostrar todos
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout={!prefersReducedMotion}
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredAndSorted.map((product, idx) => {
                const cover = product.media[0];
                const isVideo = cover?.tipo === 'VIDEO';

                return (
                  <motion.article
                    key={product.id}
                    layout={!prefersReducedMotion}
                    onClick={() => openProductModal(product)}
                    initial={
                      prefersReducedMotion
                        ? false
                        : { opacity: 0, y: 20, scale: 0.98 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      prefersReducedMotion
                        ? undefined
                        : { opacity: 0, scale: 0.96 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: prefersReducedMotion ? 0 : Math.min(idx * 0.04, 0.2),
                      ease: EASE_OUT,
                    }}
                    className="group flex flex-col rounded-xl sm:rounded-2xl border border-[#E8DECF] overflow-hidden bg-white shadow-sm hover:shadow-xl hover:border-[#DDC385] transition-shadow duration-300 cursor-pointer"
                  >
                    <div className="relative aspect-square w-full bg-[#F5EFE6] overflow-hidden">
                      {cover ? (
                        isVideo ? (
                          <video
                            src={cover.url}
                            muted
                            loop
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <Image
                            src={cover.url}
                            alt={cover.alt_text || product.nombre}
                            fill
                            sizes="(max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )
                      ) : null}

                      {product.categorias?.nombre && (
                        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#FAF7F0]/90 text-[#1C1917] text-[9px] sm:text-[10px] font-semibold tracking-wide backdrop-blur-sm border border-[#E8DECF]/80 max-w-[calc(100%-1rem)] truncate">
                          {product.categorias.nombre}
                        </span>
                      )}

                      {product.media.length > 1 && (
                        <span className="absolute bottom-2 right-2 sm:bottom-auto sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#1C1917]/80 text-[#FAF7F0] text-[9px] sm:text-[10px] font-medium backdrop-blur-sm">
                          +{product.media.length - 1}
                          <span className="hidden sm:inline"> archivos</span>
                        </span>
                      )}
                    </div>

                    <div className="p-3 sm:p-6 flex flex-col flex-1 justify-between gap-3 sm:gap-5">
                      <div className="space-y-1 sm:space-y-2">
                        <h3 className="font-serif font-bold text-sm sm:text-lg text-[#1C1917] group-hover:text-[#A18417] transition-colors leading-snug line-clamp-2">
                          {product.nombre}
                        </h3>
                        {product.descripcion && (
                          <p className="text-[11px] sm:text-xs text-[#57534E] leading-relaxed line-clamp-2 sm:line-clamp-3">
                            {product.descripcion}
                          </p>
                        )}
                      </div>

                      <a
                        href={buildWhatsAppUrl(product.nombre, product.categorias?.nombre)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 w-full py-2 px-2.5 sm:py-2.5 sm:px-4 rounded-full bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] font-medium text-[11px] sm:text-sm transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow"
                      >
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DDC385] shrink-0" />
                        <span className="sm:hidden">Consultar</span>
                        <span className="hidden sm:inline">Consultar por WhatsApp</span>
                      </a>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      </div>

      {/* Modal de detalle completo del producto (Portal z-[9999] bloqueando todo el fondo) */}
      {selectedProduct &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-detail-title"
            onClick={(e) => {
              e.stopPropagation();
              closeProductModal();
            }}
            onWheel={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#1C1917]/60 backdrop-blur-sm overscroll-contain touch-none"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90svh] rounded-3xl border border-[#E8DECF] bg-white text-[#1C1917] shadow-2xl overflow-hidden flex flex-col touch-auto"
            >
              {(() => {
                const mediaList = selectedProduct.media;
                const currentMedia = mediaList[activeMediaIndex] || mediaList[0];

                return (
                  <div className="flex flex-col md:grid md:grid-cols-12 max-h-[90svh] overflow-y-auto overscroll-contain">
                    {/* Galería multimedia del producto */}
                    <div className="md:col-span-6 bg-[#F5EFE6] relative flex flex-col">
                      <div className="relative aspect-square w-full overflow-hidden">
                        {currentMedia ? (
                          currentMedia.tipo === 'VIDEO' ? (
                            <video
                              key={currentMedia.url}
                              src={currentMedia.url}
                              controls
                              autoPlay
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={currentMedia.url}
                              alt={currentMedia.alt_text || selectedProduct.nombre}
                              fill
                              sizes="(max-width: 768px) 100vw, 384px"
                              className="object-cover"
                            />
                          )
                        ) : null}

                        {mediaList.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMediaIndex(
                                  (prev) => (prev - 1 + mediaList.length) % mediaList.length
                                )
                              }
                              aria-label="Archivo anterior"
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#1C1917]/75 hover:bg-[#1C1917] text-[#FAF7F0] flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMediaIndex((prev) => (prev + 1) % mediaList.length)
                              }
                              aria-label="Siguiente archivo"
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#1C1917]/75 hover:bg-[#1C1917] text-[#FAF7F0] flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Miniaturas si tiene más de 1 archivo */}
                      {mediaList.length > 1 && (
                        <div className="flex items-center gap-2 p-3 overflow-x-auto bg-[#FAF7F0] border-t border-[#E8DECF]/70">
                          {mediaList.map((m, idx) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setActiveMediaIndex(idx)}
                              aria-label={`Ver archivo ${idx + 1}`}
                              className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                                activeMediaIndex === idx
                                  ? 'border-[#A18417] scale-105'
                                  : 'border-transparent opacity-65 hover:opacity-100'
                              }`}
                            >
                              {m.tipo === 'VIDEO' ? (
                                <video src={m.url} muted playsInline className="w-full h-full object-cover" />
                              ) : (
                                <img
                                  src={m.url}
                                  alt={m.alt_text || selectedProduct.nombre}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Información completa del producto */}
                    <div className="md:col-span-6 p-5 sm:p-7 flex flex-col justify-between gap-6 relative">
                      <button
                        type="button"
                        onClick={closeProductModal}
                        aria-label="Cerrar detalle"
                        className="absolute top-4 right-4 p-2 rounded-full bg-[#FAF7F0] border border-[#E8DECF] text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5EFE6] transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="space-y-3 pr-8">
                        {selectedProduct.categorias?.nombre && (
                          <span className="inline-block px-3 py-1 rounded-full bg-[#F5EFE6] text-[#5A6347] text-xs font-semibold border border-[#E8DECF]">
                            {selectedProduct.categorias.nombre}
                          </span>
                        )}

                        <h1
                          id="project-detail-title"
                          className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight leading-snug"
                        >
                          {selectedProduct.nombre}
                        </h1>

                        {selectedProduct.descripcion && (
                          <p className="text-sm text-[#57534E] leading-relaxed whitespace-pre-line">
                            {selectedProduct.descripcion}
                          </p>
                        )}
                      </div>

                      <a
                        href={buildWhatsAppUrl(selectedProduct.nombre, selectedProduct.categorias?.nombre)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] font-medium text-sm transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg"
                      >
                        <MessageCircle className="w-4 h-4 text-[#DDC385]" />
                        <span>Consultar por WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
