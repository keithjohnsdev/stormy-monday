import Image from 'next/image'
import type { Metadata } from 'next'
import SectionHeader from '@/components/ui/SectionHeader'
import { content } from '@/content'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos from Stormy Monday — cocktails, food, live music, and the room.',
}

const { gallery, site } = content

// TODO: Replace with James's own photography + real Instagram post URLs before launch.
// For a live Instagram feed, integrate a service like Behold (behold.so) which
// requires no backend and supports the current Instagram Graph API.
const photos = [
  {
    src: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/CP1A255401.jpg',
    alt: 'The bar at Stormy Monday, Miami Beach',
    instagramUrl: site.instagramUrl, // swap for individual post URL when available
    credit: 'Cleveland Jennings / @eatthecanvasllc',
  },
  {
    src: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/storymy-monday-2-e1772473503670.jpg',
    alt: 'Inside Stormy Monday, 820 Alton Road',
    instagramUrl: site.instagramUrl,
    credit: 'Cleveland Jennings / @eatthecanvasllc',
  },
  {
    src: 'https://media.timeout.com/images/106379421/750/422/image.jpg',
    alt: 'Stormy Monday — TimeOut Miami',
    instagramUrl: site.instagramUrl,
    credit: 'TimeOut Miami',
  },
  {
    src: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/stormy-monday-e1772473529632.png',
    alt: 'James MacInnes and Chef Seth Blumenthal',
    instagramUrl: site.instagramUrl,
    credit: 'Cleveland Jennings / @eatthecanvasllc',
  },
]

export default function GalleryPage() {
  return (
    <div className="pt-16">
      <section className="max-w-5xl mx-auto px-6 py-24">

        <SectionHeader
          eyebrow={gallery.eyebrow}
          heading={gallery.heading}
          subheading={gallery.subheading}
        />

        {/* Instagram-style grid — 3 columns, photo tiles link to their IG post */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">

          {photos.map(({ src, alt, instagramUrl }) => (
            <a
              key={src}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-storm-card block"
            >
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-storm-black/0 group-hover:bg-storm-black/45 transition-colors duration-300 flex items-center justify-center">
                <span className="text-storm-cream text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View on Instagram ↗
                </span>
              </div>
            </a>
          ))}

          {/* 5th tile — follow CTA, fills the last slot in the 3-col grid */}
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square bg-storm-card border border-storm-border hover:border-storm-gold/50 transition-colors duration-300 flex flex-col items-center justify-center gap-4 block"
          >
            {/* Instagram-ish icon stand-in */}
            <div className="w-10 h-10 rounded-xl border border-storm-gold/40 flex items-center justify-center group-hover:border-storm-gold transition-colors duration-300">
              <div className="w-4 h-4 rounded-full border border-storm-gold/40 group-hover:border-storm-gold transition-colors duration-300" />
            </div>
            <div className="text-center px-4">
              <p className="text-storm-gold text-xs tracking-widest uppercase mb-1">Follow Along</p>
              <p className="font-display text-storm-cream text-lg">{site.instagramHandle}</p>
            </div>
            <span className="text-xs tracking-widest uppercase text-storm-muted group-hover:text-storm-gold transition-colors duration-300">
              See all posts ↗
            </span>
          </a>

        </div>

        <p className="text-xs text-storm-muted mt-4">{gallery.photoCredit}</p>

      </section>
    </div>
  )
}
