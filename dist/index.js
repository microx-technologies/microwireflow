import {
  validateFlowIds,
  validateTriggers
} from "./chunk-Q23PSIEE.js";

// src/Trigger.tsx
import { Handle, Position } from "@xyflow/react";
import * as React2 from "react";

// src/constants.ts
var MW_NODE_WIDTH = 520;
var MW_ELK_HEIGHT_EST = 360;
var MW_DEFAULT_EDGE_ROUTING = "smoothstep";
var MW_EDGE_BORDER_RADIUS = 8;
var MW_EDGE_OFFSET = 20;
var MW_ELK_OPTIONS = {
  "elk.algorithm": "layered",
  "elk.direction": "RIGHT",
  "elk.layered.spacing.nodeNodeBetweenLayers": "80",
  "elk.spacing.nodeNode": "50",
  "elk.layered.spacing.edgeNodeBetweenLayers": "40"
};
var MW_DASH = {
  solid: void 0,
  dashed: "6 4",
  dotted: "1 5"
};
var MW_EDGE_NODE_PADDING = 24;
var MW_EDGE_GRID_RATIO = 10;
var MW_HOP_RADIUS = 7;
var MW_ARROW_COLOR = "#141414";
var MW_ARROW_WIDTH = 16;
var MW_ARROW_HEIGHT = 16;
var MW_TARGET_HANDLE_ID = "__target";
var MW_TARGET_HANDLE_LEFT_ID = "__target_left";
var MW_TARGET_HANDLE_TOP_ID = "__target_top";
var MW_TARGET_HANDLE_RIGHT_ID = "__target_right";
var MW_TARGET_HANDLE_BOTTOM_ID = "__target_bottom";
var MW_EMPTY_TRIGGER_HANDLE_ID = "__empty";
var MW_SOURCE_HANDLE_LEFT_SUFFIX = "__left";
var MW_SOURCE_HANDLE_RIGHT_SUFFIX = "__right";
var MW_FOCUS_DURATION = 400;
var MW_FIT_PADDING = 0.2;
var MW_DEFAULT_MAX_FIT_ZOOM = 0.75;
var MW_EXPORT_PIXEL_RATIO = 2;
var MW_EXPORT_PADDING = 40;
var MW_GRID_FALLBACK_COLS = 4;
var MW_GRID_FALLBACK_DX = 600;
var MW_GRID_FALLBACK_DY = 420;
var MW_EDGE_INTERACTION_WIDTH = 8;
function mwEdgeId(from, trigger, to, index) {
  return `${from}:${trigger}->${to}#${index}`;
}

// src/triggerRegistry.ts
import * as React from "react";
function sameCounts(a, b) {
  if (!a) {
    return false;
  }
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) {
    return false;
  }
  return kb.every((k) => a[k] === b[k]);
}
var ScreenNodeCallbacksContext = React.createContext(null);
var TriggerRegistryContext = React.createContext(null);

// src/Trigger.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function Trigger(props) {
  const reg = React2.useContext(TriggerRegistryContext);
  const register = reg?.register;
  React2.useEffect(() => {
    if (!register) {
      return;
    }
    return register(props.id);
  }, [register, props.id]);
  const handleClick = (e) => {
    e.stopPropagation();
    reg?.onTriggerClick(props.id, e);
  };
  const classNames = ["mw-trigger"];
  if (props.fullWidth) {
    classNames.push("mw-trigger-full-width");
  }
  if (props.className) {
    classNames.push(props.className);
  }
  const baseId = props.id === "" ? MW_EMPTY_TRIGGER_HANDLE_ID : props.id;
  const sides = reg?.getActiveSides?.(props.id) ?? {
    left: false,
    right: false
  };
  return (
    // biome-ignore lint/a11y: This is just a trigger, not a button. It is not meant to be clicked.
    /* @__PURE__ */ jsxs(
      "span",
      {
        className: classNames.join(" "),
        style: props.style,
        "data-trigger-id": props.id,
        onClick: handleClick,
        onMouseEnter: () => reg?.onTriggerHover(reg.nodeId, props.id),
        onMouseLeave: () => reg?.onTriggerHover(reg.nodeId, null),
        children: [
          props.children,
          /* @__PURE__ */ jsx(
            Handle,
            {
              type: "source",
              position: Position.Left,
              id: `${baseId}${MW_SOURCE_HANDLE_LEFT_SUFFIX}`,
              isConnectable: false,
              className: "mw-trigger-handle mw-trigger-handle-left" + (sides.left ? " mw-trigger-handle-visible" : "")
            }
          ),
          /* @__PURE__ */ jsx(
            Handle,
            {
              type: "source",
              position: Position.Right,
              id: `${baseId}${MW_SOURCE_HANDLE_RIGHT_SUFFIX}`,
              isConnectable: false,
              className: "mw-trigger-handle mw-trigger-handle-right" + (sides.right ? " mw-trigger-handle-visible" : "")
            }
          ),
          /* @__PURE__ */ jsx(
            Handle,
            {
              type: "source",
              position: Position.Right,
              id: baseId,
              isConnectable: false,
              className: "mw-trigger-handle mw-trigger-handle-right",
              style: { opacity: 0, pointerEvents: "none" }
            }
          )
        ]
      }
    )
  );
}

// src/Wireflow.tsx
import { SmartEdgeProvider } from "@tisoap/react-flow-smart-edge";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow
} from "@xyflow/react";
import * as React4 from "react";

// src/edges.ts
import { createSmartEdge } from "@tisoap/react-flow-smart-edge";
import {
  MarkerType
} from "@xyflow/react";
var SMART_EDGE_TYPE_PREFIX = "smart_";
function resolveMarkerEnd(arrow, defaultArrow = true) {
  const effective = arrow ?? defaultArrow;
  if (effective === false || effective === "none") {
    return void 0;
  }
  if (effective === true || effective === "closed") {
    return {
      type: MarkerType.ArrowClosed,
      color: MW_ARROW_COLOR,
      width: MW_ARROW_WIDTH,
      height: MW_ARROW_HEIGHT
    };
  }
  if (effective === "open") {
    return {
      type: MarkerType.Arrow,
      color: MW_ARROW_COLOR,
      width: MW_ARROW_WIDTH,
      height: MW_ARROW_HEIGHT
    };
  }
  if (typeof effective === "object") {
    return effective;
  }
  return void 0;
}
function resolveSourcePort(baseTriggerId, sourcePos, targetPos, explicitSide) {
  const trigger = baseTriggerId === "" ? MW_EMPTY_TRIGGER_HANDLE_ID : baseTriggerId;
  let side;
  if (explicitSide !== void 0) {
    side = explicitSide;
  } else if (sourcePos === void 0 || targetPos === void 0) {
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
        side: "left"
      };
    case "right":
      return {
        handleId: `${trigger}${MW_SOURCE_HANDLE_RIGHT_SUFFIX}`,
        side: "right"
      };
  }
}
function computeActiveSourceSides(validIndices, flowEdges, nodePositions) {
  const map = /* @__PURE__ */ new Map();
  validIndices.forEach((i) => {
    const e = flowEdges[i];
    if (!e) {
      return;
    }
    const sourcePos = nodePositions[e.from];
    const targetPos = nodePositions[e.to];
    const resolvedSource = resolveSourcePort(
      e.trigger,
      sourcePos,
      targetPos,
      e.sourceSide
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
}
function resolveTargetPort(sourcePos, targetPos, explicitSide, slotIndex) {
  let side;
  if (explicitSide !== void 0) {
    side = explicitSide;
  } else if (sourcePos === void 0 || targetPos === void 0) {
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
  if (slotIndex !== void 0 && slotIndex > 0) {
    slotSuffix = slotIndex % 2 === 1 ? "_prev" : "_next";
  }
  switch (side) {
    case "left":
      return {
        handleId: `${MW_TARGET_HANDLE_LEFT_ID}${slotSuffix}`,
        side: "left"
      };
    case "top":
      return {
        handleId: `${MW_TARGET_HANDLE_TOP_ID}${slotSuffix}`,
        side: "top"
      };
    case "right":
      return {
        handleId: `${MW_TARGET_HANDLE_RIGHT_ID}${slotSuffix}`,
        side: "right"
      };
    case "bottom":
      return {
        handleId: `${MW_TARGET_HANDLE_BOTTOM_ID}${slotSuffix}`,
        side: "bottom"
      };
  }
}
function createBuiltInEdge(routing, base) {
  switch (routing) {
    case "smoothstep":
      return {
        ...base,
        type: "smoothstep",
        pathOptions: {
          borderRadius: base.pathOptions?.borderRadius ?? MW_EDGE_BORDER_RADIUS,
          offset: base.pathOptions?.offset ?? MW_EDGE_OFFSET,
          stepPosition: base.pathOptions?.stepPosition
        }
      };
    case "step":
      return {
        ...base,
        type: "step",
        pathOptions: {
          offset: base.pathOptions?.offset ?? MW_EDGE_OFFSET
        }
      };
    case "bezier": {
      const { pathOptions: _, ...rest } = base;
      return {
        ...rest,
        type: "default"
      };
    }
    case "straight": {
      const { pathOptions: _, ...rest } = base;
      return {
        ...rest,
        type: "straight"
      };
    }
  }
}
function createFlowEdge(routing, options) {
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
          borderRadius: options.pathOptions?.borderRadius ?? MW_EDGE_BORDER_RADIUS,
          offset: options.pathOptions?.offset ?? MW_EDGE_OFFSET,
          stepPosition: options.pathOptions?.stepPosition
        }
      };
    case "step":
      return {
        ...options,
        type,
        pathOptions: {
          offset: options.pathOptions?.offset ?? MW_EDGE_OFFSET
        }
      };
    case "bezier":
    case "straight":
      return {
        ...options,
        type
      };
  }
}
function createSmartEdgeTypes(lineHops) {
  return {
    [`${SMART_EDGE_TYPE_PREFIX}smoothstep`]: createSmartEdge("smoothstep", {
      hops: lineHops ? { borderRadius: MW_EDGE_BORDER_RADIUS, radius: MW_HOP_RADIUS } : false,
      nodePadding: MW_EDGE_NODE_PADDING,
      gridRatio: MW_EDGE_GRID_RATIO,
      borderRadius: MW_EDGE_BORDER_RADIUS
    }),
    [`${SMART_EDGE_TYPE_PREFIX}step`]: createSmartEdge("step", {
      hops: lineHops ? { radius: MW_HOP_RADIUS } : false,
      nodePadding: MW_EDGE_NODE_PADDING,
      gridRatio: MW_EDGE_GRID_RATIO
    }),
    [`${SMART_EDGE_TYPE_PREFIX}bezier`]: createSmartEdge("bezier", {
      nodePadding: MW_EDGE_NODE_PADDING,
      gridRatio: MW_EDGE_GRID_RATIO
    }),
    [`${SMART_EDGE_TYPE_PREFIX}straight`]: createSmartEdge("straight", {
      nodePadding: MW_EDGE_NODE_PADDING,
      gridRatio: MW_EDGE_GRID_RATIO
    })
  };
}

// src/exportImage.ts
import { toPng, toSvg } from "html-to-image";
async function exportImage(wrapper, getBounds, nodeIds, format, filename) {
  const viewport = wrapper.querySelector(
    ".react-flow__viewport"
  );
  if (!viewport) {
    throw new Error("[microwireflow] export failed: viewport not found");
  }
  const bounds = getBounds(nodeIds);
  const width = Math.ceil(bounds.width + MW_EXPORT_PADDING * 2);
  const height = Math.ceil(bounds.height + MW_EXPORT_PADDING * 2);
  const restoreInlineStyles = [];
  const inlineSvgEdgeStyles = () => {
    const paths = viewport.querySelectorAll(
      ".react-flow__edges path.react-flow__edge-path"
    );
    paths.forEach((path) => {
      const element = path;
      const computed = window.getComputedStyle(element);
      const previous = element.style.cssText;
      element.style.stroke = computed.getPropertyValue("stroke");
      element.style.strokeWidth = computed.getPropertyValue("stroke-width");
      element.style.strokeLinecap = computed.getPropertyValue("stroke-linecap");
      element.style.fill = computed.getPropertyValue("fill");
      const dasharray = computed.getPropertyValue("stroke-dasharray");
      if (dasharray !== "" && dasharray !== "none") {
        element.style.strokeDasharray = dasharray;
      }
      restoreInlineStyles.push(() => {
        element.style.cssText = previous;
      });
    });
    const labels = viewport.querySelectorAll(".react-flow__edge-text");
    labels.forEach((label) => {
      const element = label;
      const computed = window.getComputedStyle(element);
      const previous = element.style.cssText;
      element.style.fill = computed.getPropertyValue("fill");
      element.style.fontSize = computed.getPropertyValue("font-size");
      element.style.fontFamily = computed.getPropertyValue("font-family");
      restoreInlineStyles.push(() => {
        element.style.cssText = previous;
      });
    });
    const labelBackgrounds = viewport.querySelectorAll(
      ".react-flow__edge-textbg"
    );
    labelBackgrounds.forEach((background) => {
      const element = background;
      const computed = window.getComputedStyle(element);
      const previous = element.style.cssText;
      element.style.fill = computed.getPropertyValue("fill");
      element.style.stroke = computed.getPropertyValue("stroke");
      element.style.strokeWidth = computed.getPropertyValue("stroke-width");
      restoreInlineStyles.push(() => {
        element.style.cssText = previous;
      });
    });
    const edgeSvgs = viewport.querySelectorAll(".react-flow__edges svg");
    edgeSvgs.forEach((svg) => {
      const element = svg;
      const previous = element.style.cssText;
      element.style.position = "absolute";
      element.style.overflow = "visible";
      element.style.pointerEvents = "none";
      element.style.top = "0px";
      element.style.left = "0px";
      restoreInlineStyles.push(() => {
        element.style.cssText = previous;
      });
    });
    const arrowheads = viewport.querySelectorAll(
      ".react-flow__arrowhead polyline"
    );
    arrowheads.forEach((polyline) => {
      const element = polyline;
      const computed = window.getComputedStyle(element);
      const previous = element.style.cssText;
      element.style.stroke = computed.getPropertyValue("stroke");
      element.style.fill = computed.getPropertyValue("fill");
      element.style.strokeLinecap = computed.getPropertyValue("stroke-linecap");
      element.style.strokeLinejoin = computed.getPropertyValue("stroke-linejoin");
      restoreInlineStyles.push(() => {
        element.style.cssText = previous;
      });
    });
  };
  inlineSvgEdgeStyles();
  const container = document.createElement("div");
  container.className = "mw react-flow";
  container.style.position = "fixed";
  container.style.left = "0px";
  container.style.top = "0px";
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.zIndex = "-99999";
  container.style.pointerEvents = "none";
  container.style.boxSizing = "border-box";
  container.style.overflow = "hidden";
  const viewportParent = viewport.parentNode;
  const viewportSibling = viewport.nextSibling;
  const prevViewportCss = viewport.style.cssText;
  viewport.style.width = `${width}px`;
  viewport.style.height = `${height}px`;
  viewport.style.transform = `translate(${-bounds.x + MW_EXPORT_PADDING}px,${-bounds.y + MW_EXPORT_PADDING}px) scale(1)`;
  viewport.style.border = "none";
  viewport.style.background = "transparent";
  container.appendChild(viewport);
  document.body.appendChild(container);
  const includeStyleProperties = Array.from(
    window.getComputedStyle(container),
    (property) => property
  );
  let dataUrl;
  try {
    const common = {
      backgroundColor: "transparent",
      cacheBust: true,
      width,
      height,
      style: {
        position: "relative",
        left: "0px",
        top: "0px",
        zIndex: "0",
        width: `${width}px`,
        height: `${height}px`
      },
      includeStyleProperties
    };
    dataUrl = format === "png" ? await toPng(container, {
      ...common,
      pixelRatio: MW_EXPORT_PIXEL_RATIO
    }) : await toSvg(container, common);
  } finally {
    if (viewportParent) {
      viewportParent.insertBefore(viewport, viewportSibling);
    }
    viewport.style.cssText = prevViewportCss;
    container.remove();
    while (restoreInlineStyles.length > 0) {
      restoreInlineStyles.pop()?.();
    }
  }
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

// src/layout.ts
import ELK from "elkjs/lib/elk.bundled.js";
var elk = new ELK();
function gridFallbackLayout(nodeIds) {
  const positions = {};
  nodeIds.forEach((id, i) => {
    positions[id] = {
      x: i % MW_GRID_FALLBACK_COLS * MW_GRID_FALLBACK_DX,
      y: Math.floor(i / MW_GRID_FALLBACK_COLS) * MW_GRID_FALLBACK_DY
    };
  });
  return positions;
}
async function layoutWithElk(nodeIds, edges, opts) {
  const width = opts?.width ?? MW_NODE_WIDTH;
  const height = opts?.height ?? MW_ELK_HEIGHT_EST;
  const known = new Set(nodeIds);
  const graph = {
    id: "root",
    layoutOptions: { ...MW_ELK_OPTIONS },
    children: nodeIds.map((id) => ({ id, width, height })),
    edges: edges.filter((e) => known.has(e.from) && known.has(e.to)).map((e, i) => ({ id: `e${i}`, sources: [e.from], targets: [e.to] }))
  };
  const laid = await elk.layout(graph);
  const positions = {};
  for (const child of laid.children ?? []) {
    positions[child.id] = {
      x: Math.round(child.x ?? 0),
      y: Math.round(child.y ?? 0)
    };
  }
  for (const id of nodeIds) {
    positions[id] ??= { x: 0, y: 0 };
  }
  return positions;
}
function mergePositions(nodeIds, base, computed) {
  const out = {};
  for (const id of nodeIds) {
    out[id] = base?.[id] ?? computed[id] ?? { x: 0, y: 0 };
  }
  return out;
}

// src/positions.ts
function currentPositionsFromNodes(nodes) {
  const out = {};
  for (const n of nodes) {
    out[n.id] = { x: Math.round(n.position.x), y: Math.round(n.position.y) };
  }
  return out;
}
function positionsSignature(p) {
  if (!p) {
    return "";
  }
  return Object.keys(p).sort().map((k) => {
    const v = p[k];
    return `${k}:${Math.round(v?.x ?? 0)},${Math.round(v?.y ?? 0)}`;
  }).join(";");
}
function serializePositions(p) {
  const keys = Object.keys(p).sort();
  const lines = keys.map((k) => {
    const v = p[k];
    return `  ${k}: { x: ${Math.round(v.x)}, y: ${Math.round(v.y)} },`;
  });
  return `positions: {
${lines.join("\n")}
}`;
}

// src/ScreenNode.tsx
import { Handle as Handle2, Position as Position2 } from "@xyflow/react";
import * as React3 from "react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var SCREEN_NODE_TYPE = "screen";
function ScreenNode(props) {
  const { flowNode, highlighted } = props.data;
  const callbacks = React3.useContext(ScreenNodeCallbacksContext);
  const callbacksRef = React3.useRef(callbacks);
  callbacksRef.current = callbacks;
  const countsRef = React3.useRef({});
  const register = React3.useCallback(
    (triggerId) => {
      countsRef.current[triggerId] = (countsRef.current[triggerId] ?? 0) + 1;
      callbacksRef.current?.onRegistryChange(props.id, {
        ...countsRef.current
      });
      return () => {
        const next = (countsRef.current[triggerId] ?? 1) - 1;
        if (next <= 0) {
          delete countsRef.current[triggerId];
        } else {
          countsRef.current[triggerId] = next;
        }
        callbacksRef.current?.onRegistryChange(props.id, {
          ...countsRef.current
        });
      };
    },
    [props.id]
  );
  const getActiveSides = React3.useCallback(
    (triggerId) => {
      return callbacks?.getActiveSourceSides?.(props.id, triggerId) ?? {
        left: false,
        right: false
      };
    },
    [callbacks, props.id]
  );
  const registry = React3.useMemo(() => {
    return {
      nodeId: props.id,
      register,
      onTriggerClick: (triggerId, e) => {
        callbacksRef.current?.onTriggerClick(props.id, triggerId, e);
      },
      onTriggerHover: (nodeId, triggerId) => {
        callbacksRef.current?.onTriggerHover(nodeId, triggerId);
      },
      getActiveSides
    };
  }, [props.id, register, getActiveSides]);
  const kind = flowNode.kind === "" ? void 0 : flowNode.kind;
  const kindClass = kind === void 0 ? "" : kind.includes("error") ? " mw-kind-error" : kind.includes("modal") ? " mw-kind-modal" : kind.includes("popup") ? " mw-kind-popup" : "";
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      className: "mw-node" + kindClass + (props.selected ? " mw-selected" : "") + (highlighted ? " mw-highlighted" : ""),
      children: [
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Left,
            id: MW_TARGET_HANDLE_LEFT_ID,
            isConnectable: false,
            className: "mw-target-handle",
            style: { top: "50%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Left,
            id: `${MW_TARGET_HANDLE_LEFT_ID}_prev`,
            isConnectable: false,
            className: "mw-target-handle",
            style: { top: "35%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Left,
            id: `${MW_TARGET_HANDLE_LEFT_ID}_next`,
            isConnectable: false,
            className: "mw-target-handle",
            style: { top: "65%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Top,
            id: MW_TARGET_HANDLE_TOP_ID,
            isConnectable: false,
            className: "mw-target-handle",
            style: { left: "50%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Top,
            id: MW_TARGET_HANDLE_ID,
            isConnectable: false,
            className: "mw-target-handle",
            style: { left: "50%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Top,
            id: `${MW_TARGET_HANDLE_TOP_ID}_prev`,
            isConnectable: false,
            className: "mw-target-handle",
            style: { left: "35%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Top,
            id: `${MW_TARGET_HANDLE_TOP_ID}_next`,
            isConnectable: false,
            className: "mw-target-handle",
            style: { left: "65%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Right,
            id: MW_TARGET_HANDLE_RIGHT_ID,
            isConnectable: false,
            className: "mw-target-handle",
            style: { top: "50%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Right,
            id: `${MW_TARGET_HANDLE_RIGHT_ID}_prev`,
            isConnectable: false,
            className: "mw-target-handle",
            style: { top: "35%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Right,
            id: `${MW_TARGET_HANDLE_RIGHT_ID}_next`,
            isConnectable: false,
            className: "mw-target-handle",
            style: { top: "65%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Bottom,
            id: MW_TARGET_HANDLE_BOTTOM_ID,
            isConnectable: false,
            className: "mw-target-handle",
            style: { left: "50%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Bottom,
            id: `${MW_TARGET_HANDLE_BOTTOM_ID}_prev`,
            isConnectable: false,
            className: "mw-target-handle",
            style: { left: "35%" }
          }
        ),
        /* @__PURE__ */ jsx2(
          Handle2,
          {
            type: "target",
            position: Position2.Bottom,
            id: `${MW_TARGET_HANDLE_BOTTOM_ID}_next`,
            isConnectable: false,
            className: "mw-target-handle",
            style: { left: "65%" }
          }
        ),
        /* @__PURE__ */ jsxs2("div", { className: "mw-node-header", children: [
          /* @__PURE__ */ jsx2("span", { className: "mw-node-title", children: flowNode.title }),
          kind ? /* @__PURE__ */ jsx2("span", { className: "mw-node-kind", children: kind }) : null
        ] }),
        /* @__PURE__ */ jsx2("div", { className: "mw-node-body", children: /* @__PURE__ */ jsx2(TriggerRegistryContext.Provider, { value: registry, children: flowNode.component }) })
      ]
    }
  );
}

// src/syncNodes.ts
function syncFlowNodes(prev, flowNodes, getPosition, isHighlighted) {
  const prevById = new Map(prev.map((n) => [n.id, n]));
  const out = flowNodes.map((fn) => {
    const existing = prevById.get(fn.id);
    const highlighted = isHighlighted(fn.id);
    if (existing && existing.type === SCREEN_NODE_TYPE && existing.data.flowNode === fn && existing.data.highlighted === highlighted) {
      return existing;
    }
    if (existing) {
      return {
        ...existing,
        type: SCREEN_NODE_TYPE,
        data: { flowNode: fn, highlighted }
      };
    }
    return {
      id: fn.id,
      type: SCREEN_NODE_TYPE,
      position: getPosition(fn.id) ?? { x: 0, y: 0 },
      data: { flowNode: fn, highlighted }
    };
  });
  if (out.length === prev.length && out.every((n, i) => n === prev[i])) {
    return prev;
  }
  return out;
}

// src/Wireflow.tsx
import { Fragment, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var nodeTypes = { [SCREEN_NODE_TYPE]: ScreenNode };
function validEdgeIndices(flow, registries) {
  const nodeIds = new Set(flow.nodes.map((n) => n.id));
  const out = [];
  flow.edges.forEach((edge, i) => {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      return;
    }
    const registry = registries[edge.from];
    if (registry !== void 0 && (edge.trigger === "" || registry[edge.trigger] === void 0)) {
      return;
    }
    out.push(i);
  });
  return out;
}
function CanvasInner(props) {
  const { flow, nodeWidth, maxFitZoom } = props;
  const {
    getNode,
    getInternalNode,
    getZoom,
    setCenter,
    fitView,
    getNodesBounds
  } = useReactFlow();
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(
    []
  );
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(
    []
  );
  const [computed, setComputed] = React4.useState({});
  const [selectedId, setSelectedId] = React4.useState(null);
  const [hover, setHover] = React4.useState(null);
  const [picker, setPicker] = React4.useState(null);
  const [registries, setRegistries] = React4.useState({});
  const [query, setQuery] = React4.useState("");
  const [searchOpen, setSearchOpen] = React4.useState(false);
  const [showPositions, setShowPositions] = React4.useState(false);
  const [errors, setErrors] = React4.useState([]);
  const loggedRef = React4.useRef(/* @__PURE__ */ new Set());
  const lineHops = props.lineHops ?? true;
  const avoidCollisions = props.avoidCollisions ?? false;
  const edgeTypes = React4.useMemo(() => {
    return createSmartEdgeTypes(lineHops);
  }, [lineHops]);
  const smartEdgeOptions = React4.useMemo(
    () => ({
      nodePadding: MW_EDGE_NODE_PADDING,
      gridRatio: MW_EDGE_GRID_RATIO,
      routeOnlyWhenBlocked: true
    }),
    []
  );
  const nodeIds = React4.useMemo(() => flow.nodes.map((n) => n.id), [flow]);
  const nodeById = React4.useMemo(() => {
    const m = new Map(flow.nodes.map((n) => [n.id, n]));
    return m;
  }, [flow]);
  const flowPositions = flow.positions;
  const flowNodes = flow.nodes;
  const flowEdges = flow.edges;
  const finalPositions = React4.useMemo(
    () => mergePositions(nodeIds, flowPositions, computed),
    [nodeIds, flowPositions, computed]
  );
  const positionsPropKey = `${nodeIds.join("|")}::${positionsSignature(flowPositions)}`;
  const draggedRef = React4.useRef(/* @__PURE__ */ new Set());
  const validIndices = React4.useMemo(
    () => validEdgeIndices(flow, registries),
    [registries, flow]
  );
  const validSet = React4.useMemo(() => new Set(validIndices), [validIndices]);
  const validSetRef = React4.useRef(validSet);
  validSetRef.current = validSet;
  const hoveredEdgeIds = React4.useMemo(() => {
    if (!hover) {
      return /* @__PURE__ */ new Set();
    }
    if (hover.kind === "edge") {
      return /* @__PURE__ */ new Set([hover.edgeId]);
    }
    const ids = /* @__PURE__ */ new Set();
    flowEdges.forEach((e, i) => {
      if (validSet.has(i) && e.from === hover.nodeId && e.trigger === hover.triggerId) {
        ids.add(mwEdgeId(e.from, e.trigger, e.to, i));
      }
    });
    return ids;
  }, [hover, flowEdges, validSet]);
  const highlightedNodeIds = React4.useMemo(() => {
    const ids = /* @__PURE__ */ new Set();
    flowEdges.forEach((e, i) => {
      if (validSet.has(i) && hoveredEdgeIds.has(mwEdgeId(e.from, e.trigger, e.to, i))) {
        ids.add(e.from);
        ids.add(e.to);
      }
    });
    return ids;
  }, [flowEdges, validSet, hoveredEdgeIds]);
  React4.useEffect(() => {
    let live = true;
    const missing = nodeIds.filter((id) => flowPositions?.[id] === void 0);
    if (missing.length === 0) {
      setComputed({});
      return () => {
        live = false;
      };
    }
    const edgeInputs = flowEdges.map((e) => ({ from: e.from, to: e.to }));
    layoutWithElk(missing, edgeInputs, {
      width: nodeWidth,
      height: MW_ELK_HEIGHT_EST
    }).then((pos) => {
      if (live) {
        setComputed(pos);
      }
    }).catch((err) => {
      console.error(
        "[microwireflow] layout failed, using grid fallback",
        err
      );
      if (live) {
        setComputed(gridFallbackLayout(missing));
      }
    });
    return () => {
      live = false;
    };
  }, [nodeIds, flowPositions, flowEdges, nodeWidth]);
  const finalPositionsRef = React4.useRef(finalPositions);
  finalPositionsRef.current = finalPositions;
  const prevPropKeyRef = React4.useRef(positionsPropKey);
  React4.useEffect(() => {
    if (prevPropKeyRef.current !== positionsPropKey) {
      prevPropKeyRef.current = positionsPropKey;
      draggedRef.current.clear();
    }
    setRfNodes(
      (prev) => syncFlowNodes(
        prev,
        flowNodes,
        (id) => finalPositionsRef.current[id],
        (id) => highlightedNodeIds.has(id)
      )
    );
  }, [positionsPropKey, flowNodes, highlightedNodeIds, setRfNodes]);
  React4.useEffect(() => {
    setRfNodes((prev) => {
      let moved = false;
      const next = prev.map((n) => {
        const p = finalPositions[n.id];
        const shouldMove = p !== void 0 && !draggedRef.current.has(n.id) && (n.position.x !== p.x || n.position.y !== p.y);
        if (shouldMove && p !== void 0) {
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
  const nodePositions = React4.useMemo(() => {
    const map = { ...finalPositions };
    for (const n of rfNodes) {
      map[n.id] = { x: n.position.x, y: n.position.y };
    }
    return map;
  }, [finalPositions, rfNodes]);
  const targetSlotIndices = React4.useMemo(() => {
    const counts = /* @__PURE__ */ new Map();
    const indices = /* @__PURE__ */ new Map();
    validIndices.forEach((i) => {
      const e = flowEdges[i];
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
  const sourceSlotIndices = React4.useMemo(() => {
    const counts = /* @__PURE__ */ new Map();
    const indices = /* @__PURE__ */ new Map();
    validIndices.forEach((i) => {
      const e = flowEdges[i];
      const sourcePos = nodePositions[e.from];
      const targetPos = nodePositions[e.to];
      const resolvedSource = resolveSourcePort(
        e.trigger,
        sourcePos,
        targetPos,
        e.sourceSide
      );
      const key = `${e.from}:${e.trigger}:${resolvedSource.side}`;
      const count = counts.get(key) ?? 0;
      indices.set(i, count);
      counts.set(key, count + 1);
    });
    return { indices, counts };
  }, [validIndices, flowEdges, nodePositions]);
  const activeSourceSides = React4.useMemo(() => {
    return computeActiveSourceSides(validIndices, flowEdges, nodePositions);
  }, [validIndices, flowEdges, nodePositions]);
  const edgeRouting = props.edgeRouting;
  const arrowProp = props.arrow;
  React4.useEffect(() => {
    const defaultRouting = edgeRouting ?? MW_DEFAULT_EDGE_ROUTING;
    const defaultArrow = arrowProp ?? true;
    setRfEdges(
      validIndices.map((i) => {
        const e = flowEdges[i];
        const id = mwEdgeId(e.from, e.trigger, e.to, i);
        const routing = e.routing ?? defaultRouting;
        const sourcePos = nodePositions[e.from];
        const targetPos = nodePositions[e.to];
        const slotIndex = targetSlotIndices.get(i) ?? 0;
        const resolvedPort = resolveTargetPort(
          sourcePos,
          targetPos,
          e.targetSide,
          slotIndex
        );
        const resolvedSource = resolveSourcePort(
          e.trigger,
          sourcePos,
          targetPos,
          e.sourceSide
        );
        const edgeAvoidCollisions = e.avoidCollisions ?? avoidCollisions;
        const markerEnd = resolveMarkerEnd(e.arrow, defaultArrow);
        const sourceKey = `${e.from}:${e.trigger}:${resolvedSource.side}`;
        const sourceSlot = sourceSlotIndices.indices.get(i) ?? 0;
        const sourceTotal = sourceSlotIndices.counts.get(sourceKey) ?? 1;
        let stepPosition;
        if (sourceTotal > 1) {
          stepPosition = 0.3 + sourceSlot / (sourceTotal - 1) * 0.4;
        }
        return createFlowEdge(routing, {
          id,
          source: e.from,
          sourceHandle: resolvedSource.handleId,
          target: e.to,
          targetHandle: resolvedPort.handleId,
          label: e.label,
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          interactionWidth: MW_EDGE_INTERACTION_WIDTH,
          style: { strokeDasharray: MW_DASH[e.lineStyle ?? "solid"] },
          className: hoveredEdgeIds.has(id) ? "mw-edge-hovered" : void 0,
          avoidCollisions: edgeAvoidCollisions,
          markerEnd,
          pathOptions: {
            borderRadius: MW_EDGE_BORDER_RADIUS,
            offset: MW_EDGE_OFFSET,
            stepPosition
          }
        });
      })
    );
  }, [
    flowEdges,
    validIndices,
    hoveredEdgeIds,
    setRfEdges,
    edgeRouting,
    avoidCollisions,
    arrowProp,
    nodePositions,
    targetSlotIndices,
    sourceSlotIndices
  ]);
  React4.useEffect(() => {
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
  const handleNodesChange = React4.useCallback(
    (changes) => {
      for (const c of changes) {
        if (c.type === "position" && (c.dragging ?? false)) {
          draggedRef.current.add(c.id);
        }
      }
      onNodesChange(changes);
    },
    [onNodesChange]
  );
  const onNodeSelect = props.onNodeSelect;
  const focusNode = React4.useCallback(
    (id) => {
      const internal = getInternalNode(id) ?? getNode(id);
      if (!internal) {
        return;
      }
      const w = getInternalNode(id)?.measured?.width ?? nodeWidth;
      const h = getInternalNode(id)?.measured?.height ?? MW_ELK_HEIGHT_EST;
      const pos = internal.position;
      void setCenter(pos.x + w / 2, pos.y + h / 2, {
        zoom: getZoom(),
        duration: MW_FOCUS_DURATION
      });
      setSelectedId(id);
      setRfNodes(
        (prev) => prev.map(
          (n) => n.selected !== (n.id === id) ? { ...n, selected: n.id === id } : n
        )
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
      nodeWidth
    ]
  );
  const onRegistryChange = React4.useCallback(
    (nodeId, snapshot) => {
      setRegistries(
        (prev) => sameCounts(prev[nodeId], snapshot) ? prev : { ...prev, [nodeId]: snapshot }
      );
    },
    []
  );
  const onTriggerClick = React4.useCallback(
    (nodeId, triggerId, e) => {
      const valid = validSetRef.current;
      const outgoing2 = flow.edges.filter(
        (edge, i) => valid.has(i) && edge.from === nodeId && edge.trigger === triggerId
      );
      setSelectedId(nodeId);
      onNodeSelect?.(nodeId);
      if (outgoing2.length === 1 && outgoing2[0]) {
        focusNode(outgoing2[0].to);
      } else if (outgoing2.length > 1) {
        setPicker({
          x: e.clientX,
          y: e.clientY,
          from: nodeId,
          trigger: triggerId,
          options: outgoing2.map((o) => ({
            to: o.to,
            title: nodeById.get(o.to)?.title ?? o.to,
            label: o.label
          }))
        });
      }
    },
    [flow, focusNode, nodeById, onNodeSelect]
  );
  const onTriggerHover = React4.useCallback(
    (nodeId, triggerId) => {
      setHover(
        triggerId === null ? null : { kind: "trigger", nodeId, triggerId }
      );
    },
    []
  );
  const triggerDots = props.triggerDots ?? true;
  const getActiveSourceSides = React4.useCallback(
    (nodeId, triggerId) => {
      if (!triggerDots) {
        return { left: false, right: false };
      }
      return activeSourceSides.get(`${nodeId}:${triggerId}`) ?? {
        left: false,
        right: false
      };
    },
    [activeSourceSides, triggerDots]
  );
  const callbacks = React4.useMemo(
    () => ({
      onRegistryChange,
      onTriggerClick,
      onTriggerHover,
      getActiveSourceSides
    }),
    [onRegistryChange, onTriggerClick, onTriggerHover, getActiveSourceSides]
  );
  React4.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setPicker(null);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const [activeIndex, setActiveIndex] = React4.useState(-1);
  const searchRef = React4.useRef(null);
  React4.useEffect(() => {
    const handleOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);
  const matches = React4.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") {
      return [];
    }
    return flow.nodes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.id.toLowerCase().includes(q) || (n.kind?.toLowerCase().includes(q) ?? false)
    );
  }, [flow, query]);
  const handleSearchKeyDown = (e) => {
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
        setActiveIndex((prev) => prev <= 0 ? matches.length - 1 : prev - 1);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetMatch = activeIndex >= 0 && activeIndex < matches.length ? matches[activeIndex] : matches[0];
      if (targetMatch) {
        focusNode(targetMatch.id);
        setSearchOpen(false);
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      e.currentTarget.blur();
    }
  };
  const currentPositions = React4.useMemo(
    () => currentPositionsFromNodes(rfNodes),
    [rfNodes]
  );
  const snippet = React4.useMemo(
    () => serializePositions(currentPositions),
    [currentPositions]
  );
  const onPositionsExport = props.onPositionsExport;
  const copyPositions = React4.useCallback(async () => {
    setShowPositions(true);
    try {
      await navigator.clipboard.writeText(snippet);
    } catch (err) {
      console.error("[microwireflow] copy positions failed", err);
    }
    onPositionsExport?.(currentPositions, snippet);
  }, [snippet, currentPositions, onPositionsExport]);
  const wrapperRef = props.wrapperRef;
  const runExport = React4.useCallback(
    async (format) => {
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
          format === "png" ? "flow.png" : "flow.svg"
        );
      } catch (err) {
        console.error("[microwireflow] export failed", err);
      }
    },
    [wrapperRef, getNodesBounds, nodeIds]
  );
  const selected = selectedId ? nodeById.get(selectedId) : void 0;
  const incoming = selected ? flow.edges.filter((e) => e.to === selected.id) : [];
  const outgoing = selected ? flow.edges.filter((e) => e.from === selected.id) : [];
  return /* @__PURE__ */ jsxs3(ScreenNodeCallbacksContext.Provider, { value: callbacks, children: [
    /* @__PURE__ */ jsxs3("div", { className: "mw-toolbar", children: [
      props.showSearch ? /* @__PURE__ */ jsxs3("div", { className: "mw-search", ref: searchRef, children: [
        /* @__PURE__ */ jsx3(
          "input",
          {
            value: query,
            placeholder: "Search screens\u2026",
            onFocus: () => {
              if (query.trim() !== "") {
                setSearchOpen(true);
              }
            },
            onChange: (e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
              setActiveIndex(-1);
            },
            onKeyDown: handleSearchKeyDown
          }
        ),
        query.length > 0 ? /* @__PURE__ */ jsx3(
          "button",
          {
            type: "button",
            className: "mw-search-clear",
            "aria-label": "Clear search",
            onClick: () => {
              setQuery("");
              setSearchOpen(false);
              setActiveIndex(-1);
            },
            children: "\xD7"
          }
        ) : null,
        searchOpen && query.trim() !== "" ? /* @__PURE__ */ jsx3("div", { className: "mw-search-results", children: matches.length > 0 ? matches.map((m, idx) => /* @__PURE__ */ jsxs3(
          "button",
          {
            type: "button",
            className: idx === activeIndex ? "mw-search-active" : void 0,
            onClick: () => {
              focusNode(m.id);
              setSearchOpen(false);
            },
            onMouseEnter: () => setActiveIndex(idx),
            children: [
              /* @__PURE__ */ jsx3("span", { children: m.title }),
              /* @__PURE__ */ jsx3("span", { className: "mw-picker-label", children: m.id })
            ]
          },
          m.id
        )) : /* @__PURE__ */ jsx3("div", { className: "mw-search-empty", children: "No matching screens" }) }) : null
      ] }) : null,
      /* @__PURE__ */ jsx3("div", { className: "mw-toolbar-spacer" }),
      /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          className: "mw-btn",
          onClick: () => void fitView({
            padding: MW_FIT_PADDING,
            maxZoom: maxFitZoom,
            duration: 200
          }),
          children: "Fit view"
        }
      ),
      /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          className: "mw-btn",
          onClick: () => {
            draggedRef.current.clear();
            layoutWithElk(
              nodeIds,
              flowEdges.map((e) => ({ from: e.from, to: e.to })),
              { width: nodeWidth, height: MW_ELK_HEIGHT_EST }
            ).then((pos) => setComputed(pos)).catch((err) => {
              console.error(
                "[microwireflow] layout failed, using grid fallback",
                err
              );
              setComputed(gridFallbackLayout(nodeIds));
            });
          },
          children: "Auto-layout"
        }
      ),
      /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          className: "mw-btn",
          onClick: () => void copyPositions(),
          children: "Copy positions"
        }
      ),
      /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          className: "mw-btn",
          onClick: () => void runExport("png"),
          children: "PNG"
        }
      ),
      /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          className: "mw-btn",
          onClick: () => void runExport("svg"),
          children: "SVG"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "mw-canvas-row", children: [
      /* @__PURE__ */ jsx3("div", { className: "mw-flow", children: /* @__PURE__ */ jsx3(SmartEdgeProvider, { nodes: rfNodes, options: smartEdgeOptions, children: /* @__PURE__ */ jsxs3(
        ReactFlow,
        {
          defaultMarkerColor: MW_ARROW_COLOR,
          nodes: rfNodes,
          edges: rfEdges,
          onNodesChange: handleNodesChange,
          onEdgesChange,
          nodeTypes,
          edgeTypes,
          fitView: true,
          fitViewOptions: {
            padding: MW_FIT_PADDING,
            maxZoom: maxFitZoom
          },
          minZoom: 0.1,
          maxZoom: 2,
          nodesDraggable: true,
          nodesConnectable: false,
          elementsSelectable: true,
          elevateEdgesOnSelect: true,
          onNodeClick: (_, n) => {
            setSelectedId(n.id);
            onNodeSelect?.(n.id);
            setPicker(null);
          },
          onEdgeMouseEnter: (_, e) => setHover({ kind: "edge", edgeId: e.id }),
          onEdgeMouseLeave: () => setHover(null),
          onPaneClick: () => {
            setPicker(null);
            setSearchOpen(false);
          },
          proOptions: { hideAttribution: false },
          children: [
            props.showControls ? /* @__PURE__ */ jsx3(
              Controls,
              {
                position: "top-left",
                fitViewOptions: {
                  padding: MW_FIT_PADDING,
                  maxZoom: maxFitZoom
                }
              }
            ) : null,
            props.showMinimap ? /* @__PURE__ */ jsx3(MiniMap, {}) : null,
            /* @__PURE__ */ jsx3(
              Background,
              {
                variant: BackgroundVariant.Lines,
                gap: 24,
                size: 1,
                color: "#e6ddc9",
                bgColor: "#fbf8f1"
              }
            )
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsxs3("div", { className: "mw-panel", children: [
        selected ? /* @__PURE__ */ jsxs3(Fragment, { children: [
          /* @__PURE__ */ jsx3("h3", { children: selected.title }),
          /* @__PURE__ */ jsx3("div", { className: "mw-panel-kind", children: selected.kind ?? "\u2014" }),
          /* @__PURE__ */ jsx3("div", { className: "mw-panel-notes", children: selected.notes ?? "No notes" }),
          /* @__PURE__ */ jsx3("div", { className: "mw-panel-section", children: "Incoming" }),
          incoming.length === 0 ? /* @__PURE__ */ jsx3("div", { className: "mw-picker-label", children: "None" }) : incoming.map((e, i) => /* @__PURE__ */ jsxs3(
            "button",
            {
              type: "button",
              className: "mw-panel-edge",
              onClick: () => focusNode(e.from),
              children: [
                e.trigger,
                " \u2192 ",
                e.label ?? "untitled",
                " \u2192",
                " ",
                nodeById.get(e.from)?.title ?? e.from
              ]
            },
            mwEdgeId(e.from, e.trigger, e.to, i)
          )),
          /* @__PURE__ */ jsx3("div", { className: "mw-panel-section", children: "Outgoing" }),
          outgoing.length === 0 ? /* @__PURE__ */ jsx3("div", { className: "mw-picker-label", children: "None" }) : outgoing.map((e, i) => /* @__PURE__ */ jsxs3(
            "button",
            {
              type: "button",
              className: "mw-panel-edge",
              onClick: () => focusNode(e.to),
              children: [
                e.trigger,
                " \u2192 ",
                e.label ?? "untitled",
                " \u2192",
                " ",
                nodeById.get(e.to)?.title ?? e.to
              ]
            },
            mwEdgeId(e.from, e.trigger, e.to, i)
          ))
        ] }) : /* @__PURE__ */ jsx3("div", { children: "Select a node to see notes." }),
        showPositions ? /* @__PURE__ */ jsxs3("div", { className: "mw-positions", children: [
          /* @__PURE__ */ jsx3("div", { className: "mw-panel-section", children: "Positions" }),
          /* @__PURE__ */ jsx3("pre", { children: snippet })
        ] }) : null
      ] }),
      errors.length > 0 ? /* @__PURE__ */ jsxs3("div", { className: "mw-overlay", role: "alert", children: [
        /* @__PURE__ */ jsxs3("strong", { children: [
          "Flow errors (",
          errors.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx3("ul", { children: errors.map((e) => /* @__PURE__ */ jsx3("li", { children: e.message }, e.message)) })
      ] }) : null,
      picker ? /* @__PURE__ */ jsx3("div", { className: "mw-picker", style: { left: picker.x, top: picker.y }, children: picker.options.map((o) => /* @__PURE__ */ jsxs3("button", { type: "button", onClick: () => focusNode(o.to), children: [
        o.title,
        " ",
        /* @__PURE__ */ jsx3("span", { className: "mw-picker-label", children: o.label ?? "untitled" })
      ] }, o.to)) }) : null
    ] })
  ] });
}
function Wireflow(props) {
  const wrapperRef = React4.useRef(null);
  const nodeWidth = props.nodeWidth ?? MW_NODE_WIDTH;
  const maxFitZoom = props.maxFitZoom ?? MW_DEFAULT_MAX_FIT_ZOOM;
  const styleWithVars = React4.useMemo(() => {
    return {
      "--mw-node-width": `${nodeWidth}px`,
      ...props.style
    };
  }, [nodeWidth, props.style]);
  return /* @__PURE__ */ jsx3(
    "div",
    {
      ref: wrapperRef,
      className: `mw ${props.className ?? ""}`,
      style: styleWithVars,
      children: /* @__PURE__ */ jsx3(ReactFlowProvider, { children: /* @__PURE__ */ jsx3(
        CanvasInner,
        {
          flow: props.flow,
          showMinimap: props.showMinimap ?? true,
          showSearch: props.showSearch ?? true,
          showControls: props.showControls ?? true,
          edgeRouting: props.edgeRouting,
          avoidCollisions: props.avoidCollisions,
          lineHops: props.lineHops,
          arrow: props.arrow,
          triggerDots: props.triggerDots,
          nodeWidth,
          maxFitZoom,
          wrapperRef,
          onPositionsExport: props.onPositionsExport,
          onNodeSelect: props.onNodeSelect
        }
      ) })
    }
  );
}
export {
  Trigger,
  Wireflow
};
//# sourceMappingURL=index.js.map