const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        'surface-alt': token('surface-alt'),
        line: token('line'),
        'line-strong': token('line-strong'),
        ink: token('ink'),
        muted: token('muted'),
        primary: {
          DEFAULT: token('primary'),
          dark: token('primary-dark'),
          soft: token('primary-soft'),
          border: token('primary-border'),
        },
        success: {
          DEFAULT: token('success'),
          soft: token('success-soft'),
        },
        warning: {
          DEFAULT: token('warning'),
          soft: token('warning-soft'),
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        raised: '0 1px 3px 0 rgba(16, 24, 40, 0.08), 0 1px 2px -1px rgba(16, 24, 40, 0.06)',
        pop: '0 16px 40px -12px rgba(16, 24, 40, 0.22)',
      },
      transitionTimingFunction: {
        swift: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 220ms cubic-bezier(0.23, 1, 0.32, 1) both',
      },
    },
  },
}
