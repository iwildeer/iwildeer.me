import type { RouteObject } from 'react-router-dom'
import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import { ContentPage } from '@/components/ContentPage'
import { NotFoundPage } from '@/components/NotFoundPage'
import { PostPage } from '@/components/PostPage'
import { pageEntries, postEntries } from '@/lib/content'

const children: RouteObject[] = [
  ...pageEntries.map((entry): RouteObject => {
    if (entry.isIndex) {
      return {
        index: true,
        element: <ContentPage entry={entry} />,
      }
    }
    return {
      path: entry.slug,
      element: <ContentPage entry={entry} />,
    }
  }),
  ...postEntries.map(entry => ({
    path: `posts/${entry.slug}`,
    element: <PostPage entry={entry} />,
  })),
  { path: '*', element: <NotFoundPage /> },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children,
  },
])
