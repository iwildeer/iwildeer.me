import type { CSSProperties } from 'react'
import { AppLink } from '@/components/AppLink'
import type { ProjectItem } from '@/types/content'

interface ListProjectsProps {
  projects: Record<string, ProjectItem[]>
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[\s/\\]+/g, '-')
}

export function ListProjects({ projects }: ListProjectsProps) {
  const groups = Object.entries(projects)

  return (
    <>
      {groups.map(([group, items], groupIndex) => (
        <section
          key={group}
          className="slide-enter"
          style={{ '--enter-stage': groupIndex + 1 } as CSSProperties}
        >
          <div
            className="project-group-heading slide-enter"
            id={slugify(group)}
            style={{ '--enter-stage': groupIndex - 2, '--enter-step': '60ms' } as CSSProperties}
          >
            <span className="project-group-title">{group}</span>
          </div>
          <div className="project-grid">
            {items.map(item => (
              <AppLink
                key={`${group}-${item.name}`}
                to={item.link}
                className="item"
                title={item.name}
              >
                <div className="flex-auto">
                  <div className="project-item-name">{item.name}</div>
                  {item.desc && <div className="project-item-desc">{item.desc}</div>}
                </div>
              </AppLink>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
