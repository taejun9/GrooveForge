# plan-016-pattern-tools

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족할 수 있고, 작곡을 처음 해보는 사람도 사용하기 쉬운 데스크탑 앱으로 완성시켜줘. 최근에는 GrooveForge가 샘플링 앱이 아니라 직접 비트를 작곡하고 사운드를 설계하는 all-genre beat workstation이어야 한다고 다시 정렬했다.

## Goal

Add fast Pattern A/B/C workflow tools so users can copy the selected pattern into another slot and clear the selected pattern without leaving the event-based composition model. This helps working producers derive variations quickly and helps beginners start from a known pattern, duplicate it, and safely experiment.

## Non-Goals

- No sampling, audio import, chopping, sampler tracks, or audio warping.
- No drag-and-drop piano roll, MIDI input, or AI generation.
- No changes to arrangement block semantics or exported file format beyond persisted pattern state already supported.

## Context Map

- `src/ui/App.tsx`: selected Pattern A/B/C UI, pattern editing state updates, project status messages.
- `src/domain/workstation.ts`: pattern slots, clone helper, project state types.
- `src/styles.css`: pattern tab and panel layout.
- `README.md`: current MVP surface description.
- `docs/product/product.md`: MVP and roadmap language for pattern workflows.
- `docs/quality/rules.md`: pattern QA gates.
- `harness/scripts/run_qa.py`: static expectations for app, docs, and domain support.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-016-pattern-tools` and `.worktree/plan-016-pattern-tools` for git repository work.
- Preserve the composition-first invariant: Pattern tools operate on drums, 808, synth, and chord events, not imported audio assets.

## Implementation Plan

- [x] Add UI commands for copying the selected pattern into the other two Pattern A/B/C slots.
- [x] Add a UI command for clearing the selected pattern to an empty drum/bass/melody/chord event set.
- [x] Keep selected notes and status messages coherent after copy/clear operations.
- [x] Update README/product/quality docs and QA static expectations.
- [x] Verify with automated QA and browser interaction.

## QA Plan

- `python3 harness/scripts/run_qa.py`
  - Passed.
- `python3 harness/scripts/run_quality_gate.py`
  - Failed once because this active plan still contained the template word marker; passed after replacing it with a concrete pending note.
- `npm run typecheck`
  - Passed.
- `npm run build`
  - Passed.
- `npm run qa`
  - Passed.
- `npm run verify`
  - Passed.
- Browser check at the local Vite app:
  - Passed. Copied Pattern A to Pattern B, verified B changed from 37 to 31 events and became selected, cleared Pattern B to 0 events, started and stopped playback, checked no browser console errors, and verified the new buttons did not overflow their panel.

## Review Plan

QA completes before review starts. Review checks that the commands preserve Pattern A/B/C independence, keep arrangement/export semantics intact, avoid sampling-first drift, and are discoverable for beginners without blocking fast producer workflows.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add explicit copy-to-slot and clear-selected commands before richer piano-roll gestures. | Pattern duplication is a small, high-leverage workflow improvement for variation writing and is easier for beginners than manual recreation. |
| 2026-06-15 | Treat clearing a pattern as empty event data, not deletion of the pattern slot. | Arrangement blocks and project files already depend on stable Pattern A/B/C slots. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for pattern workflow tools. |
| 2026-06-15 | harness_builder | Added Pattern A/B/C copy and clear commands, status messages, styles, docs, and QA expectations. |
| 2026-06-15 | quality_runner | Ran automated QA plus browser copy/clear/playback checks. |

## Completion Notes

Pattern A/B/C now has copy-to-slot and clear-selected commands. Copying the selected pattern clones drum, 808, melody, and chord event data into the target slot and selects that slot for immediate variation editing. Clearing a pattern resets its event data without deleting the Pattern A/B/C slot, so arrangement blocks and project files remain structurally stable.
