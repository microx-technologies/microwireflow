import { Trigger } from "microwireflow";

export function Login({ error }: { error?: string }) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}
    >
      <input placeholder="Email" />
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
      <Trigger id="submit">
        <button type="button">Sign in</button>
      </Trigger>
      <Trigger id="forgot">
        <button type="button">Forgot password?</button>
      </Trigger>
    </div>
  );
}
