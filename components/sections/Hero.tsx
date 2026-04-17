'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './Hero.module.css';
import { useKeyboardAudio, type KeyKind } from '@/hooks/useKeyboardAudio';

// ─── Helpers ────────────────────────────────────────────────────────────────
function classifyChar(ch: string): KeyKind {
  if (ch === ' ') return 'space';
  if (/[.,;:!?—-]/.test(ch)) return 'punct';
  if (ch === '\n') return 'enter';
  return 'char';
}

function typingDelayForChar(ch: string): number {
  // Base cadence with per-char jitter + small pauses for rhythm.
  const base = 55 + Math.random() * 25; // 55–80 ms
  const jitter = (Math.random() * 2 - 1) * 20;
  let pause = 0;
  if (ch === ' ') pause = 30;
  else if (/[.,—]/.test(ch)) pause = 120;
  else if (/[;:!?]/.test(ch)) pause = 90;
  return Math.max(30, base + jitter + pause);
}

// ─── TypedLine ──────────────────────────────────────────────────────────────
/**
 * Auto-types `text` character-by-character whenever `active` is true.
 * Resets when `active` flips false so re-entering the slide re-types it.
 * Fires `onChar(kind)` per keystroke for audio. Respects reduced motion.
 */
function TypedLine({
  text,
  active,
  className,
  onChar,
  reducedMotion,
  showFinalCaret,
}: {
  text: string;
  active: boolean;
  className?: string;
  onChar?: (kind: KeyKind) => void;
  reducedMotion: boolean;
  showFinalCaret?: boolean;
}) {
  const [typed, setTyped] = useState('');
  const timeoutRef = useRef<number | null>(null);
  const onCharRef = useRef(onChar);
  onCharRef.current = onChar;

  useEffect(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!active) {
      // Reset so re-entering re-types from scratch.
      setTyped('');
      return;
    }

    if (reducedMotion) {
      setTyped(text);
      return;
    }

    // Slight lead-in so the slide is visually settled before keys fire.
    let i = 0;
    setTyped('');

    const typeNext = () => {
      if (i >= text.length) {
        timeoutRef.current = null;
        return;
      }
      const ch = text.charAt(i);
      i += 1;
      setTyped(text.slice(0, i));
      onCharRef.current?.(classifyChar(ch));
      timeoutRef.current = window.setTimeout(typeNext, typingDelayForChar(ch));
    };

    timeoutRef.current = window.setTimeout(typeNext, 180);

    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [active, text, reducedMotion]);

  const done = typed.length >= text.length;
  const caretVisible = active && (!done || showFinalCaret);

  return (
    <p
      className={`${styles.scrollLineSlide} ${styles.typedLine} ${className ?? ''}`.trim()}
      aria-label={text}
    >
      <span aria-hidden>{typed}</span>
      {caretVisible && (
        <span
          aria-hidden
          className={`${styles.caret} ${!done ? styles.caretTyping : ''}`.trim()}
        >
          ▌
        </span>
      )}
    </p>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────
export default function Hero() {
  const glowRef = useRef<HTMLDivElement>(null);
  const heroScrollerRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [index, setIndex] = useState(0);

  const { playKey, ensureAudio, isMuted, toggleMute } = useKeyboardAudio();

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

  // First-gesture audio unlock. AudioContext cannot play until the user
  // initiates a gesture — any of wheel / touch / keydown on the scroller
  // qualifies, and scrolling is the primary way to interact here.
  const gestureUnlockedRef = useRef(false);
  const unlockAudio = useCallback(() => {
    if (gestureUnlockedRef.current) return;
    gestureUnlockedRef.current = true;
    void ensureAudio();
  }, [ensureAudio]);

  useEffect(() => {
    if (reducedMotion) return;
    const el = heroScrollerRef.current;
    if (!el) return;

    // Safety net for external scroll sources (scrollbar drag, momentum).
    // Skipped while `lockRef` is held by our own step() — otherwise the
    // native smooth-scroll animation fires intermediate 'scroll' events
    // that would toggle `index` mid-transition, which in turn would flip
    // TypedLine's `active` back and forth and cancel the pending typing
    // timer before it ever gets to fire. Guarding with lockRef lets the
    // typing effect see a clean active=true edge.
    const onScroll = () => {
      if (lockRef.current) return;
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

      {!reducedMotion && (
        <button
          type="button"
          className={styles.muteBtn}
          aria-pressed={isMuted}
          aria-label={isMuted ? 'Unmute keyboard sounds' : 'Mute keyboard sounds'}
          onClick={toggleMute}
        >
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
      )}

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

            unlockAudio();

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
            unlockAudio();
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
              unlockAudio();
              step(1);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
              e.preventDefault();
              unlockAudio();
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
              const isFinalLine = i === lastIndex - 1;
              return (
                <div key={i} className={styles.slide} data-hero-slide>
                  <TypedLine
                    text={s.text}
                    active={index === i}
                    className={s.className}
                    onChar={playKey}
                    reducedMotion={reducedMotion}
                    showFinalCaret={isFinalLine}
                  />
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
