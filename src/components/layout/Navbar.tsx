'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/menu',           label: 'Menu' },
  { href: '/music',          label: 'Music' },
  { href: '/reservations',   label: 'Reservations' },
  { href: '/private-events', label: 'Private Events' },
  { href: '/gallery',        label: 'Gallery' },
  { href: '/about',          label: 'About' },
  { href: '/contact',        label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-storm-black/95 backdrop-blur-sm border-b border-storm-border animate-slide-down">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="font-display text-xl tracking-widest text-storm-cream hover:text-storm-gold transition-colors"
        >
          STORMY MONDAY
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-xs tracking-widest uppercase transition-colors hover:text-storm-gold ${
                  pathname === href ? 'text-storm-gold' : 'text-storm-muted'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu toggle — animates hamburger → X */}
        <button
          className="lg:hidden text-storm-muted hover:text-storm-cream p-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <div className="w-5 h-[15px] flex flex-col justify-between">
            <span className={`block w-full h-px bg-current origin-center transition-all duration-300 ease-in-out ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-full h-px bg-current transition-all duration-300 ease-in-out ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-full h-px bg-current origin-center transition-all duration-300 ease-in-out ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </div>
        </button>
      </nav>

      {/* Mobile drawer — slides down */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-storm-dark border-t border-storm-border px-6 py-6">
          <ul className="flex flex-col gap-5">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm tracking-widest uppercase text-storm-cream hover:text-storm-gold transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}
