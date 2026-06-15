# plan-045-midi-export

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 완성시켜줘.

## Goal

Add one-click MIDI export for the current arrangement so working producers can continue the beat in other DAWs while beginners can keep composing inside GrooveForge. MIDI export must render editable project event data for drums, 808/bass, synth melody, and chords, follow arrangement Pattern A/B/C assignments and block lengths, preserve BPM/key musical timing, remain deterministic, and stay sample-free.

## Non-Goals

- No MIDI input, recording, clock sync, device routing, plugin hosting, piano-roll rewrite, or external DAW automation.
- No sampling, audio import, chopping, sampler tracks, remote AI, or audio warping.
- No replacement of WAV/stem export; MIDI export is an additional event-data export path.

## Context Map

- `src/domain/workstation.ts`: project/pattern/arrangement/chord helpers and event data.
- `src/audio/render.ts`: arrangement traversal patterns for offline exports.
- `src/ui/App.tsx`: command strip export actions and project status.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product and QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-045-midi-export` and `.worktree/plan-045-midi-export` for git repository work.
- MIDI export must derive from local musical events and built-in pattern data, not from rendered audio or imported samples.

## Implementation Plan

- [x] Add a deterministic Standard MIDI File writer for arrangement-level drum, 808, synth, and chord tracks.
- [x] Wire a `MIDI` export command into the workstation command strip with browser and desktop-safe download behavior.
- [x] Update product docs, quality rules, and static QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- [x] `npm run typecheck`
- [x] `python3 harness/scripts/run_qa.py`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run verify`
- [x] `git diff --check`
- [x] Browser smoke test: MIDI export button is unique, clicking it changes status to `Exported MIDI`, playback still starts/stops, and console errors are empty. Codex in-app Browser reports downloads are unsupported, so the `.mid` artifact itself could not be captured through that browser surface.

## Review Plan

QA completes before review starts. Review checks that the MIDI file is deterministic, uses project musical events, follows arrangement assignments and lengths, includes drum/808/synth/chord tracks, avoids sampling/audio dependencies, and does not regress WAV/stem export.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Add MIDI export before MIDI input. | Exporting editable event data to other DAWs helps working producers immediately and is lower risk than device/input workflows. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Plan created to improve DAW handoff while keeping GrooveForge composition-first. |
| 2026-06-15 | harness_builder | Added a deterministic Standard MIDI File writer and wired the `MIDI` command into the workstation command strip. |
| 2026-06-15 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for arrangement MIDI export while preserving beat-first framing. |
| 2026-06-15 | quality_runner | Ran typecheck, QA, quality gate, verify, diff check, and Browser smoke. Browser download capture is unavailable in Codex in-app Browser, but the export status and playback path passed without console errors. |
| 2026-06-15 | review_judge | Reviewed MIDI export for deterministic event-data output, arrangement semantics, sample-free scope, and WAV/stem export isolation. |

## Completion Notes

Implemented arrangement MIDI export as deterministic Standard MIDI File bytes with tempo, drum, 808, synth, and chord tracks. The export follows arrangement Pattern A/B/C assignments, block lengths, track mutes, energy, BPM, drum repeats, note/chord lengths, event chance gates, and chord inversions. The command strip now includes a `MIDI` export action, and product/quality docs continue to frame GrooveForge as an all-genre beat workstation with sampling only as an optional later module.
