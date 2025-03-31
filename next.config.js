/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  devIndicators: false,
}

module.exports = nextConfig 