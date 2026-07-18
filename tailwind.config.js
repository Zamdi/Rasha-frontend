/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'surface':                   'var(--color-surface)',
        'surface-dim':               'var(--color-surface-dim)',
        'surface-container-lowest':  'var(--color-surface-container-lowest)',
        'surface-container-low':     'var(--color-surface-container-low)',
        'surface-container':         'var(--color-surface-container)',
        'surface-container-high':    'var(--color-surface-container-high)',
        'surface-container-highest': 'var(--color-surface-container-highest)',
        'surface-bright':            'var(--color-surface-bright)',
        'surface-variant':           'var(--color-surface-variant)',
        'on-surface':                'var(--color-on-surface)',
        'on-surface-variant':        'var(--color-on-surface-variant)',
        'primary':                   'var(--color-primary)',
        'on-primary':                'var(--color-on-primary)',
        'primary-container':         'var(--color-primary-container)',
        'background':                'var(--color-background)',
        'on-background':             'var(--color-on-background)',
        // Use rgb channel vars so opacity modifiers work AND colors switch between themes
        'secondary-fixed':      ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgba(var(--color-secondary-fixed-rgb), ${opacityValue})`
            : 'var(--color-secondary-fixed)',
        'secondary-fixed-dim':       'var(--color-secondary-fixed-dim)',
        'secondary-container':       'var(--color-secondary-container)',
        'outline':                   'var(--color-outline)',
        'outline-variant':      ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgba(var(--color-outline-variant-rgb), ${opacityValue})`
            : 'var(--color-outline-variant)',
        'error':                ({ opacityValue }) =>
          opacityValue !== undefined
            ? `rgba(var(--color-error-rgb), ${opacityValue})`
            : 'var(--color-error)',
        'error-container':           'var(--color-error-container)',
      },
      fontFamily: {
        sans:    ['Inter', 'Noto Kufi Arabic', 'sans-serif'],
        display: ['Montserrat', 'Noto Kufi Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
