# plan-1275-audience-session-action-routing

## Goal

Make the first-run Audience Session Readout actionable so first-time composers and professional producers can explicitly enter the matching Guided or Studio workflow from the same readout without changing generation, audio rendering, export artifacts, release state, or sampling scope.

## Scope

- Add visible audience row actions for the first-time composer and professional producer rows.
- Route row actions through the existing mode switch path so Guided/Studio selection remains explicit user intent.
- Show UI-local result feedback with selected audience, mode destination, readiness posture, and next check.
- Extend renderer, desktop launch, persona, QA, and docs expectations so the action surface stays visible.

## Out of Scope

- Changing musical event generation, project schema beyond the existing explicit mode switch, audio playback, render/export output, release signing/notarization, update feeds, private distribution env files, remote services, accounts, analytics, payments, sampling, or imported-audio behavior.

## Validation

- `node --check harness/scripts/run_renderer_smoke.mjs`
- `node --check harness/scripts/run_desktop_launch_smoke.mjs`
- `node --check harness/scripts/run_persona_readiness_smoke.mjs`
- `python3 -c "import py_compile; py_compile.compile('harness/scripts/run_qa.py', cfile='/private/tmp/grooveforge-plan-1275-run_qa.pyc', doraise=True)"`
- `npm run typecheck`
- `npm run renderer:smoke`
- `npm run persona:smoke`
- `npm run qa`
- `npm run build`
- `npm run desktop:smoke`
- `npm run desktop:launch-smoke`
- `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify`
- `git diff --check`

## Decision Log

- 2026-07-02: The persistent goal is to finish GrooveForge for both working producers and first-time composers. The current release blocker still requires private/operator inputs, so this plan improves the first-run action path that helps each audience enter the correct workflow immediately from the app.
- 2026-07-02: The user re-shared a macOS Electron Crash Reporter log with `EXC_CRASH (SIGABRT)`, `Namespace SIGNAL, Code 6`, AppKit/HIServices registration frames, and Codex as the responsible process. That exact shape was already fixed in plan-1273 through the shared desktop GUI launch guard and classifier, so this plan preserved and revalidated that guard through `desktop:smoke`, `desktop:launch-smoke`, and full `verify` instead of duplicating the crash classifier.
- 2026-07-02: Audience row actions now use explicit Enter Guided and Enter Studio buttons, call the existing mode switch path, and show UI-local audience action result feedback. No generation, export, sampling, remote, release, or saved project schema behavior changed.
