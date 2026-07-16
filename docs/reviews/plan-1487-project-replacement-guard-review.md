# plan-1487-project-replacement-guard review

## Verdict

Approved after follow-up. No blocking, major, or moderate findings remain after the recovery-only startup gap found in the first review was fixed, final-code QA was rerun, sample audio was regenerated, and the full release check passed.

## Reviewed Scope

- Native, browser, toolbar, Workspace Command Dock, first-run, and Quick Actions Open/import convergence.
- Candidate parsing, focused master-ceiling draft resolution, dirty-state freshness, prior-session recovery protection, confirmation, cancellation, and replacement ordering.
- Existing project history, playback, file identity, renderer-local draft lifecycle, project schema, and local-first privacy boundaries.

## Findings and Resolutions

The first post-QA review found one major gap: a parsed prior-session recovery draft can exist at startup while the current starter project is marked clean. A dirty-only guard would therefore allow Open to clear that recovery record without confirmation. The implementation was expanded before approval to a two-input dirty/recovery guard with exhaustive four-state coverage.

Final review confirmed:

1. The only unguarded state is `dirty=false / recovery=false`; it opens directly without unnecessary interruption.
2. Dirty-only, recovery-only, and dirty-plus-recovery states all require confirmation, and each warning names only the protected data that exists.
3. Candidate parsing occurs before confirmation, so invalid or oversized files cannot prompt or replace the current project.
4. A focused Limiter ceiling draft resolves into current project truth before the guard decision, and the synchronously maintained dirty ref prevents a stale React closure from missing that edit.
5. Cancel returns before playback stop, project/history/file-identity replacement, or local-draft clearing. The only retained change can be the user's already-visible focused ceiling value being committed into the current project.
6. Successful confirmation continues through the existing bounded parser and `replaceProject` lifecycle, preserving first-edit recovery eligibility from plan-1486.

## QA Evidence

- `npm run typecheck`: passed.
- `npm run qa`: passed before review and after the recovery-only fix.
- `npm run harness:smoke`: passed 4/4 dirty/recovery states and 3/3 protected-loss states alongside 30/30 project roundtrips and existing audio/delivery safety boundaries.
- `npm run renderer:smoke`: passed pure-guard SSR loading plus App parse/guard/cancel/replace ordering, latest dirty ref, current recovery input, and focused draft integration.
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

The project-replacement guard is renderer-local and does not alter musical events or render behavior. Final regenerated audience samples remain audible, deterministic, tail-safe, and digital-zero terminated, while the full 41-WAV matrix preserves all genre and repair-path coverage.

## Residual Boundaries

- Automated decision, source-order, renderer, PCM, package, and project-I/O checks do not replace a human confirmation-dialog exercise or listening review on representative hardware.
- Closing the application still relies on renderer-local recovery rather than a dedicated unsaved-close confirmation; this plan is scoped to valid Open/import replacement.
- External distribution still requires private release-channel values, Developer ID signing, notarization/stapling, Gatekeeper acceptance, and manual approval evidence; none is claimed by this plan.
