# plan-1472-binary-free-title-harness review

## Review Result

approved

No blocking, major, or moderate findings remain after QA.

## Scope Reviewed

- Byte-level representation of the project-title-integrity filename assertion.
- Repository QA coverage for literal NUL bytes in project text sources.
- Runtime title-integrity regression and actual 27-WAV sample-audio QA output.

## Findings

None.

The accidental literal NUL, unit-separator endpoint, and DEL byte embedded in the regular-expression source were replaced with textual `\u0000`, `\u001f`, and `\u007f` escapes. The resulting file is recognized as UTF-8 text while JavaScript retains the same control-character range semantics.

Repository QA now reads text source files under `src`, `electron`, `harness`, and `docs`, plus the root product/configuration text files, and reports any literal NUL byte. Generated output, dependencies, worktrees, and Git metadata are outside that scan.

## QA Evidence

- `python3 harness/scripts/run_qa.py`: passed with the binary-free text-source check enabled.
- `npm run harness:smoke`: passed; project-title integrity remained `서울 야간 비트`, `서울-야간-비트`, and an 80-code-point bound.
- `npm run sample-audio:qa`: passed; schema 5, 27/27 playable WAVs, 19/19 full-mix tails, and unchanged malformed-import sample SHA-256 `9ce2e495f1752a0559a8c228410a85a6aafd35d6ea9c31e9695865347fc4c6df`.
- `file harness/scripts/run_sample_audio_qa.mjs` identifies the harness as UTF-8 text, and `rg` reads the corrected assertion normally instead of classifying the file as binary.
- `git diff --check`: passed.

## Residual Risk

- The static scan targets recognized project text extensions and key root text files. A future extensionless text source outside those roots would need to be added to the scan contract.
- Audio and title behavior are unchanged; human listening and external release approval remain separate boundaries.
