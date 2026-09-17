# plan-1537-harness-risk-installed-hiphop Review

## Summary

에이전트의 파일 소유권·인수인계·독립 리뷰 조건을 정리하고, 변경 경로에서 실제 검사 명령과 담당자를 찾는 도구를 추가했다. 완료 문서의 오래된 초보자 경로 판정을 현재 개요 진입 경로로 수정하여 긴 GUI 검사 전에 문서 불일치를 검출한다.

Electron IPC의 소유 창·최상위 frame·진입 URL을 검증하고 탐색·외부 링크 경계를 제한했다. 프로젝트 파일은 동일한 열린 handle에서 종류·크기와 실제 읽기 상한을 검사한다. ZIP 생성은 전체 크기의 중간 버퍼 두 개를 제거하면서 기존 byte·해시를 유지한다.

실제 설치본 QA에서 발견한 정지 지연은 숨긴 Composer Actions의 화면 갱신 중 전곡 PCM 재계산 때문이었다. 준비된 정확 분석값을 재사용하여 실패한 두 곡의 전체곡 정지 응답을 5,971→420ms, 5,951→423ms로 줄였다. 전체 6곡의 전체곡 정지는 419~426ms였고 기존 5초 기준을 유지했다.

## QA

- 최초 `release:check`의 1~78번은 통과했으며 79번의 완료 문서 판정 오류로 exit 1이었다. 수정 후 영향받은 7개와 원래 잔여 80~94번 15개가 모두 exit 0이었다. 초기 94개 항목의 통과 근거를 확보했으나 단일 전체 명령 exit 0은 주장하지 않는다.
- 이후 가청 관측·Composer Actions 회귀가 추가되어 verify 카탈로그는 96개다. 첫 독립 리뷰의 최종 전체 게이트 누락 지적 후 기존 증거 4,051개를 별도 보존하고 원본 `npm run release:check`를 새로 실행했다. 2026-09-18 00:11:04 KST에 단일 명령 exit 0으로 완료했다. 전체 경과는 4,760.285초이며, 최종 소스·설치 앱의 식별자는 앞선 22개 사례와 207개 GUI 실행 이후에도 같았다.
- 최종 `/Applications/GrooveForge.app`의 52개 빌드 파일 전체 경로·크기·SHA-256, 실행 파일·source provenance와 ad-hoc deep strict 서명을 확인했다. 기존 설치본과 사용자 복구 초안을 보존했다.
- 최종 실제 설치본 신규 6곡과 16장르 검사는 각각 6/6, 16/16, exit 0이었다. 22개 원본 보고서의 편곡 진행·가청 표본·WAV 미리듣기·저장·재열기·재렌더와 현재 설치본 식별자를 대조했다.
- 최종 설치본 전체 GUI는 원본 207개 조건·시간 상한을 유지한 일회성 wrapper에서 exit 0이었다. 새 격리 프로필, 화면 PNG 10개, 설치 runtime·전체 앱·소스 해시와 종료 후 임시 inspector 포트 종료를 확인했다. 읽기 관측기를 추가한 기능 회귀이며, 관측기 없는 6곡의 입력 시간 측정과 구분한다.
- 독립 NumPy 전곡 PCM 감사에서 full-scale·click risk 0, 양채널 신호, digital-zero 종료를 확인했다. 이전 6곡과 최종 6곡의 WAV 해시는 모두 같으며 PCM24 stereo 44.1 kHz 형식을 유지했다.
- 완료 문서 이동 후 `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `git diff --check`, `npm run release:completion-summary-refresh-smoke`를 모두 exit 0으로 완료하여 문서·계획·완료 근거의 정합성을 확인했다. 실행 결과는 ignored `plan-1537-completion-doc-qa-receipt.json`에 기록했다.

최종 집계는 ignored `build/desktop/plan-1537-completion-evidence/plan-1537-completion-qa-receipt.json`에 보존한다. 초기 5개 포장 경로의 GUI·native IO 증거, 후속 실제 설치본 검사, 수정 전 실패·진단 결과를 구분한다.

## Findings

최초 16장르의 4개 실패는 가청 신호를 단일 시점에서 읽는 판정의 한계를 드러냈다. 기존 관측 길이를 유지하면서 100ms 간격 표본과 WAV 미디어 시작 이벤트를 기록하도록 바꿨다. 전체 무음·미시작·창 종료·진행 없음의 실패 조건은 유지했다. 이후 6곡에서 발견한 실제 정지 지연은 별도 성능 결함으로 수정했다.

전체 설치본 GUI의 첫 시도는 본 검사 전에 일회성 격리 관측기가 존재하지 않는 web preference 속성을 기대해 실패했다. 실제 Session API로 관측기를 수정했으며 앱 소스·합성·음원 데이터를 바꾸지 않았다. 초기 실패와 재검증 기록을 모두 보존한다.

최종 전체 게이트 이후 구현에 참여하지 않은 두 reviewer가 코드·하네스와 QA·전달·provenance를 각각 재검토하여 완료를 승인했다. 원래 전체 게이트 누락 지적과 전체곡/WAV 정지 시간의 범위 표기를 해결했으며, 남은 구체적 P0–P3 지적은 없다. 원본 및 후속 리뷰와 각 해시 확인 근거를 ignored `plan-1537-support-evidence/`에 보존한다.

## Delivery

`Downloads/GrooveForge_트랩_6곡_SoundCloud_2026-09-17_2210`에 66개 파일을 전달했다. `00-들어보기.html`의 로컬 청취 페이지, `00-SoundCloud-WAV/`의 제목 포함 WAV 6개, 업로드 문구, 편집 가능한 프로젝트·제작 브리프·QA·화면 증거를 포함한다. 원본과 전달본의 전체 inventory와 SHA-256을 확인했다.

| 방향 | 곡 | 길이 |
|---|---|---:|
| 크루 에너지 트랩 | 철야 집결 | 103.607초 |
| 크루 에너지 트랩 | 지하층의 함성 | 105.955초 |
| 크루 에너지 트랩 | 불꽃 차선 | 100.490초 |
| 저역 중심 트랩 | 낮은 구름 아래 | 120.938초 |
| 저역 중심 트랩 | 뒷좌석의 오후 | 120.865초 |
| 저역 중심 트랩 | 새벽 순항 | 116.638초 |

요청한 두 스타일을 참고한 내장 합성·편집 가능한 이벤트 기반의 오리지널 instrumental이며, 기존 녹음·보컬·가사를 사용하지 않았다. SoundCloud 로그인·업로드·공개는 수행하지 않았다. 업로드 문구의 아티스트·크레딧 등 사용자별 항목은 남겨 두었다.

## Limits

자동 신호·PCM·peak/RMS 검사와 앱 재생 확인은 사람의 전곡 청음, LUFS/true-peak 측정 또는 전문 마스터링을 뜻하지 않는다. 외부 배포용 Developer ID·공증 상태와 로컬 설치·QA는 구분한다.

온라인 npm 취약점 조회는 의존성 metadata의 외부 전송을 자동 승인 검토가 차단하여 수행하지 못했다. 원본 저장소의 `npm ls --all` 문제 0건은 외부 advisory 검사 결과가 아니다. CSP 부재, 대형 App/main 파일, 문자열 계약과 전체 GUI 반복 비용은 [평가 및 후속 설계](../quality/plan-1537-assessment.md)에 기록했다.

## Integration

[완료 계획](../exec_plans/completed/plan-1537-harness-risk-installed-hiphop.md)에 구현·QA·독립 리뷰를 완료 기록했다. 문서 QA 이후 전용 `codex/plan-1537-harness-risk-installed-hiphop` branch의 변경을 main에 통합·push하고, ignored 증거를 main의 `build/desktop/plan-1537-completion-evidence/`로 보존한 뒤 해당 worktree와 branch만 정리한다. 실제 commit·remote·설치본 동일성·정리 결과는 같은 폴더의 `integration-receipt.json` 및 최종 사용자 보고에 남긴다. 원본 증거에 기록된 이전 절대경로는 `relocation-map.json`으로 현재 보관 위치에 연결한다.

## 통합 후 빌드 범위 확인

main 통합 후 새 `npm run build`는 exit 0이었다. 같은 소스라도 기존 worktree의 공유 `node_modules`와 main의 경로 차이로 vendor source map 2개의 `sources` 상대 경로가 달랐다. 나머지 차이는 HTML의 modulepreload 순서와 entry JS의 preload 목록 순서이며, 모든 preload 호출이 가리키는 모듈 집합과 그 밖의 48개 파일은 같았다. 52개 파일의 byte 동일성 검사는 이 4개 차이를 올바르게 거부했다. 새 main 빌드가 앞선 실제 설치본 QA의 대상이었다고 주장하지 않는다.

검증 당시의 `dist`·`dist-electron`은 ignored `build/desktop/plan-1537-completion-evidence/final-tested-source-build/`에 별도 보존하여 설치본 52개 파일과 다시 대조한다. 최종 소스 71개와 설치 실행 파일의 식별자도 유지한다. 설치본을 새 빌드로 바꾸거나 동일성 검사 조건을 완화하지 않았다. 구체적인 차이와 통합 확인은 `main-build-diff-explained.json` 및 `integration-receipt.json`에 기록한다.
