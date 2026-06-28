import { Routes, Route } from 'react-router-dom'
import aboutMd from './content/about.md?raw'
import homeMd from './content/home.md?raw'
import postsMd from './content/posts.md?raw'
import projectsMd from './content/projects.md?raw'
import { Footer } from './components/Footer'
import { MarkdownContent } from './components/MarkdownContent'
import { NavBar } from './components/NavBar'
import { SiteBackground } from './components/SiteBackground'

function App() {
  return (
    <>
      <SiteBackground />
      <div className="relative z-1 text-[var(--fg)]">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<MarkdownContent source={homeMd} />} />
            <Route path="/posts" element={<MarkdownContent source={postsMd} />} />
            <Route path="/projects" element={<MarkdownContent source={projectsMd} />} />
            <Route path="/about" element={<MarkdownContent source={aboutMd} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
