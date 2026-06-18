
# plan-345-hook-readiness-meter

## Status

active

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노창"이나 "그루비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 계속 완성해줘.

## Goal

Add a Hook Readiness Meter that turns the existing local arrangement, pattern, readiness, export, and handoff state into a compact hook-quality scan. Beginners should see whether the beat has a hook and what to inspect next. Producers should be able to quickly judge hook contrast, motif density, section placement, mix support, and delivery posture without opening every panel.

## Non-Goals

- No remote AI, hidden generation, audio analysis, imported reference audio, sampling, sampler devices, or cloud behavior.
- No project schema, save/load, playback, render, WAV/stem/MIDI export, or Handoff Sheet file-content changes.
- No automatic arrangement, mix, or master edits from this panel.

## Context Map

- `src/ui/App.tsx`: current workstation UI, Structure Lens derivation, focus handlers, and Quick Actions.
- `src/ui/workstationUiModel.ts`: UI-only types for workstation summaries.
- `src/styles.css`: panel layout and card styling.
- `README.md`: current product surface summary.
- `docs/product/product.md`: product feature inventory and MVP scope.
- `docs/quality/rules.md`: durable QA guardrails.
- `harness/scripts/run_qa.py`: static expectations for durable docs and UI markers.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Add Hook Readiness UI-only summary types and local derivation from existing project/readiness/export/stem data.
- [x] Render a Hook Readiness panel near Structure Lens with focusable cards for hook section, motif, contrast, mix, and handoff posture.
- [x] Add explicit Hook Readiness focus behavior and Quick Actions commands that jump to existing Compose, Arrange, Mix, Master, or Deliver panels only.
- [x] Update README, product docs, quality rules, and QA static expectations.
- [x] Run QA, review, then complete the plan lifecycle.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run build`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run qa`
- `npm run verify`
- Browser smoke if available: open the workstation, confirm Hook Readiness renders, focus buttons jump to existing panels, Quick Actions exposes Hook Readiness focus commands, and no sampling/import/cloud/auto-generation entry point appears.

## Review Plan

QA completes before review starts. Review checks that Hook Readiness derives only from local project/readiness/export/stem data, stays UI-local, routes focus commands only to existing panels, preserves Structure Lens and export behavior, and avoids hidden generation, audio analysis, sampling, remote AI, accounts, analytics, or cloud sync.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add Hook Readiness as a read-only meter plus focus commands. | It helps beginners judge whether the beat has a usable hook and lets producers scan hook contrast quickly without mutating the song. |
| 2026-06-18 | Reuse existing Structure Lens, readiness, export, and stem signals instead of adding schema. | The value is guidance and navigation; project data, playback, render, and export semantics should remain unchanged. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming current Structure Lens has hook contrast but no dedicated Hook Readiness meter or direct focus commands. |
| 2026-06-18 | harness_builder | Added Hook Readiness UI-local types, summary derivation, panel rendering, focus buttons, Quick Actions focus/card commands, docs, and static QA expectations. |
| 2026-06-18 | quality_runner | `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run build`, `python3 harness/scripts/run_quality_gate.py`, `npm run qa`, and `npm run verify` passed. Browser smoke was not run because tool discovery did not expose the in-app browser control tool. |
| 2026-06-18 | review_judge | Reviewed UI-local derivation, focus-only routing, Structure Lens/export preservation, and no sampling/remote/hidden-generation scope; no blocking findings. |

## Completion Notes

Completed. Hook Readiness now scans hook section, motif density, arrangement contrast, mix support, and handoff context from local project/readiness/export/stem data, renders a focusable panel, and exposes current-card plus direct-card Quick Actions that only jump to existing workstation panels.
