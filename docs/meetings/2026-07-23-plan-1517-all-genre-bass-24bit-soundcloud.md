# 2026-07-23 plan-1517 All-Genre Bass, 24-bit WAV, SoundCloud Handoff

## Context

사용자는 프로젝트 개선점과 추가 기능을 팀 회의로 찾고 구현·테스트하며, 결과 WAV를 24-bit로 만들고 SoundCloud 업로드 작성 내용을 Downloads에 정리해 달라고 요청했다. 이어 GrooveForge가 808 베이스 비트만 만들 수 있는지 확인하고 그렇다면 수정해 달라고 요청했다.

참석 역할: 박자(project_lead), 구성(plan_keeper), 지도(repo_cartographer), 제작(harness_builder), 검증(quality_runner), 심사(review_judge), 수호(privacy_guard), 정리(doc_gardener).

## Evidence Reviewed

- 앱은 14개 style, editable Drums/Bass/Synth/Chord events, Pattern A/B/C, arrangement, mixer/master, WAV/stem/MIDI/bundle을 지원한다.
- `StyleProfile.bassStyle`은 `808`, `sub`, `walking`, `pluck`, `reese`, `minimal`을 선언하지만 `src/audio`는 이를 소비하지 않고 `bassDrive` 임계값만으로 저역 oscillator를 정한다.
- `BassNote.glide`는 편집·표시되지만 offline render와 realtime scheduler에서 소비되지 않는다.
- public UI, mixer, stem, MIDI 표기에 `808`이 광범위하게 고정되어 all-genre 제품을 808 전용처럼 보이게 한다.
- native WAV encoder는 Float32 buffer를 16-bit `setInt16`으로 양자화하므로 앱 mix/stems/bundle은 16-bit다. 최근 24-bit 사용자 전달물은 별도 일회성 과정이었다.
- 앱 Delivery Bundle에는 SoundCloud upload sheet가 없다.
- SoundCloud 공식 도움말은 lossless stereo WAV를 지원하고 16-bit/44.1kHz 또는 그 이상의 source와 약 -0.5~-1dBFS headroom을 안내한다. downloads를 켜면 original upload file이 전달된다.

## Decisions

- 앱은 구조적으로 808-only가 아니지만 구현과 표현이 808 중심이므로 수정이 필요하다.
- 저장 호환 토큰 `bass_808`는 유지한다. 새 project version이나 파괴적 migration 없이 style Bass Voice를 실제 audio에 연결한다.
- 공통 Bass Voice profile로 offline/realtime oscillator, duration, filter, drive, gain을 맞추고 연결 glide도 실제 pitch ramp로 구현한다.
- 주요 사용자 표기는 `Bass`, `Bassline`, `Bass Glide`, 현재 style voice 중심으로 바꾼다.
- native WAV output 전체를 canonical 44.1kHz stereo signed PCM 24-bit로 통일하고 실제 lower-byte signal을 QA한다.
- project/mix/stems/MIDI/Handoff/manifest와 함께 copy-ready SoundCloud Upload Sheet를 Delivery Bundle에 포함한다.
- SoundCloud 실제 업로드, 계정 token, 공개·수익화·배급 변경은 하지 않는다. sheet는 uploader-owned placeholder, Private, All Rights Reserved, Downloads Off, transcoded playback 승인 순서를 기본으로 한다.
- 대표 sample-free beat 패키지를 고유 Downloads 폴더에 전달하고 복사 후 hash와 WAV format을 재확인한다.

## Open Questions

- Bass Voice를 style에서 독립적으로 고르는 project-level selector는 유용하지만 schema·migration·UI 범위가 커진다. 이번에는 기존 style profile을 실제화하고 selector는 후속 후보로 남긴다.
- MIDI pitch bend로 glide를 내보내는 기능은 target synth bend range와 channel allocation 결정이 필요해 이번 audio parity 범위에서는 후속 후보로 남긴다.
- 장곡에서 mix+four stems 반복 렌더 비용을 줄이는 render-set cache/lazy analysis는 24-bit로 파일 크기가 늘어난 뒤 별도 성능 계획에서 다룬다.

## Follow-Ups

- plan-1517 구현과 QA를 완료한다.
- QA 뒤 별도 review mirror를 만든다.
- 후속 후보: project-level Bass Voice selector, MIDI pitch-bend export, render-set cache, 거대 App/QA 모듈 분리.
