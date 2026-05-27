'use client'

import { useState, useMemo } from 'react'
import { Show } from '@/types'
import EventCard from './EventCard'

type Filter = 'all' | 'week' | 'month'

interface Props {
  shows: Show[]
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

export default function ShowsGrid({ shows }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    if (filter === 'week')  return shows.filter((s) => isThisWeek(s.date))
    if (filter === 'month') return shows.filter((s) => isThisMonth(s.date))
    return shows
  }, [shows, filter])

  const filters: { value: Filter; label: string }[] = [
    { value: 'all',   label: 'All Shows' },
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border border-storm-border p-16 text-center">
          <p className="font-display text-2xl text-storm-cream mb-3">No shows scheduled</p>
          <p className="text-storm-muted text-sm mb-6">
            {filter !== 'all'
              ? 'No shows in this window. Try viewing all upcoming shows.'
              : 'New shows are announced regularly.'}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="btn-outline text-xs"
            >
              View All Shows
            </button>
          )}
          {filter === 'all' && (
            <a
              href="https://www.instagram.com/stormymondaymia/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-storm-gold text-xs tracking-widest uppercase hover:text-storm-gold-light transition-colors"
            >
              Follow @stormymondaymia for announcements
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((show) => (
            <EventCard key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  )
}
