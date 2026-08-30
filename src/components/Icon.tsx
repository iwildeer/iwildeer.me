import { Icon as IconifyIcon, type IconProps } from '@iconify/react'
import { iconRegistry, type RegisteredIcon } from '@/icons'

type Props = Omit<IconProps, 'icon'> & {
  icon: RegisteredIcon
}

const DEFAULT_CLASS = 'inline-block h-[1.2em] w-[1.2em] align-text-bottom'

export function Icon({ icon, className, ...props }: Props) {
  return (
    <IconifyIcon
      icon={iconRegistry[icon]}
      // Merge so callers extend the default sizing instead of replacing it.
      className={className ? `${DEFAULT_CLASS} ${className}` : DEFAULT_CLASS}
      aria-hidden={props['aria-hidden'] ?? true}
      {...props}
    />
  )
}
