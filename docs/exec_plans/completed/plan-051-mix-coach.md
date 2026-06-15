# plan-051-mix-coach

## Status

completed

## Owner

project_lead / harness_builder

## User Request

이 제품을 "그냥노청"이나 "그리비룸" 등의 현직 작곡을 하는 사람들도 만족할 수 있고, 작곡을 처음 해보는 사람들도 사용하기 쉬운 데스크탑앱으로 완성시켜줘.

## Goal

Add a deterministic Mix Coach panel that interprets the existing master and stem export meters into concise, actionable mix checks. Beginners should see what to adjust next, while working producers should still see technical evidence such as peak, RMS, headroom, limiter activity, and stem balance without any remote analysis or overclaiming.

## Non-Goals

- No AI mix evaluation, remote calls, imported audio analysis, microphone input, recording, plugin hosting, or automatic mix changes.
- No LUFS, true-peak, platform loudness compliance, mastering guarantee, or claim that mastering fixes a bad mix.
- No changes to realtime playback, WAV/stem export, MIDI export, or saved project file shape.

## Context Map

- `src/ui/App.tsx`: master export meter, stem meters, mixer/master panels, guided/studio mode.
- `src/audio/render.ts`: deterministic export and stem analysis data.
- `src/styles.css`: meter and panel presentation.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`: product/QA framing.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-051-mix-coach` and `.worktree/plan-051-mix-coach`.
- Preserve the beat-first product boundary: Mix Coach reads deterministic musical-event render data and must not become sampling, imported-audio, plugin, or remote AI analysis.

## Implementation Plan

- [x] Derive deterministic mix checks from full export analysis and per-stem analysis.
- [x] Add a Mix Coach panel in the Master area with concise statuses and actionable suggestions.
- [x] Keep the panel read-only and avoid automatic project mutation.
- [x] Update docs, quality rules, and static QA expectations.
- [x] Run QA before review, then move the plan to completed and create the review mirror.

## QA Plan

- `npm run typecheck`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `git diff --check`
- Browser smoke test: passed. Mix Coach rendered 4 checks, changing Drum Drive from 16% to 100% changed the Coach text, the export meter stayed present and updated, Play/Stop worked, grammar check passed, and console errors were empty.

## Review Plan

QA completes before review starts. Review checks that Mix Coach is deterministic, read-only, clear for beginners, technically grounded for producers, avoids LUFS/true-peak/compliance claims, preserves playback/export semantics, and avoids sampling-first drift.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-15 | Build Mix Coach from existing export/stem meter data. | It gives users actionable mix guidance without changing the audio engine, adding remote AI, or introducing unverified loudness claims. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-15 | project_lead | Selected Mix Coach as the next slice because meter interpretation helps beginners act and helps producers make faster export-readiness decisions. |
| 2026-06-15 | harness_builder | Added read-only deterministic Mix Coach checks for headroom, limiter activity, stem balance, and low-end blend. |
| 2026-06-15 | doc_gardener | Updated product docs, quality rules, and static QA expectations for deterministic Mix Coach boundaries. |
| 2026-06-15 | quality_runner | Ran typecheck, QA, quality gate, verify, diff whitespace check, and Browser Mix Coach smoke. |
| 2026-06-15 | review_judge | Reviewed read-only behavior, meter-derived evidence, no LUFS/true-peak claims, playback/export semantics, and beat-first boundary. |

## Completion Notes

Mix Coach is implemented in the Master panel. It reads deterministic full-mix and stem export analysis to show headroom, limiter activity, stem balance, and low-end blend checks. It remains read-only, keeps existing playback/export behavior unchanged, avoids LUFS/true-peak/platform-compliance claims, and does not add imported audio, sampling, plugin hosting, remote AI, or remote analysis.
