import Link from 'next/link'
import { content } from '@/content'
import FadeIn from '@/components/ui/FadeIn'

const { infoStrip } = content.home

export default function InfoStrip() {
  return (
    <FadeIn>
    <div className="bg-storm-dark border-y border-storm-border">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 text-sm text-storm-muted">
          <span>
            <span className="text-storm-gold font-semibold">{infoStrip.hoursLabel}</span>
            &nbsp;&nbsp;{infoStrip.hours}
          </span>
          <span>
            <span className="text-storm-gold font-semibold">{infoStrip.locationLabel}</span>
            &nbsp;&nbsp;{infoStrip.location}
          </span>
          <span>
            <span className="text-storm-gold font-semibold">{infoStrip.happyHourLabel}</span>
            &nbsp;&nbsp;{infoStrip.happyHour}
          </span>
        </div>
        <Link href="/reservations" className="btn-primary text-xs whitespace-nowrap">
          {infoStrip.cta}
        </Link>
      </div>
    </div>
    </FadeIn>
  )
}
