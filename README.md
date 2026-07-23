# GrooveForge

[한국어](README.md) · [English](readme-en.md)

GrooveForge는 여러 장르의 비트를 직접 만들기 위한 데스크톱용 이벤트 기반 미니 DAW입니다. 패턴 프로그래밍, 드럼, 808/베이스, 멜로디와 코드, 사운드 디자인, 편곡, 믹싱, 마스터링, MIDI, WAV와 스템 내보내기를 하나의 로컬 워크스테이션에서 다룹니다.

프로젝트 유형: `web-first TypeScript mini DAW / beat workstation`

처음 비트를 만드는 사용자는 `설정 → 작곡 → 편곡 → 믹싱 → 전달` 흐름을 따라갈 수 있고, 숙련된 프로듀서는 안내를 건너뛰고 이벤트, 사운드, 편곡, 믹서, 마스터와 전달 상태를 바로 편집할 수 있습니다. 모든 기본 작업은 내장 악기와 편집 가능한 음악 이벤트에서 시작합니다.

이 저장소는 `Team Forge`가 관리합니다. 에이전트 역할과 작업 규칙은 [AGENTS.md](AGENTS.md)를 참고하세요. 기존의 상세 영문 README와 전체 운영 명령 카탈로그는 [readme-en.md](readme-en.md)에 보존되어 있습니다.

## 제품 중심축

GrooveForge의 중심은 샘플 탐색이 아니라 직접 비트를 작곡하고 소리를 설계하는 과정입니다.

```text
BPM/키/스타일 → 패턴 프로그래밍 → 드럼 → 808/베이스 → 멜로디/코드
→ 사운드 디자인 → 편곡 → 믹싱 → 마스터링 → 내보내기
```

사용자는 다음 요소를 편집 가능한 프로젝트 데이터로 다룹니다.

- 음악 이벤트와 자동화
- Pattern A/B/C와 클립
- Drums, 808/Bass, Synth, Chord 트랙
- 편곡 블록과 재생 범위
- 악기·FX·믹서·마스터 상태
- Delivery Target과 Session Brief
- 프로젝트 JSON, WAV, 스템, MIDI, Handoff Sheet와 Delivery Bundle ZIP

장르 지원은 고정된 한 장르가 아니라 편집 가능한 스타일 프로필과 생성 규칙에서 나옵니다. Lo-fi, House, Trap, Drill, Boom Bap, R&B, K-hip-hop/R&B, Afrobeats, Amapiano, Reggaeton, Jersey Club, Phonk, Garage, Experimental 등 14개 시작점을 제공하며, 모든 결과는 다시 편집할 수 있습니다.

샘플링은 이후 추가할 수 있는 선택형 음원 모듈입니다. 오디오 가져오기, 자르기, 슬라이스, 타임 스트레치나 샘플러가 없어도 완전한 비트를 만들 수 있어야 하며, MVP·첫 화면·기본 내비게이션은 계속 직접 작곡을 우선합니다.

## MVP 목표

첫 번째 제품 증명은 가져온 오디오 없이 완성하는 8마디 비트입니다.

- 드럼, 808/베이스, 신스 멜로디와 코드
- 편집 가능한 Pattern A/B/C
- 섹션 편곡과 에너지 조절
- 채널 믹싱과 마스터 리미터
- WAV와 네 개 스템 내보내기
- MIDI, Handoff Sheet와 Delivery Bundle ZIP
- 로컬 프로젝트 저장·열기·복구

기본 첫 세션은 `Guided / 82 BPM / A minor / Lo-fi / 8-bar Starter Sketch`로 시작합니다. 상단 설정 영역에서 BPM과 Key를 편집하고 현재 `4/4` 고정 Time signature를 함께 확인할 수 있습니다. Studio 모드는 프로듀서가 Review Queue, Production Snapshot, Mix Coach와 Handoff Pack으로 바로 이동할 수 있는 빠른 경로를 제공합니다.

## 주요 기능

### 작곡

- 16스텝 드럼 시퀀서와 키보드 탐색
- 피치 기반 808/베이스와 신스 노트 그리드
- 코드 이벤트, 음 길이, 세기, 확률과 타이밍 편집
- Pattern 복제, 변형, Fill, Groove와 Accent 도구
- 스타일 프로필과 Beat Blueprint 기반의 편집 가능한 시작점

### 사운드와 믹스

- 내장 Drum Rack, Synth 808/Bass, Synth와 Chord 악기
- Drive, Glue, EQ와 Space send
- 채널 Volume, Pan, Mute와 Solo
- 마스터 자동화와 -6~0 dB 리미터 Ceiling
- Sound Snapshot과 Mix Snapshot 비교

### 편곡과 전달

- Intro, Verse, Hook, Bridge와 Outro 블록
- 섹션 복사, 분할, 병합, 이동과 길이 조절
- 전체 믹스 WAV와 네 개 스템 WAV
- Arrangement MIDI와 Handoff Sheet
- 프로젝트와 모든 전달 파일을 묶는 Delivery Bundle ZIP
- 내보내기 전 정확한 오프라인 WAV 미리 듣기

### 로컬 프로젝트 안전성

- `.grooveforge.json` 저장과 열기
- 자동 로컬 초안과 복구
- 여섯 개 로컬 Snapshot
- Undo/Redo와 교체·닫기 보호
- 저장 중 프로젝트가 바뀌는 비동기 경쟁 조건 방지

## 기술 구성

- React 19
- TypeScript 5.9
- Vite 8 / Rolldown
- Electron 39
- Web Audio 기반 실시간 재생과 결정론적 오프라인 렌더
- Node.js 22.12 이상

앱은 `file:` 기반 프로덕션 자산과 context-isolated preload bridge를 사용합니다. 프로젝트, 음원 렌더와 전달 파일은 로컬에서 처리하며, 계정·원격 AI·분석 추적·결제·클라우드 동기화를 기본 전제로 두지 않습니다.

## 빠른 시작

필수 환경:

- Node.js `>=22.12.0`
- npm
- macOS 데스크톱 패키징 검증을 실행하려면 macOS 도구 체인

의존성을 설치합니다.

```sh
npm install
```

개발용 웹 앱을 실행합니다.

```sh
npm run dev
```

프로덕션 빌드를 만듭니다.

```sh
npm run build
```

Electron 데스크톱 앱을 실행합니다.

```sh
npm run desktop
```

## 핵심 검증 명령

| 명령 | 확인 범위 |
|---|---|
| `npm run qa` | 저장소 구조, 문서, 정적 계약 |
| `npm run typecheck` | 웹과 Electron TypeScript |
| `npm run renderer:smoke` | 첫 화면과 주요 UI의 서버 렌더 |
| `npm run workflow:smoke` | 초보자와 프로듀서의 전체 작업 흐름 |
| `npm run persona:smoke` | 두 사용자층의 준비 상태와 전달 패키지 |
| `npm run sample-audio:qa` | 실제 WAV 렌더, 포맷, 레벨, 꼬리, 결정성, 격리 |
| `npm run desktop:smoke` | Electron entry, preload와 빌드 자산 |
| `npm run desktop:launch-smoke` | 실제 프로덕션 Electron UI와 접근성 |
| `npm run desktop:project-io-smoke` | 네이티브 저장·열기 roundtrip |
| `npm run harness:smoke` | 런타임 내보내기와 프로젝트 계약 |
| `npm run verify` | 로컬 전체 검증 체인 |
| `npm run release:check` | 완료 보고 전 로컬 릴리스 게이트 |

가장 빠른 기본 확인:

```sh
npm run qa
npm run typecheck
npm run renderer:smoke
npm run workflow:smoke
```

실제 음원까지 확인하는 로컬 검증:

```sh
npm run sample-audio:qa
```

전체 검증은 실제 Electron 실행, 로컬 패키지, 프로젝트 재열기와 릴리스 증거 생성을 포함하므로 시간이 오래 걸릴 수 있습니다.

```sh
npm run verify
```

모든 `desktop:*`, `release:*` 세부 명령과 운영 순서는 [영문 전체 명령 카탈로그](readme-en.md#commands), [릴리스 준비 문서](docs/release/readiness.md), [하네스 아키텍처](docs/architecture/harness.md), [품질 규칙](docs/quality/rules.md)에서 확인할 수 있습니다.

## 음원 QA

`npm run sample-audio:qa`는 내장 이벤트로 실제 오디오 파일을 생성하고 다음 항목을 검사합니다.

- Guided Lo-fi와 Studio House 전체 믹스 및 네 개 스템
- 지원하는 14개 스타일 프로필의 전체 믹스
- 44.1 kHz / 24-bit stereo signed PCM 디코딩과 실제 하위 바이트 신호
- 템포에 맞는 길이와 export tail
- 렌더 경계 뒤의 잔향과 마지막 digital zero
- Peak/RMS 분석, ceiling 안전성, full-scale 제외
- 스템 구분과 Solo/Stem 일치
- 한국어·일본어 파일명과 정규화
- 즉시 다시 렌더했을 때 byte-identical 결정성
- 관련 없는 프로젝트 변경이 대상 스템을 바꾸지 않는 격리
- 808, Sub, Walking, Pluck, Reese, Minimal Bass Voice와 실제 glide 렌더
- Delivery Bundle의 SoundCloud 업로드 시트와 Private-first 권리 체크

생성 파일은 `build/desktop/` 아래에 있으며 Git에 포함되지 않습니다. 자동 수치 검증은 사람의 최종 청취 판단을 대신하지 않습니다.

## 데스크톱과 배포 범위

로컬 검증은 다음 항목을 다룹니다.

- 프로덕션 Electron 앱 실행과 스크린샷 픽셀 증거
- 네이티브·패키지·PKG payload·가상 설치 경로의 프로젝트 IO
- macOS `.app`, DMG와 unsigned PKG 조립
- ad-hoc 서명과 hardened-runtime 준비 상태
- 업데이트 메타데이터와 외부 배포 체크리스트

Developer ID 서명, Apple notarization, Gatekeeper 승인, 실제 업데이트 피드 게시와 배포 채널 승인은 운영자 소유의 외부 단계입니다. 자격 증명이나 실제 URL이 없으면 하네스는 차단 상태를 값 없이 보고하며 외부 배포 완료를 주장하지 않습니다.

현재 외부 단계의 상세 명령과 증거는 [docs/release/readiness.md](docs/release/readiness.md)에 있습니다.

## 개인정보와 안전

- 실제 사용자 음원, 미공개 비트와 저작권 샘플 팩을 저장소에 넣지 않습니다.
- 자격 증명, 토큰, 개인 URL과 서명 identity 값을 문서나 QA 출력에 기록하지 않습니다.
- 원격 호출, 분석 추적, 광고, 결제와 광범위한 권한에는 명시적인 제품 근거가 필요합니다.
- 테스트는 내장 이벤트와 합성 fixture를 사용합니다.
- 외부 배포 관련 로컬 환경 파일은 Git에서 제외됩니다.

자세한 원칙은 [docs/privacy/principles.md](docs/privacy/principles.md)를 참고하세요.

## 에이전트 작업 흐름

모든 구현 작업은 활성 실행 계획에서 시작합니다.

```text
docs/exec_plans/active/plan-NNN-<task>.md
```

기능 작업은 `main`이 아닌 계획별 브랜치와 worktree에서 진행합니다.

```text
codex/plan-NNN-<task>
.worktree/plan-NNN-<task>
```

완료 순서:

1. QA
2. 별도 리뷰
3. 계획을 `docs/exec_plans/completed/`로 이동
4. `docs/reviews/`에 리뷰 미러 작성
5. `main` 병합과 푸시
6. 완료 브랜치와 worktree 정리

제품 원칙과 세부 작업 규칙은 다음 문서가 기준입니다.

- [제품 정의](docs/product/product.md)
- [제품 아키텍처](docs/architecture/product-architecture.md)
- [하네스 아키텍처](docs/architecture/harness.md)
- [품질 규칙](docs/quality/rules.md)
- [개인정보 원칙](docs/privacy/principles.md)
- [공식 출처](docs/references/official-sources.md)
- [활성 실행 계획](docs/exec_plans/active/)
- [완료 리뷰](docs/reviews/)

## 저장소 구조

```text
AGENTS.md
README.md          # 한국어 기본 문서
readme-en.md       # 기존 영문 전체 문서
electron/          # Electron main/preload와 데스크톱 통합
src/
  audio/           # 재생, MIDI, WAV/스템과 Delivery Bundle
  domain/          # 프로젝트 데이터와 정규화 규칙
  platform/        # 다운로드와 플랫폼 경계
  ui/              # React 워크스테이션
docs/
  architecture/
  exec_plans/
    active/
    completed/
  meetings/
  privacy/
  product/
  quality/
  references/
  release/
  reviews/
harness/
  scripts/
  templates/
```

## 언어 문서

- 한국어 기본 안내: [README.md](README.md)
- 기존 영문 전체 안내와 세부 운영 명령: [readme-en.md](readme-en.md)

한국어 README는 제품의 현재 방향과 일반적인 개발·검증 경로를 간결하게 설명합니다. 장기간 누적된 모든 릴리스 증거와 세부 명령 설명이 필요하면 보존된 영문 문서를 사용하세요.
