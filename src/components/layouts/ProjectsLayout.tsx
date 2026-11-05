import { ListProjects } from '@/components/ListProjects'
import { Markdown } from '@/components/Markdown'
import type { LayoutProps } from './index'

export function ProjectsLayout({ entry, content }: LayoutProps) {
  const { meta } = entry
  // In practice this layout is inferred from the presence of `projects`
  // frontmatter, so the data is always there; the guard only covers a
  // hand-written `layout: projects` without data (renders nothing, as before).
  if (!meta.projects)
    return null

  const showTitle = Boolean(meta.title) && meta.display !== ''

  return (
    <>
      <header className="project-header">
        {showTitle && <h1>{meta.display ?? meta.title}</h1>}
        {content && <Markdown highlights={entry.highlights}>{content}</Markdown>}
      </header>
      <div className="project-list-wrap">
        <ListProjects projects={meta.projects} />
      </div>
    </>
  )
}
