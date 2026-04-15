'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  const glowRef = useRef<HTMLDivElement>(null);
  const heroScrollerRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) setReducedMotion(true);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const slides = useMemo(
    () => [
      { kind: 'indicator' as const },
      { kind: 'line' as const, text: "I'm Lix", className: styles.lineIntro },
      { kind: 'line' as const, text: 'I drink Coffee', className: styles.line1 },
      { kind: 'line' as const, text: 'pet dogs' },
      { kind: 'line' as const, text: 'and build things with code', className: styles.line3 },
      { kind: 'line' as const, text: "let's talk.", className: styles.line4 },
      { kind: 'static' as const },
    ],
    [],
  );

  const lastIndex = slides.length - 1;
  const getSlideHeight = () => heroScrollerRef.current?.clientHeight ?? window.innerHeight;

  const scrollToIndex = (nextIndex: number, behavior: ScrollBehavior = 'smooth') => {
    const el = heroScrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, nextIndex));
    const h = getSlideHeight();
    el.scrollTo({ top: clamped * h, behavior });
    setIndex(clamped);
  };

  const handoffToServices = () => {
    const services = document.getElementById('services');
    if (!services) return;
    const top = services.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const step = (dir: 1 | -1) => {
    if (lockRef.current) return;
    const next = index + dir;
    if (next < 0) {
      lockRef.current = true;
      window.scrollTo({ top: 0 });
      window.setTimeout(() => (lockRef.current = false), 500);
      return;
    }
    if (next >= slides.length) {
      lockRef.current = true;
      handoffToServices();
      window.setTimeout(() => (lockRef.current = false), 700);
      return;
    }

    lockRef.current = true;
    scrollToIndex(next, 'smooth');
    window.setTimeout(() => (lockRef.current = false), 800);
  };

  useEffect(() => {
    if (reducedMotion) return;
    const el = heroScrollerRef.current;
    if (!el) return;

    // Keep index in sync if user drags scrollbar / uses touch scroll.
    const onScroll = () => {
      const h = getSlideHeight();
      if (!h) return;
      const next = Math.round(el.scrollTop / h);
      setIndex(Math.max(0, Math.min(slides.length - 1, next)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [reducedMotion, slides.length]);

  return (
    <section id="hero" className={styles.heroSection}>
      <div ref={glowRef} className={styles.glowOrb} aria-hidden="true" />

      {reducedMotion ? (
        <div className={styles.staticHeroReduced}>
          <h1 className={styles.headline}>
            Websites that you can be <span className={styles.headlineAccent}>proud of</span>{' '}
            without breaking the bank
          </h1>
          <p className={styles.subheading}>
            From landing pages to full-stack apps — for startups, local brands, and product teams.
            Clean code, pixel-perfect design, real results.
          </p>
          <a href="#services" className={styles.continueHint}>
            Continue ↓
          </a>
        </div>
      ) : (
        <div
          ref={heroScrollerRef}
          className={`${styles.heroScroller} ${index === lastIndex ? styles.handoff : ''}`.trim()}
          aria-label="Hero story"
          onWheel={(e) => {
            if (Math.abs(e.deltaY) < 2) return;

            // Natural handoff: once the user reaches the final slide,
            // the next downward scroll smoothly takes them to Services.
            if (index === lastIndex && e.deltaY > 0) {
              e.preventDefault();
              if (!lockRef.current) {
                lockRef.current = true;
                handoffToServices();
                window.setTimeout(() => (lockRef.current = false), 900);
              }
              return;
            }

            e.preventDefault();
            step(e.deltaY > 0 ? 1 : -1);
          }}
          onTouchStart={(e) => {
            touchStartYRef.current = e.touches[0]?.clientY ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchStartYRef.current;
            const end = e.changedTouches[0]?.clientY ?? null;
            touchStartYRef.current = null;
            if (start == null || end == null) return;
            const delta = start - end;
            if (Math.abs(delta) < 30) return;

            if (index === lastIndex && delta > 0) {
              if (!lockRef.current) {
                lockRef.current = true;
                handoffToServices();
                window.setTimeout(() => (lockRef.current = false), 900);
              }
              return;
            }

            step(delta > 0 ? 1 : -1);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
              e.preventDefault();
              step(1);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
              e.preventDefault();
              step(-1);
            }
          }}
          tabIndex={0}
        >
          {slides.map((s, i) => {
            if (s.kind === 'indicator') {
              return (
                <div key={i} className={styles.slide} data-hero-slide>
                  <div className={styles.scrollIndicatorInline}>
                    <span className={styles.scrollLabel}>Scroll</span>
                    <div className={styles.scrollLinePulse} />
                  </div>
                </div>
              );
            }
            if (s.kind === 'line') {
              return (
                <div key={i} className={styles.slide} data-hero-slide>
                  <p className={`${styles.scrollLineSlide} ${s.className ?? ''}`.trim()}>
                    {s.text}
                  </p>
                </div>
              );
            }
            return (
              <div key={i} className={styles.slide} data-hero-slide>
                <div className={styles.staticHeroSlide}>
                  <h1 className={styles.headline}>
                    Websites that you can be <span className={styles.headlineAccent}>proud of</span>{' '}
                    without breaking the bank
                  </h1>
                  <p className={styles.subheading}>
                    From landing pages to full-stack apps — for startups, local brands, and product
                    teams. Clean code, pixel-perfect design, real results.
                  </p>
                  <a
                    href="#services"
                    className={styles.continueHint}
                    onClick={() => {
                      // ensure page scroll handoff feels natural
                      window.setTimeout(() => handoffToServices(), 0);
                    }}
                  >
                    Continue ↓
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
