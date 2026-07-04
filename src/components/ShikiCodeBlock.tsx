import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'
import { shikiThemes } from '@/lib/shiki'

interface ShikiCodeBlockProps {
  code: string
  lang: string
}

export function ShikiCodeBlock({ code, lang }: ShikiCodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    codeToHtml(code, {
      lang,
      themes: shikiThemes,
      defaultColor: false,
    })
      .then((result) => {
        if (!cancelled)
          setHtml(result)
      })
      .catch(() => {
        if (!cancelled) {
          setHtml(
            `<pre class="shiki"><code>${code
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')}</code></pre>`,
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [code, lang])

  if (!html) {
    return (
      <pre className="shiki shiki-loading">
        <code>{code}</code>
      </pre>
    )
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
