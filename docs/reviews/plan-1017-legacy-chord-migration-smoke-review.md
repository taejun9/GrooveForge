# plan-1017-legacy-chord-migration-smoke review

## Summary

Plan 1017 fixes legacy project-file migration so top-level single-pattern `chordEvents` are preserved when old projects are normalized into Pattern A/B/C data. The runtime smoke now includes a synthetic legacy `.grooveforge.json` project with chord events and missing newer optional fields, then proves migration, roundtrip, WAV/stem export, and MIDI export.

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

## Findings

- None.

## Residual Risk

- The migration smoke uses a synthetic legacy project shape built from current domain data. That keeps fixtures private and sample-free, but it is not a corpus of every historical project file a user may have saved.

## Follow-Ups

- Add explicit historical fixture files only when a future schema migration plan approves durable synthetic fixtures.
- Keep optional sampling/audio-clip migration out of core parser expectations until sampling-phase work is explicitly approved.
