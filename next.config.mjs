/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com'
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/pexels/search',
        destination: '/api/pexels?endpoint=search'
      },
      {
        source: '/api/pexels/curated',
        destination: '/api/pexels?endpoint=curated'
      }
    ];
  }
};

export default nextConfig;
