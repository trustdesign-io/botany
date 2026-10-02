import type { NextConfig } from "next";

// Static export served from cPanel at dannychambers.co.uk/botany (no Vercel).
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/botany",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
