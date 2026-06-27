# plan-1020-release-readiness-gate review

## Summary

Plan 1020 adds `npm run release:check` as the single local release-readiness gate. The command runs `npm run qa` and `npm run verify`, so the base/documentation harness, quality gate, runtime all-style export smoke, legacy migration, project roundtrips, Handoff Sheet text deliverables, mocked download path, typecheck, production build, and desktop entry smoke are tied together before completion reports.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run typecheck`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Passed: `npm run harness:smoke`
- Passed: `npm run build`
- Passed: `npm run desktop:smoke`
- Passed: `npm run qa`
- Passed: `npm run verify`
- Passed: `npm run release:check`

## Findings

- None.

## Residual Risk

- `release:check` is a local automated gate. It does not package installers, sign/notarize builds, launch a visible Electron window, or run real browser automation.

## Follow-Ups

- Add packaging/signing/notarization only when a distribution target is explicitly selected.
- Keep future completion reports anchored to `npm run release:check` plus any extra target-specific checks introduced later.
