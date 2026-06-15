# plan-059-next-move

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족하고 작곡을 처음 해보는 사람도 쓰기 쉬운 데스크탑앱으로 완성시켜 달라는 장기 목표를 이어간다.

## Goal

Add a `Next Move` strip that turns current project diagnostics into explicit, user-triggered next actions. Beginners should see a clear recommended click instead of guessing what to do next, while working producers should get fast access to useful edit moves such as beat blueprints, pattern fills, arrangement energy moves, snapshot save, or export polish checks.

## Non-Goals

- Do not make Beat Readiness itself mutating; it remains read-only.
- No remote AI, generated audio, hidden automation, accounts, analytics, or cloud sync.
- No sampling, audio import, sampler track, plugin hosting, or audio warping work.
- No full tutorial system or multi-step onboarding flow in this slice.

## Context Map

- `src/ui/App.tsx`: existing project state, readiness checks, pattern fill, arrangement move, blueprint, snapshot, and export analysis helpers.
- `src/styles.css`: top workstation rows and compact control styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA wording for guided next actions.
- `harness/scripts/run_qa.py`: static expectations for the new UI and guards.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Next Move actions must be explicit button clicks, undoable when they change project data, and based only on local project/render state.
- Beat Readiness cards must remain read-only diagnostics.

## Implementation Plan

- [x] Define local Next Move recommendation types and deterministic recommendation logic from project/readiness/export state.
- [x] Add a compact Next Move strip near Beat Readiness with one primary recommendation and secondary action buttons.
- [x] Wire action buttons to existing explicit project operations: apply a blueprint, fill pattern tail, apply arrangement move, save snapshot, and focus export/mix checks.
- [x] Update product docs, QA rules, and static QA expectations.
- [x] Verify desktop layout, console state, and user-triggered action behavior in browser.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`
- Browser smoke test: verify Next Move renders, primary action runs, secondary snapshot action runs, readiness/export action can focus the Mix Coach area, no console errors, and no horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Next Move is deterministic, local-only, explicit-click driven, undoable for project edits, does not mutate Beat Readiness, does not introduce sampling/remote AI scope, and improves beginner guidance without hiding pro controls.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add a separate Next Move strip instead of mutating Beat Readiness cards. | Beat Readiness has a read-only quality invariant; a separate strip can guide action while preserving diagnostic integrity. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created. |
| 2026-06-16 | harness_builder | Added deterministic Next Move actions and a compact strip that routes to existing explicit edit commands. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for Next Move. |
| 2026-06-16 | quality_runner | `run_qa`, `run_quality_gate`, `npm run qa`, `npm run verify`, `git diff --check`, and browser smoke passed. |
| 2026-06-16 | review_judge | Reviewed Next Move for local-only recommendations, explicit-click execution, undoable mutation paths, Beat Readiness read-only preservation, and no sampling/remote-AI scope drift. |

## Completion Notes

Implemented. Next Move now provides one primary recommended action plus secondary local actions from readiness/export state. Browser smoke verified render, Save Slot action, Mix Check focus, Beat Readiness read-only state, no console errors, and no horizontal overflow.
