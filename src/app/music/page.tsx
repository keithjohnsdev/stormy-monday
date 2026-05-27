import type { Metadata } from 'next'
import { getUpcomingShows } from '@/lib/shows'
import ShowsGrid from '@/components/music/ShowsGrid'
import SectionHeader from '@/components/ui/SectionHeader'
import { content } from '@/content'

export const metadata: Metadata = {
  title: 'Music & Events',
  description: 'Live music schedule at Stormy Monday, Miami Beach. Shows every Monday and Friday.',
}

const { music } = content

export default function MusicPage() {
  const shows = getUpcomingShows()

  return (
    <div className="pt-16">
      <section className="max-w-5xl mx-auto px-6 py-24">
        <SectionHeader
          eyebrow={music.eyebrow}
          heading={music.heading}
          subheading={music.subheading}
        />
        <div className="mt-12">
          <ShowsGrid shows={shows} />
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
