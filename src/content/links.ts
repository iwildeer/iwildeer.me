import type { RegisteredIcon } from '@/icons'

export interface MagicLinkMeta {
  link: string
  imageUrl?: string
  icon?: RegisteredIcon
}

export const magicLinks: Record<string, MagicLinkMeta | string> = {
  React: {
    link: 'https://github.com/facebook/react',
    imageUrl: '/logos/react.svg',
  },
  TypeScript: {
    link: 'https://github.com/microsoft/TypeScript',
    imageUrl: '/logos/typescript.svg',
  },
  Vite: {
    link: 'https://github.com/vitejs/vite',
    imageUrl: '/logos/vite.svg',
  },
  Tailwind: {
    link: 'https://github.com/tailwindlabs/tailwindcss',
    imageUrl: '/logos/tailwindcss.svg',
  },
  Iwildeer: {
    link: 'https://github.com/iwildeer/iwildeer.me',
    imageUrl: '/avatar.jpg',
  },
  'Web Dev': { link: '/projects' },
  'Open Source': '/projects',
}

export interface SocialLink {
  label: string
  href: string
  icon: RegisteredIcon
}

export const socialLinks: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/iwildeer', icon: 'ri:github-fill' },
  { label: '抖音', href: 'https://v.douyin.com/BNf7DNqCieI/', icon: 'ri:tiktok-fill' },
]

export function resolveMagicLink(name: string): MagicLinkMeta {
  const entry = magicLinks[name]
  if (!entry)
    return { link: '#' }
  if (typeof entry === 'string')
    return { link: entry }
  return entry
}
