/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
  },
  // Prevent static optimization for pages that use server-side features
  output: 'standalone',
  // Skip trailing slash redirect during build
  trailingSlash: false,
  // Disable static optimization for problematic pages
  async generateStaticParams() {
    return []
  }
};

module.exports = nextConfig;
