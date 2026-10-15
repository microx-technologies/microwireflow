import { describe, expect, test } from "vitest";
import type { ScreenNodeType } from "@/ScreenNode.tsx";
import { syncFlowNodes } from "@/syncNodes.ts";
import type { FlowNode } from "@/types.ts";

function flowNode(id: string): FlowNode {
  return { id, title: id, component: null };
}

function rfNode(
  id: string,
  x: number,
  y: number,
  highlighted = false,
  flow?: FlowNode,
): ScreenNodeType {
  return {
    id,
    type: "screen",
    position: { x, y },
    data: { flowNode: flow ?? flowNode(id), highlighted },
  };
}
describe("syncFlowNodes", () => {
  test("preserves dragged positions when highlight changes", () => {
    const login = flowNode("login");
    const home = flowNode("home");
    const prev = [
      rfNode("login", 500, 300, false, login),
      rfNode("home", 0, 0, false, home),
    ];
    const out = syncFlowNodes(
      prev,
      [login, home],
      () => ({ x: 0, y: 0 }),
      (id) => id === "login",
    );
    expect(out.map((n) => [n.id, n.position])).toEqual([
      ["login", { x: 500, y: 300 }],
      ["home", { x: 0, y: 0 }],
    ]);
    expect(out[0]?.data.highlighted).toBe(true);
    expect(out[1]?.data.highlighted).toBe(false);
  });

  test("returns same reference when nothing changed", () => {
    const login = flowNode("login");
    const prev = [rfNode("login", 5, 5, false, login)];
    const out = syncFlowNodes(
      prev,
      [login],
      () => undefined,
      () => false,
    );
    expect(out).toBe(prev);
  });

  test("seeds added ids, drops removed ids", () => {
    const prev = [rfNode("login", 500, 300)];
    const home = flowNode("home");
    const out = syncFlowNodes(
      prev,
      [flowNode("login"), home],
      (id) => (id === "home" ? { x: 42, y: 7 } : undefined),
      () => false,
    );
    expect(out.map((n) => n.id)).toEqual(["login", "home"]);
    expect(out[0]?.position).toEqual({ x: 500, y: 300 });
    expect(out[1]?.position).toEqual({ x: 42, y: 7 });
  });

  test("unknown seed falls back to origin", () => {
    const out = syncFlowNodes(
      [],
      [flowNode("a")],
      () => undefined,
      () => false,
    );
    expect(out[0]?.position).toEqual({ x: 0, y: 0 });
  });

  test("reorder preserves positions", () => {
    const a = flowNode("a");
    const b = flowNode("b");
    const prev = [rfNode("a", 1, 1, false, a), rfNode("b", 2, 2, false, b)];
    const out = syncFlowNodes(
      prev,
      [b, a],
      () => undefined,
      () => false,
    );
    expect(out.map((n) => [n.id, n.position])).toEqual([
      ["b", { x: 2, y: 2 }],
      ["a", { x: 1, y: 1 }],
    ]);
  });
});
