export type Highlights = Record<string, string>

export type PageLayout = 'default' | 'posts-list' | 'projects' | 'media' | 'photos'
export type PostType = 'blog' | 'note'
export type ListType = PostType

export interface ProjectItem {
  name: string
  link: string
  desc?: string
  icon?: string
}

export interface MediaItem {
  title: string
  author?: string
  link?: string
}

// Sidecar `<name>.json` next to a photo file in content/photos/.
export interface PhotoMeta {
  text?: string
}

export interface PhotoItem extends PhotoMeta {
  name: string
  url: string
}

export interface PageMeta {
  title?: string
  description?: string
  date?: string
  draft?: boolean
  layout?: PageLayout
  listType?: ListType
  type?: PostType | string
  duration?: string
  social?: boolean
  art?: 'dots' | 'plum' | 'both'
  projects?: Record<string, ProjectItem[]>
  media?: Record<string, MediaItem[]>
  photos?: PhotoItem[]
  display?: string
  [key: string]: unknown
}

export interface PageEntry {
  slug: string
  source: string
  highlights: Highlights
  meta: PageMeta
  isIndex: boolean
}

export interface PostEntry {
  slug: string
  source: string
  highlights: Highlights
  meta: PageMeta
  body: string
}
