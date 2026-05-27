import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        storm: {
          black:       'rgb(var(--storm-black) / <alpha-value>)',
          dark:        'rgb(var(--storm-dark) / <alpha-value>)',
          card:        'rgb(var(--storm-card) / <alpha-value>)',
          gold:        'rgb(var(--storm-gold) / <alpha-value>)',
          'gold-light':'rgb(var(--storm-gold-light) / <alpha-value>)',
          cream:       'rgb(var(--storm-cream) / <alpha-value>)',
          muted:       'rgb(var(--storm-muted) / <alpha-value>)',
          border:      'rgb(var(--storm-border) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c49a4a 0%, #d4b06a 100%)',
      },
    },
  },
  plugins: [],
}

export default config
