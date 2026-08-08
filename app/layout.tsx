import type { Metadata } from "next";
import "./globals.css";

export function generateMetadata(): Metadata {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const title = "SellerPhoto Studio";
  const description = "Batch-format marketplace product photos privately on your device.";
  const socialImage = `${origin}/og.png`;

  return {
    metadataBase: new URL(origin),
    title: { default: title, template: "%s | SellerPhoto Studio" },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: origin,
      images: [{ url: socialImage, width: 1536, height: 1024, alt: "SellerPhoto Studio product-photo batch workflow" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
