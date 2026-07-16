# plan-1486-project-dirty-recovery-lifecycle review

## Verdict

Approved. No blocking, major, or moderate findings remain after QA, separate review, exhaustive boolean-gate testing, final sample regeneration, and the full release-check rerun.

## Reviewed Scope

- Renderer-local draft write suppression during full-project replacement.
- First meaningful edit after replacement and its recovery-write eligibility.
- Undo/Redo project restoration after a successful durable save.
- Unsaved-change signaling, local recovery arming, durable Save behavior, and existing local-storage bounds.

## Findings and Resolutions

Separate post-QA review found no product defect requiring a follow-up change. The review specifically confirmed:

1. Replacement consumes its own one-shot draft suppression even while writing is disarmed, so the first later content edit no longer loses recovery coverage.
2. All four `writeArmed`/`skipNextWrite` combinations resolve deterministically, and every skip is consumed after one decision.
3. Successful Undo and Redo restoration mark the current project unsaved and recovery-write eligible because their content may differ from the durable file.
4. The change is conservative: a Redo that happens to return to the last saved bytes still remains marked dirty until another explicit save, avoiding an unsafe clean claim without a saved-history cursor.
5. Replacement itself still avoids writing a misleading recovery draft, while successful durable Save/download remains the transition that clears recovery and cleanly labels the project.

## QA Evidence

- `npm run typecheck`: passed.
- `npm run qa`: passed before review and in the full release chain.
- `npm run harness:smoke`: passed 4/4 local-draft write-gate paths and the replacement-to-first-edit sequence, alongside 30/30 project roundtrips and existing audio/delivery safety boundaries.
- `npm run renderer:smoke`: passed the shared gate integration and required Undo/Redo unsaved/recovery state transitions.
- `npm run workflow:smoke`: passed beginner and producer composition, arrangement, mix/master, save/load, MIDI, export analysis, and Handoff workflows.
- `npm run persona:smoke`: passed first-time composer and professional producer paths, 14/14 styles, package delivery/reopen, and audience acceptance.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run build`: passed.
- `npm run sample-audio:qa`: schema 17 passed 41/41 playable WAVs, 41/41 digital-zero endings, 33/33 full mixes retaining tail content, and 11/11 isolation checks.
- `npm run release:check`: exited 0 after quality, renderer, workflow, persona, runtime, sample audio, local delivery/reopen, native/packaged/PKG payload/installed project I/O, live app launch, packaging, ad-hoc signing, hardened-runtime truth checks, DMG, PKG, simulated install, privacy, and release-readiness checks.
- `git diff --check`: passed.

## Sample Evidence

- `beginner-guided-lofi/grooveforge-beginner-sample-beat-demo.wav`: 23.37 seconds, peak -4.44 dBFS, RMS -21.86 dBFS, SHA-256 `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318`.
- `professional-studio-house/grooveforge-professional-sample-beat-demo.wav`: 51.07 seconds, peak -3.32 dBFS, RMS -20.10 dBFS, SHA-256 `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`.

The recovery lifecycle change is UI-local and does not alter musical events or render behavior. Final regenerated audience samples remain audible, deterministic, tail-safe, and digital-zero terminated, while the full 41-WAV matrix preserves all genre and repair-path coverage.

## Residual Boundaries

- Automated state, storage, renderer, PCM, package, and project-I/O checks do not replace a human crash/relaunch exercise or listening review on representative hardware.
- The conservative dirty flag does not identify an exact saved-history cursor; returning to saved bytes through Redo still requires an explicit Save to re-establish clean state.
- External distribution still requires private release-channel values, Developer ID signing, notarization/stapling, Gatekeeper acceptance, and manual approval evidence; none is claimed by this plan.
