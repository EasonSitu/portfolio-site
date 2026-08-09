export function clampExperienceProgress(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function getExperienceMotionMetrics({
  contentWidth,
  viewportWidth,
  viewportHeight,
  pace = 1.25,
  minimumScreens = 2,
}) {
  const safeViewportWidth = Math.max(0, viewportWidth || 0);
  const safeViewportHeight = Math.max(0, viewportHeight || 0);
  const horizontalDistance = Math.max(0, (contentWidth || 0) - safeViewportWidth);

  if (horizontalDistance === 0) {
    return {
      horizontalDistance: 0,
      verticalDistance: 0,
      storyHeight: safeViewportHeight,
    };
  }

  const verticalDistance = Math.round(Math.max(
    horizontalDistance * Math.max(0, pace),
    safeViewportHeight * Math.max(0, minimumScreens),
  ));

  return {
    horizontalDistance,
    verticalDistance,
    storyHeight: safeViewportHeight + verticalDistance,
  };
}

export function getExperienceTranslateX(progress, horizontalDistance) {
  return -clampExperienceProgress(progress) * Math.max(0, horizontalDistance || 0);
}
