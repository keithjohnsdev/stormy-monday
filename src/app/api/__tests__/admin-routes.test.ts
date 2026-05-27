/**
 * Integration tests for the Stormy Monday admin API routes.
 *
 * Strategy: import route handlers directly, mock global fetch so no real
 * GitHub or network calls are made, and control env vars per-test.
 *
 * Routes covered:
 *   POST /api/save-content  — auth check + content commit
 *   POST /api/save-shows    — auth + shows commit
 *   POST /api/save-artists  — auth + artists commit
 */

import { NextRequest } from 'next/server'

// ─── helpers ──────────────────────────────────────────────────────────────────

const BASE = 'http://localhost'

function jsonReq(url: string, body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`${BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

function withPassword(headers: Record<string, string> = {}): Record<string, string> {
  return { 'X-Admin-Password': 'test-password', ...headers }
}

/** Build a minimal GitHub fetch mock.
 *  GET  → returns { sha: 'abc123' }  (getFileSha)
 *  PUT  → returns 200 OK             (commitFile)
 */
function mockGitHubSuccess() {
  ;(global.fetch as jest.Mock).mockImplementation((url: string, opts: RequestInit) => {
    if (opts?.method === 'PUT') {
      return Promise.resolve(new Response(JSON.stringify({ content: {}, commit: {} }), { status: 200 }))
    }
    // GET — return sha
    return Promise.resolve(new Response(JSON.stringify({ sha: 'abc123' }), { status: 200 }))
  })
}

function mockGitHubFailure(status = 404, message = 'Not Found') {
  ;(global.fetch as jest.Mock).mockImplementation((url: string, opts: RequestInit) => {
    if (opts?.method === 'PUT') {
      return Promise.resolve(new Response(JSON.stringify({ message }), { status }))
    }
    return Promise.resolve(new Response(JSON.stringify({ sha: 'abc123' }), { status: 200 }))
  })
}

// ─── env setup ────────────────────────────────────────────────────────────────

const VALID_ENV = {
  ADMIN_PASSWORD: 'test-password',
  GH_PAT: 'ghp_fake_token',
  GITHUB_OWNER: 'keithjohnsdev',
  GITHUB_REPO: 'marshall-consulting',
}

function setEnv(overrides: Partial<typeof VALID_ENV> & Record<string, string | undefined> = {}) {
  const merged = { ...VALID_ENV, ...overrides }
  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
}

function clearEnv() {
  for (const k of Object.keys(VALID_ENV)) delete process.env[k]
}

// ─── mocks ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  global.fetch = jest.fn()
  clearEnv()
})

afterEach(() => {
  jest.resetAllMocks()
})

// ══════════════════════════════════════════════════════════════════════════════
// /api/save-content
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/save-content', () => {
  // Lazy-load so env is already set before the module runs
  async function handler() {
    const { POST } = await import('../save-content/route')
    return POST
  }

  const minimalData = {
    site: {
      name: 'Stormy Monday', tagline: 'When it rains, we pour.',
      address: '820 Alton Road', city: 'Miami Beach, FL 33139',
      phone: '(305) 555-0000', email: 'hello@stormymondaymia.com',
      eventsEmail: 'events@stormymondaymia.com', pressEmail: 'press@stormymondaymia.com',
      instagramHandle: '@stormymondaymia', instagramUrl: 'https://www.instagram.com/stormymondaymia/',
      openTableUrl: 'https://www.opentable.com/r/stormy-monday-bar-miami-beach',
      mapsUrl: 'https://maps.google.com/?q=820+Alton+Road+Miami+Beach+FL',
    },
    home: {
      hero: { eyebrow: '820 Alton Road', headline: 'Stormy Monday', tagline: 'When it rains, we pour.', ctaPrimary: 'Reserve', ctaSecondary: 'Shows' },
      infoStrip: { hoursLabel: 'Hours', hours: 'Thu–Mon', locationLabel: 'Location', location: '820 Alton Rd', happyHourLabel: 'Happy Hour', happyHour: '5–7pm', cta: 'Reserve' },
      upcomingShows: { eyebrow: 'Live Music', heading: 'Upcoming Shows', scheduleLink: '→', emptyMessage: 'Check back soon.', followCta: 'Follow' },
      pressStrip: { eyebrow: 'As Seen In', coverage: [] },
    },
    about: {
      story: { eyebrow: 'Our Story', heading: 'The Bar', paragraphs: ['Para 1.'], pullQuote: '"Quote."' },
      philosophy: [],
      team: { eyebrow: 'The Team', heading: 'Who We Are', members: [] },
    },
    menu: {
      eyebrow: '820 Alton Road', heading: 'Menu', subheading: 'Serious.', disclaimer: 'Subject to change.',
      happyHour: { label: 'Happy Hour', description: 'Daily 5–7pm' },
      cocktails: [], food: [],
    },
    music: {
      eyebrow: 'Live Music', heading: 'Upcoming Shows', subheading: 'Live every Monday.',
      regularProgramming: { eyebrow: 'Regular Programming', nights: [], tagline: 'Music is who we are.' },
    },
    contact: {
      eyebrow: 'Find Us', heading: 'Contact', directionsLabel: 'Get Directions →',
      parking: 'Street parking.', socials: [], hours: [],
    },
    press: { eyebrow: 'Media', heading: 'Press', inquiriesLabel: 'Press inquiries', coverage: [] },
    privateEvents: {
      eyebrow: 'Host With Us', heading: 'Private Events', subheading: 'An intimate space.',
      stats: [], paragraphs: [],
      form: { heading: 'Get in Touch', directLabel: 'Or email us directly at' },
    },
    gallery: { eyebrow: 'The Room', heading: 'Gallery', subheading: 'Photos.', photoCredit: 'Cleveland Jennings', followLabel: 'Follow us' },
    footer: { hoursLine1: 'Thursday–Monday', hoursLine2: '5pm – 1am', navigateLabel: 'Navigate', followLabel: 'Follow' },
  }

  test('returns 401 when password is wrong', async () => {
    setEnv()
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-content', { data: minimalData }, { 'X-Admin-Password': 'wrong' }))
    expect(res.status).toBe(401)
  })

  test('returns 200 on checkAuth with correct password', async () => {
    setEnv()
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-content', { checkAuth: true }, withPassword()))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  test('returns 400 when no data provided', async () => {
    setEnv()
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-content', {}, withPassword()))
    expect(res.status).toBe(400)
  })

  test('returns 500 when GitHub env vars are missing', async () => {
    setEnv({ GH_PAT: undefined, GITHUB_OWNER: undefined, GITHUB_REPO: undefined })
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-content', { data: minimalData }, withPassword()))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toMatch(/misconfigured/i)
  })

  test('returns 200 and commits to GitHub on success', async () => {
    setEnv()
    mockGitHubSuccess()
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-content', { data: minimalData }, withPassword()))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    // Verify GitHub PUT was called
    const calls = (global.fetch as jest.Mock).mock.calls
    const putCall = calls.find((c: unknown[]) => (c[1] as RequestInit)?.method === 'PUT')
    expect(putCall).toBeDefined()
    expect(putCall[0]).toContain('github.com/repos/keithjohnsdev/marshall-consulting')
  })

  test('returns 500 when GitHub commit fails', async () => {
    setEnv()
    mockGitHubFailure(422, 'SHA mismatch')
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-content', { data: minimalData }, withPassword()))
    expect(res.status).toBe(500)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// /api/save-shows
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/save-shows', () => {
  async function handler() {
    const { POST } = await import('../save-shows/route')
    return POST
  }

  const sampleShows = [
    { id: 'show-1', artistId: 'a1', artistName: 'Blue Room Quartet', date: '2026-06-02', startTime: '8pm', genre: 'Jazz', description: '', ticketLink: '', coverCharge: '', featured: true, status: 'published' },
  ]

  test('returns 401 when password is wrong', async () => {
    setEnv()
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-shows', { shows: sampleShows }, { 'X-Admin-Password': 'wrong' }))
    expect(res.status).toBe(401)
  })

  test('returns 400 when shows field is missing', async () => {
    setEnv()
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-shows', {}, withPassword()))
    expect(res.status).toBe(400)
  })

  test('returns 500 and names the missing env vars', async () => {
    setEnv({ GH_PAT: undefined, GITHUB_OWNER: undefined })
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-shows', { shows: sampleShows }, withPassword()))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('GH_PAT')
    expect(body.error).toContain('GITHUB_OWNER')
    expect(body.error).not.toContain('GITHUB_REPO') // GITHUB_REPO is set
  })

  test('returns 200 and commits to GitHub on success', async () => {
    setEnv()
    mockGitHubSuccess()
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-shows', { shows: sampleShows }, withPassword()))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  test('returns 500 with GitHub error detail when commit fails', async () => {
    setEnv()
    mockGitHubFailure(404, 'Not Found')
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-shows', { shows: sampleShows }, withPassword()))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('404')
  })

  test('accepts empty shows array (clears schedule)', async () => {
    setEnv()
    mockGitHubSuccess()
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-shows', { shows: [] }, withPassword()))
    expect(res.status).toBe(200)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// /api/save-artists
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/save-artists', () => {
  async function handler() {
    const { POST } = await import('../save-artists/route')
    return POST
  }

  const sampleArtists = [
    { id: 'a1', name: 'Blue Room Quartet', genre: 'Jazz', description: 'A jazz quartet.', website: '', defaultCoverCharge: '' },
  ]

  test('returns 401 when password is wrong', async () => {
    setEnv()
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-artists', { artists: sampleArtists }, { 'X-Admin-Password': 'wrong' }))
    expect(res.status).toBe(401)
  })

  test('returns 400 when artists field is missing', async () => {
    setEnv()
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-artists', {}, withPassword()))
    expect(res.status).toBe(400)
  })

  test('returns 500 when GitHub env vars are missing', async () => {
    setEnv({ GH_PAT: undefined })
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-artists', { artists: sampleArtists }, withPassword()))
    expect(res.status).toBe(500)
  })

  test('returns 200 and commits to GitHub on success', async () => {
    setEnv()
    mockGitHubSuccess()
    const POST = await handler()
    const res = await POST(jsonReq('/api/save-artists', { artists: sampleArtists }, withPassword()))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    // Verify the correct file path was targeted
    const calls = (global.fetch as jest.Mock).mock.calls
    const putCall = calls.find((c: unknown[]) => (c[1] as RequestInit)?.method === 'PUT')
    expect(putCall[0]).toContain('artists.json')
  })

  test('allows no-password mode when ADMIN_PASSWORD is unset', async () => {
    setEnv({ ADMIN_PASSWORD: undefined })
    mockGitHubSuccess()
    const POST = await handler()
    // No X-Admin-Password header at all — should still go through
    const res = await POST(jsonReq('/api/save-artists', { artists: sampleArtists }))
    expect(res.status).toBe(200)
  })
})

