/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // We ship dark-mode-only — leaving darkMode default but we force the dark
  // tokens directly via colors.dark.* so this doesn't matter.
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f0a500',
          light: '#ffc56c',
          dim: '#ffba44',
          fixed: '#ffddaf',
        },
        dark: {
          DEFAULT: '#12121e',
          50: '#1a1a27',
          100: '#1f1e2b',
          200: '#292936',
          300: '#343341',
          400: '#383846',
        },
        outline: {
          DEFAULT: '#9f8e79',
          variant: '#514533',
        },
        text: {
          DEFAULT: '#e3e0f2',
          muted: '#d6c4ac',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ffb4ab',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['"Noto Serif"', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xl': ['60px',  { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['48px', { lineHeight: '1.2', fontWeight: '600' }],
        'headline-md': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-sm': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-bold': ['14px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '700' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      maxWidth: {
        container: '1280px',
      },
      boxShadow: {
        card: '0 12px 30px rgba(0, 0, 0, 0.30)',
        'card-hover': '0 18px 40px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};
