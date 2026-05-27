'use client'

import { useState } from 'react'
import type { StoredShow } from '@/types'

// ─── Calendar helpers ──────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isMonOrFri(d: Date): boolean {
  return d.getDay() === 1 || d.getDay() === 5
}

function getMonthGrid(year: number, month: number): Array<Date | null> {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  const grid: Array<Date | null> = []
  for (let i = 0; i < first.getDay(); i++) grid.push(null)
  for (let d = 1; d <= last.getDate(); d++) grid.push(new Date(year, month, d))
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ─── Component ─────────────────────────────────────────────────────────────────

interface Props {
  shows: StoredShow[]
  initialOpenMonths: string[]
  initialApprovedMonths: string[]
  password: string
  isDark: boolean
  onAuthError: () => void
}

export default function BookingCalendarTab({
  shows,
  initialOpenMonths,
  initialApprovedMonths,
  password,
  isDark,
  onAuthError,
}: Props) {
  const [openMonths,     setOpenMonths]     = useState<Set<string>>(new Set(initialOpenMonths))
  const [approvedMonths, setApprovedMonths] = useState<Set<string>>(new Set(initialApprovedMonths))
  const [status,   setStatus]   = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const now      = new Date()
  const todayStr = toDateStr(now)
  const dk = (dark: string, light: string) => isDark ? dark : light

  // Six months: current + next 5
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  // Separate published vs draft for display
  const publishedShows = shows.filter(s => s.status === 'published')
  const draftShows     = shows.filter(s => s.status === 'draft')
  const publishedByDate = new Map(publishedShows.map(s => [s.date, s]))
  const draftByDate     = new Map(draftShows.map(s => [s.date, s]))

  function toggleOpen(monthKey: string) {
    setOpenMonths(prev => {
      const next = new Set(prev)
      next.has(monthKey) ? next.delete(monthKey) : next.add(monthKey)
      return next
    })
    setStatus('idle')
  }

  function toggleApproved(monthKey: string) {
    setApprovedMonths(prev => {
      const next = new Set(prev)
      next.has(monthKey) ? next.delete(monthKey) : next.add(monthKey)
      return next
    })
    setStatus('idle')
  }

  async function save() {
    setStatus('saving')
    setErrorMsg('')
    try {
      const res = await fetch('/api/save-booking-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({
          openMonths:     [...openMonths],
          approvedMonths: [...approvedMonths],
        }),
      })
      if (res.status === 401) { onAuthError(); return }
      if (res.ok) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        const body = await res.json().catch(() => ({}))
        setErrorMsg((body as { error?: string }).error ?? `HTTP ${res.status}`)
        setStatus('error')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error')
      setStatus('error')
    }
  }

  function renderMonth(year: number, month: number) {
    const monthKey   = `${year}-${String(month + 1).padStart(2, '0')}`
    const isOpen     = openMonths.has(monthKey)
    const isApproved = approvedMonths.has(monthKey)
    const grid       = getMonthGrid(year, month)

    // All shows for this month (published + draft)
    const monthPublished = publishedShows.filter(s => s.date.startsWith(monthKey)).sort((a, b) => a.date.localeCompare(b.date))
    const monthDraft     = draftShows.filter(s => s.date.startsWith(monthKey)).sort((a, b) => a.date.localeCompare(b.date))
    const hasPending     = monthDraft.length > 0

    return (
      <div className={`border rounded-lg overflow-hidden ${dk('border-gray-700', 'border-gray-200')}`}>

        {/* Month header */}
        <div className={`px-4 py-3 ${dk('bg-gray-800', 'bg-gray-50')}`}>
          <div className="flex items-start justify-between gap-3">
            <p className={`font-semibold text-sm pt-0.5 ${dk('text-gray-100', 'text-gray-800')}`}>
              {MONTH_NAMES[month]} {year}
              {hasPending && (
                <span className="ml-2 text-xs font-normal text-orange-400">
                  {monthDraft.length} pending
                </span>
              )}
            </p>
          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={isOpen}
                onChange={() => toggleOpen(monthKey)}
                className="accent-amber-500 w-4 h-4"
              />
              <span className={`text-xs font-medium transition-colors ${
                isOpen ? 'text-amber-500' : dk('text-gray-500', 'text-gray-400')
              }`}>
                Open for booking
              </span>
            </label>
          </div>
        </div>

        <div className={`p-4 ${dk('bg-gray-900', 'bg-white')}`}>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_ABBR.map(lbl => (
              <div key={lbl} className={`text-center text-xs font-semibold py-1 ${dk('text-gray-600', 'text-gray-400')}`}>
                {lbl}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {grid.map((day, i) => {
              if (!day) return <div key={i} />
              const ds       = toDateStr(day)
              const past     = ds < todayStr
              const monOrFri = isMonOrFri(day)
              const published = publishedByDate.get(ds)
              const draft     = draftByDate.get(ds)
              const show      = published ?? draft
              const isPending = !published && !!draft

              let cls = 'h-8 flex items-center justify-center text-xs rounded relative '

              if (!monOrFri) {
                cls += dk('text-gray-700', 'text-gray-300')
              } else if (isPending) {
                // Draft/pending — orange
                cls += past
                  ? dk('text-orange-900 bg-orange-900/10', 'text-orange-300 bg-orange-50')
                  : 'bg-orange-900/20 text-orange-300 font-bold ring-1 ring-orange-500/40'
              } else if (published && past) {
                cls += dk('text-amber-800 bg-amber-900/20', 'text-amber-300 bg-amber-50')
              } else if (published) {
                cls += 'bg-amber-500/20 text-amber-400 font-bold ring-1 ring-amber-500/40'
              } else if (past) {
                cls += dk('text-gray-600', 'text-gray-400')
              } else {
                cls += dk(
                  'bg-emerald-900/30 text-emerald-400 font-semibold ring-1 ring-emerald-700/40',
                  'bg-emerald-50 text-emerald-700 font-semibold ring-1 ring-emerald-200'
                )
              }

              return (
                <div
                  key={i}
                  className={cls}
                  title={
                    isPending ? `Pending: ${draft!.artistName}`
                    : show     ? show.artistName
                    : monOrFri && !past ? 'Open'
                    : undefined
                  }
                >
                  {day.getDate()}
                  {show && (
                    <span className={`absolute top-0.5 right-0.5 w-1 h-1 rounded-full ${
                      isPending ? 'bg-orange-400' : 'bg-amber-400'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Show list — published */}
          {monthPublished.length > 0 && (
            <div className={`mt-3 pt-3 border-t space-y-1.5 ${dk('border-gray-800', 'border-gray-100')}`}>
              {monthPublished.map(s => {
                const d       = new Date(s.date + 'T00:00:00')
                const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
                const isPast  = s.date < todayStr
                return (
                  <div key={s.id} className={`flex items-baseline gap-2 ${isPast ? 'opacity-40' : ''}`}>
                    <span className="text-xs text-amber-500 font-semibold shrink-0 tabular-nums w-14">
                      {dayName} {d.getDate()}
                    </span>
                    <span className={`text-xs truncate ${dk('text-gray-300', 'text-gray-700')}`}>
                      {s.artistName}
                    </span>
                    {s.featured && <span className="text-xs text-amber-500 shrink-0">★</span>}
                  </div>
                )
              })}
            </div>
          )}

          {/* Show list — pending (draft) */}
          {monthDraft.length > 0 && (
            <div className={`mt-3 pt-3 border-t space-y-1.5 ${dk('border-gray-800', 'border-gray-100')}`}>
              {monthDraft.map(s => {
                const d       = new Date(s.date + 'T00:00:00')
                const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
                return (
                  <div key={s.id} className="flex items-baseline gap-2">
                    <span className="text-xs text-orange-400 font-semibold shrink-0 tabular-nums w-14">
                      {dayName} {d.getDate()}
                    </span>
                    <span className={`text-xs truncate ${dk('text-gray-300', 'text-gray-700')}`}>
                      {s.artistName}
                    </span>
                    <span className={`text-xs shrink-0 px-1.5 py-0.5 rounded font-medium ${
                      dk('bg-orange-900/40 text-orange-300', 'bg-orange-50 text-orange-600')
                    }`}>
                      Pending
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Approve / Unpublish button */}
          <div className={`mt-3 pt-3 border-t ${dk('border-gray-800', 'border-gray-100')}`}>
            <button
              onClick={() => toggleApproved(monthKey)}
              className={`w-full py-2 text-xs font-semibold rounded transition-colors ${
                isApproved
                  ? dk(
                      'bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-800/40',
                      'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
                    )
                  : dk(
                      'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-800/40',
                      'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    )
              }`}
            >
              {isApproved ? '✕ Unpublish this month' : '✓ Approve & Publish'}
            </button>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">

      {/* Description */}
      <p className={`text-sm leading-relaxed ${dk('text-gray-400', 'text-gray-600')}`}>
        <strong className={dk('text-gray-200', 'text-gray-800')}>Open for booking</strong> — musicians can self-book through the portal.
        Use <strong className={dk('text-gray-200', 'text-gray-800')}>Approve &amp; Publish</strong> on a month to push pending bookings live. Click again to unpublish.
        Orange = pending approval · Amber = published · Green = open &amp; available.
      </p>

      {/* Legend */}
      <div className={`flex flex-wrap gap-5 text-xs ${dk('text-gray-400', 'text-gray-500')}`}>
        <span className="flex items-center gap-1.5">
          <span className={`w-5 h-5 rounded flex-shrink-0 ring-1 ${dk('bg-amber-500/20 ring-amber-500/40', 'bg-amber-50 ring-amber-200')}`} />
          Published
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`w-5 h-5 rounded flex-shrink-0 ring-1 ${dk('bg-orange-900/20 ring-orange-500/40', 'bg-orange-50 ring-orange-200')}`} />
          Pending approval
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`w-5 h-5 rounded flex-shrink-0 ring-1 ${dk('bg-emerald-900/30 ring-emerald-700/40', 'bg-emerald-50 ring-emerald-200')}`} />
          Open Mon / Fri
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`w-5 h-5 rounded flex-shrink-0 ${dk('bg-gray-700/50', 'bg-gray-100')}`} />
          Not a booking day
        </span>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {months.map(({ year, month }) => (
          <div key={`${year}-${month}`}>
            {renderMonth(year, month)}
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={save}
          disabled={status === 'saving'}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded text-sm transition-colors"
        >
          {status === 'saving' ? 'Publishing…' : 'Publish Booking Settings'}
        </button>
        {status === 'saved' && (
          <span className="text-green-500 text-sm">Published. Live in ~30 seconds.</span>
        )}
        {status === 'error' && (
          <span className="text-red-400 text-sm">{errorMsg || 'Something went wrong.'}</span>
        )}
      </div>

    </div>
  )
}
