# Iwildeer

Personal website of Iwildeer. Design and content structure inspired by [antfu.me](https://antfu.me), built with React + Vite. Content is Markdown-driven with file-based routing.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/) (with the React Compiler)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) — Markdown rendering
- [Shiki](https://shiki.style/) — syntax highlighting, applied **at build time**
- [Iconify](https://iconify.design/) — Remix Icon set (`@iconify-icons/ri`)
- [Inter](https://rsms.me/inter/) + [LXGW WenKai](https://github.com/lxgw/LxgwWenKai) + [DM Mono](https://github.com/googlefonts/dm-mono) fonts
- [Vitest](https://vitest.dev/) — unit tests

## Getting Started

```bash
pnpm install
pnpm dev
```

Other commands:

```bash
pnpm build     # Type check + production build
pnpm preview   # Preview production build
pnpm lint      # ESLint
pnpm test      # Run Vitest in watch mode
pnpm test:run  # Run Vitest once
```

## Project Structure

```
src/
├── content/
│   ├── pages/            # Route pages as Markdown
│   │   ├── index.md      # Home
│   │   ├── posts.md      # Blog list (layout: posts-list, listType: blog)
│   │   ├── notes.md      # Notes list (layout: posts-list, listType: note)
│   │   ├── projects.md   # Projects (layout: projects)
│   │   ├── media.md      # Media consumption (layout: media)
│   │   ├── photos.md     # Photos (layout: photos)
│   │   └── 404.md        # Not found page
│   ├── posts/            # Blog / note posts as Markdown
│   ├── media/            # Media lists as TS modules (01-anime.ts → 'anime')
│   ├── photos/           # Photo files + <name>.json caption sidecars
│   └── links.ts          # Magic Link + social link config + resolveMagicLink
├── components/
│   ├── background/       # ArtDots + ArtPlum canvas art
│   ├── NavBar.tsx
│   ├── SubNav.tsx
│   ├── Footer.tsx
│   ├── BeianLink.tsx     # ICP / MPS beian links (footer)
│   ├── ContentPage.tsx   # Renders a page entry by layout
│   ├── PostPage.tsx      # Renders a single post
│   ├── ListPosts.tsx
│   ├── ListProjects.tsx
│   ├── ListMedia.tsx
│   ├── ListPhotos.tsx
│   ├── Markdown.tsx      # react-markdown wrapper + highlights provider
│   ├── MarkdownCode.tsx  # pre-highlighted <code> renderer
│   ├── MagicLink.tsx
│   ├── AppLink.tsx
│   ├── Icon.tsx
│   ├── Logo.tsx
│   ├── SocialLinks.tsx
│   ├── SiteBackground.tsx
│   ├── PageArtProvider.tsx
│   ├── NProgressHandler.tsx
│   └── NotFoundPage.tsx
├── context/
│   ├── pageArtContext.ts
│   └── highlightsContext.ts
├── hooks/
│   ├── useDark.ts        # Dark mode with View Transition API
│   ├── usePageArt.ts
│   └── usePageMeta.ts
├── lib/
│   ├── content.ts        # import.meta.glob loading + route entries + magic links
│   ├── frontmatter.ts    # YAML frontmatter parsing (parseMarkdown)
│   ├── mediaGroups.ts    # glob src/content/media/*.ts into category groups
│   ├── photos.ts         # glob src/content/photos/* + caption sidecars
│   ├── fence.ts          # fenced-code extraction (used by the Shiki plugin)
│   ├── markdownComponents.tsx
│   ├── markdownPlugins.ts
│   ├── shiki.ts          # Shiki theme config
│   ├── formatDate.ts
│   └── nprogress.ts
├── icons/
│   └── index.ts          # Iconify icon registry
├── routes/
│   └── AppRoutes.tsx     # Routes built from pageEntries / postEntries
├── styles/
│   ├── markdown.css
│   └── prose.css
├── types/
│   └── content.ts
├── App.tsx
├── main.tsx
└── index.css
```

Root-level:

```
vite.config.ts          # Vite config (registers the Shiki plugin)
vite-plugin-shiki.ts    # Build-time Shiki highlighting for .md?md-source
vitest.config.ts        # Vitest config (@ alias + node env)
```

## Content model

### Frontmatter

All Markdown files may start with YAML frontmatter delimited by `---` on its own line:

```yaml
---
title: My Post
description: Short summary
date: 2026-03-01
draft: false
type: blog             # "blog" | "note", or composite "blog+note"
layout: posts-list     # "default" | "posts-list" | "projects" | "media" | "photos"
listType: blog         # for posts-list: "blog" | "note"
art: plum              # "dots" | "plum" | "both"
duration: 5min
social: true           # show social links (default layout)
display: ""            # set to "" to hide the <h1> title
projects:              # for layout: projects
  Personal:
    - name: foo
      link: https://example.com/foo
      desc: A project
---
```

### Layouts

- **`default`** — renders the Markdown body. Shows `<h1>` from `title` unless `display: ""`. Renders social links when `social: true`.
- **`posts-list`** — shows a `SubNav` and a grouped list of published posts of `listType`.
- **`projects`** — renders grouped project cards from the `projects` frontmatter map.
- **`media`** — renders grouped media lists (anime, movies, books, …) loaded from `src/content/media/*.ts`.
- **`photos`** — renders the photo grid loaded from `src/content/photos/`, newest first.

### Posts vs Notes

Posts live in `src/content/posts/*.md`. A post with `type: blog` shows on `/posts`; `type: note` shows on `/notes`. Composite types like `blog+note` appear on both. Posts with `draft: true` are hidden from lists and excluded from production routes — they remain previewable at `/posts/<slug>` in `pnpm dev` but are stripped from the build.

### Media lists

Media recommendations live in `src/content/media/*.ts`. Each module exports `items: MediaItem[]` (`{ title, author?, link? }`). The filename sets the category and tab order: `01-anime.ts` → the `anime` tab (the `NN-` prefix is stripped and used only for ordering). Every `layout: media` page shares the same glob-loaded groups; an inline `media:` frontmatter block can override individual keys.

### Photos

Drop photos into `src/content/photos/` (`jpg` / `jpeg` / `png` / `webp` / `gif` / `svg`). Filenames are compared numerically in descending order, so timestamped names (`p-2026-08-30-10-00-00-000-1.jpg`) keep the grid newest-first. An optional sidecar `<name>.json` next to a photo (`{ "text": "caption" }`) adds a caption. Every `layout: photos` page renders the same stream.

### Magic Links

Inline `{Name}` tags in Markdown render as link pills. Mapping lives in `src/content/links.ts` — entries are either a URL string or `{ link, imageUrl }`, where `imageUrl` (tech logos live in `public/logos/`) shows a small logo inside the pill. Unknown names link to `#`. Inside a paragraph, a standalone `/` between pills (e.g. `{Web Dev} / {Open Source}`) is wrapped in a `markdown-magic-sep` span so the separator shares the pills' smaller metrics.

### Social links & icons

Add entries to `socialLinks` in `src/content/links.ts`. Icons use Iconify names (e.g. `ri:github-fill`) and must be registered in `src/icons/index.ts`. Pages with `social: true` render the links at a `::social::` marker in the body, or at the end when the marker is absent.

## Syntax highlighting

Code fences are highlighted **at build time** by `vite-plugin-shiki.ts`. Markdown modules are loaded with a custom `?md-source` query; the plugin pre-renders every fenced code block with Shiki (dual `vitesse-light` / `vitesse-dark` themes) and exposes `{ source, highlights }`. There is no runtime highlighter — the first paint is already colored. Blocks without a language fall back to plain `<code>`.

## Deployment

Pushing to the `master` branch triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`): it lints, builds, and `rsync`s the `dist/` output to an Alibaba Cloud ECS host. Pull requests run the build only.

## Testing

```bash
pnpm test:run
```

Logic tests cover frontmatter parsing (`parseMarkdown`), Magic Link expansion (`expandMagicLinks`), post sorting/filtering, link resolution (`resolveMagicLink`), media group building (`toMediaGroups`), photo loading (`toPhotos`), date formatting (`formatDate`), fenced-code extraction (`findFencedCode`), and the build-time highlight wiring (`Markdown`).

## Acknowledgments

Site design and implementation reference [Anthony Fu](https://antfu.me)'s [antfu.me](https://github.com/antfu/antfu.me) project.

## License

[MIT](./LICENSE)

- Copyright (c) 2020-2021 Anthony Fu
- Copyright (c) 2026 Iwildeer
