import { useEffect, useRef } from 'react'

const R180 = Math.PI
const R90 = Math.PI / 2
const R15 = Math.PI / 12
const COLOR = '#88888825'
const MIN_BRANCH = 30
const FRAME_INTERVAL = 1000 / 40

function polarToCart(x: number, y: number, r: number, theta: number) {
  return [x + r * Math.cos(theta), y + r * Math.sin(theta)] as const
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

function randomMiddle() {
  return Math.random() * 0.6 + 0.2
}

/**
 * Generative plum branches, ported from antfu.me ArtPlum.
 * @see https://github.com/antfu/antfu.me/blob/main/src/components/ArtPlum.vue
 */
export function ArtPlum() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current)
      return

    const canvasEl = canvasRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = window.innerWidth
    let height = window.innerHeight
    let ctx = initCanvas(canvasEl, width, height)
    let rafId = 0
    let lastFrame = 0
    let disposed = false
    let len = 6

    let pendingSteps: Array<() => void> = []
    let steps: Array<() => void> = []

    function paintFrame() {
      ctx.lineWidth = 1
      ctx.strokeStyle = COLOR
    }

    function step(
      x: number,
      y: number,
      rad: number,
      counter: { value: number } = { value: 0 },
    ) {
      const length = Math.random() * len
      counter.value += 1
      const [nx, ny] = polarToCart(x, y, length, rad)

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(nx, ny)
      ctx.stroke()

      if (nx < -100 || nx > width + 100 || ny < -100 || ny > height + 100)
        return

      const rate = counter.value <= MIN_BRANCH ? 0.8 : 0.5
      const rad1 = rad + Math.random() * R15
      const rad2 = rad - Math.random() * R15

      if (Math.random() < rate)
        pendingSteps.push(() => step(nx, ny, rad1, counter))
      if (Math.random() < rate)
        pendingSteps.push(() => step(nx, ny, rad2, counter))
    }

    function startGrowth() {
      pendingSteps = []
      steps = []
      len = 6
      ctx.clearRect(0, 0, width, height)
      paintFrame()

      const seeds: Array<() => void> = [
        () => step(width * randomMiddle(), -5, R90),
        () => step(width * randomMiddle(), height + 5, -R90),
        () => step(-5, height * randomMiddle(), 0),
        () => step(width + 5, height * randomMiddle(), R180),
      ]

      steps.push(...(width < 500 ? seeds.slice(0, 2) : seeds))
    }

    function tick(now: number) {
      if (disposed)
        return

      rafId = requestAnimationFrame(tick)

      if (document.hidden || document.documentElement.dataset.themeTransition === 'true')
        return

      if (now - lastFrame < FRAME_INTERVAL)
        return

      lastFrame = now

      if (!steps.length) {
        startGrowth()
        return
      }

      pendingSteps = []
      const current = steps
      steps = []

      for (const run of current) {
        if (Math.random() < 0.5)
          steps.push(run)
        else
          run()
      }

      pendingSteps.forEach(item => steps.push(item))
    }

    function runStaticBurst() {
      ctx = initCanvas(canvasEl, width, height)
      paintFrame()
      startGrowth()

      let guard = 0
      while (steps.length && guard < 900) {
        pendingSteps = []
        const current = steps
        steps = []
        for (const run of current)
          run()
        pendingSteps.forEach(item => steps.push(item))
        guard++
      }
    }

    function handleResize() {
      width = window.innerWidth
      height = window.innerHeight
      ctx = initCanvas(canvasEl, width, height)
      if (reducedMotion)
        runStaticBurst()
      else
        startGrowth()
    }

    window.addEventListener('resize', handleResize)

    if (reducedMotion)
      runStaticBurst()
    else {
      startGrowth()
      rafId = requestAnimationFrame(tick)
    }

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="site-background-plum" aria-hidden="true" />
}
