export interface Show {
  id: string
  artistName: string
  date: string        // ISO date string: "2026-05-19"
  startTime: string   // e.g. "9pm"
  genre: string       // e.g. "Live Jazz", "Blues Trio", "DJ Set"
  description?: string
  artistPhoto?: string
  ticketed?: boolean   // if true, show a "Tickets →" link using ticketLink
  ticketLink?: string
  artistWebsite?: string // if set, show a "Website →" link
  coverCharge?: string // e.g. "$10" or "Free"
  featured: boolean
}

export interface MenuItem {
  name: string
  description: string
  price?: string
  note?: string
}

export interface TeamMember {
  name: string
  role: string
  bio: string
  imagePlaceholder?: string
}

export interface Artist {
  id: string
  name: string
  genre: string
  description: string
  website: string
  defaultCoverCharge: string
  /** Musician portal login credentials — set by admin, optional */
  email?: string
  password?: string
}

export interface StoredShow extends Show {
  artistId: string
  status: 'published' | 'draft'
}
