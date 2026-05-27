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
  password: string
  isDark: boolean
  onAuthError: () => void
}

export default function BookingCalendarTab({ shows, initialOpenMonths, password, isDark, onAuthError }: Props) {
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set(initialOpenMonths))
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const now = new Date()
  const todayStr = toDateStr(now)
  const dk = (dark: string, light: string) => isDark ? dark : light

  // Six months: current + next 5 (matches booking window admin controls)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  // Index published shows by date for quick lookup
  const publishedShows = shows.filter(s => s.status === 'published')
  const showsByDate = new Map(publishedShows.map(s => [s.date, s]))

  function toggleMonth(monthKey: string) {
    setOpenMonths(prev => {
      const next = new Set(prev)
      if (next.has(monthKey)) next.delete(monthKey)
      else next.add(monthKey)
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
        body: JSON.stringify({ openMonths: [...openMonths] }),
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
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
    const isOpen = openMonths.has(monthKey)
    const grid = getMonthGrid(year, month)

    // Upcoming shows in this month (to list below the grid)
    const monthShows = publishedShows
      .filter(s => s.date.startsWith(monthKey))
      .sort((a, b) => a.date.localeCompare(b.date))

    return (
      <div className={`border rounded-lg overflow-hidden ${dk('border-gray-700', 'border-gray-200')}`}>

        {/* Month header + booking toggle */}
        <div className={`px-4 py-3 flex items-center justify-between gap-3 ${dk('bg-gray-800', 'bg-gray-50')}`}>
          <p className={`font-semibold text-sm ${dk('text-gray-100', 'text-gray-800')}`}>
            {MONTH_NAMES[month]} {year}
          </p>
          <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={isOpen}
              onChange={() => toggleMonth(monthKey)}
              className="accent-amber-500 w-4 h-4"
            />
            <span className={`text-xs font-medium transition-colors ${
              isOpen ? 'text-amber-500' : dk('text-gray-500', 'text-gray-400')
            }`}>
              Open for booking
            </span>
          </label>
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
              const ds = toDateStr(day)
              const past = ds < todayStr
              const monOrFri = isMonOrFri(day)
              const show = showsByDate.get(ds)
              const booked = !!show

              let cls = 'h-8 flex items-center justify-center text-xs rounded relative '

              if (!monOrFri) {
                // Non-booking day — very dim
                cls += dk('text-gray-700', 'text-gray-300')
              } else if (booked && past) {
                // Past booked Mon/Fri — dim amber
                cls += dk('text-amber-800 bg-amber-900/20', 'text-amber-300 bg-amber-50')
              } else if (booked) {
                // Upcoming booked Mon/Fri — bright amber
                cls += 'bg-amber-500/20 text-amber-400 font-bold ring-1 ring-amber-500/40'
              } else if (past) {
                // Past open Mon/Fri — just grey
                cls += dk('text-gray-600', 'text-gray-400')
              } else {
                // Future open Mon/Fri — green = bookable
                cls += dk(
                  'bg-emerald-900/30 text-emerald-400 font-semibold ring-1 ring-emerald-700/40',
                  'bg-emerald-50 text-emerald-700 font-semibold ring-1 ring-emerald-200'
                )
              }

              return (
                <div
                  key={i}
                  className={cls}
                  title={booked ? show.artistName : monOrFri && !past ? 'Open' : undefined}
                >
                  {day.getDate()}
                  {booked && (
                    <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-amber-400" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Show list */}
          {monthShows.length > 0 && (
            <div className={`mt-3 pt-3 border-t space-y-1.5 ${dk('border-gray-800', 'border-gray-100')}`}>
              {monthShows.map(s => {
                const d = new Date(s.date + 'T00:00:00')
                const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
                const isPast = s.date < todayStr
                return (
                  <div key={s.id} className={`flex items-baseline gap-2 ${isPast ? 'opacity-40' : ''}`}>
                    <span className="text-xs text-amber-500 font-semibold shrink-0 tabular-nums w-14">
                      {dayName} {d.getDate()}
                    </span>
                    <span className={`text-xs truncate ${dk('text-gray-300', 'text-gray-700')}`}>
                      {s.artistName}
                    </span>
                    {s.featured && (
                      <span className="text-xs text-amber-500 shrink-0">★</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">

      {/* Description */}
      <p className={`text-sm leading-relaxed ${dk('text-gray-400', 'text-gray-600')}`}>
        Check a month to allow musicians to request bookings through their portal. Uncheck to close it.
        Amber = booked · Green = open Mon/Fri · Changes go live after publishing (~30 seconds).
      </p>

      {/* Legend */}
      <div className={`flex flex-wrap gap-5 text-xs ${dk('text-gray-400', 'text-gray-500')}`}>
        <span className="flex items-center gap-1.5">
          <span className={`w-5 h-5 rounded flex-shrink-0 ring-1 ${dk('bg-amber-500/20 ring-amber-500/40', 'bg-amber-50 ring-amber-200')}`} />
          Booked (upcoming)
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
