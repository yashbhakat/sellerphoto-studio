import type { Metadata } from "next";
import AnalyticsConsent from "./analytics-consent";
import "./globals.css";

export function generateMetadata(): Metadata {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const homeUrl = `${origin}/`;
  const title = "SellerPhoto Studio | Product Photo Formatter for Indian Sellers";
  const description = "Batch-format marketplace product photos for Amazon, Flipkart, Meesho, Myntra, Instagram, and WhatsApp—privately on your device.";
  const socialImage = `${origin}/og.jpg`;

  return {
    metadataBase: new URL(origin),
    applicationName: "SellerPhoto Studio",
    creator: "SellerPhoto Studio",
    publisher: "SellerPhoto Studio",
    category: "Design software",
    referrer: "origin-when-cross-origin",
    title: { default: title, template: "%s | SellerPhoto Studio" },
    description,
    keywords: [
      "product photo editor for sellers",
      "Amazon product photo maker",
      "Flipkart listing image editor",
      "Meesho catalogue photo maker",
      "Myntra product image formatter",
      "marketplace image resizer India",
      "batch product photo editor",
    ],
    alternates: { canonical: homeUrl, languages: { "en-IN": homeUrl } },
    icons: { icon: `${origin}/favicon.svg` },
    openGraph: {
      title,
      description,
      type: "website",
      url: homeUrl,
      siteName: "SellerPhoto Studio",
      locale: "en_IN",
      images: [{ url: socialImage, width: 1536, height: 1024, alt: "SellerPhoto Studio product-photo batch workflow" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<AnalyticsConsent /></body></html>;
}
