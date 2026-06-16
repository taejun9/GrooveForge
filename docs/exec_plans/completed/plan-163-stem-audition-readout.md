# plan-163-stem-audition-readout

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a compact Stem Audition Readout in the Mixer panel that states whether the user is hearing the full mix or a specific soloed stem, so mix checking is clearer without changing mixer behavior.

## Non-Goals

- Do not change audio scheduling, audio synthesis, realtime mixer math, render/export output, project schema, save/load migration, arrangement data, Pattern A/B/C event data, sound design, master, snapshots, or Handoff state.
- Do not add new solo/mute behavior, auto-solo, auto-mute, audio preview rendering, waveform analysis, stem comparison scoring, or export-side stem changes.
- Do not replace Stem Audition Pads, Mix Balance Pads, mixer channel role readouts, Stem Level Meters, Mix Coach, Master Output Role Readout, Handoff Pack, or export preflight.
- Do not add sampling, imported audio, sample packs, waveform display, remote AI, accounts, analytics, cloud sync, or plugin hosting.

## Context Map

- `src/ui/App.tsx`: mixer state, stem audition pad state, Mixer panel rendering.
- `src/styles.css`: Stem Audition Readout visual state.
- `README.md`: mixer/stem audition summary.
- `docs/product/product.md`: mixer and transport/mix workflow descriptions.
- `docs/quality/rules.md`: Stem Audition Readout guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-163-stem-audition-readout` and `.worktree/plan-163-stem-audition-readout` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current Stem Audition Pad and mixer solo/mute rendering.
- [x] Add UI-local Stem Audition Readout text derived from current mixer solo/mute state.
- [x] Style full-mix, solo, and custom/partial audition states without layout shift.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Local browser smoke for default Full Mix, Drums stem audition, and manual custom mute/solo state.

## Review Plan

QA completes before review starts. Review checks UI-local derivation from mixer solo/mute state, no mixer mutation from the readout, no audio/render/export/schema changes, no Stem Audition Pad regression, no layout regression, and no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add a readout instead of changing Stem Audition Pad behavior. | Users need to see what they are hearing during mix checks without altering existing solo/mute workflows. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Stem Audition Readout. |
| 2026-06-17 | harness_builder | Added `StemAuditionReadoutSummary` derived from mixer solo/mute state with Full Mix, single stem solo, custom audition, and silent states. |
| 2026-06-17 | repo_cartographer | Updated README, product docs, quality guardrails, and harness expectations for Stem Audition Readout. |
| 2026-06-17 | quality_runner | QA passed with `python3 harness/scripts/run_qa.py`, `npm run qa`, `npm run typecheck`, `python3 harness/scripts/run_quality_gate.py`, `npm run verify`, and `git diff --check`. |
| 2026-06-17 | review_judge | Browser smoke passed: default Full Mix showed `Hearing Full Mix`; Drums audition showed `Hearing Drums Stem`; manual 808 mute showed `Custom audition`; no console errors or horizontal overflow. |

## Completion Notes

Stem Audition Readout is complete as UI-local state derived from mixer solo/mute state. It clarifies full-mix, solo-stem, and manual custom audition context without changing Stem Audition Pad behavior, mixer math, playback scheduling, render/export output, undo history, project schema, sampling scope, or remote/cloud boundaries.
