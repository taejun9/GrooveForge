# plan-1468-audio-render-isolation review

## Outcome

Approved. No blocking, major, or moderate findings remain.

## Scope Reviewed

- The pre-fix Drums-stem reproduction after an unrelated Synth level edit.
- Offline render noise seed inputs and their relationship to mixer, Pattern, arrangement, sound, and master state.
- Non-target Synth volume, pan, mute, solo, low-cut, air, Drive, Glue, and Space-send isolation.
- Selected-Pattern UI state and unrelated Melody-note isolation for arrangement-routed Drums stems.
- Target Drums mixer and relevant hat-noise sound sensitivity.
- Drums-only solo mix and same-state Drums stem byte equality.
- Full-mix decoded PCM output for all 14 style profiles and full mix plus four stems for both audience projects.
- Product, quality, harness, privacy, packaging, install, and external-release boundary updates.

## Evidence

- Before the fix, changing only Synth `volumeDb` by -1 dB changed the 3,938,280-byte Drums stem SHA-256 from `8cb151eeb11713e125f280b6e0d0b9e9084f7c62ae625a87cf021bb42f8154f2` to `da7aff218e9ce1e2985cfdd94d502bdd6bfc0dafaa49871f592705e6977f2b73`.
- After the fix, all 11 unrelated edits produce the identical Drums stem SHA-256 `f0c4d4f796deebd37b2b76bcab348763df164dd8c48b25fac84227d5a6589c1c`. The target Drums level edit and hat-brightness edit each produce different output, and the Drums-only solo mix equals the same-state Drums stem.
- `npm run sample-audio:qa` passed with 24 playable WAV files: two audience mixes, eight audience stems, and 14 distinct style mixes. Every file is canonical stereo 44.1kHz/16-bit PCM, audible in both channels, renderer-analysis aligned within 0.02 dB, ceiling-safe, free of digital full-scale samples, and byte-identical on immediate rerender.
- The 14 style mixes have 14 unique hashes, peak values from -5.97 to -2.73 dB, and RMS values from -24.89 to -19.23 dB.
- The final beginner mix is 22.33 seconds, -4.40 dB peak, -21.68 dB RMS, and SHA-256 `34e922d050fbf98f296ecb88068299eb108640f1a37a2568b74112d56999718c`.
- The final professional mix is 50.32 seconds, -3.28 dB peak, -20.02 dB RMS, and SHA-256 `ed91678d10e9fea95904f066cba7971c7ab960c2d8e5414239dab7af8955c8d2`.
- Typecheck, renderer smoke, 30/30 runtime project/export roundtrips, repository QA, and `git diff --check` passed.
- Full `npm run verify` exited 0 and covered live source Electron, native project IO, packaged/ad-hoc/PKG-payload/installed app launches, packaged/payload/installed project IO, DMG, PKG, privacy/value-leak checks, and bounded external release evidence.

## Review Notes

The fix removes `stableStringify` and `hashString` of whole-project state from noise generation. Each rendered noise event now derives its seed only from a stable GrooveForge salt, its noise-event sequence index, start frame, duration frames, and brightness. This preserves deterministic event-local noise while preventing unrelated mixer, selection, and non-drum event edits from silently changing an untouched track.

The target mixer and hat-noise sensitivity checks guard against over-isolation: edits that should affect Drums still change its encoded output. The solo/stem equality check additionally proves the full-mix routing path and stem path agree when only Drums is audible in the same project state.

Generated WAV, JSON, and Markdown evidence remains ignored under `build/desktop`. No imported audio, real user projects, private values, URLs, network calls, signing, notarization, or external distribution claim is introduced.

## Residual Risks

- The matrix proves encoded offline-render isolation; it does not claim sample-identical Web Audio realtime synthesis or replace device-specific listening.
- The isolation fixture targets Drums because the confirmed coupling affected seeded noise. Bass, Synth, and Chords remain covered by all-style PCM, stem audibility, deterministic rerender, and broader runtime/package tests but do not currently have the same 11-edit byte-isolation matrix.
- Numeric PCM checks do not replace professional listening, mix/master review, LUFS/true-peak measurement, or platform certification.
- Developer ID signing, notarization, private release metadata, update publishing, and external manual QA remain intentionally outside local implementation scope and are not claimed.
