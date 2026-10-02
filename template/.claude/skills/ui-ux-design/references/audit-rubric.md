# Audit Rubric

Use this to audit one screen or the whole app before redesigning, and to prove afterwards that the
redesign improved things.

## Per-screen scorecard (0–4 each, 4 = excellent)

| Dimension | 4 looks like | Check |
| --- | --- | --- |
| **Task clarity** | Top task obvious in <3 s; one primary action | Squint test; count competing CTAs |
| **Hierarchy** | Clear levels of importance via position/weight/color | Blur screenshot; is the order right? |
| **Consistency** | Same patterns, verbs, spacing, components as other screens | Compare with the screen `project.md` says to model on |
| **Efficiency** | Frequent tasks in few steps; keyboard paths; smart defaults | Count clicks/keystrokes for the top task |
| **Feedback & states** | Loading, empty, error, success, overflow all designed | Force each state (mocked responses, long names, 0/100 rows) |
| **Error prevention & recovery** | Constrained inputs, specific errors, undo/confirm where needed | Try to break it |
| **Domain safety** | The object acted on is unambiguous; no path to a never event; history legible | domain-risk.md, and the never events in `project.md` |
| **Accessibility** | WCAG 2.2 AA checklist passes | accessibility.md |
| **Visual craft** | Aligned, rhythmic spacing, type scale, tokens only, calm color | Inspect spacing/alignment; grep for raw hex and arbitrary values |
| **Responsiveness** | Works at every viewport in `project.md` | Resize |

Total out of 40. Below 24 is a redesign candidate, 24–32 needs targeted fixes, and above 32 needs polish only.

## Finding format

Every finding uses this shape, one per line in the report:

```
[S3] Customers list — no visible primary action; "Add customer" is a ghost button identical to "Export".
     Violates: visual hierarchy, Hick's law. Fix: primary button, move Export into ⋯ menu.
     Scope: kit (Button variant usage) | screen
```

- **Severity:** S0–S4 (Nielsen). Anything that can cause one of the never events in `project.md` is **S4**.
- **Scope:** `token` (the tokens file), `kit` (shared components and the app shell) or `screen`. Fix
  token and kit issues first, since they resolve many screen findings at once.

## Whole-app audit procedure

1. **Inventory:** list every route, its primary user and its top task. Mark unfinished placeholder
   screens as deferred, not as gaps.
2. **System sweep** (once, before screens):
   - Tokens: missing semantic roles, contrast ratios of every pair in use.
   - Type scale and spacing usage: grep for arbitrary values (raw hex, one-off pixel sizes).
   - Kit coverage: which patterns are hand-rolled per screen (tables, empty states, page headers,
     section cards, stat tiles) and should be kit components.
   - App shell: nav, page header pattern, global search, role filtering, responsive behavior.
3. **Screen pass:** a scorecard and findings per screen, highest-traffic screens first.
4. **Prioritize:** sort by severity × frequency of use. Group into token/kit work first, then screens.
5. **Report:** a summary table (screen, score, S3+/S4 count), the cross-cutting system findings, and then
   a per-screen list. State what wasn't verified visually.

## After a redesign

Re-score the same screens with the same rubric. Report before → after per dimension, and list any
finding deliberately left open with its reason.
