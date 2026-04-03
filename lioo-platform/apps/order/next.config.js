/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/redis-cache'],
  images: {
    remotePatterns: [
      // Supabase Storage (public bucket)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Cloudflare R2 public bucket
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      // Cloudflare Images CDN
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
    ],
  },
};

export default nextConfig;
