import { NextRequest, NextResponse } from 'next/server'

const CONFIG_PATH = 'src/data/booking-config.json'

async function getFileSha(token: string, owner: string, repo: string, path: string): Promise<string | undefined> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  })
  if (!res.ok) return undefined
  return ((await res.json()) as { sha: string }).sha
}

async function commitFile(token: string, owner: string, repo: string, path: string, fileContent: string, sha: string | undefined): Promise<void> {
  const body: Record<string, string> = {
    message: 'update booking config via admin',
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
  if (!body || !Array.isArray(body.openMonths)) {
    return NextResponse.json({ error: 'openMonths array required' }, { status: 400 })
  }

  // Validate: each entry must be a YYYY-MM string
  const valid = (body.openMonths as unknown[]).every(
    m => typeof m === 'string' && /^\d{4}-\d{2}$/.test(m)
  )
  if (!valid) {
    return NextResponse.json({ error: 'openMonths must be YYYY-MM strings' }, { status: 400 })
  }

  const ghPat = process.env.GH_PAT
  const owner = process.env.GITHUB_OWNER
  const repo  = process.env.GITHUB_REPO
  if (!ghPat || !owner || !repo) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const content = JSON.stringify({ openMonths: body.openMonths }, null, 2) + '\n'
    const sha = await getFileSha(ghPat, owner, repo, CONFIG_PATH)
    await commitFile(ghPat, owner, repo, CONFIG_PATH, content, sha)
  } catch (err) {
    console.error('save-booking-config: commit failed', err)
    return NextResponse.json({ error: 'Failed to commit' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
