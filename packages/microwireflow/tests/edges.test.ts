import { describe, expect, test } from "vitest";
import {
  MW_DASH,
  MW_DEFAULT_EDGE_ROUTING,
  MW_EDGE_BORDER_RADIUS,
  MW_EDGE_OFFSET,
  mwEdgeId,
} from "@/constants.ts";
import {
  createBuiltInEdge,
  createFlowEdge,
  resolveSourcePort,
  resolveTargetPort,
} from "@/edges.ts";
import { currentPositionsFromNodes, serializePositions } from "@/positions.ts";

describe("positions", () => {
  test("serializePositions golden: sorted keys, rounded", () => {
    expect(
      serializePositions({
        home: { x: 420.4, y: 0 },
        login: { x: 0, y: 120.6 },
      }),
    ).toBe(
      "positions: {\n  home: { x: 420, y: 0 },\n  login: { x: 0, y: 121 },\n}",
    );
  });

  test("currentPositionsFromNodes rounds floats", () => {
    expect(
      currentPositionsFromNodes([{ id: "a", position: { x: 1.6, y: 2.4 } }]),
    ).toEqual({ a: { x: 2, y: 2 } });
  });
});

describe("edges", () => {
  test("dash mapping: solid/dashed/dotted", () => {
    expect(MW_DASH.solid).toBeUndefined();
    expect(MW_DASH.dashed).toBe("6 4");
    expect(MW_DASH.dotted).toBe("1 5");
  });

  test("parallel edge ids unique", () => {
    expect(mwEdgeId("login", "submit", "home", 0)).toBe("login:submit->home#0");
    expect(mwEdgeId("login", "submit", "login-error", 1)).not.toBe(
      mwEdgeId("login", "submit", "home", 0),
    );
  });

  test("default edge routing is smoothstep", () => {
    expect(MW_DEFAULT_EDGE_ROUTING).toBe("smoothstep");
  });

  test("createBuiltInEdge configures smoothstep with borderRadius and offset", () => {
    const edge = createBuiltInEdge("smoothstep", {
      id: "e1",
      source: "login",
      sourceHandle: "submit",
      target: "home",
      targetHandle: "__target",
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      interactionWidth: 8,
      style: {},
    });
    expect(edge.type).toBe("smoothstep");
    if (edge.type === "smoothstep") {
      expect(edge.pathOptions?.borderRadius).toBe(MW_EDGE_BORDER_RADIUS);
      expect(edge.pathOptions?.offset).toBe(MW_EDGE_OFFSET);
    }
  });

  test("createBuiltInEdge configures step with offset", () => {
    const edge = createBuiltInEdge("step", {
      id: "e2",
      source: "login",
      sourceHandle: "submit",
      target: "home",
      targetHandle: "__target",
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      interactionWidth: 8,
      style: {},
    });
    expect(edge.type).toBe("step");
    if (edge.type === "step") {
      expect(edge.pathOptions?.offset).toBe(MW_EDGE_OFFSET);
    }
  });

  test("createBuiltInEdge configures bezier and straight", () => {
    const bezier = createBuiltInEdge("bezier", {
      id: "e3",
      source: "login",
      sourceHandle: "submit",
      target: "home",
      targetHandle: "__target",
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      interactionWidth: 8,
      style: {},
    });
    expect(bezier.type).toBe("default");

    const straight = createBuiltInEdge("straight", {
      id: "e4",
      source: "login",
      sourceHandle: "submit",
      target: "home",
      targetHandle: "__target",
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      interactionWidth: 8,
      style: {},
    });
    expect(straight.type).toBe("straight");
  });

  test("resolveTargetPort resolves left for rightward flow", () => {
    const res = resolveTargetPort({ x: 0, y: 100 }, { x: 500, y: 100 });
    expect(res.side).toBe("left");
    expect(res.handleId).toBe("__target_left");
  });

  test("resolveTargetPort resolves right for reverse horizontal flow", () => {
    const res = resolveTargetPort({ x: 500, y: 100 }, { x: 0, y: 100 });
    expect(res.side).toBe("right");
    expect(res.handleId).toBe("__target_right");
  });

  test("resolveTargetPort resolves top when source is above", () => {
    const res = resolveTargetPort({ x: 100, y: 0 }, { x: 100, y: 350 });
    expect(res.side).toBe("top");
    expect(res.handleId).toBe("__target_top");
  });

  test("resolveTargetPort resolves bottom when source is below", () => {
    const res = resolveTargetPort({ x: 100, y: 350 }, { x: 100, y: 0 });
    expect(res.side).toBe("bottom");
    expect(res.handleId).toBe("__target_bottom");
  });

  test("resolveTargetPort respects explicit targetSide", () => {
    const res = resolveTargetPort(
      { x: 0, y: 100 },
      { x: 500, y: 100 },
      "bottom",
    );
    expect(res.side).toBe("bottom");
    expect(res.handleId).toBe("__target_bottom");
  });

  test("resolveTargetPort distributes slots across multiple incoming edges", () => {
    const port0 = resolveTargetPort(
      { x: 0, y: 100 },
      { x: 500, y: 100 },
      "left",
      0,
    );
    const port1 = resolveTargetPort(
      { x: 0, y: 100 },
      { x: 500, y: 100 },
      "left",
      1,
    );
    const port2 = resolveTargetPort(
      { x: 0, y: 100 },
      { x: 500, y: 100 },
      "left",
      2,
    );

    expect(port0.handleId).toBe("__target_left");
    expect(port1.handleId).toBe("__target_left_prev");
    expect(port2.handleId).toBe("__target_left_next");
  });

  test("resolveSourcePort resolves right for rightward flow", () => {
    const res = resolveSourcePort(
      "submit",
      { x: 0, y: 100 },
      { x: 500, y: 100 },
    );
    expect(res.side).toBe("right");
    expect(res.handleId).toBe("submit__right");
  });

  test("resolveSourcePort resolves left for leftward flow", () => {
    const res = resolveSourcePort(
      "logout",
      { x: 500, y: 100 },
      { x: 0, y: 100 },
    );
    expect(res.side).toBe("left");
    expect(res.handleId).toBe("logout__left");
  });

  test("resolveSourcePort resolves left when target is to the left in partially overlapping horizontal range", () => {
    const res = resolveSourcePort(
      "action",
      { x: 200, y: 100 },
      { x: 100, y: 400 },
    );
    expect(res.side).toBe("left");
    expect(res.handleId).toBe("action__left");
  });

  test("resolveSourcePort resolves right when target is to the right in partially overlapping horizontal range", () => {
    const res = resolveSourcePort(
      "action",
      { x: 100, y: 100 },
      { x: 200, y: 400 },
    );
    expect(res.side).toBe("right");
    expect(res.handleId).toBe("action__right");
  });

  test("resolveSourcePort respects explicit sourceSide", () => {
    const res = resolveSourcePort(
      "action",
      { x: 500, y: 100 },
      { x: 0, y: 100 },
      "right",
    );
    expect(res.side).toBe("right");
    expect(res.handleId).toBe("action__right");
  });

  test("resolveSourcePort handles empty trigger id with default fallback", () => {
    const res = resolveSourcePort("", undefined, undefined);
    expect(res.side).toBe("right");
    expect(res.handleId).toBe("__empty__right");
  });

  test("createFlowEdge configures smart types when avoidCollisions is true", () => {
    const edge = createFlowEdge("smoothstep", {
      id: "e-smart",
      source: "login",
      sourceHandle: "submit",
      target: "home",
      targetHandle: "__target_left",
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      interactionWidth: 8,
      style: {},
      avoidCollisions: true,
    });
    expect(edge.type).toBe("smart_smoothstep");
  });

  test("createFlowEdge falls back to built-in when avoidCollisions is false", () => {
    const edge = createFlowEdge("smoothstep", {
      id: "e-builtin",
      source: "login",
      sourceHandle: "submit",
      target: "home",
      targetHandle: "__target_left",
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      interactionWidth: 8,
      style: {},
      avoidCollisions: false,
    });
    expect(edge.type).toBe("smoothstep");
  });
});
