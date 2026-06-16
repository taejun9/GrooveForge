# plan-133-keyboard-capture-octave

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add a UI-local octave bank to Desktop Keyboard Capture so the same A/S/D/F/G/H/J/K keys can enter lower or higher scale-locked 808/Synth notes. This improves beginner note entry and producer sketch speed without adding Web MIDI permissions, recording, sampling, or project schema changes.

## Non-Goals

- Do not add Web MIDI, microphone/audio recording, sampler tracks, imported audio, or plugin hosting.
- Do not persist Keyboard Capture octave defaults in the project file.
- Do not change manual note grid pitch lanes, selected-note octave tools, save/load schema, playback, or export behavior.
- Do not add hidden generation, macros, remote AI, accounts, analytics, or cloud sync.

## Context Map

- `src/ui/App.tsx`: Keyboard Capture defaults, key map, captured note pitch selection, octave range helpers.
- `src/styles.css`: Keyboard Capture default controls layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-133-keyboard-capture-octave` and `.worktree/plan-133-keyboard-capture-octave`.
- Captured notes must remain ordinary editable local musical events and remain undoable.

## Implementation Plan

- [x] Inspect Keyboard Capture key map and octave range helpers.
- [x] Add UI-local octave to capture defaults for 808 and Synth targets.
- [x] Generate capture key maps from the selected target octave.
- [x] Add compact octave control to Keyboard Capture panel with bounds.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, verify, smoke check, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Local/browser smoke:
  - Keyboard Capture panel renders an octave control.
  - 808 target bounds the octave to the 808 range and Synth target bounds it to the Synth range.
  - Key map pitches change when the octave value changes.
  - Captured notes use the visible octave bank and remain undoable.

## Review Plan

QA completes before review starts. Review checks that octave bank state is UI-local, target-specific, bounded by track octave ranges, applies only to newly captured notes, preserves existing note editing/playback/export/save-load semantics, and adds no Web MIDI, recording, sampling, cloud, analytics, or schema scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Keyboard Capture octave bank after capture defaults. | Length/velocity/glide control improves note shape; octave bank completes basic playable range control without new permissions. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-133 branch and worktree from latest `main`. |
| 2026-06-16 | harness_builder | Added target-specific UI-local octave defaults, bounded octave input, octave-derived capture key map, and matching capture insertion path. |
| 2026-06-16 | doc_gardener | Updated README, product, quality, and QA harness expectations for Keyboard Capture octave defaults. |
| 2026-06-16 | quality_runner | `npm run typecheck` passed after implementation. |
| 2026-06-16 | review_judge | Adjusted capture-default control CSS to wrap responsively after review found fixed three-column overflow risk. |
| 2026-06-16 | quality_runner | `npm run qa`, `npm run verify`, `git diff --check`, and local HTTP smoke against `http://127.0.0.1:5215/` passed. In-app Browser connection was unavailable, so click-level smoke is recorded as residual manual risk. |
| 2026-06-16 | review_judge | Post-QA review found no blocking issues; Keyboard Capture octave remains UI-local, target-specific, bounded by track ranges, and outside saved project schema. |
