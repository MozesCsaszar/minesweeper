import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  basePath: '/minesweeper',
  output: 'export'
};


// https://mozescsaszar.github.io/minesweeper/

export default nextConfig;
