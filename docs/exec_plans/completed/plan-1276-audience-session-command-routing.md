# plan-1276-audience-session-command-routing

## Goal

Make the first-run Audience Session Readout discoverable from Quick Actions and Command Reference so first-time composers and professional producers can find the same Enter Guided / Enter Studio paths from command search as from the visible readout.

## Scope

- Add Audience Session Quick Actions for the beginner and producer rows, reusing the existing audience row selection and mode-switch path.
- Add a Command Reference Audience Session row with static context for beginner/pro route discovery.
- Update renderer/persona/desktop/QA expectations and durable docs for the new command route.
- Preserve project schema, generation, playback, render/export, release state, remote behavior, and optional sampling boundaries.

## Validation

- `npm run typecheck` passed.
- `npm run renderer:smoke` passed.
- `npm run qa` passed.
- `npm run persona:smoke` passed.
- `npm run build` passed.
- `GROOVEFORGE_DISTRIBUTION_ENV_FILE=/private/tmp/grooveforge-plan-1262-placeholder.env npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-02: Chose command/search routing rather than new onboarding UI because the visible Audience Session buttons already exist; the missing product value is discoverability for command-palette users across both beginner and professional workflows.
- 2026-07-02: Added Audience Session Quick Actions in the existing command-palette path and a static Command Reference Guide row. The actions reuse the existing row-selection/mode-switch handler, so project schema, generation, playback, render/export, release state, remote behavior, and sampling scope remain unchanged.
