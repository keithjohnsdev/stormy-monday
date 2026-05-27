# 02 — Updating Content

## Two ways to update content

### Option A — Admin panel (recommended for James)

Go to `/admin` on the live site, enter the password, and edit directly in the browser. Hit **Publish Changes** when done — the site rebuilds and goes live in ~30 seconds. No code, no deploy steps.

The admin panel covers:
- All site text (headings, bios, menu items, press quotes, hours, etc.)
- Artist roster (`src/data/artists.json`)
- Show schedule (`src/data/shows.json`)

### Option B — Edit the source file directly

All site text lives in one file:

```
src/content/index.ts
```

Components read from this file. Edit a string here and it updates everywhere that string appears. Commit and push to deploy.

---

## Content structure

`content/index.ts` exports a single object organized by section:

```ts
export const content = {
  site: { ... },        // name, address, phone, email, social links
  home: { ... },        // hero, info strip, upcoming shows section, press strip
  about: { ... },       // story paragraphs, philosophy, team bios
  menu: { ... },        // cocktails list, food list, happy hour copy
  music: { ... },       // headings, regular programming callout
  contact: { ... },     // hours table, parking note, social links
  press: { ... },       // coverage list with quotes, scores, URLs
  privateEvents: { ... },
  gallery: { ... },
  footer: { ... },
}
```

---

## Common edits

### Change the hours

Find `contact.hours` in `content/index.ts`:

```ts
hours: [
  { day: 'Monday',    time: '5pm – 1am', liveMusic: '8pm – 11pm' },
  { day: 'Thursday',  time: '5pm – 1am' },
  // ...
],
```

Edit the `time` string. The `liveMusic` field is optional — add it to any day to show a live music note on the Contact page.

`home.infoStrip.hours` is a separate short version shown in the top strip. Update both.

---

### Add or remove a cocktail

Find `menu.cocktails` in `content/index.ts`:

```ts
cocktails: [
  { name: 'Dahlia', desc: 'Mezcal, bitter bianco, smoked red grape, Thai basil', note: 'Earthy and quietly complex' },
  // add a new line here
],
```

Each item has `name`, `desc` (ingredients), and optional `note` (italic sub-note). To remove, delete the line. To add, copy an existing line and edit the values.

---

### Add or remove a food item

Same pattern under `menu.food`:

```ts
food: [
  { name: 'Foie Gras Xiao Long Bao', desc: 'Seasonal jam · hand-shaped chopsticks' },
  // add here
],
```

---

### Update the phone number

Find `site.phone` in `content/index.ts` and update the string. This renders on the Contact page and footer.

---

### Update email addresses

Three email fields in `site`:

```ts
email:        'hello@stormymondaymia.com',
eventsEmail:  'events@stormymondaymia.com',
pressEmail:   'press@stormymondaymia.com',
```

---

### Update press coverage

Find `press.coverage` and `home.pressStrip.coverage`. Each entry is:

```ts
{
  outlet: 'The Infatuation',
  score:  '8.1 / 10',
  quote:  'Balances playfulness with craft expertise.',
  url:    'https://...',
  date:   'March 2026',
},
```

`home.pressStrip.coverage` is the abbreviated homepage version (has `outlet`, `quote`, `detail`, `url`). Keep it in sync with `press.coverage`.

---

### Update team bios

Find `about.team.members`:

```ts
{
  name: 'James MacInnes',
  role: 'Founder · Bar',
  bio:  '...',
},
```

`role` appears as the gold label under the name on the About page.

---

## Rules

- **Only edit the strings** (text inside quotes). Don't change key names or the object structure.
- **Trailing commas are fine** in TypeScript — don't worry about them.
- **Save the file** — the dev server hot-reloads automatically.
- **Don't delete a key** — if you want to blank something out, set it to `''` rather than removing the key.
