import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/session'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  const artistId = verifySessionToken(token)
  if (!artistId) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file   = formData.get('file')   as File   | null
  const folder = (formData.get('folder') as string | null) ?? 'artists'

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Use JPG, PNG, WebP, or GIF.' },
      { status: 400 }
    )
  }

  const { GH_PAT, GITHUB_OWNER, GITHUB_REPO } = process.env
  if (!GH_PAT || !GITHUB_OWNER || !GITHUB_REPO) {
    return NextResponse.json({ error: 'GitHub env vars not configured' }, { status: 500 })
  }

  const bytes    = await file.arrayBuffer()
  const base64   = Buffer.from(bytes).toString('base64')
  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${Date.now()}.${ext}`
  const repoPath = `public/images/${folder}/${filename}`
  const publicUrl = `/images/${folder}/${filename}`

  let sha: string | undefined
  const getRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${repoPath}`,
    { headers: { Authorization: `Bearer ${GH_PAT}`, Accept: 'application/vnd.github.v3+json' } }
  )
  if (getRes.ok) {
    const existing = await getRes.json() as { sha: string }
    sha = existing.sha
  }

  const putRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${repoPath}`,
    {
      method: 'PUT',
      headers: {
        Authorization:  `Bearer ${GH_PAT}`,
        Accept:         'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `upload: ${folder}/${filename} (musician portal — ${artistId})`,
        content: base64,
        ...(sha ? { sha } : {}),
      }),
    }
  )

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}))
    return NextResponse.json({ error: 'GitHub upload failed', detail: err }, { status: 500 })
  }

  return NextResponse.json({ url: publicUrl })
}
