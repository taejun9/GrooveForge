# plan-1534-ui-overlap-readability-actual-app Review

## Outcome

Approved. The final post-QA independent review found **no open P0–P3 findings** in the implementation, actual installed-app evidence, or SoundCloud-ready Downloads delivery.

The first review reported one P3: fixed Quick Action `Audition` and `Next check` sentences were too aggressively truncated at 1180px. The follow-up layout now stacks the labels, presents the copy in a two-line clamp, preserves the complete sentence in `title`, and has a renderer contract. The independent re-review closed that finding and found no regression.

## UI And Interaction

- Desktop widths from 901px use a fixed, no-document-scroll app frame. The header, main tabs, contextual sub-tabs, feedback lane, and bottom player remain structurally separate from the selected panel's controlled internal scroll area.
- Production Electron checks measured zero document vertical overflow at 901, 1024, 1180, and 1440px.
- Overview, Compose, Arrange, Mix, and Deliver remain first-class main tabs, with one selected contextual sub-tab and one visible panel per level.
- Utility and Exports remain fixed at the upper right and support hover, click, keyboard opening/navigation, disabled-item skip, Escape, deterministic Tab exit, outside dismissal, and one-menu-only behavior.
- The global player remains visible across every page and exposes synchronized Play/Stop and transport feedback.
- Mode, project, recovery-draft, workflow, undo/redo, and Quick Action feedback now occupy one exclusive 82px lane. A monotonically increasing intent epoch prevents stale asynchronous completion messages from replacing newer user intent.
- Review Queue closes Guide and opens its required disclosures before bounded reveal/focus. Native hit testing confirms that the destination is visible and unobscured.
- Core shell, navigation, menu, action, and status copy remains readable in Korean. Conventional project/style/track names and DAW abbreviations remain within the plan's stated localization boundary rather than being misleadingly translated.

## Actual Installation Evidence

- The final app was installed at `/Applications/GrooveForge.app` after preserving the displaced canonical install as `/Applications/GrooveForge Backup 2026-09-10 plan-1534-pre-two-line-fix.app`. Earlier plan-1534 backups and the separate QA app were also left intact.
- A package-to-install `rsync -naci --delete` comparison produced no difference. The package and installed renderer SHA-256 are both `bae9be31cec54707b5340592b2b04825c82de69a14e9c05b05c93ddbc93327c1`; their main-process SHA-256 is `fdfd48b73c190d8a554e7643f5cf9f965fca5cb5386a0cc43f278eb534945a82`.
- Strict deep code-signature verification passed. The bundle is arm64, bundle ID `app.grooveforge.desktop`, version/build `0.1.0`, with 318 regular files and 14 symlinks.
- The app was launched from `/Applications/GrooveForge.app/Contents/MacOS/GrooveForge`; the renderer URL resolved inside the installed bundle.
- Direct installed-app inspection covered Overview, all main tabs, representative contextual tabs, both fixed upper-right menus, Review Queue, Quick Actions, and global Play/Stop. The final two-line result display did not overlap the editor or player.
- A retained recovery draft was deferred with “Not now.” The test did not restore, clear, overwrite, or delete the user's draft.

## SoundCloud-Ready Delivery Audit

- Final UI and harness changes did not change the audio domain or renderer, so the already fresh actual-app 16-style payload was exhaustively re-audited instead of generating byte-duplicate music.
- The delivery folder is `/Users/taejungkim/Downloads/GrooveForge_16장르_SoundCloud_업로드_패키지_2026-09-09_234901`.
- It contains 147 regular files in 34 directories, with no symlink, `.DS_Store`, or empty file. The checksum manifest covers exactly 146 deliverables and all 146 entries pass.
- `00-SoundCloud-WAV` contains 16 unique batch-select WAVs. The 16 corresponding per-genre copies are byte-identical.
- All tracks are stereo 44.1kHz signed PCM 24-bit WAVs. Their durations are 106.681–127.500 seconds, so all satisfy the requested 90–180-second range.
- The 16 unique profiles are Ballad, Hip-Hop, Trap, R&B, House, Experimental, Drill, Boom Bap, Lo-fi, K-Hip-Hop/R&B, Afrobeats, Amapiano, Reggaeton, Jersey Club, Phonk, and Garage.
- Each genre folder has eight files, and all 16 Korean SoundCloud upload sheets agree with the actual filename and duration while specifying Private-first and Downloads Off.
- Every manifest records `soundCloudUploadPerformed:false`; no account access, upload, publication, or external state change was performed.

## QA

- Passed: `git diff --check`, `npm run qa`, `python3 harness/scripts/run_quality_gate.py`, `npm run comments:ko:check`, `npm run typecheck`, `npm run renderer:smoke`, and `npm run build`.
- Passed after the P3 fix: production `desktop:launch-smoke`, packaged-app smoke, fresh DMG smoke, and DMG simulated-install smoke.
- The production launch traversal covered every main and contextual tab, 901/1024/1180/1440px zero-overflow frames, Korean locale, six feedback owners, stale-save suppression, grids, modal focus, Review Queue, and global Play/Stop.
- The first repository-QA run exposed only obsolete three-argument source-string assertions for `loadProjectText`. Updating those contracts for the new intent-aware fourth argument made the clean rerun pass.
- The first sandboxed DMG mount attempt failed because `hdiutil` could not configure a device. The permitted native rerun passed, and the resulting DMG plus simulated-install app both passed their GUI checks.

## Findings

- Closed P3: Quick Action `Audition` and `Next check` follow-up copy was clipped at 1180px. Two-line display, complete hover text, and regression coverage resolve it.
- Final review: no open P0, P1, P2, or P3 findings.

## Boundaries And Human Follow-Up

- Finite automated and actual-app coverage cannot prove the absence of every unknown defect. All documented plan-1534 acceptance paths passed.
- The installed app is ad-hoc signed. Developer ID signing, notarization, and external Gatekeeper distribution readiness were not tested or claimed.
- SoundCloud upload was intentionally not performed. A person must listen to every track end to end, check accidental recognizable similarity, approve LUFS/true-peak mastering, supply artwork, and confirm artist, rightsholder, credits, license, and metadata before upload.
- The tracks use broad original genre profiles. This review does not claim exact imitation of a named living artist or album.
- The recommended first SoundCloud upload state remains Private with Downloads Off, followed by a review of SoundCloud's processed stream before publication.
