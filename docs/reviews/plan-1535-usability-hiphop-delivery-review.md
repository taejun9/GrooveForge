# plan-1535-usability-hiphop-delivery Review

## Summary

Overview에 선택형 90~180초 장곡 목표 안내를 추가했다. 현재 BPM과 편곡 마디 수로 실제 WAV 예상 길이, 목표까지 필요한 마디, 64마디 한도를 보여 주고 Arrange로 바로 이동할 수 있다. 기본 8마디 비트 제작 흐름은 장곡 목표를 펼치기 전까지 그대로 유지된다.

요청형 실제 production Electron QA는 샘플 없는 오리지널 instrumental 7곡의 Open/edit/Arrange/Mix/Deliver/WAV/Save/reopen을 통과했다. 그중 건조한 랩 포켓의 첫 세 곡을 정확한 3곡 manifest와 체크섬으로 새로 선별해 Downloads의 `GrooveForge_오리지널_랩비트_3곡_SoundCloud_2026-09-15_174311` 폴더에 저장했다. 최상위 `00-SoundCloud-WAV/`의 세 WAV는 118.333초, 115.761초, 113.298초이며 stereo 44.1 kHz signed PCM 24-bit다.

## QA

- 최종 수정본에서 `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `npm run typecheck`, `npm run renderer:smoke`, `npm run build`가 통과했다. 길이 경계, BPM별 마디 계산, 한영 안내, 접근성과 Arrange 라우팅을 확인했다.
- `npm run sample-audio:qa`는 16개 스타일의 43개 WAV를 검증했다. `npm run desktop:requested-hiphop-qa`는 7/7개의 실제 앱 편집·내보내기·저장·재열기와 오디오/프로젝트/화면 증거를 확인했다.
- 최종 production `npm run desktop:launch-smoke`는 exit 0이었다. 새 안내를 포함한 native disclosure 25개(기본 열림 1, 닫힘 24)의 내용·Tab 누출은 0개였다.
- Downloads 최종 위치에서 30개 파일·97,455,998바이트를 확인했다. source/copy SHA-256은 30/30 일치하고 최종 `checksums.sha256`의 29/29 경로가 실제 3곡 inventory와 일치한다. WAV·프로젝트·한글 업로드 시트는 3/3개이며 저장 프로젝트의 즉시 재렌더도 3/3개 byte-identical이었다.

## Findings

- 수정된 P2: 펼쳐진 장곡 목표가 정상 첫 사용자의 8마디 starter를 목표 미달로 표시했다. 안내를 기본으로 접힌 선택형 목표로 바꾸고 첫 비트 제작 흐름을 다시 확인했다.
- 수정된 P2: 89.980771초처럼 90초 직전의 WAV가 `1:30`으로 표시되어 미달 판정과 모순됐다. 시간 표시와 판정을 같은 centisecond 정수 기준으로 맞추고 미달은 내림, 초과는 올림 처리했다.
- 수정된 하네스 회귀: 새 Overview 안내가 25번째 native disclosure가 되면서 기존 24개/닫힘 23개 기대값 때문에 launch smoke가 처음 실패했다. 실제 DOM inventory와 성공 로그를 25개/닫힘 24개로 갱신한 뒤 production smoke를 재실행해 통과했다.
- 최종 독립 리뷰에서 남은 P0~P3 지적은 없었다.

## Residual Risk

- 자동 PCM·peak/RMS·체크섬 검증은 사람의 전곡 청음, 음악적 완성도 판단, LUFS/true-peak 확인이나 SoundCloud 변환 스트림 청취를 대신하지 않는다.
- 한글 업로드 시트의 아티스트, 권리자, 실제 기여자/크레딧, 라이선스와 권리가 확인된 아트워크는 아직 자리표시자다. 사용자가 이 정보를 채우고 권리를 확인해야 한다.
- SoundCloud 로그인·업로드·공개, 수익화·배급·Content ID 변경은 수행하지 않았다.

## Follow-Ups

1. 사용자가 세 곡을 처음부터 끝까지 듣고 메타데이터·권리·아트워크와 최종 마스터링을 확인한다.
2. SoundCloud에 처음 올릴 때 Private와 Downloads Off를 유지하고, 처리된 스트림을 다시 듣는다.
