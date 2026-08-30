import { expandMagicLinks, parseMarkdown } from '@/lib/content'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePageArt } from '@/hooks/usePageArt'
import { ListPosts } from '@/components/ListPosts'
import { ListProjects } from '@/components/ListProjects'
import { ListMedia } from '@/components/ListMedia'
import { ListPhotos } from '@/components/ListPhotos'
import { Markdown } from '@/components/Markdown'
import { SocialLinks } from '@/components/SocialLinks'
import { SubNav } from '@/components/SubNav'
import type { Highlights, ListType, PageEntry } from '@/types/content'

const SOCIAL_MARKER = '::social::'

function MarkdownWithSocial({
  content,
  highlights,
}: {
  content: string
  highlights: Highlights
}) {
  const markerAt = content.indexOf(SOCIAL_MARKER)
  if (markerAt === -1) {
    return (
      <>
        <Markdown highlights={highlights}>{content}</Markdown>
        <SocialLinks />
      </>
    )
  }

  const before = content.slice(0, markerAt)
  const after = content.slice(markerAt + SOCIAL_MARKER.length)

  return (
    <>
      <Markdown highlights={highlights}>{before}</Markdown>
      <SocialLinks />
      {after.trim() !== '' && (
        <Markdown highlights={highlights}>{after}</Markdown>
      )}
    </>
  )
}

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
      {showTitle && layout !== 'projects' && (
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
        <>
          <header className="project-header">
            {showTitle && <h1>{meta.display ?? meta.title}</h1>}
            {content && <Markdown highlights={entry.highlights}>{content}</Markdown>}
          </header>
          <div className="project-list-wrap">
            <ListProjects projects={meta.projects} />
          </div>
        </>
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

      {layout === 'photos' && meta.photos && (
        <>
          {content && <Markdown highlights={entry.highlights}>{content}</Markdown>}
          <p className="photo-subtitle">
            Photos of my daily life, newest first.
          </p>
          <ListPhotos photos={meta.photos} />
        </>
      )}

      {layout === 'default' && (
        <>
          {meta.social
            ? (
                <MarkdownWithSocial content={content} highlights={entry.highlights} />
              )
            : (
                <Markdown highlights={entry.highlights}>{content}</Markdown>
              )}
        </>
      )}
    </article>
  )
}
