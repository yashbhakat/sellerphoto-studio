import type { Metadata } from "next";
import PlatformProfitGuide, { type PlatformProfitGuideConfig } from "../platform-profit-guide";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";
const purchaseHref = process.env.NEXT_PUBLIC_CHECKOUT_URL?.trim() || `${basePath}/#launch-offer`;
const purchaseApiUrl = process.env.NEXT_PUBLIC_FULFILMENT_API_URL?.trim().replace(/\/$/, "");
const path = "/tools/meesho-profit-calculator/";

export const metadata: Metadata = {
  title: "Meesho Profit Calculator for Sellers — Free India Tool",
  description: "Calculate Meesho seller profit, margin and break-even price after product cost, logistics, packaging, promotions, returns and expected order volume.",
  alternates: { canonical: `${siteUrl}${path}` },
  openGraph: { title: "Meesho Profit Calculator for Sellers", description: "Estimate per-order margin and monthly contribution with the costs shown in your Meesho supplier account.", url: `${siteUrl}${path}`, images: [`${siteUrl}/og.png`] },
  twitter: { card: "summary_large_image", title: "Meesho Seller Profit Calculator", description: "Free profit and break-even calculator for Meesho suppliers and sellers.", images: [`${siteUrl}/og.png`] },
};

const config: PlatformProfitGuideConfig = {
  platform: "Meesho",
  path,
  eyebrow: "Free Meesho seller calculator · India",
  title: "Meesho profit calculator for sellers.",
  intro: "Estimate Meesho profit per order, contribution margin, break-even selling price and monthly contribution. The model works even when a percentage charge is zero—enter the logistics, packaging, promotion and return costs that apply to your catalogue.",
  calculatorHeading: "Calculate your Meesho product profit.",
  calculatorIntro: "Use zero where a charge genuinely does not apply. Enter every recurring rupee cost and a realistic return assumption so a low headline fee does not hide weak unit economics.",
  costItems: [
    ["Product cost", "Include the complete cost of one sellable item, including sourcing or production, inbound movement, labels and preparation."],
    ["Applicable selling charges", "Enter the current percentage-based charge shown for your account and order type. Use zero only when your current terms genuinely show no such charge."],
    ["Logistics", "Use the shipping or logistics cost applicable to the product's weight, dimensions and delivery flow. Validate this with an actual settlement."],
    ["Packaging", "Include mailers, boxes, labels, protective material and the labour needed to prepare an order when that cost is meaningful."],
    ["Returns and RTO", "A returned or undelivered order can create reverse-logistics, handling, damage and resale losses. Model both frequency and average rupee impact."],
    ["Promotions and volume", "Discounting may lift orders while reducing contribution per order. Compare monthly rupee contribution at realistic volume, not only margin percentage."],
  ],
  workflow: [
    ["Begin with realised selling price", "Use the amount the customer actually pays after discounts, rather than a catalogue MRP that is rarely achieved."],
    ["Map the settlement", "Check a recent supplier settlement and separate percentage charges, logistics, packaging and return-related losses."],
    ["Model return pressure", "Test a higher return or RTO case before scaling inventory, especially when sizing, colour or customer expectation can vary."],
    ["Compare rupees, not slogans", "Evaluate profit per retained order and total monthly contribution even if one advertised platform charge is low or zero."],
  ],
  faqs: [
    ["Is this an official Meesho profit calculator?", "No. SellerPhoto Studio is independent and is not affiliated with Meesho. Use the current figures shown in your own supplier account and settlements."],
    ["Can I use the calculator if Meesho commission is zero?", "Yes. Set the platform percentage to zero and still include product, logistics, packaging, promotion and expected return or RTO costs."],
    ["How do I calculate Meesho profit after returns?", "Enter your expected return or non-retained-order rate and the average cost caused by each event. Historical catalogue data is more reliable than a generic benchmark."],
    ["Does it calculate GST, TDS or TCS?", "No. The tool estimates operating contribution. It does not replace settlement reconciliation, GST reporting or professional tax advice."],
    ["What should I do if the margin is negative?", "Review the realised price, sourcing cost, weight and packaging, return causes and promotion plan. Do not assume more order volume will fix a negative per-order contribution."],
  ],
};

export default function MeeshoProfitCalculatorPage() {
  return <PlatformProfitGuide config={config} siteUrl={siteUrl} basePath={basePath} purchaseHref={purchaseHref} purchaseApiUrl={purchaseApiUrl} />;
}
