import { Children } from 'react'
import type { ReactNode } from 'react'
import type { Components } from 'react-markdown'
import { AppLink } from '@/components/AppLink'
import { MagicLink } from '@/components/MagicLink'
import { MarkdownCode } from '@/components/MarkdownCode'

function wrapMagicSeps(children: ReactNode) {
  return Children.map(children, (child) => {
    if (typeof child === 'string' && child.trim() === '/') {
      return <span className="markdown-magic-sep">/</span>
    }
    return child
  })
}

export const markdownComponents: Components = {
  pre: ({ children }) => <>{children}</>,
  code: MarkdownCode,
  p: ({ children }) => <p>{wrapMagicSeps(children)}</p>,
  a: ({ href, children }) => {
    if (href?.startsWith('magic:')) {
      const name = decodeURIComponent(href.slice(6))
      return <MagicLink name={name}>{children}</MagicLink>
    }

    if (!href)
      return <span>{children}</span>

    return <AppLink to={href}>{children}</AppLink>
  },
}
