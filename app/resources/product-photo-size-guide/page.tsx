import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Amazon, Flipkart & Meesho Product Image Size Guide",
  description: "Practical product image sizes and export checks for Amazon, Flipkart, Meesho, quick commerce, Shopify, Instagram, WhatsApp and D2C sellers.",
  alternates: { canonical: `${siteUrl}/resources/product-photo-size-guide/` },
  openGraph: { title: "Product Photo Size Guide for Online Sellers", description: "Choose practical square, portrait, social and catalogue exports for each selling channel.", url: `${siteUrl}/resources/product-photo-size-guide/`, images: [`${siteUrl}/og.png`] },
  twitter: { card: "summary_large_image", title: "Product Photo Size Guide", description: "Practical export sizes and a reusable image checklist for online sellers.", images: [`${siteUrl}/og.png`] },
};

const guides = [
  ["Amazon product images", "Practical start: 1500 × 1500", "Keep a high-resolution square master, use accurate colour and leave enough product detail for zoom. For the main image, verify the current category-specific background, framing and permitted-content rules in Seller Central."],
  ["Flipkart product images", "Practical start: 1500 × 1500", "Use a clean square export with consistent scale and a sharp source. Check the latest dimensions, background and permitted-overlay rules shown for the listing category inside Seller Hub."],
  ["Meesho catalogue images", "Practical start: 1200 × 1200", "Prepare a clear square catalogue image that remains readable at thumbnail size. Preserve an uncropped original and confirm the current supplier-panel rules before upload."],
  ["Quick commerce", "1200 × 1200", "Make the pack or product instantly recognisable at thumbnail size. Preserve label readability, honest quantity cues and strong separation from the background."],
  ["D2C / Shopify / ONDC", "1600 × 1600 plus supporting crops", "Export a high-resolution square hero and add detail, scale, ingredient, texture or use-case images where they help the buying decision."],
  ["Instagram / WhatsApp", "1080 × 1080, 1080 × 1350, 1080 × 1920", "Use square for catalogue reuse, portrait for feed visibility and 9:16 for Stories or Status. Keep important details away from interface overlays."],
];

const faqs = [
  ["What size should Amazon product images be?", "A 1500 × 1500 square export is a practical high-resolution starting point for many catalogue workflows, but Amazon requirements can vary by category and placement. Confirm the current rule in Seller Central before publishing."],
  ["What image size should I use for Flipkart?", "A sharp 1500 × 1500 square master gives useful editing room and a consistent catalogue starting point. Verify the current category-specific size, background and content rules in Flipkart Seller Hub."],
  ["Can I use one product image on every marketplace?", "Keep one high-quality master, then export a copy for each channel. Aspect ratio, background, product occupancy, overlays and supporting-image rules can differ."],
  ["Does SellerPhoto Studio remove product backgrounds?", "No. The current edition formats the original photo onto consistent catalogue canvases and controls spacing, tone and optional overlays. It does not claim AI background removal."],
];

export default function ProductPhotoSizeGuidePage() {
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", headline: "Amazon, Flipkart and Meesho Product Image Size Guide", description: metadata.description, mainEntityOfPage: `${siteUrl}/resources/product-photo-size-guide/`, inLanguage: "en-IN", author: { "@type": "Organization", name: "SellerPhoto Studio" }, publisher: { "@type": "Organization", name: "SellerPhoto Studio" } };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };
  return <main className="resource-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <nav className="site-nav resource-nav shell"><a className="brand" href={`${basePath}/`}><span className="brand-mark">S</span><span>SellerPhoto Studio</span></a><a className="button button-small button-dark" href={`${basePath}/#demo`}>Format 3 photos</a></nav>
    <header className="resource-hero shell"><div className="eyebrow">Ecommerce product image guide · India</div><h1>Product image size guide for Amazon, Flipkart, Meesho and more.</h1><p>Start from a high-quality original, preserve an uncropped master and export channel-specific copies. Requirements change by category and platform, so always compare the final asset with the latest rule shown inside your seller portal.</p><div className="hero-actions"><a className="button button-primary" href={`${basePath}/#demo`}>Try the formatter</a><a className="text-link" href={`${basePath}/tools/marketplace-profit-calculator/`}>Calculate product profit →</a></div></header>
    <section className="resource-content shell"><div className="guide-grid">{guides.map(([title, size, text], index) => <article className="guide-card" key={title}><span>0{index + 1} · PRACTICAL STARTING EXPORT</span><h2>{title}</h2><p><strong>{size}</strong></p><p>{text}</p></article>)}</div></section>
    <section className="platform-faq-section shell"><div><span>Product image questions</span><h2>Marketplace image size FAQ.</h2></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
  </main>;
}
