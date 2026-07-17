import { useApp } from '../context/AppContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useApp()

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex items-center transition-all duration-200 hover:opacity-80"
      style={{
        width: '52px',
        height: '28px',
        borderRadius: '14px',
        background: isDark ? '#1d2022' : '#e8e4de',
        border: isDark ? '1px solid rgba(116,245,255,0.25)' : '1px solid rgba(0,86,179,0.2)',
        padding: '3px',
        cursor: 'pointer',
      }}
    >
      {/* Track icons */}
      <span
        className="material-symbols-outlined absolute"
        style={{
          fontSize: '14px',
          left: '5px',
          color: isDark ? '#8c909e' : '#f59e0b',
          opacity: isDark ? 0.4 : 1,
          transition: 'all 0.2s',
        }}
      >
        light_mode
      </span>
      <span
        className="material-symbols-outlined absolute"
        style={{
          fontSize: '14px',
          right: '5px',
          color: isDark ? '#74f5ff' : '#8c909e',
          opacity: isDark ? 1 : 0.4,
          transition: 'all 0.2s',
        }}
      >
        dark_mode
      </span>
      {/* Sliding pill */}
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: isDark ? '#74f5ff' : '#0056b3',
          transform: isDark ? 'translateX(24px)' : 'translateX(0)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), background 0.2s',
          flexShrink: 0,
          zIndex: 1,
          position: 'relative',
        }}
      />
    </button>
  )
}
