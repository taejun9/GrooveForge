# plan-1525-mystic-song-actual-app-qa Review

## Outcome

Approved. The post-QA review verdict is **P0 0 / P1 0 / P2 0 / P3 0** with no new findings.

GrooveForge now presents Compose, Arrange, Mix, and Deliver as four visually distinct `WORKSPACE TABS`. The selected tab alone receives the cyan surface, 3px border, 4px underline, and `ACTIVE` badge. Production Electron evidence confirms four tabs, one selected tab, one tab stop, four tabpanels, and one visible panel in every zone.

## Actual App And Song Evidence

- Latest owned evidence root: `build/desktop/plan-1525-final-evidence/final-current-song/` in the main workspace.
- Structured report: `evidence/auto-song-qa-report.json`, 86,482 bytes, SHA-256 `7e3d1c93988e6d0d6ddc395d968c049cc72f29edaccdc50f25f5739ddc93dd69`.
- Launcher receipt: `evidence/manual-qa-launcher.json`, SHA-256 `0f225c465c7ed6c22b78940df6e1c0eb2029aa27427775f16d36599193e803de`.
- Project: `Projects/문-없는-방.grooveforge.json`, 28,094 bytes, SHA-256 `c231878832f2adcedb543e2f0ea643a41071cd9ac524d1923bdcecde773b46f3`.
- WAV: `exports/문-없는-방-demo.wav`, 11,762,720 bytes, SHA-256 `0a457fb10cf3cec454882afc26a6bb31d46bfe5e9cb7704d06e6a29bb220a062`; RIFF/WAVE signed PCM, stereo, 44.1kHz, 24-bit, 1,960,446 frames, 44.454558 seconds, non-silent.
- Screens: eight 2880×1856 PNGs covering Compose, Arrange, Mix, Deliver at top and deep-scroll positions. Every zone has zero document horizontal overflow, zero overflow offenders, and a single visible panel.
- Accessibility: Compose 508/508, Arrange 134/134, Mix 158/158, Deliver 57/57 rendered interactive controls were accessible; inaccessible and unchecked counts were zero.
- Performance: 68 native pointer/keyboard interactions passed. General UI max was 3339ms against 5000ms; slow-operation max was 5161ms against 120000ms.
- Provenance: current source 61 files, SHA-256 `f85a89d614a7ef40c8016692bfb8d5ca769df7fc9cc2b0b0dd825cb16958ed7c`; closed production bundle 49 files, SHA-256 `b04fcc14a348d951bda3336fd9c56e9da8d957be9b15bb13999cf25f0d5b9f66`. The launcher and Electron main independently verified every path, byte count, mtime, and SHA-256 and rejected extra, missing, changed, or symlinked files.

The original test song is `문 없는 방`: Studio / Experimental, 110 BPM, D minor, Pattern A/B/C, seven arrangement blocks over 20 bars, and 84 repeat-inclusive hits. Its Session Brief uses `GrooveForge Original`, `신비롭고 사색적인 한국어 얼터너티브 팝`, `새벽의 무중력, 여백과 질문`, and explicitly states that it does not directly imitate a particular artist. The actual app path passed A/B/C audition, arrangement playback, rendered-WAV preview, WAV export, Save, and Open.

## QA

- Passed: `git diff --check`.
- Passed: `npm run qa`.
- Passed: `npm run typecheck`.
- Passed: `npm run build`.
- Passed: `npm run renderer:smoke`.
- Passed: `npm run workflow:smoke`.
- Passed: `npm run harness:smoke`.
- Passed: `npm run persona:smoke` with 16/16 styles and both audience paths.
- Passed: `npm run sample-audio:qa` with 43 playable 24-bit stereo WAVs, 43/43 digital-zero tails, 35/35 full-mix tails, 11/11 isolation checks, and byte-identical repeat renders.
- Passed: `npm run project-workspace:smoke`.
- Passed: `npm run quick-actions:bundle-smoke`.
- Passed: `npm run desktop:smoke`.
- Passed: `npm run desktop:manual-qa -- --safety-self-test`.
- Passed: production `npm run desktop:launch-smoke` with native tab traversal, deep sticky navigation, hidden mutation guards, cold routes, modal focus, responsive layouts, and four tab captures.
- Passed: production `npm run desktop:project-io-smoke` with native Save/Open, exact bytes, SQLite WAL/integrity, and two Audience Starter roundtrips.
- Passed: production `npm run desktop:close-flow-smoke` with a focused unblurred title draft, blocked first close, native Save, exact parsed project, and normal second close.
- Passed: isolated production `npm run desktop:manual-qa -- --auto-song-qa`, five of five song stages and 68 native interactions.
- Passed: independent report, source, full-bundle, project, WAV, PNG, path, accessibility, overflow, and timing audit.
- Attempted: `npm run release:completion-summary-refresh-smoke`. Its desktop crash-report regression passed, then the command exited 1 because this feature worktree did not contain the pre-existing external preflight, remediation, operator runbook, readiness ledger, and completion-progress source evidence required by `release:proof-bundle`. The suggested `npm run release:check` expands into private/external distribution gates and was not run; no completion percentage or external readiness claim is made.

## Findings And Fixes

1. Tabs were not visually distinguishable enough. The former workflow-card presentation became an independent four-card tab surface with high-contrast selected styling, reciprocal ARIA tab/tabpanel ids, roving keyboard navigation, and a separate Workflow review row.
2. Mode and metadata interactions could block for 6–30 seconds because the main thread synchronously rendered mix plus four stems and reconciled a very large Guide tree. Exact analysis moved to an audio-identity Worker with stale guards, cached metadata identity, Activity-based lazy materialization, and commit-enabled zones.
3. Combined analysis could retain roughly 908 MiB at the valid 64-bar/60-BPM boundary. A 192 MiB strategy cap now selects a four-array bounded-sequential path with exact metric parity and an estimated 181,692,000-byte peak.
4. Pending/error analysis could display initial `Silent` or previous-project meter/readiness values as current truth. Mix, Master, Deliver, and meter-derived Guide surfaces now show `Analyzing` or `Meters unavailable` plus Retry until the exact current identity is ready.
5. Save/Export completion and Handoff receipts could outlive project edits or replacements. Latest-request and exact-current-project gates now bind completions and receipts; metadata, BPM, mixer, history, and project replacement invalidate stale receipts until a new export succeeds.
6. Focused Title or Session Brief drafts could be lost on close or overwrite a newly opened project. Save, Open, history, replacement, and `beforeunload` now synchronously flush or discard the active draft at the correct boundary, with exact-current recovery semantics.
7. Quick Actions and nested routes could read a null or stale ref in a cold hidden Activity. All cross-zone routes activate the zone first, open disclosures synchronously, then resolve a live target for sticky-aware scroll and focus.
8. A chord-card Space/Enter event could bubble to the global transport, while a broad parent fix could also suppress child buttons. Card activation now runs only when `target === currentTarget`; card selection does not toggle transport and child delete/inversion/select controls retain native keyboard behavior.
9. Desktop QA could hide horizontal clipping behind shell overflow and could write through broad or symlinked roots. Active-panel collectors now sample top/deep positions and native hit targets; the launcher requires an owned fresh/sentinel root, no-symlink realpath containment, isolated userData, and pre/post write gates.
10. Early provenance covered only three entry artifacts and could not prove the renderer chunks actually shown. The closed manifest now covers every regular file under `dist` and `dist-electron`, with negative tests for modification, addition, deletion, stale build, and symlink substitution.

All findings were retested through the same renderer, runtime, or production Electron path. The independent final review confirmed that the earlier async identity, receipt, meter truthfulness, metadata, route/focus, keyboard, memory, path-safety, and provenance findings satisfy their acceptance criteria.

## Creative, Privacy, And External Boundaries

- The test song uses broad mysterious, reflective, spacious, and question-led characteristics without reproducing a named living artist's melody, lyrics, arrangement, timbre, or recognizable signature style.
- Automated evidence used only the plan-owned workspace, PID-scoped nonpersistent partition, isolated Electron userData, local SQLite, generated project, and generated WAV. The source fixture remained byte-identical and no network operation, remote AI call, account, analytics, cloud sync, private beat, or user audio was used.
- The retained evidence is a current-source production Electron build receipt, not a signed or notarized distribution package receipt.
- The failed completion-summary refresh is an external release-evidence precondition, not a product, tab, project, audio, or actual-app QA failure. It remains explicitly recorded instead of being presented as a pass.

## Residual Risks

- Visible Electron native-input automation is stronger than DOM-only testing but does not mean a human manually exercised every state combination.
- Structural, PCM, format, level, playback, and deterministic-render checks do not replace subjective headphone/speaker listening, vocal production, or final mastering review. The deliverable is an instrumental workstation demo plus a Korean concept brief.
- The 192 MiB limit is an estimated PCM analysis working-set cap, not a guarantee on total Electron RSS.
- Other operating systems, real `/Applications` installation, Developer ID signing, notarization, Gatekeeper, update-feed publication, external upload, distribution-channel approval, and app-store submission were not performed or claimed.
