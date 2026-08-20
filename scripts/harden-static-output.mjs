import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const apiOrigin = (process.env.NEXT_PUBLIC_FULFILMENT_API_URL || "").trim().replace(/\/$/, "");
const connectSources = ["'self'", apiOrigin].filter(Boolean).join(" ");
const policy = [
  "default-src 'self'",
  "base-uri 'self'",
  `connect-src ${connectSources}`,
  "font-src 'self' data:",
  "frame-src 'none'",
  "img-src 'self' data: blob:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");
const csp = `<meta http-equiv="Content-Security-Policy" content="${policy}"/>`;

for (const route of ["admin", "download"]) {
  const path = `${projectRoot}out/${route}/index.html`;
  const html = await readFile(path, "utf8");
  if (!html.includes("<head>")) throw new Error(`${route} output has no head element`);
  const hardened = html.includes('http-equiv="Content-Security-Policy"')
    ? html
    : html.replace("<head>", `<head>${csp}`);
  await writeFile(path, hardened, "utf8");
}

console.log("Hardened static admin and download routes with route-specific CSP metadata.");
