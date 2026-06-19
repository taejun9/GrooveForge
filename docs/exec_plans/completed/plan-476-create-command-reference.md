# plan-476-create-command-reference

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Make direct beat composition easier to discover from the read-only Command Reference by expanding the Create section to cover existing Composer Actions, Pattern Stack, Pattern Compare, Pattern Variation, Pattern Fill, Pattern Clone, Pattern Copy/Clear, Drum Move, 808 Move, Melody Move, Chord Move, and selected-event edit command surfaces.

## Non-Goals

- Do not change Composer Action derivation, Layer Starter behavior, Pattern Stack behavior, Pattern Compare, Pattern Variation, Pattern Fill, Pattern Clone, Pattern Copy/Clear, Drum/808/Melody/Chord Move handlers, selected-event edit handlers, Keyboard Capture, MIDI Input, playback, loop scope, project schema, undo/redo history, save/load, render/export, Handoff, or Command Reference open/close behavior.
- Do not add hidden generation, command chains, auto-compose, sampling, imported audio, remote AI, accounts, analytics, cloud sync, or destructive edits.
- Do not make Command Reference execute commands; it remains static/read-only guidance.

## Context Map

- `src/ui/workstationShellPanels.tsx`: read-only Command Reference sections and rendered command map.
- `src/ui/App.tsx`: existing Create Quick Actions and Command Reference result label.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Inspect existing Create-related command labels and current Command Reference wording.
- [x] Add read-only Create entries for direct composition and selected-event editing surfaces.
- [x] Update docs and harness expectations.
- [x] Run QA, review, complete plan, and create review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should confirm the Command Reference remains read-only, documents only existing Create/direct-composition surfaces, and preserves project data, selected-event editing, playback, loop scope, undo/redo, save/load, export, Handoff, and sampling boundaries.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Expand the Command Reference Create section rather than adding another writing action. | The app already has many direct composition actions; the practical gap is discovery for beginners and fast command-map scanning for working producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make existing direct beat composition and selected-event command surfaces easier to find from the desktop command map. |
| 2026-06-20 | repo_cartographer | Added read-only Create Command Reference entries for existing direct beat composition, pattern editing, and selected-event command surfaces. |
| 2026-06-20 | harness_builder | Updated README, product, quality, and harness expectations so Create command-map coverage is enforced. |
| 2026-06-20 | quality_runner | Ran the required validation loop; all non-browser checks passed. |
| 2026-06-20 | review_judge | Reviewed the completed diff after QA and found no follow-up fixes. |

## QA Results

| command | result |
|---|---|
| `git diff --check` | passed |
| `python3 harness/scripts/run_qa.py` | passed |
| `python3 harness/scripts/run_quality_gate.py` | passed |
| `npm run typecheck` | passed |
| `npm run build` | passed with existing Vite large chunk warning |
| `npm run qa` | passed |
| `npm run verify` | passed with existing Vite large chunk warning |
| `npm run dev -- --host 127.0.0.1` | blocked by sandbox `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by environment policy |

## Review

- Command Reference now exposes the existing direct composition surface in Create: Composer Actions, Pattern Stack, Pattern Compare, Pattern Variation, Pattern Fill, Pattern Clone, Pattern Copy/Clear, Drum Move, 808 Move, Melody Move, Chord Move, and selected-event edit tools.
- The added entries are read-only command-map rows and do not route or execute commands.
- No Composer Action, pattern edit, selected-event edit, project data, playback, loop scope, undo/redo, save/load, export, Handoff, sampling, imported audio, remote AI, account, analytics, or cloud-sync behavior was changed.

## Completion Notes

plan-476 completed by expanding Create Command Reference coverage around direct beat writing and manual editing. Browser verification was not possible because the managed sandbox blocked the local dev server and the escalated retry was rejected.
