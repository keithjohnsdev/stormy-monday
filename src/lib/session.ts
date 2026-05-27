import crypto from 'crypto'

const SECRET = process.env.SESSION_SECRET ?? 'sm-dev-secret-change-in-production'

export const COOKIE_NAME = 'sm_musician_session'
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

function hmac(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

/** Returns a signed token: "artistId|expiry|hmac" */
export function createSessionToken(artistId: string): string {
  const expiry = Date.now() + COOKIE_MAX_AGE * 1000
  const payload = `${artistId}|${expiry}`
  return `${payload}|${hmac(payload)}`
}

/** Returns the artistId if the token is valid and not expired, else null. */
export function verifySessionToken(token: string): string | null {
  // Split off the HMAC (last segment)
  const lastPipe = token.lastIndexOf('|')
  if (lastPipe === -1) return null
  const payload = token.slice(0, lastPipe)
  const sig = token.slice(lastPipe + 1)
  if (hmac(payload) !== sig) return null

  // Split payload into artistId and expiry
  const firstPipe = payload.indexOf('|')
  if (firstPipe === -1) return null
  const artistId = payload.slice(0, firstPipe)
  const expiry = parseInt(payload.slice(firstPipe + 1), 10)
  if (isNaN(expiry) || Date.now() > expiry) return null

  return artistId
}
