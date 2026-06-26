import crypto from 'crypto'

// Stateless, signed artist-invite tokens. Same HMAC approach as src/lib/session.ts
// so no database is needed: the email + expiry are carried in the token itself and
// verified by signature. base64url keeps the token safe to drop into a URL.

const SECRET = process.env.SESSION_SECRET ?? 'sm-dev-secret-change-in-production'
const PURPOSE = 'artist-invite'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function hmac(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

/** Returns a signed, URL-safe invite token carrying the musician's email. */
export function createInviteToken(email: string): string {
  const expiry = Date.now() + MAX_AGE_MS
  const payload = `${PURPOSE}|${email}|${expiry}`
  const signed = `${payload}|${hmac(payload)}`
  return Buffer.from(signed).toString('base64url')
}

/** Returns the email if the token is valid and not expired, else null. */
export function verifyInviteToken(token: string): string | null {
  let decoded: string
  try {
    decoded = Buffer.from(token, 'base64url').toString('utf-8')
  } catch {
    return null
  }

  const parts = decoded.split('|')
  if (parts.length !== 4) return null
  const [purpose, email, expiryStr, sig] = parts
  if (purpose !== PURPOSE) return null

  const payload = `${purpose}|${email}|${expiryStr}`
  if (hmac(payload) !== sig) return null

  const expiry = parseInt(expiryStr, 10)
  if (isNaN(expiry) || Date.now() > expiry) return null

  return email
}
