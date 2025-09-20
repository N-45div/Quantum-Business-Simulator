import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds for hackathon development
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during builds for hackathon development
    ignoreBuildErrors: true,
  },
  experimental: {
    // Enable server actions for better API performance
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app']
    }
  }
};

export default nextConfig;
