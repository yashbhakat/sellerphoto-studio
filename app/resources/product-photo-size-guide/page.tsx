import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Product Photo Size Guide for Marketplaces & Quick Commerce",
  description: "A practical product image export guide for Amazon, Flipkart, Meesho, quick commerce, Shopify, Instagram, WhatsApp and D2C catalogues.",
  alternates: { canonical: `${siteUrl}/resources/product-photo-size-guide/` },
  openGraph: { title: "Product Photo Size Guide for Online Sellers", description: "Choose practical square, portrait, social and catalogue exports for each selling channel.", url: `${siteUrl}/resources/product-photo-size-guide/`, images: [`${siteUrl}/og.png`] },
  twitter: { card: "summary_large_image", title: "Product Photo Size Guide", description: "Practical export sizes and a reusable image checklist for online sellers.", images: [`${siteUrl}/og.png`] },
};

const guides = [
  ["Marketplace catalogue", "1500 × 1500 or 1200 × 1200", "Use a clean square canvas, consistent product scale, accurate colour and enough resolution for zoom. Keep the main image uncluttered where the channel requires it."],
  ["Quick commerce", "1200 × 1200", "Make the pack or product instantly recognisable at thumbnail size. Preserve label readability, honest quantity cues and strong separation from the background."],
  ["D2C / Shopify / ONDC", "1600 × 1600 plus supporting crops", "Export a high-resolution square hero and add detail, scale, ingredient, texture or use-case images where they help the buying decision."],
  ["Instagram / WhatsApp", "1080 × 1080, 1080 × 1350, 1080 × 1920", "Use square for catalogue reuse, portrait for feed visibility and 9:16 for Stories or Status. Keep important details away from interface overlays."],
];

export default function ProductPhotoSizeGuidePage() {
  return <main className="resource-page">
    <nav className="site-nav resource-nav shell"><a className="brand" href={`${basePath}/`}><span className="brand-mark">S</span><span>SellerPhoto Studio</span></a><a className="button button-small button-dark" href={`${basePath}/#demo`}>Format 3 photos</a></nav>
    <header className="resource-hero shell"><div className="eyebrow">Ecommerce product image guide</div><h1>One practical photo system for every channel.</h1><p>Start from a high-quality original, preserve an uncropped master and export channel-specific copies. Requirements change by category and platform, so always compare the final asset with the latest rule shown inside your seller portal.</p><div className="hero-actions"><a className="button button-primary" href={`${basePath}/#demo`}>Try the formatter</a><a className="text-link" href={`${basePath}/tools/marketplace-profit-calculator/`}>Calculate product profit →</a></div></header>
    <section className="resource-content shell"><div className="guide-grid">{guides.map(([title, size, text], index) => <article className="guide-card" key={title}><span>0{index + 1} · PRACTICAL STARTING EXPORT</span><h2>{title}</h2><p><strong>{size}</strong></p><p>{text}</p></article>)}</div></section>
  </main>;
}
