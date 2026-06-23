import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@writer-mentor-ai/shared'],
  typedRoutes: true,
};

export default nextConfig;
