import type { BuiltInEdge } from "@xyflow/react";
import { MW_EDGE_BORDER_RADIUS, MW_EDGE_OFFSET } from "@/constants.ts";
import type { EdgeRouting } from "@/types.ts";

export type CreateBuiltInEdgeOptions = {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  label?: string;
  labelBgPadding: [number, number];
  labelBgBorderRadius: number;
  interactionWidth: number;
  style: React.CSSProperties;
  className?: string;
};

export function createBuiltInEdge(
  routing: EdgeRouting,
  base: CreateBuiltInEdgeOptions,
): BuiltInEdge {
  switch (routing) {
    case "smoothstep":
      return {
        ...base,
        type: "smoothstep",
        pathOptions: {
          borderRadius: MW_EDGE_BORDER_RADIUS,
          offset: MW_EDGE_OFFSET,
        },
      };
    case "step":
      return {
        ...base,
        type: "step",
        pathOptions: {
          offset: MW_EDGE_OFFSET,
        },
      };
    case "bezier":
      return {
        ...base,
        type: "default",
      };
    case "straight":
      return {
        ...base,
        type: "straight",
      };
  }
}
