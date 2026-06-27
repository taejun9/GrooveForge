# plan-1022-starter-project-runtime-smoke review

## Summary

Plan 1022 adds the actual first-run `starterProject` to the runtime smoke harness as `starter:first-run`. The smoke now proves that the app's default Guided 145 BPM / F minor trap state can roundtrip through `.grooveforge.json`, render full mix and stems, export MIDI, generate a Handoff Sheet, and use the mocked browser download path without imported audio or sampling scope.

The existing generated-start coverage remains separate: 14/14 Beat Blueprints and 14/14 style profiles still build sample-free 8-bar projects, and the legacy single-pattern chord-event migration is still verified.

## QA

- Passed: `git diff --check`
- Passed: `python3 harness/scripts/run_qa.py`
- Passed: `npm run harness:smoke`
- Passed: `npm run release:check`

Runtime smoke evidence: starter 1/1, Beat Blueprints 14/14, style profiles 14/14, legacy migration 1/1, project roundtrips 30/30, Handoff Sheets 30/30, and mocked download path 8/8.

## Findings

- None.

## Residual Risk

- The starter project is proven through runtime domain/render/export modules and mocked DOM download APIs. This does not claim visible GUI walkthrough coverage or real browser download shelf inspection.
- Installer packaging, signing, notarization, and distribution-channel QA remain outside the current release gate.

## Follow-Ups

- Add a browser or visible Electron walkthrough only when the release target requires user-visible first-run evidence beyond the current runtime smoke.
- Keep starter runtime expectations updated if the default BPM, key, mode, style, selected Pattern, or arrangement changes intentionally.
