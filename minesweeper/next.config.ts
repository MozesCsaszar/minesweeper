import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  basePath: '/minesweeper',
  output: 'export'
};

export default nextConfig;
