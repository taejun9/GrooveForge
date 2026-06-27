# plan-1024-first-session-workflow-smoke review

## Summary

Plan 1024 adds `npm run workflow:smoke`, a first-session domain workflow check that starts from `starterProject` and creates two concrete local deliverable projects:

- `beginner:guided-first-beat`: guided, 86 BPM A minor lo-fi, 8-bar Starter Sketch, Clean Demo master, event counts 40/12/11/10.
- `producer:fast-pass`: studio, 124 BPM C minor house, 26-bar Beat Store pass, Streaming Safe master, event counts 68/16/15/13.

Both workflows verify setup changes, musical-event density, arrangement, delivery target, mix/master posture, `.grooveforge.json` save/load, non-silent full-mix and stem analysis, MIDI bytes, Handoff Sheet sections, and sampling-free project/Handoff text without writing media artifacts.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run workflow:smoke`
- Passed: `npm run release:check`

`npm run release:check` ran `npm run qa` and `npm run verify`, including quality gate, renderer smoke, workflow smoke, runtime smoke, typecheck, production build, and desktop entry smoke.

## Findings

- None.

## Residual Risk

- Workflow smoke proves local domain/render/export paths, not interactive browser clicks, visible Electron layout, or real download shelf inspection.
- Installer packaging, signing, notarization, and distribution-channel QA remain outside the current release gate.

## Follow-Ups

- Add interactive browser or visible Electron walkthrough evidence if a distribution target requires human-facing flow proof beyond first-render SSR and domain workflow smoke.
- Keep workflow expectations aligned when default style targets, delivery targets, master presets, or first-session workflow labels intentionally change.
