# 2026-07-24 Project Library Storage Meeting

## Context

사용자는 GrooveForge로 만든 음악 프로젝트 정보가 Windows 현재 사용자 폴더 바로 아래 `GrooveForge`에 저장되고, 내부가 폴더별로 정리되기를 요청했다. 첫 합의 뒤 정보 저장에 SQLite3를 사용한다는 요구를 추가했다. 팀은 현재 native Save/Open, renderer local draft, Electron/SQLite runtime, 파일 format/size 경계, local-first/privacy 원칙을 다시 검토했다.

## Findings

- 현재 데스크톱 Save는 매번 OS dialog를 열고 기본 파일명만 제안한다. 저장 위치는 `GrooveForge` 작업공간으로 고정되지 않는다.
- 편집 중 프로젝트 JSON은 renderer `localStorage`의 단일 bounded recovery record로 남지만 사용자가 볼 수 있는 홈 폴더에는 없다.
- 프로젝트 `.grooveforge.json`은 `fileVersion: 1`, 1,500,000-character/6,000,000-byte 제한, Unicode/Windows-safe filename, import normalization 계약을 이미 가진다.
- Electron main process가 native 파일 경로와 권한을 소유하므로 사용자 home 확인과 관리형 디렉터리 쓰기도 그 경계에 두는 것이 적절하다.
- `C:\Users\<name>`을 문자열로 조립하면 이동되거나 다른 드라이브에 있는 Windows 프로필을 깨뜨리고 사용자명 추측 및 권한 문제를 만들 수 있다.
- WAV/Stem/MIDI/Handoff/Bundle은 현재 browser download 경계를 사용한다. 이를 관리형 폴더로 옮기려면 대용량 IPC, 충돌 이름, 부분 실패 및 완료 피드백을 별도로 설계해야 한다.
- 현재 Electron 39는 Node 22와 SQLite3 `node:sqlite`를 내장한다. 별도 npm native addon 없이 main process에서 사용할 수 있다.
- npm `sqlite3` addon은 현재 upstream에서 deprecated/unmaintained로 표시되며 Electron ABI rebuild와 packaged native binary/codesign 범위를 추가한다.

## Decisions

- Electron의 실제 current-user home 아래 `GrooveForge`를 사용한다. 일반 Windows에서는 `C:\Users\<현재 사용자>\GrooveForge`가 된다.
- 1차 폴더 구조는 `Projects`와 `Data`로 제한한다.
- `Projects`는 사용자가 명시적으로 저장한 `.grooveforge.json`의 기본 위치다.
- `Data/grooveforge.db`는 schema-versioned SQLite3 database이며 saved-project mirror와 편집 중 최신 bounded project JSON recovery 한 건을 저장한다.
- 외부 npm addon 대신 Electron 내장 `node:sqlite`를 main-process adapter 뒤에서 사용한다.
- 폴더는 앱 설치나 무조건적인 시작 때가 아니라 첫 Save/Open 또는 recovery write 때 일반 사용자 권한으로 지연 생성한다.
- 관리형 경로와 DB schema는 main process가 결정한다. renderer는 raw SQL, database path, 임의 절대 recovery 경로를 넘길 수 없다.
- native project file은 같은 디렉터리의 임시 파일을 flush한 뒤 교체한다. SQLite는 STRICT JSON 제약, parameter binding, WAL, FULL synchronous, bounded busy timeout, short transaction, application id와 integrity check를 사용한다.
- explicit Save는 portable file을 먼저 확정하고 같은 snapshot을 SQLite catalog에 mirror한다. DB mirror 실패는 파일 저장 성공과 구분해 경고한다.
- recovery는 750ms debounce 뒤 SQLite singleton row에 기록하며 dirty/clean 상태를 바꾸거나 명시적 Save를 대신하지 않는다.
- 기존 localStorage recovery와 browser download/import fallback은 유지한다.
- 프로젝트 format은 v1을 유지한다. 위치 기능만으로 project id나 schema migration을 도입하지 않는다.
- catalog storage identity는 absolute path 자체가 아니라 SHA-256 location key다.
- 정상 앱 실행은 single-instance로 제한해 전역 latest recovery 행을 여러 프로세스가 덮지 않게 한다. smoke는 주입된 별도 workspace를 사용한다.
- POSIX의 관리형 폴더는 `0700`, project/database와 SQLite sidecar는 `0600`으로 제한하고 Windows에서는 사용자 profile ACL을 따른다.
- recovery save IPC 응답은 project JSON을 되돌려 보내지 않고 저장 시각만 반환한다.
- 명시적 Clear가 SQLite 응답을 기다리는 동안 project/recovery가 바뀌면 새 local recovery와 예약된 DB write를 보존한다.
- portable project-id, 같은 제목 프로젝트별 폴더 격리, backup rotation/restore, Trash, managed Exports는 후속 범위다.
- 로그와 QA evidence에는 실제 사용자명, 전체 home path, 실제 프로젝트 title/body를 남기지 않는다.

## Open Questions

- 같은 제목의 여러 프로젝트를 프로젝트별 폴더로 격리할 때 portable `projectId`를 파일 schema에 넣을지 SQLite catalog identity로 둘지 후속 회의가 필요하다.
- Backups의 보존 개수·용량과 restore UX를 어떻게 구성할지 후속 설계가 필요하다.
- Mixes, Stems, MIDI, Handoff, Bundles를 프로젝트별 Export Library로 보낼 때 기존 browser fallback과 native artifact IPC를 어떻게 나눌지 후속 설계가 필요하다.
- 실제 Windows packaged build에서 redirected home, Korean username, disk-full/file-lock를 어떻게 수동 검증할지 release QA 절차에 추가해야 한다.

## Follow-Ups

- plan-1519에서 managed Projects 기본 위치, SQLite catalog/recovery, atomic project writer, 임시 home과 production Electron 기반 QA를 구현한다.
- plan-1520 후보로 project identity/catalog, backup rotation/restore, managed Export Library 범위를 다시 회의한다.
