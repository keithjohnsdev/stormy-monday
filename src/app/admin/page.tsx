import { content } from '@/content'
import artistsData from '@/data/artists.json'
import showsData from '@/data/shows.json'
import bookingConfigJson from '@/data/booking-config.json'
const bookingConfigData = bookingConfigJson as { openMonths: string[]; approvedMonths: string[] }
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
      initialApprovedMonths={bookingConfigData.approvedMonths ?? []}
    />
  )
}
