import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createInviteToken } from '@/lib/invite'

// Admin-only: mints a signed invite token for a musician's email and emails them
// the self-signup link via Resend. The admin panel also shows the link as a
// copy-able fallback (and uses it directly if email sending isn't configured).
//
// Env (all optional except for actually sending):
//   RESEND_API_KEY   — enables email sending; without it we just return the link
//   INVITE_FROM      — "From" address (default: Resend test sender)
//   INVITE_REPLY_TO  — replies go here (e.g. James' email)
//   SITE_URL         — base URL for the link (else derived from the request)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_FROM = 'Stormy Monday <onboarding@resend.dev>'

function inviteEmailHtml(link: string): string {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #97793f; margin: 0 0 4px;">Stormy Monday</p>
      <h1 style="font-size: 22px; margin: 0 0 16px;">You're invited to join the roster</h1>
      <p style="font-size: 15px; line-height: 1.6;">
        We'd love to feature you at Stormy Monday. Click below to fill out your
        artist profile — it takes a couple of minutes.
      </p>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background: #97793f; color: #14100e; text-decoration: none; font-weight: 600; padding: 12px 22px; border-radius: 4px; display: inline-block;">
          Fill out your profile
        </a>
      </p>
      <p style="font-size: 13px; color: #666; line-height: 1.6;">
        Or paste this link into your browser:<br>
        <a href="${link}" style="color: #97793f; word-break: break-all;">${link}</a>
      </p>
      <p style="font-size: 12px; color: #999; margin-top: 24px;">This link expires in 7 days.</p>
    </div>
  `
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminPassword && req.headers.get('X-Admin-Password') !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  }

  const token = createInviteToken(email)
  const base = (process.env.SITE_URL || req.nextUrl.origin).replace(/\/$/, '')
  const link = `${base}/artist-signup?token=${encodeURIComponent(token)}`

  // No email service configured — return the link for the copy-link fallback.
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ token, email, link, sent: false })
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: process.env.INVITE_FROM || DEFAULT_FROM,
      to: email,
      subject: "You're invited to play Stormy Monday",
      html: inviteEmailHtml(link),
      ...(process.env.INVITE_REPLY_TO ? { replyTo: process.env.INVITE_REPLY_TO } : {}),
    })
    if (error) {
      console.error('artist-invite: resend error', error)
      // Still hand back the link so James can send it manually.
      return NextResponse.json({ token, email, link, sent: false, error: error.message })
    }
  } catch (err) {
    console.error('artist-invite: send failed', err)
    return NextResponse.json({ token, email, link, sent: false, error: 'Email failed to send' })
  }

  return NextResponse.json({ token, email, link, sent: true })
}
