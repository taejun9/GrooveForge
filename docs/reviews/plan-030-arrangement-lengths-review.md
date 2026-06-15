# plan-030-arrangement-lengths Review

## Summary

Per-block arrangement lengths are implemented as composition-first structure controls. Arrangement blocks now store bounded `bars`, templates include explicit section lengths, the Arrangement panel shows total bars, and the selected block editor exposes a Bars input. Export meter, full-mix WAV export, and stem export now use total arrangement bars instead of raw block count. Older project files without block bar counts load with one bar per block.

## QA

- `python3 harness/scripts/run_qa.py` passed.
- `python3 harness/scripts/run_quality_gate.py` passed.
- `npm run typecheck` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Browser validation at `http://127.0.0.1:5173/` passed:
  - Initial Full Beat arrangement displayed 8 blocks / 26 bars and export meter duration 43.0 sec.
  - Changing the first block from 2 bars to 4 bars updated total arrangement length to 28 bars and export meter duration to 46.3 sec.
  - Undo restored 26 bars and 43.0 sec.
  - Applying 8 Bar Loop produced 4 blocks / 8 bars and 13.2 sec.
  - One-bar blocks display as `1 bar`, not `1 bars`.
  - Template row, arrangement editor, and block buttons had no checked overflow.
  - Console errors: 0.

## Findings

No blocking findings.

## Residual Risk

Realtime playback still previews the selected Pattern A/B/C loop rather than walking the full arrangement timeline. Export now follows arrangement length correctly, but a future playback plan should add arrangement playback mode with block-aware progress.
