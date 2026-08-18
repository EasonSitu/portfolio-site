import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { withPublicBasePath } from "../../lib/publicPath.mjs";
import {
  createLayerRotationState,
  getLayerRotationSpeed,
  triggerLayerBoost,
} from "./heroTowerRotation.mjs";
import { getLayerMaterialProfile } from "./heroTowerMaterials.mjs";
import styles from "./ArchiveGateSite.module.scss";

const MODEL_URL = withPublicBasePath("/models/hero-delivery-system-A-editorial-light.glb");
const PREVIEW_URL = withPublicBasePath("/models/hero-delivery-system-A-editorial-light.png");
const LAYER_DIRECTIONS = [-1, 1, -1, 1, -1];

function workflowLayerIndex(object) {
  let current = object;
  while (current) {
    const match = /^Hero_Layer_0([1-5])$/.exec(current.name || "");
    if (match) return Number(match[1]) - 1;
    current = current.parent;
  }
  return -1;
}

function cloneRuntimeMaterials(scene) {
  scene.traverse((object) => {
    if (!object.isMesh) return;

    const source = Array.isArray(object.material) ? object.material : [object.material];
    const materials = source.map((material) => material?.clone?.() ?? material);

    materials.forEach((material) => {
      if (!material) return;
      material.needsUpdate = true;
      // Keep the selected A direction's material language. Only clone the
      // materials so a hover state cannot mutate the cached GLB scene.
      if (material.color && material.name === "Web_Crystal") {
        material.color.set("#B9D7F0");
        material.transparent = true;
        material.opacity = Math.min(material.opacity || 1, 0.92);
      }
    });

    object.material = Array.isArray(object.material) ? materials : materials[0];
    object.castShadow = false;
    object.receiveShadow = false;
  });
}

function cachedTargetColor(material, cacheKey, hex) {
  const cache = material.userData ?? (material.userData = {});
  const target = cache[cacheKey] ?? (cache[cacheKey] = new THREE.Color());
  return target.set(hex);
}

function applyLayerMaterialProfile(root, active, delta, reducedMotion) {
  const profile = getLayerMaterialProfile(active);
  const blend = reducedMotion ? 1 : 1 - Math.exp(-12 * Math.max(delta, 0));

  root.traverse((object) => {
    if (!object.isMesh) return;

    const source = Array.isArray(object.material) ? object.material : [object.material];
    source.forEach((material) => {
      if (!material) return;

      // The imported asset names its translucent inset windows explicitly;
      // every other mesh in a layer follows the graphite plate profile.
      const crystal = object.name.includes("InsetWindow") || material.name === "Web_Crystal";
      const color = crystal ? profile.crystalColor : profile.graphiteColor;
      const targetColor = cachedTargetColor(material, crystal ? "heroCrystalTarget" : "heroGraphiteTarget", color);
      if (material.color) material.color.lerp(targetColor, blend);

      if (material.emissive) {
        const targetEmissive = cachedTargetColor(material, "heroEmissiveTarget", profile.emissiveColor);
        material.emissive.lerp(targetEmissive, blend);
        const targetIntensity = crystal
          ? profile.crystalEmissiveIntensity
          : profile.graphiteEmissiveIntensity;
        const currentIntensity = Number.isFinite(material.emissiveIntensity) ? material.emissiveIntensity : 0;
        material.emissiveIntensity = THREE.MathUtils.lerp(currentIntensity, targetIntensity, blend);
      }

      if (typeof material.roughness === "number") {
        const targetRoughness = crystal ? profile.crystalRoughness : profile.graphiteRoughness;
        material.roughness = THREE.MathUtils.lerp(material.roughness, targetRoughness, blend);
      }
      material.needsUpdate = true;
    });
  });
}

function CameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

function SceneLights() {
  return (
    <>
      <hemisphereLight intensity={1.35} color="#F7FBFF" groundColor="#17212B" />
      <directionalLight position={[5, 8, 10]} intensity={2.2} color="#FFF4E8" />
      <directionalLight position={[-7, 4, -3]} intensity={1.35} color="#8EB9EC" />
      <pointLight position={[0, 0.5, 3]} intensity={4.5} distance={9} decay={2} color="#D9E9FF" />
    </>
  );
}

function DeliveryTower({ activeIndex, hoveredIndex, reducedMotion, rotationState, onHover, onSelect, onReady }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const rootRef = useRef(null);
  const layerState = useRef([]);

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const scale = 8.5 / Math.max(size.y, 1);

    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    cloneRuntimeMaterials(clone);

    layerState.current = [1, 2, 3, 4, 5].map((number) => {
      const root = clone.getObjectByName(`Hero_Layer_0${number}`);
      if (!root) return null;
      return {
        root,
        baseY: root.position.y,
        baseRotationX: root.rotation.x,
        baseRotationY: root.rotation.y,
      };
    }).filter(Boolean);

    return clone;
  }, [gltf.scene]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useFrame((_, delta) => {
    layerState.current.forEach(({ root, baseY, baseRotationX, baseRotationY }, index) => {
      const isActive = index === activeIndex;
      const isHovered = index === hoveredIndex;
      const emphasis = isActive || isHovered;

      // Keep the color transition independent from the motion preference:
      // reduced motion removes rotation and lift, but selection still needs
      // a visible non-motion state change.
      applyLayerMaterialProfile(root, emphasis, delta, reducedMotion);

      if (reducedMotion) {
        root.position.y = baseY;
        root.rotation.x = baseRotationX;
        root.rotation.y = baseRotationY;
        root.scale.setScalar(1);
        return;
      }

      // Click boost is temporary and isolated to the selected layer. The
      // smaller active/hover additions keep the idle interaction restrained.
      const clickBoostedSpeed = getLayerRotationSpeed(rotationState, index, performance.now());
      const speed = clickBoostedSpeed + (isActive ? 0.055 : 0) + (isHovered ? 0.085 : 0);
      root.rotation.y += LAYER_DIRECTIONS[index] * speed * delta;
      root.rotation.x = THREE.MathUtils.damp(root.rotation.x, emphasis ? 0.035 * LAYER_DIRECTIONS[index] : 0, 5, delta);
      root.position.y = THREE.MathUtils.damp(root.position.y, baseY + (emphasis ? 0.12 : 0), 7, delta);
      root.scale.setScalar(THREE.MathUtils.damp(root.scale.x, emphasis ? 1.028 : 1, 7, delta));
    });
  });

  const handlePointerMove = (event) => {
    event.stopPropagation();
    onHover(workflowLayerIndex(event.object));
  };

  const handleClick = (event) => {
    event.stopPropagation();
    const index = workflowLayerIndex(event.object);
    if (index >= 0) onSelect(index);
  };

  return (
    <group ref={rootRef} rotation={[0.02, -0.12, 0]}>
      <group
        onPointerMove={handlePointerMove}
        onPointerLeave={() => onHover(-1)}
        onClick={handleClick}
      >
        <primitive object={scene} />
      </group>
    </group>
  );
}

class TowerErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function StaticTowerDescription({ layers, label }) {
  return (
    <ol className={styles.heroTowerAccessibleList} aria-label={label}>
      {layers.map((layer) => (
        <li key={layer.id}>
          <strong>{layer.number} {layer.title}</strong>
          <span>{layer.description}</span>
        </li>
      ))}
    </ol>
  );
}

export default function HeroTowerVisual({ layers, locale }) {
  const [webgl, setWebgl] = useState(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const rotationState = useRef(createLayerRotationState());
  const handleTowerReady = useCallback(() => setReady(true), []);
  const handleTowerSelect = useCallback((index) => {
    // Resetting the timestamp makes repeated clicks feel responsive rather
    // than waiting for the previous boost to finish.
    triggerLayerBoost(rotationState.current, index, performance.now(), reducedMotion);
    setSelectedIndex(index);
    setHoveredIndex(-1);
  }, [reducedMotion]);

  // The model is now the primary interaction. Arrow keys keep the same
  // layer-selection path available without bringing the numbered controls
  // back into the visual composition.
  const handleTowerKeyDown = useCallback((event) => {
    const currentIndex = selectedIndex ?? 0;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      handleTowerSelect((currentIndex + 1) % layers.length);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      handleTowerSelect((currentIndex - 1 + layers.length) % layers.length);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTowerSelect(currentIndex);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setSelectedIndex(null);
    }
  }, [handleTowerSelect, layers.length, selectedIndex]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setWebgl(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  useEffect(() => {
    const releaseSelection = (event) => {
      if (event.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", releaseSelection);
    return () => window.removeEventListener("keydown", releaseSelection);
  }, []);

  const activeIndex = hoveredIndex >= 0 ? hoveredIndex : selectedIndex ?? 0;
  const selectedLayer = selectedIndex === null ? null : layers[selectedIndex];
  const isReady = Boolean(webgl && ready && !failed);
  const localeText = locale === "en"
      ? {
          accessibleLabel: "Five-layer delivery workflow model",
          controlsLabel: "Choose a delivery workflow layer with the keyboard",
        }
      : locale === "zh-CN"
        ? {
            accessibleLabel: "五层数字化交付工作模型",
            controlsLabel: "使用键盘选择交付工作层级",
          }
        : {
            accessibleLabel: "五層數碼交付工作模型",
            controlsLabel: "使用鍵盤選擇交付工作層級",
          };

  return (
    <div className={styles.heroTower} data-reduced-motion={reducedMotion ? "true" : "false"}>
      <div className={styles.heroTowerStage} data-ready={isReady ? "true" : "false"}>
        <img
          className={styles.heroTowerFallback}
          src={PREVIEW_URL}
          alt=""
          aria-hidden="true"
        />

        {webgl && !failed && (
          <TowerErrorBoundary onError={() => setFailed(true)}>
            <Canvas
              className={styles.heroTowerCanvas}
              camera={{ position: [7.8, 4.1, 14.2], fov: 34, near: 0.1, far: 100 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              role="img"
              aria-label={localeText.accessibleLabel}
              tabIndex={0}
              onKeyDown={handleTowerKeyDown}
              onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0);
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.05;
                gl.outputColorSpace = THREE.SRGBColorSpace;
              }}
              onPointerLeave={() => setHoveredIndex(-1)}
            >
              <CameraRig />
              <SceneLights />
              <Suspense fallback={null}>
                <DeliveryTower
                  activeIndex={activeIndex}
                  hoveredIndex={hoveredIndex}
                  reducedMotion={reducedMotion}
                  rotationState={rotationState.current}
                  onHover={(index) => setHoveredIndex((current) => current === index ? current : index)}
                  onSelect={handleTowerSelect}
                  onReady={handleTowerReady}
                />
              </Suspense>
            </Canvas>
          </TowerErrorBoundary>
        )}

        {selectedLayer && (
          <div className={styles.heroTowerCallout} role="status" aria-live="polite">
            <span>{selectedLayer.number}</span>
            <strong>{selectedLayer.title}</strong>
            <p>{selectedLayer.description}</p>
          </div>
        )}

      </div>

      <div
        className={styles.heroTowerKeyboardControls}
        role="group"
        aria-label={localeText.controlsLabel}
      >
        {layers.map((layer, index) => (
          <button
            key={layer.id}
            type="button"
            className={styles.heroTowerKeyboardControl}
            data-active={activeIndex === index ? "true" : "false"}
            aria-pressed={selectedIndex === index}
            aria-label={`${layer.number} ${layer.title}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(-1)}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(-1)}
            onClick={() => handleTowerSelect(index)}
          >
            {layer.number}
          </button>
        ))}
      </div>

      <StaticTowerDescription layers={layers} label={localeText.accessibleLabel} />
    </div>
  );
}
