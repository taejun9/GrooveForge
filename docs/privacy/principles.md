
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

Sampling is an optional later module. Its implementation must include source tracking, user import boundaries, and clear export responsibility before sample packs or user audio are added to examples. This safety section does not make sampling a core product feature.

## AI Boundary

Pattern generation may be local and event-based. Remote AI calls, generated-audio services, model telemetry, or prompt logging require an explicit product rationale, privacy review, and source entry before implementation.
