
# Official Sources

Record official documentation, platform docs, standards, laws, policies, or vendor references used by this project.

| source | url | scope | checked_at | used_for |
|---|---|---|---|---|
| W3C Web Audio API | https://www.w3.org/TR/webaudio/ | Browser audio graph, AudioContext, OfflineAudioContext, AudioWorklet references | 2026-06-15 | Web audio engine and export architecture |
| MDN AudioWorkletNode | https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode | Browser implementation guide for custom audio nodes | 2026-06-15 | Custom DSP planning |
| W3C Web MIDI API | https://webaudio.github.io/web-midi-api/ | Browser MIDI devices, messages, permission gating, and System Exclusive boundary | 2026-06-17 | Web MIDI input capture for explicit local 808/Synth note entry |
| Akai Professional MPC One+ | https://www.akaipro.com/mpc-one-plus/ | Standalone MPC sequencing, pads, instruments, connectivity, and beat-production workflow | 2026-07-29 | Hardware workflow benchmark; not a sampling-first product decision |
| Akai Professional MPC: Why doesn't Overdub work for audio recordings? | https://support.akaipro.com/en/support/solutions/articles/69000863018-mpc-why-doesn-t-the-overdub-button-work-for-audio-recordings- | MIDI Overdub versus audio-recording boundary in MPC workflow | 2026-07-29 | Pattern Live Overdub terminology and event-recording scope |
| Native Instruments Maschine+ Manual: Maschine Overview | https://www.native-instruments.com/ni-tech-manuals/maschine-plus-manual/en/maschine--overview | Transport recording, pads, note repeat/arpeggiator, lock snapshots, step sequencing, automation, and macros | 2026-07-29 | Hardware interaction and performance-workflow benchmark |
| Elektron Digitakt II User Manual OS 1.15 | https://www.elektron.se/wp-content/uploads/2025/06/Digitakt-2-User-Manual_ENG_OS1.15_250625-1.pdf | Grid, Live, and Step recording plus parameter-lock workflow | 2026-07-29 | Recording-mode and step-expression benchmark |
| Roland MC-707 | https://www.roland.com/global/products/mc-707/ | Realtime/step recording, clips/scenes, note repeat, chord design, and track workflow | 2026-07-29 | Composition, live capture, and scene-workflow benchmark |
| Roland TR-8S | https://www.roland.com/nz/products/tr-8s/ | Drum performance, variations, fills, motion recording, and parameter locks | 2026-07-29 | Drum sequencing and live-performance benchmark |
| MDN IndexedDB API | https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API | Browser local structured data and blob storage | 2026-06-15 | Local project and asset cache |
| Electron Docs | https://www.electronjs.org/docs/latest/ | Cross-platform desktop app shell using JavaScript, HTML, and CSS | 2026-06-15 | Desktop MVP shell |
| Electron 39.0 release | https://www.electronjs.org/blog/electron-39-0 | Electron 39 Chromium/V8/Node runtime versions | 2026-07-24 | Confirm Node 22 runtime basis for built-in SQLite3 |
| Electron 43.5.0 release | https://releases.electronjs.org/release/v43.5.0 | Supported Electron 43 patch and runtime identity | 2026-08-31 | Current desktop runtime and macOS 12-compatible security upgrade |
| Electron release schedule | https://releases.electronjs.org/schedule | Supported release lines and EOL dates | 2026-08-31 | Electron 43 support-window boundary |
| GHSA-jmr9-qjv8-65gv | https://github.com/advisories/GHSA-jmr9-qjv8-65gv | `extract-zip` symlink path traversal advisory | 2026-08-31 | Replace the affected Electron 39 installation dependency and restore zero-vulnerability audit |
| Node.js SQLite API | https://nodejs.org/api/sqlite.html | Built-in SQLite DatabaseSync, prepared statements, transactions, and backup API | 2026-07-24 | Main-process SQLite3 project-library adapter |
| SQLite Write-Ahead Logging | https://www.sqlite.org/wal.html | WAL durability, checkpoint, sidecar, concurrency, and persistence behavior | 2026-07-24 | Local project-library journal and shutdown policy |
| SQLite PRAGMA Reference | https://www.sqlite.org/pragma.html | user_version, application_id, synchronous, foreign_keys, trusted_schema, secure_delete, integrity, and busy timeout behavior | 2026-07-24 | SQLite schema identity, safety settings, and QA |
| Apple Developer Documentation: Hardened Runtime | https://developer.apple.com/documentation/security/hardened-runtime | Apple hardened runtime documentation entry point | 2026-06-28 | macOS hardened runtime readiness evidence |
| Apple Developer Documentation: Notarizing macOS software before distribution | https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution | Apple notarization documentation entry point | 2026-06-28 | macOS notarization readiness boundaries |
| Vite Guide | https://vite.dev/guide/ | Dev server and production build tool for modern web projects | 2026-06-15 | Renderer build system |
| React Docs | https://react.dev/learn | React UI implementation reference | 2026-06-15 | Workstation renderer UI |
| TypeScript Docs | https://www.typescriptlang.org/docs/ | TypeScript language and tooling reference | 2026-06-15 | Typed project, event, and UI models |
| Next.js Docs | https://nextjs.org/docs | Candidate web app framework | 2026-06-15 | Web-first MVP stack planning |
| Tailwind CSS Next.js Guide | https://tailwindcss.com/docs/installation/framework-guides/nextjs | Candidate styling setup for Next.js | 2026-06-15 | Future setup commands after stack install |
| Zustand Repository | https://github.com/pmndrs/zustand | Candidate client state store and documentation entry point | 2026-06-15 | Project and UI state planning |
| Tone.js | https://tonejs.github.io/ | Candidate Web Audio prototyping library | 2026-06-15 | Prototype scheduling, synth, and effects exploration |
| JUCE | https://www.juce.com/ | Candidate later native audio app/plugin framework | 2026-06-15 | Native/pro roadmap only |
| Steinberg VST 3 Developer Portal | https://steinbergmedia.github.io/vst3_dev_portal/ | VST3 plugin and host development references | 2026-06-15 | Later plugin-hosting research only |
| ITU-R BS.1770 | https://www.itu.int/rec/R-REC-BS.1770 | Loudness and true-peak measurement standard reference | 2026-06-15 | Loudness meter and mastering target research |
| Spotify for Artists Loudness Normalization | https://support.spotify.com/us/artists/article/loudness-normalization/ | Spotify-specific loudness normalization guidance | 2026-06-15 | Streaming preset research, not a universal mastering rule |
| Ableton Live 12 Reference Manual: Clip View | https://www.ableton.com/en/live-manual/12/clip-view/ | Official clip model reference distinguishing MIDI note editing from audio sample/warp editing | 2026-06-19 | Benchmark context for event-first clip editing; not a sampling-first product decision |
| Apple GarageBand for Mac User Guide | https://support.apple.com/guide/garageband/welcome/mac | Official beginner music-production user guide entry point | 2026-06-19 | Benchmark context for approachable desktop music-making workflows |
| Bitwig Studio User Guide: Working with Audio Events | https://www.bitwig.com/userguide/latest/working_with_audio_events/ | Official audio-event, stretch, onset, and clip editing reference | 2026-06-19 | Optional sampling/clip-extension research only |
| Image-Line FL Studio Manual: Levels, Mixing & Clipping | https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/mixer_levelsandmixing.htm | Official mixing, clipping, and mixing-before-mastering guidance | 2026-06-19 | Mixer/master stage separation and output-posture research |
| Ableton Live 12 Reference Manual: Live Concepts | https://www.ableton.com/en/manual/live-concepts/ | Official Control Bar grouping for tempo, time signature, metronome, scale, and transport controls | 2026-07-23 | Musical project-context readout placement benchmark |
| Apple Logic Pro User Guide: Set the project time signature | https://support.apple.com/guide/logicpro/set-the-project-time-signature-lgcpce102b95/mac | Official project meter definition and LCD time-signature control reference | 2026-07-23 | Time-signature meaning and persistent project-context benchmark |
| SoundCloud Help Center: Upload Requirements | https://help.soundcloud.com/hc/en-us/articles/360039171614-Upload-Requirements | Supported audio formats, lossless upload recommendation, stereo 16-bit / 44.1 kHz-or-higher source guidance, headroom, size and duration guidance | 2026-09-03 | Local 24-bit WAV upload-readiness sheet; 24-bit is a supported higher-bit-depth lossless source, not a platform requirement |
| SoundCloud Help Center: Getting started with Uploading | https://help.soundcloud.com/hc/en-us/articles/46021990888219-Getting-started-with-Uploading | Upload flow, transcoding, metadata, tags, artwork, privacy, license and permissions checklist | 2026-09-03 | Copy-ready local SoundCloud metadata and processed-stream listening checklist |
| SoundCloud Help Center: Edit your track's privacy settings | https://help.soundcloud.com/hc/en-us/articles/46020211210523-Edit-your-track-s-privacy-settings | Public, Private, Scheduled and private-link behavior | 2026-09-03 | Private-first upload posture without changing a user account |
| SoundCloud Help Center: Manage your track's permissions | https://help.soundcloud.com/hc/en-us/articles/31423603670043-Manage-your-track-s-permissions | Original-file downloads, permission controls and rights reminder | 2026-09-03 | Downloads-Off default and explicit rights confirmation before publication |
| SoundCloud Help Center: Best practices for uploading someone else's track | https://help.soundcloud.com/hc/en-us/articles/115003563308-Best-practices-for-uploading-someone-else-s-track | Public and Private uploads both require ownership or permission; credit alone does not grant permission | 2026-09-07 | Private-first requested-pack rights checklist; informational guard, not legal advice |
| SoundCloud Help Center: Distribution Rejections & How to Resolve Them | https://help.soundcloud.com/hc/en-us/articles/48881707977627-Distribution-Rejections-How-to-Resolve-Them | Contributor metadata, rights documentation, audio-match review, misleading version/remix wording, and UGC fingerprinting eligibility cautions | 2026-09-07 | Requested-pack metadata and human listening guard only; distribution, monetization, and Content ID remain Off |

## Rules

- Prefer official sources over blogs or summaries.
- Re-check sources when behavior, pricing, law, platform rules, or API details may have changed.
- Do not turn sources into legal, medical, financial, or compliance conclusions without explicit project authority.

## Source Gaps

- Add browser compatibility references before committing to target browsers.
- Add official docs for any benchmark DAW behavior before copying specific interaction details.
- Add licensing evidence before committing presets, loops, sample packs, or third-party audio fixtures.
- Add encoder/library documentation when a WAV encoder, metering library, or DSP package is selected.
