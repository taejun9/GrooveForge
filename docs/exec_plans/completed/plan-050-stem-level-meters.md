# plan-050-stem-level-meters

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 완성시켜줘.

## Goal

Add export-based stem level meters to the mixer so users can see each core track's rendered peak/RMS/headroom status while mixing. The meters should use the same deterministic arrangement render path as WAV/stem export, stay local and sample-free, and make mix balance easier for beginners without hiding technical values from working producers.

## Non-Goals

- No realtime analyzer, microphone input, recording, imported audio, sample browser, plugin hosting, LUFS/true-peak claims, or remote processing.
- No change to stem export file semantics or arrangement playback scheduling.
- No new mixer automation system.

## Context Map

- `src/audio/render.ts`: deterministic offline render and export analysis.
- `src/ui/App.tsx`: mixer strip rendering and master export meter.
- `src/styles.css`: mixer and meter presentation.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product/QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-050-stem-level-meters` and `.worktree/plan-050-stem-level-meters`.
- Preserve the beat-first product boundary: stem meters are mix/export feedback over editable musical events, not sampling or imported audio analysis.

## Implementation Plan

- [x] Expose deterministic per-stem export analysis from the offline render path.
- [x] Show compact peak/RMS/headroom meters in mixer strips for Drums, 808, Synth, and Chords.
- [x] Keep the Master panel's full-mix export meter behavior intact.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: passed. Mixer strips displayed 4 stem meters, changing Drum Drive from 16% to 100% updated the drum stem peak from -4.7 dB to -3.1 dB and RMS from -22.6 dB to -20.8 dB, the full export meter remained present and updated, Play/Stop worked, and console errors were empty.

## Review Plan

QA completes before review starts. Review checks that stem meters use deterministic export analysis, remain scoped to core musical stems, do not mutate project state, do not claim LUFS/true-peak, preserve existing export/playback semantics, and avoid sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Use offline stem export analysis instead of a realtime analyzer. | It reuses verified deterministic rendering, avoids browser AudioWorklet/analyzer complexity, and aligns the readout with what users will export. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Selected stem level meters as the next completion slice because mix feedback helps both working producers and beginners without changing the product into a sampling app. |
| 2026-06-15 | harness_builder | Added deterministic stem export analysis, compact mixer stem meters, product docs, quality rules, and static QA expectations. |
| 2026-06-15 | quality_runner | Ran typecheck, QA, quality gate, verify, diff whitespace check, and Browser stem meter smoke. |
| 2026-06-15 | review_judge | Reviewed deterministic render scope, no LUFS/true-peak claim drift, playback/export semantics, and beat-first boundary. |

## Completion Notes

Mixer strips now show deterministic export-based stem meters for Drums, 808, Synth, and Chords. Each meter reports peak, RMS, headroom, and status from the same offline render path used for stem export, while the existing Master export meter remains unchanged. The work adds mix feedback without imported audio, sampling workflows, plugin hosting, or remote analysis.
