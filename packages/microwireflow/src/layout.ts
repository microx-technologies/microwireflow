import ELK from "elkjs/lib/elk.bundled.js";
import {
  MW_ELK_HEIGHT_EST,
  MW_ELK_OPTIONS,
  MW_GRID_FALLBACK_COLS,
  MW_GRID_FALLBACK_DX,
  MW_GRID_FALLBACK_DY,
  MW_NODE_WIDTH,
} from "@/constants.ts";
import type { FlowPositions } from "@/types.ts";

const elk = new ELK();

export type LayoutEdgeInput = {
  from: string;
  to: string;
};

export type LayoutSizeOpts = {
  width?: number;
  height?: number;
};

export function gridFallbackLayout(nodeIds: string[]): FlowPositions {
  const positions: FlowPositions = {};
  nodeIds.forEach((id, i) => {
    positions[id] = {
      x: (i % MW_GRID_FALLBACK_COLS) * MW_GRID_FALLBACK_DX,
      y: Math.floor(i / MW_GRID_FALLBACK_COLS) * MW_GRID_FALLBACK_DY,
    };
  });
  return positions;
}

export async function layoutWithElk(
  nodeIds: string[],
  edges: LayoutEdgeInput[],
  opts?: LayoutSizeOpts,
): Promise<FlowPositions> {
  const width = opts?.width ?? MW_NODE_WIDTH;
  const height = opts?.height ?? MW_ELK_HEIGHT_EST;
  const known = new Set(nodeIds);
  const graph = {
    id: "root",
    layoutOptions: { ...MW_ELK_OPTIONS },
    children: nodeIds.map((id) => ({ id, width, height })),
    edges: edges
      .filter((e) => known.has(e.from) && known.has(e.to))
      .map((e, i) => ({ id: `e${i}`, sources: [e.from], targets: [e.to] })),
  };
  const laid = (await elk.layout(graph)) as unknown as {
    children?: { id: string; x?: number; y?: number }[];
  };
  const positions: FlowPositions = {};
  for (const child of laid.children ?? []) {
    positions[child.id] = {
      x: Math.round(child.x ?? 0),
      y: Math.round(child.y ?? 0),
    };
  }
  for (const id of nodeIds) {
    positions[id] ??= { x: 0, y: 0 };
  }
  return positions;
}

export function mergePositions(
  nodeIds: string[],
  base: FlowPositions | undefined,
  computed: FlowPositions,
): FlowPositions {
  const out: FlowPositions = {};
  for (const id of nodeIds) {
    out[id] = base?.[id] ?? computed[id] ?? { x: 0, y: 0 };
  }
  return out;
}
