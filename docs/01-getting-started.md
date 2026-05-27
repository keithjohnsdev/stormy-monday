# 01 — Getting Started

## Prerequisites

- Node.js 20+ (`node -v` to check)
- npm 10+
- A code editor (VS Code recommended)
- Git

---

## 1. Install dependencies

```bash
cd context/clients/stormy-monday/projects/website
npm install
```

---

## 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the values:

| Variable | Notes |
|----------|-------|
| `GH_PAT` | GitHub personal access token (`repo` scope) — used by `/admin` to commit content changes |
| `GITHUB_OWNER` | GitHub username that owns the repo |
| `GITHUB_REPO` | Repository name |
| `ADMIN_PASSWORD` | Password for the `/admin` panel — share with James separately |

To get a GitHub PAT: github.com → Settings → Developer settings → Personal access tokens → Generate new token (classic) → check `repo` scope.

---

## 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server hot-reloads on file save — no need to restart.

---

## 4. Build for production (optional)

```bash
npm run build
npm run start
```

Run this locally before deploying to catch TypeScript or build errors early.

---

## Project commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:3000 with hot reload |
| `npm run build` | Build for production (catches type errors) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint |

---

## Where things live

If you're new to the codebase, start with these files:

1. **`src/content/index.ts`** — Every string on the site. Change text here; components read from it automatically.
2. **`src/data/shows.json`** — Show schedule (managed via `/admin`).
3. **`src/data/artists.json`** — Artist roster (managed via `/admin`).
4. **`src/lib/shows.ts`** — Music schedule data layer. Reads from `shows.json` at build time.

---

## Tech stack at a glance

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router) | Server components, great SEO, built-in image optimization |
| Styling | Tailwind CSS | Fast iteration, consistent dark theme via `storm-*` tokens |
| Fonts | Playfair Display + Inter via `next/font` | Zero layout shift, self-hosted |
| Music data | JSON (`src/data/shows.json`) | Managed via `/admin`; build-time read, no external API |
| Admin | `/admin` panel | Password-protected; James manages content and shows directly |
| Reservations | OpenTable embed | Already listed; no custom booking system needed |
| Deployment | Vercel | Native Next.js support, instant previews, free tier |

---

## Common issues

**`Module not found: @/content`**  
The content module exists at `src/content/index.ts`. If your editor can't resolve `@/`, check that `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }`.

**Music page shows empty state**  
No shows in `src/data/shows.json` have a future date and `status: "published"`. Add shows via `/admin`.

**Admin panel returns 500 on save**  
Check that `GH_PAT`, `GITHUB_OWNER`, and `GITHUB_REPO` are set in your environment. The PAT needs `repo` scope.

**Image fails to load from external URL**  
The domain needs to be added to `remotePatterns` in `next.config.ts`. See [docs/04-photos.md](04-photos.md).
