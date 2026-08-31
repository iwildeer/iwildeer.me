import { Fragment, type CSSProperties } from 'react'
import { AppLink } from '@/components/AppLink'
import { getPublishedPosts } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'
import type { ListType } from '@/types/content'

interface ListPostsProps {
  type?: ListType
}

function getYear(value: string) {
  return new Date(value).getFullYear()
}

function isSameGroup(current?: string, previous?: string) {
  if (!current || !previous)
    return false
  return getYear(current) === getYear(previous)
}

export function ListPosts({ type = 'blog' }: ListPostsProps) {
  const posts = getPublishedPosts(type)

  if (!posts.length) {
    return <div className="post-list-empty">{'{ nothing here yet }'}</div>
  }

  return (
    <div className="post-list">
      {posts.map((post, idx) => {
        const year = post.meta.date ? getYear(post.meta.date) : undefined
        const showYear = year != null && !isSameGroup(post.meta.date, posts[idx - 1]?.meta.date)

        return (
          <Fragment key={post.slug}>
            {showYear && (
              <div
                className="post-list-year-wrap slide-enter"
                style={{ '--enter-stage': idx - 2, '--enter-step': '60ms' } as CSSProperties}
              >
                <span className="post-list-year" aria-hidden="true">
                  <span className="post-list-year-outline">{year}</span>
                  <span className="post-list-year-deco">{year}</span>
                </span>
              </div>
            )}
            <div
              className="slide-enter"
              style={{ '--enter-stage': idx, '--enter-step': '60ms' } as CSSProperties}
            >
              <AppLink to={`/posts/${post.slug}`} className="item post-list-item">
                <div className="post-list-entry">
                  <div className="post-list-title">{post.meta.title ?? post.slug}</div>
                  {(post.meta.date || post.meta.duration) && (
                    <span className="post-list-meta">
                      {post.meta.date && (
                        <span className="post-list-date">
                          {formatDate(post.meta.date, true)}
                        </span>
                      )}
                      {post.meta.duration && (
                        <span className="post-list-duration">· {post.meta.duration}</span>
                      )}
                    </span>
                  )}
                </div>
              </AppLink>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
