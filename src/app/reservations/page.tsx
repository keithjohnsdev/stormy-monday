import type { Metadata } from 'next'
import SectionHeader from '@/components/ui/SectionHeader'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Reservations',
  description: 'Reserve a table at Stormy Monday, Miami Beach.',
}

export default function ReservationsPage() {
  return (
    <div className="pt-16">
      <section className="max-w-3xl mx-auto px-6 py-24">
        <SectionHeader
          eyebrow="Book Your Visit"
          heading="Reservations"
          subheading="We're an intimate space — 55 seats, 10 at the bar. Reservations are recommended, especially on music nights."
        />

        <div className="mt-10">
          <a
            href="https://www.opentable.com/r/stormy-monday-bar-miami-beach"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Reserve on OpenTable
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="border-t border-storm-border pt-6">
            <h3 className="font-display text-lg text-storm-cream mb-3">Bar Seating</h3>
            <p className="text-storm-muted text-sm leading-relaxed">
              Our 10-seat bar is first-come, first-served. Pull up a stool and talk to the people making your drink.
            </p>
          </div>
          <div className="border-t border-storm-border pt-6">
            <h3 className="font-display text-lg text-storm-cream mb-3">Music Nights</h3>
            <p className="text-storm-muted text-sm leading-relaxed">
              Live music every Monday and Friday, 8–11pm. We recommend reserving ahead on those nights — the room fills up.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-storm-border pt-8 text-center">
          <p className="text-storm-muted text-sm mb-4">
            Looking to book the full venue for a private event?
          </p>
          <Link href="/private-events" className="btn-outline">
            Private Events
          </Link>
        </div>
      </section>
    </div>
  )
}
