import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Stormy Monday — Miami Beach',
    template: '%s | Stormy Monday',
  },
  description:
    'Craft cocktails, chef-driven bites, and live music at 820 Alton Road, Miami Beach. Open Thursday–Monday, 5pm–1am.',
  openGraph: {
    title: 'Stormy Monday',
    description:
      'Craft cocktails, chef-driven bites, and live music. 820 Alton Road, Miami Beach.',
    siteName: 'Stormy Monday',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-storm-black text-storm-cream font-body antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
