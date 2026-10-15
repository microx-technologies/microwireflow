# Surface brief — demo wireflow canvas (replacement world)

Scope: `apps/demo` AuthDocs route + library chrome in `src/styles.css`,
`src/ScreenNode.tsx`, `src/Wireflow.tsx` render. Mode: Operate.

Audience / job / action: design-team authors maintain flow docs in code;
review readers trace trigger→destination connectors, search screens, read
annotations. Success = a reader follows every auth edge from its on-screen
trigger without asking the author.

Constraints: public API frozen (Trigger/Wireflow/defineFlow, peer deps,
docs-only behavior, error/empty states). microdraw-ui + Patrick Hand
binding. Library chrome stays dependency-free plain CSS; demo may use
hand-written microdraw-grammar CSS (no Tailwind dependency added).

## Direction contract

THESIS: the canvas is a cut-paper flow board, not a diagram tool: screens
are paper scraps pinned to graph paper, connectors are hand-inked strokes,
and the reader's job is tracing ink from trigger to destination. Refuses
the generic rounded-gray React Flow wrapper look entirely.

OWN-WORLD: B/W neobrutalism from the microdraw neutral theme
(bg #fff, ink #000, 2px borders, 2px hard offset shadows) on graph-paper
canvas (#fafaf7 + 24px grid); wobbly sketchy radii (base
255px 25px 225px 25px / 25px 225px 25px 255px, node card
15px 6px 12px 5px / 5px 12px 6px 15px); error/red ink reserved for the
`<<error>>` node + validation overlay; Patrick Hand as the single voice,
headings 700, body 500; tape-corner node headers; circle-J pencil
trigger handles; dashed hand-drawn edge labels with pasted-label
annotations panel.

STORY: reader scans the board, hovers a trigger to light its ink path,
clicks to ride it to the destination, searches pasted-label results,
reads the pasted annotation slip. Authors see the same world in the
demo screens (Login/Home/Reset + permission modal).

FIRST VIEWPORT: marker-tray toolbar (search left, tools right) above a
graph-paper canvas with four taped node scraps (Login entry, red-inked
error state, Home, Reset) joined by hand-inked connectors with dashed
label tags; permission-modal node proves `<<modal>>` kinds; pasted
annotation slip docked right; edge-style legend pinned bottom-left of
canvas.

FORM: assigned direction 5 of 7 (cut-paper flow board), raised with the
wayfinding challenger's decision-point junction discipline and the
orienteering challenger's course-over-terrain highlight grammar.

Seed key: d2237fc9 (assigned).
