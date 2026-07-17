export type Highlights = Record<string, string>

export type PageLayout = 'default' | 'posts-list' | 'projects'
export type PostType = 'blog' | 'note'
export type ListType = PostType

export interface ProjectItem {
  name: string
  link: string
  desc?: string
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
