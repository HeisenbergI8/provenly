# Visual System — hierarchy, type, space, color, density, motion

The tokens file and component kit are named in `project.md`. **Change the system there, not in
screens.** The numbers below are defaults for a dense, work-focused product; where `project.md` or an
existing, consistent system says otherwise, follow it.

## Hierarchy is the whole game

A user should be able to answer "what is this, what matters, what do I do" in under 3 seconds. Test it
by squinting or blurring the screenshot: the 2–3 most important things should still be the most visible.

Hierarchy levers, in order of preference (cheapest and most robust first):
1. **Position & grouping:** top-left reads first (F/Z patterns for scanning) in left-to-right languages.
2. **Weight & color:** a semibold heading in the primary text color next to regular body in a muted
   color beats a huge heading. De-emphasizing secondary text is often better than emphasizing primary.
3. **Size:** use it last and sparingly.

Rules of thumb from expert practice (Refactoring UI and similar):
- **Not every label needs to be a label.** "Quantity: 3" → "3 items" when context is obvious.
- **Labels are secondary, values are primary.** In detail views, label in muted small text, value in
  the primary text color.
- **Emphasize by de-emphasizing.** Make competitors quieter instead of making the hero louder.
- **One primary button per view.** Secondary actions are outline/ghost; tertiary are links.
- **Destructive is not automatically primary.** A red "Delete" is only solid on its own confirmation step.

## Typography

- One family, ideally the one already loaded. Hierarchy comes from size and weight, not new fonts.
- **Use a modular scale.** For a dense app: 12 / 13 / 14 (body) / 16 / 18 / 20 / 24 / 30. That's six
  to eight steps, defined once. Never type an arbitrary one-off size (e.g. Tailwind's `text-[15px]`).
- Body text on work screens: **14 px minimum** for data and **16 px** for reading and forms (16 px
  inputs also stop iOS from zooming on focus).
- Weights: 400 body, 500 for UI labels and table headers, 600 for headings. Skip 700+ except for numbers
  that need to pop.
- **Line height:** ~1.5 for body, ~1.2–1.3 for headings, tighter for large display.
- **Measure:** 45–75 characters for prose. Data tables are exempt.
- **Tabular figures** (`font-variant-numeric: tabular-nums`) for money, times, counts and IDs in columns.
- Sentence case everywhere. All caps only for tiny overline labels, with letter-spacing.
- Never use color alone to mark a heading. Pair it with weight or size.

## Spacing and layout

- **4 px base, 8 px rhythm.** Allowed steps: 4, 8, 12, 16, 24, 32, 48, 64. Avoid 20-ish in-betweens and
  arbitrary values.
- **Spacing encodes relationships.** Within a group < between groups < between sections. If two gaps
  are equal, the relationship is ambiguous.
- **Start with too much whitespace, then remove.** It's easier to tighten a generous layout than to
  rescue a cramped one.
- **One alignment axis per region.** Labels, inputs, headings and buttons share left edges. Numbers align
  right (decimal-aligned). Text aligns left. Center only short, standalone content (empty states).
- **Content width:** cap forms at ~640 px; full width is for tables, calendars and canvases. Form fields
  stretched across 1440 px are a classic tell of an unconsidered layout.
- **Grid:** a 12-column grid at desktop. Detail pages often work as main (8) + aside (4), where the aside
  holds summary info, warnings and next actions.
- **Responsive, by content rather than device:** collapse the aside below the main content, turn tables
  into stacked cards on narrow screens only when columns can't be prioritized, and keep the primary action
  reachable (sticky footer on mobile forms).

## Color

- **Semantic over literal.** Components use roles — `primary`, `muted-foreground`, `destructive`,
  `warning` — never a palette step like `blue-700`. Add missing roles as tokens; the usual gaps are
  `success`, `info`, `warning` and a `surface-raised`.
- **Each status color needs a full set:** a foreground (text and icon, ≥4.5:1 on its background), a
  subtle background, and a border. Define them as triples.
- **Proportion ~60/30/10:** neutral ground and surfaces / text / brand and status accents.
- **Reserve saturated red and orange for real meaning** (errors, destructive actions, the domain's
  critical warnings). Decorative use of those hues trains people to ignore them (alarm fatigue).
- **Contrast:** text ≥4.5:1 (≥3:1 for 18 px+ or 14 px bold); UI component boundaries and focus indicators
  ≥3:1 against adjacent colors. Muted text is the usual offender, so check it on every ground it sits on.
- **Greys with a hint of the brand hue** look intentional; pure greys next to a saturated brand look
  dirty. Keep new neutrals on the same hue as the existing ones.
- **Dark mode:** if it is out of scope, keep tokens semantic anyway so it stays possible.

## Depth, borders, radius

- Elevation tells you *what's on top*. Use roughly three levels: flat (page), raised (cards, using a subtle
  border or a 1 px shadow), overlay (popover, dialog and sheet, using a stronger shadow plus a backdrop).
- Pick one way to separate cards from the ground (white card on a tinted ground, or a border on a white
  ground) and don't stack the other on top.
- Radius: one scale. Small elements (badges, checkboxes) get smaller radii and large containers get the
  base radius. Nested radius = outer radius − padding.

## Iconography

- One icon set, one stroke width, 16 px inline with text and 20 px standalone.
- **An icon-only button needs an accessible name and a tooltip.** Only universally known icons (close,
  search, more) can go unlabeled visually.
- Icons support labels; they rarely replace them. A bare icon for a domain concept is a riddle.

## Density

- Offer **comfortable** (default) and **compact** row heights for tables: around 48 px / 36 px rows.
  Never go below 32 px on a clickable row.
- Density comes from removing redundancy (repeated labels, double borders, decorative padding), not from
  shrinking type.

## Motion

- **Purposeful only:** orient (where did this sheet come from), give feedback (it saved), or show a
  relationship (an expanded row). No decoration.
- **Durations:** 100–150 ms for micro feedback (hover, press), 200–250 ms for overlays entering, faster
  exit than enter. Use ease-out for entering and ease-in for exiting.
- Animate `opacity` and `transform` only.
- **Respect `prefers-reduced-motion`.**
- Skeletons over spinners for content areas taking >300 ms. A spinner only appears inside the element
  being acted on (the button).

## Data visualization

If a `dataviz` skill is available, load it before touching a chart. Key points: direct labels over
legends, no 3D, no dual axes without strong reason, a consistent color per series across screens, and
reference ranges shown as context behind the data rather than as competing series.
