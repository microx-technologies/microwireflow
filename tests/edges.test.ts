import { describe, expect, test } from "vitest";
import {
  MW_DASH,
  MW_DEFAULT_EDGE_ROUTING,
  MW_EDGE_BORDER_RADIUS,
  MW_EDGE_OFFSET,
  mwEdgeId,
} from "@/constants.ts";
import { createBuiltInEdge } from "@/edges.ts";
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
});
