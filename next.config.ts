import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/music', destination: '/events', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.miaminewtimes.com' },
      { protocol: 'https', hostname: 'media.timeout.com' },
    ],
  },
}

export default nextConfig
