import { Link } from 'react-router-dom'

interface AppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  className?: string
  children: React.ReactNode
}

function isExternal(to: string) {
  return /^(https?:|mailto:)/.test(to)
}

export function AppLink({ to, className, children, ...props }: AppLinkProps) {
  if (isExternal(to)) {
    return (
      <a
        href={to}
        className={className}
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <Link to={to} className={className} {...props}>
      {children}
    </Link>
  )
}
