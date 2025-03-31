/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  // Disable build ID generation to avoid trace issues
  generateBuildId: async () => {
    return 'minimalist-chat'
  },
  
  // Completely disable development mode indicators
  devIndicators: false,
}

module.exports = nextConfig 