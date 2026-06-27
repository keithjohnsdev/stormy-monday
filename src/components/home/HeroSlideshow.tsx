'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { HeroSlide } from '@/lib/heroImages'

const DISPLAY_MS  = 6000
const DISSOLVE_MS = 1500

interface Props {
  slides: HeroSlide[]
  /** Slide to show first — lets two instances start on different photos */
  startIndex?: number
  /** Delay before the first advance — stagger two instances for interlaced timing */
  phaseMs?: number
}

export default function HeroSlideshow({ slides, startIndex = 0, phaseMs = DISPLAY_MS }: Props) {
  const [current, setCurrent] = useState(startIndex % Math.max(slides.length, 1))

  useEffect(() => {
    if (slides.length < 2) return
    let interval: ReturnType<typeof setInterval> | undefined
    // First advance after phaseMs, then steady every DISPLAY_MS — offsetting
    // phaseMs between instances keeps their swaps interlaced.
    const first = setTimeout(() => {
      setCurrent(i => (i + 1) % slides.length)
      interval = setInterval(() => setCurrent(i => (i + 1) % slides.length), DISPLAY_MS)
    }, phaseMs)
    return () => { clearTimeout(first); if (interval) clearInterval(interval) }
  }, [slides.length, phaseMs])

  return (
    <div className="relative w-full h-full overflow-hidden">
      {slides.map(({ src, alt }, i) => (
        <div
          key={src}
          className={`absolute inset-0 animate-ken-burns transition-opacity ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transitionDuration: `${DISSOLVE_MS}ms`,
            // stagger each slide through the 20s Ken Burns cycle so no two look identical
            animationDelay: `${-(i * (20 / slides.length))}s`,
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  )
}
