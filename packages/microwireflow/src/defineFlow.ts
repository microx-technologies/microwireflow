import type { Flow } from "@/types.ts";
import { validateFlowIds } from "@/validation.ts";

export function defineFlow(flow: Flow): Flow {
  if (process.env.NODE_ENV !== "production") {
    for (const error of validateFlowIds(flow)) {
      console.error(`[microwireflow] ${error.message}`);
    }
  }
  return flow;
}
