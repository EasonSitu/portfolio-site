import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { withPublicBasePath } from "../../lib/publicPath.mjs";
import {
  createLayerRotationState,
  getLayerRotationSpeed,
  triggerLayerBoost,
} from "./heroTowerRotation.mjs";
import { getLayerMaterialProfile } from "./heroTowerMaterials.mjs";
import { getHeroTowerCameraFit } from "./heroTowerCamera.mjs";
import styles from "./ArchiveGateSite.module.scss";

const MODEL_URL = withPublicBasePath("/models/hero-delivery-system-A-editorial-light.glb");
const PREVIEW_URL = withPublicBasePath("/models/hero-delivery-system-A-editorial-light.png");
const LAYER_DIRECTIONS = [-1, 1, -1, 1, -1];
const ANNOTATION_FADE_IN_DURATION = 800;
const ANNOTATION_HOLD_DURATION = 4400;
const ANNOTATION_FADE_DURATION = 800;
const IDLE_LAYER_STEP_DURATION = 1400;
const HOTSPOT_VISIBLE_OPACITY = 0.5;
const HOTSPOT_SCREEN_OFFSETS = [
  { x: -3, y: -21 },
  { x: 0, y: 0 },
  { x: -34, y: 30 },
  { x: -36, y: 32 },
  { x: -26, y: 39 },
];
const CAMERA_MIN_POLAR_ANGLE = 0.72;
const CAMERA_MAX_POLAR_ANGLE = Math.PI / 2 - 0.12;
const CAMERA_DEFAULT_AZIMUTH = Math.atan2(7.8, 14.2);
const CAMERA_AZIMUTH_HALF_RANGE = 0.82;
const CAMERA_MIN_AZIMUTH = CAMERA_DEFAULT_AZIMUTH - CAMERA_AZIMUTH_HALF_RANGE;
const CAMERA_MAX_AZIMUTH = CAMERA_DEFAULT_AZIMUTH + CAMERA_AZIMUTH_HALF_RANGE;

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
    // Reuse this list during the animation loop instead of allocating a new
    // single-item array for every mesh on every frame.
    object.userData.heroMaterials = Array.isArray(object.material)
      ? object.material
      : object.material
        ? [object.material]
        : [];
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
  const profileKey = active ? "active" : "inactive";
  const profileState = root.userData.heroMaterialProfile ?? (root.userData.heroMaterialProfile = {
    key: null,
    framesRemaining: 0,
  });

  if (profileState.key !== profileKey) {
    profileState.key = profileKey;
    profileState.framesRemaining = reducedMotion ? 1 : 18;
  }

  // Material uniforms do not need to be traversed once the short profile
  // transition has settled. This keeps the idle render loop inexpensive.
  if (profileState.framesRemaining <= 0) return;

  const profile = getLayerMaterialProfile(active);
  const blend = reducedMotion ? 1 : 1 - Math.exp(-12 * Math.max(delta, 0));

  root.traverse((object) => {
    if (!object.isMesh) return;

    const source = object.userData.heroMaterials ?? (Array.isArray(object.material) ? object.material : [object.material]);
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
    });
  });

  profileState.framesRemaining -= 1;
}

function CameraRig({ modelRadius }) {
  const { camera, gl, size } = useThree();
  const controlsRef = useRef(null);
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const hasInteractedRef = useRef(false);
  const applyingFrameRef = useRef(false);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.82;
    controls.screenSpacePanning = false;
    // Keep the camera above the tower's horizontal plane and within the
    // front-facing azimuth window; the rear and underside stay inaccessible.
    controls.minPolarAngle = CAMERA_MIN_POLAR_ANGLE;
    controls.maxPolarAngle = CAMERA_MAX_POLAR_ANGLE;
    controls.minAzimuthAngle = CAMERA_MIN_AZIMUTH;
    controls.maxAzimuthAngle = CAMERA_MAX_AZIMUTH;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    // OrbitControls defaults to `none`, which would also consume vertical
    // page scrolling on mobile. One-finger rotation remains available while
    // the page keeps ownership of the vertical pan gesture.
    controls.domElement.style.touchAction = "pan-y";

    const markInteracted = () => {
      if (!applyingFrameRef.current) hasInteractedRef.current = true;
    };

    controls.addEventListener("change", markInteracted);
    controlsRef.current = controls;

    return () => {
      controls.removeEventListener("change", markInteracted);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl]);

  useEffect(() => {
    const controls = controlsRef.current;
    const viewportWidth = typeof window === "undefined" ? size.width : window.innerWidth;
    const fit = getHeroTowerCameraFit(size.width, size.height, modelRadius, viewportWidth);
    target.fromArray(fit.target);
    const currentOffset = camera.position.clone().sub(target);
    const currentDistance = currentOffset.length();
    const defaultDirection = new THREE.Vector3(...fit.position).sub(target).normalize();
    const currentDirection = hasInteractedRef.current && currentDistance > 0
      ? currentOffset.normalize()
      : defaultDirection;
    const nextDistance = hasInteractedRef.current
      ? THREE.MathUtils.clamp(Math.max(currentDistance, fit.initialDistance), fit.minDistance, fit.maxDistance)
      : fit.initialDistance;

    applyingFrameRef.current = true;
    camera.fov = fit.fov;
    camera.near = 0.1;
    camera.far = 100;
    camera.position.copy(target).add(currentDirection.multiplyScalar(nextDistance));
    camera.updateProjectionMatrix();

    if (controls) {
      controls.target.copy(target);
      controls.minDistance = fit.minDistance;
      controls.maxDistance = fit.maxDistance;
      controls.minPolarAngle = CAMERA_MIN_POLAR_ANGLE;
      controls.maxPolarAngle = CAMERA_MAX_POLAR_ANGLE;
      controls.minAzimuthAngle = CAMERA_MIN_AZIMUTH;
      controls.maxAzimuthAngle = CAMERA_MAX_AZIMUTH;
      controls.update();
    } else {
      camera.lookAt(target);
    }

    applyingFrameRef.current = false;
  }, [camera, modelRadius, size.height, size.width, target]);

  useFrame(() => {
    controlsRef.current?.update();
  });

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

function LayerHotspotProjector({ layerState, hotspotRefs }) {
  const { camera, size } = useThree();
  const worldCenter = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    layerState.current.forEach(({ root }, index) => {
      const node = hotspotRefs.current[index];
      if (!node) return;

      root.getWorldPosition(worldCenter);
      projected.copy(worldCenter).project(camera);

      const baseX = (projected.x * 0.5 + 0.5) * size.width;
      const baseY = (-projected.y * 0.5 + 0.5) * size.height;
      const offset = HOTSPOT_SCREEN_OFFSETS[index] || { x: 0, y: 0 };
      const offsetScale = Math.min(1, size.width / 720);
      const x = baseX + offset.x * offsetScale;
      const y = baseY + offset.y * offsetScale;
      const visible = projected.z > -1 && projected.z < 1 && x > -24 && x < size.width + 24 && y > -24 && y < size.height + 24;

      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      node.style.opacity = visible ? String(HOTSPOT_VISIBLE_OPACITY) : "0";
      node.style.pointerEvents = visible ? "auto" : "none";
    });
  });

  return null;
}

function DeliveryTower({ activeIndex, hoveredIndex, reducedMotion, rotationState, onHover, onSelect, onReady, hotspotRefs }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const layerState = useRef([]);
  const pointerState = useRef({ pointerId: null, startX: 0, startY: 0, moved: false });
  const lastPointerWasDrag = useRef(false);

  const sceneData = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const scale = 8.5 / Math.max(size.y, 1);

    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    clone.updateMatrixWorld(true);
    cloneRuntimeMaterials(clone);

    const normalizedBounds = new THREE.Box3().setFromObject(clone);
    const normalizedSphere = normalizedBounds.getBoundingSphere(new THREE.Sphere());

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

    return { scene: clone, radius: normalizedSphere.radius };
  }, [gltf.scene]);

  const { scene, radius } = sceneData;

  useEffect(() => {
    onReady?.(radius);
  }, [onReady, radius]);

  useFrame((_, delta) => {
    const now = performance.now();
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
      const clickBoostedSpeed = getLayerRotationSpeed(rotationState, index, now);
      const speed = clickBoostedSpeed + (isActive ? 0.055 : 0) + (isHovered ? 0.085 : 0);
      root.rotation.y += LAYER_DIRECTIONS[index] * speed * delta;
      root.rotation.x = THREE.MathUtils.damp(root.rotation.x, emphasis ? 0.035 * LAYER_DIRECTIONS[index] : 0, 5, delta);
      root.position.y = THREE.MathUtils.damp(root.position.y, baseY + (emphasis ? 0.12 : 0), 7, delta);
      root.scale.setScalar(THREE.MathUtils.damp(root.scale.x, emphasis ? 1.028 : 1, 7, delta));
    });
  });

  const handlePointerDown = (event) => {
    event.stopPropagation();
    pointerState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    lastPointerWasDrag.current = false;
    onHover(workflowLayerIndex(event.object));
  };

  const handlePointerMove = (event) => {
    event.stopPropagation();
    const state = pointerState.current;
    if (state.pointerId === event.pointerId) {
      const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);
      if (distance > 8) state.moved = true;
    }
    onHover(workflowLayerIndex(event.object));
  };

  const handlePointerUp = (event) => {
    event.stopPropagation();
    const state = pointerState.current;
    if (state.pointerId !== event.pointerId) return;
    lastPointerWasDrag.current = state.moved;
    pointerState.current = { pointerId: null, startX: 0, startY: 0, moved: false };
  };

  const handlePointerCancel = (event) => {
    event.stopPropagation();
    pointerState.current = { pointerId: null, startX: 0, startY: 0, moved: true };
    lastPointerWasDrag.current = true;
  };

  const handleClick = (event) => {
    event.stopPropagation();
    const index = workflowLayerIndex(event.object);
    const movedByPointer = pointerState.current.moved || lastPointerWasDrag.current;
    const movedByR3F = Number.isFinite(event.delta) && event.delta > 8;
    lastPointerWasDrag.current = false;
    if (movedByPointer || movedByR3F) return;
    if (index >= 0) onSelect(index);
  };

  return (
    <group rotation={[0.02, -0.12, 0]}>
      <group
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={() => onHover(-1)}
        onClick={handleClick}
      >
        <primitive object={scene} />
      </group>
      <LayerHotspotProjector layerState={layerState} hotspotRefs={hotspotRefs} />
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

export default function HeroTowerVisual({ layers, locale, onReady }) {
  const [webgl, setWebgl] = useState(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [modelRadius, setModelRadius] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [idleLayerIndex, setIdleLayerIndex] = useState(0);
  const hotspotRefs = useRef([]);
  const [annotation, setAnnotation] = useState(null);
  const rotationState = useRef(createLayerRotationState());
  const annotationTimers = useRef({ fade: 0, hide: 0 });
  const annotationSequence = useRef(0);

  const handleTowerReady = useCallback((radius) => {
    if (Number.isFinite(radius)) setModelRadius(radius);
    setReady(true);
  }, []);

  const clearAnnotationTimers = useCallback(() => {
    window.clearTimeout(annotationTimers.current.fade);
    window.clearTimeout(annotationTimers.current.hide);
    annotationTimers.current = { fade: 0, hide: 0 };
  }, []);

  const dismissAnnotation = useCallback(() => {
    clearAnnotationTimers();
    setAnnotation(null);
  }, [clearAnnotationTimers]);

  const showAnnotation = useCallback((index) => {
    clearAnnotationTimers();
    const sequence = annotationSequence.current + 1;
    annotationSequence.current = sequence;
    setAnnotation({ index, phase: "visible", sequence });

    const fadeAt = ANNOTATION_FADE_IN_DURATION + ANNOTATION_HOLD_DURATION;
    annotationTimers.current.fade = window.setTimeout(() => {
      setAnnotation((current) => current?.sequence === sequence
        ? { ...current, phase: "fading" }
        : current);
    }, fadeAt);
    annotationTimers.current.hide = window.setTimeout(() => {
      setAnnotation((current) => current?.sequence === sequence ? null : current);
    }, fadeAt + ANNOTATION_FADE_DURATION);
  }, [clearAnnotationTimers]);

  const handleTowerSelect = useCallback((index) => {
    // Resetting the timestamp makes repeated clicks feel responsive rather
    // than waiting for the previous boost to finish.
    triggerLayerBoost(rotationState.current, index, performance.now(), reducedMotion);
    setSelectedIndex(index);
    setHoveredIndex(-1);
    showAnnotation(index);
  }, [reducedMotion, showAnnotation]);

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
      dismissAnnotation();
    }
  }, [dismissAnnotation, handleTowerSelect, layers.length, selectedIndex]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    // Before a click, gently sweep the active material from the first layer to
    // the fifth. This only changes the material emphasis; it never selects a
    // layer and therefore never opens an annotation.
    if (reducedMotion || selectedIndex !== null || hoveredIndex >= 0) return undefined;

    setIdleLayerIndex(0);
    const timer = window.setInterval(() => {
      setIdleLayerIndex((current) => (current + 1) % layers.length);
    }, IDLE_LAYER_STEP_DURATION);

    return () => window.clearInterval(timer);
  }, [hoveredIndex, layers.length, reducedMotion, selectedIndex]);

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
      if (event.key === "Escape") {
        setSelectedIndex(null);
        dismissAnnotation();
      }
    };
    window.addEventListener("keydown", releaseSelection);
    return () => {
      window.removeEventListener("keydown", releaseSelection);
      clearAnnotationTimers();
    };
  }, [clearAnnotationTimers, dismissAnnotation]);

  const activeIndex = hoveredIndex >= 0 ? hoveredIndex : selectedIndex ?? idleLayerIndex;
  const annotationLayer = annotation ? layers[annotation.index] : null;
  const isReady = Boolean(webgl && ready && !failed);

  useEffect(() => {
    if (isReady) onReady?.();
  }, [isReady, onReady]);

  const localeText = locale === "en"
      ? {
          accessibleLabel: "Five-layer delivery workflow model",
          controlsLabel: "Choose a delivery workflow layer with the keyboard",
          hotspotsLabel: "Choose a delivery workflow layer",
          closeAnnotation: "Close annotation",
        }
      : locale === "zh-CN"
        ? {
            accessibleLabel: "五层数字化交付工作模型",
            controlsLabel: "使用键盘选择交付工作层级",
            hotspotsLabel: "选择交付工作层级",
            closeAnnotation: "关闭标注",
          }
        : {
            accessibleLabel: "五層數碼交付工作模型",
            controlsLabel: "使用鍵盤選擇交付工作層級",
            hotspotsLabel: "選擇交付工作層級",
            closeAnnotation: "關閉標註"
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
              camera={{ position: [7.8, 6.4, 14.2], fov: 40, near: 0.1, far: 100 }}
              // Keep the enlarged interaction frame responsive on high-DPI
              // displays; the model geometry itself is unchanged.
              dpr={[1, 1.25]}
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
              <CameraRig modelRadius={modelRadius} />
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
                  hotspotRefs={hotspotRefs}
                />
              </Suspense>
            </Canvas>
          </TowerErrorBoundary>
        )}

        <div
          className={styles.heroTowerHotspots}
          role="group"
          aria-label={localeText.hotspotsLabel}
        >
          {layers.map((layer, index) => (
            <button
              key={layer.id}
              ref={(node) => { hotspotRefs.current[index] = node; }}
              className={styles.heroTowerHotspot}
              type="button"
              data-active={activeIndex === index ? "true" : "false"}
              data-hovered={hoveredIndex === index ? "true" : "false"}
              aria-label={`${layer.number} ${layer.title}`}
              tabIndex={-1}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(-1)}
              onClick={(event) => {
                event.stopPropagation();
                handleTowerSelect(index);
              }}
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {annotationLayer && (
        <div
          key={annotation.sequence}
          className={styles.heroTowerCallout}
          data-phase={annotation.phase}
          role="group"
          aria-live="polite"
        >
          <button
            className={styles.heroTowerCalloutClose}
            type="button"
            aria-label={localeText.closeAnnotation}
            onClick={dismissAnnotation}
          >
            <span aria-hidden="true">×</span>
          </button>
          <span>{annotationLayer.number}</span>
          <strong>{annotationLayer.title}</strong>
          <p>{annotationLayer.description}</p>
        </div>
      )}

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
