# plan-1074-release-doctor-command-review

## Status

complete

## Scope

Added a fast `npm run release:doctor` command that runs targeted redacted distribution-input/readiness smokes and writes a compact value-free release doctor report.

## Findings

- No blocking findings.
- The hard external distribution gate still fails as expected because private distribution inputs, distribution-channel QA, auto-update provider/feed readiness, Developer ID signing, notarization/stapling, and notarized Gatekeeper acceptance are not externally proven.

## QA

- `git diff --check` passed.
- `node --check harness/scripts/run_release_doctor.mjs` passed.
- `python3 -B harness/scripts/run_qa.py` passed.
- `npm run build` passed.
- `npm run release:doctor` passed.
- `npm run release:progress` passed after aligning shorter Electron smoke deadlines with the existing 120-second ad-hoc/install smoke deadline.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected until external distribution evidence is supplied.

## Summary

`release:doctor` now runs targeted redacted env-template, update feed, Developer ID readiness, manual QA, distribution-channel QA, and private-input checks, then writes ignored Markdown/JSON reports with local env posture, private-input group counts, manual QA digest posture, channel metadata readiness, Developer ID readiness, notarization credential-signal readiness, source artifact presence, first blockers, and not-recorded/not-claimed posture.

## Residual Risk

This improves fast operator preflight reporting only. It does not prove real external distribution, Developer ID signing, notarization, Gatekeeper approval, auto-update, release upload, manual QA approval, app-store submission, or remote channel readiness.
