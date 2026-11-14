import { parseMarkdown } from './frontmatter'
import { mediaGroups } from './mediaGroups'
import { photos } from './photos'
import type {
  Highlights,
  ListType,
  PageEntry,
  PostEntry,
  PostLang,
} from '@/types/content'

export { parseMarkdown } from './frontmatter'

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

function buildPageEntries(): PageEntry[] {
  return Object.entries(pageModules)
    .map(([path, mod]) => {
      const name = fileName(path)
      if (name === '404')
        return null

      const { meta } = parseMarkdown(mod.source)
      // Every media-layout page shares the same glob-loaded categories;
      // an inline `media:` frontmatter block would override them per key.
      if (meta.layout === 'media')
        meta.media = { ...mediaGroups, ...meta.media }
      // Every photos-layout page shares the same glob-loaded photo stream.
      if (meta.layout === 'photos')
        meta.photos = photos
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

// Missing or unparsable dates count as 0 so a bad date can't turn the
// comparator into NaN and silently scramble the sort.
function toTimestamp(date?: string) {
  const time = date ? new Date(date).getTime() : Number.NaN
  return Number.isFinite(time) ? time : 0
}

function buildPostEntries(): PostEntry[] {
  return Object.entries(postModules)
    .map(([path, mod]) => {
      const name = fileName(path)
      // `<slug>.en.md` is the English variant sharing `<slug>`'s route.
      const langMatch = /^(.+)\.en$/.exec(name)
      const slug = langMatch?.[1] ?? name
      const lang: PostLang = langMatch ? 'en' : 'zh'
      const { meta, body } = parseMarkdown(mod.source)
      return { slug, lang, source: mod.source, highlights: mod.highlights, meta, body }
    })
    .sort((a, b) => toTimestamp(b.meta.date) - toTimestamp(a.meta.date))
}

export const pageEntries = buildPageEntries()
export const postEntries = buildPostEntries()

export function getNotFoundEntry(): { source: string; highlights: Highlights } | null {
  const entry = Object.entries(pageModules).find(([path]) => fileName(path) === '404')
  if (!entry)
    return null
  return { source: entry[1].source, highlights: entry[1].highlights }
}

// One entry per slug: the default (zh) variant wins when both languages
// exist; an en-only post still passes through.
function preferDefaultLang(posts: PostEntry[]) {
  const preferred = new Map<string, PostEntry>()
  for (const post of posts) {
    const existing = preferred.get(post.slug)
    if (!existing || (existing.lang === 'en' && post.lang === 'zh'))
      preferred.set(post.slug, post)
  }
  return [...preferred.values()]
}

export function getPublishedPosts(type: ListType = 'blog') {
  return preferDefaultLang(postEntries.filter((post) => {
    if (post.meta.draft)
      return false
    const postType = post.meta.type || 'blog'
    return postType.split('+').includes(type)
  }))
}

export function getPostBySlug(slug: string, lang: PostLang = 'zh') {
  return postEntries.find(post => post.slug === slug && post.lang === lang)
}

export function getRoutablePosts() {
  // Drafts stay routable in dev for preview, but never ship in production.
  const base = import.meta.env.PROD
    ? postEntries.filter(post => !post.meta.draft)
    : postEntries
  // Language variants share one route (`/posts/<slug>`).
  return preferDefaultLang(base)
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
