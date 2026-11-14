import { useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { AppLink } from '@/components/AppLink'
import { Markdown } from '@/components/Markdown'
import { Outline } from '@/components/Outline'
import { expandMagicLinks, getPostBySlug } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'
import { extractHeadings, scrollToHeading } from '@/lib/toc'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePageArt } from '@/hooks/usePageArt'
import type { PostEntry, PostLang } from '@/types/content'

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
  // Language variants share the route; `?lang=en` selects the English one.
  const zh = getPostBySlug(entry.slug, 'zh')
  const en = getPostBySlug(entry.slug, 'en')
  const hasBoth = Boolean(zh && en)

  const [searchParams, setSearchParams] = useSearchParams()
  const activeLang: PostLang = hasBoth && searchParams.get('lang') === 'en'
    ? 'en'
    : (zh ? 'zh' : 'en')
  const active = activeLang === 'en' ? (en ?? entry) : (zh ?? entry)

  const { meta, body, highlights } = active
  usePageMeta(meta)
  usePageArt(meta.art ?? 'plum')

  const { hash } = useLocation()
  useHashNavigation(hash)

  const content = expandMagicLinks(body)
  const headings = extractHeadings(content)

  const switchLang = (lang: PostLang) => {
    // Default stays on the clean URL; only the English variant is addressable.
    setSearchParams(lang === 'en' ? { lang: 'en' } : {})
  }

  return (
    <article className={`prose m-auto slide-enter-content${meta.tocAlwaysOn ? ' toc-always-on' : ''}`}>
      <p className="post-back">
        <AppLink to="/posts">← cd ..</AppLink>
      </p>
      {meta.title && <h1>{meta.title}</h1>}
      {meta.date && (
        <p className="post-meta">
          <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          {hasBoth && (
            <span className="post-lang-toggle" role="group" aria-label="Switch language">
              <button
                type="button"
                className={activeLang === 'zh' ? 'post-lang-active' : undefined}
                onClick={() => switchLang('zh')}
              >
                中
              </button>
              <span className="post-lang-sep" aria-hidden="true">/</span>
              <button
                type="button"
                className={activeLang === 'en' ? 'post-lang-active' : undefined}
                onClick={() => switchLang('en')}
              >
                EN
              </button>
            </span>
          )}
        </p>
      )}
      <Markdown highlights={highlights}>{content}</Markdown>
      <Outline headings={headings} />
    </article>
  )
}
