# plan-1504-switchback-soundcloud review

## Scope

Review the post-QA Switchback SoundCloud upload pack for true 24-bit rendering, source-project identity, technical audio integrity, official-platform metadata guidance, artist-identity clarity, and handoff completeness. No external upload or account mutation is in scope.

## QA Evidence Reviewed

- Source GrooveForge project reopened as `06 MINAMI — 스위치백 (Switchback)`, 146 BPM, D minor, 64 arrangement bars.
- Current-renderer 16-bit reference SHA-256 exactly matched the previously delivered 16-bit WAV SHA-256.
- Independent `file` audit identified Microsoft PCM, 24-bit, stereo, 44.1kHz.
- Independent macOS `afinfo` audit identified 24-bit little-endian signed integer PCM, stereo 44.1kHz, 4,672,637 packets/frames, 105.955488 seconds, and 2,116,800 bit/s.
- Independent byte-level parser verified RIFF/WAVE PCM format 1, six-byte block alignment, 9,345,213 nonzero samples, zero full-scale samples, and a zero final stereo frame.
- 9,308,437 samples have nonzero lower eight bits, proving the file is not a 16-bit WAV padded into a 24-bit container.
- Metadata audit found title, Artist guidance, BPM, key, genre, mood, English tags, description, license, privacy, downloads, artwork, upload checklist, and official-source links.
- `python3 harness/scripts/run_qa.py` — pass.
- `python3 harness/scripts/run_quality_gate.py` — pass.
- `ffprobe` was unavailable in the workspace; `file`, `afinfo`, and the independent PCM parser supplied three successful format checks instead.

## Findings

No blocking findings.

### Audio integrity

- The mix was rendered again from GrooveForge's float buffer and directly quantized to signed 24-bit PCM. It was not derived by zero-padding the delivered 16-bit samples.
- The 24-bit output preserves the source frame count, duration, stereo topology, sample rate, project BPM/key, arrangement, and musical state.
- Peak is -3.041 dBFS and RMS is -20.485 dBFS. There are no full-scale samples, and the final frame is exact digital zero.
- The last 128 frames contain a maximum value of 41/8,388,608 (roughly sub-16-bit residual level). Preserving it keeps the direct float render intact; it is not clipping or material trailing audio.

### SoundCloud handoff

- `Electronic` is proposed as one broad main genre; precise style appears in the description rather than as several redundant genre tags.
- Tags are English and individually scoped. BPM and key are included as tags and description text because current SoundCloud Basic Info documentation does not identify dedicated BPM/key fields.
- The proposed title says `MINAMI Target Pitch Demo [Instrumental]`; the Artist field explicitly requires the uploader's own artist/producer name.
- Private-first, All Rights Reserved, Downloads Off, and monetization/distribution Off are appropriate defaults for an unofficial target pitch.
- The metadata document includes the exact disclosure that this is not affiliated with, commissioned by, or approved by MINAMI, RESCENE, or THE MUZE Entertainment.

## Residual Risk

- `[YOUR ARTIST NAME]` and `[YOUR NAME / RIGHTS HOLDER]` must be replaced by the uploader before publishing.
- The file is a pre-production instrumental pitch with a synth topline guide, not a release master or member vocal performance. Subjective transcoded-playback review remains necessary.
- SoundCloud may change UI labels, chart genres, subscription limits, or transcoding behavior after the 2026-07-23 check date.
- Public use of MINAMI/RESCENE names, likeness, logos, or official imagery can create publicity, trademark, or endorsement concerns. The pack avoids claiming affiliation but does not substitute for legal review.
- Enabling downloads exposes the original uploaded 24-bit file. Monetization, distribution, and Content ID need separate rights and identity review.

## Recommendation

Accept the pack for private SoundCloud review. Replace the two rights-holder placeholders, upload the 24-bit WAV as Private, listen to SoundCloud's beginning/middle/end transcodes, and only then decide whether to enable Public visibility or downloads. Keep Artist metadata under the uploader's own name.
