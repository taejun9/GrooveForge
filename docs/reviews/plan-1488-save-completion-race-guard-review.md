# plan-1488-save-completion-race-guard review

## Verdict

Approved after follow-up. No blocking, major, or moderate findings remain after the cross-project file-identity race found during separate review was fixed, final-code QA was rerun, the full release check passed, and sample audio was regenerated after packaging.

## Reviewed Scope

- Native Save and browser download snapshot capture, request sequencing, cancellation, failure, overlapping completion, and feedback.
- Dirty state, renderer-local recovery, active file identity, focused Limiter draft resolution, and full-project replacement ordering.
- Existing project serialization, schema, Open/import guard, playback, history, local-first privacy, and sample-free product boundaries.

## Findings and Resolutions

The first post-QA review found one major gap: ordinary edits during Save correctly became `saved-snapshot`, but opening project B while Save A was pending could let A's later success overwrite B's active file label. Full-project replacement now advances the Save request sequence before installing its own project and file identity, so the older completion becomes stale.

Final review confirmed:

1. The latest request whose exact serialized project remains current is the only path that clears recovery and marks clean.
2. A latest successful older snapshot retains newer edits as dirty and recoverable, identifies the written file, and tells the user to save again.
3. Older success, cancellation, and failure completions return without overwriting newer status or file identity.
4. Full-project replacement invalidates pending Save completion before installing the replacement project or file label.
5. Focused Limiter state resolves before snapshot capture, and native plus browser persistence paths use the same completion contract.
6. No project schema, musical-event, render, remote-service, account, analytics, or sampling-first behavior changed.

## QA Evidence

- `npm run typecheck`: passed.
- `npm run qa`: passed.
- `npm run harness:smoke`: passed 4/4 Save completion paths, including 2/2 stale paths and 1/1 changed-snapshot path, alongside 30/30 project roundtrips.
- `npm run renderer:smoke`: passed request/snapshot/await order, stale-return paths, exact cleanup rules, replacement invalidation, and warning feedback checks.
- `npm run workflow:smoke`: passed beginner and producer composition, save/load, export analysis, MIDI, and Handoff workflows.
- `npm run persona:smoke`: passed first-time composer and professional producer readiness, 14/14 styles, delivery packages, reopen, and acceptance evidence.
- `python3 harness/scripts/run_quality_gate.py`: passed.
- `npm run build`: passed.
- `npm run sample-audio:qa`: schema 17 passed 41/41 playable WAVs, 41/41 digital-zero endings, 33/33 full mixes retaining tail content, and 11/11 isolation checks.
- `npm run release:check`: exited 0 outside the restricted GUI sandbox after live Electron, native/packaged/PKG payload/installed project I/O, DMG/PKG, signing-truth, privacy, and release-readiness checks. The sandboxed attempt stopped only at the intentional AppKit guard.
- `git diff --check`: passed.

## Sample Evidence

- `beginner-guided-lofi/grooveforge-beginner-sample-beat-demo.wav`: 23.37 seconds, peak -4.44 dBFS, RMS -21.86 dBFS, SHA-256 `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318`.
- `professional-studio-house/grooveforge-professional-sample-beat-demo.wav`: 51.07 seconds, peak -3.32 dBFS, RMS -20.10 dBFS, SHA-256 `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`.

The guard is renderer-local and does not alter musical events or audio rendering. Final post-package regeneration reproduced the established audience hashes and the complete 41-WAV matrix.

## Residual Boundaries

- Automated async decisions and source-order checks do not replace a human exercise with multiple native Save dialogs or a hardware listening pass.
- Object identity is intentionally conservative and is not a full saved-history cursor or file versioning system.
- External distribution still requires private release-channel metadata, Developer ID signing, notarization/stapling, Gatekeeper acceptance, and manual approval; none is claimed by this plan.
