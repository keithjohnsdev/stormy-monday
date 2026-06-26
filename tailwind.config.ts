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
          // Brand accent colors (2025 Brand Guidelines)
          brown:       'rgb(var(--storm-brown) / <alpha-value>)',   // After Dark #5E4943
          green:       'rgb(var(--storm-green) / <alpha-value>)',   // Miami Green #193326
          orange:      'rgb(var(--storm-orange) / <alpha-value>)',  // Sunburnt Orange #8F381E
          blue:        'rgb(var(--storm-blue) / <alpha-value>)',    // Stormy Blue #08242E
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #97793f 0%, #bd9a5a 100%)',
      },
    },
  },
  plugins: [],
}

export default config
