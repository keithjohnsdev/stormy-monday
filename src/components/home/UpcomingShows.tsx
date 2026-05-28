import Image from 'next/image'
import Link from 'next/link'
import { Show } from '@/types'
import { content } from '@/content'
import FadeIn from '@/components/ui/FadeIn'

const { upcomingShows } = content.home

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

interface Props {
  shows: Show[]
}

export default function UpcomingShows({ shows }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      <FadeIn>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase text-storm-gold mb-3">{upcomingShows.eyebrow}</p>
            <h2 className="font-display text-3xl text-storm-cream">{upcomingShows.heading}</h2>
          </div>
          <Link href="/music" className="text-xs tracking-widest uppercase text-storm-muted hover:text-storm-gold transition-colors hidden sm:block">
            {upcomingShows.scheduleLink}
          </Link>
        </div>
      </FadeIn>

      {shows.length === 0 ? (
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
          {shows.slice(0, 3).map((show, i) => (
            <FadeIn key={show.id} delay={i * 120}>
              <div className="relative bg-storm-card border border-storm-border overflow-hidden hover:border-storm-gold/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                <Link href="/music" className="absolute inset-0 z-10" aria-label={`View ${show.artistName} on the shows page`} />

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
                    <div className="absolute top-3 left-3 bg-storm-gold text-storm-black text-xs px-2 py-1 font-semibold tracking-wider uppercase z-10">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs tracking-widest uppercase text-storm-gold mb-1">
                    {formatDate(show.date)}
                  </p>
                  <h3 className="font-display text-xl text-storm-cream mb-1">{show.artistName}</h3>
                  {show.genre && (
                    <p className="text-storm-muted text-sm mb-3">{show.genre}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-storm-border/60">
                    <span className="text-xs text-storm-muted">
                      {show.startTime && `${show.startTime}`}
                      {show.coverCharge && ` · ${show.coverCharge}`}
                    </span>
                    {show.ticketed && show.ticketLink ? (
                      <a
                        href={show.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-20 text-xs tracking-widest uppercase text-storm-gold hover:text-storm-gold-light transition-colors"
                      >
                        Tickets →
                      </a>
                    ) : show.artistWebsite ? (
                      <a
                        href={show.artistWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-20 text-xs tracking-widest uppercase text-storm-gold hover:text-storm-gold-light transition-colors"
                      >
                        Website →
                      </a>
                    ) : null}
                  </div>
                </div>

              </div>
            </FadeIn>
          ))}
        </div>
      )}

      <div className="mt-8 text-center sm:hidden">
        <Link href="/music" className="btn-outline text-xs">
          {upcomingShows.scheduleLink}
        </Link>
      </div>

    </section>
  )
}
