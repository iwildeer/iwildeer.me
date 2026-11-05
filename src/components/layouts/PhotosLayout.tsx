import { ListPhotos } from '@/components/ListPhotos'
import { Markdown } from '@/components/Markdown'
import type { LayoutProps } from './index'
import { PageTitle } from './PageTitle'

export function PhotosLayout({ entry, content }: LayoutProps) {
  const { meta } = entry
  // photos are glob-assigned to every photos-layout page by lib/content.ts;
  // the guard only covers a hand-written `layout: photos` without data.
  if (!meta.photos)
    return null

  return (
    <>
      <PageTitle meta={meta} isIndex={entry.isIndex} />
      {content && <Markdown highlights={entry.highlights}>{content}</Markdown>}
      <p className="photo-subtitle">
        Photos of my daily life, newest first.
      </p>
      <ListPhotos photos={meta.photos} />
    </>
  )
}
