# Notable Points Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve five "notable points" from the iwildeer.me code review — robust frontmatter parsing, build-time Shiki highlighting (no first-frame flash), unit-test coverage, and an in-sync README.

**Architecture:** A custom Vite plugin pre-highlights fenced code blocks at load time and exposes `{ source, highlights }` from each `.md` module via a `?md-source` query. react-markdown's `code` component looks up pre-rendered HTML by id (no runtime Shiki). Frontmatter parsing switches to a line-anchored regex. Vitest covers the pure content/link logic.

**Tech Stack:** React 19, TypeScript (~6.0, `verbatimModuleSyntax` + `noUnusedLocals`), Vite 8, Tailwind 4, react-markdown 10, Shiki 4, Vitest.

## Global Constraints

- `verbatimModuleSyntax: true` — every type-only import MUST be `import type`.
- `noUnusedLocals` / `noUnusedParameters: true` — no unused vars/params.
- `erasableSyntaxOnly: true` — no enums or namespaces; only erasable TS syntax.
- Commit message style: lowercase Conventional Commits (`feat:`, `test:`, `refactor:`, `docs:`, `chore:`).
- No new runtime dependencies except `vitest` (devDependency). Reuse the existing `yaml`, `shiki`, and `react-markdown` packages.
- Do NOT touch `src/components/Footer.tsx` (it has unrelated uncommitted local changes).

---

## Task 1: Vitest setup + robust parseMarkdown + logic tests

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/__tests__/content.test.ts`
- Create: `src/lib/__tests__/links.test.ts`
- Modify: `package.json`
- Modify: `tsconfig.app.json`
- Modify: `src/lib/content.ts` (parseMarkdown regex)
- Modify: `src/content/links.ts` (extract `resolveMagicLink`)
- Modify: `src/components/MagicLink.tsx` (use extracted resolver)

**Interfaces:**
- Produces: `parseMarkdown(raw): { meta, body }` with line-anchored frontmatter; `resolveMagicLink(name): MagicLinkMeta` exported from `@/content/links`; Vitest configured with `@` alias and `src/**/*.test.ts` glob; test files excluded from the app build typecheck.

- [ ] **Step 1: Add Vitest devDependency + scripts**

Run:
```bash
pnpm add -D vitest
```

Edit `package.json` `scripts` to add (keep existing scripts intact):
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 2: Create `vitest.config.ts`**

Create `vitest.config.ts` (kept separate from `vite.config.ts` so the production build config is untouched):
```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

- [ ] **Step 3: Exclude test files from the app build typecheck**

In `tsconfig.app.json`, add an `exclude` next to the existing `include` so `tsc -b` does not typecheck tests (Vitest transforms them with esbuild):
```json
"include": ["src"],
"exclude": ["src/**/*.test.ts", "src/**/*.test.tsx"]
```

- [ ] **Step 4: Write the failing content tests**

Create `src/lib/__tests__/content.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import {
  expandMagicLinks,
  getPublishedPosts,
  parseMarkdown,
  postEntries,
} from '@/lib/content'

describe('parseMarkdown', () => {
  it('returns empty meta when there is no frontmatter', () => {
    const { meta, body } = parseMarkdown('just body text')
    expect(meta).toEqual({})
    expect(body).toBe('just body text')
  })

  it('parses well-formed frontmatter', () => {
    const raw = '---\ntitle: Hi\ndescription: Greeting\n---\n\nbody'
    const { meta, body } = parseMarkdown(raw)
    expect(meta.title).toBe('Hi')
    expect(meta.description).toBe('Greeting')
    expect(body).toBe('body')
  })

  it('does not confuse a --- inside a frontmatter value with the closer', () => {
    const raw = '---\ntitle: Hi\ndescription: foo --- bar\n---\n\nbody'
    const { meta, body } = parseMarkdown(raw)
    expect(meta.title).toBe('Hi')
    expect(meta.description).toBe('foo --- bar')
    expect(body).toBe('body')
  })

  it('keeps a --- horizontal rule in the body intact', () => {
    const raw = '---\ntitle: Hi\n---\n\nintro\n\n---\n\nmore'
    const { meta, body } = parseMarkdown(raw)
    expect(meta.title).toBe('Hi')
    expect(body).toBe('intro\n\n---\n\nmore')
  })
})

describe('expandMagicLinks', () => {
  it('turns {Name} into a magic link reference', () => {
    expect(expandMagicLinks('use {React} now')).toBe('use [React](magic:React) now')
  })

  it('protects fenced code blocks', () => {
    const md = '```\n{x} = 1\n```'
    expect(expandMagicLinks(md)).toBe(md)
  })

  it('protects inline code', () => {
    const md = 'see `{x}` here'
    expect(expandMagicLinks(md)).toBe(md)
  })

  it('leaves empty braces untouched', () => {
    expect(expandMagicLinks('a {} b')).toBe('a {} b')
  })
})

describe('posts', () => {
  it('sorts post entries by date descending', () => {
    const dates = postEntries.map(p => p.meta.date).filter(Boolean) as string[]
    for (let i = 1; i < dates.length; i++) {
      expect(new Date(dates[i]!).getTime()).toBeLessThanOrEqual(
        new Date(dates[i - 1]!).getTime(),
      )
    }
  })

  it('includes hello-world as a published blog post', () => {
    expect(getPublishedPosts('blog').some(p => p.slug === 'hello-world')).toBe(true)
  })

  it('filters posts by type', () => {
    const split = (t: string | undefined) => (t || 'blog').split('+')
    expect(getPublishedPosts('blog').every(p => split(p.meta.type).includes('blog'))).toBe(true)
    expect(getPublishedPosts('note').every(p => split(p.meta.type).includes('note'))).toBe(true)
  })

  it('never returns drafts', () => {
    expect(getPublishedPosts('blog').every(p => !p.meta.draft)).toBe(true)
  })
})
```

- [ ] **Step 5: Run the content tests and confirm parseMarkdown failures**

Run:
```bash
pnpm test:run src/lib/__tests__/content.test.ts
```
Expected: the `does not confuse a --- inside a frontmatter value` test FAILS (current `indexOf('---', 3)` grabs the `---` inside `foo --- bar`). Other tests may pass already.

- [ ] **Step 6: Make parseMarkdown robust**

In `src/lib/content.ts`, replace the body of `parseMarkdown` (and add the regex at module top, near the other constants) with:

At module top (after imports):
```ts
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
```

Replace the existing `parseMarkdown` function:
```ts
export function parseMarkdown(raw: string) {
  const match = FRONTMATTER_RE.exec(raw)
  if (!match) {
    return {
      meta: {} as PageMeta,
      body: raw.trim(),
    }
  }

  const yamlStr = match[1].trim()
  const body = raw.slice(match[0].length).trim()
  const meta = (parseYaml(yamlStr) ?? {}) as PageMeta

  return { meta, body }
}
```

- [ ] **Step 7: Run content tests and confirm they pass**

Run:
```bash
pnpm test:run src/lib/__tests__/content.test.ts
```
Expected: all tests PASS.

- [ ] **Step 8: Extract `resolveMagicLink` for testability**

In `src/content/links.ts`, append this exported pure function (after `socialLinks`):
```ts
export function resolveMagicLink(name: string): MagicLinkMeta {
  const entry = magicLinks[name]
  if (!entry)
    return { link: '#' }
  if (typeof entry === 'string')
    return { link: entry }
  return entry
}
```

In `src/components/MagicLink.tsx`:
- Remove the local `resolveLink` function (it is replaced by the exported `resolveMagicLink`).
- Update the imports. After removing the local resolver, neither `magicLinks` nor `type MagicLinkMeta` is referenced in this file anymore (both were only used by the local function), so drop them to satisfy `noUnusedLocals` / `verbatimModuleSyntax`. The imports become:
```ts
import { AppLink } from '@/components/AppLink'
import { resolveMagicLink } from '@/content/links'
```
- Replace the call `resolveLink(name)` with `resolveMagicLink(name)`. The rest of the component stays the same (the `const { link, imageUrl } = resolveMagicLink(name)` destructuring still works because the returned shape is unchanged).

- [ ] **Step 9: Write the links tests**

Create `src/lib/__tests__/links.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { iconRegistry } from '@/icons'
import { resolveMagicLink, socialLinks } from '@/content/links'

describe('resolveMagicLink', () => {
  it('resolves string entries to { link }', () => {
    expect(resolveMagicLink('React')).toEqual({ link: 'https://github.com/facebook/react' })
  })

  it('resolves object entries and keeps optional fields', () => {
    expect(resolveMagicLink('Iwildeer')).toEqual({ link: 'https://github.com/iwildeer/iwildeer' })
  })

  it('falls back to { link: "#" } for unknown names', () => {
    expect(resolveMagicLink('Nope')).toEqual({ link: '#' })
  })
})

describe('socialLinks', () => {
  it('uses only registered icons', () => {
    const known = Object.keys(iconRegistry)
    for (const link of socialLinks)
      expect(known).toContain(link.icon)
  })
})
```

- [ ] **Step 10: Run the full test suite + lint + build**

Run:
```bash
pnpm test:run
```
Expected: all tests PASS.

Run:
```bash
pnpm lint
pnpm build
```
Expected: lint passes; build succeeds.

- [ ] **Step 11: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts tsconfig.app.json \
  src/lib/content.ts src/lib/__tests__/content.test.ts \
  src/content/links.ts src/components/MagicLink.tsx src/lib/__tests__/links.test.ts
git commit -m "test: add vitest, robust frontmatter parsing, and logic tests"
```

---

## Task 2: Shiki plugin pure helper + highlights context + dormant plugin

This task lands the plugin and context WITHOUT activating them (nothing consumes `?md-source` yet), so the build keeps working. Activation is Task 3.

**Files:**
- Create: `src/lib/fence.ts`
- Create: `src/lib/__tests__/fence.test.ts`
- Create: `src/context/highlightsContext.ts`
- Create: `vite-plugin-shiki.ts`
- Modify: `src/types/content.ts` (add the `Highlights` type alias)
- Modify: `vite.config.ts`
- Modify: `tsconfig.node.json` (include the new root files)

**Interfaces:**
- `findFencedCode(body: string): Array<{ fullMatch: string; lang: string; code: string }>` — pure, in `@/lib/fence`.
- `HighlightsContext` + `useHighlights()` in `@/context/highlightsContext` (default `{}`).
- Vite plugin `shikiHighlightPlugin()` exporting a `load` hook that matches `*.md?md-source` ids and returns `export const source` + `export const highlights`.

- [ ] **Step 1: Write the failing fence tests**

Create `src/lib/__tests__/fence.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { findFencedCode } from '@/lib/fence'

describe('findFencedCode', () => {
  it('finds a fenced block with a language', () => {
    const body = 'intro\n\n```ts\nconst x = 1\n```\n'
    expect(findFencedCode(body)).toEqual([
      { fullMatch: '```ts\nconst x = 1\n```', lang: 'ts', code: 'const x = 1' },
    ])
  })

  it('ignores the info string tail', () => {
    const body = '```ts twoslash\nconst x = 1\n```'
    expect(findFencedCode(body)[0]?.lang).toBe('ts')
  })

  it('reports empty lang when the fence has no info string', () => {
    const body = '```\nplain\n```'
    expect(findFencedCode(body)[0]).toEqual({
      fullMatch: '```\nplain\n```',
      lang: '',
      code: 'plain',
    })
  })

  it('finds multiple blocks', () => {
    const body = '```js\na\n```\n\ntext\n\n```py\nb\n```'
    expect(findFencedCode(body)).toHaveLength(2)
    expect(findFencedCode(body).map(b => b.lang)).toEqual(['js', 'py'])
  })

  it('ties the closing fence to the opening fence length', () => {
    const body = '````\n```\n````\n'
    const blocks = findFencedCode(body)
    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.code).toBe('```')
  })

  it('leaves inline code alone', () => {
    expect(findFencedCode('see `const x` here')).toEqual([])
  })
})
```

- [ ] **Step 2: Run fence tests to confirm they fail**

Run:
```bash
pnpm test:run src/lib/__tests__/fence.test.ts
```
Expected: FAIL (`@/lib/fence` does not exist yet).

- [ ] **Step 3: Implement `findFencedCode`**

Create `src/lib/fence.ts`:
```ts
const FENCE_RE = /(`{3,})(\S*)[^\n]*\n([\s\S]*?)\n\1/g

export interface FencedCode {
  fullMatch: string
  lang: string
  code: string
}

export function findFencedCode(body: string): FencedCode[] {
  const out: FencedCode[] = []
  for (const match of body.matchAll(FENCE_RE)) {
    out.push({
      fullMatch: match[0],
      lang: match[2] ?? '',
      code: match[3] ?? '',
    })
  }
  return out
}
```

- [ ] **Step 4: Run fence tests to confirm they pass**

Run:
```bash
pnpm test:run src/lib/__tests__/fence.test.ts
```
Expected: all PASS.

- [ ] **Step 5: Add the `Highlights` type, then create the highlights context**

`Highlights` is defined ONCE in `src/types/content.ts` (the canonical types file) so both the content layer and the React layer share it. Add at the top of `src/types/content.ts`:
```ts
export type Highlights = Record<string, string>
```

Create `src/context/highlightsContext.ts` (mirror the `pageArtContext.ts` pattern), importing the type from the types module:
```ts
import { createContext, useContext } from 'react'
import type { Highlights } from '@/types/content'

export const HighlightsContext = createContext<Highlights>({})

export function useHighlights(): Highlights {
  return useContext(HighlightsContext)
}
```

- [ ] **Step 6: Create the Vite plugin**

Create `vite-plugin-shiki.ts` at the repo root:
```ts
import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { codeToHtml } from 'shiki'
import { findFencedCode } from './src/lib/fence'
import { shikiThemes } from './src/lib/shiki'

const QUERY = '?md-source'

export function shikiHighlightPlugin(): Plugin {
  return {
    name: 'shiki-highlight',
    async load(id) {
      if (!id.endsWith(QUERY))
        return null
      const file = id.slice(0, id.indexOf(QUERY))
      if (!file.endsWith('.md'))
        return null

      const raw = readFileSync(file, 'utf8')
      const blocks = findFencedCode(raw)

      const highlights: Record<string, string> = {}
      const replacements: Array<{ fullMatch: string; newFence: string }> = []
      let counter = 0

      for (const block of blocks) {
        if (!block.lang)
          continue
        try {
          const html = await codeToHtml(block.code, {
            lang: block.lang,
            themes: shikiThemes,
            defaultColor: false,
          })
          const blockId = String(counter++)
          highlights[blockId] = html
          replacements.push({
            fullMatch: block.fullMatch,
            newFence: '```shiki:' + blockId + '\n```',
          })
        }
        catch {
          // leave the original fence in place if Shiki cannot highlight it
        }
      }

      let source = raw
      for (const r of replacements)
        source = source.replace(r.fullMatch, () => r.newFence)

      return {
        code: `export const source = ${JSON.stringify(source)}\nexport const highlights = ${JSON.stringify(highlights)}\n`,
        map: null,
      }
    },
  }
}
```

- [ ] **Step 7: Register the plugin and widen the node tsconfig**

In `vite.config.ts`, add the import (next to the other imports) and include the plugin in `plugins`:
```ts
import { shikiHighlightPlugin } from './vite-plugin-shiki'
```
and in the `plugins` array add `shikiHighlightPlugin(),` (after `tailwindcss()`).

In `tsconfig.node.json`, widen `include` so the new root files typecheck:
```json
"include": ["vite.config.ts", "vitest.config.ts", "vite-plugin-shiki.ts"]
```

- [ ] **Step 8: Verify the dormant plugin does not break the build**

Run:
```bash
pnpm build
pnpm lint
```
Expected: build + lint pass. (Nothing uses `?md-source` yet, so the plugin never runs — it is dormant.)

If the build errors with something like "unknown query ?md-source", add `enforce: 'pre'` to the plugin object returned by `shikiHighlightPlugin()` and re-run. (Not expected to be needed.)

- [ ] **Step 9: Commit**

```bash
git add src/lib/fence.ts src/lib/__tests__/fence.test.ts \
  src/context/highlightsContext.ts vite-plugin-shiki.ts \
  vite.config.ts tsconfig.node.json
git commit -m "feat: add build-time shiki highlight plugin (dormant) and highlights context"
```

---

## Task 3: Activate build-time highlighting

This task flips the runtime to consume the pre-highlighted modules. It is atomic by necessity: changing the glob query changes the module shape, which requires types, content loaders, the Markdown provider, and the `code` component to change together.

**Files:**
- Modify: `src/types/content.ts`
- Modify: `src/lib/content.ts`
- Modify: `src/components/Markdown.tsx`
- Modify: `src/lib/markdownComponents.tsx`
- Modify: `src/components/ContentPage.tsx`
- Modify: `src/components/PostPage.tsx`
- Modify: `src/components/NotFoundPage.tsx`
- Delete: `src/components/ShikiCodeBlock.tsx`
- Modify: `src/styles/markdown.css` (drop `.shiki-loading`)

**Interfaces:**
- `PageEntry` and `PostEntry` gain `highlights: Highlights`.
- `content.ts` globs switch to `query: '?md-source'` (no `import` option → module namespace `{ source, highlights }`).
- `getNotFoundSource()` becomes `getNotFoundEntry(): { source: string; highlights: Highlights } | null`.
- `Markdown` accepts `highlights?: Highlights` and wraps output in `<HighlightsContext.Provider>`.
- The `code` markdown component looks up `language-shiki:<id>` and renders the pre-computed HTML.

- [ ] **Step 1: Add `highlights` to the content types**

`Highlights` was already added to `src/types/content.ts` in Task 2. Here, just add the field to both entries. In `PageEntry`:
```ts
highlights: Highlights
```
and in `PostEntry`:
```ts
highlights: Highlights
```

- [ ] **Step 2: Switch the globs and thread highlights in `src/lib/content.ts`**

Update the imports (note `verbatimModuleSyntax`):
```ts
import { parse as parseYaml } from 'yaml'
import type {
  Highlights,
  ListType,
  PageEntry,
  PageMeta,
  PostEntry,
} from '@/types/content'

interface MdModule {
  source: string
  highlights: Highlights
}

const pageModules = import.meta.glob<MdModule>(
  '@/content/pages/*.md',
  { query: '?md-source', eager: true },
)
const postModules = import.meta.glob<MdModule>(
  '@/content/posts/*.md',
  { query: '?md-source', eager: true },
)
```

In `buildPageEntries`, add `highlights: mod.highlights` to the returned object (so it `satisfies PageEntry`):
```ts
return {
  slug: name === 'index' ? '' : name,
  source: mod.source,
  highlights: mod.highlights,
  meta,
  isIndex: name === 'index',
} satisfies PageEntry
```

In `buildPostEntries`, add `highlights: mod.highlights`:
```ts
return { slug, source: mod.source, highlights: mod.highlights, meta, body }
```

Replace `getNotFoundSource` with:
```ts
export function getNotFoundEntry(): { source: string; highlights: Highlights } | null {
  const entry = Object.entries(pageModules).find(([path]) => fileName(path) === '404')
  if (!entry)
    return null
  return { source: entry[1].source, highlights: entry[1].highlights }
}
```

- [ ] **Step 3: Make `Markdown` provide highlights**

Replace `src/components/Markdown.tsx`:
```tsx
import ReactMarkdown from 'react-markdown'
import { HighlightsContext } from '@/context/highlightsContext'
import { markdownComponents } from '@/lib/markdownComponents'
import { remarkPlugins } from '@/lib/markdownPlugins'
import type { Highlights } from '@/types/content'

interface MarkdownProps {
  children: string
  highlights?: Highlights
}

export function Markdown({ children, highlights = {} }: MarkdownProps) {
  return (
    <HighlightsContext.Provider value={highlights}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </HighlightsContext.Provider>
  )
}
```

- [ ] **Step 4: Switch the `code` component to a lookup**

Replace `src/lib/markdownComponents.tsx`:
```tsx
import type { Components } from 'react-markdown'
import { AppLink } from '@/components/AppLink'
import { MagicLink } from '@/components/MagicLink'
import { useHighlights } from '@/context/highlightsContext'

const SHIKI_RE = /language-shiki:(\d+)/

const Code: Components['code'] = ({ className, children }) => {
  const highlights = useHighlights()
  const match = SHIKI_RE.exec(className || '')
  const html = match ? highlights[match[1]] : undefined

  if (html)
    return <div dangerouslySetInnerHTML={{ __html: html }} />

  return <code className={className}>{children}</code>
}

export const markdownComponents: Components = {
  pre: ({ children }) => <>{children}</>,
  code: Code,
  a: ({ href, children }) => {
    if (href?.startsWith('magic:')) {
      const name = decodeURIComponent(href.slice(6))
      return <MagicLink name={name}>{children}</MagicLink>
    }

    if (!href)
      return <span>{children}</span>

    return <AppLink to={href}>{children}</AppLink>
  },
}
```

Note: `useHighlights()` is called unconditionally at the top of `Code` to respect the Rules of Hooks. The renderer is extracted as a named, capitalized `Code` component (rather than an inline arrow on the `code` property) so `eslint-plugin-react-hooks` recognizes the hook call as living inside a component.

- [ ] **Step 5: Delete the runtime ShikiCodeBlock**

Delete `src/components/ShikiCodeBlock.tsx`. After the Step 4 rewrite, nothing imports it. `src/lib/shiki.ts` stays (the plugin uses `shikiThemes`).

- [ ] **Step 6: Pass highlights from the page components**

In `src/components/ContentPage.tsx`, thread `entry.highlights` to every `<Markdown>` call. There are three usages (posts-list, projects, default layouts). Example for the default branch:
```tsx
{layout === 'default' && (
  <>
    <Markdown highlights={entry.highlights}>{content}</Markdown>
    {meta.social && <SocialLinks />}
  </>
)}
```
Apply the same `highlights={entry.highlights}` prop to the `<Markdown>` inside the `posts-list` and `projects` branches.

In `src/components/PostPage.tsx`, the single `<Markdown>` becomes:
```tsx
<Markdown highlights={entry.highlights}>{content}</Markdown>
```

In `src/components/NotFoundPage.tsx`, switch to the new entry helper and pass highlights:
```tsx
import { AppLink } from '@/components/AppLink'
import { Markdown } from '@/components/Markdown'
import { expandMagicLinks, getNotFoundEntry, parseMarkdown } from '@/lib/content'
import { usePageMeta } from '@/hooks/usePageMeta'

export function NotFoundPage() {
  const entry = getNotFoundEntry()
  const fallback = {
    meta: { title: '404 Not Found', description: 'Page not found' },
    body: 'The page you are looking for does not exist.',
    highlights: {},
  }
  const { meta, body } = entry ? parseMarkdown(entry.source) : { meta: fallback.meta, body: fallback.body }
  const highlights = entry?.highlights ?? {}

  usePageMeta(meta)
  const content = expandMagicLinks(body)

  return (
    <article className="prose m-auto slide-enter-content">
      {meta.title && <h1>{meta.title}</h1>}
      <Markdown highlights={highlights}>{content}</Markdown>
      <p>
        <AppLink to="/">← Back to home</AppLink>
      </p>
    </article>
  )
}
```
Note `parseMarkdown` here returns `{ meta, body }` (no `highlights`), so `highlights` is taken from `entry` directly — this is intentional and matches the `ContentPage` pattern.

- [ ] **Step 7: Drop the now-unused `.shiki-loading` style**

In `src/styles/markdown.css`, delete these lines (no longer referenced after ShikiCodeBlock is gone):
```css
.shiki-loading {
  opacity: 0.7;
}
```

- [ ] **Step 8: Verify build, lint, and tests**

Run:
```bash
pnpm test:run
pnpm lint
pnpm build
```
Expected: tests pass; lint passes; build succeeds with the plugin active (the `?md-source` glob now drives the plugin).

- [ ] **Step 9: Manually verify no first-frame flash**

Run:
```bash
pnpm dev
```
Open `/posts/hello-world`. Confirm:
- The `ts` code block is colored on the FIRST paint (no `.shiki-loading` flash, no async swap).
- Toggling dark mode (NavBar sun/moon) still switches the Shiki dual-theme colors via the existing `.prose .shiki span` CSS (`markdown.css:105-124`).
- `/posts/github-alerts` renders its `md` fence correctly.
- The `/projects` and `/` pages still render.
- `/some-missing-path` still shows the 404 page.

- [ ] **Step 10: Commit**

```bash
git add src/types/content.ts src/lib/content.ts src/components/Markdown.tsx \
  src/lib/markdownComponents.tsx src/components/ContentPage.tsx \
  src/components/PostPage.tsx src/components/NotFoundPage.tsx \
  src/styles/markdown.css
git rm src/components/ShikiCodeBlock.tsx
git commit -m "feat: highlight code at build time via shiki plugin"
```

---

## Task 4: Sync the README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Rewrite the README to match the codebase**

Replace the contents of `README.md` with:
````markdown
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
│   │   └── 404.md        # Not found page
│   ├── posts/            # Blog / note posts as Markdown
│   └── links.ts          # Magic Link + social link config + resolveMagicLink
├── components/
│   ├── background/       # ArtDots + ArtPlum canvas art
│   ├── NavBar.tsx
│   ├── SubNav.tsx
│   ├── Footer.tsx
│   ├── ContentPage.tsx   # Renders a page entry by layout
│   ├── PostPage.tsx      # Renders a single post
│   ├── ListPosts.tsx
│   ├── ListProjects.tsx
│   ├── Markdown.tsx      # react-markdown wrapper + highlights provider
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
│   ├── content.ts        # import.meta.glob loading + parseMarkdown + magic links
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
layout: posts-list     # "default" | "posts-list" | "projects"
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

### Posts vs Notes

Posts live in `src/content/posts/*.md`. A post with `type: blog` shows on `/posts`; `type: note` shows on `/notes`. Composite types like `blog+note` appear on both. Posts with `draft: true` are hidden.

### Magic Links

Inline `{Name}` tags in Markdown render as link pills. Mapping lives in `src/content/links.ts`. Unknown names link to `#`.

### Social links & icons

Add entries to `socialLinks` in `src/content/links.ts`. Icons use Iconify names (e.g. `ri:github-fill`) and must be registered in `src/icons/index.ts`.

## Syntax highlighting

Code fences are highlighted **at build time** by `vite-plugin-shiki.ts`. Markdown modules are loaded with a custom `?md-source` query; the plugin pre-renders every fenced code block with Shiki (dual `vitesse-light` / `vitesse-dark` themes) and exposes `{ source, highlights }`. There is no runtime highlighter — the first paint is already colored. Blocks without a language fall back to plain `<code>`.

## Deployment

Pushing to the `master` branch triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`): it lints, builds, and `rsync`s the `dist/` output to an Alibaba Cloud ECS host. Pull requests run the build only.

## Testing

```bash
pnpm test:run
```

Logic tests cover frontmatter parsing (`parseMarkdown`), Magic Link expansion (`expandMagicLinks`), post sorting/filtering, link resolution (`resolveMagicLink`), and fenced-code extraction (`findFencedCode`).

## Acknowledgments

Site design and implementation reference [Anthony Fu](https://antfu.me)'s [antfu.me](https://github.com/antfu/antfu.me) project.

## License

[MIT](./LICENSE)

- Copyright (c) 2020-2021 Anthony Fu
- Copyright (c) 2026 Iwildeer
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: sync README with current architecture"
```

---

## Verification (final)

After all tasks:

- [ ] `pnpm test:run` — all tests pass.
- [ ] `pnpm lint` — clean.
- [ ] `pnpm build` — succeeds.
- [ ] `pnpm dev` — `/posts/hello-world` code colored on first paint; dark mode toggles Shiki colors; `/projects`, `/`, `/notes`, and a 404 path all render.
