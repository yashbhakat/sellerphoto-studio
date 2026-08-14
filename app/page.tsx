import type { Metadata } from "next";
import SellerEconomicsCalculator from "./seller-tools";

export const metadata: Metadata = {
  title: "Product Photo Editor & Seller Tools for Ecommerce India",
  description: "Create marketplace-ready product photos, calculate profit and plan listings for Amazon, Flipkart, Meesho, quick commerce, D2C stores and social selling.",
};

const configuredCheckoutUrl = process.env.NEXT_PUBLIC_CHECKOUT_URL?.trim();
const checkoutUrl = configuredCheckoutUrl || "#launch-offer";
const checkoutReady = Boolean(configuredCheckoutUrl);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";
const checkoutTarget = checkoutReady ? "_blank" : undefined;
const checkoutRel = checkoutReady ? "noopener noreferrer" : undefined;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

const faqs = [
  ["Are my product photos uploaded anywhere?", "No. Photo processing happens inside your browser. The full edition can also run offline after download."],
  ["Can I use the seller profit calculator for quick commerce?", "Yes. Choose the quick-commerce assumptions, then replace every fee, fulfilment, promotion and wastage value with the terms from your own agreement."],
  ["Which selling channels are supported?", "The image presets and seller tools are useful for Amazon, Flipkart, Meesho, Myntra, Blinkit, Zepto, Swiggy Instamart, Shopify, ONDC, Instagram, WhatsApp and independent stores."],
  ["Does SellerPhoto Studio remove backgrounds with AI?", "Not in the current edition. It creates consistent catalogue canvases and controls how each original photo fits inside them."],
  ["What devices does it support?", "Current versions of Chrome, Edge, Firefox and Safari on phones, tablets, laptops and desktops."],
  ["Is the full edition a subscription?", "No. The launch edition is a one-time download with no per-image or recurring usage fee."],
];

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SellerPhoto Studio",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any modern web browser",
  url: siteUrl,
  image: `${siteUrl}/og.png`,
  inLanguage: "en-IN",
  publisher: { "@type": "Organization", name: "SellerPhoto Studio", url: siteUrl },
  description: "A private product-photo formatter and ecommerce seller toolkit for Indian marketplace, quick-commerce, D2C and social sellers.",
  offers: { "@type": "Offer", price: "499", priceCurrency: "INR", availability: "https://schema.org/InStock", url: checkoutReady ? checkoutUrl : `${siteUrl}/#launch-offer` },
  featureList: ["Batch product-photo formatting", "Marketplace and quick-commerce image presets", "Seller profit and pricing calculator", "On-device processing", "Logo, watermark, price badge, SKU-friendly naming and ZIP export"],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
};

const features = [
  ["01", "Batch-ready", "Format a complete product set with one consistent treatment instead of editing photos one by one."],
  ["02", "Channel presets", "Prepare square, portrait, story, marketplace and quick-commerce-ready outputs without memorising dimensions."],
  ["03", "Brand controls", "Add a logo, store name, price badge, colours, margins and watermark once for the entire batch."],
  ["04", "SKU-friendly exports", "Keep cleaner filenames and download every finished product photo inside one organised ZIP."],
  ["05", "Seller economics", "Check profit per order, break-even price, contribution margin, promotions and return allowance before listing."],
  ["06", "Private by design", "Photos stay on your device. There are no accounts, uploads or recurring AI-processing charges."],
];

const toolCards = [
  ["Profit calculator", "Price marketplace products after fees, fulfilment, ads and expected returns.", `${basePath}/tools/marketplace-profit-calculator/`, "Calculate profit"],
  ["Quick-commerce margin", "Model platform charges, promotions, fulfilment and wastage for rapid-delivery channels.", `${basePath}/tools/quick-commerce-margin-calculator/`, "Check unit economics"],
  ["Product image guide", "Choose practical export sizes for marketplaces, quick commerce, D2C and social catalogues.", `${basePath}/resources/product-photo-size-guide/`, "Open size guide"],
  ["3-photo formatter", "Test the private batch workflow in your browser before buying the 50-photo edition.", "#demo", "Try the studio"],
];

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <nav className="site-nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="SellerPhoto Studio home"><span className="brand-mark" aria-hidden="true">S</span><span>SellerPhoto Studio</span></a>
        <div className="nav-links"><a href="#seller-hub">Seller tools</a><a href="#demo">Photo studio</a><a data-checkout-link className="button button-small button-dark" href={checkoutUrl} target={checkoutTarget} rel={checkoutRel}>Get Pro</a></div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> Built for online sellers in India</div>
          <h1>Better product photos. <em>Clearer profit.</em></h1>
          <p className="hero-lede">Format, brand and export product images—then calculate the real margin—for marketplaces, quick commerce, D2C sites, apps and social selling. Your photos never leave your device.</p>
          <div className="hero-actions"><a className="button button-primary" href="#demo">Try 3 photos free <span>↓</span></a><a className="text-link" href="#seller-hub">Explore free seller tools <span>→</span></a></div>
          <div className="proof-row" aria-label="Product benefits"><span>✓ No sign-up</span><span>✓ Mobile-friendly</span><span>✓ Works offline</span><span>✓ One-time Pro purchase</span></div>
        </div>
        <div className="hero-visual" aria-label="Before and after ecommerce product photography">
          <div className="visual-grid"><img src={`${basePath}/hero-marketplace.jpg`} width="1536" height="1024" fetchPriority="high" decoding="async" alt="Products arranged for a clean ecommerce catalogue" /></div>
          <div className="photo-card photo-before"><div className="card-label">Phone photo</div><img className="product-photo product-photo-before" src={`${basePath}/seller-bag.jpg`} width="1254" height="1254" loading="lazy" decoding="async" alt="Original product photo of an orange crossbody bag" /><span className="scribble">camera roll</span></div>
          <div className="photo-card photo-after"><div className="card-label card-label-dark">Ready to list</div><div className="price-chip">₹799</div><img className="product-photo product-photo-after" src={`${basePath}/seller-bag.jpg`} width="1254" height="1254" loading="lazy" decoding="async" alt="Marketplace-ready product image of an orange crossbody bag" /><div className="mini-brand">YOUR STORE</div></div>
          <div className="batch-chip"><strong>12</strong><span>photos ready</span></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Relevant ecommerce channels"><div className="shell trust-inner"><span>SELL ACROSS</span><strong>AMAZON</strong><strong>FLIPKART</strong><strong>MEESHO</strong><strong>MYNTRA</strong><strong>BLINKIT</strong><strong>ZEPTO</strong><strong>INSTAMART</strong><strong>SHOPIFY</strong><strong>ONDC</strong></div></section>

      <section className="seller-hub-section" id="seller-hub">
        <div className="shell section-heading split-heading"><div><div className="eyebrow">Seller operations hub</div><h2>From camera roll<br />to <em>commercially ready.</em></h2></div><p>Free tools help you prepare the listing and understand the unit economics. SellerPhoto Studio Pro removes the repetitive image work when you are ready to scale.</p></div>
        <div className="shell tool-card-grid">
          {toolCards.map(([title, text, href, action], index) => <article className="tool-card" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p><a href={href}>{action} <span>→</span></a></article>)}
        </div>
      </section>

      <section className="calculator-section" id="profit-calculator"><div className="shell"><SellerEconomicsCalculator purchaseHref={checkoutUrl} /></div></section>

      <section className="demo-section" id="demo">
        <div className="shell section-heading split-heading"><div><div className="eyebrow">Free browser demo</div><h2>Make the first three<br />right now.</h2></div><div><p>Your images never leave this page. Try the workflow with three photos, then use Pro for larger batches and offline work.</p><a className="demo-popout" href={`${basePath}/demo.html`} target="_blank" rel="noopener noreferrer">Open the studio full screen →</a></div></div>
        <div className="shell studio-frame-wrap"><iframe className="studio-frame" src={`${basePath}/demo.html`} title="SellerPhoto Studio free product photo editor" loading="lazy" /></div>
      </section>

      <section className="feature-section shell" id="features">
        <div className="section-kicker">One toolkit, the work around every listing</div>
        <div className="feature-header"><h2>Less busywork.<br /><em>More sellable SKUs.</em></h2><p>Useful for catalogue operators, marketplace sellers, quick-commerce brands, D2C teams and agencies managing multiple stores.</p></div>
        <div className="feature-grid">{features.map(([number, title, text]) => <article className="feature-card" key={number}><span className="feature-number">{number}</span><div className="feature-symbol" aria-hidden="true">{number === "03" ? "Aa" : number === "05" ? "₹" : "◎"}</div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="channel-section">
        <div className="shell channel-layout"><div><div className="section-kicker section-kicker-light">Built for the way India sells</div><h2>Marketplace, quick commerce and owned channels.</h2></div><div className="channel-card-grid"><article><span>01</span><h3>Marketplaces</h3><p>Prepare consistent catalogue images and model fees, fulfilment, ads and returns for Amazon, Flipkart, Meesho and Myntra.</p></article><article><span>02</span><h3>Quick commerce</h3><p>Plan compact, clear product images and unit economics for Blinkit, Zepto, Swiggy Instamart and similar rapid-delivery platforms.</p></article><article><span>03</span><h3>D2C, apps and social</h3><p>Create branded product images for Shopify, ONDC, your own site or app, Instagram, WhatsApp and reseller catalogues.</p></article></div></div>
      </section>

      <section className="steps-section" id="how-it-works"><div className="shell"><div className="section-kicker section-kicker-light">A repeatable listing workflow</div><div className="steps-grid"><article><span>1</span><h3>Check the margin</h3><p>Model price, platform costs, promotions, fulfilment and expected returns.</p></article><article><span>2</span><h3>Prepare the catalogue</h3><p>Choose a channel size and apply the same background, spacing and brand treatment.</p></article><article><span>3</span><h3>Export and list</h3><p>Download an organised ZIP, publish the SKU and reuse the workflow for the next batch.</p></article></div></div></section>

      <section className="pricing-section shell" id="launch-offer">
        <div className="pricing-copy"><div className="eyebrow eyebrow-dark">SellerPhoto Studio Pro</div><h2>The paid upgrade for catalogue production.</h2><p>The calculators and guides are free. Pro is the private, downloadable workspace for sellers who need to process real catalogue volume.</p><ul><li>Up to 50 photos per batch</li><li>Marketplace, quick-commerce and social presets</li><li>Logo, watermark, price badge and colour controls</li><li>SKU-friendly filenames, catalogue manifest CSV and organised ZIP export</li><li>JPG/PNG quality controls and offline use</li><li>Future 1.x updates included</li></ul>
          <div className="paid-value-strip"><strong>Best for</strong><span>New catalogue launches</span><span>Daily SKU updates</span><span>Seller agencies</span></div>
        </div>
        <aside className="price-card"><span className="launch-badge">FIRST 20 CUSTOMERS</span><div className="price"><sup>₹</sup>499</div><p className="price-note">One payment. No subscription or per-image fee.</p><a data-checkout-link className="button button-primary button-wide" href={checkoutUrl} target={checkoutTarget} rel={checkoutRel}>Get SellerPhoto Studio Pro <span>→</span></a>{checkoutReady ? <p className="checkout-note checkout-ready">Secure Razorpay checkout opens in a new tab.</p> : <p className="checkout-note">Secure checkout will open after store activation.</p>}<div className="price-divider" /><p className="regular-price">Regular price after launch: <strong>₹799</strong></p></aside>
      </section>

      <section className="faq-section shell"><div><div className="section-kicker">Seller questions</div><h2>Useful before you buy.</h2></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

      <footer><div className="shell footer-inner"><div className="brand brand-light"><span className="brand-mark">S</span><span>SellerPhoto Studio</span></div><p>Private product-photo software and practical seller tools for India. Not affiliated with any marketplace.</p><div className="footer-links"><a href={`${basePath}/privacy/`}>Privacy</a><a href={`${basePath}/resources/product-photo-size-guide/`}>Image guide</a><button type="button" data-analytics-settings>Analytics choices</button><a href="#top">Back to top ↑</a></div></div></footer>
    </main>
  );
}
