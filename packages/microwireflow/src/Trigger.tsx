import { Handle, Position } from "@xyflow/react";
import * as React from "react";
import { MW_EMPTY_TRIGGER_HANDLE_ID } from "@/constants.ts";
import { TriggerRegistryContext } from "@/triggerRegistry.ts";
import type { TriggerProps } from "@/types.ts";

export function Trigger(props: TriggerProps) {
  const reg = React.useContext(TriggerRegistryContext);

  React.useEffect(() => {
    if (!reg) {
      return;
    }
    return reg.register(props.id);
  }, [reg, props.id]);

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
        position={Position.Right}
        id={props.id === "" ? MW_EMPTY_TRIGGER_HANDLE_ID : props.id}
        isConnectable={false}
        className="mw-trigger-handle"
      />
    </span>
  );
}
