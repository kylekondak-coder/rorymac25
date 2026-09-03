import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Certificate scans/photos can run a few MB — default is 1MB.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
