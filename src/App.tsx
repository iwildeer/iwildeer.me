import { Outlet } from 'react-router-dom'
import { Footer } from '@/components/Footer'
import { NavBar } from '@/components/NavBar'
import { NProgressHandler } from '@/components/NProgressHandler'
import { SiteBackground } from '@/components/SiteBackground'
import { PageArtProvider } from '@/components/PageArtProvider'

function App() {
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
    </PageArtProvider>
  )
}

export default App
