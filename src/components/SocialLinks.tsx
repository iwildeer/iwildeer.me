import { Icon } from './Icon'
import { socialLinks } from '../content/links'

export function SocialLinks() {
  return (
    <div className="not-prose flex flex-wrap gap-x-5 gap-y-2">
      {socialLinks.map(({ label, href, icon }) => (
        <a key={label} href={href} className="social-link">
          <Icon icon={icon} className="h-[1.1em] w-[1.1em]" />
          {label}
        </a>
      ))}
    </div>
  )
}
