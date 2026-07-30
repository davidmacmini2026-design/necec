import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server mode for API routes and admin CMS
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*.ngrok-free.dev', '*ngrok-free.app'],
};

export default nextConfig;
