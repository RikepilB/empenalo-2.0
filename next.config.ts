import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Server Actions are stable in 15; raise body limit for photo uploads.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
