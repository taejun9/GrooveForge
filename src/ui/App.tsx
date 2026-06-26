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
  activeArrangementMuteMapQuickActionLane, activeArrangementTransitionMapQuickActionTransition, activeBassMoveQuickActionTarget, activeBeatPassportQuickActionMetric, activeBeatReadinessQuickActionCheck, activeBeatSpineQuickActionApplyCard, activeBeatSpineQuickActionCard, activeChordMoveQuickActionTarget, activeComposerGuideQuickActionCard, activeDrumMoveQuickActionTarget, activeExportPreflightQuickActionCard, activeFinishChecklistQuickActionCard, activeFirstBeatPathQuickActionStep, activeGrooveCompassQuickActionItem, activeGuideQuickStartBottleneckQuickActionTarget, activeGuideQuickStartQuickActionTarget, activeHandoffPackageCheckQuickActionCard, activeHookReadinessQuickActionCard, activeKeyCompassQuickActionItem, activeLayerStarterQuickActionOption, activeListeningPassQuickActionItem, activeMelodyMoveQuickActionTarget, activeModeFocusQuickActionCard, activePatternDnaQuickActionCard, activeProductionSnapshotQuickActionMetric, activeReviewFixItem, activeSectionLocatorPriorityPad, activeSessionPassQuickActionCard, activeSongFormPriorityMetric, activeStyleInspectorQuickActionItem, activeToplineSpaceQuickActionCard, applySessionBriefStarter, ArrangementArcPads, ArrangementArcPreviewDecision, ArrangementArcPriorityReadout, ArrangementArcResultStrip, arrangementAverageEnergy, arrangementBarsFromBlocks, arrangementBlockCueIndex, arrangementBlockJumpIndex, arrangementBlockMetricIdentity, ArrangementFocusPanel, ArrangementFocusPreviewDecision, ArrangementFocusResultStrip, arrangementLiftNextMoveAction, arrangementMatchesTemplate, ArrangementMovePreviewDecision, ArrangementMovePriorityReadout, arrangementMoveResultAuditionCue, ArrangementMoveResultStrip, ArrangementMuteMap, arrangementMuteMapFocusResultAudition, arrangementMuteMapFocusResultMetric, arrangementMuteMapFocusResultNextCheck, ArrangementMuteMapFocusResultStrip, arrangementMuteMapLaneTone, arrangementMuteMapPriorityNextCheck, arrangementMuteMapPriorityReason, arrangementMuteMapPriorityStatus, arrangementMuteMapSegmentTone, ArrangementTemplateControls, ArrangementTemplatePreviewDecision, ArrangementTemplatePriorityReadout, ArrangementTemplateResultStrip, arrangementTransitionLoopDetail, ArrangementTransitionMap, arrangementTransitionMapFocusResultAudition, arrangementTransitionMapFocusResultMetric, arrangementTransitionMapFocusResultNextCheck, ArrangementTransitionMapFocusResultStrip, arrangementTransitionMapPriorityNextCheck, arrangementTransitionMapPriorityReason, arrangementTransitionMapPriorityStatus, arrangementTransitionMuteLabel, basslinePadLabel, beatBlueprintArrangementLabel, beatBlueprintMasterLabel, beatBlueprintPreviewMetric, BeatBlueprintResultStrip, BeatBlueprints, beatBlueprintStyleLabel, BeatMap, beatMapRouteLabel, beatMapStageForNextMoveAction, beatMapStageIdForNextMoveAction, BeatPassport, beatPassportFocusResultAudition, beatPassportFocusResultMetric, beatPassportFocusResultNextCheck, BeatPassportFocusResultStrip, beatReadinessCardActionId, beatReadinessQuickActionCheck, beatReadinessQuickActionCheckFromChecks, BeatSpine, beatSpineApplyButtonContext, beatSpineApplyResultAudition, beatSpineApplyResultNextCheck, beatSpineApplyResultScope, beatSpineIcon, beatSpineJumpButtonContext, beatSpineJumpResultAudition, beatSpineJumpResultNextCheck, BeatSpineJumpResultStrip, BeatSpineResultStrip, beatSpineTargetLabel, blueprintNextMoveAction, boundedCustomDeliveryText, boundedSessionBriefText, chainExpandNextMoveAction, channelCountLabel, chordDegreeRoleLabel, chordMotionLabel, compactSectionFlow, compactSessionBriefValue, composerActionButtonContext, composerActionFollowupCues, composerActionForStyleGoal, composerActionIcon, composerActionPriority, composerActionQuickActionArea, composerActionQuickActionDetail, composerActionQuickActionGroup, composerActionResultMetricSnapshots, ComposerActionResultStrip, ComposerActions, composerActionsFocus, composerActionSort, composerActionStyleProfile, composerActionTone, composerArrangementAction, composerBassAction, composerDrumAction, composerFinishAction, ComposerGuide, composerGuideFocus, composerGuideFocusActionContext, composerGuideFocusActionLabel, composerGuideFocusCommandDetail, composerGuideFocusResultAudition, composerGuideFocusResultMetric, composerGuideFocusResultNextCheck, ComposerGuideFocusResultStrip, composerGuideFocusTarget, composerHarmonyAction, composerMelodyAction, createArrangementMovePreviewDecision, createArrangementMovePrioritySummary, createArrangementMoveResult, createArrangementMoveResultMetric, createArrangementMuteMapFocusResult, createArrangementMuteMapFocusSummary, createArrangementMuteMapPrioritySummary, createArrangementMuteMapSegments, createArrangementMuteMapSummary, createArrangementPlaybackReadoutSummary, createArrangementTransitionBlocks, createArrangementTransitionLoopTarget, createArrangementTransitionMapFocusResult, createArrangementTransitionMapFocusSummary, createArrangementTransitionMapPrioritySummary, createArrangementTransitionMapSummary, createBeatBlueprintPreviewCue, createBeatBlueprintPreviewDecision, createBeatBlueprintPreviewSummary, createBeatBlueprintResult, createBeatBlueprintResultMetric, createBeatMapActions, createBeatMapMetrics, createBeatMapStages, createBeatMapSummary, createBeatPassportFocusResult, createBeatPassportFocusSummary, createBeatPassportSummary, createBeatSpineApplyResult, createBeatSpineApplyResultMetric, createBeatSpineJumpResult, createBeatSpineSummary, createComposerActionResult, createComposerActionsSummary, createComposerGuideFocusResult, createComposerGuideFocusSummary, createComposerGuideSummary, createDeliveryTargetAlignmentPreview, createDeliveryTargetAlignmentResult, createDeliveryTargetAlignmentResultMetric, createEditHistoryEntry, createEditHistoryReadoutSummary, createExportPreflightFocusResult, createExportPreflightFocusSummary, createExportPreflightPriority, createExportPreflightSummary, createFinishChecklistFocusResult, createFinishChecklistFocusSummary, createFinishChecklistPriority, createFinishChecklistSummary, createFirstBeatPathJumpResult, createFirstBeatPathSummary, createGrooveCompassFocusResult, createGrooveCompassFocusSummary, createGrooveCompassSummary, createHandoffExportFormatFocusResult, createHandoffExportFormatPriority, createHandoffExportFormatSummary, createHandoffExportReceipt, createHandoffFileManifest, createHandoffManifestAudit, createHandoffManifestAuditCheck, createHandoffPackageCheckFocusResult, createHandoffPackageCheckFocusSummary, createHandoffPackageCheckPriority, createHandoffPackageCheckSummary, createHandoffPackItems, createHandoffPackRouteSummary, createHandoffPackSendOrderSummary, createHookFixOption, createHookFixResult, createHookFixResultMetric, createHookLoopCueTarget, createHookReadinessFocusResult, createHookReadinessFocusSummary, createHookReadinessPrioritySummary, createHookReadinessSummary, createHookReadinessSummaryForProject, createKeyCompassFocusResult, createKeyCompassFocusSummary, createKeyCompassSummary, createModeFocusDecision, createModeFocusJumpResult, createModeFocusSummary, createNextMoveActions, createNextMoveResult, createPatternPlaybackReadoutSummary, createProductionSnapshotFocusResult, createProductionSnapshotFocusSummary, createProductionSnapshotPriority, createProductionSnapshotSummary, createProjectSafetyReadoutSummary, createReviewFixOption, createReviewFixPreview, createReviewFixResult, createReviewFixResultMetric, createReviewQueueFocusResult, createReviewQueueFocusSummary, createReviewQueuePriority, createReviewQueueSummary, createReviewQueueSummaryForProject, createSectionCueResult, createSectionLocatorCueDecisionSummary, createSectionLocatorPads, createSectionLocatorPrioritySummary, createSelectedBlockEditPreviewDecision, createSelectedBlockEditPrioritySummary, createSelectedBlockEditResult, createSelectedBlockEditResultMetric, createSessionBriefCompassFocusResult, createSessionBriefStarterBrief, createSessionBriefStarterPadOptions, createSessionBriefStarterResult, createSessionBriefStarterResultMetric, createSessionPassFocusResult, createSessionPassSummary, createSnapshotCompareProjectProfile, createSnapshotSlotRoleSummary, createSongFormOverviewSummary, createSongFormPrioritySummary, createSongFormSegments, createStructureLensActions, createStructureLensSummary, createStyleGoalCueResult, createSwingFeelResult, createTapTempoReadoutSummary, createToplineFixOption, createToplineFixResult, createToplineFixResultMetric, createToplineLoopCueTarget, createToplineSpaceFocusResult, createToplineSpaceFocusSummary, createToplineSpacePrioritySummary, createToplineSpaceSummary, createToplineSpaceSummaryForProject, createWorkflowNavigatorItems, createWorkflowNavigatorJumpResult, deliveryTargetAlignmentChangedCount, DeliveryTargetAlignmentResultStrip, deliveryTargetArrangementFingerprint, deliveryTargetLengthLabel, deliveryTargetMasterLabel, deliveryTargetMixLabel, deliveryTargetNextMoveAction, DeliveryTargets, deliveryTargetStemLabel, drumFoundationLabel, drumPocketPositionLabel, drumPocketRoleLabel, editHistoryEntryLabel, EditorAuditionResultStrip, emptyHandoffExportReceipt, ExportPreflight, exportPreflightFocusResultAudition, exportPreflightFocusResultMetric, exportPreflightFocusResultNextCheck, ExportPreflightFocusResultStrip, exportPreflightPriorityNextCheck, FinishChecklist, finishChecklistFocusResultAudition, finishChecklistFocusResultMetric, finishChecklistFocusResultNextCheck, FinishChecklistFocusResultStrip, finishChecklistFocusTarget, finishChecklistPriorityNextCheck, firstArrangementSectionIndex, firstBeatPathJumpAuditionCue, firstBeatPathJumpNextCheck, formatExportDuration, fullArrangementNextMoveAction, GrooveCompass, grooveCompassFocusCard, grooveCompassFocusResultAudition, grooveCompassFocusResultMetric, grooveCompassFocusResultNextCheck, GrooveCompassFocusResultStrip, grooveCompassFocusStatusLabel, guideQuickStartCommandDetail, guideQuickStartCompletionBreakdownLabel, guideQuickStartCompletionBreakdownName, guideQuickStartToneRank, handoffExportFormatFocusAudition, handoffExportFormatFocusMetric, handoffExportFormatFocusNextCheck, HandoffExportFormatFocusResultStrip, handoffExportFormatPriorityNextCheck, HandoffPack, handoffPackageCheckFocusResultAudition, handoffPackageCheckFocusResultMetric, handoffPackageCheckFocusResultNextCheck, HandoffPackageCheckFocusResultStrip, handoffPackageCheckPriorityNextCheck, handoffPackSendOrder, hookFixCardLabel, HookFixResultStrip, hookFixScopeLabel, hookFixTargetLabel, hookLoopCueDetail, HookReadiness, hookReadinessFocusResultAudition, hookReadinessFocusResultMetric, hookReadinessFocusResultNextCheck, HookReadinessFocusResultStrip, hookReadinessPriorityNextCheck, hookReadinessPriorityReason, hookReadinessPriorityStatus, InputCaptureResultStrip, isArrangementMovePresetApplied, isDeliveryTargetAligned, isStyleGoalCardId, KeyCompass, keyCompassCadence, keyCompassChordMotion, keyCompassFocusCard, keyCompassFocusResultAudition, keyCompassFocusResultMetric, keyCompassFocusResultNextCheck, KeyCompassFocusResultStrip, keyCompassFocusStatusLabel, keyCompassPitchInKey, keyCompassPitchScaleDegreeLabel, keyCompassPitchSpread, keyCompassScaleDegree, keyCompassScaleDegreeLabel, keyCompassStepSpread, ListeningPass, ListeningPassFocusResultStrip, LocalDraftRecoveryResultStrip, masterFinishNextMoveAction, masterFinishPadLabel, maxProjectSwing, melodyMotifLabel, minProjectSwing, mixPostureLabel, mixReviewArea, mixReviewNextMoveAction, modeFocusCommandDetail, modeFocusDecisionStatus, modeFocusJumpResultAudition, modeFocusJumpResultMetric, modeFocusJumpResultNextCheck, modeFocusStageTarget, NextMove, nextMoveActionPostureMetricSnapshot, nextMoveIcon, nextMoveResultFollowup, nextMoveResultMetricSnapshot, NextMoveResultStrip, nextMoveRouteLabel, normalizePitchNameForCompass, normalizeSessionBriefStarter, normalizeSwingFeelValue, patternChainNextMoveAction, PatternChainPreview, PatternChainPreviewDecision, PatternChainPriorityReadout, PatternChainResultStrip, PatternDna, PatternDnaFocusResultStrip, patternEventTotal, patternFillNextMoveAction, preferredModeFocusCardId, primaryNextMoveAction, ProductionSnapshot, productionSnapshotFocusResultAudition, productionSnapshotFocusResultMetric, productionSnapshotFocusResultNextCheck, ProductionSnapshotFocusResultStrip, productionSnapshotPriorityNextCheck, projectEventTotal, ProjectFileResultStrip, quickActionArrangementBlockMetricSnapshot, quickActionBeatMapMetricSnapshot, quickActionComposerActionAreaLabel, quickActionComposerActionCommandLabel, quickActionComposerActionMetricLabel, quickActionComposerActionMoveLabel, quickActionComposerActionPresetLabel, quickActionComposerActionRouteLabel, quickActionSectionLocatorMetricSnapshot, quickActionSelectedBlockMetricSnapshot, quickActionStructureLensMetricSnapshot, readinessCheckForId, readinessReviewArea, reviewFixItemLabel, ReviewFixPreviewStrip, reviewFixProjectLabel, ReviewFixResultStrip, reviewFixScopeLabel, reviewLayerStarterFix, reviewMixFix, ReviewQueue, reviewQueueFocusLabel, reviewQueueFocusResultAudition, reviewQueueFocusResultMetric, reviewQueueFocusResultNextCheck, ReviewQueueFocusResultStrip, reviewQueueFocusTarget, reviewQueuePriorityNextCheck, reviewToneRank, romanChordLabel, romanDegreeLabel, sameCustomDeliveryTarget, sameSessionBrief, sampleRateLabel, scaleDegreeRoleLabel, SectionCueResultStrip, sectionLocatorActionSection, SectionLocatorCueDecision, sectionLocatorDecisionActionSection, SectionLocatorPads, sectionLocatorPriorityNextCheck, sectionLocatorPriorityReason, sectionLocatorPriorityStatus, sectionLocatorQuickActionSection, sectionLocatorTestId, selectedArrangementMoveQuickActionPreset, selectedBlockEditActionStatus, selectedBlockEditActionTitle, selectedBlockEditAuditionCue, selectedBlockEditBlockLabel, selectedBlockEditDeltaLabel, selectedBlockEditMergeCandidate, selectedBlockEditNextCheck, SelectedBlockEditPreviewDecision, SelectedBlockEditPriorityReadout, SelectedBlockEditResultStrip, selectedBlockQuickActionBlockIndex, selectedBlockQuickActionDescriptor, selectedBlockQuickActionEditAction, selectedBlockQuickActionPattern, selectedBlockQuickActionSection, selectedBlockQuickActionStructuralDeltaLabel, selectedBlockQuickActionTitleAction, selectedChordHarmonicSummary, selectedDrumPocketSummary, SelectedEventDeleteResultStrip, selectedNoteDegreeSummary, sessionBriefChangedFieldCount, sessionBriefCompassDestinationLabel, sessionBriefCompassFocusLabel, sessionBriefCompassFocusResultAudition, sessionBriefCompassFocusResultMetric, sessionBriefCompassFocusResultNextCheck, SessionBriefCompassFocusResultStrip, sessionBriefCompassFocusTarget, sessionBriefFieldLabel, sessionBriefFields, sessionBriefFilledFields, SessionBriefPanel, sessionBriefStarterPadDefinitions, sessionBriefStarterPreview, SessionBriefStarterResultStrip, sessionBriefStatus, sessionPassCommandDetail, sessionPassFocusLabel, sessionPassFocusResultAudition, sessionPassFocusResultMetric, sessionPassFocusResultNextCheck, snapshotNextMoveAction, SongFormOverview, songFormPriorityNextCheck, songFormPriorityReason, songFormPriorityStatus, songFormPriorityTargetSegment, songFormSegmentTone, structureArcSignal, structureHookSignal, StructureLens, structureLensRouteLabel, structureLensSignalById, structureLensSignalForNextMoveAction, structureLensSignalIdForNextMoveAction, structureLensSignalMetricLabel, styleGoalActionQuickActionArea, StyleGoalActionResultStrip, styleGoalCueLabel, styleGoalCueQuickActionGoal, StyleGoalCueResultStrip, styleGoalForComposerActionResult, StyleInspector, StyleInspectorFocusResultStrip, suggestedMasterFinishPad, swingFeelPadDetail, swingFeelPadSwing, toplineFixCardLabel, ToplineFixResultStrip, toplineFixScopeLabel, toplineFixTargetLabel, toplineLoopCueDetail, ToplineSpace, toplineSpaceFocusResultAudition, toplineSpaceFocusResultMetric, toplineSpaceFocusResultNextCheck, ToplineSpaceFocusResultStrip, toplineSpacePriorityNextCheck, toplineSpacePriorityReason, toplineSpacePriorityStatus, UndoRedoResultStrip, uniquePatternSlots, workflowCountLabel, workflowNavigatorJumpAuditionCue, workflowNavigatorJumpMetricValue, workflowNavigatorJumpNextCheck
} from "./workstationAppHelpers";
import type {
  ArrangementTransitionLoopTarget, BeatBlueprintPreviewCue, BeatBlueprintPreviewDecision, EditHistoryEntry, ExportPreflightPriority, FinishChecklistPriority, GuideQuickStartQuickActionTarget, HandoffExportFormatPriority, HandoffPackageCheckPriority, HookFixAction, HookFixOption, HookFixResult, HookFixResultMetric, HookLoopCueTarget, ProductionSnapshotPriority, ReviewFixAction, ReviewFixOption, ReviewFixPreviewSummary, ReviewFixResult, ReviewFixResultMetric, ReviewQueuePriority, SelectedBlockQuickActionDescriptor, SessionBriefCompassFocusTarget, SessionBriefFieldRefs, StyleGoalCueResult, ToplineFixAction, ToplineFixOption, ToplineFixResult, ToplineFixResultMetric, ToplineLoopCueTarget
} from "./workstationAppHelpers";
import {
  applyQuickActionInputSetupSnapshot, arrangementArcQuickActionPad, arrangementArcQuickActionPadId, arrangementArcQuickActionTextPad, arrangementFocusQuickActionBlockIndex, arrangementFocusQuickActionPreset, arrangementFocusQuickActionPresetId, arrangementFocusQuickActionTextPreset, arrangementMoveQuickActionBlockIndex, arrangementMoveQuickActionPreset, arrangementMoveQuickActionPresetId, arrangementMoveQuickActionTextPreset, arrangementPlaybackReadoutQuickActionHeardIndex, arrangementTemplateQuickActionId, arrangementTemplateQuickActionTarget, arrangementTemplateQuickActionTextTarget, audibleArrangementFollowQuickActionBeforeEditIndex, audibleArrangementFollowQuickActionTargetIndex, audiblePatternFollowQuickActionBeforeEdit, audiblePatternFollowQuickActionTarget, BEAT_SPINE_DETAIL_LABEL_PREFIXES, beatBlueprintForApplyQuickAction, beatBlueprintForPreviewMetricQuickAction, beatBlueprintForPreviewQuickAction, beatBlueprintFromQuickActionText, beatPassportQuickActionMetricId, beatSpineCardLabelFromQuickActionId, beatSpineDestinationLabelFromCardLabel, cloneKeyboardCaptureDefaults, cloneQuickActionInputSetupSnapshot, composerGuideDestinationLabelFromLane, composerGuideLaneLabelFromQuickActionId, createEditorAuditionReadoutSummary, createNextMoveSourceQuickActions, createQuickActionInputSetupResultState, createQuickActionPinnedOptions, createQuickActionPinnedResult, createQuickActionRecentOptions, createQuickActionRecentResult, createQuickActionResult, createQuickActions, createQuickActionScopeOptions, createQuickActionScopeResult, createQuickActionSearchHintResult, createQuickActionSearchRecoveryResult, createQuickActionSearchResult, createQuickActionSpotlightSummary, directExportQuickActionFileLabel, directExportQuickActionPosture, directExportQuickActionReadinessLabel, directExportQuickActionReceiptLabel, directExportQuickActionTarget, exportPreflightQuickActionCardId, filterQuickActions, finishChecklistQuickActionCardId, firstBeatPathCommandDetail, firstBeatPathStageDestination, firstBeatPathStageLabelFromQuickActionValue, grooveCompassLaneLabelFromQuickActionId, GUIDE_QUICK_START_DETAIL_LABEL_PREFIXES, handoffExportFormatQuickActionMetricId, handoffExportReceiptItemLabel, handoffNextExportDirectTarget, handoffNextExportReceiptLabel, handoffNextExportTargetItem, isInputSetupQuickAction, isMasterAutomationPadId, isMasterFinishPadId, isMixSnapshotDecisionRecallAction, isSoundSnapshotDecisionRecallAction, keyboardCaptureDefaultSummary, keyboardCapturePitchMapSummary, keyCompassLaneLabelFromQuickActionId, keyRetargetablePatternEventTotal, keyRetargetableProjectEventTotal, keyRetargetOptionSummary, keyRetargetPatternSummary, layerStarterLaneLabelFromQuickActionId, layerStarterOptionForQuickAction, layerStarterQuickActionId, listeningPassQuickActionItemId, masterAutomationQuickActionPad, masterAutomationQuickActionPosture, masterFinishQuickActionPad, masterFinishQuickActionPosture, mixFixQuickActionPreset, mixSnapshotQuickActionPosture, mixSnapshotQuickActionTarget, MODE_FOCUS_DETAIL_LABEL_PREFIXES, modeFocusCardLabelFromQuickActionId, nextMoveQuickActionForProject, nextMoveQuickActionSource, nextMoveQuickActionSourceLabel, nextMoveQuickActionTargetId, nextMoveSourceQuickActionId, normalizeQuickActionPinnedIds, patternChainQuickActionDecisionTarget, patternChainQuickActionId, patternChainQuickActionLabel, patternCloneQuickActionPreset, patternCloneQuickActionRoute, patternCompareDecisionMetricIdentity, patternCompareDecisionQuickActionKind, patternCompareDecisionQuickActionPosture, patternCompareDecisionQuickActionTarget, patternCompareDecisionSelectedBlockPlacement, patternCueSwitchMetricIdentity, patternCueSwitchQuickActionTarget, patternCueSwitchSelectedBlockPlacement, patternDnaDestinationLabelFromLane, patternDnaLaneLabelFromQuickActionId, patternEditQuickActionRoute, patternFillQuickActionPreset, patternSlotFromQuickActionValue, patternStackLaneLabelFromQuickActionId, patternStackOptionForQuickAction, patternStackQuickActionId, patternUseQuickActionTarget, patternUseSelectedBlockPlacement, patternVariationQuickActionPreset, prependQuickActionRecent, productionSnapshotQuickActionMetricId, quickActionArrangementArcMetricSnapshot, quickActionArrangementFocusMetricSnapshot, quickActionArrangementMoveMetricSnapshot, quickActionArrangementMuteLaneSectionPosture, quickActionArrangementMuteMapActionLabel, quickActionArrangementMuteMapDetailParts, quickActionArrangementMuteMapLane, quickActionArrangementMuteMapLaneId, quickActionArrangementMuteMapLaneLabel, quickActionArrangementMuteMapMetricSnapshot, quickActionArrangementMuteMapPosture, quickActionArrangementPlaybackBlockLabel, quickActionArrangementPlaybackReadoutDetailParts, quickActionArrangementPlaybackReadoutMetricSnapshot, quickActionArrangementSelectedBlockLabel, quickActionArrangementTemplateMetricSnapshot, quickActionArrangementTransitionBlockRangeLabel, quickActionArrangementTransitionDetailParts, quickActionArrangementTransitionId, quickActionArrangementTransitionLaneLabel, quickActionArrangementTransitionMapActionLabel, quickActionArrangementTransitionMapMetricSnapshot, quickActionArrangementTransitionMapPosture, quickActionArrangementTransitionMapTransition, quickActionAudibleArrangementFollowMetricSnapshot, quickActionAudiblePatternFollowMetricSnapshot, quickActionBeatBlueprintMetricSnapshot, quickActionBeatBlueprintPreviewActionLabel, quickActionBeatBlueprintPreviewContextLabel, quickActionBeatBlueprintPreviewDetailParts, quickActionBeatBlueprintPreviewMetricSnapshot, quickActionBeatBlueprintPreviewNextCheck, quickActionBeatPassportDetailParts, quickActionBeatPassportLaneLabel, quickActionBeatPassportMetric, quickActionBeatPassportMetricSnapshot, quickActionBeatReadinessDetailParts, quickActionBeatReadinessLaneLabel, quickActionBeatReadinessMetricSnapshot, quickActionBeatSpineCardLabel, quickActionBeatSpineDetailParts, quickActionBeatSpineDetailSegment, quickActionBeatSpineMetricSnapshot, quickActionBeatSpineRouteLabel, quickActionCaptureStepCandidateLabel, quickActionCaptureStepModeLabel, quickActionCaptureStepModeReadoutMetricSnapshot, quickActionCaptureStepSelectedNoteLabel, quickActionComposerActionDetailParts, quickActionComposerActionId, quickActionComposerActionMetricSnapshot, quickActionComposerGuideDetailParts, quickActionComposerGuideLaneLabel, quickActionComposerGuideMetricSnapshot, quickActionDeliveryTargetAlignDetailParts, quickActionDeliveryTargetAlignMetricSnapshot, quickActionDeliveryTargetSelectDetailParts, quickActionDeliveryTargetSelectMetricSnapshot, quickActionDeliveryTargetSelectTarget, quickActionDirectExportDeliveryMetricParts, quickActionDirectExportMetricSnapshot, quickActionDrumKitMetricSnapshot, quickActionDrumKitPadOption, quickActionEditorAuditionReadoutMetricSnapshot, quickActionExportPreflightCard, quickActionExportPreflightDeliveryMetricParts, quickActionExportPreflightDetailParts, quickActionExportPreflightLaneLabel, quickActionExportPreflightMetricSnapshot, quickActionFinishChecklistCard, quickActionFinishChecklistDetailParts, quickActionFinishChecklistLaneLabel, quickActionFinishChecklistMetricSnapshot, quickActionFirstBeatPathDetailParts, quickActionFirstBeatPathMetricSnapshot, quickActionFirstBeatPathStage, quickActionGrooveCompassDetailParts, quickActionGrooveCompassLaneLabel, quickActionGrooveCompassMetricSnapshot, quickActionGuideQuickStartDetailParts, quickActionGuideQuickStartDetailSegment, quickActionGuideQuickStartMetricSnapshot, quickActionGuideQuickStartRouteLabel, quickActionGuideQuickStartTargetLabel, quickActionHandoffExportFormatDetailParts, quickActionHandoffExportFormatLaneLabel, quickActionHandoffExportFormatMetric, quickActionHandoffExportFormatMetricSnapshot, quickActionHandoffExportReceiptDetailParts, quickActionHandoffExportReceiptMetricSnapshot, quickActionHandoffManifestAuditDetailParts, quickActionHandoffManifestAuditMetricSnapshot, quickActionHandoffNextExportDeliveryMetricParts, quickActionHandoffNextExportDetailParts, quickActionHandoffNextExportMetricSnapshot, quickActionHandoffPackageCheckActionLabel, quickActionHandoffPackageCheckCard, quickActionHandoffPackageCheckCardId, quickActionHandoffPackageCheckCardPosture, quickActionHandoffPackageCheckDeliveryMetricParts, quickActionHandoffPackageCheckDetailParts, quickActionHandoffPackageCheckLaneLabel, quickActionHandoffPackageCheckMetricSnapshot, quickActionHandoffPackMetricSnapshot, quickActionHandoffSendOrderDetailParts, quickActionHandoffSendOrderMetricSnapshot, quickActionInputPitchMapLabel, quickActionInputSetupMetricSnapshot, quickActionInputSetupRouteLabel, quickActionInputTargetLabel, quickActionKeyboardCaptureReadoutMetricSnapshot, quickActionKeyCompassDetailParts, quickActionKeyCompassLaneLabel, quickActionKeyCompassMetricSnapshot, quickActionKeyRetargetReadoutMetricSnapshot, quickActionLayerStarterDetailParts, quickActionLayerStarterLaneLabel, quickActionLayerStarterMetricSnapshot, quickActionListeningPassDetailParts, quickActionListeningPassItem, quickActionListeningPassLaneLabel, quickActionListeningPassMetricSnapshot, quickActionLocalDraftActionLabel, quickActionLocalDraftMetricLabel, quickActionLocalDraftMetricSnapshot, quickActionLocalDraftNextCheck, quickActionLocalDraftSafetyLabel, quickActionLoopScopeDetailParts, quickActionLoopScopeMetricSnapshot, quickActionMasterAutomationActionLabel, quickActionMasterAutomationContextLabel, quickActionMasterAutomationMetricSnapshot, quickActionMasterAutomationMetricValue, quickActionMasterAutomationNextCheck, quickActionMasterAutomationPadOption, quickActionMasterAutomationProjectMetricParts, quickActionMasterAutomationTargetId, quickActionMasterFinishActionLabel, quickActionMasterFinishContextLabel, quickActionMasterFinishMetricSnapshot, quickActionMasterFinishMetricValue, quickActionMasterFinishNextCheck, quickActionMasterFinishPadOption, quickActionMasterFinishProjectMetricParts, quickActionMasterFinishTargetId, quickActionMatchesQuery, quickActionMatchesScope, quickActionMetronomeReadoutDetailParts, quickActionMetronomeReadoutMetricSnapshot, quickActionMidiInputReadoutMetricSnapshot, quickActionMidiInputSupportLabel, quickActionMixBalanceActionLabel, quickActionMixBalanceChannelPosture, quickActionMixBalanceContextLabel, quickActionMixBalanceDetailParts, quickActionMixBalanceMetricSnapshot, quickActionMixBalanceMetricValue, quickActionMixBalanceNextCheck, quickActionMixBalancePadOption, quickActionMixBalanceProjectMetricParts, quickActionMixSnapshotActionLabel, quickActionMixSnapshotContextLabel, quickActionMixSnapshotDetailParts, quickActionMixSnapshotMasterPosture, quickActionMixSnapshotMetricLabel, quickActionMixSnapshotMetricSnapshot, quickActionMixSnapshotMetricValue, quickActionMixSnapshotNextCheck, quickActionMixSnapshotProjectMetricParts, quickActionMixSnapshotResultTargetId, quickActionMixSnapshotTargetLabel, quickActionModeFocusCardLabel, quickActionModeFocusDetailParts, quickActionModeFocusDetailSegment, quickActionModeFocusMetricSnapshot, quickActionModeFocusRouteLabel, quickActionPatternChainMetricSnapshot, quickActionPatternCloneMetricSnapshot, quickActionPatternCompareDecisionMetricSnapshot, quickActionPatternCueSwitchMetricSnapshot, quickActionPatternDnaDetailParts, quickActionPatternDnaLaneLabel, quickActionPatternDnaMetricSnapshot, quickActionPatternEditMetricSnapshot, quickActionPatternFillMetricSnapshot, quickActionPatternPlaybackReadoutDetailParts, quickActionPatternPlaybackReadoutMetricSnapshot, quickActionPatternStackDetailParts, quickActionPatternStackLaneLabel, quickActionPatternStackMetricSnapshot, quickActionPatternUseMetricSnapshot, quickActionPatternVariationMetricSnapshot, quickActionPinnedResultTarget, quickActionProductionSnapshotDetailParts, quickActionProductionSnapshotLaneLabel, quickActionProductionSnapshotMetric, quickActionProductionSnapshotMetricSnapshot, quickActionProjectFileActionLabel, quickActionProjectFileMetricLabel, quickActionProjectFileMetricSnapshot, quickActionProjectFileNextCheck, quickActionProjectFileSafetyLabel, quickActionProjectSafetyMetricSnapshot, quickActionProjectSafetyNextCheck, quickActionProjectSnapshotActionLabel, quickActionProjectSnapshotMetricLabel, quickActionProjectSnapshotMetricSnapshot, quickActionProjectSnapshotNextCheck, quickActionProjectSnapshotSafetyLabel, quickActionRecentResultTarget, quickActionReferenceAlignmentCard, quickActionReferenceAlignmentCardId, quickActionReferenceAlignmentDetailParts, quickActionReferenceAlignmentLaneLabel, quickActionReferenceAlignmentMetricSnapshot, quickActionResultFollowup, quickActionResultMetricSnapshot, quickActionReviewFixActionLabel, quickActionReviewFixBeatReadinessPosture, quickActionReviewFixDestinationLabel, quickActionReviewFixDetailParts, quickActionReviewFixFallbackScope, quickActionReviewFixFollowup, quickActionReviewFixImpactLabel, quickActionReviewFixItem, quickActionReviewFixLaneLabel, quickActionReviewFixMetricSnapshot, quickActionReviewFixQueuePosture, quickActionReviewFixTargetId, quickActionReviewQueueDetailParts, quickActionReviewQueueItem, quickActionReviewQueueLaneLabel, quickActionReviewQueueMetricSnapshot, quickActionScopeDefinitions, quickActionScopeLabel, quickActionSearchTokens, quickActionSelectedEventCommandLabel, quickActionSelectedEventDetailParts, quickActionSelectedEventLaneLabel, quickActionSelectedEventMetricLabel, quickActionSelectedEventMetricSnapshot, quickActionSelectedEventNextCheck, quickActionSelectedEventType, quickActionSessionBriefCompassCard, quickActionSessionBriefCompassCardId, quickActionSessionBriefCompassDetailParts, quickActionSessionBriefCompassLaneLabel, quickActionSessionBriefCompassMetricSnapshot, quickActionSessionBriefStarterDetailParts, quickActionSessionBriefStarterFieldPosture, quickActionSessionBriefStarterMetricSnapshot, quickActionSessionBriefStarterPad, quickActionSessionPassDetailParts, quickActionSessionPassDetailSegment, quickActionSessionPassLabel, quickActionSessionPassMetricSnapshot, quickActionSessionPassRouteLabel, quickActionSongFormPriorityAudition, quickActionSongFormPriorityBarRangeLabel, quickActionSongFormPriorityDetailParts, quickActionSongFormPriorityMetricLabel, quickActionSongFormPriorityMetricSnapshot, quickActionSongFormPriorityPosture, quickActionSongFormPriorityTargetLabel, quickActionSoundActionLabel, quickActionSoundDecisionContextLabel, quickActionSoundDecisionDetailParts, quickActionSoundDecisionMetricSnapshot, quickActionSoundDecisionNextCheck, quickActionSoundDesignPosture, quickActionSoundFocusMetricSnapshot, quickActionSoundFocusPadOption, quickActionSoundMetricValue, quickActionSoundPresetMetricSnapshot, quickActionSoundPresetTarget, quickActionSoundPresetTargetFromText, quickActionSoundProjectMetricParts, quickActionSpaceFxActionLabel, quickActionSpaceFxContextLabel, quickActionSpaceFxDetailParts, quickActionSpaceFxMetricSnapshot, quickActionSpaceFxMetricValue, quickActionSpaceFxNextCheck, quickActionSpaceFxPadOption, quickActionSpaceFxProjectMetricParts, quickActionSpaceFxSendPosture, quickActionStemAuditionActionLabel, quickActionStemAuditionContextLabel, quickActionStemAuditionDetailParts, quickActionStemAuditionMetricSnapshot, quickActionStemAuditionMetricValue, quickActionStemAuditionMixerPosture, quickActionStemAuditionNextCheck, quickActionStemAuditionPadOption, quickActionStemAuditionProjectMetricParts, quickActionStemAuditionStatusLabel, quickActionStemAuditionTargetLabel, quickActionStyleDirectionReadoutDetailParts, quickActionStyleDirectionReadoutMetricSnapshot, quickActionStyleInspectorActionLabel, quickActionStyleInspectorDensityPosture, quickActionStyleInspectorDetailParts, quickActionStyleInspectorFocusId, quickActionStyleInspectorGoalPosture, quickActionStyleInspectorItem, quickActionStyleInspectorItems, quickActionStyleInspectorLaneLabel, quickActionStyleInspectorMetricSnapshot, quickActionSwingFeelReadoutMetricSnapshot, quickActionTapTempoReadoutDetailParts, quickActionTapTempoReadoutMetricSnapshot, quickActionTempoNudgeReadoutMetricSnapshot, quickActionTimbreCheckMetricSnapshot, quickActionTransitionLoopActionLabel, quickActionTransitionLoopMetricSnapshot, quickActionTransportPositionDetailParts, quickActionTransportPositionMetricSnapshot, quickActionUndoRedoActionLabel, quickActionUndoRedoEditLabel, quickActionUndoRedoMetricLabel, quickActionUndoRedoMetricSnapshot, quickActionUndoRedoNextCheck, quickActionWorkflowNavigatorContext, quickActionWorkflowNavigatorFollowup, quickActionWorkflowNavigatorMetricSnapshot, quickActionWorkflowSpotlightContext, quickActionWorkflowSpotlightFollowup, quickActionWorkflowSpotlightMetricSnapshot, referenceAlignmentDestinationLabel, reviewQueueQuickActionItemId, SESSION_PASS_DETAIL_LABEL_PREFIXES, sessionPassLabelFromQuickActionId, soundPresetTargetFromQuickActionId, soundSnapshotQuickActionPosture, soundSnapshotQuickActionTarget, styleDirectionCurrentSummary, styleDirectionPatternSummary, styleDirectionTargetSummary, swingFeelRouteSummary, tempoNudgeRouteSummary, transportLoopLabelFromActionDetail, workflowNavigatorZoneFromQuickAction
} from "./workstationAppQuickActions";
import type {
  EditorAuditionReadoutSummary, MixSnapshotResultTargetId, NextMoveQuickActionSource, PatternEditQuickActionRoute, QuickActionInputSetupResultState, QuickActionInputSetupSnapshot, QuickActionSelectedEventType, SoundSnapshotQuickActionTarget
} from "./workstationAppQuickActions";
import {
  applyArrangementArcPadToProject, applyDrumKitPadToProject, applyMasterFinishPadToProject, applyMixBalancePadToMixer, applyMixFixToProject, applySoundFocusPadToSound, applySpaceFxPadToMixer, applyStemAuditionPadToMixer, arrangedPatternData, arrangementArcChangedCount, arrangementArcChangedFieldCount, arrangementArcPointForIndex, arrangementArcPreview, arrangementArcPreviewEnergyLabel, arrangementArcPreviewMuteLabel, arrangementArcPreviewPatternLabel, arrangementArcPreviewSectionLabel, arrangementBlockRoleLabel, arrangementBlocksTotalBars, arrangementFocusChangedFieldCount, arrangementFocusPreviewMuteLabel, arrangementReadinessCheck, arrangementStartBar, arrangementTemplateChangedBlockCount, arrangementTemplateChangedFieldCount, arrangementTemplatePreviewSectionLabel, averageUnitVelocity, bassReadinessCheck, bassStyleRoleLabel, beatReadinessFocusResultAudition, beatReadinessFocusResultMetric, beatReadinessFocusResultNextCheck, clampMixFixVolume, cloneMixerChannels, cloneSoundDesign, compactMixDb, compactUnitPercent, createArrangementArcPadOptions, createArrangementArcPreviewDecision, createArrangementArcPreviewSummary, createArrangementArcPrioritySummary, createArrangementArcResult, createArrangementArcResultMetric, createArrangementFocusPreviewDecision, createArrangementFocusPreviewSummary, createArrangementFocusPrioritySummary, createArrangementFocusResult, createArrangementFocusResultMetric, createArrangementFocusSummary, createArrangementTemplatePreviewDecision, createArrangementTemplatePreviewSummary, createArrangementTemplatePrioritySummary, createArrangementTemplateResult, createArrangementTemplateResultMetric, createBeatReadinessChecks, createBeatReadinessFocusResult, createDrumKitPadOptions, createDrumKitPreviewSummary, createDrumKitResult, createDrumKitResultMetric, createLayerStarterOption, createLayerStarterOptions, createListeningPassFocusResult, createListeningPassFocusSummary, createListeningPassSummary, createMasterAutomationPadOptions, createMasterAutomationPreviewSummary, createMasterAutomationResult, createMasterAutomationResultMetric, createMasterFinishPadOptions, createMasterFinishPreviewSummary, createMasterFinishResult, createMasterFinishResultMetric, createMasterOutputRoleSummary, createMixBalancePadOptions, createMixBalancePreviewSummary, createMixBalanceResult, createMixBalanceResultMetric, createMixCoachChecks, createMixCoachFocusResult, createMixCoachFocusSummary, createMixFixActions, createMixFixPreviewSummary, createMixFixResult, createMixFixResultMetric, createMixSnapshot, createPatternChainPreviewDecision, createPatternChainPreviewSummary, createPatternChainPrioritySummary, createPatternChainResult, createPatternChainResultMetric, createPatternCompareDecisionSummary, createPatternCompareResult, createPatternCompareResultMetric, createPatternCompareSummaries, createPatternDnaFocusResult, createPatternDnaFocusSummary, createPatternDnaSummary, createPatternDynamicsCard, createSoundFocusPadOptions, createSoundFocusPreviewSummary, createSoundFocusResult, createSoundFocusResultMetric, createSoundPresetPreviewSummary, createSoundPresetResult, createSoundPresetResultMetric, createSoundSnapshot, createSoundSnapshotComparison, createSoundTimbreCheckSummary, createSpaceFxPadOptions, createSpaceFxPreviewSummary, createSpaceFxResult, createSpaceFxResultMetric, createStemAuditionDecisionSummary, createStemAuditionPadOptions, createStemAuditionReadoutSummary, createStyleGoalCard, createStyleGoalCards, createStyleInspectorFocusResult, createStyleInspectorFocusSummary, createStyleInspectorSummary, createTransportPositionReadoutSummary, defaultSoundPresetPreview, drumHitCount, drumKitClapLabel, drumKitHatLabel, drumKitKickLabel, drumKitMixerChangedControlCount, drumKitPadChangedCount, drumKitPadPreview, drumKitPreviewDrumLabel, drumKitPreviewRackLabel, drumKitRackLabel, drumKitSoundParameters, drumPatternVelocityValues, drumReadinessCheck, emptySoundSnapshotMetrics, exportDynamicsCheck, exportReadinessCheck, harmonyReadinessCheck, isStemAuditionPadActive, limiterCheck, listeningPassFocusLabel, listeningPassFocusResultAudition, listeningPassFocusResultMetric, listeningPassFocusResultNextCheck, lowEndBlendCheck, lowEndDeltaDb, masterAutomationAuditionCue, masterAutomationChangedCount, masterAutomationEventCountLabel, masterAutomationEventSignature, masterAutomationPresetLabel, masterAutomationPreview, masterAutomationRangeLabel, masterFinishChangedCount, masterFinishPreview, masterHeadroomCheck, masterOutputRoleLabel, melodyStyleRoleLabel, mixBalanceChangedControlCount, mixBalanceChannelPosture, mixBalancePreview, mixBalancePreviewChannelLabel, mixBalancePreviewPostureLabel, mixCoachFocusCheck, mixCoachFocusResultAudition, mixCoachFocusResultMetric, mixCoachFocusResultNextCheck, mixCoachSummary, mixerChannelRoleLabel, mixerChannelRoleSummary, mixerTrackVolumeDb, mixFixAuditionCue, mixFixChangedCount, mixFixControlPosture, mixFixExportPosture, mixFixHeadroomPosture, mixFixLowEndPosture, mixFixNextCheck, mixFixPresetLabel, mixFixScopeLabel, mixFixStemPosture, mixSnapshotCapturedAtLabel, mixSnapshotScore, mixSnapshotStatusLabel, nudgeMixFixVolume, patternChainChangedBlockCount, patternChainChangedFieldCount, patternChainPreviewEnergyLabel, patternChainPreviewSectionLabel, patternChainResultSequenceLabel, patternDnaFocusResultAudition, patternDnaFocusResultMetric, patternDnaFocusResultNextCheck, patternVariationSignals, roughStemVolumeTarget, sameArrangementBlockPosture, sameMixerChannel, sameMixerChannels, sameSoundDesign, selectedArrangementBlockRoleSummary, soundFocusBassLabel, soundFocusChangedParameterLabel, soundFocusChangedParameters, soundFocusChordLabel, soundFocusDrumLabel, soundFocusDuckLabel, soundFocusGroupMoveCount, soundFocusParameterLabel, soundFocusParameters, soundFocusPreview, soundFocusPreviewParameterLabel, soundFocusSynthLabel, soundPresetChangedMoveCount, soundPresetToneLabel, soundSnapshotComparisonMetric, soundSnapshotComparisonMetrics, soundSnapshotScore, soundSnapshotSpread, soundTimbreAverage, soundTimbreLeanLabel, soundTimbreMetricTone, soundTimbreNextCheck, spaceFxChangedSendCount, spaceFxPreview, spaceFxTrackPosture, stemAuditionDecisionFromPad, stemAuditionPreview, stemBalanceCheck, styleDensityLabel, styleGoalCountLabel, styleGoalPriorityLabel, styleInspectorFocusResultAudition, styleInspectorFocusResultDetail, styleInspectorFocusResultMetric, styleInspectorFocusResultNextCheck, styleInspectorFocusResultTitle, styleInspectorFocusResultTone, suggestedArrangementFocusPreset, suggestedMasterAutomationPad, transportLoopLabel, transportLoopStatus, usedPatternSlots, velocityLayerLabel
} from "./workstationAppDerivations";
import type {
  SoundTimbreScore
} from "./workstationAppDerivations";

export function App(): ReactElement {
  const [project, setProject] = useState<ProjectState>(starterProject);
  const [undoStack, setUndoStack] = useState<EditHistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<EditHistoryEntry[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("arrangement");
  const [transportLoopScope, setTransportLoopScope] = useState<TransportLoopScope>("arrangement");
  const [playbackPosition, setPlaybackPosition] = useState<PlaybackSnapshot | null>(null);
  const [selectedNote, setSelectedNote] = useState<SelectedNote | null>(null);
  const [noteClipboard, setNoteClipboard] = useState<NoteClipboard | null>(null);
  const [keyboardCaptureEnabled, setKeyboardCaptureEnabled] = useState(false);
  const [keyboardCaptureTarget, setKeyboardCaptureTarget] = useState<NoteTrack>("bass");
  const [keyboardCaptureDefaults, setKeyboardCaptureDefaults] = useState<Record<NoteTrack, KeyboardCaptureDefaults>>({
    bass: { octave: 1, length: 2, velocity: 0.82, glide: false },
    melody: { octave: 4, length: 1, velocity: 0.68, glide: false }
  });
  const [keyboardCaptureStepMode, setKeyboardCaptureStepMode] = useState<KeyboardCaptureStepMode>("next-free");
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
  const [midiPortRevision, setMidiPortRevision] = useState(0);
  const [midiCaptureStatus, setMidiCaptureStatus] = useState<MidiCaptureStatus>(() =>
    isMidiInputSupported() ? "idle" : "unsupported"
  );
  const [midiCaptureArmed, setMidiCaptureArmed] = useState(false);
  const [midiSelectedInputId, setMidiSelectedInputId] = useState("all");
  const [midiLastNoteLabel, setMidiLastNoteLabel] = useState("No MIDI note captured");
  const [selectedDrumStep, setSelectedDrumStep] = useState<SelectedDrumStep | null>(null);
  const [drumClipboard, setDrumClipboard] = useState<DrumClipboard | null>(null);
  const [selectedChordIndex, setSelectedChordIndex] = useState<number | null>(0);
  const [chordClipboard, setChordClipboard] = useState<ChordClipboard | null>(null);
  const [selectedArrangementIndex, setSelectedArrangementIndex] = useState(0);
  const [arrangementBlockClipboard, setArrangementBlockClipboard] = useState<ArrangementBlockClipboard | null>(null);
  const [splitAfterBars, setSplitAfterBars] = useState(1);
  const [snapshotNameDrafts, setSnapshotNameDrafts] = useState<Record<string, string>>({});
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [commandReferenceOpen, setCommandReferenceOpen] = useState(false);
  const [quickActionQuery, setQuickActionQuery] = useState("");
  const [quickActionSearchHintResult, setQuickActionSearchHintResult] = useState<QuickActionSearchHintResult | null>(null);
  const [quickActionSearchResult, setQuickActionSearchResult] = useState<QuickActionSearchResult | null>(null);
  const [quickActionSearchRecoveryResult, setQuickActionSearchRecoveryResult] = useState<QuickActionSearchRecoveryResult | null>(null);
  const [quickActionScope, setQuickActionScope] = useState<QuickActionScopeId>("all");
  const [quickActionScopeResult, setQuickActionScopeResult] = useState<QuickActionScopeResult | null>(null);
  const [quickActionRecents, setQuickActionRecents] = useState<QuickActionRecent[]>([]);
  const [quickActionPinnedIds, setQuickActionPinnedIds] = useState<string[]>([]);
  const [inspectedQuickActionPinnedId, setInspectedQuickActionPinnedId] = useState<string | null>(null);
  const [quickActionPinnedResult, setQuickActionPinnedResult] = useState<QuickActionPinnedResult | null>(null);
  const [inspectedQuickActionRecentId, setInspectedQuickActionRecentId] = useState<string | null>(null);
  const [quickActionRecentResult, setQuickActionRecentResult] = useState<QuickActionRecentResult | null>(null);
  const [composerActionResult, setComposerActionResult] = useState<ComposerActionResult | null>(null);
  const [nextMoveResult, setNextMoveResult] = useState<NextMoveResult | null>(null);
  const [quickActionResult, setQuickActionResult] = useState<QuickActionResult | null>(null);
  const [editorAuditionResult, setEditorAuditionResult] = useState<EditorAuditionResult | null>(null);
  const [inputCaptureResult, setInputCaptureResult] = useState<InputCaptureResult | null>(null);
  const [selectedEventDeleteResult, setSelectedEventDeleteResult] = useState<SelectedEventDeleteResult | null>(null);
  const [undoRedoResult, setUndoRedoResult] = useState<UndoRedoResult | null>(null);
  const [modeSwitchResult, setModeSwitchResult] = useState<ModeSwitchResult | null>(null);
  const [modeFocusResult, setModeFocusResult] = useState<ModeFocusJumpResult | null>(null);
  const [workflowNavigatorResult, setWorkflowNavigatorResult] = useState<WorkflowNavigatorJumpResult | null>(null);
  const [firstBeatPathResult, setFirstBeatPathResult] = useState<FirstBeatPathJumpResult | null>(null);
  const [sessionPassResult, setSessionPassResult] = useState<SessionPassFocusResult | null>(null);
  const [swingFeelResult, setSwingFeelResult] = useState<SwingFeelResult | null>(null);
  const [styleGoalCueResult, setStyleGoalCueResult] = useState<StyleGoalCueResult | null>(null);
  const [beatBlueprintResult, setBeatBlueprintResult] = useState<BeatBlueprintResult | null>(null);
  const [beatSpineResult, setBeatSpineResult] = useState<BeatSpineApplyResult | null>(null);
  const [beatSpineJumpResult, setBeatSpineJumpResult] = useState<BeatSpineJumpResult | null>(null);
  const [layerStarterResult, setLayerStarterResult] = useState<LayerStarterResult | null>(null);
  const [patternCompareResult, setPatternCompareResult] = useState<PatternCompareResult | null>(null);
  const [patternCloneResult, setPatternCloneResult] = useState<PatternCloneResult | null>(null);
  const [patternEditResult, setPatternEditResult] = useState<PatternEditResult | null>(null);
  const [patternFillPreviewPreset, setPatternFillPreviewPreset] = useState<PatternFillPreset>("drum_fill");
  const [patternFillResult, setPatternFillResult] = useState<PatternFillResult | null>(null);
  const [patternVariationPreviewPreset, setPatternVariationPreviewPreset] = useState<PatternVariationPreset>("hook");
  const [patternVariationResult, setPatternVariationResult] = useState<PatternVariationResult | null>(null);
  const [patternStackResult, setPatternStackResult] = useState<PatternStackResult | null>(null);
  const [drumMoveResult, setDrumMoveResult] = useState<DrumMoveResult | null>(null);
  const [bassMoveResult, setBassMoveResult] = useState<BassMoveResult | null>(null);
  const [melodyMoveResult, setMelodyMoveResult] = useState<MelodyMoveResult | null>(null);
  const [chordMoveResult, setChordMoveResult] = useState<ChordMoveResult | null>(null);
  const [arrangementTemplateResult, setArrangementTemplateResult] = useState<ArrangementTemplateResultSummary | null>(null);
  const [arrangementArcResult, setArrangementArcResult] = useState<ArrangementArcResultSummary | null>(null);
  const [arrangementFocusResult, setArrangementFocusResult] = useState<ArrangementFocusResultSummary | null>(null);
  const [arrangementMoveResult, setArrangementMoveResult] = useState<ArrangementMoveResultSummary | null>(null);
  const [selectedBlockEditResult, setSelectedBlockEditResult] = useState<SelectedBlockEditResultSummary | null>(null);
  const [patternChainResult, setPatternChainResult] = useState<PatternChainResultSummary | null>(null);
  const [soundPresetPreviewId, setSoundPresetPreviewId] = useState<SoundPresetTarget>(() =>
    defaultSoundPresetPreview(starterProject)
  );
  const [soundPresetResult, setSoundPresetResult] = useState<SoundPresetResult | null>(null);
  const [soundFocusResult, setSoundFocusResult] = useState<SoundFocusResult | null>(null);
  const [drumKitResult, setDrumKitResult] = useState<DrumKitResult | null>(null);
  const [soundSnapshots, setSoundSnapshots] = useState<SoundSnapshotSlotMap>({ A: null, B: null });
  const [masterFinishResult, setMasterFinishResult] = useState<MasterFinishResult | null>(null);
  const [masterAutomationResult, setMasterAutomationResult] = useState<MasterAutomationResult | null>(null);
  const [mixBalanceResult, setMixBalanceResult] = useState<MixBalanceResult | null>(null);
  const [mixSnapshots, setMixSnapshots] = useState<MixSnapshotSlotMap>({ A: null, B: null });
  const [spaceFxResult, setSpaceFxResult] = useState<SpaceFxResult | null>(null);
  const [mixFixResult, setMixFixResult] = useState<MixFixResult | null>(null);
  const [deliveryTargetAlignmentResult, setDeliveryTargetAlignmentResult] = useState<DeliveryTargetAlignmentResult | null>(null);
  const [sessionBriefStarterResult, setSessionBriefStarterResult] = useState<SessionBriefStarterResult | null>(null);
  const [sessionBriefCompassResult, setSessionBriefCompassResult] = useState<SessionBriefCompassFocusResult | null>(null);
  const [beatBlueprintPreviewId, setBeatBlueprintPreviewId] = useState<BeatBlueprintId>("dark_808");
  const [sessionBriefCompassFocusId, setSessionBriefCompassFocusId] = useState<SessionBriefCompassCardId | null>(null);
  const [referenceAlignmentFocusId, setReferenceAlignmentFocusId] = useState<ReferenceAlignmentCardId | null>(null);
  const [referenceAlignmentResult, setReferenceAlignmentResult] = useState<ReferenceAlignmentFocusResult | null>(null);
  const [composerGuideFocusId, setComposerGuideFocusId] = useState<ComposerGuideCardId | null>(null);
  const [composerGuideResult, setComposerGuideResult] = useState<ComposerGuideFocusResult | null>(null);
  const [beatPassportFocusId, setBeatPassportFocusId] = useState<BeatPassportFocusId | null>(null);
  const [beatPassportResult, setBeatPassportResult] = useState<BeatPassportFocusResult | null>(null);
  const [productionSnapshotFocusId, setProductionSnapshotFocusId] = useState<ProductionSnapshotFocusId | null>(null);
  const [productionSnapshotResult, setProductionSnapshotResult] = useState<ProductionSnapshotFocusResult | null>(null);
  const [snapshotCompareFocusId, setSnapshotCompareFocusId] = useState<SnapshotCompareFocusId | null>(null);
  const [snapshotCompareResult, setSnapshotCompareResult] = useState<SnapshotCompareFocusResult | null>(null);
  const [hookReadinessFocusId, setHookReadinessFocusId] = useState<HookReadinessFocusId | null>(null);
  const [hookReadinessResult, setHookReadinessResult] = useState<HookReadinessFocusResult | null>(null);
  const [hookFixResult, setHookFixResult] = useState<HookFixResult | null>(null);
  const [toplineSpaceFocusId, setToplineSpaceFocusId] = useState<ToplineSpaceFocusId | null>(null);
  const [toplineSpaceResult, setToplineSpaceResult] = useState<ToplineSpaceFocusResult | null>(null);
  const [toplineFixResult, setToplineFixResult] = useState<ToplineFixResult | null>(null);
  const [arrangementMuteMapFocusId, setArrangementMuteMapFocusId] = useState<ArrangementMuteMapFocusId | null>(null);
  const [arrangementMuteMapResult, setArrangementMuteMapResult] = useState<ArrangementMuteMapFocusResult | null>(null);
  const [arrangementTransitionMapFocusId, setArrangementTransitionMapFocusId] =
    useState<ArrangementTransitionMapFocusId | null>(null);
  const [arrangementTransitionMapResult, setArrangementTransitionMapResult] =
    useState<ArrangementTransitionMapFocusResult | null>(null);
  const [sectionCueResult, setSectionCueResult] = useState<SectionCueResult | null>(null);
  const [keyCompassFocusId, setKeyCompassFocusId] = useState<KeyCompassFocusId | null>(null);
  const [keyCompassResult, setKeyCompassResult] = useState<KeyCompassFocusResult | null>(null);
  const [grooveCompassFocusId, setGrooveCompassFocusId] = useState<GrooveCompassFocusId | null>(null);
  const [grooveCompassResult, setGrooveCompassResult] = useState<GrooveCompassFocusResult | null>(null);
  const [patternDnaFocusId, setPatternDnaFocusId] = useState<PatternDnaCardId | null>(null);
  const [patternDnaResult, setPatternDnaResult] = useState<PatternDnaFocusResult | null>(null);
  const [styleInspectorFocusId, setStyleInspectorFocusId] = useState<StyleInspectorFocusId | null>(null);
  const [styleInspectorResult, setStyleInspectorResult] = useState<StyleInspectorFocusResult | null>(null);
  const [beatReadinessFocusId, setBeatReadinessFocusId] = useState<BeatReadinessCheckId | null>(null);
  const [beatReadinessResult, setBeatReadinessResult] = useState<BeatReadinessFocusResult | null>(null);
  const [listeningPassFocusId, setListeningPassFocusId] = useState<ListeningPassId | null>(null);
  const [listeningPassResult, setListeningPassResult] = useState<ListeningPassFocusResult | null>(null);
  const [mixCoachFocusId, setMixCoachFocusId] = useState<string | null>(null);
  const [mixCoachResult, setMixCoachResult] = useState<MixCoachFocusResult | null>(null);
  const [reviewQueueFocusId, setReviewQueueFocusId] = useState<string | null>(null);
  const [reviewQueueResult, setReviewQueueResult] = useState<ReviewQueueFocusResult | null>(null);
  const [reviewFixResult, setReviewFixResult] = useState<ReviewFixResult | null>(null);
  const [finishChecklistFocusId, setFinishChecklistFocusId] = useState<FinishChecklistCardId | null>(null);
  const [finishChecklistResult, setFinishChecklistResult] = useState<FinishChecklistFocusResult | null>(null);
  const [exportPreflightFocusId, setExportPreflightFocusId] = useState<ExportPreflightFocusId | null>(null);
  const [exportPreflightResult, setExportPreflightResult] = useState<ExportPreflightFocusResult | null>(null);
  const [handoffExportFormatFocusId, setHandoffExportFormatFocusId] = useState<HandoffExportFormatFocusId | null>(null);
  const [handoffExportFormatResult, setHandoffExportFormatResult] = useState<HandoffExportFormatFocusResult | null>(null);
  const [handoffPackageCheckFocusId, setHandoffPackageCheckFocusId] = useState<HandoffPackageCheckFocusId | null>(null);
  const [handoffPackageCheckResult, setHandoffPackageCheckResult] = useState<HandoffPackageCheckFocusResult | null>(null);
  const [handoffExportReceipt, setHandoffExportReceipt] = useState<HandoffExportReceipt | null>(null);
  const [projectStatus, setProjectStatus] = useState("Demo project");
  const [projectFileLabel, setProjectFileLabel] = useState<string | null>(null);
  const [projectHasUnsavedChanges, setProjectHasUnsavedChanges] = useState(false);
  const [projectFileResult, setProjectFileResult] = useState<ProjectFileResult | null>(null);
  const [localDraftRecoveryResult, setLocalDraftRecoveryResult] = useState<LocalDraftRecoveryResult | null>(null);
  const [tapTempo, setTapTempo] = useState<TapTempoState>({ taps: 0, bpm: null, applied: true });
  const [localDraftRecovery, setLocalDraftRecovery] = useState<LocalDraftRecovery | null>(() => readLocalDraftRecovery());
  const [localDraftSavedAt, setLocalDraftSavedAt] = useState<string | null>(localDraftRecovery?.savedAt ?? null);
  const [localDraftWriteArmed, setLocalDraftWriteArmed] = useState(false);
  const projectRef = useRef<ProjectState>(starterProject);
  const handoffExportReceiptRef = useRef<HandoffExportReceipt | null>(null);
  const tapTempoTimesRef = useRef<number[]>([]);
  const tapTempoCommitTimerRef = useRef<number | null>(null);
  const localDraftReadyRef = useRef(false);
  const localDraftSkipNextWriteRef = useRef(false);
  const selectedEventDeleteSelectionGuardRef = useRef(false);
  const controllerRef = useRef<PlaybackController | null>(null);
  const auditionControllerRef = useRef<PlaybackController | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const styleInspectorRef = useRef<HTMLElement | null>(null);
  const transportPanelRef = useRef<HTMLElement | null>(null);
  const composePanelRef = useRef<HTMLElement | null>(null);
  const soundPanelRef = useRef<HTMLElement | null>(null);
  const arrangePanelRef = useRef<HTMLElement | null>(null);
  const mixPanelRef = useRef<HTMLElement | null>(null);
  const deliverPanelRef = useRef<HTMLElement | null>(null);
  const masterPanelRef = useRef<HTMLElement | null>(null);
  const beatBlueprintPanelRef = useRef<HTMLElement | null>(null);
  const sessionBriefArtistRef = useRef<HTMLInputElement | null>(null);
  const sessionBriefVibeRef = useRef<HTMLInputElement | null>(null);
  const sessionBriefReferenceRef = useRef<HTMLInputElement | null>(null);
  const sessionBriefNotesRef = useRef<HTMLTextAreaElement | null>(null);
  const style = getStyle(project);
  const deliveryTarget = activeDeliveryTarget(project);
  const currentPattern = activePattern(project);
  const exportAnalysis = useMemo(() => analyzeExport(project), [project]);
  const stemAnalyses = useMemo(() => analyzeStemExports(project), [project]);
  const beatReadinessChecks = useMemo(() => createBeatReadinessChecks(project, exportAnalysis), [project, exportAnalysis]);
  const nextMoveActions = useMemo(
    () => createNextMoveActions(project, beatReadinessChecks, exportAnalysis),
    [project, beatReadinessChecks, exportAnalysis]
  );
  const beatMapSummary = useMemo(
    () => createBeatMapSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const beatMapActions = useMemo(
    () => createBeatMapActions(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const structureLensSummary = useMemo(() => createStructureLensSummary(project), [project]);
  const structureLensActions = useMemo(() => createStructureLensActions(project), [project]);
  const hookReadinessSummary = useMemo(
    () => createHookReadinessSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const hookLoopCueTarget = useMemo(() => createHookLoopCueTarget(project), [project]);
  const toplineSpaceSummary = useMemo(
    () => createToplineSpaceSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const toplineLoopCueTarget = useMemo(() => createToplineLoopCueTarget(project), [project]);
  const songFormOverviewSummary = useMemo(
    () => createSongFormOverviewSummary(project, selectedArrangementIndex),
    [project, selectedArrangementIndex]
  );
  const arrangementMuteMapSummary = useMemo(() => createArrangementMuteMapSummary(project), [project]);
  const arrangementTransitionMapSummary = useMemo(() => createArrangementTransitionMapSummary(project), [project]);
  const arrangementTransitionLoopTarget = useMemo(
    () =>
      createArrangementTransitionLoopTarget(
        project,
        arrangementTransitionMapSummary,
        arrangementTransitionMapFocusId,
        selectedArrangementIndex
      ),
    [arrangementTransitionMapFocusId, arrangementTransitionMapSummary, project, selectedArrangementIndex]
  );
  const productionSnapshotSummary = useMemo(
    () => createProductionSnapshotSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const beatPassportSummary = useMemo(
    () => createBeatPassportSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const finishChecklistSummary = useMemo(
    () => createFinishChecklistSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const reviewQueueSummary = useMemo(
    () => createReviewQueueSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const exportPreflightSummary = useMemo(
    () => createExportPreflightSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const handoffPackageCheckSummary = useMemo(
    () => createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, handoffExportReceipt),
    [project, exportAnalysis, stemAnalyses, handoffExportReceipt]
  );
  const workflowNavigatorItems = useMemo(
    () => createWorkflowNavigatorItems(project, beatMapSummary, exportPreflightSummary, exportAnalysis),
    [project, beatMapSummary, exportPreflightSummary, exportAnalysis]
  );
  const firstBeatPathSummary = useMemo(
    () => createFirstBeatPathSummary(project, style, workflowNavigatorItems, beatMapSummary, exportPreflightSummary, exportAnalysis),
    [project, style, workflowNavigatorItems, beatMapSummary, exportPreflightSummary, exportAnalysis]
  );
  const beatSpineSummary = useMemo(
    () => createBeatSpineSummary(project, style, beatReadinessChecks, exportPreflightSummary, exportAnalysis),
    [project, style, beatReadinessChecks, exportPreflightSummary, exportAnalysis]
  );
  const sessionPassSummary = useMemo(
    () =>
      createSessionPassSummary(
        project,
        firstBeatPathSummary,
        reviewQueueSummary,
        finishChecklistSummary,
        exportPreflightSummary
      ),
    [project, firstBeatPathSummary, reviewQueueSummary, finishChecklistSummary, exportPreflightSummary]
  );
  const sessionBriefStarterPads = useMemo(() => createSessionBriefStarterPadOptions(project), [project]);
  const sessionBriefCompassSummary = useMemo(
    () => createSessionBriefCompassSummary(project, exportAnalysis, stemAnalyses),
    [project, exportAnalysis, stemAnalyses]
  );
  const referenceAlignmentSummary = useMemo(
    () => createReferenceAlignmentSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const snapshotCompareSummary = useMemo(() => createSnapshotCompareSummary(project, createSnapshotCompareProjectProfile), [project]);
  const patternCompareSummaries = useMemo(() => createPatternCompareSummaries(project), [project]);
  const patternDnaSummary = useMemo(() => createPatternDnaSummary(project), [project]);
  const layerStarterOptions = useMemo(() => createLayerStarterOptions(project), [project]);
  const listeningPassSummary = useMemo(
    () => createListeningPassSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const styleInspectorSummary = useMemo(
    () => createStyleInspectorSummary(project, style, patternCompareSummaries),
    [patternCompareSummaries, project, style]
  );
  const activeChannels = useMemo(() => {
    const soloActive = project.mixer.some((channel) => channel.id !== "master" && channel.solo);
    return project.mixer.filter(
      (channel) => channel.id !== "master" && !channel.muted && (!soloActive || channel.solo)
    ).length;
  }, [project.mixer]);
  const activeChannelLabel = `${activeChannels} active ${activeChannels === 1 ? "channel" : "channels"}`;
  const mixBalancePadOptions = useMemo(() => createMixBalancePadOptions(project.mixer), [project.mixer]);
  const mixBalancePreviewSummary = useMemo(
    () => createMixBalancePreviewSummary(project.mixer, mixBalancePadOptions),
    [project.mixer, mixBalancePadOptions]
  );
  const mixSnapshotComparison = useMemo(() => createMixSnapshotComparison(mixSnapshots), [mixSnapshots]);
  const spaceFxPadOptions = useMemo(() => createSpaceFxPadOptions(project.mixer), [project.mixer]);
  const spaceFxPreviewSummary = useMemo(
    () => createSpaceFxPreviewSummary(project.mixer, spaceFxPadOptions),
    [project.mixer, spaceFxPadOptions]
  );
  const stemAuditionPadOptions = useMemo(() => createStemAuditionPadOptions(project.mixer), [project.mixer]);
  const stemAuditionReadout = useMemo(() => createStemAuditionReadoutSummary(project.mixer), [project.mixer]);
  const stemAuditionDecision = useMemo(
    () => createStemAuditionDecisionSummary(stemAuditionPadOptions, stemAuditionReadout),
    [stemAuditionPadOptions, stemAuditionReadout]
  );
  const mixCoachChecks = useMemo(
    () => createMixCoachChecks(exportAnalysis, stemAnalyses),
    [exportAnalysis, stemAnalyses]
  );
  const mixCoachFocusSummary = useMemo(
    () => createMixCoachFocusSummary(mixCoachChecks, mixCoachFocusId),
    [mixCoachChecks, mixCoachFocusId]
  );
  const mixFixActions = useMemo(
    () => createMixFixActions(exportAnalysis, stemAnalyses),
    [exportAnalysis, stemAnalyses]
  );
  const mixFixPreviewSummary = useMemo(
    () => createMixFixPreviewSummary(project, mixFixActions, stemAnalyses),
    [project, mixFixActions, stemAnalyses]
  );
  const soundPresetPreviewSummary = useMemo(
    () => createSoundPresetPreviewSummary(project.sound, soundPresetPreviewId),
    [project.sound, soundPresetPreviewId]
  );
  const soundFocusPadOptions = useMemo(() => createSoundFocusPadOptions(project.sound), [project.sound]);
  const soundFocusPreviewSummary = useMemo(
    () => createSoundFocusPreviewSummary(project.sound, soundFocusPadOptions),
    [project.sound, soundFocusPadOptions]
  );
  const soundTimbreCheckSummary = useMemo(() => createSoundTimbreCheckSummary(project.sound), [project.sound]);
  const soundSnapshotComparison = useMemo(() => createSoundSnapshotComparison(soundSnapshots), [soundSnapshots]);
  const drumKitPadOptions = useMemo(() => createDrumKitPadOptions(project), [project]);
  const drumKitPreviewSummary = useMemo(
    () => createDrumKitPreviewSummary(drumKitPadOptions),
    [drumKitPadOptions]
  );
  const masterFinishPadOptions = useMemo(() => createMasterFinishPadOptions(project), [project]);
  const masterFinishPreviewSummary = useMemo(
    () => createMasterFinishPreviewSummary(project, masterFinishPadOptions),
    [project, masterFinishPadOptions]
  );
  const masterAutomationPadOptions = useMemo(() => createMasterAutomationPadOptions(project), [project]);
  const masterAutomationPreviewSummary = useMemo(
    () => createMasterAutomationPreviewSummary(project, masterAutomationPadOptions),
    [project, masterAutomationPadOptions]
  );
  const masterOutputRoleSummary = useMemo(
    () => createMasterOutputRoleSummary(project, exportAnalysis),
    [project, exportAnalysis]
  );
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;
  const nextUndoLabel = undoStack[undoStack.length - 1]?.label ?? null;
  const nextRedoLabel = redoStack[0]?.label ?? null;
  const editHistoryReadout = createEditHistoryReadoutSummary(
    undoStack.length,
    redoStack.length,
    projectStatus,
    nextUndoLabel,
    nextRedoLabel
  );
  const currentPlaybackStep = playbackPosition ? playbackPosition.loopStep % 16 : null;
  const currentEditorStep = playbackPosition?.pattern === project.selectedPattern ? currentPlaybackStep : null;
  const playingPattern = isPlaying ? playbackPosition?.pattern ?? null : null;
  const audiblePatternFollowTarget = playingPattern && playingPattern !== project.selectedPattern ? playingPattern : null;
  const patternPlaybackReadout = createPatternPlaybackReadoutSummary(
    project.selectedPattern,
    playingPattern,
    patternEventCount(currentPattern),
    playingPattern ? patternEventCount(project.patterns[playingPattern]) : null
  );
  const playingArrangementIndex =
    isPlaying && playbackPosition?.mode === "arrangement" && typeof playbackPosition.arrangementIndex === "number"
      ? playbackPosition.arrangementIndex
      : null;
  const selectedArrangementBlock = project.arrangement[selectedArrangementIndex] ?? project.arrangement[0];
  const patternCompareDecisionSummary = useMemo(
    () =>
      createPatternCompareDecisionSummary(
        patternCompareSummaries,
        project.selectedPattern,
        selectedArrangementBlock?.pattern ?? project.selectedPattern
      ),
    [patternCompareSummaries, project.selectedPattern, selectedArrangementBlock?.pattern]
  );
  const audibleArrangementFollowTarget =
    playingArrangementIndex !== null && playingArrangementIndex !== selectedArrangementIndex ? playingArrangementIndex : null;
  const audibleArrangementFollowBlock =
    audibleArrangementFollowTarget !== null ? project.arrangement[audibleArrangementFollowTarget] ?? null : null;
  const audibleArrangementFollowBlockNumber = audibleArrangementFollowTarget !== null ? audibleArrangementFollowTarget + 1 : 0;
  const editingAudibleArrangementBlock =
    playingArrangementIndex !== null && playingArrangementIndex === selectedArrangementIndex;
  const arrangementPlaybackReadout = createArrangementPlaybackReadoutSummary(
    project,
    selectedArrangementIndex,
    playingArrangementIndex
  );
  const selectedArrangementBars = selectedArrangementBlock ? normalizeArrangementBars(selectedArrangementBlock.bars) : 1;
  const selectedArrangementStartBar = arrangementStartBar(project, selectedArrangementIndex);
  const transportLoopMode = transportLoopScope === "pattern" ? "pattern" : "arrangement";
  const transportLoopBars =
    transportLoopScope === "pattern"
      ? 2
      : transportLoopScope === "block"
        ? selectedArrangementBars
        : transportLoopScope === "transition"
          ? arrangementTransitionLoopTarget?.bars
          : undefined;
  const transportLoopStartBar =
    transportLoopScope === "block"
      ? selectedArrangementStartBar
      : transportLoopScope === "transition"
        ? arrangementTransitionLoopTarget?.startBar ?? 0
        : 0;
  const transportLoopReadout = transportLoopStatus(
    project,
    transportLoopScope,
    selectedArrangementIndex,
    arrangementTransitionLoopTarget
  );
  const transportPrimary = isPlaying
    ? playbackPosition?.mode === "pattern"
      ? `Pattern ${playbackPosition.pattern} ${playbackPosition.bar}.${playbackPosition.beat}`
      : `${playbackPosition?.section ?? "Arrangement"} ${playbackPosition?.bar ?? 1}.${playbackPosition?.beat ?? 1}`
    : "Ready";
  const transportSecondary = isPlaying
    ? `${transportLoopLabel(transportLoopScope)} / Pattern ${playbackPosition?.pattern ?? project.selectedPattern} / Step ${(currentPlaybackStep ?? 0) + 1}`
    : transportLoopReadout;
  const transportPositionReadout = createTransportPositionReadoutSummary(
    project,
    isPlaying,
    playbackPosition,
    transportLoopScope,
    selectedArrangementIndex,
    selectedArrangementStartBar,
    arrangementTransitionLoopTarget
  );
  const tapTempoReadout = createTapTempoReadoutSummary(project.bpm, tapTempo);
  const localDraftStatusLabel = localDraftSavedAt ? `Draft ${formatLocalDraftSavedAt(localDraftSavedAt)}` : "Draft local";
  const projectSafetyReadout = createProjectSafetyReadoutSummary(
    localDraftRecovery,
    localDraftSavedAt,
    projectStatus,
    projectFileLabel,
    projectHasUnsavedChanges
  );
  const selectedArrangementNextBlock = project.arrangement[selectedArrangementIndex + 1];
  const selectedArrangementNextBars = selectedArrangementNextBlock ? normalizeArrangementBars(selectedArrangementNextBlock.bars) : 0;
  const selectedArrangementFocus = useMemo(
    () => createArrangementFocusSummary(project, selectedArrangementIndex),
    [project, selectedArrangementIndex]
  );
  const arrangementFocusPreviewSummary = useMemo(
    () => createArrangementFocusPreviewSummary(project, selectedArrangementIndex, selectedArrangementFocus),
    [project, selectedArrangementFocus, selectedArrangementIndex]
  );
  const sectionLocatorPads = useMemo(
    () => createSectionLocatorPads(project, selectedArrangementIndex, playingArrangementIndex),
    [playingArrangementIndex, project, selectedArrangementIndex]
  );
  const arrangementMovePrioritySummary = useMemo(
    () => createArrangementMovePrioritySummary(selectedArrangementBlock, selectedArrangementIndex, project.arrangement.length),
    [project.arrangement.length, selectedArrangementBlock, selectedArrangementIndex]
  );
  const selectedBlockEditPrioritySummary = useMemo(
    () => createSelectedBlockEditPrioritySummary(project, selectedArrangementIndex, arrangementBlockClipboard),
    [arrangementBlockClipboard, project, selectedArrangementIndex]
  );
  const selectedArrangementBlockRole = useMemo(
    () => selectedArrangementBlockRoleSummary(project, selectedArrangementIndex),
    [project, selectedArrangementIndex]
  );
  const arrangementTemplatePreviewSummary = useMemo(
    () => createArrangementTemplatePreviewSummary(project.arrangement),
    [project.arrangement]
  );
  const arrangementArcPadOptions = useMemo(
    () => createArrangementArcPadOptions(project, selectedArrangementIndex),
    [project, selectedArrangementIndex]
  );
  const arrangementArcPreviewSummary = useMemo(
    () => createArrangementArcPreviewSummary(project, selectedArrangementIndex, arrangementArcPadOptions),
    [arrangementArcPadOptions, project, selectedArrangementIndex]
  );
  const patternChainPreviewSummary = useMemo(
    () => createPatternChainPreviewSummary(project.arrangement),
    [project.arrangement]
  );
  const patternChainPrioritySummary = useMemo(
    () => createPatternChainPrioritySummary(patternChainPreviewSummary),
    [patternChainPreviewSummary]
  );
  const canSplitArrangementBlock = selectedArrangementBars > 1;
  const canMergeArrangementBlock =
    Boolean(selectedArrangementNextBlock) && selectedArrangementBars + selectedArrangementNextBars <= maxArrangementBars;
  const bassPitches = useMemo(
    () => mergePitchLanes(bassPitchLanes(project.key), currentPattern.bassNotes.map((note) => note.pitch)),
    [currentPattern.bassNotes, project.key]
  );
  const melodyPitches = useMemo(
    () => mergePitchLanes(melodyPitchLanes(project.key), currentPattern.melodyNotes.map((note) => note.pitch)),
    [currentPattern.melodyNotes, project.key]
  );
  const activeKeyboardCaptureDefaults = keyboardCaptureDefaults[keyboardCaptureTarget];
  const keyboardCaptureKeyMap = useMemo(
    () => createKeyboardCaptureKeyMap(keyboardCapturePitchLanes(project.key, keyboardCaptureTarget, activeKeyboardCaptureDefaults)),
    [activeKeyboardCaptureDefaults, keyboardCaptureTarget, project.key]
  );
  const basslinePadOptions = useMemo(() => createBasslinePadOptions(project.key), [project.key]);
  const bassGlidePadOptions = useMemo(() => createBassGlidePadOptions(currentPattern.bassNotes), [currentPattern.bassNotes]);
  const bassContourOptions = useMemo(
    () => createBassContourOptions(project.key, currentPattern.bassNotes),
    [project.key, currentPattern.bassNotes]
  );
  const bassMovePreviewSummary = useMemo(
    () =>
      createBassMovePreviewSummary(
        project.key,
        currentPattern.bassNotes,
        basslinePadOptions,
        bassGlidePadOptions,
        bassContourOptions
      ),
    [project.key, currentPattern.bassNotes, basslinePadOptions, bassGlidePadOptions, bassContourOptions]
  );
  const melodyMotifOptions = useMemo(() => createMelodyMotifOptions(project.key), [project.key]);
  const melodyAccentOptions = useMemo(() => createMelodyAccentOptions(currentPattern.melodyNotes), [currentPattern.melodyNotes]);
  const melodyContourOptions = useMemo(
    () => createMelodyContourOptions(project.key, currentPattern.melodyNotes),
    [project.key, currentPattern.melodyNotes]
  );
  const melodyMovePreviewSummary = useMemo(
    () =>
      createMelodyMovePreviewSummary(
        project.key,
        currentPattern.melodyNotes,
        melodyMotifOptions,
        melodyAccentOptions,
        melodyContourOptions
      ),
    [project.key, currentPattern.melodyNotes, melodyMotifOptions, melodyAccentOptions, melodyContourOptions]
  );
  const patternStackOptions = useMemo(() => createPatternStackOptions(project.key), [project.key]);
  const patternStackPreviewSummary = useMemo(
    () => createPatternStackPreviewSummary(project.key, currentPattern, patternStackOptions),
    [project.key, currentPattern, patternStackOptions]
  );
  const patternVariationPreviewSummary = useMemo(
    () => createPatternVariationPreviewSummary(project.selectedPattern, currentPattern, patternVariationPreviewPreset),
    [project.selectedPattern, currentPattern, patternVariationPreviewPreset]
  );
  const patternVariationSuggestionSummary = useMemo(
    () => createPatternVariationSuggestionSummary(project.selectedPattern, currentPattern),
    [project.selectedPattern, currentPattern]
  );
  const patternFillPreviewSummary = useMemo(
    () => createPatternFillPreviewSummary(project.selectedPattern, currentPattern, patternFillPreviewPreset, project.key),
    [project.selectedPattern, currentPattern, patternFillPreviewPreset, project.key]
  );
  const patternFillSuggestionSummary = useMemo(
    () => createPatternFillSuggestionSummary(project.selectedPattern, currentPattern, project.key),
    [project.selectedPattern, currentPattern, project.key]
  );
  const patternCloneSuggestionSummary = useMemo(
    () => createPatternCloneSuggestionSummary(project.selectedPattern, project.patterns),
    [project.selectedPattern, project.patterns]
  );
  const patternCloneOptions = useMemo(() => createPatternClonePadOptions(project.selectedPattern), [project.selectedPattern]);
  const drumFoundationOptions = useMemo(() => createDrumFoundationOptions(), []);
  const grooveFeelOptions = useMemo(() => createGrooveFeelOptions(), []);
  const drumAccentOptions = useMemo(() => createDrumAccentOptions(), []);
  const drumMovePreviewSummary = useMemo(
    () => createDrumMovePreviewSummary(currentPattern, drumFoundationOptions, grooveFeelOptions, drumAccentOptions),
    [currentPattern, drumFoundationOptions, grooveFeelOptions, drumAccentOptions]
  );
  const keyboardCaptureNextStep = resolveKeyboardCaptureStep(
    currentPattern,
    keyboardCaptureTarget,
    selectedNote,
    keyboardCaptureStepMode
  );
  const keyboardCapturePosture = createKeyboardCapturePostureSummary(
    keyboardCaptureEnabled,
    keyboardCaptureTarget,
    activeKeyboardCaptureDefaults,
    keyboardCaptureNextStep,
    keyboardCaptureStepMode
  );
  const midiInputOptions = useMemo(() => createMidiInputOptions(midiAccess), [midiAccess, midiPortRevision]);
  const midiCaptureSummary = createMidiCaptureSummary(
    midiCaptureStatus,
    midiCaptureArmed,
    midiInputOptions,
    midiLastNoteLabel
  );
  const midiSelectedInputLabel =
    midiSelectedInputId === "all"
      ? "All connected inputs"
      : midiInputOptions.find((input) => input.id === midiSelectedInputId)?.label ?? midiSelectedInputId;
  const chordRootOptions = useMemo(
    () => mergeChordRoots(scalePitchNames(project.key), currentPattern.chordEvents.map((event) => event.root)),
    [currentPattern.chordEvents, project.key]
  );
  const selectedBassNote =
    selectedNote?.track === "bass"
      ? currentPattern.bassNotes.find((note) => note.step === selectedNote.step && note.pitch === selectedNote.pitch)
      : undefined;
  const selectedMelodyNote =
    selectedNote?.track === "melody"
      ? currentPattern.melodyNotes.find((note) => note.step === selectedNote.step && note.pitch === selectedNote.pitch)
      : undefined;
  const selectedCaptureNoteActive = Boolean(
    selectedNote && (selectedNote.track === "bass" ? selectedBassNote : selectedMelodyNote)
  );
  const selectedCaptureNoteLabel = selectedNote
    ? `${selectedNote.track === "bass" ? "808" : "Synth"} ${selectedNote.pitch}.${selectedNote.step + 1}`
    : "No selected note";
  const selectedDrumActive = selectedDrumStep
    ? currentPattern.drumPattern[selectedDrumStep.lane][selectedDrumStep.step]
    : false;
  const selectedChord =
    selectedChordIndex === null ? undefined : currentPattern.chordEvents[selectedChordIndex];
  const selectedNoteBeatDuplicateStep = (() => {
    if (!selectedNote) {
      return null;
    }
    const source = selectedNote.track === "bass" ? selectedBassNote : selectedMelodyNote;
    if (!source) {
      return null;
    }
    const noteLane = selectedNote.track === "bass" ? currentPattern.bassNotes : currentPattern.melodyNotes;
    const latestStartStep = steps.length - clampStepLength(source.length);

    return steps.find(
      (candidateStep) =>
        candidateStep > source.step &&
        candidateStep % 4 === 0 &&
        candidateStep <= latestStartStep &&
        !noteLane.some((note) => note.step === candidateStep && note.pitch === source.pitch)
    ) ?? null;
  })();
  const selectedNotePreviousBeatDuplicateStep = (() => {
    if (!selectedNote) {
      return null;
    }
    const source = selectedNote.track === "bass" ? selectedBassNote : selectedMelodyNote;
    if (!source) {
      return null;
    }
    const noteLane = selectedNote.track === "bass" ? currentPattern.bassNotes : currentPattern.melodyNotes;
    const latestStartStep = steps.length - clampStepLength(source.length);

    return steps.reduce<number | null>((targetStep, candidateStep) => {
      if (candidateStep >= source.step || candidateStep % 4 !== 0 || candidateStep > latestStartStep) {
        return targetStep;
      }
      const occupied = noteLane.some((note) => note.step === candidateStep && note.pitch === source.pitch);
      return occupied ? targetStep : candidateStep;
    }, null);
  })();
  const selectedDrumPreviousBeatDuplicateStep =
    selectedDrumStep && selectedDrumActive
      ? steps.reduce<number | null>((targetStep, candidateStep) => {
          if (candidateStep >= selectedDrumStep.step || candidateStep % 4 !== 0) {
            return targetStep;
          }
          return currentPattern.drumPattern[selectedDrumStep.lane][candidateStep] ? targetStep : candidateStep;
        }, null)
      : null;
  const selectedDrumBeatDuplicateStep =
    selectedDrumStep && selectedDrumActive
      ? steps.find(
          (candidateStep) =>
            candidateStep > selectedDrumStep.step &&
            candidateStep % 4 === 0 &&
            !currentPattern.drumPattern[selectedDrumStep.lane][candidateStep]
        ) ?? null
      : null;
  const selectedChordBeatDuplicateStep = selectedChord
    ? steps.find(
        (candidateStep) =>
          candidateStep > selectedChord.step &&
          candidateStep % 4 === 0 &&
          candidateStep <= steps.length - clampStepLength(selectedChord.length) &&
          !currentPattern.chordEvents.some((chord) => chord.step === candidateStep)
      ) ?? null
    : null;
  const selectedChordPreviousBeatDuplicateStep = selectedChord
    ? steps.reduce<number | null>((targetStep, candidateStep) => {
        if (candidateStep >= selectedChord.step || candidateStep % 4 !== 0 || candidateStep > steps.length - clampStepLength(selectedChord.length)) {
          return targetStep;
        }
        return currentPattern.chordEvents.some((chord) => chord.step === candidateStep) ? targetStep : candidateStep;
      }, null)
    : null;
  const keyCompassSummary = useMemo(
    () => createKeyCompassSummary(project, selectedNote, selectedChord, selectedDrumStep),
    [project, selectedNote, selectedChord, selectedDrumStep]
  );
  const grooveCompassSummary = useMemo(
    () => createGrooveCompassSummary(project, selectedDrumStep),
    [project, selectedDrumStep]
  );
  const composerGuideSummary = useMemo(
    () => createComposerGuideSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const modeFocusSummary = useMemo(
    () => createModeFocusSummary(project, composerGuideSummary, beatMapSummary, reviewQueueSummary, finishChecklistSummary),
    [project, composerGuideSummary, beatMapSummary, reviewQueueSummary, finishChecklistSummary]
  );
  const composerActionsSummary = useMemo(
    () => createComposerActionsSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses),
    [project, beatReadinessChecks, exportAnalysis, stemAnalyses]
  );
  const chordPadOptions = useMemo(
    () => createChordPadOptions(project.key, selectedChord),
    [project.key, selectedChord]
  );
  const chordRhythmOptions = useMemo(
    () => createChordRhythmOptions(currentPattern.chordEvents),
    [currentPattern.chordEvents]
  );
  const chordVoicingOptions = useMemo(
    () => createChordVoicingOptions(selectedChord),
    [selectedChord]
  );
  const chordMovePreviewSummary = useMemo(
    () =>
      createChordMovePreviewSummary(
        project.key,
        currentPattern.chordEvents,
        selectedChord,
        chordPadOptions,
        chordRhythmOptions,
        chordVoicingOptions
      ),
    [project.key, currentPattern.chordEvents, selectedChord, chordPadOptions, chordRhythmOptions, chordVoicingOptions]
  );
  const selectedDrumVelocity =
    selectedDrumStep && selectedDrumActive
      ? drumStepVelocity(currentPattern, selectedDrumStep.lane, selectedDrumStep.step)
      : undefined;
  const selectedDrumTiming =
    selectedDrumStep && selectedDrumActive
      ? drumStepTimingMs(currentPattern, selectedDrumStep.lane, selectedDrumStep.step)
      : 0;
  const selectedDrumProbability =
    selectedDrumStep && selectedDrumActive
      ? drumStepProbability(currentPattern, selectedDrumStep.lane, selectedDrumStep.step)
      : undefined;
  const selectedHatRepeat =
    selectedDrumStep && selectedDrumStep.lane === "hat" && selectedDrumActive
      ? hatRepeatCount(currentPattern, selectedDrumStep.step)
      : 1;
  const editorAuditionReadout = createEditorAuditionReadoutSummary({
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
  });

  useEffect(() => {
    setEditorAuditionResult(null);
  }, [
    project.selectedPattern,
    selectedDrumStep?.lane,
    selectedDrumStep?.step,
    selectedNote?.track,
    selectedNote?.step,
    selectedNote?.pitch,
    selectedChordIndex
  ]);

  useEffect(() => {
    setInputCaptureResult(null);
  }, [
    project.selectedPattern,
    keyboardCaptureTarget,
    keyboardCaptureStepMode,
    activeKeyboardCaptureDefaults.octave,
    activeKeyboardCaptureDefaults.length,
    activeKeyboardCaptureDefaults.velocity,
    activeKeyboardCaptureDefaults.glide
  ]);

  useEffect(() => {
    if (selectedEventDeleteSelectionGuardRef.current) {
      selectedEventDeleteSelectionGuardRef.current = false;
      return;
    }
    setSelectedEventDeleteResult(null);
  }, [
    project.selectedPattern,
    selectedDrumStep?.lane,
    selectedDrumStep?.step,
    selectedNote?.track,
    selectedNote?.step,
    selectedNote?.pitch,
    selectedChordIndex
  ]);

  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
      controllerRef.current = null;
      auditionControllerRef.current?.stop();
      auditionControllerRef.current = null;
      if (tapTempoCommitTimerRef.current !== null) {
        window.clearTimeout(tapTempoCommitTimerRef.current);
        tapTempoCommitTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!localDraftReadyRef.current) {
      localDraftReadyRef.current = true;
      return;
    }
    if (!localDraftWriteArmed) {
      return;
    }
    if (localDraftSkipNextWriteRef.current) {
      localDraftSkipNextWriteRef.current = false;
      return;
    }

    const savedAt = writeLocalDraft(project);
    if (savedAt) {
      setLocalDraftSavedAt(savedAt);
    }
  }, [localDraftWriteArmed, project]);

  useEffect(() => {
    setSelectedArrangementIndex((index) => Math.min(index, Math.max(0, project.arrangement.length - 1)));
  }, [project.arrangement.length]);

  useEffect(() => {
    setSplitAfterBars((value) => clampSplitAfterBars(value, selectedArrangementBars));
  }, [selectedArrangementBars, selectedArrangementIndex]);

  useEffect(() => {
    setSelectedChordIndex((index) => {
      if (currentPattern.chordEvents.length === 0) {
        return null;
      }
      return index === null ? 0 : Math.min(index, currentPattern.chordEvents.length - 1);
    });
  }, [currentPattern.chordEvents.length, project.selectedPattern]);

  useEffect(() => {
    const snapshotIds = new Set(project.snapshots.map((snapshot) => snapshot.id));
    setSnapshotNameDrafts((current) => {
      const nextDrafts = Object.fromEntries(Object.entries(current).filter(([snapshotId]) => snapshotIds.has(snapshotId)));
      return Object.keys(nextDrafts).length === Object.keys(current).length ? current : nextDrafts;
    });
  }, [project.snapshots]);

  useEffect(() => {
    if (!midiAccess) {
      return;
    }

    const handleStateChange = (): void => {
      setMidiPortRevision((revision) => revision + 1);
      setMidiCaptureStatus((status) => (status === "requesting" || status === "unsupported" ? status : "ready"));
    };

    midiAccess.onstatechange = handleStateChange;
    return () => {
      if (midiAccess.onstatechange === handleStateChange) {
        midiAccess.onstatechange = null;
      }
    };
  }, [midiAccess]);

  useEffect(() => {
    if (!midiAccess) {
      return;
    }

    const inputs = Array.from(midiAccess.inputs.values());
    const listeningInputs = inputs.filter((input) => midiInputMatchesSelection(input, midiSelectedInputId));
    const handleMidiMessage = (event: MIDIMessageEvent): void => {
      captureMidiNoteEvent(event);
    };

    for (const input of inputs) {
      input.onmidimessage = midiCaptureArmed && midiInputMatchesSelection(input, midiSelectedInputId) ? handleMidiMessage : null;
    }

    setMidiCaptureStatus(midiCaptureArmed && listeningInputs.length > 0 ? "listening" : "ready");

    return () => {
      for (const input of inputs) {
        if (input.onmidimessage === handleMidiMessage) {
          input.onmidimessage = null;
        }
      }
    };
  }, [
    midiAccess,
    midiPortRevision,
    midiCaptureArmed,
    midiSelectedInputId,
    keyboardCaptureTarget,
    keyboardCaptureDefaults,
    keyboardCaptureStepMode,
    selectedNote
  ]);

  useEffect(() => {
    if (midiSelectedInputId !== "all" && !midiInputOptions.some((input) => input.id === midiSelectedInputId)) {
      setMidiSelectedInputId("all");
    }
  }, [midiInputOptions, midiSelectedInputId]);

  useEffect(() => {
    window.addEventListener("keydown", handleDesktopShortcut);
    return () => window.removeEventListener("keydown", handleDesktopShortcut);
  }, [
    project,
    undoStack,
    redoStack,
    isPlaying,
    playbackMode,
    selectedNote,
    selectedDrumStep,
    selectedDrumActive,
    selectedChordIndex,
    quickActionsOpen,
    commandReferenceOpen,
    keyboardCaptureEnabled,
    keyboardCaptureTarget,
    keyboardCaptureDefaults,
    keyboardCaptureStepMode
  ]);

  useEffect(() => {
    return window.grooveforge?.onMenuCommand?.(handleNativeMenuCommand);
  }, [
    project,
    undoStack,
    redoStack,
    isPlaying,
    transportLoopMode,
    transportLoopBars,
    transportLoopStartBar,
    selectedNote,
    selectedDrumStep,
    selectedDrumActive,
    selectedChordIndex,
    quickActionsOpen,
    commandReferenceOpen,
    keyboardCaptureEnabled,
    keyboardCaptureTarget,
    keyboardCaptureDefaults,
    keyboardCaptureStepMode
  ]);

  function handleDesktopShortcut(event: KeyboardEvent): void {
    if (isEditableShortcutTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();
    const withCommandModifier = event.metaKey || event.ctrlKey;
    const wantsQuickActions = withCommandModifier && !event.shiftKey && key === "k";
    const wantsCommandReference = key === "?" || (withCommandModifier && !event.shiftKey && key === "/");
    const wantsUndo = withCommandModifier && !event.shiftKey && key === "z";
    const wantsRedo = withCommandModifier && ((event.shiftKey && key === "z") || key === "y");
    const wantsSave = withCommandModifier && !event.shiftKey && key === "s";
    const wantsOpen = withCommandModifier && !event.shiftKey && key === "o";

    if (wantsCommandReference) {
      event.preventDefault();
      openCommandReference();
      return;
    }

    if (wantsQuickActions) {
      event.preventDefault();
      openQuickActions();
      return;
    }

    if (commandReferenceOpen) {
      if (key === "escape") {
        event.preventDefault();
        closeCommandReference();
      }
      return;
    }

    if (quickActionsOpen) {
      if (key === "escape") {
        event.preventDefault();
        closeQuickActions();
      }
      return;
    }

    if (wantsUndo || wantsRedo || wantsSave || wantsOpen) {
      event.preventDefault();
      if (wantsUndo) {
        undoProject();
        return;
      }
      if (wantsRedo) {
        redoProject();
        return;
      }
      if (wantsSave) {
        void handleSaveProject();
        return;
      }
      void handleOpenProject();
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      if (!event.repeat) {
        togglePlayback();
      }
      return;
    }

    if (keyboardCaptureEnabled && isKeyboardCaptureKey(key)) {
      event.preventDefault();
      if (!event.repeat) {
        captureKeyboardNote(key);
      }
      return;
    }

    const patternShortcut: Record<string, PatternSlot> = { "1": "A", "2": "B", "3": "C" };
    const nextPattern = patternShortcut[key];
    if (nextPattern) {
      event.preventDefault();
      selectPattern(nextPattern);
      return;
    }

    if (key === "backspace" || key === "delete") {
      event.preventDefault();
      if (!event.repeat) {
        deleteSelectedEvent();
      }
    }
  }

  function handleNativeMenuCommand(command: NativeMenuCommand): void {
    switch (command) {
      case "open-project":
        void handleOpenProject();
        return;
      case "save-project":
        void handleSaveProject();
        return;
      case "undo":
        undoProject();
        return;
      case "redo":
        redoProject();
        return;
      case "quick-actions":
        openQuickActions();
        return;
      case "command-reference":
        openCommandReference();
        return;
      case "toggle-playback":
        togglePlayback();
        return;
      case "delete-selected-event":
        deleteSelectedEvent();
        return;
    }
  }

  function updateProject(update: (current: ProjectState) => ProjectState, status = "Unsaved changes"): boolean {
    const current = projectRef.current;
    const nextProject = update(current);
    if (nextProject === current) {
      return false;
    }

    projectRef.current = nextProject;
    setUndoStack((history) => appendHistory(history, createEditHistoryEntry(current, status)));
    setRedoStack([]);
    setLocalDraftWriteArmed(true);
    setProjectHasUnsavedChanges(true);
    setProject(nextProject);
    setComposerActionResult(null);
    setComposerGuideResult(null);
    setKeyCompassResult(null);
    setGrooveCompassResult(null);
    setPatternDnaResult(null);
    setStyleInspectorResult(null);
    setBeatReadinessResult(null);
    setListeningPassResult(null);
    setBeatPassportResult(null);
    setProductionSnapshotResult(null);
    setSnapshotCompareResult(null);
    setReviewQueueResult(null);
    setFinishChecklistResult(null);
    setExportPreflightResult(null);
    setHandoffExportFormatResult(null);
    setHandoffPackageCheckResult(null);
    setNextMoveResult(null);
    setQuickActionResult(null);
    setEditorAuditionResult(null);
    setInputCaptureResult(null);
    setSelectedEventDeleteResult(null);
    setUndoRedoResult(null);
    setProjectFileResult(null);
    setLocalDraftRecoveryResult(null);
    setModeSwitchResult(null);
    setModeFocusResult(null);
    setWorkflowNavigatorResult(null);
    setFirstBeatPathResult(null);
    setSessionPassResult(null);
    setSwingFeelResult(null);
    setStyleGoalCueResult(null);
    setBeatBlueprintResult(null);
    setBeatSpineResult(null);
    setBeatSpineJumpResult(null);
    setLayerStarterResult(null);
    setPatternCompareResult(null);
    setPatternCloneResult(null);
    setPatternEditResult(null);
    setPatternFillResult(null);
    setPatternVariationResult(null);
    setPatternStackResult(null);
    setDrumMoveResult(null);
    setBassMoveResult(null);
    setMelodyMoveResult(null);
    setChordMoveResult(null);
    setArrangementTemplateResult(null);
    setArrangementArcResult(null);
    setArrangementFocusResult(null);
    setArrangementMoveResult(null);
    setSelectedBlockEditResult(null);
    setPatternChainResult(null);
    setSoundPresetResult(null);
    setSoundFocusResult(null);
    setDrumKitResult(null);
    setMasterFinishResult(null);
    setMasterAutomationResult(null);
    setMixBalanceResult(null);
    setSpaceFxResult(null);
    setMixFixResult(null);
    setMixCoachResult(null);
    setDeliveryTargetAlignmentResult(null);
    setSessionBriefStarterResult(null);
    setSessionBriefCompassResult(null);
    setReferenceAlignmentResult(null);
    setReviewFixResult(null);
    setHookReadinessResult(null);
    setHookFixResult(null);
    setToplineSpaceResult(null);
    setToplineFixResult(null);
    setArrangementMuteMapResult(null);
    setArrangementTransitionMapResult(null);
    setSectionCueResult(null);
    setProjectStatus(status);
    return true;
  }

  function updateProjectView(update: (current: ProjectState) => ProjectState, status: string): void {
    const current = projectRef.current;
    const nextProject = update(current);
    if (nextProject !== current) {
      projectRef.current = nextProject;
      setProject(nextProject);
      setComposerGuideResult(null);
      setKeyCompassResult(null);
      setGrooveCompassResult(null);
      setPatternDnaResult(null);
      setStyleInspectorResult(null);
      setBeatReadinessResult(null);
      setListeningPassResult(null);
      setBeatPassportResult(null);
      setProductionSnapshotResult(null);
      setSnapshotCompareResult(null);
      setReviewQueueResult(null);
      setFinishChecklistResult(null);
      setExportPreflightResult(null);
      setHandoffExportFormatResult(null);
      setHandoffPackageCheckResult(null);
      setQuickActionResult(null);
      setEditorAuditionResult(null);
      setInputCaptureResult(null);
      setSelectedEventDeleteResult(null);
      setUndoRedoResult(null);
      setModeSwitchResult(null);
      setModeFocusResult(null);
      setWorkflowNavigatorResult(null);
      setFirstBeatPathResult(null);
      setSessionPassResult(null);
      setSwingFeelResult(null);
      setStyleGoalCueResult(null);
      setBeatBlueprintResult(null);
      setBeatSpineResult(null);
      setBeatSpineJumpResult(null);
      setLayerStarterResult(null);
      setPatternCompareResult(null);
      setPatternCloneResult(null);
      setPatternEditResult(null);
      setPatternFillResult(null);
      setPatternVariationResult(null);
      setPatternStackResult(null);
      setDrumMoveResult(null);
      setBassMoveResult(null);
      setMelodyMoveResult(null);
      setChordMoveResult(null);
      setArrangementTemplateResult(null);
      setArrangementArcResult(null);
      setArrangementFocusResult(null);
      setArrangementMoveResult(null);
      setSelectedBlockEditResult(null);
      setPatternChainResult(null);
      setSoundPresetResult(null);
      setSoundFocusResult(null);
      setDrumKitResult(null);
      setMasterFinishResult(null);
      setMasterAutomationResult(null);
      setMixBalanceResult(null);
      setSpaceFxResult(null);
      setMixFixResult(null);
      setMixCoachResult(null);
      setDeliveryTargetAlignmentResult(null);
      setSessionBriefStarterResult(null);
      setSessionBriefCompassResult(null);
      setReferenceAlignmentResult(null);
      setReviewFixResult(null);
      setHookReadinessResult(null);
      setHookFixResult(null);
      setToplineSpaceResult(null);
      setToplineFixResult(null);
      setArrangementMuteMapResult(null);
      setArrangementTransitionMapResult(null);
      setSectionCueResult(null);
    }
    setProjectStatus(status);
  }

  function resetTapTempo(): void {
    if (tapTempoCommitTimerRef.current !== null) {
      window.clearTimeout(tapTempoCommitTimerRef.current);
      tapTempoCommitTimerRef.current = null;
    }
    tapTempoTimesRef.current = [];
    setTapTempo({ taps: 0, bpm: null, applied: true });
  }

  function updateProjectBpm(value: number): void {
    const nextBpm = clampProjectBpm(value);
    resetTapTempo();
    updateProject((current) => (current.bpm === nextBpm ? current : { ...current, bpm: nextBpm }));
  }

  function applyTempoNudgePad(pad: TempoNudgePadDefinition): void {
    const nextBpm = tempoNudgePadBpm(projectRef.current.bpm, pad.id);
    resetTapTempo();
    const changed = updateProject(
      (current) => (current.bpm === nextBpm ? current : { ...current, bpm: nextBpm }),
      `${pad.label} tempo ${nextBpm} BPM`
    );
    if (!changed) {
      setProjectStatus(`${pad.label} tempo held at ${nextBpm} BPM`);
    }
  }

  function applySwingFeelPad(padId: SwingFeelPadId): void {
    const pad = swingFeelPads.find((candidate) => candidate.id === padId);
    if (!pad) {
      return;
    }

    const beforeProject = projectRef.current;
    const nextSwing = swingFeelPadSwing(pad, beforeProject);
    const changed = updateProject(
      (current) => (normalizeSwingFeelValue(current.swing) === nextSwing ? current : { ...current, swing: nextSwing }),
      `${pad.label} swing ${percentLabel(nextSwing)}`
    );
    const afterProject = projectRef.current;
    setSwingFeelResult(createSwingFeelResult(pad, beforeProject, afterProject));
    if (!changed) {
      setProjectStatus(`${pad.label} swing held at ${percentLabel(nextSwing)}`);
    }
  }

  function commitTapTempoBpm(nextBpm: number): void {
    tapTempoCommitTimerRef.current = null;
    const changed = updateProject(
      (current) => (current.bpm === nextBpm ? current : { ...current, bpm: nextBpm }),
      `Tap tempo ${nextBpm} BPM`
    );
    setTapTempo((current) => (current.bpm === nextBpm ? { ...current, applied: true } : current));
    if (!changed) {
      setProjectStatus(`Tap tempo ${nextBpm} BPM`);
    }
  }

  function tapProjectTempo(): void {
    const now = performance.now();
    const recentTaps = [...tapTempoTimesRef.current.filter((tapTime) => now - tapTime <= tapTempoWindowMs), now].slice(
      -tapTempoMaxTaps
    );
    const nextBpm = calculateTapTempoBpm(recentTaps);

    tapTempoTimesRef.current = recentTaps;
    setTapTempo({ taps: recentTaps.length, bpm: nextBpm, applied: nextBpm === null });

    if (nextBpm === null) {
      if (tapTempoCommitTimerRef.current !== null) {
        window.clearTimeout(tapTempoCommitTimerRef.current);
        tapTempoCommitTimerRef.current = null;
      }
      setProjectStatus("Tap tempo armed");
      return;
    }

    if (tapTempoCommitTimerRef.current !== null) {
      window.clearTimeout(tapTempoCommitTimerRef.current);
    }
    tapTempoCommitTimerRef.current = window.setTimeout(() => commitTapTempoBpm(nextBpm), tapTempoCommitDelayMs);
    setProjectStatus(`Tap tempo ${nextBpm} BPM`);
  }

  function replaceProject(nextProject: ProjectState, status: string, fileLabel: string | null = null): void {
    projectRef.current = nextProject;
    localDraftSkipNextWriteRef.current = true;
    resetTapTempo();
    setProjectFileLabel(fileLabel);
    setProjectHasUnsavedChanges(false);
    setLocalDraftWriteArmed(false);
    setProject(nextProject);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedArrangementIndex((index) => Math.min(index, Math.max(0, nextProject.arrangement.length - 1)));
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    setComposerActionResult(null);
    setComposerGuideResult(null);
    setKeyCompassResult(null);
    setGrooveCompassResult(null);
    setPatternDnaResult(null);
    setStyleInspectorResult(null);
    setBeatReadinessResult(null);
    setListeningPassResult(null);
    setBeatPassportResult(null);
    setProductionSnapshotResult(null);
    setSnapshotCompareResult(null);
    setReviewQueueResult(null);
    setFinishChecklistResult(null);
    setExportPreflightResult(null);
    setHandoffExportFormatResult(null);
    setHandoffPackageCheckResult(null);
    setNextMoveResult(null);
    setQuickActionResult(null);
    setEditorAuditionResult(null);
    setInputCaptureResult(null);
    setSelectedEventDeleteResult(null);
    setUndoRedoResult(null);
    setProjectFileResult(null);
    setLocalDraftRecoveryResult(null);
    setModeFocusResult(null);
    setWorkflowNavigatorResult(null);
    setFirstBeatPathResult(null);
    setSessionPassResult(null);
    setSwingFeelResult(null);
    setBeatBlueprintResult(null);
    setBeatSpineResult(null);
    setBeatSpineJumpResult(null);
    setLayerStarterResult(null);
    setPatternCloneResult(null);
    setPatternEditResult(null);
    setPatternFillResult(null);
    setPatternVariationResult(null);
    setPatternStackResult(null);
    setDrumMoveResult(null);
    setBassMoveResult(null);
    setMelodyMoveResult(null);
    setChordMoveResult(null);
    setArrangementTemplateResult(null);
    setArrangementArcResult(null);
    setArrangementFocusResult(null);
    setArrangementMoveResult(null);
    setSelectedBlockEditResult(null);
    setPatternChainResult(null);
    setSoundPresetPreviewId(defaultSoundPresetPreview(nextProject));
    setSoundPresetResult(null);
    setSoundFocusResult(null);
    setDrumKitResult(null);
    setMasterFinishResult(null);
    setMasterAutomationResult(null);
    setMixBalanceResult(null);
    setMixSnapshots({ A: null, B: null });
    setSpaceFxResult(null);
    setMixFixResult(null);
    setMixCoachResult(null);
    setDeliveryTargetAlignmentResult(null);
    setSessionBriefStarterResult(null);
    setSessionBriefCompassResult(null);
    setReferenceAlignmentResult(null);
    setReviewFixResult(null);
    setHookReadinessResult(null);
    setHookFixResult(null);
    setToplineSpaceResult(null);
    setToplineFixResult(null);
    setArrangementMuteMapResult(null);
    setArrangementTransitionMapResult(null);
    setSectionCueResult(null);
    clearLocalDraftState();
    setProjectStatus(status);
  }

  function restoreProjectFromHistory(nextProject: ProjectState, status: string): void {
    projectRef.current = nextProject;
    resetTapTempo();
    setProject(nextProject);
    setSelectedArrangementIndex((index) => Math.min(index, Math.max(0, nextProject.arrangement.length - 1)));
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    setPlaybackPosition(null);
    setComposerActionResult(null);
    setComposerGuideResult(null);
    setKeyCompassResult(null);
    setGrooveCompassResult(null);
    setPatternDnaResult(null);
    setStyleInspectorResult(null);
    setBeatReadinessResult(null);
    setListeningPassResult(null);
    setBeatPassportResult(null);
    setProductionSnapshotResult(null);
    setSnapshotCompareResult(null);
    setReviewQueueResult(null);
    setFinishChecklistResult(null);
    setExportPreflightResult(null);
    setHandoffExportFormatResult(null);
    setHandoffPackageCheckResult(null);
    setNextMoveResult(null);
    setQuickActionResult(null);
    setEditorAuditionResult(null);
    setInputCaptureResult(null);
    setSelectedEventDeleteResult(null);
    setUndoRedoResult(null);
    setProjectFileResult(null);
    setLocalDraftRecoveryResult(null);
    setModeFocusResult(null);
    setWorkflowNavigatorResult(null);
    setFirstBeatPathResult(null);
    setSessionPassResult(null);
    setSwingFeelResult(null);
    setBeatBlueprintResult(null);
    setBeatSpineResult(null);
    setBeatSpineJumpResult(null);
    setLayerStarterResult(null);
    setPatternCloneResult(null);
    setPatternEditResult(null);
    setPatternFillResult(null);
    setPatternVariationResult(null);
    setPatternStackResult(null);
    setDrumMoveResult(null);
    setBassMoveResult(null);
    setMelodyMoveResult(null);
    setChordMoveResult(null);
    setArrangementTemplateResult(null);
    setArrangementArcResult(null);
    setArrangementFocusResult(null);
    setArrangementMoveResult(null);
    setSelectedBlockEditResult(null);
    setPatternChainResult(null);
    setSoundPresetPreviewId(defaultSoundPresetPreview(nextProject));
    setSoundPresetResult(null);
    setSoundFocusResult(null);
    setDrumKitResult(null);
    setMasterFinishResult(null);
    setMasterAutomationResult(null);
    setMixBalanceResult(null);
    setSpaceFxResult(null);
    setMixFixResult(null);
    setMixCoachResult(null);
    setDeliveryTargetAlignmentResult(null);
    setSessionBriefStarterResult(null);
    setSessionBriefCompassResult(null);
    setReferenceAlignmentResult(null);
    setReviewFixResult(null);
    setHookReadinessResult(null);
    setHookFixResult(null);
    setToplineSpaceResult(null);
    setToplineFixResult(null);
    setArrangementMuteMapResult(null);
    setArrangementTransitionMapResult(null);
    setSectionCueResult(null);
    setProjectStatus(status);
  }

  function createUndoRedoResult(
    action: UndoRedoResult["action"],
    label: string,
    restoredProject: ProjectState,
    remainingUndoDepth: number,
    remainingRedoDepth: number
  ): UndoRedoResult {
    const actionLabel = action === "undo" ? "Undo" : "Redo";
    return {
      action,
      targetId: `${action}-${remainingUndoDepth}-${remainingRedoDepth}`,
      status: action === "undo" ? "Undone" : "Redone",
      title: `${actionLabel}: ${label}`,
      detail: `${projectEventTotal(restoredProject)} events active / Pattern ${restoredProject.selectedPattern}`,
      metricLabel: "History",
      metricValue: `${remainingUndoDepth} undo / ${remainingRedoDepth} redo`,
      recoveryCue:
        action === "undo"
          ? "Use Redo immediately if the recovered beat went one edit too far."
          : "Use Undo immediately if replaying this edit breaks the current pass.",
      nextCheck: `Play Pattern ${restoredProject.selectedPattern}; confirm the restored edit still supports the beat before continuing.`,
      tone: "good"
    };
  }

  function undoProject(): void {
    const previousEntry = undoStack[undoStack.length - 1];
    if (!previousEntry) {
      setUndoRedoResult(null);
      setProjectStatus("Nothing to undo");
      return;
    }

    const current = projectRef.current;
    const remainingUndoDepth = undoStack.length - 1;
    const remainingRedoDepth = redoStack.length + 1;
    setUndoStack((history) => history.slice(0, -1));
    setRedoStack((history) => prependFuture(history, createEditHistoryEntry(current, previousEntry.label)));
    restoreProjectFromHistory(previousEntry.project, `Undo: ${previousEntry.label}`);
    setUndoRedoResult(createUndoRedoResult("undo", previousEntry.label, previousEntry.project, remainingUndoDepth, remainingRedoDepth));
  }

  function redoProject(): void {
    const nextEntry = redoStack[0];
    if (!nextEntry) {
      setUndoRedoResult(null);
      setProjectStatus("Nothing to redo");
      return;
    }

    const current = projectRef.current;
    const remainingUndoDepth = undoStack.length + 1;
    const remainingRedoDepth = redoStack.length - 1;
    setRedoStack((history) => history.slice(1));
    setUndoStack((history) => appendHistory(history, createEditHistoryEntry(current, nextEntry.label)));
    restoreProjectFromHistory(nextEntry.project, `Redo: ${nextEntry.label}`);
    setUndoRedoResult(createUndoRedoResult("redo", nextEntry.label, nextEntry.project, remainingUndoDepth, remainingRedoDepth));
  }

  function clearLocalDraftState(): void {
    clearLocalDraftStorage();
    setLocalDraftRecovery(null);
    setLocalDraftSavedAt(null);
  }

  function restoreLocalDraft(): void {
    if (!localDraftRecovery) {
      setLocalDraftRecoveryResult(null);
      setProjectStatus("No local draft to restore");
      return;
    }

    const recovery = localDraftRecovery;

    controllerRef.current?.stop();
    controllerRef.current = null;
    setPlaybackPosition(null);
    setIsPlaying(false);

    const draftProject = recovery.project;
    const changed = updateProject(
      () => draftProject,
      `Restored local draft ${formatLocalDraftSavedAt(recovery.savedAt)}`
    );
    clearLocalDraftState();

    if (changed) {
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setLocalDraftRecoveryResult(createLocalDraftRecoveryResult("restore", recovery, draftProject));
    }
  }

  function clearLocalDraftRecovery(): void {
    if (!localDraftRecovery) {
      setLocalDraftRecoveryResult(null);
      return;
    }

    const recovery = localDraftRecovery;
    clearLocalDraftState();
    setLocalDraftRecoveryResult(createLocalDraftRecoveryResult("clear", recovery, projectRef.current));
    setProjectStatus("Cleared local draft recovery");
  }

  function saveCurrentSnapshot(): void {
    const snapshotName = nextProjectSnapshotName(projectRef.current);
    updateProject((current) => saveProjectSnapshot(current), `Saved snapshot ${snapshotName}`);
  }

  function restoreSavedSnapshot(snapshotId: string): void {
    const snapshot = projectRef.current.snapshots.find((candidate) => candidate.id === snapshotId);
    if (!snapshot) {
      setProjectStatus("Snapshot not found");
      return;
    }
    const changed = updateProject((current) => restoreProjectSnapshot(current, snapshotId), `Restored snapshot ${snapshot.name}`);
    if (changed) {
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setPlaybackPosition(null);
    }
  }

  function deleteSavedSnapshot(snapshotId: string): void {
    const snapshot = projectRef.current.snapshots.find((candidate) => candidate.id === snapshotId);
    if (!snapshot) {
      setProjectStatus("Snapshot not found");
      return;
    }
    updateProject((current) => deleteProjectSnapshot(current, snapshotId), `Deleted snapshot ${snapshot.name}`);
  }

  function updateSnapshotNameDraft(snapshotId: string, name: string): void {
    setSnapshotNameDrafts((current) => ({
      ...current,
      [snapshotId]: name
    }));
  }

  function clearSnapshotNameDraft(snapshotId: string): void {
    setSnapshotNameDrafts((current) => {
      if (!(snapshotId in current)) {
        return current;
      }
      const nextDrafts = { ...current };
      delete nextDrafts[snapshotId];
      return nextDrafts;
    });
  }

  function commitSnapshotName(snapshotId: string, name: string): void {
    const snapshot = projectRef.current.snapshots.find((candidate) => candidate.id === snapshotId);
    if (!snapshot) {
      clearSnapshotNameDraft(snapshotId);
      setProjectStatus("Snapshot not found");
      return;
    }

    const normalizedName = normalizeProjectSnapshotName(name);
    if (!normalizedName) {
      clearSnapshotNameDraft(snapshotId);
      setProjectStatus("Snapshot name required");
      return;
    }

    if (snapshot.name === normalizedName) {
      clearSnapshotNameDraft(snapshotId);
      return;
    }

    const changed = updateProject(
      (current) => renameProjectSnapshot(current, snapshotId, normalizedName),
      `Renamed snapshot ${normalizedName}`
    );
    if (changed) {
      clearSnapshotNameDraft(snapshotId);
    }
  }

  function updateCurrentPattern(update: (pattern: PatternData) => PatternData, status = "Unsaved changes"): boolean {
    return updateProject((current) => {
      const currentPatternData = current.patterns[current.selectedPattern];
      const nextPatternData = update(currentPatternData);
      if (nextPatternData === currentPatternData) {
        return current;
      }
      return {
        ...current,
        patterns: {
          ...current.patterns,
          [current.selectedPattern]: nextPatternData
        }
      };
    }, status);
  }

  async function requestMidiInputAccess(): Promise<void> {
    if (!isMidiInputSupported()) {
      setMidiCaptureStatus("unsupported");
      setProjectStatus("Web MIDI input is not available");
      return;
    }

    setMidiCaptureStatus("requesting");
    try {
      const access = await navigator.requestMIDIAccess?.({ sysex: false, software: false });
      if (!access) {
        setMidiCaptureStatus("unsupported");
        setProjectStatus("Web MIDI input is not available");
        return;
      }

      setMidiAccess(access);
      setMidiPortRevision((revision) => revision + 1);
      setMidiCaptureStatus("ready");
      setProjectStatus("MIDI input ready");
    } catch (error) {
      console.error(error);
      setMidiCaptureStatus("denied");
      setMidiCaptureArmed(false);
      setProjectStatus("MIDI input permission denied");
    }
  }

  function refreshMidiInputPorts(): void {
    if (!midiAccess) {
      void requestMidiInputAccess();
      return;
    }

    setMidiPortRevision((revision) => revision + 1);
    setMidiCaptureStatus(midiCaptureArmed ? "listening" : "ready");
    setProjectStatus("MIDI inputs refreshed");
  }

  function createInputCaptureResult({
    source,
    inputLabel,
    patternSlot,
    projectKey,
    target,
    step,
    pitch,
    defaults,
    replaceStep
  }: {
    source: InputCaptureResult["source"];
    inputLabel: string;
    patternSlot: PatternSlot;
    projectKey: string;
    target: NoteTrack;
    step: number;
    pitch: string;
    defaults: KeyboardCaptureDefaults;
    replaceStep: boolean;
  }): InputCaptureResult {
    const targetLabel = target === "bass" ? "808" : "Synth";
    const sourceLabel = source === "keyboard" ? "Keyboard" : "MIDI";
    const length = clampStepLength(defaults.length);
    const velocity = clampVelocity(defaults.velocity);
    const degreeIndex = keyboardCapturePitchLanes(projectKey, target, defaults).indexOf(pitch);
    const degreeLabel = degreeIndex >= 0 ? keyboardCaptureDegreeLabel(degreeIndex) : "Scale";
    const articulation = target === "bass" ? (defaults.glide ? "glide" : "no glide") : "melody";
    const status = replaceStep ? "Replaced" : "Captured";
    const supportingLayers = target === "bass" ? "drums, chords, and Synth" : "drums, 808, and chords";

    return {
      source,
      targetId: `${source}-${patternSlot}-${target}-${step}-${pitch}`,
      status,
      title: `${targetLabel} ${pitch} step ${step + 1}`,
      detail: `${sourceLabel} ${inputLabel} / ${replaceStep ? "replaced selected step" : "next free step"} / ${percentLabel(
        velocity
      )} velocity`,
      patternLabel: `Pattern ${patternSlot}`,
      metricLabel: "Capture",
      metricValue: `${degreeLabel} / length ${length} / ${articulation}`,
      captureCue: `Loop Pattern ${patternSlot}; hear the captured ${targetLabel} against ${supportingLayers}.`,
      nextCheck: replaceStep
        ? "Undo if the replacement missed the phrase, or switch Capture Step Mode back to Next for additive writing."
        : "Keep capturing while the idea is fresh, then audition the selected note before editing length, glide, or velocity.",
      tone: "good"
    };
  }

  function captureMidiNoteEvent(event: MIDIMessageEvent): void {
    if (!event.data) {
      return;
    }

    const note = midiNoteOnFromMessage(event.data);
    if (!note) {
      return;
    }

    const current = projectRef.current;
    const pattern = activePattern(current);
    const target = keyboardCaptureTarget;
    const captureDefaults = keyboardCaptureDefaults[target];
    const pitch = midiNoteToScalePitch(note.noteNumber, current.key, target);
    if (!pitch) {
      setInputCaptureResult(null);
      setMidiLastNoteLabel(`Ignored ${midiNoteLabel(note.noteNumber)}`);
      setProjectStatus("MIDI note is out of range");
      return;
    }

    const step = resolveKeyboardCaptureStep(pattern, target, selectedNote, keyboardCaptureStepMode);
    const replaceStep = shouldReplaceKeyboardCaptureStep(keyboardCaptureStepMode, selectedNote, target);
    const midiDefaults: KeyboardCaptureDefaults = { ...captureDefaults, velocity: note.velocity };
    const result = createInputCaptureResult({
      source: "midi",
      inputLabel: midiNoteLabel(note.noteNumber),
      patternSlot: current.selectedPattern,
      projectKey: current.key,
      target,
      step,
      pitch,
      defaults: midiDefaults,
      replaceStep
    });
    const changed = updateCurrentPattern(
      (currentPatternData) => addKeyboardCaptureNote(currentPatternData, target, step, pitch, midiDefaults, replaceStep),
      `MIDI ${replaceStep ? "replaced" : "captured"} ${target === "bass" ? "808" : "Synth"} ${pitch}.${step + 1} on Pattern ${
        current.selectedPattern
      }`
    );
    const noteLabel = `${midiNoteLabel(note.noteNumber)} -> ${pitch}.${step + 1} / ${Math.round(note.velocity * 100)}%`;

    setMidiLastNoteLabel(noteLabel);
    if (!changed) {
      setInputCaptureResult(null);
      setProjectStatus("MIDI note already exists");
      return;
    }

    setInputCaptureResult(result);
    setSelectedNote({ track: target, step, pitch });
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function selectPattern(pattern: PatternSlot): void {
    updateProjectView(
      (current) => (current.selectedPattern === pattern ? current : { ...current, selectedPattern: pattern }),
      `Editing Pattern ${pattern}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(0);
  }

  function followAudiblePattern(): void {
    const target = playbackPosition?.pattern ?? null;
    if (!isPlaying || !target) {
      setProjectStatus("No audible Pattern to follow");
      return;
    }
    if (projectRef.current.selectedPattern === target) {
      setProjectStatus(`Already editing audible Pattern ${target}`);
      return;
    }

    selectPattern(target);
    setProjectStatus(`Editing audible Pattern ${target}`);
  }

  function cuePattern(pattern: PatternSlot): void {
    updateProjectView(
      (current) => (current.selectedPattern === pattern ? current : { ...current, selectedPattern: pattern }),
      `Cue Pattern ${pattern}`
    );
    selectTransportLoopScope("pattern", false);
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(0);
  }

  function cuePatternFromCompare(pattern: PatternSlot): void {
    const beforeProject = projectRef.current;
    cuePattern(pattern);
    setPatternCompareResult(createPatternCompareResult("cue", pattern, beforeProject, projectRef.current, selectedArrangementIndex));
  }

  function cueGrooveCompass(): void {
    if (isPlaying) {
      setProjectStatus("Stop playback before cueing Groove Compass");
      return;
    }
    const pattern = projectRef.current.selectedPattern;
    cuePattern(pattern);
    setProjectStatus(`Groove Compass cued Pattern ${pattern} as Pattern loop`);
  }

  function cueStyleGoal(goal: StyleGoalCard): void {
    if (isPlaying) {
      setProjectStatus("Stop playback before cueing Style Goal");
      return;
    }

    setStyleInspectorFocusId(goal.focusId);
    setStyleInspectorResult(null);
    if (goal.id === "arrange") {
      selectTransportLoopScope("arrangement", false);
      setStyleGoalCueResult(createStyleGoalCueResult(goal, projectRef.current));
      setProjectStatus(`Style Goal ${goal.label} cued as Song loop`);
      return;
    }

    const pattern = projectRef.current.selectedPattern;
    cuePattern(pattern);
    setStyleGoalCueResult(createStyleGoalCueResult(goal, projectRef.current));
    setProjectStatus(`Style Goal ${goal.label} cued Pattern ${pattern} as Pattern loop`);
  }

  function updateKeyboardCaptureDefaults(update: Partial<KeyboardCaptureDefaults>): void {
    setKeyboardCaptureDefaults((current) => {
      const targetDefaults = current[keyboardCaptureTarget];
      return {
        ...current,
        [keyboardCaptureTarget]: {
          ...targetDefaults,
          ...update,
          octave:
            update.octave === undefined
              ? targetDefaults.octave
              : clampKeyboardCaptureOctave(keyboardCaptureTarget, update.octave),
          length: update.length === undefined ? targetDefaults.length : clampStepLength(update.length),
          velocity: update.velocity === undefined ? targetDefaults.velocity : clampVelocity(update.velocity)
        }
      };
    });
  }

  function selectTransportLoopScope(scope: TransportLoopScope, showStatus = true): void {
    if (scope === "transition" && !arrangementTransitionLoopTarget) {
      setProjectStatus("Transition loop unavailable");
      return;
    }

    setTransportLoopScope(scope);
    setPlaybackMode(scope === "pattern" ? "pattern" : "arrangement");
    setStyleGoalCueResult(null);
    if (showStatus) {
      setProjectStatus(`${transportLoopLabel(scope)} loop`);
    }
  }

  function usePatternInSelectedBlock(pattern: PatternSlot): void {
    const block = projectRef.current.arrangement[selectedArrangementIndex];
    if (!block) {
      setProjectStatus("Select an arrangement block");
      return;
    }
    const changed = updateArrangementBlock(
      selectedArrangementIndex,
      { pattern },
      `Block ${selectedArrangementIndex + 1} uses Pattern ${pattern}`
    );
    if (changed) {
      selectTransportLoopScope("arrangement", false);
    }
  }

  function usePatternInSelectedBlockFromCompare(pattern: PatternSlot): void {
    const block = projectRef.current.arrangement[selectedArrangementIndex];
    if (!block) {
      usePatternInSelectedBlock(pattern);
      return;
    }
    const beforeProject = projectRef.current;
    usePatternInSelectedBlock(pattern);
    if (beforeProject !== projectRef.current) {
      setPatternCompareResult(createPatternCompareResult("use", pattern, beforeProject, projectRef.current, selectedArrangementIndex));
    }
  }

  function runPatternCompareDecision(action: PatternCompareDecisionSummary["action"], pattern: PatternSlot): void {
    if (action === "use") {
      usePatternInSelectedBlockFromCompare(pattern);
      return;
    }

    cuePatternFromCompare(pattern);
  }

  function copySelectedPattern(target: PatternSlot): void {
    const sourceSlot = projectRef.current.selectedPattern;
    const beforeProject = projectRef.current;
    const changed = updateProject(
      (current) => ({
        ...current,
        selectedPattern: target,
        patterns: {
          ...current.patterns,
          [target]: clonePatternData(current.patterns[current.selectedPattern])
        }
      }),
      `Copied Pattern ${sourceSlot} to ${target}`
    );
    if (changed) {
      setPatternEditResult(createPatternEditResult("copy", sourceSlot, target, beforeProject, projectRef.current));
    }
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(0);
  }

  function cloneSelectedPatternVariation(target: PatternSlot, preset: PatternVariationPreset): void {
    const sourceSlot = projectRef.current.selectedPattern;
    const presetLabel = patternVariationPresetLabel(preset);
    const beforeProject = projectRef.current;
    const changed = updateProject(
      (current) => ({
        ...current,
        selectedPattern: target,
        patterns: {
          ...current.patterns,
          [target]: createPatternVariation(current.patterns[current.selectedPattern], preset)
        }
      }),
      `Cloned Pattern ${sourceSlot} to ${target} as ${presetLabel}`
    );
    if (changed) {
      setPatternCloneResult(createPatternCloneResult(sourceSlot, target, preset, beforeProject, projectRef.current));
    }
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(0);
  }

  function clearSelectedPattern(): void {
    const sourceSlot = projectRef.current.selectedPattern;
    const beforeProject = projectRef.current;
    const changed = updateProject(
      (current) => ({
        ...current,
        patterns: {
          ...current.patterns,
          [current.selectedPattern]: createEmptyPatternData()
        }
      }),
      `Cleared Pattern ${sourceSlot}`
    );
    if (changed) {
      setPatternEditResult(createPatternEditResult("clear", sourceSlot, sourceSlot, beforeProject, projectRef.current));
    }
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyPatternVariation(preset: PatternVariationPreset): void {
    const sourceSlot = projectRef.current.selectedPattern;
    const beforeProject = projectRef.current;
    const changed = updateCurrentPattern(
      (pattern) => createPatternVariation(pattern, preset),
      `${patternVariationPresetLabel(preset)} variation applied to Pattern ${sourceSlot}`
    );
    if (changed) {
      setPatternVariationResult(createPatternVariationResult(preset, beforeProject, projectRef.current));
    } else {
      setPatternVariationResult(null);
    }
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyPatternFill(preset: PatternFillPreset): void {
    const sourceSlot = projectRef.current.selectedPattern;
    const beforeProject = projectRef.current;
    const changed = updateCurrentPattern(
      (pattern) => applyPatternFillPreset(pattern, preset, projectRef.current.key),
      `${patternFillPresetLabel(preset)} applied to Pattern ${sourceSlot}`
    );
    if (changed) {
      setPatternFillResult(createPatternFillResult(preset, beforeProject, projectRef.current));
    } else {
      setPatternFillResult(null);
    }
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function showSelectedEventDeleteResult(result: SelectedEventDeleteResult, preserveNextSelectionChange = true): void {
    selectedEventDeleteSelectionGuardRef.current = preserveNextSelectionChange;
    setSelectedEventDeleteResult(result);
  }

  function createSelectedNoteDeleteResult(
    target: SelectedNote,
    note: BassNote | MelodyNote | undefined,
    patternSlot: PatternSlot
  ): SelectedEventDeleteResult | null {
    if (!note) {
      return null;
    }

    const trackLabel = target.track === "bass" ? "808" : "Synth";
    const articulation = target.track === "bass" ? ((note as BassNote).glide ? "glide" : "no glide") : "melody";

    return {
      kind: "note",
      targetId: `note-delete-${patternSlot}-${target.track}-${target.step}-${target.pitch}`,
      status: "Deleted",
      title: `${trackLabel} ${target.pitch} step ${target.step + 1}`,
      detail: `Pattern ${patternSlot} / length ${note.length} / ${percentLabel(clampVelocity(note.velocity))} velocity`,
      patternLabel: `Pattern ${patternSlot}`,
      metricLabel: "Removed",
      metricValue: `${target.pitch} / ${percentLabel(normalizeEventProbability(note.probability))} chance / ${articulation}`,
      recoveryCue: "Use Undo immediately if this note carried the phrase or low-end anchor.",
      nextCheck: `Loop Pattern ${patternSlot}; confirm the ${trackLabel} gap still supports drums, chords, and melody.`,
      tone: "warn"
    };
  }

  function createSelectedDrumDeleteResult(
    target: SelectedDrumStep,
    patternSlot: PatternSlot,
    velocity: number,
    timing: number,
    probability: number,
    repeat: number
  ): SelectedEventDeleteResult {
    return {
      kind: "drum",
      targetId: `drum-delete-${patternSlot}-${target.lane}-${target.step}`,
      status: "Deleted",
      title: `${drumLabels[target.lane]} step ${target.step + 1}`,
      detail: `Pattern ${patternSlot} / ${percentLabel(velocity)} velocity / ${percentLabel(probability)} chance`,
      patternLabel: `Pattern ${patternSlot}`,
      metricLabel: "Pocket",
      metricValue: `${timingLabel(timing)}${target.lane === "hat" ? ` / x${repeat}` : " / single"}`,
      recoveryCue: "Use Undo immediately if this hit was the groove anchor.",
      nextCheck: `Loop Pattern ${patternSlot}; confirm the pocket still works against 808, chords, and Synth.`,
      tone: "warn"
    };
  }

  function createSelectedChordDeleteResult(
    chord: ChordEvent | undefined,
    index: number,
    patternSlot: PatternSlot
  ): SelectedEventDeleteResult | null {
    if (!chord) {
      return null;
    }

    return {
      kind: "chord",
      targetId: `chord-delete-${patternSlot}-${index}-${chord.step}-${chord.root}-${chord.quality}`,
      status: "Deleted",
      title: `Chord ${chord.root}${chord.quality} step ${chord.step + 1}`,
      detail: `Pattern ${patternSlot} / length ${chord.length} / ${percentLabel(clampVelocity(chord.velocity))} velocity`,
      patternLabel: `Pattern ${patternSlot}`,
      metricLabel: "Harmony",
      metricValue: `${chordInversionLabel(normalizeChordInversion(chord.inversion))} / ${percentLabel(
        normalizeEventProbability(chord.probability)
      )} chance`,
      recoveryCue: "Use Undo immediately if this chord was the progression anchor.",
      nextCheck: `Loop Pattern ${patternSlot}; confirm the harmony still supports 808 and Synth movement.`,
      tone: "warn"
    };
  }

  function deleteSelectedEvent(): void {
    if (deleteSelectedNote()) {
      return;
    }
    if (clearSelectedDrumStep()) {
      return;
    }
    if (deleteSelectedChordEvent()) {
      return;
    }
    setSelectedEventDeleteResult(null);
    setProjectStatus("Select a step, note, or chord to delete");
  }

  function deleteSelectedNote(): boolean {
    if (!selectedNote) {
      return false;
    }

    const target = selectedNote;
    const patternSlot = projectRef.current.selectedPattern;
    const deletedNote = target.track === "bass" ? selectedBassNote : selectedMelodyNote;
    const result = createSelectedNoteDeleteResult(target, deletedNote, patternSlot);
    const changed = updateCurrentPattern(
      (pattern) => {
        if (target.track === "bass") {
          const bassNotes = pattern.bassNotes.filter(
            (note) => note.step !== target.step || note.pitch !== target.pitch
          );
          return bassNotes.length === pattern.bassNotes.length ? pattern : { ...pattern, bassNotes };
        }

        const melodyNotes = pattern.melodyNotes.filter(
          (note) => note.step !== target.step || note.pitch !== target.pitch
        );
        return melodyNotes.length === pattern.melodyNotes.length ? pattern : { ...pattern, melodyNotes };
      },
      `Deleted ${target.track === "bass" ? "808" : "Synth"} ${target.pitch}.${target.step + 1}`
    );

    if (changed) {
      if (result) {
        showSelectedEventDeleteResult(result);
      }
      setSelectedNote(null);
    } else {
      setSelectedEventDeleteResult(null);
    }
    return changed;
  }

  function deleteSelectedChordEvent(): boolean {
    if (selectedChordIndex === null) {
      return false;
    }
    return deleteChordEvent(selectedChordIndex);
  }

  function clearSelectedDrumStep(): boolean {
    if (!selectedDrumStep) {
      return false;
    }

    const target = selectedDrumStep;
    const patternSlot = projectRef.current.selectedPattern;
    const result = createSelectedDrumDeleteResult(
      target,
      patternSlot,
      selectedDrumVelocity ?? defaultDrumVelocity(target.lane, target.step),
      selectedDrumTiming,
      selectedDrumProbability ?? 1,
      selectedHatRepeat
    );
    const changed = updateCurrentPattern(
      (pattern) => {
        if (!pattern.drumPattern[target.lane][target.step]) {
          return pattern;
        }

        return {
          ...pattern,
          drumPattern: {
            ...pattern.drumPattern,
            [target.lane]: pattern.drumPattern[target.lane].map((enabled, index) =>
              index === target.step ? false : enabled
            )
          },
          drumTimings: {
            ...pattern.drumTimings,
            [target.lane]: pattern.drumTimings[target.lane].map((timing, index) =>
              index === target.step ? 0 : timing
            )
          },
          hatRepeats:
            target.lane === "hat"
              ? pattern.hatRepeats.map((repeat, index) => (index === target.step ? 1 : repeat))
              : pattern.hatRepeats
        };
      },
      `Deleted ${drumLabels[target.lane]} step ${target.step + 1}`
    );

    if (changed) {
      showSelectedEventDeleteResult(result);
      setSelectedDrumStep(null);
    } else {
      setSelectedEventDeleteResult(null);
    }
    return changed;
  }

  function selectArrangementBlock(index: number): void {
    const block = project.arrangement[index];
    if (!block) {
      return;
    }

    setSelectedArrangementIndex(index);
    setSectionCueResult(null);
    setArrangementFocusResult(null);
    updateProjectView((current) => ({ ...current, selectedPattern: block.pattern }), `Arranging ${block.section}`);
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function followAudibleArrangementBlock(): void {
    const targetIndex =
      isPlaying && playbackPosition?.mode === "arrangement" && typeof playbackPosition.arrangementIndex === "number"
        ? playbackPosition.arrangementIndex
        : null;
    if (targetIndex === null) {
      setProjectStatus("No audible arrangement block to follow");
      return;
    }
    const targetBlock = projectRef.current.arrangement[targetIndex];
    if (!targetBlock) {
      setProjectStatus("No audible arrangement block to follow");
      return;
    }
    if (targetIndex === selectedArrangementIndex) {
      setProjectStatus(`Already editing audible Block ${targetIndex + 1}`);
      return;
    }

    selectArrangementBlock(targetIndex);
    setProjectStatus(`Editing audible Block ${targetIndex + 1} ${targetBlock.section}`);
  }

  function cueArrangementBlock(index: number): void {
    if (isPlaying) {
      setProjectStatus("Stop playback before cueing a block");
      return;
    }

    const block = projectRef.current.arrangement[index];
    if (!block) {
      setProjectStatus("Arrangement block not found");
      return;
    }

    selectArrangementBlock(index);
    selectTransportLoopScope("block", false);
    setSectionCueResult(createSectionCueResult(projectRef.current, index, "arrangement-block"));
    setProjectStatus(`Block ${index + 1} ${block.section} cued as Block loop`);
  }

  function cueArrangementTransition(transition: ArrangementTransitionMapTransition): void {
    if (isPlaying) {
      setProjectStatus("Stop playback before cueing a transition");
      return;
    }

    const fromBlock = projectRef.current.arrangement[transition.fromIndex];
    const toBlock = projectRef.current.arrangement[transition.toIndex];
    if (!fromBlock || !toBlock) {
      setProjectStatus("Transition loop unavailable");
      return;
    }

    selectArrangementBlock(transition.fromIndex);
    setArrangementTransitionMapFocusId(transition.id);
    setArrangementMuteMapResult(null);
    setArrangementTransitionMapResult(null);
    setSectionCueResult(null);
    setTransportLoopScope("transition");
    setPlaybackMode("arrangement");
    setProjectStatus(`Transition ${transition.fromIndex + 1}->${transition.toIndex + 1} cued as Transition loop`);
  }

  function cueHookLoop(card?: HookReadinessFocusItem): void {
    if (isPlaying) {
      setProjectStatus("Stop playback before cueing the hook");
      return;
    }

    setHookReadinessResult(null);
    const target = createHookLoopCueTarget(projectRef.current);
    if (card) {
      setHookReadinessFocusId(card.focusId);
    }
    if (!target) {
      setProjectStatus("Hook section not in arrangement");
      return;
    }

    selectArrangementBlock(target.index);
    selectTransportLoopScope("block", false);
    setProjectStatus(`Hook Block ${target.index + 1} cued as Hook loop`);
  }

  function applyHookFix(card?: HookReadinessCard): void {
    const beforeProject = projectRef.current;
    const beforeAnalysis = analyzeExport(beforeProject);
    const beforeStemAnalyses = analyzeStemExports(beforeProject);
    const beforeSummary = createHookReadinessSummary(
      beforeProject,
      createBeatReadinessChecks(beforeProject, beforeAnalysis),
      beforeAnalysis,
      beforeStemAnalyses
    );
    const targetCard = card ?? activeHookReadinessQuickActionCard(beforeSummary);

    if (!targetCard) {
      setHookFixResult(null);
      setHookReadinessResult(null);
      setProjectStatus("Hook Readiness has no fix target");
      return;
    }

    const fix = createHookFixOption(targetCard);
    const cueTarget = createHookLoopCueTarget(beforeProject);
    setHookReadinessFocusId(targetCard.focusId);
    setHookReadinessResult(null);

    if (cueTarget && (fix.action.kind === "patternVariation" || fix.action.kind === "arrangementMove")) {
      selectArrangementBlock(cueTarget.index);
    }

    switch (fix.action.kind) {
      case "patternChain":
        applyPatternChain(fix.action.chain);
        break;
      case "patternVariation":
        setPatternVariationPreviewPreset(fix.action.preset);
        applyPatternVariation(fix.action.preset);
        break;
      case "arrangementMove": {
        const moveIndex = cueTarget?.index ?? selectedArrangementIndex;
        const block = projectRef.current.arrangement[moveIndex];
        if (!block) {
          setProjectStatus("Select an arrangement block");
          break;
        }
        const nextBlock = applyArrangementMovePreset(block, fix.action.preset);
        updateArrangementBlock(
          moveIndex,
          {
            energy: nextBlock.energy,
            mutedTracks: nextBlock.mutedTracks
          },
          `Applied ${arrangementMovePresetLabel(fix.action.preset)} move`
        );
        break;
      }
      case "mixFix":
        applyMixFixPreset(fix.action.preset);
        break;
      case "sessionBriefStarter":
        applySessionBriefStarterPad(fix.action.pad);
        break;
    }

    setHookFixResult(createHookFixResult(fix, targetCard.id, beforeProject, projectRef.current));
  }

  function cueToplineLoop(card?: ToplineSpaceFocusItem): void {
    if (isPlaying) {
      setProjectStatus("Stop playback before cueing topline space");
      return;
    }

    const target = createToplineLoopCueTarget(projectRef.current);
    if (card) {
      setToplineSpaceFocusId(card.focusId);
    }
    setToplineSpaceResult(null);

    if (target.mode === "block") {
      selectArrangementBlock(target.index);
      selectTransportLoopScope("block", false);
      setProjectStatus(`Topline Hook Block ${target.index + 1} cued as Topline loop`);
      return;
    }

    cuePattern(target.pattern);
    setProjectStatus(`Pattern ${target.pattern} cued as Topline loop`);
  }

  function applyToplineFix(card?: ToplineSpaceCard): void {
    const beforeProject = projectRef.current;
    const beforeAnalysis = analyzeExport(beforeProject);
    const beforeStemAnalyses = analyzeStemExports(beforeProject);
    const beforeSummary = createToplineSpaceSummary(
      beforeProject,
      createBeatReadinessChecks(beforeProject, beforeAnalysis),
      beforeAnalysis,
      beforeStemAnalyses
    );
    const targetCard = card ?? activeToplineSpaceQuickActionCard(beforeSummary);

    if (!targetCard) {
      setToplineSpaceResult(null);
      setToplineFixResult(null);
      setProjectStatus("Topline Space has no fix target");
      return;
    }

    const fix = createToplineFixOption(targetCard);
    const cueTarget = createToplineLoopCueTarget(beforeProject);
    setToplineSpaceFocusId(targetCard.focusId);
    setToplineSpaceResult(null);

    if (cueTarget.mode === "block") {
      selectArrangementBlock(cueTarget.index);
    }

    switch (fix.action.kind) {
      case "grooveFeel":
        applyGrooveFeel(fix.action.feel);
        break;
      case "patternFill":
        setPatternFillPreviewPreset(fix.action.preset);
        applyPatternFill(fix.action.preset);
        break;
      case "patternChain":
        applyPatternChain(fix.action.chain);
        break;
      case "mixFix":
        applyMixFixPreset(fix.action.preset);
        break;
      case "sessionBriefStarter":
        applySessionBriefStarterPad(fix.action.pad);
        break;
    }

    setToplineFixResult(createToplineFixResult(fix, targetCard.id, beforeProject, projectRef.current));
  }

  function cueSectionLocator(section: ArrangementSection): void {
    if (isPlaying) {
      setProjectStatus("Stop playback before cueing a section");
      return;
    }

    const index = firstArrangementSectionIndex(projectRef.current, section);
    if (index === null) {
      setProjectStatus(`${section} section not in arrangement`);
      return;
    }

    selectArrangementBlock(index);
    selectTransportLoopScope("block", false);
    setSectionCueResult(createSectionCueResult(projectRef.current, index, "section-locator"));
    setProjectStatus(`${section} section cued as Block loop`);
  }

  function updateArrangementBlock(index: number, update: Partial<ArrangementBlock>, status = "Unsaved changes"): boolean {
    const changed = updateProject((current) => {
      const block = current.arrangement[index];
      if (!block) {
        return current;
      }
      const nextBlock: ArrangementBlock = {
        ...block,
        ...update,
        energy: update.energy === undefined ? block.energy : normalizeArrangementEnergy(update.energy),
        bars: update.bars === undefined ? block.bars : normalizeArrangementBars(update.bars),
        mutedTracks:
          update.mutedTracks === undefined
            ? block.mutedTracks
            : normalizeArrangementMutedTracks(update.mutedTracks)
      };
      return {
        ...current,
        selectedPattern: nextBlock.pattern,
        arrangement: current.arrangement.map((candidate, candidateIndex) => (candidateIndex === index ? nextBlock : candidate))
      };
    }, status);
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
    return changed;
  }

  function cyclePatternChainStep(index: number): void {
    const block = projectRef.current.arrangement[index];
    if (!block) {
      setProjectStatus("Chain step not found");
      return;
    }
    const nextPattern = nextPatternSlot(block.pattern);
    const changed = updateArrangementBlock(index, { pattern: nextPattern }, `Step ${index + 1} Pattern ${nextPattern}`);
    if (changed) {
      setSelectedArrangementIndex(index);
    }
  }

  function applyArrangementMoveToSelected(preset: ArrangementMovePreset): void {
    const beforeProject = projectRef.current;
    const blockIndex = selectedArrangementIndex;
    const block = projectRef.current.arrangement[selectedArrangementIndex];
    if (!block) {
      setArrangementMoveResult(null);
      setProjectStatus("Select an arrangement block");
      return;
    }
    const nextBlock = applyArrangementMovePreset(block, preset);
    const changed = updateArrangementBlock(
      blockIndex,
      {
        energy: nextBlock.energy,
        mutedTracks: nextBlock.mutedTracks
      },
      `Applied ${arrangementMovePresetLabel(preset)} move`
    );
    setArrangementMoveResult(createArrangementMoveResult(preset, blockIndex, beforeProject, projectRef.current));
    if (!changed) {
      setProjectStatus(`${arrangementMovePresetLabel(preset)} move already aligned`);
    }
  }

  function applyArrangementFocusPreset(presetId: ArrangementFocusPresetId): void {
    const preset = arrangementFocusPresets.find((candidate) => candidate.id === presetId);
    const beforeProject = projectRef.current;
    const blockIndex = selectedArrangementIndex;
    const block = beforeProject.arrangement[blockIndex];
    if (!preset || !block) {
      setArrangementFocusResult(null);
      setProjectStatus("Select an arrangement block");
      return;
    }

    const changed = updateArrangementBlock(
      blockIndex,
      {
        section: preset.section,
        pattern: preset.pattern,
        bars: preset.bars,
        energy: preset.energy,
        mutedTracks: [...preset.mutedTracks]
      },
      `Applied ${preset.label} focus`
    );
    if (changed) {
      selectTransportLoopScope("block", false);
      setArrangementFocusResult(createArrangementFocusResult(preset, blockIndex, beforeProject, projectRef.current));
    } else {
      setArrangementFocusResult(null);
    }
  }

  function applyArrangementArcPad(padId: ArrangementArcPadId): void {
    const pad = arrangementArcPadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setArrangementArcResult(null);
      setProjectStatus("Arrangement arc pad not found");
      return;
    }

    const beforeProject = projectRef.current;
    const changed = updateProject(
      (current) => applyArrangementArcPadToProject(current, pad, selectedArrangementIndex),
      `Applied ${pad.label} arc`
    );
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      selectTransportLoopScope("arrangement", false);
      setArrangementArcResult(createArrangementArcResult(pad, beforeProject, projectRef.current));
    } else {
      setArrangementArcResult(null);
      setProjectStatus(`${pad.label} arc already selected`);
    }
  }

  function toggleArrangementTrackMute(track: ArrangementMuteTrack): void {
    const block = projectRef.current.arrangement[selectedArrangementIndex];
    if (!block) {
      return;
    }
    const mutedTracks = block.mutedTracks.includes(track)
      ? block.mutedTracks.filter((mutedTrack) => mutedTrack !== track)
      : [...block.mutedTracks, track];
    updateArrangementBlock(selectedArrangementIndex, { mutedTracks });
  }

  function applyArrangementTemplate(template: ArrangementTemplateId): void {
    const beforeProject = projectRef.current;
    const arrangement = createArrangementTemplate(template);
    const firstBlock = arrangement[0];
    const changed = updateProject(
      (current) => ({
        ...current,
        selectedPattern: firstBlock.pattern,
        arrangement
      }),
      `Applied ${arrangementTemplateLabel(template)} arrangement`
    );
    if (changed) {
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setArrangementTemplateResult(
        createArrangementTemplateResult(template, arrangementTemplateLabel(template), beforeProject.arrangement, projectRef.current.arrangement)
      );
    } else {
      setArrangementTemplateResult(null);
      setProjectStatus(`${arrangementTemplateLabel(template)} arrangement already selected`);
    }
  }

  function applyPatternChain(chain: PatternChainId): void {
    const beforeProject = projectRef.current;
    const arrangement = createPatternChain(chain);
    const firstBlock = arrangement[0];
    const changed = updateProject(
      (current) => ({
        ...current,
        selectedPattern: firstBlock.pattern,
        arrangement
      }),
      `Applied ${patternChainLabel(chain)}`
    );
    if (changed) {
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setPatternChainResult(
        createPatternChainResult(chain, patternChainLabel(chain), beforeProject.arrangement, projectRef.current.arrangement)
      );
    } else {
      setPatternChainResult(null);
    }
  }

  function expandPatternChain(): void {
    const beforeProject = projectRef.current;
    const arrangement = expandPatternChainArrangement(projectRef.current.arrangement);
    const firstBlock = arrangement[0];
    const changed = updateProject(
      (current) => ({
        ...current,
        selectedPattern: firstBlock.pattern,
        arrangement
      }),
      "Expanded chain to song form"
    );
    if (changed) {
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setPatternChainResult(createPatternChainResult("expand", "Chain Expand", beforeProject.arrangement, projectRef.current.arrangement));
    } else {
      setPatternChainResult(null);
    }
  }

  function runPatternChainPriorityAction(actionId: PatternChainPrioritySummary["actionId"]): void {
    if (actionId === "aligned") {
      return;
    }
    if (actionId === "expand") {
      expandPatternChain();
      return;
    }
    applyPatternChain(actionId);
  }

  function updateMixerChannel(id: MixerChannel["id"], update: Partial<MixerChannel>): void {
    const nextUpdate: Partial<MixerChannel> = { ...update };
    if (update.lowCut !== undefined) {
      nextUpdate.lowCut = normalizeMixerEq(update.lowCut);
    }
    if (update.air !== undefined) {
      nextUpdate.air = normalizeMixerEq(update.air);
    }
    if (update.drive !== undefined) {
      nextUpdate.drive = normalizeMixerEq(update.drive);
    }
    if (update.glue !== undefined) {
      nextUpdate.glue = normalizeMixerEq(update.glue);
    }
    if (update.send !== undefined) {
      nextUpdate.send = normalizeMixerEq(update.send);
    }
    updateProject((current) => ({
      ...current,
      mixer: current.mixer.map((track) => (track.id === id ? { ...track, ...nextUpdate } : track))
    }));
  }

  function applyMasterPreset(preset: MasterPreset): void {
    updateProject((current) => ({
      ...current,
      masterPreset: preset,
      masterCeilingDb: masterPresetCeilingDb(preset)
    }));
  }

  function applyMasterFinishPad(padId: MasterFinishPadId, options: { showResult?: boolean } = {}): void {
    const pad = masterFinishPadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setMasterFinishResult(null);
      setMasterAutomationResult(null);
      setMixCoachResult(null);
      setProjectStatus("Master finish pad not found");
      return;
    }

    const beforeProject = projectRef.current;
    const changed = updateProject((current) => applyMasterFinishPadToProject(current, pad), `${pad.label} master finish applied`);
    if (!changed) {
      setMasterFinishResult(null);
      setMasterAutomationResult(null);
      setMixCoachResult(null);
      setProjectStatus(`${pad.label} master finish already selected`);
      return;
    }

    if (options.showResult) {
      setMasterFinishResult(createMasterFinishResult(pad, beforeProject, projectRef.current));
    }
  }

  function applyMasterAutomationPad(padId: MasterAutomationPadId): void {
    const pad = masterAutomationPadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setMasterAutomationResult(null);
      setMixCoachResult(null);
      setProjectStatus("Master automation pad not found");
      return;
    }

    const beforeProject = projectRef.current;
    const changed = updateProject((current) => applyMasterAutomationPreset(current, pad.id), `${pad.label} master automation applied`);
    if (!changed) {
      setMasterAutomationResult(null);
      setMixCoachResult(null);
      setProjectStatus(`${pad.label} master automation already selected`);
      return;
    }

    setMasterAutomationResult(createMasterAutomationResult(pad, beforeProject, projectRef.current));
  }

  function applyMixFixPreset(preset: MixFixPreset): void {
    const beforeProject = projectRef.current;
    const beforeAnalysis = analyzeExport(beforeProject);
    const beforeStemAnalyses = analyzeStemExports(beforeProject);
    const changed = updateProject(
      (current) => applyMixFixToProject(current, preset, beforeStemAnalyses),
      `Applied ${mixFixPresetLabel(preset)} mix fix`
    );
    if (!changed) {
      setMixFixResult(null);
      setMixCoachResult(null);
      setProjectStatus(`${mixFixPresetLabel(preset)} mix fix already selected`);
      return;
    }

    const afterProject = projectRef.current;
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    setMixFixResult(
      createMixFixResult(
        preset,
        beforeProject,
        afterProject,
        beforeAnalysis,
        analyzeExport(afterProject),
        beforeStemAnalyses,
        analyzeStemExports(afterProject)
      )
    );
  }

  function applyStemAuditionPad(padId: StemAuditionPadId): void {
    const pad = stemAuditionPadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setProjectStatus("Stem audition pad not found");
      return;
    }

    const changed = updateProject((current) => {
      const mixer = applyStemAuditionPadToMixer(current.mixer, pad);
      return sameMixerChannels(current.mixer, mixer) ? current : { ...current, mixer };
    }, `${pad.label} stem audition`);

    if (!changed) {
      setProjectStatus(`${pad.label} stem audition already selected`);
    }
  }

  function captureMixSnapshot(slot: MixSnapshotSlotId): void {
    const snapshot = createMixSnapshot(slot, projectRef.current, exportAnalysis, stemAnalyses);
    setMixSnapshots((current) => ({ ...current, [slot]: snapshot }));
    setProjectStatus(`Captured Mix Snapshot ${slot}: ${snapshot.statusLabel}`);
  }

  function recallMixSnapshot(slot: MixSnapshotSlotId): void {
    const snapshot = mixSnapshots[slot];
    if (!snapshot) {
      setProjectStatus(`Mix Snapshot ${slot} is empty`);
      return;
    }

    const changed = updateProject((current) => {
      const mixer = cloneMixerChannels(snapshot.mixer);
      const sameMaster =
        current.masterPreset === snapshot.masterPreset && current.masterCeilingDb === snapshot.masterCeilingDb;
      return sameMaster && sameMixerChannels(current.mixer, mixer)
        ? current
        : {
            ...current,
            mixer,
            masterPreset: snapshot.masterPreset,
            masterCeilingDb: snapshot.masterCeilingDb
          };
    }, `Recalled Mix Snapshot ${slot}`);

    if (!changed) {
      setProjectStatus(`Mix Snapshot ${slot} already matches current mix`);
      return;
    }

    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    setProjectStatus(`Recalled Mix Snapshot ${slot}: ${snapshot.statusLabel}`);
  }

  function clearMixSnapshots(): void {
    if (!mixSnapshots.A && !mixSnapshots.B) {
      setProjectStatus("Mix Snapshot A/B already clear");
      return;
    }
    setMixSnapshots({ A: null, B: null });
    setProjectStatus("Cleared Mix Snapshot A/B");
  }

  function applyMixBalancePad(padId: MixBalancePadId): void {
    const pad = mixBalancePadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setMixBalanceResult(null);
      setMixCoachResult(null);
      setProjectStatus("Mix balance pad not found");
      return;
    }

    const beforeMixer = projectRef.current.mixer;
    const changed = updateProject((current) => {
      const mixer = applyMixBalancePadToMixer(current.mixer, pad);
      return sameMixerChannels(current.mixer, mixer) ? current : { ...current, mixer };
    }, `${pad.label} mix balance applied`);

    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setMixBalanceResult(createMixBalanceResult(pad, beforeMixer, projectRef.current.mixer));
    } else {
      setMixBalanceResult(null);
      setMixCoachResult(null);
      setProjectStatus(`${pad.label} mix balance already selected`);
    }
  }

  function applySpaceFxPad(padId: SpaceFxPadId): void {
    const pad = spaceFxPadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setSpaceFxResult(null);
      setProjectStatus("Space FX pad not found");
      return;
    }

    const beforeMixer = projectRef.current.mixer;
    const changed = updateProject((current) => {
      const mixer = applySpaceFxPadToMixer(current.mixer, pad);
      return sameMixerChannels(current.mixer, mixer) ? current : { ...current, mixer };
    }, `${pad.label} space FX applied`);

    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setSpaceFxResult(createSpaceFxResult(pad, beforeMixer, projectRef.current.mixer));
    } else {
      setSpaceFxResult(null);
      setProjectStatus(`${pad.label} space FX already selected`);
    }
  }

  function previewSoundPreset(preset: SoundPresetTarget): void {
    setSoundPresetPreviewId(preset);
    setSoundPresetResult(null);
    setProjectStatus(`${soundPresetLabel(preset)} sound preset preview`);
  }

  function applySoundPreset(preset: SoundPresetTarget = soundPresetPreviewId): void {
    const beforeSound = projectRef.current.sound;
    const targetSound = soundPresetDesign(preset);
    const changed = updateProject(
      (current) => (sameSoundDesign(current.sound, targetSound) ? current : { ...current, sound: targetSound }),
      `${soundPresetLabel(preset)} sound preset applied`
    );

    setSoundPresetPreviewId(preset);
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setSoundPresetResult(createSoundPresetResult(preset, beforeSound, projectRef.current.sound));
    } else {
      setSoundPresetResult(null);
      setProjectStatus(`${soundPresetLabel(preset)} sound preset already selected`);
    }
  }

  function applySoundFocusPad(padId: SoundFocusPadId): void {
    const pad = soundFocusPadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setSoundFocusResult(null);
      setProjectStatus("Sound focus pad not found");
      return;
    }

    const beforeSound = projectRef.current.sound;
    const changed = updateProject((current) => {
      const sound = applySoundFocusPadToSound(current.sound, pad);
      return sameSoundDesign(current.sound, sound) ? current : { ...current, sound };
    }, `${pad.label} sound focus applied`);

    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setSoundFocusResult(createSoundFocusResult(pad, beforeSound, projectRef.current.sound));
    } else {
      setSoundFocusResult(null);
      setProjectStatus(`${pad.label} sound focus already selected`);
    }
  }

  function applyDrumKitPad(padId: DrumKitPadId): void {
    const pad = drumKitPadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setDrumKitResult(null);
      setProjectStatus("Drum kit pad not found");
      return;
    }

    const beforeProject = projectRef.current;
    const changed = updateProject((current) => applyDrumKitPadToProject(current, pad), `${pad.label} drum kit applied`);
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setDrumKitResult(createDrumKitResult(pad, beforeProject, projectRef.current));
    } else {
      setDrumKitResult(null);
      setProjectStatus(`${pad.label} drum kit already selected`);
    }
  }

  function updateSoundDesign(update: Partial<Omit<SoundDesign, "preset">>): void {
    updateProject((current) => ({
      ...current,
      sound: {
        ...current.sound,
        ...Object.fromEntries(Object.entries(update).map(([key, value]) => [key, clampUnit(value)])),
        preset: "custom"
      }
    }));
  }

  function captureSoundSnapshot(slot: SoundSnapshotSlotId): void {
    const snapshot = createSoundSnapshot(slot, projectRef.current.sound);
    setSoundSnapshots((current) => ({ ...current, [slot]: snapshot }));
    setProjectStatus(`Captured Sound Snapshot ${slot}: ${snapshot.statusLabel}`);
  }

  function recallSoundSnapshot(slot: SoundSnapshotSlotId): void {
    const snapshot = soundSnapshots[slot];
    if (!snapshot) {
      setProjectStatus(`Sound Snapshot ${slot} is empty`);
      return;
    }

    const changed = updateProject(
      (current) => (sameSoundDesign(current.sound, snapshot.sound) ? current : { ...current, sound: cloneSoundDesign(snapshot.sound) }),
      `Recalled Sound Snapshot ${slot}`
    );

    if (!changed) {
      setProjectStatus(`Sound Snapshot ${slot} already matches current sound`);
      return;
    }

    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    setSoundPresetResult(null);
    setSoundFocusResult(null);
    setDrumKitResult(null);
    setSoundPresetPreviewId(snapshot.sound.preset === "custom" ? defaultSoundPresetPreview(projectRef.current) : snapshot.sound.preset);
    setProjectStatus(`Recalled Sound Snapshot ${slot}: ${snapshot.statusLabel}`);
  }

  function clearSoundSnapshots(): void {
    if (!soundSnapshots.A && !soundSnapshots.B) {
      setProjectStatus("Sound Snapshot A/B already clear");
      return;
    }
    setSoundSnapshots({ A: null, B: null });
    setProjectStatus("Cleared Sound Snapshot A/B");
  }

  function duplicateArrangementBlock(): void {
    const beforeProject = projectRef.current;
    const beforeIndex = selectedArrangementIndex;
    const afterIndex = Math.min(beforeIndex + 1, beforeProject.arrangement.length);
    const changed = updateProject((current) => {
      const source = current.arrangement[selectedArrangementIndex] ?? current.arrangement[0];
      if (!source) {
        return current;
      }
      const nextIndex = Math.min(selectedArrangementIndex + 1, current.arrangement.length);
      setSelectedArrangementIndex(nextIndex);
      return {
        ...current,
        selectedPattern: source.pattern,
        arrangement: [
          ...current.arrangement.slice(0, nextIndex),
          { ...source, mutedTracks: [...source.mutedTracks] },
          ...current.arrangement.slice(nextIndex)
        ]
      };
    }, "Duplicated arrangement block");
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setSelectedBlockEditResult(createSelectedBlockEditResult("duplicate", beforeProject, projectRef.current, beforeIndex, afterIndex));
    } else {
      setSelectedBlockEditResult(null);
    }
  }

  function copySelectedArrangementBlock(): void {
    const source = projectRef.current.arrangement[selectedArrangementIndex];
    if (!source) {
      setSelectedBlockEditResult(null);
      setProjectStatus("Select an arrangement block");
      return;
    }

    setArrangementBlockClipboard({
      ...source,
      mutedTracks: [...source.mutedTracks]
    });
    setSelectedBlockEditResult(
      createSelectedBlockEditResult("copy", projectRef.current, projectRef.current, selectedArrangementIndex, selectedArrangementIndex)
    );
    setProjectStatus(`Copied ${source.section} Pattern ${source.pattern} block`);
  }

  function pasteArrangementBlockAfterSelected(): void {
    const clipboard = arrangementBlockClipboard;
    if (!clipboard) {
      setSelectedBlockEditResult(null);
      setProjectStatus("Copy an arrangement block first");
      return;
    }

    const beforeProject = projectRef.current;
    const beforeIndex = selectedArrangementIndex;
    const afterIndex = Math.min(beforeIndex + 1, beforeProject.arrangement.length);
    const changed = updateProject((current) => {
      const selectedBlock = current.arrangement[selectedArrangementIndex];
      if (!selectedBlock) {
        return current;
      }
      const nextIndex = Math.min(selectedArrangementIndex + 1, current.arrangement.length);
      const pastedBlock: ArrangementBlock = {
        ...clipboard,
        bars: normalizeArrangementBars(clipboard.bars),
        energy: normalizeArrangementEnergy(clipboard.energy),
        mutedTracks: normalizeArrangementMutedTracks(clipboard.mutedTracks)
      };
      setSelectedArrangementIndex(nextIndex);
      setSplitAfterBars(clampSplitAfterBars(1, pastedBlock.bars));
      return {
        ...current,
        selectedPattern: pastedBlock.pattern,
        arrangement: [
          ...current.arrangement.slice(0, nextIndex),
          pastedBlock,
          ...current.arrangement.slice(nextIndex)
        ]
      };
    }, "Pasted arrangement block");
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setSelectedBlockEditResult(createSelectedBlockEditResult("paste", beforeProject, projectRef.current, beforeIndex, afterIndex));
    } else {
      setSelectedBlockEditResult(null);
      setProjectStatus("Select an arrangement block");
    }
  }

  function splitArrangementBlock(): void {
    const beforeProject = projectRef.current;
    const beforeIndex = selectedArrangementIndex;
    const afterIndex = Math.min(beforeIndex + 1, beforeProject.arrangement.length);
    const changed = updateProject((current) => {
      const block = current.arrangement[selectedArrangementIndex];
      if (!block) {
        return current;
      }
      const blockBars = normalizeArrangementBars(block.bars);
      if (blockBars <= 1) {
        return current;
      }
      const firstBars = clampSplitAfterBars(splitAfterBars, blockBars);
      const secondBars = blockBars - firstBars;
      if (secondBars < 1) {
        return current;
      }
      const firstBlock: ArrangementBlock = {
        ...block,
        bars: firstBars,
        mutedTracks: [...block.mutedTracks]
      };
      const secondBlock: ArrangementBlock = {
        ...block,
        bars: secondBars,
        mutedTracks: [...block.mutedTracks]
      };
      const nextIndex = selectedArrangementIndex + 1;
      setSelectedArrangementIndex(nextIndex);
      setSplitAfterBars(clampSplitAfterBars(1, secondBars));
      return {
        ...current,
        selectedPattern: secondBlock.pattern,
        arrangement: [
          ...current.arrangement.slice(0, selectedArrangementIndex),
          firstBlock,
          secondBlock,
          ...current.arrangement.slice(selectedArrangementIndex + 1)
        ]
      };
    }, "Split arrangement block");
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    if (!changed) {
      setSelectedBlockEditResult(null);
      setProjectStatus("Block needs 2+ bars to split");
    } else {
      setSelectedBlockEditResult(createSelectedBlockEditResult("split", beforeProject, projectRef.current, beforeIndex, afterIndex));
    }
  }

  function mergeArrangementBlock(): void {
    const beforeProject = projectRef.current;
    const beforeIndex = selectedArrangementIndex;
    const changed = updateProject((current) => {
      const block = current.arrangement[selectedArrangementIndex];
      const nextBlock = current.arrangement[selectedArrangementIndex + 1];
      if (!block || !nextBlock) {
        return current;
      }
      const mergedBars = normalizeArrangementBars(block.bars) + normalizeArrangementBars(nextBlock.bars);
      if (mergedBars > maxArrangementBars) {
        return current;
      }
      const mergedBlock: ArrangementBlock = {
        ...block,
        bars: mergedBars,
        mutedTracks: [...block.mutedTracks]
      };
      setSelectedArrangementIndex(selectedArrangementIndex);
      setSplitAfterBars(clampSplitAfterBars(1, mergedBars));
      return {
        ...current,
        selectedPattern: mergedBlock.pattern,
        arrangement: [
          ...current.arrangement.slice(0, selectedArrangementIndex),
          mergedBlock,
          ...current.arrangement.slice(selectedArrangementIndex + 2)
        ]
      };
    }, "Merged arrangement blocks");
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    if (!changed) {
      setSelectedBlockEditResult(null);
      setProjectStatus("Merge needs a next block within 16 bars");
    } else {
      setSelectedBlockEditResult(createSelectedBlockEditResult("merge", beforeProject, projectRef.current, beforeIndex, beforeIndex));
    }
  }

  function moveArrangementBlock(direction: -1 | 1): void {
    const beforeProject = projectRef.current;
    const beforeIndex = selectedArrangementIndex;
    const afterIndex = beforeIndex + direction;
    const changed = updateProject((current) => {
      const fromIndex = selectedArrangementIndex;
      const toIndex = fromIndex + direction;
      const movingBlock = current.arrangement[fromIndex];
      if (!movingBlock || toIndex < 0 || toIndex >= current.arrangement.length) {
        return current;
      }

      const arrangement = [...current.arrangement];
      arrangement.splice(fromIndex, 1);
      arrangement.splice(toIndex, 0, movingBlock);
      setSelectedArrangementIndex(toIndex);
      return {
        ...current,
        selectedPattern: movingBlock.pattern,
        arrangement
      };
    }, direction < 0 ? "Moved block left" : "Moved block right");
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setSelectedBlockEditResult(
        createSelectedBlockEditResult(direction < 0 ? "move_left" : "move_right", beforeProject, projectRef.current, beforeIndex, afterIndex)
      );
    } else {
      setSelectedBlockEditResult(null);
    }
  }

  function deleteArrangementBlock(): void {
    const beforeProject = projectRef.current;
    const beforeIndex = selectedArrangementIndex;
    const afterIndex = Math.min(beforeIndex, Math.max(0, beforeProject.arrangement.length - 2));
    const changed = updateProject((current) => {
      if (current.arrangement.length <= 1) {
        return current;
      }

      const arrangement = current.arrangement.filter((_, index) => index !== selectedArrangementIndex);
      const nextIndex = Math.min(selectedArrangementIndex, arrangement.length - 1);
      const nextBlock = arrangement[nextIndex];
      setSelectedArrangementIndex(nextIndex);
      return {
        ...current,
        selectedPattern: nextBlock.pattern,
        arrangement
      };
    }, "Deleted arrangement block");
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    if (!changed) {
      setSelectedBlockEditResult(null);
      setProjectStatus("Arrangement needs one block");
    } else {
      setSelectedBlockEditResult(createSelectedBlockEditResult("delete", beforeProject, projectRef.current, beforeIndex, afterIndex));
    }
  }

  function runSelectedBlockEditPriorityAction(actionId: SelectedBlockEditPrioritySummary["actionId"]): void {
    switch (actionId) {
      case "copy":
        copySelectedArrangementBlock();
        break;
      case "paste":
        pasteArrangementBlockAfterSelected();
        break;
      case "duplicate":
        duplicateArrangementBlock();
        break;
      case "split":
        splitArrangementBlock();
        break;
      case "merge":
        mergeArrangementBlock();
        break;
      case "move_left":
        moveArrangementBlock(-1);
        break;
      case "move_right":
        moveArrangementBlock(1);
        break;
      case "delete":
        deleteArrangementBlock();
        break;
      case "none":
        setSelectedBlockEditResult(null);
        setProjectStatus("Select an arrangement block before running the priority edit");
        break;
    }
  }

  function toggleStep(lane: DrumLane, step: number): void {
    const selectedSameStep = selectedDrumStep?.lane === lane && selectedDrumStep.step === step;
    const active = currentPattern.drumPattern[lane][step];
    setSelectedDrumStep({ lane, step });
    setSelectedNote(null);
    setSelectedChordIndex(null);
    if (active && !selectedSameStep) {
      return;
    }

    updateCurrentPattern((pattern) => {
      const nextActive = active ? false : true;
      return {
        ...pattern,
        drumPattern: {
          ...pattern.drumPattern,
          [lane]: pattern.drumPattern[lane].map((enabled, index) => (index === step ? nextActive : enabled))
        },
        drumVelocities: {
          ...pattern.drumVelocities,
          [lane]: pattern.drumVelocities[lane].map((velocity, index) =>
            index === step && nextActive ? normalizeDrumVelocity(velocity || defaultDrumVelocity(lane, step)) : velocity
          )
        },
        drumTimings: {
          ...pattern.drumTimings,
          [lane]: pattern.drumTimings[lane].map((timing, index) =>
            index === step ? (nextActive ? normalizeDrumTimingMs(timing) : 0) : timing
          )
        },
        drumProbabilities: {
          ...pattern.drumProbabilities,
          [lane]: pattern.drumProbabilities[lane].map((probability, index) =>
            index === step && nextActive ? normalizeDrumProbability(probability) : probability
          )
        },
        hatRepeats:
          lane === "hat"
            ? pattern.hatRepeats.map((repeat, index) => (index === step && !nextActive ? 1 : repeat))
            : pattern.hatRepeats
      };
    });
  }

  function updateSelectedDrumVelocity(velocity: number): void {
    if (!selectedDrumStep || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      drumVelocities: {
        ...pattern.drumVelocities,
        [selectedDrumStep.lane]: pattern.drumVelocities[selectedDrumStep.lane].map((currentVelocity, index) =>
          index === selectedDrumStep.step ? normalizeDrumVelocity(velocity) : currentVelocity
        )
      }
    }));
  }

  function updateSelectedDrumProbability(probability: number): void {
    if (!selectedDrumStep || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      drumProbabilities: {
        ...pattern.drumProbabilities,
        [selectedDrumStep.lane]: pattern.drumProbabilities[selectedDrumStep.lane].map((currentProbability, index) =>
          index === selectedDrumStep.step ? normalizeDrumProbability(probability) : currentProbability
        )
      }
    }));
  }

  function updateSelectedHatRepeat(repeat: number): void {
    if (!selectedDrumStep || selectedDrumStep.lane !== "hat" || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      hatRepeats: pattern.hatRepeats.map((currentRepeat, index) =>
        index === selectedDrumStep.step ? normalizeHatRepeat(repeat) : currentRepeat
      )
    }));
  }

  function updateSelectedDrumTiming(timingMs: number): void {
    if (!selectedDrumStep || !selectedDrumActive) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      drumTimings: {
        ...pattern.drumTimings,
        [selectedDrumStep.lane]: pattern.drumTimings[selectedDrumStep.lane].map((currentTiming, index) =>
          index === selectedDrumStep.step ? normalizeDrumTimingMs(timingMs) : currentTiming
        )
      }
    }));
  }

  function moveSelectedDrumStep(direction: -1 | 1): void {
    const target = selectedDrumStep;
    if (!target || !selectedDrumActive) {
      setProjectStatus("Select an active drum hit");
      return;
    }

    const nextStep = target.step + direction;
    if (nextStep < 0 || nextStep >= steps.length) {
      setProjectStatus(direction < 0 ? "Drum hit is at the first step" : "Drum hit is at the last step");
      return;
    }

    let rejectedStatus = "";
    const changed = updateCurrentPattern((pattern) => {
      if (!pattern.drumPattern[target.lane][target.step]) {
        return pattern;
      }
      if (pattern.drumPattern[target.lane][nextStep]) {
        rejectedStatus = `${drumLabels[target.lane]} step ${nextStep + 1} already has a hit`;
        return pattern;
      }

      const velocity = drumStepVelocity(pattern, target.lane, target.step);
      const probability = drumStepProbability(pattern, target.lane, target.step);
      const timingMs = drumStepTimingMs(pattern, target.lane, target.step);
      const repeat = target.lane === "hat" ? hatRepeatCount(pattern, target.step) : 1;

      return {
        ...pattern,
        drumPattern: {
          ...pattern.drumPattern,
          [target.lane]: pattern.drumPattern[target.lane].map((enabled, index) =>
            index === target.step ? false : index === nextStep ? true : enabled
          )
        },
        drumVelocities: {
          ...pattern.drumVelocities,
          [target.lane]: pattern.drumVelocities[target.lane].map((currentVelocity, index) =>
            index === target.step
              ? defaultDrumVelocity(target.lane, target.step)
              : index === nextStep
                ? normalizeDrumVelocity(velocity)
                : currentVelocity
          )
        },
        drumProbabilities: {
          ...pattern.drumProbabilities,
          [target.lane]: pattern.drumProbabilities[target.lane].map((currentProbability, index) =>
            index === target.step ? 1 : index === nextStep ? normalizeDrumProbability(probability) : currentProbability
          )
        },
        drumTimings: {
          ...pattern.drumTimings,
          [target.lane]: pattern.drumTimings[target.lane].map((currentTiming, index) =>
            index === target.step ? 0 : index === nextStep ? normalizeDrumTimingMs(timingMs) : currentTiming
          )
        },
        hatRepeats:
          target.lane === "hat"
            ? pattern.hatRepeats.map((currentRepeat, index) =>
                index === target.step ? 1 : index === nextStep ? normalizeHatRepeat(repeat) : currentRepeat
              )
            : pattern.hatRepeats
      };
    }, direction < 0 ? "Moved drum hit left" : "Moved drum hit right");

    if (changed) {
      setSelectedDrumStep({ lane: target.lane, step: nextStep });
      setSelectedNote(null);
      setSelectedChordIndex(null);
    } else if (rejectedStatus) {
      setProjectStatus(rejectedStatus);
    }
  }

  function resetSelectedDrumStep(step: number): void {
    const target = selectedDrumStep;
    if (!target || !selectedDrumActive) {
      setProjectStatus("Select an active drum hit");
      return;
    }

    const nextStep = clampStepStart(step);
    if (nextStep === target.step) {
      setProjectStatus("Drum hit is already on the beat grid");
      return;
    }
    if (nextStep % 4 !== 0) {
      setProjectStatus("No beat-grid reset step");
      return;
    }

    let rejectedStatus = "";
    const changed = updateCurrentPattern((pattern) => {
      if (!pattern.drumPattern[target.lane][target.step]) {
        rejectedStatus = "Select an active drum hit";
        return pattern;
      }
      if (pattern.drumPattern[target.lane][nextStep]) {
        rejectedStatus = `${drumLabels[target.lane]} step ${nextStep + 1} already has a hit`;
        return pattern;
      }

      const velocity = drumStepVelocity(pattern, target.lane, target.step);
      const probability = drumStepProbability(pattern, target.lane, target.step);
      const timingMs = drumStepTimingMs(pattern, target.lane, target.step);
      const repeat = target.lane === "hat" ? hatRepeatCount(pattern, target.step) : 1;

      return {
        ...pattern,
        drumPattern: {
          ...pattern.drumPattern,
          [target.lane]: pattern.drumPattern[target.lane].map((enabled, index) =>
            index === target.step ? false : index === nextStep ? true : enabled
          )
        },
        drumVelocities: {
          ...pattern.drumVelocities,
          [target.lane]: pattern.drumVelocities[target.lane].map((currentVelocity, index) =>
            index === target.step
              ? defaultDrumVelocity(target.lane, target.step)
              : index === nextStep
                ? normalizeDrumVelocity(velocity)
                : currentVelocity
          )
        },
        drumProbabilities: {
          ...pattern.drumProbabilities,
          [target.lane]: pattern.drumProbabilities[target.lane].map((currentProbability, index) =>
            index === target.step ? 1 : index === nextStep ? normalizeDrumProbability(probability) : currentProbability
          )
        },
        drumTimings: {
          ...pattern.drumTimings,
          [target.lane]: pattern.drumTimings[target.lane].map((currentTiming, index) =>
            index === target.step ? 0 : index === nextStep ? normalizeDrumTimingMs(timingMs) : currentTiming
          )
        },
        hatRepeats:
          target.lane === "hat"
            ? pattern.hatRepeats.map((currentRepeat, index) =>
                index === target.step ? 1 : index === nextStep ? normalizeHatRepeat(repeat) : currentRepeat
              )
            : pattern.hatRepeats
      };
    }, "Reset drum step");

    if (changed) {
      setSelectedDrumStep({ lane: target.lane, step: nextStep });
      setSelectedNote(null);
      setSelectedChordIndex(null);
    } else if (rejectedStatus) {
      setProjectStatus(rejectedStatus);
    }
  }

  function editorAuditionFallbackDetail(runtimeDetail?: string): string {
    if (runtimeDetail?.toLowerCase().includes("audiocontext")) {
      return "Web Audio unavailable in this runtime";
    }
    return runtimeDetail ? "One-shot Web Audio blocked by this runtime" : "One-shot Web Audio did not start";
  }

  function createDrumEditorAuditionResult(status: EditorAuditionResult["status"] = "Auditioned", runtimeDetail?: string): EditorAuditionResult | null {
    if (!selectedDrumStep || !selectedDrumActive) {
      return null;
    }

    const velocity = selectedDrumVelocity ?? defaultDrumVelocity(selectedDrumStep.lane, selectedDrumStep.step);
    const probability = selectedDrumProbability ?? 1;
    const timing = selectedDrumTiming;
    const repeat = selectedDrumStep.lane === "hat" ? selectedHatRepeat : 1;
    const heard = status === "Auditioned";

    return {
      kind: "drum",
      targetId: `drum-${project.selectedPattern}-${selectedDrumStep.lane}-${selectedDrumStep.step}`,
      status,
      title: `${drumLabels[selectedDrumStep.lane]} step ${selectedDrumStep.step + 1}`,
      detail: heard
        ? `Pattern ${project.selectedPattern} / ${percentLabel(velocity)} velocity / ${percentLabel(probability)} chance`
        : `Pattern ${project.selectedPattern} / ${editorAuditionFallbackDetail(runtimeDetail)} / ${percentLabel(velocity)} velocity`,
      patternLabel: `Pattern ${project.selectedPattern}`,
      metricLabel: "Pocket",
      metricValue: `${timingLabel(timing)}${selectedDrumStep.lane === "hat" ? ` / x${repeat}` : " / single"}`,
      auditionCue: heard
        ? "Check velocity, timing, hat repeat, and drum rack tone before editing the groove."
        : "Audio did not start; the selected hit remains the audition target for this drum edit.",
      nextCheck: heard
        ? `Loop Pattern ${project.selectedPattern}; hear the hit against 808, chords, and Synth before moving it.`
        : `Enable browser audio, then audition ${drumLabels[selectedDrumStep.lane]} ${selectedDrumStep.step + 1} again or loop Pattern ${project.selectedPattern}.`,
      tone: heard ? "good" : "warn"
    };
  }

  function createNoteEditorAuditionResult(status: EditorAuditionResult["status"] = "Auditioned", runtimeDetail?: string): EditorAuditionResult | null {
    if (!selectedNote) {
      return null;
    }

    const note = selectedNote.track === "bass" ? selectedBassNote : selectedMelodyNote;
    if (!note) {
      return null;
    }

    const trackLabel = selectedNote.track === "bass" ? "808" : "Synth";
    const supportingLayers = selectedNote.track === "bass" ? "drums, chords, and Synth" : "drums, 808, and chords";
    const articulation = selectedNote.track === "bass" ? (selectedBassNote?.glide ? "glide" : "no glide") : "melody";
    const heard = status === "Auditioned";

    return {
      kind: "note",
      targetId: `note-${project.selectedPattern}-${selectedNote.track}-${note.step}-${note.pitch}`,
      status,
      title: `${trackLabel} ${note.pitch} step ${note.step + 1}`,
      detail: heard
        ? `Pattern ${project.selectedPattern} / length ${note.length} / ${percentLabel(note.velocity)} velocity`
        : `Pattern ${project.selectedPattern} / ${editorAuditionFallbackDetail(runtimeDetail)} / ${note.pitch}`,
      patternLabel: `Pattern ${project.selectedPattern}`,
      metricLabel: "Pitch",
      metricValue: `${note.pitch} / ${percentLabel(normalizeEventProbability(note.probability))} chance / ${articulation}`,
      auditionCue: heard
        ? "Check pitch, length, velocity, and current device tone before changing the phrase."
        : "Audio did not start; the selected note remains the audition target for this phrase edit.",
      nextCheck: heard
        ? `Loop Pattern ${project.selectedPattern}; hear the ${trackLabel} against ${supportingLayers} before duplicating it.`
        : `Enable browser audio, then audition the ${trackLabel} note again or loop Pattern ${project.selectedPattern} against ${supportingLayers}.`,
      tone: heard ? "good" : "warn"
    };
  }

  function createChordEditorAuditionResult(status: EditorAuditionResult["status"] = "Auditioned", runtimeDetail?: string): EditorAuditionResult | null {
    if (!selectedChord) {
      return null;
    }

    const inversion = chordInversionLabel(normalizeChordInversion(selectedChord.inversion));
    const heard = status === "Auditioned";

    return {
      kind: "chord",
      targetId: `chord-${project.selectedPattern}-${selectedChord.step}-${selectedChord.root}-${selectedChord.quality}`,
      status,
      title: `Chord ${selectedChord.root}${selectedChord.quality} step ${selectedChord.step + 1}`,
      detail: heard
        ? `Pattern ${project.selectedPattern} / length ${selectedChord.length} / ${percentLabel(selectedChord.velocity)} velocity`
        : `Pattern ${project.selectedPattern} / ${editorAuditionFallbackDetail(runtimeDetail)} / ${selectedChord.root}${selectedChord.quality}`,
      patternLabel: `Pattern ${project.selectedPattern}`,
      metricLabel: "Voicing",
      metricValue: `${inversion} / ${percentLabel(normalizeEventProbability(selectedChord.probability))} chance`,
      auditionCue: heard
        ? "Check root, quality, voicing, length, and chord tone before reharmonizing."
        : "Audio did not start; the selected chord remains the audition target for this harmony edit.",
      nextCheck: heard
        ? `Loop Pattern ${project.selectedPattern}; hear the chord against 808 and Synth before moving it.`
        : `Enable browser audio, then audition the chord again or loop Pattern ${project.selectedPattern} against 808 and Synth.`,
      tone: heard ? "good" : "warn"
    };
  }

  function auditionSelectedDrumHit(): void {
    const outcome = auditionSelectedDrumHitEvent({ projectRef, auditionControllerRef, setProjectStatus }, selectedDrumStep);
    if (outcome.ok) {
      setEditorAuditionResult(createDrumEditorAuditionResult());
    } else if (outcome.runtimeDetail) {
      setEditorAuditionResult(createDrumEditorAuditionResult("Audio not started", outcome.runtimeDetail));
    }
  }

  function auditionSelectedNote(): void {
    const outcome = auditionSelectedNoteEvent({ projectRef, auditionControllerRef, setProjectStatus }, selectedNote);
    if (outcome.ok) {
      setEditorAuditionResult(createNoteEditorAuditionResult());
    } else if (outcome.runtimeDetail) {
      setEditorAuditionResult(createNoteEditorAuditionResult("Audio not started", outcome.runtimeDetail));
    }
  }

  function auditionSelectedChord(): void {
    const outcome = auditionSelectedChordEvent({ projectRef, auditionControllerRef, setProjectStatus }, selectedChord);
    if (outcome.ok) {
      setEditorAuditionResult(createChordEditorAuditionResult());
    } else if (outcome.runtimeDetail) {
      setEditorAuditionResult(createChordEditorAuditionResult("Audio not started", outcome.runtimeDetail));
    }
  }

  function writeDrumHitAtStep(pattern: PatternData, hit: DrumClipboard, step: number): PatternData {
    return {
      ...pattern,
      drumPattern: {
        ...pattern.drumPattern,
        [hit.lane]: pattern.drumPattern[hit.lane].map((enabled, index) => (index === step ? true : enabled))
      },
      drumVelocities: {
        ...pattern.drumVelocities,
        [hit.lane]: pattern.drumVelocities[hit.lane].map((velocity, index) =>
          index === step ? normalizeDrumVelocity(hit.velocity) : velocity
        )
      },
      drumTimings: {
        ...pattern.drumTimings,
        [hit.lane]: pattern.drumTimings[hit.lane].map((timing, index) =>
          index === step ? normalizeDrumTimingMs(hit.timingMs) : timing
        )
      },
      drumProbabilities: {
        ...pattern.drumProbabilities,
        [hit.lane]: pattern.drumProbabilities[hit.lane].map((probability, index) =>
          index === step ? normalizeDrumProbability(hit.probability) : probability
        )
      },
      hatRepeats:
        hit.lane === "hat"
          ? pattern.hatRepeats.map((repeat, index) => (index === step ? normalizeHatRepeat(hit.hatRepeat) : repeat))
          : pattern.hatRepeats
    };
  }

  function copySelectedDrumHit(): void {
    const target = selectedDrumStep;
    if (!target) {
      setProjectStatus("Select an active drum step");
      return;
    }

    const pattern = activePattern(projectRef.current);
    if (!pattern.drumPattern[target.lane][target.step]) {
      setProjectStatus("Select an active drum step");
      return;
    }

    setDrumClipboard({
      lane: target.lane,
      step: target.step,
      velocity: drumStepVelocity(pattern, target.lane, target.step),
      probability: drumStepProbability(pattern, target.lane, target.step),
      timingMs: drumStepTimingMs(pattern, target.lane, target.step),
      hatRepeat: target.lane === "hat" ? hatRepeatCount(pattern, target.step) : 1
    });
    setProjectStatus(`Copied ${drumLabels[target.lane]} step ${target.step + 1}`);
  }

  function duplicateSelectedDrumHit(): void {
    const target = selectedDrumStep;
    if (!target || !selectedDrumActive) {
      setProjectStatus("Select an active drum step");
      return;
    }

    const pattern = activePattern(projectRef.current);
    if (!pattern.drumPattern[target.lane][target.step]) {
      setProjectStatus("Select an active drum step");
      return;
    }

    const nextStep = nextEmptyDrumStep(pattern, target.lane, target.step);
    if (nextStep === null) {
      setProjectStatus(`No empty ${drumLabels[target.lane]} step for duplicate`);
      return;
    }

    const hit: DrumClipboard = {
      lane: target.lane,
      step: target.step,
      velocity: drumStepVelocity(pattern, target.lane, target.step),
      probability: drumStepProbability(pattern, target.lane, target.step),
      timingMs: drumStepTimingMs(pattern, target.lane, target.step),
      hatRepeat: target.lane === "hat" ? hatRepeatCount(pattern, target.step) : 1
    };

    const changed = updateCurrentPattern(
      (currentPatternData) => writeDrumHitAtStep(currentPatternData, hit, nextStep),
      `Duplicated ${drumLabels[target.lane]} hit`
    );

    if (changed) {
      setSelectedDrumStep({ lane: target.lane, step: nextStep });
      setSelectedNote(null);
      setSelectedChordIndex(null);
    }
  }

  function duplicateSelectedDrumHitToStep(step: number): void {
    const target = selectedDrumStep;
    if (!target || !selectedDrumActive) {
      setProjectStatus("Select an active drum step");
      return;
    }

    const nextStep = clampStepStart(step);
    const pattern = activePattern(projectRef.current);
    if (!pattern.drumPattern[target.lane][target.step]) {
      setProjectStatus("Select an active drum step");
      return;
    }
    if (nextStep === target.step || nextStep >= steps.length || nextStep % 4 !== 0) {
      setProjectStatus("No beat-grid duplicate step");
      return;
    }
    if (pattern.drumPattern[target.lane][nextStep]) {
      setProjectStatus(`${drumLabels[target.lane]} step ${nextStep + 1} already has a hit`);
      return;
    }

    const hit: DrumClipboard = {
      lane: target.lane,
      step: target.step,
      velocity: drumStepVelocity(pattern, target.lane, target.step),
      probability: drumStepProbability(pattern, target.lane, target.step),
      timingMs: drumStepTimingMs(pattern, target.lane, target.step),
      hatRepeat: target.lane === "hat" ? hatRepeatCount(pattern, target.step) : 1
    };

    const changed = updateCurrentPattern(
      (currentPatternData) => writeDrumHitAtStep(currentPatternData, hit, nextStep),
      `Duplicated ${drumLabels[target.lane]} hit on beat`
    );

    if (changed) {
      setSelectedDrumStep({ lane: target.lane, step: nextStep });
      setSelectedNote(null);
      setSelectedChordIndex(null);
    }
  }

  function pasteCopiedDrumHit(): void {
    const clipboard = drumClipboard;
    if (!clipboard) {
      setProjectStatus("Copy a drum hit first");
      return;
    }

    const pattern = activePattern(projectRef.current);
    const nextStep = nextEmptyDrumStep(pattern, clipboard.lane, clipboard.step);
    if (nextStep === null) {
      setProjectStatus(`No empty ${drumLabels[clipboard.lane]} step`);
      return;
    }

    const changed = updateCurrentPattern(
      (currentPatternData) => writeDrumHitAtStep(currentPatternData, clipboard, nextStep),
      `Pasted ${drumLabels[clipboard.lane]} hit`
    );

    if (changed) {
      setSelectedDrumStep({ lane: clipboard.lane, step: nextStep });
      setSelectedNote(null);
      setSelectedChordIndex(null);
    }
  }

  function applySelectedDrumGroove(preset: DrumGroovePreset): void {
    updateCurrentPattern(
      (pattern) => applyDrumGroovePreset(pattern, preset),
      `${drumGroovePresetLabel(preset)} groove applied to Pattern ${projectRef.current.selectedPattern}`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function toggleBassNote(step: number, pitch: string): void {
    const exists = currentPattern.bassNotes.some((note) => note.step === step && note.pitch === pitch);
    const selectedSameNote = selectedNote?.track === "bass" && selectedNote.step === step && selectedNote.pitch === pitch;
    setSelectedNote({ track: "bass", step, pitch });
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    if (exists && !selectedSameNote) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      bassNotes: exists
        ? pattern.bassNotes.filter((note) => note.step !== step || note.pitch !== pitch)
        : sortBassNotes([
            ...pattern.bassNotes,
            { step, pitch, length: 2, velocity: clampVelocity(keyboardCaptureDefaults.bass.velocity), glide: false, probability: 1 }
          ])
    }));
    setSelectedNote(exists ? null : { track: "bass", step, pitch });
  }

  function toggleMelodyNote(step: number, pitch: string): void {
    const exists = currentPattern.melodyNotes.some((note) => note.step === step && note.pitch === pitch);
    const selectedSameNote = selectedNote?.track === "melody" && selectedNote.step === step && selectedNote.pitch === pitch;
    setSelectedNote({ track: "melody", step, pitch });
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    if (exists && !selectedSameNote) {
      return;
    }

    updateCurrentPattern((pattern) => ({
      ...pattern,
      melodyNotes: exists
        ? pattern.melodyNotes.filter((note) => note.step !== step || note.pitch !== pitch)
        : sortMelodyNotes([...pattern.melodyNotes, { step, pitch, length: 1, velocity: 0.68, probability: 1 }])
    }));
    setSelectedNote(exists ? null : { track: "melody", step, pitch });
  }

  function captureKeyboardNote(key: KeyboardCaptureKey): void {
    const current = projectRef.current;
    const pattern = activePattern(current);
    const target = keyboardCaptureTarget;
    const captureDefaults = keyboardCaptureDefaults[target];
    const pitch = keyboardCapturePitchForKey(key, keyboardCapturePitchLanes(current.key, target, captureDefaults));
    if (!pitch) {
      setInputCaptureResult(null);
      setProjectStatus("Keyboard Capture key is out of range");
      return;
    }

    const step = resolveKeyboardCaptureStep(pattern, target, selectedNote, keyboardCaptureStepMode);
    const replaceStep = shouldReplaceKeyboardCaptureStep(keyboardCaptureStepMode, selectedNote, target);
    const result = createInputCaptureResult({
      source: "keyboard",
      inputLabel: keyboardCaptureKeyLabels[key],
      patternSlot: current.selectedPattern,
      projectKey: current.key,
      target,
      step,
      pitch,
      defaults: captureDefaults,
      replaceStep
    });
    const changed = updateCurrentPattern(
      (currentPatternData) => addKeyboardCaptureNote(currentPatternData, target, step, pitch, captureDefaults, replaceStep),
      `${replaceStep ? "Replaced" : "Captured"} ${target === "bass" ? "808" : "Synth"} ${pitch}.${step + 1} length ${
        captureDefaults.length
      } on Pattern ${current.selectedPattern}`
    );

    if (!changed) {
      setInputCaptureResult(null);
      setProjectStatus("Keyboard Capture note already exists");
      return;
    }

    setInputCaptureResult(result);
    setSelectedNote({ track: target, step, pitch });
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyPatternStack(stackId: PatternStackId): void {
    const stack = patternStackDefinitions.find((candidate) => candidate.id === stackId);
    if (!stack) {
      setProjectStatus("Pattern stack not found");
      return;
    }

    const beforeProject = projectRef.current;
    const stackEvents = createPatternStackEvents(projectRef.current.key, stack);
    const changed = updateCurrentPattern(
      (pattern) => (samePatternStackEvents(pattern, stackEvents) ? pattern : { ...pattern, ...stackEvents }),
      `${stack.label} pattern stack applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setPatternStackResult(null);
      setProjectStatus(`${stack.label} pattern stack already selected`);
      return;
    }

    setPatternStackResult(createPatternStackResult(stack, beforeProject, projectRef.current));
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(0);
  }

  function applyLayerStarter(starterId: LayerStarterId): void {
    const beforeProject = projectRef.current;
    const beforeOption = createLayerStarterOptions(beforeProject).find((option) => option.id === starterId);
    switch (starterId) {
      case "drums":
        applyDrumFoundation(composerDrumFoundation(projectRef.current));
        break;
      case "bass":
        applyBasslinePad(composerBasslinePad(projectRef.current));
        break;
      case "chords":
        applyChordProgressionPreset(composerChordPreset(projectRef.current));
        break;
      case "melody":
        applyMelodyMotif(composerMelodyMotif(projectRef.current));
        break;
    }

    if (projectRef.current !== beforeProject) {
      const afterOption = createLayerStarterOptions(projectRef.current).find((option) => option.id === starterId);
      setLayerStarterResult(createLayerStarterResult(starterId, beforeProject, projectRef.current, beforeOption, afterOption));
    } else {
      setLayerStarterResult(null);
    }
  }

  function applyDrumFoundation(foundationId: DrumFoundationId): void {
    const foundation = drumFoundationDefinitions.find((candidate) => candidate.id === foundationId);
    if (!foundation) {
      setProjectStatus("Drum foundation pad not found");
      return;
    }

    const beforeProject = projectRef.current;
    const currentPatternData = projectRef.current.patterns[projectRef.current.selectedPattern];
    const nextPatternData = applyDrumFoundationToPattern(currentPatternData, foundation);
    const changed = updateCurrentPattern(
      (pattern) => (sameDrumFoundationState(pattern, nextPatternData) ? pattern : nextPatternData),
      `${foundation.label} drum foundation applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setDrumMoveResult(null);
      setProjectStatus(`${foundation.label} drum foundation already selected`);
      return;
    }

    setDrumMoveResult(createDrumMoveResult("Foundation", foundation.id, foundation.label, foundation.detail, beforeProject, projectRef.current));
    setSelectedDrumStep(firstActiveDrumStep(nextPatternData));
    setSelectedNote(null);
    setSelectedChordIndex(null);
  }

  function applyGrooveFeel(feelId: GrooveFeelId): void {
    const feel = grooveFeelDefinitions.find((candidate) => candidate.id === feelId);
    if (!feel) {
      setProjectStatus("Groove feel not found");
      return;
    }

    const beforeProject = projectRef.current;
    const changed = updateCurrentPattern(
      (pattern) => {
        const nextPatternData = applyGrooveFeelToPattern(pattern, feel);
        return sameGrooveFeelState(pattern, nextPatternData) ? pattern : nextPatternData;
      },
      `${feel.label} groove feel applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setDrumMoveResult(null);
      setProjectStatus(`${feel.label} groove feel already selected`);
      return;
    }

    setDrumMoveResult(createDrumMoveResult("Feel", feel.id, feel.label, feel.detail, beforeProject, projectRef.current));
  }

  function applyDrumAccent(accentId: DrumAccentId): void {
    const accent = drumAccentDefinitions.find((candidate) => candidate.id === accentId);
    if (!accent) {
      setProjectStatus("Drum accent not found");
      return;
    }

    const beforeProject = projectRef.current;
    const changed = updateCurrentPattern(
      (pattern) => {
        const nextPatternData = applyDrumAccentToPattern(pattern, accent.id);
        return sameDrumAccentState(pattern, nextPatternData) ? pattern : nextPatternData;
      },
      `${accent.label} drum accent applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setDrumMoveResult(null);
      setProjectStatus(`${accent.label} drum accent already selected`);
      return;
    }

    setDrumMoveResult(createDrumMoveResult("Accent", accent.id, accent.label, accent.detail, beforeProject, projectRef.current));
  }

  function applyBasslinePad(padId: BasslinePadId): void {
    const pad = basslinePadDefinitions.find((candidate) => candidate.id === padId);
    if (!pad) {
      setBassMoveResult(null);
      setProjectStatus("808 bassline pad not found");
      return;
    }

    const beforeProject = projectRef.current;
    const bassNotes = createBasslinePadNotes(projectRef.current.key, pad);
    const changed = updateCurrentPattern(
      (pattern) => (sameBassNotes(pattern.bassNotes, bassNotes) ? pattern : { ...pattern, bassNotes }),
      `${pad.label} 808 bassline applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setBassMoveResult(null);
      setProjectStatus(`${pad.label} 808 bassline already selected`);
      return;
    }

    setBassMoveResult(createBassMoveResult("Bassline", pad.id, pad.label, pad.detail, beforeProject, projectRef.current));
    const firstNote = bassNotes[0];
    setSelectedNote(firstNote ? { track: "bass", step: firstNote.step, pitch: firstNote.pitch } : null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyBassGlidePad(padId: BassGlidePadId): void {
    const pad = bassGlidePadDefinitions.find((candidate) => candidate.id === padId);
    if (!pad) {
      setBassMoveResult(null);
      setProjectStatus("808 glide pad not found");
      return;
    }

    const currentBassNotes = projectRef.current.patterns[projectRef.current.selectedPattern].bassNotes;
    if (currentBassNotes.length === 0) {
      setBassMoveResult(null);
      setProjectStatus(`Add an 808 note before using ${pad.label} glide`);
      return;
    }

    const beforeProject = projectRef.current;
    const bassNotes = applyBassGlidePadToNotes(currentBassNotes, pad.id);
    const changed = updateCurrentPattern(
      (pattern) => (sameBassNotes(pattern.bassNotes, bassNotes) ? pattern : { ...pattern, bassNotes }),
      `${pad.label} 808 glide applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setBassMoveResult(null);
      setProjectStatus(`${pad.label} 808 glide already selected`);
      return;
    }

    setBassMoveResult(createBassMoveResult("Glide", pad.id, pad.label, pad.detail, beforeProject, projectRef.current));
    const firstNote = bassNotes[0];
    setSelectedNote(firstNote ? { track: "bass", step: firstNote.step, pitch: firstNote.pitch } : null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyBassContour(contourId: BassContourId): void {
    const contour = bassContourDefinitions.find((candidate) => candidate.id === contourId);
    if (!contour) {
      setBassMoveResult(null);
      setProjectStatus("808 contour pad not found");
      return;
    }

    const currentBassNotes = projectRef.current.patterns[projectRef.current.selectedPattern].bassNotes;
    if (currentBassNotes.length === 0) {
      setBassMoveResult(null);
      setProjectStatus(`Add an 808 note before using ${contour.label} contour`);
      return;
    }

    const beforeProject = projectRef.current;
    const bassNotes = applyBassContourToNotes(projectRef.current.key, currentBassNotes, contour.id);
    const changed = updateCurrentPattern(
      (pattern) => (sameBassNotes(pattern.bassNotes, bassNotes) ? pattern : { ...pattern, bassNotes }),
      `${contour.label} 808 contour applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setBassMoveResult(null);
      setProjectStatus(`${contour.label} 808 contour already selected`);
      return;
    }

    setBassMoveResult(createBassMoveResult("Contour", contour.id, contour.label, contour.detail, beforeProject, projectRef.current));
    const firstNote = bassNotes[0];
    setSelectedNote(firstNote ? { track: "bass", step: firstNote.step, pitch: firstNote.pitch } : null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyMelodyMotif(motifId: MelodyMotifId): void {
    const motif = melodyMotifDefinitions.find((candidate) => candidate.id === motifId);
    if (!motif) {
      setMelodyMoveResult(null);
      setProjectStatus("Melody motif not found");
      return;
    }

    const beforeProject = projectRef.current;
    const melodyNotes = createMelodyMotifNotes(projectRef.current.key, motif);
    const changed = updateCurrentPattern(
      (pattern) => (sameMelodyNotes(pattern.melodyNotes, melodyNotes) ? pattern : { ...pattern, melodyNotes }),
      `${motif.label} melody motif applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setMelodyMoveResult(null);
      setProjectStatus(`${motif.label} melody motif already selected`);
      return;
    }

    setMelodyMoveResult(createMelodyMoveResult("Motif", motif.id, motif.label, motif.detail, beforeProject, projectRef.current));
    const firstNote = melodyNotes[0];
    setSelectedNote(firstNote ? { track: "melody", step: firstNote.step, pitch: firstNote.pitch } : null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyMelodyAccent(accentId: MelodyAccentId): void {
    const accent = melodyAccentDefinitions.find((candidate) => candidate.id === accentId);
    if (!accent) {
      setMelodyMoveResult(null);
      setProjectStatus("Melody accent pad not found");
      return;
    }

    const currentMelodyNotes = projectRef.current.patterns[projectRef.current.selectedPattern].melodyNotes;
    if (currentMelodyNotes.length === 0) {
      setMelodyMoveResult(null);
      setProjectStatus(`Add a Synth note before using ${accent.label} accent`);
      return;
    }

    const beforeProject = projectRef.current;
    const melodyNotes = applyMelodyAccentToNotes(currentMelodyNotes, accent.id);
    const changed = updateCurrentPattern(
      (pattern) => (sameMelodyNotes(pattern.melodyNotes, melodyNotes) ? pattern : { ...pattern, melodyNotes }),
      `${accent.label} melody accent applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setMelodyMoveResult(null);
      setProjectStatus(`${accent.label} melody accent already selected`);
      return;
    }

    setMelodyMoveResult(createMelodyMoveResult("Accent", accent.id, accent.label, accent.detail, beforeProject, projectRef.current));
    const firstNote = melodyNotes[0];
    setSelectedNote(firstNote ? { track: "melody", step: firstNote.step, pitch: firstNote.pitch } : null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function applyMelodyContour(contourId: MelodyContourId): void {
    const contour = melodyContourDefinitions.find((candidate) => candidate.id === contourId);
    if (!contour) {
      setMelodyMoveResult(null);
      setProjectStatus("Melody contour pad not found");
      return;
    }

    const currentMelodyNotes = projectRef.current.patterns[projectRef.current.selectedPattern].melodyNotes;
    if (currentMelodyNotes.length === 0) {
      setMelodyMoveResult(null);
      setProjectStatus(`Add a Synth note before using ${contour.label} contour`);
      return;
    }

    const beforeProject = projectRef.current;
    const melodyNotes = applyMelodyContourToNotes(projectRef.current.key, currentMelodyNotes, contour.id);
    const changed = updateCurrentPattern(
      (pattern) => (sameMelodyNotes(pattern.melodyNotes, melodyNotes) ? pattern : { ...pattern, melodyNotes }),
      `${contour.label} melody contour applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setMelodyMoveResult(null);
      setProjectStatus(`${contour.label} melody contour already selected`);
      return;
    }

    setMelodyMoveResult(createMelodyMoveResult("Contour", contour.id, contour.label, contour.detail, beforeProject, projectRef.current));
    const firstNote = melodyNotes[0];
    setSelectedNote(firstNote ? { track: "melody", step: firstNote.step, pitch: firstNote.pitch } : null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function updateSelectedLength(length: number, status = "Edited note length"): void {
    if (!selectedNote) {
      return;
    }

    const nextLength = clampStepLength(length);
    updateCurrentPattern(
      (pattern) => ({
        ...pattern,
        bassNotes:
          selectedNote.track === "bass"
            ? pattern.bassNotes.map((note) =>
                note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, length: nextLength } : note
              )
            : pattern.bassNotes,
        melodyNotes:
          selectedNote.track === "melody"
            ? pattern.melodyNotes.map((note) =>
                note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, length: nextLength } : note
              )
            : pattern.melodyNotes
      }),
      status
    );
  }

  function updateSelectedGlide(glide: boolean, status = "Edited 808 glide"): void {
    if (!selectedNote || selectedNote.track !== "bass") {
      return;
    }

    updateCurrentPattern(
      (pattern) => ({
        ...pattern,
        bassNotes: pattern.bassNotes.map((note) =>
          note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, glide } : note
        )
      }),
      status
    );
  }

  function updateSelectedVelocity(velocity: number, status = "Edited note velocity"): void {
    if (!selectedNote) {
      return;
    }

    const nextVelocity = clampVelocity(velocity);
    updateCurrentPattern(
      (pattern) => ({
        ...pattern,
        bassNotes:
          selectedNote.track === "bass"
            ? pattern.bassNotes.map((note) =>
                note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, velocity: nextVelocity } : note
              )
            : pattern.bassNotes,
        melodyNotes:
          selectedNote.track === "melody"
            ? pattern.melodyNotes.map((note) =>
                note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, velocity: nextVelocity } : note
              )
            : pattern.melodyNotes
      }),
      status
    );
  }

  function updateSelectedNoteProbability(probability: number, status = "Edited note chance"): void {
    if (!selectedNote) {
      return;
    }

    const nextProbability = normalizeEventProbability(probability);
    updateCurrentPattern(
      (pattern) => ({
        ...pattern,
        bassNotes:
          selectedNote.track === "bass"
            ? pattern.bassNotes.map((note) =>
                note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, probability: nextProbability } : note
              )
            : pattern.bassNotes,
        melodyNotes:
          selectedNote.track === "melody"
            ? pattern.melodyNotes.map((note) =>
                note.step === selectedNote.step && note.pitch === selectedNote.pitch ? { ...note, probability: nextProbability } : note
              )
            : pattern.melodyNotes
      }),
      status
    );
  }

  function moveSelectedNoteStep(direction: -1 | 1): void {
    if (!selectedNote) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const nextStep = clampStepStart(selectedNote.step + direction);
    moveSelectedNoteTo(nextStep, selectedNote.pitch, direction < 0 ? "Moved note left" : "Moved note right");
  }

  function resetSelectedNoteStep(step: number): void {
    if (!selectedNote) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    moveSelectedNoteTo(clampStepStart(step), selectedNote.pitch, "Reset note step");
  }

  function moveSelectedNotePitch(direction: -1 | 1): void {
    if (!selectedNote) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const current = projectRef.current;
    const pattern = activePattern(current);
    const usedPitches =
      selectedNote.track === "bass"
        ? pattern.bassNotes.map((note) => note.pitch)
        : pattern.melodyNotes.map((note) => note.pitch);
    const nextPitch = adjacentTrackPitch(selectedNote.track, current.key, selectedNote.pitch, direction, usedPitches);
    if (!nextPitch) {
      setProjectStatus(direction < 0 ? "Note is at the low pitch edge" : "Note is at the high pitch edge");
      return;
    }

    moveSelectedNoteTo(selectedNote.step, nextPitch, direction < 0 ? "Moved note down" : "Moved note up");
  }

  function resetSelectedNotePitch(): void {
    if (!selectedNote) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const defaultPitch = keyboardCapturePitchLanes(
      projectRef.current.key,
      selectedNote.track,
      keyboardCaptureDefaults[selectedNote.track]
    )[0];
    if (!defaultPitch) {
      setProjectStatus("No default pitch available");
      return;
    }

    moveSelectedNoteTo(selectedNote.step, defaultPitch, "Reset note pitch");
  }

  function moveSelectedNoteOctave(direction: -1 | 1): void {
    if (!selectedNote) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const nextPitch = octaveShiftPitch(selectedNote.track, selectedNote.pitch, direction);
    if (!nextPitch) {
      setProjectStatus(direction < 0 ? "Note is at the low octave edge" : "Note is at the high octave edge");
      return;
    }

    moveSelectedNoteTo(selectedNote.step, nextPitch, direction < 0 ? "Moved note down an octave" : "Moved note up an octave");
  }

  function moveSelectedNoteTo(step: number, pitch: string, status: string): void {
    const target = selectedNote;
    if (!target) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }
    if (target.step === step && target.pitch === pitch) {
      setProjectStatus("Note is already there");
      return;
    }

    const pattern = activePattern(projectRef.current);
    const sourceExists =
      target.track === "bass"
        ? pattern.bassNotes.some((note) => matchesSelectedNote(note, target))
        : pattern.melodyNotes.some((note) => matchesSelectedNote(note, target));
    if (!sourceExists) {
      setProjectStatus("Select an active note");
      return;
    }

    const occupied =
      target.track === "bass"
        ? pattern.bassNotes.some((note) => !matchesSelectedNote(note, target) && note.step === step && note.pitch === pitch)
        : pattern.melodyNotes.some((note) => !matchesSelectedNote(note, target) && note.step === step && note.pitch === pitch);
    if (occupied) {
      setProjectStatus("Target note already exists");
      return;
    }

    const changed = updateCurrentPattern(
      (currentPatternData) => ({
        ...currentPatternData,
        bassNotes:
          target.track === "bass"
            ? sortBassNotes(
                currentPatternData.bassNotes.map((note) =>
                  matchesSelectedNote(note, target) ? { ...note, step, pitch } : note
                )
              )
            : currentPatternData.bassNotes,
        melodyNotes:
          target.track === "melody"
            ? sortMelodyNotes(
                currentPatternData.melodyNotes.map((note) =>
                  matchesSelectedNote(note, target) ? { ...note, step, pitch } : note
                )
              )
            : currentPatternData.melodyNotes
      }),
      status
    );

    if (changed) {
      setSelectedNote({ ...target, step, pitch });
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function copySelectedNote(): void {
    const target = selectedNote;
    if (!target) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const pattern = activePattern(projectRef.current);
    if (target.track === "bass") {
      const source = pattern.bassNotes.find((note) => matchesSelectedNote(note, target));
      if (!source) {
        setProjectStatus("Select an active note");
        return;
      }
      setNoteClipboard({ track: "bass", note: { ...source } });
      setProjectStatus(`Copied 808 ${source.pitch}.${source.step + 1}`);
      return;
    }

    const source = pattern.melodyNotes.find((note) => matchesSelectedNote(note, target));
    if (!source) {
      setProjectStatus("Select an active note");
      return;
    }
    setNoteClipboard({ track: "melody", note: { ...source } });
    setProjectStatus(`Copied Synth ${source.pitch}.${source.step + 1}`);
  }

  function pasteCopiedNote(): void {
    const clipboard = noteClipboard;
    if (!clipboard) {
      setProjectStatus("Copy a note first");
      return;
    }

    const pattern = activePattern(projectRef.current);
    if (clipboard.track === "bass") {
      const nextStep = nextEmptyStepForPitch(pattern.bassNotes, clipboard.note.pitch, clipboard.note.step);
      if (nextStep === null) {
        setProjectStatus("No empty step for pasted 808");
        return;
      }
      const pastedNote = { ...clipboard.note, step: nextStep };
      const changed = updateCurrentPattern(
        (currentPatternData) => ({
          ...currentPatternData,
          bassNotes: sortBassNotes([...currentPatternData.bassNotes, pastedNote])
        }),
        "Pasted 808 note"
      );
      if (changed) {
        setSelectedNote({ track: "bass", step: nextStep, pitch: pastedNote.pitch });
        setSelectedDrumStep(null);
        setSelectedChordIndex(null);
      }
      return;
    }

    const nextStep = nextEmptyStepForPitch(pattern.melodyNotes, clipboard.note.pitch, clipboard.note.step);
    if (nextStep === null) {
      setProjectStatus("No empty step for pasted Synth");
      return;
    }
    const pastedNote = { ...clipboard.note, step: nextStep };
    const changed = updateCurrentPattern(
      (currentPatternData) => ({
        ...currentPatternData,
        melodyNotes: sortMelodyNotes([...currentPatternData.melodyNotes, pastedNote])
      }),
      "Pasted Synth note"
    );
    if (changed) {
      setSelectedNote({ track: "melody", step: nextStep, pitch: pastedNote.pitch });
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function duplicateSelectedNote(): void {
    const target = selectedNote;
    if (!target) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const pattern = activePattern(projectRef.current);
    if (target.track === "bass") {
      const source = pattern.bassNotes.find((note) => matchesSelectedNote(note, target));
      if (!source) {
        setProjectStatus("Select an active note");
        return;
      }
      const nextStep = nextEmptyStepForPitch(pattern.bassNotes, source.pitch, source.step);
      if (nextStep === null) {
        setProjectStatus("No empty step for duplicate");
        return;
      }
      const changed = updateCurrentPattern(
        (currentPatternData) => ({
          ...currentPatternData,
          bassNotes: sortBassNotes([...currentPatternData.bassNotes, { ...source, step: nextStep }])
        }),
        "Duplicated 808 note"
      );
      if (changed) {
        setSelectedNote({ ...target, step: nextStep });
        setSelectedDrumStep(null);
        setSelectedChordIndex(null);
      }
      return;
    }

    const source = pattern.melodyNotes.find((note) => matchesSelectedNote(note, target));
    if (!source) {
      setProjectStatus("Select an active note");
      return;
    }
    const nextStep = nextEmptyStepForPitch(pattern.melodyNotes, source.pitch, source.step);
    if (nextStep === null) {
      setProjectStatus("No empty step for duplicate");
      return;
    }
    const changed = updateCurrentPattern(
      (currentPatternData) => ({
        ...currentPatternData,
        melodyNotes: sortMelodyNotes([...currentPatternData.melodyNotes, { ...source, step: nextStep }])
      }),
      "Duplicated Synth note"
    );
    if (changed) {
      setSelectedNote({ ...target, step: nextStep });
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function duplicateSelectedNoteToStep(step: number): void {
    const target = selectedNote;
    if (!target) {
      setProjectStatus("Select an 808 or Synth note");
      return;
    }

    const nextStep = clampStepStart(step);
    const pattern = activePattern(projectRef.current);
    if (target.track === "bass") {
      const source = pattern.bassNotes.find((note) => matchesSelectedNote(note, target));
      if (!source) {
        setProjectStatus("Select an active note");
        return;
      }
      if (nextStep === source.step || nextStep % 4 !== 0 || nextStep > steps.length - clampStepLength(source.length)) {
        setProjectStatus("No beat-grid duplicate step");
        return;
      }
      const occupied = pattern.bassNotes.some(
        (note) => !matchesSelectedNote(note, target) && note.step === nextStep && note.pitch === source.pitch
      );
      if (occupied) {
        setProjectStatus("Target note already exists");
        return;
      }
      const changed = updateCurrentPattern(
        (currentPatternData) => ({
          ...currentPatternData,
          bassNotes: sortBassNotes([...currentPatternData.bassNotes, { ...source, step: nextStep }])
        }),
        "Duplicated 808 note on beat"
      );
      if (changed) {
        setSelectedNote({ track: "bass", step: nextStep, pitch: source.pitch });
        setSelectedDrumStep(null);
        setSelectedChordIndex(null);
      }
      return;
    }

    const source = pattern.melodyNotes.find((note) => matchesSelectedNote(note, target));
    if (!source) {
      setProjectStatus("Select an active note");
      return;
    }
    if (nextStep === source.step || nextStep % 4 !== 0 || nextStep > steps.length - clampStepLength(source.length)) {
      setProjectStatus("No beat-grid duplicate step");
      return;
    }
    const occupied = pattern.melodyNotes.some(
      (note) => !matchesSelectedNote(note, target) && note.step === nextStep && note.pitch === source.pitch
    );
    if (occupied) {
      setProjectStatus("Target note already exists");
      return;
    }
    const changed = updateCurrentPattern(
      (currentPatternData) => ({
        ...currentPatternData,
        melodyNotes: sortMelodyNotes([...currentPatternData.melodyNotes, { ...source, step: nextStep }])
      }),
      "Duplicated Synth note on beat"
    );
    if (changed) {
      setSelectedNote({ track: "melody", step: nextStep, pitch: source.pitch });
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function selectChordEvent(index: number): void {
    if (!currentPattern.chordEvents[index]) {
      return;
    }
    setSelectedChordIndex(index);
    setSelectedNote(null);
    setSelectedDrumStep(null);
  }

  function updateChordEvent(index: number, update: Partial<ChordEvent>, status = "Edited chord event"): boolean {
    let nextSelectedIndex: number | null = null;
    let rejectedStatus = "";
    const changed = updateCurrentPattern((pattern) => {
      const source = pattern.chordEvents[index];
      if (!source) {
        return pattern;
      }
      const nextEvent = chordEventWithUpdate(source, update);
      if (
        update.step !== undefined &&
        pattern.chordEvents.some((event, eventIndex) => eventIndex !== index && event.step === nextEvent.step)
      ) {
        rejectedStatus = "Target chord step already exists";
        return pattern;
      }
      if (sameChordEvent(source, nextEvent)) {
        return pattern;
      }
      const chordEvents = sortChordEvents(
        pattern.chordEvents.map((event, eventIndex) => (eventIndex === index ? nextEvent : event))
      );
      nextSelectedIndex = findChordEventIndex(chordEvents, nextEvent);
      return {
        ...pattern,
        chordEvents
      };
    }, status);

    if (changed) {
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    } else if (rejectedStatus) {
      setProjectStatus(rejectedStatus);
    }
    return changed;
  }

  function applyChordProgressionPreset(preset: ChordProgressionPreset): void {
    const changed = updateCurrentPattern(
      (pattern) => ({
        ...pattern,
        chordEvents: createChordProgressionPreset(preset, projectRef.current.key)
      }),
      `${chordProgressionPresetLabel(preset)} chords applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (changed) {
      setSelectedChordIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    }
  }

  function applyChordPad(padId: ChordPadId): void {
    if (selectedChordIndex === null || !selectedChord) {
      setChordMoveResult(null);
      setProjectStatus("Select a chord event");
      return;
    }

    const option = createChordPadOptions(projectRef.current.key, selectedChord).find((pad) => pad.id === padId);
    if (!option) {
      setChordMoveResult(null);
      setProjectStatus("Chord pad not found");
      return;
    }

    const beforeProject = projectRef.current;
    const changed = updateChordEvent(
      selectedChordIndex,
      { root: option.root, quality: option.quality, inversion: option.inversion },
      `${option.label} chord pad applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setChordMoveResult(null);
      setProjectStatus(`${option.label} chord pad already selected`);
      return;
    }

    setChordMoveResult(createChordMoveResult("Pad", option.id, option.label, option.detail, beforeProject, projectRef.current));
  }

  function applyChordRhythm(rhythmId: ChordRhythmId): void {
    const rhythm = chordRhythmDefinitions.find((definition) => definition.id === rhythmId);
    if (!rhythm) {
      setChordMoveResult(null);
      setProjectStatus("Chord rhythm not found");
      return;
    }

    let nextSelectedIndex: number | null = selectedChordIndex;
    const beforeProject = projectRef.current;
    const changed = updateCurrentPattern((pattern) => {
      if (pattern.chordEvents.length === 0) {
        return pattern;
      }
      const chordEvents = applyChordRhythmToEvents(pattern.chordEvents, rhythmId);
      if (sameChordEvents(pattern.chordEvents, chordEvents)) {
        return pattern;
      }
      if (selectedChordIndex !== null) {
        nextSelectedIndex = chordEvents[selectedChordIndex] ? selectedChordIndex : 0;
      } else {
        nextSelectedIndex = 0;
      }
      return {
        ...pattern,
        chordEvents
      };
    }, `${rhythm.label} chord rhythm applied to Pattern ${projectRef.current.selectedPattern}`);

    if (changed) {
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setChordMoveResult(createChordMoveResult("Rhythm", rhythm.id, rhythm.label, rhythm.detail, beforeProject, projectRef.current));
    } else {
      setChordMoveResult(null);
      setProjectStatus(`${rhythm.label} chord rhythm already selected`);
    }
  }

  function applyChordVoicingPad(voicingId: ChordVoicingId): void {
    if (selectedChordIndex === null || !selectedChord) {
      setChordMoveResult(null);
      setProjectStatus("Select a chord event");
      return;
    }

    const option = createChordVoicingOptions(selectedChord).find((voicing) => voicing.id === voicingId);
    if (!option) {
      setChordMoveResult(null);
      setProjectStatus("Chord voicing pad not found");
      return;
    }

    const beforeProject = projectRef.current;
    const changed = updateChordEvent(
      selectedChordIndex,
      {
        quality: option.quality,
        inversion: option.inversion,
        length: option.length,
        velocity: option.velocity,
        probability: option.probability
      },
      `${option.label} chord voicing applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setChordMoveResult(null);
      setProjectStatus(`${option.label} chord voicing already selected`);
      return;
    }

    setChordMoveResult(createChordMoveResult("Voicing", option.id, option.label, option.detail, beforeProject, projectRef.current));
  }

  function addChordEvent(): void {
    let nextSelectedIndex: number | null = null;
    const changed = updateCurrentPattern(
      (pattern) => {
        const chord = createNextChordEvent(projectRef.current.key, pattern.chordEvents);
        const chordEvents = sortChordEvents([...pattern.chordEvents, chord]);
        nextSelectedIndex = findChordEventIndex(chordEvents, chord);
        return {
          ...pattern,
          chordEvents
        };
      },
      `Added chord to Pattern ${projectRef.current.selectedPattern}`
    );
    if (changed) {
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    }
  }

  function deleteChordEvent(index: number): boolean {
    const currentChords = activePattern(projectRef.current).chordEvents;
    if (currentChords.length <= 1) {
      setSelectedEventDeleteResult(null);
      setProjectStatus("Chord progression needs one chord");
      return false;
    }

    const patternSlot = projectRef.current.selectedPattern;
    const result = createSelectedChordDeleteResult(currentChords[index], index, patternSlot);
    let nextSelectedIndex: number | null = null;
    const changed = updateCurrentPattern(
      (pattern) => {
        if (!pattern.chordEvents[index]) {
          return pattern;
        }
        const chordEvents = pattern.chordEvents.filter((_, eventIndex) => eventIndex !== index);
        nextSelectedIndex = Math.min(index, chordEvents.length - 1);
        return {
          ...pattern,
          chordEvents
        };
      },
      `Deleted chord ${index + 1} from Pattern ${projectRef.current.selectedPattern}`
    );
    if (changed) {
      if (result) {
        showSelectedEventDeleteResult(result, nextSelectedIndex !== selectedChordIndex);
      }
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    } else {
      setSelectedEventDeleteResult(null);
    }
    return changed;
  }

  function moveSelectedChordStep(direction: -1 | 1): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }
    const nextStep = clampStepStart(selectedChord.step + direction);
    if (nextStep === selectedChord.step) {
      setProjectStatus(direction < 0 ? "Chord is at the first step" : "Chord is at the last step");
      return;
    }
    updateChordEvent(
      selectedChordIndex,
      { step: nextStep },
      direction < 0 ? "Moved chord left" : "Moved chord right"
    );
  }

  function updateSelectedChordStep(step: number): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }

    updateChordEvent(
      selectedChordIndex,
      { step: clampStepStart(step) },
      "Reset chord step"
    );
  }

  function copySelectedChord(): void {
    if (selectedChordIndex === null) {
      setProjectStatus("Select a chord event");
      return;
    }

    const source = activePattern(projectRef.current).chordEvents[selectedChordIndex];
    if (!source) {
      setProjectStatus("Select a chord event");
      return;
    }

    setChordClipboard({ ...source });
    setProjectStatus(`Copied ${source.root}${source.quality} chord`);
  }

  function pasteCopiedChord(): void {
    const clipboard = chordClipboard;
    if (!clipboard) {
      setProjectStatus("Copy a chord first");
      return;
    }

    let nextSelectedIndex: number | null = null;
    let rejectedStatus = "";
    const changed = updateCurrentPattern((pattern) => {
      const nextStep = nextEmptyChordStep(pattern.chordEvents, clipboard.step);
      if (nextStep === null) {
        rejectedStatus = "No empty step for pasted chord";
        return pattern;
      }
      const pastedChord: ChordEvent = { ...clipboard, step: nextStep };
      const chordEvents = sortChordEvents([...pattern.chordEvents, pastedChord]);
      nextSelectedIndex = findChordEventIndex(chordEvents, pastedChord);
      return {
        ...pattern,
        chordEvents
      };
    }, "Pasted chord event");

    if (changed) {
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    } else if (rejectedStatus) {
      setProjectStatus(rejectedStatus);
    }
  }

  function duplicateSelectedChord(): void {
    if (selectedChordIndex === null) {
      setProjectStatus("Select a chord event");
      return;
    }
    let nextSelectedIndex: number | null = null;
    let rejectedStatus = "";
    const changed = updateCurrentPattern((pattern) => {
      const source = pattern.chordEvents[selectedChordIndex];
      if (!source) {
        return pattern;
      }
      const nextStep = nextEmptyChordStep(pattern.chordEvents, source.step);
      if (nextStep === null) {
        rejectedStatus = "No empty step for duplicate chord";
        return pattern;
      }
      const duplicate: ChordEvent = { ...source, step: nextStep };
      const chordEvents = sortChordEvents([...pattern.chordEvents, duplicate]);
      nextSelectedIndex = findChordEventIndex(chordEvents, duplicate);
      return {
        ...pattern,
        chordEvents
      };
    }, "Duplicated chord event");
    if (changed) {
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    } else if (rejectedStatus) {
      setProjectStatus(rejectedStatus);
    }
  }

  function duplicateSelectedChordToStep(step: number): void {
    if (selectedChordIndex === null) {
      setProjectStatus("Select a chord event");
      return;
    }

    const nextStep = clampStepStart(step);
    let nextSelectedIndex: number | null = null;
    let rejectedStatus = "";
    const changed = updateCurrentPattern((pattern) => {
      const source = pattern.chordEvents[selectedChordIndex];
      if (!source) {
        rejectedStatus = "Select a chord event";
        return pattern;
      }
      if (nextStep === source.step || nextStep % 4 !== 0 || nextStep > steps.length - clampStepLength(source.length)) {
        rejectedStatus = "No beat-grid duplicate step";
        return pattern;
      }
      if (pattern.chordEvents.some((chord) => chord.step === nextStep)) {
        rejectedStatus = "Target chord step already exists";
        return pattern;
      }
      const duplicate: ChordEvent = { ...source, step: nextStep };
      const chordEvents = sortChordEvents([...pattern.chordEvents, duplicate]);
      nextSelectedIndex = findChordEventIndex(chordEvents, duplicate);
      return {
        ...pattern,
        chordEvents
      };
    }, "Duplicated chord on beat");
    if (changed) {
      setSelectedChordIndex(nextSelectedIndex);
      setSelectedNote(null);
      setSelectedDrumStep(null);
    } else if (rejectedStatus) {
      setProjectStatus(rejectedStatus);
    }
  }

  function moveSelectedChordInversion(direction: -1 | 1): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }
    const inversionIndex = chordInversions.indexOf(normalizeChordInversion(selectedChord.inversion));
    const nextInversion = chordInversions[inversionIndex + direction];
    if (nextInversion === undefined) {
      setProjectStatus(direction < 0 ? "Chord is already root voicing" : "Chord is at top voicing");
      return;
    }
    updateChordEvent(
      selectedChordIndex,
      { inversion: nextInversion },
      direction < 0 ? "Moved chord voicing down" : "Moved chord voicing up"
    );
  }

  function resetSelectedChordInversion(): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }
    if (normalizeChordInversion(selectedChord.inversion) === 0) {
      setProjectStatus("Chord is already root voicing");
      return;
    }
    updateChordEvent(selectedChordIndex, { inversion: 0 }, "Reset chord voicing");
  }

  function updateSelectedChordRoot(root: string): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }

    updateChordEvent(
      selectedChordIndex,
      { root },
      "Edited chord root"
    );
  }

  function updateSelectedChordQuality(quality: ChordQuality): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }

    updateChordEvent(
      selectedChordIndex,
      { quality },
      "Edited chord quality"
    );
  }

  function updateSelectedChordLength(length: number): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }

    updateChordEvent(
      selectedChordIndex,
      { length: clampStepLength(length) },
      "Edited chord length"
    );
  }

  function updateSelectedChordVelocity(velocity: number): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }

    updateChordEvent(
      selectedChordIndex,
      { velocity: clampVelocity(velocity) },
      "Edited chord velocity"
    );
  }

  function updateSelectedChordProbability(probability: number): void {
    if (selectedChordIndex === null || !selectedChord) {
      setProjectStatus("Select a chord event");
      return;
    }

    updateChordEvent(
      selectedChordIndex,
      { probability: normalizeEventProbability(probability) },
      "Edited chord chance"
    );
  }

  function togglePlayback(): void {
    if (isPlaying) {
      controllerRef.current?.stop();
      controllerRef.current = null;
      setPlaybackPosition(null);
      return;
    }

    if (transportLoopScope === "transition" && !arrangementTransitionLoopTarget) {
      setProjectStatus("Transition loop unavailable");
      return;
    }

    try {
      setIsPlaying(true);
      controllerRef.current = startRealtimePlayback(project, {
        mode: transportLoopMode,
        bars: transportLoopBars,
        startBar: transportLoopStartBar,
        getProject: () => projectRef.current,
        onStep: setPlaybackPosition,
        onStop: () => {
          controllerRef.current = null;
          setPlaybackPosition(null);
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error(error);
      setIsPlaying(false);
      setPlaybackPosition(null);
    }
  }

  async function handleSaveProject(): Promise<void> {
    const contents = serializeProjectFile(project);
    const defaultName = projectFileName(project);

    try {
      const result = await window.grooveforge?.saveProject?.(contents, defaultName);
      if (result) {
        if (result.canceled) {
          setProjectFileResult(null);
          setLocalDraftRecoveryResult(null);
          setProjectStatus("Save canceled");
          return;
        }

        const fileLabel = fileDisplayName(result.filePath);
        clearLocalDraftState();
        setProjectFileLabel(fileLabel);
        setProjectHasUnsavedChanges(false);
        setLocalDraftRecoveryResult(null);
        setProjectFileResult(createProjectFileResult("save", fileLabel, project));
        setProjectStatus(`Saved ${fileLabel}`);
        return;
      }

      downloadProjectFile(contents, defaultName);
      clearLocalDraftState();
      setProjectFileLabel(defaultName);
      setProjectHasUnsavedChanges(false);
      setLocalDraftRecoveryResult(null);
      setProjectFileResult(createProjectFileResult("download", defaultName, project));
      setProjectStatus(`Downloaded ${defaultName}`);
    } catch (error) {
      console.error(error);
      setProjectFileResult(null);
      setLocalDraftRecoveryResult(null);
      setProjectStatus("Save failed");
    }
  }

  async function handleOpenProject(): Promise<void> {
    try {
      const result = await window.grooveforge?.openProject?.();
      if (result) {
        if (result.canceled || !result.contents) {
          setProjectFileResult(null);
          setLocalDraftRecoveryResult(null);
          setProjectStatus("Open canceled");
          return;
        }
        loadProjectText(result.contents, fileDisplayName(result.filePath), "open");
        return;
      }

      setProjectFileResult(null);
      setLocalDraftRecoveryResult(null);
      importInputRef.current?.click();
    } catch (error) {
      console.error(error);
      setProjectFileResult(null);
      setLocalDraftRecoveryResult(null);
      setProjectStatus("Open failed");
    }
  }

  function handleImportFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) {
      setProjectFileResult(null);
      setLocalDraftRecoveryResult(null);
      return;
    }

    void file
      .text()
      .then((contents) => loadProjectText(contents, file.name, "import"))
      .catch((error: unknown) => {
        console.error(error);
        setProjectFileResult(null);
        setLocalDraftRecoveryResult(null);
        setProjectStatus("Open failed");
      });
  }

  function createLocalDraftRecoveryResult(
    action: LocalDraftRecoveryResult["action"],
    recovery: LocalDraftRecovery,
    resultProject: ProjectState
  ): LocalDraftRecoveryResult {
    const savedLabel = formatLocalDraftSavedAt(recovery.savedAt);
    const status = action === "restore" ? "Restored" : "Cleared";
    const title =
      action === "restore" ? `Restored local draft: ${resultProject.title}` : `Cleared local draft: ${savedLabel}`;
    const safetyCue =
      action === "restore"
        ? "The recovered draft is now the editable project; save a durable file copy when ready."
        : "Only the renderer-local recovery copy was cleared; the current project and saved files were not deleted.";
    const nextCheck =
      action === "restore"
        ? `Play Pattern ${resultProject.selectedPattern}; confirm the recovered beat before continuing.`
        : "Keep composing or save the current project if it needs durable protection.";

    return {
      action,
      targetId: `${action}-${recovery.savedAt}`,
      status,
      title,
      detail: `${resultProject.title} / ${barCountLabel(arrangementTotalBars(resultProject))}`,
      metricLabel: action === "restore" ? "Recovered project" : "Cleared draft",
      metricValue: `${projectEventTotal(resultProject)} events / ${recovery.characterCount.toLocaleString()} chars`,
      safetyCue,
      nextCheck,
      tone: "good"
    };
  }

  function createProjectFileResult(
    action: ProjectFileResult["action"],
    fileLabel: string,
    resultProject: ProjectState
  ): ProjectFileResult {
    const statusByAction: Record<ProjectFileResult["action"], ProjectFileResult["status"]> = {
      save: "Saved",
      download: "Downloaded",
      open: "Loaded",
      import: "Imported"
    };
    const titleAction: Record<ProjectFileResult["action"], string> = {
      save: "Saved project",
      download: "Downloaded project",
      open: "Opened project",
      import: "Imported project"
    };
    const safetyCue =
      action === "save" || action === "download"
        ? "Local draft recovery was cleared after this durable project copy."
        : "Loaded file is now current; undo and redo history were reset for this project.";
    const nextCheck =
      action === "save" || action === "download"
        ? "Keep composing; save again after the next meaningful edit."
        : `Play Pattern ${resultProject.selectedPattern}; confirm the loaded beat before editing.`;

    return {
      action,
      targetId: `${action}-${fileLabel}`,
      status: statusByAction[action],
      title: `${titleAction[action]}: ${fileLabel}`,
      detail: `${resultProject.title} / ${barCountLabel(arrangementTotalBars(resultProject))}`,
      fileLabel,
      metricLabel: "Project",
      metricValue: `${projectEventTotal(resultProject)} events / Pattern ${resultProject.selectedPattern}`,
      safetyCue,
      nextCheck,
      tone: "good"
    };
  }

  function loadProjectText(contents: string, sourceName: string, action: "open" | "import"): void {
    try {
      const nextProject = parseProjectFile(contents);
      controllerRef.current?.stop();
      controllerRef.current = null;
      replaceProject(nextProject, `Loaded ${sourceName}`, sourceName);
      setPlaybackPosition(null);
      setIsPlaying(false);
      setLocalDraftRecoveryResult(null);
      setProjectFileResult(createProjectFileResult(action, sourceName, nextProject));
    } catch (error) {
      console.error(error);
      setProjectFileResult(null);
      setLocalDraftRecoveryResult(null);
      setProjectStatus("Invalid project file");
    }
  }

  function recordHandoffExportReceipt(receipt: HandoffExportReceipt): void {
    setHandoffExportFormatResult(null);
    setHandoffPackageCheckResult(null);
    handoffExportReceiptRef.current = receipt;
    setHandoffExportReceipt(receipt);
  }

  function handleExportWav(): void {
    const fileName = mixWavFileName(project);
    try {
      exportWav(project);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "wav",
          statusLabel: "Exported WAV",
          fileLabel: fileName,
          detailLabel: `${exportAnalysis.status} / ${barCountLabel(arrangementTotalBars(project))}`,
          nextLabel: "Confirm mix download or export stems",
          tone: "good"
        })
      );
      setProjectStatus("Exported mix WAV");
    } catch (error) {
      console.error(error);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "wav",
          statusLabel: "WAV failed",
          fileLabel: fileName,
          detailLabel: "No mix WAV download completed",
          nextLabel: "Review Export Preflight before retry",
          tone: "danger"
        })
      );
      setProjectStatus("WAV export failed");
    }
  }

  function handleExportStems(): void {
    try {
      const fileNames = exportStems(project);
      const audibleStems = audibleStemTracks(stemAnalyses);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "stems",
          statusLabel: "Exported stems",
          fileLabel: `${fileNames.length} stem files`,
          detailLabel: `${audibleStems.length}/${stemTrackIds.length} audible / ${fileNames.join(" / ")}`,
          nextLabel: "Confirm stem downloads or export MIDI",
          tone: "good"
        })
      );
      setProjectStatus(`Exported ${fileNames.length} stems`);
    } catch (error) {
      console.error(error);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "stems",
          statusLabel: "Stems failed",
          fileLabel: "No stem files downloaded",
          detailLabel: `${stemWavFileNames(project).length} expected stem files`,
          nextLabel: "Check stem status before retry",
          tone: "danger"
        })
      );
      setProjectStatus("Stem export failed");
    }
  }

  function handleExportMidi(): void {
    try {
      const fileName = exportMidi(project);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "midi",
          statusLabel: "Exported MIDI",
          fileLabel: fileName,
          detailLabel: `${barCountLabel(arrangementTotalBars(project))} arrangement MIDI`,
          nextLabel: "Confirm MIDI download or export sheet",
          tone: "good"
        })
      );
      setProjectStatus("Exported MIDI");
    } catch (error) {
      console.error(error);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "midi",
          statusLabel: "MIDI failed",
          fileLabel: midiFileName(project),
          detailLabel: "No arrangement MIDI download completed",
          nextLabel: "Review arrangement before retry",
          tone: "danger"
        })
      );
      setProjectStatus("MIDI export failed");
    }
  }

  function handleExportHandoffSheet(): void {
    const fileName = handoffSheetFileName(project);
    try {
      const contents = createHandoffSheet(project, exportAnalysis, stemAnalyses);
      downloadTextFile(contents, fileName);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "sheet",
          statusLabel: "Exported sheet",
          fileLabel: fileName,
          detailLabel: `${sessionBriefFilledFields(project.sessionBrief)}/4 brief fields`,
          nextLabel: "Confirm sheet download with audio files",
          tone: "good"
        })
      );
      setProjectStatus(`Exported ${fileName}`);
    } catch (error) {
      console.error(error);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "sheet",
          statusLabel: "Sheet failed",
          fileLabel: fileName,
          detailLabel: "No Handoff Sheet download completed",
          nextLabel: "Review Session Brief before retry",
          tone: "danger"
        })
      );
      setProjectStatus("Sheet export failed");
    }
  }

  function toggleMetronome(): void {
    updateProject(
      (current) => ({ ...current, metronomeEnabled: !current.metronomeEnabled }),
      projectRef.current.metronomeEnabled ? "Metronome off" : "Metronome on"
    );
  }

  function switchProjectMode(mode: ProjectState["mode"]): void {
    const beforeProject = projectRef.current;
    const changed = updateProject(
      (current) => (current.mode === mode ? current : { ...current, mode }),
      `Switched to ${modeLabel(mode)} mode`
    );
    const afterProject = projectRef.current;
    const afterExportAnalysis = analyzeExport(afterProject);
    const afterStemAnalyses = analyzeStemExports(afterProject);
    const afterBeatReadinessChecks = createBeatReadinessChecks(afterProject, afterExportAnalysis);
    const afterBeatMap = createBeatMapSummary(afterProject, afterBeatReadinessChecks, afterExportAnalysis, afterStemAnalyses);
    const afterReviewQueue = createReviewQueueSummary(
      afterProject,
      afterBeatReadinessChecks,
      afterExportAnalysis,
      afterStemAnalyses
    );
    const afterFinishChecklist = createFinishChecklistSummary(
      afterProject,
      afterBeatReadinessChecks,
      afterExportAnalysis,
      afterStemAnalyses
    );
    const afterExportPreflight = createExportPreflightSummary(
      afterProject,
      afterBeatReadinessChecks,
      afterExportAnalysis,
      afterStemAnalyses
    );
    const afterWorkflowItems = createWorkflowNavigatorItems(afterProject, afterBeatMap, afterExportPreflight, afterExportAnalysis);
    const afterFirstBeatPath = createFirstBeatPathSummary(
      afterProject,
      getStyle(afterProject),
      afterWorkflowItems,
      afterBeatMap,
      afterExportPreflight,
      afterExportAnalysis
    );
    const afterComposerGuide = createComposerGuideSummary(
      afterProject,
      afterBeatReadinessChecks,
      afterExportAnalysis,
      afterStemAnalyses
    );
    const afterModeFocus = createModeFocusSummary(
      afterProject,
      afterComposerGuide,
      afterBeatMap,
      afterReviewQueue,
      afterFinishChecklist
    );
    const afterSessionPass = createSessionPassSummary(
      afterProject,
      afterFirstBeatPath,
      afterReviewQueue,
      afterFinishChecklist,
      afterExportPreflight
    );

    setModeSwitchResult(
      createModeSwitchResult(mode, beforeProject, afterProject, afterModeFocus, afterSessionPass, afterFirstBeatPath, changed)
    );
    if (!changed) {
      setProjectStatus(`${modeLabel(mode)} mode already active`);
    }
  }

  function applyProjectKey(key: string): void {
    const changed = updateProject((current) => retargetProjectKey(current, key), `Retargeted project to ${key}`);
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function selectStyle(styleId: ProjectState["styleId"]): void {
    const nextStyle = styleProfiles.find((candidate) => candidate.id === styleId);
    if (!nextStyle) {
      return;
    }
    updateProject(
      (current) => {
        const soundPreset = styleSoundPreset(styleId);
        return {
          ...current,
          styleId,
          selectedPattern: "A",
          bpm: nextStyle.defaultBpm,
          swing: nextStyle.defaultSwing,
          sound: soundPresetDesign(soundPreset),
          patterns: createStylePatternSet(styleId, current.key)
        };
      },
      `Applied ${nextStyle.name} groove`
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(0);
  }

  function applySelectedBeatBlueprint(blueprintId: BeatBlueprintId): void {
    const blueprint = beatBlueprints.find((candidate) => candidate.id === blueprintId);
    const beforeProject = projectRef.current;
    setBeatBlueprintPreviewId(blueprintId);
    const changed = updateProject(
      (current) => applyBeatBlueprint(current, blueprintId),
      blueprint ? `Applied ${blueprint.name} blueprint` : "Applied beat blueprint"
    );
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(0);
      setSelectedArrangementIndex(0);
      selectTransportLoopScope("arrangement", false);
      if (blueprint) {
        setBeatBlueprintResult(createBeatBlueprintResult(blueprint, beforeProject, projectRef.current));
      }
    } else {
      setBeatBlueprintResult(null);
    }
  }

  function previewBeatBlueprint(blueprintId: BeatBlueprintId): void {
    setBeatBlueprintPreviewId(blueprintId);
  }

  function cueBeatBlueprintPreview(scope: Extract<TransportLoopScope, "arrangement" | "pattern">): void {
    if (isPlaying) {
      setProjectStatus("Stop playback before cueing Beat Blueprint preview");
      return;
    }
    selectTransportLoopScope(scope, false);
    setProjectStatus(`Beat Blueprint preview cued as ${transportLoopLabel(scope)} loop`);
  }

  function focusBeatBlueprintsPanel(): void {
    beatBlueprintPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }

  function applyQuickActionBeatBlueprint(blueprintId: BeatBlueprintId): void {
    applySelectedBeatBlueprint(blueprintId);
    focusBeatBlueprintsPanel();
  }

  function previewQuickActionBeatBlueprint(blueprintId: BeatBlueprintId): void {
    previewBeatBlueprint(blueprintId);
    focusBeatBlueprintsPanel();
  }

  function selectDeliveryTarget(targetId: DeliveryTargetId): void {
    const target = deliveryTargetForId(targetId, projectRef.current.customDeliveryTarget);
    updateProject((current) => {
      const resolvedTarget = deliveryTargetForId(targetId, current.customDeliveryTarget);
      if (current.deliveryTarget === resolvedTarget.id) {
        return current;
      }
      return { ...current, deliveryTarget: resolvedTarget.id };
    }, `Set ${target.name} target`);
  }

  function alignDeliveryTarget(targetId: DeliveryTargetId): void {
    const target = deliveryTargetForId(targetId, projectRef.current.customDeliveryTarget);
    const beforeProject = projectRef.current;
    const changed = updateProject((current) => {
      const nextProject = applyDeliveryTarget(current, target.id);
      return deliveryTargetAlignmentChangedCount(current, nextProject) === 0 ? current : nextProject;
    }, `Aligned ${target.name} target`);
    if (!changed) {
      setDeliveryTargetAlignmentResult(null);
      setProjectStatus(`${target.name} target already aligned`);
      return;
    }

    setSelectedArrangementIndex(0);
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    selectTransportLoopScope("arrangement", false);
    setDeliveryTargetAlignmentResult(createDeliveryTargetAlignmentResult(target, beforeProject, projectRef.current));
  }

  function updateCustomDeliveryTarget(update: Partial<CustomDeliveryTarget>): void {
    const preview = {
      ...projectRef.current.customDeliveryTarget,
      ...update
    };
    updateProject((current) => {
      const nextTarget = {
        ...current.customDeliveryTarget,
        ...update
      };
      if (sameCustomDeliveryTarget(current.customDeliveryTarget, nextTarget)) {
        return current;
      }
      return {
        ...current,
        customDeliveryTarget: nextTarget
      };
    }, `Updated ${deliveryTargetForId("custom", preview).name} target`);
  }

  function updateSessionBrief(field: keyof SessionBrief, value: string): void {
    const maxLength = field === "notes" ? maxSessionBriefNotesLength : maxSessionBriefFieldLength;
    const nextValue = boundedSessionBriefText(value, maxLength);
    updateProject((current) => {
      if (current.sessionBrief[field] === nextValue) {
        return current;
      }
      return {
        ...current,
        sessionBrief: {
          ...current.sessionBrief,
          [field]: nextValue
        }
      };
    }, `Updated ${sessionBriefFieldLabel(field)} brief`);
  }

  function applySessionBriefStarterPad(padId: SessionBriefStarterPadId): void {
    const pad = sessionBriefStarterPadDefinitions.find((definition) => definition.id === padId);
    if (!pad) {
      setSessionBriefStarterResult(null);
      setSessionBriefCompassResult(null);
      setProjectStatus("Session Brief starter not found");
      return;
    }

    setSessionBriefCompassResult(null);
    const beforeProject = projectRef.current;
    const changed = updateProject((current) => {
      const starterBrief = createSessionBriefStarterBrief(current, pad.id);
      const sessionBrief = applySessionBriefStarter(current.sessionBrief, starterBrief);
      return sameSessionBrief(current.sessionBrief, sessionBrief) ? current : { ...current, sessionBrief };
    }, `Applied ${pad.label} brief starter`);

    if (changed) {
      setSessionBriefStarterResult(
        createSessionBriefStarterResult(pad, beforeProject.sessionBrief, projectRef.current.sessionBrief, projectRef.current)
      );
    } else {
      setSessionBriefStarterResult(null);
      setProjectStatus(`${pad.label} brief starter already covered`);
    }
  }

  function clearSessionBrief(): void {
    setSessionBriefCompassResult(null);
    updateProject((current) => {
      if (sessionBriefFilledFields(current.sessionBrief) === 0) {
        return current;
      }
      return {
        ...current,
        sessionBrief: { ...defaultSessionBrief }
      };
    }, "Cleared session brief");
  }

  function focusSessionBriefCompassCard(card: SessionBriefCompassCard): void {
    const target = sessionBriefCompassFocusTarget(card, projectRef.current.sessionBrief);
    const fieldRefs: Record<keyof SessionBrief, HTMLElement | null> = {
      artist: sessionBriefArtistRef.current,
      vibe: sessionBriefVibeRef.current,
      reference: sessionBriefReferenceRef.current,
      notes: sessionBriefNotesRef.current
    };

    setSessionBriefCompassFocusId(card.id);
    setSessionBriefCompassResult(createSessionBriefCompassFocusResult(card, sessionBriefCompassSummary, projectRef.current.sessionBrief));
    if (target === "deliver") {
      deliverPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    } else {
      const field = fieldRefs[target];
      field?.scrollIntoView({ block: "center", behavior: "auto" });
      field?.focus({ preventScroll: true });
    }
    setProjectStatus(`Brief ${card.label}: ${card.value}`);
  }

  function focusReferenceAlignmentCard(card: ReferenceAlignmentCard): void {
    const fieldRefs: Record<keyof SessionBrief, HTMLElement | null> = {
      artist: sessionBriefArtistRef.current,
      vibe: sessionBriefVibeRef.current,
      reference: sessionBriefReferenceRef.current,
      notes: sessionBriefNotesRef.current
    };
    const panelRefs: Record<"arrange" | "master" | "deliver", HTMLElement | null> = {
      arrange: arrangePanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    setReferenceAlignmentFocusId(card.id);
    if (card.focusTarget === "arrange" || card.focusTarget === "master" || card.focusTarget === "deliver") {
      panelRefs[card.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    } else {
      const field = fieldRefs[card.focusTarget];
      field?.scrollIntoView({ block: "center", behavior: "auto" });
      field?.focus({ preventScroll: true });
    }
    setReferenceAlignmentResult(createReferenceAlignmentFocusResult(card, referenceAlignmentSummary));
    setProjectStatus(`Reference Alignment ${card.label}: ${card.value}`);
  }

  function focusMixCoachCheck(check: MixCoachCheck): void {
    const currentChecks = createMixCoachChecks(exportAnalysis, stemAnalyses);
    const currentCheck = currentChecks.find((candidate) => candidate.id === check.id) ?? check;
    setMixCoachFocusId(check.id);
    setMixCoachResult(createMixCoachFocusResult(currentCheck, currentChecks));
    masterPanelRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
    setProjectStatus(`Review ${currentCheck.label}: ${currentCheck.status}`);
  }

  function focusMixCoach(): MixCoachCheck | null {
    const check = mixCoachFocusCheck(createMixCoachChecks(exportAnalysis, stemAnalyses));
    if (check) {
      focusMixCoachCheck(check);
    } else {
      setMixCoachFocusId(null);
      setMixCoachResult(null);
      masterPanelRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
    }
    return check;
  }

  function focusMasterOutputRole(): void {
    const summary = createMasterOutputRoleSummary(projectRef.current, analyzeExport(projectRef.current));
    masterPanelRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
    setProjectStatus(`Master Output Role: ${summary.roleLabel} / ${summary.detailLabel}`);
  }

  function focusExportMeter(): void {
    const currentProject = projectRef.current;
    const analysis = analyzeExport(currentProject);
    masterPanelRef.current?.scrollIntoView({ block: "center", behavior: "auto" });
    setProjectStatus(`Export Meter: ${analysis.status} / ${formatDb(analysis.headroomDb)} headroom`);
  }

  function runNextMove(action: NextMoveAction): void {
    const beforeProject = projectRef.current;
    switch (action.command.kind) {
      case "blueprint":
        applySelectedBeatBlueprint(action.command.blueprintId);
        break;
      case "patternFill":
        applyPatternFill(action.command.preset);
        break;
      case "arrangementMove":
        applyArrangementMoveToSelected(action.command.preset);
        break;
      case "patternChain":
        applyPatternChain(action.command.chain);
        break;
      case "chainExpand":
        expandPatternChain();
        break;
      case "arrangementTemplate":
        applyArrangementTemplate(action.command.template);
        break;
      case "deliveryTarget":
        alignDeliveryTarget(action.command.target);
        break;
      case "masterFinish":
        applyMasterFinishPad(action.command.pad);
        break;
      case "snapshot":
        saveCurrentSnapshot();
        break;
      case "reviewMix":
        {
          const check = focusMixCoach();
          setProjectStatus(check ? `Review ${check.label}` : "Review Mix Coach");
        }
        break;
    }
    setNextMoveResult(createNextMoveResult(action, beforeProject, projectRef.current));
  }

  function runComposerAction(action: ComposerAction): void {
    const beforeProject = projectRef.current;
    switch (action.command.kind) {
      case "blueprint":
        applySelectedBeatBlueprint(action.command.blueprintId);
        break;
      case "drumFoundation":
        applyDrumFoundation(action.command.foundation);
        break;
      case "bassline":
        applyBasslinePad(action.command.pad);
        break;
      case "chordProgression":
        applyChordProgressionPreset(action.command.preset);
        break;
      case "melodyMotif":
        applyMelodyMotif(action.command.motif);
        break;
      case "patternFill":
        applyPatternFill(action.command.preset);
        break;
      case "patternChain":
        applyPatternChain(action.command.chain);
        break;
      case "arrangementTemplate":
        applyArrangementTemplate(action.command.template);
        break;
      case "masterFinish":
        applyMasterFinishPad(action.command.pad);
        break;
    }
    setComposerActionResult(createComposerActionResult(action, beforeProject, projectRef.current));
  }

  function jumpToWorkflowZone(zone: WorkflowZoneId): void {
    const targetRefs: Record<WorkflowZoneId, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      deliver: deliverPanelRef.current
    };

    targetRefs[zone]?.scrollIntoView({ block: "start", behavior: "auto" });
  }

  function jumpToWorkflowNavigatorItem(item: WorkflowNavigatorItem): void {
    jumpToWorkflowZone(item.id);
    setWorkflowNavigatorResult(createWorkflowNavigatorJumpResult(item, workflowNavigatorItems));
    setProjectStatus(`Workflow ${item.label}: ${item.value}`);
  }

  function focusBeatReadinessCheck(check: BeatReadinessCheck): void {
    const targetRefs: Record<BeatReadinessFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    setBeatReadinessFocusId(check.id);
    targetRefs[check.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setBeatReadinessResult(createBeatReadinessFocusResult(check, beatReadinessChecks));
    setProjectStatus(`Beat Readiness ${check.label}: ${check.status}`);
  }

  function jumpToFirstBeatPathTarget(target: FirstBeatPathTarget): void {
    if (target === "transport") {
      transportPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
      return;
    }

    jumpToWorkflowZone(target);
  }

  function jumpToFirstBeatPathStep(step: FirstBeatPathStep): void {
    jumpToFirstBeatPathTarget(step.target);
    setFirstBeatPathResult(createFirstBeatPathJumpResult(step, firstBeatPathSummary));
    setProjectStatus(`First Beat Path ${step.label}: ${step.jumpLabel}`);
  }

  function jumpToBeatSpineTarget(card: BeatSpineCard): void {
    const targetRefs: Record<BeatSpineTarget, HTMLElement | null> = {
      transport: transportPanelRef.current,
      compose: composePanelRef.current,
      sound: soundPanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    targetRefs[card.target]?.scrollIntoView({ block: "start", behavior: "auto" });
    setBeatSpineJumpResult(createBeatSpineJumpResult(card, beatSpineSummary));
    setBeatSpineResult(null);
    setProjectStatus(`Beat Spine ${card.label}: ${card.value}`);
  }

  function applyBeatSpineAction(action: BeatSpineAction): void {
    const beforeProject = projectRef.current;
    switch (action.id) {
      case "drums":
        applyLayerStarter("drums");
        break;
      case "bass":
        applyLayerStarter("bass");
        break;
      case "harmony":
        applyLayerStarter("chords");
        break;
      case "melody":
        applyLayerStarter("melody");
        break;
      case "sound": {
        const soundPreset = styleSoundPreset(projectRef.current.styleId);
        applySoundPreset(soundPreset);
        break;
      }
      case "arrange":
        applyPatternChain("eight_bar");
        break;
      case "finish":
        applyMasterFinishPad(suggestedMasterFinishPad(projectRef.current), { showResult: true });
        break;
    }
    setBeatSpineJumpResult(null);
    setBeatSpineResult(createBeatSpineApplyResult(action, beforeProject, projectRef.current));
  }

  function focusBeatPassportMetric(metric: BeatPassportFocusItem): void {
    const targetRefs: Record<BeatPassportFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    setBeatPassportFocusId(metric.focusId);
    targetRefs[metric.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setBeatPassportResult(createBeatPassportFocusResult(metric, beatPassportSummary));
    setProjectStatus(`Passport ${metric.label}: ${metric.value}`);
  }

  function focusProductionSnapshotMetric(metric: ProductionSnapshotFocusItem): void {
    const targetRefs: Record<ProductionSnapshotFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      deliver: deliverPanelRef.current
    };

    setProductionSnapshotFocusId(metric.focusId);
    targetRefs[metric.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setProductionSnapshotResult(createProductionSnapshotFocusResult(metric, productionSnapshotSummary));
    setProjectStatus(`Snapshot ${metric.label}: ${metric.value}`);
  }

  function focusSnapshotCompareMetric(item: SnapshotCompareFocusItem): void {
    const targetRefs: Record<SnapshotCompareFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    setSnapshotCompareFocusId(item.focusId);
    targetRefs[item.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setSnapshotCompareResult(createSnapshotCompareFocusResult(item, snapshotCompareSummary));
    setProjectStatus(`Snapshot Compare ${item.cardName} ${item.label}: ${item.value}`);
  }

  function focusHookReadinessCard(card: HookReadinessFocusItem): void {
    const targetRefs: Record<ReviewQueueFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    setHookReadinessFocusId(card.focusId);
    targetRefs[card.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setHookReadinessResult(createHookReadinessFocusResult(card, hookReadinessSummary));
    setProjectStatus(`Hook ${card.label}: ${card.value}`);
  }

  function focusToplineSpaceCard(card: ToplineSpaceFocusItem): void {
    const targetRefs: Record<ReviewQueueFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    setToplineSpaceFocusId(card.focusId);
    targetRefs[card.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setToplineSpaceResult(createToplineSpaceFocusResult(card, toplineSpaceSummary));
    setProjectStatus(`Topline ${card.label}: ${card.value}`);
  }

  function focusArrangementMuteMapLane(lane: ArrangementMuteMapLane): void {
    setArrangementMuteMapFocusId(lane.id);
    arrangePanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setArrangementMuteMapResult(createArrangementMuteMapFocusResult(lane, arrangementMuteMapSummary));
    setProjectStatus(`Mute Map ${lane.label}: ${lane.value}`);
  }

  function focusArrangementTransitionMapTransition(transition: ArrangementTransitionMapTransition): void {
    setArrangementTransitionMapFocusId(transition.id);
    arrangePanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setArrangementTransitionMapResult(createArrangementTransitionMapFocusResult(transition, arrangementTransitionMapSummary));
    setProjectStatus(`Transition ${transition.fromIndex + 1}->${transition.toIndex + 1}: ${transition.status}`);
  }

  function focusModeFocusCard(card: ModeFocusCard): void {
    const targetRefs: Record<ReviewQueueFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    targetRefs[card.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setModeFocusResult(createModeFocusJumpResult(card, modeFocusSummary));
    setProjectStatus(`Mode ${card.label}: ${card.value}`);
  }

  function focusSessionPassCard(card: SessionPassCard): void {
    const targetRefs: Record<SessionPassTarget, HTMLElement | null> = {
      transport: transportPanelRef.current,
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    targetRefs[card.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setSessionPassResult(createSessionPassFocusResult(card, sessionPassSummary));
    setProjectStatus(`Session Pass ${card.label}: ${card.value}`);
  }

  function focusComposerGuideCard(card: ComposerGuideCard): void {
    const targetRefs: Record<ReviewQueueFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    setComposerGuideFocusId(card.id);
    targetRefs[card.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setComposerGuideResult(createComposerGuideFocusResult(card, composerGuideSummary));
    setProjectStatus(`Guide ${card.label}: ${card.status}`);
  }

  function focusKeyCompassItem(item: KeyCompassFocusItem): void {
    const targetRefs: Record<KeyCompassFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current
    };

    setKeyCompassFocusId(item.focusId);
    targetRefs[item.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setKeyCompassResult(createKeyCompassFocusResult(item, keyCompassSummary));
    setProjectStatus(`Key ${item.label}: ${item.value}`);
  }

  function focusGrooveCompassItem(item: GrooveCompassFocusItem): void {
    const targetRefs: Record<GrooveCompassFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current
    };

    setGrooveCompassFocusId(item.focusId);
    targetRefs[item.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setGrooveCompassResult(createGrooveCompassFocusResult(item, grooveCompassSummary));
    setProjectStatus(`Groove ${item.label}: ${item.value}`);
  }

  function focusPatternDnaCard(card: PatternDnaCard): void {
    const targetRefs: Record<PatternDnaFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current
    };

    setPatternDnaFocusId(card.id);
    targetRefs[card.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setPatternDnaResult(createPatternDnaFocusResult(card, patternDnaSummary));
    setProjectStatus(`Pattern DNA ${card.label}: ${card.value}`);
  }

  function focusListeningPassItem(item: ListeningPassItem): void {
    const targetRefs: Record<ListeningPassTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    setListeningPassFocusId(item.id);
    targetRefs[item.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setListeningPassResult(createListeningPassFocusResult(item, listeningPassSummary));
    setProjectStatus(`Listening ${item.label}: ${item.status}`);
  }

  function focusStyleInspectorItem(item: StyleInspectorFocusItem): void {
    const targetRefs: Record<StyleInspectorFocusTarget, HTMLElement | null> = {
      transport: transportPanelRef.current,
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      sound: soundPanelRef.current
    };

    setStyleInspectorFocusId(item.focusId);
    targetRefs[item.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setStyleInspectorResult(createStyleInspectorFocusResult(item, styleInspectorSummary));
    setProjectStatus(`Style ${item.label}: ${item.value}`);
  }

  function focusStyleDirectionReadout(): void {
    styleInspectorRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `Style Direction ${style.name}: ${styleDirectionCurrentSummary(project)} / ${styleDirectionTargetSummary(project.styleId)}`
    );
  }

  function focusTimbreCheck(): void {
    soundPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(`Timbre Check ${soundTimbreCheckSummary.statusLabel}: ${soundTimbreCheckSummary.balanceLabel}`);
  }

  function focusFinishChecklistCard(card: FinishChecklistCard): void {
    const targetRefs: Record<ReviewQueueFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    setFinishChecklistFocusId(card.id);
    targetRefs[card.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setFinishChecklistResult(createFinishChecklistFocusResult(card, finishChecklistSummary));
    setProjectStatus(`Finish ${card.label}: ${card.status}`);
  }

  function focusExportPreflightCard(card: ExportPreflightFocusItem): void {
    const targetRefs: Record<ExportPreflightFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };

    setExportPreflightFocusId(card.focusId);
    targetRefs[card.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setExportPreflightResult(createExportPreflightFocusResult(card, exportPreflightSummary));
    setProjectStatus(`Preflight ${card.label}: ${card.value}`);
  }

  function focusHandoffPack(): void {
    const currentItems = createHandoffPackItems({
      analysis: exportAnalysis,
      project,
      stemAnalyses,
      onExportHandoffSheet: handleExportHandoffSheet,
      onExportMidi: handleExportMidi,
      onExportStems: handleExportStems,
      onExportWav: handleExportWav
    });
    const currentTone = weakestTone(currentItems.map((item) => item.tone));
    const currentRoute = createHandoffPackRouteSummary(project, stemAnalyses, currentItems, currentTone);
    const currentSendOrder = createHandoffPackSendOrderSummary(project, currentItems);
    const currentReceipt = handoffExportReceipt ?? emptyHandoffExportReceipt();
    const currentManifest = createHandoffFileManifest(project, stemAnalyses, currentItems);
    const currentAudit = createHandoffManifestAudit(
      project,
      currentItems,
      currentManifest,
      currentReceipt,
      currentSendOrder
    );

    deliverPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `Handoff Pack ${currentRoute.statusLabel}: ${currentRoute.detailLabel} / ${currentAudit.statusLabel} / ${currentSendOrder.nextLabel}`
    );
  }

  function focusHandoffPackageCheckCard(card: HandoffPackageCheckCard): void {
    setHandoffPackageCheckFocusId(card.focusId);
    deliverPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setHandoffPackageCheckResult(createHandoffPackageCheckFocusResult(card, handoffPackageCheckSummary));
    setProjectStatus(`Package ${card.label}: ${card.value}`);
  }

  function focusHandoffManifestAudit(): void {
    const currentItems = createHandoffPackItems({
      analysis: exportAnalysis,
      project,
      stemAnalyses,
      onExportHandoffSheet: handleExportHandoffSheet,
      onExportMidi: handleExportMidi,
      onExportStems: handleExportStems,
      onExportWav: handleExportWav
    });
    const currentSendOrder = createHandoffPackSendOrderSummary(project, currentItems);
    const currentReceipt = handoffExportReceipt ?? emptyHandoffExportReceipt();
    const currentManifest = createHandoffFileManifest(project, stemAnalyses, currentItems);
    const currentAudit = createHandoffManifestAudit(project, currentItems, currentManifest, currentReceipt, currentSendOrder);

    deliverPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(`Manifest ${currentAudit.statusLabel}: ${currentAudit.detailLabel}`);
  }

  function focusHandoffExportFormatMetric(metric: HandoffExportFormatMetric): void {
    const currentItems = createHandoffPackItems({
      analysis: exportAnalysis,
      project,
      stemAnalyses,
      onExportHandoffSheet: handleExportHandoffSheet,
      onExportMidi: handleExportMidi,
      onExportStems: handleExportStems,
      onExportWav: handleExportWav
    });
    const currentSummary = createHandoffExportFormatSummary(project, exportAnalysis, stemAnalyses, currentItems);
    const currentMetric = currentSummary.metrics.find((candidate) => candidate.id === metric.id) ?? metric;
    setHandoffExportFormatFocusId(currentMetric.id);
    deliverPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setHandoffExportFormatResult(createHandoffExportFormatFocusResult(currentMetric, currentSummary));
    setProjectStatus(`Format ${currentMetric.label}: ${currentMetric.value}`);
  }

  function focusReviewQueueItem(item: ReviewQueueItem): void {
    const targetRefs: Record<ReviewQueueFocusTarget, HTMLElement | null> = {
      compose: composePanelRef.current,
      arrange: arrangePanelRef.current,
      mix: mixPanelRef.current,
      master: masterPanelRef.current,
      deliver: deliverPanelRef.current
    };
    const mixCheckId = item.id.startsWith("mix-") ? item.id.slice(4) : null;

    setReviewQueueFocusId(item.id);
    if (mixCheckId) {
      setMixCoachFocusId(mixCheckId);
    }
    targetRefs[item.focusTarget]?.scrollIntoView({ block: "start", behavior: "auto" });
    setReviewQueueResult(createReviewQueueFocusResult(item, reviewQueueSummary));
    setProjectStatus(`Review ${item.area}: ${item.status}`);
  }

  function applyReviewFix(item?: ReviewQueueItem): void {
    const beforeProject = projectRef.current;
    const beforeAnalysis = analyzeExport(beforeProject);
    const beforeStemAnalyses = analyzeStemExports(beforeProject);
    const beforeSummary = createReviewQueueSummary(
      beforeProject,
      createBeatReadinessChecks(beforeProject, beforeAnalysis),
      beforeAnalysis,
      beforeStemAnalyses
    );
    const targetItem = item ?? activeReviewFixItem(beforeSummary);

    if (!targetItem) {
      setReviewFixResult(null);
      setProjectStatus("Review Queue has no fix target");
      return;
    }

    const fix = createReviewFixOption(targetItem, beforeProject, beforeAnalysis);
    if (!fix) {
      setReviewFixResult(null);
      setProjectStatus("Review Queue item has no fix action");
      return;
    }

    setReviewQueueFocusId(targetItem.id);
    if (targetItem.id.startsWith("mix-")) {
      setMixCoachFocusId(targetItem.id.slice(4));
    }

    switch (fix.action.kind) {
      case "blueprint":
        applyQuickActionBeatBlueprint(fix.action.blueprintId);
        break;
      case "layerStarter":
        applyLayerStarter(fix.action.starter);
        break;
      case "patternChain":
        applyPatternChain(fix.action.chain);
        break;
      case "chainExpand":
        expandPatternChain();
        break;
      case "arrangementTemplate":
        applyArrangementTemplate(fix.action.template);
        break;
      case "arrangementMove": {
        const targetIndex =
          targetItem.id === "structure-hook" || targetItem.id === "structure-arc"
            ? projectRef.current.arrangement.findIndex((block) => block.section === "Hook")
            : selectedArrangementIndex;
        const moveIndex = targetIndex >= 0 ? targetIndex : selectedArrangementIndex;
        const block = projectRef.current.arrangement[moveIndex];
        if (block) {
          const nextBlock = applyArrangementMovePreset(block, fix.action.preset);
          updateArrangementBlock(
            moveIndex,
            { energy: nextBlock.energy, mutedTracks: nextBlock.mutedTracks },
            `${fix.label} Review Fix applied to Block ${moveIndex + 1}`
          );
          setSelectedArrangementIndex(moveIndex);
        }
        break;
      }
      case "deliveryTarget":
        alignDeliveryTarget(fix.action.target);
        break;
      case "mixFix":
        applyMixFixPreset(fix.action.preset);
        break;
      case "masterFinish":
        applyMasterFinishPad(fix.action.pad);
        break;
      case "sessionBriefStarter":
        applySessionBriefStarterPad(fix.action.pad);
        break;
    }

    setReviewFixResult(createReviewFixResult(fix, targetItem.id, beforeProject, projectRef.current));
  }

  function openQuickActions(): void {
    setCommandReferenceOpen(false);
    setQuickActionQuery("");
    setQuickActionSearchHintResult(null);
    setQuickActionSearchResult(null);
    setQuickActionSearchRecoveryResult(null);
    setQuickActionScope("all");
    setQuickActionScopeResult(null);
    setQuickActionsOpen(true);
  }

  function closeQuickActions(): void {
    setQuickActionsOpen(false);
    setQuickActionQuery("");
    setQuickActionSearchHintResult(null);
    setQuickActionSearchResult(null);
    setQuickActionSearchRecoveryResult(null);
    setQuickActionScopeResult(null);
  }

  function openCommandReference(): void {
    setQuickActionsOpen(false);
    setQuickActionQuery("");
    setCommandReferenceOpen(true);
  }

  function closeCommandReference(): void {
    setCommandReferenceOpen(false);
  }

  function runQuickAction(action: QuickAction): void {
    if (action.disabled) {
      return;
    }
    const beforeProject = projectRef.current;
    const inputSetupResult = createQuickActionInputSetupResultState(action, {
      keyboardCaptureEnabled,
      keyboardCaptureTarget,
      keyboardCaptureDefaults,
      keyboardCaptureStepMode,
      midiCaptureStatus,
      midiCaptureArmed,
      midiInputCount: midiInputOptions.length,
      connectedMidiInputCount: midiInputOptions.filter((input) => input.connected).length,
      midiStatusLabel: midiCaptureSummary.statusLabel,
      midiDetailLabel: midiCaptureSummary.detailLabel,
      midiSelectedInputId,
      midiSelectedInputLabel,
      midiLastNoteLabel,
      selectedNote,
      selectedNoteActive: selectedCaptureNoteActive,
      selectedNoteLabel: selectedCaptureNoteLabel
    });
    closeQuickActions();
    try {
      void Promise.resolve(action.run())
        .then(() => {
          const result = createQuickActionResult(
            action,
            beforeProject,
            projectRef.current,
            "complete",
            selectedArrangementIndex,
            handoffExportReceiptRef.current,
            inputSetupResult
          );
          setQuickActionResult(result);
          setQuickActionRecents((recents) => prependQuickActionRecent(recents, action, result));
        })
        .catch((error: unknown) => {
          console.error(error);
          setProjectStatus("Quick action failed");
          const result = createQuickActionResult(
            action,
            beforeProject,
            projectRef.current,
            "failed",
            selectedArrangementIndex,
            handoffExportReceiptRef.current,
            inputSetupResult
          );
          setQuickActionResult(result);
          setQuickActionRecents((recents) => prependQuickActionRecent(recents, action, result));
        });
    } catch (error) {
      console.error(error);
      setProjectStatus("Quick action failed");
      const result = createQuickActionResult(
        action,
        beforeProject,
        projectRef.current,
        "failed",
        selectedArrangementIndex,
        handoffExportReceiptRef.current,
        inputSetupResult
      );
      setQuickActionResult(result);
      setQuickActionRecents((recents) => prependQuickActionRecent(recents, action, result));
    }
  }

  function toggleQuickActionPin(action: QuickAction): void {
    const beforeIds = normalizeQuickActionPinnedIds(quickActionPinnedIds, quickActions);
    const alreadyPinned = beforeIds.includes(action.id);
    const afterIds = alreadyPinned ? beforeIds.filter((id) => id !== action.id) : [action.id, ...beforeIds].slice(0, maxQuickActionPins);
    setQuickActionPinnedIds(afterIds);
    setQuickActionPinnedResult(createQuickActionPinnedResult(alreadyPinned ? "unpin" : "pin", action, beforeIds, afterIds));
    if (alreadyPinned) {
      setInspectedQuickActionPinnedId((inspectedId) => (inspectedId === action.id ? null : inspectedId));
    }
    setProjectStatus(`Quick Action ${alreadyPinned ? "unpinned" : "pinned"}: ${action.title}`);
  }

  function inspectQuickActionPin(actionId: string | null): void {
    setInspectedQuickActionPinnedId(actionId);
    if (!actionId) {
      return;
    }

    const normalizedIds = normalizeQuickActionPinnedIds(quickActionPinnedIds, quickActions);
    const action = quickActions.find((candidate) => candidate.id === actionId);
    if (action) {
      setQuickActionPinnedResult(createQuickActionPinnedResult("inspect", action, normalizedIds, normalizedIds));
    }
  }

  function inspectQuickActionRecent(actionId: string | null): void {
    setInspectedQuickActionRecentId(actionId);
    if (!actionId) {
      return;
    }

    const action = quickActions.find((candidate) => candidate.id === actionId);
    const recent = quickActionRecents.find((candidate) => candidate.actionId === actionId);
    if (action && recent) {
      setQuickActionRecentResult(createQuickActionRecentResult(action, recent));
    }
  }

  function updateQuickActionQuery(query: string): void {
    setQuickActionQuery(query);
    setQuickActionSearchHintResult(null);
    setQuickActionSearchResult(createQuickActionSearchResult(query, quickActionScope, quickActions));
    setQuickActionSearchRecoveryResult(null);
  }

  function selectQuickActionScope(scopeId: QuickActionScopeId): void {
    setQuickActionScope(scopeId);
    setQuickActionSearchHintResult(null);
    setQuickActionScopeResult(createQuickActionScopeResult(scopeId, quickActions, quickActionQuery));
    if (quickActionSearchResult) {
      setQuickActionSearchResult(createQuickActionSearchResult(quickActionQuery, scopeId, quickActions));
    }
    setQuickActionSearchRecoveryResult(null);
  }

  function recoverQuickActionSearchClear(): void {
    const previousQuery = quickActionQuery;
    const nextQuery = "";
    setQuickActionQuery(nextQuery);
    setQuickActionSearchHintResult(null);
    setQuickActionSearchResult(createQuickActionSearchResult(nextQuery, quickActionScope, quickActions));
    setQuickActionSearchRecoveryResult(
      createQuickActionSearchRecoveryResult("clear", previousQuery, quickActionScope, nextQuery, quickActionScope, quickActions)
    );
  }

  function recoverQuickActionSearchScope(scopeId: QuickActionScopeId): void {
    const previousScope = quickActionScope;
    setQuickActionScope(scopeId);
    setQuickActionSearchHintResult(null);
    setQuickActionScopeResult(createQuickActionScopeResult(scopeId, quickActions, quickActionQuery));
    if (quickActionSearchResult) {
      setQuickActionSearchResult(createQuickActionSearchResult(quickActionQuery, scopeId, quickActions));
    }
    setQuickActionSearchRecoveryResult(
      createQuickActionSearchRecoveryResult("scope", quickActionQuery, previousScope, quickActionQuery, scopeId, quickActions)
    );
  }

  function applyQuickActionSearchHint(term: string): void {
    setQuickActionQuery(term);
    setQuickActionSearchHintResult(createQuickActionSearchHintResult(term, quickActionScope, quickActions));
    setQuickActionSearchResult(createQuickActionSearchResult(term, quickActionScope, quickActions));
    setQuickActionSearchRecoveryResult(null);
  }

  function checkProjectSafetyReadout(): void {
    setProjectStatus(`Checked project safety: ${projectSafetyReadout.statusLabel}`);
  }

  function focusPatternPlaybackReadout(): void {
    composePanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `Pattern Playback ${patternPlaybackReadout.statusLabel}: ${patternPlaybackReadout.roleLabel} / ${patternPlaybackReadout.detailLabel}`
    );
  }

  function focusArrangementPlaybackReadout(): void {
    arrangePanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `Arrangement Playback ${arrangementPlaybackReadout.statusLabel}: ${arrangementPlaybackReadout.roleLabel} / ${arrangementPlaybackReadout.detailLabel}`
    );
  }

  function focusTransportPositionReadout(): void {
    transportPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `Transport Position ${transportPositionReadout.statusLabel}: ${transportPositionReadout.roleLabel} / ${transportPositionReadout.detailLabel}`
    );
  }

  function focusLoopScopeReadout(): void {
    const currentLoopStatus = transportLoopStatus(
      project,
      transportLoopScope,
      selectedArrangementIndex,
      arrangementTransitionLoopTarget
    );

    transportPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(`Loop Scope ${transportLoopLabel(transportLoopScope)}: ${currentLoopStatus}`);
  }

  function focusMetronomeReadout(): void {
    const currentLoopStatus = transportLoopStatus(
      project,
      transportLoopScope,
      selectedArrangementIndex,
      arrangementTransitionLoopTarget
    );

    transportPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `Metronome ${project.metronomeEnabled ? "on" : "off"}: ${project.bpm} BPM / ${currentLoopStatus}`
    );
  }

  function focusTapTempoReadout(): void {
    transportPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `Tap Tempo ${tapTempoReadout.statusLabel}: ${tapTempoReadout.roleLabel} / ${tapTempoReadout.detailLabel}`
    );
  }

  function focusTempoNudgeReadout(): void {
    transportPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(`Tempo Nudge ${project.bpm} BPM: ${tempoNudgeRouteSummary(project.bpm)}`);
  }

  function focusSwingFeelReadout(): void {
    transportPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `Swing Feel ${percentLabel(normalizeSwingFeelValue(project.swing))}: ${swingFeelRouteSummary(project)}`
    );
  }

  function focusKeyRetargetReadout(): void {
    transportPanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(`Key Retarget ${project.key}: ${keyRetargetPatternSummary(project)}`);
  }

  function focusKeyboardCaptureReadout(): void {
    composePanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `Keyboard Capture ${keyboardCaptureEnabled ? "Armed" : "Off"}: ${
        keyboardCaptureTarget === "bass" ? "808" : "Synth"
      } / ${quickActionCaptureStepModeLabel(keyboardCaptureStepMode)} / ${keyboardCaptureDefaultSummary(
        keyboardCaptureTarget,
        keyboardCaptureDefaults[keyboardCaptureTarget]
      )}`
    );
  }

  function focusCaptureStepModeReadout(): void {
    const targetLabel = keyboardCaptureTarget === "bass" ? "808" : "Synth";
    const selectedLabel = selectedNote
      ? `${selectedCaptureNoteLabel}${selectedCaptureNoteActive ? "" : " inactive"}`
      : "No selected note";
    composePanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `Capture Step Mode ${quickActionCaptureStepModeLabel(
        keyboardCaptureStepMode
      )}: ${targetLabel} / ${selectedLabel} / Step ${keyboardCaptureNextStep + 1}`
    );
  }

  function focusMidiInputReadout(): void {
    composePanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `MIDI Input ${midiCaptureSummary.statusLabel}: ${midiCaptureArmed ? "Armed" : "Disarmed"} / ${
        keyboardCaptureTarget === "bass" ? "808" : "Synth"
      } / ${midiSelectedInputLabel} / ${midiLastNoteLabel}`
    );
  }

  function focusEditorAuditionReadout(): void {
    composePanelRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    setProjectStatus(
      `Editor Audition ${editorAuditionReadout.statusLabel}: ${editorAuditionReadout.targetLabel} / ${editorAuditionReadout.metricLabel} ${editorAuditionReadout.metricValue}`
    );
  }

  const quickActions = createQuickActions({
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
    canRedo,
    canUndo,
    nextRedoLabel,
    nextUndoLabel,
    beatPassportSummary,
    beatSpineSummary,
    chordMovePreviewSummary,
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
    playingArrangementIndex,
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
    spaceFxPadOptions,
    spaceFxPreviewSummary,
    stemAnalyses,
    stemAuditionDecision,
    stemAuditionPadOptions,
    structureLensActions,
    styleInspectorSummary,
    tapTempoReadout,
    beatBlueprintPreviewId,
    transportLoopScope,
    transportPositionReadout,
    toplineLoopCueTarget,
    toplineSpaceSummary,
    workflowNavigatorItems,
    onApplyArrangementMove: applyArrangementMoveToSelected,
    onApplyArrangementArc: applyArrangementArcPad,
    onApplyArrangementFocus: applyArrangementFocusPreset,
    onApplyArrangementTemplate: applyArrangementTemplate,
    onCueArrangementTransition: cueArrangementTransition,
    onCueHookLoop: cueHookLoop,
    onCueToplineLoop: cueToplineLoop,
    onApplyHookFix: applyHookFix,
    onApplyToplineFix: applyToplineFix,
    onApplyReviewFix: applyReviewFix,
    onFocusArrangementMuteMap: focusArrangementMuteMapLane,
    onFocusArrangementPlaybackReadout: focusArrangementPlaybackReadout,
    onFocusArrangementTransitionMap: focusArrangementTransitionMapTransition,
    onApplyBasslinePad: applyBasslinePad,
    onApplyBassGlidePad: applyBassGlidePad,
    onApplyBassContour: applyBassContour,
    onApplyBeatSpine: applyBeatSpineAction,
    onApplyBlueprint: applyQuickActionBeatBlueprint,
    onApplyChordPad: applyChordPad,
    onApplyChordRhythm: applyChordRhythm,
    onApplyChordVoicing: applyChordVoicingPad,
    onAlignDeliveryTarget: alignDeliveryTarget,
    onSelectDeliveryTarget: selectDeliveryTarget,
    onApplyDrumAccent: applyDrumAccent,
    onApplyDrumFoundation: applyDrumFoundation,
    onApplyDrumKit: applyDrumKitPad,
    onApplyGrooveFeel: applyGrooveFeel,
    onApplyLayerStarter: applyLayerStarter,
    onApplyMasterAutomation: applyMasterAutomationPad,
    onApplyMasterFinish: applyMasterFinishPad,
    onApplyMelodyMotif: applyMelodyMotif,
    onApplyMelodyAccent: applyMelodyAccent,
    onApplyMelodyContour: applyMelodyContour,
    onApplyMixBalance: applyMixBalancePad,
    onApplyMixFix: applyMixFixPreset,
    onCaptureMixSnapshot: captureMixSnapshot,
    onRecallMixSnapshot: recallMixSnapshot,
    onClearMixSnapshots: clearMixSnapshots,
    onApplyPatternChain: applyPatternChain,
    onApplyPatternClone: cloneSelectedPatternVariation,
    onApplyPatternFill: applyPatternFill,
    onApplyPatternVariation: applyPatternVariation,
    onApplyPatternStack: applyPatternStack,
    onCopySelectedPattern: copySelectedPattern,
    onClearSelectedPattern: clearSelectedPattern,
    onApplySpaceFx: applySpaceFxPad,
    onApplyStemAudition: applyStemAuditionPad,
    onApplySoundFocus: applySoundFocusPad,
    onApplySoundPreset: applySoundPreset,
    onCaptureSoundSnapshot: captureSoundSnapshot,
    onRecallSoundSnapshot: recallSoundSnapshot,
    onClearSoundSnapshots: clearSoundSnapshots,
    onFocusTimbreCheck: focusTimbreCheck,
    onExpandPatternChain: expandPatternChain,
    onApplyProjectKey: applyProjectKey,
    onApplyTempoNudge: applyTempoNudgePad,
    onApplySwingFeel: applySwingFeelPad,
    onToggleMetronome: toggleMetronome,
    onTapTempo: tapProjectTempo,
    onFocusTapTempoReadout: focusTapTempoReadout,
    onFocusTempoNudgeReadout: focusTempoNudgeReadout,
    onFocusSwingFeelReadout: focusSwingFeelReadout,
    onFocusKeyRetargetReadout: focusKeyRetargetReadout,
    onFocusKeyboardCaptureReadout: focusKeyboardCaptureReadout,
    onFocusCaptureStepModeReadout: focusCaptureStepModeReadout,
    onFocusEditorAuditionReadout: focusEditorAuditionReadout,
    onFocusMidiInputReadout: focusMidiInputReadout,
    onFocusStyleDirectionReadout: focusStyleDirectionReadout,
    onPreviewBlueprint: previewQuickActionBeatBlueprint,
    onCueBlueprintPreview: cueBeatBlueprintPreview,
    onRequestMidiInputAccess: requestMidiInputAccess,
    onCueArrangementBlock: cueArrangementBlock,
    onCueSectionLocator: cueSectionLocator,
    onCueGrooveCompass: cueGrooveCompass,
    onCueStyleGoal: cueStyleGoal,
    onCuePattern: cuePatternFromCompare,
    onRunPatternCompareDecision: runPatternCompareDecision,
    onFollowAudiblePattern: followAudiblePattern,
    onFollowAudibleArrangementBlock: followAudibleArrangementBlock,
    onSelectArrangementBlock: selectArrangementBlock,
    onSelectPattern: selectPattern,
    onSelectStyle: selectStyle,
    onSwitchMode: switchProjectMode,
    onUsePatternInSelectedBlock: usePatternInSelectedBlockFromCompare,
    onSetKeyboardCaptureEnabled: setKeyboardCaptureEnabled,
    onSetKeyboardCaptureStepMode: setKeyboardCaptureStepMode,
    onSetKeyboardCaptureTarget: setKeyboardCaptureTarget,
    onUpdateKeyboardCaptureDefaults: updateKeyboardCaptureDefaults,
    onSetMidiCaptureArmed: setMidiCaptureArmed,
    onApplySessionBriefStarter: applySessionBriefStarterPad,
    onFocusSessionBriefCompass: focusSessionBriefCompassCard,
    onRunSelectedBlockEditPriority: runSelectedBlockEditPriorityAction,
    onCopySelectedArrangementBlock: copySelectedArrangementBlock,
    onPasteArrangementBlockAfterSelected: pasteArrangementBlockAfterSelected,
    onDuplicateArrangementBlock: duplicateArrangementBlock,
    onMoveArrangementBlock: moveArrangementBlock,
    onSplitArrangementBlock: splitArrangementBlock,
    onMergeArrangementBlock: mergeArrangementBlock,
    onDeleteArrangementBlock: deleteArrangementBlock,
    onMoveSelectedNoteStep: moveSelectedNoteStep,
    onResetSelectedNoteStep: resetSelectedNoteStep,
    onMoveSelectedNotePitch: moveSelectedNotePitch,
    onResetSelectedNotePitch: resetSelectedNotePitch,
    onMoveSelectedNoteOctave: moveSelectedNoteOctave,
    onUpdateSelectedNoteLength: updateSelectedLength,
    onUpdateSelectedNoteGlide: updateSelectedGlide,
    onUpdateSelectedNoteVelocity: updateSelectedVelocity,
    onUpdateSelectedNoteProbability: updateSelectedNoteProbability,
    onAuditionSelectedNote: auditionSelectedNote,
    onCopySelectedNote: copySelectedNote,
    onPasteCopiedNote: pasteCopiedNote,
    onDuplicateSelectedNote: duplicateSelectedNote,
    onDuplicateSelectedNoteToStep: duplicateSelectedNoteToStep,
    onDeleteSelectedNote: deleteSelectedNote,
    onMoveSelectedDrumStep: moveSelectedDrumStep,
    onResetSelectedDrumStep: resetSelectedDrumStep,
    onUpdateSelectedDrumVelocity: updateSelectedDrumVelocity,
    onUpdateSelectedDrumProbability: updateSelectedDrumProbability,
    onUpdateSelectedDrumTiming: updateSelectedDrumTiming,
    onUpdateSelectedHatRepeat: updateSelectedHatRepeat,
    onAuditionSelectedDrumHit: auditionSelectedDrumHit,
    onCopySelectedDrumHit: copySelectedDrumHit,
    onPasteCopiedDrumHit: pasteCopiedDrumHit,
    onDuplicateSelectedDrumHit: duplicateSelectedDrumHit,
    onDuplicateSelectedDrumHitToStep: duplicateSelectedDrumHitToStep,
    onDeleteSelectedDrumHit: clearSelectedDrumStep,
    onMoveSelectedChordStep: moveSelectedChordStep,
    onUpdateSelectedChordStep: updateSelectedChordStep,
    onAuditionSelectedChord: auditionSelectedChord,
    onCopySelectedChord: copySelectedChord,
    onPasteCopiedChord: pasteCopiedChord,
    onDuplicateSelectedChord: duplicateSelectedChord,
    onDuplicateSelectedChordToStep: duplicateSelectedChordToStep,
    onDeleteSelectedChord: deleteSelectedChordEvent,
    onMoveSelectedChordInversion: moveSelectedChordInversion,
    onResetSelectedChordInversion: resetSelectedChordInversion,
    onUpdateSelectedChordRoot: updateSelectedChordRoot,
    onUpdateSelectedChordQuality: updateSelectedChordQuality,
    onUpdateSelectedChordLength: updateSelectedChordLength,
    onUpdateSelectedChordVelocity: updateSelectedChordVelocity,
    onUpdateSelectedChordProbability: updateSelectedChordProbability,
    onExportHandoffSheet: handleExportHandoffSheet,
    onExportMidi: handleExportMidi,
    onExportStems: handleExportStems,
    onExportWav: handleExportWav,
    onJumpFirstBeatPath: jumpToFirstBeatPathStep,
    onJumpBeatSpine: jumpToBeatSpineTarget,
    onFocusBeatPassport: focusBeatPassportMetric,
    onFocusBeatReadiness: focusBeatReadinessCheck,
    onFocusComposerGuide: focusComposerGuideCard,
    onRunComposerAction: runComposerAction,
    onRunNextMove: runNextMove,
    onFocusExportPreflight: focusExportPreflightCard,
    onFocusFinishChecklist: focusFinishChecklistCard,
    onFocusGrooveCompass: focusGrooveCompassItem,
    onFocusHandoffExportFormat: focusHandoffExportFormatMetric,
    onFocusHandoffPack: focusHandoffPack,
    onFocusHandoffManifestAudit: focusHandoffManifestAudit,
    onFocusHandoffPackageCheck: focusHandoffPackageCheckCard,
    onFocusHookReadiness: focusHookReadinessCard,
    onFocusKeyCompass: focusKeyCompassItem,
    onFocusListeningPass: focusListeningPassItem,
    onFocusLoopScope: focusLoopScopeReadout,
    onFocusMetronomeReadout: focusMetronomeReadout,
    onFocusTransportPositionReadout: focusTransportPositionReadout,
    onFocusMixCoach: focusMixCoachCheck,
    onFocusExportMeter: focusExportMeter,
    onFocusMasterOutputRole: focusMasterOutputRole,
    onFocusModeFocus: focusModeFocusCard,
    onFocusPatternDna: focusPatternDnaCard,
    onFocusPatternPlaybackReadout: focusPatternPlaybackReadout,
    onFocusProductionSnapshot: focusProductionSnapshotMetric,
    onFocusReferenceAlignment: focusReferenceAlignmentCard,
    onFocusSnapshotCompare: focusSnapshotCompareMetric,
    onFocusReviewQueue: focusReviewQueueItem,
    onFocusSessionPass: focusSessionPassCard,
    onFocusStyleInspector: focusStyleInspectorItem,
    onFocusToplineSpace: focusToplineSpaceCard,
    onFocusWorkflowSpotlight: jumpToWorkflowNavigatorItem,
    onJumpWorkflowZone: jumpToWorkflowNavigatorItem,
    onOpenCommandReference: openCommandReference,
    onOpenProject: handleOpenProject,
    onCheckProjectSafety: checkProjectSafetyReadout,
    onRedo: redoProject,
    onRestoreLocalDraft: restoreLocalDraft,
    onSaveProject: handleSaveProject,
    onSaveSnapshot: saveCurrentSnapshot,
    onClearLocalDraftRecovery: clearLocalDraftRecovery,
    onSelectTransportLoopScope: selectTransportLoopScope,
    onTogglePlayback: togglePlayback,
    onUndo: undoProject
  });
  useEffect(() => {
    setQuickActionPinnedIds((pinnedIds) => normalizeQuickActionPinnedIds(pinnedIds, quickActions));
    setInspectedQuickActionPinnedId((inspectedId) =>
      inspectedId && quickActions.some((action) => action.id === inspectedId) ? inspectedId : null
    );
  }, [quickActions]);
  useEffect(() => {
    setInspectedQuickActionPinnedId((inspectedId) =>
      inspectedId && quickActionPinnedIds.includes(inspectedId) ? inspectedId : null
    );
  }, [quickActionPinnedIds]);
  const quickActionScopeOptions = createQuickActionScopeOptions(quickActions, quickActionQuery);
  const filteredQuickActions = filterQuickActions(quickActions, quickActionQuery, quickActionScope);
  const guidedModeContext = createModeSwitchButtonContext({
    firstBeatPathSummary,
    mode: "guided",
    modeFocusSummary,
    projectMode: project.mode,
    sessionPassSummary
  });
  const studioModeContext = createModeSwitchButtonContext({
    firstBeatPathSummary,
    mode: "studio",
    modeFocusSummary,
    projectMode: project.mode,
    sessionPassSummary
  });

  return (
    <main className="app-shell">
      <header className="transport-band" data-testid="workflow-target-transport" ref={transportPanelRef}>
        <div className="brand-lockup">
          <Disc3 size={28} aria-hidden="true" />
          <div>
            <h1>GrooveForge</h1>
            <span>{window.grooveforge?.appKind ?? "desktop"} workstation</span>
          </div>
        </div>

        <div className="transport-controls">
          <label className="field title-field">
            <span>Title</span>
            <input
              type="text"
              value={project.title}
              onChange={(event) => updateProject((current) => ({ ...current, title: event.target.value }))}
            />
          </label>
          <label className="field compact">
            <span>BPM</span>
            <input
              type="number"
              min={minProjectBpm}
              max={maxProjectBpm}
              value={project.bpm}
              onChange={(event) => updateProjectBpm(Number(event.target.value) || projectRef.current.bpm)}
            />
          </label>
          <div className="tempo-nudge-pads" aria-label="Tempo nudge pads" data-testid="tempo-nudge-pads">
            {tempoNudgePads.map((pad) => (
              <button
                data-testid={tempoNudgePadTestId(pad.id)}
                key={pad.id}
                onClick={() => applyTempoNudgePad(pad)}
                title={pad.title}
                type="button"
              >
                {pad.label}
              </button>
            ))}
          </div>
          <label className="field">
            <span>Key</span>
            <select value={project.key} onChange={(event) => applyProjectKey(event.target.value)}>
              {keys.map((key) => (
                <option key={key}>{key}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Style</span>
            <select
              aria-label="Style"
              data-testid="style-select"
              value={project.styleId}
              onChange={(event) => selectStyle(event.target.value as ProjectState["styleId"])}
            >
              {styleProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="command-strip">
          <div className="transport-status" aria-live="polite">
            <strong>{transportPrimary}</strong>
            <span>{transportSecondary}</span>
          </div>
          <div
            className={`transport-position-readout ${transportPositionReadout.tone}`}
            data-testid="transport-position-readout"
            title={transportPositionReadout.detailTitle}
          >
            <span data-testid="transport-position-status">{transportPositionReadout.statusLabel}</span>
            <strong data-testid="transport-position-label">{transportPositionReadout.roleLabel}</strong>
            <small data-testid="transport-position-detail">{transportPositionReadout.detailLabel}</small>
          </div>
          <button
            className="icon-button tap-tempo-button"
            data-testid="tap-tempo-button"
            type="button"
            title="Tap repeatedly to set the project BPM"
            onClick={tapProjectTempo}
          >
            <Gauge size={18} aria-hidden="true" />
            <span>Tap</span>
          </button>
          <div
            className={`tap-tempo-readout ${tapTempoReadout.tone}`}
            data-testid="tap-tempo-readout"
            title={tapTempoReadout.detailTitle}
          >
            <span data-testid="tap-tempo-status">{tapTempoReadout.statusLabel}</span>
            <strong data-testid="tap-tempo-label">{tapTempoReadout.roleLabel}</strong>
            <small data-testid="tap-tempo-detail">{tapTempoReadout.detailLabel}</small>
          </div>
          <div
            className={`edit-history-readout ${editHistoryReadout.tone}`}
            data-testid="edit-history-readout"
            title={editHistoryReadout.detailTitle}
          >
            <span data-testid="edit-history-status">{editHistoryReadout.statusLabel}</span>
            <strong data-testid="edit-history-label">{editHistoryReadout.roleLabel}</strong>
            <small data-testid="edit-history-detail">{editHistoryReadout.detailLabel}</small>
          </div>
          <div
            className={`keyboard-capture-posture ${keyboardCapturePosture.tone}`}
            data-testid="keyboard-capture-posture"
            title={keyboardCapturePosture.detailTitle}
          >
            <span data-testid="keyboard-capture-posture-status">{keyboardCapturePosture.statusLabel}</span>
            <strong data-testid="keyboard-capture-posture-label">{keyboardCapturePosture.roleLabel}</strong>
            <small data-testid="keyboard-capture-posture-detail">{keyboardCapturePosture.detailLabel}</small>
          </div>
          <div className="segmented playback-mode-row" aria-label="Transport loop">
            <button
              className={transportLoopScope === "arrangement" ? "selected" : ""}
              data-testid="playback-mode-arrangement"
              disabled={isPlaying && transportLoopScope !== "arrangement"}
              onClick={() => selectTransportLoopScope("arrangement")}
              title="Loop the full arrangement timeline"
              type="button"
            >
              Song
            </button>
            <button
              className={transportLoopScope === "block" ? "selected" : ""}
              data-testid="transport-loop-block"
              disabled={isPlaying && transportLoopScope !== "block"}
              onClick={() => selectTransportLoopScope("block")}
              title="Loop the selected arrangement block"
              type="button"
            >
              Block
            </button>
            <button
              className={transportLoopScope === "transition" ? "selected" : ""}
              data-testid="transport-loop-transition"
              disabled={(isPlaying && transportLoopScope !== "transition") || !arrangementTransitionLoopTarget}
              onClick={() => selectTransportLoopScope("transition")}
              title={
                arrangementTransitionLoopTarget
                  ? `Loop ${arrangementTransitionLoopTarget.transition.value} transition`
                  : "Select or focus an adjacent arrangement transition"
              }
              type="button"
            >
              Turn
            </button>
            <button
              className={transportLoopScope === "pattern" ? "selected" : ""}
              data-testid="playback-mode-pattern"
              disabled={isPlaying && transportLoopScope !== "pattern"}
              onClick={() => selectTransportLoopScope("pattern")}
              title="Loop the selected Pattern A/B/C"
              type="button"
            >
              Pattern
            </button>
          </div>
          <button
            aria-pressed={project.metronomeEnabled}
            className={`icon-button ${project.metronomeEnabled ? "selected" : ""}`}
            data-testid="metronome-toggle"
            type="button"
            title={project.metronomeEnabled ? "Turn metronome off" : "Turn metronome on"}
            onClick={toggleMetronome}
          >
            <Gauge size={18} aria-hidden="true" />
            <span>Click</span>
          </button>
          <button className="icon-button" data-testid="quick-actions-open" type="button" title="Open Quick Actions" onClick={openQuickActions}>
            <KeyboardMusic size={18} aria-hidden="true" />
            <span>Actions</span>
          </button>
          <button
            className="icon-button"
            data-testid="command-reference-open"
            type="button"
            title="Open Command Reference"
            onClick={openCommandReference}
          >
            <CircleHelp size={18} aria-hidden="true" />
            <span>Help</span>
          </button>
          <button className="icon-button primary" type="button" title={`Play ${transportLoopLabel(transportLoopScope).toLowerCase()} loop`} onClick={togglePlayback}>
            {isPlaying ? <CircleStop size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            <span>{isPlaying ? "Stop" : "Play"}</span>
          </button>
          <button
            className="icon-button"
            data-testid="undo-button"
            type="button"
            title="Undo last edit"
            disabled={!canUndo}
            onClick={undoProject}
          >
            <Undo2 size={18} aria-hidden="true" />
            <span>Undo</span>
          </button>
          <button
            className="icon-button"
            data-testid="redo-button"
            type="button"
            title="Redo last undone edit"
            disabled={!canRedo}
            onClick={redoProject}
          >
            <Redo2 size={18} aria-hidden="true" />
            <span>Redo</span>
          </button>
          <button className="icon-button" type="button" title="Open project" onClick={() => void handleOpenProject()}>
            <FolderOpen size={18} aria-hidden="true" />
            <span>Open</span>
          </button>
          <button className="icon-button" type="button" title="Save project" onClick={() => void handleSaveProject()}>
            <Save size={18} aria-hidden="true" />
            <span>Save</span>
          </button>
          <button className="icon-button" type="button" title="Export WAV" onClick={handleExportWav}>
            <Download size={18} aria-hidden="true" />
            <span>WAV</span>
          </button>
          <button className="icon-button" data-testid="export-stems" type="button" title="Export stem WAVs" onClick={handleExportStems}>
            <Download size={18} aria-hidden="true" />
            <span>Stems</span>
          </button>
          <button className="icon-button" data-testid="export-midi" type="button" title="Export MIDI" onClick={handleExportMidi}>
            <Download size={18} aria-hidden="true" />
            <span>MIDI</span>
          </button>
          <button className="icon-button" data-testid="export-handoff-sheet" type="button" title="Export handoff sheet" onClick={handleExportHandoffSheet}>
            <Download size={18} aria-hidden="true" />
            <span>Sheet</span>
          </button>
        </div>
      </header>

      <QuickActions
        actions={filteredQuickActions}
        open={quickActionsOpen}
        inspectedPinnedActionId={inspectedQuickActionPinnedId}
        inspectedRecentActionId={inspectedQuickActionRecentId}
        pinnedActionIds={quickActionPinnedIds}
        pinnedResult={quickActionPinnedResult}
        query={quickActionQuery}
        recentActionSource={quickActions}
        recentResult={quickActionRecentResult}
        recents={quickActionRecents}
        searchHintResult={quickActionSearchHintResult}
        searchRecoveryResult={quickActionSearchRecoveryResult}
        searchResult={quickActionSearchResult}
        scope={quickActionScope}
        scopeResult={quickActionScopeResult}
        scopeOptions={quickActionScopeOptions}
        onClose={closeQuickActions}
        onApplySearchHint={applyQuickActionSearchHint}
        onQueryChange={updateQuickActionQuery}
        onRecoverSearchClear={recoverQuickActionSearchClear}
        onRecoverSearchScope={recoverQuickActionSearchScope}
        onRun={runQuickAction}
        onInspectPinnedAction={inspectQuickActionPin}
        onInspectRecentAction={inspectQuickActionRecent}
        onScopeChange={selectQuickActionScope}
        onTogglePin={toggleQuickActionPin}
      />
      <CommandReferenceDialog open={commandReferenceOpen} onClose={closeCommandReference} />

      {localDraftRecovery && (
        <LocalDraftRecoveryBanner
          draft={localDraftRecovery}
          onClear={clearLocalDraftRecovery}
          onRestore={restoreLocalDraft}
        />
      )}

      <section className="mode-row" aria-label="Mode">
        <input
          ref={importInputRef}
          className="file-input"
          type="file"
          accept=".json,.grooveforge.json,application/json"
          onChange={handleImportFile}
        />
        <div className="segmented">
          <button
            aria-label={guidedModeContext}
            className={project.mode === "guided" ? "selected" : ""}
            data-testid="mode-guided"
            title={guidedModeContext}
            type="button"
            onClick={() => switchProjectMode("guided")}
          >
            Guided
          </button>
          <button
            aria-label={studioModeContext}
            className={project.mode === "studio" ? "selected" : ""}
            data-testid="mode-studio"
            title={studioModeContext}
            type="button"
            onClick={() => switchProjectMode("studio")}
          >
            Studio
          </button>
        </div>
        <div className="session-meter">
          <span style={{ "--accent": style.color } as CSSProperties}>{style.name}</span>
          <span>{deliveryTarget.name}</span>
          <span>{project.key}</span>
          <span>{activeChannelLabel}</span>
          <span>{project.masterPreset}</span>
          <span data-testid="local-draft-status">{localDraftStatusLabel}</span>
          <div
            className={`project-safety-readout ${projectSafetyReadout.tone}`}
            data-testid="project-safety-readout"
            title={projectSafetyReadout.detailTitle}
          >
            <span data-testid="project-safety-status">{projectSafetyReadout.statusLabel}</span>
            <strong data-testid="project-safety-label">{projectSafetyReadout.roleLabel}</strong>
            <small data-testid="project-safety-detail">{projectSafetyReadout.detailLabel}</small>
          </div>
          <span data-testid="project-status">{projectStatus}</span>
        </div>
        {modeSwitchResult && <ModeSwitchResultStrip result={modeSwitchResult} />}
        {projectFileResult && <ProjectFileResultStrip result={projectFileResult} />}
        {localDraftRecoveryResult && <LocalDraftRecoveryResultStrip result={localDraftRecoveryResult} />}
      </section>

      <GuideQuickStart
        firstBeatPathSummary={firstBeatPathSummary}
        sessionPassSummary={sessionPassSummary}
        workflowNavigatorItems={workflowNavigatorItems}
        onJumpFirstBeatPath={jumpToFirstBeatPathStep}
        onFocusSessionPass={focusSessionPassCard}
        onJumpWorkflowSpotlight={jumpToWorkflowNavigatorItem}
      />

      <ModeFocus result={modeFocusResult} summary={modeFocusSummary} onFocus={focusModeFocusCard} />

      <FirstBeatPath result={firstBeatPathResult} summary={firstBeatPathSummary} onJump={jumpToFirstBeatPathStep} />

      <BeatSpine
        jumpResult={beatSpineJumpResult}
        result={beatSpineResult}
        selectedPattern={project.selectedPattern}
        summary={beatSpineSummary}
        onApply={applyBeatSpineAction}
        onJump={jumpToBeatSpineTarget}
      />

      <SessionPass result={sessionPassResult} summary={sessionPassSummary} onFocus={focusSessionPassCard} />

      <WorkflowNavigator items={workflowNavigatorItems} result={workflowNavigatorResult} onJump={jumpToWorkflowNavigatorItem} />

      {undoRedoResult && <UndoRedoResultStrip result={undoRedoResult} />}
      {quickActionResult && <QuickActionResultStrip result={quickActionResult} />}

      <StyleInspector
        composerActionsSummary={composerActionsSummary}
        composerActionResult={composerActionResult}
        cueResult={styleGoalCueResult}
        focusedItemId={styleInspectorFocusId}
        isPlaying={isPlaying}
        result={styleInspectorResult}
        innerRef={styleInspectorRef}
        onCueGoal={cueStyleGoal}
        onSelectStyle={selectStyle}
        onFocus={focusStyleInspectorItem}
        onRunGoalAction={runComposerAction}
        selectedStyleId={project.styleId}
        summary={styleInspectorSummary}
      />

      <KeyCompass
        focusedCardId={keyCompassFocusId}
        onFocus={focusKeyCompassItem}
        result={keyCompassResult}
        summary={keyCompassSummary}
      />

      <GrooveCompass
        cued={transportLoopScope === "pattern"}
        focusedCardId={grooveCompassFocusId}
        isPlaying={isPlaying}
        onCue={cueGrooveCompass}
        onFocus={focusGrooveCompassItem}
        result={grooveCompassResult}
        selectedPattern={project.selectedPattern}
        summary={grooveCompassSummary}
      />

      <ComposerGuide
        summary={composerGuideSummary}
        focusedCardId={composerGuideFocusId}
        result={composerGuideResult}
        onFocus={focusComposerGuideCard}
      />

      <ComposerActions
        project={project}
        summary={composerActionsSummary}
        result={composerActionResult}
        onRun={runComposerAction}
      />

      <BeatBlueprints
        isPlaying={isPlaying}
        onApply={applySelectedBeatBlueprint}
        onCuePreview={cueBeatBlueprintPreview}
        onPreview={setBeatBlueprintPreviewId}
        previewBlueprintId={beatBlueprintPreviewId}
        project={project}
        result={beatBlueprintResult}
        transportLoopScope={transportLoopScope}
        sectionRef={beatBlueprintPanelRef}
      />

      <DeliveryTargets
        project={project}
        result={deliveryTargetAlignmentResult}
        onApply={alignDeliveryTarget}
        onCustomChange={updateCustomDeliveryTarget}
        onSelect={selectDeliveryTarget}
      />

      <SessionBriefPanel
        brief={project.sessionBrief}
        compass={sessionBriefCompassSummary}
        compassResult={sessionBriefCompassResult}
        focusedCompassCardId={sessionBriefCompassFocusId}
        focusedReferenceCardId={referenceAlignmentFocusId}
        referenceAlignment={referenceAlignmentSummary}
        referenceAlignmentResult={referenceAlignmentResult}
        result={sessionBriefStarterResult}
        starterPads={sessionBriefStarterPads}
        fieldRefs={{
          artist: sessionBriefArtistRef,
          vibe: sessionBriefVibeRef,
          reference: sessionBriefReferenceRef,
          notes: sessionBriefNotesRef
        }}
        onApplyStarter={applySessionBriefStarterPad}
        onChange={updateSessionBrief}
        onClear={clearSessionBrief}
        onFocusCompass={focusSessionBriefCompassCard}
        onFocusReferenceAlignment={focusReferenceAlignmentCard}
      />

      <BeatPassport
        focusedMetricId={beatPassportFocusId}
        result={beatPassportResult}
        summary={beatPassportSummary}
        onFocus={focusBeatPassportMetric}
      />

      <ProductionSnapshot
        focusedMetricId={productionSnapshotFocusId}
        result={productionSnapshotResult}
        summary={productionSnapshotSummary}
        onFocus={focusProductionSnapshotMetric}
      />

      <ExportPreflight
        focusedCardId={exportPreflightFocusId}
        result={exportPreflightResult}
        onFocus={focusExportPreflightCard}
        sectionRef={deliverPanelRef}
        summary={exportPreflightSummary}
      />

      <HandoffPack
        analysis={exportAnalysis}
        exportReceipt={handoffExportReceipt}
        exportFormatResult={handoffExportFormatResult}
        focusedExportFormatId={handoffExportFormatFocusId}
        focusedPackageCheckId={handoffPackageCheckFocusId}
        packageCheckSummary={handoffPackageCheckSummary}
        packageCheckResult={handoffPackageCheckResult}
        project={project}
        stemAnalyses={stemAnalyses}
        onExportHandoffSheet={handleExportHandoffSheet}
        onExportMidi={handleExportMidi}
        onExportStems={handleExportStems}
        onExportWav={handleExportWav}
        onFocusExportFormat={focusHandoffExportFormatMetric}
        onFocusPackageCheck={focusHandoffPackageCheckCard}
      />

      <BeatReadiness
        checks={beatReadinessChecks}
        focusedCheckId={beatReadinessFocusId}
        result={beatReadinessResult}
        onFocus={focusBeatReadinessCheck}
      />

      <ListeningPass
        focusedItemId={listeningPassFocusId}
        result={listeningPassResult}
        summary={listeningPassSummary}
        onFocus={focusListeningPassItem}
      />

      <BeatMap summary={beatMapSummary} actions={beatMapActions} onRun={runNextMove} />

      <StructureLens summary={structureLensSummary} actions={structureLensActions} onRun={runNextMove} />

      <HookReadiness
        cueTarget={hookLoopCueTarget}
        cued={transportLoopScope === "block" && hookLoopCueTarget?.index === selectedArrangementIndex}
        fixResult={hookFixResult}
        focusedCardId={hookReadinessFocusId}
        focusResult={hookReadinessResult}
        isPlaying={isPlaying}
        onCue={cueHookLoop}
        onFix={applyHookFix}
        onFocus={focusHookReadinessCard}
        summary={hookReadinessSummary}
      />

      <ToplineSpace
        cueTarget={toplineLoopCueTarget}
        cued={
          toplineLoopCueTarget.mode === "block"
            ? transportLoopScope === "block" && selectedArrangementIndex === toplineLoopCueTarget.index
            : transportLoopScope === "pattern" && project.selectedPattern === toplineLoopCueTarget.pattern
        }
        focusedCardId={toplineSpaceFocusId}
        focusResult={toplineSpaceResult}
        fixResult={toplineFixResult}
        isPlaying={isPlaying}
        onCue={cueToplineLoop}
        onFix={applyToplineFix}
        onFocus={focusToplineSpaceCard}
        summary={toplineSpaceSummary}
      />

      <SongFormOverview
        playingArrangementIndex={playingArrangementIndex}
        summary={songFormOverviewSummary}
        onSelectBlock={selectArrangementBlock}
      />

      <NextMove actions={nextMoveActions} result={nextMoveResult} onRun={runNextMove} />

      <ProjectSnapshots
        nameDrafts={snapshotNameDrafts}
        project={project}
        onDelete={deleteSavedSnapshot}
        onNameCommit={commitSnapshotName}
        onNameDraftChange={updateSnapshotNameDraft}
        onNameDraftReset={clearSnapshotNameDraft}
        onRestore={restoreSavedSnapshot}
        onSave={saveCurrentSnapshot}
      />

      <SnapshotCompare
        focusedMetricId={snapshotCompareFocusId}
        focusSummary={createSnapshotCompareFocusSummary(snapshotCompareSummary, snapshotCompareFocusId)}
        onFocus={focusSnapshotCompareMetric}
        result={snapshotCompareResult}
        summary={snapshotCompareSummary}
      />

      <section className="workspace-grid">
        <section className="panel pattern-panel" data-testid="workflow-target-compose" aria-label="Pattern editor" ref={composePanelRef}>
          <PanelTitle icon={<Drum size={18} />} title="Drums" meta="16 step rack" />
          <div className="pattern-tabs" aria-label="Pattern">
            {patternSlots.map((pattern) => {
              const selected = project.selectedPattern === pattern;
              const playing = playingPattern === pattern;
              return (
                <button
                  key={pattern}
                  aria-current={playing ? "step" : undefined}
                  className={["pattern-tab", selected ? "selected" : "", playing ? "playing" : ""].filter(Boolean).join(" ")}
                  data-playing={playing ? "true" : "false"}
                  data-testid={`pattern-tab-${pattern}`}
                  type="button"
                  onClick={() => selectPattern(pattern)}
                >
                  <span>{pattern}</span>
                  <small>{playing ? "Playing" : patternEventCount(project.patterns[pattern])}</small>
                </button>
              );
            })}
          </div>
          <div
            className={`pattern-playback-readout ${patternPlaybackReadout.tone}`}
            data-testid="pattern-playback-readout"
            title={patternPlaybackReadout.detailTitle}
          >
            <span data-testid="pattern-playback-status">{patternPlaybackReadout.statusLabel}</span>
            <strong data-testid="pattern-playback-label">{patternPlaybackReadout.roleLabel}</strong>
            <small data-testid="pattern-playback-detail">{patternPlaybackReadout.detailLabel}</small>
            <button
              aria-label={
                audiblePatternFollowTarget
                  ? `Edit audible Pattern ${audiblePatternFollowTarget}`
                  : playingPattern
                    ? "Editing Pattern already matches audible Pattern"
                    : "No audible Pattern to follow"
              }
              className="pattern-playback-follow-button"
              data-testid="pattern-playback-follow"
              disabled={!audiblePatternFollowTarget}
              onClick={followAudiblePattern}
              title={
                audiblePatternFollowTarget
                  ? `Switch edit focus to audible Pattern ${audiblePatternFollowTarget}`
                  : playingPattern
                    ? "Editing Pattern already matches audible Pattern"
                    : "Play Song or Block with another Pattern to follow the audible Pattern"
              }
              type="button"
            >
              <ArrowRight size={13} aria-hidden="true" />
              <span>{audiblePatternFollowTarget ? `Edit ${audiblePatternFollowTarget}` : playingPattern ? "In sync" : "Idle"}</span>
            </button>
          </div>
          <PatternCompareDecision summary={patternCompareDecisionSummary} onRun={runPatternCompareDecision} />
          <PatternCompareStrip
            playbackMode={playbackMode}
            selectedBlockPattern={selectedArrangementBlock?.pattern ?? project.selectedPattern}
            selectedPattern={project.selectedPattern}
            summaries={patternCompareSummaries}
            onCue={cuePatternFromCompare}
            onUse={usePatternInSelectedBlockFromCompare}
          />
          {patternCompareResult && <PatternCompareResultStrip result={patternCompareResult} />}
          <PatternDna
            summary={patternDnaSummary}
            focusedCardId={patternDnaFocusId}
            result={patternDnaResult}
            onFocus={focusPatternDnaCard}
          />
          <LayerStarterPads options={layerStarterOptions} onApply={applyLayerStarter} />
          {layerStarterResult && <LayerStarterResultStrip result={layerStarterResult} />}
          <PatternCloneSuggestion summary={patternCloneSuggestionSummary} />
          <PatternClonePads clones={patternCloneOptions} onApply={cloneSelectedPatternVariation} />
          {patternCloneResult && <PatternCloneResultStrip result={patternCloneResult} />}
          {patternEditResult && <PatternEditResultStrip result={patternEditResult} />}
          <PatternStackPreview preview={patternStackPreviewSummary} />
          {patternStackResult && <PatternStackResultStrip result={patternStackResult} />}
          <PatternStackPads stacks={patternStackOptions} onApply={applyPatternStack} />
          <PatternVariationSuggestion summary={patternVariationSuggestionSummary} />
          <PatternVariationPreview preview={patternVariationPreviewSummary} />
          <DrumMovePreview preview={drumMovePreviewSummary} />
          {drumMoveResult && <DrumMoveResultStrip result={drumMoveResult} />}
          <DrumFoundationPads foundations={drumFoundationOptions} onApply={applyDrumFoundation} />
          <GrooveFeelPads feels={grooveFeelOptions} onApply={applyGrooveFeel} />
          <DrumAccentPads accents={drumAccentOptions} onApply={applyDrumAccent} />
          <div className="pattern-tools" aria-label="Pattern tools">
            {patternVariationPresetIds.map((preset) => (
              <button
                key={preset}
                data-testid={`pattern-variation-${preset}`}
                data-previewed={patternVariationPreviewPreset === preset ? "true" : "false"}
                type="button"
                title={`Apply ${patternVariationPresetLabel(preset)} variation to Pattern ${project.selectedPattern}`}
                onFocus={() => setPatternVariationPreviewPreset(preset)}
                onMouseEnter={() => setPatternVariationPreviewPreset(preset)}
                onClick={() => {
                  setPatternVariationPreviewPreset(preset);
                  applyPatternVariation(preset);
                }}
              >
                <Sparkles size={14} aria-hidden="true" />
                <span>{patternVariationPresetLabel(preset)}</span>
              </button>
            ))}
            {patternSlots
              .filter((pattern) => pattern !== project.selectedPattern)
              .map((pattern) => (
                <button
                  key={pattern}
                  data-testid={`pattern-copy-${pattern}`}
                  type="button"
                  title={`Copy selected pattern to Pattern ${pattern}`}
                  onClick={() => copySelectedPattern(pattern)}
                >
                  <Copy size={14} aria-hidden="true" />
                  <span>Copy to {pattern}</span>
                </button>
              ))}
            <button
              className="danger"
              data-testid="pattern-clear"
              type="button"
              title={`Clear Pattern ${project.selectedPattern}`}
              onClick={clearSelectedPattern}
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>Clear {project.selectedPattern}</span>
            </button>
          </div>
          {patternVariationResult && <PatternVariationResultStrip result={patternVariationResult} />}
          <PatternFillSuggestion summary={patternFillSuggestionSummary} />
          <PatternFillPreview preview={patternFillPreviewSummary} />
          <div className="pattern-fill-row" aria-label="Pattern fills">
            {patternFillPresetIds.map((preset) => {
              const isClear = preset === "clear_tail";
              return (
                <button
                  className={isClear ? "danger" : ""}
                  key={preset}
                  data-testid={`pattern-fill-${preset}`}
                  data-previewed={patternFillPreviewPreset === preset ? "true" : "false"}
                  type="button"
                  title={`Apply ${patternFillPresetLabel(preset)} to Pattern ${project.selectedPattern}`}
                  onFocus={() => setPatternFillPreviewPreset(preset)}
                  onMouseEnter={() => setPatternFillPreviewPreset(preset)}
                  onClick={() => {
                    setPatternFillPreviewPreset(preset);
                    applyPatternFill(preset);
                  }}
                >
                  {isClear ? <Scissors size={14} aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
                  <span>{patternFillPresetLabel(preset)}</span>
                </button>
              );
            })}
          </div>
          {patternFillResult && <PatternFillResultStrip result={patternFillResult} />}
          <div className="step-grid">
            {(Object.keys(drumLabels) as DrumLane[]).map((lane) => (
              <div className="step-row" key={lane}>
                <div className="lane-name">{drumLabels[lane]}</div>
                {steps.map((step) => {
                  const active = currentPattern.drumPattern[lane][step];
                  const velocity = drumStepVelocity(currentPattern, lane, step);
                  const velocityPercent = Math.min(100, Math.max(0, Math.round(velocity * 100)));
                  const probability = drumStepProbability(currentPattern, lane, step);
                  const hasChanceBadge = probability < 1;
                  const repeat = lane === "hat" ? hatRepeatCount(currentPattern, step) : 1;
                  const timing = drumStepTimingMs(currentPattern, lane, step);
                  const ariaDetails = active
                    ? [
                        `${velocityPercent}% velocity`,
                        hasChanceBadge ? `${chanceBadgeLabel(probability)} chance` : "",
                        lane === "hat" && repeat > 1 ? `${repeat}x repeat` : "",
                        timing === 0 ? "" : timingLabel(timing)
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : "";
                  const stepBadge = [
                    hasChanceBadge ? compactChanceBadgeLabel(probability) : "",
                    lane === "hat" && repeat > 1 ? `${repeat}x` : "",
                    timing === 0 ? "" : timingBadge(timing)
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <button
                      aria-label={`${drumLabels[lane]} step ${step + 1}${ariaDetails ? ` ${ariaDetails}` : ""}`}
                      className={[
                        "step",
                        active ? "active" : "",
                        selectedDrumStep?.lane === lane && selectedDrumStep.step === step ? "selected" : "",
                        currentEditorStep === step ? "playhead" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      data-testid={`drum-step-${lane}-${step}`}
                      key={step}
                      onClick={() => toggleStep(lane, step)}
                      style={
                        {
                          "--lane-color": laneColor(lane),
                          "--step-velocity": `${Math.round(velocity * 100)}%`
                        } as CSSProperties
                      }
                      type="button"
                    >
                      <span>{step + 1}</span>
                      {active && (
                        <strong className="drum-velocity-label" data-testid={`drum-velocity-label-${lane}-${step}`}>
                          {velocityPercent}
                        </strong>
                      )}
                      {active && stepBadge && (
                        <small
                          className={hasChanceBadge ? "chance-badge" : undefined}
                          data-testid={hasChanceBadge ? `drum-chance-badge-${lane}-${step}` : undefined}
                        >
                          {stepBadge}
                        </small>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="micro-controls">
            <label>
              <span>Swing</span>
              <input
                type="range"
                min={0}
                max={0.24}
                step={0.01}
                value={project.swing}
                onChange={(event) => updateProject((current) => ({ ...current, swing: Number(event.target.value) }))}
              />
            </label>
            <div className="swing-feel-row" aria-label="Swing Feel Pads" data-testid="swing-feel-pads">
              {swingFeelPads.map((pad) => {
                const targetSwing = swingFeelPadSwing(pad, project);
                const selected = normalizeSwingFeelValue(project.swing) === targetSwing;
                return (
                  <button
                    className={selected ? "selected" : ""}
                    data-testid={`swing-feel-${pad.id}`}
                    key={pad.id}
                    onClick={() => applySwingFeelPad(pad.id)}
                    title={`${pad.label} swing feel: ${swingFeelPadDetail(pad, project)} at ${percentLabel(targetSwing)}`}
                    type="button"
                  >
                    <span>{pad.label}</span>
                    <strong>{percentLabel(targetSwing)}</strong>
                    <small>{swingFeelPadDetail(pad, project)}</small>
                  </button>
                );
              })}
            </div>
            {swingFeelResult && <SwingFeelResultStrip result={swingFeelResult} />}
            <div className="groove-row" aria-label="Groove humanize">
              <span>Groove</span>
              <div>
                {drumGroovePresetIds.map((preset) => (
                  <button
                    data-testid={`groove-preset-${preset}`}
                    key={preset}
                    onClick={() => applySelectedDrumGroove(preset)}
                    type="button"
                  >
                    {drumGroovePresetLabel(preset)}
                  </button>
                ))}
              </div>
            </div>
            <DrumStepInspector
              selectedStep={selectedDrumStep}
              drumClipboard={drumClipboard}
              active={selectedDrumActive}
              velocity={selectedDrumVelocity}
              timingMs={selectedDrumTiming}
              probability={selectedDrumProbability}
              hatRepeat={selectedHatRepeat}
              beatDuplicateStep={selectedDrumBeatDuplicateStep}
              previousBeatDuplicateStep={selectedDrumPreviousBeatDuplicateStep}
              onVelocityChange={updateSelectedDrumVelocity}
              onProbabilityChange={updateSelectedDrumProbability}
              onTimingChange={updateSelectedDrumTiming}
              onHatRepeatChange={updateSelectedHatRepeat}
              onAudition={auditionSelectedDrumHit}
              onCopy={copySelectedDrumHit}
              onPaste={pasteCopiedDrumHit}
              onDuplicateBeat={() => {
                if (selectedDrumBeatDuplicateStep !== null) {
                  duplicateSelectedDrumHitToStep(selectedDrumBeatDuplicateStep);
                }
              }}
              onDuplicatePreviousBeat={() => {
                if (selectedDrumPreviousBeatDuplicateStep !== null) {
                  duplicateSelectedDrumHitToStep(selectedDrumPreviousBeatDuplicateStep);
                }
              }}
            />
            {editorAuditionResult?.kind === "drum" && <EditorAuditionResultStrip result={editorAuditionResult} />}
            {selectedEventDeleteResult?.kind === "drum" && <SelectedEventDeleteResultStrip result={selectedEventDeleteResult} />}
          </div>
        </section>

        <section className="panel piano-panel" aria-label="Bass and melody editor">
          <PanelTitle icon={<KeyboardMusic size={18} />} title="808 / Melody" meta="scale locked grid" />
          <KeyboardCapturePanel
            defaults={activeKeyboardCaptureDefaults}
            enabled={keyboardCaptureEnabled}
            keyMap={keyboardCaptureKeyMap}
            nextStep={keyboardCaptureNextStep}
            onDefaultsChange={updateKeyboardCaptureDefaults}
            onEnabledChange={setKeyboardCaptureEnabled}
            onStepModeChange={setKeyboardCaptureStepMode}
            onTargetChange={setKeyboardCaptureTarget}
            selectedNote={selectedNote}
            stepMode={keyboardCaptureStepMode}
            target={keyboardCaptureTarget}
          />
          <MidiCapturePanel
            armed={midiCaptureArmed}
            inputOptions={midiInputOptions}
            lastNoteLabel={midiLastNoteLabel}
            selectedInputId={midiSelectedInputId}
            status={midiCaptureStatus}
            summary={midiCaptureSummary}
            target={keyboardCaptureTarget}
            onArmChange={setMidiCaptureArmed}
            onInputChange={setMidiSelectedInputId}
            onRefresh={refreshMidiInputPorts}
            onRequestAccess={() => void requestMidiInputAccess()}
          />
          {inputCaptureResult && <InputCaptureResultStrip result={inputCaptureResult} />}
          <BassMovePreview preview={bassMovePreviewSummary} />
          {bassMoveResult && <BassMoveResultStrip result={bassMoveResult} />}
          <BasslinePads pads={basslinePadOptions} onApply={applyBasslinePad} />
          <BassGlidePads pads={bassGlidePadOptions} onApply={applyBassGlidePad} />
          <BassContourPads contours={bassContourOptions} onApply={applyBassContour} />
          <MelodyMovePreview preview={melodyMovePreviewSummary} />
          {melodyMoveResult && <MelodyMoveResultStrip result={melodyMoveResult} />}
          <MelodyMotifPads motifs={melodyMotifOptions} onApply={applyMelodyMotif} />
          <MelodyAccentPads accents={melodyAccentOptions} onApply={applyMelodyAccent} />
          <MelodyContourPads contours={melodyContourOptions} onApply={applyMelodyContour} />
          <div className="note-lanes">
            <NoteEditor
              title="808"
              track="bass"
              notes={currentPattern.bassNotes}
              pitches={bassPitches}
              color="#ff7a4f"
              currentStep={currentEditorStep}
              selectedNote={selectedNote}
              onToggle={toggleBassNote}
            />
            <NoteEditor
              title="Synth"
              track="melody"
              notes={currentPattern.melodyNotes}
              pitches={melodyPitches}
              color="#8aa8ff"
              currentStep={currentEditorStep}
              selectedNote={selectedNote}
              onToggle={toggleMelodyNote}
            />
          </div>
          {project.mode === "studio" && (
            <NoteInspector
              currentKey={project.key}
              selectedNote={selectedNote}
              noteClipboard={noteClipboard}
              bassNote={selectedBassNote}
              melodyNote={selectedMelodyNote}
              beatDuplicateStep={selectedNoteBeatDuplicateStep}
              previousBeatDuplicateStep={selectedNotePreviousBeatDuplicateStep}
              onLengthChange={updateSelectedLength}
              onGlideChange={updateSelectedGlide}
              onVelocityChange={updateSelectedVelocity}
              onProbabilityChange={updateSelectedNoteProbability}
              onStepMove={moveSelectedNoteStep}
              onPitchMove={moveSelectedNotePitch}
              onOctaveMove={moveSelectedNoteOctave}
              onAudition={auditionSelectedNote}
              onCopy={copySelectedNote}
              onPaste={pasteCopiedNote}
              onDuplicate={duplicateSelectedNote}
              onDuplicateBeat={() => {
                if (selectedNoteBeatDuplicateStep !== null) {
                  duplicateSelectedNoteToStep(selectedNoteBeatDuplicateStep);
                }
              }}
              onDuplicatePreviousBeat={() => {
                if (selectedNotePreviousBeatDuplicateStep !== null) {
                  duplicateSelectedNoteToStep(selectedNotePreviousBeatDuplicateStep);
                }
              }}
            />
          )}
          {editorAuditionResult?.kind === "note" && <EditorAuditionResultStrip result={editorAuditionResult} />}
          {selectedEventDeleteResult?.kind === "note" && <SelectedEventDeleteResultStrip result={selectedEventDeleteResult} />}
        </section>

        <section className="panel instrument-panel" data-testid="workflow-target-sound" aria-label="Instrument panel" ref={soundPanelRef}>
          <PanelTitle icon={<Sparkles size={18} />} title="Instruments" meta={project.mode === "guided" ? "curated" : "editable"} />
          <div className="device-list">
            <Device icon={<Drum size={17} />} name="Drum Rack" value={`${soundPresetLabel(project.sound.preset)} kit`} color="#78f0c8" />
            <Device
              icon={<Waves size={17} />}
              name="808 Engine"
              value={`drive ${percentLabel(project.sound.bassDrive)} / duck ${percentLabel(project.sound.sidechainDuck)}`}
              color="#ff7a4f"
            />
            <Device icon={<Music2 size={17} />} name="Synth" value={`${style.melodyStyle} / bright ${percentLabel(project.sound.synthBrightness)}`} color="#8aa8ff" />
            <Device icon={<SlidersHorizontal size={17} />} name="Chord Tone" value={`warm ${percentLabel(project.sound.chordWarmth)}`} color="#d58cff" />
          </div>
          <SoundDesigner
            drumKitPads={drumKitPadOptions}
            drumKitPreview={drumKitPreviewSummary}
            drumKitResult={drumKitResult}
            focusPreview={soundFocusPreviewSummary}
            focusPads={soundFocusPadOptions}
            focusResult={soundFocusResult}
            mode={project.mode}
            presetPreview={soundPresetPreviewSummary}
            presetPreviewId={soundPresetPreviewId}
            presetResult={soundPresetResult}
            sound={project.sound}
            soundSnapshots={soundSnapshots}
            soundSnapshotSummary={soundSnapshotComparison}
            timbreCheck={soundTimbreCheckSummary}
            onChange={updateSoundDesign}
            onApplyPreset={applySoundPreset}
            onDrumKitPad={applyDrumKitPad}
            onFocusPad={applySoundFocusPad}
            onCaptureSoundSnapshot={captureSoundSnapshot}
            onRecallSoundSnapshot={recallSoundSnapshot}
            onClearSoundSnapshots={clearSoundSnapshots}
            onPreviewPreset={previewSoundPreset}
          />
          <ChordEditor
            chordPads={chordPadOptions}
            chordClipboard={chordClipboard}
            chordMovePreview={chordMovePreviewSummary}
            chordMoveResult={chordMoveResult}
            chordRhythms={chordRhythmOptions}
            chordVoicings={chordVoicingOptions}
            chords={currentPattern.chordEvents}
            currentStep={currentEditorStep}
            currentKey={project.key}
            rootOptions={chordRootOptions}
            selectedIndex={selectedChordIndex}
            beatDuplicateStep={selectedChordBeatDuplicateStep}
            previousBeatDuplicateStep={selectedChordPreviousBeatDuplicateStep}
            onAdd={addChordEvent}
            onChange={updateChordEvent}
            onCopy={copySelectedChord}
            onDelete={deleteChordEvent}
            onDuplicate={duplicateSelectedChord}
            onDuplicateBeat={() => {
              if (selectedChordBeatDuplicateStep !== null) {
                duplicateSelectedChordToStep(selectedChordBeatDuplicateStep);
              }
            }}
            onDuplicatePreviousBeat={() => {
              if (selectedChordPreviousBeatDuplicateStep !== null) {
                duplicateSelectedChordToStep(selectedChordPreviousBeatDuplicateStep);
              }
            }}
            onInvert={moveSelectedChordInversion}
            onMoveStep={moveSelectedChordStep}
            onAudition={auditionSelectedChord}
            onPad={applyChordPad}
            onPaste={pasteCopiedChord}
            onPreset={applyChordProgressionPreset}
            onRhythm={applyChordRhythm}
            onSelect={selectChordEvent}
            onVoicing={applyChordVoicingPad}
          />
          {editorAuditionResult?.kind === "chord" && <EditorAuditionResultStrip result={editorAuditionResult} />}
          {selectedEventDeleteResult?.kind === "chord" && <SelectedEventDeleteResultStrip result={selectedEventDeleteResult} />}
        </section>

        <section className="panel arrangement-panel" data-testid="workflow-target-arrange" aria-label="Arrangement" ref={arrangePanelRef}>
          <PanelTitle icon={<Music2 size={18} />} title="Arrangement" meta={`${project.arrangement.length} blocks / ${barCountLabel(arrangementTotalBars(project))}`} />
          <ArrangementTemplateControls
            preview={arrangementTemplatePreviewSummary}
            result={arrangementTemplateResult}
            onApply={applyArrangementTemplate}
          />
          <ArrangementArcPads
            pads={arrangementArcPadOptions}
            preview={arrangementArcPreviewSummary}
            result={arrangementArcResult}
            onApply={applyArrangementArcPad}
          />
          <SectionLocatorPads disabled={isPlaying} pads={sectionLocatorPads} result={sectionCueResult} onCue={cueSectionLocator} />
          <div className="pattern-chain-row" aria-label="Pattern chain">
            <PatternChainPreview preview={patternChainPreviewSummary} />
            <PatternChainPreviewDecision
              summary={createPatternChainPreviewDecision(patternChainPreviewSummary)}
              onRun={runPatternChainPriorityAction}
            />
            <PatternChainPriorityReadout summary={patternChainPrioritySummary} onRun={runPatternChainPriorityAction} />
            <div className="pattern-chain-heading">
              <span>Chain</span>
              <strong data-testid="pattern-chain-current">{patternChainReadout(project.arrangement)}</strong>
            </div>
            <button
              className="pattern-chain-expand"
              data-testid="pattern-chain-expand"
              onClick={expandPatternChain}
              title="Expand the current chain into a longer song form"
              type="button"
            >
              <ArrowRight size={14} aria-hidden="true" />
              <span>Expand</span>
              <small>{barCountLabel(16)} song form</small>
            </button>
            <div className="pattern-chain-actions">
              {patternChainIds.map((chain) => {
                const chainBlocks = createPatternChain(chain);
                const chainBars = chainBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
                return (
                  <button
                    data-testid={`pattern-chain-${chain}`}
                    key={chain}
                    onClick={() => applyPatternChain(chain)}
                    title={`Apply ${patternChainLabel(chain)}`}
                    type="button"
                  >
                    <ArrowRight size={14} aria-hidden="true" />
                    <span>{patternChainLabel(chain)}</span>
                    <small>{patternChainReadout(chainBlocks)} / {barCountLabel(chainBars)}</small>
                  </button>
                );
              })}
            </div>
            <div className="pattern-chain-editor" aria-label="Pattern chain step editor" data-testid="pattern-chain-step-editor">
              {project.arrangement.slice(0, 8).map((block, index) => {
                const nextPattern = nextPatternSlot(block.pattern);
                return (
                  <button
                    aria-label={`Chain step ${index + 1} ${block.section} Pattern ${block.pattern}, ${barCountLabel(block.bars)}. Switch to Pattern ${nextPattern}`}
                    className={selectedArrangementIndex === index ? "selected" : ""}
                    data-testid={`pattern-chain-step-${index}`}
                    key={`${block.section}-${index}-${block.pattern}`}
                    onClick={() => cyclePatternChainStep(index)}
                    title={`Switch step ${index + 1} to Pattern ${nextPattern}`}
                    type="button"
                  >
                    <span>Step {index + 1}</span>
                    <strong data-testid={`pattern-chain-step-pattern-${index}`}>{block.pattern}</strong>
                    <small>
                      {block.section} {normalizeArrangementBars(block.bars)}b
                    </small>
                  </button>
                );
              })}
            </div>
            {patternChainResult && <PatternChainResultStrip result={patternChainResult} />}
          </div>
          <ArrangementFocusPanel
            preview={arrangementFocusPreviewSummary}
            result={arrangementFocusResult}
            summary={selectedArrangementFocus}
            onApply={applyArrangementFocusPreset}
          />
          <ArrangementMuteMap
            focusedLaneId={arrangementMuteMapFocusId}
            onFocus={focusArrangementMuteMapLane}
            playingArrangementIndex={playingArrangementIndex}
            result={arrangementMuteMapResult}
            summary={arrangementMuteMapSummary}
          />
          <ArrangementTransitionMap
            cuedTransitionId={transportLoopScope === "transition" ? arrangementTransitionLoopTarget?.transition.id ?? null : null}
            isPlaying={isPlaying}
            focusedTransitionId={arrangementTransitionMapFocusId}
            onCue={cueArrangementTransition}
            onFocus={focusArrangementTransitionMapTransition}
            playingArrangementIndex={playingArrangementIndex}
            result={arrangementTransitionMapResult}
            summary={arrangementTransitionMapSummary}
          />
          <div
            className={["arrangement-playback-readout", arrangementPlaybackReadout.tone].join(" ")}
            data-testid="arrangement-playback-readout"
            title={arrangementPlaybackReadout.detailTitle}
          >
            <span data-testid="arrangement-playback-label">{arrangementPlaybackReadout.roleLabel}</span>
            <strong data-testid="arrangement-playback-status">{arrangementPlaybackReadout.statusLabel}</strong>
            <small data-testid="arrangement-playback-detail">{arrangementPlaybackReadout.detailLabel}</small>
            <button
              aria-label={
                audibleArrangementFollowBlock
                  ? `Edit audible Block ${audibleArrangementFollowBlockNumber}`
                  : editingAudibleArrangementBlock
                    ? "Editing block already matches audible block"
                    : "No audible arrangement block to follow"
              }
              className="arrangement-playback-follow-button"
              data-testid="arrangement-playback-follow"
              disabled={!audibleArrangementFollowBlock}
              onClick={followAudibleArrangementBlock}
              title={
                audibleArrangementFollowBlock
                  ? `Switch edit focus to audible Block ${audibleArrangementFollowBlockNumber}`
                  : editingAudibleArrangementBlock
                    ? "Editing block already matches audible block"
                    : "Play Song loop with another block to follow the audible block"
              }
              type="button"
            >
              <ArrowRight size={13} aria-hidden="true" />
              <span>
                {audibleArrangementFollowBlock
                  ? `Edit ${audibleArrangementFollowBlockNumber}`
                  : editingAudibleArrangementBlock
                    ? "In sync"
                    : "Idle"}
              </span>
            </button>
          </div>
          <div className="arrangement-track">
            {project.arrangement.map((block, index) => {
              const selected = selectedArrangementIndex === index;
              const playing = playingArrangementIndex === index;
              return (
                <button
                  aria-label={`Block ${index + 1} ${block.section} Pattern ${block.pattern} ${barCountLabel(block.bars)}`}
                  aria-pressed={selected}
                  className={["arrangement-block", selected ? "selected" : "", playing ? "playing" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  data-playing={playing ? "true" : "false"}
                  data-testid={`arrangement-block-${index}`}
                  key={`${block.section}-${index}`}
                  onClick={() => selectArrangementBlock(index)}
                  type="button"
                >
                  <span>{block.section}</span>
                  <strong>{block.pattern}</strong>
                  <small>{barCountLabel(block.bars)}</small>
                  {block.mutedTracks.length > 0 && <em>{block.mutedTracks.length} mute</em>}
                  <i style={{ inlineSize: `${Math.max(18, block.energy * 100)}%` }} />
                </button>
              );
            })}
          </div>
          {selectedArrangementBlock && (
            <div className="arrangement-editor" aria-label="Selected arrangement block editor">
              <div className="arrangement-editor-heading">
                <span>Block {selectedArrangementIndex + 1}</span>
                <strong>
                  {selectedArrangementBlock.section} / Pattern {selectedArrangementBlock.pattern}
                </strong>
                <small>{barCountLabel(selectedArrangementBlock.bars)}</small>
              </div>
              {selectedArrangementBlockRole && (
                <div
                  className={
                    selectedArrangementBlockRole.isShaped
                      ? "arrangement-block-role-readout shaped"
                      : "arrangement-block-role-readout"
                  }
                  data-testid="arrangement-block-role-readout"
                >
                  <span data-testid="arrangement-block-role-timeline">{selectedArrangementBlockRole.timelineLabel}</span>
                  <strong data-testid="arrangement-block-role-label">{selectedArrangementBlockRole.roleLabel}</strong>
                  <small data-testid="arrangement-block-role-detail">{selectedArrangementBlockRole.detailLabel}</small>
                </div>
              )}
              <label>
                <span>Section</span>
                <select
                  data-testid="arrangement-section-select"
                  value={selectedArrangementBlock.section}
                  onChange={(event) =>
                    updateArrangementBlock(selectedArrangementIndex, { section: event.target.value as ArrangementSection })
                  }
                >
                  {arrangementSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </label>
              <div className="block-pattern-row" aria-label="Block pattern">
                {patternSlots.map((pattern) => (
                  <button
                    key={pattern}
                    className={selectedArrangementBlock.pattern === pattern ? "selected" : ""}
                    data-testid={`arrangement-pattern-${pattern}`}
                    type="button"
                    onClick={() => updateArrangementBlock(selectedArrangementIndex, { pattern })}
                  >
                    <span>{pattern}</span>
                    <small>{patternEventCount(project.patterns[pattern])}</small>
                  </button>
                ))}
              </div>
              <div className="arrangement-mute-row" aria-label="Block track mutes">
                {arrangementMuteTrackIds.map((track) => {
                  const muted = selectedArrangementBlock.mutedTracks.includes(track);
                  return (
                    <button
                      aria-pressed={muted}
                      className={muted ? "selected" : ""}
                      data-testid={`arrangement-track-mute-${track}`}
                      key={track}
                      onClick={() => toggleArrangementTrackMute(track)}
                      title={`${muted ? "Unmute" : "Mute"} ${arrangementMuteTrackLabel(track)} in this block`}
                      type="button"
                    >
                      {arrangementMuteTrackLabel(track)}
                    </button>
                  );
                })}
              </div>
              <ArrangementMovePreviewDecision
                summary={createArrangementMovePreviewDecision(arrangementMovePrioritySummary)}
                onApply={() => {
                  if (arrangementMovePrioritySummary.presetId !== "none") {
                    applyArrangementMoveToSelected(arrangementMovePrioritySummary.presetId);
                  }
                }}
              />
              <ArrangementMovePriorityReadout summary={arrangementMovePrioritySummary} onApply={applyArrangementMoveToSelected} />
              <div className="arrangement-move-row" aria-label="Arrangement moves">
                {arrangementMovePresetIds.map((preset) => (
                  <button
                    data-testid={`arrangement-move-${preset}`}
                    key={preset}
                    onClick={() => applyArrangementMoveToSelected(preset)}
                    title={`Apply ${arrangementMovePresetLabel(preset)} move to selected block`}
                    type="button"
                  >
                    {arrangementMovePresetLabel(preset)}
                  </button>
                ))}
              </div>
              {arrangementMoveResult?.blockIndex === selectedArrangementIndex && (
                <ArrangementMoveResultStrip result={arrangementMoveResult} />
              )}
              <SelectedBlockEditPreviewDecision
                summary={createSelectedBlockEditPreviewDecision(selectedBlockEditPrioritySummary)}
                onRun={runSelectedBlockEditPriorityAction}
              />
              <SelectedBlockEditPriorityReadout
                summary={selectedBlockEditPrioritySummary}
                onRun={runSelectedBlockEditPriorityAction}
              />
              <div className="arrangement-clipboard-row" aria-label="Arrangement block clipboard">
                <button
                  data-testid="arrangement-copy"
                  onClick={copySelectedArrangementBlock}
                  title="Copy selected arrangement block"
                  type="button"
                >
                  <Copy size={14} aria-hidden="true" />
                  <span>Copy Block</span>
                </button>
                <button
                  data-testid="arrangement-paste"
                  disabled={!arrangementBlockClipboard}
                  onClick={pasteArrangementBlockAfterSelected}
                  title="Paste copied arrangement block after the selected block"
                  type="button"
                >
                  <Plus size={14} aria-hidden="true" />
                  <span>Paste After</span>
                </button>
                <small data-testid="arrangement-clipboard-detail">
                  {arrangementBlockClipboard
                    ? `Clipboard ${arrangementBlockClipboard.section} ${arrangementBlockClipboard.pattern} / ${barCountLabel(arrangementBlockClipboard.bars)}`
                    : "Clipboard empty"}
                </small>
              </div>
              <label>
                <span>Bars</span>
                <input
                  aria-label="Arrangement block bars"
                  data-testid="arrangement-bars-input"
                  type="number"
                  min={minArrangementBars}
                  max={maxArrangementBars}
                  step={1}
                  value={selectedArrangementBlock.bars}
                  onChange={(event) =>
                    updateArrangementBlock(selectedArrangementIndex, { bars: Number(event.target.value) })
                  }
                />
              </label>
              <label>
                <span>Split after</span>
                <input
                  aria-label="Split arrangement block after bars"
                  data-testid="arrangement-split-after"
                  disabled={!canSplitArrangementBlock}
                  type="number"
                  min={1}
                  max={Math.max(1, selectedArrangementBars - 1)}
                  step={1}
                  value={clampSplitAfterBars(splitAfterBars, selectedArrangementBars)}
                  onChange={(event) => setSplitAfterBars(clampSplitAfterBars(Number(event.target.value), selectedArrangementBars))}
                />
              </label>
              <label>
                <span title={`${arrangementEnergyGain(selectedArrangementBlock.energy).toFixed(2)}x gain`}>
                  Energy {Math.round(selectedArrangementBlock.energy * 100)}%
                </span>
                <div className="energy-inputs">
                  <input
                    data-testid="arrangement-energy-slider"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={selectedArrangementBlock.energy}
                    onChange={(event) =>
                      updateArrangementBlock(selectedArrangementIndex, { energy: Number(event.target.value) })
                    }
                  />
                  <input
                    aria-label="Arrangement energy percent"
                    data-testid="arrangement-energy-input"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(selectedArrangementBlock.energy * 100)}
                    onChange={(event) =>
                      updateArrangementBlock(selectedArrangementIndex, { energy: Number(event.target.value) / 100 })
                    }
                  />
                </div>
              </label>
              <div className="arrangement-actions" aria-label="Arrangement structure actions">
                <button
                  data-testid="arrangement-move-left"
                  disabled={selectedArrangementIndex === 0}
                  onClick={() => moveArrangementBlock(-1)}
                  title="Move selected block left"
                  type="button"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  <span>Move</span>
                </button>
                <button
                  data-testid="arrangement-move-right"
                  disabled={selectedArrangementIndex >= project.arrangement.length - 1}
                  onClick={() => moveArrangementBlock(1)}
                  title="Move selected block right"
                  type="button"
                >
                  <ArrowRight size={15} aria-hidden="true" />
                  <span>Move</span>
                </button>
                <button
                  data-testid="arrangement-duplicate"
                  onClick={duplicateArrangementBlock}
                  title="Duplicate selected block"
                  type="button"
                >
                  <Copy size={15} aria-hidden="true" />
                  <span>Duplicate</span>
                </button>
                <button
                  data-testid="arrangement-split"
                  disabled={!canSplitArrangementBlock}
                  onClick={splitArrangementBlock}
                  title="Split selected block"
                  type="button"
                >
                  <Scissors size={15} aria-hidden="true" />
                  <span>Split</span>
                </button>
                <button
                  data-testid="arrangement-merge"
                  disabled={!canMergeArrangementBlock}
                  onClick={mergeArrangementBlock}
                  title="Merge selected block with next block"
                  type="button"
                >
                  <Plus size={15} aria-hidden="true" />
                  <span>Merge</span>
                </button>
                <button
                  data-testid="arrangement-delete"
                  disabled={project.arrangement.length <= 1}
                  onClick={deleteArrangementBlock}
                  title="Delete selected block"
                  type="button"
                >
                  <Trash2 size={15} aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </div>
              {selectedBlockEditResult?.blockIndex === selectedArrangementIndex && (
                <SelectedBlockEditResultStrip result={selectedBlockEditResult} />
              )}
            </div>
          )}
        </section>

        <section className="panel mixer-panel" data-testid="workflow-target-mix" aria-label="Mixer" ref={mixPanelRef}>
          <PanelTitle icon={<SlidersHorizontal size={18} />} title="Mixer" meta={`${activeChannels} audible`} />
          <MixBalancePads
            pads={mixBalancePadOptions}
            preview={mixBalancePreviewSummary}
            result={mixBalanceResult}
            onApply={applyMixBalancePad}
          />
          <SpaceFxPads
            pads={spaceFxPadOptions}
            preview={spaceFxPreviewSummary}
            result={spaceFxResult}
            onApply={applySpaceFxPad}
          />
          <StemAuditionPads pads={stemAuditionPadOptions} onApply={applyStemAuditionPad} />
          <div
            className={["stem-audition-readout", stemAuditionReadout.tone].join(" ")}
            data-testid="stem-audition-readout"
            title={stemAuditionReadout.detailTitle}
          >
            <span data-testid="stem-audition-status">{stemAuditionReadout.statusLabel}</span>
            <strong data-testid="stem-audition-label">{stemAuditionReadout.roleLabel}</strong>
            <small data-testid="stem-audition-detail">{stemAuditionReadout.detailLabel}</small>
          </div>
          <div
            className={["stem-audition-decision", stemAuditionDecision.tone].join(" ")}
            data-stem-audition-decision={stemAuditionDecision.targetId ?? "none"}
            data-testid="stem-audition-decision"
            title={stemAuditionDecision.detailTitle}
          >
            <span data-testid="stem-audition-decision-status">{stemAuditionDecision.statusLabel}</span>
            <strong data-testid="stem-audition-decision-target">{stemAuditionDecision.targetLabel}</strong>
            <small data-testid="stem-audition-decision-detail">{stemAuditionDecision.detailLabel}</small>
            <small data-testid="stem-audition-decision-next-check">{stemAuditionDecision.nextCheckLabel}</small>
            <button
              className="stem-audition-decision-action"
              data-stem-audition-decision-action={stemAuditionDecision.targetId ?? "none"}
              data-testid="stem-audition-decision-run"
              disabled={stemAuditionDecision.targetId === null}
              onClick={() => {
                if (stemAuditionDecision.targetId) {
                  applyStemAuditionPad(stemAuditionDecision.targetId);
                }
              }}
              title={
                stemAuditionDecision.targetId
                  ? `Run ${stemAuditionDecision.targetLabel}: ${stemAuditionDecision.nextCheckLabel}`
                  : stemAuditionDecision.detailTitle
              }
              type="button"
            >
              <Play size={13} aria-hidden="true" />
              <span>{stemAuditionDecision.targetLabel}</span>
            </button>
          </div>
          <MixSnapshotAB
            snapshots={mixSnapshots}
            summary={mixSnapshotComparison}
            onCapture={captureMixSnapshot}
            onRecall={recallMixSnapshot}
            onClear={clearMixSnapshots}
          />
          <div className="mixer-strips">
            {project.mixer.map((channel) => {
              const roleSummary = mixerChannelRoleSummary(channel);
              return (
                <div className="strip" key={channel.id} style={{ "--strip": channel.accent } as CSSProperties}>
                <div className="strip-top">
                  <span>{channel.name}</span>
                  <div className="strip-toggles">
                    <button
                      className={channel.muted ? "mini-toggle active" : "mini-toggle"}
                      data-testid={`mixer-mute-${channel.id}`}
                      type="button"
                      onClick={() => updateMixerChannel(channel.id, { muted: !channel.muted })}
                    >
                      M
                    </button>
                    <button
                      className={channel.solo ? "mini-toggle active solo" : "mini-toggle"}
                      data-testid={`mixer-solo-${channel.id}`}
                      disabled={channel.id === "master"}
                      type="button"
                      onClick={() => updateMixerChannel(channel.id, { solo: !channel.solo })}
                    >
                      S
                    </button>
                  </div>
                </div>
                <div
                  className={roleSummary.isShaped ? "mixer-channel-role-readout shaped" : "mixer-channel-role-readout"}
                  data-testid={`mixer-channel-role-${channel.id}`}
                >
                  <span data-testid={`mixer-channel-role-level-${channel.id}`}>{roleSummary.levelLabel}</span>
                  <strong data-testid={`mixer-channel-role-label-${channel.id}`}>{roleSummary.roleLabel}</strong>
                  <small data-testid={`mixer-channel-role-detail-${channel.id}`}>{roleSummary.detailLabel}</small>
                </div>
                <label className="strip-control">
                  <span>Volume</span>
                  <input
                    aria-label={`${channel.name} volume`}
                    data-testid={`mixer-volume-${channel.id}`}
                    max={3}
                    min={-36}
                    onChange={(event) => updateMixerChannel(channel.id, { volumeDb: Number(event.target.value) })}
                    step={0.1}
                    type="range"
                    value={channel.volumeDb}
                  />
                </label>
                <label className="strip-control">
                  <span>Pan</span>
                  <div className="pan-inputs">
                    <input
                      aria-label={`${channel.name} pan`}
                      data-testid={`mixer-pan-${channel.id}`}
                      max={100}
                      min={-100}
                      onChange={(event) => updateMixerChannel(channel.id, { pan: clampPan(Number(event.target.value)) })}
                      step={1}
                      type="range"
                      value={channel.pan}
                    />
                    <input
                      aria-label={`${channel.name} pan value`}
                      data-testid={`mixer-pan-input-${channel.id}`}
                      max={100}
                      min={-100}
                      onChange={(event) => updateMixerChannel(channel.id, { pan: clampPan(Number(event.target.value)) })}
                      step={1}
                      type="number"
                      value={channel.pan}
                    />
                  </div>
                </label>
                {isStemTrackId(channel.id) && (
                  <StemLevelMeter analysis={stemAnalyses[channel.id]} trackId={channel.id} />
                )}
                {channel.id !== "master" && (
                  <div className="eq-controls" aria-label={`${channel.name} channel EQ`}>
                    <label className="strip-control">
                      <span>Low cut</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} low cut`}
                          data-testid={`mixer-low-cut-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { lowCut: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.lowCut}
                        />
                        <input
                          aria-label={`${channel.name} low cut percent`}
                          data-testid={`mixer-low-cut-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { lowCut: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.lowCut * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Air</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} air`}
                          data-testid={`mixer-air-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { air: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.air}
                        />
                        <input
                          aria-label={`${channel.name} air percent`}
                          data-testid={`mixer-air-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { air: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.air * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Drive</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} drive`}
                          data-testid={`mixer-drive-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { drive: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.drive}
                        />
                        <input
                          aria-label={`${channel.name} drive percent`}
                          data-testid={`mixer-drive-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { drive: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.drive * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Glue</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} glue`}
                          data-testid={`mixer-glue-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { glue: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.glue}
                        />
                        <input
                          aria-label={`${channel.name} glue percent`}
                          data-testid={`mixer-glue-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { glue: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.glue * 100)}
                        />
                      </div>
                    </label>
                    <label className="strip-control">
                      <span>Space</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={`${channel.name} space send`}
                          data-testid={`mixer-send-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { send: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.send}
                        />
                        <input
                          aria-label={`${channel.name} space send percent`}
                          data-testid={`mixer-send-input-${channel.id}`}
                          max={100}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { send: Number(event.target.value) / 100 })}
                          step={1}
                          type="number"
                          value={Math.round(channel.send * 100)}
                        />
                      </div>
                    </label>
                  </div>
                )}
                <div className="strip-readout">
                  <span>{channel.volumeDb} dB</span>
                  <span>{panLabel(channel.pan)}</span>
                  {channel.id !== "master" && (
                    <>
                      <span>Cut {percentLabel(channel.lowCut)}</span>
                      <span>Air {percentLabel(channel.air)}</span>
                      <span>Drive {percentLabel(channel.drive)}</span>
                      <span>Glue {percentLabel(channel.glue)}</span>
                      <span>Space {percentLabel(channel.send)}</span>
                    </>
                  )}
                </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel master-panel" data-testid="workflow-target-master" aria-label="Master" ref={masterPanelRef}>
          <PanelTitle icon={<Gauge size={18} />} title="Master" meta="export ready" />
          <div className="master-readout">
            <strong>{project.masterPreset}</strong>
            <span>{project.masterCeilingDb} dB ceiling</span>
          </div>
          <div
            className={
              masterOutputRoleSummary.isAtRisk
                ? "master-output-role-readout risk"
                : "master-output-role-readout"
            }
            aria-label={masterOutputRoleSummary.detailTitle}
            data-testid="master-output-role-readout"
            title={masterOutputRoleSummary.detailTitle}
          >
            <span data-testid="master-output-role-status">{masterOutputRoleSummary.statusLabel}</span>
            <strong data-testid="master-output-role-label">{masterOutputRoleSummary.roleLabel}</strong>
            <small data-testid="master-output-role-level">{masterOutputRoleSummary.levelLabel}</small>
            <small data-testid="master-output-role-detail">{masterOutputRoleSummary.detailLabel}</small>
          </div>
          <FinishChecklist
            summary={finishChecklistSummary}
            focusedCardId={finishChecklistFocusId}
            result={finishChecklistResult}
            onFocus={focusFinishChecklistCard}
          />
          <ReviewQueue
            summary={reviewQueueSummary}
            focusedItemId={reviewQueueFocusId}
            result={reviewQueueResult}
            fixResult={reviewFixResult}
            project={project}
            onFix={applyReviewFix}
            onFocus={focusReviewQueueItem}
          />
          <ExportMeter analysis={exportAnalysis} />
          <MixCoach
            checks={mixCoachChecks}
            focusedCheckId={mixCoachFocusId}
            focusSummary={mixCoachFocusSummary}
            focusResult={mixCoachResult}
            fixPreview={mixFixPreviewSummary}
            fixes={mixFixActions}
            result={mixFixResult}
            onApplyFix={applyMixFixPreset}
            onFocusCheck={focusMixCoachCheck}
          />
          <MasterFinishPads
            pads={masterFinishPadOptions}
            preview={masterFinishPreviewSummary}
            result={masterFinishResult}
            onApply={(pad) => applyMasterFinishPad(pad, { showResult: true })}
          />
          <MasterAutomationPads
            pads={masterAutomationPadOptions}
            preview={masterAutomationPreviewSummary}
            result={masterAutomationResult}
            onApply={applyMasterAutomationPad}
          />
          <label>
            <span>Ceiling</span>
            <input
              data-testid="master-ceiling"
              type="range"
              min={-6}
              max={0}
              step={0.1}
              value={project.masterCeilingDb}
              onChange={(event) =>
                updateProject((current) => ({ ...current, masterCeilingDb: Number(event.target.value) }))
              }
            />
          </label>
          <div className="preset-row">
            {masterPresets.map((preset) => (
              <button
                key={preset}
                className={project.masterPreset === preset ? "selected" : ""}
                data-testid={`master-preset-${preset}`}
                type="button"
                onClick={() => applyMasterPreset(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
