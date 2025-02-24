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


// https://mozescsaszar.github.io/minesweeper/

export default nextConfig;
