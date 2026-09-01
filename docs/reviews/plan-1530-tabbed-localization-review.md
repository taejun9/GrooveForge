# plan-1530-tabbed-localization Review

## Outcome

Approved. QA 이후 독립 리뷰 결과는 **P0 0 / P1 0 / P2 0**이며 열린 actionable finding은 없다.

GrooveForge의 제작 화면은 Compose, Arrange, Mix, Deliver 메인 탭과 작업별 서브 탭으로 명확히 분리됐다. Settings에서 영어와 한국어를 즉시 전환할 수 있고, renderer의 선택은 Electron 네이티브 메뉴와 파일·미저장 종료 대화상자에도 허용 목록을 거쳐 동기화된다.

## Main And Sub Tab UX

- 메인 탭은 Compose, Arrange, Mix, Deliver의 직접 비트 제작 순서를 유지한다.
- Compose는 Drums, Bass / Melody, Chords & Sound로, Arrange는 Timeline & Blocks, Structure & Transitions로, Mix는 Mixer, Master & Review로 나뉜다.
- 선택한 패널만 레이아웃과 조작 대상이 되며 탭 왕복 뒤 프로젝트·선택·route 상태가 유지된다.
- pointer와 ArrowLeft/ArrowRight/Home/End, roving tab stop, `tab`/`tabpanel`, `aria-selected`, `aria-controls`, skip link와 focus 복귀가 실제 Electron에서 통과했다.
- Mute Map cold route와 Quick Actions의 중첩 route도 올바른 메인/서브 탭을 열며 숨은 패널을 변경하지 않는다.
- 1440×928, 최소 1180 폭, 390px 한국어 화면에서 탭·설정·핵심 도구의 오버플로와 native hit 영역을 검증했다.

## Localization And Settings

- 타입이 지정된 중앙 EN/KO 카탈로그와 안전한 `{name}` 보간을 사용한다. 대체 값의 `$`도 재해석하지 않는다.
- Settings는 제작 탭과 분리된 접근 가능한 modal이며, 라디오 선택 즉시 앱 내비게이션과 핵심 작업 표면에 적용된다.
- `grooveforge.ui.locale.v1`은 프로젝트 데이터와 Undo/Redo 밖의 기기 로컬 설정이다. 손상 값은 영어로 복구하고 저장소 쓰기가 차단되면 현재 세션 적용과 경고를 함께 제공한다.
- preload와 main은 `en`/`ko`만 허용한다. 네이티브 메뉴, Save/Open, 미저장 종료 버튼·제목·설명이 같은 로케일을 따른다.
- Settings가 열린 동안 Space/Undo와 native Play/Undo는 재생, 프로젝트 SHA, history posture를 바꾸지 않는다.
- backdrop 닫기, Escape, 완료 버튼은 같은 focus-trap cleanup을 사용하며 실제 pointer 기본 동작 이후에도 정확한 opener로 포커스가 돌아간다.

## QA

- Passed: `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run typecheck`, `npm run build`.
- Passed: `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run harness:smoke`.
- Passed: `npm run desktop:smoke`, `npm run desktop:launch-smoke`, `npm run quick-actions:bundle-smoke`, `npm run comments:ko:check`.
- Renderer smoke는 EN/KO SSR, 저장 지속성·차단·손상 복구, 번역 보간, 탭 ARIA, modal focus와 기존 제작 계약을 검증했다.
- Actual Electron smoke는 포인터/키보드 탭 순회, route/state 복귀, hidden mutation guard, Settings 즉시 전환·재실행 유지, 네이티브 메뉴·대화상자, 1180/390 반응형 geometry를 검증했다.
- Harness smoke는 스타터 1/1, 블루프린트 16/16, 스타일 16/16, 프로젝트·Handoff Sheet 왕복 34/34, 다운로드 경로 8/8을 유지했다.

## Findings And Fixes

1. 처음에는 일반 route 활성화까지 탭 포커스를 요구해 정상적인 편집 컨트롤 focus 이동을 실패로 오판했다. 명시적인 native click→Arrow/Home/End 순회만 엄격히 검사하고 일반 route는 실제 목적지 focus를 허용했다.
2. Settings Space/Undo 검사가 라디오의 편집 입력 보호만으로 통과할 수 있었다. 비편집 dialog 자체에 포커스한 다섯 checkpoint에서 재생·프로젝트·history 불변성을 정확히 비교하도록 강화했다.
3. backdrop mousedown 뒤 focus-trap이 opener를 복구해도 pointer 기본 동작이 focus를 `body`로 다시 옮겼다. overlay 자체 클릭에만 `preventDefault()`를 먼저 적용하고 같은 actual 경로를 재검증했다.
4. 현지화 이후 정적 QA가 이전 App 영어 리터럴을 계속 요구했다. 검사를 현재 번역 호출과 App helper, compose/mix panel, native dialog의 실제 소유 경계로 이동했다.
5. 독립 코드·접근성·상시 노출 번역 리뷰는 최종 P0/P1/P2 finding을 발견하지 않았다.

## Boundaries And Residual Risks

- 현재 지원 언어는 영어와 한국어뿐이다. 카탈로그·자동 smoke는 전문 번역가의 전체 문맥, 용어 일관성, 음악 제작자 대상 사용성 검수를 대체하지 않는다.
- locale은 UI 로컬 설정이며 프로젝트 파일, 음악 이벤트, Undo/Redo, 오디오 렌더, 내보내기 포맷을 변경하지 않는다.
- 클라우드 동기화, 계정, 원격 번역, 분석, 광고, 결제, 외부 배포는 추가하지 않았다.
- 실제 GUI 회귀는 macOS Electron 환경에서 수행했다. 다른 운영체제의 네이티브 메뉴와 글꼴 렌더링은 별도 플랫폼 QA가 필요하다.
