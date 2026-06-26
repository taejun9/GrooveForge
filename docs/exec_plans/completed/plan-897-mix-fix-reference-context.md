# plan-897-mix-fix-reference-context

## Goal

Expose explicit Mix Fix command context in the Mix Command Reference rows so beginners and working producers can discover the existing Headroom, Stem Balance, and Low End fix path before opening Quick Actions.

## Scope

- Add static Command Reference row context for Mix Fix.
- Keep the focus on explicit, local mix correction after listening and meter checks: Mix Coach priority, Mix Fix Preview, Headroom/Stem Balance/Low End apply routes, result feedback, audition cue, and manual-trim follow-up.
- Update README, product, quality rules, and QA expectations to lock the new Mix Fix row context.

## Non-Goals

- Do not change command execution, Quick Actions behavior, Mix Coach scoring, Mix Fix preview derivation, Mix Fix apply behavior, mixer/master state outside existing explicit fix commands, playback, render/export, save/load, project schema, or sampling scope.
- Do not add auto-mixing, auto-mastering, automatic fix application, autoplay, command chains, reference audio analysis, LUFS/true-peak/platform-compliance claims, imported audio, sample browsing, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run build`
- Passed: `npm run qa`
- Passed: `npm run verify`

Notes:

- `npm run verify` confirmed runtime smoke for 14/14 sample-free Beat Blueprints and 14/14 supported style profiles.
- `npm run build` still reports the existing Vite large chunk warning for the main app chunk; build exits successfully.

## Completion Notes

- Added a static Mix Fix row to the Mix Command Reference section with Headroom, Stem Balance, and Low End apply-route context.
- Updated README, product docs, quality rules, and QA expectations so explicit Mix Fix preview/apply/result context stays discoverable through row context, search matching, Search Spotlight, title, and aria-label text.

## Decision Log

- 2026-06-26: Selected Mix Fix Command Reference context because the app already has explicit Headroom, Stem Balance, and Low End fixes, but the Mix command map jumps from Mix Coach to snapshots/balance without a dedicated row that explains the fix preview/apply/result path.
