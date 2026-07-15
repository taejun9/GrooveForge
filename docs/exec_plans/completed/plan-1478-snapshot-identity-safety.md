# plan-1478-snapshot-identity-safety

## Status

completed

## Owner

project_lead / harness_builder / quality_runner / review_judge

## User Request

Finish GrooveForge into a bug-resistant usable state and continue testing while creating sample audio.

## Goal

Keep every imported, serialized, saved, renamed, restored, and deleted project snapshot on a stable unique identity. Repair duplicate, empty, unsafe, and overlong imported snapshot ids deterministically so one snapshot action affects exactly one stored idea, then restore distinct repaired snapshots and prove each produces its own playable sample WAV.

## Evidence and Motivation

Controlled reproduction on synchronized main `ebbe5c70` imported two valid snapshots with the same `duplicate-snapshot` id but different 140 BPM and 90 BPM project cores. Parsing preserved both duplicate ids. Renaming that id changed both snapshot names, deleting it removed both snapshots (`2→0`), restoring it could only reach the first 140 BPM snapshot, and the React snapshot list also uses the id for keys, drafts, test ids, and actions.

## Non-Goals

- Changing snapshot capacity, snapshot project content, undo history, or the comparison UI.
- Merging snapshots that happen to share a name, date, or musical content.
- Replacing local snapshots with cloud history, collaboration, accounts, or remote storage.
- Treating automated PCM checks as a replacement for human listening.

## Constraints

- QA completes before separate review.
- Keep snapshot id syntax, length, uniqueness, deterministic suffixing, and capacity domain-owned.
- Preserve the first already-safe unique authored id; repair only unsafe, empty, overlong, or colliding ids.
- Retain snapshot order, names, timestamps, and project cores while repairing identity.
- Apply the invariant to current wrapped files, bare project files, serialization, snapshot creation, and direct snapshot operations without mutating caller-owned source objects.
- Restore two formerly colliding snapshots with audibly distinct project state and decode real deterministic WAVs for both.
- Do not modify the unrelated plan-085 worktree.

## Implementation Plan

- [x] Add bounded safe snapshot-id normalization and deterministic collection-wide uniqueness repair.
- [x] Apply repaired identities through project normalization and defensive snapshot operations.
- [x] Add runtime, static, and sample-audio regression coverage for duplicate, unsafe, empty, and overlong ids.
- [x] Run targeted QA, actual WAV QA, separate review, completion refresh, merge/push, final sample regeneration, and cleanup.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-16 | Make snapshot identity safety the plan-1478 target. | A valid imported project can preserve duplicate snapshot ids, causing a single rename or delete action to modify multiple stored ideas and making later duplicates unreachable by restore. |
| 2026-07-16 | Reserve later safe authored ids while repairing earlier unsafe or colliding ids. | Deterministic repair must not steal an authored identity that is already valid later in the same collection. |
| 2026-07-16 | Preserve every already-safe authored token exactly, including leading or trailing `-` and `_`. | Separate review found that trimming separator positions contradicted the plan's preservation contract; normalization now changes only unsafe, empty, overlong, or colliding identities. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-16 | project_lead | Created plan-1478 from clean synchronized main `ebbe5c70`; the unrelated plan-085 worktree remains untouched. |
| 2026-07-16 | quality_runner | Pre-fix reproduction preserved duplicate ids for distinct 140 BPM and 90 BPM snapshots; rename changed both, delete removed both (`2→0`), and restore selected only the first snapshot. |
| 2026-07-16 | harness_builder | Added bounded safe snapshot-id normalization, deterministic uniqueness repair, later-authored-id reservation, defensive save/rename/delete/restore handling, and current/bare/serialized normalization without mutating caller-owned values. |
| 2026-07-16 | quality_runner | Runtime safety passed six malformed ids across 6/6 normalization paths; direct rename changed exactly one duplicate, delete changed `6→5`, and formerly colliding snapshots restored distinct 140/90 BPM cores. A 10,000-collection property smoke also passed uniqueness, syntax, length, immutability, idempotence, and safe-id preservation. |
| 2026-07-16 | quality_runner | Sample-audio schema 11 passed 34/34 valid WAVs and 26/26 full mixes. Snapshot restoration produced deterministic 14.4643-second and 22.3333-second WAVs with distinct hashes, non-zero PCM, post-boundary tails, and digital-zero endings. |
| 2026-07-16 | review_judge | Separate post-QA review found one preservation-contract mismatch for safe ids ending in separators; the implementation and regression were corrected, then QA, typecheck, build, runtime, renderer, workflow, sample audio, packaging, project-IO, DMG, PKG payload, and simulated install checks passed. No blocking, major, or moderate findings remain. |
| 2026-07-16 | plan_keeper | Non-interactive completion-summary refresh passed with plan-1478 latest, `1471-1480: 8/10`, 21/21 prerequisite proof artifacts, 100.0% local release readiness, and 99.999999% user-facing completion. |
| 2026-07-16 | project_lead | Completed local scope. External Developer ID signing, notarization, Gatekeeper acceptance, private release metadata, and human listening remain explicit external/manual boundaries rather than claims of this plan. |
