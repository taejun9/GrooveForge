# plan-1516-collective-hardtrap-research-beat review

## Review Result

PASS — blocking finding 없음.

## Scope

- 공개 발매·수상 자료에서 고수준 집단 트랙 맥락만 조사해 만든 독창적인 sample-free hardcore-trap/cypher instrumental `IRON CHORUS (Original Mix)`
- stereo 44.1kHz signed PCM 24-bit WAV
- editable GrooveForge project와 format-1 MIDI
- 조사 브리프, 제작 노트, SoundCloud 업로드 정보, QA report와 SHA-256 manifest

## QA Evidence

- 독립 PCM parser: RIFF/WAVE format 1, stereo, 44.1kHz, 24-bit, 6-byte block align, 4,672,637 frames, 105.955초
- WAV peak / RMS: -1.080 / -16.798dBFS
- first/second/final hook RMS: -14.886 / -14.816 / -14.781dBFS; three verses: -16.590 / -17.081 / -16.228dBFS; bridge: -39.026dBFS
- float render limiting: 99 samples / 0.001059%; encoded full-scale samples 0
- terminal frame digital zero, musical boundary 뒤 tail nonzero samples 66,148
- DC offset 0.00000234 이하, stereo correlation 0.999861, stereo-different frames 4,672,442
- 24-bit lower-byte activity 99.612%
- WAV SHA-256: `4d543dd944c7a0afccea5f5cd82ffed7b74e0e42ce6e420710c3dcb1a0e4546f`
- `file`과 `afinfo`: Microsoft PCM / 24-bit little-endian signed integer / stereo / 44.1kHz / 105.955초
- MIDI: format 1, five tracks, 480 PPQ, 146.000 BPM, 2,188 note-ons, 122,880 ticks / 105.206초 musical duration
- 프로젝트: GrooveForge file version 1, 146 BPM, G minor, trap, swing 4%, three patterns, 64 bars
- manifest의 모든 전달 파일 SHA-256 일치
- `python3 harness/scripts/run_qa.py`: PASS
- `python3 harness/scripts/run_quality_gate.py`: PASS

## Research and Originality Review

- 조사 브리프는 HiphopKR의 첫 컴필레이션·10트랙·다수 래퍼/프로듀서 발매 기록과 한국 힙합 어워즈 2019 공식 수상 결과를 링크하고 공개 관찰과 창작 추론을 분리한다.
- compilation breadth는 각기 다른 kick/hat/808 pocket을 가진 세 editable pattern으로 번역했다.
- collective statement는 직접 작곡한 G–Ab의 metallic minor-second call과 D/Eb answer가 돌아오는 8/8/4-bar hook으로 구현했다.
- rapper rotation은 특정 래퍼의 cadence를 흉내 내지 않고 12/12/8-bar의 세 vocal handoff zone, verse synth mute와 마지막 verse chord mute로 추상화했다.
- performance contrast는 drum/bass-free intro와 bridge 뒤 full hook/verse return으로 구현했다.
- reference audio 다운로드, stem 분리, sampling, tempo/key 측정, 멜로디·가사·플로우·드럼·화성 전사를 수행하지 않았다.
- 목소리, cadence, flow, ad-lib, likeness, 가사, 약물·폭력·과시·개인사·label narrative를 모사·차용하지 않았고 upload title, description, tags에 referenced label/member name이나 `type beat` 문구가 없다.

## Music and Handoff Review

- 첫 훅은 Verse 1보다 약 1.70dB 높아 4-bar intro 뒤 곡의 metallic identity가 분명하다.
- 두 번째 훅은 bridge보다 약 24.21dB 높아 완전히 비운 저밀도 구간 뒤 공연용 복귀가 강하다.
- Verse 1은 five-kick asymmetry와 late hat rolls, Verse 2는 longer 808와 four-kick switch, Verse 3는 synth/chord를 모두 뺀 가장 건조한 pocket으로 구분된다.
- final hook은 Verse 3보다 약 1.45dB 높고 metallic lead와 chord width가 다시 열려 짧고 직접적인 ending을 만든다.
- project, MIDI, WAV의 title/BPM/key/bars가 일치하고 세 pattern, mixer, arrangement가 다시 열려 후속 편집이 가능하다.

## Artifact and Metadata Review

- float mix에서 직접 24-bit로 양자화했고 lower byte의 99.612%에 실제 신호가 있어 16-bit zero-padding이 아니다.
- peak는 encoded target에 맞고 full-scale sample이 없으며 마지막 frame은 digital zero다.
- SoundCloud 문서에는 title, artist placeholder, URL slug, main/detailed genre, BPM, key, mood, English tags, description, caption, artwork brief, license, visibility, downloads, monetization/distribution, release metadata와 upload checklist가 있다.
- SoundCloud 공식 안내에 맞춰 lossless stereo WAV, transcoding headroom, main genre/first tag, multi-word tag와 artwork 규격 주의를 반영했다.

## Rights and Privacy Review

- 제3자 sample, 상업 녹음, reference audio, 보컬, voice clone을 사용하지 않았다.
- 기존 작품의 가사·약물·폭력·과시·개인 서사를 사용하지 않았다.
- Artist와 rightsholder는 사용자의 실제 이름으로 교체하도록 placeholder로 두었다.
- 초기값은 Private / All Rights Reserved / Downloads Off / monetization·distribution·Content ID Off다.
- 실제 SoundCloud 업로드, 공개 전환, 수익화와 배급은 이번 범위에 포함하지 않았다.

## Residual Risks

- 기술·구조 검사는 통과했지만 인간의 음악적 취향 판단이나 실제 클럽 PA, 차량, 이어폰, mono sub 환경의 청취를 대체하지 않는다.
- stereo correlation이 높아 low-end와 중심 타격은 mono-compatible하고 width는 절제되어 있다; 보컬 배치 후 hook 상단만 추가로 넓히는 편이 안전하다.
- G–Ab 단2도 hook은 의도적으로 긴장도가 높으므로 래퍼의 topline이 복잡할 때는 project에서 melody velocity를 낮추거나 일부 note를 mute할 수 있다.
- 실제 여러 보컬을 추가하면 각 벌스의 레벨, hook lead density, kick/808 충돌과 master loudness를 다시 조정해야 한다.
- artwork, 공동작업자, 외부 sample을 나중에 추가하면 권리와 metadata 검토를 다시 해야 한다.

## Recommendation

사용자에게 24-bit WAV, editable project/MIDI, research brief와 upload sheet를 전달한다. 먼저 Private으로 업로드해 transcoded playback을 확인하고, 실제 재생 시스템에서 세 verse pocket과 hook/bridge 대비를 승인한 뒤 Public, downloads, monetization 또는 distribution 설정을 결정한다.
