import type { Metadata } from 'next'
import SectionHeader from '@/components/ui/SectionHeader'
import { content } from '@/content'

export const metadata: Metadata = {
  title: 'Private Events',
  description: 'Host your private event at Stormy Monday — 55-seat intimate venue at 820 Alton Road, Miami Beach.',
}

const { privateEvents, site } = content

export default function PrivateEventsPage() {
  return (
    <div className="pt-16">
      <section className="max-w-3xl mx-auto px-6 py-24">
        <SectionHeader
          eyebrow={privateEvents.eyebrow}
          heading={privateEvents.heading}
          subheading={privateEvents.subheading}
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {privateEvents.stats.map(({ label, value }) => (
            <div key={label} className="bg-storm-card border border-storm-border p-6 text-center">
              <p className="font-display text-2xl text-storm-cream mb-1">{value}</p>
              <p className="text-xs tracking-widest uppercase text-storm-muted">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 space-y-5 text-storm-muted leading-relaxed">
          {privateEvents.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-14 bg-storm-card border border-storm-border p-8">
          <h3 className="font-display text-xl text-storm-cream mb-6">{privateEvents.form.heading}</h3>
          <form
            className="space-y-5"
            action={`mailto:${site.eventsEmail}`}
            method="get"
            encType="text/plain"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs tracking-widest uppercase text-storm-muted mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-storm-dark border border-storm-border text-storm-cream px-4 py-3 text-sm focus:outline-none focus:border-storm-gold transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-storm-muted mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full bg-storm-dark border border-storm-border text-storm-cream px-4 py-3 text-sm focus:outline-none focus:border-storm-gold transition-colors"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs tracking-widest uppercase text-storm-muted mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  className="w-full bg-storm-dark border border-storm-border text-storm-cream px-4 py-3 text-sm focus:outline-none focus:border-storm-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-storm-muted mb-2">Guest Count</label>
                <input
                  type="number"
                  name="guests"
                  min="1"
                  max="55"
                  placeholder="Up to 55"
                  className="w-full bg-storm-dark border border-storm-border text-storm-cream px-4 py-3 text-sm focus:outline-none focus:border-storm-gold transition-colors placeholder:text-storm-muted"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-storm-muted mb-2">Tell Us About Your Event</label>
              <textarea
                name="details"
                rows={4}
                className="w-full bg-storm-dark border border-storm-border text-storm-cream px-4 py-3 text-sm focus:outline-none focus:border-storm-gold transition-colors resize-none"
              />
            </div>
            <button type="submit" className="btn-primary w-full text-center">
              Send Inquiry
            </button>
          </form>
          <p className="text-xs text-storm-muted mt-4 text-center">
            {privateEvents.form.directLabel}{' '}
            <a href={`mailto:${site.eventsEmail}`} className="text-storm-gold hover:text-storm-gold-light transition-colors">
              {site.eventsEmail}
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
