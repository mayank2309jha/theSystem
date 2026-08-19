import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ConfigError from './components/ConfigError.jsx'
import { isSupabaseConfigured } from './lib/supabaseClient.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isSupabaseConfigured ? <App /> : <ConfigError />}
  </StrictMode>,
)
