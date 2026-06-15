
# Quality Rules

These rules should be enforced by the local harness where practical.

## Planning

- Every implementation task starts from `docs/exec_plans/active/plan-NNN-<task>.md`.
- Completed plans move to `docs/exec_plans/completed/`.
- Completed plans require review mirrors in `docs/reviews/`.
- Plan filenames use `plan-NNN-<task>.md`.
- `docs/plan` is prohibited.
- Update the Decision Log when scope or approach changes.

## Git Flow

- Do not implement, commit, or push feature work directly on `main`.
- Use `codex/plan-NNN-<task>` branches for implementation work.
- Use `.worktree/plan-NNN-<task>` checkouts for git repository work.
- After QA and review, merge the task branch to `main`, push `main`, delete the merged branch with `git branch -d`, and remove the worktree.

## QA And Review

- QA and review are separate loops.
- Review starts only after QA completes.
- Failed validation must be reported and fixed or explicitly documented.
- Completion reviews go in `docs/reviews/` and should summarize QA, findings, residual risk, and follow-ups.
- Strict quality scans must ignore local `.worktree/` checkouts while still checking committed docs and completed plan/review artifacts.

## Documentation Hygiene

- Root Markdown files are limited to `README.md` and `AGENTS.md`.
- Durable documentation belongs under `docs/`.
- `AGENTS.md` should stay a concise repository map.
- `README.md` is the current public entry point and must stay aligned with code behavior.

## Safety

- Sensitive real user, customer, startup, credential, and production data must not appear in samples, tests, docs, or screenshots.
- Broad permissions, remote AI calls, trackers, ads, payment flows, and destructive automations require explicit project rationale.
- Real user audio, copyrighted sample packs, unreleased beats, credentials, and private project files must not be committed.

## Commands

Current commands:

```sh
python3 harness/scripts/run_qa.py
python3 harness/scripts/run_quality_gate.py
npm run typecheck
npm run build
npm run qa
npm run verify
```

Desktop app manual check:

```sh
npm run desktop
```

## Product QA Gates

P0 scheduler work must prove stable play/stop/loop behavior, BPM changes, current-step feedback, and separation between UI timing and audio timing.

Drum, bass, melody, and arrangement work must preserve editable project state without losing event timing, pitch, velocity, glide, track routing, or mixer state.

Drum dynamics work must migrate old patterns, preserve per-step velocity and hat repeat data across Pattern A/B/C copy, save/load, undo/redo, realtime playback, WAV export, and stem export.

Drum microtiming work must migrate old patterns, preserve per-step timing offsets across Pattern A/B/C copy, save/load, undo/redo, realtime playback, WAV export, and stem export, and keep offsets as local musical event data rather than imported audio.

Groove humanize work must be deterministic, operate on selected Pattern A/B/C velocity and microtiming event data, preserve pattern independence, keep results manually editable, and avoid remote AI or sampling dependencies.

Style groove work must apply key-aware editable Pattern A/B/C event data, BPM, swing, and built-in sound preset changes without introducing imported audio or bypassing undo/redo.

Chord progression work must preserve Pattern A/B/C independence, keep chord roots and progression presets scale-aware by default, migrate older project files without chord events, keep add/delete operations undoable, preserve at least one chord event in guided editing, and make chord events audible in both realtime playback and WAV export.

Sound design work must keep tone parameters in project state, migrate older project files without sound data, and make preset or Studio tone changes audible in both realtime playback and WAV export.

Sidechain work must keep kick-to-808 ducking as editable local sound-design state, migrate older project files without sidechain data, and apply the same deterministic gain rule to realtime playback, full-mix WAV export, and 808 stem export.

Project file work must reject invalid imports without overwriting the current project and must preserve edited drum, bass, chord, melody, sound design, mixer, master, key, BPM, style, and arrangement data on save/load.

Pattern work must keep Pattern A/B/C as independent editable event data. Copy and clear tools must operate on the selected pattern slot without deleting the slot itself. Realtime playback should preview the selected pattern, while WAV export should follow arrangement pattern assignments.

Arrangement editor work must let users change a block's section, Pattern A/B/C assignment, and energy without losing existing pattern, mixer, master, or save/load data. Selecting or reassigning a block should keep the pattern editor aligned with that block's assigned pattern.

Arrangement structure work must preserve at least one block, keep selection/pattern alignment after duplicate, move, and delete actions, and make WAV export follow the current arrangement length.

Undo/redo work must record bounded local project-edit history for editing actions, ignore playback/export side effects, keep keyboard shortcuts out of focused inputs, and clear history when a different project file is loaded.

Desktop shortcut work must keep playback, Pattern A/B/C selection, save/open, undo/redo, and selected event deletion scoped to the app window, must not fire from focused editable controls, and must route destructive deletion through normal undoable project history.

Export work must verify a non-silent WAV with expected duration, expected sample rate/channel count, no audio frames above the selected ceiling, and reproducibility from saved project data.

Export meter work must label measurements honestly as peak, RMS, headroom, and limiter activity unless a standards-complete LUFS or true-peak implementation is added and validated.

Stem export work must render isolated drum, 808, synth, and chord WAV files from the current arrangement, keep full-mix WAV export intact, and avoid depending on imported audio or sample assets.

Product framing work must preserve the core boundary: GrooveForge is for all-genre beat creation, pattern programming, sound design, arrangement, mixing/mastering, and export first; sampling is an optional extension and should not dominate MVP docs, UI copy, architecture, roadmap order, or plan titles.

Docs that mention clips before optional sampling is implemented must clarify that core clips are pattern, MIDI, or automation containers, not imported audio assets.

Any new plan that mentions sample import, chopping, sampler tracks, or audio warping must explicitly mark that work as optional sampling-phase work or document the user-approved exception in its Decision Log.

Mixer/master work must keep mixing and mastering separate. Volume, pan, mute, solo, master output gain, and preset ceiling controls must affect both realtime playback and WAV export when implemented. Loudness presets are targets and checks, not automatic proof that a beat is platform-safe.

Channel EQ work must keep low-cut/air controls in mixer state, migrate older project files safely, keep non-master track EQ separate from master processing, and make EQ values affect realtime playback, full-mix WAV export, and stem export.

Channel dynamics work must keep Drive/Glue controls in mixer state, migrate older project files safely, keep non-master track saturation/compression separate from master processing, label simplified compression honestly, and make Drive/Glue values affect realtime playback, full-mix WAV export, and stem export.
