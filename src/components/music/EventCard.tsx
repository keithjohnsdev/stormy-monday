import Image from 'next/image'
import { Show } from '@/types'

interface Props {
  show: Show
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    day:     d.toLocaleDateString('en-US', { weekday: 'long' }),
    date:    d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
    short:   d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }
}

export default function EventCard({ show }: Props) {
  const { day, date } = formatDate(show.date)

  return (
    <article className="bg-storm-card border border-storm-border hover:border-storm-gold transition-colors group">
      {/* Artist photo */}
      <div className="aspect-[4/3] bg-storm-dark relative overflow-hidden">
        {show.artistPhoto ? (
          <Image
            src={show.artistPhoto}
            alt={show.artistName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl text-storm-border">♪</span>
          </div>
        )}
        {show.featured && (
          <div className="absolute top-3 left-3 bg-storm-gold text-storm-black text-xs px-2 py-1 font-semibold tracking-wider uppercase">
            Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="text-xs tracking-widest uppercase text-storm-gold mb-1">
          {day} · {date}
        </p>
        <h3 className="font-display text-xl text-storm-cream mb-1 leading-tight">
          {show.artistName}
        </h3>
        {show.genre && (
          <p className="text-storm-muted text-sm mb-3">{show.genre}</p>
        )}
        {show.description && (
          <p className="text-storm-muted text-sm leading-relaxed mb-4 line-clamp-2">
            {show.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-storm-border">
          <div className="text-xs text-storm-muted">
            {show.startTime && <span>{show.startTime}</span>}
            {show.startTime && show.coverCharge && <span className="mx-2">·</span>}
            {show.coverCharge && <span>{show.coverCharge}</span>}
            {!show.startTime && !show.coverCharge && (
              <span>Walk-in welcome</span>
            )}
          </div>
          {show.ticketLink ? (
            <a
              href={show.ticketLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-widest uppercase text-storm-gold hover:text-storm-gold-light transition-colors"
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
