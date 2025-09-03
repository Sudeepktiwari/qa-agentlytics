import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      };
    }
    return config;
  },
};

export default nextConfig;
