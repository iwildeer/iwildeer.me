import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
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

describe('Markdown heading anchors', () => {
  it('slugs heading ids (CJK kept) and appends a header anchor', () => {
    const html = renderToStaticMarkup(<Markdown>{'## 快速开始 Quick Start'}</Markdown>)
    expect(html).toContain('<h2 id="快速开始-quick-start">')
    expect(html).toContain('class="header-anchor"')
    expect(html).toContain('href="#快速开始-quick-start"')
  })

  it('slugs code spans inside headings like plain text', () => {
    const html = renderToStaticMarkup(<Markdown>{'## 使用 `pnpm dev`'}</Markdown>)
    expect(html).toContain('<h2 id="使用-pnpm-dev">')
  })
})

describe('Markdown magic links', () => {
  it('keeps the magic: protocol and renders a capsule', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Markdown>{'[React](magic:React)'}</Markdown>
      </MemoryRouter>,
    )
    expect(html).toContain('markdown-magic-link')
    expect(html).toContain('/logos/react.svg')
    expect(html).toContain('React')
  })

  it('renders the Vue capsule with its logo', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Markdown>{'[Vue](magic:Vue)'}</Markdown>
      </MemoryRouter>,
    )
    expect(html).toContain('/logos/vue.svg')
    expect(html).toContain('Vue')
  })

  it('wraps a slash between capsules so it can share their metrics', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Markdown>{'[Web Dev](magic:Web%20Dev) / [Open Source](magic:Open%20Source)'}</Markdown>
      </MemoryRouter>,
    )
    expect(html).toContain('markdown-magic-sep')
    expect(html).toMatch(/markdown-magic-sep">\/<\/span>/)
  })
})
