import { Icon } from '@/components/Icon'
import { socialLinks } from '@/content/links'
import { AppLink } from '@/components/AppLink'

export function SocialLinks() {
  return (
    <p className="social-row">
      {socialLinks.map(link => (
        <AppLink key={link.href} to={link.href}>
          <span className="opacity-75">
            <Icon icon={link.icon} />
          </span>
          {link.label}
        </AppLink>
      ))}
    </p>
  )
}
