# Domain Risk — designing where a mistake is expensive

Some fields have their own human-factors literature because UI errors in them cause real harm. The most
developed is health IT (NIST IR 7804 / 7804-1 on EHR usability, NIST IR 7865 on critical use risks, and
the research on interruptive alert design). Its findings transfer almost unchanged to any product where
acting on the wrong thing is costly: payments, admin consoles, infrastructure, legal, logistics.

This file is the **method**. The project's own never events are in `project.md`; a field with enough
rules of its own gets a `references/<domain>.md` written with the template at the end.

## The three critical use risks (design against these first)

The EHR research finds three failure classes that recur. Renamed, they are:

| Failure class | What it is | Examples outside health |
| --- | --- | --- |
| **1. Acting on the wrong object** | The action lands on a different record than the one the user meant | Wrong customer refunded, wrong tenant edited, deploy to production instead of staging, email to the wrong list |
| **2. The same fact shown two ways** | Inconsistent formats, ambiguous units, truncated values, computed values that look typed | `03/12` read as two different dates, a price shown with and without tax on two screens, a truncated account ID that matches two accounts |
| **3. Information absent where the decision happens** | It was entered, but it is not on screen at the moment it matters | An outstanding balance not visible at checkout; a "this server is in production" flag only on the settings page |

### 1. Identification
- **A persistent identity banner** on every screen in an object's context: its name, a **second
  identifier** (an ID, a date, an owner), and any warnings attached to it. It stays visible while
  scrolling.
- **Two identifiers, always.** Names collide — family members, companies with similar names, two
  servers called `web-1` in different regions. Warn when the collision is likely.
- **Names are formatted the same way everywhere**, one rule app-wide. Never truncate the part that
  disambiguates; truncate the rest with a tooltip if you must.
- **Switching context is unmistakable.** When the current object changes (search, "next"), the banner
  updates, the page title updates and the scroll resets.
- **Environment is identity too.** Where production and non-production look alike, mark the
  environment persistently and differently — not with color alone.
- Avoid two objects of the same kind open side by side unless it's an explicit compare feature.

### 2. Consistency and integrity
- **One format per data type**, everywhere: unambiguous dates (`12 Mar 2026`, not `03/12`), one time
  convention, money through one formatter, identifiers in one canonical form.
- **Units always shown.**
- **Never truncate consequential text silently.** Use an ellipsis plus expand, and show the full text in
  any print or export view.
- **Computed values look computed** (balances, totals, scores): they're labeled, come with an "as of"
  where relevant, and are never presented as editable.
- **Append-only history is legible:** corrected entries stay in place, muted and struck through, with a
  "Corrected on 12 Mar by A. Reyes: reason" link to the replacement. The current truth is visually
  dominant.

### 3. Information where the decision happens
- The fact that should stop an action is visible **at the moment of the action**, not only on an
  overview tab.
- When recording something, show what came before it (the last entry, the plan it belongs to)
  alongside.
- Put a number where the person acts on it: a balance at the two points where someone collects it, a
  quota at the point of the request that would exceed it.

## Warnings without warning fatigue

In health IT systems, users override ~90% of interruptive alerts, because most are false or low value.
Every unnecessary warning devalues the necessary ones — in any product.

**Tier warnings by severity × accuracy:**

| Tier | Example | Presentation |
| --- | --- | --- |
| Critical (interruptive) | The action will destroy data or move money irreversibly, and the system is confident it is wrong | Modal at the moment of action; the corrective action as a button; overriding requires a reason |
| Warning (non-interruptive, prominent) | The object has a standing condition that should change how it is handled | Persistent banner or badge in context; no click required |
| Informational (passive) | Something is due soon, a profile is incomplete | Subtle badge or indicator; discoverable, not pushed |

**Writing a warning:**
- Short sentence-case title. **2–3 sentences (≤ ~30 words):** why it fired, the risk, and the action.
- Bold at most twice. No ALL CAPS, which reduces comprehension.
- At most four colors in the warning system: red (act now), orange (urgent), yellow or blue
  (informational). **Always add an icon**, never color alone.
- Offer the **corrective action directly** ("Remove the duplicate charge"), not just "OK".
- Overrides capture a reason, and dismissals state their scope and duration ("Hide for this session").

The tokens for critical warnings are reserved for critical warnings. Don't reuse them for "unsaved
changes" or marketing banners.

## Users and contexts

The same screen fails differently for different people. For each role in `project.md`, ask what its
context does to the design:

| Context | Design implications |
| --- | --- |
| Hands busy, interrupted, time-boxed | Big targets (≥44 px), minimal typing (pickers, templates), resumable state, glanceable status |
| High volume, repetitive | Keyboard-first, global search, the core task in ≤3 actions, the work queue as home |
| Infrequent, configuration | Clarity over speed, explanations inline, safe defaults, a preview of a setting's effect |
| Members of the public, mobile, possibly anxious | Plain language (~grade 6–8), 16 px+ text, one task per page (GOV.UK pattern), reassurance, privacy cues |

## Tone

- **Work screens:** precise, neutral and calm, like a well-made instrument.
- **Public-facing screens:** warmer, with more personality in empty states and greetings, but still
  credible. People are trusting you with something that matters to them.
- **Copy:** use the users' words, keep it short and active, and never blame the user. "We couldn't save
  the payment. Check your connection and try again." Avoid "Error 500" and "Invalid".

## Writing your own domain reference

When a field has rules this file can't know, write `references/<domain>.md` and name it in `project.md`.
Keep it to what changes a design decision:

1. **The never events**, each with the object, the failure and the screen it happens on.
2. **The conventions users already know** — notation, layouts, color codes the field has standardized.
   Breaking one is a Jakob's-law violation that a general designer will not spot.
3. **The canonical formats** for the field's data types.
4. **The domain-specific widgets** and how each must behave (selection, state encoding, the accessible
   equivalent).
5. **The flows** in the order the work actually happens, and where unfinished work must surface.
6. **The tone**, per surface.

Cite sources where they exist. A rule with a reason gets followed; a rule without one gets argued with.
