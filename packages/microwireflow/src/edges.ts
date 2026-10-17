import { createSmartEdge } from "@tisoap/react-flow-smart-edge";
import {
  type BuiltInEdge,
  type Edge,
  type EdgeMarker,
  type EdgeMarkerType,
  type EdgeTypes,
  MarkerType,
} from "@xyflow/react";
import {
  MW_ARROW_COLOR,
  MW_ARROW_HEIGHT,
  MW_ARROW_WIDTH,
  MW_EDGE_BORDER_RADIUS,
  MW_EDGE_GRID_RATIO,
  MW_EDGE_NODE_PADDING,
  MW_EDGE_OFFSET,
  MW_EMPTY_TRIGGER_HANDLE_ID,
  MW_HOP_RADIUS,
  MW_NODE_WIDTH,
  MW_SOURCE_HANDLE_LEFT_SUFFIX,
  MW_SOURCE_HANDLE_RIGHT_SUFFIX,
  MW_TARGET_HANDLE_BOTTOM_ID,
  MW_TARGET_HANDLE_LEFT_ID,
  MW_TARGET_HANDLE_RIGHT_ID,
  MW_TARGET_HANDLE_TOP_ID,
} from "@/constants.ts";
import type {
  ArrowStyle,
  EdgeRouting,
  SourceSide,
  TargetSide,
} from "@/types.ts";

export const SMART_EDGE_TYPE_PREFIX = "smart_";

export function resolveMarkerEnd(
  arrow?: ArrowStyle,
  defaultArrow: ArrowStyle = true,
): EdgeMarker | undefined {
  const effective = arrow ?? defaultArrow;
  if (effective === false || effective === "none") {
    return undefined;
  }
  if (effective === true || effective === "closed") {
    return {
      type: MarkerType.ArrowClosed,
      color: MW_ARROW_COLOR,
      width: MW_ARROW_WIDTH,
      height: MW_ARROW_HEIGHT,
    };
  }
  if (effective === "open") {
    return {
      type: MarkerType.Arrow,
      color: MW_ARROW_COLOR,
      width: MW_ARROW_WIDTH,
      height: MW_ARROW_HEIGHT,
    };
  }
  if (typeof effective === "object") {
    return effective;
  }
  return undefined;
}

export type SourcePortResolution = {
  handleId: string;
  side: SourceSide;
};

export function resolveSourcePort(
  baseTriggerId: string,
  sourcePos: { x: number; y: number } | undefined,
  targetPos: { x: number; y: number } | undefined,
  explicitSide?: SourceSide,
): SourcePortResolution {
  const trigger =
    baseTriggerId === "" ? MW_EMPTY_TRIGGER_HANDLE_ID : baseTriggerId;

  let side: SourceSide;
  if (explicitSide !== undefined) {
    side = explicitSide;
  } else if (sourcePos === undefined || targetPos === undefined) {
    side = "right";
  } else if (targetPos.x + MW_NODE_WIDTH <= sourcePos.x) {
    side = "left";
  } else if (sourcePos.x + MW_NODE_WIDTH <= targetPos.x) {
    side = "right";
  } else if (targetPos.x < sourcePos.x) {
    side = "left";
  } else {
    side = "right";
  }

  switch (side) {
    case "left":
      return {
        handleId: `${trigger}${MW_SOURCE_HANDLE_LEFT_SUFFIX}`,
        side: "left",
      };
    case "right":
      return {
        handleId: `${trigger}${MW_SOURCE_HANDLE_RIGHT_SUFFIX}`,
        side: "right",
      };
  }
}

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
  markerEnd?: EdgeMarkerType;
  markerStart?: EdgeMarkerType;
  pathOptions?: {
    borderRadius?: number;
    offset?: number;
    stepPosition?: number;
  };
};

export type TargetPortResolution = {
  handleId: string;
  side: TargetSide;
};

export function resolveTargetPort(
  sourcePos: { x: number; y: number } | undefined,
  targetPos: { x: number; y: number } | undefined,
  explicitSide?: TargetSide,
  slotIndex?: number,
): TargetPortResolution {
  let side: TargetSide;
  if (explicitSide !== undefined) {
    side = explicitSide;
  } else if (sourcePos === undefined || targetPos === undefined) {
    side = "top";
  } else {
    const dy = targetPos.y - sourcePos.y;

    if (sourcePos.x + MW_NODE_WIDTH <= targetPos.x) {
      side = "left";
    } else if (sourcePos.x >= targetPos.x + MW_NODE_WIDTH) {
      if (dy > 80) {
        side = "top";
      } else if (dy < -80) {
        side = "bottom";
      } else {
        side = "right";
      }
    } else {
      if (dy >= 0) {
        side = "top";
      } else {
        side = "bottom";
      }
    }
  }

  let slotSuffix = "";
  if (slotIndex !== undefined && slotIndex > 0) {
    slotSuffix = slotIndex % 2 === 1 ? "_prev" : "_next";
  }

  switch (side) {
    case "left":
      return {
        handleId: `${MW_TARGET_HANDLE_LEFT_ID}${slotSuffix}`,
        side: "left",
      };
    case "top":
      return {
        handleId: `${MW_TARGET_HANDLE_TOP_ID}${slotSuffix}`,
        side: "top",
      };
    case "right":
      return {
        handleId: `${MW_TARGET_HANDLE_RIGHT_ID}${slotSuffix}`,
        side: "right",
      };
    case "bottom":
      return {
        handleId: `${MW_TARGET_HANDLE_BOTTOM_ID}${slotSuffix}`,
        side: "bottom",
      };
  }
}

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
          borderRadius: base.pathOptions?.borderRadius ?? MW_EDGE_BORDER_RADIUS,
          offset: base.pathOptions?.offset ?? MW_EDGE_OFFSET,
          stepPosition: base.pathOptions?.stepPosition,
        },
      };
    case "step":
      return {
        ...base,
        type: "step",
        pathOptions: {
          offset: base.pathOptions?.offset ?? MW_EDGE_OFFSET,
        },
      };
    case "bezier": {
      const { pathOptions: _, ...rest } = base;
      return {
        ...rest,
        type: "default",
      };
    }
    case "straight": {
      const { pathOptions: _, ...rest } = base;
      return {
        ...rest,
        type: "straight",
      };
    }
  }
}

export type CreateFlowEdgeOptions = CreateBuiltInEdgeOptions & {
  avoidCollisions: boolean;
};

export type FlowEdgeInstance =
  | BuiltInEdge
  | (Edge & {
      pathOptions?: {
        borderRadius?: number;
        offset?: number;
        stepPosition?: number;
      };
    });

export function createFlowEdge(
  routing: EdgeRouting,
  options: CreateFlowEdgeOptions,
): FlowEdgeInstance {
  if (!options.avoidCollisions) {
    return createBuiltInEdge(routing, options);
  }

  const type = `${SMART_EDGE_TYPE_PREFIX}${routing}`;
  switch (routing) {
    case "smoothstep":
      return {
        ...options,
        type,
        pathOptions: {
          borderRadius:
            options.pathOptions?.borderRadius ?? MW_EDGE_BORDER_RADIUS,
          offset: options.pathOptions?.offset ?? MW_EDGE_OFFSET,
          stepPosition: options.pathOptions?.stepPosition,
        },
      };
    case "step":
      return {
        ...options,
        type,
        pathOptions: {
          offset: options.pathOptions?.offset ?? MW_EDGE_OFFSET,
        },
      };
    case "bezier":
    case "straight":
      return {
        ...options,
        type,
      };
  }
}

export function createSmartEdgeTypes(lineHops: boolean): EdgeTypes {
  return {
    [`${SMART_EDGE_TYPE_PREFIX}smoothstep`]: createSmartEdge("smoothstep", {
      hops: lineHops
        ? { borderRadius: MW_EDGE_BORDER_RADIUS, radius: MW_HOP_RADIUS }
        : false,
      nodePadding: MW_EDGE_NODE_PADDING,
      gridRatio: MW_EDGE_GRID_RATIO,
      borderRadius: MW_EDGE_BORDER_RADIUS,
    }),
    [`${SMART_EDGE_TYPE_PREFIX}step`]: createSmartEdge("step", {
      hops: lineHops ? { radius: MW_HOP_RADIUS } : false,
      nodePadding: MW_EDGE_NODE_PADDING,
      gridRatio: MW_EDGE_GRID_RATIO,
    }),
    [`${SMART_EDGE_TYPE_PREFIX}bezier`]: createSmartEdge("bezier", {
      nodePadding: MW_EDGE_NODE_PADDING,
      gridRatio: MW_EDGE_GRID_RATIO,
    }),
    [`${SMART_EDGE_TYPE_PREFIX}straight`]: createSmartEdge("straight", {
      nodePadding: MW_EDGE_NODE_PADDING,
      gridRatio: MW_EDGE_GRID_RATIO,
    }),
  };
}
