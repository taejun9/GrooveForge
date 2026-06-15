# plan-054-arrangement-moves

## Status

active

## Owner

project_lead / harness_builder

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 완성시켜줘.

## Goal

Add Arrangement Moves: one-click, undoable selected-block presets that turn existing arrangement energy and per-block track mutes into musical section moves such as Drop, Build, Hook Lift, and Reset. Beginners should be able to create obvious song dynamics without understanding every track mute, while working producers should get fast starting points that remain fully editable.

## Non-Goals

- No new track type, clip lane, audio clip workflow, sampling, imported audio, plugin hosting, remote AI, hidden randomness, or file-format version bump.
- No automatic song generation or full arrangement rewrite.
- No change to Pattern A/B/C musical event data.

## Context Map

- `src/domain/workstation.ts`: arrangement block types, energy/mute normalization, arrangement helpers.
- `src/ui/App.tsx`: selected arrangement block editor and undoable `updateArrangementBlock`.
- `src/styles.css`: compact arrangement controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product/QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-054-arrangement-moves` and `.worktree/plan-054-arrangement-moves`.
- Preserve the beat-first product boundary: Arrangement Moves must operate on editable arrangement block state, not imported audio or sampling state.

## Implementation Plan

- [x] Define deterministic Arrangement Move preset helpers for selected arrangement blocks.
- [x] Add selected-block UI buttons for Drop, Build, Hook Lift, and Reset with clear status updates.
- [x] Keep moves undoable, fully editable afterward, and driven only by energy and mutedTracks.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: passed. Arrangement Moves rendered, Drop changed selected block energy to 34% and muted Drums/808, Hook Lift changed energy to 96% and cleared mutes, undo returned to the Drop state, redo returned to Hook Lift, Play/Stop worked, console errors were empty, and a CSS follow-up confirmed Move buttons had no text overflow.

## Review Plan

QA completes before review starts. Review checks that Arrangement Moves are deterministic, selected-block scoped, undoable, editable afterward, preserve Pattern A/B/C data, and keep realtime playback plus WAV/stem/MIDI export semantics driven by existing arrangement block state.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Build moves from existing `energy` and `mutedTracks` fields. | This gives musical structure payoff without adding new file state or hiding generated edits from users. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Selected Arrangement Moves as the next slice because GrooveForge needs faster song-section dynamics for both beginners and producers while staying beat-first and sample-free. |
| 2026-06-15 | harness_builder | Added deterministic Drop, Build, Hook Lift, and Reset helpers over selected arrangement-block energy and mutedTracks state. |
| 2026-06-15 | harness_builder | Added selected-block Arrangement Move buttons and status updates through undoable project history. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for Arrangement Moves. |
| 2026-06-15 | quality_runner | Ran typecheck, QA, quality gate, verify, diff whitespace check, and Browser Arrangement Moves smoke. |

## Completion Notes

Arrangement Moves are implemented as selected-block presets over existing arrangement energy and mutedTracks state. Drop, Build, Hook Lift, and Reset are deterministic, undoable, editable afterward, and do not mutate Pattern A/B/C musical event data or introduce imported audio, sampling, plugin hosting, remote AI, hidden randomness, or new file-version state.
