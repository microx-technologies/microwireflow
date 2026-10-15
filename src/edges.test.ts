import { describe, expect, test } from "vitest";
import { MW_DASH, mwEdgeId } from "@/constants.ts";
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
});
