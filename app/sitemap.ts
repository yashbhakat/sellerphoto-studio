import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return [
    { url: origin + "/", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: origin + "/features/product-lifetime-forecasting/", lastModified: new Date(), changeFrequency: "monthly", priority: .9 },
    { url: origin + "/features/product-photo-video-studio/", lastModified: new Date(), changeFrequency: "monthly", priority: .9 },
    { url: origin + "/tools/marketplace-profit-calculator/", lastModified: new Date(), changeFrequency: "monthly", priority: .85 },
    { url: origin + "/tools/amazon-seller-profit-calculator-india/", lastModified: new Date(), changeFrequency: "monthly", priority: .9 },
    { url: origin + "/tools/flipkart-seller-profit-calculator-india/", lastModified: new Date(), changeFrequency: "monthly", priority: .9 },
    { url: origin + "/tools/meesho-profit-calculator/", lastModified: new Date(), changeFrequency: "monthly", priority: .9 },
    { url: origin + "/tools/quick-commerce-margin-calculator/", lastModified: new Date(), changeFrequency: "monthly", priority: .85 },
    { url: origin + "/resources/product-photo-size-guide/", lastModified: new Date(), changeFrequency: "monthly", priority: .75 },
    { url: origin + "/privacy/", lastModified: new Date(), changeFrequency: "yearly", priority: .2 },
  ];
}
