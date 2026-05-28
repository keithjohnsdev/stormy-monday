import Link from 'next/link'
import { content } from '@/content'

const { site, footer } = content

const navLinks: [string, string][] = [
  ['/menu',           'Menu'],
  ['/reservations',   'Reservations'],
  ['/events',         'Music + Events'],
  ['/private-events', 'Private Events'],
  ['/gallery',        'Gallery'],
  ['/about',          'About'],
  ['/contact',        'Contact'],
]

export default function Footer() {
  return (
    <footer className="bg-storm-dark border-t border-storm-border mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

        <div>
          <p className="font-display text-lg tracking-widest text-storm-cream mb-4">
            {site.name.toUpperCase()}
          </p>
          <p className="text-storm-muted text-sm leading-relaxed">
            {site.address}<br />
            {site.city}
          </p>
          <div className="gold-divider" />
          <p className="text-storm-muted text-sm leading-relaxed">
            {footer.hoursLine1}<br />
            {footer.hoursLine2}
          </p>
        </div>

        <div>
          <p className="text-xs tracking-widest uppercase text-storm-muted mb-5">{footer.navigateLabel}</p>
          <ul className="flex flex-col gap-3">
            {navLinks.map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-storm-muted hover:text-storm-gold transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs tracking-widest uppercase text-storm-muted mb-5">{footer.followLabel}</p>
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-storm-muted hover:text-storm-gold transition-colors"
          >
            {site.instagramHandle}
          </a>
          <div className="gold-divider" />
          <Link href="/private-events" className="text-sm text-storm-muted hover:text-storm-gold transition-colors block mb-3">
            Private Events
          </Link>
          <Link href="/press" className="text-sm text-storm-muted hover:text-storm-gold transition-colors block">
            Press
          </Link>
          <div className="gold-divider" />
          <Link href="/admin" className="text-sm text-storm-muted hover:text-storm-cream transition-colors block mb-2">
            Admin
          </Link>
          <Link href="/musicians" className="text-sm text-storm-muted hover:text-storm-cream transition-colors block">
            Musician Portal
          </Link>
        </div>

      </div>
      <div className="border-t border-storm-border px-6 py-5 max-w-7xl mx-auto">
        <p className="text-xs text-storm-muted">
          © {new Date().getFullYear()} {site.name}. Miami Beach, FL.
        </p>
      </div>
    </footer>
  )
}
