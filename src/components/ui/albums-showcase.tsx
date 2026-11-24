'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  MessageCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000';
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

interface AlbumEdition {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  videoSrc: string;
  whatsappMessage: string;
}

const ALBUM_EDITIONS: AlbumEdition[] = [
  {
    id: 'album-1',
    label: 'Edición 01',
    title: 'Álbum Coleccionable • Clásico',
    subtitle: 'Tapa personalizada · Figuritas autoadhesivas',
    description:
      'Recorré página por página un álbum pensado para atesorar momentos inolvidables: impresión de alta definición, papel de alto gramaje y figuritas listas para pegar.',
    videoSrc: '/videoAlbum.mp4',
    whatsappMessage:
      '¡Hola! Vi el primer video del Álbum de Figuritas Personalizado (Edición 01) en SicaEstudio y quisiera consultar para encargar uno.',
  },
  {
    id: 'album-2',
    label: 'Edición 02',
    title: 'Álbum Temático • Diseño a Medida',
    subtitle: 'Identidad 100% propia · Sobres sellados',
    description:
      'Cada cubierta, página interior y sobre coleccionable se diseña desde cero según la historia, festejo o equipo que quieras celebrar.',
    videoSrc: '/VideoAlbum2.mp4',
    whatsappMessage:
      '¡Hola! Vi el segundo video del Álbum de Figuritas Personalizado (Edición 02) en SicaEstudio y me gustaría consultar por un diseño a medida.',
  },
];

interface VideoFrameProps {
  edition: AlbumEdition;
  isActive: boolean;
  onActivate?: () => void;
  onExpand?: () => void;
  reducedMotion: boolean;
  priorityLoad?: boolean;
}

function AlbumVideoFrame({
  edition,
  isActive,
  onActivate,
  onExpand,
  reducedMotion,
  priorityLoad = false,
}: VideoFrameProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  // Sincronizar reproducción según estado activo y prefers-reduced-motion
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !reducedMotion) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, reducedMotion]);

  const handleTogglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const video = videoRef.current;
      if (!video) return;

      if (!isActive && onActivate) {
        onActivate();
        return;
      }

      if (video.paused) {
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        video.pause();
        setIsPlaying(false);
      }
    },
    [isActive, onActivate]
  );

  const handleToggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  }, []);

  return (
    <motion.div
      layout
      animate={{
        scale: isActive ? 1 : 0.92,
        opacity: isActive ? 1 : 0.72,
      }}
      whileHover={!isActive ? { scale: 0.95, opacity: 0.92 } : undefined}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      onClick={isActive ? onExpand : onActivate}
      className={`relative w-full aspect-[9/16] rounded-3xl overflow-hidden bg-[#1C1917] transition-shadow duration-300 select-none ${
        isActive
          ? 'border-2 border-[#DDC385] shadow-[0_24px_60px_-15px_rgba(28,25,23,0.28)] cursor-zoom-in'
          : 'border border-[#E8DECF] shadow-md cursor-pointer'
      }`}
    >
      <video
        ref={videoRef}
        src={edition.videoSrc}
        width={720}
        height={1280}
        muted={isMuted}
        loop
        playsInline
        preload={priorityLoad ? 'auto' : 'metadata'}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-label={`${edition.title} — ${edition.subtitle}`}
        className="w-full h-full object-cover"
      />

      {/* Gradiente sutil en la base para legibilidad de controles sin tapar el álbum */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1C1917]/75 via-[#1C1917]/25 to-transparent"
      />

      {/* Overlay limpio cuando el video secundario está en reposo */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1C1917]/20 backdrop-blur-[1px] transition-opacity">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAF7F0]/90 text-[#1C1917] shadow-lg">
            <Play className="w-5 h-5 fill-current translate-x-0.5 text-[#A18417]" />
          </span>
          <span className="mt-2.5 text-[11px] font-semibold tracking-wider uppercase text-[#FAF7F0] drop-shadow">
            Ver {edition.label}
          </span>
        </div>
      )}

      {/* Controles minimalistas del video activo */}
      {isActive && (
        <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
              title={isPlaying ? 'Pausar video' : 'Reproducir video'}
              className="inline-flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-[#FAF7F0]/90 hover:bg-white text-[#1C1917] shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-[#1C1917]" />
              ) : (
                <Play className="w-4 h-4 text-[#A18417] translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
              className="inline-flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-[#1C1917]/65 hover:bg-[#1C1917]/85 backdrop-blur-md border border-white/15 text-[#FAF7F0] shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#DDC385]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#DDC385]" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-[#1C1917]/65 backdrop-blur-md border border-white/15 text-[10px] font-medium tracking-wider uppercase text-[#FAF7F0] tabular-nums">
              {edition.label}
            </span>

            {onExpand && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand();
                }}
                aria-label="Ver video en grande"
                title="Ver video en grande"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1C1917]/65 hover:bg-[#1C1917]/85 backdrop-blur-md border border-white/15 text-[#FAF7F0] shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#DDC385]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Barra fina de progreso al pie */}
      {isActive && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20"
        >
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-[#DDC385] transition-[width] duration-150 ease-linear"
          />
        </div>
      )}
    </motion.div>
  );
}

export default function AlbumsShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);
  const prefersReducedMotion = Boolean(useReducedMotion());

  const currentEdition = ALBUM_EDITIONS[activeIndex];
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    currentEdition.whatsappMessage
  )}`;

  const handleSelectEdition = useCallback(
    (idx: number) => {
      if (idx === activeIndex) return;
      setDirection(idx > activeIndex ? 1 : -1);
      setActiveIndex(idx);
    },
    [activeIndex]
  );

  // Bloquear scroll de página y asegurar reproducción al abrir modal de video
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
      const vid = lightboxVideoRef.current;
      if (vid) {
        vid.play().catch(() => {
          vid.muted = true;
          vid.play().catch(() => {});
        });
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  // Navegación y controles por teclado en el Lightbox de video
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        const prev = (lightboxIndex - 1 + ALBUM_EDITIONS.length) % ALBUM_EDITIONS.length;
        setLightboxIndex(prev);
        handleSelectEdition(prev);
      } else if (e.key === 'ArrowRight') {
        const next = (lightboxIndex + 1) % ALBUM_EDITIONS.length;
        setLightboxIndex(next);
        handleSelectEdition(next);
      } else if (e.key === ' ') {
        e.preventDefault();
        const vid = lightboxVideoRef.current;
        if (vid) {
          if (vid.paused) vid.play().catch(() => {});
          else vid.pause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleSelectEdition]);

  return (
    <section
      id="albumes-showcase"
      aria-label="Álbumes de figuritas personalizados"
      className="relative w-full min-h-[100svh] lg:min-h-[100dvh] flex items-center justify-center pt-[86px] sm:pt-28 lg:pt-32 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-8 lg:pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#FAF7F0] via-[#FAF7F0] to-[#F5EFE6]/40"
    >
      {/* Resplandor ambiental suave */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[560px] h-[560px] bg-gradient-to-tr from-[#F0D79E]/25 via-[#F5EFE6]/45 to-white/70 rounded-full blur-3xl -z-10 pointer-events-none"
      />

      <div className="max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 lg:gap-12 items-center">
          {/* =================================================================
              MOBILE TOP (< lg): Volver + Título + Selector segmentado táctil
             ================================================================= */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="lg:hidden flex flex-col space-y-2.5 order-1 min-w-0"
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
                key={`mob-head-${currentEdition.id}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
                className="space-y-0.5"
              >
                <h1 className="font-serif text-[1.45rem] sm:text-3xl font-bold text-[#1C1917] tracking-tight leading-[1.15] [text-wrap:balance]">
                  {currentEdition.title}
                </h1>
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#A18417]">
                  {currentEdition.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Selector segmentado de video con pill animada Framer Motion */}
            <div
              role="tablist"
              aria-label="Seleccionar video de álbum"
              className="inline-flex self-start p-1 rounded-full bg-[#F5EFE6] border border-[#E8DECF] gap-1"
            >
              {ALBUM_EDITIONS.map((item, idx) => {
                const selected = activeIndex === idx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => handleSelectEdition(idx)}
                    className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px] cursor-pointer select-none ${
                      selected ? 'text-[#FAF7F0]' : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="mobile-album-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-[#1C1917] shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* =================================================================
              DESKTOP LEFT (lg+): Columna editorial con selector & CTA
             ================================================================= */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: EASE_OUT }}
            className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 order-1 min-w-0"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition w-fit group select-none"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Volver a la Vidriera Principal
            </Link>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`desk-info-${currentEdition.id}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                className="space-y-4 text-left"
              >
                <div className="space-y-1.5">
                  <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#846C12]">
                    Álbumes de Figuritas
                  </span>
                  <h1 className="font-serif text-4xl xl:text-5xl font-bold text-[#1C1917] tracking-tight leading-tight [text-wrap:balance]">
                    {currentEdition.title}
                  </h1>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#A18417]">
                    {currentEdition.subtitle}
                  </p>
                </div>

                <p className="text-[#57534E] text-base lg:text-lg leading-relaxed [text-wrap:pretty] max-w-lg">
                  {currentEdition.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Selector segmentado Desktop */}
            <div className="flex flex-col gap-4 pt-1">
              <div
                role="tablist"
                aria-label="Seleccionar edición de álbum"
                className="inline-flex self-start p-1 rounded-full bg-[#F5EFE6] border border-[#E8DECF] gap-1"
              >
                {ALBUM_EDITIONS.map((item, idx) => {
                  const selected = activeIndex === idx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => handleSelectEdition(idx)}
                      className={`relative px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none ${
                        selected ? 'text-[#FAF7F0]' : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      {selected && (
                        <motion.span
                          layoutId="desktop-album-pill"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          className="absolute inset-0 rounded-full bg-[#1C1917] shadow-sm"
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4 text-[#DDC385]" />
                  <span>Consultar por mi álbum</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* =================================================================
              SHOWCASE DE VIDEOS 9:16 (Mobile: 1 frame con transición direccional /
              Desktop: 2 frames lado a lado con foco interactivo)
             ================================================================= */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: 55, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.8, ease: EASE_OUT }}
            className="lg:col-span-7 order-2 flex items-center justify-center w-full"
          >
            {/* Mobile (< lg): Reproductor vertical 9:16 único y equilibrado */}
            <div className="lg:hidden w-full flex justify-center">
              <div className="w-[202px] sm:w-[238px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentEdition.id}
                    initial={
                      prefersReducedMotion
                        ? false
                        : { opacity: 0, x: direction * 28, scale: 0.97 }
                    }
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={
                      prefersReducedMotion
                        ? undefined
                        : { opacity: 0, x: -direction * 28, scale: 0.97 }
                    }
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                  >
                    <AlbumVideoFrame
                      edition={currentEdition}
                      isActive={lightboxIndex === null}
                      onExpand={() => setLightboxIndex(activeIndex)}
                      reducedMotion={prefersReducedMotion}
                      priorityLoad={true}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop (lg+): Ambos reels 9:16 minimalistas lado a lado */}
            <div className="hidden lg:grid grid-cols-2 gap-6 xl:gap-8 w-full max-w-[600px] xl:max-w-[650px] items-center">
              {ALBUM_EDITIONS.map((edition, idx) => (
                <AlbumVideoFrame
                  key={edition.id}
                  edition={edition}
                  isActive={activeIndex === idx && lightboxIndex === null}
                  onActivate={() => handleSelectEdition(idx)}
                  onExpand={() => setLightboxIndex(idx)}
                  reducedMotion={prefersReducedMotion}
                  priorityLoad={idx === 0}
                />
              ))}
            </div>
          </motion.div>

          {/* =================================================================
              MOBILE BOTTOM (< lg): Descripción breve + CTA en zona del pulgar
             ================================================================= */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6, ease: EASE_OUT }}
            className="lg:hidden flex flex-col space-y-3 order-3 min-w-0 pt-0.5"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`mob-desc-${currentEdition.id}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
                className="text-[#57534E] text-[13px] sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 [text-wrap:pretty]"
              >
                {currentEdition.description}
              </motion.p>
            </AnimatePresence>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] font-medium text-xs sm:text-sm shadow-md transition-all duration-150 active:scale-[0.97] min-h-[44px] select-none"
            >
              <MessageCircle className="w-4 h-4 text-[#DDC385] shrink-0" />
              <span>Consultar por mi álbum</span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* MODAL / LIGHTBOX DE VIDEO EN GRANDE */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightboxIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Reproducción ampliada: ${ALBUM_EDITIONS[lightboxIndex].title}`}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 backdrop-blur-md p-4 sm:p-6 md:p-10 cursor-zoom-out"
          >
            {/* Indicador superior de edición */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-4 py-1.5 text-white shadow-lg border border-white/10 select-none pointer-events-auto"
            >
              <span className="text-xs font-semibold tracking-wider uppercase text-[#DDC385]">
                {ALBUM_EDITIONS[lightboxIndex].label}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-white/85 tabular-nums">
                {lightboxIndex + 1} de {ALBUM_EDITIONS.length}
              </span>
            </div>

            {/* Botón cerrar en esquina superior derecha */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Cerrar video en grande"
              title="Cerrar (Esc)"
              className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xs shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Flechas para cambiar entre videos sin cerrar el Lightbox */}
            {ALBUM_EDITIONS.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const prev = (lightboxIndex - 1 + ALBUM_EDITIONS.length) % ALBUM_EDITIONS.length;
                    setLightboxIndex(prev);
                    handleSelectEdition(prev);
                  }}
                  aria-label="Video anterior"
                  className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xs shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = (lightboxIndex + 1) % ALBUM_EDITIONS.length;
                    setLightboxIndex(next);
                    handleSelectEdition(next);
                  }}
                  aria-label="Siguiente video"
                  className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-xs shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Reproductor vertical 9:16 ampliado */}
            <motion.div
              key={ALBUM_EDITIONS[lightboxIndex].id}
              initial={prefersReducedMotion ? false : { scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[78svh] sm:h-[85dvh] max-h-[860px] max-w-[92vw] aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-white/15 shadow-2xl cursor-default"
            >
              <video
                ref={lightboxVideoRef}
                src={ALBUM_EDITIONS[lightboxIndex].videoSrc}
                width={720}
                height={1280}
                controls
                autoPlay
                loop
                playsInline
                preload="auto"
                aria-label={ALBUM_EDITIONS[lightboxIndex].title}
                className="w-full h-full object-contain bg-black"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
