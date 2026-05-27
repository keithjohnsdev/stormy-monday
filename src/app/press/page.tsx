import type { Metadata } from 'next'
import SectionHeader from '@/components/ui/SectionHeader'
import { content } from '@/content'

export const metadata: Metadata = {
  title: 'Press',
  description: 'Press coverage and media for Stormy Monday, Miami Beach.',
}

const { press, site } = content

export default function PressPage() {
  return (
    <div className="pt-16">
      <section className="max-w-4xl mx-auto px-6 py-24">
        <SectionHeader eyebrow={press.eyebrow} heading={press.heading} />

        <div className="mt-12 space-y-6">
          {press.coverage.map(({ outlet, score, quote, url, date }) => (
            <a
              key={outlet}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-storm-card border border-storm-border p-7 hover:border-storm-gold transition-colors group"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs tracking-widest uppercase text-storm-gold mb-1">{outlet}</p>
                  <p className="text-xs text-storm-muted">{date}</p>
                </div>
                <span className="font-display text-storm-cream text-lg shrink-0">{score}</span>
              </div>
              <p className="text-storm-muted text-sm leading-relaxed italic">"{quote}"</p>
              <p className="text-xs tracking-widest uppercase text-storm-muted group-hover:text-storm-gold transition-colors mt-4">
                Read Article →
              </p>
            </a>
          ))}
        </div>

        <div className="mt-16 border-t border-storm-border pt-10 text-center">
          <p className="text-storm-muted text-sm mb-2">{press.inquiriesLabel}</p>
          <a
            href={`mailto:${site.pressEmail}`}
            className="text-storm-gold hover:text-storm-gold-light transition-colors text-sm"
          >
            {site.pressEmail}
          </a>
        </div>
      </section>
    </div>
  )
}
