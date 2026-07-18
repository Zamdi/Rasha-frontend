import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Apply saved theme before render to avoid flash
const savedTheme = localStorage.getItem('rasha_theme') || 'dark'
const isLight = savedTheme === 'light'
document.documentElement.classList.add(isLight ? 'light' : 'dark')
document.documentElement.style.backgroundColor = isLight ? '#f4f1ec' : '#101415'
document.body.style.backgroundColor = isLight ? '#f4f1ec' : '#101415'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
