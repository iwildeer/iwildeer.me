import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import { HighlightsContext } from '@/context/highlightsContext'
import { markdownComponents } from '@/lib/markdownComponents'
import { remarkPlugins } from '@/lib/markdownPlugins'
import type { Highlights } from '@/types/content'

interface MarkdownProps {
  children: string
  highlights?: Highlights
}

function urlTransform(url: string) {
  if (url.startsWith('magic:'))
    return url
  return defaultUrlTransform(url)
}

export function Markdown({ children, highlights = {} }: MarkdownProps) {
  return (
    <HighlightsContext.Provider value={highlights}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        urlTransform={urlTransform}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </HighlightsContext.Provider>
  )
}
