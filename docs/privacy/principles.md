
# Privacy And Safety Principles

Use this file for product-specific privacy, safety, security, AI, ads, permissions, and data-handling boundaries.

## Non-Negotiables

- Do not place sensitive real user, customer, credential, or production data in examples, tests, docs, or screenshots.
- Do not add tracking, personalized ads, broad data collection, remote AI calls, payment actions, consent actions, deletion actions, or account actions without explicit project rationale.
- Do not claim legal, medical, financial, or compliance conclusions unless the project has that authority and scope.
- Do not commit real user audio, copyrighted sample packs, unreleased beats, private project files, access tokens, or analytics exports.
- Keep the MVP local-first unless cloud sync, remote rendering, collaboration, or account features are explicitly scoped.
- Browser permissions such as MIDI, microphone input, file handles, and persistent storage must be requested only when the user starts a workflow that needs them.

## Evidence

For material risk, policy, or compliance claims, record the relevant source text or official source reference.

## Audio Import And Asset Handling

Imported audio can contain personal data, copyrighted material, or unreleased creative work. Test fixtures should use generated tones, synthetic drum sounds, or clearly licensed assets.

Optional one-shot sampling accepts only explicitly selected, bounded local WAV files. It stores a sanitized source basename and embedded PCM with the project; full source paths and external references are excluded. Source tracking, user import boundaries, and clear export responsibility remain required before sample packs or user audio are added to examples. This safety section does not make sampling a core product feature.

## Local Draft Recovery

Local draft recovery may store only bounded GrooveForge project JSON in renderer-local storage. The explicitly enabled one-shot sampling extension may include its strictly bounded embedded PCM and source basename inside that JSON so recovery does not silently lose the user’s sound. Arbitrary media blobs, long imported audio, sample packs, analytics identifiers, account data, and cloud sync state remain excluded. Restore and Clear controls must be explicit user actions, and clearing a draft must not delete the current project or any saved `.grooveforge.json` file.

The desktop main process additionally owns one latest recovery row in the current-user-home `GrooveForge/Data/grooveforge.db` SQLite3 database. The renderer may request save/load/clear through narrow typed IPC but must never receive raw SQL or the database path. SQLite uses a versioned STRICT schema, parameter binding, WAL, FULL synchronous durability, integrity checks, and bounded transactions.

The SQLite catalog stores a SHA-256 location key instead of a current-user absolute path, plus the portable file name, exact bounded project JSON mirror, and save time. Logs and QA evidence must not expose the user name, home path, project body, or real project title. Clearing SQLite recovery must not delete catalog rows. The database and WAL are local plaintext, not encrypted storage: on POSIX systems the managed directories are restricted to mode `0700` and project/database files to `0600`, while Windows relies on the current user's profile ACL. The app must not claim to control OS backup or sync behavior.

## AI Boundary

Pattern generation may be local and event-based. Remote AI calls, generated-audio services, model telemetry, or prompt logging require an explicit product rationale, privacy review, and source entry before implementation.

## Personal Pattern Library

Explicit Save stores at most 32 named event patterns, bounded to 750,000 JSON characters, in device-local renderer storage. No imported media, absolute file paths, account identifiers, or remote requests enter the library. Recall mutates only the selected Pattern through Undo history. Storage failure and corrupted data remain visible errors rather than successful saves.
