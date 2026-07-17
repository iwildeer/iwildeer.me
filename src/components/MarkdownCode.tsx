import type { Components } from 'react-markdown'
import { useHighlights } from '@/context/highlightsContext'

const SHIKI_RE = /language-shiki:(\d+)/

export const MarkdownCode: Components['code'] = ({ className, children }) => {
  const highlights = useHighlights()
  const match = SHIKI_RE.exec(className || '')
  const html = match ? highlights[match[1]] : undefined

  if (html)
    return <div dangerouslySetInnerHTML={{ __html: html }} />

  return <code className={className}>{children}</code>
}
