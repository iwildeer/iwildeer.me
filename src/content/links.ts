import type { RegisteredIcon } from '@/icons'

export interface MagicLinkMeta {
  link: string
  imageUrl?: string
  icon?: RegisteredIcon
}

export const magicLinks: Record<string, MagicLinkMeta | string> = {
  React: 'https://github.com/facebook/react',
  TypeScript: 'https://github.com/microsoft/TypeScript',
  Vite: 'https://github.com/vitejs/vite',
  Tailwind: 'https://github.com/tailwindlabs/tailwindcss',
  Iwildeer: { link: 'https://github.com/iwildeer/iwildeer' },
  'Web Dev': { link: '/projects' },
  'Open Source': { link: '/projects' },
}

export interface SocialLink {
  label: string
  href: string
  icon: RegisteredIcon
}

export const socialLinks: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/iwildeer', icon: 'ri:github-fill' },
  { label: 'Mail', href: 'mailto:hi@iwildeer.me', icon: 'ri:mail-line' },
]
