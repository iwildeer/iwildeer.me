import visualstudiocode from '@iconify-icons/simple-icons/visualstudiocode'
import githubFill from '@iconify-icons/ri/github-fill'
import articleLine from '@iconify-icons/ri/article-line'
import arrowUpLine from '@iconify-icons/ri/arrow-up-line'
import dashboard3Line from '@iconify-icons/ri/dashboard-3-line'
import filmLine from '@iconify-icons/ri/film-line'
import gridLine from '@iconify-icons/ri/grid-line'
import imageLine from '@iconify-icons/ri/image-line'
import layoutMasonryLine from '@iconify-icons/ri/layout-masonry-line'
import lightbulbLine from '@iconify-icons/ri/lightbulb-line'
import mailLine from '@iconify-icons/ri/mail-line'
import menu2Fill from '@iconify-icons/ri/menu-2-fill'
import moonLine from '@iconify-icons/ri/moon-line'
import sunLine from '@iconify-icons/ri/sun-line'
import tiktokFill from '@iconify-icons/ri/tiktok-fill'

export const iconRegistry = {
  'si:visualstudiocode': visualstudiocode,
  'ri:github-fill': githubFill,
  'ri:article-line': articleLine,
  'ri:arrow-up-line': arrowUpLine,
  'ri:dashboard-3-line': dashboard3Line,
  'ri:film-line': filmLine,
  'ri:grid-line': gridLine,
  'ri:image-line': imageLine,
  'ri:layout-masonry-line': layoutMasonryLine,
  'ri:lightbulb-line': lightbulbLine,
  'ri:mail-line': mailLine,
  'ri:menu-2-fill': menu2Fill,
  'ri:moon-line': moonLine,
  'ri:sun-line': sunLine,
  'ri:tiktok-fill': tiktokFill,
} as const

export type RegisteredIcon = keyof typeof iconRegistry
