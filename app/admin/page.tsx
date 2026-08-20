import type { Metadata } from "next";
import AdminAccess from "./admin-access";

export const metadata: Metadata = {
  title: "Admin access",
  description: "Secure SellerPhoto Studio administrator access.",
  robots: { index: false, follow: false },
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH === "__ROOT__" ? "" : process.env.NEXT_PUBLIC_BASE_PATH || "";
const apiUrl = process.env.NEXT_PUBLIC_FULFILMENT_API_URL?.trim().replace(/\/$/, "");

export default function AdminPage() {
  return <AdminAccess apiUrl={apiUrl} basePath={basePath} />;
}
