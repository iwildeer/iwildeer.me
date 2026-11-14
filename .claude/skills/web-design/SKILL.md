---
name: web-design
description: Design system for this site (iwildeer.me). Use whenever creating or restyling pages, components, or content layouts — colors, typography, spacing, hover states, animation, dark mode. Encodes the antfu.me-inspired conventions (CSS-variable theming, opacity-based hierarchy, slide-enter motion) so new UI stays consistent with the existing site.
---

# Web design system — iwildeer.me

Minimal, content-first, monochrome. The site is deliberately quiet: no brand
palette, no shadows-and-cards, no large filled surfaces. Hierarchy comes from
**opacity, weight, and scale** — not new colors. When a design decision feels
uncovered here, find the closest existing pattern in `src/index.css` /
`src/styles/*.css` and imitate it.

This skill governs work **within the existing site**. For a standalone page
where you're choosing a fresh visual direction rather than following this
system, also read `.claude/skills/frontend-design/SKILL.md`.

## Color

The palette is grayscale only. Two rules:

1. **Text colors via variables, never raw hex.** Defined on `:root`, flipped by
   `html.dark` (`src/index.css`):

   | Token | Light | Dark | Use for |
   |---|---|---|---|
   | `--fg-light` | `#888` | `#888` | captions, separators, inactive |
   | `--fg` | `#555` | `#bbb` | body text (default on `body`) |
   | `--fg-deep` | `#222` | `#ddd` | emphasized text |
   | `--fg-deeper` | `#000` | `#fff` | headings, names |
   | `--c-bg` | `#fff` | `#050505` | page background |

   `.prose` re-scopes `--fg*` slightly for content (see `src/styles/markdown.css`).

2. **Alpha grays for fills, borders, hovers** — they work in both themes with
   no override: `#8882` (borders), `#8887` (muted icons), `#8883` / `#88888811`
   (hover fills). `::selection` is `#8884`.

   The only inversion pattern: `.media-tab-active` is black-on-white, flipped
   white-on-black under `html.dark`. Any hardcoded color MUST have an
   `html.dark` companion rule (e.g. `.logo-path`, `.image-viewer-backdrop`).

## Typography

- Sans: **Inter Variable** → *LXGW WenKai Screen* (CJK) → PingFang SC… (stack
  in `@theme`/`--font-sans`). Mono: **DM Mono** (`--font-mono`).
- Body: `1rem / 1.75`. Muted/meta text shrinks (`0.875em`–`0.95em`) **and**
  drops opacity (0.4–0.6) rather than changing color.
- Display numerals (post-list years, project group titles): huge (8em /
  clamp), weight 700–800, `color: transparent` with `-webkit-text-stroke`
  outline — decoration lives in stroke/fill effects, not color.
- Italic subtitle pattern: `font-style: italic; opacity: 0.5` (`.post-meta`,
  `.photo-subtitle`, `h2 + p > em:first-child`).

## Layout

- Content column: `.prose m-auto` (≈65ch from `src/styles/prose.css`).
- **Wide grids break out of prose** with the wrap pattern (`.photos`,
  `.project-list-wrap`):
  ```css
  --wrap: min(75rem, calc(100vw - 3.5rem));
  width: var(--wrap);
  max-width: none;
  margin-inline: calc(50% - var(--wrap) / 2);
  ```
- Page padding: `.site-main` `2.5rem 1.75rem` (mobile `1.25rem`).
- Breakpoints: 640 (mobile tighten), 768 (nav labels→icons-only, 3-col grids),
  1024 (TOC shows, 4-col photos), 1280 (logo goes `fixed`, wider TOC).
- Fixed overlays: TOC `left: 20px / top: 90px`; photos toggle `left: 1.5rem /
  top: 5rem`; scroll-top `right: 0.75rem / bottom: 0.75rem` (round 2.5rem
  button). `#bg-root` sits at `z-index: 0` behind `#root` (`z-index: 1`).
- z-index ladder: bg 0 → content 1 → photos-toggle 10 → header 40 → scroll-top
  100 → TOC 200 → image-viewer 500 → nprogress 1031. Pick from these, don't
  invent new tiers.

## Interaction & motion

- **Hover = opacity + subtle fill.** Links fade 0.6→1 (nav) or 0.75→1 (social),
  interactive rows/cards gain `background: #88888811`, transitions
  `0.2s–0.3s ease`. Never scale/bounce on hover.
- Page entrance: `.slide-enter-content` staggers children 90ms apart
  (`slide-enter 1s`). New fixed overlays must opt out via
  `:not(.table-of-contents, :has(.table-of-contents))`-style selectors or they
  animate too.
- Ambient loops (logo stroke 10s, year-deco flow 48s) are always wrapped in
  `@media (prefers-reduced-motion: no-preference)`. Same for one-shot
  animations — `slide-enter` already is. Respect the `.no-sliding` html class
  escape hatch.
- Theme toggle uses a view-transition circle reveal (400ms) centered on the
  button — don't add per-element dark-mode transitions that fight it.

## Components

- Links: always `AppLink` (internal → router, external auto `target="_blank"`).
  Prose links get `border-bottom: 1px solid rgba(125,125,125,.3)`; UI
  navigation links set `border-bottom: none !important` + opacity pattern.
- Icons: `<Icon icon="ri:..." />` — register the icon in `src/icons/index.ts`
  first (`import x from '@iconify-icons/ri/…'`, camelCase name). Icon default
  size is `1.2em`, inherits `currentColor`.
- Pills/chips: `.markdown-magic-link` shape — `#8882` bg, `0.25rem` radius,
  small logo inline, translateY(3px) optical alignment.
- Buttons: borderless, `background: transparent`, inherit color, round
  (`9999px`) or `6px` radius, icon + label (label hides below 768px — see
  `.nav-label` / `.nav-icon-only`).
- Grids: `repeat(auto-fit, minmax(250px, 1fr))` for cards, fixed counts for
  photos (2/3/4 by breakpoint), gap `0.5rem`→`1.25rem`.

## A11y & fallbacks

- `aria-label` on icon-only controls; `aria-hidden="true"` on decorative
  icons/ornaments (`Icon` defaults to aria-hidden).
- Semantic shells: `header/nav/main/article/footer`.
- Focus states mirror hover (`:focus-visible`), outlines stay `none` in favor
  of the opacity feedback.

## Checklist before shipping UI

- [ ] Looks right in **light and dark** (toggle it) — no hardcoded grays
      without an `html.dark` rule
- [ ] Hover/focus feedback present, `0.2s–0.3s ease`
- [ ] Animation loops gated by `prefers-reduced-motion`
- [ ] Mobile checked at 375px (padding, label hiding, grids collapse)
- [ ] New icon registered; new link uses `AppLink`
- [ ] z-index picked from the existing ladder
