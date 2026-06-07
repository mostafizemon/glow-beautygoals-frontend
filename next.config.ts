import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://172.252.13.139:8085/api/:path*',
      },
    ];
  },
};

export default nextConfig;
