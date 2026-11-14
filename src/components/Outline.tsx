import { Icon } from '@/components/Icon'
import { onHeadingClick } from '@/lib/toc'
import type { TocHeading } from '@/lib/toc'

interface OutlineProps {
  headings: TocHeading[]
}

export function Outline({ headings }: OutlineProps) {
  if (!headings.length)
    return null

  return (
    <nav className="table-of-contents" aria-label="Table of contents">
      <div className="table-of-contents-anchor" aria-hidden="true">
        <Icon icon="ri:menu-2-fill" />
      </div>
      <ul>
        {headings.map(({ slug, text, depth }) => (
          <li key={slug} data-depth={depth}>
            <a href={`#${slug}`} onClick={event => onHeadingClick(event, slug)}>{text}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
