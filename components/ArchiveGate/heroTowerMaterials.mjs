/*
 * Runtime-only material tokens for the approved A tower asset.
 * The inactive profile stays quiet; the active profile is only a mist-blue
 * emphasis so the color change supports the interaction without becoming a
 * second decorative effect.
 */
export const LAYER_MATERIAL_PROFILES = Object.freeze({
  inactive: Object.freeze({
    graphiteColor: "#2A425A",
    crystalColor: "#86A9CF",
    emissiveColor: "#000000",
    graphiteEmissiveIntensity: 0,
    crystalEmissiveIntensity: 0,
    graphiteRoughness: 0.36,
    crystalRoughness: 0.2,
  }),
  active: Object.freeze({
    graphiteColor: "#3F6587",
    crystalColor: "#BCD4E8",
    emissiveColor: "#D9E6F0",
    graphiteEmissiveIntensity: 0,
    crystalEmissiveIntensity: 0.08,
    graphiteRoughness: 0.3,
    crystalRoughness: 0.16,
  }),
});

export function getLayerMaterialProfile(active) {
  return active ? LAYER_MATERIAL_PROFILES.active : LAYER_MATERIAL_PROFILES.inactive;
}
