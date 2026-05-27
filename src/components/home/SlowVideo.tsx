'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function SlowVideo({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const tryPlay = () => {
      video.muted = true
      video.play().then(() => {
        video.playbackRate = 0.4
      }).catch(() => {})
    }

    video.addEventListener('canplay', tryPlay, { once: true })
    tryPlay()

    const onInteract = () => tryPlay()
    document.addEventListener('touchstart', onInteract, { once: true })
    document.addEventListener('click', onInteract, { once: true })

    return () => {
      document.removeEventListener('touchstart', onInteract)
      document.removeEventListener('click', onInteract)
    }
  }, [])

  return (
    <>
      {/* Mobile — animated GIF autoplays as <img>, no browser restrictions */}
      <Image
        src="/videos/storm-clouds-mobile.gif"
        alt=""
        fill
        unoptimized
        className={`${className} md:hidden`}
      />
      {/* Desktop — slowed video */}
      <video ref={ref} autoPlay loop muted playsInline className={`${className} hidden md:block`}>
        <source src="/videos/storm-clouds.mp4" type="video/mp4" />
      </video>
    </>
  )
}
