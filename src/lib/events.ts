import type { CalendarEvent } from '@/types'
import eventsData from '@/data/events.json'

export function getUpcomingEvents(): CalendarEvent[] {
  const today = new Date().toISOString().split('T')[0]
  return (eventsData as CalendarEvent[])
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getAllEvents(): CalendarEvent[] {
  return (eventsData as CalendarEvent[])
    .sort((a, b) => a.date.localeCompare(b.date))
}
