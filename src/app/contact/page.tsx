import type { Metadata } from 'next'
import SectionHeader from '@/components/ui/SectionHeader'
import { content } from '@/content'

export const metadata: Metadata = {
  title: 'Contact & Location',
  description: 'Stormy Monday — 820 Alton Road, Miami Beach, FL. Open Thursday–Monday, 5pm–1am.',
}

const { site, contact } = content

export default function ContactPage() {
  return (
    <div className="pt-16">
      <section className="max-w-5xl mx-auto px-6 py-24">
        <SectionHeader eyebrow={contact.eyebrow} heading={contact.heading} />

        {/* Social link buttons */}
        <div className="mt-10 flex flex-wrap gap-3">
          {contact.socials.map(({ label, handle, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('mailto') ? undefined : '_blank'}
              rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              className="inline-flex items-center gap-2 border border-storm-border hover:border-storm-gold text-storm-muted hover:text-storm-gold transition-colors px-4 py-2 text-sm"
            >
              <span className="text-xs tracking-widest uppercase text-storm-gold">{label}</span>
              <span className="text-storm-border">·</span>
              <span>{handle}</span>
            </a>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Left: Info */}
          <div>
            <div className="mb-10">
              <p className="text-xs tracking-widest uppercase text-storm-gold mb-3">Address</p>
              <p className="text-storm-cream text-lg font-display mb-1">{site.address}</p>
              <p className="text-storm-muted">{site.city}</p>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-widest uppercase text-storm-gold hover:text-storm-gold-light transition-colors inline-block mt-3"
              >
                {contact.directionsLabel}
              </a>
            </div>

            <div className="mb-10">
              <p className="text-xs tracking-widest uppercase text-storm-gold mb-3">Phone</p>
              {/* TODO: confirm number with James */}
              <a
                href={`tel:${site.phone.replace(/\D/g, '')}`}
                className="text-storm-cream hover:text-storm-gold transition-colors"
              >
                {site.phone}
              </a>
            </div>

            <div className="mb-10">
              <p className="text-xs tracking-widest uppercase text-storm-gold mb-4">Hours</p>
              <ul className="space-y-3">
                {contact.hours.map(({ day, time, liveMusic }) => (
                  <li key={day}>
                    <div className="flex justify-between text-sm">
                      <span className="text-storm-cream w-28">{day}</span>
                      <span className={time === 'Closed' ? 'text-storm-muted' : 'text-storm-muted'}>
                        {time}
                      </span>
                    </div>
                    {liveMusic && (
                      <div className="flex justify-between text-xs mt-0.5">
                        <span className="w-28" />
                        <span className="text-storm-gold">Live Music {liveMusic}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs tracking-widest uppercase text-storm-gold mb-3">Parking</p>
              <p className="text-storm-muted text-sm leading-relaxed">{contact.parking}</p>
            </div>
          </div>

          {/* Right: Map embed */}
          <div>
            <div className="aspect-square bg-storm-card border border-storm-border overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3592.5!2d-80.1413!3d25.7890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s820+Alton+Rd%2C+Miami+Beach%2C+FL+33139!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Stormy Monday location"
              />
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
