import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from '@/components/Footer'
import { ImageViewer } from '@/components/ImageViewer'
import { NavBar } from '@/components/NavBar'
import { NProgressHandler } from '@/components/NProgressHandler'
import { SiteBackground } from '@/components/SiteBackground'
import { PageArtProvider } from '@/components/PageArtProvider'

function App() {
  const location = useLocation()

  return (
    <PageArtProvider>
      <NProgressHandler />
      <SiteBackground />
      <div className="relative z-1 text-[var(--fg)]">
        <NavBar />
        <main className="site-main">
          <Outlet />
          <Footer />
        </main>
      </div>
      {/* key: navigating closes an open lightbox instead of orphaning it */}
      <ImageViewer key={location.pathname} />
    </PageArtProvider>
  )
}

export default App
