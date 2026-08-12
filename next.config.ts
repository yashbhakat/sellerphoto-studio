import type { NextConfig } from "next";

const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH;
const basePath = configuredBasePath === "__ROOT__" ? "" : configuredBasePath || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // The static public site does not import the Cloudflare-only database layer.
  // Vinext validates that layer separately in the worker build.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
