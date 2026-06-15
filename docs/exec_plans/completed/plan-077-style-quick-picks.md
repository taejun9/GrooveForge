# plan-077-style-quick-picks

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add visible Style Quick Picks to the Style Inspector so users can apply any supported genre through explicit buttons instead of relying only on a dropdown. This improves all-genre discoverability for beginners, speeds up producer auditioning, and gives browser QA a reliable style-change path that uses the existing undoable style-selection logic.

## Non-Goals

- No new style IDs, style generation rewrite, project schema fields, sample import, chopping, sampler tracks, audio warping, imported loops, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No hidden automatic generation or autoplay.
- No changes to WAV/stem/MIDI export semantics beyond existing style application changing local Pattern A/B/C event data.

## Context Map

- `src/ui/App.tsx` owns Style Inspector rendering and the existing `selectStyle` update path.
- `src/styles.css` owns the compact workstation layout.
- `src/domain/workstation.ts` owns `styleProfiles`, `styleSoundPreset`, and `createStylePatternSet`.
- `README.md`, `docs/product/product.md`, `docs/quality/rules.md`, and `harness/scripts/run_qa.py` keep product and QA expectations aligned.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- Quick Picks must call the same undoable style-change path as the existing selector.

## Implementation Plan

- [x] Extend Style Inspector with all style profiles as visible quick-pick buttons.
- [x] Route each quick-pick button through the existing `selectStyle` handler.
- [x] Show selected state, default BPM, bass role, and melody role compactly without layout overflow.
- [x] Update docs and QA expectations for the explicit style quick-pick path.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Browser smoke: click Jersey Club and Phonk quick picks, confirm Style Inspector and style select state update.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add button-based Style Quick Picks inside Style Inspector. | A visible, explicit button path improves genre discovery and avoids native-select automation fragility while reusing the existing undoable style application path. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from clean main after plan-076. |
| 2026-06-16 | harness_builder | Added Style Quick Picks to Style Inspector and routed buttons through existing `selectStyle`. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for the quick-pick path. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `npm run build`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify` passed. |
| 2026-06-16 | quality_runner | Worktree dev server returned HTTP 200 at `http://127.0.0.1:5185/`; browser smoke clicked Jersey Club and Phonk quick picks and confirmed Inspector text, style select value, undo availability, no horizontal overflow, and no console errors. |

## Completion Notes

Style Quick Picks are implemented inside Style Inspector. All supported genres are visible as explicit buttons with selected state, default BPM, bass role, and melody role. Clicking a quick-pick button calls the existing `selectStyle` handler, so style changes keep the same undoable Pattern A/B/C generation, BPM, swing, and sound preset behavior as the original selector.

Validation passed:

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `curl -I http://127.0.0.1:5185/` returned HTTP 200 for the worktree dev server.
- Browser smoke clicked `style-quick-jersey` and `style-quick-phonk`, confirmed `style-select` values changed to `jersey` and `phonk`, Style Inspector text updated, undo became available, horizontal overflow stayed false, and console errors were empty.
