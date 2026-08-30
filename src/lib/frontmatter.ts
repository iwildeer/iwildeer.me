import { parse as parseYaml } from 'yaml'
// '.js' suffix + relative path: this module is also imported by
// vite-plugin-shiki.ts, which Vite esbuild-bundles as part of the config (no
// '@' alias there) and type-checks under tsconfig.node.json. The import is
// type-only, so it never reaches a bundler.
import type { PageMeta } from '../types/content.js'

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

// Fields understood by PageMeta. Anything else in frontmatter is likely a
// typo and is surfaced as a dev-only warning instead of failing silently.
// `satisfies` keeps this list locked to `keyof PageMeta` at compile time:
// adding a field to PageMeta without listing it here (or vice versa) fails
// the build instead of producing false-positive typo warnings.
const KNOWN_META_KEYS = {
  title: true,
  description: true,
  date: true,
  draft: true,
  layout: true,
  listType: true,
  type: true,
  duration: true,
  social: true,
  art: true,
  projects: true,
  media: true,
  photos: true,
  display: true,
} satisfies Record<keyof PageMeta, true>

// vite/client types import.meta.env in both tsconfigs (tsconfig.node.json
// lists it in `types`); `?.` keeps the esbuild-bundled config context safe.
const isDev = import.meta.env?.DEV === true

export function getUnknownMetaKeys(meta: PageMeta): string[] {
  return Object.keys(meta).filter(key => !(key in KNOWN_META_KEYS))
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
