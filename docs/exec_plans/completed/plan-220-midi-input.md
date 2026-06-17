# plan-220-midi-input

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue making GrooveForge into a desktop beat-making app that can satisfy working composers/producers while remaining easy for beginners.

## Goal

Add explicit local Web MIDI input capture so users can connect a MIDI keyboard/controller and write scale-mapped 808 or Synth notes into the selected Pattern without changing project schema or requiring samples.

## Non-Goals

- Do not add MIDI file import, MIDI output, controller mapping, clock sync, recording lanes, quantized takes, audio input, sampling, imported audio, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- Do not request System Exclusive MIDI access.
- Do not change project schema, save/load migration, render/export contents, playback scheduling, undo/redo semantics, or existing keyboard capture behavior.
- Do not auto-arm MIDI, auto-record, autoplay, autosave, or auto-export.

## Context Map

- `src/ui/App.tsx` owns keyboard capture, note insertion, selected Pattern state, and UI status.
- `src/vite-env.d.ts` can define local Web MIDI typings missing from TypeScript DOM libs.
- `src/styles.css` owns workstation panel styling.
- `docs/references/official-sources.md` records official-source evidence.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md` describe durable product behavior and guardrails.
- `harness/scripts/run_qa.py` enforces docs/code expectations.

## Official Source Notes

- W3C/WebAudio Web MIDI API draft states `navigator.requestMIDIAccess()` requests access to MIDI devices, MIDI is a low-level event protocol rather than audio, and System Exclusive access has greater privacy/security implications.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Add local Web MIDI typings and UI-local MIDI capture state.
- [x] Add explicit request/refresh controls for non-SysEx MIDI input access.
- [x] Parse Note On events only and map incoming notes to existing 808/Synth pattern-note insertion paths.
- [x] Show device/status/latest-note feedback without persisting MIDI device ids or messages in project files.
- [x] Update official sources, README, product docs, quality rules, and QA harness expectations.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `git diff --check`
- `npm run qa`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Hardware/browser MIDI smoke only if the environment provides policy-safe MIDI device access.

## Review Plan

QA completes before review starts. Review should verify explicit permission flow, no SysEx, UI-local state only, no hidden recording/automation, existing undoable project updates, and no sampling/imported-audio drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add Web MIDI input as an explicit local capture surface. | External keyboard entry is a core pro workflow and helps beginners play notes directly while keeping the beat event-based and sample-free. |
| 2026-06-17 | Avoid SysEx and persistent MIDI device storage. | The first pass only needs note entry and should minimize permission/privacy surface. |
| 2026-06-17 | Keep Web MIDI separate from desktop Keyboard Capture. | Desktop keyboard capture should not prompt for browser MIDI access, while Web MIDI has its own explicit Connect and Arm controls. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created in `codex/plan-220-midi-input`. |
| 2026-06-17 | harness_builder | Added Web MIDI typings, local capture state, explicit Connect/Arm/Refresh controls, Note On parsing, scale-mapped 808/Synth note insertion, and panel styling. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality rules, official sources, and harness expectations to frame Web MIDI as direct composition input rather than sampling. |
| 2026-06-17 | quality_runner | Passed `npm run typecheck`, `python3 harness/scripts/run_qa.py`, `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify`. Local dev-server browser smoke could not run because sandbox and escalation policy denied binding `127.0.0.1:5173`; no hardware MIDI device was available in this environment. |

## Completion Notes

Web MIDI Input now appears beside Desktop Keyboard Capture as an explicit local note-entry path. Users can request local MIDI access with `sysex: false`, pick all connected inputs or one connected input, arm capture, and route Note On messages into the selected 808 or Synth Pattern A/B/C lane through existing undoable note insertion and Keyboard Capture defaults. MIDI access, device status, and latest-note feedback stay UI-local and out of the project schema. Sampling, imported audio, MIDI output, clock sync, controller mapping, background recording, remote AI, accounts, analytics, and cloud sync remain out of scope.

Residual risk: browser rendering and hardware MIDI smoke were not completed because the environment refused local dev-server port binding and no MIDI controller was available. Static typecheck, harness, quality gate, production build, and diff checks passed.
