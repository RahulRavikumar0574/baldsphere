import type { NextConfig } from "next";

// Vercel deployment with dynamic API routes – do NOT use static export.
const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // If you use next/image:
  // images: { unoptimized: true },
};

export default nextConfig;