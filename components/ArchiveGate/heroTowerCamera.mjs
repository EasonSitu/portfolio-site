const DEFAULT_MODEL_RADIUS = 7.75;
// A slightly higher default viewpoint reveals the top surface of each layer
// without changing the protected front-facing OrbitControls limits.
const DEFAULT_DIRECTION = Object.freeze([7.8, 6.4, 14.2]);
// The visible model is intentionally larger than the conservative fit sphere.
// Keep the interaction frame generous enough that this does not rely on CSS
// transforms or an arbitrary model offset.
const INITIAL_DISTANCE_FACTORS = Object.freeze({ desktop: 0.55, tablet: 0.58, mobile: 0.5 });
const MIN_ZOOM_DISTANCE_FACTOR = 0.31;

export const HERO_TOWER_CAMERA_MODES = Object.freeze({
  desktop: Object.freeze({ fov: 40, margin: 1.18 }),
  tablet: Object.freeze({ fov: 42, margin: 1.18 }),
  mobile: Object.freeze({ fov: 44, margin: 1.2 }),
});

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function getCameraMode(viewportWidth) {
  if (viewportWidth <= 768) return "mobile";
  if (viewportWidth < 1200) return "tablet";
  return "desktop";
}

export function getHeroTowerCameraFit(width, height, modelRadius = DEFAULT_MODEL_RADIUS, viewportWidth = width) {
  const safeWidth = Math.max(finiteOr(width, 1), 1);
  const safeHeight = Math.max(finiteOr(height, 1), 1);
  const safeRadius = Math.max(finiteOr(modelRadius, DEFAULT_MODEL_RADIUS), 0.1);
  const safeViewportWidth = Math.max(finiteOr(viewportWidth, safeWidth), 1);
  const aspect = safeWidth / safeHeight;
  const mode = getCameraMode(safeViewportWidth);
  const { fov, margin } = HERO_TOWER_CAMERA_MODES[mode];
  const verticalHalfFov = (fov * Math.PI) / 360;
  const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * aspect);
  const limitingHalfFov = Math.min(verticalHalfFov, horizontalHalfFov);
  const distance = (safeRadius / Math.sin(limitingHalfFov)) * margin;
  const initialDistance = distance * INITIAL_DISTANCE_FACTORS[mode];
  const directionLength = Math.hypot(...DEFAULT_DIRECTION);
  const direction = DEFAULT_DIRECTION.map((value) => value / directionLength);
  const target = [
    mode === "mobile" ? Math.max(0, (1.45 - aspect) * 2.6) : 0,
    mode === "desktop" ? 0 : mode === "tablet" ? -0.5 : 0,
    0,
  ];

  return {
    mode,
    aspect,
    fov,
    distance,
    initialDistance,
    // Allow roughly 50% more magnification than the previous maximum while
    // keeping the camera distance bounded by OrbitControls.
    minDistance: distance * MIN_ZOOM_DISTANCE_FACTOR,
    maxDistance: distance * 2.2,
    target,
    position: target.map((value, index) => value + direction[index] * initialDistance),
  };
}
