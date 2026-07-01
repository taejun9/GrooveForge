# plan-1274-audience-session-readout

## Goal

Add a visible first-run Audience Session Readout that summarizes whether the current project is ready for both first-time composers and professional producers without changing project data, playback, export, release, or sampling scope.

## Scope

- Derive a local readiness summary from existing first-beat path, session pass, workflow navigator, style, arrangement, mix/master, and export posture.
- Render a compact readout on the first-run workstation surface with separate beginner and producer readiness rows plus the next practical check.
- Add renderer/persona/QA expectations so the readout stays visible and aligned with the direct-composition product promise.

## Out of Scope

- Changing musical event generation, audio rendering, project schema, export files, release signing/notarization, update feed, private distribution env files, remote services, accounts, analytics, payments, sampling, or imported-audio behavior.

## Validation

- `node --check harness/scripts/run_renderer_smoke.mjs`
- `node --check harness/scripts/run_persona_readiness_smoke.mjs`
- `node --check harness/scripts/run_desktop_launch_smoke.mjs`
- `python3 -c "import py_compile; py_compile.compile('harness/scripts/run_qa.py', cfile='/private/tmp/grooveforge-plan-1274-run_qa.pyc', doraise=True)"`
- `npm run typecheck`
- `npm run renderer:smoke`
- `npm run persona:smoke`
- `npm run qa`
- `npm run build`
- `npm run desktop:launch-smoke`
- `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run verify`

## Decision Log

- 2026-07-02: The persistent goal is to finish GrooveForge for both working producers and first-time composers. External distribution remains blocked by private/operator inputs, so this plan improves the in-app proof surface that helps both audiences see their next session step from the first screen.
- 2026-07-02: Added a UI-local Audience Session Readout derived from existing First Beat Path, Session Pass, Mode Focus, Workflow Navigator, style, arrangement, mix/master, and Export Preflight summaries. It does not write to project schema, undo history, playback, export files, release state, remote services, or sampling/imported-audio scope.
- 2026-07-02: Extended renderer, persona, QA, and desktop launch smoke contracts so first-run React SSR and live Electron DOM both verify the Audience Session Readout, first-time composer row, and professional producer row.
- 2026-07-02: Full verify passed with the existing release-channel placeholder environment. External distribution remains blocked by private release-channel metadata, update feed/provider metadata, Developer ID signing, notarization/stapling, Gatekeeper acceptance, and manual QA approval/digest.
