# Plan 1539 — Actual-app QA and sampled music delivery

## Status

completed

## User Request

실제 앱 전체 버그 테스트·수정과 사용자 제공 오디오 기반 샘플링 곡 5곡, 리믹스 3곡의 로컬 전달. 후속 요청으로 최소 세 개의 샘플 파트를 사용하는 샘플링 곡 3곡을 추가하여 총 11곡으로 확장. 두 번째 후속 요청은 정확한 원곡 구간 12–15초, 88–89초, 212–216초를 사용하는 3곡 추가로 총 14곡이며, 한 곡은 이 세 샘플 구간만 사용하고 두 곡은 추가 구간도 사용.

## Goal

Test the real desktop app across composition, arrangement, mixing, sampling, persistence, and export; repair reproduced defects. Produce eleven sampled compositions and three remixes: the first three additions use at least three distinct source-sampling parts; the second three additions all use the exact source intervals 12–15 s, 88–89 s, and 212–216 s, with one limited to those three sample sources and two using further sampled excerpts using the user-selected local audio and deliver PCM24 stereo 44.1 kHz WAV files plus editable production materials to Downloads.

## Owner

- 박자 / project_lead: plan, integration, actual-app UI ownership, QA coordination, final delivery and Git lifecycle.
- 지도 / repo_cartographer: read-only sampling and production workflow discovery.
- 제작 / sampling_defects: exclusive writes to `src/audio/sampleImport.ts`, `src/domain/sampling.ts`, `src/ui/SamplingPanel.tsx`, `harness/scripts/run_sampling_smoke.mjs`, and `harness/scripts/run_sampling_activity_smoke.mjs`. Reproduce and repair import boundary and success-feedback defects.
- 지도 / sample_workflow: exclusive writes to ignored `build/desktop/plan-1539-hero/production/` and `production-additional/`, plus `production-requested-regions/`; source analysis, fourteen music productions and reproducibility files. No GUI control.
- 검증 / ui_qa_mapping: analysis-state clarity and GUI coverage investigation; exclusive analysis-display writes to `src/ui/useProjectAudioAnalysis.ts`, analysis callsites in `src/ui/App.tsx`, `src/ui/localization.tsx`, `src/ui/workstationAppHelpers.tsx`, `src/ui/workflowNavigatorAnalysisPosture.ts`, `src/ui/workstationGuidancePanels.tsx`, `harness/scripts/run_runtime_smoke.mjs`, and `harness/scripts/run_renderer_smoke.mjs`. Independent delivery QA writes only to ignored `build/desktop/plan-1539-hero/delivery-qa/`; no GUI ownership.
- 검증 / quality_runner: final full release gate and delivery signal/file checks, sequential GUI ownership.
- 심사 / review_judge: independent review only after QA.

## Context Map

`src/ui/` owns visible controls; `src/audio/` and `src/domain/` own musical input/rendering contracts. `harness/scripts/` owns focused and actual-app regressions.

## Constraints

Feature branch only; local audio processing; private source and generated music stay ignored; no account upload. Final release gate and post-QA independent review are mandatory.

## Non-Goals

Full audio-warp DAW architecture, cloud rendering and public distribution.

## Implementation Plan

1. Inspect the existing app and selected local source; document reproducible UI defects and assign exclusive file ownership.
2. Fix confirmed issues without turning optional sampling into the primary app workflow.
3. Build fourteen distinct arrangements using bounded source chops for compositions and longer source passages for remixes; retain source provenance privately under ignored build output.
4. Exercise the production desktop UI, save/reopen/export paths, focused checks and final `npm run release:check`.
5. Independently review after QA, deliver verified files to Downloads, complete plan/review documents, merge/push and retire this task checkout.

## QA Plan

- `python3 harness/scripts/agent_navigation.py --changed`
- Relevant sampling, movement, renderer, runtime, type and build checks after exact defect scope is known.
- Actual production GUI screenshots, native IO, playback/export evidence; fourteen delivered WAVs checked for duration, format, peaks, non-silence and checksums.
- Final `npm run release:check`; no focused check substitutes for the gate.

## Review Plan

Independent reviewer begins after all required QA completes and checks the final source, output evidence, remaining limitations and completion claim.

## Decision Log

- 2026-09-29: Existing plan-1538 is complete. Use plan-1539 and a `codex/plan-1539-hero-app-qa` branch. The managed app worktree was created before discovering the occupied plan number; retain its existing descriptive directory per desktop worktree policy.
- User explicitly requested local sample-based outputs. The selected MP3 and derived private audio stay in ignored output and Downloads, never committed or remotely uploaded.
- Current sampling supports bounded WAV one-shots, not full-song MP3 clips. Use local preprocessing and transparent external assembly for remix passages as needed; do not misrepresent final assembled mixes as wholly native app exports.

- 2026-09-29 follow-up: User requests three additional sampled compositions, each with at least three sampling parts. Preserve the first eight delivered files unchanged; create the additions in a separate ignored production directory. Default interpretation is three or more non-overlapping original-source excerpts developed across distinguishable song sections; an optional clarification is pending. Validate added source contribution, part mapping and reproducibility before extending the Downloads package.

- 2026-09-29 second follow-up: Preserve the delivered 11 tracks. Add three tracks under ignored `production-requested-regions/` using exact original-source intervals [12,15), [88,89), [212,216). Track 12 samples only these intervals; tracks 13–14 each add two further distinct excerpts. Producer owns that directory and independent QA owns `requested-regions-delivery-qa/`; validate exclusive source provenance for track 12 and actual contribution of all required/extra parts.

- 2026-09-29 QA scope change: Manual native Cmd+A/paste in an installed Vibe input appended text instead of replacing it; the Edit menu lacks Select All. Assign `electron/main.ts` menu repair and the relevant desktop-menu regression to sampling_defects. Restore the platform Select All role, verify the actual shortcut and bounded-input replacement, then rebuild/reinstall and rerun the full release gate for the final source. The OS shortcut evidence comes from CUA; automated macOS selection uses the native first-responder menu action because Electron page input does not dispatch OS menu accelerators. Preserve the earlier passing build and both native automation failures as historical evidence; do not attribute all failures solely to lost focus.

## Progress Log

- Repository starts clean on main at 2180df1d; separate managed checkout created. Inspected workflow, privacy, QA navigation, production architecture and personal-tools capability documentation.

- Initial production UI check: starter generation, playback/stop, mixer mute/unmute, master/delivery navigation, native WAV export and project Save exercised with CUA in an isolated manual QA workspace. Export WAV and saved project confirmed on disk. Compose intentionally defers exact analysis; Mix/Deliver produced ready meters.
- Reproduced defects: import/remove success feedback cleared by project effect; exactly 0.01-second 44.1 kHz WAV incorrectly rejected by floor rounding. Assigned focused repairs and regressions.

- Approved display-only analysis clarity changes: `useProjectAudioAnalysis.ts`, App analysis callsites, localization, workstation app/guidance helpers, workflow navigator posture, and runtime/renderer smoke assertions are exclusively owned by ui_qa_mapping. Public status and PCM scheduling stay unchanged.

- CUA production regression confirmed the original 10ms rejection, then fixed import at 221 stored frames, persistent import/remove success feedback, Undo restoration and stale-feedback removal, native Save. Analysis display transitions verified cold Compose deferred → Mix analyzing → ready → Compose ready → drum edit deferred. Evidence: ignored `build/desktop/plan-1539-hero/cua-regression-receipt.json`.
- Production discovered sampled-project SoundCloud text incorrectly claiming Original/Instrumental and built-in-only synthesis. Assigned `src/audio/soundcloud.ts` and synthetic regressions in the sampling smoke to sampling_defects before final freeze. Preserve sample-free output exactly.

- Final implementation frozen after focused sampling/type/renderer/runtime checks passed. Full `npm run release:check` started with source SHA-256 before/after inventories; all GUI use reserved to its sequential runners. Local capability documentation clarified long-MP3 preprocessing, sample-based upload text and deferred analysis.

- Independent delivery QA: 163 PCM checks and 160 package checks passed, native project parse/roundtrip/rerender 8/8, sample contribution 5/5, remix reconstruction SHA-256 parity 3/3. Corrected one stale pitch-description phrase without changing audio. Evidence is ignored under `delivery-qa/`.
- Downloads delivery copied 34 files, including 8 upload WAVs, 8 native projects (three backing-only), source chops, remix layers and rebuild recipe. All source/destination SHA-256 values and 33 checksum entries match. Receipt: ignored `downloads-receipt.json`. App full gate and installed-app QA remain active.

- Full `npm run release:check` completed with exit 0 in 4820.817 seconds; all 220 source/harness/config hashes unchanged. Installed the exact verified bundle (336 entries), preserving the prior app. Initial installation preflight stopped because process enumeration was unavailable; native app inventory and normal Quit established safe replacement.
- Installed personal-tools QA passed simple mode, pattern-library persistence and bounded sample import/edit/Undo/save/export/reopen. First native production export matched its delivery WAV. The second native run timed out during valid metadata input and observed lost window focus; preserve the failed report. A later focused failure and direct native reproduction identified the missing Select All menu action, so focus alone is not treated as the root cause.
- Additional music scope: producer exclusively owns `production-additional/`; independent delivery QA exclusively owns `additional-delivery-qa/`. Three distinct local source excerpts per new track are developed as A/B/C sections over new native backings. External assembly, backing-only projects, part maps and exact rebuild materials must be explicit.

- Additional three-part package: independent 190 checks, native backing reconstruction 3/3, all nine part-contribution checks and three exact master rebuilds passed. Copied 27 files to the requested local destination; all files and 26 checksum entries match.
- Exact requested-region package: independent 316 checks and native backing reconstruction 3/3 passed. All 13 required/extra excerpt uses match original PCM bounds and reproduce complete processed motifs; all whole-motif placements, contribution checks and three master hashes pass. The first track uses exactly the three required intervals; the other two add two distinct intervals each. Copied 40 files; all hashes and 39 checksum entries match. All 14 final WAVs are delivered while final app QA continues.
- Manual native verification of the Select All repair passed repeated 35-, 63-, and 64-character replacement in the actual production window, followed by Save and normal Quit. The second full release gate is running against the frozen final source; final installed-app 16-genre and 14-production-project checks follow it sequentially.

- Final-gate attempt 1 failed after 985.879 seconds at the newly added Select All automation: the title remained focused with an empty selection. Frozen source hashes were unchanged. Manual CUA replacement had passed, so the owner is isolating macOS menu routing versus Electron synthetic input before changing the regression. The full failed log/receipt/inventories are retained under ignored `release-final-attempt-1/`; no passing final-gate claim is made.

- Isolated Electron reproduction confirmed the Select All role fixes real OS input, while page-directed `sendInputEvent` does not traverse the macOS menu accelerator. The regression now reports native first-responder action separately from OS-shortcut coverage. Eight English/Korean length cases, missing-role rejection and the production React title-field replacement/restoration passed before rerunning the full gate.

- Final release gate passed with exit 0 in 4755.379 seconds; 220 source/harness/config hashes remained unchanged. All five production launch forms passed, including explicit native-menu selection evidence and separate OS shortcut coverage. Installed the exact final bundle after fresh CUA inventory confirmed the app stopped; all 336 entries and deep/strict signature verification match. Final personal-tools, 16-genre and 14-production-project installed-app QA is running sequentially.

- Final installed QA passed: personal tools 21.201 seconds; all 16 genres 977.211 seconds; all 14 native production projects 631.450 seconds. Every native export matches its expected complete master (first five) or backing (remaining nine). Direct final installed sampling/reopen screenshots were inspected. Independent completion review remains pending the final cross-evidence audit.

- Final cross-evidence audit passed: 220 source files, 336 installed entries, 30 actual installed reports, 14 distinct masters, 101 declared delivery files and 98 checksums match. Two destination-only Finder metadata files are recorded separately; every delivered file remains exact.
- Two reviewers who did not implement this work independently reviewed code and evidence after all QA. Both reported no actionable findings. Code review also proved the prior sampling-feedback implementation fails the new regression; evidence review independently rehashed installed, runtime and delivered artifacts.

## Completion

Seven reproduced defects repaired; final full release gate, installed personal-tools/16-genre/14-project QA and independent code/evidence reviews passed. Fourteen complete WAVs and portable production materials are delivered. Completion-document checks, Git integration and evidence preservation are recorded in the review mirror and ignored receipts.
