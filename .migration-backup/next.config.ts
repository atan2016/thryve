import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  experimental: {
    serverActions: {
      // Default is 1mb; uploads (avatar, story media, certifications) exceed that easily.
      bodySizeLimit: "50mb"
    }
  },
  // Trust x-forwarded headers for development in GitHub Codespaces
  skipTrailingSlashRedirect: false
};

export default nextConfig;
