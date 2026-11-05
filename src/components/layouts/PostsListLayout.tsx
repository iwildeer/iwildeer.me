import { ListPosts } from '@/components/ListPosts'
import { Markdown } from '@/components/Markdown'
import { SubNav } from '@/components/SubNav'
import type { LayoutProps } from './index'

// The posts list never renders a page title — SubNav provides the heading.
export function PostsListLayout({ entry, content }: LayoutProps) {
  return (
    <>
      <SubNav />
      {content && <Markdown highlights={entry.highlights}>{content}</Markdown>}
      <ListPosts type={entry.meta.listType ?? 'blog'} />
    </>
  )
}
