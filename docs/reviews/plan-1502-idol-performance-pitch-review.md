# plan-1502-idol-performance-pitch review

## Scope

Review the post-QA `불꽃 비밀번호 (FIREWORK PASSWORD)` package for idol-pop immediacy, contrast with the prior four-member pitch, requested 24-bit delivery, member-role clarity, artifact integrity, originality/misrepresentation boundaries, and handoff completeness. Generated user audio remains outside git.

## QA Evidence Reviewed

- Direct float-to-24-bit integer PCM encoding before restoring the product renderer source unchanged.
- Canonical RIFF/WAVE parsing: stereo 44.1 kHz, 24-bit, 6-byte frame alignment, 2,116,800 bps.
- 10,775,684 non-zero low-order sample bytes (99.607%), proving the file is not padded 16-bit PCM in a 24-bit container.
- Peak/RMS agreement with the float renderer, zero full-scale samples, and terminal digital zero.
- Format-1 five-track MIDI parsing at 480 PPQ and 126 BPM; project reopen regenerates the MIDI byte-identically.
- Independent SHA-256 recalculation for all eight manifest-listed deliverables.
- Exact title and distinctive lyric-line searches; no exact music/title or lyric result was found.
- `python3 harness/scripts/run_qa.py` — pass.
- `python3 harness/scripts/run_quality_gate.py` — pass.

## Findings

No blocking findings.

### Idol-song immediacy and contrast

- At 126 BPM, the track is materially faster and brighter than the prior 104 BPM nocturnal alternative pitch.
- The 64-bar form delivers intro, verse, four-bar pre-chorus, eight-bar chorus, spelling-based post-chorus, second verse, second lift, chorus, dance break, and final chorus without a long instrumental preamble.
- `불꽃 비밀번호` is stated twice per chorus and reappears in the post-chorus/dance break, providing an immediate title anchor.
- Four-on-the-floor hook drums, offbeat hats, ascending pre-chorus harmony, group chant, and point-dance instructions establish a clear idol-performance use case.

### Four-member functional fit

- GD opens Verse 1 with bright syncopated sing-rap and returns for post-chorus/dance-break texture.
- T.O.P frames the intro, owns the lower and more spacious second verse, and supplies a half-time dance-break counterweight.
- TAEYANG leads the first R&B lift and hook upper line.
- DAESUNG leads the second lift and final open-vowel climax.
- The functions are new writing assignments, not transcriptions of existing flows, ad-libs, melodies, or songs.

### 24-bit artifact integrity

- Delivered WAV is 122.655 seconds, stereo 44.1 kHz 24-bit integer PCM, with a -1.140 dBFS peak and -17.706 dBFS RMS.
- It contains no full-scale samples and ends at digital zero.
- Low-order byte population demonstrates real quantization from the internal float mix rather than a zero-padded 16-bit source.
- MIDI contains five tracks, 2,872 note-ons, and matches the reopened project regeneration byte-for-byte.

### Handoff completeness and safety

- The package contains a first-read guide, idol-direction brief, complete lyrics/production sheet, combined SoundCloud/part/performance guide, WAV, MIDI, reopenable project, manifest, and QA report.
- SoundCloud metadata includes BPM, key, genre, moods, English tags, description, caption, URL slug, artwork brief, privacy/download/license posture, and credit placeholders.
- No artist audio, copied lyric/melody, third-party sample, voice clone, credential, or private data is present.
- The handoff identifies the work as an unofficial independent pitch and avoids listing the requested artists as actual participants.

## Residual Risk

- The synth topline is not a vocal demo. Actual tessitura, passaggio, Korean prosody, pronunciation, breathing under choreography, and member preference require performer-led sessions.
- Repeating three musical patterns communicates the idol form but does not replace through-composed transitions, live instruments, vocal stacks, ear candy, stems, and release mastering.
- Signal QA does not replace critical listening on studio monitors, headphones, phone speakers, and a performance PA.
- Title/line search absence and internal originality checks are not worldwide non-infringement proof. Commercial release still requires catalog and legal clearance.
- Naming BIGBANG or members publicly without real participation could mislead listeners; the provided public metadata intentionally omits those names.

## Recommendation

Accept as a bright idol-performance companion to `정전의 꽃`. Test the chorus in C minor, B minor, and B-flat minor with real singers while performing the point choreography. If the title hook stays clear under movement, commission non-imitative guide vocals, expand the dance-break transition, produce stems, and complete legal clearance before any public artist association.
