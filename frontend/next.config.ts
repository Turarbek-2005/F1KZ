import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["media.formula1.com","cdn.countryflags.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4200/api/:path*",
      },
    ];
  },
};

export default nextConfig;
