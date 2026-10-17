import type { EdgeMarker } from "@xyflow/react";
import type * as React from "react";

export type LineStyle = "solid" | "dashed" | "dotted";

export type EdgeRouting = "smoothstep" | "step" | "bezier" | "straight";

export type TargetSide = "left" | "top" | "right" | "bottom";

export type SourceSide = "left" | "right";

export type ArrowVariant = boolean | "closed" | "open" | "none";

export type ArrowStyle = ArrowVariant | EdgeMarker;

export type TriggerProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fullWidth?: boolean;
};

export type FlowNode = {
  id: string;
  title: string;
  kind?: string;
  component: React.ReactNode;
  notes?: string;
};

export type FlowEdge = {
  from: string;
  trigger: string;
  to: string;
  label?: string;
  lineStyle?: LineStyle;
  routing?: EdgeRouting;
  avoidCollisions?: boolean;
  lineHops?: boolean;
  targetSide?: TargetSide;
  sourceSide?: SourceSide;
  arrow?: ArrowStyle;
};

export type FlowPositions = Record<string, { x: number; y: number }>;

export type Flow = {
  nodes: FlowNode[];
  edges: FlowEdge[];
  positions?: FlowPositions;
};

export type WireflowProps = {
  flow: Flow;
  className?: string;
  style?: React.CSSProperties;
  showMinimap?: boolean;
  showSearch?: boolean;
  showControls?: boolean;
  edgeRouting?: EdgeRouting;
  avoidCollisions?: boolean;
  lineHops?: boolean;
  arrow?: ArrowStyle;
  nodeWidth?: number;
  maxFitZoom?: number;
  onPositionsExport?: (positions: FlowPositions, snippet: string) => void;
  onNodeSelect?: (nodeId: string | null) => void;
};
