# Recruiter-first Portfolio Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. The current user explicitly requested inline execution. Do not commit, push or deploy.

**Goal:** Improve the existing five-section portfolio's recruiter readability, design-system consistency, responsive behavior, interaction restraint and release hygiene while making Traditional Chinese (`zh-HK`) the default locale.

**Architecture:** Keep `ArchiveGateSite` as the page composition root and preserve the current section contract. Add shared tokens inside the existing CSS module first, add small behavior helpers only where a new interaction needs a testable boundary, and avoid a broad component/CSS split until behavior is stable. Keep the existing locale data model and extend it only for labels required by the mobile menu or accessibility.

**Tech Stack:** Next.js Pages Router, React 18, Sass CSS Modules, Node's built-in test runner, existing local fonts and existing project scripts.

## Global Constraints

- Preserve exactly five primary sections: Hero, Work Experience, Selected Projects, Skills / What I Can Do, Contact.
- Default locale is `zh-HK`; `en` and `zh-CN` remain switchable and persisted.
- Preserve responsive gutters, reduced motion, CV download, contact links and factual AI/IoT framing.
- Do not invent a public domain, canonical URL, project metric, AI ownership claim or second project.
- Do not commit, push or deploy.
- Use `apply_patch` for source edits.
- For every behavior change, write and run a failing test before the production edit, then run the focused test and the full suite.
- Keep explanatory Chinese comments limited to token groups and non-obvious responsive/interaction decisions.

## Planned file map

- Modify `lib/pageContract.mjs`: hold the default locale beside the section contract.
- Modify `pages/index.js`: consume the default locale and add safe page metadata.
- Modify `pages/_document.js`: make the server-rendered document language Traditional Chinese and expose the manifest.
- Modify `data/content.mjs`: add only missing mobile-menu/accessibility labels if needed; preserve factual copy.
- Modify `components/ArchiveGate/ArchiveGateSite.js`: add accessible mobile navigation and make the recruiter positioning statically available.
- Modify `components/ArchiveGate/ArchiveGateSite.module.scss`: add tokens, focus styles, mobile menu, short-height fallbacks and targeted typography/interaction rules.
- Modify `public/robots.txt`, `public/manifest.json`: remove the original template identity and avoid an invented domain.
- Delete stale `public/sitemap.xml`: do not ship a sitemap pointing at another person's domain; add a correct one only after the real domain is confirmed.
- Modify `pages/404.js`: replace the unrelated template page with a minimal accessible page consistent with the current site.
- Modify `tests/content.test.mjs`, `tests/archive-gate-interactions.test.mjs`: lock locale, typography, navigation, focus and responsive contracts.
- Create `tests/release-metadata.test.mjs`: verify no original-author identity or wrong sitemap survives.

### Task 1: Lock default Traditional Chinese behavior

**Files:**
- Modify: `lib/pageContract.mjs`
- Modify: `pages/index.js`
- Modify: `pages/_document.js`
- Test: `tests/content.test.mjs`

**Interfaces:**
- Produce `DEFAULT_LOCALE = "zh-HK"` from `lib/pageContract.mjs`.
- `pages/index.js` uses `DEFAULT_LOCALE` for the initial React state.
- The document renders with `lang="zh-HK"` before hydration.

- [ ] **Step 1: Write the failing test**

Add a test that imports `DEFAULT_LOCALE` and asserts it is `zh-HK`; add source assertions that the page uses `DEFAULT_LOCALE` and `_document.js` uses `lang="zh-HK"`.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/content.test.mjs`

Expected: FAIL because `DEFAULT_LOCALE` is not exported and the page/document still use the old defaults.

- [ ] **Step 3: Implement the minimal locale change**

Export `DEFAULT_LOCALE`, import it into `pages/index.js`, initialize state from it, and change the server-rendered document language to `zh-HK`.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test tests/content.test.mjs`

Expected: PASS.

### Task 2: Remove stale template release identity

**Files:**
- Modify: `public/robots.txt`
- Modify: `public/manifest.json`
- Delete: `public/sitemap.xml`
- Create: `tests/release-metadata.test.mjs`

**Interfaces:**
- `robots.txt` allows crawling without naming an unconfirmed domain.
- The manifest names Zhicheng Situ and uses the current site's paper/ink palette.
- No shipped release file contains `shubhporwal`, `Shubh Porwal` or `shubh73`.

- [ ] **Step 1: Write the failing test**

Create tests that read the release files and assert the manifest contains `Zhicheng Situ`, robots does not contain `shubhporwal`, and the wrong sitemap is absent.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/release-metadata.test.mjs`

Expected: FAIL because the current manifest, robots and sitemap still contain the original template identity/domain.

- [ ] **Step 3: Implement the minimal cleanup**

Rewrite robots to only contain `User-agent: *` and `Allow: /`, update manifest name/description/theme/background colors, and delete the stale sitemap. Do not add a guessed canonical domain.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test tests/release-metadata.test.mjs`

Expected: PASS.

### Task 3: Establish the shared design-system layer

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`
- Test: `tests/archive-gate-interactions.test.mjs`

**Interfaces:**
- Add documented tokens for `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, spacing, containers, radii and motion.
- Existing `--type-*` tokens remain as compatibility aliases during this pass.
- No font-size literal below `0.75rem` remains in the ArchiveGate module.

- [ ] **Step 1: Write the failing tests**

Add assertions for the new token names, no `font-size` literal below `0.75rem`, and the existence of a shared `:focus-visible` rule.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/archive-gate-interactions.test.mjs`

Expected: FAIL because the current module still has micro-label sizes and no focus rule.

- [ ] **Step 3: Implement tokens and focus behavior**

Add Chinese comments explaining the token groups. Replace metadata/micro-label literals with `var(--text-xs)` or `var(--text-sm)`, keep display sizes responsive, add a dark-section button variant, and add `:focus-visible` outlines for links and buttons.

- [ ] **Step 4: Run focused tests and compile Sass**

Run: `node --test tests/archive-gate-interactions.test.mjs`

Expected: PASS. Then run the existing Sass compilation/check command used by the repository and confirm no syntax error.

### Task 4: Add accessible mobile navigation

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.js`
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`
- Modify: `data/content.mjs` only if a missing label is required
- Test: `tests/archive-gate-interactions.test.mjs`

**Interfaces:**
- A menu button is available below the mobile breakpoint.
- It exposes `aria-expanded`, `aria-controls` and an accessible label.
- The menu contains the same four section links as desktop navigation and closes after a link is selected.
- Desktop navigation remains unchanged.

- [ ] **Step 1: Write the failing test**

Assert that the component contains the menu button, `aria-expanded`, `aria-controls`, a mobile navigation container and all four existing section targets; assert the stylesheet hides the control above the mobile breakpoint and shows it below it.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/archive-gate-interactions.test.mjs`

Expected: FAIL because only the desktop nav exists and it is hidden on small screens.

- [ ] **Step 3: Implement the minimal menu**

Add one `isMenuOpen` state, a native button, a small menu panel and close-on-link behavior. Use the existing nav copy; do not add a new navigation concept.

- [ ] **Step 4: Run focused tests and the full suite**

Run: `node --test tests/archive-gate-interactions.test.mjs tests/content.test.mjs`

Expected: PASS.

### Task 5: Improve recruiter-first static hierarchy and short-height behavior

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.js`
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`
- Modify: `tests/archive-gate-interactions.test.mjs`

**Interfaces:**
- The primary role/value statement is visible without waiting for TypewriterLine rotation.
- Typewriter remains optional secondary motion and honors reduced motion.
- At short desktop heights the experience sticky scene falls back to natural document flow.
- Project layout remains single-column at the existing 1050px threshold.

- [ ] **Step 1: Write the failing tests**

Assert that the hero renders `copy.positioning.primary` in a static positioning element, that the stylesheet includes a `max-height` fallback for the experience scene, and that reduced motion remains present.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/archive-gate-interactions.test.mjs`

Expected: FAIL because the primary positioning is currently below the rotating line and no height media query exists.

- [ ] **Step 3: Implement the minimal hierarchy and height fallback**

Promote the role positioning into a static, readable line; demote the rotating line to supporting copy; add a short-height media query that disables the sticky experience layout without changing the mobile fallback.

- [ ] **Step 4: Run focused tests and the full suite**

Run: `node --test tests/archive-gate-interactions.test.mjs tests/content.test.mjs tests/experience-motion.test.mjs`

Expected: PASS.

### Task 6: Normalize release page and page metadata

**Files:**
- Modify: `pages/index.js`
- Modify: `pages/_document.js`
- Modify: `pages/404.js`
- Modify: `tests/release-metadata.test.mjs`

**Interfaces:**
- Page metadata identifies Zhicheng Situ and the current role positioning.
- The manifest is linked from the document.
- The 404 page is accessible, lightweight and links back to the five-section homepage without importing unrelated legacy components.

- [ ] **Step 1: Write the failing test**

Assert that index metadata includes `og:title` and `og:description`, `_document.js` links `/manifest.json`, and `pages/404.js` does not import the old Button/Cursor/template animation components.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/release-metadata.test.mjs`

Expected: FAIL because the current document has no manifest link and the 404 page imports legacy components.

- [ ] **Step 3: Implement the minimal release surface**

Add stable title/description/Open Graph text without inventing `og:url` or `og:image`; link the manifest; replace 404 with a small semantic page using native HTML/CSS and a home link.

- [ ] **Step 4: Run focused tests and build**

Run: `node --test tests/release-metadata.test.mjs`; then `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1` in a retained process and run the repository production build using the bundled runtime.

Expected: PASS and a successful production build.

### Task 7: Interaction restraint and maintainability pass

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.js`
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`
- Create only if needed: focused hook/section files under `components/ArchiveGate/`
- Modify: `tests/archive-gate-interactions.test.mjs`

**Interfaces:**
- Cursor and aura remain disabled for coarse pointers and reduced motion.
- Reveal and typewriter motion do not hide the primary message.
- Any extracted hook or section has one responsibility and preserves existing class names/props.

- [ ] **Step 1: Write failing regression tests for the selected simplifications**

Assert the static hero message, coarse-pointer fallback, reduced-motion fallback and experience native mobile paging contract.

- [ ] **Step 2: Run the focused test and verify it fails only for the intended changes**

Run: `node --test tests/archive-gate-interactions.test.mjs`

Expected: FAIL only for the new static hierarchy or interaction contract.

- [ ] **Step 3: Implement the smallest interaction changes**

Reduce optional emphasis and extract only code that becomes clearer after the previous tasks. Do not introduce a new animation library or new page structure.

- [ ] **Step 4: Run all tests and inspect the diff**

Run: `node --test tests/*.test.mjs` using the repository's supported PowerShell form if wildcard expansion requires it, then `git diff --check`.

Expected: all tests pass and no whitespace errors are reported.

### Task 8: Final responsive and release verification

**Files:**
- Modify only when verification finds a real issue: the relevant source/test file.

**Interfaces:**
- The verification matrix covers `en`, `zh-CN`, `zh-HK` at 320, 360, 375, 390, 430, 768, 820, 912, 1024 and 1440px, plus short-height desktop.
- Verify section order, no horizontal overflow, default locale, menu keyboard behavior, reduced motion, CV download, mailto, favicon, manifest, robots, sitemap decision and 404.

- [ ] **Step 1: Run the full automated suite and production build**

Run: `node --test tests/*.test.mjs` with the repository's supported runtime and `npm run build` through `scripts/start-dev.ps1`/bundled runtime as required.

Expected: all tests pass and the build completes.

- [ ] **Step 2: Run the available local browser/responsive check**

Use the current local preview for manual inspection. If the browser security policy blocks automated localhost inspection, record browser visual QA as incomplete rather than inferring it from source tests; leave the preview open for the user.

- [ ] **Step 3: Inspect the final diff and working tree**

Run: `git diff --check` and `git status --short --branch`.

Expected: only intended uncommitted source, test and documentation changes remain; no commit, push or deployment occurs.
