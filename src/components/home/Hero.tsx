import Link from 'next/link'
import { content } from '@/content'
import SlowVideo from './SlowVideo'
import HeroSlideshow from './HeroSlideshow'

const { hero } = content.home

export default function Hero() {
  return (
    <section className="min-h-screen grid lg:grid-cols-2">

      {/* Left panel — storm video behind text, heavy overlay keeps it subtle */}
      <div className="relative flex items-center justify-center px-10 sm:px-16 py-20 pt-28 lg:pt-20 overflow-hidden">

        {/* Video background — slowed to 0.4x in SlowVideo */}
        <SlowVideo className="absolute inset-0 w-full h-full object-cover" />

        {/* Dark overlay — mutes the video so text reads cleanly */}
        <div className="absolute inset-0 bg-storm-black/60 pointer-events-none" />

        {/* Text content */}
        <div className="relative z-10 max-w-md w-full text-center lg:text-left">

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
            className="gold-divider mx-auto lg:mx-0 animate-fade-up"
            style={{ animationDelay: '320ms' }}
          />

          <p
            className="text-storm-muted text-lg italic font-display mb-10 animate-fade-up"
            style={{ animationDelay: '430ms' }}
          >
            <span className="text-storm-cream/55">When it rains,</span> <span className="text-storm-cream">we pour.</span>
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 items-center lg:items-start animate-fade-up"
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

      {/* Right panel — animated photo collage (desktop only) */}
      <div className="relative bg-storm-dark hidden lg:block overflow-hidden">
        <div className="absolute inset-0">
          <HeroSlideshow />
        </div>
      </div>

    </section>
  )
}
