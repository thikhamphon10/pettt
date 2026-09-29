import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import PublicBooking from './pages/PublicBooking.jsx'
import './index.css'

const isPublicBooking = window.location.pathname.startsWith('/booking')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isPublicBooking ? <PublicBooking /> : <App />}
  </React.StrictMode>
)
