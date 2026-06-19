# plan-418-beat-terms-reference

## Status

Complete

## Owner

project_lead / plan_keeper

## User Request

Continue building GrooveForge into a desktop app that satisfies working producers such as 그냥노창 or 그루비룸 while staying easy for first-time composers.

## Goal

Add a UI-local Beat Terms reference inside Command Reference so beginners can understand core workstation language without interrupting professional workflows, while producers keep the dense command map and shortcut path intact.

## Non-Goals

- No project schema change, onboarding overlay, tutorial wizard, command execution change, shortcut change, save/load change, playback change, export change, sampling workflow, audio import, remote AI, accounts, analytics, or cloud sync.

## Context Map

- Command Reference UI: `src/ui/workstationShellPanels.tsx`
- Command Reference styles: `src/styles.css`
- Product docs: `README.md`, `docs/product/product.md`
- Quality/static QA: `docs/quality/rules.md`, `harness/scripts/run_qa.py`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-418-beat-terms-reference` and `.worktree/plan-418-beat-terms-reference` for git repository work.
- Keep GrooveForge framed as all-genre direct beat composition; sampling remains optional later scope.

## Implementation Plan

- [x] Add static Beat Terms data and UI to Command Reference.
- [x] Style the terms section responsively inside the existing dialog.
- [x] Update docs and static QA expectations.
- [x] Run QA and review.
- [x] Move plan to completed and create review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-19 | Add Beat Terms inside Command Reference instead of a blocking tutorial. | Keeps pro workflow fast while giving beginners a discoverable explanation layer. |
| 2026-06-19 | Keep the feature UI-local and read-only. | Avoids schema, command, playback, export, and sampling scope changes. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-19 | project_lead | Plan created. |

## Completion Notes

- Added a read-only Beat Terms section inside Command Reference for Pattern, Drums, 808/Bass, Chords, Sound, Arrangement, Mix/Master, and Handoff.
- Added `beat-terms-reference` as a focus-only Quick Action that opens the existing Command Reference dialog.
- Updated README, product docs, quality rules, and static QA expectations.

## QA Log

- Pass: `git diff --check`
- Pass: `python3 harness/scripts/run_qa.py`
- Pass: `python3 harness/scripts/run_quality_gate.py`
- Pass: `npm run typecheck`
- Pass: `npm run build` (existing Vite/Rolldown >500 kB chunk warning remains)
- Pass: `npm run qa`
- Pass: `npm run verify` (runtime smoke, typecheck, and build passed; existing chunk warning remains)
- Blocked: `npm run dev -- --host 127.0.0.1` failed with sandbox `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by the environment, so browser verification could not run in this session.

## Review

- No code findings after self-review.
- Beat Terms is static, read-only, and UI-local.
- The new Quick Action opens the existing Command Reference path and does not mutate project data.
- No sampling, audio import, playback, render/export, schema, remote AI, analytics, or cloud scope was added.
