# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: design-team authors working code-first. They write screens as plain `.tsx` (single-source, file-per-screen, inline props for states), declare nodes + edges in one flow file, and arrange the canvas. They expect IDE support and loud dev-time validation, not a visual editor.

Secondary: flow-doc readers (design review / handoff). They scan the live canvas, follow trigger-anchored connectors, search screens, read per-screen annotations, and export PNG/SVG — all read-only.

## Product Purpose

`microwireflow` (`@microx-technologies/microwireflow`) is a React library that turns code-authored screens into live wireflow documentation: authors write real TSX screens, wire them declaratively, and readers get a live React Flow canvas with components rendered inside nodes and connectors anchored at the exact trigger element. Success = a design team maintains flow docs entirely in code with zero custom CSS, and reviewers can trace every trigger → destination without asking the authors.

## Positioning

Unlike Figma/Mermaid/plain React Flow wrappers: screens stay real, single-source React (no props-in-JSON-schema), edges originate at the exact `<Trigger>` element inside the source node (not the node border), and the canvas is deliberately docs-only — trigger clicks only focus/navigate the diagram, never simulate app behavior.

## Operating Context

Authoring: screens import UI from the host app (`@/components/ui/*`); the demo uses microdraw-ui components. Flow file declares `nodes` (id, title, free-form `kind`, inline component, notes) + `edges` (from, trigger, to, label, lineStyle) + hand-editable `positions`. Reader workflows: hover trigger/edge to highlight connections; click single-edge trigger to focus destination; branch triggers open a floating destination picker; node click shows notes + incoming/outgoing edges in the annotations panel; search by title/id; drag to arrange; export positions back into the flow file; export PNG/SVG.

## Capabilities and Constraints

Confirmed functionality: `<Trigger id>` anchor wrapper (renders children unchanged + source Handle; MUST NOT restyle/intercept except diagram focus/picker; duplicate ids in one screen are a dev-time error); `<Wireflow flow>` canvas (React Flow instance, ELK layered layout with hand positions overriding the engine, minimap + fit-view + controls, search, annotations panel with explicit "No notes" state, positions export, PNG/SVG export); `defineFlow()` identity + loud dev-time validation (duplicate node ids, edges to unknown nodes/triggers → error overlay + console listing every bad edge, never silent drops). `kind` is display-only free-form; `lineStyle` affects edge stroke only; `positions` partially overrides the engine. Peer deps: `react`, `react-dom`, `@xyflow/react` v12+. Screen interiors are 100% author-owned; library ships only minimal chrome CSS.

Binding visual constraint (user, 2026-10-15): disregard current style entirely; full visual redesign of both the library-provided chrome (nodes, edges, toolbar, search, panels, picker, overlays) and the demo app around https://github.com/microx-technologies/microdraw-ui (hand-drawn sketchy neobrutalist shadcn/Tailwind v4) with Patrick Hand as the font. No legacy style carries forward.

Explicit non-goals: no routing/state machines/form logic/simulation; no final-UI theming; no drag-state-as-source-of-truth; no edge search/filter, README generation, or single-screen preview mode.

## Brand Commitments

Library name `microwireflow`, package `@microx-technologies/microwireflow`. Visual identity is now bound to microdraw-ui: hand-crafted doodled aesthetic, organic wobbly borders, monochrome high-contrast black-and-white neobrutalism with bold brutalist drop shadows, full accessibility. Typeface: Patrick Hand. Spec source of truth: `docs/spec-microwireflow.md` (confirmed intent 2026-10-15).

## Evidence on Hand

Runnable demo at `apps/demo` (`AuthDocs.tsx` → auth flow: login / login-error / home / reset nodes; `screens/` Login, Home, Reset; `flows/auth.tsx`). Library source in `src/` (`Wireflow.tsx`, `ScreenNode.tsx`, `Trigger.tsx`, `edges.ts`, `layout.ts`, `positions.ts`, `validation.ts`, `exportImage.ts`, `styles.css`). No testimonials, customers, benchmarks, or pricing — MUST NOT fabricate any.

## Product Principles

1. Code is the source of truth — positions file + flow file override any engine guess or drag state.
2. Docs-only honesty — the canvas never pretends to run the app; triggers focus, nothing simulates.
3. Loud over silent — every bad edge id, duplicate trigger, or empty-notes state surfaces explicitly.
4. Zero author CSS — designers write TSX + layout utilities; all chrome ships with the library.
5. Traceability first — every connector must be followable from its exact on-screen trigger to its destination.

## Accessibility & Inclusion

microdraw-ui maintains full accessibility via radix/base-ui primitives; the redesign MUST preserve keyboard-reachable triggers, picker, search, and panel content. No product-specific standard beyond that was established.
