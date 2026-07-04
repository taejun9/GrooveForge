# plan-1376-audience-starter-project-io-smoke Review

## Summary

Plan 1376 extends the native desktop project IO smoke so the actual Electron preload bridge saves and reopens the generic smoke beat plus both Audience Starter projects. The report now includes value-free Audience Starter roundtrip rows for first-time composer and professional producer fixtures while preserving the existing `nativeProjectIoReady` and project roundtrip fields used by downstream release evidence.

## QA

Passed:

- `node --check harness/scripts/run_desktop_project_io_smoke.mjs`
- `npm run qa`
- `npm run build`
- `npm run renderer:smoke`
- `npm run desktop:launch-smoke` with approved macOS GUI/AppKit access
- `npm run desktop:project-io-smoke` with approved macOS GUI/AppKit access
- `git diff --check`

Actual Electron project IO evidence:

- First-time composer: `First Guided Beat`, guided, lofi, 86 BPM, A minor, 8 bars, Starter Sketch, 73 editable events.
- Professional producer: `Producer Fast Pass`, studio, house, 124 BPM, C minor, 26 bars, Beat Store, 112 editable events.

## Findings

No blocking findings.

## Residual Risk

The smoke now launches Electron three times, so it is intentionally heavier than the previous single-fixture project IO smoke. The added coverage is limited to the native desktop app path; packaged, PKG payload, and installed project IO smokes still verify their existing generic fixture paths.

## Follow-Up

If packaged-app confidence becomes the next release gap, mirror the Audience Starter fixture coverage into packaged project IO after first confirming runtime cost remains acceptable.
