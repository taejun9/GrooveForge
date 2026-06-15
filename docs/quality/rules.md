
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

Metronome work must keep click playback realtime-only, accent beat 1 distinctly from beats 2-4, persist the transport toggle through save/load migration, follow live BPM changes while playing, preserve Stop/Space behavior, and keep WAV/stem exports free of metronome audio.

Drum, bass, melody, and arrangement work must preserve editable project state without losing event timing, pitch, velocity, glide, track routing, or mixer state.

Drum dynamics work must migrate old patterns, preserve per-step velocity and hat repeat data across Pattern A/B/C copy, save/load, undo/redo, realtime playback, WAV export, and stem export.

Drum probability work must migrate old patterns to 100% chance, preserve per-step probability data across Pattern A/B/C copy, save/load, undo/redo, realtime playback, WAV export, and stem export, and use deterministic probability gates so exported audio is reproducible from saved project data.

808, melody, and chord chance work must migrate older musical events to 100% chance, preserve probability data across Pattern A/B/C copy, save/load, undo/redo, realtime playback, WAV export, and stem export, and use deterministic probability gates so exported audio is reproducible from saved project data.

Chance badge work must keep badges read-only, show below-100% drum, 808, melody, and chord chance without changing playback or export behavior, and keep the default 100% editing grid visually clean.

Drum microtiming work must migrate old patterns, preserve per-step timing offsets across Pattern A/B/C copy, save/load, undo/redo, realtime playback, WAV export, and stem export, and keep offsets as local musical event data rather than imported audio.

Groove humanize work must be deterministic, operate on selected Pattern A/B/C velocity and microtiming event data, preserve pattern independence, keep results manually editable, and avoid remote AI or sampling dependencies.

Style groove work must apply key-aware editable Pattern A/B/C event data, BPM, swing, and built-in sound preset changes without introducing imported audio or bypassing undo/redo.

Style expansion work must add new genres as first-class `StyleId` entries with key-aware Pattern A/B/C event blueprints, BPM/swing defaults, and local sound preset mapping; every new style must remain editable, undoable through the existing style-selection path, sample-free, and free of imported audio, hidden assets, remote AI, plugin hosting, accounts, analytics, or cloud sync.

Style Inspector and Style Quick Picks work must derive read-only BPM range, active/default swing, bass role, melody role, sound preset, and Pattern A/B/C event density from local style profile and project data; keep style selection accessible/testable; route quick-pick style changes through the existing undoable style-selection path; preserve existing style application, undo/redo, save/load, playback, WAV/stem/MIDI export semantics; and avoid sampling, imported audio, hidden generation, remote AI, plugin hosting, accounts, analytics, or cloud sync.

Beat Blueprint work must apply deterministic sample-free project starts from local style, key, BPM, Pattern A/B/C event data, arrangement templates, sound presets, mixer balance, and master presets; keep the result fully editable and undoable; preserve title, mode, metronome, save/load, playback, WAV/stem/MIDI export semantics; and avoid remote AI, imported audio, sampling, plugin hosting, hidden randomness, or hidden assets.

Delivery Target work must store the selected fixed or custom target in local project state, migrate older files to a safe default target and bounded default custom target, keep target selection and custom target editing separate from target alignment, route custom edits and alignment changes through explicit undoable project update paths, preserve Pattern A/B/C event data, save/load, snapshots, realtime playback, WAV/stem/MIDI export, Beat Readiness, Beat Map, Next Move, Handoff Sheet, and Mix Coach semantics, and avoid platform compliance, LUFS/true-peak claims, professional mastering guarantees, sampling, imported audio, plugin hosting, remote AI, remote analysis, hidden automation, accounts, analytics, or cloud sync.

Session Brief work must store bounded artist, vibe, reference, and notes text in local project state, migrate older files to empty defaults, preserve save/load, snapshots, undo/redo, realtime playback, WAV/stem/MIDI export, Beat Readiness, Beat Map, Next Move, Mix Coach, and Delivery Target semantics, and avoid media uploads, copyrighted reference audio, remote AI, remote analysis, collaboration, accounts, analytics, cloud sync, sampling, imported audio, plugin hosting, hidden automation, or compliance claims.

Key retarget work must update Pattern A/B/C 808/bass note pitches, melody note pitches, and chord roots by scale degree, preserve event timing, length, velocity, glide, and chance fields, remain undoable, and avoid imported audio or sampling dependencies.

Chord progression work must preserve Pattern A/B/C independence, keep chord roots and progression presets scale-aware by default, migrate older project files without chord events, keep add/delete operations undoable, preserve at least one chord event in guided editing, and make chord events audible in both realtime playback and WAV export.

Chord Pad work must derive pad roots and qualities from the current key, update only the selected chord event after an explicit click through existing undoable chord update paths, preserve step/length/velocity/chance unless directly edited, keep chord events editable local musical data, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Chord inversion work must migrate older chord events to root position, preserve per-chord inversion data across Pattern A/B/C copy, save/load, undo/redo, realtime playback, WAV export, and stem export, and keep inversions as editable musical event data rather than imported audio.

Selected chord edit tool work must keep chord move, duplicate, delete, and inversion actions scoped to the selected Pattern A/B/C slot, preserve root/quality/length/velocity/chance fields unless directly edited, avoid overlapping duplicate or moved chord starts at the same step, preserve at least one chord event, keep actions undoable, and keep realtime playback, WAV/stem export, and MIDI export driven by editable chord event data rather than imported audio.

Sound design work must keep tone parameters in project state, migrate older project files without sound data, and make preset or Studio tone changes audible in both realtime playback and WAV export.

Sidechain work must keep kick-to-808 ducking as editable local sound-design state, migrate older project files without sidechain data, and apply the same deterministic gain rule to realtime playback, full-mix WAV export, and 808 stem export.

Project file work must reject invalid imports without overwriting the current project and must preserve edited drum, bass, chord, melody, sound design, mixer, master, key, BPM, style, and arrangement data on save/load.

Project Snapshot work must store snapshots as local project-file data, migrate older projects to an empty snapshot list, keep snapshot payloads free of nested snapshots, preserve save/load and undo/redo semantics, allow save/rename/restore/delete without cloud sync or accounts, keep snapshot names bounded and normalized, and avoid sampling, remote AI, hidden audio assets, destructive filesystem versioning, or analytics.

Pattern work must keep Pattern A/B/C as independent editable event data. Copy and clear tools must operate on the selected pattern slot without deleting the slot itself. Pattern Compare work must derive event, track, and arrangement-use summaries from local Pattern A/B/C and arrangement state; Cue must switch only selected-pattern preview state without autoplay or undo history; Use must route selected-block pattern changes through existing undoable arrangement updates. Pattern preview playback should loop the selected pattern, while arrangement playback and WAV export should follow arrangement pattern assignments.

Pattern variation work must be deterministic, operate only on the selected Pattern A/B/C slot through undoable project history, keep generated drums, bass, melody, chords, velocities, timings, repeats, and probabilities manually editable, and avoid sampling, remote AI, or hidden audio assets.

Pattern Fill work must be deterministic, operate only on the selected Pattern A/B/C slot through undoable project history, edit only local drum, 808/bass, melody, and chord-tail event data, keep Drum Fill/808 Pickup/Melody Turn/Clear Tail results manually editable, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, remote AI, hidden randomness, or hidden audio assets.

808 Bassline Pad work must derive 808/bass notes from the current key after an explicit click, update only the selected Pattern A/B/C bass notes through undoable project history, keep results manually editable through the note grid and inspector, preserve glide, chance, realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Melody Motif Pad work must derive Synth melody notes from the current key after an explicit click, update only the selected Pattern A/B/C melody notes through undoable project history, keep results manually editable through the note grid and inspector, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Beat Readiness work must derive checks from editable Pattern A/B/C, arrangement, and deterministic export analysis data, remain read-only, avoid mutating project state or generating musical events, preserve realtime playback and WAV/stem/MIDI export semantics, and avoid imported audio, sampling, plugin hosting, remote AI, or remote analysis dependencies.

Beat Map work must derive workflow stages, song/pattern metrics, Session Brief status, export state, stem state, and action suggestions only from local project state, selected Delivery Target, Beat Readiness, deterministic export analysis, and deterministic stem analysis; remain read-only by default; route all mutating action buttons through existing explicit undoable handlers; preserve Beat Readiness, Next Move, Mix Coach, realtime playback, WAV/stem/MIDI export, save/load, and undo/redo semantics; and avoid sampling, imported audio, plugin hosting, remote AI, remote analysis, hidden automation, accounts, analytics, cloud sync, or professional mastering/commercial release claims.

Next Move work must derive deterministic recommendations from local project, Beat Readiness, and export analysis state; keep Beat Readiness cards read-only; run only after explicit user button clicks; route mutating actions through undoable project update paths; and avoid imported audio, sampling, plugin hosting, remote AI, remote analysis, hidden automation, accounts, or analytics.

Next Move Pattern Chain work must recommend Pattern Chain only from local readiness state, route the click through the existing undoable `applyPatternChain` path, keep Full Beat available as an explicit alternative when arrangement structure is weak, avoid mutating Beat Readiness, and preserve realtime playback plus WAV/stem/MIDI export semantics.

Selected note edit tool work must keep 808 and Synth note move, transpose, octave, and duplicate actions scoped to the selected Pattern A/B/C slot, preserve length/glide/velocity/chance fields, avoid overlapping duplicate notes at the same step and pitch, keep pitch moves scale-aware, remain undoable, and avoid sampling, remote AI, or hidden audio assets.

Arrangement editor work must let users change a block's section, Pattern A/B/C assignment, bar length, and energy without losing existing pattern, mixer, master, or save/load data. Selecting or reassigning a block should keep the pattern editor aligned with that block's assigned pattern.

Arrangement track mute work must migrate older arrangement blocks to no muted tracks, keep mutes scoped to the selected block without mutating Pattern A/B/C events, apply the same mute decisions to realtime arrangement playback, full-mix WAV export, and stem export, and preserve selected-pattern preview behavior.

Arrangement structure work must preserve at least one block, keep selection/pattern alignment after duplicate, move, and delete actions, and make WAV export follow the current arrangement length.

Arrangement split work must split only the selected arrangement block, preserve total arrangement bars, duplicate the selected block's section, Pattern A/B/C assignment, energy, and muted tracks into the resulting blocks, select the new second block, keep the action undoable, avoid mutating Pattern A/B/C event data, and make realtime playback, WAV/stem export, and MIDI export follow the split structure.

Arrangement merge work must merge only the selected block with the next block, preserve total arrangement bars, keep the selected block's section, Pattern A/B/C assignment, energy, and muted tracks as the merged block identity, keep the result within max per-block bar bounds, select the merged block, keep the action undoable, avoid mutating Pattern A/B/C event data, and make realtime playback, WAV/stem export, and MIDI export follow the merged structure.

Arrangement template work must replace only arrangement blocks, keep existing Pattern A/B/C musical data and mixer/master state intact, reset selection safely to a valid block, align the selected pattern with the first template block, remain undoable, and make WAV/stem export follow the applied template length.

Pattern Chain work must replace only arrangement blocks with deterministic Pattern A/B/C sequences, keep existing Pattern A/B/C musical data and mixer/sound/master state intact, reset selection safely to the first chain block, align the selected pattern with that block, remain undoable, make realtime playback plus WAV/stem/MIDI export follow the chain, and avoid sampling, imported audio, plugin hosting, remote AI, hidden randomness, macros, accounts, analytics, or cloud sync.

Pattern Chain step editor work must cycle only arrangement block Pattern A/B/C assignments through existing undoable project update paths, keep each block's section, bars, energy, muted tracks, and Pattern A/B/C musical event data intact, align the selected block and selected pattern after edits, make realtime playback plus WAV/stem/MIDI export follow the edited chain, and avoid sampling, imported audio, plugin hosting, remote AI, hidden randomness, macros, accounts, analytics, or cloud sync.

Pattern Chain expand work must transform only arrangement blocks into a longer deterministic song-form outline, preserve Pattern A/B/C musical event data plus mixer/sound/master state, align selected pattern to the first expanded block, remain undoable, make realtime playback plus WAV/stem/MIDI export follow the expanded arrangement, and avoid sampling, imported audio, plugin hosting, remote AI, hidden randomness, macros, accounts, analytics, or cloud sync.

Arrangement length work must keep per-block bar counts bounded, migrate older project files without bar counts to one bar per block, keep changes undoable, and make export meter, full-mix WAV export, and stem export follow total arrangement bars.

Arrangement playback work must map realtime playback through arrangement blocks, per-block bar counts, and Pattern A/B/C assignments by default while preserving a selected-pattern preview mode, accurate transport status, Space shortcut behavior, and existing mixer/sound/master processing.

Transport Loop work must keep Song, selected Block, and Pattern loop scope as explicit local playback state, use selected-block start bar and bar length only for realtime audition, preserve Space/Stop behavior and live project reads, avoid writing loop scope into saved project data, and keep WAV/stem/MIDI export plus Handoff Sheet semantics tied to the full arrangement rather than the audition loop.

Arrangement energy work must keep Energy as deterministic arrangement-block playback/render interpretation, apply the same gain rule to realtime arrangement playback, WAV export, and stem export, preserve selected-pattern preview at neutral energy, and avoid mutating stored pattern events.

Arrangement Move work must transform only the selected arrangement block's existing energy and mutedTracks state through undoable project history, keep Drop/Build/Hook Lift/Reset deterministic and editable afterward, avoid mutating Pattern A/B/C musical events, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid imported audio, sampling, plugin hosting, remote AI, hidden randomness, or hidden assets.

Arrangement Focus work must derive selected-block summaries from local arrangement and Pattern A/B/C event state, offer only explicit user-clicked Focus presets, update only the selected block's section, Pattern assignment, bar length, energy, and mutedTracks through undoable arrangement paths, keep selected pattern aligned with the block, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid mutating Pattern A/B/C musical events, sampling, imported audio, plugin hosting, remote AI, hidden automation, accounts, analytics, or cloud sync.

Live playback edit work must read current project state while scheduling future steps, let selected-pattern preview and arrangement playback respond to edits without stopping, update BPM and master output changes on future scheduling/output, preserve Stop and Space behavior, and state that already-triggered audio is not rewritten.

Undo/redo work must record bounded local project-edit history for editing actions, ignore playback/export side effects, keep keyboard shortcuts out of focused inputs, and clear history when a different project file is loaded.

Desktop shortcut work must keep playback, Pattern A/B/C selection, save/open, undo/redo, and selected event deletion scoped to the app window, must not fire from focused editable controls, and must route destructive deletion through normal undoable project history.

Keyboard Capture work must route desktop key presses into scale-locked 808 or Synth notes as editable local musical events, keep focused inputs/textareas/selects/contenteditable controls protected, make every captured note undoable through project history, expose the target and key map in the 808/Melody editor, and avoid Web MIDI permission prompts, audio recording, sampling, imported audio, sampler tracks, remote AI, accounts, analytics, or cloud sync.

Quick Actions work must remain local and explicit, must not fire while focused editable targets receive keyboard input, must route mutating commands through existing undoable project update paths, must keep project/open/save/export actions user-triggered, and must avoid macros, scripting, global OS shortcuts, sampling, plugin hosting, remote AI, automation recording, accounts, analytics, or cloud sync.

Export work must verify a non-silent WAV with expected duration, expected sample rate/channel count, no audio frames above the selected ceiling, and reproducibility from saved project data.

Render noise work must keep offline WAV export, stem export, and export meter analysis deterministic from render-relevant project data, avoid `Math.random()` in the offline render path, and avoid tying audio output to transient UI mode, project title, save timestamps, remote services, imported samples, or hidden audio assets.

Export meter work must label measurements honestly as peak, RMS, headroom, and limiter activity unless a standards-complete LUFS or true-peak implementation is added and validated.

Stem export work must render isolated drum, 808, synth, and chord WAV files from the current arrangement, keep full-mix WAV export intact, and avoid depending on imported audio or sample assets.

Stem level meter work must derive drum, 808, synth, and chord meter values from the deterministic offline stem render path, show peak/RMS/headroom honestly without LUFS or true-peak claims, avoid mutating project state, keep existing realtime playback and WAV/stem/MIDI export semantics intact, and avoid imported audio, sampling, plugin hosting, or remote analysis dependencies.

Mix Coach work must derive suggestions only from deterministic full-mix and stem export analysis, remain read-only, preserve project state and existing realtime/WAV/stem/MIDI export semantics, communicate peak/RMS/headroom/limiter/stem-balance checks without LUFS, true-peak, platform compliance, or mastering-fix claims, and avoid imported audio, sampling, plugin hosting, remote AI, or remote analysis dependencies.

Mix Fix work must run only after explicit user button clicks, derive action tone from deterministic local full-mix/stem analysis, route all mixer/master changes through undoable project update paths, keep fixes limited to editable mixer/master state, avoid hidden automatic mastering, and avoid LUFS, true-peak, platform compliance, sampling, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync claims.

MIDI export work must write deterministic Standard MIDI Files from editable project events, follow arrangement Pattern A/B/C assignments, block lengths, track mutes, BPM, drum repeats, note/chord lengths, and chord inversions, include drum, 808, synth, and chord tracks, and avoid depending on rendered audio, imported samples, or sampler assets.

Handoff Sheet export work must write a local plain text summary only after an explicit user click, derive content from local project state, selected Delivery Target, Session Brief, arrangement data, deterministic export analysis, and deterministic stem analysis, avoid mutating project state or triggering audio render downloads, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid media uploads, copyrighted reference audio, platform compliance, publishing, licensing, LUFS/true-peak guarantees, sampling, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync.

Product framing work must preserve the core boundary: GrooveForge is for all-genre beat creation, pattern programming, sound design, arrangement, mixing/mastering, and export first; sampling is an optional extension and should not dominate MVP docs, UI copy, architecture, roadmap order, or plan titles.

Concept correction work must make the all-genre beat-production mini DAW framing explicit: direct beat composition, sound design, arrangement, mixing/mastering, and export are the product spine, while sample import, chopping, pitch/stretch, one-shot mapping, and sampler workflows are optional later paths.

First-run UX, default navigation, and roadmap work must lead with direct beat composition: pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export. Sample browsing, chopping, sampler setup, audio clips, and audio warping must stay opt-in optional-sampling paths unless the user explicitly changes the product direction.

Docs that mention clips before optional sampling is implemented must clarify that core clips are pattern, MIDI, or automation containers, not imported audio assets.

Any new plan that mentions sample import, chopping, sampler tracks, or audio warping must explicitly mark that work as optional sampling-phase work or document the user-approved exception in its Decision Log.

Any product, architecture, UI, roadmap, or QA wording that implies users must import, chop, browse, or map samples before making a complete beat fails the product boundary. The expected proof remains a sample-free beat made from built-in drums, synth 808/bass, melody/chords, arrangement, mixer/master, and export.

Mixer/master work must keep mixing and mastering separate. Volume, pan, mute, solo, master output gain, and preset ceiling controls must affect both realtime playback and WAV export when implemented. Loudness presets are targets and checks, not automatic proof that a beat is platform-safe.

Channel EQ work must keep low-cut/air controls in mixer state, migrate older project files safely, keep non-master track EQ separate from master processing, and make EQ values affect realtime playback, full-mix WAV export, and stem export.

Channel dynamics work must keep Drive/Glue controls in mixer state, migrate older project files safely, keep non-master track saturation/compression separate from master processing, label simplified compression honestly, and make Drive/Glue values affect realtime playback, full-mix WAV export, and stem export.

FX send work must keep Space/send controls in mixer state, migrate older project files safely, use deterministic built-in processing rather than imported audio or plugin hosting, make send amount audible in realtime playback and full-mix WAV export, prevent muted, solo-excluded, or arrangement-muted tracks from leaking into the FX return, and keep stem export isolated to the requested stem's own send return.
