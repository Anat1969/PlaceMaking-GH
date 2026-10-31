import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './data/custom-walks'
import App from './App'
import 'leaflet/dist/leaflet.css'
import './app.css'
import './workspace.css'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

if ('serviceWorker' in navigator && location.protocol === 'https:' && import.meta.env.BASE_URL === '/') {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
