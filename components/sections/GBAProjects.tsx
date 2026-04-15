'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Image from 'next/image';
import SectionHeader from '@/components/ui/SectionHeader';
import { useGameAudio } from '@/hooks/useGameAudio';
import styles from './GBAProjects.module.css';

/* ── Project Data ── */

type Project = {
  label: string;
  name: string;
  description: string;
  tech: string[];
  url: string;
  image: string;
};

const WEB_PROJECTS: Project[] = [
  {
    label: 'Client — Travel Business',
    name: 'Byaheng Palawan',
    description:
      'A travel platform for Palawan, Philippines. Curated tour packages, destination guides, and local experiences.',
    tech: ['Next.js', 'Vercel', 'Supabase', 'TailwindCSS', 'Xendit'],
    url: 'https://byahengpalawan.com',
    image: '/mockups/byahengpalawan.com.png',
  },
  {
    label: 'Client — Food Business',
    name: 'Griddle Cookies',
    description:
      "A cookie brand landing page with online ordering, menu showcase, and delivery integration.",
    tech: ['HTML/CSS/JS', 'Vercel', 'Form Integration'],
    url: 'https://griddlecookies.com',
    image: '/mockups/griddlecookies.com.png',
  },
  {
    label: 'Personal Project',
    name: 'Complex Timer',
    description:
      "The marketing site for Complex — The Athlete's Timer. A multi-mode workout timer for CrossFit and HIIT.",
    tech: ['Next.js', 'TailwindCSS', 'Vercel', 'Framer Motion'],
    url: 'https://complextimer.com',
    image: '/mockups/complextimer.com.png',
  },
  {
    label: 'Personal Project',
    name: 'Pawstify Pets',
    description:
      'The companion website for Pawstify — a pet health management app. Showcases features and beta signup.',
    tech: ['Next.js', 'Supabase', 'TailwindCSS', 'Vercel'],
    url: 'https://www.pawstifypets.com',
    image: '/mockups/pawstifypets.com.png',
  },
];

const IOS_PROJECTS: Project[] = [
  {
    label: 'App Store',
    name: 'Complex',
    description:
      'A multi-mode workout timer built for athletes. Intervals, EMOM, countdown, rounds — all in one native iOS app.',
    tech: ['Swift', 'SwiftUI', 'Core Data'],
    url: 'https://complextimer.com',
    image: '/mockups/ctios.png',
  },
  {
    label: 'Beta',
    name: 'Pawstify',
    description:
      'A pet health companion app. Track vaccinations, vet visits, medication schedules, and weight — all per pet.',
    tech: ['Swift', 'SwiftUI', 'Supabase', 'CloudKit'],
    url: 'https://pawstifypets.com',
    image: '/mockups/ppios.png',
  },
];

/* ── State Machine ── */

type GBAState =
  | { screen: 'menu'; selected: 0 | 1 }
  | { screen: 'web'; slideIndex: number }
  | { screen: 'ios'; slideIndex: number };

type GBAAction =
  | { type: 'MENU_UP' }
  | { type: 'MENU_DOWN' }
  | { type: 'CONFIRM' }
  | { type: 'BACK' }
  | { type: 'NEXT_SLIDE' }
  | { type: 'PREV_SLIDE' }
  | { type: 'RESET_TO_MENU' };

const WEB_SLIDE_COUNT = WEB_PROJECTS.length + 1;
const IOS_SLIDE_COUNT = IOS_PROJECTS.length + 1;

function gbaReducer(state: GBAState, action: GBAAction): GBAState {
  switch (action.type) {
    case 'MENU_UP':
      if (state.screen !== 'menu') return state;
      return { screen: 'menu', selected: 0 };
    case 'MENU_DOWN':
      if (state.screen !== 'menu') return state;
      return { screen: 'menu', selected: 1 };
    case 'CONFIRM': {
      if (state.screen === 'menu') {
        return state.selected === 0
          ? { screen: 'web', slideIndex: 0 }
          : { screen: 'ios', slideIndex: 0 };
      }
      const projects = state.screen === 'web' ? WEB_PROJECTS : IOS_PROJECTS;
      const maxSlide = projects.length;
      if (state.slideIndex === maxSlide) {
        return { screen: 'menu', selected: state.screen === 'web' ? 0 : 1 };
      }
      return state;
    }
    case 'BACK':
      if (state.screen === 'menu') return state;
      return { screen: 'menu', selected: state.screen === 'web' ? 0 : 1 };
    case 'RESET_TO_MENU':
      return { screen: 'menu', selected: 0 };
    case 'NEXT_SLIDE': {
      if (state.screen === 'menu') return state;
      const max = state.screen === 'web' ? WEB_SLIDE_COUNT - 1 : IOS_SLIDE_COUNT - 1;
      return { ...state, slideIndex: Math.min(state.slideIndex + 1, max) };
    }
    case 'PREV_SLIDE': {
      if (state.screen === 'menu') return state;
      return { ...state, slideIndex: Math.max(state.slideIndex - 1, 0) };
    }
    default:
      return state;
  }
}

/* ── Sub-components ── */

/* ── iOS Boot Screen ── */

function IOSBootScreen({ onComplete }: { onComplete: () => void }) {
  const [durationMs, setDurationMs] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const delay = mq.matches ? 0 : 2400;
    setDurationMs(delay);
    const timer = setTimeout(onComplete, delay);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={styles.bootScreen}
      style={{ ['--bootDurationMs' as never]: `${durationMs}ms` }}
      aria-hidden="true"
    >
      <div className={styles.bootHeader}>
        <span className={styles.bootHeaderIcon}>⟷</span>
        LINK CABLE
      </div>
      <p className={`${styles.bootLine} ${styles.bootLine1}`}>
        &gt; DETECTING DEVICE...
      </p>
      <p className={`${styles.bootLine} ${styles.bootLine2}`}>
        &gt; GBA ↔ iPHONE LINK OK
      </p>
      <p className={`${styles.bootLine} ${styles.bootLine3}`}>
        &gt; LOADING APPS
        <span className={styles.bootBarTrack}>
          <span className={styles.bootBar} />
        </span>
      </p>
    </div>
  );
}

function GBACartridge({
  state,
  projects,
}: {
  state: GBAState;
  projects: { web: Project[]; ios: Project[] };
}) {
  const isMenu = state.screen === 'menu';
  const currentProject =
    state.screen === 'web'
      ? projects.web[state.slideIndex] ?? null
      : state.screen === 'ios'
        ? projects.ios[state.slideIndex] ?? null
        : null;

  return (
    <div className={styles.cartridge} aria-hidden="true">
      <div className={styles.cartridgeLabel}>
        <div
          className={`${styles.cartridgeContent} ${
            isMenu ? '' : styles.cartridgeContentHidden
          }`}
        >
          <p className={styles.cartridgeTitle}>builditfelix</p>
          <p className={styles.cartridgeSub}>Project Portfolio</p>
        </div>
        {currentProject && (
          <div
            className={`${styles.cartridgeContent} ${
              !isMenu ? '' : styles.cartridgeContentHidden
            }`}
            style={{ position: isMenu ? 'absolute' : 'relative' }}
          >
            {state.screen === 'ios' && (
              <div className={styles.phoneBadge}>iOS App</div>
            )}
            <p className={styles.cartridgeTitle}>{currentProject.name}</p>
            <div className={styles.cartridgeTags}>
              {currentProject.tech.map((t) => (
                <span key={t} className={styles.cartridgeTag}>
                  {t}
                </span>
              ))}
            </div>
            <a
              href={currentProject.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cartridgeLink}
              tabIndex={-1}
            >
              {state.screen === 'ios' ? 'View App →' : 'Visit Site →'}
            </a>
          </div>
        )}
      </div>
      <div className={styles.cartridgeNotch} />
    </div>
  );
}

function GBAScreen({
  state,
  prevSlideRef,
  hasBootedIOS,
  onIOSBooted,
  onMenuPick,
}: {
  state: GBAState;
  prevSlideRef: React.RefObject<number | null>;
  hasBootedIOS: boolean;
  onIOSBooted: () => void;
  onMenuPick: (index: 0 | 1) => void;
}) {
  const isMenu = state.screen === 'menu';
  const isWeb = state.screen === 'web';
  const isIOS = state.screen === 'ios';
  const projects = isWeb ? WEB_PROJECTS : IOS_PROJECTS;
  const slideIndex = isMenu ? 0 : state.slideIndex;
  const totalSlides = isMenu ? 0 : projects.length + 1;
  const isBackSlide = !isMenu && slideIndex === projects.length;

  const getSlideClass = (i: number) => {
    if (i === slideIndex) return styles.slideActive;
    const prev = prevSlideRef.current ?? 0;
    return i < slideIndex || (i > prev && i !== slideIndex)
      ? styles.slideLeft
      : styles.slideRight;
  };

  return (
    <div className={styles.screen}>
      {/* Menu */}
      <div
        className={`${styles.menuScreen} ${!isMenu ? styles.menuScreenHidden : ''}`}
        role="radiogroup"
        aria-label="Choose project portfolio"
      >
        <button
          type="button"
          role="radio"
          aria-checked={isMenu && state.selected === 0}
          className={`${styles.menuItem} ${
            isMenu && state.selected === 0 ? styles.menuItemActive : styles.menuItemInactive
          }`}
          onClick={() => onMenuPick(0)}
        >
          {isMenu && state.selected === 0 && (
            <span className={styles.menuArrow} aria-hidden>
              ▶
            </span>
          )}
          Web Projects
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isMenu && state.selected === 1}
          className={`${styles.menuItem} ${
            isMenu && state.selected === 1 ? styles.menuItemActive : styles.menuItemInactive
          }`}
          onClick={() => onMenuPick(1)}
        >
          {isMenu && state.selected === 1 && (
            <span className={styles.menuArrow} aria-hidden>
              ▶
            </span>
          )}
          iOS Projects
        </button>
      </div>

      {/* Carousel */}
      <div
        className={`${styles.carouselScreen} ${
          isMenu ? styles.carouselScreenHidden : ''
        }`}
      >
        <div className={styles.slideTrack}>
          {projects.map((project, i) => (
            <div
              key={project.name}
              className={`${styles.slide} ${!isMenu ? getSlideClass(i) : styles.slideRight}`}
            >
              {isIOS ? (
                /* iOS Link Cable Mode — text info card on GBA screen, phone renders externally */
                <div className={styles.iosScreenCard}>
                  <p className={styles.iosScreenLabel}>{project.label}</p>
                  <p className={styles.iosScreenName}>{project.name}</p>
                  <p className={styles.iosScreenDesc}>{project.description}</p>
                  <div className={styles.iosScreenTags}>
                    {project.tech.map((t) => (
                      <span key={t} className={styles.iosScreenTag}>{t}</span>
                    ))}
                  </div>
                  <div className={styles.iosScreenFooter}>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.iosScreenLink}
                      aria-label={`View ${project.name} app`}
                    >
                      View App ↗
                    </a>
                    <span className={styles.iosScreenCounter}>
                      {i + 1}/{projects.length}
                    </span>
                  </div>
                </div>
              ) : (
                /* Web Screenshot Mode */
                <>
                  <Image
                    src={project.image}
                    alt={`${project.name} screenshot`}
                    width={1440}
                    height={960}
                    className={styles.slideImage}
                    sizes="(max-width: 768px) 92vw, (max-width: 1280px) 860px, 980px"
                    priority={i === 0}
                    draggable={false}
                  />
                  <div className={styles.slideOverlay}>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.slideName}
                      aria-label={`Visit ${project.name}`}
                    >
                      {project.name} ↗
                    </a>
                    <span className={styles.slideCounter}>
                      {i + 1}/{projects.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Back to menu slide */}
          <div
            className={`${styles.backSlide} ${styles.slide} ${
              !isMenu && isBackSlide ? styles.slideActive : styles.slideRight
            }`}
          >
            <span className={styles.backSlideLabel}>Back to Menu</span>
            <span className={styles.backSlideHint}>Press A or Enter</span>
          </div>
        </div>

        {!isMenu && totalSlides > 0 && (
          <div className={styles.slideOverlay} style={{ pointerEvents: 'none' }}>
            <span />
            <span className={styles.slideCounter}>
              {slideIndex + 1}/{totalSlides}
            </span>
          </div>
        )}
      </div>

      {/* iOS Link Cable boot sequence — overlays on first iOS entry */}
      {isIOS && !hasBootedIOS && (
        <IOSBootScreen onComplete={onIOSBooted} />
      )}
    </div>
  );
}

/* ── Main Component ── */

export default function GBAProjects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevSlideRef = useRef<number | null>(null);
  const [state, dispatch] = useReducer(gbaReducer, { screen: 'menu', selected: 0 });
  const { playSound, ensureAudio, isMuted, toggleMute } = useGameAudio();
  const [isMobile, setIsMobile] = useState(false);
  const [hasBootedIOS, setHasBootedIOS] = useState(false);
  const prevScreen = useRef(state.screen);

  /* Convenience action dispatcher with audio */
  const act = useCallback(
    (action: GBAAction, sound: Parameters<typeof playSound>[0] = 'navigate') => {
      void ensureAudio();
      void playSound(sound);
      dispatch(action);
    },
    [dispatch, ensureAudio, playSound],
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  /* Reset iOS boot flag each time user leaves the iOS screen */
  useEffect(() => {
    if (prevScreen.current === 'ios' && state.screen === 'menu') {
      setHasBootedIOS(false);
    }
    prevScreen.current = state.screen;
  }, [state.screen]);

  const handleIOSBooted = useCallback(() => setHasBootedIOS(true), []);

  const handleMenuPick = useCallback(
    (index: 0 | 1) => {
      if (state.screen !== 'menu') return;
      if (index === 0) act({ type: 'MENU_UP' });
      else act({ type: 'MENU_DOWN' });
    },
    [act, state.screen],
  );

  const iosActive = state.screen === 'ios' && hasBootedIOS;

  const iosPhoneProject = useMemo(() => {
    if (state.screen !== 'ios' || !hasBootedIOS) return null;
    return IOS_PROJECTS[state.slideIndex] ?? null;
  }, [state, hasBootedIOS]);

  const slideIndex = state.screen !== 'menu' ? state.slideIndex : null;
  useEffect(() => {
    if (slideIndex !== null) {
      prevSlideRef.current = slideIndex;
    }
  }, [slideIndex]);

  const currentProject = useMemo(() => {
    if (state.screen === 'web') return WEB_PROJECTS[state.slideIndex] ?? null;
    if (state.screen === 'ios') return IOS_PROJECTS[state.slideIndex] ?? null;
    return null;
  }, [state]);

  const liveText = useMemo(() => {
    if (state.screen === 'menu') {
      return state.selected === 0 ? 'Menu. Web Projects selected.' : 'Menu. iOS Projects selected.';
    }
    const projects = state.screen === 'web' ? WEB_PROJECTS : IOS_PROJECTS;
    const proj = projects[state.slideIndex];
    if (proj) {
      return `${state.screen === 'web' ? 'Web' : 'iOS'} Projects. ${proj.name}. ${state.slideIndex + 1} of ${projects.length}.`;
    }
    return 'Back to Menu.';
  }, [state]);

  /* Keyboard handler */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      let action: GBAAction | null = null;
      let sound: Parameters<typeof playSound>[0] = 'navigate';

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          action = { type: 'MENU_UP' };
          break;
        case 'ArrowDown':
          e.preventDefault();
          action = { type: 'MENU_DOWN' };
          break;
        case 'ArrowLeft':
          e.preventDefault();
          action = { type: 'PREV_SLIDE' };
          break;
        case 'ArrowRight':
          e.preventDefault();
          action = { type: 'NEXT_SLIDE' };
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          action = { type: 'CONFIRM' };
          sound = 'select';
          break;
        case 'Escape':
          e.preventDefault();
          action = { type: 'BACK' };
          sound = 'back';
          break;
      }

      if (action) {
        void ensureAudio();
        void playSound(sound);
        dispatch(action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ensureAudio, playSound]);

  /* Mobile touch: swipe */
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(dx) < 40) return;
      void ensureAudio();
      if (dx < 0) {
        void playSound('navigate');
        dispatch({ type: 'NEXT_SLIDE' });
      } else {
        void playSound('navigate');
        dispatch({ type: 'PREV_SLIDE' });
      }
    },
    [ensureAudio, playSound],
  );

  return (
    <section id="projects" className={styles.section}>
      <SectionHeader label="// 03 — Projects">
        <span className="text-orange">Projects</span>
      </SectionHeader>

      <div
        ref={containerRef}
        className={`${styles.gbaWrapper} ${iosActive ? styles.gbaWrapperIOSActive : ''}`}
        role="application"
        aria-label="Game Boy Advance project explorer"
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Live region for screen readers */}
        <div className={styles.liveRegion} aria-live="polite" role="status">
          {liveText}
        </div>

        {/* GBA Side */}
        <div className={styles.gbaSection}>

          <div className={styles.deviceFrame}>

            {/* Cartridge */}
            <GBACartridge state={state} projects={{ web: WEB_PROJECTS, ios: IOS_PROJECTS }} />

            {/* Console Body */}
            <div className={styles.console}>

            {/* ── Shoulder buttons strip ── */}
            <div className={styles.shoulders}>
              <button
                type="button"
                className={styles.shoulderL}
                aria-label="L shoulder button — navigate left"
                onClick={() => act({ type: 'PREV_SLIDE' })}
              >
                L
              </button>
              <button
                type="button"
                className={styles.shoulderR}
                aria-label="R shoulder button — navigate right"
                onClick={() => act({ type: 'NEXT_SLIDE' })}
              >
                R
              </button>
            </div>

            {/* ── 3-column main row ── */}
            <div className={styles.mainRow}>

              {/* LEFT: D-pad + Start/Select */}
              <div className={styles.leftPanel}>
                <div className={styles.dpad}>
                  <div className={styles.dpadCenter} aria-hidden="true" />
                  <button
                    type="button"
                    className={`${styles.dpadBtn} ${styles.dpadUp}`}
                    aria-label="Navigate up"
                    onClick={() => act({ type: 'MENU_UP' })}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className={`${styles.dpadBtn} ${styles.dpadDown}`}
                    aria-label="Navigate down"
                    onClick={() => act({ type: 'MENU_DOWN' })}
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    className={`${styles.dpadBtn} ${styles.dpadLeft}`}
                    aria-label="Navigate left"
                    onClick={() => act({ type: 'PREV_SLIDE' })}
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    className={`${styles.dpadBtn} ${styles.dpadRight}`}
                    aria-label="Navigate right"
                    onClick={() => act({ type: 'NEXT_SLIDE' })}
                  >
                    ▶
                  </button>
                </div>
                {/* Start / Select — lower-left, matches reference */}
                <div className={styles.leftMeta}>
                  <button
                    type="button"
                    className={`${styles.metaBtn} ${styles.metaBtnSelect}`}
                    aria-label="Select — go back"
                    onClick={() => act({ type: 'BACK' }, 'back')}
                  >
                    SELECT
                  </button>
                  <button
                    type="button"
                    className={`${styles.metaBtn} ${styles.metaBtnStart}`}
                    aria-label="Start — return to main menu"
                    onClick={() => act({ type: 'RESET_TO_MENU' }, 'select')}
                  >
                    START
                  </button>
                </div>
              </div>

              {/* CENTER: Screen bezel */}
              <div className={styles.centerPanel}>
                <div className={styles.screenBezel}>
                  <GBAScreen
                    state={state}
                    prevSlideRef={prevSlideRef}
                    hasBootedIOS={hasBootedIOS}
                    onIOSBooted={handleIOSBooted}
                    onMenuPick={handleMenuPick}
                  />
                </div>
              </div>

              {/* RIGHT: Power LED + A/B buttons + speaker dots */}
              <div className={styles.rightPanel}>
                <div className={styles.powerRow} aria-hidden="true">
                  <div className={styles.powerLed} />
                  <span className={styles.powerLabel}>Power</span>
                </div>
                <div className={styles.abGroup}>
                  <button
                    type="button"
                    className={`${styles.abBtn} ${styles.btnA}`}
                    aria-label="Confirm selection"
                    onClick={() => act({ type: 'CONFIRM' }, 'select')}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    className={`${styles.abBtn} ${styles.btnB}`}
                    aria-label="Go back"
                    onClick={() => act({ type: 'BACK' }, 'back')}
                  >
                    B
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.gbaMuteBtn}
                  aria-pressed={isMuted}
                  aria-label={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
                <div className={styles.speakerDots} aria-hidden="true" />
              </div>
            </div>

            </div>

          {/* Mobile controls */}
          {isMobile && (
            <>
              <div className={styles.mobileControls}>
                <button
                  type="button"
                  className={styles.mobileControlBtn}
                  aria-label="Previous"
                  onClick={() => {
                    void ensureAudio();
                    void playSound('navigate');
                    dispatch({ type: 'PREV_SLIDE' });
                  }}
                >
                  ◀
                </button>
                <button
                  type="button"
                  className={styles.mobileControlBtn}
                  aria-label="Go back"
                  onClick={() => {
                    void ensureAudio();
                    void playSound('back');
                    dispatch({ type: 'BACK' });
                  }}
                >
                  B
                </button>
                <button
                  type="button"
                  className={styles.mobileControlBtn}
                  aria-label="Confirm"
                  onClick={() => {
                    void ensureAudio();
                    void playSound('select');
                    dispatch({ type: 'CONFIRM' });
                  }}
                >
                  A
                </button>
                <button
                  type="button"
                  className={styles.mobileControlBtn}
                  aria-label="Next"
                  onClick={() => {
                    void ensureAudio();
                    void playSound('navigate');
                    dispatch({ type: 'NEXT_SLIDE' });
                  }}
                >
                  ▶
                </button>
              </div>
              <div className={styles.mobileControlsExtra}>
                <button
                  type="button"
                  className={styles.mobileControlBtn}
                  aria-label="Return to main menu"
                  onClick={() => act({ type: 'RESET_TO_MENU' }, 'select')}
                  style={{ fontSize: '11px', fontFamily: 'var(--font-jetbrains), monospace' }}
                >
                  Home
                </button>
                <button
                  type="button"
                  className={styles.mobileControlBtn}
                  aria-pressed={isMuted}
                  aria-label={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
                  onClick={toggleMute}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
              </div>
            </>
          )}

          {/* Mobile project info drawer */}
          {isMobile && currentProject && (
            <div className={styles.mobileInfo}>
              <p className={styles.mobileInfoTitle}>{currentProject.name}</p>
              <p className={styles.mobileInfoDesc}>{currentProject.description}</p>
              <div className={styles.mobileInfoTags}>
                {currentProject.tech.map((t) => (
                  <span key={t} className="tech-tag">
                    {t}
                  </span>
                ))}
              </div>
              <a
                href={currentProject.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mobileInfoLink}
              >
                Visit Site →
              </a>
            </div>
          )}

          </div>

        </div>

        {/* iOS Phone Panel — slides in from right on desktop when iosActive */}
        {!isMobile && (
          <div
            className={`${styles.iosPhonePanel} ${iosActive ? styles.iosPhonePanelActive : ''}`}
            aria-hidden={!iosActive}
          >
            {iosPhoneProject && (
              <div className={styles.phoneFrameLarge}>
                <div className={styles.phoneScreenAreaLarge}>
                  <Image
                    src={iosPhoneProject.image}
                    alt={`${iosPhoneProject.name} iOS app`}
                    fill
                    className={styles.phoneImageLarge}
                    sizes="(max-width: 1100px) 280px, 320px"
                    draggable={false}
                  />
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
