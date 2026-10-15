import { SCREEN_NODE_TYPE, type ScreenNodeType } from "@/ScreenNode.tsx";
import type { FlowNode } from "@/types.ts";

/**
 * Structural sync for flow nodes.
 *
 * Adds new ids (seeded via `getPosition`), drops removed ids, refreshes
 * `data` (component + highlight). NEVER repositions existing nodes:
 * position/selection/drag state ride along via spread, so user drags survive
 * highlight changes, parent re-renders, and async layout arrivals.
 * Position updates happen only in dedicated effects (mount seed from
 * `finalPositions`, async computed arrival, Auto-layout, prop change).
 */
export function syncFlowNodes(
  prev: ScreenNodeType[],
  flowNodes: FlowNode[],
  getPosition: (id: string) => { x: number; y: number } | undefined,
  isHighlighted: (id: string) => boolean,
): ScreenNodeType[] {
  const prevById = new Map(prev.map((n) => [n.id, n]));
  const out: ScreenNodeType[] = flowNodes.map((fn) => {
    const existing = prevById.get(fn.id);
    const highlighted = isHighlighted(fn.id);
    if (
      existing &&
      existing.type === SCREEN_NODE_TYPE &&
      existing.data.flowNode === fn &&
      existing.data.highlighted === highlighted
    ) {
      return existing;
    }
    if (existing) {
      return {
        ...existing,
        type: SCREEN_NODE_TYPE,
        data: { flowNode: fn, highlighted },
      };
    }
    return {
      id: fn.id,
      type: SCREEN_NODE_TYPE,
      position: getPosition(fn.id) ?? { x: 0, y: 0 },
      data: { flowNode: fn, highlighted },
    } satisfies ScreenNodeType;
  });
  if (out.length === prev.length && out.every((n, i) => n === prev[i])) {
    return prev;
  }
  return out;
}
