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

Palette follows the 2025 Brand Guidelines (Apartment 302 Creative). The page background is a warm near-black; sections and cards use a deep green ramp (toned toward Miami Green). Dade Gold is the primary accent and the named brand colors live as accents. Values are defined as RGB channels in `src/app/globals.css` and exposed via `tailwind.config.ts`.

| Token | Hex | Usage |
|-------|-----|-------|
| `storm-black` | `#14100e` | Page background (warm near-black) |
| `storm-dark` | `#141e16` | Section backgrounds (deep green) |
| `storm-card` | `#141e16` | Card backgrounds (matches section bg) |
| `storm-border` | `#263c2c` | Borders, dividers |
| `storm-gold` | `#97793f` | Dade Gold — primary accent, CTAs |
| `storm-gold-light` | `#bd9a5a` | Dade Gold tint — hover state |
| `storm-cream` | `#f2ede4` | Primary text (warm cream) |
| `storm-muted` | `#a08f7d` | Secondary text |

### Brand accent colors

| Token | Hex | Name |
|-------|-----|------|
| `storm-brown` | `#5e4943` | After Dark |
| `storm-green` | `#193326` | Miami Green |
| `storm-orange` | `#8f381e` | Sunburnt Orange |
| `storm-blue` | `#08242e` | Stormy Blue |

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

Tabs:
- **Content** — all site text (same fields as `src/content/index.ts`)
- **Artists** — artist roster stored in `src/data/artists.json`
- **Shows** — show schedule stored in `src/data/shows.json`
- **Calendar** — booking calendar / open months (`src/data/booking-config.json` + `events.json`)
- **Hero Photos** — landing-page hero slideshow images. Adds/removes image files in `public/images/hero/` via the GitHub Contents API (`/api/hero-photos`, GET/POST/DELETE). The slideshow shows every image in that folder, sorted by filename (`src/lib/heroImages.ts`).

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

This is a standalone repo. Brand context, research, and project briefs were previously in the Marshall Consulting monorepo — any relevant material should be ported here as needed.
