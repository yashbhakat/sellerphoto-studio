import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // The static public site does not import the Cloudflare-only database layer.
  // Vinext validates that layer separately in the worker build.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
