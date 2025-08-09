/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  env: {
    PROJECT_NAME: process.env.PROJECT_NAME,
    VERCEL: process.env.VERCEL || false,
  },
  images: {
    domains: ['assets.coingecko.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle MetaMask SDK chunk loading issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
      };
      
      // Add Buffer polyfill
      config.plugins.push(
        new (require('webpack')).ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
      
      // Fix dynamic imports for MetaMask SDK
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        metamask: {
          test: /[\\/]node_modules[\\/]@metamask[\\/]/,
          name: 'metamask',
          chunks: 'all',
          priority: 10,
        },
      };
      
      // Handle specific problematic modules
      config.externals = config.externals || [];
      config.externals.push({
        'node:crypto': 'crypto',
        'node:fs': 'fs',
        'node:path': 'path',
      });
    }
    return config;
  },
  // Optimize for Vercel deployment
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  // Ensure API routes work properly in serverless environment
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
}

module.exports = nextConfig