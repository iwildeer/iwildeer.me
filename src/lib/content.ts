import { parse as parseYaml } from 'yaml'
import type { PageEntry, PageMeta, PostEntry } from '@/types/content'

const pageModules = import.meta.glob<string>(
  '@/content/pages/*.md',
  { query: '?raw', import: 'default', eager: true },
)

const postModules = import.meta.glob<string>(
  '@/content/posts/*.md',
  { query: '?raw', import: 'default', eager: true },
)

function fileName(path: string) {
  const match = path.match(/\/([^/]+)\.md$/)
  return match?.[1] ?? ''
}

export function parseMarkdown(raw: string) {
  if (!raw.startsWith('---')) {
    return {
      meta: {} as PageMeta,
      body: raw.trim(),
    }
  }

  const end = raw.indexOf('---', 3)
  if (end === -1) {
    return {
      meta: {} as PageMeta,
      body: raw.trim(),
    }
  }

  const yamlStr = raw.slice(3, end).trim()
  const body = raw.slice(end + 3).trim()
  const meta = (parseYaml(yamlStr) ?? {}) as PageMeta

  return { meta, body }
}

function buildPageEntries(): PageEntry[] {
  return Object.entries(pageModules)
    .map(([path, source]) => {
      const name = fileName(path)
      if (name === '404')
        return null

      const { meta } = parseMarkdown(source)
      return {
        slug: name === 'index' ? '' : name,
        source,
        meta,
        isIndex: name === 'index',
      } satisfies PageEntry
    })
    .filter((entry): entry is PageEntry => entry !== null)
}

function buildPostEntries(): PostEntry[] {
  return Object.entries(postModules)
    .map(([path, source]) => {
      const slug = fileName(path)
      const { meta, body } = parseMarkdown(source)
      return { slug, source, meta, body }
    })
    .sort((a, b) => {
      const dateA = a.meta.date ? new Date(a.meta.date).getTime() : 0
      const dateB = b.meta.date ? new Date(b.meta.date).getTime() : 0
      return dateB - dateA
    })
}

export const pageEntries = buildPageEntries()
export const postEntries = buildPostEntries()

export function getNotFoundSource() {
  const entry = Object.entries(pageModules).find(([path]) => fileName(path) === '404')
  return entry?.[1] ?? null
}

export function getPublishedPosts() {
  return postEntries.filter(post => !post.meta.draft)
}

export function getPostBySlug(slug: string) {
  return postEntries.find(post => post.slug === slug)
}

export function expandMagicLinks(markdown: string) {
  return markdown.replace(
    /\{([^}]+)\}/g,
    (_, name: string) => `[${name.trim()}](magic:${encodeURIComponent(name.trim())})`,
  )
}
