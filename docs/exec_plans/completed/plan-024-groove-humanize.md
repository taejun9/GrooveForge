# plan-024-groove-humanize

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 현직 작곡가도 만족할 수 있고, 작곡을 처음 해보는 사람도 사용하기 쉬운 데스크탑 앱으로 완성시켜줘.

## Goal

Add one-click drum groove humanization presets that shape existing drum velocity and microtiming data for the selected Pattern A/B/C. Beginners should get useful groove quickly, while working beatmakers can continue editing every generated velocity and timing value manually.

## Non-Goals

- No AI generation, remote calls, groove extraction from audio, probability engine, or random nondeterministic mutation.
- No sampling, audio import, chopping, sampler tracks, or audio warping.
- No new project-file state beyond existing drum velocity and timing arrays.

## Context Map

- `src/domain/workstation.ts`: pattern data, drum velocity/timing helpers, clone and normalization.
- `src/ui/App.tsx`: pattern editor, selected pattern updates, undoable project changes.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA wording.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-024-groove-humanize` and `.worktree/plan-024-groove-humanize` for git repository work.
- Preserve Pattern A/B/C independence.
- Groove presets must be deterministic and local.

## Implementation Plan

- [x] Add deterministic drum groove preset helpers that transform velocity and timing arrays.
- [x] Add selected-pattern UI controls for Tight, Pocket, Push, and Reset groove.
- [x] Preserve undo/redo, Pattern A/B/C independence, save/load behavior, realtime playback, and export semantics through existing event data.
- [x] Update docs and static QA expectations.
- [x] Verify with automated QA, domain checks, and browser interaction.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- Browser check at the local Vite app: apply Pocket groove to Pattern A, verify velocity/timing/readout/badge changes, undo/redo, switch Pattern B to verify independence, playback start/stop, export meter non-silent, and no console errors.
- Domain check: groove presets are deterministic, reset returns active hits to default timing/velocity, cloned patterns remain independent, and inactive steps stay inactive.

## Review Plan

QA completes before review starts. Review checks that groove humanization is deterministic, beginner-discoverable, manually editable afterward, preserves pattern independence, and does not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Build groove humanization on existing velocity and microtiming data. | This gives immediate musical payoff without adding opaque generation state or changing the file format surface. |
| 2026-06-15 | Use deterministic presets instead of random humanize. | Users need undoable, repeatable results and QA needs stable evidence. |
| 2026-06-15 | Keep groove presets selected-pattern only. | Producers expect Pattern A/B/C variations to stay independent, and beginners need changes to remain easy to undo. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created for one-click selected-pattern groove humanization. |
| 2026-06-15 | harness_builder | Added `DrumGroovePreset`, labels, and deterministic `applyDrumGroovePreset` helpers for Tight, Pocket, Push, and Reset. |
| 2026-06-15 | harness_builder | Added Groove controls to the drum panel and wired them to selected Pattern A/B/C updates with undo/redo status text. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for one-click groove humanization. |
| 2026-06-15 | quality_runner | Domain validation passed: Pocket preset was deterministic, reset returned Hat 3 to default velocity/0 ms timing, Pattern B remained unchanged, and inactive perc stayed inactive. |
| 2026-06-15 | quality_runner | Browser validation passed: Pocket applied to Pattern A, Hat 3 became 59% / Late +6 ms, Clap 5 showed +17, undo/redo restored/cleared badges, Pattern B remained unchanged, playback start/stop worked, export meter stayed non-silent, and console error logs were empty. |
| 2026-06-15 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`, `npm run verify`, and `git diff --check`. |

## Completion Notes

One-click drum groove humanization is implemented as deterministic edits to selected-pattern velocity and microtiming event data. Beginners can apply Tight, Pocket, Push, or Reset quickly, while working beatmakers can keep editing every resulting drum step manually.
