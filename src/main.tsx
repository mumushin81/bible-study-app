import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HebrewRootsProvider } from './contexts/HebrewRootsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HebrewRootsProvider>
      <App />
    </HebrewRootsProvider>
  </StrictMode>,
)
