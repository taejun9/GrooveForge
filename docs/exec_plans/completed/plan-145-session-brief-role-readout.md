# plan-145-session-brief-role-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add a UI-only Session Brief role readout that explains whether the current artist, vibe, reference, and notes fields are usable for handoff, so beginners know what to fill and producers can scan collaboration context quickly.

## Non-Goals

- Do not change Session Brief project schema, save/load migration, Handoff Sheet content, export file contents, playback, render, WAV/stem/MIDI export, or Handoff Pack semantics.
- Do not add collaboration, media upload, copyrighted reference audio handling, remote AI, remote analysis, accounts, analytics, cloud sync, sampling, imported audio, plugin hosting, hidden automation, or compliance claims.
- Do not persist readout labels in project files.

## Context Map

- `src/ui/App.tsx`: `SessionBriefPanel`, `sessionBriefStatus`, Session Brief update helpers, handoff/export summaries.
- `src/styles.css`: Session Brief panel layout and compact readout styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-145-session-brief-role-readout` and `.worktree/plan-145-session-brief-role-readout`.
- The readout must derive only from local Session Brief fields and stay UI-local.

## Implementation Plan

- [x] Inspect Session Brief rendering and existing status helpers.
- [x] Add a typed Session Brief role summary helper.
- [x] Render a compact readout in Session Brief with safe overflow behavior.
- [x] Update product docs, quality rules, and static QA expectations.
- [x] Run QA, verify, smoke check, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Local/browser smoke:
  - Session Brief role readout shows role, fill count, next needed field, and handoff readiness.
  - Editing vibe and context fields updates the readout through existing Session Brief controls.
  - Existing save/load, Handoff Sheet, Handoff Pack, playback, and export behavior is preserved.

## Review Plan

QA completes before review starts. Review checks that the readout is UI-only, derives only from local Session Brief fields, remains outside project schema, preserves existing Session Brief editing and export semantics, and adds no collaboration/upload/remote/sampling/cloud scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Session Brief role readout after Handoff Pack route readout. | Handoff now explains final delivery route; the source brief panel should explain what context is missing before delivery. |
| 2026-06-16 | Keep the readout derived from the existing four Session Brief fields only. | The feature should explain handoff context without adding schema, media, collaboration, or remote scope. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-145 branch and worktree from latest `main`. |
| 2026-06-16 | 제작 | Added a UI-only Session Brief role summary for empty, partial, direction-seeded, and handoff-ready brief states. |
| 2026-06-16 | 정리 | Updated README, product docs, quality rules, and QA expectations for the Session Brief role readout. |
| 2026-06-16 | 검증 | Ran `npm run qa`, `npm run verify`, `git diff --check`, HTTP smoke, and CDP DOM/layout smoke. |
| 2026-06-16 | 심사 | Reviewed the completed diff after QA and found no blocking issues. |

## Completion Notes

Completed. Session Brief now shows a compact role readout for brief usefulness and the next context field to fill, derived only from artist, vibe, reference, and notes fields, while keeping existing edit, clear, save/load, Handoff Sheet, Handoff Pack, playback, and export semantics unchanged.
