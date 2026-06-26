import { NextRequest, NextResponse } from 'next/server'

// Hero slideshow photos live in public/images/hero/ and are read at build time
// by src/lib/heroImages.ts (sorted by filename). This route lets the admin
// panel add/remove those files via the GitHub Contents API, which triggers a
// Vercel redeploy. The slideshow shows every supported image in the folder.

const HERO_DIR = 'public/images/hero'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXT   = new Set(['jpg', 'jpeg', 'png', 'webp'])

interface GhContentItem {
  name: string
  path: string
  sha: string
  type: string
  download_url: string | null
}

function ghHeaders(token: string) {
  return {
    Authorization:         `Bearer ${token}`,
    Accept:                'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function authFail(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false // no gate configured
  return req.headers.get('X-Admin-Password') !== adminPassword
}

function env() {
  const { GH_PAT, GITHUB_OWNER, GITHUB_REPO } = process.env
  if (!GH_PAT || !GITHUB_OWNER || !GITHUB_REPO) return null
  return { token: GH_PAT, owner: GITHUB_OWNER, repo: GITHUB_REPO }
}

async function getFileSha(token: string, owner: string, repo: string, path: string): Promise<string | undefined> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: ghHeaders(token),
  })
  if (!res.ok) return undefined
  return ((await res.json()) as { sha: string }).sha
}

// ─── GET — list current hero photos ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (authFail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const e = env()
  if (!e) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

  const res = await fetch(
    `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${HERO_DIR}`,
    { headers: ghHeaders(e.token), cache: 'no-store' }
  )

  // Folder may not exist (e.g. all photos removed) — treat as empty
  if (res.status === 404) return NextResponse.json({ photos: [] })
  if (!res.ok) return NextResponse.json({ error: 'Failed to list photos' }, { status: 502 })

  const items = (await res.json()) as GhContentItem[]
  const photos = (Array.isArray(items) ? items : [])
    .filter(i => i.type === 'file' && ALLOWED_EXT.has(i.name.split('.').pop()?.toLowerCase() ?? ''))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(i => ({ name: i.name, sha: i.sha, downloadUrl: i.download_url }))

  return NextResponse.json({ photos })
}

// ─── POST — upload a new hero photo ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (authFail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const e = env()
  if (!e) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, or WebP.' }, { status: 400 })
  }

  const ext  = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const safeExt = ALLOWED_EXT.has(ext) ? ext : 'jpg'
  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'photo'
  // Timestamp prefix keeps names unique and sorts newest uploads last in the slideshow
  const filename = `${Date.now()}-${base}.${safeExt}`
  const repoPath = `${HERO_DIR}/${filename}`

  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')

  const putRes = await fetch(
    `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${repoPath}`,
    {
      method: 'PUT',
      headers: { ...ghHeaders(e.token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `admin: add hero photo ${filename}`, content: base64 }),
    }
  )

  if (!putRes.ok) {
    const detail = await putRes.json().catch(() => ({}))
    return NextResponse.json({ error: 'GitHub upload failed', detail }, { status: 502 })
  }

  const { content } = (await putRes.json()) as { content: GhContentItem }
  return NextResponse.json({
    photo: { name: content.name, sha: content.sha, downloadUrl: content.download_url },
  })
}

// ─── DELETE — remove a hero photo ───────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  if (authFail(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const e = env()
  if (!e) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name : ''
  // Guard against path traversal — basename only
  if (!name || !/^[A-Za-z0-9._-]+$/.test(name)) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 })
  }

  const repoPath = `${HERO_DIR}/${name}`
  const sha = typeof body?.sha === 'string' && body.sha
    ? body.sha
    : await getFileSha(e.token, e.owner, e.repo, repoPath)

  if (!sha) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

  const delRes = await fetch(
    `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${repoPath}`,
    {
      method: 'DELETE',
      headers: { ...ghHeaders(e.token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `admin: remove hero photo ${name}`, sha }),
    }
  )

  if (!delRes.ok) {
    const detail = await delRes.json().catch(() => ({}))
    return NextResponse.json({ error: 'GitHub delete failed', detail }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
