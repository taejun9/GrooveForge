# plan-138-selected-drum-pocket-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add a selected-drum pocket readout to the drum editor so beginners can understand the selected hit's lane role, beat position, velocity, chance, timing, and repeat posture while producers can scan groove intent quickly.

## Non-Goals

- Do not change drum pattern data shape, project save/load schema, playback, export, MIDI, render, or sampling behavior.
- Do not add automatic groove correction, hidden generation, remote AI, imported audio, cloud sync, accounts, analytics, or groove correctness guarantees.
- Do not persist pocket readout labels in project files.

## Context Map

- `src/ui/App.tsx`: drum editor rendering, selected drum controls, Groove Compass helpers, drum velocity/chance/timing helpers.
- `src/styles.css`: compact readout layout near selected drum edit controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-138-selected-drum-pocket-readout` and `.worktree/plan-138-selected-drum-pocket-readout`.
- The readout must derive from selected Pattern A/B/C drum hit state only and must not alter undo, drum editing, playback, save/load, export, or Groove Compass semantics.

## Implementation Plan

- [x] Inspect drum editor and existing Groove Compass selected drum helpers.
- [x] Add UI-only selected-drum pocket summary for active selected drum hits.
- [x] Render a compact readout with safe overflow behavior near selected drum edit controls.
- [x] Update product docs, quality rules, and static QA expectations.
- [x] Run QA, verify, smoke check, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Local/browser smoke:
  - Selecting an active drum hit shows lane role, beat position, velocity, chance, timing, and repeat posture.
  - Inactive or missing selected drum steps do not show stale pocket details.
  - Existing drum velocity, chance, timing, hat repeat, copy/paste, undo, playback, WAV, and stem behavior is preserved.

## Review Plan

QA completes before review starts. Review checks that the readout is UI-only, derives only from selected drum hit fields, remains outside project schema, preserves existing drum controls, and adds no hidden generation, imported audio, sampling, remote AI, cloud, analytics, or groove-correctness scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add selected-drum pocket readout after selected-note and selected-chord readouts. | Drum hits are the first beat-making layer; explaining pocket and hit role closes the same beginner/pro scan loop for rhythm events. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-138 branch and worktree from latest `main`. |
| 2026-06-16 | harness_builder | Added a UI-only selected-drum pocket readout in the Drum Step Inspector, derived from active selected lane/step velocity, chance, timing, and hat repeat fields. |
| 2026-06-16 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for the selected-drum pocket readout. |
| 2026-06-16 | quality_runner | Ran `npm run qa`, `npm run verify`, `git diff --check`, built-asset token scan, HTTP smoke, and headless Chrome CDP UI smoke. |
| 2026-06-16 | review_judge | Reviewed the readout after QA for UI-only scope, schema safety, existing drum-control preservation, and sampling-free product framing. |

## Completion Notes

Completed the selected-drum pocket readout. The readout appears only for an active selected drum hit, shows lane/beat position, practical role, velocity, chance, timing, and repeat posture, and disappears when the selected hit is inactive without changing saved project data, playback, export, MIDI, render, Groove Compass, or sampling scope.
