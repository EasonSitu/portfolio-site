export const GLB_LAYER_ROOTS = Object.freeze([
  { nodeName: "Hero_Layer_01", workflowId: "business-context" },
  { nodeName: "Hero_Layer_02", workflowId: "requirements" },
  { nodeName: "Hero_Layer_03", workflowId: "coordination" },
  { nodeName: "Hero_Layer_04", workflowId: "testing" },
  { nodeName: "Hero_Layer_05", workflowId: "delivery" },
]);

const workflowByNode = new Map(
  GLB_LAYER_ROOTS.map(({ nodeName, workflowId }) => [nodeName, workflowId]),
);

export function workflowIdForNode(nodeName) {
  return workflowByNode.get(nodeName) ?? null;
}

export function resolveActiveWorkflow(layers, activeId) {
  return layers.find((layer) => layer.id === activeId) ?? layers[0] ?? null;
}
