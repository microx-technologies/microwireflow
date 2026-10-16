---
name: microwireflow
description: A cut-paper flow board for code-first wireflow docs.
colors:
  paper: "#fffdf5"
  board: "#fbf8f1"
  ink: "#141414"
  ink-soft: "#3d3d3d"
  faint: "#6b6257"
  red: "#d92d20"
  tape: "rgb(233 213 148 / 0.85)"
  white: "#ffffff"
typography:
  headline:
    fontFamily: '"Patrick Hand", "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive'
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: '"Patrick Hand", "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive'
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.01em"
  body:
    fontFamily: '"Patrick Hand", "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: '"Patrick Hand", "Segoe Print", "Bradley Hand", "Comic Sans MS", cursive'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.2
  mono:
    fontFamily: "ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  node: "15px 6px 12px 5px / 5px 12px 6px 15px"
  card: "255px 25px 225px 25px / 25px 225px 25px 255px"
  pill: "7rem 8rem 8rem 8rem / 4rem 5rem 6rem 6rem"
  row: "8px 20px 10px 22px / 18px 10px 22px 8px"
  bubble: "50% 45% 52% 48% / 48% 52% 45% 52%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "24px"
components:
  button-chrome:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "5px 14px"
  button-chrome-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "5px 14px"
  search-field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "6px 30px 6px 14px"
    width: "230px"
  panel-edge:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    padding: "3px 0"
  picker-item:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "6px 10px"
  picker-item-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.row}"
    padding: "6px 10px"
  demo-button-default:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "8px 16px"
  demo-button-neutral:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "8px 16px"
  demo-input-themed:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "8px 12px"
  demo-card-sm:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.node}"
    padding: "16px"
---

# Design System: microwireflow

## Overview

**Creative North Star: "The Pinned Workshop Board"**

Everything looks cut out of paper, taped to a cork-desk board, and inked by hand. The library owns the chrome — board, paper scraps, tape, marker tray, pasted slips, red-inked validation — and demo authors own the screen interiors drawn inside each scrap. One handwriting face everywhere; wobble lives in radii, rotations, and hard offset shadows, never in gradients or blur.

**Key Characteristics:**
- Cut paper, taped corners, hard 2–3px offset shadows in ink.
- One handwriting voice (Patrick Hand stack) at every size.
- Hand-drawn wobble radii; nothing is ever a true rectangle or circle.
- Red ink only for errors and validation; ink everywhere else.

## Colors

Warm paper over a darker desk board, inked in near-black; red appears only where something is wrong.

### Primary
- **Workshop Ink** (#141414): Node borders, text, toolbar buttons, edge strokes, control fills on hover. The structural color of the whole board.

### Neutral
- **Scrap Paper** (#fffdf5): Node cards, toolbar, panel, picker, search dropdown, overlay. Every floating surface.
- **Desk Board** (#fbf8f1): The canvas background behind the flow; the board fills the viewport, edge to edge.
- **Soft Pencil** (#3d3d3d): Secondary text (panel edge rows at rest).
- **Faint Pencil** (#6b6257): Placeholders, picker labels, search-empty states.
- **Clean Sheet** (#ffffff): Search field, notes slip, positions block — small inserts that must read brighter than scrap paper.
- **Masking Tape** (rgb(233 213 148 / 0.85)): The two tape strips pinning each node header, with dashed torn edges.

### Named Rules (optional, powerful)
**The Red-Is-An-Alarm Rule.** The red (#d92d20) marks error-kind nodes, wavy error underlines, error slips, and the validation overlay only. It never decorates, never brands, never hovers.

## Typography

**Display Font:** Patrick Hand, shipped as the `@fontsource/patrick-hand` npm package (`latin-400.css` imported in `apps/demo/src/index.css`) and wired as the `--font-sans` theme token, with Segoe Print, Bradley Hand, Comic Sans MS, cursive fallback.
**Body Font:** Patrick Hand (same stack — one voice everywhere)
**Label/Mono Font:** ui-monospace, monospace for the positions export only

**Character:** Friendly and drafted, like labels written with a marker during a walkthrough. Weight does the hierarchy work (700 for titles and headers, 400 for everything else), never a second family.

### Hierarchy
- **Headline** (700, 22px): Screen-interior headings inside node scraps.
- **Title** (700, 19px, 0.01em tracking): Node card titles; kind pill sits beside them at 13px.
- **Body** (400, 16px, 1.35): Board chrome, panel text, trigger labels, toolbar, picker rows, search field, edge labels at 14px.
- **Label** (400, 14px): Picker subtitles, legend rows, panel kind tag.
- **Mono** (400, 13px): Positions export block only.

### Named Rules (optional)
**The One-Voice Rule.** Every word on the board — nodes, toolbar, panel, picker, edges, controls — sets in the Patrick Hand stack. The only exception is literal code (the positions export), which sets in monospace.

## Layout

The renderer is fullscreen: `AuthDocs` returns a bare `<Wireflow>` with no header, footer, or page wrapper, and the library `.mw` frame fills the viewport (`height: 100dvh`) with no page surround. Inside, a single framed column: marker-tray toolbar across the top, flow canvas in the middle, annotation slip docked to the right, legend card pinned bottom-left, validation overlay centered on top. Node scraps are 520px paper cards (customizable via `--mw-node-width` or the `nodeWidth` prop). Rhythm is 8px gaps in toolbars and headers, 10–14px card padding, 12–16px panel padding. At 390px the frame keeps its height and scrolls/zooms internally — chrome wraps (toolbar) rather than overflowing.

## Elevation & Depth

Depth is cut-paper layering: flat paper lifted by hard offset shadows in solid ink. There is no blur, no gradient, no translucency except the tape strips.

### Shadow Vocabulary (if applicable)
- **Card lift** (`box-shadow: 3px 3px 0 0 #141414`): Node scraps, search dropdown, overlay (in red for the overlay). The default resting lift.
- **Small lift** (`box-shadow: 2px 2px 0 0 #141414`): Search field, toolbar buttons, legend, minimap, controls frame, panel notes, demo inputs and buttons.
- **Selected lift** (`box-shadow: 5px 5px 0 0 #141414` with `outline-offset: 3px`): Selected nodes (solid outline) and hover-highlighted nodes (dashed outline).
- **Red lift** (`box-shadow: 3px 3px 0 0 #d92d20`): Validation overlay, drawn in red ink instead of ink.
- **Press** (`translate: 1px 1px` + shadow shrinks to 1px; active state collapses to 0): Toolbar buttons and demo buttons physically press into the board.

### Named Rules (optional)
**The Flat-By-Press Rule.** Surfaces rest lifted and press down on hover/active (shadow shrinks, element translates 1–2px). Shadows never grow on hover; nothing floats higher.

## Shapes

Every corner wobbles — radii are deliberately uneven pairs so no edge reads as machine-cut. Cards and nodes use the node wobble (15px 6px 12px 5px / 5px 12px 6px 15px); pills, search, toolbar buttons, and demo controls use the sketch ellipse (255px 25px 225px 25px / 25px 225px 25px 255px); kind tags use the pill wobble; trigger handles and the search-clear bubble use the pebble (50% 45% 52% 48% / 48% 52% 45% 52%). Borders are always 2px solid ink (red for errors). Small rotations sell the pasted feel: picker +0.5deg, search results −0.4deg, legend −0.6deg, panel notes +0.4deg, overlay −0.5deg with centered translate, tape strips −6deg / +5deg.

## Components

### Buttons
Toolbar buttons are white paper chips with 2px ink borders in the sketch-ellipse radius (255px 25px …), small lift shadow, 5px 14px padding at 16px. Hover and active press inward (translate + shrinking shadow) rather than glowing.
- **Shape:** Sketch ellipse (255px 25px 225px 25px / 25px 225px 25px 255px)
- **Primary:** White fill, ink text and border, small lift
- **Hover / Focus:** Press 1px, shadow shrinks to 1px; focus-visible gets a 3px ink outline; search field focus deepens to the full card lift
- **Secondary / Ghost / Tertiary (if applicable):** Panel edge rows are the ghost: borderless, left-aligned, soft-pencil text that inks up with a wavy underline on hover

### Chips (if used)
- **Style:** Node kind pill: paper fill, 2px ink border, pill-wobble radius, 1px 10px padding at 13px beside the 19px title
- **State:** Modal kind doubles the border (4px double rule); popup kind dashes it; error kind re-inks pill and title underline in red

### Cards / Containers
Node scraps are 520px paper cards with 2px ink borders, node-wobble radius, and card-lift shadow. Headers carry a 2px ink rule with two masking-tape strips pinned at −6deg/+5deg. Selected adds a solid 2px outline at 3px offset with selected lift; hover-highlight swaps the outline to dashed.
- **Corner Style:** Node wobble (15px 6px 12px 5px / 5px 12px 6px 15px)
- **Background:** Scrap paper (#fffdf5)
- **Shadow Strategy:** Card lift at rest; selected lift with outline offset
- **Border:** 2px solid ink; header divider 2px solid ink
- **Internal Padding:** Header 10px 14px 8px; body 12px 14px 14px

### Inputs / Fields
The toolbar search is a white sketch-ellipse field (230px wide, 6px 30px 6px 14px) with small-lift shadow; the pebble clear button sits inside at right. Results drop below in a paper card rotated −0.4deg; rows are borderless with row-wobble radius that flood ink with paper text on hover/keyboard-active, including the faint subtitle.
- **Style:** White fill, 2px ink stroke, sketch-ellipse radius
- **Focus:** Shadow deepens from small lift to card lift; no glow, no color shift
- **Error / Disabled:** No disabled state; the empty state is centered faint text at 15px

### Navigation
The marker-tray toolbar is a paper strip with a 2px ink bottom rule, 10px 14px padding, 8px gaps, wrapping. It hosts the search, a flex spacer, and chrome buttons; the branch picker and search results float from it as rotated paper cards with ink-flood hover rows.

### Flow Nodes
Paper scraps with taped headers (see Cards). Kind modifiers: modal renders the kind pill in a 4px double rule; popup dashes the pill border; error keeps the card inked but underlines the title in a red waveline (2px, 4px offset) and re-inks the kind pill in red text and border.

### Triggers
Trigger labels wrap their demo-owned button text; a 13px pebble handle floats at the label's right edge (−7px offset) in paper with a 2px ink border and 1px shadow. Hovering the trigger floods the handle to solid ink — the affordance that an edge starts here. Full-width variants stretch the row to 100%.

### Edges
Hand-inked connectors: 2.25px ink strokes with round caps; edge labels set in the hand stack at 14px on paper pills with 1.5px ink outline. Hovered or selected edges thicken to 3.5px (two-edge hover highlight lights the in/out pair). The legend card pinned bottom-left decodes the vocabulary.

### Panel
The pasted annotation slip is a 290px paper column with a 2px ink left rule. Title at 21px/700, kind tag as a dashed pill in soft ink, notes on a white card rotated +0.4deg, section headers in 17px bold with wavy ink underlines, edge rows as ghost buttons, positions export in 13px mono on a white lifted card.

### Branch Picker
A fixed paper sign-band card (min 240px, +0.5deg rotation, 4px lift, node-wobble radius, 6px padding). Rows are borderless row-wobble buttons that flood ink on hover, carrying the destination name plus a faint label that flips to paper on hover.

### Validation Overlay
A red-inked slip centered on top of the board (−0.5deg rotation, red 2px border, red lift, node-wobble radius, 10px 16px padding, max 82% wide / 44% tall, scrollable). Message in red at 15px; the issue list beneath sets in ink.

### Native Canvas Furniture
XYFlow controls, minimap, and attribution are re-skinned into board grammar: paper fills, 2px ink borders, node-wobble radii, small-lift shadows; control buttons flood ink on hover with paper glyphs; attribution is faint hand text on transparent.

### Demo Screen Interiors (demo-owned, not library chrome)
What design teams author inside each scrap, composed from real microdraw-ui registry components installed via the shadcn CLI (`src/components/ui/button`, `card`, `input`, `dialog`, plus `src/lib/utils`) on the neutral theme (Tailwind v4 via `@tailwindcss/vite`, tokens in `apps/demo/src/index.css`): Login pairs a themed Input plus default/neutral Buttons (email field, primary sign-in, neutral forgot-password); Home, Reset, and LogoutConfirm compose sm Cards (header/title/description/content/footer) with themed Inputs and default/neutral Buttons; the error slip is a themed utility div, not a component. The authoring reference is this registry composition — the old `demo.css` is deleted.

## Do's and Don'ts

### Do:
- **Do** keep every board word in the Patrick Hand stack; reserve monospace for literal code (the positions export).
- **Do** use uneven wobble radii and 2px ink borders on every floating surface.
- **Do** press buttons inward on hover/active (shrink the shadow, translate 1–2px).
- **Do** confine red to errors and validation; let ink carry everything else.
- **Do** pair each hovered trigger with its highlighted edge pair (two-edge ink response).
- **Do** respect the write boundary: library chrome in `src/styles.css`, screen interiors in demo-owned registry components (`apps/demo/src/components/ui`, `apps/demo/src/screens`).

### Don't:
- **Don't** introduce a second typeface, a blur shadow, a gradient, or a true rectangle/circle — the board has none.
- **Don't** flood rows with anything but ink (hover states are always solid ink → paper text).
- **Don't** invent new error colors or success greens; the system has exactly one alarm ink.
- **Don't** copy this contract into source files; it lives here and in `.impeccable/design.json`, not as comments in shipped CSS.
- **Don't** restyle screen interiors from the library — node bodies are demo-owned; the library styles only the scrap around them.
