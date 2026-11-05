import type { ComponentType } from 'react'
import type { PageEntry, PageLayout, PageMeta } from '@/types/content'
import { DefaultLayout } from './DefaultLayout'
import { MediaLayout } from './MediaLayout'
import { PhotosLayout } from './PhotosLayout'
import { PostsListLayout } from './PostsListLayout'
import { ProjectsLayout } from './ProjectsLayout'

// Props every layout component receives from ContentPage.
export interface LayoutProps {
  entry: PageEntry
  content: string
}

export interface LayoutDef {
  component: ComponentType<LayoutProps>
}

// The single place a PageLayout maps to its renderer. Adding a PageLayout to
// types/content.ts without registering a component here fails the build
// (`satisfies`), mirroring KNOWN_META_KEYS in lib/frontmatter.ts.
export const LAYOUTS = {
  default: { component: DefaultLayout },
  'posts-list': { component: PostsListLayout },
  projects: { component: ProjectsLayout },
  media: { component: MediaLayout },
  photos: { component: PhotosLayout },
} satisfies Record<PageLayout, LayoutDef>

// Layout resolution lives with the contract: explicit `layout:` frontmatter
// wins, presence of `projects` data implies the projects layout, and an
// unknown `layout:` value (frontmatter is untrusted at runtime) falls back
// to default instead of crashing.
export function resolveLayout(meta: PageMeta): LayoutDef {
  const name = meta.layout ?? (meta.projects ? 'projects' : 'default')
  return LAYOUTS[name] ?? LAYOUTS.default
}
