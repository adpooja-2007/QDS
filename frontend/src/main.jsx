import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Anti-Clickjacking Frame-Busting Protection ──
try {
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }
} catch {
  // If cross-origin framing blocks window.top access, prevent rendering
  document.body.style.display = 'none';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
