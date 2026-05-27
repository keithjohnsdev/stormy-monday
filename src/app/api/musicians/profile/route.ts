import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'
import type { Artist } from '@/types'

const ARTISTS_PATH = 'context/clients/stormy-monday/projects/website/src/data/artists.json'

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

export async function PUT(req: NextRequest) {
  // Verify session
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  const artistId = verifySessionToken(token)
  if (!artistId) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const { name, genre, description, website } = body as Partial<Artist>

  const ghPat = process.env.GH_PAT
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  if (!ghPat || !owner || !repo) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  // Fetch latest artists from GitHub
  const file = await getFileContent<Artist[]>(ghPat, owner, repo, ARTISTS_PATH)
  if (!file) return NextResponse.json({ error: 'Could not fetch artist data' }, { status: 500 })

  const { data: currentArtists, sha } = file
  const artistIndex = currentArtists.findIndex(a => a.id === artistId)
  if (artistIndex === -1) return NextResponse.json({ error: 'Artist not found' }, { status: 404 })

  // Only update the allowed fields — never touch email or password
  const updatedArtists = currentArtists.map(a => {
    if (a.id !== artistId) return a
    return {
      ...a,
      name:        (name        ?? a.name).trim(),
      genre:       (genre       ?? a.genre).trim(),
      description: (description ?? a.description).trim(),
      website:     (website     ?? a.website).trim(),
    }
  })

  try {
    const content = JSON.stringify(updatedArtists, null, 2) + '\n'
    await commitFile(ghPat, owner, repo, ARTISTS_PATH, content, sha,
      `update artist profile — ${updatedArtists[artistIndex].name} (musician portal)`)
  } catch (err) {
    console.error('musicians/profile: commit failed', err)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }

  const { password: _pw, ...safeArtist } = updatedArtists[artistIndex]
  return NextResponse.json({ ok: true, artist: safeArtist })
}
