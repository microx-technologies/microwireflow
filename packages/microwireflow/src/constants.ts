import type { EdgeRouting, LineStyle } from "@/types.ts";

export const MW_NODE_WIDTH = 360;
export const MW_ELK_HEIGHT_EST = 320;
export const MW_DEFAULT_EDGE_ROUTING: EdgeRouting = "smoothstep";
export const MW_EDGE_BORDER_RADIUS = 8;
export const MW_EDGE_OFFSET = 20;
export const MW_ELK_OPTIONS = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.layered.spacing.nodeNodeBetweenLayers": "80",
  "elk.spacing.nodeNode": "50",
  "elk.layered.spacing.edgeNodeBetweenLayers": "40",
} as const;
export const MW_DASH: Record<LineStyle, string | undefined> = {
  solid: undefined,
  dashed: "6 4",
  dotted: "1 5",
};
export const MW_EDGE_NODE_PADDING = 24;
export const MW_EDGE_GRID_RATIO = 10;
export const MW_HOP_RADIUS = 7;

export const MW_TARGET_HANDLE_ID = "__target";
export const MW_TARGET_HANDLE_LEFT_ID = "__target_left";
export const MW_TARGET_HANDLE_TOP_ID = "__target_top";
export const MW_TARGET_HANDLE_RIGHT_ID = "__target_right";
export const MW_TARGET_HANDLE_BOTTOM_ID = "__target_bottom";

export const MW_TARGET_SLOTS = [
  "center",
  "offset-prev",
  "offset-next",
] as const;
export type TargetSlot = (typeof MW_TARGET_SLOTS)[number];

export const MW_EMPTY_TRIGGER_HANDLE_ID = "__empty";
export const MW_FOCUS_DURATION = 400;
export const MW_FIT_PADDING = 0.2;
export const MW_EXPORT_PIXEL_RATIO = 2;
export const MW_EXPORT_PADDING = 40;
export const MW_GRID_FALLBACK_COLS = 4;
export const MW_GRID_FALLBACK_DX = 420;
export const MW_GRID_FALLBACK_DY = 380;
export const MW_EDGE_INTERACTION_WIDTH = 8;

export function mwEdgeId(
  from: string,
  trigger: string,
  to: string,
  index: number,
): string {
  return `${from}:${trigger}->${to}#${index}`;
}
