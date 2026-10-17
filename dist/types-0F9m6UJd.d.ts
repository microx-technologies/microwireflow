import { EdgeMarker } from '@xyflow/react';
import * as React from 'react';

type LineStyle = "solid" | "dashed" | "dotted";
type EdgeRouting = "smoothstep" | "step" | "bezier" | "straight";
type TargetSide = "left" | "top" | "right" | "bottom";
type SourceSide = "left" | "right";
type ArrowVariant = boolean | "closed" | "open" | "none";
type ArrowStyle = ArrowVariant | EdgeMarker;
type TriggerProps = {
    id: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    fullWidth?: boolean;
};
type FlowNode = {
    id: string;
    title: string;
    kind?: string;
    component: React.ReactNode;
    notes?: string;
};
type FlowEdge = {
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
type FlowPositions = Record<string, {
    x: number;
    y: number;
}>;
type Flow = {
    nodes: FlowNode[];
    edges: FlowEdge[];
    positions?: FlowPositions;
};
type WireflowProps = {
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
    triggerDots?: boolean;
    nodeWidth?: number;
    maxFitZoom?: number;
    onPositionsExport?: (positions: FlowPositions, snippet: string) => void;
    onNodeSelect?: (nodeId: string | null) => void;
};

export type { ArrowStyle as A, EdgeRouting as E, Flow as F, LineStyle as L, SourceSide as S, TriggerProps as T, WireflowProps as W, ArrowVariant as a, FlowEdge as b, FlowNode as c, FlowPositions as d, TargetSide as e };
