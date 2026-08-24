import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { siteContent } from "../data/content.mjs";

const componentSource = readFileSync(
  new URL("../components/ArchiveGate/ArchiveGateSite.js", import.meta.url),
  "utf8",
);
const heroTowerSource = readFileSync(
  new URL("../components/ArchiveGate/HeroTowerVisual.js", import.meta.url),
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
  assert.match(styleSource, /\.cursor\s*\{[\s\S]*?mix-blend-mode:\s*difference/);
  assert.match(styleSource, /\.cursorFollower\s*\{[\s\S]*?mix-blend-mode:\s*difference/);
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
  assert.match(styleSource, /\.menuLink:hover[\s\S]*?color:\s*var\(--accent\)/);
  assert.doesNotMatch(styleSource, /var\(--menu-pink\)/);
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

test("the E loader owns the initial Hero wait and respects reduced motion", () => {
  assert.match(componentSource, /function PageLoader\(\{ ready \}\)/);
  assert.match(componentSource, /const LOADER_MIN_VISIBLE\s*=\s*900/);
  assert.match(componentSource, /const LOADER_FAILSAFE_DURATION\s*=\s*3200/);
  assert.match(componentSource, /<PageLoader ready=\{heroReady\}/);
  assert.match(componentSource, /onReady=\{handleHeroReady\}/);
  assert.match(componentSource, /loading:\s*\(\)\s*=>\s*null/);
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

test("footer no longer renders the removed identity line", () => {
  assert.doesNotMatch(componentSource, /ZS · Zhicheng Situ/);
  assert.doesNotMatch(componentSource, /copy\.footer/);
});

test("contact actions keep clean labels without decorative arrows", () => {
  const contactBlock = componentSource.match(/<section id="contact"[\s\S]*?<\/section>/)?.[0] || "";
  assert.doesNotMatch(contactBlock, /<span>[↗↓]<\/span>/);
});

test("the document points to the existing favicon asset", () => {
  assert.match(indexSource, /withPublicBasePath\("\/brand-mark\.svg"\)/);
});

test("experience is a normal-flow selectable timeline with no scroll hijacking", () => {
  assert.match(componentSource, /experienceExplorer/);
  assert.match(componentSource, /experienceSelectableCard/);
  assert.match(componentSource, /item\.focus/);
  assert.doesNotMatch(componentSource, /ScrollTrigger/);
  assert.doesNotMatch(componentSource, /getExperienceMotionMetrics/);
  assert.doesNotMatch(componentSource, /experienceScrollProgress/);
  assert.doesNotMatch(componentSource, /experienceRail/);
  assert.match(styleSource, /\.experienceExplorer\s*\{/);
  assert.match(styleSource, /\.experienceSelectableCard\s*\{/);
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

test("hero workflow is presented as an interactive five-layer tower", () => {
  assert.match(componentSource, /HeroTowerVisual/);
  assert.match(componentSource, /ssr:\s*false/);
  assert.match(heroTowerSource, /Hero_Layer_0\(\[1-5\]\)/);
  assert.match(heroTowerSource, /aria-pressed/);
  assert.match(heroTowerSource, /prefers-reduced-motion/);
  assert.doesNotMatch(componentSource, /className=\{styles\.solutionMap\}/);
});

test("hero tower floats without the old frame, grid background or helper labels", () => {
  assert.doesNotMatch(componentSource, /heroVisualHeader/);
  assert.match(styleSource, /\.heroVisual\s*\{[\s\S]*?padding:\s*0;[\s\S]*?border:\s*0;[\s\S]*?border-radius:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/);
  assert.doesNotMatch(styleSource, /\.heroTowerCanvas[\s\S]*?translate3d\(-1\.4rem/);
  assert.doesNotMatch(styleSource, /\.heroTowerFallback[\s\S]*?scale\(1\.12\)/);
  assert.match(styleSource, /@keyframes\s+heroTowerAnnotationIn/);
  assert.match(styleSource, /@keyframes\s+heroTowerAnnotationOut/);
  assert.doesNotMatch(styleSource, /\.heroVisual::after\s*\{/);
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

test("typewriter reveals and deletes one character at a time", () => {
  assert.match(componentSource, /TYPEWRITER_TYPE_DELAY\s*=\s*92/);
  assert.match(componentSource, /TYPEWRITER_DELETE_DELAY\s*=\s*48/);
  assert.match(componentSource, /TYPEWRITER_HOLD_DELAY\s*=\s*3500/);
  assert.match(componentSource, /let characterIndex\s*=\s*0/);
  assert.match(componentSource, /let deleting\s*=\s*false/);
  assert.match(componentSource, /phrase\.slice\(0,\s*characterIndex\)/);
  assert.match(componentSource, /characterIndex\s*-=\s*1/);
  assert.match(componentSource, /window\.setTimeout\(tick,\s*TYPEWRITER_DELETE_DELAY\)/);
  assert.doesNotMatch(componentSource, /TYPEWRITER_FADE_DELAY|typewriterChanging/);
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
  assert.match(styleSource, /\.experienceExplorer\s*\{[\s\S]*display:\s*grid/);
  assert.doesNotMatch(styleSource, /\.experienceExplorer\s*\{[\s\S]*height:\s*360vh/);
  assert.doesNotMatch(styleSource, /experienceDetailPanel/);
});

test("decorative motion stays secondary to readable content", () => {
  assert.match(componentSource, /styles\.typewriterLine/);
  assert.match(componentSource, /aria-live="off"/);
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

test("contact uses a two-column message and action layout with a lighter talk anchor", () => {
  assert.match(componentSource, /contactLayout/);
  assert.match(componentSource, /contactCopy/);
  assert.match(componentSource, /contactAside/);
  assert.match(componentSource, /copy\.contact\.closing/);
  assert.match(componentSource, /copy\.contact\.talkTitle/);
  assert.match(componentSource, /contactEmail/);
  assert.match(styleSource, /\.contactLayout\s*\{[\s\S]*display:\s*grid/);
  assert.match(styleSource, /\.contactTalk\s*\{[\s\S]*font-weight:\s*400/);
  assert.match(styleSource, /\.contactTalk\s*\{[\s\S]*opacity:\s*0\.78/);
  assert.match(styleSource, /\.contactEmail\s*\{/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.contactLayout/);
});

test("hero greeting stays two levels below the candidate name", () => {
  assert.match(styleSource, /\.heroEyebrow\s*\{[\s\S]*?font-size:\s*var\(--type-eyebrow\)/);
  assert.match(styleSource, /\.site\[lang="zh-CN"\]\s+\.heroEyebrow,[\s\S]*?\.site\[lang="zh-HK"\]\s+\.heroEyebrow\s*\{[\s\S]*?font-family:\s*var\(--font-cjk/);
});

test("candidate name steps down one display level without changing the Hero structure", () => {
  assert.match(styleSource, /\.heroName\s*\{[\s\S]*?font-size:\s*var\(--type-display-lg\)/);
  assert.match(styleSource, /\.site\[lang="zh-CN"\]\s+\.heroName,[\s\S]*?\.site\[lang="zh-HK"\]\s+\.heroName\s*\{[\s\S]*?font-size:\s*var\(--type-display-lg-cjk\)/);
  assert.match(componentSource, /heroNamePrimary/);
  assert.match(componentSource, /heroNameLatin/);
  assert.match(styleSource, /\.heroNameLatin\s*\{[\s\S]*?font-size:\s*0\.92em/);
});

test("hero columns stay balanced with a restrained desktop inset", () => {
  assert.match(styleSource, /\.heroGrid\s*\{[\s\S]*?align-items:\s*start/);
  assert.match(styleSource, /\.heroGrid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*0\.82fr\)\s+minmax\(0,\s*1\.08fr\)/);
  assert.match(styleSource, /\.heroCopy\s*\{[\s\S]*?padding-top:\s*clamp\(0rem,\s*1\.4vw,\s*1\.25rem\)/);
  assert.match(styleSource, /@media \(max-width:\s*1050px\)[\s\S]*?\.heroCopy\s*\{[\s\S]*?padding-top:\s*0/);
  assert.match(styleSource, /\.heroGrid\s*\{[\s\S]*?gap:\s*clamp\(2\.25rem,\s*3\.5vw,\s*4\.5rem\)/);
  assert.match(styleSource, /\.heroVisual\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?box-shadow:\s*none;/);
  assert.match(styleSource, /\.heroTowerCanvas\s*\{[\s\S]*?opacity:\s*0/);
  assert.doesNotMatch(styleSource, /solutionPulse/);
});

test("header uses a compact fixed height and a smaller menu control", () => {
  const headerBlock = styleSource.match(/\.headerInner\s*\{[^}]*\}/)?.[0] || "";
  assert.match(headerBlock, /min-height:\s*3\.6rem/);
  assert.match(styleSource, /\.menuButton\s*\{[\s\S]*?width:\s*2\.35rem[\s\S]*?height:\s*2\.35rem/);
  assert.match(styleSource, /@media \(max-width:\s*700px\)[\s\S]*?\.headerInner\s*\{[\s\S]*?min-height:\s*3\.6rem/);
  assert.match(styleSource, /@media \(max-width:\s*700px\)[\s\S]*?\.menuButton\s*\{[\s\S]*?width:\s*2\.35rem[\s\S]*?height:\s*2\.35rem/);
  assert.match(componentSource, /className=\{styles\.menuButton\}/);
  assert.match(componentSource, /className=\{styles\.languageSwitcher\}/);
});

test("hero keeps only the useful CTA labels and removes the repeated footer meta", () => {
  const heroActions = componentSource.match(/<div className=\{styles\.heroActions\}>[\s\S]*?<\/div>/)?.[0] || "";
  assert.doesNotMatch(heroActions, /<span>[↘↓]<\/span>/);
  assert.doesNotMatch(componentSource, /Hong Kong · AI · Delivery/);
  assert.doesNotMatch(componentSource, /className=\{styles\.heroFooter\}/);
});

test("skills closing statement reveals from top to bottom", () => {
  const skillsFillBlock = styleSource.match(/\.skillsClosing \.scrollTextFill\s*\{[^}]*\}/)?.[0] || "";
  assert.match(skillsFillBlock, /clip-path:\s*inset\(0 0 calc\(100% - var\(--text-progress\)\) 0\)/);
});

test("hero actions keep a readable size and equal mobile affordances", () => {
  assert.match(styleSource, /--type-button:\s*0\.8125rem/);
  assert.match(styleSource, /\.heroActions \.primaryButton,[\s\S]*?font-size:\s*var\(--type-button\)/);
  assert.match(styleSource, /\.heroActions \.primaryButton,[\s\S]*?font-weight:\s*600/);
  assert.match(styleSource, /\.heroActions \.primaryButton,[\s\S]*?min-height:\s*3rem/);
  assert.match(styleSource, /@media \(max-width: 700px\)[\s\S]*?--type-button:\s*0\.75rem/);
  assert.match(styleSource, /@media \(max-width: 700px\)[\s\S]*?\.heroActions \.primaryButton,[\s\S]*?flex:\s*1 1 0/);
});

test("site typography follows one capped responsive hierarchy across languages and viewports", () => {
  assert.match(styleSource, /--text-xs:\s*0\.8125rem/);
  assert.match(styleSource, /--text-sm:\s*0\.9375rem/);
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
  assert.match(styleSource, /\.experienceCardBody\s+strong\s*\{[^}]*font-size:\s*var\(--type-card-label\)/);
  assert.match(styleSource, /\.menuLink\s*\{[\s\S]*font-size:\s*var\(--type-menu-link\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?--type-display-xl:\s*clamp\(2\.3rem,\s*8\.4vw,\s*3rem\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?--type-display-lg-cjk:\s*clamp\(1\.8rem,\s*6\.8vw,\s*2\.4rem\)/);
  assert.match(styleSource, /\.site\[lang="zh-HK"\][\s\S]*?--muted:\s*#[0-9a-fA-F]{6}/);
  assert.match(styleSource, /\.site\[lang="zh-HK"\][\s\S]*?--type-body:\s*var\(--text-base\)/);
  assert.match(styleSource, /\.site\[lang="zh-HK"\][\s\S]*?letter-spacing:\s*0/);
  assert.match(styleSource, /\.site\[lang="zh-HK"\][\s\S]*?font-weight:\s*500/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.site\[lang="zh-HK"\][\s\S]*?--type-body:\s*1rem/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.site\[lang="zh-HK"\][\s\S]*?--type-meta:\s*0\.8125rem/);
});

test("experience explorer keeps recruiter scan order and detail controls visible", () => {
  assert.match(componentSource, /function ExperienceExplorer/);
  assert.match(componentSource, /const \[activeIndex, setActiveIndex\] = useState\(null\)/);
  assert.match(componentSource, /item\.period/);
  assert.match(componentSource, /item\.company/);
  assert.match(componentSource, /item\.role/);
  assert.match(componentSource, /item\.headline/);
  assert.match(componentSource, /experienceCardHeadline/);
  assert.match(componentSource, /item\.focus/);
  assert.match(componentSource, /item\.tags\.map/);
  assert.match(componentSource, /aria-expanded=\{isActive\}/);
  assert.match(componentSource, /aria-controls=\{experienceDetailId\}/);
  assert.match(componentSource, /handleExperienceKeyDown/);
  assert.match(componentSource, /experienceAccordionDetail/);
  assert.match(componentSource, /data-open=\{isActive\}/);
  assert.match(componentSource, /ExperienceDetailContent/);
  assert.doesNotMatch(componentSource, /experienceDetailOverview\}>\{item\.detail\.overview\}/);
  assert.match(componentSource, /item\.detail\.sections\.slice\(0,\s*4\)/);
  assert.match(styleSource, /\.experienceSelectableCard\s*\{/);
  assert.match(styleSource, /\.experienceCardHeadline\s*\{/);
  assert.match(styleSource, /\.experienceAccordionDetail\s*\{/);
  assert.doesNotMatch(componentSource, /experienceDetailPanel|activeItem/);
});

test("experience detail stays in normal page flow without a nested scrollbar", () => {
  assert.match(styleSource, /\.experienceExplorerHeading\s*\{[\s\S]*position:\s*relative/);
  assert.doesNotMatch(styleSource, /experienceExplorerGrid|experienceDetailPanel/);
  assert.match(styleSource, /\.experienceAccordionDetail\s*\{[\s\S]*grid-template-rows:\s*0fr/);
  assert.doesNotMatch(styleSource, /\.experienceAccordionDetail[^}]*overflow-y:\s*(auto|scroll)/);
});

test("experience explorer becomes a readable mobile accordion", () => {
  assert.doesNotMatch(styleSource, /experienceExplorerGrid|experienceDetailPanel/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.experienceSelectableCard\s*\{/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.experienceAccordionDetail\s*\{/);
  assert.match(styleSource, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.experienceSelectableCard/);
});

test("skills content gets an inner mobile gutter instead of touching the container edge", () => {
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.skillsSection\s*>\s*\.container\s*\{[\s\S]*?padding-inline:\s*var\(--space-2\)/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.skillsIndexGroup\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.practiceCard\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
});

test("skills and AI practice use the shortened recruiter-facing index", () => {
  assert.match(componentSource, /copy\.skillsHeader\.title/);
  assert.match(componentSource, /copy\.skillsHeader\.intro/);
  assert.match(componentSource, /copy\.skillsEvidence/);
  assert.match(componentSource, /copy\.aiPracticeHeader\.title/);
  assert.match(componentSource, /copy\.aiPracticeClosing/);
  assert.match(componentSource, /skillsIndex/);
  assert.doesNotMatch(componentSource, /copy\.teamValue|copy\.evidence|capabilityGrid|capabilityCard/);
  assert.match(styleSource, /\.skillsIndex\s*\{/);
  assert.match(styleSource, /\.skillsEvidence\s*\{/);
  assert.match(styleSource, /\.practiceCard\s*\{/);
});

test("experience removes the former horizontal scroll implementation", () => {
  assert.doesNotMatch(componentSource, /scrub:\s*1\.15/);
  assert.doesNotMatch(componentSource, /experienceControls/);
  assert.doesNotMatch(componentSource, /experienceViewport/);
  assert.match(componentSource, /event\.preventDefault\(\)/);
  assert.doesNotMatch(componentSource, /experienceRail/);
  assert.match(styleSource, /\.site\s*\{[^}]*overflow-x:\s*clip/);
  assert.doesNotMatch(styleSource, /\.site\s*\{[^}]*overflow:\s*hidden/);
  assert.equal((globalStyleSource.match(/overflow-x:\s*clip/g) || []).length, 2);
  assert.doesNotMatch(globalStyleSource, /overflow-x:\s*hidden/);
});

test("selected work is a concise horizontal draggable showcase", () => {
  assert.match(componentSource, /projectShowcaseRail/);
  assert.match(componentSource, /projectShowcaseCard/);
  assert.match(componentSource, /project\.cardTitle \|\| project\.title/);
  assert.match(componentSource, /onPointerDown/);
  assert.match(componentSource, /onPointerMove/);
  assert.match(componentSource, /import Link from "next\/link"/);
  assert.match(componentSource, /href=\{`\/work\/\$\{project\.id\}\/`\}/);
  assert.match(componentSource, /scrollBy/);
  assert.doesNotMatch(componentSource, /ProjectEvidenceCard/);
  assert.doesNotMatch(componentSource, /projectSignalFlow/);
  assert.match(styleSource, /\.projectShowcaseRail\s*\{[\s\S]*overflow-x:\s*auto/);
  assert.match(styleSource, /\.projectShowcaseRail\s*\{[\s\S]*scroll-snap-type:\s*none/);
  assert.match(styleSource, /\.projectShowcaseLink\s*\{[\s\S]*scroll-snap-align:\s*start/);
  assert.match(styleSource, /\.projectShowcaseLink\s*\{[\s\S]*flex:\s*0 0/);
  assert.match(styleSource, /\.projectShowcaseLink:focus-visible/);
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
  assert.match(styleSource, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.projectShowcaseLink\s*\{[^}]*flex:\s*0 0 calc\(100vw\s*-\s*4\s*\*\s*var\(--gutter\)\)/);
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

test("experience project cases open by default with a separate project hierarchy", () => {
  assert.match(componentSource, /className=\{styles\.experienceDetailCases\} open/);
  assert.match(componentSource, /styles\.experienceDetailProject/);
  assert.match(componentSource, /styles\.experienceDetailCaseTitle/);
});

test("section typography shares one level and CJK headings use explicit font stacks", () => {
  assert.match(styleSource, /\.sectionHeading h2,\s*\.skillsHeader h2,/);
  assert.doesNotMatch(styleSource, /\.skillsHeader h2\s*\{[^}]*clamp\(3rem,\s*6vw,\s*5\.4rem\)/);
  assert.match(styleSource, /\.site\[lang="zh-CN"\][\s\S]*?font-family:\s*var\(--font-cjk-sc\)/);
  assert.match(styleSource, /\.site\[lang="zh-HK"\][\s\S]*?font-family:\s*var\(--font-cjk-tc\)/);
  assert.match(componentSource, /copy\.contact\.titleLines/);
  assert.match(styleSource, /\.contactOpportunityLine\s*\{[^}]*display:\s*block/);
});
