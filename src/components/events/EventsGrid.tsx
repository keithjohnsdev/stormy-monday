'use client'

import { useState, useMemo } from 'react'
import type { Show, CalendarEvent } from '@/types'
import EventCard from '@/components/music/EventCard'
import CalendarEventCard from './CalendarEventCard'

type Filter = 'all' | 'week' | 'month'

interface Props {
  shows: Show[]
  events: CalendarEvent[]
}

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const weekEnd = new Date(now)
  weekEnd.setDate(now.getDate() + 7)
  return d >= now && d <= weekEnd
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

type Entry =
  | { kind: 'show';  date: string; show: Show }
  | { kind: 'event'; date: string; event: CalendarEvent }

export default function EventsGrid({ shows, events }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const allEntries = useMemo<Entry[]>(() => {
    const s: Entry[] = shows.map(show   => ({ kind: 'show',  date: show.date,  show  }))
    const e: Entry[] = events.map(event => ({ kind: 'event', date: event.date, event }))
    return [...s, ...e].sort((a, b) => a.date.localeCompare(b.date))
  }, [shows, events])

  const filtered = useMemo(() => {
    if (filter === 'week')  return allEntries.filter(e => isThisWeek(e.date))
    if (filter === 'month') return allEntries.filter(e => isThisMonth(e.date))
    return allEntries
  }, [allEntries, filter])

  const filters: { value: Filter; label: string }[] = [
    { value: 'all',   label: 'All' },
    { value: 'week',  label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ]

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-10 border-b border-storm-border">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-5 py-3 text-xs tracking-widest uppercase transition-colors -mb-px border-b-2 ${
              filter === value
                ? 'border-storm-gold text-storm-gold'
                : 'border-transparent text-storm-muted hover:text-storm-cream'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-storm-border p-16 text-center">
          <p className="font-display text-2xl text-storm-cream mb-3">Nothing scheduled</p>
          <p className="text-storm-muted text-sm mb-6">
            {filter !== 'all'
              ? 'Nothing in this window. Try viewing all upcoming events.'
              : 'New events and shows are announced regularly.'}
          </p>
          {filter !== 'all' ? (
            <button
              onClick={() => setFilter('all')}
              className="btn-outline text-xs"
            >
              View All
            </button>
          ) : (
            <a
              href="https://www.instagram.com/stormymondaymia/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-storm-gold text-xs tracking-widest uppercase hover:text-storm-gold/80 transition-colors"
            >
              Follow @stormymondaymia for announcements
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(entry =>
            entry.kind === 'show'
              ? <EventCard key={entry.show.id} show={entry.show} />
              : <CalendarEventCard key={entry.event.id} event={entry.event} />
          )}
        </div>
      )}
    </div>
  )
}
