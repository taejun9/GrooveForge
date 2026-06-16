# plan-136-note-degree-role

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add a selected-note degree and role readout to the Studio Note Inspector for 808 and Synth notes. When a note is selected, the inspector should show its scale degree in the current key plus a practical role label such as Root, Color, Anchor, Lead, or Octave so beginners can understand in-key choices and producers can scan musical intent quickly.

## Non-Goals

- Do not change note data shape, project save/load schema, playback, export, MIDI, or render behavior.
- Do not add Web MIDI, microphone/audio recording, sampler tracks, imported audio, plugin hosting, or sampling-first workflow.
- Do not add remote AI, hidden generation, account features, analytics, cloud sync, music-theory guarantees, or automatic composition.
- Do not persist selected-note degree/role labels in project files.

## Context Map

- `src/ui/App.tsx`: Note Inspector props/rendering and existing key/scale helper functions.
- `src/styles.css`: Note Inspector degree/role readout layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-136-note-degree-role` and `.worktree/plan-136-note-degree-role`.
- The readout must be derived from local key and selected note pitch only and must not alter undo, note editing, playback, save/load, export, or Keyboard Capture semantics.

## Implementation Plan

- [x] Inspect Note Inspector and existing key compass degree helpers.
- [x] Add UI-only selected-note degree/role summary and pass current key into Note Inspector.
- [x] Render a compact inspector readout with safe overflow behavior.
- [x] Update product docs, quality rules, and static QA expectations.
- [x] Run QA, verify, smoke check, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Local/browser smoke:
  - Selecting an 808 or Synth note shows degree and role in the Studio Note Inspector.
  - Out-of-scale selected notes are labeled without mutating note pitch.
  - Existing note length, glide, velocity, chance, move, copy/paste, duplicate, undo, playback, and export behavior is preserved.

## Review Plan

QA completes before review starts. Review checks that the readout is UI-only, derives only from local key and selected note pitch, remains outside project schema, preserves existing Note Inspector controls, and adds no Web MIDI, recording, sampling, remote AI, cloud, analytics, or automatic composition scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add selected-note degree/role readout after Keyboard Capture degree labels. | Keyboard Capture now explains the playable key bank; Note Inspector should explain the currently selected note during editing. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created note-degree branch and worktree from `main`; renumbered to plan-136 after plan-135 was used for the beat-concept audit. |
| 2026-06-16 | plan_keeper | Merged latest `main` concept guardrails into the plan-136 worktree before QA. |
| 2026-06-16 | harness_builder | Added UI-only selected-note degree and role summary to Note Inspector using existing local key/scale helpers. |
| 2026-06-16 | doc_gardener | Updated README, product, quality, and QA harness expectations for selected-note degree/role readout. |
| 2026-06-16 | quality_runner | `npm run typecheck` passed after implementation. |
| 2026-06-16 | quality_runner | `npm run qa`, `npm run verify`, `git diff --check`, HTTP smoke, bundle token scan, and headless Chrome CDP click smoke passed. |
| 2026-06-16 | review_judge | Reviewed readout scope as UI-only, local key/pitch-derived, and outside project schema/audio/export paths. |

## Completion Notes

Completed. The Studio Note Inspector now shows a compact selected-note degree/role readout for 808 and Synth notes. It derives the readout from the current key and selected pitch only, keeps it out of saved project data, and preserves note editing, playback, save/load, WAV/stem/MIDI export, Keyboard Capture, sampling boundaries, and remote-AI/cloud guardrails.
