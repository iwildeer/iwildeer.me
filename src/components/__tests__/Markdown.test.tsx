import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Markdown } from '@/components/Markdown'

describe('Markdown highlight integration', () => {
  it('renders pre-highlighted HTML for a shiki fence', () => {
    const md = '```shiki:0\n```'
    const html = renderToStaticMarkup(
      <Markdown highlights={{ 0: '<pre class="shiki"><code>HL</code></pre>' }}>{md}</Markdown>,
    )
    expect(html).toContain('<pre class="shiki">')
    expect(html).toContain('HL')
  })

  it('falls back to plain code when no highlight matches', () => {
    const md = '```ts\nconst x = 1\n```'
    const html = renderToStaticMarkup(<Markdown highlights={{} as Record<string, string>}>{md}</Markdown>)
    expect(html).toContain('<code')
    expect(html).toContain('const x = 1')
  })
})
