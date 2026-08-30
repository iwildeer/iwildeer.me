import { describe, expect, it } from 'vitest'
import { formatDate } from '@/lib/formatDate'

describe('formatDate', () => {
  it('includes the year by default', () => {
    expect(formatDate('2026-03-01T12:00:00')).toBe('Mar 1, 2026')
  })

  it('omits the year when requested', () => {
    expect(formatDate('2026-03-01T12:00:00', true)).toBe('Mar 1')
  })
})
