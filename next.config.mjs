/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api-assets.clashofclans.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.clashk.ing',
      },
    ],
  },
};

export default nextConfig;
