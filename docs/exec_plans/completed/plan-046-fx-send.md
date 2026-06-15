# plan-046-fx-send

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 완성시켜줘.

## Goal

Add beginner-safe mixer send effects so users can add shared space to drums, 808, synth, and chords without leaving GrooveForge. The feature must be local, deterministic, editable in project state, audible in realtime playback and offline WAV export, compatible with stem export semantics, and still keep the product centered on direct beat composition rather than sampling.

## Non-Goals

- No plugin hosting, convolution impulse responses, imported samples, cloud effects, automation lanes, or per-note effect routing.
- No replacement of existing sound preset tone controls or channel EQ/dynamics.
- No complex multi-bus mixer rewrite.

## Context Map

- `src/domain/workstation.ts`: project state, mixer channel model, save/load migration.
- `src/audio/scheduler.ts`: realtime Web Audio channel routing.
- `src/audio/render.ts`: deterministic offline WAV/stem rendering.
- `src/ui/App.tsx`: mixer strip controls.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-046-fx-send` and `.worktree/plan-046-fx-send` for git repository work.
- Effects must derive from built-in deterministic processing, not imported audio or sample assets.

## Implementation Plan

- [x] Extend mixer channel state with a normalized `send` amount and migrate older project files safely.
- [x] Add a shared FX return to realtime playback and offline render so send amount is audible while preserving channel volume, pan, mute/solo, arrangement mutes, and master ceiling behavior.
- [x] Add compact mixer UI controls for send amount with beginner-readable labels.
- [x] Update product docs, quality rules, and static QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run verify`
- [x] `git diff --check`
- [x] Browser smoke test: changed Synth Space send from 26% to 47%, confirmed the UI readout and slider updated, playback still starts/stops, WAV/MIDI controls remain available, and console errors are empty.

## Review Plan

QA completes before review starts. Review checks that send effects are deterministic, persist through project files, affect realtime playback and full-mix WAV export, do not leak muted/soloed/arrangement-muted tracks into the effect return, preserve stem isolation semantics, and do not introduce sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add a single built-in shared Space send before plugin hosting or sample-based effects. | It improves mix polish for working producers and gives beginners one understandable ambience control without expanding scope into native plugin or sampling workflows. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created to add a small but audible mixer polish feature aligned with direct beat creation. |
| 2026-06-15 | harness_builder | Added normalized mixer `send` state, migration defaults, realtime Space bus routing, deterministic offline Space return, and mixer UI controls. |
| 2026-06-15 | doc_gardener | Updated README, product docs, architecture docs, quality rules, and static QA expectations for built-in Space send FX. |
| 2026-06-15 | quality_runner | Ran typecheck, QA, quality gate, verify/build, diff check, and Browser smoke. |
| 2026-06-15 | review_judge | Reviewed send routing for mute/solo/arrangement mute boundaries, stem isolation, and sampling-free scope. |

## Completion Notes

Implemented built-in Space send FX. Each non-master mixer channel now has a normalized `send` amount that persists in project files and migrates older files to 0. Realtime playback routes eligible channel output to a shared Space delay/feedback return, while offline WAV/stem rendering applies deterministic Space return processing from the same mixer data. The mixer UI exposes Space range and percent inputs, and product/quality docs keep the feature framed as local beat-workstation mixing rather than sampling, imported audio, or plugin hosting.
