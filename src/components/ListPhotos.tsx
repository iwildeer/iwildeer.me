import type { PhotoItem } from '@/types/content'

interface ListPhotosProps {
  photos: PhotoItem[]
}

export function ListPhotos({ photos }: ListPhotosProps) {
  if (photos.length === 0)
    return <div className="post-list-empty">{'{ nothing here yet }'}</div>

  return (
    <div className="photos">
      {photos.map(photo => (
        <figure key={photo.name}>
          <img
            src={photo.url}
            alt={photo.text ?? ''}
            loading="lazy"
            decoding="async"
          />
          {photo.text && <figcaption>{photo.text}</figcaption>}
        </figure>
      ))}
    </div>
  )
}
