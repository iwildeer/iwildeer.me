import { useEffect, useRef } from 'react'
import { createNoise3D } from 'simplex-noise'

const SCALE = 200
const LENGTH = 5
const SPACING = 15
const FRAME_INTERVAL = 1000 / 30

interface Dot {
  x: number
  y: number
  opacity: number
}

function initCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

function getForceOnPoint(noise3d: ReturnType<typeof createNoise3D>, x: number, y: number, z: number) {
  return (noise3d(x / SCALE, y / SCALE, z) - 0.5) * 2 * Math.PI
}

/**
 * Flow-field dot grid, ported from antfu.me ArtDots.
 * @see https://github.com/antfu/antfu.me/blob/main/src/components/ArtDots.vue
 */
export function ArtDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current)
      return

    const canvasEl = canvasRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const noise3d = createNoise3D()
    const existingPoints = new Set<string>()
    const dots: Dot[] = []

    let width = window.innerWidth
    let height = window.innerHeight
    let ctx = initCanvas(canvasEl, width, height)
    let rafId = 0
    let lastFrame = 0
    let disposed = false

    function addDots() {
      for (let x = -SPACING / 2; x < width + SPACING; x += SPACING) {
        for (let y = -SPACING / 2; y < height + SPACING; y += SPACING) {
          const id = `${x}-${y}`
          if (existingPoints.has(id))
            continue
          existingPoints.add(id)
          dots.push({ x, y, opacity: Math.random() * 0.5 + 0.5 })
        }
      }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height)
      const isDark = document.documentElement.classList.contains('dark')
      const rgb = isDark ? '136, 136, 136' : '160, 160, 160'
      const t = 0

      for (const dot of dots) {
        const { x, y, opacity } = dot
        const rad = getForceOnPoint(noise3d, x, y, t)
        const len = (noise3d(x / SCALE, y / SCALE, t * 2) + 0.5) * LENGTH
        const nx = x + Math.cos(rad) * len
        const ny = y + Math.sin(rad) * len
        const alpha = (Math.abs(Math.cos(rad)) * 0.8 + 0.2) * opacity * (isDark ? 0.55 : 0.75)

        ctx.beginPath()
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`
        ctx.arc(nx, ny, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function drawFrame(now: number) {
      if (disposed)
        return

      rafId = requestAnimationFrame(drawFrame)

      if (document.hidden || document.documentElement.dataset.themeTransition)
        return

      if (now - lastFrame < FRAME_INTERVAL)
        return

      lastFrame = now

      ctx.clearRect(0, 0, width, height)

      const t = now / 10000
      const isDark = document.documentElement.classList.contains('dark')
      const rgb = isDark ? '136, 136, 136' : '160, 160, 160'

      for (const dot of dots) {
        const { x, y, opacity } = dot
        const rad = getForceOnPoint(noise3d, x, y, t)
        const len = (noise3d(x / SCALE, y / SCALE, t * 2) + 0.5) * LENGTH
        const nx = x + Math.cos(rad) * len
        const ny = y + Math.sin(rad) * len
        const alpha = (Math.abs(Math.cos(rad)) * 0.8 + 0.2) * opacity * (isDark ? 0.55 : 0.75)

        ctx.beginPath()
        ctx.fillStyle = `rgba(${rgb}, ${alpha})`
        ctx.arc(nx, ny, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function handleResize() {
      width = window.innerWidth
      height = window.innerHeight
      ctx = initCanvas(canvasEl, width, height)
      addDots()
      if (reducedMotion)
        drawStatic()
    }

    addDots()
    window.addEventListener('resize', handleResize)

    if (reducedMotion)
      drawStatic()
    else
      rafId = requestAnimationFrame(drawFrame)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="site-background-dots" aria-hidden="true" />
}
