"use client";

import { useMemo, useState } from "react";

type ChannelKey = "marketplace" | "quick-commerce" | "d2c";

type Assumptions = {
  sellingPrice: number;
  productCost: number;
  platformFee: number;
  fulfilment: number;
  packaging: number;
  promotionRate: number;
  returnRate: number;
  returnCost: number;
  monthlyOrders: number;
};

type SellerEconomicsCalculatorProps = {
  defaultChannel?: ChannelKey;
  purchaseHref?: string;
  heading?: string;
  intro?: string;
};

const channelPresets: Record<ChannelKey, { label: string; note: string; assumptions: Assumptions }> = {
  marketplace: {
    label: "Marketplace",
    note: "Amazon, Flipkart, Meesho, Myntra and similar catalogue channels",
    assumptions: { sellingPrice: 799, productCost: 320, platformFee: 15, fulfilment: 65, packaging: 15, promotionRate: 5, returnRate: 8, returnCost: 110, monthlyOrders: 150 },
  },
  "quick-commerce": {
    label: "Quick commerce",
    note: "Blinkit, Zepto, Swiggy Instamart and other rapid-delivery channels",
    assumptions: { sellingPrice: 299, productCost: 128, platformFee: 18, fulfilment: 35, packaging: 10, promotionRate: 8, returnRate: 3, returnCost: 55, monthlyOrders: 500 },
  },
  d2c: {
    label: "D2C / social",
    note: "Shopify, ONDC, Instagram, WhatsApp and your own website or app",
    assumptions: { sellingPrice: 999, productCost: 390, platformFee: 3, fulfilment: 85, packaging: 22, promotionRate: 12, returnRate: 7, returnCost: 130, monthlyOrders: 120 },
  },
};

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

function cleanNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export default function SellerEconomicsCalculator({
  defaultChannel = "marketplace",
  purchaseHref = "/#launch-offer",
  heading = "Know the profit before you list.",
  intro = "Model one order, adjust the assumptions to match your agreement, and see the contribution left after common selling costs.",
}: SellerEconomicsCalculatorProps) {
  const [channel, setChannel] = useState<ChannelKey>(defaultChannel);
  const [assumptions, setAssumptions] = useState<Assumptions>(channelPresets[defaultChannel].assumptions);

  const result = useMemo(() => {
    const rateCosts = assumptions.platformFee + assumptions.promotionRate;
    const platformCost = assumptions.sellingPrice * (assumptions.platformFee / 100);
    const expectedReturnCost = assumptions.returnCost * (assumptions.returnRate / 100);
    const fixedCosts = assumptions.productCost + assumptions.fulfilment + assumptions.packaging + expectedReturnCost;
    const profitPerOrder = assumptions.sellingPrice - fixedCosts - platformCost - assumptions.sellingPrice * (assumptions.promotionRate / 100);
    const margin = assumptions.sellingPrice > 0 ? (profitPerOrder / assumptions.sellingPrice) * 100 : 0;
    const denominator = 1 - rateCosts / 100;
    const breakEvenPrice = denominator > 0 ? fixedCosts / denominator : 0;
    const monthlyProfit = profitPerOrder * assumptions.monthlyOrders;
    return { platformCost, expectedReturnCost, profitPerOrder, margin, breakEvenPrice, monthlyProfit };
  }, [assumptions]);

  const update = (key: keyof Assumptions, value: string) => setAssumptions((current) => ({ ...current, [key]: cleanNumber(value) }));
  const applyChannel = (nextChannel: ChannelKey) => { setChannel(nextChannel); setAssumptions(channelPresets[nextChannel].assumptions); };
  const health = result.margin >= 20 ? "Healthy room" : result.margin >= 8 ? "Watch the costs" : "Margin at risk";

  return (
    <div className="calculator-shell">
      <div className="calculator-intro">
        <div><div className="eyebrow eyebrow-dark">Free seller calculator</div><h2>{heading}</h2></div>
        <p>{intro}</p>
      </div>
      <div className="channel-tabs" aria-label="Selling channel assumptions">
        {(Object.keys(channelPresets) as ChannelKey[]).map((key) => (
          <button className={channel === key ? "channel-tab active" : "channel-tab"} key={key} type="button" aria-pressed={channel === key} onClick={() => applyChannel(key)}>
            <strong>{channelPresets[key].label}</strong><span>{channelPresets[key].note}</span>
          </button>
        ))}
      </div>
      <div className="calculator-grid">
        <div className="calculator-inputs">
          <label><span>Selling price</span><div className="money-input"><span>₹</span><input inputMode="decimal" type="number" min="0" value={assumptions.sellingPrice} onChange={(event) => update("sellingPrice", event.target.value)} /></div></label>
          <label><span>Product cost</span><div className="money-input"><span>₹</span><input inputMode="decimal" type="number" min="0" value={assumptions.productCost} onChange={(event) => update("productCost", event.target.value)} /></div></label>
          <label><span>Platform / payment fee</span><div className="money-input"><input inputMode="decimal" type="number" min="0" max="99" value={assumptions.platformFee} onChange={(event) => update("platformFee", event.target.value)} /><span>%</span></div></label>
          <label><span>Fulfilment / shipping</span><div className="money-input"><span>₹</span><input inputMode="decimal" type="number" min="0" value={assumptions.fulfilment} onChange={(event) => update("fulfilment", event.target.value)} /></div></label>
          <label><span>Packaging per order</span><div className="money-input"><span>₹</span><input inputMode="decimal" type="number" min="0" value={assumptions.packaging} onChange={(event) => update("packaging", event.target.value)} /></div></label>
          <label><span>Ads / promotions</span><div className="money-input"><input inputMode="decimal" type="number" min="0" max="99" value={assumptions.promotionRate} onChange={(event) => update("promotionRate", event.target.value)} /><span>%</span></div></label>
          <label><span>Return / wastage rate</span><div className="money-input"><input inputMode="decimal" type="number" min="0" max="100" value={assumptions.returnRate} onChange={(event) => update("returnRate", event.target.value)} /><span>%</span></div></label>
          <label><span>Cost per return / waste</span><div className="money-input"><span>₹</span><input inputMode="decimal" type="number" min="0" value={assumptions.returnCost} onChange={(event) => update("returnCost", event.target.value)} /></div></label>
          <label><span>Expected monthly orders</span><div className="money-input"><input inputMode="numeric" type="number" min="0" value={assumptions.monthlyOrders} onChange={(event) => update("monthlyOrders", event.target.value)} /><span>orders</span></div></label>
        </div>
        <aside className="calculator-results" aria-live="polite">
          <div className="result-status"><span>{health}</span><strong>{number.format(result.margin)}% margin</strong></div>
          <div className="result-primary"><span>Estimated profit per order</span><strong className={result.profitPerOrder < 0 ? "negative" : ""}>{currency.format(result.profitPerOrder)}</strong></div>
          <div className="result-grid">
            <div><span>Break-even price</span><strong>{currency.format(result.breakEvenPrice)}</strong></div>
            <div><span>Monthly contribution</span><strong className={result.monthlyProfit < 0 ? "negative" : ""}>{currency.format(result.monthlyProfit)}</strong></div>
            <div><span>Platform cost / order</span><strong>{currency.format(result.platformCost)}</strong></div>
            <div><span>Expected return cost</span><strong>{currency.format(result.expectedReturnCost)}</strong></div>
          </div>
          <p className="calculator-note">Starting values are illustrative, not fee quotes. Replace them with your current marketplace, fulfilment, tax and advertising terms before making a pricing decision.</p>
          <a className="button button-primary button-wide" href={purchaseHref}>Prepare the product photos <span>→</span></a>
        </aside>
      </div>
    </div>
  );
}
