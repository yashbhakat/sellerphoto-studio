import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SellerPhoto Studio — Marketplace-ready product photos in minutes",
  description:
    "Batch-format product photos for Meesho, Amazon, Flipkart, Instagram, and WhatsApp. Private, fast, and processed on your device.",
};

const checkoutUrl = process.env.NEXT_PUBLIC_CHECKOUT_URL || "#launch-offer";

const features = [
  ["01", "Batch-ready", "Drop a full product set and apply one clean, consistent treatment to every photo."],
  ["02", "Marketplace presets", "Export square, portrait, and story-ready images without memorising dimensions."],
  ["03", "Brand controls", "Add your logo, store name, price badge, colours, margins, and watermark once."],
  ["04", "Private by design", "Photos stay on your device. There are no accounts, uploads, or recurring AI charges."],
];

export default function Home() {
  return (
    <main>
      <nav className="site-nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="SellerPhoto Studio home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>SellerPhoto Studio</span>
        </a>
        <div className="nav-links">
          <a href="#demo">Try it</a>
          <a href="#features">Features</a>
          <a className="button button-small button-dark" href={checkoutUrl}>Get the full edition</a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> Built for independent sellers</div>
          <h1>Turn everyday photos into a <em>clean product catalogue.</em></h1>
          <p className="hero-lede">
            Format, brand, resize, and export an entire batch for Meesho, Amazon,
            Flipkart, Instagram, or WhatsApp—without uploading a single image.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#demo">Try 3 photos free <span>↓</span></a>
            <a className="text-link" href="#how-it-works">See how it works <span>→</span></a>
          </div>
          <div className="proof-row" aria-label="Product benefits">
            <span>✓ No sign-up</span><span>✓ Works offline</span><span>✓ One-time purchase</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Before and after product photo illustration">
          <div className="visual-grid" />
          <div className="photo-card photo-before">
            <div className="card-label">Before</div>
            <div className="product-shape product-before-shape"><span className="bottle-cap" /><span className="bottle-body" /></div>
            <span className="scribble">camera roll</span>
          </div>
          <div className="photo-card photo-after">
            <div className="card-label card-label-dark">Ready to sell</div>
            <div className="price-chip">₹799</div>
            <div className="product-shape"><span className="bottle-cap" /><span className="bottle-body" /></div>
            <div className="mini-brand">YOUR STORE</div>
          </div>
          <div className="batch-chip"><strong>12</strong><span>photos ready</span></div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Supported channels">
        <div className="shell trust-inner">
          <span>READY FOR</span><strong>MEESHO</strong><strong>AMAZON</strong><strong>FLIPKART</strong><strong>INSTAGRAM</strong><strong>WHATSAPP</strong>
        </div>
      </section>

      <section className="demo-section" id="demo">
        <div className="shell section-heading split-heading">
          <div><div className="eyebrow">Free browser demo</div><h2>Make the first three<br />right now.</h2></div>
          <p>Your images never leave this page. Try the complete workflow with up to three photos, then download the full offline edition for larger batches.</p>
        </div>
        <div className="shell studio-frame-wrap">
          <iframe className="studio-frame" src="/demo.html" title="SellerPhoto Studio free demo" loading="eager" />
        </div>
      </section>

      <section className="feature-section shell" id="features">
        <div className="section-kicker">Why sellers use it</div>
        <div className="feature-header">
          <h2>Consistent photos.<br /><em>Less repetitive work.</em></h2>
          <p>Everything needed for a polished catalogue, without the complexity of a design suite.</p>
        </div>
        <div className="feature-grid">
          {features.map(([number, title, text]) => (
            <article className="feature-card" key={number}>
              <span className="feature-number">{number}</span>
              <div className="feature-symbol" aria-hidden="true">{number === "01" ? "⧉" : number === "02" ? "⌗" : number === "03" ? "Aa" : "◉"}</div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="shell">
          <div className="section-kicker section-kicker-light">Three simple steps</div>
          <div className="steps-grid">
            <article><span>1</span><h3>Drop your photos</h3><p>Add JPG, PNG, or WebP product shots from your phone or computer.</p></article>
            <article><span>2</span><h3>Set your look once</h3><p>Choose a size, fit, background, badge, watermark, and optional logo.</p></article>
            <article><span>3</span><h3>Export the batch</h3><p>Download every finished image together in one organised ZIP file.</p></article>
          </div>
        </div>
      </section>

      <section className="pricing-section shell" id="launch-offer">
        <div className="pricing-copy">
          <div className="eyebrow eyebrow-dark">Launch edition</div>
          <h2>A tiny tool that gives hours back.</h2>
          <p>Pay once, keep it, and use it whenever a new product arrives.</p>
          <ul><li>Up to 50 photos per batch</li><li>Every marketplace preset</li><li>Logo, watermark, and price tools</li><li>Offline ZIP download</li><li>Future 1.x updates included</li></ul>
        </div>
        <aside className="price-card">
          <span className="launch-badge">FIRST 20 CUSTOMERS</span>
          <div className="price"><sup>₹</sup>499</div>
          <p className="price-note">One payment. No subscription.</p>
          <a className="button button-primary button-wide" href={checkoutUrl}>Get SellerPhoto Studio <span>→</span></a>
          {!process.env.NEXT_PUBLIC_CHECKOUT_URL && <p className="checkout-note">Secure checkout will open after store activation.</p>}
          <div className="price-divider" /><p className="regular-price">Regular price after launch: <strong>₹799</strong></p>
        </aside>
      </section>

      <section className="faq-section shell">
        <div><div className="section-kicker">Good to know</div><h2>Simple by design.</h2></div>
        <div className="faq-list">
          <details><summary>Are my photos uploaded anywhere?</summary><p>No. Processing happens inside your browser, and the offline edition works without an internet connection.</p></details>
          <details><summary>Does it remove backgrounds with AI?</summary><p>Not in this fast first edition. It creates consistent catalogue canvases and controls how each original photo fits inside them.</p></details>
          <details><summary>What devices does it support?</summary><p>Current versions of Chrome, Edge, Firefox, and Safari on desktop and mobile.</p></details>
          <details><summary>Is this a subscription?</summary><p>No. The launch edition is a one-time download with no usage fees.</p></details>
        </div>
      </section>

      <footer><div className="shell footer-inner"><div className="brand brand-light"><span className="brand-mark">S</span><span>SellerPhoto Studio</span></div><p>Built for small sellers who would rather be selling.</p><a href="#top">Back to top ↑</a></div></footer>
    </main>
  );
}
