# plan-071-custom-delivery-target

## Status

Completed

## Owner

Team Forge

## User Request

Continue completing GrooveForge as a desktop beat workstation that can satisfy working composers while remaining easy for first-time composers.

## Goal

Add a local Custom Delivery Target so working producers can define a session-specific outcome and beginners can name their own goal without leaving the beat workstation.

## Scope

- Add a `customDeliveryTarget` project field with safe migration for older files.
- Let users edit custom target name, focus, target bars, stem goal, preferred arrangement template, preferred master preset, and mix posture as bounded local project data.
- Let users select and explicitly align the custom target through the existing Delivery Target flow.
- Make Beat Map, Next Move, Handoff Sheet, save/load, snapshots, undo/redo, and export paths read the selected custom target when active.
- Preserve realtime playback, WAV/stem/MIDI export, Beat Readiness, Mix Coach, Session Brief, Project Snapshots, and existing fixed Delivery Target semantics.
- Update README, product docs, quality rules, harness expectations, exec plan, and review mirror.

## Non-Goals

- No platform-specific compliance presets, LUFS/true-peak guarantees, publishing/licensing advice, cloud target libraries, accounts, collaboration service, remote AI, remote analysis, analytics, payments, sampling, imported audio, plugin hosting, or hidden automation.
- No automatic target alignment while editing custom fields; alignment remains an explicit user click.
- No destructive changes to musical events when selecting a target.

## Files

- `src/domain/workstation.ts`
- `src/ui/App.tsx`
- `src/styles.css`
- `README.md`
- `docs/product/product.md`
- `docs/quality/rules.md`
- `harness/scripts/run_qa.py`
- `docs/exec_plans/active/plan-071-custom-delivery-target.md`
- `docs/reviews/plan-071-custom-delivery-target-review.md`

## Implementation Steps

- [x] Inspect fixed Delivery Target domain, UI, Beat Map, Next Move, Handoff Sheet, save/load, and snapshot paths.
- [x] Add custom delivery target state, defaults, bounds, normalization, migration, cloning, and helper resolution.
- [x] Add compact custom target controls and route edits through undoable project updates.
- [x] Make target selection, alignment, Beat Map, Next Move, and Handoff Sheet use the selected fixed or custom target.
- [x] Update docs and static QA expectations.
- [x] Run automated QA, browser smoke, review, and completion flow.

## QA Plan

- [x] `python3 harness/scripts/run_qa.py`
- [x] `python3 harness/scripts/run_quality_gate.py`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npm run qa`
- [x] `npm run verify`
- [x] Browser smoke: Custom Target controls render, text/number field state changed through keyboard attempts, console errors are empty, and horizontal overflow is false. The current in-app Browser automation session did not deliver button click/select activation reliably: fixed Delivery Target buttons and mode buttons also failed to mutate state, so Set/Align/Undo were not proven through browser automation in this run.

## Review Plan

Review starts only after QA passes. Confirm custom targets are local, bounded, migrated, undoable, explicit-click for alignment, fixed targets still work, and no compliance, remote-service, sampling, media, or hidden automation scope was introduced.

## Decision Log

| date | decision | rationale |
|---|---|---|
| 2026-06-16 | Add a single local custom target instead of a target library. | One editable target covers real session variation for producers and beginner self-labeling without adding account/cloud/library complexity. |

## Activity Log

| date | actor | note |
|---|---|---|
| 2026-06-16 | repo_cartographer | Inspected the existing fixed Delivery Target state, UI, Beat Map, Next Move, Handoff Sheet, save/load, and snapshot paths. |
| 2026-06-16 | harness_builder | Added `customDeliveryTarget` defaults, bounds, normalization, migration, cloning, and active target helpers. |
| 2026-06-16 | harness_builder | Added compact custom target controls for name, focus, bars, stem goal, template, master preset, and mix posture, routed through undoable project updates. |
| 2026-06-16 | harness_builder | Updated target selection, alignment, Beat Map, Next Move, and Handoff Sheet to resolve fixed or custom targets from local project state. |
| 2026-06-16 | doc_gardener | Updated README, product docs, quality rules, and static QA expectations for custom Delivery Targets. |
| 2026-06-16 | quality_runner | Ran QA, quality gate, typecheck, build, npm QA, npm verify, and browser smoke with the click automation limitation recorded above. |

## Outcome

GrooveForge now supports one local editable Custom Delivery Target alongside the fixed starter sketch, vocal session, beat-store demo, and club demo targets. Producers can tailor target name, focus, length, stem goal, arrangement template, master preset, and mix posture for a session; beginners can name a simple goal without leaving the beat workstation. Beat Map, Next Move, Handoff Sheet, alignment, save/load migration, snapshots, undo/redo, and fixed target semantics remain tied to local project data.
