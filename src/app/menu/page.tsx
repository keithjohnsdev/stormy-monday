'use client'

import { useState } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { content } from '@/content'

const { menu } = content

export default function MenuPage() {
  const [tab, setTab] = useState<'cocktails' | 'food'>('cocktails')

  return (
    <div className="pt-16">
      <section className="max-w-3xl mx-auto px-6 py-24">
        <SectionHeader
          eyebrow={menu.eyebrow}
          heading={menu.heading}
          subheading={menu.subheading}
        />

        <div className="mt-10 bg-storm-card border border-storm-gold/30 p-5 text-sm">
          <span className="text-storm-gold font-semibold">{menu.happyHour.label}</span>
          <span className="text-storm-muted ml-3">{menu.happyHour.description}</span>
        </div>

        <div className="flex gap-1 mt-10 border-b border-storm-border">
          {(['cocktails', 'food'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-xs tracking-widest uppercase -mb-px border-b-2 transition-colors ${
                tab === t
                  ? 'border-storm-gold text-storm-gold'
                  : 'border-transparent text-storm-muted hover:text-storm-cream'
              }`}
            >
              {t === 'cocktails' ? 'Cocktails' : 'Food'}
            </button>
          ))}
        </div>

        {tab === 'cocktails' && (
          <ul className="mt-8 divide-y divide-storm-border">
            {menu.cocktails.map(({ name, desc, note }) => (
              <li key={name} className="py-6 flex items-start justify-between gap-6">
                <div>
                  <h3 className="font-display text-lg text-storm-cream mb-1">{name}</h3>
                  <p className="text-storm-muted text-sm">{desc}</p>
                  {note && <p className="text-storm-muted text-xs italic mt-1">{note}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'food' && (
          <ul className="mt-8 divide-y divide-storm-border">
            {menu.food.map(({ name, desc }) => (
              <li key={name} className="py-6">
                <h3 className="font-display text-lg text-storm-cream mb-1">{name}</h3>
                {desc && <p className="text-storm-muted text-sm">{desc}</p>}
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-storm-muted mt-10">{menu.disclaimer}</p>
      </section>
    </div>
  )
}
