# plan-1438-local-draft-defer-sync

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

Make GrooveForge polished enough for working composers while remaining easy to understand for first-time users.

## Goal

Let users defer a discovered local recovery copy without deleting or restoring it, and keep the visible/Quick Actions recovery state synchronized when a new edit replaces the single local draft slot.

## Non-Goals

- Adding multiple autosave slots, cloud recovery, accounts, sync, or remote storage.
- Changing the local draft key, record version, parser, size limit, project schema, or durable project files.
- Auto-restoring, auto-clearing, or silently deleting a discovered recovery copy.
- Changing undo/redo, playback, audio, export, Handoff, or sampling behavior.

## Context Map

- `src/ui/App.tsx`: recovery state, local draft writes, restore/clear routing, and project safety readout.
- `src/ui/workstationShellPanels.tsx`: visible recovery banner and its explicit actions.
- `src/ui/workstationAppHelpers.tsx`: compact project-safety summary.
- `src/styles.css`: recovery action layout and deferred-state affordance.
- `harness/scripts/run_renderer_smoke.mjs`: source/render contracts for defer and synchronization behavior.
- `electron/main.ts` and `harness/scripts/run_desktop_launch_smoke.mjs`: live localStorage recovery evidence and explicit interaction.
- `docs/product/product.md` and `docs/quality/rules.md`: local-first recovery behavior and preservation boundaries.

## Constraints

- QA completes before a separate review starts.
- Update the Decision Log when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- `Not now` must be session-only and must not write, remove, parse, or mutate the local recovery record.
- Restore and Clear remain explicit actions and stay available through Quick Actions while a deferred recovery still exists.
- The first successful local draft write after a new edit must remove the now-replaced recovery prompt and stale in-memory restore target.
- Copy must distinguish a deferred recovery copy from the current project and explain where it remains available.

## Implementation Plan

- [x] Add session-only defer state and a visible `Not now` recovery action.
- [x] Keep the compact project safety readout truthful while recovery is deferred.
- [x] Synchronize recovery state after successful single-slot draft replacement.
- [x] Preserve explicit Restore/Clear banner and Quick Actions behavior until defer or replacement.
- [x] Add renderer evidence for non-destructive defer/post-edit synchronization and live Electron regression evidence for the complete workstation.
- [x] Update product/quality documentation, run focused/full QA, then perform a separate review.

## QA Plan

- Run `npm run qa`, `npm run typecheck`, and `npm run renderer:smoke`.
- Run `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run harness:smoke`.
- Run `npm run build`, `npm run desktop:launch-smoke`, and `npm run desktop:project-io-smoke`.
- Run `git diff --check` and inspect recovery storage/state transitions.

## Review Plan

Review starts only after QA. It checks session-only defer semantics, storage preservation, Quick Actions availability, first-write synchronization, recovery copy clarity, keyboard accessibility, project safety copy, and local-first/project/audio/export invariants.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-13 | Treat the recovery prompt as a three-choice decision: Restore, Not now, or Clear. | A user starting or continuing a beat should not be forced to replace the current project or delete the recovery copy merely to remove a blocking banner. |
| 2026-07-13 | Drop stale in-memory recovery only after `writeLocalDraft` succeeds. | The single storage slot has then been replaced by the current project, so retaining the old restore target would misrepresent durable recovery state. |
| 2026-07-13 | Make launch evidence wait for the lazy Quick Actions graph and allow 400 seconds for the existing 340-second phase envelope. | Two post-build runs reached Command Reference with all earlier evidence ready but timed out globally; the accepted initial evidence also carried `quickActionGraphReady: false`, contradicting the downstream assertion. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-13 | project_lead | Plan created in a dedicated feature worktree. |
| 2026-07-13 | repo_cartographer | Live browser audit reproduced an old local recovery banner after starting a fresh 8-bar Guided beat and confirmed only Restore/Clear choices were visible. |
| 2026-07-13 | privacy_guard | Source audit confirmed draft writes replace one renderer-local storage slot while the old recovery object remains in memory and visible, creating a stale restore target until reload. |
| 2026-07-13 | quality_runner | Two launch-smoke attempts exposed a pre-existing evidence race: Electron accepted initial DOM evidence before the on-demand command graph was ready, then exhausted the 360-second global timeout during Command Reference. The harness now gates that transition explicitly. |
| 2026-07-13 | quality_runner | Type, renderer, base QA, workflow, persona, runtime, production build, bundle boundary, live Electron launch, native project I/O, and whitespace validation passed after the evidence gate fix. |
| 2026-07-13 | review_judge | Separate post-QA review retained a warning tone for deferred recovery, tightened the successful-write branch proof, confirmed Restore/Clear Quick Actions remain wired, and found no remaining blocker. |

## Completion Notes

Local Draft Recovery now offers Restore Draft, session-only Not now, and Clear Draft as distinct choices. Not now hides only the prominent banner, keeps the discovered record and both Quick Actions commands intact, and changes Project Safety to `Recovery set aside / Current project kept / available in Actions` without claiming a durable save. After a later edit successfully writes the current project into the single local draft slot, GrooveForge clears the deferred flag and stale in-memory recovery target so the UI cannot restore an older record than localStorage contains. The live Electron gate now also waits for the on-demand Quick Actions graph before accepting launch evidence and has enough time for the existing full phase envelope.
