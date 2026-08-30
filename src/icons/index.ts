import githubFill from '@iconify-icons/ri/github-fill'
import articleLine from '@iconify-icons/ri/article-line'
import arrowUpLine from '@iconify-icons/ri/arrow-up-line'
import cameraLensLine from '@iconify-icons/ri/camera-lens-line'
import filmLine from '@iconify-icons/ri/film-line'
import lightbulbLine from '@iconify-icons/ri/lightbulb-line'
import mailLine from '@iconify-icons/ri/mail-line'
import moonLine from '@iconify-icons/ri/moon-line'
import sunLine from '@iconify-icons/ri/sun-line'
import tiktokFill from '@iconify-icons/ri/tiktok-fill'

export const iconRegistry = {
  'ri:github-fill': githubFill,
  'ri:article-line': articleLine,
  'ri:arrow-up-line': arrowUpLine,
  'ri:camera-lens-line': cameraLensLine,
  'ri:film-line': filmLine,
  'ri:lightbulb-line': lightbulbLine,
  'ri:mail-line': mailLine,
  'ri:moon-line': moonLine,
  'ri:sun-line': sunLine,
  'ri:tiktok-fill': tiktokFill,
} as const

export type RegisteredIcon = keyof typeof iconRegistry
