import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Apply saved theme before render to avoid flash
const savedTheme = localStorage.getItem('rasha_theme') || 'dark'
document.documentElement.classList.add(savedTheme === 'light' ? 'light' : 'dark')
document.documentElement.style.background = savedTheme === 'light' ? '#f4f1ec' : '#101415'
document.body.style.background = savedTheme === 'light' ? '#f4f1ec' : '#101415'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
