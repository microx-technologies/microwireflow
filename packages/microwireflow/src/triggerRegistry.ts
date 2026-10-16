import * as React from "react";

export type TriggerRegistry = {
  nodeId: string;
  register: (triggerId: string) => () => void;
  onTriggerClick: (triggerId: string, e: React.MouseEvent) => void;
  onTriggerHover: (nodeId: string, triggerId: string | null) => void;
  getActiveSides?: (triggerId: string) => { left: boolean; right: boolean };
};
export type TriggerCounts = Record<string, number>;

export function sameCounts(
  a: TriggerCounts | undefined,
  b: TriggerCounts,
): boolean {
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

export type ScreenNodeCallbacks = {
  onRegistryChange: (nodeId: string, snapshot: Record<string, number>) => void;
  onTriggerClick: (
    nodeId: string,
    triggerId: string,
    e: React.MouseEvent,
  ) => void;
  onTriggerHover: (nodeId: string, triggerId: string | null) => void;
  getActiveSourceSides?: (
    nodeId: string,
    triggerId: string,
  ) => { left: boolean; right: boolean };
};

export const ScreenNodeCallbacksContext =
  React.createContext<ScreenNodeCallbacks | null>(null);
export const TriggerRegistryContext =
  React.createContext<TriggerRegistry | null>(null);
