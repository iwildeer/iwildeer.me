import type { Components } from 'react-markdown'
import { AppLink } from '@/components/AppLink'
import { MagicLink } from '@/components/MagicLink'

export const markdownComponents: Components = {
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
