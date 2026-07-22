# plan-1499-rescene-songbook review

## Scope

Review the post-QA RESCENE songbook delivery for research coverage, requested counts, artifact integrity, originality and privacy boundaries, member/fandom fit, and handoff clarity. Product code is not part of this change; the user-facing song package remains outside git.

## QA Evidence Reviewed

- Generator-level PCM and MIDI parsing for ten songs.
- Independent `file` signature audit for 10 WAV and 10 MIDI artifacts.
- Independent SHA-256 audit for all 20 binary artifacts against `MANIFEST.json`.
- GrooveForge parser reopen and MIDI regeneration for all ten 64-bar project files.
- Complete lyric-section audit: every song has at least eight labeled song-form sections plus production notes.
- `python3 harness/scripts/run_qa.py` — pass.
- `python3 harness/scripts/run_quality_gate.py` — pass.
- Escalated `npm run verify` — all relevant build, desktop launch, project-I/O, packaged-app, DMG, PKG, install-simulation, delivery-package, and release-progress checks reached pass results. The aggregate process was deliberately stopped when its final external-distribution packet entered an interactive setup wizard for unavailable private channel inputs; the preceding `release:completion-summary-smoke` passed.

## Findings

No blocking findings.

### Research and targeting

- The research brief prioritizes official Mnet Plus/THE MUZE pages and platform discographies, then uses direct member interviews, official-announcement reporting, and Korean music criticism to interpret member strengths and musical evolution.
- Coverage reaches the July 8, 2026 `Pretty Girl` release and distinguishes the main RESCENE album line from OST, collaboration, language-version, and remake contexts.
- The seven group tracks cover distinct lanes already supported by the research without reproducing an existing track: floral hook pop, dark D&B, blue-hour 2-step, bright teen pop, harmony R&B, Dorian bass pop, and warm midtempo harmony.
- The three REMINE tracks use the fandom name's documented double meaning and keep the relationship reciprocal rather than possessive.

### Artifact integrity

- Required count is exact: 7 RESCENE + 3 REMINE = 10.
- Every song includes WAV, MIDI, reopenable GrooveForge JSON, and a complete Korean lyric/production sheet.
- WAVs are audible PCM by nonzero-sample analysis, stay below full scale, and end at digital zero.
- MIDIs are valid format-1 files with five tracks, tempo data, and more than 2,300 note-on events each.
- Internal topline fingerprints are unique across all ten songs, and BPM/key/genre/scent assignments vary across the set.

### Safety and originality boundary

- The package contains no downloaded artist audio, third-party sample, quoted lyric, voice clone, private member data, remote AI request, or credential.
- Research traits are used at the level of mood, instrumentation, group-harmony strategy, and sensory narrative.
- The README and every production sheet state that the package is an unofficial independent pitch and not an artist-approved recording.

## Residual Risk

- The rendered WAVs are synth-led instrumental composition demos, not final vocal productions. Actual member tessitura, Korean lyric prosody, choreography breathing, and line distribution require an A&R/vocal session.
- Internal fingerprint uniqueness does not prove worldwide melodic non-infringement. A label should run formal catalog similarity and legal clearance before commercial release.
- Automated PCM analysis confirms valid audible signal but does not replace subjective monitoring on studio speakers, headphones, and mobile playback.
- GrooveForge's three-pattern/64-bar demo form communicates sections and topline motifs but a final producer may add through-composed second-verse detail, transitions, ear candy, stems, and release mastering.
- Repository-wide external-distribution completion remains gated on private release-channel metadata, Developer ID signing, notarization, and manual distribution QA. Those product-release inputs are unrelated to this local songbook handoff and were not fabricated.

## Recommendation

Accept the delivery as an original pre-production songbook. Start artist or producer review with `유리정원`, `잔향 신호`, `벨벳 궤도`, `리마인, 기억해 줘`, and `앙코르, 우리의 장면`, then select two or three tracks for live vocal-range testing and full DAW production.
