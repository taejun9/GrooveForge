# plan-1023-first-run-renderer-smoke review

## Summary

Plan 1023 adds `npm run renderer:smoke`, a Vite SSR-based first-run React render check. The smoke renders the actual `App` without localhost, browser automation, or an Electron window, then verifies that the initial workstation surface exposes the starter transport, beginner guide path, producer scan path, direct compose/sound/arrange/mix/master/export panels, Handoff surface, and sampling-free first-run copy.

`npm run verify` now runs quality gate, renderer smoke, runtime smoke, typecheck, production build, and desktop entry smoke. `npm run release:check` inherits that coverage.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run renderer:smoke`
- Passed: `npm run release:check`

Renderer smoke evidence: 531209 characters of first-run React markup, starter transport visible as Untitled Beat / 145 BPM / F minor / Trap, beginner Guide Quick Start / First Beat Path / Beat Spine / Composer Guide / Workflow Navigator path present, producer Studio / Review Queue / Production Snapshot / Mix Coach / Sound Snapshot / Mix Snapshot / Quick Actions / Command Reference path present, and compose/sound/arrange/mix/master/export/Handoff surfaces present.

## Findings

- None.

## Residual Risk

- The renderer smoke proves first-render markup, not interactive browser clicks, layout screenshots, keyboard navigation, audio playback, or real download shelf behavior.
- Visible Electron launch, installer packaging, signing, notarization, and distribution-channel QA remain outside the current release gate.

## Follow-Ups

- Add target-specific browser or visible Electron walkthrough evidence if distribution readiness requires interactive UI proof beyond first-render SSR.
- Keep renderer smoke expectations aligned if first-run labels, default project values, or major workstation panel names intentionally change.
