# Hero Art Direction v2 — Obsidian Archive

## Goal

Upgrade the existing trilingual recruiter portfolio Hero from a generic dark-purple 3D scene into a restrained, high-end AI / IoT / software-delivery visual system while keeping the approved five-layer apparatus, left copy area, and current interaction model.

The site should communicate: **business context → requirements → coordination → testing → delivery**. The object is not a fantasy altar; it is a spatial information system that turns complexity into a visible, ordered delivery path.

## Reference decision

- **Primary reference:** the cleaner metallic / glass composition supplied as image 2. It has clearer product-tech separation, stronger hierarchy, and is more realistic to reproduce in real-time WebGL.
- **Atmosphere reference:** image 1. Borrow its quiet dark environment, deep spatial falloff, and restrained natural texture only where it helps separate the object from the background.
- Do not copy either image literally. Preserve the current model identity and page layout.

## Visual language

### Palette

| Role | Token | Use |
| --- | --- | --- |
| Page black | `#05060A` | page background and deepest falloff |
| Blue-black surface | `#0D111A` | scene floor, arch shadow side, panel recesses |
| Precision ivory | `#C7D1E6` | glass highlights and readable rim reflections |
| Champagne energy | `#D9A45B` | beam, core, selected system paths |
| Controlled violet | `#8E62F2` | hover, active state, focus ring, CTA; never the main object light |
| Slate structure | `#1B2230` | metallic frame and interface surfaces |

Colour balance target: roughly 88% dark structural tones, 8% ivory / cool glass, 3% champagne energy, 1% violet interaction. The 3D object must remain visually distinct from the page instead of disappearing into the black background.

### Materials

- **Arch / base:** deep obsidian or basalt-like stone; low-frequency roughness variation, broad facets, restrained seams, no brick pattern, no noisy cracks.
- **Panels:** smoked glass with visible thickness, a dark precision frame, shallow inset channels, and one or two simplified circuit / routing marks per layer. The surface should remain readable; do not make it fully black or fully transparent.
- **Core sphere:** warm ivory / champagne crystal with subtle transmission and internal softness. It is an energy node, not a normal stone or plastic ball.
- **Energy beam:** warm champagne core plus a very restrained outer halo. Avoid neon tubes and avoid letting bloom erase the panel structure.
- **Environment stones:** supporting silhouettes only; left side fewer and larger, right side more fragmented. They must not compete with the core system.

### Geometry and composition

- Keep the object on the right and preserve the left copy-safe area.
- Keep the arch clearly behind the panels; it is a sculptural backdrop, not a display rack.
- Keep five square layers in one design family, with controlled differences in corner cuts, one notch / extension, inset position, thickness, and small rotation offsets.
- Maintain an ordered progression from lighter upper layers to heavier lower layers.
- Keep the base and energy path integrated as one information-flow system.

## Lighting and post-processing

- Use warm champagne as the key energy light and cool blue-violet as a subtle rim / fill.
- The arch stays darker than the panels, sphere, and beam.
- Add contact / AO separation and soft reflections before adding decorative effects.
- Realtime pass should use correct glTF colour management: linear working space, sRGB output, ACES tone mapping once.
- If post-processing is added, use selective bloom, mild vignette and very subtle grain; no full-screen cyberpunk glow.
- Do not double-tone-map the scene or stack multiple bloom passes.

## Runtime / Blender split

- Blender remains the source for geometry, bevels, UV/material groups, baked AO or light information, and the approved static lookdev reference.
- GLB is the runtime asset. Keep node names and workflow IDs stable so labels, hover, click, and rotation continue to work.
- R3F handles camera parallax, layer rotation, hover lift, click boost, language-safe labels, and responsive quality tiers.
- Static or non-interactive visual detail belongs in the GLB; interaction-sensitive state belongs in React.
- Keep a no-WebGL fallback and a reduced-motion path.

## UI integration

- The 3D scene should feel embedded in the page, not inside a hard rectangular card. Use a soft radial mask and background-matched edge falloff.
- Layer labels are attached to their corresponding panels, shifted away from the panel centre, and never cover the rotating geometry.
- Violet belongs to interaction and CTA states; gold belongs to the object’s energy system.
- The hero remains understandable within five seconds before any interaction.

## Responsive and accessibility rules

- Desktop preserves the two-column composition at 1440×1000 and 1024×768.
- Mobile stacks copy before the scene, reduces scene scale, and keeps labels readable or hides them when they would collide.
- `prefers-reduced-motion: reduce` disables continuous rotation, camera parallax, and click acceleration while keeping the content and model visible.
- No factual content, dates, locale keys, or responsibility boundaries may change during visual work.

## Static lookdev acceptance checklist

- [ ] Primary object reads as precision AI / IoT delivery system rather than fantasy altar.
- [ ] Arch is a darker rear structure with depth separation.
- [ ] Five layers share one language but are visibly not clones.
- [ ] Glass thickness, frame edges, and routing marks remain visible.
- [ ] Sphere and beam form the focal energy system.
- [ ] Dark environment has enough material contrast to avoid a black blob.
- [ ] Left copy-safe area remains quiet and usable.
- [ ] The scene remains credible at a static screenshot before animation is enabled.

## Verification references

- Three.js colour management: https://threejs.org/manual/en/color-management.html
- React Three Fiber performance guidance: https://r3f.docs.pmnd.rs/advanced/pitfalls
- React Three Fiber scaling and adaptive quality: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- glTF Transform optimisation pipeline: https://gltf-transform.dev/
- pmndrs postprocessing: https://github.com/pmndrs/postprocessing
- Reference R3F portfolio architecture: https://github.com/adrianhajdin/3d-portfolio
