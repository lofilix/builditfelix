# CLAUDE.md — builditfelix.dev

Project memory for the personal portfolio of Lix (Felix June De Silva), freelance web/iOS developer. Read this before any analysis or edit.

## What this is

A Next.js portfolio + client-acquisition site. **Primary audience: SME owners in food & tourism (Philippines / SE Asia), reached via UpWork, DMs, and WhatsApp.** The site's job is conversion — make a non-technical business owner trust the work and book a call. It is *not* a dev-peer showcase. When a change trades conversion clarity for cleverness, conversion wins.

The site has a strong retro-gaming identity (GBA cartridge Services, Game Boy controller Projects, "PLAYER 1 / LOADOUT" About). **This identity is an asset — preserve it.** The rule learned from the audit: the game must be *garnish, not gate*. Every piece of proof and every conversion action must exist in static, accessible DOM underneath the game; the game is progressive enhancement layered on top.

## Working principles (how Lix wants changes made)

- **Audit-first.** Read-only audit → critique round → surgical implementation prompts, one priority at a time. Never bundle unrelated changes.
- **Surgical over structural.** Preserve existing visual identity and component structure. "Apply the grid" = snap values to the grid unit, not restructure layouts.
- **Triage by P0–P3, order by leverage (impact ÷ effort).** A defect that breaks/repels outranks a feature gap.
- Read installed skill files before generating or critiquing.

## Design system (NON-NEGOTIABLE)

| Token | Value |
|---|---|
| Base dark | `#0A0A0C` |
| Primary orange | `#FF8000` (`--color-primary`) |
| Accent oranges | `#FF9633`, `#E06800` |
| Grid unit `--u` | `24px` |
| Display font | Silkscreen |
| Body font | Outfit |
| Label/code font | JetBrains Mono |
| **Prohibited fonts** | **Inter, Roboto** |

- All colors via CSS custom properties. Structural spacing as `calc(var(--u) * N)` — no magic px like `pt-[30px]`.
- Brand contrast is good: `#FF8000` on `#0A0A0C` = **7.86:1 (AA pass)**. Any muted/secondary text must stay **≥ 4.5:1** (the `.tech-tag` `#7A7A82`/`#1A1A1F` = 4.07:1 was a fail — don't reintroduce that pattern).

## Architecture (ground-truth, verified at runtime)

- `app/layout.tsx` — metadata (currently missing `metadataBase`, OG image, JSON-LD).
- `components/sections/Hero.tsx` — hero; real `<h1>` currently lives in a hidden scroller slide (first paint shows only the wordmark + "Scroll").
- `components/sections/Services.tsx` — GBA cartridge, GSAP ScrollTrigger pin (`pin: true`, `scrub`). The canonical pin pattern; mirror it.
- `components/sections/GBAProjects.tsx` — **893-line monolith** (cartridge, screen, boot, reducer, phone mockup inline). The `WebProjects`/`MonitorMockup`/`ProjectRow` boundaries referenced historically **do not exist yet** — extraction is a P3 target, not current reality. Projects are **static PNGs only (0 iframes)**.
- `components/sections/Contact.tsx` — contact actions.
- `components/layout/Nav.tsx` (hamburger present, 40×40), `Footer.tsx`.
- `lib/gsap.ts` — **single GSAP registration point.** Register plugins here only; never re-register in components.
- `hooks/` — `useMouseParallax.ts`, etc.
- `globals.css` + per-section `*.module.css` — tokens, component classes, reduced-motion blocks.

## Animation rules (GSAP / Framer)

- Mirror the **Services pin pattern** (`pin: true`, `scrub: 0.8`).
- **Guard pins on mobile:** wrap pinned ScrollTriggers in `matchMedia('(min-width: 768px)')`. The Services pin currently runs at 375px (≈9-viewport scrub) — that's the bug, not the baseline.
- Derive `activeIndex` from `tl.time()`, **not** raw scroll progress, whenever timeline segments have unequal durations (dwell vs transition).
- During scrub, drive visual state with GSAP (`quickSetter`/`quickTo`), **not** React `setState` — `setStep` on every scrub frame caused 100ms+ re-render spikes.
- Always clean up ScrollTriggers on unmount.
- Every animation must honor `prefers-reduced-motion`, and reduced-motion must expose a **static content path** (not just frozen animation).
- Infinite ambient animations (`float`, `scrollPulse`) should pause off-screen / when the tab is hidden / under reduced-motion.

## Accessibility guardrails (lessons from the audit — do not repeat)

- **Never `preventDefault` Arrow/Space/Enter/Escape on a global `window` listener.** Scope keyboard handlers to the focused widget (`:focus-within`/ref guard). Global hijacking broke page scrolling for keyboard users (WCAG 2.1.1).
- Accessible name must contain the visible label (WCAG 2.5.3): a button reading "Home" must not have `aria-label="Return to main menu"` — use `aria-label="Home — return to menu"`.
- No `aria-label` on elements where it's prohibited (e.g. `<p>`). For decorative typed text, put the full string in a visually-hidden `<span>` and `aria-hidden` the animated pieces.
- All projects and all contact actions must be reachable in the a11y tree **without** operating the game.

## Conversion guardrails

- Contact actions must be **real links**: `mailto:`, `tel:`, `https://wa.me/639455001187`. WhatsApp is a primary channel for this audience — never a dead `<button>`.
- All projects render **client-first** (Byaheng Palawan, Griddle Cookies, then Complex, Pawstify) in static, crawlable DOM.
- Each project carries one outcome metric (Problem/Solution/Result framing).
- Hero communicates the value proposition on **first paint** (not behind a scroll/animation).
- Lead with outcome/credibility, not price ("without breaking the bank" belongs in Services, not the H1).
- Ship an OG image + `metadataBase` so shared links (UpWork/WhatsApp/DM) render a preview.

## Performance budget — DO NOT regress

Current (deployed, lab): **LCP 157ms · CLS 0.00 · 0 console errors · ~329KB total load.** `next/image` serves resized WebP with lazy-load. Keep all of it green while fixing the above.

## Stack

Next.js · React 19 · TypeScript · GSAP (ScrollTrigger; all plugins now free) · Framer Motion · Tailwind + CSS Modules · Vercel. Use Context7 for version-current GSAP/Next/Framer/Tailwind APIs.
