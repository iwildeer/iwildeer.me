import { describe, expect, it, vi } from 'vitest'
import { getUnknownMetaKeys, isDraftMarkdown, parseMarkdown } from '@/lib/frontmatter'

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

describe('getUnknownMetaKeys', () => {
  it('returns nothing for known fields', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { meta } = parseMarkdown('---\ntitle: Hi\ndraft: true\nlayout: media\n---\nbody')
    expect(getUnknownMetaKeys(meta)).toEqual([])
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('flags misspelled fields and warns in dev', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { meta } = parseMarkdown('---\ntitle: Hi\nlayoutt: media\n---\nbody')
    expect(getUnknownMetaKeys(meta)).toEqual(['layoutt'])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('layoutt'))
    warn.mockRestore()
  })
})
