import SellerEconomicsCalculator from "../seller-tools";

export type PlatformProfitGuideConfig = {
  platform: string;
  path: string;
  eyebrow: string;
  title: string;
  intro: string;
  calculatorHeading: string;
  calculatorIntro: string;
  costItems: Array<[string, string]>;
  workflow: Array<[string, string]>;
  faqs: Array<[string, string]>;
};

type PlatformProfitGuideProps = {
  config: PlatformProfitGuideConfig;
  siteUrl: string;
  basePath: string;
  purchaseHref: string;
  purchaseApiUrl?: string;
};

export default function PlatformProfitGuide({
  config,
  siteUrl,
  basePath,
  purchaseHref,
  purchaseApiUrl,
}: PlatformProfitGuideProps) {
  const canonical = `${siteUrl}${config.path}`;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faqs.map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text },
    })),
  };
  const applicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${config.platform} Seller Profit Calculator India`,
    url: canonical,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any modern web browser",
    browserRequirements: "Requires JavaScript",
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    description: config.intro,
    provider: { "@type": "Organization", name: "SellerPhoto Studio", url: siteUrl },
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SellerPhoto Studio", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Seller tools", item: `${siteUrl}/#seller-hub` },
      { "@type": "ListItem", position: 3, name: `${config.platform} profit calculator`, item: canonical },
    ],
  };

  return <main className="resource-page platform-profit-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <nav className="site-nav resource-nav shell">
      <a className="brand" href={`${basePath}/`}><span className="brand-mark">S</span><span>SellerPhoto Studio</span></a>
      <a className="button button-small button-dark" href={`${basePath}/#launch-offer`}>Get Pro</a>
    </nav>

    <header className="resource-hero shell">
      <div className="eyebrow">{config.eyebrow}</div>
      <h1>{config.title}</h1>
      <p>{config.intro}</p>
      <div className="hero-actions">
        <a className="button button-primary" href="#calculator">Calculate profit free</a>
        <a className="text-link" href={`${basePath}/tools/marketplace-profit-calculator/`}>All-channel calculator →</a>
      </div>
    </header>

    <section className="platform-cost-section shell" aria-labelledby="cost-heading">
      <div className="platform-section-heading">
        <span>Use your current seller statement</span>
        <h2 id="cost-heading">Costs to include before calling a product profitable.</h2>
        <p>Marketplace charges vary by category, fulfilment model, weight, price band, promotion and account agreement. The calculator starts with an illustration; replace every field with the numbers visible in your seller portal.</p>
      </div>
      <div className="platform-cost-grid">
        {config.costItems.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>

    <section className="resource-content shell" id="calculator">
      <SellerEconomicsCalculator
        purchaseHref={purchaseHref}
        purchaseApiUrl={purchaseApiUrl}
        basePath={basePath}
        heading={config.calculatorHeading}
        intro={config.calculatorIntro}
      />
    </section>

    <section className="platform-workflow-section shell" aria-labelledby="workflow-heading">
      <div className="platform-section-heading">
        <span>From estimate to decision</span>
        <h2 id="workflow-heading">A practical pricing workflow.</h2>
      </div>
      <div className="platform-workflow-grid">
        {config.workflow.map(([title, text], index) => <article key={title}><strong>{index + 1}</strong><div><h3>{title}</h3><p>{text}</p></div></article>)}
      </div>
    </section>

    <section className="platform-faq-section shell" aria-labelledby="faq-heading">
      <div><span>Questions sellers ask</span><h2 id="faq-heading">{config.platform} profit calculator FAQ.</h2></div>
      <div className="faq-list">{config.faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
    </section>

    <section className="platform-related-section">
      <div className="shell">
        <div><span>Next seller task</span><h2>Protect the margin with better media and a full SKU forecast.</h2></div>
        <div className="platform-related-links">
          <a href={`${basePath}/resources/product-photo-size-guide/`}>Product image size guide <span>→</span></a>
          <a href={`${basePath}/features/product-photo-video-studio/`}>Product photo and video studio <span>→</span></a>
          <a href={`${basePath}/features/product-lifetime-forecasting/`}>Lifetime revenue forecast <span>→</span></a>
        </div>
      </div>
    </section>
  </main>;
}
