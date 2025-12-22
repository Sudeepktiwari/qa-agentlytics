import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude problematic MongoDB modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        'child_process': false,
        'fs/promises': false,
        dns: false,
        'timers/promises': false,
        'timers': false,
        'stream': false,
        'crypto': false,
        'http': false,
        'https': false,
        'os': false,
        'path': false,
        'zlib': false,
        'constants': false,
      };
    }
    return config;
  },
};

export default nextConfig;
