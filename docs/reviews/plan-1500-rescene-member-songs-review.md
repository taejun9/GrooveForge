# plan-1500-rescene-member-songs review

## Scope

Review the post-QA member-specific RESCENE solo songbook for public-evidence discipline, exact two-song allocation, meaningful contrast within each member pair, artifact integrity, originality and privacy boundaries, and handoff clarity. The generated user package remains outside git.

## QA Evidence Reviewed

- Generator-level WAV parsing, signal analysis, MIDI parsing, project reopen, and MIDI-regeneration checks for ten songs.
- Independent package audit: 46 files, 20/20 WAV/MIDI SHA-256 matches, 10/10 project reopens, 10/10 byte-identical MIDI regenerations, and all required lyric sections.
- Independent `file` signature audit: ten stereo 44.1kHz 16-bit PCM WAVs and ten format-1 five-track MIDI files.
- Ten unique current melody fingerprints with zero overlap against the ten fingerprints in the 2026-07-22 RESCENE songbook.
- `python3 harness/scripts/run_qa.py` — pass.
- `python3 harness/scripts/run_quality_gate.py` — pass.

## Findings

No blocking findings.

### Member evidence and pair contrast

- WONI: `등불의 온도` translates her publicly stated supportive leadership into warm chamber R&B; `중력선` turns the same steadiness into a sleek, low-centered performance track. The pair does not reduce leadership to authority or sentimentality.
- LIV: `투명한 파도` uses the restrained, clear expression documented in her 2026 OST; `네온 전류` foregrounds the energetic dance and strong voice she named as strengths. The pair tests both intimacy and vocal impact.
- MINAMI: `양면 거울` integrates melodic rap, stable singing, and collaboration readiness; `스위치백` tests rapid concept and rhythm changes. The pair supports the public all-rounder description without treating nationality as a genre shortcut.
- MAY: `낮 열두 시의 비밀` makes her sunshine image active and confident; `새벽 네 시의 해` derives quiet resilience from her published dawn-memory story. The pair avoids limiting positive energy to cuteness.
- ZENA: `무음 영화` gives sustained space to facial expression and dreamy range; `핑크 플래시` turns mood-making and expression changes into a fast camera-focused track. The pair gives the youngest member both subtle and bold agency.

### Artifact integrity

- Required allocation is exact: five members × two songs = ten.
- Every song includes WAV, MIDI, a reopenable GrooveForge project, and a complete Korean lyric/production sheet.
- WAVs contain audible nonzero PCM, remain below full scale, and end at digital zero.
- MIDIs contain tempo metadata and five tracks for tempo, drums, bass, synth topline guide, and chords.
- All ten musical projects and melody fingerprints are distinct; no prior-package fingerprint is reused.

### Safety and originality boundary

- Sources are limited to official profiles/content, direct interviews, and public release pages. The brief separates public statements from creative interpretation.
- Provisional pitch ranges are explicitly labeled as session guides rather than verified member ranges.
- No downloaded artist audio, quoted lyric, copied melody, third-party sample, voice clone, inferred private detail, remote synthesis request, or credential is present.
- LIV's OST and MINAMI's feature are used only as evidence of public vocal context; their music and lyrics are not reproduced.

## Residual Risk

- Synth topline WAVs are composition demos, not vocal demos. Member tessitura, passaggio, Korean prosody, pronunciation, breath under choreography, and emotional delivery require supervised sessions.
- A unique internal fingerprint is not worldwide non-infringement proof. Formal catalog comparison and legal clearance remain necessary before commercial release.
- Automated signal checks do not replace listening on studio monitors, headphones, phone speakers, and a club or stage system where applicable.
- GrooveForge's three-pattern 64-bar form communicates the songs, but selected tracks need through-composed transitions, ear candy, vocal stacks, stems, and release mastering.

## Recommendation

Accept the package as an original member-specific pre-production songbook. Begin review with `등불의 온도`, `투명한 파도`, `양면 거울`, `새벽 네 시의 해`, and `무음 영화`, then compare each member's second track to choose whether the final production should deepen the established strength or emphasize the contrast.
