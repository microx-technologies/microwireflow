import type { FlowPositions } from "@/types.ts";

export function currentPositionsFromNodes(
  nodes: { id: string; position: { x: number; y: number } }[],
): FlowPositions {
  const out: FlowPositions = {};
  for (const n of nodes) {
    out[n.id] = { x: Math.round(n.position.x), y: Math.round(n.position.y) };
  }
  return out;
}

export function positionsSignature(p: FlowPositions | undefined): string {
  if (!p) {
    return "";
  }
  return Object.keys(p)
    .sort()
    .map((k) => {
      const v = p[k];
      return `${k}:${Math.round(v?.x ?? 0)},${Math.round(v?.y ?? 0)}`;
    })
    .join(";");
}

export function serializePositions(p: FlowPositions): string {
  const keys = Object.keys(p).sort();
  const lines = keys.map((k) => {
    const v = p[k] as { x: number; y: number };
    return `  ${k}: { x: ${Math.round(v.x)}, y: ${Math.round(v.y)} },`;
  });
  return `positions: {\n${lines.join("\n")}\n}`;
}
