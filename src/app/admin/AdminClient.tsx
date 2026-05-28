'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import type { content } from '@/content'
import type { Artist, StoredShow, CalendarEvent } from '@/types'
import ArtistsTab from './ArtistsTab'
import ShowsTab from './ShowsTab'
import BookingCalendarTab from './BookingCalendarTab'

type ContentData = typeof content
type Status = 'idle' | 'saving' | 'saved' | 'error'
type Tab = 'content' | 'artists' | 'shows' | 'calendar'

const SESSION_KEY  = 'sm_admin_pw'
const THEME_KEY    = 'sm_admin_theme'
const THEME_EVENT  = 'sm-theme-change'

// ─── theme ────────────────────────────────────────────────────────────────────

// Dark from 5pm through 6am — matches bar hours
function isDarkHour(): boolean {
  const h = new Date().getHours()
  return h >= 17 || h < 6
}

const ThemeCtx = createContext(false)
const useIsDark = () => useContext(ThemeCtx)

// ─── lock screen ──────────────────────────────────────────────────────────────

function LockScreen({ onUnlock, error }: { onUnlock: (pw: string) => void; error: boolean }) {
  const [pw, setPw] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pw.trim()) return
    onUnlock(pw.trim())
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 bg-cover bg-center relative"
      style={{ backgroundImage: 'url(/gandalf-balrog.jpg)' }}
    >
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 w-full max-w-sm text-center">
        <h1 className="font-display text-6xl sm:text-7xl text-storm-gold mb-5 leading-tight uppercase tracking-widest [text-shadow:0_0_40px_rgba(196,154,74,0.6),0_2px_16px_rgba(0,0,0,1)]">
          YOU SHALL NOT PASS!
        </h1>
        <p className="text-storm-muted text-sm mb-10 uppercase tracking-[0.3em] [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
          enter password
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            autoFocus
            className="w-full bg-storm-black/80 border border-storm-border text-storm-cream px-4 py-3 text-sm focus:outline-none focus:border-storm-gold placeholder:text-storm-muted"
          />
          {error && (
            <p className="text-red-400 text-xs text-center">Incorrect password.</p>
          )}
          <button
            type="submit"
            className="bg-storm-gold text-storm-black font-semibold py-3 text-sm tracking-widest uppercase hover:bg-storm-gold/90 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── field helpers ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  const dark = useIsDark()
  return (
    <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
      {children}
    </p>
  )
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const dark = useIsDark()
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
        dark
          ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500'
          : 'border-gray-300 text-gray-900'
      }`}
    />
  )
}

function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  const dark = useIsDark()
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y ${
        dark
          ? 'bg-gray-800 border-gray-600 text-gray-100'
          : 'border-gray-300 text-gray-900'
      }`}
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
  const dark = useIsDark()
  return (
    <details
      open={defaultOpen}
      className={`group border rounded-lg overflow-hidden ${dark ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <summary className={`flex items-center justify-between cursor-pointer px-6 py-4 select-none ${
        dark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
      }`}>
        <span className={`font-semibold ${dark ? 'text-gray-100' : 'text-gray-800'}`}>{title}</span>
        <span className={`text-sm group-open:rotate-180 transition-transform ${dark ? 'text-gray-500' : 'text-gray-400'}`}>▾</span>
      </summary>
      <div className={`px-6 py-5 grid gap-5 ${dark ? 'bg-gray-900' : 'bg-white'}`}>
        {children}
      </div>
    </details>
  )
}

function ItemCard({ label, children }: { label: string; children: React.ReactNode }) {
  const dark = useIsDark()
  return (
    <div className={`border rounded-md p-4 grid gap-3 ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
      <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">{label}</p>
      {children}
    </div>
  )
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
}

function ThemeToggle({ isDark, onChange }: { isDark: boolean; onChange: (dark: boolean) => void }) {
  return (
    <div className={`relative inline-flex self-center mb-1 rounded-full p-0.5 shrink-0 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 bottom-0.5 rounded-full transition-all duration-200 shadow-sm ${
        isDark ? 'left-1/2 right-0.5 bg-gray-900' : 'left-0.5 right-1/2 bg-white'
      }`} />
      <button onClick={() => onChange(false)} className={`relative z-10 px-3 py-1 text-xs font-medium transition-colors ${!isDark ? 'text-gray-800' : 'text-gray-400 hover:text-gray-300'}`}>
        ☀ Light
      </button>
      <button onClick={() => onChange(true)} className={`relative z-10 px-3 py-1 text-xs font-medium transition-colors ${isDark ? 'text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>
        ☾ Dark
      </button>
    </div>
  )
}

// ─── deep update ──────────────────────────────────────────────────────────────

function deepUpdate(obj: ContentData, path: (string | number)[], value: string): ContentData {
  const next = JSON.parse(JSON.stringify(obj)) as ContentData
  let cursor: any = next
  for (let i = 0; i < path.length - 1; i++) cursor = cursor[path[i]]
  cursor[path[path.length - 1]] = value
  return next
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AdminClient({
  initialData,
  initialArtists,
  initialShows,
  initialEvents,
  initialOpenMonths,
  initialApprovedMonths,
}: {
  initialData: ContentData
  initialArtists: Artist[]
  initialShows: StoredShow[]
  initialEvents: CalendarEvent[]
  initialOpenMonths: string[]
  initialApprovedMonths: string[]
}) {
  const [password, setPassword] = useState<string | null>(null)
  const [unlockFailed, setUnlockFailed] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('content')
  const [data, setData] = useState<ContentData>(() => JSON.parse(JSON.stringify(initialData)))
  const [status, setStatus] = useState<Status>('idle')
  const [isDark, setIsDark] = useState(isDarkHour)
  const [manualOverride, setManualOverride] = useState(false)

  // Restore session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) setPassword(saved)
  }, [])

  // Init theme from localStorage (may override hour-based default)
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored !== null) {
      setIsDark(stored === 'dark')
      setManualOverride(true)
    }
  }, [])

  // Listen for theme changes dispatched by Navbar toggle
  useEffect(() => {
    const handler = (e: Event) => {
      setIsDark((e as CustomEvent<boolean>).detail)
      setManualOverride(true)
    }
    window.addEventListener(THEME_EVENT, handler)
    return () => window.removeEventListener(THEME_EVENT, handler)
  }, [])

  // Re-check theme every minute — skips if user has manually toggled
  useEffect(() => {
    const t = setInterval(() => { if (!manualOverride) setIsDark(isDarkHour()) }, 60_000)
    return () => clearInterval(t)
  }, [manualOverride])

  function applyTheme(dark: boolean) {
    setIsDark(dark)
    setManualOverride(true)
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
    window.dispatchEvent(new CustomEvent<boolean>(THEME_EVENT, { detail: dark }))
  }

  async function handleUnlock(pw: string) {
    setUnlockFailed(false)
    const res = await fetch('/api/save-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Password': pw },
      body: JSON.stringify({ data, checkAuth: true }),
    })
    if (res.status === 401) {
      setUnlockFailed(true)
      return
    }
    setUnlockFailed(false)
    sessionStorage.setItem(SESSION_KEY, pw)
    setPassword(pw)
  }

  if (!password) {
    return <LockScreen onUnlock={handleUnlock} error={unlockFailed} />
  }

  const u = (path: (string | number)[]) => (value: string) =>
    setData(prev => deepUpdate(prev, path, value))

  async function handleSave() {
    setStatus('saving')
    try {
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password ?? '' },
        body: JSON.stringify({ data }),
      })
      if (res.status === 401) {
        sessionStorage.removeItem(SESSION_KEY)
        setPassword(null)
        return
      }
      setStatus(res.ok ? 'saved' : 'error')
      if (res.ok) setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
    }
  }

  const statusBar = {
    saving: <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded">Saving and deploying — this usually takes about 30 seconds…</div>,
    saved:  <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded">Published. Changes will be live in about 30 seconds.</div>,
    error:  <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded">Something went wrong. Try again or contact Keith.</div>,
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
    <ThemeCtx.Provider value={isDark}>
      <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>

        <div className="max-w-3xl mx-auto px-6 pt-24 pb-8 grid gap-4">

          <div className={`flex items-center justify-between border-b pb-1 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex gap-1">
              {(['content', 'artists', 'shows', 'calendar'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 transition-colors ${
                    activeTab === t
                      ? 'border-amber-500 text-amber-600'
                      : `border-transparent ${isDark ? 'text-gray-400 hover:text-gray-100' : 'text-gray-500 hover:text-gray-800'}`
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="hidden sm:block">
              <ThemeToggle isDark={isDark} onChange={applyTheme} />
            </div>
          </div>

          {activeTab === 'artists' && (
            <ArtistsTab initialArtists={initialArtists} password={password ?? ''} isDark={isDark} />
          )}

          {activeTab === 'shows' && (
            <ShowsTab initialShows={initialShows} artists={initialArtists} password={password ?? ''} isDark={isDark} onAuthError={() => { sessionStorage.removeItem(SESSION_KEY); setPassword(null) }} />
          )}

          {activeTab === 'calendar' && (
            <BookingCalendarTab
              shows={initialShows}
              artists={initialArtists}
              initialEvents={initialEvents}
              initialOpenMonths={initialOpenMonths}
              initialApprovedMonths={initialApprovedMonths}
              password={password ?? ''}
              isDark={isDark}
              onAuthError={() => { sessionStorage.removeItem(SESSION_KEY); setPassword(null) }}
            />
          )}

          {activeTab === 'content' && <>
          {statusBar && <div>{statusBar}</div>}

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

          <Section title="Menu — Cocktails">
            {data.menu.cocktails.map((c, i) => (
              <ItemCard key={i} label={`Cocktail ${i + 1}`}>
                <Field label="Name" value={c.name} onChange={u(['menu', 'cocktails', i, 'name'])} />
                <Field label="Description (ingredients)" value={c.desc} onChange={u(['menu', 'cocktails', i, 'desc'])} long rows={2} />
                <Field label="Note (optional)" value={c.note} onChange={u(['menu', 'cocktails', i, 'note'])} />
              </ItemCard>
            ))}
            <Field label="Disclaimer (bottom of menu)" value={data.menu.disclaimer} onChange={u(['menu', 'disclaimer'])} long rows={2} />
          </Section>

          <Section title="Menu — Food">
            {data.menu.food.map((f, i) => (
              <ItemCard key={i} label={`Food Item ${i + 1}`}>
                <Field label="Name" value={f.name} onChange={u(['menu', 'food', i, 'name'])} />
                <Field label="Description (optional)" value={f.desc} onChange={u(['menu', 'food', i, 'desc'])} />
              </ItemCard>
            ))}
            <div className={`border-t pt-4 grid gap-3 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <Field label="Happy Hour Description" value={data.menu.happyHour.description} onChange={u(['menu', 'happyHour', 'description'])} />
              <Field label="Menu Subheading" value={data.menu.subheading} onChange={u(['menu', 'subheading'])} />
            </div>
          </Section>

          <Section title="Home Page">
            <p className={`text-xs -mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Hero section (the big opening screen)</p>
            <TwoCol>
              <Field label="Headline" value={data.home.hero.headline} onChange={u(['home', 'hero', 'headline'])} />
              <Field label="Tagline" value={data.home.hero.tagline} onChange={u(['home', 'hero', 'tagline'])} />
            </TwoCol>
            <TwoCol>
              <Field label="Primary Button" value={data.home.hero.ctaPrimary} onChange={u(['home', 'hero', 'ctaPrimary'])} />
              <Field label="Secondary Button" value={data.home.hero.ctaSecondary} onChange={u(['home', 'hero', 'ctaSecondary'])} />
            </TwoCol>
            <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Info strip (below the hero)</p>
              <TwoCol>
                <Field label="Hours Display" value={data.home.infoStrip.hours} onChange={u(['home', 'infoStrip', 'hours'])} />
                <Field label="Happy Hour Display" value={data.home.infoStrip.happyHour} onChange={u(['home', 'infoStrip', 'happyHour'])} />
              </TwoCol>
            </div>
            <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Homepage press quotes</p>
              {data.home.pressStrip.coverage.map((p, i) => (
                <ItemCard key={i} label={p.outlet}>
                  <Field label="Quote" value={p.quote} onChange={u(['home', 'pressStrip', 'coverage', i, 'quote'])} long rows={2} />
                  <Field label="Score / Label" value={p.detail} onChange={u(['home', 'pressStrip', 'coverage', i, 'detail'])} />
                  <Field label="Link URL" value={p.url} onChange={u(['home', 'pressStrip', 'coverage', i, 'url'])} />
                </ItemCard>
              ))}
            </div>
          </Section>

          <Section title="About Page">
            <Field label="Story Heading" value={data.about.story.heading} onChange={u(['about', 'story', 'heading'])} />
            {data.about.story.paragraphs.map((p, i) => (
              <Field key={i} label={`Story Paragraph ${i + 1}`} value={p} onChange={u(['about', 'story', 'paragraphs', i])} long rows={3} />
            ))}
            <Field label="Pull Quote" value={data.about.story.pullQuote} onChange={u(['about', 'story', 'pullQuote'])} long rows={2} />
            <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Philosophy panels</p>
              {data.about.philosophy.map((p, i) => (
                <ItemCard key={i} label={p.heading}>
                  <Field label="Heading" value={p.heading} onChange={u(['about', 'philosophy', i, 'heading'])} />
                  <Field label="Body" value={p.body} onChange={u(['about', 'philosophy', i, 'body'])} long rows={3} />
                </ItemCard>
              ))}
            </div>
            <div className={`border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Team</p>
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

          <Section title="Gallery Page">
            <Field label="Subheading" value={data.gallery.subheading} onChange={u(['gallery', 'subheading'])} long rows={2} />
            <Field label="Photo Credit" value={data.gallery.photoCredit} onChange={u(['gallery', 'photoCredit'])} />
          </Section>

          <Section title="Gig Details (Musician Portal)">
            <p className={`text-xs -mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Shown to musicians when they log in at /musicians. Publish to update the portal.
            </p>
            <TwoCol>
              <Field label="Monday Rate" value={data.gigDetails.mondayRate} onChange={u(['gigDetails', 'mondayRate'])} />
              <Field label="Friday Rate" value={data.gigDetails.fridayRate} onChange={u(['gigDetails', 'fridayRate'])} />
            </TwoCol>
            <Field label="Performance Time" value={data.gigDetails.performanceTime} onChange={u(['gigDetails', 'performanceTime'])} />
            <Field label="Parking Info" value={data.gigDetails.parkingInfo} onChange={u(['gigDetails', 'parkingInfo'])} long />
            <Field label="Food & Drinks (perks)" value={data.gigDetails.perksInfo} onChange={u(['gigDetails', 'perksInfo'])} long />
            <Field label="Equipment / PA" value={data.gigDetails.equipmentInfo} onChange={u(['gigDetails', 'equipmentInfo'])} long rows={3} />
            <Field label="Additional Notes (optional)" value={data.gigDetails.additionalNotes} onChange={u(['gigDetails', 'additionalNotes'])} long rows={2} />
          </Section>

          <Section title="Footer">
            <TwoCol>
              <Field label="Hours Line 1" value={data.footer.hoursLine1} onChange={u(['footer', 'hoursLine1'])} />
              <Field label="Hours Line 2" value={data.footer.hoursLine2} onChange={u(['footer', 'hoursLine2'])} />
            </TwoCol>
          </Section>

          <div className="pt-2 flex flex-col gap-3">
            {statusBar}
            <SaveButton />
          </div>

          </>}

        </div>

      </div>
    </ThemeCtx.Provider>
  )
}
