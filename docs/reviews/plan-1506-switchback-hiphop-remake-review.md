# plan-1506-switchback-hiphop-remake review

## Review Result

PASS — blocking findings 없음.

## Scope

- 기존 `스위치백 (Switchback)` 콘셉트의 힙합 비트 리메이크
- 24-bit WAV, format-1 MIDI, 재열기 가능한 GrooveForge 프로젝트
- 제작 노트, SoundCloud 메타데이터, 생성·독립 QA, manifest
- 원본과의 실질적 차이, sample/voice 경계, 전달 완전성

## QA Evidence Reviewed

- 원본 기록: 146 BPM, D minor, 64 bars, Breakbeat Electro / Rapid Pop-Rap / Cinematic Switch-up
- 리메이크 프로젝트: 88 BPM, D minor, 18% swing, boom_bap style, 64 bars
- 출력 WAV: RIFF/WAVE signed PCM, stereo 44.1kHz, 24-bit, 6-byte block align
- 출력 길이: 175.568186초 / 7,742,557 frames
- peak / RMS: -3.386 / -19.743dBFS
- full-scale samples: 0, renderer limited samples: 0, final stereo frame: `[0, 0]`
- 24-bit lower-byte activity: 15,424,719 samples (99.610%)
- 출력 WAV SHA-256: `320bb6afd27e21acb2e8e8239c89a1d6cefd05710aa4e3745f46188c0c60797d`
- MIDI: format 1, five tracks, 480 PPQ, 2,140 note-ons, 88.000023 BPM; project reopen 뒤 byte-identical regeneration
- 독립 section audit: intro -47.638dBFS, hooks 약 -18.36dBFS, bridge -22.126dBFS, outro -26.753dBFS
- `file`, `afinfo`, 독립 PCM/project/MIDI/manifest audit: PASS
- `python3 harness/scripts/run_qa.py`: PASS
- `python3 harness/scripts/run_quality_gate.py`: PASS

## Findings

### Hip-Hop Transformation

- tempo를 146에서 88 BPM으로 낮추고 clap을 약 17ms 뒤로 배치했으며, 18% swing과 hat micro-timing으로 head-nod pocket을 만들었다.
- 기존 breakbeat pulse 대신 verse A, hook B, sparse bridge C의 서로 다른 kick·snare·hat pattern을 새로 작성했다.
- bass는 짧고 빠른 pulse가 아니라 D2를 중심으로 긴 sustain, off-beat pickup, G1/A1 hook movement를 사용한다.
- Dm7–Bb, Gm7–A7, Dm7–Asus4의 반마디 화성과 랩 공간을 남긴 짧은 motif로 힙합 편곡의 중심을 세웠다.
- intro, verse, hook, bridge, reprise, final hook, outro의 mute·energy 변화가 실제 section RMS 차이로 나타난다.

### Switchback Identity

- D minor는 유지했다.
- A–F–D로 내려간 뒤 C–A로 되접히는 verse motif와 D–F–A–C–A–D hook motif가 방향을 꺾어 되돌아오는 제목 이미지를 보존한다.
- synth guide는 verse response 구간에서 mute되고 hook에서 전면으로 나와 rapid concept change라는 원래 아이디어를 저속 pocket 안에서 재해석한다.

### Artifact Integrity

- WAV는 기존 reference WAV를 타임스트레치·필터링한 결과가 아니라 새 project float mix에서 직접 24-bit로 인코딩했다.
- reference와 remake의 WAV SHA-256, frame count, duration이 다르다.
- GrooveForge project는 88 BPM, D minor, boom_bap, 64 bars로 재열기된다.
- MIDI regeneration hash가 전달 MIDI와 일치해 후속 DAW 편집 경로가 유지된다.
- manifest의 WAV, MIDI, project, notes, metadata, QA 파일 해시와 byte count가 모두 일치한다.

### Safety and Handoff

- third-party sample, 저작권 음원, 실제 멤버 음성, cloned voice를 사용하지 않았다.
- SoundCloud 문서는 Artist에 업로더의 실제 프로듀서명을 쓰고, Private / All Rights Reserved / Downloads Off를 초기값으로 권한다.
- 제목과 설명은 unofficial independent instrumental임을 명시하며 MINAMI/RESCENE/THE MUZE의 참여·의뢰·승인을 주장하지 않는다.

## Residual Risks

- 현재 synth는 가창 완성본이 아니라 제거 가능한 hook/topline guide다. 실제 랩·보컬 세션에서 prosody, 음역, 호흡, hook density를 다시 조정해야 한다.
- 자동 신호·구조 검사는 studio monitor, headphone, phone, car에서의 주관적 청취와 보컬을 올린 뒤의 mix 판단을 대체하지 않는다.
- 내부 fingerprint 차이와 sample-free 생성은 전 세계 catalog 비침해를 보증하지 않으므로 상업 발매 전 별도 similarity/legal clearance가 필요하다.
- 원본 편집 project가 Downloads에서 이동된 상태였으므로, 이번 버전은 남아 있는 검증 WAV와 계획·메타데이터의 콘셉트 기록을 기준으로 새로 작곡했으며 원본 event를 직접 재편집한 버전은 아니다.

## Recommendation

힙합 인스트루멘털 리메이크로 전달을 승인한다. 먼저 24-bit WAV를 들어 보고, GrooveForge project 또는 MIDI에서 verse synth density와 hook melody를 실제 랩·보컬에 맞춰 조정한다.
