import { useEffect } from 'react'
import type { PageMeta } from '@/types/content'

const SITE_NAME = 'Iwildeer'

function upsertMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const title = meta.title
      ? meta.title.includes(SITE_NAME) ? meta.title : `${meta.title} - ${SITE_NAME}`
      : SITE_NAME

    document.title = title

    if (meta.description)
      upsertMeta('description', meta.description)
  }, [meta.title, meta.description])
}
