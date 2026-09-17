# plan-1536-rock-hiphop-usability Review

## Summary

Overview에서 패턴/구간 미리듣기 중 전체곡 버튼을 한 번 누르면 첫 마디부터 전체 편곡을 재생한다. Song map에는 각 구간 시작·종료 시각과 Arrange의 해당 블록을 선택하고 포커스하는 편집 버튼을 추가했다. Exports에는 전체 마디 수, 잔향 포함 WAV 예상 길이, stereo 44.1 kHz/24-bit 규격을 표시한다. 한영 문구와 좁은 화면 대응을 포함한다.

서로 다른 키·템포·합성 리프·후크를 가진 샘플 없는 오리지널 록/힙합 instrumental 5곡을 실제 production Electron 앱에서 편집·편곡·재생·믹싱·WAV 미리듣기·내보내기·저장·재열기했다. WAV는 모두 stereo 44.1 kHz signed PCM 24-bit이며, 저장한 프로젝트를 재렌더한 오디오와 byte-identical이다.

| 곡 | BPM | 키 | WAV 길이 |
|---|---:|---|---:|
| 비가 끝난 트랙 | 112 | E minor | 120.804초 |
| 유리 엔진 | 126 | F# minor | 122.655초 |
| 다시 뛰는 밤 | 138 | A minor | 112.054초 |
| 붉은 지평선 | 148 | D minor | 104.534초 |
| 마지막 불빛을 지나 | 156 | C minor | 99.212초 |

## QA

- `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `npm run typecheck`, `npm run build`, `npm run renderer:smoke`, `npm run workflow:smoke`, `npm run persona:smoke`, `npm run harness:smoke`, `npm run desktop:smoke`, `npm run quick-actions:bundle-smoke`가 통과했다.
- `npm run sample-audio:qa`가 16개 스타일의 WAV 43개를 검증했다. 기존 기본/전체/요청형과 신규 록/힙합 모드 self-test 모두 통과했으며 기존 세 모드의 입력 프로젝트 29개는 변경 전과 byte-identical이다.
- production `npm run desktop:launch-smoke`는 exit 0. 한 번의 전체곡 전환, 다섯 작업 화면, disclosure 25개, 드럼/노트 키보드, 메뉴·모달 포커스, 한국어 및 390px/1180px 화면 검사를 통과했다.
- `node --experimental-strip-types --import ./harness/scripts/register_ts_loader.mjs harness/scripts/run_desktop_multigenre_actual_app_qa.mjs --rock-hiphop-pack --skip-build`의 최종 batch `plan-1536-rock-hiphop-actual-app-qa-20260917T055154Z-64994`가 5/5 통과했다. 각 곡에서 arrangement 재생 진행, Electron audible 신호, WAV 미리듣기 audible 신호를 확인했다.
- 독립 full-PCM 검사에서 full-scale 샘플 0, 마지막 프레임 digital zero, 양채널 신호, 헤더·길이 정합을 확인했다. sample peak는 −4.070~−1.297 dBFS, RMS는 −21.221~−19.305 dBFS다. 첫 batch 전곡 검사와 최종 전달 WAV의 SHA는 5/5 일치한다.
- CUA로 production 앱의 Song map → Hook 편집 → Arrange Timeline 3번 블록 선택·포커스와 Exports의 전체곡 규격 안내를 직접 확인했다.
- 패키지의 deep strict ad-hoc 서명 검증을 통과했다. 설치한 `/Applications/GrooveForge.app`의 index/main/preload 산출물 SHA 3/3이 검증된 패키지와 일치한다. 이전 설치본은 `/Applications/GrooveForge Backup plan-1536 2026-09-17-150439.app`에 보존했다.

## Findings

- 첫 실제 앱 batch는 5곡의 편집·재생·저장·재열기를 통과했으나 최종 감사에서 Intro mute 배열 순서와 저장 시 canonical 순서가 달라 실패했다. 신규 composition의 순서와 사전 검사를 수정하고 새로운 입력으로 전체 batch를 재실행했다. 감사 기준은 완화하지 않았다.
- 기존 desktop entry smoke의 오래된 Save path 기대값을 현재 네 fallback 경로와 일치시켰다. 새 파일의 한글 머리말과 renderer smoke helper 이름 오류도 수정한 뒤 해당 검사를 재실행했다.
- QA 완료 후 독립 reviewer가 UI session guard·편집 이동·시간/규격 문구, 실제 앱 원본 보고서, source/build provenance, PCM 헤더·길이, Downloads 해시와 청취 페이지 링크를 검토했다. 최종 남은 P0~P3 지적은 0개다.

## Delivery

최종 폴더는 `/Users/taejungkim/Downloads/GrooveForge_록힙합_5곡_SoundCloud_2026-09-17_145917`이다. `00-SoundCloud-WAV/`에 제목이 포함된 WAV 5개를 모았으며, `먼저-듣기.html`은 오디오를 로컬 파일에서 재생하는 청취 페이지다. 곡별 편집용 프로젝트, 업로드 안내, 제작 브리프, 기술 QA와 화면 증거를 포함한다.

54개 파일·305,250,055바이트를 전달했으며 source/copy SHA 54/54, 최종 checksums 53/53 및 청취 페이지 로컬 링크 16개를 확인했다. 실패·성공 실행과 최종 설치 영수증 등 증거는 메인 작업 폴더의 ignored `build/desktop/plan-1536-completion-evidence/`에 보존한다. 오디오·패키지·사용자 데이터는 Git에 커밋하지 않는다.

SoundCloud [공식 업로드 규격](https://help.soundcloud.com/hc/en-us/articles/360039171614-Upload-Requirements)을 확인해 무손실 WAV로 전달했다. 계정 로그인·업로드·공개는 수행하지 않았다.

## Limits

실제 기타 녹음이나 보컬이 포함되지 않은 합성 악기 기반 instrumental이다. 자동 PCM/peak/RMS 검사와 앱 재생 확인은 사람의 전곡 청음이나 음악적 완성도 판단, LUFS/true-peak 측정, 전문 마스터링 또는 SoundCloud 변환 스트림 청취를 대신하지 않는다. 업로드 시트의 사용자별 아티스트·크레딧·라이선스 정보는 업로드 전에 채워야 한다.
