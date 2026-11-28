'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import type { ProductoConMedia } from '@/types';
import { buildWhatsAppLink } from '@/lib/whatsapp';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function buildWhatsAppUrl(productTitle: string) {
  return buildWhatsAppLink(
    `¡Hola SicaEstudio! Me interesa encargar el álbum "${productTitle}". ¿Me podrían asesorar con los detalles y plazos?`
  );
}

interface AlbumsCatalogProps {
  products: ProductoConMedia[];
}

export default function AlbumsCatalog({ products }: AlbumsCatalogProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());

  return (
    <section
      id="catalogo-albumes"
      aria-label="Más trabajos de Álbumes"
      className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-20 border-t border-[#E8DECF]/70 space-y-8 sm:space-y-10"
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="space-y-1.5"
      >
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
          Más trabajos de Álbumes
        </h2>
        <p className="text-xs sm:text-sm text-[#57534E]">
          Explorá nuestro catálogo de ediciones personalizadas disponibles para encargar
        </p>
      </motion.div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E8DECF] p-12 text-center text-[#78716C] space-y-1.5">
          <p className="font-semibold text-sm text-[#1C1917]">
            Aún no hay álbumes cargados en el catálogo
          </p>
          <p className="text-xs">
            Cargá nuevos álbumes desde el panel administrador para mostrarlos acá.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product, idx) => {
            const cover = product.media[0];
            const isVideo = cover?.tipo === 'VIDEO';

            return (
              <motion.article
                key={product.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  delay: prefersReducedMotion ? 0 : Math.min(idx * 0.08, 0.24),
                  duration: 0.55,
                  ease: EASE_OUT,
                }}
                className="group flex flex-col rounded-2xl border border-[#E8DECF] overflow-hidden bg-white shadow-sm hover:shadow-xl hover:border-[#DDC385] transition-all duration-300"
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
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )
                  ) : null}
                  {product.media.length > 1 && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#1C1917]/80 text-[#FAF7F0] text-[10px] font-medium backdrop-blur-sm">
                      +{product.media.length - 1} archivos
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-lg text-[#1C1917] group-hover:text-[#A18417] transition-colors leading-snug">
                      {product.nombre}
                    </h3>
                    {product.descripcion && (
                      <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed line-clamp-3">
                        {product.descripcion}
                      </p>
                    )}
                  </div>

                  <a
                    href={buildWhatsAppUrl(product.nombre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] font-medium text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow min-h-[44px] select-none"
                  >
                    <MessageCircle className="w-4 h-4 text-[#DDC385]" />
                    <span>Consultar por WhatsApp</span>
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
