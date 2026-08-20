import type { Metadata } from "next";
import { PRODUCT } from "../../../config/product.mjs";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Product Revenue & Profit Forecasting Calculator",
  description: "Forecast ecommerce product lifetime revenue, net profit, monthly cash flow, break-even, ROI, returns, inventory and demand scenarios for up to 60 months.",
  keywords: ["product revenue forecasting calculator", "ecommerce profit forecast", "product lifetime sales projection", "Amazon seller forecasting tool", "quick commerce revenue calculator", "D2C product profitability model"],
  alternates: { canonical: siteUrl + "/features/product-lifetime-forecasting/" },
  openGraph: { title: "Product Lifetime Revenue & Profit Forecasting", description: "Model a product from launch demand to lifetime profit, cash breakeven and scenario risk.", url: siteUrl + "/features/product-lifetime-forecasting/", images: [siteUrl + "/og.png"] },
  twitter: { card: "summary_large_image", title: "Product Lifetime Forecasting for Online Sellers", description: "Revenue, profit, cash-flow, ROI, scenarios and sensitivity in one offline planning lab.", images: [siteUrl + "/og.png"] },
};

const metrics = [
  ["12–60 months", "Choose a practical forecast horizon from the launch phase through maturity and decline."],
  ["3 scenarios", "Compare conservative, base and aggressive demand, price, cost and advertising assumptions."],
  ["9 sensitivity cases", "See how lifetime profit changes across lower, base and higher demand and selling price."],
  ["Monthly cash flow", "Track working capital, launch cost, operating profit, estimated tax and cash breakeven."],
];

const modelInputs = [
  "Launch units, ramp growth and mature growth", "Lifecycle decline timing and rate", "Seasonality strength and annual peak month",
  "Selling price and annual price erosion", "Product, fulfilment and packaging costs", "Annual cost inflation",
  "Platform fees and advertising as a share of revenue", "Return or wastage rate and handling cost",
  "Launch cost, fixed overhead and estimated profit tax", "Inventory cover and target lifetime profit",
];

export default function ProductLifetimeForecastingPage() {
  const schema = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", name: "SellerPhoto Studio Product Lifecycle Forecast Lab",
    applicationCategory: "BusinessApplication", operatingSystem: "Any modern web browser",
    description: "A product lifetime revenue, profit, cash-flow, scenario and sensitivity forecasting tool for online sellers.",
    offers: { "@type": "Offer", price: String(PRODUCT.priceInr), priceCurrency: PRODUCT.currency }, url: siteUrl + "/features/product-lifetime-forecasting/",
  };
  return <main className="resource-page feature-detail-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <nav className="site-nav resource-nav shell"><a className="brand" href={basePath + "/"}><span className="brand-mark">S</span><span>SellerPhoto Studio</span></a><a className="button button-small button-dark" href={basePath + "/#launch-offer"}>Get Pro</a></nav>
    <header className="resource-hero feature-detail-hero shell"><div className="eyebrow">Paid analytics · Forecast lab</div><h1>Forecast a product from first stock to lifetime profit.</h1><p>Build a month-by-month commercial model for a marketplace, quick-commerce or D2C product. Test demand, pricing, returns, fees, advertising, costs and inventory before committing more cash.</p><div className="hero-actions"><a className="button button-primary" href={basePath + "/#launch-offer"}>Get the ₹{PRODUCT.priceInr} Pro suite</a><a className="text-link" href={basePath + "/tools/marketplace-profit-calculator/"}>Try the free unit calculator →</a></div></header>

    <section className="feature-detail-band"><div className="shell detail-metric-grid">{metrics.map(([number, text]) => <article key={number}><strong>{number}</strong><p>{text}</p></article>)}</div></section>

    <section className="shell feature-detail-content">
      <div className="detail-copy"><span className="section-kicker">Model the full commercial lifecycle</span><h2>Launch, ramp, maturity, seasonality and decline.</h2><p>A one-order calculator cannot show when inventory cash returns, how annual price erosion affects contribution, or whether a product still works after costs rise. The Forecast Lab connects those decisions in one model.</p><p>It calculates lifetime revenue and net profit after launch cost, monthly operating profit, cumulative cash, estimated tax, return burden, peak sales month, operating break-even units, target profit gap and return on initial cash.</p></div>
      <aside className="detail-checklist"><h3>Assumptions you control</h3><ul>{modelInputs.map((item) => <li key={item}>{item}</li>)}</ul></aside>
    </section>

    <section className="shell decision-grid">
      <article><span>01</span><h2>Build the base case</h2><p>Start with your expected launch demand and true per-order economics. The model compounds demand and adjusts price and costs month by month.</p></article>
      <article><span>02</span><h2>Stress-test the plan</h2><p>Compare conservative and aggressive cases, then use the nine-cell price-demand sensitivity grid to reveal how much downside the SKU can absorb.</p></article>
      <article><span>03</span><h2>Export the decision</h2><p>Download a detailed CSV or print the forecast report. After launch, replace assumptions with actual seller data and rerun the model.</p></article>
    </section>

    <section className="shell feature-disclaimer"><strong>Important planning note</strong><p>The Forecast Lab is an assumption-driven planning tool, not a guarantee of demand, sales or profit and not financial advice. Marketplace terms, taxes and category economics vary. Validate inputs against your agreements and actual performance.</p></section>
    <section className="feature-detail-cta"><div className="shell"><div><span>Included in SellerPhoto Studio Pro {PRODUCT.version}</span><h2>Forecast the economics. Then build the media.</h2></div><a className="button button-primary" href={basePath + "/#launch-offer"}>Get the full Pro suite →</a></div></section>
  </main>;
}
