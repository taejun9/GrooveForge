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
        "beat workstation first, not a sampler-first app",
        "Direct composition is the product spine",
        "opening a compact beat-making DAW, not a sample browser",
        "Sampling is a secondary add-on.",
        "local project save/load",
        "Style selector that applies editable genre groove templates",
        "drum velocity, microtiming, one-click groove humanization, and hat repeat dynamics",
        "Key-aware chord progression presets with chord add/delete controls",
        "kick-to-808 sidechain ducking",
        "Independent Pattern A/B/C variations with copy/clear tools and editable arrangement blocks with duplicate, move, and delete controls",
        "Desktop editing shortcuts for playback, Pattern A/B/C switching, selected event deletion, save, open, undo, and redo.",
        "Undo/redo edit history",
        "Basic mixer volume/pan/mute/solo, channel low-cut/air EQ, Drive/Glue mix controls",
        "channel low-cut/air EQ",
        "Drive/Glue mix controls",
        "chord progression presets and add/delete tools",
        "Sound presets and Studio tone controls",
        "export peak/RMS/headroom meter",
        "one-click stem export",
        "npm run desktop",
    ],
    "AGENTS.md": [
        "No Exec Plan, No Work",
        "GrooveForge is an all-genre, event-based beat workstation",
    ],
    "docs/product/product.md": [
        "It is beat-first, not sampler-first.",
        "Pattern programming for all supported styles.",
        "Optional sampling module, later and outside the MVP:",
        "No user should need a sample to make the first complete beat.",
        "샘플 없이도 8마디 비트를 만들고 WAV로 export할 수 있어야 한다.",
        "This sentence supersedes any sampling-first interpretation of the brief.",
        "Sampling can be useful, but it must stay behind the composition engine",
        "it means a pattern, MIDI, or automation container",
        "Local project save/load",
        "Style selector that applies key-aware editable groove templates",
        "editable drum velocity, microtiming, one-click groove humanization, and hat repeat dynamics",
        "kick-to-808 sidechain ducking",
        "sidechain ducking",
        "Independent Pattern A/B/C storage with copy/clear tools for drum, bass, chord, and melody variations",
        "Undo/redo edit history for project-level pattern, arrangement, mixer, sound, and master changes",
        "Desktop editing shortcuts for playback, Pattern A/B/C selection, selected drum/note deletion, save, open, undo, and redo",
        "Chord progression track with scale-locked roots, key-aware progression presets",
        "editable step/root/quality/length/velocity, and add/delete controls",
        "Sound design presets and Studio tone controls",
        "Editable arrangement blocks",
        "duplicate, move, and delete controls",
        "Mixer volume, pan, mute, solo, low-cut/air EQ, and Drive/Glue mix controls reflected in realtime playback and WAV export",
        "channel low-cut/air EQ",
        "Drive/Glue mix controls",
        "Export peak/RMS/headroom meter with limiter activity status",
        "Stem export for isolated drum, 808, synth, and chord WAV files",
    ],
    "docs/quality/rules.md": [
        "QA and review are separate loops.",
        "python3 harness/scripts/run_quality_gate.py",
        "Project file work must reject invalid imports",
        "preserve edited drum, bass, chord, melody, sound design",
        "Drum dynamics work must migrate old patterns",
        "Drum microtiming work must migrate old patterns",
        "Groove humanize work must be deterministic",
        "Style groove work must apply key-aware editable Pattern A/B/C event data",
        "Chord progression work must preserve Pattern A/B/C independence",
        "keep chord roots and progression presets scale-aware by default",
        "keep add/delete operations undoable",
        "preserve at least one chord event in guided editing",
        "Sound design work must keep tone parameters in project state",
        "Sidechain work must keep kick-to-808 ducking",
        "Export meter work must label measurements honestly as peak, RMS, headroom, and limiter activity",
        "Stem export work must render isolated drum, 808, synth, and chord WAV files",
        "Pattern work must keep Pattern A/B/C as independent editable event data",
        "Copy and clear tools must operate on the selected pattern slot",
        "Arrangement editor work must let users change a block's section",
        "Arrangement structure work must preserve at least one block",
        "Undo/redo work must record bounded local project-edit history",
        "keep keyboard shortcuts out of focused inputs",
        "Desktop shortcut work must keep playback, Pattern A/B/C selection, save/open, undo/redo, and selected event deletion scoped to the app window",
        "must route destructive deletion through normal undoable project history",
        "Volume, pan, mute, solo, master output gain, and preset ceiling controls",
        "Channel EQ work must keep low-cut/air controls in mixer state",
        "Channel dynamics work must keep Drive/Glue controls in mixer state",
        "simplified compression honestly",
        "full-mix WAV export, and stem export",
        "sample import, chopping, sampler tracks, or audio warping",
        "core clips are pattern, MIDI, or automation containers",
    ],
    "docs/architecture/product-architecture.md": [
        "Pattern/Event Clips",
        "not an imported audio asset",
        "Sampling architecture should attach to the beat workstation",
        "Extension track types for optional sampling, later:",
    ],
    "harness/scripts/run_qa.py": [
        '".worktree/"',
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
        "exportStems",
        "analyzeExport",
        "ExportMeter",
        "export-meter-status",
        "export-peak-db",
        "export-rms-db",
        "export-headroom-db",
        "export-limiter-percent",
        "master-ceiling",
        "startRealtimePlayback",
        "currentPatternStep",
        "createStylePatternSet",
        "styleSoundPreset",
        "Applied ${nextStyle.name} groove",
        "DrumStepInspector",
        "selectedDrumStep",
        "updateSelectedDrumVelocity",
        "updateSelectedHatRepeat",
        "drum-velocity",
        "drum-velocity-input",
        "drum-timing-early",
        "drum-timing-on",
        "drum-timing-late",
        "drum-timing-input",
        "updateSelectedDrumTiming",
        "applySelectedDrumGroove",
        "groove-preset-${preset}",
        "timingLabel",
        "timingBadge",
        "hat-repeat-${repeat}",
        "undoStack",
        "redoStack",
        "undoProject",
        "redoProject",
        "handleDesktopShortcut",
        "deleteSelectedEvent",
        "deleteSelectedNote",
        "clearSelectedDrumStep",
        "wantsSave",
        "wantsOpen",
        "event.code === \"Space\"",
        "patternShortcut",
        "undo-button",
        "redo-button",
        "isEditableShortcutTarget",
        "historyLimit",
        "NoteEditor",
        "toggleBassNote",
        "toggleMelodyNote",
        "selectedSameNote",
        "NoteInspector",
        "SoundDesigner",
        "SoundControl",
        "commitPercentInput",
        "skipNextBlurCommit",
        "applySoundPreset",
        "updateSoundDesign",
        "sound-preset-readout",
        "sound-preset-${preset}",
        "sound-${id}-input",
        "bass-drive",
        "sidechain-duck",
        "sound-duck-readout",
        "chord-width",
        "ChordEditor",
        "ChordProgressionPreset",
        "chordProgressionPresetIds",
        "chordProgressionPresetLabel",
        "createChordProgressionPreset",
        "createNextChordEvent",
        "applyChordProgressionPreset",
        "addChordEvent",
        "deleteChordEvent",
        "updateChordEvent",
        "chord-preset-${preset}",
        "chord-add",
        "chord-delete",
        "chord-step",
        "chord-root",
        "chord-quality",
        "chord-length-input",
        "chord-velocity-input",
        "handleSaveProject",
        "handleOpenProject",
        "handleExportStems",
        "export-stems",
        "Invalid project file",
        "patternEventCount",
        "selectPattern",
        "copySelectedPattern",
        "clearSelectedPattern",
        "pattern-copy-${pattern}",
        "pattern-clear",
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
        "normalizeMixerEq",
        "mixer-low-cut",
        "mixer-low-cut-input",
        "mixer-air",
        "mixer-air-input",
        "mixer-drive",
        "mixer-drive-input",
        "mixer-glue",
        "mixer-glue-input",
        "Cut {percentLabel(channel.lowCut)}",
        "Air {percentLabel(channel.air)}",
        "Drive {percentLabel(channel.drive)}",
        "Glue {percentLabel(channel.glue)}",
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
        "drumStepTimingMs",
        "drumStepVelocity",
        "hatRepeatCount",
        "sidechainGainForStep",
        "lowCut",
        "air",
        "drive",
        "glue",
        "channelHighpassHz",
        "channelAirFilterHz",
        "connectChannelGlue",
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
        "drumStepTimingMs",
        "drumStepVelocity",
        "hatRepeatCount",
        "sidechainGainForStep",
        "lowCut",
        "air",
        "drive",
        "glue",
        "channelHighpassHz",
        "channelDriveSample",
        "channelGlueSample",
        "toneEqFactor",
        "addTone",
        "channelMix",
        "masterOutputGain",
        "stemTrackIds",
        "StemTrackId",
        "ExportAnalysis",
        "analyzeExport",
        "exportStems",
        "stemTrackLabel",
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
        "DrumVelocities",
        "DrumTimings",
        "DrumGroovePreset",
        "drumGroovePresetIds",
        "drumGroovePresetLabel",
        "applyDrumGroovePreset",
        "drumStepTimingMs",
        "drumStepVelocity",
        "normalizeDrumTimingMs",
        "grooveVelocity",
        "grooveTimingMs",
        "hatRepeatCount",
        "normalizeDrumVelocity",
        "normalizeHatRepeat",
        "sidechainGainForStep",
        "ChordEvent",
        "chordQualities",
        "chordPitches",
        "SoundDesign",
        "soundPresetIds",
        "soundPresetDesign",
        "soundPresetLabel",
        "patternSlots",
        "createStylePatternSet",
        "styleSoundPreset",
        "stylePatternBlueprints",
        "createEmptyPatternData",
        "ArrangementSection",
        "arrangementSections",
        "masterPresets",
        "masterPresetCeilingDb",
        "normalizeProjectState",
        "MixerChannelInput",
        "normalizeMixerEq",
        "normalizeMixerChannels",
        "lowCut",
        "air",
        "drive",
        "glue",
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
        ".worktree/",
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
