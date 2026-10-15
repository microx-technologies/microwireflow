import { Trigger } from "microwireflow";

export function Home() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}
    >
      <h1>Home</h1>
      <Trigger id="logout">
        <button type="button">Log out</button>
      </Trigger>
    </div>
  );
}
