# microwireflow

Code-first wireflow documentation for React. Wire plain TSX screen components together with declarative transition triggers and render them on an interactive canvas.

## Installation

This package is not on npm. Install from GitHub:

```bash
# pnpm
pnpm add github:microx-technologies/microwireflow#v0.1.0 @xyflow/react react react-dom

# bun
bun add github:microx-technologies/microwireflow#v0.1.0 @xyflow/react react react-dom
```


## Quick Start

### 1. Mark triggers in your screens

Wrap interactive elements (buttons, links, inputs) with `<Trigger>` and assign each an `id`:

```tsx
// screens/Login.tsx
import { Trigger } from "microwireflow";

export function Login() {
  return (
    <div className="login-screen">
      <h2>Sign In</h2>
      <input type="email" placeholder="email@example.com" />
      <Trigger id="submit">
        <button type="submit">Sign In</button>
      </Trigger>
      <Trigger id="forgot-password">
        <button type="button">Forgot Password?</button>
      </Trigger>
    </div>
  );
}
```

### 2. Define the flow

Use `defineFlow` to declare screens (`nodes`) and transitions (`edges`):

```tsx
// flows/authFlow.tsx
import { defineFlow } from "microwireflow";
import { Login } from "../screens/Login";
import { Home } from "../screens/Home";
import { ResetPassword } from "../screens/ResetPassword";

export const authFlow = defineFlow({
  nodes: [
    {
      id: "login",
      title: "Login",
      kind: "<<screen>>",
      component: <Login />,
      notes: "Authentication entry point.",
    },
    {
      id: "home",
      title: "Home",
      kind: "<<screen>>",
      component: <Home />,
    },
    {
      id: "reset",
      title: "Reset Password",
      kind: "<<screen>>",
      component: <ResetPassword />,
    },
  ],
  edges: [
    {
      from: "login",
      trigger: "submit",
      to: "home",
      label: "valid credentials",
      lineStyle: "solid",
    },
    {
      from: "login",
      trigger: "forgot-password",
      to: "reset",
      lineStyle: "dashed",
    },
  ],
});
```

### 3. Render the canvas

Import `Wireflow` and the package stylesheet:

```tsx
// App.tsx
import { Wireflow } from "microwireflow";
import "microwireflow/styles.css";
import { authFlow } from "./flows/authFlow";

export function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Wireflow flow={authFlow} />
    </div>
  );
}
```

## API Reference

### `defineFlow(config)`

Helper that type-checks and returns a `Flow` object.

```ts
function defineFlow(flow: Flow): Flow;
```

#### `FlowNode`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier for the screen node. |
| `title` | `string` | Label displayed in the node header. |
| `component` | `React.ReactNode` | The React screen component to render. |
| `kind` | `string` (optional) | Badge annotation (e.g. `"<<screen>>"`, `"<<modal>>"`, `"<<error>>"`). |
| `notes` | `string` (optional) | Footer documentation text rendered beneath the screen. |

#### `FlowEdge`

| Field | Type | Description |
|---|---|---|
| `from` | `string` | Source node `id`. |
| `trigger` | `string` | Trigger `id` within the source node. |
| `to` | `string` | Target node `id`. |
| `label` | `string` (optional) | Text displayed on the edge. |
| `lineStyle` | `"solid" \| "dashed" \| "dotted"` (optional) | Stroke style (default: `"solid"`). |
| `routing` | `"smoothstep" \| "step" \| "bezier" \| "straight"` (optional) | Edge curve type. |
| `sourceSide` | `"left" \| "right"` (optional) | Side of the source trigger to route from. |
| `targetSide` | `"left" \| "top" \| "right" \| "bottom"` (optional) | Side of target screen to connect to. |
| `avoidCollisions` | `boolean` (optional) | Route edge around obstructing screen nodes. |
| `lineHops` | `boolean` (optional) | Render bridges when edges cross each other. |

---

### `<Wireflow />`

The main diagram component. Must be placed inside a container with explicit dimensions (`width` and `height`).

| Prop | Type | Default | Description |
|---|---|---|---|
| `flow` | `Flow` | **required** | The flow definition from `defineFlow`. |
| `className` | `string` | `undefined` | Optional CSS class for the root wrapper. |
| `style` | `React.CSSProperties` | `undefined` | Inline styles for the root wrapper. |
| `showMinimap` | `boolean` | `true` | Toggles the bottom-left minimap. |
| `showSearch` | `boolean` | `true` | Toggles the search input. |
| `showControls` | `boolean` | `true` | Toggles zoom and fit-view controls. |
| `edgeRouting` | `EdgeRouting` | `"smoothstep"` | Default routing for all edges. |
| `avoidCollisions` | `boolean` | `false` | Enable obstacle-avoidance routing globally. |
| `lineHops` | `boolean` | `true` | Render jump arches when edges intersect. |
| `onPositionsExport` | `(positions, snippet) => void` | `undefined` | Callback invoked when positions are copied. |
| `onNodeSelect` | `(nodeId: string \| null) => void` | `undefined` | Callback invoked when screen selection changes. |

---

### `<Trigger />`

Attaches a named flow handle to any child element inside a screen component.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Trigger identifier matched by `FlowEdge.trigger`. |
| `children` | `React.ReactNode` | **required** | The clickable element (button, link, field). |
| `fullWidth` | `boolean` | `false` | Stretches trigger wrapper to 100% width. |
| `className` | `string` | `undefined` | Custom CSS class on the trigger wrapper. |
| `style` | `React.CSSProperties` | `undefined` | Inline styles on the trigger wrapper. |

## Canvas Features

- **Draggable Nodes & Position Persistence**: Drag screens across the canvas. Click **Copy positions** in the toolbar to copy a `positions` object snippet to paste into your `defineFlow({ ..., positions })`.
- **Auto-Layout**: Click **Auto-layout** to arrange screens automatically using ELK (Eclipse Layout Kernel).
- **Navigation & Search**: Press `Cmd+K` or `Ctrl+K` to search screens by title or ID and center the viewport on them.
- **Trigger Interactivity**: Clicking a trigger with one destination focuses that screen; clicking a branching trigger opens a target picker.
- **Image Export**: Export the current canvas layout to PNG or SVG using the toolbar buttons.

## Development

```bash
# Install dependencies
bun install

# Type-check and lint
bun run check

# Run tests
bun --filter '@microx-technologies/microwireflow' test

# Build package
bun --filter '@microx-technologies/microwireflow' build
```

## License

AGPL-3.0
