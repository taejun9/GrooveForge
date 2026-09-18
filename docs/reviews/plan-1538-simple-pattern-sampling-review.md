# plan-1538-simple-pattern-sampling Review

## Summary

간단/전체 도구 전환으로 핵심 작곡·편곡·믹서·내보내기에 집중할 수 있게 했다. 표시 설정은 앱 재시작 후 유지되며 프로젝트나 Undo 기록을 바꾸지 않는다. 개인 패턴 보관함은 선택한 A/B/C의 이벤트를 이름과 함께 저장하고, 다른 프로젝트에서 선택한 슬롯으로 불러오기·조성 맞추기·Undo·이름 변경·삭제를 지원한다.

선택적 샘플링은 짧은 로컬 WAV를 네 드럼 레인에 매핑한다. 구간·볼륨·미리 듣기·제거와 프로젝트 내 PCM 보관, 재생·WAV·Drums stem·재열기를 연결했다. 입력은 2 MB 이하의 0.01–2초 WAV이며 네 레인의 원본 길이 합은 2초로 제한한다. 변환 시 anti-alias 필터를 적용하고 같은 샘플레이트의 PCM과 샘플 없는 기존 렌더 결과를 보존한다. 상세 사용법은 [개인 도구](../product/personal-tools.md)를 따른다.

## QA

최종 anti-alias 수정 이후 `npm run release:check`를 단일 명령으로 다시 실행하여 2026-09-18 16:45:58 KST에 exit 0으로 완료했다. 전체 소요 시간은 4760.777635초이며 210개 소스 fingerprint에 mismatch가 없다. 앞선 두 통과 게이트를 최종 수정본의 증거로 대신하지 않았다.

- 수정된 실제 설치본의 개인 도구 QA는 native mouse/keyboard와 격리된 영속 저장소로 수행했다. 간단 화면 전환·프로세스 재시작, 패턴 저장·불러오기·Undo·이름 변경·다른 프로젝트 재사용·삭제, 샘플 가져오기·구간·볼륨·제거 Undo·프로젝트 저장/재열기·정확한 WAV 재렌더가 모두 통과했다. 화면 증거 네 장을 확인했다.
- 실제 설치본으로 요청한 오리지널 3곡과 기존 16장르를 순차 검사했다. 19개 자식 실행이 모두 exit 0이며 편곡 진행·가청 표본·WAV 미리듣기·내보내기·저장·재열기·정확한 재렌더를 확인했다. 후속 앱 프로세스가 남지 않았고 모든 보고서가 동일한 설치본을 식별한다.
- 세 곡은 모두 stereo 44.1 kHz PCM24이고 90–180초 범위다. 전곡 PCM 감사에서 양채널 신호·완전한 프레임·full-scale sample 0·digital-zero 종료를 확인했다. 세 WAV와 16장르의 sample-free WAV 해시는 anti-alias 수정 전후 동일하다.
- 최종 설치본은 54개 빌드 파일을 비교했으며 content SHA-256은 `8f790aa9fb2a831c8fe116b896559c68cdf88f81217048f13d702cb1efcbfd45`, 실행 파일 SHA-256은 `b189d96aa27b44438debb5b7a2d475fce17811c775f05f86130037efffd8f471`이다. 보존한 정확한 빌드 및 최종 게이트의 재빌드와 일치한다. 원래 설치 앱은 별도 backup으로 보존했다.

완료 문서 이동 후 `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `git diff --check`, `npm run release:completion-summary-refresh-smoke`를 실행한다. 실제 종료 코드와 시간은 ignored `plan-1538-completion-doc-qa-receipt.json`에 기록한다.

## Findings and Review

첫 음악 검사에서 샘플 꼬리가 기존 tail보다 긴 세 번째 곡의 QA 예상 길이가 잘못되어 9,342프레임 차이를 보고했다. 실제 렌더와 저장은 정상이며, in-app QA 및 standalone movement 조립의 기대 길이를 샘플 trim과 Space tail에 맞췄다. 샘플 없는 CLI 출력의 byte 동일성과 서로 다른 sampled tail을 회귀 검사에 추가했다.

두 번째 전체 게이트 이후 독립 audio 리뷰에서 44.1→22.05 kHz의 기존 linear decimator가 18 kHz와 22 kHz를 각각 4.05 kHz와 50 Hz로 접는 P2 결함을 발견했다. Blackman-windowed sinc 변환과 전체 입력 프레임의 non-finite 검사를 추가했다. 44.1/48/192 kHz stopband·1/8 kHz passband·동일 rate PCM/float·최대 길이/비정규 rate 검사가 통과했다. 기존 리뷰 재현 probe에서도 alias가 억제되었고 sample-free 동작은 유지되었다.

독립 evidence 리뷰의 P3 지적에 따라 영어 README와 privacy 문서의 과거 “sampling later” 설명을 현재 선택적 원샷 지원에 맞췄다. 완료 audit의 오래된 문자열 판정도 수정했다. 초기 실패·이전 통과 게이트·수정 전 probe는 최종 증거와 구분하여 보존한다.

최종 전체 게이트 이후 구현에 참여하지 않은 UI/pattern, audio, harness/evidence 리뷰어 세 명이 후속 검토를 승인했다. 최초 audio probe를 변경 없이 다시 실행했으며 alias 성분은 수정 전 대비 18 kHz 입력에서 96.42 dB, 22 kHz 입력에서 130.38 dB 감소했다. 1 kHz 통과 음량 변화는 −0.000236 dB였다. 추가 rate 경계·마지막 frame의 NaN/Infinity와 sample-free byte parity도 통과했다. 현재 범위의 미해결 P0–P3 지적은 없다. 원본 및 후속 리뷰·probe는 `plan-1538-support-evidence/`에 보존한다.

## Delivery

`Downloads/GrooveForge-SoundCloud-2026-09-18-3Tracks`에 35개 파일, 199,248,744 bytes를 전달했다. `00-SoundCloud-WAV/`에 완성 믹스 세 개를 모으고 편집 가능한 프로젝트, 한국어 업로드 문구·제작 브리프, 직접 합성한 원샷 원본, 화면·sanitized QA를 분리했다. 전체 inventory와 SHA-256이 원본과 일치하며 34개 checksum 항목을 검증했다.

| 곡 | BPM / 조성 | 길이 |
|---|---|---:|
| 콘크리트 문장 | 94 / C minor | 133.723초 |
| 영하의 시선 | 142 / F-sharp minor | 108.919초 |
| 숨 사이의 칼날 | 110 / D minor | 123.212초 |

요청한 랩 스타일의 강한 드럼·어두운 저역·보컬 공간을 참고한 오리지널 instrumental이다. 세 번째 곡은 직접 합성한 금속성 원샷을 사용한다. 기존 녹음·보컬·가사를 사용하지 않았으며 SoundCloud 로그인·업로드·공개는 수행하지 않았다.

## Limits

샘플링은 원샷 드럼 확장이며 긴 오디오 클립 편집·마이크 녹음·time stretch는 포함하지 않는다. 패턴 보관함은 이벤트를 저장하므로 악기·샘플·템포·믹서·편곡은 불러올 프로젝트의 설정을 따른다.

자동 가청 표본·전곡 PCM·sample peak/RMS 검사와 앱 재생 확인은 사람의 전곡 청음, LUFS/true-peak 측정 또는 전문 마스터링을 뜻하지 않는다. 로컬 ad-hoc 서명과 설치 QA는 외부 배포용 Developer ID·공증 증거가 아니다.

## Evidence and Integration

[완료 계획](../exec_plans/completed/plan-1538-simple-pattern-sampling.md)에 구현·QA·독립 리뷰를 기록한다. 원본 증거는 통합 후 ignored `build/desktop/plan-1538-completion-evidence/`에 보존한다. 주요 진입점은 `plan-1538-antialias-release-gate-receipt.json`, `plan-1538-antialias-tested-source.json`, `plan-1538-antialias-installed-identity.json`, `plan-1538-antialias-downloads-delivery-receipt.json`과 `plan-1538-support-evidence/`이다.

문서 QA 이후 전용 branch를 main에 통합·push하고 증거를 보존한 뒤 해당 worktree와 병합된 branch만 정리한다. 실제 commit·remote·최종 소스·설치본 동일성 및 정리 결과는 `integration-receipt.json`에, 원본 절대경로와 보존 위치의 연결은 `relocation-map.json`에 남긴다. 원래 설치본 backup과 다른 작업의 worktree는 유지한다. 다른 checkout에서 새로 만든 빌드를 이미 QA한 설치본과 동일하다고 주장하지 않고 보존된 정확한 빌드와 비교한다.
