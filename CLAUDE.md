# Stormy Monday — Website

## What This Is

Next.js 16 website for Stormy Monday, a cocktail bar and music venue at 820 Alton Road, Miami Beach. Owner: James MacInnes.

## Stack

- **Framework**: Next.js 16, App Router, TypeScript
- **Styling**: Tailwind CSS with custom `storm-*` color tokens (see `tailwind.config.ts`)
- **Music Schedule**: Reads from `src/data/shows.json` at build time (`src/lib/shows.ts`). Managed via the admin panel.
- **Admin Panel**: Password-protected at `/admin` — James manages show schedule and artist roster from here; changes commit to GitHub and trigger a Vercel redeploy.
- **Reservations**: OpenTable embed (restaurant is already listed)
- **Fonts**: Playfair Display (headings) + Inter (body) via `next/font/google`
- **Deployment target**: Vercel

## Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `storm-black` | `#0d0b09` | Page background |
| `storm-dark` | `#1a1612` | Section backgrounds |
| `storm-card` | `#211d18` | Card backgrounds |
| `storm-gold` | `#c49a4a` | Primary accent, CTAs |
| `storm-cream` | `#f0ebe3` | Primary text |
| `storm-muted` | `#7a7068` | Secondary text |
| `storm-border` | `#2e2820` | Borders, dividers |

## Pages

| Route | File | Notes |
|-------|------|-------|
| `/` | `src/app/page.tsx` | Home — hero, press strip, upcoming shows teaser |
| `/about` | `src/app/about/page.tsx` | Story + team bios |
| `/menu` | `src/app/menu/page.tsx` | Cocktails + food, client-side tab toggle |
| `/music` | `src/app/music/page.tsx` | Full show schedule |
| `/reservations` | `src/app/reservations/page.tsx` | OpenTable embed |
| `/private-events` | `src/app/private-events/page.tsx` | Buyout info + inquiry form |
| `/gallery` | `src/app/gallery/page.tsx` | Photo grid |
| `/press` | `src/app/press/page.tsx` | Coverage + quotes |
| `/contact` | `src/app/contact/page.tsx` | Hours, map, address |
| `/admin` | `src/app/admin/page.tsx` | Password-protected content + show editor |

## Admin Panel

James uses `/admin` to update site content, manage the artist roster, and schedule shows. The panel is password-protected (`ADMIN_PASSWORD` env var). On save, it commits changes directly to GitHub via the API, which triggers a Vercel redeploy (~30 seconds to go live).

Three tabs:
- **Content** — all site text (same fields as `src/content/index.ts`)
- **Artists** — artist roster stored in `src/data/artists.json`
- **Shows** — show schedule stored in `src/data/shows.json`

## Music Schedule

Shows are read at build time from `src/data/shows.json` via `src/lib/shows.ts`. The admin panel writes to that file via the GitHub API, triggering a Vercel redeploy.

## Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

| Variable | Purpose |
|----------|---------|
| `GH_PAT` | GitHub PAT (`repo` scope) — admin panel commits file changes via GitHub API |
| `GITHUB_OWNER` | GitHub username/org that owns the repo |
| `GITHUB_REPO` | Repository name |
| `ADMIN_PASSWORD` | Password gate for `/admin` |

## What Needs Real Content (TODOs)

- Gallery photos — request from James (`src/app/gallery/page.tsx`)
- OpenTable widget embed code — `src/app/reservations/page.tsx`
- Domain + email addresses — currently `stormymondaymia.com` placeholder
- Phone number — confirm with James (`src/content/index.ts`)
- Pricing on menu — confirm with James

## Dev Commands

```bash
npm install
cp .env.local.example .env.local   # fill in required vars
npm run dev                         # http://localhost:3000
npm run build                       # production build
```

## Client Context

Full brand context, research, and project brief in the Marshall Consulting repo:
`context/clients/stormy-monday/`
