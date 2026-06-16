# plan-137-chord-harmonic-readout

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add a selected-chord harmonic readout to the chord editor so beginners can understand a selected chord's scale degree, roman-style function, and practical harmonic role while producers can scan progression intent quickly.

## Non-Goals

- Do not change chord data shape, project save/load schema, playback, export, MIDI, or render behavior.
- Do not add automatic chord generation, hidden reharmonization, music-theory guarantees, remote AI, cloud sync, accounts, analytics, or sampling workflow.
- Do not persist harmonic readout labels in project files.

## Context Map

- `src/ui/App.tsx`: chord editor rendering, selected-chord controls, key/scale helper functions.
- `src/styles.css`: compact readout layout near chord editor controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-137-chord-harmonic-readout` and `.worktree/plan-137-chord-harmonic-readout`.
- The readout must be derived from local key and selected chord fields only and must not alter undo, chord editing, playback, save/load, export, or Key Compass semantics.

## Implementation Plan

- [x] Inspect chord editor and existing key/scale helpers.
- [x] Add UI-only selected-chord harmonic summary for selected chord roots/qualities/inversions.
- [x] Render a compact readout with safe overflow behavior.
- [x] Update product docs, quality rules, and static QA expectations.
- [x] Run QA, verify, smoke check, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Local/browser smoke:
  - Selecting a chord shows harmonic degree/function/role in the chord editor.
  - Out-of-key selected chord roots are labeled without mutating the chord.
  - Existing chord quality, inversion, length, velocity, chance, move, copy/paste, duplicate, undo, playback, MIDI, WAV, and stem behavior is preserved.

## Review Plan

QA completes before review starts. Review checks that the readout is UI-only, derives only from local key and selected chord fields, remains outside project schema, preserves existing chord controls, and adds no hidden generation, remote AI, sampling, cloud, analytics, or theory-guarantee scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add selected-chord harmonic readout after selected-note degree readout. | The note readout explains individual tones; the next beginner/pro gap is explaining a selected chord's harmonic role in the current key. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-137 branch and worktree from latest `main`. |
| 2026-06-16 | harness_builder | Added the selected-chord harmonic readout and kept it derived from local key plus selected chord fields only. |
| 2026-06-16 | repo_cartographer | Updated README, product docs, quality rules, and static QA expectations for the chord harmonic readout. |
| 2026-06-16 | quality_runner | Ran `npm run qa`, `npm run verify`, `git diff --check`, built-asset token scan, HTTP smoke, and headless Chrome CDP UI smoke. |
| 2026-06-16 | review_judge | Reviewed the change after QA for UI-only scope, schema safety, and sampling-free product framing. |

## Completion Notes

Completed the selected-chord harmonic readout. The readout reports roman-style function, degree, practical role, and chord/inversion detail for the selected chord without changing saved project data, playback, export, MIDI, or sampling scope.
