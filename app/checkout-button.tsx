"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { PRODUCT } from "../config/product.mjs";

type PaymentResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type CheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: PaymentResult) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
};

type RazorpayInstance = { open: () => void; on: (event: string, handler: (response: unknown) => void) => void };

declare global {
  interface Window { Razorpay?: new (options: CheckoutOptions) => RazorpayInstance }
}

let checkoutScript: Promise<void> | null = null;

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (checkoutScript) return checkoutScript;
  checkoutScript = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay Checkout could not load."));
    document.head.appendChild(script);
  });
  return checkoutScript;
}

async function apiRequest(apiUrl: string, path: string, body: unknown) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({ message: "The secure delivery service returned an invalid response." }));
  return { response, payload };
}

function newAttemptId() {
  return crypto.randomUUID ? crypto.randomUUID() : `checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export default function CheckoutButton({
  apiUrl,
  fallbackHref,
  basePath = "",
  className,
  children,
  showStatus = false,
}: {
  apiUrl?: string;
  fallbackHref: string;
  basePath?: string;
  className: string;
  children: ReactNode;
  showStatus?: boolean;
}) {
  const [state, setState] = useState<"idle" | "opening" | "verifying" | "error">("idle");
  const [message, setMessage] = useState("");
  const automated = Boolean(apiUrl);
  const href = automated ? "#launch-offer" : fallbackHref;

  async function verifyUntilCaptured(payment: PaymentResult) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const { response, payload } = await apiRequest(apiUrl!, "/api/payments/verify", payment);
      if (response.ok && payload.token) return payload.token as string;
      if (response.status !== 202) throw new Error(payload.message || "Payment could not be verified.");
      await new Promise((resolve) => window.setTimeout(resolve, 1_500 + attempt * 500));
    }
    throw new Error("Payment is still being captured. Keep your payment ID and retry from the Razorpay success screen.");
  }

  async function startCheckout(event: MouseEvent<HTMLAnchorElement>) {
    if (!automated) return;
    event.preventDefault();
    if (state !== "idle" && state !== "error") return;
    setMessage("");
    setState("opening");
    try {
      const idempotencyKey = newAttemptId();
      localStorage.setItem(PRODUCT.checkoutRecoveryStorageKey, JSON.stringify({ idempotencyKey, createdAt: Date.now() }));
      const [orderResult] = await Promise.all([
        apiRequest(apiUrl!, "/api/orders", { idempotencyKey }),
        loadRazorpay(),
      ]);
      if (!orderResult.response.ok) throw new Error(orderResult.payload.message || "Checkout could not start.");
      if (!window.Razorpay) throw new Error("Razorpay Checkout could not load.");
      const order = orderResult.payload;
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description || PRODUCT.name,
        order_id: order.orderId,
        handler: async (payment) => {
          setState("verifying");
          setMessage("Payment received. Verifying your protected download…");
          try {
            const token = await verifyUntilCaptured(payment);
            sessionStorage.setItem("sellerphoto-download-token", token);
            window.location.assign(`${basePath}/download/#token=${encodeURIComponent(token)}`);
          } catch (error) {
            setState("error");
            setMessage(error instanceof Error ? error.message : "Payment could not be verified.");
          }
        },
        modal: { ondismiss: () => setState("idle") },
        theme: { color: "#c9f252" },
      });
      checkout.on("payment.failed", () => {
        setState("error");
        setMessage("Payment was not completed. No download was issued and you can safely retry.");
      });
      checkout.open();
      setState("idle");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Checkout could not start.");
    }
  }

  const label = state === "opening" ? "Opening secure checkout…" : state === "verifying" ? "Verifying payment…" : children;
  return <>
    <a
      data-checkout-link
      data-checkout-mode={automated ? "automated" : "hosted"}
      className={className}
      href={href}
      target={!automated && fallbackHref.startsWith("https://") ? "_blank" : undefined}
      rel={!automated && fallbackHref.startsWith("https://") ? "noopener noreferrer" : undefined}
      aria-busy={state === "opening" || state === "verifying"}
      onClick={startCheckout}
    >{label}</a>
    {showStatus && message ? <p className={state === "error" ? "checkout-status checkout-status-error" : "checkout-status"} role="status">{message}</p> : null}
  </>;
}
