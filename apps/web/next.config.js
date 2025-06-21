/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  // Skip trailing slash redirect during build
  trailingSlash: false,
  // Configure for Azure Web App deployment
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;