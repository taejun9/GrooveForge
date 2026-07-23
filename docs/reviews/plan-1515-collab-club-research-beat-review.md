# plan-1515-collab-club-research-beat review

## Review Result

PASS — blocking finding 없음.

## Scope

- 공개 자료에서 고수준 음악 맥락만 조사해 만든 독창적인 sample-free melodic club-trap instrumental `NEON RELAY (Original Mix)`
- stereo 44.1kHz signed PCM 24-bit WAV
- editable GrooveForge project와 format-1 MIDI
- 조사 브리프, 제작 노트, SoundCloud 업로드 정보, QA report와 SHA-256 manifest

## QA Evidence

- 독립 PCM parser: RIFF/WAVE format 1, stereo, 44.1kHz, 24-bit, 6-byte block align, 5,164,712 frames, 117.114초
- WAV peak / RMS: -1.080 / -17.788dBFS
- first/second/final hook RMS: -15.842 / -15.687 / -15.634dBFS; three verses: -17.343 / -18.852 / -17.001dBFS; bridge: -40.609dBFS
- float render limiting: 12 samples / 0.000116%; encoded full-scale samples 0
- terminal frame digital zero, musical boundary 뒤 tail nonzero samples 66,150
- DC offset 0.00000189 이하, stereo correlation 0.999657, stereo-different frames 5,164,544
- 24-bit lower-byte activity 99.608%
- WAV SHA-256: `4083d21246fd1984c6e4dfb3fb71496e4fe1b512dede02fc14b8d34347a43f8b`
- `file`과 `afinfo`: Microsoft PCM / 24-bit little-endian signed integer / stereo / 44.1kHz / 117.114초
- MIDI: format 1, five tracks, 480 PPQ, 132.000 BPM, 1,968 note-ons, 122,880 ticks / 116.364초
- 프로젝트: GrooveForge file version 1, 132 BPM, F# minor, trap, swing 3%, three patterns, 64 bars
- manifest의 모든 전달 파일 SHA-256 일치
- `python3 harness/scripts/run_qa.py`: PASS
- `python3 harness/scripts/run_quality_gate.py`: PASS

## Research and Originality Review

- 조사 브리프는 NME 인터뷰, Soompi의 KC 관련 발표, Spotify와 Genie의 `KC3` 공식 발매 정보를 링크하고 공개 관찰과 창작 추론을 분리한다.
- performance-first context는 early hook, crisp drum return, elastic 808과 four-bar final hook으로 번역했다.
- freestyle freedom은 12/12/8-bar의 세 vocal handoff zone, 벌스 synth mute와 마지막 벌스 chord mute로 구현했다.
- new-sound exploration은 직접 작곡한 glassy call-and-response lead, suspended bridge chords, Pattern C의 four-on-the-floor switch로 구현했다.
- rotating collaboration은 각 멤버의 cadence를 흉내 내지 않고 서로 다른 kick pocket을 가진 세 벌스로 추상화했다.
- reference audio 다운로드, stem 분리, sampling, tempo/key 측정, 멜로디·가사·플로우·드럼·화성 전사를 수행하지 않았다.
- 목소리, 랩·싱잉 스타일, ad-lib, likeness, 연애·성인·불법 약물·폭력·과시 소재, 개인사와 label narrative를 모사·차용하지 않았고 upload title, description, tags에 referenced team/member name이나 `type beat` 문구가 없다.

## Music and Handoff Review

- 첫 훅은 first verse보다 약 1.50dB 높아 짧은 intro 뒤 melodic identity가 분명하다.
- second hook은 bridge보다 약 24.92dB 높아 완전히 비운 저밀도 구간 뒤 공연용 복귀가 강하다.
- verse relay 1은 asymmetrical trap pocket, relay 2는 four-on-the-floor switch, relay 3은 synth/chord를 모두 뺀 hard pocket으로 구분된다.
- final hook은 third verse보다 약 1.37dB 높고 glassy lead와 chord width가 다시 열려 짧고 직접적인 ending을 만든다.
- project, MIDI, WAV의 title/BPM/key/bars가 일치하고 세 pattern, mixer, arrangement가 다시 열려 후속 편집이 가능하다.

## Artifact and Metadata Review

- float mix에서 직접 24-bit로 양자화했고 lower byte의 99.608%에 실제 신호가 있어 16-bit zero-padding이 아니다.
- peak는 encoded target에 맞고 full-scale sample이 없으며 마지막 frame은 digital zero다.
- SoundCloud 문서에는 title, artist placeholder, URL slug, main/detailed genre, BPM, key, mood, English tags, description, caption, artwork brief, license, visibility, downloads, monetization/distribution, release metadata와 upload checklist가 있다.
- SoundCloud 공식 안내에 맞춰 lossless WAV, stereo, transcoding headroom, main genre/first tag와 multi-word tag 유지 주의를 반영했다.

## Rights and Privacy Review

- 제3자 sample, 상업 녹음, reference audio, 보컬, voice clone을 사용하지 않았다.
- 기존 작품의 가사·연애·성인·불법 약물·폭력·과시 소재·개인 서사를 사용하지 않았다.
- Artist와 rightsholder는 사용자의 실제 이름으로 교체하도록 placeholder로 두었다.
- 초기값은 Private / All Rights Reserved / Downloads Off / monetization·distribution·Content ID Off다.
- 실제 SoundCloud 업로드, 공개 전환, 수익화와 배급은 이번 범위에 포함하지 않았다.

## Residual Risks

- 기술·구조 검사는 통과했지만 인간의 음악적 취향 판단이나 실제 클럽 PA, 차량, 이어폰, mono sub 환경의 청취를 대체하지 않는다.
- stereo correlation이 높아 wide synth는 subtle하고 mono compatibility에는 유리하다; 보컬 배치 후 hook 상단만 넓히는 편이 안전하다.
- relay 2의 four-on-the-floor kick과 elastic 808 체감은 실제 PA에 따라 달라질 수 있으므로 공개 전 저역 청취가 필요하다.
- 실제 세 보컬을 추가하면 각 벌스의 레벨, hook lead density, kick/808 충돌과 master loudness를 다시 조정해야 한다.
- artwork, 공동작업자, 외부 sample을 나중에 추가하면 권리와 metadata 검토를 다시 해야 한다.

## Recommendation

사용자에게 24-bit WAV, editable project/MIDI, research brief와 upload sheet를 전달한다. 먼저 Private으로 업로드해 transcoded playback을 확인하고, 실제 재생 시스템에서 세 verse pocket과 hook/bridge 대비를 승인한 뒤 Public, downloads, monetization 또는 distribution 설정을 결정한다.
