#!/usr/bin/env python3
"""Validate the GrooveForge project base."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PLAN_RE = re.compile(r"plan-\d{3}-[a-z0-9][a-z0-9-]*\.md$")

REQUIRED_PATHS = [
    "AGENTS.md",
    "README.md",
    "package.json",
    "index.html",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.electron.json",
    "electron/main.ts",
    "electron/preload.ts",
    "src/main.tsx",
    "src/ui/App.tsx",
    "src/domain/workstation.ts",
    "src/audio/render.ts",
    "src/audio/scheduler.ts",
    "src/styles.css",
    "docs/architecture/harness.md",
    "docs/architecture/product-architecture.md",
    "docs/product/product.md",
    "docs/quality/rules.md",
    "docs/privacy/principles.md",
    "docs/references/official-sources.md",
    "docs/exec_plans/active",
    "docs/exec_plans/completed",
    "docs/meetings/index.md",
    "docs/reviews",
    "harness/templates/exec-plan.md",
    "harness/templates/meeting.md",
    "harness/templates/review.md",
]

TEXT_EXPECTATIONS = {
    "README.md": [
        "making beats across genres",
        "Direct composition is the product spine",
        "Sampling is a secondary add-on.",
        "local project save/load",
        "Independent Pattern A/B/C variations and editable arrangement blocks with duplicate, move, and delete controls",
        "Basic mixer volume/pan/mute/solo",
        "chord progression",
        "Sound presets and Studio tone controls",
        "npm run desktop",
    ],
    "AGENTS.md": [
        "No Exec Plan, No Work",
        "GrooveForge is an all-genre, event-based beat workstation",
    ],
    "docs/product/product.md": [
        "샘플 없이도 8마디 비트를 만들고 WAV로 export할 수 있어야 한다.",
        "This sentence supersedes any sampling-first interpretation of the brief.",
        "Sampling can be useful, but it must stay behind the composition engine",
        "Local project save/load",
        "Independent Pattern A/B/C storage for drum, bass, chord, and melody variations",
        "Chord progression track",
        "Sound design presets and Studio tone controls",
        "Editable arrangement blocks",
        "duplicate, move, and delete controls",
        "Mixer volume, pan, mute, and solo reflected in realtime playback and WAV export",
    ],
    "docs/quality/rules.md": [
        "QA and review are separate loops.",
        "python3 harness/scripts/run_quality_gate.py",
        "Project file work must reject invalid imports",
        "preserve edited drum, bass, chord, melody, sound design",
        "Chord progression work must preserve Pattern A/B/C independence",
        "Sound design work must keep tone parameters in project state",
        "Pattern work must keep Pattern A/B/C as independent editable event data",
        "Arrangement editor work must let users change a block's section",
        "Arrangement structure work must preserve at least one block",
        "Volume, pan, mute, solo, master output gain, and preset ceiling controls",
        "sample import, chopping, sampler tracks, or audio warping",
    ],
    "docs/references/official-sources.md": [
        "W3C Web Audio API",
        "Electron Docs",
        "Vite Guide",
        "ITU-R BS.1770",
        "Source Gaps",
    ],
    "package.json": [
        "\"desktop\"",
        "\"typecheck\"",
        "\"build\"",
    ],
    "electron/main.ts": [
        "nodeIntegration: false",
        "contextIsolation: true",
        "sandbox: true",
        "grooveforge:save-project",
        "grooveforge:open-project",
    ],
    "electron/preload.ts": [
        "saveProject",
        "openProject",
    ],
    "src/ui/App.tsx": [
        "Guided",
        "Studio",
        "exportWav",
        "startRealtimePlayback",
        "currentPatternStep",
        "NoteEditor",
        "toggleBassNote",
        "toggleMelodyNote",
        "NoteInspector",
        "SoundDesigner",
        "SoundControl",
        "applySoundPreset",
        "updateSoundDesign",
        "sound-preset-readout",
        "sound-preset-${preset}",
        "sound-${id}-input",
        "bass-drive",
        "chord-width",
        "ChordEditor",
        "updateChordEvent",
        "chord-root",
        "chord-quality",
        "chord-length-input",
        "chord-velocity-input",
        "handleSaveProject",
        "handleOpenProject",
        "Invalid project file",
        "patternEventCount",
        "selectPattern",
        "selectedArrangementIndex",
        "updateArrangementBlock",
        "duplicateArrangementBlock",
        "moveArrangementBlock",
        "deleteArrangementBlock",
        "Selected arrangement block editor",
        "arrangement-section-select",
        "arrangement-energy-input",
        "arrangement-duplicate",
        "arrangement-delete",
        "updateMixerChannel",
        "applyMasterPreset",
        "mixer-pan",
        "mixer-pan-input",
        "mixer-solo",
    ],
    "src/audio/scheduler.ts": [
        "scheduleAheadSeconds",
        "startRealtimePlayback",
        "onStep",
        "activePattern",
        "chordPitches",
        "SoundDesign",
        "driveCurve",
        "channelMix",
        "createStereoPanner",
    ],
    "src/audio/render.ts": [
        "patternForSlot",
        "arrangementBlock",
        "arrangementBarCount",
        "chordPitches",
        "SoundDesign",
        "addTone",
        "channelMix",
        "masterOutputGain",
    ],
    "src/domain/workstation.ts": [
        "styleProfiles",
        "starterProject",
        "StyleProfile",
        "bassPitchLanes",
        "melodyPitchLanes",
        "serializeProjectFile",
        "parseProjectFile",
        "PatternData",
        "ChordEvent",
        "chordQualities",
        "chordPitches",
        "SoundDesign",
        "soundPresetIds",
        "soundPresetDesign",
        "soundPresetLabel",
        "patternSlots",
        "ArrangementSection",
        "arrangementSections",
        "masterPresets",
        "masterPresetCeilingDb",
        "normalizeProjectState",
    ],
}


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT))


def check_required_paths(errors: list[str]) -> None:
    for path in REQUIRED_PATHS:
        if not (ROOT / path).exists():
            errors.append(f"missing required path: {path}")


def check_root_markdown(errors: list[str]) -> None:
    allowed = {"README.md", "AGENTS.md"}
    found = {path.name for path in ROOT.glob("*.md")}
    extra = sorted(found - allowed)
    if extra:
        errors.append(f"unexpected root markdown files: {', '.join(extra)}")


def check_forbidden_paths(errors: list[str]) -> None:
    if (ROOT / "docs/plan").exists():
        errors.append("forbidden path exists: docs/plan")


def check_plan_names(errors: list[str]) -> None:
    for directory in [
        ROOT / "docs/exec_plans/active",
        ROOT / "docs/exec_plans/completed",
    ]:
        if not directory.exists():
            continue
        for path in directory.glob("*.md"):
            if not PLAN_RE.fullmatch(path.name):
                errors.append(f"invalid plan filename: {rel(path)}")


def check_text_expectations(errors: list[str]) -> None:
    for file_path, needles in TEXT_EXPECTATIONS.items():
        text = (ROOT / file_path).read_text(encoding="utf-8")
        for needle in needles:
            if needle not in text:
                errors.append(f"{file_path} missing text: {needle}")


def check_official_sources(errors: list[str]) -> None:
    text = (ROOT / "docs/references/official-sources.md").read_text(encoding="utf-8")
    if "| TODO |" in text:
        errors.append("official sources still contain placeholder table rows")


def check_strict_todos(errors: list[str]) -> None:
    ignored_prefixes = {
        "dist/",
        "dist-electron/",
        "harness/templates/",
        "node_modules/",
    }
    for path in ROOT.rglob("*.md"):
        relative = rel(path)
        if any(relative.startswith(prefix) for prefix in ignored_prefixes):
            continue
        text = path.read_text(encoding="utf-8")
        if "TODO" in text:
            errors.append(f"strict mode found TODO in {relative}")


def run_checks(strict: bool = False) -> list[str]:
    errors: list[str] = []
    check_required_paths(errors)
    check_root_markdown(errors)
    check_forbidden_paths(errors)
    check_plan_names(errors)
    check_text_expectations(errors)
    check_official_sources(errors)
    if strict:
        check_strict_todos(errors)
    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate the GrooveForge project base.")
    parser.add_argument("--strict", action="store_true", help="Fail on TODO markers outside templates.")
    args = parser.parse_args(argv)

    errors = run_checks(strict=args.strict)
    if errors:
        print("QA failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    mode = "strict " if args.strict else ""
    print(f"GrooveForge {mode}QA passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
