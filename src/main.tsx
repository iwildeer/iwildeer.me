import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import 'highlight.js/styles/github.min.css'
import '@/index.css'
import '@/lib/nprogress'
import { router } from '@/routes/AppRoutes'

const rootElement = document.getElementById('root')!
createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
