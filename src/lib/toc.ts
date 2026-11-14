import type { MouseEvent } from 'react'
import { findFencedCode } from '@/lib/fence'

// Ported from antfu.me's `scripts/slugify.ts` — string.js slugify drops
// non-ASCII chars, so headings in CJK need a custom implementation.
// Diacritics are stripped via Unicode normalization instead of the
// `diacritics` package.
// eslint-disable-next-line no-control-regex
const rControl = /[\u0000-\u001F]/g
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/]+/g

export function slugify(str: string): string {
  return (
    str
      .normalize('NFKD')
      // Strip combining marks left over from the normalization above
      .replace(/[̀-ͯ]/g, '')
      // Remove control characters
      .replace(rControl, '')
      // Replace special characters
      .replace(rSpecial, '-')
      // Remove continuous separators
      .replace(/-{2,}/g, '-')
      // Remove prefixing and trailing separators
      .replace(/^-+|-+$/g, '')
      // ensure it doesn't start with a number (#121)
      .replace(/^(\d)/, '_$1')
      .toLowerCase()
  )
}

// Structural subset of a hast node (react-markdown hands custom components
// the source `node`). Keeping it loose avoids depending on `hast` types.
export interface HastLike {
  type?: string
  value?: string
  children?: HastLike[]
}

export function nodeToText(node: HastLike | undefined): string {
  if (!node)
    return ''
  if (typeof node.value === 'string')
    return node.value
  return (node.children ?? []).map(child => nodeToText(child)).join('')
}

// Heading id shared by the markdown heading renderers and the outline;
// extracting it here keeps both in sync.
export function headingId(node: HastLike | undefined): string {
  return slugify(nodeToText(node).trim())
}

export interface TocHeading {
  depth: number
  text: string
  slug: string
}

const HEADING_RE = /^(#{2,4})\s+(.+?)\s*#*\s*$/

// Strip inline markdown so the extracted text matches the textContent the
// heading renderers slug: code spans, images/links (incl. magic links),
// emphasis and backslash escapes.
function inlineText(src: string): string {
  return src
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/[*_~]+/g, '')
    .replace(/\\([\\`*_{}[\]()#+\-.!>~|])/g, '$1')
}

// Extract h2–h4 headings from markdown source, skipping fenced code blocks.
// Slugs must stay identical to `headingId` — both run the raw text through
// the same `slugify`.
export function extractHeadings(markdown: string): TocHeading[] {
  let body = markdown
  for (const fence of findFencedCode(markdown)) {
    // Blank out the block (keeping line count) so `#` lines inside are ignored
    body = body.replace(fence.fullMatch, '\n'.repeat(fence.fullMatch.split('\n').length - 1))
  }

  const headings: TocHeading[] = []
  for (const line of body.split('\n')) {
    const match = HEADING_RE.exec(line)
    if (!match)
      continue
    const text = inlineText(match[2]).trim()
    if (!text)
      continue
    headings.push({ depth: match[1].length, text, slug: slugify(text) })
  }
  return headings
}

export function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (!el)
    return false
  const y = window.scrollY + el.getBoundingClientRect().top - 40
  window.scrollTo({ top: y, behavior: 'smooth' })
  window.history.replaceState(null, '', `#${id}`)
  return true
}

export function onHeadingClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
  if (
    event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
  )
    return
  event.preventDefault()
  scrollToHeading(id)
}
