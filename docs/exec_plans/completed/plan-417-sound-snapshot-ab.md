# plan-417-sound-snapshot-ab

## Status

Complete

## Goal

Add UI-local Sound Snapshot A/B capture, recall, and clear controls so experienced producers can compare tone passes quickly, and beginners can safely experiment with Sound Presets, Drum Kit Pads, Sound Focus Pads, Timbre Check, and Studio controls before committing to a sound direction.

## Scope

- Capture two UI-local `SoundDesign` slots, A and B, from the current project sound state.
- Show compact slot status, tone posture, and difference/readiness labels inside Sound Designer.
- Recall a captured slot through the existing undoable project sound update path.
- Add local Quick Actions for capture, recall, and clear.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No saved project schema change, sound-asset storage, audio import, sampling, sampler tracks, waveform UI, playback scheduling change, audio rendering change, WAV/stem/MIDI export change, automatic tone correction, remote AI, remote analysis, plugin hosting, accounts, analytics, or cloud sync.

## Files

- `src/ui/App.tsx`
- `src/ui/workstationComposePanels.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-417-sound-snapshot-ab.md`
- `docs/reviews/plan-417-sound-snapshot-ab-review.md`

## Validation

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## QA Log

- Pass: `git diff --check`
- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `npm run typecheck`
- Pass: `npm run build` (existing Vite/Rolldown >500 kB chunk warning remains)
- Pass: `npm run qa`
- Pass: `npm run verify` (runtime smoke, typecheck, and build passed; existing chunk warning remains)
- Blocked: `npm run dev -- --host 127.0.0.1` failed with sandbox `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by the environment, so browser verification could not run in this session.

## Review

- No code findings after self-review.
- Sound Snapshot A/B state remains UI-local and out of project schema/localStorage.
- Capture and clear do not mutate project data; recall replaces only `project.sound` through the existing undoable update path.
- Docs and static QA now cover the Sound Snapshot A/B product boundary and sampling exclusion.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-19 | Add Sound Snapshot A/B as UI-local Sound Designer state. | A/B comparison is a core producer workflow and gives beginners a reversible way to explore tone without adding schema or sampling scope. |
| 2026-06-19 | Recall only the captured `SoundDesign` through undoable project updates. | Keeps manual editing, undo, save/load, playback, and export contracts intact while making tone passes recoverable. |

## Progress

- [x] Created `codex/plan-417-sound-snapshot-ab` worktree.
- [x] Inspect Mix Snapshot and Sound Designer patterns.
- [x] Add Sound Snapshot A/B state, derivation, UI, and commands.
- [x] Update docs/static QA.
- [x] Run validation and review.
- [x] Move plan to completed and create review mirror.
