import { Markdown } from '@/components/Markdown'
import { SocialLinks } from '@/components/SocialLinks'
import type { Highlights } from '@/types/content'
import type { LayoutProps } from './index'
import { PageTitle } from './PageTitle'

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

export function DefaultLayout({ entry, content }: LayoutProps) {
  const { meta } = entry

  return (
    <>
      <PageTitle meta={meta} isIndex={entry.isIndex} />
      {meta.social
        ? (
            <MarkdownWithSocial content={content} highlights={entry.highlights} />
          )
        : (
            <Markdown highlights={entry.highlights}>{content}</Markdown>
          )}
    </>
  )
}
