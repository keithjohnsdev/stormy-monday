import fs from 'fs'
import path from 'path'

const HERO_DIR = path.join(process.cwd(), 'public', 'images', 'hero')

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp'])

export interface HeroSlide {
  src: string
  alt: string
}

// Fallback press photos used when no local hero images are present
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    src: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/CP1A255401.jpg',
    alt: 'The bar at Stormy Monday',
  },
  {
    src: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/stormy-monday-e1772473529632.png',
    alt: 'James MacInnes and Chef Seth Blumenthal at Stormy Monday',
  },
]

export function getHeroSlides(): HeroSlide[] {
  try {
    const files = fs.readdirSync(HERO_DIR)
    const slides = files
      .filter(f => SUPPORTED.has(path.extname(f).toLowerCase()))
      .sort()
      .map(f => ({ src: `/images/hero/${f}`, alt: 'Stormy Monday, Miami Beach' }))

    return slides.length > 0 ? slides : FALLBACK_SLIDES
  } catch {
    return FALLBACK_SLIDES
  }
}
