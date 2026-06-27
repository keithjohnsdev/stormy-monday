import Link from 'next/link'
import { content } from '@/content'
import { getHeroSlides } from '@/lib/heroImages'
import SlowVideo from './SlowVideo'
import HeroSlideshow from './HeroSlideshow'

const { hero } = content.home

export default function Hero() {
  const slides = getHeroSlides()
  return (
    <section className="relative">

      {/* Top band — title, tagline & buttons over storm video.
          Full screen on mobile; on desktop it shares the viewport with the
          photo band below (horizontal split). */}
      <div className="relative flex items-center lg:items-start justify-center px-10 sm:px-16 pb-16 pt-36 lg:pt-36 lg:pb-14 overflow-hidden min-h-screen lg:min-h-[58vh]">

        {/* Video background — slowed to 0.4x in SlowVideo */}
        <SlowVideo className="absolute inset-0 w-full h-full object-cover" />

        {/* Dark overlay — mutes the video so text reads cleanly */}
        <div className="absolute inset-0 bg-storm-black/60 pointer-events-none" />

        {/* Fade the storm clouds into the black photo band below (desktop) */}
        <div className="absolute inset-x-0 bottom-0 h-[75px] bg-gradient-to-b from-transparent to-storm-black pointer-events-none hidden lg:block" />

        {/* Text content */}
        <div className="relative z-10 max-w-2xl w-full text-center">

          {/* Compass logo — uncomment when hi-res transparent file arrives from James
          <div
            className="flex justify-center lg:justify-start mb-8 animate-fade-up"
            style={{ animationDelay: '0ms' }}
          >
            <Image
              src="/images/logo-compass.jpg"
              alt="Stormy Monday compass logo"
              width={75}
              height={75}
              className="opacity-90"
            />
          </div>
          */}

          <p
            className="text-xs tracking-[0.4em] uppercase text-storm-gold mb-8 animate-fade-up"
            style={{ animationDelay: '100ms' }}
          >
            {hero.eyebrow}
          </p>

          <h1
            className="font-display text-5xl md:text-6xl text-storm-cream leading-tight mb-6 animate-fade-up"
            style={{ animationDelay: '150ms' }}
          >
            {hero.headline}
          </h1>

          <div
            className="gold-divider mx-auto animate-fade-up"
            style={{ animationDelay: '320ms' }}
          />

          <p
            className="text-storm-muted text-lg italic font-display mb-10 animate-fade-up"
            style={{ animationDelay: '430ms' }}
          >
            <span className="text-storm-cream/55">When it rains,</span> <span className="text-storm-cream">we pour.</span>
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-fade-up"
            style={{ animationDelay: '580ms' }}
          >
            <Link href="/reservations" className="btn-primary w-full sm:w-auto text-center">
              {hero.ctaPrimary}
            </Link>
            <Link href="/events" className="btn-outline w-full sm:w-auto text-center">
              {hero.ctaSecondary}
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom band — two squares filling the width (no gap) up to a max width,
          then centered; swapping on interlaced timing (desktop only) */}
      <div className="bg-storm-black hidden lg:flex justify-center py-12">
        <div className="w-full max-w-6xl flex">
          <div className="relative w-1/2 aspect-square overflow-hidden">
            <HeroSlideshow slides={slides} startIndex={0} phaseMs={6000} />
          </div>
          <div className="relative w-1/2 aspect-square overflow-hidden">
            <HeroSlideshow slides={slides} startIndex={Math.floor(slides.length / 2)} phaseMs={3000} />
          </div>
        </div>
      </div>

    </section>
  )
}
