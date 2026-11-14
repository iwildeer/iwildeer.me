import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AppLink } from '@/components/AppLink'
import { Markdown } from '@/components/Markdown'
import { Outline } from '@/components/Outline'
import { expandMagicLinks } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'
import { extractHeadings, scrollToHeading } from '@/lib/toc'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePageArt } from '@/hooks/usePageArt'
import type { PostEntry } from '@/types/content'

interface PostPageProps {
  entry: PostEntry
}

// Ported from antfu.me's WrapperPost.vue: scroll to `location.hash` after
// mount (twice — the second attempt lets fonts/layout settle).
function useHashNavigation(hash: string) {
  useEffect(() => {
    const navigate = () => {
      if (!hash)
        return
      scrollToHeading(decodeURIComponent(hash.slice(1)))
    }
    const retry = window.setTimeout(() => {
      navigate()
      window.setTimeout(navigate, 1000)
    }, 1)
    window.addEventListener('hashchange', navigate)

    return () => {
      window.clearTimeout(retry)
      window.removeEventListener('hashchange', navigate)
    }
  }, [hash])
}

export function PostPage({ entry }: PostPageProps) {
  const { meta, body } = entry
  usePageMeta(meta)
  usePageArt(meta.art ?? 'plum')

  const { hash } = useLocation()
  useHashNavigation(hash)

  const content = expandMagicLinks(body)
  const headings = extractHeadings(content)

  return (
    <article className={`prose m-auto slide-enter-content${meta.tocAlwaysOn ? ' toc-always-on' : ''}`}>
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
      <Outline headings={headings} />
    </article>
  )
}
