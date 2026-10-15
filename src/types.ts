import type * as React from "react";

export type LineStyle = "solid" | "dashed" | "dotted";

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
  onPositionsExport?: (positions: FlowPositions, snippet: string) => void;
  onNodeSelect?: (nodeId: string | null) => void;
};
