import { content } from '@/content'
import FadeIn from '@/components/ui/FadeIn'

const { pressStrip } = content.home

export default function PressStrip() {
  return (
    <section className="bg-storm-dark border-y border-storm-border py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs tracking-widest uppercase text-storm-gold mb-12 text-center">
          {pressStrip.eyebrow}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pressStrip.coverage.map(({ outlet, quote, detail, url }, i) => (
            <FadeIn key={outlet} delay={i * 100}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative border-l border-storm-border pl-5 group block hover:border-storm-gold/50 transition-colors"
              >
                <p className="text-xs tracking-widest uppercase text-storm-gold mb-3 group-hover:text-storm-gold-light transition-colors">{outlet} ↗</p>
                <p className="text-storm-cream/70 text-sm italic leading-relaxed mb-3">"{quote}"</p>
                <p className="text-xs text-storm-muted tracking-widest">{detail}</p>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
