import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './lib/nprogress'
import App from './App.tsx'
import { NProgressHandler } from './components/NProgressHandler.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NProgressHandler />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
