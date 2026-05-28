import { NextRequest, NextResponse } from 'next/server'

const CONFIG_PATH = 'src/data/booking-config.json'

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
  const json = await res.json() as { content: string; sha: string }
  return {
    data: JSON.parse(Buffer.from(json.content, 'base64').toString('utf-8')) as T,
    sha: json.sha,
  }
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
  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminPassword && req.headers.get('X-Admin-Password') !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body || !Array.isArray(body.openMonths)) {
    return NextResponse.json({ error: 'openMonths array required' }, { status: 400 })
  }

  const openMonths: string[]     = body.openMonths
  const approvedMonths: string[] = Array.isArray(body.approvedMonths) ? body.approvedMonths : []

  // Validate: every entry must be a YYYY-MM string
  const allMonths = [...openMonths, ...approvedMonths]
  const valid = allMonths.every(m => typeof m === 'string' && /^\d{4}-\d{2}$/.test(m))
  if (!valid) {
    return NextResponse.json({ error: 'All months must be YYYY-MM strings' }, { status: 400 })
  }

  const ghPat = process.env.GH_PAT
  const owner = process.env.GITHUB_OWNER
  const repo  = process.env.GITHUB_REPO
  if (!ghPat || !owner || !repo) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const configFile = await getFileContent<object>(ghPat, owner, repo, CONFIG_PATH)
    const configContent = JSON.stringify({ openMonths, approvedMonths }, null, 2) + '\n'
    await commitFile(ghPat, owner, repo, CONFIG_PATH, configContent, configFile?.sha,
      'update booking config via admin')
  } catch (err) {
    console.error('save-booking-config: commit failed', err)
    return NextResponse.json({ error: 'Failed to commit' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
