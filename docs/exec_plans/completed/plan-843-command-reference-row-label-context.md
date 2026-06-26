# plan-843-command-reference-row-label-context

## Goal

Make Command Reference rows expose their full command, shortcut, target, and optional context through stable title and aria-label text so clipped Guide Quick Start reference context remains inspectable and accessible.

## Scope

- Add a Command Reference row title/aria-label helper.
- Apply the full label to every Command Reference row while preserving the existing visible layout.
- Ensure Guide Quick Start and Guide Bottleneck Focus row labels include destination, metric, context, audition cue, next check, completion breakdown, and bottleneck posture wording from the static row context.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Command Reference filtering, Search Spotlight, Quick Actions execution, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic row state, command execution from Command Reference rows, tutorials, onboarding overlays, command chains, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Added `commandReferenceItemLabel` to compose stable row title and aria-label text from section, command, shortcut, target, and optional row context.
- Rendered Command Reference sections as lists and rows as list items with matching `title` and `aria-label`.
- Preserved existing visible row layout, filtering, Search Spotlight, Quick Actions execution, project data, playback, export, and sampler scope.
- Updated README, product docs, quality rules, and QA harness expectations.

## Review

- Result: pass.
- Findings: none open.
- Residual risk: row labels expose static Command Reference context; live Guide target values remain in Quick Actions command details.

## Decision Log

- Command Reference row context can be visually compact, but full row meaning should remain available through platform title text and assistive labels.
