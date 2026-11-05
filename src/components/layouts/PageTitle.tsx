import type { PageMeta } from '@/types/content'

interface PageTitleProps {
  meta: PageMeta
  isIndex: boolean
}

// Shared `<h1>` for layouts that render the title above the body. Hidden
// when there is no title or `display: ''` (the frontmatter way to suppress
// it). The projects layout renders its own plain `<h1>` instead.
export function PageTitle({ meta, isIndex }: PageTitleProps) {
  if (!meta.title || meta.display === '')
    return null

  return (
    <h1 className={isIndex ? 'flex items-center gap-[0.35em]' : undefined}>
      {isIndex && (
        <img
          src="/avatar.jpg"
          alt=""
          width={48}
          height={48}
          className="no-preview m-0! size-[1.05em] shrink-0 rounded-full object-cover"
        />
      )}
      {meta.display ?? meta.title}
    </h1>
  )
}
