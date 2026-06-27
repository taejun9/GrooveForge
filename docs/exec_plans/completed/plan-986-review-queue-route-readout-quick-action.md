# plan-986-review-queue-route-readout-quick-action

## Goal

Add a read-only Review Queue Route Readout Quick Action so beginners and working producers can see whether the current top production issue should route to Compose, Arrange, Mix, Master, or Deliver before focusing the issue, applying a fix, editing notes, exporting, or changing project data.

## Scope

- Add a UI-local Review Queue Route Readout Quick Action that focuses the existing Review Queue area without changing issue derivation, priority order, fix selection, focus result state, musical events, playback, export state, project data, undo history, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Review Queue priority issue to the existing direct Review Queue issue command and Review Fix command while retaining selected Pattern A/B/C, editable event counts, queue posture, fix availability, arrangement length, audition cue, and next review-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Review Queue focus, direct issue commands, Review Fix, playback, export, and direct editing commands.

## Non-Goals

- Do not change project schema, saved project files, Review Queue issue derivation, priority ordering, fix option selection, focus routing, focus result state, Review Fix application behavior, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic fixes, automatic focus, command chains, autoplay, hidden generation, sampling/imported-audio workflows, sampler devices, remote analysis, or media uploads from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a UI-local Review Queue Route Readout Quick Action that scrolls to the existing Review Queue surface, reports the current Compose, Arrange, Mix, Master, or Deliver route, and leaves focus state, Review Fix state, playback, export, undo history, saved project data, and sampling scope unchanged.
- Added route labels, result metric handling, direct issue command handoff wording, Review Fix posture wording, and follow-up cues for Review Queue Route Readout while preserving existing Review Queue focus, direct issue, and Review Fix behavior.
- Updated README, product docs, quality rules, Command Reference context, and QA harness checks so Review Queue Route Readout remains discoverable and separate from focus/fix/edit/export commands.

## Decision Log

- 2026-06-27: Selected Review Queue Route Readout because it helps users inspect the current Compose, Arrange, Mix, Master, or Deliver production-issue route before focus, fix, playback, edit, or export actions, while keeping GrooveForge direct-composition-first and sampling secondary.
