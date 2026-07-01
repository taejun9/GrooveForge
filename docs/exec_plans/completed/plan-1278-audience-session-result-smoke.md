# plan-1278-audience-session-result-smoke

## Goal

Add execution-level smoke coverage for Audience Session Quick Action result feedback, so first-time composers and professional producers both keep a verified `Entered` result, route metric, and next-check guidance after choosing their session path.

## Scope

- Extend the existing renderer smoke to exercise Audience Session Quick Action result generation directly.
- Verify beginner and producer route commands report the expected status, metric, route copy, mode target, audition cue, and next check.
- Keep the prior macOS Electron AppKit launch-crash guard in the validation loop through desktop launch smoke / verify.
- Preserve project schema, generation, playback, render/export, release state, remote behavior, and sampling boundaries.

## Validation

- `npm run qa` passed.
- `npm run renderer:smoke` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run desktop:launch-smoke` passed.
- `npm run desktop:package-smoke` passed.
- `npm run desktop:smoke` passed.
- `python3 -m py_compile harness/scripts/run_qa.py` passed.
- `git diff --check` passed.

## Decision Log

- 2026-07-02: Chose a renderer-smoke behavioral assertion instead of a new npm command because the renderer smoke already uses Vite SSR to load UI modules and checks the first-run Audience Session surface.
- 2026-07-02: Kept ad-hoc signing experiments out of this plan after isolating the attached AppKit start-crash path to the existing desktop launch/package smokes. `desktop:launch-smoke` and `desktop:package-smoke` both passed after the final scoped change set.
- 2026-07-02: Added direct renderer-smoke checks for both Audience Session route result payloads, including `Entered` status, route metric text, selected pattern/event/bar context, audition cue, and next-check guidance.
