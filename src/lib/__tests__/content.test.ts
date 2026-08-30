import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  expandMagicLinks,
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
      title: '葬送のフリーレン',
      author: '山田鐘人',
    })
    expect(mediaEntry.meta.media?.song).toHaveLength(3)
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
    expect(getRoutablePosts()).toHaveLength(postEntries.length)
  })
})
