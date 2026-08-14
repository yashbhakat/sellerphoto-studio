import type { Metadata } from "next";
import SellerEconomicsCalculator from "../../seller-tools";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";
const purchaseHref = process.env.NEXT_PUBLIC_CHECKOUT_URL?.trim() || `${basePath}/#launch-offer`;

export const metadata: Metadata = {
  title: "Quick Commerce Margin Calculator for Brands in India",
  description: "Model quick-commerce unit economics including platform fees, fulfilment, promotions, packaging, returns or wastage and monthly order volume.",
  alternates: { canonical: `${siteUrl}/tools/quick-commerce-margin-calculator/` },
  openGraph: { title: "Quick Commerce Margin Calculator", description: "Estimate per-order contribution for rapid-delivery platforms using your own commercial terms.", url: `${siteUrl}/tools/quick-commerce-margin-calculator/`, images: [`${siteUrl}/og.png`] },
  twitter: { card: "summary_large_image", title: "Quick Commerce Margin Calculator", description: "Model fees, fulfilment, promotions and wastage before onboarding a SKU.", images: [`${siteUrl}/og.png`] },
};

export default function QuickCommerceMarginCalculatorPage() {
  return <main className="resource-page">
    <nav className="site-nav resource-nav shell"><a className="brand" href={`${basePath}/`}><span className="brand-mark">S</span><span>SellerPhoto Studio</span></a><a className="button button-small button-dark" href={`${basePath}/#demo`}>Try photo studio</a></nav>
    <header className="resource-hero shell"><div className="eyebrow">Free quick-commerce seller tool</div><h1>Check quick-commerce margin before the SKU goes live.</h1><p>Rapid delivery can add fulfilment, promotion and wastage pressure. Model those assumptions for Blinkit, Zepto, Swiggy Instamart or another channel without relying on a generic fee promise.</p><div className="hero-actions"><a className="text-link" href={`${basePath}/resources/product-photo-size-guide/`}>Quick-commerce image guide →</a><a className="text-link" href={`${basePath}/tools/marketplace-profit-calculator/`}>Marketplace calculator →</a></div></header>
    <section className="resource-content shell"><SellerEconomicsCalculator defaultChannel="quick-commerce" purchaseHref={purchaseHref} heading="Model rapid-delivery unit economics." intro="Adjust the example to your category, city, commercial agreement, fulfilment model, promotion plan and wastage risk." /></section>
  </main>;
}
