import { useState } from 'react'
import type { PhotoItem } from '@/types/content'
import { Icon } from '@/components/Icon'

type GalleryView = 'cover' | 'contain'

const VIEW_STORAGE_KEY = 'photos-gallery-view'

function readStoredView(): GalleryView {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === 'contain' ? 'contain' : 'cover'
  }
  catch {
    // Storage can throw in cookie-blocked / sandboxed contexts; the app has
    // no error boundary, so an unguarded read here would blank the whole site.
    return 'cover'
  }
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
    const next: GalleryView = view === 'cover' ? 'contain' : 'cover'
    setView(next)
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next)
    }
    catch {
      // Persistence is best-effort; the in-memory view still toggles.
    }
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
