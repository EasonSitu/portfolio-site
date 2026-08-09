# Hero Typography and Experience Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio hero and section hierarchy around a modern multilingual sans-serif system, add a trilingual typewriter line, move the capability evidence after experience, and make desktop vertical scrolling drive the horizontal experience cards.

**Architecture:** Keep the existing `ArchiveGateSite` component and fact-first content model. Add one focused typewriter component plus a sticky scroll-progress mapping inside `ExperienceTrack`; use natural document scroll rather than preventing wheel events. Keep mobile and reduced-motion fallbacks simple and readable.

**Tech Stack:** Next.js 14, React 18, CSS Modules/Sass, Node test runner.

## Global Constraints

- Preserve all verified resume facts and the existing three locales: English, Simplified Chinese, and Traditional Chinese.
- Do not reintroduce the removed decorative header brand.
- Do not describe the candidate as an AI architect or pure IT support worker.
- Use self-hosted or system-safe fonts; do not depend on a live Google Fonts request.
- Desktop experience scrolling must be scroll-linked but must not trap wheel or keyboard input.
- Mobile and `prefers-reduced-motion` modes must remain readable without forced horizontal motion.

---

### Task 1: Update content hierarchy and typewriter copy

**Files:**
- Modify: `data/content.mjs`
- Modify: `lib/pageContract.mjs`
- Test: `tests/content.test.mjs`

**Interfaces:**
- Consumes: existing `siteContent[locale]` schema.
- Produces: `hero.typewriter: string[]` for all locales and the section order `home, experience, about, project, role, ai, contact`.

- [ ] **Step 1: Write failing content tests**

Add assertions that each locale has exactly three typewriter phrases, the hero no longer uses the long experience paragraph as its statement, the about section no longer leads with the university sentence, and the section contract places experience before about.

- [ ] **Step 2: Run the content test and verify the new assertions fail**

Run: `node --test tests/content.test.mjs`

- [ ] **Step 3: Implement the trilingual copy and reading order**

Use these English phrases: `I deliver digital and AI solutions.`, `I turn complex requirements into executable plans.`, and `I coordinate people, technology and delivery.` Add equivalent Simplified and Traditional Chinese phrases. Move the concise experience overview into `about.primary`/`about.detail` and remove the university-led headline.

- [ ] **Step 4: Run the content test and verify it passes**

Run: `node --test tests/content.test.mjs`

### Task 2: Build the hero typewriter and modern typography hierarchy

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.js`
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`
- Test: `tests/archive-gate-interactions.test.mjs`

**Interfaces:**
- Consumes: `copy.hero.typewriter`.
- Produces: `TypewriterLine({ phrases })`, stable hero greeting/name hierarchy, larger section titles, and smaller contact title.

- [ ] **Step 1: Write failing source-behaviour tests**

Assert that `TypewriterLine` exists, consumes `copy.hero.typewriter`, respects reduced motion, removes `copy.hero.statement` and `copy.positioning.secondary` from the hero, and uses modern sans font variables rather than Georgia for main headings.

- [ ] **Step 2: Run the interaction test and verify it fails for the missing component/styles**

Run: `node --test tests/archive-gate-interactions.test.mjs`

- [ ] **Step 3: Implement the minimum typewriter and hierarchy changes**

Render the greeting and name as the two largest hero lines. Cycle phrases with type, pause, delete timing; reserve line height to prevent layout shift; show the first phrase statically when reduced motion is requested. Define a Latin-first modern sans stack and explicit Simplified/Traditional CJK fallbacks. Remove the verbose hero paragraph/footer sentence and reduce the contact headline scale.

- [ ] **Step 4: Run the interaction test and verify it passes**

Run: `node --test tests/archive-gate-interactions.test.mjs`

### Task 3: Implement scroll-linked horizontal experience storytelling

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.js`
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`
- Test: `tests/archive-gate-interactions.test.mjs`

**Interfaces:**
- Consumes: `copy.experience` and the existing card/progress controls.
- Produces: desktop sticky experience stage controlled by natural vertical progress, with manual controls and mobile/reduced-motion fallbacks.

- [ ] **Step 1: Write a failing experience-scroll test**

Assert that the component calculates `experienceScrollProgress`, measures `scrollWidth - clientWidth`, uses a sticky stage, and provides desktop-only scroll-linked styling plus mobile/reduced-motion fallbacks.

- [ ] **Step 2: Run the interaction test and verify it fails**

Run: `node --test tests/archive-gate-interactions.test.mjs`

- [ ] **Step 3: Implement natural vertical-to-horizontal mapping**

Give the desktop experience section sufficient scroll height and keep its internal stage sticky. On scroll/resize, map section progress to the rail's horizontal scroll range and update the active card/progress indicator. Do not call `preventDefault`. Keep arrow buttons and direct horizontal controls. At tablet/mobile widths and reduced motion, restore ordinary horizontal snapping or vertical cards.

- [ ] **Step 4: Run the interaction test and verify it passes**

Run: `node --test tests/archive-gate-interactions.test.mjs`

### Task 4: Full verification and visual QA

**Files:**
- Verify: all changed files

**Interfaces:**
- Consumes: the completed content, component, and style changes.
- Produces: test/build evidence and desktop/mobile screenshots for review.

- [ ] **Step 1: Run the complete automated test suite**

Run: `npm test`

- [ ] **Step 2: Run the production build**

Run: `npm run build`

- [ ] **Step 3: Inspect the local site in all three locales**

Check the hero hierarchy, typewriter stability, experience scroll release, capability section order, contact heading, keyboard controls, mobile layout, and reduced-motion fallback at `http://127.0.0.1:3000/`.

- [ ] **Step 4: Review the final diff for scope and fact integrity**

Run: `git diff -- data/content.mjs lib/pageContract.mjs components/ArchiveGate/ArchiveGateSite.js components/ArchiveGate/ArchiveGateSite.module.scss tests/content.test.mjs tests/archive-gate-interactions.test.mjs`
