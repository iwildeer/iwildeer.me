import { parse as parseYaml } from 'yaml'
// '.js' suffix: this module is also imported by vite-plugin-shiki.ts, which is
// type-checked under tsconfig.node.json (nodenext resolution). The import is
// type-only, so it never reaches a bundler.
import type { PageMeta } from '../types/content.js'

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

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

export function isDraftMarkdown(raw: string) {
  const match = FRONTMATTER_RE.exec(raw)
  if (!match)
    return false
  const meta = parseYaml(match[1].trim()) as PageMeta | null
  return !!meta?.draft
}
