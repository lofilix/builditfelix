'use client';

/**
 * components/sections/About.tsx
 *
 * Two-column layout: pixel avatar left, bio + skills right.
 */

import RevealOnScroll from '@/components/ui/RevealOnScroll';
import SectionHeader from '@/components/ui/SectionHeader';
import styles from './About.module.css';

const PIXEL_MAP = [
  'd d d d p p p p d d d d',
  'd d d p p p p p p d d d',
  'd d p2 p2 p2 p2 p2 p2 p2 p2 d d',
  'd d pk pk pk pk pk pk pk pk d d',
  'd pk pk w d pk pk d w pk pk d',
  'd pk pk pk pk pk pk pk pk pk pk d',
  'd d pk pk p p p p pk pk d d',
  'd d d p p p p p p d d d',
  'd d p p p2 p p p2 p p d d',
  'd p p p p p p p p p p d',
  'd d p2 p2 p2 d d p2 p2 p2 d d',
  'd d p2 p2 p2 d d p2 p2 p2 d d',
];

const COLOR: Record<string, string> = {
  p:  'var(--orange)',
  p2: 'var(--orange-deep)',
  pk: '#FFB366',
  d:  'var(--dark-3)',
  w:  '#EAEAEA',
};

function PixelCharacter() {
  const cells = PIXEL_MAP.flatMap((row) => row.split(' '));
  return (
    <div className={styles.pixelGrid}>
      {cells.map((type, i) => (
        <div
          key={i}
          className={styles.pixelCell}
          style={{ background: COLOR[type] }}
        />
      ))}
    </div>
  );
}

function PixelAvatar() {
  return (
    <div className={styles.avatarWrapper}>
      <div className={styles.avatarGlow} />
      <div className={styles.avatarFrame}>
        <div className={styles.avatarCrosshatch} />
        <div className={styles.avatarPixel}>
          <PixelCharacter />
        </div>
      </div>
    </div>
  );
}

const SKILLS = [
  'Next.js', 'React', 'SwiftUI', 'TypeScript',
  'Supabase', 'Vercel', 'TailwindCSS', 'Figma', 'Claude Code', 'SEO & AI',
];

export default function About() {
  return (
    <section id="about" className={styles.aboutSection}>
      <SectionHeader label="// 04 — About">
        PLAYER <span className="text-orange">1</span>
      </SectionHeader>

      <div className={styles.grid}>
        <RevealOnScroll delay={0.1} className="flex justify-center">
          <PixelAvatar />
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
          <div className={styles.skills}>
            {SKILLS.map((skill) => (
              <span key={skill} className="skill-item">{skill}</span>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
