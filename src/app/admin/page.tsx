import { content } from '@/content'
import artistsData from '@/data/artists.json'
import showsData from '@/data/shows.json'
import bookingConfigData from '@/data/booking-config.json'
import type { Artist, StoredShow } from '@/types'
import AdminClient from './AdminClient'

export const metadata = { robots: 'noindex, nofollow' }

export default function AdminPage() {
  return (
    <AdminClient
      initialData={content}
      initialArtists={artistsData as Artist[]}
      initialShows={showsData as StoredShow[]}
      initialOpenMonths={bookingConfigData.openMonths}
    />
  )
}
