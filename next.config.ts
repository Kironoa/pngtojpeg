import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/pngtojpeg",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
