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
