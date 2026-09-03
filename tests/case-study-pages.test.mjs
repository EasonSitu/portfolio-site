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
  assert.match(source, /href="\/#project"/);
  assert.match(source, /localeLabels\.context/);
  assert.match(source, /localeLabels\.myRole/);
  assert.match(source, /localeLabels\.approach/);
  assert.match(source, /localeLabels\.evidence/);
  assert.match(source, /localeLabels\.outcome/);
  assert.match(source, /caseStudyHeroMedia/);
  assert.match(source, /project\.heroImage/);
  assert.match(source, /project\.evidenceImages/);
  assert.match(source, /roleHighlights\.map/);
  assert.match(source, /project\.validation/);
  assert.match(source, /project\.process/);
  assert.match(source, /moduleFlow/);
  assert.match(source, /withPublicBasePath/);
  assert.match(source, /data-case-study-section="context"/);
  assert.match(source, /data-case-study-section="role"/);
  assert.match(source, /data-case-study-section="approach"/);
  assert.match(source, /data-case-study-section="validation"/);
  assert.match(source, /data-case-study-section="evidence"/);
  assert.match(source, /data-case-study-section="outcome"/);
  assert.match(source, /findIndex/);
  assert.match(style, /\.caseStudySection\s*\{/);
  assert.match(style, /\.caseStudyEvidence\s*\{/);
  assert.match(style, /\.roleHighlights\s*\{/);
  assert.match(style, /\.moduleFlow\s*\{/);
  assert.match(style, /\.validationGrid\s*\{/);
  assert.match(style, /\.caseStudyHeroMedia\s*\{/);
  assert.match(style, /\.evidenceGrid\s*\{/);
  assert.match(style, /\.evidenceItem\s*\{/);
  assert.match(style, /@keyframes\s+caseStudyEnter/);
  assert.match(style, /prefers-reduced-motion/);
});

test("CIC case study keeps the visible report focused", () => {
  const source = readFileSync(componentPath, "utf8");

  assert.match(source, /const isCicProject = project\?\.id === "cic-ai-assessment"/);
  assert.match(source, /project\.roleDetail/);
  assert.match(source, /!isCicProject && project\.boundary/);
  assert.match(source, /!isCicProject && hasApproach/);
  assert.match(source, /!isCicProject && hasValidation/);
  assert.doesNotMatch(source, /project\.roleHighlights\.map/);
  assert.match(source, /outcome: "What we reached"/);
  assert.match(source, /outcome: "做到了什么"/);
  assert.match(source, /outcome: "做到了甚麼"/);
});
