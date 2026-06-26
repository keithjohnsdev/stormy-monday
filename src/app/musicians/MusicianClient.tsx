'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { StoredShow } from '@/types'
import ImageUpload from '@/components/admin/ImageUpload'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'book' | 'profile' | 'gig'

interface SessionArtist {
  id: string
  name: string
  genre: string
  description: string
  website: string
  defaultCoverCharge: string
  email?: string
  imageUrl?: string
}

interface GigDetails {
  heading: string
  subheading: string
  performanceTime: string
  mondayRate: string
  fridayRate: string
  parkingInfo: string
  perksInfo: string
  equipmentInfo: string
  additionalNotes: string
}

// ─── Calendar helpers ───────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isMonOrFri(d: Date): boolean {
  const day = d.getDay()
  return day === 1 || day === 5
}

function getMonthGrid(year: number, month: number): Array<Date | null> {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const grid: Array<Date | null> = []
  for (let i = 0; i < first.getDay(); i++) grid.push(null)
  for (let d = 1; d <= last.getDate(); d++) grid.push(new Date(year, month, d))
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ─── Login Form ─────────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: (artist: SessionArtist) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/musicians/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        setError('Invalid email or password.')
        return
      }
      const meRes = await fetch('/api/musicians/me')
      if (meRes.ok) {
        const data = await meRes.json()
        onLogin(data.artist)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-20">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-storm-muted text-xs uppercase tracking-widest mb-3">820 Alton Road · Miami Beach</p>
          <h1 className="font-display text-4xl text-storm-gold mb-2">Stormy Monday</h1>
          <p className="text-storm-muted text-sm tracking-wide">Musician Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="text-xs text-storm-muted uppercase tracking-wide block mb-1.5">Email or Username</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              required
              className="w-full bg-storm-dark border border-storm-border text-storm-cream px-4 py-3 text-sm focus:outline-none focus:border-storm-gold placeholder:text-storm-muted"
            />
          </div>
          <div>
            <label className="text-xs text-storm-muted uppercase tracking-wide block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-storm-dark border border-storm-border text-storm-cream px-4 py-3 text-sm focus:outline-none focus:border-storm-gold"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-storm-gold text-storm-black font-semibold py-3 text-sm tracking-widest uppercase hover:bg-storm-gold/90 disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Signing In…' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-storm-muted text-xs mt-8">
          Contact the venue to receive your login credentials.
        </p>
      </div>
    </div>
  )
}

// ─── Calendar Tab ───────────────────────────────────────────────────────────────

function CalendarTab({
  artist,
  bookedDates,
  myBookedMonths,
  openMonths,
  gigDetails,
  onBooked,
}: {
  artist: SessionArtist
  bookedDates: Set<string>
  myBookedMonths: Set<string>
  openMonths: string[]
  gigDetails: GigDetails
  onBooked: (date: string) => void
}) {
  const now = new Date()
  const todayStr = toDateStr(now)

  const [selected, setSelected] = useState<string | null>(null)
  const [bookingState, setBookingState] = useState<'idle' | 'booking' | 'booked' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Dismiss modal on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && selected && bookingState !== 'booking') {
        setSelected(null)
        setBookingState('idle')
        setErrorMsg('')
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selected, bookingState])

  // Show only months admin has opened for booking (within the next 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  }).filter(({ year, month }) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    return openMonths.includes(key)
  })

  function handleDayClick(d: Date) {
    const ds = toDateStr(d)
    const monthKey = ds.slice(0, 7)
    if (!isMonOrFri(d) || ds < todayStr || bookedDates.has(ds) || myBookedMonths.has(monthKey)) return
    setSelected(prev => prev === ds ? null : ds)
    setBookingState('idle')
    setErrorMsg('')
  }

  async function confirmBooking() {
    if (!selected) return
    setBookingState('booking')
    setErrorMsg('')
    try {
      const res = await fetch('/api/musicians/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selected }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMsg((body as { error?: string }).error ?? 'Booking failed. Please try again.')
        setBookingState('error')
        return
      }
      onBooked(selected)
      setBookingState('booked')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setBookingState('error')
    }
  }

  function renderMonth(year: number, month: number) {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
    const artistHasBookingThisMonth = myBookedMonths.has(monthKey)
    const grid = getMonthGrid(year, month)
    return (
      <div>
        <div className="text-center mb-4">
          <p className="text-storm-cream font-semibold tracking-wide">
            {MONTH_NAMES[month]} {year}
          </p>
          {artistHasBookingThisMonth && (
            <p className="text-xs text-storm-gold/60 mt-0.5">· 1 show booked this month</p>
          )}
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DAY_ABBR.map(lbl => (
            <div key={lbl} className="text-center text-xs text-storm-muted font-semibold py-1.5">{lbl}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {grid.map((day, i) => {
            if (!day) return <div key={i} />
            const ds = toDateStr(day)
            const past = ds < todayStr
            const available = isMonOrFri(day)
            const taken = bookedDates.has(ds)
            const isSelected = ds === selected
            const monthLocked = available && !past && !taken && artistHasBookingThisMonth
            const bookable = available && !past && !taken && !artistHasBookingThisMonth

            let cls = 'h-10 flex items-center justify-center text-sm rounded transition-colors relative select-none '

            if (!available) {
              cls += 'text-storm-border cursor-default'
            } else if (past) {
              cls += 'text-storm-border cursor-default'
            } else if (taken) {
              cls += 'text-storm-muted line-through cursor-not-allowed opacity-50'
            } else if (monthLocked) {
              cls += 'text-storm-muted/40 cursor-not-allowed'
            } else if (isSelected) {
              cls += 'bg-storm-gold text-storm-black font-bold cursor-pointer'
            } else {
              cls += 'text-storm-gold border border-storm-gold/30 hover:bg-storm-gold/15 cursor-pointer font-medium'
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={!bookable}
                className={cls}
                title={
                  taken ? 'Already booked'
                  : monthLocked ? 'You already have a show this month'
                  : !available ? undefined
                  : past ? 'Date passed'
                  : undefined
                }
              >
                {day.getDate()}
                {taken && (
                  <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-storm-muted" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Info for the selected date
  const selectedInfo = selected
    ? (() => {
        const d = new Date(selected + 'T00:00:00')
        const isMon = d.getDay() === 1
        return {
          label: formatFullDate(selected),
          rate: isMon ? gigDetails.mondayRate : gigDetails.fridayRate,
          dayType: isMon ? 'Monday' : 'Friday',
        }
      })()
    : null

  return (
    <div className="grid gap-8">

      {/* Booking success banner */}
      {bookingState === 'booked' && selected && (
        <div className="bg-green-900/20 border border-green-700/40 px-6 py-5">
          <p className="text-green-400 font-semibold mb-1">Booking request submitted ✓</p>
          <p className="text-storm-muted text-sm leading-relaxed">
            {formatFullDate(selected)} is pending approval. Once approved,
            your show will appear on the public schedule. We will be in touch with any details.
          </p>
          <button
            onClick={() => { setSelected(null); setBookingState('idle') }}
            className="mt-3 text-xs text-storm-muted hover:text-storm-cream underline underline-offset-2"
          >
            Book another date →
          </button>
        </div>
      )}

      {months.length === 0 ? (
        /* No months open for booking */
        <div className="border border-storm-border px-6 py-12 text-center">
          <p className="text-storm-cream text-sm mb-2">No dates are currently open for booking.</p>
          <p className="text-storm-muted text-xs">Check back soon or contact the venue directly.</p>
        </div>
      ) : (
        <>
          {/* Calendars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {months.map(({ year, month }) => (
              <div key={`${year}-${month}`} className="bg-storm-dark border border-storm-border p-6">
                {renderMonth(year, month)}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-5 text-xs text-storm-muted">
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border border-storm-gold/30 rounded flex-shrink-0" />
              Available (Mon / Fri)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 bg-storm-gold rounded flex-shrink-0" />
              Selected
            </span>
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border border-storm-border rounded flex-shrink-0 opacity-50 line-through text-storm-muted text-center leading-5">·</span>
              Already booked
            </span>
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border border-storm-border rounded flex-shrink-0 opacity-30" />
              Your month is full
            </span>
          </div>

          {/* Booking modal */}
          {selected && selectedInfo && bookingState !== 'booked' && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-storm-black/80 backdrop-blur-sm"
                onClick={() => {
                  if (bookingState !== 'booking') {
                    setSelected(null)
                    setBookingState('idle')
                    setErrorMsg('')
                  }
                }}
              />

              {/* Panel */}
              <div className="relative bg-storm-card border border-storm-gold/40 p-8 w-full max-w-sm grid gap-5 shadow-2xl">
                {/* Header */}
                <div>
                  <p className="text-xs text-storm-muted uppercase tracking-widest mb-3">Confirm Booking</p>
                  <p className="font-display text-xl text-storm-cream leading-tight">{selectedInfo.label}</p>
                  <div className="mt-3 grid gap-1.5 text-sm">
                    <span className="text-storm-muted">🕗 {gigDetails.performanceTime}</span>
                    <span className="text-storm-gold font-medium">{selectedInfo.dayType} rate: {selectedInfo.rate}</span>
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-storm-muted text-xs leading-relaxed border-t border-storm-border pt-4">
                  By confirming, this date is added to the Stormy Monday schedule and visible on the public site within ~30 seconds.
                </p>

                {/* Error */}
                {bookingState === 'error' && (
                  <p className="text-red-400 text-sm -mt-1">{errorMsg}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSelected(null); setBookingState('idle'); setErrorMsg('') }}
                    disabled={bookingState === 'booking'}
                    className="flex-1 py-2.5 text-sm text-storm-muted border border-storm-border hover:text-storm-cream hover:border-storm-muted disabled:opacity-40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmBooking}
                    disabled={bookingState === 'booking'}
                    className="flex-1 py-2.5 text-sm bg-storm-gold text-storm-black font-semibold hover:bg-storm-gold/90 disabled:opacity-50 transition-colors"
                  >
                    {bookingState === 'booking' ? 'Booking…' : 'Confirm →'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  )
}

// ─── Profile Tab ────────────────────────────────────────────────────────────────

function ProfileTab({
  artist,
  onUpdate,
}: {
  artist: SessionArtist
  onUpdate: (updated: SessionArtist) => void
}) {
  const [form, setForm] = useState({
    name: artist.name,
    genre: artist.genre,
    description: artist.description,
    website: artist.website,
    imageUrl: artist.imageUrl ?? '',
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const inputCls =
    'w-full bg-storm-dark border border-storm-border text-storm-cream px-4 py-3 text-sm focus:outline-none focus:border-storm-gold placeholder:text-storm-muted'
  const labelCls = 'text-xs text-storm-muted uppercase tracking-wide block mb-1.5'

  async function handleSave() {
    setStatus('saving')
    setErrorMsg('')
    try {
      const res = await fetch('/api/musicians/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMsg((body as { error?: string }).error ?? 'Save failed. Try again.')
        setStatus('error')
        return
      }
      onUpdate({ ...artist, ...form, imageUrl: form.imageUrl || undefined })
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="grid gap-5 max-w-lg">

      <div>
        <label className={labelCls}>Name / Act Name</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Genre / Style</label>
        <input
          type="text"
          value={form.genre}
          onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
          placeholder="e.g. Live Jazz, Blues, Singer-Songwriter"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Bio / Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={4}
          placeholder="Short bio shown on the shows page and schedule"
          className={`${inputCls} resize-y`}
        />
      </div>

      <div>
        <label className={labelCls}>Website / Social Link</label>
        <input
          type="url"
          value={form.website}
          onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
          placeholder="https://..."
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Photo</label>
        <ImageUpload
          value={form.imageUrl || undefined}
          folder="artists"
          uploadUrl="/api/musicians/upload-image"
          isDark
          onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
        />
        <p className="text-xs text-storm-muted mt-2">
          Shown on the public schedule next to your shows.
        </p>
      </div>

      <div>
        <label className={labelCls}>Login Email</label>
        <input
          type="email"
          value={artist.email ?? ''}
          readOnly
          className={`${inputCls} opacity-40 cursor-not-allowed`}
        />
        <p className="text-xs text-storm-muted mt-1.5">
          Email and password are managed by the venue. Contact James to update them.
        </p>
      </div>

      {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={status === 'saving'}
          className="bg-storm-gold text-storm-black font-semibold px-6 py-2.5 text-sm hover:bg-storm-gold/90 disabled:opacity-50 transition-colors"
        >
          {status === 'saving' ? 'Saving…' : 'Save Changes'}
        </button>
        {status === 'saved' && (
          <span className="text-green-400 text-sm">Saved. Live in ~30 seconds.</span>
        )}
      </div>
    </div>
  )
}

// ─── Gig Details Tab ────────────────────────────────────────────────────────────

function GigDetailsTab({ gigDetails }: { gigDetails: GigDetails }) {
  const items = [
    { label: 'Performance Time', value: gigDetails.performanceTime, icon: '🕗' },
    { label: 'Monday Rate',      value: gigDetails.mondayRate,      icon: '💵' },
    { label: 'Friday Rate',      value: gigDetails.fridayRate,      icon: '💵' },
    { label: 'Parking',          value: gigDetails.parkingInfo,     icon: '🅿️' },
    { label: 'Food & Drinks',    value: gigDetails.perksInfo,       icon: '🍹' },
    { label: 'Equipment / PA',   value: gigDetails.equipmentInfo,   icon: '🎛️' },
  ]

  return (
    <div className="grid gap-4 max-w-2xl">
      {gigDetails.subheading && (
        <p className="text-storm-muted text-sm">{gigDetails.subheading}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.label} className="bg-storm-dark border border-storm-border p-5">
            <p className="text-xs text-storm-muted uppercase tracking-widest mb-2">
              {item.icon}&nbsp; {item.label}
            </p>
            <p className="text-storm-cream text-sm leading-relaxed">{item.value || '—'}</p>
          </div>
        ))}
      </div>
      {gigDetails.additionalNotes && (
        <div className="bg-storm-dark border border-storm-gold/20 p-5">
          <p className="text-xs text-storm-muted uppercase tracking-widest mb-2">📋&nbsp; Additional Notes</p>
          <p className="text-storm-cream text-sm leading-relaxed whitespace-pre-line">
            {gigDetails.additionalNotes}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────────

export default function MusicianClient({
  initialShows,
  gigDetails,
  openMonths,
}: {
  initialShows: StoredShow[]
  gigDetails: GigDetails
  openMonths: string[]
}) {
  const [artist, setArtist] = useState<SessionArtist | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('book')
  const [bookedDates] = useState<Set<string>>(
    () => new Set(
      (initialShows as StoredShow[])
        .filter(s => s.status === 'published' || s.status === 'draft')
        .map(s => s.date)
    )
  )
  const [localBookedDates, setLocalBookedDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/musicians/me')
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data?.artist) setArtist(data.artist) })
      .catch(() => {})
      .finally(() => setSessionLoading(false))
  }, [])

  async function handleLogout() {
    await fetch('/api/musicians/logout', { method: 'POST' })
    setArtist(null)
  }

  const allBookedDates = new Set([...bookedDates, ...localBookedDates])

  // Months (YYYY-MM) where this artist already has a booking (draft or published)
  const myBookedMonths = new Set([
    ...initialShows
      .filter(s => artist && s.artistId === artist.id &&
                   (s.status === 'published' || s.status === 'draft'))
      .map(s => s.date.slice(0, 7)),
    ...[...localBookedDates].map(d => d.slice(0, 7)),
  ])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'book',    label: 'Book a Show' },
    { id: 'profile', label: 'My Info' },
    { id: 'gig',     label: 'Gig Details' },
  ]

  return (
    // Full-screen overlay — sits above the site Navbar/Footer
    <div className="fixed inset-0 z-[100] bg-storm-black overflow-y-auto flex flex-col">

      {/* Loading state */}
      {sessionLoading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-storm-muted text-sm">Loading…</p>
        </div>
      )}

      {/* Login */}
      {!sessionLoading && !artist && (
        <div className="flex-1 flex flex-col">
          <LoginForm onLogin={setArtist} />
        </div>
      )}

      {/* Portal */}
      {!sessionLoading && artist && (
        <>
          {/* Sticky header */}
          <div className="sticky top-0 z-10 bg-storm-black border-b border-storm-border">
            <div className="max-w-3xl mx-auto px-6 pt-4 flex items-center justify-between">
              <Link
                href="/"
                className="font-display text-xl tracking-widest text-storm-cream hover:text-storm-gold transition-colors"
              >
                STORMY MONDAY
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-storm-muted">{artist.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-storm-muted hover:text-storm-cream uppercase tracking-widest transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
            <div className="max-w-3xl mx-auto px-6 flex gap-1 mt-3">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-storm-gold text-storm-gold'
                      : 'border-transparent text-storm-muted hover:text-storm-cream'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="max-w-3xl mx-auto w-full px-6 py-8">
            {activeTab === 'book' && (
              <CalendarTab
                artist={artist}
                bookedDates={allBookedDates}
                myBookedMonths={myBookedMonths}
                openMonths={openMonths}
                gigDetails={gigDetails}
                onBooked={date =>
                  setLocalBookedDates(prev => new Set([...prev, date]))
                }
              />
            )}
            {activeTab === 'profile' && (
              <ProfileTab artist={artist} onUpdate={setArtist} />
            )}
            {activeTab === 'gig' && (
              <GigDetailsTab gigDetails={gigDetails} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
