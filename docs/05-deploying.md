# 05 — Deploying to Vercel

The site is built for Vercel. Deployment is automatic — push to `main`, Vercel builds and goes live. The only one-time setup is connecting the repo and adding environment variables.

---

## One-time setup

### 1. Create a Vercel account

Go to [vercel.com](https://vercel.com) and sign up. The free (Hobby) plan is sufficient for this site.

### 2. Import the repository

1. Click **Add New → Project**
2. Connect your GitHub account if prompted
3. Find and import the repository
4. Leave all build settings at their defaults — Vercel detects Next.js automatically
5. Click **Deploy**

The first deploy will fail until you add the environment variables below.

### 3. Add environment variables

In your Vercel project, go to **Settings → Environment Variables** and add:

| Name | Value |
|------|-------|
| `GH_PAT` | GitHub personal access token (`repo` scope) |
| `GITHUB_OWNER` | GitHub username/org that owns the repo |
| `GITHUB_REPO` | Repository name |
| `ADMIN_PASSWORD` | Password for the `/admin` panel |

Set all variables for **Production**, **Preview**, and **Development** environments.

After adding them, trigger a redeploy: go to **Deployments**, find the latest, click the `...` menu → **Redeploy**.

---

## Deployments

Every push to `main` triggers a production deployment automatically.

Every push to any other branch creates a **preview deployment** — a live URL at `https://<repo>-git-<branch>.vercel.app`. Useful for testing changes before they go live.

Admin panel saves also trigger deploys — James's changes go live within ~30 seconds of hitting "Publish."

---

## Custom domain

### Connecting to Vercel

1. In Vercel, go to your project → **Settings → Domains**
2. Click **Add Domain** and enter the domain name
3. Vercel will show DNS records to add — either:
   - **A record** pointing to Vercel's IP (for apex domain)
   - **CNAME record** pointing to `cname.vercel-dns.com` (for `www`)
4. Log in to your domain registrar and add those records
5. DNS propagates in 5–30 minutes; Vercel provisions SSL automatically

Add both the apex domain and `www` subdomain in Vercel. Set one as primary — Vercel redirects the other automatically.

---

## Environment variables in production vs. local

| Variable | Where it lives |
|----------|---------------|
| Local dev | `.env.local` (never committed) |
| Production | Vercel project settings |

The `.env.local` file is git-ignored. Never commit it. Production values live only in Vercel — Vercel injects them at build time and runtime.

**Rotating the GitHub PAT:** generate a new token at github.com/settings/tokens, update it in Vercel settings, then redeploy. Also update your local `.env.local`.

**Rotating the admin password:** update `ADMIN_PASSWORD` in Vercel settings, redeploy, and tell James the new password.

---

## Checking a deployment

After deploying, walk through the full site:

- [ ] Homepage loads, hero video plays, press strip renders
- [ ] Music page: shows appear (or empty state if no future shows in shows.json)
- [ ] Admin panel: logs in, content/artists/shows tabs all work, publish succeeds
- [ ] Reservations page: OpenTable button links to the correct venue
- [ ] Gallery: all photos load
- [ ] Contact page: hours, address, phone correct
- [ ] About page: team bios and names correct
- [ ] Menu page: cocktails and food items accurate
- [ ] Mobile: nav works, all pages responsive

---

## Troubleshooting

**Build fails with type error**  
Run `npm run build` locally to reproduce. Fix the TypeScript error before pushing.

**Admin panel returns 500 on save**  
Check that `GH_PAT`, `GITHUB_OWNER`, and `GITHUB_REPO` are all set in Vercel. The PAT needs `repo` scope.

**Music page empty in production**  
Check that `src/data/shows.json` has future shows with `status: "published"`. Add them via `/admin`.

**Images not loading**  
External domains must be in `remotePatterns` in `next.config.ts`. See [docs/04-photos.md](04-photos.md).

**Changes not live after pushing**  
Check the Vercel dashboard — the build may have failed. Click the deployment to see the build log.

**Domain shows "not secure" warning**  
SSL certificate is still provisioning. Wait 5–10 minutes and refresh. If it persists, check that DNS records match exactly what Vercel specified.
