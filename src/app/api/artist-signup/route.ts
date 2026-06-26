import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { verifyInviteToken } from '@/lib/invite'
import type { Artist } from '@/types'

// Public, token-authenticated self-onboarding. A musician opens the invite link
// (/artist-signup?token=...), fills out the form, and submits here. The invite
// token (not an admin password or session) authorizes appending a new entry to
// src/data/artists.json via the GitHub Contents API, which triggers a redeploy.

const ARTISTS_PATH = 'src/data/artists.json'
const ALLOWED_IMG = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function gh(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function env() {
  const { GH_PAT, GITHUB_OWNER, GITHUB_REPO } = process.env
  if (!GH_PAT || !GITHUB_OWNER || !GITHUB_REPO) return null
  return { token: GH_PAT, owner: GITHUB_OWNER, repo: GITHUB_REPO }
}

async function getFile<T>(e: NonNullable<ReturnType<typeof env>>, path: string): Promise<{ data: T; sha: string } | null> {
  const res = await fetch(`https://api.github.com/repos/${e.owner}/${e.repo}/contents/${path}`, {
    headers: gh(e.token), cache: 'no-store',
  })
  if (!res.ok) return null
  const json = await res.json()
  return { data: JSON.parse(Buffer.from(json.content, 'base64').toString('utf-8')) as T, sha: json.sha }
}

async function putFile(e: NonNullable<ReturnType<typeof env>>, path: string, contentB64: string, message: string, sha?: string) {
  const res = await fetch(`https://api.github.com/repos/${e.owner}/${e.repo}/contents/${path}`, {
    method: 'PUT',
    headers: { ...gh(e.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: contentB64, ...(sha ? { sha } : {}) }),
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`)
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'artist'
}

// ─── GET — validate an invite token before showing the form ──────────────────────

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? ''
  const email = verifyInviteToken(token)
  if (!email) return NextResponse.json({ error: 'This invite link is invalid or has expired.' }, { status: 400 })
  return NextResponse.json({ email })
}

// ─── POST — create the artist from a completed form ──────────────────────────────

export async function POST(req: NextRequest) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const token = String(form.get('token') ?? '')
  const email = verifyInviteToken(token)
  if (!email) return NextResponse.json({ error: 'This invite link is invalid or has expired.' }, { status: 400 })

  const name = String(form.get('name') ?? '').trim()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  const genre = String(form.get('genre') ?? '').trim()
  const description = String(form.get('description') ?? '').trim()
  const website = String(form.get('website') ?? '').trim()

  const e = env()
  if (!e) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

  const file = form.get('file') as File | null

  // Fetch current roster (also gives us the sha for the commit)
  const roster = await getFile<Artist[]>(e, ARTISTS_PATH)
  if (!roster) return NextResponse.json({ error: 'Could not load roster' }, { status: 500 })

  // Reject if this email already has a roster entry — invite links are one-and-done
  if (roster.data.some(a => (a.email ?? '').toLowerCase() === email)) {
    return NextResponse.json({ error: 'A profile already exists for this email. Contact the venue if you need changes.' }, { status: 409 })
  }

  // Unique id from the name
  let id = `artist-${slugify(name)}`
  if (roster.data.some(a => a.id === id)) {
    let n = 2
    while (roster.data.some(a => a.id === `${id}-${n}`)) n++
    id = `${id}-${n}`
  }

  // Optional photo — commit it first so we can store the URL on the artist
  let imageUrl = ''
  if (file && file.size > 0) {
    if (!ALLOWED_IMG.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid photo type. Use JPG, PNG, or WebP.' }, { status: 400 })
    }
    const repoPath = `public/images/artists/${id}/photo.jpg`
    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
    try {
      await putFile(e, repoPath, base64, `artist-signup: photo for ${name}`)
      imageUrl = `/images/artists/${id}/photo.jpg`
    } catch (err) {
      console.error('artist-signup: photo upload failed', err)
      // Non-fatal — continue without a photo
    }
  }

  // Generate a portal password so the artist can manage their profile later
  const password = crypto.randomBytes(6).toString('base64url').slice(0, 8)

  const artist: Artist = {
    id, name, genre, description, website,
    defaultCoverCharge: 'Free',
    email, password, imageUrl,
  }

  try {
    const next = [...roster.data, artist]
    const content = Buffer.from(JSON.stringify(next, null, 2) + '\n').toString('base64')
    await putFile(e, ARTISTS_PATH, content, `artist-signup: add ${name}`, roster.sha)
  } catch (err) {
    console.error('artist-signup: roster commit failed', err)
    return NextResponse.json({ error: 'Could not save your profile. Try again.' }, { status: 500 })
  }

  // Return the login the artist can use later at /musicians
  return NextResponse.json({ ok: true, login: { email, password } })
}
