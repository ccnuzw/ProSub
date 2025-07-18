import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: "dist",
  modularizeImports: {
    'antd': {
      transform: 'antd/lib/{{member}}',
      skipDefaultConversion: true,
    },
  },
  /* config options here */
};

export default nextConfig;
