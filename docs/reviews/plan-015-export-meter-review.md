# plan-015-export-meter Review

## Summary

The Master panel now includes a practical export meter. It analyzes the current arrangement through the offline render path and reports peak, RMS, headroom, limiter activity, duration, and status without claiming LUFS or true-peak compliance.

## QA

- `python3 harness/scripts/run_qa.py` passed.
- `npm run typecheck` passed.
- `npm run verify` passed.
- `git diff --check` passed.
- Browser verification passed on `http://127.0.0.1:5173/`: meter readouts were visible, `Clean Demo` changed ceiling from `-3` to `-0.8`, headroom updated, playback started afterward, and no console errors were observed.

## Findings

- No blocking findings.

## Residual Risk

- This is not LUFS, integrated loudness, or true-peak metering.
- The limiter activity count is based on the current offline sample renderer, not a professional limiter model.
- Meter analysis is recomputed from project state in the UI, which is acceptable at current arrangement size but may need throttling for larger sessions.

## Follow-Ups

- Add automated WAV byte inspection for exported mix and stems.
- Add standards-based LUFS/true-peak measurement only when the implementation can be validated against official references.
- Add a visual warning when export meter status is `Silent` or limiter activity is unusually high.
