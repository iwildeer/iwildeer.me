import githubFill from '@iconify-icons/ri/github-fill'
import articleLine from '@iconify-icons/ri/article-line'
import arrowUpLine from '@iconify-icons/ri/arrow-up-line'
import lightbulbLine from '@iconify-icons/ri/lightbulb-line'
import mailLine from '@iconify-icons/ri/mail-line'
import moonLine from '@iconify-icons/ri/moon-line'
import sunLine from '@iconify-icons/ri/sun-line'
import userLine from '@iconify-icons/ri/user-line'

export const iconRegistry = {
  'ri:github-fill': githubFill,
  'ri:article-line': articleLine,
  'ri:arrow-up-line': arrowUpLine,
  'ri:lightbulb-line': lightbulbLine,
  'ri:mail-line': mailLine,
  'ri:moon-line': moonLine,
  'ri:sun-line': sunLine,
  'ri:user-line': userLine,
} as const

export type RegisteredIcon = keyof typeof iconRegistry
