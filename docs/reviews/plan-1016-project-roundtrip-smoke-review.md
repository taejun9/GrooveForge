# plan-1016-project-roundtrip-smoke review

## Summary

Plan 1016 extends `npm run harness:smoke` so each supported style-profile start and Beat Blueprint is serialized to the local GrooveForge project-file format, parsed back through `parseProjectFile`, and then validated through the existing WAV, stem, and MIDI export checks. The smoke now proves 28/28 `.grooveforge.json` save/load roundtrips before export without writing media artifacts.

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

- The smoke proves the project-file serializer/parser and export pipeline without opening GUI file dialogs. Electron dialog behavior remains covered by the desktop bridge contract and should be manually checked with `npm run desktop` when a GUI release pass is explicitly needed.

## Follow-Ups

- Keep future project-schema additions covered by the roundtrip smoke before adding optional sampling or imported-audio schema.
- Add fixture-based migration checks only when a schema migration plan introduces durable legacy fixture files.
