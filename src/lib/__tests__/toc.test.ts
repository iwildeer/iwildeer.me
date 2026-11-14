import { describe, expect, it } from 'vitest'
import { extractHeadings, headingId, nodeToText, slugify } from '@/lib/toc'

describe('slugify (ported from antfu.me, keeps CJK)', () => {
  it('keeps CJK characters and joins words with dashes', () => {
    expect(slugify('快速开始 Get Started')).toBe('快速开始-get-started')
  })

  it('collapses runs of special characters into one dash', () => {
    expect(slugify('Hello -- World!')).toBe('hello-world')
  })

  it('trims leading and trailing separators', () => {
    expect(slugify('  what is this?  ')).toBe('what-is-this')
  })

  it('prefixes a leading digit with an underscore', () => {
    expect(slugify('2026 回顾')).toBe('_2026-回顾')
  })

  it('strips latin diacritics', () => {
    expect(slugify('café')).toBe('cafe')
  })
})

describe('nodeToText (hast text extraction)', () => {
  it('collects text across nested children', () => {
    const node = {
      type: 'element',
      children: [
        { type: 'text', value: '安装 ' },
        { type: 'element', children: [{ type: 'text', value: 'Vite' }] },
      ],
    }
    expect(nodeToText(node)).toBe('安装 Vite')
  })

  it('returns an empty string for undefined nodes', () => {
    expect(nodeToText(undefined)).toBe('')
  })
})

describe('headingId', () => {
  it('slugs inline markdown (code spans, links) to the DOM text', () => {
    // hast shape of `## 使用 \`pnpm dev\``
    const node = {
      type: 'element',
      children: [
        { type: 'text', value: '使用 ' },
        {
          type: 'element',
          children: [{ type: 'text', value: 'pnpm dev' }],
        },
      ],
    }
    expect(headingId(node)).toBe('使用-pnpm-dev')
  })

  it('returns an empty string when the heading has no text', () => {
    expect(headingId({ type: 'element', children: [] })).toBe('')
  })
})

describe('extractHeadings', () => {
  it('collects h2–h4 with depth, text and slug', () => {
    const md = [
      '# Title',
      '## 快速开始 Quick Start',
      '### 安装 `pnpm dev`',
      '#### 深入',
      '##### too deep (ignored)',
    ].join('\n')
    expect(extractHeadings(md)).toEqual([
      { depth: 2, text: '快速开始 Quick Start', slug: '快速开始-quick-start' },
      { depth: 3, text: '安装 pnpm dev', slug: '安装-pnpm-dev' },
      { depth: 4, text: '深入', slug: '深入' },
    ])
  })

  it('ignores hashes inside fenced code blocks', () => {
    const md = '## Real\n```ts\n// ## Not a heading\nconst a = 1\n```\n## After'
    const headings = extractHeadings(md)
    expect(headings).toHaveLength(2)
    expect(headings[1].slug).toBe('after')
  })

  it('keeps headings between shiki placeholder fences (regression)', () => {
    // vite-plugin-shiki rewrites code blocks to empty `shiki:<n>` fences
    const md = [
      '## 目录扫描',
      '```shiki:0\n```',
      '### Frontmatter 约定',
      '正文',
      '```shiki:1\n```',
      '## 部署',
    ].join('\n')
    expect(extractHeadings(md).map(h => h.slug)).toEqual([
      '目录扫描',
      'frontmatter-约定',
      '部署',
    ])
  })

  it('strips link syntax, matching the rendered textContent', () => {
    // magic links are expanded to `[Name](magic:Name)` before this runs
    const md = '## [Vite](magic:Vite) 实战'
    expect(extractHeadings(md)).toEqual([
      { depth: 2, text: 'Vite 实战', slug: 'vite-实战' },
    ])
  })
})
