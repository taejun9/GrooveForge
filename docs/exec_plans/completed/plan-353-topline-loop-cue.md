# plan-353-topline-loop-cue

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop beat workstation that satisfies working producers while staying approachable for beginners.

## Goal

Add a UI-local Topline Loop cue path from Topline Space so users can immediately audition the vocal/topline pocket being described. If a Hook arrangement block exists, cue that block as the existing Block loop; if no Hook is arranged yet, cue the selected Pattern as the existing Pattern loop. This should help producers quickly judge room for a rapper/singer/lead and help beginners hear when the beat is too crowded before editing.

## Non-Goals

- Do not mutate arrangement blocks, Pattern A/B/C musical events, mixer/master state, save/load data, export behavior, or project schema.
- Do not auto-play, auto-write toplines, auto-arrange hooks, auto-mix, auto-master, or auto-export.
- Do not add vocal recording, lyric generation, reference-track upload, audio analysis, stem separation, sampling, imported audio, remote AI, accounts, analytics, payments, or cloud sync.

## Context Map

- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Keep topline cue state UI-local and out of saved project schema.
- Route visible Cue buttons and Quick Actions Topline Loop commands only through existing arrangement selection, Pattern selection, and transport loop state.
- Preserve existing Topline Space focus behavior, Hook Loop cue behavior, Song/Block/Turn/Pattern loop behavior, playback scheduling, exports, and project schema.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.

## Implementation Plan

- [x] Derive a Topline Loop cue target from the first Hook block or selected Pattern.
- [x] Add visible Cue controls to Topline Space cards that prepare the appropriate Block or Pattern loop without autoplay.
- [x] Add Quick Actions for current Topline Loop cue and direct Topline Space cue commands.
- [x] Update docs, quality rules, and harness expectations.
- [x] Run QA, review, move plan to completed, and create review mirror.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run harness:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`

## Review Plan

QA completes before review starts. Review should verify Topline Loop cue derives only from the first existing Hook block or selected Pattern, keeps cue state UI-local, does not autoplay, and preserves Topline Space focus, Hook Loop cue, arrangement data, render/export, save/load, and schema behavior.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Use Hook block first, selected Pattern fallback second. | Topline Space can judge a Hook pocket when arranged, but beginners still need a fast current-loop audition before they have arranged a Hook block. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created in `codex/plan-353-topline-loop-cue`. |
| 2026-06-18 | harness_builder | Added Topline Loop cue target derivation, Topline Space Cue buttons, current/card Quick Actions, result metrics, follow-up cues, docs, quality rules, and harness expectations. |
| 2026-06-18 | quality_runner | Passed `python3 harness/scripts/run_qa.py`, `npm run typecheck`, `git diff --check`, `python3 harness/scripts/run_quality_gate.py`, `npm run harness:smoke`, `npm run build`, `npm run qa`, and `npm run verify`. |
| 2026-06-18 | quality_runner | Browser visual verification was attempted but blocked by sandbox dev-server binding restrictions and rejected escalated dev-server execution. |
| 2026-06-18 | review_judge | Review found no code changes required; residual risk is limited to deferred live browser screenshot verification and the existing Vite large chunk warning. |

## Completion Notes

Topline Loop cue is implemented as UI-local state: Topline Space cards expose Cue buttons, Quick Actions can cue the current or card-specific Topline Loop, and all cue paths use the first existing Hook block as a Block loop or fall back to the selected Pattern loop without autoplay. The change does not mutate arrangement blocks, Pattern A/B/C events, mixer/master state, save/load, render/export, project schema, or sampling scope. QA and review completed; live browser visual verification remains deferred because the environment blocked local dev-server browser routes.
