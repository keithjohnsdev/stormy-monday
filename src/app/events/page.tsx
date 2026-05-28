import type { Metadata } from 'next'
import { getUpcomingShows } from '@/lib/shows'
import { getUpcomingEvents } from '@/lib/events'
import EventsGrid from '@/components/events/EventsGrid'
import SectionHeader from '@/components/ui/SectionHeader'
import { content } from '@/content'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming events and live music at Stormy Monday, Miami Beach.',
}

const { music } = content

export default function EventsPage() {
  const shows  = getUpcomingShows()
  const events = getUpcomingEvents()

  return (
    <div className="pt-16">
      <section className="max-w-5xl mx-auto px-6 py-24">
        <SectionHeader
          eyebrow="Live Music & Special Events"
          heading="What's On"
          subheading="Live music every Monday and Friday, plus special events throughout the year."
        />
        <div className="mt-12">
          <EventsGrid shows={shows} events={events} />
        </div>
      </section>

      <section className="bg-storm-card border-y border-storm-border py-14">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs tracking-widest uppercase text-storm-gold mb-4">
            {music.regularProgramming.eyebrow}
          </p>
          <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto">
            {music.regularProgramming.nights.map(({ day, detail }) => (
              <div key={day}>
                <p className="font-display text-2xl text-storm-cream mb-1">{day}</p>
                <p className="text-storm-muted text-sm">{detail}</p>
              </div>
            ))}
          </div>
          <div className="gold-divider mx-auto mt-8" />
          <p className="text-storm-muted text-sm">{music.regularProgramming.tagline}</p>
        </div>
      </section>
    </div>
  )
}
