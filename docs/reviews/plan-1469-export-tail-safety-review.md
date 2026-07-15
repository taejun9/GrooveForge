# plan-1469-export-tail-safety review

## Review Result

approved

No blocking, major, or moderate findings remain after QA.

## Scope Reviewed

- Offline mix and stem render buffer sizing, tempo-aware tail derivation, Space-return processing, master automation/limiting order, and terminal fade math.
- Canonical PCM parsing and the musical-duration, delivered-duration, post-boundary-content, final-frame, determinism, ceiling, and isolation assertions.
- Runtime, workflow, and persona duration contracts after delivered WAVs became longer than their unchanged musical arrangements.
- Product, harness, quality, and release-readiness documentation plus repository static expectations.

## Findings

None.

The six-step tail with a 0.75-second floor yields 0.75–1.5 seconds across the supported 60–220 BPM editor range. Current events remain scheduled only inside the original arrangement bars, while note envelopes and the built-in Space return can decay into the added buffer. The last 80ms is faded linearly to an exact zero-valued final frame before PCM encoding. Mix and every stem share the same render path and expected delivered duration.

The pre-fix sample set proved the defect: 12/24 WAVs ended with active PCM, including Jersey Club at 0.020142 last-frame amplitude and 0.029418 final-100ms RMS. The final regenerated set proves the correction: 24/24 end at digital zero and all 16 full mixes contain post-boundary PCM. Across those files, the final 80ms maximum RMS is 0.000395, maximum peak is 0.001221, and maximum adjacent-sample delta is 0.000061.

## QA Evidence

- `npm run sample-audio:qa`: passed; 24 playable WAVs, 14/14 styles with unique hashes, 24/24 zero-ended artifacts, 16/16 full mixes with post-boundary content, 11/11 unrelated render edits isolated, target/noise sensitivity, and Drums solo/stem equality.
- `npm run qa`, `npm run typecheck`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, and `npm run harness:smoke`: passed after duration contracts were updated to musical duration plus export tail.
- `npm run verify`: exited 0; source, packaged, ad-hoc signed, PKG-payload, and simulated-installed Electron GUI paths passed along with native/package/payload/installed project IO, DMG/PKG construction, delivery packages/ZIPs, privacy checks, and value-free release evidence.
- `git diff --check`: passed.

## Sample Evidence

- Beginner Guided Lo-fi: 22.3256-second musical arrangement, 1.0465-second tail, 23.3721-second delivered WAV, -4.4040 dB peak, -21.8811 dB RMS, zero full-scale samples, SHA-256 `fecc21515edb5b582907943d8081a40ec648801154606c310423cd1b6e9fd420`.
- Professional Studio House: 50.3226-second musical arrangement, 0.75-second tail, 51.0726-second delivered WAV, -3.2771 dB peak, -20.0801 dB RMS, zero full-scale samples, SHA-256 `f1e71a1b672fd51d187decf55fd36fe0a2f2b6e9e8ddb59c6c00bf3b07f15b0e`.
- Style matrix: 14/14 canonical stereo 44.1kHz/16-bit PCM files, 14 unique hashes, peaks -5.9691 to -2.7252 dB, RMS -25.0840 to -19.4645 dB.

## Residual Risk

- Numeric PCM checks do not replace a human listening and mastering pass on multiple playback systems.
- The bounded tail is matched to the current event-release and built-in Space algorithms. Future longer delays, plugin tails, or expanded envelope ranges must update the tail policy and QA thresholds together.
- Realtime Web Audio playback is intentionally not claimed to be sample-identical to the offline WAV renderer, and loop-boundary behavior is outside this offline-export fix.
- Developer ID signing, notarization, Gatekeeper approval, real channel metadata, update-feed publication, and manual external-distribution approval still require private operator inputs and are not claimed.
