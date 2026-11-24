'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  ArrowDown,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import DepthCarousel, { DepthCarouselItem } from '@/components/ui/depth-carousel';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export interface WineBottleItem {
  id: string;
  image: string;
  alt: string;
  title: string;
  variety?: string;
  description: string;
  whatsappMessage: string;
}

export const WINE_BOTTLES: WineBottleItem[] = [
  {
    id: 'botella-1',
    image: '/botella1.jpg',
    alt: 'Botella de autor 1 - Malbec Roble Reserva',
    title: 'Reserva de Autor • Alma de Roble',
    variety: 'Vino Tinto • Malbec Roble 2024',
    description:
      'Diseño integral de etiqueta con ilustración botánica grabada en oro mate sobre papel martillado texturado. Su tipografía de autor y acabados con stamping en caliente evocan distinción artesanal y carácter único.',
    whatsappMessage:
      '¡Hola! Vi el diseño de la Botella 1 (Alma de Roble • Malbec) en la galería de etiquetas de vinos de SicaEstudio y quisiera consultar por un presupuesto personalizado.',
  },
  {
    id: 'botella-2',
    image: '/botella2.jpg',
    alt: 'Botella de autor 2 - Chenin Blanco Dulce',
    title: 'Brisa Dorada • Chenin Blanco Dulce',
    variety: 'Vino Blanco • Cosecha Tardía',
    description:
      'Etiqueta panorámica diseñada para abrazar la luminosidad y el color dorado natural del vino blanco. Destaca por sus acabados en stamping plata sobre papel satinado perlado y cápsula metálica a tono.',
    whatsappMessage:
      '¡Hola! Me interesó el diseño de la Botella 2 (Brisa Dorada • Chenin Blanco) de la galería de etiquetas. ¿Podrían brindarme información para encargar?',
  },
  {
    id: 'botella-3',
    image: '/botella3.jpg',
    alt: 'Botella de autor 3 - Gran Blend Legado',
    title: 'Legado Familiar • Gran Blend',
    variety: 'Blend de Autor • Cabernet - Syrah',
    description:
      'Diseño solemne y emotivo con escudo y monograma de linaje familiar. Impreso con técnicas de bajorrelieve profundo sobre papel verjurado en tono crema antiguo con simulación de lacre artesanal.',
    whatsappMessage:
      '¡Hola! Me gustaría cotizar un diseño personalizado como el de la Botella 3 (Legado Familiar) para un festejo de cumpleaños familiar.',
  },
  {
    id: 'botella-4',
    image: '/botella4.jpg',
    alt: 'Botella de autor 4 - Edición Noir Noche Negra',
    title: 'Edición Mística • Noche Negra',
    variety: 'Vino Tinto • Petit Verdot Estibado',
    description:
      'Estética audaz y temperamental sobre botella de vidrio oscuro casi reflectivo. Etiqueta con corazón ardiente entre cadenas, tipografía dorada en alta definición y contraste dramático entre sombras y reflejos.',
    whatsappMessage:
      '¡Hola! Quisiera encargar un diseño para festejo con el estilo de la Botella 4 (Noche Negra • Vino Tinto) de SicaEstudio.',
  },
  {
    id: 'botella-5',
    image: '/botella5.jpg',
    alt: 'Botella de autor 5 - Destello Rosé Espumante',
    title: 'Destello Rosé • Cuvée Celebración',
    variety: 'Espumante / Rosé Brut Nature',
    description:
      'Fusión de vanguardia y elegancia con película holográfica reflectiva y relieve táctil. Diseñada para copas alzadas, eventos memorables y brindis que merecen quedar inmortalizados.',
    whatsappMessage:
      '¡Hola! Me encantó la propuesta de la Botella 5 (Destello Rosé / Espumante) para un brindis especial. ¿Cómo es el proceso para encargar el diseño?',
  },
];

const CAROUSEL_ITEMS: DepthCarouselItem[] = WINE_BOTTLES.map((bottle) => ({
  image: bottle.image,
  alt: bottle.alt,
}));

export default function WineGalleryCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Estados interactivos para el zoom y paneo dentro del Lightbox
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ startX: 0, startY: 0, initialPanX: 0, initialPanY: 0 });
  const movedDistanceRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLargeDesktop, setIsLargeDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsLargeDesktop(window.innerWidth >= 1280);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardWidth = isMobile ? 185 : isLargeDesktop ? 350 : 315;
  const cardHeight = isMobile ? 265 : isLargeDesktop ? 515 : 465;

  const currentBottle = WINE_BOTTLES[activeIndex] || WINE_BOTTLES[0];
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    currentBottle.whatsappMessage
  )}`;

  const resetZoom = useCallback(() => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setIsPanning(false);
  }, []);

  // Cambiar imagen dentro del Lightbox
  const handleSelectImage = useCallback((idx: number) => {
    setActiveIndex(idx);
    const item = CAROUSEL_ITEMS[idx];
    setLightboxImage(typeof item === 'string' ? item : item.image);
    resetZoom();
  }, [resetZoom]);

  // Bloquear scroll de la página cuando la imagen grande está abierta
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      resetZoom();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxImage, resetZoom]);

  // Soporte de teclado (Escape para zoom / cerrar, flechas para navegar en grande)
  useEffect(() => {
    if (!lightboxImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomScale > 1) {
          resetZoom();
        } else {
          setLightboxImage(null);
        }
      } else if (e.key === 'ArrowLeft') {
        const newIdx = (activeIndex - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length;
        handleSelectImage(newIdx);
      } else if (e.key === 'ArrowRight') {
        const newIdx = (activeIndex + 1) % CAROUSEL_ITEMS.length;
        handleSelectImage(newIdx);
      } else if (e.key === '+' || e.key === '=') {
        setZoomScale((prev) => Math.min(prev + 0.4, 3.5));
      } else if (e.key === '-') {
        setZoomScale((prev) => {
          const next = Math.max(1, prev - 0.4);
          if (next === 1) setPanPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0') {
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, activeIndex, zoomScale, resetZoom, handleSelectImage]);

  // Click sobre la imagen en grande para alternar zoom
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Si hubo arrastre significativo, no alternar zoom
    if (movedDistanceRef.current > 6) return;

    if (zoomScale === 1) {
      setZoomScale(2.2);
    } else {
      resetZoom();
    }
  };

  // Zoom interactivo con la rueda del mouse dentro del Lightbox
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.35 : -0.35;
    setZoomScale((prev) => {
      const next = Math.min(Math.max(1, prev + factor), 3.5);
      if (next === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return Number(next.toFixed(2));
    });
  };

  // Paneo con puntero / touch cuando zoomScale > 1
  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoomScale <= 1) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    movedDistanceRef.current = 0;
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: panPosition.x,
      initialPanY: panPosition.y,
    };
    setIsPanning(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning || zoomScale <= 1) return;
    e.stopPropagation();
    const dx = e.clientX - panStartRef.current.startX;
    const dy = e.clientY - panStartRef.current.startY;
    movedDistanceRef.current += Math.hypot(dx, dy);

    // Límites de paneo calculados según el factor de zoom
    const maxPanX = (zoomScale - 1) * 320;
    const maxPanY = (zoomScale - 1) * 380;
    const newX = Math.min(Math.max(-maxPanX, panStartRef.current.initialPanX + dx), maxPanX);
    const newY = Math.min(Math.max(-maxPanY, panStartRef.current.initialPanY + dy), maxPanY);

    setPanPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      e.stopPropagation();
      setIsPanning(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch { }
    }
  };

  return (
    <>
      <section
        id="galeria"
        aria-label="Galería interactiva de botellas y etiquetas de autor"
        className="relative w-full min-h-[100svh] lg:min-h-[100dvh] flex items-center justify-center pt-[88px] sm:pt-28 lg:pt-36 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-8 lg:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#FAF7F0] via-[#FAF7F0] to-[#F5EFE6]/40 scroll-mt-36"
      >
        {/* Resplandor decorativo de fondo */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#F0D79E]/25 via-[#F5EFE6]/40 to-white/70 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* CONTENEDOR CENTRAL: EQUILIBRADO EN MOBILE (Header -> Foto -> Texto & CTAs) Y 2 COLUMNAS EN DESKTOP */}
        <div className="max-w-7xl w-full mx-auto py-0 lg:py-4 lg:translate-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-14 items-center">

            {/* MOBILE TOP (< lg): Volver + Título de la etiqueta arriba para que la fotografía lidere el centro */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="lg:hidden flex flex-col space-y-2 order-1 min-w-0"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] active:text-[#1C1917] transition w-fit group min-h-[32px] select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Volver a la Vidriera Principal
              </Link>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`mobile-header-${currentBottle.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.32, ease: EASE_OUT }}
                  className="space-y-0.5"
                >
                  <h1 className="font-serif text-[1.55rem] sm:text-3xl font-bold text-[#1C1917] tracking-tight leading-[1.15] [text-wrap:balance]">
                    {currentBottle.title}
                  </h1>
                  {currentBottle.variety && (
                    <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#A18417]">
                      {currentBottle.variety}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* DESKTOP LEFT (lg+): Columna izquierda íntegra sin cambios */}
            <motion.div
              initial={{ opacity: 0, x: -45 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: EASE_OUT }}
              className="hidden lg:flex lg:col-span-5 flex-col justify-center order-1 min-w-0 lg:-translate-y-7 xl:-translate-y-9"
            >
              {/* Volver a la vidriera - Estático (no se re-anima ni parpadea al cambiar botella) */}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition w-fit group mb-5 select-none"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Volver a la Vidriera Principal
              </Link>

              {/* Información dinámica de la botella (Animada con Framer Motion) */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentBottle.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{
                    duration: 0.38,
                    ease: EASE_OUT,
                  }}
                  className="space-y-5 text-left"
                >
                  {/* Eyebrow de categoría y título de la botella */}
                  <div className="space-y-1.5">
                    <span className="text-sm font-semibold tracking-widest uppercase text-[#846C12]">
                      Colección de Etiquetas de Autor
                    </span>
                    <h1 className="font-serif text-4xl xl:text-5xl font-bold text-[#1C1917] tracking-tight leading-tight [text-wrap:balance]">
                      {currentBottle.title}
                    </h1>
                    {currentBottle.variety && (
                      <p className="text-sm font-semibold uppercase tracking-wider text-[#A18417]">
                        {currentBottle.variety}
                      </p>
                    )}
                  </div>

                  {/* Descripción de autor */}
                  <p className="text-[#57534E] text-lg leading-relaxed [text-wrap:pretty] max-w-xl">
                    {currentBottle.description}
                  </p>

                  {/* Acciones: Consultar por WhatsApp y Bajar al Modelo 3D */}
                  <div className="flex items-center gap-3.5 flex-wrap pt-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1C1917] hover:bg-[#292524] text-white font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] min-h-[44px]"
                    >
                      <MessageCircle className="w-4 h-4 text-[#DDC385]" />
                      <span>Consultar por este diseño</span>
                    </a>

                    <a
                      href="#vista-3d"
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-full border border-[#E8DECF] bg-white/80 hover:bg-[#F5EFE6] text-[#57534E] hover:text-[#1C1917] text-sm font-medium transition-all duration-200 shadow-2xs min-h-[44px]"
                      title="Bajar al Visualizador 3D"
                    >
                      <span>Visualizador 3D</span>
                      <ArrowDown className="w-3.5 h-3.5 text-[#A18417]" />
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* CENTRO EN MOBILE / DERECHA EN DESKTOP: DEPTH CAROUSEL (ReactBits) */}
            <motion.div
              initial={{ opacity: 0, x: 70, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.85, ease: EASE_OUT }}
              className="lg:col-span-7 flex flex-col items-center justify-center relative w-full h-[315px] sm:h-[360px] lg:h-[620px] xl:h-[660px] max-h-[700px] min-h-[300px] lg:min-h-[480px] order-2 lg:order-2"
            >
              <DepthCarousel
                items={CAROUSEL_ITEMS}
                activeIndex={activeIndex}
                onChange={(idx) => setActiveIndex(idx)}
                onItemClick={(_, item) => {
                  setLightboxImage(item.image);
                  resetZoom();
                }}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                radius={24}
                tint="rgba(28, 25, 23, 0.45)"
                depth={isMobile ? 110 : 200}
                spread={isMobile ? 48 : 100}
                tilt={16}
                tiltDirection="right"
                perspective={1300}
                visibleCards={3}
                controlsPosition="bottom"
                showControls={true}
                showIndicators={true}
                enableWheel={false}
                className="h-full w-full"
              />
            </motion.div>

            {/* MOBILE BOTTOM (< lg): Descripción equilibrada + Acciones en zona del pulgar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.65, ease: EASE_OUT }}
              className="lg:hidden flex flex-col space-y-3.5 order-3 min-w-0 pt-1"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`mobile-desc-${currentBottle.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="text-[#57534E] text-[13px] sm:text-sm leading-relaxed line-clamp-3 [text-wrap:pretty]"
                >
                  {currentBottle.description}
                </motion.p>
              </AnimatePresence>

              <div className="flex items-center gap-2.5 pt-0.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#1C1917] hover:bg-[#292524] text-white font-medium text-xs sm:text-sm shadow-md transition-all duration-150 active:scale-[0.97] min-h-[44px] whitespace-nowrap select-none"
                >
                  <MessageCircle className="w-4 h-4 text-[#DDC385] shrink-0" />
                  <span>Consultar diseño</span>
                </a>

                <a
                  href="#vista-3d"
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full border border-[#E8DECF] bg-white/85 hover:bg-[#F5EFE6] text-[#1C1917] text-xs sm:text-sm font-medium transition-all duration-150 active:scale-[0.97] shadow-2xs min-h-[44px] whitespace-nowrap select-none"
                  title="Bajar al Visualizador 3D"
                >
                  <span>Vista 3D</span>
                  <ArrowDown className="w-3.5 h-3.5 text-[#A18417]" />
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* MODAL / LIGHTBOX EN GRANDE (SOLAMENTE LA IMAGEN, CON ZOOM INTERACTIVO Y SIN INFORMACIÓN) */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 backdrop-blur-md p-4 sm:p-6 md:p-10 cursor-zoom-out"
            onClick={() => setLightboxImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Vista ampliada de la botella de autor"
          >
            {/* Barra flotante superior de controles de zoom */}
            <div
              className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 text-white shadow-lg pointer-events-auto select-none border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setZoomScale((prev) => {
                    const next = Math.max(1, prev - 0.4);
                    if (next === 1) setPanPosition({ x: 0, y: 0 });
                    return Number(next.toFixed(2));
                  });
                }}
                disabled={zoomScale <= 1}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 disabled:opacity-35 disabled:hover:bg-transparent transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                title="Alejar zoom (-)"
                aria-label="Alejar zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={resetZoom}
                className="px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-white/20 transition active:scale-95 cursor-pointer tracking-wider"
                title="Restablecer tamaño (0)"
              >
                {Math.round(zoomScale * 100)}%
              </button>

              <button
                type="button"
                onClick={() => setZoomScale((prev) => Number(Math.min(prev + 0.4, 3.5).toFixed(2)))}
                disabled={zoomScale >= 3.5}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 disabled:opacity-35 disabled:hover:bg-transparent transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                title="Acercar zoom (+)"
                aria-label="Acercar zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {zoomScale > 1 && (
                <button
                  type="button"
                  onClick={resetZoom}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition active:scale-95 cursor-pointer text-[#F0D79E]"
                  title="Restablecer vista a 100%"
                  aria-label="Restablecer vista"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Botón flotante para cerrar en la esquina superior derecha */}
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xs shadow-lg"
              aria-label="Cerrar vista grande"
              title="Cerrar (Esc)"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Flechas de navegación para alternar de imagen en tamaño grande */}
            {CAROUSEL_ITEMS.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIdx = (activeIndex - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length;
                    handleSelectImage(newIdx);
                  }}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xs shadow-lg"
                  aria-label="Imagen anterior"
                  title="Imagen anterior (←)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIdx = (activeIndex + 1) % CAROUSEL_ITEMS.length;
                    handleSelectImage(newIdx);
                  }}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xs shadow-lg"
                  aria-label="Siguiente imagen"
                  title="Siguiente imagen (→)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Contenedor de la foto en grande (SOLAMENTE LA IMAGEN, SIN INFORMACIÓN) con ZOOM y PAN */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="relative max-w-full max-h-[92vh] flex items-center justify-center select-none overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onWheel={handleWheel}
            >
              <img
                src={lightboxImage}
                alt="Botella de autor ampliada"
                style={{
                  transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
                  transformOrigin: 'center center',
                  transition: isPanning ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={handleImageClick}
                className={`max-h-[88vh] max-w-[90vw] w-auto h-auto object-contain rounded-2xl sm:rounded-3xl shadow-2xl drop-shadow-2xl select-none touch-none ${zoomScale > 1
                  ? isPanning
                    ? 'cursor-grabbing'
                    : 'cursor-grab'
                  : 'cursor-zoom-in'
                  }`}
                draggable={false}
              />
            </motion.div>

            {/* Guía sutil inferior */}
            <div className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-none select-none z-10">
              <span className="px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-xs text-[11px] text-white/70 tracking-wide">
                {zoomScale > 1
                  ? 'Arrastra para explorar detalles • Clic para alejar'
                  : 'Haz clic o usa la rueda para zoom'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
