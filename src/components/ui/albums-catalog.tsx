'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import type { Product } from '@/types';
import { FALLBACK_ALBUM_CATALOG } from '@/lib/data/catalog-defaults';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000';
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function buildWhatsAppUrl(productTitle: string, customMessage?: string | null) {
  const text =
    customMessage ||
    `¡Hola! Me interesa encargar el diseño de: "${productTitle}". ¿Me podrían asesorar?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

interface AlbumsCatalogProps {
  products: Product[];
}

export default function AlbumsCatalog({ products }: AlbumsCatalogProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const realProducts = products.filter((p) => !p.id.startsWith('demo-'));
  const items = realProducts.length > 0 ? realProducts : FALLBACK_ALBUM_CATALOG;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {items.map((product, idx) => (
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
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-6 flex flex-col flex-1 justify-between gap-5">
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg text-[#1C1917] group-hover:text-[#A18417] transition-colors leading-snug">
                  {product.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              </div>

              <a
                href={buildWhatsAppUrl(product.title, product.whatsapp_custom_message)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] font-medium text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow min-h-[44px] select-none"
              >
                <MessageCircle className="w-4 h-4 text-[#DDC385]" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
