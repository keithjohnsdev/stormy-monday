# 03 — Music Schedule

The music schedule is managed through the `/admin` panel. James adds artists to the roster, schedules shows, and hits **Publish Shows** — the site rebuilds and goes live within ~30 seconds.

Show data lives in `src/data/shows.json`. The admin panel writes to that file via the GitHub API, which triggers a Vercel redeploy.

---

## James's workflow

### Adding a show

1. Go to `/admin` on the live site and log in
2. Click the **Artists** tab — add any new artist to the roster first if they're not already there
3. Click the **Shows** tab
4. Select an artist from the dropdown and pick a date
5. Optionally check **Featured** to highlight the show on the homepage
6. Click **Add Show**, then **Publish Shows**

The site rebuilds automatically. Changes are live in ~30 seconds.

### Removing a show

Find the show in the **Upcoming** list on the Shows tab, click **Remove**, then **Publish Shows**.

### Adding an artist to the roster

On the **Artists** tab, expand **+ Add Artist** and fill in:
- **Name** — required
- **Genre** — e.g. `Live Jazz`, `Blues`, `Singer/Songwriter`
- **Description** — short bio shown on the music page
- **Website / Ticket Link** — used as the ticket link on show cards
- **Default Cover Charge** — e.g. `Free`, `$10`

Click **Add to Roster**, then **Save Roster**.

---

## How the code works

Show data is read at build time from `src/data/shows.json` in `src/lib/shows.ts`. It filters for `status: "published"` and future dates, sorted ascending.

Because it's a static JSON read (no network call), there's no revalidation delay — the data is always current as of the last publish.
