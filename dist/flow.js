import {
  validateFlowIds
} from "./chunk-Q23PSIEE.js";

// src/defineFlow.ts
function defineFlow(flow) {
  if (process.env.NODE_ENV !== "production") {
    for (const error of validateFlowIds(flow)) {
      console.error(`[microwireflow] ${error.message}`);
    }
  }
  return flow;
}
export {
  defineFlow
};
//# sourceMappingURL=flow.js.map