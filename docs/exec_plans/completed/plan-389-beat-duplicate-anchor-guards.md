# plan-389-beat-duplicate-anchor-guards

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for first-time composers. Keep sampling secondary.

## Goal

Make selected-note and selected-chord beat duplicate handlers enforce the same 4-step beat-grid anchor rule that their Quick Actions targets and product docs already promise.

## Non-Goals

- No project schema changes, save/load migration, playback scheduling changes, render/export changes, or new note/chord engine.
- No changes to selected-drum beat duplicate, selected-note/chord normal duplicate, copy, paste, delete, move, reset, velocity, chance, glide, length, root, quality, inversion, audition, Keyboard Capture, MIDI Input, arrangement, mixer, master, or export behavior.
- No sampling, imported audio, hidden generation, remote AI, cloud sync, analytics, accounts, plugin hosting, or payment changes.

## Context Map

- `src/ui/App.tsx`: selected-note and selected-chord beat duplicate handlers.
- `src/ui/selectedEventQuickActions.ts`: existing beat duplicate target derivation.
- `docs/quality/rules.md`: selected-note/chord edit QA boundaries.
- `harness/scripts/run_qa.py`: static expectations for source and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Keep selected-note and selected-chord beat duplicate scoped to the selected Pattern A/B/C slot.
- Duplicate only to later 4-step anchors that preserve event length and avoid same-track/same-pitch or chord-step collisions.
- Keep clipboard state, selection behavior, undoability, playback, WAV/stem/MIDI export, and manual controls unchanged.

## Implementation Plan

- [x] Inspect existing selected-note/chord beat duplicate handlers and static QA coverage.
- [x] Add handler-level 4-step anchor guards for note and chord beat duplicates.
- [x] Update quality rules and static QA expectations so the invariant is enforced.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `git diff --check`
- `npm run typecheck`
- `npm run harness:smoke`
- `npm run build`
- `npm run qa`
- `npm run verify`
- Browser/dev-server visual check if the environment allows localhost.

## QA Results

| command | result | note |
|---|---|---|
| `python3 harness/scripts/run_qa.py` | pass | Static source and quality expectations passed. |
| `python3 harness/scripts/run_quality_gate.py` | pass | Quality gate passed. |
| `git diff --check` | pass | No whitespace errors. |
| `npm run typecheck` | pass | Renderer and Electron TypeScript checks passed. |
| `npm run harness:smoke` | pass | Sample-free all-style 8-bar runtime smoke passed for 10 blueprints and 10 styles. |
| `npm run build` | pass | Production build passed; existing large-chunk warning remains. |
| `npm run qa` | pass | Static QA wrapper passed. |
| `npm run verify` | pass | Quality gate, runtime smoke, typecheck, and build passed. |
| `npm run dev -- --host 127.0.0.1 --port 5196` | blocked | Sandbox returned `listen EPERM`; escalated retry was rejected by environment policy, so no workaround was attempted. |

## Review Plan

QA completes before review starts. Review checks that note/chord beat duplicate handlers cannot accept non-anchor steps, remain selected-pattern scoped, preserve existing event fields and clipboard state, and add no sampling, hidden generation, or remote scope.

## Review Results

No findings. The selected-note beat duplicate handler now rejects non-4-step anchors for both 808 and Synth notes, and the selected-chord beat duplicate handler does the same for chord events. Existing later-step, event-length, collision, selection, clipboard, undo, playback, WAV/stem/MIDI export, sampling, and remote-scope boundaries remain unchanged.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add handler-level 4-step anchor guards for selected note and chord beat duplicate. | The command contract says beat duplicate uses 4-step anchors; enforcing it inside the handler prevents future direct calls from bypassing that rule. |
| 2026-06-19 | Reuse the existing `No beat-grid duplicate step` rejection. | The existing user-facing status already describes invalid beat-grid duplicate targets and avoids adding new UI copy. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created for selected note/chord beat duplicate anchor guard hardening. |
| 2026-06-19 | harness_builder | Added handler-level 4-step anchor guards for selected-note and selected-chord beat duplicate. |
| 2026-06-19 | repo_cartographer | Updated quality rules and static QA expectations for handler-level anchor enforcement. |
| 2026-06-19 | quality_runner | Ran QA suite; all required static, runtime, typecheck, build, QA, and verify checks passed. Dev-server binding remained blocked by sandbox policy. |
| 2026-06-19 | review_judge | Review completed with no findings. |
