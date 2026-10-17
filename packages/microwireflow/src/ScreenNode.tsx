import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import * as React from "react";
import {
  MW_TARGET_HANDLE_BOTTOM_ID,
  MW_TARGET_HANDLE_ID,
  MW_TARGET_HANDLE_LEFT_ID,
  MW_TARGET_HANDLE_RIGHT_ID,
  MW_TARGET_HANDLE_TOP_ID,
} from "@/constants.ts";
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
  const callbacksRef = React.useRef(callbacks);
  callbacksRef.current = callbacks;
  const countsRef = React.useRef<Record<string, number>>({});

  const register = React.useCallback(
    (triggerId: string) => {
      countsRef.current[triggerId] = (countsRef.current[triggerId] ?? 0) + 1;
      callbacksRef.current?.onRegistryChange(props.id, {
        ...countsRef.current,
      });
      return () => {
        const next = (countsRef.current[triggerId] ?? 1) - 1;
        if (next <= 0) {
          delete countsRef.current[triggerId];
        } else {
          countsRef.current[triggerId] = next;
        }
        callbacksRef.current?.onRegistryChange(props.id, {
          ...countsRef.current,
        });
      };
    },
    [props.id],
  );

  const getActiveSides = React.useCallback(
    (triggerId: string) => {
      return (
        callbacks?.getActiveSourceSides?.(props.id, triggerId) ?? {
          left: false,
          right: false,
        }
      );
    },
    [callbacks, props.id],
  );

  const registry = React.useMemo(() => {
    return {
      nodeId: props.id,
      register,
      onTriggerClick: (triggerId: string, e: React.MouseEvent) => {
        callbacksRef.current?.onTriggerClick(props.id, triggerId, e);
      },
      onTriggerHover: (nodeId: string, triggerId: string | null) => {
        callbacksRef.current?.onTriggerHover(nodeId, triggerId);
      },
      getActiveSides,
    };
  }, [props.id, register, getActiveSides]);

  const kind = flowNode.kind === "" ? undefined : flowNode.kind;
  const kindClass =
    kind === undefined
      ? ""
      : kind.includes("error")
        ? " mw-kind-error"
        : kind.includes("modal")
          ? " mw-kind-modal"
          : kind.includes("popup")
            ? " mw-kind-popup"
            : "";

  return (
    <div
      className={
        "mw-node" +
        kindClass +
        (props.selected ? " mw-selected" : "") +
        (highlighted ? " mw-highlighted" : "")
      }
    >
      <Handle
        type="target"
        position={Position.Left}
        id={MW_TARGET_HANDLE_LEFT_ID}
        isConnectable={false}
        className="mw-target-handle"
        style={{ top: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`${MW_TARGET_HANDLE_LEFT_ID}_prev`}
        isConnectable={false}
        className="mw-target-handle"
        style={{ top: "35%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`${MW_TARGET_HANDLE_LEFT_ID}_next`}
        isConnectable={false}
        className="mw-target-handle"
        style={{ top: "65%" }}
      />

      <Handle
        type="target"
        position={Position.Top}
        id={MW_TARGET_HANDLE_TOP_ID}
        isConnectable={false}
        className="mw-target-handle"
        style={{ left: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={MW_TARGET_HANDLE_ID}
        isConnectable={false}
        className="mw-target-handle"
        style={{ left: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`${MW_TARGET_HANDLE_TOP_ID}_prev`}
        isConnectable={false}
        className="mw-target-handle"
        style={{ left: "35%" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`${MW_TARGET_HANDLE_TOP_ID}_next`}
        isConnectable={false}
        className="mw-target-handle"
        style={{ left: "65%" }}
      />

      <Handle
        type="target"
        position={Position.Right}
        id={MW_TARGET_HANDLE_RIGHT_ID}
        isConnectable={false}
        className="mw-target-handle"
        style={{ top: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id={`${MW_TARGET_HANDLE_RIGHT_ID}_prev`}
        isConnectable={false}
        className="mw-target-handle"
        style={{ top: "35%" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id={`${MW_TARGET_HANDLE_RIGHT_ID}_next`}
        isConnectable={false}
        className="mw-target-handle"
        style={{ top: "65%" }}
      />

      <Handle
        type="target"
        position={Position.Bottom}
        id={MW_TARGET_HANDLE_BOTTOM_ID}
        isConnectable={false}
        className="mw-target-handle"
        style={{ left: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id={`${MW_TARGET_HANDLE_BOTTOM_ID}_prev`}
        isConnectable={false}
        className="mw-target-handle"
        style={{ left: "35%" }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id={`${MW_TARGET_HANDLE_BOTTOM_ID}_next`}
        isConnectable={false}
        className="mw-target-handle"
        style={{ left: "65%" }}
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
