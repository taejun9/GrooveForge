# plan-1408-audience-next-step-rail

## Goal

Make the first-run audience area more directly usable for both first-time composers and working producers by showing a compact next-step rail that names each lane's immediate local action, readiness posture, and follow-up route before the user opens deeper panels.

## Scope

- Add a visible dual-audience next-step rail to the first-run guidance surface.
- Reuse existing local Audience Session, Dual Audience Readiness, Audience Completion Route, First Beat Path, Review Queue, Export Preflight, and Handoff Package Check derivations.
- Add stable test ids and launch-smoke evidence so the actual desktop app screen proves both beginner and producer next-step rail rows render.
- Update product/docs/QA expectations for the new user-facing contract.

## Out of Scope

- Changing project schema, generation rules, playback, export output, or delivery bundle contents.
- Adding remote AI, accounts, analytics, payments, cloud sync, protected-style imitation, or sampling-first workflow.
- Filling private release-channel metadata values or claiming external distribution completion.

## Decision Log

- 2026-07-06: Started after confirming main is clean and the remaining external release blocker is operator-owned private metadata. A UI-local first-run next-step rail moves the app closer to the user's requested dual audience without requiring private external release values.

## Completion Criteria

- First-run guidance shows beginner and producer next-step rail rows with current route, action, readiness, and follow-up labels.
- Desktop launch smoke captures and validates the rail from a real Electron renderer.
- Static QA and docs recognize the rail as local, value-free, and direct-composition centered.
- The plan is moved to `docs/exec_plans/completed/` with a review mirror under `docs/reviews/`.

## Validation Log

- `node --check harness/scripts/run_desktop_launch_smoke.mjs` passed.
- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `npm run qa` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- First `npm run desktop:launch-smoke` run failed because Electron main did not yet include the new rail test ids in its launch-smoke evidence collection list.
- After adding those ids to Electron main, `npm run desktop:launch-smoke` passed with approved GUI/AppKit access; it rendered the production Electron app, checked 40 required test ids, sampled 75 colors, and verified the Audience next-step rail for visible beginner and professional producer action rows.
- `npm run release:source-evidence-refresh-smoke` passed with approved GUI/AppKit access; it ran 44 commands, regenerated 21/21 source artifacts, and kept private values plus external-distribution claims false.
- `npm run release:completion-summary-refresh-smoke` passed with latest completed plan `plan-1408`, 10-plan progress `1401-1410: 8/10`, user-facing completion `99.999999%`, remaining completion `0.000001%`, and current first blocker `Ignored local distribution env file is not loaded.`

## Completion Notes

- Added a UI-local Audience Next Step rail inside the first-run Audience Session Readout.
- The rail shows first-time composer and professional producer rows with route, immediate action, readiness posture, follow-up path, and an explicit Open button that reuses the existing audience selection handler.
- Updated launch-smoke renderer evidence, docs, and static QA expectations so the rail is verified from the real desktop app screen.
- No project schema, generation, playback, export, remote, release-channel private values, or external distribution claims changed.
