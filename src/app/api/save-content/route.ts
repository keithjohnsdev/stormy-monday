import { NextRequest, NextResponse } from 'next/server'
import { content } from '@/content'

type ContentData = typeof content

// Path inside the repo that Vercel and GitHub Actions both track
const INDEX_TS_PATH = 'context/clients/stormy-monday/projects/website/src/content/index.ts'

// ─── TypeScript file generator ────────────────────────────────────────────────

function q(str: string): string {
  return `'${(str ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function generateIndexTs(d: ContentData): string {
  const hoursLines = d.contact.hours.map(h => {
    const live = h.liveMusic ? `, liveMusic: ${q(h.liveMusic)}` : ''
    return `      { day: ${q(h.day)}, time: ${q(h.time)}${live} },`
  }).join('\n')

  const socialsLines = d.contact.socials.map(soc =>
    `      { label: ${q(soc.label)}, handle: ${q(soc.handle)}, href: ${q(soc.href)} },`
  ).join('\n')

  const homePressLines = d.home.pressStrip.coverage.map(p =>
    `        { outlet: ${q(p.outlet)}, quote: ${q(p.quote)}, detail: ${q(p.detail)}, url: ${q(p.url)} },`
  ).join('\n')

  const philosophyLines = d.about.philosophy.map(p =>
    `      {\n        heading: ${q(p.heading)},\n        body:    ${q(p.body)},\n      },`
  ).join('\n')

  const teamLines = d.about.team.members.map(m =>
    `        {\n          name: ${q(m.name)},\n          role: ${q(m.role)},\n          bio:  ${q(m.bio)},\n        },`
  ).join('\n')

  const storyParaLines = d.about.story.paragraphs.map(p => `        ${q(p)},`).join('\n')

  const cocktailLines = d.menu.cocktails.map(c =>
    `      { name: ${q(c.name)}, desc: ${q(c.desc)}, note: ${q(c.note)} },`
  ).join('\n')

  const foodLines = d.menu.food.map(f =>
    `      { name: ${q(f.name)}, desc: ${q(f.desc)} },`
  ).join('\n')

  const nightLines = d.music.regularProgramming.nights.map(n =>
    `        { day: ${q(n.day)}, detail: ${q(n.detail)} },`
  ).join('\n')

  const pressCoverageLines = d.press.coverage.map(p =>
    `      {\n        outlet: ${q(p.outlet)},\n        score:  ${q(p.score)},\n        quote:  ${q(p.quote)},\n        url:    ${q(p.url)},\n        date:   ${q(p.date)},\n      },`
  ).join('\n')

  const statsLines = d.privateEvents.stats.map(stat =>
    `      { label: ${q(stat.label)}, value: ${q(stat.value)} },`
  ).join('\n')

  const eventParaLines = d.privateEvents.paragraphs.map(p => `      ${q(p)},`).join('\n')

  const gigDetailsBlock = `  gigDetails: {
    heading:         ${q(d.gigDetails.heading)},
    subheading:      ${q(d.gigDetails.subheading)},
    performanceTime: ${q(d.gigDetails.performanceTime)},
    mondayRate:      ${q(d.gigDetails.mondayRate)},
    fridayRate:      ${q(d.gigDetails.fridayRate)},
    parkingInfo:     ${q(d.gigDetails.parkingInfo)},
    perksInfo:       ${q(d.gigDetails.perksInfo)},
    equipmentInfo:   ${q(d.gigDetails.equipmentInfo)},
    additionalNotes: ${q(d.gigDetails.additionalNotes)},
  },`

  return `// Auto-generated — do not edit directly.
// Last updated via content editor: ${new Date().toISOString()}

export const content = {

  site: {
    name:            'Stormy Monday',
    tagline:         ${q(d.site.tagline)},
    address:         '820 Alton Road',
    city:            'Miami Beach, FL 33139',
    phone:           ${q(d.site.phone)},
    email:           ${q(d.site.email)},
    eventsEmail:     ${q(d.site.eventsEmail)},
    pressEmail:      ${q(d.site.pressEmail)},
    instagramHandle: ${q(d.site.instagramHandle)},
    instagramUrl:    ${q(d.site.instagramUrl)},
    openTableUrl:    ${q(d.site.openTableUrl)},
    mapsUrl:         ${q(d.site.mapsUrl)},
  },

  home: {
    hero: {
      eyebrow:      ${q(d.home.hero.eyebrow)},
      headline:     ${q(d.home.hero.headline)},
      tagline:      ${q(d.home.hero.tagline)},
      ctaPrimary:   ${q(d.home.hero.ctaPrimary)},
      ctaSecondary: ${q(d.home.hero.ctaSecondary)},
    },
    infoStrip: {
      hoursLabel:     'Hours',
      hours:          ${q(d.home.infoStrip.hours)},
      locationLabel:  'Location',
      location:       ${q(d.home.infoStrip.location)},
      happyHourLabel: 'Happy Hour',
      happyHour:      ${q(d.home.infoStrip.happyHour)},
      cta:            ${q(d.home.infoStrip.cta)},
    },
    upcomingShows: {
      eyebrow:      'Live Music',
      heading:      'Upcoming Shows',
      scheduleLink: 'Full Schedule →',
      emptyMessage: ${q(d.home.upcomingShows.emptyMessage)},
      followCta:    ${q(d.home.upcomingShows.followCta)},
    },
    pressStrip: {
      eyebrow: 'As Seen In',
      coverage: [
${homePressLines}
      ],
    },
  },

  about: {
    story: {
      eyebrow:   'Our Story',
      heading:   ${q(d.about.story.heading)},
      paragraphs: [
${storyParaLines}
      ],
      pullQuote: ${q(d.about.story.pullQuote)},
    },
    philosophy: [
${philosophyLines}
    ],
    team: {
      eyebrow: 'The Team',
      heading: 'Who We Are',
      members: [
${teamLines}
      ],
    },
  },

  menu: {
    eyebrow:    '820 Alton Road',
    heading:    'Menu',
    subheading: ${q(d.menu.subheading)},
    happyHour: {
      label:       'Happy Hour',
      description: ${q(d.menu.happyHour.description)},
    },
    disclaimer: ${q(d.menu.disclaimer)},
    cocktails: [
${cocktailLines}
    ],
    food: [
${foodLines}
    ],
  },

  music: {
    eyebrow:    'Live Music',
    heading:    'Upcoming Shows',
    subheading: ${q(d.music.subheading)},
    regularProgramming: {
      eyebrow: 'Regular Programming',
      nights: [
${nightLines}
      ],
      tagline: ${q(d.music.regularProgramming.tagline)},
    },
  },

  contact: {
    eyebrow:         'Find Us',
    heading:         'Contact & Location',
    directionsLabel: 'Get Directions →',
    parking:         ${q(d.contact.parking)},
    socials: [
${socialsLines}
    ],
    hours: [
${hoursLines}
    ],
  },

  press: {
    eyebrow: 'Media',
    heading: 'Press',
    inquiriesLabel: 'Press inquiries',
    coverage: [
${pressCoverageLines}
    ],
  },

  privateEvents: {
    eyebrow:    'Host With Us',
    heading:    'Private Events',
    subheading: ${q(d.privateEvents.subheading)},
    stats: [
${statsLines}
    ],
    paragraphs: [
${eventParaLines}
    ],
    form: {
      heading:     ${q(d.privateEvents.form.heading)},
      directLabel: 'Or email us directly at',
    },
  },

  gallery: {
    eyebrow:     'The Room',
    heading:     'Gallery',
    subheading:  ${q(d.gallery.subheading)},
    photoCredit: ${q(d.gallery.photoCredit)},
    followLabel: ${q(d.gallery.followLabel)},
  },

  footer: {
    hoursLine1:    ${q(d.footer.hoursLine1)},
    hoursLine2:    ${q(d.footer.hoursLine2)},
    navigateLabel: 'Navigate',
    followLabel:   'Follow',
  },

${gigDetailsBlock}

}
`
}

// ─── GitHub helpers ───────────────────────────────────────────────────────────

async function getFileSha(token: string, owner: string, repo: string, path: string): Promise<string | undefined> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  })
  if (!res.ok) return undefined
  return ((await res.json()) as { sha: string }).sha
}

async function commitFile(token: string, owner: string, repo: string, path: string, fileContent: string, sha: string | undefined): Promise<void> {
  const body: Record<string, string> = {
    message: 'content update via admin editor',
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

// ─── route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminPassword) {
    const provided = req.headers.get('X-Admin-Password')
    if (provided !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: { data?: ContentData; checkAuth?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Auth-check-only request from the lock screen — password already validated above
  if (body.checkAuth) return NextResponse.json({ ok: true })

  if (!body.data) {
    return NextResponse.json({ error: 'No data provided' }, { status: 400 })
  }

  const ghPat = process.env.GH_PAT
  const owner = process.env.GITHUB_OWNER
  const repo  = process.env.GITHUB_REPO
  if (!ghPat || !owner || !repo) {
    console.error('save-content: missing GH_PAT / GITHUB_OWNER / GITHUB_REPO')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  try {
    const tsContent = generateIndexTs(body.data)
    const sha = await getFileSha(ghPat, owner, repo, INDEX_TS_PATH)
    await commitFile(ghPat, owner, repo, INDEX_TS_PATH, tsContent, sha)
  } catch (err) {
    console.error('save-content: commit failed', err)
    return NextResponse.json({ error: 'Failed to commit' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
