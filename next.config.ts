import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/whitepaper",
        destination: "/en/whitepaper",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
