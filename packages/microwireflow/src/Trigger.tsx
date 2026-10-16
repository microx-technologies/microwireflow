import { Handle, Position } from "@xyflow/react";
import * as React from "react";
import {
  MW_EMPTY_TRIGGER_HANDLE_ID,
  MW_SOURCE_HANDLE_LEFT_SUFFIX,
  MW_SOURCE_HANDLE_RIGHT_SUFFIX,
} from "@/constants.ts";
import { TriggerRegistryContext } from "@/triggerRegistry.ts";
import type { TriggerProps } from "@/types.ts";

export function Trigger(props: TriggerProps) {
  const reg = React.useContext(TriggerRegistryContext);
  const register = reg?.register;

  React.useEffect(() => {
    if (!register) {
      return;
    }
    return register(props.id);
  }, [register, props.id]);

  const handleClick = (e: React.MouseEvent) => {
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
    right: true,
  };

  return (
    // biome-ignore lint/a11y: This is just a trigger, not a button. It is not meant to be clicked.
    <span
      className={classNames.join(" ")}
      style={props.style}
      data-trigger-id={props.id}
      onClick={handleClick}
      onMouseEnter={() => reg?.onTriggerHover(reg.nodeId, props.id)}
      onMouseLeave={() => reg?.onTriggerHover(reg.nodeId, null)}
    >
      {props.children}
      <Handle
        type="source"
        position={Position.Left}
        id={`${baseId}${MW_SOURCE_HANDLE_LEFT_SUFFIX}`}
        isConnectable={false}
        className={
          "mw-trigger-handle mw-trigger-handle-left" +
          (sides.left ? " mw-trigger-handle-visible" : "")
        }
      />
      <Handle
        type="source"
        position={Position.Right}
        id={`${baseId}${MW_SOURCE_HANDLE_RIGHT_SUFFIX}`}
        isConnectable={false}
        className={
          "mw-trigger-handle mw-trigger-handle-right" +
          (sides.right ? " mw-trigger-handle-visible" : "")
        }
      />
      <Handle
        type="source"
        position={Position.Right}
        id={baseId}
        isConnectable={false}
        className="mw-trigger-handle mw-trigger-handle-right"
        style={{ opacity: 0, pointerEvents: "none" }}
      />
    </span>
  );
}
