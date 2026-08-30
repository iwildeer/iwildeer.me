import { useCallback, useEffect, useState } from 'react'

// The slide-enter entrance animation translates content by up to 10px over
// ~1s (≈2px per 50ms), while scroll momentum moves images by tens of px —
// treat small deltas as "not moving" so clicks during the entrance animation
// still open the viewer.
const MOVE_TOLERANCE_PX = 6

/**
 * Global lightbox for photos and article images: click an image inside
 * `.prose` or `.photos` to view it full-size. Arrow keys move between
 * images tagged with `data-photo-index` (the photos grid), Escape closes.
 * App mounts this with `key={location.pathname}` so a route change remounts
 * it and drops the stored element instead of leaving a zombie overlay.
 * Ported from antfu.me's App.vue image viewer.
 * @see https://github.com/antfu/antfu.me
 */
export function ImageViewer() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  const open = useCallback((img: HTMLImageElement) => {
    setImage(img)
  }, [])

  const close = useCallback(() => {
    setImage(null)
  }, [])

  // Lock background scroll while the viewer is open.
  useEffect(() => {
    if (!image)
      return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [image])

  useEffect(() => {
    async function handleClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof HTMLImageElement))
        return
      if (target.classList.contains('no-preview'))
        return
      const path = event.composedPath()
      if (path.some(el => el instanceof HTMLElement && ['A', 'BUTTON'].includes(el.tagName)))
        return
      if (!path.some(el => el instanceof HTMLElement && (el.classList.contains('prose') || el.classList.contains('photos'))))
        return

      // Do not open the image while it is moving; mainly to avoid
      // conflicting with scrolling on mobile.
      const pos = target.getBoundingClientRect()
      await new Promise(resolve => setTimeout(resolve, 50))
      const newPos = target.getBoundingClientRect()
      if (Math.abs(pos.left - newPos.left) > MOVE_TOLERANCE_PX || Math.abs(pos.top - newPos.top) > MOVE_TOLERANCE_PX)
        return

      open(target)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [open])

  useEffect(() => {
    if (!image)
      return

    const current = image

    function step(delta: number) {
      const index = Number.parseInt(current.dataset.photoIndex ?? '', 10)
      if (Number.isNaN(index))
        return false
      const next = document.querySelector(`img[data-photo-index="${index + delta}"]`)
      if (!(next instanceof HTMLImageElement))
        return false
      setImage(next)
      return true
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') {
        if (step(1))
          event.preventDefault()
      }
      else if (event.key === 'ArrowLeft') {
        if (step(-1))
          event.preventDefault()
      }
      else if (event.key === 'Escape') {
        setImage(null)
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [image])

  if (!image)
    return null

  return (
    <div className="image-viewer" role="dialog" aria-modal="true" onClick={close}>
      <div className="image-viewer-backdrop" />
      <img src={image.currentSrc || image.src} alt={image.alt} />
      {image.alt && <div className="image-viewer-caption">{image.alt}</div>}
    </div>
  )
}
