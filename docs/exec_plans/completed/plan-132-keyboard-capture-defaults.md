# plan-132-keyboard-capture-defaults

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 나처럼 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱을 완성시켜줘.

## Goal

Make Desktop Keyboard Capture more useful for direct beat composition by letting users set captured-note length, velocity, and 808 glide before pressing A/S/D/F/G/H/J/K. This should help beginners enter musical notes with fewer inspector edits and give producers faster sketch control while keeping capture local, explicit, undoable, and sample-free.

## Non-Goals

- Do not add Web MIDI, browser MIDI permissions, audio recording, microphone input, sampler tracks, or imported audio.
- Do not persist Keyboard Capture defaults in the project file.
- Do not add hidden generation, macros, autoplay, auto-save, remote AI, accounts, analytics, or cloud sync.
- Do not change existing manual note grid, selected-note edit tools, playback, export, or project file schemas.

## Context Map

- `src/ui/App.tsx`: Keyboard Capture state, panel, key handlers, captured note creation, note helpers.
- `src/styles.css`: Keyboard Capture panel layout.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, `harness/scripts/run_qa.py`: durable product and QA expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-132-keyboard-capture-defaults` and `.worktree/plan-132-keyboard-capture-defaults`.
- Captured notes remain ordinary editable `BassNote` or `MelodyNote` event data.

## Implementation Plan

- [x] Inspect current Keyboard Capture state, panel, and captured note helper.
- [x] Add UI-local capture defaults for length, velocity, and 808 glide.
- [x] Apply defaults when capturing 808/Synth notes through existing undoable project updates.
- [x] Show the defaults in the Keyboard Capture panel with compact controls and test ids.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA, verify, smoke check, and review.

## QA Plan

- `npm run qa`
- `npm run verify`
- `git diff --check`
- `npm run typecheck`
- `curl -I http://127.0.0.1:5214/`: passed with `HTTP/1.1 200 OK`.
- Local/browser smoke:
  - Keyboard Capture panel renders length and velocity controls.
  - 808 target shows a glide toggle; Synth target keeps glide hidden or disabled.
  - Captured 808 notes use selected length and glide, and captured Synth notes use selected length and velocity.
  - Focused inputs still protect desktop shortcuts/capture keys.

## Review Plan

QA completes before review starts. Review checks that capture defaults are UI-local, captured notes remain editable project events, every capture remains undoable, focused editable targets stay protected, no project schema or MIDI permission scope is added, and sampling/cloud/analytics boundaries remain unchanged.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Keyboard Capture defaults before Web MIDI. | It improves note-entry speed without browser permissions, recording scope, or new persistence risk. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-132 branch and worktree from latest `main`. |
| 2026-06-16 | repo_cartographer | Confirmed Keyboard Capture already routes through undoable `updateCurrentPattern` and focused inputs are protected by the desktop shortcut guard. |
| 2026-06-16 | harness_builder | Added UI-local capture defaults for length, Synth velocity, and 808 glide; captured notes now use those defaults without project schema changes. |
| 2026-06-16 | quality_runner | `npm run qa`, `npm run verify`, `npm run typecheck`, `git diff --check`, and local HTTP smoke passed. In-app Browser click smoke could not run because the `iab` browser session was unavailable. |
| 2026-06-16 | review_judge | Reviewed UI-local defaults, undoable note capture, focused input protection, schema boundaries, and no MIDI/sampling/cloud expansion. |

## Completion Notes

Completed. Keyboard Capture now exposes compact capture defaults in the 808/Melody editor. Users can set captured note length for both targets, Synth velocity for melody capture, and 808 glide for bass capture before pressing A/S/D/F/G/H/J/K. The defaults are UI-local and only affect newly captured notes, while captured notes remain editable local musical events routed through existing undoable project history.
