import Link from 'next/link'
import type { Show, CalendarEvent } from '@/types'
import { content } from '@/content'
import FadeIn from '@/components/ui/FadeIn'

const { upcomingShows } = content.home

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

type HomeCard =
  | { kind: 'show';  id: string; date: string; featured: boolean; data: Show }
  | { kind: 'event'; id: string; date: string; featured: boolean; data: CalendarEvent }

interface Props {
  shows: Show[]
  events: CalendarEvent[]
}

export default function UpcomingShows({ shows, events }: Props) {
  const todayStr = today()

  const cards: HomeCard[] = [
    ...shows
      .filter(s => s.date >= todayStr)
      .map(s => ({ kind: 'show' as const, id: s.id, date: s.date, featured: s.featured, data: s })),
    ...events
      .filter(e => e.date >= todayStr)
      .map(e => ({ kind: 'event' as const, id: e.id, date: e.date, featured: e.featured ?? false, data: e })),
  ]
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1
      return a.date.localeCompare(b.date)
    })
    .slice(0, 3)

  const cardEl = (card: HomeCard, i: number) => {
    const isShow = card.kind === 'show'
    const show   = isShow ? card.data as Show : null
    const event  = !isShow ? card.data as CalendarEvent : null

    const title    = isShow ? show!.artistName : event!.name
    const subtitle = isShow ? show!.genre : 'Special Event'
    const time     = isShow ? show!.startTime : event!.startTime
    const charge   = isShow ? show!.coverCharge : null
    const ticketed = isShow ? show!.ticketed : event!.ticketed
    const ticketLink = isShow ? show!.ticketLink : event!.ticketLink
    const website  = isShow ? show!.artistWebsite : null
    const desc     = !isShow ? event!.description : null

    return (
      <FadeIn key={card.id} delay={i * 120}>
        <div className="relative bg-storm-card border border-storm-border overflow-hidden hover:border-storm-gold/50 hover:-translate-y-1 transition-all duration-300 group h-full cursor-pointer flex flex-col">
          <Link href="/events" className="absolute inset-0 z-0" aria-label={`View ${title}`} />

          {card.featured && (
            <div className="absolute top-3 right-3 bg-storm-gold text-storm-black text-xs px-2 py-1 font-semibold tracking-wider uppercase z-10">
              Featured
            </div>
          )}

          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-storm-gold/30 transition-colors duration-300 group-hover:border-storm-gold/60" />

          <div className="p-6 flex flex-col flex-1">
            <p className="text-xs tracking-widest uppercase text-storm-gold mb-3">
              {formatDate(card.date)}
            </p>
            <h3 className="font-display text-xl text-storm-cream mb-1">{title}</h3>
            {subtitle && (
              <p className="text-storm-muted text-sm mb-3">{subtitle}</p>
            )}
            {desc && (
              <p className="text-storm-muted text-sm mb-3 line-clamp-2">{desc}</p>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-storm-border/60 mt-auto">
              <span className="text-xs text-storm-muted">
                {time}
                {charge && ` · ${charge}`}
              </span>
              {ticketed && ticketLink ? (
                <a
                  href={ticketLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 text-xs tracking-widest uppercase text-storm-gold hover:text-storm-gold-light transition-colors"
                >
                  Tickets →
                </a>
              ) : website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 text-xs tracking-widest uppercase text-storm-gold hover:text-storm-gold-light transition-colors"
                >
                  Website →
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </FadeIn>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      <FadeIn>
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-3xl text-storm-cream">{upcomingShows.heading}</h2>
          <Link href="/events" className="text-xs tracking-widest uppercase text-storm-muted hover:text-storm-gold transition-colors hidden sm:block">
            {upcomingShows.scheduleLink}
          </Link>
        </div>
      </FadeIn>

      {cards.length === 0 ? (
        <FadeIn delay={100}>
          <div className="border border-storm-border p-10 text-center">
            <p className="text-storm-muted text-sm">{upcomingShows.emptyMessage}</p>
            <a
              href={content.site.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-storm-gold text-xs tracking-widest uppercase mt-4 inline-block hover:text-storm-gold-light transition-colors"
            >
              {upcomingShows.followCta}
            </a>
          </div>
        </FadeIn>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => cardEl(card, i))}
        </div>
      )}

      <div className="mt-8 text-center sm:hidden">
        <Link href="/events" className="btn-outline text-xs">
          {upcomingShows.scheduleLink}
        </Link>
      </div>

    </section>
  )
}
