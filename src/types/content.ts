export type PageLayout = 'default' | 'posts-list' | 'projects'

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
  social?: boolean
  art?: 'dots' | 'plum' | 'both'
  projects?: Record<string, ProjectItem[]>
  display?: string
  [key: string]: unknown
}

export interface PageEntry {
  slug: string
  source: string
  meta: PageMeta
  isIndex: boolean
}

export interface PostEntry {
  slug: string
  source: string
  meta: PageMeta
  body: string
}
