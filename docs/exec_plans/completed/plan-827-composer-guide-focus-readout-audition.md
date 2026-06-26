# plan-827-composer-guide-focus-readout-audition

## Goal

Show the Composer Guide audition cue directly in the Focus Readout before the user clicks Focus, so beginners know what to listen for and producers can scan the current writing check faster.

## Scope

- Add UI-local audition cue text to the Composer Guide Focus Readout.
- Derive the audition cue only from the existing Composer Guide focus card through the existing Composer Guide result audition helper.
- Preserve Focus Readout destination/metric/next-check metadata, Focus Readout action, card Focus buttons, Quick Actions, and Focus Result behavior.
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

- The Focus Readout audition cue should reuse `composerGuideFocusResultAudition(card)` so pre-click guidance and post-focus feedback stay consistent.

## Review

- No issues found after QA.
- Composer Guide Focus Readout now shows the same audition cue used by post-focus result feedback.
- The audition cue is UI-local and does not change guide scoring, saved project data, undo history, playback, export, remote AI, or sampler behavior.
