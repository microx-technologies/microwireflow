import { Trigger } from "microwireflow";

export function Reset() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}
    >
      <h1>Reset password</h1>
      <input placeholder="Email" />
      <Trigger id="send">
        <button type="button">Send reset link</button>
      </Trigger>
    </div>
  );
}
