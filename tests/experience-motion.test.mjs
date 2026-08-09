import test from "node:test";
import assert from "node:assert/strict";
import {
  clampExperienceProgress,
  getExperienceMotionMetrics,
  getExperienceTranslateX,
} from "../lib/experienceMotion.mjs";

test("experience motion derives paced vertical travel from real horizontal overflow", () => {
  const metrics = getExperienceMotionMetrics({
    contentWidth: 3200,
    viewportWidth: 1200,
    viewportHeight: 800,
    pace: 1.25,
    minimumScreens: 2,
  });

  assert.deepEqual(metrics, {
    horizontalDistance: 2000,
    verticalDistance: 2500,
    storyHeight: 3300,
  });
});

test("experience motion adds no artificial travel when the rail fits the viewport", () => {
  assert.deepEqual(
    getExperienceMotionMetrics({
      contentWidth: 1080,
      viewportWidth: 1200,
      viewportHeight: 800,
    }),
    {
      horizontalDistance: 0,
      verticalDistance: 0,
      storyHeight: 800,
    },
  );
});

test("experience progress is clamped before it becomes a leftward translation", () => {
  assert.equal(clampExperienceProgress(-0.4), 0);
  assert.equal(clampExperienceProgress(0.42), 0.42);
  assert.equal(clampExperienceProgress(1.4), 1);
  assert.equal(getExperienceTranslateX(0.25, 1600), -400);
  assert.equal(getExperienceTranslateX(2, 1600), -1600);
});
