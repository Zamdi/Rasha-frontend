/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surface colors via CSS vars (no opacity modifiers needed)
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
        // Colors that use opacity modifiers — must be static hex for Tailwind to generate rgba
        'outline':              ({ opacityValue }) => opacityValue ? `rgba(140,144,158,${opacityValue})` : '#8c909e',
        'outline-variant':      ({ opacityValue }) => opacityValue ? `rgba(66,71,82,${opacityValue})` : '#424752',
        'secondary-fixed':      ({ opacityValue }) => opacityValue ? `rgba(116,245,255,${opacityValue})` : '#74f5ff',
        'secondary-fixed-dim':  ({ opacityValue }) => opacityValue ? `rgba(0,219,231,${opacityValue})` : '#00dbe7',
        'secondary-container':  ({ opacityValue }) => opacityValue ? `rgba(0,241,254,${opacityValue})` : '#00f1fe',
        'error':                ({ opacityValue }) => opacityValue ? `rgba(255,180,171,${opacityValue})` : '#ffb4ab',
        'error-container':      ({ opacityValue }) => opacityValue ? `rgba(147,0,10,${opacityValue})` : '#93000a',
      },
      fontFamily: {
        sans:    ['Inter', 'Noto Kufi Arabic', 'sans-serif'],
        display: ['Montserrat', 'Noto Kufi Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
