import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { expandMagicLinks, parseMarkdown } from '@/lib/content'
import { markdownComponents } from '@/lib/markdownComponents'
import { usePageMeta } from '@/hooks/usePageMeta'
import { usePageArt } from '@/hooks/usePageArt'
import { ListPosts } from '@/components/ListPosts'
import { ListProjects } from '@/components/ListProjects'
import { SocialLinks } from '@/components/SocialLinks'
import type { PageEntry } from '@/types/content'

interface ContentPageProps {
  entry: PageEntry
}

export function ContentPage({ entry }: ContentPageProps) {
  const { meta } = entry
  const { body } = parseMarkdown(entry.source)
  usePageMeta(meta)
  usePageArt(meta.art)

  const layout = meta.layout ?? (meta.projects ? 'projects' : 'default')
  const content = expandMagicLinks(body)
  const showTitle = layout === 'posts-list'
    ? Boolean(meta.title)
    : Boolean(meta.title) && meta.display !== ''

  return (
    <article className="prose m-auto slide-enter-content">
      {showTitle && <h1>{meta.display ?? meta.title}</h1>}

      {layout === 'posts-list' && (
        <>
          {content && <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={markdownComponents}>{content}</Markdown>}
          <ListPosts />
        </>
      )}

      {layout === 'projects' && meta.projects && (
        <div className="project-list-wrap">
          {content && <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={markdownComponents}>{content}</Markdown>}
          <ListProjects projects={meta.projects} />
        </div>
      )}

      {layout === 'default' && (
        <>
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={markdownComponents}>{content}</Markdown>
          {meta.social && <SocialLinks />}
        </>
      )}
    </article>
  )
}
