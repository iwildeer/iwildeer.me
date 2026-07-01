import { createContext } from 'react'

export type PageArt = 'dots' | 'plum' | 'both'

export const PageArtContext = createContext<PageArt>('both')
export const SetPageArtContext = createContext<(art: PageArt) => void>(() => {})
