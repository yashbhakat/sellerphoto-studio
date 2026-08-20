import type { Metadata } from "next";
import { PRODUCT } from "../../../config/product.mjs";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Marketplace Product Photo Editor & Video Maker",
  description: "Prepare marketplace product photos with platform presets and feature toggles, then turn catalogue images into short product videos on your device.",
  keywords: ["marketplace product photo editor", "product video maker for ecommerce", "Amazon listing image editor India", "Flipkart photo size editor", "Meesho catalogue photo maker", "product photo compliance checker", "offline product video generator"],
  alternates: { canonical: siteUrl + "/features/product-photo-video-studio/" },
  openGraph: { title: "Product Photo Compliance Studio & Video Maker", description: "Batch product images, inspect likely upload issues and create short catalogue videos without uploading media.", url: siteUrl + "/features/product-photo-video-studio/", images: [siteUrl + "/og.png"] },
  twitter: { card: "summary_large_image", title: "Product Photo & Video Studio for Sellers", description: "On-device image presets, compliance checks, feature toggles and product-video generation.", images: [siteUrl + "/og.png"] },
};

const imageControls = [
  "Compliance guard", "Background canvas", "Fit or fill", "Product spacing", "Brightness, contrast and saturation",
  "Product shadow", "Rotation", "Price badge", "Store watermark", "Logo overlay", "Safe-zone guide", "Catalogue manifest", "JPG or PNG quality",
];
const videoControls = [
  "9:16, 1:1, 4:5 and 16:9 formats", "One to eight seconds per scene", "24 or 30 fps export", "Pan and zoom motion",
  "Fade or slide transitions", "Editable scene captions", "Price and call-to-action", "Brand logo", "Optional local music", "Preview-only safe-zone guides",
];

export default function ProductPhotoVideoStudioPage() {
  const schema = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: "SellerPhoto Studio Product Photo and Video Studio",
    applicationCategory: "MultimediaApplication", operatingSystem: "Any modern web browser",
    description: "An on-device batch product photo editor, pre-upload inspector and short product video generator for online sellers.",
    offers: { "@type": "Offer", price: String(PRODUCT.priceInr), priceCurrency: PRODUCT.currency }, url: siteUrl + "/features/product-photo-video-studio/",
  };
  return <main className="resource-page feature-detail-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <nav className="site-nav resource-nav shell"><a className="brand" href={basePath + "/"}><span className="brand-mark">S</span><span>SellerPhoto Studio</span></a><a className="button button-small button-dark" href={basePath + "/#launch-offer"}>Get Pro</a></nav>
    <header className="resource-hero feature-detail-hero shell"><div className="eyebrow">Paid media tools · Image + video</div><h1>One controlled media workflow for every product listing.</h1><p>Prepare consistent product images with conservative channel presets and switchable treatments, inspect likely upload problems, then turn the same catalogue photos into short product videos.</p><div className="hero-actions"><a className="button button-primary" href={basePath + "/#launch-offer"}>Get the ₹{PRODUCT.priceInr} Pro suite</a><a className="text-link" href={basePath + "/#demo"}>Try 3 photos free →</a></div></header>

    <section className="feature-detail-band"><div className="shell detail-metric-grid"><article><strong>50</strong><p>Photos per batch with one consistent setup.</p></article><article><strong>9</strong><p>Channel and placement image presets.</p></article><article><strong>13</strong><p>Image treatments and operations with direct controls.</p></article><article><strong>12</strong><p>Product scenes per generated video.</p></article></div></section>

    <section className="shell media-detail-grid">
      <article><div className="detail-label">IMAGE STUDIO</div><h2>Format, inspect and export the catalogue.</h2><p>Choose a practical starting preset for Amazon, Flipkart, Meesho, Myntra, quick commerce, Shopify, Instagram, Stories or custom dimensions. For strict main-image modes, Compliance Guard can force a white canvas and suppress risky promotional overlays.</p><h3>Every image capability has a control</h3><ul>{imageControls.map((item) => <li key={item}>{item}</li>)}</ul><p className="detail-note">The six-point inspector reviews aspect ratio, output resolution, background, overlay risk, estimated occupancy and source resolution. It is a pre-upload aid—not marketplace certification.</p></article>
      <article><div className="detail-label">VIDEO STUDIO</div><h2>Build channel-ready motion from product photos.</h2><p>Arrange up to 12 images on a scene timeline, edit a selling point for each frame and preview the complete sequence before creating a local WebM file.</p><h3>Switch every creative layer on or off</h3><ul>{videoControls.map((item) => <li key={item}>{item}</li>)}</ul><p className="detail-note">WebM works in modern browsers and many web destinations. Convert the exported file to MP4 when a particular marketplace or social upload portal requires MP4.</p></article>
    </section>

    <section className="shell decision-grid">
      <article><span>01</span><h2>Choose the destination</h2><p>Start with the channel and placement so the canvas, aspect ratio and safe-zone are decided before styling.</p></article>
      <article><span>02</span><h2>Use only the layers you need</h2><p>Every optional treatment has a visible toggle. Strict marketplace images can remain clean while owned-channel assets carry pricing and branding.</p></article>
      <article><span>03</span><h2>Export privately</h2><p>Photos, logos and audio are processed on the device. Download the image ZIP, manifest and product video without a media upload.</p></article>
    </section>

    <section className="shell feature-disclaimer"><strong>Platform requirements change</strong><p>Presets are conservative workflow starting points, not certification. Always review the current requirements inside your marketplace account and category before publishing an image or video.</p></section>
    <section className="feature-detail-cta"><div className="shell"><div><span>Included in SellerPhoto Studio Pro {PRODUCT.version}</span><h2>Build the image. Add motion. Forecast the SKU.</h2></div><a className="button button-primary" href={basePath + "/#launch-offer"}>Get the full Pro suite →</a></div></section>
  </main>;
}
