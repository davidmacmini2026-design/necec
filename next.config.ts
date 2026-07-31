import type { NextConfig } from "next";

// Build cache bust v20260731-1 — DeepSeek translation API
const nextConfig: NextConfig = {
  // Server mode for API routes and admin CMS
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*.ngrok-free.dev', '*ngrok-free.app'],
};

export default nextConfig;
