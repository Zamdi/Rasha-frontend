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
        // Fixed hex values for opacity modifier support
        'outline':           '#8c909e',
        'outline-variant':   '#424752',
        'secondary-fixed':   '#74f5ff',
        'secondary-fixed-dim':'#00dbe7',
        'secondary-container':'#00f1fe',
        'error':             '#ffb4ab',
        'error-container':   '#93000a',
        'primary':           'var(--color-primary)',
        'on-primary':        'var(--color-on-primary)',
        'primary-container': 'var(--color-primary-container)',
        'background':        'var(--color-background)',
        'on-background':     'var(--color-on-background)',
      },
      fontFamily: {
        sans:    ['Inter', 'Noto Kufi Arabic', 'sans-serif'],
        display: ['Montserrat', 'Noto Kufi Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
