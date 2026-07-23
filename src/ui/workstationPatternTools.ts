import {
  createHandoffSheet as createAudioHandoffSheet,
  exportDynamicsDb as audioExportDynamicsDb,
  handoffSheetFileName as audioHandoffSheetFileName,
  handoffValue as audioHandoffValue
} from "../audio/handoff";
import {
  downloadProjectFile as downloadBrowserProjectFile,
  downloadTextFile as downloadBrowserTextFile
} from "../platform/downloads";
import {
  ArrangementBlock,
  ArrangementMovePreset,
  ArrangementMuteTrack,
  ArrangementSection,
  ArrangementTemplateId,
  BassNote,
  BeatBlueprint,
  BeatBlueprintId,
  ChordEvent,
  ChordInversion,
  ChordProgressionPreset,
  ChordQuality,
  CustomDeliveryTarget,
  DeliveryTarget,
  DeliveryTargetId,
  DrumGroovePreset,
  DrumLane,
  MixPosture,
  applyDrumGroovePreset,
  chordProgressionPresetIds,
  chordProgressionPresetLabel,
  getStyle,
  MasterPreset,
  MelodyNote,
  MixerChannel,
  NoteTrack,
  PatternData,
  PatternFillPreset,
  PatternChainId,
  PatternSlot,
  ProjectSnapshot,
  PatternVariationPreset,
  ProjectState,
  SoundDesign,
  activeDeliveryTarget,
  activePattern,
  applyBeatBlueprint,
  applyDeliveryTarget,
  applyArrangementMovePreset,
  applyPatternFillPreset,
  arrangementSections,
  arrangementEnergyGain,
  arrangementMovePresetIds,
  arrangementMovePresetLabel,
  arrangementMuteTrackIds,
  arrangementMuteTrackLabel,
  arrangementTemplateIds,
  arrangementTemplateLabel,
  arrangementTotalBars,
  bassPitchLanes,
  beatBlueprints,
  chordInversions,
  chordInversionLabel,
  chordQualities,
  clonePatternData,
  createChordProgressionPreset,
  createArrangementTemplate,
  createNextChordEvent,
  createPatternChain,
  createPatternVariation,
  createStylePatternSet,
  createEmptyPatternData,
  defaultCustomDeliveryTarget,
  defaultDrumVelocity,
  deleteProjectSnapshot,
  deliveryTargets,
  deliveryTargetForId,
  drumStepProbability,
  drumStepTimingMs,
  drumStepVelocity,
  drumGroovePresetIds,
  drumGroovePresetLabel,
  defaultSessionBrief,
  expandPatternChainArrangement,
  hatRepeatCount,
  masterPresetCeilingDb,
  masterPresets,
  maxCustomDeliveryTargetFocusLength,
  maxCustomDeliveryTargetNameLength,
  maxDeliveryTargetBars,
  maxDeliveryTargetStemGoal,
  maxSessionBriefFieldLength,
  maxSessionBriefNotesLength,
  melodyPitchLanes,
  maxProjectSnapshotNameLength,
  maxProjectSnapshots,
  minDeliveryTargetBars,
  minDeliveryTargetStemGoal,
  minArrangementBars,
  minDrumTimingMs,
  maxArrangementBars,
  maxDrumTimingMs,
  normalizeArrangementEnergy,
  normalizeArrangementMutedTracks,
  normalizeArrangementBars,
  normalizeDrumProbability,
  normalizeDrumTimingMs,
  normalizeDrumVelocity,
  normalizeChordInversion,
  normalizeDeliveryTargetBars,
  normalizeDeliveryTargetStemGoal,
  normalizeEventProbability,
  normalizeHatRepeat,
  normalizeMixerEq,
  normalizeProjectSnapshotName,
  parseProjectFile,
  patternSlots,
  patternChainIds,
  patternChainLabel,
  patternFillPresetIds,
  patternFillPresetLabel,
  patternVariationPresetIds,
  patternVariationPresetLabel,
  nextProjectSnapshotName,
  projectFileName,
  projectSnapshotSummary,
  renameProjectSnapshot,
  retargetProjectKey,
  restoreProjectSnapshot,
  scalePitches,
  scalePitchNames,
  serializeProjectFile,
  SessionBrief,
  saveProjectSnapshot,
  soundPresetDesign,
  soundPresetIds,
  soundPresetLabel,
  StyleId,
  StyleProfile,
  styleSoundPreset,
  starterProject,
  steps,
  styleProfiles
} from "../domain/workstation";
import type { ExportAnalysis, StemExportAnalyses } from "../audio/render";
import { stemTrackIds, stemTrackLabel } from "../audio/render";
import type {
  KeyboardCaptureKey,
  SelectedNote,
  NoteClipboard,
  MixCoachTone,
  BeatBlueprintPreviewMetricId,
  BeatBlueprintPreviewMetric,
  BeatBlueprintPreviewSummary,
  BeatBlueprintResultMetric,
  BeatBlueprintResult,
  DeliveryTargetAlignmentPreviewSummary,
  DeliveryTargetAlignmentResultMetric,
  DeliveryTargetAlignmentResult,
  LocalDraftRecovery,
  MixCoachCheck,
  MixCoachFocusSummary,
  MixFixPreset,
  MixFixAction,
  MixFixPreviewSummary,
  MixFixResultMetric,
  MixFixResult,
  MixSnapshotSlotId,
  MixSnapshotQuickActionTarget,
  DirectExportQuickActionTarget,
  MixSnapshotSlotMap,
  MixSnapshot,
  MixSnapshotMetricId,
  MixSnapshotComparisonMetric,
  MixSnapshotComparisonSummary,
  MixBalancePadId,
  MixBalanceChannelUpdate,
  MixBalancePadDefinition,
  MixBalancePadOption,
  MixBalancePreviewSummary,
  MixBalanceResultMetric,
  MixBalanceResult,
  SpaceFxPadId,
  SpaceFxPadDefinition,
  SpaceFxPadOption,
  SpaceFxResultMetric,
  SpaceFxResult,
  StemAuditionPadId,
  StemAuditionPadDefinition,
  StemAuditionPadOption,
  SoundFocusPadId,
  SoundFocusParameter,
  SoundFocusPadDefinition,
  SoundFocusPadOption,
  SoundFocusPreviewSummary,
  SoundFocusResultMetric,
  SoundFocusResult,
  SoundPresetTarget,
  SoundPresetPreviewSummary,
  SoundPresetResultMetric,
  SoundPresetResult,
  DrumKitPadId,
  DrumKitSoundParameter,
  DrumKitPadDefinition,
  DrumKitPadOption,
  DrumKitPreviewSummary,
  DrumKitResultMetric,
  DrumKitResult,
  MasterFinishPadId,
  MasterFinishPadDefinition,
  MasterFinishPadOption,
  MasterFinishPreviewSummary,
  MasterFinishResultMetric,
  MasterFinishResult,
  TransportLoopScope,
  QuickAction,
  QuickActionRecent,
  QuickActionScopeId,
  QuickActionScopeOption,
  QuickActionSpotlightSummary,
  QuickActionResultMetric,
  QuickActionResult,
  BeatReadinessCheck,
  PatternCompareSummary,
  PatternClonePadOption,
  PatternCloneSuggestionSummary,
  PatternCloneResultMetric,
  PatternCloneResult,
  PatternEditResultMetric,
  PatternEditResult,
  PatternFillPreviewSummary,
  PatternFillSuggestionSummary,
  PatternFillResultMetric,
  PatternFillResult,
  PatternVariationPreviewSummary,
  PatternVariationSuggestionSummary,
  PatternVariationResultMetric,
  PatternVariationResult,
  PatternDnaCardId,
  PatternDnaFocusTarget,
  PatternDnaCard,
  PatternDnaSummary,
  LayerStarterId,
  LayerStarterOption,
  LayerStarterResultMetric,
  LayerStarterResult,
  ListeningPassId,
  ListeningPassTarget,
  ListeningPassItem,
  ListeningPassSummary,
  PatternDnaFocusSummary,
  StyleInspectorMetricId,
  StyleInspectorFocusId,
  StyleInspectorFocusTarget,
  StyleInspectorFocusItem,
  StyleInspectorMetric,
  StylePatternDensity,
  StyleInspectorSummary,
  StyleInspectorFocusSummary,
  BasslinePadId,
  BasslinePadStep,
  BasslinePadDefinition,
  BasslinePadOption,
  BassGlidePadId,
  BassGlidePadDefinition,
  BassGlidePadOption,
  BassContourId,
  BassContourDefinition,
  BassContourOption,
  BassMovePreviewSummary,
  BassMoveResultKind,
  BassMoveResultMetric,
  BassMoveResult,
  BassMoveQuickActionTarget,
  PatternStackId,
  PatternStackDefinition,
  PatternStackEvents,
  PatternStackOption,
  PatternStackPreviewSummary,
  PatternStackResultMetric,
  PatternStackResult,
  GrooveFeelId,
  GrooveFeelDefinition,
  GrooveFeelOption,
  DrumAccentId,
  DrumAccentDefinition,
  DrumAccentOption,
  DrumFoundationId,
  DrumFoundationDefinition,
  DrumFoundationOption,
  DrumMovePreviewSummary,
  DrumMoveResultKind,
  DrumMoveResultMetric,
  DrumMoveResult,
  DrumMoveQuickActionTarget,
  MelodyMotifId,
  MelodyMotifStep,
  MelodyMotifDefinition,
  MelodyMotifOption,
  MelodyAccentId,
  MelodyAccentDefinition,
  MelodyAccentOption,
  MelodyContourId,
  MelodyContourDefinition,
  MelodyContourOption,
  MelodyMovePreviewSummary,
  MelodyMoveResultKind,
  MelodyMoveResultMetric,
  MelodyMoveResult,
  MelodyMoveQuickActionTarget,
  TapTempoState,
  TempoNudgePadId,
  TempoNudgePadDefinition,
  ChordPadId,
  ChordPadDefinition,
  ChordPadOption,
  ChordRhythmId,
  ChordRhythmDefinition,
  ChordRhythmOption,
  ChordVoicingId,
  ChordVoicingDefinition,
  ChordVoicingOption,
  ChordHarmonicSummary,
  ChordMovePreviewSummary,
  ChordMoveResultKind,
  ChordMoveResultMetric,
  ChordMoveResult,
  ChordMoveQuickActionTarget,
  ArrangementFocusPresetId,
  ArrangementFocusPreset,
  ArrangementFocusSummary,
  ArrangementFocusPreviewSummary,
  ArrangementFocusResultMetric,
  ArrangementFocusResultSummary,
  ArrangementArcPadId,
  ArrangementArcPoint,
  ArrangementArcPadDefinition,
  ArrangementArcPadOption,
  ArrangementArcPreviewSummary,
  ArrangementTemplatePreviewSummary,
  ArrangementTemplateResultMetric,
  ArrangementTemplateResultSummary,
  ArrangementArcResultMetric,
  ArrangementArcResultSummary,
  PatternChainPreviewSummary,
  PatternChainResultMetric,
  PatternChainResultSummary,
  NextMoveCommand,
  NextMoveAction,
  NextMoveResultMetric,
  NextMoveResult,
  BeatMapStage,
  BeatMapMetric,
  BeatMapSummary,
  StructureLensSignal,
  StructureLensSummary,
  SongFormMetricId,
  SongFormMetric,
  SongFormSegment,
  SongFormOverviewSummary,
  SectionLocatorPad,
  ArrangementBlockRoleSummary,
  MixerChannelRoleSummary,
  StemAuditionReadoutSummary,
  MasterOutputRoleSummary,
  ProductionSnapshotMetricId,
  ProductionSnapshotFocusId,
  ProductionSnapshotFocusTarget,
  ProductionSnapshotFocusItem,
  ProductionSnapshotMetric,
  ProductionSnapshotSummary,
  ProductionSnapshotFocusSummary,
  KeyCompassCardId,
  KeyCompassFocusId,
  KeyCompassFocusTarget,
  KeyCompassFocusItem,
  KeyCompassCard,
  KeyCompassSummary,
  KeyCompassFocusSummary,
  GrooveCompassCardId,
  GrooveCompassFocusId,
  GrooveCompassFocusTarget,
  GrooveCompassFocusItem,
  GrooveCompassCard,
  GrooveCompassSummary,
  GrooveCompassFocusSummary,
  ComposerGuideCardId,
  ComposerGuideCard,
  ComposerGuideFocusSummary,
  ComposerGuideSummary,
  ComposerActionArea,
  ComposerActionCommand,
  ComposerAction,
  ComposerActionResultMetric,
  ComposerActionResult,
  ComposerActionsSummary,
  ComposerStyleActionGoals,
  ComposerStyleActionProfile,
  BeatPassportMetricId,
  BeatPassportFocusId,
  BeatPassportFocusTarget,
  BeatPassportFocusItem,
  BeatPassportMetric,
  BeatPassportSummary,
  BeatPassportFocusSummary,
  FinishChecklistCardId,
  FinishChecklistCard,
  FinishChecklistFocusSummary,
  FinishChecklistSummary,
  ReviewQueueItem,
  ReviewQueueFocusTarget,
  ReviewQueueFocusSummary,
  ReviewQueueSummary,
  ModeFocusCard,
  ModeFocusSummary,
  SessionPassTarget,
  SessionPassCardId,
  SessionPassCard,
  SessionPassSummary,
  SnapshotCompareMetricId,
  SnapshotCompareMetric,
  SnapshotCompareCard,
  SnapshotCompareSummary,
  SnapshotSlotRoleSummary,
  EditHistoryReadoutSummary,
  TapTempoReadoutSummary,
  TransportPositionReadoutSummary,
  PatternPlaybackReadoutSummary,
  ArrangementPlaybackReadoutSummary,
  KeyboardCapturePostureSummary,
  ProjectSafetyReadoutSummary,
  HandoffPackItem,
  HandoffPackRouteSummary,
  HandoffPackSendOrderSummary,
  HandoffExportReceipt,
  HandoffFileManifestItem,
  HandoffManifestAuditCheck,
  HandoffManifestAuditSummary,
  SessionBriefRoleSummary,
  SessionBriefStarterPadId,
  SessionBriefStarterPadDefinition,
  SessionBriefStarterPadOption,
  SessionBriefStarterResultMetric,
  SessionBriefStarterResult,
  ExportPreflightCardId,
  ExportPreflightFocusId,
  ExportPreflightFocusTarget,
  ExportPreflightFocusItem,
  ExportPreflightCard,
  ExportPreflightSummary,
  ExportPreflightFocusSummary,
  WorkflowZoneId,
  WorkflowNavigatorItem,
  WorkflowSpotlightSummary,
  FirstBeatPathStepId,
  FirstBeatPathTarget,
  FirstBeatPathStep,
  FirstBeatPathSummary,
  BeatSpineCardId,
  BeatSpineTarget,
  BeatSpineActionId,
  BeatSpineAction,
  BeatSpineCard,
  BeatSpineSummary,
  BeatSpineApplyResultMetric,
  BeatSpineApplyResult,
  SelectedDrumStep,
  DrumPocketSummary,
  DrumClipboard,
  ChordClipboard,
  ArrangementBlockClipboard,
  NoteView,
  KeyboardCaptureKeyMapItem,
  KeyboardCaptureDefaults,
  KeyboardCaptureStepMode,
  MidiCaptureStatus,
  MidiInputOption,
  MidiCaptureSummary,
  NoteDegreeSummary
} from "./workstationUiModel";
import {
  drumLabels,
  localDraftStorageKey,
  localDraftRecordVersion,
  localDraftMaxCharacters,
  minProjectBpm,
  maxProjectBpm,
  tapTempoWindowMs,
  tapTempoMaxTaps,
  tapTempoCommitDelayMs,
  tempoNudgePads,
  mixPostureOptions,
  mixBalancePadDefinitions,
  spaceFxPadDefinitions,
  stemAuditionPadDefinitions,
  soundFocusPadDefinitions,
  drumKitPadDefinitions,
  masterFinishPadDefinitions,
  keys,
  historyLimit,
  keyboardCaptureKeys,
  keyboardCaptureKeyLabels,
  isStemTrackId,
  beatBlueprintPreviewMetricTestIds,
  maxQuickActionPins,
  composerStyleActionProfiles,
  arrangementFocusPresets,
  arrangementArcPadDefinitions,
  chordPadDefinitions,
  chordRhythmDefinitions,
  chordVoicingDefinitions,
  basslinePadDefinitions,
  bassGlidePadDefinitions,
  bassContourDefinitions,
  melodyMotifDefinitions,
  melodyAccentDefinitions,
  melodyContourDefinitions,
  patternStackDefinitions,
  patternCloneVariationPresets,
  grooveFeelDefinitions,
  drumAccentDefinitions,
  drumFoundationDefinitions
} from "./workstationUiModel";

function selectedChordHarmonicSummary(key: string, chord: ChordEvent): ChordHarmonicSummary {
  const inversion = normalizeChordInversion(chord.inversion);
  const detailLabel = `${chord.root}${chord.quality} / ${chordInversionLabel(inversion)}`;
  const degree = keyCompassScaleDegree(key, chord.root);
  if (degree === null) {
    return {
      degreeLabel: "Out",
      romanLabel: "Out",
      roleLabel: "Outside key",
      detailLabel,
      inKey: false
    };
  }

  return {
    degreeLabel: `D${degree + 1}`,
    romanLabel: romanChordLabel(degree, chord.quality),
    roleLabel: chordDegreeRoleLabel(degree),
    detailLabel,
    inKey: true
  };
}

function romanChordLabel(degree: number, quality: ChordQuality): string {
  const base = ["I", "II", "III", "IV", "V", "VI", "VII"][degree] ?? "I";
  if (quality === "min") {
    return base.toLowerCase();
  }
  if (quality === "m7") {
    return `${base.toLowerCase()}7`;
  }
  if (quality === "dim") {
    return `${base.toLowerCase()}dim`;
  }
  if (quality === "7") {
    return `${base}7`;
  }
  if (quality === "sus2" || quality === "sus4") {
    return `${base}${quality}`;
  }
  return base;
}

function chordDegreeRoleLabel(degree: number): string {
  return ["Home", "Step", "Color", "Lift", "Tension", "Mood", "Lead"][degree] ?? "Function";
}

function keyCompassScaleDegree(key: string, pitchName: string): number | null {
  const scaleNotes = scalePitchNames(key);
  const normalizedPitchName = normalizePitchNameForCompass(pitchName);
  const index = scaleNotes.findIndex((note) => normalizePitchNameForCompass(note) === normalizedPitchName);
  return index >= 0 ? index : null;
}

function normalizePitchNameForCompass(pitchName: string): string {
  const enharmonic: Record<string, string> = {
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#"
  };
  return enharmonic[pitchName] ?? pitchName;
}

function patternEventTotal(pattern: PatternData): number {
  const drumHits = Object.values(pattern.drumPattern).reduce(
    (total, laneSteps) => total + laneSteps.filter(Boolean).length,
    0
  );
  const repeatedHats = pattern.drumPattern.hat.reduce(
    (total, enabled, step) => total + (enabled ? hatRepeatCount(pattern, step) - 1 : 0),
    0
  );
  return drumHits + repeatedHats + pattern.bassNotes.length + pattern.melodyNotes.length + pattern.chordEvents.length;
}

function usedPatternSlots(project: ProjectState): PatternSlot[] {
  const slots = new Set(project.arrangement.map((block) => block.pattern));
  return patternSlots.filter((slot) => slots.has(slot));
}

export function laneColor(lane: DrumLane): string {
  const colors: Record<DrumLane, string> = {
    kick: "#78f0c8",
    clap: "#ff7a4f",
    hat: "#f0c36a",
    perc: "#8aa8ff"
  };
  return colors[lane];
}

export function mergePitchLanes(scalePitches: string[], usedPitches: string[]): string[] {
  return Array.from(new Set([...scalePitches, ...usedPitches]));
}

export function createKeyboardCaptureKeyMap(pitches: string[]): KeyboardCaptureKeyMapItem[] {
  return keyboardCaptureKeys.map((key, index) => ({
    key,
    pitch: pitches[index] ?? null,
    degreeLabel: pitches[index] ? keyboardCaptureDegreeLabel(index) : null
  }));
}

export function createKeyboardCapturePostureSummary(
  enabled: boolean,
  target: NoteTrack,
  defaults: KeyboardCaptureDefaults,
  nextStep: number,
  stepMode: KeyboardCaptureStepMode
): KeyboardCapturePostureSummary {
  const targetLabel = target === "bass" ? "Bass" : "Synth";
  const statusLabel = enabled ? "Capture armed" : "Capture off";
  const stepModeLabel = stepMode === "next-free" ? "Next" : "Replace";
  const detailLabel =
    target === "bass"
      ? `Step ${nextStep + 1} / ${stepModeLabel} / Oct ${defaults.octave} / Len ${defaults.length} / ${
          defaults.glide ? "Glide on" : "Glide off"
        }`
      : `Step ${nextStep + 1} / ${stepModeLabel} / Oct ${defaults.octave} / Len ${defaults.length} / Vel ${Math.round(
          defaults.velocity * 100
        )}%`;

  return {
    roleLabel: `${targetLabel} keys`,
    statusLabel,
    detailLabel,
    detailTitle: `${statusLabel} / ${targetLabel} target / ${detailLabel}`,
    tone: enabled ? "good" : "warn"
  };
}

export function keyboardCapturePitchForKey(key: KeyboardCaptureKey, pitches: string[]): string | null {
  return pitches[keyboardCaptureKeys.indexOf(key)] ?? null;
}

export function keyboardCaptureDegreeLabel(index: number): string {
  return index === keyboardCaptureKeys.length - 1 ? "8ve" : `D${index + 1}`;
}

export function keyboardCapturePitchLanes(key: string, track: NoteTrack, defaults: KeyboardCaptureDefaults): string[] {
  return scalePitches(key, clampKeyboardCaptureOctave(track, defaults.octave));
}

export function clampKeyboardCaptureOctave(track: NoteTrack, octave: number): number {
  const [minOctave, maxOctave] = trackOctaveRange(track);
  if (!Number.isFinite(octave)) {
    return track === "bass" ? 1 : 4;
  }
  return Math.min(maxOctave, Math.max(minOctave, Math.round(octave)));
}

export function isKeyboardCaptureKey(key: string): key is KeyboardCaptureKey {
  return (keyboardCaptureKeys as readonly string[]).includes(key);
}

export function nextKeyboardCaptureStep(pattern: PatternData, track: NoteTrack, startStep: number): number {
  const notes = track === "bass" ? pattern.bassNotes : pattern.melodyNotes;
  const normalizedStart = normalizeStepModulo(startStep);
  for (let offset = 0; offset < steps.length; offset += 1) {
    const step = (normalizedStart + offset) % steps.length;
    if (!notes.some((note) => note.step === step)) {
      return step;
    }
  }
  return normalizedStart;
}

export function shouldReplaceKeyboardCaptureStep(
  stepMode: KeyboardCaptureStepMode,
  selectedNote: SelectedNote | null,
  target: NoteTrack
): boolean {
  return stepMode === "replace-selected" && selectedNote?.track === target;
}

export function resolveKeyboardCaptureStep(
  pattern: PatternData,
  target: NoteTrack,
  selectedNote: SelectedNote | null,
  stepMode: KeyboardCaptureStepMode
): number {
  if (shouldReplaceKeyboardCaptureStep(stepMode, selectedNote, target) && selectedNote) {
    return selectedNote.step;
  }

  return nextKeyboardCaptureStep(pattern, target, selectedNote?.track === target ? selectedNote.step + 1 : 0);
}

export function createCaptureStepModeActions({
  keyboardCaptureStepMode,
  keyboardCaptureTarget,
  keyboardCaptureTargetLabel,
  selectedPattern,
  selectedNote,
  selectedNoteActive,
  selectedNoteLabel,
  onSetKeyboardCaptureStepMode
}: {
  keyboardCaptureStepMode: KeyboardCaptureStepMode;
  keyboardCaptureTarget: NoteTrack;
  keyboardCaptureTargetLabel: string;
  selectedPattern: PatternSlot;
  selectedNote: SelectedNote | null;
  selectedNoteActive: boolean;
  selectedNoteLabel: string;
  onSetKeyboardCaptureStepMode: (mode: KeyboardCaptureStepMode) => void;
}): QuickAction[] {
  return [
    {
      id: "capture-step-mode-next",
      mode: "next-free" as KeyboardCaptureStepMode,
      title: "Capture step mode: Next empty",
      detail: `Desktop keys and MIDI notes fill the next empty ${keyboardCaptureTargetLabel} step / Pattern ${selectedPattern}`,
      keywords: `capture step mode next empty keyboard midi input ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} sequence beginner producer`
    },
    {
      id: "capture-step-mode-replace",
      mode: "replace-selected" as KeyboardCaptureStepMode,
      title: "Capture step mode: Replace selected",
      detail:
        selectedNoteActive && selectedNote?.track === keyboardCaptureTarget
          ? `Desktop keys and MIDI notes replace ${selectedNoteLabel} / Pattern ${selectedPattern}`
          : `Desktop keys and MIDI notes replace the selected ${keyboardCaptureTargetLabel} step when available`,
      keywords: `capture step mode replace selected overwrite correction keyboard midi input ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} producer beginner`
    }
  ].map(({ id, mode, title, detail, keywords }) => ({
    id,
    title,
    detail,
    group: "Create",
    keywords,
    disabled: keyboardCaptureStepMode === mode,
    run: () => onSetKeyboardCaptureStepMode(mode)
  }));
}

export function addKeyboardCaptureNote(
  pattern: PatternData,
  track: NoteTrack,
  step: number,
  pitch: string,
  defaults: KeyboardCaptureDefaults,
  replaceStep = false
): PatternData {
  const length = clampStepLength(defaults.length);
  if (track === "bass") {
    if (!replaceStep && pattern.bassNotes.some((note) => note.step === step && note.pitch === pitch)) {
      return pattern;
    }
    return {
      ...pattern,
      bassNotes: sortBassNotes([
        ...pattern.bassNotes.filter((note) => note.step !== step),
        { step, pitch, length, velocity: clampVelocity(defaults.velocity), glide: defaults.glide, probability: 1 }
      ])
    };
  }

  if (!replaceStep && pattern.melodyNotes.some((note) => note.step === step && note.pitch === pitch)) {
    return pattern;
  }
  return {
    ...pattern,
    melodyNotes: sortMelodyNotes([
      ...(replaceStep ? pattern.melodyNotes.filter((note) => note.step !== step) : pattern.melodyNotes),
      { step, pitch, length, velocity: clampVelocity(defaults.velocity), probability: 1 }
    ])
  };
}

export function isMidiInputSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.requestMIDIAccess === "function";
}

export function createMidiInputOptions(access: MIDIAccess | null): MidiInputOption[] {
  if (!access) {
    return [];
  }

  return Array.from(access.inputs.values()).map((input) => {
    const label = input.name || input.manufacturer || `MIDI Input ${input.id.slice(0, 4)}`;
    return {
      id: input.id,
      label,
      detail: `${input.state} / ${input.connection}`,
      connected: input.state === "connected"
    };
  });
}

export function createMidiCaptureSummary(
  status: MidiCaptureStatus,
  armed: boolean,
  inputs: MidiInputOption[],
  lastNoteLabel: string
): MidiCaptureSummary {
  if (status === "unsupported") {
    return {
      statusLabel: "MIDI unavailable",
      detailLabel: "This browser or shell does not expose Web MIDI input.",
      tone: "danger"
    };
  }
  if (status === "requesting") {
    return {
      statusLabel: "Requesting MIDI",
      detailLabel: "Waiting for the browser or OS permission prompt.",
      tone: "warn"
    };
  }
  if (status === "denied") {
    return {
      statusLabel: "MIDI denied",
      detailLabel: "Permission was rejected or blocked by the environment.",
      tone: "danger"
    };
  }

  const connectedCount = inputs.filter((input) => input.connected).length;
  if (inputs.length === 0) {
    return {
      statusLabel: status === "idle" ? "MIDI not connected" : "No MIDI inputs",
      detailLabel: "Connect a MIDI keyboard, then request or refresh local MIDI access.",
      tone: "warn"
    };
  }

  return {
    statusLabel: armed ? "MIDI armed" : "MIDI ready",
    detailLabel: `${connectedCount}/${inputs.length} connected / ${lastNoteLabel}`,
    tone: armed ? "good" : "warn"
  };
}

export function midiInputMatchesSelection(input: MIDIInput, selectedInputId: string): boolean {
  return input.state === "connected" && (selectedInputId === "all" || input.id === selectedInputId);
}

export function midiNoteOnFromMessage(data: Uint8Array): { noteNumber: number; velocity: number } | null {
  if (data.length < 3) {
    return null;
  }

  const command = data[0] & 0xf0;
  const noteNumber = data[1];
  const velocityByte = data[2];
  if (command !== 0x90 || velocityByte === 0 || noteNumber < 0 || noteNumber > 127) {
    return null;
  }

  return {
    noteNumber,
    velocity: clampVelocity(velocityByte / 127)
  };
}

export function midiNoteToScalePitch(noteNumber: number, key: string, track: NoteTrack): string | null {
  const pitches = trackScalePitches(track, key, []);
  if (pitches.length === 0) {
    return null;
  }

  return pitches.reduce((closest, pitch) =>
    Math.abs(pitchMidi(pitch) - noteNumber) < Math.abs(pitchMidi(closest) - noteNumber) ? pitch : closest
  );
}

export function midiNoteLabel(noteNumber: number): string {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const name = names[((noteNumber % 12) + 12) % 12] ?? "MIDI";
  const octave = Math.floor(noteNumber / 12) - 1;
  return `${name}${octave}`;
}

export function createGrooveFeelOptions(): GrooveFeelOption[] {
  return grooveFeelDefinitions.map((feel) => {
    const kickTiming = grooveFeelTimingMs("kick", 6, feel.id);
    const clapTiming = grooveFeelTimingMs("clap", 4, feel.id);
    return {
      ...feel,
      timingPreview: `${timingBadge(kickTiming)} / ${timingBadge(clapTiming)} ms`,
      chancePreview: `${Math.round(feel.musicChance * 100)}% notes`
    };
  });
}

export function applyGrooveFeelToPattern(pattern: PatternData, feel: GrooveFeelDefinition): PatternData {
  const nextPatternData = clonePatternData(pattern);
  (Object.keys(drumLabels) as DrumLane[]).forEach((lane) => {
    nextPatternData.drumTimings[lane] = nextPatternData.drumTimings[lane].map((current, step) =>
      nextPatternData.drumPattern[lane][step] ? grooveFeelTimingMs(lane, step, feel.id) : 0
    );
    nextPatternData.drumProbabilities[lane] = nextPatternData.drumProbabilities[lane].map((current, step) =>
      nextPatternData.drumPattern[lane][step] ? grooveFeelDrumProbability(lane, step, feel) : normalizeDrumProbability(current)
    );
  });
  nextPatternData.bassNotes = sortBassNotes(
    nextPatternData.bassNotes.map((note, index) => ({
      ...note,
      probability: grooveFeelMusicProbability("bass", index, feel)
    }))
  );
  nextPatternData.melodyNotes = sortMelodyNotes(
    nextPatternData.melodyNotes.map((note, index) => ({
      ...note,
      probability: grooveFeelMusicProbability("melody", index, feel)
    }))
  );
  nextPatternData.chordEvents = nextPatternData.chordEvents.map((event, index) => ({
    ...event,
    probability: index <= 1 ? normalizeEventProbability(Math.max(feel.chordChance, 0.94)) : normalizeEventProbability(feel.chordChance)
  }));
  return nextPatternData;
}

export function grooveFeelTimingMs(lane: DrumLane, step: number, feel: GrooveFeelId): number {
  if (feel === "tight") {
    const timing = lane === "clap" ? 4 : lane === "hat" ? (step % 2 === 0 ? -2 : 3) : lane === "perc" ? (step % 4 === 0 ? -3 : 4) : 0;
    return normalizeDrumTimingMs(timing);
  }
  if (feel === "pocket") {
    const timing = lane === "clap" ? 15 : lane === "hat" ? (step % 2 === 0 ? 5 : 10) : lane === "perc" ? 12 : step % 8 === 0 ? 0 : -4;
    return normalizeDrumTimingMs(timing);
  }
  if (feel === "push") {
    const timing = lane === "clap" ? -6 : lane === "hat" ? (step % 2 === 0 ? -11 : -7) : lane === "perc" ? -9 : step % 8 === 0 ? -3 : -7;
    return normalizeDrumTimingMs(timing);
  }
  const timing = lane === "clap" ? 20 : lane === "hat" ? (step % 2 === 0 ? 9 : 15) : lane === "perc" ? 18 : step % 8 === 0 ? 4 : 10;
  return normalizeDrumTimingMs(timing);
}

export function grooveFeelDrumProbability(lane: DrumLane, step: number, feel: GrooveFeelDefinition): number {
  if (lane === "kick" || lane === "clap") {
    return normalizeDrumProbability(feel.id === "lazy" && step % 8 !== 0 ? 0.94 : 1);
  }
  if (lane === "hat") {
    return normalizeDrumProbability(step % 4 === 0 ? Math.max(feel.hatChance, 0.94) : feel.hatChance);
  }
  return normalizeDrumProbability(step % 8 === 0 ? Math.max(feel.percChance, 0.9) : feel.percChance);
}

export function grooveFeelMusicProbability(track: NoteTrack, index: number, feel: GrooveFeelDefinition): number {
  if (feel.id === "tight" || feel.id === "push") {
    return normalizeEventProbability(1);
  }
  const accent = track === "bass" ? index % 2 === 0 : index % 3 === 0;
  return normalizeEventProbability(accent ? Math.max(feel.musicChance, 0.94) : feel.musicChance);
}

export function sameGrooveFeelState(first: PatternData, second: PatternData): boolean {
  const lanes = Object.keys(drumLabels) as DrumLane[];
  const sameDrums = lanes.every((lane) =>
    first.drumTimings[lane].every(
      (timing, step) =>
        normalizeDrumTimingMs(timing) === normalizeDrumTimingMs(second.drumTimings[lane][step] ?? 0) &&
        normalizeDrumProbability(first.drumProbabilities[lane][step] ?? 1) ===
          normalizeDrumProbability(second.drumProbabilities[lane][step] ?? 1)
    )
  );
  if (!sameDrums) {
    return false;
  }
  return (
    sameNoteProbabilities(first.bassNotes, second.bassNotes) &&
    sameNoteProbabilities(first.melodyNotes, second.melodyNotes) &&
    sameChordProbabilities(first.chordEvents, second.chordEvents)
  );
}

export function sameNoteProbabilities(first: Array<BassNote | MelodyNote>, second: Array<BassNote | MelodyNote>): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((note, index) => normalizeEventProbability(note.probability) === normalizeEventProbability(second[index]?.probability ?? 1));
}

export function sameChordProbabilities(first: ChordEvent[], second: ChordEvent[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((event, index) => normalizeEventProbability(event.probability) === normalizeEventProbability(second[index]?.probability ?? 1));
}

export function createDrumAccentOptions(): DrumAccentOption[] {
  return drumAccentDefinitions.map((accent) => {
    const kick = drumAccentVelocity("kick", 0, accent.id);
    const hat = drumAccentVelocity("hat", 2, accent.id);
    return {
      ...accent,
      preview: `K ${Math.round(kick * 100)} / H ${Math.round(hat * 100)}`
    };
  });
}

export function applyDrumAccentToPattern(pattern: PatternData, accent: DrumAccentId): PatternData {
  const nextPatternData = clonePatternData(pattern);
  (Object.keys(drumLabels) as DrumLane[]).forEach((lane) => {
    nextPatternData.drumVelocities[lane] = nextPatternData.drumVelocities[lane].map((current, step) =>
      nextPatternData.drumPattern[lane][step] ? drumAccentVelocity(lane, step, accent) : normalizeDrumVelocity(current)
    );
  });
  return nextPatternData;
}

export function drumAccentVelocity(lane: DrumLane, step: number, accent: DrumAccentId): number {
  if (accent === "soft") {
    const base = lane === "kick" ? 0.76 : lane === "clap" ? 0.72 : lane === "hat" ? 0.48 : 0.44;
    const motion = step % 4 === 0 ? 0.06 : step % 2 === 0 ? 0.02 : -0.03;
    return normalizeDrumVelocity(base + motion);
  }
  if (accent === "knock") {
    const base = lane === "kick" ? 0.98 : lane === "clap" ? 0.92 : lane === "hat" ? 0.64 : 0.6;
    const anchor = step % 4 === 0 ? 0.05 : step % 2 === 0 ? 0.01 : -0.04;
    return normalizeDrumVelocity(base + anchor);
  }
  if (accent === "ghost") {
    if (lane === "kick" || lane === "clap") {
      return normalizeDrumVelocity((lane === "kick" ? 0.88 : 0.84) + (step % 8 === 0 ? 0.08 : 0));
    }
    const ghostBase = lane === "hat" ? 0.38 : 0.34;
    const ghostLift = step % 4 === 0 ? 0.26 : step % 2 === 0 ? 0.08 : 0;
    return normalizeDrumVelocity(ghostBase + ghostLift);
  }
  const progress = step / 15;
  const base = lane === "kick" ? 0.78 : lane === "clap" ? 0.74 : lane === "hat" ? 0.5 : 0.46;
  const lift = progress * (lane === "hat" || lane === "perc" ? 0.24 : 0.16);
  const pulse = step % 4 === 0 ? 0.08 : step % 2 === 0 ? 0.03 : -0.02;
  return normalizeDrumVelocity(base + lift + pulse);
}

export function sameDrumAccentState(first: PatternData, second: PatternData): boolean {
  return (Object.keys(drumLabels) as DrumLane[]).every((lane) =>
    first.drumVelocities[lane].every(
      (velocity, step) => normalizeDrumVelocity(velocity) === normalizeDrumVelocity(second.drumVelocities[lane][step] ?? defaultDrumVelocity(lane, step))
    )
  );
}

export function createPatternStackOptions(key: string): PatternStackOption[] {
  return patternStackDefinitions.map((stack) => {
    const events = createPatternStackEvents(key, stack);
    const firstBass = events.bassNotes[0]?.pitch ?? "-";
    const firstChord = events.chordEvents[0]?.root ?? "-";
    return {
      ...stack,
      preview: `${firstBass} / ${firstChord}`,
      bassCount: events.bassNotes.length,
      chordCount: events.chordEvents.length,
      melodyCount: events.melodyNotes.length
    };
  });
}

export function createPatternStackPreviewSummary(key: string, pattern: PatternData, stacks: PatternStackOption[]): PatternStackPreviewSummary {
  const stackMoves = stacks.map((option) => ({ stack: option, moves: patternStackMoveCount(key, pattern, option) }));
  const selected = stackMoves.find((option) => option.moves.total === 0) ?? stackMoves.find((option) => option.moves.total > 0);
  const stack = selected?.stack;
  const moves = selected?.moves ?? { bass: 0, chord: 0, melody: 0, total: 0 };
  const currentCount = pattern.bassNotes.length + pattern.chordEvents.length + pattern.melodyNotes.length;
  const patternLabel = `${pattern.bassNotes.length} 808 / ${pattern.chordEvents.length} chords / ${pattern.melodyNotes.length} synth`;
  const stackLabel = stack ? `${stack.label}: ${stack.preview}` : "Stack ready";
  const bassLabel = stack ? `${stack.bassCount} 808 notes` : "808 ready";
  const chordLabel = stack ? `${stack.chordCount} chords` : "Chords ready";
  const melodyLabel = stack ? `${stack.melodyCount} synth notes` : "Synth ready";
  const statusLabel = currentCount === 0 ? "Start stack" : moves.total === 0 ? "Stack aligned" : "Suggested stack";
  const moveLabel = `B ${moves.bass} / C ${moves.chord} / S ${moves.melody}`;
  return {
    statusLabel,
    patternLabel,
    stackLabel,
    bassLabel,
    chordLabel,
    melodyLabel,
    moveLabel,
    detailTitle: `${statusLabel}: ${patternLabel}; ${stackLabel}; ${bassLabel}; ${chordLabel}; ${melodyLabel}; ${moveLabel}.`,
    tone: currentCount === 0 ? "warn" : moves.total === 0 ? "good" : "warn",
    stackId: stack?.id ?? "none"
  };
}

export function createPatternStackResult(stack: PatternStackDefinition, beforeProject: ProjectState, afterProject: ProjectState): PatternStackResult {
  const beforePattern = activePattern(beforeProject);
  const afterPattern = activePattern(afterProject);
  const moves = patternStackMoveCount(beforeProject.key, beforePattern, stack);
  const metrics: PatternStackResultMetric[] = [
    createPatternStackResultMetric("bass", "808 notes", beforePattern.bassNotes.length, afterPattern.bassNotes.length, moves.bass),
    createPatternStackResultMetric("chord", "Chords", beforePattern.chordEvents.length, afterPattern.chordEvents.length, moves.chord),
    createPatternStackResultMetric("melody", "Synth notes", beforePattern.melodyNotes.length, afterPattern.melodyNotes.length, moves.melody)
  ];
  const changedCount = [moves.bass, moves.chord, moves.melody].filter((count) => count > 0).length;

  return {
    stackId: stack.id,
    title: `${stack.label} stack applied`,
    status: "Applied",
    detail: `Pattern ${afterProject.selectedPattern} / ${stack.detail}`,
    scope: "808 + Chords + Synth",
    impact: `B ${moves.bass} / C ${moves.chord} / S ${moves.melody}`,
    metrics,
    auditionCue: `Loop Pattern ${afterProject.selectedPattern}; listen for low-end, harmony, and top-line balance.`,
    nextCheck: "Use selected-note and selected-chord tools if the stack needs manual edits.",
    tone: changedCount > 0 ? "good" : "warn"
  };
}

export function createPatternStackResultMetric(
  id: PatternStackResultMetric["id"],
  label: string,
  beforeCount: number,
  afterCount: number,
  changedEvents: number
): PatternStackResultMetric {
  return {
    id,
    label,
    before: `${beforeCount}`,
    after: `${afterCount}`,
    tone: changedEvents === 0 ? "warn" : "good"
  };
}

export function patternStackMoveCount(
  key: string,
  pattern: PatternData,
  stack: PatternStackDefinition
): { bass: number; chord: number; melody: number; total: number } {
  const events = createPatternStackEvents(key, stack);
  const bass = bassNotesChangedCount(pattern.bassNotes, events.bassNotes);
  const chord = chordEventsChangedCount(pattern.chordEvents, events.chordEvents);
  const melody = melodyNotesChangedCount(pattern.melodyNotes, events.melodyNotes);
  return { bass, chord, melody, total: bass + chord + melody };
}

export function chordEventsChangedCount(current: ChordEvent[], transformed: ChordEvent[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentChord = current[index];
    const transformedChord = transformed[index];
    if (!currentChord || !transformedChord || !sameChordEvent(currentChord, transformedChord)) {
      changed += 1;
    }
  }
  return changed;
}

export function createLayerStarterResult(
  starterId: LayerStarterId,
  beforeProject: ProjectState,
  afterProject: ProjectState,
  beforeOption?: LayerStarterOption,
  afterOption?: LayerStarterOption
): LayerStarterResult {
  const beforePattern = beforeProject.patterns[beforeProject.selectedPattern];
  const afterPattern = afterProject.patterns[afterProject.selectedPattern];
  const layerLabel = afterOption?.label ?? beforeOption?.label ?? layerStarterLabel(starterId);
  const actionLabel = beforeOption?.actionLabel ?? afterOption?.actionLabel ?? layerLabel;
  const targetLabel = afterOption?.targetLabel ?? beforeOption?.targetLabel ?? "starter layer";
  const changedCount = layerStarterChangedCount(starterId, beforePattern, afterPattern);

  return {
    starterId,
    title: `${layerLabel} layer started`,
    status: "Started",
    detail: `Pattern ${afterProject.selectedPattern} / ${actionLabel}`,
    scope: `Pattern ${afterProject.selectedPattern} ${layerLabel}`,
    impact: `${changedCount} layer change${changedCount === 1 ? "" : "s"}`,
    metrics: createLayerStarterResultMetrics(starterId, beforePattern, afterPattern),
    auditionCue: layerStarterAuditionCue(starterId, afterProject.selectedPattern, targetLabel),
    nextCheck: layerStarterNextCheck(starterId, afterPattern),
    tone: changedCount > 0 ? "good" : "warn"
  };
}

export function createLayerStarterResultMetrics(
  starterId: LayerStarterId,
  beforePattern: PatternData,
  afterPattern: PatternData
): LayerStarterResultMetric[] {
  return [
    createLayerStarterResultMetric(
      "drums",
      "Drums",
      `${activeDrumHitCount(beforePattern)} hits`,
      `${activeDrumHitCount(afterPattern)} hits`,
      starterId,
      drumPatternMoveCount(beforePattern, afterPattern)
    ),
    createLayerStarterResultMetric(
      "bass",
      "808",
      `${beforePattern.bassNotes.length} notes`,
      `${afterPattern.bassNotes.length} notes`,
      starterId,
      bassNotesChangedCount(beforePattern.bassNotes, afterPattern.bassNotes)
    ),
    createLayerStarterResultMetric(
      "chords",
      "Chords",
      `${beforePattern.chordEvents.length} events`,
      `${afterPattern.chordEvents.length} events`,
      starterId,
      chordEventsChangedCount(beforePattern.chordEvents, afterPattern.chordEvents)
    ),
    createLayerStarterResultMetric(
      "melody",
      "Synth",
      `${beforePattern.melodyNotes.length} notes`,
      `${afterPattern.melodyNotes.length} notes`,
      starterId,
      melodyNotesChangedCount(beforePattern.melodyNotes, afterPattern.melodyNotes)
    )
  ];
}

export function createLayerStarterResultMetric(
  id: LayerStarterId,
  label: string,
  before: string,
  after: string,
  starterId: LayerStarterId,
  changedEvents: number
): LayerStarterResultMetric {
  const preserved = id !== starterId && before === after;
  return {
    id,
    label,
    before,
    after,
    tone: changedEvents > 0 || preserved ? "good" : "warn"
  };
}

function layerStarterChangedCount(starterId: LayerStarterId, beforePattern: PatternData, afterPattern: PatternData): number {
  switch (starterId) {
    case "drums":
      return drumPatternMoveCount(beforePattern, afterPattern);
    case "bass":
      return bassNotesChangedCount(beforePattern.bassNotes, afterPattern.bassNotes);
    case "chords":
      return chordEventsChangedCount(beforePattern.chordEvents, afterPattern.chordEvents);
    case "melody":
      return melodyNotesChangedCount(beforePattern.melodyNotes, afterPattern.melodyNotes);
  }
}

function layerStarterLabel(starterId: LayerStarterId): string {
  switch (starterId) {
    case "drums":
      return "Drums";
    case "bass":
      return "808";
    case "chords":
      return "Chords";
    case "melody":
      return "Synth";
  }
}

function layerStarterAuditionCue(starterId: LayerStarterId, pattern: PatternSlot, targetLabel: string): string {
  switch (starterId) {
    case "drums":
      return `Loop Pattern ${pattern}; check ${targetLabel} against the metronome and hat motion.`;
    case "bass":
      return `Loop Pattern ${pattern}; hear ${targetLabel} against the kick and low-end pocket.`;
    case "chords":
      return `Loop Pattern ${pattern}; hear ${targetLabel} under the 808 before writing the hook.`;
    case "melody":
      return `Loop Pattern ${pattern}; hear ${targetLabel} over drums, 808, and chords.`;
  }
}

function layerStarterNextCheck(starterId: LayerStarterId, pattern: PatternData): string {
  switch (starterId) {
    case "drums":
      return `${activeDrumHitCount(pattern)} drum hits now; use Groove Compass or selected-drum tools before adding 808.`;
    case "bass":
      return `${pattern.bassNotes.length} 808 notes now; use selected-note degree/role and kick-to-808 balance next.`;
    case "chords":
      return `${pattern.chordEvents.length} chord events now; use Key Compass and selected-chord tools to refine harmony.`;
    case "melody":
      return `${pattern.melodyNotes.length} Synth notes now; use Melody Move or selected-note tools to shape the hook.`;
  }
}

export function createPatternFillPreviewSummary(
  patternSlot: PatternSlot,
  pattern: PatternData,
  preset: PatternFillPreset,
  key: string
): PatternFillPreviewSummary {
  const previewPattern = applyPatternFillPreset(pattern, preset, key);
  const presetLabel = patternFillPresetLabel(preset);
  const changes = patternFillLayerChanges(pattern, previewPattern);
  const beforeEvents = patternEventTotal(pattern);
  const afterEvents = patternEventTotal(previewPattern);
  const statusLabel = changes.total > 0 ? "Preview fill" : "Fill aligned";
  const patternLabel = `Pattern ${patternSlot} / ${beforeEvents} -> ${afterEvents} events`;
  const presetLabelText = `${presetLabel} target`;
  const drumsLabel = `Drums ${changes.drums}`;
  const bassLabel = `808 ${changes.bass}`;
  const chordLabel = `Chords ${changes.chords}`;
  const melodyLabel = `Synth ${changes.melody}`;
  const moveLabel = `${changes.total} tail change${changes.total === 1 ? "" : "s"}`;

  return {
    preset,
    pattern: patternSlot,
    statusLabel,
    patternLabel,
    presetLabel: presetLabelText,
    drumsLabel,
    bassLabel,
    chordLabel,
    melodyLabel,
    moveLabel,
    detailTitle: `${statusLabel}: ${patternLabel}; ${presetLabelText}; ${drumsLabel}; ${bassLabel}; ${chordLabel}; ${melodyLabel}; ${moveLabel}.`,
    tone: changes.total > 0 ? "warn" : "good"
  };
}

export function suggestedPatternFillPreset(pattern: PatternData): PatternFillPreset {
  return pattern.bassNotes.length < 3 ? "bass_pickup" : pattern.melodyNotes.length < 3 ? "melody_turn" : "drum_fill";
}

export function createPatternFillSuggestionSummary(patternSlot: PatternSlot, pattern: PatternData, key: string): PatternFillSuggestionSummary {
  const preset = suggestedPatternFillPreset(pattern);
  const preview = createPatternFillPreviewSummary(patternSlot, pattern, preset, key);
  const presetLabel = patternFillPresetLabel(preset);
  const eventLabel = `${patternEventTotal(pattern)} events`;
  const statusLabel = preview.tone === "good" ? "Fill ready" : "Suggested fill";
  const detailLabel = `${eventLabel} / ${preview.moveLabel}`;

  return {
    preset,
    statusLabel,
    patternLabel: `Pattern ${patternSlot}`,
    presetLabel,
    detailLabel,
    moveLabel: preview.moveLabel,
    detailTitle: `${statusLabel}: Pattern ${patternSlot}; ${presetLabel}; ${detailLabel}.`,
    tone: preview.tone
  };
}

export function createPatternFillResult(
  preset: PatternFillPreset,
  beforeProject: ProjectState,
  afterProject: ProjectState
): PatternFillResult {
  const pattern = afterProject.selectedPattern;
  const beforePattern = beforeProject.patterns[beforeProject.selectedPattern];
  const afterPattern = afterProject.patterns[pattern];
  const presetLabel = patternFillPresetLabel(preset);
  const changedCount = patternFillChangedCount(beforePattern, afterPattern);

  return {
    preset,
    pattern,
    title: `${presetLabel} ready`,
    status: preset === "clear_tail" ? "Cleared" : "Applied",
    detail: `Pattern ${pattern} / ${presetLabel}`,
    scope: `Pattern ${pattern} tail events`,
    impact: `${changedCount} tail change${changedCount === 1 ? "" : "s"}`,
    metrics: createPatternFillResultMetrics(preset, beforePattern, afterPattern),
    auditionCue: patternFillAuditionCue(preset, pattern),
    nextCheck: patternFillNextCheck(preset, afterPattern),
    tone: changedCount > 0 ? "good" : "warn"
  };
}

export function createPatternFillResultMetrics(
  preset: PatternFillPreset,
  beforePattern: PatternData,
  afterPattern: PatternData
): PatternFillResultMetric[] {
  const affected = patternFillAffectedMetrics(preset);
  return [
    createPatternFillResultMetric(
      "events",
      "Events",
      `${patternEventTotal(beforePattern)} total`,
      `${patternEventTotal(afterPattern)} total`,
      affected,
      patternFillChangedCount(beforePattern, afterPattern)
    ),
    createPatternFillResultMetric(
      "drums",
      "Drums",
      `${activeDrumHitCount(beforePattern)} hits`,
      `${activeDrumHitCount(afterPattern)} hits`,
      affected,
      drumPatternMoveCount(beforePattern, afterPattern)
    ),
    createPatternFillResultMetric(
      "bass",
      "808",
      `${beforePattern.bassNotes.length} notes`,
      `${afterPattern.bassNotes.length} notes`,
      affected,
      bassNotesChangedCount(beforePattern.bassNotes, afterPattern.bassNotes)
    ),
    createPatternFillResultMetric(
      "chords",
      "Chords",
      `${beforePattern.chordEvents.length} events`,
      `${afterPattern.chordEvents.length} events`,
      affected,
      chordEventsChangedCount(beforePattern.chordEvents, afterPattern.chordEvents)
    ),
    createPatternFillResultMetric(
      "melody",
      "Synth",
      `${beforePattern.melodyNotes.length} notes`,
      `${afterPattern.melodyNotes.length} notes`,
      affected,
      melodyNotesChangedCount(beforePattern.melodyNotes, afterPattern.melodyNotes)
    )
  ];
}

export function createPatternFillResultMetric(
  id: PatternFillResultMetric["id"],
  label: string,
  before: string,
  after: string,
  affected: Set<PatternFillResultMetric["id"]>,
  changedEvents: number
): PatternFillResultMetric {
  const preserved = !affected.has(id) && before === after;
  return {
    id,
    label,
    before,
    after,
    tone: changedEvents > 0 || preserved ? "good" : "warn"
  };
}

function patternFillChangedCount(beforePattern: PatternData, afterPattern: PatternData): number {
  return patternFillLayerChanges(beforePattern, afterPattern).total;
}

function patternFillLayerChanges(
  beforePattern: PatternData,
  afterPattern: PatternData
): { drums: number; bass: number; chords: number; melody: number; total: number } {
  const drums = drumPatternMoveCount(beforePattern, afterPattern);
  const bass = bassNotesChangedCount(beforePattern.bassNotes, afterPattern.bassNotes);
  const chords = chordEventsChangedCount(beforePattern.chordEvents, afterPattern.chordEvents);
  const melody = melodyNotesChangedCount(beforePattern.melodyNotes, afterPattern.melodyNotes);
  return { drums, bass, chords, melody, total: drums + bass + chords + melody };
}

function patternFillAffectedMetrics(preset: PatternFillPreset): Set<PatternFillResultMetric["id"]> {
  if (preset === "drum_fill") {
    return new Set(["events", "drums"]);
  }
  if (preset === "bass_pickup") {
    return new Set(["events", "bass"]);
  }
  if (preset === "melody_turn") {
    return new Set(["events", "melody"]);
  }
  return new Set(["events", "drums", "bass", "chords", "melody"]);
}

function patternFillAuditionCue(preset: PatternFillPreset, pattern: PatternSlot): string {
  switch (preset) {
    case "drum_fill":
      return `Loop Pattern ${pattern}; listen to the last bar for kick, clap, hat, and perc lift.`;
    case "bass_pickup":
      return `Loop Pattern ${pattern}; hear the 808 pickup into bar one and check kick overlap.`;
    case "melody_turn":
      return `Loop Pattern ${pattern}; hear the Synth turn into the next loop and check hook tension.`;
    case "clear_tail":
      return `Loop Pattern ${pattern}; confirm the tail is clean before adding a new transition.`;
  }
}

function patternFillNextCheck(preset: PatternFillPreset, pattern: PatternData): string {
  switch (preset) {
    case "drum_fill":
      return `${activeDrumHitCount(pattern)} drum hits now; use selected-drum tools if the fill is too busy.`;
    case "bass_pickup":
      return `${pattern.bassNotes.length} 808 notes now; use selected-note tools to trim length, glide, or pitch.`;
    case "melody_turn":
      return `${pattern.melodyNotes.length} Synth notes now; use Melody Move or selected-note tools to shape the turn.`;
    case "clear_tail":
      return `${patternEventTotal(pattern)} Pattern events remain; add a new fill only after the core loop feels stable.`;
  }
}

export function createPatternVariationPreviewSummary(
  patternSlot: PatternSlot,
  pattern: PatternData,
  preset: PatternVariationPreset
): PatternVariationPreviewSummary {
  const previewPattern = createPatternVariation(pattern, preset);
  const presetLabel = patternVariationPresetLabel(preset);
  const changes = patternVariationLayerChanges(pattern, previewPattern);
  const beforeEvents = patternEventTotal(pattern);
  const afterEvents = patternEventTotal(previewPattern);
  const statusLabel = changes.total > 0 ? "Preview variation" : "Variation aligned";
  const patternLabel = `Pattern ${patternSlot} / ${beforeEvents} -> ${afterEvents} events`;
  const presetLabelText = `${presetLabel} target`;
  const drumsLabel = `Drums ${changes.drums}`;
  const bassLabel = `808 ${changes.bass}`;
  const chordLabel = `Chords ${changes.chords}`;
  const melodyLabel = `Synth ${changes.melody}`;
  const moveLabel = `${changes.total} change${changes.total === 1 ? "" : "s"}`;

  return {
    preset,
    pattern: patternSlot,
    statusLabel,
    patternLabel,
    presetLabel: presetLabelText,
    drumsLabel,
    bassLabel,
    chordLabel,
    melodyLabel,
    moveLabel,
    detailTitle: `${statusLabel}: ${patternLabel}; ${presetLabelText}; ${drumsLabel}; ${bassLabel}; ${chordLabel}; ${melodyLabel}; ${moveLabel}.`,
    tone: changes.total > 0 ? "warn" : "good"
  };
}

export function suggestedPatternVariationPreset(pattern: PatternData): PatternVariationPreset {
  const totalEvents = patternEventTotal(pattern);
  const musicEvents = patternMusicEventCount(pattern);
  const drumHits = activeDrumHitCount(pattern);

  if (totalEvents < 24 || musicEvents < 6) {
    return "hook";
  }

  if (totalEvents >= 28 && totalEvents <= 44 && drumHits >= 14 && musicEvents >= 8) {
    return "switchup";
  }

  if (totalEvents > 44 || drumHits > 26) {
    return "breakdown";
  }

  return "subtle";
}

export function createPatternVariationSuggestionSummary(
  patternSlot: PatternSlot,
  pattern: PatternData
): PatternVariationSuggestionSummary {
  const preset = suggestedPatternVariationPreset(pattern);
  const preview = createPatternVariationPreviewSummary(patternSlot, pattern, preset);
  const presetLabel = patternVariationPresetLabel(preset);
  const eventLabel = `${patternEventTotal(pattern)} events`;
  const statusLabel = preview.tone === "good" ? "Variation aligned" : "Suggested variation";
  const detailLabel = `${eventLabel} / ${preview.moveLabel}`;

  return {
    preset,
    statusLabel,
    patternLabel: `Pattern ${patternSlot}`,
    presetLabel,
    detailLabel,
    moveLabel: preview.moveLabel,
    detailTitle: `${statusLabel}: Pattern ${patternSlot}; ${presetLabel}; ${detailLabel}.`,
    tone: preview.tone
  };
}

export function createPatternVariationResult(
  preset: PatternVariationPreset,
  beforeProject: ProjectState,
  afterProject: ProjectState
): PatternVariationResult {
  const pattern = afterProject.selectedPattern;
  const beforePattern = beforeProject.patterns[beforeProject.selectedPattern];
  const afterPattern = afterProject.patterns[pattern];
  const presetLabel = patternVariationPresetLabel(preset);
  const changedCount = patternVariationChangedCount(beforePattern, afterPattern);

  return {
    preset,
    pattern,
    title: `${presetLabel} variation ready`,
    status: "Applied",
    detail: `Pattern ${pattern} / ${presetLabel}`,
    scope: `Pattern ${pattern} drums, 808, chords, and Synth`,
    impact: `${changedCount} event change${changedCount === 1 ? "" : "s"}`,
    metrics: createPatternVariationResultMetrics(beforePattern, afterPattern),
    auditionCue: patternVariationAuditionCue(preset, pattern),
    nextCheck: patternVariationNextCheck(preset, afterPattern),
    tone: changedCount > 0 ? "good" : "warn"
  };
}

export function createPatternVariationResultMetrics(
  beforePattern: PatternData,
  afterPattern: PatternData
): PatternVariationResultMetric[] {
  const changedCount = patternVariationChangedCount(beforePattern, afterPattern);
  return [
    createPatternVariationResultMetric(
      "events",
      "Events",
      `${patternEventTotal(beforePattern)} total`,
      `${patternEventTotal(afterPattern)} total`,
      changedCount
    ),
    createPatternVariationResultMetric(
      "drums",
      "Drums",
      `${activeDrumHitCount(beforePattern)} hits`,
      `${activeDrumHitCount(afterPattern)} hits`,
      drumPatternMoveCount(beforePattern, afterPattern)
    ),
    createPatternVariationResultMetric(
      "bass",
      "808",
      `${beforePattern.bassNotes.length} notes`,
      `${afterPattern.bassNotes.length} notes`,
      bassNotesChangedCount(beforePattern.bassNotes, afterPattern.bassNotes)
    ),
    createPatternVariationResultMetric(
      "chords",
      "Chords",
      `${beforePattern.chordEvents.length} events`,
      `${afterPattern.chordEvents.length} events`,
      chordEventsChangedCount(beforePattern.chordEvents, afterPattern.chordEvents)
    ),
    createPatternVariationResultMetric(
      "melody",
      "Synth",
      `${beforePattern.melodyNotes.length} notes`,
      `${afterPattern.melodyNotes.length} notes`,
      melodyNotesChangedCount(beforePattern.melodyNotes, afterPattern.melodyNotes)
    )
  ];
}

export function createPatternVariationResultMetric(
  id: PatternVariationResultMetric["id"],
  label: string,
  before: string,
  after: string,
  changedEvents: number
): PatternVariationResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: changedEvents > 0 ? "good" : "warn"
  };
}

function patternVariationChangedCount(beforePattern: PatternData, afterPattern: PatternData): number {
  return patternVariationLayerChanges(beforePattern, afterPattern).total;
}

function patternVariationLayerChanges(
  beforePattern: PatternData,
  afterPattern: PatternData
): { drums: number; bass: number; chords: number; melody: number; total: number } {
  const drums = drumPatternMoveCount(beforePattern, afterPattern);
  const bass = bassNotesChangedCount(beforePattern.bassNotes, afterPattern.bassNotes);
  const chords = chordEventsChangedCount(beforePattern.chordEvents, afterPattern.chordEvents);
  const melody = melodyNotesChangedCount(beforePattern.melodyNotes, afterPattern.melodyNotes);
  return { drums, bass, chords, melody, total: drums + bass + chords + melody };
}

function patternVariationAuditionCue(preset: PatternVariationPreset, pattern: PatternSlot): string {
  switch (preset) {
    case "subtle":
      return `Loop Pattern ${pattern}; listen for pocket, probability, and velocity movement before arranging.`;
    case "hook":
      return `Loop Pattern ${pattern}; confirm the hook lift across drums, 808, chords, and Synth.`;
    case "breakdown":
      return `Loop Pattern ${pattern}; check the breakdown space before placing it in a section change.`;
    case "switchup":
      return `Loop Pattern ${pattern}; check the switchup lift, tail roll, and 808 pickup before placing it before a hook or drop.`;
  }
}

function patternVariationNextCheck(preset: PatternVariationPreset, pattern: PatternData): string {
  switch (preset) {
    case "subtle":
      return `${patternEventTotal(pattern)} Pattern events now; use Groove Compass or selected-event tools if the pocket needs cleanup.`;
    case "hook":
      return `${activeDrumHitCount(pattern)} drum hits and ${patternMusicEventCount(pattern)} music events now; compare Pattern A/B/C before making it the hook.`;
    case "breakdown":
      return `${patternEventTotal(pattern)} Pattern events now; use Pattern Chain or Arrangement Focus to place the break intentionally.`;
    case "switchup":
      return `${activeDrumHitCount(pattern)} drum hits and ${patternMusicEventCount(pattern)} music events now; cue the next Pattern and confirm the transition has enough lift.`;
  }
}

export function createPatternClonePadOptions(source: PatternSlot): PatternClonePadOption[] {
  return patternSlots
    .filter((target) => target !== source)
    .flatMap((target) =>
      patternCloneVariationPresets.map((preset) => ({
        id: `${target}-${preset}`,
        source,
        target,
        preset,
        label: `To ${target}`,
        preview: patternVariationPresetLabel(preset),
        detail: `Clone ${source} -> ${target}`
      }))
    );
}

export function suggestedPatternCloneTarget(source: PatternSlot, patterns: ProjectState["patterns"]): PatternSlot {
  return patternSlots
    .filter((target) => target !== source)
    .sort((first, second) => patternEventTotal(patterns[first]) - patternEventTotal(patterns[second]))[0];
}

export function suggestedPatternClonePreset(pattern: PatternData): PatternVariationPreset {
  return patternEventTotal(pattern) > 40 || activeDrumHitCount(pattern) > 24 ? "breakdown" : "hook";
}

export function createPatternCloneSuggestionSummary(
  source: PatternSlot,
  patterns: ProjectState["patterns"]
): PatternCloneSuggestionSummary {
  const sourcePattern = patterns[source];
  const target = suggestedPatternCloneTarget(source, patterns);
  const beforeTarget = patterns[target];
  const preset = suggestedPatternClonePreset(sourcePattern);
  const afterTarget = createPatternVariation(sourcePattern, preset);
  const changedCount = patternCloneChangedCount(beforeTarget, afterTarget);
  const sourceEventCount = patternEventTotal(sourcePattern);
  const targetEventCount = patternEventTotal(beforeTarget);
  const presetLabel = patternVariationPresetLabel(preset);
  const statusLabel = targetEventCount === 0 ? "Clone slot ready" : "Suggested clone";
  const routeLabel = `Pattern ${source} -> ${target}`;
  const detailLabel = `${sourceEventCount} source / ${targetEventCount} target`;
  const moveLabel = `${changedCount} target change${changedCount === 1 ? "" : "s"}`;

  return {
    source,
    target,
    preset,
    statusLabel,
    routeLabel,
    presetLabel,
    detailLabel,
    moveLabel,
    detailTitle: `${statusLabel}: ${routeLabel}; ${presetLabel}; ${detailLabel}; ${moveLabel}.`,
    tone: targetEventCount === 0 ? "good" : "warn"
  };
}

export function createPatternCloneResult(
  source: PatternSlot,
  target: PatternSlot,
  preset: PatternVariationPreset,
  beforeProject: ProjectState,
  afterProject: ProjectState
): PatternCloneResult {
  const beforeSource = beforeProject.patterns[source];
  const beforeTarget = beforeProject.patterns[target];
  const afterTarget = afterProject.patterns[target];
  const presetLabel = patternVariationPresetLabel(preset);
  const targetMoveCount = patternCloneChangedCount(beforeTarget, afterTarget);
  const sourceEventCount = patternEventTotal(beforeSource);
  const targetBeforeEventCount = patternEventTotal(beforeTarget);
  const targetAfterEventCount = patternEventTotal(afterTarget);
  const drumBefore = activeDrumHitCount(beforeTarget);
  const drumAfter = activeDrumHitCount(afterTarget);
  const musicBefore = patternMusicEventCount(beforeTarget);
  const musicAfter = patternMusicEventCount(afterTarget);
  const metrics: PatternCloneResultMetric[] = [
    createPatternCloneResultMetric("source", "Source", `${sourceEventCount} events`, `${sourceEventCount} events`, 0, "good"),
    createPatternCloneResultMetric("target", "Target", `${targetBeforeEventCount} events`, `${targetAfterEventCount} events`, targetMoveCount),
    createPatternCloneResultMetric("drums", "Drums", `${drumBefore} hits`, `${drumAfter} hits`, Math.abs(drumBefore - drumAfter)),
    createPatternCloneResultMetric("music", "Music", `${musicBefore} events`, `${musicAfter} events`, Math.abs(musicBefore - musicAfter))
  ];

  return {
    source,
    target,
    preset,
    title: `Pattern ${target} ${presetLabel} clone ready`,
    status: "Cloned",
    detail: `Pattern ${source} -> ${target} / ${presetLabel}`,
    scope: `Pattern ${target} edit focus`,
    impact: `${targetMoveCount} target change${targetMoveCount === 1 ? "" : "s"}`,
    metrics,
    auditionCue: `Loop Pattern ${target}; compare it against Pattern ${source} before placing it in the arrangement.`,
    nextCheck: "Use Pattern Compare, Pattern DNA, or selected event tools to refine the cloned variation.",
    tone: targetMoveCount > 0 ? "good" : "warn"
  };
}

export function createPatternCloneResultMetric(
  id: PatternCloneResultMetric["id"],
  label: string,
  before: string,
  after: string,
  changedEvents: number,
  tone?: PatternCloneResultMetric["tone"]
): PatternCloneResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: tone ?? (changedEvents === 0 ? "warn" : "good")
  };
}

function patternCloneChangedCount(beforePattern: PatternData, afterPattern: PatternData): number {
  return (
    drumPatternMoveCount(beforePattern, afterPattern) +
    bassNotesChangedCount(beforePattern.bassNotes, afterPattern.bassNotes) +
    chordEventsChangedCount(beforePattern.chordEvents, afterPattern.chordEvents) +
    melodyNotesChangedCount(beforePattern.melodyNotes, afterPattern.melodyNotes)
  );
}

export function createPatternEditResult(
  action: PatternEditResult["action"],
  source: PatternSlot,
  target: PatternSlot,
  beforeProject: ProjectState,
  afterProject: ProjectState
): PatternEditResult {
  const beforeSource = beforeProject.patterns[source];
  const beforeTarget = beforeProject.patterns[target];
  const afterTarget = afterProject.patterns[target];
  const changedCount = patternEditChangedCount(beforeTarget, afterTarget);
  const targetEventCount = patternEventTotal(afterTarget);

  return {
    action,
    source,
    target,
    title: action === "copy" ? `Pattern ${target} copy ready` : `Pattern ${target} cleared`,
    status: action === "copy" ? "Copied" : "Cleared",
    detail: action === "copy" ? `Pattern ${source} -> ${target}` : `Pattern ${target} reset to empty`,
    scope: action === "copy" ? `Pattern ${target} edit focus` : `Pattern ${target} drums, 808, chords, and Synth`,
    impact: `${changedCount} event change${changedCount === 1 ? "" : "s"}`,
    metrics: createPatternEditResultMetrics(action, source, target, beforeSource, beforeTarget, afterTarget),
    auditionCue: patternEditAuditionCue(action, source, target),
    nextCheck: patternEditNextCheck(action, target, targetEventCount),
    tone: changedCount > 0 || action === "clear" ? "good" : "warn"
  };
}

export function createPatternEditResultMetrics(
  action: PatternEditResult["action"],
  source: PatternSlot,
  target: PatternSlot,
  beforeSource: PatternData,
  beforeTarget: PatternData,
  afterTarget: PatternData
): PatternEditResultMetric[] {
  const sourceEvents = patternEventTotal(beforeSource);
  const beforeTargetEvents = patternEventTotal(beforeTarget);
  const afterTargetEvents = patternEventTotal(afterTarget);
  return [
    createPatternEditResultMetric(
      "source",
      "Source",
      `Pattern ${source} / ${sourceEvents} events`,
      action === "copy" ? `Pattern ${source} preserved` : "Not edited",
      0,
      "good"
    ),
    createPatternEditResultMetric(
      "target",
      "Target",
      `Pattern ${target} / ${beforeTargetEvents} events`,
      `Pattern ${target} / ${afterTargetEvents} events`,
      patternEditChangedCount(beforeTarget, afterTarget)
    ),
    createPatternEditResultMetric(
      "events",
      "Events",
      `${beforeTargetEvents} total`,
      `${afterTargetEvents} total`,
      Math.abs(beforeTargetEvents - afterTargetEvents)
    ),
    createPatternEditResultMetric(
      "drums",
      "Drums",
      `${activeDrumHitCount(beforeTarget)} hits`,
      `${activeDrumHitCount(afterTarget)} hits`,
      drumPatternMoveCount(beforeTarget, afterTarget)
    ),
    createPatternEditResultMetric(
      "music",
      "Music",
      `${patternMusicEventCount(beforeTarget)} events`,
      `${patternMusicEventCount(afterTarget)} events`,
      patternMusicChangedCount(beforeTarget, afterTarget)
    )
  ];
}

export function createPatternEditResultMetric(
  id: PatternEditResultMetric["id"],
  label: string,
  before: string,
  after: string,
  changedEvents: number,
  tone?: PatternEditResultMetric["tone"]
): PatternEditResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: tone ?? (changedEvents > 0 ? "good" : "warn")
  };
}

function patternEditChangedCount(beforePattern: PatternData, afterPattern: PatternData): number {
  return drumPatternMoveCount(beforePattern, afterPattern) + patternMusicChangedCount(beforePattern, afterPattern);
}

function patternMusicChangedCount(beforePattern: PatternData, afterPattern: PatternData): number {
  return (
    bassNotesChangedCount(beforePattern.bassNotes, afterPattern.bassNotes) +
    chordEventsChangedCount(beforePattern.chordEvents, afterPattern.chordEvents) +
    melodyNotesChangedCount(beforePattern.melodyNotes, afterPattern.melodyNotes)
  );
}

function patternEditAuditionCue(action: PatternEditResult["action"], source: PatternSlot, target: PatternSlot): string {
  if (action === "copy") {
    return `Loop Pattern ${target}; compare it against Pattern ${source} before assigning it to a section.`;
  }
  return `Loop Pattern ${target}; confirm the cleared pattern is silent before rebuilding layers.`;
}

function patternEditNextCheck(action: PatternEditResult["action"], target: PatternSlot, targetEventCount: number): string {
  if (action === "copy") {
    return `${targetEventCount} Pattern ${target} events now; use Pattern Compare, Pattern DNA, or selected-event tools before arranging.`;
  }
  return `${targetEventCount} Pattern ${target} events now; use Layer Starter, Drum Foundation, 808 Bassline, Chord Pads, or Melody Motif to rebuild.`;
}

function patternMusicEventCount(pattern: PatternData): number {
  return pattern.bassNotes.length + pattern.chordEvents.length + pattern.melodyNotes.length;
}

export function createPatternStackEvents(key: string, stack: PatternStackDefinition): PatternStackEvents {
  const bassline = basslinePadDefinitions.find((pad) => pad.id === stack.bassline) ?? basslinePadDefinitions[0];
  const motif = melodyMotifDefinitions.find((candidate) => candidate.id === stack.motif) ?? melodyMotifDefinitions[0];
  return {
    bassNotes: bassline ? createBasslinePadNotes(key, bassline) : [],
    chordEvents: createChordProgressionPreset(stack.chordPreset, key),
    melodyNotes: motif ? createMelodyMotifNotes(key, motif) : []
  };
}

export function samePatternStackEvents(pattern: PatternData, events: PatternStackEvents): boolean {
  return (
    sameBassNotes(pattern.bassNotes, events.bassNotes) &&
    sameChordEvents(pattern.chordEvents, events.chordEvents) &&
    sameMelodyNotes(pattern.melodyNotes, events.melodyNotes)
  );
}

export function createDrumFoundationOptions(): DrumFoundationOption[] {
  return drumFoundationDefinitions.map((foundation) => ({
    ...foundation,
    preview: `K${foundation.kick.length} C${foundation.clap.length} H${foundation.hat.length}`,
    hitCount: foundation.kick.length + foundation.clap.length + foundation.hat.length + foundation.perc.length
  }));
}

export function createDrumMovePreviewSummary(
  pattern: PatternData,
  foundations: DrumFoundationOption[],
  feels: GrooveFeelOption[],
  accents: DrumAccentOption[]
): DrumMovePreviewSummary {
  const foundation = foundations.find((option) => drumFoundationMoveCount(pattern, option) > 0) ?? foundations[0];
  const feel = feels.find((option) => drumFeelMoveCount(pattern, option) > 0) ?? feels[0];
  const accent = accents.find((option) => drumAccentMoveCount(pattern, option) > 0) ?? accents[0];
  const foundationMoveCount = foundation ? drumFoundationMoveCount(pattern, foundation) : 0;
  const feelMoveCount = feel ? drumFeelMoveCount(pattern, feel) : 0;
  const accentMoveCount = accent ? drumAccentMoveCount(pattern, accent) : 0;
  const totalMoveCount = foundationMoveCount + feelMoveCount + accentMoveCount;
  const hitCount = activeDrumHitCount(pattern);
  const patternLabel = hitCount === 0 ? "No drum hits" : drumPatternHitLabel(pattern);
  const foundationLabel = foundation ? `${foundation.label}: ${foundation.preview}` : "Foundation ready";
  const feelLabel = feel ? `${feel.label}: ${feel.timingPreview}` : "Feel ready";
  const accentLabel = accent ? `${accent.label}: ${accent.preview}` : "Accent ready";
  const statusLabel = hitCount === 0 ? "Start drums" : totalMoveCount === 0 ? "Drums aligned" : "Suggested move";
  const moveLabel = `F ${foundationMoveCount} / G ${feelMoveCount} / A ${accentMoveCount}`;
  return {
    statusLabel,
    patternLabel,
    foundationLabel,
    feelLabel,
    accentLabel,
    moveLabel,
    detailTitle: `${statusLabel}: ${patternLabel}; ${foundationLabel}; ${feelLabel}; ${accentLabel}; ${moveLabel}.`,
    tone: hitCount === 0 ? "warn" : totalMoveCount === 0 ? "good" : "warn",
    foundationId: foundation?.id ?? "none",
    feelId: feel?.id ?? "none",
    accentId: accent?.id ?? "none"
  };
}

export function activeDrumHitCount(pattern: PatternData): number {
  return (Object.keys(drumLabels) as DrumLane[]).reduce(
    (total, lane) => total + pattern.drumPattern[lane].filter(Boolean).length,
    0
  );
}

export function drumPatternHitLabel(pattern: PatternData): string {
  const kickCount = pattern.drumPattern.kick.filter(Boolean).length;
  const clapCount = pattern.drumPattern.clap.filter(Boolean).length;
  const hatCount = pattern.drumPattern.hat.filter(Boolean).length;
  const percCount = pattern.drumPattern.perc.filter(Boolean).length;
  return `K${kickCount} C${clapCount} H${hatCount} P${percCount}`;
}

export function drumFoundationMoveCount(pattern: PatternData, foundation: DrumFoundationDefinition): number {
  return drumPatternMoveCount(pattern, applyDrumFoundationToPattern(pattern, foundation));
}

export function drumFeelMoveCount(pattern: PatternData, feel: GrooveFeelDefinition): number {
  return drumPatternMoveCount(pattern, applyGrooveFeelToPattern(pattern, feel));
}

export function drumAccentMoveCount(pattern: PatternData, accent: DrumAccentDefinition): number {
  return drumPatternMoveCount(pattern, applyDrumAccentToPattern(pattern, accent.id));
}

export function createDrumMoveResult(
  kind: DrumMoveResultKind,
  id: string,
  label: string,
  detail: string,
  beforeProject: ProjectState,
  afterProject: ProjectState
): DrumMoveResult {
  const beforePattern = activePattern(beforeProject);
  const afterPattern = activePattern(afterProject);
  const hitMoves = drumHitMoveCount(beforePattern, afterPattern);
  const timingMoves = drumTimingMoveCount(beforePattern, afterPattern);
  const chanceMoves = drumChanceMoveCount(beforePattern, afterPattern);
  const velocityMoves = drumVelocityMoveCount(beforePattern, afterPattern);
  const metrics: DrumMoveResultMetric[] = [
    createDrumMoveResultMetric("hits", "Hits", drumPatternHitLabel(beforePattern), drumPatternHitLabel(afterPattern), hitMoves),
    createDrumMoveResultMetric("timing", "Timing", drumAverageTimingLabel(beforePattern), drumAverageTimingLabel(afterPattern), timingMoves),
    createDrumMoveResultMetric("chance", "Chance", drumAverageChanceLabel(beforePattern), drumAverageChanceLabel(afterPattern), chanceMoves),
    createDrumMoveResultMetric("velocity", "Velocity", drumAverageVelocityLabel(beforePattern), drumAverageVelocityLabel(afterPattern), velocityMoves)
  ];
  const changedGroups = [hitMoves, timingMoves, chanceMoves, velocityMoves].filter((count) => count > 0).length;

  return {
    moveId: `${kind.toLowerCase()}-${id}`,
    title: `${label} ${kind} applied`,
    status: "Applied",
    detail: `Pattern ${afterProject.selectedPattern} / ${detail}`,
    scope: "Drums",
    impact: `H ${hitMoves} / T ${timingMoves} / C ${chanceMoves} / V ${velocityMoves}`,
    metrics,
    auditionCue: `Loop Pattern ${afterProject.selectedPattern}; check kick/clap anchors, hat pocket, and percussion motion.`,
    nextCheck: "Use selected-drum pocket and hit tools for manual edits.",
    tone: changedGroups > 0 ? "good" : "warn"
  };
}

export function createDrumMoveResultMetric(
  id: DrumMoveResultMetric["id"],
  label: string,
  before: string,
  after: string,
  changedEvents: number
): DrumMoveResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: changedEvents === 0 ? "warn" : "good"
  };
}

export function drumPatternMoveCount(current: PatternData, transformed: PatternData): number {
  let changed = 0;
  for (const lane of Object.keys(drumLabels) as DrumLane[]) {
    for (const step of steps) {
      if (current.drumPattern[lane][step] !== transformed.drumPattern[lane][step]) {
        changed += 1;
      }
      if (
        normalizeDrumVelocity(current.drumVelocities[lane][step] ?? defaultDrumVelocity(lane, step)) !==
        normalizeDrumVelocity(transformed.drumVelocities[lane][step] ?? defaultDrumVelocity(lane, step))
      ) {
        changed += 1;
      }
      if (normalizeDrumTimingMs(current.drumTimings[lane][step] ?? 0) !== normalizeDrumTimingMs(transformed.drumTimings[lane][step] ?? 0)) {
        changed += 1;
      }
      if (
        normalizeDrumProbability(current.drumProbabilities[lane][step] ?? 1) !==
        normalizeDrumProbability(transformed.drumProbabilities[lane][step] ?? 1)
      ) {
        changed += 1;
      }
    }
  }
  for (const step of steps) {
    if (normalizeHatRepeat(current.hatRepeats[step] ?? 1) !== normalizeHatRepeat(transformed.hatRepeats[step] ?? 1)) {
      changed += 1;
    }
  }
  changed += noteProbabilityMoveCount(current.bassNotes, transformed.bassNotes);
  changed += noteProbabilityMoveCount(current.melodyNotes, transformed.melodyNotes);
  changed += chordProbabilityMoveCount(current.chordEvents, transformed.chordEvents);
  return changed;
}

export function drumHitMoveCount(current: PatternData, transformed: PatternData): number {
  let changed = 0;
  for (const lane of Object.keys(drumLabels) as DrumLane[]) {
    for (const step of steps) {
      if (current.drumPattern[lane][step] !== transformed.drumPattern[lane][step]) {
        changed += 1;
      }
    }
  }
  return changed;
}

export function drumTimingMoveCount(current: PatternData, transformed: PatternData): number {
  let changed = 0;
  for (const lane of Object.keys(drumLabels) as DrumLane[]) {
    for (const step of steps) {
      if (normalizeDrumTimingMs(current.drumTimings[lane][step] ?? 0) !== normalizeDrumTimingMs(transformed.drumTimings[lane][step] ?? 0)) {
        changed += 1;
      }
    }
  }
  return changed;
}

export function drumChanceMoveCount(current: PatternData, transformed: PatternData): number {
  let changed = 0;
  for (const lane of Object.keys(drumLabels) as DrumLane[]) {
    for (const step of steps) {
      if (
        normalizeDrumProbability(current.drumProbabilities[lane][step] ?? 1) !==
        normalizeDrumProbability(transformed.drumProbabilities[lane][step] ?? 1)
      ) {
        changed += 1;
      }
    }
  }
  changed += noteProbabilityMoveCount(current.bassNotes, transformed.bassNotes);
  changed += noteProbabilityMoveCount(current.melodyNotes, transformed.melodyNotes);
  changed += chordProbabilityMoveCount(current.chordEvents, transformed.chordEvents);
  return changed;
}

export function drumVelocityMoveCount(current: PatternData, transformed: PatternData): number {
  let changed = 0;
  for (const lane of Object.keys(drumLabels) as DrumLane[]) {
    for (const step of steps) {
      if (
        normalizeDrumVelocity(current.drumVelocities[lane][step] ?? defaultDrumVelocity(lane, step)) !==
        normalizeDrumVelocity(transformed.drumVelocities[lane][step] ?? defaultDrumVelocity(lane, step))
      ) {
        changed += 1;
      }
    }
  }
  return changed;
}

export function drumAverageTimingLabel(pattern: PatternData): string {
  const values = activeDrumValues(pattern, (lane, step) => normalizeDrumTimingMs(pattern.drumTimings[lane][step] ?? 0));
  if (values.length === 0) {
    return "0ms";
  }
  return timingBadge(values.reduce((total, value) => total + value, 0) / values.length);
}

export function drumAverageChanceLabel(pattern: PatternData): string {
  const values = activeDrumValues(pattern, (lane, step) => normalizeDrumProbability(pattern.drumProbabilities[lane][step] ?? 1));
  pattern.bassNotes.forEach((note) => values.push(normalizeEventProbability(note.probability)));
  pattern.melodyNotes.forEach((note) => values.push(normalizeEventProbability(note.probability)));
  pattern.chordEvents.forEach((event) => values.push(normalizeEventProbability(event.probability)));
  if (values.length === 0) {
    return "100%";
  }
  const average = values.reduce((total, value) => total + value, 0) / values.length;
  return formatPercent(average);
}

export function drumAverageVelocityLabel(pattern: PatternData): string {
  const values = activeDrumValues(pattern, (lane, step) => normalizeDrumVelocity(pattern.drumVelocities[lane][step] ?? defaultDrumVelocity(lane, step)));
  if (values.length === 0) {
    return "0%";
  }
  const average = values.reduce((total, value) => total + value, 0) / values.length;
  return formatPercent(average);
}

export function activeDrumValues(pattern: PatternData, getValue: (lane: DrumLane, step: number) => number): number[] {
  const values: number[] = [];
  for (const lane of Object.keys(drumLabels) as DrumLane[]) {
    for (const step of steps) {
      if (pattern.drumPattern[lane][step]) {
        values.push(getValue(lane, step));
      }
    }
  }
  return values;
}

export function noteProbabilityMoveCount(current: Array<BassNote | MelodyNote>, transformed: Array<BassNote | MelodyNote>): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    if (normalizeEventProbability(current[index]?.probability ?? 1) !== normalizeEventProbability(transformed[index]?.probability ?? 1)) {
      changed += 1;
    }
  }
  return changed;
}

export function chordProbabilityMoveCount(current: ChordEvent[], transformed: ChordEvent[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    if (normalizeEventProbability(current[index]?.probability ?? 1) !== normalizeEventProbability(transformed[index]?.probability ?? 1)) {
      changed += 1;
    }
  }
  return changed;
}

export function applyDrumFoundationToPattern(pattern: PatternData, foundation: DrumFoundationDefinition): PatternData {
  const nextPatternData = clonePatternData(pattern);
  const foundationSteps: Record<DrumLane, Set<number>> = {
    kick: new Set(foundation.kick.map(clampStepStart)),
    clap: new Set(foundation.clap.map(clampStepStart)),
    hat: new Set(foundation.hat.map(clampStepStart)),
    perc: new Set(foundation.perc.map(clampStepStart))
  };

  (Object.keys(drumLabels) as DrumLane[]).forEach((lane) => {
    nextPatternData.drumPattern[lane] = steps.map((step) => foundationSteps[lane].has(step));
    nextPatternData.drumVelocities[lane] = steps.map((step) =>
      foundationSteps[lane].has(step)
        ? drumFoundationVelocity(lane, step, foundation.id)
        : normalizeDrumVelocity(pattern.drumVelocities[lane][step] ?? defaultDrumVelocity(lane, step))
    );
    nextPatternData.drumTimings[lane] = steps.map((step) => (foundationSteps[lane].has(step) ? drumFoundationTimingMs(lane, step, foundation.id) : 0));
    nextPatternData.drumProbabilities[lane] = steps.map((step) =>
      foundationSteps[lane].has(step)
        ? drumFoundationProbability(lane, step, foundation.id)
        : normalizeDrumProbability(pattern.drumProbabilities[lane][step] ?? 1)
    );
  });

  nextPatternData.hatRepeats = steps.map((step) =>
    foundationSteps.hat.has(step) ? normalizeHatRepeat(foundation.hatRepeats?.[step] ?? drumFoundationHatRepeat(step, foundation.id)) : 1
  );
  return nextPatternData;
}

export function drumFoundationVelocity(lane: DrumLane, step: number, foundationId: DrumFoundationId): number {
  if (foundationId === "club") {
    const base = lane === "kick" ? 0.98 : lane === "clap" ? 0.88 : lane === "hat" ? 0.66 : 0.58;
    return normalizeDrumVelocity(base + (step % 8 === 0 ? 0.02 : 0));
  }
  if (foundationId === "half") {
    const base = lane === "kick" ? 0.92 : lane === "clap" ? 0.9 : lane === "hat" ? 0.48 : 0.52;
    return normalizeDrumVelocity(base + (step === 0 || step === 12 ? 0.05 : 0));
  }
  if (foundationId === "bounce") {
    const base = lane === "kick" ? 0.94 : lane === "clap" ? 0.86 : lane === "hat" ? 0.54 : 0.56;
    const lift = step % 4 === 0 ? 0.1 : step % 2 === 0 ? 0.04 : -0.02;
    return normalizeDrumVelocity(base + lift);
  }
  return normalizeDrumVelocity(defaultDrumVelocity(lane, step));
}

export function drumFoundationTimingMs(lane: DrumLane, step: number, foundationId: DrumFoundationId): number {
  if (foundationId === "bounce") {
    const timing = lane === "clap" ? 8 : lane === "hat" ? (step % 2 === 0 ? 3 : 8) : lane === "perc" ? 10 : step % 8 === 0 ? 0 : -4;
    return normalizeDrumTimingMs(timing);
  }
  if (foundationId === "half") {
    const timing = lane === "clap" ? 12 : lane === "hat" ? (step % 2 === 0 ? 6 : 12) : lane === "perc" ? 14 : 0;
    return normalizeDrumTimingMs(timing);
  }
  if (foundationId === "club") {
    const timing = lane === "kick" ? 0 : lane === "hat" ? -5 : lane === "perc" ? -3 : 2;
    return normalizeDrumTimingMs(timing);
  }
  return normalizeDrumTimingMs(0);
}

export function drumFoundationProbability(lane: DrumLane, step: number, foundationId: DrumFoundationId): number {
  if (lane === "kick" || lane === "clap") {
    return normalizeDrumProbability(1);
  }
  if (foundationId === "half") {
    return normalizeDrumProbability(lane === "hat" && step % 2 !== 0 ? 0.88 : 0.96);
  }
  if (foundationId === "bounce") {
    return normalizeDrumProbability(lane === "perc" ? 0.9 : step % 4 === 0 ? 0.98 : 0.94);
  }
  return normalizeDrumProbability(foundationId === "club" ? 0.96 : 1);
}

export function drumFoundationHatRepeat(step: number, foundationId: DrumFoundationId): number {
  if (foundationId === "club") {
    return step === 14 ? 3 : 1;
  }
  if (foundationId === "bounce") {
    return step % 8 === 5 ? 2 : 1;
  }
  return 1;
}

export function sameDrumFoundationState(first: PatternData, second: PatternData): boolean {
  const lanes = Object.keys(drumLabels) as DrumLane[];
  return (
    lanes.every((lane) =>
      steps.every(
        (step) =>
          first.drumPattern[lane][step] === second.drumPattern[lane][step] &&
          normalizeDrumVelocity(first.drumVelocities[lane][step] ?? defaultDrumVelocity(lane, step)) ===
            normalizeDrumVelocity(second.drumVelocities[lane][step] ?? defaultDrumVelocity(lane, step)) &&
          normalizeDrumTimingMs(first.drumTimings[lane][step] ?? 0) === normalizeDrumTimingMs(second.drumTimings[lane][step] ?? 0) &&
          normalizeDrumProbability(first.drumProbabilities[lane][step] ?? 1) ===
            normalizeDrumProbability(second.drumProbabilities[lane][step] ?? 1)
      )
    ) && steps.every((step) => normalizeHatRepeat(first.hatRepeats[step] ?? 1) === normalizeHatRepeat(second.hatRepeats[step] ?? 1))
  );
}

export function firstActiveDrumStep(pattern: PatternData): SelectedDrumStep | null {
  for (const lane of Object.keys(drumLabels) as DrumLane[]) {
    const step = pattern.drumPattern[lane].findIndex(Boolean);
    if (step >= 0) {
      return { lane, step };
    }
  }
  return null;
}

export function createBasslinePadOptions(key: string): BasslinePadOption[] {
  return basslinePadDefinitions.map((pad) => {
    const notes = createBasslinePadNotes(key, pad);
    return {
      ...pad,
      preview: notes[0]?.pitch ?? "-",
      eventCount: notes.length,
      glideCount: notes.filter((note) => note.glide).length
    };
  });
}

export function createBasslinePadNotes(key: string, pad: BasslinePadDefinition): BassNote[] {
  const pitches = bassPitchLanes(key);
  return sortBassNotes(
    pad.steps.map((padStep) => {
      const step = clampStepStart(padStep.step);
      return {
        step,
        pitch: pitches[positiveIndex(padStep.degree, pitches.length)] ?? pitches[0] ?? "C1",
        length: Math.min(clampStepLength(padStep.length), 16 - step),
        velocity: clampVelocity(padStep.velocity ?? basslinePadStepVelocity(padStep)),
        glide: padStep.glide,
        probability: normalizeEventProbability(padStep.probability ?? 1)
      };
    })
  );
}

function basslinePadStepVelocity(step: BasslinePadStep): number {
  if (step.glide) {
    return 0.92;
  }
  return step.step % 8 === 0 ? 0.88 : 0.78;
}

export function createBassGlidePadOptions(notes: BassNote[]): BassGlidePadOption[] {
  return bassGlidePadDefinitions.map((pad) => {
    const transformed = applyBassGlidePadToNotes(notes, pad.id);
    const glideCount = transformed.filter((note) => note.glide).length;
    const averageLength =
      transformed.length === 0
        ? 0
        : transformed.reduce((total, note) => total + note.length, 0) / transformed.length;
    return {
      ...pad,
      preview: transformed.length === 0 ? "add 808" : `${averageLength.toFixed(1)} step`,
      glideCount
    };
  });
}

export function applyBassGlidePadToNotes(notes: BassNote[], padId: BassGlidePadId): BassNote[] {
  const noteCount = notes.length;
  return sortBassNotes(
    notes.map((note, index) => ({
      ...note,
      length: bassGlidePadLength(note, index, noteCount, padId),
      glide: bassGlidePadEnabled(index, noteCount, padId),
      probability: bassGlidePadProbability(index, noteCount, padId)
    }))
  );
}

export function bassGlidePadLength(note: BassNote, index: number, noteCount: number, padId: BassGlidePadId): number {
  const maxLength = Math.max(1, 16 - note.step);
  let targetLength: number;
  if (padId === "clean") {
    targetLength = index % 2 === 0 ? Math.min(note.length, 2) : 1;
  } else if (padId === "bounce") {
    targetLength = index % 4 === 3 ? 3 : index % 2 === 0 ? 2 : 1;
  } else if (padId === "slide") {
    targetLength = index === 0 ? 2 : index % 3 === 0 ? 3 : 2;
  } else {
    targetLength = noteCount <= 2 ? 6 : index % 2 === 0 ? 4 : 3;
  }
  return Math.min(clampStepLength(targetLength), maxLength);
}

export function bassGlidePadEnabled(index: number, noteCount: number, padId: BassGlidePadId): boolean {
  if (padId === "bounce") {
    return noteCount > 1 && index % 3 === 1;
  }
  if (padId === "slide") {
    return noteCount > 1 && index > 0;
  }
  return false;
}

export function bassGlidePadProbability(index: number, noteCount: number, padId: BassGlidePadId): number {
  if (padId === "bounce") {
    return normalizeEventProbability(index % 2 === 0 ? 1 : 0.93);
  }
  if (padId === "slide") {
    return normalizeEventProbability(index === 0 ? 1 : 0.96);
  }
  if (padId === "hold") {
    return normalizeEventProbability(index === noteCount - 1 ? 0.96 : 1);
  }
  return normalizeEventProbability(1);
}

export function createBassContourOptions(key: string, notes: BassNote[]): BassContourOption[] {
  return bassContourDefinitions.map((contour) => {
    const transformed = applyBassContourToNotes(key, notes, contour.id);
    return {
      ...contour,
      preview: transformed.length === 0 ? "add 808" : `${transformed[0]?.pitch ?? "-"}>${transformed[transformed.length - 1]?.pitch ?? "-"}`,
      pitchSpan: bassPitchSpanLabel(transformed)
    };
  });
}

export function createBassMovePreviewSummary(
  key: string,
  notes: BassNote[],
  basslines: BasslinePadOption[],
  glides: BassGlidePadOption[],
  contours: BassContourOption[]
): BassMovePreviewSummary {
  const bassline = basslines.find((option) => basslinePadMoveCount(key, notes, option) > 0) ?? basslines[0];
  const glide = glides.find((option) => bassGlideMoveCount(notes, option) > 0) ?? glides[0];
  const contour = contours.find((option) => bassContourMoveCount(key, notes, option) > 0) ?? contours[0];
  const basslineMoveCount = bassline ? basslineMoveCountForOption(key, notes, bassline) : 0;
  const glideMoveCount = notes.length === 0 ? 0 : glide ? bassGlideMoveCount(notes, glide) : 0;
  const contourMoveCount = notes.length === 0 ? 0 : contour ? bassContourMoveCount(key, notes, contour) : 0;
  const totalMoveCount = basslineMoveCount + glideMoveCount + contourMoveCount;
  const phraseLabel = notes.length === 0 ? "No 808 line" : `${notes.length} notes / ${bassPitchSpanLabel(notes)}`;
  const basslineLabel = bassline ? `${bassline.label}: ${bassline.preview}` : "Bassline ready";
  const glideLabel = notes.length === 0 ? "Glide waits" : glide ? `${glide.label}: ${glide.preview}` : "Glide ready";
  const contourLabel = notes.length === 0 ? "Contour waits" : contour ? `${contour.label}: ${contour.preview}` : "Contour ready";
  const statusLabel = notes.length === 0 ? "Start 808" : totalMoveCount === 0 ? "808 aligned" : "Suggested move";
  const moveLabel = `B ${basslineMoveCount} / G ${glideMoveCount} / C ${contourMoveCount}`;
  return {
    statusLabel,
    phraseLabel,
    basslineLabel,
    glideLabel,
    contourLabel,
    moveLabel,
    detailTitle: `${statusLabel}: ${phraseLabel}; ${basslineLabel}; ${glideLabel}; ${contourLabel}; ${moveLabel}.`,
    tone: notes.length === 0 ? "warn" : totalMoveCount === 0 ? "good" : "warn",
    basslineId: bassline?.id ?? "none",
    glideId: notes.length === 0 ? "none" : glide?.id ?? "none",
    contourId: notes.length === 0 ? "none" : contour?.id ?? "none"
  };
}

export function createBassMoveResult(
  kind: BassMoveResultKind,
  id: string,
  label: string,
  detail: string,
  beforeProject: ProjectState,
  afterProject: ProjectState
): BassMoveResult {
  const beforeNotes = activePattern(beforeProject).bassNotes;
  const afterNotes = activePattern(afterProject).bassNotes;
  const noteMoves = Math.abs(beforeNotes.length - afterNotes.length);
  const rhythmMoves = bassRhythmMoveCount(beforeNotes, afterNotes);
  const glideMoves = bassGlideMoveCountForResult(beforeNotes, afterNotes);
  const chanceMoves = bassChanceMoveCountForResult(beforeNotes, afterNotes);
  const rangeMoves = bassRangeMoveCount(beforeNotes, afterNotes);
  const metrics: BassMoveResultMetric[] = [
    createBassMoveResultMetric("notes", "Notes", bassNoteCountLabel(beforeNotes), bassNoteCountLabel(afterNotes), noteMoves),
    createBassMoveResultMetric("rhythm", "Rhythm", bassRhythmLabel(beforeNotes), bassRhythmLabel(afterNotes), rhythmMoves),
    createBassMoveResultMetric("glide", "Glide", bassGlideLabel(beforeNotes), bassGlideLabel(afterNotes), glideMoves),
    createBassMoveResultMetric("chance", "Chance", bassChanceLabel(beforeNotes), bassChanceLabel(afterNotes), chanceMoves),
    createBassMoveResultMetric("range", "Range", bassRangeLabel(beforeNotes), bassRangeLabel(afterNotes), rangeMoves)
  ];
  const changedGroups = [noteMoves, rhythmMoves, glideMoves, chanceMoves, rangeMoves].filter((count) => count > 0).length;

  return {
    moveId: `${kind.toLowerCase()}-${id}`,
    title: `${label} ${kind} applied`,
    status: "Applied",
    detail: `Pattern ${afterProject.selectedPattern} / ${detail}`,
    scope: `Pattern ${afterProject.selectedPattern} 808`,
    impact: `N ${noteMoves} / R ${rhythmMoves} / G ${glideMoves} / C ${chanceMoves} / P ${rangeMoves}`,
    metrics,
    auditionCue: `Loop Pattern ${afterProject.selectedPattern}; check kick-to-808 lock, slides, and low-end contour.`,
    nextCheck: "Use selected-note degree/role and 808 edit tools for manual corrections.",
    tone: changedGroups > 0 ? "good" : "warn"
  };
}

export function createBassMoveResultMetric(
  id: BassMoveResultMetric["id"],
  label: string,
  before: string,
  after: string,
  changedEvents: number
): BassMoveResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: changedEvents === 0 ? "warn" : "good"
  };
}

export function basslinePadMoveCount(key: string, notes: BassNote[], bassline: BasslinePadOption): number {
  return basslineMoveCountForOption(key, notes, bassline);
}

export function basslineMoveCountForOption(key: string, notes: BassNote[], bassline: BasslinePadDefinition): number {
  return bassNotesChangedCount(notes, createBasslinePadNotes(key, bassline));
}

export function bassGlideMoveCount(notes: BassNote[], glide: BassGlidePadDefinition): number {
  return bassNotesChangedCount(notes, applyBassGlidePadToNotes(notes, glide.id));
}

export function bassContourMoveCount(key: string, notes: BassNote[], contour: BassContourDefinition): number {
  return bassNotesChangedCount(notes, applyBassContourToNotes(key, notes, contour.id));
}

export function bassNotesChangedCount(current: BassNote[], transformed: BassNote[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentNote = current[index];
    const transformedNote = transformed[index];
    if (!currentNote || !transformedNote || !sameBassNote(currentNote, transformedNote)) {
      changed += 1;
    }
  }
  return changed;
}

export function bassRhythmMoveCount(current: BassNote[], transformed: BassNote[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentNote = current[index];
    const transformedNote = transformed[index];
    if (!currentNote || !transformedNote || currentNote.step !== transformedNote.step || currentNote.length !== transformedNote.length) {
      changed += 1;
    }
  }
  return changed;
}

export function bassGlideMoveCountForResult(current: BassNote[], transformed: BassNote[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentNote = current[index];
    const transformedNote = transformed[index];
    if (!currentNote || !transformedNote || currentNote.glide !== transformedNote.glide || currentNote.length !== transformedNote.length) {
      changed += 1;
    }
  }
  return changed;
}

export function bassChanceMoveCountForResult(current: BassNote[], transformed: BassNote[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentNote = current[index];
    const transformedNote = transformed[index];
    if (
      !currentNote ||
      !transformedNote ||
      normalizeEventProbability(currentNote.probability) !== normalizeEventProbability(transformedNote.probability)
    ) {
      changed += 1;
    }
  }
  return changed;
}

export function bassRangeMoveCount(current: BassNote[], transformed: BassNote[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentNote = current[index];
    const transformedNote = transformed[index];
    if (!currentNote || !transformedNote || currentNote.pitch !== transformedNote.pitch) {
      changed += 1;
    }
  }
  return changed;
}

export function bassNoteCountLabel(notes: BassNote[]): string {
  return `${notes.length} notes`;
}

export function bassRhythmLabel(notes: BassNote[]): string {
  if (notes.length === 0) {
    return "No 808";
  }
  const labels = sortBassNotes(notes).map((note) => `${note.step + 1}:${note.length}`);
  return labels.length > 4 ? `${labels.slice(0, 4).join("/")} +${labels.length - 4}` : labels.join("/");
}

export function bassGlideLabel(notes: BassNote[]): string {
  if (notes.length === 0) {
    return "0 glide";
  }
  const glideCount = notes.filter((note) => note.glide).length;
  const averageLength = notes.reduce((total, note) => total + note.length, 0) / notes.length;
  return `${glideCount} glide / ${averageLength.toFixed(1)} len`;
}

export function bassChanceLabel(notes: BassNote[]): string {
  if (notes.length === 0) {
    return "No 808";
  }
  const average = notes.reduce((total, note) => total + normalizeEventProbability(note.probability), 0) / notes.length;
  return percentLabel(average);
}

export function bassRangeLabel(notes: BassNote[]): string {
  if (notes.length === 0) {
    return "No 808";
  }
  const ordered = [...notes].sort((first, second) => pitchMidi(first.pitch) - pitchMidi(second.pitch));
  const low = ordered[0]?.pitch ?? "-";
  const high = ordered[ordered.length - 1]?.pitch ?? "-";
  return low === high ? low : `${low}-${high}`;
}

export function sameBassNote(first: BassNote, second: BassNote): boolean {
  return (
    first.step === second.step &&
    first.pitch === second.pitch &&
    first.length === second.length &&
    clampVelocity(first.velocity) === clampVelocity(second.velocity) &&
    first.glide === second.glide &&
    normalizeEventProbability(first.probability ?? 1) === normalizeEventProbability(second.probability ?? 1)
  );
}

export function applyBassContourToNotes(key: string, notes: BassNote[], contourId: BassContourId): BassNote[] {
  const pitches = bassPitchLanes(key);
  if (notes.length === 0 || pitches.length === 0) {
    return notes;
  }

  const orderedNotes = sortBassNotes(notes);
  return sortBassNotes(
    orderedNotes.map((note, index) => ({
      ...note,
      pitch: pitches[bassContourPitchIndex(index, orderedNotes.length, pitches, contourId)] ?? note.pitch
    }))
  );
}

export function bassContourPitchIndex(
  index: number,
  noteCount: number,
  pitches: string[],
  contourId: BassContourId
): number {
  const fifth = Math.min(pitches.length - 1, 4);
  if (contourId === "root") {
    return index % 4 === 3 ? fifth : 0;
  }
  if (contourId === "rise") {
    return Math.min(pitches.length - 1, Math.max(0, index));
  }
  if (contourId === "drop") {
    return Math.max(0, fifth - index);
  }
  const half = Math.max(1, Math.ceil(noteCount / 2));
  return index < half ? Math.min(pitches.length - 1, index * 2) : Math.max(0, fifth - (index - half) * 2);
}

export function bassPitchSpanLabel(notes: BassNote[]): string {
  if (notes.length === 0) {
    return "0 notes";
  }
  const uniquePitches = new Set(notes.map((note) => note.pitch));
  return `${uniquePitches.size} pitches`;
}

export function sameBassNotes(first: BassNote[], second: BassNote[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((note, index) => {
    const candidate = second[index];
    return (
      candidate !== undefined &&
      note.step === candidate.step &&
      note.pitch === candidate.pitch &&
      note.length === candidate.length &&
      note.glide === candidate.glide &&
      normalizeEventProbability(note.probability) === normalizeEventProbability(candidate.probability)
    );
  });
}

export function sameChordEvents(first: ChordEvent[], second: ChordEvent[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((event, index) => {
    const candidate = second[index];
    return (
      candidate !== undefined &&
      event.step === candidate.step &&
      event.root === candidate.root &&
      event.quality === candidate.quality &&
      normalizeChordInversion(event.inversion) === normalizeChordInversion(candidate.inversion) &&
      event.length === candidate.length &&
      event.velocity === candidate.velocity &&
      normalizeEventProbability(event.probability) === normalizeEventProbability(candidate.probability)
    );
  });
}

export function createMelodyMotifOptions(key: string): MelodyMotifOption[] {
  return melodyMotifDefinitions.map((motif) => {
    const notes = createMelodyMotifNotes(key, motif);
    return {
      ...motif,
      preview: notes[0]?.pitch ?? "-",
      eventCount: notes.length
    };
  });
}

export function createMelodyMotifNotes(key: string, motif: MelodyMotifDefinition): MelodyNote[] {
  const pitches = melodyPitchLanes(key);
  return sortMelodyNotes(
    motif.steps.map((motifStep) => {
      const step = clampStepStart(motifStep.step);
      return {
        step,
        pitch: pitches[positiveIndex(motifStep.degree, pitches.length)] ?? pitches[0] ?? "C4",
        length: Math.min(clampStepLength(motifStep.length), 16 - step),
        velocity: clampVelocity(motifStep.velocity),
        probability: 1
      };
    })
  );
}

export function createMelodyAccentOptions(notes: MelodyNote[]): MelodyAccentOption[] {
  return melodyAccentDefinitions.map((accent) => {
    const transformed = applyMelodyAccentToNotes(notes, accent.id);
    const averageVelocity =
      transformed.length === 0
        ? 0
        : transformed.reduce((total, note) => total + note.velocity, 0) / transformed.length;
    return {
      ...accent,
      preview: transformed.length === 0 ? "add synth" : `${Math.round(averageVelocity * 100)}% vel`,
      changedCount: melodyNotesChangedCount(notes, transformed),
      chanceCount: transformed.filter((note) => normalizeEventProbability(note.probability) < 1).length
    };
  });
}

export function createMelodyContourOptions(key: string, notes: MelodyNote[]): MelodyContourOption[] {
  return melodyContourDefinitions.map((contour) => {
    const transformed = applyMelodyContourToNotes(key, notes, contour.id);
    return {
      ...contour,
      preview: transformed.length === 0 ? "add synth" : `${transformed[0]?.pitch ?? "-"}>${transformed[transformed.length - 1]?.pitch ?? "-"}`,
      changedCount: melodyNotesChangedCount(notes, transformed),
      pitchSpan: melodyPitchSpanLabel(transformed)
    };
  });
}

export function createMelodyMovePreviewSummary(
  key: string,
  notes: MelodyNote[],
  motifs: MelodyMotifOption[],
  accents: MelodyAccentOption[],
  contours: MelodyContourOption[]
): MelodyMovePreviewSummary {
  const motif =
    motifs.find((option) => melodyMotifMoveCount(key, notes, option) > 0) ?? motifs[0];
  const accent = accents.find((option) => option.changedCount > 0) ?? accents[0];
  const contour = contours.find((option) => option.changedCount > 0) ?? contours[0];
  const motifMoveCount = motif ? melodyMotifMoveCount(key, notes, motif) : 0;
  const accentMoveCount = notes.length === 0 ? 0 : accent?.changedCount ?? 0;
  const contourMoveCount = notes.length === 0 ? 0 : contour?.changedCount ?? 0;
  const totalMoveCount = motifMoveCount + accentMoveCount + contourMoveCount;
  const phraseLabel = notes.length === 0 ? "No synth phrase" : `${notes.length} notes / ${melodyPitchSpanLabel(notes)}`;
  const motifLabel = motif ? `${motif.label}: ${motif.preview}` : "Motif ready";
  const accentLabel = notes.length === 0 ? "Accent waits" : accent ? `${accent.label}: ${accent.preview}` : "Accent ready";
  const contourLabel = notes.length === 0 ? "Contour waits" : contour ? `${contour.label}: ${contour.preview}` : "Contour ready";
  const statusLabel = notes.length === 0 ? "Start phrase" : totalMoveCount === 0 ? "Melody aligned" : "Suggested move";
  const moveLabel = `M ${motifMoveCount} / A ${accentMoveCount} / C ${contourMoveCount}`;
  return {
    statusLabel,
    phraseLabel,
    motifLabel,
    accentLabel,
    contourLabel,
    moveLabel,
    detailTitle: `${statusLabel}: ${phraseLabel}; ${motifLabel}; ${accentLabel}; ${contourLabel}; ${moveLabel}.`,
    tone: notes.length === 0 ? "warn" : totalMoveCount === 0 ? "good" : "warn",
    motifId: motif?.id ?? "none",
    accentId: notes.length === 0 ? "none" : accent?.id ?? "none",
    contourId: notes.length === 0 ? "none" : contour?.id ?? "none"
  };
}

export function melodyMotifMoveCount(key: string, notes: MelodyNote[], motif: MelodyMotifOption): number {
  return melodyNotesChangedCount(notes, createMelodyMotifNotes(key, motif));
}

export function createMelodyMoveResult(
  kind: MelodyMoveResultKind,
  id: string,
  label: string,
  detail: string,
  beforeProject: ProjectState,
  afterProject: ProjectState
): MelodyMoveResult {
  const beforeNotes = activePattern(beforeProject).melodyNotes;
  const afterNotes = activePattern(afterProject).melodyNotes;
  const noteMoves = Math.abs(beforeNotes.length - afterNotes.length);
  const rhythmMoves = melodyRhythmMoveCount(beforeNotes, afterNotes);
  const rangeMoves = melodyRangeMoveCount(beforeNotes, afterNotes);
  const velocityMoves = melodyVelocityMoveCount(beforeNotes, afterNotes);
  const chanceMoves = melodyChanceMoveCount(beforeNotes, afterNotes);
  const metrics: MelodyMoveResultMetric[] = [
    createMelodyMoveResultMetric("notes", "Notes", melodyNoteCountLabel(beforeNotes), melodyNoteCountLabel(afterNotes), noteMoves),
    createMelodyMoveResultMetric("rhythm", "Rhythm", melodyRhythmLabel(beforeNotes), melodyRhythmLabel(afterNotes), rhythmMoves),
    createMelodyMoveResultMetric("range", "Range", melodyRangeLabel(beforeNotes), melodyRangeLabel(afterNotes), rangeMoves),
    createMelodyMoveResultMetric("velocity", "Velocity", melodyVelocityLabel(beforeNotes), melodyVelocityLabel(afterNotes), velocityMoves),
    createMelodyMoveResultMetric("chance", "Chance", melodyChanceLabel(beforeNotes), melodyChanceLabel(afterNotes), chanceMoves)
  ];
  const changedGroups = [noteMoves, rhythmMoves, rangeMoves, velocityMoves, chanceMoves].filter((count) => count > 0).length;

  return {
    moveId: `${kind.toLowerCase()}-${id}`,
    title: `${label} ${kind} applied`,
    status: "Applied",
    detail: `Pattern ${afterProject.selectedPattern} / ${detail}`,
    scope: `Pattern ${afterProject.selectedPattern} Synth`,
    impact: `N ${noteMoves} / R ${rhythmMoves} / P ${rangeMoves} / V ${velocityMoves} / C ${chanceMoves}`,
    metrics,
    auditionCue: `Loop Pattern ${afterProject.selectedPattern}; check synth hook shape against chords and 808.`,
    nextCheck: "Use selected-note degree/role and melody edit tools for manual corrections.",
    tone: changedGroups > 0 ? "good" : "warn"
  };
}

export function createMelodyMoveResultMetric(
  id: MelodyMoveResultMetric["id"],
  label: string,
  before: string,
  after: string,
  changedEvents: number
): MelodyMoveResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: changedEvents === 0 ? "warn" : "good"
  };
}

export function melodyNotesChangedCount(current: MelodyNote[], transformed: MelodyNote[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentNote = current[index];
    const transformedNote = transformed[index];
    if (!currentNote || !transformedNote || !sameMelodyNote(currentNote, transformedNote)) {
      changed += 1;
    }
  }
  return changed;
}

export function melodyRhythmMoveCount(current: MelodyNote[], transformed: MelodyNote[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentNote = current[index];
    const transformedNote = transformed[index];
    if (!currentNote || !transformedNote || currentNote.step !== transformedNote.step || currentNote.length !== transformedNote.length) {
      changed += 1;
    }
  }
  return changed;
}

export function melodyRangeMoveCount(current: MelodyNote[], transformed: MelodyNote[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentNote = current[index];
    const transformedNote = transformed[index];
    if (!currentNote || !transformedNote || currentNote.pitch !== transformedNote.pitch) {
      changed += 1;
    }
  }
  return changed;
}

export function melodyVelocityMoveCount(current: MelodyNote[], transformed: MelodyNote[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentNote = current[index];
    const transformedNote = transformed[index];
    if (!currentNote || !transformedNote || currentNote.velocity !== transformedNote.velocity) {
      changed += 1;
    }
  }
  return changed;
}

export function melodyChanceMoveCount(current: MelodyNote[], transformed: MelodyNote[]): number {
  const count = Math.max(current.length, transformed.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentNote = current[index];
    const transformedNote = transformed[index];
    if (
      !currentNote ||
      !transformedNote ||
      normalizeEventProbability(currentNote.probability) !== normalizeEventProbability(transformedNote.probability)
    ) {
      changed += 1;
    }
  }
  return changed;
}

export function melodyNoteCountLabel(notes: MelodyNote[]): string {
  return `${notes.length} notes`;
}

export function melodyRhythmLabel(notes: MelodyNote[]): string {
  if (notes.length === 0) {
    return "No synth";
  }
  const labels = sortMelodyNotes(notes).map((note) => `${note.step + 1}:${note.length}`);
  return labels.length > 4 ? `${labels.slice(0, 4).join("/")} +${labels.length - 4}` : labels.join("/");
}

export function melodyRangeLabel(notes: MelodyNote[]): string {
  if (notes.length === 0) {
    return "No synth";
  }
  const ordered = [...notes].sort((first, second) => pitchMidi(first.pitch) - pitchMidi(second.pitch));
  const low = ordered[0]?.pitch ?? "-";
  const high = ordered[ordered.length - 1]?.pitch ?? "-";
  return low === high ? low : `${low}-${high}`;
}

export function melodyVelocityLabel(notes: MelodyNote[]): string {
  if (notes.length === 0) {
    return "No synth";
  }
  const average = notes.reduce((total, note) => total + clampVelocity(note.velocity), 0) / notes.length;
  return percentLabel(average);
}

export function melodyChanceLabel(notes: MelodyNote[]): string {
  if (notes.length === 0) {
    return "No synth";
  }
  const average = notes.reduce((total, note) => total + normalizeEventProbability(note.probability), 0) / notes.length;
  return percentLabel(average);
}

export function sameMelodyNote(first: MelodyNote, second: MelodyNote): boolean {
  return (
    first.step === second.step &&
    first.pitch === second.pitch &&
    first.length === second.length &&
    first.velocity === second.velocity &&
    normalizeEventProbability(first.probability) === normalizeEventProbability(second.probability)
  );
}

export function applyMelodyContourToNotes(key: string, notes: MelodyNote[], contourId: MelodyContourId): MelodyNote[] {
  const pitches = melodyPitchLanes(key);
  if (notes.length === 0 || pitches.length === 0) {
    return notes;
  }

  const orderedNotes = sortMelodyNotes(notes);
  const center = Math.floor((pitches.length - 1) / 2);
  return sortMelodyNotes(
    orderedNotes.map((note, index) => {
      const pitchIndex = melodyContourPitchIndex(note, index, orderedNotes.length, pitches, center, contourId);
      const length = melodyContourLength(note, index, contourId);
      return {
        ...note,
        pitch: pitches[pitchIndex] ?? note.pitch,
        length,
        velocity: melodyContourVelocity(index, orderedNotes.length, contourId),
        probability: melodyContourProbability(index, orderedNotes.length, contourId)
      };
    })
  );
}

export function melodyContourPitchIndex(
  note: MelodyNote,
  index: number,
  noteCount: number,
  pitches: string[],
  center: number,
  contourId: MelodyContourId
): number {
  const current = Math.max(0, pitches.indexOf(note.pitch));
  if (contourId === "rise") {
    return Math.min(pitches.length - 1, Math.max(0, center - 2 + index));
  }
  if (contourId === "fall") {
    return Math.min(pitches.length - 1, Math.max(0, center + 2 - index));
  }
  if (contourId === "answer") {
    const half = Math.max(1, Math.ceil(noteCount / 2));
    return index < half
      ? Math.min(pitches.length - 1, center + (index % 3))
      : Math.max(0, center - ((index - half) % 3));
  }
  return Math.min(pitches.length - 1, Math.max(0, current === 0 ? center : Math.round((current + center) / 2)));
}

export function melodyContourLength(note: MelodyNote, index: number, contourId: MelodyContourId): number {
  const maxLength = Math.max(1, 16 - note.step);
  if (contourId === "anchor") {
    return Math.min(maxLength, Math.max(note.length, index % 2 === 0 ? 2 : 1));
  }
  if (contourId === "answer") {
    return Math.min(maxLength, index % 2 === 0 ? 2 : 1);
  }
  return Math.min(maxLength, Math.max(1, note.length));
}

export function melodyContourVelocity(index: number, noteCount: number, contourId: MelodyContourId): number {
  if (contourId === "rise") {
    const progress = noteCount <= 1 ? 1 : index / Math.max(1, noteCount - 1);
    return clampVelocity(0.58 + progress * 0.24);
  }
  if (contourId === "fall") {
    const progress = noteCount <= 1 ? 0 : index / Math.max(1, noteCount - 1);
    return clampVelocity(0.8 - progress * 0.2);
  }
  if (contourId === "answer") {
    return clampVelocity(index % 2 === 0 ? 0.76 : 0.62);
  }
  return clampVelocity(index % 3 === 0 ? 0.78 : 0.64);
}

export function melodyContourProbability(index: number, noteCount: number, contourId: MelodyContourId): number {
  if (contourId === "answer") {
    return normalizeEventProbability(index >= Math.ceil(noteCount / 2) ? 0.94 : 1);
  }
  if (contourId === "anchor") {
    return normalizeEventProbability(index % 4 === 3 ? 0.92 : 1);
  }
  return normalizeEventProbability(1);
}

export function melodyPitchSpanLabel(notes: MelodyNote[]): string {
  if (notes.length === 0) {
    return "0 notes";
  }
  const uniquePitches = new Set(notes.map((note) => note.pitch));
  return `${uniquePitches.size} pitches`;
}

export function applyMelodyAccentToNotes(notes: MelodyNote[], accentId: MelodyAccentId): MelodyNote[] {
  const noteCount = notes.length;
  return sortMelodyNotes(
    notes.map((note, index) => ({
      ...note,
      velocity: melodyAccentVelocity(index, noteCount, accentId),
      probability: melodyAccentProbability(index, noteCount, accentId)
    }))
  );
}

export function melodyAccentVelocity(index: number, noteCount: number, accentId: MelodyAccentId): number {
  if (accentId === "soft") {
    return clampVelocity(index % 2 === 0 ? 0.58 : 0.54);
  }
  if (accentId === "lead") {
    return clampVelocity(index % 4 === 0 ? 0.86 : index % 2 === 0 ? 0.76 : 0.68);
  }
  if (accentId === "pulse") {
    return clampVelocity(index % 2 === 0 ? 0.82 : 0.54);
  }
  if (noteCount <= 1) {
    return clampVelocity(0.72);
  }
  const progress = index / Math.max(1, noteCount - 1);
  return clampVelocity(0.84 - progress * 0.28);
}

export function melodyAccentProbability(index: number, noteCount: number, accentId: MelodyAccentId): number {
  if (accentId === "pulse") {
    return normalizeEventProbability(index % 2 === 0 ? 1 : 0.94);
  }
  if (accentId === "fade") {
    return normalizeEventProbability(index >= Math.max(0, noteCount - 2) ? 0.96 : 1);
  }
  return normalizeEventProbability(1);
}

export function sameMelodyNotes(first: MelodyNote[], second: MelodyNote[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((note, index) => {
    const candidate = second[index];
    return (
      candidate !== undefined &&
      note.step === candidate.step &&
      note.pitch === candidate.pitch &&
      note.length === candidate.length &&
      note.velocity === candidate.velocity &&
      normalizeEventProbability(note.probability) === normalizeEventProbability(candidate.probability)
    );
  });
}

export function mergeChordRoots(scaleRoots: string[], usedRoots: string[]): string[] {
  return Array.from(new Set([...scaleRoots, ...usedRoots]));
}

export function createChordPadOptions(key: string, selectedChord?: ChordEvent): ChordPadOption[] {
  const roots = scalePitchNames(key);
  return chordPadDefinitions.map((pad) => {
    const root = roots[positiveIndex(pad.degree, roots.length)] ?? roots[0] ?? "C";
    const quality = pad.quality ?? chordPadQualityFromDegree(key, pad.degree);
    const selected =
      selectedChord !== undefined &&
      selectedChord.root === root &&
      selectedChord.quality === quality &&
      normalizeChordInversion(selectedChord.inversion) === pad.inversion;
    return {
      ...pad,
      root,
      quality,
      selected
    };
  });
}

export function createChordRhythmOptions(chords: ChordEvent[]): ChordRhythmOption[] {
  return chordRhythmDefinitions.map((rhythm) => {
    const transformed = applyChordRhythmToEvents(chords, rhythm.id);
    const averageLength =
      transformed.length === 0
        ? 0
        : transformed.reduce((total, chord) => total + chord.length, 0) / transformed.length;
    return {
      ...rhythm,
      preview: transformed.length === 0 ? "add chords" : `${Math.round(averageLength)} step`,
      changedCount: chordRhythmChangedCount(chords, transformed),
      chanceCount: transformed.filter((chord) => normalizeEventProbability(chord.probability) < 1).length
    };
  });
}

export function createChordMovePreviewSummary(
  key: string,
  chords: ChordEvent[],
  selectedChord: ChordEvent | undefined,
  pads: ChordPadOption[],
  rhythms: ChordRhythmOption[],
  voicings: ChordVoicingOption[]
): ChordMovePreviewSummary {
  const pad = pads.find((option) => !option.selected) ?? pads[0];
  const rhythm = rhythms.find((option) => option.changedCount > 0) ?? rhythms[0];
  const voicing = voicings.find((option) => !option.selected) ?? voicings[0];

  if (!selectedChord) {
    return {
      statusLabel: "Select chord",
      selectedLabel: chords.length === 0 ? "No chords yet" : `${chords.length} chord events`,
      harmonicLabel: `${key} waits`,
      rhythmLabel: rhythm ? `${rhythm.label}: ${rhythm.preview}` : "Rhythm waits",
      voicingLabel: "Voicing waits",
      moveLabel: "0 moves ready",
      detailTitle: "Select or add a chord event before applying harmonic, rhythm, or voicing moves.",
      tone: "warn",
      padId: "none",
      rhythmId: rhythm?.id ?? "none",
      voicingId: "none"
    };
  }

  const harmonicSummary = selectedChordHarmonicSummary(key, selectedChord);
  const padMoveCount = pad ? chordPadMoveCount(selectedChord, pad) : 0;
  const rhythmMoveCount = rhythm?.changedCount ?? 0;
  const voicingMoveCount = voicing ? chordVoicingMoveCount(selectedChord, voicing) : 0;
  const totalMoveCount = padMoveCount + rhythmMoveCount + voicingMoveCount;
  const selectedLabel = `${selectedChord.root}${selectedChord.quality}.${selectedChord.step + 1}`;
  const harmonicLabel = `${harmonicSummary.romanLabel} / ${harmonicSummary.roleLabel}`;
  const rhythmLabel = rhythm ? `${rhythm.label}: ${rhythm.preview}` : "Rhythm ready";
  const voicingLabel = voicing ? `${voicing.label}: ${voicing.preview}` : "Voicing ready";
  const moveLabel = `P ${padMoveCount} / R ${rhythmMoveCount} / V ${voicingMoveCount}`;
  const statusLabel = totalMoveCount === 0 ? "Chord aligned" : "Suggested move";
  return {
    statusLabel,
    selectedLabel,
    harmonicLabel,
    rhythmLabel,
    voicingLabel,
    moveLabel,
    detailTitle: `${statusLabel}: ${selectedLabel}; ${harmonicLabel}; ${rhythmLabel}; ${voicingLabel}; ${moveLabel}.`,
    tone: totalMoveCount === 0 && harmonicSummary.inKey ? "good" : harmonicSummary.inKey ? "warn" : "danger",
    padId: pad?.id ?? "none",
    rhythmId: rhythm?.id ?? "none",
    voicingId: voicing?.id ?? "none"
  };
}

export function createChordMoveResult(
  kind: ChordMoveResultKind,
  id: string,
  label: string,
  detail: string,
  beforeProject: ProjectState,
  afterProject: ProjectState
): ChordMoveResult {
  const beforeChords = activePattern(beforeProject).chordEvents;
  const afterChords = activePattern(afterProject).chordEvents;
  const countMoves = Math.abs(beforeChords.length - afterChords.length);
  const harmonyMoves = chordHarmonyMoveCount(beforeChords, afterChords);
  const inversionMoves = chordInversionMoveCount(beforeChords, afterChords);
  const rhythmMoves = chordResultRhythmMoveCount(beforeChords, afterChords);
  const velocityMoves = chordVelocityMoveCount(beforeChords, afterChords);
  const chanceMoves = chordChanceMoveCount(beforeChords, afterChords);
  const metrics: ChordMoveResultMetric[] = [
    createChordMoveResultMetric("chords", "Chords", chordCountLabel(beforeChords), chordCountLabel(afterChords), countMoves),
    createChordMoveResultMetric("harmony", "Harmony", chordHarmonyLabel(beforeChords), chordHarmonyLabel(afterChords), harmonyMoves),
    createChordMoveResultMetric("inversion", "Inversion", chordInversionSummaryLabel(beforeChords), chordInversionSummaryLabel(afterChords), inversionMoves),
    createChordMoveResultMetric("rhythm", "Rhythm", chordRhythmSummaryLabel(beforeChords), chordRhythmSummaryLabel(afterChords), rhythmMoves),
    createChordMoveResultMetric("velocity", "Velocity", chordVelocityLabel(beforeChords), chordVelocityLabel(afterChords), velocityMoves),
    createChordMoveResultMetric("chance", "Chance", chordChanceLabel(beforeChords), chordChanceLabel(afterChords), chanceMoves)
  ];
  const changedGroups = [countMoves, harmonyMoves, inversionMoves, rhythmMoves, velocityMoves, chanceMoves].filter((count) => count > 0).length;

  return {
    moveId: `${kind.toLowerCase()}-${id}`,
    title: `${label} Chord ${kind} applied`,
    status: "Applied",
    detail: `Pattern ${afterProject.selectedPattern} / ${detail}`,
    scope: `Pattern ${afterProject.selectedPattern} Chords`,
    impact: `Count ${countMoves} / H ${harmonyMoves} / I ${inversionMoves} / R ${rhythmMoves} / V ${velocityMoves} / Ch ${chanceMoves}`,
    metrics,
    auditionCue: `Loop Pattern ${afterProject.selectedPattern}; check chord color against 808 and Synth.`,
    nextCheck: "Use selected-chord harmonic readout and chord edit tools for manual corrections.",
    tone: changedGroups > 0 ? "good" : "warn"
  };
}

export function createChordMoveResultMetric(
  id: ChordMoveResultMetric["id"],
  label: string,
  before: string,
  after: string,
  changedEvents: number
): ChordMoveResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: changedEvents === 0 ? "warn" : "good"
  };
}

export function chordPadMoveCount(chord: ChordEvent, pad: ChordPadOption): number {
  return [
    chord.root !== pad.root,
    chord.quality !== pad.quality,
    normalizeChordInversion(chord.inversion) !== pad.inversion
  ].filter(Boolean).length;
}

export function chordVoicingMoveCount(chord: ChordEvent, voicing: ChordVoicingOption): number {
  return [
    chord.quality !== voicing.quality,
    normalizeChordInversion(chord.inversion) !== normalizeChordInversion(voicing.inversion),
    chord.length !== voicing.length,
    chord.velocity !== voicing.velocity,
    normalizeEventProbability(chord.probability) !== normalizeEventProbability(voicing.probability)
  ].filter(Boolean).length;
}

export function chordRhythmChangedCount(current: ChordEvent[], transformed: ChordEvent[]): number {
  return transformed.filter((chord, index) => current[index] === undefined || !sameChordEvent(current[index], chord)).length;
}

export function chordHarmonyMoveCount(current: ChordEvent[], transformed: ChordEvent[]): number {
  const currentChords = sortChordEvents(current);
  const transformedChords = sortChordEvents(transformed);
  const count = Math.max(currentChords.length, transformedChords.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentChord = currentChords[index];
    const transformedChord = transformedChords[index];
    if (!currentChord || !transformedChord || currentChord.root !== transformedChord.root || currentChord.quality !== transformedChord.quality) {
      changed += 1;
    }
  }
  return changed;
}

export function chordInversionMoveCount(current: ChordEvent[], transformed: ChordEvent[]): number {
  const currentChords = sortChordEvents(current);
  const transformedChords = sortChordEvents(transformed);
  const count = Math.max(currentChords.length, transformedChords.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentChord = currentChords[index];
    const transformedChord = transformedChords[index];
    if (
      !currentChord ||
      !transformedChord ||
      normalizeChordInversion(currentChord.inversion) !== normalizeChordInversion(transformedChord.inversion)
    ) {
      changed += 1;
    }
  }
  return changed;
}

export function chordResultRhythmMoveCount(current: ChordEvent[], transformed: ChordEvent[]): number {
  const currentChords = sortChordEvents(current);
  const transformedChords = sortChordEvents(transformed);
  const count = Math.max(currentChords.length, transformedChords.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentChord = currentChords[index];
    const transformedChord = transformedChords[index];
    if (!currentChord || !transformedChord || currentChord.step !== transformedChord.step || currentChord.length !== transformedChord.length) {
      changed += 1;
    }
  }
  return changed;
}

export function chordVelocityMoveCount(current: ChordEvent[], transformed: ChordEvent[]): number {
  const currentChords = sortChordEvents(current);
  const transformedChords = sortChordEvents(transformed);
  const count = Math.max(currentChords.length, transformedChords.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentChord = currentChords[index];
    const transformedChord = transformedChords[index];
    if (!currentChord || !transformedChord || currentChord.velocity !== transformedChord.velocity) {
      changed += 1;
    }
  }
  return changed;
}

export function chordChanceMoveCount(current: ChordEvent[], transformed: ChordEvent[]): number {
  const currentChords = sortChordEvents(current);
  const transformedChords = sortChordEvents(transformed);
  const count = Math.max(currentChords.length, transformedChords.length);
  let changed = 0;
  for (let index = 0; index < count; index += 1) {
    const currentChord = currentChords[index];
    const transformedChord = transformedChords[index];
    if (
      !currentChord ||
      !transformedChord ||
      normalizeEventProbability(currentChord.probability) !== normalizeEventProbability(transformedChord.probability)
    ) {
      changed += 1;
    }
  }
  return changed;
}

export function chordCountLabel(chords: ChordEvent[]): string {
  return `${chords.length} chords`;
}

export function chordHarmonyLabel(chords: ChordEvent[]): string {
  if (chords.length === 0) {
    return "No chords";
  }
  return compactChordResultLabels(sortChordEvents(chords).map((chord) => `${chord.root}${chord.quality}`));
}

export function chordInversionSummaryLabel(chords: ChordEvent[]): string {
  if (chords.length === 0) {
    return "No chords";
  }
  return compactChordResultLabels(sortChordEvents(chords).map((chord) => chordInversionLabel(normalizeChordInversion(chord.inversion))));
}

export function chordRhythmSummaryLabel(chords: ChordEvent[]): string {
  if (chords.length === 0) {
    return "No chords";
  }
  return compactChordResultLabels(sortChordEvents(chords).map((chord) => `${chord.step + 1}:${chord.length}`));
}

export function chordVelocityLabel(chords: ChordEvent[]): string {
  if (chords.length === 0) {
    return "No chords";
  }
  const average = chords.reduce((total, chord) => total + clampVelocity(chord.velocity), 0) / chords.length;
  return percentLabel(average);
}

export function chordChanceLabel(chords: ChordEvent[]): string {
  if (chords.length === 0) {
    return "No chords";
  }
  const average = chords.reduce((total, chord) => total + normalizeEventProbability(chord.probability), 0) / chords.length;
  return percentLabel(average);
}

export function compactChordResultLabels(labels: string[]): string {
  return labels.length > 4 ? `${labels.slice(0, 4).join("/")} +${labels.length - 4}` : labels.join("/");
}

export function createChordVoicingOptions(selectedChord?: ChordEvent): ChordVoicingOption[] {
  return chordVoicingDefinitions.map((definition) => {
    if (!selectedChord) {
      return {
        ...definition,
        quality: definition.quality ?? "maj",
        preview: "Select chord",
        selected: false
      };
    }

    const update = chordVoicingUpdate(selectedChord, definition);
    const nextChord = chordEventWithUpdate(selectedChord, update);
    return {
      ...definition,
      quality: nextChord.quality,
      inversion: nextChord.inversion,
      length: nextChord.length,
      velocity: nextChord.velocity,
      probability: nextChord.probability,
      preview: `${nextChord.quality} ${chordInversionLabel(nextChord.inversion)} / ${nextChord.length} step`,
      selected: sameChordEvent(selectedChord, nextChord)
    };
  });
}

export function chordVoicingUpdate(
  chord: ChordEvent,
  definition: ChordVoicingDefinition
): Pick<ChordEvent, "quality" | "inversion" | "length" | "velocity" | "probability"> {
  return {
    quality: definition.quality ?? chord.quality,
    inversion: definition.inversion,
    length: Math.min(definition.length, Math.max(1, 16 - chord.step)),
    velocity: definition.velocity,
    probability: definition.probability
  };
}

export function applyChordRhythmToEvents(chords: ChordEvent[], rhythmId: ChordRhythmId): ChordEvent[] {
  const chordCount = chords.length;
  return sortChordEvents(
    chords.map((chord, index) => ({
      ...chord,
      length: chordRhythmLength(chord, index, rhythmId),
      velocity: chordRhythmVelocity(index, chordCount, rhythmId),
      probability: chordRhythmProbability(index, chordCount, rhythmId)
    }))
  );
}

export function chordRhythmLength(chord: ChordEvent, index: number, rhythmId: ChordRhythmId): number {
  const maxLength = Math.max(1, 16 - chord.step);
  if (rhythmId === "held") {
    return Math.min(maxLength, Math.max(chord.length, 4));
  }
  if (rhythmId === "pulse") {
    return Math.min(maxLength, index % 2 === 0 ? 3 : 2);
  }
  if (rhythmId === "stab") {
    return Math.min(maxLength, 1);
  }
  return Math.min(maxLength, index % 2 === 0 ? 2 : 1);
}

export function chordRhythmVelocity(index: number, chordCount: number, rhythmId: ChordRhythmId): number {
  if (rhythmId === "held") {
    return clampVelocity(0.58);
  }
  if (rhythmId === "pulse") {
    return clampVelocity(index % 2 === 0 ? 0.68 : 0.5);
  }
  if (rhythmId === "stab") {
    return clampVelocity(index % 4 === 0 ? 0.76 : 0.62);
  }
  if (chordCount <= 1) {
    return clampVelocity(0.42);
  }
  const progress = index / Math.max(1, chordCount - 1);
  return clampVelocity(0.54 - progress * 0.16);
}

export function chordRhythmProbability(index: number, chordCount: number, rhythmId: ChordRhythmId): number {
  if (rhythmId === "pulse") {
    return normalizeEventProbability(index % 2 === 0 ? 1 : 0.94);
  }
  if (rhythmId === "ghost") {
    return normalizeEventProbability(index >= Math.max(0, chordCount - 2) ? 0.9 : 0.96);
  }
  return normalizeEventProbability(1);
}

export function chordPadQualityFromDegree(key: string, degree: number): ChordQuality {
  const [, mode = "minor"] = key.split(" ");
  const majorQualities: ChordQuality[] = ["maj", "min", "min", "maj", "maj", "min", "dim"];
  const dorianQualities: ChordQuality[] = ["min", "min", "maj", "maj", "min", "dim", "maj"];
  const minorQualities: ChordQuality[] = ["min", "dim", "maj", "min", "min", "maj", "maj"];
  const qualities = mode === "major" ? majorQualities : mode === "dorian" ? dorianQualities : minorQualities;
  return qualities[positiveIndex(degree, qualities.length)] ?? "min";
}

export function positiveIndex(value: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  return ((value % length) + length) % length;
}

export function chordEventWithUpdate(event: ChordEvent, update: Partial<ChordEvent>): ChordEvent {
  const step = update.step === undefined ? event.step : clampStepStart(update.step);
  const length = Math.min(update.length === undefined ? event.length : clampStepLength(update.length), 16 - step);
  return {
    ...event,
    ...update,
    step,
    length,
    inversion: update.inversion === undefined ? event.inversion : normalizeChordInversion(update.inversion),
    velocity: update.velocity === undefined ? event.velocity : clampVelocity(update.velocity),
    probability: update.probability === undefined ? event.probability : normalizeEventProbability(update.probability)
  };
}

export function sameChordEvent(first: ChordEvent, second: ChordEvent): boolean {
  return (
    first.step === second.step &&
    first.root === second.root &&
    first.quality === second.quality &&
    normalizeChordInversion(first.inversion) === normalizeChordInversion(second.inversion) &&
    first.length === second.length &&
    first.velocity === second.velocity &&
    normalizeEventProbability(first.probability) === normalizeEventProbability(second.probability)
  );
}

export function findChordEventIndex(chords: ChordEvent[], target: ChordEvent): number | null {
  const index = chords.findIndex((chord) => sameChordEvent(chord, target));
  return index < 0 ? null : index;
}

export function nextEmptyChordStep(chords: ChordEvent[], startStep: number): number | null {
  for (let offset = 1; offset < steps.length; offset += 1) {
    const step = (startStep + offset) % steps.length;
    if (!chords.some((chord) => chord.step === step)) {
      return step;
    }
  }
  return null;
}

export function nextEmptyDrumStep(pattern: PatternData, lane: DrumLane, startStep: number): number | null {
  for (let offset = 1; offset < steps.length; offset += 1) {
    const step = (startStep + offset) % steps.length;
    if (!pattern.drumPattern[lane][step]) {
      return step;
    }
  }
  return null;
}

export function matchesSelectedNote(note: BassNote | MelodyNote, selectedNote: SelectedNote): boolean {
  return note.step === selectedNote.step && note.pitch === selectedNote.pitch;
}

export function nextEmptyStepForPitch(notes: Array<BassNote | MelodyNote>, pitch: string, startStep: number): number | null {
  for (let offset = 1; offset < steps.length; offset += 1) {
    const step = (startStep + offset) % steps.length;
    if (!notes.some((note) => note.step === step && note.pitch === pitch)) {
      return step;
    }
  }
  return null;
}

export function adjacentTrackPitch(
  track: NoteTrack,
  key: string,
  pitch: string,
  direction: -1 | 1,
  usedPitches: string[]
): string | null {
  const pitches = trackScalePitches(track, key, usedPitches);
  const index = pitches.indexOf(pitch);
  if (index < 0) {
    return null;
  }
  return pitches[index + direction] ?? null;
}

export function octaveShiftPitch(track: NoteTrack, pitch: string, direction: -1 | 1): string | null {
  const parts = pitchParts(pitch);
  if (!parts) {
    return null;
  }
  const [minOctave, maxOctave] = trackOctaveRange(track);
  const octave = parts.octave + direction;
  if (octave < minOctave || octave > maxOctave) {
    return null;
  }
  return `${parts.name}${octave}`;
}

export function trackScalePitches(track: NoteTrack, key: string, usedPitches: string[]): string[] {
  const [minOctave, maxOctave] = trackOctaveRange(track);
  const pitches: string[] = [];
  for (let octave = minOctave; octave <= maxOctave; octave += 1) {
    pitches.push(...scalePitches(key, octave).slice(0, -1));
  }
  return Array.from(new Set([...pitches, ...usedPitches])).sort((first, second) => pitchMidi(first) - pitchMidi(second));
}

export function trackOctaveRange(track: NoteTrack): [number, number] {
  return track === "bass" ? [0, 3] : [3, 6];
}

export function pitchParts(pitch: string): { name: string; octave: number } | null {
  const match = /^([A-G](?:#|b)?)(-?\d+)$/.exec(pitch);
  if (!match) {
    return null;
  }
  return { name: match[1], octave: Number(match[2]) };
}

export function pitchMidi(pitch: string): number {
  const parts = pitchParts(pitch);
  if (!parts) {
    return 0;
  }
  const semitones: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11
  };
  return (parts.octave + 1) * 12 + (semitones[parts.name] ?? 0);
}

export function patternEventCount(pattern: PatternData): string {
  return `${patternEventTotal(pattern)} events`;
}

export function patternChainReadout(arrangement: ArrangementBlock[]): string {
  return arrangement.map((block) => block.pattern).join("-");
}

export function nextPatternSlot(pattern: PatternSlot): PatternSlot {
  const index = patternSlots.indexOf(pattern);
  return patternSlots[(index + 1) % patternSlots.length] ?? "A";
}

export function barCountLabel(bars: number): string {
  return `${bars} ${bars === 1 ? "bar" : "bars"}`;
}

export function panLabel(pan: number): string {
  if (pan === 0) {
    return "C";
  }
  return pan < 0 ? `L ${Math.abs(pan)}` : `R ${pan}`;
}

export function percentLabel(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function signedPercentLabel(value: number): string {
  const percent = Math.round(value * 100);
  return `${percent >= 0 ? "+" : ""}${percent}%`;
}

export function chanceBadgeLabel(value: number): string {
  return percentLabel(normalizeEventProbability(value));
}

export function compactChanceBadgeLabel(value: number): string {
  return `${Math.round(normalizeEventProbability(value) * 100)}`;
}

export function timingLabel(value: number): string {
  const timing = normalizeDrumTimingMs(value);
  if (timing === 0) {
    return "On grid";
  }
  return timing > 0 ? `Late +${timing} ms` : `Early ${timing} ms`;
}

export function timingBadge(value: number): string {
  const timing = normalizeDrumTimingMs(value);
  return timing > 0 ? `+${timing}` : `${timing}`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "0.00%";
  }
  return `${value.toFixed(2)}%`;
}

export function formatDb(value: number): string {
  if (!Number.isFinite(value)) {
    return "-inf dB";
  }
  return `${value.toFixed(1)} dB`;
}

export function exportDynamicsDb(analysis: ExportAnalysis): number {
  return audioExportDynamicsDb(analysis);
}

export function createHandoffSheet(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): string {
  return createAudioHandoffSheet(project, analysis, stemAnalyses);
}

export function handoffValue(value: string): string {
  return audioHandoffValue(value);
}

export function handoffSheetFileName(project: ProjectState): string {
  return audioHandoffSheetFileName(project);
}

export function meterPercent(valueDb: number, ceilingDb: number): number {
  if (!Number.isFinite(valueDb)) {
    return 0;
  }
  const floorDb = -48;
  const clamped = Math.min(ceilingDb, Math.max(floorDb, valueDb));
  return Math.round(((clamped - floorDb) / (ceilingDb - floorDb)) * 100);
}

export function clampMasterCeilingDb(value: number): number {
  if (!Number.isFinite(value)) {
    return -1;
  }
  return Math.min(0, Math.max(-6, Math.round(value * 10) / 10));
}

export function clampProjectBpm(value: number): number {
  if (!Number.isFinite(value)) {
    return starterProject.bpm;
  }
  return Math.min(maxProjectBpm, Math.max(minProjectBpm, Math.round(value)));
}

export function tempoNudgePadBpm(currentBpm: number, padId: TempoNudgePadId): number {
  switch (padId) {
    case "down":
      return clampProjectBpm(currentBpm - 1);
    case "up":
      return clampProjectBpm(currentBpm + 1);
    case "half":
      return clampProjectBpm(currentBpm / 2);
    case "double":
      return clampProjectBpm(currentBpm * 2);
  }
}

export function tempoNudgePadTestId(padId: TempoNudgePadId): string {
  switch (padId) {
    case "down":
      return "tempo-nudge-down";
    case "up":
      return "tempo-nudge-up";
    case "half":
      return "tempo-nudge-half";
    case "double":
      return "tempo-nudge-double";
  }
}

export function calculateTapTempoBpm(tapTimes: number[]): number | null {
  if (tapTimes.length < 2) {
    return null;
  }

  const intervals = tapTimes.slice(1).map((tapTime, index) => tapTime - tapTimes[index]);
  const averageInterval = intervals.reduce((total, interval) => total + interval, 0) / intervals.length;
  if (!Number.isFinite(averageInterval) || averageInterval <= 0) {
    return null;
  }

  return clampProjectBpm(60_000 / averageInterval);
}

export function clampSplitAfterBars(value: number, blockBars: number): number {
  const bars = normalizeArrangementBars(blockBars);
  const maxSplit = Math.max(1, bars - 1);
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(maxSplit, Math.max(1, Math.round(value)));
}

export function clampUnit(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, value));
}

export function clampPan(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(-100, Math.round(value)));
}

export function clampStepLength(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.min(16, Math.max(1, Math.round(value)));
}

export function clampVelocity(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.5;
  }
  return Math.min(1, Math.max(0, value));
}

export function sortBassNotes(notes: BassNote[]): BassNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
}

export function sortMelodyNotes(notes: MelodyNote[]): MelodyNote[] {
  return [...notes].sort((first, second) => first.step - second.step || first.pitch.localeCompare(second.pitch));
}

export function sortChordEvents(events: ChordEvent[]): ChordEvent[] {
  return [...events].sort((first, second) => first.step - second.step || first.root.localeCompare(second.root));
}

export function clampStepStart(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(15, Math.max(0, Math.round(value)));
}

export function normalizeStepModulo(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const rounded = Math.round(value);
  return ((rounded % steps.length) + steps.length) % steps.length;
}

export function appendHistory<T>(history: T[], entry: T): T[] {
  return [...history, entry].slice(-historyLimit);
}

export function prependFuture<T>(history: T[], entry: T): T[] {
  return [entry, ...history].slice(0, historyLimit);
}

export function readLocalDraftRecovery(): LocalDraftRecovery | null {
  try {
    const rawRecord = window.localStorage.getItem(localDraftStorageKey);
    if (!rawRecord) {
      return null;
    }

    const parsed: unknown = JSON.parse(rawRecord);
    if (!isLocalDraftRecord(parsed) || parsed.contents.length > localDraftMaxCharacters) {
      throw new Error("Invalid local draft record.");
    }

    return {
      savedAt: parsed.savedAt,
      project: parseProjectFile(parsed.contents),
      characterCount: parsed.contents.length
    };
  } catch (error) {
    console.warn("Ignoring local draft recovery data.", error);
    clearLocalDraftStorage();
    return null;
  }
}

export function writeLocalDraft(project: ProjectState): string | null {
  try {
    const contents = serializeProjectFile(project);
    if (contents.length > localDraftMaxCharacters) {
      console.warn("Skipping local draft because project JSON is too large.");
      return null;
    }

    const savedAt = new Date().toISOString();
    const record = JSON.stringify({
      version: localDraftRecordVersion,
      savedAt,
      contents
    });

    if (record.length > localDraftMaxCharacters) {
      console.warn("Skipping local draft because the recovery record is too large.");
      return null;
    }

    window.localStorage.setItem(localDraftStorageKey, record);
    return savedAt;
  } catch (error) {
    console.warn("Local draft recovery is unavailable.", error);
    return null;
  }
}

export function clearLocalDraftStorage(): void {
  try {
    window.localStorage.removeItem(localDraftStorageKey);
  } catch (error) {
    console.warn("Unable to clear local draft recovery data.", error);
  }
}

export function isLocalDraftRecord(value: unknown): value is { version: number; savedAt: string; contents: string } {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    record.version === localDraftRecordVersion &&
    typeof record.savedAt === "string" &&
    typeof record.contents === "string" &&
    record.contents.length > 0
  );
}

export function formatLocalDraftSavedAt(savedAt: string): string {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) {
    return "local draft";
  }
  return `${savedAt.slice(0, 10)} ${savedAt.slice(11, 16)}`;
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select";
}

export function downloadProjectFile(contents: string, fileName: string): void {
  downloadBrowserProjectFile(contents, fileName);
}

export function downloadTextFile(contents: string, fileName: string): void {
  downloadBrowserTextFile(contents, fileName);
}

export function fileDisplayName(filePath?: string): string {
  if (!filePath) {
    return "project file";
  }
  return filePath.split(/[\\/]/).pop() || "project file";
}
