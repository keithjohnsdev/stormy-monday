import { NextRequest, NextResponse } from 'next/server'

const SHOWS_PATH = 'context/clients/stormy-monday/projects/website/src/data/shows.json'

async function getFileSha(token: string, owner: string, repo: string, path: string): Promise<string | undefined> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  })
  if (!res.ok) return undefined
  return ((await res.json()) as { sha: string }).sha
}

async function commitFile(token: string, owner: string, repo: string, path: string, fileContent: string, sha: string | undefined): Promise<void> {
  const body: Record<string, string> = {
    message: 'update shows via admin',
    content: Buffer.from(fileContent).toString('base64'),
  }
  if (sha) body.sha = sha
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`)
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminPassword) {
    if (req.headers.get('X-Admin-Password') !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const body = await req.json().catch(() => null)
  if (!body?.shows) return NextResponse.json({ error: 'No shows provided' }, { status: 400 })

  const ghPat = process.env.GH_PAT
  const owner = process.env.GITHUB_OWNER
  const repo  = process.env.GITHUB_REPO
  if (!ghPat || !owner || !repo) {
    const missing = [!ghPat && 'GH_PAT', !owner && 'GITHUB_OWNER', !repo && 'GITHUB_REPO'].filter(Boolean).join(', ')
    console.error('save-shows: missing env vars:', missing)
    return NextResponse.json({ error: `Server misconfigured — missing: ${missing}` }, { status: 500 })
  }

  try {
    const content = JSON.stringify(body.shows, null, 2) + '\n'
    const sha = await getFileSha(ghPat, owner, repo, SHOWS_PATH)
    await commitFile(ghPat, owner, repo, SHOWS_PATH, content, sha)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('save-shows: commit failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
