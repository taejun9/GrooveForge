# plan-1289-audience-session-palette-smoke

## Goal

Add smoke coverage that proves the Audience Session Enter Guided and Enter Studio routes are discoverable through the actual Quick Actions palette filtering path, so first-time composers and professional producers can reach their intended session route from command search as well as visible buttons.

## Scope

- Inspect the existing Audience Session Quick Actions and palette filtering helpers.
- Extend renderer smoke coverage to assert both Audience Session commands appear through Quick Actions search/scope filtering, not only through direct result construction.
- Preserve existing Audience Session result checks, project schema, generation, playback, render/export, release state, remote behavior, and sampling boundaries.

## Out of Scope

- Changing Audience Session routing behavior, project data, musical event generation, playback, render/export files, desktop packaging, release signing/notarization, private distribution env values, network behavior, accounts, analytics, payments, sampling, or imported-audio behavior.

## Validation

- `node --check harness/scripts/run_renderer_smoke.mjs` passed.
- `npm run renderer:smoke` passed.
- `npm run qa` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run persona:smoke` passed.
- `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-02: Created after plan-1278 review noted residual risk that Audience Session result coverage did not exercise live Quick Actions palette discoverability. This plan keeps the change to smoke evidence so the existing UI route remains unchanged while the beginner/producer command path becomes verifiable.
- 2026-07-02: Found that Audience Session route keywords were too broad: both Enter Guided and Enter Studio carried both audience terms, so route-specific searches could return both commands. Split the Audience Session keyword payload by route and changed Quick Actions query parsing to split punctuation such as `first-time` the same way indexed tokens do.
- 2026-07-02: Extended renderer smoke to create the actual Audience Session Quick Actions, pass them through the actual Quick Actions query/scope filters, assert route-specific search, scope counts, spotlight target, and callback execution, and add a success log line for palette discoverability.
- 2026-07-02: Persona readiness still passes after the search change: first-time composer readiness, professional producer readiness, direct composition readiness, all 14 styles, local export, delivery packages, and package reopen checks are ready while sampling remains secondary.
