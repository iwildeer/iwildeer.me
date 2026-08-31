import { describe, expect, it } from 'vitest'
import { iconRegistry } from '@/icons'
import { resolveMagicLink, socialLinks } from '@/content/links'

describe('resolveMagicLink', () => {
  it('resolves string entries to { link }', () => {
    expect(resolveMagicLink('Open Source')).toEqual({ link: '/projects' })
  })

  it('resolves object entries and keeps optional fields', () => {
    expect(resolveMagicLink('React')).toEqual({
      link: 'https://github.com/facebook/react',
      imageUrl: '/logos/react.svg',
    })
    expect(resolveMagicLink('Vue')).toEqual({
      link: 'https://github.com/vuejs/core',
      imageUrl: '/logos/vue.svg',
    })
    expect(resolveMagicLink('Iwildeer')).toEqual({
      link: 'https://github.com/iwildeer/iwildeer.me',
      imageUrl: '/avatar.jpg',
    })
  })

  it('falls back to { link: "#" } for unknown names', () => {
    expect(resolveMagicLink('Nope')).toEqual({ link: '#' })
  })
})

describe('socialLinks', () => {
  it('uses only registered icons', () => {
    const known = Object.keys(iconRegistry)
    for (const link of socialLinks)
      expect(known).toContain(link.icon)
  })
})
