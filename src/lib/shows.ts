import type { Show, StoredShow, Artist } from '@/types'
import showsData from '@/data/shows.json'
import artistsData from '@/data/artists.json'

export function getUpcomingShows(): Show[] {
  const today = new Date().toISOString().split('T')[0]

  const artistMap = new Map<string, Artist>(
    (artistsData as Artist[]).map(a => [a.id, a])
  )

  console.log('[shows] shows.json:', JSON.stringify(showsData, null, 2))
  console.log('[shows] artists.json:', JSON.stringify(artistsData, null, 2))

  return (showsData as StoredShow[])
    .filter(s => s.status === 'published' && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(s => {
      const artist = artistMap.get(s.artistId)
      const artistPhoto = s.artistPhoto || artist?.imageUrl || undefined
      console.log(`[shows] show "${s.artistName}" (${s.id}): artistId=${s.artistId}, artistPhoto=${artistPhoto}`)
      return { ...s, artistPhoto }
    })
}
