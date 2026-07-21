# plan-1498-release-stabilization

## Status

completed

## Owner

project_lead / plan_keeper

## User Request

GrooveForge를 버그 없이 사용할 수 있는 상태로 완성하고, 다운로드 폴더에 샘플 음원을 만들면서 테스트한다.

## Goal

현재 저장소의 전체 로컬 품질 게이트와 실제 샘플 오디오 산출 흐름을 검증하고, 재현되는 제품·하네스 결함을 수정한 뒤 QA와 리뷰 증거를 남긴다.

## Non-Goals

- 외부 배포 자격증명, Apple 공증, 업데이트 피드 같은 사용자 제공 비공개 입력을 임의로 만들지 않는다.
- 새 원격 서비스, 분석, 계정, 결제 또는 샘플링 중심 기능을 추가하지 않는다.
- 테스트에서 발견되지 않은 대규모 기능 확장을 수행하지 않는다.

## Context Map

- 제품 원칙: `docs/product/product.md`
- 품질 규칙: `docs/quality/rules.md`
- 런타임/오디오 QA: `harness/scripts/run_runtime_smoke.mjs`, `harness/scripts/run_sample_audio_qa.mjs`
- 앱 진입점: `src/ui/App.tsx`, `src/domain/workstation.ts`, `src/audio/`
- 데스크톱 경계: `electron/`, `src/platform/downloads.ts`

## Constraints

- QA and review are separate loops.
- Update this plan when scope or approach changes.
- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-1498-release-stabilization` and `.worktree/plan-1498-release-stabilization` for git repository work.
- 생성 음원은 제품 데이터가 아니며 커밋하지 않는다.
- 실제 사용자 음원이나 저작권 샘플을 사용하지 않는다.

## Implementation Plan

- [x] 기준선 QA를 실행하고 실패를 재현한다.
- [x] 실패 원인을 최소 범위로 수정하고 회귀 검증을 추가한다. 재현 실패가 없어 코드 수정은 불필요했다.
- [x] 다운로드 폴더에 합성 샘플 음원을 생성해 실제 파일·디코드·재현성 검증을 수행한다.
- [x] 전체 로컬 품질 게이트를 다시 통과시킨다.
- [x] QA 완료 후 별도 리뷰를 수행하고 계획/리뷰 문서를 마감한다.

## QA Plan

- `npm run qa`
- `npm run verify`
- `npm run sample-audio:qa`의 다운로드 폴더 대상 실행 또는 동등한 명시적 산출물 복사/검증
- 생성 WAV의 파일 형식, 청취 가능 길이, peak/RMS, terminal zero, 해시 재현성 확인
- 변경 범위에 따른 표적 회귀 테스트

## Review Plan

QA completes before review starts. QA 결과와 변경 diff를 분리해 검토하고, 발견 사항·잔여 위험·후속 조치를 `docs/reviews/plan-1498-release-stabilization-review.md`에 기록한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-07-21 | 전체 기준선 QA부터 시작한다. | 광범위한 “버그 없이” 요청을 실제 재현 실패에 근거해 제한하기 위해서다. |
| 2026-07-21 | 테스트 음원은 내장 이벤트에서 합성한다. | 저작권·개인정보 위험 없이 실제 오디오 경로를 검증할 수 있다. |
| 2026-07-21 | 제품 코드는 변경하지 않는다. | `npm run qa`, 전체 `npm run verify`, 후속 `npm run sample-audio:qa`가 모두 통과해 재현 가능한 결함이 없었다. |
| 2026-07-21 | 외부 배포 준비는 잔여 운영 범위로 남긴다. | Developer ID, 공증, 배포 URL, 수동 채널 승인은 사용자가 제공해야 하는 비공개 입력이며 로컬 사용성 검증과 분리된다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-07-21 | project_lead | Plan created. |
| 2026-07-21 | quality_runner | `npm run qa` and the complete `npm run verify` chain passed with exit code 0. |
| 2026-07-21 | quality_runner | Follow-up sample-audio QA passed: 41/41 playable WAVs, 33/33 full mixes with tail content, and 41/41 terminal digital zero. |
| 2026-07-21 | harness_builder | Two representative PCM WAVs and the QA report were copied to `~/Downloads/GrooveForge-QA-2026-07-21`; SHA-256 and file format checks passed. |
| 2026-07-21 | review_judge | Post-QA review found no actionable product or harness defect and no repository code change was required. |

## Completion Notes

- Local product QA, renderer/runtime workflows, audio rendering, project IO, close guards, packaging, extracted/installed app launch, and release-evidence smoke tests all passed.
- Representative download samples:
  - `GrooveForge-초보-LoFi-테스트.wav`: 23.37 seconds, peak -4.44 dB, RMS -21.86 dB, SHA-256 `2dcbd6ad1f68150a9533df87910d2280914d57fd7749a57423c07a4a76ab4318`.
  - `GrooveForge-프로-House-테스트.wav`: 51.07 seconds, peak -3.32 dB, RMS -20.10 dB, SHA-256 `37a2540449e97cdb93434e8873ea5e570ec4c85cd4ce483662a629029e82e9d4`.
- Both downloaded files are RIFF/WAVE Microsoft PCM, 16-bit stereo, 44.1 kHz.
- No real user audio, copyrighted sample pack, private credential, network release action, or remote AI call was used.
- External distribution remains intentionally unclaimed until the operator supplies Developer ID/notary credentials, release-channel metadata, and manual approval.
