import { NextRequest, NextResponse } from 'next/server'
import type { StoredShow } from '@/types'

const SHOWS_PATH  = 'src/data/shows.json'
const CONFIG_PATH = 'src/data/booking-config.json'

// ─── GitHub Git Trees API helpers ─────────────────────────────────────────────

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

async function ghGet<T>(token: string, url: string): Promise<T> {
  const res = await fetch(url, { headers: ghHeaders(token), cache: 'no-store' })
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

async function ghPost<T>(token: string, url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: ghHeaders(token), body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`POST ${url} → ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

async function ghPatch<T>(token: string, url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: 'PATCH', headers: ghHeaders(token), body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`PATCH ${url} → ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

async function commitFiles(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  files: Array<{ path: string; content: string }>,
  message: string,
): Promise<void> {
  const base = `https://api.github.com/repos/${owner}/${repo}`

  // 1. Current HEAD commit
  const ref = await ghGet<{ object: { sha: string } }>(token, `${base}/git/refs/heads/${branch}`)
  const headSha = ref.object.sha

  // 2. Tree SHA from that commit
  const commit = await ghGet<{ tree: { sha: string } }>(token, `${base}/git/commits/${headSha}`)
  const baseSha = commit.tree.sha

  // 3. New tree with all changed files
  const tree = await ghPost<{ sha: string }>(token, `${base}/git/trees`, {
    base_tree: baseSha,
    tree: files.map(f => ({ path: f.path, mode: '100644', type: 'blob', content: f.content })),
  })

  // 4. New commit
  const newCommit = await ghPost<{ sha: string }>(token, `${base}/git/commits`, {
    message,
    tree: tree.sha,
    parents: [headSha],
  })

  // 5. Advance branch ref
  await ghPatch(token, `${base}/git/refs/heads/${branch}`, { sha: newCommit.sha })
}

// ─── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminPassword && req.headers.get('X-Admin-Password') !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null) as {
    shows?: StoredShow[] | null
    openMonths?: string[]
    approvedMonths?: string[]
  } | null

  if (!body || !Array.isArray(body.openMonths)) {
    return NextResponse.json({ error: 'openMonths array required' }, { status: 400 })
  }

  const openMonths: string[]     = body.openMonths
  const approvedMonths: string[] = Array.isArray(body.approvedMonths) ? body.approvedMonths : []
  const shows: StoredShow[] | null = body.shows ?? null

  const allMonths = [...openMonths, ...approvedMonths]
  if (!allMonths.every(m => typeof m === 'string' && /^\d{4}-\d{2}$/.test(m))) {
    return NextResponse.json({ error: 'All months must be YYYY-MM strings' }, { status: 400 })
  }

  const ghPat   = process.env.GH_PAT
  const owner   = process.env.GITHUB_OWNER
  const repo    = process.env.GITHUB_REPO
  const branch  = process.env.GITHUB_BRANCH ?? 'main'
  if (!ghPat || !owner || !repo) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const files: Array<{ path: string; content: string }> = [
    {
      path: CONFIG_PATH,
      content: JSON.stringify({ openMonths, approvedMonths }, null, 2) + '\n',
    },
  ]

  if (shows !== null) {
    files.push({
      path: SHOWS_PATH,
      content: JSON.stringify(shows, null, 2) + '\n',
    })
  }

  try {
    const fileWord = files.length > 1 ? 'shows + booking config' : 'booking config'
    await commitFiles(ghPat, owner, repo, branch, files, `update ${fileWord} via admin`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('save-admin: commit failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
