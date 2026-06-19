# plan-411-export-dynamics-readout review

## Summary

- Added `exportDynamicsDb`, a peak-minus-RMS dynamics readout derived from existing deterministic export analysis.
- Added `Dynamics` to the Export Meter with `data-testid="export-dynamics-db"`.
- Added the same dynamics value to Handoff Sheet text export.
- Updated README, product docs, quality rules, and static QA expectations.

## Validation

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run qa` passed.
- `npm run verify` passed.
- Browser/dev-server smoke not run: `npm run dev -- --host 127.0.0.1` failed with `listen EPERM` on `127.0.0.1:5173`; escalated retry was rejected by the current environment policy.

## Review

No findings.

The change is read-only and derives dynamics from existing local `peakDb` and `rmsDb`. It does not change audio rendering, limiter behavior, mixer/master controls, export file contents, project schema, save/load migration, playback scheduling, Master Automation behavior, sampling, plugin hosting, remote analysis, remote AI, analytics, accounts, or cloud sync.

The copy keeps dynamics framed as a local render check and does not introduce LUFS, true-peak, platform-compliance, publishing, licensing, or professional-mastering claims.

## Residual Risk

Visual browser smoke remains unverified in this environment because local dev server binding is blocked.
