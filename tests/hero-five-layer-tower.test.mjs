import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const componentPath = path.join(projectRoot, "components", "ArchiveGate", "HeroTowerVisual.js");
const archiveGatePath = path.join(projectRoot, "components", "ArchiveGate", "ArchiveGateSite.js");
const rotationPath = path.join(projectRoot, "components", "ArchiveGate", "heroTowerRotation.mjs");
const rotationModuleUrl = pathToFileURL(rotationPath).href;
const materialPath = path.join(projectRoot, "components", "ArchiveGate", "heroTowerMaterials.mjs");
const materialModuleUrl = pathToFileURL(materialPath).href;
const modelPath = path.join(projectRoot, "public", "models", "hero-delivery-system-A-editorial-light.glb");
const previewPath = path.join(projectRoot, "public", "models", "hero-delivery-system-A-editorial-light.png");

test("the Archive Gate hero uses the approved A five-layer tower assets", () => {
  assert.ok(fs.statSync(modelPath).size > 100000, "A GLB asset should be present and non-empty");
  assert.ok(fs.statSync(previewPath).size > 100000, "A static preview should be present for fallback/loading");

  const component = fs.readFileSync(componentPath, "utf8");
  const page = fs.readFileSync(archiveGatePath, "utf8");

  assert.match(component, /hero-delivery-system-A-editorial-light\.glb/);
  assert.match(component, /Hero_Layer_0\(\[1-5\]\)/);
  assert.match(component, /prefers-reduced-motion/);
  assert.match(component, /aria-pressed/);
  assert.match(component, /onPointerLeave/);
  assert.match(component, /heroTowerFallback/);
  assert.match(component, /heroTowerAccessibleList/);
  assert.match(component, /heroTowerKeyboardControls/);
  assert.match(component, /tabIndex={0}/);
  assert.match(component, /handleTowerKeyDown/);
  assert.doesNotMatch(component, /className={styles\.heroTowerControls}/);
  assert.doesNotMatch(component, /heroTowerStatus/);
  assert.match(page, /HeroTowerVisual/);
  assert.doesNotMatch(page, /className=\{styles\.solutionMap\}/);
});

test("clicking a layer uses the original temporary boost and recovery rhythm", async () => {
  const {
    LAYER_ROTATION_CONFIG,
    createLayerRotationState,
    getLayerRotationSpeed,
    triggerLayerBoost,
  } = await import(rotationModuleUrl);
  const state = createLayerRotationState();

  assert.equal(getLayerRotationSpeed(state, 2, 0), LAYER_ROTATION_CONFIG.baseSpeeds[2]);
  assert.equal(triggerLayerBoost(state, 2, 1000), true);
  assert.equal(getLayerRotationSpeed(state, 2, 1000), LAYER_ROTATION_CONFIG.boostSpeeds[2]);
  assert.equal(getLayerRotationSpeed(state, 2, 2600), LAYER_ROTATION_CONFIG.boostSpeeds[2]);

  const recoveringSpeed = getLayerRotationSpeed(state, 2, 3200);
  assert.ok(recoveringSpeed < LAYER_ROTATION_CONFIG.boostSpeeds[2]);
  assert.ok(recoveringSpeed > LAYER_ROTATION_CONFIG.baseSpeeds[2]);
  assert.equal(getLayerRotationSpeed(state, 2, 4200), LAYER_ROTATION_CONFIG.baseSpeeds[2]);
  assert.equal(getLayerRotationSpeed(state, 1, 1200), LAYER_ROTATION_CONFIG.baseSpeeds[1]);
});

test("reduced motion disables the click boost", async () => {
  const {
    createLayerRotationState,
    getLayerRotationSpeed,
    triggerLayerBoost,
  } = await import(rotationModuleUrl);
  const state = createLayerRotationState();

  assert.equal(triggerLayerBoost(state, 0, 1000, true), false);
  assert.equal(getLayerRotationSpeed(state, 0, 1000, true), 0);
});

test("active layer material profile is visibly distinct from inactive layers", async () => {
  const { LAYER_MATERIAL_PROFILES, getLayerMaterialProfile } = await import(materialModuleUrl);
  const component = fs.readFileSync(componentPath, "utf8");
  const inactive = getLayerMaterialProfile(false);
  const active = getLayerMaterialProfile(true);

  assert.notEqual(active.graphiteColor, inactive.graphiteColor);
  assert.notEqual(active.crystalColor, inactive.crystalColor);
  assert.ok(active.crystalEmissiveIntensity > inactive.crystalEmissiveIntensity);
  assert.equal(active.graphiteEmissiveIntensity, 0);
  assert.equal(LAYER_MATERIAL_PROFILES.active.crystalColor, "#BCD4E8");
  assert.match(component, /applyLayerMaterialProfile/);
  assert.match(component, /emissiveIntensity/);
  assert.match(component, /material\.color\.lerp/);
});
