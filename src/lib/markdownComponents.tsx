import type { Components } from 'react-markdown'
import { AppLink } from '@/components/AppLink'
import { MagicLink } from '@/components/MagicLink'
import { ShikiCodeBlock } from '@/components/ShikiCodeBlock'

export const markdownComponents: Components = {
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const text = String(children).replace(/\n$/, '')
    const langMatch = /language-(\w+)/.exec(className || '')

    if (!langMatch) {
      return <code className={className}>{children}</code>
    }

    return <ShikiCodeBlock code={text} lang={langMatch[1]} />
  },
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
