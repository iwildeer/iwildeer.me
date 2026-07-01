import { useState, type ReactNode } from 'react'
import { PageArtContext, SetPageArtContext, type PageArt } from '@/context/pageArtContext'

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
