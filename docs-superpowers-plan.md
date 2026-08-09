# Trilingual Devfolio Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt Devfolio into a recruiter-facing, animated, trilingual portfolio for Zhicheng Situ without project case-study pages or backend services.

**Architecture:** Fork the existing Next.js portfolio and replace developer-specific content with a static multilingual content model. Keep GSAP/ScrollTrigger and the useful Framer Motion sticky pattern, while rebuilding page composition around hero, evidence, experience, AI practice, workflow, and contact sections.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS, SCSS modules, GSAP/ScrollTrigger, Framer Motion, Node built-in test runner.

## Global Constraints

- Locales: `en`, `zh-CN`, `zh-HK` with independent authored copy.
- No Selected Work/project carousel in the MVP.
- No WebGL, backend, database, contact form, or autoplay sound.
- Preserve MIT license notice and add discreet Devfolio attribution.
- Use AI application and multi-device deployment-coordination wording; do not imply model engineering, solution architecture, or low-level IoT integration development.
- Respect reduced motion and provide a readable mobile flow.

---

### Task 1: Establish the adapted repository and testable content model

**Files:**
- Create: `portfolio-site/data/content.mjs`
- Create: `portfolio-site/utils/i18n.mjs`
- Create: `portfolio-site/tests/content.test.mjs`
- Modify: `portfolio-site/package.json`
- Copy: `C:/Users/Eason/Desktop/司徒智成 Zhicheng Situ_CV_V2.2.pdf` to `portfolio-site/public/Zhicheng-Situ-CV.pdf`

**Interfaces:**
- Produces: `siteContent: Record<Locale, SiteCopy>` and `resolveLocale(candidate, stored): Locale`.
- Consumes: approved design copy and final CV facts.

- [ ] **Step 1: Write failing locale-completeness tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { siteContent } from "../data/content.mjs";

for (const locale of ["en", "zh-CN", "zh-HK"]) {
  test(`${locale} contains required portfolio sections`, () => {
    const copy = siteContent[locale];
    assert.ok(copy.hero.title);
    assert.equal(copy.metrics.length, 4);
    assert.equal(copy.experience.length, 4);
    assert.equal(copy.aiPractice.length, 4);
    assert.ok(copy.contact.email.startsWith("mailto:"));
  });
}
```

- [ ] **Step 2: Run the tests and verify the missing-module failure**

Run: `node --test tests/content.test.mjs`

Expected: FAIL because `data/content.mjs` does not exist.

- [ ] **Step 3: Implement locale resolution and complete copy**

Create the three fully populated locale objects and a resolver that accepts only `en`, `zh-CN`, and `zh-HK`, defaulting to `en`.

- [ ] **Step 4: Add scripts and run tests**

Add `"test": "node --test tests/*.test.mjs"` to `package.json`.

Run: `npm test`

Expected: all locale tests PASS.

- [ ] **Step 5: Commit the content foundation**

```bash
git add data utils tests package.json public/Zhicheng-Situ-CV.pdf
git commit -m "feat: add trilingual portfolio content model"
```

### Task 2: Build the trilingual shell, navigation, hero, and signal visual

**Files:**
- Create: `portfolio-site/components/LanguageSwitcher/LanguageSwitcher.js`
- Create: `portfolio-site/components/SignalMap/SignalMap.js`
- Create: `portfolio-site/components/SignalMap/SignalMap.module.scss`
- Modify: `portfolio-site/pages/index.js`
- Modify: `portfolio-site/components/Header/Header.js`
- Modify: `portfolio-site/components/Header/Menu/Menu.js`
- Modify: `portfolio-site/components/Hero/Hero.js`
- Modify: `portfolio-site/components/Hero/Hero.module.scss`

**Interfaces:**
- Consumes: `siteContent[locale]` and `resolveLocale()`.
- Produces: page-level `{ locale, setLocale, copy }` and anchor IDs `home`, `about`, `experience`, `ai`, `contact`.

- [ ] **Step 1: Add a failing test for locale fallback and saved preference**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { resolveLocale } from "../utils/i18n.mjs";

test("valid saved preference wins", () => {
  assert.equal(resolveLocale("en", "zh-HK"), "zh-HK");
});

test("invalid input falls back to English", () => {
  assert.equal(resolveLocale("fr", null), "en");
});
```

- [ ] **Step 2: Run the test and verify failure before resolver completion**

Run: `npm test`

Expected: FAIL until `resolveLocale` implements the precedence rules.

- [ ] **Step 3: Implement page locale state and switcher**

Initialize from local storage in `useEffect`, write the new choice back to local storage, update `<html lang>`, and render buttons labelled `EN`, `简`, `繁` without navigation or reload.

- [ ] **Step 4: Replace the original hero**

Render the localized name, title, statement, and four CTAs. Keep the GSAP staggered entrance. Replace Typed.js and the original Lottie with `SignalMap`, built from semantic labels and CSS/SVG paths.

- [ ] **Step 5: Verify desktop and keyboard behavior**

Run: `npm test && npm run build`

Expected: PASS; language buttons are focusable and hero content remains present without JavaScript animation completion.

- [ ] **Step 6: Commit the shell**

```bash
git add pages components/Header components/Hero components/LanguageSwitcher components/SignalMap utils
git commit -m "feat: build trilingual animated portfolio shell"
```

### Task 3: Replace developer sections with positioning, evidence, and AI practice

**Files:**
- Modify: `portfolio-site/components/About/About1.js`
- Modify: `portfolio-site/components/About/About2.js`
- Replace: `portfolio-site/components/Skills/Skills.js`
- Create: `portfolio-site/components/AIPractice/AIPractice.js`
- Modify: `portfolio-site/pages/index.js`

**Interfaces:**
- Consumes: `copy.positioning`, `copy.metrics`, `copy.capabilities`, and `copy.aiPractice`.
- Produces: sections `about`, `evidence`, and `ai`.

- [ ] **Step 1: Extend the content test with evidence assertions**

```js
test("metrics retain verified values", () => {
  assert.deepEqual(
    siteContent.en.metrics.map((metric) => metric.value),
    ["20+", "5", "1,000+", "AI"]
  );
});
```

- [ ] **Step 2: Run the test before adding metric values**

Run: `npm test`

Expected: FAIL if any verified value is missing or changed.

- [ ] **Step 3: Implement the scroll-highlighted positioning statement**

Adapt the existing About1 GSAP/ScrollTrigger opacity sequence to localized sentence fragments. Keep About2 as a short accent statement or merge it into the evidence transition.

- [ ] **Step 4: Replace the skills logo wall with evidence metrics**

Render four number cards and four capability labels. Use GSAP for a one-time reveal; do not animate values when reduced motion is enabled.

- [ ] **Step 5: Add the AI practice section**

Render four concise tiles for knowledge base, workflow automation, packaged Python tools, and YOLO/OpenCV/MediaPipe prototyping. No click-through or project-detail route.

- [ ] **Step 6: Test and commit**

Run: `npm test && npm run build`

Expected: PASS.

```bash
git add components/About components/Skills components/AIPractice pages/index.js data/content.mjs tests
git commit -m "feat: add evidence and AI practice sections"
```

### Task 4: Adapt the sticky experience and workflow motion

**Files:**
- Modify: `portfolio-site/components/Work/Work.js`
- Modify: `portfolio-site/components/Work/Tabs/Tabs.js`
- Modify: `portfolio-site/components/Work/StickyScroll/StickyScroll.js`
- Modify: `portfolio-site/components/Collaboration/Collaboration.js`
- Modify: `portfolio-site/pages/index.js`

**Interfaces:**
- Consumes: `copy.experience` and `copy.workflow`.
- Produces: `experience` and `workflow` sections with desktop and mobile layouts.

- [ ] **Step 1: Add tests for chronology and Questwork date accuracy**

```js
test("experience chronology is stable", () => {
  const experience = siteContent.en.experience;
  assert.deepEqual(experience.map((item) => item.company), [
    "isBIM Limited",
    "Questwork Consultation Company",
    "K Compact Company Limited",
    "Earlier Product Experience",
  ]);
  assert.match(experience[1].period, /Mar 2025/);
});
```

- [ ] **Step 2: Run the test before finalizing experience data**

Run: `npm test`

Expected: FAIL until chronology and period fields match.

- [ ] **Step 3: Adapt sticky experience data flow**

Replace hard-coded company tabs with localized data. Desktop uses sticky/active-card behavior; small screens render ordinary vertical cards in chronological order.

- [ ] **Step 4: Replace collaboration copy with the work-method sequence**

Render `DISCOVER → CLARIFY → COORDINATE → TEST → DELIVER → IMPROVE` and localized supporting labels with the existing opposing horizontal motion.

- [ ] **Step 5: Test and commit**

Run: `npm test && npm run build`

Expected: PASS with no Project component imported in `pages/index.js`.

```bash
git add components/Work components/Collaboration pages/index.js data/content.mjs tests
git commit -m "feat: adapt experience and delivery workflow"
```

### Task 5: Finish contact, responsive behavior, attribution, and visual QA

**Files:**
- Modify: `portfolio-site/components/Contact/Contact.js`
- Modify: `portfolio-site/components/Footer/Footer.js`
- Modify: `portfolio-site/components/Loader/Loader.js`
- Modify: `portfolio-site/components/Cursor/Cursor.js`
- Modify: `portfolio-site/styles/globals.scss`
- Modify: `portfolio-site/README.md`
- Preserve: `portfolio-site/LICENSE.md`

**Interfaces:**
- Consumes: `copy.education`, `copy.languages`, `copy.contact`, and user motion preferences.
- Produces: backend-free CTA/footer and responsive/reduced-motion behavior.

- [ ] **Step 1: Add link-integrity assertions**

```js
for (const locale of ["en", "zh-CN", "zh-HK"]) {
  test(`${locale} exposes valid contact links`, () => {
    const { contact } = siteContent[locale];
    assert.match(contact.email, /^mailto:/);
    assert.match(contact.linkedin, /^https:\/\//);
    assert.equal(contact.resume, "/Zhicheng-Situ-CV.pdf");
  });
}
```

- [ ] **Step 2: Run the link test before final links are populated**

Run: `npm test`

Expected: FAIL until all three locales include the exact link fields.

- [ ] **Step 3: Replace the contact form and footer**

Remove EmailJS/form logic. Render email, LinkedIn, and CV CTAs plus education/language copy. Retain the animated CTA affordance without submitting data. Add discreet `Based on Devfolio by Shubh Porwal` attribution and keep the MIT license.

- [ ] **Step 4: Implement reduced-motion and mobile fallbacks**

Use `@media (prefers-reduced-motion: reduce)` to disable long transitions, transforms, smooth scrolling, and custom cursor. Prevent horizontal overflow and ensure experience cards stack below the desktop breakpoint.

- [ ] **Step 5: Run automated verification**

Run: `npm test && npm run build`

Expected: all tests PASS and production build succeeds.

- [ ] **Step 6: Run visual QA**

Start the site with `npm run dev`. Inspect 1440×900 and 390×844 views. Verify hero hierarchy, all three locale switches, experience motion, AI section visibility, contact links, resume download, reduced-motion behavior, and absence of the Selected Work/project carousel.

- [ ] **Step 7: Commit the finished MVP**

```bash
git add components/Contact components/Footer components/Loader components/Cursor styles README.md LICENSE.md
git commit -m "feat: finish recruiter-ready trilingual portfolio MVP"
```
