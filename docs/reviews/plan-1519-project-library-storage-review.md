# plan-1519-project-library-storage Review

## Summary

Plan 1519 adds a local-first project workspace below Electron's actual current-user home. A standard Windows profile resolves to `C:\Users\<current user>\GrooveForge`; redirected profiles follow their actual home instead of a hardcoded drive or account name.

- `Projects` is the default location for portable `.grooveforge.json` files.
- `Data/grooveforge.db` is a main-process-only SQLite3 schema v1 catalog and latest-recovery store.
- Explicit Save atomically replaces the portable file first, then mirrors the exact snapshot into SQLite.
- Desktop recovery is debounced and complements the existing renderer localStorage fallback without marking unsaved work clean.
- Normal execution is single-instance, preventing two app processes from overwriting the singleton recovery row.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run qa`
- Passed: `npm run project-workspace:smoke`
- Passed: `npm run renderer:smoke`
- Passed: `npm run harness:smoke`
- Passed: `npm run workflow:smoke`
- Passed: `npm run persona:smoke`
- Passed: `npm run typecheck`
- Passed: `npm run build`
- Passed: `npm run desktop:smoke`
- Passed: `npm run desktop:project-io-smoke` in the approved macOS GUI context
- Passed: `npm run desktop:close-flow-smoke` in the approved macOS GUI context
- Attempted: `npm run release:completion-summary-refresh-smoke`; stopped because the pre-existing external proof bundle lacks a ready current-operator command sequence. No private release input, network probe, or external distribution action was attempted.

Workspace evidence covered standard and redirected synthetic Windows homes, idempotent `Projects/Data` creation, POSIX `0700` directories and `0600` project/database/sidecar files, atomic replacement, schema bootstrap/reopen, recovery save/load/clear, catalog upsert, parameter binding, JSON/size constraints, WAL, application id, integrity check, and no-rewrite rejection of foreign, unidentified, unversioned non-empty, and future-schema databases.

Production Electron evidence saved and reopened three exact project documents through the context-isolated bridge, verified schema v1, application id, WAL, quick-check integrity, three catalog rows, recovery save/load/clear, zero recovery rows after clear, and a timestamp-only recovery-save response. The close-flow smoke preserved the exact current Save gate and completed the guarded second close.

## Findings

- Final independent review: no remaining P0-P3 findings.
- Review removed an `await` gap that could let a newer edit be overwritten by an earlier Save completion.
- Explicit Clear now waits for SQLite confirmation and rechecks request, recovery, and project identity so a delayed response cannot delete intervening edits.
- SQLite storage now uses current-user-only POSIX modes; Windows remains governed by the user profile ACL.
- Smoke-only workspaces are injected and cleaned, and generated PID fallback workspaces are removed before forced smoke exit.
- Recovery-save IPC now returns only `savedAt` instead of echoing the full project JSON.
- Normal desktop execution now owns a single-instance lock and focuses or recreates the primary window on a second launch.
- Schema v1 requires the GrooveForge application id before any mutating PRAGMA; unidentified versioned databases are rejected without changing journal mode or schema.
- `project-workspace:smoke` is part of the standard `npm run verify` chain.

## Residual Risk

- Actual Windows packaged execution was not available in this macOS environment. Current-user home resolution, redirected profiles, Korean Windows account names, and inherited ACLs were verified synthetically or by code contract, not by a physical Windows packaged run.
- Disk-full, real file/DB lock contention, forced power loss, and physical database corruption were not fault-injected.
- Electron's built-in `node:sqlite` was verified in the current Electron 39 runtime and must be revalidated on future Electron/Node upgrades.
- SQLite database and WAL content are unencrypted local plaintext. OS backup, roaming-profile, and sync behavior remain outside app control.
- Repository-wide release completion-summary refresh remains blocked by pre-existing external proof evidence, independently of this feature's passing implementation QA.

## Follow-Ups

- Add a Windows packaged manual QA matrix for standard/redirected profiles, Korean account names, disk-full, and lock contention.
- Hold a separate design meeting before adding portable project ids, per-project folders, backup rotation/restore, Trash, or a managed Export Library.
