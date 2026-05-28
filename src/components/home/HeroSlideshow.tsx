'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { HeroSlide } from '@/lib/heroImages'

const DISPLAY_MS  = 6000
const DISSOLVE_MS = 1500

interface Props {
  slides: HeroSlide[]
}

export default function HeroSlideshow({ slides }: Props) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(
      () => setCurrent(i => (i + 1) % slides.length),
      DISPLAY_MS
    )
    return () => clearInterval(t)
  }, [slides.length])

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
            sizes="50vw"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  )
}
