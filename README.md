# Stormy Monday — Website

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Airtable · Vercel  
**Client:** James MacInnes · 820 Alton Road, Miami Beach  
**Dev contact:** Keith Johns · keithjohnsdev@gmail.com

---

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # then fill in values
npm run dev                         # → http://localhost:3000
```

---

## Project Structure

```
src/
├── content/index.ts     ← ALL site copy lives here — start here for text changes
├── lib/airtable.ts      ← Music schedule data fetching
├── types/index.ts       ← Shared TypeScript types
├── app/                 ← Pages (Next.js App Router)
│   ├── page.tsx         ← Home
│   ├── menu/
│   ├── music/           ← Reads from Airtable live
│   ├── about/
│   ├── reservations/
│   ├── private-events/
│   ├── gallery/
│   ├── press/
│   └── contact/
└── components/
    ├── layout/          ← Navbar, Footer
    ├── home/            ← Hero, InfoStrip, UpcomingShows, PressStrip
    ├── music/           ← EventCard, ShowsGrid
    └── ui/              ← SectionHeader
```

---

## Key Concepts

### Updating copy
All text on the site — page headings, menu items, team bios, hours, press quotes — lives in one file: [`src/content/index.ts`](src/content/index.ts). Edit the strings there. Components read from it; you never need to touch a component to update copy.

See [docs/02-updating-content.md](docs/02-updating-content.md).

### Music schedule
The `/music` page and the homepage teaser pull live from an Airtable base. James adds/edits/removes shows directly in Airtable — no code changes, no deploys. The site revalidates every 5 minutes.

See [docs/03-music-schedule.md](docs/03-music-schedule.md) for the Airtable schema and James's workflow.

### Photos
Photos are served via `next/image`. Press photography is used as a temporary stand-in. All photos should be replaced with James's own before launch.

See [docs/04-photos.md](docs/04-photos.md).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AIRTABLE_API_KEY` | For music page | Personal access token from airtable.com |
| `AIRTABLE_BASE_ID` | For music page | Base ID from Airtable API docs |
| `AIRTABLE_TABLE_NAME` | No (default: `Shows`) | Name of the shows table |

Copy `.env.local.example` → `.env.local` and fill in values. Never commit `.env.local`.

---

## Before Launch Checklist

- [ ] Replace press photos with James's photography (`src/app/gallery/page.tsx`, `Hero.tsx`)
- [ ] Confirm phone number and update `src/content/index.ts` → `site.phone`
- [ ] Confirm email addresses (`hello@`, `events@`, `press@`)
- [ ] Choose and register domain
- [ ] Paste OpenTable widget embed code into `src/app/reservations/page.tsx`
- [ ] Set up Airtable base and walk James through adding shows
- [ ] Add environment variables to Vercel project settings
- [ ] Add team photos (About page)
- [ ] Review all copy with James

---

## Docs

| File | What it covers |
|------|----------------|
| [docs/01-getting-started.md](docs/01-getting-started.md) | Local setup, environment, dev commands |
| [docs/02-updating-content.md](docs/02-updating-content.md) | Editing copy and menu items via the content file |
| [docs/03-music-schedule.md](docs/03-music-schedule.md) | Airtable setup, schema, James's update workflow |
| [docs/04-photos.md](docs/04-photos.md) | Replacing photos, naming conventions, image optimization |
| [docs/05-deploying.md](docs/05-deploying.md) | Vercel setup, custom domain, environment variables in production |
