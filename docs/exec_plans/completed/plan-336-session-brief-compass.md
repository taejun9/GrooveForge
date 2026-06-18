# plan-336-session-brief-compass

## Status

Completed

## Goal

Turn Session Brief from a passive note area into a local readiness compass that helps beginners fill the next useful production context and helps working producers scan artist/vibe/reference/handoff fit before arranging, mixing, or exporting.

## Scope

- Add a read-only Session Brief Compass inside the existing Session Brief panel.
- Derive compact cards from the current local `SessionBrief`, delivery target, style/key/BPM, arrangement length, export analysis, and stem analysis.
- Show status, detail, and next-check text for direction, reference, vocal/artist context, and handoff readiness.
- Keep the compass UI-local and out of saved project schema, undo history, playback, render, export, and remote workflows.
- Update README, product docs, quality rules, and static QA expectations.

## Non-Goals

- No new project schema fields, AI analysis, audio import, sampling, plugin hosting, reference track ingestion, cloud sync, analytics, accounts, auto-export, auto-arrangement, or hidden generation.
- No changes to Session Brief starter pad behavior, Handoff Sheet contents, Delivery Target alignment, export rendering, or existing focus/Quick Actions handlers.

## Files

- `src/ui/App.tsx`
- `src/ui/workstationUiModel.ts`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Validation

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run build`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`

## QA Log

- `npm run typecheck` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `git diff --check` passed.
- `npm run build` passed. Vite reported the existing large client chunk warning for `dist/assets/index-DXdEI3BU.js` at 510.12 kB after minification.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run qa` passed.
- `npm run verify` passed, including quality gate, runtime smoke, typecheck, and build. Runtime smoke covered 10/10 sample-free Beat Blueprints and 10/10 supported style profiles.
- Browser smoke was not run because the Browser control tool was not exposed in this session after tool discovery; available follow-up tools were thread, automation, and multi-agent tools.

## Review

Post-QA review found no project schema, domain migration, save/load parser, playback, render, export file, sampling, cloud, or remote-service changes. Session Brief Compass derives read-only Direction, Reference, Artist/Vocal Context, and Handoff cards from local Session Brief, Delivery Target, style/key/BPM, arrangement length, deterministic export analysis, and deterministic stem analysis. Existing Session Brief editing, clear behavior, starter pads, Handoff Sheet, Handoff Pack, Export Preflight, and export handlers remain unchanged. No findings.

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-18 | Add a read-only compass instead of new editable fields. | The existing four Session Brief fields are enough for local handoff context; the gap is turning them into actionable production readiness without schema churn. |
| 2026-06-18 | Derive readiness from local project/export/stem state only. | This preserves local-first behavior and avoids making reference-track or AI-analysis claims. |

## Progress

- [x] Inspected current Session Brief panel, role summary, starter pads, and handoff/export consumers.
- [x] Created `codex/plan-336-session-brief-compass` worktree.
- [x] Implement Session Brief Compass.
- [x] Update docs and QA expectations.
- [x] Run QA and quality checks.
- [x] Complete review, move plan to completed, and create review mirror.
