import { describe, expect, it } from 'vitest'
import { toPhotos } from '@/lib/photos'

describe('toPhotos', () => {
  it('merges sidecar metadata by base name', () => {
    const photos = toPhotos(
      { '/src/content/photos/a.jpg': '/assets/a.jpg' },
      { '/src/content/photos/a.json': { text: 'sunset' } },
    )
    expect(photos).toEqual([{ name: 'a', url: '/assets/a.jpg', text: 'sunset' }])
  })

  it('sorts newest-first by file name, numerically aware', () => {
    const photos = toPhotos(
      {
        '/src/content/photos/p-2025-01-02-10-00-00-000-1.jpg': 'u1',
        '/src/content/photos/p-2025-01-02-10-00-00-000-10.jpg': 'u2',
        '/src/content/photos/p-2026-08-30-10-00-00-000-2.png': 'u3',
      },
      {},
    )
    expect(photos.map(p => p.name)).toEqual([
      'p-2026-08-30-10-00-00-000-2',
      'p-2025-01-02-10-00-00-000-10',
      'p-2025-01-02-10-00-00-000-1',
    ])
  })

  it('ignores sidecars without a matching image', () => {
    expect(toPhotos({}, { '/src/content/photos/x.json': { text: 'orphan' } }))
      .toEqual([])
  })
})
