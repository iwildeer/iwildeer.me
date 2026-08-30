import { useState } from 'react'
import type { PhotoItem } from '@/types/content'
import { Icon } from '@/components/Icon'

type GalleryView = 'cover' | 'contain'

const VIEW_STORAGE_KEY = 'photos-gallery-view'

function readStoredView(): GalleryView {
  return localStorage.getItem(VIEW_STORAGE_KEY) === 'contain' ? 'contain' : 'cover'
}

interface ListPhotosProps {
  photos: PhotoItem[]
}

/**
 * Square-cropped photo grid with a cover/contain view toggle.
 * Layout ported from antfu.me's PhotoGrid / PhotoGalleryAll.
 * @see https://github.com/antfu/antfu.me
 */
export function ListPhotos({ photos }: ListPhotosProps) {
  const [view, setView] = useState<GalleryView>(readStoredView)

  if (photos.length === 0)
    return <div className="post-list-empty">{'{ nothing here yet }'}</div>

  function toggleView() {
    setView((current) => {
      const next: GalleryView = current === 'cover' ? 'contain' : 'cover'
      localStorage.setItem(VIEW_STORAGE_KEY, next)
      return next
    })
  }

  return (
    <>
      <div className="photos-toggle">
        <button type="button" title="Switch view" aria-label="Switch photo view" onClick={toggleView}>
          <Icon icon={view === 'cover' ? 'ri:grid-line' : 'ri:layout-masonry-line'} />
        </button>
      </div>
      <div className={`photos ${view}`}>
        {photos.map((photo, index) => (
          <img
            key={photo.name}
            src={photo.url}
            alt={photo.text ?? ''}
            data-photo-index={index}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </>
  )
}
