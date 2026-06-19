# plan-414-reference-listen-cue Review

## Summary

Added a read-only Reference Alignment `Listen Cue` card that tells users whether the next reference comparison should start with reference text, vibe direction, song form, audible signal, mix posture, full-mix listening, or final handoff readiness.

The card derives only from existing Session Brief text, Delivery Target, arrangement readiness, deterministic export analysis, deterministic stem analysis, and existing Reference Alignment posture. It flows through the existing Reference Alignment Focus buttons and Quick Actions card loop without importing reference audio, matching waveforms, triggering playback, changing project schema, or changing render/export output.

## Findings

No findings.

## Validation

- `git diff --check` passed.
- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run qa` passed.
- `npm run verify` passed, including runtime smoke, typecheck, and build.
- `npm run dev -- --host 127.0.0.1` was blocked by sandbox `listen EPERM`; escalated retry was rejected by the environment policy, so browser/dev-server smoke was not run.

## Notes

Listen Cue is comparison-scope guidance only. It does not autoplay, import, analyze, or store reference audio.
