/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
  },
  // Skip trailing slash redirect during build
  trailingSlash: false,
  // Configure for Azure Web App deployment
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
