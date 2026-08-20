"use client";

import { useEffect, useState } from "react";

type Access = {
  expiresAt: number;
  downloadsRemaining: number;
  releaseVersion: string;
  checksum: string;
};

export default function DownloadAccess({ apiUrl, homeHref }: { apiUrl?: string; homeHref: string }) {
  const [token, setToken] = useState("");
  const [access, setAccess] = useState<Access | null>(null);
  const [message, setMessage] = useState("Checking your secure download…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function verifyAccess() {
      await Promise.resolve();
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = fragment.get("token") || sessionStorage.getItem("sellerphoto-download-token") || "";
      if (!apiUrl) {
        if (!cancelled) setMessage("Secure delivery is not active on this deployment yet.");
        return;
      }
      if (!accessToken) {
        if (!cancelled) setMessage("No download pass was found. Complete payment from the SellerPhoto Studio checkout first.");
        return;
      }
      sessionStorage.setItem("sellerphoto-download-token", accessToken);
      if (!cancelled) setToken(accessToken);
      history.replaceState(null, "", `${location.pathname}${location.search}`);
      try {
        const response = await fetch(`${apiUrl}/api/entitlements/status`, {
          method: "POST",
          credentials: "omit",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: accessToken }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "This download pass is unavailable.");
        if (!cancelled) { setAccess(payload); setMessage(""); }
      } catch (error) {
        if (!cancelled) setMessage(error instanceof Error ? error.message : "This download pass is unavailable.");
      }
    }
    void verifyAccess();
    return () => { cancelled = true; };
  }, [apiUrl]);

  async function download() {
    if (!apiUrl || !token || busy) return;
    setBusy(true);
    setMessage("Preparing the protected ZIP…");
    try {
      const response = await fetch(`${apiUrl}/api/download`, {
        method: "POST",
        credentials: "omit",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "The download could not be prepared.");
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "SellerPhotoStudio-v1.1.0.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      const remaining = Number(response.headers.get("X-Downloads-Remaining"));
      setAccess((current) => current ? { ...current, downloadsRemaining: Number.isFinite(remaining) ? remaining : Math.max(0, current.downloadsRemaining - 1) } : current);
      setMessage("Download started. Extract the ZIP and open index.html.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The download could not be prepared.");
    } finally {
      setBusy(false);
    }
  }

  function copyRecoveryLink() {
    const recovery = `${location.origin}${location.pathname}#token=${encodeURIComponent(token)}`;
    navigator.clipboard.writeText(recovery)
      .then(() => setMessage("Recovery link copied. Keep it private until it expires."))
      .catch(() => setMessage("Copying was blocked by the browser. Keep this page open until your download finishes."));
  }

  return <section className="download-card" aria-live="polite">
    <div className="download-icon" aria-hidden="true">↓</div>
    <p className="eyebrow">Verified purchase</p>
    <h1>{access ? "Your Pro edition is ready." : "Secure product delivery"}</h1>
    {access ? <>
      <p className="download-intro">SellerPhoto Studio v{access.releaseVersion} is ready as a private offline ZIP. Product photos remain on your device.</p>
      <dl className="download-details">
        <div><dt>Downloads remaining</dt><dd>{access.downloadsRemaining} of 3</dd></div>
        <div><dt>Link expires</dt><dd>{new Date(access.expiresAt * 1000).toLocaleString("en-IN")}</dd></div>
        <div><dt>SHA-256</dt><dd className="checksum">{access.checksum}</dd></div>
      </dl>
      <button className="button button-primary button-wide" type="button" onClick={download} disabled={busy || access.downloadsRemaining < 1}>{busy ? "Preparing…" : "Download SellerPhoto Studio Pro"}</button>
      <button className="download-copy" type="button" onClick={copyRecoveryLink}>Copy private recovery link</button>
    </> : null}
    {message ? <p className="download-message">{message}</p> : null}
    <p className="download-safety">Never share the recovery link: it grants access to the paid ZIP. It expires after seven days and allows no more than three downloads.</p>
    <a className="text-link" href={homeHref}>Back to SellerPhoto Studio →</a>
  </section>;
}
