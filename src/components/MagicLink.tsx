import { AppLink } from '@/components/AppLink'
import { resolveMagicLink } from '@/content/links'

interface MagicLinkProps {
  name: string
  children: React.ReactNode
}

export function MagicLink({ name, children }: MagicLinkProps) {
  const { link, imageUrl } = resolveMagicLink(name)

  return (
    <AppLink to={link} className="markdown-magic-link">
      {imageUrl && (
        <span
          className="markdown-magic-link-image"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      {children}
    </AppLink>
  )
}
