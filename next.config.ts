import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.miaminewtimes.com' },
      { protocol: 'https', hostname: 'media.timeout.com' },
    ],
  },
}

export default nextConfig
