'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageCircle, RotateCcw } from 'lucide-react';
import ScrollExpand from '@/components/ui/scroll-expand';
import Grainient from '@/components/ui/grainient';
import QuestionMarksParallax from '@/components/home/question-marks-parallax';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491100000000';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  '¡Hola! Estuve viendo cómo trabajan en su web y quisiera consultar por un pedido personalizado.'
)}`;

interface OrderStep {
  number: string;
  badge: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  isExternal?: boolean;
}

const ORDER_STEPS: OrderStep[] = [
  {
    number: '01',
    badge: 'Paso 01',
    title: 'Explorá el catálogo',
    description:
      '¡Revisá nuestro catálogo y buscá un producto que te guste! Si no encontrás algo parecido a tu idea, ¡no hay problema, saltá al paso 2!',
    actionLabel: 'Explorar etiquetas de vinos',
    actionHref: '/etiquetas-vinos',
  },
  {
    number: '02',
    badge: 'Paso 02',
    title: 'Contactanos por WhatsApp',
    description:
      'Contactanos vía WhatsApp, contándonos tu idea, proyecto o lo que tengas en mente.',
    actionLabel: 'Escribinos por WhatsApp',
    actionHref: WHATSAPP_URL,
    isExternal: true,
  },
  {
    number: '03',
    badge: 'Paso 03',
    title: 'Diseños, plazos y presupuesto',
    description: 'Definimos diseños, plazos de entregas y presupuestos finales.',
  },
  {
    number: '04',
    badge: 'Paso 04',
    title: 'Efectuás el pago',
    description: 'Efectuás el pago con los métodos de pago disponibles.',
  },
  {
    number: '05',
    badge: 'Paso 05',
    title: 'Retiro o entrega en Rosario',
    description:
      'Dentro de los plazos de entrega, te avisamos cuando esté listo tu producto, ¡y coordinamos retiro o entrega dentro de Rosario!',
    actionLabel: 'Iniciar mi pedido por WhatsApp',
    actionHref: WHATSAPP_URL,
    isExternal: true,
  },
];

export default function HowWeWorkSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activePanel, setActivePanel] = useState(0); // 0 = Intro, 1..5 = Pasos

  const renderOverlayHeader = (scrollToPanel: (index: number) => void) => (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-22 sm:pt-28 pb-2.5 flex items-center justify-between gap-2 text-xs sm:text-sm min-h-[122px] sm:min-h-[146px]">
      <span className="text-[#846C12] font-semibold tracking-[0.2em] uppercase text-[11px] sm:text-xs">
        <span className="sm:hidden">Metodología</span>
        <span className="hidden sm:inline">Metodología SicaEstudio</span>
      </span>

      <div className="flex items-center gap-2.5 sm:gap-3 h-7">
        <button
          type="button"
          onClick={() => scrollToPanel(0)}
          disabled={activePanel === 0}
          aria-hidden={activePanel === 0}
          tabIndex={activePanel === 0 ? -1 : 0}
          aria-label="Volver al inicio de la metodología"
          title="Volver a Descubrí nuestra metodología"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E8DECF] bg-white/85 backdrop-blur-md hover:bg-[#FAF7F0] hover:border-[#DDC385] text-[11px] font-medium text-[#1C1917] shadow-2xs transition-all duration-200 active:scale-95 select-none ${
            activePanel > 0
              ? 'opacity-100 pointer-events-auto cursor-pointer'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <RotateCcw className="w-3 h-3 text-[#A18417]" />
          <span>Inicio</span>
        </button>

        <span className="text-[#57534E] text-xs font-medium tracking-wider uppercase tabular-nums">
          {activePanel === 0 ? (
            <span className="text-[#846C12] font-semibold">Inicio</span>
          ) : (
            <>
              <span className="text-[#1C1917] font-bold">Paso 0{activePanel}</span>
              <span className="text-[#1C1917]/30 mx-1">/</span>
              <span className="text-[#57534E]">05</span>
            </>
          )}
        </span>
      </div>
    </div>
  );

  const stepPanels = ORDER_STEPS.map((step, index) => {
    const stepIndex = index + 1;
    const isActive = activePanel === stepIndex;
    const isPassed = activePanel > stepIndex;

    return (
      <div
        key={step.number}
        className="w-full h-full flex flex-col items-center justify-start"
      >
        {/* Círculo decorativo sobre la línea única continua (top: 10px) */}
        <div className="w-full h-5 flex items-center justify-center shrink-0">
          <div
            className={`relative z-10 w-4 h-4 rounded-full transition-all duration-300 ${
              isActive
                ? 'bg-[#A18417] scale-125 ring-4 ring-[#DDC385]/50 shadow-sm'
                : isPassed
                  ? 'bg-[#A18417]'
                  : 'bg-[#FAF7F0] border-2 border-[#C4B59D]'
            }`}
          />
        </div>

        {/* Card luminosa estilo papelería vainilla/crema centrada en el viewport */}
        <div className="w-full max-w-xl px-5 sm:px-8 mt-5 sm:mt-7 flex-1 flex items-stretch">
          <article
            className={`w-full rounded-3xl backdrop-blur-xl p-6 sm:p-9 transition-all duration-300 flex flex-col justify-between ${
              isActive
                ? 'bg-[#FAF7F0]/92 border border-[#DDC385] shadow-[0_24px_60px_-15px_rgba(28,25,23,0.12)]'
                : 'bg-[#FAF7F0]/78 border border-[#E8DECF] shadow-[0_14px_40px_-15px_rgba(28,25,23,0.08)]'
            }`}
          >
            <div>
              {/* Etiqueta de paso en texto puro */}
              <span className="block text-xs font-semibold tracking-[0.2em] uppercase text-[#A18417]">
                {step.badge}
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight leading-snug mt-3">
                {step.title}
              </h3>

              <p className="text-sm sm:text-base md:text-lg text-[#57534E] leading-relaxed font-sans mt-3 [text-wrap:pretty]">
                {step.description}
              </p>
            </div>

            {step.actionLabel && step.actionHref ? (
              <div className="pt-5 mt-5 border-t border-[#E8DECF]">
                {step.isExternal ? (
                  <a
                    href={step.actionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] font-medium text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4 text-[#DDC385]" />
                    <span>{step.actionLabel}</span>
                  </a>
                ) : (
                  <Link
                    href={step.actionHref}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full bg-white/90 hover:bg-[#F5EFE6] border border-[#DDC385]/70 text-[#1C1917] font-medium text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] shadow-2xs"
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight className="w-4 h-4 text-[#A18417]" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="pt-4 mt-5 border-t border-[#E8DECF] flex items-center justify-between text-xs text-[#78716C]">
                <span>Atención personalizada</span>
                <span>SicaEstudio</span>
              </div>
            )}
          </article>
        </div>
      </div>
    );
  });

  return (
    <section
      ref={sectionRef}
      id="como-trabajamos"
      aria-label="Cómo trabajamos"
      className="relative w-full bg-[#F6F3EC] scroll-mt-20"
    >
      <ScrollExpand
        title="¿Cómo trabajamos?"
        titleClassName="font-serif font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-[#1C1917] max-w-[78vw] md:max-w-[48vw] mx-auto leading-[1.08]"
        frameClassName="bg-[#EAE0CE]"
        stageBackground={<QuestionMarksParallax targetRef={sectionRef} />}
        useWindowScroll={true}
        startWidth={54}
        startHeight={60}
        startRadius={28}
        endRadius={0}
        scrollDistance={1.0}
        holdDistance={0.25}
        horizontalDistance={4.75}
        endHoldDistance={0.3}
        smoothing={0.09}
        overlayScrim={0}
        overlayHeader={renderOverlayHeader}
        horizontalPanels={stepPanels}
        onActivePanelChange={setActivePanel}
        overlayFooter={(scrollToPanel) => (
          <div className="w-full max-w-xl mx-auto px-5 sm:px-8 pb-6 sm:pb-9 pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => scrollToPanel(activePanel - 1)}
              disabled={activePanel <= 0}
              aria-label="Paso anterior"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border border-[#E8DECF] bg-white/90 backdrop-blur-md text-[#1C1917] hover:bg-[#F5EFE6] hover:border-[#DDC385] text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-35 disabled:pointer-events-none cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-[#A18417]" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-2" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToPanel(idx)}
                  aria-label={idx === 0 ? 'Ir al inicio' : `Ir al paso ${idx}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activePanel === idx
                      ? 'w-6 bg-[#A18417]'
                      : 'w-2 bg-[#1C1917]/20 hover:bg-[#1C1917]/40'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollToPanel(activePanel + 1)}
              disabled={activePanel >= ORDER_STEPS.length}
              aria-label="Paso siguiente"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F0] text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-35 disabled:pointer-events-none cursor-pointer shadow-md"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4 text-[#DDC385]" />
            </button>
          </div>
        )}
        backgroundComponent={
          <div className="relative w-full h-full bg-[#EAE0CE]">
            <Grainient
              colors={['#DDD0B8', '#E9DEC9', '#F5EFE6', '#E4D5BC', '#FAF7F0']}
              type="linear"
              angle={45}
              speed={0.65}
              flow={1.0}
              scale={1.15}
              softness={0.85}
              silk={0.4}
              contrast={0.9}
              saturation={0.65}
              grainAmount={0.04}
              grainSize={1.2}
              grainAnimated={true}
              interactive={true}
              clickSwirl={true}
              className="w-full h-full"
            />
          </div>
        }
      >
        {/* Panel 0: "Descubrí nuestra metodología" en estética luminosa vainilla/crema */}
        <div className="w-full h-full flex flex-col items-center justify-start">
          {/* Círculo decorativo de inicio sobre la línea única continua (top: 10px) */}
          <div className="w-full h-5 flex items-center justify-center shrink-0">
            <div
              className={`relative z-10 w-4 h-4 rounded-full transition-all duration-300 ${
                activePanel === 0
                  ? 'bg-[#A18417] scale-125 ring-4 ring-[#DDC385]/50 shadow-sm'
                  : 'bg-[#A18417]'
              }`}
            />
          </div>

          <div className="w-full max-w-4xl px-5 sm:px-8 mt-5 sm:mt-7 flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#846C12] mb-4">
              5 pasos simples
            </span>

            <h2 className="font-serif font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#1C1917] leading-[1.08]">
              Descubrí nuestra metodología
              <span className="inline-flex items-center ml-3 sm:ml-4 text-[#A18417]">
                <ArrowRight className="w-8 h-8 sm:w-12 sm:h-12 translate-y-1 animate-pulse" />
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-[#57534E] max-w-xl mx-auto mt-5 leading-relaxed">
              Seguí deslizando o usá los botones inferiores para recorrer cada paso.
            </p>
          </div>
        </div>
      </ScrollExpand>
    </section>
  );
}
