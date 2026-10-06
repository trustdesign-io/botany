import type { NextConfig } from "next";

// Static export served from cPanel at dannychambers.co.uk/botany (no Vercel).
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/botany",
  trailingSlash: true,
  images: { unoptimized: true },
  // Stamped on every build and added to photo addresses, so a browser never shows a stale cached photo
  // after records are renumbered and a file name passes to a different record.
  env: { NEXT_PUBLIC_BUILD: Date.now().toString(36) },
};

export default nextConfig;
