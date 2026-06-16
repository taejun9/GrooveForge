# plan-140-arrangement-block-role-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add a selected-arrangement-block role readout to the arrangement editor so beginners can understand the selected block's song role, timeline position, pattern, energy, length, and mute posture while producers can scan arrangement intent quickly.

## Non-Goals

- Do not change arrangement block data shape, project save/load schema, playback, export, MIDI, render, or sampling behavior.
- Do not add automatic arrangement rewriting, hidden generation, remote AI, imported audio, cloud sync, accounts, analytics, or song-form correctness guarantees.
- Do not persist arrangement readout labels in project files.

## Context Map

- `src/ui/App.tsx`: arrangement editor rendering, selected arrangement state, arrangement bar helpers.
- `src/styles.css`: compact readout layout near selected arrangement block controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-140-arrangement-block-role-readout` and `.worktree/plan-140-arrangement-block-role-readout`.
- The readout must derive from local selected arrangement block and arrangement timeline fields only and must not alter undo, arrangement editing, playback, save/load, export, Song Form Overview, or Structure Lens semantics.

## Implementation Plan

- [x] Inspect arrangement editor and existing song-form helpers.
- [x] Add UI-only selected-arrangement-block summary for the active selected block.
- [x] Render a compact readout with safe overflow behavior near selected arrangement edit controls.
- [x] Update product docs, quality rules, and static QA expectations.
- [x] Run QA, verify, smoke check, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Local/browser smoke:
  - Selecting an arrangement block shows song role, start/end bars, Pattern A/B/C, length, energy, and mute posture.
  - Changing selected blocks updates the readout without mutating arrangement data.
  - Existing section, Pattern A/B/C assignment, mutes, bars, energy, copy/paste, split/merge, duplicate, move, undo, playback, WAV, stem, and MIDI behavior is preserved.

## Review Plan

QA completes before review starts. Review checks that the readout is UI-only, derives only from selected arrangement block and timeline fields, remains outside project schema, preserves existing arrangement controls, and adds no hidden arrangement generation, imported audio, sampling, remote AI, cloud, analytics, or song-form-correctness scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add selected-arrangement-block role readout after selected drum/note/chord readouts. | Event readouts now explain drum, note, and chord selections; arrangement block intent is the next beginner/pro scan gap in the beat-making workflow. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Existing arrangement-block role readout draft was found in a plan-139 worktree. |
| 2026-06-16 | plan_keeper | Merged latest `main`, renamed the branch and worktree to plan-140, and moved the active plan file to avoid the completed plan-139 collision. |
| 2026-06-16 | harness_builder | Added a UI-only selected-arrangement-block role readout derived from local arrangement block, timeline, pattern event, energy, and muted-track fields. |
| 2026-06-16 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for the selected-block role readout. |
| 2026-06-16 | quality_runner | Ran `npm run qa`, `npm run verify`, `git diff --check`, built-asset token scan, HTTP smoke, and headless Chrome CDP UI smoke. |
| 2026-06-16 | review_judge | Reviewed the readout after QA for UI-only scope, schema safety, existing arrangement-control preservation, and sampling-free product framing. |

## Completion Notes

Completed the selected-arrangement-block role readout. The readout reports song role, timeline span, Pattern A/B/C assignment, length, energy, event count, and mute posture for the selected arrangement block without changing arrangement data, saved project schema, playback, export, MIDI, Song Form Overview, Structure Lens, or sampling scope.
