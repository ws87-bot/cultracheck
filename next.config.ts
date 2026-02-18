import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/**": ["./knowledge-base.json"],
  },
};
export default nextConfig;
