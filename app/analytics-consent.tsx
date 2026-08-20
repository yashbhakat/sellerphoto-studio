"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PRODUCT } from "../config/product.mjs";

type ConsentChoice = "loading" | "pending" | "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_KEY = "sellerphoto-analytics-consent";

function enableAnalytics(measurementId: string) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    // Google Tag expects its command queue entries to be Arguments objects.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
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
  const pathname = usePathname();
  const sensitiveRoute = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/download" || pathname.startsWith("/download/");
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__"
    ? ""
    : process.env.NEXT_PUBLIC_BASE_PATH || "";
  const [choice, setChoice] = useState<ConsentChoice>("loading");

  useEffect(() => {
    if (!measurementId || sensitiveRoute) return;
    const saved = window.localStorage.getItem(CONSENT_KEY);
    const nextChoice: ConsentChoice =
      saved === "granted" ? "granted" : saved === "denied" ? "denied" : "pending";

    if (saved === "granted") {
      enableAnalytics(measurementId);
    }

    const timer = window.setTimeout(() => setChoice(nextChoice), 0);
    return () => window.clearTimeout(timer);
  }, [measurementId, sensitiveRoute]);

  useEffect(() => {
    if (choice !== "granted" || sensitiveRoute) return;
    const trackCheckout = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-checkout-link]")
        : null;
      if (!target) return;
      window.gtag?.("event", "begin_checkout", {
        currency: "INR",
        value: PRODUCT.priceInr,
        items: [{ item_id: PRODUCT.analyticsItemId, item_name: `${PRODUCT.name} v${PRODUCT.version}`, price: PRODUCT.priceInr, quantity: 1 }],
      });
    };
    document.addEventListener("click", trackCheckout);
    return () => document.removeEventListener("click", trackCheckout);
  }, [choice, sensitiveRoute]);

  useEffect(() => {
    if (sensitiveRoute) return;
    const openSettings = () => setChoice("pending");
    const controls = document.querySelectorAll("[data-analytics-settings]");
    controls.forEach((control) => control.addEventListener("click", openSettings));
    return () => controls.forEach((control) => control.removeEventListener("click", openSettings));
  }, [sensitiveRoute]);

  if (sensitiveRoute || !measurementId || choice === "loading" || choice === "granted" || choice === "denied") return null;

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
        <span className="analytics-privacy-links">
          <a href={`${basePath}/privacy/`}>Privacy details</a>
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google privacy information
          </a>
        </span>
      </div>
      <div className="analytics-actions">
        <button type="button" className="analytics-decline" onClick={decline}>No thanks</button>
        <button type="button" className="analytics-accept" onClick={accept}>Allow analytics</button>
      </div>
    </aside>
  );
}
