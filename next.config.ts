import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: "dist",
  swcMinify: true,
  modularizeImports: {
    'antd': {
      transform: 'antd/lib/{{member}}',
      skipDefaultConversion: true,
    },
  },
  /* config options here */
};

export default nextConfig;
