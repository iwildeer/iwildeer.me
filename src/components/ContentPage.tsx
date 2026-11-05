import { expandMagicLinks, parseMarkdown } from '@/lib/content'
import { usePageArt } from '@/hooks/usePageArt'
import { usePageMeta } from '@/hooks/usePageMeta'
import { resolveLayout } from '@/components/layouts'
import type { PageEntry } from '@/types/content'

interface ContentPageProps {
  entry: PageEntry
}

// Thin shell: parse frontmatter, run page-wide hooks, expand magic links,
// then delegate all rendering to the layout component registered in
// components/layouts/index.tsx.
export function ContentPage({ entry }: ContentPageProps) {
  const { meta } = entry
  const { body } = parseMarkdown(entry.source)
  usePageMeta(meta)
  usePageArt(meta.art)

  const Layout = resolveLayout(meta).component
  const content = expandMagicLinks(body)

  return (
    <article className="prose m-auto slide-enter-content">
      <Layout entry={entry} content={content} />
    </article>
  )
}
