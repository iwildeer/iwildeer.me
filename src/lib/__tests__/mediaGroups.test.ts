import { describe, expect, it } from 'vitest'
import { toMediaGroups } from '@/lib/mediaGroups'

describe('toMediaGroups', () => {
  it('strips numeric prefixes and preserves numeric-aware file order', () => {
    const groups = toMediaGroups({
      '/src/content/media/03-book.ts': { items: [{ title: '三体', author: '刘慈欣' }] },
      '/src/content/media/01-anime.ts': { items: [{ title: 'Steins;Gate' }] },
    })
    expect(Object.keys(groups)).toEqual(['anime', 'book'])
    expect(groups.anime).toEqual([{ title: 'Steins;Gate' }])
  })

  it('sorts past 9 numerically, not lexicographically', () => {
    const groups = toMediaGroups({
      '/src/content/media/10-song.ts': { items: [] },
      '/src/content/media/02-movie.ts': { items: [] },
    })
    expect(Object.keys(groups)).toEqual(['movie', 'song'])
  })

  it('keeps unprefixed file names as keys', () => {
    expect(toMediaGroups({ '/src/content/media/song.ts': { items: [] } }))
      .toEqual({ song: [] })
  })
})
