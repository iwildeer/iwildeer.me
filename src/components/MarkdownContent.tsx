import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { Link } from 'react-router-dom'
import { MagicLink } from './MagicLink'
import { SocialLinks } from './SocialLinks'

function parseFrontmatter(markdown: string) {
  if (!markdown.startsWith('---'))
    return { meta: {} as Record<string, string>, body: markdown }

  const end = markdown.indexOf('---', 3)
  if (end === -1)
    return { meta: {} as Record<string, string>, body: markdown }

  const raw = markdown.slice(3, end).trim()
  const body = markdown.slice(end + 3).trim()
  const meta: Record<string, string> = {}

  for (const line of raw.split('\n')) {
    const index = line.indexOf(':')
    if (index > 0)
      meta[line.slice(0, index).trim()] = line.slice(index + 1).trim()
  }

  return { meta, body }
}

function expandMagicLinks(markdown: string) {
  return markdown.replace(
    /\{([^}]+)\}/g,
    (_, name: string) => `[${name.trim()}](magic:${encodeURIComponent(name.trim())})`,
  )
}

function isSocialSection(children: React.ReactNode) {
  if (typeof children !== 'string')
    return false
  return children.trim() === 'Find me on'
}

const components: Components = {
  hr: () => <hr className="site-divider" />,
  p: ({ children }) => {
    if (isSocialSection(children))
      return (
        <>
          <p>{children}</p>
          <SocialLinks />
        </>
      )
    return <p>{children}</p>
  },
  a: ({ href, children }) => {
    if (href?.startsWith('magic:')) {
      const name = decodeURIComponent(href.slice(6))
      return <MagicLink name={name}>{children}</MagicLink>
    }

    const isExternal = href?.startsWith('http')

    if (!isExternal && href?.startsWith('/')) {
      return (
        <Link to={href} className="content-link">
          {children}
        </Link>
      )
    }

    return (
      <a
        href={href}
        className="content-link"
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer' : undefined}
      >
        {children}
      </a>
    )
  },
}

export function MarkdownContent({ source }: { source: string }) {
  const { meta, body } = parseFrontmatter(source)
  const content = expandMagicLinks(body)

  return (
    <article className="prose-site slide-enter-content">
      {meta.title && <h1>{meta.title}</h1>}
      <Markdown components={components}>{content}</Markdown>
    </article>
  )
}
