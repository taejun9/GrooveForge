# plan-288-tap-tempo-quick-action

## Goal

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying approachable for first-time composers. Expose the existing Tap Tempo pulse through Quick Actions so users can capture a felt BPM from command search without leaving the transport workflow.

## Scope

- Add one Quick Actions Transport command for the existing Tap Tempo button behavior.
- Route the command only through the current `tapProjectTempo` handler.
- Show current BPM and tap-pulse behavior in command detail and result feedback.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- Do not add new BPM math, tempo automation, beat detection, audio input, recording, count-in, tap-tempo history persistence, command chains, or macros.
- Do not change manual BPM input, Tap Tempo button/readout behavior, Tempo Nudge Pads, Metronome, playback, save/load, snapshots, render/export, MIDI export, Handoff, Style Quick Picks, Key Retarget, or Beat Blueprint behavior.
- Do not add sampling, imported audio, hidden generation, remote AI, plugin hosting, accounts, analytics, or cloud sync.

## Files

- `src/ui/App.tsx`: Quick Actions wiring and result labels.
- `README.md`: public feature list.
- `docs/product/product.md`: product capability description.
- `docs/quality/rules.md`: quality rules for Tap Tempo Quick Actions.
- `harness/scripts/run_qa.py`: static QA expectations.

## Plan

- [x] Create task branch and worktree.
- [x] Create active exec plan.
- [x] Inspect existing Tap Tempo handler, readout, and Quick Actions patterns.
- [x] Add Tap Tempo Quick Action using the existing tap handler.
- [x] Update docs and static QA.
- [x] Run QA before review.
- [x] Move this plan to completed and create a review mirror.
- [ ] Merge to `main`, push, delete branch, and remove worktree.

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

Browser smoke if environment allows localhost: Quick Actions shows a Tap Tempo command, running it uses the same tap pulse path as the Tap button, repeated explicit command runs update the Tap Tempo readout and eventually commit a bounded BPM through existing undoable project history, playback/metronome still follow project BPM, the project remains sample-free, and no console errors occur.

## Review

QA completed before review.

Findings: no blocking issues found. Tap Tempo Quick Action is an explicit Transport command, routes only through `tapProjectTempo`, treats command runs as UI-local tap captures until the existing delayed commit path applies a bounded BPM, and keeps tap history out of saved project data. The change does not add new BPM math, audio input, beat detection, tempo automation, hidden generation, sampling, imported audio, remote AI, accounts, analytics, cloud sync, macros, or command chains.

Residual risk: browser smoke could not run because the sandbox rejected local Vite listen on `127.0.0.1:5312` with `EPERM`, and the escalated retry was rejected by environment policy. CLI coverage passed, including sample-free all-style runtime smoke.

QA results:

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run harness:smoke` passed for 10/10 sample-free Beat Blueprints and 10/10 supported style profiles.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite large-chunk warning for `dist/assets/index-D7pTBUG7.js` at 515.31 kB.
- `npm run qa` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Browser smoke blocked: `npm run dev -- --host 127.0.0.1 --port 5312` failed with `listen EPERM`; escalated retry was rejected by environment policy.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Expose the existing Tap Tempo pulse through Quick Actions instead of adding new tempo logic. | The app already has bounded explicit Tap Tempo; command search improves discoverability for beginners and gives producers a fast keyboard/search path without changing timing contracts. |

## Status Log

| Date | Agent | Status |
|---|---|---|
| 2026-06-18 | project_lead | Started plan-288 from `main` in `.worktree/plan-288-tap-tempo-quick-action`. |
| 2026-06-18 | repo_cartographer | Confirmed Tap Tempo uses UI-local tap history plus delayed bounded BPM commit through existing undoable project history. |
| 2026-06-18 | harness_builder | Added a Transport Quick Action that routes only through `tapProjectTempo` and treats tap pulses as UI-local captures. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py` and `npm run typecheck` passed after implementation. |
| 2026-06-18 | quality_runner | Full CLI QA passed; browser smoke blocked by sandbox localhost bind policy. |
| 2026-06-18 | review_judge | Reviewed after QA; no blocking findings. |
| 2026-06-18 | doc_gardener | Moved plan to completed and created `docs/reviews/plan-288-tap-tempo-quick-action-review.md`. |
