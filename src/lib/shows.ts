import type { Show, StoredShow } from '@/types'
import showsData from '@/data/shows.json'

export function getUpcomingShows(): Show[] {
  const today = new Date().toISOString().split('T')[0]
  return (showsData as StoredShow[])
    .filter(s => s.status === 'published' && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
}
