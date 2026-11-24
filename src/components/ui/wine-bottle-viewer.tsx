'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCw,
  ZoomIn,
  Sparkles,
  MessageCircle,
  RefreshCw,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Dynamic import with ssr: false ensures Canvas and WebGL only run client-side
const ModelViewer = dynamic(() => import('@/components/ui/model-viewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center gap-4 bg-[#FAF7F0]/60 rounded-2xl sm:rounded-3xl border border-[#E8DECF]">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-[#DDC385]/30 border-t-[#A18417] animate-spin" />
        <Sparkles className="w-6 h-6 text-[#A18417] animate-pulse" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-serif font-bold text-sm text-[#1C1917] tracking-wide">
          Cargando Botella 3D
        </p>
        <p className="text-xs text-[#78716C]">
          Renderizando diseño y acabados de autor...
        </p>
      </div>
    </div>
  ),
});

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000';
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Configuración de los diseños disponibles para la botella 3D
const DESIGNS = [
  {
    id: 'eliana',
    variety: 'Edición Especial • Chenin Dulce',
    title: 'Botella de Autor Personalizada',
    badge: 'Vino Blanco Translúcido',
    description:
      'Diseño integral con mapa continuo 360° sobre botella real de vino blanco translúcido. Combina fotografía de alta definición, tipografía de autor y acabados especiales sobre papel texturado con capuchón plateado.',
    textureUrl: '/texturaEliana.png',
    textureOffset: 0,
    isTranslucent: true,
    glassRoughness: 0.16,
    glassMetalness: 0.1,
    glassClearcoat: 0.95,
    glassClearcoatRoughness: 0.1,
    whatsappMessage:
      '¡Hola! Vi el visualizador 3D de la botella personalizada (Edición Eliana • Chenin Dulce) en SicaEstudio y me gustaría consultar por un diseño para un festejo especial.',
  },
  {
    id: 'genio-amor',
    variety: 'Edición Especial • Cabernet Sauvignon',
    title: 'Etiqueta de Autor • Mi Genio Amor',
    badge: 'Vino Tinto • Vidrio Negro Reflectivo',
    description:
      'Homenaje de autor sobre botella real de vino tinto con acabado en vidrio negro reflectivo. Etiqueta frontal con corazón ardiente entre cadenas, tipografía dorada de alta definición y cápsula oscura Salentein.',
    textureUrl: '/texturaGenioamor.jpg',
    textureOffset: 0,
    isTranslucent: false,
    glassRoughness: 0.1,
    glassMetalness: 0.08,
    glassClearcoat: 1.0,
    glassClearcoatRoughness: 0.05,
    whatsappMessage:
      '¡Hola! Vi el visualizador 3D de la botella "Mi Genio Amor" (Cabernet Sauvignon) en SicaEstudio y me gustaría consultar por un diseño personalizado.',
  },
];

interface WineBottleViewerProps {
  showBackLink?: boolean;
}

export default function WineBottleViewer({ showBackLink = true }: WineBottleViewerProps) {
  const [designIndex, setDesignIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const currentDesign = DESIGNS[designIndex];

  const handleEnhanceModel = useCallback(
    (object: THREE.Object3D, texture?: THREE.Texture | null) => {
      if (texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.offset.set(currentDesign.textureOffset, 0);
        texture.needsUpdate = true;
      }

      const meshes: THREE.Mesh[] = [];
      object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.name !== 'wine_bottle_interior') {
          meshes.push(child as THREE.Mesh);
        }
      });

      if (currentDesign.isTranslucent) {
        // 1. VINO BLANCO: Translúcido con doble pasada (FrontSide + BackSide interior visible)
        const backMaterial = new THREE.MeshPhysicalMaterial({
          map: texture ?? null,
          transparent: true,
          opacity: 0.85,
          roughness: 0.35,
          metalness: 0.05,
          side: THREE.BackSide,
          depthWrite: false,
        });

        const frontMaterial = new THREE.MeshPhysicalMaterial({
          map: texture ?? null,
          transparent: true,
          opacity: 1.0,
          roughness: currentDesign.glassRoughness,
          metalness: currentDesign.glassMetalness,
          clearcoat: currentDesign.glassClearcoat,
          clearcoatRoughness: currentDesign.glassClearcoatRoughness,
          side: THREE.FrontSide,
          depthWrite: true,
        });

        for (const mesh of meshes) {
          mesh.material = frontMaterial;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.renderOrder = 1;

          let innerMesh = object.getObjectByName('wine_bottle_interior') as THREE.Mesh;
          if (!innerMesh) {
            innerMesh = new THREE.Mesh(mesh.geometry, backMaterial);
            innerMesh.name = 'wine_bottle_interior';
            innerMesh.renderOrder = 0;
            object.add(innerMesh);
          } else {
            innerMesh.material = backMaterial;
            innerMesh.visible = true;
          }
        }
      } else {
        // 2. VINO TINTO (Mi Genio Amor): Opaco, cuerpo de vidrio oscuro y casi reflectivo
        const opaqueMaterial = new THREE.MeshPhysicalMaterial({
          map: texture ?? null,
          transparent: false,
          opacity: 1.0,
          roughness: currentDesign.glassRoughness,
          metalness: currentDesign.glassMetalness,
          clearcoat: currentDesign.glassClearcoat,
          clearcoatRoughness: currentDesign.glassClearcoatRoughness,
          side: THREE.FrontSide,
          depthWrite: true,
        });

        for (const mesh of meshes) {
          mesh.material = opaqueMaterial;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.renderOrder = 1;

          const innerMesh = object.getObjectByName('wine_bottle_interior') as THREE.Mesh;
          if (innerMesh) {
            innerMesh.visible = false;
          }
        }
      }
    },
    [currentDesign]
  );

  const resetView = () => {
    setResetKey((prev) => prev + 1);
  };

  const handlePrevDesign = () => {
    setDesignIndex((prev) => (prev - 1 + DESIGNS.length) % DESIGNS.length);
  };

  const handleNextDesign = () => {
    setDesignIndex((prev) => (prev + 1) % DESIGNS.length);
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(currentDesign.whatsappMessage)}`;

  return (
    <div className="w-full relative flex flex-col justify-center space-y-2.5 sm:space-y-4 lg:space-y-6">
      {/* =========================================================================
          1. TÍTULO SUPERIOR CENTRADO EN DESKTOP (En mobile va integrado en la cabecera superior)
         ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, ease: EASE_OUT }}
        className="hidden lg:block text-center space-y-1"
      >
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917] tracking-tight">
          Visualizador 3D
        </h2>
        <div className="w-14 h-0.5 bg-gradient-to-r from-transparent via-[#A18417] to-transparent mx-auto mt-1" />
      </motion.div>

      {/* =========================================================================
          2. DISTRIBUCIÓN ORGÁNICA EN MOBILE (Header -> Visor 3D -> Selector/Texto/CTAs)
             Y 2 COLUMNAS INTACTAS EN DESKTOP (lg+)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-10 items-center">

        {/* MOBILE TOP (< lg): Encabezado compacto para que el visor 3D protagonice el centro */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          className="lg:hidden flex flex-col space-y-1 order-1 min-w-0"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#846C12]">
              Visualizador 3D
            </span>
            <span className="text-[11px] font-semibold text-[#78716C] tabular-nums select-none">
              {designIndex + 1} de {DESIGNS.length}
            </span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`mobile-3d-head-${currentDesign.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="space-y-0.5"
            >
              <h2 className="font-serif text-[1.45rem] sm:text-3xl font-bold text-[#1C1917] tracking-tight leading-[1.15] [text-wrap:balance]">
                {currentDesign.title}
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#A18417]">
                {currentDesign.variety}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* DESKTOP LEFT (lg+): Columna izquierda íntegra sin cambios */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: EASE_OUT }}
          className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-5 text-left order-1"
        >
          
          {/* Volver a la vidriera */}
          {showBackLink && (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition w-fit group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Volver a la Vidriera Principal
            </Link>
          )}

          {/* Título y descripción dinámicos por diseño */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentDesign.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#A18417]">
                  {currentDesign.variety}
                </span>
                <h1 className="font-serif text-4xl xl:text-5xl font-bold text-[#1C1917] tracking-tight leading-tight">
                  {currentDesign.title}
                </h1>
              </div>

              <p className="text-[#57534E] text-base leading-relaxed">
                {currentDesign.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Selector / Alternador de Diseños */}
          <div className="flex items-center gap-3 pt-1">
            <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl border border-[#E8DECF] bg-white/85 backdrop-blur-sm shadow-2xs">
              <button
                type="button"
                onClick={handlePrevDesign}
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#FAF7F0] hover:bg-[#F5EFE6] border border-[#E8DECF] text-[#1C1917] hover:border-[#DDC385] transition-all active:scale-95 shadow-2xs cursor-pointer"
                title="Diseño anterior"
                aria-label="Diseño anterior"
              >
                <ChevronLeft className="w-4 h-4 text-[#A18417]" />
              </button>

              <button
                type="button"
                onClick={handleNextDesign}
                className="px-3 py-1 text-xs font-serif font-bold text-[#1C1917] tracking-wide hover:text-[#A18417] transition-colors cursor-pointer select-none"
                title="Alternar al siguiente diseño"
              >
                Cambiar diseño
              </button>

              <button
                type="button"
                onClick={handleNextDesign}
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#FAF7F0] hover:bg-[#F5EFE6] border border-[#E8DECF] text-[#1C1917] hover:border-[#DDC385] transition-all active:scale-95 shadow-2xs cursor-pointer"
                title="Siguiente diseño"
                aria-label="Siguiente diseño"
              >
                <ChevronRight className="w-4 h-4 text-[#A18417]" />
              </button>
            </div>

            <span className="text-[11px] font-medium text-[#78716C] select-none">
              {designIndex + 1} de {DESIGNS.length}
            </span>
          </div>

          {/* Botones de Acción (CTA WhatsApp + Scroll a galería) */}
          <div className="flex items-center gap-3 flex-wrap pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 text-[#DDC385]" />
              <span>Consultar por Diseño</span>
            </a>
            <a
              href="#galeria"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[#E8DECF] bg-white/80 hover:bg-[#F5EFE6] text-[#57534E] hover:text-[#1C1917] text-sm font-medium transition-all duration-200 shadow-2xs"
              title="Subir a la Galería de Fotos"
            >
              <span>Ver Galería</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#A18417]" />
            </a>
          </div>

        </motion.div>

        {/* CENTRO EN MOBILE / DERECHA EN DESKTOP: Visualizador 3D */}
        <motion.div
          initial={{ opacity: 0, x: 55, scale: 0.97 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: 0.12, duration: 0.85, ease: EASE_OUT }}
          className="lg:col-span-7 flex items-center justify-center order-2 lg:order-2"
        >
          <div className="relative w-full h-[300px] sm:h-[380px] lg:h-[calc(100dvh-15rem)] max-h-[560px] min-h-[285px] lg:min-h-[360px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/80 via-[#FAF7F0]/60 to-[#F5EFE6]/50 border border-[#E8DECF] overflow-hidden flex items-center justify-center shadow-md">
            
            {/* Floating guidance badges (Compacto en mobile para no chocar con controles derechos) */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-col gap-1.5 sm:gap-2 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/85 backdrop-blur-md border border-[#E8DECF] text-[10px] sm:text-[11px] font-medium text-[#1C1917] shadow-2xs">
                <RotateCw className="w-3 h-3 text-[#A18417]" />
                <span className="sm:hidden">Rota · Pellizca</span>
                <span className="hidden sm:inline">Arrastra para rotar 360°</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 backdrop-blur-md border border-[#E8DECF] text-[11px] font-medium text-[#1C1917] shadow-2xs">
                <ZoomIn className="w-3 h-3 text-[#A18417]" />
                Ctrl + rueda o pellizco para zoom
              </span>
            </div>

            {/* Floating controls (Controles interactivos derecha: Auto-giro y Reiniciar) */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-row items-center gap-1.5 sm:gap-2 pointer-events-auto">
              {/* Toggle Auto-Giro */}
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-medium backdrop-blur-md border transition-all active:scale-95 shadow-2xs cursor-pointer select-none ${
                  autoRotate
                    ? 'bg-white/90 border-[#DDC385] text-[#1C1917]'
                    : 'bg-[#F5EFE6]/90 border-[#E8DECF] text-[#78716C] hover:text-[#1C1917]'
                }`}
                title="Pausar o activar auto-rotación"
              >
                <RotateCw className={`w-3 h-3 ${autoRotate ? 'text-[#A18417]' : 'text-[#78716C]'}`} />
                <span className="sm:hidden">{autoRotate ? 'Giro' : 'Fijo'}</span>
                <span className="hidden sm:inline">{autoRotate ? 'Auto-giro: ON' : 'Auto-giro: OFF'}</span>
              </button>

              {/* Botón Reiniciar */}
              <button
                type="button"
                onClick={resetView}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-medium border border-[#E8DECF] bg-white/90 backdrop-blur-md hover:border-[#DDC385] text-[#1C1917] shadow-2xs transition-all active:scale-95 cursor-pointer select-none"
                title="Reiniciar cámara a posición inicial"
                aria-label="Reiniciar cámara"
              >
                <RefreshCw className="w-3 h-3 text-[#A18417]" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            </div>

            {/* ModelViewer Component con Key para cambio fluido de diseño y textura */}
            <ModelViewer
              key={`${currentDesign.id}-${resetKey}`}
              url="/Wine_bottle.obj"
              textureUrl={currentDesign.textureUrl}
              width="100%"
              height="100%"
              environment="studio"
              environmentIntensity={1.25}
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
              autoRotateDelay={1.5}
              dragRotate={true}
              turntable={false}
              zoom={true}
              fit={0.82}
              tilt={3}
              startAngle={0}
              shadow={true}
              shadowOpacity={0.35}
              onEnhanceModel={handleEnhanceModel}
              className="w-full h-full"
            />

            {/* Bottom indicator con instrucción de recentrado */}
            <div className="absolute bottom-3 sm:bottom-4 inset-x-0 flex justify-center pointer-events-none z-20">
              <span className="px-3 py-1 rounded-full bg-white/85 backdrop-blur-md border border-[#E8DECF] text-[10px] sm:text-[11px] text-[#57534E] shadow-2xs">
                <span className="sm:hidden">Doble toque para recentrar</span>
                <span className="hidden sm:inline">Doble clic para recentrar</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* MOBILE BOTTOM (< lg): Selector de diseño + Descripción breve + CTAs en zona del pulgar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: 0.16, duration: 0.6, ease: EASE_OUT }}
          className="lg:hidden flex flex-col space-y-3 order-3 min-w-0 pt-0.5"
        >
          {/* Selector centrado táctil */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 p-1 rounded-full border border-[#E8DECF] bg-white/90 backdrop-blur-sm shadow-2xs">
              <button
                type="button"
                onClick={handlePrevDesign}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FAF7F0] active:bg-[#F5EFE6] border border-[#E8DECF] text-[#1C1917] transition-all active:scale-95 cursor-pointer select-none"
                title="Diseño anterior"
                aria-label="Diseño anterior"
              >
                <ChevronLeft className="w-4 h-4 text-[#A18417]" />
              </button>

              <button
                type="button"
                onClick={handleNextDesign}
                className="px-3.5 py-1.5 text-xs font-serif font-bold text-[#1C1917] tracking-wide cursor-pointer select-none"
                title="Alternar al siguiente diseño"
              >
                Cambiar diseño 3D
              </button>

              <button
                type="button"
                onClick={handleNextDesign}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FAF7F0] active:bg-[#F5EFE6] border border-[#E8DECF] text-[#1C1917] transition-all active:scale-95 cursor-pointer select-none"
                title="Siguiente diseño"
                aria-label="Siguiente diseño"
              >
                <ChevronRight className="w-4 h-4 text-[#A18417]" />
              </button>
            </div>
          </div>

          {/* Descripción controlada */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={`mobile-3d-desc-${currentDesign.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="text-[#57534E] text-[13px] sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 [text-wrap:pretty]"
            >
              {currentDesign.description}
            </motion.p>
          </AnimatePresence>

          {/* CTAs en una sola fila con altura mínima táctil 44px */}
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
              href="#galeria"
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full border border-[#E8DECF] bg-white/85 hover:bg-[#F5EFE6] text-[#1C1917] text-xs sm:text-sm font-medium transition-all duration-150 active:scale-[0.97] shadow-2xs min-h-[44px] whitespace-nowrap select-none"
              title="Subir a la Galería de Fotos"
            >
              <span>Ver Galería</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#A18417]" />
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
