# plan-319-mix-snapshot-quick-action-slots

## Status

completed

## Owner

project_lead / harness_builder

## User Request

Continue completing GrooveForge as a desktop beat-making app that can satisfy working composers/producers while staying easy for first-time composers.

## Goal

Make Mix Snapshot A/B Quick Actions easier to trust by showing slot-specific post-run result metrics for Capture A, Capture B, and Clear instead of a generic Mix Snapshot metric.

## Non-Goals

- Do not change Mix Snapshot A/B slot storage, comparison scoring, capture/clear handlers, project schema, save/load, undo/redo, playback, WAV/stem/MIDI export, Mix Balance, Mix Fix, Master Finish, or Handoff behavior.
- Do not add reference audio, audio uploads, rendered reference imports, auto-mixing, auto-mastering, autoplay, auto-export, command chains, sampling, imported audio, remote AI, accounts, analytics, or cloud sync.
- Do not work directly on `main`.

## Context Map

- `src/ui/App.tsx`: Quick Action result metric snapshots/follow-up, Mix Snapshot A/B commands, deterministic export/stem posture helpers.
- `README.md`: Quick Actions and Mix Snapshot feature summaries.
- `docs/product/product.md`: Mix Snapshot and Quick Actions product behavior.
- `docs/quality/rules.md`: Mix Snapshot A/B and Quick Actions guardrails.
- `harness/scripts/run_qa.py`: static expectations for app wiring, docs, and quality rules.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-319-mix-snapshot-quick-action-slots` and `.worktree/plan-319-mix-snapshot-quick-action-slots` for repository work.

## Implementation Plan

- [x] Inspect existing Mix Snapshot A/B Quick Action ids, result status handling, and metric snapshot path.
- [x] Add a local helper that maps Mix Snapshot Quick Action ids to Capture A, Capture B, or Clear.
- [x] Return slot-specific Quick Action result metrics derived from current local export, master, and stem posture for Capture A/B, and a clear-specific slot reset metric for Clear.
- [x] Update durable docs and QA expectations so Mix Snapshot Quick Actions remain UI-local, explicit, deterministic, and sample-free.
- [x] Run QA, review, and complete the plan.

## QA Plan

- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`
- `git diff --check`
- Browser smoke if environment allows localhost: open the workstation, run Capture A, Capture B, and Clear Mix Snapshot Quick Actions, and confirm result metrics identify the slot/action without autoplay/export/sampling behavior.

## Review Plan

QA completes before review starts. Review checks that Mix Snapshot Quick Action result metrics derive only from existing command ids plus current local deterministic export/stem/project state, keep A/B slots UI-local, preserve existing capture/clear handlers, and avoid reference audio, auto-mixing, auto-mastering, autoplay, auto-export, command chains, sampling, imported audio, remote AI, accounts, analytics, or cloud scope.

## QA Results

| command | result |
|---|---|
| `python3 harness/scripts/run_qa.py` | passed |
| `python3 harness/scripts/run_quality_gate.py` | passed |
| `npm run typecheck` | passed |
| `npm run build` | passed with existing Vite large chunk warning |
| `npm run qa` | passed |
| `npm run verify` | passed with runtime smoke and existing Vite large chunk warning |
| `git diff --check` | passed |
| Browser smoke | blocked: sandboxed and escalated localhost dev server attempts failed with `listen EPERM` / environment policy rejection |

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-18 | Add slot-specific Mix Snapshot Quick Action result metrics. | Capture A/B and Clear already exist, but generic result feedback makes the A/B compare workflow less clear after command-palette use. |
| 2026-06-18 | Record Browser smoke as blocked instead of bypassing localhost policy. | The sandbox denied the dev server with `listen EPERM`, and the escalated retry was rejected by environment policy. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-18 | project_lead | Plan created after identifying Mix Snapshot A/B Quick Action result feedback as the next concrete trust/clarity improvement. |
| 2026-06-18 | harness_builder | Added Mix Snapshot Quick Action id mapping plus Capture A, Capture B, and Clear-specific result metrics while preserving existing capture/clear handlers. |
| 2026-06-18 | doc_gardener | Updated README, product, quality, and QA expectations so Mix Snapshot Quick Action slot feedback stays explicit, UI-local, deterministic, and sample-free. |
| 2026-06-18 | quality_runner | Static QA, quality gate, typecheck, build, full QA, verify, and diff checks passed; Browser smoke was blocked by localhost policy. |
| 2026-06-18 | review_judge | Reviewed post-QA scope for local-state derivation, UI-local A/B slots, existing handler routing, and no reference-audio/autoplay/export/sampling/cloud expansion. |
