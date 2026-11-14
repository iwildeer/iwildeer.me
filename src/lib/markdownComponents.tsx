import { Children } from 'react'
import type { ReactNode } from 'react'
import type { Components } from 'react-markdown'
import { AppLink } from '@/components/AppLink'
import { MagicLink } from '@/components/MagicLink'
import { MarkdownCode } from '@/components/MarkdownCode'
import { headingId, onHeadingClick } from '@/lib/toc'

function wrapMagicSeps(children: ReactNode) {
  return Children.map(children, (child) => {
    if (typeof child === 'string' && child.trim() === '/') {
      return <span className="markdown-magic-sep">/</span>
    }
    return child
  })
}

// Heading levels the outline collects. The id is derived from the hast node
// (not the rendered children) so inline markdown — code spans, magic links —
// slugs identically to the DOM textContent.
function renderHeading(Tag: 'h2' | 'h3' | 'h4'): Components['h2'] {
  return ({ children, node, ...props }) => {
    const id = headingId(node)
    if (!id)
      return <Tag {...props}>{children}</Tag>

    return (
      <Tag id={id} {...props}>
        {children}
        <a
          className="header-anchor"
          href={`#${id}`}
          aria-hidden="true"
          onClick={event => onHeadingClick(event, id)}
        >
          #
        </a>
      </Tag>
    )
  }
}

export const markdownComponents: Components = {
  pre: ({ children }) => <>{children}</>,
  code: MarkdownCode,
  p: ({ children }) => <p>{wrapMagicSeps(children)}</p>,
  h2: renderHeading('h2'),
  h3: renderHeading('h3'),
  h4: renderHeading('h4'),
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
