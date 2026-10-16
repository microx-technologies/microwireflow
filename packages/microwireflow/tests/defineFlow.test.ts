import { describe, expect, test } from "vitest";
import { defineFlow } from "@/defineFlow.ts";
import type { Flow } from "@/types.ts";
import { validateFlowIds } from "@/validation.ts";

const valid: Flow = {
  nodes: [
    { id: "login", title: "Login", component: null },
    { id: "login-error", title: "Login", component: null },
    { id: "home", title: "Home", component: null },
    { id: "reset", title: "Reset", component: null },
  ],
  edges: [
    { from: "login", trigger: "submit", to: "home", label: "if valid" },
    {
      from: "login",
      trigger: "submit",
      to: "login-error",
      label: "if invalid",
    },
    { from: "login", trigger: "forgot", to: "reset" },
  ],
};

describe("validateFlowIds", () => {
  test("valid spec flow reports zero errors", () => {
    expect(validateFlowIds(valid)).toEqual([]);
  });

  test("duplicate node ids reported", () => {
    const errors = validateFlowIds({
      ...valid,
      nodes: [...valid.nodes, { id: "home", title: "Dup", component: null }],
    });
    expect(errors.some((e) => e.kind === "duplicate-node-id")).toBe(true);
  });

  test("edge to unknown node reported with edge index", () => {
    const errors = validateFlowIds({
      ...valid,
      edges: [{ from: "login", trigger: "forgot", to: "reset-missing" }],
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("edge #0");
    expect(errors[0]?.message).toContain("reset-missing");
  });

  test("unknown positions key reported", () => {
    const errors = validateFlowIds({
      ...valid,
      positions: { ghost: { x: 0, y: 0 } },
    });
    expect(errors.some((e) => e.kind === "unknown-positions-key")).toBe(true);
  });
});

describe("defineFlow", () => {
  test("returns input identity", () => {
    expect(defineFlow(valid)).toBe(valid);
  });
});

describe("constants", () => {
  test("screen dimensions and fit zoom defaults are configured", async () => {
    const { MW_DEFAULT_MAX_FIT_ZOOM, MW_NODE_WIDTH } = await import(
      "@/constants.ts"
    );
    expect(MW_NODE_WIDTH).toBe(520);
    expect(MW_DEFAULT_MAX_FIT_ZOOM).toBe(0.75);
  });
});
