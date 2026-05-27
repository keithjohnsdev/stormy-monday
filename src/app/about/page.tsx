import type { Metadata } from 'next'
import SectionHeader from '@/components/ui/SectionHeader'
import { content } from '@/content'

export const metadata: Metadata = {
  title: 'About',
  description: 'The story behind Stormy Monday — craft cocktails and soulful vibes at 820 Alton Road, Miami Beach.',
}

const { story, philosophy, team } = content.about

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Story */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <SectionHeader eyebrow={story.eyebrow} heading={story.heading} />
        <div className="space-y-5 text-storm-muted leading-relaxed mt-8">
          {story.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="text-storm-cream font-display text-xl italic">
            {story.pullQuote}
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-storm-card border-y border-storm-border py-20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          {philosophy.map(({ heading, body }) => (
            <div key={heading}>
              <h3 className="font-display text-xl text-storm-cream mb-3">{heading}</h3>
              <div className="gold-divider" />
              <p className="text-storm-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <SectionHeader eyebrow={team.eyebrow} heading={team.heading} />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          {team.members.map(({ name, role, bio }) => (
            <div key={name} className="border-t border-storm-border pt-8">
              {/* TODO: Replace with real team photography */}
              <div className="w-16 h-16 bg-storm-card border border-storm-border rounded-full mb-5 flex items-center justify-center">
                <span className="font-display text-storm-gold text-xl">{name[0]}</span>
              </div>
              <h3 className="font-display text-xl text-storm-cream mb-1">{name}</h3>
              <p className="text-xs tracking-widest uppercase text-storm-gold mb-4">{role}</p>
              <p className="text-storm-muted text-sm leading-relaxed">{bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
