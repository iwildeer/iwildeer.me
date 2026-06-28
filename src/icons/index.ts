import githubFill from '@iconify-icons/ri/github-fill'
import mailLine from '@iconify-icons/ri/mail-line'
import moonLine from '@iconify-icons/ri/moon-line'
import sunLine from '@iconify-icons/ri/sun-line'

export const iconRegistry = {
  'ri:github-fill': githubFill,
  'ri:mail-line': mailLine,
  'ri:moon-line': moonLine,
  'ri:sun-line': sunLine,
} as const

export type RegisteredIcon = keyof typeof iconRegistry
