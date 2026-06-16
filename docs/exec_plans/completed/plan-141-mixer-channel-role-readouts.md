# plan-141-mixer-channel-role-readouts

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Add mixer channel role readouts to each mixer strip so beginners can understand each channel's mix job, level/pan posture, tone shaping, and Space send while producers can scan rough balance quickly.

## Non-Goals

- Do not change mixer data shape, project save/load schema, playback, export, MIDI, render, or sampling behavior.
- Do not add automatic mixing, hidden mastering, loudness/platform guarantees, remote AI, imported audio, cloud sync, accounts, or analytics.
- Do not persist mixer role readout labels in project files.

## Context Map

- `src/ui/App.tsx`: mixer strip rendering, mixer channel controls, mix helpers.
- `src/styles.css`: compact readout layout inside mixer strips.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-141-mixer-channel-role-readouts` and `.worktree/plan-141-mixer-channel-role-readouts`.
- The readouts must derive from local mixer channel fields only and must not alter undo, mixer editing, playback, save/load, export, Mix Coach, Mix Balance Pads, Stem Audition Pads, or Master Finish semantics.

## Implementation Plan

- [x] Inspect mixer strip rendering and existing mix helpers.
- [x] Add UI-only mixer channel role summaries for each strip.
- [x] Render compact readouts with safe overflow behavior.
- [x] Update product docs, quality rules, and static QA expectations.
- [x] Run QA, verify, smoke check, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- Local/browser smoke:
  - Mixer strips show channel role, level/pan posture, tone shaping, and Space send details.
  - Adjusting mixer controls updates the readout without mutating schema or bypassing existing controls.
  - Existing volume, pan, mute, solo, EQ, Drive/Glue, Space send, Stem Audition, Mix Balance, playback, WAV, stem, and MIDI behavior is preserved.

## Review Plan

QA completes before review starts. Review checks that the readouts are UI-only, derive only from local mixer channel fields, remain outside project schema, preserve existing mixer controls, and add no hidden mixing, mastering, imported audio, sampling, remote AI, cloud, analytics, or platform-safety scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add mixer channel role readouts after event and arrangement readouts. | Drum, note, chord, and arrangement selections now explain musical intent; mixer strips need the same beginner/pro scan layer for balance and tone posture. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-141 branch and worktree from latest `main`. |
| 2026-06-16 | 제작 | Added UI-only mixer channel role summaries for Drums, 808, Synth, Chord, and Master strips. |
| 2026-06-16 | 정리 | Updated README, product docs, quality rules, and QA expectations for mixer channel role readouts. |
| 2026-06-16 | 검증 | Ran `npm run qa`, `npm run verify`, `git diff --check`, HTTP smoke, CDP DOM/layout smoke, and built asset token scan. |

## Completion Notes

Completed. Mixer channel role readouts now derive from existing mixer channel fields only, render inside each strip, update when local controls change, stay outside saved project schema, and preserve playback/export/Mix Coach/Mix Balance/Stem Audition/Master Finish semantics.
