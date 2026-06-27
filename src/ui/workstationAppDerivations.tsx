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
  PatternContrastRole,
  PatternContrastRoleMapSummary,
  PatternContrastSlotSummary,
  PatternContrastSummary,
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



function workflowCountLabel(count: number, label: string): string {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function readinessCheckForId(checks: BeatReadinessCheck[], id: string): BeatReadinessCheck | undefined {
  return checks.find((check) => check.id === id);
}

function suggestedMasterFinishPad(project: ProjectState): MasterFinishPadId {
  const target = activeDeliveryTarget(project);

  switch (target.id) {
    case "vocal_session":
      return "vocal";
    case "beat_store":
      return "store";
    case "club_demo":
      return "club";
    case "starter_sketch":
    case "custom":
      if (target.mixPosture === "vocal_headroom") {
        return "vocal";
      }
      if (target.mixPosture === "club_forward") {
        return "club";
      }
      return target.preferredMasterPreset === "Streaming Safe" ? "store" : "demo";
  }
}

function isDeliveryTargetAligned(project: ProjectState, target: DeliveryTarget): boolean {
  return (
    project.deliveryTarget === target.id &&
    project.masterPreset === target.preferredMasterPreset &&
    arrangementTotalBars(project) >= target.targetBars
  );
}

const sessionBriefFields: (keyof SessionBrief)[] = ["artist", "vibe", "reference", "notes"];

function sessionBriefFilledFields(brief: SessionBrief): number {
  return sessionBriefFields.filter((field) => brief[field].trim().length > 0).length;
}

function composerActionStyleProfile(project: ProjectState): ComposerStyleActionProfile {
  return composerStyleActionProfiles[project.styleId];
}

function composerActionTone(current: number, goal: number): MixCoachTone {
  if (current >= goal) {
    return "good";
  }
  return current > 0 ? "warn" : "danger";
}

function basslinePadLabel(pad: BasslinePadId): string {
  return basslinePadDefinitions.find((definition) => definition.id === pad)?.label ?? pad;
}

function drumFoundationLabel(foundation: DrumFoundationId): string {
  return drumFoundationDefinitions.find((definition) => definition.id === foundation)?.label ?? foundation;
}

function melodyMotifLabel(motif: MelodyMotifId): string {
  return melodyMotifDefinitions.find((definition) => definition.id === motif)?.label ?? motif;
}

type ArrangementTransitionLoopTarget = {
  transition: ArrangementTransitionMapTransition;
  startBar: number;
  endBar: number;
  bars: number;
};

function compactSectionFlow(arrangement: ArrangementBlock[]): string {
  const compact = arrangement.reduce<ArrangementSection[]>((sections, block) => {
    if (sections[sections.length - 1] !== block.section) {
      sections.push(block.section);
    }
    return sections;
  }, []);
  return compact.length > 0 ? compact.join(">") : "No blocks";
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

function structureHookSignal(project: ProjectState): StructureLensSignal {
  const hookBlocks = project.arrangement.filter((block) => block.section === "Hook");
  if (hookBlocks.length === 0) {
    return {
      id: "hook",
      label: "Hook",
      value: "Missing",
      detail: "Add a main section",
      tone: "danger"
    };
  }

  const hookEnergy = Math.max(...hookBlocks.map((block) => normalizeArrangementEnergy(block.energy)));
  const nonHookBlocks = project.arrangement.filter((block) => block.section !== "Hook");
  const comparisonBlocks = nonHookBlocks.length > 0 ? nonHookBlocks : project.arrangement;
  const comparisonEnergy =
    comparisonBlocks.reduce((total, block) => total + normalizeArrangementEnergy(block.energy), 0) / comparisonBlocks.length;
  const contrast = hookEnergy - comparisonEnergy;
  const tone: MixCoachTone = hookEnergy >= 0.86 && contrast >= 0.12 ? "good" : hookEnergy >= 0.74 && contrast >= 0.04 ? "warn" : "danger";

  return {
    id: "hook",
    label: "Hook",
    value: percentLabel(hookEnergy),
    detail: `${signedPercentLabel(contrast)} over other sections`,
    tone
  };
}

function structureArcSignal(project: ProjectState): StructureLensSignal {
  const energies = project.arrangement.map((block) => normalizeArrangementEnergy(block.energy));
  const low = Math.min(...energies);
  const high = Math.max(...energies);
  const spread = high - low;
  const first = energies[0] ?? 0;
  const last = energies[energies.length - 1] ?? first;
  const hasRelease = last <= high - 0.18 || project.arrangement.some((block) => block.section === "Outro");
  const tone: MixCoachTone = spread >= 0.36 && high >= 0.86 && hasRelease ? "good" : spread >= 0.22 ? "warn" : "danger";

  return {
    id: "arc",
    label: "Energy Arc",
    value: `${Math.round(spread * 100)}% spread`,
    detail: `low ${percentLabel(low)} / high ${percentLabel(high)}`,
    tone
  };
}

function createStructureLensSummary(project: ProjectState): StructureLensSummary {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const sectionLabels = arrangementSections.filter((section) => project.arrangement.some((block) => block.section === section));
  const hasVerse = sectionLabels.includes("Verse");
  const hasHook = sectionLabels.includes("Hook");
  const targetTone: MixCoachTone = bars >= target.targetBars ? "good" : bars >= Math.min(8, target.targetBars) ? "warn" : "danger";
  const sectionTone: MixCoachTone =
    hasVerse && hasHook && sectionLabels.length >= 4 ? "good" : hasHook && sectionLabels.length >= 3 ? "warn" : "danger";
  const hookSignal = structureHookSignal(project);
  const arcSignal = structureArcSignal(project);
  const signals: StructureLensSignal[] = [
    {
      id: "target",
      label: "Target Fit",
      value: `${bars}/${target.targetBars} bars`,
      detail: target.name,
      tone: targetTone
    },
    {
      id: "sections",
      label: "Sections",
      value: `${sectionLabels.length}/${arrangementSections.length}`,
      detail: sectionLabels.length > 0 ? sectionLabels.join("/") : "No arrangement blocks",
      tone: sectionTone
    },
    hookSignal,
    arcSignal
  ];
  const tone = weakestTone(signals.map((signal) => signal.tone));
  const headline =
    tone === "good" ? "Song shape reads clearly" : tone === "warn" ? "Song shape needs contrast" : "Build a clearer song shape";
  const detail = `${barCountLabel(bars)} / ${target.name} / ${usedPatternSlots(project).join("/") || project.selectedPattern}`;

  return {
    headline,
    detail,
    tone,
    signals
  };
}

export function createArrangementTemplatePreviewSummary(arrangement: ArrangementBlock[]): ArrangementTemplatePreviewSummary {
  const currentBars = arrangementBlocksTotalBars(arrangement);
  const candidates = arrangementTemplateIds.map((template) => ({
    templateId: template,
    templateLabel: arrangementTemplateLabel(template),
    arrangement: createArrangementTemplate(template)
  }));
  const preferredTemplateId: ArrangementTemplateId = currentBars <= 8 ? "full" : currentBars < 16 ? "full" : "hook_first";
  const preferredCandidate =
    candidates.find((candidate) => candidate.templateId === preferredTemplateId) ??
    candidates.find((candidate) => candidate.templateId === "full") ??
    candidates[0];
  const candidate =
    preferredCandidate && arrangementTemplateChangedFieldCount(arrangement, preferredCandidate.arrangement) > 0
      ? preferredCandidate
      : candidates.find((entry) => arrangementTemplateChangedFieldCount(arrangement, entry.arrangement) > 0);

  if (!candidate) {
    return {
      templateId: "aligned",
      changedBlockCount: 0,
      changedFieldCount: 0,
      statusLabel: "Template aligned",
      templateLabel: "No template target",
      sectionLabel: arrangementTemplatePreviewSectionLabel(arrangement),
      patternLabel: arrangementArcPreviewPatternLabel(arrangement),
      energyLabel: arrangementArcPreviewEnergyLabel(arrangement),
      moveLabel: "0 blocks / 0 fields",
      detailTitle: "Current arrangement already matches available Arrangement Template targets.",
      tone: "good"
    };
  }

  const changedBlocks = arrangementTemplateChangedBlockCount(arrangement, candidate.arrangement);
  const changedFields = arrangementTemplateChangedFieldCount(arrangement, candidate.arrangement);
  const tone: MixCoachTone = changedFields === 0 ? "good" : changedBlocks <= 3 ? "warn" : "danger";
  const sectionLabel = arrangementTemplatePreviewSectionLabel(candidate.arrangement);
  const patternLabel = arrangementArcPreviewPatternLabel(candidate.arrangement);
  const energyLabel = arrangementArcPreviewEnergyLabel(candidate.arrangement);
  const moveLabel = `${changedBlocks} blocks / ${changedFields} fields`;

  return {
    templateId: candidate.templateId,
    changedBlockCount: changedBlocks,
    changedFieldCount: changedFields,
    statusLabel: changedFields === 0 ? "Template aligned" : "Suggested template",
    templateLabel: candidate.templateLabel,
    sectionLabel,
    patternLabel,
    energyLabel,
    moveLabel,
    detailTitle:
      changedFields === 0
        ? `${candidate.templateLabel} already matches the current arrangement posture.`
        : `${candidate.templateLabel}: ${sectionLabel}; ${patternLabel}; ${energyLabel}; ${moveLabel}.`,
    tone
  };
}

export function createArrangementTemplatePrioritySummary(preview: ArrangementTemplatePreviewSummary): ArrangementTemplatePrioritySummary {
  const statusLabel =
    preview.templateId === "aligned"
      ? "Template aligned"
      : preview.templateId === "loop"
        ? "Tighten loop"
        : preview.templateId === "full"
          ? "Build full beat"
          : preview.templateId === "hook_first"
            ? "Lead with hook"
            : "Shape breakdown";
  const reasonLabel =
    preview.templateId === "aligned"
      ? "Current arrangement already matches available Arrangement Template targets."
      : preview.templateId === "loop"
        ? "Keep the structure compact before expanding the beat."
        : preview.templateId === "full"
          ? "Open the current loop into a full editable beat structure."
          : preview.templateId === "hook_first"
            ? "Put hook contrast first so the song shape is obvious sooner."
            : "Add breakdown contrast before returning to the main beat.";
  const scopeLabel = `${preview.sectionLabel} / ${preview.patternLabel}`;
  const nextCheckLabel =
    preview.templateId === "aligned"
      ? "Audition Song, then inspect Song Form before more template changes."
      : preview.templateId === "loop"
        ? "Apply, then build Pattern A/B/C contrast before expanding."
        : preview.templateId === "full"
          ? "Apply, then audition Song and inspect Transition Map."
          : preview.templateId === "hook_first"
            ? "Apply, then cue Hook and inspect Song Form priority."
            : "Apply, then audition breakdown-to-hook movement.";

  return {
    templateId: preview.templateId,
    statusLabel,
    templateLabel: preview.templateLabel,
    reasonLabel,
    scopeLabel,
    moveLabel: preview.moveLabel,
    nextCheckLabel,
    detailTitle: `${statusLabel} / ${preview.templateLabel} / ${reasonLabel} / ${scopeLabel} / ${preview.moveLabel} / ${nextCheckLabel}`,
    tone: preview.tone
  };
}

export function createArrangementTemplatePreviewDecision(
  preview: ArrangementTemplatePreviewSummary
): ArrangementTemplatePreviewDecisionSummary {
  const aligned = preview.templateId === "aligned" || preview.changedFieldCount === 0;

  return {
    templateId: preview.templateId,
    actionId: aligned ? "aligned" : "apply-suggested",
    statusLabel: aligned ? "Template aligned" : "Ready to apply",
    templateLabel: preview.templateLabel,
    metricLabel: `${preview.changedBlockCount} block${preview.changedBlockCount === 1 ? "" : "s"} / ${
      preview.changedFieldCount
    } field${preview.changedFieldCount === 1 ? "" : "s"}`,
    detailLabel: aligned ? "Current editable arrangement already matches available templates." : `${preview.sectionLabel} / ${preview.patternLabel}`,
    actionLabel: aligned ? "Aligned" : "Apply Suggested Template",
    disabled: aligned,
    detailTitle: aligned
      ? `${preview.detailTitle} No Arrangement Template action is needed.`
      : `${preview.detailTitle} Apply only after this structure supports the beat.`,
    tone: aligned ? "good" : preview.tone
  };
}

export function createArrangementTemplateResult(
  templateId: ArrangementTemplateId,
  label: string,
  beforeArrangement: ArrangementBlock[],
  afterArrangement: ArrangementBlock[]
): ArrangementTemplateResultSummary {
  const changedBlocks = arrangementTemplateChangedBlockCount(beforeArrangement, afterArrangement);
  const changedFields = arrangementTemplateChangedFieldCount(beforeArrangement, afterArrangement);
  const tone: MixCoachTone = changedFields === 0 ? "good" : changedBlocks <= 3 ? "warn" : "danger";
  const metrics: ArrangementTemplateResultMetric[] = [
    createArrangementTemplateResultMetric("sections", "Sections", compactSectionFlow(beforeArrangement), compactSectionFlow(afterArrangement)),
    createArrangementTemplateResultMetric(
      "patterns",
      "Patterns",
      arrangementArcPreviewPatternLabel(beforeArrangement),
      arrangementArcPreviewPatternLabel(afterArrangement)
    ),
    createArrangementTemplateResultMetric(
      "bars",
      "Bars",
      barCountLabel(arrangementBlocksTotalBars(beforeArrangement)),
      barCountLabel(arrangementBlocksTotalBars(afterArrangement))
    ),
    createArrangementTemplateResultMetric(
      "energy",
      "Energy",
      arrangementArcPreviewEnergyLabel(beforeArrangement),
      arrangementArcPreviewEnergyLabel(afterArrangement)
    ),
    createArrangementTemplateResultMetric(
      "mutes",
      "Mutes",
      arrangementArcPreviewMuteLabel(beforeArrangement),
      arrangementArcPreviewMuteLabel(afterArrangement)
    )
  ];

  return {
    templateId,
    title: `${label} applied`,
    status: changedFields === 0 ? "Template aligned" : "Template applied",
    detail: `${barCountLabel(arrangementBlocksTotalBars(afterArrangement))} / ${compactSectionFlow(afterArrangement)}`,
    scope: `${afterArrangement.length} block${afterArrangement.length === 1 ? "" : "s"} shaped`,
    impact: `${changedBlocks} block${changedBlocks === 1 ? "" : "s"} / ${changedFields} field${changedFields === 1 ? "" : "s"}`,
    metrics,
    auditionCue: `Play Song to hear ${label} across ${barCountLabel(arrangementBlocksTotalBars(afterArrangement))}.`,
    nextCheck: "Scan Song Form Overview for section flow and Arrangement Playback for the audible block.",
    tone
  };
}

export function createArrangementTemplateResultMetric(
  id: ArrangementTemplateResultMetric["id"],
  label: string,
  before: string,
  after: string
): ArrangementTemplateResultMetric {
  const changed = before !== after;
  return {
    id,
    label,
    before,
    after,
    changed,
    tone: changed ? "warn" : "good"
  };
}

export function arrangementTemplatePreviewSectionLabel(arrangement: ArrangementBlock[]): string {
  return `${barCountLabel(arrangementBlocksTotalBars(arrangement))} / ${compactSectionFlow(arrangement)}`;
}

export function arrangementTemplateChangedBlockCount(current: ArrangementBlock[], nextArrangement: ArrangementBlock[]): number {
  const length = Math.max(current.length, nextArrangement.length);
  return Array.from({ length }).filter(
    (_entry, index) => !current[index] || !nextArrangement[index] || !sameArrangementBlockPosture(current[index], nextArrangement[index])
  ).length;
}

export function arrangementTemplateChangedFieldCount(current: ArrangementBlock[], nextArrangement: ArrangementBlock[]): number {
  const length = Math.max(current.length, nextArrangement.length);
  return Array.from({ length }).reduce<number>((total, _entry, index) => {
    const currentBlock = current[index];
    const nextBlock = nextArrangement[index];
    if (!currentBlock || !nextBlock) {
      return total + 5;
    }

    return (
      total +
      [
        currentBlock.section !== nextBlock.section,
        currentBlock.pattern !== nextBlock.pattern,
        normalizeArrangementBars(currentBlock.bars) !== normalizeArrangementBars(nextBlock.bars),
        normalizeArrangementEnergy(currentBlock.energy) !== normalizeArrangementEnergy(nextBlock.energy),
        normalizeArrangementMutedTracks(currentBlock.mutedTracks).join(",") !==
          normalizeArrangementMutedTracks(nextBlock.mutedTracks).join(",")
      ].filter(Boolean).length
    );
  }, 0);
}

export function createPatternChainPreviewSummary(arrangement: ArrangementBlock[]): PatternChainPreviewSummary {
  const currentBars = arrangementBlocksTotalBars(arrangement);
  const chainCandidates = patternChainIds.map((chain) => ({
    actionId: chain,
    actionLabel: `${patternChainLabel(chain)} chain`,
    arrangement: createPatternChain(chain)
  }));
  const expandCandidate = {
    actionId: "expand" as const,
    actionLabel: "Chain Expand",
    arrangement: expandPatternChainArrangement(arrangement)
  };
  const preferredCandidate =
    currentBars < 8
      ? chainCandidates.find((candidate) => candidate.actionId === "eight_bar") ?? chainCandidates[0]
      : currentBars < 16
        ? expandCandidate
        : chainCandidates.find((candidate) => patternChainChangedBlockCount(arrangement, candidate.arrangement) > 0) ??
          expandCandidate;
  const candidate =
    preferredCandidate && patternChainChangedFieldCount(arrangement, preferredCandidate.arrangement) > 0
      ? preferredCandidate
      : [...chainCandidates, expandCandidate].find(
          (entry) => patternChainChangedFieldCount(arrangement, entry.arrangement) > 0
        );

  if (!candidate) {
    return {
      actionId: "aligned",
      changedBlockCount: 0,
      changedFieldCount: 0,
      statusLabel: "Chain aligned",
      actionLabel: "No chain target",
      sequenceLabel: `Sequence ${patternChainReadout(arrangement) || "empty"}`,
      sectionLabel: patternChainPreviewSectionLabel(arrangement),
      energyLabel: patternChainPreviewEnergyLabel(arrangement),
      moveLabel: "0 blocks / 0 fields",
      detailTitle: "Current arrangement already matches available Pattern Chain targets.",
      tone: "good"
    };
  }

  const changedBlocks = patternChainChangedBlockCount(arrangement, candidate.arrangement);
  const changedFields = patternChainChangedFieldCount(arrangement, candidate.arrangement);
  const tone: MixCoachTone = changedFields === 0 ? "good" : changedBlocks <= 4 ? "warn" : "danger";
  const sequenceLabel = `Sequence ${patternChainReadout(candidate.arrangement)}`;
  const sectionLabel = patternChainPreviewSectionLabel(candidate.arrangement);
  const energyLabel = patternChainPreviewEnergyLabel(candidate.arrangement);
  const moveLabel = `${changedBlocks} blocks / ${changedFields} fields`;

  return {
    actionId: candidate.actionId,
    changedBlockCount: changedBlocks,
    changedFieldCount: changedFields,
    statusLabel: changedFields === 0 ? "Chain aligned" : "Suggested chain",
    actionLabel: candidate.actionLabel,
    sequenceLabel,
    sectionLabel,
    energyLabel,
    moveLabel,
    detailTitle:
      changedFields === 0
        ? `${candidate.actionLabel} already matches the current arrangement.`
        : `${candidate.actionLabel}: ${sequenceLabel}; ${sectionLabel}; ${energyLabel}; ${moveLabel}.`,
    tone
  };
}

export function createPatternChainPrioritySummary(preview: PatternChainPreviewSummary): PatternChainPrioritySummary {
  const statusLabel =
    preview.actionId === "aligned"
      ? "Chain aligned"
      : preview.actionId === "expand"
        ? "Expand form"
        : preview.changedBlockCount <= 4
          ? "Sketch chain"
          : "Reshape chain";
  const reasonLabel =
    preview.actionId === "aligned"
      ? "Current arrangement already matches available Pattern Chain targets."
      : preview.actionId === "expand"
        ? "The current loop is ready to expand into a longer editable song form."
        : `${preview.moveLabel} would shape the current loop into ${preview.actionLabel}.`;
  const scopeLabel = `${preview.sequenceLabel} / ${preview.sectionLabel}`;
  const nextCheckLabel =
    preview.actionId === "aligned"
      ? "Audition Song, then inspect Song Form before more changes."
      : preview.actionId === "expand"
        ? "Expand, then check Song Form and Transition Map."
        : preview.changedBlockCount <= 4
          ? "Apply, then audition Song and inspect Pattern spread."
          : "Confirm Arrangement Playback before applying a full-chain reshape.";

  return {
    actionId: preview.actionId,
    statusLabel,
    actionLabel: preview.actionLabel,
    reasonLabel,
    scopeLabel,
    nextCheckLabel,
    detailTitle: `${statusLabel} / ${preview.actionLabel} / ${reasonLabel} / ${scopeLabel} / ${nextCheckLabel}`,
    tone: preview.tone
  };
}

export function createPatternChainPreviewDecision(preview: PatternChainPreviewSummary): PatternChainPreviewDecisionSummary {
  const aligned = preview.actionId === "aligned" || preview.changedFieldCount === 0;

  return {
    targetActionId: preview.actionId,
    actionId: aligned ? "aligned" : "apply-suggested",
    statusLabel: aligned ? "Chain aligned" : "Ready to apply",
    actionLabel: preview.actionLabel,
    metricLabel: `${preview.changedBlockCount} block${preview.changedBlockCount === 1 ? "" : "s"} / ${
      preview.changedFieldCount
    } field${preview.changedFieldCount === 1 ? "" : "s"}`,
    detailLabel: aligned ? "Current editable arrangement already matches available chains." : `${preview.sequenceLabel} / ${preview.sectionLabel}`,
    buttonLabel: aligned ? "Aligned" : "Apply Suggested Chain",
    disabled: aligned,
    detailTitle: aligned
      ? `${preview.detailTitle} No Pattern Chain action is needed.`
      : `${preview.detailTitle} Apply only after this chain supports the beat.`,
    tone: aligned ? "good" : preview.tone
  };
}

export function patternChainPreviewSectionLabel(arrangement: ArrangementBlock[]): string {
  return `${barCountLabel(arrangementBlocksTotalBars(arrangement))} / ${compactSectionFlow(arrangement)}`;
}

export function patternChainPreviewEnergyLabel(arrangement: ArrangementBlock[]): string {
  if (arrangement.length === 0) {
    return "Energy empty";
  }
  const energies = arrangement.map((block) => normalizeArrangementEnergy(block.energy));
  const low = Math.min(...energies);
  const high = Math.max(...energies);
  const peakIndex = energies.indexOf(high);
  const peakBlock = arrangement[peakIndex] ?? arrangement[0];
  return `Energy ${percentLabel(low)}-${percentLabel(high)} / peak ${peakBlock.section}`;
}

export function patternChainChangedBlockCount(current: ArrangementBlock[], nextArrangement: ArrangementBlock[]): number {
  const length = Math.max(current.length, nextArrangement.length);
  return Array.from({ length }).filter(
    (_entry, index) => !current[index] || !nextArrangement[index] || !sameArrangementBlockPosture(current[index], nextArrangement[index])
  ).length;
}

export function patternChainChangedFieldCount(current: ArrangementBlock[], nextArrangement: ArrangementBlock[]): number {
  const length = Math.max(current.length, nextArrangement.length);
  return Array.from({ length }).reduce<number>((total, _entry, index) => {
    const currentBlock = current[index];
    const nextBlock = nextArrangement[index];
    if (!currentBlock || !nextBlock) {
      return total + 5;
    }

    return (
      total +
      [
        currentBlock.section !== nextBlock.section,
        currentBlock.pattern !== nextBlock.pattern,
        normalizeArrangementBars(currentBlock.bars) !== normalizeArrangementBars(nextBlock.bars),
        normalizeArrangementEnergy(currentBlock.energy) !== normalizeArrangementEnergy(nextBlock.energy),
        normalizeArrangementMutedTracks(currentBlock.mutedTracks).join(",") !==
          normalizeArrangementMutedTracks(nextBlock.mutedTracks).join(",")
      ].filter(Boolean).length
    );
  }, 0);
}

export function createPatternChainResult(
  actionId: PatternChainResultSummary["actionId"],
  label: string,
  beforeArrangement: ArrangementBlock[],
  afterArrangement: ArrangementBlock[]
): PatternChainResultSummary {
  const changedBlocks = patternChainChangedBlockCount(beforeArrangement, afterArrangement);
  const changedFields = patternChainChangedFieldCount(beforeArrangement, afterArrangement);
  const tone: MixCoachTone = changedFields === 0 ? "good" : changedBlocks <= 2 ? "warn" : "danger";
  const afterBars = arrangementBlocksTotalBars(afterArrangement);
  const afterSequence = patternChainResultSequenceLabel(afterArrangement);
  const metrics: PatternChainResultMetric[] = [
    createPatternChainResultMetric(
      "sequence",
      "Sequence",
      patternChainResultSequenceLabel(beforeArrangement),
      patternChainResultSequenceLabel(afterArrangement)
    ),
    createPatternChainResultMetric(
      "sections",
      "Sections",
      patternChainPreviewSectionLabel(beforeArrangement),
      patternChainPreviewSectionLabel(afterArrangement)
    ),
    createPatternChainResultMetric(
      "bars",
      "Bars",
      barCountLabel(arrangementBlocksTotalBars(beforeArrangement)),
      barCountLabel(arrangementBlocksTotalBars(afterArrangement))
    ),
    createPatternChainResultMetric(
      "energy",
      "Energy",
      patternChainPreviewEnergyLabel(beforeArrangement),
      patternChainPreviewEnergyLabel(afterArrangement)
    ),
    createPatternChainResultMetric(
      "mutes",
      "Mutes",
      arrangementArcPreviewMuteLabel(beforeArrangement),
      arrangementArcPreviewMuteLabel(afterArrangement)
    )
  ];

  return {
    actionId,
    title: `${label} applied`,
    status: changedFields === 0 ? "Chain aligned" : "Chain applied",
    detail: `${barCountLabel(afterBars)} / ${afterSequence}`,
    scope: `${afterArrangement.length} step${afterArrangement.length === 1 ? "" : "s"} shaped`,
    impact: `${changedBlocks} block${changedBlocks === 1 ? "" : "s"} / ${changedFields} field${changedFields === 1 ? "" : "s"}`,
    metrics,
    auditionCue: `Play Song to hear ${label} across ${barCountLabel(afterBars)}.`,
    nextCheck: "Scan Song Form Overview for Pattern spread and Arrangement Playback for the audible block.",
    tone
  };
}

export function createPatternChainResultMetric(
  id: PatternChainResultMetric["id"],
  label: string,
  before: string,
  after: string
): PatternChainResultMetric {
  const changed = before !== after;
  return {
    id,
    label,
    before,
    after,
    changed,
    tone: changed ? "warn" : "good"
  };
}

export function patternChainResultSequenceLabel(arrangement: ArrangementBlock[]): string {
  const readout = patternChainReadout(arrangement);
  return readout ? readout : "No sequence";
}

export function createArrangementArcPadOptions(project: ProjectState, selectedIndex: number): ArrangementArcPadOption[] {
  return arrangementArcPadDefinitions.map((pad) => {
    const transformed = applyArrangementArcPadToProject(project, pad, selectedIndex);
    return {
      ...pad,
      preview: arrangementArcPreview(transformed.arrangement),
      changedCount: arrangementArcChangedCount(project.arrangement, transformed.arrangement)
    };
  });
}

export function createArrangementArcPreviewSummary(
  project: ProjectState,
  selectedIndex: number,
  pads: ArrangementArcPadOption[]
): ArrangementArcPreviewSummary {
  const pad = pads.find((option) => option.changedCount > 0) ?? pads[0];
  if (!pad) {
    return {
      padId: "clean",
      changedBlockCount: 0,
      changedFieldCount: 0,
      statusLabel: "Arc aligned",
      padLabel: "No arc target",
      sectionLabel: "No arrangement blocks",
      patternLabel: "No Pattern spread",
      energyLabel: "No energy posture",
      muteLabel: "No mute posture",
      moveLabel: "0 blocks / 0 fields",
      detailTitle: "No Arrangement Arc pads are available.",
      tone: "good"
    };
  }

  const transformed = applyArrangementArcPadToProject(project, pad, selectedIndex);
  const changedBlocks = arrangementArcChangedCount(project.arrangement, transformed.arrangement);
  const changedFields = arrangementArcChangedFieldCount(project.arrangement, transformed.arrangement);
  const tone: MixCoachTone = changedFields === 0 ? "good" : changedBlocks <= 2 ? "warn" : "danger";
  const sectionLabel = arrangementArcPreviewSectionLabel(transformed.arrangement);
  const patternLabel = arrangementArcPreviewPatternLabel(transformed.arrangement);
  const energyLabel = arrangementArcPreviewEnergyLabel(transformed.arrangement);
  const muteLabel = arrangementArcPreviewMuteLabel(transformed.arrangement);
  const moveLabel = `${changedBlocks} blocks / ${changedFields} fields`;

  return {
    padId: pad.id,
    changedBlockCount: changedBlocks,
    changedFieldCount: changedFields,
    statusLabel: changedFields === 0 ? "Arc aligned" : "Suggested arc",
    padLabel: pad.label,
    sectionLabel,
    patternLabel,
    energyLabel,
    muteLabel,
    moveLabel,
    detailTitle:
      changedFields === 0
        ? `${pad.label} already matches the current arrangement posture.`
        : `${pad.label}: ${sectionLabel}; ${patternLabel}; ${energyLabel}; ${muteLabel}; ${moveLabel}.`,
    tone
  };
}

export function createArrangementArcPrioritySummary(preview: ArrangementArcPreviewSummary): ArrangementArcPrioritySummary {
  const isAligned = preview.statusLabel === "Arc aligned";
  const statusLabel = isAligned
    ? "Arc aligned"
    : preview.padId === "clean"
      ? "Stabilize arc"
      : preview.padId === "lift"
        ? "Lift hook"
        : preview.padId === "break"
          ? "Shape break"
          : "Push rise";
  const reasonLabel = isAligned
    ? "Current arrangement already matches the suggested full-song energy arc."
    : preview.padId === "clean"
      ? "Make the full song feel steady before detailed block edits."
      : preview.padId === "lift"
        ? "Push hook energy and width so the peak is obvious."
        : preview.padId === "break"
          ? "Add a clear drop turn before the hook returns."
          : "Build late-song lift for a stronger club-style payoff.";
  const scopeLabel = `${preview.sectionLabel} / ${preview.energyLabel}`;
  const nextCheckLabel = isAligned
    ? "Audition Song, then inspect Transition Map before more arc changes."
    : preview.padId === "clean"
      ? "Apply, then audition Song and check Song Form flow."
      : preview.padId === "lift"
        ? "Apply, then cue Hook and inspect hook energy contrast."
        : preview.padId === "break"
          ? "Apply, then audition Bridge into Hook."
          : "Apply, then audition the late Hook and Outro movement.";

  return {
    padId: preview.padId,
    statusLabel,
    padLabel: preview.padLabel,
    reasonLabel,
    scopeLabel,
    moveLabel: preview.moveLabel,
    nextCheckLabel,
    detailTitle: `${statusLabel} / ${preview.padLabel} / ${reasonLabel} / ${scopeLabel} / ${preview.moveLabel} / ${nextCheckLabel}`,
    tone: preview.tone
  };
}

export function createArrangementArcPreviewDecision(preview: ArrangementArcPreviewSummary): ArrangementArcPreviewDecisionSummary {
  const aligned = preview.statusLabel === "Arc aligned" || preview.changedFieldCount === 0;

  return {
    targetPadId: preview.padId,
    actionId: aligned ? "aligned" : "apply-suggested",
    statusLabel: aligned ? "Arc aligned" : "Ready to apply",
    padLabel: preview.padLabel,
    metricLabel: `${preview.changedBlockCount} block${preview.changedBlockCount === 1 ? "" : "s"} / ${
      preview.changedFieldCount
    } field${preview.changedFieldCount === 1 ? "" : "s"}`,
    detailLabel: aligned ? "Current arrangement already matches the suggested arc." : `${preview.sectionLabel} / ${preview.energyLabel}`,
    buttonLabel: aligned ? "Aligned" : "Apply Suggested Arc",
    disabled: aligned,
    detailTitle: aligned
      ? `${preview.detailTitle} No Arrangement Arc action is needed.`
      : `${preview.detailTitle} Apply only after this arc supports the beat.`,
    tone: aligned ? "good" : preview.tone
  };
}

export function createArrangementArcResult(
  pad: ArrangementArcPadDefinition,
  beforeProject: ProjectState,
  afterProject: ProjectState
): ArrangementArcResultSummary {
  const beforeArrangement = beforeProject.arrangement;
  const afterArrangement = afterProject.arrangement;
  const changedBlocks = arrangementArcChangedCount(beforeArrangement, afterArrangement);
  const changedFields = arrangementArcChangedFieldCount(beforeArrangement, afterArrangement);
  const tone: MixCoachTone = changedFields === 0 ? "good" : changedBlocks <= 2 ? "warn" : "danger";
  const metrics: ArrangementArcResultMetric[] = [
    createArrangementArcResultMetric("sections", "Sections", compactSectionFlow(beforeArrangement), compactSectionFlow(afterArrangement)),
    createArrangementArcResultMetric(
      "patterns",
      "Patterns",
      arrangementArcPreviewPatternLabel(beforeArrangement),
      arrangementArcPreviewPatternLabel(afterArrangement)
    ),
    createArrangementArcResultMetric(
      "bars",
      "Bars",
      barCountLabel(arrangementBlocksTotalBars(beforeArrangement)),
      barCountLabel(arrangementBlocksTotalBars(afterArrangement))
    ),
    createArrangementArcResultMetric(
      "energy",
      "Energy",
      arrangementArcPreviewEnergyLabel(beforeArrangement),
      arrangementArcPreviewEnergyLabel(afterArrangement)
    ),
    createArrangementArcResultMetric(
      "mutes",
      "Mutes",
      arrangementArcPreviewMuteLabel(beforeArrangement),
      arrangementArcPreviewMuteLabel(afterArrangement)
    )
  ];

  return {
    padId: pad.id,
    title: `${pad.label} applied`,
    status: changedFields === 0 ? "Arc aligned" : "Arc applied",
    detail: `${barCountLabel(arrangementBlocksTotalBars(afterArrangement))} / ${compactSectionFlow(afterArrangement)}`,
    scope: `${afterArrangement.length} block${afterArrangement.length === 1 ? "" : "s"} shaped`,
    impact: `${changedBlocks} block${changedBlocks === 1 ? "" : "s"} / ${changedFields} field${changedFields === 1 ? "" : "s"}`,
    metrics,
    auditionCue: `Play Song to hear ${pad.label} across ${barCountLabel(arrangementBlocksTotalBars(afterArrangement))}.`,
    nextCheck: "Scan Song Form Overview for section flow and Arrangement Playback for the audible block.",
    tone
  };
}

export function createArrangementArcResultMetric(
  id: ArrangementArcResultMetric["id"],
  label: string,
  before: string,
  after: string
): ArrangementArcResultMetric {
  const changed = before !== after;
  return {
    id,
    label,
    before,
    after,
    changed,
    tone: changed ? "warn" : "good"
  };
}

export function arrangementArcPreviewSectionLabel(arrangement: ArrangementBlock[]): string {
  return `${barCountLabel(arrangementBlocksTotalBars(arrangement))} / ${compactSectionFlow(arrangement)}`;
}

export function arrangementArcPreviewPatternLabel(arrangement: ArrangementBlock[]): string {
  const counts = patternSlots.map((pattern) => {
    const count = arrangement.filter((block) => block.pattern === pattern).length;
    return `${pattern}${count}`;
  });
  return `Patterns ${counts.join(" / ")}`;
}

export function arrangementArcPreviewEnergyLabel(arrangement: ArrangementBlock[]): string {
  if (arrangement.length === 0) {
    return "Energy empty";
  }
  const energies = arrangement.map((block) => normalizeArrangementEnergy(block.energy));
  const low = Math.min(...energies);
  const high = Math.max(...energies);
  const peakIndex = energies.indexOf(high);
  const peakBlock = arrangement[peakIndex] ?? arrangement[0];
  return `Energy ${percentLabel(low)}-${percentLabel(high)} / peak ${peakBlock.section}`;
}

export function arrangementArcPreviewMuteLabel(arrangement: ArrangementBlock[]): string {
  const counts = arrangementMuteTrackIds
    .map((track) => ({
      track,
      count: arrangement.filter((block) => normalizeArrangementMutedTracks(block.mutedTracks).includes(track)).length
    }))
    .filter((entry) => entry.count > 0);

  if (counts.length === 0) {
    return "No block mutes";
  }

  return `Mutes ${counts.map((entry) => `${arrangementMuteTrackLabel(entry.track)} ${entry.count}`).join(" / ")}`;
}

export function arrangementArcPreview(arrangement: ArrangementBlock[]): string {
  const bars = arrangementBlocksTotalBars(arrangement);
  const peak = arrangement.length === 0 ? 0 : Math.max(...arrangement.map((block) => normalizeArrangementEnergy(block.energy)));
  return `${barCountLabel(bars)} / peak ${percentLabel(peak)}`;
}

export function applyArrangementArcPadToProject(
  project: ProjectState,
  pad: ArrangementArcPadDefinition,
  selectedIndex: number
): ProjectState {
  if (project.arrangement.length === 0 || pad.points.length === 0) {
    return project;
  }

  const nextArrangement = project.arrangement.map((block, index, arrangement) => {
    const point = arrangementArcPointForIndex(pad.points, index, arrangement.length);
    return {
      ...block,
      section: point.section,
      pattern: point.pattern,
      bars: normalizeArrangementBars(point.bars),
      energy: normalizeArrangementEnergy(point.energy),
      mutedTracks: normalizeArrangementMutedTracks(point.mutedTracks)
    };
  });
  const boundedSelectedIndex = Math.min(Math.max(0, selectedIndex), nextArrangement.length - 1);
  const selectedBlock = nextArrangement[boundedSelectedIndex] ?? nextArrangement[0];

  const nextProject = {
    ...project,
    selectedPattern: selectedBlock.pattern,
    arrangement: nextArrangement
  };
  const arrangementChanged = arrangementArcChangedCount(project.arrangement, nextArrangement) > 0;
  return arrangementChanged || project.selectedPattern !== nextProject.selectedPattern ? nextProject : project;
}

export function arrangementArcPointForIndex(points: ArrangementArcPoint[], index: number, totalBlocks: number): ArrangementArcPoint {
  if (points.length === 1 || totalBlocks <= 1) {
    return points[0];
  }
  const pointIndex = Math.round((index / Math.max(1, totalBlocks - 1)) * (points.length - 1));
  return points[Math.min(points.length - 1, Math.max(0, pointIndex))];
}

export function arrangementBlocksTotalBars(arrangement: ArrangementBlock[]): number {
  return arrangement.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
}

export function arrangementArcChangedCount(current: ArrangementBlock[], nextArrangement: ArrangementBlock[]): number {
  return nextArrangement.filter((block, index) => !sameArrangementBlockPosture(current[index], block)).length;
}

export function arrangementArcChangedFieldCount(current: ArrangementBlock[], nextArrangement: ArrangementBlock[]): number {
  return nextArrangement.reduce((total, nextBlock, index) => {
    const currentBlock = current[index];
    if (!currentBlock) {
      return total + 5;
    }

    return (
      total +
      [
        currentBlock.section !== nextBlock.section,
        currentBlock.pattern !== nextBlock.pattern,
        normalizeArrangementBars(currentBlock.bars) !== normalizeArrangementBars(nextBlock.bars),
        normalizeArrangementEnergy(currentBlock.energy) !== normalizeArrangementEnergy(nextBlock.energy),
        normalizeArrangementMutedTracks(currentBlock.mutedTracks).join(",") !==
          normalizeArrangementMutedTracks(nextBlock.mutedTracks).join(",")
      ].filter(Boolean).length
    );
  }, 0);
}

export function sameArrangementBlockPosture(current: ArrangementBlock | undefined, nextBlock: ArrangementBlock): boolean {
  if (!current) {
    return false;
  }
  return (
    current.section === nextBlock.section &&
    current.pattern === nextBlock.pattern &&
    normalizeArrangementBars(current.bars) === normalizeArrangementBars(nextBlock.bars) &&
    normalizeArrangementEnergy(current.energy) === normalizeArrangementEnergy(nextBlock.energy) &&
    normalizeArrangementMutedTracks(current.mutedTracks).join(",") ===
      normalizeArrangementMutedTracks(nextBlock.mutedTracks).join(",")
  );
}

export function usedPatternSlots(project: ProjectState): PatternSlot[] {
  const slots = new Set(project.arrangement.map((block) => block.pattern));
  return patternSlots.filter((slot) => slots.has(slot));
}

export function arrangementStartBar(project: ProjectState, selectedIndex: number): number {
  return project.arrangement
    .slice(0, Math.max(0, selectedIndex))
    .reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
}

export function selectedArrangementBlockRoleSummary(project: ProjectState, selectedIndex: number): ArrangementBlockRoleSummary | null {
  const boundedIndex = Math.min(Math.max(0, selectedIndex), project.arrangement.length - 1);
  const block = project.arrangement[boundedIndex];
  if (!block) {
    return null;
  }

  const bars = normalizeArrangementBars(block.bars);
  const startBar = arrangementStartBar(project, boundedIndex) + 1;
  const endBar = startBar + bars - 1;
  const energy = normalizeArrangementEnergy(block.energy);
  const mutedTracks = normalizeArrangementMutedTracks(block.mutedTracks);
  const mutedLabel =
    mutedTracks.length === 0 ? "Full mix" : `${mutedTracks.map(arrangementMuteTrackLabel).join("/")} muted`;
  const eventCount = patternEventTotal(project.patterns[block.pattern]);

  return {
    roleLabel: arrangementBlockRoleLabel(block.section, boundedIndex, project.arrangement.length, energy, mutedTracks.length),
    timelineLabel: startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`,
    detailLabel: `Pattern ${block.pattern} / ${barCountLabel(bars)} / ${percentLabel(energy)} energy / ${eventCount} events / ${mutedLabel}`,
    isShaped: energy >= 0.82 || energy <= 0.48 || mutedTracks.length > 0 || bars >= 4
  };
}

export function arrangementBlockRoleLabel(
  section: ArrangementSection,
  index: number,
  totalBlocks: number,
  energy: number,
  mutedCount: number
): string {
  if (section === "Intro" || index === 0) {
    return "Setup";
  }
  if (section === "Hook") {
    return "Hook lift";
  }
  if (section === "Outro" || index === totalBlocks - 1) {
    return "Release";
  }
  if (section === "Bridge") {
    return "Contrast";
  }
  if (mutedCount >= 2 || energy <= 0.38) {
    return "Breakdown";
  }
  if (energy >= 0.88) {
    return "Peak";
  }
  return "Pocket";
}

export function mixerChannelRoleSummary(channel: MixerChannel): MixerChannelRoleSummary {
  const stateParts = [channel.muted ? "Muted" : "Live", channel.solo ? "Solo" : null].filter(Boolean);
  const toneParts =
    channel.id === "master"
      ? [`trim ${formatDb(channel.volumeDb)}`, `pan ${panLabel(channel.pan)}`]
      : [
          `cut ${percentLabel(channel.lowCut)}`,
          `air ${percentLabel(channel.air)}`,
          `drive ${percentLabel(channel.drive)}`,
          `glue ${percentLabel(channel.glue)}`,
          `space ${percentLabel(channel.send)}`
        ];

  return {
    roleLabel: mixerChannelRoleLabel(channel),
    levelLabel: `${formatDb(channel.volumeDb)} / ${panLabel(channel.pan)}`,
    detailLabel: [...stateParts, ...toneParts].join(" / "),
    isShaped:
      channel.muted ||
      channel.solo ||
      Math.abs(channel.pan) >= 10 ||
      channel.lowCut >= 0.1 ||
      channel.air >= 0.25 ||
      channel.drive >= 0.18 ||
      channel.glue >= 0.22 ||
      channel.send >= 0.18
  };
}

export function mixerChannelRoleLabel(channel: MixerChannel): string {
  switch (channel.id) {
    case "drum_rack":
      return "Rhythm anchor";
    case "bass_808":
      return "Low-end weight";
    case "synth":
      return "Hook color";
    case "chord":
      return "Harmony bed";
    case "master":
      return "Output guard";
    default:
      return "Mix lane";
  }
}

export function transportLoopLabel(scope: TransportLoopScope): string {
  switch (scope) {
    case "arrangement":
      return "Song";
    case "block":
      return "Block";
    case "transition":
      return "Turn";
    case "pattern":
      return "Pattern";
  }
}

export function transportLoopStatus(
  project: ProjectState,
  scope: TransportLoopScope,
  selectedIndex: number,
  transitionTarget: ArrangementTransitionLoopTarget | null = null
): string {
  if (scope === "pattern") {
    return `Pattern ${project.selectedPattern} / ${barCountLabel(2)} loop`;
  }

  if (scope === "block") {
    const block = project.arrangement[selectedIndex] ?? project.arrangement[0];
    if (!block) {
      return "Block loop unavailable";
    }
    return `Block ${Math.min(selectedIndex + 1, project.arrangement.length)} ${block.section} / Pattern ${block.pattern} / ${barCountLabel(block.bars)}`;
  }

  if (scope === "transition") {
    if (!transitionTarget) {
      return "Transition loop unavailable";
    }

    return `${transitionTarget.transition.value} / Bars ${transitionTarget.startBar + 1}-${transitionTarget.endBar} / ${barCountLabel(
      transitionTarget.bars
    )}`;
  }

  return `${barCountLabel(arrangementTotalBars(project))} song loop`;
}

export function createTransportPositionReadoutSummary(
  project: ProjectState,
  isPlaying: boolean,
  playbackPosition: PlaybackSnapshot | null,
  scope: TransportLoopScope,
  selectedIndex: number,
  selectedStartBar: number,
  transitionTarget: ArrangementTransitionLoopTarget | null = null
): TransportPositionReadoutSummary {
  const loopLabel = transportLoopLabel(scope);
  if (isPlaying && playbackPosition) {
    const step = (playbackPosition.loopStep % 16) + 1;
    const loopStartBar =
      scope === "block" ? selectedStartBar : scope === "transition" && transitionTarget ? transitionTarget.startBar : 0;
    const songBar = playbackPosition.mode === "arrangement" ? loopStartBar + playbackPosition.bar : playbackPosition.bar;
    const sectionLabel =
      playbackPosition.mode === "pattern" ? `Pattern ${playbackPosition.pattern}` : playbackPosition.section ?? "Arrangement";

    return {
      roleLabel: `Bar ${songBar}.${playbackPosition.beat}`,
      statusLabel: `Playing ${loopLabel}`,
      detailLabel: `${sectionLabel} / Step ${step}`,
      detailTitle: `${loopLabel} loop is playing at song bar ${songBar}, beat ${playbackPosition.beat}, step ${step}, Pattern ${playbackPosition.pattern}.`,
      tone: "good"
    };
  }

  if (scope === "pattern") {
    return {
      roleLabel: "Bar 1.1",
      statusLabel: "Cued Pattern",
      detailLabel: `Pattern ${project.selectedPattern} / Step 1`,
      detailTitle: `Pattern loop is cued at bar 1, beat 1, step 1 for Pattern ${project.selectedPattern}.`,
      tone: "warn"
    };
  }

  if (scope === "block") {
    const boundedIndex = Math.min(Math.max(0, selectedIndex), project.arrangement.length - 1);
    const block = project.arrangement[boundedIndex];
    if (!block) {
      return {
        roleLabel: "No block",
        statusLabel: "Cued Block",
        detailLabel: "Select an arrangement block",
        detailTitle: "Block loop has no arrangement block to cue.",
        tone: "danger"
      };
    }

    const blockNumber = boundedIndex + 1;
    const blockStartBar = arrangementStartBar(project, boundedIndex);
    return {
      roleLabel: `Bar ${blockStartBar + 1}.1`,
      statusLabel: `Cued ${block.section}`,
      detailLabel: `Block ${blockNumber} / Pattern ${block.pattern}`,
      detailTitle: `Block loop is cued at song bar ${blockStartBar + 1}, beat 1, step 1 for ${block.section} block ${blockNumber}, Pattern ${block.pattern}, ${barCountLabel(block.bars)}.`,
      tone: "warn"
    };
  }

  if (scope === "transition") {
    if (!transitionTarget) {
      return {
        roleLabel: "No transition",
        statusLabel: "Cued Turn",
        detailLabel: "Focus an adjacent handoff",
        detailTitle: "Transition loop has no adjacent arrangement blocks to cue.",
        tone: "danger"
      };
    }

    return {
      roleLabel: `Bar ${transitionTarget.startBar + 1}.1`,
      statusLabel: "Cued Turn",
      detailLabel: `${transitionTarget.transition.value} / ${barCountLabel(transitionTarget.bars)}`,
      detailTitle: `Transition loop is cued at song bar ${transitionTarget.startBar + 1}, beat 1, step 1 across ${
        transitionTarget.transition.value
      }, ${barCountLabel(transitionTarget.bars)}.`,
      tone: "warn"
    };
  }

  const firstBlock = project.arrangement[0];
  return {
    roleLabel: "Bar 1.1",
    statusLabel: "Cued Song",
    detailLabel: firstBlock ? `${firstBlock.section} / Pattern ${firstBlock.pattern}` : `${barCountLabel(arrangementTotalBars(project))} loop`,
    detailTitle: `Song loop is cued at bar 1, beat 1, step 1 across ${barCountLabel(arrangementTotalBars(project))}.`,
    tone: "warn"
  };
}

export function createArrangementFocusSummary(project: ProjectState, selectedIndex: number): ArrangementFocusSummary | null {
  const block = project.arrangement[selectedIndex] ?? project.arrangement[0];
  if (!block) {
    return null;
  }

  const pattern = project.patterns[block.pattern];
  const mutedLabels = block.mutedTracks.map(arrangementMuteTrackLabel);
  return {
    blockNumber: Math.min(selectedIndex + 1, project.arrangement.length),
    section: block.section,
    pattern: block.pattern,
    bars: normalizeArrangementBars(block.bars),
    energy: normalizeArrangementEnergy(block.energy),
    eventCount: drumHitCount(pattern) + pattern.bassNotes.length + pattern.melodyNotes.length + pattern.chordEvents.length,
    mutedLabel: mutedLabels.length === 0 ? "no mutes" : `${mutedLabels.join(", ")} muted`,
    suggestedPreset: suggestedArrangementFocusPreset(block)
  };
}

export function createArrangementFocusPrioritySummary(
  summary: ArrangementFocusSummary,
  preview: ArrangementFocusPreviewSummary
): ArrangementFocusPrioritySummary {
  const changeCount = preview.changeCount;
  const statusLabel = changeCount === 0 ? "Focus aligned" : changeCount <= 2 ? "Light focus" : "Deep focus";
  const reasonLabel =
    changeCount === 0
      ? `${summary.section} already matches the suggested ${preview.presetLabel} posture.`
      : `${preview.moveLabel} would align ${summary.section} toward ${preview.presetLabel}.`;
  const scopeLabel = `Block ${summary.blockNumber} / Pattern ${summary.pattern} / ${barCountLabel(summary.bars)}`;
  const nextCheckLabel =
    changeCount === 0
      ? "Audition the block, then confirm Song Form before editing."
      : changeCount <= 2
        ? "Apply only if this block should match the selected section role."
        : "Check Arrangement Playback and Song Form before applying this reshape.";

  return {
    presetId: preview.presetId,
    statusLabel,
    presetLabel: preview.presetLabel,
    reasonLabel,
    scopeLabel,
    nextCheckLabel,
    detailTitle: `${statusLabel} / ${preview.presetLabel} / ${reasonLabel} / ${scopeLabel} / ${nextCheckLabel}`,
    tone: preview.tone
  };
}

export function createArrangementFocusPreviewDecision(
  preview: ArrangementFocusPreviewSummary
): ArrangementFocusPreviewDecisionSummary {
  const aligned = preview.changeCount === 0;

  return {
    targetPresetId: preview.presetId,
    actionId: aligned ? "aligned" : "apply-suggested",
    statusLabel: aligned ? "Focus aligned" : "Ready to apply",
    presetLabel: preview.presetLabel,
    metricLabel: preview.moveLabel,
    detailLabel: aligned
      ? "Selected block already matches the suggested focus preset."
      : `${preview.blockLabel} / ${preview.sectionLabel} / ${preview.energyLabel} / ${preview.muteLabel}`,
    buttonLabel: aligned ? "Aligned" : "Apply Suggested Focus",
    disabled: aligned,
    detailTitle: aligned
      ? `${preview.detailTitle} No Arrangement Focus action is needed.`
      : `${preview.detailTitle} Apply only after this selected block should take the suggested section role.`,
    tone: aligned ? "good" : preview.tone
  };
}

export function createArrangementFocusPreviewSummary(
  project: ProjectState,
  selectedIndex: number,
  summary: ArrangementFocusSummary | null
): ArrangementFocusPreviewSummary | null {
  const block = project.arrangement[selectedIndex] ?? project.arrangement[0];
  if (!block || !summary) {
    return null;
  }

  const preset = arrangementFocusPresets.find((candidate) => candidate.id === summary.suggestedPreset) ?? arrangementFocusPresets[0];
  const changedFields = arrangementFocusChangedFieldCount(block, preset);
  const tone: MixCoachTone = changedFields === 0 ? "good" : changedFields <= 2 ? "warn" : "danger";
  const blockLabel = `Block ${summary.blockNumber}`;
  const sectionLabel = `${preset.section} / Pattern ${preset.pattern} / ${barCountLabel(preset.bars)}`;
  const energyLabel = `Energy ${percentLabel(preset.energy)}`;
  const muteLabel = arrangementFocusPreviewMuteLabel(preset.mutedTracks);
  const moveLabel = `${changedFields} field${changedFields === 1 ? "" : "s"}`;

  return {
    presetId: preset.id,
    changeCount: changedFields,
    statusLabel: changedFields === 0 ? "Focus aligned" : "Suggested focus",
    presetLabel: preset.label,
    blockLabel,
    sectionLabel,
    energyLabel,
    muteLabel,
    moveLabel,
    detailTitle:
      changedFields === 0
        ? `${preset.label} already matches ${blockLabel}.`
        : `${preset.label}: ${blockLabel}; ${sectionLabel}; ${energyLabel}; ${muteLabel}; ${moveLabel}.`,
    tone
  };
}

export function arrangementFocusPreviewMuteLabel(mutedTracks: ArrangementMuteTrack[]): string {
  const muted = normalizeArrangementMutedTracks(mutedTracks);
  return muted.length === 0 ? "No block mutes" : `${muted.map(arrangementMuteTrackLabel).join(" / ")} muted`;
}

export function arrangementFocusChangedFieldCount(block: ArrangementBlock, preset: ArrangementFocusPreset): number {
  return [
    block.section !== preset.section,
    block.pattern !== preset.pattern,
    normalizeArrangementBars(block.bars) !== normalizeArrangementBars(preset.bars),
    normalizeArrangementEnergy(block.energy) !== normalizeArrangementEnergy(preset.energy),
    normalizeArrangementMutedTracks(block.mutedTracks).join(",") !==
      normalizeArrangementMutedTracks(preset.mutedTracks).join(",")
  ].filter(Boolean).length;
}

export function createArrangementFocusResult(
  preset: ArrangementFocusPreset,
  selectedIndex: number,
  beforeProject: ProjectState,
  afterProject: ProjectState
): ArrangementFocusResultSummary {
  const beforeBlock = beforeProject.arrangement[selectedIndex] ?? beforeProject.arrangement[0];
  const afterBlock = afterProject.arrangement[selectedIndex] ?? afterProject.arrangement[0];
  const blockNumber = Math.min(selectedIndex + 1, afterProject.arrangement.length);
  if (!beforeBlock || !afterBlock) {
    return {
      presetId: preset.id,
      title: `${preset.label} skipped`,
      status: "No block",
      detail: "Select an arrangement block before applying focus.",
      scope: "No arrangement block",
      impact: "0 fields changed",
      metrics: [],
      auditionCue: "Select a block before auditioning focus.",
      nextCheck: "Add or select an arrangement block.",
      tone: "danger"
    };
  }

  const metrics: ArrangementFocusResultMetric[] = [
    createArrangementFocusResultMetric("section", "Section", beforeBlock.section, afterBlock.section),
    createArrangementFocusResultMetric("pattern", "Pattern", `Pattern ${beforeBlock.pattern}`, `Pattern ${afterBlock.pattern}`),
    createArrangementFocusResultMetric(
      "bars",
      "Bars",
      barCountLabel(beforeBlock.bars),
      barCountLabel(afterBlock.bars)
    ),
    createArrangementFocusResultMetric(
      "energy",
      "Energy",
      percentLabel(beforeBlock.energy),
      percentLabel(afterBlock.energy)
    ),
    createArrangementFocusResultMetric(
      "mutes",
      "Mutes",
      arrangementFocusPreviewMuteLabel(beforeBlock.mutedTracks),
      arrangementFocusPreviewMuteLabel(afterBlock.mutedTracks)
    )
  ];
  const changedCount = metrics.filter((metric) => metric.changed).length;
  const tone: MixCoachTone = changedCount === 0 ? "good" : changedCount <= 2 ? "warn" : "danger";

  return {
    presetId: preset.id,
    title: `${preset.label} applied`,
    status: changedCount === 0 ? "Already aligned" : "Focus applied",
    detail: `Block ${blockNumber} now ${afterBlock.section} / Pattern ${afterBlock.pattern} / ${barCountLabel(afterBlock.bars)}`,
    scope: `Block ${blockNumber} arrangement fields`,
    impact: `${changedCount} field${changedCount === 1 ? "" : "s"} changed`,
    metrics,
    auditionCue: `Play Block ${blockNumber} to hear ${afterBlock.section} with Pattern ${afterBlock.pattern}.`,
    nextCheck: `Scan Song Form Overview for ${afterBlock.section} flow and Arrangement Playback for audible block context.`,
    tone
  };
}

export function createArrangementFocusResultMetric(
  id: ArrangementFocusResultMetric["id"],
  label: string,
  before: string,
  after: string
): ArrangementFocusResultMetric {
  const changed = before !== after;
  return {
    id,
    label,
    before,
    after,
    changed,
    tone: changed ? "warn" : "good"
  };
}

export function suggestedArrangementFocusPreset(block: ArrangementBlock): ArrangementFocusPresetId {
  switch (block.section) {
    case "Intro":
      return "intro_space";
    case "Hook":
      return "hook_peak";
    case "Bridge":
      return "bridge_drop";
    case "Outro":
      return "outro_release";
    case "Verse":
      return "verse_pocket";
  }
}

export function createPatternCompareSummaries(project: ProjectState): PatternCompareSummary[] {
  return patternSlots.map((slot) => {
    const pattern = project.patterns[slot];
    const arrangedBlocks = project.arrangement.filter((block) => block.pattern === slot);
    const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
    const drumHits = drumHitCount(pattern);
    const bassNotes = pattern.bassNotes.length;
    const melodyNotes = pattern.melodyNotes.length;
    const chordEvents = pattern.chordEvents.length;
    return {
      slot,
      eventCount: drumHits + bassNotes + melodyNotes + chordEvents,
      drumHits,
      bassNotes,
      melodyNotes,
      chordEvents,
      arrangedBlocks: arrangedBlocks.length,
      arrangedBars
    };
  });
}

export function createPatternContrastSummary(summaries: PatternCompareSummary[]): PatternContrastSummary {
  const orderedSummaries = patternSlots
    .map((slot) => summaries.find((summary) => summary.slot === slot))
    .filter((summary): summary is PatternCompareSummary => Boolean(summary));
  const activeSummaries = orderedSummaries.filter((summary) => summary.eventCount > 0);
  const totals = orderedSummaries.map((summary) => summary.eventCount);
  const drumTotals = orderedSummaries.map((summary) => summary.drumHits);
  const musicTotals = orderedSummaries.map((summary) => summary.bassNotes + summary.chordEvents + summary.melodyNotes);
  const maxEvents = totals.length > 0 ? Math.max(...totals) : 0;
  const minEvents = totals.length > 0 ? Math.min(...totals) : 0;
  const eventSpread = maxEvents - minEvents;
  const drumSpread = drumTotals.length > 0 ? Math.max(...drumTotals) - Math.min(...drumTotals) : 0;
  const musicSpread = musicTotals.length > 0 ? Math.max(...musicTotals) - Math.min(...musicTotals) : 0;
  const arrangedPatterns = orderedSummaries.filter((summary) => summary.arrangedBlocks > 0).length;
  const strongest = [...orderedSummaries].sort(
    (first, second) =>
      second.eventCount - first.eventCount ||
      second.arrangedBars - first.arrangedBars ||
      patternSlots.indexOf(first.slot) - patternSlots.indexOf(second.slot)
  )[0];
  const thinnest = [...orderedSummaries].sort(
    (first, second) =>
      first.eventCount - second.eventCount ||
      first.arrangedBars - second.arrangedBars ||
      patternSlots.indexOf(first.slot) - patternSlots.indexOf(second.slot)
  )[0];
  const statusLabel =
    activeSummaries.length < 2 ? "Build contrast" : eventSpread >= 12 || drumSpread >= 8 || musicSpread >= 6 ? "Contrast ready" : "Contrast thin";
  const tone: MixCoachTone = activeSummaries.length < 2 ? "warn" : statusLabel === "Contrast ready" ? "good" : "warn";
  const contrastLabel = `${eventSpread} event spread`;
  const metricLabel = `${activeSummaries.length}/3 active / ${arrangedPatterns}/3 arranged / D${drumSpread} M${musicSpread}`;
  const headline =
    statusLabel === "Contrast ready"
      ? `${strongest ? `Pattern ${strongest.slot}` : "A/B/C"} carries the lift`
      : activeSummaries.length < 2
        ? "Add or clone another Pattern"
        : "Make one Pattern more different";
  const detailLabel =
    statusLabel === "Contrast ready"
      ? `${strongest ? `Lift ${strongest.slot}` : "Lift ready"} / ${thinnest ? `Break ${thinnest.slot}` : "break ready"}`
      : activeSummaries.length < 2
        ? "Use Pattern Clone, Stack, Variation, or manual layers to create a second loop"
        : "Use Hook, Break, Switchup, Fill, or selected-event edits to widen A/B/C contrast";
  const slots = orderedSummaries.map((summary) =>
    createPatternContrastSlotSummary(summary, strongest?.slot ?? "A", thinnest?.slot ?? "A", statusLabel)
  );
  const auditionCue =
    statusLabel === "Contrast ready"
      ? `Cue Pattern ${strongest?.slot ?? "A"} against Pattern ${thinnest?.slot ?? "A"} and hear whether the section lift is obvious.`
      : "Loop Pattern A/B/C one at a time and make one loop clearly denser, sparser, or more transitional.";
  const nextCheck =
    statusLabel === "Contrast ready"
      ? "Use Pattern Compare, Pattern Chain, or Arrangement Template to place the contrast intentionally."
      : activeSummaries.length < 2
        ? "Create a second Pattern before arranging the song form."
        : "Apply a variation, fill, or manual layer edit, then return to Pattern Contrast.";

  return {
    statusLabel,
    headline,
    contrastLabel,
    metricLabel,
    detailLabel,
    auditionCue,
    nextCheck,
    detailTitle: `${statusLabel}: ${headline}; ${contrastLabel}; ${metricLabel}; ${detailLabel}.`,
    tone,
    slots
  };
}

export function createPatternContrastRoleMapSummary(
  summary: PatternContrastSummary,
  arrangement: ArrangementBlock[],
  selectedArrangementIndex: number
): PatternContrastRoleMapSummary {
  const roleByPattern = new Map<PatternSlot, PatternContrastSlotSummary>(
    summary.slots.map((slot) => [slot.slot, slot])
  );
  let startBar = 1;
  const blocks = arrangement.map((block, index) => {
    const bars = normalizeArrangementBars(block.bars);
    const endBar = startBar + bars - 1;
    const barLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
    const slot = roleByPattern.get(block.pattern);
    const role = slot?.role ?? "blank";
    const roleLabel = slot?.roleLabel ?? "Blank";
    const selected = index === selectedArrangementIndex;
    const tone: MixCoachTone = role === "blank" ? "warn" : selected ? "good" : "good";
    const mapBlock = {
      index,
      sectionLabel: block.section,
      pattern: block.pattern,
      role,
      roleLabel,
      barLabel,
      detailLabel: `${block.section} / Pattern ${block.pattern} / ${roleLabel} / ${barLabel} / ${barCountLabel(bars)}`,
      selected,
      tone
    };
    startBar = endBar + 1;
    return mapBlock;
  });
  const placedRoles = new Set(blocks.filter((block) => block.role !== "blank").map((block) => block.role));
  const blankBlocks = blocks.filter((block) => block.role === "blank").length;
  const roleCoverage = placedRoles.size;
  const blockCount = blocks.length;
  const selectedBlock = blocks.find((block) => block.selected) ?? blocks[0] ?? null;
  const statusLabel =
    blockCount === 0
      ? "Map unavailable"
      : blankBlocks > 0
        ? "Role gap"
        : roleCoverage >= 3
          ? "Role map ready"
          : roleCoverage >= 2
            ? "Role map partial"
            : "Role map thin";
  const tone: MixCoachTone = statusLabel === "Role map ready" ? "good" : "warn";
  const headline =
    blockCount === 0
      ? "No arrangement blocks"
      : `${roleCoverage}/4 roles placed across ${blockCount} block${blockCount === 1 ? "" : "s"}`;
  const patternUseCounts = patternSlots
    .map((slot) => `${slot}:${blocks.filter((block) => block.pattern === slot).length}`)
    .join(" ");
  const metricLabel = `${blockCount} blocks / ${roleCoverage}/4 roles / ${patternUseCounts}`;
  const detailLabel = selectedBlock
    ? `Selected Block ${selectedBlock.index + 1}: ${selectedBlock.roleLabel} Pattern ${selectedBlock.pattern} / ${selectedBlock.sectionLabel} / ${selectedBlock.barLabel}`
    : "Create arrangement blocks before mapping roles.";
  const auditionCue =
    blockCount === 0
      ? "Create an arrangement block, then return to Pattern Contrast Role Map."
      : `Play Block loop on ${selectedBlock?.roleLabel ?? "the selected role"} and compare it against the full Song loop.`;
  const nextCheck =
    statusLabel === "Role map ready"
      ? "Scan Song Form Overview and Arrangement Playback before placing another role."
      : "Use Pattern Contrast Use only when a selected block should take a named role.";

  return {
    statusLabel,
    headline,
    metricLabel,
    detailLabel,
    auditionCue,
    nextCheck,
    detailTitle: `${statusLabel}: ${headline}; ${metricLabel}; ${detailLabel}.`,
    tone,
    blocks
  };
}

function createPatternContrastSlotSummary(
  summary: PatternCompareSummary,
  strongestSlot: PatternSlot,
  thinnestSlot: PatternSlot,
  statusLabel: string
): PatternContrastSlotSummary {
  const musicEvents = summary.bassNotes + summary.chordEvents + summary.melodyNotes;
  const role = patternContrastRole(summary, strongestSlot, thinnestSlot, statusLabel);
  const roleLabel = patternContrastRoleLabel(role);
  const eventLabel = `${summary.eventCount} events`;
  const layerLabel = `${summary.drumHits} drums / ${musicEvents} music`;
  const arrangementLabel =
    summary.arrangedBlocks === 0
      ? "not arranged"
      : `${summary.arrangedBlocks} block${summary.arrangedBlocks === 1 ? "" : "s"} / ${barCountLabel(summary.arrangedBars)}`;
  const tone: MixCoachTone = role === "blank" ? "warn" : role === "anchor" && statusLabel !== "Contrast ready" ? "warn" : "good";

  return {
    slot: summary.slot,
    role,
    roleLabel,
    eventLabel,
    layerLabel,
    arrangementLabel,
    detailLabel: `${eventLabel} / ${layerLabel} / ${arrangementLabel}`,
    tone
  };
}

function patternContrastRole(
  summary: PatternCompareSummary,
  strongestSlot: PatternSlot,
  thinnestSlot: PatternSlot,
  statusLabel: string
): PatternContrastRole {
  const musicEvents = summary.bassNotes + summary.chordEvents + summary.melodyNotes;
  if (summary.eventCount === 0) {
    return "blank";
  }
  if (statusLabel === "Contrast ready" && summary.slot === strongestSlot) {
    return "lift";
  }
  if (statusLabel === "Contrast ready" && summary.slot === thinnestSlot) {
    return "break";
  }
  if (summary.drumHits >= 14 && musicEvents >= 8) {
    return "switchup";
  }
  return "anchor";
}

function patternContrastRoleLabel(role: PatternContrastRole): string {
  switch (role) {
    case "anchor":
      return "Anchor";
    case "lift":
      return "Lift";
    case "break":
      return "Break";
    case "switchup":
      return "Switchup";
    case "blank":
      return "Blank";
  }
}

export function createPatternCompareDecisionSummary(
  summaries: PatternCompareSummary[],
  selectedPattern: PatternSlot,
  selectedBlockPattern: PatternSlot
): PatternCompareDecisionSummary {
  const strongest = [...summaries].sort(
    (first, second) =>
      second.eventCount - first.eventCount ||
      second.arrangedBars - first.arrangedBars ||
      patternSlots.indexOf(first.slot) - patternSlots.indexOf(second.slot)
  )[0];
  const selectedSummary = summaries.find((summary) => summary.slot === selectedPattern) ?? strongest;

  if (!strongest || strongest.eventCount === 0) {
    const target = selectedSummary?.slot ?? selectedPattern;
    return {
      action: "cue",
      target,
      statusLabel: "Build first",
      targetLabel: `Pattern ${target}`,
      actionLabel: "Cue Pattern loop",
      detailLabel: "No A/B/C events yet; add drums, 808, chords, or Synth before placing a block",
      metricLabel: "0 events / 0 arranged bars",
      detailTitle: "Build first / Pattern Compare has no events to place yet / Cue a Pattern loop and write the core beat.",
      tone: "danger"
    };
  }

  const noteCount = strongest.bassNotes + strongest.melodyNotes;
  const metricLabel = `${strongest.drumHits} drums / ${noteCount} notes / ${strongest.chordEvents} chords`;
  const tone: MixCoachTone = strongest.eventCount >= 24 ? "good" : strongest.eventCount >= 12 ? "warn" : "danger";

  if (strongest.eventCount < 12) {
    return {
      action: "cue",
      target: strongest.slot,
      statusLabel: "Cue and build",
      targetLabel: `Pattern ${strongest.slot}`,
      actionLabel: "Cue Pattern loop",
      detailLabel: `${strongest.eventCount} events is thin; add core layers before using it in the song`,
      metricLabel,
      detailTitle: `Cue and build / Pattern ${strongest.slot} has ${strongest.eventCount} events / ${metricLabel}`,
      tone
    };
  }

  const action: PatternCompareDecisionSummary["action"] = selectedBlockPattern === strongest.slot ? "cue" : "use";

  if (action === "use") {
    return {
      action,
      target: strongest.slot,
      statusLabel: "Place strongest",
      targetLabel: `Pattern ${strongest.slot}`,
      actionLabel: "Use in selected block",
      detailLabel: `Selected block has Pattern ${selectedBlockPattern}; Pattern ${strongest.slot} carries ${strongest.eventCount} events`,
      metricLabel,
      detailTitle: `Place strongest / Pattern ${strongest.slot} -> selected block / ${metricLabel}`,
      tone
    };
  }

  return {
    action,
    target: strongest.slot,
    statusLabel: "Cue strongest",
    targetLabel: `Pattern ${strongest.slot}`,
    actionLabel: "Cue Pattern loop",
    detailLabel: `Selected block already uses Pattern ${strongest.slot}; audition the loop before editing or arranging`,
    metricLabel,
    detailTitle: `Cue strongest / Pattern ${strongest.slot} already sits in the selected block / ${metricLabel}`,
    tone
  };
}

export function createPatternCompareResult(
  action: PatternCompareResult["action"],
  pattern: PatternSlot,
  beforeProject: ProjectState,
  afterProject: ProjectState,
  selectedArrangementIndex: number
): PatternCompareResult {
  const beforePattern = beforeProject.patterns[beforeProject.selectedPattern];
  const targetPattern = afterProject.patterns[pattern];
  const beforeEvents = patternEventTotal(beforePattern);
  const targetEvents = patternEventTotal(targetPattern);
  const beforeBlock = beforeProject.arrangement[selectedArrangementIndex] ?? null;
  const afterBlock = afterProject.arrangement[selectedArrangementIndex] ?? beforeBlock;
  const beforeBlockPattern = beforeBlock?.pattern ?? beforeProject.selectedPattern;
  const beforeBlockEvents = patternEventTotal(beforeProject.patterns[beforeBlockPattern]);
  const arrangedBlocks = afterProject.arrangement.filter((block) => block.pattern === pattern);
  const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  const tone: MixCoachTone = targetEvents > 0 ? "good" : "warn";

  if (action === "cue") {
    return {
      action,
      pattern,
      title: `Pattern ${pattern} cued`,
      status: "Cued",
      detail: `Pattern loop / ${targetEvents} events`,
      scope: "Pattern loop audition",
      impact: beforeProject.selectedPattern === pattern ? "Loop scope refreshed" : `Pattern ${beforeProject.selectedPattern} -> ${pattern}`,
      metrics: [
        createPatternCompareResultMetric("pattern", "Pattern", `Pattern ${beforeProject.selectedPattern}`, `Pattern ${pattern}`, "good"),
        createPatternCompareResultMetric("events", "Events", `${beforeEvents} events`, `${targetEvents} events`, tone),
        createPatternCompareResultMetric(
          "block",
          "Block",
          beforeBlock ? `Block ${selectedArrangementIndex + 1}` : "No block",
          "Pattern loop",
          "good"
        )
      ],
      auditionCue: `Play Pattern loop; compare Pattern ${pattern}'s drums, 808, chords, and Synth before editing or arranging.`,
      nextCheck: "Use Pattern Switch to edit the cued variation or Pattern Use to place it into the selected arrangement block.",
      tone
    };
  }

  return {
    action,
    pattern,
    title: `Pattern ${pattern} placed`,
    status: "Placed",
    detail: afterBlock ? `Block ${selectedArrangementIndex + 1} ${afterBlock.section}` : "Selected block",
    scope: afterBlock ? `${afterBlock.section} block` : "Selected block",
    impact:
      beforeBlock && afterBlock
        ? `Pattern ${beforeBlock.pattern} -> ${afterBlock.pattern}`
        : `Selected block uses Pattern ${pattern}`,
    metrics: [
      createPatternCompareResultMetric(
        "pattern",
        "Pattern",
        beforeBlock ? `Pattern ${beforeBlock.pattern}` : `Pattern ${beforeProject.selectedPattern}`,
        `Pattern ${pattern}`,
        "good"
      ),
      createPatternCompareResultMetric("events", "Events", `${beforeBlockEvents} before`, `${targetEvents} placed`, tone),
      createPatternCompareResultMetric(
        "block",
        "Block",
        beforeBlock ? `Block ${selectedArrangementIndex + 1} / ${barCountLabel(normalizeArrangementBars(beforeBlock.bars))}` : "No block",
        afterBlock ? `${afterBlock.section} / ${barCountLabel(normalizeArrangementBars(afterBlock.bars))}` : "No block",
        arrangedBars > 0 ? "good" : "warn"
      )
    ],
    auditionCue: `Play Block loop; confirm the selected arrangement block now works with Pattern ${pattern}.`,
    nextCheck: "Scan Song Form Overview, Pattern Compare, and Arrangement Playback Readout before placing the next variation.",
    tone
  };
}

export function createPatternCompareResultMetric(
  id: PatternCompareResult["metrics"][number]["id"],
  label: string,
  before: string,
  after: string,
  tone: MixCoachTone
): PatternCompareResult["metrics"][number] {
  return { id, label, before, after, tone };
}

export function createPatternDnaSummary(project: ProjectState): PatternDnaSummary {
  const slot = project.selectedPattern;
  const pattern = project.patterns[slot];
  const drumHits = drumHitCount(pattern);
  const bassNotes = pattern.bassNotes.length;
  const melodyNotes = pattern.melodyNotes.length;
  const chordEvents = pattern.chordEvents.length;
  const eventCount = patternEventTotal(pattern);
  const arrangedBlocks = project.arrangement.filter((block) => block.pattern === slot);
  const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  const arrangedSections = [...new Set(arrangedBlocks.map((block) => block.section))];

  const layers = [
    { label: "Drums", ready: drumHits > 0 },
    { label: "808", ready: bassNotes > 0 },
    { label: "Chords", ready: chordEvents > 0 },
    { label: "Synth", ready: melodyNotes > 0 }
  ];
  const readyLayers = layers.filter((layer) => layer.ready);
  const missingLayers = layers.filter((layer) => !layer.ready);
  const layerTone: MixCoachTone = readyLayers.length >= 4 ? "good" : readyLayers.length >= 2 ? "warn" : "danger";
  const densityLabel = styleDensityLabel(eventCount);
  const densityTone: MixCoachTone = eventCount >= 24 ? "good" : eventCount >= 12 ? "warn" : "danger";
  const dynamicsCard = createPatternDynamicsCard(pattern);
  const variationSignals = patternVariationSignals(pattern);
  const variationTone: MixCoachTone =
    variationSignals.length >= 3 ? "good" : variationSignals.length >= 1 ? "warn" : "danger";
  const arrangementTone: MixCoachTone = arrangedBars >= 4 ? "good" : arrangedBars > 0 ? "warn" : "danger";

  const cards: PatternDnaCard[] = [
    {
      id: "layers",
      label: "Layers",
      value: `${readyLayers.length}/4 ready`,
      detail:
        readyLayers.length === layers.length
          ? readyLayers.map((layer) => layer.label).join(" / ")
          : `Add ${missingLayers.map((layer) => layer.label).join(" / ")}`,
      tone: layerTone,
      focusTarget: "compose",
      focusLabel: "Compose"
    },
    {
      id: "density",
      label: "Density",
      value: densityLabel,
      detail: `${drumHits} drums / ${bassNotes + melodyNotes} notes / ${chordEvents} chords`,
      tone: densityTone,
      focusTarget: "compose",
      focusLabel: "Compose"
    },
    dynamicsCard,
    {
      id: "variation",
      label: "Variation",
      value: variationSignals.length > 0 ? `${variationSignals.length} signals` : "Straight loop",
      detail: variationSignals.length > 0 ? variationSignals.join(" / ") : "Add chance, timing, glide, or rolls",
      tone: variationTone,
      focusTarget: "compose",
      focusLabel: "Compose"
    },
    {
      id: "arrangement",
      label: "Arrangement",
      value: arrangedBars > 0 ? barCountLabel(arrangedBars) : "Not arranged",
      detail:
        arrangedBlocks.length > 0
          ? `${arrangedBlocks.length} block${arrangedBlocks.length === 1 ? "" : "s"} / ${arrangedSections.join("/")}`
          : "Use in a block or Pattern Chain",
      tone: arrangementTone,
      focusTarget: "arrange",
      focusLabel: "Arrange"
    }
  ];

  const tone = weakestTone(cards.map((card) => card.tone));
  const headline =
    tone === "good"
      ? `Pattern ${slot} is song-ready`
      : layerTone === "danger"
        ? `Build Pattern ${slot} core`
        : arrangementTone === "danger"
          ? `Place Pattern ${slot} in the song`
          : `Shape Pattern ${slot} motion`;

  return {
    slot,
    headline,
    detail: `${densityLabel} / ${readyLayers.length}/4 layers / ${dynamicsCard.value} / ${
      arrangedBars > 0 ? barCountLabel(arrangedBars) : "not arranged"
    }`,
    tone,
    cards
  };
}

export function createPatternDynamicsCard(pattern: PatternData): PatternDnaCard {
  const drumVelocities = drumPatternVelocityValues(pattern);
  const bassVelocities = pattern.bassNotes.map((note) => clampVelocity(note.velocity));
  const chordVelocities = pattern.chordEvents.map((chord) => clampVelocity(chord.velocity));
  const melodyVelocities = pattern.melodyNotes.map((note) => clampVelocity(note.velocity));
  const layerVelocities = [
    { label: "Dr", values: drumVelocities },
    { label: "808", values: bassVelocities },
    { label: "Ch", values: chordVelocities },
    { label: "Sy", values: melodyVelocities }
  ];
  const values = layerVelocities.flatMap((layer) => layer.values);

  if (values.length === 0) {
    return {
      id: "dynamics",
      label: "Dynamics",
      value: "No events",
      detail: "Add events before shaping velocity",
      tone: "danger",
      focusTarget: "compose",
      focusLabel: "Compose"
    };
  }

  const average = averageUnitVelocity(values);
  const spread = Math.round((Math.max(...values) - Math.min(...values)) * 100);
  const tone: MixCoachTone = spread >= 18 ? "good" : spread >= 8 ? "warn" : "danger";

  return {
    id: "dynamics",
    label: "Dynamics",
    value: `${percentLabel(average)} avg`,
    detail: `${spread}pt spread / ${layerVelocities.map((layer) => `${layer.label} ${velocityLayerLabel(layer.values)}`).join(" / ")}`,
    tone,
    focusTarget: "compose",
    focusLabel: "Compose"
  };
}

export function drumPatternVelocityValues(pattern: PatternData): number[] {
  return (Object.keys(drumLabels) as DrumLane[]).flatMap((lane) =>
    pattern.drumPattern[lane]
      .map((enabled, step) => (enabled ? normalizeDrumVelocity(drumStepVelocity(pattern, lane, step)) : null))
      .filter((velocity): velocity is number => velocity !== null)
  );
}

export function averageUnitVelocity(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function velocityLayerLabel(values: number[]): string {
  return values.length > 0 ? percentLabel(averageUnitVelocity(values)) : "--";
}

export function createLayerStarterOptions(project: ProjectState): LayerStarterOption[] {
  const pattern = activePattern(project);
  const styleActionProfile = composerActionStyleProfile(project);
  const drumHits = drumHitCount(pattern);
  const bassNotes = pattern.bassNotes.length;
  const chordEvents = pattern.chordEvents.length;
  const melodyNotes = pattern.melodyNotes.length;

  return [
    createLayerStarterOption(
      "drums",
      "Drums",
      drumHits,
      styleActionProfile.goals.drumHits,
      drumFoundationLabel(composerDrumFoundation(project)),
      styleActionProfile.cues.drums
    ),
    createLayerStarterOption(
      "bass",
      "808",
      bassNotes,
      styleActionProfile.goals.bassNotes,
      basslinePadLabel(composerBasslinePad(project)),
      styleActionProfile.cues.bass
    ),
    createLayerStarterOption(
      "chords",
      "Chords",
      chordEvents,
      styleActionProfile.goals.chordEvents,
      chordProgressionPresetLabel(composerChordPreset(project)),
      styleActionProfile.cues.harmony
    ),
    createLayerStarterOption(
      "melody",
      "Synth",
      melodyNotes,
      styleActionProfile.goals.melodyNotes,
      melodyMotifLabel(composerMelodyMotif(project)),
      styleActionProfile.cues.melody
    )
  ];
}

export function createLayerStarterOption(
  id: LayerStarterId,
  label: string,
  count: number,
  goal: number,
  actionLabel: string,
  targetLabel: string
): LayerStarterOption {
  const tone = composerActionTone(count, goal);
  const status = count === 0 ? "Missing" : tone === "good" ? "Ready" : "Thin";
  const countLabel = `${count}/${goal}`;

  return {
    id,
    label,
    status,
    detail: `${label} ${countLabel} / ${targetLabel} / ${actionLabel}`,
    actionLabel,
    targetLabel,
    countLabel,
    tone
  };
}

export function createPatternDnaFocusSummary(
  summary: PatternDnaSummary,
  focusedCardId: PatternDnaCardId | null
): PatternDnaFocusSummary {
  const focusedCard = focusedCardId ? summary.cards.find((card) => card.id === focusedCardId) ?? null : null;
  const card = focusedCard ?? summary.cards.find((candidate) => candidate.tone !== "good") ?? summary.cards[0] ?? null;

  if (!card) {
    return {
      cardId: null,
      statusLabel: "DNA clear",
      areaLabel: "No DNA cards",
      detailLabel: "No Pattern DNA cards available",
      detailTitle: "Pattern DNA has no cards to focus.",
      tone: "good"
    };
  }

  const statusLabel = focusedCard ? "Focused DNA" : card.tone === "good" ? "DNA clear" : "Top DNA Focus";
  const detailLabel = `${card.focusLabel} panel / ${card.detail}`;

  return {
    cardId: card.id,
    statusLabel,
    areaLabel: `${card.label}: ${card.value}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${card.label}: ${card.value} / ${detailLabel}`,
    tone: card.tone
  };
}

export function createPatternDnaFocusResult(card: PatternDnaCard, summary: PatternDnaSummary): PatternDnaFocusResult {
  return {
    cardId: card.id,
    status: "Focused",
    title: `${card.label} DNA focused`,
    detail: `${card.focusLabel}: ${card.value}`,
    metricLabel: "Pattern",
    metricValue: patternDnaFocusResultMetric(summary),
    auditionCue: patternDnaFocusResultAudition(card),
    nextCheck: patternDnaFocusResultNextCheck(card),
    tone: card.tone
  };
}

export function patternDnaFocusResultMetric(summary: PatternDnaSummary): string {
  const readyCount = summary.cards.filter((card) => card.tone === "good").length;
  const reviewCount = summary.cards.filter((card) => card.tone === "warn").length;
  const blockerCount = summary.cards.filter((card) => card.tone === "danger").length;

  return `Pattern ${summary.slot} / ${readyCount}/${summary.cards.length} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function patternDnaFocusResultAudition(card: PatternDnaCard): string {
  switch (card.id) {
    case "layers":
      return "Loop the selected Pattern and check whether drums, 808, chords, and synth each have a role.";
    case "density":
      return "Listen for whether event density fits the style without crowding the bounce or topline space.";
    case "dynamics":
      return "Check velocity contrast across drums, 808, chords, and synth before adding more events.";
    case "variation":
      return "Listen for chance, timing, glide, repeat, or roll movement before duplicating the loop.";
    case "arrangement":
      return "Play Song or Block loop and check whether this Pattern has a useful section role.";
  }
}

export function patternDnaFocusResultNextCheck(card: PatternDnaCard): string {
  switch (card.id) {
    case "layers":
      return "Return after each missing core layer is added or intentionally left open.";
    case "density":
      return "Return after the loop feels full enough without masking vocal or hook space.";
    case "dynamics":
      return "Return after events have enough velocity contrast to avoid a flat loop.";
    case "variation":
      return "Return after the loop has intentional movement or a clear reason to stay straight.";
    case "arrangement":
      return "Return after the selected Pattern has a clear arrangement role or section destination.";
  }
}

export function patternVariationSignals(pattern: PatternData): string[] {
  const lanes = Object.keys(drumLabels) as DrumLane[];
  const hasVelocity = lanes.some((lane) =>
    pattern.drumPattern[lane].some(
      (enabled, step) => enabled && Math.abs(drumStepVelocity(pattern, lane, step) - defaultDrumVelocity(lane, step)) > 0.01
    )
  );
  const hasTiming = lanes.some((lane) =>
    pattern.drumPattern[lane].some((enabled, step) => enabled && Math.abs(drumStepTimingMs(pattern, lane, step)) > 0)
  );
  const hasChance =
    lanes.some((lane) =>
      pattern.drumPattern[lane].some((enabled, step) => enabled && drumStepProbability(pattern, lane, step) < 1)
    ) ||
    pattern.bassNotes.some((note) => normalizeEventProbability(note.probability) < 1) ||
    pattern.melodyNotes.some((note) => normalizeEventProbability(note.probability) < 1) ||
    pattern.chordEvents.some((event) => normalizeEventProbability(event.probability) < 1);
  const hasRolls = pattern.drumPattern.hat.some((enabled, step) => enabled && hatRepeatCount(pattern, step) > 1);
  const hasGlide = pattern.bassNotes.some((note) => note.glide);

  return [
    hasVelocity ? "Accent" : "",
    hasTiming ? "Timing" : "",
    hasChance ? "Chance" : "",
    hasRolls ? "Rolls" : "",
    hasGlide ? "Glide" : ""
  ].filter(Boolean);
}

export function createStyleInspectorSummary(
  project: ProjectState,
  profile: StyleProfile,
  patternSummaries: PatternCompareSummary[]
): StyleInspectorSummary {
  const totalEvents = patternSummaries.reduce((total, pattern) => total + pattern.eventCount, 0);
  const styleActionProfile = composerStyleActionProfiles[profile.id];
  const soundPreset = styleSoundPreset(profile.id);
  const bpm = `${project.bpm} active / ${profile.bpmRange[0]}-${profile.bpmRange[1]}`;
  const swing = `${percentLabel(project.swing)} active / ${percentLabel(profile.defaultSwing)} default`;
  const bass = bassStyleRoleLabel(profile.bassStyle);
  const melody = melodyStyleRoleLabel(profile.melodyStyle);
  const soundPresetName = soundPresetLabel(soundPreset);
  const metrics: StyleInspectorMetric[] = [
    {
      id: "bpm",
      focusId: "bpm",
      label: "BPM range",
      value: bpm,
      detail: "Tempo controls define the writing grid",
      focusTarget: "transport",
      focusLabel: "Transport"
    },
    {
      id: "swing",
      focusId: "swing",
      label: "Swing",
      value: swing,
      detail: "Groove feel shapes Pattern timing",
      focusTarget: "compose",
      focusLabel: "Compose"
    },
    {
      id: "bass",
      focusId: "bass",
      label: "Bass role",
      value: bass,
      detail: "Low-end role guides 808 writing",
      focusTarget: "compose",
      focusLabel: "Compose"
    },
    {
      id: "melody",
      focusId: "melody",
      label: "Melody role",
      value: melody,
      detail: "Topline role guides Synth writing",
      focusTarget: "compose",
      focusLabel: "Compose"
    },
    {
      id: "sound",
      focusId: "sound",
      label: "Sound",
      value: soundPresetName,
      detail: "Tone preset maps into instruments",
      focusTarget: "sound",
      focusLabel: "Sound"
    }
  ];

  return {
    profile,
    bpm,
    swing,
    bass,
    melody,
    soundPreset: soundPresetName,
    goalHeadline: styleActionProfile.focus,
    totalEvents,
    metrics,
    goals: createStyleGoalCards(project, styleActionProfile),
    patterns: patternSummaries.map((pattern) => ({
      slot: pattern.slot,
      label: styleDensityLabel(pattern.eventCount),
      value: styleDensityLabel(pattern.eventCount),
      eventCount: pattern.eventCount,
      detail: `${pattern.eventCount} events / ${pattern.drumHits} drums / ${pattern.bassNotes + pattern.melodyNotes} notes`,
      focusId: `density-${pattern.slot}`,
      focusTarget: "compose",
      focusLabel: "Compose"
    }))
  };
}

export function createStyleGoalCards(project: ProjectState, styleActionProfile: ComposerStyleActionProfile): StyleGoalCard[] {
  const { cues, goals, priorities } = styleActionProfile;
  const pattern = activePattern(project);
  const drumHits = drumHitCount(pattern);
  const bassNotes = pattern.bassNotes.length;
  const chordEvents = pattern.chordEvents.length;
  const melodyNotes = pattern.melodyNotes.length;
  const arrangedBars = arrangementTotalBars(project);

  return [
    createStyleGoalCard("drums", "Drums", drumHits, goals.drumHits, "hits", cues.drums, priorities.drums),
    createStyleGoalCard("bass", "808/Bass", bassNotes, goals.bassNotes, "notes", cues.bass, priorities.bass),
    createStyleGoalCard("harmony", "Harmony", chordEvents, goals.chordEvents, "chords", cues.harmony, priorities.harmony),
    createStyleGoalCard("melody", "Melody", melodyNotes, goals.melodyNotes, "notes", cues.melody, priorities.melody),
    createStyleGoalCard("arrange", "Arrange", arrangedBars, goals.arrangementBars, "bars", cues.arrange, priorities.arrange)
  ];
}

export function createStyleGoalCard(
  id: StyleGoalCard["id"],
  label: string,
  current: number,
  goal: number,
  unit: string,
  cue: string,
  priority: number
): StyleGoalCard {
  const tone = composerActionTone(current, goal);
  const currentLabel = styleGoalCountLabel(current, unit);
  const targetLabel = `${goal} ${unit}`;
  return {
    id,
    focusId: `goal-${id}`,
    label,
    value: `${currentLabel} / target ${targetLabel}`,
    current: currentLabel,
    target: targetLabel,
    progress: `${Math.min(current, goal)}/${goal}`,
    cue,
    detail: styleGoalPriorityLabel(priority),
    focusTarget: id === "arrange" ? "arrange" : "compose",
    focusLabel: id === "arrange" ? "Arrange" : "Compose",
    tone
  };
}

export function styleGoalCountLabel(count: number, unit: string): string {
  return `${count} ${unit} now`;
}

export function styleGoalPriorityLabel(priority: number): string {
  return `Writing priority ${priority}`;
}

export function createStyleInspectorFocusSummary(
  summary: StyleInspectorSummary,
  focusedItemId: StyleInspectorFocusId | null
): StyleInspectorFocusSummary {
  const items: StyleInspectorFocusItem[] = [...summary.metrics, ...summary.goals, ...summary.patterns];
  const focusedItem = focusedItemId ? items.find((item) => item.focusId === focusedItemId) ?? null : null;
  const item = focusedItem ?? items[0] ?? null;

  if (!item) {
    return {
      focusId: null,
      statusLabel: "Style clear",
      areaLabel: "No style focus",
      detailLabel: "No Style Inspector items available",
      detailTitle: "Style Inspector has no focusable items."
    };
  }

  const statusLabel = focusedItem ? "Focused Style" : "Style Focus";
  const detailLabel = `${item.focusLabel} panel / ${item.detail}`;

  return {
    focusId: item.focusId,
    statusLabel,
    areaLabel: `${item.label}: ${item.value}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${item.label}: ${item.value} / ${detailLabel}`
  };
}

export function createStyleInspectorFocusResult(
  item: StyleInspectorFocusItem,
  summary: StyleInspectorSummary
): StyleInspectorFocusResult {
  return {
    focusId: item.focusId,
    status: "Focused",
    title: styleInspectorFocusResultTitle(item),
    detail: `${item.focusLabel}: ${styleInspectorFocusResultDetail(item)}`,
    destination: `${item.focusLabel} panel`,
    metricLabel: "Style",
    metricValue: styleInspectorFocusResultMetric(summary),
    auditionCue: styleInspectorFocusResultAudition(item),
    nextCheck: styleInspectorFocusResultNextCheck(item),
    tone: styleInspectorFocusResultTone(item)
  };
}

export function styleInspectorFocusResultTitle(item: StyleInspectorFocusItem): string {
  if (item.focusId.startsWith("density-")) {
    return `Pattern ${item.focusId.replace("density-", "")} density focused`;
  }
  if (item.focusId.startsWith("goal-")) {
    return `${item.label} goal focused`;
  }
  return `${item.label} style focused`;
}

export function styleInspectorFocusResultDetail(item: StyleInspectorFocusItem): string {
  if (item.focusId.startsWith("density-")) {
    return `Pattern ${item.focusId.replace("density-", "")} ${item.value}`;
  }
  return item.value;
}

export function styleInspectorFocusResultMetric(summary: StyleInspectorSummary): string {
  const readyCount = summary.goals.filter((goal) => goal.tone === "good").length;
  const reviewCount = summary.goals.filter((goal) => goal.tone === "warn").length;
  const blockerCount = summary.goals.filter((goal) => goal.tone === "danger").length;

  return `${summary.profile.name} / ${summary.totalEvents} events / ${readyCount}/${summary.goals.length} goals ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function styleInspectorFocusResultAudition(item: StyleInspectorFocusItem): string {
  switch (item.focusId) {
    case "bpm":
      return "Tap, nudge, or play the beat and check whether tempo sits inside the style pocket.";
    case "swing":
      return "Loop the selected Pattern and check whether hats, drums, and notes lean with the style.";
    case "bass":
      return "Loop 808/Bass against kick and confirm the low-end role matches this style.";
    case "melody":
      return "Audition melody with chords and leave space for the hook or topline.";
    case "sound":
      return "Play the full loop and confirm drums, 808, synth, and chords share one tone direction.";
    case "goal-drums":
      return "Loop the Pattern and check whether the drum foundation carries the style.";
    case "goal-bass":
      return "Check kick-to-808 movement before adding extra melody.";
    case "goal-harmony":
      return "Listen for chord support and make sure harmony does not crowd the hook.";
    case "goal-melody":
      return "Audition the motif against the groove and confirm the lead role is clear.";
    case "goal-arrange":
      return "Play Song loop and check whether the arrangement has enough section movement.";
  }

  return `Audition Pattern ${item.focusId.replace("density-", "")} and compare density against the active style.`;
}

export function styleInspectorFocusResultNextCheck(item: StyleInspectorFocusItem): string {
  switch (item.focusId) {
    case "bpm":
      return "Return after the tempo feels locked for both writing grid and bounce.";
    case "swing":
      return "Return after groove timing feels intentional instead of random.";
    case "bass":
      return "Return after the bass role supports the groove without masking kick or hook space.";
    case "melody":
      return "Return after the motif has a clear role and leaves room for a vocal or hook.";
    case "sound":
      return "Return after the tone direction feels consistent across the core instruments.";
    case "goal-drums":
      return "Return after drum hits meet the style goal or the sparse choice is intentional.";
    case "goal-bass":
      return "Return after 808/Bass notes meet the style goal or leave deliberate low-end space.";
    case "goal-harmony":
      return "Return after harmony supports the loop without overfilling the pocket.";
    case "goal-melody":
      return "Return after the melody goal is met or the beat intentionally stays minimal.";
    case "goal-arrange":
      return "Return after sections give the beat a usable producer handoff shape.";
  }

  return "Return after Pattern density feels deliberate for this genre pocket.";
}

export function styleInspectorFocusResultTone(item: StyleInspectorFocusItem): StyleInspectorFocusResult["tone"] {
  if (item.focusId.startsWith("goal-") && "tone" in item) {
    return (item as StyleGoalCard).tone;
  }

  if (item.focusId.startsWith("density-") && "eventCount" in item) {
    const eventCount = (item as StylePatternDensity).eventCount;
    if (eventCount >= 12) {
      return "good";
    }
    if (eventCount >= 8) {
      return "warn";
    }
    return "danger";
  }

  return "good";
}

export function styleDensityLabel(eventCount: number): string {
  if (eventCount >= 30) {
    return "Dense";
  }
  if (eventCount >= 20) {
    return "Full";
  }
  if (eventCount >= 12) {
    return "Pocket";
  }
  return "Open";
}

export function bassStyleRoleLabel(style: StyleProfile["bassStyle"]): string {
  switch (style) {
    case "808":
      return "808 lead";
    case "sub":
      return "Sub anchor";
    case "walking":
      return "Walking bass";
    case "pluck":
      return "Pluck groove";
    case "reese":
      return "Reese weight";
    case "minimal":
      return "Minimal low end";
  }
}

export function melodyStyleRoleLabel(style: StyleProfile["melodyStyle"]): string {
  switch (style) {
    case "riff":
      return "Riff hook";
    case "chordal":
      return "Chord focus";
    case "loop":
      return "Loop motif";
    case "ambient":
      return "Ambient texture";
    case "none":
      return "Rhythm first";
  }
}

export function createBeatReadinessChecks(project: ProjectState, analysis: ExportAnalysis): BeatReadinessCheck[] {
  const arrangedPatterns = arrangedPatternData(project);
  const drumHits = arrangedPatterns.reduce((total, pattern) => total + drumHitCount(pattern), 0);
  const hasKick = arrangedPatterns.some((pattern) => pattern.drumPattern.kick.some(Boolean));
  const hasClap = arrangedPatterns.some((pattern) => pattern.drumPattern.clap.some(Boolean));
  const bassCount = arrangedPatterns.reduce((total, pattern) => total + pattern.bassNotes.length, 0);
  const melodyCount = arrangedPatterns.reduce((total, pattern) => total + pattern.melodyNotes.length, 0);
  const chordCount = arrangedPatterns.reduce((total, pattern) => total + pattern.chordEvents.length, 0);
  const bars = arrangementTotalBars(project);

  return [
    drumReadinessCheck(drumHits, hasKick, hasClap),
    bassReadinessCheck(bassCount),
    harmonyReadinessCheck(melodyCount, chordCount),
    arrangementReadinessCheck(project.arrangement.length, bars),
    exportReadinessCheck(analysis)
  ];
}

export function createBeatReadinessFocusResult(
  check: BeatReadinessCheck,
  checks: BeatReadinessCheck[]
): BeatReadinessFocusResult {
  return {
    checkId: check.id,
    status: "Focused",
    title: `${check.label} readiness focused`,
    detail: `${check.status}: ${check.detail}`,
    destination: `${check.focusLabel} panel`,
    metricLabel: "Readiness",
    metricValue: beatReadinessFocusResultMetric(checks),
    auditionCue: beatReadinessFocusResultAudition(check),
    nextCheck: beatReadinessFocusResultNextCheck(check),
    tone: check.tone
  };
}

export function beatReadinessFocusResultMetric(checks: BeatReadinessCheck[]): string {
  const readyCount = checks.filter((check) => check.tone === "good").length;
  const reviewCount = checks.filter((check) => check.tone === "warn").length;
  const blockerCount = checks.filter((check) => check.tone === "danger").length;

  return `${readyCount}/${checks.length} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function beatReadinessFocusResultAudition(check: BeatReadinessCheck): string {
  switch (check.id) {
    case "drums":
      return "Loop the selected Pattern and confirm kick, clap, hat, and perc carry the pocket.";
    case "bass":
      return "Listen to kick and 808 together before adding more melody or chords.";
    case "harmony":
      return "Audition melody and chords against the groove and leave room for a hook or vocal.";
    case "arrangement":
      return "Play Song or Block loop and compare section length, energy, and Pattern changes.";
    case "export":
      return "Play the full mix and check signal, headroom, limiter activity, and delivery target.";
  }
}

export function beatReadinessFocusResultNextCheck(check: BeatReadinessCheck): string {
  switch (check.id) {
    case "drums":
      return "Return after the drum foundation is present or the sparse groove is intentional.";
    case "bass":
      return "Return after the low end supports the bounce without masking kick or hook space.";
    case "harmony":
      return "Return after melody or chords give the beat a clear musical idea.";
    case "arrangement":
      return "Return after the loop has a usable section shape or full-song direction.";
    case "export":
      return "Return after the rendered signal is audible, controlled, and ready for handoff.";
  }
}

export function createListeningPassSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): ListeningPassSummary {
  const target = activeDeliveryTarget(project);
  const selectedPattern = activePattern(project);
  const drums = readinessCheckForId(checks, "drums");
  const bass = readinessCheckForId(checks, "bass");
  const harmony = readinessCheckForId(checks, "harmony");
  const arrangement = readinessCheckForId(checks, "arrangement");
  const exportCheck = readinessCheckForId(checks, "export");
  const compositionTone = weakestTone([drums?.tone ?? "danger", bass?.tone ?? "danger", harmony?.tone ?? "danger"]);
  const structure = createStructureLensSummary(project);
  const arrangementTone = weakestTone([
    arrangement?.tone ?? "danger",
    structure.tone,
    isDeliveryTargetAligned(project, target) ? "good" : "warn"
  ]);
  const mixChecks = createMixCoachChecks(analysis, stemAnalyses);
  const mixTone = weakestTone(mixChecks.map((check) => check.tone));
  const mixReviewCount = mixChecks.filter((check) => check.tone !== "good").length;
  const audibleStems = audibleStemTracks(stemAnalyses);
  const briefFields = sessionBriefFilledFields(project.sessionBrief);
  const deliveryTone: MixCoachTone =
    analysis.status === "Ready" && audibleStems.length >= target.stemGoal && briefFields >= 2
      ? "good"
      : analysis.status !== "Silent" && (audibleStems.length >= 2 || briefFields > 0)
        ? "warn"
        : "danger";
  const compositionLayerCount = [
    drumHitCount(selectedPattern) > 0,
    selectedPattern.bassNotes.length > 0,
    selectedPattern.chordEvents.length > 0 || selectedPattern.melodyNotes.length > 0
  ].filter(Boolean).length;
  const usedSlots = usedPatternSlots(project);
  const targetAligned = isDeliveryTargetAligned(project, target);
  const deliveryTarget: ListeningPassTarget =
    project.masterPreset !== target.preferredMasterPreset || analysis.status !== "Ready" ? "master" : "deliver";
  const items: ListeningPassItem[] = [
    {
      id: "composition",
      label: "Composition",
      status: compositionTone === "good" ? "Loop balanced" : compositionTone === "warn" ? "Layer check" : "Core missing",
      cue: `Loop Pattern ${project.selectedPattern}; hear drums, 808, chords, and Synth together.`,
      detail: `${drumHitCount(selectedPattern)} drums / ${selectedPattern.bassNotes.length} 808 / ${selectedPattern.chordEvents.length} chords / ${selectedPattern.melodyNotes.length} Synth`,
      metric: `${compositionLayerCount}/3 layer groups`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: compositionTone
    },
    {
      id: "arrangement",
      label: "Arrangement",
      status: arrangementTone === "good" ? "Form pass" : arrangementTone === "warn" ? "Shape review" : "Too short",
      cue: "Play Song loop; compare intro, verse, hook, bridge, and outro energy.",
      detail: `${barCountLabel(arrangementTotalBars(project))} / ${usedSlots.length}/3 patterns used / ${targetAligned ? "target aligned" : target.name}`,
      metric: `${structure.signals.filter((signal) => signal.tone === "good").length}/${structure.signals.length} structure`,
      focusTarget: "arrange",
      focusLabel: "Arrange",
      tone: arrangementTone
    },
    {
      id: "mix",
      label: "Mix",
      status: mixTone === "good" ? "Balance pass" : mixTone === "warn" ? "Mix review" : "Signal check",
      cue: "Play Full Mix, then compare Drums, 808, Synth, and Chords stems.",
      detail: `${analysis.status} / ${formatDb(analysis.headroomDb)} headroom / ${audibleStems.length} audible stems`,
      metric: mixReviewCount === 0 ? "Mix Coach clear" : `${mixReviewCount} mix checks`,
      focusTarget: "mix",
      focusLabel: "Mix",
      tone: mixTone
    },
    {
      id: "delivery",
      label: "Delivery",
      status: deliveryTone === "good" ? "Send check" : deliveryTone === "warn" ? "Pack review" : "Not ready",
      cue: "Play Full Mix against the delivery target, then confirm WAV, stems, MIDI, and sheet posture.",
      detail: `${target.name} / ${audibleStems.length}/${target.stemGoal} stems / ${briefFields}/4 brief fields`,
      metric: exportCheck ? `${exportCheck.label}: ${exportCheck.status}` : analysis.status,
      focusTarget: deliveryTarget,
      focusLabel: listeningPassFocusLabel(deliveryTarget),
      tone: deliveryTone
    }
  ];
  const tone = weakestTone(items.map((item) => item.tone));
  const readyCount = items.filter((item) => item.tone === "good").length;
  const headline =
    tone === "good" ? "Audition path ready" : tone === "warn" ? "Audition checks need review" : "Build the beat before delivery";

  return {
    headline,
    detail: `${readyCount}/${items.length} passes ready / Pattern ${project.selectedPattern} / ${target.name}`,
    tone,
    items
  };
}

export function createListeningPassFocusResult(item: ListeningPassItem, summary: ListeningPassSummary): ListeningPassFocusResult {
  return {
    itemId: item.id,
    status: "Focused",
    title: `${item.label} listening focused`,
    detail: `${item.status}: ${item.detail}`,
    destination: `${item.focusLabel} panel`,
    metricLabel: "Listening",
    metricValue: listeningPassFocusResultMetric(summary),
    auditionCue: listeningPassFocusResultAudition(item),
    nextCheck: listeningPassFocusResultNextCheck(item),
    tone: item.tone
  };
}

export function createListeningPassFocusSummary(
  summary: ListeningPassSummary,
  focusedItemId: ListeningPassId | null
): ListeningPassFocusSummary {
  const focusedItem = focusedItemId ? summary.items.find((item) => item.id === focusedItemId) ?? null : null;
  const item = focusedItem ?? summary.items.find((passItem) => passItem.tone !== "good") ?? summary.items[0] ?? null;

  if (!item) {
    return {
      itemId: null,
      statusLabel: "Audition clear",
      checkpointLabel: "No listening checkpoint",
      detailLabel: "No Listening Pass items available",
      actionLabel: "Ready",
      detailTitle: "Listening Pass has no checkpoint to focus.",
      tone: "good"
    };
  }

  const statusLabel = focusedItem ? "Focused Audition" : item.tone === "good" ? "Audition ready" : "Next Audition";
  const detailLabel = `${item.focusLabel} panel / ${item.cue} / ${item.metric}`;

  return {
    itemId: item.id,
    statusLabel,
    checkpointLabel: `${item.label}: ${item.status}`,
    detailLabel,
    actionLabel: `Open ${item.focusLabel}`,
    detailTitle: `${statusLabel} / ${item.label}: ${item.status} / ${item.detail}`,
    tone: item.tone
  };
}

export function listeningPassFocusResultMetric(summary: ListeningPassSummary): string {
  const readyCount = summary.items.filter((item) => item.tone === "good").length;
  const reviewCount = summary.items.filter((item) => item.tone === "warn").length;
  const blockerCount = summary.items.filter((item) => item.tone === "danger").length;

  return `${readyCount}/${summary.items.length} passes ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function listeningPassFocusResultAudition(item: ListeningPassItem): string {
  switch (item.id) {
    case "composition":
      return "Loop the selected Pattern and listen for drums, 808, chords, and synth as one idea.";
    case "arrangement":
      return "Play Song loop and compare section length, energy, Pattern changes, and target fit.";
    case "mix":
      return "Play Full Mix, then audition stems to hear balance, low end, and headroom.";
    case "delivery":
      return "Check the full mix against the delivery target, stems, brief, and handoff posture.";
  }
}

export function listeningPassFocusResultNextCheck(item: ListeningPassItem): string {
  switch (item.id) {
    case "composition":
      return "Return after the core loop has a clear musical idea and no missing foundation layer.";
    case "arrangement":
      return "Return after the beat has enough section movement for the intended target.";
    case "mix":
      return "Return after the mix has controlled headroom and audible stem balance.";
    case "delivery":
      return "Return after export, stems, MIDI, and session context are ready for handoff.";
  }
}

export function listeningPassFocusLabel(target: ListeningPassTarget): string {
  switch (target) {
    case "compose":
      return "Compose";
    case "arrange":
      return "Arrange";
    case "mix":
      return "Mix";
    case "master":
      return "Master";
    case "deliver":
      return "Deliver";
  }
}

export function arrangedPatternData(project: ProjectState): PatternData[] {
  const slots = new Set(project.arrangement.map((block) => block.pattern));
  const arrangedSlots = slots.size > 0 ? [...slots] : [project.selectedPattern];
  return arrangedSlots.map((slot) => project.patterns[slot]);
}

export function drumHitCount(pattern: PatternData): number {
  const baseHits = Object.values(pattern.drumPattern).reduce(
    (total, laneSteps) => total + laneSteps.filter(Boolean).length,
    0
  );
  const repeatedHats = pattern.drumPattern.hat.reduce(
    (total, enabled, step) => total + (enabled ? hatRepeatCount(pattern, step) - 1 : 0),
    0
  );
  return baseHits + repeatedHats;
}

export function drumReadinessCheck(drumHits: number, hasKick: boolean, hasClap: boolean): BeatReadinessCheck {
  if (drumHits <= 0) {
    return {
      id: "drums",
      label: "Drums",
      status: "Empty",
      detail: "No arranged drum hits detected.",
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: "danger"
    };
  }
  if (!hasKick || !hasClap || drumHits < 8) {
    return {
      id: "drums",
      label: "Drums",
      status: "Sparse",
      detail: `${drumHits} arranged hits across the used patterns.`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: "warn"
    };
  }
  return {
    id: "drums",
    label: "Drums",
    status: "Set",
    detail: `${drumHits} arranged hits with kick and clap anchors.`,
    focusTarget: "compose",
    focusLabel: "Compose",
    tone: "good"
  };
}

export function bassReadinessCheck(bassCount: number): BeatReadinessCheck {
  if (bassCount <= 0) {
    return {
      id: "bass",
      label: "808",
      status: "Missing",
      detail: "No arranged 808 or bass notes detected.",
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: "danger"
    };
  }
  if (bassCount < 3) {
    return {
      id: "bass",
      label: "808",
      status: "Light",
      detail: `${bassCount} arranged bass note${bassCount === 1 ? "" : "s"} detected.`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: "warn"
    };
  }
  return {
    id: "bass",
    label: "808",
    status: "Set",
    detail: `${bassCount} arranged bass notes detected.`,
    focusTarget: "compose",
    focusLabel: "Compose",
    tone: "good"
  };
}

export function harmonyReadinessCheck(melodyCount: number, chordCount: number): BeatReadinessCheck {
  if (melodyCount <= 0 && chordCount <= 0) {
    return {
      id: "harmony",
      label: "Melody/chords",
      status: "Missing",
      detail: "No arranged melody or chord events detected.",
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: "danger"
    };
  }
  if (melodyCount < 3 && chordCount < 2) {
    return {
      id: "harmony",
      label: "Melody/chords",
      status: "Sketch",
      detail: `${melodyCount} melody events and ${chordCount} chord events detected.`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: "warn"
    };
  }
  return {
    id: "harmony",
    label: "Melody/chords",
    status: "Set",
    detail: `${melodyCount} melody events and ${chordCount} chord events detected.`,
    focusTarget: "compose",
    focusLabel: "Compose",
    tone: "good"
  };
}

export function arrangementReadinessCheck(blockCount: number, bars: number): BeatReadinessCheck {
  if (bars < 8) {
    return {
      id: "arrangement",
      label: "Arrangement",
      status: "Short",
      detail: `${barCountLabel(bars)} across ${blockCount} block${blockCount === 1 ? "" : "s"}.`,
      focusTarget: "arrange",
      focusLabel: "Arrange",
      tone: "warn"
    };
  }
  if (blockCount < 2) {
    return {
      id: "arrangement",
      label: "Arrangement",
      status: "Loop ready",
      detail: `${barCountLabel(bars)} in one arrangement block.`,
      focusTarget: "arrange",
      focusLabel: "Arrange",
      tone: "good"
    };
  }
  return {
    id: "arrangement",
    label: "Arrangement",
    status: "Structured",
    detail: `${barCountLabel(bars)} across ${blockCount} blocks.`,
    focusTarget: "arrange",
    focusLabel: "Arrange",
    tone: "good"
  };
}

export function exportReadinessCheck(analysis: ExportAnalysis): BeatReadinessCheck {
  if (analysis.status === "Silent") {
    return {
      id: "export",
      label: "Export",
      status: "Silent",
      detail: "Rendered arrangement output has no signal.",
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: "danger"
    };
  }
  if (analysis.status === "Limiter active") {
    return {
      id: "export",
      label: "Export",
      status: "Limited",
      detail: `${formatPercent(analysis.limitedPercent)} limiter activity at export.`,
      focusTarget: "master",
      focusLabel: "Master",
      tone: "warn"
    };
  }
  if (analysis.headroomDb < 0.5) {
    return {
      id: "export",
      label: "Export",
      status: "Hot",
      detail: `${formatDb(analysis.headroomDb)} headroom before the ceiling.`,
      focusTarget: "master",
      focusLabel: "Master",
      tone: "warn"
    };
  }
  return {
    id: "export",
    label: "Export",
    status: "Ready",
    detail: `${formatDb(analysis.headroomDb)} headroom before the ceiling.`,
    focusTarget: "deliver",
    focusLabel: "Deliver",
    tone: "good"
  };
}

export function createMixSnapshot(
  slot: MixSnapshotSlotId,
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): MixSnapshot {
  const balanceSpreadDb = stemSpreadDb(stemAnalyses);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const mixTone = weakestTone(createMixCoachChecks(analysis, stemAnalyses).map((check) => check.tone));
  const limitedLabel = analysis.limitedSamples > 0 ? ` / L ${formatPercent(analysis.limitedPercent)}` : "";
  const balanceLabel =
    balanceSpreadDb === null ? "Balance needs 2 stems" : `${balanceSpreadDb.toFixed(1)} dB stem spread`;
  const stemNames = audibleStems.length > 0 ? audibleStems.map(stemTrackLabel).join("/") : "silent";

  return {
    slot,
    capturedAtLabel: mixSnapshotCapturedAtLabel(),
    projectTitle: project.title,
    statusLabel: mixSnapshotStatusLabel(mixTone),
    exportLabel: `${analysis.status} / H ${formatDb(analysis.headroomDb)}${limitedLabel}`,
    headroomDb: analysis.headroomDb,
    limitedPercent: analysis.limitedPercent,
    peakDb: analysis.peakDb,
    rmsDb: analysis.rmsDb,
    balanceSpreadDb,
    balanceLabel,
    masterLabel: `${project.masterPreset} / C ${formatDb(project.masterCeilingDb)} / O ${formatDb(masterChannelVolumeDb(project.mixer))}`,
    stemLabel: `${audibleStems.length}/${stemTrackIds.length} stems / ${stemNames}`,
    audibleStemCount: audibleStems.length,
    score: mixSnapshotScore(analysis, balanceSpreadDb, audibleStems.length, mixTone),
    mixer: cloneMixerChannels(project.mixer),
    masterPreset: project.masterPreset,
    masterCeilingDb: project.masterCeilingDb,
    tone: mixTone
  };
}

export function mixSnapshotStatusLabel(tone: MixCoachTone): string {
  switch (tone) {
    case "good":
      return "Ready pass";
    case "warn":
      return "Review pass";
    case "danger":
      return "Risk pass";
  }
}

export function mixSnapshotScore(
  analysis: ExportAnalysis,
  balanceSpreadDb: number | null,
  audibleStemCount: number,
  tone: MixCoachTone
): number {
  const statusScore =
    analysis.status === "Ready" ? 42 : analysis.status === "Hot" || analysis.status === "Limiter active" ? 20 : 0;
  const headroomScore = Math.max(0, 18 - Math.abs(analysis.headroomDb - 3.5) * 3);
  const balanceScore = balanceSpreadDb === null ? 0 : Math.max(0, 20 - Math.max(0, balanceSpreadDb - 8) * 2);
  const stemScore = audibleStemCount * 4;
  const limiterPenalty = Math.min(22, analysis.limitedPercent * 2);
  const tonePenalty = tone === "danger" ? 24 : tone === "warn" ? 9 : 0;
  return Math.round(statusScore + headroomScore + balanceScore + stemScore - limiterPenalty - tonePenalty);
}

export function mixSnapshotCapturedAtLabel(): string {
  return new Date().toTimeString().slice(0, 8);
}

export function createMixFixActions(analysis: ExportAnalysis, stemAnalyses: StemExportAnalyses): MixFixAction[] {
  const lowEndDelta = lowEndDeltaDb(stemAnalyses);
  const headroomTone: MixCoachTone = analysis.headroomDb < 0.5 || analysis.limitedSamples > 0 ? "warn" : "good";
  const lowEndTone: MixCoachTone =
    lowEndDelta === null ? "danger" : lowEndDelta > 6 || lowEndDelta < -12 ? "warn" : "good";
  const spread = stemSpreadDb(stemAnalyses);
  const balanceTone: MixCoachTone = spread === null ? "danger" : spread > 18 ? "warn" : "good";

  return [
    {
      preset: "headroom",
      label: "Headroom",
      detail: `Set vocal-safe ceiling and master gain from ${formatDb(analysis.headroomDb)} headroom.`,
      tone: headroomTone
    },
    {
      preset: "stem_balance",
      label: "Stem Balance",
      detail: spread === null ? "Nudge core stem levels after at least two stems have signal." : `Nudge ${spread.toFixed(1)} dB stem spread toward a rough balance.`,
      tone: balanceTone
    },
    {
      preset: "low_end",
      label: "Low End",
      detail:
        lowEndDelta === null
          ? "Set drum and 808 mixer values for comparison."
          : `Tighten 808/drum relation at ${lowEndDelta.toFixed(1)} dB RMS delta.`,
      tone: lowEndTone
    }
  ];
}

export function createMixFixPreviewSummary(
  project: ProjectState,
  fixes: MixFixAction[],
  stemAnalyses: StemExportAnalyses
): MixFixPreviewSummary {
  const suggestedFix = fixes.find((fix) => fix.tone !== "good") ?? null;

  if (!suggestedFix) {
    return {
      fixId: "none",
      statusLabel: "Mix fixes clear",
      fixLabel: "No suggested fix",
      scopeLabel: "Manual fixes available",
      detailLabel: "Headroom, stem balance, and low end are not asking for a fix.",
      changeLabel: "0 suggested moves",
      detailTitle: "Mix Fix Preview: no suggested fix; manual fixes remain available.",
      tone: "good"
    };
  }

  const nextProject = applyMixFixToProject(project, suggestedFix.preset, stemAnalyses);
  const changeCount = mixFixChangedCount(project, nextProject);
  const statusLabel = suggestedFix.tone === "danger" ? "Fix blocker" : "Suggested fix";
  const changeLabel = `${changeCount} mix move${changeCount === 1 ? "" : "s"}`;
  const scopeLabel = mixFixScopeLabel(suggestedFix.preset);
  const detailTitle = `${statusLabel}: ${suggestedFix.label}; ${scopeLabel}; ${suggestedFix.detail}; ${changeLabel}`;

  return {
    fixId: suggestedFix.preset,
    statusLabel,
    fixLabel: suggestedFix.label,
    scopeLabel,
    detailLabel: suggestedFix.detail,
    changeLabel,
    detailTitle,
    tone: suggestedFix.tone
  };
}

export function createMixFixResult(
  preset: MixFixPreset,
  beforeProject: ProjectState,
  afterProject: ProjectState,
  beforeAnalysis: ExportAnalysis,
  afterAnalysis: ExportAnalysis,
  beforeStemAnalyses: StemExportAnalyses,
  afterStemAnalyses: StemExportAnalyses
): MixFixResult {
  const action = createMixFixActions(beforeAnalysis, beforeStemAnalyses).find((fix) => fix.preset === preset);
  const changedMoves = mixFixChangedCount(beforeProject, afterProject);
  const changedControls = mixBalanceChangedControlCount(beforeProject.mixer, afterProject.mixer);
  const metrics: MixFixResultMetric[] = [
    createMixFixResultMetric("export", "Export", mixFixExportPosture(beforeAnalysis), mixFixExportPosture(afterAnalysis)),
    createMixFixResultMetric(
      "headroom",
      "Headroom",
      mixFixHeadroomPosture(beforeAnalysis),
      mixFixHeadroomPosture(afterAnalysis)
    ),
    createMixFixResultMetric("stems", "Stems", mixFixStemPosture(beforeStemAnalyses), mixFixStemPosture(afterStemAnalyses)),
    createMixFixResultMetric("lowEnd", "Low end", mixFixLowEndPosture(beforeStemAnalyses), mixFixLowEndPosture(afterStemAnalyses)),
    createMixFixResultMetric("controls", "Controls", mixFixControlPosture(beforeProject), mixFixControlPosture(afterProject))
  ];

  return {
    fixId: preset,
    title: `${mixFixPresetLabel(preset)} Mix Fix applied`,
    status: "Applied",
    detail: action?.detail ?? "Editable mixer/master fix applied.",
    scope: mixFixScopeLabel(preset),
    impact: `${changedMoves} mix move${changedMoves === 1 ? "" : "s"} / ${changedControls} controls`,
    metrics,
    auditionCue: mixFixAuditionCue(preset),
    nextCheck: mixFixNextCheck(preset),
    tone: changedMoves > 0 ? "good" : "warn"
  };
}

export function createMixFixResultMetric(
  id: MixFixResultMetric["id"],
  label: string,
  before: string,
  after: string
): MixFixResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: before === after ? "warn" : "good"
  };
}

export function mixFixExportPosture(analysis: ExportAnalysis): string {
  return `${analysis.status} / ${formatDb(analysis.peakDb)} peak`;
}

export function mixFixHeadroomPosture(analysis: ExportAnalysis): string {
  return `${formatDb(analysis.headroomDb)} / L ${formatPercent(analysis.limitedPercent)}`;
}

export function mixFixStemPosture(stemAnalyses: StemExportAnalyses): string {
  const spread = stemSpreadDb(stemAnalyses);
  return spread === null ? "needs 2 stems" : `${spread.toFixed(1)} dB spread`;
}

export function mixFixLowEndPosture(stemAnalyses: StemExportAnalyses): string {
  const lowEndDelta = lowEndDeltaDb(stemAnalyses);
  if (lowEndDelta === null) {
    return "needs drums + 808";
  }
  return lowEndDelta >= 0 ? `808 +${lowEndDelta.toFixed(1)} dB` : `808 ${lowEndDelta.toFixed(1)} dB`;
}

export function mixFixControlPosture(project: ProjectState): string {
  return `M ${formatDb(masterChannelVolumeDb(project.mixer))} / D ${mixerTrackVolumeDb(project.mixer, "drum_rack")} / 8 ${mixerTrackVolumeDb(project.mixer, "bass_808")}`;
}

export function mixerTrackVolumeDb(mixer: MixerChannel[], trackId: MixerChannel["id"]): string {
  const channel = mixer.find((candidate) => candidate.id === trackId);
  return channel ? formatDb(channel.volumeDb) : "missing";
}

export function mixFixAuditionCue(preset: MixFixPreset): string {
  switch (preset) {
    case "headroom":
      return "Play Full Mix; watch Export meter headroom and limiter activity.";
    case "stem_balance":
      return "Play Full Mix, then audition Drums, 808, Synth, and Chords stems.";
    case "low_end":
      return "Audition Drums and 808 together, then compare Full Mix punch.";
  }
}

export function mixFixNextCheck(preset: MixFixPreset): string {
  switch (preset) {
    case "headroom":
      return "Use Ceiling and master output controls if peaks still feel tight.";
    case "stem_balance":
      return "Trim the loudest or quietest stem with Mixer controls after listening.";
    case "low_end":
      return "Use 808 and drum volume, low-cut, Drive, and Glue for manual fine trim.";
  }
}

export function mixFixScopeLabel(preset: MixFixPreset): string {
  switch (preset) {
    case "headroom":
      return "Master + channel dynamics";
    case "stem_balance":
      return "Core stem volumes";
    case "low_end":
      return "Drums + 808 relation";
  }
}

export function mixFixChangedCount(current: ProjectState, nextProject: ProjectState): number {
  const mixerChanges = nextProject.mixer.filter(
    (channel, index) => !sameMixerChannel(channel, current.mixer[index])
  ).length;
  return [
    current.masterPreset !== nextProject.masterPreset,
    current.masterCeilingDb !== nextProject.masterCeilingDb
  ].filter(Boolean).length + mixerChanges;
}

export function createMixCoachChecks(analysis: ExportAnalysis, stemAnalyses: StemExportAnalyses): MixCoachCheck[] {
  const audibleStems = stemTrackIds
    .map((track) => ({ track, analysis: stemAnalyses[track] }))
    .filter((entry) => Number.isFinite(entry.analysis.rmsDb));
  const loudestStem = audibleStems.reduce<(typeof audibleStems)[number] | undefined>(
    (loudest, entry) => (!loudest || entry.analysis.rmsDb > loudest.analysis.rmsDb ? entry : loudest),
    undefined
  );
  const quietestStem = audibleStems.reduce<(typeof audibleStems)[number] | undefined>(
    (quietest, entry) => (!quietest || entry.analysis.rmsDb < quietest.analysis.rmsDb ? entry : quietest),
    undefined
  );
  const stemSpread =
    loudestStem && quietestStem ? Math.max(0, loudestStem.analysis.rmsDb - quietestStem.analysis.rmsDb) : 0;
  const drums = stemAnalyses.drum_rack;
  const bass = stemAnalyses.bass_808;
  const lowEndDelta =
    Number.isFinite(drums.rmsDb) && Number.isFinite(bass.rmsDb) ? bass.rmsDb - drums.rmsDb : null;

  return [
    masterHeadroomCheck(analysis),
    limiterCheck(analysis),
    exportDynamicsCheck(analysis),
    stemBalanceCheck(loudestStem, quietestStem, stemSpread),
    lowEndBlendCheck(lowEndDelta)
  ];
}

export function mixCoachFocusCheck(checks: MixCoachCheck[]): MixCoachCheck | null {
  return checks.find((check) => check.tone !== "good") ?? checks[0] ?? null;
}

export function createMixCoachFocusSummary(checks: MixCoachCheck[], focusedCheckId: string | null): MixCoachFocusSummary {
  const focusedCheck = focusedCheckId ? checks.find((check) => check.id === focusedCheckId) ?? null : null;
  const check = focusedCheck ?? mixCoachFocusCheck(checks);

  if (!check) {
    return {
      checkId: null,
      roleLabel: "No checks",
      statusLabel: "Mix Coach clear",
      detailLabel: "No mix checks available",
      detailTitle: "Mix Coach has no checks to focus.",
      tone: "good"
    };
  }

  const statusLabel = focusedCheck ? "Focused Mix Check" : check.tone === "good" ? "Mix Coach clear" : "Top Mix Check";

  return {
    checkId: check.id,
    roleLabel: `${check.label}: ${check.status}`,
    statusLabel,
    detailLabel: check.detail,
    detailTitle: `${statusLabel} / ${check.label}: ${check.status} / ${check.detail}`,
    tone: check.tone
  };
}

export function createMixCoachFocusResult(check: MixCoachCheck, checks: MixCoachCheck[]): MixCoachFocusResult {
  return {
    checkId: check.id,
    status: "Focused",
    title: `${check.label} mix check focused`,
    detail: `${check.status}: ${check.detail}`,
    destination: "Master / Mix Coach",
    metricLabel: "Mix",
    metricValue: mixCoachFocusResultMetric(check, checks),
    auditionCue: mixCoachFocusResultAudition(check),
    nextCheck: mixCoachFocusResultNextCheck(check),
    tone: check.tone
  };
}

export function mixCoachFocusResultMetric(check: MixCoachCheck, checks: MixCoachCheck[]): string {
  const reviewCount = checks.filter((candidate) => candidate.tone !== "good").length;
  return `${check.label}: ${check.status} / ${reviewCount}/${checks.length} to review`;
}

export function mixCoachFocusResultAudition(check: MixCoachCheck): string {
  switch (check.id) {
    case "headroom":
      return "Play Full Mix and watch peak/headroom before applying Headroom Mix Fix or trimming master output.";
    case "limiter":
      return "Play the loudest section and compare limiter activity before pushing Master Finish.";
    case "dynamics":
      return "Play hook and drop sections; listen for punch before changing compression-style controls.";
    case "stem-balance":
      return "Use Full Mix and Stem Audition to hear whether one core layer dominates.";
    case "low-end":
      return "A/B Drums and 808 stems before changing low-end balance.";
    default:
      return "Play Full Mix, then compare the focused Mix Coach check before choosing a mix move.";
  }
}

export function mixCoachFocusResultNextCheck(check: MixCoachCheck): string {
  switch (check.id) {
    case "headroom":
      return "Use Headroom Mix Fix or manual master trim only if headroom stays tight.";
    case "limiter":
      return "If limiter activity still catches peaks, lower loud channels or choose a gentler master finish.";
    case "dynamics":
      return "Use Mix Snapshot A/B after any change so punch and body stay intentional.";
    case "stem-balance":
      return "Use Mix Balance or Stem Audition only after deciding which layer should lead.";
    case "low-end":
      return "Use Low End Mix Fix only after drums and 808 are both audible and intentionally balanced.";
    default:
      return "Return to Mix Coach after the next explicit mix or master move.";
  }
}

export function createMixBalancePadOptions(mixer: MixerChannel[]): MixBalancePadOption[] {
  return mixBalancePadDefinitions.map((pad) => {
    const transformed = applyMixBalancePadToMixer(mixer, pad);
    return {
      ...pad,
      preview: mixBalancePreview(pad),
      changedCount: transformed.filter((channel, index) => !sameMixerChannel(channel, mixer[index])).length
    };
  });
}

export function createMixBalancePreviewSummary(mixer: MixerChannel[], pads: MixBalancePadOption[]): MixBalancePreviewSummary {
  const pad = pads.find((option) => option.changedCount > 0) ?? pads[0];
  if (!pad) {
    return {
      padId: "clean",
      changedChannels: 0,
      changedControls: 0,
      statusLabel: "Balance aligned",
      padLabel: "No balance target",
      channelLabel: "No channel target",
      auditionLabel: "No audition target",
      moveLabel: "0 mix moves",
      detailTitle: "No Mix Balance pads are available.",
      tone: "good"
    };
  }

  const transformed = applyMixBalancePadToMixer(mixer, pad);
  const changedControls = mixBalanceChangedControlCount(mixer, transformed);
  const tone: MixCoachTone = changedControls === 0 ? "good" : pad.changedCount <= 2 ? "warn" : "danger";
  const channelLabel = mixBalancePreviewChannelLabel(pad);
  const auditionLabel = createStemAuditionReadoutSummary(transformed).roleLabel;
  const moveLabel = `${pad.changedCount} channels / ${changedControls} controls`;

  return {
    padId: pad.id,
    changedChannels: pad.changedCount,
    changedControls,
    statusLabel: changedControls === 0 ? "Balance aligned" : "Suggested balance",
    padLabel: `${pad.label} balance`,
    channelLabel,
    auditionLabel,
    moveLabel,
    detailTitle:
      changedControls === 0
        ? `${pad.label} already matches the current mixer posture.`
        : `${pad.label} targets ${channelLabel}; ${auditionLabel}; ${moveLabel}.`,
    tone
  };
}

export function mixBalancePreviewChannelLabel(pad: MixBalancePadOption): string {
  const channelTargets: Array<[string, StemTrackId]> = [
    ["D", "drum_rack"],
    ["8", "bass_808"],
    ["Sy", "synth"],
    ["Ch", "chord"]
  ];
  return channelTargets
    .map(([label, trackId]) => `${label} ${mixBalancePreviewPostureLabel(pad.channels[trackId])}`)
    .join(" / ");
}

export function mixBalancePreviewPostureLabel(update: MixBalanceChannelUpdate | undefined): string {
  if (!update) {
    return "keep";
  }
  const volumeLabel = update.volumeDb === undefined ? "keep" : compactMixDb(update.volumeDb);
  const panValue = update.pan === undefined ? null : Math.round(update.pan);
  const panLabel = panValue === null ? null : panValue === 0 ? "C" : panValue > 0 ? `R${panValue}` : `L${Math.abs(panValue)}`;
  const sendLabel = update.send === undefined ? null : `S${Math.round(update.send * 100)}`;
  return [volumeLabel, panLabel, sendLabel].filter(Boolean).join(" ");
}

export function createMixBalanceResult(
  pad: MixBalancePadDefinition,
  beforeMixer: MixerChannel[],
  afterMixer: MixerChannel[]
): MixBalanceResult {
  const changedChannels = afterMixer.filter((channel, index) => !sameMixerChannel(channel, beforeMixer[index])).length;
  const changedControls = mixBalanceChangedControlCount(beforeMixer, afterMixer);
  const metrics: MixBalanceResultMetric[] = [
    createMixBalanceResultMetric(
      "drums",
      "Drums",
      mixBalanceChannelPosture(beforeMixer, "drum_rack"),
      mixBalanceChannelPosture(afterMixer, "drum_rack")
    ),
    createMixBalanceResultMetric(
      "bass",
      "808",
      mixBalanceChannelPosture(beforeMixer, "bass_808"),
      mixBalanceChannelPosture(afterMixer, "bass_808")
    ),
    createMixBalanceResultMetric(
      "synth",
      "Synth",
      mixBalanceChannelPosture(beforeMixer, "synth"),
      mixBalanceChannelPosture(afterMixer, "synth")
    ),
    createMixBalanceResultMetric(
      "chords",
      "Chords",
      mixBalanceChannelPosture(beforeMixer, "chord"),
      mixBalanceChannelPosture(afterMixer, "chord")
    ),
    createMixBalanceResultMetric(
      "audition",
      "Audition",
      createStemAuditionReadoutSummary(beforeMixer).roleLabel,
      createStemAuditionReadoutSummary(afterMixer).roleLabel
    )
  ];

  return {
    padId: pad.id,
    title: `${pad.label} Mix Balance applied`,
    status: "Applied",
    detail: pad.detail,
    scope: "Editable mixer channels",
    impact: `${changedChannels} channels / ${changedControls} controls`,
    metrics,
    auditionCue: "Play Full Mix; compare Drums, 808, Synth, and Chords together.",
    nextCheck: "Use Mixer controls or Stem Audition Pads to trim any lane masking the hook.",
    tone: changedChannels > 0 ? "good" : "warn"
  };
}

export function createMixBalanceResultMetric(
  id: MixBalanceResultMetric["id"],
  label: string,
  before: string,
  after: string
): MixBalanceResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: before === after ? "warn" : "good"
  };
}

export function mixBalanceChannelPosture(mixer: MixerChannel[], trackId: StemTrackId): string {
  const channel = mixer.find((candidate) => candidate.id === trackId);
  if (!channel) {
    return "missing";
  }
  return `${formatDb(channel.volumeDb)} / ${panLabel(channel.pan)} / S ${percentLabel(channel.send)}`;
}

export function mixBalanceChangedControlCount(beforeMixer: MixerChannel[], afterMixer: MixerChannel[]): number {
  const controls: Array<keyof MixerChannel> = ["volumeDb", "pan", "lowCut", "air", "drive", "glue", "send", "muted", "solo"];
  return afterMixer.reduce((total, afterChannel, index) => {
    const beforeChannel = beforeMixer[index];
    if (!beforeChannel || beforeChannel.id !== afterChannel.id) {
      return total + controls.length;
    }
    return total + controls.filter((control) => beforeChannel[control] !== afterChannel[control]).length;
  }, 0);
}

export function createSpaceFxPadOptions(mixer: MixerChannel[]): SpaceFxPadOption[] {
  return spaceFxPadDefinitions.map((pad) => {
    const transformed = applySpaceFxPadToMixer(mixer, pad);
    return {
      ...pad,
      preview: spaceFxPreview(pad),
      changedCount: spaceFxChangedSendCount(mixer, transformed)
    };
  });
}

export function createSpaceFxPreviewSummary(mixer: MixerChannel[], pads: SpaceFxPadOption[]): SpaceFxPreviewSummary {
  const pad = pads.find((option) => option.changedCount > 0) ?? pads[0];
  if (!pad) {
    return {
      padId: "dry",
      changedSends: 0,
      statusLabel: "Space aligned",
      padLabel: "No space target",
      sendLabel: "No send target",
      focusLabel: "No FX focus",
      changeLabel: "0 sends",
      detailTitle: "No Space FX pads are available.",
      tone: "good"
    };
  }

  const transformed = applySpaceFxPadToMixer(mixer, pad);
  const changedSends = spaceFxChangedSendCount(mixer, transformed);
  const sendLabel = spaceFxPreview(pad);
  const focusLabel = `${pad.label} / ${pad.detail}`;
  const changeLabel = `${changedSends} send${changedSends === 1 ? "" : "s"} before Apply`;
  const statusLabel = changedSends === 0 ? "Space aligned" : "Suggested space";
  const tone: MixCoachTone = changedSends === 0 ? "good" : changedSends <= 2 ? "warn" : "danger";

  return {
    padId: pad.id,
    changedSends,
    statusLabel,
    padLabel: `${pad.label} space`,
    sendLabel,
    focusLabel,
    changeLabel,
    detailTitle: `${statusLabel}: ${pad.label} ${pad.detail}; ${sendLabel}; ${changeLabel}.`,
    tone
  };
}

export function createSpaceFxResult(
  pad: SpaceFxPadDefinition,
  beforeMixer: MixerChannel[],
  afterMixer: MixerChannel[]
): SpaceFxResult {
  const changedSends = spaceFxChangedSendCount(beforeMixer, afterMixer);
  const metrics: SpaceFxResultMetric[] = [
    createSpaceFxResultMetric(
      "drums",
      "Drums",
      spaceFxTrackPosture(beforeMixer, "drum_rack"),
      spaceFxTrackPosture(afterMixer, "drum_rack")
    ),
    createSpaceFxResultMetric(
      "bass",
      "808",
      spaceFxTrackPosture(beforeMixer, "bass_808"),
      spaceFxTrackPosture(afterMixer, "bass_808")
    ),
    createSpaceFxResultMetric(
      "synth",
      "Synth",
      spaceFxTrackPosture(beforeMixer, "synth"),
      spaceFxTrackPosture(afterMixer, "synth")
    ),
    createSpaceFxResultMetric(
      "chords",
      "Chords",
      spaceFxTrackPosture(beforeMixer, "chord"),
      spaceFxTrackPosture(afterMixer, "chord")
    )
  ];

  return {
    padId: pad.id,
    title: `${pad.label} Space FX applied`,
    status: "Applied",
    detail: pad.detail,
    scope: "Editable Space sends",
    impact: `${changedSends} send${changedSends === 1 ? "" : "s"} changed`,
    metrics,
    auditionCue: "Play Full Mix, then compare Synth and Chords against Drums/808.",
    nextCheck: "Use Space sliders for manual trim if the hook feels too dry or washed.",
    tone: changedSends > 0 ? "good" : "warn"
  };
}

export function createSpaceFxResultMetric(
  id: SpaceFxResultMetric["id"],
  label: string,
  before: string,
  after: string
): SpaceFxResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: before === after ? "warn" : "good"
  };
}

export function spaceFxPreview(pad: SpaceFxPadDefinition): string {
  const drums = percentLabel(pad.sends.drum_rack);
  const bass = percentLabel(pad.sends.bass_808);
  const synth = percentLabel(pad.sends.synth);
  const chords = percentLabel(pad.sends.chord);
  return `D ${drums} / 8 ${bass} / Sy ${synth} / Ch ${chords}`;
}

export function spaceFxTrackPosture(mixer: MixerChannel[], trackId: StemTrackId): string {
  const channel = mixer.find((candidate) => candidate.id === trackId);
  return channel ? percentLabel(channel.send) : "missing";
}

export function spaceFxChangedSendCount(beforeMixer: MixerChannel[], afterMixer: MixerChannel[]): number {
  return stemTrackIds.filter(
    (trackId) => spaceFxTrackPosture(beforeMixer, trackId) !== spaceFxTrackPosture(afterMixer, trackId)
  ).length;
}

export function createStemAuditionPadOptions(mixer: MixerChannel[]): StemAuditionPadOption[] {
  return stemAuditionPadDefinitions.map((pad) => {
    const transformed = applyStemAuditionPadToMixer(mixer, pad);
    return {
      ...pad,
      active: isStemAuditionPadActive(mixer, pad),
      preview: stemAuditionPreview(pad),
      changedCount: transformed.filter((channel, index) => !sameMixerChannel(channel, mixer[index])).length
    };
  });
}

export function stemAuditionPreview(pad: StemAuditionPadDefinition): string {
  return pad.trackId === null ? "All" : stemTrackLabel(pad.trackId);
}

export function createStemAuditionReadoutSummary(mixer: MixerChannel[]): StemAuditionReadoutSummary {
  const stemChannels = mixer.filter((channel): channel is MixerChannel & { id: StemTrackId } => isStemTrackId(channel.id));
  const soloActive = stemChannels.some((channel) => channel.solo);
  const audibleChannels = stemChannels.filter((channel) => !channel.muted && (!soloActive || channel.solo));
  const mutedCount = stemChannels.filter((channel) => channel.muted).length;
  const soloCount = stemChannels.filter((channel) => channel.solo).length;
  const audibleLabel =
    audibleChannels.length === stemChannels.length
      ? "Drums/808/Synth/Chords"
      : audibleChannels.length > 0
        ? audibleChannels.map((channel) => stemTrackLabel(channel.id)).join("/")
        : "No stems";

  if (audibleChannels.length === 0) {
    const detailLabel = `${mutedCount} muted / ${soloCount} solo`;
    return {
      roleLabel: "Silent audition",
      statusLabel: "No audible stems",
      detailLabel,
      detailTitle: `No stem channels are currently audible / ${detailLabel}`,
      tone: "danger"
    };
  }

  if (!soloActive && mutedCount === 0) {
    return {
      roleLabel: "Full mix audition",
      statusLabel: "Hearing Full Mix",
      detailLabel: `${audibleChannels.length} active stems`,
      detailTitle: `Hearing the full mix / ${audibleLabel} / no muted or soloed stems`,
      tone: "good"
    };
  }

  if (soloActive && audibleChannels.length === 1 && soloCount === 1 && mutedCount === 0) {
    const stemLabel = stemTrackLabel(audibleChannels[0].id);
    return {
      roleLabel: `${stemLabel} solo`,
      statusLabel: `Hearing ${stemLabel} Stem`,
      detailLabel: "1 active stem",
      detailTitle: `Hearing only the ${stemLabel} stem / mixer solo audition`,
      tone: "good"
    };
  }

  const detailLabel = `${audibleLabel} audible / ${mutedCount} muted / ${soloCount} solo`;
  return {
    roleLabel: "Manual mixer state",
    statusLabel: "Custom audition",
    detailLabel,
    detailTitle: `Custom mixer audition / ${detailLabel}`,
    tone: "warn"
  };
}

export function createStemAuditionDecisionSummary(
  pads: StemAuditionPadOption[],
  readout: StemAuditionReadoutSummary
): StemAuditionDecisionSummary {
  const activePad = pads.find((pad) => pad.active) ?? null;
  const fullPad = pads.find((pad) => pad.id === "full") ?? null;
  const drumsPad = pads.find((pad) => pad.id === "drum_rack") ?? pads.find((pad) => pad.trackId !== null) ?? null;
  const targetPad = activePad?.id === "full" ? drumsPad : fullPad;

  if (!targetPad) {
    return {
      targetId: null,
      statusLabel: "Audition unavailable",
      targetLabel: "No audition target",
      detailLabel: "No Stem Audition pads available",
      nextCheckLabel: "Next: return after audition pads are available.",
      detailTitle: "Stem Audition has no available decision target.",
      tone: "warn"
    };
  }

  if (readout.tone === "danger") {
    return stemAuditionDecisionFromPad({
      targetPad: fullPad ?? targetPad,
      statusLabel: "Restore audition",
      detailLabel: `${readout.detailLabel} / hear all stems before judging balance`,
      nextCheckLabel: "Next: play Full Mix before soloing individual stems.",
      tone: "danger"
    });
  }

  if (activePad?.id === "full") {
    return stemAuditionDecisionFromPad({
      targetPad,
      statusLabel: "Next compare",
      detailLabel: "Start from the rhythmic anchor against the Full Mix.",
      nextCheckLabel: "Next: solo Drums, then compare 808 low-end against the full mix.",
      tone: "good"
    });
  }

  if (activePad) {
    return stemAuditionDecisionFromPad({
      targetPad,
      statusLabel: "Compare back",
      detailLabel: `${readout.roleLabel} active / return to context before level moves`,
      nextCheckLabel: "Next: return to Full Mix, then trim only if the issue remains.",
      tone: readout.tone
    });
  }

  return stemAuditionDecisionFromPad({
    targetPad,
    statusLabel: "Reset context",
    detailLabel: `${readout.detailLabel} / restore a clean listening comparison`,
    nextCheckLabel: "Next: use Full Mix before choosing another stem or balance move.",
    tone: "warn"
  });
}

export function stemAuditionDecisionFromPad({
  targetPad,
  statusLabel,
  detailLabel,
  nextCheckLabel,
  tone
}: {
  targetPad: StemAuditionPadOption;
  statusLabel: string;
  detailLabel: string;
  nextCheckLabel: string;
  tone: MixCoachTone;
}): StemAuditionDecisionSummary {
  const targetLabel = targetPad.trackId === null ? "Audition Full Mix" : `Audition ${targetPad.label} Stem`;

  return {
    targetId: targetPad.id,
    statusLabel,
    targetLabel,
    detailLabel,
    nextCheckLabel,
    detailTitle: `${statusLabel}: ${targetLabel} / ${detailLabel} / ${nextCheckLabel}`,
    tone
  };
}

export function mixBalancePreview(pad: MixBalancePadDefinition): string {
  const drumVolume = pad.channels.drum_rack?.volumeDb ?? 0;
  const bassVolume = pad.channels.bass_808?.volumeDb ?? 0;
  return `D ${compactMixDb(drumVolume)} / 8 ${compactMixDb(bassVolume)}`;
}

export function compactMixDb(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export function createMasterFinishPadOptions(project: ProjectState): MasterFinishPadOption[] {
  return masterFinishPadDefinitions.map((pad) => {
    const nextProject = applyMasterFinishPadToProject(project, pad);
    return {
      ...pad,
      preview: masterFinishPreview(pad),
      changedCount: masterFinishChangedCount(project, nextProject)
    };
  });
}

export function createMasterFinishPreviewSummary(
  project: ProjectState,
  pads: MasterFinishPadOption[]
): MasterFinishPreviewSummary {
  const suggestedPadId = suggestedMasterFinishPad(project);
  const pad = pads.find((option) => option.id === suggestedPadId) ?? pads[0];
  const currentOutputDb = masterChannelVolumeDb(project.mixer);
  const presetAligned = project.masterPreset === pad.preset;
  const ceilingAligned = project.masterCeilingDb === pad.ceilingDb;
  const outputAligned = currentOutputDb === pad.masterVolumeDb;
  const statusLabel = pad.changedCount === 0 ? "Finish aligned" : "Suggested finish";
  const presetLabel = presetAligned ? `${pad.preset} ready` : `${project.masterPreset} -> ${pad.preset}`;
  const ceilingLabel = ceilingAligned
    ? `${formatDb(pad.ceilingDb)} ceiling ready`
    : `${formatDb(project.masterCeilingDb)} -> ${formatDb(pad.ceilingDb)} ceiling`;
  const outputLabel = outputAligned
    ? `${formatDb(pad.masterVolumeDb)} output ready`
    : `${formatDb(currentOutputDb)} -> ${formatDb(pad.masterVolumeDb)} output`;
  const changeLabel = `${pad.changedCount} finish move${pad.changedCount === 1 ? "" : "s"}`;
  const tone: MixCoachTone = pad.changedCount === 0 ? "good" : pad.changedCount === 1 ? "warn" : "danger";
  const padLabel = `${pad.label} / ${pad.detail}`;
  const detailTitle = `${statusLabel}: ${padLabel}; ${presetLabel}; ${ceilingLabel}; ${outputLabel}; ${changeLabel}`;

  return {
    padId: pad.id,
    changedMoves: pad.changedCount,
    statusLabel,
    padLabel,
    presetLabel,
    ceilingLabel,
    outputLabel,
    changeLabel,
    detailTitle,
    tone
  };
}

export function createMasterFinishResult(
  pad: MasterFinishPadDefinition,
  beforeProject: ProjectState,
  afterProject: ProjectState
): MasterFinishResult {
  const changedCount = masterFinishChangedCount(beforeProject, afterProject);
  const metrics: MasterFinishResultMetric[] = [
    createMasterFinishResultMetric("preset", "Preset", beforeProject.masterPreset, afterProject.masterPreset),
    createMasterFinishResultMetric(
      "ceiling",
      "Ceiling",
      formatDb(beforeProject.masterCeilingDb),
      formatDb(afterProject.masterCeilingDb)
    ),
    createMasterFinishResultMetric(
      "output",
      "Output",
      formatDb(masterChannelVolumeDb(beforeProject.mixer)),
      formatDb(masterChannelVolumeDb(afterProject.mixer))
    )
  ];

  return {
    padId: pad.id,
    title: `${pad.label} Master Finish applied`,
    status: "Applied",
    detail: pad.detail,
    scope: "Editable master output",
    impact: `${changedCount} finish move${changedCount === 1 ? "" : "s"}`,
    metrics,
    auditionCue: "Play Full Mix; watch Export meter headroom and limiter.",
    nextCheck: "Use Ceiling and master output controls for manual trim before WAV/stem export.",
    tone: changedCount > 0 ? "good" : "warn"
  };
}

export function createMasterFinishResultMetric(
  id: MasterFinishResultMetric["id"],
  label: string,
  before: string,
  after: string
): MasterFinishResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: before === after ? "warn" : "good"
  };
}

export function masterFinishPreview(pad: MasterFinishPadDefinition): string {
  return `C ${compactMixDb(pad.ceilingDb)} / O ${compactMixDb(pad.masterVolumeDb)}`;
}

export function masterFinishChangedCount(current: ProjectState, nextProject: ProjectState): number {
  return [
    current.masterPreset !== nextProject.masterPreset,
    current.masterCeilingDb !== nextProject.masterCeilingDb,
    masterChannelVolumeDb(current.mixer) !== masterChannelVolumeDb(nextProject.mixer)
  ].filter(Boolean).length;
}

export function applyMasterFinishPadToProject(project: ProjectState, pad: MasterFinishPadDefinition): ProjectState {
  const masterVolumeDb = clampMixFixVolume(pad.masterVolumeDb);
  const masterCeilingDb = clampMasterCeilingDb(pad.ceilingDb);
  const mixer = project.mixer.map((channel) =>
    channel.id === "master" ? { ...channel, volumeDb: masterVolumeDb } : channel
  );
  const nextProject = {
    ...project,
    masterPreset: pad.preset,
    masterCeilingDb,
    mixer
  };
  return masterFinishChangedCount(project, nextProject) === 0 ? project : nextProject;
}

export function createMasterAutomationPadOptions(project: ProjectState): MasterAutomationPadOption[] {
  const activePreset = masterAutomationPresetForProject(project);
  return masterAutomationPadDefinitions.map((pad) => {
    const nextProject = applyMasterAutomationPreset(project, pad.id);
    return {
      ...pad,
      preview: masterAutomationPreview(pad, project),
      changedCount: masterAutomationChangedCount(project, nextProject),
      active: activePreset === pad.id
    };
  });
}

export function suggestedMasterAutomationPad(): MasterAutomationPadId {
  return "intro_outro";
}

export function createMasterAutomationPreviewSummary(
  project: ProjectState,
  pads: MasterAutomationPadOption[]
): MasterAutomationPreviewSummary {
  const suggestedPadId = suggestedMasterAutomationPad();
  const pad = pads.find((option) => option.id === suggestedPadId) ?? pads[0];
  if (!pad) {
    return {
      padId: "none",
      changedEvents: 0,
      statusLabel: "Automation aligned",
      padLabel: "No automation target",
      currentLabel: "No fade target",
      eventLabel: "0 events",
      rangeLabel: masterAutomationRangeLabel(project),
      changeLabel: "0 automation events",
      detailTitle: "No Master Automation pads are available.",
      tone: "good"
    };
  }

  const nextProject = applyMasterAutomationPreset(project, pad.id);
  const changedEvents = masterAutomationChangedCount(project, nextProject);
  const currentPreset = masterAutomationPresetForProject(project);
  const currentLabel =
    currentPreset === pad.id
      ? `${pad.label} active`
      : `${masterAutomationPresetLabel(currentPreset)} -> ${pad.label}`;
  const eventLabel = `${masterAutomationEventCountLabel(nextProject)} / ${pad.preview}`;
  const rangeLabel = masterAutomationRangeLabel(project);
  const changeLabel = `${changedEvents} automation event${changedEvents === 1 ? "" : "s"} before Apply`;
  const statusLabel = changedEvents === 0 ? "Automation aligned" : "Suggested fade";
  const tone: MixCoachTone = changedEvents === 0 ? "good" : changedEvents <= 2 ? "warn" : "danger";

  return {
    padId: pad.id,
    changedEvents,
    statusLabel,
    padLabel: `${pad.label} automation`,
    currentLabel,
    eventLabel,
    rangeLabel,
    changeLabel,
    detailTitle: `${statusLabel}: ${currentLabel}; ${eventLabel}; ${rangeLabel}; ${changeLabel}.`,
    tone
  };
}

export function createMasterAutomationResult(
  pad: MasterAutomationPadDefinition,
  beforeProject: ProjectState,
  afterProject: ProjectState
): MasterAutomationResult {
  const changedCount = masterAutomationChangedCount(beforeProject, afterProject);
  const metrics: MasterAutomationResultMetric[] = [
    createMasterAutomationResultMetric(
      "preset",
      "Preset",
      masterAutomationPresetLabel(masterAutomationPresetForProject(beforeProject)),
      masterAutomationPresetLabel(masterAutomationPresetForProject(afterProject))
    ),
    createMasterAutomationResultMetric(
      "events",
      "Events",
      masterAutomationEventCountLabel(beforeProject),
      masterAutomationEventCountLabel(afterProject)
    ),
    createMasterAutomationResultMetric(
      "range",
      "Range",
      masterAutomationRangeLabel(beforeProject),
      masterAutomationRangeLabel(afterProject)
    )
  ];

  return {
    padId: pad.id,
    title: `${pad.label} Master Automation applied`,
    status: "Applied",
    detail: pad.description,
    scope: "Editable master volume automation",
    impact: `${changedCount} automation event${changedCount === 1 ? "" : "s"}`,
    metrics,
    auditionCue: masterAutomationAuditionCue(pad.id),
    nextCheck: "Play Song and export WAV/stems to confirm the same master fade is rendered.",
    tone: changedCount > 0 ? "good" : "warn"
  };
}

export function createMasterAutomationResultMetric(
  id: MasterAutomationResultMetric["id"],
  label: string,
  before: string,
  after: string
): MasterAutomationResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: before === after ? "warn" : "good"
  };
}

export function masterAutomationPreview(pad: MasterAutomationPadDefinition, project: ProjectState): string {
  switch (pad.id) {
    case "none":
      return "No fade";
    case "fade_in":
      return "Bar 1 in";
    case "fade_out":
      return `${barCountLabel(1)} out`;
    case "intro_outro":
      return `In + out / ${barCountLabel(arrangementTotalBars(project))}`;
  }
}

export function masterAutomationPresetLabel(preset: MasterAutomationPresetId | "custom"): string {
  if (preset === "custom") {
    return "Custom";
  }
  return masterAutomationPadDefinitions.find((definition) => definition.id === preset)?.label ?? preset;
}

export function masterAutomationEventCountLabel(project: ProjectState): string {
  return `${project.automation.length} event${project.automation.length === 1 ? "" : "s"}`;
}

export function masterAutomationRangeLabel(project: ProjectState): string {
  return `${barCountLabel(arrangementTotalBars(project))} / ${arrangementTotalSteps(project)} steps`;
}

export function masterAutomationAuditionCue(preset: MasterAutomationPresetId): string {
  switch (preset) {
    case "none":
      return "Play Song; confirm the master stays at the manual output level.";
    case "fade_in":
      return "Play Song from bar one; confirm the first bar rises cleanly.";
    case "fade_out":
      return "Play the final bar; confirm the ending fades without cutting the beat early.";
    case "intro_outro":
      return "Play Song from the top and final bar; confirm both fades feel intentional.";
  }
}

export function masterAutomationChangedCount(current: ProjectState, nextProject: ProjectState): number {
  const currentEvents = current.automation.map(masterAutomationEventSignature);
  const nextEvents = nextProject.automation.map(masterAutomationEventSignature);
  const maxLength = Math.max(currentEvents.length, nextEvents.length);
  const changedEvents = Array.from({ length: maxLength }, (_, index) => currentEvents[index] !== nextEvents[index]).filter(Boolean).length;
  return changedEvents;
}

export function masterAutomationEventSignature(event: AutomationEvent): string {
  return `${event.target}:${event.startStep}:${event.endStep}:${event.startValue}:${event.endValue}:${event.curve}`;
}

export function createMasterOutputRoleSummary(project: ProjectState, analysis: ExportAnalysis): MasterOutputRoleSummary {
  const outputDb = masterChannelVolumeDb(project.mixer);
  const limitedLabel = analysis.limitedSamples > 0 ? `limiter ${formatPercent(analysis.limitedPercent)}` : "limiter clear";

  return {
    roleLabel: masterOutputRoleLabel(project.masterPreset, analysis),
    statusLabel: `${project.masterPreset} / ${analysis.status}`,
    levelLabel: `${formatDb(project.masterCeilingDb)} ceiling / ${formatDb(outputDb)} output`,
    detailLabel: `${formatDb(analysis.headroomDb)} headroom / ${limitedLabel}`,
    detailTitle: `${project.masterPreset} / ${analysis.status} / ${formatDb(project.masterCeilingDb)} ceiling / ${formatDb(outputDb)} output / ${formatDb(analysis.headroomDb)} headroom / ${limitedLabel}`,
    isAtRisk: analysis.status !== "Ready" || analysis.headroomDb < 0.5 || analysis.limitedSamples > 0
  };
}

export function masterOutputRoleLabel(preset: MasterPreset, analysis: ExportAnalysis): string {
  if (analysis.status === "Silent") {
    return "No signal";
  }
  if (analysis.status === "Hot" || analysis.status === "Limiter active" || analysis.headroomDb < 0.5) {
    return "Headroom watch";
  }
  switch (preset) {
    case "Headroom for Vocal":
      return "Vocal handoff";
    case "Streaming Safe":
      return "Balanced store";
    case "Clean Demo":
      return "Demo output";
    default:
      return "Output guard";
  }
}

export function applyMixBalancePadToMixer(mixer: MixerChannel[], pad: MixBalancePadDefinition): MixerChannel[] {
  return mixer.map((channel) => {
    const update = pad.channels[channel.id];
    if (!update) {
      return { ...channel, muted: false, solo: false };
    }
    return {
      ...channel,
      volumeDb: update.volumeDb === undefined ? channel.volumeDb : clampMixFixVolume(update.volumeDb),
      pan: update.pan === undefined ? channel.pan : clampPan(update.pan),
      lowCut: update.lowCut === undefined ? channel.lowCut : normalizeMixerEq(update.lowCut),
      air: update.air === undefined ? channel.air : normalizeMixerEq(update.air),
      drive: update.drive === undefined ? channel.drive : normalizeMixerEq(update.drive),
      glue: update.glue === undefined ? channel.glue : normalizeMixerEq(update.glue),
      send: update.send === undefined ? channel.send : normalizeMixerEq(update.send),
      muted: false,
      solo: false
    };
  });
}

export function applySpaceFxPadToMixer(mixer: MixerChannel[], pad: SpaceFxPadDefinition): MixerChannel[] {
  return mixer.map((channel) => {
    if (!isStemTrackId(channel.id)) {
      return channel;
    }

    return {
      ...channel,
      send: normalizeMixerEq(pad.sends[channel.id])
    };
  });
}

export function applyStemAuditionPadToMixer(mixer: MixerChannel[], pad: StemAuditionPadDefinition): MixerChannel[] {
  return mixer.map((channel) => {
    if (channel.id === "master") {
      return channel;
    }
    if (pad.trackId === null) {
      return { ...channel, muted: false, solo: false };
    }
    return {
      ...channel,
      muted: false,
      solo: channel.id === pad.trackId
    };
  });
}

export function isStemAuditionPadActive(mixer: MixerChannel[], pad: StemAuditionPadDefinition): boolean {
  const coreChannels = mixer.filter((channel) => channel.id !== "master");
  if (pad.trackId === null) {
    return coreChannels.every((channel) => !channel.muted && !channel.solo);
  }
  return coreChannels.every((channel) => !channel.muted && channel.solo === (channel.id === pad.trackId));
}

export function cloneMixerChannels(mixer: MixerChannel[]): MixerChannel[] {
  return mixer.map((channel) => ({ ...channel }));
}

export function sameMixerChannels(first: MixerChannel[], second: MixerChannel[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((channel, index) => sameMixerChannel(channel, second[index]));
}

export function sameMixerChannel(first: MixerChannel | undefined, second: MixerChannel | undefined): boolean {
  return (
    first !== undefined &&
    second !== undefined &&
    first.id === second.id &&
    first.volumeDb === second.volumeDb &&
    first.pan === second.pan &&
    first.lowCut === second.lowCut &&
    first.air === second.air &&
    first.drive === second.drive &&
    first.glue === second.glue &&
    first.send === second.send &&
    first.muted === second.muted &&
    first.solo === second.solo
  );
}

export const soundFocusParameters: SoundFocusParameter[] = [
  "kickPunch",
  "snareSnap",
  "hatBrightness",
  "bassDrive",
  "bassDecay",
  "sidechainDuck",
  "synthBrightness",
  "synthRelease",
  "chordWarmth",
  "chordWidth"
];

export const drumKitSoundParameters: DrumKitSoundParameter[] = ["kickPunch", "snareSnap", "hatBrightness"];

export function createDrumKitPadOptions(project: ProjectState): DrumKitPadOption[] {
  return drumKitPadDefinitions.map((pad) => {
    const transformed = applyDrumKitPadToProject(project, pad);
    return {
      ...pad,
      preview: drumKitPadPreview(pad),
      changedCount: drumKitPadChangedCount(project, transformed)
    };
  });
}

export function drumKitPadPreview(pad: DrumKitPadDefinition): string {
  return `K ${compactUnitPercent(pad.sound.kickPunch)} / H ${compactUnitPercent(pad.sound.hatBrightness)}`;
}

export function createDrumKitPreviewSummary(pads: DrumKitPadOption[]): DrumKitPreviewSummary {
  const pad = pads.find((option) => option.changedCount > 0) ?? pads[0];
  if (!pad) {
    return {
      padId: "clean",
      changedMoves: 0,
      statusLabel: "Kit aligned",
      kitLabel: "No kit target",
      drumLabel: "No drum tone target",
      rackLabel: "No rack target",
      moveLabel: "0 kit moves",
      detailTitle: "No Drum Kit pads are available.",
      tone: "good"
    };
  }

  const tone: MixCoachTone = pad.changedCount === 0 ? "good" : pad.changedCount === 1 ? "warn" : "danger";
  const drumLabel = drumKitPreviewDrumLabel(pad);
  const rackLabel = drumKitPreviewRackLabel(pad);
  const moveLabel = `${pad.changedCount} kit move${pad.changedCount === 1 ? "" : "s"}`;

  return {
    padId: pad.id,
    changedMoves: pad.changedCount,
    statusLabel: pad.changedCount === 0 ? "Kit aligned" : "Suggested kit",
    kitLabel: `${pad.label} kit`,
    drumLabel,
    rackLabel,
    moveLabel,
    detailTitle:
      pad.changedCount === 0
        ? `${pad.label} already matches the current built-in drum tone and drum rack posture.`
        : `${pad.label} targets ${drumLabel}; ${rackLabel}; ${moveLabel}.`,
    tone
  };
}

export function drumKitPreviewDrumLabel(pad: DrumKitPadOption): string {
  return `K ${compactUnitPercent(pad.sound.kickPunch)} / C ${compactUnitPercent(pad.sound.snareSnap)} / H ${compactUnitPercent(pad.sound.hatBrightness)}`;
}

export function drumKitPreviewRackLabel(pad: DrumKitPadOption): string {
  const rackParts: string[] = [];
  if (pad.mixer.volumeDb !== undefined) {
    rackParts.push(`Vol ${formatDb(clampMixFixVolume(pad.mixer.volumeDb))}`);
  }
  if (pad.mixer.air !== undefined) {
    rackParts.push(`Air ${compactUnitPercent(normalizeMixerEq(pad.mixer.air))}`);
  }
  if (pad.mixer.drive !== undefined) {
    rackParts.push(`Drive ${compactUnitPercent(normalizeMixerEq(pad.mixer.drive))}`);
  }
  if (pad.mixer.glue !== undefined) {
    rackParts.push(`Glue ${compactUnitPercent(normalizeMixerEq(pad.mixer.glue))}`);
  }
  if (pad.mixer.send !== undefined) {
    rackParts.push(`Space ${compactUnitPercent(normalizeMixerEq(pad.mixer.send))}`);
  }
  return rackParts.length > 0 ? `Rack ${rackParts.join(" / ")}` : "Rack keep current mix";
}

export function applyDrumKitPadToProject(project: ProjectState, pad: DrumKitPadDefinition): ProjectState {
  const sound: SoundDesign = {
    ...project.sound,
    preset: "custom"
  };
  drumKitSoundParameters.forEach((parameter) => {
    sound[parameter] = clampUnit(pad.sound[parameter]);
  });

  const mixer = project.mixer.map((channel) => {
    if (channel.id !== "drum_rack") {
      return channel;
    }
    return {
      ...channel,
      volumeDb: pad.mixer.volumeDb === undefined ? channel.volumeDb : clampMixFixVolume(pad.mixer.volumeDb),
      pan: pad.mixer.pan === undefined ? channel.pan : clampPan(pad.mixer.pan),
      lowCut: pad.mixer.lowCut === undefined ? channel.lowCut : normalizeMixerEq(pad.mixer.lowCut),
      air: pad.mixer.air === undefined ? channel.air : normalizeMixerEq(pad.mixer.air),
      drive: pad.mixer.drive === undefined ? channel.drive : normalizeMixerEq(pad.mixer.drive),
      glue: pad.mixer.glue === undefined ? channel.glue : normalizeMixerEq(pad.mixer.glue),
      send: pad.mixer.send === undefined ? channel.send : normalizeMixerEq(pad.mixer.send)
    };
  });

  const nextProject = {
    ...project,
    sound,
    mixer
  };
  return drumKitPadChangedCount(project, nextProject) === 0 ? project : nextProject;
}

export function drumKitPadChangedCount(current: ProjectState, nextProject: ProjectState): number {
  const currentDrums = current.mixer.find((channel) => channel.id === "drum_rack");
  const nextDrums = nextProject.mixer.find((channel) => channel.id === "drum_rack");
  return [
    ...drumKitSoundParameters.map((parameter) => current.sound[parameter] !== nextProject.sound[parameter]),
    current.sound.preset !== nextProject.sound.preset,
    !sameMixerChannel(currentDrums, nextDrums)
  ].filter(Boolean).length;
}

export function createDrumKitResult(
  pad: DrumKitPadDefinition,
  beforeProject: ProjectState,
  afterProject: ProjectState
): DrumKitResult {
  const changedMoves = drumKitPadChangedCount(beforeProject, afterProject);
  const changedControls = drumKitMixerChangedControlCount(beforeProject.mixer, afterProject.mixer);
  const metrics: DrumKitResultMetric[] = [
    createDrumKitResultMetric(
      "kit",
      "Kit",
      soundPresetLabel(beforeProject.sound.preset),
      soundPresetLabel(afterProject.sound.preset)
    ),
    createDrumKitResultMetric(
      "kick",
      "Kick",
      drumKitKickLabel(beforeProject.sound),
      drumKitKickLabel(afterProject.sound)
    ),
    createDrumKitResultMetric(
      "clap",
      "Clap",
      drumKitClapLabel(beforeProject.sound),
      drumKitClapLabel(afterProject.sound)
    ),
    createDrumKitResultMetric(
      "hat",
      "Hat",
      drumKitHatLabel(beforeProject.sound),
      drumKitHatLabel(afterProject.sound)
    ),
    createDrumKitResultMetric(
      "rack",
      "Rack",
      drumKitRackLabel(beforeProject.mixer),
      drumKitRackLabel(afterProject.mixer)
    )
  ];

  return {
    padId: pad.id,
    title: `${pad.label} Drum Kit applied`,
    status: "Applied",
    detail: pad.detail,
    scope: "Kick, clap, hat, and drum rack",
    impact: `${changedMoves} kit move${changedMoves === 1 ? "" : "s"} / ${changedControls} rack controls`,
    metrics,
    auditionCue: "Loop Pattern A/B/C with drums and 808 active; listen for kick/clap/hat balance.",
    nextCheck: "Use Studio kick, snare, hat, and drum rack mixer controls for manual trim.",
    tone: changedMoves > 0 ? "good" : "warn"
  };
}

export function createDrumKitResultMetric(
  id: DrumKitResultMetric["id"],
  label: string,
  before: string,
  after: string
): DrumKitResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: before === after ? "warn" : "good"
  };
}

export function drumKitKickLabel(sound: SoundDesign): string {
  return `Punch ${compactUnitPercent(sound.kickPunch)}`;
}

export function drumKitClapLabel(sound: SoundDesign): string {
  return `Snap ${compactUnitPercent(sound.snareSnap)}`;
}

export function drumKitHatLabel(sound: SoundDesign): string {
  return `Bright ${compactUnitPercent(sound.hatBrightness)}`;
}

export function drumKitRackLabel(mixer: MixerChannel[]): string {
  const channel = mixer.find((candidate) => candidate.id === "drum_rack");
  if (!channel) {
    return "missing";
  }
  return `Vol ${formatDb(channel.volumeDb)} / Air ${compactUnitPercent(channel.air)} / Drive ${compactUnitPercent(channel.drive)} / Glue ${compactUnitPercent(channel.glue)}`;
}

export function drumKitMixerChangedControlCount(beforeMixer: MixerChannel[], afterMixer: MixerChannel[]): number {
  const beforeDrums = beforeMixer.find((channel) => channel.id === "drum_rack");
  const afterDrums = afterMixer.find((channel) => channel.id === "drum_rack");
  if (!beforeDrums || !afterDrums) {
    return beforeDrums === afterDrums ? 0 : 1;
  }
  const controls: Array<keyof MixerChannel> = ["volumeDb", "pan", "lowCut", "air", "drive", "glue", "send", "muted", "solo"];
  return controls.filter((control) => beforeDrums[control] !== afterDrums[control]).length;
}

export function defaultSoundPresetPreview(project: ProjectState): SoundPresetTarget {
  return project.sound.preset === "custom" ? styleSoundPreset(project.styleId) : project.sound.preset;
}

export function createSoundPresetPreviewSummary(sound: SoundDesign, presetId: SoundPresetTarget): SoundPresetPreviewSummary {
  const targetSound = soundPresetDesign(presetId);
  const changedMoves = soundPresetChangedMoveCount(sound, targetSound);
  const presetLabel = soundPresetLabel(presetId);
  const toneLabel = soundPresetToneLabel(targetSound);
  const currentLabel = soundPresetLabel(sound.preset);

  return {
    presetId,
    changedMoves,
    statusLabel: changedMoves === 0 ? "Preset aligned" : "Preview preset",
    presetLabel: `${presetLabel} target`,
    toneLabel,
    changeLabel:
      changedMoves === 0
        ? "Current sound already matches"
        : `${changedMoves} sound move${changedMoves === 1 ? "" : "s"} before Apply`,
    detailTitle:
      changedMoves === 0
        ? `${presetLabel} already matches the current editable SoundDesign state.`
        : `${currentLabel} -> ${presetLabel}; ${toneLabel}.`,
    tone: changedMoves === 0 ? "good" : "warn"
  };
}

export function createSoundPresetResult(
  presetId: SoundPresetTarget,
  beforeSound: SoundDesign,
  afterSound: SoundDesign
): SoundPresetResult {
  const presetMoves = beforeSound.preset === afterSound.preset ? 0 : 1;
  const drumMoves = soundFocusGroupMoveCount(beforeSound, afterSound, ["kickPunch", "snareSnap", "hatBrightness"]);
  const bassMoves = soundFocusGroupMoveCount(beforeSound, afterSound, ["bassDrive", "bassDecay"]);
  const duckMoves = soundFocusGroupMoveCount(beforeSound, afterSound, ["sidechainDuck"]);
  const synthMoves = soundFocusGroupMoveCount(beforeSound, afterSound, ["synthBrightness", "synthRelease"]);
  const chordMoves = soundFocusGroupMoveCount(beforeSound, afterSound, ["chordWarmth", "chordWidth"]);
  const metrics: SoundPresetResultMetric[] = [
    createSoundPresetResultMetric("preset", "Preset", soundPresetLabel(beforeSound.preset), soundPresetLabel(afterSound.preset), presetMoves),
    createSoundPresetResultMetric("drums", "Drums", soundFocusDrumLabel(beforeSound), soundFocusDrumLabel(afterSound), drumMoves),
    createSoundPresetResultMetric("bass", "808", soundFocusBassLabel(beforeSound), soundFocusBassLabel(afterSound), bassMoves),
    createSoundPresetResultMetric("duck", "Duck", soundFocusDuckLabel(beforeSound), soundFocusDuckLabel(afterSound), duckMoves),
    createSoundPresetResultMetric("synth", "Synth", soundFocusSynthLabel(beforeSound), soundFocusSynthLabel(afterSound), synthMoves),
    createSoundPresetResultMetric("chords", "Chords", soundFocusChordLabel(beforeSound), soundFocusChordLabel(afterSound), chordMoves)
  ];
  const changedGroups = [presetMoves, drumMoves, bassMoves, duckMoves, synthMoves, chordMoves].filter((count) => count > 0).length;
  const changedParameters = soundPresetChangedMoveCount(beforeSound, afterSound);

  return {
    presetId,
    title: `${soundPresetLabel(presetId)} Sound Preset applied`,
    status: "Applied",
    detail: soundPresetToneLabel(afterSound),
    scope: "Full built-in sound design preset",
    impact: `${changedParameters} sound move${changedParameters === 1 ? "" : "s"} / ${changedGroups} groups`,
    metrics,
    auditionCue: "Loop Pattern A/B/C with drums, 808, Synth, and Chords active before fine-tuning.",
    nextCheck: "Use Sound Focus Pads or Studio tone controls for manual trim after the preset.",
    tone: changedGroups > 0 ? "good" : "warn"
  };
}

export function createSoundPresetResultMetric(
  id: SoundPresetResultMetric["id"],
  label: string,
  before: string,
  after: string,
  changedEvents: number
): SoundPresetResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: changedEvents === 0 ? "warn" : "good"
  };
}

export function soundPresetChangedMoveCount(beforeSound: SoundDesign, afterSound: SoundDesign): number {
  return [
    beforeSound.preset !== afterSound.preset,
    ...soundFocusParameters.map((parameter) => beforeSound[parameter] !== afterSound[parameter])
  ].filter(Boolean).length;
}

export function soundPresetToneLabel(sound: SoundDesign): string {
  return `K ${compactUnitPercent(sound.kickPunch)} / 8 ${compactUnitPercent(sound.bassDrive)} / S ${compactUnitPercent(sound.synthBrightness)} / C ${compactUnitPercent(sound.chordWarmth)}`;
}

export function createSoundFocusPadOptions(sound: SoundDesign): SoundFocusPadOption[] {
  return soundFocusPadDefinitions.map((pad) => {
    const transformed = applySoundFocusPadToSound(sound, pad);
    return {
      ...pad,
      preview: soundFocusPreview(pad),
      changedCount: soundFocusParameters.filter((parameter) => transformed[parameter] !== sound[parameter]).length
    };
  });
}

export function createSoundFocusPreviewSummary(sound: SoundDesign, pads: SoundFocusPadOption[]): SoundFocusPreviewSummary {
  const pad = pads.find((option) => option.changedCount > 0) ?? pads[0];
  if (!pad) {
    return {
      padId: "punch",
      changedMoves: 0,
      statusLabel: "Sound aligned",
      padLabel: "Punch focus",
      focusLabel: "No focus target",
      parameterLabel: "No target values",
      changeLabel: "0 moves ready",
      detailTitle: "No Sound Focus pads are available.",
      tone: "good"
    };
  }

  const changedParameters = soundFocusChangedParameters(sound, pad);
  const parameterPreview = soundFocusPreviewParameterLabel(pad);
  const changedLabel = soundFocusChangedParameterLabel(changedParameters);
  const tone: MixCoachTone = pad.changedCount === 0 ? "good" : "warn";

  return {
    padId: pad.id,
    changedMoves: pad.changedCount,
    statusLabel: pad.changedCount === 0 ? "Sound aligned" : "Suggested focus",
    padLabel: `${pad.label} focus`,
    focusLabel: `${pad.detail} tone posture`,
    parameterLabel: parameterPreview,
    changeLabel: `${pad.changedCount} ${pad.changedCount === 1 ? "move" : "moves"} ready`,
    detailTitle:
      changedParameters.length === 0
        ? `${pad.label} focus already matches the editable SoundDesign state.`
        : `${pad.label} focus targets ${parameterPreview}; ${changedLabel}.`,
    tone
  };
}

export function createSoundFocusResult(pad: SoundFocusPadDefinition, beforeSound: SoundDesign, afterSound: SoundDesign): SoundFocusResult {
  const presetMoves = beforeSound.preset === afterSound.preset ? 0 : 1;
  const drumMoves = soundFocusGroupMoveCount(beforeSound, afterSound, ["kickPunch", "snareSnap", "hatBrightness"]);
  const bassMoves = soundFocusGroupMoveCount(beforeSound, afterSound, ["bassDrive", "bassDecay"]);
  const duckMoves = soundFocusGroupMoveCount(beforeSound, afterSound, ["sidechainDuck"]);
  const synthMoves = soundFocusGroupMoveCount(beforeSound, afterSound, ["synthBrightness", "synthRelease"]);
  const chordMoves = soundFocusGroupMoveCount(beforeSound, afterSound, ["chordWarmth", "chordWidth"]);
  const metrics: SoundFocusResultMetric[] = [
    createSoundFocusResultMetric("preset", "Preset", soundPresetLabel(beforeSound.preset), soundPresetLabel(afterSound.preset), presetMoves),
    createSoundFocusResultMetric("drums", "Drums", soundFocusDrumLabel(beforeSound), soundFocusDrumLabel(afterSound), drumMoves),
    createSoundFocusResultMetric("bass", "808", soundFocusBassLabel(beforeSound), soundFocusBassLabel(afterSound), bassMoves),
    createSoundFocusResultMetric("duck", "Duck", soundFocusDuckLabel(beforeSound), soundFocusDuckLabel(afterSound), duckMoves),
    createSoundFocusResultMetric("synth", "Synth", soundFocusSynthLabel(beforeSound), soundFocusSynthLabel(afterSound), synthMoves),
    createSoundFocusResultMetric("chords", "Chords", soundFocusChordLabel(beforeSound), soundFocusChordLabel(afterSound), chordMoves)
  ];
  const changedGroups = [presetMoves, drumMoves, bassMoves, duckMoves, synthMoves, chordMoves].filter((count) => count > 0).length;
  const changedParameters = soundFocusParameters.filter((parameter) => beforeSound[parameter] !== afterSound[parameter]).length;

  return {
    moveId: pad.id,
    title: `${pad.label} Sound Focus applied`,
    status: "Applied",
    detail: pad.detail,
    scope: "Built-in tone controls",
    impact: `${changedParameters} parameters / ${changedGroups} groups`,
    metrics,
    auditionCue: "Loop Pattern A/B/C with drums, 808, Synth, and Chords active.",
    nextCheck: "Use Studio tone controls for manual kick, 808, Synth, and Chord corrections.",
    tone: changedGroups > 0 ? "good" : "warn"
  };
}

export function createSoundFocusResultMetric(
  id: SoundFocusResultMetric["id"],
  label: string,
  before: string,
  after: string,
  changedEvents: number
): SoundFocusResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: changedEvents === 0 ? "warn" : "good"
  };
}

export type SoundTimbreScore = {
  id: SoundTimbreCheckSummary["metrics"][number]["id"];
  label: string;
  score: number;
  detail: string;
};

export function createSoundTimbreCheckSummary(sound: SoundDesign): SoundTimbreCheckSummary {
  const scores: SoundTimbreScore[] = [
    {
      id: "drums",
      label: "Drums",
      score: soundTimbreAverage([sound.kickPunch, sound.snareSnap, sound.hatBrightness]),
      detail: `K ${compactUnitPercent(sound.kickPunch)} / S ${compactUnitPercent(sound.snareSnap)} / H ${compactUnitPercent(sound.hatBrightness)}`
    },
    {
      id: "lowEnd",
      label: "808",
      score: soundTimbreAverage([sound.bassDrive, sound.bassDecay, sound.sidechainDuck]),
      detail: `Drive ${compactUnitPercent(sound.bassDrive)} / Decay ${compactUnitPercent(sound.bassDecay)} / Duck ${compactUnitPercent(sound.sidechainDuck)}`
    },
    {
      id: "brightness",
      label: "Air",
      score: soundTimbreAverage([sound.hatBrightness, sound.snareSnap, sound.synthBrightness]),
      detail: `Hat ${compactUnitPercent(sound.hatBrightness)} / Synth ${compactUnitPercent(sound.synthBrightness)}`
    },
    {
      id: "width",
      label: "Width",
      score: soundTimbreAverage([sound.synthRelease, sound.chordWidth]),
      detail: `Release ${compactUnitPercent(sound.synthRelease)} / Chord ${compactUnitPercent(sound.chordWidth)}`
    },
    {
      id: "warmth",
      label: "Warm",
      score: soundTimbreAverage([sound.chordWarmth, sound.bassDecay, 1 - sound.hatBrightness]),
      detail: `Chord ${compactUnitPercent(sound.chordWarmth)} / Body ${compactUnitPercent(sound.bassDecay)}`
    }
  ];
  const average = soundTimbreAverage(scores.map((score) => score.score));
  const fallbackScore = scores[0] ?? {
    id: "drums",
    label: "Drums",
    score: 0,
    detail: "No tone data"
  };
  const highest = scores.reduce((winner, score) => (score.score > winner.score ? score : winner), fallbackScore);
  const lowest = scores.reduce((winner, score) => (score.score < winner.score ? score : winner), fallbackScore);
  const spread = highest.score - lowest.score;
  const tone: MixCoachTone = spread > 0.42 ? "danger" : spread > 0.26 ? "warn" : "good";
  const metrics = scores.map((score) => ({
    id: score.id,
    label: score.label,
    value: compactUnitPercent(score.score),
    detail: score.detail,
    tone: soundTimbreMetricTone(score.score, average)
  }));
  const leaning = soundTimbreLeanLabel(highest);
  const headline = tone === "good" ? "Balanced tone" : leaning;
  const nextCheck = soundTimbreNextCheck(highest, lowest, tone);

  return {
    statusLabel: tone === "good" ? "Timbre balanced" : tone === "warn" ? "Timbre tilted" : "Timbre uneven",
    headline,
    balanceLabel: `Spread ${compactUnitPercent(spread)}`,
    detail: `${highest.label} leads / ${lowest.label} trails`,
    nextCheck,
    detailTitle: `${headline}: ${highest.label} ${compactUnitPercent(highest.score)} vs ${lowest.label} ${compactUnitPercent(lowest.score)}.`,
    metrics,
    tone
  };
}

export function soundTimbreAverage(values: number[]): number {
  return clampUnit(values.reduce((total, value) => total + value, 0) / values.length);
}

export function soundTimbreMetricTone(score: number, average: number): MixCoachTone {
  const distance = Math.abs(score - average);
  if (distance > 0.24) {
    return "danger";
  }
  if (distance > 0.13) {
    return "warn";
  }
  return "good";
}

export function soundTimbreLeanLabel(score: SoundTimbreScore): string {
  switch (score.id) {
    case "drums":
      return "Punch-forward";
    case "lowEnd":
      return "808-forward";
    case "brightness":
      return "Bright top";
    case "width":
      return "Wide tail";
    case "warmth":
      return "Warm bed";
  }
}

export function soundTimbreNextCheck(highest: SoundTimbreScore, lowest: SoundTimbreScore, tone: MixCoachTone): string {
  if (tone === "good") {
    return "Loop Pattern A/B/C and confirm the tone stays balanced when drums, 808, Synth, and Chords play together.";
  }
  if (highest.id === "lowEnd") {
    return "Loop kick plus 808 and check drive, decay, and duck before pushing the master.";
  }
  if (highest.id === "brightness") {
    return "Loop hats and Synth, then trim top-end brightness if the hook feels sharp.";
  }
  if (highest.id === "width") {
    return "Loop the hook and check whether release or chord width pulls the center away from drums and 808.";
  }
  if (highest.id === "warmth") {
    return "Loop chords with 808 and reduce warmth or decay if the beat feels cloudy.";
  }
  if (lowest.id === "drums") {
    return "Loop the groove and raise kick punch, snare snap, or hat brightness if drums disappear.";
  }
  return "Loop the full pattern and use Sound Focus or Studio controls to pull the loudest color back toward the bed.";
}

export function createSoundSnapshot(slot: SoundSnapshotSlotId, sound: SoundDesign): SoundSnapshot {
  const snapshotSound = cloneSoundDesign(sound);
  const timbre = createSoundTimbreCheckSummary(snapshotSound);
  const spread = soundSnapshotSpread(snapshotSound);
  const score = soundSnapshotScore(spread, timbre.tone);

  return {
    slot,
    capturedAtLabel: mixSnapshotCapturedAtLabel(),
    statusLabel: timbre.statusLabel,
    presetLabel: soundPresetLabel(snapshotSound.preset),
    timbreLabel: `${timbre.headline} / ${timbre.balanceLabel}`,
    drumLabel: soundFocusDrumLabel(snapshotSound),
    bassLabel: soundFocusBassLabel(snapshotSound),
    synthLabel: soundFocusSynthLabel(snapshotSound),
    chordLabel: soundFocusChordLabel(snapshotSound),
    spreadLabel: timbre.balanceLabel,
    score,
    sound: snapshotSound,
    tone: timbre.tone
  };
}

export function createSoundSnapshotComparison(snapshots: SoundSnapshotSlotMap): SoundSnapshotComparisonSummary {
  const a = snapshots.A;
  const b = snapshots.B;
  if (!a && !b) {
    return {
      statusLabel: "No sound snapshots",
      winnerLabel: "Capture A/B",
      detailLabel: "No tone passes held",
      detailTitle: "Capture a sound pass into A and another into B before comparing.",
      actionId: "capture-a",
      actionLabel: "Capture A",
      tone: "warn",
      metrics: emptySoundSnapshotMetrics()
    };
  }
  if (!a || !b) {
    const held = a ?? b;
    const missingSlot: SoundSnapshotSlotId = a ? "B" : "A";
    return {
      statusLabel: "One sound pass",
      winnerLabel: held ? `Sound ${held.slot} held` : "Capture pair",
      detailLabel: held ? `${held.presetLabel} / ${held.timbreLabel}` : "Capture another slot",
      detailTitle: "Capture the other Sound Snapshot slot to compare tone passes.",
      actionId: missingSlot === "A" ? "capture-a" : "capture-b",
      actionLabel: `Capture ${missingSlot}`,
      tone: "warn",
      metrics: soundSnapshotComparisonMetrics(a, b)
    };
  }

  const scoreDelta = a.score - b.score;
  const winnerLabel = Math.abs(scoreDelta) <= 3 ? "Close tone passes" : scoreDelta > 0 ? "A is cleaner" : "B is cleaner";
  const winnerSlot: SoundSnapshotSlotId = scoreDelta > 0 ? "A" : "B";
  const tone = weakestTone([a.tone, b.tone, Math.abs(scoreDelta) <= 3 ? "good" : "warn"]);

  return {
    statusLabel: Math.abs(scoreDelta) <= 3 ? "Close A/B" : scoreDelta > 0 ? "A leads" : "B leads",
    winnerLabel,
    detailLabel: `${a.timbreLabel} vs ${b.timbreLabel}`,
    detailTitle: `Sound A score ${a.score}; Sound B score ${b.score}. Recall only applies the selected SoundDesign pass.`,
    actionId: Math.abs(scoreDelta) <= 3 ? "recall-a" : winnerSlot === "A" ? "recall-a" : "recall-b",
    actionLabel: Math.abs(scoreDelta) <= 3 ? "Recall A" : `Recall ${winnerSlot}`,
    tone,
    metrics: soundSnapshotComparisonMetrics(a, b)
  };
}

export function soundSnapshotComparisonMetrics(
  a: SoundSnapshot | null,
  b: SoundSnapshot | null
): SoundSnapshotComparisonSummary["metrics"] {
  return [
    soundSnapshotComparisonMetric("preset", "Preset", a?.presetLabel, b?.presetLabel),
    soundSnapshotComparisonMetric("drums", "Drums", a?.drumLabel, b?.drumLabel),
    soundSnapshotComparisonMetric("bass", "808", a?.bassLabel, b?.bassLabel),
    soundSnapshotComparisonMetric("synth", "Synth", a?.synthLabel, b?.synthLabel),
    soundSnapshotComparisonMetric("chords", "Chords", a?.chordLabel, b?.chordLabel)
  ];
}

export function emptySoundSnapshotMetrics(): SoundSnapshotComparisonSummary["metrics"] {
  return soundSnapshotComparisonMetrics(null, null);
}

export function soundSnapshotComparisonMetric(
  id: SoundSnapshotComparisonSummary["metrics"][number]["id"],
  label: string,
  aLabel: string | undefined,
  bLabel: string | undefined
): SoundSnapshotComparisonSummary["metrics"][number] {
  const normalizedA = aLabel ?? "empty";
  const normalizedB = bLabel ?? "empty";
  return {
    id,
    label,
    aLabel: normalizedA,
    bLabel: normalizedB,
    tone: !aLabel || !bLabel ? "warn" : normalizedA === normalizedB ? "good" : "warn"
  };
}

export function soundSnapshotSpread(sound: SoundDesign): number {
  const scores = [
    soundTimbreAverage([sound.kickPunch, sound.snareSnap, sound.hatBrightness]),
    soundTimbreAverage([sound.bassDrive, sound.bassDecay, sound.sidechainDuck]),
    soundTimbreAverage([sound.hatBrightness, sound.snareSnap, sound.synthBrightness]),
    soundTimbreAverage([sound.synthRelease, sound.chordWidth]),
    soundTimbreAverage([sound.chordWarmth, sound.bassDecay, 1 - sound.hatBrightness])
  ];
  return Math.max(...scores) - Math.min(...scores);
}

export function soundSnapshotScore(spread: number, tone: MixCoachTone): number {
  const spreadPenalty = Math.min(52, Math.round(spread * 100));
  const tonePenalty = tone === "danger" ? 18 : tone === "warn" ? 8 : 0;
  return Math.max(0, 100 - spreadPenalty - tonePenalty);
}

export function cloneSoundDesign(sound: SoundDesign): SoundDesign {
  return {
    ...sound
  };
}

export function soundFocusChangedParameters(sound: SoundDesign, pad: SoundFocusPadDefinition): SoundFocusParameter[] {
  return soundFocusParameters.filter((parameter) => {
    const value = pad.values[parameter];
    return value !== undefined && clampUnit(value) !== sound[parameter];
  });
}

export function soundFocusPreviewParameterLabel(pad: SoundFocusPadDefinition): string {
  return `K ${compactUnitPercent(pad.values.kickPunch)} / 8 ${compactUnitPercent(pad.values.bassDrive)} / Ch ${compactUnitPercent(pad.values.chordWidth)}`;
}

export function soundFocusChangedParameterLabel(parameters: SoundFocusParameter[]): string {
  if (parameters.length === 0) {
    return "no editable tone parameters need to move";
  }
  const names = parameters.slice(0, 3).map(soundFocusParameterLabel);
  const suffix = parameters.length > names.length ? ` +${parameters.length - names.length}` : "";
  return `touches ${names.join(", ")}${suffix}`;
}

export function soundFocusParameterLabel(parameter: SoundFocusParameter): string {
  switch (parameter) {
    case "kickPunch":
      return "kick";
    case "snareSnap":
      return "snare";
    case "hatBrightness":
      return "hat";
    case "bassDrive":
      return "808 drive";
    case "bassDecay":
      return "808 decay";
    case "sidechainDuck":
      return "duck";
    case "synthBrightness":
      return "synth";
    case "synthRelease":
      return "release";
    case "chordWarmth":
      return "warmth";
    case "chordWidth":
      return "width";
  }
}

export function soundFocusPreview(pad: SoundFocusPadDefinition): string {
  return `K ${compactUnitPercent(pad.values.kickPunch)} / 8 ${compactUnitPercent(pad.values.bassDrive)}`;
}

export function soundFocusGroupMoveCount(beforeSound: SoundDesign, afterSound: SoundDesign, parameters: SoundFocusParameter[]): number {
  return parameters.filter((parameter) => beforeSound[parameter] !== afterSound[parameter]).length;
}

export function soundFocusDrumLabel(sound: SoundDesign): string {
  return `K${compactUnitPercent(sound.kickPunch)}/S${compactUnitPercent(sound.snareSnap)}/H${compactUnitPercent(sound.hatBrightness)}`;
}

export function soundFocusBassLabel(sound: SoundDesign): string {
  return `D${compactUnitPercent(sound.bassDrive)}/Len${compactUnitPercent(sound.bassDecay)}`;
}

export function soundFocusDuckLabel(sound: SoundDesign): string {
  return compactUnitPercent(sound.sidechainDuck);
}

export function soundFocusSynthLabel(sound: SoundDesign): string {
  return `B${compactUnitPercent(sound.synthBrightness)}/R${compactUnitPercent(sound.synthRelease)}`;
}

export function soundFocusChordLabel(sound: SoundDesign): string {
  return `Wm${compactUnitPercent(sound.chordWarmth)}/Wd${compactUnitPercent(sound.chordWidth)}`;
}

export function compactUnitPercent(value: number | undefined): string {
  return `${Math.round(clampUnit(value ?? 0) * 100)}`;
}

export function applySoundFocusPadToSound(sound: SoundDesign, pad: SoundFocusPadDefinition): SoundDesign {
  const nextSound: SoundDesign = {
    ...sound,
    preset: "custom"
  };
  soundFocusParameters.forEach((parameter) => {
    const value = pad.values[parameter];
    if (value !== undefined) {
      nextSound[parameter] = clampUnit(value);
    }
  });
  return nextSound;
}

export function sameSoundDesign(first: SoundDesign, second: SoundDesign): boolean {
  return first.preset === second.preset && soundFocusParameters.every((parameter) => first[parameter] === second[parameter]);
}

export function applyMixFixToProject(
  project: ProjectState,
  preset: MixFixPreset,
  stemAnalyses: StemExportAnalyses
): ProjectState {
  switch (preset) {
    case "headroom":
      return {
        ...project,
        masterPreset: "Headroom for Vocal",
        masterCeilingDb: masterPresetCeilingDb("Headroom for Vocal"),
        mixer: project.mixer.map((channel) =>
          channel.id === "master"
            ? { ...channel, volumeDb: Math.min(channel.volumeDb, -2) }
            : {
                ...channel,
                drive: normalizeMixerEq(channel.drive * 0.9),
                glue: normalizeMixerEq(channel.glue * 0.95)
              }
        )
      };
    case "stem_balance":
      return {
        ...project,
        mixer: project.mixer.map((channel) => {
          const target = roughStemVolumeTarget(channel.id);
          return target === null ? channel : { ...channel, volumeDb: nudgeMixFixVolume(channel.volumeDb, target) };
        })
      };
    case "low_end": {
      const lowEndDelta = lowEndDeltaDb(stemAnalyses);
      const bassShift = lowEndDelta === null ? 0 : lowEndDelta > 6 ? -2 : lowEndDelta < -12 ? 2 : 0;
      const drumShift = lowEndDelta === null ? 0 : lowEndDelta > 6 ? 0.8 : lowEndDelta < -12 ? -0.8 : 0;
      return {
        ...project,
        mixer: project.mixer.map((channel) => {
          if (channel.id === "bass_808") {
            return {
              ...channel,
              volumeDb: clampMixFixVolume(channel.volumeDb + bassShift),
              lowCut: 0,
              air: normalizeMixerEq(Math.min(channel.air, 0.12)),
              drive: normalizeMixerEq(Math.max(channel.drive, 0.2)),
              glue: normalizeMixerEq(Math.max(channel.glue, 0.2)),
              send: normalizeMixerEq(Math.min(channel.send, 0.04))
            };
          }
          if (channel.id === "drum_rack") {
            return {
              ...channel,
              volumeDb: clampMixFixVolume(channel.volumeDb + drumShift),
              lowCut: normalizeMixerEq(Math.max(channel.lowCut, 0.08)),
              glue: normalizeMixerEq(Math.max(channel.glue, 0.24))
            };
          }
          return channel;
        })
      };
    }
  }
}

export function mixFixPresetLabel(preset: MixFixPreset): string {
  switch (preset) {
    case "headroom":
      return "Headroom";
    case "stem_balance":
      return "Stem Balance";
    case "low_end":
      return "Low End";
  }
}

export function roughStemVolumeTarget(trackId: MixerChannel["id"]): number | null {
  switch (trackId) {
    case "drum_rack":
      return -5;
    case "bass_808":
      return -6.5;
    case "synth":
      return -9;
    case "chord":
      return -9.5;
    default:
      return null;
  }
}

export function nudgeMixFixVolume(current: number, target: number): number {
  return clampMixFixVolume(current + (target - current) * 0.65);
}

export function clampMixFixVolume(value: number): number {
  if (!Number.isFinite(value)) {
    return -6;
  }
  return Math.min(3, Math.max(-36, Math.round(value * 10) / 10));
}

export function lowEndDeltaDb(stemAnalyses: StemExportAnalyses): number | null {
  const drums = stemAnalyses.drum_rack;
  const bass = stemAnalyses.bass_808;
  return Number.isFinite(drums.rmsDb) && Number.isFinite(bass.rmsDb) ? bass.rmsDb - drums.rmsDb : null;
}

export function masterHeadroomCheck(analysis: ExportAnalysis): MixCoachCheck {
  if (analysis.status === "Silent") {
    return {
      id: "headroom",
      label: "Master headroom",
      status: "No signal",
      detail: "Add or unmute musical events before judging the master.",
      tone: "danger"
    };
  }
  if (analysis.headroomDb < 0.5) {
    return {
      id: "headroom",
      label: "Master headroom",
      status: "Tight",
      detail: `Only ${formatDb(analysis.headroomDb)} remains before the ceiling.`,
      tone: "warn"
    };
  }
  return {
    id: "headroom",
    label: "Master headroom",
    status: "Open",
    detail: `${formatDb(analysis.headroomDb)} remains before the ceiling.`,
    tone: "good"
  };
}

export function limiterCheck(analysis: ExportAnalysis): MixCoachCheck {
  if (analysis.limitedSamples > 0) {
    return {
      id: "limiter",
      label: "Limiter activity",
      status: "Catching peaks",
      detail: `${formatPercent(analysis.limitedPercent)} of rendered samples hit the ceiling.`,
      tone: analysis.limitedPercent > 0.1 ? "warn" : "good"
    };
  }
  return {
    id: "limiter",
    label: "Limiter activity",
    status: "Clear",
    detail: "No rendered samples hit the ceiling.",
    tone: "good"
  };
}

export function exportDynamicsCheck(analysis: ExportAnalysis): MixCoachCheck {
  if (analysis.status === "Silent") {
    return {
      id: "dynamics",
      label: "Export dynamics",
      status: "No signal",
      detail: "Add or unmute musical events before judging peak-to-RMS punch.",
      tone: "danger"
    };
  }

  const dynamicsDb = exportDynamicsDb(analysis);
  if (dynamicsDb < 6) {
    return {
      id: "dynamics",
      label: "Export dynamics",
      status: "Too flat",
      detail: `${formatDb(dynamicsDb)} peak-minus-RMS spacing; the render may feel over-compressed.`,
      tone: "warn"
    };
  }
  if (dynamicsDb > 22) {
    return {
      id: "dynamics",
      label: "Export dynamics",
      status: "Spiky",
      detail: `${formatDb(dynamicsDb)} peak-minus-RMS spacing; peaks may jump ahead of body.`,
      tone: "warn"
    };
  }
  return {
    id: "dynamics",
    label: "Export dynamics",
    status: "Punch clear",
    detail: `${formatDb(dynamicsDb)} peak-minus-RMS spacing for local render punch.`,
    tone: "good"
  };
}

export function stemBalanceCheck(
  loudestStem: { track: StemTrackId; analysis: ExportAnalysis } | undefined,
  quietestStem: { track: StemTrackId; analysis: ExportAnalysis } | undefined,
  stemSpread: number
): MixCoachCheck {
  if (!loudestStem || !quietestStem) {
    return {
      id: "stem-balance",
      label: "Stem balance",
      status: "No signal",
      detail: "Unmute at least two core stems before comparing balance.",
      tone: "danger"
    };
  }
  if (stemSpread > 18) {
    return {
      id: "stem-balance",
      label: "Stem balance",
      status: "Wide spread",
      detail: `RMS spread is ${stemSpread.toFixed(1)} dB from ${stemTrackLabel(loudestStem.track)} to ${stemTrackLabel(quietestStem.track)}.`,
      tone: "warn"
    };
  }
  return {
    id: "stem-balance",
    label: "Stem balance",
    status: "Connected",
    detail: `RMS spread is ${stemSpread.toFixed(1)} dB from ${stemTrackLabel(loudestStem.track)} to ${stemTrackLabel(quietestStem.track)}.`,
    tone: "good"
  };
}

export function lowEndBlendCheck(lowEndDelta: number | null): MixCoachCheck {
  if (lowEndDelta === null) {
    return {
      id: "low-end",
      label: "Low-end blend",
      status: "No comparison",
      detail: "Drums and 808 both need signal for low-end balance.",
      tone: "danger"
    };
  }
  if (lowEndDelta > 6) {
    return {
      id: "low-end",
      label: "Low-end blend",
      status: "808 forward",
      detail: `808 is ${lowEndDelta.toFixed(1)} dB RMS above drums.`,
      tone: "warn"
    };
  }
  if (lowEndDelta < -12) {
    return {
      id: "low-end",
      label: "Low-end blend",
      status: "Drums forward",
      detail: `Drums are ${Math.abs(lowEndDelta).toFixed(1)} dB RMS above 808.`,
      tone: "warn"
    };
  }
  return {
    id: "low-end",
    label: "Low-end blend",
    status: "Balanced",
    detail: `808 is ${lowEndDelta.toFixed(1)} dB RMS relative to drums.`,
    tone: "good"
  };
}

export function mixCoachSummary(checks: MixCoachCheck[]): string {
  const warningCount = checks.filter((check) => check.tone !== "good").length;
  if (warningCount === 0) {
    return "Ready checks";
  }
  return `${warningCount} check${warningCount === 1 ? "" : "s"} to review`;
}
