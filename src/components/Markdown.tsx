import ReactMarkdown from 'react-markdown'
import { HighlightsContext } from '@/context/highlightsContext'
import { markdownComponents } from '@/lib/markdownComponents'
import { remarkPlugins } from '@/lib/markdownPlugins'
import type { Highlights } from '@/types/content'

interface MarkdownProps {
  children: string
  highlights?: Highlights
}

export function Markdown({ children, highlights = {} }: MarkdownProps) {
  return (
    <HighlightsContext.Provider value={highlights}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </HighlightsContext.Provider>
  )
}
