'use client';

/**
 * components/sections/Contact.tsx
 *
 * Centered contact section with email, WhatsApp, Instagram, and booking.
 */

import { motion } from 'framer-motion';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import SectionHeader from '@/components/ui/SectionHeader';
import { BOOKING_URL } from '@/lib/constants';
import styles from './Contact.module.css';

const LINKS = [
  {
    icon: '📅',
    label: 'Book a call',
    href: BOOKING_URL,
  },
  {
    icon: '📧',
    label: 'felixjunedesilva@gmail.com',
    href: 'mailto:felixjunedesilva@gmail.com',
  },
  {
    icon: '💬',
    label: '+63 945 500 1187 · WhatsApp',
    href: 'https://wa.me/639455001187',
  },
  {
    icon: '📷',
    label: '@lofi_lix · Instagram',
    href: 'https://instagram.com/lofi_lix',
  },
];

export default function Contact() {
  return (
    <section id="contact" className={styles.contactSection}>
      <div className={styles.inner}>
        <SectionHeader label="// 05 — Contact">
          Let&apos;s <span className="text-orange">build</span> something
        </SectionHeader>

        <RevealOnScroll delay={0.1}>
          <p className={styles.inviteLine}>
            Invite me for a call, DM me, or shoot me an email — let&apos;s get this
            business rolling.
          </p>
        </RevealOnScroll>

        <div className={styles.linksColumn}>
          {LINKS.map(({ icon, label, href }, i) => (
            <RevealOnScroll key={href} delay={0.2 + i * 0.08} className="w-full max-w-[400px]">
              <motion.a
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={styles.contactLink}
                whileHover={{
                  borderColor: 'var(--orange)',
                  color: 'var(--orange)',
                  y: -2,
                  boxShadow: '0 8px 30px rgba(255,128,0,0.08)',
                }}
                transition={{ duration: 0.25 }}
              >
                <span className={styles.contactLinkIcon}>{icon}</span>
                {label}
              </motion.a>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
