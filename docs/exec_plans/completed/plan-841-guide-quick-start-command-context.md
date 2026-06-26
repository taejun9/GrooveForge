# plan-841-guide-quick-start-command-context

## Goal

Make `guide-quick-start` and `guide-bottleneck-focus` Quick Action command details expose destination, metric, context, audition cue, and next-check posture before a beginner or producer runs the guide command.

## Scope

- Add structured command detail context for Guide Quick Start target commands.
- Add structured command detail context for Guide Bottleneck Focus target commands.
- Update Guide Quick Start Quick Action result metrics to read the richer detail context.
- Derive context only from existing First Beat Path, Session Pass, Workflow Spotlight, completion score, breakdown, bottleneck, and command target state.
- Preserve guide target derivation, completion scoring, bottleneck selection, visible buttons, jump/focus routing, Quick Actions ids, project data, playback, export, and sampler scope.
- Update documentation, quality rules, and QA harness expectations.

## Non-Goals

- No change to Guide Quick Start visible UI, target selection, completion scoring, bottleneck scoring, Quick Action ids, command execution handlers, saved project schema, undo history, playback, export, sampler, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Extended Guide Quick Start command targets with explicit destination, context, audition cue, and next-check fields for path, session, and workflow targets.
- Replaced inline Guide Quick Start and Guide Bottleneck detail assembly with `guideQuickStartCommandDetail` so both commands expose destination, metric, context, audition cue, next check, completion breakdown, and bottleneck posture consistently.
- Updated Guide Quick Start result metric parsing to read labeled detail segments, including slash-delimited metric values, without changing command ids or routing.
- Updated README, product docs, quality rules, and QA harness expectations for the richer command detail context.

## Review

- Result: pass.
- Findings: none open.
- Note: review caught slash-delimited command detail parsing risk; fixed with a label-prefix segment parser and re-ran the full validation list.

## Decision Log

- Quick Actions should expose the same pre-run posture as the visible Guide Quick Start controls so command-palette users get equal context before running a guide command.
- Guide Quick Start result metrics should parse labeled detail segments instead of relying on fixed slash positions because metric and route text can contain ` / ` separators.
