import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const wordpressBlogsBaseUrl =
      process.env.WORDPRESS_BLOGS_BASE_URL?.replace(/\/$/, "");

    if (!wordpressBlogsBaseUrl) return [];

    return [
      {
        source: "/blogs",
        destination: wordpressBlogsBaseUrl,
      },
      {
        source: "/blogs/:path*",
        destination: `${wordpressBlogsBaseUrl}/:path*`,
      },
    ];
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
