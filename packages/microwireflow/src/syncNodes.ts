import { SCREEN_NODE_TYPE, type ScreenNodeType } from "@/ScreenNode.tsx";
import type { FlowNode } from "@/types.ts";

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
