import { Link } from 'react-router-dom'
import { magicLinks, type MagicLinkMeta } from '../content/links'

interface MagicLinkProps {
  name: string
  children: React.ReactNode
}

function resolveLink(name: string): MagicLinkMeta {
  const entry = magicLinks[name]
  if (!entry)
    return { link: '#' }
  if (typeof entry === 'string')
    return { link: entry }
  return entry
}

export function MagicLink({ name, children }: MagicLinkProps) {
  const { link, imageUrl } = resolveLink(name)
  const isExternal = link.startsWith('http')
  const content = (
    <>
      {imageUrl && (
        <span
          className="magic-link-image"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      {children}
    </>
  )

  if (isExternal) {
    return (
      <a
        href={link}
        className="magic-link"
        target="_blank"
        rel="noreferrer"
      >
        {content}
      </a>
    )
  }

  return (
    <Link to={link} className="magic-link">
      {content}
    </Link>
  )
}
