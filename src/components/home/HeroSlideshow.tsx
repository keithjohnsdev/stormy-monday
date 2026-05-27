'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

// Press photography — sources: Miami New Times, TimeOut Miami
// Add Instagram CDN URLs here as they become available
const SLIDES = [
  {
    src: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/CP1A255401.jpg',
    alt: 'The bar at Stormy Monday',
  },
  // {
  //   src: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/storymy-monday-2-e1772473503670.jpg',
  //   alt: 'Inside Stormy Monday, Miami Beach',
  // },
  // {
  //   src: 'https://media.timeout.com/images/106379421/750/422/image.jpg',
  //   alt: 'Stormy Monday — TimeOut Miami',
  // },
  {
    src: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/stormy-monday-e1772473529632.png',
    alt: 'James MacInnes and Chef Seth Blumenthal',
  },
]

const DISPLAY_MS  = 10000  // how long each image shows
const DISSOLVE_MS = 1500  // crossfade duration

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(
      () => setCurrent(i => (i + 1) % SLIDES.length),
      DISPLAY_MS
    )
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden">
      {SLIDES.map(({ src, alt }, i) => (
        <div
          key={src}
          className={`absolute inset-0 animate-ken-burns transition-opacity ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transitionDuration: `${DISSOLVE_MS}ms`,
            // stagger each slide through the 20s Ken Burns cycle so no two look identical
            animationDelay: `${-(i * (20 / SLIDES.length))}s`,
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="50vw"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  )
}
