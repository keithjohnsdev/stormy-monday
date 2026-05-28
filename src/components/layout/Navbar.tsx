'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const THEME_KEY  = 'sm_admin_theme'
const THEME_EVENT = 'sm-theme-change'

function isDarkHour(): boolean {
  const h = new Date().getHours()
  return h >= 17 || h < 6
}

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
  const isAdmin = pathname.startsWith('/admin')

  // Admin-panel theme state — synced with AdminClient via localStorage + custom event
  const [adminDark, setAdminDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY)
    setAdminDark(stored !== null ? stored === 'dark' : isDarkHour())
  }, [])

  useEffect(() => {
    const handler = (e: Event) => setAdminDark((e as CustomEvent<boolean>).detail)
    window.addEventListener(THEME_EVENT, handler)
    return () => window.removeEventListener(THEME_EVENT, handler)
  }, [])

  function handleAdminTheme(dark: boolean) {
    setAdminDark(dark)
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
    window.dispatchEvent(new CustomEvent<boolean>(THEME_EVENT, { detail: dark }))
  }

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
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'}`}>
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

          {/* Admin theme toggle — only on /admin */}
          {isAdmin && (
            <div className="mt-6 pt-5 border-t border-storm-border">
              <p className="text-xs tracking-widest uppercase text-storm-muted mb-3">Admin Theme</p>
              <div className={`relative inline-flex rounded-full p-0.5 ${adminDark ? 'bg-gray-700' : 'bg-gray-500'}`}>
                <div className={`absolute top-0.5 bottom-0.5 rounded-full transition-all duration-200 shadow-sm ${
                  adminDark ? 'left-1/2 right-0.5 bg-gray-900' : 'left-0.5 right-1/2 bg-white'
                }`} />
                <button
                  onClick={() => handleAdminTheme(false)}
                  className={`relative z-10 px-3 py-1.5 text-xs font-medium transition-colors ${!adminDark ? 'text-gray-800' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  ☀ Light
                </button>
                <button
                  onClick={() => handleAdminTheme(true)}
                  className={`relative z-10 px-3 py-1.5 text-xs font-medium transition-colors ${adminDark ? 'text-gray-100' : 'text-gray-200 hover:text-white'}`}
                >
                  ☾ Dark
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
