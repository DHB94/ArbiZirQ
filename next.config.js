/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  env: {
    PROJECT_NAME: process.env.PROJECT_NAME,
  },
  images: {
    domains: ['assets.coingecko.com'],
  },
}

module.exports = nextConfig
