# Stormy Monday — Deployment Guide

## Local Development

```bash
cd context/clients/stormy-monday/projects/website
npm install
cp .env.local.example .env.local   # then fill in your values
npm run dev                         # http://localhost:3000
```

---

## Custom Domain Setup

### 1 — Choose and Buy the Domain

Recommended options (all appear unregistered as of May 2026):

| Domain | Cost/yr | Notes |
|--------|---------|-------|
| `stormymonday.com` | ~$10 | Most professional |
| `stormymonday.bar` | ~$20–30 | On-brand for a bar |
| `stormymonday.miami` | ~$15–20 | Miami-specific |

**Recommended registrar: Cloudflare Registrar** — sells at cost, no renewal markup, free DNS.

1. Go to [domains.cloudflare.com](https://domains.cloudflare.com) → create a free account
2. Search for the chosen domain and purchase it (~2 min, pay by card)

### 2 — Add the Domain in Vercel

1. Open the Stormy Monday project in Vercel
2. **Settings → Domains → Add**
3. Enter the domain (e.g. `stormymonday.com`) → click **Add**
4. Vercel displays two DNS records — keep this tab open

### 3 — Configure DNS in Cloudflare

1. In the Cloudflare dashboard → **Websites → Add a site** → enter the domain → select **Free plan**
2. Go to **DNS → Records → Add record** and enter both records from Vercel:

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

3. Set **Proxy status to DNS only** (gray cloud, not orange) on both records — Vercel handles SSL directly

> If you registered via Cloudflare Registrar, nameservers are already set automatically. If you used a different registrar, update its nameservers to the two Cloudflare nameservers shown in the dashboard.

### 4 — Verify in Vercel

1. Back in Vercel → **Settings → Domains**
2. Wait 2–10 minutes for DNS to propagate
3. Green checkmark = domain is live; SSL is provisioned automatically

### 5 — Update the Domain Placeholder in Code

The codebase uses `stormymondaymia.com` as a placeholder. Once the real domain is confirmed, find and replace it across the project and commit:

```
stormymondaymia.com → [chosen domain]
```

Key files to check: `src/app/layout.tsx`, any `sitemap.ts` or `robots.ts`.

### Domain Setup Checklist

- [ ] James picks a domain
- [ ] Register at Cloudflare Registrar
- [ ] Add domain in Vercel → Settings → Domains
- [ ] Add A + CNAME records in Cloudflare DNS (proxy off)
- [ ] Green checkmark in Vercel (2–10 min)
- [ ] Replace `stormymondaymia.com` placeholder in codebase and push

---

## Vercel Setup (first time only)

### 1. Create the Vercel Project

Go to [vercel.com](https://vercel.com) → New Project → Import the `keithjohnsdev/marshall-consulting` repo (or whatever the GitHub repo is named).

**Critical setting**: Under **Build & Development Settings**, set:
- **Root Directory**: `context/clients/stormy-monday/projects/website`

If you can't find Root Directory in the wizard, skip it — the `vercel.json` at the repo root handles the build path automatically.

### 2. Set Environment Variables

In the Vercel project → Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `AIRTABLE_API_KEY` | Personal access token from airtable.com |
| `AIRTABLE_BASE_ID` | From Airtable API docs for the Shows base |
| `AIRTABLE_TABLE_NAME` | `Shows` |
| `GH_PAT` | Fine-grained GitHub PAT with Contents Read+Write on this repo |
| `GITHUB_OWNER` | GitHub username (e.g. `keithjohnsdev`) |
| `GITHUB_REPO` | Repo name (e.g. `marshall-consulting`) |

### 3. Deploy

Push any commit to `main` — Vercel auto-deploys. Or click **Redeploy** in the Vercel dashboard.

---

## Ongoing Deploys

Every push to `main` triggers an automatic Vercel deploy. There's nothing to do manually once the project is set up.

**Expected build time**: ~60–90 seconds.

---

## Editing Site Content (the easy way)

Navigate to `https://your-vercel-url.vercel.app/content` — this is a hidden admin page. Edit any text field and click **Publish Changes**. The page commits directly to GitHub and Vercel deploys automatically. Changes are live in ~30 seconds.

---

## Troubleshooting

**Build fails with "can't find app directory"**
Vercel is building from the repo root instead of the website subdirectory. The `vercel.json` at the repo root should fix this automatically. If it still fails, go to Vercel → Project Settings → Build & Development Settings → set Root Directory to `context/clients/stormy-monday/projects/website`.

**`/content` page returns 404 on deployed site**
Usually means the build failed silently or Root Directory isn't set correctly. Check the Vercel build logs.

**Airtable shows are not loading**
Verify `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, and `AIRTABLE_TABLE_NAME` are set in Vercel environment variables and that the token has read access to the base.
