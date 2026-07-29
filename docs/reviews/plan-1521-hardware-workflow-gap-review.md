# plan-1521-hardware-workflow-gap Review

## Summary

공식 하드웨어 비트 머신과 현재 GrooveForge를 비교해 가장 큰 즉시 체감 갭인 transport-synchronized note capture를 선택했다. 기존 Keyboard/Web MIDI의 Next-empty와 Replace-selected를 유지하면서 세 번째 `Live Overdub` 모드를 추가했고, 선택 Pattern playback의 현재 16분음표 playhead에 808/Bass 또는 Synth 이벤트를 기록한다.

기능 비교는 이후 로드맵도 정리했다. flexible Track/Device와 Drum Rack, multi-bar Pattern/cycle, Live Capture 2단계, parameter lock/track automation, Pattern Queue/Scene, MIDI sync, FX/macro를 후속 순서로 두었다. Sampling, audio recording, plugin hosting, cloud/account는 composition-first·local-first 코어 뒤의 선택 범위로 유지했다.

## QA

- Passed: `git diff --check`
- Passed: `npm run qa`
- Passed: `npm run typecheck`
- Passed: `npm run build`
- Passed: `npm run renderer:smoke`
- Passed: `npm run harness:smoke`
- Passed: `npm run workflow:smoke`
- Passed: `npm run quick-actions:bundle-smoke`
- Passed: `python3 harness/scripts/run_quality_gate.py`
- Visual check: Next/Replace/Overdub three-column containment, Pattern auto-selection, Overdub pressed state, and live playhead update in the local app
- Attempted, external-evidence blocked: `npm run release:completion-summary-refresh-smoke`; the fresh worktree lacked ignored source release evidence, so `release:proof-bundle` requested a separate `npm run release:check`. No network probe, signing, notarization, upload, or external completion claim occurred.

Renderer regression covers preserved Next/Replace behavior, arrangement/other-Pattern rejection, 16-step modulo placement, project roundtrip, audible deterministic WAV analysis, MIDI export, Quick Actions success/canceled metrics and recovery text, selected-Pattern readout parity, and stale playback-session/current-mode guards.

## Findings

- Fixed P1: delayed `PlaybackController.onStop` could clear a newer rapid Stop→Play session and orphan playback.
- Fixed P2: Overdub readout used a playhead step from a Pattern that the placement resolver would reject.
- Fixed P2: Live Overdub Quick Action omitted the playhead after-state and reported rejected commands as complete.
- Fixed P2: a cached Quick Action callback used stale rendered `isPlaying` instead of current active playback mode.
- Fixed P3: rejected Live Overdub used a project-replacement follow-up instead of Pattern-playback recovery guidance.
- Final independent review: no remaining P0-P3 findings.

## Privacy and Scope

Web MIDI permission remains explicit and requests `sysex: false`. Device identities and raw MIDI messages are not written to project data, test logs, analytics, or remote services. The change adds note-event overdub only; it does not add microphone/audio recording, sampling, MIDI output/clock, controller mapping, accounts, cloud sync, or remote AI.

## Residual Risk

- Physical Web MIDI device latency and extremely rapid transport interaction are not fully reproduced by the automated environment.
- Live Overdub currently quantizes to the fixed 16-step/4/4 Pattern grid. Count-in, realtime erase, configurable/unquantized timing, multi-bar Patterns, and per-track cycles remain explicit follow-ups.
- Generic Track/Clip/Device persistence remains a migration target; the current version-1 schema still uses fixed musical roles and Pattern A/B/C collections.
- Release completion-summary evidence remains stale outside this feature review until the separate full release gate regenerates ignored external source evidence.

## Follow-Ups

1. Versioned flexible Track/Device and expandable Drum Rack migration.
2. Multi-bar Patterns and per-track cycle length.
3. Live Capture 2 with count-in, realtime erase, and configurable quantization.
4. Step parameter locks, track automation, Pattern Queue/Scenes, then MIDI sync.
