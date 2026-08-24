import { describe, expect, it } from 'vitest'
import { isDraftMarkdown } from '@/lib/frontmatter'

describe('isDraftMarkdown', () => {
  it('detects draft: true in frontmatter', () => {
    expect(isDraftMarkdown('---\ntitle: Hi\ndraft: true\n---\n\nbody')).toBe(true)
  })

  it('is false without frontmatter', () => {
    expect(isDraftMarkdown('just body')).toBe(false)
  })

  it('is false when draft is absent or disabled', () => {
    expect(isDraftMarkdown('---\ntitle: Hi\n---\n\nbody')).toBe(false)
    expect(isDraftMarkdown('---\ndraft: false\n---\n\nbody')).toBe(false)
  })

  it('ignores a draft mention in the body', () => {
    expect(isDraftMarkdown('---\ntitle: Hi\n---\n\ndraft: true')).toBe(false)
  })
})
