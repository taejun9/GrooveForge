# plan-1532-requested-hiphop-actual-app-qa Review

## Outcome

Approved for the requested testing and seven-track delivery scope. The post-QA review found no additional defect in the change or Downloads package. Two pre-existing wide-layout issues remain open: **P2 1 / P3 1**. They do not alter project data, audio export, save, or reopen results, but “no known bugs” must not be claimed.

The seven original, sample-free instrumentals use broad non-imitative production lanes rather than named-artist or album imitation. All seven passed visible production Electron Open, edit, Arrange, Mix, Deliver, WAV export, Save, and reopen. The verified SoundCloud-selection package is `/Users/taejungkim/Downloads/GrooveForge_오리지널_힙합_7곡_SoundCloud_업로드_패키지_2026-09-07`.

## Requested Delivery

| 순서 | Production lane | StyleProfile | 제목 | BPM / Key | 길이 |
|---:|---|---|---|---|---:|
| 01 | 건조하고 거친 랩 포켓 | Hip-Hop | 막차의 분필선 | 90 / E minor | 118.333초 |
| 02 | 건조하고 거친 랩 포켓 | Boom Bap | 회색 계단 | 92 / E minor | 115.761초 |
| 03 | 건조하고 거친 랩 포켓 | K-Hip-Hop/R&B | 낮은 천장 | 94 / C minor | 113.298초 |
| 04 | 어둡고 미니멀한 분할 벌스 포켓 | Drill | 무광의 밤 | 142 / F minor | 108.919초 |
| 05 | 어둡고 미니멀한 분할 벌스 포켓 | Trap | 닫힌 회로 | 145 / F minor | 106.681초 |
| 06 | 신스 드라이브 펑크 랩 포켓 | Phonk | 점화선 | 132 / G minor | 109.841초 |
| 07 | 신스 드라이브 펑크 랩 포켓 | Jersey Club | 아스팔트 스프린트 | 140 / F# minor | 110.464초 |

The matrix is exactly 3+2+2 and uses seven distinct current StyleProfile and Beat Blueprint pairs. The high-energy lane uses editable Synth/Chord events and built-in drive; it does not contain guitar recordings, imported audio, external samples, vocals, or producer tags.

## Audio And Project Evidence

- The seven source WAVs and seven top-level selection copies are canonical RIFF/WAVE PCM format 1, stereo 44.1kHz, signed 24-bit, with complete frames and data sizes.
- All unique track lengths are within 90–180 seconds. Both channels contain signal; real lower-byte activity is 99.608–99.618%; full-scale and click-risk sample counts are zero.
- Peak is -7.11 to -3.75 dBFS and RMS is -27.41 to -20.89 dBFS. Export tails contain signal and every file ends with terminal digital-zero frames.
- All seven projects parse and preserve title, BPM, key, arrangement, automation, and blank Artist metadata across serialize/reopen.
- Rendering each saved project again with the current renderer produces a 7/7 byte-identical WAV match. All seven track hashes are unique, and each `00-SoundCloud-WAV` copy exactly matches its per-track source.

## Actual-App Evidence

- Seven sanitized reports are `visible-native-auto-movement-qa`, `ok:true`, with failures 0 and all four execution stages passed.
- The reports contain 372 native pointer/keyboard interactions with zero focus or performance-budget violation. The longest general action was 1,915ms of 5,000ms and the longest slow action was 8,384ms of 120,000ms.
- Every track passed Open/edit, Arrange, Mix analysis, Deliver WAV, Save, and reopen, including exact reopened arrangement and automation.
- All 21 Arrange/Mix/Deliver screenshots are valid, unique 2880×1856 RGB PNGs. Manifest, report, file bytes, active zone, and SHA-256 values agree; no local path, account data, OS chrome, EXIF, or text chunk is present.
- Production bundle provenance, isolated userData, source-fixture immutability, visible tab state, and zero horizontal document overflow passed for all seven tracks.

## Package And Privacy

- Downloads contains exactly 73 regular files, no symlink or non-regular entry, and no difference from the reviewed source delivery.
- `checksums.sha256` contains the exact 72-file inventory excluding itself and passes 72/72. Manifest artifact count is 73; seven rows and all 70 row references match file paths, sizes, and hashes.
- Robust NFKC and punctuation/whitespace-normalized review found no named reference, romanization, imitation phrase, affiliation or unverified-rights claim, email, credential field, user path, temporary path, imported-audio state, or rights overclaim.
- The fail-closed self-test rejects punctuation/spacing variants and camelCase secret fields, including `Black-Nut`, `C.Jamm`, spaced Korean names, Korean type-beat/official-collaboration wording, `accessToken`, and `clientSecret` fixtures.
- All seven upload sheets keep Artist, rightsholder, contributor/credits, license, and artwork as explicit placeholders. Initial privacy is Private; Downloads, monetization, distribution, and Content ID are Off.

## QA

- Passed: `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `npm run typecheck`, and `npm run build`.
- Passed: default six-genre, all-16-genre, and requested-seven-track runner self-tests, requested long-form audio self-test, fail-closed prepare/resume checks, and negative privacy fixtures.
- Passed: `npm run desktop:requested-hiphop-qa` with 7/7 actual-app songs and 73 final delivery files.
- Passed: `npm run desktop:all-genres-qa` with all 16 current StyleProfiles and 147 evidence files.
- Passed: `npm run release:check`, comprising repository QA and all 91 ordered verify entries. It covered source, packaged, ad-hoc signed, PKG-payload, and simulated-install launches; project I/O and close flow; DMG/PKG; privacy redaction; and truthful fail-closed external-release blockers.
- Passed: source/Downloads exact diff, Downloads 72/72 checksum verification, independent WAV parsing, project reopen, and deterministic byte-identical rerender.

## Findings

1. **P2 — wide desktop layout pushes the active stage below the first viewport.** `src/styles.css:5172` defines a two-row transport grid while the command strip at `src/styles.css:5272` occupies the two-row command column. When the launch area is collapsed, the tall command column still determines the row height and leaves a large empty central area. The active Arrange/Mix/Deliver stage remains scrollable and functional but primary-editor discoverability is degraded.
2. **P3 — brand and long project titles are visibly truncated.** The fixed 220px brand column and 127px title column around `src/styles.css:5176` and `src/styles.css:5193` produce `Groov…` and a shortened `아스팔트 스프린트` in the wide header. Full project values survive in reports and reopened projects, so this is presentation-only.

Both findings predate this plan's runner/documentation change and should be handled in a separate UI implementation plan. They do not block completion of the requested testing and local delivery.

## Boundaries And Human Follow-Up

- SoundCloud login, upload, publication, download enablement, monetization, distribution, Content ID, and account changes were not performed.
- A person must listen to every track end to end, judge musical quality and accidental recognizable similarity, and approve transitions, bass, and endings.
- Sample peak/RMS checks are not LUFS/true-peak mastering. Final mastering remains a human production decision.
- Replace artist, rightsholder, contributor/credits, license, and artwork placeholders with real approved information before upload.
- Upload Private with Downloads Off first, then listen to SoundCloud's processed stream before deciding whether to publish.
- Finite automated and actual-app coverage cannot prove that no unknown bug exists. The documented complete gate passed, and the two reproducible known UI issues above remain disclosed.
