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
const indexSource = readFileSync(
  new URL("../pages/index.js", import.meta.url),
  "utf8",
);
const brandMarkSource = readFileSync(
  new URL("../public/brand-mark.svg", import.meta.url),
  "utf8",
);

test("B foundation uses a pointer-aware editorial hero without loading the 3D hero", () => {
  assert.doesNotMatch(componentSource, /import Hero from "\.\.\/Hero\/Hero";/);
  assert.match(componentSource, /usePointerCursor/);
  assert.match(componentSource, /signatureAura/);
  assert.match(componentSource, /data-cursor-label/);
});

test("header keeps the menu while reserving the E mark for the conditional loader", () => {
  assert.doesNotMatch(componentSource, /className=\{styles\.brandMark\}/);
  assert.match(componentSource, /styles\.menuButton/);
  assert.match(componentSource, /aria-controls="site-navigation"/);
  assert.match(componentSource, /EBrandMark className=\{styles\.pageLoaderMark\}/);
  assert.match(styleSource, /\.languageSwitcher\s*\{[\s\S]*?grid-column:\s*2/);
  assert.match(brandMarkSource, /E monogram/);
  assert.match(brandMarkSource, /#174EA6/);
});

test("the menu opens an overlay with a rotating close control at every viewport", () => {
  assert.match(componentSource, /menuOverlay/);
  assert.match(componentSource, /data-menu-open=\{mobileMenuOpen\}/);
  assert.match(componentSource, /className=\{styles\.menuIcon\}/);
  assert.match(componentSource, /className=\{styles\.menuLink\}/);
  assert.match(componentSource, /onClick=\{closeMobileMenu\}/);
  assert.match(styleSource, /\.menuOverlay\[data-open="true"\]/);
  assert.match(styleSource, /\.menuIcon\s*\{[\s\S]*?transform/);
  assert.match(styleSource, /\.menuLink:hover[\s\S]*?color:\s*var\(--menu-pink\)/);
});

test("navigation keeps the five section links accessible in the overlay", () => {
  assert.match(componentSource, /aria-expanded=\{mobileMenuOpen\}/);
  assert.match(componentSource, /aria-controls="site-navigation"/);
  assert.match(componentSource, /id="site-navigation"/);
  assert.match(componentSource, /onClick=\{closeMobileMenu\}/);
  for (const target of ["#home", "#experience", "#project", "#skills", "#contact"]) {
    assert.match(componentSource, new RegExp(`href="${target}"`));
  }
  assert.match(styleSource, /\.menuOverlay\[data-open="true"\][\s\S]*?pointer-events:\s*auto/);
});

test("the E loader only appears for a slow render and respects reduced motion", () => {
  assert.match(componentSource, /const LOADER_SHOW_DELAY\s*=\s*220/);
  assert.match(componentSource, /const LOADER_MIN_VISIBLE\s*=\s*900/);
  assert.match(componentSource, /window\.addEventListener\("load", finish/);
  assert.match(componentSource, /data-phase=\{phase\}/);
  assert.match(styleSource, /@keyframes\s+pageLoaderProgress/);
  assert.match(styleSource, /\.pageLoader\[data-phase="visible"\]/);
  assert.match(styleSource, /\.pageLoader\[data-phase="exiting"\]/);
  assert.doesNotMatch(styleSource, /animation:\s*pageLoaderExit/);
  assert.match(styleSource, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.pageLoader\s*\{/);
});

test("the page renders exactly the five recruiter-facing primary sections", () => {
  const sectionIds = [...componentSource.matchAll(/<section id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual([...sectionIds].sort(), ["contact", "experience", "home", "project", "skills"]);
  assert.doesNotMatch(componentSource, /id="(about|role|ai)"/);
});

test("footer keeps the identity line without the removed motion slogan", () => {
  assert.match(componentSource, /<footer className=\{styles\.footer\}>[\s\S]*<span>ZS · Zhicheng Situ<\/span>[\s\S]*<\/footer>/);
  assert.doesNotMatch(componentSource, /copy\.footer/);
});

test("the document points to the existing favicon asset", () => {
  assert.match(indexSource, /rel="icon" href="\/brand-mark\.svg"/);
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

test("hero CV download keeps a visible secondary button frame", () => {
  assert.match(componentSource, /className=\{styles\.textButton\}[\s\S]*?download/);
  assert.match(styleSource, /\.textButton\s*\{[\s\S]*?padding:\s*0\.82rem 1rem;[\s\S]*?border:\s*1px solid var\(--ink\);[\s\S]*?border-radius:\s*var\(--radius-control\)/);
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
  assert.match(componentSource, /className=\{styles\.heroPositioning\}>\{copy\.positioning\.primary\}<\/p>/);
  assert.doesNotMatch(componentSource, /heroClaim|positioning\.secondary/);
  assert.match(styleSource, /--font-display:/);
  assert.match(styleSource, /\.heroIntro/);
  assert.match(styleSource, /\.typewriterLine[\s\S]*font-size:\s*var\(--text-lg\)/);
  assert.match(styleSource, /\.heroPositioning[\s\S]*font-size:\s*var\(--type-lead-compact\)/);
});

test("typewriter pacing gives each phrase a slower read and a longer pause", () => {
  assert.match(componentSource, /TYPEWRITER_TYPE_DELAY\s*=\s*92/);
  assert.match(componentSource, /TYPEWRITER_DELETE_DELAY\s*=\s*48/);
  assert.match(componentSource, /TYPEWRITER_HOLD_DELAY\s*=\s*3500/);
});

test("short desktop heights fall back to a readable vertical experience flow", () => {
  assert.match(componentSource, /matchMedia\("\(max-height: 760px\)"\)/);
  assert.match(componentSource, /shortHeight\.matches/);
  assert.match(styleSource, /@media\s*\(min-width:\s*901px\)\s*and\s*\(max-height:\s*760px\)/);
  assert.match(styleSource, /@media[\s\S]*max-height:\s*760px[\s\S]*\.experienceSticky[\s\S]*position:\s*relative/);
  assert.match(styleSource, /@media[\s\S]*max-height:\s*760px[\s\S]*\.experienceRail[\s\S]*overflow-x:\s*auto/);
});

test("decorative motion stays secondary to readable content", () => {
  assert.match(componentSource, /className=\{styles\.typewriterLine\} aria-live="off"/);
  assert.match(componentSource, /revealReady/);
  assert.match(styleSource, /\.site\[data-reveal-ready="true"\]\s+\[data-reveal\]/);
  assert.match(styleSource, /\.scrollTextBase[\s\S]*rgba\(21,\s*28,\s*38,\s*0\.5/);
  assert.match(styleSource, /--motion-instant:\s*80ms/);
});

test("section labels are promoted to headings while explanatory copy becomes a lead", () => {
  assert.match(componentSource, /<h2>\{kicker\}<\/h2>/);
  assert.match(componentSource, /sectionLead/);
  assert.match(componentSource, /contactOpportunity/);
  assert.match(styleSource, /\.sectionHeading h2[\s\S]*font-size:\s*var\(--type-display-lg\)/);
  assert.match(styleSource, /\.contactOpportunity/);
});

test("hero greeting stays two levels below the candidate name", () => {
  assert.match(styleSource, /\.heroEyebrow\s*\{[\s\S]*?font-size:\s*var\(--type-display-md\)/);
  assert.match(styleSource, /\.site\[lang="zh-CN"\]\s+\.heroEyebrow,[\s\S]*?\.site\[lang="zh-HK"\]\s+\.heroEyebrow\s*\{[\s\S]*?font-size:\s*var\(--type-display-md-cjk\)/);
});

test("site typography follows one capped responsive hierarchy across languages and viewports", () => {
  assert.match(styleSource, /--text-xs:\s*0\.75rem/);
  assert.match(styleSource, /--text-sm:\s*0\.875rem/);
  assert.match(styleSource, /--text-base:\s*1rem/);
  assert.match(styleSource, /--space-4:/);
  assert.match(styleSource, /--container-wide:/);
  assert.match(styleSource, /--radius-card:/);
  assert.match(styleSource, /--motion-fast:/);
  assert.match(styleSource, /--type-display-xl:\s*clamp\(2\.75rem,\s*3\.8vw,\s*4rem\)/);
  assert.match(styleSource, /--type-display-lg:\s*clamp\(2\.2rem,\s*3\.1vw,\s*3\.1rem\)/);
  assert.match(styleSource, /--type-display-lg-cjk:\s*clamp\(2\.1rem,\s*2\.9vw,\s*2\.9rem\)/);
  assert.match(styleSource, /--type-display-md:\s*clamp\(1\.3rem,\s*1\.7vw,\s*1\.75rem\)/);
  assert.match(styleSource, /--type-card-title:\s*clamp\(1\.4rem,\s*1\.8vw,\s*2rem\)/);
  assert.match(styleSource, /--type-menu-link:\s*clamp\(1\.75rem,\s*3\.2vw,\s*2\.5rem\)/);
  assert.match(styleSource, /--type-body:\s*var\(--text-sm\)/);
  assert.match(styleSource, /--type-meta:\s*var\(--text-xs\)/);
  assert.match(styleSource, /:focus-visible/);
  const directFontSizes = [...styleSource.matchAll(/font-size:\s*(\d+(?:\.\d+)?)rem/g)].map((match) => Number(match[1]));
  assert.ok(directFontSizes.every((size) => size >= 0.75), `found unreadably small font sizes: ${directFontSizes.join(", ")}`);
  assert.match(styleSource, /\.heroIntro\s*\{[^}]*font-size:\s*var\(--type-display-xl\)/);
  assert.match(styleSource, /\.sectionLead,[\s\S]*?font-size:\s*var\(--type-display-md\)/);
  assert.match(styleSource, /\.experienceCard h3\s*\{[^}]*font-size:\s*var\(--type-card-title\)/);
  assert.match(styleSource, /\.menuLink\s*\{[\s\S]*font-size:\s*var\(--type-menu-link\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?--type-display-xl:\s*clamp\(2\.3rem,\s*8\.4vw,\s*3rem\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?--type-display-lg-cjk:\s*clamp\(1\.8rem,\s*6\.8vw,\s*2\.4rem\)/);
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
  assert.match(styleSource, /\.experienceCard\s*\{[^}]*border-radius:\s*var\(--radius-card\)/);
  assert.match(styleSource, /\.experienceCard h3\s*\{[^}]*font-size:\s*var\(--type-card-title\)/);
  assert.match(styleSource, /\.cardDescription\s*\{[^}]*font-size:\s*var\(--type-body\);[^}]*line-height:\s*1\.62/);
  assert.doesNotMatch(styleSource, /\.experienceRail\s*\{[^}]*scroll-behavior:\s*smooth/);
});

test("experience cards separate the index from the period on narrow screens", () => {
  assert.match(styleSource, /\.cardTopline\s*\{[\s\S]*?justify-content:\s*flex-start;[\s\S]*?gap:\s*var\(--space-3\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.cardTopline\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-wrap:\s*wrap/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.cardKicker\s*\{[\s\S]*?margin-top:\s*0/);
});

test("skills content gets an inner mobile gutter instead of touching the container edge", () => {
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.skillsSection\s*>\s*\.container\s*\{[\s\S]*?padding-inline:\s*var\(--space-2\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.metrics article\s*\{[\s\S]*?padding:\s*1\.5rem var\(--space-3\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.capabilityCard,[\s\S]*?\.practiceCard\s*\{[\s\S]*?padding:\s*1\.25rem var\(--space-3\) 2rem/);
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

test("the consolidated skills section keeps one reduced-motion-safe synthesis statement", () => {
  assert.match(componentSource, /useScrollTextReveal/);
  assert.equal((componentSource.match(/<ScrollText/g) || []).length, 1);
  assert.match(styleSource, /data-scroll-text/);
  assert.match(styleSource, /--text-progress/);
});

test("responsive layout uses a shared gutter and narrow fallback", () => {
  assert.match(styleSource, /--gutter:\s*clamp\(1\.125rem,\s*4vw,\s*2\.5rem\)/);
  assert.match(styleSource, /width:\s*min\(calc\(100%\s*-\s*2\s*\*\s*var\(--gutter\)\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*1050px\)[\s\S]*?\.projectLayout\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.experienceCard\s*\{[^}]*width:\s*calc\(100vw\s*-\s*2\s*\*\s*var\(--gutter\)\)/);
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
