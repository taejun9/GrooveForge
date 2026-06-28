# plan-1073-release-progress-command-review

## Status

complete

## Scope

Added a direct `npm run release:progress` command that regenerates release evidence and writes a compact release progress report.

## Findings

- No blocking findings.
- The hard external distribution gate still fails as expected because private distribution inputs, distribution-channel QA, auto-update provider/feed readiness, Developer ID signing, notarization/stapling, and notarized Gatekeeper acceptance are not externally proven.

## QA

- `git diff --check` passed.
- `node --check harness/scripts/run_release_progress_report.mjs` passed.
- `python3 -B harness/scripts/run_qa.py` passed.
- `npm run build` passed.
- `npm run release:progress` passed.
- `node harness/scripts/run_desktop_external_distribution_gate_smoke.mjs` failed as expected until external distribution evidence is supplied.

## Summary

`release:progress` now runs `release:check`, reads the generated completion progress JSON, writes a compact release progress Markdown/JSON report, and prints the key progress lines. The current report shows source evidence ready, local release readiness at 100.0%, desktop project IO evidence ready, external hard gate not ready, external gate requirements at 8/15, and remediation groups at 1/8.

## Residual Risk

This improves user-facing completion progress reporting only. It does not prove real `/Applications` installation, Developer ID signing, notarization, Gatekeeper approval, auto-update, release upload, manual QA approval, app-store submission, or external distribution completion.
