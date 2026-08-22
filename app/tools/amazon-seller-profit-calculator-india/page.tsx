import type { Metadata } from "next";
import PlatformProfitGuide, { type PlatformProfitGuideConfig } from "../platform-profit-guide";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";
const purchaseHref = process.env.NEXT_PUBLIC_CHECKOUT_URL?.trim() || `${basePath}/#launch-offer`;
const purchaseApiUrl = process.env.NEXT_PUBLIC_FULFILMENT_API_URL?.trim().replace(/\/$/, "");
const path = "/tools/amazon-seller-profit-calculator-india/";

export const metadata: Metadata = {
  title: "Amazon Seller Profit Calculator India — Free Margin Tool",
  description: "Calculate Amazon seller profit in India after product cost, marketplace fees, fulfilment, shipping, packaging, ads and expected returns.",
  alternates: { canonical: `${siteUrl}${path}` },
  openGraph: { title: "Amazon Seller Profit Calculator India", description: "Estimate per-order margin, break-even price and monthly contribution using your current Amazon seller costs.", url: `${siteUrl}${path}`, images: [`${siteUrl}/og.png`] },
  twitter: { card: "summary_large_image", title: "Amazon Seller Profit Calculator India", description: "Free margin and break-even calculator for Amazon sellers in India.", images: [`${siteUrl}/og.png`] },
};

const config: PlatformProfitGuideConfig = {
  platform: "Amazon",
  path,
  eyebrow: "Free Amazon seller calculator · India",
  title: "Amazon seller profit calculator for India.",
  intro: "Estimate profit per order, contribution margin, break-even selling price and monthly contribution for an Amazon India product. Enter the current charges from your category and fulfilment setup instead of relying on a generic fee claim.",
  calculatorHeading: "Calculate your Amazon product margin.",
  calculatorIntro: "Treat platform fee as the combined percentage-based marketplace charge you want to model, and add per-order fulfilment, shipping, packaging, advertising and expected return costs separately.",
  costItems: [
    ["Product landed cost", "Include purchase or manufacturing cost, inbound freight, duties where applicable and the cost required to make one sellable unit available."],
    ["Amazon account charges", "Use the current referral, closing or other selling charges shown for your category and price band. Convert percentage charges into the platform-fee field."],
    ["Fulfilment and shipping", "Enter the per-order cost for your chosen fulfilment route. Storage, removal and long-term inventory exposure should be reviewed separately when relevant."],
    ["Advertising", "Use ad spend as a percentage of sales for a planning estimate, then compare it with actual attributed sales and total advertising cost after launch."],
    ["Returns and refunds", "Model both the expected return rate and the average handling, reverse-logistics, damage or non-recoverable cost created by one return."],
    ["Packaging and overhead", "Add packaging directly. Keep salaries, software, warehousing and other fixed overhead visible when deciding whether monthly contribution is genuinely sufficient."],
  ],
  workflow: [
    ["Start with a seller statement", "Take one recent settled order from the closest product category and map every recurring charge into the calculator."],
    ["Run a conservative case", "Increase ad and return assumptions, reduce volume and check whether the SKU still earns an acceptable rupee contribution."],
    ["Set a break-even guardrail", "Compare the calculated break-even price with coupons, promotions and competitor pricing before approving a discount."],
    ["Replace assumptions weekly", "After launch, update the model with actual selling price, ad rate, return cost and monthly order volume."],
  ],
  faqs: [
    ["Is this an official Amazon fee calculator?", "No. SellerPhoto Studio is independent and is not affiliated with Amazon. Use the calculator with the current fees and settlement data shown in your Amazon seller account."],
    ["Does the calculator work for FBA and seller-fulfilled orders?", "Yes, as a planning model. Enter the per-order fulfilment and shipping cost that matches your actual route, and account separately for storage or removal costs when they materially affect the SKU."],
    ["How should I enter Amazon advertising cost?", "Enter an expected advertising percentage of revenue. For an existing product, use a recent blended rate that reflects the relationship between ad spend and total product sales, not only a single campaign screenshot."],
    ["Does this calculate GST or income tax?", "No. The free calculator focuses on operating contribution per order. Keep tax treatment consistent across selling price and cost inputs, and use professional tax advice for your business."],
    ["What is a good Amazon profit margin?", "There is no universal target. A viable margin must cover fixed overhead, cash tied in inventory, returns, price changes and the risk in your category. Compare rupee contribution and cash needs as well as the percentage."],
  ],
};

export default function AmazonSellerProfitCalculatorPage() {
  return <PlatformProfitGuide config={config} siteUrl={siteUrl} basePath={basePath} purchaseHref={purchaseHref} purchaseApiUrl={purchaseApiUrl} />;
}
