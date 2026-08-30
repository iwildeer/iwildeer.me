import { parse as parseYaml } from 'yaml'
// '.js' suffix + relative path: this module is also imported by
// vite-plugin-shiki.ts, which Vite esbuild-bundles as part of the config (no
// '@' alias there) and type-checks under tsconfig.node.json. The import is
// type-only, so it never reaches a bundler.
import type { PageMeta } from '../types/content.js'

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

// Fields understood by PageMeta. Anything else in frontmatter is likely a
// typo and is surfaced as a dev-only warning instead of failing silently.
const KNOWN_META_KEYS = new Set([
  'title', 'description', 'date', 'draft', 'layout', 'listType', 'type',
  'duration', 'social', 'art', 'projects', 'media', 'photos', 'display',
])

// `import.meta.env` is typed by vite/client in the app tsconfig; this file is
// also type-checked under tsconfig.node.json (no vite types), hence the cast.
const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true

export function getUnknownMetaKeys(meta: PageMeta): string[] {
  return Object.keys(meta).filter(key => !KNOWN_META_KEYS.has(key))
}

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

  if (isDev) {
    const unknown = getUnknownMetaKeys(meta)
    if (unknown.length)
      console.warn(`[frontmatter] unknown fields (possible typos): ${unknown.join(', ')}`)
  }

  return { meta, body }
}

export function isDraftMarkdown(raw: string) {
  const match = FRONTMATTER_RE.exec(raw)
  if (!match)
    return false
  const meta = parseYaml(match[1].trim()) as PageMeta | null
  return !!meta?.draft
}
