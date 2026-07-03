# plan-1310-dual-audience-readiness-strip

## Goal

Add a compact in-app dual-audience readiness strip that helps first-time composers and professional producers see the current beat's composition, arrangement, mix, and delivery posture without leaving the workstation.

## Scope

- Add a local, value-free UI readout that surfaces beginner next-step readiness and producer delivery readiness from existing project state.
- Keep the readout sample-free and event-first: drums, 808/bass, melody/chords, arrangement, mix/master, and export/handoff.
- Add or update focused harness coverage so the readout is part of the verified first-time composer and professional producer readiness path.
- Re-run packaged desktop launch coverage for the attached macOS dyld crash class: Electron Framework must find, verify, and load `Squirrel.framework/Squirrel` in the current generated bundle.
- Update product/release docs only where they describe the verified audience readiness surface.

## Non-Goals

- Do not edit `.env.distribution.local`.
- Do not add remote AI, analytics, cloud sync, accounts, payments, upload, signing, notarization, or external distribution behavior.
- Do not introduce sample import, chopping, sampler setup, audio tracks, or imported-audio dependencies into the MVP path.
- Do not imitate any specific producer's protected style; keep support framed as professional workflow readiness and genre-editable beat production.

## Validation

- [x] `PYTHONDONTWRITEBYTECODE=1 npm run qa`
- [x] `npm run build`
- [x] `git diff --check`
- [x] `npm run renderer:smoke`
- [x] `npm run persona:smoke`
- [x] `npm run desktop:launch-smoke`
- [x] `npm run desktop:package-smoke`
- [x] `npm run release:completion-summary-refresh-smoke`

## Decision Log

- 2026-07-03: Created after plan-1309. Current main evidence reports latest completed plan `plan-1309`, 10-plan progress `1301-1310: 9/10`, user-facing completion `99.999999%`, and the remaining external blocker as operator-owned private release-channel metadata placeholders. This plan makes local app progress that does not require private distribution values.
- 2026-07-03: Added the attached macOS crash report to plan scope as a current-bundle regression check, not a private signing/notarization claim. The report shows a dyld `@rpath/Squirrel.framework/Squirrel` launch abort from an older generated worktree bundle; this plan will verify the current bundle through package smoke dependency, signing, dyld-loadability, and packaged launch evidence.
- 2026-07-03: Implemented Dual Audience Readiness as a read-only top-of-workstation strip. It routes the first-time composer lane to the existing First Beat Path handler and the professional producer lane to the existing Export Preflight or Production Snapshot handler without changing project data, schema, playback, export output, remote behavior, or sampling scope.
- 2026-07-03: Verified the Squirrel dyld crash class against the current package. `npm run desktop:package-smoke` reported `Framework dependencies: 3/3 present, 3/3 code-signed` and `Dyld framework loadability: 3/3 loadable via 2 dyld rpaths`; `npm run desktop:launch-smoke` also passed with the new Dual Audience Readiness test ids.
- 2026-07-03: Refreshed completion evidence after regenerating fresh release-check source artifacts in this worktree. `npm run release:completion-summary-refresh-smoke` passed with latest completed plan `plan-1310`, 10-plan progress `1301-1310: 10/10`, user-facing completion `99.999999%`, remaining completion `0.000001%`, and current operator first command `npm run release:prepare-env`.
