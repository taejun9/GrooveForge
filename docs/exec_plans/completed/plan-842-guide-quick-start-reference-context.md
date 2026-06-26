# plan-842-guide-quick-start-reference-context

## Goal

Make Command Reference search, spotlight, and Guide rows expose the Guide Quick Start and Guide Bottleneck Focus destination, metric, context, audition, next-check, breakdown, and bottleneck posture that command-palette users now see before running the commands.

## Scope

- Add Command Reference item context for Guide Quick Start and Guide Bottleneck Focus.
- Include command item context in Command Reference search and spotlight titles.
- Render optional item context without changing command execution or project data.
- Update README, product docs, quality rules, and QA harness expectations.
- Preserve Guide Quick Start scoring, command ids, Quick Actions routing, project data, playback, export, and sampler scope.

## Non-Goals

- No dynamic Command Reference state, tutorials, onboarding overlays, command chains, auto-run, autoplay, auto-save, auto-export, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

## Implementation Notes

- Added optional `context` to Command Reference items.
- Added static Guide Quick Start and Guide Bottleneck Focus row context for destination, metric, local context, audition cue, next check, completion breakdown, and bottleneck posture.
- Included optional item context in Command Reference search matching and Search Spotlight title/context.
- Rendered optional row context with compact styles while preserving existing command item layout for rows without context.
- Updated README, product docs, quality rules, and QA harness expectations.

## Review

- Result: pass.
- Findings: none open.
- Residual risk: Command Reference remains static by design, so live target values stay in Quick Actions details while Command Reference names the posture fields and search terms.

## Decision Log

- Command Reference should remain a static, UI-local map, but its Guide Quick Start rows should name the same pre-run posture fields surfaced by the live Quick Actions details.
- Search Spotlight should include optional row context so searching terms such as audition, next check, breakdown, or bottleneck can surface the Guide Quick Start rows before users open Quick Actions.
