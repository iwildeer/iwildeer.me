import { expandMagicLinks, parseMarkdown } from '@/lib/content'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePageArt } from '@/hooks/usePageArt'
import { ListPosts } from '@/components/ListPosts'
import { ListProjects } from '@/components/ListProjects'
import { ListMedia } from '@/components/ListMedia'
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
      {showTitle && (
        <h1 className={entry.isIndex ? 'flex items-center gap-[0.35em]' : undefined}>
          {entry.isIndex && (
            <img
              src="/avatar.jpg"
              alt=""
              width={48}
              height={48}
              className="m-0! size-[1.05em] shrink-0 rounded-full object-cover"
            />
          )}
          {meta.display ?? meta.title}
        </h1>
      )}

      {layout === 'posts-list' && (
        <>
          <SubNav />
          {content && <Markdown highlights={entry.highlights}>{content}</Markdown>}
          <ListPosts type={listType} />
        </>
      )}

      {layout === 'projects' && meta.projects && (
        <div className="project-list-wrap">
          {content && <Markdown highlights={entry.highlights}>{content}</Markdown>}
          <ListProjects projects={meta.projects} />
        </div>
      )}

      {layout === 'media' && meta.media && (
        <>
          {content && <Markdown highlights={entry.highlights}>{content}</Markdown>}
          <ListMedia media={meta.media} />
          <p className="media-footnote">
            These are ones I enjoyed, not exhaustive. And not necessarily recommendations.
          </p>
        </>
      )}

      {layout === 'default' && (
        <>
          <Markdown highlights={entry.highlights}>{content}</Markdown>
          {meta.social && <SocialLinks />}
        </>
      )}
    </article>
  )
}
