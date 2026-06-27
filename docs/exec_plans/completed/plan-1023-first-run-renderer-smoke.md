# plan-1023-first-run-renderer-smoke

## Goal

Add automated evidence that the first-run React workstation render exposes the beginner guide path, working-producer controls, direct beat-composition surfaces, and local export posture without requiring a browser, network, imported audio, or sampling scope.

## Product Fit

The current release gate proves domain data, exports, project files, Electron entry, and the starter project. The remaining weak evidence is that the actual first-run UI surface presents both routes the product promises: a guided setup -> compose -> arrange -> mix -> deliver path for first-time composers and fast editable access for working producers.

## Scope

- Added a Node-based renderer smoke that server-renders the first-run React app through Vite SSR and real app code.
- Verified beginner-facing guide surfaces, producer-facing studio/quick-action surfaces, direct composition panels, delivery/export surfaces, and sampling-free first-run copy.
- Added the renderer smoke to local verification and release gates.
- Updated README, release readiness evidence, harness architecture, quality rules, and QA expectations.

## Non-Goals

- No UI redesign, new workflow, project schema change, browser automation, visible Electron launch, installer/signing/notarization, remote AI, cloud sync, accounts, analytics, payments, imported audio, sample browsing, or sampler MVP work.

## Validation

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run renderer:smoke`
- Passed: `npm run release:check`

`npm run renderer:smoke` server-rendered the first-run React `App` into 531209 characters of markup and verified the starter transport, beginner path, producer path, compose/sound/arrange/mix/master/export/Handoff surfaces, and absence of sample-import/sampler-first copy. `npm run release:check` ran `npm run qa` and `npm run verify`, including quality gate, renderer smoke, runtime smoke, typecheck, production build, and desktop entry smoke.

## Decision Log

- 2026-06-28: Add a browserless renderer smoke because previous gates prove the domain and desktop entry but do not directly assert that the first-run React surface exposes the promised beginner and producer paths.
- 2026-06-28: Used Vite SSR instead of localhost browser automation so the gate can transform the real TSX app without opening ports, launching Electron, or depending on external browser state.
- 2026-06-28: Completed after diff check, QA, renderer smoke, and release gate passed.

## Status

- Completed.
