"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/flow.ts
var flow_exports = {};
__export(flow_exports, {
  defineFlow: () => defineFlow
});
module.exports = __toCommonJS(flow_exports);

// src/validation.ts
function validateFlowIds(flow) {
  const errors = [];
  const seen = /* @__PURE__ */ new Set();
  for (const node of flow.nodes) {
    if (seen.has(node.id)) {
      errors.push({
        kind: "duplicate-node-id",
        message: `duplicate node id "${node.id}"`
      });
    }
    seen.add(node.id);
  }
  flow.edges.forEach((edge, i) => {
    if (!seen.has(edge.from)) {
      errors.push({
        kind: "unknown-node",
        message: `edge #${i} ${edge.from}:${edge.trigger} -> ${edge.to}: unknown source node "${edge.from}"`
      });
    }
    if (!seen.has(edge.to)) {
      errors.push({
        kind: "unknown-node",
        message: `edge #${i} ${edge.from}:${edge.trigger} -> ${edge.to}: unknown destination node "${edge.to}"`
      });
    }
  });
  if (flow.positions) {
    for (const key of Object.keys(flow.positions)) {
      if (!seen.has(key)) {
        errors.push({
          kind: "unknown-positions-key",
          message: `positions key "${key}" matches no node id`
        });
      }
    }
  }
  return errors;
}

// src/defineFlow.ts
function defineFlow(flow) {
  if (process.env.NODE_ENV !== "production") {
    for (const error of validateFlowIds(flow)) {
      console.error(`[microwireflow] ${error.message}`);
    }
  }
  return flow;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defineFlow
});
//# sourceMappingURL=flow.cjs.map