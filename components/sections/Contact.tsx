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

type ContactItem =
  | {
      id: string;
      kind: 'link';
      icon: string;
      label: string;
      href: string;
    }
  | {
      id: string;
      kind: 'display';
      icon: string;
      label: string;
    };

const CONTACT_ITEMS: ContactItem[] = [
  {
    id: 'book',
    kind: 'link',
    icon: '📅',
    label: 'Book a call',
    href: BOOKING_URL,
  },
  {
    id: 'email',
    kind: 'display',
    icon: '📧',
    label: 'felixjunedesilva@gmail.com',
  },
  {
    id: 'whatsapp',
    kind: 'display',
    icon: '💬',
    label: '+63 945 500 1187 · WhatsApp',
  },
  {
    id: 'instagram',
    kind: 'link',
    icon: '📷',
    label: '@lofi_lix · Instagram',
    href: 'https://instagram.com/lofi_lix',
  },
];

const rowMotion = {
  whileHover: {
    borderColor: 'var(--orange)',
    color: 'var(--orange)',
    y: -2,
    boxShadow: '0 8px 30px rgba(255,128,0,0.08)',
  },
  transition: { duration: 0.25 },
};

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
          {CONTACT_ITEMS.map((item, i) => (
            <RevealOnScroll key={item.id} delay={0.2 + i * 0.08} className="w-full max-w-[400px]">
              {item.kind === 'link' ? (
                <motion.a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.contactRow} ${styles.contactLink}`}
                  {...rowMotion}
                >
                  <span className={styles.contactLinkIcon}>{item.icon}</span>
                  {item.label}
                </motion.a>
              ) : (
                <motion.button
                  type="button"
                  className={`${styles.contactRow} ${styles.contactDisplay}`}
                  {...rowMotion}
                >
                  <span className={styles.contactLinkIcon}>{item.icon}</span>
                  {item.label}
                </motion.button>
              )}
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
