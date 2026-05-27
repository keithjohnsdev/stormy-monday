import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import artistsData from '@/data/artists.json'
import type { Artist, StoredShow } from '@/types'

const SHOWS_PATH = 'src/data/shows.json'

// ─── GitHub helpers ────────────────────────────────────────────────────────────

async function getFileContent<T>(
  token: string, owner: string, repo: string, path: string
): Promise<{ data: T; sha: string } | null> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const json = await res.json()
  const content = Buffer.from(json.content as string, 'base64').toString('utf-8')
  return { data: JSON.parse(content) as T, sha: json.sha as string }
}

async function commitFile(
  token: string, owner: string, repo: string,
  path: string, fileContent: string, sha: string | undefined,
  message: string,
): Promise<void> {
  const body: Record<string, string> = {
    message,
    content: Buffer.from(fileContent).toString('base64'),
  }
  if (sha) body.sha = sha
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`)
}

// ─── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Verify session
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  const artistId = verifySessionToken(token)
  if (!artistId) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const artist = (artistsData as Artist[]).find(a => a.id === artistId)
  if (!artist) return NextResponse.json({ error: 'Artist not found' }, { status: 404 })

  const body = await req.json().catch(() => null)
  const date: string | undefined = body?.date
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Valid date (YYYY-MM-DD) required' }, { status: 400 })
  }

  // Validate: must be a Monday (1) or Friday (5)
  const d = new Date(date + 'T00:00:00')
  const dayOfWeek = d.getDay()
  if (dayOfWeek !== 1 && dayOfWeek !== 5) {
    return NextResponse.json({ error: 'Shows can only be booked on Mondays and Fridays' }, { status: 400 })
  }

  // Validate: must be in the future
  const today = new Date().toISOString().split('T')[0]
  if (date < today) {
    return NextResponse.json({ error: 'Cannot book a date in the past' }, { status: 400 })
  }

  const ghPat = process.env.GH_PAT
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  if (!ghPat || !owner || !repo) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  // Fetch current shows from GitHub (live data, not build-time cache)
  const file = await getFileContent<StoredShow[]>(ghPat, owner, repo, SHOWS_PATH)
  const currentShows: StoredShow[] = file?.data ?? []
  const currentSha = file?.sha

  // Check for conflicts
  const conflict = currentShows.find(s => s.date === date && s.status === 'published')
  if (conflict) {
    return NextResponse.json({ error: 'That date is already booked' }, { status: 409 })
  }

  // Create the new show
  const newShow: StoredShow = {
    id: `show-${date.replace(/-/g, '')}`,
    artistId: artist.id,
    artistName: artist.name,
    date,
    startTime: '8pm',
    genre: artist.genre,
    description: artist.description,
    ticketLink: artist.website || '',
    coverCharge: artist.defaultCoverCharge || 'Free',
    featured: false,
    status: 'published',
  }

  const updatedShows = [...currentShows, newShow].sort((a, b) =>
    a.date.localeCompare(b.date)
  )

  try {
    const content = JSON.stringify(updatedShows, null, 2) + '\n'
    await commitFile(ghPat, owner, repo, SHOWS_PATH, content, currentSha,
      `book show ${date} — ${artist.name} (musician portal)`)
  } catch (err) {
    console.error('musicians/book: commit failed', err)
    return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, show: newShow })
}
