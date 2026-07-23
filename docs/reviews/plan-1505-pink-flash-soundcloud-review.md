# plan-1505-pink-flash-soundcloud review

## Review Result

PASS — blocking findings 없음.

## Scope

- ZENA 타기팅 곡 `핑크 플래시 (Pink Flash)`의 SoundCloud용 24-bit WAV
- BPM, Key, 장르, 분위기, 태그, 설명, 권리·공개 기본값 문서
- 원본 음악 상태 보존과 공식 참여 오인 방지

## Evidence

- 원본 GrooveForge 프로젝트: 150 BPM, F minor, 4/4, Jersey profile, 64 bars, master ceiling -3dBFS
- 출력: RIFF/WAVE signed PCM, stereo, 44.1kHz, 24-bit, block align 6
- 길이: 103.15초 / 4,548,915 frames
- peak / RMS: -3.000 / -19.832dBFS
- full-scale samples: 0, final-frame peak: 0
- 24-bit lower-byte activity: 9,062,277 samples (99.609%)
- 출력 SHA-256: `be2713ccc4aaebc4f8bd1e2146e06e91b5fe23bcf6d7418484de50ba6cf38654`
- 현재 렌더러의 16-bit 결과와 기존 전달 WAV SHA-256가 `a1f6fd664d8cbc22a95dc3da5c09d3909afdc828531abbb6a966f6663d02d2d5`로 일치
- `file`, `afinfo`, 별도 Node PCM parser가 24-bit header, frame count, 하위 바이트 신호, 무클리핑, digital-zero 종료를 독립 확인
- `python3 harness/scripts/run_qa.py`: PASS
- `python3 harness/scripts/run_quality_gate.py`: PASS

## Music and Metadata Review

- `Dance & EDM`을 주 장르로, `Jersey Club / Playful Drum & Bass Pop / K-pop Performance`를 상세 장르로 정리한 것은 빠르고 장난스러운 퍼포먼스 중심 편곡과 일치한다.
- Playful, bold, kinetic, cheeky, colorful, high-energy, futuristic, camera-ready, confident 분위기 표기는 셔터 전환형 표정·포즈와 챈트 훅 콘셉트를 설명한다.
- BPM과 Key는 SoundCloud 설명과 영어 태그에도 포함해 별도 필드가 없을 때 검색·식별 정보를 보완한다.
- 제목에 `Target Pitch Demo [Instrumental]`을, 설명에 비공식 독립 데모·무소속·무승인 고지를 넣어 ZENA/RESCENE의 공식 발매나 참여 음원으로 오인될 위험을 낮췄다.

## Rights and Release Review

- Artist 필드는 ZENA/RESCENE가 아니라 업로더의 실제 프로듀서명을 사용한다.
- 초기값은 Private, Downloads Off, All Rights Reserved, monetization/distribution Off다.
- 설명의 `[YOUR ARTIST NAME]`, `[YOUR NAME / RIGHTS HOLDER]`는 업로드 전에 실제 값으로 교체해야 한다.
- ZENA 사진, RESCENE 로고·앨범 아트, 소속사 자산은 별도 허가 없이 artwork에 사용하지 않는다.
- 실제 SoundCloud 업로드와 공개 전환은 이번 범위에 포함하지 않는다.

## Residual Risks

- 본 문서는 업로드 기술 준비이며 아티스트·소속사 승인이나 법률 자문을 대체하지 않는다.
- 향후 보컬, 외부 sample, 공동작업자 또는 제3자 artwork가 추가되면 권리 검토를 다시 해야 한다.
- SoundCloud 정책과 입력 UI는 변경될 수 있으므로 실제 게시 시 공식 도움말을 최종 확인한다.
