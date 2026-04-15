'use client';

/**
 * components/sections/Services.tsx
 *
 * Scroll-driven Pac-Man services timeline + compare grid.
 */

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import { useGameAudio } from '@/hooks/useGameAudio';
import { ScrollTrigger } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import styles from './Services.module.css';

const SERVICES = [
  {
    name: 'Landing Page',
    price: '₱8,000 – ₱15,000',
    description:
      'Single-page site with 1 clear goal — book, contact, or buy. Mobile-optimized, fast load, contact form.',
    analogy: 'Like a tarpaulin sign — one message, one goal, one call to action.',
    includes: ['Single Page', 'Mobile-Optimized', 'Contact Form', 'Fast Load'],
  },
  {
    name: 'Marketing Website',
    price: '₱15,000+',
    description:
      '3 or more page website. Full brand story, service pages, SEO-ready structure, Google Analytics setup.',
    analogy:
      'A full showroom — organized sections, a brand story, and a path that guides visitors toward a decision.',
    includes: ['3+ Pages', 'SEO-Ready', 'Brand Story', 'Analytics'],
  },
  {
    name: 'E-Commerce Store',
    price: '₱50,000 – ₱100,000',
    description:
      'Product catalog, shopping cart, payment gateway integration, and order management.',
    analogy:
      'Adds a cashier and inventory system — payments, orders, and stock management that work 24/7.',
    includes: ['Product Catalog', 'Cart & Checkout', 'Payment Gateway', 'Order Management'],
  },
  {
    name: 'Web Application',
    price: '₱50,000+',
    description:
      'Custom-built system: user accounts, dashboards, booking engines, databases. Scoped per project.',
    analogy:
      'The entire back office — custom logic, user accounts, dashboards, and tools your business runs on daily.',
    includes: ['User Accounts', 'Dashboards', 'Custom Logic', 'Database'],
  },
  {
    name: 'Website Redesign',
    price: 'Project Dependent',
    description:
      'Revamp or improve an existing site. Assessed during the discovery call with a quote based on scope.',
    analogy: 'Renovation, not demolition — we keep what works and rebuild what doesn’t.',
    includes: ['Site Audit', 'UX Improvements', 'Modern Stack', 'Performance Boost'],
  },
  {
    name: 'SEO & AI Assessment',
    price: 'Project Dependent',
    description:
      'One-time audit of search visibility and AI readiness: technical SEO, structured data, entity signals, on-page quality, and how well your content is positioned for search engines and AI-generated answers.',
    analogy:
      'A full diagnostic — what humans and machines see when they look you up, and a clear fix list.',
    includes: ['Technical SEO', 'Schema & Entities', 'AI Discoverability', 'Prioritized Plan'],
  },
  {
    name: 'Search Engine & AI Optimization',
    price: '₱3,000+',
    description:
      'Ongoing optimization for traditional search and AI-driven discovery: content and IA updates, entity consistency, performance of key pages, and reporting on rankings, traffic, and AI-surface visibility where applicable.',
    analogy:
      'Training camp for your site — steady reps so you stay visible as search and AI results evolve.',
    includes: ['Monthly Reports', 'Search + AI Content', 'On-Page Updates', 'Recommendations'],
  },
  {
    name: 'Maintenance Plans',
    price: '₱3,000 – ₱10,000/mo',
    description:
      'Uptime monitoring, content updates, bug fixes, dependency updates. Flexible monthly plans, no lock-in.',
    analogy: 'Your website’s caretaker — someone watching over it so you don’t have to.',
    includes: ['Uptime Monitoring', 'Bug Fixes', 'Content Updates', 'Priority Support'],
  },
] as const;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function dotTopPercent(i: number, count: number): number {
  if (count <= 1) return 50;
  return (i / (count - 1)) * 100;
}

function hashStringToInt(input: string): number {
  // Fast, deterministic, non-crypto hash (FNV-1a 32-bit).
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

const HORIZONTAL_TRACK_MQ = '(max-width: 900px)';

function subscribeHorizontalTrack(callback: () => void) {
  const mq = window.matchMedia(HORIZONTAL_TRACK_MQ);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getHorizontalTrackSnapshot() {
  return window.matchMedia(HORIZONTAL_TRACK_MQ).matches;
}

function getHorizontalTrackServerSnapshot() {
  return false;
}

function formatStartsAt(price: string): string {
  const raw = price.trim();
  if (/project\s*dependent/i.test(raw)) return 'Project dependent';

  // Normalize dash types and remove right-side of ranges.
  const normalized = raw.replace(/–/g, '-').replace(/\s+/g, ' ');
  const left = normalized.split('-')[0]?.trim() ?? normalized;

  // Drop trailing plus
  let out = left.replace(/\+$/g, '').trim();
  // Normalize /mo+ -> /mo
  out = out.replace(/\/mo\+$/i, '/mo');

  return `Starts at ${out}`;
}

function Pacman({
  className,
  animate,
}: {
  className?: string;
  animate?: boolean;
}) {
  const makeWedge = (deg: number) => {
    const a = deg * (Math.PI / 180);
    const r = 46;
    const cx = 50;
    const cy = 50;
    const x1 = cx + r * Math.cos(a);
    const y1 = cy - r * Math.sin(a);
    const x2 = cx + r * Math.cos(-a);
    const y2 = cy - r * Math.sin(-a);
    return `M ${cx} ${cy} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 1 0 ${x2.toFixed(
      3,
    )} ${y2.toFixed(3)} Z`;
  };

  const openD = makeWedge(34);
  const closedD = makeWedge(12);

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      role="presentation"
      aria-hidden
      focusable="false"
    >
      <path d={openD} className={`${styles.pacBody} ${animate ? styles.pacOpen : styles.pacStatic}`} />
      <path
        d={closedD}
        className={`${styles.pacBody} ${animate ? styles.pacClosed : styles.pacHidden}`}
      />
    </svg>
  );
}

type GhostVars = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  dur: number;
  delay: number;
  scale: number;
  opacity: number;
  hue: number;
};

function Ghost({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 64 64"
      role="presentation"
      aria-hidden
      focusable="false"
    >
      <path
        d="M32 6c-10.5 0-19 8.5-19 19v30c0 2.3 2.6 3.6 4.4 2.2l3.2-2.5c1-.8 2.4-.8 3.4 0l3.2 2.5c1 .8 2.4.8 3.4 0l3.2-2.5c1-.8 2.4-.8 3.4 0l3.2 2.5c1 .8 2.4.8 3.4 0l3.2-2.5c1-.8 2.4-.8 3.4 0l3.2 2.5c1.8 1.4 4.4.1 4.4-2.2V25C51 14.5 42.5 6 32 6Z"
        className={styles.ghostBody}
      />
      <circle cx="24" cy="28" r="5.5" className={styles.ghostEyeWhite} />
      <circle cx="40" cy="28" r="5.5" className={styles.ghostEyeWhite} />
      <circle cx="26" cy="29" r="2.3" className={styles.ghostEyePupil} />
      <circle cx="42" cy="29" r="2.3" className={styles.ghostEyePupil} />
    </svg>
  );
}

export default function Services() {
  const titleId = useId();
  const seedId = useId();
  const { playSound, ensureAudio, isMuted, toggleMute } = useGameAudio();
  const sceneRef = useRef<HTMLElement>(null);
  const narrativeRef = useRef<ScrollTrigger | null>(null);

  const [reduceMotion, setReduceMotion] = useState(false);
  const [step, setStep] = useState(0); // 0..SERVICES.length (last step shows grid)
  const [scrollDir, setScrollDir] = useState<1 | -1>(1);
  const isHorizontalTrack = useSyncExternalStore(
    subscribeHorizontalTrack,
    getHorizontalTrackSnapshot,
    getHorizontalTrackServerSnapshot,
  );
  const prevStepRef = useRef(0);
  const prevFloorRef = useRef(0);
  const chompBurstTimeoutsRef = useRef<number[]>([]);
  const playSoundRef = useRef(playSound);
  const ensureAudioRef = useRef(ensureAudio);
  const reduceMotionRef = useRef(reduceMotion);

  playSoundRef.current = playSound;
  ensureAudioRef.current = ensureAudio;
  reduceMotionRef.current = reduceMotion;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      if (reduceMotion) return;
      const scene = sceneRef.current;
      if (!scene) return;

      const totalSteps = SERVICES.length + 1; // 9th dot = grid pop-up

      const narrativeST = ScrollTrigger.create({
        trigger: scene,
        start: 'top top',
        end: () => `+=${window.innerHeight * totalSteps}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          const p = self.progress * totalSteps;
          prevFloorRef.current = Math.min(SERVICES.length, Math.floor(p));
        },
        onUpdate: (self) => {
          const p = self.progress * totalSteps;
          const nextStep = Math.min(SERVICES.length, Math.floor(p));
          const prevFloor = prevFloorRef.current;

          if (nextStep !== prevFloor) {
            if (nextStep > prevFloor && !reduceMotionRef.current) {
              const delta = nextStep - prevFloor;
              if (delta > 1) {
                chompBurstTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
                chompBurstTimeoutsRef.current = [];
                const staggerMs = 95;
                for (let i = 1; i < delta; i += 1) {
                  const id = window.setTimeout(() => {
                    void ensureAudioRef.current();
                    void playSoundRef.current('chomp');
                  }, i * staggerMs);
                  chompBurstTimeoutsRef.current.push(id);
                }
              }
            }
            prevFloorRef.current = nextStep;
          }

          setStep(nextStep);
          const dir = self.direction === -1 ? -1 : 1;
          setScrollDir(dir);
        },
      });
      narrativeRef.current = narrativeST;

      return () => {
        chompBurstTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
        chompBurstTimeoutsRef.current = [];
        narrativeRef.current = null;
        narrativeST.kill();
      };
    },
    { scope: sceneRef, dependencies: [reduceMotion] },
  );

  useEffect(() => {
    if (reduceMotion) return;

    const prev = prevStepRef.current;
    if (step === prev) return;
    prevStepRef.current = step;

    if (step < 1 || step > SERVICES.length) return;
    if (step <= prev) return;

    void ensureAudio();
    void playSound('chomp');
  }, [ensureAudio, playSound, reduceMotion, step]);

  const activeIndex = Math.max(0, Math.min(SERVICES.length - 1, step));
  const activeService = SERVICES[activeIndex];
  const overlayActive = step >= SERVICES.length;
  const dotCount = SERVICES.length + 1;
  const totalStops = dotCount;

  const pacPos = useMemo(() => {
    // step 0 = just above the first dot, otherwise align to current dot (incl. finale dot)
    if (step <= 0) return Math.max(0, dotTopPercent(0, dotCount) - 10);
    const dotIdx = Math.max(0, Math.min(dotCount - 1, step));
    return dotTopPercent(dotIdx, dotCount);
  }, [dotCount, step]);

  const pacRotDeg = useMemo(() => {
    if (isHorizontalTrack) {
      return scrollDir === -1 ? '180deg' : '0deg';
    }
    return scrollDir === -1 ? '-90deg' : '90deg';
  }, [isHorizontalTrack, scrollDir]);

  const ghosts = useMemo((): GhostVars[] => {
    const base = hashStringToInt(seedId);
    const rnd = mulberry32(base ^ 0x9e3779b9);
    const count = 7;

    return Array.from({ length: count }).map((_, i) => {
      const x = clamp(rnd() * 100, 6, 94);
      const y = clamp(rnd() * 100, 10, 90);
      // Bias movement to feel like "floating" more than ping-pong.
      const dx = (rnd() * 2 - 1) * (18 + rnd() * 26);
      const dy = (rnd() * 2 - 1) * (18 + rnd() * 26);
      const dur = 12 + rnd() * 16;
      const delay = -rnd() * dur;
      const scale = 0.7 + rnd() * 0.6;
      const opacity = 0.12 + rnd() * 0.14;
      const hue = (i * 58 + rnd() * 18) % 360;

      return { x, y, dx, dy, dur, delay, scale, opacity, hue };
    });
  }, [seedId]);

  const scrollToStop = (stopIndex: number) => {
    const st = narrativeRef.current;
    if (!st) return;
    const idx = clamp(stopIndex, 0, totalStops - 1);
    const top = st.start + window.innerHeight * idx + 2;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section ref={sceneRef} id="services" className={styles.servicesSection}>
      <div className={styles.inner}>
        <SectionHeader label="// 02 — Services">
          <span className="text-orange">Services</span>
        </SectionHeader>

        <div className={styles.scrollScene} aria-label="Services">
          {reduceMotion && (
            <div className={styles.reduceWrap}>
              <p className={styles.reduceIntro}>
                Quick overview of services. Motion is reduced based on your system setting.
              </p>

              <div className={styles.reduceList}>
                {SERVICES.map((s) => (
                  <details key={s.name} className={styles.reduceItem}>
                    <summary className={styles.reduceSummary}>
                      <span className={styles.reduceName}>{s.name}</span>
                      <span className={styles.reducePrice}>{formatStartsAt(s.price)}</span>
                    </summary>
                    <div className={styles.reduceBody}>
                      <p className={styles.reduceDesc}>{s.description}</p>
                      <p className={styles.reduceAnalogy}>{s.analogy}</p>
                      <div className={styles.reduceTags}>
                        {s.includes.map((item) => (
                          <span key={item} className="tech-tag">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>

              <div className={styles.gridPanel} aria-live="polite">
                <div className={styles.gridPanelHeader}>
                  <h3 className={styles.gridPanelTitle}>Compare options</h3>
                </div>
                <div className={styles.gridPanelGrid}>
                  {SERVICES.map((s) => (
                    <article key={s.name} className={styles.gridMiniCard}>
                      <h4 className={styles.gridMiniName}>{s.name}</h4>
                      <p className={styles.gridMiniPrice}>{formatStartsAt(s.price)}</p>
                      <p className={styles.gridMiniDesc}>{s.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!reduceMotion && (
            <>
              <div className={styles.ghostsLayer} aria-hidden>
                {ghosts.map((g, idx) => (
                  <Ghost
                    key={`ghost-${idx}`}
                    className={styles.ghost}
                    style={
                      {
                        ['--gx' as any]: `${g.x}%`,
                        ['--gy' as any]: `${g.y}%`,
                        ['--gdx' as any]: `${g.dx}px`,
                        ['--gdy' as any]: `${g.dy}px`,
                        ['--gdur' as any]: `${g.dur}s`,
                        ['--gdelay' as any]: `${g.delay}s`,
                        ['--gscale' as any]: g.scale,
                        ['--gop' as any]: g.opacity,
                        ['--ghue' as any]: g.hue,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>

              <div className={styles.sceneMain}>
            <div className={styles.trackCol} aria-hidden>
              <div className={styles.verticalTrack}>
                {Array.from({ length: dotCount }).map((_, i) => {
                  const eaten = step >= i;
                  return (
                    <div
                      key={`dot-${i}`}
                      className={`${styles.dot} ${eaten ? styles.dotEaten : ''}`}
                      style={
                        {
                          ['--pos' as any]: `${dotTopPercent(i, dotCount)}%`,
                        } as React.CSSProperties
                      }
                    />
                  );
                })}
                <div
                  className={styles.pacmanWrap}
                  style={
                    {
                      ['--pacPos' as any]: `${pacPos}%`,
                      ['--pacRot' as any]: pacRotDeg,
                    } as React.CSSProperties
                  }
                  aria-hidden
                >
                  <Pacman className={styles.pacmanSvg} animate={!reduceMotion} />
                </div>
              </div>
            </div>

            <div className={styles.cardCol}>
              <button
                type="button"
                className={styles.muteBtn}
                aria-pressed={isMuted}
                aria-label={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
                onClick={toggleMute}
              >
                {isMuted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>

              {!overlayActive ? (
                <div className={styles.stickyCard} aria-live="polite">
                  <div className={styles.controlsRow}>
                    <button
                      type="button"
                      className={styles.navBtn}
                      onClick={() => scrollToStop(step - 1)}
                      disabled={step <= 0}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className={styles.navBtn}
                      onClick={() => scrollToStop(step + 1)}
                      disabled={step >= SERVICES.length}
                    >
                      Next
                    </button>
                    <button
                      type="button"
                      className={styles.navBtnAlt}
                      onClick={() => scrollToStop(SERVICES.length)}
                    >
                      Overview
                    </button>
                  </div>
                  <h3 id={titleId} className={styles.stickyName}>
                    {activeService.name}
                  </h3>
                  <p className={styles.stickyPrice}>{formatStartsAt(activeService.price)}</p>
                  <p className={styles.stickyDesc}>{activeService.description}</p>
                  <p className={styles.stickyAnalogy}>{activeService.analogy}</p>
                  <div className={styles.stickyIncludes}>
                    {activeService.includes.map((item) => (
                      <span key={item} className="tech-tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.gridPanel} aria-live="polite">
                  <div className={styles.gridPanelHeader}>
                    <h3 className={styles.gridPanelTitle}>Compare options</h3>
                  </div>
                  <div className={styles.gridPanelGrid}>
                    {SERVICES.map((s) => (
                      <article key={s.name} className={styles.gridMiniCard}>
                        <h4 className={styles.gridMiniName}>{s.name}</h4>
                        <p className={styles.gridMiniPrice}>{formatStartsAt(s.price)}</p>
                        <p className={styles.gridMiniDesc}>{s.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
