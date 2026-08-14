import type { Metadata } from "next";
import SellerEconomicsCalculator from "../../seller-tools";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";
const purchaseHref = process.env.NEXT_PUBLIC_CHECKOUT_URL?.trim() || `${basePath}/#launch-offer`;

export const metadata: Metadata = {
  title: "Marketplace Profit Calculator for Indian Online Sellers",
  description: "Estimate profit per order, contribution margin and break-even selling price after marketplace fees, shipping, ads, packaging and returns.",
  alternates: { canonical: `${siteUrl}/tools/marketplace-profit-calculator/` },
  openGraph: { title: "Marketplace Profit Calculator for Indian Sellers", description: "Model marketplace fees, fulfilment, ads and returns before pricing a product.", url: `${siteUrl}/tools/marketplace-profit-calculator/`, images: [`${siteUrl}/og.png`] },
  twitter: { card: "summary_large_image", title: "Marketplace Profit Calculator", description: "Check per-order profit and break-even price before you list.", images: [`${siteUrl}/og.png`] },
};

export default function MarketplaceProfitCalculatorPage() {
  return <main className="resource-page">
    <nav className="site-nav resource-nav shell"><a className="brand" href={`${basePath}/`}><span className="brand-mark">S</span><span>SellerPhoto Studio</span></a><a className="button button-small button-dark" href={`${basePath}/#demo`}>Try photo studio</a></nav>
    <header className="resource-hero shell"><div className="eyebrow">Free ecommerce seller tool</div><h1>Marketplace profit calculator for Indian sellers.</h1><p>Estimate profit per order and monthly contribution after product cost, platform fees, fulfilment, packaging, advertising and expected returns. Use your own current fee agreement for the most useful result.</p><div className="hero-actions"><a className="text-link" href={`${basePath}/resources/product-photo-size-guide/`}>Product photo size guide →</a><a className="text-link" href={`${basePath}/tools/quick-commerce-margin-calculator/`}>Quick-commerce calculator →</a></div></header>
    <section className="resource-content shell"><SellerEconomicsCalculator purchaseHref={purchaseHref} heading="Price the SKU with the full cost picture." intro="Start with a broad marketplace example, then enter the actual numbers for your category, fulfilment method and advertising plan." /></section>
  </main>;
}
