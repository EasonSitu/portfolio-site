# Hero Art Direction v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the approved five-layer Hero into a refined Obsidian Archive visual system and carry the static Blender lookdev into a controlled, responsive R3F runtime.

**Architecture:** Blender/GLB remains the source for geometry and material groups; the Next.js/R3F Hero remains the source for camera, interaction, labels, and responsive quality. Visual tokens are centralised in SCSS and the GLB runtime material override is isolated in `HeroScene.js` so the art pass can evolve without changing content or locale logic.

**Tech Stack:** Next.js 14 Pages Router, React 18, React Three Fiber 8, Three.js 0.171, GSAP, SCSS modules, Blender 5.x, GLB/glTF.

## Global Constraints

- Keep `en`, `zh-CN`, and `zh-HK` content and existing factual boundaries unchanged.
- Preserve the five workflow IDs and stable GLB node names used by `lib/heroWorkflow.mjs`.
- Treat image 2 as the primary live-render direction and image 1 as atmosphere reference.
- Use gold/champagne for the object energy system and restrained violet for interaction / CTA states.
- Do not add backend, database, particles, animation sequences, or fictional projects in this art pass.
- Keep no-WebGL and reduced-motion fallbacks working.
- Do not push to the current `origin`; it points to the upstream Devfolio repository. A user-owned remote is required before publishing.

## File map

- `docs/superpowers/specs/2026-08-04-hero-art-direction-v2-design.md` — approved visual specification.
- `components/Hero3D/HeroScene.js` — runtime material, lighting, post-processing boundary, camera, and interactions.
- `components/Hero3D/HeroScene.module.scss` — scene mask, labels, and responsive visual integration.
- `components/Hero/Hero.module.scss` — page palette and copy/scene composition tokens.
- `data/content.mjs` — only if a visual label needs an already-approved locale key; do not rewrite copy during this plan.
- `public/models/hero-delivery-system.glb` — approved runtime model export.
- `scripts/` or Blender source path used for lookdev — reproducible material / export script if the static asset is regenerated.
- `tests/heroWorkflow.test.mjs` and `tests/content.test.mjs` — node-name, locale, and content regression checks.
- `output/` — local screenshots and render artifacts; generated preview folders remain ignored.

### Task 1: Snapshot and repository safety

**Files:**
- Modify: `.gitignore`
- Create: Git tag `hero-v1-before-art-direction`

- [ ] Confirm `git status --short` and save the current branch name.
- [ ] Ensure `.blend1`, `*.log`, `/output/preview/`, and `/output/ui-concepts/` are ignored.
- [ ] Run `pnpm test` and `pnpm build` before any visual edits.
- [ ] Commit the existing approved working state as `chore: snapshot hero v1 before art direction`.
- [ ] Create the local tag `hero-v1-before-art-direction`.

### Task 2: Lock runtime design tokens

**Files:**
- Modify: `components/Hero/Hero.module.scss`
- Modify: `styles/globals.scss`
- Test: browser screenshots at 1440×1000, 1024×768, 390×844

- [ ] Replace scattered near-black / purple values with named Obsidian Archive SCSS variables.
- [ ] Keep violet for interaction and CTA, while routing primary object lighting through gold/champagne tokens.
- [ ] Adjust the scene mask and page background so the GLB dissolves into the page without exposing a rectangle or hard lower boundary.
- [ ] Keep the copy width, left safe area, and mobile stacking rules intact.
- [ ] Run the screenshot checks and verify no horizontal overflow.

### Task 3: Improve R3F runtime lookdev

**Files:**
- Modify: `components/Hero3D/HeroScene.js`
- Modify: `components/Hero3D/HeroScene.module.scss`
- Optional modify: `package.json`, `pnpm-lock.yaml` only if a minimal, justified post-processing dependency is needed

- [ ] Apply cloned material overrides by semantic material role: obsidian stone, smoked glass, slate frame, champagne energy, and warm crystal.
- [ ] Preserve GLB colour management with linear working-space assumptions and one ACES/sRGB output path.
- [ ] Add a restrained environment / contact-separation strategy using existing Three/R3F capabilities first; do not add a dependency solely for decorative bloom.
- [ ] Keep layer rotation, hover lift, click boost, labels, camera parallax, fallback, and reduced motion unchanged in behaviour.
- [ ] Add an adaptive quality tier for smaller screens or lower performance without changing content.
- [ ] Run unit tests, build, and browser smoke checks.

### Task 4: Regenerate and validate the static asset

**Files:**
- Modify: the existing Blender source script or create a tracked reproducible script beside the source asset
- Replace: `public/models/hero-delivery-system.glb` only after a render comparison
- Create: tracked final lookdev preview outside ignored preview folders

- [ ] Keep the arch behind the system, preserve the five workflow roots, and ensure panel differences remain controlled rather than random.
- [ ] Increase material grouping and bevel readability without adding web-only geometry that cannot load reliably.
- [ ] Export GLB with stable node names and verify it loads in the current R3F scene.
- [ ] Compare the static render against the approved reference direction and record remaining gaps.
- [ ] Run `pnpm test` and `pnpm build` after replacing the asset.

### Task 5: Final interaction and responsive verification

**Files:**
- Modify only where verification finds a defect: `components/Hero3D/HeroScene.js`, `components/Hero3D/HeroScene.module.scss`, `components/Hero/Hero.module.scss`
- Test: `tests/heroWorkflow.test.mjs`, browser desktop/mobile screenshots

- [ ] Verify labels stay attached to the intended layer while it rotates.
- [ ] Verify hover increases the selected layer’s motion and click temporarily accelerates it without blocking the CTA or language control.
- [ ] Verify reduced motion removes continuous rotation and parallax while keeping layer content usable.
- [ ] Verify the 3D composition remains right-weighted and the left recruiter copy remains readable at all target viewports.
- [ ] Record final screenshots and commit the completed art pass.
