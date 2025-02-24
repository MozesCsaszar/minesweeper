import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? '/minesweeper' : '',
  basePath: isProd ? '/minesweeper' : '',
  output: 'export'
};

export default nextConfig;
