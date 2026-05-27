import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import artistsData from '@/data/artists.json'
import type { Artist } from '@/types'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const artistId = verifySessionToken(token)
  if (!artistId) {
    const res = NextResponse.json({ error: 'Session expired' }, { status: 401 })
    res.cookies.delete(COOKIE_NAME)
    return res
  }

  const artist = (artistsData as Artist[]).find(a => a.id === artistId)
  if (!artist) {
    return NextResponse.json({ error: 'Artist not found' }, { status: 404 })
  }

  // Return profile data — never return the password
  const { password: _pw, ...safeArtist } = artist
  return NextResponse.json({ artist: safeArtist })
}
