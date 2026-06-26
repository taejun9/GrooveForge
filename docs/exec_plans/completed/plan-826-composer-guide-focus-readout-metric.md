# plan-826-composer-guide-focus-readout-metric

## Goal

Show the Composer Guide readiness metric directly in the Focus Readout before the user clicks Focus, so beginners can see progress and producers can scan ready/review/blocker posture faster.

## Scope

- Add UI-local readiness metric text to the Composer Guide Focus Readout.
- Derive the metric only from existing Composer Guide cards through the existing Composer Guide result metric helper.
- Preserve Focus Readout destination/next-check metadata, Focus Readout action, card Focus buttons, Quick Actions, and Focus Result behavior.
- Update CSS, documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Composer Guide scoring, card order, focus target derivation, action routing, or result labels.
- No project schema, undo history, playback, export, save/load, render, or remote behavior changes.
- No sampler, imported audio, sampling workflow, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed `git diff --check`.
- Passed `python3 harness/scripts/run_qa.py`.
- Passed `npm run typecheck`.
- Passed `python3 harness/scripts/run_quality_gate.py`.
- Passed `npm run build`.
- Passed `npm run qa`.
- Passed `npm run verify`.
- Note: Vite still reports the existing large chunk warning for the main index bundle.

## Decision Log

- The Focus Readout metric should reuse `composerGuideFocusResultMetric(summary)` so readout progress and post-focus result progress stay consistent.

## Review

- No issues found after QA.
- Composer Guide Focus Readout now shows the same ready/review/blocker metric used by post-focus result feedback.
- The metric is UI-local and does not change guide scoring, saved project data, undo history, playback, export, remote AI, or sampler behavior.
