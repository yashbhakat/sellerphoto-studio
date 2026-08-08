import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished SellerPhoto Studio storefront", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /SellerPhoto Studio/);
  assert.match(html, /Turn everyday photos into a/);
  assert.match(html, /Try 3 photos free/);
  assert.match(html, /FIRST 20 CUSTOMERS/);
  assert.match(html, /src="\/demo\.html"/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton|taking shape/i);
});

test("ships a limited public demo and a full offline product", async () => {
  const [demo, product, studio, productStudio, packageJson] = await Promise.all([
    readFile(new URL("public/demo.html", root), "utf8"),
    readFile(new URL("product/index.html", root), "utf8"),
    readFile(new URL("public/studio.js", root), "utf8"),
    readFile(new URL("product/studio.js", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);
  assert.match(demo, /data-mode="demo" data-limit="3"/);
  assert.match(product, /data-mode="pro" data-limit="50"/);
  assert.match(product, /href="\.\/studio\.css"/);
  assert.match(product, /src="\.\/studio\.js"/);
  assert.equal(productStudio, studio);
  assert.match(studio, /function createZip/);
  assert.match(studio, /image\/jpeg/);
  assert.match(studio, /image\/png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await Promise.all([
    access(new URL("product/README.txt", root)),
    access(new URL("product/studio.css", root)),
  ]);
});
