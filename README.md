# Iwildeer

Personal website of Iwildeer. Design and content structure inspired by [antfu.me](https://antfu.me), built with React + Vite, homepage content driven by Markdown.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown) — Markdown content rendering
- [Iconify](https://iconify.design/) — Remix Icon set
- [Inter](https://rsms.me/inter/) + [LXGW WenKai](https://github.com/lxgw/LxgwWenKai) — Latin / CJK fonts

## Getting Started

```bash
pnpm install
pnpm dev
```

Other commands:

```bash
pnpm build    # Type check + production build
pnpm preview  # Preview production build
pnpm lint     # ESLint
```

## Project Structure

```
src/
├── content/
│   ├── home.md       # Homepage Markdown content
│   └── links.ts      # Magic Link & social link config
├── components/
│   ├── NavBar.tsx
│   ├── MarkdownContent.tsx
│   ├── MagicLink.tsx
│   ├── SocialLinks.tsx
│   ├── Icon.tsx
│   └── Footer.tsx
├── hooks/
│   └── useDark.ts    # Dark mode with View Transition
├── icons/
│   └── index.ts      # Iconify icon registry
├── App.tsx
└── index.css
```

## Editing Content

### Homepage copy

Edit `src/content/home.md`. YAML frontmatter is supported:

```markdown
---
title: Iwildeer
description: Iwildeer's personal website
---

Hey! I'm Iwildeer...
```

Inline tags like `{React}` and `{Vite}` render as Magic Link pills. Link mappings live in `src/content/links.ts`.

### Social links & icons

Add entries to the `socialLinks` array in `src/content/links.ts`. Icons use Iconify names (e.g. `ri:github-fill`). Register new icons in `src/icons/index.ts` first.

## Deployment

Pushing to the `master` branch triggers a GitHub Actions build and deploy. See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Acknowledgments

Site design and implementation reference [Anthony Fu](https://antfu.me)'s [antfu.me](https://github.com/antfu/antfu.me) project.

## License

[MIT](./LICENSE)

- Copyright (c) 2020-2021 Anthony Fu
- Copyright (c) 2026 Iwildeer
