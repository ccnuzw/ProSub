import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

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

export default withBundleAnalyzer(nextConfig);