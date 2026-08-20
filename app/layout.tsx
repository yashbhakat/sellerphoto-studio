import type { Metadata, Viewport } from "next";
import AnalyticsConsent from "./analytics-consent";
import "./globals.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, themeColor: "#fbfaf6", colorScheme: "light" };

export function generateMetadata(): Metadata {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const homeUrl = `${origin}/`;
  const title = "SellerPhoto Studio | Product Photos, Videos & Revenue Forecasting";
  const description = "Private product photo editor, product video maker and lifetime revenue and profit forecasting suite for marketplaces, quick commerce, D2C and social sellers in India.";
  const socialImage = `${origin}/og.png`;
  return {
    metadataBase: new URL(origin),
    applicationName: "SellerPhoto Studio",
    creator: "SellerPhoto Studio",
    publisher: "SellerPhoto Studio",
    category: "Ecommerce seller software",
    referrer: "origin-when-cross-origin",
    title: { default: title, template: "%s | SellerPhoto Studio" },
    description,
    keywords: ["product photo editor for sellers", "product video maker for ecommerce", "product revenue forecasting calculator", "product lifetime profit forecast", "ecommerce analytics for sellers India", "marketplace image compliance checker", "marketplace profit calculator", "quick commerce margin calculator", "Amazon product image editor India", "Flipkart listing image maker", "Meesho catalogue photo maker", "Blinkit seller tools", "Zepto brand margin calculator", "Swiggy Instamart product images", "batch product photo editor", "D2C product forecasting", "Shopify product image resizer", "ONDC seller tools", "online seller pricing calculator"],
    alternates: { canonical: homeUrl, languages: { "en-IN": homeUrl } },
    icons: { icon: `${origin}/favicon.svg` },
    manifest: `${origin}/manifest.webmanifest`,
    openGraph: { title, description, type: "website", url: homeUrl, siteName: "SellerPhoto Studio", locale: "en_IN", images: [{ url: socialImage, width: 1200, height: 630, alt: "SellerPhoto Studio product photo, video and forecasting suite" }] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>{children}<AnalyticsConsent /></body></html>;
}
