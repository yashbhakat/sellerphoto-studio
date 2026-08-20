import type { Metadata } from "next";
import CheckoutButton from "./checkout-button";
import SellerEconomicsCalculator from "./seller-tools";

export const metadata: Metadata = {
  title: "Product Photo, Video & Revenue Forecast Tools for Sellers",
  description: "Create marketplace-ready product photos and videos, forecast lifetime revenue and profit, and plan pricing for ecommerce and quick-commerce sellers in India.",
};

const configuredCheckoutUrl = process.env.NEXT_PUBLIC_CHECKOUT_URL?.trim();
const configuredFulfilmentApiUrl = process.env.NEXT_PUBLIC_FULFILMENT_API_URL?.trim().replace(/\/$/, "");
const checkoutUrl = configuredCheckoutUrl || "#launch-offer";
const checkoutReady = Boolean(configuredCheckoutUrl || configuredFulfilmentApiUrl);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

const faqs = [
  ["Are my product photos or videos uploaded anywhere?", "No. Photo processing, video rendering and forecast calculations happen in your browser. The paid suite can run offline after download."],
  ["What does the product lifetime forecast calculate?", "It projects monthly demand, price erosion, cost inflation, returns, platform fees, advertising, overhead, tax, working capital, revenue, profit, cash breakeven and ROI for up to 60 months."],
  ["Does the forecast guarantee sales or profit?", "No. It is a planning model driven by your assumptions, not a guarantee or financial advice. Use conservative inputs and compare the model with actual seller data."],
  ["Are the image presets officially certified by marketplaces?", "No. They are conservative workflow starting points with a pre-upload inspector. Marketplace, category and account rules can change, so verify the current rule in your seller portal before upload."],
  ["What kind of product video can Pro create?", "Pro turns up to 12 product photos into a short WebM video with optional pan and zoom, transitions, captions, price, call-to-action, logo, music and safe-zone guides."],
  ["Which selling channels are supported?", "The workflows cover Amazon, Flipkart, Meesho, Myntra, Blinkit, Zepto, Swiggy Instamart, Shopify, ONDC, Instagram, WhatsApp and independent stores or apps."],
  ["Does SellerPhoto Studio remove backgrounds with AI?", "Not in the current edition. It creates consistent catalogue canvases and controls the placement, tone, spacing and overlays of your original photos."],
  ["Is the full edition a subscription?", "No. The launch edition is a one-time download with no per-image, per-video or recurring usage fee."],
];

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SellerPhoto Studio",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any modern web browser",
  url: siteUrl,
  image: siteUrl + "/og.png",
  inLanguage: "en-IN",
  publisher: { "@type": "Organization", name: "SellerPhoto Studio", url: siteUrl },
  description: "An on-device product media and commercial planning suite for Indian marketplace, quick-commerce, D2C and social sellers.",
  offers: { "@type": "Offer", price: "499", priceCurrency: "INR", availability: "https://schema.org/InStock", url: configuredFulfilmentApiUrl ? siteUrl + "/#launch-offer" : checkoutReady ? checkoutUrl : siteUrl + "/#launch-offer" },
  featureList: [
    "Batch product-photo editor with feature toggles", "Marketplace image presets and pre-upload inspector",
    "Product video generator with scene timeline", "Product lifetime revenue and profit forecasting",
    "Scenario, sensitivity, break-even and cash-flow analysis", "On-device processing and offline use",
    "SKU-friendly ZIP exports and catalogue manifest",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
};

const features = [
  ["01", "Compliance-aware images", "Start with a channel preset, switch each treatment on or off, and review resolution, aspect ratio, background, occupancy and overlay risks."],
  ["02", "Photo-to-video studio", "Arrange up to 12 scenes with motion, transitions, captions, price, call-to-action, logo, music and common channel formats."],
  ["03", "Lifetime forecasting", "Project demand from launch through maturity and decline, including seasonality, price erosion and rising costs for 12 to 60 months."],
  ["04", "Decision analytics", "Compare conservative, base and aggressive cases, cash breakeven, ROI, target gaps, unit economics and a price-demand sensitivity grid."],
  ["05", "Catalogue operations", "Process 50 photos, apply one consistent setup, create SKU-friendly filenames, export a manifest and download an organised ZIP."],
  ["06", "Private by design", "Media stays on your device. There are no accounts, uploads or recurring AI-processing charges."],
];

const toolCards = [
  ["Profit calculator", "Price marketplace products after fees, fulfilment, ads and expected returns.", basePath + "/tools/marketplace-profit-calculator/", "Calculate profit"],
  ["Quick-commerce margin", "Model platform charges, promotions, fulfilment and wastage for rapid-delivery channels.", basePath + "/tools/quick-commerce-margin-calculator/", "Check unit economics"],
  ["Product image guide", "Choose practical export sizes for marketplaces, quick commerce, D2C and social catalogues.", basePath + "/resources/product-photo-size-guide/", "Open size guide"],
  ["3-photo formatter", "Test the private batch workflow in your browser before buying the full seller suite.", "#demo", "Try the studio"],
];

const proTools = [
  ["IMAGE STUDIO", "Prepare product photos with control, not guesswork.", "Nine channel and placement presets, 13 feature switches, six pre-upload checks, 50-photo batches and a catalogue manifest.", basePath + "/features/product-photo-video-studio/", "Explore the media studio"],
  ["VIDEO STUDIO", "Turn catalogue photos into product motion.", "Create 9:16, 1:1, 4:5 or 16:9 videos with a scene timeline, optional motion, transitions, captions, CTA, logo and music.", basePath + "/features/product-photo-video-studio/", "See the video workflow"],
  ["FORECAST LAB", "Model the commercial life of a product.", "Forecast 12–60 months of revenue, net profit, cash flow and ROI with lifecycle demand, scenarios, sensitivity and downloadable monthly data.", basePath + "/features/product-lifetime-forecasting/", "See forecast analytics"],
];

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <nav className="site-nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="SellerPhoto Studio home"><span className="brand-mark" aria-hidden="true">S</span><span>SellerPhoto Studio</span></a>
        <div className="nav-links"><a href="#pro-suite">Pro suite</a><a href="#seller-hub">Free tools</a><a href="#demo">Photo demo</a><CheckoutButton apiUrl={configuredFulfilmentApiUrl} fallbackHref={checkoutUrl} basePath={basePath} className="button button-small button-dark">Get Pro</CheckoutButton></div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> Built for online sellers in India</div>
          <h1>Better product media. <em>Clearer profit.</em></h1>
          <p className="hero-lede">Prepare listing photos, create short product videos and forecast a product from launch to lifetime profit—for marketplaces, quick commerce, D2C, apps and social selling. Your media never leaves your device.</p>
          <div className="hero-actions"><a className="button button-primary" href="#pro-suite">Explore the Pro suite <span>↓</span></a><a className="text-link" href="#demo">Try 3 photos free <span>→</span></a></div>
          <div className="proof-row" aria-label="Product benefits"><span>✓ On-device</span><span>✓ Mobile-friendly</span><span>✓ Works offline</span><span>✓ One-time Pro purchase</span></div>
        </div>
        <div className="hero-visual" aria-label="Before and after ecommerce product photography">
          <div className="visual-grid"><img src={basePath + "/hero-marketplace.jpg"} width="1536" height="1024" fetchPriority="high" decoding="async" alt="Products arranged for a clean ecommerce catalogue" /></div>
          <div className="photo-card photo-before"><div className="card-label">Phone photo</div><img className="product-photo product-photo-before" src={basePath + "/seller-bag.jpg"} width="1254" height="1254" loading="lazy" decoding="async" alt="Original product photo of an orange crossbody bag" /><span className="scribble">camera roll</span></div>
          <div className="photo-card photo-after"><div className="card-label card-label-dark">Ready to list</div><div className="price-chip">₹799</div><img className="product-photo product-photo-after" src={basePath + "/seller-bag.jpg"} width="1254" height="1254" loading="lazy" decoding="async" alt="Marketplace-ready product image of an orange crossbody bag" /><div className="mini-brand">YOUR STORE</div></div>
          <div className="batch-chip"><strong>3</strong><span>Pro workspaces</span></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Relevant ecommerce channels"><div className="shell trust-inner"><span>SELL ACROSS</span><strong>AMAZON</strong><strong>FLIPKART</strong><strong>MEESHO</strong><strong>MYNTRA</strong><strong>BLINKIT</strong><strong>ZEPTO</strong><strong>INSTAMART</strong><strong>SHOPIFY</strong><strong>ONDC</strong></div></section>

      <section className="pro-suite-section" id="pro-suite">
        <div className="shell pro-suite-heading"><div><div className="eyebrow eyebrow-dark">SellerPhoto Studio Pro 1.1</div><h2>One offline workspace for the work around every SKU.</h2></div><p>Move from a raw product photo to channel-ready media and a defensible commercial forecast without sending product files to a remote editor.</p></div>
        <div className="shell pro-suite-grid">
          {proTools.map(([label, title, text, href, action], index) => <article className={"pro-suite-card pro-suite-card-" + (index + 1)} key={label}><span>{label}</span><h3>{title}</h3><p>{text}</p><a href={href}>{action} <span>→</span></a></article>)}
        </div>
        <div className="shell pro-suite-rail"><span>Included in the ₹499 launch edition</span><strong>50-photo editor</strong><strong>12-scene video maker</strong><strong>60-month forecast lab</strong><strong>Offline files</strong></div>
      </section>

      <section className="seller-hub-section" id="seller-hub">
        <div className="shell section-heading split-heading"><div><div className="eyebrow">Free seller operations hub</div><h2>Test the listing.<br />Check the <em>unit economics.</em></h2></div><p>Use the free calculators, image guide and three-photo demo before upgrading to the downloadable production suite.</p></div>
        <div className="shell tool-card-grid">{toolCards.map(([title, text, href, action], index) => <article className="tool-card" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p><a href={href}>{action} <span>→</span></a></article>)}</div>
      </section>

      <section className="calculator-section" id="profit-calculator"><div className="shell"><SellerEconomicsCalculator purchaseHref={checkoutUrl} purchaseApiUrl={configuredFulfilmentApiUrl} basePath={basePath} /></div></section>

      <section className="demo-section" id="demo">
        <div className="shell section-heading split-heading"><div><div className="eyebrow">Free browser demo</div><h2>Make the first three<br />right now.</h2></div><div><p>Your images never leave this page. Try the core photo workflow, then use Pro for compliance controls, video, forecasting, larger batches and offline work.</p><a className="demo-popout" href={basePath + "/demo.html"} target="_blank" rel="noopener noreferrer">Open the studio full screen →</a></div></div>
        <div className="shell studio-frame-wrap"><iframe className="studio-frame" src={basePath + "/demo.html"} title="SellerPhoto Studio free product photo editor" loading="lazy" /></div>
      </section>

      <section className="feature-section shell" id="features">
        <div className="section-kicker">Feature-rich without a complicated workflow</div>
        <div className="feature-header"><h2>Every control when needed.<br /><em>Every layer optional.</em></h2><p>Useful for catalogue operators, marketplace sellers, quick-commerce brands, D2C teams and agencies managing multiple stores.</p></div>
        <div className="feature-grid">{features.map(([number, title, text]) => <article className="feature-card" key={number}><span className="feature-number">{number}</span><div className="feature-symbol" aria-hidden="true">{number === "02" ? "▶" : number === "03" ? "₹" : number === "04" ? "↗" : "◎"}</div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="channel-section">
        <div className="shell channel-layout"><div><div className="section-kicker section-kicker-light">Built for the way India sells</div><h2>Marketplace, quick commerce and owned channels.</h2></div><div className="channel-card-grid"><article><span>01</span><h3>Marketplaces</h3><p>Prepare clean catalogue images and model fees, fulfilment, ads, returns and lifecycle demand for Amazon, Flipkart, Meesho and Myntra.</p></article><article><span>02</span><h3>Quick commerce</h3><p>Plan recognisable packshots, short media and unit economics for Blinkit, Zepto, Swiggy Instamart and similar rapid-delivery platforms.</p></article><article><span>03</span><h3>D2C, apps and social</h3><p>Create branded photos and short product videos for Shopify, ONDC, your own site or app, Instagram, WhatsApp and reseller catalogues.</p></article></div></div>
      </section>

      <section className="steps-section" id="how-it-works"><div className="shell"><div className="section-kicker section-kicker-light">A repeatable product-launch workflow</div><div className="steps-grid"><article><span>1</span><h3>Forecast the SKU</h3><p>Model demand, price, returns, costs, working capital, breakeven and downside before committing inventory.</p></article><article><span>2</span><h3>Prepare the media</h3><p>Build compliant starting images and channel-ready video with every creative layer under your control.</p></article><article><span>3</span><h3>Export, list and learn</h3><p>Download organised media and monthly forecast data, launch the SKU, then replace assumptions with actual results.</p></article></div></div></section>

      <section className="pricing-section shell" id="launch-offer">
        <div className="pricing-copy"><div className="eyebrow eyebrow-dark">SellerPhoto Studio Pro 1.1</div><h2>The paid operating suite for product launches.</h2><p>The simple calculators and photo demo are free. Pro is the private, downloadable workspace for sellers who need richer media and deeper product decisions.</p><ul><li>Up to 50 photos per batch with per-feature toggle controls</li><li>Nine marketplace, quick-commerce, D2C and social image presets</li><li>Compliance guard and six-point pre-upload image inspector</li><li>12-scene product video generator with motion, captions, CTA, logo and music</li><li>12–60 month revenue, profit, cash-flow and ROI forecasting</li><li>Conservative/base/aggressive scenarios and price-demand sensitivity</li><li>SKU filenames, catalogue manifest, ZIP, forecast CSV and printable report</li><li>Offline use and future 1.x updates included</li></ul>
          <div className="paid-value-strip"><strong>Best for</strong><span>New product validation</span><span>Catalogue launches</span><span>Quick-commerce brands</span><span>Seller agencies</span></div>
        </div>
        <aside className="price-card"><span className="launch-badge">LAUNCH EDITION</span><div className="price"><sup>₹</sup>499</div><p className="price-note">One payment. No subscription, per-image or per-video fee.</p><CheckoutButton apiUrl={configuredFulfilmentApiUrl} fallbackHref={checkoutUrl} basePath={basePath} className="button button-primary button-wide" showStatus>Get SellerPhoto Studio Pro <span>→</span></CheckoutButton>{configuredFulfilmentApiUrl ? <p className="checkout-note checkout-ready">Payment is verified server-side. Your protected download appears immediately after capture.</p> : checkoutReady ? <p className="checkout-note checkout-ready">Secure Razorpay checkout opens in a new tab. Delivery remains manual until protected delivery is activated.</p> : <p className="checkout-note">Secure checkout will open after store activation.</p>}<div className="price-divider" /><p className="regular-price">Regular price after launch: <strong>₹799</strong></p></aside>
      </section>

      <section className="faq-section shell"><div><div className="section-kicker">Seller questions</div><h2>Useful before you buy.</h2></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>

      <footer><div className="shell footer-inner"><div className="brand brand-light"><span className="brand-mark">S</span><span>SellerPhoto Studio</span></div><p>Private product-media software and practical seller analytics for India. Not affiliated with or certified by any marketplace.</p><div className="footer-links"><a href={basePath + "/privacy/"}>Privacy</a><a href={basePath + "/features/product-photo-video-studio/"}>Media suite</a><a href={basePath + "/features/product-lifetime-forecasting/"}>Forecast lab</a><button type="button" data-analytics-settings>Analytics choices</button><a href="#top">Back to top ↑</a></div></div></footer>
    </main>
  );
}
