import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/api/**": ["./public/work/**"],
  },
};

export default nextConfig;
