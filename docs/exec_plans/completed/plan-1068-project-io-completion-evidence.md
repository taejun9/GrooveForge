# plan-1068-project-io-completion-evidence

## Goal

Make completion reporting directly verify the native, packaged, and simulated installed desktop project-file IO smoke artifacts.

GrooveForge is an all-genre direct beat workstation. Project save/open evidence is part of the first releasable local product posture, so the completion audit should not only mention project IO in docs or release matrix prose. It should read the project IO JSON artifacts, include them in its evidence table, and make local completion readiness depend on value-free project-file save/open evidence.

## Scope

- Update `harness/scripts/run_desktop_completion_audit_smoke.mjs` to read native, packaged, and installed project IO JSON artifacts.
- Keep native project IO output outside the package root so later packaging does not delete the evidence before completion audit runs.
- Add a desktop project IO requirement row and evidence artifact rows to the completion audit output.
- Keep project IO evidence local-only and value-free: no private beats, user audio, URLs, credentials, feed values, uploads, network probes, signing, notarization, Gatekeeper, auto-update, or external distribution claims.
- Update README, release readiness, harness architecture, quality rules, and QA expectations so docs match the new audit evidence chain.

## Out of Scope

- Changing project-file serialization behavior.
- Changing save/open IPC behavior.
- Adding cloud sync, accounts, analytics, remote AI, payment, update feed publishing, or real external distribution.
- Claiming Developer ID signing, notarization, Gatekeeper acceptance, auto-update, or app-store readiness.

## Plan

1. Inspect completion audit inputs and project IO report schema.
2. Add project IO report paths, readiness checks, summary booleans, requirement row, evidence rows, Markdown output, and validation checks.
3. Align docs and `run_qa.py` expectations with the new completion audit evidence.
4. Run focused syntax/QA checks, then `release:check`.
5. Complete QA, review, move this plan to completed, create review mirror, merge to `main`, push, delete the branch, and remove the worktree.

## QA

- Passed: `git diff --check`
- Passed: `node --check harness/scripts/run_desktop_project_io_smoke.mjs`
- Passed: `node --check harness/scripts/run_desktop_completion_audit_smoke.mjs`
- Passed: `python3 -B harness/scripts/run_qa.py`
- Passed: `npm run build`
- Passed: `npm run desktop:project-io-smoke`
- Passed: `npm run desktop:completion-audit-smoke`
- Passed: `npm run release:check`
- Expected failure: hard external gate without `--dry-run` still fails until private external-distribution evidence exists.

## Decision Log

- 2026-06-28: Chose to extend completion audit rather than add another standalone smoke. The project IO smokes already produce durable JSON evidence; the missing piece is making completion reporting read and enforce those artifacts.
- 2026-06-28: Moved native project IO smoke output to `build/desktop/GrooveForge-<version>-<platform>-<arch>-project-io-smoke/` because the later package smoke rewrites the package root before completion audit runs.

## Status

- Completed on 2026-06-28.
