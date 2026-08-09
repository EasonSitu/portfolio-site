# Editorial Portfolio Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the current editorial portfolio's memorability, visual evidence, and navigation feedback while preserving recruiter clarity and factual scope.

**Architecture:** Extend the existing `ArchiveGateSite` component with two small hooks for scroll text progress and experience index tracking. Keep visual construction in the existing CSS module and consume only existing localized content.

**Tech Stack:** Next.js 14, React 18, CSS Modules/SCSS, Node test runner.

## Global Constraints

- Do not add dependencies or restore the Three.js hero.
- Do not change factual resume copy or introduce production claims.
- Preserve all three locales and reduced-motion/coarse-pointer fallbacks.
- Modify the existing dirty worktree in place; do not discard unrelated user changes.

---

### Task 1: Add interaction contracts

**Files:**
- Modify: `tests/archive-gate-interactions.test.mjs`

**Interfaces:**
- Produces contract assertions for `useScrollTextReveal`, `data-scroll-text`, `experienceProgress`, `solutionMap`, and `projectSignalFlow`.

- [ ] Write assertions for the four approved visual behaviours.
- [ ] Run `pnpm test` and confirm the new assertions fail because the behaviours are absent.

### Task 2: Implement semantic interaction structure

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.js`

**Interfaces:**
- Produces `ScrollText`, `useScrollTextReveal`, an indexed `ExperienceTrack`, `solutionMap`, and `projectSignalFlow` markup.

- [ ] Add the minimal React structure and hooks required by Task 1.
- [ ] Mark only the three approved synthesis statements as scroll text.
- [ ] Run `pnpm test` and confirm all contract tests pass.

### Task 3: Implement the visual system

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`

**Interfaces:**
- Consumes the class names introduced in Task 2.
- Produces responsive hero nodes, progress feedback, connected AI flow, heading hierarchy, cursor feedback, and motion fallbacks.

- [ ] Replace the hero list presentation with a connected solution map and active-node sequence.
- [ ] Add experience progress, card peeking, and clearer pointer feedback.
- [ ] Style the project signal flow and dark focal section.
- [ ] Add desktop scroll-text clipping and full-contrast reduced-motion/mobile fallbacks.

### Task 4: Verify production behaviour

**Files:**
- No source changes expected.

**Interfaces:**
- Verifies the complete page in tests, build output, and browser screenshots.

- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Inspect desktop hero, experience, and AI project sections in the browser.
- [ ] Inspect a mobile viewport, verify no horizontal page overflow, and reset the viewport.
- [ ] Check browser console errors and warnings.
