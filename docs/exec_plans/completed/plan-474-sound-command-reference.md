# plan-474-sound-command-reference

## Status

completed

## Owner

박자

## User Request

Continue building GrooveForge into a desktop beat workstation that working producers can respect and beginners can use easily.

## Goal

Make direct sound design easier to discover from the read-only Command Reference by adding a Sound section for existing Sound Preset, Drum Kit, Sound Focus, Timbre Check, Sound Snapshot A/B, and Space FX surfaces.

## Non-Goals

- Do not change Sound Preset, Drum Kit, Sound Focus, Timbre Check, Sound Snapshot A/B, Space FX, mixer, Space send, project schema, undo/redo history, playback, save/load, render/export, Handoff, or Command Reference open/close behavior.
- Do not add plugin hosting, sample import, sampler tracks, audio clips, waveform editing, recording, remote AI, accounts, analytics, cloud sync, or hidden generation.
- Do not make Command Reference execute commands; it remains static/read-only guidance.

## Context Map

- `src/ui/workstationShellPanels.tsx`: read-only Command Reference sections and rendered command map.
- `src/ui/App.tsx`: existing Sound Preset, Drum Kit, Sound Focus, Sound Snapshot A/B, Space FX Quick Actions and Command Reference result label.
- `src/ui/workstationComposePanels.tsx` and `src/ui/workstationMixPanels.tsx`: existing Sound panel, Timbre Check, Sound Snapshot A/B, and Space FX surfaces.
- `README.md`, `docs/product/product.md`, and `docs/quality/rules.md`: product and QA boundaries.
- `harness/scripts/run_qa.py`: executable source and documentation checks.

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` and `.worktree/plan-NNN-<task>` for git repository work.

## Implementation Plan

- [x] Inspect existing Sound-related command labels and current Command Reference wording.
- [x] Add a read-only Sound section for existing sound design surfaces.
- [x] Update docs and harness expectations.
- [x] Run QA, review, complete plan, and create review mirror.

## QA Plan

- `git diff --check`
- `python3 harness/scripts/run_qa.py`
- `python3 harness/scripts/run_quality_gate.py`
- `npm run typecheck`
- `npm run build`
- `npm run qa`
- `npm run verify`

## Review Plan

QA completes before review starts. Review should confirm the Command Reference remains read-only, documents only existing sound design surfaces, and preserves tone controls, Space FX, project data, undo/redo, playback, save/load, export, Handoff, and sampling boundaries.

## QA Results

- 2026-06-20: `python3 harness/scripts/run_qa.py` passed.
- 2026-06-20: `git diff --check` passed.
- 2026-06-20: `python3 harness/scripts/run_quality_gate.py` passed.
- 2026-06-20: `npm run typecheck` passed.
- 2026-06-20: `npm run build` passed with the existing Vite chunk-size warning.
- 2026-06-20: `npm run qa` passed.
- 2026-06-20: `npm run verify` passed, including runtime smoke for 14/14 sample-free blueprints and 14/14 style profiles.
- 2026-06-20: `npm run dev -- --host 127.0.0.1` could not start in the sandbox because localhost listen failed with `EPERM`; escalated retry was rejected by policy.

## Review

Post-QA review found no blockers. The Command Reference remains read-only and now documents only existing sound design surfaces: Sound Preset, Drum Kit, Sound Focus, Timbre Check, Sound Snapshot A/B, and Space FX. Sound handlers, tone controls, Space FX, project data, undo/redo, playback, save/load, render/export, Handoff, project schema, and sampling boundaries are unchanged.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-06-20 | Add a Command Reference Sound section instead of changing sound handlers. | Sound Preset, Drum Kit, Sound Focus, Timbre Check, Sound Snapshot A/B, and Space FX already exist; discoverability is the next useful increment for beginners and producers. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-06-20 | project_lead | Plan created to make existing direct sound-design controls easier to discover from the desktop command map. |
| 2026-06-20 | repo_cartographer | Confirmed Sound Preset, Drum Kit, Sound Focus, Timbre Check, Sound Snapshot A/B, and Space FX already exist before adding read-only Command Reference rows. |
| 2026-06-20 | harness_builder | Added a Sound section to Command Reference, updated the Command Reference result label, and aligned README, product docs, quality rules, and harness checks. |
| 2026-06-20 | quality_runner | Full QA passed; localhost dev server verification remains blocked by sandbox `listen EPERM` and escalation rejection. |
| 2026-06-20 | review_judge | Reviewed the completed diff after QA; no blocking findings. |

## Completion Notes

Added a read-only Sound section to Command Reference with existing Sound Preset, Drum Kit, Sound Focus, Timbre Check, Sound Snapshot A/B, and Space FX rows. Documentation and harness expectations now keep the direct sound-design path visible without changing sound handlers, tone controls, Space FX, project data, undo/redo, playback, save/load, render/export, Handoff, project schema, or sampling scope.
