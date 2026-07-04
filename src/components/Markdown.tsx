import ReactMarkdown from 'react-markdown'
import { markdownComponents } from '@/lib/markdownComponents'
import { remarkPlugins } from '@/lib/markdownPlugins'

interface MarkdownProps {
  children: string
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      components={markdownComponents}
    >
      {children}
    </ReactMarkdown>
  )
}
