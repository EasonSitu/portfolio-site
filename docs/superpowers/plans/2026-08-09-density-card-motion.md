# Density, Card and Experience Motion Implementation Plan

**Goal:** Reduce portfolio density, unify the accent palette and replace the rigid experience carousel with a rounded, scrubbed horizontal story.

**Architecture:** Keep the existing `ArchiveGateSite` and content model. Extract pure experience-motion calculations into a small library, test those calculations independently, then use GSAP ScrollTrigger to animate the rail with transform-based scrub while the existing sticky stage controls reading time. Preserve native horizontal browsing for mobile and reduced-motion users.

**Tech Stack:** Next.js 14, React 18, Sass modules, GSAP/ScrollTrigger, Node test runner.

## Constraints

- Preserve all verified copy and all three locales.
- Do not add new dependencies.
- Do not call `preventDefault` on scrolling.
- Do not copy literal ink-painting or 3D-card artwork from the references.
- Use behavioural unit tests for motion calculations; keep source-level assertions only where the existing legacy suite needs an integration guard.

### Task 1: Define the motion contract with tests

**Files:**
- Create: `tests/experience-motion.test.mjs`
- Create: `lib/experienceMotion.mjs`
- Modify: `tests/archive-gate-interactions.test.mjs`

- [ ] Add failing tests for horizontal distance, paced vertical distance, progress clamping and progress-to-translation mapping.
- [ ] Replace legacy assertions for direct `scrollLeft` assignment and mandatory desktop snapping with the new transform-driven contract.
- [ ] Run the focused tests and confirm that they fail for the missing implementation.
- [ ] Implement the minimum pure helper functions and rerun the focused tests.

### Task 2: Implement scrubbed desktop experience motion

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.js`
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`

- [ ] Register ScrollTrigger in the client-side effect.
- [ ] Measure the real rail overflow and derive the story height from the shared helper.
- [ ] Animate `x` with `ease: none` and a controlled scrub delay.
- [ ] Update progress and active card from the ScrollTrigger timeline.
- [ ] Keep arrows synchronized by scrolling to the matching timeline position.
- [ ] Remove desktop snap behaviour while retaining mobile/reduced-motion native scrolling.

### Task 3: Apply density, palette and card styling

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.js`
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`

- [ ] Rotate cream, blue and clay card tones through the existing experience cards.
- [ ] Increase card radius, internal spacing and gaps while reducing card width.
- [ ] Replace the large active outline/offset block with a quieter route marker and soft elevation.
- [ ] Increase major section spacing and constrain text measures.
- [ ] Replace violet/gold emphasis with cobalt/terracotta/ink tokens.

### Task 4: Verify behaviour and visual hierarchy

**Files:**
- Verify all changed files.

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Inspect desktop at the experience section and confirm slow leftward motion, release at the end and synchronized progress.
- [ ] Inspect mobile and reduced-motion fallbacks.
- [ ] Check all three locales and review the final diff for copy drift.
