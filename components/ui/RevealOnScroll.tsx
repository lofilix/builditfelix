'use client';

/**
 * components/ui/RevealOnScroll.tsx
 *
 * Drop-in replacement for the old IntersectionObserver + .reveal CSS class pattern.
 * Wraps any children in a Framer Motion div that animates in once
 * when the element enters the viewport.
 *
 * Props:
 *   delay     — stagger offset in seconds (default 0)
 *   direction — enter from 'up' | 'left' | 'right' (default 'up')
 *   className — forwarded to the wrapper div
 *   once      — only animate once? (default true)
 *
 * GSAP upgrade path:
 *   Replace this component with a GSAP ScrollTrigger gsap.from() call
 *   inside useGSAP() when you're ready for timeline-based orchestration.
 */

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface RevealOnScrollProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
}

export default function RevealOnScroll({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  style,
  once = true,
}: RevealOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-40px 0px' });
  const prefersReduced = useReducedMotion();

  const initial = prefersReduced
    ? { opacity: 1, y: 0, x: 0 }
    : {
        opacity: 0,
        y: direction === 'up' ? 30 : 0,
        x: direction === 'left' ? -30 : direction === 'right' ? 30 : 0,
      };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView || prefersReduced ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={prefersReduced ? { duration: 0 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
