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

function fileName(path: string) {
  const match = path.match(/\/([^/]+)\.md$/)
  return match?.[1] ?? ''
}

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

function buildPageEntries(): PageEntry[] {
  return Object.entries(pageModules)
    .map(([path, mod]) => {
      const name = fileName(path)
      if (name === '404')
        return null

      const { meta } = parseMarkdown(mod.source)
      return {
        slug: name === 'index' ? '' : name,
        source: mod.source,
        highlights: mod.highlights,
        meta,
        isIndex: name === 'index',
      } satisfies PageEntry
    })
    .filter((entry): entry is PageEntry => entry !== null)
}

function buildPostEntries(): PostEntry[] {
  return Object.entries(postModules)
    .map(([path, mod]) => {
      const slug = fileName(path)
      const { meta, body } = parseMarkdown(mod.source)
      return { slug, source: mod.source, highlights: mod.highlights, meta, body }
    })
    .sort((a, b) => {
      const dateA = a.meta.date ? new Date(a.meta.date).getTime() : 0
      const dateB = b.meta.date ? new Date(b.meta.date).getTime() : 0
      return dateB - dateA
    })
}

export const pageEntries = buildPageEntries()
export const postEntries = buildPostEntries()

export function getNotFoundEntry(): { source: string; highlights: Highlights } | null {
  const entry = Object.entries(pageModules).find(([path]) => fileName(path) === '404')
  if (!entry)
    return null
  return { source: entry[1].source, highlights: entry[1].highlights }
}

export function getPublishedPosts(type: ListType = 'blog') {
  return postEntries.filter((post) => {
    if (post.meta.draft)
      return false
    const postType = post.meta.type || 'blog'
    return postType.split('+').includes(type)
  })
}

export function getPostBySlug(slug: string) {
  return postEntries.find(post => post.slug === slug)
}

const PROTECTED_MARKDOWN_RE = /```[\s\S]*?```|`[^`\n]+`/g

function expandMagicLinksInText(text: string) {
  return text.replace(
    /\{([^}]+)\}/g,
    (_, name: string) => `[${name.trim()}](magic:${encodeURIComponent(name.trim())})`,
  )
}

export function expandMagicLinks(markdown: string) {
  const protectedSpans: string[] = []

  const masked = markdown.replace(PROTECTED_MARKDOWN_RE, (match) => {
    protectedSpans.push(match)
    return `\0CODE${protectedSpans.length - 1}\0`
  })

  const expanded = expandMagicLinksInText(masked)

  return expanded.replace(
    /\0CODE(\d+)\0/g,
    (_, index) => protectedSpans[Number(index)],
  )
}
