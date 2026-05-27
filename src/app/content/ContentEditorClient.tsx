'use client'

import { useState } from 'react'
import type { content } from '@/content'

type ContentData = typeof content
type Status = 'idle' | 'saving' | 'saved' | 'error'

// ─── field helpers ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{children}</p>
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
    />
  )
}

function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
    />
  )
}

function Field({ label, value, onChange, long = false, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; long?: boolean; rows?: number
}) {
  return (
    <div>
      <Label>{label}</Label>
      {long
        ? <Textarea value={value} onChange={onChange} rows={rows} />
        : <Input value={value} onChange={onChange} />}
    </div>
  )
}

function Section({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  return (
    <details open={defaultOpen} className="group border border-gray-200 rounded-lg overflow-hidden">
      <summary className="flex items-center justify-between cursor-pointer px-6 py-4 bg-gray-50 hover:bg-gray-100 select-none">
        <span className="font-semibold text-gray-800">{title}</span>
        <span className="text-gray-400 text-sm group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="px-6 py-5 grid gap-5 bg-white">
        {children}
      </div>
    </details>
  )
}

function ItemCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-md p-4 grid gap-3">
      <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">{label}</p>
      {children}
    </div>
  )
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
}

// ─── deep update ─────────────────────────────────────────────────────────────

function deepUpdate(obj: ContentData, path: (string | number)[], value: string): ContentData {
  const next = JSON.parse(JSON.stringify(obj)) as ContentData
  let cursor: any = next
  for (let i = 0; i < path.length - 1; i++) cursor = cursor[path[i]]
  cursor[path[path.length - 1]] = value
  return next
}

// ─── main component ───────────────────────────────────────────────────────────

export default function ContentEditorClient({
  initialData,
}: {
  initialData: ContentData
}) {
  const [data, setData] = useState<ContentData>(() => JSON.parse(JSON.stringify(initialData)))
  const [status, setStatus] = useState<Status>('idle')

  const u = (path: (string | number)[]) => (value: string) =>
    setData(prev => deepUpdate(prev, path, value))

  async function handleSave() {
    setStatus('saving')
    try {
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      setStatus(res.ok ? 'saved' : 'error')
      if (res.ok) setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
    }
  }

  const statusBar = {
    saving: <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded">Saving and deploying — this usually takes about 30 seconds…</div>,
    saved:  <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded">Published. Changes will be live in about 30 seconds.</div>,
    error:  <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded">Something went wrong. Check the browser console or try again.</div>,
    idle:   null,
  }[status]

  const SaveButton = () => (
    <button
      onClick={handleSave}
      disabled={status === 'saving'}
      className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded text-sm transition-colors"
    >
      {status === 'saving' ? 'Publishing…' : 'Publish Changes'}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Stormy Monday</p>
            <h1 className="font-bold text-gray-900">Content Editor</h1>
          </div>
          <SaveButton />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 grid gap-4">

        {statusBar && <div>{statusBar}</div>}

        {/* ── Contact Info ──────────────────────────────────────────────────── */}
        <Section title="Contact Information" defaultOpen>
          <TwoCol>
            <Field label="Phone" value={data.site.phone} onChange={u(['site', 'phone'])} />
            <Field label="General Email" value={data.site.email} onChange={u(['site', 'email'])} />
          </TwoCol>
          <TwoCol>
            <Field label="Events Email" value={data.site.eventsEmail} onChange={u(['site', 'eventsEmail'])} />
            <Field label="Press Email" value={data.site.pressEmail} onChange={u(['site', 'pressEmail'])} />
          </TwoCol>
          <TwoCol>
            <Field label="Instagram Handle" value={data.site.instagramHandle} onChange={u(['site', 'instagramHandle'])} />
            <Field label="Tagline" value={data.site.tagline} onChange={u(['site', 'tagline'])} />
          </TwoCol>
        </Section>

        {/* ── Hours ─────────────────────────────────────────────────────────── */}
        <Section title="Hours" defaultOpen>
          {data.contact.hours.map((h, i) => (
            <div key={h.day} className="grid grid-cols-3 gap-3 items-end">
              <div>
                <Label>{h.day}</Label>
                <Input value={h.time} onChange={u(['contact', 'hours', i, 'time'])} />
              </div>
              <div className="col-span-2">
                <Label>Live Music (leave blank if none)</Label>
                <Input value={h.liveMusic ?? ''} onChange={u(['contact', 'hours', i, 'liveMusic'])} />
              </div>
            </div>
          ))}
          <Field label="Parking Info" value={data.contact.parking} onChange={u(['contact', 'parking'])} long />
        </Section>

        {/* ── Menu — Cocktails ──────────────────────────────────────────────── */}
        <Section title="Menu — Cocktails">
          {data.menu.cocktails.map((c, i) => (
            <ItemCard key={i} label={`Cocktail ${i + 1}`}>
              <Field label="Name" value={c.name} onChange={u(['menu', 'cocktails', i, 'name'])} />
              <Field label="Description (ingredients)" value={c.desc} onChange={u(['menu', 'cocktails', i, 'desc'])} long rows={2} />
              <Field label="Note (optional — e.g. 'Earthy and quietly complex')" value={c.note} onChange={u(['menu', 'cocktails', i, 'note'])} />
            </ItemCard>
          ))}
          <Field label="Disclaimer (bottom of menu)" value={data.menu.disclaimer} onChange={u(['menu', 'disclaimer'])} long rows={2} />
        </Section>

        {/* ── Menu — Food ───────────────────────────────────────────────────── */}
        <Section title="Menu — Food">
          {data.menu.food.map((f, i) => (
            <ItemCard key={i} label={`Food Item ${i + 1}`}>
              <Field label="Name" value={f.name} onChange={u(['menu', 'food', i, 'name'])} />
              <Field label="Description (optional)" value={f.desc} onChange={u(['menu', 'food', i, 'desc'])} />
            </ItemCard>
          ))}
          <div className="border-t border-gray-100 pt-4 grid gap-3">
            <Field label="Happy Hour Description" value={data.menu.happyHour.description} onChange={u(['menu', 'happyHour', 'description'])} />
            <Field label="Menu Subheading" value={data.menu.subheading} onChange={u(['menu', 'subheading'])} />
          </div>
        </Section>

        {/* ── Home Page ─────────────────────────────────────────────────────── */}
        <Section title="Home Page">
          <p className="text-xs text-gray-400 -mt-2">Hero section (the big opening screen)</p>
          <TwoCol>
            <Field label="Headline" value={data.home.hero.headline} onChange={u(['home', 'hero', 'headline'])} />
            <Field label="Tagline" value={data.home.hero.tagline} onChange={u(['home', 'hero', 'tagline'])} />
          </TwoCol>
          <TwoCol>
            <Field label="Primary Button" value={data.home.hero.ctaPrimary} onChange={u(['home', 'hero', 'ctaPrimary'])} />
            <Field label="Secondary Button" value={data.home.hero.ctaSecondary} onChange={u(['home', 'hero', 'ctaSecondary'])} />
          </TwoCol>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-3">Info strip (below the hero)</p>
            <TwoCol>
              <Field label="Hours Display" value={data.home.infoStrip.hours} onChange={u(['home', 'infoStrip', 'hours'])} />
              <Field label="Happy Hour Display" value={data.home.infoStrip.happyHour} onChange={u(['home', 'infoStrip', 'happyHour'])} />
            </TwoCol>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-3">Homepage press quotes (short versions)</p>
            {data.home.pressStrip.coverage.map((p, i) => (
              <ItemCard key={i} label={p.outlet}>
                <Field label="Quote" value={p.quote} onChange={u(['home', 'pressStrip', 'coverage', i, 'quote'])} long rows={2} />
                <Field label="Score / Label" value={p.detail} onChange={u(['home', 'pressStrip', 'coverage', i, 'detail'])} />
              </ItemCard>
            ))}
          </div>
        </Section>

        {/* ── About Page ────────────────────────────────────────────────────── */}
        <Section title="About Page">
          <Field label="Story Heading" value={data.about.story.heading} onChange={u(['about', 'story', 'heading'])} />
          {data.about.story.paragraphs.map((p, i) => (
            <Field key={i} label={`Story Paragraph ${i + 1}`} value={p} onChange={u(['about', 'story', 'paragraphs', i])} long rows={3} />
          ))}
          <Field label="Pull Quote" value={data.about.story.pullQuote} onChange={u(['about', 'story', 'pullQuote'])} long rows={2} />
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-3">Philosophy panels</p>
            {data.about.philosophy.map((p, i) => (
              <ItemCard key={i} label={p.heading}>
                <Field label="Heading" value={p.heading} onChange={u(['about', 'philosophy', i, 'heading'])} />
                <Field label="Body" value={p.body} onChange={u(['about', 'philosophy', i, 'body'])} long rows={3} />
              </ItemCard>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-3">Team</p>
            {data.about.team.members.map((m, i) => (
              <ItemCard key={i} label={m.name}>
                <TwoCol>
                  <Field label="Name" value={m.name} onChange={u(['about', 'team', 'members', i, 'name'])} />
                  <Field label="Role / Title" value={m.role} onChange={u(['about', 'team', 'members', i, 'role'])} />
                </TwoCol>
                <Field label="Bio" value={m.bio} onChange={u(['about', 'team', 'members', i, 'bio'])} long rows={3} />
              </ItemCard>
            ))}
          </div>
        </Section>

        {/* ── Music Page ────────────────────────────────────────────────────── */}
        <Section title="Music Page">
          <Field label="Page Subheading" value={data.music.subheading} onChange={u(['music', 'subheading'])} long rows={2} />
          {data.music.regularProgramming.nights.map((n, i) => (
            <TwoCol key={i}>
              <Field label={`Night ${i + 1} — Day`} value={n.day} onChange={u(['music', 'regularProgramming', 'nights', i, 'day'])} />
              <Field label="Detail" value={n.detail} onChange={u(['music', 'regularProgramming', 'nights', i, 'detail'])} />
            </TwoCol>
          ))}
          <Field label="Programming Tagline" value={data.music.regularProgramming.tagline} onChange={u(['music', 'regularProgramming', 'tagline'])} long rows={2} />
        </Section>

        {/* ── Press Coverage ────────────────────────────────────────────────── */}
        <Section title="Press Coverage">
          {data.press.coverage.map((p, i) => (
            <ItemCard key={i} label={p.outlet}>
              <TwoCol>
                <Field label="Score / Label" value={p.score} onChange={u(['press', 'coverage', i, 'score'])} />
                <Field label="Date" value={p.date} onChange={u(['press', 'coverage', i, 'date'])} />
              </TwoCol>
              <Field label="Quote" value={p.quote} onChange={u(['press', 'coverage', i, 'quote'])} long rows={3} />
            </ItemCard>
          ))}
        </Section>

        {/* ── Private Events ────────────────────────────────────────────────── */}
        <Section title="Private Events Page">
          <Field label="Page Subheading" value={data.privateEvents.subheading} onChange={u(['privateEvents', 'subheading'])} long rows={2} />
          {data.privateEvents.stats.map((stat, i) => (
            <TwoCol key={i}>
              <Field label="Stat Label" value={stat.label} onChange={u(['privateEvents', 'stats', i, 'label'])} />
              <Field label="Stat Value" value={stat.value} onChange={u(['privateEvents', 'stats', i, 'value'])} />
            </TwoCol>
          ))}
          {data.privateEvents.paragraphs.map((p, i) => (
            <Field key={i} label={`Body Paragraph ${i + 1}`} value={p} onChange={u(['privateEvents', 'paragraphs', i])} long rows={3} />
          ))}
        </Section>

        {/* ── Gallery ───────────────────────────────────────────────────────── */}
        <Section title="Gallery Page">
          <Field label="Subheading" value={data.gallery.subheading} onChange={u(['gallery', 'subheading'])} long rows={2} />
          <Field label="Photo Credit" value={data.gallery.photoCredit} onChange={u(['gallery', 'photoCredit'])} />
        </Section>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <Section title="Footer">
          <TwoCol>
            <Field label="Hours Line 1" value={data.footer.hoursLine1} onChange={u(['footer', 'hoursLine1'])} />
            <Field label="Hours Line 2" value={data.footer.hoursLine2} onChange={u(['footer', 'hoursLine2'])} />
          </TwoCol>
        </Section>

        {/* Bottom save */}
        <div className="pt-2 flex flex-col gap-3">
          {statusBar}
          <SaveButton />
        </div>

      </div>
    </div>
  )
}
