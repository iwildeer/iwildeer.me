# AGENTS.md

Guidance for AI coding agents operating in this repository.

## Project Overview

**iwildeer** — a personal website (design inspired by antfu.me). React 19 + Vite 8 + TypeScript + Tailwind CSS 4. Content (homepage, posts, pages) is Markdown-driven and routes are auto-generated from the content directory.

## Commands

Package manager: **pnpm** (lockfile committed). Node 22 / pnpm 9 (see `.github/workflows/deploy.yml`).

```bash
pnpm install              # install dependencies
pnpm dev                  # start Vite dev server
pnpm build                # type-check (tsc -b) then production build → dist/
pnpm preview              # preview the production build
pnpm lint                 # ESLint (flat config: eslint.config.js)
pnpm test                 # Vitest in watch mode
pnpm test:run             # Vitest once
```

Tests are **Vitest** (`vitest.config.ts`, with the `@` alias and node environment). Test files live in `__tests__/` folders next to the code (`src/lib/__tests__/`, `src/components/__tests__/`) and cover pure logic — no DOM snapshot tests.

### Type checking

`pnpm build` runs `tsc -b` (strict project references). To type-check without emitting/bundling, run `pnpm exec tsc -b`. The app config (`tsconfig.app.json`) enforces `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, and `noFallthroughCasesInSwitch` — code that violates these fails the build.

### Linting a single file / sub-path

```bash
pnpm lint                       # whole repo
pnpm exec eslint src/lib/content.ts        # one file
pnpm exec eslint "src/components/**"       # a directory
```

## Project Structure

```
src/
├── main.tsx                # entry: RouterProvider
├── App.tsx                 # layout shell (default export) — only default export here
├── routes/AppRoutes.tsx    # createBrowserRouter, routes generated from lib/content.ts
├── components/             # UI components (named exports), incl. background/
├── content/
│   ├── pages/*.md          # static pages (auto-routed, index.md → /)
│   ├── posts/*.md          # blog posts (→ /posts/:slug)
│   ├── media/*.ts          # media lists (01-anime.ts → 'anime' category, prefix sets order)
│   ├── photos/             # photo files + optional <name>.json caption sidecars
│   └── links.ts            # magic links + social link config
├── context/                # React contexts
├── hooks/                  # useDark, usePageMeta, usePageArt
├── icons/index.ts          # Iconify icon registry
├── lib/                    # content.ts (glob/route data), frontmatter.ts, mediaGroups.ts, photos.ts, markdownComponents, etc.
├── styles/                 # prose.css, markdown.css
└── types/content.ts        # PageMeta, PageEntry, PostEntry, etc.
```

## Code Style

### Imports

- **Path alias `@` → `src/`** (configured in `vite.config.ts` and `tsconfig.app.json`). Use `@/` for any cross-directory import; never use deep `../` paths across directories. Same-directory `./` imports are fine.
- **`import type` is mandatory** for type-only imports (`verbatimModuleSyntax` is on). Example: `import type { PageEntry } from '@/types/content'`.
- Node builtins use the `node:` prefix (`import path from 'node:path'`).
- Prefer **named exports**. `App.tsx` is the only file using `export default`.

### Formatting

- **No semicolons.** **Single quotes** for strings. **2-space indentation.**
- Multi-line objects/arrays use **trailing commas**.
- JSX is split across lines; prefer implicit `return` in `.map()` arrows when the body is a single element.
- Files with JSX use the `.tsx` extension (including hooks that return JSX, e.g. `usePageArt.tsx`).

### Types

- Use `interface` for object/component props; `type` for unions and aliases.
- Complex/shared types live in `src/types/`. Component-local props can be defined inline in the file.
- Use the `satisfies` operator for typed literals (see `lib/content.ts`), and type predicates (`entry is PageEntry`) for `.filter`.
- Prefer optional chaining `?.` and nullish coalescing `??` over verbose guards.

### Naming & Components

- Function components only — **no class components**. Component files are PascalCase and use **named exports** (`export function NavBar()`).
- Hooks are prefixed `use` and live in `src/hooks/`.
- File-local helpers and tiny sub-components stay non-exported in the same file (e.g. `DarkToggle`, `ScrollToTop` in `NavBar.tsx`).

### Styling

- **Tailwind utility classes** plus semantic classes defined in `index.css` / `src/styles/` (e.g. `prose`, `nav-link`, `post-list`, `project-list-wrap`, `slide-enter-content`).
- Theme colors via CSS variables: `text-[var(--fg)]`. Dark mode is toggled with `document.documentElement.classList.toggle('dark')` (see `hooks/useDark.ts`).
- Avoid inline `style` unless the value is dynamic/unavoidable (e.g. `backgroundImage`, view-transition clip paths).

### Performance (React Compiler)

The project enables `babel-plugin-react-compiler` (see `vite.config.ts`). **Do not add `useMemo`, `useCallback`, or `memo` by default.** Only add manual memoization when a profiler proves it's needed or a hook dependency array genuinely requires a stable reference. Effects with listeners/RAF/timers must return a cleanup function.

## Key Conventions

### Content & Routing (do not hand-wire)

Pages and posts are **not** imported manually in `AppRoutes.tsx`. `src/lib/content.ts` scans `content/pages/*.md` and `content/posts/*.md` via `import.meta.glob(..., { query: '?raw', eager: true })` and builds `pageEntries` / `postEntries`, which `AppRoutes.tsx` maps into routes.

- Add a static page: drop a `.md` in `content/pages/` (`index.md` → `/`, others → `/<name>`).
- Add a blog post: drop a `.md` in `content/posts/` (→ `/posts/<slug>`, slug = filename).
- `content/pages/404.md` feeds the `NotFoundPage` content and does **not** become a route.

**Frontmatter** (YAML, parsed by `yaml` in `lib/frontmatter.ts`): `title`, `description` (SEO), `date`, `type` (`blog` | `note`), `duration`, `draft`, `layout` (`posts-list` | `projects` | `media` | `photos` | default), `listType`, `social`, `art` (`dots` | `plum` | `both`), `display` (`""` hides the `<h1>`), `projects`. New fields go in `types/content.ts` `PageMeta` **and** `KNOWN_META_KEYS` in `lib/frontmatter.ts` — unknown frontmatter keys log a dev-only warning.

**Media lists:** `layout: media` pages render categories loaded by `lib/mediaGroups.ts` from `src/content/media/*.ts` — each module exports `items: MediaItem[]`; the filename maps to the category (`01-anime.ts` → the `anime` tab, `NN-` prefix stripped and used for ordering). An inline `media:` frontmatter block overrides the globbed groups per key.

**Photos:** `layout: photos` pages render the stream loaded by `lib/photos.ts` from `src/content/photos/` (jpg/jpeg/png/webp/gif/svg). An optional sidecar `<name>.json` (`{ text }`) becomes the image's caption in the fullscreen viewer (the grid shows no per-photo captions). Files sort newest-first by filename (numeric compare), so name them with timestamps. Every photos page shares the same stream. The grid is square-cropped cells with a floating cover/contain toggle (persisted in `localStorage` `photos-gallery-view`); clicking any image inside `.prose`/`.photos` opens the global `ImageViewer` lightbox (Arrow keys navigate via `data-photo-index`, Escape closes). Layout ported from antfu.me.

**Drafts:** posts with `draft: true` are excluded from lists (`getPublishedPosts`) and from production routes (`getRoutablePosts` filters them when `import.meta.env.PROD`); they stay previewable in `pnpm dev`.

**Magic Links:** `{Name}` tags in Markdown are expanded by `expandMagicLinks()` to `magic:<url>` links resolved against `src/content/links.ts` (`magicLinks`). Entries are either a URL string or `{ link, imageUrl? }` — `imageUrl` (tech logos live in `public/logos/`) renders a small logo inside the link pill. Code spans / inline code are protected from expansion. Inside a paragraph, a standalone `/` text node between pills is wrapped in a `markdown-magic-sep` span (custom `p` renderer in `lib/markdownComponents.tsx`) so the separator shares the pills' metrics.

### Links & Icons

- Use **`AppLink`** (`components/AppLink.tsx`) for all links — internal routes use react-router `<Link>`; `http(s):`/`mailto:` automatically get `target="_blank" rel="noreferrer"`. Don't scatter raw `<a>`/`<Link>` link-decision logic in components (Markdown rendering handled by `lib/markdownComponents.tsx`).
- Icons use **`<Icon icon="ri:..." />`** with a `RegisteredIcon` string. New icons **must be registered** in `src/icons/index.ts` first (import the icon SVG data from `@iconify-icons/ri`).
- Accessibility: interactive elements get `aria-label`; use semantic tags (`header`, `nav`, `main`, `article`, `footer`).

### Markdown Rendering

`react-markdown` + `remark-gfm`. Code blocks are highlighted **at build time** by `vite-plugin-shiki.ts` (root, runs on `?md-source` modules) — the plugin replaces fenced blocks with ```` ```shiki:<id> ```` placeholders and exposes `{ source, highlights }`; `components/MarkdownCode.tsx` looks the pre-rendered HTML up via the highlights context. Custom renderers live in `lib/markdownComponents.tsx` / `lib/markdownPlugins.ts`. `ContentPage` renders `SocialLinks` when `social: true` is set in frontmatter — placed at a `::social::` marker in the body if present, otherwise appended at the end.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml` (pnpm lint + build → rsync `dist/` to Alibaba Cloud ECS). Keep `pnpm lint` and `pnpm build` green before pushing to `master`.

## Conventions Summary (quick checklist)

- `@/` imports for cross-dir; `import type` for types; no `../` across directories.
- No semicolons, single quotes, 2-space indent, trailing commas.
- Named exports (except `App.tsx`); function components only.
- Don't hand-wire routes or page imports — add Markdown files; extend types in `types/content.ts`.
- Use `AppLink` for links; register icons before referencing them.
- No `useMemo`/`useCallback`/`memo` unless proven necessary (React Compiler is on).
