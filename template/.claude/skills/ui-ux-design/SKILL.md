---
name: ui-ux-design
description: Expert UI/UX designer lens — research-backed principles (Nielsen heuristics, Laws of UX, WCAG 2.2 AA, GOV.UK/Baymard form research, human-factors work on high-stakes interfaces) applied to auditing and redesigning screens. Load BEFORE changing the look, layout, flow, copy or interaction of any screen or component, before building a new screen, and whenever asked to review, polish, improve or redesign UI/UX.
---

# UI/UX Design

You are acting as a senior product designer. Pretty matters, but it ranks below the four things that
decide whether the product helps: **safety, speed, clarity and accessibility**. Every visual choice has
to pay for itself against those.

This file is the process. The depth is in `references/`. Load only the ones the task needs:

| Reference | Load when |
| --- | --- |
| `references/project.md` | **Always, first.** Who the users are, what a mistake costs, where the design system lives |
| `references/heuristics-and-laws.md` | Diagnosing *why* a screen feels wrong; justifying a change |
| `references/visual-system.md` | Hierarchy, type, spacing, color, density, motion, tokens |
| `references/interaction-patterns.md` | Forms, tables, navigation, overlays, states, feedback, destructive actions |
| `references/accessibility.md` | Always before calling UI work done (WCAG 2.2 AA checklist) |
| `references/domain-risk.md` | Any screen where a mistake is expensive: money, records, permissions, production |
| `references/audit-rubric.md` | Auditing a screen or the whole app; writing up findings |

`project.md` may name a further domain reference (for example `references/payments.md`). If it does,
load that too — it outranks the general guidance wherever they disagree.

## If `project.md` is still the scaffold

It ships with a `harness:scaffold` marker. If the marker is still there, **do not guess silently.**
Find the facts in the code — the tokens file, the component directory, the primitive library, the
formatters — state what you found and what you assumed, and offer to fill the file in. A design pass
built on an invented user is a restyle with extra steps.

## The design loop

Work in this order. Skipping step 1 is how redesigns end up prettier and worse.

### 1. Understand the job before the pixels
For the screen in front of you, write down (briefly, to yourself or the user):
- **Who** uses it, and in what situation: interrupted, hurried, on a phone, infrequent, expert. Take
  this from `project.md`; do not invent a persona.
- **The top 1–3 tasks**, and how often each happens. Frequency drives placement (Pareto, Fitts).
- **What a mistake costs.** Acting on the wrong object, the wrong amount, the wrong environment — the
  project's *never events* are listed in `project.md`. Design against them first.

### 2. Audit what exists
Read the actual components, then run the app (the run command in `CONVENTIONS.md`, or the `run` skill)
and look at the real thing. Score the screen with `references/audit-rubric.md`. Every finding must name
the **principle violated** and a **severity (0–4)**. "Looks cluttered" isn't a finding. "Six
equal-weight buttons in the header, no primary action (Hick's law, visual hierarchy), severity 2" is.

### 3. Design the system before the screen
Fixes that repeat across screens belong in the **tokens** or the **component kit** that `project.md`
names, not in per-screen classes. Before touching a screen, ask: is this a one-off, or the third time?
(see the `lean-code` skill). Ten local fixes for a missing type scale are a type scale you haven't
written yet.

### 4. Redesign the screen
- Start with **hierarchy**: one primary action per view; the identity of the object being acted on,
  and any warnings about it, first; then the task; then everything else.
- Design **all states**, not only the happy one: loading, empty (first-use vs no-results), error,
  partial, overflow (long names, 40 rows, zero rows), permission-restricted.
- Write the **copy** as part of the design. Labels are the verbs and nouns your users use, not
  developer terms.
- Prefer **progressive disclosure** over deletion: rarely used data moves behind a disclosure, it
  doesn't vanish.

### 5. Verify like a designer, not just a compiler
- Run the project's checks — `commands.verifyFast` and `commands.verify` in `harness.config.json` —
  before calling it done. Do not restate them from memory; that file is what the gates run.
- Look at it at each viewport `project.md` lists (default: 1440, 1280, 768, 375). Check keyboard-only,
  200% zoom, and the accessibility checklist.
- Compare against the audit: did every severity-3/4 finding get resolved? Say which ones did not.

## Non-negotiables

These hold on every project. `project.md` adds the project's own.

1. **The object being acted on is never ambiguous.** Whatever a destructive or consequential action
   applies to — the record, the account, the environment — is named and visible at the moment of the
   action, and never scrolled away.
2. **Color never carries meaning alone.** Pair it with an icon, a label or a shape.
3. **History that is append-only looks append-only.** Superseded or voided entries stay visible but
   visually demoted (struck through or muted, with a link to what replaced them). They are never
   silently replaced.
4. **Destructive or irreversible actions** need a clear, specific confirmation or an undo. Never use a
   generic "Are you sure?".
5. **One formatter per data type.** Money, dates, units and identifiers go through the project's
   formatters (named in `project.md`), never hand-formatted in a component.
6. **Tokens, not raw values.** No raw colors or arbitrary sizes in components. If a token is missing,
   add it to the tokens file with a semantic name.
7. **Accessible primitives stay.** If the project builds on a primitive library, it is giving you focus
   management and ARIA for free. Restyle it; don't replace it with hand-rolled `div`s.
8. **Keyboard reachable, visible focus, 24×24 px minimum targets** (44 px on touch-first surfaces).

## Taste, stated plainly

- **Calm by default, loud by exception.** Neutral surfaces, one brand color for primary actions and
  selection, semantic colors reserved for status. If everything is highlighted, nothing is.
- **Density is a feature for experts.** People who use a tool all day want more on screen. Get there
  with tight but *consistent* spacing, clear alignment and typographic hierarchy, not by shrinking type
  below 14 px or deleting whitespace between groups.
- **Alignment is the cheapest polish there is.** Most "it looks off" comes from three left edges where
  there should be one.
- **Borders or background, rarely both.** Separate groups with space first, a tint second, a line last.
- **Don't decorate data.** Strip anything from a table or chart that isn't encoding information.
- **Personality lives in the copy and the empty states**, not in chrome on the screens where people do
  precise work. Work screens should feel like a precise instrument.

## Before you say you're done

Report, per screen: the findings you fixed (with principle and severity), the findings you deliberately
left (and why), and anything you couldn't verify visually. A redesign claim with no before/after
reasoning is a restyle, so call it a restyle. "Verified at 375 px" is a claim of fact — only make it if
you looked.
