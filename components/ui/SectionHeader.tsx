'use client';

/**
 * components/ui/SectionHeader.tsx
 *
 * Reusable section label + title block.
 * The `children` prop renders inside the <h2> so you can
 * include <span> orange accents exactly as in the original design.
 *
 * Usage:
 *   <SectionHeader label="// 01 — Mobile">
 *     iOS <span className="text-orange">Projects</span>
 *   </SectionHeader>
 */

import type { ReactNode } from 'react';
import RevealOnScroll from './RevealOnScroll';

interface SectionHeaderProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export default function SectionHeader({
  label,
  children,
  className = '',
}: SectionHeaderProps) {
  return (
    <RevealOnScroll className={`text-center mb-[calc(var(--u)*2)] ${className}`}>
      <span
        className="font-mono block mb-3 uppercase tracking-[3px]"
        style={{ fontSize: '11px', color: 'var(--orange)' }}
      >
        {label}
      </span>
      <h2
        className="font-display leading-[1.3]"
        style={{
          fontSize: 'clamp(24px, 3.5vw, 40px)',
          color: 'var(--text)',
        }}
      >
        {children}
      </h2>
    </RevealOnScroll>
  );
}
