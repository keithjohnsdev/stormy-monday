'use client'

import { useState, useEffect } from 'react'
import type { Artist, StoredShow, CalendarEvent } from '@/types'
import ImageUpload from '@/components/admin/ImageUpload'

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
  initialEvents: CalendarEvent[]
  initialOpenMonths: string[]
  initialApprovedMonths: string[]
  password: string
  isDark: boolean
  onAuthError: () => void
}

export default function BookingCalendarTab({
  shows: initialShows,
  artists,
  initialEvents,
  initialOpenMonths,
  initialApprovedMonths,
  password,
  isDark,
  onAuthError,
}: Props) {
  const [openMonths,     setOpenMonths]     = useState<Set<string>>(new Set(initialOpenMonths))
  const [approvedMonths, setApprovedMonths] = useState<Set<string>>(new Set(initialApprovedMonths))
  const [localShows,     setLocalShows]     = useState<StoredShow[]>(initialShows)
  const [localEvents,    setLocalEvents]    = useState<CalendarEvent[]>(initialEvents)
  const [status,         setStatus]         = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg,       setErrorMsg]       = useState('')

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [selectedDate,      setSelectedDate]      = useState<string | null>(null)
  const [modalMode,         setModalMode]         = useState<'show' | 'event' | null>(null)
  // Show modal fields
  const [modalEditing,      setModalEditing]      = useState(false)
  const [modalArtistId,     setModalArtistId]     = useState('')
  const [modalTicketed,     setModalTicketed]     = useState(false)
  const [modalFeatured,     setModalFeatured]     = useState(false)
  const [modalTicketLink,   setModalTicketLink]   = useState('')
  // Event modal fields
  const [modalEventName,    setModalEventName]    = useState('')
  const [modalEventTime,    setModalEventTime]    = useState('9pm')
  const [modalEventDesc,    setModalEventDesc]    = useState('')
  const [modalEventTicketed,    setModalEventTicketed]    = useState(false)
  const [modalEventTicketLink,  setModalEventTicketLink]  = useState('')
  const [modalEventFeatured,    setModalEventFeatured]    = useState(false)
  const [modalEventImageUrl,    setModalEventImageUrl]    = useState('')
  const [modalEventId,          setModalEventId]          = useState('')

  const now      = new Date()
  const todayStr = toDateStr(now)
  const dk = (dark: string, light: string) => isDark ? dark : light

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const publishedByDate = new Map(localShows.filter(s => s.status === 'published').map(s => [s.date, s]))
  const draftByDate     = new Map(localShows.filter(s => s.status === 'draft').map(s => [s.date, s]))
  const eventByDate     = new Map(localEvents.map(e => [e.date, e]))

  // Escape to close modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && selectedDate) closeModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selectedDate])

  // ── Auto-save: shows + booking config ───────────────────────────────────────

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
        body: JSON.stringify({ openMonths: [...newOpen], approvedMonths: [...newApproved] }),
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

  // ── Auto-save: events ───────────────────────────────────────────────────────

  async function autoSaveEvents(newEvents: CalendarEvent[]) {
    setStatus('saving')
    setErrorMsg('')
    console.log('events:', JSON.parse(JSON.stringify(newEvents)))
    try {
      const r = await fetch('/api/save-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
        body: JSON.stringify({ events: newEvents }),
      })
      if (r.status === 401) { onAuthError(); return }
      if (r.ok) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 4000)
      } else {
        const body = await r.json().catch(() => ({}))
        setErrorMsg((body as { error?: string }).error ?? `HTTP ${r.status}`)
        setStatus('error')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error')
      setStatus('error')
    }
  }

  // ── Modal open / close ───────────────────────────────────────────────────────

  function openModal(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    setSelectedDate(dateStr)

    if (isMonOrFri(d)) {
      // Show modal
      const show = publishedByDate.get(dateStr) ?? draftByDate.get(dateStr)
      setModalMode('show')
      setModalEditing(false)
      setModalArtistId(show?.artistId ?? artists[0]?.id ?? '')
      setModalTicketed(false); setModalFeatured(false); setModalTicketLink('')
    } else {
      // Event modal
      const event = eventByDate.get(dateStr)
      setModalMode('event')
      setModalEventName(event?.name ?? '')
      setModalEventTime(event?.startTime ?? '9pm')
      setModalEventDesc(event?.description ?? '')
      setModalEventTicketed(event?.ticketed ?? false)
      setModalEventTicketLink(event?.ticketLink ?? '')
      setModalEventFeatured(event?.featured ?? false)
      setModalEventImageUrl(event?.imageUrl ?? '')
      setModalEventId(event?.id ?? `evt-${Date.now()}`)
    }
  }

  function closeModal() {
    setSelectedDate(null)
    setModalMode(null)
    setModalEditing(false)
    setModalArtistId('')
    setModalTicketed(false); setModalFeatured(false); setModalTicketLink('')
    setModalEventName(''); setModalEventTime('9pm'); setModalEventDesc('')
    setModalEventTicketed(false); setModalEventTicketLink(''); setModalEventFeatured(false)
    setModalEventImageUrl('')
    setModalEventId('')
  }

  // ── Show modal actions ───────────────────────────────────────────────────────

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
        artistId: artist.id, artistName: artist.name,
        genre: artist.genre, description: artist.description,
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

  async function addShow() {
    if (!selectedDate) return
    const artist = artists.find(a => a.id === modalArtistId)
    if (!artist) return
    const newShow: StoredShow = {
      id:            `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date:          selectedDate,
      startTime:     '9pm',
      artistId:      artist.id,
      artistName:    artist.name,
      genre:         artist.genre,
      description:   artist.description,
      artistWebsite: artist.website || '',
      artistPhoto:   artist.imageUrl ?? '',
      ticketed:      modalTicketed,
      ticketLink:    modalTicketed ? modalTicketLink.trim() : '',
      featured:      modalFeatured,
      status:        'published',
    }
    const newShows = [...localShows, newShow]
    setLocalShows(newShows)
    closeModal()
    await autoSave(newShows, openMonths, approvedMonths)
  }

  // ── Event modal actions ──────────────────────────────────────────────────────

  async function saveEvent() {
    if (!selectedDate || !modalEventName.trim()) return
    const existing = eventByDate.get(selectedDate)

    let newEvents: CalendarEvent[]
    if (existing) {
      // Update existing
      newEvents = localEvents.map(e =>
        e.id !== existing.id ? e : {
          ...e,
          name:        modalEventName.trim(),
          startTime:   modalEventTime.trim() || '9pm',
          description: modalEventDesc.trim() || undefined,
          ticketed:    modalEventTicketed,
          ticketLink:  modalEventTicketed ? modalEventTicketLink.trim() : '',
          featured:    modalEventFeatured,
          imageUrl:    modalEventImageUrl || undefined,
        }
      )
    } else {
      // Create new
      const newEvent: CalendarEvent = {
        id:          modalEventId,
        name:        modalEventName.trim(),
        date:        selectedDate,
        startTime:   modalEventTime.trim() || '9pm',
        description: modalEventDesc.trim() || undefined,
        ticketed:    modalEventTicketed,
        ticketLink:  modalEventTicketed ? modalEventTicketLink.trim() : '',
        featured:    modalEventFeatured,
        imageUrl:    modalEventImageUrl || undefined,
      }
      newEvents = [...localEvents, newEvent].sort((a, b) => a.date.localeCompare(b.date))
    }

    setLocalEvents(newEvents)
    closeModal()
    await autoSaveEvents(newEvents)
  }

  async function removeEvent() {
    if (!selectedDate) return
    const existing = eventByDate.get(selectedDate)
    if (!existing) return
    const newEvents = localEvents.filter(e => e.id !== existing.id)
    setLocalEvents(newEvents)
    closeModal()
    await autoSaveEvents(newEvents)
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
              const ds         = toDateStr(day)
              const past       = ds < todayStr
              const mf         = isMonOrFri(day)
              const published  = publishedByDate.get(ds)
              const draft      = draftByDate.get(ds)
              const show       = published ?? draft
              const isPending  = !published && !!draft
              const event      = !mf ? eventByDate.get(ds) : undefined
              const isEventDay = !!event
              // all future dates are clickable (show-or-event logic in openModal)
              const clickable  = past ? (!!show || isEventDay) : true

              let cls = 'h-8 flex items-center justify-center text-xs rounded relative '
              if (clickable) cls += 'cursor-pointer '

              if (mf) {
                // Mon/Fri: existing show colours
                if (isPending) {
                  cls += past
                    ? dk('text-amber-900 bg-amber-900/10', 'text-amber-700 bg-amber-50')
                    : 'bg-amber-900/20 text-amber-300 font-bold ring-1 ring-amber-500/40'
                  if (!past) cls += ' hover:ring-2 hover:ring-amber-400/60'
                } else if (published && past) {
                  cls += dk('text-emerald-800 bg-emerald-900/20', 'text-emerald-700 bg-emerald-50')
                  cls += dk(' hover:ring-2 hover:ring-emerald-600/60', ' hover:ring-2 hover:ring-emerald-400/60')
                } else if (published) {
                  cls += 'bg-emerald-500/20 text-emerald-400 font-bold ring-1 ring-emerald-500/40'
                  cls += ' hover:ring-2 hover:ring-emerald-400/80'
                } else if (past) {
                  cls += dk('text-gray-600', 'text-gray-400')
                } else {
                  // open Mon/Fri
                  cls += dk(
                    'bg-gray-700/30 text-gray-400 font-semibold ring-1 ring-gray-600/40 hover:ring-gray-500/60 hover:text-gray-300',
                    'bg-gray-100 text-gray-500 font-semibold ring-1 ring-gray-300 hover:ring-gray-400 hover:text-gray-700'
                  )
                }
              } else {
                // Non-Mon/Fri
                if (isEventDay && !past) {
                  cls += 'bg-violet-900/20 text-violet-300 font-bold ring-1 ring-violet-500/40 hover:ring-2 hover:ring-violet-400/60'
                } else if (isEventDay && past) {
                  cls += dk('text-violet-900 bg-violet-900/10 hover:ring-1 hover:ring-violet-700/40', 'text-violet-600 bg-violet-50 hover:ring-1 hover:ring-violet-300')
                } else if (!past) {
                  // future empty non-Mon/Fri: subtle hover border per user request
                  cls += dk(
                    'text-gray-700 hover:ring-1 hover:ring-gray-600/50 hover:text-gray-400',
                    'text-gray-300 hover:ring-1 hover:ring-gray-400/50 hover:text-gray-500'
                  )
                } else {
                  cls += dk('text-gray-700', 'text-gray-300')
                }
              }

              return (
                <div
                  key={i}
                  className={cls}
                  onClick={clickable ? () => openModal(ds) : undefined}
                  title={
                    isPending   ? `Pending: ${draft!.artistName} — click to edit`
                    : show      ? `${show.artistName} — click to edit`
                    : isEventDay ? `${event!.name} — click to edit`
                    : !past     ? 'Click to add event or show'
                    : undefined
                  }
                >
                  {day.getDate()}
                  {show && (
                    isPending
                      ? <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-amber-400" />
                      : <span className="absolute top-0 right-0.5 text-[9px] leading-none font-bold text-emerald-400">✓</span>
                  )}
                  {isEventDay && !show && (
                    <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-violet-400" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Approve All / Unapprove All */}
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

  // ── Derived modal state ──────────────────────────────────────────────────────

  const modalShow      = selectedDate ? (publishedByDate.get(selectedDate) ?? draftByDate.get(selectedDate) ?? null) : null
  const modalEvent     = selectedDate ? (eventByDate.get(selectedDate) ?? null) : null
  const isPendingModal = modalShow?.status === 'draft'

  // ── Shared input classes ─────────────────────────────────────────────────────

  const inputCls = `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
    dk('bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500', 'bg-white border-gray-300 text-gray-800 placeholder:text-gray-400')
  }`

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
            <span className={`w-5 h-5 rounded flex-shrink-0 ring-1 ${dk('bg-violet-900/20 ring-violet-500/40', 'bg-violet-50 ring-violet-200')}`} />
            Special event
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-5 h-5 rounded flex-shrink-0 ring-1 ${dk('bg-gray-700/30 ring-gray-600/40', 'bg-gray-100 ring-gray-300')}`} />
            Open Mon / Fri
          </span>
        </div>

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

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {selectedDate && modalMode && (
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
            >×</button>

            {/* Date heading */}
            <div>
              <p className={`text-xs uppercase tracking-widest mb-1.5 ${
                modalMode === 'event'
                  ? (modalEvent ? 'text-violet-400' : dk('text-gray-400', 'text-gray-500'))
                  : (!modalShow ? dk('text-gray-400', 'text-gray-500') : isPendingModal ? 'text-amber-400' : 'text-emerald-500')
              }`}>
                {modalMode === 'event'
                  ? (modalEvent ? 'Special Event' : 'Open Date')
                  : (!modalShow ? 'Open Date' : isPendingModal ? 'Pending Approval' : 'Published')}
              </p>
              <p className={`font-semibold text-base ${dk('text-gray-100', 'text-gray-900')}`}>
                {formatAdminDate(selectedDate)}
              </p>
            </div>

            {/* ══ SHOW MODAL ══ */}
            {modalMode === 'show' && (
              <>
                {!modalShow ? (
                  /* Add show */
                  <div className="grid gap-3">
                    <p className={`text-xs uppercase tracking-widest ${dk('text-gray-400', 'text-gray-500')}`}>Select musician</p>
                    <select value={modalArtistId} onChange={e => setModalArtistId(e.target.value)} className={inputCls}>
                      {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={modalFeatured} onChange={e => setModalFeatured(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                        <span className={`text-sm ${dk('text-gray-300', 'text-gray-700')}`}>Featured</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={modalTicketed} onChange={e => { setModalTicketed(e.target.checked); if (!e.target.checked) setModalTicketLink('') }} className="accent-amber-500 w-4 h-4" />
                        <span className={`text-sm ${dk('text-gray-300', 'text-gray-700')}`}>Ticketed</span>
                      </label>
                    </div>
                    {modalTicketed && (
                      <input type="url" placeholder="Ticket URL" value={modalTicketLink} onChange={e => setModalTicketLink(e.target.value)} className={inputCls} />
                    )}
                    <div className="flex gap-2">
                      <button onClick={addShow} disabled={status === 'saving' || !modalArtistId} className="flex-1 py-2.5 text-sm font-semibold rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white transition-colors">
                        {status === 'saving' ? 'Booking…' : 'Book Show'}
                      </button>
                      <button onClick={closeModal} className={`flex-1 py-2.5 text-sm rounded border transition-colors ${dk('border-gray-600 text-gray-400 hover:text-gray-200', 'border-gray-300 text-gray-500 hover:text-gray-800')}`}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : !modalEditing ? (
                  /* View show */
                  <>
                    <div className={`border rounded-md p-4 ${dk('border-gray-700 bg-gray-800/50', 'border-gray-200 bg-gray-50')}`}>
                      <p className={`font-semibold text-sm mb-0.5 ${dk('text-gray-100', 'text-gray-900')}`}>{modalShow.artistName}</p>
                      {modalShow.genre && <p className={`text-xs ${dk('text-gray-400', 'text-gray-500')}`}>{modalShow.genre}</p>}
                    </div>
                    <div className="grid gap-2 pt-1">
                      {isPendingModal && (
                        <button onClick={approveShow} disabled={status === 'saving'} className={`w-full py-2.5 text-sm font-semibold rounded border transition-colors disabled:opacity-50 ${dk('bg-emerald-900/20 border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/40', 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100')}`}>
                          {status === 'saving' ? 'Approving…' : '✓ Approve'}
                        </button>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => setModalEditing(true)} className={`flex-1 py-2.5 text-sm font-medium rounded border transition-colors ${dk('border-gray-600 text-gray-300 hover:text-white hover:border-gray-400', 'border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-500')}`}>
                          Edit Musician
                        </button>
                        <button onClick={removeModalShow} disabled={status === 'saving'} className={`flex-1 py-2.5 text-sm font-medium rounded border transition-colors disabled:opacity-50 ${dk('border-red-800/50 text-red-400 hover:bg-red-900/20 hover:border-red-700', 'border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300')}`}>
                          Remove Show
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Edit show */
                  <div className="grid gap-3">
                    <p className={`text-xs uppercase tracking-widest ${dk('text-gray-400', 'text-gray-500')}`}>Change musician</p>
                    <select value={modalArtistId} onChange={e => setModalArtistId(e.target.value)} className={inputCls}>
                      {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={confirmModalEdit} disabled={status === 'saving'} className="flex-1 py-2 text-sm font-semibold rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white transition-colors">
                        {status === 'saving' ? 'Saving…' : 'Save Change'}
                      </button>
                      <button onClick={() => setModalEditing(false)} className={`flex-1 py-2 text-sm rounded border transition-colors ${dk('border-gray-600 text-gray-400 hover:text-gray-200', 'border-gray-300 text-gray-500 hover:text-gray-800')}`}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ══ EVENT MODAL ══ */}
            {modalMode === 'event' && (
              <div className="grid gap-3">
                <div>
                  <label className={`text-xs uppercase tracking-widest block mb-1.5 ${dk('text-gray-400', 'text-gray-500')}`}>Event Name</label>
                  <input type="text" placeholder="e.g. Jazz Brunch, NYE Gala…" value={modalEventName} onChange={e => setModalEventName(e.target.value)} className={inputCls} autoFocus />
                </div>
                <div>
                  <label className={`text-xs uppercase tracking-widest block mb-1.5 ${dk('text-gray-400', 'text-gray-500')}`}>Time</label>
                  <input type="text" placeholder="9pm" value={modalEventTime} onChange={e => setModalEventTime(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={`text-xs uppercase tracking-widest block mb-1.5 ${dk('text-gray-400', 'text-gray-500')}`}>Description <span className={dk('text-gray-600', 'text-gray-400')}>(optional)</span></label>
                  <textarea rows={2} placeholder="Short description…" value={modalEventDesc} onChange={e => setModalEventDesc(e.target.value)} className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className={`text-xs uppercase tracking-widest block mb-2 ${dk('text-gray-400', 'text-gray-500')}`}>Photo <span className={dk('text-gray-600', 'text-gray-400')}>(optional)</span></label>
                  <ImageUpload
                    value={modalEventImageUrl || undefined}
                    folder="events"
                    entityId={modalEventId}
                    password={password}
                    isDark={isDark}
                    onChange={url => setModalEventImageUrl(url)}
                  />
                </div>
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={modalEventFeatured} onChange={e => setModalEventFeatured(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                    <span className={`text-sm ${dk('text-gray-300', 'text-gray-700')}`}>Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={modalEventTicketed} onChange={e => { setModalEventTicketed(e.target.checked); if (!e.target.checked) setModalEventTicketLink('') }} className="accent-amber-500 w-4 h-4" />
                    <span className={`text-sm ${dk('text-gray-300', 'text-gray-700')}`}>Ticketed</span>
                  </label>
                </div>
                {modalEventTicketed && (
                  <input type="url" placeholder="Ticket URL" value={modalEventTicketLink} onChange={e => setModalEventTicketLink(e.target.value)} className={inputCls} />
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={saveEvent} disabled={status === 'saving' || !modalEventName.trim()} className="flex-1 py-2.5 text-sm font-semibold rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white transition-colors">
                    {status === 'saving' ? 'Saving…' : (modalEvent ? 'Save Changes' : 'Create Event')}
                  </button>
                  {modalEvent && (
                    <button onClick={removeEvent} disabled={status === 'saving'} className={`py-2.5 px-4 text-sm font-medium rounded border transition-colors disabled:opacity-50 ${dk('border-red-800/50 text-red-400 hover:bg-red-900/20 hover:border-red-700', 'border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300')}`}>
                      Remove
                    </button>
                  )}
                  <button onClick={closeModal} className={`flex-1 py-2.5 text-sm rounded border transition-colors ${dk('border-gray-600 text-gray-400 hover:text-gray-200', 'border-gray-300 text-gray-500 hover:text-gray-800')}`}>
                    Cancel
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
