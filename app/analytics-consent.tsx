"use client";

import { useEffect, useState } from "react";

type ConsentChoice = "loading" | "pending" | "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_KEY = "sellerphoto-analytics-consent";

function enableAnalytics(measurementId: string) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  if (!document.querySelector(`script[data-ga-id="${measurementId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.gaId = measurementId;
    document.head.appendChild(script);
  }
}

export default function AnalyticsConsent() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const [choice, setChoice] = useState<ConsentChoice>("loading");

  useEffect(() => {
    if (!measurementId) return;
    const saved = window.localStorage.getItem(CONSENT_KEY);
    const nextChoice: ConsentChoice =
      saved === "granted" ? "granted" : saved === "denied" ? "denied" : "pending";

    if (saved === "granted") {
      enableAnalytics(measurementId);
    }

    const timer = window.setTimeout(() => setChoice(nextChoice), 0);
    return () => window.clearTimeout(timer);
  }, [measurementId]);

  useEffect(() => {
    if (choice !== "granted") return;
    const trackCheckout = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-checkout-link]")
        : null;
      if (!target) return;
      window.gtag?.("event", "begin_checkout", {
        currency: "INR",
        value: 499,
        items: [{ item_id: "sellerphoto-v1", item_name: "SellerPhoto Studio v1.0", price: 499, quantity: 1 }],
      });
    };
    document.addEventListener("click", trackCheckout);
    return () => document.removeEventListener("click", trackCheckout);
  }, [choice]);

  useEffect(() => {
    const openSettings = () => setChoice("pending");
    const controls = document.querySelectorAll("[data-analytics-settings]");
    controls.forEach((control) => control.addEventListener("click", openSettings));
    return () => controls.forEach((control) => control.removeEventListener("click", openSettings));
  }, []);

  if (!measurementId || choice === "loading" || choice === "granted" || choice === "denied") return null;

  const accept = () => {
    window.localStorage.setItem(CONSENT_KEY, "granted");
    enableAnalytics(measurementId);
    setChoice("granted");
  };

  const decline = () => {
    window.localStorage.setItem(CONSENT_KEY, "denied");
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
    setChoice("denied");
  };

  return (
    <aside className="analytics-consent" role="dialog" aria-label="Analytics preferences" aria-live="polite">
      <div>
        <strong>Help improve SellerPhoto Studio</strong>
        <p>
          With your permission, Google Analytics helps us understand visits, approximate country or region,
          and which parts of the site are useful. Analytics cookies are not loaded unless you accept.
        </p>
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google privacy information
        </a>
      </div>
      <div className="analytics-actions">
        <button type="button" className="analytics-decline" onClick={decline}>No thanks</button>
        <button type="button" className="analytics-accept" onClick={accept}>Allow analytics</button>
      </div>
    </aside>
  );
}
