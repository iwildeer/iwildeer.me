import { Icon as IconifyIcon, type IconProps } from '@iconify/react'
import { iconRegistry, type RegisteredIcon } from '@/icons'

type Props = Omit<IconProps, 'icon'> & {
  icon: RegisteredIcon
}

export function Icon({ icon, className, ...props }: Props) {
  return (
    <IconifyIcon
      icon={iconRegistry[icon]}
      className={className ?? 'inline-block h-[1.2em] w-[1.2em] align-text-bottom'}
      aria-hidden={props['aria-hidden'] ?? true}
      {...props}
    />
  )
}
