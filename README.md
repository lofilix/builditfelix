# Lix Portfolio — Next.js

Personal developer portfolio rebuilt in Next.js 15 with Framer Motion animations
and GSAP pre-wired for future upgrades.

---

## Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Framework   | Next.js 15 (App Router)                |
| Language    | TypeScript                             |
| Styling     | Tailwind CSS v3 + CSS custom properties|
| UI Anim     | Framer Motion 11                       |
| Scroll Anim | GSAP 3.12 + ScrollTrigger (pre-wired)  |
| Fonts       | Silkscreen · Outfit · JetBrains Mono   |
| Deploy      | Vercel                                 |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## Project Structure

```
lix-portfolio/
├── app/
│   ├── globals.css          # Design tokens, base styles, keyframes
│   ├── layout.tsx           # Root layout — Google Fonts, metadata
│   └── page.tsx             # Page composition (imports all sections)
│
├── components/
│   ├── layout/
│   │   ├── Nav.tsx          # Sticky nav with scroll-blur state
│   │   └── Footer.tsx
│   │
│   ├── sections/
│   │   ├── Hero.tsx         # Staggered Framer Motion entrance
│   │   ├── IOSProjects.tsx  # Phone mockups + app screens
│   │   ├── IOSProjects.module.css
│   │   ├── WebProjects.tsx  # Monitor mockups + alternating layout
│   │   ├── WebProjects.module.css
│   │   ├── About.tsx        # Pixel avatar + bio + skills
│   │   └── Contact.tsx      # Email + WhatsApp links
│   │
│   └── ui/
│       ├── RevealOnScroll.tsx   # Framer Motion useInView wrapper
│       ├── SectionDivider.tsx   # 1px orange gradient line
│       └── SectionHeader.tsx    # Label + h2 combo
│
├── hooks/
│   └── useMouseParallax.ts  # Spring-based mouse parallax (Framer Motion)
│
└── lib/
    └── gsap.ts              # GSAP + ScrollTrigger + SplitText registration
```

---

## Design System

All design tokens live in `app/globals.css` as CSS custom properties.
The 24-pixel spatial unit (`--u: 24px`) governs all section padding and gaps.

```css
/* Colors */
--orange:        #FF8000
--orange-bright: #FF9633
--orange-deep:   #E06800
--dark:          #0A0A0C
--dark-2 → 4:   …

/* Spatial unit — all padding/gaps use calc(var(--u) * N) */
--u: 24px
```

Tailwind is configured in `tailwind.config.ts` to extend these values so
you can use `text-orange`, `bg-dark`, `font-display`, `font-mono` as
Tailwind classes alongside the CSS variables.

---

## Animation Architecture

### Current: Framer Motion

All scroll reveals use `<RevealOnScroll>` which wraps Framer Motion's
`useInView` hook. This is drop-in composable and works great for the
current level of animation.

### Upgrading to GSAP ScrollTrigger

Each component has `// GSAP upgrade paths:` comments marking exactly
where to add GSAP animations. General pattern:

```tsx
'use client';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useRef } from 'react';

export default function MySection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Replace <RevealOnScroll> with direct GSAP calls:
    gsap.from('.my-element', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        end: 'top 40%',
        toggleActions: 'play none none reverse',
      },
    });
  }, { scope: sectionRef });

  return <section ref={sectionRef}>…</section>;
}
```

### SplitText on Hero Headline

```tsx
// In Hero.tsx — replace the <motion.h1> entrance with:
useGSAP(() => {
  const split = new SplitText('#hero-title', { type: 'chars,words' });
  gsap.from(split.chars, {
    opacity: 0,
    y: 40,
    rotationX: -90,
    stagger: 0.025,
    duration: 0.6,
    ease: 'back.out(1.7)',
    delay: 0.3,
  });
});
```

### Mouse Parallax Upgrade

`useMouseParallax` currently uses Framer Motion springs.
To upgrade to GSAP `quickTo` for even smoother results:

```ts
// hooks/useMouseParallax.ts — swap the spring with:
const xTo = gsap.quickTo(el, 'rotateY', { duration: 0.4, ease: 'power3' });
const yTo = gsap.quickTo(el, 'rotateX', { duration: 0.4, ease: 'power3' });
window.addEventListener('mousemove', (e) => {
  xTo((e.clientX / window.innerWidth - 0.5) * strength);
  yTo(-(e.clientY / window.innerHeight - 0.5) * strength);
});
```

---

## Deployment

```bash
# Build
npm run build

# Deploy to Vercel (install CLI first)
npx vercel --prod
```

The project is zero-config for Vercel — push to GitHub and connect
the repo in the Vercel dashboard.

---

## Adding the GBA Carousel (Services Section)

The GBA cartridge carousel from the previous single-file build can be
ported as a new section component using GSAP ScrollTrigger pinning:

1. Create `components/sections/Services.tsx`
2. Port the HTML/CSS cartridge markup into JSX
3. Replace the `IntersectionObserver` scroll trap with:

```tsx
ScrollTrigger.create({
  trigger: sectionRef.current,
  start: 'top top',
  end: `+=${window.innerHeight * 4}`,
  pin: true,
  scrub: 1,
  onUpdate: (self) => {
    const index = Math.floor(self.progress * 4);
    setActiveService(index);
  },
});
```

4. Import it in `app/page.tsx` between `<WebProjects />` and `<SectionDivider />`
