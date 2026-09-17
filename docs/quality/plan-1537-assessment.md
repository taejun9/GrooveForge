# plan-1537 하네스·코드 위험 평가

평가일: 2026-09-17. 최종 전체 QA: 2026-09-18(KST). 이 문서는 평가·개선과 단계별 QA 근거를 정리한다. 초기 전체 게이트의 복구 실행과 최종 수정 설치본의 직접 검사 범위를 구분한다. 작업 범위와 최종 결과는 plan-1537 실행 계획 및 완료 리뷰에서 추적한다.

## 평가

프로젝트는 편집 가능한 이벤트 모델, 로컬 저장, 결정적 WAV, 범위가 제한된 가져오기, 격리된 Electron 검사와 배포 근거를 갖추고 있다. 계획·QA·리뷰를 구분한 운영도 강점이다. 반면 현재 안내와 오랜 회귀 계약이 섞여 탐색 비용이 높고, 큰 파일에 기능과 검사 책임이 집중되어 있다. 회귀 검사의 양을 곧바로 제품 완성도나 안전성으로 해석해서는 안 된다.

| 영역 | 확인한 강점 | 구체적인 약점과 영향 |
|---|---|---|
| 하네스 | 계획·worktree·완료 리뷰, 정적·runtime·실제 앱·오디오 검사 | 약 3만 행 `run_qa.py`의 문자열 계약과 여러 문서의 명령 복제가 정상 리팩터링을 막거나 실행 결함을 놓칠 수 있음 |
| 에이전트 | 8개 역할과 보고 규칙, QA 이후 리뷰 원칙 | 공용 파일 소유자와 인수인계 증거가 불명확했고, worktree가 잡고 있는 branch를 먼저 삭제하는 실행 불가능한 정리 순서가 있었음 |
| 앱·저장 | 이벤트 상한·정규화, SQLite·원자적 저장·복구, sandbox와 context isolation | 네이티브 IPC 발신자·탐색·외부 URL 정책이 부족했고, 별도 path stat 후 읽기는 검사 이후 파일 교체·성장에 취약했음 |
| 오디오·전달 | PCM24·재렌더·꼬리·해시 검증과 편집 가능한 프로젝트 | ZIP 조립에서 전체 결과 크기의 중간 버퍼를 반복 복사하여 긴 곡 전달 시 최대 메모리가 불필요하게 커짐 |
| 재생·화면 반응 | 오디오 분석 Worker와 정확 결과의 정체성 검증 | 숨긴 Composer Actions의 버튼 설명이 정확 분석값을 받지 않아 전곡 PCM을 다시 계산했고, 정지 입력이 기존 5초 기준을 초과함 |
| 설치·근거 | build 내부 설치·재열기 회귀가 존재 | 기존 `desktop:install-smoke`는 모의 Applications 복사이므로 실제 사용자 설치본 실행의 증거를 대신할 수 없음 |

## 이번에 구현한 개선

| 개선 | 구현 위치 | 확인 방식 |
|---|---|---|
| 짧은 현재 안내와 역할·파일 소유권·QA 인수인계 | [에이전트 작업](../agents/workflow.md), [QA 탐색](navigation.md), [AGENTS](../../AGENTS.md) | 최종 전체 게이트 유지, 독립 리뷰 시작 조건, worktree 제거 후 branch 삭제 순서를 명시 |
| 변경 경로에 맞는 검사와 담당자 탐색 | [agent_navigation.py](../../harness/scripts/agent_navigation.py) | 실제 npm 명령·역할·문서 존재를 normal/strict QA에서 검사; 미분류·빈 입력도 전체 게이트 유지 |
| 네이티브 경계 강화 | [rendererSecurity.ts](../../electron/rendererSecurity.ts), [main.ts](../../electron/main.ts), [projectWorkspace.ts](../../electron/projectWorkspace.ts) | 정확한 main renderer와 sender frame 확인, 탐색·webview 제한, 외부 HTTP(S) 정책, 열린 파일 handle의 일반 파일·바이트·문자수 상한 |
| ZIP 중간 복사 제거 | [deliveryBundle.ts](../../src/audio/deliveryBundle.ts) | 기존 ZIP 해시, 부분 배열·공유 메모리 스냅샷, 큰 입력의 명시적 버퍼 할당 회귀 |
| 실제 설치본 실행 선택과 빌드 동일성 | [installed_app_qa.mjs](../../harness/scripts/installed_app_qa.mjs), [manual launcher](../../harness/scripts/run_desktop_manual_qa.mjs) | 설치본 `dist`·`dist-electron` 전체 경로·크기·SHA-256 비교, 실행 파일 해시, source와 bundle의 별도 provenance |
| 가청 구간의 연속 관측 | [playbackAudibilityObservation.ts](../../electron/playbackAudibilityObservation.ts), [관측 회귀](../../harness/scripts/run_playback_audibility_observation_smoke.mjs) | 편곡 3.5초·WAV 미리듣기 3초 구간을 100ms 간격으로 관측하고 표본과 종료 상태를 기록하여 단일 시점의 신호 누락을 줄임 |
| 화면 렌더의 중복 전곡 PCM 계산 제거 | [App.tsx](../../src/ui/App.tsx), [공통 UI helper](../../src/ui/workstationAppHelpers.tsx), [분석 재사용 회귀](../../harness/scripts/run_composer_action_analysis_smoke.mjs) | 준비된 정확 미터를 버튼 설명에 전달; 실제 React 패널·App ready/pending 렌더에서 추가 PCM 0회와 기존 설명·생략 인자 동작을 검증 |
| 신규 3+3곡의 actual-app 전달 | [actual-app runner](../../harness/scripts/run_desktop_multigenre_actual_app_qa.mjs) | 90~180초, 3+3 구성, WAV·프로젝트·메타데이터·재열기·해시 검사; 최종 실제 실행 결과는 아래 상태에 따름 |

기존 `release:check`를 유지하고 `verify`에 보안·설치본 준비·ZIP 메모리 회귀를 추가한 초기 통합 시점의 항목 수는 94개였다. 이후 가청 관측과 Composer Actions 분석 재사용 회귀가 추가되어 현재 카탈로그는 96개다. 초기 94개 항목의 복구와 최종 96개 전체 실행을 별도 근거로 보존한다. 독립 리뷰의 전체 게이트 누락 지적 후, 최종 96개 원본 체인을 새로 실행하여 exit 0을 확인했다.

## 현재 검증 상태

최종 설치본의 6곡·16장르, 207개 조건의 전체 UI 회귀와 Downloads 복사가 모두 통과했다. 첫 독립 리뷰에서 최종 96개 전체 게이트의 일괄 실행 근거가 없음을 지적하여 완료 승인을 보류했다. 기존 증거 4,051개를 전체 inventory·SHA-256이 같은 별도 사본으로 보존한 뒤, 2026-09-18 00:11:04 KST에 최종 `npm run release:check`가 exit 0으로 완료되었다. 소스 71개 파일과 실제 설치본 52개 빌드 파일·실행 파일의 식별자는 실행 전후 및 앞선 설치본 검증과 일치한다. 전체 게이트 후 코드·하네스와 QA·전달 근거를 나누어 재검토한 두 독립 리뷰어가 모두 완료를 승인했다. 남은 구체적 P0–P3 지적은 없다.

| 검사 | 평가 문서 작성 시점의 상태 |
|---|---|
| `python3 harness/scripts/test_agent_navigation.py` | 6개 회귀 통과: 기존 5개와 App·공통 helper·회귀 스크립트 변경을 분석 재사용 검사에 연결하는 라우팅 |
| `python3 harness/scripts/run_quality_gate.py` | 통합 후 통과 |
| `npm run desktop:installed-app-qa-smoke` | 기존 fixture 통과 후 추가 검사에서 중간 `Contents` symlink 수락을 재현. 담당자가 Contents·Resources·MacOS 경로와 metadata leaf 검사 및 거부 회귀를 추가하고 통과를 확인 |
| `node harness/scripts/run_desktop_manual_qa.mjs --safety-self-test` | 격리 작업 영역·소유권·provenance 자체 검사 통과 |
| 초기 빌드의 source production GUI·native project IO·guarded close flow | 최초 94개 전체 게이트 실행에서 통과 |
| 초기 빌드의 packaged production GUI·packaged native project IO | 최초 94개 전체 게이트 실행에서 통과 |
| 초기 빌드의 ad-hoc·PKG payload·simulated install GUI 및 관련 native IO | 최초 94개 전체 게이트 실행에서 통과; 총 5개 산출물 경로의 전체 GUI 완료. 이후 관측·UI 수정 빌드와 구분 |
| 실제 `/Applications/GrooveForge.app` 설치 | 최초 19:34:38 KST 설치본은 51개 빌드 파일. 최종 관측·UI 수정본은 22:00:41 KST 설치, deep strict 서명 검사와 현재 빌드 52개 파일의 전체 동일성 확인. 기존 앱을 별도 보존했으며 최종 근거는 ignored `build/desktop/plan-1537-completion-evidence/plan-1537-final-install-receipt.json` |
| 최초 `npm run release:check` 및 복구 실행 | 최초 일괄 명령은 verify 79번에서 exit 1. 수정 후 영향받은 7개와 원래 순서 80~94번 잔여 15개를 모두 exit 0으로 실행하여 전체 94개 항목의 통과 근거를 확보. 일괄 명령 exit 0은 주장하지 않음 |
| 최종 UI 수정 후 영향 검사 | renderer·workflow·persona·harness runtime·normal/strict QA·한글 주석·typecheck·build 통과. 실행 로그: `build/desktop/plan-1537-completion-evidence/plan-1537-support-evidence/tmp/grooveforge-1537-composer-affected-qa.log` |
| 최종 설치본 신규 6곡 | `plan-1537-dual-trap-actual-app-qa-20260917T130142Z-49835` exit 0, 6/6 통과. 모든 전체곡 정지 입력 419~426ms로 기존 5초 기준 충족 |
| 최종 6곡의 독립 음원·전달 검증 | NumPy로 전체 PCM 검사와 66개 체크섬 검증 통과. 이전 6곡 WAV와 6/6 SHA-256 동일; 음원 데이터 변경 없음 |
| Downloads 전달 | `Downloads/GrooveForge_트랩_6곡_SoundCloud_2026-09-17_2210`의 66개 파일 전체 경로·SHA-256이 원본과 일치. 6곡·3+3 구성·PCM 헤더·길이와 체크섬 확인. 복사 로그: `build/desktop/plan-1537-completion-evidence/plan-1537-support-evidence/tmp/grooveforge-1537-downloads-copy.log` |
| 최종 설치본 16장르 실제 앱 검사 | `plan-1531-all-genres-actual-app-qa-20260917T130914Z-60414` exit 0, 16/16 통과. 신규 6곡과 합친 22개 보고서·현재 설치본·소스 식별자·가청 표본·저장·WAV 검증도 통과: `build/desktop/plan-1537-completion-evidence/plan-1537-final-22-receipt.json` |
| 최종 설치본 전체 UI 회귀 | `plan-1537-final-installed-full-gui-20260917T133038116Z-Q1mpfi` exit 0. 원본 runner의 207개 조건·시간 상한을 유지하고 실제 설치 실행 파일과 새 격리 경로로 연결했다. 화면 PNG 10개, 실제 packaged runtime·userData/sessionData·메모리 세션과 종료 후 inspector 포트 종료, 실행 전후 전체 앱·소스 동일성을 확인했다. |
| 최종 96개 `release:check` | 원본 `npm run qa && npm run verify` 체인 exit 0. 소스·패키지·ad-hoc·PKG payload·모의 설치의 전체 GUI 5개, native IO 4개, guarded close와 나머지 모든 항목 통과. 전체 명령 경과 4,760.285초(약 79분 20초). |
| QA 이후 독립 리뷰 | 최종 전체 게이트 누락을 새 96개 일괄 실행으로 해결. 두 독립 reviewer 모두 완료 승인, 남은 구체적 P0–P3 지적 없음 |

초기 통합 QA에서 새 npm 명령의 문서 누락, 변경 전 문자열 계약과 새 helper의 불일치, 신규 스크립트 shebang 누락을 검출했다. 각 담당자가 계약·카탈로그·헤더를 보완한 뒤 strict gate가 통과했다. 추가 adversarial 검사는 최종 결과가 아니라 발견·수정·재실행 기록으로 관리한다.

### 완료 문서 판정 실패와 복구

최초 전체 실행에서 모든 GUI·native IO가 통과했지만 completion audit가 README의 과거 `설정 → 작곡 → 편곡 → 믹싱 → 전달` 문구를 요구했다. 실제 README는 현재 UI에 맞는 `개요 → 작곡 → 편곡 → 믹싱 → 전달`이었다. 나머지 초보자 경로 조건은 모두 충족했고, `Beginner workflow evidence is incomplete.` 한 항목 때문에 local MVP가 false가 되어 79번 progress 검사에서 실패했다. 새 보안 모듈이나 native IO 선행검사 누락이 원인은 아니었다.

판정기를 현재 개요 진입 경로로 바로잡되 모든 기존 요구를 유지했다. 같은 판정 함수의 문서 검사와 누락·과거 경로 거부 fixture 5개를 `--check-docs`로 노출하고 normal/strict QA가 먼저 실행하게 하여, 같은 문구 불일치를 긴 GUI 실행 전에 검출하도록 했다. 앱 소스·빌드·설치본은 이 수정으로 변경하지 않았다.

수정 전 JSON과 전체 실패 로그는 ignored `build/desktop/plan-1537-completion-evidence/plan-1537-completion-recovery/before/`, `original-release-check.log`, `original-release-failure.json`에 보존했다. 수정 후 audit→external gate(dry)→remediation→status→runbook→ledger→progress 7개를 다시 실행해 모두 exit 0을 확인했다. 이 시점의 local release readiness는 true/100%였으며 외부 배포 ready는 false를 유지했다. 이것은 로컬 증거 차원의 상태이며 사용자 작업 전체의 완료율이 아니다.

잔여 15개 원래 명령 목록은 `pending-verify-commands.json`, 실제 실행 시각·종료코드는 `remaining-verify-checks.json`, 복구한 7개 검사 내역은 `recovery-checks.json`, 종합 상태는 `recovery-summary.json`에서 추적한다. 수정 후 7개 영향 검사와 원래 순서의 잔여 15개가 모두 exit 0으로 끝났고 normal QA·strict QA·문서 정상/부정 5개 fixture·한글 주석 검사도 통과했다. 따라서 최초 통과한 항목과 복구 실행을 합쳐 전체 94개 항목의 통과 근거를 확보했다. 최초 일괄 명령의 exit 1 기록을 덮어쓰거나 일괄 실행이 exit 0이었다고 보고하지 않는다.

### 실제 앱의 신호 관측·정지 지연 실패와 복구

관측 helper 수정 전 16장르 실행은 12개 통과·4개 실패였다. 이후 가청 구간 관측을 반영한 6곡 실행은 4개 통과·2개 정지 지연 실패였다. 이 실행들은 서로 다른 검사 단계의 원본 결과이며, 다음 곡의 시작 로그나 일부 곡 성공을 배치 전체 성공으로 해석하지 않는다. runner는 각 child 종료 직후 순서·장르·제목·종료코드·signal을 포함한 통과/실패 결과를 출력하도록 개선했다.

정지 지연은 숨긴 Guide의 `ComposerActions`가 버튼 설명을 만드는 경로에서 발견했다. 정확한 분석이 준비되어도 `composerActionButtonContext` → `composerActionQuickActionDetail` → `composerActionFollowupCues`의 finish 분기가 `analyzeExport`를 호출하여 전곡 PCM을 동기로 다시 계산했다. 준비된 미터를 App에서 패널과 helper에 전달하여 화면 갱신 중 재계산을 없앴다. 명시적 작업 이후 분석 인자를 생략하는 기존 호출의 의미와 Quick Action 경로는 유지했다.

순수 Node fixture 측정에서 finish 설명 계산은 trap 2,900.593→0.099ms, phonk 2,948.168→0.013ms, drill 3,247.601→0.024ms로 줄었고 여섯 작업 설명은 모두 같았다. 이는 설치본 입력 응답 시간과 별개의 helper 측정이다. 회귀 검사는 실제 PCM 진입을 관측하여 React 패널·App ready/pending 렌더에서 불필요한 PCM이 0회이고, 생략 인자 finish 호출은 정확 분석 1회를 유지함을 확인했다. 측정 원본은 `build/desktop/plan-1537-completion-evidence/plan-1537-support-evidence/tmp/grooveforge-1537-composer-profile-result.json`과 `build/desktop/plan-1537-completion-evidence/plan-1537-support-evidence/tmp/grooveforge-1537-composer-profile-after-result.json`에 보존했다.

최종 설치본 6곡 실행에서 이전 전체곡 정지 실패 두 곡은 각각 5,971→420ms와 5,951→423ms였고, 전체 6곡의 전체곡 정지는 419~426ms로 통과했다. WAV 미리듣기 정지는 423~432ms였다. 5초 기준이나 실패 판정을 완화하지 않았다. 최종 원본 보고서는 ignored `build/desktop/plan-1537-completion-evidence/plan-1537-dual-trap-actual-app-qa-20260917T130142Z-49835/workspaces/*/evidence/auto-movement-qa-report.json`에 있다. 이전 WAV와 최종 WAV의 해시가 모두 같다는 결과는 이번 관측·UI 수정이 전달 음원을 바꾸지 않았다는 근거다. 이후 최종 16장르도 16/16 통과했다. Lo-fi의 WAV 미디어 시작 이벤트는 요청 후 약 2.64초에 도착했고, 시작 이후 3초 관측에서 30개 중 13개의 가청 표본을 확인했다. 기존 단일 시점 실패의 정확한 과거 시각을 복원했다는 뜻은 아니다. 이후 전체 UI 회귀도 실제 설치본에서 통과했으며, 독립 리뷰 상태는 위 표에서 추적한다.

### 최종 설치본 전체 GUI의 실행 범위

일회성 wrapper가 검증된 원본 launch runner를 복사하여 실제 `/Applications` 실행 파일과 새로운 작업·화면 증거 경로에 연결했다. 변환을 역적용한 소스 SHA와 207개 assertion의 AST가 원본과 같고, 기존 1,820,000ms 시간 상한을 유지함을 확인했다. 실제 runtime·격리 경로는 loopback 임시 inspector의 main-process 읽기 한 번으로 관측하고 즉시 연결을 끊었다. 이 실행은 읽기 관측기를 추가한 기능 회귀이며, 관측기 없는 신규 6곡의 입력 시간 측정과 구분한다.

첫 wrapper 실행은 실제 Electron 43.5의 web preferences에 `partition` 값이 없어서 본 검사 전에 종료했다. 세션의 `isPersistent() === false`와 `storagePath === null`을 확인하는 실제 API로 관측기를 고쳤다. 값 누락·persistent·저장 경로 존재를 거부하는 회귀와 실제 runtime 응답 검증 후 새로운 전체 실행이 exit 0이었다. 앱 소스·검사 조건·음원 데이터를 바꾸지 않았으며 초기 실패 기록을 보존했다.

최종 종합 근거는 ignored `build/desktop/plan-1537-completion-evidence/plan-1537-completion-qa-receipt.json`과 `plan-1537-final-release-gate-receipt.json`이다. 그 이전의 `plan-1537-final-qa-receipt.json`은 당시 전체 게이트 미실행 상태를 그대로 보존한 역사 기록이다. 작업 정리 후 모두 `build/desktop/plan-1537-completion-evidence/` 아래로 보존한다. 원본 증거의 옛 worktree 절대 경로는 내용을 바꾸지 않고 별도 이동표로 연결한다.

## 전체 GUI 반복 실행의 비용과 후속 설계

현재 macOS `verify`에는 아래 5개 실행 경로가 있다. 각 runner가 `GROOVEFORGE_DESKTOP_LAUNCH_SMOKE=1`을 설정하고 [main의 `installLaunchSmoke`](../../electron/main.ts)를 실행한다. 그 결과 시작 화면 확인에 더해 탭·드럼/노트 그리드·스타터·Quick Actions·모달·현지화 등 동일한 내부 GUI 회귀를 반복한다. source runner의 추가 결과 assertion과 각 산출물의 포장·서명 검사는 별도로 존재한다.

| 순서 | 전체 GUI를 실행하는 runner | 산출물 고유 검증 |
|---|---|---|
| 1 | [source launch](../../harness/scripts/run_desktop_launch_smoke.mjs) | 저장소 production 빌드·preload·기능·화면 |
| 2 | [package](../../harness/scripts/run_desktop_package_smoke.mjs) | 앱 조립·메타데이터·아이콘·프레임워크·실행 |
| 3 | [ad-hoc signing](../../harness/scripts/run_desktop_adhoc_sign_smoke.mjs) | 서명·hardened runtime·프레임워크·실행 |
| 4 | [PKG payload](../../harness/scripts/run_desktop_pkg_payload_smoke.mjs) | PKG 추출 후 앱 파일·의존성·실행 |
| 5 | [simulated install](../../harness/scripts/run_desktop_install_smoke.mjs) | DMG에서 모의 Applications 위치로 복사한 앱의 구조·서명·실행 |

별도로 source·packaged·PKG payload·simulated installed의 native project IO 4개 경로가 있다. 이들은 동일 전체 GUI 플래그를 켜는 5개 경로와 구분된다. 실제 `/Applications` 앱의 22개 음악 사례도 추가 작업 범위이므로 위 모의 설치 경로에 포함시키지 않는다.

진행 관측에서 source 전체 GUI는 대략 19:11~19:29, package GUI는 19:30~19:48에 실행되었다. 각 회차 약 18~19분은 작업 중 시각 관측치이며 runner가 기록한 정밀 benchmark는 아니다. 동일 비용이 다섯 경로에 유지된다고 단순 추정하면 반복 GUI 부분만 약 90~95분이다. 이 추정에는 오프라인 렌더, 앱 조립·서명, 디스크 이미지, native IO, 실제 설치본 22곡은 포함되지 않는다. 실제 총시간이나 남은 시간으로 보고해서는 안 된다.

이는 하네스 비용과 피드백 지연 위험이다. 작은 기능 수정도 오래 기다려야 하고, 뒤쪽 실패의 수정·재실행 비용이 커지며, 시간 제약 때문에 최종 검사나 청취를 생략하려는 압력이 생길 수 있다. 현재 작업에서는 검사·timeout·게이트를 바꾸지 않고 전체 절차를 유지한다.

후속 계획에서는 다음 순서로 개선 가능성을 검증한다.

1. 기존 전체 검사를 유지한 채 runner와 내부 phase의 시작·종료·경과시간, 실패 원인, 빌드 식별자를 기록한다. 먼저 실제로 비용이 큰 단계와 산출물마다 달라지는 결함을 수치로 확인한다.
2. source와 모든 산출물의 `dist`·`dist-electron` 전체 경로·바이트·해시 inventory를 비교하고 runtime 버전·아키텍처·플랫폼·의존성·검사 버전까지 연결한다. 서명 때문에 바뀌는 컨테이너·실행 파일 식별자와 공통 앱 콘텐츠 식별자는 구분한다. 파일 일부의 해시나 같은 HEAD만으로 동등성을 인정하지 않는다.
3. 검증된 동일 빌드에 대해 대표 production 앱에서 전체 GUI를 한 번 실행하고, 다른 산출물에서는 각각 실제 바이너리 시작·preload·필수 lazy assets·격리 저장·native project IO·필요한 close flow와 고유 포장·서명 검사를 수행하는 구조를 후보로 만든다. 새로운 콘텐츠·runtime·검사 버전 또는 플랫폼 차이가 있으면 전체 GUI 재실행 대상으로 되돌린다.
4. 기존 5회 방식과 후보 방식을 병행하여 정상 결과와 결함 주입 결과를 비교한다. 누락/변조 chunk·preload, stale main, 잘못된 package entry, 프레임워크·서명·설치 경로·저장 권한 실패를 후보가 계속 검출한다는 회귀 근거와 독립 리뷰가 있어야 기존 중복 검사를 줄일 수 있다.
5. 보고서에는 `전체 GUI 직접 실행`, `동일 빌드의 기능 근거 참조`, `산출물별 시작·native IO 직접 실행`을 구별한다. 참조한 기능 근거의 digest·실행 시각·검사 버전을 남기고, 참조 근거가 없거나 불일치하면 통과를 인정하지 않는다.

이 설계는 후속 평가안이다. 현재 5개 전체 GUI 실행을 생략해도 된다는 승인이나 테스트 축소의 근거로 사용하지 않는다.

## 근거 해석과 남은 위험

- **실제 설치:** production Electron, build 내부 모의 설치, 사용자 Applications 설치본은 서로 다른 실행 대상이다. 설치본이라고 보고하려면 해당 실행 경로와 현재 빌드의 파일 해시를 연결해야 한다. 설치된 앱의 빌드 비교는 Developer ID·공증·운영체제 승인 전체를 입증하지 않는다.
- **신호와 음악 품질:** decoded WAV·클리핑·끝 무음·결정성 검사는 기술 품질 근거다. 자동 UI 조작·스크린샷·신호 측정만으로 사람의 전곡 청취, 곡의 완성도 또는 스트리밍 변환 이후 음질을 주장하지 않는다.
- **의존성 advisory:** 온라인 `npm audit`는 의존성 metadata의 외부 전송을 자동 승인 검토가 차단하여 수행하지 못했다. 원본 저장소의 `npm ls --all` 문제 0건은 로컬 설치 트리 진단이며 외부 취약점 조회 결과가 아니다.
- **CSP 보완:** 현재 [HTML 진입점](../../index.html)에 CSP가 없고 main의 응답 헤더 설정도 확인되지 않았다. sender·탐색 제한은 보완책이지만 CSP를 대신하지 않는다. 개발 Vite와 production `file:` 로딩, UI 스타일·오디오 자원을 구분한 정책을 설계하고 실제 앱 회귀와 함께 도입하는 후속 작업이 필요하다.
- **큰 파일:** 초기 평가 시점 [App.tsx](../../src/ui/App.tsx)는 17,256행, [electron/main.ts](../../electron/main.ts)는 약 16,400행이었다. main에는 production 초기화·IPC와 대량의 QA 코드가 함께 들어 있다. 이번 수정은 발견한 동기 계산 경로에 한정했다. 변경 영역부터 순수 정책·저장 경계·QA 실행부를 분리하되 기존 테스트 연결을 보존해야 한다. 파일 크기만으로 취약점 발생을 주장하지 않는다.
- **검사 의존성:** 경로 기반 탐색은 관련 검사 후보를 찾는 도구다. 전체 의존성을 계산하지 않으므로 최종 전체 게이트와 작업별 actual-app 검사가 계속 필요하다. 긴 문자열 계약은 행동 회귀가 확보된 영역부터 점진적으로 축소할 대상으로 남는다.
- **외부 게시:** Downloads의 파일 동일성은 업로드 완료나 권리 심사·서비스 승인을 뜻하지 않는다. 이번 산출물은 오리지널 이벤트·내장 합성에 기반하며 실제 SoundCloud 게시 상태는 로컬 QA와 구분한다.

## 공식 근거

2026-09-17에 직접 확인했다. Electron은 IPC sender 검증, 탐색·새 창 제한, context isolation·sandbox와 CSP를 보안 권고로 제시한다. 이번 네이티브 경계 수정과 남은 CSP 작업은 이 기준과 연결된다. [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)

SoundCloud는 WAV 등 무손실 형식과 stereo, 16-bit/44.1kHz 이상 소스, 약 -0.5~-1 dBFS headroom을 권장한다. 이번 PCM24 stereo 44.1kHz 전달 형식은 해당 소스 권장 범위에 해당하며, 이것만으로 서비스 변환 이후 결과나 업로드 성공을 보증하지 않는다. [SoundCloud Upload Requirements](https://help.soundcloud.com/hc/en-us/articles/360039171614-Upload-Requirements)
