import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const routePath = new URL("../pages/work/[slug].js", import.meta.url);
const componentPath = new URL("../components/CaseStudy/CaseStudyPage.js", import.meta.url);
const stylePath = new URL("../components/CaseStudy/CaseStudyPage.module.scss", import.meta.url);

test("selected work has a static case-study route", () => {
  assert.equal(existsSync(routePath), true);
  const source = readFileSync(routePath, "utf8");
  assert.match(source, /getStaticPaths/);
  assert.match(source, /getStaticProps/);
  assert.match(source, /selectedProjects/);
  assert.match(source, /CaseStudyPage/);
});

test("case-study page uses the existing locale content without inventing project evidence", () => {
  assert.equal(existsSync(componentPath), true);
  assert.equal(existsSync(stylePath), true);
  const source = readFileSync(componentPath, "utf8");
  const style = readFileSync(stylePath, "utf8");
  assert.match(source, /selectedProjects/);
  assert.match(source, /localStorage/);
  assert.match(source, /project\.summary/);
  assert.match(source, /project\.role/);
  assert.match(source, /project\.tags/);
  assert.match(source, /project\.boundary/);
  assert.match(source, /withPublicBasePath/);
  assert.match(source, /localeLabels\.context/);
  assert.match(source, /localeLabels\.role/);
  assert.match(source, /localeLabels\.approach/);
  assert.match(source, /localeLabels\.evidence/);
  assert.match(source, /localeLabels\.outcome/);
  assert.match(source, /localeLabels\.next/);
  assert.match(source, /caseStudyHeroMedia/);
  assert.match(source, /data-case-study-section="context"/);
  assert.match(source, /data-case-study-section="role"/);
  assert.match(source, /data-case-study-section="approach"/);
  assert.match(source, /data-case-study-section="evidence"/);
  assert.match(source, /data-case-study-section="outcome"/);
  assert.match(source, /caseStudyPlaceholder/);
  assert.match(source, /nextProject/);
  assert.match(source, /findIndex/);
  assert.match(style, /\.caseStudySection\s*\{/);
  assert.match(style, /\.caseStudyEvidence\s*\{/);
  assert.match(style, /\.caseStudyPlaceholder\s*\{/);
  assert.match(style, /\.caseStudyHeroMedia\s*\{/);
  assert.match(style, /@keyframes\s+caseStudyEnter/);
  assert.match(style, /prefers-reduced-motion/);
});
