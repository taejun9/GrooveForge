import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CircleHelp,
  CircleStop,
  Copy,
  Disc3,
  Download,
  Drum,
  FileAudio,
  FolderOpen,
  Gauge,
  KeyboardMusic,
  ListChecks,
  Mic2,
  Music2,
  PackageCheck,
  Pin,
  PinOff,
  Play,
  Plus,
  Redo2,
  Save,
  Scissors,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  Undo2,
  Waves,
  X
} from "lucide-react";
import type { ChangeEvent, CSSProperties, ReactElement, ReactNode, Ref } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { exportMidi, midiFileName } from "../audio/midi";
import {
  analyzeExport,
  analyzeStemExports,
  ExportAnalysis,
  exportStems,
  exportWav,
  mixWavFileName,
  StemExportAnalyses,
  stemWavFileNames,
  stemTrackIds,
  stemTrackLabel,
  StemTrackId
} from "../audio/render";
import { PlaybackController, PlaybackMode, PlaybackSnapshot, startRealtimePlayback } from "../audio/scheduler";
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
  AutomationEvent,
  applyDrumGroovePreset,
  applyMasterAutomationPreset,
  chordProgressionPresetIds,
  chordProgressionPresetLabel,
  getStyle,
  MasterAutomationPresetId,
  MasterPreset,
  MelodyNote,
  MixerChannel,
  NoteTrack,
  PatternData,
  PatternFillPreset,
  PatternChainId,
  PatternSlot,
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
  arrangementTotalSteps,
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
  masterAutomationPresetForProject,
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
  MixCoachFocusResult,
  MixCoachFocusSummary,
  MixFixPreset,
  MixFixAction,
  MixFixPreviewSummary,
  MixFixResultMetric,
  MixFixResult,
  MixSnapshotSlotId,
  MixSnapshotQuickActionTarget,
  MixSnapshotComparisonSummary,
  DirectExportQuickActionTarget,
  MixSnapshotSlotMap,
  MixSnapshot,
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
  SpaceFxPreviewSummary,
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
  SoundTimbreCheckSummary,
  SoundSnapshot,
  SoundSnapshotComparisonSummary,
  SoundSnapshotSlotId,
  SoundSnapshotSlotMap,
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
  MasterAutomationPadId,
  MasterAutomationPadDefinition,
  MasterAutomationPadOption,
  MasterAutomationPreviewSummary,
  MasterAutomationResultMetric,
  MasterAutomationResult,
  TransportLoopScope,
  QuickAction,
  QuickActionPinnedResult,
  QuickActionPinnedResultKind,
  QuickActionRecent,
  QuickActionRecentResult,
  QuickActionScopeId,
  QuickActionScopeOption,
  QuickActionScopeResult,
  QuickActionSearchHintResult,
  QuickActionSearchRecoveryResult,
  QuickActionSearchResult,
  QuickActionSpotlightSummary,
  QuickActionResultMetric,
  QuickActionResult,
  BeatReadinessCheck,
  BeatReadinessCheckId,
  BeatReadinessFocusTarget,
  BeatReadinessFocusResult,
  PatternCompareResult,
  PatternCompareDecisionSummary,
  PatternCompareSummary,
  PatternClonePadOption,
  PatternCloneResult,
  PatternEditResult,
  PatternFillPreviewSummary,
  PatternFillResult,
  PatternVariationPreviewSummary,
  PatternVariationResult,
  PatternDnaCardId,
  PatternDnaFocusTarget,
  PatternDnaCard,
  PatternDnaSummary,
  PatternDnaFocusResult,
  LayerStarterId,
  LayerStarterOption,
  LayerStarterResult,
  ListeningPassId,
  ListeningPassTarget,
  ListeningPassItem,
  ListeningPassSummary,
  ListeningPassFocusSummary,
  ListeningPassFocusResult,
  PatternDnaFocusSummary,
  StyleInspectorMetricId,
  StyleInspectorFocusId,
  StyleInspectorFocusTarget,
  StyleInspectorFocusItem,
  StyleInspectorMetric,
  StylePatternDensity,
  StyleGoalCard,
  StyleGoalCardId,
  StyleInspectorSummary,
  StyleInspectorFocusSummary,
  StyleInspectorFocusResult,
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
  SwingFeelPadId,
  SwingFeelPadDefinition,
  SwingFeelResult,
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
  ArrangementFocusPreviewDecisionSummary,
  ArrangementFocusPreviewSummary,
  ArrangementFocusPrioritySummary,
  ArrangementFocusResultMetric,
  ArrangementFocusResultSummary,
  ArrangementMovePreviewDecisionSummary,
  ArrangementMovePrioritySummary,
  ArrangementMoveResultMetric,
  ArrangementMoveResultSummary,
  SelectedBlockEditActionId,
  SelectedBlockEditPreviewDecisionSummary,
  SelectedBlockEditPrioritySummary,
  SelectedBlockEditResultMetric,
  SelectedBlockEditResultSummary,
  ArrangementArcPadId,
  ArrangementArcPoint,
  ArrangementArcPadDefinition,
  ArrangementArcPadOption,
  ArrangementArcPreviewDecisionSummary,
  ArrangementArcPreviewSummary,
  ArrangementArcPrioritySummary,
  ArrangementTemplatePreviewDecisionSummary,
  ArrangementTemplatePreviewSummary,
  ArrangementTemplatePrioritySummary,
  ArrangementTemplateResultMetric,
  ArrangementTemplateResultSummary,
  ArrangementArcResultMetric,
  ArrangementArcResultSummary,
  PatternChainPreviewDecisionSummary,
  PatternChainPreviewSummary,
  PatternChainPrioritySummary,
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
  HookReadinessCardId,
  HookReadinessFocusId,
  HookReadinessFocusItem,
  HookReadinessCard,
  HookReadinessSummary,
  HookReadinessFocusSummary,
  HookReadinessPrioritySummary,
  HookReadinessFocusResult,
  ToplineSpaceFocusId,
  ToplineSpaceCardId,
  ToplineSpaceFocusItem,
  ToplineSpaceCard,
  ToplineSpaceSummary,
  ToplineSpaceFocusSummary,
  ToplineSpacePrioritySummary,
  ToplineSpaceFocusResult,
  SongFormMetricId,
  SongFormMetric,
  SongFormSegment,
  SongFormOverviewSummary,
  SongFormPrioritySummary,
  ArrangementMuteMapFocusId,
  ArrangementMuteMapLane,
  ArrangementMuteMapSegment,
  ArrangementMuteMapSummary,
  ArrangementMuteMapFocusSummary,
  ArrangementMuteMapPrioritySummary,
  ArrangementMuteMapFocusResult,
  ArrangementTransitionMapFocusId,
  ArrangementTransitionMapTransition,
  ArrangementTransitionMapSummary,
  ArrangementTransitionMapFocusSummary,
  ArrangementTransitionMapPrioritySummary,
  ArrangementTransitionMapFocusResult,
  SectionLocatorCueDecisionSummary,
  SectionCueResult,
  SectionLocatorPad,
  SectionLocatorPrioritySummary,
  ArrangementBlockRoleSummary,
  MixerChannelRoleSummary,
  StemAuditionReadoutSummary,
  StemAuditionDecisionSummary,
  MasterOutputRoleSummary,
  ProductionSnapshotMetricId,
  ProductionSnapshotFocusId,
  ProductionSnapshotFocusTarget,
  ProductionSnapshotFocusItem,
  ProductionSnapshotMetric,
  ProductionSnapshotSummary,
  ProductionSnapshotFocusSummary,
  ProductionSnapshotFocusResult,
  KeyCompassCardId,
  KeyCompassFocusId,
  KeyCompassFocusTarget,
  KeyCompassFocusItem,
  KeyCompassCard,
  KeyCompassSummary,
  KeyCompassFocusSummary,
  KeyCompassFocusResult,
  GrooveCompassCardId,
  GrooveCompassFocusId,
  GrooveCompassFocusTarget,
  GrooveCompassFocusItem,
  GrooveCompassCard,
  GrooveCompassSummary,
  GrooveCompassFocusSummary,
  GrooveCompassFocusResult,
  ComposerGuideCardId,
  ComposerGuideCard,
  ComposerGuideFocusSummary,
  ComposerGuideFocusResult,
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
  BeatPassportFocusResult,
  FinishChecklistCardId,
  FinishChecklistCard,
  FinishChecklistFocusSummary,
  FinishChecklistFocusResult,
  FinishChecklistSummary,
  ReviewQueueItem,
  ReviewQueueFocusTarget,
  ReviewQueueFocusResult,
  ReviewQueueFocusSummary,
  ReviewQueueSummary,
  ModeFocusCard,
  ModeFocusJumpResult,
  ModeFocusSummary,
  ModeSwitchResult,
  SessionPassTarget,
  SessionPassCardId,
  SessionPassCard,
  SessionPassFocusResult,
  SessionPassSummary,
  SnapshotCompareFocusId,
  SnapshotCompareFocusTarget,
  SnapshotCompareFocusItem,
  SnapshotCompareFocusResult,
  SnapshotCompareSummary,
  SnapshotSlotRoleSummary,
  EditHistoryReadoutSummary,
  TapTempoReadoutSummary,
  TransportPositionReadoutSummary,
  PatternPlaybackReadoutSummary,
  ArrangementPlaybackReadoutSummary,
  KeyboardCapturePostureSummary,
  LocalDraftRecoveryResult,
  ProjectFileResult,
  ProjectSafetyReadoutSummary,
  HandoffPackItem,
  HandoffPackRouteSummary,
  HandoffPackSendOrderSummary,
  HandoffExportReceipt,
  HandoffFileManifestItem,
  HandoffExportFormatFocusId,
  HandoffExportFormatFocusResult,
  HandoffExportFormatMetric,
  HandoffExportFormatSummary,
  HandoffManifestAuditCheck,
  HandoffManifestAuditSummary,
  HandoffPackageCheckCard,
  HandoffPackageCheckFocusId,
  HandoffPackageCheckFocusResult,
  HandoffPackageCheckFocusSummary,
  HandoffPackageCheckSummary,
  SessionBriefRoleSummary,
  SessionBriefCompassCard,
  SessionBriefCompassCardId,
  SessionBriefCompassFocusResult,
  SessionBriefCompassSummary,
  ReferenceAlignmentCard,
  ReferenceAlignmentCardId,
  ReferenceAlignmentFocusResult,
  ReferenceAlignmentSummary,
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
  ExportPreflightFocusResult,
  WorkflowZoneId,
  WorkflowNavigatorItem,
  WorkflowNavigatorJumpResult,
  FirstBeatPathTarget,
  FirstBeatPathStep,
  FirstBeatPathSummary,
  FirstBeatPathJumpResult,
  BeatSpineCardId,
  BeatSpineTarget,
  BeatSpineActionId,
  BeatSpineAction,
  BeatSpineCard,
  BeatSpineSummary,
  BeatSpineApplyResultMetric,
  BeatSpineApplyResult,
  BeatSpineJumpResult,
  EditorAuditionResult,
  InputCaptureResult,
  SelectedEventDeleteResult,
  UndoRedoResult,
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
  swingFeelPads,
  mixPostureOptions,
  mixBalancePadDefinitions,
  spaceFxPadDefinitions,
  stemAuditionPadDefinitions,
  soundFocusPadDefinitions,
  drumKitPadDefinitions,
  masterFinishPadDefinitions,
  masterAutomationPadDefinitions,
  keys,
  historyLimit,
  keyboardCaptureKeys,
  keyboardCaptureKeyLabels,
  isStemTrackId,
  beatBlueprintPreviewMetricTestIds,
  maxQuickActionPins,
  composerStyleActionProfiles,
  suggestedBlueprintId,
  composerDrumFoundation,
  composerBasslinePad,
  composerChordPreset,
  composerMelodyMotif,
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
  drumFoundationDefinitions,
  beatReadinessPriorityCheck,
  layerStarterPriorityOption
} from "./workstationUiModel";
import type { StudioToneBaseline, StudioToneDriftResetTarget, StudioToneDriftSummary } from "./studioToneTools";
import { studioToneControls } from "./studioToneTools";
import type { SnapshotCompareProjectProfile } from "./workstationSnapshotCompare";
import {
  activeSnapshotCompareQuickActionItem,
  createSnapshotCompareFocusResult,
  createSnapshotCompareFocusSummary,
  createSnapshotCompareSummary,
  snapshotCompareDirectMetricItems
} from "./workstationSnapshotCompare";
import {
  FirstBeatPath,
  GuideQuickStart,
  ModeFocus,
  ModeSwitchResultStrip,
  ReferenceAlignmentReadout,
  SessionPass,
  WorkflowNavigator,
  createGuideQuickStartCompletionBottleneckItem,
  createGuideQuickStartCompletionBottleneckLabel,
  createGuideQuickStartCompletionBreakdownItems,
  createGuideQuickStartCompletionScore,
  createModeSwitchButtonContext,
  createModeSwitchQuickActions,
  createModeSwitchResult,
  createWorkflowSpotlightSummary,
  modeLabel
} from "./workstationGuidancePanels";
import {
  LayerStarterResultStrip,
  PatternCompareResultStrip,
  PatternCloneResultStrip,
  PatternEditResultStrip,
  PatternFillResultStrip,
  PatternVariationResultStrip
} from "./workstationPatternResults";
import {
  ExportMeter,
  MasterAutomationPads,
  MasterFinishPads,
  MixBalancePads,
  MixCoach,
  MixSnapshotAB,
  SpaceFxPads,
  StemAuditionPads,
  StemLevelMeter
} from "./workstationMixPanels";
import {
  BassContourPads,
  BassGlidePads,
  BassMovePreview,
  BassMoveResultStrip,
  BasslinePads,
  ChordEditor,
  Device,
  DrumAccentPads,
  DrumFoundationPads,
  DrumMovePreview,
  DrumMoveResultStrip,
  DrumStepInspector,
  GrooveFeelPads,
  KeyboardCapturePanel,
  MelodyAccentPads,
  MelodyContourPads,
  MelodyMotifPads,
  MelodyMovePreview,
  MelodyMoveResultStrip,
  MidiCapturePanel,
  NoteEditor,
  NoteInspector,
  PatternClonePads,
  PatternCloneSuggestion,
  PatternFillSuggestion,
  PatternFillPreview,
  PatternStackPads,
  PatternStackPreview,
  PatternStackResultStrip,
  PatternVariationSuggestion,
  PatternVariationPreview,
  SoundDesigner,
  SwingFeelResultStrip
} from "./workstationComposePanels";
import {
  BeatReadiness,
  CommandReferenceDialog,
  LayerStarterPads,
  LocalDraftRecoveryBanner,
  PanelTitle,
  PatternCompareDecision,
  PatternCompareStrip,
  ProjectSnapshots,
  QuickActionResultStrip,
  QuickActions,
  SnapshotCompare
} from "./workstationShellPanels";
import {
  auditionSelectedChord as auditionSelectedChordEvent,
  auditionSelectedDrumHit as auditionSelectedDrumHitEvent,
  auditionSelectedNote as auditionSelectedNoteEvent
} from "./editorAudition";
import { createSelectedEventQuickActions } from "./selectedEventQuickActions";
import {
  laneColor,
  mergePitchLanes,
  createKeyboardCaptureKeyMap,
  createKeyboardCapturePostureSummary,
  keyboardCapturePitchForKey,
  keyboardCaptureDegreeLabel,
  keyboardCapturePitchLanes,
  clampKeyboardCaptureOctave,
  isKeyboardCaptureKey,
  shouldReplaceKeyboardCaptureStep,
  resolveKeyboardCaptureStep,
  createCaptureStepModeActions,
  addKeyboardCaptureNote,
  isMidiInputSupported,
  createMidiInputOptions,
  createMidiCaptureSummary,
  midiInputMatchesSelection,
  midiNoteOnFromMessage,
  midiNoteToScalePitch,
  midiNoteLabel,
  createGrooveFeelOptions,
  applyGrooveFeelToPattern,
  grooveFeelTimingMs,
  grooveFeelDrumProbability,
  grooveFeelMusicProbability,
  sameGrooveFeelState,
  sameNoteProbabilities,
  sameChordProbabilities,
  createDrumAccentOptions,
  applyDrumAccentToPattern,
  drumAccentVelocity,
  sameDrumAccentState,
  createPatternStackOptions,
  createPatternStackPreviewSummary,
  createPatternStackResult,
  createPatternStackResultMetric,
  patternStackMoveCount,
  chordEventsChangedCount,
  createLayerStarterResult,
  createPatternClonePadOptions,
  createPatternCloneSuggestionSummary,
  createPatternCloneResult,
  createPatternEditResult,
  createPatternFillPreviewSummary,
  createPatternFillSuggestionSummary,
  createPatternFillResult,
  suggestedPatternFillPreset,
  createPatternVariationPreviewSummary,
  createPatternVariationSuggestionSummary,
  createPatternVariationResult,
  createPatternStackEvents,
  samePatternStackEvents,
  createDrumFoundationOptions,
  createDrumMovePreviewSummary,
  activeDrumHitCount,
  drumPatternHitLabel,
  drumFoundationMoveCount,
  drumFeelMoveCount,
  drumAccentMoveCount,
  createDrumMoveResult,
  createDrumMoveResultMetric,
  drumPatternMoveCount,
  drumHitMoveCount,
  drumTimingMoveCount,
  drumChanceMoveCount,
  drumVelocityMoveCount,
  drumAverageTimingLabel,
  drumAverageChanceLabel,
  drumAverageVelocityLabel,
  activeDrumValues,
  noteProbabilityMoveCount,
  chordProbabilityMoveCount,
  applyDrumFoundationToPattern,
  drumFoundationVelocity,
  drumFoundationTimingMs,
  drumFoundationProbability,
  drumFoundationHatRepeat,
  sameDrumFoundationState,
  firstActiveDrumStep,
  createBasslinePadOptions,
  createBasslinePadNotes,
  createBassGlidePadOptions,
  applyBassGlidePadToNotes,
  bassGlidePadLength,
  bassGlidePadEnabled,
  bassGlidePadProbability,
  createBassContourOptions,
  createBassMovePreviewSummary,
  createBassMoveResult,
  createBassMoveResultMetric,
  basslinePadMoveCount,
  basslineMoveCountForOption,
  bassGlideMoveCount,
  bassContourMoveCount,
  bassNotesChangedCount,
  bassRhythmMoveCount,
  bassGlideMoveCountForResult,
  bassChanceMoveCountForResult,
  bassRangeMoveCount,
  bassNoteCountLabel,
  bassRhythmLabel,
  bassGlideLabel,
  bassChanceLabel,
  bassRangeLabel,
  sameBassNote,
  applyBassContourToNotes,
  bassContourPitchIndex,
  bassPitchSpanLabel,
  sameBassNotes,
  sameChordEvents,
  createMelodyMotifOptions,
  createMelodyMotifNotes,
  createMelodyAccentOptions,
  createMelodyContourOptions,
  createMelodyMovePreviewSummary,
  melodyMotifMoveCount,
  createMelodyMoveResult,
  createMelodyMoveResultMetric,
  melodyNotesChangedCount,
  melodyRhythmMoveCount,
  melodyRangeMoveCount,
  melodyVelocityMoveCount,
  melodyChanceMoveCount,
  melodyNoteCountLabel,
  melodyRhythmLabel,
  melodyRangeLabel,
  melodyVelocityLabel,
  melodyChanceLabel,
  sameMelodyNote,
  applyMelodyContourToNotes,
  melodyContourPitchIndex,
  melodyContourLength,
  melodyContourVelocity,
  melodyContourProbability,
  melodyPitchSpanLabel,
  applyMelodyAccentToNotes,
  melodyAccentVelocity,
  melodyAccentProbability,
  sameMelodyNotes,
  mergeChordRoots,
  createChordPadOptions,
  createChordRhythmOptions,
  createChordMovePreviewSummary,
  createChordMoveResult,
  createChordMoveResultMetric,
  chordPadMoveCount,
  chordVoicingMoveCount,
  chordRhythmChangedCount,
  chordHarmonyMoveCount,
  chordInversionMoveCount,
  chordResultRhythmMoveCount,
  chordVelocityMoveCount,
  chordChanceMoveCount,
  chordCountLabel,
  chordHarmonyLabel,
  chordInversionSummaryLabel,
  chordRhythmSummaryLabel,
  chordVelocityLabel,
  chordChanceLabel,
  compactChordResultLabels,
  createChordVoicingOptions,
  chordVoicingUpdate,
  applyChordRhythmToEvents,
  chordRhythmLength,
  chordRhythmVelocity,
  chordRhythmProbability,
  chordPadQualityFromDegree,
  positiveIndex,
  chordEventWithUpdate,
  sameChordEvent,
  findChordEventIndex,
  nextEmptyChordStep,
  nextEmptyDrumStep,
  matchesSelectedNote,
  nextEmptyStepForPitch,
  adjacentTrackPitch,
  octaveShiftPitch,
  trackScalePitches,
  trackOctaveRange,
  pitchParts,
  pitchMidi,
  patternEventCount,
  patternChainReadout,
  nextPatternSlot,
  barCountLabel,
  panLabel,
  percentLabel,
  signedPercentLabel,
  chanceBadgeLabel,
  compactChanceBadgeLabel,
  timingLabel,
  timingBadge,
  exportDynamicsDb,
  formatPercent,
  formatDb,
  createHandoffSheet,
  handoffValue,
  handoffSheetFileName,
  meterPercent,
  clampMasterCeilingDb,
  clampProjectBpm,
  tempoNudgePadBpm,
  tempoNudgePadTestId,
  calculateTapTempoBpm,
  clampSplitAfterBars,
  clampUnit,
  clampPan,
  clampStepLength,
  clampVelocity,
  sortBassNotes,
  sortMelodyNotes,
  sortChordEvents,
  clampStepStart,
  normalizeStepModulo,
  appendHistory,
  prependFuture,
  readLocalDraftRecovery,
  writeLocalDraft,
  clearLocalDraftStorage,
  isLocalDraftRecord,
  formatLocalDraftSavedAt,
  isEditableShortcutTarget,
  downloadProjectFile,
  downloadTextFile,
  fileDisplayName
} from "./workstationPatternTools";
import {
  activeReferenceAlignmentQuickActionCard,
  activeSessionBriefCompassQuickActionCard,
  audibleStemTracks,
  createMixSnapshotComparison,
  createReferenceAlignmentFocusResult,
  createReferenceAlignmentSummary,
  createSessionBriefCompassSummary,
  createSessionBriefRoleSummary,
  masterChannelVolumeDb,
  stemSpreadDb,
  weakestTone
} from "./workstationAnalysis";


import {
  applyArrangementArcPadToProject, applyDrumKitPadToProject, applyMasterFinishPadToProject, applyMixBalancePadToMixer, applyMixFixToProject, applySoundFocusPadToSound, applySpaceFxPadToMixer, applyStemAuditionPadToMixer,
  arrangedPatternData, arrangementArcChangedCount, arrangementArcChangedFieldCount, arrangementArcPointForIndex, arrangementArcPreview, arrangementArcPreviewEnergyLabel, arrangementArcPreviewMuteLabel, arrangementArcPreviewPatternLabel,
  arrangementArcPreviewSectionLabel, arrangementBlockRoleLabel, arrangementBlocksTotalBars, arrangementFocusChangedFieldCount, arrangementFocusPreviewMuteLabel, arrangementReadinessCheck, arrangementStartBar, arrangementTemplateChangedBlockCount,
  arrangementTemplateChangedFieldCount, arrangementTemplatePreviewSectionLabel, averageUnitVelocity, bassReadinessCheck, bassStyleRoleLabel, beatReadinessFocusResultAudition, beatReadinessFocusResultMetric, beatReadinessFocusResultNextCheck,
  clampMixFixVolume, cloneMixerChannels, cloneSoundDesign, compactMixDb, compactUnitPercent, createArrangementArcPadOptions, createArrangementArcPreviewDecision, createArrangementArcPreviewSummary,
  createArrangementArcPrioritySummary, createArrangementArcResult, createArrangementArcResultMetric, createArrangementFocusPreviewDecision, createArrangementFocusPreviewSummary, createArrangementFocusPrioritySummary, createArrangementFocusResult, createArrangementFocusResultMetric,
  createArrangementFocusSummary, createArrangementTemplatePreviewDecision, createArrangementTemplatePreviewSummary, createArrangementTemplatePrioritySummary, createArrangementTemplateResult, createArrangementTemplateResultMetric, createBeatReadinessChecks, createBeatReadinessFocusResult,
  createDrumKitPadOptions, createDrumKitPreviewSummary, createDrumKitResult, createDrumKitResultMetric, createLayerStarterOption, createLayerStarterOptions, createListeningPassFocusResult, createListeningPassFocusSummary,
  createListeningPassSummary, createMasterAutomationPadOptions, createMasterAutomationPreviewSummary, createMasterAutomationResult, createMasterAutomationResultMetric, createMasterFinishPadOptions, createMasterFinishPreviewSummary, createMasterFinishResult,
  createMasterFinishResultMetric, createMasterOutputRoleSummary, createMixBalancePadOptions, createMixBalancePreviewSummary, createMixBalanceResult, createMixBalanceResultMetric, createMixCoachChecks, createMixCoachFocusResult,
  createMixCoachFocusSummary, createMixFixActions, createMixFixPreviewSummary, createMixFixResult, createMixFixResultMetric, createMixSnapshot, createPatternChainPreviewDecision, createPatternChainPreviewSummary,
  createPatternChainPrioritySummary, createPatternChainResult, createPatternChainResultMetric, createPatternCompareDecisionSummary, createPatternCompareResult, createPatternCompareResultMetric, createPatternCompareSummaries, createPatternDnaFocusResult,
  createPatternDnaFocusSummary, createPatternDnaSummary, createPatternDynamicsCard, createSoundFocusPadOptions, createSoundFocusPreviewSummary, createSoundFocusResult, createSoundFocusResultMetric, createSoundPresetPreviewSummary,
  createSoundPresetResult, createSoundPresetResultMetric, createSoundSnapshot, createSoundSnapshotComparison, createSoundTimbreCheckSummary, createSpaceFxPadOptions, createSpaceFxPreviewSummary, createSpaceFxResult,
  createSpaceFxResultMetric, createStemAuditionDecisionSummary, createStemAuditionPadOptions, createStemAuditionReadoutSummary, createStyleGoalCard, createStyleGoalCards, createStyleInspectorFocusResult, createStyleInspectorFocusSummary,
  createStyleInspectorSummary, createTransportPositionReadoutSummary, defaultSoundPresetPreview, drumHitCount, drumKitClapLabel, drumKitHatLabel, drumKitKickLabel, drumKitMixerChangedControlCount,
  drumKitPadChangedCount, drumKitPadPreview, drumKitPreviewDrumLabel, drumKitPreviewRackLabel, drumKitRackLabel, drumKitSoundParameters, drumPatternVelocityValues, drumReadinessCheck,
  emptySoundSnapshotMetrics, exportDynamicsCheck, exportReadinessCheck, harmonyReadinessCheck, isStemAuditionPadActive, limiterCheck, listeningPassFocusLabel, listeningPassFocusResultAudition,
  listeningPassFocusResultMetric, listeningPassFocusResultNextCheck, lowEndBlendCheck, lowEndDeltaDb, masterAutomationAuditionCue, masterAutomationChangedCount, masterAutomationEventCountLabel, masterAutomationEventSignature,
  masterAutomationPresetLabel, masterAutomationPreview, masterAutomationRangeLabel, masterFinishChangedCount, masterFinishPreview, masterHeadroomCheck, masterOutputRoleLabel, melodyStyleRoleLabel,
  mixBalanceChangedControlCount, mixBalanceChannelPosture, mixBalancePreview, mixBalancePreviewChannelLabel, mixBalancePreviewPostureLabel, mixCoachFocusCheck, mixCoachFocusResultAudition, mixCoachFocusResultMetric,
  mixCoachFocusResultNextCheck, mixCoachSummary, mixerChannelRoleLabel, mixerChannelRoleSummary, mixerTrackVolumeDb, mixFixAuditionCue, mixFixChangedCount, mixFixControlPosture,
  mixFixExportPosture, mixFixHeadroomPosture, mixFixLowEndPosture, mixFixNextCheck, mixFixPresetLabel, mixFixScopeLabel, mixFixStemPosture, mixSnapshotCapturedAtLabel,
  mixSnapshotScore, mixSnapshotStatusLabel, nudgeMixFixVolume, patternChainChangedBlockCount, patternChainChangedFieldCount, patternChainPreviewEnergyLabel, patternChainPreviewSectionLabel, patternChainResultSequenceLabel,
  patternDnaFocusResultAudition, patternDnaFocusResultMetric, patternDnaFocusResultNextCheck, patternVariationSignals, roughStemVolumeTarget, sameArrangementBlockPosture, sameMixerChannel, sameMixerChannels,
  sameSoundDesign, selectedArrangementBlockRoleSummary, soundFocusBassLabel, soundFocusChangedParameterLabel, soundFocusChangedParameters, soundFocusChordLabel, soundFocusDrumLabel, soundFocusDuckLabel,
  soundFocusGroupMoveCount, soundFocusParameterLabel, soundFocusParameters, soundFocusPreview, soundFocusPreviewParameterLabel, soundFocusSynthLabel, soundPresetChangedMoveCount, soundPresetToneLabel,
  soundSnapshotComparisonMetric, soundSnapshotComparisonMetrics, soundSnapshotScore, soundSnapshotSpread, soundTimbreAverage, soundTimbreLeanLabel, soundTimbreMetricTone, soundTimbreNextCheck,
  spaceFxChangedSendCount, spaceFxPreview, spaceFxTrackPosture, stemAuditionDecisionFromPad, stemAuditionPreview, stemBalanceCheck, styleDensityLabel, styleGoalCountLabel,
  styleGoalPriorityLabel, styleInspectorFocusResultAudition, styleInspectorFocusResultDetail, styleInspectorFocusResultMetric, styleInspectorFocusResultNextCheck, styleInspectorFocusResultTitle, styleInspectorFocusResultTone, suggestedArrangementFocusPreset,
  suggestedMasterAutomationPad, transportLoopLabel, transportLoopStatus, usedPatternSlots, velocityLayerLabel
} from "./workstationAppDerivations";
import type {
  SoundTimbreScore
} from "./workstationAppDerivations";

import {
  activeArrangementMuteMapQuickActionLane, activeArrangementTransitionMapQuickActionTransition, activeBassMoveQuickActionTarget, activeBeatPassportQuickActionMetric, activeBeatReadinessQuickActionCheck, activeBeatSpineQuickActionApplyCard, activeBeatSpineQuickActionCard, activeChordMoveQuickActionTarget, activeComposerGuideQuickActionCard, activeDrumMoveQuickActionTarget, activeExportPreflightQuickActionCard, activeFinishChecklistQuickActionCard, activeFirstBeatPathQuickActionStep, activeGrooveCompassQuickActionItem, activeGuideQuickStartBottleneckQuickActionTarget, activeGuideQuickStartQuickActionTarget, activeHandoffPackageCheckQuickActionCard, activeHookReadinessQuickActionCard, activeKeyCompassQuickActionItem, activeLayerStarterQuickActionOption, activeListeningPassQuickActionItem, activeMelodyMoveQuickActionTarget, activeModeFocusQuickActionCard, activePatternDnaQuickActionCard, activeProductionSnapshotQuickActionMetric, activeReviewFixItem, activeSessionPassQuickActionCard, activeStyleInspectorQuickActionItem, activeToplineSpaceQuickActionCard, applySessionBriefStarter, arrangementAverageEnergy, arrangementMuteMapFocusResultAudition, arrangementMuteMapFocusResultMetric, arrangementMuteMapFocusResultNextCheck, arrangementTransitionLoopDetail, arrangementTransitionMapFocusResultAudition, arrangementTransitionMapFocusResultMetric, arrangementTransitionMapFocusResultNextCheck, beatBlueprintStyleLabel, beatPassportFocusResultMetric, beatReadinessCardActionId, beatReadinessQuickActionCheckFromChecks, beatSpineApplyButtonContext, beatSpineJumpButtonContext, chordMotionLabel, compactSectionFlow, compactSessionBriefValue, composerActionForStyleGoal, composerActionQuickActionArea, composerActionQuickActionDetail, composerActionQuickActionGroup, composerGuideFocusCommandDetail, createArrangementMovePreviewDecision, createArrangementMovePrioritySummary, createArrangementMuteMapSummary, createArrangementTransitionLoopTarget, createArrangementTransitionMapSummary, createBeatBlueprintPreviewCue, createBeatBlueprintPreviewDecision, createBeatBlueprintPreviewSummary, createBeatMapActions, createBeatMapSummary, createBeatPassportSummary, createComposerActionsSummary, createDeliveryTargetAlignmentPreview, createExportPreflightSummary, createFinishChecklistSummary, createHandoffExportFormatFocusResult, createHandoffExportFormatSummary, createHandoffFileManifest, createHandoffManifestAudit, createHandoffPackageCheckSummary, createHandoffPackItems, createHandoffPackRouteSummary, createHandoffPackSendOrderSummary, createHookFixOption, createHookLoopCueTarget, createHookReadinessSummary, createProductionSnapshotSummary, createReviewFixOption, createReviewQueueSummary, createSectionLocatorCueDecisionSummary, createSelectedBlockEditPreviewDecision, createSelectedBlockEditPrioritySummary, createSessionBriefStarterBrief, createSongFormOverviewSummary, createSongFormPrioritySummary, createStructureLensActions, createToplineFixOption, createToplineLoopCueTarget, createToplineSpaceSummary, createWorkflowNavigatorItems, deliveryTargetMasterLabel, emptyHandoffExportReceipt, exportPreflightFocusResultMetric, exportPreflightFocusResultNextCheck, finishChecklistFocusResultMetric, firstBeatPathJumpAuditionCue, firstBeatPathJumpNextCheck, formatExportDuration, guideQuickStartCommandDetail, guideQuickStartCompletionBreakdownLabel, handoffExportFormatFocusMetric, handoffPackageCheckFocusResultMetric, handoffPackageCheckFocusResultNextCheck, hookLoopCueDetail, isArrangementMovePresetApplied, isDeliveryTargetAligned, mixPostureLabel, modeFocusCommandDetail, nextMoveResultFollowup, nextMoveResultMetricSnapshot, normalizeSwingFeelValue, patternEventTotal, productionSnapshotFocusResultMetric, projectEventTotal, quickActionArrangementBlockMetricSnapshot, quickActionBeatMapMetricSnapshot, quickActionComposerActionAreaLabel, quickActionComposerActionMetricLabel, quickActionComposerActionMoveLabel, quickActionComposerActionRouteLabel, quickActionSectionLocatorMetricSnapshot, quickActionSelectedBlockMetricSnapshot, quickActionStructureLensMetricSnapshot, reviewFixScopeLabel, reviewQueueFocusResultMetric, sectionLocatorActionSection, sectionLocatorTestId, selectedArrangementMoveQuickActionPreset, sessionBriefChangedFieldCount, sessionBriefCompassDestinationLabel, sessionBriefCompassFocusLabel, sessionBriefFieldLabel, sessionBriefFields, sessionBriefFilledFields, sessionBriefStarterPadDefinitions, sessionBriefStatus, sessionPassCommandDetail, styleGoalActionQuickActionArea, styleGoalCueLabel, styleGoalCueQuickActionGoal, suggestedMasterFinishPad, swingFeelPadDetail, swingFeelPadSwing, toplineLoopCueDetail, workflowCountLabel, workflowNavigatorJumpAuditionCue, workflowNavigatorJumpMetricValue, workflowNavigatorJumpNextCheck
} from "./workstationAppHelpers";
import type {
  ArrangementTransitionLoopTarget, BeatBlueprintPreviewCue, BeatBlueprintPreviewDecision, HookLoopCueTarget, ToplineLoopCueTarget
} from "./workstationAppHelpers";

export function createQuickActions({
  arrangementArcPadOptions,
  arrangementArcPreviewSummary,
  arrangementMuteMapSummary,
  arrangementPlaybackReadout,
  arrangementTransitionMapSummary,
  arrangementTransitionLoopTarget,
  arrangementTemplatePreviewSummary,
  bassMovePreviewSummary,
  beatMapActions,
  beatReadinessChecks,
  beatPassportSummary,
  beatSpineSummary,
  chordMovePreviewSummary,
  canRedo,
  canUndo,
  nextRedoLabel,
  nextUndoLabel,
  composerGuideSummary,
  composerActionsSummary,
  drumKitPreviewSummary,
  drumMovePreviewSummary,
  editorAuditionReadout,
  firstBeatPathSummary,
  finishChecklistSummary,
  grooveCompassSummary,
  handoffExportReceipt,
  handoffPackageCheckSummary,
  hookLoopCueTarget,
  hookReadinessSummary,
  isPlaying,
  keyCompassSummary,
  keyboardCaptureEnabled,
  keyboardCaptureDefaults,
  keyboardCaptureStepMode,
  keyboardCaptureTarget,
  layerStarterOptions,
  listeningPassSummary,
  localDraftRecovery,
  melodyMovePreviewSummary,
  midiCaptureArmed,
  midiCaptureStatus,
  midiCaptureSummary,
  midiInputOptions,
  midiLastNoteLabel,
  midiSelectedInputId,
  midiSelectedInputLabel,
  mixBalancePadOptions,
  mixBalancePreviewSummary,
  mixSnapshotComparison,
  mixSnapshots,
  masterFinishPadOptions,
  masterFinishPreviewSummary,
  masterAutomationPadOptions,
  masterAutomationPreviewSummary,
  modeFocusSummary,
  patternCloneOptions,
  patternCompareDecisionSummary,
  patternChainPreviewSummary,
  patternStackOptions,
  patternStackPreviewSummary,
  patternDnaSummary,
  patternPlaybackReadout,
  playingPattern,
  playingArrangementIndex,
  playbackMode,
  project,
  projectSafetyReadout,
  productionSnapshotSummary,
  referenceAlignmentSummary,
  snapshotCompareSummary,
  exportAnalysis,
  exportPreflightSummary,
  reviewQueueSummary,
  selectedNote,
  noteClipboard,
  selectedArrangementIndex,
  arrangementBlockClipboard,
  splitAfterBars,
  selectedDrumStep,
  drumClipboard,
  selectedChord,
  chordClipboard,
  sectionLocatorPads,
  sessionBriefStarterPads,
  sessionBriefCompassSummary,
  sessionPassSummary,
  songFormOverviewSummary,
  soundFocusPreviewSummary,
  soundPresetPreviewSummary,
  soundSnapshotComparison,
  soundSnapshots,
  soundTimbreCheckSummary,
  studioToneBaseline,
  studioToneDrift,
  spaceFxPadOptions,
  spaceFxPreviewSummary,
  stemAnalyses,
  stemAuditionDecision,
  stemAuditionPadOptions,
  stemAuditionReadout,
  structureLensActions,
  styleInspectorSummary,
  tapTempoReadout,
  beatBlueprintPreviewId,
  transportLoopScope,
  transportPositionReadout,
  toplineLoopCueTarget,
  toplineSpaceSummary,
  workflowNavigatorItems,
  onApplyArrangementMove,
  onApplyArrangementArc,
  onApplyArrangementFocus,
  onApplyArrangementTemplate,
  onFocusArrangementArcReadout,
  onFocusArrangementFocusReadout,
  onFocusArrangementMoveReadout,
  onFocusArrangementTemplateReadout,
  onFocusSongFormOverviewReadout,
  onCueArrangementTransition,
  onCueHookLoop,
  onCueToplineLoop,
  onApplyHookFix,
  onApplyToplineFix,
  onFocusArrangementMuteMapReadout,
  onFocusArrangementMuteMap,
  onFocusSelectedArrangementBlockReadout,
  onFocusArrangementPlaybackReadout,
  onFocusAudibleArrangementFollowReadout,
  onFocusArrangementTransitionMapReadout,
  onFocusArrangementTransitionMap,
  onApplyBasslinePad,
  onApplyBassGlidePad,
  onApplyBassContour,
  onApplyBeatSpine,
  onApplyBlueprint,
  onApplyChordPad,
  onApplyChordRhythm,
  onApplyChordVoicing,
  onAlignDeliveryTarget,
  onSelectDeliveryTarget,
  onApplyDrumAccent,
  onApplyDrumFoundation,
  onApplyDrumKit,
  onFocusDrumKitReadout,
  onApplyGrooveFeel,
  onApplyLayerStarter,
  onApplyMasterAutomation,
  onFocusMasterAutomationReadout,
  onApplyMasterFinish,
  onFocusMasterFinishReadout,
  onApplyMelodyMotif,
  onApplyMelodyAccent,
  onApplyMelodyContour,
  onApplyMixBalance,
  onApplyMixFix,
  onFocusMixBalanceReadout,
  onCaptureMixSnapshot,
  onRecallMixSnapshot,
  onClearMixSnapshots,
  onFocusMixSnapshotReadout,
  onFocusSpaceFxReadout,
  onFocusPatternChainReadout,
  onFocusChainExpandReadout,
  onApplyPatternChain,
  onApplyPatternClone,
  onApplyPatternFill,
  onApplyPatternVariation,
  onApplyPatternStack,
  onCopySelectedPattern,
  onClearSelectedPattern,
  onApplySpaceFx,
  onApplyStemAudition,
  onFocusStemAuditionReadout,
  onApplySoundFocus,
  onFocusSoundFocusReadout,
  onApplySoundPreset,
  onFocusSoundPresetReadout,
  onCaptureSoundSnapshot,
  onRecallSoundSnapshot,
  onClearSoundSnapshots,
  onFocusSoundSnapshotReadout,
  onCaptureStudioToneBaseline,
  onResetLargestStudioToneDrift,
  onResetStudioToneControl,
  onFocusTimbreCheck,
  onExpandPatternChain,
  onApplyProjectKey,
  onApplyTempoNudge,
  onApplySwingFeel,
  onToggleMetronome,
  onTapTempo,
  onFocusTapTempoReadout,
  onFocusTempoNudgeReadout,
  onFocusSwingFeelReadout,
  onFocusKeyRetargetReadout,
  onFocusKeyboardCaptureReadout,
  onFocusCaptureStepModeReadout,
  onFocusEditorAuditionReadout,
  onFocusMidiInputReadout,
  onFocusStyleDirectionReadout,
  onPreviewBlueprint,
  onCueBlueprintPreview,
  onRequestMidiInputAccess,
  onCueArrangementBlock,
  onCueSectionLocator,
  onFocusSectionLocatorReadout,
  onCueGrooveCompass,
  onCueStyleGoal,
  onCuePattern,
  onRunPatternCompareDecision,
  onFollowAudiblePattern,
  onFollowAudibleArrangementBlock,
  onSelectArrangementBlock,
  onSelectPattern,
  onSelectStyle,
  onSwitchMode,
  onUsePatternInSelectedBlock,
  onSetKeyboardCaptureEnabled,
  onSetKeyboardCaptureStepMode,
  onSetKeyboardCaptureTarget,
  onUpdateKeyboardCaptureDefaults,
  onSetMidiCaptureArmed,
  onApplySessionBriefStarter,
  onFocusSessionBriefCompass,
  onRunSelectedBlockEditPriority,
  onCopySelectedArrangementBlock,
  onPasteArrangementBlockAfterSelected,
  onDuplicateArrangementBlock,
  onMoveArrangementBlock,
  onSplitArrangementBlock,
  onMergeArrangementBlock,
  onDeleteArrangementBlock,
  onMoveSelectedNoteStep,
  onResetSelectedNoteStep,
  onMoveSelectedNotePitch,
  onResetSelectedNotePitch,
  onMoveSelectedNoteOctave,
  onUpdateSelectedNoteLength,
  onUpdateSelectedNoteGlide,
  onUpdateSelectedNoteVelocity,
  onUpdateSelectedNoteProbability,
  onAuditionSelectedNote,
  onCopySelectedNote,
  onPasteCopiedNote,
  onDuplicateSelectedNote,
  onDuplicateSelectedNoteToStep,
  onDeleteSelectedNote,
  onMoveSelectedDrumStep,
  onResetSelectedDrumStep,
  onUpdateSelectedDrumVelocity,
  onUpdateSelectedDrumProbability,
  onUpdateSelectedDrumTiming,
  onUpdateSelectedHatRepeat,
  onAuditionSelectedDrumHit,
  onCopySelectedDrumHit,
  onPasteCopiedDrumHit,
  onDuplicateSelectedDrumHit,
  onDuplicateSelectedDrumHitToStep,
  onDeleteSelectedDrumHit,
  onMoveSelectedChordStep,
  onUpdateSelectedChordStep,
  onAuditionSelectedChord,
  onCopySelectedChord,
  onPasteCopiedChord,
  onDuplicateSelectedChord,
  onDuplicateSelectedChordToStep,
  onDeleteSelectedChord,
  onMoveSelectedChordInversion,
  onResetSelectedChordInversion,
  onUpdateSelectedChordRoot,
  onUpdateSelectedChordQuality,
  onUpdateSelectedChordLength,
  onUpdateSelectedChordVelocity,
  onUpdateSelectedChordProbability,
  onExportHandoffSheet,
  onExportMidi,
  onExportStems,
  onExportWav,
  onJumpFirstBeatPath,
  onJumpBeatSpine,
  onFocusBeatPassport,
  onFocusBeatReadiness,
  onFocusComposerGuide,
  onRunComposerAction,
  onRunNextMove,
  onFocusExportPreflight,
  onFocusFinishChecklist,
  onFocusGrooveCompass,
  onFocusHandoffExportFormat,
  onFocusHandoffPack,
  onFocusHandoffManifestAudit,
  onFocusHandoffPackageCheck,
  onFocusHookReadiness,
  onFocusKeyCompass,
  onFocusListeningPass,
  onFocusLoopScope,
  onFocusMetronomeReadout,
  onFocusTransportPositionReadout,
  onFocusMixCoach,
  onFocusExportMeter,
  onFocusMasterOutputRole,
  onFocusModeFocus,
  onFocusPatternDna,
  onFocusPatternPlaybackReadout,
  onFocusPatternUseReadout,
  onFocusProductionSnapshot,
  onFocusReferenceAlignment,
  onFocusSnapshotCompare,
  onFocusReviewQueue,
  onApplyReviewFix,
  onFocusSessionPass,
  onFocusStyleInspector,
  onFocusToplineSpace,
  onFocusWorkflowSpotlight,
  onJumpWorkflowZone,
  onOpenCommandReference,
  onOpenProject,
  onCheckProjectSafety,
  onRedo,
  onRestoreLocalDraft,
  onSaveProject,
  onSaveSnapshot,
  onClearLocalDraftRecovery,
  onSelectTransportLoopScope,
  onTogglePlayback,
  onUndo
}: {
  arrangementArcPadOptions: ArrangementArcPadOption[];
  arrangementArcPreviewSummary: ArrangementArcPreviewSummary;
  arrangementMuteMapSummary: ArrangementMuteMapSummary;
  arrangementPlaybackReadout: ArrangementPlaybackReadoutSummary;
  arrangementTransitionMapSummary: ArrangementTransitionMapSummary;
  arrangementTransitionLoopTarget: ArrangementTransitionLoopTarget | null;
  arrangementTemplatePreviewSummary: ArrangementTemplatePreviewSummary;
  bassMovePreviewSummary: BassMovePreviewSummary;
  beatMapActions: NextMoveAction[];
  beatReadinessChecks: BeatReadinessCheck[];
  beatPassportSummary: BeatPassportSummary;
  beatSpineSummary: BeatSpineSummary;
  chordMovePreviewSummary: ChordMovePreviewSummary;
  canRedo: boolean;
  canUndo: boolean;
  nextRedoLabel: string | null;
  nextUndoLabel: string | null;
  composerGuideSummary: ComposerGuideSummary;
  composerActionsSummary: ComposerActionsSummary;
  drumKitPreviewSummary: DrumKitPreviewSummary;
  drumMovePreviewSummary: DrumMovePreviewSummary;
  editorAuditionReadout: EditorAuditionReadoutSummary;
  firstBeatPathSummary: FirstBeatPathSummary;
  finishChecklistSummary: FinishChecklistSummary;
  grooveCompassSummary: GrooveCompassSummary;
  handoffExportReceipt: HandoffExportReceipt | null;
  handoffPackageCheckSummary: HandoffPackageCheckSummary;
  hookLoopCueTarget: HookLoopCueTarget | null;
  hookReadinessSummary: HookReadinessSummary;
  isPlaying: boolean;
  keyCompassSummary: KeyCompassSummary;
  keyboardCaptureEnabled: boolean;
  keyboardCaptureDefaults: Record<NoteTrack, KeyboardCaptureDefaults>;
  keyboardCaptureStepMode: KeyboardCaptureStepMode;
  keyboardCaptureTarget: NoteTrack;
  layerStarterOptions: LayerStarterOption[];
  listeningPassSummary: ListeningPassSummary;
  localDraftRecovery: LocalDraftRecovery | null;
  melodyMovePreviewSummary: MelodyMovePreviewSummary;
  midiCaptureArmed: boolean;
  midiCaptureStatus: MidiCaptureStatus;
  midiCaptureSummary: MidiCaptureSummary;
  midiInputOptions: MidiInputOption[];
  midiLastNoteLabel: string;
  midiSelectedInputId: string;
  midiSelectedInputLabel: string;
  mixBalancePadOptions: MixBalancePadOption[];
  mixBalancePreviewSummary: MixBalancePreviewSummary;
  mixSnapshotComparison: MixSnapshotComparisonSummary;
  mixSnapshots: MixSnapshotSlotMap;
  masterFinishPadOptions: MasterFinishPadOption[];
  masterFinishPreviewSummary: MasterFinishPreviewSummary;
  masterAutomationPadOptions: MasterAutomationPadOption[];
  masterAutomationPreviewSummary: MasterAutomationPreviewSummary;
  modeFocusSummary: ModeFocusSummary;
  patternCloneOptions: PatternClonePadOption[];
  patternCompareDecisionSummary: PatternCompareDecisionSummary;
  patternChainPreviewSummary: PatternChainPreviewSummary;
  patternStackOptions: PatternStackOption[];
  patternStackPreviewSummary: PatternStackPreviewSummary;
  patternDnaSummary: PatternDnaSummary;
  patternPlaybackReadout: PatternPlaybackReadoutSummary;
  playingPattern: PatternSlot | null;
  playingArrangementIndex: number | null;
  playbackMode: PlaybackMode;
  project: ProjectState;
  projectSafetyReadout: ProjectSafetyReadoutSummary;
  productionSnapshotSummary: ProductionSnapshotSummary;
  referenceAlignmentSummary: ReferenceAlignmentSummary;
  snapshotCompareSummary: SnapshotCompareSummary;
  exportAnalysis: ExportAnalysis;
  exportPreflightSummary: ExportPreflightSummary;
  reviewQueueSummary: ReviewQueueSummary;
  selectedNote: SelectedNote | null;
  noteClipboard: NoteClipboard | null;
  selectedArrangementIndex: number;
  arrangementBlockClipboard: ArrangementBlockClipboard | null;
  splitAfterBars: number;
  selectedDrumStep: SelectedDrumStep | null;
  drumClipboard: DrumClipboard | null;
  selectedChord: ChordEvent | undefined;
  chordClipboard: ChordClipboard | null;
  sectionLocatorPads: SectionLocatorPad[];
  sessionBriefStarterPads: SessionBriefStarterPadOption[];
  sessionBriefCompassSummary: SessionBriefCompassSummary;
  sessionPassSummary: SessionPassSummary;
  songFormOverviewSummary: SongFormOverviewSummary;
  soundFocusPreviewSummary: SoundFocusPreviewSummary;
  soundPresetPreviewSummary: SoundPresetPreviewSummary;
  soundSnapshotComparison: SoundSnapshotComparisonSummary;
  soundSnapshots: SoundSnapshotSlotMap;
  soundTimbreCheckSummary: SoundTimbreCheckSummary;
  studioToneBaseline: StudioToneBaseline;
  studioToneDrift: StudioToneDriftSummary;
  spaceFxPadOptions: SpaceFxPadOption[];
  spaceFxPreviewSummary: SpaceFxPreviewSummary;
  stemAnalyses: StemExportAnalyses;
  stemAuditionDecision: StemAuditionDecisionSummary;
  stemAuditionPadOptions: StemAuditionPadOption[];
  stemAuditionReadout: StemAuditionReadoutSummary;
  structureLensActions: NextMoveAction[];
  styleInspectorSummary: StyleInspectorSummary;
  tapTempoReadout: TapTempoReadoutSummary;
  beatBlueprintPreviewId: BeatBlueprintId;
  transportLoopScope: TransportLoopScope;
  transportPositionReadout: TransportPositionReadoutSummary;
  toplineLoopCueTarget: ToplineLoopCueTarget;
  toplineSpaceSummary: ToplineSpaceSummary;
  workflowNavigatorItems: WorkflowNavigatorItem[];
  onApplyArrangementMove: (preset: ArrangementMovePreset) => void;
  onApplyArrangementArc: (pad: ArrangementArcPadId) => void;
  onApplyArrangementFocus: (preset: ArrangementFocusPresetId) => void;
  onApplyArrangementTemplate: (template: ArrangementTemplateId) => void;
  onFocusArrangementArcReadout: () => void;
  onFocusArrangementFocusReadout: () => void;
  onFocusArrangementMoveReadout: () => void;
  onFocusArrangementTemplateReadout: () => void;
  onFocusSongFormOverviewReadout: () => void;
  onCueArrangementTransition: (transition: ArrangementTransitionMapTransition) => void;
  onCueHookLoop: (card?: HookReadinessFocusItem) => void;
  onCueToplineLoop: (card?: ToplineSpaceFocusItem) => void;
  onApplyHookFix: (card?: HookReadinessCard) => void;
  onApplyToplineFix: (card?: ToplineSpaceCard) => void;
  onFocusArrangementMuteMapReadout: () => void;
  onFocusArrangementMuteMap: (lane: ArrangementMuteMapLane) => void;
  onFocusSelectedArrangementBlockReadout: () => void;
  onFocusArrangementPlaybackReadout: () => void;
  onFocusAudibleArrangementFollowReadout: () => void;
  onFocusArrangementTransitionMapReadout: () => void;
  onFocusArrangementTransitionMap: (transition: ArrangementTransitionMapTransition) => void;
  onApplyBasslinePad: (pad: BasslinePadId) => void;
  onApplyBassGlidePad: (pad: BassGlidePadId) => void;
  onApplyBassContour: (contour: BassContourId) => void;
  onApplyBeatSpine: (action: BeatSpineAction) => void;
  onApplyBlueprint: (blueprintId: BeatBlueprintId) => void;
  onApplyChordPad: (pad: ChordPadId) => void;
  onApplyChordRhythm: (rhythm: ChordRhythmId) => void;
  onApplyChordVoicing: (voicing: ChordVoicingId) => void;
  onAlignDeliveryTarget: (target: DeliveryTargetId) => void;
  onSelectDeliveryTarget: (target: DeliveryTargetId) => void;
  onApplyDrumAccent: (accent: DrumAccentId) => void;
  onApplyDrumFoundation: (foundation: DrumFoundationId) => void;
  onApplyDrumKit: (pad: DrumKitPadId) => void;
  onFocusDrumKitReadout: () => void;
  onApplyGrooveFeel: (feel: GrooveFeelId) => void;
  onApplyLayerStarter: (starterId: LayerStarterId) => void;
  onApplyMasterAutomation: (pad: MasterAutomationPadId) => void;
  onFocusMasterAutomationReadout: () => void;
  onApplyMasterFinish: (pad: MasterFinishPadId) => void;
  onFocusMasterFinishReadout: () => void;
  onApplyMelodyMotif: (motif: MelodyMotifId) => void;
  onApplyMelodyAccent: (accent: MelodyAccentId) => void;
  onApplyMelodyContour: (contour: MelodyContourId) => void;
  onApplyMixBalance: (pad: MixBalancePadId) => void;
  onApplyMixFix: (preset: MixFixPreset) => void;
  onFocusMixBalanceReadout: () => void;
  onCaptureMixSnapshot: (slot: MixSnapshotSlotId) => void;
  onRecallMixSnapshot: (slot: MixSnapshotSlotId) => void;
  onClearMixSnapshots: () => void;
  onFocusMixSnapshotReadout: () => void;
  onFocusSpaceFxReadout: () => void;
  onFocusPatternChainReadout: () => void;
  onFocusChainExpandReadout: () => void;
  onApplyPatternChain: (chain: PatternChainId) => void;
  onApplyPatternClone: (target: PatternSlot, preset: PatternVariationPreset) => void;
  onApplyPatternFill: (preset: PatternFillPreset) => void;
  onApplyPatternVariation: (preset: PatternVariationPreset) => void;
  onApplyPatternStack: (stack: PatternStackId) => void;
  onCopySelectedPattern: (target: PatternSlot) => void;
  onClearSelectedPattern: () => void;
  onApplySpaceFx: (pad: SpaceFxPadId) => void;
  onApplyStemAudition: (pad: StemAuditionPadId) => void;
  onFocusStemAuditionReadout: () => void;
  onApplySoundFocus: (pad: SoundFocusPadId) => void;
  onFocusSoundFocusReadout: () => void;
  onApplySoundPreset: (preset: SoundPresetTarget) => void;
  onFocusSoundPresetReadout: () => void;
  onCaptureSoundSnapshot: (slot: SoundSnapshotSlotId) => void;
  onRecallSoundSnapshot: (slot: SoundSnapshotSlotId) => void;
  onClearSoundSnapshots: () => void;
  onFocusSoundSnapshotReadout: () => void;
  onCaptureStudioToneBaseline: () => void;
  onResetLargestStudioToneDrift: () => void;
  onResetStudioToneControl: (target: StudioToneDriftResetTarget) => void;
  onFocusTimbreCheck: () => void;
  onExpandPatternChain: () => void;
  onApplyProjectKey: (key: string) => void;
  onApplyTempoNudge: (pad: TempoNudgePadDefinition) => void;
  onApplySwingFeel: (pad: SwingFeelPadId) => void;
  onToggleMetronome: () => void;
  onTapTempo: () => void;
  onFocusTapTempoReadout: () => void;
  onFocusTempoNudgeReadout: () => void;
  onFocusSwingFeelReadout: () => void;
  onFocusKeyRetargetReadout: () => void;
  onFocusKeyboardCaptureReadout: () => void;
  onFocusCaptureStepModeReadout: () => void;
  onFocusEditorAuditionReadout: () => void;
  onFocusMidiInputReadout: () => void;
  onFocusStyleDirectionReadout: () => void;
  onPreviewBlueprint: (blueprintId: BeatBlueprintId) => void;
  onCueBlueprintPreview: (scope: Extract<TransportLoopScope, "arrangement" | "pattern">) => void;
  onRequestMidiInputAccess: () => Promise<void>;
  onCueArrangementBlock: (index: number) => void;
  onCueSectionLocator: (section: ArrangementSection) => void;
  onFocusSectionLocatorReadout: () => void;
  onCueGrooveCompass: () => void;
  onCueStyleGoal: (goal: StyleGoalCard) => void;
  onCuePattern: (pattern: PatternSlot) => void;
  onRunPatternCompareDecision: (action: PatternCompareDecisionSummary["action"], pattern: PatternSlot) => void;
  onFollowAudiblePattern: () => void;
  onFollowAudibleArrangementBlock: () => void;
  onSelectArrangementBlock: (index: number) => void;
  onSelectPattern: (pattern: PatternSlot) => void;
  onSelectStyle: (styleId: ProjectState["styleId"]) => void;
  onSwitchMode: (mode: ProjectState["mode"]) => void;
  onUsePatternInSelectedBlock: (pattern: PatternSlot) => void;
  onSetKeyboardCaptureEnabled: (enabled: boolean) => void;
  onSetKeyboardCaptureStepMode: (mode: KeyboardCaptureStepMode) => void;
  onSetKeyboardCaptureTarget: (target: NoteTrack) => void;
  onUpdateKeyboardCaptureDefaults: (update: Partial<KeyboardCaptureDefaults>) => void;
  onSetMidiCaptureArmed: (armed: boolean) => void;
  onApplySessionBriefStarter: (pad: SessionBriefStarterPadId) => void;
  onFocusSessionBriefCompass: (card: SessionBriefCompassCard) => void;
  onRunSelectedBlockEditPriority: (actionId: SelectedBlockEditPrioritySummary["actionId"]) => void;
  onCopySelectedArrangementBlock: () => void;
  onPasteArrangementBlockAfterSelected: () => void;
  onDuplicateArrangementBlock: () => void;
  onMoveArrangementBlock: (direction: -1 | 1) => void;
  onSplitArrangementBlock: () => void;
  onMergeArrangementBlock: () => void;
  onDeleteArrangementBlock: () => void;
  onMoveSelectedNoteStep: (direction: -1 | 1) => void;
  onResetSelectedNoteStep: (step: number) => void;
  onMoveSelectedNotePitch: (direction: -1 | 1) => void;
  onResetSelectedNotePitch: () => void;
  onMoveSelectedNoteOctave: (direction: -1 | 1) => void;
  onUpdateSelectedNoteLength: (length: number) => void;
  onUpdateSelectedNoteGlide: (glide: boolean) => void;
  onUpdateSelectedNoteVelocity: (velocity: number) => void;
  onUpdateSelectedNoteProbability: (probability: number) => void;
  onAuditionSelectedNote: () => void;
  onCopySelectedNote: () => void;
  onPasteCopiedNote: () => void;
  onDuplicateSelectedNote: () => void;
  onDuplicateSelectedNoteToStep: (step: number) => void;
  onDeleteSelectedNote: () => void;
  onMoveSelectedDrumStep: (direction: -1 | 1) => void;
  onResetSelectedDrumStep: (step: number) => void;
  onUpdateSelectedDrumVelocity: (velocity: number) => void;
  onUpdateSelectedDrumProbability: (probability: number) => void;
  onUpdateSelectedDrumTiming: (timingMs: number) => void;
  onUpdateSelectedHatRepeat: (repeat: number) => void;
  onAuditionSelectedDrumHit: () => void;
  onCopySelectedDrumHit: () => void;
  onPasteCopiedDrumHit: () => void;
  onDuplicateSelectedDrumHit: () => void;
  onDuplicateSelectedDrumHitToStep: (step: number) => void;
  onDeleteSelectedDrumHit: () => void;
  onMoveSelectedChordStep: (direction: -1 | 1) => void;
  onUpdateSelectedChordStep: (step: number) => void;
  onAuditionSelectedChord: () => void;
  onCopySelectedChord: () => void;
  onPasteCopiedChord: () => void;
  onDuplicateSelectedChord: () => void;
  onDuplicateSelectedChordToStep: (step: number) => void;
  onDeleteSelectedChord: () => void;
  onMoveSelectedChordInversion: (direction: -1 | 1) => void;
  onResetSelectedChordInversion: () => void;
  onUpdateSelectedChordRoot: (root: string) => void;
  onUpdateSelectedChordQuality: (quality: ChordQuality) => void;
  onUpdateSelectedChordLength: (length: number) => void;
  onUpdateSelectedChordVelocity: (velocity: number) => void;
  onUpdateSelectedChordProbability: (probability: number) => void;
  onExportHandoffSheet: () => void;
  onExportMidi: () => void;
  onExportStems: () => void;
  onExportWav: () => void;
  onJumpFirstBeatPath: (step: FirstBeatPathStep) => void;
  onJumpBeatSpine: (card: BeatSpineCard) => void;
  onFocusBeatPassport: (metric: BeatPassportFocusItem) => void;
  onFocusBeatReadiness: (check: BeatReadinessCheck) => void;
  onFocusComposerGuide: (card: ComposerGuideCard) => void;
  onRunComposerAction: (action: ComposerAction) => void;
  onRunNextMove: (action: NextMoveAction) => void;
  onFocusExportPreflight: (card: ExportPreflightFocusItem) => void;
  onFocusFinishChecklist: (card: FinishChecklistCard) => void;
  onFocusGrooveCompass: (item: GrooveCompassFocusItem) => void;
  onFocusHandoffExportFormat: (metric: HandoffExportFormatMetric) => void;
  onFocusHandoffPack: () => void;
  onFocusHandoffManifestAudit: () => void;
  onFocusHandoffPackageCheck: (card: HandoffPackageCheckCard) => void;
  onFocusHookReadiness: (card: HookReadinessFocusItem) => void;
  onFocusKeyCompass: (item: KeyCompassFocusItem) => void;
  onFocusListeningPass: (item: ListeningPassItem) => void;
  onFocusLoopScope: () => void;
  onFocusMetronomeReadout: () => void;
  onFocusTransportPositionReadout: () => void;
  onFocusMixCoach: (check: MixCoachCheck) => void;
  onFocusExportMeter: () => void;
  onFocusMasterOutputRole: () => void;
  onFocusModeFocus: (card: ModeFocusCard) => void;
  onFocusPatternDna: (card: PatternDnaCard) => void;
  onFocusPatternPlaybackReadout: () => void;
  onFocusPatternUseReadout: () => void;
  onFocusProductionSnapshot: (metric: ProductionSnapshotFocusItem) => void;
  onFocusReferenceAlignment: (card: ReferenceAlignmentCard) => void;
  onFocusSnapshotCompare: (item: SnapshotCompareFocusItem) => void;
  onFocusReviewQueue: (item: ReviewQueueItem) => void;
  onApplyReviewFix: (item?: ReviewQueueItem) => void;
  onFocusSessionPass: (card: SessionPassCard) => void;
  onFocusStyleInspector: (item: StyleInspectorFocusItem) => void;
  onFocusToplineSpace: (card: ToplineSpaceFocusItem) => void;
  onFocusWorkflowSpotlight: (item: WorkflowNavigatorItem) => void;
  onJumpWorkflowZone: (item: WorkflowNavigatorItem) => void;
  onOpenCommandReference: () => void;
  onOpenProject: () => Promise<void>;
  onCheckProjectSafety: () => void;
  onRedo: () => void;
  onRestoreLocalDraft: () => void;
  onSaveProject: () => Promise<void>;
  onSaveSnapshot: () => void;
  onClearLocalDraftRecovery: () => void;
  onSelectTransportLoopScope: (scope: TransportLoopScope) => void;
  onTogglePlayback: () => void;
  onUndo: () => void;
}): QuickAction[] {
  const suggestedBlueprint = suggestedBlueprintId(project);
  const suggestedBlueprintName = beatBlueprints.find((blueprint) => blueprint.id === suggestedBlueprint)?.name ?? "Beat Blueprint";
  const currentStyleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const previewBlueprint = beatBlueprints.find((blueprint) => blueprint.id === beatBlueprintPreviewId) ?? beatBlueprints[0];
  const styleMatchBlueprint = beatBlueprints.find((blueprint) => blueprint.id === suggestedBlueprint) ?? previewBlueprint;
  const blueprintPreviewSummary = createBeatBlueprintPreviewSummary(project, previewBlueprint);
  const styleMatchPreviewSummary = createBeatBlueprintPreviewSummary(project, styleMatchBlueprint);
  const styleMatchPreviewed = blueprintPreviewSummary.blueprintId === styleMatchPreviewSummary.blueprintId;
  const blueprintPreviewDecision = createBeatBlueprintPreviewDecision(
    blueprintPreviewSummary,
    styleMatchPreviewSummary,
    styleMatchPreviewed
  );
  const blueprintPreviewCue = createBeatBlueprintPreviewCue(blueprintPreviewSummary, styleMatchPreviewSummary, styleMatchPreviewed);
  const blueprintPreviewCueActive = transportLoopScope === blueprintPreviewCue.actionLoopScope;
  const masterOutputRoleSummary = createMasterOutputRoleSummary(project, exportAnalysis);
  const localDraftRecoveryDetail = localDraftRecovery
    ? `${localDraftRecovery.project.title} / ${formatLocalDraftSavedAt(localDraftRecovery.savedAt)} / ${projectEventTotal(
        localDraftRecovery.project
      )} events`
    : "No local recovery draft available.";
  const blueprintActions: QuickAction[] = beatBlueprints.flatMap((blueprint): QuickAction[] => {
    const styleName = styleProfiles.find((profile) => profile.id === blueprint.styleId)?.name ?? blueprint.styleId;
    const detail = `${styleName} / ${blueprint.key} / ${blueprint.bpm} BPM / ${arrangementTemplateLabel(
      blueprint.arrangementTemplate
    )} / ${soundPresetLabel(blueprint.soundPreset)} / ${blueprint.masterPreset}`;
    const keywords = `beat blueprint direct starter ${blueprint.id} ${blueprint.name} ${blueprint.focus} ${styleName} ${blueprint.styleId} ${blueprint.key} ${blueprint.bpm} ${blueprint.soundPreset} ${blueprint.masterPreset} drums 808 bass chords synth arrangement sound master sample free genre beginner producer`;

    return [
      {
        id: `blueprint-preview-${blueprint.id}`,
        title: `Preview Blueprint: ${blueprint.name}`,
        detail: `${detail} / preview only`,
        group: "Create",
        keywords: `preview ${keywords}`,
        run: () => onPreviewBlueprint(blueprint.id)
      },
      {
        id: `blueprint-apply-${blueprint.id}`,
        title: `Apply Blueprint: ${blueprint.name}`,
        detail,
        group: "Create",
        keywords: `apply ${keywords}`,
        run: () => onApplyBlueprint(blueprint.id)
      }
    ];
  });
  const selectedBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0];
  const selectedBlockNumber = selectedBlock ? Math.min(selectedArrangementIndex + 1, project.arrangement.length) : 0;
  const selectedBlockBars = selectedBlock ? normalizeArrangementBars(selectedBlock.bars) : 0;
  const selectedBlockLabel = selectedBlock
    ? `Block ${selectedBlockNumber} ${selectedBlock.section} Pattern ${selectedBlock.pattern} / ${barCountLabel(selectedBlockBars)}`
    : "No selected block";
  const selectedBlockRoleSummary = selectedArrangementBlockRoleSummary(project, selectedArrangementIndex);
  const selectedBlockEnergyLabel = selectedBlock ? percentLabel(normalizeArrangementEnergy(selectedBlock.energy)) : "No energy";
  const selectedBlockMuteLabel = selectedBlock
    ? arrangementFocusPreviewMuteLabel(normalizeArrangementMutedTracks(selectedBlock.mutedTracks))
    : "No mute posture";
  const selectedBlockEventCount = selectedBlock ? patternEventTotal(project.patterns[selectedBlock.pattern]) : 0;
  const selectedBlockSplitAfter = selectedBlock ? clampSplitAfterBars(splitAfterBars, selectedBlockBars) : 1;
  const nextArrangementBlock = project.arrangement[selectedArrangementIndex + 1] ?? null;
  const nextArrangementBlockBars = nextArrangementBlock ? normalizeArrangementBars(nextArrangementBlock.bars) : 0;
  const canMergeSelectedBlock = Boolean(selectedBlock && nextArrangementBlock && selectedBlockBars + nextArrangementBlockBars <= maxArrangementBars);
  const arrangementBlockClipboardLabel = arrangementBlockClipboard
    ? `${arrangementBlockClipboard.section} Pattern ${arrangementBlockClipboard.pattern} / ${barCountLabel(normalizeArrangementBars(arrangementBlockClipboard.bars))}`
    : "Clipboard empty";
  const selectedArrangementBlockReadoutAction: QuickAction = {
    id: "selected-arrangement-block-readout-action",
    title: selectedBlock
      ? `Review Selected Arrangement Block Readout: Block ${selectedBlockNumber} ${selectedBlock.section}`
      : "Review Selected Arrangement Block Readout",
    detail:
      selectedBlock && selectedBlockRoleSummary
        ? `${selectedBlockRoleSummary.roleLabel} / Pattern ${selectedBlock.pattern} / ${selectedBlockRoleSummary.timelineLabel} / ${barCountLabel(
            selectedBlockBars
          )} / ${selectedBlockEnergyLabel} energy / ${selectedBlockMuteLabel} / ${selectedBlockEventCount} events`
        : "No selected arrangement block",
    group: "Arrange",
    keywords: `Quick Actions Selected Arrangement Block Readout review selected block role section Pattern ${
      selectedBlock?.pattern ?? project.selectedPattern
    } ${selectedBlock?.section ?? "none"} bar range bar length energy mute posture editable events arrangement block jump cue beginner producer`,
    run: onFocusSelectedArrangementBlockReadout
  };
  const arrangementBlockJumpActions: QuickAction[] = project.arrangement.map((block, index) => {
    const blockNumber = index + 1;
    const bars = normalizeArrangementBars(block.bars);
    const startBar = arrangementStartBar(project, index) + 1;
    const endBar = startBar + bars - 1;
    const rangeLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
    const selected = selectedArrangementIndex === index;
    const eventCount = patternEventTotal(project.patterns[block.pattern]);
    return {
      id: `arrangement-block-jump-${blockNumber}`,
      title: selected ? `Block ${blockNumber} ${block.section} already selected` : `Jump to Block ${blockNumber} ${block.section}`,
      detail: `Pattern ${block.pattern} / ${rangeLabel} / ${Math.round(normalizeArrangementEnergy(block.energy) * 100)}% energy / ${eventCount} events`,
      group: "Arrange",
      keywords: `arrangement block jump select navigate song form section ${block.section} block ${blockNumber} pattern ${block.pattern} ${rangeLabel} beginner producer`,
      run: () => onSelectArrangementBlock(index)
    };
  });
  const arrangementBlockCueActions: QuickAction[] = project.arrangement.map((block, index) => {
    const blockNumber = index + 1;
    const bars = normalizeArrangementBars(block.bars);
    const startBar = arrangementStartBar(project, index) + 1;
    const endBar = startBar + bars - 1;
    const rangeLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
    const cued = selectedArrangementIndex === index && transportLoopScope === "block";
    const eventCount = patternEventTotal(project.patterns[block.pattern]);
    return {
      id: `arrangement-block-cue-${blockNumber}`,
      title: cued ? `Block ${blockNumber} ${block.section} already cued` : `Cue Block ${blockNumber} ${block.section}`,
      detail: isPlaying
        ? "Stop playback before cueing a block."
        : `Pattern ${block.pattern} / ${rangeLabel} / ${Math.round(normalizeArrangementEnergy(block.energy) * 100)}% energy / ${eventCount} events`,
      group: "Transport",
      keywords: `arrangement block cue audition loop transport song form section ${block.section} block ${blockNumber} pattern ${block.pattern} ${rangeLabel} beginner producer`,
      disabled: isPlaying,
      run: () => onCueArrangementBlock(index)
    };
  });
  const audibleArrangementFollowTarget =
    playingArrangementIndex !== null && playingArrangementIndex !== selectedArrangementIndex ? playingArrangementIndex : null;
  const audibleArrangementFollowBlock =
    audibleArrangementFollowTarget !== null ? project.arrangement[audibleArrangementFollowTarget] ?? null : null;
  const audibleArrangementFollowBlockNumber = audibleArrangementFollowTarget !== null ? audibleArrangementFollowTarget + 1 : 0;
  const editingAudibleArrangementBlock =
    playingArrangementIndex !== null && playingArrangementIndex === selectedArrangementIndex;
  const arrangementPlaybackDetailLabel = arrangementPlaybackReadout.detailLabel.split(" / ").join(" + ");
  const arrangementPlaybackReadoutAction: QuickAction = {
    id: "arrangement-playback-readout-action",
    title: `Review Arrangement Playback: ${arrangementPlaybackReadout.roleLabel}`,
    detail: `${arrangementPlaybackReadout.statusLabel} / ${arrangementPlaybackReadout.roleLabel} / ${
      arrangementPlaybackDetailLabel
    } / ${transportLoopLabel(transportLoopScope)} loop / ${selectedBlockLabel} / ${project.bpm} BPM`,
    group: "Arrange",
    keywords: `arrangement playback readout edit heard audible hearing selected current block ${
      playingArrangementIndex !== null ? playingArrangementIndex + 1 : "idle"
    } ${selectedArrangementIndex + 1} ${arrangementPlaybackReadout.statusLabel} ${
      arrangementPlaybackReadout.roleLabel
    } ${arrangementPlaybackDetailLabel} ${transportLoopScope} song form beginner producer direct beat workstation`,
    run: onFocusArrangementPlaybackReadout
  };
  const audibleArrangementFollowReadoutAction: QuickAction = {
    id: "audible-arrangement-follow-readout-action",
    title: audibleArrangementFollowBlock
      ? `Review Audible Arrangement Follow Readout: Block ${audibleArrangementFollowBlockNumber}`
      : editingAudibleArrangementBlock
        ? `Review Audible Arrangement Follow Readout: aligned Block ${selectedBlockNumber || selectedArrangementIndex + 1}`
        : "Review Audible Arrangement Follow Readout",
    detail: audibleArrangementFollowBlock
      ? `Hearing Block ${audibleArrangementFollowBlockNumber} ${audibleArrangementFollowBlock.section} Pattern ${
          audibleArrangementFollowBlock.pattern
        } while editing ${selectedBlockLabel} / ${arrangementPlaybackReadout.statusLabel} / ${arrangementPlaybackDetailLabel} / ${
          transportLoopLabel(transportLoopScope)
        } loop / ${project.bpm} BPM`
      : editingAudibleArrangementBlock
        ? `Already editing audible ${selectedBlockLabel} / ${arrangementPlaybackReadout.statusLabel} / ${
            arrangementPlaybackDetailLabel
          } / ${transportLoopLabel(transportLoopScope)} loop / ${project.bpm} BPM`
        : `No audible arrangement block / ${arrangementPlaybackReadout.statusLabel} / ${arrangementPlaybackDetailLabel} / ${
            transportLoopLabel(transportLoopScope)
          } loop / ${project.bpm} BPM`,
    group: "Arrange",
    keywords: `Quick Actions Audible Arrangement Follow Readout review edit heard audible block alignment arrangement playback Pattern ${
      audibleArrangementFollowBlock?.pattern ?? project.selectedPattern
    } ${playingArrangementIndex !== null ? playingArrangementIndex + 1 : "idle"} ${
      selectedArrangementIndex + 1
    } ${transportLoopScope} beginner producer`,
    run: onFocusAudibleArrangementFollowReadout
  };
  const audibleArrangementFollowAction: QuickAction = {
    id: "arrangement-follow-audible",
    title: audibleArrangementFollowBlock
      ? `Edit audible Block ${audibleArrangementFollowBlockNumber}`
      : editingAudibleArrangementBlock
        ? `Already editing audible Block ${selectedBlockNumber || selectedArrangementIndex + 1}`
        : "Edit audible Block",
    detail: audibleArrangementFollowBlock
      ? `Hearing Block ${audibleArrangementFollowBlockNumber} ${audibleArrangementFollowBlock.section} Pattern ${audibleArrangementFollowBlock.pattern} while editing ${selectedBlockLabel} / changes edit focus only`
      : editingAudibleArrangementBlock
        ? `Editing and hearing ${selectedBlockLabel} already match.`
        : "Play Song loop with another block before following the audible block.",
    group: "Arrange",
    keywords: `arrangement audible block follow heard hearing playing edit focus playback readout ${
      playingArrangementIndex ?? "none"
    } ${selectedArrangementIndex + 1} ${audibleArrangementFollowBlock?.section ?? "none"} song form beginner producer`,
    disabled: !audibleArrangementFollowBlock,
    run: onFollowAudibleArrangementBlock
  };
  const beatMapCommandActions = createNextMoveSourceQuickActions("beat-map", beatMapActions, onRunNextMove);
  const structureLensCommandActions = createNextMoveSourceQuickActions(
    "structure-lens",
    structureLensActions,
    onRunNextMove
  );
  const songFormPrioritySummary = createSongFormPrioritySummary(songFormOverviewSummary);
  const songFormOverviewReadoutAction: QuickAction = {
    id: "song-form-overview-readout-action",
    title:
      songFormPrioritySummary.targetIndex === null
        ? "Review Song Form Overview"
        : `Review Song Form Overview: ${songFormPrioritySummary.targetLabel}`,
    detail: `${songFormPrioritySummary.statusLabel} / ${songFormPrioritySummary.metricLabel} / ${songFormPrioritySummary.reasonLabel} / ${songFormPrioritySummary.nextCheckLabel}`,
    group: "Arrange",
    keywords: `Quick Actions Song Form Overview Readout review full song form section flow pattern usage priority metric block bar range energy mute transition arrangement ${
      songFormPrioritySummary.metricId ?? "none"
    } ${songFormPrioritySummary.targetLabel} ${songFormPrioritySummary.statusLabel} beginner producer`,
    run: onFocusSongFormOverviewReadout
  };
  const songFormPriorityAction: QuickAction = {
    id: "song-form-priority",
    title:
      songFormPrioritySummary.targetIndex === null
        ? "Open Song Form Priority"
        : `Open Song Form Priority: ${songFormPrioritySummary.targetLabel}`,
    detail: `${songFormPrioritySummary.statusLabel} / ${songFormPrioritySummary.metricLabel} / ${songFormPrioritySummary.reasonLabel} / ${songFormPrioritySummary.nextCheckLabel}`,
    group: "Arrange",
    keywords: `Quick Actions Song Form Priority song form overview priority metric current block navigation section pattern energy ${
      songFormPrioritySummary.metricId ?? "none"
    } ${songFormPrioritySummary.targetLabel} ${songFormPrioritySummary.statusLabel} beginner producer`,
    disabled: songFormPrioritySummary.targetIndex === null,
    run: () => {
      if (songFormPrioritySummary.targetIndex !== null) {
        onSelectArrangementBlock(songFormPrioritySummary.targetIndex);
      }
    }
  };
  const beatPassportMetric = activeBeatPassportQuickActionMetric(beatPassportSummary);
  const beatReadinessCheck = activeBeatReadinessQuickActionCheck(beatReadinessChecks);
  const beatReadinessActions: QuickAction[] = beatReadinessChecks.map((check) => ({
    id: beatReadinessCardActionId(check),
    title: `Focus Beat Readiness: ${check.label}`,
    detail: `${check.status} / ${check.focusLabel} / ${check.detail}`,
    group: "Project",
    keywords: `beat readiness focus check direct ${check.id} ${check.label} ${check.status} ${check.focusLabel} ${check.detail} drums 808 bass melody chords arrangement export composer producer`,
    run: () => onFocusBeatReadiness(check)
  }));
  const beatPassportActions: QuickAction[] = beatPassportSummary.metrics.map((metric) => ({
    id: `beat-passport-metric-${metric.id}`,
    title: `Focus Beat Passport: ${metric.label}`,
    detail: `${metric.value} / ${metric.focusLabel} / ${metric.detail}`,
    group: "Project",
    keywords: `beat passport focus metric identity status ${metric.id} ${metric.label} ${metric.value} ${metric.focusLabel} ${metric.detail} target length patterns readiness export stems master beginner producer`,
    run: () => onFocusBeatPassport(metric)
  }));
  const firstBeatPathStep = activeFirstBeatPathQuickActionStep(firstBeatPathSummary);
  const firstBeatPathActions: QuickAction[] = firstBeatPathSummary.steps.map((step) => ({
    id: `first-beat-path-step-${step.id}`,
    title: `Jump First Beat Path: ${step.label}`,
    detail: firstBeatPathCommandDetail(step, firstBeatPathSummary),
    group: "Project",
    keywords: `first beat path direct step jump setup compose arrange mix deliver ${step.id} ${step.label} ${step.value} ${step.jumpLabel} ${firstBeatPathCommandDetail(step, firstBeatPathSummary)} beginner producer`,
    run: () => onJumpFirstBeatPath(step)
  }));
  const beatSpineCard = activeBeatSpineQuickActionCard(beatSpineSummary);
  const beatSpineApplyCard = activeBeatSpineQuickActionApplyCard(beatSpineSummary);
  const beatSpineCardJumpActions: QuickAction[] = beatSpineSummary.cards.map((card) => ({
    id: `beat-spine-card-jump-${card.id}`,
    title: `Jump Beat Spine: ${card.label}`,
    detail: beatSpineJumpButtonContext(card, beatSpineSummary),
    group: "Project",
    keywords: `beat spine direct card jump core setup drums 808 bass harmony melody sound arrange finish ${card.id} ${card.label} ${card.value} ${card.focusLabel} ${card.detail} beginner producer`,
    run: () => onJumpBeatSpine(card)
  }));
  const beatSpineCardApplyActions: QuickAction[] = beatSpineSummary.cards.map((card) => ({
    id: `beat-spine-card-apply-${card.id}`,
    title: card.action ? `Apply Beat Spine: ${card.label}` : `${card.label} Beat Spine apply unavailable`,
    detail: card.action
      ? beatSpineApplyButtonContext(card.action, card, beatSpineSummary, project.selectedPattern)
      : `${card.label} has no direct Beat Spine apply action.`,
    group: "Create",
    keywords: `beat spine direct card apply core setup drums 808 bass harmony melody sound arrange finish ${card.id} ${card.label} ${card.action?.label ?? "none"} sample free beginner producer`,
    disabled: !card.action,
    run: () => {
      if (card.action) {
        onApplyBeatSpine(card.action);
      }
    }
  }));
  const composerGuideCard = activeComposerGuideQuickActionCard(composerGuideSummary);
  const composerGuideCardDetail = composerGuideCard ? composerGuideFocusCommandDetail(composerGuideCard, composerGuideSummary) : "";
  const composerGuideActions: QuickAction[] = composerGuideSummary.cards.map((card) => {
    const commandDetail = composerGuideFocusCommandDetail(card, composerGuideSummary);
    const action: QuickAction = {
      id: `composer-guide-card-${card.id}`,
      title: `Focus Composer Guide: ${card.label}`,
      detail: commandDetail,
      group: "Create",
      keywords: `composer guide focus card writing lane ${card.id} ${card.label} ${card.status} ${card.focusLabel} ${card.detail} ${commandDetail} drums 808 bass harmony melody arrange finish beginner producer`,
      run: () => onFocusComposerGuide(card)
    };
    return action;
  });
  const composerActionCommands: QuickAction[] = composerActionsSummary.actions.map((action) => {
    const commandDetail = composerActionQuickActionDetail(action, project);
    return {
      id: `composer-action-${action.id}`,
      title: `Run Composer Action: ${action.buttonLabel}`,
      detail: commandDetail,
      group: composerActionQuickActionGroup(action),
      keywords: `composer action direct writing move style aware ${action.id} ${action.area} ${action.label} ${action.buttonLabel} ${action.detail} ${commandDetail} ${action.scope} ${action.impact} ${action.safety} drums 808 bass harmony melody arrange finish sample free beginner producer`,
      run: () => onRunComposerAction(action)
    };
  });
  const exportPreflightCard = activeExportPreflightQuickActionCard(exportPreflightSummary);
  const exportPreflightActions: QuickAction[] = exportPreflightSummary.cards.map((card) => ({
    id: `export-preflight-card-${card.id}`,
    title: `Focus Export Preflight: ${card.label}`,
    detail: `${card.value} / ${card.focusLabel} / ${card.detail}`,
    group: "Export",
    keywords: `export preflight focus card delivery risk ${card.id} ${card.label} ${card.value} ${card.focusLabel} ${card.detail} readiness mix master automation fade deliverables handoff beginner producer`,
    run: () => onFocusExportPreflight(card)
  }));
  const finishChecklistCard = activeFinishChecklistQuickActionCard(finishChecklistSummary);
  const finishChecklistActions: QuickAction[] = finishChecklistSummary.cards.map((card) => ({
    id: `finish-checklist-card-${card.id}`,
    title: `Focus Finish Checklist: ${card.label}`,
    detail: `${card.status} / ${card.focusLabel} / ${card.detail}`,
    group: "Project",
    keywords: `finish checklist focus card readiness ${card.id} ${card.label} ${card.status} ${card.focusLabel} ${card.detail} compose arrange mix master automation fade handoff deliver beginner producer`,
    run: () => onFocusFinishChecklist(card)
  }));
  const grooveCompassItem = activeGrooveCompassQuickActionItem(grooveCompassSummary);
  const grooveCompassActions: QuickAction[] = grooveCompassSummary.cards.map((item) => ({
    id: `groove-compass-card-${item.id}`,
    title: `Focus Groove Compass: ${item.label}`,
    detail: `${item.value} / ${item.focusLabel} / ${item.detail}`,
    group: "Create",
    keywords: `groove compass focus card rhythm pocket balance early late velocity motion drums density anchors hats timing chance selected drum inspect ${item.id} ${item.label} ${item.value} ${item.focusLabel} ${item.detail} beginner producer`,
    run: () => onFocusGrooveCompass(item)
  }));
  const grooveCompassCued = transportLoopScope === "pattern";
  const grooveCompassCueAction: QuickAction = {
    id: "groove-compass-cue",
    title: grooveCompassCued
      ? `Groove Compass Pattern ${project.selectedPattern} already cued`
      : `Cue Groove Compass: Pattern ${project.selectedPattern}`,
    detail: grooveCompassCued
      ? `Pattern ${project.selectedPattern} is the current Pattern loop for groove audition.`
      : `Set Pattern ${project.selectedPattern} as the Pattern loop before judging density, anchors, hats, timing, chance, and pocket.`,
    group: "Transport",
    keywords: `groove compass cue audition loop pattern transport rhythm pocket selected ${project.selectedPattern} density anchors hats timing chance beginner producer`,
    disabled: isPlaying,
    run: onCueGrooveCompass
  };
  const blueprintPreviewCueAction: QuickAction = {
    id: "blueprint-preview-cue",
    title: blueprintPreviewCueActive
      ? `${blueprintPreviewCue.actionLabel} already cued for ${blueprintPreviewSummary.name}`
      : `${blueprintPreviewCue.actionLabel}: ${blueprintPreviewSummary.name}`,
    detail: `${blueprintPreviewCue.cueLabel} / ${blueprintPreviewCue.detailLabel} / ${blueprintPreviewCue.nextCheckLabel}`,
    group: "Transport",
    keywords: `beat blueprint preview cue audition loop ${blueprintPreviewCue.actionLoopScope} ${blueprintPreviewCue.actionId} ${blueprintPreviewSummary.blueprintId} ${blueprintPreviewSummary.name} ${blueprintPreviewSummary.focus} ${currentStyleName} ${project.styleId} song pattern transport starter sample free drums 808 bass chords synth arrangement sound master beginner producer`,
    disabled: isPlaying,
    run: () => onCueBlueprintPreview(blueprintPreviewCue.actionLoopScope)
  };
  const blueprintPreviewDecisionAction: QuickAction = {
    id: "blueprint-preview-decision",
    title:
      blueprintPreviewDecision.actionId === "apply-preview"
        ? `Apply Preview: ${blueprintPreviewDecision.blueprintLabel}`
        : `Compare Style Match: ${styleMatchPreviewSummary.name}`,
    detail: `${blueprintPreviewDecision.statusLabel} / ${blueprintPreviewDecision.metricLabel} / ${blueprintPreviewDecision.detailLabel} / ${blueprintPreviewDecision.actionLabel}`,
    group: "Create",
    keywords: `beat blueprint preview decision ${blueprintPreviewDecision.actionId} ${blueprintPreviewDecision.actionBlueprintId} ${blueprintPreviewDecision.blueprintLabel} ${blueprintPreviewDecision.actionLabel} ${styleMatchPreviewSummary.name} ${currentStyleName} ${project.styleId} apply compare style match starter sample free drums 808 bass chords synth arrangement sound master beginner producer`,
    run: () => {
      if (blueprintPreviewDecision.actionId === "apply-preview") {
        onApplyBlueprint(blueprintPreviewDecision.actionBlueprintId);
        return;
      }
      onPreviewBlueprint(blueprintPreviewDecision.actionBlueprintId);
    }
  };
  const keyCompassItem = activeKeyCompassQuickActionItem(keyCompassSummary);
  const keyCompassActions: QuickAction[] = keyCompassSummary.cards.map((item) => ({
    id: `key-compass-card-${item.id}`,
    title: `Focus Key Compass: ${item.label}`,
    detail: `${item.value} / ${item.focusLabel} / ${item.detail}`,
    group: "Create",
    keywords: `key compass focus card harmony cadence resolution scale chord 808 bass melody selected note selected chord inspect ${item.id} ${item.label} ${item.value} ${item.focusLabel} ${item.detail} beginner producer`,
    run: () => onFocusKeyCompass(item)
  }));
  const layerStarterOption = activeLayerStarterQuickActionOption(layerStarterOptions);
  const layerStarterActions: QuickAction[] = layerStarterOptions.map((option) => ({
    id: `layer-starter-${option.id}`,
    title: option.tone === "good" ? `${option.label} layer ready` : `Start ${option.label} layer`,
    detail: `${option.status} / ${option.detail}`,
    group: "Create",
    keywords: `layer starter direct start seed pad drums 808 bass chords synth ${option.id} ${option.label} ${option.status} ${option.actionLabel} ${option.targetLabel} beginner producer`,
    disabled: option.tone === "good",
    run: () => {
      if (option.tone !== "good") {
        onApplyLayerStarter(option.id);
      }
    }
  }));
  const listeningPassItem = activeListeningPassQuickActionItem(listeningPassSummary);
  const listeningPassActions: QuickAction[] = listeningPassSummary.items.map((item) => ({
    id: `listening-pass-checkpoint-${item.id}`,
    title: `Focus Listening Pass: ${item.label}`,
    detail: `${item.status} / ${item.focusLabel} / ${item.cue}`,
    group: "Project",
    keywords: `listening pass focus checkpoint audition ${item.id} ${item.label} ${item.status} ${item.focusLabel} ${item.cue} composition arrangement mix delivery beginner producer`,
    run: () => onFocusListeningPass(item)
  }));
  const mixCoachChecks = createMixCoachChecks(exportAnalysis, stemAnalyses);
  const mixCoachCheck = mixCoachFocusCheck(mixCoachChecks);
  const mixCoachActions: QuickAction[] = mixCoachChecks.map((check) => ({
    id: `mix-coach-check-${check.id}`,
    title: `Focus Mix Coach: ${check.label}`,
    detail: `${check.status} / ${check.detail}`,
    group: "Mix",
    keywords: `mix coach focus check diagnostic headroom limiter stem balance low end ${check.id} ${check.label} ${check.status} ${check.detail} beginner producer`,
    run: () => onFocusMixCoach(check)
  }));
  const mixSnapshotDecisionAction: QuickAction = {
    id: "mix-snapshot-decision",
    title: `Run Mix Snapshot Decision: ${mixSnapshotComparison.decisionActionLabel}`,
    detail: `${mixSnapshotComparison.decisionStatus} / ${mixSnapshotComparison.decisionLabel} / ${mixSnapshotComparison.decisionDetail}`,
    group: "Mix",
    keywords: `Quick Actions Mix Snapshot Decision decision readout capture recall compare headroom balance master stems ${
      mixSnapshotComparison.decisionActionId
    } ${mixSnapshotComparison.decisionActionLabel} ${mixSnapshotComparison.decisionLabel} beginner producer`,
    resultTargetId: mixSnapshotComparison.decisionActionId,
    run: () => {
      switch (mixSnapshotComparison.decisionActionId) {
        case "capture-a":
          onCaptureMixSnapshot("A");
          return;
        case "capture-b":
          onCaptureMixSnapshot("B");
          return;
        case "recall-a":
          onRecallMixSnapshot("A");
          return;
        case "recall-b":
          onRecallMixSnapshot("B");
          return;
      }
    }
  };
  const mixSnapshotReadoutAction: QuickAction = {
    id: "mix-snapshot-readout-action",
    title: `Review Mix Snapshot A/B: ${mixSnapshotComparison.statusLabel}`,
    detail: `${mixSnapshotComparison.winnerLabel} / ${mixSnapshotComparison.detailLabel} / Decision ${mixSnapshotComparison.decisionActionLabel} / ${mixSnapshotComparison.decisionDetail}`,
    group: "Mix",
    keywords: `Quick Actions Mix Snapshot A/B Readout review readout compare capture recall clear headroom balance master stems ${
      mixSnapshotComparison.statusLabel
    } ${mixSnapshotComparison.winnerLabel} ${mixSnapshotComparison.detailLabel} ${mixSnapshotComparison.decisionActionId} ${
      mixSnapshotComparison.decisionActionLabel
    } producer beginner mix review`,
    run: onFocusMixSnapshotReadout
  };
  const mixBalanceReadoutAction: QuickAction = {
    id: "mix-balance-readout-action",
    title: `Review Mix Balance: ${mixBalancePreviewSummary.padLabel}`,
    detail: `${mixBalancePreviewSummary.statusLabel} / ${mixBalancePreviewSummary.channelLabel} / ${mixBalancePreviewSummary.auditionLabel} / ${mixBalancePreviewSummary.moveLabel}`,
    group: "Mix",
    keywords: `Quick Actions Mix Balance Readout review rough levels preview apply posture drums 808 bass synth chords stem audition ${
      mixBalancePreviewSummary.padId
    } ${mixBalancePreviewSummary.padLabel} ${mixBalancePreviewSummary.statusLabel} ${mixBalancePreviewSummary.channelLabel} ${
      mixBalancePreviewSummary.auditionLabel
    } beginner producer manual trim`,
    run: onFocusMixBalanceReadout
  };
  const stemAuditionDecisionAction: QuickAction = {
    id: "stem-audition-decision",
    title: stemAuditionDecision.targetId
      ? `Run Stem Audition Decision: ${stemAuditionDecision.targetLabel}`
      : "Run Stem Audition Decision",
    detail: `${stemAuditionDecision.statusLabel} / ${stemAuditionDecision.detailLabel} / ${stemAuditionDecision.nextCheckLabel}`,
    group: "Mix",
    keywords: `Quick Actions Stem Audition Decision stem audition readout solo mute full mix drums 808 bass synth chords ${
      stemAuditionDecision.targetId ?? "none"
    } ${stemAuditionDecision.targetLabel} mixer compare beginner producer`,
    disabled: stemAuditionDecision.targetId === null,
    resultTargetId: stemAuditionDecision.targetId ?? undefined,
    run: () => {
      if (stemAuditionDecision.targetId) {
        onApplyStemAudition(stemAuditionDecision.targetId);
      }
    }
  };
  const stemAuditionReadoutAction: QuickAction = {
    id: "stem-audition-readout-action",
    title: `Review Stem Audition: ${stemAuditionReadout.roleLabel}`,
    detail: `${stemAuditionReadout.statusLabel} / ${stemAuditionReadout.detailLabel} / Decision ${stemAuditionDecision.targetLabel} / ${stemAuditionDecision.nextCheckLabel}`,
    group: "Mix",
    keywords: `Quick Actions Stem Audition Readout readout review full mix soloed stem manual audition solo mute mixer ${
      stemAuditionReadout.roleLabel
    } ${stemAuditionReadout.statusLabel} ${stemAuditionReadout.detailLabel} ${stemAuditionDecision.targetLabel} ${
      stemAuditionDecision.nextCheckLabel
    } drums 808 bass synth chords beginner producer direct composition sample free`,
    run: onFocusStemAuditionReadout
  };
  const bassMoveTarget = activeBassMoveQuickActionTarget(project, bassMovePreviewSummary);
  const chordMoveTarget = activeChordMoveQuickActionTarget(project, selectedChord, chordMovePreviewSummary);
  const drumMoveTarget = activeDrumMoveQuickActionTarget(project, drumMovePreviewSummary);
  const melodyMoveTarget = activeMelodyMoveQuickActionTarget(project, melodyMovePreviewSummary);
  const modeFocusCard = activeModeFocusQuickActionCard(modeFocusSummary);
  const modeFocusActions: QuickAction[] = modeFocusSummary.cards.map((card) => ({
    id: `mode-focus-card-${card.id}`,
    title: `Jump Mode Focus: ${card.label}`,
    detail: modeFocusCommandDetail(card, modeFocusSummary),
    group: "Project",
    keywords: `mode focus jump card guided studio orientation stage writing check scan issue handoff ${card.id} ${card.label} ${card.value} ${card.focusLabel} ${card.detail} beginner producer`,
    run: () => onFocusModeFocus(card)
  }));
  const modeSwitchActions = createModeSwitchQuickActions({
    firstBeatPathSummary,
    modeFocusSummary,
    onSwitchMode,
    projectMode: project.mode,
    sessionPassSummary
  });
  const patternDnaCard = activePatternDnaQuickActionCard(patternDnaSummary);
  const patternDnaActions: QuickAction[] = patternDnaSummary.cards.map((card) => ({
    id: `pattern-dna-card-${card.id}`,
    title: `Focus Pattern DNA: ${card.label}`,
    detail: `${card.value} / ${card.focusLabel} / ${card.detail}`,
    group: "Create",
    keywords: `pattern dna focus card loop layers density variation arrangement inspect ${card.id} ${card.label} ${card.value} ${card.focusLabel} ${card.detail} compose arrange beginner producer`,
    run: () => onFocusPatternDna(card)
  }));
  const productionSnapshotMetric = activeProductionSnapshotQuickActionMetric(productionSnapshotSummary);
  const productionSnapshotActions: QuickAction[] = productionSnapshotSummary.metrics.map((metric) => ({
    id: `production-snapshot-metric-${metric.id}`,
    title: `Focus Production Snapshot: ${metric.label}`,
    detail: `${metric.value} / ${metric.focusLabel} / ${metric.detail}`,
    group: "Project",
    keywords: `production snapshot focus metric session scan ${metric.id} ${metric.label} ${metric.value} ${metric.focusLabel} ${metric.detail} target form patterns mix handoff beginner producer`,
    run: () => onFocusProductionSnapshot(metric)
  }));
  const snapshotCompareItem = activeSnapshotCompareQuickActionItem(snapshotCompareSummary);
  const snapshotCompareActions: QuickAction[] = snapshotCompareDirectMetricItems(snapshotCompareSummary).map((item) => ({
    id: `snapshot-compare-metric-${item.metricId}`,
    title: `Focus Snapshot Compare: ${item.label}`,
    detail: `${item.cardName} / ${item.value} / ${item.focusLabel} / ${item.detail}`,
    group: "Project",
    keywords: `snapshot compare focus metric saved take version ${item.metricId} ${item.label} ${item.value} ${item.focusLabel} ${item.cardName} ${item.detail} setup length readiness export stems master beginner producer`,
    run: () => onFocusSnapshotCompare(item)
  }));
  const hookReadinessCard = activeHookReadinessQuickActionCard(hookReadinessSummary);
  const hookFixOption = hookReadinessCard ? createHookFixOption(hookReadinessCard) : null;
  const hookReadinessActions: QuickAction[] = hookReadinessSummary.cards.map((card) => ({
    id: `hook-readiness-card-${card.id}`,
    title: `Focus Hook Readiness: ${card.label}`,
    detail: `${card.value} / ${card.focusLabel} / ${card.detail}`,
    group: card.focusTarget === "mix" || card.focusTarget === "master" ? "Mix" : "Arrange",
    keywords: `hook readiness focus card hook meter arrangement motif contrast mix handoff ${card.id} ${card.label} ${card.value} ${card.focusLabel} ${card.detail} beginner producer`,
    run: () => onFocusHookReadiness(card)
  }));
  const hookReadinessCueActions: QuickAction[] = hookReadinessSummary.cards.map((card) => ({
    id: `hook-readiness-cue-${card.id}`,
    title: `Cue Hook Loop: ${card.label}`,
    detail: hookLoopCueTarget
      ? `${hookLoopCueDetail(hookLoopCueTarget)} / ${card.value} / ${card.status}`
      : "Hook section not in arrangement.",
    group: "Transport",
    keywords: `hook loop cue readiness card audition block transport hook section motif contrast mix handoff ${card.id} ${card.label} ${card.value} ${card.focusLabel} ${card.detail} beginner producer`,
    disabled: isPlaying || !hookLoopCueTarget,
    run: () => onCueHookLoop(card)
  }));
  const hookReadinessFixActions: QuickAction[] = hookReadinessSummary.cards.map((card) => {
    const fix = createHookFixOption(card);
    return {
      id: `hook-readiness-fix-${card.id}`,
      title: `Apply Hook Fix: ${card.label}`,
      detail: `${fix.label} / ${fix.detail} / ${card.value} / ${card.status}`,
      group: fix.group,
      keywords: `hook fix action section motif contrast mix handoff arrangement variation lift headroom brief ${card.id} ${card.label} ${card.value} ${card.status} ${fix.label} ${fix.detail} beginner producer`,
      run: () => onApplyHookFix(card)
    };
  });
  const toplineSpaceCard = activeToplineSpaceQuickActionCard(toplineSpaceSummary);
  const toplineFixOption = toplineSpaceCard ? createToplineFixOption(toplineSpaceCard) : null;
  const toplineSpaceActions: QuickAction[] = toplineSpaceSummary.cards.map((card) => ({
    id: `topline-space-card-${card.id}`,
    title: `Focus Topline Space: ${card.label}`,
    detail: `${card.value} / ${card.focusLabel} / ${card.detail}`,
    group: card.focusTarget === "mix" || card.focusTarget === "master" ? "Mix" : "Project",
    keywords: `topline space vocal pocket focus card singer rapper lead hook ${card.id} ${card.label} ${card.value} ${card.focusLabel} ${card.detail} beginner producer`,
    run: () => onFocusToplineSpace(card)
  }));
  const toplineSpaceCueActions: QuickAction[] = toplineSpaceSummary.cards.map((card) => ({
    id: `topline-space-cue-${card.id}`,
    title: `Cue Topline Loop: ${card.label}`,
    detail: `${toplineLoopCueDetail(toplineLoopCueTarget)} / ${card.value} / ${card.status}`,
    group: "Transport",
    keywords: `topline loop cue vocal pocket audition block pattern transport singer rapper lead hook ${card.id} ${card.label} ${card.value} ${card.focusLabel} ${card.detail} beginner producer`,
    disabled: isPlaying,
    run: () => onCueToplineLoop(card)
  }));
  const toplineSpaceFixActions: QuickAction[] = toplineSpaceSummary.cards.map((card) => {
    const fix = createToplineFixOption(card);
    return {
      id: `topline-space-fix-${card.id}`,
      title: `Apply Topline Fix: ${card.label}`,
      detail: `${fix.label} / ${fix.detail} / ${card.value} / ${card.status}`,
      group: fix.group,
      keywords: `topline fix vocal room pocket lead headroom brief action ${card.id} ${card.label} ${card.value} ${card.status} ${fix.label} ${fix.detail} beginner producer`,
      run: () => onApplyToplineFix(card)
    };
  });
  const reviewQueueItem = reviewQueueSummary.items[0] ?? null;
  const reviewFixItem = activeReviewFixItem(reviewQueueSummary);
  const reviewFixOption = reviewFixItem ? createReviewFixOption(reviewFixItem, project, exportAnalysis) : null;
  const reviewQueueActions: QuickAction[] = reviewQueueSummary.items.map((item) => ({
    id: `review-queue-item-${item.id}`,
    title: `Focus Review Queue: ${item.area}`,
    detail: `${item.status} / ${item.focusLabel} / ${item.detail}`,
    group: "Project",
    keywords: `review queue focus issue triage ${item.id} ${item.area} ${item.status} ${item.focusLabel} ${item.detail} compose arrange mix master deliver beginner producer`,
    run: () => onFocusReviewQueue(item)
  }));
  const reviewQueueFixActions: QuickAction[] = reviewQueueSummary.items.map((item) => {
    const fix = createReviewFixOption(item, project, exportAnalysis);
    return {
      id: `review-queue-fix-${item.id}`,
      title: `Apply Review Fix: ${item.area}`,
      detail: fix ? `${fix.label} / ${fix.detail} / ${item.status}` : `${item.status} / No fix needed`,
      group: fix?.group ?? "Project",
      keywords: `review fix action issue triage ${item.id} ${item.area} ${item.status} ${item.detail} ${fix?.label ?? "ready"} ${
        fix?.detail ?? ""
      } compose arrange mix master deliver beginner producer`,
      disabled: item.tone === "good" || !fix,
      run: () => onApplyReviewFix(item)
    };
  });
  const sessionPassCard = activeSessionPassQuickActionCard(sessionPassSummary);
  const sessionPassActions: QuickAction[] = sessionPassSummary.cards.map((card) => ({
    id: `session-pass-card-${card.id}`,
    title: `Focus Session Pass: ${card.label}`,
    detail: sessionPassCommandDetail(card, sessionPassSummary),
    group: "Project",
    keywords: `session pass focus card guided studio finish deliver delivery workflow ${card.id} ${card.label} ${card.value} ${card.focusLabel} ${card.detail} beginner producer`,
    run: () => onFocusSessionPass(card)
  }));
  const sessionBriefCompassCard = activeSessionBriefCompassQuickActionCard(sessionBriefCompassSummary);
  const sessionBriefCompassActions: QuickAction[] = sessionBriefCompassSummary.cards.map((card) => ({
    id: `session-brief-compass-card-${card.id}`,
    title: `Focus Brief Compass: ${card.label}`,
    detail: `${card.value} / ${sessionBriefCompassFocusLabel(card, project.sessionBrief)} / ${card.detail}`,
    group: "Project",
    keywords: `session brief compass focus card handoff context direction reference artist notes ${card.id} ${card.label} ${card.value} ${card.detail} ${card.nextCheck} beginner producer`,
    run: () => onFocusSessionBriefCompass(card)
  }));
  const referenceAlignmentCard = activeReferenceAlignmentQuickActionCard(referenceAlignmentSummary);
  const referenceAlignmentActions: QuickAction[] = referenceAlignmentSummary.cards.map((card) => ({
    id: `reference-alignment-card-${card.id}`,
    title: `Focus Reference Alignment: ${card.label}`,
    detail: `${card.value} / ${card.focusLabel} / ${card.detail}`,
    group: "Project",
    keywords: `reference alignment listen cue ${card.id} ${card.label} ${card.value} ${card.focusLabel} arrange mix master handoff`,
    run: () => onFocusReferenceAlignment(card)
  }));
  const sessionBriefStarterActions: QuickAction[] = sessionBriefStarterPads.map((pad) => ({
    id: `session-brief-starter-${pad.id}`,
    title:
      pad.changedCount > 0
        ? `Apply Session Brief Starter: ${pad.label}`
        : `${pad.label} Session Brief Starter already covered`,
    detail: `${pad.preview} / ${pad.changedCount} blank field${pad.changedCount === 1 ? "" : "s"} / ${pad.detail}`,
    group: "Project",
    keywords: `session brief starter direct handoff context notes artist vibe reference ${pad.id} ${pad.label} ${pad.detail} ${pad.preview} beginner producer`,
    run: () => onApplySessionBriefStarter(pad.id)
  }));
  const styleInspectorItem = activeStyleInspectorQuickActionItem(styleInspectorSummary, project);
  const styleInspectorActions: QuickAction[] = [
    ...styleInspectorSummary.metrics,
    ...styleInspectorSummary.goals,
    ...styleInspectorSummary.patterns
  ].map((item) => ({
    id: `style-inspector-item-${item.focusId}`,
    title: `Focus Style Inspector: ${item.label}`,
    detail: `${item.value} / ${item.focusLabel} / ${item.detail}`,
    group: "Create",
    keywords: `style inspector focus genre lane ${item.focusId} ${item.label} ${item.value} ${item.focusLabel} ${item.detail} bpm swing bass melody sound density goal pattern beginner producer`,
    run: () => onFocusStyleInspector(item)
  }));
  const styleGoalCueCommands: QuickAction[] = styleInspectorSummary.goals.map((goal) => {
    const isArrangementGoal = goal.id === "arrange";
    const target = isArrangementGoal ? "Song loop" : `Pattern ${project.selectedPattern} loop`;
    const cued = isArrangementGoal ? transportLoopScope === "arrangement" : transportLoopScope === "pattern";

    return {
      id: `style-goal-cue-${goal.id}`,
      title: cued ? `${goal.label} Style Goal already cued` : `Cue Style Goal: ${goal.label}`,
      detail: `${target} / ${goal.value} / ${goal.cue}`,
      group: "Transport",
      keywords: `style goal cue audition loop ${goal.id} ${goal.label} ${goal.value} ${goal.current} ${goal.target} ${goal.progress} ${goal.cue} ${goal.detail} ${project.selectedPattern} pattern song transport drums 808 bass harmony melody arrange sample free beginner producer`,
      disabled: isPlaying,
      run: () => onCueStyleGoal(goal)
    };
  });
  const styleGoalActionCommands: QuickAction[] = styleInspectorSummary.goals.map((goal) => {
    const goalAction = composerActionForStyleGoal(goal, composerActionsSummary.actions);
    return {
      id: `style-goal-action-${goal.id}`,
      title: goalAction ? `Run Style Goal Action: ${goal.label}` : `${goal.label} Style Goal action unavailable`,
      detail: goalAction
        ? `${goal.value} / ${goalAction.label} / ${goalAction.scope} / ${goalAction.safety}`
        : `${goal.value} / no matching Composer Action available.`,
      group: goalAction ? composerActionQuickActionGroup(goalAction) : "Create",
      keywords: `style goal action direct compose ${goal.id} ${goal.label} ${goal.value} ${goal.current} ${goal.target} ${goal.progress} ${goal.cue} ${goal.detail} ${goalAction?.id ?? "none"} ${goalAction?.label ?? "none"} ${goalAction?.buttonLabel ?? "none"} ${goalAction?.scope ?? "none"} drums 808 bass harmony melody arrange sample free beginner producer`,
      disabled: !goalAction,
      run: () => {
        if (goalAction) {
          onRunComposerAction(goalAction);
        }
      }
    };
  });
  const workflowSpotlight = createWorkflowSpotlightSummary(workflowNavigatorItems);
  const workflowSpotlightItem = workflowSpotlight.zoneId
    ? workflowNavigatorItems.find((item) => item.id === workflowSpotlight.zoneId) ?? null
    : null;
  const guideQuickStartCompletionScore = createGuideQuickStartCompletionScore({
    firstBeatPathSummary,
    sessionPassSummary,
    workflowNavigatorItems,
    workflowSpotlight
  });
  const guideQuickStartCompletionBreakdownItems = createGuideQuickStartCompletionBreakdownItems({
    firstBeatPathSummary,
    sessionPassSummary,
    workflowNavigatorItems,
    workflowSpotlight
  });
  const guideQuickStartCompletionBreakdown = guideQuickStartCompletionBreakdownLabel(guideQuickStartCompletionBreakdownItems);
  const guideQuickStartCompletionBottleneckItem = createGuideQuickStartCompletionBottleneckItem(
    guideQuickStartCompletionBreakdownItems
  );
  const guideQuickStartCompletionBottleneck = createGuideQuickStartCompletionBottleneckLabel(guideQuickStartCompletionBreakdownItems);
  const guideQuickStartTarget = activeGuideQuickStartQuickActionTarget({
    completionBottleneck: guideQuickStartCompletionBottleneck,
    completionBreakdown: guideQuickStartCompletionBreakdown,
    completionScore: guideQuickStartCompletionScore,
    firstBeatPathStep,
    firstBeatPathSummary,
    sessionPassCard,
    sessionPassSummary,
    workflowSpotlight,
    workflowSpotlightItem
  });
  const guideQuickStartBottleneckTarget = activeGuideQuickStartBottleneckQuickActionTarget({
    bottleneckItem: guideQuickStartCompletionBottleneckItem,
    completionBottleneck: guideQuickStartCompletionBottleneck,
    completionBreakdown: guideQuickStartCompletionBreakdown,
    firstBeatPathStep,
    firstBeatPathSummary,
    sessionPassCard,
    sessionPassSummary,
    workflowSpotlight,
    workflowSpotlightItem
  });
  const workflowNavigatorActions: QuickAction[] = workflowNavigatorItems.map((item) => ({
    id: `workflow-navigator-${item.id}`,
    title: `Jump Workflow: ${item.label}`,
    detail: `${item.value} / ${item.detail}`,
    group: "Project",
    keywords: `workflow navigator jump ${item.id} ${item.label} ${item.value} ${item.detail} compose arrange mix deliver beginner producer`,
    run: () => onJumpWorkflowZone(item)
  }));
  const deliveryTarget = activeDeliveryTarget(project);
  const deliveryTargetAlignmentPreview = createDeliveryTargetAlignmentPreview(project, deliveryTarget);
  const deliveryTargetAlignReady = !isDeliveryTargetAligned(project, deliveryTarget);
  const deliveryTargetOptions = [...deliveryTargets, deliveryTargetForId("custom", project.customDeliveryTarget)];
  const deliveryTargetActions: QuickAction[] = deliveryTargetOptions.map((target) => {
    const selected = project.deliveryTarget === target.id;
    return {
      id: `delivery-target-set-${target.id}`,
      title: selected ? `${target.name} target selected` : `Set Delivery Target: ${target.name}`,
      detail: `${target.focus} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems / ${arrangementTemplateLabel(
        target.preferredTemplate
      )} / ${target.preferredMasterPreset}`,
      group: "Project",
      keywords: `delivery target set select session goal handoff export ${target.id} ${target.name} ${target.focus} ${target.mixPosture} ${target.preferredTemplate} ${target.preferredMasterPreset} stems beginner producer`,
      disabled: selected,
      run: () => onSelectDeliveryTarget(target.id)
    };
  });
  const midiInputConnectReady = midiCaptureStatus !== "unsupported" && midiCaptureStatus !== "requesting";
  const midiInputConnectTitle =
    midiCaptureStatus === "ready" || midiCaptureStatus === "listening" ? "Refresh MIDI input" : "Connect MIDI input";
  const keyboardCaptureTargetLabel = keyboardCaptureTarget === "bass" ? "808" : "Synth";
  const connectedMidiInputCount = midiInputOptions.filter((input) => input.connected).length;
  const midiInputArmReady =
    midiCaptureStatus !== "unsupported" &&
    midiCaptureStatus !== "requesting" &&
    midiCaptureStatus !== "denied" &&
    connectedMidiInputCount > 0;
  const midiInputArmTitle = midiCaptureArmed ? "Disarm MIDI input" : "Arm MIDI input";
  const activeCaptureDefaults = keyboardCaptureDefaults[keyboardCaptureTarget];
  const [minCaptureOctave, maxCaptureOctave] = trackOctaveRange(keyboardCaptureTarget);
  const shorterCaptureLength = clampStepLength(activeCaptureDefaults.length - 1);
  const longerCaptureLength = clampStepLength(activeCaptureDefaults.length + 1);
  const softerSynthVelocity = clampVelocity(activeCaptureDefaults.velocity - 0.1);
  const louderSynthVelocity = clampVelocity(activeCaptureDefaults.velocity + 0.1);
  const keyboardCaptureToggleTitle = keyboardCaptureEnabled ? "Turn Keyboard Capture off" : "Turn Keyboard Capture on";
  const keyboardCaptureDefaultDetail =
    keyboardCaptureTarget === "melody"
      ? `oct ${activeCaptureDefaults.octave} / len ${activeCaptureDefaults.length} / vel ${percentLabel(activeCaptureDefaults.velocity)}`
      : `oct ${activeCaptureDefaults.octave} / len ${activeCaptureDefaults.length} / vel ${percentLabel(
          activeCaptureDefaults.velocity
        )} / glide ${
          activeCaptureDefaults.glide ? "On" : "Off"
        }`;
  const keyboardCaptureReadoutAction: QuickAction = {
    id: "keyboard-capture-readout-action",
    title: `Review Keyboard Capture: ${keyboardCaptureEnabled ? "Armed" : "Off"}`,
    detail: `${keyboardCaptureEnabled ? "Armed" : "Off"} / Target ${keyboardCaptureTargetLabel} / ${quickActionCaptureStepModeLabel(
      keyboardCaptureStepMode
    )} / ${keyboardCaptureDefaultSummary(keyboardCaptureTarget, activeCaptureDefaults)} / pitch ${keyboardCapturePitchMapSummary(
      project,
      keyboardCaptureTarget,
      activeCaptureDefaults
    )} / MIDI ${midiCaptureSummary.statusLabel} / Pattern ${project.selectedPattern}`,
    group: "Create",
    keywords: `keyboard capture readout review input posture desktop keys degree map target ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} ${quickActionCaptureStepModeLabel(
      keyboardCaptureStepMode
    )} ${keyboardCaptureDefaultDetail} midi ${midiCaptureStatus} ${midiCaptureSummary.statusLabel} pattern ${
      project.selectedPattern
    } beginner producer direct composition sample free`,
    run: onFocusKeyboardCaptureReadout
  };
  const selectedPatternData = activePattern(project);
  const { selectedNoteActive, selectedNoteLabel, selectedNoteActions, selectedDrumActions, selectedChordActions } =
    createSelectedEventQuickActions({
      project,
      selectedPatternData,
      keyboardCaptureDefaults,
      selectedNote,
      noteClipboard,
      selectedDrumStep,
      drumClipboard,
      selectedChord,
      chordClipboard,
      onAuditionSelectedNote,
      onMoveSelectedNoteStep,
      onResetSelectedNoteStep,
      onMoveSelectedNotePitch,
      onResetSelectedNotePitch,
      onMoveSelectedNoteOctave,
      onUpdateSelectedNoteLength,
      onUpdateSelectedNoteGlide,
      onUpdateSelectedNoteVelocity,
      onUpdateSelectedNoteProbability,
      onCopySelectedNote,
      onPasteCopiedNote,
      onDuplicateSelectedNote,
      onDuplicateSelectedNoteToStep,
      onDeleteSelectedNote,
      onMoveSelectedDrumStep,
      onResetSelectedDrumStep,
      onAuditionSelectedDrumHit,
      onUpdateSelectedDrumVelocity,
      onUpdateSelectedDrumProbability,
      onUpdateSelectedDrumTiming,
      onUpdateSelectedHatRepeat,
      onCopySelectedDrumHit,
      onPasteCopiedDrumHit,
      onDuplicateSelectedDrumHit,
      onDuplicateSelectedDrumHitToStep,
      onDeleteSelectedDrumHit,
      onAuditionSelectedChord,
      onMoveSelectedChordStep,
      onUpdateSelectedChordStep,
      onMoveSelectedChordInversion,
      onResetSelectedChordInversion,
      onUpdateSelectedChordRoot,
      onUpdateSelectedChordQuality,
      onUpdateSelectedChordLength,
      onUpdateSelectedChordVelocity,
      onUpdateSelectedChordProbability,
      onCopySelectedChord,
      onPasteCopiedChord,
      onDuplicateSelectedChord,
      onDuplicateSelectedChordToStep,
      onDeleteSelectedChord
    });
  const captureStepSelectedLabel = selectedNote
    ? `${selectedNoteLabel}${selectedNoteActive ? "" : " inactive"}`
    : "No selected note";
  const captureStepPlacementLabel =
    keyboardCaptureStepMode === "replace-selected" && selectedNoteActive && selectedNote?.track === keyboardCaptureTarget
      ? `will replace ${selectedNoteLabel}`
      : keyboardCaptureStepMode === "replace-selected"
        ? `needs selected ${keyboardCaptureTargetLabel} step`
        : `fills next empty ${keyboardCaptureTargetLabel} step`;
  const captureStepModeReadoutAction: QuickAction = {
    id: "capture-step-mode-readout-action",
    title: `Review Capture Step Mode: ${quickActionCaptureStepModeLabel(keyboardCaptureStepMode)}`,
    detail: `${quickActionCaptureStepModeLabel(
      keyboardCaptureStepMode
    )} / Target ${keyboardCaptureTargetLabel} / ${captureStepPlacementLabel} / ${captureStepSelectedLabel} / ${keyboardCaptureDefaultSummary(
      keyboardCaptureTarget,
      activeCaptureDefaults
    )} / Pattern ${project.selectedPattern}`,
    group: "Create",
    keywords: `capture step mode readout review placement input posture next empty replace selected selected step note ${keyboardCaptureStepMode} ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} ${captureStepPlacementLabel} ${captureStepSelectedLabel} ${keyboardCaptureDefaultDetail} midi ${midiCaptureStatus} pattern ${project.selectedPattern} beginner producer direct composition sample free`,
    run: onFocusCaptureStepModeReadout
  };
  const midiInputReadoutAction: QuickAction = {
    id: "midi-input-readout-action",
    title: `Review MIDI Input: ${midiCaptureSummary.statusLabel}`,
    detail: `${midiCaptureSummary.statusLabel} / ${midiCaptureArmed ? "Armed" : "Disarmed"} / ${connectedMidiInputCount}/${
      midiInputOptions.length
    } inputs / selected ${midiSelectedInputLabel} / latest ${midiLastNoteLabel} / Target ${keyboardCaptureTargetLabel} / ${quickActionCaptureStepModeLabel(
      keyboardCaptureStepMode
    )} / ${keyboardCaptureDefaultSummary(keyboardCaptureTarget, activeCaptureDefaults)} / Pattern ${project.selectedPattern}`,
    group: "Create",
    keywords: `midi input readout review controller keyboard web midi permission status ${midiCaptureStatus} ${midiCaptureSummary.statusLabel} armed ${midiCaptureArmed} selected ${midiSelectedInputId} ${midiSelectedInputLabel} latest ${midiLastNoteLabel} target ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} ${keyboardCaptureDefaultDetail} ${quickActionCaptureStepModeLabel(
      keyboardCaptureStepMode
    )} beginner producer direct composition sample free`,
    run: onFocusMidiInputReadout
  };
  const editorAuditionReadoutAction: QuickAction = {
    id: "editor-audition-readout-action",
    title: `Review Editor Audition: ${editorAuditionReadout.statusLabel}`,
    detail: `${editorAuditionReadout.targetLabel} / ${editorAuditionReadout.routeLabel} / ${editorAuditionReadout.metricLabel} ${editorAuditionReadout.metricValue} / ${editorAuditionReadout.runtimeLabel} / Pattern ${project.selectedPattern}`,
    group: "Create",
    keywords: `editor audition readout review selected event one shot listen preview runtime fallback drum 808 bass synth chord ${editorAuditionReadout.statusLabel} ${editorAuditionReadout.targetTypeLabel} ${editorAuditionReadout.targetLabel} ${editorAuditionReadout.keywords} beginner producer direct composition sample free`,
    run: onFocusEditorAuditionReadout
  };
  const captureStepModeActions = createCaptureStepModeActions({
    keyboardCaptureStepMode,
    keyboardCaptureTarget,
    keyboardCaptureTargetLabel,
    selectedPattern: project.selectedPattern,
    selectedNote,
    selectedNoteActive,
    selectedNoteLabel,
    onSetKeyboardCaptureStepMode
  });
  const captureTargetActions: QuickAction[] = [
    { id: "capture-target-bass", target: "bass" as NoteTrack, targetLabel: "808" },
    { id: "capture-target-melody", target: "melody" as NoteTrack, targetLabel: "Synth" }
  ].map(({ id, target, targetLabel }) => {
    return {
      id,
      title: `Set capture target: ${targetLabel}`,
      detail: `${targetLabel} target for Desktop Keyboard Capture and Web MIDI Input / Pattern ${project.selectedPattern}`,
      group: "Create",
      keywords: `capture target keyboard midi input ${target} ${targetLabel} 808 synth notes controller direct composition beginner producer`,
      disabled: keyboardCaptureTarget === target,
      run: () => onSetKeyboardCaptureTarget(target)
    };
  });
  const captureDefaultActions: QuickAction[] = [
    {
      id: "capture-default-octave-down",
      title: "Capture octave down",
      detail: `${keyboardCaptureTargetLabel} octave ${activeCaptureDefaults.octave} -> ${Math.max(
        minCaptureOctave,
        activeCaptureDefaults.octave - 1
      )} / Pattern ${project.selectedPattern}`,
      group: "Create",
      keywords: `capture default octave down lower keyboard midi input notes ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} beginner producer`,
      disabled: activeCaptureDefaults.octave <= minCaptureOctave,
      run: () => onUpdateKeyboardCaptureDefaults({ octave: activeCaptureDefaults.octave - 1 })
    },
    {
      id: "capture-default-octave-up",
      title: "Capture octave up",
      detail: `${keyboardCaptureTargetLabel} octave ${activeCaptureDefaults.octave} -> ${Math.min(
        maxCaptureOctave,
        activeCaptureDefaults.octave + 1
      )} / Pattern ${project.selectedPattern}`,
      group: "Create",
      keywords: `capture default octave up higher keyboard midi input notes ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} beginner producer`,
      disabled: activeCaptureDefaults.octave >= maxCaptureOctave,
      run: () => onUpdateKeyboardCaptureDefaults({ octave: activeCaptureDefaults.octave + 1 })
    },
    {
      id: "capture-default-length-short",
      title: "Shorten capture length",
      detail: `${keyboardCaptureTargetLabel} length ${activeCaptureDefaults.length} -> ${shorterCaptureLength} steps / Pattern ${project.selectedPattern}`,
      group: "Create",
      keywords: `capture default length shorter short keyboard midi input notes ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} beginner producer`,
      disabled: activeCaptureDefaults.length <= 1,
      run: () => onUpdateKeyboardCaptureDefaults({ length: activeCaptureDefaults.length - 1 })
    },
    {
      id: "capture-default-length-long",
      title: "Lengthen capture length",
      detail: `${keyboardCaptureTargetLabel} length ${activeCaptureDefaults.length} -> ${longerCaptureLength} steps / Pattern ${project.selectedPattern}`,
      group: "Create",
      keywords: `capture default length longer long keyboard midi input notes ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} beginner producer`,
      disabled: activeCaptureDefaults.length >= 16,
      run: () => onUpdateKeyboardCaptureDefaults({ length: activeCaptureDefaults.length + 1 })
    },
    {
      id: "capture-default-velocity-down",
      title: "Lower capture velocity",
      detail: `${keyboardCaptureTargetLabel} velocity ${percentLabel(activeCaptureDefaults.velocity)} -> ${percentLabel(
        softerSynthVelocity
      )} / Pattern ${project.selectedPattern}`,
      group: "Create",
      keywords: `capture default velocity lower softer keyboard midi input notes ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} 808 synth beginner producer`,
      disabled: activeCaptureDefaults.velocity <= 0,
      run: () => onUpdateKeyboardCaptureDefaults({ velocity: activeCaptureDefaults.velocity - 0.1 })
    },
    {
      id: "capture-default-velocity-up",
      title: "Raise capture velocity",
      detail: `${keyboardCaptureTargetLabel} velocity ${percentLabel(activeCaptureDefaults.velocity)} -> ${percentLabel(
        louderSynthVelocity
      )} / Pattern ${project.selectedPattern}`,
      group: "Create",
      keywords: `capture default velocity raise louder keyboard midi input notes ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} 808 synth beginner producer`,
      disabled: activeCaptureDefaults.velocity >= 1,
      run: () => onUpdateKeyboardCaptureDefaults({ velocity: activeCaptureDefaults.velocity + 0.1 })
    },
    {
      id: "capture-default-glide-toggle",
      title: activeCaptureDefaults.glide ? "Turn 808 capture glide off" : "Turn 808 capture glide on",
      detail:
        keyboardCaptureTarget === "bass"
          ? `808 captured notes will use glide ${activeCaptureDefaults.glide ? "Off" : "On"} next.`
          : "Switch capture target to 808 to edit glide defaults.",
      group: "Create",
      keywords: "capture default 808 bass glide toggle slide keyboard midi input notes beginner producer",
      disabled: keyboardCaptureTarget !== "bass",
      run: () => onUpdateKeyboardCaptureDefaults({ glide: !activeCaptureDefaults.glide })
    }
  ];
  const selectedBlockEditPrioritySummary = createSelectedBlockEditPrioritySummary(
    project,
    selectedArrangementIndex,
    arrangementBlockClipboard
  );
  const selectedBlockEditDecisionSummary = createSelectedBlockEditPreviewDecision(selectedBlockEditPrioritySummary);
  const selectedBlockActions: QuickAction[] = [
    {
      id: "selected-block-edit-decision",
      title: selectedBlockEditDecisionSummary.disabled
        ? "Run Selected Block Edit Decision"
        : `Run Selected Block Edit Decision: ${selectedBlockEditDecisionSummary.actionLabel}`,
      detail: selectedBlockEditDecisionSummary.disabled
        ? selectedBlockEditDecisionSummary.detailLabel
        : `${selectedBlockEditDecisionSummary.statusLabel} / ${selectedBlockEditDecisionSummary.metricLabel} / ${selectedBlockEditDecisionSummary.detailLabel}`,
      group: "Arrange",
      keywords: `selected block edit decision preview run suggested arrangement song form copy paste duplicate split merge move delete ${selectedBlockEditDecisionSummary.targetActionId} ${selectedBlockEditDecisionSummary.actionLabel} beginner producer`,
      disabled: selectedBlockEditDecisionSummary.disabled,
      run: () => onRunSelectedBlockEditPriority(selectedBlockEditDecisionSummary.targetActionId)
    },
    {
      id: "selected-block-priority-edit",
      title:
        selectedBlockEditPrioritySummary.actionId === "none"
          ? "Run Selected Block Priority"
          : `Run Selected Block Priority: ${selectedBlockEditPrioritySummary.actionLabel}`,
      detail:
        selectedBlockEditPrioritySummary.actionId === "none"
          ? selectedBlockEditPrioritySummary.reasonLabel
          : `${selectedBlockEditPrioritySummary.statusLabel} / ${selectedBlockEditPrioritySummary.scopeLabel} / ${selectedBlockEditPrioritySummary.impactLabel}`,
      group: "Arrange",
      keywords: `selected block priority recommended edit quick action arrangement song form copy paste duplicate split merge move ${selectedBlockEditPrioritySummary.actionId} beginner producer`,
      disabled: selectedBlockEditPrioritySummary.actionId === "none",
      run: () => onRunSelectedBlockEditPriority(selectedBlockEditPrioritySummary.actionId)
    },
    {
      id: "selected-block-copy",
      title: "Copy selected block",
      detail: selectedBlock ? `${selectedBlockLabel} -> local arrangement clipboard` : "Select an arrangement block first.",
      group: "Arrange",
      keywords: "selected block copy clipboard arrangement song form section pattern edit beginner producer",
      disabled: !selectedBlock,
      run: onCopySelectedArrangementBlock
    },
    {
      id: "selected-block-paste",
      title: "Paste copied block after selected",
      detail:
        arrangementBlockClipboard && selectedBlock
          ? `${arrangementBlockClipboardLabel} -> after ${selectedBlockLabel}`
          : arrangementBlockClipboard
            ? "Select an arrangement block before pasting."
            : "Copy an arrangement block first.",
      group: "Arrange",
      keywords: "selected block paste clipboard arrangement song form section pattern after edit beginner producer",
      disabled: !arrangementBlockClipboard || !selectedBlock,
      run: onPasteArrangementBlockAfterSelected
    },
    {
      id: "selected-block-duplicate",
      title: "Duplicate selected block",
      detail: selectedBlock ? `${selectedBlockLabel} -> after block ${selectedBlockNumber}` : "Select an arrangement block first.",
      group: "Arrange",
      keywords: "selected block duplicate arrangement copy song form section pattern edit beginner producer",
      disabled: !selectedBlock,
      run: onDuplicateArrangementBlock
    },
    {
      id: "selected-block-move-left",
      title: "Move selected block left",
      detail: selectedBlock
        ? selectedArrangementIndex > 0
          ? `${selectedBlockLabel} -> position ${selectedArrangementIndex}`
          : `${selectedBlockLabel} is already first.`
        : "Select an arrangement block first.",
      group: "Arrange",
      keywords: "selected block move left earlier reorder arrangement song form edit beginner producer",
      disabled: !selectedBlock || selectedArrangementIndex <= 0,
      run: () => onMoveArrangementBlock(-1)
    },
    {
      id: "selected-block-move-right",
      title: "Move selected block right",
      detail: selectedBlock
        ? selectedArrangementIndex < project.arrangement.length - 1
          ? `${selectedBlockLabel} -> position ${selectedArrangementIndex + 2}`
          : `${selectedBlockLabel} is already last.`
        : "Select an arrangement block first.",
      group: "Arrange",
      keywords: "selected block move right later reorder arrangement song form edit beginner producer",
      disabled: !selectedBlock || selectedArrangementIndex >= project.arrangement.length - 1,
      run: () => onMoveArrangementBlock(1)
    },
    {
      id: "selected-block-split",
      title: "Split selected block",
      detail:
        selectedBlock && selectedBlockBars > 1
          ? `${selectedBlockLabel} / ${selectedBlockSplitAfter}+${selectedBlockBars - selectedBlockSplitAfter} bars`
          : selectedBlock
            ? `${selectedBlockLabel} needs 2+ bars.`
            : "Select an arrangement block first.",
      group: "Arrange",
      keywords: "selected block split arrangement bars section pattern song form edit beginner producer",
      disabled: !selectedBlock || selectedBlockBars <= 1,
      run: onSplitArrangementBlock
    },
    {
      id: "selected-block-merge",
      title: "Merge selected block with next",
      detail:
        selectedBlock && nextArrangementBlock
          ? canMergeSelectedBlock
            ? `${selectedBlockLabel} + ${nextArrangementBlock.section} Pattern ${nextArrangementBlock.pattern} / ${barCountLabel(
                selectedBlockBars + nextArrangementBlockBars
              )}`
            : `${selectedBlockLabel} + next block exceeds ${maxArrangementBars} bars.`
          : selectedBlock
            ? `${selectedBlockLabel} has no next block.`
            : "Select an arrangement block first.",
      group: "Arrange",
      keywords: "selected block merge next arrangement bars section pattern song form edit beginner producer",
      disabled: !canMergeSelectedBlock,
      run: onMergeArrangementBlock
    },
    {
      id: "selected-block-delete",
      title: "Delete selected block",
      detail:
        selectedBlock && project.arrangement.length > 1
          ? `${selectedBlockLabel} / ${project.arrangement.length - 1} blocks remain`
          : selectedBlock
            ? "Arrangement needs at least one block."
            : "Select an arrangement block first.",
      group: "Arrange",
      keywords: "selected block delete remove arrangement song form section pattern edit beginner producer",
      disabled: !selectedBlock || project.arrangement.length <= 1,
      run: onDeleteArrangementBlock
    }
  ];
  const arrangementMovePreset = selectedArrangementMoveQuickActionPreset(selectedBlock);
  const arrangementMoveQuickActionPrioritySummary = createArrangementMovePrioritySummary(
    selectedBlock,
    selectedArrangementIndex,
    project.arrangement.length
  );
  const arrangementMoveDecisionSummary = createArrangementMovePreviewDecision(arrangementMoveQuickActionPrioritySummary);
  const arrangementMoveReady = Boolean(
    selectedBlock && arrangementMovePreset && !isArrangementMovePresetApplied(selectedBlock, arrangementMovePreset)
  );
  const arrangementMoveLabel = arrangementMovePreset ? arrangementMovePresetLabel(arrangementMovePreset) : "Arrangement Move";
  const arrangementMoveBlockNumber = selectedBlock ? Math.min(selectedArrangementIndex + 1, project.arrangement.length) : 0;
  const arrangementTemplateDecision = createArrangementTemplatePreviewDecision(arrangementTemplatePreviewSummary);
  const arrangementTemplateId =
    arrangementTemplateDecision.templateId === "aligned" ? null : arrangementTemplateDecision.templateId;
  const arrangementFocusSummary = createArrangementFocusSummary(project, selectedArrangementIndex);
  const arrangementFocusPreviewSummary = createArrangementFocusPreviewSummary(
    project,
    selectedArrangementIndex,
    arrangementFocusSummary
  );
  const arrangementFocusDecisionSummary = arrangementFocusPreviewSummary
    ? createArrangementFocusPreviewDecision(arrangementFocusPreviewSummary)
    : null;
  const arrangementFocusReady = Boolean(arrangementFocusPreviewSummary && arrangementFocusPreviewSummary.statusLabel !== "Focus aligned");
  const arrangementMuteMapLane = activeArrangementMuteMapQuickActionLane(arrangementMuteMapSummary);
  const arrangementMuteMapActions: QuickAction[] = arrangementMuteMapSummary.lanes.map((lane) => ({
    id: `arrangement-mute-map-lane-${lane.id}`,
    title: `Focus Arrangement Mute Map: ${lane.label}`,
    detail: `${lane.value} / ${lane.status} / ${lane.detail}`,
    group: "Arrange",
    keywords: `arrangement mute map lane focus layer section drop build space ${lane.id} ${lane.label} ${lane.status} ${lane.detail} beginner producer`,
    run: () => onFocusArrangementMuteMap(lane)
  }));
  const arrangementTransition = activeArrangementTransitionMapQuickActionTransition(arrangementTransitionMapSummary);
  const arrangementTransitionMapActions: QuickAction[] = arrangementTransitionMapSummary.transitions.map((transition) => ({
    id: `arrangement-transition-map-transition-${transition.id}`,
    title: `Focus Arrangement Transition: ${transition.value}`,
    detail: `${transition.status} / ${transition.energyLabel} / ${transition.patternLabel} / ${transition.muteLabel}`,
    group: "Arrange",
    keywords: `arrangement transition map focus handoff section pattern energy mute drop build turn ${transition.fromSection} ${transition.toSection} ${transition.fromPattern} ${transition.toPattern} ${transition.status} beginner producer`,
    run: () => onFocusArrangementTransitionMap(transition)
  }));
  const arrangementTransitionLoopActions: QuickAction[] = arrangementTransitionMapSummary.transitions.map((transition) => {
    const target = createArrangementTransitionLoopTarget(project, arrangementTransitionMapSummary, transition.id, transition.fromIndex);
    return {
      id: `transition-loop-cue-${transition.id}`,
      title: `Cue Transition Loop: ${transition.value}`,
      detail: target ? arrangementTransitionLoopDetail(target) : "Transition loop unavailable.",
      group: "Transport",
      keywords: `transition loop cue audition arrangement handoff turn drop build ${transition.fromSection} ${transition.toSection} ${transition.fromPattern} ${transition.toPattern} ${transition.status} beginner producer`,
      disabled: isPlaying || !target,
      run: () => onCueArrangementTransition(transition)
    };
  });
  const arrangementArcReady = arrangementArcPreviewSummary.statusLabel !== "Arc aligned";
  const arrangementArcDecisionSummary = createArrangementArcPreviewDecision(arrangementArcPreviewSummary);
  const arrangementTemplateActions: QuickAction[] = arrangementTemplateIds.map((template) => {
    const targetArrangement = createArrangementTemplate(template);
    const changedBlocks = arrangementTemplateChangedBlockCount(project.arrangement, targetArrangement);
    const changedFields = arrangementTemplateChangedFieldCount(project.arrangement, targetArrangement);
    const aligned = changedFields === 0;
    const templateLabel = arrangementTemplateLabel(template);
    return {
      id: `arrangement-template-direct-${template}`,
      title: aligned ? `${templateLabel} Template already applied` : `Apply ${templateLabel} Template`,
      detail: `${arrangementTemplatePreviewSectionLabel(targetArrangement)} / ${arrangementArcPreviewPatternLabel(
        targetArrangement
      )} / ${changedBlocks} block${changedBlocks === 1 ? "" : "s"} / ${changedFields} field${changedFields === 1 ? "" : "s"}`,
      group: "Arrange",
      keywords: `arrangement template direct song form 8 bar loop full beat hook first breakdown structure ${template} ${templateLabel} beginner producer`,
      disabled: aligned,
      run: () => {
        if (!aligned) {
          onApplyArrangementTemplate(template);
        }
      }
    };
  });
  const arrangementArcPadActions: QuickAction[] = arrangementArcPadOptions.map((pad) => ({
    id: `arrangement-arc-pad-${pad.id}`,
    title: pad.changedCount > 0 ? `Apply ${pad.label} Arc` : `${pad.label} Arc already applied`,
    detail: `${pad.preview} / ${pad.detail} / ${pad.changedCount} block move${pad.changedCount === 1 ? "" : "s"}`,
    group: "Arrange",
    keywords: `arrangement arc direct pad energy song form dynamics hook lift break rise sections mutes ${pad.id} ${pad.label} ${pad.detail} ${pad.preview} beginner producer`,
    disabled: pad.changedCount === 0,
    run: () => {
      if (pad.changedCount > 0) {
        onApplyArrangementArc(pad.id);
      }
    }
  }));
  const arrangementFocusPresetActions: QuickAction[] = arrangementFocusPresets.map((preset) => {
    const changedFields = selectedBlock ? arrangementFocusChangedFieldCount(selectedBlock, preset) : 0;
    const aligned = Boolean(selectedBlock) && changedFields === 0;
    return {
      id: `arrangement-focus-preset-${preset.id}`,
      title: !selectedBlock
        ? `Apply ${preset.label} Focus`
        : aligned
          ? `${preset.label} Focus already applied`
          : `Apply ${preset.label} Focus`,
      detail: selectedBlock
        ? `${selectedBlockLabel} -> ${preset.section} / Pattern ${preset.pattern} / ${barCountLabel(preset.bars)} / ${percentLabel(
            preset.energy
          )} energy / ${arrangementFocusPreviewMuteLabel(preset.mutedTracks)} / ${changedFields} field${
            changedFields === 1 ? "" : "s"
          }`
        : "Select an arrangement block first.",
      group: "Arrange",
      keywords: `arrangement focus direct preset selected block section pattern energy mutes intro verse hook bridge outro ${preset.id} ${preset.label} ${preset.detail} beginner producer`,
      disabled: !selectedBlock || aligned,
      run: () => {
        if (selectedBlock && !aligned) {
          onApplyArrangementFocus(preset.id);
        }
      }
    };
  });
  const drumKitReady = drumKitPreviewSummary.statusLabel !== "Kit aligned";
  const mixBalanceReady = mixBalancePreviewSummary.changedControls > 0;
  const masterAutomationSuggestedPad =
    masterAutomationPadOptions.find((pad) => pad.id === masterAutomationPreviewSummary.padId) ?? masterAutomationPadOptions[0];
  const masterAutomationReady = masterAutomationPreviewSummary.changedEvents > 0;
  const masterFinishReady = masterFinishPreviewSummary.changedMoves > 0;
  const spaceFxReady = spaceFxPreviewSummary.changedSends > 0;
  const spaceFxReadoutAction: QuickAction = {
    id: "space-fx-readout-action",
    title: `Review Space FX: ${spaceFxPreviewSummary.padLabel}`,
    detail: `${spaceFxPreviewSummary.statusLabel} / ${spaceFxPreviewSummary.sendLabel} / ${spaceFxPreviewSummary.focusLabel} / ${spaceFxPreviewSummary.changeLabel}`,
    group: "Mix",
    keywords: `Quick Actions Space FX Readout review dry room wide wash send ambience reverb preview apply posture drums 808 synth chords ${
      spaceFxPreviewSummary.padId
    } ${spaceFxPreviewSummary.padLabel} ${spaceFxPreviewSummary.statusLabel} ${spaceFxPreviewSummary.sendLabel} ${
      spaceFxPreviewSummary.focusLabel
    } beginner producer manual space sliders`,
    run: onFocusSpaceFxReadout
  };
  const mixBalancePadActions: QuickAction[] = mixBalancePadOptions.map((pad) => ({
    id: `mix-balance-pad-${pad.id}`,
    title: pad.changedCount > 0 ? `Apply ${pad.label} Mix Balance` : `${pad.label} Mix Balance already applied`,
    detail:
      pad.changedCount > 0
        ? `${pad.preview} / ${mixBalancePreviewChannelLabel(pad)} / ${pad.changedCount} channel${
            pad.changedCount === 1 ? "" : "s"
          }`
        : `${pad.label} already matches the current mixer posture.`,
    group: "Mix",
    keywords: `mix balance direct pad rough levels drums 808 bass synth chords stem audition ${pad.id} ${pad.label} ${pad.detail} ${pad.preview} beginner producer`,
    disabled: pad.changedCount === 0,
    run: () => {
      if (pad.changedCount > 0) {
        onApplyMixBalance(pad.id);
      }
    }
  }));
  const patternStackId =
    patternStackPreviewSummary.stackId === "none" || patternStackPreviewSummary.statusLabel === "Stack aligned"
      ? null
      : patternStackPreviewSummary.stackId;
  const patternStackActions: QuickAction[] = patternStackOptions.map((stack) => {
    const moves = patternStackMoveCount(project.key, selectedPatternData, stack);
    const aligned = moves.total === 0;
    return {
      id: `pattern-stack-pad-${stack.id}`,
      title: aligned ? `${stack.label} stack already applied` : `Apply ${stack.label} stack`,
      detail: `${stack.preview} / ${stack.bassCount} 808 / ${stack.chordCount} chords / ${stack.melodyCount} synth / B ${moves.bass} / C ${moves.chord} / S ${moves.melody}`,
      group: "Create",
      keywords: `pattern stack direct pad 808 bass chords synth melody sketch harmony ${stack.id} ${stack.label} ${stack.detail} ${stack.preview} beginner producer`,
      disabled: aligned,
      run: () => {
        if (!aligned) {
          onApplyPatternStack(stack.id);
        }
      }
    };
  });
  const soundFocusReady = soundFocusPreviewSummary.changedMoves > 0;
  const soundPresetReady = soundPresetPreviewSummary.statusLabel !== "Preset aligned";
  const studioToneDriftTarget = studioToneDrift.resetTarget;
  const studioToneResetActions: QuickAction[] = studioToneControls.map((control) => {
    const currentPercent = Math.round(project.sound[control.parameter] * 100);
    const baselinePercent = Math.round(studioToneBaseline.sound[control.parameter] * 100);
    const deltaPercent = currentPercent - baselinePercent;
    const deltaLabel = deltaPercent === 0 ? "Delta 0" : `Delta ${deltaPercent > 0 ? "+" : ""}${deltaPercent}`;
    const disabled = deltaPercent === 0;
    const target: StudioToneDriftResetTarget = {
      id: control.id,
      label: control.label,
      parameter: control.parameter,
      beforeValue: project.sound[control.parameter],
      baselineValue: studioToneBaseline.sound[control.parameter],
      deltaLabel
    };

    return {
      id: `studio-tone-reset-${control.id}`,
      title: disabled ? `${control.label} matches Studio Tone baseline` : `Reset Studio Tone ${control.label}`,
      detail: `${percentLabel(project.sound[control.parameter])} -> ${percentLabel(
        studioToneBaseline.sound[control.parameter]
      )} / ${deltaLabel} / ${studioToneBaseline.sourceLabel}`,
      group: "Create",
      keywords: `studio tone reset direct baseline drift sound design ${control.id} ${control.label} ${deltaLabel} ${studioToneBaseline.sourceLabel} drums 808 bass synth chords beginner producer`,
      disabled,
      run: () => {
        if (!disabled) {
          onResetStudioToneControl(target);
        }
      }
    };
  });
  const directDrumKitPadOptions = createDrumKitPadOptions(project);
  const directSoundFocusPadOptions = createSoundFocusPadOptions(project.sound);
  const soundPresetActions: QuickAction[] = soundPresetIds.map((preset) => {
    const targetSound = soundPresetDesign(preset);
    const moveCount = soundPresetChangedMoveCount(project.sound, targetSound);
    const presetLabel = soundPresetLabel(preset);
    return {
      id: `sound-preset-pad-${preset}`,
      title: moveCount > 0 ? `Apply ${presetLabel} Sound Preset` : `${presetLabel} Sound Preset already applied`,
      detail: `${soundPresetToneLabel(targetSound)} / ${moveCount} tone move${moveCount === 1 ? "" : "s"}`,
      group: "Create",
      keywords: `sound preset direct pad full tone design ${preset} ${presetLabel} drums 808 bass duck synth chords sample free beginner producer`,
      disabled: moveCount === 0,
      run: () => {
        if (moveCount > 0) {
          onApplySoundPreset(preset);
        }
      }
    };
  });
  const drumKitPadActions: QuickAction[] = directDrumKitPadOptions.map((pad) => ({
    id: `drum-kit-pad-${pad.id}`,
    title: pad.changedCount > 0 ? `Apply ${pad.label} Drum Kit` : `${pad.label} Drum Kit already applied`,
    detail: `${pad.preview} / ${pad.changedCount} kit move${pad.changedCount === 1 ? "" : "s"}`,
    group: "Create",
    keywords: `drum kit direct pad tone kick clap snare hat rack ${pad.id} ${pad.label} ${pad.detail} ${pad.preview} beginner producer`,
    disabled: pad.changedCount === 0,
    run: () => {
      if (pad.changedCount > 0) {
        onApplyDrumKit(pad.id);
      }
    }
  }));
  const soundFocusPadActions: QuickAction[] = directSoundFocusPadOptions.map((pad) => ({
    id: `sound-focus-pad-${pad.id}`,
    title: pad.changedCount > 0 ? `Apply ${pad.label} Sound Focus` : `${pad.label} Sound Focus already applied`,
    detail: `${pad.preview} / ${pad.changedCount} tone move${pad.changedCount === 1 ? "" : "s"}`,
    group: "Create",
    keywords: `sound focus direct pad tone design kick drums 808 bass duck sidechain synth chords ${pad.id} ${pad.label} ${pad.detail} ${pad.preview} beginner producer`,
    disabled: pad.changedCount === 0,
    run: () => {
      if (pad.changedCount > 0) {
        onApplySoundFocus(pad.id);
      }
    }
  }));
  const soundSnapshotDecisionAction: QuickAction = {
    id: "sound-snapshot-decision",
    title: `Run Sound Snapshot Decision: ${soundSnapshotComparison.actionLabel}`,
    detail: `${soundSnapshotComparison.statusLabel} / ${soundSnapshotComparison.winnerLabel} / ${soundSnapshotComparison.detailLabel}`,
    group: "Create",
    keywords: `Quick Actions Sound Snapshot Decision decision readout capture recall compare tone timbre preset drums 808 synth chords ${
      soundSnapshotComparison.actionId
    } ${soundSnapshotComparison.actionLabel} beginner producer`,
    run: () => {
      switch (soundSnapshotComparison.actionId) {
        case "capture-a":
          onCaptureSoundSnapshot("A");
          return;
        case "capture-b":
          onCaptureSoundSnapshot("B");
          return;
        case "recall-a":
          onRecallSoundSnapshot("A");
          return;
        case "recall-b":
          onRecallSoundSnapshot("B");
          return;
      }
    }
  };
  const soundSnapshotActions: QuickAction[] = [
    {
      id: "sound-snapshot-readout-action",
      title: `Review Sound Snapshot A/B: ${soundSnapshotComparison.actionLabel}`,
      detail: `${soundSnapshotComparison.statusLabel} / ${soundSnapshotComparison.winnerLabel} / ${soundSnapshotComparison.detailLabel}`,
      group: "Create",
      keywords: `Quick Actions Sound Snapshot A/B Readout review compare tone pass capture recall guidance preset drums 808 synth chords ${
        soundSnapshotComparison.actionId
      } ${soundSnapshotComparison.actionLabel} ${soundSnapshotComparison.statusLabel} beginner producer`,
      run: onFocusSoundSnapshotReadout
    },
    soundSnapshotDecisionAction,
    {
      id: "sound-snapshot-capture-a",
      title: "Capture Sound Snapshot A",
      detail: soundSnapshots.A
        ? `Replace A / ${soundSnapshots.A.timbreLabel} / ${soundSnapshots.A.spreadLabel}`
        : "Capture current sound into A for tone comparison.",
      group: "Create",
      keywords: "sound snapshot capture a ab compare tone timbre preset drums 808 synth chords beginner producer",
      run: () => onCaptureSoundSnapshot("A")
    },
    {
      id: "sound-snapshot-capture-b",
      title: "Capture Sound Snapshot B",
      detail: soundSnapshots.B
        ? `Replace B / ${soundSnapshots.B.timbreLabel} / ${soundSnapshots.B.spreadLabel}`
        : "Capture current sound into B for tone comparison.",
      group: "Create",
      keywords: "sound snapshot capture b ab compare tone timbre preset drums 808 synth chords beginner producer",
      run: () => onCaptureSoundSnapshot("B")
    },
    {
      id: "sound-snapshot-recall-a",
      title: "Recall Sound Snapshot A",
      detail: soundSnapshots.A ? `Apply A / ${soundSnapshots.A.presetLabel} / ${soundSnapshots.A.timbreLabel}` : "Capture A before recalling a sound pass.",
      group: "Create",
      keywords: "sound snapshot recall restore apply a ab compare tone timbre preset drums 808 synth chords beginner producer",
      disabled: !soundSnapshots.A,
      run: () => onRecallSoundSnapshot("A")
    },
    {
      id: "sound-snapshot-recall-b",
      title: "Recall Sound Snapshot B",
      detail: soundSnapshots.B ? `Apply B / ${soundSnapshots.B.presetLabel} / ${soundSnapshots.B.timbreLabel}` : "Capture B before recalling a sound pass.",
      group: "Create",
      keywords: "sound snapshot recall restore apply b ab compare tone timbre preset drums 808 synth chords beginner producer",
      disabled: !soundSnapshots.B,
      run: () => onRecallSoundSnapshot("B")
    },
    {
      id: "sound-snapshot-clear",
      title: "Clear Sound Snapshot A/B",
      detail:
        soundSnapshots.A || soundSnapshots.B
          ? `${soundSnapshots.A ? "A held" : "A empty"} / ${soundSnapshots.B ? "B held" : "B empty"}`
          : "Sound Snapshot A/B already clear.",
      group: "Create",
      keywords: "sound snapshot clear reset ab compare tone timbre preset drums 808 synth chords beginner producer",
      disabled: !soundSnapshots.A && !soundSnapshots.B,
      run: onClearSoundSnapshots
    }
  ];
  const handoffPackItems = createHandoffPackItems({
    analysis: exportAnalysis,
    project,
    stemAnalyses,
    onExportHandoffSheet,
    onExportMidi,
    onExportStems,
    onExportWav
  });
  const handoffReadyCount = handoffPackItems.filter((item) => item.tone === "good").length;
  const handoffTone = weakestTone(handoffPackItems.map((item) => item.tone));
  const handoffRouteSummary = createHandoffPackRouteSummary(project, stemAnalyses, handoffPackItems, handoffTone);
  const handoffSendOrder = createHandoffPackSendOrderSummary(project, handoffPackItems);
  const handoffReceipt = handoffExportReceipt ?? emptyHandoffExportReceipt();
  const handoffFileManifest = createHandoffFileManifest(project, stemAnalyses, handoffPackItems);
  const handoffManifestAudit = createHandoffManifestAudit(
    project,
    handoffPackItems,
    handoffFileManifest,
    handoffReceipt,
    handoffSendOrder
  );
  const nextHandoffItem = handoffSendOrder.nextItemId
    ? (handoffPackItems.find((item) => item.id === handoffSendOrder.nextItemId) ?? null)
    : null;
  const handoffExportFormatSummary = createHandoffExportFormatSummary(project, exportAnalysis, stemAnalyses, handoffPackItems);
  const handoffExportFormatMetric = handoffExportFormatFocusMetric(handoffExportFormatSummary);
  const handoffExportFormatActions: QuickAction[] = handoffExportFormatSummary.metrics.map((metric) => ({
    id: `handoff-export-format-${metric.id}`,
    title: `Focus Export Format: ${metric.label}`,
    detail: `${metric.value} / ${metric.detail}`,
    group: "Export",
    keywords: `handoff export format focus metric deliverable ${metric.id} ${metric.label} ${metric.value} ${metric.detail} wav stems midi sheet beginner producer`,
    run: () => onFocusHandoffExportFormat(metric)
  }));
  const handoffPackageCheckCard = activeHandoffPackageCheckQuickActionCard(handoffPackageCheckSummary);
  const handoffSendOrderCard =
    handoffPackageCheckSummary.cards.find((card) => card.focusId === "order") ?? null;
  const handoffExportReceiptCard =
    handoffPackageCheckSummary.cards.find((card) => card.focusId === "receipt") ?? null;
  const handoffPackageCheckActions: QuickAction[] = handoffPackageCheckSummary.cards.map((card) => ({
    id: `handoff-package-check-card-${card.id}`,
    title: `Focus Handoff Package: ${card.label}`,
    detail: `${card.value} / ${card.status} / ${card.detail}`,
    group: "Export",
    keywords: `handoff package check focus card send files order receipt context archive ${card.id} ${card.label} ${card.value} ${card.status} ${card.detail} beginner producer`,
    run: () => onFocusHandoffPackageCheck(card)
  }));
  const tempoNudgeActions: QuickAction[] = tempoNudgePads.map((pad) => {
    const nextBpm = tempoNudgePadBpm(project.bpm, pad.id);
    return {
      id: `tempo-nudge-${pad.id}`,
      title: pad.title,
      detail: `${project.bpm} BPM -> ${nextBpm} BPM / resets Tap Tempo`,
      group: "Transport",
      keywords: `tempo bpm nudge ${pad.id} ${pad.label} ${nextBpm} half double slower faster transport beginner producer`,
      run: () => onApplyTempoNudge(pad)
    };
  });
  const swingFeelActions: QuickAction[] = swingFeelPads.map((pad) => {
    const targetSwing = swingFeelPadSwing(pad, project);
    const currentSwing = normalizeSwingFeelValue(project.swing);
    const selected = currentSwing === targetSwing;
    const detail = `${percentLabel(currentSwing)} -> ${percentLabel(targetSwing)} / ${swingFeelPadDetail(pad, project)}`;
    return {
      id: `swing-feel-${pad.id}`,
      title: selected ? `${pad.label} Swing Feel selected` : `Apply ${pad.label} Swing Feel`,
      detail,
      group: "Transport",
      keywords: `swing feel groove timing shuffle pocket ${pad.id} ${pad.label} ${pad.detail} ${percentLabel(
        targetSwing
      )} style beginner producer`,
      disabled: selected,
      run: () => onApplySwingFeel(pad.id)
    };
  });
  const sectionLocatorActions: QuickAction[] = sectionLocatorPads.map((pad) => {
    const selected = pad.selected && transportLoopScope === "block";
    const missing = pad.index === null;
    const rangeLabel =
      pad.startBar === null || pad.endBar === null
        ? "Missing"
        : pad.startBar === pad.endBar
          ? `Bar ${pad.startBar}`
          : `Bars ${pad.startBar}-${pad.endBar}`;
    return {
      id: `section-locator-${sectionLocatorTestId(pad.section)}`,
      title: missing
        ? `Cue ${pad.section} section unavailable`
        : selected
          ? `${pad.section} block already cued`
          : `Cue ${pad.section} section`,
      detail: missing
        ? `${pad.section} is not in the arrangement.`
        : isPlaying
          ? "Stop playback before cueing a section."
          : `Block ${pad.index === null ? "?" : pad.index + 1} / Pattern ${pad.pattern} / ${rangeLabel} / ${pad.eventCount} events`,
      group: "Transport",
      keywords: `section locator cue ${pad.section} ${sectionLocatorTestId(
        pad.section
      )} arrangement block loop transport intro verse hook bridge outro audition beginner producer`,
      disabled: isPlaying || missing,
      run: () => onCueSectionLocator(pad.section)
    };
  });
  const sectionLocatorCueDecision = createSectionLocatorCueDecisionSummary(sectionLocatorPads, isPlaying);
  const keyQuickActions: QuickAction[] = keys.map((key) => {
    const selected = key === project.key;
    const keySlug = key.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return {
      id: `key-quick-${keySlug}`,
      title: `${selected ? "Reapply" : "Retarget to"} ${key}`,
      detail: selected
        ? `${key} is the current key / Pattern A/B/C stays editable`
        : `${project.key} -> ${key} / retarget Pattern A/B/C notes and chord roots`,
      group: "Create",
      keywords: `key retarget transpose scale harmony 808 bass melody chords ${key} ${keySlug} ${selected ? "current" : "change"} beginner producer`,
      run: () => onApplyProjectKey(key)
    };
  });
  const keyRetargetReadoutAction: QuickAction = {
    id: "key-retarget-readout-action",
    title: `Review Key Retarget: ${project.key}`,
    detail: `Current ${project.key} / ${keyRetargetOptionSummary(project.key)} / ${keyRetargetPatternSummary(
      project
    )} / Pattern ${project.selectedPattern}`,
    group: "Create",
    keywords: `key retarget readout transpose scale harmony 808 bass melody chords current ${project.key} options ${keys.join(
      " "
    )} ${keyRetargetPatternSummary(project)} Pattern ${project.selectedPattern} beginner producer direct beat workstation`,
    run: onFocusKeyRetargetReadout
  };
  const styleQuickActions: QuickAction[] = styleProfiles.map((profile) => {
    const selected = profile.id === project.styleId;
    return {
      id: `style-quick-${profile.id}`,
      title: `${selected ? "Reapply" : "Apply"} ${profile.name} style`,
      detail: `${profile.defaultBpm} BPM / ${percentLabel(profile.defaultSwing)} swing / ${bassStyleRoleLabel(
        profile.bassStyle
      )} / ${melodyStyleRoleLabel(profile.melodyStyle)}`,
      group: "Create",
      keywords: `style genre groove quick pick ${profile.name} ${profile.id} ${profile.bassStyle} ${profile.melodyStyle} ${styleSoundPreset(
        profile.id
      )} bpm swing all genre sample free beginner producer`,
      run: () => onSelectStyle(profile.id)
    };
  });
  const styleDirectionReadoutAction: QuickAction = {
    id: "style-direction-readout-action",
    title: `Review Style Direction: ${currentStyleName}`,
    detail: `${styleDirectionCurrentSummary(project)} / ${styleDirectionTargetSummary(
      project.styleId
    )} / loop ${transportLoopLabel(transportLoopScope)} / Pattern ${project.selectedPattern}`,
    group: "Create",
    keywords: `style direction readout genre quick picks current ${currentStyleName} options ${styleProfiles
      .map((profile) => `${profile.name} ${profile.id} ${profile.bassStyle} ${profile.melodyStyle}`)
      .join(" ")} ${styleDirectionPatternSummary(project)} beginner producer direct beat workstation sample free`,
    run: onFocusStyleDirectionReadout
  };
  const patternCueActions: QuickAction[] = patternSlots.map((pattern) => {
    const cued = pattern === project.selectedPattern && transportLoopScope === "pattern";
    const eventCount = patternEventTotal(project.patterns[pattern]);
    return {
      id: `pattern-cue-${pattern.toLowerCase()}`,
      title: cued ? `Pattern ${pattern} loop already cued` : `Cue Pattern ${pattern} loop`,
      detail: cued
        ? `Pattern ${pattern} loop scope / ${eventCount} events`
        : `Pattern ${pattern} / ${eventCount} events / prepares Pattern loop`,
      group: "Transport",
      keywords: `pattern cue preview audition loop transport compare ${pattern} a b c variation listen beginner producer`,
      run: () => onCuePattern(pattern)
    };
  });
  const patternCompareDecisionAction: QuickAction = {
    id: "pattern-compare-decision",
    title:
      patternCompareDecisionSummary.action === "use"
        ? `Use recommended Pattern ${patternCompareDecisionSummary.target}`
        : `Cue recommended Pattern ${patternCompareDecisionSummary.target}`,
    detail: `${patternCompareDecisionSummary.statusLabel} / ${patternCompareDecisionSummary.detailLabel} / ${patternCompareDecisionSummary.metricLabel}`,
    group: patternCompareDecisionSummary.action === "use" ? "Arrange" : "Transport",
    keywords: `pattern compare decision recommended current ${patternCompareDecisionSummary.action} ${patternCompareDecisionSummary.target} ${patternCompareDecisionSummary.statusLabel} ${patternCompareDecisionSummary.actionLabel} a b c cue use arrangement selected block audition beginner producer`,
    disabled: patternCompareDecisionSummary.action === "use" && !selectedBlock,
    run: () => onRunPatternCompareDecision(patternCompareDecisionSummary.action, patternCompareDecisionSummary.target)
  };
  const patternSwitchActions: QuickAction[] = patternSlots.map((pattern) => {
    const selected = pattern === project.selectedPattern;
    const eventCount = patternEventTotal(project.patterns[pattern]);
    return {
      id: `pattern-switch-${pattern.toLowerCase()}`,
      title: selected ? `Refocus Pattern ${pattern}` : `Switch to Pattern ${pattern}`,
      detail: selected
        ? `Pattern ${pattern} is the current edit focus / ${eventCount} events`
        : `Pattern ${pattern} / ${eventCount} events / changes edit focus only`,
      group: "Create",
      keywords: `pattern switch select focus edit variation ${pattern} a b c loop compose arrange compare beginner producer`,
      run: () => onSelectPattern(pattern)
    };
  });
  const patternPlaybackDetailLabel = patternPlaybackReadout.detailLabel.split(" / ").join(" + ");
  const patternPlaybackReadoutAction: QuickAction = {
    id: "pattern-playback-readout-action",
    title: `Review Pattern Playback: ${patternPlaybackReadout.roleLabel}`,
    detail: `${patternPlaybackReadout.statusLabel} / ${patternPlaybackReadout.roleLabel} / ${patternPlaybackDetailLabel} / ${
      transportLoopLabel(transportLoopScope)
    } loop / Pattern ${project.selectedPattern} / ${project.bpm} BPM`,
    group: "Create",
    keywords: `pattern playback readout edit heard audible hearing selected current ${
      playingPattern ?? "idle"
    } ${project.selectedPattern} ${patternPlaybackReadout.statusLabel} ${patternPlaybackReadout.roleLabel} ${
      patternPlaybackDetailLabel
    } ${transportLoopScope} beginner producer direct beat workstation`,
    run: onFocusPatternPlaybackReadout
  };
  const audiblePatternFollowTarget = playingPattern && playingPattern !== project.selectedPattern ? playingPattern : null;
  const audiblePatternFollowAction: QuickAction = {
    id: "pattern-follow-audible",
    title: audiblePatternFollowTarget
      ? `Edit audible Pattern ${audiblePatternFollowTarget}`
      : playingPattern
        ? `Already editing audible Pattern ${project.selectedPattern}`
        : "Edit audible Pattern",
    detail: audiblePatternFollowTarget
      ? `Hearing Pattern ${audiblePatternFollowTarget} while editing Pattern ${project.selectedPattern} / changes edit focus only`
      : playingPattern
        ? `Editing and hearing Pattern ${project.selectedPattern} already match.`
        : "Play Song or Block with another Pattern before following the audible Pattern.",
    group: "Create",
    keywords: `pattern audible follow heard hearing playing edit focus playback readout ${playingPattern ?? "none"} ${project.selectedPattern} a b c beginner producer`,
    disabled: !audiblePatternFollowTarget,
    run: onFollowAudiblePattern
  };
  const patternUseReadoutTarget =
    patternCompareDecisionSummary.action === "use" ? patternCompareDecisionSummary.target : project.selectedPattern;
  const patternUseReadoutEventCount = patternEventTotal(project.patterns[patternUseReadoutTarget]);
  const patternUseReadoutPlacement = patternUseSelectedBlockPlacement(
    project,
    selectedArrangementIndex,
    patternUseReadoutTarget
  );
  const patternUseReadoutAction: QuickAction = {
    id: "pattern-use-readout-action",
    title: `Review Pattern Use Readout: Pattern ${patternUseReadoutTarget}`,
    detail: `${patternCompareDecisionSummary.statusLabel} / ${patternUseReadoutPlacement} / ${patternUseReadoutEventCount} events / edit Pattern ${project.selectedPattern}`,
    group: "Arrange",
    keywords: `Quick Actions Pattern Use Readout review selected block placement assignment Pattern ${patternUseReadoutTarget} current edit Pattern ${project.selectedPattern} selected block arrangement compare use cue a b c beginner producer`,
    run: onFocusPatternUseReadout
  };
  const patternUseActions: QuickAction[] = patternSlots.map((pattern) => {
    const current = selectedBlock?.pattern === pattern;
    const eventCount = patternEventTotal(project.patterns[pattern]);
    return {
      id: `pattern-use-${pattern.toLowerCase()}`,
      title: current ? `Selected block already uses Pattern ${pattern}` : `Use Pattern ${pattern} in selected block`,
      detail: selectedBlock
        ? current
          ? `${selectedBlockLabel} / ${eventCount} events`
          : `${selectedBlockLabel} -> Pattern ${pattern} / ${eventCount} events`
        : "Select an arrangement block first.",
      group: "Arrange",
      keywords: `pattern use assign selected block arrangement song form pattern compare ${pattern} a b c variation section beginner producer`,
      disabled: !selectedBlock || current,
      run: () => onUsePatternInSelectedBlock(pattern)
    };
  });
  const patternCloneActions: QuickAction[] = patternCloneOptions.map((clone) => ({
    id: `pattern-clone-${clone.target}-${clone.preset}`,
    title: `Clone Pattern ${clone.source} to ${clone.target} as ${clone.preview}`,
    detail: `${clone.detail} / ${clone.preview} variation`,
    group: "Create",
    keywords: `pattern clone variation copy ${clone.source} ${clone.target} ${clone.preset} ${clone.preview} a b c hook breakdown beginner producer`,
    run: () => onApplyPatternClone(clone.target, clone.preset)
  }));
  const patternCopyActions: QuickAction[] = patternSlots
    .filter((target) => target !== project.selectedPattern)
    .map((target) => {
      const source = project.selectedPattern;
      const sourceCount = patternEventTotal(project.patterns[source]);
      const targetCount = patternEventTotal(project.patterns[target]);
      return {
        id: `pattern-copy-${target.toLowerCase()}`,
        title: `Copy Pattern ${source} to ${target}`,
        detail: `${sourceCount} source events -> Pattern ${target} (${targetCount} events now) / shows Pattern Edit Result`,
        group: "Create",
        keywords: `pattern copy duplicate edit result source ${source} target ${target} a b c loop variation beginner producer`,
        run: () => onCopySelectedPattern(target)
      };
    });
  const patternChainActions: QuickAction[] = patternChainIds.map((chain) => {
    const arrangement = createPatternChain(chain);
    const chainLabel = patternChainLabel(chain);
    const chainBars = arrangement.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
    return {
      id: `pattern-chain-${chain}`,
      title: `Apply ${chainLabel}`,
      detail: `${patternChainReadout(arrangement)} / ${barCountLabel(chainBars)} / ${arrangement.length} blocks`,
      group: "Arrange",
      keywords: `pattern chain direct arrangement structure sketch song ${chain} ${chainLabel} ${patternChainReadout(arrangement)} a b c hook switch break turn beginner producer`,
      run: () => onApplyPatternChain(chain)
    };
  });
  const patternChainDecisionSummary = createPatternChainPreviewDecision(patternChainPreviewSummary);
  const loopScopeStatus = transportLoopStatus(project, transportLoopScope, selectedArrangementIndex, arrangementTransitionLoopTarget);
  const selectedLoopBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0] ?? null;
  const transportPositionDetailLabel = transportPositionReadout.detailLabel.split(" / ").join(" + ");
  const tapTempoDetailLabel = tapTempoReadout.detailLabel.split(" / ").join(" + ");
  const tempoNudgeRouteLabel = tempoNudgeRouteSummary(project.bpm);
  const currentSwingLabel = percentLabel(normalizeSwingFeelValue(project.swing));
  const swingFeelRouteLabel = swingFeelRouteSummary(project);

  return [
    {
      id: "transport-position-readout-action",
      title: `Review Transport Position: ${transportPositionReadout.roleLabel}`,
      detail: `${transportPositionReadout.statusLabel} / ${transportPositionReadout.roleLabel} / ${
        transportPositionDetailLabel
      } / ${transportLoopLabel(transportLoopScope)} loop / Pattern ${project.selectedPattern} / ${project.bpm} BPM`,
      group: "Transport",
      keywords: `transport position readout bar beat step status playback cue loop scope ${
        transportLoopScope
      } ${transportPositionReadout.statusLabel} ${transportPositionReadout.roleLabel} ${
        transportPositionDetailLabel
      } Pattern ${project.selectedPattern} ${
        selectedLoopBlock ? `${selectedLoopBlock.section} ${selectedLoopBlock.pattern}` : "no block"
      } beginner producer direct beat workstation`,
      run: onFocusTransportPositionReadout
    },
    {
      id: "loop-scope",
      title: `Review Loop Scope: ${transportLoopLabel(transportLoopScope)}`,
      detail: `${loopScopeStatus} / Pattern ${project.selectedPattern} / ${project.bpm} BPM / ${
        project.metronomeEnabled ? "Click on" : "Click off"
      }`,
      group: "Transport",
      keywords: `loop scope readout song block turn pattern transport audition playback ${
        transportLoopScope
      } ${loopScopeStatus} Pattern ${project.selectedPattern} ${
        selectedLoopBlock ? `${selectedLoopBlock.section} ${selectedLoopBlock.pattern}` : "no block"
      } metronome ${project.metronomeEnabled ? "on" : "off"} beginner producer direct beat workstation`,
      run: onFocusLoopScope
    },
    {
      id: "metronome-readout",
      title: `Review Metronome: ${project.metronomeEnabled ? "Click on" : "Click off"}`,
      detail: `${project.metronomeEnabled ? "Click on" : "Click off"} / ${project.bpm} BPM / ${transportLoopLabel(
        transportLoopScope
      )} loop / Pattern ${project.selectedPattern}`,
      group: "Transport",
      keywords: `metronome readout click grid bpm transport timing realtime export clean ${
        project.metronomeEnabled ? "on enabled" : "off disabled"
      } ${transportLoopScope} ${loopScopeStatus} Pattern ${project.selectedPattern} ${
        selectedLoopBlock ? `${selectedLoopBlock.section} ${selectedLoopBlock.pattern}` : "no block"
      } beginner producer direct beat workstation`,
      run: onFocusMetronomeReadout
    },
    {
      id: "tap-tempo-readout-action",
      title: `Review Tap Tempo: ${tapTempoReadout.roleLabel}`,
      detail: `${tapTempoReadout.statusLabel} / ${tapTempoReadout.roleLabel} / ${tapTempoDetailLabel} / ${transportLoopLabel(
        transportLoopScope
      )} loop / Pattern ${project.selectedPattern} / ${project.bpm} BPM`,
      group: "Transport",
      keywords: `tap tempo readout bpm pulse estimate delayed commit timing transport ${
        tapTempoReadout.statusLabel
      } ${tapTempoReadout.roleLabel} ${tapTempoDetailLabel} ${
        project.metronomeEnabled ? "metronome on" : "metronome off"
      } ${transportLoopScope} Pattern ${project.selectedPattern} ${
        selectedLoopBlock ? `${selectedLoopBlock.section} ${selectedLoopBlock.pattern}` : "no block"
      } beginner producer direct beat workstation`,
      run: onFocusTapTempoReadout
    },
    {
      id: "tempo-nudge-readout-action",
      title: `Review Tempo Nudge: ${project.bpm} BPM`,
      detail: `Current ${project.bpm} BPM / ${tempoNudgeRouteLabel} / ${transportLoopLabel(
        transportLoopScope
      )} loop / Pattern ${project.selectedPattern}`,
      group: "Transport",
      keywords: `tempo nudge readout bpm routes current bounded -1 +1 half double transport timing ${
        tempoNudgeRouteLabel
      } ${project.metronomeEnabled ? "metronome on" : "metronome off"} ${transportLoopScope} Pattern ${
        project.selectedPattern
      } ${selectedLoopBlock ? `${selectedLoopBlock.section} ${selectedLoopBlock.pattern}` : "no block"} beginner producer direct beat workstation`,
      run: onFocusTempoNudgeReadout
    },
    {
      id: "swing-feel-readout-action",
      title: `Review Swing Feel: ${currentSwingLabel}`,
      detail: `Current ${currentSwingLabel} / ${swingFeelRouteLabel} / ${transportLoopLabel(
        transportLoopScope
      )} loop / Pattern ${project.selectedPattern}`,
      group: "Transport",
      keywords: `swing feel readout groove timing shuffle pocket routes current style default ${
        swingFeelRouteLabel
      } ${project.metronomeEnabled ? "metronome on" : "metronome off"} ${transportLoopScope} Pattern ${
        project.selectedPattern
      } ${selectedLoopBlock ? `${selectedLoopBlock.section} ${selectedLoopBlock.pattern}` : "no block"} beginner producer direct beat workstation`,
      run: onFocusSwingFeelReadout
    },
    {
      id: "toggle-playback",
      title: isPlaying ? "Stop playback" : `Play ${transportLoopLabel(transportLoopScope)} loop`,
      detail: transportLoopStatus(project, transportLoopScope, selectedArrangementIndex, arrangementTransitionLoopTarget),
      group: "Transport",
      keywords: "play stop space transport preview arrangement transition pattern",
      run: onTogglePlayback
    },
    {
      id: "loop-song",
      title: "Loop full song",
      detail: `${barCountLabel(arrangementTotalBars(project))} arrangement loop.`,
      group: "Transport",
      keywords: "loop song arrangement full transport",
      disabled: isPlaying && transportLoopScope !== "arrangement",
      run: () => onSelectTransportLoopScope("arrangement")
    },
    {
      id: "loop-block",
      title: "Loop selected block",
      detail: selectedBlock
        ? `Block ${Math.min(selectedArrangementIndex + 1, project.arrangement.length)} ${selectedBlock.section} / Pattern ${selectedBlock.pattern}.`
        : "No arrangement block selected.",
      group: "Transport",
      keywords: "loop selected block arrangement section transport",
      disabled: (isPlaying && transportLoopScope !== "block") || !selectedBlock,
      run: () => onSelectTransportLoopScope("block")
    },
    {
      id: "transition-loop-cue",
      title: arrangementTransitionLoopTarget
        ? `Cue Transition Loop: ${arrangementTransitionLoopTarget.transition.value}`
        : "Cue Transition Loop",
      detail: arrangementTransitionLoopTarget
        ? arrangementTransitionLoopDetail(arrangementTransitionLoopTarget)
        : "Focus or select adjacent arrangement blocks first.",
      group: "Transport",
      keywords: `transition loop cue audition arrangement handoff turn drop build ${
        arrangementTransitionLoopTarget?.transition.fromSection ?? "none"
      } ${arrangementTransitionLoopTarget?.transition.toSection ?? "none"} beginner producer`,
      disabled: isPlaying || !arrangementTransitionLoopTarget,
      run: () => {
        if (arrangementTransitionLoopTarget) {
          onCueArrangementTransition(arrangementTransitionLoopTarget.transition);
        }
      }
    },
    {
      id: "hook-loop-cue",
      title: hookLoopCueTarget ? `Cue Hook Loop: Block ${hookLoopCueTarget.index + 1}` : "Cue Hook Loop",
      detail: hookLoopCueTarget
        ? hookLoopCueDetail(hookLoopCueTarget)
        : "Add a Hook section before cueing the hook loop.",
      group: "Transport",
      keywords: `hook loop cue audition readiness hook section block transport ${
        hookReadinessCard?.id ?? "none"
      } ${hookReadinessCard?.label ?? "none"} beginner producer`,
      disabled: isPlaying || !hookLoopCueTarget,
      run: () => onCueHookLoop(hookReadinessCard ?? undefined)
    },
    {
      id: "hook-fix",
      title: hookReadinessCard ? `Apply Hook Fix: ${hookReadinessCard.label}` : "Apply Hook Fix",
      detail: hookFixOption ? `${hookFixOption.label} / ${hookFixOption.detail}` : "No Hook Readiness fix target.",
      group: hookFixOption?.group ?? "Project",
      keywords: `hook fix action section motif contrast mix handoff ${
        hookReadinessCard?.id ?? "none"
      } ${hookReadinessCard?.label ?? "none"} ${hookFixOption?.label ?? "none"} beginner producer`,
      disabled: !hookReadinessCard,
      run: () => onApplyHookFix(hookReadinessCard ?? undefined)
    },
    {
      id: "topline-loop-cue",
      title:
        toplineLoopCueTarget.mode === "block"
          ? `Cue Topline Loop: Block ${toplineLoopCueTarget.index + 1}`
          : `Cue Topline Loop: Pattern ${toplineLoopCueTarget.pattern}`,
      detail: toplineLoopCueDetail(toplineLoopCueTarget),
      group: "Transport",
      keywords: `topline loop cue audition vocal pocket room block pattern transport singer rapper lead hook ${
        toplineSpaceCard?.id ?? "none"
      } ${toplineSpaceCard?.label ?? "none"} beginner producer`,
      disabled: isPlaying,
      run: () => onCueToplineLoop(toplineSpaceCard ?? undefined)
    },
    {
      id: "topline-fix",
      title: toplineSpaceCard ? `Apply Topline Fix: ${toplineSpaceCard.label}` : "Apply Topline Fix",
      detail: toplineFixOption
        ? `${toplineFixOption.label} / ${toplineFixOption.detail}`
        : "No Topline Space fix target.",
      group: toplineFixOption?.group ?? "Project",
      keywords: `topline fix action vocal pocket lead window headroom brief ${
        toplineSpaceCard?.id ?? "none"
      } ${toplineSpaceCard?.label ?? "none"} ${toplineFixOption?.label ?? "none"} beginner producer`,
      disabled: !toplineSpaceCard,
      run: () => onApplyToplineFix(toplineSpaceCard ?? undefined)
    },
    {
      id: "loop-pattern",
      title: "Loop selected pattern",
      detail: `Pattern ${project.selectedPattern} two-bar preview.`,
      group: "Transport",
      keywords: "loop pattern preview selected a b c transport",
      disabled: isPlaying && transportLoopScope !== "pattern",
      run: () => onSelectTransportLoopScope("pattern")
    },
    grooveCompassCueAction,
    blueprintPreviewCueAction,
    ...arrangementTransitionLoopActions,
    ...hookReadinessCueActions,
    ...hookReadinessFixActions,
    ...toplineSpaceCueActions,
    ...toplineSpaceFixActions,
    {
      id: "section-locator-readout-action",
      title: sectionLocatorCueDecision.section
        ? `Review Section Locator: ${sectionLocatorCueDecision.sectionLabel}`
        : "Review Section Locator",
      detail: sectionLocatorCueDecision.section
        ? `${sectionLocatorCueDecision.statusLabel} / ${sectionLocatorCueDecision.metricLabel} / ${sectionLocatorCueDecision.detailLabel}`
        : sectionLocatorCueDecision.detailLabel,
      group: "Transport",
      keywords: `Quick Actions Section Locator Readout review cue suggestion arrangement block loop transport intro verse hook bridge outro selected pattern editable events ${
        sectionLocatorCueDecision.section ? sectionLocatorTestId(sectionLocatorCueDecision.section) : "none"
      } ${sectionLocatorCueDecision.sectionLabel} ${sectionLocatorCueDecision.actionId} beginner producer`,
      disabled: !sectionLocatorCueDecision.section,
      run: onFocusSectionLocatorReadout
    },
    {
      id: "section-locator-decision",
      title: sectionLocatorCueDecision.disabled
        ? "Run Section Locator Cue Decision"
        : `Run Section Locator Cue Decision: ${sectionLocatorCueDecision.sectionLabel}`,
      detail: sectionLocatorCueDecision.disabled
        ? sectionLocatorCueDecision.detailLabel
        : `${sectionLocatorCueDecision.statusLabel} / ${sectionLocatorCueDecision.metricLabel} / ${sectionLocatorCueDecision.detailLabel}`,
      group: "Transport",
      keywords: `section locator cue decision preview arrangement block loop transport intro verse hook bridge outro suggested ${
        sectionLocatorCueDecision.section ? sectionLocatorTestId(sectionLocatorCueDecision.section) : "none"
      } ${sectionLocatorCueDecision.sectionLabel} ${sectionLocatorCueDecision.actionId} beginner producer`,
      disabled: sectionLocatorCueDecision.disabled,
      run: () => {
        if (!sectionLocatorCueDecision.disabled && sectionLocatorCueDecision.section) {
          onCueSectionLocator(sectionLocatorCueDecision.section);
        }
      }
    },
    ...sectionLocatorActions,
    ...arrangementBlockCueActions,
    {
      id: "metronome-toggle",
      title: project.metronomeEnabled ? "Turn metronome off" : "Turn metronome on",
      detail: `${project.metronomeEnabled ? "On" : "Off"} / ${project.bpm} BPM / realtime click only, export stays clean`,
      group: "Transport",
      keywords: `metronome click timing grid bpm transport ${project.metronomeEnabled ? "on off disable" : "off on enable"} beginner producer`,
      run: onToggleMetronome
    },
    {
      id: "tap-tempo",
      title: "Tap tempo pulse",
      detail: `${project.bpm} BPM now / run repeatedly, then pause briefly to apply`,
      group: "Transport",
      keywords: "tap tempo bpm pulse average timing feel transport beginner producer",
      run: onTapTempo
    },
    ...tempoNudgeActions,
    ...swingFeelActions,
    patternCompareDecisionAction,
    ...patternCueActions,
    ...patternSwitchActions,
    patternPlaybackReadoutAction,
    patternUseReadoutAction,
    audiblePatternFollowAction,
    keyboardCaptureReadoutAction,
    captureStepModeReadoutAction,
    midiInputReadoutAction,
    editorAuditionReadoutAction,
    {
      id: "midi-input-connect",
      title: midiInputConnectTitle,
      detail: `${midiCaptureSummary.statusLabel} / ${midiCaptureSummary.detailLabel}`,
      group: "Create",
      keywords: `midi input connect refresh web midi controller keyboard note capture 808 synth ${midiCaptureStatus} ${midiCaptureSummary.statusLabel} beginner producer`,
      disabled: !midiInputConnectReady,
      run: onRequestMidiInputAccess
    },
    {
      id: "keyboard-capture-toggle",
      title: keyboardCaptureToggleTitle,
      detail: `${keyboardCaptureEnabled ? "Armed" : "Off"} / Target ${keyboardCaptureTargetLabel} / Pattern ${
        project.selectedPattern
      } / ${keyboardCaptureDefaultDetail}`,
      group: "Create",
      keywords: `keyboard capture toggle on off arm disarm desktop keys note input ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} ${project.selectedPattern} direct composition beginner producer`,
      run: () => onSetKeyboardCaptureEnabled(!keyboardCaptureEnabled)
    },
    ...captureTargetActions,
    ...captureStepModeActions,
    ...captureDefaultActions,
    ...selectedDrumActions,
    ...selectedNoteActions,
    ...selectedChordActions,
    {
      id: "midi-input-arm",
      title: midiInputArmTitle,
      detail: `${midiCaptureSummary.statusLabel} / Target ${keyboardCaptureTargetLabel} / ${connectedMidiInputCount}/${midiInputOptions.length} inputs connected`,
      group: "Create",
      keywords: `midi input arm disarm web midi controller keyboard note capture ${keyboardCaptureTarget} ${keyboardCaptureTargetLabel} connected ${connectedMidiInputCount} beginner producer`,
      disabled: !midiInputArmReady,
      run: () => onSetMidiCaptureArmed(!midiCaptureArmed)
    },
    {
      id: "project-safety-readout",
      title: "Project Safety Readout",
      detail: `${projectSafetyReadout.statusLabel} / ${projectSafetyReadout.roleLabel} / ${projectSafetyReadout.detailLabel}`,
      group: "Project",
      keywords: `project safety readout save file draft local recovery unsaved snapshot durable ${projectSafetyReadout.statusLabel} ${projectSafetyReadout.roleLabel} beginner producer no cloud no sampling`,
      run: onCheckProjectSafety
    },
    {
      id: "save-project",
      title: "Save project",
      detail: "Write the current .grooveforge.json project.",
      group: "Project",
      keywords: "save project file json download",
      run: onSaveProject
    },
    {
      id: "open-project",
      title: "Open project",
      detail: "Load a saved GrooveForge project file.",
      group: "Project",
      keywords: "open load import project json",
      run: onOpenProject
    },
    {
      id: "restore-local-draft",
      title: "Restore local draft",
      detail: localDraftRecoveryDetail,
      group: "Project",
      keywords:
        "restore local draft recovery renderer localStorage safety recover unsaved project session beginner producer no cloud no sampling",
      disabled: !localDraftRecovery,
      run: onRestoreLocalDraft
    },
    {
      id: "clear-local-draft",
      title: "Clear local draft recovery",
      detail: localDraftRecoveryDetail,
      group: "Project",
      keywords:
        "clear local draft recovery dismiss renderer localStorage safety keep current project saved file beginner producer no cloud no sampling",
      disabled: !localDraftRecovery,
      run: onClearLocalDraftRecovery
    },
    {
      id: "command-reference",
      title: "Command Reference",
      detail: "Desktop, Project, Guide, Create, Sound, Arrange, Mix, Finish, Deliver, and Beat Terms command map.",
      group: "Project",
      keywords: "command reference shortcuts keyboard help quick actions desktop guide capture producer beginner first beat path beat spine composer",
      run: onOpenCommandReference
    },
    {
      id: "guide-quick-start",
      title: guideQuickStartTarget ? guideQuickStartTarget.title : "Guide Quick Start",
      detail: guideQuickStartTarget
        ? guideQuickStartCommandDetail(guideQuickStartTarget)
        : "No Guide Quick Start target available.",
      group: "Project",
      keywords: `guide quick start one command current next path session workflow spotlight first beat pass beginner producer direct beat workstation ${
        guideQuickStartTarget?.keywords ?? "none"
      }`,
      disabled: !guideQuickStartTarget,
      run: () => {
        if (!guideQuickStartTarget) {
          return;
        }

        switch (guideQuickStartTarget.source) {
          case "path":
            if (firstBeatPathStep) {
              onJumpFirstBeatPath(firstBeatPathStep);
            }
            break;
          case "session":
            onFocusSessionPass(sessionPassCard);
            break;
          case "workflow":
            if (workflowSpotlightItem) {
              onFocusWorkflowSpotlight(workflowSpotlightItem);
            }
            break;
        }
      }
    },
    {
      id: "guide-bottleneck-focus",
      title: guideQuickStartBottleneckTarget ? guideQuickStartBottleneckTarget.title : "Guide Bottleneck Focus",
      detail: guideQuickStartBottleneckTarget
        ? guideQuickStartCommandDetail(guideQuickStartBottleneckTarget)
        : "No Guide Quick Start bottleneck focus target available.",
      group: "Project",
      keywords: `guide quick start bottleneck focus lowest lane completion path session workflow beginner producer direct beat workstation ${
        guideQuickStartBottleneckTarget?.keywords ?? "none"
      }`,
      disabled: !guideQuickStartBottleneckTarget,
      run: () => {
        if (!guideQuickStartBottleneckTarget) {
          return;
        }

        switch (guideQuickStartBottleneckTarget.source) {
          case "path":
            if (firstBeatPathStep) {
              onJumpFirstBeatPath(firstBeatPathStep);
            }
            break;
          case "session":
            onFocusSessionPass(sessionPassCard);
            break;
          case "workflow":
            if (workflowSpotlightItem) {
              onFocusWorkflowSpotlight(workflowSpotlightItem);
            }
            break;
        }
      }
    },
    ...beatMapCommandActions,
    {
      id: "beat-terms-reference",
      title: "Beat Terms Reference",
      detail: "Pattern, drums, 808, chords, sound, arrangement, mix/master, and handoff terms.",
      group: "Project",
      keywords: "beat terms glossary reference beginner producer pattern drums 808 bass chords sound arrangement mix master handoff help",
      run: onOpenCommandReference
    },
    {
      id: "save-snapshot",
      title: "Save snapshot",
      detail: `${project.snapshots.length}/${maxProjectSnapshots} local idea slots saved.`,
      group: "Project",
      keywords: "snapshot slot idea save version compare",
      run: onSaveSnapshot
    },
    {
      id: "session-pass-focus",
      title: `Focus ${sessionPassCard.label}`,
      detail: sessionPassCommandDetail(sessionPassCard, sessionPassSummary),
      group: "Project",
      keywords: `session pass focus guided studio next workflow ${sessionPassCard.id} ${sessionPassCard.focusLabel} beginner producer`,
      run: () => onFocusSessionPass(sessionPassCard)
    },
    ...sessionPassActions,
    ...modeSwitchActions,
    {
      id: "session-brief-compass-focus",
      title: `Focus Brief Compass: ${sessionBriefCompassCard.label}`,
      detail: `${sessionBriefCompassCard.value} / ${sessionBriefCompassFocusLabel(sessionBriefCompassCard, project.sessionBrief)}`,
      group: "Project",
      keywords: `session brief compass focus current handoff context direction reference artist notes ${sessionBriefCompassCard.id} ${sessionBriefCompassCard.label} ${sessionBriefCompassCard.value} beginner producer`,
      run: () => onFocusSessionBriefCompass(sessionBriefCompassCard)
    },
    ...sessionBriefCompassActions,
    {
      id: "reference-alignment-focus",
      title: `Focus Reference Alignment: ${referenceAlignmentCard.label}`,
      detail: `${referenceAlignmentCard.value} / ${referenceAlignmentCard.focusLabel} / ${referenceAlignmentCard.detail}`,
      group: "Project",
      keywords: `reference alignment focus listen cue ${referenceAlignmentCard.id} ${referenceAlignmentCard.label} ${referenceAlignmentCard.value} ${referenceAlignmentCard.focusLabel}`,
      run: () => onFocusReferenceAlignment(referenceAlignmentCard)
    },
    ...referenceAlignmentActions,
    ...sessionBriefStarterActions,
    ...deliveryTargetActions,
    {
      id: "delivery-target-align",
      title: deliveryTargetAlignReady ? `Align ${deliveryTarget.name} target` : "Align Delivery Target",
      detail: deliveryTargetAlignReady
        ? `${deliveryTargetAlignmentPreview.statusLabel} / ${deliveryTargetAlignmentPreview.lengthLabel} / ${deliveryTargetAlignmentPreview.masterLabel}`
        : `${deliveryTarget.name} target already aligned.`,
      group: "Project",
      keywords: `delivery target align handoff export session goal length arrangement master mix stems ${deliveryTarget.id} ${deliveryTarget.name} ${deliveryTargetAlignmentPreview.statusLabel} beginner producer`,
      disabled: !deliveryTargetAlignReady,
      run: () => {
        if (deliveryTargetAlignReady) {
          onAlignDeliveryTarget(deliveryTarget.id);
        }
      }
    },
    {
      id: "mode-focus-jump",
      title: modeFocusCard ? `Jump Mode Focus: ${modeFocusCard.label}` : "Jump Mode Focus",
      detail: modeFocusCard ? modeFocusCommandDetail(modeFocusCard, modeFocusSummary) : "No Mode Focus card available.",
      group: "Project",
      keywords: `mode focus jump guided studio orientation stage issue session handoff ${modeFocusCard?.id ?? "none"} ${modeFocusCard?.focusLabel ?? "none"} beginner producer`,
      disabled: !modeFocusCard,
      run: () => {
        if (modeFocusCard) {
          onFocusModeFocus(modeFocusCard);
        }
      }
    },
    ...modeFocusActions,
    {
      id: "first-beat-path-jump",
      title: firstBeatPathStep ? `Jump First Beat Path: ${firstBeatPathStep.label}` : "Jump First Beat Path",
      detail: firstBeatPathStep
        ? firstBeatPathCommandDetail(firstBeatPathStep, firstBeatPathSummary)
        : "No First Beat Path step available.",
      group: "Project",
      keywords: `first beat path next step jump setup compose arrange mix deliver beginner producer ${firstBeatPathStep?.id ?? "none"} ${firstBeatPathStep ? firstBeatPathCommandDetail(firstBeatPathStep, firstBeatPathSummary) : "none"}`,
      disabled: !firstBeatPathStep,
      run: () => {
        if (firstBeatPathStep) {
          onJumpFirstBeatPath(firstBeatPathStep);
        }
      }
    },
    ...firstBeatPathActions,
    {
      id: "beat-spine-jump",
      title: beatSpineCard ? `Jump Beat Spine: ${beatSpineCard.label}` : "Jump Beat Spine",
      detail: beatSpineCard ? beatSpineJumpButtonContext(beatSpineCard, beatSpineSummary) : "No Beat Spine card available.",
      group: "Project",
      keywords: `beat spine jump core setup drums 808 bass harmony melody sound arrange finish ${beatSpineCard?.id ?? "none"} ${beatSpineCard?.focusLabel ?? "none"} beginner producer`,
      disabled: !beatSpineCard,
      run: () => {
        if (beatSpineCard) {
          onJumpBeatSpine(beatSpineCard);
        }
      }
    },
    ...beatSpineCardJumpActions,
    {
      id: "beat-spine-apply",
      title: beatSpineApplyCard?.action ? `Apply Beat Spine: ${beatSpineApplyCard.label}` : "Apply Beat Spine",
      detail: beatSpineApplyCard?.action
        ? beatSpineApplyButtonContext(beatSpineApplyCard.action, beatSpineApplyCard, beatSpineSummary, project.selectedPattern)
        : "No Beat Spine action available.",
      group: "Create",
      keywords: `beat spine apply core action setup drums 808 bass harmony melody sound arrange finish ${beatSpineApplyCard?.id ?? "none"} ${beatSpineApplyCard?.action?.label ?? "none"} beginner producer sample free`,
      disabled: !beatSpineApplyCard?.action,
      run: () => {
        if (beatSpineApplyCard?.action) {
          onApplyBeatSpine(beatSpineApplyCard.action);
        }
      }
    },
    ...beatSpineCardApplyActions,
    {
      id: "composer-guide-focus",
      title: composerGuideCard ? `Focus Composer Guide: ${composerGuideCard.label}` : "Focus Composer Guide",
      detail: composerGuideCard ? composerGuideCardDetail : "No Composer Guide card available.",
      group: "Create",
      keywords: `composer guide focus writing next layer inspect ${composerGuideCard?.id ?? "none"} ${composerGuideCard?.focusLabel ?? "none"} ${
        composerGuideCardDetail || "no guide card"
      } beginner producer`,
      disabled: !composerGuideCard,
      run: () => {
        if (composerGuideCard) {
          onFocusComposerGuide(composerGuideCard);
        }
      }
    },
    ...composerGuideActions,
    ...composerActionCommands,
    {
      id: "style-inspector-focus",
      title: styleInspectorItem ? `Focus Style Inspector: ${styleInspectorItem.label}` : "Focus Style Inspector",
      detail: styleInspectorItem ? `${styleInspectorItem.value} / ${styleInspectorItem.focusLabel}` : "No Style Inspector item available.",
      group: "Create",
      keywords: `style inspector focus genre bpm swing bass melody sound density pattern inspect ${styleInspectorItem?.focusId ?? "none"} ${styleInspectorItem?.focusLabel ?? "none"} beginner producer`,
      disabled: !styleInspectorItem,
      run: () => {
        if (styleInspectorItem) {
          onFocusStyleInspector(styleInspectorItem);
        }
      }
    },
    ...styleInspectorActions,
    ...styleGoalCueCommands,
    ...styleGoalActionCommands,
    styleDirectionReadoutAction,
    ...styleQuickActions,
    keyRetargetReadoutAction,
    ...keyQuickActions,
    {
      id: "key-compass-focus",
      title: keyCompassItem ? `Focus Key Compass: ${keyCompassItem.label}` : "Focus Key Compass",
      detail: keyCompassItem ? `${keyCompassItem.value} / ${keyCompassItem.focusLabel}` : "No Key Compass card available.",
      group: "Create",
      keywords: `key compass focus harmony cadence resolution scale chord 808 melody inspect ${keyCompassItem?.focusId ?? "none"} ${keyCompassItem?.focusLabel ?? "none"} beginner producer`,
      disabled: !keyCompassItem,
      run: () => {
        if (keyCompassItem) {
          onFocusKeyCompass(keyCompassItem);
        }
      }
    },
    ...keyCompassActions,
    {
      id: "groove-compass-focus",
      title: grooveCompassItem ? `Focus Groove Compass: ${grooveCompassItem.label}` : "Focus Groove Compass",
      detail: grooveCompassItem ? `${grooveCompassItem.value} / ${grooveCompassItem.focusLabel}` : "No Groove Compass card available.",
      group: "Create",
      keywords: `groove compass focus rhythm pocket balance early late velocity motion drums density anchors hats timing chance inspect ${grooveCompassItem?.focusId ?? "none"} ${grooveCompassItem?.focusLabel ?? "none"} beginner producer`,
      disabled: !grooveCompassItem,
      run: () => {
        if (grooveCompassItem) {
          onFocusGrooveCompass(grooveCompassItem);
        }
      }
    },
    ...grooveCompassActions,
    {
      id: "pattern-dna-focus",
      title: patternDnaCard ? `Focus Pattern DNA: ${patternDnaCard.label}` : "Focus Pattern DNA",
      detail: patternDnaCard ? `${patternDnaCard.value} / ${patternDnaCard.focusLabel}` : "No Pattern DNA card available.",
      group: "Create",
      keywords: `pattern dna focus loop layers density variation arrangement inspect ${patternDnaCard?.id ?? "none"} ${patternDnaCard?.focusLabel ?? "none"} beginner producer`,
      disabled: !patternDnaCard,
      run: () => {
        if (patternDnaCard) {
          onFocusPatternDna(patternDnaCard);
        }
      }
    },
    ...patternDnaActions,
    {
      id: "layer-starter",
      title: layerStarterOption ? `Start ${layerStarterOption.label} layer` : "Start missing layer",
      detail: layerStarterOption ? `${layerStarterOption.status} / ${layerStarterOption.detail}` : "No missing or thin Layer Starter option.",
      group: "Create",
      keywords: `layer starter missing thin start seed drums 808 bass chords synth ${layerStarterOption?.id ?? "none"} ${layerStarterOption?.actionLabel ?? "none"} ${layerStarterOption?.targetLabel ?? "none"} beginner producer`,
      disabled: !layerStarterOption,
      run: () => {
        if (layerStarterOption) {
          onApplyLayerStarter(layerStarterOption.id);
        }
      }
    },
    ...layerStarterActions,
    ...patternCloneActions,
    ...patternCopyActions,
    {
      id: "pattern-clear",
      title: `Clear Pattern ${project.selectedPattern}`,
      detail: `${patternEventTotal(activePattern(project))} events now / shows Pattern Edit Result`,
      group: "Create",
      keywords: `pattern clear reset empty edit result ${project.selectedPattern} a b c loop variation beginner producer`,
      run: onClearSelectedPattern
    },
    {
      id: "pattern-stack",
      title: patternStackId ? `Apply ${patternStackPreviewSummary.stackLabel}` : "Apply Pattern Stack",
      detail: patternStackId
        ? `${patternStackPreviewSummary.patternLabel} / ${patternStackPreviewSummary.moveLabel}`
        : "Current Pattern already matches the previewed stack.",
      group: "Create",
      keywords: `pattern stack 808 bass chords synth melody sketch harmony starter ${patternStackPreviewSummary.stackId} ${patternStackPreviewSummary.stackLabel} beginner producer`,
      disabled: !patternStackId,
      run: () => {
        if (patternStackId) {
          onApplyPatternStack(patternStackId);
        }
      }
    },
    ...patternStackActions,
    {
      id: "drum-move",
      title: drumMoveTarget ? `Apply ${drumMoveTarget.label} Drum ${drumMoveTarget.kind}` : "Apply Drum Move",
      detail: drumMoveTarget
        ? `${drumMovePreviewSummary.patternLabel} / ${drumMovePreviewSummary.moveLabel}`
        : "Current Drum move preview has no active target.",
      group: "Create",
      keywords: `drum move rhythm pocket foundation feel accent velocity chance timing hats percussion ${drumMovePreviewSummary.foundationId} ${drumMovePreviewSummary.feelId} ${drumMovePreviewSummary.accentId} ${drumMoveTarget?.label ?? "none"} beginner producer`,
      disabled: !drumMoveTarget,
      run: () => {
        if (!drumMoveTarget) {
          return;
        }
        if (drumMoveTarget.kind === "Foundation") {
          onApplyDrumFoundation(drumMoveTarget.id);
        } else if (drumMoveTarget.kind === "Feel") {
          onApplyGrooveFeel(drumMoveTarget.id);
        } else {
          onApplyDrumAccent(drumMoveTarget.id);
        }
      }
    },
    {
      id: "808-move",
      title: bassMoveTarget ? `Apply ${bassMoveTarget.label} 808 ${bassMoveTarget.kind}` : "Apply 808 Move",
      detail: bassMoveTarget
        ? `${bassMovePreviewSummary.phraseLabel} / ${bassMovePreviewSummary.moveLabel}`
        : "Current 808 move preview has no active target.",
      group: "Create",
      keywords: `808 move bass low end bassline glide contour rhythm chance ${bassMovePreviewSummary.basslineId} ${bassMovePreviewSummary.glideId} ${bassMovePreviewSummary.contourId} ${bassMoveTarget?.label ?? "none"} beginner producer`,
      disabled: !bassMoveTarget,
      run: () => {
        if (!bassMoveTarget) {
          return;
        }
        if (bassMoveTarget.kind === "Bassline") {
          onApplyBasslinePad(bassMoveTarget.id);
        } else if (bassMoveTarget.kind === "Glide") {
          onApplyBassGlidePad(bassMoveTarget.id);
        } else {
          onApplyBassContour(bassMoveTarget.id);
        }
      }
    },
    {
      id: "melody-move",
      title: melodyMoveTarget ? `Apply ${melodyMoveTarget.label} Melody ${melodyMoveTarget.kind}` : "Apply Melody Move",
      detail: melodyMoveTarget
        ? `${melodyMovePreviewSummary.phraseLabel} / ${melodyMovePreviewSummary.moveLabel}`
        : "Current Melody move preview has no active target.",
      group: "Create",
      keywords: `melody move synth phrase motif accent contour hook velocity chance ${melodyMovePreviewSummary.motifId} ${melodyMovePreviewSummary.accentId} ${melodyMovePreviewSummary.contourId} ${melodyMoveTarget?.label ?? "none"} beginner producer`,
      disabled: !melodyMoveTarget,
      run: () => {
        if (!melodyMoveTarget) {
          return;
        }
        if (melodyMoveTarget.kind === "Motif") {
          onApplyMelodyMotif(melodyMoveTarget.id);
        } else if (melodyMoveTarget.kind === "Accent") {
          onApplyMelodyAccent(melodyMoveTarget.id);
        } else {
          onApplyMelodyContour(melodyMoveTarget.id);
        }
      }
    },
    {
      id: "chord-move",
      title: chordMoveTarget ? `Apply ${chordMoveTarget.label} Chord ${chordMoveTarget.kind}` : "Apply Chord Move",
      detail: chordMoveTarget
        ? `${chordMovePreviewSummary.selectedLabel} / ${chordMovePreviewSummary.moveLabel}`
        : "Select a chord event before applying the Chord move preview.",
      group: "Create",
      keywords: `chord move harmony progression rhythm voicing inversion color chance ${chordMovePreviewSummary.padId} ${chordMovePreviewSummary.rhythmId} ${chordMovePreviewSummary.voicingId} ${chordMoveTarget?.label ?? "none"} beginner producer`,
      disabled: !chordMoveTarget,
      run: () => {
        if (!chordMoveTarget) {
          return;
        }
        if (chordMoveTarget.kind === "Pad") {
          onApplyChordPad(chordMoveTarget.id);
        } else if (chordMoveTarget.kind === "Rhythm") {
          onApplyChordRhythm(chordMoveTarget.id);
        } else {
          onApplyChordVoicing(chordMoveTarget.id);
        }
      }
    },
    {
      id: "drum-kit-readout-action",
      title: `Review Drum Kit: ${drumKitPreviewSummary.kitLabel}`,
      detail: `${drumKitPreviewSummary.statusLabel} / ${drumKitPreviewSummary.drumLabel} / ${drumKitPreviewSummary.rackLabel}`,
      group: "Create",
      keywords: `Quick Actions Drum Kit Readout review built in kit preview apply posture kick clap snare hat rack punch clean knock dust air ${
        drumKitPreviewSummary.padId
      } ${drumKitPreviewSummary.kitLabel} ${drumKitPreviewSummary.statusLabel} ${
        drumKitPreviewSummary.rackLabel
      } beginner producer manual drum tone`,
      resultTargetId: drumKitPreviewSummary.padId,
      run: onFocusDrumKitReadout
    },
    {
      id: "drum-kit-decision",
      title: drumKitReady ? `Run Drum Kit Decision: Apply ${drumKitPreviewSummary.kitLabel}` : "Run Drum Kit Decision: Aligned",
      detail: drumKitReady
        ? `${drumKitPreviewSummary.statusLabel} / ${drumKitPreviewSummary.moveLabel} / ${drumKitPreviewSummary.rackLabel}`
        : `${drumKitPreviewSummary.statusLabel} / Current editable drums already match this kit.`,
      group: "Create",
      keywords: `Quick Actions Drum Kit Decision preview decision apply suggested kit tone kick clap snare hat rack punch clean knock dust air ${
        drumKitPreviewSummary.padId
      } ${drumKitPreviewSummary.kitLabel} ${drumKitReady ? "apply-suggested" : "aligned"} beginner producer`,
      disabled: !drumKitReady,
      run: () => {
        if (drumKitReady) {
          onApplyDrumKit(drumKitPreviewSummary.padId);
        }
      }
    },
    {
      id: "drum-kit",
      title: drumKitReady ? `Apply ${drumKitPreviewSummary.kitLabel}` : "Apply Drum Kit",
      detail: drumKitReady
        ? `${drumKitPreviewSummary.drumLabel} / ${drumKitPreviewSummary.rackLabel}`
        : "Current drums already match the suggested kit.",
      group: "Create",
      keywords: `drum kit tone kick clap snare hat rack punch clean knock dust air ${drumKitPreviewSummary.padId} ${drumKitPreviewSummary.kitLabel} beginner producer`,
      disabled: !drumKitReady,
      run: () => {
        if (drumKitReady) {
          onApplyDrumKit(drumKitPreviewSummary.padId);
        }
      }
    },
    ...drumKitPadActions,
    {
      id: "sound-focus-readout-action",
      title: `Review Sound Focus: ${soundFocusPreviewSummary.padLabel}`,
      detail: `${soundFocusPreviewSummary.statusLabel} / ${soundFocusPreviewSummary.focusLabel} / ${soundFocusPreviewSummary.parameterLabel}`,
      group: "Create",
      keywords: `Quick Actions Sound Focus Readout review tone focus preview apply posture kick drums 808 bass duck sidechain synth chords ${
        soundFocusPreviewSummary.padId
      } ${soundFocusPreviewSummary.padLabel} ${soundFocusPreviewSummary.statusLabel} ${
        soundFocusPreviewSummary.parameterLabel
      } beginner producer manual sound focus`,
      resultTargetId: soundFocusPreviewSummary.padId,
      run: onFocusSoundFocusReadout
    },
    {
      id: "sound-focus-decision",
      title: soundFocusReady
        ? `Run Sound Focus Decision: Apply ${soundFocusPreviewSummary.padLabel}`
        : "Run Sound Focus Decision: Aligned",
      detail: soundFocusReady
        ? `${soundFocusPreviewSummary.statusLabel} / ${soundFocusPreviewSummary.changeLabel} / ${soundFocusPreviewSummary.parameterLabel}`
        : `${soundFocusPreviewSummary.statusLabel} / Current editable sound already matches this focus.`,
      group: "Create",
      keywords: `Quick Actions Sound Focus Decision preview decision apply suggested tone focus kick drums 808 bass duck sidechain synth chords ${
        soundFocusPreviewSummary.padId
      } ${soundFocusPreviewSummary.padLabel} ${soundFocusReady ? "apply-suggested" : "aligned"} beginner producer`,
      disabled: !soundFocusReady,
      run: () => {
        if (soundFocusReady) {
          onApplySoundFocus(soundFocusPreviewSummary.padId);
        }
      }
    },
    {
      id: "sound-focus",
      title: soundFocusReady ? `Apply ${soundFocusPreviewSummary.padLabel}` : "Apply Sound Focus",
      detail: soundFocusReady
        ? `${soundFocusPreviewSummary.focusLabel} / ${soundFocusPreviewSummary.parameterLabel}`
        : "Current sound already matches the suggested focus.",
      group: "Create",
      keywords: `sound focus tone design studio kick drums 808 bass duck sidechain synth chords ${soundFocusPreviewSummary.padId} ${soundFocusPreviewSummary.padLabel} beginner producer`,
      disabled: !soundFocusReady,
      run: () => {
        if (soundFocusReady) {
          onApplySoundFocus(soundFocusPreviewSummary.padId);
        }
      }
    },
    ...soundFocusPadActions,
    {
      id: "timbre-check",
      title: `Check Timbre: ${soundTimbreCheckSummary.statusLabel}`,
      detail: `${soundTimbreCheckSummary.headline} / ${soundTimbreCheckSummary.balanceLabel} / ${soundTimbreCheckSummary.detail}`,
      group: "Create",
      keywords: `Quick Actions Timbre Check readout balance tone drums 808 air width warmth sound focus studio ${soundTimbreCheckSummary.statusLabel} ${soundTimbreCheckSummary.headline} beginner producer`,
      run: onFocusTimbreCheck
    },
    {
      id: "studio-tone-baseline",
      title: `Capture Studio Tone Baseline: ${studioToneBaseline.sourceLabel}`,
      detail: `${quickActionSoundDesignPosture(project.sound)} / ${studioToneDrift.changedCount}/${studioToneDrift.totalCount} drift controls`,
      group: "Create",
      keywords: `Quick Actions Studio Tone Baseline capture current tone reset baseline sound design drums 808 bass synth chords ${studioToneBaseline.sourceLabel} ${studioToneDrift.postureLabel} beginner producer`,
      run: onCaptureStudioToneBaseline
    },
    {
      id: "studio-tone-drift",
      title: studioToneDriftTarget
        ? `Reset Largest Studio Tone Drift: ${studioToneDriftTarget.label}`
        : "Reset Largest Studio Tone Drift",
      detail: `${studioToneDrift.postureLabel} / ${studioToneDrift.largestLabel} / ${studioToneDrift.directionLabel}`,
      group: "Create",
      keywords: `Quick Actions Studio Tone Drift reset largest baseline manual tone sound design ${studioToneDrift.largestLabel} ${studioToneDrift.directionLabel} ${studioToneBaseline.sourceLabel} beginner producer`,
      disabled: !studioToneDriftTarget,
      run: () => {
        if (studioToneDriftTarget) {
          onResetLargestStudioToneDrift();
        }
      }
    },
    ...studioToneResetActions,
    ...soundSnapshotActions,
    {
      id: "sound-preset-readout-action",
      title: `Review Sound Preset: ${soundPresetPreviewSummary.presetLabel}`,
      detail: `${soundPresetPreviewSummary.statusLabel} / ${soundPresetPreviewSummary.toneLabel} / ${soundPresetPreviewSummary.changeLabel}`,
      group: "Create",
      keywords: `Quick Actions Sound Preset Readout review full tone design preview apply posture drums 808 bass duck sidechain synth chords ${
        soundPresetPreviewSummary.presetId
      } ${soundPresetPreviewSummary.presetLabel} ${soundPresetPreviewSummary.statusLabel} ${
        soundPresetPreviewSummary.toneLabel
      } beginner producer manual sound design`,
      resultTargetId: soundPresetPreviewSummary.presetId,
      run: onFocusSoundPresetReadout
    },
    {
      id: "sound-preset-decision",
      title: soundPresetReady
        ? `Run Sound Preset Decision: Apply ${soundPresetPreviewSummary.presetLabel}`
        : "Run Sound Preset Decision: Aligned",
      detail: soundPresetReady
        ? `${soundPresetPreviewSummary.statusLabel} / ${soundPresetPreviewSummary.changeLabel} / ${soundPresetPreviewSummary.toneLabel}`
        : `${soundPresetPreviewSummary.statusLabel} / Current editable sound already matches this preset.`,
      group: "Create",
      keywords: `Quick Actions Sound Preset Decision preview decision apply full tone design preset drums 808 bass duck sidechain synth chords ${
        soundPresetPreviewSummary.presetId
      } ${soundPresetPreviewSummary.presetLabel} ${soundPresetReady ? "apply-suggested" : "aligned"} beginner producer`,
      disabled: !soundPresetReady,
      run: () => {
        if (soundPresetReady) {
          onApplySoundPreset(soundPresetPreviewSummary.presetId);
        }
      }
    },
    {
      id: "sound-preset",
      title: soundPresetReady ? `Apply ${soundPresetPreviewSummary.presetLabel}` : "Apply Sound Preset",
      detail: soundPresetReady
        ? `${soundPresetPreviewSummary.toneLabel} / ${soundPresetPreviewSummary.changeLabel}`
        : "Current sound already matches the previewed preset.",
      group: "Create",
      keywords: `sound preset tone design full drums 808 bass duck sidechain synth chords ${soundPresetPreviewSummary.presetId} ${soundPresetPreviewSummary.presetLabel} beginner producer`,
      disabled: !soundPresetReady,
      run: () => {
        if (soundPresetReady) {
          onApplySoundPreset(soundPresetPreviewSummary.presetId);
        }
      }
    },
    ...soundPresetActions,
    {
      id: "beat-readiness-focus",
      title: beatReadinessCheck ? `Focus Beat Readiness: ${beatReadinessCheck.label}` : "Focus Beat Readiness",
      detail: beatReadinessCheck ? `${beatReadinessCheck.status} / ${beatReadinessCheck.focusLabel}` : "No Beat Readiness check available.",
      group: "Project",
      keywords: `beat readiness focus direct check compose arrange master deliver inspect ${beatReadinessCheck?.id ?? "none"} ${beatReadinessCheck?.focusLabel ?? "none"} beginner producer`,
      disabled: !beatReadinessCheck,
      run: () => {
        if (beatReadinessCheck) {
          onFocusBeatReadiness(beatReadinessCheck);
        }
      }
    },
    ...beatReadinessActions,
    {
      id: "listening-pass-focus",
      title: listeningPassItem ? `Focus Listening Pass: ${listeningPassItem.label}` : "Focus Listening Pass",
      detail: listeningPassItem ? `${listeningPassItem.status} / ${listeningPassItem.focusLabel}` : "No Listening Pass checkpoint available.",
      group: "Project",
      keywords: `listening pass focus audition checkpoint compose arrange mix delivery listen inspect ${listeningPassItem?.id ?? "none"} ${listeningPassItem?.focusLabel ?? "none"} beginner producer`,
      disabled: !listeningPassItem,
      run: () => {
        if (listeningPassItem) {
          onFocusListeningPass(listeningPassItem);
        }
      }
    },
    ...listeningPassActions,
    {
      id: "beat-passport-focus",
      title: beatPassportMetric ? `Focus Beat Passport: ${beatPassportMetric.label}` : "Focus Beat Passport",
      detail: beatPassportMetric ? `${beatPassportMetric.value} / ${beatPassportMetric.focusLabel}` : "No Beat Passport metric available.",
      group: "Project",
      keywords: `beat passport focus identity status target length patterns readiness export stems master inspect ${beatPassportMetric?.id ?? "none"} ${beatPassportMetric?.focusLabel ?? "none"} beginner producer`,
      disabled: !beatPassportMetric,
      run: () => {
        if (beatPassportMetric) {
          onFocusBeatPassport(beatPassportMetric);
        }
      }
    },
    ...beatPassportActions,
    {
      id: "production-snapshot-focus",
      title: productionSnapshotMetric ? `Focus Production Snapshot: ${productionSnapshotMetric.label}` : "Focus Production Snapshot",
      detail: productionSnapshotMetric
        ? `${productionSnapshotMetric.value} / ${productionSnapshotMetric.focusLabel}`
        : "No Production Snapshot metric available.",
      group: "Project",
      keywords: `production snapshot focus session scan target form patterns mix handoff inspect ${productionSnapshotMetric?.id ?? "none"} ${productionSnapshotMetric?.focusLabel ?? "none"} beginner producer`,
      disabled: !productionSnapshotMetric,
      run: () => {
        if (productionSnapshotMetric) {
          onFocusProductionSnapshot(productionSnapshotMetric);
        }
      }
    },
    ...productionSnapshotActions,
    {
      id: "snapshot-compare-focus",
      title: snapshotCompareItem ? `Focus Snapshot Compare: ${snapshotCompareItem.label}` : "Focus Snapshot Compare",
      detail: snapshotCompareItem
        ? `${snapshotCompareItem.cardName} / ${snapshotCompareItem.value} / ${snapshotCompareItem.focusLabel}`
        : "Save a Project Snapshot before comparing takes.",
      group: "Project",
      keywords: `snapshot compare focus saved take version setup length readiness export stems master inspect ${snapshotCompareItem?.metricId ?? "none"} ${snapshotCompareItem?.focusLabel ?? "none"} beginner producer`,
      disabled: !snapshotCompareItem,
      run: () => {
        if (snapshotCompareItem) {
          onFocusSnapshotCompare(snapshotCompareItem);
        }
      }
    },
    ...snapshotCompareActions,
    {
      id: "hook-readiness-focus",
      title: hookReadinessCard ? `Focus Hook Readiness: ${hookReadinessCard.label}` : "Focus Hook Readiness",
      detail: hookReadinessCard
        ? `${hookReadinessCard.value} / ${hookReadinessCard.focusLabel}`
        : "No Hook Readiness card available.",
      group: "Arrange",
      keywords: `hook readiness focus meter current hook contrast motif mix handoff inspect ${hookReadinessCard?.id ?? "none"} ${hookReadinessCard?.focusLabel ?? "none"} beginner producer`,
      disabled: !hookReadinessCard,
      run: () => {
        if (hookReadinessCard) {
          onFocusHookReadiness(hookReadinessCard);
        }
      }
    },
    ...hookReadinessActions,
    {
      id: "topline-space-focus",
      title: toplineSpaceCard ? `Focus Topline Space: ${toplineSpaceCard.label}` : "Focus Topline Space",
      detail: toplineSpaceCard
        ? `${toplineSpaceCard.value} / ${toplineSpaceCard.focusLabel}`
        : "No Topline Space card available.",
      group: "Project",
      keywords: `topline space vocal pocket focus singer rapper lead hook room inspect ${toplineSpaceCard?.id ?? "none"} ${toplineSpaceCard?.focusLabel ?? "none"} beginner producer`,
      disabled: !toplineSpaceCard,
      run: () => {
        if (toplineSpaceCard) {
          onFocusToplineSpace(toplineSpaceCard);
        }
      }
    },
    ...toplineSpaceActions,
    {
      id: "finish-checklist-focus",
      title: finishChecklistCard ? `Focus Finish Checklist: ${finishChecklistCard.label}` : "Focus Finish Checklist",
      detail: finishChecklistCard ? `${finishChecklistCard.status} / ${finishChecklistCard.focusLabel}` : "No Finish Checklist card available.",
      group: "Project",
      keywords: `finish checklist focus ready review compose arrange mix master handoff export inspect ${finishChecklistCard?.id ?? "none"} ${finishChecklistCard?.focusLabel ?? "none"} beginner producer`,
      disabled: !finishChecklistCard,
      run: () => {
        if (finishChecklistCard) {
          onFocusFinishChecklist(finishChecklistCard);
        }
      }
    },
    ...finishChecklistActions,
    {
      id: "review-queue-focus",
      title: reviewQueueItem ? `Focus Review Queue: ${reviewQueueItem.area}` : "Focus Review Queue",
      detail: reviewQueueItem ? `${reviewQueueItem.status} / ${reviewQueueItem.focusLabel}` : "No Review Queue item available.",
      group: "Project",
      keywords: `review queue focus issue top priority inspect ${reviewQueueItem?.area ?? "none"} ${reviewQueueItem?.focusLabel ?? "none"} beginner producer`,
      disabled: !reviewQueueItem,
      run: () => {
        if (reviewQueueItem) {
          onFocusReviewQueue(reviewQueueItem);
        }
      }
    },
    {
      id: "review-fix",
      title: reviewFixItem ? `Apply Review Fix: ${reviewFixItem.area}` : "Apply Review Fix",
      detail: reviewFixOption ? `${reviewFixOption.label} / ${reviewFixOption.detail}` : "No Review Queue fix target.",
      group: reviewFixOption?.group ?? "Project",
      keywords: `review fix action top issue triage ${reviewFixItem?.id ?? "none"} ${reviewFixItem?.area ?? "none"} ${
        reviewFixOption?.label ?? "none"
      } beginner producer`,
      disabled: !reviewFixItem || !reviewFixOption,
      run: () => onApplyReviewFix(reviewFixItem ?? undefined)
    },
    ...reviewQueueActions,
    ...reviewQueueFixActions,
    {
      id: "export-preflight-focus",
      title: exportPreflightCard ? `Focus Export Preflight: ${exportPreflightCard.label}` : "Focus Export Preflight",
      detail: exportPreflightCard ? `${exportPreflightCard.value} / ${exportPreflightCard.focusLabel}` : "No Export Preflight card available.",
      group: "Export",
      keywords: `export preflight focus delivery risk send blocker ${exportPreflightCard?.id ?? "none"} ${exportPreflightCard?.focusLabel ?? "none"} beginner producer`,
      disabled: !exportPreflightCard,
      run: () => {
        if (exportPreflightCard) {
          onFocusExportPreflight(exportPreflightCard);
        }
      }
    },
    ...exportPreflightActions,
    {
      id: "workflow-spotlight-focus",
      title: `Focus ${workflowSpotlight.zoneLabel}`,
      detail: `${workflowSpotlight.statusLabel} / ${workflowSpotlight.detailLabel}`,
      group: "Project",
      keywords: `workflow spotlight focus navigator next blocker review jump ${workflowSpotlight.zoneId ?? "none"} compose arrange mix deliver beginner producer`,
      disabled: !workflowSpotlightItem,
      run: () => {
        if (workflowSpotlightItem) {
          onFocusWorkflowSpotlight(workflowSpotlightItem);
        }
      }
    },
    ...workflowNavigatorActions,
    {
      id: "undo",
      title: nextUndoLabel ? `Undo: ${nextUndoLabel}` : "Undo",
      detail: nextUndoLabel ? `Restore state before ${nextUndoLabel}.` : "Undo the last project edit.",
      group: "Edit",
      keywords: `undo edit history revert ${nextUndoLabel ?? "none"}`,
      disabled: !canUndo,
      run: onUndo
    },
    {
      id: "redo",
      title: nextRedoLabel ? `Redo: ${nextRedoLabel}` : "Redo",
      detail: nextRedoLabel ? `Restore ${nextRedoLabel} after undo.` : "Redo the last undone project edit.",
      group: "Edit",
      keywords: `redo edit history ${nextRedoLabel ?? "none"}`,
      disabled: !canRedo,
      run: onRedo
    },
    {
      id: "blueprint",
      title: `Apply ${suggestedBlueprintName}`,
      detail: "Start from an editable beat with drums, 808, harmony, arrangement, and mix.",
      group: "Create",
      keywords: "blueprint starter beat drums 808 chords arrangement mix",
      run: () => onApplyBlueprint(suggestedBlueprint)
    },
    {
      id: "blueprint-style-match",
      title: `Apply ${currentStyleName} starter`,
      detail: `${suggestedBlueprintName} / sample-free drums, 808, harmony, arrangement, sound, and master.`,
      group: "Create",
      keywords: `current style match blueprint starter ${currentStyleName} ${project.styleId} ${suggestedBlueprintName} beat drums 808 bass chords synth arrangement sound master sample free`,
      run: () => onApplyBlueprint(suggestedBlueprint)
    },
    {
      id: "blueprint-preview-style-match",
      title: `Preview ${currentStyleName} starter`,
      detail: `${suggestedBlueprintName} preview only / no project edits until Apply.`,
      group: "Create",
      keywords: `preview current style match blueprint starter ${currentStyleName} ${project.styleId} ${suggestedBlueprintName} beat drums 808 bass chords synth arrangement sound master sample free safe`,
      run: () => onPreviewBlueprint(suggestedBlueprint)
    },
    blueprintPreviewDecisionAction,
    ...blueprintActions,
    ...patternVariationPresetIds.map((preset): QuickAction => {
      const label = patternVariationPresetLabel(preset);
      return {
        id: `pattern-variation-${preset}`,
        title: `Apply ${label} Variation`,
        detail: `Apply ${label} variation to Pattern ${project.selectedPattern}.`,
        group: "Create",
        keywords: `pattern variation ${preset} ${label} subtle hook break drums 808 melody chords beginner producer`,
        run: () => onApplyPatternVariation(preset)
      };
    }),
    {
      id: "fill-drums",
      title: "Apply Drum Fill",
      detail: `Add an editable tail move to Pattern ${project.selectedPattern}.`,
      group: "Create",
      keywords: "drum fill pattern tail variation",
      run: () => onApplyPatternFill("drum_fill")
    },
    {
      id: "fill-bass",
      title: "Apply 808 Pickup",
      detail: `Add a bass pickup to Pattern ${project.selectedPattern}.`,
      group: "Create",
      keywords: "808 bass pickup fill pattern",
      run: () => onApplyPatternFill("bass_pickup")
    },
    {
      id: "fill-melody",
      title: "Apply Melody Turn",
      detail: `Add a melodic turn to Pattern ${project.selectedPattern}.`,
      group: "Create",
      keywords: "melody turn fill pattern synth",
      run: () => onApplyPatternFill("melody_turn")
    },
    {
      id: "fill-clear-tail",
      title: "Clear Pattern Tail",
      detail: `Clear tail events from Pattern ${project.selectedPattern}.`,
      group: "Create",
      keywords: "clear tail pattern fill cleanup transition reset drums 808 melody chords",
      run: () => onApplyPatternFill("clear_tail")
    },
    selectedArrangementBlockReadoutAction,
    ...arrangementBlockJumpActions,
    songFormOverviewReadoutAction,
    songFormPriorityAction,
    ...structureLensCommandActions,
    arrangementPlaybackReadoutAction,
    audibleArrangementFollowReadoutAction,
    audibleArrangementFollowAction,
    ...selectedBlockActions,
    ...patternUseActions,
    {
      id: "arrangement-move-readout-action",
      title:
        arrangementMoveQuickActionPrioritySummary.presetId !== "none"
          ? `Review Arrangement Move: ${arrangementMoveQuickActionPrioritySummary.presetLabel}`
          : "Review Arrangement Move",
      detail:
        arrangementMoveQuickActionPrioritySummary.presetId !== "none"
          ? `${arrangementMoveQuickActionPrioritySummary.statusLabel} / ${arrangementMoveQuickActionPrioritySummary.scopeLabel} / ${arrangementMoveQuickActionPrioritySummary.impactLabel} / ${arrangementMoveQuickActionPrioritySummary.nextCheckLabel}`
          : arrangementMoveQuickActionPrioritySummary.reasonLabel,
      group: "Arrange",
      keywords: `Quick Actions Arrangement Move Readout review selected block section pattern bar length energy mute drop build hook lift reset selected pattern editable events ${
        arrangementMoveQuickActionPrioritySummary.presetId
      } ${arrangementMoveQuickActionPrioritySummary.presetLabel} ${
        arrangementMoveQuickActionPrioritySummary.statusLabel
      } beginner producer`,
      disabled: arrangementMoveQuickActionPrioritySummary.presetId === "none",
      run: onFocusArrangementMoveReadout
    },
    {
      id: "arrangement-move-decision",
      title: arrangementMoveDecisionSummary.disabled
        ? "Run Arrangement Move Decision"
        : `Run Arrangement Move Decision: ${arrangementMoveDecisionSummary.presetLabel}`,
      detail: arrangementMoveDecisionSummary.disabled
        ? arrangementMoveDecisionSummary.detailLabel
        : `${arrangementMoveDecisionSummary.statusLabel} / ${arrangementMoveDecisionSummary.metricLabel} / ${arrangementMoveDecisionSummary.detailLabel}`,
      group: "Arrange",
      keywords: `arrangement move decision preview selected block energy mute drop build hook lift reset ${arrangementMoveDecisionSummary.targetPresetId} ${arrangementMoveDecisionSummary.presetLabel} beginner producer`,
      disabled: arrangementMoveDecisionSummary.disabled,
      run: () => {
        if (arrangementMoveDecisionSummary.targetPresetId !== "none") {
          onApplyArrangementMove(arrangementMoveDecisionSummary.targetPresetId);
        }
      }
    },
    {
      id: "arrangement-move",
      title: arrangementMoveReady ? `Apply ${arrangementMoveLabel} Move` : "Apply Arrangement Move",
      detail:
        selectedBlock && arrangementMovePreset
          ? arrangementMoveReady
            ? `Block ${arrangementMoveBlockNumber} ${selectedBlock.section} / ${arrangementMoveLabel} energy-mute move.`
            : `Block ${arrangementMoveBlockNumber} already matches ${arrangementMoveLabel}.`
          : "No arrangement block selected.",
      group: "Arrange",
      keywords: `arrangement move selected block energy mute drop build hook lift reset ${arrangementMovePreset ?? "none"} ${arrangementMoveLabel} ${selectedBlock?.section ?? "none"} beginner producer`,
      disabled: !arrangementMoveReady,
      run: () => {
        if (arrangementMoveReady && arrangementMovePreset) {
          onApplyArrangementMove(arrangementMovePreset);
        }
      }
    },
    {
      id: "arrangement-focus-readout-action",
      title: arrangementFocusPreviewSummary ? `Review Arrangement Focus: ${arrangementFocusPreviewSummary.presetLabel}` : "Review Arrangement Focus",
      detail: arrangementFocusPreviewSummary
        ? `${arrangementFocusPreviewSummary.statusLabel} / ${arrangementFocusPreviewSummary.blockLabel} / ${arrangementFocusPreviewSummary.sectionLabel} / ${arrangementFocusPreviewSummary.energyLabel} / ${arrangementFocusPreviewSummary.muteLabel} / ${arrangementFocusPreviewSummary.moveLabel}`
        : "No arrangement block selected.",
      group: "Arrange",
      keywords: `Quick Actions Arrangement Focus Readout review selected block section pattern bar length energy mute intro verse hook bridge outro selected pattern editable events ${
        arrangementFocusPreviewSummary?.presetId ?? "none"
      } ${arrangementFocusPreviewSummary?.presetLabel ?? "none"} ${arrangementFocusPreviewSummary?.statusLabel ?? "none"} beginner producer`,
      disabled: !arrangementFocusPreviewSummary,
      run: onFocusArrangementFocusReadout
    },
    {
      id: "arrangement-focus",
      title:
        arrangementFocusReady && arrangementFocusPreviewSummary
          ? `Apply ${arrangementFocusPreviewSummary.presetLabel} Focus`
          : "Apply Arrangement Focus",
      detail: arrangementFocusPreviewSummary
        ? arrangementFocusReady
          ? `${arrangementFocusPreviewSummary.blockLabel} / ${arrangementFocusPreviewSummary.sectionLabel} / ${arrangementFocusPreviewSummary.energyLabel}`
          : `${arrangementFocusPreviewSummary.blockLabel} already matches ${arrangementFocusPreviewSummary.presetLabel}.`
        : "No arrangement block selected.",
      group: "Arrange",
      keywords: `arrangement focus selected block section pattern energy mutes intro verse hook bridge outro ${arrangementFocusPreviewSummary?.presetId ?? "none"} ${arrangementFocusPreviewSummary?.presetLabel ?? "none"} beginner producer`,
      disabled: !arrangementFocusReady,
      run: () => {
        if (arrangementFocusReady && arrangementFocusPreviewSummary) {
          onApplyArrangementFocus(arrangementFocusPreviewSummary.presetId);
        }
      }
    },
    {
      id: "arrangement-focus-decision",
      title:
        arrangementFocusDecisionSummary && !arrangementFocusDecisionSummary.disabled
          ? `Run Arrangement Focus Decision: ${arrangementFocusDecisionSummary.presetLabel}`
          : "Run Arrangement Focus Decision",
      detail: arrangementFocusDecisionSummary
        ? arrangementFocusDecisionSummary.disabled
          ? arrangementFocusDecisionSummary.detailLabel
          : `${arrangementFocusDecisionSummary.statusLabel} / ${arrangementFocusDecisionSummary.metricLabel} / ${arrangementFocusDecisionSummary.detailLabel}`
        : "No arrangement block selected.",
      group: "Arrange",
      keywords: `arrangement focus decision preview selected block section pattern energy mute intro verse hook bridge outro ${
        arrangementFocusDecisionSummary?.targetPresetId ?? "none"
      } ${arrangementFocusDecisionSummary?.presetLabel ?? "none"} beginner producer`,
      disabled: !arrangementFocusDecisionSummary || arrangementFocusDecisionSummary.disabled,
      run: () => {
        if (arrangementFocusDecisionSummary && !arrangementFocusDecisionSummary.disabled) {
          onApplyArrangementFocus(arrangementFocusDecisionSummary.targetPresetId);
        }
      }
    },
    ...arrangementFocusPresetActions,
    {
      id: "arrangement-mute-map-readout-action",
      title: arrangementMuteMapLane
        ? `Review Arrangement Mute Map: ${arrangementMuteMapLane.label}`
        : "Review Arrangement Mute Map",
      detail: arrangementMuteMapLane
        ? `${arrangementMuteMapLane.value} / ${arrangementMuteMapLane.status} / ${arrangementMuteMapLane.detail}`
        : "No Arrangement Mute Map lane available.",
      group: "Arrange",
      keywords: `Quick Actions Arrangement Mute Map Readout review layer dropouts mutes section drop build space priority lane selected pattern editable events ${
        arrangementMuteMapLane?.id ?? "none"
      } ${arrangementMuteMapLane?.label ?? "none"} beginner producer`,
      disabled: !arrangementMuteMapLane,
      run: onFocusArrangementMuteMapReadout
    },
    {
      id: "arrangement-mute-map-focus",
      title: arrangementMuteMapLane ? `Focus Mute Map: ${arrangementMuteMapLane.label}` : "Focus Arrangement Mute Map",
      detail: arrangementMuteMapLane
        ? `${arrangementMuteMapLane.value} / ${arrangementMuteMapLane.status}`
        : "No Arrangement Mute Map lane available.",
      group: "Arrange",
      keywords: `arrangement mute map focus layer mutes section drop build space ${arrangementMuteMapLane?.id ?? "none"} ${arrangementMuteMapLane?.label ?? "none"} beginner producer`,
      disabled: !arrangementMuteMapLane,
      run: () => {
        if (arrangementMuteMapLane) {
          onFocusArrangementMuteMap(arrangementMuteMapLane);
        }
      }
    },
    ...arrangementMuteMapActions,
    {
      id: "arrangement-transition-map-readout-action",
      title: arrangementTransition
        ? `Review Arrangement Transition Map: ${arrangementTransition.value}`
        : "Review Arrangement Transition Map",
      detail: arrangementTransition
        ? `${arrangementTransition.status} / ${arrangementTransition.energyLabel} / ${arrangementTransition.patternLabel} / ${
            arrangementTransition.muteLabel
          } / ${arrangementTransition.detail} / ${loopScopeStatus}`
        : "No Arrangement Transition Map transition available.",
      group: "Arrange",
      keywords: `Quick Actions Arrangement Transition Map Readout review handoff section transition pattern energy mute event density loop scope priority transition ${
        arrangementTransition?.fromSection ?? "none"
      } ${arrangementTransition?.toSection ?? "none"} beginner producer`,
      disabled: !arrangementTransition,
      run: onFocusArrangementTransitionMapReadout
    },
    {
      id: "arrangement-transition-map-focus",
      title: arrangementTransition
        ? `Focus Transition: ${arrangementTransition.value}`
        : "Focus Arrangement Transition Map",
      detail: arrangementTransition
        ? `${arrangementTransition.status} / ${arrangementTransition.energyLabel} / ${arrangementTransition.patternLabel}`
        : "No Arrangement Transition Map transition available.",
      group: "Arrange",
      keywords: `arrangement transition map focus handoff section pattern energy mute drop build turn ${
        arrangementTransition?.fromSection ?? "none"
      } ${arrangementTransition?.toSection ?? "none"} beginner producer`,
      disabled: !arrangementTransition,
      run: () => {
        if (arrangementTransition) {
          onFocusArrangementTransitionMap(arrangementTransition);
        }
      }
    },
    ...arrangementTransitionMapActions,
    {
      id: "pattern-chain-readout-action",
      title: `Review Pattern Chain: ${patternChainPreviewSummary.actionLabel}`,
      detail: `${patternChainPreviewSummary.statusLabel} / ${patternChainPreviewSummary.sequenceLabel} / ${patternChainPreviewSummary.sectionLabel} / ${patternChainPreviewSummary.moveLabel}`,
      group: "Arrange",
      keywords: `Quick Actions Pattern Chain Readout review arrangement structure preview decision priority pattern a b c sequence hook section energy ${
        patternChainPreviewSummary.actionId
      } ${patternChainPreviewSummary.actionLabel} ${patternChainPreviewSummary.sequenceLabel} beginner producer`,
      run: onFocusPatternChainReadout
    },
    {
      id: "chain-expand-readout-action",
      title: "Review Chain Expand",
      detail: `${patternChainPreviewSummary.statusLabel} / ${patternChainPreviewSummary.sequenceLabel} / target ${barCountLabel(16)} outline / ${patternChainPreviewSummary.moveLabel}`,
      group: "Arrange",
      keywords: `Quick Actions Chain Expand Readout review arrangement song form outline preview decision priority pattern a b c intro verse hook bridge outro 16 bar ${
        patternChainPreviewSummary.actionId
      } ${patternChainPreviewSummary.sequenceLabel} beginner producer`,
      run: onFocusChainExpandReadout
    },
    {
      id: "pattern-chain-decision",
      title: patternChainDecisionSummary.disabled
        ? "Run Pattern Chain Decision"
        : `Run Pattern Chain Decision: ${patternChainDecisionSummary.actionLabel}`,
      detail: patternChainDecisionSummary.disabled
        ? patternChainDecisionSummary.detailLabel
        : `${patternChainDecisionSummary.statusLabel} / ${patternChainDecisionSummary.metricLabel} / ${patternChainDecisionSummary.detailLabel}`,
      group: "Arrange",
      keywords: `pattern chain decision preview arrangement structure sketch song current suggested ${
        patternChainDecisionSummary.targetActionId
      } ${patternChainDecisionSummary.actionLabel} ${patternChainDecisionSummary.actionId} a b c hook switch break turn expand beginner producer`,
      disabled: patternChainDecisionSummary.disabled,
      run: () => {
        if (patternChainDecisionSummary.disabled || patternChainDecisionSummary.targetActionId === "aligned") {
          return;
        }
        if (patternChainDecisionSummary.targetActionId === "expand") {
          onExpandPatternChain();
          return;
        }
        onApplyPatternChain(patternChainDecisionSummary.targetActionId);
      }
    },
    ...patternChainActions,
    {
      id: "chain-expand",
      title: "Expand Pattern Chain",
      detail: "Turn the current Pattern A/B/C chain into a 16-bar song-form outline.",
      group: "Arrange",
      keywords: "chain expand pattern chain arrangement song form intro verse hook bridge outro structure",
      run: onExpandPatternChain
    },
    {
      id: "arrangement-template-readout-action",
      title: `Review Arrangement Template: ${arrangementTemplatePreviewSummary.templateLabel}`,
      detail: `${arrangementTemplatePreviewSummary.statusLabel} / ${arrangementTemplatePreviewSummary.sectionLabel} / ${arrangementTemplatePreviewSummary.patternLabel} / ${arrangementTemplatePreviewSummary.moveLabel}`,
      group: "Arrange",
      keywords: `Quick Actions Arrangement Template Readout review song form template preview decision priority pattern a b c section flow hook blocks selected pattern editable events ${
        arrangementTemplateId ?? "aligned"
      } ${arrangementTemplatePreviewSummary.templateLabel} ${arrangementTemplatePreviewSummary.statusLabel} beginner producer`,
      run: onFocusArrangementTemplateReadout
    },
    {
      id: "arrangement-template-decision",
      title: arrangementTemplateDecision.disabled
        ? "Run Arrangement Template Decision"
        : `Run Arrangement Template Decision: ${arrangementTemplateDecision.templateLabel}`,
      detail: arrangementTemplateDecision.disabled
        ? arrangementTemplateDecision.detailLabel
        : `${arrangementTemplateDecision.statusLabel} / ${arrangementTemplateDecision.metricLabel} / ${arrangementTemplateDecision.detailLabel}`,
      group: "Arrange",
      keywords: `arrangement template decision preview song form full beat hook first breakdown structure current suggested ${
        arrangementTemplateId ?? "aligned"
      } ${arrangementTemplateDecision.templateLabel} ${arrangementTemplateDecision.actionId} beginner producer`,
      disabled: arrangementTemplateDecision.disabled,
      run: () => {
        if (!arrangementTemplateDecision.disabled && arrangementTemplateId) {
          onApplyArrangementTemplate(arrangementTemplateId);
        }
      }
    },
    {
      id: "arrangement-template",
      title: arrangementTemplateId ? arrangementTemplateDecision.actionLabel : "Apply Arrangement Template",
      detail: arrangementTemplateId
        ? `${arrangementTemplateDecision.metricLabel} / ${arrangementTemplateDecision.detailLabel}`
        : "Current arrangement already matches available templates.",
      group: "Arrange",
      keywords: `arrangement template song form full beat hook first breakdown structure current suggested ${
        arrangementTemplateId ?? "aligned"
      } ${arrangementTemplateDecision.templateLabel} ${arrangementTemplateDecision.actionId} beginner producer`,
      disabled: !arrangementTemplateId,
      run: () => {
        if (arrangementTemplateId) {
          onApplyArrangementTemplate(arrangementTemplateId);
        }
      }
    },
    ...arrangementTemplateActions,
    {
      id: "arrangement-arc-readout-action",
      title: `Review Arrangement Arc: ${arrangementArcPreviewSummary.padLabel}`,
      detail: `${arrangementArcPreviewSummary.statusLabel} / ${arrangementArcPreviewSummary.sectionLabel} / ${arrangementArcPreviewSummary.patternLabel} / ${arrangementArcPreviewSummary.energyLabel} / ${arrangementArcPreviewSummary.muteLabel} / ${arrangementArcPreviewSummary.moveLabel}`,
      group: "Arrange",
      keywords: `Quick Actions Arrangement Arc Readout review full song energy section pattern mute hook lift break rise selected pattern editable events ${
        arrangementArcPreviewSummary.padId
      } ${arrangementArcPreviewSummary.padLabel} ${arrangementArcPreviewSummary.statusLabel} beginner producer`,
      run: onFocusArrangementArcReadout
    },
    {
      id: "arrangement-arc-decision",
      title: arrangementArcDecisionSummary.disabled
        ? "Run Arrangement Arc Decision"
        : `Run Arrangement Arc Decision: ${arrangementArcDecisionSummary.padLabel}`,
      detail: arrangementArcDecisionSummary.disabled
        ? arrangementArcDecisionSummary.detailLabel
        : `${arrangementArcDecisionSummary.statusLabel} / ${arrangementArcDecisionSummary.metricLabel} / ${arrangementArcDecisionSummary.detailLabel}`,
      group: "Arrange",
      keywords: `arrangement arc decision preview full song energy section pattern mute hook lift break rise ${arrangementArcDecisionSummary.targetPadId} ${arrangementArcDecisionSummary.padLabel} beginner producer`,
      disabled: arrangementArcDecisionSummary.disabled,
      run: () => {
        if (!arrangementArcDecisionSummary.disabled) {
          onApplyArrangementArc(arrangementArcDecisionSummary.targetPadId);
        }
      }
    },
    {
      id: "arrangement-arc",
      title: arrangementArcReady ? `Apply ${arrangementArcPreviewSummary.padLabel} Arc` : "Apply Arrangement Arc",
      detail: arrangementArcReady
        ? `${arrangementArcPreviewSummary.sectionLabel} / ${arrangementArcPreviewSummary.energyLabel}`
        : "Current arrangement already matches the suggested arc.",
      group: "Arrange",
      keywords: `arrangement arc energy song form dynamics hook lift break rise sections mutes ${arrangementArcPreviewSummary.padId} ${arrangementArcPreviewSummary.padLabel} beginner producer`,
      disabled: !arrangementArcReady,
      run: () => {
        if (arrangementArcReady) {
          onApplyArrangementArc(arrangementArcPreviewSummary.padId);
        }
      }
    },
    ...arrangementArcPadActions,
    {
      id: "mix-coach-focus",
      title: mixCoachCheck ? `Focus Mix Coach: ${mixCoachCheck.label}` : "Focus Mix Coach",
      detail: mixCoachCheck ? `${mixCoachCheck.status} / ${mixCoachCheck.detail}` : "No Mix Coach check available.",
      group: "Mix",
      keywords: `mix coach focus current top check diagnostic headroom limiter stem balance low end ${mixCoachCheck?.id ?? "none"} ${mixCoachCheck?.label ?? "none"} beginner producer`,
      disabled: !mixCoachCheck,
      run: () => {
        if (mixCoachCheck) {
          onFocusMixCoach(mixCoachCheck);
        }
      }
    },
    ...mixCoachActions,
    stemAuditionReadoutAction,
    stemAuditionDecisionAction,
    ...stemAuditionPadOptions.map((pad): QuickAction => ({
      id: `stem-audition-${pad.id}`,
      title: pad.trackId === null ? "Audition Full Mix" : `Audition ${pad.label} Stem`,
      detail:
        pad.changedCount > 0
          ? `${pad.preview} / ${pad.changedCount} mixer change${pad.changedCount === 1 ? "" : "s"}`
          : `${pad.label} stem audition already selected.`,
      group: "Mix",
      keywords: `stem audition solo mute full mix drums 808 bass synth chords ${pad.id} ${pad.label} ${pad.detail} mixer compare beginner producer`,
      disabled: pad.active,
      resultTargetId: pad.id,
      run: () => onApplyStemAudition(pad.id)
    })),
    mixSnapshotReadoutAction,
    mixSnapshotDecisionAction,
    {
      id: "mix-snapshot-capture-a",
      title: "Capture Mix Snapshot A",
      detail: mixSnapshots.A
        ? `Replace A / ${mixSnapshots.A.exportLabel} / ${mixSnapshots.A.balanceLabel}`
        : "Capture current mix into A for A/B comparison.",
      group: "Mix",
      keywords: "mix snapshot capture a ab compare headroom balance master stems save slot producer beginner",
      resultTargetId: "capture-a",
      run: () => onCaptureMixSnapshot("A")
    },
    {
      id: "mix-snapshot-capture-b",
      title: "Capture Mix Snapshot B",
      detail: mixSnapshots.B
        ? `Replace B / ${mixSnapshots.B.exportLabel} / ${mixSnapshots.B.balanceLabel}`
        : "Capture current mix into B for A/B comparison.",
      group: "Mix",
      keywords: "mix snapshot capture b ab compare headroom balance master stems save slot producer beginner",
      resultTargetId: "capture-b",
      run: () => onCaptureMixSnapshot("B")
    },
    {
      id: "mix-snapshot-recall-a",
      title: "Recall Mix Snapshot A",
      detail: mixSnapshots.A
        ? `Apply A / ${mixSnapshots.A.exportLabel} / ${mixSnapshots.A.masterLabel}`
        : "Capture A before recalling a mix pass.",
      group: "Mix",
      keywords: "mix snapshot recall restore apply a ab compare headroom balance master stems choose pass producer beginner",
      disabled: !mixSnapshots.A,
      resultTargetId: "recall-a",
      run: () => onRecallMixSnapshot("A")
    },
    {
      id: "mix-snapshot-recall-b",
      title: "Recall Mix Snapshot B",
      detail: mixSnapshots.B
        ? `Apply B / ${mixSnapshots.B.exportLabel} / ${mixSnapshots.B.masterLabel}`
        : "Capture B before recalling a mix pass.",
      group: "Mix",
      keywords: "mix snapshot recall restore apply b ab compare headroom balance master stems choose pass producer beginner",
      disabled: !mixSnapshots.B,
      resultTargetId: "recall-b",
      run: () => onRecallMixSnapshot("B")
    },
    {
      id: "mix-snapshot-clear",
      title: "Clear Mix Snapshot A/B",
      detail:
        mixSnapshots.A || mixSnapshots.B
          ? `${mixSnapshots.A ? "A held" : "A empty"} / ${mixSnapshots.B ? "B held" : "B empty"}`
          : "Mix Snapshot A/B already clear.",
      group: "Mix",
      keywords: "mix snapshot clear reset ab compare headroom balance master stems producer beginner",
      disabled: !mixSnapshots.A && !mixSnapshots.B,
      resultTargetId: "clear",
      run: onClearMixSnapshots
    },
    mixBalanceReadoutAction,
    {
      id: "mix-balance-decision",
      title: mixBalanceReady ? `Run Mix Balance Decision: Apply ${mixBalancePreviewSummary.padLabel}` : "Run Mix Balance Decision: Aligned",
      detail: mixBalanceReady
        ? `${mixBalancePreviewSummary.statusLabel} / ${mixBalancePreviewSummary.channelLabel} / ${mixBalancePreviewSummary.auditionLabel}`
        : `${mixBalancePreviewSummary.statusLabel} / Current editable mixer already matches this balance.`,
      group: "Mix",
      keywords: `Quick Actions Mix Balance Decision preview decision apply suggested rough levels drums 808 bass synth chords stem audition ${
        mixBalancePreviewSummary.padId
      } ${mixBalancePreviewSummary.padLabel} ${mixBalanceReady ? "apply-suggested" : "aligned"} beginner producer`,
      disabled: !mixBalanceReady,
      run: () => {
        if (mixBalanceReady) {
          onApplyMixBalance(mixBalancePreviewSummary.padId);
        }
      }
    },
    {
      id: "mix-balance",
      title: mixBalanceReady ? `Apply ${mixBalancePreviewSummary.padLabel}` : "Apply Mix Balance",
      detail: mixBalanceReady
        ? `${mixBalancePreviewSummary.channelLabel} / ${mixBalancePreviewSummary.auditionLabel}`
        : "Current mixer already matches the previewed balance.",
      group: "Mix",
      keywords: `mix balance rough levels drums 808 bass synth chords stem audition ${mixBalancePreviewSummary.padId} ${mixBalancePreviewSummary.padLabel} beginner producer`,
      disabled: !mixBalanceReady,
      run: () => {
        if (mixBalanceReady) {
          onApplyMixBalance(mixBalancePreviewSummary.padId);
        }
      }
    },
    ...mixBalancePadActions,
    spaceFxReadoutAction,
    {
      id: "space-fx-decision",
      title: spaceFxReady ? `Run Space FX Decision: Apply ${spaceFxPreviewSummary.padLabel}` : "Run Space FX Decision: Aligned",
      detail: spaceFxReady
        ? `${spaceFxPreviewSummary.statusLabel} / ${spaceFxPreviewSummary.sendLabel} / ${spaceFxPreviewSummary.focusLabel}`
        : `${spaceFxPreviewSummary.statusLabel} / Current editable sends already match this space.`,
      group: "Mix",
      keywords: `Quick Actions Space FX Decision preview decision apply suggested space send ambience reverb room wide wash dry ${
        spaceFxPreviewSummary.padId
      } ${spaceFxPreviewSummary.padLabel} ${spaceFxReady ? "apply-suggested" : "aligned"} drums 808 synth chords beginner producer`,
      disabled: !spaceFxReady,
      run: () => {
        if (spaceFxReady) {
          onApplySpaceFx(spaceFxPreviewSummary.padId);
        }
      }
    },
    {
      id: "space-fx",
      title: spaceFxReady ? `Apply ${spaceFxPreviewSummary.padLabel}` : "Apply Space FX",
      detail: spaceFxReady
        ? `${spaceFxPreviewSummary.sendLabel} / ${spaceFxPreviewSummary.focusLabel}`
        : "Current Space sends already match the previewed space.",
      group: "Mix",
      keywords: `space fx current suggested send ambience reverb room wide wash dry ${spaceFxPreviewSummary.padId} ${spaceFxPreviewSummary.padLabel} drums 808 synth chords beginner producer`,
      disabled: !spaceFxReady,
      run: () => {
        if (spaceFxReady) {
          onApplySpaceFx(spaceFxPreviewSummary.padId);
        }
      }
    },
    ...spaceFxPadOptions.map((pad): QuickAction => ({
      id: `space-fx-${pad.id}`,
      title: `Apply ${pad.label} Space FX`,
      detail:
        pad.changedCount > 0
          ? `${pad.preview} / ${pad.changedCount} send${pad.changedCount === 1 ? "" : "s"}`
          : `${pad.label} Space FX already selected.`,
      group: "Mix",
      keywords: `space fx send ambience reverb room wide wash dry ${pad.id} ${pad.label} ${pad.detail} drums 808 synth chords beginner producer`,
      disabled: pad.changedCount === 0,
      run: () => {
        if (pad.changedCount > 0) {
          onApplySpaceFx(pad.id);
        }
      }
    })),
    {
      id: "master-automation-readout-action",
      title: `Review Master Automation: ${masterAutomationPreviewSummary.padLabel}`,
      detail: `${masterAutomationPreviewSummary.statusLabel} / ${masterAutomationPreviewSummary.eventLabel} / ${masterAutomationPreviewSummary.rangeLabel} / ${masterAutomationPreviewSummary.changeLabel}`,
      group: "Mix",
      keywords: `Quick Actions Master Automation Readout review fade lane preview apply posture none fade in fade out intro outro realtime export wav stems ${
        masterAutomationPreviewSummary.padId
      } ${masterAutomationPreviewSummary.padLabel} ${masterAutomationPreviewSummary.statusLabel} ${
        masterAutomationPreviewSummary.eventLabel
      } beginner producer manual automation`,
      resultTargetId: masterAutomationPreviewSummary.padId,
      run: onFocusMasterAutomationReadout
    },
    {
      id: "master-automation-decision",
      title:
        masterAutomationReady && masterAutomationSuggestedPad
          ? `Run Master Automation Decision: Apply ${masterAutomationPreviewSummary.padLabel}`
          : "Run Master Automation Decision: Aligned",
      detail:
        masterAutomationReady && masterAutomationSuggestedPad
          ? `${masterAutomationPreviewSummary.statusLabel} / ${masterAutomationPreviewSummary.eventLabel} / ${masterAutomationPreviewSummary.rangeLabel}`
          : `${masterAutomationPreviewSummary.statusLabel} / Current editable automation already matches this fade.`,
      group: "Mix",
      keywords: `Quick Actions Master Automation Decision preview decision apply suggested fade lane fade in fade out intro outro realtime export wav stems ${
        masterAutomationPreviewSummary.padId
      } ${masterAutomationPreviewSummary.padLabel} ${
        masterAutomationReady && masterAutomationSuggestedPad ? "apply-suggested" : "aligned"
      } beginner producer`,
      disabled: !masterAutomationReady || !masterAutomationSuggestedPad,
      resultTargetId: masterAutomationPreviewSummary.padId,
      run: () => {
        if (masterAutomationReady && masterAutomationSuggestedPad) {
          onApplyMasterAutomation(masterAutomationPreviewSummary.padId);
        }
      }
    },
    {
      id: "master-automation",
      title:
        masterAutomationReady && masterAutomationSuggestedPad
          ? `Apply ${masterAutomationPreviewSummary.padLabel}`
          : "Apply Master Automation",
      detail:
        masterAutomationReady && masterAutomationSuggestedPad
          ? `${masterAutomationPreviewSummary.eventLabel} / ${masterAutomationPreviewSummary.rangeLabel}`
          : "Current master automation already matches the suggested fade.",
      group: "Mix",
      keywords: `master automation current suggested fade lane fade in fade out intro outro realtime export wav stems ${masterAutomationPreviewSummary.padId} ${masterAutomationPreviewSummary.padLabel} beginner producer`,
      disabled: !masterAutomationReady || !masterAutomationSuggestedPad,
      resultTargetId: masterAutomationPreviewSummary.padId,
      run: () => {
        if (masterAutomationReady && masterAutomationSuggestedPad) {
          onApplyMasterAutomation(masterAutomationPreviewSummary.padId);
        }
      }
    },
    ...masterAutomationPadOptions.map((pad): QuickAction => ({
      id: `master-automation-${pad.id}`,
      title: pad.changedCount > 0 ? `Apply ${pad.label} Master Automation` : `${pad.label} Master Automation already applied`,
      detail:
        pad.changedCount > 0
          ? `${pad.preview} / ${pad.changedCount} automation event${pad.changedCount === 1 ? "" : "s"} / ${pad.detail}`
          : `${pad.label} already matches the current master automation lane.`,
      group: "Mix",
      keywords: `master automation direct pad fade lane ${pad.id} ${pad.label} ${pad.detail} ${pad.preview} realtime export wav stems beginner producer`,
      disabled: pad.changedCount === 0,
      resultTargetId: pad.id,
      run: () => {
        if (pad.changedCount > 0) {
          onApplyMasterAutomation(pad.id);
        }
      }
    })),
    {
      id: "export-meter",
      title: `Review Export Meter: ${exportAnalysis.status}`,
      detail: `${formatDb(exportAnalysis.peakDb)} peak / ${formatDb(exportAnalysis.rmsDb)} RMS / ${formatDb(
        exportDynamicsDb(exportAnalysis)
      )} dynamics / ${formatDb(exportAnalysis.headroomDb)} headroom / ${
        exportAnalysis.limitedSamples > 0 ? `limiter ${formatPercent(exportAnalysis.limitedPercent)}` : "limiter clear"
      }`,
      group: "Export",
      keywords: `export meter review readout peak rms dynamics headroom limiter master ceiling arrangement duration mix coach preflight wav render final output ${exportAnalysis.status} beginner producer`,
      run: onFocusExportMeter
    },
    {
      id: "master-output-role",
      title: `Review Master Output Role: ${masterOutputRoleSummary.roleLabel}`,
      detail: `${masterOutputRoleSummary.statusLabel} / ${masterOutputRoleSummary.levelLabel} / ${masterOutputRoleSummary.detailLabel}`,
      group: "Mix",
      keywords: `master output role readout final output posture preset export status ceiling output gain headroom limiter export meter mix coach handoff sheet ${project.masterPreset} ${exportAnalysis.status} ${masterOutputRoleSummary.roleLabel} beginner producer`,
      run: onFocusMasterOutputRole
    },
    {
      id: "mix-headroom",
      title: "Mix Fix Headroom",
      detail: "Set a vocal-safe ceiling and reduce master gain.",
      group: "Mix",
      keywords: "mix fix headroom master ceiling vocal limiter",
      run: () => onApplyMixFix("headroom")
    },
    {
      id: "mix-stem-balance",
      title: "Mix Fix Stem Balance",
      detail: "Nudge core stem volumes toward a rough balance.",
      group: "Mix",
      keywords: "mix fix stem balance volume drums bass synth chords",
      run: () => onApplyMixFix("stem_balance")
    },
    {
      id: "mix-low-end",
      title: "Mix Fix Low End",
      detail: "Tighten the 808 and drum relationship.",
      group: "Mix",
      keywords: "mix fix low end 808 drums bass glue",
      run: () => onApplyMixFix("low_end")
    },
    {
      id: "master-finish-readout-action",
      title: `Review Master Finish: ${masterFinishPreviewSummary.padLabel}`,
      detail: `${masterFinishPreviewSummary.statusLabel} / ${masterFinishPreviewSummary.presetLabel} / ${masterFinishPreviewSummary.ceilingLabel} / ${masterFinishPreviewSummary.outputLabel} / ${masterFinishPreviewSummary.changeLabel}`,
      group: "Mix",
      keywords: `Quick Actions Master Finish Readout review final output preview apply posture ceiling output demo vocal store club export meter stems ${
        masterFinishPreviewSummary.padId
      } ${masterFinishPreviewSummary.padLabel} ${masterFinishPreviewSummary.statusLabel} ${
        masterFinishPreviewSummary.presetLabel
      } beginner producer manual trim`,
      resultTargetId: masterFinishPreviewSummary.padId,
      run: onFocusMasterFinishReadout
    },
    {
      id: "master-finish-decision",
      title: masterFinishReady
        ? `Run Master Finish Decision: Apply ${masterFinishPreviewSummary.padLabel}`
        : "Run Master Finish Decision: Aligned",
      detail: masterFinishReady
        ? `${masterFinishPreviewSummary.statusLabel} / ${masterFinishPreviewSummary.presetLabel} / ${masterFinishPreviewSummary.outputLabel}`
        : `${masterFinishPreviewSummary.statusLabel} / Current editable master already matches this finish.`,
      group: "Mix",
      keywords: `Quick Actions Master Finish Decision preview decision apply suggested finish output ceiling demo vocal store club ${
        masterFinishPreviewSummary.padId
      } ${masterFinishPreviewSummary.padLabel} ${masterFinishReady ? "apply-suggested" : "aligned"} beginner producer`,
      disabled: !masterFinishReady,
      resultTargetId: masterFinishPreviewSummary.padId,
      run: () => {
        if (masterFinishReady) {
          onApplyMasterFinish(masterFinishPreviewSummary.padId);
        }
      }
    },
    {
      id: "master-finish",
      title: masterFinishReady ? `Apply ${masterFinishPreviewSummary.padLabel}` : "Apply Master Finish",
      detail: masterFinishReady
        ? `${masterFinishPreviewSummary.presetLabel} / ${masterFinishPreviewSummary.ceilingLabel} / ${masterFinishPreviewSummary.outputLabel}`
        : "Current master already matches the previewed finish.",
      group: "Mix",
      keywords: `master finish current suggested output ceiling demo vocal store club ${masterFinishPreviewSummary.padId} ${masterFinishPreviewSummary.padLabel} beginner producer`,
      disabled: !masterFinishReady,
      resultTargetId: masterFinishPreviewSummary.padId,
      run: () => {
        if (masterFinishReady) {
          onApplyMasterFinish(masterFinishPreviewSummary.padId);
        }
      }
    },
    ...masterFinishPadOptions.map((pad): QuickAction => ({
      id: `master-finish-${pad.id}`,
      title: pad.changedCount > 0 ? `Apply ${pad.label} Master Finish` : `${pad.label} Master Finish already applied`,
      detail:
        pad.changedCount > 0
          ? `${pad.preset} at ${formatDb(pad.ceilingDb)} ceiling / ${formatDb(pad.masterVolumeDb)} output / ${
              pad.changedCount
            } finish move${pad.changedCount === 1 ? "" : "s"}`
          : `${pad.label} already matches the current master output posture.`,
      group: "Mix",
      keywords: `master finish ${pad.id} ${pad.label} ${pad.detail} output ceiling demo vocal store club`,
      disabled: pad.changedCount === 0,
      resultTargetId: pad.id,
      run: () => {
        if (pad.changedCount > 0) {
          onApplyMasterFinish(pad.id);
        }
      }
    })),
    {
      id: "handoff-pack",
      title: `Review Handoff Pack: ${handoffRouteSummary.statusLabel}`,
      detail: `${handoffRouteSummary.routeLabel} / ${handoffManifestAudit.statusLabel} / ${handoffSendOrder.nextLabel} / ${handoffReceipt.statusLabel}`,
      group: "Export",
      keywords: `handoff pack review readout deliver package wav stems midi sheet route manifest receipt export format package check send order next export ${
        handoffRouteSummary.routeLabel
      } ${handoffManifestAudit.statusLabel} ${handoffSendOrder.nextLabel} ${handoffReceipt.statusLabel} ${
        handoffReadyCount
      }/${handoffPackItems.length} beginner producer`,
      run: onFocusHandoffPack
    },
    {
      id: "handoff-export-format-focus",
      title: handoffExportFormatMetric
        ? `Focus Export Format: ${handoffExportFormatMetric.label}`
        : "Focus Export Format",
      detail: handoffExportFormatMetric
        ? `${handoffExportFormatMetric.value} / ${handoffExportFormatMetric.detail}`
        : "No Handoff Export Format metric available.",
      group: "Export",
      keywords: `handoff export format focus wav stems midi sheet deliverable inspect ${handoffExportFormatMetric?.id ?? "none"} ${handoffExportFormatMetric?.value ?? "none"} beginner producer`,
      disabled: !handoffExportFormatMetric,
      run: () => {
        if (handoffExportFormatMetric) {
          onFocusHandoffExportFormat(handoffExportFormatMetric);
        }
      }
    },
    ...handoffExportFormatActions,
    {
      id: "handoff-manifest-audit-focus",
      title: `Focus Handoff Manifest Audit: ${handoffManifestAudit.statusLabel}`,
      detail: `${handoffManifestAudit.detailLabel} / ${handoffManifestAudit.receiptLabel} / ${handoffManifestAudit.nextLabel}`,
      group: "Export",
      keywords: `handoff manifest audit focus planned files readiness receipt next step wav stems midi sheet ${
        handoffManifestAudit.statusLabel
      } ${handoffManifestAudit.checks.map((check) => `${check.id} ${check.statusLabel}`).join(" ")} beginner producer`,
      run: onFocusHandoffManifestAudit
    },
    {
      id: "handoff-send-order-focus",
      title: handoffSendOrderCard
        ? `Focus Handoff Send Order: ${handoffSendOrder.nextLabel}`
        : "Focus Handoff Send Order",
      detail: `${handoffSendOrder.statusLabel} / ${handoffSendOrder.detailLabel}`,
      group: "Export",
      keywords: `handoff send order focus sequence next deliverable wav stems midi sheet no export ${
        handoffSendOrder.nextItemId ?? "clear"
      } ${handoffSendOrder.sequenceLabel} beginner producer`,
      disabled: !handoffSendOrderCard,
      run: () => {
        if (handoffSendOrderCard) {
          onFocusHandoffPackageCheck(handoffSendOrderCard);
        }
      }
    },
    {
      id: "handoff-export-receipt-focus",
      title: handoffExportReceiptCard
        ? `Focus Handoff Export Receipt: ${handoffExportReceiptCard.value}`
        : "Focus Handoff Export Receipt",
      detail: handoffExportReceiptCard
        ? `${handoffExportReceiptCard.status} / ${handoffExportReceiptCard.detail}`
        : "No Handoff Export Receipt readout available.",
      group: "Export",
      keywords: `handoff export receipt focus latest downloaded file confirm wav stems midi sheet deliverable ${
        handoffExportReceiptCard?.value ?? "none"
      } ${handoffExportReceiptCard?.status ?? "none"} beginner producer`,
      run: () => {
        if (handoffExportReceiptCard) {
          onFocusHandoffPackageCheck(handoffExportReceiptCard);
        }
      }
    },
    {
      id: "handoff-package-check-focus",
      title: handoffPackageCheckCard
        ? `Focus Handoff Package: ${handoffPackageCheckCard.label}`
        : "Focus Handoff Package",
      detail: handoffPackageCheckCard
        ? `${handoffPackageCheckCard.value} / ${handoffPackageCheckCard.status}`
        : "No Handoff Package Check card available.",
      group: "Export",
      keywords: `handoff package check focus send files order receipt context archive inspect ${handoffPackageCheckCard?.id ?? "none"} ${handoffPackageCheckCard?.status ?? "none"} beginner producer`,
      disabled: !handoffPackageCheckCard,
      run: () => {
        if (handoffPackageCheckCard) {
          onFocusHandoffPackageCheck(handoffPackageCheckCard);
        }
      }
    },
    ...handoffPackageCheckActions,
    {
      id: "handoff-next-export",
      title: nextHandoffItem ? `Export next handoff: ${nextHandoffItem.buttonLabel}` : "Export next handoff item",
      detail: nextHandoffItem
        ? `${handoffSendOrder.statusLabel} / ${nextHandoffItem.label}: ${nextHandoffItem.value} / ${nextHandoffItem.detail}`
        : "Handoff Pack send order is already clear.",
      group: "Export",
      keywords: `handoff pack next export send order wav stems midi sheet deliverable ${nextHandoffItem?.id ?? "complete"} ${handoffSendOrder.sequenceLabel} beginner producer`,
      disabled: !nextHandoffItem,
      run: () => {
        if (nextHandoffItem) {
          nextHandoffItem.run();
        }
      }
    },
    {
      id: "export-wav",
      title: "Export WAV",
      detail: "Render the full arrangement as a mix WAV.",
      group: "Export",
      keywords: "export render wav mix audio",
      run: onExportWav
    },
    {
      id: "export-stems",
      title: "Export stems",
      detail: "Render drum, 808, synth, and chord WAV stems.",
      group: "Export",
      keywords: "export render stems wav drums 808 synth chord",
      run: onExportStems
    },
    {
      id: "export-midi",
      title: "Export MIDI",
      detail: "Write arrangement MIDI for DAW handoff.",
      group: "Export",
      keywords: "export midi daw handoff arrangement",
      run: onExportMidi
    },
    {
      id: "export-handoff-sheet",
      title: "Export handoff sheet",
      detail: "Write a local text summary for collaboration or review.",
      group: "Export",
      keywords: "export sheet handoff notes session brief delivery target mix stems",
      run: onExportHandoffSheet
    }
  ];
}

export type NextMoveQuickActionSource = "beat-map" | "structure-lens";

export function createNextMoveSourceQuickActions(
  source: NextMoveQuickActionSource,
  actions: NextMoveAction[],
  onRunNextMove: (action: NextMoveAction) => void
): QuickAction[] {
  const sourceLabel = nextMoveQuickActionSourceLabel(source);
  const sourceGroup = source === "beat-map" ? "Project" : "Arrange";

  return actions.map((action) => ({
    id: nextMoveSourceQuickActionId(source, action.id),
    title: `${sourceLabel}: ${action.buttonLabel}`,
    detail: `${action.title} / ${action.detail}`,
    group: sourceGroup,
    keywords: `${sourceLabel} quick action workflow overview structure lens beat map next move ${action.id} ${action.buttonLabel} ${action.title} ${action.detail} ${action.command.kind} beginner producer direct beat composition`,
    run: () => onRunNextMove(action)
  }));
}

export function nextMoveSourceQuickActionId(source: NextMoveQuickActionSource, actionId: string): string {
  return `${source}-action-${actionId}`;
}

export function nextMoveQuickActionSourceLabel(source: NextMoveQuickActionSource): string {
  return source === "beat-map" ? "Beat Map" : "Structure Lens";
}

export function nextMoveQuickActionSource(actionId: string): NextMoveQuickActionSource | null {
  if (actionId.startsWith("beat-map-action-")) {
    return "beat-map";
  }
  if (actionId.startsWith("structure-lens-action-")) {
    return "structure-lens";
  }
  return null;
}

export function nextMoveQuickActionTargetId(actionId: string, source: NextMoveQuickActionSource): string {
  return actionId.slice(`${source}-action-`.length);
}

export function nextMoveQuickActionForProject(project: ProjectState, action: QuickAction): NextMoveAction | null {
  const source = nextMoveQuickActionSource(action.id);
  if (!source) {
    return null;
  }

  const targetId = nextMoveQuickActionTargetId(action.id, source);
  if (source === "structure-lens") {
    return createStructureLensActions(project).find((candidate) => candidate.id === targetId) ?? null;
  }

  const analysis = analyzeExport(project);
  const stemState = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, analysis);
  return createBeatMapActions(project, checks, analysis, stemState).find((candidate) => candidate.id === targetId) ?? null;
}








export const quickActionScopeDefinitions: Array<Omit<QuickActionScopeOption, "count">> = [
  { id: "all", label: "All" },
  { id: "transport", label: "Transport" },
  { id: "compose", label: "Compose" },
  { id: "arrange", label: "Arrange" },
  { id: "mix", label: "Mix" },
  { id: "master", label: "Master" },
  { id: "project", label: "Project" },
  { id: "export", label: "Export" }
];

export function filterQuickActions(actions: QuickAction[], query: string, scope: QuickActionScopeId): QuickAction[] {
  return actions
    .filter((action) => quickActionMatchesQuery(action, query) && quickActionMatchesScope(action, scope))
    .slice(0, 12);
}

export function createQuickActionScopeOptions(actions: QuickAction[], query: string): QuickActionScopeOption[] {
  const queryMatches = actions.filter((action) => quickActionMatchesQuery(action, query));

  return quickActionScopeDefinitions.map((definition) => ({
    ...definition,
    count: queryMatches.filter((action) => quickActionMatchesScope(action, definition.id)).length
  }));
}

export function createQuickActionScopeResult(
  scope: QuickActionScopeId,
  actions: QuickAction[],
  query: string
): QuickActionScopeResult {
  const scopeOptions = createQuickActionScopeOptions(actions, query);
  const option = scopeOptions.find((candidate) => candidate.id === scope);
  const filteredActions = filterQuickActions(actions, query, scope);
  const firstRunnableAction = filteredActions.find((action) => !action.disabled);
  const scopeLabel = option?.label ?? quickActionScopeLabel(scope);
  const queryLabel = query.trim().length > 0 ? `search "${query.trim()}"` : "no search";
  const matchingCount = option?.count ?? 0;
  const enterTarget = firstRunnableAction ? firstRunnableAction.title : "No runnable Enter target";

  return {
    scope,
    status: "Scope selected",
    title: `${scopeLabel} commands`,
    detail: `${queryLabel} / ${filteredActions.length} shown / ${matchingCount} matching`,
    metricLabel: "Enter target",
    metricValue: firstRunnableAction ? `${firstRunnableAction.group} / ${firstRunnableAction.title}` : "No runnable command",
    nextCheck: firstRunnableAction
      ? `Press Enter or click ${enterTarget} only if it is the next explicit move.`
      : "Clear search or choose another scope before running a command.",
    tone: firstRunnableAction ? "good" : "warn"
  };
}

export function quickActionScopeLabel(scope: QuickActionScopeId): string {
  return quickActionScopeDefinitions.find((definition) => definition.id === scope)?.label ?? scope;
}

export function createQuickActionSearchHintResult(
  term: string,
  scope: QuickActionScopeId,
  actions: QuickAction[]
): QuickActionSearchHintResult {
  const normalizedTerm = term.trim();
  const scopeOptions = createQuickActionScopeOptions(actions, normalizedTerm);
  const scopeOption = scopeOptions.find((candidate) => candidate.id === scope);
  const filteredActions = filterQuickActions(actions, normalizedTerm, scope);
  const firstRunnableAction = filteredActions.find((candidate) => !candidate.disabled);
  const scopeLabel = scopeOption?.label ?? quickActionScopeLabel(scope);
  const matchingCount = scopeOption?.count ?? 0;
  const queryLabel = normalizedTerm ? `"${normalizedTerm}"` : "empty search";

  return {
    term: normalizedTerm,
    status: "Hint applied",
    title: normalizedTerm ? `Search hint ${queryLabel}` : "Search hint cleared",
    detail: `${scopeLabel} scope / ${filteredActions.length} shown / ${matchingCount} matching`,
    metricLabel: "Enter target",
    metricValue: firstRunnableAction ? `${firstRunnableAction.group} / ${firstRunnableAction.title}` : "No runnable command",
    nextCheck: firstRunnableAction
      ? `Press Enter or click ${firstRunnableAction.title} only if it is the next explicit move.`
      : "Edit the search or use Scope Filters before running a command.",
    tone: firstRunnableAction ? "good" : "warn"
  };
}

export function createQuickActionSearchRecoveryResult(
  action: QuickActionSearchRecoveryResult["action"],
  previousQuery: string,
  previousScope: QuickActionScopeId,
  nextQuery: string,
  nextScope: QuickActionScopeId,
  actions: QuickAction[]
): QuickActionSearchRecoveryResult {
  const trimmedPreviousQuery = previousQuery.trim();
  const trimmedNextQuery = nextQuery.trim();
  const scopeOptions = createQuickActionScopeOptions(actions, nextQuery);
  const scopeOption = scopeOptions.find((candidate) => candidate.id === nextScope);
  const filteredActions = filterQuickActions(actions, nextQuery, nextScope);
  const firstRunnableAction = filteredActions.find((candidate) => !candidate.disabled);
  const previousScopeLabel = quickActionScopeLabel(previousScope);
  const scopeLabel = scopeOption?.label ?? quickActionScopeLabel(nextScope);
  const matchingCount = scopeOption?.count ?? 0;
  const queryLabel = trimmedNextQuery ? `"${trimmedNextQuery}"` : "empty search";
  const previousQueryLabel = trimmedPreviousQuery ? `"${trimmedPreviousQuery}"` : "empty search";

  return {
    action,
    status: "Recovery applied",
    title: action === "clear" ? "Search cleared" : `Scope switched to ${scopeLabel}`,
    detail:
      action === "clear"
        ? `Cleared ${previousQueryLabel} / ${scopeLabel} scope / ${filteredActions.length} shown / ${matchingCount} matching`
        : `${previousScopeLabel} to ${scopeLabel} / ${queryLabel} / ${filteredActions.length} shown / ${matchingCount} matching`,
    metricLabel: "Enter target",
    metricValue: firstRunnableAction ? `${firstRunnableAction.group} / ${firstRunnableAction.title}` : "No runnable command",
    nextCheck: firstRunnableAction
      ? `Press Enter or click ${firstRunnableAction.title} only if it is the next explicit move.`
      : action === "clear"
        ? "Type a command term or use Scope Filters before running a command."
        : "Clear search or choose another scope before running a command.",
    tone: firstRunnableAction ? "good" : "warn"
  };
}

export function createQuickActionSearchResult(
  query: string,
  scope: QuickActionScopeId,
  actions: QuickAction[]
): QuickActionSearchResult {
  const trimmedQuery = query.trim();
  const scopeOptions = createQuickActionScopeOptions(actions, query);
  const scopeOption = scopeOptions.find((candidate) => candidate.id === scope);
  const filteredActions = filterQuickActions(actions, query, scope);
  const firstRunnableAction = filteredActions.find((action) => !action.disabled);
  const scopeLabel = scopeOption?.label ?? quickActionScopeLabel(scope);
  const matchingCount = scopeOption?.count ?? 0;
  const queryLabel = trimmedQuery ? `"${trimmedQuery}"` : "empty search";
  const status = trimmedQuery ? "Search updated" : "Search cleared";

  return {
    query: trimmedQuery,
    status,
    title: trimmedQuery ? `Search ${queryLabel}` : "Search cleared",
    detail: `${scopeLabel} scope / ${filteredActions.length} shown / ${matchingCount} matching`,
    metricLabel: "Enter target",
    metricValue: firstRunnableAction ? `${firstRunnableAction.group} / ${firstRunnableAction.title}` : "No runnable command",
    nextCheck: firstRunnableAction
      ? `Press Enter or click ${firstRunnableAction.title} only if it is the next explicit move.`
      : trimmedQuery
        ? "Edit the search or switch scope before running a command."
        : "Type a command term or use Scope Filters before running a command.",
    tone: firstRunnableAction ? "good" : "warn"
  };
}

export function createQuickActionSpotlightSummary(
  actions: QuickAction[],
  firstRunnableAction: QuickAction | undefined,
  scope: QuickActionScopeId,
  scopeOptions: QuickActionScopeOption[],
  query: string
): QuickActionSpotlightSummary {
  const scopeLabel = scopeOptions.find((option) => option.id === scope)?.label ?? "All";
  const matchingCount = scopeOptions.find((option) => option.id === scope)?.count ?? 0;
  const queryLabel = query.trim().length > 0 ? `Search "${query.trim()}"` : "No search";
  const contextLabel = `${scopeLabel} scope / ${actions.length} shown / ${matchingCount} matching / ${queryLabel}`;

  if (!firstRunnableAction) {
    const detailLabel =
      actions.length > 0 ? "Visible commands are disabled in the current state" : "No visible command matches the current scope and search";
    return {
      actionId: null,
      statusLabel: "No Enter target",
      titleLabel: "No command ready",
      detailLabel,
      contextLabel,
      detailTitle: `No Enter target / ${detailLabel} / ${contextLabel}`,
      tone: "warn"
    };
  }

  const detailLabel = `${firstRunnableAction.group} / ${firstRunnableAction.detail}`;
  return {
    actionId: firstRunnableAction.id,
    statusLabel: "Enter target",
    titleLabel: firstRunnableAction.title,
    detailLabel,
    contextLabel,
    detailTitle: `Enter target / ${firstRunnableAction.title} / ${detailLabel} / ${contextLabel}`,
    tone: "good"
  };
}

export function quickActionMatchesQuery(action: QuickAction, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  const terms = normalizedQuery.split(/\s+/);
  const tokens = quickActionSearchTokens(action);
  return terms.every((term) => tokens.some((token) => token.startsWith(term)));
}

export function quickActionMatchesScope(action: QuickAction, scope: QuickActionScopeId): boolean {
  switch (scope) {
    case "all":
      return true;
    case "transport":
      return action.group === "Transport";
    case "compose":
      return action.group === "Create";
    case "arrange":
      return action.group === "Arrange";
    case "mix":
      return (
        action.group === "Mix" &&
        action.id !== "export-meter" &&
        action.id !== "master-output-role" &&
        action.id !== "master-finish" &&
        !action.id.startsWith("master-finish-") &&
        composerActionQuickActionArea(action.id) !== "finish"
      );
    case "master":
      return (
        action.id === "export-meter" ||
        action.id === "master-output-role" ||
        action.id === "master-finish" ||
        action.id.startsWith("master-finish-") ||
        composerActionQuickActionArea(action.id) === "finish"
      );
    case "project":
      return action.group === "Project" || action.group === "Edit";
    case "export":
      return action.group === "Export";
  }
}

export function quickActionSearchTokens(action: QuickAction): string[] {
  return `${action.group} ${action.title} ${action.detail} ${action.keywords}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function prependQuickActionRecent(
  recents: QuickActionRecent[],
  action: QuickAction,
  result: QuickActionResult
): QuickActionRecent[] {
  const nextRecent: QuickActionRecent = {
    actionId: action.id,
    status: result.status,
    tone: result.tone
  };
  return [nextRecent, ...recents.filter((recent) => recent.actionId !== action.id)].slice(0, 4);
}

export function createQuickActionRecentOptions(
  recents: QuickActionRecent[],
  actions: QuickAction[]
): Array<{ recent: QuickActionRecent; action: QuickAction }> {
  return recents.flatMap((recent) => {
    const action = actions.find((candidate) => candidate.id === recent.actionId);
    return action ? [{ recent, action }] : [];
  });
}

export function createQuickActionRecentResult(action: QuickAction, recent: QuickActionRecent): QuickActionRecentResult {
  const availableLabel = action.disabled ? "Unavailable now" : "Ready to rerun";
  const targetLabel = quickActionRecentResultTarget(action);
  return {
    actionId: action.id,
    status: "Inspected recent command",
    title: action.title,
    detail: `${action.group} / ${action.detail}`,
    metricLabel: "Last command result",
    metricValue: `${recent.status} / ${availableLabel} / ${targetLabel}`,
    nextCheck: `Rerun ${action.title} only if ${targetLabel} is still the next explicit move.`,
    tone: action.disabled ? "warn" : recent.tone
  };
}

export function quickActionRecentResultTarget(action: QuickAction): string {
  const detailTarget = action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean)[0];
  return `target ${detailTarget ?? action.title}`;
}

export function normalizeQuickActionPinnedIds(pinnedIds: string[], actions: QuickAction[]): string[] {
  const actionIds = new Set(actions.map((action) => action.id));
  const normalizedIds = pinnedIds.filter((id, index) => actionIds.has(id) && pinnedIds.indexOf(id) === index);
  const boundedIds = normalizedIds.slice(0, maxQuickActionPins);
  return pinnedIds.length === boundedIds.length && pinnedIds.every((id, index) => id === boundedIds[index])
    ? pinnedIds
    : boundedIds;
}

export function createQuickActionPinnedOptions(pinnedIds: string[], actions: QuickAction[]): QuickAction[] {
  const normalizedIds = normalizeQuickActionPinnedIds(pinnedIds, actions);
  return normalizedIds.flatMap((id) => {
    const action = actions.find((candidate) => candidate.id === id);
    return action ? [action] : [];
  });
}

export function createQuickActionPinnedResult(
  kind: QuickActionPinnedResultKind,
  action: QuickAction,
  beforeIds: string[],
  afterIds: string[]
): QuickActionPinnedResult {
  const availableLabel = action.disabled ? "Unavailable now" : "Ready to run";
  const status =
    kind === "pin" ? "Pinned command" : kind === "unpin" ? "Unpinned command" : "Inspected pinned command";
  const slotIndex = afterIds.indexOf(action.id);
  const slotLabel = slotIndex >= 0 ? `slot ${slotIndex + 1}` : "removed";
  const metricLabel = kind === "inspect" ? "Pinned command setup" : "Pin slots";
  const metricValue =
    kind === "unpin"
      ? `${afterIds.length}/${maxQuickActionPins} pinned / removed from session row / before ${beforeIds.length}`
      : `${afterIds.length}/${maxQuickActionPins} pinned / ${slotLabel} / ${availableLabel}`;
  const nextCheck =
    kind === "pin"
      ? `Run ${action.title} from Pinned Commands only when it is the next explicit move.`
      : kind === "unpin"
        ? "Pin another visible command if this repeat path is still useful in this session."
        : `Review ${quickActionPinnedResultTarget(action)}, then press Run only if it is the next explicit move.`;

  return {
    kind,
    actionId: action.id,
    status,
    title: action.title,
    detail: `${action.group} / ${action.detail}`,
    metricLabel,
    metricValue,
    nextCheck,
    tone: action.disabled ? "warn" : "good"
  };
}

export function quickActionPinnedResultTarget(action: QuickAction): string {
  const detailTarget = action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean)[0];
  return `target ${detailTarget ?? action.title}`;
}

export type QuickActionInputSetupSnapshot = {
  keyboardCaptureEnabled: boolean;
  keyboardCaptureTarget: NoteTrack;
  keyboardCaptureDefaults: Record<NoteTrack, KeyboardCaptureDefaults>;
  keyboardCaptureStepMode: KeyboardCaptureStepMode;
  midiCaptureStatus: MidiCaptureStatus;
  midiCaptureArmed: boolean;
  midiInputCount: number;
  connectedMidiInputCount: number;
  midiStatusLabel: string;
  midiDetailLabel: string;
  midiSelectedInputId: string;
  midiSelectedInputLabel: string;
  midiLastNoteLabel: string;
  selectedNote: SelectedNote | null;
  selectedNoteActive: boolean;
  selectedNoteLabel: string;
};

export type QuickActionInputSetupResultState = {
  before: QuickActionInputSetupSnapshot;
  after: QuickActionInputSetupSnapshot;
};

export function isInputSetupQuickAction(action: QuickAction): boolean {
  return (
    action.id === "keyboard-capture-readout-action" ||
    action.id === "capture-step-mode-readout-action" ||
    action.id === "midi-input-readout-action" ||
    action.id === "keyboard-capture-toggle" ||
    action.id === "midi-input-connect" ||
    action.id === "midi-input-arm" ||
    action.id.startsWith("capture-target-") ||
    action.id.startsWith("capture-step-mode-") ||
    action.id.startsWith("capture-default-")
  );
}

export function createQuickActionInputSetupResultState(
  action: QuickAction,
  snapshot: QuickActionInputSetupSnapshot
): QuickActionInputSetupResultState | null {
  if (!isInputSetupQuickAction(action)) {
    return null;
  }

  const before = cloneQuickActionInputSetupSnapshot(snapshot);
  return {
    before,
    after: applyQuickActionInputSetupSnapshot(action, before)
  };
}

export function cloneQuickActionInputSetupSnapshot(snapshot: QuickActionInputSetupSnapshot): QuickActionInputSetupSnapshot {
  return {
    ...snapshot,
    keyboardCaptureDefaults: cloneKeyboardCaptureDefaults(snapshot.keyboardCaptureDefaults),
    selectedNote: snapshot.selectedNote ? { ...snapshot.selectedNote } : null
  };
}

export function cloneKeyboardCaptureDefaults(
  defaults: Record<NoteTrack, KeyboardCaptureDefaults>
): Record<NoteTrack, KeyboardCaptureDefaults> {
  return {
    bass: { ...defaults.bass },
    melody: { ...defaults.melody }
  };
}

export function applyQuickActionInputSetupSnapshot(
  action: QuickAction,
  snapshot: QuickActionInputSetupSnapshot
): QuickActionInputSetupSnapshot {
  const next = cloneQuickActionInputSetupSnapshot(snapshot);
  if (action.id === "keyboard-capture-toggle") {
    next.keyboardCaptureEnabled = !snapshot.keyboardCaptureEnabled;
  }
  if (action.id === "midi-input-arm") {
    next.midiCaptureArmed = !snapshot.midiCaptureArmed;
    next.midiStatusLabel = next.midiCaptureArmed ? "MIDI armed" : "MIDI disarmed";
    next.midiDetailLabel = `${next.connectedMidiInputCount}/${next.midiInputCount} inputs connected`;
  }
  if (action.id === "midi-input-connect") {
    next.midiStatusLabel = action.title.includes("Refresh") ? "MIDI refresh requested" : "MIDI connect requested";
    next.midiDetailLabel = snapshot.midiDetailLabel;
  }
  if (action.id === "capture-target-bass") {
    next.keyboardCaptureTarget = "bass";
  }
  if (action.id === "capture-target-melody") {
    next.keyboardCaptureTarget = "melody";
  }
  if (action.id === "capture-step-mode-next") {
    next.keyboardCaptureStepMode = "next-free";
  }
  if (action.id === "capture-step-mode-replace") {
    next.keyboardCaptureStepMode = "replace-selected";
  }

  const target = next.keyboardCaptureTarget;
  const targetDefaults = next.keyboardCaptureDefaults[target];
  if (action.id === "capture-default-octave-down" || action.id === "capture-default-octave-up") {
    const [minOctave, maxOctave] = trackOctaveRange(target);
    targetDefaults.octave = clampKeyboardCaptureOctave(
      target,
      action.id === "capture-default-octave-down"
        ? Math.max(minOctave, targetDefaults.octave - 1)
        : Math.min(maxOctave, targetDefaults.octave + 1)
    );
  }
  if (action.id === "capture-default-length-short") {
    targetDefaults.length = clampStepLength(targetDefaults.length - 1);
  }
  if (action.id === "capture-default-length-long") {
    targetDefaults.length = clampStepLength(targetDefaults.length + 1);
  }
  if (action.id === "capture-default-velocity-down") {
    targetDefaults.velocity = clampVelocity(targetDefaults.velocity - 0.1);
  }
  if (action.id === "capture-default-velocity-up") {
    targetDefaults.velocity = clampVelocity(targetDefaults.velocity + 0.1);
  }
  if (action.id === "capture-default-glide-toggle" && target === "bass") {
    targetDefaults.glide = !targetDefaults.glide;
  }

  return next;
}

export function createQuickActionResult(
  action: QuickAction,
  beforeProject: ProjectState,
  afterProject: ProjectState,
  outcome: "complete" | "failed",
  selectedArrangementIndex = 0,
  handoffExportReceipt: HandoffExportReceipt | null = null,
  inputSetupResult: QuickActionInputSetupResultState | null = null
): QuickActionResult {
  const beforeMetric = quickActionResultMetricSnapshot(
    beforeProject,
    action,
    selectedArrangementIndex,
    "before",
    handoffExportReceipt,
    inputSetupResult
  );
  const afterMetric = quickActionResultMetricSnapshot(
    afterProject,
    action,
    selectedArrangementIndex,
    "after",
    handoffExportReceipt,
    inputSetupResult
  );
  const nextMoveQuickAction = nextMoveQuickActionForProject(afterProject, action);
  const nextMoveQuickActionOnly = nextMoveQuickAction !== null;
  const blueprintPreviewCueOnly = action.id === "blueprint-preview-cue";
  const blueprintPreviewDecisionOnly = action.id === "blueprint-preview-decision";
  const previewOnly = action.id.startsWith("blueprint-preview-") && !blueprintPreviewCueOnly && !blueprintPreviewDecisionOnly;
  const historyOnly = action.id === "undo" || action.id === "redo";
  const patternCompareDecisionKind = patternCompareDecisionQuickActionKind(action);
  const patternCompareDecisionCue = patternCompareDecisionKind === "cue";
  const cueOnly =
    action.id === "groove-compass-cue" ||
    blueprintPreviewCueOnly ||
    action.id.startsWith("style-goal-cue-") ||
    patternCompareDecisionCue;
  const focusOnly =
    action.id === "command-reference" ||
    action.id === "beat-terms-reference" ||
    action.id === "guide-quick-start" ||
    action.id === "guide-bottleneck-focus" ||
    action.id === "transport-position-readout-action" ||
    action.id === "loop-scope" ||
    action.id === "metronome-readout" ||
    action.id === "tap-tempo-readout-action" ||
    action.id === "tempo-nudge-readout-action" ||
    action.id === "swing-feel-readout-action" ||
    action.id === "key-retarget-readout-action" ||
    action.id === "keyboard-capture-readout-action" ||
    action.id === "capture-step-mode-readout-action" ||
    action.id === "midi-input-readout-action" ||
    action.id === "editor-audition-readout-action" ||
    action.id === "stem-audition-readout-action" ||
    action.id === "timbre-check" ||
    action.id === "session-pass-focus" ||
    action.id.startsWith("session-pass-card-") ||
    action.id === "session-brief-compass-focus" ||
    action.id.startsWith("session-brief-compass-card-") ||
    action.id === "reference-alignment-focus" ||
    action.id.startsWith("reference-alignment-card-") ||
    action.id === "first-beat-path-jump" ||
    action.id.startsWith("first-beat-path-step-") ||
    action.id === "composer-guide-focus" ||
    action.id.startsWith("composer-guide-card-") ||
    action.id.startsWith("beat-spine-card-jump-") ||
    action.id === "style-inspector-focus" ||
    action.id.startsWith("style-inspector-item-") ||
    action.id === "style-direction-readout-action" ||
    action.id === "beat-readiness-focus" ||
    action.id.startsWith("beat-readiness-check-") ||
    action.id === "listening-pass-focus" ||
    action.id.startsWith("listening-pass-checkpoint-") ||
    action.id === "key-compass-focus" ||
    action.id.startsWith("key-compass-card-") ||
    action.id === "groove-compass-focus" ||
    action.id.startsWith("groove-compass-card-") ||
    action.id === "pattern-dna-focus" ||
    action.id.startsWith("pattern-dna-card-") ||
    action.id === "pattern-playback-readout-action" ||
    action.id === "selected-arrangement-block-readout-action" ||
    action.id === "arrangement-playback-readout-action" ||
    action.id === "audible-arrangement-follow-readout-action" ||
    action.id.startsWith("mode-focus-card-") ||
    action.id === "beat-passport-focus" ||
    action.id.startsWith("beat-passport-metric-") ||
    action.id === "production-snapshot-focus" ||
    action.id.startsWith("production-snapshot-metric-") ||
    action.id === "snapshot-compare-focus" ||
    action.id.startsWith("snapshot-compare-metric-") ||
    action.id === "topline-space-focus" ||
    action.id.startsWith("topline-space-card-") ||
    action.id === "arrangement-mute-map-readout-action" ||
    action.id === "arrangement-mute-map-focus" ||
    action.id.startsWith("arrangement-mute-map-lane-") ||
    action.id === "arrangement-transition-map-readout-action" ||
    action.id === "arrangement-transition-map-focus" ||
    action.id.startsWith("arrangement-transition-map-transition-") ||
    action.id === "transition-loop-cue" ||
    action.id.startsWith("transition-loop-cue-") ||
    action.id === "hook-loop-cue" ||
    action.id.startsWith("hook-readiness-cue-") ||
    action.id === "topline-loop-cue" ||
    action.id.startsWith("topline-space-cue-") ||
    action.id === "handoff-pack" ||
    action.id === "handoff-package-check-focus" ||
    action.id.startsWith("handoff-package-check-card-") ||
    action.id === "handoff-manifest-audit-focus" ||
    action.id === "handoff-send-order-focus" ||
    action.id === "handoff-export-receipt-focus" ||
    action.id === "handoff-export-format-focus" ||
    action.id.startsWith("handoff-export-format-") ||
    action.id === "song-form-overview-readout-action" ||
    action.id === "song-form-priority" ||
    action.id.startsWith("arrangement-block-cue-") ||
    action.id.startsWith("arrangement-block-jump-") ||
    action.id.startsWith("section-locator-") ||
    action.id.startsWith("pattern-cue-") ||
    action.id.startsWith("pattern-switch-") ||
    action.id === "pattern-use-readout-action" ||
    action.id === "pattern-follow-audible" ||
    action.id === "arrangement-follow-audible" ||
    action.id === "sound-preset-readout-action" ||
    action.id === "drum-kit-readout-action" ||
    action.id === "sound-focus-readout-action" ||
    action.id === "sound-snapshot-readout-action" ||
    action.id === "pattern-chain-readout-action" ||
    action.id === "chain-expand-readout-action" ||
    action.id === "arrangement-template-readout-action" ||
    action.id === "arrangement-arc-readout-action" ||
    action.id === "arrangement-focus-readout-action" ||
    action.id === "arrangement-move-readout-action" ||
    action.id === "mix-snapshot-readout-action" ||
    action.id === "mix-balance-readout-action" ||
    action.id === "space-fx-readout-action" ||
    action.id === "master-finish-readout-action" ||
    action.id === "master-automation-readout-action" ||
    action.id === "workflow-spotlight-focus" ||
    action.id.startsWith("workflow-navigator-") ||
    action.id === "review-queue-focus" ||
    action.id.startsWith("review-queue-item-") ||
    action.id.startsWith("finish-checklist-card-") ||
    action.id === "export-preflight-focus" ||
    action.id.startsWith("export-preflight-card-");
  const inputSetupOnly = isInputSetupQuickAction(action);
  const blockClipboardOnly =
    action.id === "selected-block-copy" ||
    (action.id === "selected-block-edit-decision" && action.title.includes("Copy Block")) ||
    (action.id === "selected-block-priority-edit" && action.title.includes("Copy Block"));
  const noteClipboardOnly = action.id === "selected-note-copy";
  const drumClipboardOnly = action.id === "selected-drum-copy";
  const chordClipboardOnly = action.id === "selected-chord-copy";
  const auditionOnly =
    action.id === "selected-note-audition" ||
    action.id === "selected-drum-audition" ||
    action.id === "selected-chord-audition";
  const tapTempoPulseOnly = action.id === "tap-tempo";
  const projectSafetyReadoutOnly = action.id === "project-safety-readout";
  const localDraftRecoveryOnly = action.id === "restore-local-draft" || action.id === "clear-local-draft";
  const exportOnly = directExportQuickActionTarget(action.id) !== null || action.id === "handoff-next-export";
  const mixSnapshotDecisionRecallOnly = isMixSnapshotDecisionRecallAction(action);
  const mixSnapshotRecallOnly =
    action.id === "mix-snapshot-recall-a" || action.id === "mix-snapshot-recall-b" || mixSnapshotDecisionRecallOnly;
  const soundSnapshotDecisionRecallOnly = isSoundSnapshotDecisionRecallAction(action);
  const soundSnapshotRecallOnly =
    action.id === "sound-snapshot-recall-a" || action.id === "sound-snapshot-recall-b" || soundSnapshotDecisionRecallOnly;
  const uiLocal =
    (action.id.startsWith("mix-snapshot-") && !mixSnapshotRecallOnly) ||
    (action.id.startsWith("sound-snapshot-") && !soundSnapshotRecallOnly) ||
    action.id === "studio-tone-baseline" ||
    inputSetupOnly ||
    auditionOnly ||
    tapTempoPulseOnly ||
    blockClipboardOnly ||
    noteClipboardOnly ||
    drumClipboardOnly ||
    chordClipboardOnly ||
    projectSafetyReadoutOnly ||
    localDraftRecoveryOnly;
  const changed = beforeProject !== afterProject || beforeMetric.value !== afterMetric.value;
  const metric: QuickActionResultMetric = {
    id: afterMetric.id,
    label: afterMetric.label,
    before: beforeMetric.value,
    after: afterMetric.value,
    tone:
      outcome === "failed"
        ? "danger"
        : previewOnly || blueprintPreviewDecisionOnly || cueOnly || focusOnly || uiLocal || exportOnly
          ? "good"
          : nextMoveQuickActionOnly
            ? changed
              ? "good"
              : nextMoveQuickAction.tone
          : changed
            ? "good"
            : "warn"
  };
  const followup = quickActionResultFollowup(action, afterProject, outcome);

  return {
    actionId: action.id,
    title: action.title,
    status:
      outcome === "failed"
        ? "Failed"
        : previewOnly
          ? "Previewed"
          : blueprintPreviewDecisionOnly
            ? action.title.startsWith("Apply Preview")
              ? "Applied"
              : "Previewed"
          : cueOnly
            ? "Cued"
            : focusOnly
            ? "Focused"
            : nextMoveQuickActionOnly
              ? changed
                ? "Applied"
                : "Checked"
            : auditionOnly
              ? "Auditioned"
            : blockClipboardOnly || noteClipboardOnly || drumClipboardOnly || chordClipboardOnly
              ? "Copied"
              : historyOnly
                ? action.id === "undo"
                  ? "Undone"
                  : "Redone"
              : uiLocal && (action.id === "mix-snapshot-clear" || action.id === "sound-snapshot-clear")
                ? "Cleared"
                : localDraftRecoveryOnly
                  ? action.id === "restore-local-draft"
                    ? "Restored"
                    : "Cleared"
                : projectSafetyReadoutOnly
                  ? "Checked"
                : mixSnapshotRecallOnly || soundSnapshotRecallOnly
                  ? "Recalled"
                : uiLocal
                  ? inputSetupOnly
                    ? "Checked"
                    : "Captured"
                  : exportOnly
                    ? "Exported"
                  : changed
                    ? "Applied"
                    : "Ran",
    group: action.group,
    detail: action.detail,
    metric,
    auditionCue: followup.auditionCue,
    nextCheck: followup.nextCheck,
    tone:
      outcome === "failed"
        ? "danger"
        : previewOnly || blueprintPreviewDecisionOnly || cueOnly || focusOnly || uiLocal || exportOnly
          ? "good"
          : nextMoveQuickActionOnly
            ? changed
              ? "good"
              : nextMoveQuickAction.tone
          : changed
            ? "good"
            : "warn"
  };
}

export function mixFixQuickActionPreset(actionId: string): MixFixPreset | null {
  switch (actionId) {
    case "mix-headroom":
      return "headroom";
    case "mix-stem-balance":
      return "stem_balance";
    case "mix-low-end":
      return "low_end";
    default:
      return null;
  }
}

export function masterFinishQuickActionPad(actionId: string): MasterFinishPadDefinition | null {
  if (!actionId.startsWith("master-finish-")) {
    return null;
  }
  const padId = actionId.replace("master-finish-", "") as MasterFinishPadId;
  return masterFinishPadDefinitions.find((pad) => pad.id === padId) ?? null;
}

export function masterAutomationQuickActionPad(actionId: string): MasterAutomationPadDefinition | null {
  if (!actionId.startsWith("master-automation-")) {
    return null;
  }
  const padId = actionId.replace("master-automation-", "") as MasterAutomationPadId;
  return masterAutomationPadDefinitions.find((pad) => pad.id === padId) ?? null;
}

export function masterFinishQuickActionPosture(project: ProjectState): string {
  return `${project.masterPreset} / ${formatDb(project.masterCeilingDb)} ceiling / ${formatDb(
    masterChannelVolumeDb(project.mixer)
  )} output`;
}

export function quickActionMasterFinishMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  actionPad: MasterFinishPadDefinition | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id === "master-finish-readout-action") {
    const options = createMasterFinishPadOptions(project);
    const preview = createMasterFinishPreviewSummary(project, options);
    const pad = options.find((candidate) => candidate.id === preview.padId) ?? options[0];
    if (!pad) {
      return null;
    }
    const exportAnalysis = analysis ?? analyzeExport(project);
    const stemAnalyses = analyzeStemExports(project);
    const targetProject = applyMasterFinishPadToProject(project, pad);
    const changedMoves = masterFinishChangedCount(project, targetProject);
    return {
      id: "master-finish-readout",
      label: "Master Finish Readout",
      value: quickActionMasterFinishMetricValue(project, exportAnalysis, stemAnalyses, [
        quickActionMasterFinishActionLabel(action),
        `preview ${preview.padLabel}`,
        `status ${preview.statusLabel}`,
        `current ${masterFinishQuickActionPosture(project)}`,
        `target ${pad.preset} / ${formatDb(pad.ceilingDb)} ceiling / ${formatDb(pad.masterVolumeDb)} output`,
        `moves ${changedMoves} finish move${changedMoves === 1 ? "" : "s"}`
      ], quickActionMasterFinishNextCheck(action, pad))
    };
  }

  if (action.id !== "master-finish-decision" && action.id !== "master-finish" && !actionPad) {
    return null;
  }

  const pad = quickActionMasterFinishPadOption(project, action, actionPad);
  if (!pad) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const targetProject = applyMasterFinishPadToProject(project, pad);
  const changedMoves = masterFinishChangedCount(project, targetProject);
  return {
    id:
      action.id === "master-finish-decision"
        ? "master-finish-decision"
        : action.id === "master-finish"
          ? "master-finish"
          : `master-finish-${pad.id}`,
    label: action.id === "master-finish-decision" ? "Master Finish Decision" : `${pad.label} Master Finish`,
    value: quickActionMasterFinishMetricValue(project, exportAnalysis, stemAnalyses, [
      quickActionMasterFinishActionLabel(action),
      `target ${pad.label} / ${pad.detail}`,
      `context ${quickActionMasterFinishContextLabel(action)}`,
      `current ${masterFinishQuickActionPosture(project)}`,
      `target ${pad.preset} / ${formatDb(pad.ceilingDb)} ceiling / ${formatDb(pad.masterVolumeDb)} output`,
      `moves ${changedMoves} finish move${changedMoves === 1 ? "" : "s"}`
    ], quickActionMasterFinishNextCheck(action, pad))
  };
}

export function quickActionMasterFinishMetricValue(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses,
  parts: string[],
  nextCheck: string
): string {
  return [
    ...parts,
    ...quickActionMasterFinishProjectMetricParts(project, stemAnalyses, analysis),
    `next ${nextCheck}`
  ].join(" / ");
}

export function quickActionMasterFinishProjectMetricParts(
  project: ProjectState,
  stemAnalyses: StemExportAnalyses,
  analysis: ExportAnalysis
): string[] {
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;

  return [
    `Pattern ${project.selectedPattern}`,
    `${drumHitCount(pattern)} drum hits`,
    `${pattern.bassNotes.length} 808`,
    `${pattern.melodyNotes.length} Synth`,
    `${pattern.chordEvents.length} chords`,
    `${patternEventTotal(pattern)} editable events`,
    patternUseLabel,
    `${project.arrangement.length} blocks`,
    barCountLabel(arrangementTotalBars(project)),
    `export ${analysis.status} / H ${formatDb(analysis.headroomDb)}`,
    `stems ${audibleStemCount}/${stemTrackIds.length} audible`
  ];
}

export function quickActionMasterFinishPadOption(
  project: ProjectState,
  action: QuickAction,
  actionPad: MasterFinishPadDefinition | null
): MasterFinishPadDefinition | null {
  const targetId = quickActionMasterFinishTargetId(project, action, actionPad);
  return masterFinishPadDefinitions.find((pad) => pad.id === targetId) ?? null;
}

export function quickActionMasterFinishTargetId(
  project: ProjectState,
  action: QuickAction,
  actionPad: MasterFinishPadDefinition | null
): MasterFinishPadId {
  if (isMasterFinishPadId(action.resultTargetId)) {
    return action.resultTargetId;
  }
  if (actionPad) {
    return actionPad.id;
  }
  return suggestedMasterFinishPad(project);
}

export function isMasterFinishPadId(value: string | undefined): value is MasterFinishPadId {
  return value === "demo" || value === "vocal" || value === "store" || value === "club";
}

export function quickActionMasterFinishActionLabel(action: QuickAction): string {
  if (action.id === "master-finish-readout-action") {
    return "review master finish readout";
  }
  if (action.id === "master-finish-decision") {
    return "run master finish decision";
  }
  if (action.id === "master-finish") {
    return "apply current master finish";
  }
  return "apply direct master finish";
}

export function quickActionMasterFinishContextLabel(action: QuickAction): string {
  if (action.id === "master-finish-readout-action") {
    return "readout";
  }
  if (action.id === "master-finish-decision") {
    return "decision";
  }
  if (action.id === "master-finish") {
    return "current preview";
  }
  return "direct pad";
}

export function quickActionMasterFinishNextCheck(action: QuickAction, pad: MasterFinishPadDefinition): string {
  if (action.id === "master-finish-readout-action") {
    return "play Full Mix, inspect Export meter and stems, then apply Master Finish only if the preview fits";
  }
  if (action.id === "master-finish-decision") {
    return "play Full Mix and inspect Export meter before another output posture move";
  }
  if (pad.id === "vocal") {
    return "confirm vocal headroom before WAV/stem export or Handoff";
  }
  if (pad.id === "club") {
    return "check limiter activity and low-end control before export";
  }
  return "play Full Mix, inspect Export meter, then manually trim ceiling or output only if needed";
}

export function masterAutomationQuickActionPosture(project: ProjectState): string {
  return `${masterAutomationPresetLabel(masterAutomationPresetForProject(project))} / ${masterAutomationEventCountLabel(
    project
  )} / ${barCountLabel(arrangementTotalBars(project))}`;
}

export function quickActionMasterAutomationMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  actionPad: MasterAutomationPadDefinition | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id === "master-automation-readout-action") {
    const options = createMasterAutomationPadOptions(project);
    const preview = createMasterAutomationPreviewSummary(project, options);
    const pad = options.find((candidate) => candidate.id === preview.padId) ?? options[0];
    if (!pad) {
      return null;
    }
    const exportAnalysis = analysis ?? analyzeExport(project);
    const stemAnalyses = analyzeStemExports(project);
    const targetProject = applyMasterAutomationPreset(project, pad.id);
    const changedEvents = masterAutomationChangedCount(project, targetProject);
    return {
      id: "master-automation-readout",
      label: "Master Automation Readout",
      value: quickActionMasterAutomationMetricValue(project, exportAnalysis, stemAnalyses, [
        quickActionMasterAutomationActionLabel(action),
        `preview ${preview.padLabel}`,
        `status ${preview.statusLabel}`,
        `current ${masterAutomationQuickActionPosture(project)}`,
        `target ${masterAutomationPresetLabel(masterAutomationPresetForProject(targetProject))} / ${masterAutomationEventCountLabel(
          targetProject
        )} / ${masterAutomationRangeLabel(targetProject)}`,
        `events ${changedEvents} automation event${changedEvents === 1 ? "" : "s"}`
      ], quickActionMasterAutomationNextCheck(action, pad))
    };
  }

  if (action.id !== "master-automation-decision" && action.id !== "master-automation" && !actionPad) {
    return null;
  }

  const pad = quickActionMasterAutomationPadOption(action, actionPad);
  if (!pad) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const targetProject = applyMasterAutomationPreset(project, pad.id);
  const changedEvents = masterAutomationChangedCount(project, targetProject);
  return {
    id:
      action.id === "master-automation-decision"
        ? "master-automation-decision"
        : action.id === "master-automation"
          ? "master-automation"
          : `master-automation-${pad.id}`,
    label:
      action.id === "master-automation-decision"
        ? "Master Automation Decision"
        : `${pad.label} Master Automation`,
    value: quickActionMasterAutomationMetricValue(project, exportAnalysis, stemAnalyses, [
      quickActionMasterAutomationActionLabel(action),
      `target ${pad.label} / ${pad.detail}`,
      `context ${quickActionMasterAutomationContextLabel(action)}`,
      `current ${masterAutomationQuickActionPosture(project)}`,
      `target ${masterAutomationPresetLabel(masterAutomationPresetForProject(targetProject))} / ${masterAutomationEventCountLabel(
        targetProject
      )} / ${masterAutomationRangeLabel(targetProject)}`,
      `events ${changedEvents} automation event${changedEvents === 1 ? "" : "s"}`
    ], quickActionMasterAutomationNextCheck(action, pad))
  };
}

export function quickActionMasterAutomationMetricValue(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses,
  parts: string[],
  nextCheck: string
): string {
  return [
    ...parts,
    ...quickActionMasterAutomationProjectMetricParts(project, stemAnalyses, analysis),
    `next ${nextCheck}`
  ].join(" / ");
}

export function quickActionMasterAutomationProjectMetricParts(
  project: ProjectState,
  stemAnalyses: StemExportAnalyses,
  analysis: ExportAnalysis
): string[] {
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;

  return [
    `Pattern ${project.selectedPattern}`,
    `${drumHitCount(pattern)} drum hits`,
    `${pattern.bassNotes.length} 808`,
    `${pattern.melodyNotes.length} Synth`,
    `${pattern.chordEvents.length} chords`,
    `${patternEventTotal(pattern)} editable events`,
    patternUseLabel,
    `${project.arrangement.length} blocks`,
    barCountLabel(arrangementTotalBars(project)),
    `export ${analysis.status} / H ${formatDb(analysis.headroomDb)}`,
    `stems ${audibleStemCount}/${stemTrackIds.length} audible`,
    `master ${masterFinishQuickActionPosture(project)}`
  ];
}

export function quickActionMasterAutomationPadOption(
  action: QuickAction,
  actionPad: MasterAutomationPadDefinition | null
): MasterAutomationPadDefinition | null {
  const targetId = quickActionMasterAutomationTargetId(action, actionPad);
  return masterAutomationPadDefinitions.find((pad) => pad.id === targetId) ?? null;
}

export function quickActionMasterAutomationTargetId(
  action: QuickAction,
  actionPad: MasterAutomationPadDefinition | null
): MasterAutomationPadId {
  if (isMasterAutomationPadId(action.resultTargetId)) {
    return action.resultTargetId;
  }
  return actionPad?.id ?? suggestedMasterAutomationPad();
}

export function isMasterAutomationPadId(value: string | undefined): value is MasterAutomationPadId {
  return value === "none" || value === "fade_in" || value === "fade_out" || value === "intro_outro";
}

export function quickActionMasterAutomationActionLabel(action: QuickAction): string {
  if (action.id === "master-automation-readout-action") {
    return "review master automation readout";
  }
  if (action.id === "master-automation-decision") {
    return "run master automation decision";
  }
  if (action.id === "master-automation") {
    return "apply current master automation";
  }
  return "apply direct master automation";
}

export function quickActionMasterAutomationContextLabel(action: QuickAction): string {
  if (action.id === "master-automation-readout-action") {
    return "readout";
  }
  if (action.id === "master-automation-decision") {
    return "decision";
  }
  if (action.id === "master-automation") {
    return "current preview";
  }
  return "direct pad";
}

export function quickActionMasterAutomationNextCheck(action: QuickAction, pad: MasterAutomationPadDefinition): string {
  if (action.id === "master-automation-readout-action") {
    return "play Song from the top and final bar, then apply Master Automation only if the fade preview fits";
  }
  if (action.id === "master-automation-decision") {
    return "play Song and inspect the visible Master Automation result before export";
  }
  if (pad.id === "none") {
    return "play Song and confirm manual master level stays stable before export";
  }
  if (pad.id === "fade_out") {
    return "play the final bar and export WAV/stems to confirm the fade renders";
  }
  return "play Song from the top and final bar, then export WAV/stems after the fade feels right";
}

export function mixSnapshotQuickActionTarget(actionId: string): MixSnapshotQuickActionTarget | null {
  switch (actionId) {
    case "mix-snapshot-capture-a":
      return { id: "capture-a", label: "Mix Snapshot A", metricId: "mix-snapshot-a" };
    case "mix-snapshot-capture-b":
      return { id: "capture-b", label: "Mix Snapshot B", metricId: "mix-snapshot-b" };
    case "mix-snapshot-recall-a":
      return { id: "recall-a", label: "Recall Mix Snapshot A", metricId: "mix-snapshot-recall-a" };
    case "mix-snapshot-recall-b":
      return { id: "recall-b", label: "Recall Mix Snapshot B", metricId: "mix-snapshot-recall-b" };
    case "mix-snapshot-clear":
      return { id: "clear", label: "Mix Snapshot A/B", metricId: "mix-snapshot-clear" };
    case "mix-snapshot-decision":
      return { id: "decision", label: "Mix Snapshot Decision", metricId: "mix-snapshot-decision" };
    default:
      return null;
  }
}

export function isMixSnapshotDecisionRecallAction(action: QuickAction): boolean {
  return action.id === "mix-snapshot-decision" && (action.keywords.includes("recall-a") || action.keywords.includes("recall-b"));
}

export type SoundSnapshotQuickActionTarget = {
  id: "readout" | "capture-a" | "capture-b" | "recall-a" | "recall-b" | "clear" | "decision";
  label: string;
  metricId: string;
};

export function soundSnapshotQuickActionTarget(actionId: string): SoundSnapshotQuickActionTarget | null {
  switch (actionId) {
    case "sound-snapshot-readout-action":
      return { id: "readout", label: "Sound Snapshot A/B Readout", metricId: "sound-snapshot-readout" };
    case "sound-snapshot-capture-a":
      return { id: "capture-a", label: "Sound Snapshot A", metricId: "sound-snapshot-a" };
    case "sound-snapshot-capture-b":
      return { id: "capture-b", label: "Sound Snapshot B", metricId: "sound-snapshot-b" };
    case "sound-snapshot-recall-a":
      return { id: "recall-a", label: "Recall Sound Snapshot A", metricId: "sound-snapshot-recall-a" };
    case "sound-snapshot-recall-b":
      return { id: "recall-b", label: "Recall Sound Snapshot B", metricId: "sound-snapshot-recall-b" };
    case "sound-snapshot-clear":
      return { id: "clear", label: "Sound Snapshot A/B", metricId: "sound-snapshot-clear" };
    case "sound-snapshot-decision":
      return { id: "decision", label: "Sound Snapshot Decision", metricId: "sound-snapshot-decision" };
    default:
      return null;
  }
}

export function isSoundSnapshotDecisionRecallAction(action: QuickAction): boolean {
  return action.id === "sound-snapshot-decision" && (action.keywords.includes("recall-a") || action.keywords.includes("recall-b"));
}

export function soundSnapshotQuickActionPosture(sound: SoundDesign): string {
  const snapshot = createSoundSnapshot("A", sound);
  return `${snapshot.presetLabel} / ${snapshot.timbreLabel}`;
}

export function mixSnapshotQuickActionPosture(project: ProjectState, exportAnalysis: ExportAnalysis): string {
  const stemAnalyses = analyzeStemExports(project);
  const stemSpread = stemSpreadDb(stemAnalyses);
  const stemLabel =
    stemSpread === null
      ? `${audibleStemTracks(stemAnalyses).length}/${stemTrackIds.length} stems`
      : `${stemSpread.toFixed(1)} dB spread`;
  return `${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)} / ${project.masterPreset} / ${stemLabel}`;
}

export type MixSnapshotResultTargetId = MixSnapshotQuickActionTarget["id"];

export function quickActionMixSnapshotMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id === "mix-snapshot-readout-action") {
    const exportAnalysis = analysis ?? analyzeExport(project);
    const stemAnalyses = analyzeStemExports(project);
    return {
      id: "mix-snapshot-readout",
      label: "Mix Snapshot A/B Readout",
      value: quickActionMixSnapshotMetricValue(project, exportAnalysis, stemAnalyses, [
        quickActionMixSnapshotActionLabel(action, "decision"),
        `readout ${quickActionMixSnapshotContextLabel(action)}`,
        `current mix ${mixSnapshotQuickActionPosture(project, exportAnalysis)}`,
        `master ${quickActionMixSnapshotMasterPosture(project)}`
      ], "capture or recall only after listening to Full Mix and the core stems")
    };
  }

  const target = mixSnapshotQuickActionTarget(action.id);
  if (!target) {
    return null;
  }

  const resultTargetId = quickActionMixSnapshotResultTargetId(action, target);
  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  return {
    id: target.metricId,
    label: quickActionMixSnapshotMetricLabel(target, resultTargetId),
    value: quickActionMixSnapshotMetricValue(project, exportAnalysis, stemAnalyses, [
      quickActionMixSnapshotActionLabel(action, resultTargetId),
      `target ${quickActionMixSnapshotTargetLabel(resultTargetId)}`,
      `context ${action.id === "mix-snapshot-decision" ? "decision" : "direct"}`,
      `slot state ${quickActionMixSnapshotContextLabel(action)}`,
      `current mix ${mixSnapshotQuickActionPosture(project, exportAnalysis)}`,
      `master ${quickActionMixSnapshotMasterPosture(project)}`
    ], quickActionMixSnapshotNextCheck(resultTargetId))
  };
}

export function quickActionMixSnapshotMetricValue(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses,
  parts: string[],
  nextCheck: string
): string {
  return [
    ...parts,
    ...quickActionMixSnapshotProjectMetricParts(project, stemAnalyses, analysis),
    `next ${nextCheck}`
  ].join(" / ");
}

export function quickActionMixSnapshotProjectMetricParts(
  project: ProjectState,
  stemAnalyses: StemExportAnalyses,
  analysis: ExportAnalysis
): string[] {
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const stemSpread = stemSpreadDb(stemAnalyses);
  const stemLabel =
    stemSpread === null
      ? `${audibleStemTracks(stemAnalyses).length}/${stemTrackIds.length} audible stems`
      : `${audibleStemTracks(stemAnalyses).length}/${stemTrackIds.length} audible stems / ${stemSpread.toFixed(1)} dB spread`;

  return [
    `Pattern ${project.selectedPattern}`,
    `${drumHitCount(pattern)} drum hits`,
    `${pattern.bassNotes.length} 808`,
    `${pattern.melodyNotes.length} Synth`,
    `${pattern.chordEvents.length} chords`,
    `${patternEventTotal(pattern)} editable events`,
    patternUseLabel,
    `${project.arrangement.length} blocks`,
    barCountLabel(arrangementTotalBars(project)),
    `export ${analysis.status} / H ${formatDb(analysis.headroomDb)}`,
    `stems ${stemLabel}`
  ];
}

export function quickActionMixSnapshotMasterPosture(project: ProjectState): string {
  return `${project.masterPreset} / C ${formatDb(project.masterCeilingDb)} / O ${formatDb(masterChannelVolumeDb(project.mixer))}`;
}

export function quickActionMixSnapshotResultTargetId(
  action: QuickAction,
  target: MixSnapshotQuickActionTarget
): MixSnapshotResultTargetId {
  switch (action.resultTargetId) {
    case "capture-a":
    case "capture-b":
    case "recall-a":
    case "recall-b":
    case "clear":
    case "decision":
      return action.resultTargetId;
    default:
      return target.id;
  }
}

export function quickActionMixSnapshotMetricLabel(
  target: MixSnapshotQuickActionTarget,
  resultTargetId: MixSnapshotResultTargetId
): string {
  if (target.id !== "decision") {
    return target.label;
  }
  return `Mix Snapshot Decision: ${quickActionMixSnapshotTargetLabel(resultTargetId)}`;
}

export function quickActionMixSnapshotActionLabel(action: QuickAction, targetId: MixSnapshotResultTargetId): string {
  if (action.id === "mix-snapshot-readout-action") {
    return "review mix snapshot readout";
  }
  if (action.id === "mix-snapshot-decision") {
    return `run mix snapshot decision ${targetId}`;
  }
  if (targetId === "clear") {
    return "clear mix snapshot slots";
  }
  if (targetId.startsWith("capture-")) {
    return "capture mix snapshot";
  }
  if (targetId.startsWith("recall-")) {
    return "recall mix snapshot";
  }
  return "run mix snapshot";
}

export function quickActionMixSnapshotTargetLabel(targetId: MixSnapshotResultTargetId): string {
  switch (targetId) {
    case "capture-a":
      return "Capture A";
    case "capture-b":
      return "Capture B";
    case "recall-a":
      return "Recall A";
    case "recall-b":
      return "Recall B";
    case "clear":
      return "Clear A/B";
    case "decision":
      return "Decision target";
  }
}

export function quickActionMixSnapshotContextLabel(action: QuickAction): string {
  return quickActionMixSnapshotDetailParts(action).join(" / ") || action.title;
}

export function quickActionMixSnapshotDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionMixSnapshotNextCheck(targetId: MixSnapshotResultTargetId): string {
  switch (targetId) {
    case "capture-a":
      return "make one concrete mix or master change, then capture B before comparing";
    case "capture-b":
      return "compare A/B metrics, then recall a pass only after listening to Full Mix and core stems";
    case "recall-a":
      return "play Full Mix and core stems after recalling A before another Mix Balance or Mix Fix move";
    case "recall-b":
      return "play Full Mix and core stems after recalling B before another Mix Balance or Mix Fix move";
    case "clear":
      return "capture A again after the next concrete mix or master change";
    case "decision":
      return "follow the visible Mix Snapshot Decision Readout before changing slots";
  }
}

export function directExportQuickActionTarget(actionId: string): DirectExportQuickActionTarget | null {
  switch (actionId) {
    case "export-wav":
      return { id: "wav", label: "WAV Export", metricId: "export-wav" };
    case "export-stems":
      return { id: "stems", label: "Stem Export", metricId: "export-stems" };
    case "export-midi":
      return { id: "midi", label: "MIDI Export", metricId: "export-midi" };
    case "export-handoff-sheet":
      return { id: "sheet", label: "Handoff Sheet", metricId: "export-handoff-sheet" };
    default:
      return null;
  }
}

export function directExportQuickActionPosture(
  project: ProjectState,
  target: DirectExportQuickActionTarget,
  exportAnalysis: ExportAnalysis
): string {
  switch (target.id) {
    case "wav":
      return `${mixWavFileName(project)} / ${exportAnalysis.status} / ${barCountLabel(arrangementTotalBars(project))}`;
    case "stems": {
      const stemAnalyses = analyzeStemExports(project);
      const stemSpread = stemSpreadDb(stemAnalyses);
      const spreadLabel = stemSpread === null ? "spread n/a" : `${stemSpread.toFixed(1)} dB spread`;
      return `${stemWavFileNames(project).length} files / ${audibleStemTracks(stemAnalyses).length}/${stemTrackIds.length} audible / ${spreadLabel}`;
    }
    case "midi":
      return `${midiFileName(project)} / ${barCountLabel(arrangementTotalBars(project))} / Pattern ${
        usedPatternSlots(project).join("/") || project.selectedPattern
      }`;
    case "sheet":
      return `${handoffSheetFileName(project)} / ${sessionBriefFilledFields(project.sessionBrief)}/4 brief / ${
        activeDeliveryTarget(project).name
      }`;
  }
}

export function quickActionDirectExportMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const target = directExportQuickActionTarget(action.id);
  if (!target) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const noopExport = (): void => undefined;
  const handoffPackItems = createHandoffPackItems({
    analysis: exportAnalysis,
    project,
    stemAnalyses,
    onExportHandoffSheet: noopExport,
    onExportMidi: noopExport,
    onExportStems: noopExport,
    onExportWav: noopExport
  });
  const sendOrder = createHandoffPackSendOrderSummary(project, handoffPackItems);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const handoffItem = handoffPackItems.find((item) => item.id === target.id) ?? null;
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const handoffItemLabel = handoffItem ? `${handoffItem.value} / ${handoffItem.detail}` : "handoff item unavailable";

  return {
    id: target.metricId,
    label: target.label,
    value: [
      "run direct export",
      "destination Deliver panel",
      `deliverable ${handoffExportReceiptItemLabel(target.id)}`,
      `file ${directExportQuickActionFileLabel(project, target)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      directExportQuickActionReadinessLabel(project, target, exportAnalysis, stemAnalyses),
      `handoff ${handoffItemLabel}`,
      ...quickActionDirectExportDeliveryMetricParts(
        project,
        target,
        packageSummary,
        exportAnalysis,
        stemAnalyses,
        handoffPackItems,
        sendOrder,
        receipt
      ),
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project))
    ].join(" / ")
  };
}

export function quickActionDirectExportDeliveryMetricParts(
  project: ProjectState,
  target: DirectExportQuickActionTarget,
  packageSummary: HandoffPackageCheckSummary,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses,
  handoffPackItems: HandoffPackItem[],
  sendOrder: HandoffPackSendOrderSummary,
  receipt: HandoffExportReceipt
): string[] {
  const deliveryTarget = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const readyCount = handoffPackItems.filter((item) => item.tone === "good").length;
  const reviewCount = handoffPackItems.filter((item) => item.tone === "warn").length;
  const blockerCount = handoffPackItems.filter((item) => item.tone === "danger").length;

  return [
    `target ${deliveryTarget.name} / ${barCountLabel(deliveryTarget.targetBars)} / ${deliveryTarget.stemGoal} stems`,
    `wav ${mixWavFileName(project)} / ${analysis.status} / H ${formatDb(analysis.headroomDb)}`,
    `stems ${audibleStemCount}/${deliveryTarget.stemGoal} target / ${audibleStemCount}/${stemTrackIds.length} audible / ${stemWavFileNames(
      project
    ).join(" + ")}`,
    `midi ${midiFileName(project)} / ${barCountLabel(bars)}`,
    `sheet ${handoffSheetFileName(project)} / brief ${sessionBriefFilledFields(project.sessionBrief)}/4 / ${briefStatus.value}`,
    `receipt ${directExportQuickActionReceiptLabel(target, receipt)} / ${receipt.nextLabel}`,
    `send ${sendOrder.statusLabel} / ${sendOrder.nextLabel}`,
    `sequence ${sendOrder.sequenceLabel}`,
    `checks ${readyCount}/${handoffPackItems.length} ready`,
    workflowCountLabel(reviewCount, "review"),
    workflowCountLabel(blockerCount, "blocker"),
    `package ${packageSummary.headline}`,
    packageSummary.detail,
    `next ${receipt.itemId === target.id ? receipt.nextLabel : sendOrder.nextLabel}`
  ];
}

export function directExportQuickActionFileLabel(project: ProjectState, target: DirectExportQuickActionTarget): string {
  switch (target.id) {
    case "wav":
      return mixWavFileName(project);
    case "stems":
      return `${stemWavFileNames(project).length} stem WAVs`;
    case "midi":
      return midiFileName(project);
    case "sheet":
      return handoffSheetFileName(project);
  }
}

export function directExportQuickActionReadinessLabel(
  project: ProjectState,
  target: DirectExportQuickActionTarget,
  exportAnalysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): string {
  switch (target.id) {
    case "wav":
      return `mix ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`;
    case "stems": {
      const audibleStems = audibleStemTracks(stemAnalyses);
      const stemSpread = stemSpreadDb(stemAnalyses);
      const spreadLabel = stemSpread === null ? "spread n/a" : `${stemSpread.toFixed(1)} dB spread`;
      return `stems ${audibleStems.length}/${stemTrackIds.length} audible / ${spreadLabel}`;
    }
    case "midi":
      return `midi ${barCountLabel(arrangementTotalBars(project))} / ${
        usedPatternSlots(project).join("/") || project.selectedPattern
      }`;
    case "sheet":
      return `sheet ${sessionBriefFilledFields(project.sessionBrief)}/4 brief / ${activeDeliveryTarget(project).name}`;
  }
}

export function directExportQuickActionReceiptLabel(
  target: DirectExportQuickActionTarget,
  receipt: HandoffExportReceipt
): string {
  if (receipt.itemId === target.id) {
    return `${receipt.statusLabel} / ${receipt.fileLabel}`;
  }

  if (receipt.itemId) {
    return `${receipt.statusLabel} ${handoffExportReceiptItemLabel(receipt.itemId)}`;
  }

  return "No export receipt yet";
}

export function quickActionDeliveryTargetSelectMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (!action.id.startsWith("delivery-target-set-")) {
    return null;
  }

  const target = quickActionDeliveryTargetSelectTarget(project, action);
  if (!target) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const selectedTarget = activeDeliveryTarget(project);
  const preview = createDeliveryTargetAlignmentPreview(project, target);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, null);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionDeliveryTargetSelectDetailParts(action);
  const contextLabel = detailParts.join(" / ") || target.focus;
  const nextCheck =
    selectedTarget.id === target.id
      ? isDeliveryTargetAligned(project, target)
        ? "Export Preflight"
        : "Align Delivery Target"
      : "Set Delivery Target";

  return {
    id: "delivery-target",
    label: "Delivery target",
    value: [
      `action ${action.title}`,
      `selected ${selectedTarget.name}`,
      `command target ${target.name}`,
      `focus ${target.focus}`,
      `context ${contextLabel}`,
      `fit ${preview.statusLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `target length ${barCountLabel(target.targetBars)}`,
      `template ${arrangementTemplateLabel(target.preferredTemplate)}`,
      `master ${target.preferredMasterPreset}`,
      `mix ${mixPostureLabel(target.mixPosture)}`,
      `stems ${target.stemGoal}`,
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `brief ${sessionBriefFilledFields(project.sessionBrief)}/4`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `next ${nextCheck}`
    ].join(" / ")
  };
}

export function quickActionDeliveryTargetSelectTarget(project: ProjectState, action: QuickAction): DeliveryTarget | null {
  if (!action.id.startsWith("delivery-target-set-")) {
    return null;
  }

  const targetId = action.id.slice("delivery-target-set-".length);
  if (targetId === "custom") {
    return deliveryTargetForId("custom", project.customDeliveryTarget);
  }

  return deliveryTargets.find((target) => target.id === targetId) ?? null;
}

export function quickActionDeliveryTargetSelectDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionDeliveryTargetAlignMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "delivery-target-align") {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const target = activeDeliveryTarget(project);
  const preview = createDeliveryTargetAlignmentPreview(project, target);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, null);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionDeliveryTargetAlignDetailParts(action);
  const contextLabel = detailParts.join(" / ") || preview.detailTitle;

  return {
    id: "delivery-target-align",
    label: "Target align",
    value: [
      `action ${action.title}`,
      "destination Deliver panel",
      `target ${target.name}`,
      `fit ${preview.statusLabel}`,
      `context ${contextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `length ${preview.lengthLabel}`,
      `master ${preview.masterLabel}`,
      `mix ${preview.mixLabel}`,
      `stems ${preview.stemLabel}`,
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `brief ${sessionBriefFilledFields(project.sessionBrief)}/4`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `next ${preview.tone === "good" ? "Export Preflight" : "Align Delivery Target"}`
    ].join(" / ")
  };
}

export function quickActionDeliveryTargetAlignDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionSessionBriefCompassMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "session-brief-compass-focus" && !action.id.startsWith("session-brief-compass-card-")) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const summary = createSessionBriefCompassSummary(project, exportAnalysis, stemAnalyses);
  const card = quickActionSessionBriefCompassCard(summary, action);
  if (!card) {
    return null;
  }

  const target = activeDeliveryTarget(project);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, null);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionSessionBriefCompassDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || card.detail || detailParts.join(" / ");

  return {
    id: "session-brief-compass",
    label: "Brief compass",
    value: [
      `action ${action.title}`,
      `lane ${quickActionSessionBriefCompassLaneLabel(action, card)}`,
      `destination ${sessionBriefCompassDestinationLabel(card, project.sessionBrief)}`,
      `status ${card.value}`,
      `context ${contextLabel}`,
      `brief ${sessionBriefFilledFields(project.sessionBrief)}/4`,
      `fields ${quickActionSessionBriefStarterFieldPosture(project.sessionBrief)}`,
      `target ${target.name}`,
      `target focus ${target.focus}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `next ${card.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionSessionBriefCompassCard(
  summary: SessionBriefCompassSummary,
  action: QuickAction
): SessionBriefCompassCard | null {
  if (action.id === "session-brief-compass-focus") {
    return activeSessionBriefCompassQuickActionCard(summary);
  }

  const cardId = quickActionSessionBriefCompassCardId(action.id);
  if (!cardId) {
    return null;
  }

  return summary.cards.find((card) => card.id === cardId) ?? null;
}

export function quickActionSessionBriefCompassCardId(actionId: string): SessionBriefCompassCardId | null {
  if (!actionId.startsWith("session-brief-compass-card-")) {
    return null;
  }

  return actionId.slice("session-brief-compass-card-".length) as SessionBriefCompassCardId;
}

export function quickActionSessionBriefCompassDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionSessionBriefCompassLaneLabel(action: QuickAction, card: SessionBriefCompassCard): string {
  return `${action.id === "session-brief-compass-focus" ? "active" : "direct"} ${card.label}`;
}

export function quickActionReferenceAlignmentMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "reference-alignment-focus" && !action.id.startsWith("reference-alignment-card-")) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, exportAnalysis);
  const summary = createReferenceAlignmentSummary(project, checks, exportAnalysis, stemAnalyses);
  const card = quickActionReferenceAlignmentCard(summary, action);
  if (!card) {
    return null;
  }

  const target = activeDeliveryTarget(project);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, null);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionReferenceAlignmentDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || card.detail || detailParts.join(" / ");
  const audibleStems = audibleStemTracks(stemAnalyses);

  return {
    id: "reference-alignment",
    label: "Reference alignment",
    value: [
      `action ${action.title}`,
      `lane ${quickActionReferenceAlignmentLaneLabel(action, card)}`,
      `destination ${referenceAlignmentDestinationLabel(card)}`,
      `status ${card.value}`,
      `context ${contextLabel}`,
      `alignment ${summary.headline}`,
      `brief ${sessionBriefFilledFields(project.sessionBrief)}/4`,
      `fields ${quickActionSessionBriefStarterFieldPosture(project.sessionBrief)}`,
      `target ${target.name}`,
      `target focus ${target.focus}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStems.length}/${target.stemGoal} audible`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `next ${card.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionReferenceAlignmentCard(
  summary: ReferenceAlignmentSummary,
  action: QuickAction
): ReferenceAlignmentCard | null {
  if (action.id === "reference-alignment-focus") {
    return activeReferenceAlignmentQuickActionCard(summary);
  }

  const cardId = quickActionReferenceAlignmentCardId(action.id);
  if (!cardId) {
    return null;
  }

  return summary.cards.find((card) => card.id === cardId) ?? null;
}

export function quickActionReferenceAlignmentCardId(actionId: string): ReferenceAlignmentCardId | null {
  if (!actionId.startsWith("reference-alignment-card-")) {
    return null;
  }

  return actionId.slice("reference-alignment-card-".length) as ReferenceAlignmentCardId;
}

export function quickActionReferenceAlignmentDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionReferenceAlignmentLaneLabel(action: QuickAction, card: ReferenceAlignmentCard): string {
  return `${action.id === "reference-alignment-focus" ? "active" : "direct"} ${card.label}`;
}

export function referenceAlignmentDestinationLabel(card: ReferenceAlignmentCard): string {
  switch (card.focusTarget) {
    case "artist":
      return "Session Brief / Artist field";
    case "vibe":
      return "Session Brief / Vibe field";
    case "reference":
      return "Session Brief / Reference field";
    case "notes":
      return "Session Brief / Notes field";
    case "arrange":
      return "Arrange panel";
    case "master":
      return "Master panel";
    case "deliver":
      return "Deliver panel";
  }
}

export function quickActionSelectedEventMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const eventType = quickActionSelectedEventType(action.id);
  if (!eventType) {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const exportAnalysis = analysis ?? analyzeExport(project);
  const detailParts = quickActionSelectedEventDetailParts(action);
  const contextLabel = detailParts.join(" / ") || action.title;

  return {
    id: `selected-${eventType}`,
    label: quickActionSelectedEventMetricLabel(eventType),
    value: [
      `action ${action.title}`,
      `lane ${quickActionSelectedEventLaneLabel(eventType)}`,
      `command ${quickActionSelectedEventCommandLabel(action)}`,
      `context ${contextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `drums ${drumHitCount(pattern)} hits`,
      `808 ${pattern.bassNotes.length} notes`,
      `Synth ${pattern.melodyNotes.length} notes`,
      `chords ${pattern.chordEvents.length} events`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `next ${quickActionSelectedEventNextCheck(eventType, action)}`
    ].join(" / ")
  };
}

export type QuickActionSelectedEventType = "note" | "drum" | "chord";

export function quickActionSelectedEventType(actionId: string): QuickActionSelectedEventType | null {
  if (actionId.startsWith("selected-note-")) {
    return "note";
  }
  if (actionId.startsWith("selected-drum-")) {
    return "drum";
  }
  if (actionId.startsWith("selected-chord-")) {
    return "chord";
  }
  return null;
}

export function quickActionSelectedEventMetricLabel(eventType: QuickActionSelectedEventType): string {
  switch (eventType) {
    case "note":
      return "Selected note";
    case "drum":
      return "Selected drum";
    case "chord":
      return "Selected chord";
  }
}

export function quickActionSelectedEventLaneLabel(eventType: QuickActionSelectedEventType): string {
  switch (eventType) {
    case "note":
      return "808/Synth note";
    case "drum":
      return "Drum hit";
    case "chord":
      return "Chord event";
  }
}

export function quickActionSelectedEventCommandLabel(action: QuickAction): string {
  return action.title.replace(/^Selected\s+/i, "").trim() || action.title;
}

export function quickActionSelectedEventDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionSelectedEventNextCheck(eventType: QuickActionSelectedEventType, action: QuickAction): string {
  if (action.id.endsWith("-audition")) {
    return `Loop Pattern after the one-shot ${quickActionSelectedEventMetricLabel(eventType).toLowerCase()} check if it needs full-context judgment`;
  }

  if (action.id.endsWith("-copy")) {
    return "Paste or duplicate explicitly; clipboard state stays UI-local until the next write command";
  }

  if (action.id.endsWith("-delete")) {
    return "Audition the Pattern and undo if the groove, bass, melody, or harmony support disappeared";
  }

  switch (eventType) {
    case "note":
      return "Loop Pattern, then continue selected-note edits or compare Pattern A/B/C when the phrase feels right";
    case "drum":
      return "Loop Pattern, then continue selected-drum edits or use Drum Move for broader groove shaping";
    case "chord":
      return "Loop Pattern, then continue selected-chord edits or use Chord Move for broader harmonic shaping";
  }
}

export type EditorAuditionReadoutSummary = {
  selected: boolean;
  statusLabel: string;
  targetTypeLabel: string;
  targetLabel: string;
  routeLabel: string;
  metricLabel: string;
  metricValue: string;
  runtimeLabel: string;
  detailLabel: string;
  keywords: string;
};

export function createEditorAuditionReadoutSummary({
  project,
  selectedDrumStep,
  selectedDrumActive,
  selectedDrumVelocity,
  selectedDrumTiming,
  selectedDrumProbability,
  selectedHatRepeat,
  selectedNote,
  selectedBassNote,
  selectedMelodyNote,
  selectedChord,
  editorAuditionResult
}: {
  project: ProjectState;
  selectedDrumStep: SelectedDrumStep | null;
  selectedDrumActive: boolean;
  selectedDrumVelocity: number | undefined;
  selectedDrumTiming: number;
  selectedDrumProbability: number | undefined;
  selectedHatRepeat: number;
  selectedNote: SelectedNote | null;
  selectedBassNote: BassNote | undefined;
  selectedMelodyNote: MelodyNote | undefined;
  selectedChord: ChordEvent | undefined;
  editorAuditionResult: EditorAuditionResult | null;
}): EditorAuditionReadoutSummary {
  const runtimeLabel = editorAuditionResult
    ? `${editorAuditionResult.status}: ${editorAuditionResult.title}`
    : "No audition result yet";

  if (selectedDrumStep && selectedDrumActive) {
    const velocity = selectedDrumVelocity ?? defaultDrumVelocity(selectedDrumStep.lane, selectedDrumStep.step);
    const probability = selectedDrumProbability ?? 1;
    const repeatLabel = selectedDrumStep.lane === "hat" ? `x${selectedHatRepeat}` : "single";

    return {
      selected: true,
      statusLabel: "Ready",
      targetTypeLabel: "Drum hit",
      targetLabel: `${drumLabels[selectedDrumStep.lane]} step ${selectedDrumStep.step + 1}`,
      routeLabel: "selected drum hit -> one-shot drum rack",
      metricLabel: "Pocket",
      metricValue: `${timingLabel(selectedDrumTiming)} / ${percentLabel(velocity)} velocity / ${percentLabel(
        probability
      )} chance / ${repeatLabel}`,
      runtimeLabel,
      detailLabel: `Pattern ${project.selectedPattern} / selected drum event ready / ${runtimeLabel}`,
      keywords: `drum hit ${selectedDrumStep.lane} step ${selectedDrumStep.step + 1} velocity chance timing ${repeatLabel}`
    };
  }

  const note = selectedNote?.track === "bass" ? selectedBassNote : selectedMelodyNote;
  if (selectedNote && note) {
    const trackLabel = selectedNote.track === "bass" ? "808" : "Synth";
    const articulation = selectedNote.track === "bass" ? (selectedBassNote?.glide ? "glide" : "no glide") : "melody";

    return {
      selected: true,
      statusLabel: "Ready",
      targetTypeLabel: `${trackLabel} note`,
      targetLabel: `${trackLabel} ${note.pitch} step ${note.step + 1}`,
      routeLabel: `selected ${trackLabel} note -> one-shot ${trackLabel} device`,
      metricLabel: "Pitch",
      metricValue: `${note.pitch} / len ${note.length} / ${percentLabel(note.velocity)} velocity / ${percentLabel(
        normalizeEventProbability(note.probability)
      )} chance / ${articulation}`,
      runtimeLabel,
      detailLabel: `Pattern ${project.selectedPattern} / selected ${trackLabel} note ready / ${runtimeLabel}`,
      keywords: `${trackLabel} note ${note.pitch} step ${note.step + 1} length velocity chance ${articulation}`
    };
  }

  if (selectedChord) {
    return {
      selected: true,
      statusLabel: "Ready",
      targetTypeLabel: "Chord event",
      targetLabel: `Chord ${selectedChord.root}${selectedChord.quality} step ${selectedChord.step + 1}`,
      routeLabel: "selected chord event -> one-shot chord device",
      metricLabel: "Voicing",
      metricValue: `${chordInversionLabel(normalizeChordInversion(selectedChord.inversion))} / len ${
        selectedChord.length
      } / ${percentLabel(selectedChord.velocity)} velocity / ${percentLabel(
        normalizeEventProbability(selectedChord.probability)
      )} chance`,
      runtimeLabel,
      detailLabel: `Pattern ${project.selectedPattern} / selected chord event ready / ${runtimeLabel}`,
      keywords: `chord ${selectedChord.root}${selectedChord.quality} step ${selectedChord.step + 1} inversion length velocity chance`
    };
  }

  if (selectedDrumStep) {
    return {
      selected: false,
      statusLabel: "Inactive target",
      targetTypeLabel: "Drum hit",
      targetLabel: `${drumLabels[selectedDrumStep.lane]} step ${selectedDrumStep.step + 1}`,
      routeLabel: "select an active drum hit before one-shot audition",
      metricLabel: "Selection",
      metricValue: "inactive drum hit",
      runtimeLabel,
      detailLabel: `Pattern ${project.selectedPattern} / inactive drum target / ${runtimeLabel}`,
      keywords: `inactive drum ${selectedDrumStep.lane} step ${selectedDrumStep.step + 1}`
    };
  }

  if (selectedNote) {
    const trackLabel = selectedNote.track === "bass" ? "808" : "Synth";

    return {
      selected: false,
      statusLabel: "Inactive target",
      targetTypeLabel: `${trackLabel} note`,
      targetLabel: `${trackLabel} ${selectedNote.pitch} step ${selectedNote.step + 1}`,
      routeLabel: `select an active ${trackLabel} note before one-shot audition`,
      metricLabel: "Selection",
      metricValue: "inactive note",
      runtimeLabel,
      detailLabel: `Pattern ${project.selectedPattern} / inactive ${trackLabel} target / ${runtimeLabel}`,
      keywords: `inactive ${trackLabel} note ${selectedNote.pitch} step ${selectedNote.step + 1}`
    };
  }

  return {
    selected: false,
    statusLabel: "No target",
    targetTypeLabel: "Selected event",
    targetLabel: "No selected event",
    routeLabel: "select a drum, 808, Synth, or chord event before one-shot audition",
    metricLabel: "Selection",
    metricValue: "none",
    runtimeLabel,
    detailLabel: `Pattern ${project.selectedPattern} / no selected audition target / ${runtimeLabel}`,
    keywords: "no selected event drum 808 synth chord"
  };
}

export function quickActionEditorAuditionReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "editor-audition-readout-action") {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const exportAnalysis = analysis ?? analyzeExport(project);
  const detailParts = quickActionSelectedEventDetailParts(action);
  const targetLabel = detailParts[0] ?? action.title;
  const routeLabel = detailParts[1] ?? "one-shot route";
  const metricLabel = detailParts[2] ?? "event metric";
  const runtimeLabel = detailParts[3] ?? "runtime fallback";
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;

  return {
    id: "editor-audition-readout",
    label: "Editor Audition",
    value: [
      "review editor audition",
      `target ${targetLabel}`,
      `route ${routeLabel}`,
      `metric ${metricLabel}`,
      `runtime ${runtimeLabel}`,
      `selected ${quickActionArrangementSelectedBlockLabel(project, selectedArrangementIndex)}`,
      `Pattern ${project.selectedPattern}`,
      `drums ${drumHitCount(pattern)} hits`,
      `808 ${pattern.bassNotes.length} notes`,
      `Synth ${pattern.melodyNotes.length} notes`,
      `chords ${pattern.chordEvents.length} events`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      "one-shot unchanged",
      "audio unchanged",
      "selection unchanged",
      "events unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function quickActionUndoRedoMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "undo" && action.id !== "redo") {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const exportAnalysis = analysis ?? analyzeExport(project);
  const contextLabel = action.detail.trim() || action.title;

  return {
    id: "edit-history",
    label: quickActionUndoRedoMetricLabel(action),
    value: [
      `action ${quickActionUndoRedoActionLabel(action)}`,
      `command ${action.title}`,
      `edit ${quickActionUndoRedoEditLabel(action)}`,
      `context ${contextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `drums ${drumHitCount(pattern)} hits`,
      `808 ${pattern.bassNotes.length} notes`,
      `Synth ${pattern.melodyNotes.length} notes`,
      `chords ${pattern.chordEvents.length} events`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `next ${quickActionUndoRedoNextCheck(action)}`
    ].join(" / ")
  };
}

export function quickActionUndoRedoActionLabel(action: QuickAction): "Undo" | "Redo" {
  return action.id === "undo" ? "Undo" : "Redo";
}

export function quickActionUndoRedoMetricLabel(action: QuickAction): string {
  return `${quickActionUndoRedoActionLabel(action)} history`;
}

export function quickActionUndoRedoEditLabel(action: QuickAction): string {
  const [, editLabel = ""] = action.title.split(/:\s(.+)/);
  const normalizedEditLabel = editLabel.trim();
  if (normalizedEditLabel) {
    return normalizedEditLabel;
  }

  return action.id === "undo" ? "last project edit" : "last undone project edit";
}

export function quickActionUndoRedoNextCheck(action: QuickAction): string {
  return action.id === "undo"
    ? "Play the restored Pattern and use Redo immediately if the edit went one step too far"
    : "Play the replayed Pattern and use Undo immediately if the edit breaks the current pass";
}

export function quickActionProjectFileMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "save-project" && action.id !== "open-project") {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const exportAnalysis = analysis ?? analyzeExport(project);
  const contextLabel = action.detail.trim() || action.title;

  return {
    id: "project-file",
    label: quickActionProjectFileMetricLabel(action),
    value: [
      `action ${quickActionProjectFileActionLabel(action)}`,
      `command ${action.title}`,
      `file ${projectFileName(project)}`,
      `safety ${quickActionProjectFileSafetyLabel(action)}`,
      `context ${contextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `drums ${drumHitCount(pattern)} hits`,
      `808 ${pattern.bassNotes.length} notes`,
      `Synth ${pattern.melodyNotes.length} notes`,
      `chords ${pattern.chordEvents.length} events`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `next ${quickActionProjectFileNextCheck(action)}`
    ].join(" / ")
  };
}

export function quickActionProjectFileActionLabel(action: QuickAction): "Save" | "Open" {
  return action.id === "save-project" ? "Save" : "Open";
}

export function quickActionProjectFileMetricLabel(action: QuickAction): string {
  return `${quickActionProjectFileActionLabel(action)} file`;
}

export function quickActionProjectFileSafetyLabel(action: QuickAction): string {
  return action.id === "save-project" ? "durable project copy" : "loaded project handoff";
}

export function quickActionProjectFileNextCheck(action: QuickAction): string {
  return action.id === "save-project"
    ? "Keep composing, then save again after the next meaningful beat edit"
    : "Play the loaded Pattern, confirm the beat, then save a durable copy after changes";
}

export function quickActionLocalDraftMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "restore-local-draft" && action.id !== "clear-local-draft") {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const exportAnalysis = analysis ?? analyzeExport(project);
  const contextLabel = action.detail.trim() || action.title;

  return {
    id: "local-draft",
    label: quickActionLocalDraftMetricLabel(action),
    value: [
      `action ${quickActionLocalDraftActionLabel(action)}`,
      `command ${action.title}`,
      `safety ${quickActionLocalDraftSafetyLabel(action)}`,
      `context ${contextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `drums ${drumHitCount(pattern)} hits`,
      `808 ${pattern.bassNotes.length} notes`,
      `Synth ${pattern.melodyNotes.length} notes`,
      `chords ${pattern.chordEvents.length} events`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `next ${quickActionLocalDraftNextCheck(action)}`
    ].join(" / ")
  };
}

export function quickActionLocalDraftActionLabel(action: QuickAction): "Restore" | "Clear" {
  return action.id === "restore-local-draft" ? "Restore" : "Clear";
}

export function quickActionLocalDraftMetricLabel(action: QuickAction): string {
  return `${quickActionLocalDraftActionLabel(action)} draft`;
}

export function quickActionLocalDraftSafetyLabel(action: QuickAction): string {
  return action.id === "restore-local-draft" ? "recovered editable project" : "cleared recovery copy only";
}

export function quickActionLocalDraftNextCheck(action: QuickAction): string {
  return action.id === "restore-local-draft"
    ? "Play the recovered Pattern, confirm the beat, then save a durable project copy"
    : "Keep composing or save the current project if it needs durable protection";
}

export function quickActionProjectSnapshotMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "save-snapshot") {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const exportAnalysis = analysis ?? analyzeExport(project);
  const contextLabel = action.detail.trim() || action.title;
  const latestSnapshot = project.snapshots[0] ?? null;
  const snapshotLabel = latestSnapshot ? `${latestSnapshot.name} (${projectSnapshotSummary(latestSnapshot)})` : "no snapshot saved";

  return {
    id: "snapshots",
    label: quickActionProjectSnapshotMetricLabel(),
    value: [
      `action ${quickActionProjectSnapshotActionLabel()}`,
      `command ${action.title}`,
      `slot ${project.snapshots.length}/${maxProjectSnapshots}`,
      `snapshot ${snapshotLabel}`,
      `safety ${quickActionProjectSnapshotSafetyLabel()}`,
      `context ${contextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `drums ${drumHitCount(pattern)} hits`,
      `808 ${pattern.bassNotes.length} notes`,
      `Synth ${pattern.melodyNotes.length} notes`,
      `chords ${pattern.chordEvents.length} events`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `next ${quickActionProjectSnapshotNextCheck()}`
    ].join(" / ")
  };
}

export function quickActionProjectSnapshotActionLabel(): "Save" {
  return "Save";
}

export function quickActionProjectSnapshotMetricLabel(): string {
  return `${quickActionProjectSnapshotActionLabel()} snapshot`;
}

export function quickActionProjectSnapshotSafetyLabel(): string {
  return "local project-file idea slot";
}

export function quickActionProjectSnapshotNextCheck(): string {
  return "Use Snapshot Compare before major edits, then save a durable project file copy";
}

export function quickActionProjectSafetyMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "project-safety-readout") {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const exportAnalysis = analysis ?? analyzeExport(project);
  const contextLabel = action.detail.trim() || action.title;

  return {
    id: "project-safety",
    label: "Project safety",
    value: [
      `action Check safety`,
      `command ${action.title}`,
      `context ${contextLabel}`,
      `file ${projectFileName(project)}`,
      `snapshots ${project.snapshots.length}/${maxProjectSnapshots}`,
      `Pattern ${project.selectedPattern}`,
      `drums ${drumHitCount(pattern)} hits`,
      `808 ${pattern.bassNotes.length} notes`,
      `Synth ${pattern.melodyNotes.length} notes`,
      `chords ${pattern.chordEvents.length} events`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `next ${quickActionProjectSafetyNextCheck(action)}`
    ].join(" / ")
  };
}

export function quickActionProjectSafetyNextCheck(action: QuickAction): string {
  const detail = action.detail.toLowerCase();
  if (detail.includes("draft found")) {
    return "Restore or clear the local draft before choosing the durable file state";
  }
  if (detail.includes("unsaved") || detail.includes("file changed") || detail.includes("draft")) {
    return "Save a durable project file after the next meaningful beat edit";
  }
  if (detail.includes("file saved") || detail.includes("durable copy")) {
    return "Use Save Snapshot before risky edits, then keep composing";
  }
  return "Save a durable project file before leaving the session";
}

export function quickActionSessionBriefStarterMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const pad = quickActionSessionBriefStarterPad(action);
  if (!pad) {
    return null;
  }

  const starterBrief = createSessionBriefStarterBrief(project, pad.id);
  const nextBrief = applySessionBriefStarter(project.sessionBrief, starterBrief);
  const changedCount = sessionBriefChangedFieldCount(project.sessionBrief, nextBrief);
  const filledFields = sessionBriefFilledFields(project.sessionBrief);
  const target = activeDeliveryTarget(project);
  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, null);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionSessionBriefStarterDetailParts(action);
  const contextLabel = detailParts.join(" / ") || pad.detail;
  const blankPosture = changedCount > 0 ? `${changedCount}/4 blank fields fillable` : "blank fields already covered";

  return {
    id: "session-brief",
    label: "Brief starter",
    value: [
      `action ${action.title}`,
      `starter ${pad.label}`,
      `status ${blankPosture}`,
      `context ${contextLabel}`,
      `brief ${filledFields}/4`,
      `fields ${quickActionSessionBriefStarterFieldPosture(project.sessionBrief)}`,
      `target ${target.name}`,
      `target focus ${target.focus}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `next ${changedCount > 0 ? "Review Brief Compass" : "Handoff Package Check"}`
    ].join(" / ")
  };
}

export function quickActionSessionBriefStarterPad(action: QuickAction): SessionBriefStarterPadDefinition | null {
  if (!action.id.startsWith("session-brief-starter-")) {
    return null;
  }

  const padId = action.id.slice("session-brief-starter-".length);
  return sessionBriefStarterPadDefinitions.find((pad) => pad.id === padId) ?? null;
}

export function quickActionSessionBriefStarterDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionSessionBriefStarterFieldPosture(brief: SessionBrief): string {
  return sessionBriefFields
    .map((field) => `${sessionBriefFieldLabel(field)} ${brief[field].trim() ? compactSessionBriefValue(brief[field]) : "empty"}`)
    .join(" / ");
}

export function quickActionHandoffNextExportMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-next-export") {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const noopExport = (): void => undefined;
  const handoffPackItems = createHandoffPackItems({
    analysis: exportAnalysis,
    project,
    stemAnalyses,
    onExportHandoffSheet: noopExport,
    onExportMidi: noopExport,
    onExportStems: noopExport,
    onExportWav: noopExport
  });
  const sendOrder = createHandoffPackSendOrderSummary(project, handoffPackItems);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const detailParts = quickActionHandoffNextExportDetailParts(action);
  const targetItem = handoffNextExportTargetItem(handoffPackItems, sendOrder, receipt);
  const targetId = targetItem?.id ?? receipt.itemId ?? sendOrder.nextItemId;
  const directTarget = targetId ? handoffNextExportDirectTarget(targetId) : null;
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const deliverableLabel = targetId ? handoffExportReceiptItemLabel(targetId) : "No next deliverable";
  const itemPosture = targetItem ? `${targetItem.value} / ${targetItem.detail}` : "Send order clear";
  const statusLabel = receipt.itemId ? receipt.statusLabel : detailParts[0] ?? sendOrder.statusLabel;
  const contextLabel = detailParts.slice(1).join(" / ") || itemPosture;
  const fileLabel =
    receipt.itemId && receipt.itemId === targetId
      ? receipt.fileLabel
      : directTarget
        ? directExportQuickActionFileLabel(project, directTarget)
        : "No file target";
  const readinessLabel = directTarget
    ? directExportQuickActionReadinessLabel(project, directTarget, exportAnalysis, stemAnalyses)
    : "send order clear";

  return {
    id: "handoff-next-export",
    label: "Handoff next export",
    value: [
      "run handoff next export",
      "destination Deliver panel",
      `current next ${sendOrder.nextLabel}`,
      `deliverable ${deliverableLabel}`,
      `status ${statusLabel}`,
      `file ${fileLabel}`,
      `context ${contextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      readinessLabel,
      ...quickActionHandoffNextExportDeliveryMetricParts(
        project,
        packageSummary,
        exportAnalysis,
        stemAnalyses,
        handoffPackItems,
        sendOrder,
        receipt,
        targetId
      ),
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project))
    ].join(" / ")
  };
}

export function quickActionHandoffNextExportDeliveryMetricParts(
  project: ProjectState,
  packageSummary: HandoffPackageCheckSummary,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses,
  handoffPackItems: HandoffPackItem[],
  sendOrder: HandoffPackSendOrderSummary,
  receipt: HandoffExportReceipt,
  targetId: HandoffPackItem["id"] | null
): string[] {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const readyCount = handoffPackItems.filter((item) => item.tone === "good").length;
  const reviewCount = handoffPackItems.filter((item) => item.tone === "warn").length;
  const blockerCount = handoffPackItems.filter((item) => item.tone === "danger").length;
  const targetItem = targetId ? (handoffPackItems.find((item) => item.id === targetId) ?? null) : null;
  const targetItemLabel = targetItem ? `${targetItem.label} ${targetItem.value} / ${targetItem.detail}` : "No next deliverable";

  return [
    `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
    `wav ${mixWavFileName(project)} / ${analysis.status} / H ${formatDb(analysis.headroomDb)}`,
    `stems ${audibleStemCount}/${target.stemGoal} target / ${audibleStemCount}/${stemTrackIds.length} audible / ${stemWavFileNames(
      project
    ).length} files`,
    `midi ${midiFileName(project)} / ${barCountLabel(bars)}`,
    `sheet ${handoffSheetFileName(project)} / brief ${sessionBriefFilledFields(project.sessionBrief)}/4 / ${briefStatus.value}`,
    `receipt ${handoffNextExportReceiptLabel(receipt, targetId)} / ${receipt.nextLabel}`,
    `send ${sendOrder.statusLabel} / ${sendOrder.nextLabel} / ${targetItemLabel}`,
    `sequence ${sendOrder.sequenceLabel}`,
    `checks ${readyCount}/${handoffPackItems.length} ready`,
    workflowCountLabel(reviewCount, "review"),
    workflowCountLabel(blockerCount, "blocker"),
    `package ${packageSummary.headline}`,
    packageSummary.detail,
    `next ${receipt.itemId ? receipt.nextLabel : sendOrder.nextLabel}`
  ];
}

export function quickActionHandoffNextExportDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function handoffNextExportTargetItem(
  items: HandoffPackItem[],
  sendOrder: HandoffPackSendOrderSummary,
  receipt: HandoffExportReceipt
): HandoffPackItem | null {
  const targetId = receipt.itemId ?? sendOrder.nextItemId;
  return targetId ? items.find((item) => item.id === targetId) ?? null : null;
}

export function handoffNextExportDirectTarget(itemId: HandoffPackItem["id"]): DirectExportQuickActionTarget {
  switch (itemId) {
    case "wav":
      return { id: "wav", label: "WAV Export", metricId: "handoff-next-wav" };
    case "stems":
      return { id: "stems", label: "Stem Export", metricId: "handoff-next-stems" };
    case "midi":
      return { id: "midi", label: "MIDI Export", metricId: "handoff-next-midi" };
    case "sheet":
      return { id: "sheet", label: "Handoff Sheet", metricId: "handoff-next-sheet" };
  }
}

export function handoffNextExportReceiptLabel(
  receipt: HandoffExportReceipt,
  targetId: HandoffPackItem["id"] | null
): string {
  if (receipt.itemId && receipt.itemId === targetId) {
    return `${receipt.statusLabel} / ${receipt.fileLabel}`;
  }

  if (receipt.itemId) {
    return `${receipt.statusLabel} ${handoffExportReceiptItemLabel(receipt.itemId)}`;
  }

  return "No export receipt yet";
}

export function quickActionHandoffPackageCheckMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-package-check-focus" && !action.id.startsWith("handoff-package-check-card-")) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const summary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const card = quickActionHandoffPackageCheckCard(summary, action);
  if (!card) {
    return null;
  }

  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const noopExport = (): void => undefined;
  const handoffPackItems = createHandoffPackItems({
    analysis: exportAnalysis,
    project,
    stemAnalyses,
    onExportHandoffSheet: noopExport,
    onExportMidi: noopExport,
    onExportStems: noopExport,
    onExportWav: noopExport
  });
  const sendOrder = createHandoffPackSendOrderSummary(project, handoffPackItems);
  const detailParts = quickActionHandoffPackageCheckDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || card.detail;

  return {
    id: "handoff-package-check",
    label: "Handoff package",
    value: [
      quickActionHandoffPackageCheckActionLabel(action),
      `lane ${quickActionHandoffPackageCheckLaneLabel(action, card)}`,
      `destination ${card.focusLabel} panel`,
      `status ${card.status}`,
      `context ${contextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `files ${quickActionHandoffPackageCheckCardPosture(summary, "files")}`,
      `order ${quickActionHandoffPackageCheckCardPosture(summary, "order")}`,
      `receipt ${quickActionHandoffPackageCheckCardPosture(summary, "receipt")}`,
      `session ${quickActionHandoffPackageCheckCardPosture(summary, "context")}`,
      `package ${summary.headline}`,
      summary.detail,
      ...quickActionHandoffPackageCheckDeliveryMetricParts(
        project,
        summary,
        exportAnalysis,
        stemAnalyses,
        handoffPackItems,
        sendOrder,
        receipt,
        card
      ),
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project))
    ].join(" / ")
  };
}

export function quickActionHandoffPackageCheckDeliveryMetricParts(
  project: ProjectState,
  summary: HandoffPackageCheckSummary,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses,
  handoffPackItems: HandoffPackItem[],
  sendOrder: HandoffPackSendOrderSummary,
  receipt: HandoffExportReceipt,
  card: HandoffPackageCheckCard
): string[] {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const readyCount = handoffPackItems.filter((item) => item.tone === "good").length;
  const reviewCount = handoffPackItems.filter((item) => item.tone === "warn").length;
  const blockerCount = handoffPackItems.filter((item) => item.tone === "danger").length;
  const nextItem = sendOrder.nextItemId
    ? (handoffPackItems.find((item) => item.id === sendOrder.nextItemId) ?? null)
    : null;
  const nextItemLabel = nextItem ? `${nextItem.label} ${nextItem.value} / ${nextItem.detail}` : "All deliverables ready";

  return [
    `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
    `wav ${mixWavFileName(project)} / ${analysis.status} / H ${formatDb(analysis.headroomDb)}`,
    `stems ${audibleStemCount}/${target.stemGoal} target / ${audibleStemCount}/${stemTrackIds.length} audible / ${stemWavFileNames(
      project
    ).length} files`,
    `midi ${midiFileName(project)} / ${barCountLabel(bars)}`,
    `sheet ${handoffSheetFileName(project)} / brief ${sessionBriefFilledFields(project.sessionBrief)}/4 / ${briefStatus.value}`,
    `latest ${receipt.itemId ? `${receipt.statusLabel} / ${receipt.fileLabel} / ${receipt.nextLabel}` : "No export receipt yet"}`,
    `send next ${sendOrder.nextLabel} / ${nextItemLabel}`,
    `sequence ${sendOrder.sequenceLabel}`,
    `checks ${readyCount}/${handoffPackItems.length} ready`,
    workflowCountLabel(reviewCount, "review"),
    workflowCountLabel(blockerCount, "blocker"),
    `package metric ${handoffPackageCheckFocusResultMetric(summary)}`,
    `next ${handoffPackageCheckFocusResultNextCheck(card)}`
  ];
}

export function quickActionHandoffPackageCheckActionLabel(action: QuickAction): string {
  return action.id === "handoff-package-check-focus" ? "focus priority handoff package" : "focus direct handoff package";
}

export function quickActionHandoffPackageCheckCard(
  summary: HandoffPackageCheckSummary,
  action: QuickAction
): HandoffPackageCheckCard | null {
  if (action.id === "handoff-package-check-focus") {
    return activeHandoffPackageCheckQuickActionCard(summary);
  }

  const cardId = quickActionHandoffPackageCheckCardId(action.id);
  return cardId ? summary.cards.find((card) => card.id === cardId) ?? null : null;
}

export function quickActionHandoffPackageCheckCardId(actionId: string): HandoffPackageCheckCard["id"] | null {
  if (!actionId.startsWith("handoff-package-check-card-")) {
    return null;
  }

  const cardId = actionId.slice("handoff-package-check-card-".length);
  return cardId === "files" || cardId === "order" || cardId === "receipt" || cardId === "context" ? cardId : null;
}

export function quickActionHandoffPackageCheckDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionHandoffPackageCheckLaneLabel(action: QuickAction, card: HandoffPackageCheckCard): string {
  const titleLabel = action.title.replace(/^Focus Handoff Package:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Handoff Package" ? titleLabel : card.label;
}

export function quickActionHandoffPackageCheckCardPosture(
  summary: HandoffPackageCheckSummary,
  cardId: HandoffPackageCheckCard["id"]
): string {
  const card = summary.cards.find((item) => item.id === cardId);
  return card ? `${card.value} / ${card.status}` : "unavailable";
}

export function patternCompareDecisionQuickActionKind(action: QuickAction): PatternCompareDecisionSummary["action"] | null {
  if (action.id !== "pattern-compare-decision") {
    return null;
  }
  return action.title.startsWith("Use recommended Pattern") ? "use" : "cue";
}

export function patternCompareDecisionQuickActionTarget(action: QuickAction): PatternSlot | null {
  if (action.id !== "pattern-compare-decision") {
    return null;
  }
  const match = action.title.match(/Pattern ([ABC])/);
  const slot = match?.[1];
  return slot === "A" || slot === "B" || slot === "C" ? slot : null;
}

export function patternCompareDecisionQuickActionPosture(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): string {
  const metric = quickActionPatternCompareDecisionMetricSnapshot(project, action, selectedArrangementIndex);
  if (metric) {
    return metric.value;
  }

  const target = patternCompareDecisionQuickActionTarget(action) ?? project.selectedPattern;
  const targetPattern = project.patterns[target];
  const eventLabel = `${patternEventTotal(targetPattern)} events`;
  if (patternCompareDecisionQuickActionKind(action) === "use") {
    const arrangedBlocks = project.arrangement.filter((block) => block.pattern === target);
    const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
    const blockLabel = `${arrangedBlocks.length} block${arrangedBlocks.length === 1 ? "" : "s"}`;
    return `Use Pattern ${target} / ${blockLabel} / ${barCountLabel(arrangedBars)} / ${eventLabel}`;
  }

  return `Cue Pattern ${target} / edit Pattern ${project.selectedPattern} / ${eventLabel}`;
}

export function quickActionPatternCompareDecisionMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  const kind = patternCompareDecisionQuickActionKind(action);
  const target = patternCompareDecisionQuickActionTarget(action);
  if (!kind || !target) {
    return null;
  }

  const identity = patternCompareDecisionMetricIdentity(kind);
  const targetPattern = project.patterns[target];
  const eventCount = patternEventTotal(targetPattern);
  const drumCount = drumHitCount(targetPattern);
  const musicEvents = targetPattern.bassNotes.length + targetPattern.chordEvents.length + targetPattern.melodyNotes.length;
  const arrangedBlocks = project.arrangement.filter((block) => block.pattern === target);
  const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  const arrangementUse =
    arrangedBlocks.length === 0
      ? "not arranged"
      : `${arrangedBlocks.length} block${arrangedBlocks.length === 1 ? "" : "s"} / ${barCountLabel(arrangedBars)}`;
  const selectedBlockPlacement = patternCompareDecisionSelectedBlockPlacement(project, selectedArrangementIndex, target);

  return {
    id: "pattern-compare-decision",
    label: identity.label,
    value: `${identity.actionLabel} / Pattern ${target} / ${eventCount} events / ${drumCount} drums / ${musicEvents} music / ${selectedBlockPlacement} / arrangement ${arrangementUse} / edit Pattern ${project.selectedPattern}`
  };
}

export function patternCompareDecisionMetricIdentity(kind: PatternCompareDecisionSummary["action"]): {
  label: string;
  actionLabel: string;
} {
  if (kind === "use") {
    return {
      label: "Pattern placement",
      actionLabel: "use recommendation"
    };
  }

  return {
    label: "Pattern cue",
    actionLabel: "cue recommendation"
  };
}

export function patternCompareDecisionSelectedBlockPlacement(
  project: ProjectState,
  selectedArrangementIndex: number,
  target: PatternSlot
): string {
  if (project.arrangement.length === 0) {
    return `no selected block / ${barCountLabel(arrangementTotalBars(project))}`;
  }

  const boundedIndex = Math.min(Math.max(0, selectedArrangementIndex), project.arrangement.length - 1);
  const block = project.arrangement[boundedIndex];
  const bars = normalizeArrangementBars(block.bars);
  const startBar = arrangementStartBar(project, boundedIndex) + 1;
  const endBar = startBar + bars - 1;
  const rangeLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
  const placementLabel = block.pattern === target ? "target in selected block" : `selected block uses Pattern ${block.pattern}`;
  return `${placementLabel} / Block ${boundedIndex + 1} ${block.section} / ${rangeLabel} / ${barCountLabel(bars)}`;
}

export function quickActionPatternCueSwitchMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  mode: "cue" | "switch",
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  const target = patternCueSwitchQuickActionTarget(action, mode);
  if (!target) {
    return null;
  }

  const identity = patternCueSwitchMetricIdentity(mode);
  const targetPattern = project.patterns[target];
  const eventCount = patternEventTotal(targetPattern);
  const drumCount = drumHitCount(targetPattern);
  const musicEvents = targetPattern.bassNotes.length + targetPattern.chordEvents.length + targetPattern.melodyNotes.length;
  const arrangedBlocks = project.arrangement.filter((block) => block.pattern === target);
  const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  const arrangementUse =
    arrangedBlocks.length === 0
      ? "not arranged"
      : `${arrangedBlocks.length} block${arrangedBlocks.length === 1 ? "" : "s"} / ${barCountLabel(arrangedBars)}`;
  const selectedBlockPlacement = patternCueSwitchSelectedBlockPlacement(project, selectedArrangementIndex, target);

  return {
    id: identity.id,
    label: identity.label,
    value: `${identity.actionLabel} / Pattern ${target} / ${eventCount} events / ${drumCount} drums / ${musicEvents} music / arrangement ${arrangementUse} / ${selectedBlockPlacement} / edit Pattern ${project.selectedPattern}`
  };
}

export function patternCueSwitchQuickActionTarget(action: QuickAction, mode: "cue" | "switch"): PatternSlot | null {
  const prefix = mode === "cue" ? "pattern-cue-" : "pattern-switch-";
  if (!action.id.startsWith(prefix)) {
    return null;
  }

  return patternSlotFromQuickActionValue(action.id.slice(prefix.length));
}

export function patternCueSwitchMetricIdentity(mode: "cue" | "switch"): {
  id: string;
  label: string;
  actionLabel: string;
} {
  if (mode === "cue") {
    return {
      id: "pattern-cue",
      label: "Pattern cue",
      actionLabel: "cue Pattern loop"
    };
  }

  return {
    id: "pattern-switch",
    label: "Edit pattern",
    actionLabel: "switch edit focus"
  };
}

export function patternCueSwitchSelectedBlockPlacement(
  project: ProjectState,
  selectedArrangementIndex: number,
  target: PatternSlot
): string {
  if (project.arrangement.length === 0) {
    return "selected block none";
  }

  const boundedIndex = Math.min(Math.max(0, selectedArrangementIndex), project.arrangement.length - 1);
  const block = project.arrangement[boundedIndex];
  const placementLabel = block.pattern === target ? "target in selected block" : `selected block uses Pattern ${block.pattern}`;
  return `${placementLabel} / Block ${boundedIndex + 1} ${block.section} / ${barCountLabel(block.bars)}`;
}

export function quickActionPatternUseReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  const target = patternUseReadoutQuickActionTarget(action);
  if (!target) {
    return null;
  }

  const targetPattern = project.patterns[target];
  const eventCount = patternEventTotal(targetPattern);
  const drumCount = drumHitCount(targetPattern);
  const musicEvents = targetPattern.bassNotes.length + targetPattern.chordEvents.length + targetPattern.melodyNotes.length;
  const arrangedBlocks = project.arrangement.filter((block) => block.pattern === target);
  const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  const arrangementUse =
    arrangedBlocks.length === 0
      ? "not arranged"
      : `${arrangedBlocks.length} block${arrangedBlocks.length === 1 ? "" : "s"} / ${barCountLabel(arrangedBars)}`;
  const selectedBlockPlacement = patternUseSelectedBlockPlacement(project, selectedArrangementIndex, target);

  return {
    id: "pattern-use-readout",
    label: "Pattern Use Readout",
    value: [
      "review pattern use",
      `target Pattern ${target}`,
      selectedBlockPlacement,
      `${eventCount} events`,
      `${drumCount} drums`,
      `${musicEvents} music`,
      `arrangement ${arrangementUse}`,
      `edit Pattern ${project.selectedPattern}`,
      "assignment unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function patternUseReadoutQuickActionTarget(action: QuickAction): PatternSlot | null {
  if (action.id !== "pattern-use-readout-action") {
    return null;
  }

  const match = /Pattern ([ABC])/.exec(`${action.title} ${action.detail}`);
  const slot = match?.[1];
  return slot === "A" || slot === "B" || slot === "C" ? slot : null;
}

export function quickActionPatternUseMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  const target = patternUseQuickActionTarget(action);
  if (!target) {
    return null;
  }

  const targetPattern = project.patterns[target];
  const eventCount = patternEventTotal(targetPattern);
  const drumCount = drumHitCount(targetPattern);
  const musicEvents = targetPattern.bassNotes.length + targetPattern.chordEvents.length + targetPattern.melodyNotes.length;
  const arrangedBlocks = project.arrangement.filter((block) => block.pattern === target);
  const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  const arrangementUse =
    arrangedBlocks.length === 0
      ? "not arranged"
      : `${arrangedBlocks.length} block${arrangedBlocks.length === 1 ? "" : "s"} / ${barCountLabel(arrangedBars)}`;
  const selectedBlockPlacement = patternUseSelectedBlockPlacement(project, selectedArrangementIndex, target);

  return {
    id: "pattern-use",
    label: "Arrangement pattern",
    value: `assign selected block / Pattern ${target} / ${selectedBlockPlacement} / ${eventCount} events / ${drumCount} drums / ${musicEvents} music / arrangement ${arrangementUse} / edit Pattern ${project.selectedPattern}`
  };
}

export function patternUseQuickActionTarget(action: QuickAction): PatternSlot | null {
  if (!action.id.startsWith("pattern-use-")) {
    return null;
  }

  return patternSlotFromQuickActionValue(action.id.slice("pattern-use-".length));
}

export function patternUseSelectedBlockPlacement(
  project: ProjectState,
  selectedArrangementIndex: number,
  target: PatternSlot
): string {
  if (project.arrangement.length === 0) {
    return `no selected block / ${barCountLabel(arrangementTotalBars(project))}`;
  }

  const boundedIndex = Math.min(Math.max(0, selectedArrangementIndex), project.arrangement.length - 1);
  const block = project.arrangement[boundedIndex];
  const bars = normalizeArrangementBars(block.bars);
  const startBar = arrangementStartBar(project, boundedIndex) + 1;
  const endBar = startBar + bars - 1;
  const rangeLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
  const placementLabel = block.pattern === target ? "target assigned to selected block" : `selected block uses Pattern ${block.pattern}`;
  return `${placementLabel} / Block ${boundedIndex + 1} ${block.section} / ${rangeLabel} / ${barCountLabel(bars)}`;
}

export function quickActionBeatReadinessMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const checks = createBeatReadinessChecks(project, analyzeExport(project));
  const check = beatReadinessQuickActionCheckFromChecks(checks, action.id);
  if (!check) {
    return null;
  }

  const pattern = activePattern(project);
  const parts = quickActionBeatReadinessDetailParts(action);
  const contextLabel = parts.slice(1).join(" / ") || check.detail;
  const actionLabel = action.id === "beat-readiness-focus" ? "focus priority beat readiness" : "focus direct beat readiness";
  const laneLabel = quickActionBeatReadinessLaneLabel(action, check);
  const drumCount = drumHitCount(pattern);
  const musicEvents = pattern.bassNotes.length + pattern.chordEvents.length + pattern.melodyNotes.length;
  const readyLayerCount = [
    drumCount > 0,
    pattern.bassNotes.length > 0,
    pattern.chordEvents.length > 0,
    pattern.melodyNotes.length > 0
  ].filter(Boolean).length;
  const readyCount = checks.filter((item) => item.tone === "good").length;
  const reviewCount = checks.filter((item) => item.tone === "warn").length;
  const blockerCount = checks.filter((item) => item.tone === "danger").length;

  return {
    id: "beat-readiness",
    label: "Beat readiness",
    value: `${actionLabel} / lane ${laneLabel} / destination ${check.focusLabel} panel / status ${check.status} / context ${contextLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${drumCount} drum hits / ${musicEvents} music events / ${
      pattern.bassNotes.length
    } 808 / ${pattern.chordEvents.length} chords / ${pattern.melodyNotes.length} synth / ${readyLayerCount}/4 layers / ${
      project.arrangement.length
    } blocks / ${barCountLabel(arrangementTotalBars(project))} / ${readyCount}/${checks.length} ready / ${workflowCountLabel(
      reviewCount,
      "review"
    )} / ${workflowCountLabel(blockerCount, "blocker")}`
  };
}

export function quickActionBeatReadinessDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionBeatReadinessLaneLabel(action: QuickAction, check: BeatReadinessCheck): string {
  const titleLabel = action.title.replace(/^Focus Beat Readiness:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Beat Readiness" ? titleLabel : check.label;
}

export function quickActionListeningPassMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const exportAnalysis = analyzeExport(project);
  const summary = createListeningPassSummary(
    project,
    createBeatReadinessChecks(project, exportAnalysis),
    exportAnalysis,
    analyzeStemExports(project)
  );
  const item = quickActionListeningPassItem(summary, action);
  if (!item) {
    return null;
  }

  const pattern = activePattern(project);
  const parts = quickActionListeningPassDetailParts(action);
  const cueLabel = parts.slice(2).join(" / ") || item.cue;
  const actionLabel = action.id === "listening-pass-focus" ? "focus priority listening pass" : "focus direct listening pass";
  const laneLabel = quickActionListeningPassLaneLabel(action, item);
  const drumCount = drumHitCount(pattern);
  const musicEvents = pattern.bassNotes.length + pattern.chordEvents.length + pattern.melodyNotes.length;

  return {
    id: "listening-pass",
    label: "Listening pass",
    value: `${actionLabel} / checkpoint ${laneLabel} / destination ${item.focusLabel} panel / status ${item.status} / context ${
      item.detail
    } / cue ${cueLabel} / metric ${item.metric} / Pattern ${project.selectedPattern} / ${patternEventTotal(
      pattern
    )} events / ${drumCount} drum hits / ${musicEvents} music events / readiness ${listeningPassFocusResultMetric(summary)} / ${
      project.arrangement.length
    } blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionListeningPassItem(summary: ListeningPassSummary, action: QuickAction): ListeningPassItem | null {
  if (action.id === "listening-pass-focus") {
    return activeListeningPassQuickActionItem(summary);
  }

  const itemId = listeningPassQuickActionItemId(action.id);
  return itemId ? summary.items.find((item) => item.id === itemId) ?? null : null;
}

export function listeningPassQuickActionItemId(actionId: string): ListeningPassId | null {
  if (!actionId.startsWith("listening-pass-checkpoint-")) {
    return null;
  }

  const itemId = actionId.slice("listening-pass-checkpoint-".length);
  return itemId === "composition" || itemId === "arrangement" || itemId === "mix" || itemId === "delivery" ? itemId : null;
}

export function quickActionListeningPassDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionListeningPassLaneLabel(action: QuickAction, item: ListeningPassItem): string {
  const titleLabel = action.title.replace(/^Focus Listening Pass:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Listening Pass" ? titleLabel : item.label;
}

export function quickActionBeatPassportMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const exportAnalysis = analyzeExport(project);
  const summary = createBeatPassportSummary(
    project,
    createBeatReadinessChecks(project, exportAnalysis),
    exportAnalysis,
    analyzeStemExports(project)
  );
  const metric = quickActionBeatPassportMetric(summary, action);
  if (!metric) {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const actionLabel = action.id === "beat-passport-focus" ? "focus priority beat passport" : "focus direct beat passport";
  const laneLabel = quickActionBeatPassportLaneLabel(action, metric);
  const detailParts = quickActionBeatPassportDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || metric.detail;

  return {
    id: "beat-passport",
    label: "Beat passport",
    value: `${actionLabel} / metric ${laneLabel} / destination ${metric.focusLabel} panel / status ${metric.value} / context ${contextLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${patternUseLabel} / identity ${summary.headline} / ${summary.detail} / passport ${beatPassportFocusResultMetric(
      summary
    )} / ${project.arrangement.length} blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionBeatPassportMetric(summary: BeatPassportSummary, action: QuickAction): BeatPassportMetric | null {
  if (action.id === "beat-passport-focus") {
    return activeBeatPassportQuickActionMetric(summary);
  }

  const metricId = beatPassportQuickActionMetricId(action.id);
  return metricId ? summary.metrics.find((metric) => metric.id === metricId) ?? null : null;
}

export function beatPassportQuickActionMetricId(actionId: string): BeatPassportMetricId | null {
  if (!actionId.startsWith("beat-passport-metric-")) {
    return null;
  }

  const metricId = actionId.slice("beat-passport-metric-".length);
  return metricId === "target" ||
    metricId === "length" ||
    metricId === "patterns" ||
    metricId === "readiness" ||
    metricId === "export" ||
    metricId === "stems" ||
    metricId === "master"
    ? metricId
    : null;
}

export function quickActionBeatPassportDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionBeatPassportLaneLabel(action: QuickAction, metric: BeatPassportMetric): string {
  const titleLabel = action.title.replace(/^Focus Beat Passport:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Beat Passport" ? titleLabel : metric.label;
}

export function quickActionProductionSnapshotMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const exportAnalysis = analyzeExport(project);
  const summary = createProductionSnapshotSummary(
    project,
    createBeatReadinessChecks(project, exportAnalysis),
    exportAnalysis,
    analyzeStemExports(project)
  );
  const metric = quickActionProductionSnapshotMetric(summary, action);
  if (!metric) {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const actionLabel =
    action.id === "production-snapshot-focus" ? "focus priority production snapshot" : "focus direct production snapshot";
  const laneLabel = quickActionProductionSnapshotLaneLabel(action, metric);
  const detailParts = quickActionProductionSnapshotDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || metric.detail;
  const postureLabel = summary.metrics.map((item) => `${item.label} ${item.value}`).join(" / ");

  return {
    id: "production-snapshot",
    label: "Production snapshot",
    value: `${actionLabel} / metric ${laneLabel} / destination ${metric.focusLabel} panel / status ${metric.value} / context ${contextLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${patternUseLabel} / posture ${postureLabel} / session ${
      summary.headline
    } / ${summary.detail} / snapshot ${productionSnapshotFocusResultMetric(summary)} / ${
      project.arrangement.length
    } blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionProductionSnapshotMetric(
  summary: ProductionSnapshotSummary,
  action: QuickAction
): ProductionSnapshotMetric | null {
  if (action.id === "production-snapshot-focus") {
    return activeProductionSnapshotQuickActionMetric(summary);
  }

  const metricId = productionSnapshotQuickActionMetricId(action.id);
  return metricId ? summary.metrics.find((metric) => metric.id === metricId) ?? null : null;
}

export function productionSnapshotQuickActionMetricId(actionId: string): ProductionSnapshotMetricId | null {
  if (!actionId.startsWith("production-snapshot-metric-")) {
    return null;
  }

  const metricId = actionId.slice("production-snapshot-metric-".length);
  return metricId === "target" ||
    metricId === "form" ||
    metricId === "patterns" ||
    metricId === "mix" ||
    metricId === "handoff"
    ? metricId
    : null;
}

export function quickActionProductionSnapshotDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionProductionSnapshotLaneLabel(action: QuickAction, metric: ProductionSnapshotMetric): string {
  const titleLabel = action.title.replace(/^Focus Production Snapshot:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Production Snapshot" ? titleLabel : metric.label;
}

export function quickActionFinishChecklistMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const exportAnalysis = analyzeExport(project);
  const summary = createFinishChecklistSummary(
    project,
    createBeatReadinessChecks(project, exportAnalysis),
    exportAnalysis,
    analyzeStemExports(project)
  );
  const card = quickActionFinishChecklistCard(summary, action);
  if (!card) {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const actionLabel =
    action.id === "finish-checklist-focus" ? "focus priority finish checklist" : "focus direct finish checklist";
  const laneLabel = quickActionFinishChecklistLaneLabel(action, card);
  const detailParts = quickActionFinishChecklistDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || card.detail;
  const postureLabel = summary.cards.map((item) => `${item.label} ${item.status}`).join(" / ");

  return {
    id: "finish-checklist",
    label: "Finish checklist",
    value: `${actionLabel} / card ${laneLabel} / destination ${card.focusLabel} panel / status ${card.status} / context ${contextLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${patternUseLabel} / finish ${postureLabel} / readiness ${
      summary.headline
    } / ${summary.detail} / checklist ${finishChecklistFocusResultMetric(summary)} / ${
      project.arrangement.length
    } blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionFinishChecklistCard(summary: FinishChecklistSummary, action: QuickAction): FinishChecklistCard | null {
  if (action.id === "finish-checklist-focus") {
    return activeFinishChecklistQuickActionCard(summary);
  }

  const cardId = finishChecklistQuickActionCardId(action.id);
  return cardId ? summary.cards.find((card) => card.id === cardId) ?? null : null;
}

export function finishChecklistQuickActionCardId(actionId: string): FinishChecklistCardId | null {
  if (!actionId.startsWith("finish-checklist-card-")) {
    return null;
  }

  const cardId = actionId.slice("finish-checklist-card-".length);
  return cardId === "compose" ||
    cardId === "arrange" ||
    cardId === "mix" ||
    cardId === "master" ||
    cardId === "automation" ||
    cardId === "handoff"
    ? cardId
    : null;
}

export function quickActionFinishChecklistDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionFinishChecklistLaneLabel(action: QuickAction, card: FinishChecklistCard): string {
  const titleLabel = action.title.replace(/^Focus Finish Checklist:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Finish Checklist" ? titleLabel : card.label;
}

export function quickActionReviewQueueMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const exportAnalysis = analysis ?? analyzeExport(project);
  const summary = createReviewQueueSummary(
    project,
    createBeatReadinessChecks(project, exportAnalysis),
    exportAnalysis,
    analyzeStemExports(project)
  );
  const item = quickActionReviewQueueItem(summary, action);
  if (!item) {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const actionLabel = action.id === "review-queue-focus" ? "focus priority review queue" : "focus direct review queue";
  const laneLabel = quickActionReviewQueueLaneLabel(action, item);
  const detailParts = quickActionReviewQueueDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || item.detail;
  const postureLabel = summary.items.map((queueItem) => `${queueItem.area} ${queueItem.status}`).join(" / ");
  const fix = createReviewFixOption(item, project, exportAnalysis);
  const fixLabel = fix ? `${fix.label} available` : "no one-step fix";

  return {
    id: "review-queue",
    label: "Review queue",
    value: `${actionLabel} / issue ${laneLabel} / destination ${item.focusLabel} panel / status ${item.status} / context ${contextLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${patternUseLabel} / queue ${postureLabel} / review ${
      summary.headline
    } / ${summary.detail} / fix ${fixLabel} / metric ${reviewQueueFocusResultMetric(summary)} / ${
      project.arrangement.length
    } blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionReviewQueueItem(summary: ReviewQueueSummary, action: QuickAction): ReviewQueueItem | null {
  if (action.id === "review-queue-focus") {
    return summary.items[0] ?? null;
  }

  const itemId = reviewQueueQuickActionItemId(action.id);
  return itemId ? summary.items.find((item) => item.id === itemId) ?? null : null;
}

export function reviewQueueQuickActionItemId(actionId: string): string | null {
  return actionId.startsWith("review-queue-item-") ? actionId.slice("review-queue-item-".length) : null;
}

export function quickActionReviewQueueDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionReviewQueueLaneLabel(action: QuickAction, item: ReviewQueueItem): string {
  const titleLabel = action.title.replace(/^Focus Review Queue:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Review Queue" ? titleLabel : item.area;
}

export function quickActionReviewFixMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, exportAnalysis);
  const summary = createReviewQueueSummary(project, checks, exportAnalysis, stemAnalyses);
  const targetId = quickActionReviewFixTargetId(action);
  const item = quickActionReviewFixItem(summary, action, targetId);
  const fix = item ? createReviewFixOption(item, project, exportAnalysis) : null;
  const pattern = activePattern(project);
  const target = activeDeliveryTarget(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionReviewFixDetailParts(action);
  const selectedFixLabel =
    fix ? `${fix.label} / ${fix.detail}` : detailParts.slice(0, 2).join(" / ") || "No one-step fix";
  const scopeLabel = fix ? reviewFixScopeLabel(fix) : quickActionReviewFixFallbackScope(action);
  const issueLabel = quickActionReviewFixLaneLabel(action, item);
  const statusLabel = item ? item.status : targetId ? "Cleared or moved down" : "No fix target";
  const contextLabel = item?.detail ?? (detailParts.slice(2).join(" / ") || summary.detail);
  const destinationLabel = item?.focusLabel ?? quickActionReviewFixDestinationLabel(action);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const followup = quickActionReviewFixFollowup(project, action, exportAnalysis);

  return {
    id: "review-fix",
    label: "Review fix",
    value: [
      quickActionReviewFixActionLabel(action),
      `destination Project / Review Queue -> ${destinationLabel} panel`,
      `issue ${issueLabel}`,
      `status ${statusLabel}`,
      `context ${contextLabel}`,
      `fix ${selectedFixLabel}`,
      `scope ${scopeLabel}`,
      `impact ${quickActionReviewFixImpactLabel(item, targetId)}`,
      `target ${target.name}`,
      `queue ${quickActionReviewFixQueuePosture(summary)}`,
      `readiness ${quickActionReviewFixBeatReadinessPosture(checks)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStemCount}/${stemTrackIds.length} audible`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionReviewFixItem(
  summary: ReviewQueueSummary,
  action: QuickAction,
  targetId: string | null = quickActionReviewFixTargetId(action)
): ReviewQueueItem | null {
  if (targetId) {
    return summary.items.find((item) => item.id === targetId) ?? null;
  }

  return action.id === "review-fix" ? activeReviewFixItem(summary) : null;
}

export function quickActionReviewFixTargetId(action: QuickAction): string | null {
  if (action.id.startsWith("review-queue-fix-")) {
    return action.id.slice("review-queue-fix-".length);
  }

  const marker = "review fix action top issue triage ";
  const markerIndex = action.keywords.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  const [candidate] = action.keywords.slice(markerIndex + marker.length).trim().split(/\s+/);
  return candidate && candidate !== "none" ? candidate : null;
}

export function quickActionReviewFixDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionReviewFixActionLabel(action: QuickAction): string {
  return action.id === "review-fix" ? "apply priority Review Fix" : "apply direct Review Fix";
}

export function quickActionReviewFixLaneLabel(action: QuickAction, item: ReviewQueueItem | null): string {
  const titleLabel = action.title.replace(/^Apply Review Fix:\s*/, "").trim();
  return titleLabel && titleLabel !== "Apply Review Fix" ? titleLabel : item?.area ?? "Review Queue issue";
}

export function quickActionReviewFixDestinationLabel(action: QuickAction): string {
  switch (action.group) {
    case "Create":
      return "Compose";
    case "Arrange":
      return "Arrange";
    case "Mix":
      return "Mix";
    case "Master":
      return "Master";
    case "Export":
      return "Deliver";
    default:
      return "Review Queue";
  }
}

export function quickActionReviewFixFallbackScope(action: QuickAction): string {
  return action.group && action.group !== "Project" ? `${action.group} / Review Fix` : "Project / Review Queue";
}

export function quickActionReviewFixImpactLabel(item: ReviewQueueItem | null, targetId: string | null): string {
  if (item) {
    return `target still queued as ${item.tone}`;
  }

  return targetId ? "target cleared or moved down" : "no queue item selected";
}

export function quickActionReviewFixQueuePosture(summary: ReviewQueueSummary): string {
  const itemPosture = summary.items.map((item) => `${item.area} ${item.status}`).join(" / ");
  return itemPosture ? `${summary.headline} / ${summary.detail} / ${itemPosture}` : `${summary.headline} / ${summary.detail}`;
}

export function quickActionReviewFixBeatReadinessPosture(checks: BeatReadinessCheck[]): string {
  const readyCount = checks.filter((check) => check.tone === "good").length;
  const reviewCount = checks.filter((check) => check.tone === "warn").length;
  const blockerCount = checks.filter((check) => check.tone === "danger").length;
  return `${readyCount}/${checks.length} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(
    blockerCount,
    "blocker"
  )}`;
}

export function quickActionReviewFixFollowup(
  project: ProjectState,
  action: QuickAction,
  analysis: ExportAnalysis = analyzeExport(project)
): { auditionCue: string; nextCheck: string } {
  const summary = createReviewQueueSummary(
    project,
    createBeatReadinessChecks(project, analysis),
    analysis,
    analyzeStemExports(project)
  );
  const item = quickActionReviewFixItem(summary, action);
  const fix = item ? createReviewFixOption(item, project, analysis) : null;
  if (fix) {
    return {
      auditionCue: fix.auditionCue,
      nextCheck: fix.nextCheck
    };
  }

  const issueLabel = quickActionReviewFixLaneLabel(action, item);
  return {
    auditionCue: `Play the relevant Pattern, Song, Full Mix, or Handoff check for ${issueLabel}.`,
    nextCheck: "Return to Review Queue and confirm the fixed issue moved down or cleared before applying another one-step fix."
  };
}

export function quickActionComposerActionMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const area = composerActionQuickActionArea(action.id);
  if (!area) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, exportAnalysis);
  const summary = createComposerActionsSummary(project, checks, exportAnalysis, stemAnalyses);
  const actionId = quickActionComposerActionId(action.id);
  const composerAction = actionId ? (summary.actions.find((candidate) => candidate.id === actionId) ?? null) : null;
  const detailParts = quickActionComposerActionDetailParts(action);
  const profile = styleProfiles.find((candidate) => candidate.id === project.styleId) ?? styleProfiles[0];
  const styleSummary = profile
    ? createStyleInspectorSummary(project, profile, createPatternCompareSummaries(project))
    : null;
  const followup = quickActionResultFollowup(action, project, "complete");
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const target = activeDeliveryTarget(project);

  return {
    id: `composer-action-${area}`,
    label: quickActionComposerActionMetricLabel(area),
    value: [
      `move ${quickActionComposerActionMoveLabel(action, composerAction, detailParts)}`,
      `area ${quickActionComposerActionAreaLabel(area)}`,
      `route ${quickActionComposerActionRouteLabel(composerAction, area)}`,
      `scope ${composerAction?.scope ?? detailParts[1] ?? "current beat"}`,
      `impact ${composerAction?.impact ?? detailParts[2] ?? "writing state"}`,
      `undo ${composerAction?.safety ?? detailParts[3] ?? "undoable local action"}`,
      `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `drums ${drumHitCount(pattern)} hits`,
      `808 ${pattern.bassNotes.length} notes`,
      `harmony ${pattern.chordEvents.length} chords`,
      `melody ${pattern.melodyNotes.length} notes`,
      `selected ${quickActionArrangementSelectedBlockLabel(project, selectedArrangementIndex)}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `style goals ${styleSummary ? quickActionStyleInspectorGoalPosture(styleSummary) : "style goals unavailable"}`,
      `composer ${summary.headline} / ${summary.detail}`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionComposerActionId(actionId: string): string | null {
  if (!actionId.startsWith("composer-action-")) {
    return null;
  }

  return actionId.slice("composer-action-".length);
}

export function quickActionComposerActionDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}







export function quickActionStyleInspectorMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "style-inspector-focus" && !action.id.startsWith("style-inspector-item-")) {
    return null;
  }

  const profile = styleProfiles.find((candidate) => candidate.id === project.styleId) ?? styleProfiles[0];
  if (!profile) {
    return null;
  }

  const summary = createStyleInspectorSummary(project, profile, createPatternCompareSummaries(project));
  const item = quickActionStyleInspectorItem(summary, project, action);
  if (!item) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const detailParts = quickActionStyleInspectorDetailParts(action);
  const contextLabel = detailParts.join(" / ") || item.detail;

  return {
    id: "style-inspector",
    label: "Style inspector",
    value: [
      quickActionStyleInspectorActionLabel(action),
      `destination ${item.focusLabel} panel`,
      `lane ${quickActionStyleInspectorLaneLabel(action, item)}`,
      `context ${contextLabel}`,
      `style ${summary.profile.name}`,
      `BPM ${summary.bpm}`,
      `swing ${summary.swing}`,
      `bass ${summary.bass}`,
      `melody ${summary.melody}`,
      `sound ${summary.soundPreset}`,
      `goals ${quickActionStyleInspectorGoalPosture(summary)}`,
      `density ${quickActionStyleInspectorDensityPosture(summary)}`,
      `selected ${quickActionArrangementSelectedBlockLabel(project, selectedArrangementIndex)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `metric ${styleInspectorFocusResultMetric(summary)}`,
      `audition ${styleInspectorFocusResultAudition(item)}`,
      `next ${styleInspectorFocusResultNextCheck(item)}`
    ].join(" / ")
  };
}

export function quickActionStyleInspectorItem(
  summary: StyleInspectorSummary,
  project: ProjectState,
  action: QuickAction
): StyleInspectorFocusItem | null {
  if (action.id === "style-inspector-focus") {
    return activeStyleInspectorQuickActionItem(summary, project);
  }

  const focusId = quickActionStyleInspectorFocusId(action.id);
  if (!focusId) {
    return null;
  }

  return quickActionStyleInspectorItems(summary).find((item) => item.focusId === focusId) ?? null;
}

export function quickActionStyleInspectorItems(summary: StyleInspectorSummary): StyleInspectorFocusItem[] {
  return [...summary.metrics, ...summary.goals, ...summary.patterns];
}

export function quickActionStyleInspectorFocusId(actionId: string): string | null {
  if (!actionId.startsWith("style-inspector-item-")) {
    return null;
  }

  return actionId.slice("style-inspector-item-".length);
}

export function quickActionStyleInspectorDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionStyleInspectorActionLabel(action: QuickAction): string {
  return action.id === "style-inspector-focus" ? "focus priority style inspector" : "focus direct style inspector";
}

export function quickActionStyleInspectorLaneLabel(action: QuickAction, item: StyleInspectorFocusItem): string {
  const titleLabel = action.title.replace(/^Focus Style Inspector:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Style Inspector" ? titleLabel : item.label;
}

export function quickActionStyleInspectorGoalPosture(summary: StyleInspectorSummary): string {
  const readyCount = summary.goals.filter((goal) => goal.tone === "good").length;
  const reviewCount = summary.goals.filter((goal) => goal.tone === "warn").length;
  const blockerCount = summary.goals.filter((goal) => goal.tone === "danger").length;
  const goalPosture = summary.goals.map((goal) => `${goal.label} ${goal.current} -> ${goal.target}`).join(" / ");
  return `${summary.goalHeadline} / ${readyCount}/${summary.goals.length} ready / ${workflowCountLabel(
    reviewCount,
    "review"
  )} / ${workflowCountLabel(blockerCount, "blocker")} / ${goalPosture}`;
}

export function quickActionStyleInspectorDensityPosture(summary: StyleInspectorSummary): string {
  return summary.patterns
    .map((pattern) => `Pattern ${pattern.slot} ${pattern.label} ${pattern.eventCount} events`)
    .join(" / ");
}

export function quickActionSongFormPriorityMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "song-form-priority" && action.id !== "song-form-overview-readout-action") {
    return null;
  }

  const isReadout = action.id === "song-form-overview-readout-action";
  const summary = createSongFormOverviewSummary(project, selectedArrangementIndex);
  const priority = createSongFormPrioritySummary(summary);
  if (priority.targetIndex === null) {
    const pattern = activePattern(project);
    const usedSlots = usedPatternSlots(project);

    return {
      id: "song-form-overview-readout",
      label: "Song Form Overview Readout",
      value: [
        "review song form overview",
        "destination Arrange panel",
        `metric ${priority.metricLabel}`,
        `status ${priority.statusLabel}`,
        `context ${priority.reasonLabel}`,
        `edit Pattern ${project.selectedPattern}`,
        `${patternEventTotal(pattern)} editable events`,
        `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
        `${project.arrangement.length} blocks`,
        barCountLabel(arrangementTotalBars(project)),
        `song form ${quickActionSongFormPriorityPosture(summary)}`,
        `next ${priority.nextCheckLabel}`
      ].join(" / ")
    };
  }

  const target = summary.segments.find((segment) => segment.index === priority.targetIndex) ?? null;
  if (!target) {
    return null;
  }

  const metric = priority.metricId ? summary.metrics.find((item) => item.id === priority.metricId) ?? null : null;
  const exportAnalysis = analysis ?? analyzeExport(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const muteMapSummary = createArrangementMuteMapSummary(project);
  const transitionSummary = createArrangementTransitionMapSummary(project);
  const detailParts = quickActionSongFormPriorityDetailParts(action);
  const contextLabel = detailParts.join(" / ") || priority.reasonLabel;

  return {
    id: isReadout ? "song-form-overview-readout" : "song-form-priority",
    label: isReadout ? "Song Form Overview Readout" : "Song Form Priority",
    value: [
      isReadout ? "review song form overview" : "open priority song form",
      "destination Arrange panel",
      `metric ${quickActionSongFormPriorityMetricLabel(priority, metric)}`,
      `status ${priority.statusLabel}`,
      `context ${contextLabel}`,
      `target ${quickActionSongFormPriorityTargetLabel(action, priority, target)}`,
      `section ${target.section}`,
      `Pattern ${target.pattern}`,
      quickActionSongFormPriorityBarRangeLabel(target),
      `energy ${Math.round(target.energy * 100)}%`,
      `mutes ${target.mutedLabel}`,
      `${target.eventCount} block events`,
      `selected ${quickActionArrangementSelectedBlockLabel(project, selectedArrangementIndex)}`,
      `edit Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `song form ${quickActionSongFormPriorityPosture(summary)}`,
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `mute map ${quickActionArrangementMuteMapPosture(muteMapSummary)}`,
      `transition map ${quickActionArrangementTransitionMapPosture(transitionSummary)}`,
      `audition ${quickActionSongFormPriorityAudition(priority, target)}`,
      `next ${priority.nextCheckLabel}`
    ].join(" / ")
  };
}

export function quickActionSongFormPriorityDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionSongFormPriorityMetricLabel(
  priority: SongFormPrioritySummary,
  metric: SongFormMetric | null
): string {
  return metric ? `${metric.label}: ${metric.value} / ${metric.detail}` : priority.metricLabel;
}

export function quickActionSongFormPriorityTargetLabel(
  action: QuickAction,
  priority: SongFormPrioritySummary,
  segment: SongFormSegment
): string {
  const titleLabel = action.title.replace(/^(Open Song Form Priority|Review Song Form Overview):\s*/, "").trim();
  return titleLabel && titleLabel !== "Open Song Form Priority" && titleLabel !== "Review Song Form Overview"
    ? titleLabel
    : `${priority.targetLabel} ${segment.section}`;
}

export function quickActionSongFormPriorityBarRangeLabel(segment: SongFormSegment): string {
  const barLabel = segment.startBar === segment.endBar ? `Bar ${segment.startBar}` : `Bars ${segment.startBar}-${segment.endBar}`;
  return `${barLabel} / ${barCountLabel(segment.bars)}`;
}

export function quickActionSongFormPriorityPosture(summary: SongFormOverviewSummary): string {
  const readyCount = summary.metrics.filter((metric) => metric.tone === "good").length;
  const reviewCount = summary.metrics.filter((metric) => metric.tone === "warn").length;
  const blockerCount = summary.metrics.filter((metric) => metric.tone === "danger").length;
  const metricPosture = summary.metrics.map((metric) => `${metric.label} ${metric.value} ${metric.detail}`).join(" / ");
  return `${summary.headline} / ${summary.detail} / ${readyCount}/${summary.metrics.length} ready / ${workflowCountLabel(
    reviewCount,
    "review"
  )} / ${workflowCountLabel(blockerCount, "blocker")} / ${metricPosture}`;
}

export function quickActionSongFormPriorityAudition(
  priority: SongFormPrioritySummary,
  segment: SongFormSegment
): string {
  return `Play Song or Block loop around ${priority.targetLabel} ${segment.section} Pattern ${segment.pattern} and compare section, energy, and mute posture.`;
}

export function quickActionArrangementMuteMapMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (
    action.id !== "arrangement-mute-map-readout-action" &&
    action.id !== "arrangement-mute-map-focus" &&
    !action.id.startsWith("arrangement-mute-map-lane-")
  ) {
    return null;
  }

  const isReadout = action.id === "arrangement-mute-map-readout-action";
  const summary = createArrangementMuteMapSummary(project);
  const lane = quickActionArrangementMuteMapLane(summary, action);
  if (!lane) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const transitionSummary = createArrangementTransitionMapSummary(project);
  const detailParts = quickActionArrangementMuteMapDetailParts(action);
  const contextLabel = detailParts.join(" / ") || lane.detail;

  return {
    id: isReadout ? "arrangement-mute-map-readout" : "arrangement-mute-map",
    label: isReadout ? "Mute map readout" : "Mute map",
    value: [
      quickActionArrangementMuteMapActionLabel(action),
      "destination Arrange panel",
      `lane ${quickActionArrangementMuteMapLaneLabel(action, lane)}`,
      `status ${lane.status}`,
      `context ${contextLabel}`,
      `focused layer ${lane.label}`,
      `mute posture ${lane.value} / ${lane.detail}`,
      `sections ${quickActionArrangementMuteLaneSectionPosture(summary, lane.id)}`,
      `map ${quickActionArrangementMuteMapPosture(summary)}`,
      `selected ${quickActionArrangementSelectedBlockLabel(project, selectedArrangementIndex)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `transition map ${quickActionArrangementTransitionMapPosture(transitionSummary)}`,
      `metric ${arrangementMuteMapFocusResultMetric(lane, summary)}`,
      `audition ${arrangementMuteMapFocusResultAudition(lane)}`,
      `next ${arrangementMuteMapFocusResultNextCheck(lane)}`
    ].join(" / ")
  };
}

export function quickActionArrangementMuteMapLane(
  summary: ArrangementMuteMapSummary,
  action: QuickAction
): ArrangementMuteMapLane | null {
  if (action.id === "arrangement-mute-map-readout-action" || action.id === "arrangement-mute-map-focus") {
    return activeArrangementMuteMapQuickActionLane(summary);
  }

  const laneId = quickActionArrangementMuteMapLaneId(action.id);
  return laneId ? summary.lanes.find((lane) => lane.id === laneId) ?? null : null;
}

export function quickActionArrangementMuteMapLaneId(actionId: string): ArrangementMuteMapFocusId | null {
  if (!actionId.startsWith("arrangement-mute-map-lane-")) {
    return null;
  }

  const laneId = actionId.slice("arrangement-mute-map-lane-".length);
  return arrangementMuteTrackIds.includes(laneId as ArrangementMuteTrack) ? (laneId as ArrangementMuteMapFocusId) : null;
}

export function quickActionArrangementMuteMapDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionArrangementMuteMapActionLabel(action: QuickAction): string {
  if (action.id === "arrangement-mute-map-readout-action") {
    return "review priority mute map";
  }

  return action.id === "arrangement-mute-map-focus" ? "focus priority mute map" : "focus direct mute map";
}

export function quickActionArrangementMuteMapLaneLabel(action: QuickAction, lane: ArrangementMuteMapLane): string {
  const titleLabel = action.title
    .replace(/^Review Arrangement Mute Map:\s*/, "")
    .replace(/^Focus Arrangement Mute Map:\s*/, "")
    .replace(/^Focus Mute Map:\s*/, "")
    .trim();
  return titleLabel &&
    titleLabel !== "Review Arrangement Mute Map" &&
    titleLabel !== "Focus Arrangement Mute Map" &&
    titleLabel !== "Focus Mute Map"
    ? titleLabel
    : lane.label;
}

export function quickActionArrangementMuteLaneSectionPosture(
  summary: ArrangementMuteMapSummary,
  laneId: ArrangementMuteMapFocusId
): string {
  if (summary.segments.length === 0) {
    return "no arrangement blocks";
  }

  return summary.segments
    .map((segment) => {
      const laneMuted = segment.mutedTracks.includes(laneId);
      const barLabel = segment.startBar === segment.endBar ? `Bar ${segment.startBar}` : `Bars ${segment.startBar}-${segment.endBar}`;
      return `Block ${segment.index + 1} ${segment.section} Pattern ${segment.pattern} ${barLabel} ${laneMuted ? "muted" : "live"}`;
    })
    .join(" / ");
}

export function quickActionArrangementMuteMapPosture(summary: ArrangementMuteMapSummary): string {
  const mappedCount = summary.lanes.filter((lane) => lane.mutedBlocks > 0).length;
  const readyCount = summary.lanes.filter((lane) => lane.tone === "good").length;
  const reviewCount = summary.lanes.filter((lane) => lane.tone === "warn").length;
  const blockerCount = summary.lanes.filter((lane) => lane.tone === "danger").length;
  return `${summary.headline} / ${summary.detail} / ${mappedCount}/${summary.lanes.length} lanes mapped / ${readyCount}/${
    summary.lanes.length
  } ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function quickActionArrangementTransitionMapMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (
    action.id !== "arrangement-transition-map-readout-action" &&
    action.id !== "arrangement-transition-map-focus" &&
    !action.id.startsWith("arrangement-transition-map-transition-")
  ) {
    return null;
  }

  const isReadout = action.id === "arrangement-transition-map-readout-action";
  const summary = createArrangementTransitionMapSummary(project);
  const transition = quickActionArrangementTransitionMapTransition(summary, action);
  if (!transition) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const detailParts = quickActionArrangementTransitionDetailParts(action);
  const contextLabel = detailParts.join(" / ") || transition.detail;

  return {
    id: isReadout ? "arrangement-transition-map-readout" : "arrangement-transition-map",
    label: isReadout ? "Transition map readout" : "Transition map",
    value: [
      quickActionArrangementTransitionMapActionLabel(action),
      "destination Arrange panel",
      `transition ${quickActionArrangementTransitionLaneLabel(action, transition)}`,
      `status ${transition.status}`,
      `context ${contextLabel}`,
      `handoff ${transition.fromSection} -> ${transition.toSection}`,
      `blocks ${transition.fromIndex + 1}->${transition.toIndex + 1}`,
      quickActionArrangementTransitionBlockRangeLabel(project, transition),
      `patterns ${transition.fromPattern}->${transition.toPattern}`,
      transition.energyLabel,
      transition.muteLabel,
      `event density ${transition.detail}`,
      `selected ${quickActionArrangementSelectedBlockLabel(project, selectedArrangementIndex)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `map ${quickActionArrangementTransitionMapPosture(summary)}`,
      `metric ${arrangementTransitionMapFocusResultMetric(transition, summary)}`,
      `audition ${arrangementTransitionMapFocusResultAudition(transition)}`,
      `next ${arrangementTransitionMapFocusResultNextCheck(transition)}`
    ].join(" / ")
  };
}

export function quickActionTransitionLoopMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "transition-loop-cue" && !action.id.startsWith("transition-loop-cue-")) {
    return null;
  }

  const summary = createArrangementTransitionMapSummary(project);
  const transitionId = quickActionArrangementTransitionId(action.id, "transition-loop-cue-");
  const target = createArrangementTransitionLoopTarget(project, summary, transitionId, selectedArrangementIndex);
  if (!target) {
    return null;
  }

  const transition = target.transition;
  const exportAnalysis = analysis ?? analyzeExport(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const detailParts = quickActionArrangementTransitionDetailParts(action);
  const contextLabel = detailParts.join(" / ") || arrangementTransitionLoopDetail(target);

  return {
    id: "transition-loop",
    label: "Transition loop",
    value: [
      quickActionTransitionLoopActionLabel(action),
      "destination Transport / Arrange handoff",
      `transition ${quickActionArrangementTransitionLaneLabel(action, transition)}`,
      `loop ${arrangementTransitionLoopDetail(target)}`,
      `loop scope ${transportLoopStatus(project, "transition", selectedArrangementIndex, target)}`,
      `status ${transition.status}`,
      `context ${contextLabel}`,
      `handoff ${transition.fromSection} -> ${transition.toSection}`,
      `patterns ${transition.fromPattern}->${transition.toPattern}`,
      transition.energyLabel,
      transition.muteLabel,
      `event density ${transition.detail}`,
      `selected ${quickActionArrangementSelectedBlockLabel(project, selectedArrangementIndex)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `map ${quickActionArrangementTransitionMapPosture(summary)}`,
      `audition ${arrangementTransitionMapFocusResultAudition(transition)}`,
      `next ${arrangementTransitionMapFocusResultNextCheck(transition)}`
    ].join(" / ")
  };
}

export function quickActionArrangementTransitionMapTransition(
  summary: ArrangementTransitionMapSummary,
  action: QuickAction
): ArrangementTransitionMapTransition | null {
  if (action.id === "arrangement-transition-map-readout-action" || action.id === "arrangement-transition-map-focus") {
    return activeArrangementTransitionMapQuickActionTransition(summary);
  }

  const transitionId = quickActionArrangementTransitionId(action.id, "arrangement-transition-map-transition-");
  return transitionId === null ? null : summary.transitions.find((transition) => transition.id === transitionId) ?? null;
}

export function quickActionArrangementTransitionId(actionId: string, prefix: string): ArrangementTransitionMapFocusId | null {
  if (!actionId.startsWith(prefix)) {
    return null;
  }

  const transitionId = Number(actionId.slice(prefix.length));
  return Number.isInteger(transitionId) && transitionId >= 0 ? transitionId : null;
}

export function quickActionArrangementTransitionDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionArrangementTransitionMapActionLabel(action: QuickAction): string {
  if (action.id === "arrangement-transition-map-readout-action") {
    return "review priority transition map";
  }

  return action.id === "arrangement-transition-map-focus" ? "focus priority transition map" : "focus direct transition map";
}

export function quickActionTransitionLoopActionLabel(action: QuickAction): string {
  return action.id === "transition-loop-cue" ? "cue priority transition loop" : "cue direct transition loop";
}

export function quickActionArrangementTransitionLaneLabel(
  action: QuickAction,
  transition: ArrangementTransitionMapTransition
): string {
  const titleLabel = action.title
    .replace(/^Review Arrangement Transition Map:\s*/, "")
    .replace(/^Focus Arrangement Transition:\s*/, "")
    .replace(/^Cue Transition Loop:\s*/, "")
    .trim();
  return titleLabel &&
    titleLabel !== "Review Arrangement Transition Map" &&
    titleLabel !== "Focus Arrangement Transition" &&
    titleLabel !== "Cue Transition Loop"
    ? titleLabel
    : transition.value;
}

export function quickActionArrangementTransitionBlockRangeLabel(
  project: ProjectState,
  transition: ArrangementTransitionMapTransition
): string {
  const fromBlock = project.arrangement[transition.fromIndex];
  const toBlock = project.arrangement[transition.toIndex];
  if (!fromBlock || !toBlock) {
    return "bars unavailable";
  }

  const startBar = arrangementStartBar(project, transition.fromIndex) + 1;
  const endBar = arrangementStartBar(project, transition.toIndex) + normalizeArrangementBars(toBlock.bars);
  const bars = normalizeArrangementBars(fromBlock.bars) + normalizeArrangementBars(toBlock.bars);
  return `bars ${startBar}-${endBar} / ${barCountLabel(bars)}`;
}

export function quickActionArrangementSelectedBlockLabel(project: ProjectState, selectedArrangementIndex: number): string {
  const selectedBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0];
  if (!selectedBlock) {
    return "no selected block";
  }

  const selectedIndex = project.arrangement[selectedArrangementIndex] ? selectedArrangementIndex : 0;
  return `Block ${selectedIndex + 1} ${selectedBlock.section} / Pattern ${selectedBlock.pattern} / ${barCountLabel(
    normalizeArrangementBars(selectedBlock.bars)
  )}`;
}

export function quickActionArrangementTransitionMapPosture(summary: ArrangementTransitionMapSummary): string {
  const readyCount = summary.transitions.filter((transition) => transition.tone === "good").length;
  const reviewCount = summary.transitions.filter((transition) => transition.tone === "warn").length;
  const blockerCount = summary.transitions.filter((transition) => transition.tone === "danger").length;
  return `${summary.headline} / ${summary.detail} / ${readyCount}/${summary.transitions.length} ready / ${workflowCountLabel(
    reviewCount,
    "review"
  )} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function quickActionExportPreflightMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const summary = createExportPreflightSummary(
    project,
    createBeatReadinessChecks(project, exportAnalysis),
    exportAnalysis,
    stemAnalyses
  );
  const card = quickActionExportPreflightCard(summary, action);
  if (!card) {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const actionLabel =
    action.id === "export-preflight-focus" ? "focus priority export preflight" : "focus direct export preflight";
  const laneLabel = quickActionExportPreflightLaneLabel(action, card);
  const detailParts = quickActionExportPreflightDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || card.detail;
  const postureLabel = summary.cards.map((item) => `${item.label} ${item.value}`).join(" / ");

  return {
    id: "export-preflight",
    label: "Export preflight",
    value: [
      actionLabel,
      `card ${laneLabel}`,
      `destination ${card.focusLabel} panel`,
      `status ${card.value}`,
      `context ${contextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `delivery ${postureLabel}`,
      `preflight ${summary.headline}`,
      summary.detail,
      ...quickActionExportPreflightDeliveryMetricParts(project, summary, exportAnalysis, stemAnalyses, card),
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project))
    ].join(" / ")
  };
}

export function quickActionExportPreflightDeliveryMetricParts(
  project: ProjectState,
  summary: ExportPreflightSummary,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses,
  card: ExportPreflightCard
): string[] {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const briefStatus = sessionBriefStatus(project.sessionBrief);

  return [
    `target ${target.name}`,
    `target length ${barCountLabel(target.targetBars)}`,
    `wav ${analysis.status} / H ${formatDb(analysis.headroomDb)}`,
    `stems ${audibleStemCount}/${target.stemGoal} target / ${audibleStemCount}/${stemTrackIds.length} audible`,
    `midi ${barCountLabel(bars)}`,
    `brief ${sessionBriefFilledFields(project.sessionBrief)}/4 / ${briefStatus.value}`,
    `sheet ${handoffSheetFileName(project)}`,
    `automation ${masterAutomationQuickActionPosture(project)}`,
    `metric ${exportPreflightFocusResultMetric(summary)}`,
    `next ${exportPreflightFocusResultNextCheck(card)}`
  ];
}

export function quickActionExportPreflightCard(summary: ExportPreflightSummary, action: QuickAction): ExportPreflightCard | null {
  if (action.id === "export-preflight-focus") {
    return activeExportPreflightQuickActionCard(summary);
  }

  const cardId = exportPreflightQuickActionCardId(action.id);
  return cardId ? summary.cards.find((card) => card.id === cardId) ?? null : null;
}

export function exportPreflightQuickActionCardId(actionId: string): ExportPreflightCardId | null {
  if (!actionId.startsWith("export-preflight-card-")) {
    return null;
  }

  const cardId = actionId.slice("export-preflight-card-".length);
  return cardId === "readiness" ||
    cardId === "mix" ||
    cardId === "automation" ||
    cardId === "deliverables" ||
    cardId === "handoff"
    ? cardId
    : null;
}

export function quickActionExportPreflightDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionExportPreflightLaneLabel(action: QuickAction, card: ExportPreflightCard): string {
  const titleLabel = action.title.replace(/^Focus Export Preflight:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Export Preflight" ? titleLabel : card.label;
}

export function quickActionHandoffPackMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-pack") {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const noopExport = (): void => undefined;
  const handoffPackItems = createHandoffPackItems({
    analysis: exportAnalysis,
    project,
    stemAnalyses,
    onExportHandoffSheet: noopExport,
    onExportMidi: noopExport,
    onExportStems: noopExport,
    onExportWav: noopExport
  });
  const readyCount = handoffPackItems.filter((item) => item.tone === "good").length;
  const reviewCount = handoffPackItems.filter((item) => item.tone === "warn").length;
  const blockerCount = handoffPackItems.filter((item) => item.tone === "danger").length;
  const routeTone = weakestTone(handoffPackItems.map((item) => item.tone));
  const routeSummary = createHandoffPackRouteSummary(project, stemAnalyses, handoffPackItems, routeTone);
  const sendOrder = createHandoffPackSendOrderSummary(project, handoffPackItems);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const manifest = createHandoffFileManifest(project, stemAnalyses, handoffPackItems);
  const manifestAudit = createHandoffManifestAudit(project, handoffPackItems, manifest, receipt, sendOrder);
  const formatSummary = createHandoffExportFormatSummary(project, exportAnalysis, stemAnalyses, handoffPackItems);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const itemPosture = handoffPackItems.map((item) => `${item.buttonLabel} ${item.value}`).join(" / ");
  const manifestPosture = manifestAudit.checks.map((check) => `${check.label} ${check.statusLabel}`).join(" / ");
  const formatPosture = formatSummary.metrics.map((metric) => `${metric.label} ${metric.value}`).join(" / ");
  const nextItem = sendOrder.nextItemId
    ? (handoffPackItems.find((item) => item.id === sendOrder.nextItemId) ?? null)
    : null;
  const nextItemLabel = nextItem ? `${nextItem.label} ${nextItem.value} / ${nextItem.detail}` : "All deliverables ready";

  return {
    id: "handoff-pack",
    label: "Handoff Pack",
    value: [
      "review package readout",
      "destination Deliver / Handoff Pack",
      `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
      `route ${routeSummary.routeLabel} / ${routeSummary.statusLabel} / ${routeSummary.detailLabel}`,
      `items ${itemPosture}`,
      `wav ${mixWavFileName(project)} / ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStemCount}/${target.stemGoal} target / ${audibleStemCount}/${stemTrackIds.length} audible / ${stemWavFileNames(
        project
      ).length} files`,
      `midi ${midiFileName(project)} / ${barCountLabel(bars)}`,
      `sheet ${handoffSheetFileName(project)} / brief ${sessionBriefFilledFields(project.sessionBrief)}/4 / ${
        briefStatus.value
      }`,
      `manifest ${manifestAudit.statusLabel} / ${manifestAudit.detailLabel}`,
      `planned ${manifestPosture}`,
      `receipt ${receipt.statusLabel} / ${receipt.fileLabel} / ${receipt.nextLabel}`,
      `format ${formatSummary.statusLabel} / ${formatSummary.titleLabel} / ${formatSummary.durationLabel}`,
      `formats ${formatPosture}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `send ${sendOrder.statusLabel} / ${sendOrder.nextLabel} / ${nextItemLabel}`,
      `sequence ${sendOrder.sequenceLabel}`,
      `checks ${readyCount}/${handoffPackItems.length} ready`,
      workflowCountLabel(reviewCount, "review"),
      workflowCountLabel(blockerCount, "blocker"),
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(bars),
      `next ${sendOrder.nextLabel}`
    ].join(" / ")
  };
}

export function quickActionHandoffExportReceiptMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-export-receipt-focus") {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionHandoffExportReceiptDetailParts(action);
  const statusLabel = detailParts[0] ?? receipt.statusLabel;
  const contextLabel = detailParts.slice(1).join(" / ") || `${receipt.fileLabel} / ${receipt.detailLabel}`;
  const deliverableLabel = receipt.itemId ? handoffExportReceiptItemLabel(receipt.itemId) : "No deliverable";

  return {
    id: "handoff-export-receipt",
    label: "Handoff receipt",
    value: [
      "focus export receipt",
      "destination Deliver panel",
      `status ${statusLabel}`,
      `deliverable ${deliverableLabel}`,
      `file ${receipt.fileLabel}`,
      `context ${contextLabel}`,
      `next ${receipt.nextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} events`,
      patternUseLabel,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project))
    ].join(" / ")
  };
}

export function quickActionHandoffExportReceiptDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function handoffExportReceiptItemLabel(itemId: HandoffPackItem["id"]): string {
  switch (itemId) {
    case "wav":
      return "Mix WAV";
    case "stems":
      return "Stem WAVs";
    case "midi":
      return "Arrangement MIDI";
    case "sheet":
      return "Handoff Sheet";
  }
}

export function quickActionHandoffSendOrderMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-send-order-focus") {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const noopExport = (): void => undefined;
  const handoffPackItems = createHandoffPackItems({
    analysis: exportAnalysis,
    project,
    stemAnalyses,
    onExportHandoffSheet: noopExport,
    onExportMidi: noopExport,
    onExportStems: noopExport,
    onExportWav: noopExport
  });
  const sendOrder = createHandoffPackSendOrderSummary(project, handoffPackItems);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionHandoffSendOrderDetailParts(action);
  const statusLabel = detailParts[0] ?? sendOrder.statusLabel;
  const contextLabel = detailParts.slice(1).join(" / ") || sendOrder.detailLabel;
  const nextItem = sendOrder.nextItemId
    ? (handoffPackItems.find((item) => item.id === sendOrder.nextItemId) ?? null)
    : null;
  const nextLabel = nextItem
    ? `${sendOrder.nextLabel} / ${nextItem.label} ${nextItem.value}`
    : sendOrder.nextLabel;
  const sequencePosture = handoffPackItems.map((item) => `${item.buttonLabel} ${item.value}`).join(" -> ");
  const readyCount = handoffPackItems.filter((item) => item.tone === "good").length;
  const reviewCount = handoffPackItems.filter((item) => item.tone === "warn").length;
  const blockerCount = handoffPackItems.filter((item) => item.tone === "danger").length;
  const receiptLabel = receipt.itemId ? receipt.statusLabel : "No receipt yet";

  return {
    id: "handoff-send-order",
    label: "Handoff send order",
    value: [
      "focus send order",
      "destination Deliver panel",
      `next ${nextLabel}`,
      `status ${statusLabel}`,
      `context ${contextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} events`,
      patternUseLabel,
      `sequence ${sendOrder.sequenceLabel}`,
      `posture ${sequencePosture}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `receipt ${receiptLabel}`,
      `file ${receipt.fileLabel}`,
      `checks ${readyCount}/${handoffPackItems.length} ready`,
      workflowCountLabel(reviewCount, "review"),
      workflowCountLabel(blockerCount, "blocker"),
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project))
    ].join(" / ")
  };
}

export function quickActionHandoffSendOrderDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionHandoffManifestAuditMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-manifest-audit-focus") {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const noopExport = (): void => undefined;
  const handoffPackItems = createHandoffPackItems({
    analysis: exportAnalysis,
    project,
    stemAnalyses,
    onExportHandoffSheet: noopExport,
    onExportMidi: noopExport,
    onExportStems: noopExport,
    onExportWav: noopExport
  });
  const sendOrder = createHandoffPackSendOrderSummary(project, handoffPackItems);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const manifest = createHandoffFileManifest(project, stemAnalyses, handoffPackItems);
  const summary = createHandoffManifestAudit(project, handoffPackItems, manifest, receipt, sendOrder);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionHandoffManifestAuditDetailParts(action);
  const contextLabel = detailParts[0] ?? summary.detailLabel;
  const receiptLabel = detailParts[1] ?? summary.receiptLabel;
  const nextLabel = detailParts[2] ?? summary.nextLabel;
  const manifestPosture = summary.checks.map((check) => `${check.label} ${check.statusLabel}`).join(" / ");
  const readyCount = summary.checks.filter((check) => check.tone === "good").length;
  const reviewCount = summary.checks.filter((check) => check.tone === "warn").length;
  const blockerCount = summary.checks.filter((check) => check.tone === "danger").length;

  return {
    id: "handoff-manifest-audit",
    label: "Handoff manifest",
    value: [
      "focus manifest audit",
      "destination Deliver panel",
      `status ${summary.statusLabel}`,
      `context ${contextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} events`,
      patternUseLabel,
      `manifest ${manifestPosture}`,
      `receipt ${receiptLabel}`,
      `file ${receipt.fileLabel}`,
      `next ${nextLabel}`,
      `checks ${readyCount}/${summary.checks.length} clear`,
      workflowCountLabel(reviewCount, "review"),
      workflowCountLabel(blockerCount, "blocker"),
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project))
    ].join(" / ")
  };
}

export function quickActionHandoffManifestAuditDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionHandoffExportFormatMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const noopExport = (): void => undefined;
  const handoffPackItems = createHandoffPackItems({
    analysis: exportAnalysis,
    project,
    stemAnalyses,
    onExportHandoffSheet: noopExport,
    onExportMidi: noopExport,
    onExportStems: noopExport,
    onExportWav: noopExport
  });
  const summary = createHandoffExportFormatSummary(project, exportAnalysis, stemAnalyses, handoffPackItems);
  const metric = quickActionHandoffExportFormatMetric(summary, action);
  if (!metric) {
    return null;
  }

  const result = createHandoffExportFormatFocusResult(metric, summary);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const actionLabel =
    action.id === "handoff-export-format-focus" ? "focus priority export format" : "focus direct export format";
  const laneLabel = quickActionHandoffExportFormatLaneLabel(action, metric);
  const detailParts = quickActionHandoffExportFormatDetailParts(action);
  const statusLabel = detailParts[0] ?? metric.value;
  const contextLabel = detailParts.slice(1).join(" / ") || metric.detail;
  const postureLabel = summary.metrics.map((item) => `${item.label} ${item.value}`).join(" / ");

  return {
    id: "handoff-export-format",
    label: "Export format",
    value: `${actionLabel} / metric ${laneLabel} / destination ${result.destination} / status ${statusLabel} / context ${contextLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${patternUseLabel} / formats ${postureLabel} / handoff ${
      summary.statusLabel
    } / ${summary.detailLabel} / metric ${result.metricValue} / ${
      project.arrangement.length
    } blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionHandoffExportFormatMetric(
  summary: HandoffExportFormatSummary,
  action: QuickAction
): HandoffExportFormatMetric | null {
  if (action.id === "handoff-export-format-focus") {
    return handoffExportFormatFocusMetric(summary);
  }

  const metricId = handoffExportFormatQuickActionMetricId(action.id);
  return metricId ? summary.metrics.find((metric) => metric.id === metricId) ?? null : null;
}

export function handoffExportFormatQuickActionMetricId(actionId: string): HandoffExportFormatFocusId | null {
  if (!actionId.startsWith("handoff-export-format-")) {
    return null;
  }

  const metricId = actionId.slice("handoff-export-format-".length);
  return metricId === "wav" || metricId === "stems" || metricId === "midi" || metricId === "sheet" ? metricId : null;
}

export function quickActionHandoffExportFormatDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionHandoffExportFormatLaneLabel(action: QuickAction, metric: HandoffExportFormatMetric): string {
  const titleLabel = action.title.replace(/^Focus Export Format:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Export Format" ? titleLabel : metric.label;
}

export function quickActionTransportPositionMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "transport-position-readout-action") {
    return null;
  }

  const selectedBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0] ?? null;
  const blockLabel = selectedBlock
    ? `Block ${Math.min(selectedArrangementIndex + 1, project.arrangement.length)} ${selectedBlock.section} / Pattern ${
        selectedBlock.pattern
      } / ${barCountLabel(selectedBlock.bars)}`
    : "No selected block";
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionTransportPositionDetailParts(action);
  const statusLabel = detailParts[0] ?? "Transport position";
  const fallbackRoleLabel = action.title.replace(/^Review Transport Position:\s*/, "").trim() || "Bar/Beat/Step";
  const roleLabel = detailParts[1] ?? fallbackRoleLabel;
  const detailLabel = detailParts[2] ?? "Current playback or cued position";
  const loopLabel = detailParts[3]?.replace(/\s+loop$/, "") || "current loop";

  return {
    id: "transport-position-readout",
    label: "Transport Position",
    value: [
      "review transport position",
      statusLabel,
      roleLabel,
      detailLabel,
      `loop ${loopLabel}`,
      `selected ${blockLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(activePattern(project))} editable events`,
      patternUseLabel,
      `${project.bpm} BPM`,
      project.metronomeEnabled ? "metronome on" : "metronome off",
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function quickActionTransportPositionDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionLoopScopeMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "loop-scope") {
    return null;
  }

  const selectedBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0] ?? null;
  const blockLabel = selectedBlock
    ? `Block ${Math.min(selectedArrangementIndex + 1, project.arrangement.length)} ${selectedBlock.section} / Pattern ${
        selectedBlock.pattern
      } / ${barCountLabel(selectedBlock.bars)}`
    : "No selected block";
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionLoopScopeDetailParts(action);
  const loopContext = detailParts[0] ?? action.detail;
  const scopeLabel = action.title.replace(/^Review Loop Scope:\s*/, "").trim() || "Loop";

  return {
    id: "loop-scope",
    label: "Loop Scope",
    value: [
      "review transport loop",
      `scope ${scopeLabel}`,
      `context ${loopContext}`,
      `selected ${blockLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(activePattern(project))} editable events`,
      patternUseLabel,
      `${project.bpm} BPM`,
      project.metronomeEnabled ? "metronome on" : "metronome off",
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function quickActionLoopScopeDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionMetronomeReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "metronome-readout") {
    return null;
  }

  const selectedBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0] ?? null;
  const blockLabel = selectedBlock
    ? `Block ${Math.min(selectedArrangementIndex + 1, project.arrangement.length)} ${selectedBlock.section} / Pattern ${
        selectedBlock.pattern
      } / ${barCountLabel(selectedBlock.bars)}`
    : "No selected block";
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionMetronomeReadoutDetailParts(action);
  const clickLabel = project.metronomeEnabled ? "click on" : "click off";
  const loopLabel = detailParts[2]?.replace(/\s+loop$/, "") || "current loop";

  return {
    id: "metronome-readout",
    label: "Metronome",
    value: [
      "review timing grid",
      clickLabel,
      `${project.bpm} BPM`,
      `loop ${loopLabel}`,
      `selected ${blockLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(activePattern(project))} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "realtime click only",
      "exports stay clean",
      "playback unchanged"
    ].join(" / ")
  };
}

export function quickActionMetronomeReadoutDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionTapTempoReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "tap-tempo-readout-action") {
    return null;
  }

  const selectedBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0] ?? null;
  const blockLabel = selectedBlock
    ? `Block ${Math.min(selectedArrangementIndex + 1, project.arrangement.length)} ${selectedBlock.section} / Pattern ${
        selectedBlock.pattern
      } / ${barCountLabel(selectedBlock.bars)}`
    : "No selected block";
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionTapTempoReadoutDetailParts(action);
  const statusLabel = detailParts[0] ?? "Tap BPM";
  const fallbackRoleLabel = action.title.replace(/^Review Tap Tempo:\s*/, "").trim() || `${project.bpm} BPM`;
  const roleLabel = detailParts[1] ?? fallbackRoleLabel;
  const detailLabel = detailParts[2] ?? "Tap tempo posture";
  const loopLabel = detailParts[3]?.replace(/\s+loop$/, "") || "current loop";

  return {
    id: "tap-tempo-readout",
    label: "Tap Tempo",
    value: [
      "review tap tempo",
      statusLabel,
      roleLabel,
      detailLabel,
      `loop ${loopLabel}`,
      `${project.bpm} BPM`,
      project.metronomeEnabled ? "metronome on" : "metronome off",
      `selected ${blockLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(activePattern(project))} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "tap history unchanged",
      "tempo unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function quickActionTapTempoReadoutDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionTempoNudgeReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "tempo-nudge-readout-action") {
    return null;
  }

  const selectedBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0] ?? null;
  const blockLabel = selectedBlock
    ? `Block ${Math.min(selectedArrangementIndex + 1, project.arrangement.length)} ${selectedBlock.section} / Pattern ${
        selectedBlock.pattern
      } / ${barCountLabel(selectedBlock.bars)}`
    : "No selected block";
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;

  return {
    id: "tempo-nudge-readout",
    label: "Tempo Nudge",
    value: [
      "review tempo nudge",
      `${project.bpm} BPM current`,
      tempoNudgeRouteSummary(project.bpm),
      `loop ${transportLoopLabelFromActionDetail(action.detail)}`,
      project.metronomeEnabled ? "metronome on" : "metronome off",
      `selected ${blockLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(activePattern(project))} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "tap history unchanged",
      "tempo unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function tempoNudgeRouteSummary(bpm: number): string {
  return tempoNudgePads.map((pad) => `${pad.label} ${tempoNudgePadBpm(bpm, pad.id)} BPM`).join(" / ");
}

export function transportLoopLabelFromActionDetail(detail: string): string {
  const loopPart = detail
    .split(" / ")
    .map((part) => part.trim())
    .find((part) => part.endsWith(" loop"));
  return loopPart?.replace(/\s+loop$/, "") || "current";
}

export function quickActionSwingFeelReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "swing-feel-readout-action") {
    return null;
  }

  const selectedBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0] ?? null;
  const blockLabel = selectedBlock
    ? `Block ${Math.min(selectedArrangementIndex + 1, project.arrangement.length)} ${selectedBlock.section} / Pattern ${
        selectedBlock.pattern
      } / ${barCountLabel(selectedBlock.bars)}`
    : "No selected block";
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const style = getStyle(project);

  return {
    id: "swing-feel-readout",
    label: "Swing Feel",
    value: [
      "review swing feel",
      `${percentLabel(normalizeSwingFeelValue(project.swing))} current`,
      `${style.name} default ${percentLabel(normalizeSwingFeelValue(style.defaultSwing))}`,
      swingFeelRouteSummary(project),
      `loop ${transportLoopLabelFromActionDetail(action.detail)}`,
      project.metronomeEnabled ? "metronome on" : "metronome off",
      `selected ${blockLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(activePattern(project))} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "swing unchanged",
      "project data unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function swingFeelRouteSummary(project: ProjectState): string {
  return swingFeelPads.map((pad) => `${pad.label} ${percentLabel(swingFeelPadSwing(pad, project))}`).join(" / ");
}

export function quickActionKeyRetargetReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "key-retarget-readout-action") {
    return null;
  }

  const selectedBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0] ?? null;
  const blockLabel = selectedBlock
    ? `Block ${Math.min(selectedArrangementIndex + 1, project.arrangement.length)} ${selectedBlock.section} / Pattern ${
        selectedBlock.pattern
      } / ${barCountLabel(selectedBlock.bars)}`
    : "No selected block";
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;

  return {
    id: "key-retarget-readout",
    label: "Key Retarget",
    value: [
      "review key retarget",
      `current key ${project.key}`,
      keyRetargetOptionSummary(project.key),
      keyRetargetPatternSummary(project),
      `${keyRetargetableProjectEventTotal(project)} retargetable note/chord events`,
      `selected ${blockLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(activePattern(project))} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "key unchanged",
      "Pattern A/B/C unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function keyRetargetOptionSummary(currentKey: string): string {
  const targets = keys.filter((key) => key !== currentKey);
  return `${keys.length} key options / ${targets.length} targets: ${targets.join(", ")}`;
}

export function keyRetargetPatternSummary(project: ProjectState): string {
  return patternSlots.map((slot) => `Pattern ${slot} ${keyRetargetablePatternEventTotal(project.patterns[slot])}`).join(" / ");
}

export function keyRetargetableProjectEventTotal(project: ProjectState): number {
  return patternSlots.reduce((total, slot) => total + keyRetargetablePatternEventTotal(project.patterns[slot]), 0);
}

export function keyRetargetablePatternEventTotal(pattern: ProjectState["patterns"][PatternSlot]): number {
  return pattern.bassNotes.length + pattern.melodyNotes.length + pattern.chordEvents.length;
}

export function quickActionStyleDirectionReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "style-direction-readout-action") {
    return null;
  }

  const profile = getStyle(project);
  const summary = createStyleInspectorSummary(project, profile, createPatternCompareSummaries(project));
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const loopLabel =
    quickActionStyleDirectionReadoutDetailParts(action).find((part) => part.startsWith("loop ")) ?? "loop current";

  return {
    id: "style-direction-readout",
    label: "Style Direction",
    value: [
      "review style direction",
      styleDirectionCurrentSummary(project),
      styleDirectionTargetSummary(project.styleId),
      `roles ${bassStyleRoleLabel(profile.bassStyle)} / ${melodyStyleRoleLabel(profile.melodyStyle)}`,
      `sound ${soundPresetLabel(styleSoundPreset(profile.id))}`,
      `goals ${quickActionStyleInspectorGoalPosture(summary)}`,
      `density ${quickActionStyleInspectorDensityPosture(summary)}`,
      loopLabel,
      project.metronomeEnabled ? "metronome on" : "metronome off",
      `selected ${quickActionArrangementSelectedBlockLabel(project, selectedArrangementIndex)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(activePattern(project))} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "style unchanged",
      "BPM/swing unchanged",
      "Pattern A/B/C unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function quickActionStyleDirectionReadoutDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function styleDirectionCurrentSummary(project: ProjectState): string {
  const profile = getStyle(project);
  return `${profile.name} current / ${project.bpm} BPM active / ${profile.bpmRange[0]}-${profile.bpmRange[1]} BPM range / ${percentLabel(
    project.swing
  )} swing active / ${percentLabel(profile.defaultSwing)} default`;
}

export function styleDirectionTargetSummary(currentStyleId: StyleId): string {
  const targets = styleProfiles.filter((profile) => profile.id !== currentStyleId);
  return `${styleProfiles.length} style options / ${targets.length} targets: ${targets.map((profile) => profile.name).join(", ")}`;
}

export function styleDirectionPatternSummary(project: ProjectState): string {
  return patternSlots.map((slot) => `Pattern ${slot} ${patternEventTotal(project.patterns[slot])}`).join(" / ");
}

export const GUIDE_QUICK_START_DETAIL_LABEL_PREFIXES = [
  "Destination ",
  "Metric ",
  "Context ",
  "Audition ",
  "Next ",
  "Breakdown ",
  "Bottleneck "
] as const;

export function quickActionGuideQuickStartMetricSnapshot(action: QuickAction): { id: string; label: string; value: string } | null {
  if (action.id !== "guide-quick-start" && action.id !== "guide-bottleneck-focus") {
    return null;
  }

  const parts = quickActionGuideQuickStartDetailParts(action);
  if (parts.length === 0) {
    return {
      id: action.id,
      label: action.id === "guide-bottleneck-focus" ? "Guide bottleneck" : "Guide quick start",
      value: action.detail
    };
  }

  const routeLabel = quickActionGuideQuickStartRouteLabel(parts);
  const destinationLabel = quickActionGuideQuickStartDetailSegment(parts, "Destination ", "Destination unavailable");
  const metricLabel = quickActionGuideQuickStartDetailSegment(parts, "Metric ", "Metric unavailable");
  const contextLabel = quickActionGuideQuickStartDetailSegment(parts, "Context ", "Context unavailable");
  const auditionLabel = quickActionGuideQuickStartDetailSegment(parts, "Audition ", "Audition unavailable");
  const nextCheckLabel = quickActionGuideQuickStartDetailSegment(parts, "Next ", "Next unavailable");
  const breakdownLabel = quickActionGuideQuickStartDetailSegment(parts, "Breakdown ", "Breakdown unavailable");
  const bottleneckLabel = quickActionGuideQuickStartDetailSegment(parts, "Bottleneck ", "Bottleneck unavailable");
  const actionLabel = action.id === "guide-bottleneck-focus" ? "focus guide bottleneck" : "run guide quick start";
  const targetLabel = quickActionGuideQuickStartTargetLabel(action);

  return {
    id: action.id,
    label: action.id === "guide-bottleneck-focus" ? "Guide bottleneck" : "Guide quick start",
    value: `${actionLabel} / target ${targetLabel} / route ${routeLabel} / ${destinationLabel} / ${metricLabel} / ${contextLabel} / ${auditionLabel} / ${nextCheckLabel} / ${breakdownLabel} / ${bottleneckLabel}`
  };
}

export function quickActionGuideQuickStartDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionGuideQuickStartRouteLabel(parts: string[]): string {
  const firstLabeledIndex = parts.findIndex((part) =>
    GUIDE_QUICK_START_DETAIL_LABEL_PREFIXES.some((prefix) => part.startsWith(prefix))
  );
  if (firstLabeledIndex <= 0) {
    return parts[0] ?? "Guide";
  }
  return parts.slice(0, firstLabeledIndex).join(" / ");
}

export function quickActionGuideQuickStartDetailSegment(parts: string[], prefix: string, fallback: string): string {
  const start = parts.findIndex((part) => part.startsWith(prefix));
  if (start === -1) {
    return fallback;
  }
  const end = parts.findIndex(
    (part, index) =>
      index > start && GUIDE_QUICK_START_DETAIL_LABEL_PREFIXES.some((labelPrefix) => part.startsWith(labelPrefix))
  );
  return parts.slice(start, end === -1 ? parts.length : end).join(" / ");
}

export function quickActionGuideQuickStartTargetLabel(action: QuickAction): string {
  const label = action.title.replace(/^Guide Quick Start:\s*/, "").replace(/^Guide Bottleneck Focus:\s*/, "").trim();
  return label || "target unavailable";
}

export const SESSION_PASS_DETAIL_LABEL_PREFIXES = ["Destination ", "Session ", "Context ", "Audition ", "Next "] as const;

export function quickActionSessionPassMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "session-pass-focus" && !action.id.startsWith("session-pass-card-")) {
    return null;
  }

  const parts = quickActionSessionPassDetailParts(action);
  const passLabel = quickActionSessionPassLabel(action);
  const routeLabel = quickActionSessionPassRouteLabel(parts);
  const destinationLabel = quickActionSessionPassDetailSegment(parts, "Destination ", "Destination unavailable");
  const sessionLabel = quickActionSessionPassDetailSegment(parts, "Session ", parts[0] ?? `${modeLabel(project.mode)} mode`);
  const contextLabel = quickActionSessionPassDetailSegment(parts, "Context ", "Context unavailable");
  const auditionLabel = quickActionSessionPassDetailSegment(parts, "Audition ", "Audition unavailable");
  const nextCheckLabel = quickActionSessionPassDetailSegment(parts, "Next ", "Next unavailable");
  const actionLabel = action.id === "session-pass-focus" ? "focus active session pass" : "focus direct session pass";

  return {
    id: "session-pass",
    label: "Session pass",
    value: `${actionLabel} / pass ${passLabel} / route ${routeLabel} / ${destinationLabel} / ${sessionLabel} / ${contextLabel} / ${auditionLabel} / ${nextCheckLabel} / mode ${modeLabel(
      project.mode
    )} / Pattern ${project.selectedPattern} / ${projectEventTotal(project)} events / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionSessionPassDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionSessionPassRouteLabel(parts: string[]): string {
  const firstLabeledIndex = parts.findIndex((part) =>
    SESSION_PASS_DETAIL_LABEL_PREFIXES.some((prefix) => part.startsWith(prefix))
  );
  if (firstLabeledIndex <= 0) {
    return parts[0] ?? "Session Pass";
  }
  return parts.slice(0, firstLabeledIndex).join(" / ");
}

export function quickActionSessionPassDetailSegment(parts: string[], prefix: string, fallback: string): string {
  const start = parts.findIndex((part) => part.startsWith(prefix));
  if (start === -1) {
    return fallback;
  }
  const end = parts.findIndex(
    (part, index) => index > start && SESSION_PASS_DETAIL_LABEL_PREFIXES.some((labelPrefix) => part.startsWith(labelPrefix))
  );
  return parts.slice(start, end === -1 ? parts.length : end).join(" / ");
}

export function quickActionSessionPassLabel(action: QuickAction): string {
  const directId = action.id.startsWith("session-pass-card-") ? action.id.slice("session-pass-card-".length) : "";
  const directLabel = directId ? sessionPassLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title.replace(/^Focus Session Pass:\s*/, "").replace(/^Focus\s*/, "").trim();
  return directLabel || titleLabel || "pass unavailable";
}

export function sessionPassLabelFromQuickActionId(id: string): string {
  switch (id) {
    case "guided":
      return "Guided pass";
    case "studio":
      return "Studio pass";
    case "finish":
      return "Finish pass";
    case "deliver":
      return "Delivery pass";
    default:
      return "";
  }
}

export function quickActionFirstBeatPathMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "first-beat-path-jump" && !action.id.startsWith("first-beat-path-step-")) {
    return null;
  }

  const parts = quickActionFirstBeatPathDetailParts(action);
  const stage = quickActionFirstBeatPathStage(action);
  const pathContext = parts[0] ?? "path context unavailable";
  const stageDetail = parts[1] ?? "stage detail unavailable";
  const pathMetric = parts[2] ?? "path metric unavailable";
  const destinationContext = parts[3] ?? `Destination ${stage.destination}`;
  const auditionContext = parts[4] ?? "Audition context unavailable";
  const nextContext = parts[5] ?? "Next check unavailable";
  const actionLabel = action.id === "first-beat-path-jump" ? "jump current path step" : "jump direct path step";

  return {
    id: "first-beat-path",
    label: "First Beat Path",
    value: `${actionLabel} / stage ${stage.label} / destination ${stage.destination} / context ${pathContext} / detail ${stageDetail} / path ${pathMetric} / command detail ${destinationContext} / ${auditionContext} / ${nextContext} / mode ${modeLabel(
      project.mode
    )} / Pattern ${project.selectedPattern} / ${projectEventTotal(project)} events / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function firstBeatPathCommandDetail(step: FirstBeatPathStep, summary: FirstBeatPathSummary): string {
  return [
    step.value,
    step.detail,
    summary.countLabel,
    `Destination ${step.jumpLabel}`,
    `Audition ${firstBeatPathJumpAuditionCue(step)}`,
    `Next ${firstBeatPathJumpNextCheck(step, summary)}`
  ].join(" / ");
}

export function quickActionFirstBeatPathDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionFirstBeatPathStage(action: QuickAction): { label: string; destination: string } {
  const directId = action.id.startsWith("first-beat-path-step-") ? action.id.slice("first-beat-path-step-".length) : "";
  const titleLabel = action.title.replace(/^Jump First Beat Path:\s*/, "").trim();
  const label = firstBeatPathStageLabelFromQuickActionValue(directId) || titleLabel || "stage unavailable";
  return {
    label,
    destination: firstBeatPathStageDestination(label)
  };
}

export function firstBeatPathStageLabelFromQuickActionValue(value: string): string {
  switch (value) {
    case "setup":
      return "Setup";
    case "compose":
      return "Compose";
    case "arrange":
      return "Arrange";
    case "mix":
      return "Mix";
    case "deliver":
      return "Deliver";
    default:
      return "";
  }
}

export function firstBeatPathStageDestination(label: string): string {
  switch (label.toLowerCase()) {
    case "setup":
      return "Transport";
    case "compose":
      return "Compose";
    case "arrange":
      return "Arrange";
    case "mix":
      return "Mix";
    case "deliver":
      return "Deliver";
    default:
      return "destination unavailable";
  }
}

export const MODE_FOCUS_DETAIL_LABEL_PREFIXES = ["Destination ", "Mode ", "Context ", "Audition ", "Next "] as const;

export function quickActionModeFocusMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "mode-focus-jump" && !action.id.startsWith("mode-focus-card-")) {
    return null;
  }

  const parts = quickActionModeFocusDetailParts(action);
  const cardLabel = quickActionModeFocusCardLabel(action);
  const routeLabel = quickActionModeFocusRouteLabel(parts);
  const destinationLabel = quickActionModeFocusDetailSegment(parts, "Destination ", "Destination unavailable");
  const modeMetricLabel = quickActionModeFocusDetailSegment(parts, "Mode ", `Mode ${modeLabel(project.mode)}`);
  const contextLabel = quickActionModeFocusDetailSegment(parts, "Context ", "Context unavailable");
  const auditionLabel = quickActionModeFocusDetailSegment(parts, "Audition ", "Audition unavailable");
  const nextCheckLabel = quickActionModeFocusDetailSegment(parts, "Next ", "Next unavailable");
  const actionLabel = action.id === "mode-focus-jump" ? "jump active mode focus" : "jump direct mode focus";

  return {
    id: "mode-focus",
    label: "Mode focus",
    value: `${actionLabel} / card ${cardLabel} / route ${routeLabel} / ${destinationLabel} / ${modeMetricLabel} / ${contextLabel} / ${auditionLabel} / ${nextCheckLabel} / mode ${modeLabel(
      project.mode
    )} / Pattern ${project.selectedPattern} / ${projectEventTotal(project)} events / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionModeFocusDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionModeFocusRouteLabel(parts: string[]): string {
  const firstLabeledIndex = parts.findIndex((part) => MODE_FOCUS_DETAIL_LABEL_PREFIXES.some((prefix) => part.startsWith(prefix)));
  if (firstLabeledIndex <= 0) {
    return parts[0] ?? "Mode Focus";
  }
  return parts.slice(0, firstLabeledIndex).join(" / ");
}

export function quickActionModeFocusDetailSegment(parts: string[], prefix: string, fallback: string): string {
  const start = parts.findIndex((part) => part.startsWith(prefix));
  if (start === -1) {
    return fallback;
  }
  const end = parts.findIndex(
    (part, index) => index > start && MODE_FOCUS_DETAIL_LABEL_PREFIXES.some((labelPrefix) => part.startsWith(labelPrefix))
  );
  return parts.slice(start, end === -1 ? parts.length : end).join(" / ");
}

export function quickActionModeFocusCardLabel(action: QuickAction): string {
  const directId = action.id.startsWith("mode-focus-card-") ? action.id.slice("mode-focus-card-".length) : "";
  const directLabel = directId ? modeFocusCardLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title.replace(/^Jump Mode Focus:\s*/, "").trim();
  return directLabel || titleLabel || "orientation unavailable";
}

export function modeFocusCardLabelFromQuickActionId(id: string): string {
  switch (id) {
    case "stage":
      return "Current stage";
    case "focus":
      return "Writing focus";
    case "check":
      return "Local check";
    case "session":
      return "Session scan";
    case "issue":
      return "Issue";
    case "handoff":
      return "Handoff";
    default:
      return "";
  }
}

export const BEAT_SPINE_DETAIL_LABEL_PREFIXES = ["Destination ", "Beat core ", "Card ", "Scope ", "Audition ", "Next "] as const;

export function quickActionBeatSpineMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const isJump = action.id === "beat-spine-jump" || action.id.startsWith("beat-spine-card-jump-");
  const isApply = action.id === "beat-spine-apply" || action.id.startsWith("beat-spine-card-apply-");
  if (!isJump && !isApply) {
    return null;
  }

  const parts = quickActionBeatSpineDetailParts(action);
  const cardLabel = quickActionBeatSpineCardLabel(action);
  const actionLabel =
    action.id === "beat-spine-jump"
      ? "jump current beat spine"
      : action.id.startsWith("beat-spine-card-jump-")
        ? "jump direct beat spine"
        : action.id === "beat-spine-apply"
          ? "apply current beat spine"
          : "apply direct beat spine";

  const projectContext = `mode ${modeLabel(project.mode)} / Pattern ${project.selectedPattern} / ${projectEventTotal(
    project
  )} events / ${barCountLabel(arrangementTotalBars(project))}`;

  if (isJump) {
    const routeLabel = quickActionBeatSpineRouteLabel(parts);
    const destinationLabel =
      quickActionBeatSpineDetailSegment(parts, "Destination ", "") || beatSpineDestinationLabelFromCardLabel(cardLabel);
    const metricLabel = quickActionBeatSpineDetailSegment(parts, "Beat core ", "Beat core unavailable");
    const auditionLabel = quickActionBeatSpineDetailSegment(parts, "Audition ", "Audition unavailable");
    const nextCheckLabel = quickActionBeatSpineDetailSegment(parts, "Next ", "Next unavailable");
    return {
      id: "beat-spine",
      label: "Beat spine",
      value: `${actionLabel} / card ${cardLabel} / route ${routeLabel} / ${destinationLabel} / ${metricLabel} / ${auditionLabel} / ${nextCheckLabel} / ${projectContext}`
    };
  }

  const moveLabel = quickActionBeatSpineRouteLabel(parts);
  const targetCardLabel = quickActionBeatSpineDetailSegment(parts, "Card ", `Card ${cardLabel}`);
  const metricLabel = quickActionBeatSpineDetailSegment(parts, "Beat core ", "Beat core unavailable");
  const scopeLabel = quickActionBeatSpineDetailSegment(parts, "Scope ", "Scope unavailable");
  const auditionLabel = quickActionBeatSpineDetailSegment(parts, "Audition ", "Audition unavailable");
  const nextCheckLabel = quickActionBeatSpineDetailSegment(parts, "Next ", "Next unavailable");
  return {
    id: "beat-spine",
    label: "Beat spine",
    value: `${actionLabel} / card ${cardLabel} / move ${moveLabel} / ${targetCardLabel} / ${metricLabel} / ${scopeLabel} / ${auditionLabel} / ${nextCheckLabel} / ${projectContext}`
  };
}

export function quickActionBeatSpineDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionBeatSpineRouteLabel(parts: string[]): string {
  const firstLabeledIndex = parts.findIndex((part) =>
    BEAT_SPINE_DETAIL_LABEL_PREFIXES.some((prefix) => part.startsWith(prefix))
  );
  if (firstLabeledIndex <= 0) {
    return parts[0] ?? "Beat Spine";
  }
  return parts.slice(0, firstLabeledIndex).join(" / ");
}

export function quickActionBeatSpineDetailSegment(parts: string[], prefix: string, fallback: string): string {
  const start = parts.findIndex((part) => part.startsWith(prefix));
  if (start === -1) {
    return fallback;
  }
  const end = parts.findIndex(
    (part, index) => index > start && BEAT_SPINE_DETAIL_LABEL_PREFIXES.some((labelPrefix) => part.startsWith(labelPrefix))
  );
  return parts.slice(start, end === -1 ? parts.length : end).join(" / ");
}

export function quickActionBeatSpineCardLabel(action: QuickAction): string {
  const jumpId = action.id.startsWith("beat-spine-card-jump-") ? action.id.slice("beat-spine-card-jump-".length) : "";
  const applyId = action.id.startsWith("beat-spine-card-apply-") ? action.id.slice("beat-spine-card-apply-".length) : "";
  const directLabel = beatSpineCardLabelFromQuickActionId(jumpId || applyId);
  const titleLabel = action.title
    .replace(/^Jump Beat Spine:\s*/, "")
    .replace(/^Apply Beat Spine:\s*/, "")
    .replace(/\s*Beat Spine apply unavailable$/, "")
    .trim();
  return directLabel || titleLabel || "core card unavailable";
}

export function beatSpineCardLabelFromQuickActionId(id: string): string {
  switch (id) {
    case "setup":
      return "Setup";
    case "drums":
      return "Drums";
    case "bass":
      return "808 / Bass";
    case "harmony":
      return "Harmony";
    case "melody":
      return "Melody";
    case "sound":
      return "Sound";
    case "arrange":
      return "Arrange";
    case "finish":
      return "Finish";
    default:
      return "";
  }
}

export function beatSpineDestinationLabelFromCardLabel(label: string): string {
  switch (label.toLowerCase()) {
    case "setup":
      return "Transport";
    case "drums":
    case "808 / bass":
    case "harmony":
    case "melody":
      return "Compose";
    case "sound":
      return "Sound";
    case "arrange":
      return "Arrange";
    case "finish":
      return "Master or Deliver";
    default:
      return "destination unavailable";
  }
}

export function quickActionComposerGuideMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "composer-guide-focus" && !action.id.startsWith("composer-guide-card-")) {
    return null;
  }

  const parts = quickActionComposerGuideDetailParts(action);
  const laneLabel = quickActionComposerGuideLaneLabel(action);
  const statusLabel = parts[0] ?? "guide status unavailable";
  const destinationLabel = parts[1] ?? composerGuideDestinationLabelFromLane(laneLabel);
  const metricLabel = parts[2] ?? "guide metric unavailable";
  const auditionLabel = parts[3] ?? "audition unavailable";
  const nextCheckLabel = parts[4] ?? "next check unavailable";
  const detailLabel = parts.slice(5).join(" / ") || "current writing lane";
  const actionLabel = action.id === "composer-guide-focus" ? "focus active composer guide" : "focus direct composer guide";

  return {
    id: "composer-guide",
    label: "Composer guide",
    value: `${actionLabel} / lane ${laneLabel} / destination ${destinationLabel} / status ${statusLabel} / metric ${metricLabel} / audition ${auditionLabel} / next ${nextCheckLabel} / detail ${detailLabel} / mode ${modeLabel(
      project.mode
    )} / Pattern ${project.selectedPattern} / ${projectEventTotal(project)} events / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionComposerGuideDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionComposerGuideLaneLabel(action: QuickAction): string {
  const directId = action.id.startsWith("composer-guide-card-") ? action.id.slice("composer-guide-card-".length) : "";
  const directLabel = directId ? composerGuideLaneLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title.replace(/^Focus Composer Guide:\s*/, "").trim();
  return directLabel || titleLabel || "writing lane unavailable";
}

export function composerGuideLaneLabelFromQuickActionId(id: string): string {
  switch (id) {
    case "drums":
      return "Drums";
    case "bass":
      return "808/Bass";
    case "harmony":
      return "Harmony";
    case "melody":
      return "Melody";
    case "arrange":
      return "Arrange";
    case "finish":
      return "Finish";
    default:
      return "";
  }
}

export function composerGuideDestinationLabelFromLane(label: string): string {
  switch (label.toLowerCase()) {
    case "drums":
    case "808/bass":
    case "harmony":
    case "melody":
      return "Compose";
    case "arrange":
      return "Arrange";
    case "finish":
      return "Master";
    default:
      return "destination unavailable";
  }
}

export function quickActionKeyCompassMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "key-compass-focus" && !action.id.startsWith("key-compass-card-")) {
    return null;
  }

  const parts = quickActionKeyCompassDetailParts(action);
  const laneLabel = quickActionKeyCompassLaneLabel(action);
  const keyMetricLabel = parts[0] ?? project.key;
  const destinationLabel = parts[1] ?? "Compose";
  const detailLabel = parts.slice(2).join(" / ") || "current harmony lane";
  const actionLabel = action.id === "key-compass-focus" ? "focus active key compass" : "focus direct key compass";

  return {
    id: "key-compass",
    label: "Key compass",
    value: `${actionLabel} / lane ${laneLabel} / destination ${destinationLabel} / key ${project.key} / metric ${keyMetricLabel} / detail ${detailLabel} / Pattern ${
      project.selectedPattern
    } / ${projectEventTotal(project)} events / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionKeyCompassDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionKeyCompassLaneLabel(action: QuickAction): string {
  const directId = action.id.startsWith("key-compass-card-") ? action.id.slice("key-compass-card-".length) : "";
  const directLabel = directId ? keyCompassLaneLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title.replace(/^Focus Key Compass:\s*/, "").trim();
  return directLabel || titleLabel || "harmony lane unavailable";
}

export function keyCompassLaneLabelFromQuickActionId(id: string): string {
  switch (id) {
    case "scale":
      return "Scale";
    case "chords":
      return "Chords";
    case "cadence":
      return "Cadence";
    case "bass":
      return "808/Bass";
    case "melody":
      return "Melody";
    case "focus":
      return "Selected focus";
    default:
      return "";
  }
}

export function quickActionGrooveCompassMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "groove-compass-focus" && !action.id.startsWith("groove-compass-card-")) {
    return null;
  }

  const pattern = activePattern(project);
  const parts = quickActionGrooveCompassDetailParts(action);
  const laneLabel = quickActionGrooveCompassLaneLabel(action);
  const grooveMetricLabel = parts[0] ?? `${drumHitCount(pattern)} drum hits`;
  const destinationLabel = parts[1] ?? "Compose";
  const detailLabel = parts.slice(2).join(" / ") || "current pocket lane";
  const actionLabel =
    action.id === "groove-compass-focus" ? "focus active groove compass" : "focus direct groove compass";

  return {
    id: "groove-compass",
    label: "Groove compass",
    value: `${actionLabel} / lane ${laneLabel} / destination ${destinationLabel} / metric ${grooveMetricLabel} / detail ${detailLabel} / Pattern ${
      project.selectedPattern
    } / ${projectEventTotal(project)} events / ${drumHitCount(pattern)} drum hits / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionGrooveCompassDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionGrooveCompassLaneLabel(action: QuickAction): string {
  const directId = action.id.startsWith("groove-compass-card-") ? action.id.slice("groove-compass-card-".length) : "";
  const directLabel = directId ? grooveCompassLaneLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title.replace(/^Focus Groove Compass:\s*/, "").trim();
  return directLabel || titleLabel || "pocket lane unavailable";
}

export function grooveCompassLaneLabelFromQuickActionId(id: string): string {
  switch (id) {
    case "density":
      return "Density";
    case "anchors":
      return "Anchors";
    case "hats":
      return "Hat motion";
    case "timing":
      return "Timing";
    case "chance":
      return "Chance";
    case "pocket":
      return "Pocket balance";
    case "focus":
      return "Selected drum";
    default:
      return "";
  }
}

export function quickActionPatternDnaMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-dna-focus" && !action.id.startsWith("pattern-dna-card-")) {
    return null;
  }

  const pattern = activePattern(project);
  const parts = quickActionPatternDnaDetailParts(action);
  const laneLabel = quickActionPatternDnaLaneLabel(action);
  const patternMetricLabel = parts[0] ?? `${patternEventTotal(pattern)} events`;
  const destinationLabel = parts[1] ?? patternDnaDestinationLabelFromLane(laneLabel);
  const detailLabel = parts.slice(2).join(" / ") || "current loop posture";
  const actionLabel = action.id === "pattern-dna-focus" ? "focus active pattern dna" : "focus direct pattern dna";
  const drumCount = drumHitCount(pattern);
  const musicEvents = pattern.bassNotes.length + pattern.chordEvents.length + pattern.melodyNotes.length;
  const readyLayerCount = [
    drumCount > 0,
    pattern.bassNotes.length > 0,
    pattern.chordEvents.length > 0,
    pattern.melodyNotes.length > 0
  ].filter(Boolean).length;
  const arrangedBlocks = project.arrangement.filter((block) => block.pattern === project.selectedPattern);
  const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  const arrangementUse =
    arrangedBlocks.length === 0
      ? "not arranged"
      : `${arrangedBlocks.length} block${arrangedBlocks.length === 1 ? "" : "s"} / ${barCountLabel(arrangedBars)}`;

  return {
    id: "pattern-dna",
    label: "Pattern DNA",
    value: `${actionLabel} / lane ${laneLabel} / destination ${destinationLabel} / metric ${patternMetricLabel} / detail ${detailLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${drumCount} drum hits / ${musicEvents} music events / ${readyLayerCount}/4 layers / arrangement ${arrangementUse} / ${barCountLabel(
      arrangementTotalBars(project)
    )}`
  };
}

export function quickActionPatternDnaDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionPatternDnaLaneLabel(action: QuickAction): string {
  const directId = action.id.startsWith("pattern-dna-card-") ? action.id.slice("pattern-dna-card-".length) : "";
  const directLabel = directId ? patternDnaLaneLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title.replace(/^Focus Pattern DNA:\s*/, "").trim();
  return directLabel || titleLabel || "loop-posture lane unavailable";
}

export function patternDnaLaneLabelFromQuickActionId(id: string): string {
  switch (id) {
    case "layers":
      return "Layers";
    case "density":
      return "Density";
    case "dynamics":
      return "Dynamics";
    case "variation":
      return "Variation";
    case "arrangement":
      return "Arrangement";
    default:
      return "";
  }
}

export function patternDnaDestinationLabelFromLane(label: string): string {
  return label.toLowerCase() === "arrangement" ? "Arrange" : "Compose";
}

export function quickActionPatternPlaybackReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-playback-readout-action") {
    return null;
  }

  const pattern = activePattern(project);
  const selectedBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0] ?? null;
  const blockLabel = selectedBlock
    ? `Block ${Math.min(selectedArrangementIndex + 1, project.arrangement.length)} ${selectedBlock.section} / Pattern ${
        selectedBlock.pattern
      } / ${barCountLabel(selectedBlock.bars)}`
    : "No selected block";
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionPatternPlaybackReadoutDetailParts(action);
  const statusLabel = detailParts[0] ?? "Pattern playback";
  const fallbackRoleLabel = action.title.replace(/^Review Pattern Playback:\s*/, "").trim() || `Editing Pattern ${project.selectedPattern}`;
  const roleLabel = detailParts[1] ?? fallbackRoleLabel;
  const detailLabel = detailParts[2] ?? `${patternEventTotal(pattern)} events`;
  const loopLabel = detailParts[3]?.replace(/\s+loop$/, "") || "current loop";
  const drumCount = drumHitCount(pattern);
  const musicEvents = pattern.bassNotes.length + pattern.chordEvents.length + pattern.melodyNotes.length;

  return {
    id: "pattern-playback-readout",
    label: "Pattern Playback",
    value: [
      "review pattern playback",
      statusLabel,
      roleLabel,
      detailLabel,
      `loop ${loopLabel}`,
      `selected ${blockLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `${drumCount} drum hits`,
      `${musicEvents} music events`,
      patternUseLabel,
      `${project.bpm} BPM`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "follow unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function quickActionPatternPlaybackReadoutDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionAudiblePatternFollowMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-follow-audible") {
    return null;
  }

  const target = audiblePatternFollowQuickActionTarget(action) ?? project.selectedPattern;
  const beforeEditPattern = audiblePatternFollowQuickActionBeforeEdit(action);
  const targetPattern = project.patterns[target];
  const eventCount = patternEventTotal(targetPattern);
  const drumCount = drumHitCount(targetPattern);
  const musicEvents = targetPattern.bassNotes.length + targetPattern.chordEvents.length + targetPattern.melodyNotes.length;
  const arrangedBlocks = project.arrangement.filter((block) => block.pattern === target);
  const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  const arrangementUse =
    arrangedBlocks.length === 0
      ? "not arranged"
      : `${arrangedBlocks.length} block${arrangedBlocks.length === 1 ? "" : "s"} / ${barCountLabel(arrangedBars)}`;
  const editContext = beforeEditPattern
    ? `before edit Pattern ${beforeEditPattern} / current edit Pattern ${project.selectedPattern}`
    : `current edit Pattern ${project.selectedPattern}`;

  return {
    id: "pattern-follow-audible",
    label: "Audible pattern",
    value: `follow audible edit focus / heard Pattern ${target} / ${eventCount} events / ${drumCount} drums / ${musicEvents} music / arrangement ${arrangementUse} / ${editContext}`
  };
}

export function audiblePatternFollowQuickActionTarget(action: QuickAction): PatternSlot | null {
  if (action.id !== "pattern-follow-audible") {
    return null;
  }

  const titleMatch = /audible Pattern ([ABC])/.exec(action.title);
  const detailMatch = /Hearing Pattern ([ABC])/.exec(action.detail);
  return patternSlotFromQuickActionValue(titleMatch?.[1] ?? detailMatch?.[1] ?? "");
}

export function audiblePatternFollowQuickActionBeforeEdit(action: QuickAction): PatternSlot | null {
  if (action.id !== "pattern-follow-audible") {
    return null;
  }

  const detailMatch = /editing Pattern ([ABC])/.exec(action.detail);
  return patternSlotFromQuickActionValue(detailMatch?.[1] ?? "");
}

export function quickActionArrangementPlaybackReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "arrangement-playback-readout-action") {
    return null;
  }

  const selectedIndex = Math.min(Math.max(0, selectedArrangementIndex), Math.max(project.arrangement.length - 1, 0));
  const selectedBlock = project.arrangement[selectedIndex] ?? null;
  const heardIndex = arrangementPlaybackReadoutQuickActionHeardIndex(action);
  const heardBlock = heardIndex !== null ? project.arrangement[heardIndex] ?? null : null;
  const detailParts = quickActionArrangementPlaybackReadoutDetailParts(action);
  const statusLabel = detailParts[0] ?? "Arrangement playback";
  const fallbackRoleLabel =
    action.title.replace(/^Review Arrangement Playback:\s*/, "").trim() ||
    (selectedBlock ? `Editing Block ${selectedIndex + 1} ${selectedBlock.section}` : "No block");
  const roleLabel = detailParts[1] ?? fallbackRoleLabel;
  const detailLabel = detailParts[2] ?? (selectedBlock ? `Pattern ${selectedBlock.pattern}` : "No arrangement block");
  const loopLabel = detailParts[3]?.replace(/\s+loop$/, "") || "current loop";
  const selectedLabel = selectedBlock
    ? quickActionArrangementPlaybackBlockLabel(project, selectedIndex, selectedBlock, "selected")
    : "selected block unavailable";
  const heardLabel = heardBlock
    ? quickActionArrangementPlaybackBlockLabel(project, heardIndex ?? 0, heardBlock, "heard")
    : "heard block idle";
  const selectedEventCount = selectedBlock ? patternEventTotal(project.patterns[selectedBlock.pattern]) : 0;
  const heardEventCount = heardBlock ? patternEventTotal(project.patterns[heardBlock.pattern]) : null;
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;

  return {
    id: "arrangement-playback-readout",
    label: "Arrangement Playback",
    value: [
      "review arrangement playback",
      statusLabel,
      roleLabel,
      detailLabel,
      `loop ${loopLabel}`,
      selectedLabel,
      heardLabel,
      `${selectedEventCount} selected-block events`,
      heardEventCount === null ? "heard events idle" : `${heardEventCount} heard-block events`,
      patternUseLabel,
      `${project.bpm} BPM`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "follow unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function quickActionArrangementPlaybackReadoutDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function arrangementPlaybackReadoutQuickActionHeardIndex(action: QuickAction): number | null {
  if (action.id !== "arrangement-playback-readout-action") {
    return null;
  }

  const detailMatch = /Hearing Block (\d+)/.exec(action.detail);
  const blockNumber = Number(detailMatch?.[1]);
  return Number.isInteger(blockNumber) && blockNumber > 0 ? blockNumber - 1 : null;
}

export function quickActionArrangementPlaybackBlockLabel(
  project: ProjectState,
  index: number,
  block: ArrangementBlock,
  role: "selected" | "heard"
): string {
  const bars = normalizeArrangementBars(block.bars);
  const startBar = arrangementStartBar(project, index) + 1;
  const endBar = startBar + bars - 1;
  const rangeLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
  return `${role} Block ${index + 1} ${block.section} / Pattern ${block.pattern} / ${rangeLabel} / ${barCountLabel(bars)}`;
}

export function quickActionSelectedArrangementBlockReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "selected-arrangement-block-readout-action") {
    return null;
  }

  const selectedIndex = Math.min(Math.max(0, selectedArrangementIndex), Math.max(project.arrangement.length - 1, 0));
  const block = project.arrangement[selectedIndex] ?? null;
  if (!block) {
    return {
      id: "selected-arrangement-block-readout",
      label: "Selected arrangement block",
      value: `review selected arrangement block / no selected block / ${project.arrangement.length} blocks / ${barCountLabel(
        arrangementTotalBars(project)
      )} / jump unchanged / cue unchanged / export unchanged`
    };
  }

  const bars = normalizeArrangementBars(block.bars);
  const startBar = arrangementStartBar(project, selectedIndex) + 1;
  const endBar = startBar + bars - 1;
  const rangeLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
  const energy = normalizeArrangementEnergy(block.energy);
  const mutedTracks = normalizeArrangementMutedTracks(block.mutedTracks);
  const roleSummary = selectedArrangementBlockRoleSummary(project, selectedIndex);
  const usedSlots = usedPatternSlots(project);
  const eventCount = patternEventTotal(project.patterns[block.pattern]);

  return {
    id: "selected-arrangement-block-readout",
    label: "Selected arrangement block",
    value: [
      "review selected arrangement block",
      `Block ${selectedIndex + 1} ${block.section}`,
      roleSummary?.roleLabel ?? "section role",
      `Pattern ${block.pattern}`,
      rangeLabel,
      barCountLabel(bars),
      `${percentLabel(energy)} energy`,
      arrangementFocusPreviewMuteLabel(mutedTracks),
      `${eventCount} editable events`,
      usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "jump unchanged",
      "cue unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function quickActionAudibleArrangementFollowReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "audible-arrangement-follow-readout-action") {
    return null;
  }

  const selectedIndex = Math.min(Math.max(0, selectedArrangementIndex), Math.max(project.arrangement.length - 1, 0));
  const selectedBlock = project.arrangement[selectedIndex] ?? null;
  const targetIndex = audibleArrangementFollowReadoutQuickActionTargetIndex(action);
  const targetBlock = targetIndex !== null ? project.arrangement[targetIndex] ?? null : null;
  const detailParts = quickActionArrangementPlaybackReadoutDetailParts(action);
  const statusLabel = detailParts[1] ?? detailParts[0] ?? "Arrangement playback";
  const playbackDetail = detailParts[2] ?? selectedBlock?.pattern ?? "No arrangement block";
  const loopLabel = detailParts.find((part) => /\s+loop$/.test(part))?.replace(/\s+loop$/, "") || "current loop";
  const usedSlots = usedPatternSlots(project);
  const selectedLabel = selectedBlock
    ? quickActionArrangementPlaybackBlockLabel(project, selectedIndex, selectedBlock, "selected")
    : "selected block unavailable";
  const targetLabel = targetBlock
    ? quickActionArrangementPlaybackBlockLabel(project, targetIndex ?? 0, targetBlock, "heard")
    : action.detail.startsWith("Already editing audible")
      ? "heard block matches selected edit block"
      : "heard block idle";
  const targetEventCount = targetBlock ? patternEventTotal(project.patterns[targetBlock.pattern]) : null;
  const selectedEventCount = selectedBlock ? patternEventTotal(project.patterns[selectedBlock.pattern]) : 0;

  return {
    id: "audible-arrangement-follow-readout",
    label: "Audible follow readout",
    value: [
      "review audible arrangement follow",
      statusLabel,
      playbackDetail,
      `loop ${loopLabel}`,
      selectedLabel,
      targetLabel,
      `${selectedEventCount} selected-block events`,
      targetEventCount === null ? "audible events unchanged" : `${targetEventCount} audible-block events`,
      usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "follow unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function audibleArrangementFollowReadoutQuickActionTargetIndex(action: QuickAction): number | null {
  if (action.id !== "audible-arrangement-follow-readout-action") {
    return null;
  }

  const titleMatch = /Block (\d+)/.exec(action.title);
  const detailMatch = /Hearing Block (\d+)/.exec(action.detail);
  const blockNumber = Number(detailMatch?.[1] ?? titleMatch?.[1]);
  return Number.isInteger(blockNumber) && blockNumber > 0 ? blockNumber - 1 : null;
}

export function quickActionAudibleArrangementFollowMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0,
  phase: "before" | "after" = "after"
): { id: string; label: string; value: string } | null {
  const targetIndex = audibleArrangementFollowQuickActionTargetIndex(action);
  if (targetIndex === null) {
    return null;
  }

  const targetBlock = project.arrangement[targetIndex];
  if (!targetBlock) {
    return {
      id: "arrangement-follow-audible",
      label: "Audible block",
      value: `follow audible block / Block ${targetIndex + 1} missing / ${project.arrangement.length} blocks / ${barCountLabel(
        arrangementTotalBars(project)
      )}`
    };
  }

  const beforeEditIndex = audibleArrangementFollowQuickActionBeforeEditIndex(action);
  const editIndex = phase === "after" ? targetIndex : beforeEditIndex ?? selectedArrangementIndex;
  const boundedEditIndex = Math.min(Math.max(0, editIndex), Math.max(project.arrangement.length - 1, 0));
  const editBlock = project.arrangement[boundedEditIndex] ?? null;
  const bars = normalizeArrangementBars(targetBlock.bars);
  const startBar = arrangementStartBar(project, targetIndex) + 1;
  const endBar = startBar + bars - 1;
  const rangeLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
  const eventCount = patternEventTotal(project.patterns[targetBlock.pattern]);
  const beforeEditLabel = beforeEditIndex === null ? "before edit block unknown" : `before edit Block ${beforeEditIndex + 1}`;
  const currentEditLabel = editBlock ? `current edit Block ${boundedEditIndex + 1} ${editBlock.section}` : "current edit block unavailable";

  return {
    id: "arrangement-follow-audible",
    label: "Audible block",
    value: `follow audible block / heard Block ${targetIndex + 1} ${targetBlock.section} / Pattern ${
      targetBlock.pattern
    } / ${rangeLabel} / ${eventCount} events / ${beforeEditLabel} / ${currentEditLabel} / ${
      project.arrangement.length
    } blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function audibleArrangementFollowQuickActionTargetIndex(action: QuickAction): number | null {
  if (action.id !== "arrangement-follow-audible") {
    return null;
  }

  const titleMatch = /audible Block (\d+)/.exec(action.title);
  const detailMatch = /Hearing Block (\d+)/.exec(action.detail);
  const blockNumber = Number(titleMatch?.[1] ?? detailMatch?.[1]);
  return Number.isInteger(blockNumber) && blockNumber > 0 ? blockNumber - 1 : null;
}

export function audibleArrangementFollowQuickActionBeforeEditIndex(action: QuickAction): number | null {
  if (action.id !== "arrangement-follow-audible") {
    return null;
  }

  const detailMatch = /while editing Block (\d+)/.exec(action.detail);
  const blockNumber = Number(detailMatch?.[1]);
  return Number.isInteger(blockNumber) && blockNumber > 0 ? blockNumber - 1 : null;
}

export function quickActionWorkflowNavigatorContext(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { item: WorkflowNavigatorItem; items: WorkflowNavigatorItem[]; exportAnalysis: ExportAnalysis; stemAnalyses: StemExportAnalyses } | null {
  const zone = workflowNavigatorZoneFromQuickAction(action.id);
  if (!zone) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, exportAnalysis);
  const beatMap = createBeatMapSummary(project, checks, exportAnalysis, stemAnalyses);
  const exportPreflight = createExportPreflightSummary(project, checks, exportAnalysis, stemAnalyses);
  const items = createWorkflowNavigatorItems(project, beatMap, exportPreflight, exportAnalysis);
  const item = items.find((candidate) => candidate.id === zone);
  return item ? { item, items, exportAnalysis, stemAnalyses } : null;
}

export function quickActionWorkflowNavigatorMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const context = quickActionWorkflowNavigatorContext(project, action, analysis);
  if (!context) {
    return null;
  }

  const { item, items, exportAnalysis, stemAnalyses } = context;
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;

  return {
    id: "workflow-navigator",
    label: "Workflow navigator",
    value: [
      `command ${action.title}`,
      `detail ${action.detail}`,
      `destination Guide / Workflow Navigator / ${item.label}`,
      `zone ${item.label} / ${item.value} / ${item.detail}`,
      `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
      `workflow ${workflowNavigatorJumpMetricValue(items)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStemCount}/${target.stemGoal} target`,
      `audition ${workflowNavigatorJumpAuditionCue(item)}`,
      `next ${workflowNavigatorJumpNextCheck(item)}`
    ].join(" / ")
  };
}

export function quickActionWorkflowNavigatorFollowup(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { auditionCue: string; nextCheck: string } | null {
  const context = quickActionWorkflowNavigatorContext(project, action, analysis);
  if (!context) {
    return null;
  }

  return {
    auditionCue: workflowNavigatorJumpAuditionCue(context.item),
    nextCheck: workflowNavigatorJumpNextCheck(context.item)
  };
}

export function workflowNavigatorZoneFromQuickAction(actionId: string): WorkflowZoneId | null {
  const zoneId = actionId.slice("workflow-navigator-".length);
  switch (zoneId) {
    case "compose":
    case "arrange":
    case "mix":
    case "deliver":
      return zoneId;
    default:
      return null;
  }
}

export function quickActionWorkflowSpotlightContext(
  project: ProjectState,
  analysis?: ExportAnalysis
): {
  item: WorkflowNavigatorItem | null;
  items: WorkflowNavigatorItem[];
  spotlight: ReturnType<typeof createWorkflowSpotlightSummary>;
  exportAnalysis: ExportAnalysis;
  stemAnalyses: StemExportAnalyses;
} {
  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, exportAnalysis);
  const beatMap = createBeatMapSummary(project, checks, exportAnalysis, stemAnalyses);
  const exportPreflight = createExportPreflightSummary(project, checks, exportAnalysis, stemAnalyses);
  const items = createWorkflowNavigatorItems(project, beatMap, exportPreflight, exportAnalysis);
  const spotlight = createWorkflowSpotlightSummary(items);
  const item = spotlight.zoneId ? items.find((candidate) => candidate.id === spotlight.zoneId) ?? null : null;
  return { item, items, spotlight, exportAnalysis, stemAnalyses };
}

export function quickActionWorkflowSpotlightMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "workflow-spotlight-focus") {
    return null;
  }

  const { item, spotlight, exportAnalysis, stemAnalyses } = quickActionWorkflowSpotlightContext(project, analysis);
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const auditionCue = item ? workflowNavigatorJumpAuditionCue(item) : "Inspect Workflow Navigator before choosing another zone.";
  const nextCheck = item ? workflowNavigatorJumpNextCheck(item) : "Return to Workflow Navigator after zones are available.";

  return {
    id: "workflow-spotlight",
    label: "Workflow spotlight",
    value: [
      `command ${action.title}`,
      `detail ${action.detail}`,
      `destination Guide / Workflow Spotlight / ${spotlight.zoneLabel}`,
      `spotlight ${spotlight.statusLabel} / ${spotlight.detailLabel}`,
      `decision ${spotlight.decisionStatus} / ${spotlight.decisionDetail}`,
      item ? `zone ${item.label} / ${item.value} / ${item.detail}` : `zone ${spotlight.zoneLabel} / ${spotlight.detailLabel}`,
      `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
      `workflow ${spotlight.countLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStemCount}/${target.stemGoal} target`,
      `audition ${auditionCue}`,
      `next ${nextCheck}`
    ].join(" / ")
  };
}

export function quickActionWorkflowSpotlightFollowup(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { auditionCue: string; nextCheck: string } | null {
  if (action.id !== "workflow-spotlight-focus") {
    return null;
  }

  const { item } = quickActionWorkflowSpotlightContext(project, analysis);
  if (!item) {
    return null;
  }

  return {
    auditionCue: workflowNavigatorJumpAuditionCue(item),
    nextCheck: workflowNavigatorJumpNextCheck(item)
  };
}

export function quickActionKeyboardCaptureReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  inputSetupResult: QuickActionInputSetupResultState | null,
  phase: "before" | "after",
  selectedArrangementIndex = 0,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "keyboard-capture-readout-action" || !inputSetupResult) {
    return null;
  }

  const snapshot = phase === "before" ? inputSetupResult.before : inputSetupResult.after;
  const target = snapshot.keyboardCaptureTarget;
  const defaults = snapshot.keyboardCaptureDefaults[target];
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const exportAnalysis = analysis ?? analyzeExport(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;

  return {
    id: "keyboard-capture-readout",
    label: "Keyboard Capture",
    value: [
      "review keyboard capture",
      `keyboard ${snapshot.keyboardCaptureEnabled ? "Armed" : "Off"}`,
      `target ${quickActionInputTargetLabel(target)}`,
      `placement ${quickActionCaptureStepModeLabel(snapshot.keyboardCaptureStepMode)}`,
      `degree map ${quickActionInputPitchMapLabel(project, snapshot)}`,
      `defaults ${keyboardCaptureDefaultSummary(target, defaults)}`,
      `midi ${snapshot.midiCaptureArmed ? "Armed" : "Disarmed"} / ${snapshot.midiStatusLabel} / ${
        snapshot.connectedMidiInputCount
      }/${snapshot.midiInputCount} inputs / selected ${snapshot.midiSelectedInputId}`,
      `selected ${quickActionArrangementSelectedBlockLabel(project, selectedArrangementIndex)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `808 ${pattern.bassNotes.length} notes`,
      `Synth ${pattern.melodyNotes.length} notes`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `last MIDI ${snapshot.midiLastNoteLabel}`,
      "capture unchanged",
      "MIDI permission unchanged",
      "Pattern A/B/C unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function quickActionCaptureStepModeReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  inputSetupResult: QuickActionInputSetupResultState | null,
  phase: "before" | "after",
  selectedArrangementIndex = 0,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "capture-step-mode-readout-action" || !inputSetupResult) {
    return null;
  }

  const snapshot = phase === "before" ? inputSetupResult.before : inputSetupResult.after;
  const target = snapshot.keyboardCaptureTarget;
  const defaults = snapshot.keyboardCaptureDefaults[target];
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const exportAnalysis = analysis ?? analyzeExport(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;

  return {
    id: "capture-step-mode-readout",
    label: "Capture Step Mode",
    value: [
      "review capture step mode",
      `placement ${quickActionCaptureStepModeLabel(snapshot.keyboardCaptureStepMode)}`,
      `next capture ${quickActionCaptureStepCandidateLabel(project, snapshot)}`,
      `selected note ${quickActionCaptureStepSelectedNoteLabel(snapshot)}`,
      `target ${quickActionInputTargetLabel(target)}`,
      `keyboard ${snapshot.keyboardCaptureEnabled ? "Armed" : "Off"}`,
      `midi ${snapshot.midiCaptureArmed ? "Armed" : "Disarmed"} / ${snapshot.midiStatusLabel} / ${
        snapshot.connectedMidiInputCount
      }/${snapshot.midiInputCount} inputs / selected ${snapshot.midiSelectedInputId}`,
      `defaults ${keyboardCaptureDefaultSummary(target, defaults)}`,
      `degree map ${quickActionInputPitchMapLabel(project, snapshot)}`,
      `selected ${quickActionArrangementSelectedBlockLabel(project, selectedArrangementIndex)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `808 ${pattern.bassNotes.length} notes`,
      `Synth ${pattern.melodyNotes.length} notes`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `last MIDI ${snapshot.midiLastNoteLabel}`,
      "placement unchanged",
      "notes unchanged",
      "MIDI permission unchanged",
      "Pattern A/B/C unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function quickActionMidiInputReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  inputSetupResult: QuickActionInputSetupResultState | null,
  phase: "before" | "after",
  selectedArrangementIndex = 0,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "midi-input-readout-action" || !inputSetupResult) {
    return null;
  }

  const snapshot = phase === "before" ? inputSetupResult.before : inputSetupResult.after;
  const target = snapshot.keyboardCaptureTarget;
  const defaults = snapshot.keyboardCaptureDefaults[target];
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const exportAnalysis = analysis ?? analyzeExport(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;

  return {
    id: "midi-input-readout",
    label: "MIDI Input",
    value: [
      "review midi input",
      `support ${quickActionMidiInputSupportLabel(snapshot)}`,
      `status ${snapshot.midiCaptureStatus} / ${snapshot.midiStatusLabel}`,
      `armed ${snapshot.midiCaptureArmed ? "Armed" : "Disarmed"}`,
      `inputs ${snapshot.connectedMidiInputCount}/${snapshot.midiInputCount} connected`,
      `selected ${snapshot.midiSelectedInputLabel} (${snapshot.midiSelectedInputId})`,
      `last MIDI ${snapshot.midiLastNoteLabel}`,
      `target ${quickActionInputTargetLabel(target)}`,
      `placement ${quickActionCaptureStepModeLabel(snapshot.keyboardCaptureStepMode)}`,
      `degree map ${quickActionInputPitchMapLabel(project, snapshot)}`,
      `defaults ${keyboardCaptureDefaultSummary(target, defaults)}`,
      `keyboard ${snapshot.keyboardCaptureEnabled ? "Armed" : "Off"}`,
      `selected ${quickActionArrangementSelectedBlockLabel(project, selectedArrangementIndex)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `808 ${pattern.bassNotes.length} notes`,
      `Synth ${pattern.melodyNotes.length} notes`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      "MIDI permission unchanged",
      "MIDI arm unchanged",
      "capture target unchanged",
      "notes unchanged",
      "Pattern A/B/C unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function keyboardCaptureDefaultSummary(target: NoteTrack, defaults: KeyboardCaptureDefaults): string {
  const base = `oct ${defaults.octave} / len ${defaults.length} steps / vel ${percentLabel(defaults.velocity)}`;
  return target === "bass" ? `${base} / glide ${defaults.glide ? "On" : "Off"}` : base;
}

export function keyboardCapturePitchMapSummary(
  project: ProjectState,
  target: NoteTrack,
  defaults: KeyboardCaptureDefaults
): string {
  const lanes = keyboardCapturePitchLanes(project.key, target, defaults);
  if (lanes.length === 0) {
    return "unavailable";
  }

  return lanes.length === 1 ? lanes[0] : `${lanes[0]}-${lanes[lanes.length - 1]}`;
}

export function quickActionInputSetupMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  inputSetupResult: QuickActionInputSetupResultState | null,
  phase: "before" | "after",
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (!isInputSetupQuickAction(action) || !inputSetupResult) {
    return null;
  }

  const snapshot = phase === "before" ? inputSetupResult.before : inputSetupResult.after;
  const target = snapshot.keyboardCaptureTarget;
  const defaults = snapshot.keyboardCaptureDefaults[target];
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const exportAnalysis = analysis ?? analyzeExport(project);
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "input-capture-setup",
    label: "Input capture setup",
    value: [
      `command ${action.title}`,
      `route ${quickActionInputSetupRouteLabel(action)}`,
      `target ${quickActionInputTargetLabel(target)}`,
      `keyboard ${snapshot.keyboardCaptureEnabled ? "Armed" : "Off"}`,
      `midi ${snapshot.midiCaptureArmed ? "Armed" : "Disarmed"} / ${snapshot.midiStatusLabel} / ${
        snapshot.connectedMidiInputCount
      }/${snapshot.midiInputCount} inputs / selected ${snapshot.midiSelectedInputId}`,
      `placement ${quickActionCaptureStepModeLabel(snapshot.keyboardCaptureStepMode)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `default pitch ${quickActionInputPitchMapLabel(project, snapshot)}`,
      `oct ${defaults.octave}`,
      `len ${defaults.length} steps`,
      `vel ${percentLabel(defaults.velocity)}`,
      `glide ${target === "bass" ? (defaults.glide ? "On" : "Off") : "Synth n/a"}`,
      `808 ${pattern.bassNotes.length} notes`,
      `Synth ${pattern.melodyNotes.length} notes`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `last MIDI ${snapshot.midiLastNoteLabel}`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionInputSetupRouteLabel(action: QuickAction): string {
  if (action.id === "midi-input-readout-action" || action.id === "midi-input-connect" || action.id === "midi-input-arm") {
    return "Create / MIDI Input";
  }
  if (action.id.startsWith("capture-target-")) {
    return "Create / Capture Target";
  }
  if (action.id.startsWith("capture-step-mode-")) {
    return "Create / Capture Step Mode";
  }
  if (action.id.startsWith("capture-default-")) {
    return "Create / Capture Defaults";
  }
  return "Create / Keyboard Capture";
}

export function quickActionInputTargetLabel(target: NoteTrack): string {
  return target === "bass" ? "808" : "Synth";
}

export function quickActionCaptureStepModeLabel(mode: KeyboardCaptureStepMode): string {
  return mode === "next-free" ? "Next empty" : "Replace selected";
}

export function quickActionInputPitchMapLabel(project: ProjectState, snapshot: QuickActionInputSetupSnapshot): string {
  const defaults = snapshot.keyboardCaptureDefaults[snapshot.keyboardCaptureTarget];
  const lanes = keyboardCapturePitchLanes(project.key, snapshot.keyboardCaptureTarget, defaults);
  if (lanes.length === 0) {
    return "unavailable";
  }

  return lanes.length === 1 ? lanes[0] : `${lanes[0]}-${lanes[lanes.length - 1]}`;
}

export function quickActionMidiInputSupportLabel(snapshot: QuickActionInputSetupSnapshot): string {
  if (snapshot.midiCaptureStatus === "unsupported") {
    return "Unsupported";
  }
  if (snapshot.midiCaptureStatus === "denied") {
    return "Permission denied";
  }
  if (snapshot.midiCaptureStatus === "requesting") {
    return "Permission pending";
  }
  return "Available";
}

export function quickActionCaptureStepSelectedNoteLabel(snapshot: QuickActionInputSetupSnapshot): string {
  if (!snapshot.selectedNote) {
    return "none";
  }

  const targetLabel = snapshot.selectedNote.track === "bass" ? "808" : "Synth";
  return `${targetLabel} ${snapshot.selectedNote.pitch}.${snapshot.selectedNote.step + 1} ${
    snapshot.selectedNoteActive ? "active" : "inactive"
  }`;
}

export function quickActionCaptureStepCandidateLabel(
  project: ProjectState,
  snapshot: QuickActionInputSetupSnapshot
): string {
  const pattern = activePattern(project);
  const step = resolveKeyboardCaptureStep(
    pattern,
    snapshot.keyboardCaptureTarget,
    snapshot.selectedNote,
    snapshot.keyboardCaptureStepMode
  );
  const targetLabel = quickActionInputTargetLabel(snapshot.keyboardCaptureTarget);
  if (snapshot.keyboardCaptureStepMode === "replace-selected") {
    if (snapshot.selectedNote?.track === snapshot.keyboardCaptureTarget && snapshot.selectedNoteActive) {
      return `step ${snapshot.selectedNote.step + 1} replacing ${snapshot.selectedNoteLabel}`;
    }
    return `step ${step + 1} fallback; select active ${targetLabel} note to replace`;
  }

  return `step ${step + 1} next empty ${targetLabel}`;
}

export function quickActionResultMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0,
  phase: "before" | "after" = "after",
  handoffExportReceipt: HandoffExportReceipt | null = null,
  inputSetupResult: QuickActionInputSetupResultState | null = null
): { id: string; label: string; value: string } {
  const analysis = action.group === "Mix" || action.group === "Export" ? analyzeExport(project) : null;

  if (action.id === "project-safety-readout") {
    const projectSafetyMetric = quickActionProjectSafetyMetricSnapshot(project, action, analysis ?? undefined);
    if (projectSafetyMetric) {
      return projectSafetyMetric;
    }

    return { id: "project-safety", label: "Project safety", value: action.detail };
  }

  if (action.id === "save-snapshot") {
    const snapshotMetric = quickActionProjectSnapshotMetricSnapshot(project, action, analysis ?? undefined);
    if (snapshotMetric) {
      return snapshotMetric;
    }

    return { id: "snapshots", label: "Snapshots", value: `${project.snapshots.length} slots` };
  }

  if (action.id === "command-reference" || action.id === "beat-terms-reference") {
    return { id: "command-reference", label: "Reference", value: "Desktop / Project / Guide / Create / Sound / Arrange / Mix / Finish / Deliver / Beat Terms" };
  }

  if (action.id === "transport-position-readout-action") {
    return (
      quickActionTransportPositionMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "transport-position-readout",
        label: "Transport Position",
        value: action.detail
      }
    );
  }

  if (action.id === "loop-scope") {
    return (
      quickActionLoopScopeMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "loop-scope",
        label: "Loop Scope",
        value: action.detail
      }
    );
  }

  if (action.id === "metronome-readout") {
    return (
      quickActionMetronomeReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "metronome-readout",
        label: "Metronome",
        value: action.detail
      }
    );
  }

  if (action.id === "tap-tempo-readout-action") {
    return (
      quickActionTapTempoReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "tap-tempo-readout",
        label: "Tap Tempo",
        value: action.detail
      }
    );
  }

  if (action.id === "guide-quick-start") {
    return (
      quickActionGuideQuickStartMetricSnapshot(action) ?? {
        id: "guide-quick-start",
        label: "Guide quick start",
        value: action.detail
      }
    );
  }

  if (action.id === "guide-bottleneck-focus") {
    return (
      quickActionGuideQuickStartMetricSnapshot(action) ?? {
        id: "guide-bottleneck-focus",
        label: "Guide bottleneck",
        value: action.detail
      }
    );
  }

  const nextMoveAction = nextMoveQuickActionForProject(project, action);
  if (nextMoveAction) {
    const source = nextMoveQuickActionSource(action.id);
    if (source === "beat-map") {
      return quickActionBeatMapMetricSnapshot(project, action, nextMoveAction);
    }
    if (source === "structure-lens") {
      return quickActionStructureLensMetricSnapshot(project, action, nextMoveAction);
    }

    const metric = nextMoveResultMetricSnapshot(project, nextMoveAction);
    return {
      id: `${source ?? "next-move"}-${metric.id}`,
      label: `${source ? nextMoveQuickActionSourceLabel(source) : "Next Move"} ${metric.label}`,
      value: metric.value
    };
  }

  if (action.id === "restore-local-draft" || action.id === "clear-local-draft") {
    const localDraftMetric = quickActionLocalDraftMetricSnapshot(project, action, analysis ?? undefined);
    if (localDraftMetric) {
      return localDraftMetric;
    }

    return { id: "local-draft", label: "Draft recovery", value: `${projectEventTotal(project)} events` };
  }

  if (action.id === "save-project" || action.id === "open-project") {
    const projectFileMetric = quickActionProjectFileMetricSnapshot(project, action, analysis ?? undefined);
    if (projectFileMetric) {
      return projectFileMetric;
    }

    return { id: "project-file", label: "Project file", value: `${projectEventTotal(project)} events` };
  }

  const blueprintMetric = quickActionBeatBlueprintMetricSnapshot(project, action, analysis ?? undefined);
  if (blueprintMetric) {
    return blueprintMetric;
  }

  if (
    action.id === "blueprint-preview-cue" ||
    action.id === "blueprint-preview-decision"
  ) {
    return { id: "project-events", label: "Project events", value: `${projectEventTotal(project)} events` };
  }

  if (action.id.startsWith("delivery-target-set-")) {
    const deliveryTargetSelectMetric = quickActionDeliveryTargetSelectMetricSnapshot(project, action, analysis ?? undefined);
    if (deliveryTargetSelectMetric) {
      return deliveryTargetSelectMetric;
    }

    const target = activeDeliveryTarget(project);
    return {
      id: "delivery-target",
      label: "Delivery target",
      value: `${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`
    };
  }

  if (action.id.startsWith("mode-switch-")) {
    return { id: "mode-switch", label: "Mode", value: modeLabel(project.mode) };
  }

  if (action.id === "undo" || action.id === "redo") {
    const undoRedoMetric = quickActionUndoRedoMetricSnapshot(project, action, analysis ?? undefined);
    if (undoRedoMetric) {
      return undoRedoMetric;
    }

    return {
      id: "edit-history",
      label: "Edit history",
      value: `${projectEventTotal(project)} events / Pattern ${project.selectedPattern}`
    };
  }

  if (action.id === "session-pass-focus") {
    return (
      quickActionSessionPassMetricSnapshot(project, action) ?? {
        id: "session-pass",
        label: "Session pass",
        value: `${project.mode} mode`
      }
    );
  }

  if (action.id.startsWith("session-pass-card-")) {
    return (
      quickActionSessionPassMetricSnapshot(project, action) ?? {
        id: "session-pass",
        label: "Session pass",
        value: action.detail
      }
    );
  }

  if (action.id === "session-brief-compass-focus") {
    const sessionBriefCompassMetric = quickActionSessionBriefCompassMetricSnapshot(project, action, analysis ?? undefined);
    if (sessionBriefCompassMetric) {
      return sessionBriefCompassMetric;
    }

    return {
      id: "session-brief-compass",
      label: "Brief compass",
      value: `${sessionBriefFilledFields(project.sessionBrief)}/4 fields`
    };
  }

  if (action.id.startsWith("session-brief-compass-card-")) {
    const sessionBriefCompassMetric = quickActionSessionBriefCompassMetricSnapshot(project, action, analysis ?? undefined);
    if (sessionBriefCompassMetric) {
      return sessionBriefCompassMetric;
    }

    return {
      id: "session-brief-compass",
      label: "Brief compass",
      value: action.detail
    };
  }

  if (action.id === "reference-alignment-focus") {
    const referenceAlignmentMetric = quickActionReferenceAlignmentMetricSnapshot(project, action, analysis ?? undefined);
    if (referenceAlignmentMetric) {
      return referenceAlignmentMetric;
    }

    return {
      id: "reference-alignment",
      label: "Reference alignment",
      value: `${sessionBriefFilledFields(project.sessionBrief)}/4 brief fields`
    };
  }

  if (action.id.startsWith("reference-alignment-card-")) {
    const referenceAlignmentMetric = quickActionReferenceAlignmentMetricSnapshot(project, action, analysis ?? undefined);
    if (referenceAlignmentMetric) {
      return referenceAlignmentMetric;
    }

    return {
      id: "reference-alignment",
      label: "Reference alignment",
      value: action.detail
    };
  }

  if (action.id.startsWith("session-brief-starter-")) {
    const sessionBriefStarterMetric = quickActionSessionBriefStarterMetricSnapshot(project, action, analysis ?? undefined);
    if (sessionBriefStarterMetric) {
      return sessionBriefStarterMetric;
    }

    return {
      id: "session-brief",
      label: "Brief fields",
      value: `${sessionBriefFilledFields(project.sessionBrief)}/4 fields`
    };
  }

  if (action.id === "first-beat-path-jump") {
    return (
      quickActionFirstBeatPathMetricSnapshot(project, action) ?? {
        id: "first-beat-path",
        label: "First Beat Path",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("first-beat-path-step-")) {
    return (
      quickActionFirstBeatPathMetricSnapshot(project, action) ?? {
        id: "first-beat-path",
        label: "First Beat Path",
        value: action.detail
      }
    );
  }

  if (action.id === "keyboard-capture-readout-action") {
    return (
      quickActionKeyboardCaptureReadoutMetricSnapshot(
        project,
        action,
        inputSetupResult,
        phase,
        selectedArrangementIndex,
        analysis ?? undefined
      ) ?? {
        id: "keyboard-capture-readout",
        label: "Keyboard Capture",
        value: action.detail
      }
    );
  }

  if (action.id === "capture-step-mode-readout-action") {
    return (
      quickActionCaptureStepModeReadoutMetricSnapshot(
        project,
        action,
        inputSetupResult,
        phase,
        selectedArrangementIndex,
        analysis ?? undefined
      ) ?? {
        id: "capture-step-mode-readout",
        label: "Capture Step Mode",
        value: action.detail
      }
    );
  }

  if (action.id === "midi-input-readout-action") {
    return (
      quickActionMidiInputReadoutMetricSnapshot(
        project,
        action,
        inputSetupResult,
        phase,
        selectedArrangementIndex,
        analysis ?? undefined
      ) ?? {
        id: "midi-input-readout",
        label: "MIDI Input",
        value: action.detail
      }
    );
  }

  if (action.id === "editor-audition-readout-action") {
    return (
      quickActionEditorAuditionReadoutMetricSnapshot(project, action, selectedArrangementIndex, analysis ?? undefined) ?? {
        id: "editor-audition-readout",
        label: "Editor Audition",
        value: action.detail
      }
    );
  }

  const inputSetupMetric = quickActionInputSetupMetricSnapshot(
    project,
    action,
    inputSetupResult,
    phase,
    analysis ?? undefined
  );
  if (inputSetupMetric) {
    return inputSetupMetric;
  }

  if (action.id === "midi-input-connect") {
    return {
      id: "midi-input",
      label: "MIDI input",
      value: `Pattern ${project.selectedPattern} / ${project.key} / local capture`
    };
  }

  if (
    action.id === "keyboard-capture-toggle" ||
    action.id === "midi-input-arm" ||
    action.id.startsWith("capture-target-") ||
    action.id.startsWith("capture-step-mode-") ||
    action.id.startsWith("capture-default-")
  ) {
    return {
      id: "input-capture",
      label: "Input capture",
      value: `Pattern ${project.selectedPattern} / ${project.key} / local setup`
    };
  }

  if (action.id.startsWith("selected-note-")) {
    const selectedEventMetric = quickActionSelectedEventMetricSnapshot(project, action, analysis ?? undefined);
    if (selectedEventMetric) {
      return selectedEventMetric;
    }

    return {
      id: "selected-note",
      label: "Selected note",
      value: `Pattern ${project.selectedPattern} / ${projectEventTotal(project)} events`
    };
  }

  if (action.id.startsWith("selected-drum-")) {
    const selectedEventMetric = quickActionSelectedEventMetricSnapshot(project, action, analysis ?? undefined);
    if (selectedEventMetric) {
      return selectedEventMetric;
    }

    return {
      id: "selected-drum",
      label: "Selected drum",
      value: `Pattern ${project.selectedPattern} / ${projectEventTotal(project)} events`
    };
  }

  if (action.id.startsWith("selected-chord-")) {
    const selectedEventMetric = quickActionSelectedEventMetricSnapshot(project, action, analysis ?? undefined);
    if (selectedEventMetric) {
      return selectedEventMetric;
    }

    return {
      id: "selected-chord",
      label: "Selected chord",
      value: `Pattern ${project.selectedPattern} / ${projectEventTotal(project)} events`
    };
  }

  if (action.id === "delivery-target-align") {
    const deliveryTargetAlignMetric = quickActionDeliveryTargetAlignMetricSnapshot(project, action, analysis ?? undefined);
    if (deliveryTargetAlignMetric) {
      return deliveryTargetAlignMetric;
    }

    return {
      id: "delivery-target",
      label: "Delivery target",
      value: `${activeDeliveryTarget(project).name} / ${barCountLabel(arrangementTotalBars(project))} / ${deliveryTargetMasterLabel(project)}`
    };
  }

  if (action.id === "mode-focus-jump") {
    return (
      quickActionModeFocusMetricSnapshot(project, action) ?? {
        id: "mode-focus",
        label: "Mode focus",
        value: `${project.mode} / ${project.selectedPattern}`
      }
    );
  }

  if (action.id.startsWith("mode-focus-card-")) {
    return (
      quickActionModeFocusMetricSnapshot(project, action) ?? {
        id: "mode-focus",
        label: "Mode focus",
        value: action.detail
      }
    );
  }

  if (action.id === "beat-spine-jump" || action.id === "beat-spine-apply") {
    return (
      quickActionBeatSpineMetricSnapshot(project, action) ?? {
        id: "beat-spine",
        label: "Beat spine",
        value: `Pattern ${project.selectedPattern} / ${projectEventTotal(project)} events`
      }
    );
  }

  if (action.id.startsWith("beat-spine-card-jump-")) {
    return (
      quickActionBeatSpineMetricSnapshot(project, action) ?? {
        id: "beat-spine",
        label: "Beat spine",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("beat-spine-card-apply-")) {
    return (
      quickActionBeatSpineMetricSnapshot(project, action) ?? {
        id: "beat-spine",
        label: "Beat spine",
        value: `Pattern ${project.selectedPattern} / ${projectEventTotal(project)} events`
      }
    );
  }

  if (action.id === "composer-guide-focus") {
    return (
      quickActionComposerGuideMetricSnapshot(project, action) ?? {
        id: "composer-guide",
        label: "Composer guide",
        value: `Pattern ${project.selectedPattern} / ${projectEventTotal(project)} events`
      }
    );
  }

  if (action.id.startsWith("composer-guide-card-")) {
    return (
      quickActionComposerGuideMetricSnapshot(project, action) ?? {
        id: "composer-guide",
        label: "Composer guide",
        value: action.detail
      }
    );
  }

  const composerQuickActionArea = composerActionQuickActionArea(action.id);
  if (composerQuickActionArea) {
    const composerActionMetric = quickActionComposerActionMetricSnapshot(
      project,
      action,
      selectedArrangementIndex,
      analysis ?? undefined
    );
    if (composerActionMetric) {
      return composerActionMetric;
    }

    const pattern = activePattern(project);
    switch (composerQuickActionArea) {
      case "drums":
        return { id: "composer-drums", label: "Composer drums", value: `${drumHitCount(pattern)} hits` };
      case "bass":
        return { id: "composer-808", label: "Composer 808", value: `${pattern.bassNotes.length} notes` };
      case "harmony":
        return { id: "composer-harmony", label: "Composer harmony", value: `${pattern.chordEvents.length} events` };
      case "melody":
        return { id: "composer-melody", label: "Composer melody", value: `${pattern.melodyNotes.length} notes` };
      case "arrange":
        return { id: "composer-arrange", label: "Composer arrange", value: barCountLabel(arrangementTotalBars(project)) };
      case "finish":
        return {
          id: "composer-finish",
          label: "Composer finish",
          value: `${project.masterPreset} / ${formatDb(project.masterCeilingDb)}`
        };
    }
  }

  if (action.id === "key-compass-focus") {
    return (
      quickActionKeyCompassMetricSnapshot(project, action) ?? {
        id: "key-compass",
        label: "Key compass",
        value: `${project.key} / Pattern ${project.selectedPattern}`
      }
    );
  }

  if (action.id.startsWith("key-compass-card-")) {
    return (
      quickActionKeyCompassMetricSnapshot(project, action) ?? {
        id: "key-compass",
        label: "Key compass",
        value: action.detail
      }
    );
  }

  if (action.id === "tempo-nudge-readout-action") {
    return (
      quickActionTempoNudgeReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "tempo-nudge-readout",
        label: "Tempo Nudge",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("tempo-nudge-")) {
    return {
      id: "tempo",
      label: "Tempo",
      value: `${project.bpm} BPM`
    };
  }

  if (action.id === "swing-feel-readout-action") {
    return (
      quickActionSwingFeelReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "swing-feel-readout",
        label: "Swing Feel",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("swing-feel-")) {
    return {
      id: "swing-feel",
      label: "Swing feel",
      value: percentLabel(normalizeSwingFeelValue(project.swing))
    };
  }

  if (action.id === "metronome-toggle") {
    return {
      id: "metronome",
      label: "Metronome",
      value: `${project.metronomeEnabled ? "On" : "Off"} / ${project.bpm} BPM`
    };
  }

  if (action.id === "tap-tempo") {
    return {
      id: "tap-tempo",
      label: "Tap Tempo",
      value: `${project.bpm} BPM`
    };
  }

  if (action.id === "arrangement-follow-audible") {
    return (
      quickActionAudibleArrangementFollowMetricSnapshot(project, action, selectedArrangementIndex, phase) ?? {
        id: "arrangement-follow-audible",
        label: "Audible block",
        value: action.detail
      }
    );
  }

  if (action.id === "selected-arrangement-block-readout-action") {
    return (
      quickActionSelectedArrangementBlockReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "selected-arrangement-block-readout",
        label: "Selected arrangement block",
        value: action.detail
      }
    );
  }

  if (action.id === "audible-arrangement-follow-readout-action") {
    return (
      quickActionAudibleArrangementFollowReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "audible-arrangement-follow-readout",
        label: "Audible follow readout",
        value: action.detail
      }
    );
  }

  if (action.id === "arrangement-playback-readout-action") {
    return (
      quickActionArrangementPlaybackReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "arrangement-playback-readout",
        label: "Arrangement Playback",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("arrangement-block-jump-")) {
    return (
      quickActionArrangementBlockMetricSnapshot(project, action, "jump") ?? {
        id: "arrangement-block-jump",
        label: "Block jump",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("arrangement-block-cue-")) {
    return (
      quickActionArrangementBlockMetricSnapshot(project, action, "cue") ?? {
        id: "arrangement-block-cue",
        label: "Block cue",
        value: action.detail
      }
    );
  }

  if (action.id === "song-form-overview-readout-action" || action.id === "song-form-priority") {
    const songFormMetric = quickActionSongFormPriorityMetricSnapshot(
      project,
      action,
      selectedArrangementIndex,
      analysis ?? undefined
    );
    if (songFormMetric) {
      return songFormMetric;
    }

    return action.id === "song-form-overview-readout-action"
      ? { id: "song-form-overview-readout", label: "Song Form Overview Readout", value: action.detail }
      : { id: "song-form-priority", label: "Song Form Priority", value: action.detail };
  }

  if (action.id === "section-locator-decision" || action.id.startsWith("section-locator-")) {
    return (
      quickActionSectionLocatorMetricSnapshot(project, action) ?? {
        id: "section-locator",
        label: "Section cue",
        value: action.detail
      }
    );
  }

  if (action.id === "key-retarget-readout-action") {
    return (
      quickActionKeyRetargetReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "key-retarget-readout",
        label: "Key Retarget",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("key-quick-")) {
    return {
      id: "key-quick",
      label: "Key retarget",
      value: `Key ${project.key} / ${projectEventTotal(project)} events / edit Pattern ${project.selectedPattern}`
    };
  }

  if (action.id === "style-direction-readout-action") {
    return (
      quickActionStyleDirectionReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "style-direction-readout",
        label: "Style Direction",
        value: action.detail
      }
    );
  }

  if (action.id === "style-inspector-focus") {
    const styleInspectorMetric = quickActionStyleInspectorMetricSnapshot(
      project,
      action,
      selectedArrangementIndex,
      analysis ?? undefined
    );
    if (styleInspectorMetric) {
      return styleInspectorMetric;
    }

    const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
    return {
      id: "style-inspector",
      label: "Style inspector",
      value: `${styleName} / ${project.bpm} BPM`
    };
  }

  if (action.id.startsWith("style-inspector-item-")) {
    const styleInspectorMetric = quickActionStyleInspectorMetricSnapshot(
      project,
      action,
      selectedArrangementIndex,
      analysis ?? undefined
    );
    if (styleInspectorMetric) {
      return styleInspectorMetric;
    }

    return {
      id: "style-inspector",
      label: "Style inspector",
      value: action.detail
    };
  }

  const styleGoalCueGoal = styleGoalCueQuickActionGoal(action.id);
  if (styleGoalCueGoal) {
    return {
      id: "style-goal-cue",
      label: "Style goal cue",
      value:
        styleGoalCueGoal === "arrange"
          ? `Song loop / ${barCountLabel(arrangementTotalBars(project))}`
          : `Loop Pattern ${project.selectedPattern} / ${styleGoalCueLabel(styleGoalCueGoal)}`
    };
  }

  if (action.id.startsWith("style-quick-")) {
    const profile = styleProfiles.find((candidate) => candidate.id === project.styleId);
    const styleName = profile?.name ?? project.styleId;
    const styleRoleSummary = profile
      ? `${bassStyleRoleLabel(profile.bassStyle)} / ${melodyStyleRoleLabel(profile.melodyStyle)}`
      : "Custom style roles";
    return {
      id: "style-quick",
      label: "Style quick pick",
      value: `${styleName} / ${project.bpm} BPM / ${percentLabel(
        project.swing
      )} swing / ${styleRoleSummary} / ${projectEventTotal(project)} events / edit Pattern ${project.selectedPattern}`
    };
  }

  if (action.id.startsWith("pattern-switch-")) {
    return (
      quickActionPatternCueSwitchMetricSnapshot(project, action, "switch", selectedArrangementIndex) ?? {
        id: "pattern-switch",
        label: "Edit pattern",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-follow-audible") {
    return (
      quickActionAudiblePatternFollowMetricSnapshot(project, action) ?? {
        id: "pattern-follow-audible",
        label: "Audible pattern",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-playback-readout-action") {
    return (
      quickActionPatternPlaybackReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-playback-readout",
        label: "Pattern Playback",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("pattern-cue-")) {
    return (
      quickActionPatternCueSwitchMetricSnapshot(project, action, "cue", selectedArrangementIndex) ?? {
        id: "pattern-cue",
        label: "Pattern cue",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-compare-decision") {
    return (
      quickActionPatternCompareDecisionMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-compare-decision",
        label: patternCompareDecisionQuickActionKind(action) === "use" ? "Pattern placement" : "Pattern cue",
        value: patternCompareDecisionQuickActionPosture(project, action, selectedArrangementIndex)
      }
    );
  }

  if (action.id === "pattern-use-readout-action") {
    return (
      quickActionPatternUseReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-use-readout",
        label: "Pattern Use Readout",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("pattern-use-")) {
    return (
      quickActionPatternUseMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-use",
        label: "Arrangement pattern",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("pattern-copy-") || action.id === "pattern-clear") {
    return (
      quickActionPatternEditMetricSnapshot(project, action) ?? {
        id: "pattern-edit",
        label: `Pattern ${project.selectedPattern}`,
        value: `${patternEventTotal(activePattern(project))} events`
      }
    );
  }

  if (action.id === "groove-compass-cue") {
    return {
      id: "groove-compass-cue",
      label: "Groove cue",
      value: `Loop Pattern ${project.selectedPattern} / ${drumHitCount(activePattern(project))} drum hits`
    };
  }

  if (action.id === "groove-compass-focus") {
    return (
      quickActionGrooveCompassMetricSnapshot(project, action) ?? {
        id: "groove-compass",
        label: "Groove compass",
        value: `Pattern ${project.selectedPattern} / ${drumHitCount(activePattern(project))} hits`
      }
    );
  }

  if (action.id.startsWith("groove-compass-card-")) {
    return (
      quickActionGrooveCompassMetricSnapshot(project, action) ?? {
        id: "groove-compass",
        label: "Groove compass",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-dna-focus") {
    return (
      quickActionPatternDnaMetricSnapshot(project, action) ?? {
        id: "pattern-dna",
        label: "Pattern DNA",
        value: `Pattern ${project.selectedPattern} / ${patternEventTotal(activePattern(project))} events`
      }
    );
  }

  if (action.id.startsWith("pattern-dna-card-")) {
    return (
      quickActionPatternDnaMetricSnapshot(project, action) ?? {
        id: "pattern-dna",
        label: "Pattern DNA",
        value: action.detail
      }
    );
  }

  if (action.id === "layer-starter") {
    const layerMetric = quickActionLayerStarterMetricSnapshot(project, action);
    if (layerMetric) {
      return layerMetric;
    }
  }

  if (action.id.startsWith("layer-starter-")) {
    const layerMetric = quickActionLayerStarterMetricSnapshot(project, action);
    if (layerMetric) {
      return layerMetric;
    }
  }

  if (action.id === "pattern-stack") {
    const stackMetric = quickActionPatternStackMetricSnapshot(project, action);
    if (stackMetric) {
      return stackMetric;
    }
  }

  if (action.id.startsWith("pattern-stack-pad-")) {
    const stackMetric = quickActionPatternStackMetricSnapshot(project, action);
    if (stackMetric) {
      return stackMetric;
    }
  }

  if (action.id === "drum-move") {
    const pattern = activePattern(project);
    return {
      id: "drum-move",
      label: "Drum move",
      value: `${drumPatternHitLabel(pattern)} / ${drumAverageTimingLabel(pattern)} / ${drumAverageVelocityLabel(pattern)}`
    };
  }

  if (action.id === "808-move") {
    const bassNotes = activePattern(project).bassNotes;
    return {
      id: "808-move",
      label: "808 move",
      value: `${bassNotes.length} notes / ${bassGlideLabel(bassNotes)} / ${bassPitchSpanLabel(bassNotes)}`
    };
  }

  if (action.id === "melody-move") {
    const melodyNotes = activePattern(project).melodyNotes;
    return {
      id: "melody-move",
      label: "Melody move",
      value: `${melodyNotes.length} notes / ${melodyRangeLabel(melodyNotes)} / ${melodyVelocityLabel(melodyNotes)}`
    };
  }

  if (action.id === "chord-move") {
    const chordEvents = activePattern(project).chordEvents;
    return {
      id: "chord-move",
      label: "Chord move",
      value: `${chordEvents.length} chords / ${chordHarmonyLabel(chordEvents)} / ${chordRhythmSummaryLabel(chordEvents)}`
    };
  }

  const soundDecisionMetric = quickActionSoundDecisionMetricSnapshot(project, action, analysis ?? undefined);
  if (soundDecisionMetric) {
    return soundDecisionMetric;
  }

  if (action.id === "beat-readiness-focus" || action.id.startsWith("beat-readiness-check-")) {
    const readinessMetric = quickActionBeatReadinessMetricSnapshot(project, action);
    if (readinessMetric) {
      return readinessMetric;
    }
  }

  if (action.id === "listening-pass-focus" || action.id.startsWith("listening-pass-checkpoint-")) {
    const listeningMetric = quickActionListeningPassMetricSnapshot(project, action);
    if (listeningMetric) {
      return listeningMetric;
    }
  }

  if (action.id === "beat-passport-focus" || action.id.startsWith("beat-passport-metric-")) {
    const passportMetric = quickActionBeatPassportMetricSnapshot(project, action);
    if (passportMetric) {
      return passportMetric;
    }
  }

  if (action.id === "production-snapshot-focus" || action.id.startsWith("production-snapshot-metric-")) {
    const productionSnapshotMetric = quickActionProductionSnapshotMetricSnapshot(project, action);
    if (productionSnapshotMetric) {
      return productionSnapshotMetric;
    }
  }

  if (action.id === "snapshot-compare-focus") {
    return {
      id: "snapshot-compare",
      label: "Snapshot compare",
      value: `${project.snapshots.length}/${maxProjectSnapshots} saved takes`
    };
  }

  if (action.id.startsWith("snapshot-compare-metric-")) {
    return {
      id: "snapshot-compare",
      label: "Snapshot compare",
      value: action.detail
    };
  }

  if (action.id === "hook-readiness-focus") {
    const exportAnalysis = analysis ?? analyzeExport(project);
    const hookSummary = createHookReadinessSummary(
      project,
      createBeatReadinessChecks(project, exportAnalysis),
      exportAnalysis,
      analyzeStemExports(project)
    );
    return {
      id: "hook-readiness",
      label: "Hook readiness",
      value: `${hookSummary.headline} / ${hookSummary.detail}`
    };
  }

  if (action.id === "hook-loop-cue" || action.id.startsWith("hook-readiness-cue-")) {
    const target = createHookLoopCueTarget(project);
    return {
      id: "hook-loop",
      label: "Hook loop",
      value: target ? hookLoopCueDetail(target) : `No Hook section / Pattern ${project.selectedPattern}`
    };
  }

  if (action.id === "hook-fix" || action.id.startsWith("hook-readiness-fix-")) {
    const exportAnalysis = analysis ?? analyzeExport(project);
    const hookSummary = createHookReadinessSummary(
      project,
      createBeatReadinessChecks(project, exportAnalysis),
      exportAnalysis,
      analyzeStemExports(project)
    );
    return {
      id: "hook-fix",
      label: "Hook fix",
      value: `${hookSummary.headline} / ${hookSummary.detail}`
    };
  }

  if (action.id === "topline-loop-cue" || action.id.startsWith("topline-space-cue-")) {
    return {
      id: "topline-loop",
      label: "Topline loop",
      value: toplineLoopCueDetail(createToplineLoopCueTarget(project))
    };
  }

  if (action.id === "topline-fix" || action.id.startsWith("topline-space-fix-")) {
    const exportAnalysis = analysis ?? analyzeExport(project);
    const toplineSummary = createToplineSpaceSummary(
      project,
      createBeatReadinessChecks(project, exportAnalysis),
      exportAnalysis,
      analyzeStemExports(project)
    );
    return {
      id: "topline-fix",
      label: "Topline fix",
      value: `${toplineSummary.headline} / ${toplineSummary.detail}`
    };
  }

  if (action.id.startsWith("hook-readiness-card-")) {
    return {
      id: "hook-readiness",
      label: "Hook readiness",
      value: action.detail
    };
  }

  if (action.id === "topline-space-focus") {
    const exportAnalysis = analysis ?? analyzeExport(project);
    const toplineSummary = createToplineSpaceSummary(
      project,
      createBeatReadinessChecks(project, exportAnalysis),
      exportAnalysis,
      analyzeStemExports(project)
    );
    return {
      id: "topline-space",
      label: "Topline space",
      value: `${toplineSummary.headline} / ${toplineSummary.detail}`
    };
  }

  if (action.id.startsWith("topline-space-card-")) {
    return {
      id: "topline-space",
      label: "Topline space",
      value: action.detail
    };
  }

  if (action.id === "arrangement-mute-map-readout-action" || action.id === "arrangement-mute-map-focus") {
    const muteMapMetric = quickActionArrangementMuteMapMetricSnapshot(
      project,
      action,
      selectedArrangementIndex,
      analysis ?? undefined
    );
    if (muteMapMetric) {
      return muteMapMetric;
    }

    const summary = createArrangementMuteMapSummary(project);
    return action.id === "arrangement-mute-map-readout-action"
      ? {
          id: "arrangement-mute-map-readout",
          label: "Mute map readout",
          value: `${summary.headline} / ${summary.detail}`
        }
      : {
          id: "arrangement-mute-map",
          label: "Mute map",
          value: `${summary.headline} / ${summary.detail}`
        };
  }

  if (action.id.startsWith("arrangement-mute-map-lane-")) {
    const muteMapMetric = quickActionArrangementMuteMapMetricSnapshot(
      project,
      action,
      selectedArrangementIndex,
      analysis ?? undefined
    );
    if (muteMapMetric) {
      return muteMapMetric;
    }

    return {
      id: "arrangement-mute-map",
      label: "Mute map",
      value: action.detail
    };
  }

  if (action.id === "arrangement-transition-map-readout-action" || action.id === "arrangement-transition-map-focus") {
    const transitionMetric = quickActionArrangementTransitionMapMetricSnapshot(
      project,
      action,
      selectedArrangementIndex,
      analysis ?? undefined
    );
    if (transitionMetric) {
      return transitionMetric;
    }

    const summary = createArrangementTransitionMapSummary(project);
    return action.id === "arrangement-transition-map-readout-action"
      ? {
          id: "arrangement-transition-map-readout",
          label: "Transition map readout",
          value: `${summary.headline} / ${summary.detail}`
        }
      : {
          id: "arrangement-transition-map",
          label: "Transition map",
          value: `${summary.headline} / ${summary.detail}`
        };
  }

  if (action.id.startsWith("arrangement-transition-map-transition-")) {
    const transitionMetric = quickActionArrangementTransitionMapMetricSnapshot(
      project,
      action,
      selectedArrangementIndex,
      analysis ?? undefined
    );
    if (transitionMetric) {
      return transitionMetric;
    }

    return {
      id: "arrangement-transition-map",
      label: "Transition map",
      value: action.detail
    };
  }

  if (action.id === "transition-loop-cue" || action.id.startsWith("transition-loop-cue-")) {
    const transitionLoopMetric = quickActionTransitionLoopMetricSnapshot(
      project,
      action,
      selectedArrangementIndex,
      analysis ?? undefined
    );
    if (transitionLoopMetric) {
      return transitionLoopMetric;
    }

    return {
      id: "transition-loop",
      label: "Transition loop",
      value: action.detail
    };
  }

  if (action.id === "handoff-pack") {
    const handoffPackMetric = quickActionHandoffPackMetricSnapshot(
      project,
      action,
      handoffExportReceipt,
      analysis ?? undefined
    );
    if (handoffPackMetric) {
      return handoffPackMetric;
    }

    return {
      id: "handoff-pack",
      label: "Handoff Pack",
      value: action.detail
    };
  }

  if (action.id === "handoff-package-check-focus" || action.id.startsWith("handoff-package-check-card-")) {
    const handoffPackageMetric = quickActionHandoffPackageCheckMetricSnapshot(
      project,
      action,
      handoffExportReceipt,
      analysis ?? undefined
    );
    if (handoffPackageMetric) {
      return handoffPackageMetric;
    }

    return {
      id: "handoff-package-check",
      label: "Handoff package",
      value: action.detail
    };
  }

  if (action.id === "handoff-export-receipt-focus") {
    const handoffReceiptMetric = quickActionHandoffExportReceiptMetricSnapshot(
      project,
      action,
      handoffExportReceipt,
      analysis ?? undefined
    );
    if (handoffReceiptMetric) {
      return handoffReceiptMetric;
    }

    return {
      id: "handoff-export-receipt",
      label: "Handoff receipt",
      value: action.detail
    };
  }

  if (action.id === "handoff-send-order-focus") {
    const handoffSendOrderMetric = quickActionHandoffSendOrderMetricSnapshot(
      project,
      action,
      handoffExportReceipt,
      analysis ?? undefined
    );
    if (handoffSendOrderMetric) {
      return handoffSendOrderMetric;
    }

    return {
      id: "handoff-send-order",
      label: "Handoff send order",
      value: action.detail
    };
  }

  if (action.id === "handoff-manifest-audit-focus") {
    const handoffManifestMetric = quickActionHandoffManifestAuditMetricSnapshot(
      project,
      action,
      handoffExportReceipt,
      analysis ?? undefined
    );
    if (handoffManifestMetric) {
      return handoffManifestMetric;
    }

    return {
      id: "handoff-manifest-audit",
      label: "Handoff manifest",
      value: action.detail
    };
  }

  if (action.id === "handoff-export-format-focus" || action.id.startsWith("handoff-export-format-")) {
    const handoffExportFormatMetric = quickActionHandoffExportFormatMetricSnapshot(project, action, analysis ?? undefined);
    if (handoffExportFormatMetric) {
      return handoffExportFormatMetric;
    }

    return {
      id: "handoff-export-format",
      label: "Export format",
      value: action.detail
    };
  }

  if (action.id === "finish-checklist-focus" || action.id.startsWith("finish-checklist-card-")) {
    const finishChecklistMetric = quickActionFinishChecklistMetricSnapshot(project, action);
    if (finishChecklistMetric) {
      return finishChecklistMetric;
    }
  }

  if (action.id === "review-queue-focus" || action.id.startsWith("review-queue-item-")) {
    const reviewQueueMetric = quickActionReviewQueueMetricSnapshot(project, action, analysis ?? undefined);
    if (reviewQueueMetric) {
      return reviewQueueMetric;
    }
  }

  if (action.id === "review-fix" || action.id.startsWith("review-queue-fix-")) {
    const reviewFixMetric = quickActionReviewFixMetricSnapshot(project, action, analysis ?? undefined);
    if (reviewFixMetric) {
      return reviewFixMetric;
    }
  }

  if (action.id === "export-preflight-focus" || action.id.startsWith("export-preflight-card-")) {
    const exportPreflightMetric = quickActionExportPreflightMetricSnapshot(project, action, analysis ?? undefined);
    if (exportPreflightMetric) {
      return exportPreflightMetric;
    }
  }

  const directExportTarget = directExportQuickActionTarget(action.id);
  if (directExportTarget) {
    const exportAnalysis = analysis ?? analyzeExport(project);
    const directExportMetric = quickActionDirectExportMetricSnapshot(
      project,
      action,
      handoffExportReceipt,
      exportAnalysis
    );
    if (directExportMetric) {
      return directExportMetric;
    }

    return {
      id: directExportTarget.metricId,
      label: directExportTarget.label,
      value: directExportQuickActionPosture(project, directExportTarget, exportAnalysis)
    };
  }

  if (action.id === "handoff-next-export") {
    const exportAnalysis = analysis ?? analyzeExport(project);
    const handoffNextExportMetric = quickActionHandoffNextExportMetricSnapshot(
      project,
      action,
      handoffExportReceipt,
      exportAnalysis
    );
    if (handoffNextExportMetric) {
      return handoffNextExportMetric;
    }

    const stemCount = audibleStemTracks(analyzeStemExports(project)).length;
    return {
      id: "handoff",
      label: "Handoff",
      value: `${exportAnalysis.status} / ${stemCount}/${stemTrackIds.length} stems / ${sessionBriefFilledFields(project.sessionBrief)}/4 brief`
    };
  }

  if (action.id === "workflow-spotlight-focus") {
    const workflowSpotlightMetric = quickActionWorkflowSpotlightMetricSnapshot(project, action, analysis ?? undefined);
    if (workflowSpotlightMetric) {
      return workflowSpotlightMetric;
    }

    return {
      id: "workflow-spotlight",
      label: "Workflow spotlight",
      value: `${project.selectedPattern} / ${barCountLabel(arrangementTotalBars(project))}`
    };
  }

  if (action.id.startsWith("workflow-navigator-")) {
    const workflowNavigatorMetric = quickActionWorkflowNavigatorMetricSnapshot(project, action, analysis ?? undefined);
    if (workflowNavigatorMetric) {
      return workflowNavigatorMetric;
    }

    return {
      id: "workflow-navigator",
      label: "Workflow navigator",
      value: action.detail
    };
  }

  if (action.id.startsWith("pattern-clone-")) {
    return (
      quickActionPatternCloneMetricSnapshot(project, action) ?? {
        id: "pattern-clone",
        label: `Pattern ${project.selectedPattern}`,
        value: `${patternEventTotal(activePattern(project))} events`
      }
    );
  }

  if (action.id.startsWith("pattern-variation-")) {
    return (
      quickActionPatternVariationMetricSnapshot(project, action) ?? {
        id: "pattern-variation",
        label: `Pattern ${project.selectedPattern}`,
        value: `${patternEventTotal(activePattern(project))} events`
      }
    );
  }

  if (action.id.startsWith("fill-")) {
    return (
      quickActionPatternFillMetricSnapshot(project, action) ?? {
        id: "pattern-events",
        label: `Pattern ${project.selectedPattern}`,
        value: `${patternEventTotal(activePattern(project))} events`
      }
    );
  }

  if (
    action.id === "arrangement-move-readout-action" ||
    action.id === "arrangement-move" ||
    action.id === "arrangement-move-decision"
  ) {
    return (
      quickActionArrangementMoveMetricSnapshot(project, action) ?? {
        id: "arrangement-move",
        label: "Arrangement move",
        value: `${Math.round(arrangementAverageEnergy(project) * 100)}% avg`
      }
    );
  }

  if (action.id.startsWith("selected-block-")) {
    return (
      quickActionSelectedBlockMetricSnapshot(project, action) ?? {
        id: "selected-block",
        label: "Selected block",
        value: `${project.arrangement.length} blocks / ${barCountLabel(arrangementTotalBars(project))}`
      }
    );
  }

  if (
    action.id === "arrangement-focus-readout-action" ||
    action.id === "arrangement-focus" ||
    action.id === "arrangement-focus-decision" ||
    action.id.startsWith("arrangement-focus-preset-")
  ) {
    return (
      quickActionArrangementFocusMetricSnapshot(project, action) ?? {
        id: "arrangement-focus",
        label: "Arrangement focus",
        value: `${barCountLabel(arrangementTotalBars(project))} / ${Math.round(arrangementAverageEnergy(project) * 100)}% avg`
      }
    );
  }

  if (
    action.id === "arrangement-arc-readout-action" ||
    action.id === "arrangement-arc" ||
    action.id === "arrangement-arc-decision" ||
    action.id.startsWith("arrangement-arc-pad-")
  ) {
    return (
      quickActionArrangementArcMetricSnapshot(project, action) ?? {
        id: "song-arc",
        label: "Song arc",
        value: `${barCountLabel(arrangementTotalBars(project))} / ${Math.round(arrangementAverageEnergy(project) * 100)}% avg`
      }
    );
  }

  const mixBalanceMetric = quickActionMixBalanceMetricSnapshot(project, action, analysis ?? undefined);
  if (mixBalanceMetric) {
    return mixBalanceMetric;
  }

  if (action.id === "mix-coach-focus" || action.id.startsWith("mix-coach-check-")) {
    const checks = createMixCoachChecks(analysis ?? analyzeExport(project), analyzeStemExports(project));
    const reviewCount = checks.filter((check) => check.tone !== "good").length;
    return {
      id: "mix-coach",
      label: "Mix Coach",
      value: reviewCount === 0 ? "Clear" : `${reviewCount} check${reviewCount === 1 ? "" : "s"}`
    };
  }

  const stemAuditionMetric = quickActionStemAuditionMetricSnapshot(project, action, analysis ?? undefined);
  if (stemAuditionMetric) {
    return stemAuditionMetric;
  }

  const mixSnapshotMetric = quickActionMixSnapshotMetricSnapshot(project, action, analysis ?? undefined);
  if (mixSnapshotMetric) {
    return mixSnapshotMetric;
  }

  const soundSnapshotTarget = soundSnapshotQuickActionTarget(action.id);
  if (soundSnapshotTarget) {
    if (soundSnapshotTarget.id === "readout") {
      return {
        id: soundSnapshotTarget.metricId,
        label: soundSnapshotTarget.label,
        value: quickActionSoundMetricValue(
          project,
          action,
          analysis ?? undefined,
          [
            quickActionSoundActionLabel(action),
            `recommendation ${quickActionSoundDecisionContextLabel(action, "Sound Snapshot A/B readout")}`,
            `current pass ${soundSnapshotQuickActionPosture(project.sound)}`
          ],
          quickActionSoundDecisionNextCheck(action)
        )
      };
    }

    return {
      id: soundSnapshotTarget.metricId,
      label: soundSnapshotTarget.label,
      value: soundSnapshotTarget.id === "clear" ? "Slots cleared / ready to recapture" : soundSnapshotQuickActionPosture(project.sound)
    };
  }

  const mixFixPreset = mixFixQuickActionPreset(action.id);
  if (mixFixPreset) {
    switch (mixFixPreset) {
      case "headroom": {
        const exportAnalysis = analysis ?? analyzeExport(project);
        return {
          id: "mix-fix-headroom",
          label: "Mix Fix Headroom",
          value: mixFixHeadroomPosture(exportAnalysis)
        };
      }
      case "stem_balance":
        return {
          id: "mix-fix-stem-balance",
          label: "Mix Fix Stem Balance",
          value: mixFixStemPosture(analyzeStemExports(project))
        };
      case "low_end":
        return {
          id: "mix-fix-low-end",
          label: "Mix Fix Low End",
          value: mixFixLowEndPosture(analyzeStemExports(project))
        };
    }
  }

  const masterFinishPad = masterFinishQuickActionPad(action.id);
  const masterFinishMetric = quickActionMasterFinishMetricSnapshot(project, action, masterFinishPad, analysis ?? undefined);
  if (masterFinishMetric) {
    return masterFinishMetric;
  }

  if (action.id === "master-output-role") {
    const exportAnalysis = analysis ?? analyzeExport(project);
    const summary = createMasterOutputRoleSummary(project, exportAnalysis);
    return {
      id: "master-output-role",
      label: "Master Output Role",
      value: `${summary.roleLabel} / ${summary.statusLabel} / ${summary.levelLabel} / ${summary.detailLabel}`
    };
  }

  if (action.id === "export-meter") {
    const exportAnalysis = analysis ?? analyzeExport(project);
    const limitedLabel =
      exportAnalysis.limitedSamples > 0 ? `limiter ${formatPercent(exportAnalysis.limitedPercent)}` : "limiter clear";
    return {
      id: "export-meter",
      label: "Export Meter",
      value: `${exportAnalysis.status} / ${formatDb(exportAnalysis.peakDb)} peak / ${formatDb(
        exportAnalysis.rmsDb
      )} RMS / ${formatDb(exportDynamicsDb(exportAnalysis))} dynamics / ${formatDb(
        exportAnalysis.headroomDb
      )} headroom / ${limitedLabel} / ${formatDb(project.masterCeilingDb)} ceiling / ${formatExportDuration(
        exportAnalysis.durationSeconds
      )}`
    };
  }

  const masterAutomationPad = masterAutomationQuickActionPad(action.id);
  const masterAutomationMetric = quickActionMasterAutomationMetricSnapshot(project, action, masterAutomationPad, analysis ?? undefined);
  if (masterAutomationMetric) {
    return masterAutomationMetric;
  }

  const spaceFxMetric = quickActionSpaceFxMetricSnapshot(project, action, analysis ?? undefined);
  if (spaceFxMetric) {
    return spaceFxMetric;
  }

  if (action.id.startsWith("pattern-chain-") || action.id === "chain-expand-readout-action" || action.id === "chain-expand") {
    return (
      quickActionPatternChainMetricSnapshot(project, action) ?? {
        id: "song-length",
        label: "Song length",
        value: barCountLabel(arrangementTotalBars(project))
      }
    );
  }

  if (
    action.id === "arrangement-template-readout-action" ||
    action.id === "arrangement-template-decision" ||
    action.id === "arrangement-template" ||
    action.id.startsWith("arrangement-template-direct-")
  ) {
    return (
      quickActionArrangementTemplateMetricSnapshot(project, action) ?? {
        id: "song-length",
        label: "Song length",
        value: barCountLabel(arrangementTotalBars(project))
      }
    );
  }

  if (action.id.startsWith("mix-") || action.id.startsWith("master-finish-") || action.id.startsWith("master-automation-")) {
    return {
      id: "mix-posture",
      label: "Mix posture",
      value: `${project.masterPreset} / ${analysis ? formatDb(analysis.headroomDb) : formatDb(project.masterCeilingDb)}`
    };
  }

  if (action.group === "Export") {
    return {
      id: "export",
      label: "Export scan",
      value: analysis ? `${analysis.status} / ${formatDb(analysis.headroomDb)}` : "n/a"
    };
  }

  if (action.group === "Transport") {
    return {
      id: "transport",
      label: "Audition scope",
      value: `${project.selectedPattern} / ${barCountLabel(arrangementTotalBars(project))}`
    };
  }

  if (action.group === "Edit") {
    return { id: "project-events", label: "Project events", value: `${projectEventTotal(project)} events` };
  }

  if (action.group === "Project") {
    return { id: "project", label: "Project", value: `${project.title} / ${project.snapshots.length} slots` };
  }

  return { id: "project-events", label: "Project events", value: `${projectEventTotal(project)} events` };
}

export function quickActionBeatBlueprintMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const applyBlueprint = beatBlueprintForApplyQuickAction(project, action);
  if (applyBlueprint) {
    return {
      id: "blueprint-starter",
      label: "Blueprint starter",
      value: `${applyBlueprint.name} / ${beatBlueprintStyleLabel(project)} / ${project.key} / ${project.bpm} BPM / ${barCountLabel(
        arrangementTotalBars(project)
      )} / ${projectEventTotal(project)} events / edit Pattern ${project.selectedPattern}`
    };
  }

  const previewMetric = quickActionBeatBlueprintPreviewMetricSnapshot(project, action, analysis);
  if (previewMetric) {
    return previewMetric;
  }

  return null;
}

export function beatBlueprintForApplyQuickAction(project: ProjectState, action: QuickAction): BeatBlueprint | null {
  if (action.id === "blueprint" || action.id === "blueprint-style-match") {
    const blueprintId = suggestedBlueprintId(project);
    return beatBlueprints.find((candidate) => candidate.id === blueprintId) ?? null;
  }

  if (action.id.startsWith("blueprint-apply-")) {
    const blueprintId = action.id.slice("blueprint-apply-".length);
    return beatBlueprints.find((candidate) => candidate.id === blueprintId) ?? null;
  }

  return null;
}

export function beatBlueprintForPreviewQuickAction(project: ProjectState, action: QuickAction): BeatBlueprint | null {
  if (action.id === "blueprint-preview-style-match") {
    const blueprintId = suggestedBlueprintId(project);
    return beatBlueprints.find((candidate) => candidate.id === blueprintId) ?? null;
  }

  if (
    action.id.startsWith("blueprint-preview-") &&
    action.id !== "blueprint-preview-cue" &&
    action.id !== "blueprint-preview-decision"
  ) {
    const blueprintId = action.id.slice("blueprint-preview-".length);
    return beatBlueprints.find((candidate) => candidate.id === blueprintId) ?? null;
  }

  return null;
}

export function quickActionBeatBlueprintPreviewMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const previewBlueprint = beatBlueprintForPreviewMetricQuickAction(project, action);
  if (!previewBlueprint) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const styleMatchBlueprint =
    beatBlueprints.find((candidate) => candidate.id === suggestedBlueprintId(project)) ?? previewBlueprint;
  const previewSummary = createBeatBlueprintPreviewSummary(project, previewBlueprint);
  const styleMatchSummary = createBeatBlueprintPreviewSummary(project, styleMatchBlueprint);
  const styleMatchPreviewed = previewSummary.blueprintId === styleMatchSummary.blueprintId;
  const previewDecision = createBeatBlueprintPreviewDecision(previewSummary, styleMatchSummary, styleMatchPreviewed);
  const previewCue = createBeatBlueprintPreviewCue(previewSummary, styleMatchSummary, styleMatchPreviewed);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const styleName = styleProfiles.find((profile) => profile.id === previewBlueprint.styleId)?.name ?? previewBlueprint.styleId;
  const changedCount = previewSummary.metrics.filter((metric) => metric.status === "Change").length;
  const postureLabel = previewSummary.metrics.map((metric) => `${metric.label} ${metric.value}`).join(" / ");

  return {
    id: "blueprint-preview",
    label: "Blueprint preview",
    value: [
      quickActionBeatBlueprintPreviewActionLabel(action),
      `blueprint ${previewSummary.name}`,
      `context ${quickActionBeatBlueprintPreviewContextLabel(action, previewSummary, previewDecision, previewCue)}`,
      `cue ${previewCue.actionLabel} ${previewCue.actionLoopScope}`,
      `starter ${styleName} / ${previewBlueprint.key} / ${previewBlueprint.bpm} BPM / ${arrangementTemplateLabel(
        previewBlueprint.arrangementTemplate
      )}`,
      `sound ${soundPresetLabel(previewBlueprint.soundPreset)}`,
      `master ${previewBlueprint.masterPreset}`,
      `posture ${postureLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `${changedCount} preview change${changedCount === 1 ? "" : "s"}`,
      `next ${quickActionBeatBlueprintPreviewNextCheck(action, previewDecision, previewCue)}`
    ].join(" / ")
  };
}

export function beatBlueprintForPreviewMetricQuickAction(project: ProjectState, action: QuickAction): BeatBlueprint | null {
  const directPreviewBlueprint = beatBlueprintForPreviewQuickAction(project, action);
  if (directPreviewBlueprint) {
    return directPreviewBlueprint;
  }

  if (action.id !== "blueprint-preview-cue" && action.id !== "blueprint-preview-decision") {
    return null;
  }

  return (
    beatBlueprintFromQuickActionText(action) ??
    beatBlueprints.find((candidate) => candidate.id === suggestedBlueprintId(project)) ??
    null
  );
}

export function beatBlueprintFromQuickActionText(action: QuickAction): BeatBlueprint | null {
  const text = `${action.title} ${action.detail} ${action.keywords}`;
  return (
    beatBlueprints.find((blueprint) => text.includes(blueprint.id)) ??
    beatBlueprints.find((blueprint) => text.includes(blueprint.name)) ??
    null
  );
}

export function quickActionBeatBlueprintPreviewActionLabel(action: QuickAction): string {
  if (action.id === "blueprint-preview-style-match") {
    return "preview current style starter";
  }

  if (action.id === "blueprint-preview-cue") {
    return "cue blueprint preview";
  }

  if (action.id === "blueprint-preview-decision") {
    return action.title.startsWith("Apply Preview") ? "apply preview decision" : "compare style-match decision";
  }

  if (action.id.startsWith("blueprint-preview-")) {
    return "preview direct blueprint";
  }

  return "preview blueprint";
}

export function quickActionBeatBlueprintPreviewContextLabel(
  action: QuickAction,
  previewSummary: BeatBlueprintPreviewSummary,
  previewDecision: BeatBlueprintPreviewDecision,
  previewCue: BeatBlueprintPreviewCue
): string {
  if (action.id === "blueprint-preview-decision") {
    const detailParts = quickActionBeatBlueprintPreviewDetailParts(action);
    const explicitContext = detailParts.join(" / ");
    return explicitContext || `${previewDecision.statusLabel} / ${previewDecision.metricLabel} / ${previewDecision.detailLabel} / action ${previewDecision.actionLabel}`;
  }

  if (action.id === "blueprint-preview-cue") {
    return `${previewCue.statusLabel} / ${previewCue.cueLabel} / ${previewCue.detailLabel}`;
  }

  const detailParts = quickActionBeatBlueprintPreviewDetailParts(action);
  const explicitPosture = detailParts.slice(0, 6).join(" / ");
  return explicitPosture || `${previewSummary.statusLabel} / ${previewSummary.detailLabel}`;
}

export function quickActionBeatBlueprintPreviewNextCheck(
  action: QuickAction,
  previewDecision: BeatBlueprintPreviewDecision,
  previewCue: BeatBlueprintPreviewCue
): string {
  if (action.id === "blueprint-preview-cue") {
    return previewCue.nextCheckLabel;
  }

  if (action.id === "blueprint-preview-decision") {
    if (action.title.startsWith("Apply Preview")) {
      return "loop the applied starter, then continue editing musical events";
    }

    const detailParts = quickActionBeatBlueprintPreviewDetailParts(action);
    const actionTarget = detailParts[detailParts.length - 1] ?? previewDecision.actionLabel;
    return `${actionTarget} before Apply`;
  }

  return "apply only after style, key, BPM, arrangement, sound, and master fit the session";
}

export function quickActionBeatBlueprintPreviewDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionSoundDecisionMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id === "timbre-check") {
    return quickActionTimbreCheckMetricSnapshot(project, action, analysis);
  }

  if (action.id === "studio-tone-baseline" || action.id === "studio-tone-drift" || action.id.startsWith("studio-tone-reset-")) {
    return quickActionStudioToneMetricSnapshot(project, action, analysis);
  }

  if (
    action.id === "sound-preset-readout-action" ||
    action.id === "sound-preset-decision" ||
    action.id === "sound-preset" ||
    action.id.startsWith("sound-preset-pad-")
  ) {
    return quickActionSoundPresetMetricSnapshot(project, action, analysis);
  }

  if (
    action.id === "drum-kit-readout-action" ||
    action.id === "drum-kit-decision" ||
    action.id === "drum-kit" ||
    action.id.startsWith("drum-kit-pad-")
  ) {
    return quickActionDrumKitMetricSnapshot(project, action, analysis);
  }

  if (
    action.id === "sound-focus-readout-action" ||
    action.id === "sound-focus-decision" ||
    action.id === "sound-focus" ||
    action.id.startsWith("sound-focus-pad-")
  ) {
    return quickActionSoundFocusMetricSnapshot(project, action, analysis);
  }

  return null;
}

export function quickActionSoundPresetMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id === "sound-preset-readout-action") {
    const target = quickActionSoundPresetTarget(project, action) ?? defaultSoundPresetPreview(project);
    const summary = createSoundPresetPreviewSummary(project.sound, target);
    return {
      id: "sound-preset-readout",
      label: "Sound Preset Readout",
      value: quickActionSoundMetricValue(project, action, analysis, [
        quickActionSoundActionLabel(action),
        `preview ${summary.presetLabel}`,
        `status ${summary.statusLabel}`,
        `target ${summary.toneLabel}`,
        `moves ${summary.changeLabel}`
      ])
    };
  }

  const target = quickActionSoundPresetTarget(project, action);
  if (!target) {
    return null;
  }

  const summary = createSoundPresetPreviewSummary(project.sound, target);
  return {
    id: action.id === "sound-preset-decision" ? "sound-preset-decision" : "sound-preset",
    label: action.id === "sound-preset-decision" ? "Sound Preset Decision" : "Sound preset",
    value: quickActionSoundMetricValue(project, action, analysis, [
      quickActionSoundActionLabel(action),
      `target ${summary.presetLabel}`,
      `status ${summary.statusLabel}`,
      `context ${quickActionSoundDecisionContextLabel(action, summary.detailTitle)}`,
      `preview ${summary.toneLabel}`,
      `moves ${summary.changeLabel}`
    ])
  };
}

export function quickActionDrumKitMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const pad = quickActionDrumKitPadOption(project, action);
  if (!pad) {
    return null;
  }

  if (action.id === "drum-kit-readout-action") {
    return {
      id: "drum-kit-readout",
      label: "Drum Kit Readout",
      value: quickActionSoundMetricValue(project, action, analysis, [
        quickActionSoundActionLabel(action),
        `preview ${pad.label} kit`,
        `status ${pad.changedCount === 0 ? "Kit aligned" : "Suggested kit"}`,
        `drums ${drumKitPreviewDrumLabel(pad)}`,
        `rack ${drumKitPreviewRackLabel(pad)}`,
        `moves ${pad.changedCount} kit move${pad.changedCount === 1 ? "" : "s"}`
      ])
    };
  }

  return {
    id: action.id === "drum-kit-decision" ? "drum-kit-decision" : "drum-kit",
    label: action.id === "drum-kit-decision" ? "Drum Kit Decision" : "Drum kit",
    value: quickActionSoundMetricValue(project, action, analysis, [
      quickActionSoundActionLabel(action),
      `target ${pad.label} kit`,
      `status ${pad.changedCount === 0 ? "Kit aligned" : "Suggested kit"}`,
      `context ${quickActionSoundDecisionContextLabel(action, pad.detail)}`,
      `drums ${drumKitPreviewDrumLabel(pad)}`,
      `rack ${drumKitPreviewRackLabel(pad)}`,
      `moves ${pad.changedCount} kit move${pad.changedCount === 1 ? "" : "s"}`
    ])
  };
}

export function quickActionSoundFocusMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const pad = quickActionSoundFocusPadOption(project, action);
  if (!pad) {
    return null;
  }

  const changedParameters = soundFocusChangedParameters(project.sound, pad);
  const changedLabel = soundFocusChangedParameterLabel(changedParameters);
  if (action.id === "sound-focus-readout-action") {
    return {
      id: "sound-focus-readout",
      label: "Sound Focus Readout",
      value: quickActionSoundMetricValue(project, action, analysis, [
        quickActionSoundActionLabel(action),
        `preview ${pad.label} focus`,
        `status ${pad.changedCount === 0 ? "Sound aligned" : "Suggested focus"}`,
        `focus ${pad.detail} tone posture`,
        `parameters ${soundFocusPreviewParameterLabel(pad)}`,
        `moves ${pad.changedCount} tone move${pad.changedCount === 1 ? "" : "s"} / ${changedLabel}`
      ])
    };
  }

  return {
    id: action.id === "sound-focus-decision" ? "sound-focus-decision" : "sound-focus",
    label: action.id === "sound-focus-decision" ? "Sound Focus Decision" : "Sound focus",
    value: quickActionSoundMetricValue(project, action, analysis, [
      quickActionSoundActionLabel(action),
      `target ${pad.label} focus`,
      `status ${pad.changedCount === 0 ? "Sound aligned" : "Suggested focus"}`,
      `context ${quickActionSoundDecisionContextLabel(action, pad.detail)}`,
      `focus ${pad.detail} tone posture`,
      `parameters ${soundFocusPreviewParameterLabel(pad)}`,
      `moves ${pad.changedCount} tone move${pad.changedCount === 1 ? "" : "s"} / ${changedLabel}`
    ])
  };
}

export function quickActionTimbreCheckMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } {
  const timbre = createSoundTimbreCheckSummary(project.sound);
  return {
    id: "timbre-check",
    label: "Timbre Check",
    value: quickActionSoundMetricValue(project, action, analysis, [
      quickActionSoundActionLabel(action),
      `check ${timbre.statusLabel}`,
      `context ${quickActionSoundDecisionContextLabel(action, timbre.detailTitle)}`,
      `balance ${timbre.headline} / ${timbre.balanceLabel} / ${timbre.detail}`,
      `timbre ${timbre.metrics.map((metric) => `${metric.label} ${metric.value}`).join(" / ")}`
    ], timbre.nextCheck)
  };
}

export function quickActionStudioToneMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } {
  const detailParts = quickActionSoundDecisionDetailParts(action);
  return {
    id: action.id === "studio-tone-baseline" ? "studio-tone-baseline" : "studio-tone-drift",
    label: action.id === "studio-tone-baseline" ? "Studio Tone Baseline" : "Studio Tone Drift",
    value: quickActionSoundMetricValue(project, action, analysis, [
      quickActionSoundActionLabel(action),
      `context ${detailParts.join(" / ") || action.title}`,
      `manual tone ${quickActionSoundDesignPosture(project.sound)}`
    ], quickActionSoundDecisionNextCheck(action))
  };
}

export function quickActionSoundMetricValue(
  project: ProjectState,
  action: QuickAction,
  analysis: ExportAnalysis | undefined,
  parts: string[],
  nextCheck = quickActionSoundDecisionNextCheck(action)
): string {
  return [
    ...parts,
    `current ${soundPresetLabel(project.sound.preset)} / ${quickActionSoundDesignPosture(project.sound)}`,
    ...quickActionSoundProjectMetricParts(project, analysis),
    `next ${nextCheck}`
  ].join(" / ");
}

export function quickActionSoundProjectMetricParts(project: ProjectState, analysis?: ExportAnalysis): string[] {
  const exportAnalysis = analysis ?? analyzeExport(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;

  return [
    `Pattern ${project.selectedPattern}`,
    `${drumHitCount(pattern)} drum hits`,
    `${pattern.bassNotes.length} 808`,
    `${pattern.melodyNotes.length} synth`,
    `${pattern.chordEvents.length} chords`,
    `${patternEventTotal(pattern)} editable events`,
    patternUseLabel,
    `${project.arrangement.length} blocks`,
    barCountLabel(arrangementTotalBars(project)),
    `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`
  ];
}

export function quickActionSoundDesignPosture(sound: SoundDesign): string {
  return [
    `drums ${soundFocusDrumLabel(sound)}`,
    `808 ${soundFocusBassLabel(sound)}`,
    `duck ${soundFocusDuckLabel(sound)}`,
    `synth ${soundFocusSynthLabel(sound)}`,
    `chords ${soundFocusChordLabel(sound)}`
  ].join(" / ");
}

export function quickActionSoundDecisionContextLabel(action: QuickAction, fallback: string): string {
  return quickActionSoundDecisionDetailParts(action).join(" / ") || fallback;
}

export function quickActionSoundDecisionDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionSoundDecisionNextCheck(action: QuickAction): string {
  if (action.id === "sound-preset-readout-action") {
    return "loop drums, 808, Synth, and Chords before applying a full-tone preset or trimming sound controls manually";
  }

  if (action.id === "sound-preset-decision" || action.id === "sound-preset" || action.id.startsWith("sound-preset-pad-")) {
    return "loop drums, 808, Synth, and Chords together before trimming with Sound Focus or Studio controls";
  }

  if (action.id === "drum-kit-readout-action") {
    return "loop kick, clap, hat, and 808 before applying a built-in kit or trimming drum rack controls manually";
  }

  if (action.id === "drum-kit-decision" || action.id === "drum-kit" || action.id.startsWith("drum-kit-pad-")) {
    return "loop kick, clap, hat, and 808 balance before changing another kit or drum rack control";
  }

  if (action.id === "sound-focus-readout-action") {
    return "loop the focused 808, Synth, or Chords tone against the full Pattern before applying a focus pad manually";
  }

  if (action.id === "sound-snapshot-readout-action") {
    return "loop Pattern A/B/C and compare the visible A/B tone-pass state before capturing, recalling, or clearing a Sound Snapshot";
  }

  if (action.id === "sound-focus-decision" || action.id === "sound-focus" || action.id.startsWith("sound-focus-pad-")) {
    return "loop the focused tone against the full Pattern before changing another focus lane";
  }

  if (action.id === "studio-tone-baseline") {
    return "adjust one Studio tone control, then use Studio Tone Drift or Sound Snapshot A/B to compare the move";
  }

  if (action.id === "studio-tone-drift" || action.id.startsWith("studio-tone-reset-")) {
    return "loop drums, 808, Synth, and Chords before capturing a new Studio Tone baseline";
  }

  return "inspect Timbre Check before changing preset, kit, focus, or Studio tone controls";
}

export function quickActionSoundActionLabel(action: QuickAction): string {
  if (action.id === "sound-preset-readout-action") {
    return "review sound preset readout";
  }
  if (action.id === "sound-preset-decision") {
    return "run sound preset decision";
  }
  if (action.id === "sound-preset") {
    return "apply current sound preset";
  }
  if (action.id.startsWith("sound-preset-pad-")) {
    return "apply direct sound preset";
  }
  if (action.id === "drum-kit-readout-action") {
    return "review drum kit readout";
  }
  if (action.id === "drum-kit-decision") {
    return "run drum kit decision";
  }
  if (action.id === "drum-kit") {
    return "apply current drum kit";
  }
  if (action.id.startsWith("drum-kit-pad-")) {
    return "apply direct drum kit";
  }
  if (action.id === "sound-snapshot-readout-action") {
    return "review sound snapshot readout";
  }
  if (action.id === "sound-focus-readout-action") {
    return "review sound focus readout";
  }
  if (action.id === "sound-focus-decision") {
    return "run sound focus decision";
  }
  if (action.id === "sound-focus") {
    return "apply current sound focus";
  }
  if (action.id.startsWith("sound-focus-pad-")) {
    return "apply direct sound focus";
  }
  if (action.id === "timbre-check") {
    return "check timbre balance";
  }
  if (action.id === "studio-tone-baseline") {
    return "capture Studio Tone baseline";
  }
  if (action.id === "studio-tone-drift") {
    return "reset largest Studio Tone drift";
  }
  if (action.id.startsWith("studio-tone-reset-")) {
    return "reset Studio Tone control";
  }
  return "run sound action";
}

export function quickActionSoundPresetTarget(project: ProjectState, action: QuickAction): SoundPresetTarget | null {
  const directTarget = soundPresetTargetFromQuickActionId(action.id);
  if (directTarget) {
    return directTarget;
  }

  if (action.id !== "sound-preset-readout-action" && action.id !== "sound-preset-decision" && action.id !== "sound-preset") {
    return null;
  }

  return quickActionSoundPresetTargetFromText(action) ?? defaultSoundPresetPreview(project);
}

export function soundPresetTargetFromQuickActionId(actionId: string): SoundPresetTarget | null {
  if (!actionId.startsWith("sound-preset-pad-")) {
    return null;
  }

  const presetId = actionId.slice("sound-preset-pad-".length);
  return soundPresetIds.includes(presetId as SoundPresetTarget) ? (presetId as SoundPresetTarget) : null;
}

export function quickActionSoundPresetTargetFromText(action: QuickAction): SoundPresetTarget | null {
  const text = `${action.title} ${action.detail} ${action.keywords}`;
  return (
    soundPresetIds.find((preset) => text.includes(preset) || text.includes(soundPresetLabel(preset))) ??
    null
  );
}

export function quickActionDrumKitPadOption(project: ProjectState, action: QuickAction): DrumKitPadOption | null {
  const options = createDrumKitPadOptions(project);
  const directId = action.id.startsWith("drum-kit-pad-") ? action.id.slice("drum-kit-pad-".length) : null;
  if (directId) {
    return options.find((pad) => pad.id === directId) ?? null;
  }

  if (action.id !== "drum-kit-readout-action" && action.id !== "drum-kit-decision" && action.id !== "drum-kit") {
    return null;
  }

  const text = `${action.title} ${action.detail} ${action.keywords}`;
  return (
    options.find((pad) => text.includes(pad.id) || text.includes(pad.label)) ??
    options.find((pad) => pad.id === createDrumKitPreviewSummary(options).padId) ??
    null
  );
}

export function quickActionSoundFocusPadOption(project: ProjectState, action: QuickAction): SoundFocusPadOption | null {
  const options = createSoundFocusPadOptions(project.sound);
  const directId = action.id.startsWith("sound-focus-pad-") ? action.id.slice("sound-focus-pad-".length) : null;
  if (directId) {
    return options.find((pad) => pad.id === directId) ?? null;
  }

  if (action.id !== "sound-focus-readout-action" && action.id !== "sound-focus-decision" && action.id !== "sound-focus") {
    return null;
  }

  const text = `${action.title} ${action.detail} ${action.keywords}`;
  return (
    options.find((pad) => text.includes(pad.id) || text.includes(pad.label)) ??
    options.find((pad) => pad.id === createSoundFocusPreviewSummary(project.sound, options).padId) ??
    null
  );
}

export function quickActionSpaceFxMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id === "space-fx-readout-action") {
    const options = createSpaceFxPadOptions(project.mixer);
    const preview = createSpaceFxPreviewSummary(project.mixer, options);
    const pad = options.find((candidate) => candidate.id === preview.padId) ?? options[0];
    if (!pad) {
      return null;
    }
    const transformed = applySpaceFxPadToMixer(project.mixer, pad);
    const changedSends = spaceFxChangedSendCount(project.mixer, transformed);
    return {
      id: "space-fx-readout",
      label: "Space FX Readout",
      value: quickActionSpaceFxMetricValue(project, action, analysis, [
        quickActionSpaceFxActionLabel(action),
        `preview ${preview.padLabel} space`,
        `status ${preview.statusLabel}`,
        `target sends ${preview.sendLabel}`,
        `current sends ${quickActionSpaceFxSendPosture(project.mixer)}`,
        `focus ${preview.focusLabel}`,
        `moves ${changedSends} send${changedSends === 1 ? "" : "s"}`
      ])
    };
  }

  const pad = quickActionSpaceFxPadOption(project, action);
  if (!pad) {
    return null;
  }

  return {
    id: action.id === "space-fx-decision" ? "space-fx-decision" : "space-fx",
    label: action.id === "space-fx-decision" ? "Space FX Decision" : "Space FX",
    value: quickActionSpaceFxMetricValue(project, action, analysis, [
      quickActionSpaceFxActionLabel(action),
      `target ${pad.label} space`,
      `status ${pad.changedCount === 0 ? "Space aligned" : "Suggested space"}`,
      `context ${quickActionSpaceFxContextLabel(action, pad.detail)}`,
      `focus ${pad.detail}`,
      `target sends ${spaceFxPreview(pad)}`,
      `current sends ${quickActionSpaceFxSendPosture(project.mixer)}`,
      `moves ${pad.changedCount} send${pad.changedCount === 1 ? "" : "s"}`
    ])
  };
}

export function quickActionSpaceFxMetricValue(
  project: ProjectState,
  action: QuickAction,
  analysis: ExportAnalysis | undefined,
  parts: string[]
): string {
  return [
    ...parts,
    ...quickActionSpaceFxProjectMetricParts(project, analysis),
    `next ${quickActionSpaceFxNextCheck(action)}`
  ].join(" / ");
}

export function quickActionSpaceFxProjectMetricParts(project: ProjectState, analysis?: ExportAnalysis): string[] {
  const exportAnalysis = analysis ?? analyzeExport(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;

  return [
    `Pattern ${project.selectedPattern}`,
    `${drumHitCount(pattern)} drum hits`,
    `${pattern.bassNotes.length} 808`,
    `${pattern.melodyNotes.length} Synth`,
    `${pattern.chordEvents.length} chords`,
    `${patternEventTotal(pattern)} editable events`,
    patternUseLabel,
    `${project.arrangement.length} blocks`,
    barCountLabel(arrangementTotalBars(project)),
    `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`
  ];
}

export function quickActionSpaceFxSendPosture(mixer: MixerChannel[]): string {
  return `D ${spaceFxTrackPosture(mixer, "drum_rack")} / 8 ${spaceFxTrackPosture(mixer, "bass_808")} / Sy ${spaceFxTrackPosture(
    mixer,
    "synth"
  )} / Ch ${spaceFxTrackPosture(mixer, "chord")}`;
}

export function quickActionSpaceFxContextLabel(action: QuickAction, fallback: string): string {
  return quickActionSpaceFxDetailParts(action).join(" / ") || fallback;
}

export function quickActionSpaceFxDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionSpaceFxNextCheck(action: QuickAction): string {
  if (action.id === "space-fx-readout-action") {
    return "play Full Mix and core stems before applying a Space FX pad or trimming Space sliders manually";
  }

  if (action.id === "space-fx-decision") {
    return "play Full Mix and follow the visible Space FX Preview Decision before another shared-send move";
  }

  if (action.id === "space-fx" || (action.id.startsWith("space-fx-") && action.id !== "space-fx-decision")) {
    return "play Full Mix, then solo Synth and Chords around Drums and 808 before manual Space slider trim";
  }

  return "use the Space FX Result and manual Space sliders for final dry, room, wide, or wash trim";
}

export function quickActionSpaceFxActionLabel(action: QuickAction): string {
  if (action.id === "space-fx-readout-action") {
    return "review space fx readout";
  }
  if (action.id === "space-fx-decision") {
    return "run space fx decision";
  }
  if (action.id === "space-fx") {
    return "apply current space fx";
  }
  if (action.id.startsWith("space-fx-") && action.id !== "space-fx-decision") {
    return "apply direct space fx";
  }
  return "run space fx action";
}

export function quickActionSpaceFxPadOption(project: ProjectState, action: QuickAction): SpaceFxPadOption | null {
  const options = createSpaceFxPadOptions(project.mixer);
  const directId =
    action.id.startsWith("space-fx-") && action.id !== "space-fx-decision" ? action.id.slice("space-fx-".length) : null;
  if (directId) {
    return options.find((pad) => pad.id === directId) ?? null;
  }

  if (action.id !== "space-fx-decision" && action.id !== "space-fx") {
    return null;
  }

  const text = `${action.title} ${action.detail}`;
  return (
    options.find((pad) => text.includes(pad.id) || text.includes(pad.label)) ??
    options.find((pad) => pad.id === createSpaceFxPreviewSummary(project.mixer, options).padId) ??
    null
  );
}

export function quickActionMixBalanceMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id === "mix-balance-readout-action") {
    const options = createMixBalancePadOptions(project.mixer);
    const preview = createMixBalancePreviewSummary(project.mixer, options);
    const pad = options.find((candidate) => candidate.id === preview.padId) ?? options[0];
    if (!pad) {
      return null;
    }
    const transformed = applyMixBalancePadToMixer(project.mixer, pad);
    const changedControls = mixBalanceChangedControlCount(project.mixer, transformed);
    const stemAnalyses = analyzeStemExports(project);
    return {
      id: "mix-balance-readout",
      label: "Mix Balance Readout",
      value: quickActionMixBalanceMetricValue(project, action, analysis, stemAnalyses, [
        quickActionMixBalanceActionLabel(action),
        `preview ${preview.padLabel} balance`,
        `status ${preview.statusLabel}`,
        `target channels ${preview.channelLabel}`,
        `current channels ${quickActionMixBalanceChannelPosture(project.mixer)}`,
        `audition ${preview.auditionLabel}`,
        `moves ${preview.changedChannels} channels / ${changedControls} controls`
      ])
    };
  }

  const pad = quickActionMixBalancePadOption(project, action);
  if (!pad) {
    return null;
  }

  const transformed = applyMixBalancePadToMixer(project.mixer, pad);
  const changedControls = mixBalanceChangedControlCount(project.mixer, transformed);
  const stemAnalyses = analyzeStemExports(project);
  return {
    id: action.id === "mix-balance-decision" ? "mix-balance-decision" : "mix-balance",
    label: action.id === "mix-balance-decision" ? "Mix Balance Decision" : "Mix balance",
    value: quickActionMixBalanceMetricValue(project, action, analysis, stemAnalyses, [
      quickActionMixBalanceActionLabel(action),
      `target ${pad.label} balance`,
      `status ${changedControls === 0 ? "Balance aligned" : "Suggested balance"}`,
      `context ${quickActionMixBalanceContextLabel(action, pad.detail)}`,
      `target channels ${mixBalancePreviewChannelLabel(pad)}`,
      `current channels ${quickActionMixBalanceChannelPosture(project.mixer)}`,
      `audition ${createStemAuditionReadoutSummary(transformed).roleLabel}`,
      `moves ${pad.changedCount} channels / ${changedControls} controls`
    ])
  };
}

export function quickActionMixBalanceMetricValue(
  project: ProjectState,
  action: QuickAction,
  analysis: ExportAnalysis | undefined,
  stemAnalyses: StemExportAnalyses,
  parts: string[]
): string {
  return [
    ...parts,
    ...quickActionMixBalanceProjectMetricParts(project, stemAnalyses, analysis),
    `next ${quickActionMixBalanceNextCheck(action)}`
  ].join(" / ");
}

export function quickActionMixBalanceProjectMetricParts(
  project: ProjectState,
  stemAnalyses: StemExportAnalyses,
  analysis?: ExportAnalysis
): string[] {
  const exportAnalysis = analysis ?? analyzeExport(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;

  return [
    `Pattern ${project.selectedPattern}`,
    `${drumHitCount(pattern)} drum hits`,
    `${pattern.bassNotes.length} 808`,
    `${pattern.melodyNotes.length} Synth`,
    `${pattern.chordEvents.length} chords`,
    `${patternEventTotal(pattern)} editable events`,
    patternUseLabel,
    `${project.arrangement.length} blocks`,
    barCountLabel(arrangementTotalBars(project)),
    `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
    `stems ${audibleStemCount}/${stemTrackIds.length} audible`
  ];
}

export function quickActionMixBalanceChannelPosture(mixer: MixerChannel[]): string {
  return `D ${mixBalanceChannelPosture(mixer, "drum_rack")} / 8 ${mixBalanceChannelPosture(
    mixer,
    "bass_808"
  )} / Sy ${mixBalanceChannelPosture(mixer, "synth")} / Ch ${mixBalanceChannelPosture(mixer, "chord")}`;
}

export function quickActionMixBalanceContextLabel(action: QuickAction, fallback: string): string {
  return quickActionMixBalanceDetailParts(action).join(" / ") || fallback;
}

export function quickActionMixBalanceDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionMixBalanceNextCheck(action: QuickAction): string {
  if (action.id === "mix-balance-readout-action") {
    return "play Full Mix and core stems before applying a rough-balance pad or trimming manually";
  }

  if (action.id === "mix-balance-decision") {
    return "play Full Mix and follow the visible Mix Balance Preview Decision before another rough-balance move";
  }

  if (action.id === "mix-balance" || action.id.startsWith("mix-balance-pad-")) {
    return "play Full Mix, then solo Drums and 808 before manual mixer trim or Stem Audition";
  }

  return "use the Mix Balance Result, Stem Audition Pads, and manual mixer controls for final trim";
}

export function quickActionMixBalanceActionLabel(action: QuickAction): string {
  if (action.id === "mix-balance-readout-action") {
    return "review mix balance readout";
  }
  if (action.id === "mix-balance-decision") {
    return "run mix balance decision";
  }
  if (action.id === "mix-balance") {
    return "apply current mix balance";
  }
  if (action.id.startsWith("mix-balance-pad-")) {
    return "apply direct mix balance";
  }
  return "run mix balance action";
}

export function quickActionMixBalancePadOption(project: ProjectState, action: QuickAction): MixBalancePadOption | null {
  const options = createMixBalancePadOptions(project.mixer);
  const directId = action.id.startsWith("mix-balance-pad-") ? action.id.slice("mix-balance-pad-".length) : null;
  if (directId) {
    return options.find((pad) => pad.id === directId) ?? null;
  }

  if (action.id !== "mix-balance-decision" && action.id !== "mix-balance") {
    return null;
  }

  const text = `${action.title} ${action.detail}`;
  return (
    options.find((pad) => text.includes(pad.id) || text.includes(pad.label)) ??
    options.find((pad) => pad.id === createMixBalancePreviewSummary(project.mixer, options).padId) ??
    null
  );
}

export function quickActionStemAuditionMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id === "stem-audition-readout-action") {
    const options = createStemAuditionPadOptions(project.mixer);
    const readout = createStemAuditionReadoutSummary(project.mixer);
    const decision = createStemAuditionDecisionSummary(options, readout);
    const stemAnalyses = analyzeStemExports(project);
    return {
      id: "stem-audition-readout",
      label: "Stem Audition Readout",
      value: quickActionStemAuditionMetricValue(project, action, analysis, stemAnalyses, [
        quickActionStemAuditionActionLabel(action),
        `current ${readout.roleLabel} / ${readout.detailLabel}`,
        `status ${readout.statusLabel}`,
        `decision ${decision.targetLabel} / ${decision.detailLabel}`,
        `mixer ${quickActionStemAuditionMixerPosture(project.mixer)}`
      ], decision.nextCheckLabel.replace(/^Next:\s*/, ""))
    };
  }

  if (action.id !== "stem-audition-decision" && !action.id.startsWith("stem-audition-")) {
    return null;
  }

  const options = createStemAuditionPadOptions(project.mixer);
  const readout = createStemAuditionReadoutSummary(project.mixer);
  const decision = createStemAuditionDecisionSummary(options, readout);
  const pad = quickActionStemAuditionPadOption(action, options, decision);
  if (!pad) {
    return null;
  }

  const transformed = applyStemAuditionPadToMixer(project.mixer, pad);
  const targetReadout = createStemAuditionReadoutSummary(transformed);
  const stemAnalyses = analyzeStemExports(project);
  return {
    id: action.id === "stem-audition-decision" ? "stem-audition-decision" : "stem-audition",
    label: action.id === "stem-audition-decision" ? "Stem Audition Decision" : "Stem audition",
    value: quickActionStemAuditionMetricValue(project, action, analysis, stemAnalyses, [
      quickActionStemAuditionActionLabel(action),
      `target ${quickActionStemAuditionTargetLabel(pad)}`,
      `status ${quickActionStemAuditionStatusLabel(action, pad, decision)}`,
      `context ${quickActionStemAuditionContextLabel(action, decision.detailLabel || pad.detail)}`,
      `current ${readout.roleLabel} / ${readout.detailLabel}`,
      `target audition ${targetReadout.roleLabel} / ${targetReadout.detailLabel}`,
      `mixer ${quickActionStemAuditionMixerPosture(project.mixer)}`,
      `moves ${pad.changedCount} mixer change${pad.changedCount === 1 ? "" : "s"}`
    ], quickActionStemAuditionNextCheck(action, decision, pad))
  };
}

export function quickActionStemAuditionMetricValue(
  project: ProjectState,
  action: QuickAction,
  analysis: ExportAnalysis | undefined,
  stemAnalyses: StemExportAnalyses,
  parts: string[],
  nextCheck: string
): string {
  return [
    ...parts,
    ...quickActionStemAuditionProjectMetricParts(project, stemAnalyses, analysis),
    `next ${nextCheck}`
  ].join(" / ");
}

export function quickActionStemAuditionProjectMetricParts(
  project: ProjectState,
  stemAnalyses: StemExportAnalyses,
  analysis?: ExportAnalysis
): string[] {
  const exportAnalysis = analysis ?? analyzeExport(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;

  return [
    `Pattern ${project.selectedPattern}`,
    `${drumHitCount(pattern)} drum hits`,
    `${pattern.bassNotes.length} 808`,
    `${pattern.melodyNotes.length} Synth`,
    `${pattern.chordEvents.length} chords`,
    `${patternEventTotal(pattern)} editable events`,
    patternUseLabel,
    `${project.arrangement.length} blocks`,
    barCountLabel(arrangementTotalBars(project)),
    `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
    `stems ${audibleStemCount}/${stemTrackIds.length} audible`
  ];
}

export function quickActionStemAuditionMixerPosture(mixer: MixerChannel[]): string {
  return stemTrackIds
    .map((trackId) => {
      const channel = mixer.find((candidate) => candidate.id === trackId);
      if (!channel) {
        return `${stemTrackLabel(trackId)} missing`;
      }
      const state = channel.solo ? "solo" : channel.muted ? "muted" : "on";
      return `${stemTrackLabel(trackId)} ${state}`;
    })
    .join(" / ");
}

export function quickActionStemAuditionContextLabel(action: QuickAction, fallback: string): string {
  return quickActionStemAuditionDetailParts(action).join(" / ") || fallback;
}

export function quickActionStemAuditionDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionStemAuditionNextCheck(
  action: QuickAction,
  decision: StemAuditionDecisionSummary,
  pad: StemAuditionPadOption
): string {
  if (action.id === "stem-audition-decision") {
    return decision.nextCheckLabel.replace(/^Next:\s*/, "");
  }

  if (pad.trackId === null) {
    return "compare Full Mix against the next solo stem before changing levels or balance";
  }

  return `compare ${pad.label} against Full Mix, then use Mix Balance or manual mixer controls only if the issue remains`;
}

export function quickActionStemAuditionActionLabel(action: QuickAction): string {
  if (action.id === "stem-audition-readout-action") {
    return "review stem audition readout";
  }
  if (action.id === "stem-audition-decision") {
    return "run stem audition decision";
  }
  if (action.id.startsWith("stem-audition-")) {
    return "apply direct stem audition";
  }
  return "run stem audition";
}

export function quickActionStemAuditionTargetLabel(pad: StemAuditionPadOption): string {
  return pad.trackId === null ? "Full Mix" : `${pad.label} stem`;
}

export function quickActionStemAuditionStatusLabel(
  action: QuickAction,
  pad: StemAuditionPadOption,
  decision: StemAuditionDecisionSummary
): string {
  if (action.id === "stem-audition-decision") {
    return decision.statusLabel;
  }
  return pad.active ? "Audition aligned" : "Switch audition";
}

export function quickActionStemAuditionPadOption(
  action: QuickAction,
  options: StemAuditionPadOption[],
  decision: StemAuditionDecisionSummary
): StemAuditionPadOption | null {
  if (action.id === "stem-audition-readout-action") {
    return null;
  }

  if (action.id === "stem-audition-decision") {
    const targetId = action.resultTargetId ?? decision.targetId;
    return targetId ? options.find((pad) => pad.id === targetId) ?? null : null;
  }

  if (!action.id.startsWith("stem-audition-")) {
    return null;
  }

  const directId = action.resultTargetId ?? action.id.slice("stem-audition-".length);
  return options.find((pad) => pad.id === directId) ?? null;
}

export function quickActionLayerStarterMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const option = layerStarterOptionForQuickAction(project, action);
  if (!option) {
    return null;
  }

  const pattern = activePattern(project);
  const laneLabel = quickActionLayerStarterLaneLabel(action, option);
  const parts = quickActionLayerStarterDetailParts(action);
  const statusLabel = parts[0] ?? option.status;
  const detailLabel = parts.slice(1).join(" / ") || option.detail;
  const actionLabel = action.id === "layer-starter" ? "start priority layer starter" : "start direct layer starter";
  const drumCount = drumHitCount(pattern);
  const musicEvents = pattern.bassNotes.length + pattern.chordEvents.length + pattern.melodyNotes.length;
  const readyLayerCount = [
    drumCount > 0,
    pattern.bassNotes.length > 0,
    pattern.chordEvents.length > 0,
    pattern.melodyNotes.length > 0
  ].filter(Boolean).length;

  return {
    id: "layer-starter",
    label: "Layer starter",
    value: `${actionLabel} / lane ${laneLabel} / target ${option.actionLabel} / context ${option.targetLabel} / status ${statusLabel} / detail ${detailLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${drumCount} drum hits / ${musicEvents} music events / ${readyLayerCount}/4 layers / ${barCountLabel(
      arrangementTotalBars(project)
    )}`
  };
}

export function quickActionLayerStarterDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionLayerStarterLaneLabel(action: QuickAction, option: LayerStarterOption): string {
  const directId = layerStarterQuickActionId(action.id);
  const directLabel = directId ? layerStarterLaneLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title.replace(/^Start\s+/, "").replace(/\slayer$/, "").replace(/\slayer ready$/, "").trim();
  return directLabel || titleLabel || option.label || "starter lane unavailable";
}

export function layerStarterLaneLabelFromQuickActionId(id: LayerStarterId): string {
  switch (id) {
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

export function layerStarterOptionForQuickAction(project: ProjectState, action: QuickAction): LayerStarterOption | null {
  const options = createLayerStarterOptions(project);
  const directId = layerStarterQuickActionId(action.id);
  if (directId) {
    return options.find((option) => option.id === directId) ?? null;
  }

  if (action.id === "layer-starter") {
    return (
      options.find((option) => action.title.includes(`${option.label} layer`) || action.detail.includes(`${option.label} `)) ??
      activeLayerStarterQuickActionOption(options)
    );
  }

  return null;
}

export function layerStarterQuickActionId(actionId: string): LayerStarterId | null {
  switch (actionId) {
    case "layer-starter-drums":
      return "drums";
    case "layer-starter-bass":
      return "bass";
    case "layer-starter-chords":
      return "chords";
    case "layer-starter-melody":
      return "melody";
    default:
      return null;
  }
}

export function quickActionPatternChainMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id === "pattern-chain-readout-action") {
    const pattern = activePattern(project);
    const sequence = patternChainReadout(project.arrangement) || "empty";
    const hookBlockCount = project.arrangement.filter((block) => block.section === "Hook").length;
    const detail = quickActionPatternChainReadoutDetail(action);
    return {
      id: "pattern-chain-readout",
      label: "Pattern Chain Readout",
      value: `review pattern chain readout / ${detail} / current ${sequence} / Pattern ${
        project.selectedPattern
      } / ${patternEventTotal(pattern)} editable events / ${project.arrangement.length} blocks / ${hookBlockCount} hook blocks / ${barCountLabel(
        arrangementTotalBars(project)
      )}`
    };
  }

  if (action.id === "chain-expand-readout-action") {
    const pattern = activePattern(project);
    const currentSequence = patternChainReadout(project.arrangement) || "empty";
    const outline = expandPatternChainArrangement(project.arrangement);
    const outlineSequence = patternChainReadout(outline) || "empty";
    const hookBlockCount = outline.filter((block) => block.section === "Hook").length;
    const detail = quickActionPatternChainReadoutDetail(action);
    return {
      id: "chain-expand-readout",
      label: "Chain Expand Readout",
      value: `review chain expand readout / ${detail} / current ${currentSequence} / target ${outlineSequence} / Pattern ${
        project.selectedPattern
      } / ${patternEventTotal(pattern)} editable events / ${outline.length} outline blocks / ${hookBlockCount} hook blocks / ${barCountLabel(
        arrangementTotalBars({ ...project, arrangement: outline })
      )}`
    };
  }

  const actionLabel = patternChainQuickActionLabel(action);
  if (!actionLabel) {
    return null;
  }

  const sequence = patternChainReadout(project.arrangement) || "empty";
  const blockCount = project.arrangement.length;
  const hookBlockCount = project.arrangement.filter((block) => block.section === "Hook").length;
  return {
    id: "pattern-chain",
    label: "Pattern chain",
    value: `${actionLabel} / ${sequence} / ${blockCount} blocks / ${hookBlockCount} hook blocks / ${barCountLabel(
      arrangementTotalBars(project)
    )}`
  };
}

export function quickActionPatternChainReadoutDetail(action: QuickAction): string {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" / ");
}

export function patternChainQuickActionLabel(action: QuickAction): string | null {
  if (action.id === "chain-expand") {
    return "Chain Expand";
  }

  if (action.id === "pattern-chain-decision") {
    const decisionTarget = patternChainQuickActionDecisionTarget(action);
    if (decisionTarget === "expand") {
      return "Chain Expand decision";
    }
    if (decisionTarget) {
      return `${patternChainLabel(decisionTarget)} chain decision`;
    }
    return "Pattern Chain decision";
  }

  const chain = patternChainQuickActionId(action.id);
  return chain ? `${patternChainLabel(chain)} chain` : null;
}

export function patternChainQuickActionDecisionTarget(action: QuickAction): PatternChainId | "expand" | null {
  const text = `${action.title} ${action.detail}`;
  if (text.includes("Chain Expand")) {
    return "expand";
  }

  return patternChainIds.find((chain) => text.includes(patternChainLabel(chain))) ?? null;
}

export function patternChainQuickActionId(actionId: string): PatternChainId | null {
  if (!actionId.startsWith("pattern-chain-") || actionId === "pattern-chain-decision") {
    return null;
  }

  const chainId = actionId.slice("pattern-chain-".length);
  return patternChainIds.includes(chainId as PatternChainId) ? (chainId as PatternChainId) : null;
}

export function quickActionArrangementMoveMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id === "arrangement-move-readout-action") {
    const blockIndex = arrangementMoveQuickActionBlockIndex(project, action);
    const block = project.arrangement[blockIndex] ?? project.arrangement[0];
    const pattern = activePattern(project);
    const preset = arrangementMoveQuickActionPreset(action) ?? selectedArrangementMoveQuickActionPreset(block);
    if (!block || !preset) {
      return {
        id: "arrangement-move-readout",
        label: "Arrangement Move Readout",
        value: `move readout / no selected block / Pattern ${project.selectedPattern} / ${patternEventTotal(
          pattern
        )} editable events / 0 blocks / ${barCountLabel(arrangementTotalBars(project))}`
      };
    }

    const targetBlock = applyArrangementMovePreset(block, preset);
    const energy = normalizeArrangementEnergy(block.energy);
    const targetEnergy = normalizeArrangementEnergy(targetBlock.energy);
    const mutedTracks = normalizeArrangementMutedTracks(block.mutedTracks);
    const targetMutedTracks = normalizeArrangementMutedTracks(targetBlock.mutedTracks);
    const changedFields =
      (energy === targetEnergy ? 0 : 1) + (mutedTracks.join(",") === targetMutedTracks.join(",") ? 0 : 1);
    const blockNumber = Math.min(blockIndex + 1, Math.max(project.arrangement.length, 1));

    return {
      id: "arrangement-move-readout",
      label: "Arrangement Move Readout",
      value: `review arrangement move readout / ${action.detail} / target ${arrangementMovePresetLabel(
        preset
      )} / Block ${blockNumber} ${block.section} / Pattern ${block.pattern} / ${barCountLabel(
        block.bars
      )} / Energy ${percentLabel(energy)} / ${arrangementFocusPreviewMuteLabel(
        mutedTracks
      )} / ${changedFields} field${changedFields === 1 ? "" : "s"} / selected Pattern ${
        project.selectedPattern
      } / ${patternEventTotal(pattern)} editable events / ${project.arrangement.length} blocks / ${barCountLabel(
        arrangementTotalBars(project)
      )}`
    };
  }

  const preset = arrangementMoveQuickActionPreset(action);
  if (!preset) {
    return null;
  }

  const blockIndex = arrangementMoveQuickActionBlockIndex(project, action);
  const block = project.arrangement[blockIndex] ?? project.arrangement[0];
  if (!block) {
    return {
      id: "arrangement-move",
      label: "Arrangement move",
      value: `${arrangementMovePresetLabel(preset)} move / no selected block / 0 blocks / ${barCountLabel(arrangementTotalBars(project))}`
    };
  }

  const targetBlock = applyArrangementMovePreset(block, preset);
  const energy = normalizeArrangementEnergy(block.energy);
  const targetEnergy = normalizeArrangementEnergy(targetBlock.energy);
  const mutedTracks = normalizeArrangementMutedTracks(block.mutedTracks);
  const targetMutedTracks = normalizeArrangementMutedTracks(targetBlock.mutedTracks);
  const changedFields =
    (energy === targetEnergy ? 0 : 1) + (mutedTracks.join(",") === targetMutedTracks.join(",") ? 0 : 1);
  const blockNumber = Math.min(blockIndex + 1, Math.max(project.arrangement.length, 1));
  const presetLabel = arrangementMovePresetLabel(preset);
  const actionLabel = action.id === "arrangement-move-decision" ? `${presetLabel} move decision` : `${presetLabel} move`;

  return {
    id: "arrangement-move",
    label: "Arrangement move",
    value: `${actionLabel} / Block ${blockNumber} ${block.section} / Pattern ${block.pattern} / ${barCountLabel(
      block.bars
    )} / Energy ${percentLabel(energy)} / ${arrangementFocusPreviewMuteLabel(mutedTracks)} / ${changedFields} field${
      changedFields === 1 ? "" : "s"
    } / ${project.arrangement.length} blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function arrangementMoveQuickActionPreset(action: QuickAction): ArrangementMovePreset | null {
  return arrangementMoveQuickActionPresetId(action.id) ?? arrangementMoveQuickActionTextPreset(action);
}

export function arrangementMoveQuickActionTextPreset(action: QuickAction): ArrangementMovePreset | null {
  const text = `${action.title} ${action.detail} ${action.keywords}`;
  return (
    arrangementMovePresetIds.find((preset) => text.includes(arrangementMovePresetLabel(preset))) ??
    null
  );
}

export function arrangementMoveQuickActionPresetId(actionId: string): ArrangementMovePreset | null {
  if (!actionId.startsWith("arrangement-move-preset-")) {
    return null;
  }

  const presetId = actionId.slice("arrangement-move-preset-".length);
  return arrangementMovePresetIds.includes(presetId as ArrangementMovePreset) ? (presetId as ArrangementMovePreset) : null;
}

export function arrangementMoveQuickActionBlockIndex(project: ProjectState, action: QuickAction): number {
  const text = `${action.title} ${action.detail}`;
  const match = /\bBlock\s+(\d+)\b/i.exec(text);
  if (!match) {
    return 0;
  }

  const blockNumber = Number(match[1]);
  if (!Number.isFinite(blockNumber)) {
    return 0;
  }

  return Math.min(Math.max(blockNumber - 1, 0), Math.max(project.arrangement.length - 1, 0));
}

export function quickActionArrangementTemplateMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id === "arrangement-template-readout-action") {
    const pattern = activePattern(project);
    const preview = createArrangementTemplatePreviewSummary(project.arrangement);
    const targetArrangement = preview.templateId === "aligned" ? project.arrangement : createArrangementTemplate(preview.templateId);
    const sectionFlow = compactSectionFlow(targetArrangement) || "empty";
    const patternSpread = arrangementArcPreviewPatternLabel(targetArrangement);
    const hookBlockCount = targetArrangement.filter((block) => block.section === "Hook").length;
    return {
      id: "arrangement-template-readout",
      label: "Arrangement Template Readout",
      value: `review arrangement template readout / ${preview.statusLabel} / ${preview.templateLabel} / ${sectionFlow} / ${patternSpread} / Pattern ${
        project.selectedPattern
      } / ${patternEventTotal(pattern)} editable events / ${targetArrangement.length} template blocks / ${hookBlockCount} hook blocks / ${barCountLabel(
        arrangementTotalBars({ ...project, arrangement: targetArrangement })
      )}`
    };
  }

  const template = arrangementTemplateQuickActionTarget(action);
  if (!template) {
    return null;
  }

  const sectionFlow = compactSectionFlow(project.arrangement) || "empty";
  const patternSpread = arrangementArcPreviewPatternLabel(project.arrangement);
  const blockCount = project.arrangement.length;
  const templateHookBlockCount = project.arrangement.filter((block) => block.section === "Hook").length;
  const actionLabel =
    action.id === "arrangement-template-decision"
      ? `${arrangementTemplateLabel(template)} template decision`
      : `${arrangementTemplateLabel(template)} template`;

  return {
    id: "arrangement-template",
    label: "Arrangement template",
    value: `${actionLabel} / ${sectionFlow} / ${patternSpread} / ${blockCount} blocks / ${templateHookBlockCount} hook blocks / ${barCountLabel(
      arrangementTotalBars(project)
    )}`
  };
}

export function arrangementTemplateQuickActionTarget(action: QuickAction): ArrangementTemplateId | null {
  return arrangementTemplateQuickActionId(action.id) ?? arrangementTemplateQuickActionTextTarget(action);
}

export function arrangementTemplateQuickActionTextTarget(action: QuickAction): ArrangementTemplateId | null {
  const text = `${action.title} ${action.detail} ${action.keywords}`;
  return (
    arrangementTemplateIds.find((template) => text.includes(arrangementTemplateLabel(template))) ??
    arrangementTemplateIds.find((template) => text.includes(template)) ??
    null
  );
}

export function arrangementTemplateQuickActionId(actionId: string): ArrangementTemplateId | null {
  if (!actionId.startsWith("arrangement-template-direct-")) {
    return null;
  }

  const templateId = actionId.slice("arrangement-template-direct-".length);
  return arrangementTemplateIds.includes(templateId as ArrangementTemplateId) ? (templateId as ArrangementTemplateId) : null;
}

export function quickActionArrangementFocusMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const preset = arrangementFocusQuickActionPreset(action);
  if (!preset) {
    return null;
  }

  const blockIndex = arrangementFocusQuickActionBlockIndex(project, action);
  const block = project.arrangement[blockIndex] ?? project.arrangement[0];
  if (action.id === "arrangement-focus-readout-action") {
    const pattern = activePattern(project);
    if (!block) {
      return {
        id: "arrangement-focus-readout",
        label: "Arrangement Focus Readout",
        value: `${preset.label} focus readout / no selected block / Pattern ${project.selectedPattern} / ${patternEventTotal(
          pattern
        )} editable events / 0 blocks / ${barCountLabel(arrangementTotalBars(project))}`
      };
    }

    const blockNumber = Math.min(blockIndex + 1, Math.max(project.arrangement.length, 1));
    const changedFields = arrangementFocusChangedFieldCount(block, preset);
    return {
      id: "arrangement-focus-readout",
      label: "Arrangement Focus Readout",
      value: `review arrangement focus readout / ${action.detail} / target ${preset.label} / Block ${blockNumber} ${
        block.section
      } / Pattern ${block.pattern} / ${barCountLabel(block.bars)} / Energy ${percentLabel(block.energy)} / ${arrangementFocusPreviewMuteLabel(
        block.mutedTracks
      )} / ${changedFields} field${changedFields === 1 ? "" : "s"} / selected Pattern ${
        project.selectedPattern
      } / ${patternEventTotal(pattern)} editable events / ${project.arrangement.length} blocks / ${barCountLabel(arrangementTotalBars(project))}`
    };
  }

  if (!block) {
    return {
      id: "arrangement-focus",
      label: "Arrangement focus",
      value: `${preset.label} focus / no selected block / 0 blocks / ${barCountLabel(arrangementTotalBars(project))}`
    };
  }

  const blockNumber = Math.min(blockIndex + 1, Math.max(project.arrangement.length, 1));
  const changedFields = arrangementFocusChangedFieldCount(block, preset);
  const actionLabel = action.id === "arrangement-focus-decision" ? `${preset.label} focus decision` : `${preset.label} focus`;

  return {
    id: "arrangement-focus",
    label: "Arrangement focus",
    value: `${actionLabel} / Block ${blockNumber} ${block.section} / Pattern ${block.pattern} / ${barCountLabel(
      block.bars
    )} / Energy ${percentLabel(block.energy)} / ${arrangementFocusPreviewMuteLabel(block.mutedTracks)} / ${changedFields} field${
      changedFields === 1 ? "" : "s"
    } / ${project.arrangement.length} blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function arrangementFocusQuickActionPreset(action: QuickAction): ArrangementFocusPreset | null {
  return arrangementFocusQuickActionPresetId(action.id) ?? arrangementFocusQuickActionTextPreset(action);
}

export function arrangementFocusQuickActionTextPreset(action: QuickAction): ArrangementFocusPreset | null {
  const text = `${action.title} ${action.detail} ${action.keywords}`;
  return (
    arrangementFocusPresets.find((preset) => text.includes(preset.label)) ??
    arrangementFocusPresets.find((preset) => text.includes(preset.id)) ??
    null
  );
}

export function arrangementFocusQuickActionPresetId(actionId: string): ArrangementFocusPreset | null {
  if (!actionId.startsWith("arrangement-focus-preset-")) {
    return null;
  }

  const presetId = actionId.slice("arrangement-focus-preset-".length);
  return arrangementFocusPresets.find((preset) => preset.id === presetId) ?? null;
}

export function arrangementFocusQuickActionBlockIndex(project: ProjectState, action: QuickAction): number {
  const text = `${action.title} ${action.detail}`;
  const match = /\bBlock\s+(\d+)\b/i.exec(text);
  if (!match) {
    return 0;
  }

  const blockNumber = Number(match[1]);
  if (!Number.isFinite(blockNumber)) {
    return 0;
  }

  return Math.min(Math.max(blockNumber - 1, 0), Math.max(project.arrangement.length - 1, 0));
}

export function quickActionArrangementArcMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id === "arrangement-arc-readout-action") {
    const pattern = activePattern(project);
    const pad = arrangementArcQuickActionPad(action);
    const targetProject = pad ? applyArrangementArcPadToProject(project, pad, 0) : project;
    const targetArrangement = targetProject.arrangement;
    const sectionFlow = compactSectionFlow(targetArrangement) || "empty";
    const patternSpread = arrangementArcPreviewPatternLabel(targetArrangement);
    const averageEnergy = `${Math.round(arrangementAverageEnergy({ ...project, arrangement: targetArrangement }) * 100)}% avg`;
    const energyRange = arrangementArcPreviewEnergyLabel(targetArrangement);
    const mutePosture = arrangementArcPreviewMuteLabel(targetArrangement);
    return {
      id: "arrangement-arc-readout",
      label: "Arrangement Arc Readout",
      value: `review arrangement arc readout / ${action.detail} / target ${sectionFlow} / ${patternSpread} / ${averageEnergy} / ${energyRange} / ${mutePosture} / Pattern ${
        project.selectedPattern
      } / ${patternEventTotal(pattern)} editable events / ${targetArrangement.length} arc blocks / ${barCountLabel(
        arrangementTotalBars({ ...project, arrangement: targetArrangement })
      )}`
    };
  }

  const pad = arrangementArcQuickActionPad(action);
  if (!pad) {
    return null;
  }

  const sectionFlow = compactSectionFlow(project.arrangement) || "empty";
  const patternSpread = arrangementArcPreviewPatternLabel(project.arrangement);
  const averageEnergy = `${Math.round(arrangementAverageEnergy(project) * 100)}% avg`;
  const energyRange = arrangementArcPreviewEnergyLabel(project.arrangement);
  const mutePosture = arrangementArcPreviewMuteLabel(project.arrangement);
  const blockCount = project.arrangement.length;
  const actionLabel = action.id === "arrangement-arc-decision" ? `${pad.label} arc decision` : `${pad.label} arc`;

  return {
    id: "song-arc",
    label: "Song arc",
    value: `${actionLabel} / ${sectionFlow} / ${patternSpread} / ${averageEnergy} / ${energyRange} / ${mutePosture} / ${blockCount} blocks / ${barCountLabel(
      arrangementTotalBars(project)
    )}`
  };
}

export function arrangementArcQuickActionPad(action: QuickAction): ArrangementArcPadDefinition | null {
  return arrangementArcQuickActionPadId(action.id) ?? arrangementArcQuickActionTextPad(action);
}

export function arrangementArcQuickActionTextPad(action: QuickAction): ArrangementArcPadDefinition | null {
  const text = `${action.title} ${action.detail} ${action.keywords}`;
  return (
    arrangementArcPadDefinitions.find((pad) => text.includes(pad.label)) ??
    arrangementArcPadDefinitions.find((pad) => text.includes(pad.id)) ??
    null
  );
}

export function arrangementArcQuickActionPadId(actionId: string): ArrangementArcPadDefinition | null {
  if (!actionId.startsWith("arrangement-arc-pad-")) {
    return null;
  }

  const padId = actionId.slice("arrangement-arc-pad-".length);
  return arrangementArcPadDefinitions.find((pad) => pad.id === padId) ?? null;
}

export function quickActionPatternStackMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const stack = patternStackOptionForQuickAction(project, action);
  if (!stack) {
    return null;
  }

  const pattern = activePattern(project);
  const parts = quickActionPatternStackDetailParts(action);
  const laneLabel = quickActionPatternStackLaneLabel(action, stack);
  const actionLabel = action.id === "pattern-stack" ? "apply preview pattern stack" : "apply direct pattern stack";
  const stackContext = parts[0] ?? stack.preview;
  const detailLabel = parts.slice(1).join(" / ") || `${stack.bassCount} 808 / ${stack.chordCount} chords / ${stack.melodyCount} synth`;
  const drumCount = drumHitCount(pattern);
  const musicEvents = pattern.bassNotes.length + pattern.chordEvents.length + pattern.melodyNotes.length;
  const readyLayerCount = [
    drumCount > 0,
    pattern.bassNotes.length > 0,
    pattern.chordEvents.length > 0,
    pattern.melodyNotes.length > 0
  ].filter(Boolean).length;

  return {
    id: "pattern-stack",
    label: "Pattern stack",
    value: `${actionLabel} / lane ${laneLabel} / stack ${stack.label} / context ${stackContext} / detail ${detailLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${drumCount} drum hits / ${musicEvents} music events / ${pattern.bassNotes.length} 808 / ${
      pattern.chordEvents.length
    } chords / ${pattern.melodyNotes.length} synth / ${readyLayerCount}/4 layers / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionPatternStackDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionPatternStackLaneLabel(action: QuickAction, stack: PatternStackOption): string {
  const directId = patternStackQuickActionId(action.id);
  const directLabel = directId ? patternStackLaneLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title.replace(/^Apply\s+/, "").replace(/\sstack(?: already applied)?$/, "").trim();
  return directLabel || titleLabel || stack.label || "stack lane unavailable";
}

export function patternStackLaneLabelFromQuickActionId(id: PatternStackId): string {
  switch (id) {
    case "pocket":
      return "Pocket";
    case "hook":
      return "Hook";
    case "lift":
      return "Lift";
    case "break":
      return "Break";
  }
}

export function patternStackOptionForQuickAction(project: ProjectState, action: QuickAction): PatternStackOption | null {
  const options = createPatternStackOptions(project.key);
  const directId = patternStackQuickActionId(action.id);
  if (directId) {
    return options.find((option) => option.id === directId) ?? null;
  }

  if (action.id === "pattern-stack") {
    const currentPattern = activePattern(project);
    const suggested = createPatternStackPreviewSummary(project.key, currentPattern, options);
    return (
      options.find((option) => action.title.includes(`${option.label} stack`) || action.detail.includes(`${option.label}:`)) ??
      options.find((option) => option.id === suggested.stackId) ??
      null
    );
  }

  return null;
}

export function patternStackQuickActionId(actionId: string): PatternStackId | null {
  if (!actionId.startsWith("pattern-stack-pad-")) {
    return null;
  }

  const stackId = actionId.slice("pattern-stack-pad-".length);
  return stackId === "pocket" || stackId === "hook" || stackId === "lift" || stackId === "break" ? stackId : null;
}

export type PatternEditQuickActionRoute = {
  action: "copy" | "clear";
  source: PatternSlot;
  target: PatternSlot;
};

export function quickActionPatternEditMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const route = patternEditQuickActionRoute(action);
  if (!route) {
    return null;
  }

  const targetPattern = project.patterns[route.target];
  const sourceEvents = patternEventTotal(project.patterns[route.source]);
  const targetEvents = patternEventTotal(targetPattern);
  const targetDrums = drumHitCount(targetPattern);
  const targetMusicEvents = targetPattern.bassNotes.length + targetPattern.chordEvents.length + targetPattern.melodyNotes.length;
  const actionLabel = route.action === "copy" ? "copy" : "clear";
  const routeLabel =
    route.action === "copy"
      ? `Pattern ${route.source} -> ${route.target} / source ${sourceEvents} events`
      : `Pattern ${route.target} cleared`;

  return {
    id: "pattern-edit",
    label: `Pattern ${actionLabel}`,
    value: `${routeLabel} / target ${targetEvents} events / ${targetDrums} drums / ${targetMusicEvents} music`
  };
}

export function patternEditQuickActionRoute(action: QuickAction): PatternEditQuickActionRoute | null {
  if (action.id.startsWith("pattern-copy-")) {
    const idMatch = /^pattern-copy-([abcABC])$/.exec(action.id);
    const titleMatch = /^Copy Pattern ([ABC]) to ([ABC])$/.exec(action.title);
    const source = titleMatch ? patternSlotFromQuickActionValue(titleMatch[1]) : null;
    const titleTarget = titleMatch ? patternSlotFromQuickActionValue(titleMatch[2]) : null;
    const target = idMatch ? patternSlotFromQuickActionValue(idMatch[1]) : null;
    if (!source || !target || titleTarget !== target) {
      return null;
    }

    return { action: "copy", source, target };
  }

  if (action.id === "pattern-clear") {
    const titleMatch = /^Clear Pattern ([ABC])$/.exec(action.title);
    const target = titleMatch ? patternSlotFromQuickActionValue(titleMatch[1]) : null;
    if (!target) {
      return null;
    }

    return { action: "clear", source: target, target };
  }

  return null;
}

export function quickActionPatternCloneMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const route = patternCloneQuickActionRoute(action);
  if (!route) {
    return null;
  }

  const sourcePattern = project.patterns[route.source];
  const targetPattern = project.patterns[route.target];
  const sourceEvents = patternEventTotal(sourcePattern);
  const targetEvents = patternEventTotal(targetPattern);
  const targetDrums = drumHitCount(targetPattern);
  const targetMusicEvents = targetPattern.bassNotes.length + targetPattern.chordEvents.length + targetPattern.melodyNotes.length;
  return {
    id: "pattern-clone",
    label: "Pattern clone",
    value: `Pattern ${route.source} -> ${route.target} / ${patternVariationPresetLabel(
      route.preset
    )} clone / source ${sourceEvents} events / target ${targetEvents} events / ${targetDrums} drums / ${targetMusicEvents} music`
  };
}

export function patternCloneQuickActionRoute(
  action: QuickAction
): { source: PatternSlot; target: PatternSlot; preset: PatternVariationPreset } | null {
  const idMatch = /^pattern-clone-([ABC])-(hook|breakdown)$/.exec(action.id);
  if (!idMatch) {
    return null;
  }

  const target = patternSlotFromQuickActionValue(idMatch[1]);
  const preset = patternCloneQuickActionPreset(idMatch[2]);
  const detailMatch = /Clone ([ABC]) -> ([ABC])/.exec(action.detail);
  const source = detailMatch ? patternSlotFromQuickActionValue(detailMatch[1]) : null;
  const detailTarget = detailMatch ? patternSlotFromQuickActionValue(detailMatch[2]) : null;
  if (!source || !target || !preset || detailTarget !== target) {
    return null;
  }

  return { source, target, preset };
}

export function patternSlotFromQuickActionValue(value: string): PatternSlot | null {
  const normalized = value.toUpperCase();
  return patternSlots.includes(normalized as PatternSlot) ? (normalized as PatternSlot) : null;
}

export function patternCloneQuickActionPreset(value: string): PatternVariationPreset | null {
  return value === "hook" || value === "breakdown" ? value : null;
}

export function quickActionPatternVariationMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const preset = patternVariationQuickActionPreset(action.id);
  if (!preset) {
    return null;
  }

  const pattern = activePattern(project);
  const presetLabel = patternVariationPresetLabel(preset);
  const drumHits = drumHitCount(pattern);
  const bassNotes = pattern.bassNotes.length;
  const chordEvents = pattern.chordEvents.length;
  const melodyNotes = pattern.melodyNotes.length;
  return {
    id: "pattern-variation",
    label: "Pattern variation",
    value: `Pattern ${project.selectedPattern} / ${presetLabel} variation / ${drumHits} drums / ${bassNotes} 808 / ${chordEvents} chords / ${melodyNotes} Synth / ${patternEventTotal(
      pattern
    )} events`
  };
}

export function patternVariationQuickActionPreset(actionId: string): PatternVariationPreset | null {
  switch (actionId) {
    case "pattern-variation-subtle":
      return "subtle";
    case "pattern-variation-hook":
      return "hook";
    case "pattern-variation-breakdown":
      return "breakdown";
    default:
      return null;
  }
}

export function quickActionPatternFillMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const preset = patternFillQuickActionPreset(action.id);
  if (!preset) {
    return null;
  }

  const pattern = activePattern(project);
  const presetLabel = patternFillPresetLabel(preset);
  const drumHits = drumHitCount(pattern);
  const bassNotes = pattern.bassNotes.length;
  const chordEvents = pattern.chordEvents.length;
  const melodyNotes = pattern.melodyNotes.length;
  return {
    id: "pattern-fill",
    label: "Pattern fill",
    value: `Pattern ${project.selectedPattern} / ${presetLabel} tail move / ${drumHits} drums / ${bassNotes} 808 / ${chordEvents} chords / ${melodyNotes} Synth / ${patternEventTotal(
      pattern
    )} events`
  };
}

export function patternFillQuickActionPreset(actionId: string): PatternFillPreset | null {
  switch (actionId) {
    case "fill-drums":
      return "drum_fill";
    case "fill-bass":
      return "bass_pickup";
    case "fill-melody":
      return "melody_turn";
    case "fill-clear-tail":
      return "clear_tail";
    default:
      return null;
  }
}

export function quickActionResultFollowup(
  action: QuickAction,
  project: ProjectState,
  outcome: "complete" | "failed"
): { auditionCue: string; nextCheck: string } {
  if (outcome === "failed") {
    return {
      auditionCue: "Keep playback stopped until the command is retried.",
      nextCheck: "Check the project status text before running another export or file action."
    };
  }

  const analysis = analyzeExport(project);
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);

  const nextMoveAction = nextMoveQuickActionForProject(project, action);
  if (nextMoveAction) {
    return nextMoveResultFollowup(nextMoveAction, project);
  }

  if (action.id === "blueprint-preview-cue") {
    return {
      auditionCue: "Play the cued Song or Pattern loop before applying the previewed starter.",
      nextCheck: "Apply the Beat Blueprint only after the preview cue confirms the starter fits the session."
    };
  }

  if (action.id === "blueprint-preview-decision") {
    if (action.title.startsWith("Apply Preview")) {
      return {
        auditionCue: "Loop the applied preview and hear drums, 808, chords, Synth, arrangement, sound, and master together.",
        nextCheck: "Use Beat Spine, Pattern DNA, and First Beat Path to keep editing the starter as musical events."
      };
    }

    return {
      auditionCue: "Read the compared style-match preview before applying a starter.",
      nextCheck: "Apply only after the preview decision matches the beat direction."
    };
  }

  if (action.id.startsWith("blueprint-preview-")) {
    return {
      auditionCue: "Read the Beat Blueprint preview before applying the starter.",
      nextCheck: "Use the matching Apply Blueprint command only when the previewed style, key, BPM, sound, and master fit the session."
    };
  }

  if (action.id === "blueprint" || action.id === "blueprint-style-match" || action.id.startsWith("blueprint-apply-")) {
    return {
      auditionCue: "Loop the new starter beat; hear drums, 808, chords, Synth, arrangement, sound, and master together.",
      nextCheck: "Use Beat Spine, Pattern DNA, and First Beat Path to edit the sample-free starter instead of treating it as fixed audio."
    };
  }

  if (action.id.startsWith("delivery-target-set-")) {
    return {
      auditionCue: "Keep the beat playing only if you are comparing the same music against the new session goal.",
      nextCheck: "Run Delivery Target Align only when arrangement length, master, mix posture, and stem expectation should change."
    };
  }

  if (action.id === "command-reference" || action.id === "beat-terms-reference") {
    return {
      auditionCue: "Use the reference only to choose the next explicit local command or understand the current beat term.",
      nextCheck: "Open Quick Actions when you are ready to run one command."
    };
  }

  if (action.id === "project-safety-readout") {
    return {
      auditionCue: "No audio changed; this command only checks the current file, draft, snapshot, and beat-state safety posture.",
      nextCheck: quickActionProjectSafetyNextCheck(action)
    };
  }

  if (action.id === "transport-position-readout-action") {
    return {
      auditionCue: "Use the Bar/Beat/Step readout to confirm the exact playback or cued position before judging timing.",
      nextCheck: "Use Loop Scope, Pattern Playback, or Arrangement Playback readouts next when the position points at the wrong musical area."
    };
  }

  if (action.id === "loop-scope") {
    return {
      auditionCue: "Press Play only after the Loop Scope readout matches the Song, Block, Turn, or Pattern area you want to judge.",
      nextCheck: "Use Song for arrangement, Block or Turn for section handoffs, and Pattern for drums, 808, chords, or melody edits."
    };
  }

  if (action.id === "metronome-readout") {
    return {
      auditionCue: "Press Play only after BPM, click state, and loop scope match the timing pass you want to judge.",
      nextCheck: "Use the Metronome toggle only when you need a realtime timing reference; WAV and stem exports stay click-free."
    };
  }

  if (action.id === "guide-quick-start") {
    return {
      auditionCue: "Use the focused guide target to inspect the current Path, Session Pass, or Workflow Spotlight lane before editing.",
      nextCheck: "Return to Guide Quick Start or run this command again after the target lane is ready or intentionally deferred."
    };
  }

  if (action.id === "guide-bottleneck-focus") {
    return {
      auditionCue: "Use the focused lowest completion lane to resolve the weakest Path, Session, or Workflow area before exporting.",
      nextCheck: "Return to Guide Quick Start and confirm the bottleneck label or completion breakdown changed after the pass."
    };
  }

  if (action.id === "restore-local-draft") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm the restored draft is the beat state you intended to recover.`,
      nextCheck: "Save a durable .grooveforge.json copy after confirming the recovered project."
    };
  }

  if (action.id === "clear-local-draft") {
    return {
      auditionCue: "No audio changed; the current editable project remains available after clearing the recovery copy.",
      nextCheck: "Save the current project if it still needs durable protection."
    };
  }

  if (action.id.startsWith("mode-switch-")) {
    return project.mode === "guided"
      ? {
          auditionCue: "Use First Beat Path to make the next direct drums, 808, harmony, melody, arrangement, mix, or delivery move.",
          nextCheck: "Switch back to Studio only when you want faster issue scanning instead of step-by-step guidance."
        }
      : {
          auditionCue: "Use Mode Focus, Review Queue, and Export Preflight to scan the current beat without changing the music.",
          nextCheck: "Switch back to Guided when the next beat-making step should be explicit again."
        };
  }

  if (action.id === "session-pass-focus") {
    return {
      auditionCue: "Use the focused workstation panel to inspect the highlighted Session Pass target.",
      nextCheck: "Run the visible Session Pass Focus cards when you want another guided, studio, finish, or delivery jump."
    };
  }

  if (action.id.startsWith("session-pass-card-")) {
    return {
      auditionCue: "Use the focused workstation panel to inspect the selected Session Pass card before changing project data.",
      nextCheck: "Return to Session Pass when you need another direct Guided, Studio, Finish, or Delivery focus."
    };
  }

  if (action.id === "session-brief-compass-focus") {
    return {
      auditionCue: "Use the focused Session Brief field or Handoff area to tighten written session context before changing the beat.",
      nextCheck: "Return to Brief Compass after the focused context lane is ready or intentionally deferred."
    };
  }

  if (action.id.startsWith("session-brief-compass-card-")) {
    return {
      auditionCue: "Use the focused Brief Compass lane to inspect direction, reference, artist context, or handoff readiness.",
      nextCheck: "Return to Brief Compass when you need another direct context or handoff focus."
    };
  }

  if (action.id === "reference-alignment-focus") {
    return {
      auditionCue: "Use the focused Reference Alignment lane to compare the written reference, listen cue, arrangement, mix, and handoff posture by ear.",
      nextCheck: "Return to Reference Alignment before export to confirm no audio import or matching step is required."
    };
  }

  if (action.id.startsWith("reference-alignment-card-")) {
    return {
      auditionCue: "Use the selected Reference Alignment card to inspect reference fit and listen scope through existing brief, arrangement, master, or delivery panels.",
      nextCheck: "After the focused lane is ready, run Listening Pass and Handoff Pack checks before sending the beat."
    };
  }

  if (action.id.startsWith("session-brief-starter-")) {
    return {
      auditionCue: "Read Brief Compass, then use Listening Pass to compare the beat against the written context.",
      nextCheck: `${sessionBriefFilledFields(project.sessionBrief)}/4 brief fields; review Handoff Pack before export.`
    };
  }

  if (action.id === "first-beat-path-jump") {
    return {
      auditionCue: "Use the jumped First Beat Path panel area to handle the highlighted setup, compose, arrange, mix, or deliver step.",
      nextCheck: "Return to First Beat Path after the highlighted step looks ready, then run the command again for the next beat-making step."
    };
  }

  if (action.id.startsWith("first-beat-path-step-")) {
    return {
      auditionCue: "Use the selected First Beat Path stage to handle setup, compose, arrange, mix, or deliver work without changing project data.",
      nextCheck: "Return to First Beat Path when you need another direct stage jump or the next highlighted beat-making step."
    };
  }

  if (action.id === "midi-input-connect") {
    return {
      auditionCue: "Arm Web MIDI Input in the Compose panel, then play a controller note into the selected 808 or Synth target.",
      nextCheck: "Check the Web MIDI status, input selector, latest-note readout, and Keyboard Capture defaults before recording the next phrase."
    };
  }

  if (action.id === "midi-input-readout-action") {
    return {
      auditionCue: "Use the MIDI Input readout before connecting, arming, or playing a controller into the selected 808/Synth target.",
      nextCheck: "Connect or arm MIDI only when support, selected input, target, placement mode, and capture defaults match the next controller phrase."
    };
  }

  if (action.id === "keyboard-capture-readout-action") {
    return {
      auditionCue: "Use the Keyboard Capture readout before pressing mapped desktop keys, arming MIDI, changing capture defaults, arranging, or exporting.",
      nextCheck: "Toggle Keyboard Capture, switch 808/Synth target, or adjust Capture Step Mode only when the readout matches the next note-entry move."
    };
  }

  if (action.id === "capture-step-mode-readout-action") {
    return {
      auditionCue: "Use the Capture Step Mode readout before pressing mapped desktop keys or MIDI notes that should land on a specific 808/Synth step.",
      nextCheck: "Switch between Next empty and Replace selected only when the readout matches the intended note-entry placement."
    };
  }

  if (action.id === "editor-audition-readout-action") {
    return {
      auditionCue: "Use the Editor Audition readout before firing a one-shot selected drum, 808, Synth, or chord audition.",
      nextCheck: "Run the matching selected-event audition only after the target, route, runtime posture, and next listening check match the edit."
    };
  }

  if (action.id === "keyboard-capture-toggle") {
    return {
      auditionCue: "Use the desktop key map only after confirming Keyboard Capture is armed and the intended 808 or Synth target is selected.",
      nextCheck: "Keyboard Capture toggling does not insert notes; press mapped desktop keys when the next phrase should be captured."
    };
  }

  if (action.id.startsWith("capture-target-")) {
    return {
      auditionCue: "Play desktop keys or a MIDI controller only after confirming the intended 808 or Synth target is selected.",
      nextCheck: "Check the Keyboard Capture target, octave/length defaults, and Web MIDI target before entering the next phrase."
    };
  }

  if (action.id.startsWith("capture-step-mode-")) {
    return {
      auditionCue: "Use Next for sequence entry or Replace after selecting the 808/Synth step that needs correction.",
      nextCheck: "Capture Step Mode changes only where the next explicit Keyboard Capture or MIDI note lands."
    };
  }

  if (action.id.startsWith("capture-default-")) {
    return {
      auditionCue: "Play desktop keys or a MIDI controller after confirming the new octave, length, velocity, or glide default.",
      nextCheck: "Captured defaults affect only the next Keyboard Capture or Web MIDI notes; existing notes stay editable in the grid."
    };
  }

  if (action.id === "selected-note-audition") {
    return {
      auditionCue: "Use the one-shot note sound to check pitch, length, velocity, and current mixer posture before changing the phrase.",
      nextCheck: "Loop the selected Pattern only when the note needs to be judged against drums, chords, and arrangement context."
    };
  }

  if (action.id === "selected-note-copy") {
    return {
      auditionCue: "Use Paste copied note when the copied 808 or Synth shape should repeat in the current Pattern.",
      nextCheck: "The note clipboard is UI-local; paste or duplicate explicitly before changing to another editing task."
    };
  }

  if (action.id.startsWith("selected-note-")) {
    return {
      auditionCue: "Loop the selected Pattern to hear the corrected 808 or Synth note against drums and chords.",
      nextCheck: "Use selected-note tools again for another small correction, or move to Pattern Compare once the phrase feels right."
    };
  }

  if (action.id === "selected-drum-audition") {
    return {
      auditionCue: "Use the one-shot drum hit to check velocity, timing feel, repeat shape, and current drum rack posture.",
      nextCheck: "Loop the selected Pattern only when the hit needs to be judged against the full groove."
    };
  }

  if (action.id === "selected-drum-copy") {
    return {
      auditionCue: "Use Paste copied drum hit when the copied groove shape should repeat in the current Pattern.",
      nextCheck: "The drum clipboard is UI-local; paste explicitly before changing to another editing task."
    };
  }

  if (action.id.startsWith("selected-drum-")) {
    return {
      auditionCue: "Loop the selected Pattern to hear the corrected drum pocket against the 808, chords, and Synth.",
      nextCheck: "Use selected-drum tools again for another small correction, or move to Drum Move when the rhythm needs a broader change."
    };
  }

  if (action.id === "selected-chord-audition") {
    return {
      auditionCue: "Use the one-shot chord sound to check root, quality, voicing, length, and current chord tone posture.",
      nextCheck: "Loop the selected Pattern only when the chord needs to be judged against 808 and melody movement."
    };
  }

  if (action.id === "selected-chord-copy") {
    return {
      auditionCue: "Use Paste copied chord when the copied harmony shape should repeat in the current Pattern.",
      nextCheck: "The chord clipboard is UI-local; paste or duplicate explicitly before changing to another editing task."
    };
  }

  if (action.id.startsWith("selected-chord-")) {
    return {
      auditionCue: "Loop the selected Pattern to hear the corrected chord movement against the 808 and melody.",
      nextCheck: "Use selected-chord tools again for another small harmonic correction, or move to Chord Move when the progression needs a broader change."
    };
  }

  if (action.id === "midi-input-arm") {
    return {
      auditionCue: "Play a connected MIDI controller note only when the Web MIDI Input panel shows the intended target and armed state.",
      nextCheck: "Disarm MIDI input before typing in other controls, or switch capture target before recording the other lane."
    };
  }

  if (action.id === "delivery-target-align") {
    return {
      auditionCue: "Play Song loop; check arrangement length, hook energy, and Full Mix export posture against the active target.",
      nextCheck: "Use the Delivery Target Alignment Result, Export Preflight, and Handoff Pack before exporting files."
    };
  }

  if (action.id === "mode-focus-jump") {
    return {
      auditionCue: "Use the jumped Mode Focus panel to inspect the current Guided stage or Studio issue before running edits.",
      nextCheck: "Return to Mode Focus after the current orientation card is ready or intentionally deferred."
    };
  }

  if (action.id.startsWith("mode-focus-card-")) {
    return {
      auditionCue: "Use the jumped workstation panel to inspect the selected Mode Focus card before running edits.",
      nextCheck: "Return to Mode Focus when you need another direct Guided or Studio orientation jump."
    };
  }

  if (action.id === "beat-spine-jump") {
    return {
      auditionCue: "Use the jumped Beat Spine card to inspect the next setup, writing, sound, arrangement, or finish axis.",
      nextCheck: "Return to Beat Spine after the highlighted core card is ready or intentionally deferred."
    };
  }

  if (action.id.startsWith("beat-spine-card-jump-")) {
    return {
      auditionCue: "Use the selected Beat Spine card to inspect that setup, writing, sound, arrangement, or finish axis before changing project data.",
      nextCheck: "Return to Beat Spine when you need another direct core-axis jump or the next highlighted card."
    };
  }

  if (action.id === "beat-spine-apply") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern} or the full Song to confirm the applied Beat Spine move supports the beat.`,
      nextCheck: "Read the Beat Spine Apply Result, then continue with the next highlighted core card."
    };
  }

  if (action.id.startsWith("beat-spine-card-apply-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern} or the full Song to confirm the selected Beat Spine apply move supports the beat.`,
      nextCheck: "Read the Beat Spine Apply Result, then continue with the next core card."
    };
  }

  if (action.id === "composer-guide-focus") {
    return {
      auditionCue: "Use the focused Composer Guide card to inspect the next writing gap before applying any move.",
      nextCheck: "Run the visible Composer Guide Focus buttons after the drums, 808, harmony, melody, arrangement, or finish lane changes."
    };
  }

  if (action.id.startsWith("composer-guide-card-")) {
    return {
      auditionCue: "Use the focused Composer Guide lane to inspect that writing area before applying any move.",
      nextCheck: "Return to Composer Guide when you need another direct drums, 808, harmony, melody, arrangement, or finish focus."
    };
  }

  const styleGoalQuickActionArea = styleGoalActionQuickActionArea(action.id);
  if (styleGoalQuickActionArea) {
    switch (styleGoalQuickActionArea) {
      case "drums":
        return {
          auditionCue: `Loop Pattern ${project.selectedPattern}; check the Style Goal drum action against 808 support.`,
          nextCheck: `${drumHitCount(pattern)} drum hits now; read the Style Goal Action Result before another drum pass.`
        };
      case "bass":
        return {
          auditionCue: `Loop Pattern ${project.selectedPattern}; hear the Style Goal 808 action against kick placement.`,
          nextCheck: `${pattern.bassNotes.length} 808 notes now; read the Style Goal Action Result before adding more low-end movement.`
        };
      case "harmony":
        return {
          auditionCue: `Loop Pattern ${project.selectedPattern}; hear the Style Goal harmony action under the 808 and Synth lanes.`,
          nextCheck: `${chordMotionLabel(pattern.chordEvents)} chord motion now; read the Style Goal Action Result before changing harmony again.`
        };
      case "melody":
        return {
          auditionCue: `Loop Pattern ${project.selectedPattern}; hear the Style Goal melody action against chords and 808.`,
          nextCheck: `${pattern.melodyNotes.length} Synth notes now; read the Style Goal Action Result before writing another hook pass.`
        };
      case "arrange":
        return {
          auditionCue: `Play Song loop; scan the Style Goal arrangement action across ${barCountLabel(arrangementTotalBars(project))}.`,
          nextCheck: `${project.arrangement.length} blocks now; read the Style Goal Action Result before changing song form again.`
        };
      case "finish":
        return {
          auditionCue: "Play full mix after the Style Goal finish action.",
          nextCheck: "Read Style Goal Action Result before exporting."
        };
    }
  }

  const composerQuickActionArea = composerActionQuickActionArea(action.id);
  if (composerQuickActionArea) {
    switch (composerQuickActionArea) {
      case "drums":
        return {
          auditionCue: `Loop Pattern ${project.selectedPattern}; check the Composer Action drum foundation against 808 support.`,
          nextCheck: `${drumHitCount(pattern)} drum hits now; use Composer Actions again when the pocket needs another writing pass.`
        };
      case "bass":
        return {
          auditionCue: `Loop Pattern ${project.selectedPattern}; hear the Composer Action 808 line against kick placement.`,
          nextCheck: `${pattern.bassNotes.length} 808 notes now; check glide and root movement before adding more melody.`
        };
      case "harmony":
        return {
          auditionCue: `Loop Pattern ${project.selectedPattern}; hear the Composer Action chords under the 808 and Synth lanes.`,
          nextCheck: `${chordMotionLabel(pattern.chordEvents)} chord motion now; confirm melody notes stay in key.`
        };
      case "melody":
        return {
          auditionCue: `Loop Pattern ${project.selectedPattern}; hear the Composer Action Synth motif against chords and 808.`,
          nextCheck: `${pattern.melodyNotes.length} Synth notes now; check hook contrast before arranging.`
        };
      case "arrange":
        return {
          auditionCue: `Play Song loop; scan the Composer Action arrangement across ${barCountLabel(arrangementTotalBars(project))}.`,
          nextCheck: `${project.arrangement.length} blocks now; compare the form against ${target.name}.`
        };
      case "finish":
        return {
          auditionCue: `Play full mix; watch ${formatDb(analysis.headroomDb)} headroom after the Composer Action finish move.`,
          nextCheck: `${project.masterPreset} selected; run Export Preflight and Mix Coach before exporting.`
        };
    }
  }

  if (action.id === "key-compass-focus") {
    return {
      auditionCue: "Use the focused Key Compass card to inspect scale, cadence, chord, bass, or melody posture before editing notes.",
      nextCheck: "Return to Key Compass after the focused harmony lane changes."
    };
  }

  if (action.id.startsWith("key-compass-card-")) {
    return {
      auditionCue: "Use the focused Key Compass card to inspect that harmony lane before editing notes or chords.",
      nextCheck: "Return to Key Compass when you need another direct scale, cadence, chord, 808/bass, melody, or selected focus."
    };
  }

  if (action.id === "tempo-nudge-readout-action") {
    return {
      auditionCue: "Use the Tempo Nudge readout before changing BPM, arranging sections, recording MIDI, or exporting.",
      nextCheck: "Run a Tempo Nudge command only when one of the bounded -1, +1, half-time, or double-time routes should become the project BPM."
    };
  }

  if (action.id.startsWith("tempo-nudge-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm the tempo supports the groove pocket, 808 movement, and melody timing.`,
      nextCheck: "Use Tap Tempo, Tempo Nudge Pads, Style Inspector BPM range, and transport playback to refine the final BPM."
    };
  }

  if (action.id === "swing-feel-readout-action") {
    return {
      auditionCue: "Use the Swing Feel readout before changing groove timing, programming drums, arranging sections, recording MIDI, or exporting.",
      nextCheck: "Run a Swing Feel command only when one of the Straight, Tight, Laid, Loose, or style-default targets should become the project swing."
    };
  }

  if (action.id.startsWith("swing-feel-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; listen to hats, clap placement, and 808 timing against the new swing feel.`,
      nextCheck: "Use Groove Compass, Style Inspector swing, and the manual Swing slider if the pocket needs finer adjustment."
    };
  }

  if (action.id === "metronome-toggle") {
    return {
      auditionCue: "Play the current loop and use the click only as a timing reference.",
      nextCheck: "Confirm the grid feel while programming, then export WAV/stems knowing the metronome stays out of rendered audio."
    };
  }

  if (action.id === "tap-tempo-readout-action") {
    return {
      auditionCue: "Use the Tap Tempo readout before adding tap pulses, nudging BPM, arranging sections, recording MIDI, or exporting.",
      nextCheck: "Run Tap Tempo only when you want the current pulse estimate to become an explicit project BPM change."
    };
  }

  if (action.id === "tap-tempo") {
    return {
      auditionCue: "Run Tap tempo pulse repeatedly in time with the groove, then pause briefly so the existing Tap Tempo commit can apply the averaged BPM.",
      nextCheck: "Check the Tap Tempo readout and project BPM before locking arrangement, metronome, or export timing."
    };
  }

  if (action.id === "section-locator-readout-action") {
    return {
      auditionCue: "Review the suggested section block, Pattern assignment, bar range, and event count before changing the Block loop cue.",
      nextCheck: "Cue Section Locator only after the readout target is the section you want to audition."
    };
  }

  if (action.id === "section-locator-decision") {
    return {
      auditionCue: "Play Block loop; hear the suggested section cue against its assigned Pattern before changing the arrangement.",
      nextCheck: "Return to Section Locator Cue Decision before cueing another suggested section."
    };
  }

  if (action.id.startsWith("section-locator-")) {
    const section = sectionLocatorActionSection(action.id) ?? "section";
    return {
      auditionCue: `Play Block loop; hear the cued ${section} block against its assigned Pattern before changing the arrangement.`,
      nextCheck: "Use Song Form Overview, Arrangement Playback Readout, or Arrangement Focus before editing nearby blocks."
    };
  }

  if (action.id === "song-form-overview-readout-action") {
    return {
      auditionCue: "Review Song Form Overview before changing section order, Pattern A/B/C assignments, energy, or muted-track posture.",
      nextCheck: "Open Song Form Priority only after the readout target is the block you want to inspect."
    };
  }

  if (action.id === "song-form-priority") {
    return {
      auditionCue: "Play Song or Block loop after focusing the priority block and compare the section, Pattern, energy, and mute posture.",
      nextCheck: "Return to Song Form Overview before applying Pattern Chain, Arrangement Template, Arrangement Arc, or selected-block edits."
    };
  }

  if (action.id.startsWith("arrangement-block-jump-")) {
    return {
      auditionCue: `Play Block loop or Song loop to hear Block navigation against Pattern ${project.selectedPattern}.`,
      nextCheck: "Use the selected-block editor, Arrangement Focus, or Section Locator before changing the song form."
    };
  }

  if (action.id.startsWith("arrangement-block-cue-")) {
    return {
      auditionCue: `Play Block loop; audition the cued block against Pattern ${project.selectedPattern} before editing arrangement details.`,
      nextCheck: "Use Arrangement Playback Readout, Song Form Overview, or Arrangement Focus before changing nearby blocks."
    };
  }

  const styleGoalCueGoal = styleGoalCueQuickActionGoal(action.id);
  if (styleGoalCueGoal) {
    if (styleGoalCueGoal === "arrange") {
      return {
        auditionCue: `Play Song loop; scan the Style Goal arrangement cue across ${barCountLabel(arrangementTotalBars(project))}.`,
        nextCheck: "Run the matching Style Goal Action only after the song-form cue exposes the next arrangement gap."
      };
    }

    return {
      auditionCue: `Play Pattern loop; inspect the Style Goal ${styleGoalCueLabel(
        styleGoalCueGoal
      )} cue on Pattern ${project.selectedPattern} before applying a writing move.`,
      nextCheck: "Run the matching Style Goal Action only if the cued loop still needs that layer."
    };
  }

  if (action.id === "key-retarget-readout-action") {
    return {
      auditionCue: "Use the Key Retarget readout before changing project key, editing notes or chords, arranging sections, recording MIDI, or exporting.",
      nextCheck: "Run a Key Retarget command only when one of the listed key targets should rewrite Pattern A/B/C bass, melody, and chord roots."
    };
  }

  if (action.id.startsWith("key-quick-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm retargeted 808, Synth, and chord roots still support the beat.`,
      nextCheck: "Use Key Compass, selected-note degree readout, and selected-chord harmonic readout to refine the retargeted key."
    };
  }

  if (action.id === "style-inspector-focus") {
    return {
      auditionCue: "Use the focused Style Inspector item to inspect BPM, swing, bass, melody, sound, goal progress, or Pattern density before changing style or writing parts.",
      nextCheck: "Return to Style Inspector after the focused style posture item is ready or intentionally deferred."
    };
  }

  if (action.id.startsWith("style-inspector-item-")) {
    return {
      auditionCue: "Use the focused Style Inspector lane to inspect genre fit before changing style or writing parts.",
      nextCheck: "Return to Style Inspector when you need another direct BPM, swing, bass, melody, sound, goal, or density focus."
    };
  }

  if (action.id === "style-direction-readout-action") {
    return {
      auditionCue: "Use the Style Direction readout before applying a different style, writing parts, arranging, recording MIDI, or exporting.",
      nextCheck: "Run a Style Quick Pick only when one of the listed style targets should reset BPM, swing, and direct-composition direction."
    };
  }

  if (action.id.startsWith("style-quick-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm the applied style's drums, 808, harmony, melody, and swing before arranging.`,
      nextCheck: "Use Style Inspector, current-style starter preview, and manual Pattern editors to refine the new style direction."
    };
  }

  if (action.id.startsWith("pattern-variation-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm the applied variation's drums, 808, chords, and Synth before arranging.`,
      nextCheck: "Use Pattern Compare, Pattern DNA, Pattern Clone, or Pattern Chain when the variation should feed the arrangement."
    };
  }

  if (action.id.startsWith("pattern-switch-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm this variation's drums, 808, chords, and Synth before editing.`,
      nextCheck: "Use Pattern Compare, Pattern DNA, Pattern Clone, or Pattern Chain when the selected variation should feed the arrangement."
    };
  }

  if (action.id === "pattern-playback-readout-action") {
    return {
      auditionCue: "Use the edit-vs-heard Pattern readout before changing notes, drums, chords, melody, or arrangement assignments.",
      nextCheck: "Run Audible Pattern Follow only when the heard Pattern should become the explicit editing Pattern."
    };
  }

  if (action.id === "pattern-follow-audible") {
    return {
      auditionCue: `Keep playback running only if you need live context; edit Pattern ${project.selectedPattern} after confirming it is the audible lane.`,
      nextCheck: "Use Pattern Playback Readout to confirm Editing and Hearing match before changing events."
    };
  }

  if (action.id === "arrangement-follow-audible") {
    return {
      auditionCue:
        "Keep Song playback running only if you need live context; edit the selected block after confirming it is the audible section.",
      nextCheck: "Use Arrangement Playback Readout and Song Form Overview to confirm Editing and Hearing match before changing arrangement details."
    };
  }

  if (action.id === "audible-arrangement-follow-readout-action") {
    return {
      auditionCue:
        "Review whether the heard arrangement block should become the explicit editing block before running Audible Arrangement Follow.",
      nextCheck: "Run Audible Arrangement Follow only when the audible block is the section you want to edit now."
    };
  }

  if (action.id === "selected-arrangement-block-readout-action") {
    return {
      auditionCue:
        "Review the selected block role, Pattern, bar range, energy, mute posture, and event count before jumping or cueing another arrangement block.",
      nextCheck: "Run Arrangement Block Jump or Cue only when the next block should become the explicit edit or audition target."
    };
  }

  if (action.id === "arrangement-playback-readout-action") {
    return {
      auditionCue:
        "Use the edit-vs-heard Arrangement readout before changing section order, block details, Pattern placement, or arrangement energy.",
      nextCheck: "Run Audible Arrangement Follow only when the heard block should become the explicit editing block."
    };
  }

  if (action.id.startsWith("pattern-cue-")) {
    return {
      auditionCue: `Play Pattern loop; compare Pattern ${project.selectedPattern}'s drums, 808, chords, and Synth before editing or arranging.`,
      nextCheck: "Use Pattern Switch to edit the cued variation or Pattern Use to place it into the selected arrangement block."
    };
  }

  if (action.id === "pattern-use-readout-action") {
    return {
      auditionCue:
        "Review the selected-block placement, target Pattern event posture, and arrangement usage before assigning a Pattern to the block.",
      nextCheck: "Run a direct Pattern Use command only when that Pattern should become the selected block's arrangement assignment."
    };
  }

  if (action.id === "pattern-compare-decision") {
    const target = patternCompareDecisionQuickActionTarget(action) ?? project.selectedPattern;
    if (patternCompareDecisionQuickActionKind(action) === "use") {
      return {
        auditionCue: `Play Block loop; confirm the recommended Pattern ${target} now supports the selected arrangement block.`,
        nextCheck: "Read Pattern Compare Result, then scan Song Form Overview and Arrangement Playback Readout before placing another variation."
      };
    }

    return {
      auditionCue: `Play Pattern loop; compare recommended Pattern ${target}'s drums, 808, chords, and Synth before editing or arranging.`,
      nextCheck: "Read Pattern Compare Result, then use Pattern Switch for edits or Pattern Use when this loop should enter the song."
    };
  }

  if (action.id.startsWith("pattern-use-")) {
    return {
      auditionCue: `Play Block loop; confirm the selected arrangement block now works with Pattern ${project.selectedPattern}.`,
      nextCheck: "Scan Song Form Overview, Pattern Compare, and Arrangement Playback Readout before placing the next variation."
    };
  }

  if (action.id.startsWith("pattern-copy-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm the copied drums, 808, chords, and Synth before arranging it.`,
      nextCheck: "Use Pattern Edit Result, Pattern Compare, Pattern DNA, and manual editors to refine the copied loop."
    };
  }

  if (action.id === "pattern-clear") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm the cleared slot is silent before writing a new loop.`,
      nextCheck: "Use Layer Starter, Drum Foundation, Keyboard Capture, or manual editors to rebuild the cleared Pattern."
    };
  }

  if (action.id === "groove-compass-cue") {
    return {
      auditionCue: `Play Pattern loop; listen to Pattern ${project.selectedPattern} density, anchors, hats, timing, chance, and pocket before editing drums.`,
      nextCheck: "Use Groove Compass focus cards or selected-drum tools only after the cued loop exposes the pocket issue."
    };
  }

  if (action.id === "groove-compass-focus") {
    return {
      auditionCue: "Use the focused Groove Compass card to inspect rhythm density, anchors, hats, timing, chance, or pocket balance before editing drums.",
      nextCheck: "Return to Groove Compass after the focused pocket lane changes."
    };
  }

  if (action.id.startsWith("groove-compass-card-")) {
    return {
      auditionCue: "Use the focused Groove Compass card to inspect that pocket lane before editing drums.",
      nextCheck: "Return to Groove Compass when you need another direct density, anchors, hats, timing, chance, pocket balance, or selected-drum focus."
    };
  }

  if (action.id === "pattern-dna-focus") {
    return {
      auditionCue: "Use the focused Pattern DNA card to inspect layers, density, dynamics, variation, or arrangement use before changing the loop.",
      nextCheck: "Return to Pattern DNA after the focused loop or arrangement lane changes."
    };
  }

  if (action.id.startsWith("pattern-dna-card-")) {
    return {
      auditionCue: "Use the focused Pattern DNA card to inspect that loop posture lane before changing events or arrangement.",
      nextCheck: "Return to Pattern DNA when you need another direct layers, density, dynamics, variation, or arrangement focus."
    };
  }

  if (action.id === "layer-starter") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm the starter layer supports the groove, 808, harmony, and melody balance.`,
      nextCheck: "Return to Layer Starter or Pattern DNA after the selected layer is no longer missing or thin."
    };
  }

  if (action.id.startsWith("layer-starter-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm the chosen starter layer supports the groove, low end, harmony, and melody balance.`,
      nextCheck: "Return to Layer Starter or Pattern DNA before starting another missing or thin layer."
    };
  }

  if (action.id.startsWith("pattern-clone-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; compare the cloned variation against the source Pattern before arranging it.`,
      nextCheck: "Use Pattern Compare, Pattern DNA, and selected-note/chord/drum tools to refine the cloned variation."
    };
  }

  if (action.id === "pattern-stack") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; hear 808, Chords, and Synth against the drums before arranging.`,
      nextCheck: "Use the Pattern Stack Result, selected-note tools, and selected-chord tools for manual edits."
    };
  }

  if (action.id.startsWith("pattern-stack-pad-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; hear the chosen 808, chord, and Synth stack against the drums before arranging.`,
      nextCheck: "Use Pattern Stack Result plus selected-note and selected-chord tools for manual edits."
    };
  }

  if (action.id === "drum-move") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; check kick/clap anchors, hat pocket, and percussion motion.`,
      nextCheck: "Use the Drum Move Result plus selected-drum pocket and hit tools for manual corrections."
    };
  }

  if (action.id === "808-move") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; check kick-to-808 lock, slides, and low-end contour.`,
      nextCheck: "Use the 808 Move Result plus selected-note degree/role and 808 edit tools for manual corrections."
    };
  }

  if (action.id === "melody-move") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; check Synth phrase shape against chords, 808, and drums.`,
      nextCheck: "Use the Melody Move Result plus selected-note degree/role and melody edit tools for manual corrections."
    };
  }

  if (action.id === "chord-move") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; check chord color, rhythm, and voicing against 808 and Synth.`,
      nextCheck: "Use the Chord Move Result plus selected-chord harmonic readout and chord edit tools for manual corrections."
    };
  }

  if (action.id === "sound-focus-decision") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; follow the visible Sound Focus Preview Decision before another tone-focus move.`,
      nextCheck: "Use the Sound Focus Result and Studio tone controls for manual kick, 808, Synth, and Chord corrections."
    };
  }

  if (action.id === "sound-focus" || action.id.startsWith("sound-focus-pad-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; hear drums, 808, Synth, and Chords with the new tone posture.`,
      nextCheck: "Use the Sound Focus Result and Studio tone controls for manual kick, 808, Synth, and Chord corrections."
    };
  }

  if (action.id === "timbre-check") {
    const timbre = createSoundTimbreCheckSummary(project.sound);
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; inspect Timbre Check before changing preset, kit, focus, or Studio tone controls.`,
      nextCheck: timbre.nextCheck
    };
  }

  if (action.id === "studio-tone-baseline") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; adjust one Studio tone control against the captured baseline.`,
      nextCheck: "Use Studio Tone Drift or Sound Snapshot A/B after a concrete manual tone change."
    };
  }

  if (action.id === "studio-tone-drift" || action.id.startsWith("studio-tone-reset-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; hear drums, 808, Synth, and Chords after the Studio tone reset.`,
      nextCheck: "Capture a new Studio Tone baseline only if the reset or manual trim now fits the beat."
    };
  }

  if (action.id === "sound-preset-readout-action") {
    return {
      auditionCue: `Use the Sound Preset readout before applying a full-tone preset, then loop Pattern ${project.selectedPattern}.`,
      nextCheck: "Apply Sound Preset only when the preview target fits the beat; otherwise trim Drum Kit, Sound Focus, or Studio tone manually."
    };
  }

  if (action.id === "sound-preset-decision") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; follow the visible Sound Preset Preview Decision before another full-tone move.`,
      nextCheck: "Use the Sound Preset Result, then trim with Drum Kit, Sound Focus, or Studio tone controls."
    };
  }

  if (action.id === "sound-preset" || action.id.startsWith("sound-preset-pad-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; hear drums, 808, Synth, and Chords under the applied full-tone preset.`,
      nextCheck: "Use the Sound Preset Result, then trim with Drum Kit, Sound Focus, or Studio tone controls."
    };
  }

  if (action.id === "drum-kit-decision") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; follow the visible Drum Kit Preview Decision before another built-in kit move.`,
      nextCheck: "Use the Drum Kit Result plus Studio tone and drum rack mixer controls for manual trim."
    };
  }

  if (action.id === "drum-kit-readout-action") {
    return {
      auditionCue: `Use the Drum Kit readout before applying a built-in kit, then loop Pattern ${project.selectedPattern}.`,
      nextCheck: "Apply Drum Kit only when the preview target fits the groove; otherwise trim kick, clap, hat, or drum rack controls manually."
    };
  }

  if (action.id === "drum-kit" || action.id.startsWith("drum-kit-pad-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; hear kick, clap, hat, and 808 balance after the kit change.`,
      nextCheck: "Use the Drum Kit Result plus Studio tone and drum rack mixer controls for manual trim."
    };
  }

  if (action.id === "sound-focus-readout-action") {
    return {
      auditionCue: `Use the Sound Focus readout before applying a tone-focus pad, then loop Pattern ${project.selectedPattern}.`,
      nextCheck: "Apply Sound Focus only when the preview target fits the beat; otherwise trim 808, Synth, Chords, or Studio tone controls manually."
    };
  }

  if (action.id === "beat-readiness-focus" || action.id.startsWith("beat-readiness-check-")) {
    return {
      auditionCue: "Use the focused panel to inspect the readiness issue before changing project data.",
      nextCheck: "Return to Beat Readiness after the next explicit drums, 808, harmony, arrangement, or export move."
    };
  }

  if (action.id === "listening-pass-focus") {
    return {
      auditionCue: "Use the focused Listening Pass checkpoint to choose Pattern, Song, Full Mix, stem, or delivery-target audition scope.",
      nextCheck: "Return to Listening Pass after the focused composition, arrangement, mix, or delivery checkpoint changes."
    };
  }

  if (action.id.startsWith("listening-pass-checkpoint-")) {
    return {
      auditionCue: "Use the focused Listening Pass checkpoint to inspect that audition lane before changing the beat.",
      nextCheck: "Return to Listening Pass when you need another direct composition, arrangement, mix, or delivery listening focus."
    };
  }

  if (action.id === "beat-passport-focus") {
    return {
      auditionCue: "Use the focused Beat Passport metric to inspect target, length, Pattern use, readiness, export, stems, or master posture.",
      nextCheck: "Return to Beat Passport after the focused identity metric is ready or intentionally deferred."
    };
  }

  if (action.id.startsWith("beat-passport-metric-")) {
    return {
      auditionCue: "Use the focused Beat Passport metric to inspect that identity lane before changing the beat.",
      nextCheck: "Return to Beat Passport when you need another direct target, length, Pattern, readiness, export, stem, or master focus."
    };
  }

  if (action.id === "production-snapshot-focus") {
    return {
      auditionCue: "Use the focused Production Snapshot metric to inspect target fit, song form, pattern coverage, mix posture, or handoff posture.",
      nextCheck: "Return to Production Snapshot after the focused session metric is ready or intentionally deferred."
    };
  }

  if (action.id.startsWith("production-snapshot-metric-")) {
    return {
      auditionCue: "Use the focused Production Snapshot metric to inspect that session-scan lane before changing the beat.",
      nextCheck: "Return to Production Snapshot when you need another direct target, form, pattern, mix, or handoff focus."
    };
  }

  if (action.id === "snapshot-compare-focus") {
    return {
      auditionCue: "Use the focused Snapshot Compare metric to inspect the saved take against the current beat before restoring, deleting, or making major edits.",
      nextCheck: "Return to Snapshot Compare after the focused saved-take lane is understood or intentionally deferred."
    };
  }

  if (action.id.startsWith("snapshot-compare-metric-")) {
    return {
      auditionCue: "Use the focused Snapshot Compare metric to inspect that saved-take lane before changing project data.",
      nextCheck: "Return to Snapshot Compare when you need another direct setup, length, readiness, export, stems, or master comparison."
    };
  }

  if (action.id === "hook-readiness-focus") {
    return {
      auditionCue: "Use the focused Hook Readiness card to inspect hook section, motif, contrast, mix support, or handoff posture.",
      nextCheck: "Return to Hook Readiness after the focused hook lane is ready or intentionally deferred."
    };
  }

  if (action.id === "hook-loop-cue" || action.id.startsWith("hook-readiness-cue-")) {
    return {
      auditionCue: "Play Hook Block loop and judge the hook section only before changing motif density, contrast, mix support, or handoff context.",
      nextCheck: "Return to Hook Readiness after the loop to decide whether the section, motif, contrast, mix, or handoff lane needs the next edit."
    };
  }

  if (action.id === "hook-fix" || action.id.startsWith("hook-readiness-fix-")) {
    return {
      auditionCue: "Cue and play the Hook loop after the fix, then judge section, motif, contrast, mix support, and handoff context.",
      nextCheck: "Return to Hook Readiness and check whether the fixed card moved toward ready before applying another one-step fix."
    };
  }

  if (action.id === "topline-loop-cue" || action.id.startsWith("topline-space-cue-")) {
    return {
      auditionCue: "Play Topline loop and listen only for vocal/lead room before trimming melody density, pocket, hook window, or headroom.",
      nextCheck: "Return to Topline Space after the loop to decide whether the pocket, lead density, window, mix, or artist cue lane needs the next edit."
    };
  }

  if (action.id === "topline-fix" || action.id.startsWith("topline-space-fix-")) {
    return {
      auditionCue: "Cue and play the Topline loop after the fix, then listen only for vocal/lead room.",
      nextCheck: "Return to Topline Space and check whether the fixed card moved toward ready before applying another one-step fix."
    };
  }

  if (action.id.startsWith("hook-readiness-card-")) {
    return {
      auditionCue: "Use the focused Hook Readiness card before changing arrangement, motif, mix, or handoff details.",
      nextCheck: "Return to Hook Readiness when you need another direct hook section, motif, contrast, mix, or delivery focus."
    };
  }

  if (action.id === "topline-space-focus") {
    return {
      auditionCue: "Use the focused Topline Space card to inspect pocket, lead density, vocal window, headroom, or artist context.",
      nextCheck: "Return to Topline Space after the focused vocal pocket lane is ready or intentionally deferred."
    };
  }

  if (action.id.startsWith("topline-space-card-")) {
    return {
      auditionCue: "Use the focused Topline Space card before trimming melody, arranging the hook, checking mix space, or filling brief context.",
      nextCheck: "Return to Topline Space when you need another direct vocal pocket, lead room, arrangement, mix, or brief focus."
    };
  }

  if (action.id === "arrangement-mute-map-readout-action") {
    return {
      auditionCue: "Review the Arrangement Mute Map priority lane, section mute/live posture, and selected-block context before focusing a lane.",
      nextCheck: "Focus Arrangement Mute Map only after the readout lane is the layer you want to inspect."
    };
  }

  if (action.id === "arrangement-mute-map-focus") {
    return {
      auditionCue: "Use the focused Arrangement Mute Map lane to hear where that layer drops out across Song playback.",
      nextCheck: "Return to Mute Map, Song Form Overview, or Arrangement Focus before changing block mutes."
    };
  }

  if (action.id.startsWith("arrangement-mute-map-lane-")) {
    return {
      auditionCue: "Play Song loop and follow the focused Mute Map lane through each section before editing block mutes.",
      nextCheck: "Use the selected-block mute buttons only when the lane needs more drop, build, or hook contrast."
    };
  }

  if (action.id === "arrangement-transition-map-readout-action") {
    return {
      auditionCue: "Review the Arrangement Transition Map priority handoff, Pattern change, energy movement, muted-layer change, and loop context before focusing or cueing it.",
      nextCheck: "Focus or cue the Arrangement Transition Map only after the readout handoff is the boundary you want to inspect."
    };
  }

  if (action.id === "arrangement-transition-map-focus") {
    return {
      auditionCue: "Play Song loop around the focused transition and listen for the section handoff, energy movement, and layer contrast.",
      nextCheck: "Return to Transition Map, Song Form Overview, or Arrangement Focus before changing the adjacent blocks."
    };
  }

  if (action.id.startsWith("arrangement-transition-map-transition-")) {
    return {
      auditionCue: "Use the focused transition card to check whether the handoff needs a fill, drop, build, pattern change, or layer change.",
      nextCheck: "Edit only the adjacent arrangement blocks or Pattern tail if the transition still feels flat."
    };
  }

  if (action.id === "transition-loop-cue" || action.id.startsWith("transition-loop-cue-")) {
    return {
      auditionCue: "Play Turn loop and listen only to the cued two-block handoff before editing fills, energy, or mutes.",
      nextCheck: "Return to Transition Map or Arrangement Focus after the loop to decide whether the boundary needs a Pattern, layer, or energy change."
    };
  }

  if (action.id === "handoff-pack") {
    return {
      auditionCue: "Read Handoff Pack before sending so WAV, stems, MIDI, Handoff Sheet, route, manifest, receipt, format, and send order agree.",
      nextCheck: "Run Handoff Next Export or an explicit deliverable export only after the current package readout points to that item."
    };
  }

  if (action.id === "handoff-package-check-focus") {
    return {
      auditionCue: "Use the focused Handoff Package Check card to inspect file set, export order, latest receipt, or session context before sending.",
      nextCheck: "Return to Handoff Package Check after the focused package lane is ready or intentionally deferred."
    };
  }

  if (action.id.startsWith("handoff-package-check-card-")) {
    return {
      auditionCue: "Use the focused package card before running explicit WAV, stem, MIDI, or Handoff Sheet exports.",
      nextCheck: "Return to Handoff Package Check when you need another file-set, order, receipt, or context review."
    };
  }

  if (action.id === "handoff-export-receipt-focus") {
    return {
      auditionCue: "Read the latest Handoff Export Receipt before assuming a WAV, stems, MIDI, or Handoff Sheet deliverable is ready.",
      nextCheck: "If the receipt is empty or outdated, run Handoff Next Export or the explicit deliverable export you need."
    };
  }

  if (action.id === "handoff-send-order-focus") {
    return {
      auditionCue: "Read Handoff Send Order before running Handoff Next Export so the next WAV, stems, MIDI, or Handoff Sheet step is deliberate.",
      nextCheck: "If the next step is correct, run Handoff Next Export or the matching explicit export button."
    };
  }

  if (action.id === "handoff-manifest-audit-focus") {
    return {
      auditionCue: "Read Manifest Audit before sending files so planned WAV, stems, MIDI, and Handoff Sheet readiness match the latest receipt.",
      nextCheck: "If any file lane is not ready, use Handoff Send Order, Handoff Export Receipt, or the explicit deliverable export before sending."
    };
  }

  if (action.id === "handoff-export-format-focus") {
    return {
      auditionCue: "Use the focused Export Format metric to inspect WAV, stem, MIDI, or Handoff Sheet format before exporting.",
      nextCheck: "Return to Export Format Readout after the focused deliverable format is ready or intentionally deferred."
    };
  }

  if (action.id.startsWith("handoff-export-format-")) {
    return {
      auditionCue: "Use the selected format metric to confirm the deliverable details before running an explicit export.",
      nextCheck: "Check Handoff Package Send Order before exporting files for delivery."
    };
  }

  if (action.id === "finish-checklist-focus") {
    return {
      auditionCue: "Use the focused Finish Checklist card to inspect the next Compose, Arrange, Mix, Master, or Handoff readiness step.",
      nextCheck: "Return to Finish Checklist after the focused finish card is ready or intentionally deferred."
    };
  }

  if (action.id.startsWith("finish-checklist-card-")) {
    return {
      auditionCue: "Use the focused Finish Checklist card to inspect that finish-readiness lane before applying any move.",
      nextCheck: "Return to Finish Checklist when you need another direct Compose, Arrange, Mix, Master, or Handoff readiness focus."
    };
  }

  if (action.id === "review-queue-focus") {
    return {
      auditionCue: "Use the focused Review Queue panel to inspect the highest-priority production issue.",
      nextCheck: "Run the visible Review Queue Focus buttons after you address the top issue."
    };
  }

  if (action.id.startsWith("review-queue-item-")) {
    return {
      auditionCue: "Use the focused Review Queue item to inspect that production issue before applying any fix.",
      nextCheck: "Return to Review Queue when you need another direct issue triage focus."
    };
  }

  if (action.id === "review-fix" || action.id.startsWith("review-queue-fix-")) {
    return quickActionReviewFixFollowup(project, action, analysis);
  }

  if (action.id === "export-preflight-focus") {
    return {
      auditionCue: "Use the focused Export Preflight card to inspect the current delivery risk before exporting.",
      nextCheck: "Return to Export Preflight after the focused readiness, mix, deliverable, or handoff item looks clear."
    };
  }

  if (action.id.startsWith("export-preflight-card-")) {
    return {
      auditionCue: "Use the focused Export Preflight card to inspect that delivery-risk lane before exporting.",
      nextCheck: "Return to Export Preflight when you need another direct readiness, mix, deliverable, or handoff focus."
    };
  }

  if (action.id === "workflow-spotlight-focus") {
    return (
      quickActionWorkflowSpotlightFollowup(project, action, analysis) ?? {
        auditionCue: "Use the focused workflow panel to inspect the highlighted blocker or review zone.",
        nextCheck: "Return to Workflow Spotlight after the zone looks ready and run the command again for the next jump."
      }
    );
  }

  if (action.id.startsWith("workflow-navigator-")) {
    return (
      quickActionWorkflowNavigatorFollowup(project, action, analysis) ?? {
        auditionCue: "Use the jumped workflow panel to continue the current compose, arrange, mix, or deliver pass.",
        nextCheck: "Return to Workflow Navigator when you need another direct workstation zone jump."
      }
    );
  }

  if (action.id === "chain-expand-readout-action") {
    return {
      auditionCue: "Play Song loop and scan whether the current Pattern A/B/C chain is ready to become a 16-bar outline.",
      nextCheck: "Run Chain Expand only after the readout outline supports the intro, verse, hook, bridge, hook, and outro flow."
    };
  }

  if (action.id === "chain-expand") {
    return {
      auditionCue: "Play Song loop; scan intro, verse, hook, bridge, hook, and outro flow.",
      nextCheck: `${barCountLabel(arrangementTotalBars(project))} now; compare the song form against ${target.name}.`
    };
  }

  if (action.id === "pattern-chain-readout-action") {
    return {
      auditionCue: "Play Song loop or Block loop and compare Pattern A/B/C contrast before applying a chain.",
      nextCheck: "Apply Pattern Chain or Chain Expand only after the readout sequence supports the hook and section flow."
    };
  }

  if (action.id.startsWith("pattern-chain-")) {
    return {
      auditionCue: "Play Song loop; check Pattern A/B/C contrast, section energy, and hook placement.",
      nextCheck:
        action.id === "pattern-chain-decision"
          ? "Return to Pattern Chain Preview Decision before running another chain or expand move."
          : `${barCountLabel(arrangementTotalBars(project))} arranged; use the Pattern Chain Result and Song Form Overview before mix decisions.`
    };
  }

  if (action.id === "arrangement-template-readout-action") {
    return {
      auditionCue: "Play Song loop and scan whether the current song-form template supports the section order and Pattern A/B/C spread.",
      nextCheck:
        "Apply Arrangement Template only after the readout template, hook placement, and Pattern spread support the beat."
    };
  }

  if (
    action.id === "arrangement-template-decision" ||
    action.id === "arrangement-template" ||
    action.id.startsWith("arrangement-template-direct-")
  ) {
    return {
      auditionCue: "Play Song loop; check section order, Pattern A/B/C spread, and hook placement.",
      nextCheck:
        action.id === "arrangement-template-decision"
          ? "Return to Arrangement Template Preview Decision before running another song-form template move."
          : `${barCountLabel(arrangementTotalBars(project))} arranged; scan Song Form Overview before mix decisions.`
    };
  }

  if (action.id === "arrangement-move-readout-action") {
    return {
      auditionCue: "Play Block loop and confirm the selected block energy and mute contrast before applying a Drop, Build, or Hook Lift move.",
      nextCheck: "Apply Arrangement Move only after the readout posture supports the section role and surrounding song form."
    };
  }

  if (action.id === "arrangement-move" || action.id === "arrangement-move-decision") {
    return {
      auditionCue: "Play Block loop; hear the selected block's energy and mute contrast against the surrounding song form.",
      nextCheck:
        action.id === "arrangement-move-decision"
          ? "Return to Arrangement Move Preview Decision before running another selected-block energy or mute move."
          : "Use Arrangement Playback Readout, Song Form Overview, and Arrangement Focus before changing nearby blocks."
    };
  }

  if (action.id === "selected-block-copy") {
    return {
      auditionCue: "Use Paste copied block when the copied section shape should repeat in the arrangement.",
      nextCheck: "The arrangement block clipboard is UI-local; paste explicitly before changing to another editing task."
    };
  }

  if (action.id === "selected-block-edit-decision") {
    if (action.title.includes("Copy Block")) {
      return {
        auditionCue: "Use Paste copied block when the preview decision copied a section shape for later repetition.",
        nextCheck: "Return to Selected Block Edit Preview Decision after pasting or intentionally leaving the clipboard staged."
      };
    }
    return {
      auditionCue: "Play Song or Block loop after the preview-decision edit and compare it against the decision readout.",
      nextCheck: "Return to Selected Block Edit Preview Decision before running another structure edit."
    };
  }

  if (action.id === "selected-block-priority-edit") {
    return {
      auditionCue: "Play Song or Block loop after the recommended selected-block edit and compare it against the priority readout.",
      nextCheck: "Return to Selected Block Edit Priority before running another structure edit."
    };
  }

  if (action.id.startsWith("selected-block-")) {
    return {
      auditionCue: "Play Song or Block loop to hear the selected block edit in the full song form.",
      nextCheck: "Scan Song Form Overview and Arrangement Playback before the next structure edit."
    };
  }

  if (
    action.id === "arrangement-focus" ||
    action.id === "arrangement-focus-decision" ||
    action.id.startsWith("arrangement-focus-preset-")
  ) {
    return {
      auditionCue: "Play Block loop; hear the selected block's section role, Pattern assignment, energy, and mutes in context.",
      nextCheck:
        action.id === "arrangement-focus-decision"
          ? "Return to Arrangement Focus Preview Decision before running another selected-block focus move."
          : "Use the Arrangement Focus Result, Arrangement Playback Readout, and Song Form Overview before changing nearby blocks."
    };
  }

  if (action.id === "arrangement-focus-readout-action") {
    return {
      auditionCue: "Play Block loop and confirm the selected block role, Pattern assignment, energy, and mutes before applying a focus preset.",
      nextCheck: "Apply Arrangement Focus only after the readout block posture matches the section role you want."
    };
  }

  if (action.id === "arrangement-arc-readout-action") {
    return {
      auditionCue: "Play Song loop and scan whether the current full-song arc supports the hook lift, break, and outro movement.",
      nextCheck: "Apply Arrangement Arc only after the readout energy path supports the section flow and Pattern spread."
    };
  }

  if (action.id === "arrangement-arc" || action.id === "arrangement-arc-decision" || action.id.startsWith("arrangement-arc-pad-")) {
    return {
      auditionCue: "Play Song loop; listen for intro, verse, hook, bridge, and outro energy movement.",
      nextCheck:
        action.id === "arrangement-arc-decision"
          ? "Return to Arrangement Arc Preview Decision before running another full-song arc move."
          : `${Math.round(arrangementAverageEnergy(project) * 100)}% average energy; scan Song Form Overview before detailed block edits.`
    };
  }

  if (action.id === "mix-balance-readout-action") {
    return {
      auditionCue: "Use the Mix Balance readout before applying a rough-balance pad, then play Full Mix and core stems.",
      nextCheck: "Apply Mix Balance only when the preview target matches what you hear; otherwise trim manually in the Mixer."
    };
  }

  if (action.id === "mix-balance-decision") {
    return {
      auditionCue: "Play Full Mix and follow the visible Mix Balance Preview Decision before another rough-balance move.",
      nextCheck: "Use the Mix Balance Result, Stem Audition Pads, and manual mixer controls for final level, pan, EQ, and send trim."
    };
  }

  if (action.id === "mix-balance" || action.id.startsWith("mix-balance-pad-")) {
    return {
      auditionCue: "Play Full Mix, then solo Drums and 808 to confirm the rough balance supports the beat.",
      nextCheck: "Use the Mix Balance Result, Stem Audition Pads, and manual mixer controls for final level, pan, EQ, and send trim."
    };
  }

  if (action.id === "mix-coach-focus" || action.id.startsWith("mix-coach-check-")) {
    return {
      auditionCue: "Read the focused Mix Coach card, then play Full Mix or the matching stem before applying a Mix Fix.",
      nextCheck: "Use Headroom, Stem Balance, or Low End Mix Fix only after the focused check matches what you hear."
    };
  }

  if (action.id === "stem-audition-readout-action") {
    return {
      auditionCue: "Use the Stem Audition Readout before pressing Play or changing solo/mute, then listen to the current loop.",
      nextCheck: "Run Stem Audition Decision or a direct Full Mix/stem audition only when the readout points at the comparison you need."
    };
  }

  if (action.id.startsWith("stem-audition-")) {
    return {
      auditionCue: "Play the current loop and compare the selected stem against the Full Mix before changing levels.",
      nextCheck: "Use the Stem Audition Readout, Mix Balance Pads, and manual mixer controls to trim the lane you heard."
    };
  }

  if (action.id === "mix-snapshot-readout-action") {
    return {
      auditionCue: "Use the Mix Snapshot A/B readout before capturing, recalling, or clearing a mix pass, then play Full Mix and core stems.",
      nextCheck: "Capture or recall only after one concrete mix/master change creates an A/B decision worth committing."
    };
  }

  if (action.id.startsWith("mix-snapshot-")) {
    if (action.id === "mix-snapshot-clear") {
      return {
        auditionCue: "Play Full Mix after the next concrete mix change, then capture A before capturing B.",
        nextCheck: "Use Mix Snapshot A/B after at least one level, space, or master change creates something worth comparing."
      };
    }
    if (
      action.id === "mix-snapshot-recall-a" ||
      action.id === "mix-snapshot-recall-b" ||
      isMixSnapshotDecisionRecallAction(action)
    ) {
      return {
        auditionCue: "Play Full Mix to confirm the recalled mixer and master pass still fits the beat.",
        nextCheck: "Capture the alternate slot again after the next concrete level, space, or master change."
      };
    }
    if (action.id === "mix-snapshot-decision") {
      return {
        auditionCue: "Play Full Mix and follow the visible Mix Snapshot Decision Readout before the next capture.",
        nextCheck: "Use the Decision Readout after one concrete level, space, or master change creates an alternate pass."
      };
    }
    return {
      auditionCue: "Play Full Mix and compare the held snapshot against the alternate slot after a concrete mix change.",
      nextCheck: "Use Mix Snapshot A/B metrics for headroom, balance, master, and stem posture before Mix Fix or Master Finish."
    };
  }

  if (action.id.startsWith("sound-snapshot-")) {
    if (action.id === "sound-snapshot-readout-action") {
      return {
        auditionCue: "Loop Pattern A/B/C and inspect the Sound Snapshot A/B readout before capture, recall, or clear commands.",
        nextCheck: "Capture or recall only after the A/B tone-pass comparison points to a concrete preset, kit, focus, or Studio tone move."
      };
    }
    if (action.id === "sound-snapshot-clear") {
      return {
        auditionCue: "Loop Pattern A/B/C after the next concrete sound change, then capture A before capturing B.",
        nextCheck: "Use Sound Snapshot A/B after at least one preset, kit, focus, or Studio tone change creates something worth comparing."
      };
    }
    if (
      action.id === "sound-snapshot-recall-a" ||
      action.id === "sound-snapshot-recall-b" ||
      isSoundSnapshotDecisionRecallAction(action)
    ) {
      return {
        auditionCue: "Loop Pattern A/B/C with drums, 808, Synth, and Chords active to confirm the recalled tone pass.",
        nextCheck: "Capture the alternate slot again after the next concrete Sound Preset, Drum Kit, Sound Focus, or Studio tone change."
      };
    }
    if (action.id === "sound-snapshot-decision") {
      return {
        auditionCue: "Loop Pattern A/B/C and follow the visible Sound Snapshot readout before the next capture.",
        nextCheck: "Use the Sound Snapshot readout after one concrete preset, kit, focus, or Studio tone change creates an alternate pass."
      };
    }
    return {
      auditionCue: "Loop Pattern A/B/C and compare the held tone pass against the alternate slot after a concrete sound change.",
      nextCheck: "Use Sound Snapshot A/B with Timbre Check before committing to a preset, kit, or focus direction."
    };
  }

  const mixFixPreset = mixFixQuickActionPreset(action.id);
  if (mixFixPreset) {
    return {
      auditionCue: mixFixAuditionCue(mixFixPreset),
      nextCheck: mixFixNextCheck(mixFixPreset)
    };
  }

  const masterFinishPad = masterFinishQuickActionPad(action.id);
  if (action.id === "export-meter") {
    return {
      auditionCue: "Play Full Mix and read peak, RMS, dynamics, headroom, and limiter before Master Finish or delivery export.",
      nextCheck: "Use Mix Coach, Master Output Role, or manual ceiling/output trim only if the meter conflicts with the delivery target."
    };
  }

  if (action.id === "master-output-role") {
    return {
      auditionCue: "Play Full Mix and read Master Output Role beside Export Meter before Master Finish or delivery export.",
      nextCheck: "Use Master Finish, Mix Coach, or manual ceiling/output trim only if role, headroom, or limiter posture does not fit the delivery target."
    };
  }

  if (action.id === "master-finish-readout-action") {
    return {
      auditionCue: "Use the Master Finish readout before applying an output pad, then play Full Mix and inspect Export meter.",
      nextCheck: "Apply Master Finish only when the preview target fits the delivery goal; otherwise trim ceiling or output manually."
    };
  }

  if (action.id === "master-finish-decision") {
    return {
      auditionCue: "Play Full Mix and follow the visible Master Finish Preview Decision before another output posture move.",
      nextCheck: "Use Ceiling and master output controls for manual trim before WAV/stem export."
    };
  }

  if (action.id === "master-finish" || masterFinishPad) {
    return {
      auditionCue: "Play Full Mix; watch Export meter headroom and limiter.",
      nextCheck: "Use Ceiling and master output controls for manual trim before WAV/stem export."
    };
  }

  const masterAutomationPad = masterAutomationQuickActionPad(action.id);
  if (action.id === "master-automation-readout-action") {
    return {
      auditionCue: "Use the Master Automation readout before applying a fade lane, then play Song from the top and final bar.",
      nextCheck: "Apply Master Automation only when the fade preview supports the arrangement; otherwise leave automation manual."
    };
  }

  if (action.id === "master-automation-decision") {
    return {
      auditionCue: "Play Song and follow the visible Master Automation Preview Decision before another fade-lane move.",
      nextCheck: "Export WAV/stems after the fade feels right to confirm realtime and render behavior match."
    };
  }

  if (action.id === "master-automation" || masterAutomationPad) {
    return {
      auditionCue: masterAutomationPad
        ? masterAutomationAuditionCue(masterAutomationPad.id)
        : "Play Song from the top and final bar; confirm the master fade supports the arrangement.",
      nextCheck: "Export WAV/stems after the fade feels right to confirm realtime and render behavior match."
    };
  }

  const directExportTarget = directExportQuickActionTarget(action.id);
  if (directExportTarget) {
    switch (directExportTarget.id) {
      case "wav":
        return {
          auditionCue: "Open the downloaded WAV outside the app and confirm the full arrangement plays from start to finish.",
          nextCheck: "Use Handoff Export Receipt, Export Preflight, and Stem Export before sending the beat package."
        };
      case "stems":
        return {
          auditionCue: "Import or solo the downloaded stem WAVs outside the app and confirm Drums, 808, Synth, and Chords line up.",
          nextCheck: "Use Handoff Export Receipt and Manifest Audit before exporting MIDI or the Handoff Sheet."
        };
      case "midi":
        return {
          auditionCue: "Open the downloaded MIDI in a DAW and confirm the arrangement bars and Pattern A/B/C sections are usable.",
          nextCheck: "Use Handoff Export Receipt and the Handoff Sheet to keep the DAW handoff understandable."
        };
      case "sheet":
        return {
          auditionCue: "Open the Handoff Sheet text file and compare title, target, arrangement, export meter, stems, and Session Brief.",
          nextCheck: "Use Manifest Audit to confirm the WAV, stems, MIDI, and sheet are ready before sending."
        };
    }
  }

  if (action.id === "handoff-next-export") {
    return {
      auditionCue: "Confirm the downloaded deliverable outside the app, then return to Handoff Pack before exporting the next item.",
      nextCheck: "Use Handoff Export Receipt, Manifest Audit, and Send Order to verify the next WAV, stems, MIDI, or sheet step."
    };
  }

  if (action.id === "space-fx-readout-action") {
    return {
      auditionCue: "Use the Space FX readout before applying a shared-send pad, then play Full Mix and core stems.",
      nextCheck: "Apply Space FX only when the preview target matches what you hear; otherwise trim dry, room, wide, or wash manually."
    };
  }

  if (action.id === "space-fx-decision") {
    return {
      auditionCue: "Play Full Mix and follow the visible Space FX Preview Decision before another shared-send move.",
      nextCheck: "Use the Space FX Result and manual Space sliders for final dry, room, wide, or wash trim."
    };
  }

  if (action.id === "space-fx" || action.id.startsWith("space-fx-")) {
    return {
      auditionCue: "Play Full Mix, then solo Synth and Chords to hear the shared Space send around the drums and 808.",
      nextCheck: "Use the Space FX Result and manual Space sliders for final dry, room, wide, or wash trim."
    };
  }

  if (action.id === "undo" || action.id === "redo") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm ${action.detail.toLowerCase()} restored the intended beat state.`,
      nextCheck: "Read the Edit History label before the next undo or redo so experiments stay reversible."
    };
  }

  switch (action.group) {
    case "Transport":
      return {
        auditionCue: `Use the current ${project.selectedPattern} / Song loop choice to hear the edit in context.`,
        nextCheck: `${barCountLabel(arrangementTotalBars(project))} arranged; switch loop scope only when playback is stopped.`
      };
    case "Project":
      return {
        auditionCue: "Keep listening only if you are comparing the saved or loaded state.",
        nextCheck: `${project.snapshots.length}/${maxProjectSnapshots} snapshots; use Snapshot Compare before major edits.`
      };
    case "Edit":
      return {
        auditionCue: `Loop Pattern ${project.selectedPattern}; confirm the edit history restored the intended beat.`,
        nextCheck: `${projectEventTotal(project)} project events now; continue only after the groove still works.`
      };
    case "Create":
      return {
        auditionCue: `Loop Pattern ${project.selectedPattern}; hear drums, 808, chords, and Synth together.`,
        nextCheck: `${patternEventTotal(pattern)} Pattern ${project.selectedPattern} events now; arrange when the hook works.`
      };
    case "Arrange":
      return {
        auditionCue: "Play Song loop; listen for section contrast and hook lift.",
        nextCheck: `${barCountLabel(arrangementTotalBars(project))} arranged for ${target.name}; scan Song Form next.`
      };
    case "Mix":
      return {
        auditionCue: `Play full mix; watch ${formatDb(analysis.headroomDb)} headroom.`,
        nextCheck: `${analysis.status} export scan; use Mix Coach before final export.`
      };
    case "Export":
      return {
        auditionCue: "Audition the exported deliverable outside the app if needed.",
        nextCheck: `${analysis.status} mix state; confirm Handoff Pack statuses before sending.`
      };
    default:
      return {
        auditionCue: `Loop Pattern ${project.selectedPattern}; verify the command result in context.`,
        nextCheck: `${projectEventTotal(project)} project events now; continue with the next local action.`
      };
  }
}
