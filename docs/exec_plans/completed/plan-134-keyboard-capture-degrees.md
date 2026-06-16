# plan-134-keyboard-capture-degrees

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add scale-degree labels to Desktop Keyboard Capture so A/S/D/F/G/H/J/K show both pitch and degree inside the selected key/octave bank. This helps beginners understand scale-safe note choices and lets producers scan root, third, fifth, and octave positions quickly while keeping note entry direct and local.

## Non-Goals

- Do not add Web MIDI, microphone/audio recording, sampler tracks, imported audio, plugin hosting, or sampling-first workflow.
- Do not change project save/load schema, playback, export, note grid pitch lanes, or captured note data shape.
- Do not add music-theory guarantees, remote AI, accounts, analytics, cloud sync, hidden generation, or automatic composition.
- Do not persist Keyboard Capture degree labels or UI defaults in the project file.

## Context Map

- `src/ui/App.tsx`: Keyboard Capture key map item shape, degree label generation, and key map rendering.
- `src/styles.css`: compact key map label styling.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-134-keyboard-capture-degrees` and `.worktree/plan-134-keyboard-capture-degrees`.
- Degree labels must remain UI-only and must not alter captured note pitch, timing, length, velocity, glide, chance, undo, playback, or export semantics.

## Implementation Plan

- [x] Inspect current Keyboard Capture key map rendering and scale pitch helpers.
- [x] Extend key map items with UI-only scale-degree labels.
- [x] Render compact degree labels beside pitch labels without overflowing key tiles.
- [x] Update product docs, quality rules, and static QA expectations.
- [x] Run QA, verify, smoke check, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Local/browser smoke:
  - Keyboard Capture key tiles show degree labels alongside pitches.
  - Degree labels follow the selected key/octave bank and remain UI-only.
  - Capturing notes still inserts the visible pitch as ordinary editable note events.

## Review Plan

QA completes before review starts. Review checks that labels are derived only from local key/octave state, stay outside project schema, do not affect capture insertion, preserve keyboard shortcut guards, preserve undo/playback/export/save-load semantics, and add no Web MIDI, recording, sampling, cloud, analytics, or schema scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add degree labels after Keyboard Capture octave bank. | Octave selection makes pitch range playable; degree labels make the visible key bank understandable for beginners and faster to scan for producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-134 branch and worktree from latest `main`. |
| 2026-06-16 | harness_builder | Added UI-only `degreeLabel` values to Keyboard Capture key map items and rendered compact degree readouts in each key tile. |
| 2026-06-16 | doc_gardener | Updated README, product, quality, and QA harness expectations for degree-labeled Keyboard Capture. |
| 2026-06-16 | quality_runner | `npm run typecheck` passed after implementation. |
| 2026-06-16 | quality_runner | `npm run qa`, `npm run verify`, `git diff --check`, bundle token smoke, and local HTTP smoke against `http://127.0.0.1:5216/` passed. In-app Browser connection was unavailable, so click-level smoke is recorded as residual manual risk. |
| 2026-06-16 | review_judge | Post-QA review found no blocking issues; degree labels remain UI-only key map metadata and do not affect capture insertion, save/load schema, playback, or export. |
