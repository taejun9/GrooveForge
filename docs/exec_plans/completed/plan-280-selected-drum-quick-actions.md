# plan-280-selected-drum-quick-actions

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Keep sampling secondary.

## Scope

Add Quick Actions for existing selected-drum hit edit tools:

- Copy and paste the selected/copied drum hit through the existing drum clipboard handlers.
- Raise/lower selected hit velocity through the existing selected-drum velocity handler.
- Raise/lower selected hit chance through the existing selected-drum probability handler.
- Nudge selected hit timing earlier/later through the existing selected-drum timing handler.
- Raise/lower selected hat repeat through the existing selected hat-repeat handler when the selected hit is a hat.

These commands should make groove pocket correction faster after Drum Foundation, Groove Feel, Drum Accent, or manual step entry, while keeping beginner-discoverable drum editing in the command palette.

## Non-Goals

- Do not add new drum movement rules, new drum generation, hidden macros, multi-hit editing, or arrangement writing.
- Do not change drum grid UI behavior, selected-drum pocket readouts, copy/paste behavior, undo history semantics, playback, render/export, MIDI export, Handoff, snapshots, save/load migration, or project schema.
- Do not add sampling, imported audio, audio input, plugin hosting, remote AI, accounts, analytics, or cloud sync.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public MVP/runtime feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for selected-drum Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Add selected-drum Quick Actions that route only through existing selected-drum handlers.
- [x] Keep copy UI-local and keep mutating commands on existing undoable drum update paths.
- [x] Update README, product docs, quality rules, and static QA expectations.
- [x] Run QA before review.
- [x] Move this plan to completed and create a review mirror.

## Validation

Run:

```sh
python3 harness/scripts/run_qa.py
python3 harness/scripts/run_quality_gate.py
npm run harness:smoke
npm run typecheck
npm run build
npm run qa
npm run verify
git diff --check
```

Browser smoke if environment allows localhost: Quick Actions shows selected-drum edit commands when a drum hit is selected, disables copy/pocket commands without an active selected hit, disables paste when the drum clipboard is empty, and selected-drum actions reuse existing drum editor behavior without adding hidden generation.

## Review

QA completes before review starts. Review checks that commands are explicit, selected-drum scoped, route only through existing handlers, preserve copy/paste and undo semantics, and avoid sampling/cloud/remote scope.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add selected-drum Quick Actions after selected-note/chord Quick Actions. | Notes and chords are command-editable now; drum pocket correction is the remaining core Compose edit surface that benefits from command search. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Plan created for selected-drum Quick Actions. |
| 2026-06-18 | harness_builder | Added selected-drum velocity, chance, timing, hat repeat, copy, and paste Quick Actions through existing selected-drum handlers; updated docs and static QA expectations. |
| 2026-06-18 | quality_runner | Initial `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed after wiring fixes. |
| 2026-06-18 | quality_runner | Full QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run typecheck`, `npm run build`, `npm run qa`, `npm run verify`, and `git diff --check`. Browser smoke was blocked by `listen EPERM` on `127.0.0.1:5305`; escalated localhost retry was rejected by environment policy, so no workaround was used. |
| 2026-06-18 | review_judge | Reviewed selected-drum Quick Actions for explicit selected-hit scope, existing-handler routing, UI-local copy result handling, undoable paste/edit paths, no schema/playback/export drift, and no sampling/remote/cloud scope; no findings. |

## Outcome

Completed. Selected drum hits can now be edited from Quick Actions for velocity, chance, microtiming, hat repeat, copy, and paste while reusing the existing selected-drum handlers and local clipboard behavior. The completion review mirror is `docs/reviews/plan-280-selected-drum-quick-actions-review.md`.
