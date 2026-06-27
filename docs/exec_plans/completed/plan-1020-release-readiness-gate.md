# plan-1020-release-readiness-gate

## Goal

Create a single release-readiness gate that runs GrooveForge's final QA and verification commands for the current direct beat-workstation MVP.

## Product Fit

GrooveForge is close to the point where the remaining question is not one isolated feature, but whether the app can be treated as a coherent local-first beat workstation for both working producers and first-time composers. A named release gate makes the final proof repeatable: composition-first framing, all-style beat generation, project roundtrips, WAV/stem/MIDI/Handoff exports, mocked download path, desktop entry, type contracts, build output, and documentation quality are checked together.

## Scope

- Added a `release:check` npm script that runs the full local release gate through `npm run qa && npm run verify`.
- Documented the release gate in README and harness architecture.
- Added quality rules and QA expectations so future plans keep the release gate aligned with `qa` and `verify`.
- Ran the new release gate and the established validation commands before completion.

## Non-Goals

- No installer/signing/notarization, app-store packaging, GUI launch, browser automation, project schema change, render algorithm change, MIDI encoding change, Handoff copy rewrite, cloud sync, accounts, analytics, payments, ads, remote AI, imported audio, sample browsing, or sampler MVP work.

## Validation

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

`npm run release:check` now runs `npm run qa` and `npm run verify`, which together cover the base/documentation harness, quality gate, runtime all-style export smoke, legacy migration, project roundtrips, Handoff Sheet text deliverables, mocked download path, typecheck, production build, and desktop entry smoke.

## Decision Log

- 2026-06-28: Use a single package script as the release-readiness entry point so completion evidence is easy to rerun without memorizing the separate QA and verify commands.
- 2026-06-28: Kept `release:check` as an aggregator instead of duplicating validation logic, so future changes only need to maintain `qa` and `verify`.
- 2026-06-28: Completed the plan-1011 through plan-1020 block after `release:check` passed.

## Status

- Completed.
