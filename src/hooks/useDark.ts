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

/**
 * Circular expand/collapse dark mode toggle via View Transition API.
 * Inspired by antfu.me
 * @see https://github.com/antfu/antfu.me
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
function runViewTransitionToggle(
  event: Pick<MouseEvent, 'clientX' | 'clientY'>,
  nextDark: boolean,
  apply: () => void,
) {
  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  )

  const transition = document.startViewTransition!(() => {
    document.documentElement.dataset.themeTransition = 'true'
    flushSync(apply)
  })

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ]

    document.documentElement.animate(
      {
        clipPath: nextDark ? [...clipPath].reverse() : clipPath,
      },
      {
        duration: 400,
        easing: 'ease-out',
        fill: 'forwards',
        pseudoElement: nextDark
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      },
    )
  })

  transition.finished.finally(() => {
    delete document.documentElement.dataset.themeTransition
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

  const toggleDark = useCallback((event: Pick<MouseEvent, 'clientX' | 'clientY'>) => {
    const nextDark = !isDark

    if (!canUseViewTransition()) {
      applyDarkMode(nextDark)
      return
    }

    runViewTransitionToggle(
      event,
      nextDark,
      () => applyDarkMode(nextDark),
    )
  }, [isDark, applyDarkMode])

  return { isDark, toggleDark }
}
