# plan-1510-club-hiphop-soundcloud review

## Review Result

PASS — blocking finding 없음.

## Scope

- 독창적인 sample-free club hip-hop instrumental `MIDNIGHT PRESSURE (Club Mix)`
- stereo 44.1kHz signed PCM 24-bit WAV
- editable GrooveForge project와 format-1 MIDI
- 제작 노트, SoundCloud 업로드 정보, QA report와 SHA-256 manifest

## QA Evidence

- 독립 PCM parser: RIFF/WAVE format 1, stereo, 44.1kHz, 24-bit, 6-byte block align, 6,551,395 frames, 148.558초
- WAV peak / RMS: -1.052 / -17.082dBFS
- first/final hook RMS: -14.911 / -14.897dBFS; verse pocket -16.637dBFS; breakdown -38.366dBFS
- float render limiting: 7,435 samples / 0.0567%; encoded full-scale samples 0
- terminal frame peak 0, musical boundary 뒤 tail nonzero samples 76,326
- DC offset 0.00000144, stereo correlation 0.999623, stereo-different frames 6,551,141
- 24-bit lower-byte activity 99.610%
- WAV SHA-256: `af677fbb9b48658ed50b0eda5e6f2457809cd75fbd5e09a765f3cf077721c523`
- `file`과 `afinfo`: Microsoft PCM / 24-bit little-endian signed integer / stereo / 44.1kHz / 148.558초
- MIDI: format 1, five tracks, 480 PPQ, 104 BPM, 2,128 note-ons, 122,880 ticks / 147.692초
- 프로젝트: GrooveForge file version 1, 104 BPM, G minor, trap, swing 4%, three patterns, 64 bars
- manifest의 모든 전달 파일 SHA-256 일치
- `python3 harness/scripts/run_qa.py`: PASS
- `python3 harness/scripts/run_quality_gate.py`: PASS

## Music and Club Hip-Hop Review

- staggered kick와 sliding G-minor 808이 club hip-hop의 저역 지문을 명확히 만든다.
- first/final hook은 약 -14.90dBFS RMS이며 breakdown보다 약 23dB, verse pocket보다 약 1.7dB 높아 복귀가 분명하다.
- bars 33–40은 lead를 제거해 rapper/MC가 들어갈 중역 공간을 확보한다.
- 앞뒤 8 bars는 synth/chord를 mute해 DJ가 kick/808 기준으로 mix-in/out할 수 있다.
- G–Bb–D–F 상승형 synth hook과 4% swing이 straight club grid 안에 hip-hop pocket을 더한다.
- kick/808은 중심에 두고 melodic pan·width·space send만 보수적으로 사용해 mono PA 호환성을 우선했다.

## Artifact and Metadata Review

- float mix에서 직접 24-bit로 양자화했고 lower byte의 99.610%에 실제 신호가 있어 16-bit zero-padding이 아니다.
- bounded limiter 뒤에도 peak는 -1dBFS 아래이며 full-scale sample이 없고 마지막 frame은 digital zero다.
- project, MIDI, WAV의 BPM·key·bars·title이 일치하고, project를 다시 열어 후속 편집할 수 있다.
- SoundCloud 문서에는 title, artist placeholder, URL slug, main/detailed genre, BPM, key, mood, English tags, description, caption, artwork brief, license, visibility, downloads, monetization/distribution, release metadata와 upload checklist가 있다.
- SoundCloud 공식 안내에 맞춰 lossless WAV, stereo, transcoding headroom, main genre/first tag, multi-word tag 유지, downloads가 original file을 제공한다는 점을 반영했다.

## Rights and Privacy Review

- 제3자 sample, 상업 녹음, 보컬, voice clone, 원격 AI 음성을 사용하지 않았다.
- 특정 아티스트나 기존 곡을 reference identity로 사용하지 않았다.
- Artist와 rightsholder는 사용자의 실제 이름으로 교체하도록 placeholder로 두었다.
- 초기값은 Private / All Rights Reserved / Downloads Off / monetization·distribution·Content ID Off다.
- 실제 SoundCloud 업로드, 공개 전환, 수익화와 배급은 이번 범위에 포함하지 않았다.

## Residual Risks

- 기술·구조 검사는 통과했지만 실제 클럽 PA, calibrated monitor, mono sub, 헤드폰에서의 인간 청취를 대체하지 않는다.
- 랩 또는 보컬을 추가하면 verse headroom, hook synth density와 master loudness를 다시 조정해야 한다.
- 공개 전에는 SoundCloud transcoded playback의 intro, hooks, verse, breakdown과 ending을 다시 들어야 한다.
- artwork, 공동작업자, 외부 sample을 나중에 추가하면 권리 검토를 다시 해야 한다.

## Recommendation

사용자에게 24-bit WAV와 upload sheet를 전달한다. 먼저 Private으로 업로드해 transcoded playback을 확인하고, 실제 PA 청취에서 kick/808 balance와 고역 피로도를 승인한 뒤 Public 또는 downloads 설정을 결정한다.
