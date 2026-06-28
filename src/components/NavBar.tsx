import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { Logo } from './Logo'
import { useDark } from '../hooks/useDark'

const navItems = [
  { label: 'Blog', href: '/posts' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
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

export function NavBar() {
  const { isDark, toggleDark } = useDark()

  return (
    <header className="header">
      <Link to="/" className="logo-link" aria-label="Home">
        <Logo />
      </Link>
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-spacer" />
        <div className="nav-right">
          {navItems.map(item => (
            <Link key={item.href} to={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
          <DarkToggle isDark={isDark} onToggle={toggleDark} />
        </div>
      </nav>
    </header>
  )
}
