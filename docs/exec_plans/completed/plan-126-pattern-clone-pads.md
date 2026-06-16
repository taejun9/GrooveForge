# plan-126-pattern-clone-pads

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add explicit Pattern Clone Pads so users can turn the selected Pattern A/B/C into a ready variation in another slot with one click. The feature should reuse existing copy and deterministic variation logic, stay undoable/editable, and help beginners build A/B/C song contrast while giving working producers faster pattern-variation workflow.

## Non-Goals

- Do not add hidden generation, remote AI, imported audio, sampling, sampler tracks, audio clips, plugin hosting, accounts, analytics, cloud sync, or background export.
- Do not mutate arrangement blocks automatically; cloned patterns should remain pattern-slot edits only.
- Do not replace existing copy, clear, or variation tools.
- Do not change realtime playback, WAV/stem/MIDI export semantics except through the existing Pattern A/B/C data the user explicitly edits.

## Context Map

- `src/ui/App.tsx`: selected Pattern A/B/C state, copy/clear/variation handlers, Pattern editor UI, test ids.
- `src/styles.css`: Pattern editor pad layout and responsive controls.
- `src/domain/workstation.ts`: `clonePatternData`, `createPatternVariation`, Pattern variation presets.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-126-pattern-clone-pads` and `.worktree/plan-126-pattern-clone-pads`.
- Keep Pattern Clone Pads local, deterministic, explicit-click, undoable, and sample-free.

## Implementation Plan

- [x] Inspect existing Pattern copy and variation paths.
- [x] Add a local Pattern Clone Pad model that derives available target slots and variation presets from the selected pattern.
- [x] Add an undoable handler that clones selected pattern data into the target slot and applies the requested variation to the clone.
- [x] Render clone pads in the Pattern editor without hiding existing copy/clear/variation controls.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, verify, browser smoke, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke:
  - Pattern Clone Pads render in the Pattern editor.
  - Clicking a clone pad writes to the target Pattern slot, switches selection to the target, and keeps console errors empty.
  - Existing Pattern copy, clear, and variation controls still render.
  - No horizontal overflow at desktop and 1180px widths.

## Review Plan

QA completes before review starts. Review checks deterministic local event edits, Pattern A/B/C slot scope, undoable behavior, beginner/pro workflow value, no arrangement mutation, no export semantic drift, no sampling-first drift, and layout regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Pattern Clone Pads before deeper piano-roll clipboard work. | A/B/C variation creation is a repeated beat-making workflow and can reuse stable copy/variation logic with low schema risk. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-126 branch and worktree from latest `main`. |
| 2026-06-16 | repo_cartographer | Inspected existing Pattern copy, clear, variation, fill, Pattern DNA, and Pattern Stack paths. |
| 2026-06-16 | 제작 | Added Pattern Clone Pad options, undoable clone-and-vary handler, Pattern editor UI, and responsive styles. |
| 2026-06-16 | harness_builder | Updated README, product docs, quality rules, and static QA expectations for Pattern Clone Pads. |
| 2026-06-16 | 검증 | `npm run qa`, `npm run verify`, and `git diff --check` passed. Browser smoke confirmed clone pads render, `pattern-clone-B-hook` switches editing to Pattern B with changed event count, undo is enabled, console errors are empty, existing pattern controls still render, and 1180px viewport has no horizontal overflow. |
| 2026-06-16 | 심사 | Reviewed selected-pattern source, explicit target slot mutation, undoable history path, no arrangement mutation, no export semantic drift, no sampling scope, and layout risk. |

## Completion Notes

Completed. Pattern Clone Pads now let users clone the selected Pattern A/B/C into another slot as a Hook or Breakdown variation in one explicit click. The feature reuses existing deterministic pattern variation logic, switches editing focus to the target slot, keeps results manually editable, and preserves arrangement assignments until the user changes them separately.
