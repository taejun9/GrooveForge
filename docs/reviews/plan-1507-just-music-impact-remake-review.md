# plan-1507-just-music-impact-remake review

## Verdict

PASS — 차단 이슈 없음.

## Scope Reviewed

- 사용자 피드백에 따른 선행 비트와의 근본적 차별화.
- `파급효과` 레퍼런스의 추상화 수준과 저작권·정체성 경계.
- WAV, MIDI, GrooveForge project, 가사, session guide, research/redesign brief, delta report, SoundCloud metadata, manifest.
- 독립 산출물 감사, macOS decoder 확인, repository QA와 quality gate.

## Findings

### User feedback and musical redesign

- 92→136 BPM, F minor→D minor, 10% swing→straight feel, boom-bap→experimental/industrial로 기본 좌표를 모두 바꿨다.
- 선행의 표준 4/12 backbeat 대신 pattern A의 6/14, switch pattern C의 3/11 clap, 3+3+2 accents, moving bass와 bar-37 beat switch를 사용한다.
- 편곡은 intro 뒤 verse가 아니라 hook을 먼저 공개하고, 12-bar verse와 drumless bridge를 포함해 section 순서·길이·밀도를 다시 설계했다.
- 선행 대비 pattern과 arrangement signature, WAV SHA-256가 모두 달랐다. Drum grid는 70/192 cells(36.5%)가 바뀌었고 통합 이벤트 Jaccard overlap은 14.7%였다.

### Reference and originality boundary

- 레퍼런스의 raw/layered electronic production, producer-led transformation, contrasting crew roles만 고수준 원리로 사용했다.
- `파급효과` 수록곡 또는 멤버 곡의 sample, melody transcription, lyric phrase, arrangement copy, artist audio, voice clone을 사용하지 않았다.
- 전체 가사는 신규 작성했고 실존 멤버 이름과 reference album title이 lyric body에 없음을 자동 확인했다.
- 2013 core targeting과 2014 compilation reference의 시간 차이를 brief에서 명시해 역사적 오인을 피했다.

### Artifact and audio quality

- WAV: RIFF/WAVE PCM format 1, stereo, 44,100 Hz, signed integer 24-bit, 113.691초.
- Quantized PCM: peak -1.428 dBFS, RMS -17.509 dBFS, full-scale 0, terminal zero, active low-byte 99.612%, post-boundary non-zero tail 66,148 samples.
- Arrangement section RMS가 Intro -40.89, Hook 약 -15.6, Verse A -17.73, switch -20.02, drumless bridge -27.54 dBFS로 서로 다른 밀도를 보였다.
- MIDI: format 1, 5 tracks, 480 PPQ, 136 BPM, 3,184 note-ons, 64-bar end tick. Reopened project에서 byte-identical MIDI를 재생성했다.
- 11개 파일이 존재하고 manifest의 10개 SHA-256 row가 모두 일치했다.

### Metadata, privacy, and representation

- SoundCloud 문서에 title, artist attribution guidance, BPM, key, meter, main/detailed genre, mood, language, license, availability, explicit flag, tags, description, caption, artwork brief가 있다.
- 업로더 본인 artist name을 쓰고 Just Music 또는 멤버를 primary/featured artist로 표기하지 않도록 명시했다.
- Sample, account, analytics, cloud service, private value, personal data를 사용·기록하지 않았다.

## QA Evidence

- Independent package audit: PASS.
- macOS `afinfo`: 2 ch, 44,100 Hz, lpcm 24-bit little-endian signed integer, source bit depth I24.
- `python3 harness/scripts/run_qa.py`: PASS.
- `python3 harness/scripts/run_quality_gate.py`: PASS.
- Source/destination recursive diff: no differences.
- Downloads manifest verification: all 10 hashed artifacts OK.

## Residual Recommendations

- 실제 보컬 음역과 자음 밀도에 맞춰 synth guide를 verse에서 낮추거나 mute한다.
- 발매 전 휴대폰, 이어폰, mono speaker, club PA에서 별도 human listening pass를 수행한다.
- 웹 exact-title 검색은 법적 유일성을 보증하지 않으므로 정식 유통 전 distributor catalog와 trademark를 다시 확인한다.

## Delivery

- New package: `/Users/taejungkim/Downloads/PRESSURE_GRAMMAR_2013_JM_Remake_2026-07-23`.
- Previous package preserved: `/Users/taejungkim/Downloads/BASEMENT_NOON_2013_JM_Pitch_2026-07-23`.
