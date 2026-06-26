import { Suspense } from 'react'
import type { Metadata } from 'next'
import ArtistSignupClient from './ArtistSignupClient'

export const metadata: Metadata = {
  title: 'Artist Sign-Up',
  robots: { index: false, follow: false },
}

export default function ArtistSignupPage() {
  return (
    <Suspense fallback={null}>
      <ArtistSignupClient />
    </Suspense>
  )
}
