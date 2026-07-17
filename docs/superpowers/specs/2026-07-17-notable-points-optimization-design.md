# Notable Points Optimization — Design

- **Date:** 2026-07-17
- **Status:** Approved
- **Scope:** Resolve five "notable points" identified during project analysis of `iwildeer.me`.

## Background

A code review of the `iwildeer.me` personal site surfaced six observations. After
clarification with the maintainer, five are in scope for this work; the NavBar/Notes
item is out of scope (current SubNav-only entry for `/notes` is intentional).

## Goals

1. Eliminate first-frame flash for syntax-highlighted code blocks.
2. Make YAML frontmatter parsing robust against `---` horizontal rules in body text.
3. Add unit-test coverage for the pure content/logic modules.
4. Bring `README.md` back in sync with the actual codebase.

## Non-Goals

- Changing the main NavBar navigation (Notes stays reachable only via SubNav).
- Adding component/DOM tests (runtime React rendering).
- Switching the deployment target or build pipeline beyond the Shiki plugin.
- Introducing `gray-matter` or `rehype-raw` (avoid new runtime HTML-trust surface).

## Design

### 1. Shiki build-time pre-highlighting (core change)

**Problem.** `src/components/ShikiCodeBlock.tsx` runs `codeToHtml` inside a
`useEffect`, so the first paint shows an unstyled `<pre class="shiki-loading">`
block and swaps to colored HTML once the async promise resolves. On slower
devices or large posts this is visible as a flash.

**Solution.** Move highlighting to load time via a custom Vite plugin. Runtime
becomes a synchronous lookup.

**Mechanism.**

- New plugin `vite-plugin-shiki.ts` at the repo root.
  - Implements an async `load` hook matching module ids whose query string is
    `?md-source` and whose path ends in `.md`.
  - Reads the file from disk (the id without query).
  - Splits frontmatter from body (reusing the same regex as `parseMarkdown` —
    see §2 — to stay consistent).
  - Walks fenced code blocks (three or more backticks, optionally indented at
    line start) with a non-empty info string; the first whitespace-delimited
    token of the info string is the language. Implementation note: a
    multi-line `RegExp` with the global flag, matching the opening fence,
    capturing the backtick run, the language token, and the block body up to a
    closing fence with the same backtick run. Indented (4-space) code blocks
    are intentionally ignored — they have no language.
  - For each matched block calls Shiki `codeToHtml` once, using the existing
    `shikiThemes` (`vitesse-light`/`vitesse-dark`) and `defaultColor: false`
    so the output is the same dual-theme `pre.shiki` markup the current CSS
    already targets.
  - For each highlighted block assigns a stable id (hex hash of `lang + "\n" +
    code`), stores `id -> html` in a plain object, and rewrites the fence in
    the body so its info string becomes `shiki:<id>` (original code removed).
  - Returns an ES module:
    ```ts
    export const source = "<markdown with fences rewritten>"
    export const highlights: Record<string, string> = { "<id>": "<html>" }
    ```
  - Blocks without a language are left untouched (fall through to the runtime
    `<code>` path).

- `src/types/content.ts` — add `highlights: Record<string, string>` to both
  `PageEntry` and `PostEntry`.

- `src/lib/content.ts`
  - Change both `import.meta.glob` calls from `query: '?raw'` to
    `query: '?md-source'`, keeping `import: 'default', eager: true` but now also
    destructuring `highlights` from each module.
  - `buildPageEntries` / `buildPostEntries` thread `highlights` onto the entry
    objects.
  - `getNotFoundSource` keeps returning the raw source string for the 404 page.

- `src/context/highlightsContext.ts` (new) — a React context carrying
  `Record<string, string>` plus its provider and a `useHighlights` hook.

- `src/components/Markdown.tsx` — accept a `highlights` prop, wrap output in
  `<HighlightsProvider value={highlights}>`.

- `src/lib/markdownComponents.tsx` — the `code` component:
  - If `className` matches `language-shiki:<id>`, look up `id` in
    `useHighlights()`; on hit return
    `<div dangerouslySetInnerHTML={{ __html: html }} />`.
  - Otherwise (no language, missing id, or lookup miss) fall back to the
    existing plain `<code>` render.

- `src/components/ShikiCodeBlock.tsx` — delete. Its responsibilities collapse
  into the `code` component lookup.

- `src/components/ContentPage.tsx` / `PostPage.tsx` — pass `entry.highlights`
  into `<Markdown>`.

- `vite.config.ts` — register the new plugin in `plugins`.

**Trust model.** The only HTML injected via `dangerouslySetInnerHTML` is output
from Shiki on the site owner's own markdown. No arbitrary raw markdown HTML is
enabled (we are explicitly *not* adding `rehype-raw`), so the markdown body
continues to be treated as data by react-markdown.

**Performance.** Shiki runs once per `.md` file at load time; results are cached
by Vite's module graph. Dev mode re-highlights on file change (acceptable).
Runtime work is a single `Map` lookup per code block.

**Fallback.** If Shiki throws for a given block, the plugin leaves the original
fence in place; the runtime path renders plain monospace code (no crash).

### 2. Robust frontmatter parsing

**Problem.** `parseMarkdown` in `src/lib/content.ts` uses
`raw.indexOf('---', 3)` to find the closing delimiter. A `---` horizontal rule
appearing inside the body — or a YAML value containing `---` — can be mistaken
for the terminator.

**Solution.** Require the closing `---` to occupy its own line, anchored to the
opening `---` at the very start of the file:

```ts
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
```

- If the regex matches: `meta = parseYaml(match[1])`, `body = raw.slice(end)`.
- If it does not match: treat the whole input as body with empty meta (current
  behavior preserved).
- Continues to use the existing `yaml` dependency — no new packages.

The Shiki plugin reuses the same regex so frontmatter stripping stays consistent
between runtime parsing and build-time rewriting.

### 3. Vitest + logic unit tests

**Configuration.**

- New `vitest.config.ts` at repo root (kept separate from `vite.config.ts` so
  the production build config is untouched). Mirrors the `@` -> `src` alias and
  sets `environment: 'node'` (no DOM needed for the targeted modules).
- `package.json` devDependencies: `vitest`. Add scripts:
  - `"test": "vitest"`
  - `"test:run": "vitest run"`

**Test files** under `src/lib/__tests__/`:

- `content.test.ts`
  - `parseMarkdown`: no frontmatter; well-formed frontmatter; body containing a
    `---` horizontal rule; empty input; CRLF line endings.
  - `expandMagicLinks`: plain `{Name}` expansion; code-fence protection (fenced
    block with `{x}` left alone); inline-code protection (`` `{x}` `` left
    alone); multiple braces on one line; braces with no inner content left
    alone.
  - `buildPostEntries` / `getPublishedPosts`: posts sorted by date descending;
    `draft: true` filtered out; `type: blog` vs `type: note` filtering incl.
    composite `blog+note`.
- `links.test.ts`
  - `magicLinks`: string entries resolve to `{ link }`; object entries resolve
    with optional `imageUrl`; unknown name resolves to `{ link: '#' }`.
  - `socialLinks`: every `icon` is a key of `iconRegistry` (type-level + runtime
    check).

Note: the content tests depend on the fixtures in `src/content/posts/` and
`src/content/pages/`, which are real files. Tests assert invariants against the
current fixtures (e.g. "at least one published blog post exists",
"`hello-world` is the newest"), not brittle exact counts.

### 4. README sync

Rewrite `README.md` so the documented structure matches the repository:

- Project structure tree updated to include `routes/`, `lib/`, `context/`,
  `types/`, `styles/`, `hooks/` (all three files), the full `components/` list,
  `content/pages/` (index, posts, projects, notes, 404) and `content/posts/`.
- Document frontmatter fields: `title`, `description`, `date`, `draft`,
  `layout` (`default` | `posts-list` | `projects`), `listType` (`blog` |
  `note`), `type` (`blog` | `note`, supports `blog+note`), `duration`,
  `social`, `art` (`dots` | `plum` | `both`), `projects`, `display`.
- Document the three layouts and how `posts-list` vs `projects` are selected.
- Explain Magic Links, the `{Name}` syntax, and `src/content/links.ts`.
- Document the build-time Shiki highlighting mechanism (no runtime highlighter).
- Update deployment section to state Alibaba Cloud ECS via rsync (not GitHub
  Pages), triggered on push to `master`.
- Add a Testing section: `pnpm test` / `pnpm test:run`.
- Keep existing tone, headings, and the Acknowledgments / License blocks.

## File Changes Summary

**New**
- `vite-plugin-shiki.ts`
- `vitest.config.ts`
- `src/context/highlightsContext.ts`
- `src/lib/__tests__/content.test.ts`
- `src/lib/__tests__/links.test.ts`

**Modified**
- `vite.config.ts` (register plugin)
- `src/types/content.ts` (add `highlights`)
- `src/lib/content.ts` (`?md-source` glob, thread highlights, robust frontmatter)
- `src/components/Markdown.tsx` (highlights prop + provider)
- `src/lib/markdownComponents.tsx` (lookup-based `code`)
- `src/components/ContentPage.tsx` (pass highlights)
- `src/components/PostPage.tsx` (pass highlights)
- `package.json` (vitest dep + scripts)
- `README.md` (full sync)

**Deleted**
- `src/components/ShikiCodeBlock.tsx`

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Shiki plugin slows dev cold start | Only runs over `.md` files (handful); cached by module graph; acceptable. |
| Marker rewrite breaks if markdown has unusual fences (4+ backticks, indented) | Regex handles fenced blocks with 3+ backticks; indented code blocks have no language and are ignored (correct). |
| Tests depend on real fixtures and become brittle | Assert invariants, not exact counts; tolerate additive changes. |
| `?md-source` query change silently breaks glob | Covered by `content.test.ts` asserting entries load non-empty. |

## Verification

- `pnpm lint` passes.
- `pnpm build` succeeds (TS + Vite build) with the plugin active.
- `pnpm test:run` passes all new tests.
- Manual: `pnpm dev`, open `/posts/hello-world`, confirm code block is colored on
  first paint with no loading flash; toggle dark mode and confirm Shiki dual-theme
  CSS variables still switch correctly.
