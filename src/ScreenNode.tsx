import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import * as React from "react";
import { MW_TARGET_HANDLE_ID } from "@/constants.ts";
import {
  ScreenNodeCallbacksContext,
  TriggerRegistryContext,
} from "@/triggerRegistry.ts";
import type { FlowNode } from "@/types.ts";

export const SCREEN_NODE_TYPE = "screen" as const;

export type ScreenNodeData = {
  flowNode: FlowNode;
  highlighted: boolean;
};

export type ScreenNodeType = Node<ScreenNodeData, typeof SCREEN_NODE_TYPE>;

export function ScreenNode(props: NodeProps<ScreenNodeType>) {
  const { flowNode, highlighted } = props.data;
  const callbacks = React.useContext(ScreenNodeCallbacksContext);
  const countsRef = React.useRef<Record<string, number>>({});

  const registry = React.useMemo(() => {
    const emit = () => {
      callbacks?.onRegistryChange(props.id, { ...countsRef.current });
    };
    return {
      nodeId: props.id,
      register: (triggerId: string) => {
        countsRef.current[triggerId] = (countsRef.current[triggerId] ?? 0) + 1;
        emit();
        return () => {
          const next = (countsRef.current[triggerId] ?? 1) - 1;
          if (next <= 0) {
            delete countsRef.current[triggerId];
          } else {
            countsRef.current[triggerId] = next;
          }
          emit();
        };
      },
      onTriggerClick: (triggerId: string, e: React.MouseEvent) => {
        callbacks?.onTriggerClick(props.id, triggerId, e);
      },
      onTriggerHover: (nodeId: string, triggerId: string | null) => {
        callbacks?.onTriggerHover(nodeId, triggerId);
      },
    };
  }, [props.id, callbacks]);

  const kind = flowNode.kind === "" ? undefined : flowNode.kind;

  return (
    <div
      className={
        "mw-node" +
        (props.selected ? " mw-selected" : "") +
        (highlighted ? " mw-highlighted" : "")
      }
    >
      <Handle
        type="target"
        position={Position.Top}
        id={MW_TARGET_HANDLE_ID}
        isConnectable={false}
      />
      <div className="mw-node-header">
        <span className="mw-node-title">{flowNode.title}</span>
        {kind ? <span className="mw-node-kind">{kind}</span> : null}
      </div>
      <div className="mw-node-body">
        <TriggerRegistryContext.Provider value={registry}>
          {flowNode.component}
        </TriggerRegistryContext.Provider>
      </div>
    </div>
  );
}
