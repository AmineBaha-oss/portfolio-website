/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const fs = require('fs');

// Resolve shared folder path - works in both build and runtime contexts
const sharedPath = path.resolve(__dirname, '../shared/next-config-helpers.js');
const localSharedPath = path.resolve(__dirname, './shared/next-config-helpers.js');
const sharedHelpersPath = fs.existsSync(sharedPath) ? sharedPath : localSharedPath;

const { createSharedAlias } = require(sharedHelpersPath);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...createSharedAlias(__dirname),
    };
    return config;
  },
  images: {
    // Disable image optimization since Next.js server inside Docker can't reach localhost:8080
    // The browser can reach it fine, but the server-side optimizer can't
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/files/**',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '8080',
        pathname: '/api/files/**',
      },
    ],
  },
}

module.exports = nextConfig
