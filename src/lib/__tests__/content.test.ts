import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  expandMagicLinks,
  getPostBySlug,
  getPublishedPosts,
  getRoutablePosts,
  pageEntries,
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

describe('media page', () => {
  const mediaEntry = pageEntries.find(entry => entry.slug === 'media')!

  it('injects glob-loaded media in the authored category order', () => {
    expect(mediaEntry.meta.layout).toBe('media')
    expect(Object.keys(mediaEntry.meta.media ?? {})).toEqual([
      'anime', 'movie', 'book', 'game', 'song',
    ])
  })

  it('parses items from the category files', () => {
    expect(mediaEntry.meta.media?.anime[0]).toEqual({
      title: '灵笼',
      author: '艺画开天',
    })
    expect((mediaEntry.meta.media?.song ?? []).length).toBeGreaterThan(0)
  })
})

describe('photos page', () => {
  const photoEntry = pageEntries.find(entry => entry.slug === 'photos')!

  it('injects glob-loaded photos sorted newest-first', () => {
    expect(photoEntry.meta.layout).toBe('photos')
    const names = (photoEntry.meta.photos ?? []).map(p => p.name)
    expect(names.length).toBeGreaterThanOrEqual(2)
    for (let i = 1; i < names.length; i++)
      expect(names[i - 1].localeCompare(names[i], undefined, { numeric: true }))
        .toBeGreaterThan(0)
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

describe('getRoutablePosts', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('excludes drafts from production routes', () => {
    vi.stubEnv('PROD', true)
    expect(getRoutablePosts().every(p => !p.meta.draft)).toBe(true)
  })

  it('keeps every post routable in dev for preview', () => {
    const routable = getRoutablePosts()
    const slugs = new Set(routable.map(p => p.slug))
    // one route per slug, covering every entry (drafts included in dev)
    expect(routable).toHaveLength(slugs.size)
    expect(slugs.size).toBe(new Set(postEntries.map(p => p.slug)).size)
  })
})

describe('language variants', () => {
  it('parses `<slug>.en.md` into a shared slug plus lang', () => {
    const en = getPostBySlug('gift-of-the-moment', 'en')
    expect(en?.lang).toBe('en')
    expect(en?.meta.title).toBe('The Gift of a Moment')
    expect(getPostBySlug('gift-of-the-moment')?.lang).toBe('zh')
  })

  it('lists one entry per slug, preferring the default variant', () => {
    const slugs = getPublishedPosts('note').map(p => `${p.slug}:${p.lang}`)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs).toContain('gift-of-the-moment:zh')
    expect(slugs).not.toContain('gift-of-the-moment:en')
  })

  it('shares one route across variants', () => {
    const routable = getRoutablePosts()
    expect(routable.filter(p => p.slug === 'gift-of-the-moment')).toHaveLength(1)
  })
})
