# plan-156-section-locator-pads

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add Section Locator Pads to the Arrangement panel so users can jump to the first Intro, Verse, Hook, Bridge, or Outro block and cue it as the current Block loop without rewriting arrangement data.

## Non-Goals

- Do not add marker editing, locator persistence, count-in, timeline automation, audio scheduling changes, render/export changes, project schema changes, or save/load migration.
- Do not create, delete, reorder, retime, or rewrite arrangement blocks from locator clicks.
- Do not add sampling, imported audio, sampler tracks, audio input, recording, remote AI, accounts, analytics, cloud sync, or plugin hosting.

## Context Map

- `src/ui/App.tsx`: Arrangement panel, selected arrangement block state, transport loop state, Song Form helpers.
- `src/styles.css`: Arrangement panel controls and compact button rows.
- `README.md`: Arrangement and runtime capability summaries.
- `docs/product/product.md`: Arrangement, Song Form, and MVP capability descriptions.
- `docs/quality/rules.md`: local UI navigation guardrails.
- `harness/scripts/run_qa.py`: static expectations for docs and source tokens.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-156-section-locator-pads` and `.worktree/plan-156-section-locator-pads` for repository work.
- Keep root Markdown limited to `README.md` and `AGENTS.md`.

## Implementation Plan

- [x] Inspect current arrangement selection, Song Form, and transport loop paths.
- [x] Add derived Section Locator Pad data for arrangement sections.
- [x] Render compact Section Locator Pads in the Arrangement panel with stable test IDs.
- [x] Route pad clicks through existing block selection plus UI-only Block loop cueing.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA and browser smoke, then complete review and move the plan to completed.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `npm run qa`
- `npm run typecheck`
- `git diff --check`
- `npm run verify`
- Local browser smoke for Section Locator rendering, Hook selection/cueing, Transport Position Readout reflecting Block loop, layout containment, and no console errors.

QA evidence:

- `python3 harness/scripts/run_qa.py` passed.
- `npm run qa` passed.
- `npm run typecheck` passed.
- `git diff --check` passed.
- `npm run verify` passed, with Vite's existing chunk-size warning only.
- Browser smoke at `http://127.0.0.1:5247/` passed for 5 Section Locator Pads, Hook cue to Block 3 / Pattern B, Transport Position Readout `Cued Hook` at Bar 7.1, undo button remaining disabled, horizontal overflow false, and console errors 0.

## Review Plan

QA completes before review starts. Review checks that locator pads derive only from arrangement blocks, mutate only UI selection/transport loop state, preserve arrangement data/export/playback semantics, remain useful for beginner/pro structure scanning, and add no sampling/remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-17 | Add locators in the Arrangement panel instead of the global transport strip. | Section jumps belong to song structure editing and should not further crowd the top command strip. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-17 | project_lead | Plan created for Section Locator Pads. |
| 2026-06-17 | harness_builder | Added derived Section Locator Pads and UI-local cueing through existing block selection plus Block loop state. |
| 2026-06-17 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for Section Locator Pads. |
| 2026-06-17 | quality_runner | Passed static QA, typecheck, diff check, verify, and browser smoke for locator rendering, Hook cueing, undo preservation, and layout containment. |
| 2026-06-17 | review_judge | Reviewed local derivation, stopped-only cueing, no arrangement mutation, no scheduler/export/schema changes, and no sampling/remote scope; no findings. |

## Completion Notes

- The Arrangement panel now includes Section Locator Pads for Intro, Verse, Hook, Bridge, and Outro.
- Each pad derives its first matching block, Pattern A/B/C assignment, bar range, energy, event count, selected state, and tone from local arrangement and pattern data.
- Clicking an available pad while playback is stopped selects that block through existing selected-block navigation and sets the UI-local transport loop scope to Block.
- Missing sections are shown disabled, and locator clicks do not create undo history or mutate arrangement blocks, Pattern A/B/C musical events, mixer, master, export, snapshots, project schema, or optional-sampling scope.
