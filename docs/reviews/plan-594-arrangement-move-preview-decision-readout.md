# plan-594-arrangement-move-preview-decision-readout Review

## Summary

Completed the Arrangement Move Preview Decision Readout for the selected-block editor. The new UI-local readout names the currently suggested Drop/Build/Hook Lift/Reset move, shows changed-field scope plus selected block energy/mute posture, and exposes an explicit Apply Suggested Move action before users commit selected-block energy and mute changes.

The implementation keeps GrooveForge centered on direct beat composition and arrangement. It does not add sampling, imported audio, sampler setup, remote AI, persistence changes, hidden generation, autoplay, or auto-apply behavior.

## QA

| command | result |
|---|---|
| `git diff --check` | passed |
| `python3 harness/scripts/run_qa.py` | passed |
| `npm run typecheck` | passed |
| `python3 harness/scripts/run_quality_gate.py` | passed |
| `npm run build` | passed with existing Vite large-chunk warning |
| `npm run qa` | passed |
| `npm run verify` | passed; runtime smoke covered 14/14 sample-free blueprints and 14/14 supported style profiles |
| `npm run dev -- --host 127.0.0.1` | sandbox attempt failed with expected `listen EPERM`; approved local dev server started |
| `curl -I http://127.0.0.1:5173/` | sandbox attempt could not connect; approved HEAD request returned `HTTP/1.1 200 OK` |

## Findings

No blockers.

## Residual Risk

Visual verification was limited to build and dev-server smoke. The change reuses the existing Arrangement Move priority visual system and does not introduce new persistence, transform, transport scheduling, or audio behavior.

## Follow-Ups

Continue toward plan-595 with another direct beat-composition, arrangement, mix/master, or export completion gap.
