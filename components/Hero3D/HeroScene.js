import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { workflowIdForNode } from "../../lib/heroWorkflow.mjs";
import { DESIGN_TOKENS } from "../../lib/designTokens.mjs";
import styles from "./HeroScene.module.scss";

const MODEL_URL = "/models/hero-delivery-system.glb";

const MATERIAL_TOKENS = {
  stone: { color: DESIGN_TOKENS.stone, roughness: 0.58, metalness: 0.3 },
  graphite: { color: "#121722", roughness: 0.28, metalness: 0.68 },
  glass: { color: DESIGN_TOKENS.glass, roughness: 0.1, metalness: 0.04 },
  crystalCore: { color: DESIGN_TOKENS.ivory, roughness: 0.1, metalness: 0.02 },
  energy: { color: "#c88c4d", emissive: DESIGN_TOKENS.champagne },
};

useLoader.preload(GLTFLoader, MODEL_URL);

function findWorkflowRoot(object) {
  let current = object;
  while (current) {
    const workflowId = workflowIdForNode(current.name);
    if (workflowId) return { root: current, workflowId };
    current = current.parent;
  }
  return null;
}

function makeRuntimeMaterial(materialName) {
  if (materialName === "Web_Stone") {
    const token = MATERIAL_TOKENS.stone;
    return new THREE.MeshStandardMaterial({
      name: "Runtime_ObsidianStone",
      color: token.color,
      roughness: token.roughness,
      metalness: token.metalness,
      envMapIntensity: 0.62,
    });
  }

  if (materialName === "Web_Graphite") {
    const token = MATERIAL_TOKENS.graphite;
    return new THREE.MeshStandardMaterial({
      name: "Runtime_SlateGraphite",
      color: token.color,
      roughness: token.roughness,
      metalness: token.metalness,
      envMapIntensity: 0.9,
    });
  }

  if (materialName === "Web_Crystal") {
    const token = MATERIAL_TOKENS.glass;
    return new THREE.MeshPhysicalMaterial({
      name: "Runtime_SmokedGlass",
      color: token.color,
      roughness: token.roughness,
      metalness: token.metalness,
      transmission: 0.54,
      thickness: 0.48,
      ior: 1.46,
      transparent: true,
      opacity: 0.94,
      envMapIntensity: 1.62,
      clearcoat: 0.36,
      clearcoatRoughness: 0.1,
    });
  }

  if (materialName === "Web_CrystalCore") {
    const token = MATERIAL_TOKENS.crystalCore;
    return new THREE.MeshPhysicalMaterial({
      name: "Runtime_WarmCrystalCore",
      color: token.color,
      roughness: token.roughness,
      metalness: token.metalness,
      transmission: 0.44,
      thickness: 0.7,
      ior: 1.46,
      transparent: true,
      opacity: 0.98,
      envMapIntensity: 1.5,
      emissive: new THREE.Color("#b87743"),
      emissiveIntensity: 0.38,
      clearcoat: 0.55,
      clearcoatRoughness: 0.08,
    });
  }

  if (materialName === "Web_EmissiveGold") {
    const token = MATERIAL_TOKENS.energy;
    return new THREE.MeshStandardMaterial({
      name: "Runtime_ChampagneEnergy",
      color: token.color,
      roughness: 0.18,
      metalness: 0.78,
      emissive: new THREE.Color(token.emissive),
      emissiveIntensity: 1.9,
      toneMapped: false,
    });
  }

  return null;
}

function DeliverySystem({ activeId, onActivate, onHover, reducedMotion, labelRefs }) {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const rootRef = useRef();
  const layerState = useRef([]);
  const boostUntil = useRef(new Map());

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    // Give the realtime hero a little more presence than the original
    // greybox while keeping the approved camera composition intact.
    const scale = 10.0 / Math.max(size.y, 1);

    clone.position.set(-center.x * scale, -center.y * scale - 0.35, -center.z * scale);
    clone.scale.setScalar(scale);

    const arch = clone.getObjectByName("Hero_Arch");
    if (arch) {
      arch.scale.multiplyScalar(1.12);
      arch.position.z -= 0.28;
    }

    clone.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      const sourceMaterial = Array.isArray(object.material) ? object.material[0] : object.material;
      const runtimeMaterial = makeRuntimeMaterial(sourceMaterial?.name);
      object.material = runtimeMaterial ?? sourceMaterial.clone();
    });

    layerState.current = [1, 2, 3, 4, 5].map((index) => {
      const root = clone.getObjectByName(`Hero_Layer_0${index}`);
      return root
        ? {
            root,
            baseY: root.position.y,
            speed: 0,
            direction: index % 2 === 0 ? -1 : 1,
          }
        : null;
    }).filter(Boolean);

    return clone;
  }, [gltf.scene]);

  useFrame(({ clock, camera, gl }, delta) => {
    const time = clock.getElapsedTime();
    const now = time;
    const requestedBoost = labelRefs.current.boostId;
    if (requestedBoost) {
      boostUntil.current.set(requestedBoost, now + 1.35);
      labelRefs.current.boostId = null;
    }
    if (rootRef.current) rootRef.current.updateMatrixWorld(true);
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);

    layerState.current.forEach(({ root, baseY, direction }, index) => {
      const workflowId = workflowIdForNode(root.name);
      const selected = workflowId === activeId;
      const boost = (boostUntil.current.get(workflowId) ?? 0) > now;
      const hovered = labelRefs.current.hoveredId === workflowId;
      const targetSpeed = reducedMotion
        ? 0
        : 0.05 + (hovered ? 1.1 : 0) + (selected ? 0.2 : 0) + (boost ? 3.4 : 0);
      const signedTarget = targetSpeed * direction;
      const state = layerState.current[index];
      state.speed = THREE.MathUtils.damp(state.speed, signedTarget, hovered || boost ? 7 : 3.5, delta);
      root.rotation.y += state.speed * delta;
      const targetTilt = selected ? 0.04 * direction : 0;
      const targetY = baseY + (selected || hovered ? 0.12 : 0);
      root.rotation.x = THREE.MathUtils.damp(root.rotation.x, targetTilt, 4, delta);
      root.position.y = THREE.MathUtils.damp(root.position.y, targetY, 7, delta);
      root.scale.setScalar(THREE.MathUtils.damp(root.scale.x, selected ? 1.035 : 1, 7, delta));

      const label = labelRefs.current[workflowId];
      if (label) {
        // The exported layer empties carry intentional per-layer anchor points.
        // Using that stable anchor keeps the HTML control easy to hover while
        // the panel itself rotates around the same centre.
        const worldPosition = root.getWorldPosition(new THREE.Vector3());
        const projected = worldPosition.project(camera);
        const rect = gl.domElement.getBoundingClientRect();
        const x = Math.max(8, Math.min(rect.width - 8, (projected.x * 0.5 + 0.5) * rect.width));
        const y = Math.max(8, Math.min(rect.height - 8, (-projected.y * 0.5 + 0.5) * rect.height));
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
        label.style.opacity = projected.z > 1 ? "0" : "1";
      }
    });

    if (rootRef.current && !reducedMotion) {
      rootRef.current.rotation.y = Math.sin(time * 0.12) * 0.025;
    }
  });

  return (
    <group ref={rootRef} rotation={[0.02, -0.12, 0]}>
      <primitive
        object={scene}
        onPointerMove={(event) => {
          event.stopPropagation();
          const workflowId = findWorkflowRoot(event.object)?.workflowId ?? null;
          labelRefs.current.hoveredId = workflowId;
          onHover(workflowId);
        }}
        onPointerOut={() => {
          labelRefs.current.hoveredId = null;
          onHover(null);
        }}
        onClick={(event) => {
          const match = findWorkflowRoot(event.object);
          if (match) {
            event.stopPropagation();
            onActivate(match.workflowId);
            boostUntil.current.set(match.workflowId, clock.getElapsedTime() + 1.35);
          }
        }}
      />
    </group>
  );
}

function CameraRig({ reducedMotion }) {
  const { camera, pointer } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useFrame((_, delta) => {
    const px = reducedMotion ? 0 : pointer.x * 0.28;
    const py = reducedMotion ? 0 : pointer.y * 0.14;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, 7.7 + px, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 3.15 + py, 3, delta);
    camera.lookAt(target);
  });

  return null;
}

function SceneLights() {
  return (
    <>
      <hemisphereLight intensity={0.3} color="#b8c4e2" groundColor={DESIGN_TOKENS.space} />
      <directionalLight position={[5, 9, 8]} intensity={2.25} color="#f0c896" castShadow />
      <directionalLight position={[-7, 4, -3]} intensity={1.05} color="#6676c4" />
      <pointLight position={[0, -2.7, 2.8]} intensity={27} distance={8} decay={2} color="#ffd08a" />
      <pointLight position={[0, 1.8, 1]} intensity={12} distance={7} decay={2} color={DESIGN_TOKENS.violet} />
    </>
  );
}

function ModelLoader() {
  return (
    <div className={styles.loader} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export default function HeroScene({ layers, activeId, onActivate, reducedMotion = false, fallbackText }) {
  const [webgl, setWebgl] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const labelRefs = useRef({ hoveredId: null });

  useEffect(() => {
    document.body.style.cursor = hoveredId ? "pointer" : "";
    return () => { document.body.style.cursor = ""; };
  }, [hoveredId]);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setWebgl(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  if (webgl === null) return <ModelLoader />;
  if (!webgl) {
    return <div className={styles.fallback}><span className={styles.fallbackOrb} />{fallbackText}</div>;
  }

  return (
    <div className={styles.scene}>
      <Canvas
        className={styles.canvas}
        camera={{ position: [7.7, 3.15, 14.2], fov: 38, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <CameraRig reducedMotion={reducedMotion} />
        <SceneLights />
        <fog attach="fog" args={[DESIGN_TOKENS.space, 14, 27]} />
        <Suspense fallback={null}>
          <DeliverySystem
            activeId={activeId}
            onActivate={onActivate}
            onHover={setHoveredId}
            reducedMotion={reducedMotion}
            labelRefs={labelRefs}
          />
        </Suspense>
      </Canvas>

      <div className={styles.layerLabels} aria-label="Five delivery workflow layers">
        {layers.map((layer) => (
          <button
            key={layer.id}
            ref={(node) => {
              if (node) labelRefs.current[layer.id] = node;
              else delete labelRefs.current[layer.id];
            }}
            type="button"
            className={`${styles.layerLabel} ${layer.id === activeId ? styles.layerLabelActive : ""} ${layer.id === hoveredId ? styles.layerLabelHover : ""}`}
            onMouseEnter={() => {
              labelRefs.current.hoveredId = layer.id;
              setHoveredId(layer.id);
            }}
            onMouseLeave={() => {
              labelRefs.current.hoveredId = null;
              setHoveredId(null);
            }}
            onFocus={() => {
              labelRefs.current.hoveredId = layer.id;
              setHoveredId(layer.id);
            }}
            onBlur={() => {
              labelRefs.current.hoveredId = null;
              setHoveredId(null);
            }}
            onClick={() => {
              onActivate(layer.id);
              labelRefs.current.boostId = layer.id;
            }}
            aria-pressed={layer.id === activeId}
          >
            <span className={styles.layerLabelTitle}>{layer.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
