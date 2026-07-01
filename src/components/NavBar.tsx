import { useEffect, useState } from 'react'
import { AppLink } from '@/components/AppLink'
import { Icon } from '@/components/Icon'
import { Logo } from '@/components/Logo'
import { useDark } from '@/hooks/useDark'
import type { RegisteredIcon } from '@/icons'

const navItems: { label: string; href: string; icon: RegisteredIcon }[] = [
  { label: 'Blog', href: '/posts', icon: 'ri:article-line' },
  { label: 'Projects', href: '/projects', icon: 'ri:lightbulb-line' },
  { label: 'About', href: '/about', icon: 'ri:user-line' },
]

function DarkToggle({ isDark, onToggle }: { isDark: boolean; onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      className="nav-link cursor-pointer border-0 bg-transparent p-0"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon icon={isDark ? 'ri:sun-line' : 'ri:moon-line'} />
    </button>
  )
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      className={`scroll-top${visible ? ' scroll-top-visible' : ''}`}
      title="Scroll to top"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <Icon icon="ri:arrow-up-line" />
    </button>
  )
}

export function NavBar() {
  const { isDark, toggleDark } = useDark()

  return (
    <header className="header">
      <AppLink to="/" className="logo-link" aria-label="Home">
        <Logo />
      </AppLink>
      <ScrollToTop />
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-spacer" />
        <div className="nav-right">
          {navItems.map(item => (
            <AppLink key={item.href} to={item.href} className="nav-link" title={item.label}>
              <span className="nav-label">{item.label}</span>
              <Icon icon={item.icon} className="nav-icon-only" />
            </AppLink>
          ))}
          <DarkToggle isDark={isDark} onToggle={toggleDark} />
        </div>
      </nav>
    </header>
  )
}
