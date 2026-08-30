import type { CSSProperties } from 'react'
import { AppLink } from '@/components/AppLink'
import { Icon } from '@/components/Icon'
import { Logo } from '@/components/Logo'
import { iconRegistry, type RegisteredIcon } from '@/icons'
import type { ProjectItem } from '@/types/content'

interface ListProjectsProps {
  projects: Record<string, ProjectItem[]>
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[\s/\\]+/g, '-')
}

function isRegisteredIcon(icon: string): icon is RegisteredIcon {
  return icon in iconRegistry
}

function ProjectIcon({ icon }: { icon: string }) {
  if (icon === 'logo') {
    return (
      <div className="project-item-icon" aria-hidden="true">
        <Logo />
      </div>
    )
  }

  if (isRegisteredIcon(icon)) {
    return (
      <div className="project-item-icon" aria-hidden="true">
        <Icon icon={icon} className="project-item-icon-svg" />
      </div>
    )
  }

  if (import.meta.env.DEV)
    console.warn(`[projects] unknown icon "${icon}" — expected "logo" or a name registered in src/icons/index.ts`)
  return null
}

export function ListProjects({ projects }: ListProjectsProps) {
  const groups = Object.entries(projects)
  return (
    <>
      {groups.map(([group, items], groupIndex) => {
        const list = Array.isArray(items) ? items : []
        return (
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
            {list.length === 0 ? (
              <div className="project-empty">To be continued, soon on......</div>
            ) : (
              <div className="project-grid">
                {list.map(item => (
                  <AppLink
                    key={`${group}-${item.name}`}
                    to={item.link}
                    className="item"
                    title={item.name}
                  >
                    {item.icon && <ProjectIcon icon={item.icon} />}
                    <div className="flex-auto">
                      <div className="project-item-name">{item.name}</div>
                      {item.desc && <div className="project-item-desc">{item.desc}</div>}
                    </div>
                  </AppLink>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </>
  )
}
