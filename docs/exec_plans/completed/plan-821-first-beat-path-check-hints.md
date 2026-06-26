# plan-821-first-beat-path-check-hints

## Goal

Make the First Beat Path readout clearer about the next direct beat-making check without changing path scoring, jump behavior, project data, or sampling scope.

## Scope

- Add a UI-local First Beat Path check hint derived from the existing next step and step summary.
- Keep setup, compose, arrange, mix, and deliver as the direct composition path.
- Update CSS, harness expectations, and quality rules for the new read-only hint.

## Non-Goals

- No sampler, imported audio, or sample browsing changes.
- No onboarding overlay, macro, auto-run, autoplay, auto-save, or auto-export.
- No project schema, undo history, playback, export, or scoring changes.

## Validation

- Passed `git diff --check`
- Passed `python3 harness/scripts/run_qa.py`
- Passed `npm run typecheck`
- Passed `python3 harness/scripts/run_quality_gate.py`
- Passed `npm run build`
- Passed `npm run qa`
- Passed `npm run verify`

Build note: Vite still reports the existing large chunk warning.

## Decision Log

- Keep the feature read-only and UI-local so First Beat Path remains a direct beat composition guide instead of a generation or sampling workflow.

## Review

- Added a next-check hint to First Beat Path Decision Readout.
- Confirmed it derives only from the current First Beat Path summary and selected next step.
- Confirmed no project schema, undo history, scoring, playback, export, sampling, remote AI, accounts, analytics, or cloud sync behavior changed.
