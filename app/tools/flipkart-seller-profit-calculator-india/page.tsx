import type { Metadata } from "next";
import PlatformProfitGuide, { type PlatformProfitGuideConfig } from "../platform-profit-guide";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";
const purchaseHref = process.env.NEXT_PUBLIC_CHECKOUT_URL?.trim() || `${basePath}/#launch-offer`;
const purchaseApiUrl = process.env.NEXT_PUBLIC_FULFILMENT_API_URL?.trim().replace(/\/$/, "");
const path = "/tools/flipkart-seller-profit-calculator-india/";

export const metadata: Metadata = {
  title: "Flipkart Seller Profit Calculator India — Free Margin Tool",
  description: "Estimate Flipkart seller profit, margin and break-even price after product cost, marketplace charges, shipping, packaging, ads and returns.",
  alternates: { canonical: `${siteUrl}${path}` },
  openGraph: { title: "Flipkart Seller Profit Calculator India", description: "Model per-order profit and monthly contribution using the current charges in your Flipkart seller account.", url: `${siteUrl}${path}`, images: [`${siteUrl}/og.png`] },
  twitter: { card: "summary_large_image", title: "Flipkart Seller Profit Calculator India", description: "Free margin and break-even calculator for Flipkart sellers.", images: [`${siteUrl}/og.png`] },
};

const config: PlatformProfitGuideConfig = {
  platform: "Flipkart",
  path,
  eyebrow: "Free Flipkart seller calculator · India",
  title: "Flipkart seller profit calculator for India.",
  intro: "Check profit per order, contribution margin, break-even price and expected monthly contribution for a Flipkart product. Use the latest category, shipping and account charges visible in your seller portal.",
  calculatorHeading: "Calculate your Flipkart seller margin.",
  calculatorIntro: "Combine percentage-based selling charges in the platform-fee field, then enter fulfilment or shipping, packaging, promotions and expected return costs as separate assumptions.",
  costItems: [
    ["Landed product cost", "Start with the cost of one sellable unit after manufacturing or purchase, inbound movement and any preparation required before listing."],
    ["Marketplace charges", "Use the current commission and other applicable selling charges from your category and commercial terms. Do not copy an old percentage from a blog."],
    ["Shipping and fulfilment", "Enter the per-order logistics amount that matches the product weight, dimensions, service profile and fulfilment arrangement you actually use."],
    ["Discounts and ads", "A funded discount or advertising plan reduces the contribution available to cover overhead. Model it as a share of realised selling revenue."],
    ["Returns and RTO exposure", "Estimate the probability and average handling loss from customer returns, reverse movement, damage and orders that do not convert into retained sales."],
    ["Packaging and fixed costs", "Include per-order packaging in the tool, then test whether monthly contribution can also support team, rent, software, warehousing and working-capital costs."],
  ],
  workflow: [
    ["Reconcile one real order", "Use a recent order settlement from a similar category to identify percentage charges and per-order costs without double counting."],
    ["Test the promotion price", "Enter the lowest price you expect during promotions and check whether contribution stays positive after ads and returns."],
    ["Stress-test logistics", "Increase fulfilment and return cost for heavier, fragile or distant deliveries to understand the downside before scaling."],
    ["Review by SKU", "Different products can carry very different economics. Save an assumption set for each important SKU and update it with actuals."],
  ],
  faqs: [
    ["Is this an official Flipkart seller calculator?", "No. SellerPhoto Studio is independent and is not affiliated with Flipkart. Enter the current charges and settlement values from your own seller account."],
    ["Can I calculate Flipkart profit after shipping?", "Yes. Put the applicable per-order shipping or fulfilment amount in the fulfilment field, and keep packaging separate so you can see which cost is changing."],
    ["How do I model Flipkart returns?", "Enter the expected return or non-retained-order rate and the average rupee loss created by one such order. Use your own historical rate when available."],
    ["Does this include GST and TDS/TCS?", "No. This is an operating contribution calculator, not a tax or settlement reconciliation tool. Keep inputs on a consistent tax basis and consult your accountant for statutory treatment."],
    ["Why is monthly contribution different from revenue?", "Revenue is selling price multiplied by retained orders. Contribution is what remains after the variable product, platform, logistics, packaging, promotion and expected return costs entered here."],
  ],
};

export default function FlipkartSellerProfitCalculatorPage() {
  return <PlatformProfitGuide config={config} siteUrl={siteUrl} basePath={basePath} purchaseHref={purchaseHref} purchaseApiUrl={purchaseApiUrl} />;
}
