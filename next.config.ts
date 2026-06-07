import type { NextConfig } from "next";

const apiUrl = (
  process.env.SERVER_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://172.252.13.139:8085'
).replace(/\/+$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
