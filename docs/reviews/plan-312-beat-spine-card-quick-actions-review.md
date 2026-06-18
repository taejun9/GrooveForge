# plan-312-beat-spine-card-quick-actions review

## Summary

Plan 312 added direct Beat Spine card Quick Actions for every Setup, Drums, 808/Bass, Harmony, Melody, Sound, Arrange, and Finish card. Direct jump commands reuse the existing Beat Spine jump handler, direct apply commands reuse the existing Beat Spine apply handler, and cards without apply actions are disabled.

## QA

- Passed `python3 harness/scripts/run_qa.py`.
- Passed `npm run typecheck`.
- Passed `git diff --check`.
- Passed `python3 harness/scripts/run_quality_gate.py`.
- Passed `npm run build`.
- Passed `npm run verify`.
- Passed `npm run qa`.
- Browser smoke was attempted, but `npm run dev -- --host 127.0.0.1 --port 5336` failed with sandbox `EPERM`; the escalated retry was rejected by environment policy. No workaround was used.

## Review Findings

No blocking findings.

## Checks

- Direct card commands derive from existing `beatSpineSummary.cards`.
- Jump commands route only through `onJumpBeatSpine`.
- Apply commands route only through `onApplyBeatSpine` when `card.action` exists.
- Direct card jump commands are focus-only Quick Actions.
- Beat Spine scoring, visible card order, visible Jump/Apply behavior, project schema, playback, save/load, undo/redo, export, Handoff Pack, and Handoff Sheet behavior are preserved.
- The change does not add onboarding overlays, tutorials, macros, command chains, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Residual Risk

Interactive browser confirmation remains unverified because this environment blocks localhost dev-server binding.
