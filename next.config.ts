import type { NextConfig } from 'next'

const productionHost = process.env.NEXT_PUBLIC_APP_URL
  ? (() => { try { return new URL(process.env.NEXT_PUBLIC_APP_URL).host } catch { return null } })()
  : null

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.vercel.app' },
    ],
  },
  experimental: {
    serverActions: {
      // Allow server actions from localhost and the production domain
      allowedOrigins: [
        'localhost:3000',
        ...(productionHost ? [productionHost] : []),
      ],
    },
  },
}

export default nextConfig
