import { AppLink } from '@/components/AppLink'
import { resolveMagicLink } from '@/content/links'

interface MagicLinkProps {
  name: string
  children: React.ReactNode
}

export function MagicLink({ name, children }: MagicLinkProps) {
  const { link, imageUrl } = resolveMagicLink(name)
  const isExternal = link.startsWith('http')
  const content = (
    <>
      {imageUrl && (
        <span
          className="markdown-magic-link-image"
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
        className="markdown-magic-link"
        target="_blank"
        rel="noreferrer"
      >
        {content}
      </a>
    )
  }

  return (
    <AppLink to={link} className="markdown-magic-link">
      {content}
    </AppLink>
  )
}
