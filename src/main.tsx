// Initialize RUM before any other imports (only in production)
import { initializeRUM } from './rum'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize Elastic RUM monitoring only if explicitly enabled
if (import.meta.env.VITE_ELASTIC_RUM_ENABLED === 'true' && import.meta.env.VITE_ELASTIC_RUM_SERVER_URL) {
  console.log('🚀 Initializing RUM in production mode');
  initializeRUM();
} else {
  console.log('📊 RUM disabled - running in development mode without monitoring');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 