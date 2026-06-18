# plan-390-selected-event-previous-beat-duplicate

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue toward a desktop beat workstation that satisfies working producers while staying easy for beginners.

## Goal

Add Quick Actions that duplicate the active selected note, drum hit, or chord to the previous empty 4-step beat-grid anchor in the selected Pattern A/B/C slot. This complements the existing next-beat duplicate commands so users can quickly build call-and-response, fill earlier beat anchors, or reinforce groove/harmony without leaving command search.

## Non-Goals

- Do not add automatic pattern generation, hidden reharmonization, macros, command chains, autoplay, or auto-export.
- Do not change existing next-beat duplicate behavior.
- Do not change project schema, save/load, playback, render/export, mixer/master, or sampling scope.
- Do not introduce sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/selectedEventQuickActions.ts`: derives selected-event Quick Actions, availability, labels, and command handlers.
- `src/ui/App.tsx`: owns selected-event handlers and command result copy.
- `docs/product/product.md`: product feature contract for direct selected-event composition.
- `docs/quality/rules.md`: selected note/drum/chord edit invariants and QA rules.
- `harness/scripts/run_qa.py`: static project/product/Quick Actions expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep GrooveForge centered on direct beat composition; sampling remains optional extension scope only.
- Route each mutating command through existing explicit undoable selected-event insertion/edit paths.

## Implementation Plan

- [x] Add previous-beat duplicate target derivation for selected note, drum hit, and chord Quick Actions.
- [x] Add handlers that copy selected note, drum hit, and chord data to a previous 4-step anchor while preserving event fields and selection behavior.
- [x] Add command result labels for previous-beat duplicate commands through the existing selected-event result path.
- [x] Update product/quality docs and harness expectations for the new selected-event commands.
- [x] Run QA before review, then move the plan to completed and create a review mirror.

## QA Plan

| command | result | notes |
|---|---|---|
| `git diff --check` | pass | No whitespace errors. |
| `python3 harness/scripts/run_qa.py` | pass | Product, quality, and command expectations include previous beat duplicate commands. |
| `npm run typecheck` | pass | Renderer and Electron TypeScript passed. |
| `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate passed. |
| `npm run harness:smoke` | pass | 10/10 sample-free blueprints and 10/10 supported style profiles passed. |
| `npm run build` | pass | Build passed with the existing large chunk warning for `index-04E3BkXD.js`. |
| `npm run qa` | pass | QA wrapper passed. |
| `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed. |
| `npm run dev -- --host 127.0.0.1 --port 5197` | blocked | Sandbox returned `listen EPERM`; escalated retry was rejected by policy, so browser visual verification was not attempted. |

## Review Plan

QA completes before review starts. Review will inspect that previous-beat duplicate commands are scoped to the selected Pattern A/B/C slot, preserve event fields and UI-local clipboards, block occupied/invalid targets, remain undoable through existing handlers, and do not change playback/export/sampling scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add previous-beat duplicate as Quick Actions only. | It improves fast direct composition for both beginners and producers while reusing the established selected-event command surface and avoiding a larger UI redesign. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created from clean main in `codex/plan-390-selected-event-previous-beat-duplicate`. |
| 2026-06-19 | harness_builder | Added previous-beat selected note, drum, and chord duplicate Quick Actions plus docs and QA expectations. |
| 2026-06-19 | quality_runner | Completed QA; browser/dev-server check was blocked by localhost `listen EPERM` and rejected escalation. |
| 2026-06-19 | review_judge | Reviewed the diff after QA and found no blocking issues. |

## Completion Notes

Selected note, drum, and chord Quick Actions now include previous beat duplicate commands. The commands target the nearest earlier empty 4-step anchor in the selected Pattern A/B/C slot, preserve event fields and UI-local clipboards, and route through existing undoable selected-event duplicate paths. QA passed; browser verification was blocked by localhost binding policy.
