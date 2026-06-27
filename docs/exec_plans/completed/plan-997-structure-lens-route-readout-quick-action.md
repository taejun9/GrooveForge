# plan-997-structure-lens-route-readout-quick-action

## Goal

Add a read-only Structure Lens Route Readout Quick Action so first-time beat makers and working producers can inspect the current Target Fit, Section Coverage, Hook Contrast, or Energy Arc arrangement route before running Structure Lens actions, Beat Map actions, Next Move, Workflow Navigator jumps, Workflow Spotlight focus, playback, edits, exports, or project data changes.

## Scope

- Add a UI-local Structure Lens Route Readout Quick Action that focuses the existing Structure Lens surface without changing Structure Lens derivation, signal scoring, action suggestions, Next Move routing, project data, playback, export state, undo history, remote behavior, or sampling scope.
- Add route labeling, result metrics, and follow-up copy that map the current Structure Lens priority signal to the existing Structure Lens action route while retaining selected Delivery Target, selected Pattern A/B/C, signal status/context, target fit, section coverage, hook contrast, energy arc, arrangement length, audition cue, and next structure-route check.
- Update product docs, quality rules, Command Reference coverage, and harness checks so the route readout remains distinct from Structure Lens actions, Beat Map actions, Next Move actions, Workflow Navigator jumps, Workflow Spotlight focus, playback, export, remote analysis, and imported-audio workflows.

## Non-Goals

- Do not change project schema, saved project files, Structure Lens derivation, Structure Lens action derivation, Beat Map derivation, Next Move derivation, Workflow Navigator item derivation, signal ordering, action routing, result state, render/download handlers, MIDI bytes, Handoff behavior, musical events, arrangement data, mixer/master state, playback scheduling, snapshots, draft recovery, sampling scope, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not add automatic actions, automatic edits, command chains, autoplay, hidden generation, sampling/imported-audio workflows, sampler devices, remote analysis, media uploads, or auto-export from the readout action.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Completion Notes

- Added a read-only Quick Actions Structure Lens Route Readout command before Structure Lens action commands.
- The readout focuses the existing Structure Lens panel and reports the current target-fit, section-coverage, hook-contrast, or energy-arc route without changing Structure Lens, Beat Map, Next Move, playback, project data, exports, schema, sampling, or remote behavior.
- Added local result metrics, audition cue, next-check copy, Command Reference coverage, product docs, quality rules, and QA harness expectations for the readout path.

## Decision Log

- 2026-06-27: Selected Structure Lens Route Readout because Structure Lens is the next Guide arrangement-quality surface after Beat Map and needs a readout-first path before users run arrangement actions or broader Next Move routes.
- 2026-06-27: Kept Structure Lens action derivation language separate from Route Readout derivation language so existing action-safety expectations remain intact while the new readout remains read-only.
