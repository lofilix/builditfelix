'use client';

/**
 * components/sections/About.tsx
 *
 * Two-column layout: "LOADOUT" stat-sheet panel left, bio right.
 * The loadout panel replaces the old pixel avatar and presents the
 * tech stack as numbered inventory slots with a rotating EQUIPPED pip.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import SectionHeader from '@/components/ui/SectionHeader';
import styles from './About.module.css';

const SKILLS = [
  'Next.js',
  'React',
  'SwiftUI',
  'TypeScript',
  'Supabase',
  'Vercel',
  'TailwindCSS',
  'Figma',
  'Claude Code',
  'SEO & AI',
];

const ROTATION_MS = 2500;

function SkillLoadout() {
  const prefersReduced = useReducedMotion();
  const [equippedIdx, setEquippedIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReduced || paused || pinned) return;
    const id = window.setInterval(() => {
      setEquippedIdx((i) => (i + 1) % SKILLS.length);
    }, ROTATION_MS);
    return () => window.clearInterval(id);
  }, [prefersReduced, paused, pinned]);

  const handleRowClick = (i: number) => {
    if (pinned && i === equippedIdx) {
      setPinned(false);
      return;
    }
    setEquippedIdx(i);
    setPinned(true);
  };

  const currentSkill = SKILLS[equippedIdx];

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panelGlow} />
      <div
        ref={containerRef}
        className={styles.panelFrame}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setPaused(false);
          }
        }}
      >
        <div className={styles.panelCrosshatch} />
        <div className={styles.loadoutInner}>
          <div className={styles.loadoutHeader}>
            <span className={styles.loadoutTitle}>LOADOUT</span>
            <span className={styles.loadoutStatus}>
              <span className={styles.loadoutDot} aria-hidden="true" />
              ONLINE
            </span>
          </div>

          <div className={styles.loadoutRule} aria-hidden="true" />

          <motion.ul
            className={styles.loadoutList}
            initial={prefersReduced ? false : 'hidden'}
            whileInView={prefersReduced ? undefined : 'visible'}
            viewport={{ once: true, margin: '-40px 0px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {SKILLS.map((skill, i) => {
              const isEquipped = i === equippedIdx;
              return (
                <motion.li
                  key={skill}
                  variants={{
                    hidden: { opacity: 0, x: -8 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    type="button"
                    className={`${styles.loadoutRow} ${isEquipped ? styles.loadoutRowEquipped : ''}`}
                    onClick={() => handleRowClick(i)}
                    aria-pressed={isEquipped}
                    aria-label={`Equip ${skill}`}
                  >
                    <span className={styles.loadoutSlot}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.loadoutName}>{skill}</span>
                    <span className={styles.loadoutPip} aria-hidden="true" />
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>

          <div className={styles.loadoutRule} aria-hidden="true" />

          <div className={styles.loadoutFooter}>
            <span className={styles.loadoutFooterLabel}>EQUIPPED</span>
            <span className={styles.loadoutFooterArrow} aria-hidden="true">
              ▸
            </span>
            <span className={styles.loadoutFooterValue}>{currentSkill}</span>
          </div>

          <span className={styles.srOnly} role="status" aria-live="polite">
            {`Currently equipped: ${currentSkill}`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className={styles.aboutSection}>
      <SectionHeader label="// 04 — About">
        PLAYER <span className="text-orange">1</span>
      </SectionHeader>

      <div className={styles.grid}>
        <RevealOnScroll delay={0.1} className="flex justify-center">
          <SkillLoadout />
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <p className={styles.bioLabel}>Websites · iOS · Product engineering</p>
          <h3 className={styles.bioName}>
            Hey, I&apos;m <span className={styles.bioNameAccent}>Lix</span>
          </h3>
          <p className={styles.bioParagraph}>
            I build <strong className={styles.bioStrong}>web experiences, e‑commerce, and
            iOS apps</strong> for founders, growing brands, and teams that need a site or
            product that earns trust fast.
          </p>
          <p className={styles.bioParagraph}>
            Recent work spans <strong className={styles.bioStrong}>travel, food retail,
            fitness, and pet care</strong> — the through-line is always the same: clear
            story, fast UI, solid engineering, and analytics-friendly foundations. I ship
            work that looks intentional and behaves reliably.
          </p>
          <p className={styles.bioParagraph}>
            When I&apos;m not coding, I&apos;m probably gaming, out with the dogs, or deep
            in a build thread about tooling and performance.
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
