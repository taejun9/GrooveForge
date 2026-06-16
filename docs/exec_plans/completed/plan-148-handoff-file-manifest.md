# plan-148-handoff-file-manifest

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a UI-local Handoff Pack file manifest so users can see the expected Mix WAV, stem WAV, arrangement MIDI, and Handoff Sheet filenames before clicking export. This should improve professional delivery confidence and help beginners understand which files are produced.

## Non-Goals

- Do not change exported file contents.
- Do not change export click behavior, auto-export files, bundle files, zip files, or rename downloads beyond reusing the existing filename logic.
- Do not change project schema, save/load, playback, render, MIDI, Handoff Sheet contents, or snapshot behavior.
- Do not add sampling, imported audio, plugin hosting, remote AI, cloud sync, accounts, analytics, publishing, licensing, or platform-compliance claims.

## Context Map

- `src/ui/App.tsx`: `HandoffPack`, Handoff Sheet filename, export handlers, and local delivery state.
- `src/audio/render.ts`: actual full-mix WAV and stem WAV filenames.
- `src/audio/midi.ts`: actual arrangement MIDI filename.
- `src/styles.css`: Handoff Pack layout and responsive styles.
- `README.md`: public MVP feature list.
- `docs/product/product.md`: product feature and capability descriptions.
- `docs/quality/rules.md`: Handoff Pack quality boundaries.
- `harness/scripts/run_qa.py`: static expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-148-handoff-file-manifest` and `.worktree/plan-148-handoff-file-manifest` for git repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Export and reuse full-mix/stem filename helpers so manifest labels match actual downloads.
- [x] Add a UI-local Handoff file manifest derived from project title, export analysis, stem analyses, Delivery Target, and Session Brief state.
- [x] Render the manifest inside Handoff Pack with stable test IDs and responsive styling.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for Handoff Pack file manifest presence, expected filenames, and layout containment.

## Review Plan

QA completes before review starts. Review checks filename consistency with export helpers, UI-local derivation, no export semantic drift, layout risk, beginner/pro usefulness, and no sampling/cloud/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add a manifest readout instead of changing export handlers. | The need is visibility before export, not a file packaging behavior change. |
| 2026-06-16 | Reuse actual filename helpers for WAV/stem/MIDI names. | The manifest must not drift from downloaded filenames. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created for Handoff Pack file manifest clarity. |
| 2026-06-16 | harness_builder | Added reusable WAV/stem filename helpers, Handoff file manifest UI, docs, and static QA expectations. |
| 2026-06-16 | quality_runner | `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `npm run qa`, and `npm run verify` passed. |
| 2026-06-16 | quality_runner | CDP smoke passed for `untitled-beat-demo.wav`, four stem WAV names, `untitled-beat-arrangement.mid`, `untitled-beat-handoff.txt`, and manifest containment. |
| 2026-06-16 | review_judge | Reviewed filename helper reuse, export behavior preservation, UI-local scope, layout containment, and no sampling/cloud/remote scope; no findings. |

## Completion Notes

Completed. Handoff Pack now shows a UI-local file manifest for Mix WAV, stem WAVs, arrangement MIDI, and Handoff Sheet before export. The manifest reuses the same filename helpers as the export paths and does not change exported file contents, click behavior, project schema, playback, render, MIDI, or Handoff Sheet contents.
