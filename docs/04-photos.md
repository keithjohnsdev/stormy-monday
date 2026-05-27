# 04 — Photos

The site currently uses press photos from Miami New Times as placeholders. All of these should be replaced with James's own photography before launch.

---

## Where photos are used

| Location | File | Current state |
|----------|------|---------------|
| Hero background (homepage) | `src/components/home/Hero.tsx` | Press photo — replace |
| Gallery grid | `src/app/gallery/page.tsx` | 3 press photos — replace |
| Event cards (music page) | `src/components/music/EventCard.tsx` | Pulled from Airtable attachment — James manages |
| Team photos (about page) | `src/app/about/page.tsx` | Initial avatars — replace |

---

## Adding local photos

Place images in `public/images/`. They're served at `/images/filename.jpg`.

Use Next.js `<Image>` component, not a plain `<img>` tag:

```tsx
import Image from 'next/image'

// Fixed size
<Image src="/images/hero.jpg" width={1920} height={1080} alt="Stormy Monday bar" />

// Fill a container (most common for hero/gallery)
<div className="relative aspect-square">
  <Image src="/images/cocktail.jpg" fill className="object-cover" alt="Cocktail" />
</div>
```

The `fill` prop requires the parent container to have `position: relative` and defined dimensions.

---

## Replacing the hero photo

Open `src/components/home/Hero.tsx`. Find the `HERO_IMG` constant at the top:

```ts
const HERO_IMG = 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/CP1A255401.jpg'
```

**To use a local file:**
1. Place the photo at `public/images/hero.jpg`
2. Update the component:

```tsx
import Image from 'next/image'

// Remove HERO_IMG constant, update the Image tag:
<Image
  src="/images/hero.jpg"
  alt="Stormy Monday bar"
  fill
  className="object-cover"
  priority
/>
```

Good hero photos: wide-format (landscape), dark and moody, strong subject. The overlay (`bg-storm-black/70`) darkens it — you can adjust the opacity.

---

## Replacing gallery photos

Open `src/app/gallery/page.tsx`. Find the `photos` array:

```ts
const photos = [
  { src: 'https://...', alt: 'Cocktails at Stormy Monday' },
  { src: 'https://...', alt: 'The bar at Stormy Monday' },
  { src: 'https://...', alt: 'Inside Stormy Monday' },
]
```

**To use local files:**
1. Place photos at `public/images/gallery/01.jpg`, `02.jpg`, etc.
2. Update the array:

```ts
const photos = [
  { src: '/images/gallery/01.jpg', alt: 'The bar' },
  { src: '/images/gallery/02.jpg', alt: 'Dahlia cocktail' },
  { src: '/images/gallery/03.jpg', alt: 'Live music night' },
  // add more rows as needed
]
```

The gallery grid is `grid-cols-1 md:grid-cols-3` — photos look best at 1:1 ratio (square crop).

---

## Replacing team photos (About page)

Open `src/app/about/page.tsx`. Each team member currently shows an initial avatar:

```tsx
<div className="w-16 h-16 bg-storm-card border border-storm-border rounded-full ...">
  <span className="font-display text-storm-gold text-xl">{name[0]}</span>
</div>
```

Replace with:

```tsx
<div className="w-24 h-24 relative rounded-full overflow-hidden mb-5">
  <Image src={`/images/team/${name.split(' ')[0].toLowerCase()}.jpg`} fill className="object-cover" alt={name} />
</div>
```

Place photos at `public/images/team/james.jpg`, `seth.jpg`, `jason.jpg`.

---

## Using external image URLs

If an image lives on an external domain (like the current press photos), that domain must be listed in `next.config.ts`:

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'www.miaminewtimes.com' },
    // add new domains here
  ],
},
```

Without this, Next.js will throw a build error when trying to optimize the image.

---

## Photo recommendations for James

When gathering photos for the site, aim for:

| Type | Count | Notes |
|------|-------|-------|
| Hero (wide) | 1–2 | Dark, moody, wide crop. Bar, room, or atmospheric shot. |
| Gallery | 9–12 | Mix of: cocktails, food, room, live music, candid guests |
| Team | 3 | One per person. Consistent treatment (same background or vibe) |

**Format:** JPEG or WebP. Max 3MB each before optimization. Next.js automatically serves the right size per device.

**Photographer credit:** The current press photos are credited to Cleveland Jennings / @eatthecanvasllc. If James uses the same photographer, update the credit in `src/content/index.ts` → `gallery.photoCredit`.
