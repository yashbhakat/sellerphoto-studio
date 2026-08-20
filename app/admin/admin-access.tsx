"use client";

import { useEffect, useState, type FormEvent } from "react";

const TOKEN_KEY = "sellerphoto-admin-session";

type AdminProfile = {
  username: string;
  expiresAt: number;
  releaseVersion: string;
  checksum: string;
};

async function readPayload(response: Response) {
  return response.json().catch(() => ({ message: "The admin service returned an invalid response." }));
}

export default function AdminAccess({ apiUrl, basePath }: { apiUrl?: string; basePath: string }) {
  const [checking, setChecking] = useState(true);
  const [working, setWorking] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedToken = sessionStorage.getItem(TOKEN_KEY) || "";
    if (!savedToken || !apiUrl) {
      setChecking(false);
      return;
    }
    fetch(`${apiUrl}/api/admin/status`, {
      method: "POST",
      credentials: "omit",
      headers: { Authorization: `Bearer ${savedToken}`, "Content-Type": "application/json" },
      body: "{}",
    })
      .then(async (response) => ({ response, payload: await readPayload(response) }))
      .then(({ response, payload }) => {
        if (!response.ok) throw new Error(payload.message || "The admin session has expired.");
        setToken(savedToken);
        setProfile(payload as AdminProfile);
      })
      .catch(() => sessionStorage.removeItem(TOKEN_KEY))
      .finally(() => setChecking(false));
  }, [apiUrl]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!apiUrl || working) return;
    setWorking(true);
    setMessage("");
    try {
      const response = await fetch(`${apiUrl}/api/admin/login`, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = await readPayload(response);
      if (!response.ok || !payload.token) throw new Error(payload.message || "Admin sign-in failed.");
      sessionStorage.setItem(TOKEN_KEY, payload.token);
      setToken(payload.token);
      setProfile({
        username: payload.username,
        expiresAt: payload.expiresAt,
        releaseVersion: payload.releaseVersion || "1.1.0",
        checksum: payload.checksum || "",
      });
      setPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Admin sign-in failed.");
    } finally {
      setWorking(false);
    }
  }

  function signOut() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setProfile(null);
    setPassword("");
    setMessage("");
  }

  async function downloadPro() {
    if (!apiUrl || !token || working) return;
    setWorking(true);
    setMessage("");
    try {
      const response = await fetch(`${apiUrl}/api/admin/download`, {
        method: "POST",
        credentials: "omit",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) {
        const payload = await readPayload(response);
        throw new Error(payload.message || "The Pro download could not be prepared.");
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `SellerPhotoStudio-v${profile?.releaseVersion || "1.1.0"}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setMessage("Pro workspace downloaded. Unzip it and open index.html to use every feature offline.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The Pro download could not be prepared.");
    } finally {
      setWorking(false);
    }
  }

  if (checking) {
    return <main className="admin-page"><div className="admin-loading" role="status">Checking secure admin access...</div></main>;
  }

  return (
    <main className="admin-page">
      <nav className="admin-nav" aria-label="Admin navigation">
        <a className="brand" href={`${basePath}/`}><span className="brand-mark" aria-hidden="true">S</span><span>SellerPhoto Studio</span></a>
        {profile ? <button className="admin-signout" type="button" onClick={signOut}>Sign out</button> : <a href={`${basePath}/`}>Back to store</a>}
      </nav>

      {!profile ? (
        <section className="admin-login-card">
          <div className="eyebrow"><span className="live-dot" /> Private owner access</div>
          <h1>Admin login</h1>
          <p>Sign in to access the complete SellerPhoto Studio Pro workspace without checkout.</p>
          {!apiUrl ? <p className="admin-error" role="alert">Admin access is not configured for this deployment.</p> : null}
          <form onSubmit={signIn}>
            <label htmlFor="admin-username">Username</label>
            <input id="admin-username" name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
            <label htmlFor="admin-password">Password</label>
            <input id="admin-password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button className="button button-primary button-wide" type="submit" disabled={!apiUrl || working}>{working ? "Signing in..." : "Open admin workspace"}</button>
          </form>
          {message ? <p className="admin-error" role="alert">{message}</p> : null}
          <p className="admin-security-note">Credentials are checked by the secure fulfilment service. Sessions stay only in this browser tab and expire after eight hours.</p>
        </section>
      ) : (
        <section className="admin-dashboard">
          <header className="admin-dashboard-head">
            <div><div className="eyebrow eyebrow-dark">Authenticated as {profile.username}</div><h1>Every SellerPhoto Studio feature, ready.</h1><p>Your administrator session bypasses checkout while keeping the paid archive private.</p></div>
            <div className="admin-session-card"><span>SESSION ACTIVE</span><strong>Until {new Date(profile.expiresAt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong></div>
          </header>

          <div className="admin-primary-card">
            <div><span className="admin-card-number">FULL PRO SUITE</span><h2>SellerPhoto Studio Pro {profile.releaseVersion}</h2><p>Photo batches, video scenes, forecast lab, compliance controls, CSV/ZIP exports and offline use.</p></div>
            <button className="button button-primary" type="button" onClick={downloadPro} disabled={working}>{working ? "Preparing..." : "Download complete workspace"}</button>
          </div>
          {message ? <p className={message.startsWith("Pro workspace downloaded") ? "admin-success" : "admin-error"} role="status">{message}</p> : null}

          <div className="admin-tool-grid">
            <a href={`${basePath}/demo.html`} target="_blank" rel="noopener noreferrer"><span>01</span><h2>Photo studio</h2><p>Open the browser demo, then use Pro for 50-photo production batches.</p><strong>Open studio -&gt;</strong></a>
            <a href={`${basePath}/features/product-photo-video-studio/`}><span>02</span><h2>Video studio</h2><p>Review the 12-scene video workflow, motion, captions, logo and music controls.</p><strong>View workflow -&gt;</strong></a>
            <a href={`${basePath}/features/product-lifetime-forecasting/`}><span>03</span><h2>Forecast lab</h2><p>Review 60-month revenue, profit, cash flow, ROI and sensitivity planning.</p><strong>View forecast -&gt;</strong></a>
            <a href={`${basePath}/tools/marketplace-profit-calculator/`}><span>04</span><h2>Seller calculators</h2><p>Open marketplace profit and quick-commerce unit-economics tools.</p><strong>Calculate profit -&gt;</strong></a>
          </div>
          <p className="admin-checksum">Release checksum: <code>{profile.checksum || "Available with the download"}</code></p>
        </section>
      )}
    </main>
  );
}
