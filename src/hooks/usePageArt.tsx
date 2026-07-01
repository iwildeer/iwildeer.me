import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type PageArt = 'dots' | 'plum' | 'both'

const PageArtContext = createContext<PageArt>('both')
const SetPageArtContext = createContext<(art: PageArt) => void>(() => {})

export function PageArtProvider({ children }: { children: ReactNode }) {
  const [art, setArt] = useState<PageArt>('both')

  return (
    <PageArtContext.Provider value={art}>
      <SetPageArtContext.Provider value={setArt}>
        {children}
      </SetPageArtContext.Provider>
    </PageArtContext.Provider>
  )
}

export function usePageArt(art: PageArt = 'both') {
  const setArt = useContext(SetPageArtContext)

  useEffect(() => {
    setArt(art)
    return () => setArt('both')
  }, [art, setArt])
}

export function useCurrentPageArt() {
  return useContext(PageArtContext)
}
