# plan-1527-single-word-actual-app-song

## Status

active

## Owner

project_lead / plan_keeper / harness_builder / quality_runner / review_judge / privacy_guard

## User Request

공개 참고곡 `https://www.youtube.com/watch?v=Fx6KV3HLfTI`처럼 짧은 특정 단어를 중심으로 한 독특한 곡을 하나 만들되, 길이는 1분 50초~2분 30초로 하고 SoundCloud에 올릴 수 있는 한글 자료와 함께 Downloads에 정리한다.

## Goal

참고곡의 짧은 길이, 반복되는 언어 훅, 빠른 electronic/dance 에너지라는 넓은 아이디어만 분석해, 멜로디·가사·화성·음색·편곡을 복제하지 않는 137 BPM / F-sharp minor 오리지널 곡 `틈`을 만든다. 실제 GrooveForge Electron 앱에서 sample-free instrumental project를 64 bars로 제작·저장·재열기·WAV export하고, 사람 목소리를 복제하지 않은 deterministic formant synthesis로 한국어 단어 `틈`만 말하는 전자 보컬 레이어를 조립한다. 최종 stereo 44.1kHz signed PCM 24-bit WAV, 재편집 프로젝트, 한글 SoundCloud 자료, QA 보고서와 SHA-256 manifest를 Downloads의 새 폴더에 전달한다.

## Creative Boundary

- 참고곡의 멜로디, 가사 배열, D major 화성, 143 BPM, 보컬 음색, 드럼 패턴, 구간별 편곡 또는 인식 가능한 시그니처를 복제하지 않는다.
- 공개 메타데이터상 참고곡은 1:54, 143 BPM, D major, Dance/Pop이며 짧은 영어 긍정 문구를 반복한다. 새 곡은 137 BPM, F-sharp minor, 다른 음정·리듬·구조와 한국어 한 단어 `틈`을 사용한다.
- 최종 vocal semantics는 `틈` 하나뿐이다. 분절·게이트·리버스·피치 변형은 허용하되 다른 단어나 문장을 넣지 않는다.
- 참고 음원 PCM을 다운로드, 추출, 샘플링, 변형 또는 결과물에 포함하지 않는다.
- 합성 보컬은 특정 실존 인물의 목소리나 생체 특징을 모사하지 않는 자체 formant/glottal/noise synthesis여야 한다.

## Sources

- YouTube reference: `https://www.youtube.com/watch?v=Fx6KV3HLfTI` — title `OK YES`, credited to pluko and Reo Cragun, visible duration 1:54.
- Beatport metadata: `https://www.beatport.com/track/ok-yes/20547284` — Dance / Pop, 143 BPM, D Major, 1:54.
- Shazam metadata: `https://www.shazam.com/song/1743977230/ok-yes` — short repeated-language hook and 143 BPM; no lyrics will be copied into project artifacts.
- SoundCloud upload requirements: `https://help.soundcloud.com/hc/en-us/articles/360039171614-Upload-Requirements`.
- SoundCloud privacy: `https://help.soundcloud.com/hc/en-us/articles/46020211210523-Edit-your-track-s-privacy-settings`.
- SoundCloud permissions: `https://help.soundcloud.com/hc/en-us/articles/31423603670043-Manage-your-track-s-permissions`.

## Context Map

- Project model and generation: `src/domain/workstation.ts`, `src/ui/App.tsx`
- Audio render/export: `src/audio/render.ts`
- Actual Electron QA: `electron/main.ts`, `harness/scripts/run_desktop_manual_qa.mjs`
- Movement assembly precedent: `harness/scripts/assemble_grooveforge_movements.mjs`
- SoundCloud handoff: `src/audio/soundcloud.ts`, `src/audio/deliveryBundle.ts`
- Quality and privacy rules: `docs/quality/rules.md`, `docs/privacy/principles.md`

## Constraints

- QA and review are separate loops.
- Work only on `codex/plan-1527-single-word-actual-app-song` and `.worktree/plan-1527-single-word-actual-app-song` until completion.
- Use an isolated plan-owned Electron workspace, non-persistent partition, separate userData, and fresh Open/Save/export paths. Do not read or modify the user's normal project database or recovery draft.
- The instrumental source of truth must be the project saved and reopened through the actual app. Direct project-JSON mutation must not be presented as UI creation.
- Keep the product sample-free and event-based. The one-off post-export formant voice layer must not add general audio-import, sampler, cloud, account, analytics, or remote-AI scope.
- Target 64 musical bars at 137 BPM: about 112.12 seconds before the tempo-aware render tail, inside the requested 110–150 second range.
- Final WAV must be 110–150 seconds, stereo 44.1kHz signed PCM 24-bit, sample peak at or below -1.0dBFS, full-scale samples 0, low DC, click-safe boundaries, deterministic output, and terminal digital zero.

## Implementation Plan

- [x] Preserve reference metadata and document a non-imitative creative palette.
- [x] Establish a fresh actual-app starter project through the visible product path and prove its provenance.
- [x] Build a 64-bar 137 BPM / F-sharp minor instrumental with Pattern A/B/C, distinct density changes, and an original 8+16+8+16+8+8-bar arc.
- [x] Save, export, reopen, and exactly verify the project through native Electron UI interactions.
- [x] Add a deterministic, non-human formant vocal layer whose only semantic word is `틈`.
- [x] Mix and export a final stereo 44.1kHz signed PCM 24-bit WAV within 1:50–2:30.
- [x] Create Korean SoundCloud metadata, rights/privacy checklist, production report, editable project, evidence, and manifest.
- [x] Run repository, actual-app, audio, privacy, file-set, checksum, and source-preservation QA.
- [ ] Complete a separate post-QA review, deliver to a new Downloads folder, and revalidate at the destination.

## Arrangement Direction

1. 8 bars — filtered negative-space intro; isolated `틈` consonant/vowel fragments.
2. 16 bars — elastic verse groove; full word appears as sparse off-beat punctuation.
3. 8 bars — tension corridor; drums thin out while the word becomes a gated rhythmic texture.
4. 16 bars — first full release; wider synth and denser one-word call/response.
5. 8 bars — inverted-space break; only bass pulse, noise, and distant word tail.
6. 8 bars — final compact peak and abrupt-but-click-safe terminal release.

## QA Plan

- Verify actual UI Open/Create, metadata, pattern/arrangement edits, Mix/Deliver, WAV export, Save, and live reopen evidence.
- Verify the saved/reopened project is exactly 137 BPM, F-sharp minor, 64 bars, with the intended arrangement, automation, and preserved musical events.
- Independently parse final PCM24 header, frames, duration, peak, RMS, DC, full-scale count, lower-byte activity, terminal samples, deterministic repeat hash, and vocal-event timing.
- Confirm the reference audio was not downloaded or embedded and the final package contains no reference title/artist claims as authorship or copied lyric text.
- Run `npm run typecheck`, `npm run build`, relevant renderer/workflow/desktop smokes, `python3 harness/scripts/run_qa.py`, `python3 harness/scripts/run_quality_gate.py`, and `git diff --check`.
- Audit the final package for missing/extra/symlinked files, local absolute-path leakage, checksums, SoundCloud placeholders, rights checks, Private-first, Downloads Off, and human-listening boundaries.

## Review Plan

After QA, review_judge independently checks non-imitation, actual-app provenance, source preservation, one-word-only vocal semantics, 110–150 second length, PCM24 signal safety, package privacy, Korean SoundCloud completeness, and external-action boundaries. Findings must be fixed and retested before completion.

## Decision Log

| date | decision | reason |
|---|---|---|
| 2026-08-15 | Use the Korean word `틈` as the sole lyric and title concept. | It is semantically and phonetically distinct from the reference phrase, works as a one-syllable percussive token, and supports a gap/negative-space arrangement concept. |
| 2026-08-15 | Use 137 BPM and F-sharp minor rather than the reference's 143 BPM / D major. | The new tempo and tonal center support an original identity while preserving only the broad compact electronic energy requested. |
| 2026-08-15 | Make the instrumental in the actual app, then add a deterministic non-human formant layer after export. | GrooveForge is event-based and does not import or synthesize spoken audio; this keeps app provenance honest without turning sampling into a product feature. |
| 2026-08-15 | Do not perform the actual SoundCloud upload. | Artist/rightsholder identity, rights confirmation, publication, and processed-stream listening require the user's final decision and account action. |
| 2026-08-15 | Discard a delegated `/tmp` reference-audio analysis and remove every downloaded copy and helper before composition. | The approved creative boundary uses only visible/public metadata and must not depend on extracted reference PCM, melody, cadence, or production fingerprint. |
| 2026-08-15 | Preserve the source arrangement's existing section labels while implementing the intended sonic arc through Pattern C/B assignments, energy, mutes, and bar lengths. | The first isolated UI run failed closed because macOS did not commit a native `Bridge` option change. The fresh successful run kept the harmless labels and produced the intended 8+16+8+16+8+4+4-bar sound structure without direct JSON mutation. |
| 2026-08-15 | Keep the synthetic word layer as a strict local post-render artifact rather than changing the GrooveForge project schema. | The product remains event-based and sample-free, while the final deliverable can contain an original non-human voice texture with explicit provenance and deterministic QA. |

## Progress Log

| date | role | note |
|---|---|---|
| 2026-08-15 | project_lead | Opened the user-provided YouTube page read-only, dismissed a promotional overlay, and verified the visible title, credits, and 1:54 duration without downloading reference media. |
| 2026-08-15 | project_lead | Cross-checked public Beatport/Shazam metadata, chose a deliberately different word, tempo, key, and arrangement concept, and created the dedicated branch/worktree. |
| 2026-08-15 | privacy_guard | A delegated analysis disclosed three downloaded reference-audio copies and helper directories under `/tmp`; the lead verified the exact paths, excluded all audio-derived findings, removed all six temporary targets, and confirmed they no longer exist. |
| 2026-08-15 | project_lead | Created the seed through the visible GrooveForge Electron UI at 137 BPM / F-sharp minor / Experimental, applied Pocket/Push/Tight timing moves to Pattern A/B/C, wrote the Korean Session Brief, saved the durable project, and retained a UI screenshot and passive observations. |
| 2026-08-15 | harness_builder | The first isolated movement run failed closed on the native `Bridge` select option and wrote a failure report/screenshot. No failed-run project or WAV will be delivered. |
| 2026-08-15 | harness_builder | A fresh movement workspace passed native Open, seven-block 64-bar arrangement, length-bound Intro/Outro automation, WAV export, Save, live reopen, source-hash preservation, and exact arrangement/automation checks. The instrumental is 112.866802721 seconds, stereo 44.1 kHz signed PCM 24-bit. |
| 2026-08-15 | harness_builder | Added a strict local formant renderer and placed eight bounded `/tʰɯm/` events over the actual-app instrumental. Three clean runs were byte-deterministic; the input hash and 4,977,426-frame duration remained unchanged. |
| 2026-08-15 | quality_runner | Independently parsed the final mix and dry voice stem. The final mix is 112.866802721 seconds, stereo 44.1 kHz PCM24, peaks at -1.200002542 dBFS, has zero full-scale samples, low DC, active lower bytes, click-bounded word events, and terminal digital zero. |
| 2026-08-15 | doc_gardener | Staged an eight-file Korean SoundCloud package with final mix, instrumental, dry synthetic stem, editable project, upload copy, production QA report, redacted synthesis report, and a passing SHA-256 manifest. |
| 2026-08-15 | quality_runner | Passed syntax, typecheck, build, renderer/workflow/desktop smokes, manual-QA safety self-test, repository QA, quality gate, diff check, exact eight-file package audit, checksum validation, privacy/reference-name scan, `afinfo`, `afclip`, and the independent PCM/provenance parser with no failures. |
