import { useContext, useEffect } from 'react'
import { PageArtContext, SetPageArtContext, type PageArt } from '@/context/pageArtContext'

export type { PageArt } from '@/context/pageArtContext'

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
