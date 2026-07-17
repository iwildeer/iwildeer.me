import { describe, expect, it } from 'vitest'
import { findFencedCode } from '@/lib/fence'

describe('findFencedCode', () => {
  it('finds a fenced block with a language', () => {
    const body = 'intro\n\n```ts\nconst x = 1\n```\n'
    expect(findFencedCode(body)).toEqual([
      { fullMatch: '```ts\nconst x = 1\n```', lang: 'ts', code: 'const x = 1' },
    ])
  })

  it('ignores the info string tail', () => {
    const body = '```ts twoslash\nconst x = 1\n```'
    expect(findFencedCode(body)[0]?.lang).toBe('ts')
  })

  it('reports empty lang when the fence has no info string', () => {
    const body = '```\nplain\n```'
    expect(findFencedCode(body)[0]).toEqual({
      fullMatch: '```\nplain\n```',
      lang: '',
      code: 'plain',
    })
  })

  it('finds multiple blocks', () => {
    const body = '```js\na\n```\n\ntext\n\n```py\nb\n```'
    expect(findFencedCode(body)).toHaveLength(2)
    expect(findFencedCode(body).map(b => b.lang)).toEqual(['js', 'py'])
  })

  it('ties the closing fence to the opening fence length', () => {
    const body = '````\n```\n````\n'
    const blocks = findFencedCode(body)
    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.code).toBe('```')
  })

  it('leaves inline code alone', () => {
    expect(findFencedCode('see `const x` here')).toEqual([])
  })
})
