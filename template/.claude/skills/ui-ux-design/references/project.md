<!-- harness:scaffold — delete this line when you have filled the file in. The selftest warns while it
     is here, because a half-filled scaffold is worse than no file: the skill follows whatever it says. -->

# Project — what the design skill needs to know about this product

**What this file is for:** the rest of this skill is general design expertise. This is the only part
that knows *your* product. **Delete any section you cannot fill honestly** — an empty section makes the
skill derive the answer from the code; a section of placeholder text makes it follow the placeholder.

Commands are deliberately not here. They live in `harness.config.json` and `CONVENTIONS.md`, and a third
copy is a copy that drifts.

---

## Users and contexts

<!-- One row per kind of user. The "context" column is the valuable one: the situation they are in when
     they use the screen, because that is what changes the design. -->

| Role | Context | Design implications |
| --- | --- | --- |
|  |  |  |

_e.g. | Support agent | On a call, customer waiting, 60+ tickets a day | Keyboard-first, global search,
the customer's identity and plan always visible, no modal on the hot path |_

---

## What a mistake costs

<!-- The never events: the errors this product must make hard or impossible, no matter how rare. Name
     the object and the failure. These become severity-4 findings automatically. -->

- <!-- e.g. Refunding the wrong order — two orders from the same customer look identical in the list. -->

---

## The design system

| Thing | Where / what |
| --- | --- |
| Tokens (color, type, spacing) | <!-- e.g. src/styles/tokens.css --> |
| Component kit | <!-- e.g. src/components/ui/ --> |
| Form field wrapper | <!-- the one component that wires label, hint, error and aria-describedby --> |
| Primitive library | <!-- e.g. Radix, React Aria, Headless UI — or none --> |
| Icons | <!-- one set, one stroke width --> |
| Toasts / notifications | <!-- the library, and whether it uses a live region --> |
| Formatters | <!-- money, dates, units, identifiers — the functions every screen must use --> |
| Font | <!-- the family, if it is fixed --> |

**Model new screens on:** <!-- the ONE existing screen that is genuinely representative. -->

---

## Viewports

<!-- The widths that matter, and which real device each stands for. Delete to use the defaults
     (1440, 1280, 768, 375). -->

| Width | Stands for |
| --- | --- |
|  |  |

---

## Project non-negotiables

<!-- Rules on top of the ones in SKILL.md. Each must be checkable on a screen. -->

1. <!-- e.g. The customer banner stays visible on every customer screen; a redesign may restyle it but
        never hide or collapse it. -->

---

## Tone

<!-- How the product should sound and feel, per surface if they differ. One line each. -->

---

## Domain reference

<!-- Optional. If this product has a field with its own human-factors rules (health, payments, aviation,
     infrastructure), write them up in references/<domain>.md using domain-risk.md as the method, and
     name the file here. The skill loads it on every screen and lets it outrank the general guidance. -->
