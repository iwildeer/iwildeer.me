/// <reference types="vite/client" />

declare module '*.md?raw' {
  const content: string
  export default content
}

interface ViewTransition {
  ready: Promise<void>
  finished: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition: () => void
}

interface Document {
  startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition
}

interface AnimationOptions {
  pseudoElement?: string
}
