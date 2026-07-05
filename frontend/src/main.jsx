import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './lib/ToastContext.jsx'
import { ToastContainer } from './components/ui/Toast.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
      {/* ToastContainer reads from ToastContext — renders the fixed toast stack */}
      <ToastContainer />
    </ToastProvider>
  </StrictMode>,
)

