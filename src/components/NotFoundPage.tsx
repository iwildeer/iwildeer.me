import Markdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { AppLink } from '@/components/AppLink'
import { expandMagicLinks, getNotFoundSource, parseMarkdown } from '@/lib/content'
import { markdownComponents } from '@/lib/markdownComponents'
import { usePageMeta } from '@/hooks/usePageMeta'

export function NotFoundPage() {
  const source = getNotFoundSource()
  const { meta, body } = source
    ? parseMarkdown(source)
    : { meta: { title: '404 Not Found', description: 'Page not found' }, body: 'The page you are looking for does not exist.' }

  usePageMeta(meta)
  const content = expandMagicLinks(body)

  return (
    <article className="prose m-auto slide-enter-content">
      {meta.title && <h1>{meta.title}</h1>}
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={markdownComponents}>{content}</Markdown>
      <p>
        <AppLink to="/">← Back to home</AppLink>
      </p>
    </article>
  )
}
