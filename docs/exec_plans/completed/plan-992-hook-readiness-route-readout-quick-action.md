# plan-992-hook-readiness-route-readout-quick-action

## Goal

Add a read-only Hook Readiness Route Readout Quick Action so first-time beat makers and working producers can see whether the current hook section, motif density, contrast, mix support, or handoff lane should route to Arrange, Compose, Mix, Master, Deliver, or Session Brief before focusing Hook Readiness, cueing a hook loop, applying a hook fix, editing events, playing back, exporting, or changing project data.

## Scope

- Add a UI-local Hook Readiness Route Readout Quick Action that focuses the existing Hook Readiness surface without changing Hook Readiness card derivation, priority-card selection, focus result state, hook loop cue state, hook fix routing, musical events, playback, export state, project data, undo history, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Hook Readiness card to the existing direct Hook Readiness card command while retaining selected Pattern A/B/C, hook metric, destination, arrangement/hook posture, export/stem/package readiness, fix availability, audition cue, and next hook-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Hook Readiness focus, hook loop cue, hook fix, direct Hook Readiness card commands, playback, export, remote analysis, and imported-audio workflows.

## Non-Goals

- Do not change project schema, saved project files, Hook Readiness card derivation, card scoring, focus target selection, focus routing, focus result state, hook loop cue routing, hook fix behavior, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic focus, automatic cueing, automatic hook fixes, command chains, autoplay, hidden generation, sampling/imported-audio workflows, sampler devices, remote analysis, media uploads, vocal recording, lyric generation, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added `hook-readiness-route-readout-action` as a read-only Quick Action before Hook Readiness focus so the current hook section, motif, contrast, mix, or handoff lane can be reviewed without changing focus result state, hook loop state, hook fix state, playback, export, project data, or sampling scope.
- Added route labeling/result metrics/follow-up copy, Command Reference coverage, product and quality docs, and harness checks for Hook Readiness Route Readout.

## Decision Log

- 2026-06-27: Selected Hook Readiness Route Readout because hook section, motif density, contrast, mix support, and handoff posture are core beat-completion signals for both beginners and working producers, and a readout-first route reduces accidental cue/fix/edit/export actions.
