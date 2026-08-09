import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { siteContent } from "../data/content.mjs";

const componentSource = readFileSync(
  new URL("../components/ArchiveGate/ArchiveGateSite.js", import.meta.url),
  "utf8",
);
const styleSource = readFileSync(
  new URL("../components/ArchiveGate/ArchiveGateSite.module.scss", import.meta.url),
  "utf8",
);
const globalStyleSource = readFileSync(
  new URL("../styles/globals.scss", import.meta.url),
  "utf8",
);

test("B foundation uses a pointer-aware editorial hero without loading the 3D hero", () => {
  assert.doesNotMatch(componentSource, /import Hero from "\.\.\/Hero\/Hero";/);
  assert.match(componentSource, /usePointerCursor/);
  assert.match(componentSource, /signatureAura/);
  assert.match(componentSource, /data-cursor-label/);
});

test("header keeps navigation and language controls without a decorative brand lockup", () => {
  assert.doesNotMatch(componentSource, /styles\.brand/);
  assert.doesNotMatch(componentSource, /styles\.monogram/);
  assert.match(styleSource, /\.nav\s*\{[\s\S]*?grid-column:\s*2/);
  assert.match(styleSource, /\.languageSwitcher\s*\{[\s\S]*?grid-column:\s*3/);
});

test("experience cards expose scrubbed desktop motion and native mobile paging controls", () => {
  assert.match(componentSource, /experienceViewport/);
  assert.match(componentSource, /scrollTo\(/);
  assert.match(componentSource, /experienceControls/);
  assert.match(componentSource, /ScrollTrigger/);
  assert.match(componentSource, /getExperienceMotionMetrics/);
  assert.doesNotMatch(componentSource, /track\.scrollLeft = nextProgress/);
  assert.match(styleSource, /@media\s*\(max-width:\s*900px\)[\s\S]*?scroll-snap-type:\s*x mandatory/);
  assert.match(styleSource, /\.experienceViewport/);
});

test("pointer effects have coarse-pointer and reduced-motion fallbacks", () => {
  assert.match(componentSource, /pointer: coarse/);
  assert.match(styleSource, /@media\s*\(pointer:\s*coarse\)/);
  assert.match(styleSource, /prefers-reduced-motion/);
});

test("custom pointer uses an immediate core and a delayed follower while hiding the native cursor", () => {
  assert.match(componentSource, /cursorFollowerRef/);
  assert.match(componentSource, /requestAnimationFrame\(followPointer\)/);
  assert.match(componentSource, /styles\.cursorFollower/);
  assert.match(styleSource, /\.site\[data-pointer="ready"\][\s\S]*?cursor:\s*none/);
  assert.match(styleSource, /\.cursorFollower\s*\{/);
  assert.doesNotMatch(styleSource, /\.cursor::before\s*\{/);
});

test("primary call-to-action keeps readable text against the dark fill", () => {
  assert.match(styleSource, /\.site\s+\.primaryButton\s*\{[\s\S]*?color:\s*var\(--paper\)/);
});

test("hero workflow is presented as a connected solution map", () => {
  assert.match(componentSource, /solutionMap/);
  assert.match(componentSource, /solutionNode/);
  assert.match(componentSource, /solutionPath/);
  assert.match(styleSource, /@keyframes\s+solutionPulse/);
});

test("hero uses a reduced-motion-aware typewriter instead of the oversized role title", () => {
  assert.match(componentSource, /function TypewriterLine/);
  assert.match(componentSource, /copy\.hero\.typewriter/);
  assert.match(componentSource, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(componentSource, /<h1>\{copy\.hero\.title\}<\/h1>/);
  assert.doesNotMatch(componentSource, /copy\.hero\.statement/);
  assert.doesNotMatch(componentSource, /copy\.positioning\.secondary/);
  assert.match(styleSource, /--font-display:/);
  assert.match(styleSource, /\.heroIntro/);
  assert.match(styleSource, /\.typewriterLine/);
});

test("section labels are promoted to headings while explanatory copy becomes a lead", () => {
  assert.match(componentSource, /<h2>\{kicker\}<\/h2>/);
  assert.match(componentSource, /sectionLead/);
  assert.match(componentSource, /contactOpportunity/);
  assert.match(styleSource, /\.sectionHeading h2[\s\S]*font-size:\s*var\(--type-display-lg\)/);
  assert.match(styleSource, /\.contactOpportunity/);
});

test("site typography follows one capped responsive hierarchy across languages and viewports", () => {
  assert.match(styleSource, /--type-display-xl:\s*clamp\(3\.4rem,\s*5vw,\s*5\.2rem\)/);
  assert.match(styleSource, /--type-display-lg:\s*clamp\(2\.75rem,\s*4\.2vw,\s*4\.25rem\)/);
  assert.match(styleSource, /--type-display-md:\s*clamp\(1\.5rem,\s*2\.2vw,\s*2\.25rem\)/);
  assert.match(styleSource, /--type-card-title:\s*clamp\(1\.65rem,\s*2\.4vw,\s*2\.55rem\)/);
  assert.match(styleSource, /--type-body:\s*0\.9rem/);
  assert.match(styleSource, /--type-meta:\s*0\.66rem/);
  assert.match(styleSource, /\.heroIntro\s*\{[^}]*font-size:\s*var\(--type-display-xl\)/);
  assert.match(styleSource, /\.sectionLead,[\s\S]*?font-size:\s*var\(--type-display-md\)/);
  assert.match(styleSource, /\.experienceCard h3\s*\{[^}]*font-size:\s*var\(--type-card-title\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?--type-display-lg:\s*clamp\(2\.35rem,\s*9\.5vw,\s*3\.2rem\)/);
});

test("experience rail exposes the active card and progress", () => {
  assert.match(componentSource, /activeExperience/);
  assert.match(componentSource, /experienceProgress/);
  assert.match(componentSource, /role="progressbar"/);
  assert.match(componentSource, /onScroll=/);
});

test("desktop experience heading reserves space for English labels and keeps card detail readable", () => {
  assert.match(styleSource, /\.experienceSection \.sectionHeading\s*\{[^}]*grid-template-columns:\s*minmax\(18rem,\s*0\.72fr\)/);
  assert.match(styleSource, /\.experienceSection \.sectionLead\s*\{[^}]*font-size:\s*var\(--type-lead-compact\)/);
  assert.match(styleSource, /\.experienceCard\s*\{[^}]*border-radius:\s*1\.5rem/);
  assert.match(styleSource, /\.experienceCard h3\s*\{[^}]*font-size:\s*var\(--type-card-title\)/);
  assert.match(styleSource, /\.cardDescription\s*\{[^}]*font-size:\s*var\(--type-body\);[^}]*line-height:\s*1\.62/);
  assert.doesNotMatch(styleSource, /\.experienceRail\s*\{[^}]*scroll-behavior:\s*smooth/);
});

test("desktop vertical progress drives the horizontal experience story without trapping wheel input", () => {
  assert.match(componentSource, /experienceScrollProgress/);
  assert.match(componentSource, /getExperienceMotionMetrics/);
  assert.match(componentSource, /scrub:\s*1\.15/);
  assert.match(componentSource, /experienceStory/);
  assert.match(componentSource, /experienceSticky/);
  assert.doesNotMatch(componentSource, /preventDefault\(/);
  assert.doesNotMatch(styleSource, /\.experienceStory\s*\{[\s\S]*?height:\s*360vh/);
  assert.match(styleSource, /\.experienceSticky\s*\{[^}]*position:\s*sticky[^}]*\n\s*height:\s*100svh/);
  assert.match(styleSource, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.experienceSticky\s*\{[^}]*height:\s*auto/);
  assert.match(styleSource, /\.site\s*\{[^}]*overflow-x:\s*clip/);
  assert.doesNotMatch(styleSource, /\.site\s*\{[^}]*overflow:\s*hidden/);
  assert.equal((globalStyleSource.match(/overflow-x:\s*clip/g) || []).length, 2);
  assert.doesNotMatch(globalStyleSource, /overflow-x:\s*hidden/);
});

test("selected AI project is rendered as a connected evidence flow", () => {
  assert.match(componentSource, /projectSignalFlow/);
  assert.match(componentSource, /projectSignalConnector/);
  assert.match(componentSource, /projectOutcome/);
  assert.match(componentSource, /輸入訊號/);
  assert.match(componentSource, /輔助考官覆核/);
});

test("exactly three synthesis statements use scroll-progress illumination", () => {
  assert.match(componentSource, /useScrollTextReveal/);
  assert.equal((componentSource.match(/<ScrollText/g) || []).length, 3);
  assert.match(styleSource, /data-scroll-text/);
  assert.match(styleSource, /--text-progress/);
});

for (const locale of ["en", "zh-CN", "zh-HK"]) {
  test(locale + " contains the selected AI project evidence block", () => {
    const project = siteContent[locale].aiProject;
    assert.ok(project?.title);
    assert.ok(project?.background);
    assert.ok(project?.role);
    assert.equal(project.modules.length, 4);
    assert.ok(project.boundary);
  });
}
