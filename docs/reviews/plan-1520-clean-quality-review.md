# plan-1520-clean-quality Review

## Summary

Repository-wide QA found one real regression in the release evidence chain. The local delivery package and reopen smoke had already moved to nine deliverables after adding the SoundCloud Upload Sheet, but the audience completion handoff still required eight. That stale count caused the final `release:completion-summary-refresh-smoke` path, and therefore `npm run verify`, to fail.

The handoff now derives its expected count from the nine required artifact labels and verifies every label, including `SoundCloud Upload Sheet`. The reopen source and verified counts must match the same contract. No product assertion was removed or relaxed.

## QA

- Passed: `node --check harness/scripts/run_release_audience_completion_handoff_smoke.mjs`
- Passed: `git diff --check`
- Passed: `npm run qa`
- Passed: `npm run release:audience-completion-handoff-smoke`
- Passed: `npm run release:completion-report-packet-smoke`
- Passed: `npm run release:check` in the approved macOS GUI context
- Passed within the full gate: quality gate, renderer/workflow/persona/runtime smoke, 41 playable WAV files, 33/33 full-mix tails, 9-artifact local package and 9/9 reopen, delivery ZIPs, typecheck, SQLite workspace smoke, build, source/packaged/ad-hoc-signed/PKG-payload/installed Electron launch and project I/O, guarded close flow, release evidence, and private-value leak checks

One sandboxed `npm run release:check` attempt stopped at the intentional restricted-GUI preflight because `CODEX_SANDBOX=seatbelt` blocks AppKit registration. The same command was rerun with approved GUI/AppKit access and passed completely.

## Findings

- Fixed: audience completion handoff used stale `8` counts after the local package gained a ninth SoundCloud Upload Sheet artifact.
- Review hardening: replaced a new standalone `9` magic number with an explicit required-label list and derived count, preventing a count-only pass that omits the SoundCloud artifact.
- Final independent review: no remaining P0-P3 findings.

## Residual Risk

- The required-label list remains an intentional contract and must be updated if the local delivery package changes again; the full release gate now fails clearly when it drifts.
- External distribution remains pending because private channel metadata, Developer ID credentials, notarization, Gatekeeper acceptance, and human manual QA are not present. No external probe, upload, signing, or Apple submission was attempted.
- The completed local quality run used the current macOS arm64 environment. Platform-specific physical Windows distribution testing remains outside this focused harness fix.

## Follow-Ups

- None required for this defect. Future delivery artifact additions should update the package producer, reopen consumer, and audience handoff contract together.
