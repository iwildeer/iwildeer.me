import { createContext, useContext } from 'react'
import type { Highlights } from '@/types/content'

export const HighlightsContext = createContext<Highlights>({})

export function useHighlights(): Highlights {
  return useContext(HighlightsContext)
}
