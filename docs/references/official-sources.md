
# Official Sources

Record official documentation, platform docs, standards, laws, policies, or vendor references used by this project.

| source | url | scope | checked_at | used_for |
|---|---|---|---|---|
| W3C Web Audio API | https://www.w3.org/TR/webaudio/ | Browser audio graph, AudioContext, OfflineAudioContext, AudioWorklet references | 2026-06-15 | Web audio engine and export architecture |
| MDN AudioWorkletNode | https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode | Browser implementation guide for custom audio nodes | 2026-06-15 | Custom DSP planning |
| W3C Web MIDI API | https://webaudio.github.io/web-midi-api/ | Browser MIDI devices, messages, permission gating, and System Exclusive boundary | 2026-06-17 | Web MIDI input capture for explicit local 808/Synth note entry |
| MDN IndexedDB API | https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API | Browser local structured data and blob storage | 2026-06-15 | Local project and asset cache |
| Electron Docs | https://www.electronjs.org/docs/latest/ | Cross-platform desktop app shell using JavaScript, HTML, and CSS | 2026-06-15 | Desktop MVP shell |
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

## Rules

- Prefer official sources over blogs or summaries.
- Re-check sources when behavior, pricing, law, platform rules, or API details may have changed.
- Do not turn sources into legal, medical, financial, or compliance conclusions without explicit project authority.

## Source Gaps

- Add browser compatibility references before committing to target browsers.
- Add official docs for any benchmark DAW behavior before copying specific interaction details.
- Add licensing evidence before committing presets, loops, sample packs, or third-party audio fixtures.
- Add encoder/library documentation when a WAV encoder, metering library, or DSP package is selected.
