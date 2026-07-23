# 2026-07-24 Project Change Safety Meeting

## Context

The team reviewed the current first-run and direct-composition flow against the product invariant that a user should reach a sample-free 8-bar beat quickly without losing authored work. The live renderer is local-first and composition-led, but two controls understate how much project data they replace.

## Findings

- `Style` is presented as a compact starting-point select, but changing it immediately resets BPM, swing, sound, selected Pattern, and generated Pattern A/B/C content.
- `Start an 8-bar beat` and `Start a studio pass` remain available from the launchpad and currently replace the project without checking dirty or recovery state.
- The existing Open path already has a project replacement guard, so Starter can share the same loss-state policy without introducing accounts, remote actions, or new storage.
- The current renderer and production Electron smoke suites strongly constrain first-screen height, disclosure inventory, keyboard behavior, and focus clearance.
- Handoff Bundle metadata transparency and compact Guided note editing are valuable follow-ups but do not outrank accidental project replacement.

## Decisions

- Prioritize Style preview/apply and Starter replacement protection in plan-1518.
- Show a dedicated accessible Style confirmation dialog with current-to-target BPM, swing, sound preset, Pattern A/B/C replacement scope, and Undo guidance.
- Route the header Style select, Style Inspector quick picks, and Style Quick Actions through one preview path.
- Keep clean first-run Starter actions one-click. Require confirmation only when unsaved changes or a local recovery draft could be displaced.
- A canceled Style or Starter change must leave project, selection, playback, undo/redo, and recovery state unchanged.
- Keep all behavior local-only and preserve the direct-composition-first launchpad.

## Open Questions

- Should Handoff Pack show the exact authored metadata included in its local 11-file Bundle? Follow up separately.
- Should Guided mode expose a compact selected-note Essentials editor? Follow up separately.
- Should remaining secondary `808` wording become current Bass Voice wording? Continue as a bounded vocabulary audit.

## Follow-Ups

- Implement and validate plan-1518.
- Record Handoff metadata transparency and Guided note Essentials as the next usability candidates after project-change safety is complete.
