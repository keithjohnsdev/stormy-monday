import type { Metadata } from 'next'
import type { StoredShow } from '@/types'
import showsData from '@/data/shows.json'
import bookingConfigJson from '@/data/booking-config.json'
const bookingConfigData = bookingConfigJson as { openMonths: string[] }
import { content } from '@/content'
import MusicianClient from './MusicianClient'

export const metadata: Metadata = {
  title: 'Musician Portal — Stormy Monday',
  robots: 'noindex, nofollow',
}

export default function MusicianPortalPage() {
  return (
    <MusicianClient
      initialShows={showsData as StoredShow[]}
      gigDetails={content.gigDetails}
      openMonths={bookingConfigData.openMonths}
    />
  )
}
