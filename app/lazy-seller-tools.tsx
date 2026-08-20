"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { SellerEconomicsCalculatorProps } from "./seller-tools";

export default function LazySellerEconomicsCalculator(props: SellerEconomicsCalculatorProps) {
  const host = useRef<HTMLDivElement>(null);
  const [Calculator, setCalculator] = useState<ComponentType<SellerEconomicsCalculatorProps> | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => import("./seller-tools").then((module) => {
      if (active) setCalculator(() => module.default);
    });
    if (!("IntersectionObserver" in window) || !host.current) {
      void load();
      return () => { active = false; };
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void load();
    }, { rootMargin: "500px 0px" });
    observer.observe(host.current);
    return () => { active = false; observer.disconnect(); };
  }, []);

  return <div ref={host} className={Calculator ? undefined : "calculator-lazy-shell"}>
    {Calculator ? <Calculator {...props} /> : <div className="calculator-lazy-placeholder" role="status">
      <span>FREE SELLER CALCULATOR</span>
      <strong>Profit and margin tools load as you approach this section.</strong>
    </div>}
  </div>;
}
