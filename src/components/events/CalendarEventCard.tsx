import Link from 'next/link'
import type { CalendarEvent } from '@/types'

interface Props {
  event: CalendarEvent
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    day:  d.toLocaleDateString('en-US', { weekday: 'long' }),
    date: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
  }
}

export default function CalendarEventCard({ event }: Props) {
  const { day, date } = formatDate(event.date)

  return (
    <article className="relative bg-storm-card border border-storm-border hover:border-storm-gold transition-colors group cursor-pointer">
      <Link href="/events" className="absolute inset-0 z-0" aria-label={`View ${event.name}`} />

      {/* Decorative header */}
      <div className="aspect-[4/3] bg-storm-dark relative overflow-hidden flex items-center justify-center">
        <span className="font-display text-6xl text-storm-border group-hover:text-storm-border/70 transition-colors select-none">
          ✦
        </span>
        {event.featured && (
          <div className="absolute top-3 left-3 bg-storm-gold text-storm-black text-xs px-2 py-1 font-semibold tracking-wider uppercase">
            Featured
          </div>
        )}
        <div className="absolute top-3 right-3 bg-storm-black/70 text-storm-muted text-xs px-2 py-1 tracking-widest uppercase">
          Special Event
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="text-xs tracking-widest uppercase text-storm-gold mb-1">
          {day} · {date}
        </p>
        <h3 className="font-display text-xl text-storm-cream mb-1 leading-tight">
          {event.name}
        </h3>
        {event.description && (
          <p className="text-storm-muted text-sm leading-relaxed mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-storm-border">
          <span className="text-xs text-storm-muted">{event.startTime}</span>
          {event.ticketed && event.ticketLink ? (
            <a
              href={event.ticketLink}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 text-xs tracking-widest uppercase text-storm-gold hover:text-storm-gold/80 transition-colors"
            >
              Tickets →
            </a>
          ) : (
            <span className="text-xs text-storm-muted">Free · Walk-in</span>
          )}
        </div>
      </div>
    </article>
  )
}
