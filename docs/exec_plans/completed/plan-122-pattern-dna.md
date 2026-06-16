# plan-122-pattern-dna

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that can satisfy working composers/producers while staying easy for beginners. Keep sampling secondary.

## Goal

Add a compact read-only Pattern DNA strip for the selected Pattern A/B/C. It should help beginners see whether the current loop has drums, 808/bass, harmony, and melody, while giving producers a fast scan of density, variation, arrangement usage, and edit posture. The strip must derive only from local project event data and must not mutate project state.

## Non-Goals

- Do not add sampling, imported audio, audio clips, sampler tracks, plugin hosting, remote AI, analytics, accounts, or cloud sync.
- Do not generate or edit notes, drums, chords, arrangement blocks, mixer state, snapshots, or exports.
- Do not trigger playback, save, export, or hidden automation.
- Do not persist Pattern DNA output into project files.
- Do not replace Pattern Compare, Groove Compass, Composer Guide, Beat Map, or Mode Focus.

## Context Map

- Top-level state and render: `src/ui/App.tsx`
- Pattern/event helpers: `src/ui/App.tsx`, `src/lib/project.ts`
- Styling: `src/styles.css`
- Product docs: `README.md`, `docs/product/product.md`
- Quality rules and static harness: `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-122-pattern-dna` and `.worktree/plan-122-pattern-dna`.
- Pattern DNA must remain read-only, local, deterministic, and informational.

## Implementation Plan

- [x] Inspect existing pattern summary, Pattern Compare, Groove Compass, and layout patterns.
- [x] Add Pattern DNA summary types/helper and read-only component.
- [x] Render Pattern DNA near the mode/orientation surfaces without layout overflow.
- [x] Update README, product docs, quality rules, and QA expectations.
- [x] Run QA, verify, and browser smoke for Pattern A/B/C switching.
- [x] Complete review docs and prepare the branch for merge, push, and worktree cleanup.

## QA Plan

- `npm run qa`
- `npm run verify`
- Browser smoke:
  - Pattern DNA appears for the default Pattern A.
  - Switching Pattern B/C updates the Pattern DNA title/detail without mutating musical data.
  - Pattern DNA has four compact cards covering Layers, Density, Variation, and Arrangement use.
  - No console errors or horizontal overflow at desktop and responsive widths.

## Review Plan

QA completes before review starts. Review checks local read-only derivation, beginner/pro usefulness, Pattern A/B/C independence, no hidden automation, no project persistence, no sampling-first drift, and layout regression risk.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add read-only Pattern DNA instead of another mutating pattern generator. | The app already has explicit composition actions; selected-pattern comprehension helps both beginners and producers without surprising edits. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Created plan-122 branch and worktree from latest `main`. |
| 2026-06-16 | repo_cartographer | Confirmed current durable docs already frame GrooveForge as an all-genre beat workstation with sampling secondary. |
| 2026-06-16 | harness_builder | Added Pattern DNA static QA expectations for app code, docs, and sampling guardrails. |
| 2026-06-16 | 제작 | Implemented selected-pattern Pattern DNA summary cards for layers, density, variation signals, and arrangement use. |
| 2026-06-16 | 검증 | `npm run qa`, `npm run verify`, `git diff --check`, and browser smoke passed. Browser checks covered Pattern A/B/C state, four DNA cards, zero console errors, desktop width, 1180px responsive width, and 390px DNA grid collapse. |
| 2026-06-16 | 심사 | Reviewed local read-only derivation, Pattern A/B/C independence, no hidden automation, no persistence, layout risk, and no sampling-first drift. |

## Completion Notes

Completed. Pattern DNA now gives the selected Pattern A/B/C a read-only scan of core layers, density, variation signals, and arrangement usage. It derives from local Pattern A/B/C events and arrangement blocks, does not mutate project state, does not persist output, and keeps GrooveForge centered on direct all-genre beat creation with sampling remaining secondary.
