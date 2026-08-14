import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SellerPhoto Studio",
    short_name: "SellerPhoto",
    description: "Private product photo editor and ecommerce seller tools for India.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf6",
    theme_color: "#171717",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
