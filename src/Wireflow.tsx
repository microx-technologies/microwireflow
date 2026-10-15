import type { Edge, NodeChange } from "@xyflow/react";

import {
  Background,
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
  MW_EDGE_INTERACTION_WIDTH,
  MW_ELK_HEIGHT_EST,
  MW_FIT_PADDING,
  MW_FOCUS_DURATION,
  MW_NODE_WIDTH,
  MW_TARGET_HANDLE_ID,
  mwEdgeId,
} from "@/constants.ts";
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
import type { Flow, FlowPositions, WireflowProps } from "@/types.ts";
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
  const { flow } = props;
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
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);
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
  // Content key: pasted `positions` prop wins over session drags only when
  // its content actually changes — never on parent re-render.
  const positionsPropKey = `${nodeIds.join("|")}::${positionsSignature(flowPositions)}`;
  // Nodes the user has placed by hand this session. Async layout arrivals
  // and `flow` identity changes MUST NOT move these; only an explicit
  // Auto-layout or a changed `positions` prop resets the set.
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
    layoutWithElk(missing, edgeInputs)
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
  }, [flow, nodeIds]);

  const finalPositionsRef = React.useRef(finalPositions);
  finalPositionsRef.current = finalPositions;

  // Single node pipeline: structural sync (add/drop/refresh) PLUS position
  // apply. Merging avoids mount races between separate effects and keeps one
  // invariant: existing nodes NEVER move except via engine positions for ids
  // the user has not placed by hand, explicit Auto-layout, or a changed
  // `positions` prop.
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
  }, [flow, highlightedNodeIds, setRfNodes]);

  React.useEffect(() => {
    setRfNodes((prev) => {
      let moved = false;
      const next = prev.map((n) => {
        const p = finalPositionsRef.current[n.id];
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
  }, [flow, finalPositions, setRfNodes]);

  React.useEffect(() => {
    setRfEdges(
      validIndices.map((i) => {
        const e = flowEdges[i] as (typeof flowEdges)[number];
        const id = mwEdgeId(e.from, e.trigger, e.to, i);
        return {
          id,
          source: e.from,
          sourceHandle: e.trigger === "" ? "__empty" : e.trigger,
          target: e.to,
          targetHandle: MW_TARGET_HANDLE_ID,
          type: "default",
          label: e.label,
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 4,
          interactionWidth: MW_EDGE_INTERACTION_WIDTH,
          style: { strokeDasharray: MW_DASH[e.lineStyle ?? "solid"] },
          className: hoveredEdgeIds.has(id) ? "mw-edge-hovered" : undefined,
        } satisfies Edge;
      }),
    );
  }, [flowEdges, validIndices, hoveredEdgeIds, setRfEdges]);

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
      const w = getInternalNode(id)?.measured?.width ?? MW_NODE_WIDTH;
      const h = getInternalNode(id)?.measured?.height ?? MW_ELK_HEIGHT_EST;
      const pos = internal.position;
      void setCenter(pos.x + w / 2, pos.y + h / 2, {
        zoom: getZoom(),
        duration: MW_FOCUS_DURATION,
      });
      setSelectedId(id);
      onNodeSelect?.(id);
      setPicker(null);
    },
    [getInternalNode, getNode, getZoom, setCenter, onNodeSelect],
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

  const callbacks = React.useMemo(
    () => ({ onRegistryChange, onTriggerClick, onTriggerHover }),
    [onRegistryChange, onTriggerClick, onTriggerHover],
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

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") {
      return [];
    }
    return flow.nodes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.id.toLowerCase().includes(q),
    );
  }, [flow, query]);

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
    } catch {
      const ta = document.createElement("textarea");
      ta.value = snippet;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch (err: unknown) {
        console.error("[microwireflow] copy positions failed", err);
      }
      ta.remove();
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
          <div className="mw-search">
            <input
              value={query}
              placeholder="Search screens…"
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches[0]) {
                  focusNode(matches[0].id);
                  setSearchOpen(false);
                }
              }}
            />
            {searchOpen && matches.length > 1 ? (
              <div className="mw-search-results">
                {matches.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      focusNode(m.id);
                      setSearchOpen(false);
                    }}
                  >
                    {m.title} <span className="mw-picker-label">{m.id}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="mw-toolbar-spacer" />
        <button
          type="button"
          className="mw-btn"
          onClick={() =>
            void fitView({ padding: MW_FIT_PADDING, duration: 200 })
          }
        >
          Fit view
        </button>
        <button
          type="button"
          className="mw-btn"
          onClick={() => {
            // Explicit user action: engine output wins, session drags reset.
            draggedRef.current.clear();
            layoutWithElk(
              nodeIds,
              flowEdges.map((e) => ({ from: e.from, to: e.to })),
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
          <ReactFlow<ScreenNodeType, Edge>
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: MW_FIT_PADDING }}
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
            {props.showControls ? <Controls /> : null}
            {props.showMinimap ? <MiniMap /> : null}
            <Background />
          </ReactFlow>
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
  return (
    <div
      ref={wrapperRef}
      className={`mw ${props.className ?? ""}`}
      style={props.style}
    >
      <ReactFlowProvider>
        <CanvasInner
          flow={props.flow}
          showMinimap={props.showMinimap ?? true}
          showSearch={props.showSearch ?? true}
          showControls={props.showControls ?? true}
          wrapperRef={wrapperRef}
          onPositionsExport={props.onPositionsExport}
          onNodeSelect={props.onNodeSelect}
        />
      </ReactFlowProvider>
    </div>
  );
}
