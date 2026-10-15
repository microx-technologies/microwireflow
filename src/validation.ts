import type { Flow } from "@/types.ts";

export type FlowErrorKind =
  | "duplicate-node-id"
  | "unknown-node"
  | "unknown-trigger"
  | "duplicate-trigger"
  | "unknown-positions-key";

export type FlowError = {
  kind: FlowErrorKind;
  message: string;
};

export function validateFlowIds(flow: Flow): FlowError[] {
  const errors: FlowError[] = [];
  const seen = new Set<string>();
  for (const node of flow.nodes) {
    if (seen.has(node.id)) {
      errors.push({
        kind: "duplicate-node-id",
        message: `duplicate node id "${node.id}"`,
      });
    }
    seen.add(node.id);
  }
  flow.edges.forEach((edge, i) => {
    if (!seen.has(edge.from)) {
      errors.push({
        kind: "unknown-node",
        message: `edge #${i} ${edge.from}:${edge.trigger} -> ${edge.to}: unknown source node "${edge.from}"`,
      });
    }
    if (!seen.has(edge.to)) {
      errors.push({
        kind: "unknown-node",
        message: `edge #${i} ${edge.from}:${edge.trigger} -> ${edge.to}: unknown destination node "${edge.to}"`,
      });
    }
  });
  if (flow.positions) {
    for (const key of Object.keys(flow.positions)) {
      if (!seen.has(key)) {
        errors.push({
          kind: "unknown-positions-key",
          message: `positions key "${key}" matches no node id`,
        });
      }
    }
  }
  return errors;
}

export function validateTriggers(
  flow: Flow,
  registries: Record<string, Record<string, number>>,
): FlowError[] {
  const errors: FlowError[] = [];
  const nodeIds = new Set(flow.nodes.map((n) => n.id));
  for (const [nodeId, counts] of Object.entries(registries)) {
    for (const [triggerId, count] of Object.entries(counts)) {
      if (triggerId === "") {
        errors.push({
          kind: "duplicate-trigger",
          message: `trigger with empty id in node "${nodeId}"`,
        });
      } else if (count > 1) {
        errors.push({
          kind: "duplicate-trigger",
          message: `duplicate trigger id "${triggerId}" in node "${nodeId}" (${count} renders)`,
        });
      }
    }
  }
  flow.edges.forEach((edge, i) => {
    if (!nodeIds.has(edge.from)) {
      return;
    }
    const registry = registries[edge.from];
    if (registry === undefined) {
      return;
    }
    if (edge.trigger === "" || registry[edge.trigger] === undefined) {
      errors.push({
        kind: "unknown-trigger",
        message: `edge #${i} ${edge.from}:${edge.trigger} -> ${edge.to}: unknown trigger id "${edge.trigger}" in node "${edge.from}"`,
      });
    }
  });
  return errors;
}
