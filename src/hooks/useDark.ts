import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

type ColorSchema = 'auto' | 'light' | 'dark'

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function readStoredSchema(): ColorSchema {
  const stored = localStorage.getItem('color-schema')
  if (stored === 'light' || stored === 'dark' || stored === 'auto')
    return stored
  return 'auto'
}

function resolveDark(schema: ColorSchema) {
  return schema === 'auto' ? getSystemDark() : schema === 'dark'
}

function canUseViewTransition() {
  return typeof document.startViewTransition === 'function'
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function resolveToggleOrigin(
  event: Pick<MouseEvent, 'clientX' | 'clientY'> & {
    currentTarget?: EventTarget | null
  },
) {
  if (event.currentTarget instanceof Element) {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  return {
    x: event.clientX || innerWidth / 2,
    y: event.clientY || innerHeight / 2,
  }
}

/**
 * Circular expand/collapse dark mode toggle via View Transition API.
 * Inspired by antfu.me
 * @see https://github.com/antfu/antfu.me
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
function runViewTransitionToggle(
  event: Pick<MouseEvent, 'clientX' | 'clientY'> & {
    currentTarget?: EventTarget | null
  },
  apply: () => void,
) {
  const root = document.documentElement
  const { x, y } = resolveToggleOrigin(event)

  root.style.setProperty('--vt-x', `${x}px`)
  root.style.setProperty('--vt-y', `${y}px`)

  const transition = document.startViewTransition!(() => {
    root.dataset.themeTransition = 'true'
    flushSync(apply)
  })

  transition.finished.finally(() => {
    delete root.dataset.themeTransition
    root.style.removeProperty('--vt-x')
    root.style.removeProperty('--vt-y')
  })
}

export function useDark() {
  const [schema, setSchema] = useState<ColorSchema>(() => readStoredSchema())
  const [isDark, setIsDark] = useState(() => resolveDark(readStoredSchema()))

  const applyDarkMode = useCallback((nextDark: boolean) => {
    const systemDark = getSystemDark()

    if (nextDark === systemDark) {
      setSchema('auto')
      localStorage.setItem('color-schema', 'auto')
    }
    else {
      const nextSchema = nextDark ? 'dark' : 'light'
      setSchema(nextSchema)
      localStorage.setItem('color-schema', nextSchema)
    }

    setIsDark(nextDark)
    document.documentElement.classList.toggle('dark', nextDark)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => {
      const next = resolveDark(schema)
      setIsDark(next)
      document.documentElement.classList.toggle('dark', next)
    }

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [schema])

  const toggleDark = useCallback((event: Pick<MouseEvent, 'clientX' | 'clientY'> & {
    currentTarget?: EventTarget | null
  }) => {
    const nextDark = !isDark

    if (!canUseViewTransition()) {
      applyDarkMode(nextDark)
      return
    }

    runViewTransitionToggle(event, () => applyDarkMode(nextDark))
  }, [isDark, applyDarkMode])

  return { isDark, toggleDark }
}
