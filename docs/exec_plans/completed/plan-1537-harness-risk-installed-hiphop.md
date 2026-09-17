# plan-1537-harness-risk-installed-hiphop

## Status

completed

## Owner

project_lead / repo_cartographer / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

하네스와 에이전트 구조, 코드와 위험요소를 평가하고 개선한다. 실제 앱을 설치해 전체 테스트를 실행하고 발견한 버그를 수정한다. 스꺼러갱과 빌스택스 스타일을 참고한 90~180초 오리지널 instrumental을 각각 최소 3곡 제작하여 Downloads에 SoundCloud 업로드용으로 정리한다.

## Goal

구체적인 결함과 재현 가능한 위험을 우선 수정하고, 에이전트가 거대한 역사 문서 대신 현재 작업에 필요한 실행 경로를 찾도록 개선한다. 전체 로컬 release gate와 16개 장르 회귀 및 신규 3+3곡을 실제 설치 앱에서 검증한다. 검증된 WAV, 편집 가능한 프로젝트, 업로드 안내, 음원 분석과 무결성 증거를 전달한다.

## Constraints

- 전용 branch/worktree에서 작업하며 기존 worktree, 사용자 프로젝트와 Downloads 전달물을 보존한다.
- QA가 완료된 뒤 별도 독립 리뷰를 수행한다. 범위 변경은 Decision Log에 기록한다.
- 내장 합성과 편집 가능한 이벤트로 독창적인 곡을 만들며 기존 녹음·가사·보컬을 사용하지 않는다.
- 설치본 갱신은 기존 앱을 고유 이름으로 보존한다. Downloads에는 새로운 폴더만 만든다.
- 실제 재생 신호, 진행, 저장·재열기 및 WAV 일치 근거와 자동 검사 범위를 정확하게 기록한다.

## Implementation Plan

- [x] 하네스·역할·규칙 탐색 구조를 감사하고 유지 가능한 개선을 구현한다.
- [x] 코드·개인정보·안정성 위험을 감사하고 재현 결함을 수정한다.
- [x] 두 음악 방향의 새로운 3+3곡과 fail-closed delivery 검증을 구현한다.
- [x] 앱을 빌드·설치하고 최종 96개 전체 게이트와 16장르·6곡 actual-app 검사를 수행한다.
- [x] Downloads에 검증본과 청취 페이지를 정리하고 전곡 파일·해시·길이를 재검사한다.
- [x] QA 이후 독립 리뷰를 통과하고 완료 계획·리뷰 및 통합 인수인계를 작성한다.

## File Ownership

| owner | paths | result |
|---|---|---|
| repo_cartographer / harness_builder | AGENTS.md, docs/agents, docs/quality/navigation.md, docs/architecture/harness.md, agent_navigation.py, run_qa.py, completion audit 문서 판정 | 현재 안내·검사 탐색과 계약 |
| privacy_guard / harness_builder | electron/rendererSecurity.ts, projectWorkspace.ts, main.ts IPC/탐색 경계, src/audio/deliveryBundle.ts, 관련 security/ZIP 회귀 | 권한·파일 읽기·메모리 개선 |
| harness_builder | dual_trap_track_compositions.mjs, multigenre actual-app runner | 신규 3+3곡 및 전달 검증 |
| project_lead / quality_runner | package.json, 설치 QA launcher/모듈, main.ts QA provenance 구간, 계획·최종 통합 문서 | 설치·전체 QA·Downloads·통합 조율 |

## QA Plan

`npm run release:check`가 최종 전체 로컬 게이트다. 변경별 회귀 검사, `npm run comments:ko:check`, runner self-tests, `npm run desktop:all-genres-qa`, 신규 3+3곡 actual-app suite와 설치본 provenance 검사를 추가한다. PCM24 stereo 44.1kHz, 90~180초, 전곡 신호/클리핑/종료 무음, 고유 SHA-256, 프로젝트 재열기와 재렌더 일치, source/Downloads 전체 파일 일치를 확인한다. 실패 로그를 보존하고 해결 후 관련 검사를 재실행한다.

## Review Plan

QA 완료 뒤 구현 담당자와 별도 reviewer가 코드 변경, 하네스 계약, 실제 설치·앱 실행 증거, 3+3곡 delivery와 잔여 위험을 검토한다.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-09-17 | plan-1537을 현재 main에서 독립 worktree로 시작한다. | 기존 완료 계획과 미병합 작업을 보존한다. |
| 2026-09-17 | 하네스·코드·음악 fixture를 겹치지 않는 소유 범위로 병렬 작업한다. | 세 개의 독립 감사와 구현을 병렬화하고 실제 앱 실행은 단일 담당자가 순차 수행한다. |
| 2026-09-17 | 설치 앱의 source provenance는 checkout에서, 실제 실행 artifact provenance는 설치 번들에서 확인한다. | 개발 빌드를 설치본으로 오인하지 않고 두 전체 inventory의 byte 일치를 추가 검증한다. |
| 2026-09-17 | 음악은 거친 크루 트랩 3곡과 여유로운 저역 중심 트랩 3곡의 신규 instrumental로 제작한다. | 사용자가 제시한 두 스타일의 대비를 BPM·드럼·베이스·편곡으로 구현한다. |
| 2026-09-17 | 전체 GUI 이후 발견한 완료 문서 판정 오류는 현재 UI의 개요 진입 경로로 수정하고 normal/strict QA에서 먼저 검사한다. | 문서 변경만으로 생긴 오류를 긴 GUI 실행 전에 재현·검출한다. |
| 2026-09-17 | 앱 소스·빌드를 유지한 문서 감사 수정 후 영향받은 7개와 잔여 15개 검사를 재실행해 앞선 성공 근거와 연결한다. | 최초 release:check exit 1을 보존하고, 동일 앱의 전체 94개 항목 통과 근거와 단일 명령 exit 0 주장을 구별한다. |
| 2026-09-17 | 16장르의 정상 인트로 여백을 단일시점 native audible 판정이 놓친 문제를 고정 관측구간의 다중 관측과 미디어 시작 근거로 수정한다. | 임계값·합성·곡 fixture를 바꾸지 않고 전체 무음·진행 없음·창 종료 실패를 유지한다. QA 관측 코드만 갱신한 설치본에서 6+16곡을 새 작업 영역으로 재실행한다. |
| 2026-09-17 | 숨긴 ComposerActions의 버튼 설명 갱신에서 이미 가진 exact 분석값을 전달해 전곡 PCM 재계산을 줄인다. | 설치본 정지 응답 실패 조사에서 render 경로의 동기 analyzeExport 호출을 찾았다. 공개 helper의 기존 fallback 의미는 유지하고 전달된 분석값 사용 경로와 실제 UI 시간 기준을 재검증한다. |
| 2026-09-17 | 최종 UI 수정본은 영향받은 renderer·workflow·persona·runtime 검사와 새 설치본 6+16곡에 더해 실제 Applications의 공통 전체 GUI 회귀를 추가한다. | 기존94항목의 서로 다른 산출물 근거와 최종 새 앱의 직접 검사 근거를 분리하고, 변경된 화면 동작을 실제 설치본에서 넓게 검증한다. |
| 2026-09-17 | 독립 리뷰의 최종 전체 게이트 근거 누락 지적에 따라 현재 96개 release:check를 새로 실행한다. | 초기 94개 복구와 최종 영향·실제 설치본 검사만으로 최종 전체 게이트 완료를 승인하지 않는다. 기존 증거를 별도 보존하고 QA로 되돌아간다. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-09-17 | project_lead | 깨끗한 main, 6개 기존 작업 checkout, 2,140행 품질 규칙과 17,256행 App.tsx를 확인하고 계획을 생성했다. |
| 2026-09-17 | harness_builder | 역할 인수인계·QA 경로 라우터를 추가하고 worktree 제거 전 branch 삭제 순서 오류를 수정했다. 내비게이션 회귀 5개 통과. |
| 2026-09-17 | privacy_guard | 소유 창·최상위 frame·앱 URL IPC 검증, 외부 HTTP(S) 제한, navigation/webview 차단, 동일 handle bounded 파일 읽기를 구현하고 FIFO·성장·경로 교체 및 IPC 회귀를 통과했다. |
| 2026-09-17 | harness_builder | ZIP 전체 크기 중간 버퍼 두 개를 제거하고 기존 byte/hash·부분 배열·Blob 불변성 회귀를 통과했다. |
| 2026-09-17 | quality_runner | 설치 앱 dist 전체 해시와 packaged runtime 검증을 추가했다. 설치 검사 중간 Contents symlink 우회도 재현·수정했다. |
| 2026-09-17 | quality_runner | 신규 6곡 PCM self-test 통과: 100.490~120.938초, PCM24 stereo 44.1kHz, full-scale/click risk 0. 기존/신규 5개 모드 self-test도 통과했다. |
| 2026-09-17 | project_lead | npm audit의 의존성 metadata 외부 전송은 auto-review에서 차단되어 사용자 승인을 요청했다. 조회 성공으로 기록하지 않는다. |
| 2026-09-17 | quality_runner | 원본 저장소의 npm ls --all은 문제 0건. 공유 node_modules worktree 링크의 npm 진단은 원본 경로 재검사로 분리했다. 외부 advisory 조회 결과와 동일시하지 않는다. |
| 2026-09-17 | quality_runner | 개발 소스의 실제 launch, native 프로젝트 IO, guarded close-flow 회귀 통과. 실제 Applications 앱을 갱신하고 이전 설치본은 plan-1537 2026-09-17-193438 백업으로 보존했다. deep strict 서명·51개 빌드 파일 일치 확인. |
| 2026-09-17 | quality_runner | 전체 게이트의 source·package·ad-hoc·PKG payload 전체 GUI 및 해당 native IO를 통과했다. 마지막 모의 설치 GUI를 진행 중이다. |
| 2026-09-17 | privacy_guard | /tmp 전달 finalizer의 부분 write/chmod 실패 후 잔여 파일을 재현하고 생성 inode 추적·파일별 롤백으로 수정했다. 원본 byte 복원, 기존 대상/링크/대상 생성 경쟁/대상 inode 교체 보존 검사를 통과했다. 실제 Downloads 쓰기는 아직 수행하지 않았다. |
| 2026-09-17 | quality_runner | release:check는 1~78번을 통과하고 79번 completion-progress에서 오래된 beginner 문구 때문에 exit 1. 수정 후 영향받은 근거 7개·잔여 80~94번 15개 모두 exit 0. 단일 release:check exit 0으로 기록하지 않는다. |
| 2026-09-17 | quality_runner | 실제 Applications 설치본의 신규 6곡 batch exit 0: 편곡·재생·WAV 미리듣기·내보내기·저장·재열기·재렌더 byte 일치와 설치 runtime 경로를 확인했다. 독립 NumPy 전곡 PCM 감사와 66개 파일 checksum도 통과했다. |
| 2026-09-17 | quality_runner | 실제 설치본 전체 16장르 batch를 별도 새 작업 영역에서 시작했다. |
| 2026-09-17 | quality_runner | 최초 설치본 16장르 batch는 12개 통과·4개 실패로 exit 1. R&B/Lo-fi는 WAV 미리듣기, Experimental/Phonk는 편곡의 단일시점 audible=false였다. 다음 곡 시작을 이전 곡 통과로 해석한 중간 보고를 사용자에게 정정하고 개별 종료 로그를 추가했다. |
| 2026-09-17 | harness_builder | 실패 4곡 첫 10초 PCM을 100ms 단위로 분석하여 초기 소리와 검사 시점 근처의 짧은 감쇠를 확인했다. Lo-fi는 UI의 미리듣기 활성 시점과 실제 미디어 시작의 차이까지 관측해야 하므로 단정하지 않았다. |
| 2026-09-17 | quality_runner | 가청 관측 회귀를 전체 verify에 추가하여 95개로 확장했다. 새 회귀·설치본 guard·manual safety·16장르/6곡 self-test·normal/strict QA·주석·typecheck·build 통과. 새 52파일 앱 번들의 deep strict 및 framework guard와 기존 번들 원본 해시 보존을 확인했다. |
| 2026-09-17 | quality_runner | 관측 수정 앱을 새 번들로 별도 설치했다. 기존 실행 세션은 복구 초안을 새 프로젝트로 저장하고 원본 payload 동일성을 확인한 뒤 정상 종료했다. 신규 6곡 재검사는 가청 검사를 통과했으나 2곡 정지 응답 5971/5951ms가 기존 5000ms 기준을 넘어 4통과·2실패로 종료했다. 단일 앱 CPU 진단은 비재현(422ms)이므로 최종 통과 근거에 포함하지 않는다. |
| 2026-09-17 | quality_runner | Composer Actions의 정확 분석 재사용을 구현했다. 순수 fixture 설명 계산은 2900~3248ms에서 0.013~0.099ms로 줄었고 여섯 설명이 동일했다. 실제 React panel/App 준비·미준비 회귀에서 중복 PCM 호출 0회와 기존 fallback 1회 유지, 탐색6·typecheck·normal/strict·주석·renderer/workflow/persona/runtime·build 통과. 새 회귀 포함 verify 목록은96개이다. 수정 후52파일 앱의 별도서명·설치검증을 마쳤고 새6곡을 시작했다. |
| 2026-09-17 | quality_runner | 최종 설치본의 신규 6곡·16장르가 각각 exit 0(6/6, 16/16). 전체 22개 원본 보고서·현재 설치본 52개 파일·source/executable 해시·가청 표본·저장 파일을 집계 검증했다. 신규 6곡 WAV는 이전 6곡과 byte 동일하며, 전곡 NumPy 감사와 Downloads 66개 파일 전체 SHA가 일치했다. 최종 공통 GUI 첫 시도는 본 검사 전 세션 관측기의 API 기대 차이로 종료되어 별도 도구 호환 오류로 기록했다. |
| 2026-09-17 | quality_runner | 최종 실제 설치본 공통 전체 GUI가 exit 0. 원본 207개 조건·timeout을 유지한 실행에서 화면 PNG 10개, 격리 세션·실행 파일·전체 빌드와 소스 해시·관측 포트 종료를 확인했다. 종합 QA 영수증과 Downloads 66개 파일(365,158,743바이트) 재검증을 완료했다. 이후 구현에 참여하지 않은 코드 및 증거 reviewer 두 명에게 인계했다. |
| 2026-09-17 | review_judge | 최종 설치본 22개 사례·207개 GUI는 통과했으나 최종 변경 후 96개 전체 게이트의 일괄 통과 근거가 없어 QA 완료 승인을 보류했다. 사용자에게 알리고 기존 증거를 보존한 뒤 전체 게이트 재실행을 결정했다. |
| 2026-09-18 | quality_runner | 기존 증거 4,051개를 전체 SHA 일치 사본으로 보존했다. 최종 원본 96개 release:check가 00:11:04 KST에 exit 0으로 완료되었고, 소스 71개·설치 빌드 52개 및 실행 파일 식별자가 앞선 설치본 22개 사례·207개 GUI 근거와 일치했다. 후속 독립 리뷰에 인계했다. |

| 2026-09-18 | review_judge | 전체 게이트 후 독립 코드·하네스 및 QA·전달 근거 리뷰가 모두 완료 승인. 최종 96개 실행 누락과 정지 시간 표기 범위 지적이 해결되었으며 남은 구체적 P0–P3 지적은 없다. |

| 2026-09-18 | quality_runner | 완료 계획·리뷰 이동 후 normal/strict QA, 한글 주석, diff 검사와 completion-summary-refresh를 모두 exit 0으로 완료했다. |

## Completion Notes

구현·최종 전체 QA·설치본 검사·Downloads 전달·독립 리뷰를 완료했다. [완료 리뷰](../../reviews/plan-1537-harness-risk-installed-hiphop-review.md)와 [평가서](../../quality/plan-1537-assessment.md)에 결과와 잔여 위험을 정리했다. 완료 문서 QA 뒤 박자가 전용 branch를 main에 통합·push하고 증거를 보존한 뒤 해당 worktree와 branch를 정리한다. 최종 Git 식별자와 정리 결과는 ignored 통합 영수증 및 사용자 완료 보고로 확인한다.
