# Microwireflow — Spec

Confirmed intent from interview (2026-10-15). Docs-only, code-first wireflow library. No prototype runner, no coupling to final app code.

## 1. Outcome

A React library where a design team writes screens as plain `.tsx` (real shadcn + tailwind-for-layout, near-zero custom CSS), declares nodes + edges in a flow file, and gets a live React Flow canvas with components rendered inside nodes and connectors anchored at the exact trigger element.

## 2. Users

- **Authors:** separate design team. Write raw components, use tailwind classes for layout only. No custom CSS expected.
- **Readers:** whoever consumes flow docs (design review / handoff).
- Decoupled from final production code by design.

## 3. Non-goals (out of scope)

- No app simulation: no routing, no state machines, no form logic. Trigger clicks only navigate/focus the diagram.
- No final-UI theming. shadcn defaults + tailwind layout only.
- No drag-state-as-source-of-truth. Code + exported positions file is truth.
- No fixed node taxonomy. `kind` is a free-form string (`<<modal>>`, `<<popup>>`, `<<screen>>`, `<<error>>`, anything).
- No edge search/filter, no README generation, no single-screen preview mode.

## 4. Authoring model

File-per-screen, imported into the flow file. Screens stay single-source; states are separate nodes with inline props. No props-in-JSON-schema — everything is real React/TSX with IDE support.

```tsx
// screens/Login.tsx — plain React, behaves like React
import { Trigger } from "microwireflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Login({ error }: { error?: string }) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Input placeholder="Email" />
      {error ? <p>{error}</p> : null}
      <Trigger id="submit">
        <Button>Sign in</Button>
      </Trigger>
      <Trigger id="forgot">
        <button type="button">Forgot password?</button>
      </Trigger>
    </div>
  );
}
```

```tsx
// flows/auth.tsx — the only place wiring lives
import { defineFlow } from "microwireflow";
import { Login } from "../screens/Login";
import { Home } from "../screens/Home";

export const authFlow = defineFlow({
  nodes: [
    { id: "login", title: "Login", kind: "<<screen>>", component: <Login />, notes: "Entry point." },
    { id: "login-error", title: "Login", kind: "<<error>>", component: <Login error="Bad credentials" />, notes: "Error state, same file." },
    { id: "home", title: "Home", kind: "<<screen>>", component: <Home /> },
  ],
  edges: [
    { from: "login", trigger: "submit", to: "home", label: "if valid", lineStyle: "solid" },
    { from: "login", trigger: "submit", to: "login-error", label: "if invalid", lineStyle: "dashed" },
    { from: "login", trigger: "forgot", to: "reset", label: undefined, lineStyle: "dotted" },
  ],
});
```

```tsx
// docs page
import { Wireflow } from "microwireflow";
import { authFlow } from "../flows/auth";

export function AuthDocs() {
  return <Wireflow flow={authFlow} />;
}
```

## 5. Schema

```ts
type LineStyle = "solid" | "dashed" | "dotted"; // rendered as React Flow strokeDasharray variants

type FlowNode = {
  id: string;            // unique within flow, referenced by edges
  title: string;         // node header title
  kind?: string;         // free-form, e.g. "<<modal>>". Rendered as badge/caption. No closed enum.
  component: React.ReactNode; // inline JSX so prop-sets are trivial: <Login error="..." />
  notes?: string;        // per-screen annotation, shown in annotations panel
};

type FlowEdge = {
  from: string;          // node id
  trigger: string;       // Trigger id inside source screen
  to: string;            // node id
  label?: string;        // condition / description ("if valid")
  lineStyle?: LineStyle; // default "solid"
};

type Flow = {
  nodes: FlowNode[];
  edges: FlowEdge[];
  positions?: Record<string, { x: number; y: number }>; // exported, editable, re-importable
};
```

Rules:

- `defineFlow()` validates at call time (dev): duplicate node ids, edge referencing unknown node, edge referencing unknown trigger id → throw/warn loudly (error overlay + console listing every bad edge). Never silently drop a line.
- `kind` MUST NOT affect behavior; display only.
- `lineStyle` affects edge stroke only.

## 6. Components (public API)

- `<Trigger id="...">{children}</Trigger>` — anchor wrapper used inside screens. Renders children unchanged plus a React Flow source `Handle` keyed by `id`. MUST NOT restyle children, MUST NOT intercept clicks except for diagram focus/picker behavior. Duplicate `Trigger` ids within one screen render are a dev-time error.
- `<Wireflow flow={flow} />` — the canvas. Owns React Flow instance, layout, search, minimap, export, annotations panel, trigger interactions.
- `defineFlow(flow: Flow): Flow` — identity + validation helper. Gives a single place for type errors and dev-time ref checks.

## 7. Rendering

- Live renderer: each node renders its `component` live inside the canvas node (real shadcn components, interactive-looking but app-inert).
- Node chrome: header with `title` + `kind` badge, body with scaled (?) live component. Scale policy TBD at implementation (zoom-to-fit vs fixed width) — MUST keep trigger handles clickable at all zoom levels.
- Edge origin: the line starts at the `Trigger`'s handle inside the source node, not at the node border. Destination: node target handle.
- Edge rendering: label shown on the edge; `lineStyle` maps to solid / dashed / dotted stroke.

## 8. Interactions

- Hover a trigger or edge → highlight the connected edge(s) + endpoints.
- Click a trigger with exactly 1 outgoing edge → focus/pan to destination node (React Flow `focus` / `fitView` on target).
- Click a trigger with N > 1 outgoing edges (branch, e.g. submit → success vs error) → floating selector at cursor listing destinations (title + label), click one to focus it.
- Click a node → select it, show its notes in the annotations panel.
- No navigation state, no simulated app behavior beyond focus.

## 9. Layout

- Initial layout provided by a layout engine (dagre/elk-style layered layout as default guess — final choice at implementation).
- Manual arrangement allowed by dragging nodes.
- "Export current state": button/callback serializes `{ [nodeId]: { x, y } }` as importable TS/JSON the user pastes back into `positions` in the flow file. Positions file is editable by hand. When `positions` present, they override the engine; nodes missing from `positions` fall back to engine placement.

## 10. Required extras

- **PNG/SVG export:** toolbar button exporting current viewport (or full flow?) — scope: full flow at implementation; MUST be one click from `<Wireflow>`.
- **Minimap + fit-view:** React Flow `<MiniMap>` + `fitView` controls enabled by default.
- **Per-screen annotations panel:** side panel showing selected node's `title`, `kind`, `notes`, plus its incoming/outgoing edges (trigger id → label → destination title). Empty notes renders as explicit "No notes" state, never blank confusion.
- **Screen search:** input filtering by node `title`/`id`; Enter/click focuses matching node. No edge search.

## 11. Styling constraint

- Library ships minimal chrome CSS (node frame, header, panel, picker). Screen interiors are 100% author-owned shadcn + tailwind.
- MUST NOT require designers to write custom CSS. Tailwind utility classes for layout only.

## 12. Package shape (initial)

- `microwireflow` package: `Trigger`, `Wireflow`, `defineFlow`, types (`FlowNode`, `FlowEdge`, `Flow`, `LineStyle`).
- Peer deps: `react`, `react-dom`, `@xyflow/react` (React Flow v12+). Layout engine dep internal.
- shadcn/tailwind remain host-app concerns (screens import from host's `@/components/ui/*`), NOT bundled.

## 13. Open implementation decisions (not intent changes)

1. Node scaling policy (fixed-width nodes vs auto-size vs miniaturized preview).
2. Layout engine choice (dagre vs elk) + direction default (LR vs TB).
3. Positions export format detail (`.ts` snippet vs `.json`) and partial-override merge semantics.
4. Validation surface: throw vs `console.error` + overlay — must be loud either way.
