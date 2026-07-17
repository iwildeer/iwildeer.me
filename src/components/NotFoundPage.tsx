import { AppLink } from '@/components/AppLink'
import { Markdown } from '@/components/Markdown'
import { expandMagicLinks, getNotFoundEntry, parseMarkdown } from '@/lib/content'
import { usePageMeta } from '@/hooks/usePageMeta'

const FALLBACK_META = { title: '404 Not Found', description: 'Page not found' } as const
const FALLBACK_BODY = 'The page you are looking for does not exist.'

export function NotFoundPage() {
  const entry = getNotFoundEntry()
  const { meta, body } = entry
    ? parseMarkdown(entry.source)
    : { meta: FALLBACK_META, body: FALLBACK_BODY }
  const highlights = entry?.highlights ?? {}

  usePageMeta(meta)
  const content = expandMagicLinks(body)

  return (
    <article className="prose m-auto slide-enter-content">
      {meta.title && <h1>{meta.title}</h1>}
      <Markdown highlights={highlights}>{content}</Markdown>
      <p>
        <AppLink to="/">← Back to home</AppLink>
      </p>
    </article>
  )
}
