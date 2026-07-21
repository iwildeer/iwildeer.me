import { useSearchParams } from 'react-router-dom'
import { AppLink } from '@/components/AppLink'
import type { MediaItem } from '@/types/content'

interface ListMediaProps {
  media: Record<string, MediaItem[]>
}

export function ListMedia({ media }: ListMediaProps) {
  const groups = Object.entries(media)
  const types = groups.map(([type]) => type)

  const [params, setParams] = useSearchParams()
  const active = params.get('type') ?? types[0] ?? ''
  const items = groups.find(([type]) => type === active)?.[1] ?? []

  function selectType(type: string) {
    const next = new URLSearchParams(params)
    next.set('type', type)
    setParams(next, { replace: true })
  }

  return (
    <div className="media-consumption">
      <nav className="media-tabs" aria-label="Media types">
        <div className="media-tab-links">
          {types.map(type => (
            <button
              key={type}
              type="button"
              className={`media-tab${type === active ? ' media-tab-active' : ''}`}
              onClick={() => selectType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </nav>

      {items.length === 0
        ? (
            <div className="post-list-empty">{'{ nothing here yet }'}</div>
          )
        : (
            <table className="media-table">
              <tbody>
                {items.map((item, idx) => (
                  <tr key={`${active}-${item.title}-${idx}`}>
                    <td>
                      {item.link
                        ? (
                            <AppLink to={item.link} title={item.title}>
                              {item.title}
                            </AppLink>
                          )
                        : item.title}
                    </td>
                    {item.author && <td>{item.author}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
    </div>
  )
}
