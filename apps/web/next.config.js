/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: Enable standalone output for Docker deployment
  output: 'standalone',
  
  experimental: {
    // Help with monorepo file tracing
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
  },
  
  // Skip trailing slash redirect during build
  trailingSlash: false,
  
  // Configure for Azure Web App deployment
  poweredByHeader: false,
  compress: true,
  
  // Handle monorepo packages if you have shared ones
  transpilePackages: [
    // Add your shared package names here if any
    // e.g., '@repo/ui', '@repo/shared', etc.
  ],
};

module.exports = nextConfig;