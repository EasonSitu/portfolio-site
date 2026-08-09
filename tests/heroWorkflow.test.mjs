import test from "node:test";
import assert from "node:assert/strict";
import {
  GLB_LAYER_ROOTS,
  resolveActiveWorkflow,
  workflowIdForNode,
} from "../lib/heroWorkflow.mjs";


test("GLB layer roots map to the five delivery workflow IDs in display order", () => {
  assert.deepEqual(
    GLB_LAYER_ROOTS.map((entry) => [entry.nodeName, entry.workflowId]),
    [
      ["Hero_Layer_01", "business-context"],
      ["Hero_Layer_02", "requirements"],
      ["Hero_Layer_03", "coordination"],
      ["Hero_Layer_04", "testing"],
      ["Hero_Layer_05", "delivery"],
    ],
  );
});


test("node lookup returns null for non-interactive scene objects", () => {
  assert.equal(workflowIdForNode("Hero_Layer_03"), "coordination");
  assert.equal(workflowIdForNode("Hero_Arch"), null);
});


test("active workflow falls back to the first localized layer", () => {
  const layers = [
    { id: "business-context", title: "Business Context" },
    { id: "requirements", title: "Requirements" },
  ];
  assert.equal(resolveActiveWorkflow(layers, "requirements").title, "Requirements");
  assert.equal(resolveActiveWorkflow(layers, "missing").title, "Business Context");
});
