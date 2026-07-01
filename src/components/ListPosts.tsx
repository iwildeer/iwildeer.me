import type { CSSProperties } from 'react'
import { AppLink } from '@/components/AppLink'
import { getPublishedPosts } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'

function getYear(value: string) {
  return new Date(value).getFullYear()
}

function isSameGroup(current?: string, previous?: string) {
  if (!current || !previous)
    return false
  return getYear(current) === getYear(previous)
}

export function ListPosts() {
  const posts = getPublishedPosts()

  if (!posts.length) {
    return <div className="post-list-empty">{'{ nothing here yet }'}</div>
  }

  return (
    <ul>
      {posts.map((post, idx) => {
        const showYear = post.meta.date && !isSameGroup(post.meta.date, posts[idx - 1]?.meta.date)

        return (
          <li key={post.slug}>
            {showYear && post.meta.date && (
              <div
                className="post-list-year-wrap slide-enter"
                style={{ '--enter-stage': idx - 2, '--enter-step': '60ms' } as CSSProperties}
              >
                <span className="post-list-year">{getYear(post.meta.date)}</span>
              </div>
            )}
            <div
              className="slide-enter"
              style={{ '--enter-stage': idx, '--enter-step': '60ms' } as CSSProperties}
            >
              <AppLink to={`/posts/${post.slug}`} className="item post-list-item">
                <div className="post-list-entry">
                  <div className="post-list-title">{post.meta.title ?? post.slug}</div>
                  {post.meta.date && (
                    <span className="post-list-date">{formatDate(post.meta.date)}</span>
                  )}
                </div>
              </AppLink>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
