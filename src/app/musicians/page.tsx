import type { Metadata } from 'next'
import type { StoredShow } from '@/types'
import showsData from '@/data/shows.json'
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
    />
  )
}
