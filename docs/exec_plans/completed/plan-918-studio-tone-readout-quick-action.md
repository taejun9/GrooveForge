# plan-918-studio-tone-readout-quick-action

## Goal

Expose Studio Tone baseline capture and largest-drift reset through Quick Actions and Command Reference so beginners and working producers can find manual tone recovery from command search without making sampling, imported audio, or automation the product center.

## Scope

- Lift Studio Tone baseline/result state out of the Sound panel so the app can share it with Quick Actions while keeping it UI-local.
- Add Quick Actions for Studio Tone Baseline, Studio Tone Drift, and direct Studio Tone reset commands that reuse the existing explicit Sound Designer update path.
- Add result metrics, Command Reference row context, product docs, QA rules, and harness checks for the new command paths.

## Non-Goals

- Do not change project schema, saved project files, playback, Web Audio synthesis, MIDI, WAV/stem/MIDI export, Handoff, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add hidden tone correction; all capture/reset behavior must remain explicit user actions.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added shared `studioToneTools` derivation helpers for Studio Tone baselines, drift summaries, and reset results so Sound panel controls and Quick Actions use the same UI-local baseline state.
- Lifted Studio Tone baseline/result state into `App.tsx`, preserved named-preset baseline refresh behavior, and wired Sound panel Capture/Reset controls through shared handlers.
- Added Quick Actions Studio Tone Baseline, Studio Tone Drift, and direct per-control reset commands with result metrics and follow-up cues.
- Added Command Reference Sound rows plus README, product, quality, and harness coverage for Studio Tone command search while preserving sample-free direct beat composition scope.

## Decision Log

- 2026-06-27: Selected Studio Tone Quick Actions because baseline capture/reset already exists in the Sound panel, but command search still centers preset/focus/snapshot/FX paths and does not expose the manual tone recovery workflow.
- 2026-06-27: Lifted baseline state to `App.tsx` instead of duplicating it in Quick Actions so the panel and command search share one UI-local baseline without storing it in project files.
