import { SmartEdgeProvider } from "@tisoap/react-flow-smart-edge";
import type { NodeChange } from "@xyflow/react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import * as React from "react";
import {
  MW_DASH,
  MW_DEFAULT_EDGE_ROUTING,
  MW_DEFAULT_MAX_FIT_ZOOM,
  MW_EDGE_BORDER_RADIUS,
  MW_EDGE_GRID_RATIO,
  MW_EDGE_INTERACTION_WIDTH,
  MW_EDGE_NODE_PADDING,
  MW_EDGE_OFFSET,
  MW_ELK_HEIGHT_EST,
  MW_FIT_PADDING,
  MW_FOCUS_DURATION,
  MW_NODE_WIDTH,
  mwEdgeId,
} from "@/constants.ts";
import {
  createFlowEdge,
  createSmartEdgeTypes,
  type FlowEdgeInstance,
  resolveSourcePort,
  resolveTargetPort,
} from "@/edges.ts";
import { exportImage } from "@/exportImage.ts";
import { gridFallbackLayout, layoutWithElk, mergePositions } from "@/layout.ts";
import {
  currentPositionsFromNodes,
  positionsSignature,
  serializePositions,
} from "@/positions.ts";
import {
  SCREEN_NODE_TYPE,
  ScreenNode,
  type ScreenNodeType,
} from "@/ScreenNode.tsx";
import { syncFlowNodes } from "@/syncNodes.ts";
import { ScreenNodeCallbacksContext, sameCounts } from "@/triggerRegistry.ts";
import type {
  EdgeRouting,
  Flow,
  FlowPositions,
  WireflowProps,
} from "@/types.ts";
import {
  type FlowError,
  validateFlowIds,
  validateTriggers,
} from "@/validation.ts";

const nodeTypes = { [SCREEN_NODE_TYPE]: ScreenNode };

type HoverState =
  | { kind: "trigger"; nodeId: string; triggerId: string }
  | { kind: "edge"; edgeId: string };

type PickerState = {
  x: number;
  y: number;
  from: string;
  trigger: string;
  options: { to: string; title: string; label?: string }[];
};

type CanvasInnerProps = {
  flow: Flow;
  showMinimap: boolean;
  showSearch: boolean;
  showControls: boolean;
  edgeRouting?: EdgeRouting;
  avoidCollisions?: boolean;
  lineHops?: boolean;
  nodeWidth: number;
  maxFitZoom: number;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  onPositionsExport?: (positions: FlowPositions, snippet: string) => void;
  onNodeSelect?: (nodeId: string | null) => void;
};

function validEdgeIndices(
  flow: Flow,
  registries: Record<string, Record<string, number>>,
): number[] {
  const nodeIds = new Set(flow.nodes.map((n) => n.id));
  const out: number[] = [];
  flow.edges.forEach((edge, i) => {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      return;
    }
    const registry = registries[edge.from];
    if (
      registry !== undefined &&
      (edge.trigger === "" || registry[edge.trigger] === undefined)
    ) {
      return;
    }
    out.push(i);
  });
  return out;
}

function CanvasInner(props: CanvasInnerProps) {
  const { flow, nodeWidth, maxFitZoom } = props;
  const {
    getNode,
    getInternalNode,
    getZoom,
    setCenter,
    fitView,
    getNodesBounds,
  } = useReactFlow();
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<ScreenNodeType>(
    [],
  );
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<FlowEdgeInstance>(
    [],
  );
  const [computed, setComputed] = React.useState<FlowPositions>({});
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState<HoverState | null>(null);
  const [picker, setPicker] = React.useState<PickerState | null>(null);
  const [registries, setRegistries] = React.useState<
    Record<string, Record<string, number>>
  >({});
  const [query, setQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [showPositions, setShowPositions] = React.useState(false);
  const [errors, setErrors] = React.useState<FlowError[]>([]);
  const loggedRef = React.useRef<Set<string>>(new Set());

  const lineHops = props.lineHops ?? true;
  const avoidCollisions = props.avoidCollisions ?? false;
  const edgeTypes = React.useMemo(() => {
    return createSmartEdgeTypes(lineHops);
  }, [lineHops]);
  const smartEdgeOptions = React.useMemo(
    () => ({
      nodePadding: MW_EDGE_NODE_PADDING,
      gridRatio: MW_EDGE_GRID_RATIO,
      routeOnlyWhenBlocked: true,
    }),
    [],
  );

  const nodeIds = React.useMemo(() => flow.nodes.map((n) => n.id), [flow]);
  const nodeById = React.useMemo(() => {
    const m = new Map(flow.nodes.map((n) => [n.id, n]));
    return m;
  }, [flow]);

  const flowPositions = flow.positions;
  const flowNodes = flow.nodes;
  const flowEdges = flow.edges;
  const finalPositions = React.useMemo(
    () => mergePositions(nodeIds, flowPositions, computed),
    [nodeIds, flowPositions, computed],
  );
  const positionsPropKey = `${nodeIds.join("|")}::${positionsSignature(flowPositions)}`;
  const draggedRef = React.useRef<Set<string>>(new Set());

  const validIndices = React.useMemo(
    () => validEdgeIndices(flow, registries),
    [registries, flow],
  );
  const validSet = React.useMemo(() => new Set(validIndices), [validIndices]);
  const validSetRef = React.useRef(validSet);
  validSetRef.current = validSet;
  const hoveredEdgeIds = React.useMemo(() => {
    if (!hover) {
      return new Set<string>();
    }
    if (hover.kind === "edge") {
      return new Set([hover.edgeId]);
    }
    const ids = new Set<string>();
    flowEdges.forEach((e, i) => {
      if (
        validSet.has(i) &&
        e.from === hover.nodeId &&
        e.trigger === hover.triggerId
      ) {
        ids.add(mwEdgeId(e.from, e.trigger, e.to, i));
      }
    });
    return ids;
  }, [hover, flowEdges, validSet]);

  const highlightedNodeIds = React.useMemo(() => {
    const ids = new Set<string>();
    flowEdges.forEach((e, i) => {
      if (
        validSet.has(i) &&
        hoveredEdgeIds.has(mwEdgeId(e.from, e.trigger, e.to, i))
      ) {
        ids.add(e.from);
        ids.add(e.to);
      }
    });
    return ids;
  }, [flowEdges, validSet, hoveredEdgeIds]);

  React.useEffect(() => {
    let live = true;
    const missing = nodeIds.filter((id) => flowPositions?.[id] === undefined);
    if (missing.length === 0) {
      setComputed({});
      return () => {
        live = false;
      };
    }
    const edgeInputs = flowEdges.map((e) => ({ from: e.from, to: e.to }));
    layoutWithElk(missing, edgeInputs, {
      width: nodeWidth,
      height: MW_ELK_HEIGHT_EST,
    })
      .then((pos) => {
        if (live) {
          setComputed(pos);
        }
      })
      .catch((err: unknown) => {
        console.error(
          "[microwireflow] layout failed, using grid fallback",
          err,
        );
        if (live) {
          setComputed(gridFallbackLayout(missing));
        }
      });
    return () => {
      live = false;
    };
  }, [nodeIds, flowPositions, flowEdges, nodeWidth]);

  const finalPositionsRef = React.useRef(finalPositions);
  finalPositionsRef.current = finalPositions;

  const prevPropKeyRef = React.useRef(positionsPropKey);
  React.useEffect(() => {
    if (prevPropKeyRef.current !== positionsPropKey) {
      prevPropKeyRef.current = positionsPropKey;
      draggedRef.current.clear();
    }
    setRfNodes((prev) =>
      syncFlowNodes(
        prev,
        flowNodes,
        (id) => finalPositionsRef.current[id],
        (id) => highlightedNodeIds.has(id),
      ),
    );
  }, [positionsPropKey, flowNodes, highlightedNodeIds, setRfNodes]);

  React.useEffect(() => {
    setRfNodes((prev) => {
      let moved = false;
      const next = prev.map((n) => {
        const p = finalPositions[n.id];
        const shouldMove =
          p !== undefined &&
          !draggedRef.current.has(n.id) &&
          (n.position.x !== p.x || n.position.y !== p.y);
        if (shouldMove && p !== undefined) {
          moved = true;
          return { ...n, position: { x: p.x, y: p.y } };
        }
        return n;
      });
      if (!moved) {
        return prev;
      }
      return next;
    });
  }, [finalPositions, setRfNodes]);

  const nodePositions = React.useMemo(() => {
    const map: FlowPositions = { ...finalPositions };
    for (const n of rfNodes) {
      map[n.id] = { x: n.position.x, y: n.position.y };
    }
    return map;
  }, [finalPositions, rfNodes]);

  const targetSlotIndices = React.useMemo(() => {
    const counts = new Map<string, number>();
    const indices = new Map<number, number>();

    validIndices.forEach((i) => {
      const e = flowEdges[i] as (typeof flowEdges)[number];
      const sourcePos = nodePositions[e.from];
      const targetPos = nodePositions[e.to];
      const resolved = resolveTargetPort(sourcePos, targetPos, e.targetSide);
      const key = `${e.to}:${resolved.side}`;
      const count = counts.get(key) ?? 0;
      indices.set(i, count);
      counts.set(key, count + 1);
    });

    return indices;
  }, [validIndices, flowEdges, nodePositions]);

  const sourceSlotIndices = React.useMemo(() => {
    const counts = new Map<string, number>();
    const indices = new Map<number, number>();

    validIndices.forEach((i) => {
      const e = flowEdges[i] as (typeof flowEdges)[number];
      const sourcePos = nodePositions[e.from];
      const targetPos = nodePositions[e.to];
      const resolvedSource = resolveSourcePort(
        e.trigger,
        sourcePos,
        targetPos,
        e.sourceSide,
      );
      const key = `${e.from}:${e.trigger}:${resolvedSource.side}`;
      const count = counts.get(key) ?? 0;
      indices.set(i, count);
      counts.set(key, count + 1);
    });

    return { indices, counts };
  }, [validIndices, flowEdges, nodePositions]);

  const activeSourceSides = React.useMemo(() => {
    const map = new Map<string, { left: boolean; right: boolean }>();

    validIndices.forEach((i) => {
      const e = flowEdges[i] as (typeof flowEdges)[number];
      const sourcePos = nodePositions[e.from];
      const targetPos = nodePositions[e.to];
      const resolvedSource = resolveSourcePort(
        e.trigger,
        sourcePos,
        targetPos,
        e.sourceSide,
      );
      const key = `${e.from}:${e.trigger}`;
      const entry = map.get(key) ?? { left: false, right: false };
      if (resolvedSource.side === "left") {
        entry.left = true;
      } else {
        entry.right = true;
      }
      map.set(key, entry);
    });

    return map;
  }, [validIndices, flowEdges, nodePositions]);

  const edgeRouting = props.edgeRouting;
  React.useEffect(() => {
    const defaultRouting = edgeRouting ?? MW_DEFAULT_EDGE_ROUTING;
    setRfEdges(
      validIndices.map((i) => {
        const e = flowEdges[i] as (typeof flowEdges)[number];
        const id = mwEdgeId(e.from, e.trigger, e.to, i);
        const routing = e.routing ?? defaultRouting;
        const sourcePos = nodePositions[e.from];
        const targetPos = nodePositions[e.to];
        const slotIndex = targetSlotIndices.get(i) ?? 0;
        const resolvedPort = resolveTargetPort(
          sourcePos,
          targetPos,
          e.targetSide,
          slotIndex,
        );
        const resolvedSource = resolveSourcePort(
          e.trigger,
          sourcePos,
          targetPos,
          e.sourceSide,
        );
        const edgeAvoidCollisions = e.avoidCollisions ?? avoidCollisions;

        const sourceKey = `${e.from}:${e.trigger}:${resolvedSource.side}`;
        const sourceSlot = sourceSlotIndices.indices.get(i) ?? 0;
        const sourceTotal = sourceSlotIndices.counts.get(sourceKey) ?? 1;

        let stepPosition: number | undefined;

        if (sourceTotal > 1) {
          stepPosition = 0.3 + (sourceSlot / (sourceTotal - 1)) * 0.4;
        }

        return createFlowEdge(routing, {
          id,
          source: e.from,
          sourceHandle: resolvedSource.handleId,
          target: e.to,
          targetHandle: resolvedPort.handleId,
          label: e.label,
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 4,
          interactionWidth: MW_EDGE_INTERACTION_WIDTH,
          style: { strokeDasharray: MW_DASH[e.lineStyle ?? "solid"] },
          className: hoveredEdgeIds.has(id) ? "mw-edge-hovered" : undefined,
          avoidCollisions: edgeAvoidCollisions,
          pathOptions: {
            borderRadius: MW_EDGE_BORDER_RADIUS,
            offset: MW_EDGE_OFFSET,
            stepPosition,
          },
        });
      }),
    );
  }, [
    flowEdges,
    validIndices,
    hoveredEdgeIds,
    setRfEdges,
    edgeRouting,
    avoidCollisions,
    nodePositions,
    targetSlotIndices,
    sourceSlotIndices,
  ]);

  React.useEffect(() => {
    const phase1 = validateFlowIds(flow);
    const phase2 = validateTriggers(flow, registries);
    const all = [...phase1, ...phase2];
    setErrors(all);
    for (const err of all) {
      if (!loggedRef.current.has(err.message)) {
        loggedRef.current.add(err.message);
        console.error(`[microwireflow] ${err.message}`);
      }
    }
  }, [flow, registries]);

  const handleNodesChange = React.useCallback(
    (changes: NodeChange<ScreenNodeType>[]) => {
      for (const c of changes) {
        if (c.type === "position" && (c.dragging ?? false)) {
          draggedRef.current.add(c.id);
        }
      }
      onNodesChange(changes);
    },
    [onNodesChange],
  );

  const onNodeSelect = props.onNodeSelect;
  const focusNode = React.useCallback(
    (id: string) => {
      const internal = getInternalNode(id) ?? getNode(id);
      if (!internal) {
        return;
      }
      const w = getInternalNode(id)?.measured?.width ?? nodeWidth;
      const h = getInternalNode(id)?.measured?.height ?? MW_ELK_HEIGHT_EST;
      const pos = internal.position;
      void setCenter(pos.x + w / 2, pos.y + h / 2, {
        zoom: getZoom(),
        duration: MW_FOCUS_DURATION,
      });
      setSelectedId(id);
      setRfNodes((prev) =>
        prev.map((n) =>
          n.selected !== (n.id === id) ? { ...n, selected: n.id === id } : n,
        ),
      );
      onNodeSelect?.(id);
      setPicker(null);
    },
    [
      getInternalNode,
      getNode,
      getZoom,
      setCenter,
      onNodeSelect,
      setRfNodes,
      nodeWidth,
    ],
  );

  const onRegistryChange = React.useCallback(
    (nodeId: string, snapshot: Record<string, number>) => {
      setRegistries((prev) =>
        sameCounts(prev[nodeId], snapshot)
          ? prev
          : { ...prev, [nodeId]: snapshot },
      );
    },
    [],
  );
  const onTriggerClick = React.useCallback(
    (nodeId: string, triggerId: string, e: React.MouseEvent) => {
      const valid = validSetRef.current;
      const outgoing = flow.edges.filter(
        (edge, i) =>
          valid.has(i) && edge.from === nodeId && edge.trigger === triggerId,
      );
      setSelectedId(nodeId);
      onNodeSelect?.(nodeId);
      if (outgoing.length === 1 && outgoing[0]) {
        focusNode(outgoing[0].to);
      } else if (outgoing.length > 1) {
        setPicker({
          x: e.clientX,
          y: e.clientY,
          from: nodeId,
          trigger: triggerId,
          options: outgoing.map((o) => ({
            to: o.to,
            title: nodeById.get(o.to)?.title ?? o.to,
            label: o.label,
          })),
        });
      }
    },
    [flow, focusNode, nodeById, onNodeSelect],
  );
  const onTriggerHover = React.useCallback(
    (nodeId: string, triggerId: string | null) => {
      setHover(
        triggerId === null ? null : { kind: "trigger", nodeId, triggerId },
      );
    },
    [],
  );

  const getActiveSourceSides = React.useCallback(
    (nodeId: string, triggerId: string) => {
      return (
        activeSourceSides.get(`${nodeId}:${triggerId}`) ?? {
          left: false,
          right: true,
        }
      );
    },
    [activeSourceSides],
  );

  const callbacks = React.useMemo(
    () => ({
      onRegistryChange,
      onTriggerClick,
      onTriggerHover,
      getActiveSourceSides,
    }),
    [onRegistryChange, onTriggerClick, onTriggerHover, getActiveSourceSides],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPicker(null);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const searchRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") {
      return [];
    }
    return flow.nodes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q) ||
        (n.kind?.toLowerCase().includes(q) ?? false),
    );
  }, [flow, query]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!searchOpen) {
        setSearchOpen(true);
      }
      if (matches.length > 0) {
        setActiveIndex((prev) => (prev + 1) % matches.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!searchOpen) {
        setSearchOpen(true);
      }
      if (matches.length > 0) {
        setActiveIndex((prev) => (prev <= 0 ? matches.length - 1 : prev - 1));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetMatch =
        activeIndex >= 0 && activeIndex < matches.length
          ? matches[activeIndex]
          : matches[0];
      if (targetMatch) {
        focusNode(targetMatch.id);
        setSearchOpen(false);
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      e.currentTarget.blur();
    }
  };

  const currentPositions = React.useMemo(
    () => currentPositionsFromNodes(rfNodes),
    [rfNodes],
  );
  const snippet = React.useMemo(
    () => serializePositions(currentPositions),
    [currentPositions],
  );

  const onPositionsExport = props.onPositionsExport;
  const copyPositions = React.useCallback(async () => {
    setShowPositions(true);
    try {
      await navigator.clipboard.writeText(snippet);
    } catch (err: unknown) {
      console.error("[microwireflow] copy positions failed", err);
    }
    onPositionsExport?.(currentPositions, snippet);
  }, [snippet, currentPositions, onPositionsExport]);

  const wrapperRef = props.wrapperRef;
  const runExport = React.useCallback(
    async (format: "png" | "svg") => {
      const wrapper = wrapperRef.current;
      if (!wrapper) {
        return;
      }
      try {
        await exportImage(
          wrapper,
          (ids) => {
            const b = getNodesBounds(ids);
            return { x: b.x, y: b.y, width: b.width, height: b.height };
          },
          nodeIds,
          format,
          format === "png" ? "flow.png" : "flow.svg",
        );
      } catch (err: unknown) {
        console.error("[microwireflow] export failed", err);
      }
    },
    [wrapperRef, getNodesBounds, nodeIds],
  );

  const selected = selectedId ? nodeById.get(selectedId) : undefined;
  const incoming = selected
    ? flow.edges.filter((e) => e.to === selected.id)
    : [];
  const outgoing = selected
    ? flow.edges.filter((e) => e.from === selected.id)
    : [];

  return (
    <ScreenNodeCallbacksContext.Provider value={callbacks}>
      <div className="mw-toolbar">
        {props.showSearch ? (
          <div className="mw-search" ref={searchRef}>
            <input
              value={query}
              placeholder="Search screens…"
              onFocus={() => {
                if (query.trim() !== "") {
                  setSearchOpen(true);
                }
              }}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
                setActiveIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
            />
            {query.length > 0 ? (
              <button
                type="button"
                className="mw-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                  setActiveIndex(-1);
                }}
              >
                ×
              </button>
            ) : null}
            {searchOpen && query.trim() !== "" ? (
              <div className="mw-search-results">
                {matches.length > 0 ? (
                  matches.map((m, idx) => (
                    <button
                      key={m.id}
                      type="button"
                      className={
                        idx === activeIndex ? "mw-search-active" : undefined
                      }
                      onClick={() => {
                        focusNode(m.id);
                        setSearchOpen(false);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <span>{m.title}</span>
                      <span className="mw-picker-label">{m.id}</span>
                    </button>
                  ))
                ) : (
                  <div className="mw-search-empty">No matching screens</div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="mw-toolbar-spacer" />
        <button
          type="button"
          className="mw-btn"
          onClick={() =>
            void fitView({
              padding: MW_FIT_PADDING,
              maxZoom: maxFitZoom,
              duration: 200,
            })
          }
        >
          Fit view
        </button>
        <button
          type="button"
          className="mw-btn"
          onClick={() => {
            draggedRef.current.clear();
            layoutWithElk(
              nodeIds,
              flowEdges.map((e) => ({ from: e.from, to: e.to })),
              { width: nodeWidth, height: MW_ELK_HEIGHT_EST },
            )
              .then((pos) => setComputed(pos))
              .catch((err: unknown) => {
                console.error(
                  "[microwireflow] layout failed, using grid fallback",
                  err,
                );
                setComputed(gridFallbackLayout(nodeIds));
              });
          }}
        >
          Auto-layout
        </button>
        <button
          type="button"
          className="mw-btn"
          onClick={() => void copyPositions()}
        >
          Copy positions
        </button>
        <button
          type="button"
          className="mw-btn"
          onClick={() => void runExport("png")}
        >
          PNG
        </button>
        <button
          type="button"
          className="mw-btn"
          onClick={() => void runExport("svg")}
        >
          SVG
        </button>
      </div>
      <div className="mw-canvas-row">
        <div className="mw-flow">
          <SmartEdgeProvider nodes={rfNodes} options={smartEdgeOptions}>
            <ReactFlow<ScreenNodeType, FlowEdgeInstance>
              nodes={rfNodes}
              edges={rfEdges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{
                padding: MW_FIT_PADDING,
                maxZoom: maxFitZoom,
              }}
              minZoom={0.1}
              maxZoom={2}
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable
              elevateEdgesOnSelect
              onNodeClick={(_, n) => {
                setSelectedId(n.id);
                onNodeSelect?.(n.id);
                setPicker(null);
              }}
              onEdgeMouseEnter={(_, e) =>
                setHover({ kind: "edge", edgeId: e.id })
              }
              onEdgeMouseLeave={() => setHover(null)}
              onPaneClick={() => {
                setPicker(null);
                setSearchOpen(false);
              }}
              proOptions={{ hideAttribution: false }}
            >
              {props.showControls ? (
                <Controls
                  position="top-left"
                  fitViewOptions={{
                    padding: MW_FIT_PADDING,
                    maxZoom: maxFitZoom,
                  }}
                />
              ) : null}
              {props.showMinimap ? <MiniMap /> : null}
              <Background
                variant={BackgroundVariant.Lines}
                gap={24}
                size={1}
                color="#e6ddc9"
                bgColor="#fbf8f1"
              />
            </ReactFlow>
          </SmartEdgeProvider>
        </div>
        <div className="mw-panel">
          {selected ? (
            <>
              <h3>{selected.title}</h3>
              <div className="mw-panel-kind">{selected.kind ?? "—"}</div>
              <div className="mw-panel-notes">
                {selected.notes ?? "No notes"}
              </div>
              <div className="mw-panel-section">Incoming</div>
              {incoming.length === 0 ? (
                <div className="mw-picker-label">None</div>
              ) : (
                incoming.map((e, i) => (
                  <button
                    key={mwEdgeId(e.from, e.trigger, e.to, i)}
                    type="button"
                    className="mw-panel-edge"
                    onClick={() => focusNode(e.from)}
                  >
                    {e.trigger} → {e.label ?? "untitled"} →{" "}
                    {nodeById.get(e.from)?.title ?? e.from}
                  </button>
                ))
              )}
              <div className="mw-panel-section">Outgoing</div>
              {outgoing.length === 0 ? (
                <div className="mw-picker-label">None</div>
              ) : (
                outgoing.map((e, i) => (
                  <button
                    key={mwEdgeId(e.from, e.trigger, e.to, i)}
                    type="button"
                    className="mw-panel-edge"
                    onClick={() => focusNode(e.to)}
                  >
                    {e.trigger} → {e.label ?? "untitled"} →{" "}
                    {nodeById.get(e.to)?.title ?? e.to}
                  </button>
                ))
              )}
            </>
          ) : (
            <div>Select a node to see notes.</div>
          )}
          {showPositions ? (
            <div className="mw-positions">
              <div className="mw-panel-section">Positions</div>
              <pre>{snippet}</pre>
            </div>
          ) : null}
        </div>
        {errors.length > 0 ? (
          <div className="mw-overlay" role="alert">
            <strong>Flow errors ({errors.length})</strong>
            <ul>
              {errors.map((e) => (
                <li key={e.message}>{e.message}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {picker ? (
          <div className="mw-picker" style={{ left: picker.x, top: picker.y }}>
            {picker.options.map((o) => (
              <button key={o.to} type="button" onClick={() => focusNode(o.to)}>
                {o.title}{" "}
                <span className="mw-picker-label">{o.label ?? "untitled"}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </ScreenNodeCallbacksContext.Provider>
  );
}

export function Wireflow(props: WireflowProps) {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const nodeWidth = props.nodeWidth ?? MW_NODE_WIDTH;
  const maxFitZoom = props.maxFitZoom ?? MW_DEFAULT_MAX_FIT_ZOOM;

  const styleWithVars = React.useMemo(() => {
    return {
      "--mw-node-width": `${nodeWidth}px`,
      ...props.style,
    } as React.CSSProperties;
  }, [nodeWidth, props.style]);

  return (
    <div
      ref={wrapperRef}
      className={`mw ${props.className ?? ""}`}
      style={styleWithVars}
    >
      <ReactFlowProvider>
        <CanvasInner
          flow={props.flow}
          showMinimap={props.showMinimap ?? true}
          showSearch={props.showSearch ?? true}
          showControls={props.showControls ?? true}
          edgeRouting={props.edgeRouting}
          avoidCollisions={props.avoidCollisions}
          lineHops={props.lineHops}
          nodeWidth={nodeWidth}
          maxFitZoom={maxFitZoom}
          wrapperRef={wrapperRef}
          onPositionsExport={props.onPositionsExport}
          onNodeSelect={props.onNodeSelect}
        />
      </ReactFlowProvider>
    </div>
  );
}
