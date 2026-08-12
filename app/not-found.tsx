import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__"
  ? ""
  : process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function NotFound() {
  return (
    <main className="not-found-page shell">
      <div className="eyebrow">404 · Page not found</div>
      <h1>This page is out of frame.</h1>
      <p>The SellerPhoto Studio storefront is still ready when you are.</p>
      <a className="button button-primary" href={`${basePath}/`}>Return to SellerPhoto Studio</a>
    </main>
  );
}
