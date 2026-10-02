# Accessibility — WCAG 2.2 AA, made concrete

Target **WCAG 2.2 Level AA**. Accessibility isn't a separate pass; it's most of what "usable under
stress" means. Someone on a call with one hand free, someone in gloves, and someone on a cracked phone
in sunlight are all accessibility cases.

## The checklist (run before calling UI work done)

### Perceivable
- [ ] Text contrast **≥4.5:1**; large text (≥18.66 px bold or ≥24 px) **≥3:1** (1.4.3).
- [ ] UI component boundaries, icons that convey meaning and focus indicators **≥3:1** against neighbors
      (1.4.11).
- [ ] **Color is never the only signal** (1.4.1): status badges have text, required/error states have
      text and an icon, chart series have a pattern or a direct label.
- [ ] Content reflows at **320 px wide / 400% zoom** with no two-dimensional scrolling (1.4.10). Data
      tables and wide canvases may scroll horizontally inside their container.
- [ ] Text spacing can be increased without clipping (1.4.12). Avoid fixed heights on text containers.
- [ ] Images and meaningful icons have text alternatives; decorative icons get `aria-hidden`.
- [ ] Structure is semantic: one `h1` per page, heading levels not skipped, lists as lists, tables as
      `<table>` with `<th scope>`.

### Operable
- [ ] Everything works with the **keyboard alone**, with no traps (2.1.1, 2.1.2).
- [ ] **Visible focus** on every interactive element (2.4.7). Never remove the outline without a
      replacement (e.g. Tailwind: `focus-visible:ring-2 ring-offset-2`, never a bare `outline-none`).
- [ ] **Focus not obscured** (2.4.11, new in 2.2): sticky headers, footers and toasts must not cover the
      focused element. Add `scroll-padding-top` equal to the sticky header height.
- [ ] Focus order matches the visual order (2.4.3).
- [ ] **Target size ≥24×24 CSS px** or enough spacing (2.5.8, new in 2.2), and **44×44** on touch-first
      surfaces. Icon buttons in table rows are the usual offenders.
- [ ] **Dragging has a single-pointer alternative** (2.5.7, new in 2.2): drag-to-reorder or
      drag-to-reschedule needs a "Move to…" action as well.
- [ ] Skip link to main content; landmarks (`header`, `nav`, `main`).
- [ ] Page titles are unique and descriptive (2.4.2): "Acme Corp · Billing · ProductName".
- [ ] Link and button text makes sense out of context. No bare "Click here" or "View".
- [ ] No time limits on forms, or they can be extended.

### Understandable
- [ ] Every input has a programmatic label (1.3.1, 3.3.2). The project's form field wrapper should do
      this, so use it.
- [ ] Errors are identified in text and described with how to fix them (3.3.1, 3.3.3), and are linked via
      `aria-describedby` with `aria-invalid`.
- [ ] Legal and financial submissions are reversible, checked or confirmed (3.3.4): payments,
      agreements and voids.
- [ ] **Redundant entry** (3.3.7, new in 2.2): don't make users retype information already known in the
      flow. Prefill it or offer it.
- [ ] **Consistent help** (3.2.6, new in 2.2): help and contact links sit in the same place on every
      page.
- [ ] Consistent navigation and identification: the same icon and label mean the same thing everywhere
      (3.2.3, 3.2.4).
- [ ] No context change on focus or input alone (3.2.1, 3.2.2): a select must not navigate.
- [ ] **Accessible authentication** (3.3.8): allow paste and password managers, and use no cognitive
      puzzles.

### Robust
- [ ] Custom widgets expose name, role and value (4.1.2). If the project has a primitive library, keep
      using it, and don't rebuild menus, dialogs or tabs from `div`s.
- [ ] Status messages are announced without moving focus (4.1.3): toasts, "Saved", and result counts
      after filtering use `role="status"` / `aria-live="polite"`.

## Patterns that need special care

- **Spatial or diagrammatic widgets** (maps, seat pickers, schematics, grids of selectable cells). Each
  selectable item is a focusable button with a full accessible name. Use arrow-key navigation (roving
  tabindex) and a visible selection distinct from focus. Encode state by color *and* glyph or pattern,
  and provide an equivalent list or table view.
- **Warning banners.** Use `role="alert"` only when it appears dynamically. On page load it should be a
  clearly labeled region (`aria-label="Account warnings"`), not a shout on every navigation.
- **Calendars and schedulers.** Most calendar libraries have weak accessibility. Provide a list or
  agenda view, and make event blocks real buttons with full names ("9:30–10:00, Design review, Room 4").
- **Charts.** Provide a text summary or data table alternative, and never rely on color alone for series.
- **Dialogs and sheets.** Focus moves in on open and returns to the trigger on close; the dialog has a
  title; `Esc` closes. A good primitive library does this as long as you don't fight it.
- **Icon-only buttons** need an accessible name and a tooltip.
- **Reduced motion:** gate non-essential animation behind `prefers-reduced-motion`.

## How to verify

- Keyboard pass: put the mouse away and complete the screen's top task.
- Zoom pass: 200% and 400% browser zoom, and a 320 px viewport.
- Contrast: compute it for every token pair actually used (text on ground, muted on white, badge
  foreground on badge background). Write the ratios down when you change tokens.
- Screen reader smoke test (VoiceOver: `⌘F5`; NVDA on Windows) for headings, landmarks, form labels and
  error announcements.
- Automated checks catch ~30–40% of issues at best. Treat them as a floor, not proof.
