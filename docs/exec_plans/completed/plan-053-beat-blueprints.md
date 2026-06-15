# plan-053-beat-blueprints

## Status

active

## Owner

project_lead / harness_builder

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 완성시켜줘.

## Goal

Add Beat Blueprints: explicit, local, sample-free project starting points that combine style, key, BPM, Pattern A/B/C event data, arrangement template, sound preset, mixer balance, and master preset. Beginners should be able to start from a complete editable beat direction in one click, while working producers should get fast sketch foundations without losing manual control.

## Non-Goals

- No remote AI, automatic audio generation, imported audio, sample browsing, chopping, sampler tracks, plugin hosting, or cloud features.
- No hidden random generation or non-deterministic project mutation.
- No new project-file version unless a saved field is required.
- No replacement for manual style, pattern, arrangement, mixer, sound, or master editing.

## Context Map

- `src/domain/workstation.ts`: project, style, pattern, arrangement, sound, mixer, and master helpers.
- `src/ui/App.tsx`: top-level controls and command/status surface.
- `src/styles.css`: compact top-level controls and responsive shell layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product/QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-053-beat-blueprints` and `.worktree/plan-053-beat-blueprints`.
- Preserve the beat-first product boundary: blueprints must produce editable musical-event projects without imported audio or sampling state.

## Implementation Plan

- [x] Define a small set of all-genre Beat Blueprint presets from existing local project primitives.
- [x] Add an undoable UI control that applies a blueprint and clears stale selections safely.
- [x] Ensure blueprints remain deterministic, sample-free, and fully editable after application.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: passed. Beat Blueprints rendered 4 cards without overflow, Club Bounce changed the project to House / D minor / 124 BPM, Beat Readiness moved to 5/5 ready, the Club Bounce card became selected, a kick step could still be selected and toggled, Play/Stop worked, and console errors were empty.

## Review Plan

QA completes before review starts. Review checks that Beat Blueprints are deterministic, undoable, sample-free, built from editable project data, useful as fast starts for both beginners and producers, and do not regress style, pattern, arrangement, mixer, master, save/load, playback, or export semantics.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add project-level blueprints before optional sampling or AI generation. | One-click editable beat starting points reduce beginner friction and give producers faster sketch foundations while preserving manual control. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Selected Beat Blueprints as the next completion slice after Beat Readiness because the app needs stronger first-run and fast-sketch workflow without drifting into sampling. |
| 2026-06-15 | harness_builder | Added four local Beat Blueprints that apply style, key, BPM, Pattern A/B/C event data, arrangement template, sound preset, mixer balance, and master preset through undoable project history. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for sample-free editable blueprint starts. |
| 2026-06-15 | quality_runner | Ran typecheck, QA, quality gate, verify, diff whitespace check, and Browser Blueprint smoke. |

## Completion Notes

Beat Blueprints are implemented as a top-level sample-free start surface with Dark 808 Sketch, R&B Pocket, Club Bounce, and Warm Loop presets. Applying a blueprint deterministically updates local style, key, BPM, Pattern A/B/C event data, arrangement template, sound preset, mixer balance, and master preset through undoable project history while preserving title, mode, metronome setting, manual editing, playback, save/load, WAV/stem export, and MIDI export semantics.
