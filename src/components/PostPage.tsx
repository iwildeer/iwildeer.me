import { AppLink } from '@/components/AppLink'
import { Markdown } from '@/components/Markdown'
import { expandMagicLinks } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePageArt } from '@/hooks/usePageArt'
import type { PostEntry } from '@/types/content'

interface PostPageProps {
  entry: PostEntry
}

export function PostPage({ entry }: PostPageProps) {
  const { meta, body } = entry
  usePageMeta(meta)
  usePageArt(meta.art ?? 'plum')

  const content = expandMagicLinks(body)

  return (
    <article className="prose m-auto slide-enter-content">
      <p className="post-back">
        <AppLink to="/posts">← cd ..</AppLink>
      </p>
      {meta.title && <h1>{meta.title}</h1>}
      {meta.date && (
        <p className="post-meta">
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
        </p>
      )}
      <Markdown highlights={entry.highlights}>{content}</Markdown>
    </article>
  )
}
