# Static Hero Lookdev Notes

## Approved direction

- **Primary visual reference:** the clean studio reference with a cool-blue/purple edge treatment, smoked square glass panels, a restrained champagne energy core, and a dark sculptural arch.
- **Atmosphere reference:** the darker environmental reference may inform background depth and restraint, but it is not a literal scene to reproduce.
- **Composition:** keep the existing right-weighted hero object and left copy-safe area.

## Local Blender passes

| Pass | File | Role |
| --- | --- | --- |
| v2 | `D:/codex/Eason/component-lookdev/output/selected-b-system-v2/final.png` | Readable visibility baseline; first blue-black / smoked-glass / warm-energy pass. |
| v3 | `D:/codex/Eason/component-lookdev/output/selected-b-system-v3/final.png` | Dark contrast experiment; retained for comparison, not selected as the runtime baseline. |
| v4 | `D:/codex/Eason/component-lookdev/output/selected-b-system-v4/final.png` | Balanced material experiment; retained for comparison, not yet approved for runtime replacement. |

Each pass keeps the approved geometry and camera and writes a separate Blend file. The original selected-B Blend remains unchanged.

## Current decision gate

The web runtime keeps the existing GLB while the static pass is reviewed. Do not replace `public/models/hero-delivery-system.glb` until a static pass is explicitly selected. Once selected, export a clean GLB, compare it in the R3F scene, and only then commit the asset replacement.

## Material language

- **Structure:** blue-black obsidian/basalt with controlled roughness variation.
- **Panels:** smoked glass, visible thickness, cool edge separation, restrained violet reflection.
- **Energy:** champagne/amber accents with a smaller emissive contribution than the main form.
- **Core:** warm ivory/amber transparent crystal; avoid opaque brown or plain white spheres.

## Next implementation step

1. Select the static pass to carry forward.
2. Export that Blend to GLB without cameras/lights or editor-only helpers.
3. Compare GLB materials against the runtime material token layer in `components/Hero3D/HeroScene.js`.
4. Keep the current interaction model and update only lighting/material presentation.
