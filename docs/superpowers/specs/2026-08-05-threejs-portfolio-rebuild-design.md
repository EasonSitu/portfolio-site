# Three.js Portfolio Rebuild Design

## 1. Objective

Create a separate Three.js-first version of Zhicheng Situ's recruiter-facing
portfolio without changing the existing `portfolio-site` application.

The new version should recreate the approved visual idea directly in the
browser: a dark editorial hero with a large rear arch, five square floating
layers, a central energy beam and translucent core sphere. The scene should
feel premium and spatial while keeping the candidate's content readable.

The Blender/GLB lookdev remains a visual reference only. The new implementation
must generate the hero geometry and materials in code rather than loading the
existing GLB as its primary scene source.

## 2. Repository and safety boundary

- Preserve the existing `D:\\codex\\Eason\\portfolio-site` project unchanged.
- Create a sibling project at `D:\\codex\\Eason\\portfolio-site-threejs`.
- The sibling project may copy factual content, locale data and the CV PDF, but
  it must not import runtime components or GLB assets from the original app.
- Keep the existing app available as a visual and content fallback while the
  new version is developed.

## 3. Audience and content position

Primary audience: Hong Kong recruiters and hiring managers.

The hero should communicate that Zhicheng connects business needs, product and
technical teams, and real-world delivery. It must not present him as a senior
software engineer, AI researcher, or low-level IoT specialist.

The first implementation keeps the existing three locales:

- English (`en`)
- Simplified Chinese (`zh-CN`)
- Traditional Chinese (`zh-HK`)

The copy remains data-driven so the scene and language switch do not duplicate
content in JSX.

## 4. Visual composition

### 4.1 Hero layout

- Full-viewport dark background with a subtle grid/noise field.
- Left side: name, short positioning statement, supporting sentence and two
  actions (view experience and download CV).
- Right side: Three.js scene occupying the visual emphasis area.
- A protected left-side text zone must remain clear of the 3D scene at desktop
  sizes.
- On narrow screens, the scene scales down or becomes a controlled static
  fallback; text remains the priority.

### 4.2 Scene objects

Generate these objects directly with Three.js:

1. One large, slightly offset rear arch with real depth.
2. Five square floating panels, each sharing the same design language but with
   small controlled differences in corner cuts, edge extensions and inset
   positions.
3. A layered base/platform and short energy path.
4. A warm translucent core sphere below the bottom panel.
5. A vertical energy beam passing through the sphere and all five panels.
6. Restrained side stones or environmental blocks only where they improve
   depth; they must not compete with the hero.

The five layers represent:

- Business Context
- Requirements
- Coordination
- Testing
- Delivery

Labels should sit beside their associated layer, without numeric prefixes and
without covering the rotating object.

## 5. Three.js architecture

Use Next.js as the application shell and native Three.js inside a client-only
Hero component. Do not use React Three Fiber for the new scene.

Suggested boundaries:

```text
pages/index.js
  locale state and page shell

components/ThreeHero/ThreeHero.js
  browser-only lifecycle and canvas mount

lib/three-scene/createScene.mjs
  scene, camera, renderer, lights and post-processing

lib/three-scene/buildGeometry.mjs
  arch, panels, base, sphere and beam geometry

lib/three-scene/materials.mjs
  stone, smoked glass, metal, energy and sphere materials

lib/three-scene/interaction.mjs
  pointer hit testing, hover, selection and rotation state

data/heroContent.mjs
  three-language copy
```

The first pass should use a single render loop and dispose all geometries,
materials and listeners when the component unmounts.

## 6. Material and lighting direction

- Arch: dark graphite/stone response with procedural low-frequency noise and
  roughness variation; no obvious repeating brick texture.
- Panels: smoked glass or dark blue translucent slabs with clearcoat, visible
  thickness, restrained etched lines and warm/cool edge accents.
- Frame: dark metallic edge with controlled blue-violet reflection.
- Sphere: `MeshPhysicalMaterial` with transmission/IOR, ivory-warm tint and a
  soft internal glow.
- Beam: warm core beam plus a wider low-opacity halo.
- Lighting: one warm key/energy source, cool-violet rim light, low ambient fill,
  and restrained bloom through Three.js post-processing.

Material complexity must be controllable by a quality setting so the static
desktop look can be richer than the mobile fallback.

## 7. Interaction model

- Hovering a panel: lift it slightly, rotate it a few degrees, brighten its
  edge and activate its adjacent label.
- Clicking a panel: enter a selected state and accelerate its rotation briefly;
  clicking again returns it to the idle state.
- Pointer movement: create subtle camera/parallax response, not a large orbit.
- Scroll/navigation: the first version only needs reliable anchor actions; the
  scene must not block normal page scrolling.
- Respect `prefers-reduced-motion`: disable rotation and parallax while keeping
  the scene visible and labels readable.

## 8. Delivery phases

### Phase 1 — static browser scene

- Create the sibling project.
- Build the scene geometry and camera.
- Match the Blender reference composition at 16:9.
- Add screenshot/debug mode for visual comparison.

### Phase 2 — materials and lighting

- Add procedural stone, smoked glass, sphere and beam materials.
- Add bloom and warm/cool lighting.
- Tune desktop and mobile quality settings.

### Phase 3 — interaction

- Add hover and click layer states.
- Add labels and active-layer copy.
- Add pointer parallax and reduced-motion handling.

### Phase 4 — content integration

- Bring in the three locale data.
- Add CV download and recruiter actions.
- Add minimal About/Experience/Contact anchors without inventing project
  content.

### Phase 5 — verification

- Run unit/content tests.
- Build production output.
- Verify 1440×1000, 1024×768 and 390×844.
- Check WebGL fallback, reduced motion, language switching and no horizontal
  overflow.

## 9. Success criteria

The new version is ready for the next visual iteration when:

1. It runs independently from the original app.
2. The static hero composition clearly matches the approved arch/layer/core
   concept without a GLB dependency.
3. Each layer is independently addressable and interactive.
4. The left text remains readable at desktop and mobile widths.
5. The three languages work from shared data.
6. The scene degrades gracefully when WebGL, motion or high-quality effects are
   unavailable.
7. The result is a credible recruiter-facing portfolio, not a detached 3D
   demo.

## 10. Tooling note

The requested “5.6 Luna max” model name is not exposed as a selectable runtime
model in the current Codex tool environment. This does not affect the website
architecture; implementation will use the available local runtime and verify
the code and browser output directly.

