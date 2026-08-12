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
  assert.match(indexSource, /withPublicBasePath\("\/brand-mark\.svg"\)/);
});

test("experience is a normal-flow vertical timeline with no scroll hijacking", () => {
  assert.match(componentSource, /experienceTimeline/);
  assert.match(componentSource, /experienceTimelineItem/);
  assert.match(componentSource, /item\.focus/);
  assert.doesNotMatch(componentSource, /ScrollTrigger/);
  assert.doesNotMatch(componentSource, /getExperienceMotionMetrics/);
  assert.doesNotMatch(componentSource, /experienceScrollProgress/);
  assert.match(styleSource, /\.experienceTimeline\s*\{/);
  assert.match(styleSource, /\.experienceTimelineItem\s*\{/);
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

test("typewriter copy avoids artificial wrapping and uses a stable medium sans treatment", () => {
  const typewriterBlock = styleSource.match(/\.typewriterLine\s*\{[^}]*\}/)?.[0] || "";
  assert.match(typewriterBlock, /max-width:\s*min\(100%,\s*36rem\)/);
  assert.match(typewriterBlock, /min-height:\s*1\.5em/);
  assert.match(typewriterBlock, /font-family:\s*inherit/);
  assert.match(typewriterBlock, /font-weight:\s*500/);
  assert.match(typewriterBlock, /letter-spacing:\s*0/);
  assert.doesNotMatch(typewriterBlock, /max-width:\s*23ch|font-family:\s*ui-monospace/);
});

test("experience timeline keeps normal page flow on short desktop screens", () => {
  assert.doesNotMatch(componentSource, /matchMedia\("\(max-height: 760px\)"\)/);
  assert.match(styleSource, /\.experienceStory\s*\{[\s\S]*display:\s*grid/);
  assert.doesNotMatch(styleSource, /\.experienceStory\s*\{[\s\S]*height:\s*360vh/);
  assert.doesNotMatch(styleSource, /\.experienceTimeline\s*\{[\s\S]*overflow-y:\s*(auto|scroll)/);
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

test("candidate name steps down one display level without changing the Hero structure", () => {
  assert.match(styleSource, /\.heroName\s*\{[\s\S]*?font-size:\s*var\(--type-display-lg\)/);
  assert.match(styleSource, /\.site\[lang="zh-CN"\]\s+\.heroName,[\s\S]*?\.site\[lang="zh-HK"\]\s+\.heroName\s*\{[\s\S]*?font-size:\s*var\(--type-display-lg-cjk\)/);
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
  assert.match(styleSource, /\.experienceTimelineItem h3\s*\{[^}]*font-size:\s*var\(--type-card-title\)/);
  assert.match(styleSource, /\.menuLink\s*\{[\s\S]*font-size:\s*var\(--type-menu-link\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?--type-display-xl:\s*clamp\(2\.3rem,\s*8\.4vw,\s*3rem\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?--type-display-lg-cjk:\s*clamp\(1\.8rem,\s*6\.8vw,\s*2\.4rem\)/);
});

test("experience timeline keeps the recruiter scan order visible", () => {
  assert.match(componentSource, /item\.period/);
  assert.match(componentSource, /item\.company/);
  assert.match(componentSource, /item\.role/);
  assert.match(componentSource, /item\.focus/);
  assert.match(componentSource, /item\.tags\.map/);
  assert.match(styleSource, /\.experienceTimelineMeta\s*\{/);
  assert.match(styleSource, /\.experienceTimelineBody\s*\{/);
});

test("experience heading can stay sticky without becoming a nested scroll region", () => {
  assert.match(styleSource, /\.experienceSticky\s*\{[\s\S]*position:\s*sticky/);
  assert.match(styleSource, /\.experienceTimeline\s*\{[\s\S]*position:\s*relative/);
  assert.match(styleSource, /\.experienceTimelineItem\s*\{[\s\S]*border-bottom:\s*1px solid var\(--line\)/);
  assert.match(styleSource, /\.experienceTimelineItem h3\s*\{[\s\S]*font-size:\s*var\(--type-card-title\)/);
});

test("experience timeline collapses to one column on narrow screens", () => {
  assert.match(styleSource, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.experienceStory\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.experienceTimelineItem\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.experienceTimeline\s*\{/);
});

test("skills content gets an inner mobile gutter instead of touching the container edge", () => {
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.skillsSection\s*>\s*\.container\s*\{[\s\S]*?padding-inline:\s*var\(--space-2\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.metrics article\s*\{[\s\S]*?padding:\s*1\.5rem var\(--space-3\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.capabilityCard,[\s\S]*?\.practiceCard\s*\{[\s\S]*?padding:\s*1\.25rem var\(--space-3\) 2rem/);
});

test("experience removes the former horizontal scroll implementation", () => {
  assert.doesNotMatch(componentSource, /scrub:\s*1\.15/);
  assert.doesNotMatch(componentSource, /experienceControls/);
  assert.doesNotMatch(componentSource, /experienceViewport/);
  assert.doesNotMatch(componentSource, /preventDefault\(/);
  assert.match(styleSource, /\.site\s*\{[^}]*overflow-x:\s*clip/);
  assert.doesNotMatch(styleSource, /\.site\s*\{[^}]*overflow:\s*hidden/);
  assert.equal((globalStyleSource.match(/overflow-x:\s*clip/g) || []).length, 2);
  assert.doesNotMatch(globalStyleSource, /overflow-x:\s*hidden/);
});

test("selected work is a concise horizontal draggable showcase", () => {
  assert.match(componentSource, /projectShowcaseRail/);
  assert.match(componentSource, /projectShowcaseCard/);
  assert.match(componentSource, /onPointerDown/);
  assert.match(componentSource, /onPointerMove/);
  assert.match(componentSource, /scrollBy/);
  assert.doesNotMatch(componentSource, /ProjectEvidenceCard/);
  assert.doesNotMatch(componentSource, /projectSignalFlow/);
  assert.match(styleSource, /\.projectShowcaseRail\s*\{[\s\S]*overflow-x:\s*auto/);
  assert.match(styleSource, /\.projectShowcaseCard\s*\{[\s\S]*scroll-snap-align:\s*start/);
  assert.match(styleSource, /\.projectShowcaseCard\s*\{[\s\S]*flex:\s*0 0/);
  assert.match(styleSource, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.projectShowcaseRail/);
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
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.projectShowcaseCard\s*\{[^}]*flex:\s*0 0 calc\(100vw\s*-\s*4\s*\*\s*var\(--gutter\)\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.projectShowcaseRail\s*\{[\s\S]*scroll-padding-inline:\s*var\(--gutter\)/);
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
