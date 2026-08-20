import type { Metadata } from "next";
import DownloadAccess from "./download-access";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";
const apiUrl = process.env.NEXT_PUBLIC_FULFILMENT_API_URL?.replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Secure Pro Download",
  description: "Retrieve a verified SellerPhoto Studio Pro purchase.",
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
};

export default function DownloadPage() {
  return <main className="download-page">
    <nav className="site-nav shell" aria-label="Download navigation">
      <a className="brand" href={`${basePath}/`}><span className="brand-mark" aria-hidden="true">S</span><span>SellerPhoto Studio</span></a>
      <span className="secure-label">Razorpay verified · protected delivery</span>
    </nav>
    <div className="download-shell shell"><DownloadAccess apiUrl={apiUrl} homeHref={`${basePath}/`} /></div>
  </main>;
}
