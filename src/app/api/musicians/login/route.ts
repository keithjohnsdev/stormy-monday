import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/session'
import artistsData from '@/data/artists.json'
import type { Artist } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const artists = artistsData as Artist[]
  const artist = artists.find(
    a =>
      a.email &&
      a.password &&
      a.email.toLowerCase() === (body.email as string).toLowerCase() &&
      a.password === body.password
  )

  if (!artist) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = createSessionToken(artist.id)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return res
}
