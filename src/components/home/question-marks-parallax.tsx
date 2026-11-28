'use client';

import type { RefObject } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

interface QuestionMarkItem {
  id: string;
  char: '?' | '¿';
  /** Posición en porcentaje dentro del stage */
  top: string;
  left: string;
  /** Tamaño responsivo con fuente serif de la web */
  sizeClass: string;
  colorClass: string;
  baseRotate: number;
  rotateDelta: number;
  /** Nivel de profundidad parallax: 1 (lento), 2 (medio), 3 (rápido y notorio) */
  depth: 1 | 2 | 3;
  /** Ocultar en pantallas muy angostas si queda sobre el borde del card */
  hideOnMobile?: boolean;
}

const QUESTION_MARKS: QuestionMarkItem[] = [
  // Zona superior
  {
    id: 'qm-top-1',
    char: '?',
    top: '8%',
    left: '14%',
    sizeClass: 'text-5xl sm:text-6xl lg:text-7xl',
    colorClass: 'text-[#4B533A]/85',
    baseRotate: -18,
    rotateDelta: 12,
    depth: 2,
  },
  {
    id: 'qm-top-2',
    char: '¿',
    top: '11%',
    left: '34%',
    sizeClass: 'text-2xl sm:text-3xl lg:text-4xl',
    colorClass: 'text-[#A18417]/75',
    baseRotate: 14,
    rotateDelta: -10,
    depth: 1,
  },
  {
    id: 'qm-top-3',
    char: '?',
    top: '13%',
    left: '56%',
    sizeClass: 'text-3xl sm:text-4xl lg:text-5xl',
    colorClass: 'text-[#75805E]/55',
    baseRotate: -8,
    rotateDelta: 14,
    depth: 1,
  },
  {
    id: 'qm-top-4',
    char: '?',
    top: '6%',
    left: '81%',
    sizeClass: 'text-7xl sm:text-8xl lg:text-9xl',
    colorClass: 'text-[#3F4730]/95',
    baseRotate: 22,
    rotateDelta: -14,
    depth: 3,
  },

  // Lateral izquierdo
  {
    id: 'qm-left-1',
    char: '¿',
    top: '27%',
    left: '5%',
    sizeClass: 'text-4xl sm:text-5xl lg:text-6xl',
    colorClass: 'text-[#5A6347]/75',
    baseRotate: -24,
    rotateDelta: 15,
    depth: 2,
  },
  {
    id: 'qm-left-2',
    char: '?',
    top: '44%',
    left: '10%',
    sizeClass: 'text-6xl sm:text-7xl lg:text-8xl',
    colorClass: 'text-[#3F4730]/90',
    baseRotate: -12,
    rotateDelta: -12,
    depth: 3,
    hideOnMobile: true,
  },
  {
    id: 'qm-left-3',
    char: '?',
    top: '61%',
    left: '4%',
    sizeClass: 'text-2xl sm:text-3xl lg:text-4xl',
    colorClass: 'text-[#838D6E]/55',
    baseRotate: 19,
    rotateDelta: 10,
    depth: 1,
  },
  {
    id: 'qm-left-4',
    char: '¿',
    top: '76%',
    left: '16%',
    sizeClass: 'text-5xl sm:text-6xl lg:text-7xl',
    colorClass: 'text-[#A18417]/65',
    baseRotate: 28,
    rotateDelta: -16,
    depth: 2,
    hideOnMobile: true,
  },

  // Lateral derecho
  {
    id: 'qm-right-1',
    char: '¿',
    top: '29%',
    left: '89%',
    sizeClass: 'text-3xl sm:text-4xl lg:text-5xl',
    colorClass: 'text-[#75805E]/60',
    baseRotate: 15,
    rotateDelta: -11,
    depth: 1,
  },
  {
    id: 'qm-right-2',
    char: '?',
    top: '48%',
    left: '84%',
    sizeClass: 'text-7xl sm:text-8xl lg:text-9xl',
    colorClass: 'text-[#363D29]/90',
    baseRotate: 16,
    rotateDelta: 14,
    depth: 3,
    hideOnMobile: true,
  },
  {
    id: 'qm-right-3',
    char: '?',
    top: '66%',
    left: '91%',
    sizeClass: 'text-4xl sm:text-5xl lg:text-6xl',
    colorClass: 'text-[#5A6347]/80',
    baseRotate: -26,
    rotateDelta: -14,
    depth: 2,
  },
  {
    id: 'qm-right-4',
    char: '¿',
    top: '79%',
    left: '79%',
    sizeClass: 'text-5xl sm:text-6xl lg:text-7xl',
    colorClass: 'text-[#4B533A]/85',
    baseRotate: 42,
    rotateDelta: 12,
    depth: 3,
    hideOnMobile: true,
  },

  // Zona inferior
  {
    id: 'qm-bot-1',
    char: '¿',
    top: '84%',
    left: '8%',
    sizeClass: 'text-4xl sm:text-5xl lg:text-6xl',
    colorClass: 'text-[#3F4730]/90',
    baseRotate: -32,
    rotateDelta: 15,
    depth: 3,
  },
  {
    id: 'qm-bot-2',
    char: '?',
    top: '87%',
    left: '29%',
    sizeClass: 'text-3xl sm:text-4xl lg:text-5xl',
    colorClass: 'text-[#838D6E]/55',
    baseRotate: 10,
    rotateDelta: -12,
    depth: 1,
  },
  {
    id: 'qm-bot-3',
    char: '?',
    top: '83%',
    left: '49%',
    sizeClass: 'text-6xl sm:text-7xl lg:text-8xl',
    colorClass: 'text-[#5A6347]/80',
    baseRotate: -14,
    rotateDelta: 16,
    depth: 2,
  },
  {
    id: 'qm-bot-4',
    char: '¿',
    top: '89%',
    left: '68%',
    sizeClass: 'text-2xl sm:text-3xl lg:text-4xl',
    colorClass: 'text-[#A18417]/75',
    baseRotate: 20,
    rotateDelta: -10,
    depth: 1,
  },
  {
    id: 'qm-bot-5',
    char: '?',
    top: '86%',
    left: '88%',
    sizeClass: 'text-5xl sm:text-6xl lg:text-7xl',
    colorClass: 'text-[#4B533A]/80',
    baseRotate: -20,
    rotateDelta: 14,
    depth: 2,
  },
];

const DEPTH_RANGES: Record<1 | 2 | 3, [number, number]> = {
  1: [70, -90],
  2: [155, -195],
  3: [250, -310],
};

function ParallaxQuestionMark({
  item,
  scrollYProgress,
  reducedMotion,
}: {
  item: QuestionMarkItem;
  scrollYProgress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const [startY, endY] = DEPTH_RANGES[item.depth];
  const y = useTransform(scrollYProgress, [0, 0.36], reducedMotion ? [0, 0] : [startY, endY]);
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.36],
    reducedMotion
      ? [item.baseRotate, item.baseRotate]
      : [item.baseRotate - item.rotateDelta, item.baseRotate + item.rotateDelta]
  );

  return (
    <motion.span
      style={{
        top: item.top,
        left: item.left,
        y,
        rotate,
      }}
      className={`absolute font-serif font-bold leading-none select-none pointer-events-none will-change-transform ${
        item.sizeClass
      } ${item.colorClass} ${item.hideOnMobile ? 'hidden md:block' : ''}`}
    >
      {item.char}
    </motion.span>
  );
}

export default function QuestionMarksParallax({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  });

  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-none select-none">
      {QUESTION_MARKS.map((item) => (
        <ParallaxQuestionMark
          key={item.id}
          item={item}
          scrollYProgress={scrollYProgress}
          reducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  );
}
