import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["media.formula1.com"], // ✅ добавляем сюда
  },
};

export default nextConfig;
