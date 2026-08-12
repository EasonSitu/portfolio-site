import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { withPublicBasePath } from "../lib/publicPath.mjs";

const robotsSource = readFileSync(new URL("../public/robots.txt", import.meta.url), "utf8");
const manifestSource = readFileSync(new URL("../public/manifest.json", import.meta.url), "utf8");
const notFoundSource = readFileSync(new URL("../pages/404.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../pages/index.js", import.meta.url), "utf8");
const documentSource = readFileSync(new URL("../pages/_document.js", import.meta.url), "utf8");
const componentSource = readFileSync(new URL("../components/ArchiveGate/ArchiveGateSite.js", import.meta.url), "utf8");
const nextConfigSource = readFileSync(new URL("../next.config.mjs", import.meta.url), "utf8");
const brandMarkSource = readFileSync(new URL("../public/brand-mark.svg", import.meta.url), "utf8");
const ogCardSource = readFileSync(new URL("../public/og-card.svg", import.meta.url), "utf8");
const sitemapUrl = new URL("../public/sitemap.xml", import.meta.url);

test("release metadata identifies Zhicheng Situ without an invented domain", () => {
  assert.match(manifestSource, /"name"\s*:\s*"Zhicheng Situ/);
  assert.match(manifestSource, /"short_name"\s*:\s*"Zhicheng Situ"/);
  assert.doesNotMatch(robotsSource, /shubhporwal|shubh73/i);
  assert.doesNotMatch(manifestSource, /shubhporwal|shubh73|Shubh Porwal/i);
  assert.equal(existsSync(sitemapUrl), false);
});

test("404 is a lightweight recruiter-site fallback in Traditional Chinese", () => {
  assert.match(notFoundSource, /next\/head/);
  assert.match(notFoundSource, /lang="zh-Hant-HK"/);
  assert.match(notFoundSource, /返回首頁/);
  assert.doesNotMatch(notFoundSource, /components\/(Button|Cursor)|from "gsap"/);
});

test("the active favicon and manifest mark the current candidate, not the source template", () => {
  assert.match(indexSource, /withPublicBasePath\("\/brand-mark\.svg"\)/);
  assert.match(manifestSource, /"src"\s*:\s*"\.\/brand-mark\.svg"/);
  assert.match(brandMarkSource, /Zhicheng Situ/);
  assert.doesNotMatch(manifestSource, /icon-(?:192|256|384|512)x/);
});

test("social metadata points to a local recruiter-facing preview without inventing a domain", () => {
  assert.match(indexSource, /property="og:title"/);
  assert.match(indexSource, /property="og:description"/);
  assert.match(indexSource, /withPublicBasePath\("\/og-card\.svg"\)/);
  assert.match(indexSource, /name="twitter:card" content="summary_large_image"/);
  assert.match(ogCardSource, /Zhicheng Situ/);
  assert.match(ogCardSource, /Solution Delivery/);
});

test("public assets resolve from both the root site and the GitHub Pages project path", () => {
  assert.equal(withPublicBasePath("/brand-mark.svg"), "/brand-mark.svg");
  assert.equal(withPublicBasePath("/brand-mark.svg", "/portfolio-site"), "/portfolio-site/brand-mark.svg");
  assert.equal(withPublicBasePath("Zhicheng-Situ-CV.pdf", "/portfolio-site"), "/portfolio-site/Zhicheng-Situ-CV.pdf");
  assert.match(indexSource, /withPublicBasePath\("\/brand-mark\.svg"\)/);
  assert.match(indexSource, /withPublicBasePath\("\/og-card\.svg"\)/);
  assert.match(documentSource, /withPublicBasePath\("\/manifest\.json"\)/);
  assert.match(componentSource, /withPublicBasePath\(copy\.contact\.resume\)/);
});

test("Next.js is configured for a GitHub Pages static project site", () => {
  assert.match(nextConfigSource, /output:\s*["']export["']/);
  assert.match(nextConfigSource, /trailingSlash:\s*true/);
  assert.match(nextConfigSource, /basePath/);
  assert.match(nextConfigSource, /images:\s*\{\s*unoptimized:\s*true,?\s*\}/);
  assert.match(manifestSource, /"start_url"\s*:\s*"\.\/"/);
  assert.match(manifestSource, /"src"\s*:\s*"\.\/brand-mark\.svg"/);
});

test("GitHub Pages deployment workflow publishes the exported site", () => {
  const workflowSource = readFileSync(
    new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
    "utf8",
  );
  assert.match(workflowSource, /actions\/upload-pages-artifact/);
  assert.match(workflowSource, /actions\/deploy-pages/);
  assert.match(workflowSource, /path:\s*\.\/out/);
});
