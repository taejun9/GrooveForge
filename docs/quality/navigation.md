# QA 탐색과 근거

작업 초반에는 이 문서와 [에이전트 인수인계](../agents/workflow.md)를 읽고, 상세 계약은 [품질 규칙](rules.md)에서 필요한 주제를 찾는다. `rules.md`와 [하네스 아키텍처](../architecture/harness.md)의 긴 계약 기록은 유지한다. 새 작업마다 과거 완료 계획 전체를 읽거나 이전 명령 목록을 복사할 필요는 없다.

## 변경에 맞는 시작점

저장소 루트에서 실행한다. 출력은 담당 역할·문서·관련 명령의 후보이며 테스트를 실행하거나 통과를 판정하지 않는다.

```sh
python3 harness/scripts/agent_navigation.py src/audio/render.ts src/domain/workstation.ts
python3 harness/scripts/agent_navigation.py --changed
python3 harness/scripts/agent_navigation.py --changed --base main
python3 harness/scripts/test_agent_navigation.py
node harness/scripts/run_desktop_completion_audit_smoke.mjs --check-docs
```

`--changed`는 기준 ref와 HEAD 사이의 커밋, 현재 수정·삭제·이름 변경, ignore 대상이 아닌 새 파일을 함께 찾는다. 다른 브랜치에서 시작했다면 `--base`로 실제 기준 ref를 지정한다. 잘못된 ref는 실패한다. 명령은 출력만 하며 외부 작업을 실행하지 않는다. 입력 경로가 없거나 분류되지 않아도 박자가 범위를 판단하고 최종 전체 게이트를 유지한다.

경로→역할·검사 매핑의 단일 실행 원본은 [agent_navigation.py](../../harness/scripts/agent_navigation.py)다. `npm run qa`와 strict gate는 이 매핑의 npm 명령, 역할, 문서가 실제 저장소에 존재하는지 검사한다. 새 기능이 여러 영역에 영향을 주면 각 영역의 검사를 합치고 실제 동작 재현을 더한다. 파일 위치만으로 완전한 의존성 분석을 주장하지 않는다.

normal/strict QA는 완료 감사의 `--check-docs` 모드도 먼저 실행한다. 이 모드는 전체 완료 감사와 동일한 함수로 제품·초보/숙련 사용자 경로·export 문서 요구를 검사하고, 누락·과거 경로의 부정 fixture 5개를 거부한다. 앱 실행이나 증거 파일 생성을 하지 않으며, 문서 문구 불일치가 장시간 GUI 검사 뒤에야 발견되는 일을 막는다.

| 변경 영역 | 먼저 찾을 계약 | 확인할 동작 |
|---|---|---|
| 하네스·에이전트·문서 | Planning, Documentation Hygiene, 역할 인수인계 | 경로·명령·역할 연결, 검사 자체의 실패 처리 |
| 도메인·오디오 | Project-import, Timeline-boundary, Sample-audio | 입력 복구·상한, 비변이, WAV 신호·꼬리·재현성 |
| UI·사용 흐름 | QA And Review, Product QA Gates | 실제 입력, 저장 시점, 취소·복구, 화면과 소리의 일치 |
| Electron·저장소 | SQLite project-library, Safety | IPC 입력, 원자적 쓰기, 복구 경쟁, 실제 프로젝트 재열기 |
| 곡·전달 패키지 | SoundCloud handoff, all-genres, requested-hiphop | 곡 수·길이·PCM, 정확한 manifest·해시, 재열기와 재렌더 |
| 빌드·배포 | [Release Gate](../release/readiness.md#release-gate) | 현재 소스와 번들 일치, 서명·설치·외부 배포의 실제 상태 |

## 최종 게이트와 추가 실행

최종 전체 로컬 게이트는 항상 `npm run release:check`다. 관련 검사 몇 개의 성공은 이 게이트를 대체하지 않는다. 실제 체인은 `package.json`의 `release:check`와 `verify`가 정하며, `rules.md`의 Current commands는 사용 가능한 전체 명령 카탈로그다. 카탈로그의 모든 명령을 무조건 차례대로 실행하라는 뜻은 아니다. 특히 실제 외부 배포 명령은 현재 작업의 권한·환경 조건을 확인한다.

전체 장르나 곡 전달 작업은 `npm run desktop:all-genres-qa` 및 해당 곡 모음의 actual-app 검사를 추가한다. 이 명령들이 `verify` 체인에 포함되었다고 가정하지 말고 현재 `package.json`과 작업 계획을 확인한다. 앱 빌드·packaging·실행에 선행 조건이 있으므로 개별 명령의 실패를 무조건 앱 버그라고 판정하지 않는다.

과거 계약의 schema 번호와 WAV 개수는 당시 추가된 회귀 범위를 설명한다. 현재 기대값은 해당 runner의 현재 assertion과 새로 생성된 보고서를 함께 확인한다. 서로 다르면 기대값을 조용히 낮추지 말고 원인과 결정 내용을 계획에 기록한다.

## 증거가 입증하는 범위

| 근거 | 입증하는 것 | 추가로 필요한 것 |
|---|---|---|
| 정적 QA·타입 검사 | 선언·문서·소스 계약의 일치 | 실제 앱 동작과 실패 경로 재현 |
| runtime smoke·decoded WAV | 실행 결과·파일 구조·수치·결정성 | 음악적 완성도와 사람의 청취 판단 |
| production Electron actual-app | 그 실행 파일의 실제 UI·저장·재열기·내보내기 | 사용자 설치본을 썼다는 실행 경로와 번들 해시 |
| `desktop:install-smoke` | ignored build 내부의 모의 Applications 설치본 | 실제 사용자 Applications 설치 및 그 설치본 실행 |
| Downloads 복사와 checksum | source·전달본의 전 파일 동일성 | 서비스에서 업로드·변환된 스트림의 확인 |
| local release gate | 로컬 기능·빌드·배포 준비 근거 | Developer ID·공증·서버 공개·서비스 승인 등 외부 상태 |

실제 앱 설치가 요청되면 기존 설치본을 보존하고, 설치 경로·앱 버전·실행 바이너리·관련 번들 해시·실행 시각을 ignored 근거에 연결한다. 실제로 검증한 설치본의 범위를 보고한다. GUI 입력·신호 측정·스크린샷만으로 사람의 전곡 청취나 SoundCloud 게시 완료를 주장하지 않는다.

## 하네스 유지보수 기준

2026-09-17 감사에서 `run_qa.py`의 거대한 문자열 목록과 여러 문서의 명령 복제가 발견되었다. 이는 문구가 존재하는 것을 실행 정확성으로 오해하거나 정상 리팩터링을 막을 위험이 있다. 기존 계약을 한 번에 삭제하지 않고 수정 영역부터 행동 검사로 보완한다. 신규 검사는 실패를 재현하는 작은 입력과 기대 동작을 중심으로 만들며, 이력 문서에 새 테스트 전문을 반복해서 붙이지 않는다.

완료 증거의 명령·종료 코드·시각·checkout 정보는 [인수인계 양식](../agents/workflow.md#구현에서-qa로)에 남긴다. 현재 상태를 안내하는 문서와 과거 회귀 계약이 모순되면 구현·runner·새 실행 근거를 확인하고, 품질 기준을 완화하지 않는 최소 수정으로 맞춘다.
