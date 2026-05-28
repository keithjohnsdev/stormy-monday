'use client'

import { useState, useEffect } from 'react'
import type { Artist, StoredShow } from '@/types'

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
  while (grid.length < 42) grid.push(null)
  return grid
}

function formatAdminDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return `${days[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ─── Component ─────────────────────────────────────────────────────────────────

interface Props {
  shows: StoredShow[]
  artists: Artist[]
  initialOpenMonths: string[]
  initialApprovedMonths: string[]
  password: string
  isDark: boolean
  onAuthError: () => void
}

export default function BookingCalendarTab({
  shows: initialShows,
  artists,
  initialOpenMonths,
  initialApprovedMonths,
  password,
  isDark,
  onAuthError,
}: Props) {
  const [openMonths,     setOpenMonths]     = useState<Set<string>>(new Set(initialOpenMonths))
  const [approvedMonths, setApprovedMonths] = useState<Set<string>>(new Set(initialApprovedMonths))
  const [localShows,     setLocalShows]     = useState<StoredShow[]>(initialShows)
  const [status,         setStatus]         = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg,       setErrorMsg]       = useState('')

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [selectedDate,  setSelectedDate]  = useState<string | null>(null)
  const [modalEditing,  setModalEditing]  = useState(false)
  const [modalArtistId, setModalArtistId] = useState('')

  const now      = new Date()
  const todayStr = toDateStr(now)
  const dk = (dark: string, light: string) => isDark ? dark : light

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const publishedByDate = new Map(localShows.filter(s => s.status === 'published').map(s => [s.date, s]))
  const draftByDate     = new Map(localShows.filter(s => s.status === 'draft').map(s => [s.date, s]))

  // Escape to close modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && selectedDate) closeModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selectedDate])

  // ── Auto-save ────────────────────────────────────────────────────────────────
  // Pass null for newShows to skip the shows commit (config-only changes).

  async function autoSave(
    newShows: StoredShow[] | null,
    newOpen: Set<string>,
    newApproved: Set<string>,
  ) {
    setStatus('saving')
    setErrorMsg('')
    console.log('shows:', JSON.parse(JSON.stringify(newShows ?? localShows)))
    try {
      if (newShows !== null) {
        const r = await fetch('/api/save-shows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
          body: JSON.stringify({ shows: newShows }),
        })
        if (r.status === 401) { onAuthError(); return }
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          setErrorMsg((body as { error?: string }).error ?? `HTTP ${r.status}`)
          setStatus('error')
          return
        }
      }

      const r2 = await fetch('/api/save-booking-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({
          openMonths:     [...newOpen],
          approvedMonths: [...newApproved],
        }),
      })
      if (r2.status === 401) { onAuthError(); return }
      if (r2.ok) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 4000)
      } else {
        const body = await r2.json().catch(() => ({}))
        setErrorMsg((body as { error?: string }).error ?? `HTTP ${r2.status}`)
        setStatus('error')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error')
      setStatus('error')
    }
  }

  // ── Modal actions ────────────────────────────────────────────────────────────

  function openModal(dateStr: string) {
    const show = publishedByDate.get(dateStr) ?? draftByDate.get(dateStr)
    if (!show) return
    setSelectedDate(dateStr)
    setModalEditing(false)
    setModalArtistId(show.artistId)
  }

  function closeModal() {
    setSelectedDate(null)
    setModalEditing(false)
    setModalArtistId('')
  }

  async function approveShow() {
    if (!selectedDate) return
    const show = publishedByDate.get(selectedDate) ?? draftByDate.get(selectedDate)
    if (!show) return
    const newShows = localShows.map(s =>
      s.id !== show.id ? s : { ...s, status: 'published' as const }
    )
    setLocalShows(newShows)
    closeModal()
    await autoSave(newShows, openMonths, approvedMonths)
  }

  async function confirmModalEdit() {
    if (!selectedDate) return
    const show = publishedByDate.get(selectedDate) ?? draftByDate.get(selectedDate)
    if (!show) return
    const artist = artists.find(a => a.id === modalArtistId)
    if (!artist) return
    const newShows = localShows.map(s =>
      s.id !== show.id ? s : {
        ...s,
        artistId:      artist.id,
        artistName:    artist.name,
        genre:         artist.genre,
        description:   artist.description,
        artistWebsite: artist.website || '',
      }
    )
    setLocalShows(newShows)
    setModalEditing(false)
    await autoSave(newShows, openMonths, approvedMonths)
  }

  async function removeModalShow() {
    if (!selectedDate) return
    const show = publishedByDate.get(selectedDate) ?? draftByDate.get(selectedDate)
    if (!show) return
    const newShows = localShows.filter(s => s.id !== show.id)
    setLocalShows(newShows)
    closeModal()
    await autoSave(newShows, openMonths, approvedMonths)
  }

  // ── Calendar card actions ────────────────────────────────────────────────────

  async function toggleOpen(monthKey: string) {
    const newOpen = new Set(openMonths)
    newOpen.has(monthKey) ? newOpen.delete(monthKey) : newOpen.add(monthKey)
    setOpenMonths(newOpen)
    await autoSave(null, newOpen, approvedMonths)
  }

  async function approveAllInMonth(monthKey: string) {
    const newShows = localShows.map(s =>
      s.date.startsWith(monthKey) && s.status === 'draft'
        ? { ...s, status: 'published' as const }
        : s
    )
    const newApproved = new Set([...approvedMonths, monthKey])
    setLocalShows(newShows)
    setApprovedMonths(newApproved)
    await autoSave(newShows, openMonths, newApproved)
  }

  async function unpublishMonth(monthKey: string) {
    const newShows = localShows.map(s =>
      s.date.startsWith(monthKey) && s.status === 'published'
        ? { ...s, status: 'draft' as const }
        : s
    )
    const newApproved = new Set(approvedMonths)
    newApproved.delete(monthKey)
    setLocalShows(newShows)
    setApprovedMonths(newApproved)
    await autoSave(newShows, openMonths, newApproved)
  }

  // ── Month card renderer ──────────────────────────────────────────────────────

  const selectCls = `text-xs border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 ${
    dk('bg-gray-700 border-gray-600 text-gray-100', 'bg-white border-gray-300 text-gray-800')
  }`

  function renderMonth(year: number, month: number) {
    const monthKey        = `${year}-${String(month + 1).padStart(2, '0')}`
    const isOpen          = openMonths.has(monthKey)
    const isApproved      = approvedMonths.has(monthKey)
    const grid            = getMonthGrid(year, month)
    const monthDraftCount = localShows.filter(s => s.status === 'draft' && s.date.startsWith(monthKey)).length

    return (
      <div className={`border rounded-lg overflow-hidden ${dk('border-gray-700', 'border-gray-200')}`}>

        {/* Month header */}
        <div className={`px-4 py-3 ${dk('bg-gray-800', 'bg-gray-50')}`}>
          <div className="flex items-center justify-between gap-3">
            <p className={`font-semibold text-sm ${dk('text-gray-100', 'text-gray-800')}`}>
              {MONTH_NAMES[month]} {year}
              {monthDraftCount > 0 && (
                <span className="ml-2 text-xs font-normal text-amber-400">
                  {monthDraftCount} pending
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
              if (!day) return <div key={i} className="h-8" />
              const ds        = toDateStr(day)
              const past      = ds < todayStr
              const monOrFri  = isMonOrFri(day)
              const published = publishedByDate.get(ds)
              const draft     = draftByDate.get(ds)
              const show      = published ?? draft
              const isPending = !published && !!draft
              const clickable = !!show

              let cls = 'h-8 flex items-center justify-center text-xs rounded relative '
              if (clickable) cls += 'cursor-pointer '

              if (!monOrFri) {
                cls += dk('text-gray-700', 'text-gray-300')
              } else if (isPending) {
                cls += past
                  ? dk('text-amber-900 bg-amber-900/10', 'text-amber-700 bg-amber-50')
                  : 'bg-amber-900/20 text-amber-300 font-bold ring-1 ring-amber-500/40'
                if (clickable) cls += ' hover:ring-2 hover:ring-amber-400/60'
              } else if (published && past) {
                cls += dk('text-emerald-800 bg-emerald-900/20', 'text-emerald-700 bg-emerald-50')
                if (clickable) cls += dk(' hover:ring-2 hover:ring-emerald-600/60', ' hover:ring-2 hover:ring-emerald-400/60')
              } else if (published) {
                cls += 'bg-emerald-500/20 text-emerald-400 font-bold ring-1 ring-emerald-500/40'
                if (clickable) cls += ' hover:ring-2 hover:ring-emerald-400/80'
              } else if (past) {
                cls += dk('text-gray-600', 'text-gray-400')
              } else {
                cls += dk(
                  'bg-gray-700/30 text-gray-400 font-semibold ring-1 ring-gray-600/40',
                  'bg-gray-100 text-gray-500 font-semibold ring-1 ring-gray-300'
                )
              }

              return (
                <div
                  key={i}
                  className={cls}
                  onClick={clickable ? () => openModal(ds) : undefined}
                  title={
                    isPending ? `Pending: ${draft!.artistName} — click to edit`
                    : show     ? `${show.artistName} — click to edit`
                    : monOrFri && !past ? 'Open'
                    : undefined
                  }
                >
                  {day.getDate()}
                  {show && (
                    isPending
                      ? <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-amber-400" />
                      : <span className="absolute top-0 right-0.5 text-[9px] leading-none font-bold text-emerald-400">✓</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Approve All / Unpublish */}
          <div className={`mt-4 pt-3 border-t ${dk('border-gray-800', 'border-gray-100')}`}>
            {!isApproved ? (
              <button
                onClick={() => approveAllInMonth(monthKey)}
                disabled={status === 'saving' || monthDraftCount === 0}
                className={`w-full py-2 text-xs font-semibold rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  dk(
                    'bg-emerald-900/20 text-emerald-400 hover:enabled:bg-emerald-900/40 border border-emerald-800/40',
                    'bg-emerald-50 text-emerald-700 hover:enabled:bg-emerald-100 border border-emerald-200'
                  )
                }`}
              >
                ✓ Approve All
              </button>
            ) : (
              <button
                onClick={() => unpublishMonth(monthKey)}
                disabled={status === 'saving'}
                className={`w-full py-2 text-xs font-semibold rounded transition-colors disabled:opacity-50 ${
                  dk(
                    'bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-800/40',
                    'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
                  )
                }`}
              >
                ✕ Unapprove All
              </button>
            )}
          </div>

        </div>
      </div>
    )
  }

  // ── Modal ───────────────────────────────────────────────────────────────────

  const modalShow       = selectedDate ? (publishedByDate.get(selectedDate) ?? draftByDate.get(selectedDate) ?? null) : null
  const isPendingModal  = modalShow?.status === 'draft'

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="grid gap-6">

      {/* Legend + save status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`flex flex-wrap gap-5 text-xs ${dk('text-gray-400', 'text-gray-500')}`}>
          <span className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded flex-shrink-0 ring-1 ${dk('bg-emerald-500/20 ring-emerald-500/40', 'bg-emerald-50 ring-emerald-200')}`} />
            Published
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded flex-shrink-0 ring-1 ${dk('bg-amber-900/20 ring-amber-500/40', 'bg-amber-50 ring-amber-200')}`} />
            Pending approval
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded flex-shrink-0 ring-1 ${dk('bg-gray-700/30 ring-gray-600/40', 'bg-gray-100 ring-gray-300')}`} />
            Open Mon / Fri
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded flex-shrink-0 ${dk('bg-gray-700/50', 'bg-gray-100')}`} />
            Not a booking day
          </span>
        </div>

        {/* Auto-save status */}
        {status !== 'idle' && (
          <span className={`text-xs shrink-0 ${
            status === 'saving' ? dk('text-gray-400', 'text-gray-500') :
            status === 'saved'  ? 'text-emerald-500' :
            'text-red-400'
          }`}>
            {status === 'saving' ? 'Saving…' :
             status === 'saved'  ? '✓ Live in ~30 seconds' :
             `Error: ${errorMsg || 'something went wrong'}`}
          </span>
        )}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {months.map(({ year, month }) => (
          <div key={`${year}-${month}`}>
            {renderMonth(year, month)}
          </div>
        ))}
      </div>

      {/* Date detail modal */}
      {selectedDate && modalShow && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div className={`relative w-full max-w-sm rounded-lg shadow-2xl border p-6 grid gap-5 ${
            dk('bg-gray-900 border-gray-700', 'bg-white border-gray-200')
          }`}>

            {/* Close */}
            <button
              onClick={closeModal}
              className={`absolute top-4 right-4 text-lg leading-none transition-colors ${
                dk('text-gray-600 hover:text-gray-300', 'text-gray-400 hover:text-gray-700')
              }`}
            >
              ×
            </button>

            {/* Date + status */}
            <div>
              <p className={`text-xs uppercase tracking-widest mb-1.5 ${
                isPendingModal ? 'text-amber-400' : 'text-emerald-500'
              }`}>
                {isPendingModal ? 'Pending Approval' : 'Published'}
              </p>
              <p className={`font-semibold text-base ${dk('text-gray-100', 'text-gray-900')}`}>
                {formatAdminDate(selectedDate)}
              </p>
            </div>

            {/* Artist info or edit dropdown */}
            {!modalEditing ? (
              <div className={`border rounded-md p-4 ${dk('border-gray-700 bg-gray-800/50', 'border-gray-200 bg-gray-50')}`}>
                <p className={`font-semibold text-sm mb-0.5 ${dk('text-gray-100', 'text-gray-900')}`}>
                  {modalShow.artistName}
                </p>
                {modalShow.genre && (
                  <p className={`text-xs ${dk('text-gray-400', 'text-gray-500')}`}>{modalShow.genre}</p>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                <p className={`text-xs uppercase tracking-widest ${dk('text-gray-400', 'text-gray-500')}`}>
                  Change musician
                </p>
                <select
                  value={modalArtistId}
                  onChange={e => setModalArtistId(e.target.value)}
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    dk('bg-gray-800 border-gray-600 text-gray-100', 'bg-white border-gray-300 text-gray-800')
                  }`}
                >
                  {artists.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={confirmModalEdit}
                    disabled={status === 'saving'}
                    className="flex-1 py-2 text-sm font-semibold rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white transition-colors"
                  >
                    {status === 'saving' ? 'Saving…' : 'Save Change'}
                  </button>
                  <button
                    onClick={() => setModalEditing(false)}
                    className={`flex-1 py-2 text-sm rounded border transition-colors ${
                      dk('border-gray-600 text-gray-400 hover:text-gray-200', 'border-gray-300 text-gray-500 hover:text-gray-800')
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {!modalEditing && (
              <div className="grid gap-2 pt-1">
                {isPendingModal && (
                  <button
                    onClick={approveShow}
                    disabled={status === 'saving'}
                    className={`w-full py-2.5 text-sm font-semibold rounded border transition-colors disabled:opacity-50 ${
                      dk(
                        'bg-emerald-900/20 border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/40',
                        'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      )
                    }`}
                  >
                    {status === 'saving' ? 'Approving…' : '✓ Approve'}
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalEditing(true)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded border transition-colors ${
                      dk(
                        'border-gray-600 text-gray-300 hover:text-white hover:border-gray-400',
                        'border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-500'
                      )
                    }`}
                  >
                    Edit Musician
                  </button>
                  <button
                    onClick={removeModalShow}
                    disabled={status === 'saving'}
                    className={`flex-1 py-2.5 text-sm font-medium rounded border transition-colors disabled:opacity-50 ${
                      dk(
                        'border-red-800/50 text-red-400 hover:bg-red-900/20 hover:border-red-700',
                        'border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300'
                      )
                    }`}
                  >
                    Remove Show
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
