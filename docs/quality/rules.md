
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

Key Compass work must derive scale notes, chord motion, 808/bass posture, melody posture, and selected-note or selected-chord focus only from local key, selected Pattern A/B/C musical event data, and current editor selection state; remain read-only; avoid mutating project state, changing recommendations, applying chord or note edits, triggering playback, or triggering exports; preserve key retargeting, Pattern A/B/C independence, note/chord editing, save/load, undo/redo, realtime playback, WAV/stem/MIDI export, Beat Readiness, Beat Map, Production Snapshot, Next Move, and Handoff semantics; and avoid sampling, imported audio, remote AI, remote analysis, plugin hosting, music-theory guarantees, accounts, analytics, or cloud sync.

Groove Compass work must derive selected-pattern drum density, kick/clap anchor, hat motion, timing feel, chance posture, and selected drum focus only from local Pattern A/B/C drum pattern, velocity, microtiming, probability, and hat repeat data; remain read-only; avoid mutating project state, changing recommendations, applying drum edits, triggering playback, or triggering exports; preserve Pattern A/B/C independence, drum editing, save/load, undo/redo, realtime playback, WAV/stem/MIDI export, Beat Readiness, Beat Map, Production Snapshot, Key Compass, Next Move, and Handoff semantics; and avoid sampling, imported audio, remote AI, remote analysis, plugin hosting, groove correctness guarantees, accounts, analytics, or cloud sync.

Composer Guide work must derive drums, 808/bass, harmony, melody, arrangement, and finish posture only from local selected Pattern A/B/C event data, arrangement blocks, selected Delivery Target, Beat Readiness, deterministic export analysis, and deterministic stem analysis; remain read-only; avoid mutating project state, changing recommendations, applying musical edits, triggering playback, or triggering exports; preserve Pattern A/B/C independence, editing, save/load, undo/redo, realtime playback, WAV/stem/MIDI export, Beat Readiness, Beat Map, Production Snapshot, Key Compass, Groove Compass, Next Move, and Handoff semantics; and avoid sampling, imported audio, remote AI, remote analysis, plugin hosting, songwriting guarantees, accounts, analytics, or cloud sync.

Mode Focus work must derive Guided/Studio orientation only from local project state and existing Composer Guide, Beat Map, Review Queue, and Finish Checklist summaries; remain read-only; avoid mutating project state, changing recommendations, applying edits, triggering playback, save, or export; preserve mode save/load semantics, all existing controls, realtime playback, WAV/stem/MIDI export, and Handoff semantics; and avoid sampling, imported audio, remote AI, remote analysis, plugin hosting, accounts, analytics, or cloud sync.

Composer Actions work must derive action buttons, style priorities, thresholds, copy, scope previews, impact previews, undo posture, post-click result metrics, audition cues, and next checks only from local selected Pattern A/B/C event data, Composer Guide posture, selected style profile, Beat Readiness, arrangement blocks, selected Delivery Target, deterministic export analysis, deterministic stem analysis, current master state, and explicit local preset definitions; run only after explicit user clicks; keep previews, result strips, audition cues, and next checks informational rather than modal confirmations, autoplay, or export triggers; keep result strips UI-only and out of saved project data; route mutating buttons only through existing undoable Drum Foundation, 808 Bassline, Chord Progression, Melody Motif, Pattern Fill, Pattern Chain, arrangement template, Beat Blueprint, and Master Finish handlers; preserve read-only guide surfaces, Pattern A/B/C independence, save/load, undo/redo, realtime playback, WAV/stem/MIDI export, Beat Readiness, Beat Map, Production Snapshot, Key Compass, Groove Compass, Next Move, and Handoff semantics; and avoid sampling, imported audio, remote AI, remote analysis, hidden generation, plugin hosting, songwriting guarantees, genre-authenticity claims, accounts, analytics, or cloud sync.

Beat Blueprint work must apply deterministic sample-free project starts from local style, key, BPM, Pattern A/B/C event data, arrangement templates, sound presets, mixer balance, and master presets; keep the result fully editable and undoable; preserve title, mode, metronome, save/load, playback, WAV/stem/MIDI export semantics; and avoid remote AI, imported audio, sampling, plugin hosting, hidden randomness, or hidden assets.

Delivery Target work must store the selected fixed or custom target in local project state, migrate older files to a safe default target and bounded default custom target, keep target selection and custom target editing separate from target alignment, route custom edits and alignment changes through explicit undoable project update paths, preserve Pattern A/B/C event data, save/load, snapshots, realtime playback, WAV/stem/MIDI export, Beat Readiness, Beat Map, Next Move, Handoff Sheet, and Mix Coach semantics, and avoid platform compliance, LUFS/true-peak claims, professional mastering guarantees, sampling, imported audio, plugin hosting, remote AI, remote analysis, hidden automation, accounts, analytics, or cloud sync.

Session Brief work must store bounded artist, vibe, reference, and notes text in local project state, migrate older files to empty defaults, preserve save/load, snapshots, undo/redo, realtime playback, WAV/stem/MIDI export, Beat Readiness, Beat Map, Next Move, Mix Coach, and Delivery Target semantics, and avoid media uploads, copyrighted reference audio, remote AI, remote analysis, collaboration, accounts, analytics, cloud sync, sampling, imported audio, plugin hosting, hidden automation, or compliance claims.

Key retarget work must update Pattern A/B/C 808/bass note pitches, melody note pitches, and chord roots by scale degree, preserve event timing, length, velocity, glide, and chance fields, remain undoable, and avoid imported audio or sampling dependencies.

Chord progression work must preserve Pattern A/B/C independence, keep chord roots and progression presets scale-aware by default, migrate older project files without chord events, keep add/delete operations undoable, preserve at least one chord event in guided editing, and make chord events audible in both realtime playback and WAV export.

Chord Pad work must derive pad roots and qualities from the current key, update only the selected chord event after an explicit click through existing undoable chord update paths, preserve step/length/velocity/chance unless directly edited, keep chord events editable local musical data, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Chord Rhythm Pad work must derive chord length, velocity, and chance changes from explicit local rhythm presets, update only the selected Pattern A/B/C chord event data through undoable project history, keep chord counts, steps, roots, qualities, and inversions stable, keep results manually editable through the Chord Editor, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Chord Voicing Pad work must derive chord quality, inversion, length, velocity, and chance changes from explicit local voicing presets, update only the selected Pattern A/B/C chord event through existing undoable chord update paths, preserve chord step/root and chord event counts, keep results manually editable through the Chord Editor, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Chord inversion work must migrate older chord events to root position, preserve per-chord inversion data across Pattern A/B/C copy, save/load, undo/redo, realtime playback, WAV export, and stem export, and keep inversions as editable musical event data rather than imported audio.

Selected chord edit tool work must keep chord move, copy, paste, duplicate, delete, and inversion actions scoped to the selected Pattern A/B/C slot, derive selected-chord harmonic readouts only from local key and chord root/quality/inversion fields, keep chord clipboard and harmonic readout state UI-local and out of saved project schema, paste copied chords only into the next empty chord step, preserve root/quality/inversion/length/velocity/chance fields unless directly edited, avoid overlapping pasted, duplicate, or moved chord starts at the same step, preserve at least one chord event, keep paste/duplicate/move/delete actions undoable, and keep realtime playback, WAV/stem export, and MIDI export driven by editable chord event data rather than imported audio, sampling, remote AI, or hidden audio assets.

Sound design work must keep tone parameters in project state, migrate older project files without sound data, and make preset or Studio tone changes audible in both realtime playback and WAV export.

Sound Focus Pad work must derive kick, drum, 808, sidechain, synth, and chord tone changes from explicit local tone-posture presets, update only editable `SoundDesign` state through undoable project history, mark the result as custom when needed, keep manual Sound Designer controls editable, preserve musical events, arrangement, mixer/master, project files, snapshots, realtime playback, WAV/stem/MIDI export, and Handoff Sheet semantics, and avoid sampling, imported audio, hidden generation, remote AI, plugin hosting, accounts, analytics, or cloud sync.

Drum Kit Pad work must derive built-in kick, clap, and hat tone posture plus `drum_rack` channel mix from explicit local kit presets, update only editable `SoundDesign` drum parameters and the `drum_rack` mixer channel through undoable project history, keep Sound Designer and Mixer controls manually editable, preserve Pattern A/B/C musical events, arrangement, non-drum mixer channels, master state, Delivery Target, Beat Readiness, Beat Map, Next Move, project files, snapshots, realtime playback, WAV/stem/MIDI export, and Handoff Sheet semantics, and avoid sampling, imported audio, sample packs, sampler mapping, hidden generation, remote AI, plugin hosting, accounts, analytics, or cloud sync.

Sidechain work must keep kick-to-808 ducking as editable local sound-design state, migrate older project files without sidechain data, and apply the same deterministic gain rule to realtime playback, full-mix WAV export, and 808 stem export.

Project file work must reject invalid imports without overwriting the current project and must preserve edited drum, bass, chord, melody, sound design, mixer, master, key, BPM, style, and arrangement data on save/load.

Local draft recovery work must write only bounded versioned GrooveForge project JSON to renderer localStorage after project edits, validate drafts through the normal project parser before showing Restore Draft, keep Restore and Clear as explicit user-clicked actions, preserve `.grooveforge.json` Save/Open as the durable workflow, keep clearing a draft from deleting or mutating the current project, avoid file downloads, exports, media blobs, imported audio, sampling, accounts, analytics, cloud sync, remote AI, or hidden background storage, and keep restore undoable through project history.

Project Snapshot work must store snapshots as local project-file data, migrate older projects to an empty snapshot list, keep snapshot payloads free of nested snapshots, preserve save/load and undo/redo semantics, allow save/rename/restore/delete without cloud sync or accounts, keep snapshot names bounded and normalized, and avoid sampling, remote AI, hidden audio assets, destructive filesystem versioning, or analytics.

Snapshot Compare work must derive current-vs-saved snapshot comparison only from local project state, saved Project Snapshot payloads, deterministic export analysis, deterministic stem analysis, Beat Readiness, selected Delivery Target, and master state; remain read-only; avoid restoring, deleting, renaming, saving, mutating snapshots, triggering exports, or changing recommendations; preserve Project Snapshots, save/load, undo/redo, realtime playback, WAV/stem/MIDI export, Beat Passport, Finish Checklist, Review Queue, Beat Map, Next Move, Mix Coach, Master Finish, and Handoff semantics; and avoid sampling, imported audio, plugin hosting, remote AI, remote analysis, platform compliance, professional mastering, accounts, analytics, or cloud sync claims.

Pattern work must keep Pattern A/B/C as independent editable event data. Copy and clear tools must operate on the selected pattern slot without deleting the slot itself. Pattern Compare work must derive event, track, and arrangement-use summaries from local Pattern A/B/C and arrangement state; Cue must switch only selected-pattern preview state without autoplay or undo history; Use must route selected-block pattern changes through existing undoable arrangement updates. Pattern preview playback should loop the selected pattern, while arrangement playback and WAV export should follow arrangement pattern assignments.

Pattern DNA work must derive selected Pattern A/B/C layers, density, variation signals, and arrangement use only from local Pattern A/B/C drum hits, 808/bass notes, chord events, melody notes, probability, timing, velocity, hat-repeat, glide, and arrangement-block data; remain read-only; avoid mutating Pattern A/B/C, arrangement, mixer, sound, master, snapshots, playback, save, or export state; preserve Pattern Compare, Groove Compass, Composer Guide, Beat Map, Next Move, realtime playback, WAV/stem/MIDI export, and Handoff semantics; and avoid sampling, imported audio, remote AI, remote analysis, hidden generation, accounts, analytics, or cloud sync.

Export Preflight work must derive delivery-risk status only from local Beat Readiness, deterministic export analysis, deterministic stem analysis, selected Delivery Target, arrangement length, and Session Brief data; remain read-only; avoid changing WAV, stem, MIDI, or Handoff Sheet export contents or mutating project musical events, arrangement, mixer, master, targets, Session Brief, snapshots, playback, save/load, or export state; preserve Handoff Pack, Finish Checklist, Review Queue, Beat Map, Mix Coach, Export Meter, realtime playback, WAV/stem/MIDI export, and Handoff semantics; and avoid sampling, imported audio, remote AI, remote analysis, hidden generation, accounts, analytics, or cloud sync.

Workflow Navigator work must derive Compose, Arrange, Mix, and Deliver jump labels only from local Beat Map, Export Preflight, selected Pattern A/B/C, arrangement length, and export status; remain UI-only; perform explicit scroll navigation without mutating project musical events, arrangement, mixer, master, targets, Session Brief, snapshots, playback, save/load, undo history, or export state; avoid hiding controls by mode or replacing Mode Focus, Composer Guide, Beat Map, Next Move, Handoff Pack, or panel controls; and avoid sampling, imported audio, remote AI, remote analysis, hidden generation, accounts, analytics, or cloud sync.

Pattern variation work must be deterministic, operate only on the selected Pattern A/B/C slot through undoable project history, keep generated drums, bass, melody, chords, velocities, timings, repeats, and probabilities manually editable, and avoid sampling, remote AI, or hidden audio assets.

Pattern Clone Pad work must clone the selected Pattern A/B/C data into an explicit target slot after a user click, apply only existing deterministic variation presets to the clone, switch editing focus to the target slot, keep results manually editable through existing pattern editors, preserve arrangement block assignments unless the user changes them separately, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Pattern Stack Pad work must derive 808/bass notes, chord events, and Synth melody notes from the current key after an explicit click, update only the selected Pattern A/B/C bass, chord, and melody event data through undoable project history, keep results manually editable through existing lane editors and inspectors, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Groove Feel Pad work must derive drum timing, drum chance, note chance, and chord chance changes from explicit local feel presets, update only the selected Pattern A/B/C timing and probability event data through undoable project history, keep event counts stable and results manually editable through existing timing, chance, note, and chord controls, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Drum Foundation Pad work must derive selected Pattern A/B/C kick, clap, hat, and perc foundations from explicit local rhythm presets, update only selected Pattern A/B/C drum pattern, velocity, timing, probability, and hat repeat data through undoable project history, keep results manually editable through the drum grid and inspector, preserve realtime playback plus WAV/stem export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Drum Accent Pad work must derive drum velocity changes from explicit local accent presets, update only the selected Pattern A/B/C active drum velocity data through undoable project history, keep active drum steps stable and results manually editable through existing velocity controls, preserve realtime playback plus WAV/stem export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Selected drum hit clipboard/readout work must keep copied hit state and pocket readout labels UI-local and out of saved project schema, derive selected-drum pocket readouts only from the selected Pattern A/B/C lane, step, active state, velocity, chance, microtiming, and hat-repeat fields, copy only active drum hits, paste copied hits only into the copied lane's next empty step in the selected Pattern A/B/C slot, preserve lane, velocity, chance, microtiming, and hat-repeat shape, avoid overlapping pasted hits in the same lane and step, keep paste edits undoable and manually editable through existing drum controls, preserve realtime playback plus WAV/stem export semantics, and avoid system clipboard integration, sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Pattern Fill work must be deterministic, operate only on the selected Pattern A/B/C slot through undoable project history, edit only local drum, 808/bass, melody, and chord-tail event data, keep Drum Fill/808 Pickup/Melody Turn/Clear Tail results manually editable, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, remote AI, hidden randomness, or hidden audio assets.

808 Bassline Pad work must derive 808/bass notes from the current key after an explicit click, update only the selected Pattern A/B/C bass notes through undoable project history, keep results manually editable through the note grid and inspector, preserve glide, chance, realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

808 Glide Pad work must derive 808/bass note length, glide, and chance changes from explicit local movement presets, update only the selected Pattern A/B/C bass note data through undoable project history, keep bass note counts and pitches stable, keep results manually editable through the note grid and inspector, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

808 Contour Pad work must derive 808/bass pitch direction changes from explicit local contour presets, update only the selected Pattern A/B/C bass note data through undoable project history, keep bass note counts, step positions, lengths, glide flags, and chance values stable, keep results manually editable through the note grid and inspector, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Melody Motif Pad work must derive Synth melody notes from the current key after an explicit click, update only the selected Pattern A/B/C melody notes through undoable project history, keep results manually editable through the note grid and inspector, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Melody Accent Pad work must derive Synth melody velocity and chance changes from explicit local accent presets, update only the selected Pattern A/B/C melody note data through undoable project history, keep melody note counts, steps, pitches, and lengths stable, keep results manually editable through the note grid and inspector, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Melody Contour Pad work must derive Synth melody pitch contour, length, velocity, and chance changes from explicit local contour presets, update only the selected Pattern A/B/C melody note data through undoable project history, preserve melody note counts and step positions, keep results manually editable through the note grid and inspector, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid sampling, imported audio, hidden generation, remote AI, accounts, analytics, or cloud sync.

Beat Readiness work must derive checks from editable Pattern A/B/C, arrangement, and deterministic export analysis data, remain read-only, avoid mutating project state or generating musical events, preserve realtime playback and WAV/stem/MIDI export semantics, and avoid imported audio, sampling, plugin hosting, remote AI, or remote analysis dependencies.

Beat Passport work must derive compact target, length, Pattern A/B/C, readiness, export, stem, and master posture summaries only from local project state, Beat Readiness, deterministic export analysis, deterministic stem analysis, selected Delivery Target, and master state; remain read-only; avoid mutating project state or triggering renders/downloads; and avoid imported audio, sampling, platform compliance, LUFS, true-peak, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync.

Production Snapshot work must derive target fit, song form, Pattern A/B/C coverage, mix posture, and handoff posture only from local project state, Beat Readiness, arrangement blocks, Pattern A/B/C event data, deterministic export analysis, deterministic stem analysis, selected Delivery Target, Mix Coach checks, and Session Brief fields; remain read-only; avoid mutating project state, triggering exports, saving snapshots, applying fixes, or changing recommendations; preserve realtime playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Sheet, Beat Passport, Finish Checklist, Review Queue, Beat Map, Structure Lens, Song Form Overview, Next Move, Mix Coach, and Master Finish semantics; and avoid sampling, imported audio, plugin hosting, remote AI, remote analysis, platform compliance, LUFS, true-peak, publishing, licensing, professional mastering, accounts, analytics, or cloud sync claims.

Finish Checklist work must derive Compose, Arrange, Mix, Master, and Handoff readiness only from local project state, Beat Readiness, Structure Lens posture, deterministic export analysis, deterministic stem analysis, Mix Coach checks, selected Delivery Target, and Session Brief fields; remain read-only; avoid mutating project state, triggering exports, or changing recommendations; preserve realtime playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Sheet, Beat Passport, Beat Map, Next Move, Mix Coach, and Master Finish semantics; and avoid sampling, imported audio, plugin hosting, remote AI, remote analysis, platform compliance, LUFS, true-peak, publishing, licensing, professional mastering, accounts, analytics, or cloud sync claims.

Review Queue work must derive prioritized production issues only from local project state, Beat Readiness, Structure Lens signals, deterministic export analysis, deterministic stem analysis, Mix Coach checks, selected Delivery Target, and Session Brief fields; remain read-only; avoid mutating project state, triggering exports, auto-fixing, or changing recommendations; preserve realtime playback, save/load, undo/redo, WAV/stem/MIDI export, Handoff Sheet, Beat Passport, Finish Checklist, Beat Map, Next Move, Mix Coach, and Master Finish semantics; and avoid sampling, imported audio, plugin hosting, remote AI, remote analysis, platform compliance, LUFS, true-peak, publishing, licensing, professional mastering, accounts, analytics, or cloud sync claims.

Beat Map work must derive workflow stages, song/pattern metrics, Session Brief status, export state, stem state, and action suggestions only from local project state, selected Delivery Target, Beat Readiness, deterministic export analysis, and deterministic stem analysis; remain read-only by default; route all mutating action buttons through existing explicit undoable handlers; preserve Beat Readiness, Next Move, Mix Coach, realtime playback, WAV/stem/MIDI export, save/load, and undo/redo semantics; and avoid sampling, imported audio, plugin hosting, remote AI, remote analysis, hidden automation, accounts, analytics, cloud sync, or professional mastering/commercial release claims.

Structure Lens work must derive target fit, section coverage, hook contrast, and energy arc only from local arrangement blocks, Pattern A/B/C usage, and the selected Delivery Target; remain read-only until explicit user clicks; route action buttons through existing undoable arrangement, Pattern Chain, target alignment, or Hook Lift paths; preserve Beat Readiness, Beat Map, Next Move, realtime playback, WAV/stem/MIDI export, save/load, and undo/redo semantics; and avoid sampling, imported audio, remote AI, remote analysis, hidden auto-arrangement, accounts, analytics, cloud sync, publishing, licensing, or platform compliance claims.

Song Form Overview work must derive section flow, Pattern A/B/C usage, selected block, energy range, bar spans, muted-track posture, and segment tones only from local arrangement blocks, Pattern A/B/C event data, selected Delivery Target, and existing arrangement helpers; route segment clicks only through existing selected-block navigation without creating undo history or mutating arrangement, Pattern A/B/C, mixer, sound, master, export, snapshot, Beat Map, Structure Lens, Next Move, or Handoff state; preserve realtime playback plus WAV/stem/MIDI export semantics; and avoid sampling, imported audio, remote AI, remote analysis, hidden auto-arrangement, accounts, analytics, cloud sync, publishing, licensing, or platform compliance claims.

Next Move work must derive deterministic recommendations, post-click result metrics, audition cues, and next checks from local project, Beat Readiness, export analysis, selected Delivery Target, arrangement blocks, snapshots, and explicit action definitions; keep Beat Readiness cards read-only; run only after explicit user button clicks; keep result strips UI-only and informational rather than modal confirmations, autoplay, auto-save, or export triggers; route mutating actions through undoable project update paths; and avoid imported audio, sampling, plugin hosting, remote AI, remote analysis, hidden automation, accounts, or analytics.

Next Move Pattern Chain work must recommend Pattern Chain only from local readiness state, route the click through the existing undoable `applyPatternChain` path, keep Full Beat available as an explicit alternative when arrangement structure is weak, avoid mutating Beat Readiness, and preserve realtime playback plus WAV/stem/MIDI export semantics.

Finish Move Action work must route Master Finish recommendations and Quick Actions through existing `applyMasterFinishPad`, keep actions explicit, local, undoable, and editable, update only master state and master mixer volume, preserve project/render semantics, and avoid hidden automatic mastering, LUFS, true-peak, platform claims, sampling, imported audio, or remote AI.

Selected note edit tool work must keep 808 and Synth note move, transpose, octave, copy, paste, and duplicate actions scoped to the selected Pattern A/B/C slot, derive selected-note degree/role readouts only from local key and pitch, keep note clipboard and readout state UI-local and out of saved project schema, paste copied notes only into the copied track's next empty step, preserve length/glide/velocity/chance fields, avoid overlapping duplicate or pasted notes at the same step and pitch, keep pitch moves scale-aware, keep paste/duplicate/move edits undoable, and avoid sampling, remote AI, or hidden audio assets.

Arrangement editor work must let users change a block's section, Pattern A/B/C assignment, bar length, and energy without losing existing pattern, mixer, master, or save/load data. Selecting or reassigning a block should keep the pattern editor aligned with that block's assigned pattern. Selected-block role readouts must derive only from local arrangement block, timeline, pattern-event, energy, and muted-track fields, stay UI-local and out of saved project schema, avoid changing Song Form Overview or Structure Lens semantics, and preserve playback, WAV/stem export, and MIDI export behavior.

Arrangement track mute work must migrate older arrangement blocks to no muted tracks, keep mutes scoped to the selected block without mutating Pattern A/B/C events, apply the same mute decisions to realtime arrangement playback, full-mix WAV export, and stem export, and preserve selected-pattern preview behavior.

Arrangement structure work must preserve at least one block, keep selection/pattern alignment after copy, paste, duplicate, move, and delete actions, keep arrangement block clipboard state UI-local and out of saved project schema, paste copied blocks after the selected block, preserve section, Pattern A/B/C assignment, bar length, energy, and muted-track fields unless directly edited, avoid mutating Pattern A/B/C musical event data, keep paste/duplicate/move/delete actions undoable, and make realtime playback plus WAV/stem/MIDI export follow the current arrangement length.

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

Arrangement Arc Pad work must derive full-song section, Pattern A/B/C assignment, bar length, energy, and muted-track posture from explicit local arc presets, update only existing arrangement block fields through undoable project history, keep block counts stable, keep arrangement controls manually editable, preserve Pattern A/B/C musical events, mixer, sound design, master state, Delivery Target, Beat Readiness, Beat Map, Structure Lens, Next Move, project files, snapshots, realtime playback, WAV/stem/MIDI export, and Handoff Sheet semantics, and avoid sampling, imported audio, audio clips, hidden auto-arrangement, remote AI, plugin hosting, accounts, analytics, or cloud sync.

Live playback edit work must read current project state while scheduling future steps, let selected-pattern preview and arrangement playback respond to edits without stopping, update BPM and master output changes on future scheduling/output, preserve Stop and Space behavior, and state that already-triggered audio is not rewritten.

Undo/redo work must record bounded local project-edit history for editing actions, ignore playback/export side effects, keep keyboard shortcuts out of focused inputs, and clear history when a different project file is loaded.

Desktop shortcut work must keep playback, Pattern A/B/C selection, save/open, undo/redo, and selected event deletion scoped to the app window, must not fire from focused editable controls, and must route destructive deletion through normal undoable project history.

Keyboard Capture work must route desktop key presses into scale-locked 808 or Synth notes as editable local musical events, keep focused inputs/textareas/selects/contenteditable controls protected, make every captured note undoable through project history, expose the target, target-specific octave bank, degree-labeled key map, and UI-local capture defaults in the 808/Melody editor, apply captured-note octave/length plus Synth velocity and 808 glide defaults only to newly captured notes, keep degree labels and capture defaults out of saved project schema, and avoid Web MIDI permission prompts, audio recording, sampling, imported audio, sampler tracks, remote AI, accounts, analytics, or cloud sync.

Quick Actions work must remain local and explicit; must not fire while focused editable targets receive keyboard input; must route mutating commands through existing undoable project update paths; must keep project/open/save/export actions user-triggered; must derive post-run result status, metrics, audition cues, and next checks only from explicit command metadata and local before/after project state; must keep result strips UI-only and informational rather than modal confirmations, macros, autoplay, auto-save, auto-export, or project data; and must avoid scripting, global OS shortcuts, sampling, plugin hosting, remote AI, automation recording, accounts, analytics, or cloud sync.

Export work must verify a non-silent WAV with expected duration, expected sample rate/channel count, no audio frames above the selected ceiling, and reproducibility from saved project data.

Render noise work must keep offline WAV export, stem export, and export meter analysis deterministic from render-relevant project data, avoid `Math.random()` in the offline render path, and avoid tying audio output to transient UI mode, project title, save timestamps, remote services, imported samples, or hidden audio assets.

Export meter work must label measurements honestly as peak, RMS, headroom, and limiter activity unless a standards-complete LUFS or true-peak implementation is added and validated.

Stem export work must render isolated drum, 808, synth, and chord WAV files from the current arrangement, keep full-mix WAV export intact, and avoid depending on imported audio or sample assets.

Stem level meter work must derive drum, 808, synth, and chord meter values from the deterministic offline stem render path, show peak/RMS/headroom honestly without LUFS or true-peak claims, avoid mutating project state, keep existing realtime playback and WAV/stem/MIDI export semantics intact, and avoid imported audio, sampling, plugin hosting, or remote analysis dependencies.

Mix Coach work must derive suggestions only from deterministic full-mix and stem export analysis, remain read-only, preserve project state and existing realtime/WAV/stem/MIDI export semantics, communicate peak/RMS/headroom/limiter/stem-balance checks without LUFS, true-peak, platform compliance, or mastering-fix claims, and avoid imported audio, sampling, plugin hosting, remote AI, or remote analysis dependencies.

Mix Fix work must run only after explicit user button clicks, derive action tone from deterministic local full-mix/stem analysis, route all mixer/master changes through undoable project update paths, keep fixes limited to editable mixer/master state, avoid hidden automatic mastering, and avoid LUFS, true-peak, platform compliance, sampling, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync claims.

Master Finish Pad work must derive master preset, ceiling, and master output gain from explicit local demo, vocal, store, and club posture presets; update only editable master state and the master mixer channel volume through undoable project history; preserve musical events, arrangement, sound design, non-master mixer channels, Delivery Target, Beat Readiness, Beat Map, Next Move, Mix Coach, project files, snapshots, realtime playback, WAV/stem/MIDI export, and Handoff Sheet semantics; keep manual master controls editable; and avoid hidden automatic mastering, LUFS, true-peak, platform compliance, sampling, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync claims.

Master output role readout work must derive only from local master preset, master ceiling, master mixer output gain, and deterministic export analysis; stay UI-local and out of saved project schema; preserve Master Finish Pads, Mix Coach, Export Meter, playback, WAV/stem/MIDI export, and Handoff Sheet semantics; and avoid hidden automatic mastering, LUFS, true-peak, platform compliance, sampling, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync claims.

Stem Audition Pad work must derive Full Mix/Drums/808/Synth/Chords audition states from explicit local pad definitions, update only existing mixer `solo` and `muted` fields through undoable project history, keep mixer controls manually editable afterward, preserve musical events, arrangement blocks, volume/pan/EQ/Drive/Glue/Space, sound design, master state, Delivery Target, Beat Readiness, Beat Map, Next Move, Finish Checklist, Review Queue, project files, snapshots, realtime playback, WAV/stem/MIDI export, and Handoff Sheet semantics, and avoid rendered stem playback, stem separation, sampling, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync.

Mix Balance Pad work must derive mixer channel volume, pan, low-cut, air, Drive/Glue, and Space send changes from explicit local rough-balance presets, update only editable mixer channel state through undoable project history, keep musical events, arrangement, sound design, master preset, Delivery Target, Beat Readiness, Beat Map, Next Move, Mix Coach, project files, snapshots, realtime playback, WAV/stem/MIDI export, and Handoff Sheet semantics intact, keep results manually editable through existing Mixer controls, and avoid hidden mastering, render downloads, sampling, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync.

MIDI export work must write deterministic Standard MIDI Files from editable project events, follow arrangement Pattern A/B/C assignments, block lengths, track mutes, BPM, drum repeats, note/chord lengths, and chord inversions, include drum, 808, synth, and chord tracks, and avoid depending on rendered audio, imported samples, or sampler assets.

Handoff Sheet export work must write a local plain text summary only after an explicit user click, derive content from local project state, selected Delivery Target, Session Brief, arrangement data, deterministic export analysis, and deterministic stem analysis, avoid mutating project state or triggering audio render downloads, preserve realtime playback plus WAV/stem/MIDI export semantics, and avoid media uploads, copyrighted reference audio, platform compliance, publishing, licensing, LUFS/true-peak guarantees, sampling, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync.

Handoff Pack work must group WAV, stem, MIDI, and Handoff Sheet deliverables as explicit user-clicked actions routed through existing export handlers, derive status only from local project state, selected Delivery Target, deterministic export analysis, deterministic stem analysis, and Session Brief fields, avoid auto-export/background render/downloads, preserve existing realtime playback plus WAV/stem/MIDI/Handoff Sheet semantics, and avoid media uploads, platform compliance, publishing, licensing, LUFS/true-peak guarantees, sampling, imported audio, plugin hosting, remote AI, remote analysis, accounts, analytics, or cloud sync.

Product framing work must preserve the core boundary: GrooveForge is for all-genre beat creation, pattern programming, sound design, arrangement, mixing/mastering, and export first; sampling is an optional extension and should not dominate MVP docs, UI copy, architecture, roadmap order, or plan titles.

Concept correction work must make the all-genre beat-production mini DAW framing explicit: direct beat composition, sound design, arrangement, mixing/mastering, and export are the product spine, while sample import, chopping, pitch/stretch, one-shot mapping, and sampler workflows are optional later paths.

Concept correction work must preserve this center list in durable docs: Pattern Programming, Drum Sequencing, 808/Bass Synthesis, Melody/Chord Composition, Sound Design, Arrangement, Mixing, Mastering, and Export.

Concept correction work must preserve the user's intent that GrooveForge is for "비트(모든 장르)를 만드는" work, not a trap-only, sample-pack, or sampler-first product.

Brief alignment work fails if the project can be summarized as a sampling app, sample-chopping tool, sample-pack workflow, or sampler setup surface. The expected summary is an all-genre beat-production mini DAW where sampling is an accessory module.

First-run UX, default navigation, and roadmap work must lead with direct beat composition: pattern programming, drums, 808/bass, melody/chords, sound design, arrangement, mixer/master, and export. Sample browsing, chopping, sampler setup, audio clips, and audio warping must stay opt-in optional-sampling paths unless the user explicitly changes the product direction.

Sampling placement work fails if the default empty project, first visible action, MVP proof, primary navigation, onboarding language, priority table, or plan title makes sample browsing, sample import, chopping, sampler setup, or audio clips appear before editable musical events and beat-making controls.

Sampling placement work also fails if product drafts, README sections, architecture diagrams, or roadmap summaries present an optional sampling sequence as a co-equal product spine beside the direct beat-composition sequence. Sampling references must stay structurally subordinate to the all-genre beat-making core unless the user explicitly starts an optional-sampling phase.

Docs that mention clips before optional sampling is implemented must clarify that core clips are pattern, MIDI, or automation containers, not imported audio assets.

Any new plan that mentions sample import, chopping, sampler tracks, or audio warping must explicitly mark that work as optional sampling-phase work or document the user-approved exception in its Decision Log.

Any product, architecture, UI, roadmap, or QA wording that implies users must import, chop, browse, or map samples before making a complete beat fails the product boundary. The expected proof remains a sample-free beat made from built-in drums, synth 808/bass, melody/chords, arrangement, mixer/master, and export.

Any product or architecture wording that promotes `AudioClipEvent`, sampler assets, sample browsing, or chopping above editable musical events fails the product boundary until optional sampling is explicitly in scope.

Any future optional-sampling schema must keep `NoteEvent`, `DrumHitEvent`, and automation sufficient for a complete beat, and must keep `AudioClipEvent` additive, opt-in, and outside the core MVP proof.

Data model examples fail the product boundary if they add `AudioClipEvent` to the core `MusicalEvent` union or include `audio`/`sampler` in the MVP track union or default project track list before an explicit optional-sampling plan exists.

Mixer/master work must keep mixing and mastering separate. Volume, pan, mute, solo, master output gain, and preset ceiling controls must affect both realtime playback and WAV export when implemented. Mixer channel role readouts must derive only from local mixer channel volume, pan, mute, solo, low-cut, air, Drive/Glue, and Space send fields, stay UI-local and out of saved project schema, avoid changing Mix Coach, Mix Balance Pads, Stem Audition Pads, Master Finish, playback, or export semantics, and avoid hidden mixing, mastering, LUFS/true-peak, platform-safety claims, sampling, imported audio, remote AI, accounts, analytics, or cloud sync. Loudness presets are targets and checks, not automatic proof that a beat is platform-safe.

Channel EQ work must keep low-cut/air controls in mixer state, migrate older project files safely, keep non-master track EQ separate from master processing, and make EQ values affect realtime playback, full-mix WAV export, and stem export.

Channel dynamics work must keep Drive/Glue controls in mixer state, migrate older project files safely, keep non-master track saturation/compression separate from master processing, label simplified compression honestly, and make Drive/Glue values affect realtime playback, full-mix WAV export, and stem export.

FX send work must keep Space/send controls in mixer state, migrate older project files safely, use deterministic built-in processing rather than imported audio or plugin hosting, make send amount audible in realtime playback and full-mix WAV export, prevent muted, solo-excluded, or arrangement-muted tracks from leaking into the FX return, and keep stem export isolated to the requested stem's own send return.
