const LAYER_COUNT = 5;

/*
 * The base motion stays quiet so the model reads as a background visual.
 * A click temporarily switches only the selected layer to the original
 * asset-preview rhythm: a clear boost, followed by a short recovery.
 */
export const LAYER_ROTATION_CONFIG = Object.freeze({
  baseSpeeds: Object.freeze([0.095, 0.12, 0.085, 0.13, 0.105]),
  boostSpeeds: Object.freeze([0.66, 0.75, 0.63, 0.81, 0.69]),
  boostDuration: 1600,
  recoveryDuration: 1200,
});

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export function createLayerRotationState() {
  return { boostStartedAt: Array(LAYER_COUNT).fill(null) };
}

export function triggerLayerBoost(state, layerIndex, nowMs, reducedMotion = false) {
  if (
    reducedMotion
    || !state?.boostStartedAt
    || !Number.isInteger(layerIndex)
    || layerIndex < 0
    || layerIndex >= LAYER_COUNT
  ) {
    return false;
  }

  state.boostStartedAt[layerIndex] = finiteOr(nowMs, 0);
  return true;
}

export function getLayerRotationSpeed(state, layerIndex, nowMs, reducedMotion = false) {
  if (
    reducedMotion
    || !state?.boostStartedAt
    || !Number.isInteger(layerIndex)
    || layerIndex < 0
    || layerIndex >= LAYER_COUNT
  ) {
    return 0;
  }

  const baseSpeed = LAYER_ROTATION_CONFIG.baseSpeeds[layerIndex];
  const boostStartedAt = state.boostStartedAt[layerIndex];
  if (boostStartedAt === null) return baseSpeed;

  const elapsed = Math.max(0, finiteOr(nowMs, boostStartedAt) - boostStartedAt);
  if (elapsed <= LAYER_ROTATION_CONFIG.boostDuration) {
    return LAYER_ROTATION_CONFIG.boostSpeeds[layerIndex];
  }

  const recoveryElapsed = elapsed - LAYER_ROTATION_CONFIG.boostDuration;
  if (
    recoveryElapsed >= LAYER_ROTATION_CONFIG.recoveryDuration
    || LAYER_ROTATION_CONFIG.recoveryDuration === 0
  ) {
    state.boostStartedAt[layerIndex] = null;
    return baseSpeed;
  }

  const progress = recoveryElapsed / LAYER_ROTATION_CONFIG.recoveryDuration;
  const boostSpeed = LAYER_ROTATION_CONFIG.boostSpeeds[layerIndex];
  return boostSpeed + (baseSpeed - boostSpeed) * progress;
}
