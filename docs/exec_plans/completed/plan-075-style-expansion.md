# plan-075-style-expansion

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Continue completing GrooveForge as an all-genre desktop beat workstation that satisfies working composers/producers while staying easy for first-time composers.

## Goal

Add Jersey Club and Phonk as first-class style profiles with deterministic editable Pattern A/B/C event generation, BPM/swing defaults, sound preset mapping, and documentation/QA coverage. This makes the product's all-genre promise more true without introducing samples or sampler-first workflow.

## Non-Goals

- No sampling, imported audio loops, chopping, one-shot mapping, sampler tracks, plugin hosting, remote AI, accounts, analytics, or cloud sync.
- No new project schema fields.
- No style-specific hidden audio assets or opaque generation.
- No changes to WAV/stem/MIDI export semantics beyond the existing event-based render path naturally playing the new style data.

## Context Map

- `src/domain/workstation.ts` owns `StyleId`, `styleProfiles`, `stylePatternBlueprints`, `styleSoundPreset`, migration validation, and style-based Pattern A/B/C generation.
- `src/ui/App.tsx` reads `styleProfiles` for the style selector and uses `createStylePatternSet` through the existing undoable style-change flow.
- `README.md` and `docs/product/product.md` describe the all-genre beat-workstation direction.
- `docs/quality/rules.md` and `harness/scripts/run_qa.py` enforce style-groove and product-boundary expectations.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.
- New styles must be deterministic, sample-free, key-aware, editable Pattern A/B/C event data.

## Implementation Plan

- [x] Add `jersey` and `phonk` to `StyleId`.
- [x] Add Jersey Club and Phonk entries to `styleProfiles`.
- [x] Add Pattern A/B/C blueprints for both styles.
- [x] Map both styles to existing sound presets.
- [x] Update docs and QA expectations for the expanded style set.

## QA Plan

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- Dev-server HTTP 200 check if local server startup is available.

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-16 | Add Jersey Club and Phonk as event-based style profiles, not sample packs. | The product docs already name these workflows, and the core boundary requires direct beat composition from editable events. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-16 | project_lead | Plan created from main after plan-074. |
| 2026-06-16 | harness_builder | Added Jersey Club and Phonk `StyleId` entries, profile rows, Pattern A/B/C blueprints, and sound preset mapping. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and QA expectations for the expanded style set. |
| 2026-06-16 | quality_runner | `npm run typecheck`, `npm run build`, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, and `npm run verify` passed. |
| 2026-06-16 | quality_runner | Worktree dev server returned HTTP 200 at `http://127.0.0.1:5183/`. |
| 2026-06-16 | quality_runner | Browser UI check confirmed the style selector exposes `Jersey Club` and `Phonk`; native select change automation did not update React state in this environment. |

## Completion Notes

Jersey Club and Phonk are now first-class sample-free style profiles. The style selector can apply deterministic, key-aware, editable Pattern A/B/C event data, BPM, swing, and local sound presets for both new styles through the existing undoable style-change path. The work does not add samples, imported audio, hidden assets, remote AI, plugin hosting, accounts, analytics, or cloud sync.

Validation passed:

- `npm run typecheck`
- `npm run build`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run verify`
- `curl -I http://127.0.0.1:5183/` returned HTTP 200 for the worktree dev server.
- Browser UI option check confirmed `Jersey Club` and `Phonk` are visible in the style selector; automated native select changing remained a browser-runtime limitation.
