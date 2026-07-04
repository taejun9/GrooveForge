# plan-1356-audience-starter-followup

## Goal

Continue completing GrooveForge so working producers like 천재노창 or GroovyRoom and first-time composers can both use it, while keeping direct all-genre beat composition primary and reporting completion after the work is done.

## Objective

Make Audience Starter Projects carry an explicit local follow-up route after creation: first-time composers should see the next First Beat Path action, and professional producers should see the next Review Queue / Export Preflight / Handoff Package Check action. The follow-up must appear in visible UI, Quick Actions result feedback, Command Reference/search evidence, and smoke coverage without changing project schema, export behavior, playback, remote behavior, or sampling scope.

## Scope

- Add value-free starter follow-up context for beginner and producer starter actions.
- Surface the context in visible Build Starter controls and post-starter result feedback.
- Ensure Quick Actions result copy and renderer smoke checks prove the follow-up route.
- Update durable product/quality/readme docs to describe the behavior.

## Out Of Scope

- New project data fields, generation rules, or style imitation.
- Remote AI calls, uploads, accounts, analytics, cloud sync, release uploads, notarization, or distribution-channel claims.
- Sampling-first UI, imported audio, audio clip project types, or sampler roadmap changes.
- Changing the previously verified Squirrel crash packaging guard beyond documenting current evidence.

## Validation

- `npm run renderer:smoke`
- `npm run persona:smoke`
- `npm run typecheck`
- `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run build`
- `npm run desktop:crash-report-regression-smoke`
- `npm run release:check`
- Actual app screen test in the in-app browser at `http://127.0.0.1:5174/`

## Checklist

- [x] Add visible starter follow-up context to Audience Session starter controls.
- [x] Add starter follow-up copy to Quick Actions result metrics.
- [x] Expand renderer smoke assertions for beginner and producer follow-up routes.
- [x] Update README, product, quality, and release readiness docs.
- [x] Run validation, complete review, move plan to completed, merge, push, and report completion.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-04 | Keep the feature UI-local and value-free. | The app already creates editable local starter projects; the missing piece is explicit route continuity for beginner and producer users. |
| 2026-07-04 | Reuse Audience Session and Quick Actions result surfaces. | This avoids adding another navigation system and keeps the behavior covered by existing renderer smoke patterns. |
| 2026-07-04 | Add an actual running-app screen test before completion. | The user requested screen-level testing, so the local app was launched and the visible starter controls and Quick Actions route were exercised in the in-app browser. |

## Progress Log

| Date | Owner | Notes |
|---|---|---|
| 2026-07-04 | project_lead | Created plan after `main` was clean at `e0bea712`, no active plan existed, and the current external distribution blocker remained private release-channel metadata. |
| 2026-07-04 | harness_builder | Added visible Audience Starter follow-up labels, Quick Actions result follow-up copy, Command Reference context, renderer smoke checks, and docs/QA expectations for beginner and producer next-route guidance. |
| 2026-07-04 | quality_runner | Passed `npm run renderer:smoke`, `npm run persona:smoke`, `npm run typecheck`, `PYTHONDONTWRITEBYTECODE=1 python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run build`, and `npm run desktop:crash-report-regression-smoke`. Build kept the existing Vite large chunk warning only. |
| 2026-07-04 | quality_runner | Passed `npm run release:check`; production Electron launch, package, DMG, PKG, install, packaged project I/O, and installed project I/O smoke checks completed. The Squirrel crash-report class stayed covered by framework evidence: 3/3 dependencies present, code-signed, signature-compatible, and dyld-loadable. |
| 2026-07-04 | quality_runner | Passed actual screen testing in the in-app browser against `http://127.0.0.1:5174/`: first screen showed beginner and producer starter follow-up labels, the beginner starter button produced `Applied` with First Beat Path follow-up, the producer starter button produced `Applied` with Review Queue / Export Preflight / Handoff Package Check follow-up, Quick Actions search for `audience starter` exposed both starter commands, and a visible Quick Actions starter node reran the beginner route successfully. |
| 2026-07-04 | review_judge | Reviewed the implementation as UI-local route guidance; no project schema, playback, export, remote service, or sampling-scope changes were introduced. |
