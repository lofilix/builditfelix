import type { Metadata } from 'next';
import { Silkscreen, Outfit, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

// ─── Fonts ────────────────────────────────────────────────────────────────────
const silkscreen = Silkscreen({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-silkscreen',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'builditfelix — Lix | Web, e‑commerce & iOS development',
  description:
    'Freelance developer building marketing sites, e‑commerce, web apps, and native iOS products for teams and businesses across industries — from landing pages to full-stack delivery. Clean code, sharp UX, measurable outcomes.',
  openGraph: {
    title: 'builditfelix — Lix',
    description:
      'Websites, stores, web applications, and iOS apps — discovery, build, launch, and iterate with a partner who cares about craft and conversion.',
    type: 'website',
  },
};

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${silkscreen.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
