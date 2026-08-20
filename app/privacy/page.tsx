import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How SellerPhoto Studio handles product photos, analytics choices, approximate location data, and checkout.",
  alternates: {
    canonical: `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/privacy/`,
  },
  robots: { index: true, follow: true },
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__"
  ? ""
  : process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <nav className="site-nav shell" aria-label="Privacy navigation">
        <a className="brand" href={`${basePath}/`} aria-label="SellerPhoto Studio home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>SellerPhoto Studio</span>
        </a>
        <a className="text-link privacy-back" href={`${basePath}/`}>Back to the studio</a>
      </nav>

      <article className="privacy-content shell">
        <div className="eyebrow">Plain-language privacy</div>
        <h1>Your photos stay yours.</h1>
        <p className="privacy-intro">
          SellerPhoto Studio is designed to format product photos in your browser. This page explains what stays on
          your device, what optional website analytics can measure, and what happens when you open checkout.
        </p>

        <section>
          <h2>Product photos and the editor</h2>
          <p>
            Photos, logos, watermarks, settings, and exported images are processed on your device. SellerPhoto Studio
            does not upload those files to its website or include their contents in Google Analytics.
          </p>
        </section>

        <section>
          <h2>Optional Google Analytics</h2>
          <p>
            Analytics loads only after you choose <strong>Allow analytics</strong>. It can report page visits, broad
            device and browser information, interactions such as starting checkout, and an approximate country or
            region derived from network information. It does not receive precise GPS location, product-photo contents,
            or payment-card details.
          </p>
          <p>
            Advertising storage, Google signals, and ad-personalisation signals are disabled. Your choice is stored in
            this browser. Use <strong>Analytics choices</strong> in the site footer to review or change it.
          </p>
          <p>
            Google processes permitted analytics data under its own
            {" "}<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.
          </p>
        </section>

        <section>
          <h2>Checkout and payment</h2>
          <p>
            When protected delivery is active, purchase buttons open Razorpay Standard Checkout. A SellerPhoto Studio
            delivery service creates the fixed-price order and receives the Razorpay order ID, payment ID, payment
            status, amount, currency, and a cryptographic payment signature. Card and UPI credentials remain with
            Razorpay under its own
            {" "}<a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer">privacy policy</a>.
            SellerPhoto Studio verifies a captured ₹499 INR payment before issuing a time-limited download pass. It
            does not place payment credentials, payment IDs, or download-pass values in website analytics.
          </p>
          <p>
            Fulfilment records store the minimum operational data needed to prevent duplicate delivery and handle
            refunds: order/payment identifiers, product version, timestamps, status, and download count. Checkout rate
            limiting uses a one-way keyed hash of the network address rather than storing the raw address. A private
            recovery token can be held temporarily in this browser session after payment.
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <ul>
            <li>Decline analytics and continue using the public demo.</li>
            <li>Change your analytics choice from the footer at any time.</li>
            <li>Clear this site&apos;s browser storage to remove the saved consent choice.</li>
            <li>Keep a paid download recovery link private; anyone holding it can use the remaining downloads until expiry.</li>
          </ul>
        </section>

        <p className="privacy-updated">Last updated: 15 August 2026</p>
      </article>
    </main>
  );
}
