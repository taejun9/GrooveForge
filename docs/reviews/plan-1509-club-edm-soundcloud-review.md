# plan-1509-club-edm-soundcloud review

## Review Result

PASS — blocking finding 없음.

## Scope

- 독창적인 sample-free club EDM instrumental `NEON UNDERTOW (Original Mix)`
- stereo 44.1kHz signed PCM 24-bit WAV
- editable GrooveForge project와 format-1 MIDI
- 제작 노트, SoundCloud 업로드 정보, QA report와 SHA-256 manifest

## QA Evidence

- 독립 PCM parser: RIFF/WAVE format 1, stereo, 44.1kHz, 24-bit, 6-byte block align, 5,325,075 frames, 120.75초
- WAV peak / RMS: -1.179 / -18.294dBFS
- drop RMS: first -15.993dBFS, final -15.994dBFS; breakdown -35.933dBFS
- full-scale samples 0, terminal frame peak 0, musical boundary 뒤 tail nonzero samples 66,148
- DC offset 0.00000155, stereo correlation 0.999306, 24-bit lower-byte activity 99.612%
- WAV SHA-256: `993dda3b46c6f134a15a6be72112d962f86c9a085792753fec47ce2bfdbc57f1`
- `file`과 `afinfo`: Microsoft PCM / 24-bit little-endian signed integer / stereo / 44.1kHz / 120.75초
- MIDI: format 1, five tracks, 480 PPQ, 128 BPM, 1,744 note-ons, 122,880 ticks / 120초
- 프로젝트: GrooveForge file version 1, 128 BPM, F minor, house, swing 0, three patterns, 64 bars
- manifest의 모든 전달 파일 SHA-256 일치
- `python3 harness/scripts/run_qa.py`: PASS
- `python3 harness/scripts/run_quality_gate.py`: PASS

## Music and Club Review

- straight four-on-the-floor kick와 offbeat bass가 128 BPM club 기준점을 명확히 만든다.
- 첫 8 bars와 마지막 8 bars에 synth/chord를 mute해 DJ가 kick/bass 기준으로 mix-in/out할 공간을 둔다.
- first drop과 final drop은 약 -15.99dBFS RMS이고 breakdown은 -35.93dBFS로, drop 대비가 19dB 이상이다.
- F–Ab–C–Eb 상승형 lead hook과 F minor / Eb 대비, 강한 sidechain 설정이 곡의 독립적인 정체성을 만든다.
- 저역 중심 소스의 stereo correlation이 양수로 높아 mono PA 호환성에 유리하며, melodic pan·width·space send로 채널이 byte-identical한 mono에 머물지는 않는다.

## Artifact and Metadata Review

- float mix에서 직접 24-bit로 양자화했고 lower byte의 99.612%에 실제 신호가 있어 16-bit zero-padding이 아니다.
- channel DC 제거 뒤에도 peak가 -1dBFS 아래이며 full-scale sample이 없고 마지막 frame은 digital zero다.
- project, MIDI, WAV의 BPM·key·bars·title이 일치하고, project를 다시 열어 후속 편집할 수 있다.
- SoundCloud 문서에는 title, artist placeholder, URL slug, main/detailed genre, BPM, key, mood, English tags, description, caption, artwork brief, license, visibility, downloads, monetization/distribution, release metadata와 upload checklist가 있다.
- SoundCloud 공식 안내에 맞춰 lossless WAV, stereo, transcoding headroom, main genre/first tag, multi-word tag 유지, downloads가 original file을 제공한다는 점을 반영했다.

## Rights and Privacy Review

- 제3자 sample, 상업 녹음, 보컬, voice clone, 원격 AI 음성을 사용하지 않았다.
- Artist와 rightsholder는 사용자의 실제 이름으로 교체하도록 placeholder로 두었다.
- 초기값은 Private / All Rights Reserved / Downloads Off / monetization·distribution·Content ID Off다.
- 실제 SoundCloud 업로드, 공개 전환, 수익화와 배급은 이번 범위에 포함하지 않았다.

## Residual Risks

- 기술·구조 검사는 통과했지만 실제 클럽 PA, calibrated monitor, mono sub, 헤드폰에서의 인간 청취를 대체하지 않는다.
- 공개 전에는 SoundCloud transcoded playback의 beginning, drops, breakdown, ending을 다시 들어야 한다.
- artwork, 보컬, 공동작업자, 외부 sample을 나중에 추가하면 권리와 mix 검토를 다시 해야 한다.

## Recommendation

사용자에게 24-bit WAV와 upload sheet를 전달한다. 먼저 Private으로 업로드해 transcoded playback을 확인하고, 실제 PA 청취에서 kick/bass balance와 고역 피로도를 승인한 뒤 Public 또는 downloads 설정을 결정한다.
