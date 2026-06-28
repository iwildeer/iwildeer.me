import { createPortal } from 'react-dom'
import { ArtDots } from './background/ArtDots'
import { ArtPlum } from './background/ArtPlum'

const BG_ROOT = '#bg-root'

/**
 * antfu.me-style background: ArtDots flow-field grid + ArtPlum branches.
 * @see https://github.com/antfu/antfu.me
 */
export function SiteBackground() {
  const host = document.querySelector(BG_ROOT)
  if (!host)
    return null

  return createPortal(
    <div className="site-background">
      <ArtDots />
      <ArtPlum />
    </div>,
    host,
  )
}
