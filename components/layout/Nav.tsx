'use client';

/**
 * components/layout/Nav.tsx
 *
 * Sticky nav with scroll-triggered backdrop blur + border.
 * Under 768px: hamburger opens a Framer Motion panel with the same mono links.
 */

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { BOOKING_URL } from '@/lib/constants';

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
] as const;

const linkClass =
  'relative font-mono font-medium uppercase no-underline transition-colors duration-300 group';

const linkStyle: CSSProperties = {
  fontSize: '12px',
  letterSpacing: '1.5px',
  color: 'var(--text-dim)',
};

const bookCallClass =
  'font-mono font-semibold uppercase no-underline inline-flex items-center justify-center ' +
  'rounded-[6px] px-4 py-2.5 transition-all duration-300 ' +
  'bg-[var(--orange)] text-[var(--dark)] border-0 ' +
  'hover:bg-[var(--orange-bright)] hover:shadow-[0_0_24px_rgba(255,128,0,0.35)] hover:-translate-y-0.5 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--orange)] focus-visible:outline-offset-2';

const bookCallStyle: CSSProperties = {
  fontSize: '12px',
  letterSpacing: '1.5px',
};

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      className={linkClass}
      style={linkStyle}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--orange)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
      onClick={onNavigate}
    >
      {label}
      <span
        className="absolute left-0 bottom-[-4px] h-[2px] w-0 transition-all duration-300 group-hover:w-full md:group-hover:w-full"
        style={{ background: 'var(--orange)' }}
      />
    </Link>
  );
}

function BookCallLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={bookCallClass}
      style={bookCallStyle}
      onClick={onNavigate}
    >
      Book a call
    </a>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia('(min-width: 768px)').matches) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        id="navbar"
        className="fixed top-0 left-0 right-0 z-[100] flex justify-between items-center transition-all duration-400 px-5 sm:px-8 md:px-10"
        style={{
          paddingTop: scrolled ? 14 : 20,
          paddingBottom: scrolled ? 14 : 20,
          background: scrolled ? 'rgba(10,10,12,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(255,128,0,0.08)'
            : '1px solid transparent',
        }}
      >
        <Link
          href="#"
          className="font-display no-underline tracking-[2px]"
          style={{ fontSize: '20px', color: 'var(--orange)' }}
          onClick={closeMenu}
        >
          builditfelix
        </Link>

        <ul className="hidden md:flex gap-8 list-none m-0 p-0 items-center">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <NavLink href={href} label={label} />
            </li>
          ))}
          <li>
            <BookCallLink />
          </li>
        </ul>

        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center gap-[5px] w-10 h-10 rounded border border-transparent hover:border-[rgba(255,128,0,0.2)] bg-transparent cursor-pointer"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-panel"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <motion.span
            className="block w-5 h-0.5 rounded-full origin-center"
            style={{ background: 'var(--orange)' }}
            animate={
              menuOpen
                ? { rotate: 45, y: 7 }
                : { rotate: 0, y: 0 }
            }
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-5 h-0.5 rounded-full"
            style={{ background: 'var(--orange)' }}
            animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="block w-5 h-0.5 rounded-full origin-center"
            style={{ background: 'var(--orange)' }}
            animate={
              menuOpen
                ? { rotate: -45, y: -7 }
                : { rotate: 0, y: 0 }
            }
            transition={{ duration: 0.2 }}
          />
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav-panel"
            className="fixed inset-x-0 top-0 z-[99] md:hidden pt-[72px] pb-8 px-5 sm:px-8"
            style={{
              background: 'rgba(10,10,12,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,128,0,0.12)',
            }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.ul
              className="flex flex-col gap-6 list-none m-0 p-0"
              initial="hidden"
              animate="show"
              variants={{
                show: { transition: { staggerChildren: 0.06 } },
                hidden: {},
              }}
            >
              {NAV_LINKS.map(({ label, href }) => (
                <motion.li
                  key={label}
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    show: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink href={href} label={label} onNavigate={closeMenu} />
                </motion.li>
              ))}
              <motion.li
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  show: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <BookCallLink onNavigate={closeMenu} />
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
