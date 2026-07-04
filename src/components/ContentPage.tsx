import { expandMagicLinks, parseMarkdown } from '@/lib/content'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePageArt } from '@/hooks/usePageArt'
import { ListPosts } from '@/components/ListPosts'
import { ListProjects } from '@/components/ListProjects'
import { Markdown } from '@/components/Markdown'
import { SocialLinks } from '@/components/SocialLinks'
import { SubNav } from '@/components/SubNav'
import type { ListType, PageEntry } from '@/types/content'

interface ContentPageProps {
  entry: PageEntry
}

export function ContentPage({ entry }: ContentPageProps) {
  const { meta } = entry
  const { body } = parseMarkdown(entry.source)
  usePageMeta(meta)
  usePageArt(meta.art)

  const layout = meta.layout ?? (meta.projects ? 'projects' : 'default')
  const content = expandMagicLinks(body)
  const listType = (meta.listType ?? 'blog') as ListType
  const showTitle = layout === 'posts-list'
    ? false
    : Boolean(meta.title) && meta.display !== ''

  return (
    <article className="prose m-auto slide-enter-content">
      {showTitle && <h1>{meta.display ?? meta.title}</h1>}

      {layout === 'posts-list' && (
        <>
          <SubNav />
          {content && <Markdown>{content}</Markdown>}
          <ListPosts type={listType} />
        </>
      )}

      {layout === 'projects' && meta.projects && (
        <div className="project-list-wrap">
          {content && <Markdown>{content}</Markdown>}
          <ListProjects projects={meta.projects} />
        </div>
      )}

      {layout === 'default' && (
        <>
          <Markdown>{content}</Markdown>
          {meta.social && <SocialLinks />}
        </>
      )}
    </article>
  )
}
