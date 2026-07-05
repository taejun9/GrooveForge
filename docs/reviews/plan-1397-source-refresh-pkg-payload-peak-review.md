# plan-1397-source-refresh-pkg-payload-peak Review

## Summary

The source evidence refresh harness now lowers the disk peak around PKG payload verification by cleaning up the original packaged app after PKG creation, then restoring the verified payload app before downstream DMG and release manifest evidence. The change stays local to release evidence generation and records value-free restore rows for auditability.

## QA

- `node --check harness/scripts/run_release_source_evidence_refresh_smoke.mjs`
- `npm run qa`
- `git diff --check`
- `npm run release:source-evidence-refresh-smoke`
- `npm run desktop:launch-smoke`

## Findings

- No blocking findings.
- The refresh receipt reported 44 commands, 7 cleanup rows, 1 restore row, and 21/21 source artifacts present.
- The live Electron launch smoke verified the first-time composer, professional producer, and workstation paths on the rendered app screen.

## Residual Risk

- The restore step temporarily requires both the extracted payload app and the restored packaged app before cleanup removes the payload directory. This still uses less peak disk than keeping the original packaged app through payload expansion, and the full source refresh passed on the constrained workstation after npm cache cleanup.
- External release completion remains blocked by ignored private distribution env inputs and proof steps that must be supplied outside committed source.

## Follow-Ups

- Continue keeping completion summaries refreshed after each completed plan.
- If low-disk failures recur on smaller machines, add a staged copy cleanup after restore to further reduce transient duplication.
