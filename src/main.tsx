import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './providers/ThemeProvider.tsx'
import Toaster from './components/ui/Toaster.tsx'
import { LanguageProvider } from './providers/LanguageProvider.tsx'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <App />
        <Toaster />
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>,
)