export interface Show {
  id: string
  artistName: string
  date: string        // ISO date string: "2026-05-19"
  startTime: string   // e.g. "9pm"
  genre: string       // e.g. "Live Jazz", "Blues Trio", "DJ Set"
  description?: string
  artistPhoto?: string
  ticketLink?: string
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
}

export interface StoredShow extends Show {
  artistId: string
  status: 'published' | 'draft'
}
