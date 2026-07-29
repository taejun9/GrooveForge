# 2026-07-29 Hardware Workflow Gap Meeting

## Context

사용자는 GrooveForge를 실제 비트 제작 하드웨어와 비교해 빠진 기능을 찾고, 팀 회의로 우선순위를 정한 뒤 필요한 기능을 추가하거나 수정해 달라고 요청했다. 팀은 Akai MPC One+, Native Instruments Maschine+, Elektron Digitakt II, Roland TR-8S, Roland MC-707의 공식 자료와 현재 domain/UI/audio/export/QA 구현을 비교했다.

## Attendees

- 박자 / project lead: 범위와 최종 우선순위
- 구성 / plan keeper: 계획·결정 기록
- 지도 / repo cartographer: 구현 근거와 문서 과장 점검
- 제작 / harness builder: 구현·테스트 가능성
- 검증 / quality runner: 회귀와 산출물 경로
- 심사 / review judge: 제품 워크플로 평가
- 수호 / privacy guard: MIDI 권한·로깅 경계
- 정리 / doc gardener: 로드맵·공식 소스 정리

## Benchmark Findings

| 영역 | 하드웨어 기준 | GrooveForge 현재 | 판정 |
|---|---|---|---|
| 직접 비트 구성 | 스텝 시퀀싱, 드럼·베이스·멜로디, 패턴 | 드럼·808/Bass·Synth·Chord 이벤트와 Pattern A/B/C | 강점 |
| 그루브 | velocity, swing, probability, microtiming, retrig/variation | velocity, swing, chance, microtiming, hat repeat, variation/fill | 대체로 충족 |
| 실시간 연주 캡처 | transport 동기 record/overdub | 입력은 next-empty/replace-selected만 존재 | 최우선 갭 |
| 패턴 길이 | 다중 bar, 유연한 cycle/scale | 한 Pattern은 고정 16-step/4/4 | 주요 갭 |
| 트랙·악기 | 유연한 트랙, pad/kit, device chain | 고정 Drums/808/Synth/Chord 역할과 4개 drum lane | 주요 갭 |
| 표현·자동화 | step parameter lock, motion, macro, LFO | event velocity/chance/timing과 master-volume fade 중심 | 주요 갭 |
| 퍼포먼스 | scene/pattern queue, fill/conditional trigger | arrangement와 Pattern/Fill 편집은 있으나 live queue 없음 | 후속 갭 |
| 연결 | MIDI clock/sync, controller mapping | 명시적 local Web MIDI Note On 입력만 지원 | 후속 갭 |
| 완성·전달 | standalone playback/resampling/export | local realtime playback, WAV/stem/MIDI/Handoff export | 데스크톱 제품 강점 |

현재 제품 설명의 `16/32-step`, durable pitch envelope, peak/LUFS meter, 완성된 generic Track/Clip/Device schema, persisted `fx_return` 표현은 실제 구현보다 앞서 있었다. 문서에서는 현재 구현과 목표 아키텍처를 구분하기로 했다.

## Decisions

- 첫 구현은 **Pattern Live Overdub**으로 정한다. Desktop Keyboard 또는 명시적으로 연결·arm한 Web MIDI Note On을 재생 중인 선택 Pattern의 현재 16분음표 playhead에 quantize한다.
- 기존 `Next empty`와 `Replace selected`는 그대로 유지하고, `Overdub / live playhead`를 세 번째 직접 모드와 Quick Action으로 제공한다.
- Live Overdub을 고르면 정지 상태에서는 선택 Pattern loop를 준비한다. Song, Block, Turn 또는 다른 Pattern 재생 중에는 모호한 위치에 쓰지 않고 명시적으로 거부한다.
- 입력 결과는 `Overdubbed`, Pattern, step, pitch, length, velocity를 표시한다. 실제 이벤트는 기존 undoable Pattern update, save/load, local recovery, realtime playback, WAV/stem/MIDI export 경로를 그대로 사용한다.
- 1/16 quantization strength와 count-in은 이번 범위에 추가하지 않는다. 현재 scheduler snapshot에 안전하게 대응되는 최소 단위만 지원하고 더 세밀한 timing은 후속 transport-recording 계획에서 다룬다.
- Web MIDI 권한은 사용자 명시 동작에서만 요청하고 `sysex: false`를 유지한다. 장치명·raw MIDI 메시지·연주 기록을 로그나 원격 서비스로 보내지 않는다.
- 샘플 import/chop, audio recording, plugin hosting, cloud sync, accounts, analytics는 이번 비교의 우선 구현에서 제외한다. GrooveForge의 첫 제품 증명은 계속 sample-free direct composition이다.

## Prioritized Follow-Ups

1. Track/Device schema migration과 확장 가능한 Drum Rack lane 모델
2. multi-bar Pattern과 per-track cycle length
3. transport count-in, realtime erase, configurable quantize가 포함된 Live Capture 2단계
4. note/step parameter locks와 track automation
5. Pattern Queue/Scene launch, conditional trigger, retrig/Euclidean tools
6. MIDI clock sync와 명시적 controller mapping
7. insert/send FX routing과 performance macro/LFO

## Acceptance

- Overdub 모드는 선택 Pattern 재생에서만 placement를 반환한다.
- 16-step 밖의 live loop step은 안전하게 modulo quantize한다.
- 기존 Next/Replace 결과가 변하지 않는다.
- overdub 이벤트가 저장 후 다시 열리고 MIDI export에 남는다.
- 화면에서 Next/Replace/Overdub 세 모드가 직접 보이고 좁은 Compose panel에서도 겹치지 않는다.
- 구현·문서가 audio recording, sampling, remote recording 또는 외부 장치 연결 성공을 주장하지 않는다.
