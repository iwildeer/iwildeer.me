import { useLocation } from 'react-router-dom'
import { AppLink } from '@/components/AppLink'

const subNavItems = [
  { label: 'Blog', href: '/posts' },
  { label: 'Notes', href: '/notes' },
] as const

export function SubNav() {
  const { pathname } = useLocation()

  return (
    <nav className="subnav" aria-label="Blog sections">
      <div className="subnav-links">
        {subNavItems.map(item => (
          <AppLink
            key={item.href}
            to={item.href}
            className={`subnav-link${pathname === item.href ? ' subnav-link-active' : ''}`}
          >
            {item.label}
          </AppLink>
        ))}
      </div>
    </nav>
  )
}
