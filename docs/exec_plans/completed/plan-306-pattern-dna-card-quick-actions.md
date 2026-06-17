# plan-306-pattern-dna-card-quick-actions

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Expose direct Pattern DNA card focus commands through Quick Actions so beginners can jump to Layers, Density, Variation, or Arrangement DNA checks and producers can inspect any loop posture lane from command search without changing Pattern DNA derivation, project data, arrangement, or playback.

## Non-Goals

- Do not change Pattern DNA derivation, Pattern A/B/C events, arrangement blocks, mixer, master, exports, save/load, undo/redo, Pattern Compare, direct editing semantics, Handoff Pack, Handoff Sheet, or render behavior.
- Do not add auto-editing, auto-play, auto-arrangement, auto-rendering, auto-export, audio analysis, reference-track upload, tutorials, onboarding overlays, macros, command chains, hidden generation, sampling, imported audio, remote AI, accounts, analytics, plugin hosting, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: `patternDnaSummary.cards`, `activePatternDnaQuickActionCard`, `focusPatternDnaCard`, Quick Actions generation, result metrics, and follow-up feedback.
- `README.md`: MVP feature summary and command-search description.
- `docs/product/product.md`: Pattern DNA and Quick Actions product behavior.
- `docs/quality/rules.md`: Pattern DNA and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-306-pattern-dna-card-quick-actions` and `.worktree/plan-306-pattern-dna-card-quick-actions` for repository work.

## Implementation Plan

- [x] Inspect existing Pattern DNA focus and Quick Actions result patterns.
- [x] Add one Quick Action per Pattern DNA card that reuses the existing focus handler.
- [x] Add local result metric/follow-up copy for direct Pattern DNA focus commands without mutating project data, arrangement, or events.
- [x] Update durable docs and QA expectations to keep the commands scoped to UI-local focus navigation.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run direct Pattern DNA Quick Actions, confirm each command focuses the matching card without Pattern A/B/C event changes, arrangement mutation, autoplay, console errors, or desktop horizontal overflow.

## Review Plan

QA completes before review starts. Review checks that Pattern DNA direct commands derive only from existing Pattern DNA cards, route only to the existing focus handler, keep result feedback UI-local, preserve Pattern DNA derivation/project data/playback/export/save/load/undo semantics, and avoid autoplay, sampling, cloud, or remote scope.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add direct Quick Actions for Pattern DNA focus cards. | Loop posture checks are core to direct beat composition; direct command access improves beginner guidance and producer scanning without changing events or arrangement data. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after confirming Pattern DNA has visible focus controls and one highest-priority Quick Action, but no direct per-card commands. |
| 2026-06-18 | harness_builder | Added direct Pattern DNA card Quick Actions, UI-local result/follow-up copy, documentation, and harness expectations. |
| 2026-06-18 | quality_runner | `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, `npm run qa`, and `git diff --check` passed. |
| 2026-06-18 | quality_runner | Browser smoke was blocked because Vite could not bind `127.0.0.1:5330` with `listen EPERM`, and the escalated localhost retry was rejected. |
| 2026-06-18 | review_judge | Reviewed the diff after QA and found no follow-up issues; commands derive from existing Pattern DNA cards and route only through the existing focus handler. |

## Completion Notes

- Added direct Quick Actions for Pattern DNA Layers, Density, Variation, and Arrangement cards.
- Commands derive from existing `patternDnaSummary.cards`, route through `onFocusPatternDna(card)`, and keep result metrics/follow-up copy UI-local.
- Updated README, product docs, quality rules, and harness expectations to preserve all-genre direct beat composition scope while keeping sampling, imported audio, autoplay, remote AI, accounts, analytics, and cloud sync out of scope.
- QA passed: `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run verify`, `npm run qa`, and `git diff --check`.
- Browser smoke was not completed because localhost binding failed with `listen EPERM` on `127.0.0.1:5330`, and the escalated retry was rejected.
