import { Handle, Position } from "@xyflow/react";
import * as React from "react";
import { MW_EMPTY_TRIGGER_HANDLE_ID } from "@/constants.ts";
import { TriggerRegistryContext } from "@/triggerRegistry.ts";

export function Trigger(props: { id: string; children: React.ReactNode }) {
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

  return (
    // biome-ignore lint/a11y: This is just a trigger, not a button. It is not meant to be clicked.
    <span
      className="mw-trigger"
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
