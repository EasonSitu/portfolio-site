import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const componentPath = path.join(projectRoot, "components", "ArchiveGate", "HeroTowerVisual.js");
const stylesPath = path.join(projectRoot, "components", "ArchiveGate", "ArchiveGateSite.module.scss");
const archiveGatePath = path.join(projectRoot, "components", "ArchiveGate", "ArchiveGateSite.js");
const rotationPath = path.join(projectRoot, "components", "ArchiveGate", "heroTowerRotation.mjs");
const rotationModuleUrl = pathToFileURL(rotationPath).href;
const materialPath = path.join(projectRoot, "components", "ArchiveGate", "heroTowerMaterials.mjs");
const materialModuleUrl = pathToFileURL(materialPath).href;
const cameraPath = path.join(projectRoot, "components", "ArchiveGate", "heroTowerCamera.mjs");
const cameraModuleUrl = pathToFileURL(cameraPath).href;
const modelPath = path.join(projectRoot, "public", "models", "hero-delivery-system-A-editorial-light.glb");
const previewPath = path.join(projectRoot, "public", "models", "hero-delivery-system-A-editorial-light.png");

test("the Archive Gate hero uses the approved A five-layer tower assets", () => {
  assert.ok(fs.statSync(modelPath).size > 100000, "A GLB asset should be present and non-empty");
  assert.ok(fs.statSync(previewPath).size > 100000, "A static preview should be present for fallback/loading");

  const component = fs.readFileSync(componentPath, "utf8");
  const styles = fs.readFileSync(stylesPath, "utf8");
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
  assert.match(component, /OrbitControls/);
  assert.match(component, /enablePan\s*=\s*false/);
  assert.match(component, /minAzimuthAngle\s*=\s*CAMERA_MIN_AZIMUTH/);
  assert.match(component, /maxAzimuthAngle\s*=\s*CAMERA_MAX_AZIMUTH/);
  assert.match(component, /CAMERA_MAX_POLAR_ANGLE/);
  assert.match(component, /touchAction\s*=\s*"pan-y"/);
  assert.match(component, /onPointerDown/);
  assert.match(component, /event\.delta/);
  assert.match(component, /ANNOTATION_FADE_IN_DURATION\s*=\s*800/);
  assert.match(component, /ANNOTATION_HOLD_DURATION\s*=\s*4400/);
  assert.match(component, /ANNOTATION_FADE_DURATION\s*=\s*800/);
  assert.match(component, /IDLE_LAYER_STEP_DURATION\s*=\s*1400/);
  assert.match(component, /function LayerHotspotProjector/);
  assert.match(component, /heroTowerHotspot/);
  assert.match(component, /HOTSPOT_VISIBLE_OPACITY\s*=\s*0\.5/);
  assert.match(component, /HOTSPOT_SCREEN_OFFSETS/);
  assert.match(component, /heroTowerCalloutClose/);
  assert.match(component, /onClick=\{dismissAnnotation\}/);
  assert.match(component, /never opens an annotation/);
  assert.match(component, /setIdleLayerIndex/);
  assert.match(component, /data-phase=\{annotation\.phase\}/);
  assert.match(styles, /\.heroActions \.primaryButton,[\s\S]*?justify-content:\s*center/);
  assert.doesNotMatch(component, /className={styles\.heroTowerControls}/);
  assert.doesNotMatch(component, /heroTowerStatus/);
  assert.doesNotMatch(component, /translate3d\(-1\.4rem/);
  assert.doesNotMatch(component, /scale\(1\.12\)/);
  assert.match(page, /HeroTowerVisual/);
  assert.doesNotMatch(page, /className=\{styles\.solutionMap\}/);
});

test("GLB geometry keeps the complete right arch and footing structure", async () => {
  const data = fs.readFileSync(modelPath);
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const gltf = await new Promise((resolve, reject) => {
    new GLTFLoader().parse(arrayBuffer, "", resolve, reject);
  });
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);

  for (const name of [
    "CMP_Arch_B_Module_09_RightLeg",
    "CMP_Arch_B_RightPierFooting",
    "CMP_Arch_B_RightSpringerBlock",
  ]) {
    const mesh = scene.getObjectByName(name);
    assert.ok(mesh?.isMesh, `${name} should be a mesh in the canonical GLB`);
    assert.equal(mesh.visible, true, `${name} should remain visible`);
    assert.ok(mesh.geometry.getAttribute("position")?.count > 0, `${name} should have geometry`);
  }

  const bounds = new THREE.Box3().setFromObject(scene);
  const size = bounds.getSize(new THREE.Vector3());
  assert.ok(bounds.max.x > 10, "the right-side geometry should reach the source GLB bound");
  assert.ok(bounds.min.y < 0, "the base geometry should extend below the model center");
  assert.ok(size.y > 8, "the canonical tower should retain its full vertical extent");
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

test("camera fit changes with the real Canvas aspect and keeps a safe distance", async () => {
  const { getHeroTowerCameraFit } = await import(cameraModuleUrl);
  const desktop = getHeroTowerCameraFit(507, 371, 7.75, 1440);
  const tablet = getHeroTowerCameraFit(720, 336, 7.75, 1024);
  const mobile = getHeroTowerCameraFit(342, 320, 7.75, 390);

  assert.equal(desktop.mode, "desktop");
  assert.equal(tablet.mode, "tablet");
  assert.equal(mobile.mode, "mobile");
  assert.ok(desktop.distance > 20);
  assert.ok(desktop.initialDistance < desktop.distance);
  assert.ok(Math.abs(desktop.initialDistance / desktop.distance - 0.55) < 0.001);
  assert.ok(mobile.distance < desktop.distance);
  assert.ok(mobile.initialDistance < mobile.distance);
  assert.ok(Math.abs(mobile.initialDistance / mobile.distance - 0.5) < 0.001);
  assert.ok(Math.abs(mobile.minDistance / mobile.distance - 0.31) < 0.001);
  assert.ok(mobile.maxDistance > mobile.distance);
  assert.deepEqual(desktop.target, [0.15, 0, 0]);
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
