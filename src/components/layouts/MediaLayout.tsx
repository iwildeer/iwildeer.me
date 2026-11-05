import { ListMedia } from '@/components/ListMedia'
import { Markdown } from '@/components/Markdown'
import type { LayoutProps } from './index'
import { PageTitle } from './PageTitle'

export function MediaLayout({ entry, content }: LayoutProps) {
  const { meta } = entry
  // media data is glob-merged into every media-layout page by lib/content.ts;
  // the guard only covers a hand-written `layout: media` without data.
  if (!meta.media)
    return null

  return (
    <>
      <PageTitle meta={meta} isIndex={entry.isIndex} />
      {content && <Markdown highlights={entry.highlights}>{content}</Markdown>}
      <ListMedia media={meta.media} />
      <p className="media-footnote">
        These are ones I enjoyed, not exhaustive. And not necessarily recommendations.
      </p>
    </>
  )
}
