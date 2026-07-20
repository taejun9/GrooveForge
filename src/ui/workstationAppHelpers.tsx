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
import { deliveryBundleZipFileName } from "../audio/deliveryBundle";
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
  maxProjectSwing,
  minDeliveryTargetBars,
  minDeliveryTargetStemGoal,
  minArrangementBars,
  minProjectSwing,
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
  normalizeProjectSwing,
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
  AudienceSessionActionResult,
  AudienceSessionReadoutRow,
  AudienceSessionReadoutSummary,
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

export type EditHistoryEntry = {
  project: ProjectState;
  label: string;
};

export { minProjectSwing, maxProjectSwing };

export function normalizeSwingFeelValue(value: number): number {
  return normalizeProjectSwing(value);
}

export function swingFeelPadSwing(pad: SwingFeelPadDefinition, project: ProjectState): number {
  return normalizeSwingFeelValue(pad.value === "style" ? getStyle(project).defaultSwing : pad.value);
}

export function swingFeelPadDetail(pad: SwingFeelPadDefinition, project: ProjectState): string {
  return pad.id === "style" ? `${getStyle(project).name} default` : pad.detail;
}

export function createSwingFeelResult(
  pad: SwingFeelPadDefinition,
  beforeProject: ProjectState,
  afterProject: ProjectState
): SwingFeelResult {
  const beforeSwing = normalizeSwingFeelValue(beforeProject.swing);
  const afterSwing = normalizeSwingFeelValue(afterProject.swing);
  const changed = beforeSwing !== afterSwing;

  return {
    padId: pad.id,
    title: `${pad.label} Swing Feel`,
    status: changed ? "Applied" : "Held",
    detail: `${swingFeelPadDetail(pad, afterProject)} / Pattern ${afterProject.selectedPattern}`,
    scope: "Global swing timing",
    metric: {
      id: "swing-feel",
      label: "Swing",
      before: percentLabel(beforeSwing),
      after: percentLabel(afterSwing),
      tone: changed ? "good" : "warn"
    },
    auditionCue: `Loop Pattern ${afterProject.selectedPattern}; listen for hat pocket, clap placement, and 808 timing against ${percentLabel(
      afterSwing
    )} swing.`,
    nextCheck: "Use Groove Compass, Style Inspector swing, or the manual Swing slider if the pocket needs finer adjustment.",
    tone: changed ? "good" : "warn"
  };
}

export type StyleGoalCueResult = {
  goalId: StyleGoalCardId;
  status: "Cued";
  title: string;
  metric: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export function createStyleGoalCueResult(goal: StyleGoalCard, project: ProjectState): StyleGoalCueResult {
  if (goal.id === "arrange") {
    return {
      goalId: goal.id,
      status: "Cued",
      title: `${goal.label} Song loop ready`,
      metric: `Song loop / ${barCountLabel(arrangementTotalBars(project))}`,
      auditionCue: `Play Song loop; scan ${goal.label} across ${barCountLabel(arrangementTotalBars(project))}.`,
      nextCheck: "Run the matching Style Goal Action only after the song-form cue exposes the next arrangement gap.",
      tone: "good"
    };
  }

  return {
    goalId: goal.id,
    status: "Cued",
    title: `${goal.label} Pattern ${project.selectedPattern} loop ready`,
    metric: `Pattern ${project.selectedPattern} loop / ${goal.value}`,
    auditionCue: `Play Pattern loop; inspect ${goal.label} on Pattern ${project.selectedPattern} before applying a writing move.`,
    nextCheck: "Run the matching Style Goal Action only if the cued loop still needs that layer.",
    tone: "good"
  };
}

export function EditorAuditionResultStrip({ result }: { result: EditorAuditionResult }): ReactElement {
  return (
    <div
      className={`quick-action-result editor-audition-result ${result.tone}`}
      data-result-editor-audition={result.targetId}
      data-testid="editor-audition-result"
      aria-live="polite"
    >
      <div className="quick-action-result-main">
        <span data-testid="editor-audition-result-status">{result.status}</span>
        <strong data-testid="editor-audition-result-title">{result.title}</strong>
        <small data-testid="editor-audition-result-detail">{result.detail}</small>
      </div>
      <div className={`quick-action-result-metric ${result.tone}`} data-testid="editor-audition-result-metric">
        <span data-testid="editor-audition-result-pattern">{result.patternLabel}</span>
        <strong data-testid="editor-audition-result-metric-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="quick-action-result-followup" data-testid="editor-audition-result-followup">
        <span>
          <b>Listen</b>
          <em data-testid="editor-audition-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next</b>
          <em data-testid="editor-audition-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function InputCaptureResultStrip({ result }: { result: InputCaptureResult }): ReactElement {
  return (
    <div
      className={`quick-action-result input-capture-result ${result.tone}`}
      data-result-input-capture={result.targetId}
      data-testid="input-capture-result"
      aria-live="polite"
    >
      <div className="quick-action-result-main">
        <span data-testid="input-capture-result-status">{result.status}</span>
        <strong data-testid="input-capture-result-title">{result.title}</strong>
        <small data-testid="input-capture-result-detail">{result.detail}</small>
      </div>
      <div className={`quick-action-result-metric ${result.tone}`} data-testid="input-capture-result-metric">
        <span data-testid="input-capture-result-pattern">{result.patternLabel}</span>
        <strong data-testid="input-capture-result-metric-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="quick-action-result-followup" data-testid="input-capture-result-followup">
        <span>
          <b>Listen</b>
          <em data-testid="input-capture-result-cue">{result.captureCue}</em>
        </span>
        <span>
          <b>Next</b>
          <em data-testid="input-capture-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function SelectedEventDeleteResultStrip({ result }: { result: SelectedEventDeleteResult }): ReactElement {
  return (
    <div
      className={`quick-action-result selected-event-delete-result ${result.tone}`}
      data-result-selected-event-delete={result.targetId}
      data-testid="selected-event-delete-result"
      aria-live="polite"
    >
      <div className="quick-action-result-main">
        <span data-testid="selected-event-delete-result-status">{result.status}</span>
        <strong data-testid="selected-event-delete-result-title">{result.title}</strong>
        <small data-testid="selected-event-delete-result-detail">{result.detail}</small>
      </div>
      <div className={`quick-action-result-metric ${result.tone}`} data-testid="selected-event-delete-result-metric">
        <span data-testid="selected-event-delete-result-pattern">{result.patternLabel}</span>
        <strong data-testid="selected-event-delete-result-metric-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="quick-action-result-followup" data-testid="selected-event-delete-result-followup">
        <span>
          <b>Undo</b>
          <em data-testid="selected-event-delete-result-recovery">{result.recoveryCue}</em>
        </span>
        <span>
          <b>Next</b>
          <em data-testid="selected-event-delete-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function UndoRedoResultStrip({ result }: { result: UndoRedoResult }): ReactElement {
  return (
    <div
      className={`quick-action-result undo-redo-result ${result.tone}`}
      data-result-undo-redo={result.targetId}
      data-testid="undo-redo-result"
      aria-live="polite"
    >
      <div className="quick-action-result-main">
        <span data-testid="undo-redo-result-status">{result.status}</span>
        <strong data-testid="undo-redo-result-title">{result.title}</strong>
        <small data-testid="undo-redo-result-detail">{result.detail}</small>
      </div>
      <div className={`quick-action-result-metric ${result.tone}`} data-testid="undo-redo-result-metric">
        <span data-testid="undo-redo-result-action">{result.action === "undo" ? "Undo" : "Redo"}</span>
        <strong data-testid="undo-redo-result-metric-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="quick-action-result-followup" data-testid="undo-redo-result-followup">
        <span>
          <b>{result.action === "undo" ? "Redo" : "Undo"}</b>
          <em data-testid="undo-redo-result-recovery">{result.recoveryCue}</em>
        </span>
        <span>
          <b>Next</b>
          <em data-testid="undo-redo-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function ProjectFileResultStrip({ result }: { result: ProjectFileResult }): ReactElement {
  return (
    <div
      className={`quick-action-result project-file-result ${result.tone}`}
      data-result-project-file={result.targetId}
      data-testid="project-file-result"
      aria-live="polite"
    >
      <div className="quick-action-result-main">
        <span data-testid="project-file-result-status">{result.status}</span>
        <strong data-testid="project-file-result-title">{result.title}</strong>
        <small data-testid="project-file-result-detail">{result.detail}</small>
      </div>
      <div className={`quick-action-result-metric ${result.tone}`} data-testid="project-file-result-metric">
        <span data-testid="project-file-result-file">{result.fileLabel}</span>
        <strong data-testid="project-file-result-metric-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="quick-action-result-followup" data-testid="project-file-result-followup">
        <span>
          <b>Safety</b>
          <em data-testid="project-file-result-safety">{result.safetyCue}</em>
        </span>
        <span>
          <b>Next</b>
          <em data-testid="project-file-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function LocalDraftRecoveryResultStrip({ result }: { result: LocalDraftRecoveryResult }): ReactElement {
  return (
    <div
      className={`quick-action-result local-draft-recovery-result ${result.tone}`}
      data-result-local-draft={result.targetId}
      data-testid="local-draft-recovery-result"
      aria-live="polite"
    >
      <div className="quick-action-result-main">
        <span data-testid="local-draft-recovery-result-status">{result.status}</span>
        <strong data-testid="local-draft-recovery-result-title">{result.title}</strong>
        <small data-testid="local-draft-recovery-result-detail">{result.detail}</small>
      </div>
      <div className={`quick-action-result-metric ${result.tone}`} data-testid="local-draft-recovery-result-metric">
        <span data-testid="local-draft-recovery-result-action">
          {result.action === "restore" ? "Restore Draft" : "Clear Draft"}
        </span>
        <strong data-testid="local-draft-recovery-result-metric-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="quick-action-result-followup" data-testid="local-draft-recovery-result-followup">
        <span>
          <b>Safety</b>
          <em data-testid="local-draft-recovery-result-safety">{result.safetyCue}</em>
        </span>
        <span>
          <b>Next</b>
          <em data-testid="local-draft-recovery-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}


export function StyleInspector({
  composerActionResult,
  composerActionsSummary,
  cueResult,
  focusedItemId,
  innerRef,
  isPlaying,
  result,
  onCueGoal,
  onFocus,
  onRunGoalAction,
  onSelectStyle,
  selectedStyleId,
  summary
}: {
  composerActionResult: ComposerActionResult | null;
  composerActionsSummary: ComposerActionsSummary;
  cueResult: StyleGoalCueResult | null;
  focusedItemId: StyleInspectorFocusId | null;
  innerRef: Ref<HTMLElement>;
  isPlaying: boolean;
  result: StyleInspectorFocusResult | null;
  onCueGoal: (goal: StyleGoalCard) => void;
  onFocus: (item: StyleInspectorFocusItem) => void;
  onRunGoalAction: (action: ComposerAction) => void;
  onSelectStyle: (styleId: ProjectState["styleId"]) => void;
  selectedStyleId: ProjectState["styleId"];
  summary: StyleInspectorSummary;
}): ReactElement {
  const focusSummary = createStyleInspectorFocusSummary(summary, focusedItemId);
  const actionResultGoal = composerActionResult
    ? styleGoalForComposerActionResult(composerActionResult, summary.goals)
    : null;
  const cueResultGoal = cueResult ? summary.goals.find((goal) => goal.id === cueResult.goalId) ?? null : null;

  return (
    <section
      aria-label="Style inspector"
      className={[
        "style-inspector",
        result ? "has-focus-result" : "",
        cueResultGoal ? "has-goal-cue-result" : "",
        actionResultGoal ? "has-goal-action-result" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="style-inspector"
      ref={innerRef}
      style={{ "--style-color": summary.profile.color } as CSSProperties}
    >
      <div className="style-inspector-heading">
        <div>
          <Sparkles size={17} aria-hidden="true" />
          <span>Style Inspector</span>
        </div>
        <strong data-testid="style-inspector-name">{summary.profile.name}</strong>
        <p>{summary.totalEvents} editable Pattern A/B/C events from local style data</p>
      </div>
      <div className="style-inspector-focus-readout" data-testid="style-inspector-focus-readout" title={focusSummary.detailTitle}>
        <span data-testid="style-inspector-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="style-inspector-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="style-inspector-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      {result && <StyleInspectorFocusResultStrip result={result} />}
      <div className="style-inspector-metrics">
        {summary.metrics.map((metric) => {
          const focused = focusedItemId === metric.focusId;
          return (
            <div
              className={["style-inspector-metric", focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`style-metric-${metric.id}`}
              key={metric.id}
            >
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <button
                aria-pressed={focused}
                className="style-inspector-focus-button"
                data-testid={`style-focus-${metric.id}`}
                onClick={() => onFocus(metric)}
                title={`Focus ${metric.focusLabel}: ${metric.value}`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{metric.focusLabel}</span>
              </button>
              <small>{metric.detail}</small>
            </div>
          );
        })}
      </div>
      <div
        aria-label={`${summary.profile.name} style goals: ${summary.goalHeadline}`}
        className="style-inspector-goals"
        data-testid="style-goal-cards"
        title={`${summary.profile.name} direct-composition goals: ${summary.goalHeadline}`}
      >
        {summary.goals.map((goal) => {
          const goalAction = composerActionForStyleGoal(goal, composerActionsSummary.actions);
          return (
            <div
              className={["style-goal-card", goal.tone, focusedItemId === goal.focusId ? "focused" : ""]
                .filter(Boolean)
                .join(" ")}
              data-focused={focusedItemId === goal.focusId ? "true" : "false"}
              data-testid={`style-goal-${goal.id}`}
              key={goal.id}
            >
              <span data-testid={`style-goal-${goal.id}-label`}>{goal.label}</span>
              <strong data-testid={`style-goal-${goal.id}-current`}>{goal.current}</strong>
              <small data-testid={`style-goal-${goal.id}-target`}>Target {goal.target}</small>
              <b data-testid={`style-goal-${goal.id}-progress`}>{goal.progress}</b>
              <div className="style-goal-card-actions" data-testid={`style-goal-${goal.id}-actions`}>
                <button
                  aria-pressed={focusedItemId === goal.focusId}
                  className="style-goal-focus-button"
                  data-testid={`style-goal-focus-${goal.id}`}
                  onClick={() => onFocus(goal)}
                  title={`Focus ${goal.focusLabel}: ${goal.value}`}
                  type="button"
                >
                  <ArrowRight size={13} aria-hidden="true" />
                  <span>{goal.focusLabel}</span>
                </button>
                <button
                  className="style-goal-cue-button"
                  data-testid={`style-goal-cue-${goal.id}`}
                  disabled={isPlaying}
                  onClick={() => onCueGoal(goal)}
                  title={
                    isPlaying
                      ? "Stop playback before cueing Style Goal"
                      : `Cue ${goal.id === "arrange" ? "Song loop" : "Pattern loop"} for ${goal.label}`
                  }
                  type="button"
                >
                  <Play size={12} aria-hidden="true" />
                  <span>Cue</span>
                </button>
                {goalAction && (
                  <button
                    className="style-goal-action-button"
                    data-testid={`style-goal-action-${goal.id}`}
                    onClick={() => onRunGoalAction(goalAction)}
                    title={`${goal.label} goal action: ${goalAction.label}`}
                    type="button"
                  >
                    <Sparkles size={12} aria-hidden="true" />
                    <span>{goalAction.buttonLabel}</span>
                  </button>
                )}
              </div>
              <em data-testid={`style-goal-${goal.id}-cue`}>{goal.cue}</em>
              <i data-testid={`style-goal-${goal.id}-detail`}>{goal.detail}</i>
            </div>
          );
        })}
      </div>
      {cueResult && cueResultGoal && (
        <StyleGoalCueResultStrip
          action={composerActionForStyleGoal(cueResultGoal, composerActionsSummary.actions)}
          goal={cueResultGoal}
          onRunAction={onRunGoalAction}
          result={cueResult}
        />
      )}
      {composerActionResult && actionResultGoal && (
        <StyleGoalActionResultStrip goal={actionResultGoal} result={composerActionResult} />
      )}
      <div className="style-quick-picks" aria-label="Style quick picks" data-testid="style-quick-picks">
        {styleProfiles.map((profile) => {
          const selected = profile.id === selectedStyleId;
          return (
            <button
              aria-pressed={selected}
              className={selected ? "selected" : ""}
              data-testid={`style-quick-${profile.id}`}
              key={profile.id}
              onClick={() => onSelectStyle(profile.id)}
              style={{ "--quick-style-color": profile.color } as CSSProperties}
              title={`Apply ${profile.name} groove`}
              type="button"
            >
              <span>{profile.name}</span>
              <strong>{profile.defaultBpm} BPM</strong>
              <small>
                {bassStyleRoleLabel(profile.bassStyle)} / {melodyStyleRoleLabel(profile.melodyStyle)}
              </small>
            </button>
          );
        })}
      </div>
      <div className="style-inspector-patterns" aria-label="Pattern density">
        {summary.patterns.map((pattern) => {
          const focused = focusedItemId === pattern.focusId;
          return (
            <div
              className={["style-inspector-pattern", focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`style-density-${pattern.slot}`}
              key={pattern.slot}
            >
              <span>Pattern {pattern.slot}</span>
              <strong>{pattern.label}</strong>
              <button
                aria-pressed={focused}
                className="style-inspector-focus-button"
                data-testid={`style-focus-density-${pattern.slot}`}
                onClick={() => onFocus(pattern)}
                title={`Focus ${pattern.focusLabel}: Pattern ${pattern.slot} ${pattern.label}`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{pattern.focusLabel}</span>
              </button>
              <small>{pattern.detail}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function StyleInspectorFocusResultStrip({ result }: { result: StyleInspectorFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`style-inspector-result ${result.tone}`}
      data-result-style-inspector={result.focusId}
      data-testid="style-inspector-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="style-inspector-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="style-inspector-result-title">{result.title}</strong>
          <small data-testid="style-inspector-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="style-inspector-result-destination" data-testid="style-inspector-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="style-inspector-result-metric" data-testid="style-inspector-result-metric">
        <span data-testid="style-inspector-result-status">{result.metricLabel}</span>
        <strong data-testid="style-inspector-result-value">{result.metricValue}</strong>
      </div>
      <div className="style-inspector-result-followup" data-testid="style-inspector-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function StyleGoalCueResultStrip({
  action,
  goal,
  onRunAction,
  result
}: {
  action: ComposerAction | null;
  goal: StyleGoalCard;
  onRunAction: (action: ComposerAction) => void;
  result: StyleGoalCueResult;
}): ReactElement {
  return (
    <div
      className={`style-goal-cue-result ${result.tone}`}
      data-testid="style-goal-cue-result"
      title={`${goal.label}: ${result.title} / ${result.metric}`}
    >
      <span data-testid="style-goal-cue-result-status">{result.status}</span>
      <strong data-testid="style-goal-cue-result-title">
        {goal.label}: {result.title}
      </strong>
      <small data-testid="style-goal-cue-result-metric">{result.metric}</small>
      <em data-testid="style-goal-cue-result-audition">{result.auditionCue}</em>
      <i data-testid="style-goal-cue-result-next-check">{result.nextCheck}</i>
      <button
        className="style-goal-cue-result-action-button"
        data-testid="style-goal-cue-result-action"
        disabled={!action}
        onClick={() => {
          if (action) {
            onRunAction(action);
          }
        }}
        title={action ? `${goal.label} goal action: ${action.label}` : `${goal.label} goal action unavailable`}
        type="button"
      >
        <Sparkles size={12} aria-hidden="true" />
        <span>{action ? action.buttonLabel : "No Action"}</span>
      </button>
    </div>
  );
}

export function StyleGoalActionResultStrip({
  goal,
  result
}: {
  goal: StyleGoalCard;
  result: ComposerActionResult;
}): ReactElement {
  const primaryMetric = result.metrics[0] ?? null;
  const metricLabel = primaryMetric ? `${primaryMetric.label}: ${primaryMetric.before} -> ${primaryMetric.after}` : result.detail;

  return (
    <div
      className={`style-goal-action-result ${result.tone}`}
      data-testid="style-goal-action-result"
      title={`${goal.label}: ${result.title} / ${result.detail}`}
    >
      <span data-testid="style-goal-action-result-status">{result.status}</span>
      <strong data-testid="style-goal-action-result-title">
        {goal.label}: {result.title}
      </strong>
      <small data-testid="style-goal-action-result-metric">{metricLabel}</small>
      <em data-testid="style-goal-action-result-audition">{result.auditionCue}</em>
      <i data-testid="style-goal-action-result-next-check">{result.nextCheck}</i>
    </div>
  );
}

export function composerActionForStyleGoal(goal: StyleGoalCard, actions: ComposerAction[]): ComposerAction | null {
  return actions.find((action) => action.area === goal.id) ?? null;
}

export function styleGoalForComposerActionResult(result: ComposerActionResult, goals: StyleGoalCard[]): StyleGoalCard | null {
  return goals.find((goal) => goal.id === result.area) ?? null;
}

export type BeatBlueprintPreviewDecision = {
  statusLabel: string;
  blueprintLabel: string;
  metricLabel: string;
  detailLabel: string;
  actionId: "apply-preview" | "preview-style-match";
  actionBlueprintId: BeatBlueprintId;
  actionLabel: string;
  title: string;
  tone: MixCoachTone;
};

export type BeatBlueprintPreviewCue = {
  statusLabel: string;
  cueLabel: string;
  detailLabel: string;
  nextCheckLabel: string;
  actionId: "cue-song" | "cue-pattern";
  actionLoopScope: Extract<TransportLoopScope, "arrangement" | "pattern">;
  actionLabel: string;
  title: string;
  tone: MixCoachTone;
};

export function BeatBlueprints({
  isPlaying,
  onApply,
  onCuePreview,
  onPreview,
  previewBlueprintId,
  project,
  result,
  transportLoopScope,
  sectionRef
}: {
  isPlaying: boolean;
  onApply: (blueprintId: BeatBlueprintId) => void;
  onCuePreview: (scope: Extract<TransportLoopScope, "arrangement" | "pattern">) => void;
  onPreview: (blueprintId: BeatBlueprintId) => void;
  previewBlueprintId: BeatBlueprintId;
  project: ProjectState;
  result: BeatBlueprintResult | null;
  transportLoopScope: TransportLoopScope;
  sectionRef?: Ref<HTMLElement>;
}): ReactElement {
  const previewBlueprint = beatBlueprints.find((blueprint) => blueprint.id === previewBlueprintId) ?? beatBlueprints[0];
  const previewSummary = createBeatBlueprintPreviewSummary(project, previewBlueprint);
  const styleMatchBlueprint =
    beatBlueprints.find((blueprint) => blueprint.id === suggestedBlueprintId(project)) ?? previewBlueprint;
  const styleMatchSummary = createBeatBlueprintPreviewSummary(project, styleMatchBlueprint);
  const styleMatchPreviewed = previewSummary.blueprintId === styleMatchSummary.blueprintId;
  const currentStyleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const previewDecision = createBeatBlueprintPreviewDecision(previewSummary, styleMatchSummary, styleMatchPreviewed);
  const previewCue = createBeatBlueprintPreviewCue(previewSummary, styleMatchSummary, styleMatchPreviewed);
  const previewDecisionApplies = previewDecision.actionId === "apply-preview";
  const previewCueActive = transportLoopScope === previewCue.actionLoopScope;

  function runPreviewDecisionAction(): void {
    if (previewDecisionApplies) {
      onApply(previewDecision.actionBlueprintId);
      return;
    }
    onPreview(previewDecision.actionBlueprintId);
  }

  return (
    <section className="blueprint-row" data-testid="beat-blueprints" aria-label="Beat blueprints" ref={sectionRef}>
      <div className="blueprint-heading">
        <div>
          <Sparkles size={17} aria-hidden="true" />
          <span>Beat Blueprints</span>
        </div>
        <strong data-testid="beat-blueprint-current">
          {project.bpm} BPM / {project.key}
        </strong>
        <small data-testid="beat-blueprint-preview-status">{previewSummary.statusLabel}</small>
      </div>
      <div className={`blueprint-style-match ${styleMatchSummary.tone}`} data-testid="beat-blueprint-style-match">
        <div className="blueprint-style-match-main">
          <Sparkles size={14} aria-hidden="true" />
          <span>
            <b data-testid="beat-blueprint-style-match-label">{currentStyleName} starter</b>
            <strong data-testid="beat-blueprint-style-match-name">{styleMatchSummary.name}</strong>
            <small data-testid="beat-blueprint-style-match-detail">{styleMatchSummary.detailLabel}</small>
          </span>
        </div>
        <div className="blueprint-style-match-state">
          <span data-testid="beat-blueprint-style-match-status">
            {styleMatchPreviewed ? "Previewing style match" : styleMatchSummary.statusLabel}
          </span>
          <button
            className="blueprint-style-match-preview"
            data-testid="beat-blueprint-style-match-preview"
            onClick={() => onPreview(styleMatchSummary.blueprintId)}
            title={`Preview ${styleMatchSummary.name} for ${currentStyleName}`}
            type="button"
          >
            Preview
          </button>
          <button
            className="blueprint-style-match-apply"
            data-testid="beat-blueprint-style-match-apply"
            onClick={() => onApply(styleMatchSummary.blueprintId)}
            title={`Apply ${styleMatchSummary.name} for ${currentStyleName}`}
            type="button"
          >
            <ArrowRight size={13} aria-hidden="true" />
            <span>Apply</span>
          </button>
        </div>
      </div>
      <div className={`blueprint-preview ${previewSummary.tone}`} data-testid="beat-blueprint-preview">
        <div
          className={`blueprint-preview-decision ${previewDecision.tone}`}
          data-blueprint-preview-decision={previewSummary.blueprintId}
          data-testid="beat-blueprint-preview-decision"
          title={previewDecision.title}
        >
          <span data-testid="beat-blueprint-preview-decision-status">{previewDecision.statusLabel}</span>
          <strong data-testid="beat-blueprint-preview-decision-label">{previewDecision.blueprintLabel}</strong>
          <small data-testid="beat-blueprint-preview-decision-metric">{previewDecision.metricLabel}</small>
          <small data-testid="beat-blueprint-preview-decision-detail">{previewDecision.detailLabel}</small>
          <button
            className="blueprint-preview-decision-run"
            data-blueprint-preview-decision-action={previewDecision.actionId}
            data-blueprint-preview-decision-target={previewDecision.actionBlueprintId}
            data-testid="beat-blueprint-preview-decision-run"
            onClick={runPreviewDecisionAction}
            title={`Run ${previewDecision.actionLabel}: ${previewDecision.title}`}
            type="button"
          >
            {previewDecisionApplies ? (
              <ArrowRight size={13} aria-hidden="true" />
            ) : (
              <Sparkles size={13} aria-hidden="true" />
            )}
            <span data-testid="beat-blueprint-preview-decision-action">{previewDecision.actionLabel}</span>
          </button>
        </div>
        <div
          className={`blueprint-preview-cue ${previewCue.tone}`}
          data-blueprint-preview-cue={previewSummary.blueprintId}
          data-testid="beat-blueprint-preview-cue"
          title={previewCue.title}
        >
          <span data-testid="beat-blueprint-preview-cue-status">{previewCue.statusLabel}</span>
          <strong data-testid="beat-blueprint-preview-cue-label">{previewCue.cueLabel}</strong>
          <small data-testid="beat-blueprint-preview-cue-detail">{previewCue.detailLabel}</small>
          <small data-testid="beat-blueprint-preview-cue-next-check">{previewCue.nextCheckLabel}</small>
          <button
            aria-pressed={previewCueActive}
            className="blueprint-preview-cue-run"
            data-blueprint-preview-cue-action={previewCue.actionId}
            data-blueprint-preview-cue-scope={previewCue.actionLoopScope}
            data-testid="beat-blueprint-preview-cue-run"
            disabled={isPlaying}
            onClick={() => onCuePreview(previewCue.actionLoopScope)}
            title={isPlaying ? "Stop playback before cueing Beat Blueprint preview" : `Run ${previewCue.actionLabel}: ${previewCue.title}`}
            type="button"
          >
            <Play size={13} aria-hidden="true" />
            <span data-testid="beat-blueprint-preview-cue-action">{previewCueActive ? "Cued" : previewCue.actionLabel}</span>
          </button>
        </div>
        <div className="blueprint-preview-head">
          <span>{previewSummary.focus}</span>
          <strong data-testid="beat-blueprint-preview-label">{previewSummary.name}</strong>
          <small data-testid="beat-blueprint-preview-detail">{previewSummary.detailLabel}</small>
        </div>
        <div className="blueprint-preview-metrics" data-testid="beat-blueprint-preview-metrics">
          {previewSummary.metrics.map((metric) => (
            <span
              className={`blueprint-preview-chip ${metric.tone}`}
              data-testid={beatBlueprintPreviewMetricTestIds[metric.id]}
              key={metric.id}
              title={`${metric.label}: ${metric.value} / ${metric.detail}`}
            >
              <span>{metric.status}</span>
              <strong>{metric.value}</strong>
              <small>{metric.label}</small>
            </span>
          ))}
        </div>
        <button
          className="blueprint-preview-apply"
          data-testid="beat-blueprint-preview-apply"
          onClick={() => onApply(previewSummary.blueprintId)}
          title={`Apply ${previewSummary.name} blueprint`}
          type="button"
        >
          <Sparkles size={13} aria-hidden="true" />
          <span>{previewSummary.applyLabel}</span>
        </button>
        {result && <BeatBlueprintResultStrip result={result} />}
      </div>
      <div className="blueprint-list">
        {beatBlueprints.map((blueprint) => {
          const blueprintSummary = createBeatBlueprintPreviewSummary(project, blueprint);
          const current = blueprintSummary.metrics.every((metric) => metric.status === "Keep");
          const previewed = previewSummary.blueprintId === blueprint.id;
          const styleName = styleProfiles.find((profile) => profile.id === blueprint.styleId)?.name ?? blueprint.styleId;
          return (
            <div
              className={["blueprint-card", current ? "current" : "", previewed ? "previewed" : ""].filter(Boolean).join(" ")}
              key={blueprint.id}
            >
              <button
                aria-pressed={previewed}
                className="blueprint-preview-button"
                data-testid={`beat-blueprint-select-${blueprint.id}`}
                onClick={() => onPreview(blueprint.id)}
                title={`Preview ${blueprint.name} blueprint`}
                type="button"
              >
                <span>{blueprint.name}</span>
                <strong>{blueprint.focus}</strong>
                <small>
                  {styleName} / {blueprint.key} / {blueprint.bpm} BPM / {arrangementTemplateLabel(blueprint.arrangementTemplate)}
                </small>
              </button>
              <button
                className="blueprint-apply-button"
                data-testid={`beat-blueprint-${blueprint.id}`}
                onClick={() => onApply(blueprint.id)}
                title={`Apply ${blueprint.name} blueprint`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>Apply</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function createBeatBlueprintPreviewDecision(
  previewSummary: BeatBlueprintPreviewSummary,
  styleMatchSummary: BeatBlueprintPreviewSummary,
  styleMatchPreviewed: boolean
): BeatBlueprintPreviewDecision {
  const changedMetrics = previewSummary.metrics.filter((metric) => metric.status === "Change");
  const changedLabels = changedMetrics.map((metric) => metric.label);
  const changedCount = changedMetrics.length;
  const statusLabel =
    changedCount === 0 ? "Blueprint aligned" : styleMatchPreviewed ? "Style match preview" : "Alternate preview";
  const metricLabel =
    changedCount === 0
      ? "No posture changes"
      : `${changedCount} change${changedCount === 1 ? "" : "s"} before Apply`;
  const detailLabel =
    changedCount === 0
      ? "Project already matches this direct beat starter."
      : `${changedLabels.join(" / ")} will update the beat starter.`;
  const actionLabel = styleMatchPreviewed
    ? previewSummary.applyLabel
    : `Compare ${styleMatchSummary.name}`;
  const actionId = styleMatchPreviewed ? "apply-preview" : "preview-style-match";
  const actionBlueprintId = styleMatchPreviewed ? previewSummary.blueprintId : styleMatchSummary.blueprintId;

  return {
    statusLabel,
    blueprintLabel: previewSummary.name,
    metricLabel,
    detailLabel,
    actionId,
    actionBlueprintId,
    actionLabel,
    title: `${statusLabel}: ${previewSummary.name} / ${metricLabel} / ${detailLabel} / ${actionLabel}`,
    tone: changedCount === 0 ? "good" : "warn"
  };
}

export function createBeatBlueprintPreviewCue(
  previewSummary: BeatBlueprintPreviewSummary,
  styleMatchSummary: BeatBlueprintPreviewSummary,
  styleMatchPreviewed: boolean
): BeatBlueprintPreviewCue {
  const changedMetrics = previewSummary.metrics.filter((metric) => metric.status === "Change");
  const changedLabels = changedMetrics.map((metric) => metric.label);
  const changedCount = changedMetrics.length;
  const changeScope = changedCount === 0 ? "current starter" : changedLabels.join(" / ");
  const statusLabel = changedCount === 0 ? "Aligned cue" : styleMatchPreviewed ? "Style-fit cue" : "Compare cue";
  const cueLabel =
    changedCount === 0
      ? "Play the loop before Reapply"
      : `Listen for ${changeScope}`;
  const detailLabel =
    changedCount === 0
      ? "Preview keeps style, key, tempo, arrangement, sound, and master posture."
      : styleMatchPreviewed
        ? "Approve only if the previewed starter posture fits this beat direction."
        : `Compare against ${styleMatchSummary.name} before Apply.`;
  const nextCheckLabel =
    changedCount === 0
      ? "Next: keep composing or reapply intentionally."
      : "Next: apply only after the metrics fit the session.";
  const songCueRecommended =
    changedCount === 0 ||
    changedMetrics.some((metric) => metric.id === "arrangement" || metric.id === "master");
  const actionId = songCueRecommended ? "cue-song" : "cue-pattern";
  const actionLoopScope = songCueRecommended ? "arrangement" : "pattern";
  const actionLabel = songCueRecommended ? "Cue Song" : "Cue Pattern";

  return {
    statusLabel,
    cueLabel,
    detailLabel,
    nextCheckLabel,
    actionId,
    actionLoopScope,
    actionLabel,
    title: `${statusLabel}: ${cueLabel} / ${detailLabel} / ${nextCheckLabel}`,
    tone: changedCount === 0 ? "good" : "warn"
  };
}

export function BeatBlueprintResultStrip({ result }: { result: BeatBlueprintResult }): ReactElement {
  return (
    <div
      className={`blueprint-result ${result.tone}`}
      data-result-blueprint={result.blueprintId}
      data-testid="beat-blueprint-result"
      aria-live="polite"
    >
      <div className="blueprint-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="beat-blueprint-result-title">{result.title}</strong>
          <small data-testid="beat-blueprint-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="blueprint-result-meta">
        <span data-testid="beat-blueprint-result-status">{result.status}</span>
        <span data-testid="beat-blueprint-result-scope">{result.scope}</span>
        <span data-testid="beat-blueprint-result-impact">{result.impact}</span>
      </div>
      <div className="blueprint-result-metrics" data-testid="beat-blueprint-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`beat-blueprint-result-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="blueprint-result-followup" data-testid="beat-blueprint-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="beat-blueprint-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="beat-blueprint-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function PatternDna({
  summary,
  focusedCardId,
  result,
  onFocus
}: {
  summary: PatternDnaSummary;
  focusedCardId: PatternDnaCardId | null;
  result: PatternDnaFocusResult | null;
  onFocus: (card: PatternDnaCard) => void;
}): ReactElement {
  const focusSummary = createPatternDnaFocusSummary(summary, focusedCardId);

  return (
    <section className={`pattern-dna ${summary.tone}`} data-testid="pattern-dna" aria-label="Pattern DNA">
      <div className="pattern-dna-heading">
        <div>
          <Music2 size={15} aria-hidden="true" />
          <span data-testid="pattern-dna-slot">Pattern {summary.slot} DNA</span>
        </div>
        <strong data-testid="pattern-dna-headline">{summary.headline}</strong>
        <small data-testid="pattern-dna-detail">{summary.detail}</small>
      </div>
      <div className={`pattern-dna-focus-readout ${focusSummary.tone}`} data-testid="pattern-dna-focus-readout" title={focusSummary.detailTitle}>
        <span data-testid="pattern-dna-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="pattern-dna-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="pattern-dna-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      <div className="pattern-dna-grid" data-testid="pattern-dna-grid">
        {summary.cards.map((card) => {
          const focused = focusedCardId !== null && card.id === focusedCardId;
          return (
            <div
              className={["pattern-dna-card", card.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`pattern-dna-${card.id}`}
              key={card.id}
            >
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <button
                aria-pressed={focused}
                className="pattern-dna-focus-button"
                data-testid={`pattern-dna-focus-${card.id}`}
                onClick={() => onFocus(card)}
                title={`Focus ${card.focusLabel}: ${card.value}`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{card.focusLabel}</span>
              </button>
              <small>{card.detail}</small>
            </div>
          );
        })}
      </div>
      {result && <PatternDnaFocusResultStrip result={result} />}
    </section>
  );
}

export function PatternDnaFocusResultStrip({ result }: { result: PatternDnaFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`pattern-dna-result ${result.tone}`}
      data-result-pattern-dna={result.cardId}
      data-testid="pattern-dna-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="pattern-dna-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="pattern-dna-result-title">{result.title}</strong>
          <small data-testid="pattern-dna-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="pattern-dna-result-metric" data-testid="pattern-dna-result-metric">
        <span data-testid="pattern-dna-result-status">{result.status}</span>
        <strong data-testid="pattern-dna-result-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="pattern-dna-result-followup" data-testid="pattern-dna-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function ArrangementTemplateControls({
  onApply,
  preview,
  result
}: {
  onApply: (template: ArrangementTemplateId) => void;
  preview: ArrangementTemplatePreviewSummary;
  result: ArrangementTemplateResultSummary | null;
}): ReactElement {
  const decision = createArrangementTemplatePreviewDecision(preview);

  return (
    <section className="arrangement-template-panel" data-testid="arrangement-template-panel" aria-label="Arrangement templates">
      <div
        className={`arrangement-template-preview ${preview.tone}`}
        data-preview-arrangement-template={preview.templateId}
        data-testid="arrangement-template-preview"
        title={preview.detailTitle}
      >
        <span data-testid="arrangement-template-preview-status">{preview.statusLabel}</span>
        <strong data-testid="arrangement-template-preview-template">{preview.templateLabel}</strong>
        <small data-testid="arrangement-template-preview-sections">{preview.sectionLabel}</small>
        <small data-testid="arrangement-template-preview-patterns">{preview.patternLabel}</small>
        <small data-testid="arrangement-template-preview-energy">{preview.energyLabel}</small>
        <small data-testid="arrangement-template-preview-moves">{preview.moveLabel}</small>
      </div>
      <ArrangementTemplatePreviewDecision
        summary={decision}
        onApply={() => {
          if (decision.templateId !== "aligned") {
            onApply(decision.templateId);
          }
        }}
      />
      <ArrangementTemplatePriorityReadout summary={createArrangementTemplatePrioritySummary(preview)} onApply={onApply} />
      <div className="arrangement-template-row" aria-label="Arrangement template buttons">
        {arrangementTemplateIds.map((template) => {
          const templateBlocks = createArrangementTemplate(template);
          const templateBars = templateBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
          return (
            <button
              data-testid={`arrangement-template-${template}`}
              key={template}
              onClick={() => onApply(template)}
              title={`Apply ${arrangementTemplateLabel(template)} arrangement`}
              type="button"
            >
              <ArrowRight size={14} aria-hidden="true" />
              <span>{arrangementTemplateLabel(template)}</span>
              <small>{templateBlocks.length} blocks / {barCountLabel(templateBars)}</small>
            </button>
          );
        })}
      </div>
      {result && <ArrangementTemplateResultStrip result={result} />}
    </section>
  );
}

export function ArrangementTemplatePreviewDecision({
  onApply,
  summary
}: {
  onApply: () => void;
  summary: ArrangementTemplatePreviewDecisionSummary;
}): ReactElement {
  return (
    <div
      className={`arrangement-template-priority arrangement-template-decision ${summary.tone}`}
      data-arrangement-template-decision={summary.templateId}
      data-testid="arrangement-template-decision"
      title={summary.detailTitle}
    >
      <span data-testid="arrangement-template-decision-status">{summary.statusLabel}</span>
      <strong data-testid="arrangement-template-decision-template">{summary.templateLabel}</strong>
      <small data-testid="arrangement-template-decision-metric">{summary.metricLabel}</small>
      <small data-testid="arrangement-template-decision-detail">{summary.detailLabel}</small>
      <button
        className="arrangement-template-decision-run"
        data-arrangement-template-decision-action={summary.actionId}
        data-testid="arrangement-template-decision-run"
        disabled={summary.disabled}
        onClick={onApply}
        title={summary.disabled ? "Current arrangement already matches this template" : `Apply ${summary.templateLabel} template`}
        type="button"
      >
        <ListChecks size={12} aria-hidden="true" />
        <span data-testid="arrangement-template-decision-action">{summary.actionLabel}</span>
      </button>
    </div>
  );
}

export function ArrangementTemplatePriorityReadout({
  onApply,
  summary
}: {
  onApply: (template: ArrangementTemplateId) => void;
  summary: ArrangementTemplatePrioritySummary;
}): ReactElement {
  const disabled = summary.templateId === "aligned";
  return (
    <div
      className={`arrangement-template-priority ${summary.tone}`}
      data-arrangement-template-priority={summary.templateId}
      data-testid="arrangement-template-priority"
      title={summary.detailTitle}
    >
      <span data-testid="arrangement-template-priority-status">{summary.statusLabel}</span>
      <strong data-testid="arrangement-template-priority-template">{summary.templateLabel}</strong>
      <small data-testid="arrangement-template-priority-reason">{summary.reasonLabel}</small>
      <small data-testid="arrangement-template-priority-scope">{summary.scopeLabel}</small>
      <small data-testid="arrangement-template-priority-moves">{summary.moveLabel}</small>
      <small data-testid="arrangement-template-priority-next-check">{summary.nextCheckLabel}</small>
      <button
        data-testid="arrangement-template-priority-run"
        disabled={disabled}
        onClick={() => {
          if (summary.templateId !== "aligned") {
            onApply(summary.templateId);
          }
        }}
        title={disabled ? summary.reasonLabel : `Apply ${summary.templateLabel} template`}
        type="button"
      >
        {disabled ? "Aligned" : summary.templateLabel}
      </button>
    </div>
  );
}

export function ArrangementTemplateResultStrip({ result }: { result: ArrangementTemplateResultSummary }): ReactElement {
  return (
    <div
      className={`arrangement-template-result ${result.tone}`}
      data-result-arrangement-template={result.templateId}
      data-testid="arrangement-template-result"
      aria-live="polite"
    >
      <div className="arrangement-template-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="arrangement-template-result-title">{result.title}</strong>
          <small data-testid="arrangement-template-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="arrangement-template-result-meta">
        <span data-testid="arrangement-template-result-status">{result.status}</span>
        <span data-testid="arrangement-template-result-scope">{result.scope}</span>
        <span data-testid="arrangement-template-result-impact">{result.impact}</span>
      </div>
      <div className="arrangement-template-result-metrics" data-testid="arrangement-template-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`arrangement-template-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="arrangement-template-result-followup" data-testid="arrangement-template-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="arrangement-template-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="arrangement-template-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function ArrangementFocusPanel({
  onApply,
  preview,
  result,
  summary
}: {
  onApply: (preset: ArrangementFocusPresetId) => void;
  preview: ArrangementFocusPreviewSummary | null;
  result: ArrangementFocusResultSummary | null;
  summary: ArrangementFocusSummary | null;
}): ReactElement | null {
  if (!summary || !preview) {
    return null;
  }

  const decisionSummary = createArrangementFocusPreviewDecision(preview);
  const prioritySummary = createArrangementFocusPrioritySummary(summary, preview);
  const priorityActionDisabled = prioritySummary.statusLabel === "Focus aligned";

  return (
    <section className="arrangement-focus" data-testid="arrangement-focus" aria-label="Arrangement focus">
      <div className="arrangement-focus-summary">
        <span>Focus</span>
        <strong data-testid="arrangement-focus-summary">
          Block {summary.blockNumber} / {summary.section} / Pattern {summary.pattern}
        </strong>
        <small>
          {barCountLabel(summary.bars)} / {Math.round(summary.energy * 100)}% energy / {summary.eventCount} events / {summary.mutedLabel}
        </small>
      </div>
      <div
        className={`arrangement-focus-preview ${preview.tone}`}
        data-preview-arrangement-focus={preview.presetId}
        data-testid="arrangement-focus-preview"
        title={preview.detailTitle}
      >
        <span data-testid="arrangement-focus-preview-status">{preview.statusLabel}</span>
        <strong data-testid="arrangement-focus-preview-preset">{preview.presetLabel}</strong>
        <small data-testid="arrangement-focus-preview-block">{preview.blockLabel}</small>
        <small data-testid="arrangement-focus-preview-section">{preview.sectionLabel}</small>
        <small data-testid="arrangement-focus-preview-energy">{preview.energyLabel}</small>
        <small data-testid="arrangement-focus-preview-mutes">{preview.muteLabel}</small>
        <small data-testid="arrangement-focus-preview-moves">{preview.moveLabel}</small>
      </div>
      <ArrangementFocusPreviewDecision
        summary={decisionSummary}
        onApply={() => {
          if (!decisionSummary.disabled) {
            onApply(decisionSummary.targetPresetId);
          }
        }}
      />
      <div
        className={`arrangement-focus-priority ${prioritySummary.tone}`}
        data-arrangement-focus-priority={prioritySummary.presetId}
        data-testid="arrangement-focus-priority"
        title={prioritySummary.detailTitle}
      >
        <span data-testid="arrangement-focus-priority-status">{prioritySummary.statusLabel}</span>
        <strong data-testid="arrangement-focus-priority-preset">{prioritySummary.presetLabel}</strong>
        <small data-testid="arrangement-focus-priority-reason">{prioritySummary.reasonLabel}</small>
        <small data-testid="arrangement-focus-priority-scope">{prioritySummary.scopeLabel}</small>
        <small data-testid="arrangement-focus-priority-next-check">{prioritySummary.nextCheckLabel}</small>
        <button
          data-testid="arrangement-focus-priority-run"
          disabled={priorityActionDisabled}
          onClick={() => {
            if (!priorityActionDisabled) {
              onApply(prioritySummary.presetId);
            }
          }}
          title={priorityActionDisabled ? prioritySummary.reasonLabel : `Apply ${prioritySummary.presetLabel} focus`}
          type="button"
        >
          {priorityActionDisabled ? "Aligned" : prioritySummary.presetLabel}
        </button>
      </div>
      <div className="arrangement-focus-actions">
        {arrangementFocusPresets.map((preset) => (
          <button
            className={summary.suggestedPreset === preset.id ? "suggested" : ""}
            data-testid={`arrangement-focus-${preset.id}`}
            key={preset.id}
            onClick={() => onApply(preset.id)}
            title={`${preset.label}: ${preset.detail}`}
            type="button"
          >
            <Waves size={14} aria-hidden="true" />
            <span>{preset.label}</span>
            <small>
              Pattern {preset.pattern} / {barCountLabel(preset.bars)} / {Math.round(preset.energy * 100)}%
            </small>
          </button>
        ))}
      </div>
      {result && <ArrangementFocusResultStrip result={result} />}
    </section>
  );
}

export function ArrangementFocusPreviewDecision({
  onApply,
  summary
}: {
  onApply: () => void;
  summary: ArrangementFocusPreviewDecisionSummary;
}): ReactElement {
  return (
    <div
      className={`arrangement-focus-priority arrangement-focus-decision ${summary.tone}`}
      data-arrangement-focus-decision={summary.targetPresetId}
      data-testid="arrangement-focus-decision"
      title={summary.detailTitle}
    >
      <span data-testid="arrangement-focus-decision-status">{summary.statusLabel}</span>
      <strong data-testid="arrangement-focus-decision-preset">{summary.presetLabel}</strong>
      <small data-testid="arrangement-focus-decision-metric">{summary.metricLabel}</small>
      <small data-testid="arrangement-focus-decision-detail">{summary.detailLabel}</small>
      <button
        className="arrangement-focus-decision-run"
        data-arrangement-focus-decision-action={summary.actionId}
        data-testid="arrangement-focus-decision-run"
        disabled={summary.disabled}
        onClick={onApply}
        title={summary.disabled ? "Selected block already matches this focus preset" : `Apply ${summary.presetLabel} focus`}
        type="button"
      >
        <ListChecks size={12} aria-hidden="true" />
        <span data-testid="arrangement-focus-decision-label">{summary.buttonLabel}</span>
      </button>
    </div>
  );
}

export function ArrangementFocusResultStrip({ result }: { result: ArrangementFocusResultSummary }): ReactElement {
  return (
    <div
      className={`arrangement-focus-result ${result.tone}`}
      data-result-arrangement-focus={result.presetId}
      data-testid="arrangement-focus-result"
      aria-live="polite"
    >
      <div className="arrangement-focus-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="arrangement-focus-result-title">{result.title}</strong>
          <small data-testid="arrangement-focus-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="arrangement-focus-result-meta">
        <span data-testid="arrangement-focus-result-status">{result.status}</span>
        <span data-testid="arrangement-focus-result-scope">{result.scope}</span>
        <span data-testid="arrangement-focus-result-impact">{result.impact}</span>
      </div>
      <div className="arrangement-focus-result-metrics" data-testid="arrangement-focus-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`arrangement-focus-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="arrangement-focus-result-followup" data-testid="arrangement-focus-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="arrangement-focus-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="arrangement-focus-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function ArrangementArcPads({
  pads,
  preview,
  result,
  onApply
}: {
  pads: ArrangementArcPadOption[];
  preview: ArrangementArcPreviewSummary;
  result: ArrangementArcResultSummary | null;
  onApply: (pad: ArrangementArcPadId) => void;
}): ReactElement {
  return (
    <section className="arrangement-arc" data-testid="arrangement-arc-pads" aria-label="Arrangement Arc Pads">
      <div className="arrangement-arc-heading">
        <span>Arc</span>
        <strong>Song energy</strong>
      </div>
      <div
        className={`arrangement-arc-preview ${preview.tone}`}
        data-preview-arrangement-arc={preview.padId}
        data-testid="arrangement-arc-preview"
        title={preview.detailTitle}
      >
        <span data-testid="arrangement-arc-preview-status">{preview.statusLabel}</span>
        <strong data-testid="arrangement-arc-preview-pad">{preview.padLabel}</strong>
        <small data-testid="arrangement-arc-preview-sections">{preview.sectionLabel}</small>
        <small data-testid="arrangement-arc-preview-patterns">{preview.patternLabel}</small>
        <small data-testid="arrangement-arc-preview-energy">{preview.energyLabel}</small>
        <small data-testid="arrangement-arc-preview-mutes">{preview.muteLabel}</small>
        <small data-testid="arrangement-arc-preview-moves">{preview.moveLabel}</small>
      </div>
      <ArrangementArcPreviewDecision summary={createArrangementArcPreviewDecision(preview)} onApply={onApply} />
      <ArrangementArcPriorityReadout summary={createArrangementArcPrioritySummary(preview)} onApply={onApply} />
      <div className="arrangement-arc-row">
        {pads.map((pad) => (
          <button
            data-testid={`arrangement-arc-${pad.id}`}
            key={pad.id}
            onClick={() => onApply(pad.id)}
            title={`${pad.label}: ${pad.detail}`}
            type="button"
          >
            <Waves size={14} aria-hidden="true" />
            <span>{pad.label}</span>
            <strong>{pad.preview}</strong>
            <small>{pad.changedCount} blocks / {pad.detail}</small>
          </button>
        ))}
      </div>
      {result && <ArrangementArcResultStrip result={result} />}
    </section>
  );
}

export function ArrangementArcPreviewDecision({
  onApply,
  summary
}: {
  onApply: (pad: ArrangementArcPadId) => void;
  summary: ArrangementArcPreviewDecisionSummary;
}): ReactElement {
  return (
    <div
      className={`arrangement-arc-priority arrangement-arc-decision ${summary.tone}`}
      data-arrangement-arc-decision={summary.targetPadId}
      data-testid="arrangement-arc-decision"
      title={summary.detailTitle}
    >
      <span data-testid="arrangement-arc-decision-status">{summary.statusLabel}</span>
      <strong data-testid="arrangement-arc-decision-pad">{summary.padLabel}</strong>
      <small data-testid="arrangement-arc-decision-metric">{summary.metricLabel}</small>
      <small data-testid="arrangement-arc-decision-detail">{summary.detailLabel}</small>
      <button
        className="arrangement-arc-decision-run"
        data-arrangement-arc-decision-action={summary.actionId}
        data-testid="arrangement-arc-decision-run"
        disabled={summary.disabled}
        onClick={() => {
          if (!summary.disabled) {
            onApply(summary.targetPadId);
          }
        }}
        title={summary.disabled ? "Current arrangement already matches this arc" : `Apply ${summary.padLabel} arc`}
        type="button"
      >
        <ListChecks size={12} aria-hidden="true" />
        <span data-testid="arrangement-arc-decision-label">{summary.buttonLabel}</span>
      </button>
    </div>
  );
}

export function ArrangementMovePriorityReadout({
  onApply,
  summary
}: {
  onApply: (preset: ArrangementMovePreset) => void;
  summary: ArrangementMovePrioritySummary;
}): ReactElement {
  const disabled = summary.presetId === "none";
  return (
    <div
      className={`arrangement-move-priority ${summary.tone}`}
      data-arrangement-move-priority={summary.presetId}
      data-testid="arrangement-move-priority"
      title={summary.detailTitle}
    >
      <span data-testid="arrangement-move-priority-status">{summary.statusLabel}</span>
      <strong data-testid="arrangement-move-priority-preset">{summary.presetLabel}</strong>
      <small data-testid="arrangement-move-priority-reason">{summary.reasonLabel}</small>
      <small data-testid="arrangement-move-priority-scope">{summary.scopeLabel}</small>
      <small data-testid="arrangement-move-priority-impact">{summary.impactLabel}</small>
      <small data-testid="arrangement-move-priority-next-check">{summary.nextCheckLabel}</small>
      <button
        data-testid="arrangement-move-priority-run"
        disabled={disabled}
        onClick={() => {
          if (summary.presetId !== "none") {
            onApply(summary.presetId);
          }
        }}
        title={disabled ? summary.reasonLabel : `Apply ${summary.presetLabel} move`}
        type="button"
      >
        {disabled ? "Select Block" : summary.presetLabel}
      </button>
    </div>
  );
}

export function ArrangementMovePreviewDecision({
  onApply,
  summary
}: {
  onApply: () => void;
  summary: ArrangementMovePreviewDecisionSummary;
}): ReactElement {
  return (
    <div
      className={`arrangement-move-priority arrangement-move-decision ${summary.tone}`}
      data-arrangement-move-decision={summary.targetPresetId}
      data-testid="arrangement-move-decision"
      title={summary.detailTitle}
    >
      <span data-testid="arrangement-move-decision-status">{summary.statusLabel}</span>
      <strong data-testid="arrangement-move-decision-preset">{summary.presetLabel}</strong>
      <small data-testid="arrangement-move-decision-metric">{summary.metricLabel}</small>
      <small data-testid="arrangement-move-decision-detail">{summary.detailLabel}</small>
      <button
        className="arrangement-move-decision-run"
        data-arrangement-move-decision-action={summary.actionId}
        data-testid="arrangement-move-decision-run"
        disabled={summary.disabled}
        onClick={onApply}
        title={summary.disabled ? summary.detailLabel : `Apply ${summary.presetLabel} move`}
        type="button"
      >
        <ListChecks size={12} aria-hidden="true" />
        <span data-testid="arrangement-move-decision-label">{summary.buttonLabel}</span>
      </button>
    </div>
  );
}

export function ArrangementMoveResultStrip({ result }: { result: ArrangementMoveResultSummary }): ReactElement {
  return (
    <div
      className={`arrangement-move-result ${result.tone}`}
      data-result-arrangement-move={result.presetId}
      data-testid="arrangement-move-result"
      aria-live="polite"
    >
      <div className="arrangement-move-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="arrangement-move-result-title">{result.title}</strong>
          <small data-testid="arrangement-move-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="arrangement-move-result-meta">
        <span data-testid="arrangement-move-result-status">{result.status}</span>
        <span data-testid="arrangement-move-result-scope">{result.scope}</span>
        <span data-testid="arrangement-move-result-impact">{result.impact}</span>
      </div>
      <div className="arrangement-move-result-metrics" data-testid="arrangement-move-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`arrangement-move-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="arrangement-move-result-followup" data-testid="arrangement-move-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="arrangement-move-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="arrangement-move-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function SelectedBlockEditPriorityReadout({
  onRun,
  summary
}: {
  onRun: (actionId: SelectedBlockEditPrioritySummary["actionId"]) => void;
  summary: SelectedBlockEditPrioritySummary;
}): ReactElement {
  const disabled = summary.actionId === "none";
  return (
    <div
      className={`selected-block-edit-priority ${summary.tone}`}
      data-selected-block-edit-priority={summary.actionId}
      data-testid="selected-block-edit-priority"
      title={summary.detailTitle}
    >
      <span data-testid="selected-block-edit-priority-status">{summary.statusLabel}</span>
      <strong data-testid="selected-block-edit-priority-action">{summary.actionLabel}</strong>
      <small data-testid="selected-block-edit-priority-reason">{summary.reasonLabel}</small>
      <small data-testid="selected-block-edit-priority-scope">{summary.scopeLabel}</small>
      <small data-testid="selected-block-edit-priority-impact">{summary.impactLabel}</small>
      <small data-testid="selected-block-edit-priority-next-check">{summary.nextCheckLabel}</small>
      <button
        data-testid="selected-block-edit-priority-run"
        disabled={disabled}
        onClick={() => onRun(summary.actionId)}
        title={disabled ? summary.reasonLabel : `Run ${summary.actionLabel}`}
        type="button"
      >
        {disabled ? "Select Block" : summary.actionLabel}
      </button>
    </div>
  );
}

export function SelectedBlockEditPreviewDecision({
  onRun,
  summary
}: {
  onRun: (actionId: SelectedBlockEditPrioritySummary["actionId"]) => void;
  summary: SelectedBlockEditPreviewDecisionSummary;
}): ReactElement {
  return (
    <div
      className={`selected-block-edit-priority selected-block-edit-decision ${summary.tone}`}
      data-selected-block-edit-decision={summary.targetActionId}
      data-testid="selected-block-edit-decision"
      title={summary.detailTitle}
    >
      <span data-testid="selected-block-edit-decision-status">{summary.statusLabel}</span>
      <strong data-testid="selected-block-edit-decision-action">{summary.actionLabel}</strong>
      <small data-testid="selected-block-edit-decision-metric">{summary.metricLabel}</small>
      <small data-testid="selected-block-edit-decision-detail">{summary.detailLabel}</small>
      <button
        className="selected-block-edit-decision-run"
        data-selected-block-edit-decision-action={summary.actionId}
        data-testid="selected-block-edit-decision-run"
        disabled={summary.disabled}
        onClick={() => onRun(summary.targetActionId)}
        title={summary.disabled ? summary.detailLabel : `Run ${summary.actionLabel}`}
        type="button"
      >
        <ListChecks size={12} aria-hidden="true" />
        <span data-testid="selected-block-edit-decision-label">{summary.buttonLabel}</span>
      </button>
    </div>
  );
}

export function SelectedBlockEditResultStrip({ result }: { result: SelectedBlockEditResultSummary }): ReactElement {
  return (
    <div
      className={`selected-block-edit-result ${result.tone}`}
      data-result-selected-block-edit={result.actionId}
      data-testid="selected-block-edit-result"
      aria-live="polite"
    >
      <div className="selected-block-edit-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="selected-block-edit-result-title">{result.title}</strong>
          <small data-testid="selected-block-edit-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="selected-block-edit-result-meta">
        <span data-testid="selected-block-edit-result-status">{result.status}</span>
        <span data-testid="selected-block-edit-result-scope">{result.scope}</span>
        <span data-testid="selected-block-edit-result-impact">{result.impact}</span>
      </div>
      <div className="selected-block-edit-result-metrics" data-testid="selected-block-edit-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`selected-block-edit-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="selected-block-edit-result-followup" data-testid="selected-block-edit-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="selected-block-edit-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="selected-block-edit-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function ArrangementArcPriorityReadout({
  onApply,
  summary
}: {
  onApply: (pad: ArrangementArcPadId) => void;
  summary: ArrangementArcPrioritySummary;
}): ReactElement {
  const disabled = summary.statusLabel === "Arc aligned";
  return (
    <div
      className={`arrangement-arc-priority ${summary.tone}`}
      data-arrangement-arc-priority={summary.padId}
      data-testid="arrangement-arc-priority"
      title={summary.detailTitle}
    >
      <span data-testid="arrangement-arc-priority-status">{summary.statusLabel}</span>
      <strong data-testid="arrangement-arc-priority-pad">{summary.padLabel}</strong>
      <small data-testid="arrangement-arc-priority-reason">{summary.reasonLabel}</small>
      <small data-testid="arrangement-arc-priority-scope">{summary.scopeLabel}</small>
      <small data-testid="arrangement-arc-priority-moves">{summary.moveLabel}</small>
      <small data-testid="arrangement-arc-priority-next-check">{summary.nextCheckLabel}</small>
      <button
        data-testid="arrangement-arc-priority-run"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            onApply(summary.padId);
          }
        }}
        title={disabled ? summary.reasonLabel : `Apply ${summary.padLabel} arc`}
        type="button"
      >
        {disabled ? "Aligned" : summary.padLabel}
      </button>
    </div>
  );
}

export function ArrangementArcResultStrip({ result }: { result: ArrangementArcResultSummary }): ReactElement {
  return (
    <div
      className={`arrangement-arc-result ${result.tone}`}
      data-result-arrangement-arc={result.padId}
      data-testid="arrangement-arc-result"
      aria-live="polite"
    >
      <div className="arrangement-arc-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="arrangement-arc-result-title">{result.title}</strong>
          <small data-testid="arrangement-arc-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="arrangement-arc-result-meta">
        <span data-testid="arrangement-arc-result-status">{result.status}</span>
        <span data-testid="arrangement-arc-result-scope">{result.scope}</span>
        <span data-testid="arrangement-arc-result-impact">{result.impact}</span>
      </div>
      <div className="arrangement-arc-result-metrics" data-testid="arrangement-arc-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`arrangement-arc-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="arrangement-arc-result-followup" data-testid="arrangement-arc-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="arrangement-arc-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="arrangement-arc-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function PatternChainPreview({ preview }: { preview: PatternChainPreviewSummary }): ReactElement {
  return (
    <div
      className={`pattern-chain-preview ${preview.tone}`}
      data-preview-pattern-chain={preview.actionId}
      data-testid="pattern-chain-preview"
      title={preview.detailTitle}
    >
      <span data-testid="pattern-chain-preview-status">{preview.statusLabel}</span>
      <strong data-testid="pattern-chain-preview-action">{preview.actionLabel}</strong>
      <small data-testid="pattern-chain-preview-sequence">{preview.sequenceLabel}</small>
      <small data-testid="pattern-chain-preview-sections">{preview.sectionLabel}</small>
      <small data-testid="pattern-chain-preview-energy">{preview.energyLabel}</small>
      <small data-testid="pattern-chain-preview-moves">{preview.moveLabel}</small>
    </div>
  );
}

export function PatternChainPreviewDecision({
  onRun,
  summary
}: {
  onRun: (actionId: PatternChainPreviewSummary["actionId"]) => void;
  summary: PatternChainPreviewDecisionSummary;
}): ReactElement {
  return (
    <div
      className={`pattern-chain-priority pattern-chain-decision ${summary.tone}`}
      data-pattern-chain-decision={summary.targetActionId}
      data-testid="pattern-chain-decision"
      title={summary.detailTitle}
    >
      <span data-testid="pattern-chain-decision-status">{summary.statusLabel}</span>
      <strong data-testid="pattern-chain-decision-action">{summary.actionLabel}</strong>
      <small data-testid="pattern-chain-decision-metric">{summary.metricLabel}</small>
      <small data-testid="pattern-chain-decision-detail">{summary.detailLabel}</small>
      <button
        className="pattern-chain-decision-run"
        data-pattern-chain-decision-action={summary.actionId}
        data-testid="pattern-chain-decision-run"
        disabled={summary.disabled}
        onClick={() => {
          if (!summary.disabled) {
            onRun(summary.targetActionId);
          }
        }}
        title={summary.disabled ? "Current arrangement already matches this chain" : `Run ${summary.actionLabel}`}
        type="button"
      >
        <ListChecks size={12} aria-hidden="true" />
        <span data-testid="pattern-chain-decision-label">{summary.buttonLabel}</span>
      </button>
    </div>
  );
}

export function PatternChainPriorityReadout({
  onRun,
  summary
}: {
  onRun: (actionId: PatternChainPrioritySummary["actionId"]) => void;
  summary: PatternChainPrioritySummary;
}): ReactElement {
  const disabled = summary.actionId === "aligned";
  return (
    <div
      className={`pattern-chain-priority ${summary.tone}`}
      data-pattern-chain-priority={summary.actionId}
      data-testid="pattern-chain-priority"
      title={summary.detailTitle}
    >
      <span data-testid="pattern-chain-priority-status">{summary.statusLabel}</span>
      <strong data-testid="pattern-chain-priority-action">{summary.actionLabel}</strong>
      <small data-testid="pattern-chain-priority-reason">{summary.reasonLabel}</small>
      <small data-testid="pattern-chain-priority-scope">{summary.scopeLabel}</small>
      <small data-testid="pattern-chain-priority-next-check">{summary.nextCheckLabel}</small>
      <button
        data-testid="pattern-chain-priority-run"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            onRun(summary.actionId);
          }
        }}
        title={disabled ? summary.reasonLabel : `Run ${summary.actionLabel}`}
        type="button"
      >
        {disabled ? "Aligned" : summary.actionLabel}
      </button>
    </div>
  );
}

export function PatternChainResultStrip({ result }: { result: PatternChainResultSummary }): ReactElement {
  return (
    <div
      className={`pattern-chain-result ${result.tone}`}
      data-result-pattern-chain={result.actionId}
      data-testid="pattern-chain-result"
      aria-live="polite"
    >
      <div className="pattern-chain-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="pattern-chain-result-title">{result.title}</strong>
          <small data-testid="pattern-chain-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="pattern-chain-result-meta">
        <span data-testid="pattern-chain-result-status">{result.status}</span>
        <span data-testid="pattern-chain-result-scope">{result.scope}</span>
        <span data-testid="pattern-chain-result-impact">{result.impact}</span>
      </div>
      <div className="pattern-chain-result-metrics" data-testid="pattern-chain-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`pattern-chain-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="pattern-chain-result-followup" data-testid="pattern-chain-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="pattern-chain-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="pattern-chain-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function SectionLocatorPads({
  disabled,
  onCue,
  pads,
  result
}: {
  disabled: boolean;
  onCue: (section: ArrangementSection) => void;
  pads: SectionLocatorPad[];
  result: SectionCueResult | null;
}): ReactElement {
  const prioritySummary = createSectionLocatorPrioritySummary(pads);
  const cueDecision = createSectionLocatorCueDecisionSummary(pads, disabled);
  const priorityActionDisabled = disabled || prioritySummary.section === null;
  const priorityActionTitle = disabled
    ? "Stop playback before cueing a section"
    : prioritySummary.section
      ? `Cue ${prioritySummary.section} section`
      : prioritySummary.reasonLabel;

  return (
    <section className="section-locator" data-testid="section-locator-pads" aria-label="Section Locator Pads">
      <div className="section-locator-heading">
        <span>Locator</span>
        <strong>Section cue</strong>
      </div>
      <div
        className={`section-locator-priority ${prioritySummary.tone}`}
        data-section-locator-priority={prioritySummary.section ? sectionLocatorTestId(prioritySummary.section) : "none"}
        data-testid="section-locator-priority"
        title={prioritySummary.detailTitle}
      >
        <span data-testid="section-locator-priority-status">{prioritySummary.statusLabel}</span>
        <strong data-testid="section-locator-priority-section">{prioritySummary.sectionLabel}</strong>
        <small data-testid="section-locator-priority-reason">{prioritySummary.reasonLabel}</small>
        <small data-testid="section-locator-priority-next-check">{prioritySummary.nextCheckLabel}</small>
        <button
          data-testid="section-locator-priority-run"
          disabled={priorityActionDisabled}
          onClick={() => {
            if (!priorityActionDisabled && prioritySummary.section) {
              onCue(prioritySummary.section);
            }
          }}
          title={priorityActionTitle}
          type="button"
        >
          {prioritySummary.section ? `Cue ${prioritySummary.section}` : "No cue"}
        </button>
      </div>
      <SectionLocatorCueDecision summary={cueDecision} onCue={onCue} />
      {result && <SectionCueResultStrip result={result} />}
      <div className="section-locator-row">
        {pads.map((pad) => {
          const missing = pad.index === null;
          const disabledPad = disabled || missing;
          const rangeLabel =
            pad.startBar === null || pad.endBar === null
              ? "Missing"
              : pad.startBar === pad.endBar
                ? `Bar ${pad.startBar}`
                : `Bars ${pad.startBar}-${pad.endBar}`;
          return (
            <button
              aria-pressed={pad.selected}
              className={[pad.tone, pad.selected ? "selected" : "", pad.playing ? "playing" : "", missing ? "missing" : ""]
                .filter(Boolean)
                .join(" ")}
              data-playing={pad.playing ? "true" : "false"}
              data-testid={`section-locator-${sectionLocatorTestId(pad.section)}`}
              disabled={disabledPad}
              key={pad.section}
              onClick={() => onCue(pad.section)}
              title={
                missing
                  ? `${pad.section} section is not in the arrangement`
                  : `Cue ${pad.section} as Block loop: Pattern ${pad.pattern}, ${rangeLabel}`
              }
              type="button"
            >
              <span>{pad.section}</span>
              <strong>{missing ? "Missing" : `Pattern ${pad.pattern}`}</strong>
              <small>{missing ? "Add section" : `${rangeLabel} / ${Math.round(pad.energy * 100)}% / ${pad.eventCount} events`}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function SectionCueResultStrip({ result }: { result: SectionCueResult }): ReactElement {
  return (
    <div
      className={`quick-action-result section-cue-result ${result.tone}`}
      data-result-section-cue={result.targetId}
      data-section-cue-source={result.source}
      data-testid="section-cue-result"
      aria-live="polite"
    >
      <div className="quick-action-result-main">
        <span data-testid="section-cue-result-status">{result.status}</span>
        <strong data-testid="section-cue-result-title">{result.title}</strong>
        <small data-testid="section-cue-result-detail">{result.detail}</small>
      </div>
      <div className={`quick-action-result-metric ${result.tone}`} data-testid="section-cue-result-metric">
        <span data-testid="section-cue-result-pattern">{result.patternLabel}</span>
        <strong data-testid="section-cue-result-metric-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="quick-action-result-followup" data-testid="section-cue-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="section-cue-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="section-cue-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function SectionLocatorCueDecision({
  onCue,
  summary
}: {
  onCue: (section: ArrangementSection) => void;
  summary: SectionLocatorCueDecisionSummary;
}): ReactElement {
  return (
    <div
      className={`section-locator-priority section-locator-decision ${summary.tone}`}
      data-section-locator-decision={summary.section ? sectionLocatorTestId(summary.section) : "none"}
      data-testid="section-locator-decision"
      title={summary.detailTitle}
    >
      <span data-testid="section-locator-decision-status">{summary.statusLabel}</span>
      <strong data-testid="section-locator-decision-section">{summary.sectionLabel}</strong>
      <small data-testid="section-locator-decision-metric">{summary.metricLabel}</small>
      <small data-testid="section-locator-decision-detail">{summary.detailLabel}</small>
      <button
        className="section-locator-decision-run"
        data-section-locator-decision-action={summary.actionId}
        data-testid="section-locator-decision-run"
        disabled={summary.disabled}
        onClick={() => {
          if (!summary.disabled && summary.section) {
            onCue(summary.section);
          }
        }}
        title={summary.disabled ? summary.detailLabel : `Cue ${summary.section} section`}
        type="button"
      >
        <ListChecks size={12} aria-hidden="true" />
        <span className="section-locator-decision-label" data-testid="section-locator-decision-label">
          {summary.buttonLabel}
        </span>
      </button>
    </div>
  );
}

export function DeliveryTargets({
  onApply,
  onCustomChange,
  onSelect,
  project,
  result
}: {
  onApply: (targetId: DeliveryTargetId) => void;
  onCustomChange: (update: Partial<CustomDeliveryTarget>) => void;
  onSelect: (targetId: DeliveryTargetId) => void;
  project: ProjectState;
  result: DeliveryTargetAlignmentResult | null;
}): ReactElement {
  const currentTarget = activeDeliveryTarget(project);
  const customTarget = deliveryTargetForId("custom", project.customDeliveryTarget);
  const customSelected = project.deliveryTarget === "custom";
  const customAligned = isDeliveryTargetAligned(project, customTarget);
  const customName = project.customDeliveryTarget.name || defaultCustomDeliveryTarget.name;
  const customFocus = project.customDeliveryTarget.focus || defaultCustomDeliveryTarget.focus;
  const alignmentPreview = createDeliveryTargetAlignmentPreview(project, currentTarget);
  return (
    <section className="delivery-target-row" data-testid="delivery-targets" aria-label="Delivery targets">
      <div className="delivery-target-heading">
        <div>
          <Gauge size={17} aria-hidden="true" />
          <span>Delivery Target</span>
        </div>
        <strong data-testid="delivery-target-current">{currentTarget.name}</strong>
        <small>{barCountLabel(currentTarget.targetBars)} / {currentTarget.stemGoal} stems</small>
      </div>
      <div className="delivery-target-stack">
        <div
          aria-label={alignmentPreview.detailTitle}
          className={`delivery-target-preview ${alignmentPreview.tone}`}
          data-preview-target={alignmentPreview.targetId}
          data-testid="delivery-target-preview"
          title={alignmentPreview.detailTitle}
        >
          <span data-testid="delivery-target-preview-status">{alignmentPreview.statusLabel}</span>
          <strong data-testid="delivery-target-preview-target">{alignmentPreview.targetLabel}</strong>
          <small data-testid="delivery-target-preview-length">{alignmentPreview.lengthLabel}</small>
          <small data-testid="delivery-target-preview-master">{alignmentPreview.masterLabel}</small>
          <small data-testid="delivery-target-preview-mix">{alignmentPreview.mixLabel}</small>
          <small data-testid="delivery-target-preview-stems">{alignmentPreview.stemLabel}</small>
        </div>
        {result && <DeliveryTargetAlignmentResultStrip result={result} />}
        <div className="delivery-target-list">
          {deliveryTargets.map((target) => {
            const selected = project.deliveryTarget === target.id;
            const aligned = isDeliveryTargetAligned(project, target);
            return (
              <div className={selected ? "selected" : ""} data-testid={`delivery-target-${target.id}`} key={target.id}>
                <button
                  className="delivery-target-select"
                  data-testid={`delivery-target-set-${target.id}`}
                  onClick={() => onSelect(target.id)}
                  title={`Set ${target.name} target`}
                  type="button"
                >
                  <span>{target.name}</span>
                  <strong>{target.focus}</strong>
                  <small>{arrangementTemplateLabel(target.preferredTemplate)} / {target.preferredMasterPreset}</small>
                </button>
                <button
                  className={aligned ? "delivery-target-align aligned" : "delivery-target-align"}
                  data-testid={`delivery-target-align-${target.id}`}
                  onClick={() => onApply(target.id)}
                  title={`Align project to ${target.name}`}
                  type="button"
                >
                  {aligned ? "Aligned" : "Align"}
                </button>
              </div>
            );
          })}
        </div>
        <div
          className={customSelected ? "custom-delivery-panel selected" : "custom-delivery-panel"}
          data-testid="delivery-target-custom"
        >
          <div className="custom-delivery-copy">
            <span>Custom Target</span>
            <strong>{customTarget.name}</strong>
            <small>{customTarget.focus}</small>
          </div>
          <div className="custom-delivery-fields">
            <label className="custom-delivery-field">
              <span>Name</span>
              <input
                data-testid="custom-target-name"
                maxLength={maxCustomDeliveryTargetNameLength}
                onChange={(event) =>
                  onCustomChange({
                    name: boundedCustomDeliveryText(event.currentTarget.value, maxCustomDeliveryTargetNameLength)
                  })
                }
                value={customName}
              />
            </label>
            <label className="custom-delivery-field wide">
              <span>Focus</span>
              <input
                data-testid="custom-target-focus"
                maxLength={maxCustomDeliveryTargetFocusLength}
                onChange={(event) =>
                  onCustomChange({
                    focus: boundedCustomDeliveryText(event.currentTarget.value, maxCustomDeliveryTargetFocusLength)
                  })
                }
                value={customFocus}
              />
            </label>
            <label className="custom-delivery-field">
              <span>Bars</span>
              <input
                data-testid="custom-target-bars"
                max={maxDeliveryTargetBars}
                min={minDeliveryTargetBars}
                onChange={(event) => onCustomChange({ targetBars: normalizeDeliveryTargetBars(event.currentTarget.valueAsNumber) })}
                type="number"
                value={project.customDeliveryTarget.targetBars}
              />
            </label>
            <label className="custom-delivery-field">
              <span>Stems</span>
              <input
                data-testid="custom-target-stems"
                max={maxDeliveryTargetStemGoal}
                min={minDeliveryTargetStemGoal}
                onChange={(event) => onCustomChange({ stemGoal: normalizeDeliveryTargetStemGoal(event.currentTarget.valueAsNumber) })}
                type="number"
                value={project.customDeliveryTarget.stemGoal}
              />
            </label>
            <label className="custom-delivery-field">
              <span>Template</span>
              <select
                data-testid="custom-target-template"
                onChange={(event) => onCustomChange({ preferredTemplate: event.currentTarget.value as ArrangementTemplateId })}
                value={project.customDeliveryTarget.preferredTemplate}
              >
                {arrangementTemplateIds.map((template) => (
                  <option key={template} value={template}>
                    {arrangementTemplateLabel(template)}
                  </option>
                ))}
              </select>
            </label>
            <label className="custom-delivery-field">
              <span>Master</span>
              <select
                data-testid="custom-target-master"
                onChange={(event) => onCustomChange({ preferredMasterPreset: event.currentTarget.value as MasterPreset })}
                value={project.customDeliveryTarget.preferredMasterPreset}
              >
                {masterPresets.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </label>
            <label className="custom-delivery-field">
              <span>Posture</span>
              <select
                data-testid="custom-target-posture"
                onChange={(event) => onCustomChange({ mixPosture: event.currentTarget.value as MixPosture })}
                value={project.customDeliveryTarget.mixPosture}
              >
                {mixPostureOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="custom-delivery-actions">
            <button
              className="delivery-target-select"
              data-testid="delivery-target-set-custom"
              onClick={() => onSelect("custom")}
              title="Set custom target"
              type="button"
            >
              Set Custom
            </button>
            <button
              className={customAligned ? "delivery-target-align aligned" : "delivery-target-align"}
              data-testid="delivery-target-align-custom"
              onClick={() => onApply("custom")}
              title="Align project to custom target"
              type="button"
            >
              {customAligned ? "Aligned" : "Align"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DeliveryTargetAlignmentResultStrip({ result }: { result: DeliveryTargetAlignmentResult }): ReactElement {
  return (
    <div
      className={`delivery-target-result ${result.tone}`}
      data-result-delivery-target={result.targetId}
      data-testid="delivery-target-result"
      aria-live="polite"
    >
      <div className="delivery-target-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="delivery-target-result-title">{result.title}</strong>
          <small data-testid="delivery-target-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="delivery-target-result-meta">
        <span data-testid="delivery-target-result-status">{result.status}</span>
        <span data-testid="delivery-target-result-scope">{result.scope}</span>
        <span data-testid="delivery-target-result-impact">{result.impact}</span>
      </div>
      <div className="delivery-target-result-metrics" data-testid="delivery-target-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`delivery-target-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="delivery-target-result-followup" data-testid="delivery-target-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="delivery-target-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="delivery-target-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function SessionBriefPanel({
  brief,
  compass,
  compassResult,
  fieldRefs,
  focusedCompassCardId,
  focusedReferenceCardId,
  referenceAlignment,
  referenceAlignmentResult,
  result,
  sectionRef,
  starterPads,
  onApplyStarter,
  onChange,
  onClear,
  onFocusCompass,
  onFocusReferenceAlignment
}: {
  brief: SessionBrief;
  compass: SessionBriefCompassSummary;
  compassResult: SessionBriefCompassFocusResult | null;
  fieldRefs: SessionBriefFieldRefs;
  focusedCompassCardId: SessionBriefCompassCardId | null;
  focusedReferenceCardId: ReferenceAlignmentCardId | null;
  referenceAlignment: ReferenceAlignmentSummary;
  referenceAlignmentResult: ReferenceAlignmentFocusResult | null;
  result: SessionBriefStarterResult | null;
  sectionRef?: Ref<HTMLElement>;
  starterPads: SessionBriefStarterPadOption[];
  onApplyStarter: (pad: SessionBriefStarterPadId) => void;
  onChange: (field: keyof SessionBrief, value: string) => void;
  onClear: () => void;
  onFocusCompass: (card: SessionBriefCompassCard) => void;
  onFocusReferenceAlignment: (card: ReferenceAlignmentCard) => void;
}): ReactElement {
  const filledFields = sessionBriefFilledFields(brief);
  const roleSummary = createSessionBriefRoleSummary(brief);

  return (
    <section className="session-brief-row" data-testid="session-brief" aria-label="Session brief" ref={sectionRef}>
      <div className="session-brief-heading">
        <div>
          <Music2 size={17} aria-hidden="true" />
          <span>Session Brief</span>
        </div>
        <strong data-testid="session-brief-summary">{filledFields}/4 fields</strong>
        <small>{sessionBriefStatus(brief).value}</small>
        <div
          aria-label={roleSummary.detailTitle}
          className={`session-brief-role-readout ${roleSummary.tone}`}
          data-testid="session-brief-role-readout"
          title={roleSummary.detailTitle}
        >
          <span data-testid="session-brief-role-status">{roleSummary.statusLabel}</span>
          <strong data-testid="session-brief-role-label">{roleSummary.roleLabel}</strong>
          <small data-testid="session-brief-role-detail">{roleSummary.detailLabel}</small>
        </div>
      </div>
      <div className="session-brief-body">
        <div
          aria-label={`${compass.headline}: ${compass.detail}`}
          className={`session-brief-compass ${compass.tone}`}
          data-testid="session-brief-compass"
          title={`${compass.headline}: ${compass.detail}`}
        >
          <div className="session-brief-compass-heading">
            <span>Brief Compass</span>
            <strong data-testid="session-brief-compass-headline">{compass.headline}</strong>
            <small data-testid="session-brief-compass-detail">{compass.detail}</small>
          </div>
          <div className="session-brief-compass-grid" data-testid="session-brief-compass-grid">
            {compass.cards.map((card) => {
              const focused = focusedCompassCardId !== null && card.id === focusedCompassCardId;
              const focusLabel = sessionBriefCompassFocusLabel(card, brief);
              return (
                <div
                  className={["session-brief-compass-card", card.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
                  data-focused={focused ? "true" : "false"}
                  data-testid={`session-brief-compass-card-${card.id}`}
                  key={card.id}
                  title={`${card.label}: ${card.value}. ${card.nextCheck}`}
                >
                  <span data-testid={`session-brief-compass-card-${card.id}-label`}>{card.label}</span>
                  <strong data-testid={`session-brief-compass-card-${card.id}-value`}>{card.value}</strong>
                  <button
                    aria-pressed={focused}
                    className="session-brief-compass-focus-button"
                    data-testid={`session-brief-compass-focus-${card.id}`}
                    onClick={() => onFocusCompass(card)}
                    title={`${focusLabel}: ${card.nextCheck}`}
                    type="button"
                  >
                    <Target size={12} aria-hidden="true" />
                    <span>{focusLabel}</span>
                  </button>
                  <small data-testid={`session-brief-compass-card-${card.id}-detail`}>{card.detail}</small>
                  <em data-testid={`session-brief-compass-card-${card.id}-next`}>{card.nextCheck}</em>
                </div>
              );
            })}
          </div>
          {compassResult && <SessionBriefCompassFocusResultStrip result={compassResult} />}
        </div>
        <ReferenceAlignmentReadout
          focusedCardId={focusedReferenceCardId}
          onFocus={onFocusReferenceAlignment}
          result={referenceAlignmentResult}
          summary={referenceAlignment}
        />
        <div className="session-brief-starters" aria-label="Session Brief Starter Pads">
          {starterPads.map((pad) => (
            <button
              data-testid={`session-brief-starter-${pad.id}`}
              key={pad.id}
              onClick={() => onApplyStarter(pad.id)}
              title={`${pad.label}: ${pad.detail}`}
              type="button"
            >
              <ListChecks size={13} aria-hidden="true" />
              <span>{pad.label}</span>
              <strong>{pad.preview}</strong>
              <small>{pad.changedCount} blanks / {pad.detail}</small>
            </button>
          ))}
        </div>
        {result && <SessionBriefStarterResultStrip result={result} />}
        <div className="session-brief-fields">
          <label className="session-brief-field">
            <span>Artist</span>
            <input
              data-testid="session-brief-artist"
              maxLength={maxSessionBriefFieldLength}
              onChange={(event) => onChange("artist", event.target.value)}
              placeholder="Artist or client"
              ref={fieldRefs.artist}
              type="text"
              value={brief.artist}
            />
          </label>
          <label className="session-brief-field">
            <span>Vibe</span>
            <input
              data-testid="session-brief-vibe"
              maxLength={maxSessionBriefFieldLength}
              onChange={(event) => onChange("vibe", event.target.value)}
              placeholder="Mood or energy"
              ref={fieldRefs.vibe}
              type="text"
              value={brief.vibe}
            />
          </label>
          <label className="session-brief-field">
            <span>Reference</span>
            <input
              data-testid="session-brief-reference"
              maxLength={maxSessionBriefFieldLength}
              onChange={(event) => onChange("reference", event.target.value)}
              placeholder="Track or scene"
              ref={fieldRefs.reference}
              type="text"
              value={brief.reference}
            />
          </label>
          <label className="session-brief-field notes">
            <span>Notes</span>
            <textarea
              data-testid="session-brief-notes"
              maxLength={maxSessionBriefNotesLength}
              onChange={(event) => onChange("notes", event.target.value)}
              placeholder="Handoff notes"
              ref={fieldRefs.notes}
              rows={2}
              value={brief.notes}
            />
          </label>
        </div>
      </div>
      <button
        className="session-brief-clear"
        data-testid="session-brief-clear"
        disabled={filledFields === 0}
        onClick={onClear}
        title="Clear Session Brief"
        type="button"
      >
        <X size={14} aria-hidden="true" />
        <span>Clear</span>
      </button>
    </section>
  );
}

export type SessionBriefFieldRefs = {
  artist: Ref<HTMLInputElement>;
  vibe: Ref<HTMLInputElement>;
  reference: Ref<HTMLInputElement>;
  notes: Ref<HTMLTextAreaElement>;
};

export function SessionBriefCompassFocusResultStrip({ result }: { result: SessionBriefCompassFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`session-brief-compass-result ${result.tone}`}
      data-result-session-brief-compass={result.cardId}
      data-testid="session-brief-compass-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="session-brief-compass-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="session-brief-compass-result-title">{result.title}</strong>
          <small data-testid="session-brief-compass-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="session-brief-compass-result-destination" data-testid="session-brief-compass-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="session-brief-compass-result-metric" data-testid="session-brief-compass-result-metric">
        <span data-testid="session-brief-compass-result-status">{result.metricLabel}</span>
        <strong data-testid="session-brief-compass-result-value">{result.metricValue}</strong>
      </div>
      <div className="session-brief-compass-result-followup" data-testid="session-brief-compass-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function SessionBriefStarterResultStrip({ result }: { result: SessionBriefStarterResult }): ReactElement {
  return (
    <div
      className={`session-brief-starter-result ${result.tone}`}
      data-result-session-brief-starter={result.padId}
      data-testid="session-brief-starter-result"
      aria-live="polite"
    >
      <div className="session-brief-starter-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="session-brief-starter-result-title">{result.title}</strong>
          <small data-testid="session-brief-starter-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="session-brief-starter-result-meta">
        <span data-testid="session-brief-starter-result-status">{result.status}</span>
        <span data-testid="session-brief-starter-result-impact">{result.impact}</span>
        <span data-testid="session-brief-starter-result-next-check">{result.nextCheck}</span>
      </div>
      <div className="session-brief-starter-result-metrics" data-testid="session-brief-starter-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`session-brief-starter-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ListeningPass({
  focusedItemId,
  result,
  sectionRef,
  onFocus,
  summary
}: {
  focusedItemId: ListeningPassId | null;
  result: ListeningPassFocusResult | null;
  sectionRef?: Ref<HTMLElement>;
  onFocus: (item: ListeningPassItem) => void;
  summary: ListeningPassSummary;
}): ReactElement {
  const focusSummary = createListeningPassFocusSummary(summary, focusedItemId);
  const focusItem = focusSummary.itemId ? summary.items.find((item) => item.id === focusSummary.itemId) ?? null : null;

  return (
    <section
      aria-label="Listening pass"
      className={["listening-pass", summary.tone, result ? "has-result" : ""].filter(Boolean).join(" ")}
      data-testid="listening-pass"
      ref={sectionRef}
    >
      <div className="listening-pass-heading">
        <div>
          <Disc3 size={17} aria-hidden="true" />
          <span>Listening Pass</span>
        </div>
        <strong data-testid="listening-pass-headline">{summary.headline}</strong>
        <small data-testid="listening-pass-detail">{summary.detail}</small>
      </div>
      <div className="listening-pass-stack">
        <div
          className={`listening-pass-focus-readout ${focusSummary.tone}`}
          data-testid="listening-pass-focus-readout"
          title={focusSummary.detailTitle}
        >
          <span data-testid="listening-pass-focus-status">{focusSummary.statusLabel}</span>
          <strong data-testid="listening-pass-focus-label">{focusSummary.checkpointLabel}</strong>
          <small data-testid="listening-pass-focus-detail">{focusSummary.detailLabel}</small>
          <button
            className="listening-pass-focus-action"
            data-testid="listening-pass-focus-run"
            disabled={!focusItem}
            onClick={() => {
              if (focusItem) {
                onFocus(focusItem);
              }
            }}
            title={
              focusItem
                ? `Open ${focusItem.focusLabel}: ${focusItem.label} ${focusItem.status}`
                : "No Listening Pass checkpoint to focus."
            }
            type="button"
          >
            <ArrowRight size={13} aria-hidden="true" />
            <span>{focusSummary.actionLabel}</span>
          </button>
        </div>
        {result && <ListeningPassFocusResultStrip result={result} />}
        <div className="listening-pass-grid" data-testid="listening-pass-grid">
          {summary.items.map((item) => {
            const focused = focusedItemId === item.id;
            return (
              <div
                className={["listening-pass-card", item.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
                data-focused={focused ? "true" : "false"}
                data-testid={`listening-pass-${item.id}`}
                key={item.id}
              >
                <span>{item.label}</span>
                <strong>{item.status}</strong>
                <button
                  aria-pressed={focused}
                  className="listening-pass-focus-button"
                  data-testid={`listening-pass-focus-${item.id}`}
                  onClick={() => onFocus(item)}
                  title={`Focus ${item.focusLabel}: ${item.status}`}
                  type="button"
                >
                  <ArrowRight size={13} aria-hidden="true" />
                  <span>{item.focusLabel}</span>
                </button>
                <small>{item.cue}</small>
                <em>{item.detail}</em>
                <b>{item.metric}</b>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ListeningPassFocusResultStrip({ result }: { result: ListeningPassFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`listening-pass-result ${result.tone}`}
      data-result-listening-pass={result.itemId}
      data-testid="listening-pass-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="listening-pass-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="listening-pass-result-title">{result.title}</strong>
          <small data-testid="listening-pass-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="listening-pass-result-destination" data-testid="listening-pass-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="listening-pass-result-metric" data-testid="listening-pass-result-metric">
        <span data-testid="listening-pass-result-status">{result.metricLabel}</span>
        <strong data-testid="listening-pass-result-value">{result.metricValue}</strong>
      </div>
      <div className="listening-pass-result-followup" data-testid="listening-pass-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function BeatPassport({
  focusedMetricId,
  result,
  sectionRef,
  onFocus,
  summary
}: {
  focusedMetricId: BeatPassportFocusId | null;
  result: BeatPassportFocusResult | null;
  sectionRef?: Ref<HTMLElement>;
  onFocus: (metric: BeatPassportFocusItem) => void;
  summary: BeatPassportSummary;
}): ReactElement {
  const focusSummary = createBeatPassportFocusSummary(summary, focusedMetricId);
  const focusMetric = focusSummary.focusId ? summary.metrics.find((metric) => metric.focusId === focusSummary.focusId) ?? null : null;

  return (
    <section
      aria-label="Beat passport"
      className={["beat-passport", summary.tone, result ? "has-result" : ""].filter(Boolean).join(" ")}
      data-testid="beat-passport"
      ref={sectionRef}
    >
      <div className="beat-passport-heading">
        <div>
          <Gauge size={17} aria-hidden="true" />
          <span>Beat Passport</span>
        </div>
        <strong data-testid="beat-passport-headline">{summary.headline}</strong>
        <small data-testid="beat-passport-detail">{summary.detail}</small>
      </div>
      <div className={`beat-passport-focus-readout ${focusSummary.tone}`} data-testid="beat-passport-focus-readout" title={focusSummary.detailTitle}>
        <span data-testid="beat-passport-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="beat-passport-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="beat-passport-focus-detail">{focusSummary.detailLabel}</small>
        <button
          className="beat-passport-focus-action"
          data-testid="beat-passport-focus-run"
          disabled={!focusMetric}
          onClick={() => {
            if (focusMetric) {
              onFocus(focusMetric);
            }
          }}
          title={
            focusMetric
              ? `Open ${focusMetric.focusLabel}: ${focusMetric.label} ${focusMetric.value}`
              : "No Beat Passport metric to focus."
          }
          type="button"
        >
          <ArrowRight size={13} aria-hidden="true" />
          <span>{focusSummary.actionLabel}</span>
        </button>
      </div>
      {result && <BeatPassportFocusResultStrip result={result} />}
      <div className="beat-passport-grid" data-testid="beat-passport-grid">
        {summary.metrics.map((metric) => {
          const focused = focusedMetricId === metric.focusId;
          return (
            <div
              className={["beat-passport-card", metric.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`beat-passport-${metric.id}`}
              key={metric.id}
            >
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <button
                aria-pressed={focused}
                className="beat-passport-focus-button"
                data-testid={`beat-passport-focus-${metric.id}`}
                onClick={() => onFocus(metric)}
                title={`Focus ${metric.focusLabel}: ${metric.value}`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{metric.focusLabel}</span>
              </button>
              <small>{metric.detail}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function BeatPassportFocusResultStrip({ result }: { result: BeatPassportFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`beat-passport-result ${result.tone}`}
      data-result-beat-passport={result.metricId}
      data-testid="beat-passport-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="beat-passport-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="beat-passport-result-title">{result.title}</strong>
          <small data-testid="beat-passport-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="beat-passport-result-destination" data-testid="beat-passport-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="beat-passport-result-metric" data-testid="beat-passport-result-metric">
        <span data-testid="beat-passport-result-status">{result.metricLabel}</span>
        <strong data-testid="beat-passport-result-value">{result.metricValue}</strong>
      </div>
      <div className="beat-passport-result-followup" data-testid="beat-passport-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export type ProductionSnapshotPriority = {
  metricId: ProductionSnapshotMetricId | null;
  actionLabel: string;
  statusLabel: string;
  areaLabel: string;
  metricLabel: string;
  nextCheckLabel: string;
  title: string;
  tone: MixCoachTone;
};

export function ProductionSnapshot({
  focusedMetricId,
  result,
  sectionRef,
  onFocus,
  summary
}: {
  focusedMetricId: ProductionSnapshotFocusId | null;
  result: ProductionSnapshotFocusResult | null;
  sectionRef?: Ref<HTMLElement>;
  onFocus: (metric: ProductionSnapshotFocusItem) => void;
  summary: ProductionSnapshotSummary;
}): ReactElement {
  const focusSummary = createProductionSnapshotFocusSummary(summary, focusedMetricId);
  const priority = createProductionSnapshotPriority(summary);
  const priorityMetric = summary.metrics.find((metric) => metric.id === priority.metricId) ?? null;
  const priorityActionDisabled = priorityMetric === null;

  return (
    <section
      aria-label="Production snapshot"
      className={["production-snapshot", summary.tone, result ? "has-result" : ""].filter(Boolean).join(" ")}
      data-testid="production-snapshot"
      ref={sectionRef}
    >
      <div className="production-snapshot-heading">
        <div>
          <SlidersHorizontal size={17} aria-hidden="true" />
          <span>Production Snapshot</span>
        </div>
        <strong data-testid="production-snapshot-headline">{summary.headline}</strong>
        <small data-testid="production-snapshot-detail">{summary.detail}</small>
      </div>
      <div
        className={`production-snapshot-focus-readout ${focusSummary.tone}`}
        data-testid="production-snapshot-focus-readout"
        title={focusSummary.detailTitle}
      >
        <span data-testid="production-snapshot-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="production-snapshot-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="production-snapshot-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      <div
        className={`production-snapshot-priority ${priority.tone}`}
        data-production-snapshot-priority={priority.metricId ?? "none"}
        data-testid="production-snapshot-priority"
        title={priority.title}
      >
        <span data-testid="production-snapshot-priority-status">{priority.statusLabel}</span>
        <strong data-testid="production-snapshot-priority-label">{priority.areaLabel}</strong>
        <small data-testid="production-snapshot-priority-metric">{priority.metricLabel}</small>
        <small data-testid="production-snapshot-priority-next-check">{priority.nextCheckLabel}</small>
        <button
          data-testid="production-snapshot-priority-run"
          disabled={priorityActionDisabled}
          onClick={() => {
            if (priorityMetric) {
              onFocus(priorityMetric);
            }
          }}
          title={priorityMetric ? `Focus ${priority.areaLabel}` : priority.title}
          type="button"
        >
          {priority.actionLabel}
        </button>
      </div>
      {result && <ProductionSnapshotFocusResultStrip result={result} />}
      <div className="production-snapshot-grid" data-testid="production-snapshot-grid">
        {summary.metrics.map((metric) => {
          const focused = focusedMetricId === metric.focusId;
          return (
            <div
              className={["production-snapshot-card", metric.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`production-snapshot-${metric.id}`}
              key={metric.id}
            >
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <button
                aria-pressed={focused}
                className="production-snapshot-focus-button"
                data-testid={`production-snapshot-focus-${metric.id}`}
                onClick={() => onFocus(metric)}
                title={`Focus ${metric.focusLabel}: ${metric.value}`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{metric.focusLabel}</span>
              </button>
              <small>{metric.detail}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function createProductionSnapshotPriority(summary: ProductionSnapshotSummary): ProductionSnapshotPriority {
  const metric =
    summary.metrics.find((item) => item.tone === "danger") ??
    summary.metrics.find((item) => item.tone === "warn") ??
    summary.metrics[0] ??
    null;

  if (!metric) {
    return {
      metricId: null,
      actionLabel: "No metric",
      statusLabel: "Snapshot clear",
      areaLabel: "No priority lane",
      metricLabel: "No Production Snapshot metrics available",
      nextCheckLabel: "Next: return after the session has metrics to scan.",
      title: "Production Snapshot priority has no available metric.",
      tone: "warn"
    };
  }

  const statusLabel =
    metric.tone === "danger" ? "Snapshot blocker" : metric.tone === "warn" ? "Snapshot review" : "Snapshot ready";
  const nextCheckLabel = productionSnapshotPriorityNextCheck(metric);

  return {
    metricId: metric.id,
    actionLabel: "Focus lane",
    statusLabel,
    areaLabel: `${metric.label}: ${metric.value}`,
    metricLabel: `${metric.focusLabel} priority / ${metric.detail}`,
    nextCheckLabel,
    title: `${statusLabel}: ${metric.label}: ${metric.value} / ${metric.detail} / ${nextCheckLabel}`,
    tone: metric.tone
  };
}

export function productionSnapshotPriorityNextCheck(metric: ProductionSnapshotMetric): string {
  switch (metric.id) {
    case "target":
      return "Next: confirm target bars and delivery posture.";
    case "form":
      return "Next: check section motion before more writing.";
    case "patterns":
      return "Next: verify Pattern A/B/C coverage and contrast.";
    case "mix":
      return "Next: inspect headroom, balance, and stem posture.";
    case "handoff":
      return "Next: confirm stems, export, and brief context.";
  }
}

export function ProductionSnapshotFocusResultStrip({ result }: { result: ProductionSnapshotFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`production-snapshot-result ${result.tone}`}
      data-result-production-snapshot={result.metricId}
      data-testid="production-snapshot-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="production-snapshot-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="production-snapshot-result-title">{result.title}</strong>
          <small data-testid="production-snapshot-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="production-snapshot-result-destination" data-testid="production-snapshot-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="production-snapshot-result-metric" data-testid="production-snapshot-result-metric">
        <span data-testid="production-snapshot-result-status">{result.metricLabel}</span>
        <strong data-testid="production-snapshot-result-value">{result.metricValue}</strong>
      </div>
      <div className="production-snapshot-result-followup" data-testid="production-snapshot-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function KeyCompass({
  focusedCardId,
  onFocus,
  result,
  sectionRef,
  summary
}: {
  focusedCardId: KeyCompassFocusId | null;
  onFocus: (item: KeyCompassFocusItem) => void;
  result: KeyCompassFocusResult | null;
  sectionRef?: Ref<HTMLElement>;
  summary: KeyCompassSummary;
}): ReactElement {
  const focusSummary = createKeyCompassFocusSummary(summary, focusedCardId);

  return (
    <section className={`key-compass ${summary.tone}`} data-testid="key-compass" aria-label="Key compass" ref={sectionRef}>
      <div className="key-compass-heading">
        <div>
          <Music2 size={17} aria-hidden="true" />
          <span>Key Compass</span>
        </div>
        <strong data-testid="key-compass-headline">{summary.headline}</strong>
        <small data-testid="key-compass-detail">{summary.detail}</small>
      </div>
      <div className="key-compass-body">
        <div className="key-compass-notes" data-testid="key-compass-scale-notes" aria-label="Scale notes">
          {summary.scaleNotes.map((note, index) => (
            <span data-testid={`key-compass-note-${index}`} key={`${note}-${index}`}>
              {note}
            </span>
          ))}
        </div>
        <div className={`key-compass-focus-readout ${focusSummary.tone}`} data-testid="key-compass-focus-readout" title={focusSummary.detailTitle}>
          <span data-testid="key-compass-focus-status">{focusSummary.statusLabel}</span>
          <strong data-testid="key-compass-focus-label">{focusSummary.areaLabel}</strong>
          <small data-testid="key-compass-focus-detail">{focusSummary.detailLabel}</small>
        </div>
        <div className="key-compass-grid" data-testid="key-compass-grid">
          {summary.cards.map((card) => {
            const focused = focusedCardId === card.focusId;
            return (
              <div
                className={["key-compass-card", card.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
                data-focused={focused ? "true" : "false"}
                data-testid={`key-compass-${card.id}`}
                key={card.id}
              >
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <button
                  aria-pressed={focused}
                  className="key-compass-focus-button"
                  data-testid={`key-compass-focus-${card.id}`}
                  onClick={() => onFocus(card)}
                  title={`Focus ${card.focusLabel}: ${card.value}`}
                  type="button"
                >
                  <ArrowRight size={13} aria-hidden="true" />
                  <span>{card.focusLabel}</span>
                </button>
                <small>{card.detail}</small>
              </div>
            );
          })}
        </div>
        {result && <KeyCompassFocusResultStrip result={result} />}
      </div>
    </section>
  );
}

export function KeyCompassFocusResultStrip({ result }: { result: KeyCompassFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`key-compass-result ${result.tone}`}
      data-result-key-compass={result.focusId}
      data-testid="key-compass-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="key-compass-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="key-compass-result-title">{result.title}</strong>
          <small data-testid="key-compass-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="key-compass-result-metric" data-testid="key-compass-result-metric">
        <span data-testid="key-compass-result-status">{result.status}</span>
        <strong data-testid="key-compass-result-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="key-compass-result-followup" data-testid="key-compass-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function GrooveCompass({
  cued,
  focusedCardId,
  isPlaying,
  onCue,
  onFocus,
  result,
  sectionRef,
  selectedPattern,
  summary
}: {
  cued: boolean;
  focusedCardId: GrooveCompassFocusId | null;
  isPlaying: boolean;
  onCue: () => void;
  onFocus: (item: GrooveCompassFocusItem) => void;
  result: GrooveCompassFocusResult | null;
  sectionRef?: Ref<HTMLElement>;
  selectedPattern: PatternSlot;
  summary: GrooveCompassSummary;
}): ReactElement {
  const focusSummary = createGrooveCompassFocusSummary(summary, focusedCardId);

  return (
    <section className={`groove-compass ${summary.tone}`} data-testid="groove-compass" aria-label="Groove compass" ref={sectionRef}>
      <div className="groove-compass-heading">
        <div>
          <Drum size={17} aria-hidden="true" />
          <span>Groove Compass</span>
        </div>
        <strong data-testid="groove-compass-headline">{summary.headline}</strong>
        <small data-testid="groove-compass-detail">{summary.detail}</small>
        <button
          aria-pressed={cued}
          className="groove-compass-cue-button"
          data-testid="groove-compass-cue"
          disabled={isPlaying}
          onClick={onCue}
          title={
            isPlaying
              ? "Stop playback before cueing Groove Compass"
              : `Cue Pattern ${selectedPattern} for Groove Compass audition`
          }
          type="button"
        >
          <Play size={13} aria-hidden="true" />
          <span>{cued ? `Cued ${selectedPattern}` : `Cue ${selectedPattern}`}</span>
        </button>
      </div>
      <div className={`groove-compass-focus-readout ${focusSummary.tone}`} data-testid="groove-compass-focus-readout" title={focusSummary.detailTitle}>
        <span data-testid="groove-compass-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="groove-compass-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="groove-compass-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      <div className="groove-compass-grid" data-testid="groove-compass-grid">
        {summary.cards.map((card) => {
          const focused = focusedCardId === card.focusId;
          return (
            <div
              className={["groove-compass-card", card.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`groove-compass-${card.id}`}
              key={card.id}
            >
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <button
                aria-pressed={focused}
                className="groove-compass-focus-button"
                data-testid={`groove-compass-focus-${card.id}`}
                onClick={() => onFocus(card)}
                title={`Focus ${card.focusLabel}: ${card.value}`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{card.focusLabel}</span>
              </button>
              <small>{card.detail}</small>
            </div>
          );
        })}
      </div>
      {result && <GrooveCompassFocusResultStrip result={result} />}
    </section>
  );
}

export function GrooveCompassFocusResultStrip({ result }: { result: GrooveCompassFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`groove-compass-result ${result.tone}`}
      data-result-groove-compass={result.focusId}
      data-testid="groove-compass-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="groove-compass-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="groove-compass-result-title">{result.title}</strong>
          <small data-testid="groove-compass-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="groove-compass-result-metric" data-testid="groove-compass-result-metric">
        <span data-testid="groove-compass-result-status">{result.status}</span>
        <strong data-testid="groove-compass-result-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="groove-compass-result-followup" data-testid="groove-compass-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function ComposerGuide({
  summary,
  focusedCardId,
  result,
  sectionRef,
  onFocus
}: {
  summary: ComposerGuideSummary;
  focusedCardId: ComposerGuideCardId | null;
  result: ComposerGuideFocusResult | null;
  sectionRef?: Ref<HTMLElement>;
  onFocus: (card: ComposerGuideCard) => void;
}): ReactElement {
  const focusSummary = createComposerGuideFocusSummary(summary, focusedCardId);
  const focusCard = focusSummary.cardId
    ? summary.cards.find((card) => card.id === focusSummary.cardId) ?? null
    : null;

  return (
    <section
      ref={sectionRef}
      className={`composer-guide ${summary.tone}`}
      data-testid="composer-guide"
      aria-label="Composer guide"
    >
      <div className="composer-guide-heading">
        <div>
          <ListChecks size={17} aria-hidden="true" />
          <span>Composer Guide</span>
        </div>
        <strong data-testid="composer-guide-headline">{summary.headline}</strong>
        <small data-testid="composer-guide-detail">{summary.detail}</small>
      </div>
      <div
        className={`composer-guide-focus-readout ${focusSummary.tone}`}
        data-testid="composer-guide-focus-readout"
        title={focusSummary.detailTitle}
      >
        <span data-testid="composer-guide-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="composer-guide-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="composer-guide-focus-detail">{focusSummary.detailLabel}</small>
        <div className="composer-guide-focus-meta" data-testid="composer-guide-focus-meta">
          <span data-testid="composer-guide-focus-destination">{focusSummary.destinationLabel}</span>
          <small data-testid="composer-guide-focus-metric">{focusSummary.metricLabel}</small>
          <small data-testid="composer-guide-focus-audition">{focusSummary.auditionCueLabel}</small>
          <small data-testid="composer-guide-focus-next-check">{focusSummary.nextCheckLabel}</small>
        </div>
        <button
          aria-label={focusSummary.actionLabel}
          data-testid="composer-guide-focus-action"
          disabled={!focusCard}
          onClick={() => {
            if (focusCard) {
              onFocus(focusCard);
            }
          }}
          title={focusSummary.actionLabel}
          type="button"
        >
          <ArrowRight size={13} aria-hidden="true" />
          <span data-testid="composer-guide-focus-action-label">{focusCard ? focusCard.focusLabel : "No target"}</span>
        </button>
      </div>
      <div className="composer-guide-grid" data-testid="composer-guide-grid">
        {summary.cards.map((card) => {
          const focused = focusedCardId !== null && card.id === focusedCardId;
          const cardActionLabel = composerGuideFocusActionLabel(card, summary);
          return (
            <div
              className={["composer-guide-card", card.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`composer-guide-${card.id}`}
              key={card.id}
            >
              <span>{card.label}</span>
              <strong>{card.status}</strong>
              <button
                aria-label={cardActionLabel}
                aria-pressed={focused}
                className="composer-guide-focus-button"
                data-testid={`composer-guide-focus-${card.id}`}
                onClick={() => onFocus(card)}
                title={cardActionLabel}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{card.focusLabel}</span>
              </button>
              <small>{card.detail}</small>
            </div>
          );
        })}
      </div>
      {result && <ComposerGuideFocusResultStrip result={result} />}
    </section>
  );
}

export function ComposerGuideFocusResultStrip({ result }: { result: ComposerGuideFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`composer-guide-result ${result.tone}`}
      data-result-composer-guide={result.cardId}
      data-testid="composer-guide-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="composer-guide-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="composer-guide-result-title">{result.title}</strong>
          <small data-testid="composer-guide-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="composer-guide-result-metric" data-testid="composer-guide-result-metric">
        <span data-testid="composer-guide-result-status">{result.status}</span>
        <strong data-testid="composer-guide-result-value">
          {result.metricLabel}: {result.metricValue}
        </strong>
      </div>
      <div className="composer-guide-result-followup" data-testid="composer-guide-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function ComposerActions({
  project,
  summary,
  result,
  onRun
}: {
  project: ProjectState;
  summary: ComposerActionsSummary;
  result: ComposerActionResult | null;
  onRun: (action: ComposerAction) => void;
}): ReactElement {
  return (
    <section className={`composer-actions ${summary.tone}`} data-testid="composer-actions" aria-label="Composer actions">
      <div className="composer-actions-heading">
        <div>
          <Sparkles size={17} aria-hidden="true" />
          <span>Composer Actions</span>
        </div>
        <strong data-testid="composer-actions-headline">{summary.headline}</strong>
        <small data-testid="composer-actions-detail">{summary.detail}</small>
      </div>
      {result && <ComposerActionResultStrip result={result} />}
      <div className="composer-actions-grid" data-testid="composer-actions-grid">
        {summary.actions.map((action) => {
          const actionContext = composerActionButtonContext(action, project);
          return (
            <button
              aria-label={actionContext}
              className={action.tone}
              data-testid={`composer-action-${action.id}`}
              key={action.id}
              onClick={() => onRun(action)}
              title={actionContext}
              type="button"
            >
              {composerActionIcon(action)}
              <span>
                <strong>{action.buttonLabel}</strong>
                <small>{action.detail}</small>
                <em data-testid={`composer-action-preview-${action.id}`}>
                  {action.scope} / {action.impact}
                </em>
                <i>{action.safety}</i>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function composerActionButtonContext(action: ComposerAction, project: ProjectState): string {
  return `${action.buttonLabel}: ${composerActionQuickActionDetail(action, project)}`;
}

export function ComposerActionResultStrip({ result }: { result: ComposerActionResult }): ReactElement {
  return (
    <div className={`composer-action-result ${result.tone}`} data-testid="composer-action-result">
      <div className="composer-action-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="composer-action-result-title">{result.title}</strong>
          <small data-testid="composer-action-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="composer-action-result-meta">
        <span data-testid="composer-action-result-status">{result.status}</span>
        <span data-testid="composer-action-result-route">{result.route}</span>
        <span data-testid="composer-action-result-scope">{result.scope}</span>
        <span data-testid="composer-action-result-impact">{result.impact}</span>
        <span data-testid="composer-action-result-safety">{result.safety}</span>
      </div>
      <div className="composer-action-result-metrics" data-testid="composer-action-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`composer-action-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="composer-action-result-followup" data-testid="composer-action-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="composer-action-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="composer-action-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function composerActionIcon(action: ComposerAction): ReactElement {
  switch (action.command.kind) {
    case "drumFoundation":
      return <Drum size={14} aria-hidden="true" />;
    case "bassline":
      return <Waves size={14} aria-hidden="true" />;
    case "chordProgression":
      return <KeyboardMusic size={14} aria-hidden="true" />;
    case "melodyMotif":
      return <Music2 size={14} aria-hidden="true" />;
    case "arrangementTemplate":
    case "patternChain":
      return <ListChecks size={14} aria-hidden="true" />;
    case "masterFinish":
      return <Gauge size={14} aria-hidden="true" />;
    case "blueprint":
    case "patternFill":
      return <Sparkles size={14} aria-hidden="true" />;
  }
}

export type FinishChecklistPriority = {
  cardId: FinishChecklistCardId | null;
  actionLabel: string;
  statusLabel: string;
  areaLabel: string;
  cardLabel: string;
  nextCheckLabel: string;
  title: string;
  tone: MixCoachTone;
};

export function FinishChecklist({
  summary,
  focusedCardId,
  result,
  sectionRef,
  onFocus
}: {
  summary: FinishChecklistSummary;
  focusedCardId: FinishChecklistCardId | null;
  result: FinishChecklistFocusResult | null;
  sectionRef?: Ref<HTMLElement>;
  onFocus: (card: FinishChecklistCard) => void;
}): ReactElement {
  const focusSummary = createFinishChecklistFocusSummary(summary, focusedCardId);
  const priority = createFinishChecklistPriority(summary);
  const priorityCard = summary.cards.find((card) => card.id === priority.cardId) ?? null;
  const priorityActionDisabled = priorityCard === null;

  return (
    <section
      className={["finish-checklist", summary.tone, result ? "has-result" : ""].filter(Boolean).join(" ")}
      data-testid="finish-checklist"
      aria-label="Finish checklist"
      ref={sectionRef}
    >
      <div className="finish-checklist-heading">
        <div>
          <Gauge size={16} aria-hidden="true" />
          <span>Finish Checklist</span>
        </div>
        <strong data-testid="finish-checklist-headline">{summary.headline}</strong>
        <small data-testid="finish-checklist-detail">{summary.detail}</small>
      </div>
      <div
        className={`finish-checklist-focus-readout ${focusSummary.tone}`}
        data-testid="finish-checklist-focus-readout"
        title={focusSummary.detailTitle}
      >
        <span data-testid="finish-checklist-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="finish-checklist-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="finish-checklist-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      <div
        className={`finish-checklist-priority ${priority.tone}`}
        data-finish-checklist-priority={priority.cardId ?? "none"}
        data-testid="finish-checklist-priority"
        title={priority.title}
      >
        <span data-testid="finish-checklist-priority-status">{priority.statusLabel}</span>
        <strong data-testid="finish-checklist-priority-label">{priority.areaLabel}</strong>
        <small data-testid="finish-checklist-priority-card">{priority.cardLabel}</small>
        <small data-testid="finish-checklist-priority-next-check">{priority.nextCheckLabel}</small>
        <button
          data-testid="finish-checklist-priority-run"
          disabled={priorityActionDisabled}
          onClick={() => {
            if (priorityCard) {
              onFocus(priorityCard);
            }
          }}
          title={priorityCard ? `Focus ${priority.areaLabel}` : priority.title}
          type="button"
        >
          {priority.actionLabel}
        </button>
      </div>
      {result && <FinishChecklistFocusResultStrip result={result} />}
      <div className="finish-checklist-grid" data-testid="finish-checklist-grid">
        {summary.cards.map((card) => {
          const focused = focusedCardId !== null && card.id === focusedCardId;
          return (
            <div
              className={["finish-checklist-card", card.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`finish-checklist-${card.id}`}
              key={card.id}
            >
              <span>{card.label}</span>
              <strong>{card.status}</strong>
              <button
                aria-pressed={focused}
                className="finish-checklist-focus-button"
                data-testid={`finish-checklist-focus-${card.id}`}
                onClick={() => onFocus(card)}
                title={`Focus ${card.focusLabel}: ${card.status}`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{card.focusLabel}</span>
              </button>
              <small>{card.detail}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function createFinishChecklistPriority(summary: FinishChecklistSummary): FinishChecklistPriority {
  const card =
    summary.cards.find((item) => item.tone === "danger") ??
    summary.cards.find((item) => item.tone === "warn") ??
    summary.cards[0] ??
    null;

  if (!card) {
    return {
      cardId: null,
      actionLabel: "No finish",
      statusLabel: "Finish clear",
      areaLabel: "No priority lane",
      cardLabel: "No Finish Checklist cards available",
      nextCheckLabel: "Next: return after finish cards are available.",
      title: "Finish Checklist priority has no available card.",
      tone: "warn"
    };
  }

  const statusLabel =
    card.tone === "danger" ? "Finish blocker" : card.tone === "warn" ? "Finish review" : "Finish ready";
  const nextCheckLabel = finishChecklistPriorityNextCheck(card);

  return {
    cardId: card.id,
    actionLabel: "Focus finish",
    statusLabel,
    areaLabel: `${card.label}: ${card.status}`,
    cardLabel: `${card.focusLabel} priority / ${card.detail}`,
    nextCheckLabel,
    title: `${statusLabel}: ${card.label}: ${card.status} / ${card.detail} / ${nextCheckLabel}`,
    tone: card.tone
  };
}

export function finishChecklistPriorityNextCheck(card: FinishChecklistCard): string {
  switch (card.id) {
    case "compose":
      return "Next: confirm core musical layers before export.";
    case "arrange":
      return "Next: scan song form, contrast, and target length.";
    case "mix":
      return "Next: check Full Mix, stems, and Mix Coach.";
    case "master":
      return "Next: confirm master preset, ceiling, and headroom.";
    case "automation":
      return "Next: play fades across realtime playback and export scope.";
    case "handoff":
      return "Next: confirm deliverables, stems, and brief context.";
  }
}

export function FinishChecklistFocusResultStrip({ result }: { result: FinishChecklistFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`finish-checklist-result ${result.tone}`}
      data-result-finish-checklist={result.cardId}
      data-testid="finish-checklist-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="finish-checklist-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="finish-checklist-result-title">{result.title}</strong>
          <small data-testid="finish-checklist-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="finish-checklist-result-destination" data-testid="finish-checklist-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="finish-checklist-result-metric" data-testid="finish-checklist-result-metric">
        <span data-testid="finish-checklist-result-status">{result.metricLabel}</span>
        <strong data-testid="finish-checklist-result-value">{result.metricValue}</strong>
      </div>
      <div className="finish-checklist-result-followup" data-testid="finish-checklist-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function ReviewQueue({
  summary,
  fixResult,
  focusedItemId,
  result,
  project,
  sectionRef,
  onFix,
  onFocus
}: {
  summary: ReviewQueueSummary;
  fixResult: ReviewFixResult | null;
  focusedItemId: string | null;
  result: ReviewQueueFocusResult | null;
  project: ProjectState;
  sectionRef?: Ref<HTMLElement>;
  onFix: (item?: ReviewQueueItem) => void;
  onFocus: (item: ReviewQueueItem) => void;
}): ReactElement {
  const focusSummary = createReviewQueueFocusSummary(summary, focusedItemId);
  const priority = createReviewQueuePriority(summary);
  const priorityItem = summary.items.find((item) => item.id === priority.itemId) ?? null;
  const priorityActionDisabled = priorityItem === null;
  const fixPreview = createReviewFixPreview(summary, focusedItemId, project, analyzeExport(project));

  return (
    <section
      className={`review-queue ${summary.tone}`}
      data-testid="review-queue"
      aria-label="Review queue"
      ref={sectionRef}
      tabIndex={-1}
    >
      <div className="review-queue-heading">
        <div>
          <ListChecks size={16} aria-hidden="true" />
          <span>Review Queue</span>
        </div>
        <strong data-testid="review-queue-headline">{summary.headline}</strong>
        <small data-testid="review-queue-detail">{summary.detail}</small>
      </div>
      <div className="review-queue-stack">
        <div
          className={`review-queue-focus-readout ${focusSummary.tone}`}
          data-testid="review-queue-focus-readout"
          title={focusSummary.detailTitle}
        >
          <span data-testid="review-queue-focus-status">{focusSummary.statusLabel}</span>
          <strong data-testid="review-queue-focus-label">{focusSummary.areaLabel}</strong>
          <small data-testid="review-queue-focus-detail">{focusSummary.detailLabel}</small>
        </div>
        <div
          className={`review-queue-priority ${priority.tone}`}
          data-review-queue-priority={priority.itemId ?? "none"}
          data-testid="review-queue-priority"
          title={priority.title}
        >
          <span data-testid="review-queue-priority-status">{priority.statusLabel}</span>
          <strong data-testid="review-queue-priority-label">{priority.areaLabel}</strong>
          <small data-testid="review-queue-priority-item">{priority.itemLabel}</small>
          <small data-testid="review-queue-priority-next-check">{priority.nextCheckLabel}</small>
          <button
            data-testid="review-queue-priority-run"
            disabled={priorityActionDisabled}
            onClick={() => {
              if (priorityItem) {
                onFocus(priorityItem);
              }
            }}
            title={priorityItem ? `Focus ${priority.areaLabel}` : priority.title}
            type="button"
          >
            {priority.actionLabel}
          </button>
        </div>
        <ReviewFixPreviewStrip preview={fixPreview} />
        {result && <ReviewQueueFocusResultStrip result={result} />}
        {fixResult && <ReviewFixResultStrip result={fixResult} />}
      </div>
      <div className="review-queue-list" data-testid="review-queue-list">
        {summary.items.map((item) => {
          const focused = focusedItemId !== null && item.id === focusedItemId;
          const fix = createReviewFixOption(item, project, analyzeExport(project));
          const fixDisabled = item.tone === "good" || fix === null;
          return (
            <div
              className={["review-queue-item", item.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`review-queue-${item.id}`}
              key={item.id}
            >
              <span>{item.area}</span>
              <strong>{item.status}</strong>
              <div className="review-queue-item-actions">
                <button
                  aria-pressed={focused}
                  className="review-queue-focus-button"
                  data-testid={`review-queue-focus-${item.id}`}
                  onClick={() => onFocus(item)}
                  title={`Focus ${item.focusLabel}: ${item.status}`}
                  type="button"
                >
                  <ArrowRight size={13} aria-hidden="true" />
                  <span>{item.focusLabel}</span>
                </button>
                <button
                  className="review-queue-fix-button"
                  data-testid={`review-queue-fix-${item.id}`}
                  disabled={fixDisabled}
                  onClick={() => onFix(item)}
                  title={fix ? `Apply ${fix.label}: ${fix.detail}` : "No Review Fix for this item"}
                  type="button"
                >
                  <SlidersHorizontal size={13} aria-hidden="true" />
                  <span>Fix</span>
                </button>
              </div>
              <small>{item.detail}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export type ReviewQueuePriority = {
  itemId: string | null;
  actionLabel: string;
  statusLabel: string;
  areaLabel: string;
  itemLabel: string;
  nextCheckLabel: string;
  title: string;
  tone: MixCoachTone;
};

export function ReviewFixPreviewStrip({ preview }: { preview: ReviewFixPreviewSummary }): ReactElement {
  return (
    <div
      className={`review-fix-preview ${preview.tone}`}
      data-preview-fix={preview.fixId ?? "none"}
      data-testid="review-fix-preview"
      title={preview.detailTitle}
    >
      <div className="review-fix-preview-main">
        <SlidersHorizontal size={14} aria-hidden="true" />
        <span>
          <strong data-testid="review-fix-preview-title">{preview.title}</strong>
          <small data-testid="review-fix-preview-detail">{preview.detail}</small>
        </span>
      </div>
      <div className="review-fix-preview-scope" data-testid="review-fix-preview-scope">
        <span>{preview.status}</span>
        <strong>{preview.scope}</strong>
      </div>
      <div className="review-fix-preview-followup" data-testid="review-fix-preview-followup">
        <span data-testid="review-fix-preview-audition">{preview.auditionCue}</span>
        <small data-testid="review-fix-preview-next-check">{preview.nextCheck}</small>
      </div>
    </div>
  );
}

export function ReviewQueueFocusResultStrip({ result }: { result: ReviewQueueFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`review-queue-result ${result.tone}`}
      data-result-review-queue={result.itemId}
      data-testid="review-queue-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="review-queue-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="review-queue-result-title">{result.title}</strong>
          <small data-testid="review-queue-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="review-queue-result-destination" data-testid="review-queue-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="review-queue-result-metric" data-testid="review-queue-result-metric">
        <span data-testid="review-queue-result-status">{result.metricLabel}</span>
        <strong data-testid="review-queue-result-value">{result.metricValue}</strong>
      </div>
      <div className="review-queue-result-followup" data-testid="review-queue-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function ReviewFixResultStrip({ result }: { result: ReviewFixResult }): ReactElement {
  return (
    <div
      className={`review-fix-result ${result.tone}`}
      data-result-review-fix={result.fixId}
      data-testid="review-fix-result"
      aria-live="polite"
    >
      <div className="review-fix-result-main">
        <SlidersHorizontal size={14} aria-hidden="true" />
        <span>
          <strong data-testid="review-fix-result-title">{result.title}</strong>
          <small data-testid="review-fix-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="review-fix-result-meta">
        <span data-testid="review-fix-result-status">{result.status}</span>
        <span data-testid="review-fix-result-scope">{result.scope}</span>
        <span data-testid="review-fix-result-impact">{result.impact}</span>
      </div>
      <div className="review-fix-result-metrics" data-testid="review-fix-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`review-fix-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="review-fix-result-followup" data-testid="review-fix-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="review-fix-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="review-fix-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function createBeatSpineApplyResult(
  action: BeatSpineAction,
  beforeProject: ProjectState,
  afterProject: ProjectState
): BeatSpineApplyResult {
  const metric = createBeatSpineApplyResultMetric(action.id, beforeProject, afterProject);
  const changed = metric.before !== metric.after;
  const tone: MixCoachTone = changed ? "good" : "warn";
  return {
    actionId: action.id,
    title: `${action.label} ${changed ? "applied" : "already aligned"}`,
    status: changed ? "Applied" : "Already aligned",
    detail: action.detail,
    scope: beatSpineApplyResultScope(action.id, beforeProject.selectedPattern),
    impact: changed ? `${metric.label} updated` : "No change needed",
    metric,
    auditionCue: beatSpineApplyResultAudition(action.id, beforeProject.selectedPattern),
    nextCheck: beatSpineApplyResultNextCheck(action.id),
    tone
  };
}

export function createBeatSpineApplyResultMetric(
  actionId: BeatSpineActionId,
  beforeProject: ProjectState,
  afterProject: ProjectState
): BeatSpineApplyResultMetric {
  const patternSlot = beforeProject.selectedPattern;
  const beforePattern = beforeProject.patterns[patternSlot];
  const afterPattern = afterProject.patterns[patternSlot] ?? beforePattern;
  const metric = (() => {
    switch (actionId) {
      case "drums":
        return {
          label: "Drum hits",
          before: `${drumHitCount(beforePattern)} hits`,
          after: `${drumHitCount(afterPattern)} hits`
        };
      case "bass":
        return {
          label: "808 notes",
          before: `${beforePattern.bassNotes.length} notes`,
          after: `${afterPattern.bassNotes.length} notes`
        };
      case "harmony":
        return {
          label: "Chords",
          before: `${beforePattern.chordEvents.length} chords`,
          after: `${afterPattern.chordEvents.length} chords`
        };
      case "melody":
        return {
          label: "Synth notes",
          before: `${beforePattern.melodyNotes.length} notes`,
          after: `${afterPattern.melodyNotes.length} notes`
        };
      case "sound":
        return {
          label: "Sound preset",
          before: soundPresetLabel(beforeProject.sound.preset),
          after: soundPresetLabel(afterProject.sound.preset)
        };
      case "arrange":
        return {
          label: "Arrangement",
          before: `${barCountLabel(arrangementTotalBars(beforeProject))} / ${beforeProject.arrangement.length} blocks`,
          after: `${barCountLabel(arrangementTotalBars(afterProject))} / ${afterProject.arrangement.length} blocks`
        };
      case "finish":
        return {
          label: "Master",
          before: `${beforeProject.masterPreset} / ${formatDb(beforeProject.masterCeilingDb)}`,
          after: `${afterProject.masterPreset} / ${formatDb(afterProject.masterCeilingDb)}`
        };
    }
  })();
  return {
    id: actionId,
    label: metric.label,
    before: metric.before,
    after: metric.after,
    tone: metric.before === metric.after ? "warn" : "good"
  };
}

export function beatSpineApplyResultScope(actionId: BeatSpineActionId, patternSlot: PatternSlot): string {
  switch (actionId) {
    case "drums":
      return `Pattern ${patternSlot} drums`;
    case "bass":
      return `Pattern ${patternSlot} 808`;
    case "harmony":
      return `Pattern ${patternSlot} chords`;
    case "melody":
      return `Pattern ${patternSlot} Synth`;
    case "sound":
      return "Built-in sound design";
    case "arrange":
      return "Arrangement blocks";
    case "finish":
      return "Master output";
  }
}

export function beatSpineApplyResultAudition(actionId: BeatSpineActionId, patternSlot: PatternSlot): string {
  switch (actionId) {
    case "drums":
      return `Loop Pattern ${patternSlot} and check the kick, clap, hat, and perc foundation.`;
    case "bass":
      return `Loop Pattern ${patternSlot} with drums and check the 808-to-kick pocket.`;
    case "harmony":
      return `Loop Pattern ${patternSlot} and check whether the chords support the hook.`;
    case "melody":
      return `Loop Pattern ${patternSlot} and check whether the Synth motif leaves space for the beat.`;
    case "sound":
      return "Play the hook or full mix and check whether the built-in tone fits the style.";
    case "arrange":
      return "Play the Song loop and check section flow across Pattern A/B/C.";
    case "finish":
      return "Play Full Mix and confirm the master posture before exporting.";
  }
}

export function beatSpineApplyResultNextCheck(actionId: BeatSpineActionId): string {
  switch (actionId) {
    case "drums":
      return "Check 808/Bass in Beat Spine or Groove Compass for pocket.";
    case "bass":
      return "Check Harmony or Melody so the low end supports the hook.";
    case "harmony":
      return "Check Melody and Sound after the chord motion is set.";
    case "melody":
      return "Check Sound and Arrange so the motif sits in the beat.";
    case "sound":
      return "Check Arrange and Mix after the tone preset is set.";
    case "arrange":
      return "Check Finish, Export Preflight, and Listening Pass.";
    case "finish":
      return "Check Export Preflight, then export WAV, stems, MIDI, or handoff sheet explicitly.";
  }
}

export function createBeatSpineJumpResult(card: BeatSpineCard, summary: BeatSpineSummary): BeatSpineJumpResult {
  return {
    cardId: card.id,
    title: `${card.label} jump ready`,
    status: "Jumped",
    detail: `${card.focusLabel}: ${card.detail}`,
    destination: beatSpineTargetLabel(card.target),
    metricLabel: "Beat core",
    metricValue: `${summary.countLabel} / ${card.value}`,
    auditionCue: beatSpineJumpResultAudition(card),
    nextCheck: beatSpineJumpResultNextCheck(card),
    tone: card.tone
  };
}

export function beatSpineTargetLabel(target: BeatSpineTarget): string {
  switch (target) {
    case "transport":
      return "Transport";
    case "compose":
      return "Compose";
    case "sound":
      return "Sound";
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

export function beatSpineJumpResultAudition(card: BeatSpineCard): string {
  switch (card.id) {
    case "setup":
      return "Confirm tempo, key, style, delivery target, and loop scope before editing beat events.";
    case "drums":
      return "Loop the selected Pattern and check kick, clap, hat, and perc anchors before applying a drum move.";
    case "bass":
      return "Loop drums with 808/Bass and check the low-end pocket before applying a bass move.";
    case "harmony":
      return "Loop the hook or selected Pattern and check whether chords support the beat direction.";
    case "melody":
      return "Loop the Synth lane with drums and 808/Bass, then check motif space and repetition.";
    case "sound":
      return "Play the hook or full mix and inspect built-in tone design before applying a preset.";
    case "arrange":
      return "Play Song loop and inspect Pattern A/B/C section flow before changing the form.";
    case "finish":
      return "Play Full Mix and inspect master or delivery readiness before exporting.";
  }
}

export function beatSpineJumpResultNextCheck(card: BeatSpineCard): string {
  if (card.action) {
    return `If the axis still needs work, apply ${card.action.label} or edit ${card.label} manually.`;
  }
  if (card.id === "setup") {
    return "After setup is aligned, continue to Drums, 808/Bass, Harmony, and Melody.";
  }
  return "Return to Beat Spine after the focused panel is checked.";
}

export function beatSpineJumpButtonContext(card: BeatSpineCard, summary: BeatSpineSummary): string {
  return [
    `Jump to ${card.focusLabel}: ${card.detail}`,
    `Destination ${beatSpineTargetLabel(card.target)}`,
    `Beat core ${summary.countLabel} / ${card.value}`,
    `Audition ${beatSpineJumpResultAudition(card)}`,
    `Next ${beatSpineJumpResultNextCheck(card)}`
  ].join(" / ");
}

export function beatSpineApplyButtonContext(
  action: BeatSpineAction,
  card: BeatSpineCard,
  summary: BeatSpineSummary,
  selectedPattern: PatternSlot
): string {
  return [
    `Apply ${action.label}: ${action.detail}`,
    `Card ${card.label}: ${card.value}`,
    `Beat core ${summary.countLabel}`,
    `Scope ${beatSpineApplyResultScope(action.id, selectedPattern)}`,
    `Audition ${beatSpineApplyResultAudition(action.id, selectedPattern)}`,
    `Next ${beatSpineApplyResultNextCheck(action.id)}`
  ].join(" / ");
}

export function BeatSpine({
  jumpResult,
  onApply,
  onJump,
  result,
  selectedPattern,
  summary
}: {
  summary: BeatSpineSummary;
  jumpResult: BeatSpineJumpResult | null;
  result: BeatSpineApplyResult | null;
  selectedPattern: PatternSlot;
  onApply: (action: BeatSpineAction) => void;
  onJump: (card: BeatSpineCard) => void;
}): ReactElement {
  const decisionCard = summary.cards.find((card) => card.id === summary.nextCardId) ?? summary.cards[0] ?? null;
  const decisionAction = decisionCard?.action ?? null;
  const decisionActionLabel = decisionAction ? decisionAction.label : decisionCard ? `Jump ${decisionCard.focusLabel}` : "No action";
  const decisionActionContext = decisionCard
    ? decisionAction
      ? beatSpineApplyButtonContext(decisionAction, decisionCard, summary, selectedPattern)
      : beatSpineJumpButtonContext(decisionCard, summary)
    : "No Beat Spine decision action available.";

  return (
    <section className={`beat-spine ${summary.tone}`} data-testid="beat-spine" aria-label="Beat spine">
      <div className="beat-spine-heading">
        <div>
          <KeyboardMusic size={16} aria-hidden="true" />
          <span data-testid="beat-spine-status">{summary.statusLabel}</span>
        </div>
        <strong data-testid="beat-spine-headline">{summary.headline}</strong>
        <small data-testid="beat-spine-detail">{summary.detail}</small>
      </div>
      <div className="beat-spine-count" data-next-card={summary.nextCardId} data-testid="beat-spine-count">
        <span>Beat core</span>
        <strong>{summary.countLabel}</strong>
        <small>{summary.tone === "good" ? "Core path clear" : "Jump to the highlighted axis"}</small>
      </div>
      <div
        className={`beat-spine-decision ${summary.tone}`}
        data-beat-spine-decision={summary.nextCardId}
        data-testid="beat-spine-decision"
        title={summary.decisionTitle}
      >
        <span data-testid="beat-spine-decision-status">{summary.decisionStatus}</span>
        <strong data-testid="beat-spine-decision-label">{summary.decisionLabel}</strong>
        <small data-testid="beat-spine-decision-detail">{summary.decisionDetail}</small>
        <button
          aria-label={decisionActionContext}
          data-testid="beat-spine-decision-action"
          disabled={!decisionCard}
          onClick={() => {
            if (!decisionCard) {
              return;
            }
            if (decisionAction) {
              onApply(decisionAction);
              return;
            }
            onJump(decisionCard);
          }}
          title={decisionActionContext}
          type="button"
        >
          {decisionAction ? <Sparkles size={12} aria-hidden="true" /> : <ArrowRight size={12} aria-hidden="true" />}
          <span data-testid="beat-spine-decision-action-label">{decisionActionLabel}</span>
        </button>
      </div>
      <div className="beat-spine-grid" data-testid="beat-spine-grid">
        {summary.cards.map((card) => {
          const next = card.id === summary.nextCardId;
          const action = card.action;
          const jumpButtonContext = beatSpineJumpButtonContext(card, summary);
          const applyButtonContext = action
            ? beatSpineApplyButtonContext(action, card, summary, selectedPattern)
            : null;
          return (
            <div
              className={["beat-spine-card", card.tone, next ? "next" : ""].filter(Boolean).join(" ")}
              data-next={next ? "true" : "false"}
              data-testid={`beat-spine-${card.id}`}
              key={card.id}
            >
              {beatSpineIcon(card.id)}
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.detail}</small>
              <div className={["beat-spine-card-actions", action ? "" : "single"].filter(Boolean).join(" ")}>
                <button
                  aria-label={jumpButtonContext}
                  data-testid={`beat-spine-jump-${card.id}`}
                  onClick={() => onJump(card)}
                  title={jumpButtonContext}
                  type="button"
                >
                  <ArrowRight size={12} aria-hidden="true" />
                  <span>{card.focusLabel}</span>
                </button>
                {action && (
                  <button
                    aria-label={applyButtonContext ?? `${action.label}: ${action.detail}`}
                    className="primary"
                    data-testid={`beat-spine-apply-${card.id}`}
                    onClick={() => onApply(action)}
                    title={applyButtonContext ?? `${action.label}: ${action.detail}`}
                    type="button"
                  >
                    <Sparkles size={12} aria-hidden="true" />
                    <span>{action.label}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {jumpResult && <BeatSpineJumpResultStrip result={jumpResult} />}
      {result && <BeatSpineResultStrip result={result} />}
    </section>
  );
}

export function BeatSpineJumpResultStrip({ result }: { result: BeatSpineJumpResult }): ReactElement {
  return (
    <div
      className={`beat-spine-result beat-spine-jump-result ${result.tone}`}
      data-result-beat-spine-jump={result.cardId}
      data-testid="beat-spine-jump-result"
      aria-live="polite"
    >
      <div className="beat-spine-result-main">
        <ArrowRight size={14} aria-hidden="true" />
        <span>
          <strong data-testid="beat-spine-jump-result-title">{result.title}</strong>
          <small data-testid="beat-spine-jump-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="beat-spine-result-meta" data-testid="beat-spine-jump-result-destination">
        <span data-testid="beat-spine-jump-result-status">{result.status}</span>
        <span>{result.destination}</span>
      </div>
      <div className="beat-spine-result-metric" data-testid="beat-spine-jump-result-metric">
        <span>{result.metricLabel}</span>
        <strong data-testid="beat-spine-jump-result-value">{result.metricValue}</strong>
      </div>
      <div className="beat-spine-result-followup" data-testid="beat-spine-jump-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="beat-spine-jump-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="beat-spine-jump-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function BeatSpineResultStrip({ result }: { result: BeatSpineApplyResult }): ReactElement {
  return (
    <div
      className={`beat-spine-result ${result.tone}`}
      data-result-beat-spine={result.actionId}
      data-testid="beat-spine-result"
      aria-live="polite"
    >
      <div className="beat-spine-result-main">
        <ListChecks size={14} aria-hidden="true" />
        <span>
          <strong data-testid="beat-spine-result-title">{result.title}</strong>
          <small data-testid="beat-spine-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="beat-spine-result-meta">
        <span data-testid="beat-spine-result-status">{result.status}</span>
        <span data-testid="beat-spine-result-scope">{result.scope}</span>
        <span data-testid="beat-spine-result-impact">{result.impact}</span>
      </div>
      <div className={`beat-spine-result-metric ${result.metric.tone}`} data-testid="beat-spine-result-metric">
        <span>{result.metric.label}</span>
        <strong data-testid="beat-spine-result-metric-value">
          {result.metric.before} -&gt; {result.metric.after}
        </strong>
      </div>
      <div className="beat-spine-result-followup" data-testid="beat-spine-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="beat-spine-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="beat-spine-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function workflowCountLabel(count: number, label: string): string {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

export function createBeatSpineSummary(
  project: ProjectState,
  style: StyleProfile,
  checks: BeatReadinessCheck[],
  exportPreflight: ExportPreflightSummary,
  analysis: ExportAnalysis
): BeatSpineSummary {
  const target = activeDeliveryTarget(project);
  const arrangedPatterns = arrangedPatternData(project);
  const chordCount = arrangedPatterns.reduce((total, pattern) => total + pattern.chordEvents.length, 0);
  const melodyCount = arrangedPatterns.reduce((total, pattern) => total + pattern.melodyNotes.length, 0);
  const arrangement = readinessCheckForId(checks, "arrangement");
  const drums = readinessCheckForId(checks, "drums");
  const bass = readinessCheckForId(checks, "bass");
  const exportCheck = readinessCheckForId(checks, "export");
  const drumFoundation = composerDrumFoundation(project);
  const bassline = composerBasslinePad(project);
  const chordPreset = composerChordPreset(project);
  const melodyMotif = composerMelodyMotif(project);
  const targetSoundPreset = styleSoundPreset(style.id);
  const finishPad = suggestedMasterFinishPad(project);
  const setupTone: MixCoachTone = project.bpm >= style.bpmRange[0] && project.bpm <= style.bpmRange[1] ? "good" : "warn";
  const harmonyTone: MixCoachTone = chordCount >= 2 ? "good" : chordCount > 0 ? "warn" : "danger";
  const melodyTone: MixCoachTone =
    melodyCount >= 3 ? "good" : melodyCount > 0 ? "warn" : style.melodyStyle === "none" ? "warn" : "danger";
  const soundTone: MixCoachTone = project.sound.preset === targetSoundPreset || project.sound.preset !== "custom" ? "good" : "warn";
  const finishTone = weakestTone([exportCheck?.tone ?? "danger", exportPreflight.tone, analysis.status === "Silent" ? "danger" : "good"]);
  const cards: BeatSpineCard[] = [
    {
      id: "setup",
      label: "Setup",
      value: `${style.name} / ${project.key}`,
      detail: `${project.bpm} BPM / ${target.name}`,
      focusLabel: "Transport",
      target: "transport",
      tone: setupTone
    },
    {
      id: "drums",
      label: "Drums",
      value: drums?.status ?? "Check",
      detail: drums?.detail ?? "Scan kick, clap, hat, and perc events.",
      focusLabel: "Compose",
      target: "compose",
      action: {
        id: "drums",
        label: drumFoundationLabel(drumFoundation),
        detail: `Apply ${drumFoundationLabel(drumFoundation)} drums to Pattern ${project.selectedPattern}.`
      },
      tone: drums?.tone ?? "danger"
    },
    {
      id: "bass",
      label: "808 / Bass",
      value: bass?.status ?? "Check",
      detail: bass?.detail ?? "Scan arranged 808 or bass notes.",
      focusLabel: "Compose",
      target: "compose",
      action: {
        id: "bass",
        label: basslinePadLabel(bassline),
        detail: `Apply ${basslinePadLabel(bassline)} 808 to Pattern ${project.selectedPattern}.`
      },
      tone: bass?.tone ?? "danger"
    },
    {
      id: "harmony",
      label: "Harmony",
      value: chordCount >= 2 ? "Set" : chordCount > 0 ? "Sketch" : "Missing",
      detail: `${chordCount} arranged chord event${chordCount === 1 ? "" : "s"}.`,
      focusLabel: "Compose",
      target: "compose",
      action: {
        id: "harmony",
        label: chordProgressionPresetLabel(chordPreset),
        detail: `Apply ${chordProgressionPresetLabel(chordPreset)} chords to Pattern ${project.selectedPattern}.`
      },
      tone: harmonyTone
    },
    {
      id: "melody",
      label: "Melody",
      value: melodyCount >= 3 ? "Set" : melodyCount > 0 ? "Sketch" : "Missing",
      detail:
        melodyCount > 0
          ? `${melodyCount} arranged Synth note${melodyCount === 1 ? "" : "s"}.`
          : `${melodyStyleRoleLabel(style.melodyStyle)} needs an editable motif.`,
      focusLabel: "Compose",
      target: "compose",
      action: {
        id: "melody",
        label: melodyMotifLabel(melodyMotif),
        detail: `Apply ${melodyMotifLabel(melodyMotif)} Synth motif to Pattern ${project.selectedPattern}.`
      },
      tone: melodyTone
    },
    {
      id: "sound",
      label: "Sound",
      value: soundPresetLabel(project.sound.preset),
      detail: `Built-in tone design / style target ${soundPresetLabel(targetSoundPreset)}.`,
      focusLabel: "Sound",
      target: "sound",
      action: {
        id: "sound",
        label: soundPresetLabel(targetSoundPreset),
        detail: `Apply ${soundPresetLabel(targetSoundPreset)} built-in sound preset.`
      },
      tone: soundTone
    },
    {
      id: "arrange",
      label: "Arrange",
      value: arrangement?.status ?? barCountLabel(arrangementTotalBars(project)),
      detail: arrangement?.detail ?? "Place Pattern A/B/C into a song form.",
      focusLabel: "Arrange",
      target: "arrange",
      action: {
        id: "arrange",
        label: patternChainLabel("eight_bar"),
        detail: `Apply ${patternChainLabel("eight_bar")} using Pattern A/B/C.`
      },
      tone: arrangement?.tone ?? "warn"
    },
    {
      id: "finish",
      label: "Finish",
      value: analysis.status,
      detail: `${formatDb(analysis.headroomDb)} headroom / ${exportPreflight.headline}`,
      focusLabel: finishTone === "danger" || analysis.status !== "Ready" ? "Master" : "Deliver",
      target: finishTone === "danger" || analysis.status !== "Ready" ? "master" : "deliver",
      action: {
        id: "finish",
        label: `${masterFinishPadLabel(finishPad)} Finish`,
        detail: `Apply ${masterFinishPadLabel(finishPad)} master finish posture.`
      },
      tone: finishTone
    }
  ];
  const readyCount = cards.filter((card) => card.tone === "good").length;
  const reviewCount = cards.filter((card) => card.tone === "warn").length;
  const blockerCount = cards.filter((card) => card.tone === "danger").length;
  const nextCard = cards.find((card) => card.tone === "danger") ?? cards.find((card) => card.tone === "warn") ?? cards[cards.length - 1];
  const tone = weakestTone(cards.map((card) => card.tone));
  const statusLabel = tone === "good" ? "Beat Spine ready" : tone === "warn" ? "Beat Spine review" : "Beat Spine blocker";
  const decisionStatus = nextCard.action
    ? nextCard.tone === "danger"
      ? "Apply blocker"
      : nextCard.tone === "warn"
        ? "Apply review"
        : "Apply polish"
    : nextCard.tone === "good"
      ? "Jump ready"
      : "Jump inspect";
  const decisionLabel = nextCard.action ? `Apply ${nextCard.action.label}` : `Jump ${nextCard.focusLabel}`;
  const decisionDetail = nextCard.action
    ? `${nextCard.label}: ${nextCard.detail}`
    : `${nextCard.label}: inspect ${nextCard.focusLabel} before changing the beat.`;
  const decisionTitle = nextCard.action
    ? `Beat Spine recommends ${nextCard.action.label}: ${nextCard.action.detail}`
    : `Beat Spine recommends jumping to ${nextCard.focusLabel}: ${nextCard.detail}`;

  return {
    statusLabel,
    headline: `${nextCard.label}: ${nextCard.value}`,
    detail: `${style.name} direct composition / ${target.name} / Pattern ${project.selectedPattern}`,
    countLabel: `${readyCount}/${cards.length} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`,
    nextCardId: nextCard.id,
    decisionStatus,
    decisionLabel,
    decisionDetail,
    decisionTitle,
    tone,
    cards
  };
}

export function beatSpineIcon(cardId: BeatSpineCardId): ReactElement {
  switch (cardId) {
    case "setup":
      return <Gauge size={15} aria-hidden="true" />;
    case "drums":
      return <Drum size={15} aria-hidden="true" />;
    case "bass":
      return <Waves size={15} aria-hidden="true" />;
    case "harmony":
      return <Music2 size={15} aria-hidden="true" />;
    case "melody":
      return <KeyboardMusic size={15} aria-hidden="true" />;
    case "sound":
      return <Sparkles size={15} aria-hidden="true" />;
    case "arrange":
      return <ListChecks size={15} aria-hidden="true" />;
    case "finish":
      return <Download size={15} aria-hidden="true" />;
  }
}

export function createFirstBeatPathSummary(
  project: ProjectState,
  style: StyleProfile,
  workflowItems: WorkflowNavigatorItem[],
  beatMap: BeatMapSummary,
  exportPreflight: ExportPreflightSummary,
  analysis: ExportAnalysis
): FirstBeatPathSummary {
  const target = activeDeliveryTarget(project);
  const stage = (id: string): BeatMapStage | null => beatMap.stages.find((candidate) => candidate.id === id) ?? null;
  const workflow = (id: WorkflowZoneId): WorkflowNavigatorItem | null =>
    workflowItems.find((candidate) => candidate.id === id) ?? null;
  const startStage = stage("start");
  const composeItem = workflow("compose");
  const arrangeItem = workflow("arrange");
  const mixItem = workflow("mix");
  const deliverItem = workflow("deliver");
  const setupTone: MixCoachTone = project.bpm >= style.bpmRange[0] && project.bpm <= style.bpmRange[1] ? "good" : "warn";
  const steps: FirstBeatPathStep[] = [
    {
      id: "setup",
      label: "Setup",
      value: `${style.name} / ${project.key}`,
      detail: `${project.bpm} BPM / ${startStage?.status ?? "Start ready"}`,
      jumpLabel: "Transport",
      target: "transport",
      tone: weakestTone([setupTone, startStage?.tone ?? "good"])
    },
    {
      id: "compose",
      label: "Compose",
      value: composeItem?.value ?? `Pattern ${project.selectedPattern}`,
      detail: composeItem?.detail ?? "Write drums, 808, chords, and melody",
      jumpLabel: "Compose",
      target: "compose",
      tone: composeItem?.tone ?? "warn"
    },
    {
      id: "arrange",
      label: "Arrange",
      value: arrangeItem?.value ?? barCountLabel(arrangementTotalBars(project)),
      detail: arrangeItem?.detail ?? "Place Pattern A/B/C into song sections",
      jumpLabel: "Arrange",
      target: "arrange",
      tone: arrangeItem?.tone ?? "warn"
    },
    {
      id: "mix",
      label: "Mix",
      value: mixItem?.value ?? analysis.status,
      detail: mixItem?.detail ?? `${formatDb(analysis.headroomDb)} headroom / scan balance`,
      jumpLabel: "Mix",
      target: "mix",
      tone: mixItem?.tone ?? "warn"
    },
    {
      id: "deliver",
      label: "Deliver",
      value: deliverItem?.value ?? exportPreflight.headline,
      detail: deliverItem?.detail ?? exportPreflight.detail,
      jumpLabel: "Deliver",
      target: "deliver",
      tone: weakestTone([deliverItem?.tone ?? "warn", exportPreflight.tone])
    }
  ];
  const readyCount = steps.filter((step) => step.tone === "good").length;
  const reviewCount = steps.filter((step) => step.tone === "warn").length;
  const blockerCount = steps.filter((step) => step.tone === "danger").length;
  const nextStep = steps.find((step) => step.tone === "danger") ?? steps.find((step) => step.tone === "warn") ?? steps[steps.length - 1];
  const tone = weakestTone(steps.map((step) => step.tone));
  const statusLabel = tone === "good" ? "Beat path ready" : tone === "warn" ? "Beat path review" : "Beat path blocker";
  const decisionStatus =
    nextStep.tone === "danger" ? "Path blocker" : nextStep.tone === "warn" ? "Path review" : "Path ready";
  const decisionLabel = `Jump ${nextStep.jumpLabel}`;
  const decisionDetail = `${nextStep.label}: ${nextStep.detail}`;
  const decisionTitle = `First Beat Path recommends ${decisionLabel}: ${nextStep.detail}`;

  return {
    statusLabel,
    headline: `${nextStep.label}: ${nextStep.value}`,
    detail: `${target.name} / ${project.mode === "guided" ? "guided route" : "studio scan"} / next jump ${nextStep.jumpLabel}`,
    countLabel: `${readyCount}/5 ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`,
    nextStepId: nextStep.id,
    decisionStatus,
    decisionLabel,
    decisionDetail,
    decisionTitle,
    tone,
    steps
  };
}

export function createFirstBeatPathJumpResult(
  step: FirstBeatPathStep,
  summary: FirstBeatPathSummary
): FirstBeatPathJumpResult {
  return {
    stepId: step.id,
    status: "Jumped",
    title: `${step.label} jump ready`,
    detail: `${step.jumpLabel}: ${step.detail}`,
    metricLabel: "Path",
    metricValue: `${summary.countLabel} / ${step.value}`,
    auditionCue: firstBeatPathJumpAuditionCue(step),
    nextCheck: firstBeatPathJumpNextCheck(step, summary),
    tone: step.tone
  };
}

export function firstBeatPathJumpAuditionCue(step: FirstBeatPathStep): string {
  switch (step.id) {
    case "setup":
      return "Confirm BPM, key, style, and transport loop before writing the next layer.";
    case "compose":
      return "Edit drums, 808/bass, chords, or melody as local musical events in Compose.";
    case "arrange":
      return "Audition section flow with Song, Block, or Pattern loop controls before changing form.";
    case "mix":
      return "Use Stem Audition, Mix Coach, or Mix Fix only after choosing an explicit mix move.";
    case "deliver":
      return "Check Export Preflight and Handoff Pack before explicit WAV, stems, MIDI, or sheet export.";
  }
}

export function firstBeatPathJumpNextCheck(step: FirstBeatPathStep, summary: FirstBeatPathSummary): string {
  const activeStep = summary.steps.find((candidate) => candidate.id === summary.nextStepId) ?? step;
  switch (step.id) {
    case "setup":
      return `Next path check: ${activeStep.label} / ${summary.countLabel}.`;
    case "compose":
      return "Use Beat Spine, Composer Actions, or the editor lanes for the next missing musical layer.";
    case "arrange":
      return "Return to First Beat Path after sections cover the target and the hook has contrast.";
    case "mix":
      return "Return after headroom, stem balance, and low-end posture are ready for the target.";
    case "deliver":
      return "Export only after readiness, master posture, and handoff context pass the preflight scan.";
  }
}

export function createSessionPassSummary(
  project: ProjectState,
  firstBeatPath: FirstBeatPathSummary,
  reviewQueue: ReviewQueueSummary,
  finishChecklist: FinishChecklistSummary,
  exportPreflight: ExportPreflightSummary
): SessionPassSummary {
  const guidedStep =
    firstBeatPath.steps.find((step) => step.id === firstBeatPath.nextStepId) ??
    firstBeatPath.steps.find((step) => step.tone !== "good") ??
    firstBeatPath.steps[0];
  const studioIssue = reviewQueue.items[0];
  const finishCard =
    finishChecklist.cards.find((card) => card.tone === "danger") ??
    finishChecklist.cards.find((card) => card.tone === "warn") ??
    finishChecklist.cards[finishChecklist.cards.length - 1];
  const deliveryCard = activeExportPreflightQuickActionCard(exportPreflight);
  const guidedTarget = guidedStep?.target ?? "compose";
  const studioTarget = studioIssue?.focusTarget ?? "deliver";
  const finishTarget = finishCard?.focusTarget ?? "master";
  const deliveryTarget = deliveryCard?.focusTarget ?? "deliver";
  const cards: SessionPassCard[] = [
    {
      id: "guided",
      label: "Guided pass",
      value: guidedStep ? `${guidedStep.label}: ${guidedStep.value}` : firstBeatPath.headline,
      detail: guidedStep?.detail ?? firstBeatPath.detail,
      tone: guidedStep?.tone ?? firstBeatPath.tone,
      focusTarget: guidedTarget,
      focusLabel: sessionPassFocusLabel(guidedTarget)
    },
    {
      id: "studio",
      label: "Studio pass",
      value: studioIssue ? `${studioIssue.area}: ${studioIssue.status}` : reviewQueue.headline,
      detail: studioIssue?.detail ?? reviewQueue.detail,
      tone: studioIssue?.tone ?? reviewQueue.tone,
      focusTarget: studioTarget,
      focusLabel: sessionPassFocusLabel(studioTarget)
    },
    {
      id: "finish",
      label: "Finish pass",
      value: finishCard ? `${finishCard.label}: ${finishCard.status}` : finishChecklist.headline,
      detail: finishCard?.detail ?? finishChecklist.detail,
      tone: finishCard?.tone ?? finishChecklist.tone,
      focusTarget: finishTarget,
      focusLabel: sessionPassFocusLabel(finishTarget)
    },
    {
      id: "deliver",
      label: "Delivery pass",
      value: deliveryCard ? `${deliveryCard.label}: ${deliveryCard.value}` : exportPreflight.headline,
      detail: deliveryCard?.detail ?? exportPreflight.detail,
      tone: deliveryCard?.tone ?? exportPreflight.tone,
      focusTarget: deliveryTarget,
      focusLabel: sessionPassFocusLabel(deliveryTarget)
    }
  ];
  const activeCard = project.mode === "guided" ? cards[0] : cards[1];
  const tone = weakestTone(cards.map((card) => card.tone));
  const decisionStatus =
    activeCard.tone === "danger" ? "Session blocker" : activeCard.tone === "warn" ? "Session review" : "Session ready";
  const decisionLabel = `Focus ${activeCard.focusLabel}`;
  const decisionDetail = `${activeCard.label}: ${activeCard.detail}`;
  const decisionTitle = `Session Pass recommends ${decisionLabel}: ${activeCard.detail}`;

  return {
    mode: project.mode,
    headline: `${activeCard.label}: ${activeCard.value}`,
    detail: `${firstBeatPath.countLabel} / ${reviewQueue.headline} / ${exportPreflight.headline}`,
    activeCardId: activeCard.id,
    decisionStatus,
    decisionLabel,
    decisionDetail,
    decisionTitle,
    decisionTone: activeCard.tone,
    tone,
    cards
  };
}

export function activeSessionPassQuickActionCard(summary: SessionPassSummary): SessionPassCard {
  return summary.mode === "guided" ? summary.cards[0] : summary.cards[1];
}

export type GuideQuickStartQuickActionTarget = {
  source: "path" | "session" | "workflow";
  title: string;
  completionBottleneck: string;
  context: string;
  destination: string;
  detail: string;
  completionBreakdown: string;
  metricValue: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
  keywords: string;
};

export function activeGuideQuickStartQuickActionTarget({
  completionBottleneck,
  completionBreakdown,
  completionScore,
  firstBeatPathStep,
  firstBeatPathSummary,
  sessionPassCard,
  sessionPassSummary,
  workflowSpotlight,
  workflowSpotlightItem
}: {
  completionBottleneck: string;
  completionBreakdown: string;
  completionScore: ReturnType<typeof createGuideQuickStartCompletionScore>;
  firstBeatPathStep: FirstBeatPathStep | null;
  firstBeatPathSummary: FirstBeatPathSummary;
  sessionPassCard: SessionPassCard;
  sessionPassSummary: SessionPassSummary;
  workflowSpotlight: ReturnType<typeof createWorkflowSpotlightSummary>;
  workflowSpotlightItem: WorkflowNavigatorItem | null;
}): GuideQuickStartQuickActionTarget | null {
  const candidates: GuideQuickStartQuickActionTarget[] = [];

  if (firstBeatPathStep) {
    candidates.push({
      source: "path",
      title: `Guide Quick Start: ${firstBeatPathStep.label}`,
      completionBottleneck,
      context: firstBeatPathStep.detail,
      destination: firstBeatPathStep.jumpLabel,
      detail: `First Beat Path / ${firstBeatPathStep.value} / ${firstBeatPathStep.detail}`,
      completionBreakdown,
      metricValue: `${firstBeatPathSummary.countLabel} / ${firstBeatPathStep.value} / ${completionScore.statusLabel}: ${completionScore.scoreLabel}`,
      auditionCue: "Use the focused First Beat Path panel before changing the beat.",
      nextCheck: "Return to Guide Quick Start after the step is ready or intentionally deferred.",
      tone: firstBeatPathStep.tone,
      keywords: `${firstBeatPathStep.id} ${firstBeatPathStep.label} ${firstBeatPathStep.jumpLabel} ${firstBeatPathStep.detail} ${completionScore.statusLabel} ${completionScore.scoreLabel} ${completionScore.metricLabel} ${completionBreakdown} ${completionBottleneck}`
    });
  }

  candidates.push({
    source: "session",
    title: `Guide Quick Start: ${sessionPassCard.label}`,
    completionBottleneck,
    context: sessionPassCard.detail,
    destination: sessionPassCard.focusLabel,
    detail: `Session Pass / ${sessionPassCard.value} / ${sessionPassCard.focusLabel}`,
    completionBreakdown,
    metricValue: `${sessionPassSummary.headline} / ${sessionPassCard.detail} / ${completionScore.statusLabel}: ${completionScore.scoreLabel}`,
    auditionCue: "Use the focused Session Pass panel before changing the beat.",
    nextCheck: "Return to Guide Quick Start for the next guided or studio pass target.",
    tone: sessionPassCard.tone,
    keywords: `${sessionPassCard.id} ${sessionPassCard.label} ${sessionPassCard.value} ${sessionPassCard.focusLabel} ${completionScore.statusLabel} ${completionScore.scoreLabel} ${completionScore.metricLabel} ${completionBreakdown} ${completionBottleneck}`
  });

  if (workflowSpotlightItem) {
    candidates.push({
      source: "workflow",
      title: `Guide Quick Start: ${workflowSpotlight.zoneLabel}`,
      completionBottleneck,
      context: workflowSpotlightItem.detail,
      destination: workflowSpotlightItem.label,
      detail: `Workflow Spotlight / ${workflowSpotlight.statusLabel} / ${workflowSpotlight.detailLabel}`,
      completionBreakdown,
      metricValue: `${workflowSpotlight.countLabel} / ${workflowSpotlightItem.detail} / ${completionScore.statusLabel}: ${completionScore.scoreLabel}`,
      auditionCue: "Use the highlighted Workflow Spotlight zone before changing project data.",
      nextCheck: "Return to Guide Quick Start after the zone looks ready or needs another pass.",
      tone: workflowSpotlight.tone,
      keywords: `${workflowSpotlightItem.id} ${workflowSpotlightItem.label} ${workflowSpotlightItem.value} ${workflowSpotlightItem.detail} ${completionScore.statusLabel} ${completionScore.scoreLabel} ${completionScore.metricLabel} ${completionBreakdown} ${completionBottleneck}`
    });
  }

  return candidates.reduce<GuideQuickStartQuickActionTarget | null>((selected, candidate) => {
    if (!selected) {
      return candidate;
    }
    return guideQuickStartToneRank(candidate.tone) > guideQuickStartToneRank(selected.tone) ? candidate : selected;
  }, null);
}

export function activeGuideQuickStartBottleneckQuickActionTarget({
  bottleneckItem,
  completionBottleneck,
  completionBreakdown,
  firstBeatPathStep,
  firstBeatPathSummary,
  sessionPassCard,
  sessionPassSummary,
  workflowSpotlight,
  workflowSpotlightItem
}: {
  bottleneckItem: ReturnType<typeof createGuideQuickStartCompletionBottleneckItem>;
  completionBottleneck: string;
  completionBreakdown: string;
  firstBeatPathStep: FirstBeatPathStep | null;
  firstBeatPathSummary: FirstBeatPathSummary;
  sessionPassCard: SessionPassCard;
  sessionPassSummary: SessionPassSummary;
  workflowSpotlight: ReturnType<typeof createWorkflowSpotlightSummary>;
  workflowSpotlightItem: WorkflowNavigatorItem | null;
}): GuideQuickStartQuickActionTarget | null {
  if (!bottleneckItem) {
    return null;
  }

  const bottleneckMetric = `${bottleneckItem.scoreLabel} / ${bottleneckItem.metricLabel}`;

  switch (bottleneckItem.id) {
    case "path":
      if (!firstBeatPathStep) {
        return null;
      }
      return {
        source: "path",
        title: `Guide Bottleneck Focus: ${firstBeatPathStep.label}`,
        completionBottleneck,
        context: firstBeatPathStep.detail,
        destination: firstBeatPathStep.jumpLabel,
        detail: `Bottleneck Path / ${firstBeatPathStep.value} / ${firstBeatPathStep.detail}`,
        completionBreakdown,
        metricValue: `${bottleneckMetric} / ${firstBeatPathSummary.countLabel}`,
        auditionCue: "Use the focused First Beat Path bottleneck before changing the beat.",
        nextCheck: "Return to Guide Quick Start and confirm the path score or bottleneck label changed.",
        tone: bottleneckItem.tone,
        keywords: `guide bottleneck focus lowest completion lane path first beat ${firstBeatPathStep.id} ${firstBeatPathStep.label} ${firstBeatPathStep.jumpLabel} ${firstBeatPathStep.detail} ${completionBreakdown} ${completionBottleneck}`
      };
    case "session":
      return {
        source: "session",
        title: `Guide Bottleneck Focus: ${sessionPassCard.label}`,
        completionBottleneck,
        context: sessionPassCard.detail,
        destination: sessionPassCard.focusLabel,
        detail: `Bottleneck Session / ${sessionPassCard.value} / ${sessionPassCard.focusLabel}`,
        completionBreakdown,
        metricValue: `${bottleneckMetric} / ${sessionPassSummary.headline}`,
        auditionCue: "Use the focused Session Pass bottleneck before changing the beat.",
        nextCheck: "Return to Guide Quick Start and confirm the session score or bottleneck label changed.",
        tone: bottleneckItem.tone,
        keywords: `guide bottleneck focus lowest completion lane session pass ${sessionPassCard.id} ${sessionPassCard.label} ${sessionPassCard.value} ${sessionPassCard.focusLabel} ${completionBreakdown} ${completionBottleneck}`
      };
    case "workflow":
      if (!workflowSpotlightItem) {
        return null;
      }
      return {
        source: "workflow",
        title: `Guide Bottleneck Focus: ${workflowSpotlight.zoneLabel}`,
        completionBottleneck,
        context: workflowSpotlightItem.detail,
        destination: workflowSpotlightItem.label,
        detail: `Bottleneck Workflow / ${workflowSpotlight.statusLabel} / ${workflowSpotlight.detailLabel}`,
        completionBreakdown,
        metricValue: `${bottleneckMetric} / ${workflowSpotlight.countLabel}`,
        auditionCue: "Use the highlighted Workflow Spotlight bottleneck before changing project data.",
        nextCheck: "Return to Guide Quick Start and confirm the workflow score or bottleneck label changed.",
        tone: bottleneckItem.tone,
        keywords: `guide bottleneck focus lowest completion lane workflow spotlight ${workflowSpotlightItem.id} ${workflowSpotlightItem.label} ${workflowSpotlightItem.value} ${workflowSpotlightItem.detail} ${completionBreakdown} ${completionBottleneck}`
      };
  }
}

export function guideQuickStartCompletionBreakdownLabel(
  breakdownItems: ReturnType<typeof createGuideQuickStartCompletionBreakdownItems>
): string {
  const summary = breakdownItems
    .map((item) => `${guideQuickStartCompletionBreakdownName(item.id)} ${item.scoreLabel.replace(` ${item.id}`, "")}`)
    .join("; ");
  return `Breakdown ${summary}`;
}

export function guideQuickStartCommandDetail(target: GuideQuickStartQuickActionTarget): string {
  return [
    target.detail,
    `Destination ${target.destination}`,
    `Metric ${target.metricValue}`,
    `Context ${target.context}`,
    `Audition ${target.auditionCue}`,
    `Next ${target.nextCheck}`,
    target.completionBreakdown,
    target.completionBottleneck
  ].join(" / ");
}

export function guideQuickStartCompletionBreakdownName(id: "path" | "session" | "workflow"): string {
  switch (id) {
    case "path":
      return "Path";
    case "session":
      return "Session";
    case "workflow":
      return "Workflow";
  }
}

export function guideQuickStartToneRank(tone: MixCoachTone): number {
  switch (tone) {
    case "danger":
      return 3;
    case "warn":
      return 2;
    case "good":
      return 1;
  }
}

export function createSessionPassFocusResult(card: SessionPassCard, summary: SessionPassSummary): SessionPassFocusResult {
  return {
    cardId: card.id,
    status: "Focused",
    title: `${card.label} focused`,
    detail: `${card.focusLabel}: ${card.value}`,
    metricLabel: "Session",
    metricValue: sessionPassFocusResultMetric(summary),
    auditionCue: sessionPassFocusResultAudition(card),
    nextCheck: sessionPassFocusResultNextCheck(card),
    tone: card.tone
  };
}

export function sessionPassFocusResultMetric(summary: SessionPassSummary): string {
  const readyCount = summary.cards.filter((card) => card.tone === "good").length;
  const reviewCount = summary.cards.filter((card) => card.tone === "warn").length;
  const blockerCount = summary.cards.filter((card) => card.tone === "danger").length;
  return `${readyCount}/${summary.cards.length} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function sessionPassFocusResultAudition(card: SessionPassCard): string {
  switch (card.id) {
    case "guided":
      return "Use First Beat Path and Beat Spine to move through the next direct beat-making step.";
    case "studio":
      return "Use Review Queue, Production Snapshot, and Workflow Navigator before choosing a fix.";
    case "finish":
      return "Use Finish Checklist, Mix Coach, and Master controls before final moves.";
    case "deliver":
      return "Use Export Preflight and Handoff Pack before explicit WAV, stems, MIDI, or sheet export.";
  }
}

export function sessionPassFocusResultNextCheck(card: SessionPassCard): string {
  switch (card.id) {
    case "guided":
      return "Return after the guided step is ready or intentionally deferred.";
    case "studio":
      return "Return after the top studio issue is reviewed or fixed explicitly.";
    case "finish":
      return "Return after compose, arrange, mix, master, automation, and handoff checks are ready.";
    case "deliver":
      return "Return after deliverables and handoff context match the selected target.";
  }
}

export function sessionPassCommandDetail(card: SessionPassCard, summary: SessionPassSummary): string {
  return [
    card.value,
    `Destination ${card.focusLabel}`,
    `Session ${sessionPassFocusResultMetric(summary)}`,
    `Context ${card.detail}`,
    `Audition ${sessionPassFocusResultAudition(card)}`,
    `Next ${sessionPassFocusResultNextCheck(card)}`
  ].join(" / ");
}

export function activeFirstBeatPathQuickActionStep(summary: FirstBeatPathSummary): FirstBeatPathStep | null {
  return summary.steps.find((step) => step.id === summary.nextStepId) ?? summary.steps.find((step) => step.tone !== "good") ?? summary.steps[0] ?? null;
}

export function activeModeFocusQuickActionCard(summary: ModeFocusSummary): ModeFocusCard | null {
  const preferredId = preferredModeFocusCardId(summary.mode);
  return summary.cards.find((card) => card.id === preferredId) ?? summary.cards[0] ?? null;
}

export function createModeFocusJumpResult(card: ModeFocusCard, summary: ModeFocusSummary): ModeFocusJumpResult {
  return {
    cardId: card.id,
    status: "Jumped",
    title: `${card.label} jump ready`,
    detail: `${card.focusLabel}: ${card.value}`,
    metricLabel: "Mode",
    metricValue: modeFocusJumpResultMetric(summary),
    auditionCue: modeFocusJumpResultAudition(card, summary),
    nextCheck: modeFocusJumpResultNextCheck(card, summary),
    tone: card.tone
  };
}

export function modeFocusJumpResultMetric(summary: ModeFocusSummary): string {
  const readyCount = summary.cards.filter((card) => card.tone === "good").length;
  const reviewCount = summary.cards.filter((card) => card.tone === "warn").length;
  const blockerCount = summary.cards.filter((card) => card.tone === "danger").length;
  return `${modeLabel(summary.mode)} / ${readyCount}/${summary.cards.length} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function modeFocusJumpResultAudition(card: ModeFocusCard, summary: ModeFocusSummary): string {
  if (summary.mode === "guided") {
    switch (card.id) {
      case "stage":
        return "Use the focused workstation panel to move the current beat-making stage forward.";
      case "focus":
        return "Use the focused writing lane for drums, 808/bass, harmony, melody, arrangement, or finish work.";
      case "check":
        return "Use the local check target before changing mix, master, handoff, or export decisions.";
      default:
        return "Use the Guided focus card as the next direct beat-making checkpoint.";
    }
  }

  switch (card.id) {
    case "session":
      return "Use the focused studio pass to inspect mix, finish, and session readiness.";
    case "issue":
      return "Use the focused issue panel before choosing an explicit review fix.";
    case "handoff":
      return "Use the focused handoff target before WAV, stems, MIDI, or sheet export.";
    default:
      return "Use the Studio focus card as the next producer-level session checkpoint.";
  }
}

export function modeFocusJumpResultNextCheck(card: ModeFocusCard, summary: ModeFocusSummary): string {
  if (summary.mode === "guided") {
    switch (card.id) {
      case "stage":
        return "Return to Mode Focus after the current stage is ready or intentionally deferred.";
      case "focus":
        return "Return after the writing lane has a usable musical event or a clear reason to defer.";
      case "check":
        return "Return after the local check no longer blocks the first beat path.";
      default:
        return "Return to Mode Focus for the next Guided orientation card.";
    }
  }

  switch (card.id) {
    case "session":
      return "Return after the session scan is ready for the selected delivery target.";
    case "issue":
      return "Return after the top studio issue is reviewed or fixed explicitly.";
    case "handoff":
      return "Return after handoff context and deliverables match the selected target.";
    default:
      return "Return to Mode Focus for the next Studio orientation card.";
  }
}

export function modeFocusCommandDetail(card: ModeFocusCard, summary: ModeFocusSummary): string {
  return [
    card.value,
    `Destination ${card.focusLabel}`,
    `Mode ${modeFocusJumpResultMetric(summary)}`,
    `Context ${card.detail}`,
    `Audition ${modeFocusJumpResultAudition(card, summary)}`,
    `Next ${modeFocusJumpResultNextCheck(card, summary)}`
  ].join(" / ");
}

export function activeBeatSpineQuickActionCard(summary: BeatSpineSummary): BeatSpineCard | null {
  return summary.cards.find((card) => card.id === summary.nextCardId) ?? summary.cards[0] ?? null;
}

export function activeBeatSpineQuickActionApplyCard(summary: BeatSpineSummary): BeatSpineCard | null {
  const nextCard = activeBeatSpineQuickActionCard(summary);
  if (nextCard?.action) {
    return nextCard;
  }

  return summary.cards.find((card) => card.tone !== "good" && card.action) ?? summary.cards.find((card) => card.action) ?? null;
}

export function activeKeyCompassQuickActionItem(summary: KeyCompassSummary): KeyCompassCard | null {
  return (
    summary.cards.find((card) => card.tone === "danger") ??
    summary.cards.find((card) => card.tone === "warn") ??
    summary.cards[0] ??
    null
  );
}

export function activeGrooveCompassQuickActionItem(summary: GrooveCompassSummary): GrooveCompassCard | null {
  return (
    summary.cards.find((card) => card.tone === "danger") ??
    summary.cards.find((card) => card.tone === "warn") ??
    summary.cards[0] ??
    null
  );
}

export function activePatternDnaQuickActionCard(summary: PatternDnaSummary): PatternDnaCard | null {
  return summary.cards.find((card) => card.tone !== "good") ?? summary.cards[0] ?? null;
}

export function activeLayerStarterQuickActionOption(options: LayerStarterOption[]): LayerStarterOption | null {
  return layerStarterPriorityOption(options);
}

export function activeDrumMoveQuickActionTarget(
  project: ProjectState,
  preview: DrumMovePreviewSummary
): DrumMoveQuickActionTarget | null {
  if (preview.statusLabel === "Drums aligned") {
    return null;
  }

  const pattern = activePattern(project);
  const foundation =
    preview.foundationId === "none"
      ? null
      : drumFoundationDefinitions.find((definition) => definition.id === preview.foundationId) ?? null;
  const feel = preview.feelId === "none" ? null : grooveFeelDefinitions.find((definition) => definition.id === preview.feelId) ?? null;
  const accent =
    preview.accentId === "none" ? null : drumAccentDefinitions.find((definition) => definition.id === preview.accentId) ?? null;
  const hitCount = activeDrumHitCount(pattern);
  const foundationMoves = foundation ? drumFoundationMoveCount(pattern, foundation) : 0;
  const feelMoves = feel ? drumFeelMoveCount(pattern, feel) : 0;
  const accentMoves = accent ? drumAccentMoveCount(pattern, accent) : 0;

  if (hitCount === 0 && foundation && foundationMoves > 0) {
    return { kind: "Foundation", id: foundation.id, label: foundation.label };
  }

  if (feel && feelMoves > 0) {
    return { kind: "Feel", id: feel.id, label: feel.label };
  }

  if (accent && accentMoves > 0) {
    return { kind: "Accent", id: accent.id, label: accent.label };
  }

  if (foundation && foundationMoves > 0) {
    return { kind: "Foundation", id: foundation.id, label: foundation.label };
  }

  return null;
}

export function activeBassMoveQuickActionTarget(
  project: ProjectState,
  preview: BassMovePreviewSummary
): BassMoveQuickActionTarget | null {
  if (preview.statusLabel === "808 aligned") {
    return null;
  }

  const pattern = activePattern(project);
  const bassline =
    preview.basslineId === "none" ? null : basslinePadDefinitions.find((definition) => definition.id === preview.basslineId) ?? null;
  const glide =
    preview.glideId === "none" ? null : bassGlidePadDefinitions.find((definition) => definition.id === preview.glideId) ?? null;
  const contour =
    preview.contourId === "none" ? null : bassContourDefinitions.find((definition) => definition.id === preview.contourId) ?? null;

  if (pattern.bassNotes.length === 0 && bassline) {
    return { kind: "Bassline", id: bassline.id, label: bassline.label };
  }

  if (pattern.bassNotes.some((note) => note.glide) && contour) {
    return { kind: "Contour", id: contour.id, label: contour.label };
  }

  if (glide) {
    return { kind: "Glide", id: glide.id, label: glide.label };
  }

  if (contour) {
    return { kind: "Contour", id: contour.id, label: contour.label };
  }

  return bassline ? { kind: "Bassline", id: bassline.id, label: bassline.label } : null;
}

export function activeChordMoveQuickActionTarget(
  project: ProjectState,
  selectedChord: ChordEvent | undefined,
  preview: ChordMovePreviewSummary
): ChordMoveQuickActionTarget | null {
  if (!selectedChord || preview.statusLabel === "Select chord" || preview.statusLabel === "Chord aligned") {
    return null;
  }

  const pattern = activePattern(project);
  const pad =
    preview.padId === "none"
      ? null
      : createChordPadOptions(project.key, selectedChord).find((option) => option.id === preview.padId) ?? null;
  const rhythm =
    preview.rhythmId === "none"
      ? null
      : createChordRhythmOptions(pattern.chordEvents).find((option) => option.id === preview.rhythmId) ?? null;
  const voicing =
    preview.voicingId === "none"
      ? null
      : createChordVoicingOptions(selectedChord).find((option) => option.id === preview.voicingId) ?? null;
  const harmonicSummary = selectedChordHarmonicSummary(project.key, selectedChord);

  if (!harmonicSummary.inKey && pad && !pad.selected) {
    return { kind: "Pad", id: pad.id, label: pad.label };
  }

  if (rhythm && rhythm.changedCount > 0) {
    return { kind: "Rhythm", id: rhythm.id, label: rhythm.label };
  }

  if (voicing && !voicing.selected) {
    return { kind: "Voicing", id: voicing.id, label: voicing.label };
  }

  if (pad && !pad.selected) {
    return { kind: "Pad", id: pad.id, label: pad.label };
  }

  return null;
}

export function activeMelodyMoveQuickActionTarget(
  project: ProjectState,
  preview: MelodyMovePreviewSummary
): MelodyMoveQuickActionTarget | null {
  if (preview.statusLabel === "Melody aligned") {
    return null;
  }

  const pattern = activePattern(project);
  const motif =
    preview.motifId === "none" ? null : melodyMotifDefinitions.find((definition) => definition.id === preview.motifId) ?? null;
  const accent =
    preview.accentId === "none" ? null : melodyAccentDefinitions.find((definition) => definition.id === preview.accentId) ?? null;
  const contour =
    preview.contourId === "none" ? null : melodyContourDefinitions.find((definition) => definition.id === preview.contourId) ?? null;

  if (pattern.melodyNotes.length === 0 && motif) {
    return { kind: "Motif", id: motif.id, label: motif.label };
  }

  const pitchCount = new Set(pattern.melodyNotes.map((note) => note.pitch)).size;
  if (pitchCount <= 2 && contour) {
    return { kind: "Contour", id: contour.id, label: contour.label };
  }

  if (accent) {
    return { kind: "Accent", id: accent.id, label: accent.label };
  }

  if (contour) {
    return { kind: "Contour", id: contour.id, label: contour.label };
  }

  return motif ? { kind: "Motif", id: motif.id, label: motif.label } : null;
}

export function activeListeningPassQuickActionItem(summary: ListeningPassSummary): ListeningPassItem | null {
  return summary.items.find((item) => item.tone !== "good") ?? summary.items[0] ?? null;
}

export function activeProductionSnapshotQuickActionMetric(summary: ProductionSnapshotSummary): ProductionSnapshotMetric | null {
  return summary.metrics.find((metric) => metric.tone !== "good") ?? summary.metrics[0] ?? null;
}

export function activeFinishChecklistQuickActionCard(summary: FinishChecklistSummary): FinishChecklistCard | null {
  return summary.cards.find((card) => card.tone !== "good") ?? summary.cards[0] ?? null;
}

export function activeBeatPassportQuickActionMetric(summary: BeatPassportSummary): BeatPassportMetric | null {
  return summary.metrics.find((metric) => metric.tone !== "good") ?? summary.metrics[0] ?? null;
}

export function activeBeatReadinessQuickActionCheck(checks: BeatReadinessCheck[]): BeatReadinessCheck | null {
  return beatReadinessPriorityCheck(checks);
}

export function beatReadinessCardActionId(check: BeatReadinessCheck): string {
  return `beat-readiness-check-${check.id}`;
}

export function beatReadinessQuickActionCheck(project: ProjectState, actionId: string): BeatReadinessCheck | null {
  if (
    actionId !== "beat-readiness-route-readout-action" &&
    actionId !== "beat-readiness-focus" &&
    !actionId.startsWith("beat-readiness-check-")
  ) {
    return null;
  }

  const checks = createBeatReadinessChecks(project, analyzeExport(project));
  return beatReadinessQuickActionCheckFromChecks(checks, actionId);
}

export function beatReadinessQuickActionCheckFromChecks(
  checks: BeatReadinessCheck[],
  actionId: string
): BeatReadinessCheck | null {
  if (
    actionId !== "beat-readiness-route-readout-action" &&
    actionId !== "beat-readiness-focus" &&
    !actionId.startsWith("beat-readiness-check-")
  ) {
    return null;
  }

  if (actionId === "beat-readiness-route-readout-action" || actionId === "beat-readiness-focus") {
    return activeBeatReadinessQuickActionCheck(checks);
  }

  const checkId = actionId.replace("beat-readiness-check-", "");
  return checks.find((check) => check.id === checkId) ?? null;
}

export function activeStyleInspectorQuickActionItem(
  summary: StyleInspectorSummary,
  project: ProjectState
): StyleInspectorFocusItem | null {
  const bpmMetric = summary.metrics.find((metric) => metric.id === "bpm") ?? null;
  if (bpmMetric && (project.bpm < summary.profile.bpmRange[0] || project.bpm > summary.profile.bpmRange[1])) {
    return bpmMetric;
  }

  const swingMetric = summary.metrics.find((metric) => metric.id === "swing") ?? null;
  if (swingMetric && Math.abs(project.swing - summary.profile.defaultSwing) > 0.001) {
    return swingMetric;
  }

  return (
    summary.goals.find((goal) => goal.tone === "danger") ??
    summary.goals.find((goal) => goal.tone === "warn") ??
    summary.patterns.find((pattern) => pattern.eventCount < 12) ??
    summary.patterns.find((pattern) => pattern.eventCount < 20) ??
    summary.metrics[0] ??
    summary.goals[0] ??
    summary.patterns[0] ??
    null
  );
}

export function activeExportPreflightQuickActionCard(summary: ExportPreflightSummary): ExportPreflightCard | null {
  return (
    summary.cards.find((card) => card.tone === "danger") ??
    summary.cards.find((card) => card.tone === "warn") ??
    summary.cards[0] ??
    null
  );
}

export type ExportPreflightPriority = {
  focusId: ExportPreflightFocusId | null;
  actionLabel: string;
  statusLabel: string;
  areaLabel: string;
  cardLabel: string;
  nextCheckLabel: string;
  title: string;
  tone: MixCoachTone;
};

export function sessionPassFocusLabel(target: SessionPassTarget): string {
  return target === "transport" ? "Transport" : reviewQueueFocusLabel(target);
}

export function ExportPreflight({
  focusedCardId,
  result,
  onFocus,
  sectionRef,
  summary
}: {
  focusedCardId: ExportPreflightFocusId | null;
  result: ExportPreflightFocusResult | null;
  onFocus: (card: ExportPreflightFocusItem) => void;
  sectionRef?: Ref<HTMLElement>;
  summary: ExportPreflightSummary;
}): ReactElement {
  const focusSummary = createExportPreflightFocusSummary(summary, focusedCardId);
  const priority = createExportPreflightPriority(summary);
  const priorityCard = summary.cards.find((card) => card.focusId === priority.focusId) ?? null;
  const priorityActionDisabled = priorityCard === null;

  return (
    <section
      className={["export-preflight", summary.tone, result ? "has-result" : ""].filter(Boolean).join(" ")}
      data-testid="export-preflight"
      aria-label="Export preflight"
      ref={sectionRef}
    >
      <div className="export-preflight-heading">
        <div>
          <ListChecks size={17} aria-hidden="true" />
          <span>Export Preflight</span>
        </div>
        <strong data-testid="export-preflight-headline">{summary.headline}</strong>
        <small data-testid="export-preflight-detail">{summary.detail}</small>
      </div>
      <div
        className={`export-preflight-focus-readout ${focusSummary.tone}`}
        data-testid="export-preflight-focus-readout"
        title={focusSummary.detailTitle}
      >
        <span data-testid="export-preflight-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="export-preflight-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="export-preflight-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      <div
        className={`export-preflight-priority ${priority.tone}`}
        data-export-preflight-priority={priority.focusId ?? "none"}
        data-testid="export-preflight-priority"
        title={priority.title}
      >
        <span data-testid="export-preflight-priority-status">{priority.statusLabel}</span>
        <strong data-testid="export-preflight-priority-label">{priority.areaLabel}</strong>
        <small data-testid="export-preflight-priority-card">{priority.cardLabel}</small>
        <small data-testid="export-preflight-priority-next-check">{priority.nextCheckLabel}</small>
        <button
          data-testid="export-preflight-priority-run"
          disabled={priorityActionDisabled}
          onClick={() => {
            if (priorityCard) {
              onFocus(priorityCard);
            }
          }}
          title={priorityCard ? `Focus ${priority.areaLabel}` : priority.title}
          type="button"
        >
          {priority.actionLabel}
        </button>
      </div>
      {result && <ExportPreflightFocusResultStrip result={result} />}
      <div className="export-preflight-grid" data-testid="export-preflight-grid">
        {summary.cards.map((card) => {
          const focused = focusedCardId === card.focusId;
          return (
            <div
              className={["export-preflight-card", card.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
              data-focused={focused ? "true" : "false"}
              data-testid={`export-preflight-${card.id}`}
              key={card.id}
            >
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <button
                aria-pressed={focused}
                className="export-preflight-focus-button"
                data-testid={`export-preflight-focus-${card.id}`}
                onClick={() => onFocus(card)}
                title={`Focus ${card.focusLabel}: ${card.label} ${card.value}`}
                type="button"
              >
                <ArrowRight size={13} aria-hidden="true" />
                <span>{card.focusLabel}</span>
              </button>
              <small>{card.detail}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function createExportPreflightPriority(summary: ExportPreflightSummary): ExportPreflightPriority {
  const card =
    summary.cards.find((item) => item.tone === "danger") ??
    summary.cards.find((item) => item.tone === "warn") ??
    summary.cards[0] ??
    null;

  if (!card) {
    return {
      focusId: null,
      actionLabel: "No lane",
      statusLabel: "Preflight clear",
      areaLabel: "No priority lane",
      cardLabel: "No Export Preflight cards available",
      nextCheckLabel: "Next: return after delivery-risk cards are available.",
      title: "Export Preflight priority has no available card.",
      tone: "warn"
    };
  }

  const statusLabel =
    card.tone === "danger" ? "Export blocker" : card.tone === "warn" ? "Export review" : "Export ready";
  const nextCheckLabel = exportPreflightPriorityNextCheck(card);

  return {
    focusId: card.focusId,
    actionLabel: "Focus lane",
    statusLabel,
    areaLabel: `${card.label}: ${card.value}`,
    cardLabel: `${card.focusLabel} priority / ${card.detail}`,
    nextCheckLabel,
    title: `${statusLabel}: ${card.label}: ${card.value} / ${card.detail} / ${nextCheckLabel}`,
    tone: card.tone
  };
}

export function exportPreflightPriorityNextCheck(card: ExportPreflightFocusItem): string {
  switch (card.focusId) {
    case "readiness":
      return "Next: clear composition and arrangement blockers.";
    case "mix":
      return "Next: check Full Mix, Mix Coach, and export meter.";
    case "automation":
      return "Next: play fades before WAV or stem export.";
    case "deliverables":
      return "Next: confirm WAV, stems, MIDI, and target length.";
    case "handoff":
      return "Next: confirm brief context and Handoff Sheet details.";
  }
}

export function ExportPreflightFocusResultStrip({ result }: { result: ExportPreflightFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`export-preflight-result ${result.tone}`}
      data-result-export-preflight={result.cardId}
      data-testid="export-preflight-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="export-preflight-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="export-preflight-result-title">{result.title}</strong>
          <small data-testid="export-preflight-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="export-preflight-result-destination" data-testid="export-preflight-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="export-preflight-result-metric" data-testid="export-preflight-result-metric">
        <span data-testid="export-preflight-result-status">{result.metricLabel}</span>
        <strong data-testid="export-preflight-result-value">{result.metricValue}</strong>
      </div>
      <div className="export-preflight-result-followup" data-testid="export-preflight-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export type HandoffExportFormatPriority = {
  metricId: HandoffExportFormatFocusId | null;
  actionLabel: string;
  statusLabel: string;
  areaLabel: string;
  metricLabel: string;
  nextCheckLabel: string;
  title: string;
  tone: MixCoachTone;
};

export type HandoffPackageCheckPriority = {
  focusId: HandoffPackageCheckFocusId | null;
  actionLabel: string;
  statusLabel: string;
  areaLabel: string;
  cardLabel: string;
  nextCheckLabel: string;
  title: string;
  tone: MixCoachTone;
};

export function HandoffPack({
  analysis,
  exportReceipt,
  exportFormatResult,
  focusedExportFormatId,
  focusedPackageCheckId,
  packageCheckSummary,
  packageCheckResult,
  project,
  isWavPreviewing,
  sectionRef,
  statusOpen,
  auditOpen,
  stemAnalyses,
  onExportDeliveryBundle,
  onExportHandoffSheet,
  onExportMidi,
  onExportStems,
  onExportWav,
  onToggleWavPreview,
  onFocusExportFormat,
  onFocusPackageCheck,
  onToggleStatus,
  onToggleAudit
}: {
  analysis: ExportAnalysis;
  exportReceipt: HandoffExportReceipt | null;
  exportFormatResult: HandoffExportFormatFocusResult | null;
  focusedExportFormatId: HandoffExportFormatFocusId | null;
  focusedPackageCheckId: HandoffPackageCheckFocusId | null;
  packageCheckSummary: HandoffPackageCheckSummary;
  packageCheckResult: HandoffPackageCheckFocusResult | null;
  project: ProjectState;
  isWavPreviewing: boolean;
  sectionRef?: Ref<HTMLElement>;
  statusOpen: boolean;
  auditOpen: boolean;
  stemAnalyses: StemExportAnalyses;
  onExportDeliveryBundle: () => void;
  onExportHandoffSheet: () => void;
  onExportMidi: () => void;
  onExportStems: () => void;
  onExportWav: () => void;
  onToggleWavPreview: () => void;
  onFocusExportFormat: (metric: HandoffExportFormatMetric) => void;
  onFocusPackageCheck: (card: HandoffPackageCheckCard) => void;
  onToggleStatus: () => void;
  onToggleAudit: () => void;
}): ReactElement {
  const items = createHandoffPackItems({
    analysis,
    project,
    stemAnalyses,
    onExportDeliveryBundle,
    onExportHandoffSheet,
    onExportMidi,
    onExportStems,
    onExportWav
  });
  const readyCount = items.filter((item) => item.tone === "good").length;
  const tone = weakestTone(items.map((item) => item.tone));
  const routeSummary = createHandoffPackRouteSummary(project, stemAnalyses, items, tone);
  const sendOrderSummary = createHandoffPackSendOrderSummary(project, items);
  const receiptSummary = exportReceipt ?? emptyHandoffExportReceipt();
  const fileManifest = createHandoffFileManifest(project, stemAnalyses, items);
  const manifestAudit = createHandoffManifestAudit(project, items, fileManifest, receiptSummary, sendOrderSummary);
  const formatSummary = createHandoffExportFormatSummary(project, analysis, stemAnalyses, items);
  const formatPriority = createHandoffExportFormatPriority(formatSummary);
  const formatPriorityMetric = formatSummary.metrics.find((metric) => metric.id === formatPriority.metricId) ?? null;
  const formatPriorityActionDisabled = formatPriorityMetric === null;
  const packageFocusSummary = createHandoffPackageCheckFocusSummary(packageCheckSummary, focusedPackageCheckId);
  const packagePriority = createHandoffPackageCheckPriority(packageCheckSummary);
  const packagePriorityCard = packageCheckSummary.cards.find((card) => card.focusId === packagePriority.focusId) ?? null;
  const packagePriorityActionDisabled = packagePriorityCard === null;

  return (
    <section className={`handoff-pack ${tone}`} data-testid="handoff-pack" aria-label="Handoff pack" ref={sectionRef}>
      <div className="handoff-pack-heading">
        <div>
          <Download size={17} aria-hidden="true" />
          <span>Handoff Pack</span>
        </div>
        <strong data-testid="handoff-pack-summary">
          {readyCount}/{items.length} ready
        </strong>
        <small data-testid="handoff-pack-detail">
          {handoffSheetFileName(project)}
        </small>
        <div
          aria-label={routeSummary.detailTitle}
          className={`handoff-pack-route-readout ${routeSummary.tone}`}
          data-testid="handoff-pack-route-readout"
          title={routeSummary.detailTitle}
        >
          <span data-testid="handoff-pack-route-status">{routeSummary.statusLabel}</span>
          <strong data-testid="handoff-pack-route-label">{routeSummary.routeLabel}</strong>
          <small data-testid="handoff-pack-route-detail">{routeSummary.detailLabel}</small>
          <small data-testid="handoff-pack-route-file">{routeSummary.fileLabel}</small>
        </div>
      </div>
      <div className="handoff-pack-direct" data-testid="handoff-pack-direct">
        <div className="handoff-pack-direct-heading">
          <span>Choose a deliverable</span>
          <strong>Export directly</strong>
          <small>WAV is the finished mix. Stems and MIDI keep the session editable; Sheet and Bundle package the handoff.</small>
          <button
            aria-pressed={isWavPreviewing}
            className={isWavPreviewing ? "active" : ""}
            data-testid="handoff-pack-preview-wav"
            onClick={onToggleWavPreview}
            title={isWavPreviewing ? "Stop the rendered WAV preview" : "Preview the exact rendered mix WAV before export"}
            type="button"
          >
            {isWavPreviewing ? <CircleStop size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            <span>{isWavPreviewing ? "Stop preview" : "Preview WAV"}</span>
          </button>
        </div>
        <div className="handoff-pack-grid" data-testid="handoff-pack-grid">
          {items.map((item) => (
            <div className={`handoff-pack-card ${item.tone}`} data-testid={`handoff-pack-${item.id}`} key={item.id}>
              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.detail}</small>
              </div>
              <button
                className={item.tone}
                data-testid={`handoff-pack-action-${item.id}`}
                onClick={item.run}
                title={item.detail}
                type="button"
              >
                <Download size={14} aria-hidden="true" />
                <span>{item.buttonLabel}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      <details className="handoff-status-tools" data-testid="handoff-status-tools" open={statusOpen}>
        <summary
          data-testid="handoff-status-toggle"
          onClick={(event) => {
            event.preventDefault();
            onToggleStatus();
          }}
        >
          <span>
            <strong>Delivery Status &amp; Receipt</strong>
            <small>Next send item and the latest explicit export result</small>
          </span>
          <em>{receiptSummary.statusLabel} · {project.mode === "studio" ? "Studio" : "Guided"}</em>
          <ArrowDown size={15} aria-hidden="true" />
        </summary>
        <div className="handoff-tools-content" data-testid="handoff-status-content">
      <div
        aria-label={sendOrderSummary.detailTitle}
        className={`handoff-pack-send-order ${sendOrderSummary.tone}`}
        data-next-item={sendOrderSummary.nextItemId ?? "clear"}
        data-testid="handoff-pack-send-order"
        title={sendOrderSummary.detailTitle}
      >
        <span data-testid="handoff-pack-send-order-status">{sendOrderSummary.statusLabel}</span>
        <strong data-testid="handoff-pack-send-order-next">{sendOrderSummary.nextLabel}</strong>
        <small data-testid="handoff-pack-send-order-detail">{sendOrderSummary.detailLabel}</small>
        <small data-testid="handoff-pack-send-order-sequence">{sendOrderSummary.sequenceLabel}</small>
      </div>
      <div
        aria-label={receiptSummary.detailTitle}
        className={`handoff-export-receipt ${receiptSummary.tone}`}
        data-export-item={receiptSummary.itemId ?? "none"}
        data-testid="handoff-export-receipt"
        title={receiptSummary.detailTitle}
      >
        <span data-testid="handoff-export-receipt-status">{receiptSummary.statusLabel}</span>
        <strong data-testid="handoff-export-receipt-file">{receiptSummary.fileLabel}</strong>
        <small data-testid="handoff-export-receipt-detail">{receiptSummary.detailLabel}</small>
        <small data-testid="handoff-export-receipt-next">{receiptSummary.nextLabel}</small>
      </div>
        </div>
      </details>
      <details className="handoff-audit-tools" data-testid="handoff-audit-tools" open={auditOpen}>
        <summary
          data-testid="handoff-audit-toggle"
          onClick={(event) => {
            event.preventDefault();
            onToggleAudit();
          }}
        >
          <span>
            <strong>Format &amp; Package Proof</strong>
            <small>Manifest, deliverable metrics, package checks, and planned filenames</small>
          </span>
          <em>{manifestAudit.statusLabel} · {packageCheckSummary.headline}</em>
          <ArrowDown size={15} aria-hidden="true" />
        </summary>
        <div className="handoff-tools-content" data-testid="handoff-audit-content">
      <div
        aria-label={manifestAudit.detailTitle}
        className={`handoff-manifest-audit ${manifestAudit.tone}`}
        data-audit-handoff-manifest={manifestAudit.tone}
        data-testid="handoff-manifest-audit"
        title={manifestAudit.detailTitle}
      >
        <div className="handoff-manifest-audit-main">
          <ListChecks size={14} aria-hidden="true" />
          <span>
            <b data-testid="handoff-manifest-audit-status">{manifestAudit.statusLabel}</b>
            <strong data-testid="handoff-manifest-audit-title">{manifestAudit.titleLabel}</strong>
            <small data-testid="handoff-manifest-audit-detail">{manifestAudit.detailLabel}</small>
          </span>
        </div>
        <div className="handoff-manifest-audit-meta">
          <span data-testid="handoff-manifest-audit-receipt">{manifestAudit.receiptLabel}</span>
          <span data-testid="handoff-manifest-audit-next">{manifestAudit.nextLabel}</span>
        </div>
        <div className="handoff-manifest-audit-checks" data-testid="handoff-manifest-audit-checks">
          {manifestAudit.checks.map((check) => (
            <span
              className={check.tone}
              data-testid={`handoff-manifest-audit-${check.id}`}
              key={check.id}
              title={`${check.fileLabel} / ${check.detailLabel}`}
            >
              <b>{check.label}</b>
              <strong>{check.statusLabel}</strong>
              <small>{check.fileLabel}</small>
            </span>
          ))}
        </div>
      </div>
      <div
        aria-label={formatSummary.detailTitle}
        className={["handoff-export-format", formatSummary.tone, exportFormatResult ? "has-result" : ""].filter(Boolean).join(" ")}
        data-testid="handoff-export-format"
        title={formatSummary.detailTitle}
      >
        <div className="handoff-export-format-main">
          <FileAudio size={14} aria-hidden="true" />
          <span>
            <b data-testid="handoff-export-format-status">{formatSummary.statusLabel}</b>
            <strong data-testid="handoff-export-format-title">{formatSummary.titleLabel}</strong>
            <small data-testid="handoff-export-format-detail">{formatSummary.detailLabel}</small>
          </span>
          <em data-testid="handoff-export-format-duration">{formatSummary.durationLabel}</em>
        </div>
        <div
          className={`handoff-export-format-priority ${formatPriority.tone}`}
          data-handoff-export-format-priority={formatPriority.metricId ?? "none"}
          data-testid="handoff-export-format-priority"
          title={formatPriority.title}
        >
          <span data-testid="handoff-export-format-priority-status">{formatPriority.statusLabel}</span>
          <strong data-testid="handoff-export-format-priority-label">{formatPriority.areaLabel}</strong>
          <small data-testid="handoff-export-format-priority-metric">{formatPriority.metricLabel}</small>
          <small data-testid="handoff-export-format-priority-next-check">{formatPriority.nextCheckLabel}</small>
          <button
            data-testid="handoff-export-format-priority-run"
            disabled={formatPriorityActionDisabled}
            onClick={() => {
              if (formatPriorityMetric) {
                onFocusExportFormat(formatPriorityMetric);
              }
            }}
            title={formatPriorityMetric ? `Focus ${formatPriority.areaLabel}` : formatPriority.title}
            type="button"
          >
            {formatPriority.actionLabel}
          </button>
        </div>
        <div className="handoff-export-format-metrics" data-testid="handoff-export-format-metrics">
          {formatSummary.metrics.map((metric) => {
            const focused = focusedExportFormatId === metric.id;
            return (
              <span
                className={[metric.tone, focused ? "focused" : ""].filter(Boolean).join(" ")}
                data-focused={focused ? "true" : "false"}
                data-testid={`handoff-export-format-${metric.id}`}
                key={metric.id}
                title={metric.detail}
              >
                <b>{metric.label}</b>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
                <button
                  aria-pressed={focused}
                  className="handoff-export-format-focus-button"
                  data-testid={`handoff-export-format-focus-${metric.id}`}
                  onClick={() => onFocusExportFormat(metric)}
                  title={`Focus ${metric.label}: ${metric.value}`}
                  type="button"
                >
                  <Target size={12} aria-hidden="true" />
                  <span>{focused ? "Focused" : "Focus"}</span>
                </button>
              </span>
            );
          })}
        </div>
        {exportFormatResult && <HandoffExportFormatFocusResultStrip result={exportFormatResult} />}
      </div>
      <div
        className={["handoff-package-check", packageCheckSummary.tone, packageCheckResult ? "has-result" : ""].filter(Boolean).join(" ")}
        data-testid="handoff-package-check"
        aria-label="Handoff package check"
      >
        <div className="handoff-package-check-heading">
          <div>
            <PackageCheck size={15} aria-hidden="true" />
            <span>Package Check</span>
          </div>
          <strong data-testid="handoff-package-check-headline">{packageCheckSummary.headline}</strong>
          <small data-testid="handoff-package-check-detail">{packageCheckSummary.detail}</small>
        </div>
        <div
          className={`handoff-package-check-focus-readout ${packageFocusSummary.tone}`}
          data-testid="handoff-package-check-focus-readout"
          title={packageFocusSummary.detailTitle}
        >
          <span data-testid="handoff-package-check-focus-status">{packageFocusSummary.statusLabel}</span>
          <strong data-testid="handoff-package-check-focus-label">{packageFocusSummary.areaLabel}</strong>
          <small data-testid="handoff-package-check-focus-detail">{packageFocusSummary.detailLabel}</small>
        </div>
        <div
          className={`handoff-package-check-priority ${packagePriority.tone}`}
          data-handoff-package-priority={packagePriority.focusId ?? "none"}
          data-testid="handoff-package-check-priority"
          title={packagePriority.title}
        >
          <span data-testid="handoff-package-check-priority-status">{packagePriority.statusLabel}</span>
          <strong data-testid="handoff-package-check-priority-label">{packagePriority.areaLabel}</strong>
          <small data-testid="handoff-package-check-priority-card">{packagePriority.cardLabel}</small>
          <small data-testid="handoff-package-check-priority-next-check">{packagePriority.nextCheckLabel}</small>
          <button
            data-testid="handoff-package-check-priority-run"
            disabled={packagePriorityActionDisabled}
            onClick={() => {
              if (packagePriorityCard) {
                onFocusPackageCheck(packagePriorityCard);
              }
            }}
            title={packagePriorityCard ? `Focus ${packagePriority.areaLabel}` : packagePriority.title}
            type="button"
          >
            {packagePriority.actionLabel}
          </button>
        </div>
        {packageCheckResult && <HandoffPackageCheckFocusResultStrip result={packageCheckResult} />}
        <div className="handoff-package-check-grid" data-testid="handoff-package-check-cards">
          {packageCheckSummary.cards.map((card) => {
            const focused = focusedPackageCheckId === card.id;
            return (
              <div className={`handoff-package-check-card ${card.tone} ${focused ? "focused" : ""}`} data-testid={`handoff-package-check-card-${card.id}`} key={card.id}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.detail}</small>
                <button
                  aria-pressed={focused}
                  className="handoff-package-check-focus-button"
                  data-testid={`handoff-package-check-focus-${card.id}`}
                  onClick={() => onFocusPackageCheck(card)}
                  title={`Focus ${card.focusLabel}: ${card.status}`}
                  type="button"
                >
                  <ArrowRight size={13} aria-hidden="true" />
                  <span>{card.focusLabel}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="handoff-pack-file-manifest" data-testid="handoff-pack-file-manifest" aria-label="Handoff file manifest">
        {fileManifest.map((item) => (
          <div className={`handoff-pack-file ${item.tone}`} data-testid={`handoff-pack-file-${item.id}`} key={item.id} title={item.fileLabel}>
            <span>{item.label}</span>
            <strong>{item.fileLabel}</strong>
            <small>{item.detail}</small>
          </div>
        ))}
      </div>
        </div>
      </details>
    </section>
  );
}

export function createHandoffExportFormatPriority(summary: HandoffExportFormatSummary): HandoffExportFormatPriority {
  const metric = handoffExportFormatFocusMetric(summary);

  if (!metric) {
    return {
      metricId: null,
      actionLabel: "No format",
      statusLabel: "Format clear",
      areaLabel: "No format lane",
      metricLabel: "No Handoff Export Format metrics available",
      nextCheckLabel: "Next: return after deliverable-format metrics are available.",
      title: "Handoff Export Format priority has no available metric.",
      tone: "warn"
    };
  }

  const statusLabel =
    metric.tone === "danger" ? "Format blocker" : metric.tone === "warn" ? "Format review" : "Format ready";
  const nextCheckLabel = handoffExportFormatPriorityNextCheck(metric);

  return {
    metricId: metric.id,
    actionLabel: "Focus format",
    statusLabel,
    areaLabel: `${metric.label}: ${metric.value}`,
    metricLabel: `${metric.detail} / ${summary.durationLabel}`,
    nextCheckLabel,
    title: `${statusLabel}: ${metric.label}: ${metric.value} / ${metric.detail} / ${nextCheckLabel}`,
    tone: metric.tone
  };
}

export function handoffExportFormatPriorityNextCheck(metric: HandoffExportFormatMetric): string {
  switch (metric.id) {
    case "wav":
      return "Next: confirm full-mix WAV format and meter posture.";
    case "stems":
      return "Next: confirm audible stem count and planned stem files.";
    case "midi":
      return "Next: confirm arrangement length before MIDI export.";
    case "sheet":
      return "Next: confirm brief context before Handoff Sheet export.";
    case "bundle":
      return "Next: confirm bundle ZIP contents after deliverable formats are ready.";
  }
}

export function createHandoffPackageCheckPriority(summary: HandoffPackageCheckSummary): HandoffPackageCheckPriority {
  const card = activeHandoffPackageCheckQuickActionCard(summary);

  if (!card) {
    return {
      focusId: null,
      actionLabel: "No lane",
      statusLabel: "Package clear",
      areaLabel: "No package lane",
      cardLabel: "No Handoff Package Check cards available",
      nextCheckLabel: "Next: return after send-package cards are available.",
      title: "Handoff Package priority has no available card.",
      tone: "warn"
    };
  }

  const statusLabel =
    card.tone === "danger" ? "Package blocker" : card.tone === "warn" ? "Package review" : "Package ready";
  const nextCheckLabel = handoffPackageCheckPriorityNextCheck(card);

  return {
    focusId: card.focusId,
    actionLabel: "Focus package",
    statusLabel,
    areaLabel: `${card.label}: ${card.value}`,
    cardLabel: `${card.focusLabel} priority / ${card.status}`,
    nextCheckLabel,
    title: `${statusLabel}: ${card.label}: ${card.value} / ${card.detail} / ${nextCheckLabel}`,
    tone: card.tone
  };
}

export function handoffPackageCheckPriorityNextCheck(card: HandoffPackageCheckCard): string {
  switch (card.focusId) {
    case "files":
      return "Next: verify WAV, stems, MIDI, Handoff Sheet, and delivery bundle files.";
    case "order":
      return "Next: follow the current Send Order item.";
    case "receipt":
      return "Next: confirm the latest explicit export receipt.";
    case "context":
      return "Next: confirm artist, vibe, reference, and handoff notes.";
  }
}

export function HandoffExportFormatFocusResultStrip({ result }: { result: HandoffExportFormatFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`handoff-export-format-result ${result.tone}`}
      data-result-handoff-export-format={result.metricId}
      data-testid="handoff-export-format-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="handoff-export-format-result-main">
        <FileAudio size={14} aria-hidden="true" />
        <span>
          <strong data-testid="handoff-export-format-result-title">{result.title}</strong>
          <small data-testid="handoff-export-format-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="handoff-export-format-result-destination" data-testid="handoff-export-format-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="handoff-export-format-result-metric" data-testid="handoff-export-format-result-metric">
        <span data-testid="handoff-export-format-result-status">{result.metricLabel}</span>
        <strong data-testid="handoff-export-format-result-value">{result.metricValue}</strong>
      </div>
      <div className="handoff-export-format-result-followup" data-testid="handoff-export-format-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function HandoffPackageCheckFocusResultStrip({ result }: { result: HandoffPackageCheckFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`handoff-package-check-result ${result.tone}`}
      data-result-handoff-package-check={result.cardId}
      data-testid="handoff-package-check-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="handoff-package-check-result-main">
        <PackageCheck size={14} aria-hidden="true" />
        <span>
          <strong data-testid="handoff-package-check-result-title">{result.title}</strong>
          <small data-testid="handoff-package-check-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="handoff-package-check-result-destination" data-testid="handoff-package-check-result-destination">
        <span>{result.status}</span>
        <strong>{result.destination}</strong>
      </div>
      <div className="handoff-package-check-result-metric" data-testid="handoff-package-check-result-metric">
        <span data-testid="handoff-package-check-result-status">{result.metricLabel}</span>
        <strong data-testid="handoff-package-check-result-value">{result.metricValue}</strong>
      </div>
      <div className="handoff-package-check-result-followup" data-testid="handoff-package-check-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function BeatMap({
  actions,
  onRun,
  sectionRef,
  summary
}: {
  actions: NextMoveAction[];
  onRun: (action: NextMoveAction) => void;
  sectionRef?: Ref<HTMLElement>;
  summary: BeatMapSummary;
}): ReactElement {
  return (
    <section ref={sectionRef} className={`beat-map ${summary.tone}`} data-testid="beat-map" aria-label="Beat map">
      <div className="beat-map-heading">
        <div>
          <Music2 size={17} aria-hidden="true" />
          <span>Beat Map</span>
        </div>
        <strong data-testid="beat-map-headline">{summary.headline}</strong>
        <p data-testid="beat-map-detail">{summary.detail}</p>
      </div>
      <div className="beat-map-stages" data-testid="beat-map-stages">
        {summary.stages.map((stage) => (
          <div className={`beat-map-stage ${stage.tone}`} data-testid={`beat-map-stage-${stage.id}`} key={stage.id}>
            <span>{stage.label}</span>
            <strong>{stage.status}</strong>
            <small>{stage.detail}</small>
          </div>
        ))}
      </div>
      <div className="beat-map-metrics" data-testid="beat-map-metrics">
        {summary.metrics.map((metric) => (
          <div className={`beat-map-metric ${metric.tone}`} data-testid={`beat-map-metric-${metric.id}`} key={metric.id}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </div>
        ))}
      </div>
      <div className="beat-map-actions" aria-label="Beat map actions">
        {actions.map((action) => (
          <button
            className={action.tone}
            data-testid={`beat-map-action-${action.id}`}
            key={action.id}
            onClick={() => onRun(action)}
            title={action.title}
            type="button"
          >
            {nextMoveIcon(action)}
            <span>{action.buttonLabel}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function StructureLens({
  actions,
  onRun,
  sectionRef,
  summary
}: {
  actions: NextMoveAction[];
  onRun: (action: NextMoveAction) => void;
  sectionRef?: Ref<HTMLElement>;
  summary: StructureLensSummary;
}): ReactElement {
  return (
    <section ref={sectionRef} className={`structure-lens ${summary.tone}`} data-testid="structure-lens" aria-label="Structure lens">
      <div className="structure-lens-heading">
        <div>
          <Waves size={17} aria-hidden="true" />
          <span>Structure Lens</span>
        </div>
        <strong data-testid="structure-lens-headline">{summary.headline}</strong>
        <small data-testid="structure-lens-detail">{summary.detail}</small>
      </div>
      <div className="structure-lens-signals" data-testid="structure-lens-signals">
        {summary.signals.map((signal) => (
          <div className={`structure-lens-signal ${signal.tone}`} data-testid={`structure-lens-${signal.id}`} key={signal.id}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            <small>{signal.detail}</small>
          </div>
        ))}
      </div>
      <div className="structure-lens-actions" aria-label="Structure lens actions">
        {actions.map((action) => (
          <button
            className={action.tone}
            data-testid={`structure-lens-action-${action.id}`}
            key={action.id}
            onClick={() => onRun(action)}
            title={action.title}
            type="button"
          >
            {nextMoveIcon(action)}
            <span>{action.buttonLabel}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function HookReadiness({
  cueTarget,
  cued,
  fixResult,
  focusedCardId,
  focusResult,
  isPlaying,
  onCue,
  onFix,
  onFocus,
  sectionRef,
  summary
}: {
  cueTarget: HookLoopCueTarget | null;
  cued: boolean;
  fixResult: HookFixResult | null;
  focusedCardId: HookReadinessFocusId | null;
  focusResult: HookReadinessFocusResult | null;
  isPlaying: boolean;
  onCue: (card?: HookReadinessFocusItem) => void;
  onFix: (card?: HookReadinessCard) => void;
  onFocus: (card: HookReadinessFocusItem) => void;
  sectionRef?: Ref<HTMLElement>;
  summary: HookReadinessSummary;
}): ReactElement {
  const focusSummary = createHookReadinessFocusSummary(summary, focusedCardId);
  const prioritySummary = createHookReadinessPrioritySummary(summary);
  const priorityCard = summary.cards.find((card) => card.id === prioritySummary.cardId) ?? null;
  const priorityActionDisabled = priorityCard === null;

  return (
    <section className={`hook-readiness ${summary.tone}`} data-testid="hook-readiness" aria-label="Hook readiness" ref={sectionRef}>
      <div className="hook-readiness-heading">
        <div>
          <Target size={17} aria-hidden="true" />
          <span>Hook Readiness</span>
        </div>
        <strong data-testid="hook-readiness-headline">{summary.headline}</strong>
        <small data-testid="hook-readiness-detail">{summary.detail}</small>
      </div>
      <div className="hook-readiness-stack">
        <div
          className={`hook-readiness-focus-readout ${focusSummary.tone}`}
          data-testid="hook-readiness-focus-readout"
          title={focusSummary.detailTitle}
        >
          <span data-testid="hook-readiness-focus-status">{focusSummary.statusLabel}</span>
          <strong data-testid="hook-readiness-focus-label">{focusSummary.areaLabel}</strong>
          <small data-testid="hook-readiness-focus-detail">{focusSummary.detailLabel}</small>
        </div>
        <div
          className={`hook-readiness-priority ${prioritySummary.tone}`}
          data-hook-readiness-priority={prioritySummary.cardId ?? "none"}
          data-testid="hook-readiness-priority"
          title={`${prioritySummary.statusLabel} / ${prioritySummary.cardLabel} / ${prioritySummary.reasonLabel} / ${prioritySummary.nextCheckLabel}`}
        >
          <span data-testid="hook-readiness-priority-status">{prioritySummary.statusLabel}</span>
          <strong data-testid="hook-readiness-priority-card">{prioritySummary.cardLabel}</strong>
          <small data-testid="hook-readiness-priority-reason">{prioritySummary.reasonLabel}</small>
          <small data-testid="hook-readiness-priority-next-check">{prioritySummary.nextCheckLabel}</small>
          <button
            data-testid="hook-readiness-priority-run"
            disabled={priorityActionDisabled}
            onClick={() => {
              if (priorityCard) {
                onFocus(priorityCard);
              }
            }}
            title={priorityCard ? `Focus ${prioritySummary.cardLabel}` : prioritySummary.reasonLabel}
            type="button"
          >
            {prioritySummary.actionLabel}
          </button>
        </div>
        {focusResult && <HookReadinessFocusResultStrip result={focusResult} />}
        {fixResult && <HookFixResultStrip result={fixResult} />}
      </div>
      <div className="hook-readiness-grid" data-testid="hook-readiness-cards">
        {summary.cards.map((card) => {
          const focused = focusedCardId === card.id;
          const fix = createHookFixOption(card);
          return (
            <div className={`hook-readiness-card ${card.tone} ${focused ? "focused" : ""}`} data-testid={`hook-readiness-card-${card.id}`} key={card.id}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.detail}</small>
              <div className="hook-readiness-card-actions">
                <button
                  aria-pressed={focused}
                  className="hook-readiness-focus-button"
                  onClick={() => onFocus(card)}
                  title={`Focus ${card.focusLabel}: ${card.status}`}
                  type="button"
                >
                  <span>{card.focusLabel}</span>
                </button>
                <button
                  aria-pressed={cued}
                  className="hook-readiness-cue-button"
                  data-testid={`hook-readiness-cue-${card.id}`}
                  disabled={isPlaying || !cueTarget}
                  onClick={() => onCue(card)}
                  title={
                    isPlaying
                      ? "Stop playback before cueing the hook loop"
                      : cueTarget
                        ? `Cue Hook loop ${hookLoopCueDetail(cueTarget)}`
                        : "Add or select a Hook section before cueing"
                  }
                  type="button"
                >
                  <span>Cue</span>
                </button>
                <button
                  className="hook-readiness-fix-button"
                  data-testid={`hook-readiness-fix-${card.id}`}
                  onClick={() => onFix(card)}
                  title={`Apply ${fix.label}: ${fix.detail}`}
                  type="button"
                >
                  <SlidersHorizontal size={13} aria-hidden="true" />
                  <span>Fix</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HookReadinessFocusResultStrip({ result }: { result: HookReadinessFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`hook-readiness-result ${result.tone}`}
      data-result-hook-readiness={result.cardId}
      data-testid="hook-readiness-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="hook-readiness-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="hook-readiness-result-title">{result.title}</strong>
          <small data-testid="hook-readiness-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="hook-readiness-result-meta">
        <span data-testid="hook-readiness-result-status">{result.status}</span>
        <strong data-testid="hook-readiness-result-destination">{result.destination}</strong>
        <span data-testid="hook-readiness-result-value">{`${result.metricLabel}: ${result.metricValue}`}</span>
      </div>
      <div className="hook-readiness-result-followup" data-testid="hook-readiness-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function HookFixResultStrip({ result }: { result: HookFixResult }): ReactElement {
  return (
    <div
      className={`hook-fix-result ${result.tone}`}
      data-result-hook-fix={result.fixId}
      data-testid="hook-fix-result"
      aria-live="polite"
    >
      <div className="hook-fix-result-main">
        <SlidersHorizontal size={14} aria-hidden="true" />
        <span>
          <strong data-testid="hook-fix-result-title">{result.title}</strong>
          <small data-testid="hook-fix-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="hook-fix-result-meta">
        <span data-testid="hook-fix-result-status">{result.status}</span>
        <span data-testid="hook-fix-result-scope">{result.scope}</span>
        <span data-testid="hook-fix-result-impact">{result.impact}</span>
      </div>
      <div className="hook-fix-result-metrics" data-testid="hook-fix-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`hook-fix-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="hook-fix-result-followup" data-testid="hook-fix-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="hook-fix-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="hook-fix-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function ToplineSpace({
  cueTarget,
  cued,
  fixResult,
  focusedCardId,
  focusResult,
  isPlaying,
  onCue,
  onFix,
  onFocus,
  sectionRef,
  summary
}: {
  cueTarget: ToplineLoopCueTarget;
  cued: boolean;
  fixResult: ToplineFixResult | null;
  focusedCardId: ToplineSpaceFocusId | null;
  focusResult: ToplineSpaceFocusResult | null;
  isPlaying: boolean;
  onCue: (card?: ToplineSpaceFocusItem) => void;
  onFix: (card?: ToplineSpaceCard) => void;
  onFocus: (card: ToplineSpaceFocusItem) => void;
  sectionRef?: Ref<HTMLElement>;
  summary: ToplineSpaceSummary;
}): ReactElement {
  const focusSummary = createToplineSpaceFocusSummary(summary, focusedCardId);
  const prioritySummary = createToplineSpacePrioritySummary(summary);
  const priorityCard = summary.cards.find((card) => card.id === prioritySummary.cardId) ?? null;
  const priorityActionDisabled = priorityCard === null;

  return (
    <section className={`topline-space ${summary.tone}`} data-testid="topline-space" aria-label="Topline space" ref={sectionRef}>
      <div className="topline-space-heading">
        <div>
          <Mic2 size={17} aria-hidden="true" />
          <span>Topline Space</span>
        </div>
        <strong data-testid="topline-space-headline">{summary.headline}</strong>
        <small data-testid="topline-space-detail">{summary.detail}</small>
      </div>
      <div className="topline-space-stack">
        <div
          className={`topline-space-focus-readout ${focusSummary.tone}`}
          data-testid="topline-space-focus-readout"
          title={focusSummary.detailTitle}
        >
          <span data-testid="topline-space-focus-status">{focusSummary.statusLabel}</span>
          <strong data-testid="topline-space-focus-label">{focusSummary.areaLabel}</strong>
          <small data-testid="topline-space-focus-detail">{focusSummary.detailLabel}</small>
        </div>
        <div
          className={`topline-space-priority ${prioritySummary.tone}`}
          data-testid="topline-space-priority"
          data-topline-space-priority={prioritySummary.cardId ?? "none"}
          title={`${prioritySummary.statusLabel} / ${prioritySummary.cardLabel} / ${prioritySummary.reasonLabel} / ${prioritySummary.nextCheckLabel}`}
        >
          <span data-testid="topline-space-priority-status">{prioritySummary.statusLabel}</span>
          <strong data-testid="topline-space-priority-card">{prioritySummary.cardLabel}</strong>
          <small data-testid="topline-space-priority-reason">{prioritySummary.reasonLabel}</small>
          <small data-testid="topline-space-priority-next-check">{prioritySummary.nextCheckLabel}</small>
          <button
            data-testid="topline-space-priority-run"
            disabled={priorityActionDisabled}
            onClick={() => {
              if (priorityCard) {
                onFocus(priorityCard);
              }
            }}
            title={priorityCard ? `Focus ${prioritySummary.cardLabel}` : prioritySummary.reasonLabel}
            type="button"
          >
            {prioritySummary.actionLabel}
          </button>
        </div>
        {focusResult && <ToplineSpaceFocusResultStrip result={focusResult} />}
        {fixResult && <ToplineFixResultStrip result={fixResult} />}
      </div>
      <div className="topline-space-grid" data-testid="topline-space-cards">
        {summary.cards.map((card) => {
          const focused = focusedCardId === card.id;
          const fix = createToplineFixOption(card);
          return (
            <div className={`topline-space-card ${card.tone} ${focused ? "focused" : ""}`} data-testid={`topline-space-card-${card.id}`} key={card.id}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.detail}</small>
              <div className="topline-space-card-actions">
                <button
                  aria-pressed={focused}
                  className="topline-space-focus-button"
                  onClick={() => onFocus(card)}
                  title={`Focus ${card.focusLabel}: ${card.status}`}
                  type="button"
                >
                  <span>{card.focusLabel}</span>
                </button>
                <button
                  aria-pressed={cued}
                  className="topline-space-cue-button"
                  data-testid={`topline-space-cue-${card.id}`}
                  disabled={isPlaying}
                  onClick={() => onCue(card)}
                  title={
                    isPlaying
                      ? "Stop playback before cueing topline space"
                      : `Cue Topline loop ${toplineLoopCueDetail(cueTarget)}`
                  }
                  type="button"
                >
                  <span>Cue</span>
                </button>
                <button
                  className="topline-space-fix-button"
                  data-testid={`topline-space-fix-${card.id}`}
                  onClick={() => onFix(card)}
                  title={`Apply ${fix.label}: ${fix.detail}`}
                  type="button"
                >
                  <SlidersHorizontal size={13} aria-hidden="true" />
                  <span>Fix</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ToplineSpaceFocusResultStrip({ result }: { result: ToplineSpaceFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`topline-space-result ${result.tone}`}
      data-result-topline-space={result.cardId}
      data-testid="topline-space-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="topline-space-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="topline-space-result-title">{result.title}</strong>
          <small data-testid="topline-space-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="topline-space-result-meta">
        <span data-testid="topline-space-result-status">{result.status}</span>
        <strong data-testid="topline-space-result-destination">{result.destination}</strong>
        <span data-testid="topline-space-result-value">{`${result.metricLabel}: ${result.metricValue}`}</span>
      </div>
      <div className="topline-space-result-followup" data-testid="topline-space-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function ToplineFixResultStrip({ result }: { result: ToplineFixResult }): ReactElement {
  return (
    <div
      className={`topline-fix-result ${result.tone}`}
      data-result-topline-fix={result.fixId}
      data-testid="topline-fix-result"
      aria-live="polite"
    >
      <div className="topline-fix-result-main">
        <SlidersHorizontal size={14} aria-hidden="true" />
        <span>
          <strong data-testid="topline-fix-result-title">{result.title}</strong>
          <small data-testid="topline-fix-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="topline-fix-result-meta">
        <span data-testid="topline-fix-result-status">{result.status}</span>
        <span data-testid="topline-fix-result-scope">{result.scope}</span>
        <span data-testid="topline-fix-result-impact">{result.impact}</span>
      </div>
      <div className="topline-fix-result-metrics" data-testid="topline-fix-result-metrics">
        {result.metrics.map((metric) => (
          <span className={metric.tone} data-testid={`topline-fix-result-metric-${metric.id}`} key={metric.id}>
            <b>{metric.label}</b>
            <em>{`${metric.before} -> ${metric.after}`}</em>
          </span>
        ))}
      </div>
      <div className="topline-fix-result-followup" data-testid="topline-fix-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="topline-fix-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="topline-fix-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function SongFormOverview({
  onSelectBlock,
  playingArrangementIndex,
  summary
}: {
  onSelectBlock: (index: number) => void;
  playingArrangementIndex: number | null;
  summary: SongFormOverviewSummary;
}): ReactElement {
  const prioritySummary = createSongFormPrioritySummary(summary);
  const priorityActionDisabled = prioritySummary.targetIndex === null;

  return (
    <section className={`song-form-overview ${summary.tone}`} data-testid="song-form-overview" aria-label="Song form overview">
      <div className="song-form-heading">
        <div>
          <Music2 size={17} aria-hidden="true" />
          <span>Song Form</span>
        </div>
        <strong data-testid="song-form-headline">{summary.headline}</strong>
        <small data-testid="song-form-detail">{summary.detail}</small>
      </div>
      <div className="song-form-metrics" data-testid="song-form-metrics">
        <div
          className={`song-form-priority ${prioritySummary.tone}`}
          data-song-form-priority={prioritySummary.metricId ?? "none"}
          data-testid="song-form-priority"
          title={`${prioritySummary.statusLabel} / ${prioritySummary.metricLabel} / ${prioritySummary.reasonLabel} / ${prioritySummary.nextCheckLabel}`}
        >
          <span data-testid="song-form-priority-status">{prioritySummary.statusLabel}</span>
          <strong data-testid="song-form-priority-metric">{prioritySummary.metricLabel}</strong>
          <small data-testid="song-form-priority-reason">{prioritySummary.reasonLabel}</small>
          <small data-testid="song-form-priority-next-check">{prioritySummary.nextCheckLabel}</small>
          <button
            data-testid="song-form-priority-run"
            disabled={priorityActionDisabled}
            onClick={() => {
              if (prioritySummary.targetIndex !== null) {
                onSelectBlock(prioritySummary.targetIndex);
              }
            }}
            title={prioritySummary.targetIndex === null ? prioritySummary.reasonLabel : `Open ${prioritySummary.targetLabel}`}
            type="button"
          >
            {prioritySummary.targetLabel}
          </button>
        </div>
        {summary.metrics.map((metric) => (
          <div className={`song-form-metric ${metric.tone}`} data-testid={`song-form-metric-${metric.id}`} key={metric.id}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </div>
        ))}
      </div>
      <div className="song-form-timeline" data-testid="song-form-timeline">
        {summary.segments.map((segment) => {
          const selected = segment.index === summary.selectedIndex;
          const playing = segment.index === playingArrangementIndex;
          return (
            <button
              aria-pressed={selected}
              className={["song-form-segment", segment.tone, selected ? "selected" : "", playing ? "playing" : ""]
                .filter(Boolean)
                .join(" ")}
              data-playing={playing ? "true" : "false"}
              data-testid={`song-form-segment-${segment.index}`}
              key={`${segment.section}-${segment.index}-${segment.pattern}`}
              onClick={() => onSelectBlock(segment.index)}
              style={
                {
                  "--segment-flex": segment.bars,
                  "--segment-width": `${segment.widthPercent}%`,
                  "--segment-energy": `${Math.max(14, segment.energy * 100)}%`
                } as CSSProperties
              }
              title={`Select block ${segment.index + 1}: ${segment.section}, Pattern ${segment.pattern}, ${barCountLabel(segment.bars)}`}
              type="button"
            >
              <span>
                {segment.index + 1}. {segment.section}
              </span>
              <strong>Pattern {segment.pattern}</strong>
              <small>
                {segment.startBar}-{segment.endBar} / {Math.round(segment.energy * 100)}% / {segment.eventCount} events
              </small>
              <em>{segment.mutedLabel}</em>
              <i aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ArrangementMuteMap({
  focusedLaneId,
  onFocus,
  playingArrangementIndex,
  result,
  summary
}: {
  focusedLaneId: ArrangementMuteMapFocusId | null;
  onFocus: (lane: ArrangementMuteMapLane) => void;
  playingArrangementIndex: number | null;
  result: ArrangementMuteMapFocusResult | null;
  summary: ArrangementMuteMapSummary;
}): ReactElement {
  const focusSummary = createArrangementMuteMapFocusSummary(summary, focusedLaneId);
  const prioritySummary = createArrangementMuteMapPrioritySummary(summary);
  const priorityLane = summary.lanes.find((lane) => lane.id === prioritySummary.laneId) ?? null;
  const priorityActionDisabled = priorityLane === null;

  return (
    <section className={`arrangement-mute-map ${summary.tone}`} data-testid="arrangement-mute-map" aria-label="Arrangement mute map">
      <div className="arrangement-mute-map-heading">
        <div>
          <ListChecks size={17} aria-hidden="true" />
          <span>Mute Map</span>
        </div>
        <strong data-testid="arrangement-mute-map-headline">{summary.headline}</strong>
        <small data-testid="arrangement-mute-map-detail">{summary.detail}</small>
      </div>
      <div
        className={`arrangement-mute-map-focus-readout ${focusSummary.tone}`}
        data-testid="arrangement-mute-map-focus-readout"
        title={focusSummary.detailTitle}
      >
        <span data-testid="arrangement-mute-map-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="arrangement-mute-map-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="arrangement-mute-map-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      <div
        className={`arrangement-mute-map-priority ${prioritySummary.tone}`}
        data-arrangement-mute-map-priority={prioritySummary.laneId ?? "none"}
        data-testid="arrangement-mute-map-priority"
        title={prioritySummary.detailTitle}
      >
        <span data-testid="arrangement-mute-map-priority-status">{prioritySummary.statusLabel}</span>
        <strong data-testid="arrangement-mute-map-priority-lane">{prioritySummary.laneLabel}</strong>
        <small data-testid="arrangement-mute-map-priority-reason">{prioritySummary.reasonLabel}</small>
        <small data-testid="arrangement-mute-map-priority-next-check">{prioritySummary.nextCheckLabel}</small>
        <button
          data-testid="arrangement-mute-map-priority-run"
          disabled={priorityActionDisabled}
          onClick={() => {
            if (priorityLane) {
              onFocus(priorityLane);
            }
          }}
          title={priorityLane ? `Focus ${prioritySummary.laneLabel}` : prioritySummary.reasonLabel}
          type="button"
        >
          {prioritySummary.actionLabel}
        </button>
      </div>
      {result && <ArrangementMuteMapFocusResultStrip result={result} />}
      <div className="arrangement-mute-map-lanes" data-testid="arrangement-mute-map-lanes">
        {summary.lanes.map((lane) => {
          const focused = focusedLaneId === lane.id;
          return (
            <div className={`arrangement-mute-map-lane ${lane.tone} ${focused ? "focused" : ""}`} data-testid={`arrangement-mute-map-lane-${lane.id}`} key={lane.id}>
              <span>{lane.label}</span>
              <strong>{lane.value}</strong>
              <small>{lane.detail}</small>
              <button
                aria-pressed={focused}
                className="arrangement-mute-map-focus-button"
                onClick={() => onFocus(lane)}
                title={`Focus ${lane.label}: ${lane.status}`}
                type="button"
              >
                <span>{lane.focusLabel}</span>
              </button>
            </div>
          );
        })}
      </div>
      <div className="arrangement-mute-map-grid" data-testid="arrangement-mute-map-grid">
        {summary.segments.map((segment) => {
          const playing = segment.index === playingArrangementIndex;
          return (
            <div className={`arrangement-mute-map-segment ${segment.tone} ${playing ? "playing" : ""}`} data-testid={`arrangement-mute-map-segment-${segment.index}`} key={`${segment.section}-${segment.index}`}>
              <div className="arrangement-mute-map-segment-label">
                <span>
                  {segment.index + 1}. {segment.section}
                </span>
                <small>
                  Pattern {segment.pattern} / {segment.startBar}-{segment.endBar}
                </small>
              </div>
              <div className="arrangement-mute-map-cells" aria-label={`Block ${segment.index + 1} layer mutes`}>
                {arrangementMuteTrackIds.map((track) => {
                  const muted = segment.mutedTracks.includes(track);
                  const focused = focusedLaneId === track;
                  return (
                    <span
                      className={["arrangement-mute-map-cell", muted ? "muted" : "live", focused ? "focused" : ""]
                        .filter(Boolean)
                        .join(" ")}
                      data-testid={`arrangement-mute-map-cell-${segment.index}-${track}`}
                      key={track}
                      title={`${arrangementMuteTrackLabel(track)} ${muted ? "muted" : "live"} in ${segment.section}`}
                    >
                      {muted ? "Mute" : "Live"}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ArrangementMuteMapFocusResultStrip({ result }: { result: ArrangementMuteMapFocusResult }): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`arrangement-mute-map-result ${result.tone}`}
      data-result-arrangement-mute-map={result.laneId}
      data-testid="arrangement-mute-map-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="arrangement-mute-map-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="arrangement-mute-map-result-title">{result.title}</strong>
          <small data-testid="arrangement-mute-map-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="arrangement-mute-map-result-meta">
        <span data-testid="arrangement-mute-map-result-status">{result.status}</span>
        <strong data-testid="arrangement-mute-map-result-destination">{result.destination}</strong>
        <span data-testid="arrangement-mute-map-result-value">{`${result.metricLabel}: ${result.metricValue}`}</span>
      </div>
      <div className="arrangement-mute-map-result-followup" data-testid="arrangement-mute-map-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function ArrangementTransitionMap({
  cuedTransitionId,
  focusedTransitionId,
  isPlaying,
  onCue,
  onFocus,
  playingArrangementIndex,
  result,
  summary
}: {
  cuedTransitionId: ArrangementTransitionMapFocusId | null;
  focusedTransitionId: ArrangementTransitionMapFocusId | null;
  isPlaying: boolean;
  onCue: (transition: ArrangementTransitionMapTransition) => void;
  onFocus: (transition: ArrangementTransitionMapTransition) => void;
  playingArrangementIndex: number | null;
  result: ArrangementTransitionMapFocusResult | null;
  summary: ArrangementTransitionMapSummary;
}): ReactElement {
  const focusSummary = createArrangementTransitionMapFocusSummary(summary, focusedTransitionId);
  const prioritySummary = createArrangementTransitionMapPrioritySummary(summary);
  const priorityTransition = summary.transitions.find((transition) => transition.id === prioritySummary.transitionId) ?? null;
  const priorityActionDisabled = priorityTransition === null;

  return (
    <section
      className={`arrangement-transition-map ${summary.tone}`}
      data-testid="arrangement-transition-map"
      aria-label="Arrangement transition map"
    >
      <div className="arrangement-transition-map-heading">
        <div>
          <ArrowRight size={17} aria-hidden="true" />
          <span>Transition Map</span>
        </div>
        <strong data-testid="arrangement-transition-map-headline">{summary.headline}</strong>
        <small data-testid="arrangement-transition-map-detail">{summary.detail}</small>
      </div>
      <div
        className={`arrangement-transition-map-focus-readout ${focusSummary.tone}`}
        data-testid="arrangement-transition-map-focus-readout"
        title={focusSummary.detailTitle}
      >
        <span data-testid="arrangement-transition-map-focus-status">{focusSummary.statusLabel}</span>
        <strong data-testid="arrangement-transition-map-focus-label">{focusSummary.areaLabel}</strong>
        <small data-testid="arrangement-transition-map-focus-detail">{focusSummary.detailLabel}</small>
      </div>
      <div
        className={`arrangement-transition-map-priority ${prioritySummary.tone}`}
        data-arrangement-transition-map-priority={prioritySummary.transitionId ?? "none"}
        data-testid="arrangement-transition-map-priority"
        title={prioritySummary.detailTitle}
      >
        <span data-testid="arrangement-transition-map-priority-status">{prioritySummary.statusLabel}</span>
        <strong data-testid="arrangement-transition-map-priority-transition">{prioritySummary.transitionLabel}</strong>
        <small data-testid="arrangement-transition-map-priority-reason">{prioritySummary.reasonLabel}</small>
        <small data-testid="arrangement-transition-map-priority-next-check">{prioritySummary.nextCheckLabel}</small>
        <button
          data-testid="arrangement-transition-map-priority-run"
          disabled={priorityActionDisabled}
          onClick={() => {
            if (priorityTransition) {
              onFocus(priorityTransition);
            }
          }}
          title={priorityTransition ? `Focus ${prioritySummary.transitionLabel}` : prioritySummary.reasonLabel}
          type="button"
        >
          {prioritySummary.actionLabel}
        </button>
      </div>
      {result && <ArrangementTransitionMapFocusResultStrip result={result} />}
      <div className="arrangement-transition-map-grid" data-testid="arrangement-transition-map-grid">
        {summary.transitions.map((transition) => {
          const focused = focusedTransitionId === transition.id;
          const cued = cuedTransitionId === transition.id;
          const playing = playingArrangementIndex === transition.fromIndex || playingArrangementIndex === transition.toIndex;
          return (
            <div
              className={["arrangement-transition-map-card", transition.tone, focused ? "focused" : "", playing ? "playing" : ""]
                .filter(Boolean)
                .join(" ")}
              data-testid={`arrangement-transition-map-card-${transition.id}`}
              key={transition.id}
            >
              <div className="arrangement-transition-map-card-main">
                <span>{transition.value}</span>
                <strong>{transition.status}</strong>
                <small>{transition.detail}</small>
              </div>
              <div className="arrangement-transition-map-card-metrics">
                <span data-testid={`arrangement-transition-map-energy-${transition.id}`}>{transition.energyLabel}</span>
                <span data-testid={`arrangement-transition-map-pattern-${transition.id}`}>{transition.patternLabel}</span>
                <span data-testid={`arrangement-transition-map-mutes-${transition.id}`}>{transition.muteLabel}</span>
              </div>
              <div className="arrangement-transition-map-card-actions">
                <button
                  aria-pressed={focused}
                  className="arrangement-transition-map-focus-button"
                  onClick={() => onFocus(transition)}
                  title={`Focus transition ${transition.fromIndex + 1} to ${transition.toIndex + 1}: ${transition.status}`}
                  type="button"
                >
                  <span>{transition.focusLabel}</span>
                </button>
                <button
                  aria-pressed={cued}
                  className="arrangement-transition-map-cue-button"
                  data-testid={`arrangement-transition-map-cue-${transition.id}`}
                  disabled={isPlaying}
                  onClick={() => onCue(transition)}
                  title={
                    isPlaying
                      ? "Stop playback before cueing a transition loop"
                      : `Cue transition loop ${transition.fromIndex + 1} to ${transition.toIndex + 1}`
                  }
                  type="button"
                >
                  <span>Cue</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ArrangementTransitionMapFocusResultStrip({
  result
}: {
  result: ArrangementTransitionMapFocusResult;
}): ReactElement {
  return (
    <div
      aria-live="polite"
      className={`arrangement-transition-map-result ${result.tone}`}
      data-result-arrangement-transition-map={result.transitionId}
      data-testid="arrangement-transition-map-result"
      title={`${result.title}: ${result.detail}`}
    >
      <div className="arrangement-transition-map-result-main">
        <Target size={14} aria-hidden="true" />
        <span>
          <strong data-testid="arrangement-transition-map-result-title">{result.title}</strong>
          <small data-testid="arrangement-transition-map-result-detail">{result.detail}</small>
        </span>
      </div>
      <div className="arrangement-transition-map-result-meta">
        <span data-testid="arrangement-transition-map-result-status">{result.status}</span>
        <strong data-testid="arrangement-transition-map-result-destination">{result.destination}</strong>
        <span data-testid="arrangement-transition-map-result-value">{`${result.metricLabel}: ${result.metricValue}`}</span>
      </div>
      <div className="arrangement-transition-map-result-followup" data-testid="arrangement-transition-map-result-followup">
        <span>{result.auditionCue}</span>
        <small>{result.nextCheck}</small>
      </div>
    </div>
  );
}

export function NextMove({
  actions,
  sectionRef,
  result,
  onRun
}: {
  actions: NextMoveAction[];
  sectionRef?: Ref<HTMLElement>;
  result: NextMoveResult | null;
  onRun: (action: NextMoveAction) => void;
}): ReactElement {
  const [primaryAction, ...secondaryActions] = actions;

  return (
    <section ref={sectionRef} className={`next-move ${primaryAction.tone}`} data-testid="next-move" aria-label="Next move">
      <div className="next-move-heading">
        <div>
          <Sparkles size={17} aria-hidden="true" />
          <span>Next Move</span>
        </div>
        <strong data-testid="next-move-title">{primaryAction.title}</strong>
        <p data-testid="next-move-detail">{primaryAction.detail}</p>
      </div>
      <div className="next-move-actions">
        <button
          className="primary"
          data-testid={`next-move-action-${primaryAction.id}`}
          onClick={() => onRun(primaryAction)}
          title={primaryAction.title}
          type="button"
        >
          {nextMoveIcon(primaryAction)}
          <span>{primaryAction.buttonLabel}</span>
        </button>
        {secondaryActions.map((action) => (
          <button
            data-testid={`next-move-action-${action.id}`}
            key={action.id}
            onClick={() => onRun(action)}
            title={action.title}
            type="button"
          >
            {nextMoveIcon(action)}
            <span>{action.buttonLabel}</span>
          </button>
        ))}
      </div>
      {result && <NextMoveResultStrip result={result} />}
    </section>
  );
}

export function NextMoveResultStrip({ result }: { result: NextMoveResult }): ReactElement {
  return (
    <div className={`next-move-result ${result.tone}`} data-testid="next-move-result" aria-live="polite">
      <div className="next-move-result-main">
        <span data-testid="next-move-result-status">{result.status}</span>
        <strong data-testid="next-move-result-title">{result.title}</strong>
        <small data-testid="next-move-result-detail">{result.detail}</small>
      </div>
      <div className={`next-move-result-metric ${result.metric.tone}`} data-testid="next-move-result-metric">
        <span>{result.metric.label}</span>
        <strong data-testid="next-move-result-metric-value">
          {result.metric.before} -&gt; {result.metric.after}
        </strong>
      </div>
      <div className="next-move-result-followup" data-testid="next-move-result-followup">
        <span>
          <b>Audition</b>
          <em data-testid="next-move-result-audition">{result.auditionCue}</em>
        </span>
        <span>
          <b>Next check</b>
          <em data-testid="next-move-result-next-check">{result.nextCheck}</em>
        </span>
      </div>
    </div>
  );
}

export function selectedArrangementMoveQuickActionPreset(block: ArrangementBlock | undefined): ArrangementMovePreset | null {
  if (!block) {
    return null;
  }

  switch (block.section) {
    case "Hook":
      return "hook_lift";
    case "Verse":
      return "build";
    case "Intro":
    case "Bridge":
    case "Outro":
      return "drop";
  }
  return null;
}

export function createArrangementMovePrioritySummary(
  block: ArrangementBlock | undefined,
  selectedIndex: number,
  blockCount: number
): ArrangementMovePrioritySummary {
  const preset = selectedArrangementMoveQuickActionPreset(block);
  if (!block || !preset) {
    return {
      presetId: "none",
      statusLabel: "Select block",
      presetLabel: "No move target",
      reasonLabel: "Select an arrangement block before choosing a block move.",
      scopeLabel: "No selected block",
      impactLabel: "0 fields",
      nextCheckLabel: "Select a block, then audition Block before applying a move.",
      detailTitle: "Select an arrangement block before choosing a block move.",
      tone: "warn"
    };
  }

  const nextBlock = applyArrangementMovePreset(block, preset);
  const energyBefore = normalizeArrangementEnergy(block.energy);
  const energyAfter = normalizeArrangementEnergy(nextBlock.energy);
  const mutedBefore = normalizeArrangementMutedTracks(block.mutedTracks);
  const mutedAfter = normalizeArrangementMutedTracks(nextBlock.mutedTracks);
  const energyChanged = energyBefore !== energyAfter;
  const muteChanged = mutedBefore.join(",") !== mutedAfter.join(",");
  const changedFields = (energyChanged ? 1 : 0) + (muteChanged ? 1 : 0);
  const presetLabel = arrangementMovePresetLabel(preset);
  const blockNumber = Math.min(selectedIndex + 1, Math.max(blockCount, 1));
  const aligned = changedFields === 0;
  const statusLabel = aligned
    ? "Move aligned"
    : preset === "hook_lift"
      ? "Lift hook"
      : preset === "build"
        ? "Build block"
        : preset === "drop"
          ? "Create drop"
          : "Reset block";
  const reasonLabel = aligned
    ? `${block.section} already matches ${presetLabel}.`
    : preset === "hook_lift"
      ? "Push the selected hook so the peak reads before detailed edits."
      : preset === "build"
        ? "Raise the selected section into the next song moment."
        : preset === "drop"
          ? "Make space in this section before the beat returns."
          : "Return this block to a neutral arrangement posture.";
  const scopeLabel = `Block ${blockNumber} ${block.section} / Pattern ${block.pattern} / ${barCountLabel(block.bars)}`;
  const impactLabel = aligned
    ? "0 fields / energy and mutes aligned"
    : `${changedFields} fields / ${percentLabel(energyBefore)} -> ${percentLabel(energyAfter)} / ${arrangementFocusPreviewMuteLabel(
        mutedAfter
      )}`;
  const nextCheckLabel = aligned
    ? "Audition Block, then inspect Arrangement Focus before more changes."
    : preset === "hook_lift"
      ? "Apply, then cue Hook and compare against Verse."
      : preset === "build"
        ? "Apply, then audition this block into the next section."
        : preset === "drop"
          ? "Apply, then audition the drop into the following block."
          : "Apply, then audition Block and verify mutes.";

  return {
    presetId: preset,
    statusLabel,
    presetLabel,
    reasonLabel,
    scopeLabel,
    impactLabel,
    nextCheckLabel,
    detailTitle: `${statusLabel} / ${presetLabel} / ${reasonLabel} / ${scopeLabel} / ${impactLabel} / ${nextCheckLabel}`,
    tone: aligned ? "good" : changedFields === 1 ? "warn" : "danger"
  };
}

export function createArrangementMovePreviewDecision(
  summary: ArrangementMovePrioritySummary
): ArrangementMovePreviewDecisionSummary {
  const missingTarget = summary.presetId === "none";
  const aligned = !missingTarget && summary.statusLabel === "Move aligned";
  const disabled = missingTarget || aligned;

  return {
    targetPresetId: summary.presetId,
    actionId: missingTarget ? "select-block" : aligned ? "aligned" : "apply-suggested",
    statusLabel: missingTarget ? "Select block" : aligned ? "Move aligned" : "Ready to apply",
    presetLabel: summary.presetLabel,
    metricLabel: summary.impactLabel,
    detailLabel: missingTarget
      ? "Select an arrangement block before applying a move."
      : aligned
        ? "Selected block already matches the suggested move."
        : `${summary.scopeLabel} / ${summary.reasonLabel}`,
    buttonLabel: missingTarget ? "Select Block" : aligned ? "Aligned" : "Apply Suggested Move",
    disabled,
    detailTitle: disabled
      ? `${summary.detailTitle} No Arrangement Move action is needed.`
      : `${summary.detailTitle} Apply only after this block should take the suggested energy and mute posture.`,
    tone: missingTarget ? "warn" : aligned ? "good" : summary.tone
  };
}

export function createArrangementMoveResult(
  preset: ArrangementMovePreset,
  blockIndex: number,
  beforeProject: ProjectState,
  afterProject: ProjectState
): ArrangementMoveResultSummary {
  const beforeBlock = beforeProject.arrangement[blockIndex] ?? beforeProject.arrangement[0];
  const afterBlock = afterProject.arrangement[blockIndex] ?? afterProject.arrangement[0];
  const presetLabel = arrangementMovePresetLabel(preset);
  const blockNumber = Math.min(blockIndex + 1, Math.max(afterProject.arrangement.length, 1));

  if (!beforeBlock || !afterBlock) {
    return {
      presetId: preset,
      blockIndex,
      title: `${presetLabel} move skipped`,
      status: "No block",
      detail: "Select an arrangement block before applying a move.",
      scope: "No selected block",
      impact: "0 fields changed",
      metrics: [],
      auditionCue: "Select a block, then audition Block before applying a move.",
      nextCheck: "Add or select an arrangement block.",
      tone: "danger"
    };
  }

  const energyBefore = normalizeArrangementEnergy(beforeBlock.energy);
  const energyAfter = normalizeArrangementEnergy(afterBlock.energy);
  const mutedBefore = normalizeArrangementMutedTracks(beforeBlock.mutedTracks);
  const mutedAfter = normalizeArrangementMutedTracks(afterBlock.mutedTracks);
  const metrics: ArrangementMoveResultMetric[] = [
    createArrangementMoveResultMetric("energy", "Energy", percentLabel(energyBefore), percentLabel(energyAfter)),
    createArrangementMoveResultMetric(
      "mutes",
      "Mutes",
      arrangementFocusPreviewMuteLabel(mutedBefore),
      arrangementFocusPreviewMuteLabel(mutedAfter)
    )
  ];
  const changedFields = metrics.filter((metric) => metric.changed).length;
  const aligned = changedFields === 0;
  const sectionLabel = `Block ${blockNumber} ${afterBlock.section}`;
  const scope = `${afterBlock.section} / Pattern ${afterBlock.pattern} / ${barCountLabel(afterBlock.bars)}`;
  const status = aligned ? "Move aligned" : `${presetLabel} applied`;

  return {
    presetId: preset,
    blockIndex,
    title: `${presetLabel} move`,
    status,
    detail: `${sectionLabel} / Pattern ${afterBlock.pattern}`,
    scope,
    impact: `${changedFields} field${changedFields === 1 ? "" : "s"} changed`,
    metrics,
    auditionCue: arrangementMoveResultAuditionCue(preset),
    nextCheck: aligned
      ? "No move needed; inspect Arrangement Focus before changing nearby blocks."
      : "Audition Block, then inspect Arrangement Focus and Song Form Overview before another move.",
    tone: aligned ? "good" : changedFields === 1 ? "warn" : "danger"
  };
}

export function createArrangementMoveResultMetric(
  id: ArrangementMoveResultMetric["id"],
  label: string,
  before: string,
  after: string
): ArrangementMoveResultMetric {
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

export function arrangementMoveResultAuditionCue(preset: ArrangementMovePreset): string {
  switch (preset) {
    case "hook_lift":
      return "Audition Block, then cue Hook against Verse.";
    case "build":
      return "Audition this block into the next section.";
    case "drop":
      return "Audition the drop into the following block.";
    case "reset":
      return "Audition Block and verify the neutral mute posture.";
  }
}

export function createSelectedBlockEditPrioritySummary(
  project: ProjectState,
  selectedIndex: number,
  clipboard: ArrangementBlockClipboard | null
): SelectedBlockEditPrioritySummary {
  const block = project.arrangement[selectedIndex] ?? project.arrangement[0];
  if (!block) {
    return {
      actionId: "none",
      statusLabel: "Select block",
      actionLabel: "No edit target",
      reasonLabel: "Select an arrangement block before choosing a structure edit.",
      scopeLabel: "No selected block",
      impactLabel: "0 blocks / 0 bars",
      nextCheckLabel: "Select a block, then cue Block before changing song form.",
      detailTitle: "Select an arrangement block before choosing a structure edit.",
      tone: "warn"
    };
  }

  const blockCount = project.arrangement.length;
  const blockNumber = Math.min(Math.max(selectedIndex + 1, 1), Math.max(blockCount, 1));
  const blockBars = normalizeArrangementBars(block.bars);
  const totalBars = arrangementTotalBars(project);
  const nextBlock = project.arrangement[selectedIndex + 1] ?? null;
  const nextBlockBars = nextBlock ? normalizeArrangementBars(nextBlock.bars) : 0;
  const canMerge = Boolean(nextBlock && blockBars + nextBlockBars <= maxArrangementBars);
  const scopeLabel = selectedBlockEditBlockLabel(project, selectedIndex);
  let actionId: SelectedBlockEditActionId = "copy";
  let statusLabel = "Stage edit";
  let actionLabel = "Copy Block";
  let reasonLabel = "No structure pressure; copy first when you may repeat this section later.";
  let impactLabel = "Clipboard only / no project data";
  let nextCheckLabel = "Copy only when you know where the section should repeat.";
  let tone: SelectedBlockEditPrioritySummary["tone"] = "good";

  if (clipboard) {
    const clipboardBars = normalizeArrangementBars(clipboard.bars);
    actionId = "paste";
    statusLabel = "Clipboard first";
    actionLabel = "Paste After";
    reasonLabel = "A copied block is waiting; place it before starting another structure pass.";
    impactLabel = `+1 block / ${barCountLabel(totalBars)} -> ${barCountLabel(totalBars + clipboardBars)}`;
    nextCheckLabel = "Paste, then audition the inserted handoff.";
    tone = "warn";
  } else if (canMerge && nextBlock && selectedBlockEditMergeCandidate(block, nextBlock)) {
    actionId = "merge";
    statusLabel = "Tidy adjacent";
    actionLabel = "Merge Next";
    reasonLabel = "The next block shares the same section, Pattern, energy, and mute posture.";
    impactLabel = `-1 block / ${barCountLabel(totalBars)} unchanged`;
    nextCheckLabel = "Merge, then play the longer block before more edits.";
    tone = "warn";
  } else if (blockBars >= 4) {
    actionId = "split";
    statusLabel = "Divide long block";
    actionLabel = "Split Block";
    reasonLabel = "This block is long enough to become two editable song moments.";
    impactLabel = `+1 block / ${barCountLabel(totalBars)} unchanged`;
    nextCheckLabel = "Split, then cue the two-block transition.";
    tone = "warn";
  } else if (blockCount < 8 || totalBars < 16) {
    actionId = "duplicate";
    statusLabel = "Extend form";
    actionLabel = "Duplicate";
    reasonLabel = "The arrangement is still compact; repeat a proven section before detailed shaping.";
    impactLabel = `+1 block / ${barCountLabel(totalBars)} -> ${barCountLabel(totalBars + blockBars)}`;
    nextCheckLabel = "Duplicate, then shape energy or mutes on the new copy.";
    tone = "warn";
  } else if (block.section === "Intro" && selectedIndex > 0) {
    actionId = "move_left";
    statusLabel = "Fix order";
    actionLabel = "Move Left";
    reasonLabel = "Intro reads later than expected in the song form.";
    impactLabel = `Order only / Block ${blockNumber} -> ${blockNumber - 1}`;
    nextCheckLabel = "Move, then scan Song Form Overview from the top.";
    tone = "warn";
  } else if (block.section === "Outro" && selectedIndex < blockCount - 1) {
    actionId = "move_right";
    statusLabel = "Fix order";
    actionLabel = "Move Right";
    reasonLabel = "Outro reads before the end of the song form.";
    impactLabel = `Order only / Block ${blockNumber} -> ${blockNumber + 1}`;
    nextCheckLabel = "Move, then audition into the ending.";
    tone = "warn";
  }

  return {
    actionId,
    statusLabel,
    actionLabel,
    reasonLabel,
    scopeLabel,
    impactLabel,
    nextCheckLabel,
    detailTitle: `${statusLabel} / ${actionLabel} / ${reasonLabel} / ${scopeLabel} / ${impactLabel} / ${nextCheckLabel}`,
    tone
  };
}

export function createSelectedBlockEditPreviewDecision(
  summary: SelectedBlockEditPrioritySummary
): SelectedBlockEditPreviewDecisionSummary {
  const missingTarget = summary.actionId === "none";

  return {
    targetActionId: summary.actionId,
    actionId: missingTarget ? "select-block" : "run-suggested",
    statusLabel: missingTarget ? "Select block" : "Ready to edit",
    actionLabel: summary.actionLabel,
    metricLabel: summary.impactLabel,
    detailLabel: missingTarget
      ? "Select an arrangement block before running a structure edit."
      : `${summary.scopeLabel} / ${summary.reasonLabel}`,
    buttonLabel: missingTarget ? "Select Block" : "Run Suggested Edit",
    disabled: missingTarget,
    detailTitle: missingTarget
      ? `${summary.detailTitle} No Selected Block Edit action is available.`
      : `${summary.detailTitle} Run only after this selected block should take the suggested structure edit.`,
    tone: missingTarget ? "warn" : summary.tone
  };
}

export function selectedBlockEditMergeCandidate(block: ArrangementBlock, nextBlock: ArrangementBlock): boolean {
  return (
    block.section === nextBlock.section &&
    block.pattern === nextBlock.pattern &&
    normalizeArrangementEnergy(block.energy) === normalizeArrangementEnergy(nextBlock.energy) &&
    normalizeArrangementMutedTracks(block.mutedTracks).join(",") ===
      normalizeArrangementMutedTracks(nextBlock.mutedTracks).join(",")
  );
}

export function createSelectedBlockEditResult(
  actionId: SelectedBlockEditActionId,
  beforeProject: ProjectState,
  afterProject: ProjectState,
  beforeIndex: number,
  afterIndex: number
): SelectedBlockEditResultSummary {
  const title = selectedBlockEditActionTitle(actionId);
  const afterBlock = afterProject.arrangement[afterIndex] ?? afterProject.arrangement[0];
  const beforeBars = arrangementTotalBars(beforeProject);
  const afterBars = arrangementTotalBars(afterProject);
  const beforeSelected = selectedBlockEditBlockLabel(beforeProject, beforeIndex);
  const afterSelected = selectedBlockEditBlockLabel(afterProject, afterIndex);
  const metrics: SelectedBlockEditResultMetric[] = [
    createSelectedBlockEditResultMetric(
      "blocks",
      "Blocks",
      `${beforeProject.arrangement.length}`,
      `${afterProject.arrangement.length}`
    ),
    createSelectedBlockEditResultMetric("bars", "Bars", barCountLabel(beforeBars), barCountLabel(afterBars)),
    createSelectedBlockEditResultMetric("selected", "Selected", beforeSelected, afterSelected)
  ];
  const blockDelta = afterProject.arrangement.length - beforeProject.arrangement.length;
  const barDelta = afterBars - beforeBars;
  const changedMetrics = metrics.filter((metric) => metric.changed).length;
  const scope = afterBlock
    ? `Block ${Math.min(afterIndex + 1, afterProject.arrangement.length)} ${afterBlock.section} / Pattern ${afterBlock.pattern}`
    : "No selected block";

  return {
    actionId,
    blockIndex: Math.max(0, Math.min(afterIndex, Math.max(afterProject.arrangement.length - 1, 0))),
    title,
    status: selectedBlockEditActionStatus(actionId),
    detail: `${beforeSelected} -> ${afterSelected}`,
    scope,
    impact: `${selectedBlockEditDeltaLabel(blockDelta, "block", "blocks")} / ${selectedBlockEditDeltaLabel(
      barDelta,
      "bar",
      "bars"
    )}`,
    metrics,
    auditionCue: selectedBlockEditAuditionCue(actionId),
    nextCheck: selectedBlockEditNextCheck(actionId, changedMetrics),
    tone: actionId === "delete" ? "danger" : actionId === "copy" ? "good" : "warn"
  };
}

export function createSelectedBlockEditResultMetric(
  id: SelectedBlockEditResultMetric["id"],
  label: string,
  before: string,
  after: string
): SelectedBlockEditResultMetric {
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

export function selectedBlockEditActionTitle(actionId: SelectedBlockEditActionId): string {
  switch (actionId) {
    case "copy":
      return "Copied block";
    case "paste":
      return "Pasted block";
    case "duplicate":
      return "Duplicated block";
    case "split":
      return "Split block";
    case "merge":
      return "Merged blocks";
    case "move_left":
      return "Moved block left";
    case "move_right":
      return "Moved block right";
    case "delete":
      return "Deleted block";
  }
}

export function selectedBlockEditActionStatus(actionId: SelectedBlockEditActionId): string {
  switch (actionId) {
    case "copy":
      return "Clipboard ready";
    case "paste":
      return "Block inserted";
    case "duplicate":
      return "Block repeated";
    case "split":
      return "Block divided";
    case "merge":
      return "Blocks combined";
    case "move_left":
    case "move_right":
      return "Order changed";
    case "delete":
      return "Block removed";
  }
}

export function selectedBlockEditBlockLabel(project: ProjectState, index: number): string {
  const block = project.arrangement[index] ?? project.arrangement[0];
  if (!block) {
    return "No block";
  }
  const blockNumber = Math.min(Math.max(index + 1, 1), project.arrangement.length);
  return `Block ${blockNumber} ${block.section} / Pattern ${block.pattern} / ${barCountLabel(block.bars)}`;
}

export function selectedBlockEditDeltaLabel(value: number, singular: string, plural: string): string {
  if (value === 0) {
    return `${plural} unchanged`;
  }
  const label = Math.abs(value) === 1 ? singular : plural;
  return `${value > 0 ? "+" : ""}${value} ${label}`;
}

export function selectedBlockEditAuditionCue(actionId: SelectedBlockEditActionId): string {
  switch (actionId) {
    case "copy":
      return "Paste when this section shape should repeat later in the arrangement.";
    case "paste":
    case "duplicate":
      return "Play Song loop around the inserted block and check the handoff.";
    case "split":
      return "Play the two split blocks as a Block or Transition loop.";
    case "merge":
      return "Play the merged block and confirm the longer section still breathes.";
    case "move_left":
    case "move_right":
      return "Play Song loop through the moved block and its neighbors.";
    case "delete":
      return "Play Song loop across the removed block's gap.";
  }
}

export function selectedBlockEditNextCheck(actionId: SelectedBlockEditActionId, changedMetrics: number): string {
  if (actionId === "copy") {
    return "Paste explicitly before leaving the arrangement edit pass.";
  }
  if (changedMetrics === 0) {
    return "No structure metric changed; scan Song Form Overview before another edit.";
  }
  return "Scan Song Form Overview and Arrangement Playback before the next structure edit.";
}

export type SelectedBlockQuickActionDescriptor = {
  blockNumber: number | null;
  section: ArrangementSection | null;
  pattern: PatternSlot | null;
  bars: number | null;
};

export function quickActionSelectedBlockMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const editAction = selectedBlockQuickActionEditAction(action);
  if (!editAction) {
    return null;
  }

  const descriptor = selectedBlockQuickActionDescriptor(action);
  const blockIndex = selectedBlockQuickActionBlockIndex(project, action);
  const block = project.arrangement[blockIndex] ?? project.arrangement[0];
  const blockNumber =
    descriptor.blockNumber ?? (block ? Math.min(blockIndex + 1, Math.max(project.arrangement.length, 1)) : null);
  const section = descriptor.section ?? block?.section ?? null;
  const pattern = descriptor.pattern ?? block?.pattern ?? project.selectedPattern;
  const bars = descriptor.bars ?? (block ? normalizeArrangementBars(block.bars) : 0);
  const scopeLabel = blockNumber && section ? `Block ${blockNumber} ${section}` : "No selected block";

  return {
    id: "selected-block",
    label: "Selected block",
    value: `${selectedBlockEditActionTitle(editAction)} / ${scopeLabel} / Pattern ${pattern} / ${barCountLabel(
      bars
    )} / ${project.arrangement.length} blocks / ${barCountLabel(
      arrangementTotalBars(project)
    )} / ${selectedBlockQuickActionStructuralDeltaLabel(project, editAction, blockIndex, block)}`
  };
}

export function selectedBlockQuickActionEditAction(action: QuickAction): SelectedBlockEditActionId | null {
  switch (action.id) {
    case "selected-block-copy":
      return "copy";
    case "selected-block-paste":
      return "paste";
    case "selected-block-duplicate":
      return "duplicate";
    case "selected-block-split":
      return "split";
    case "selected-block-merge":
      return "merge";
    case "selected-block-move-left":
      return "move_left";
    case "selected-block-move-right":
      return "move_right";
    case "selected-block-delete":
      return "delete";
  }

  const text = `${action.title} ${action.detail} ${action.keywords}`;
  return selectedBlockQuickActionTitleAction.find((candidate) => candidate.pattern.test(text))?.actionId ?? null;
}

export const selectedBlockQuickActionTitleAction: Array<{
  pattern: RegExp;
  actionId: SelectedBlockEditActionId;
}> = [
  { pattern: /\bPaste After\b|\bPaste copied block\b|\bPasted block\b/i, actionId: "paste" },
  { pattern: /\bDuplicate\b|\bDuplicated block\b/i, actionId: "duplicate" },
  { pattern: /\bSplit Block\b|\bSplit selected block\b|\bSplit block\b/i, actionId: "split" },
  { pattern: /\bMerge Next\b|\bMerge selected block\b|\bMerged blocks\b/i, actionId: "merge" },
  { pattern: /\bMove Left\b|\bMove selected block left\b|\bMoved block left\b/i, actionId: "move_left" },
  { pattern: /\bMove Right\b|\bMove selected block right\b|\bMoved block right\b/i, actionId: "move_right" },
  { pattern: /\bDelete selected block\b|\bDelete block\b|\bDeleted block\b/i, actionId: "delete" },
  { pattern: /\bCopy Block\b|\bCopy selected block\b|\bCopied block\b/i, actionId: "copy" }
];

export function selectedBlockQuickActionBlockIndex(project: ProjectState, action: QuickAction): number {
  const blockNumber = selectedBlockQuickActionDescriptor(action).blockNumber;
  if (!blockNumber) {
    return 0;
  }

  return Math.min(Math.max(blockNumber - 1, 0), Math.max(project.arrangement.length - 1, 0));
}

export function selectedBlockQuickActionDescriptor(action: QuickAction): SelectedBlockQuickActionDescriptor {
  const text = `${action.title} ${action.detail}`;
  const blockNumberMatch = /\bBlock\s+(\d+)\b/i.exec(text);
  const sectionMatch = /\bBlock\s+\d+\s+([A-Za-z]+)(?:\s+\/|\s+Pattern\b)/i.exec(text);
  const patternMatch = /\bPattern\s+([ABC])\b/i.exec(text);
  const barsMatch = /\b(\d+)\s+bars?\b/i.exec(text);
  const section = sectionMatch ? selectedBlockQuickActionSection(sectionMatch[1]) : null;
  const pattern = patternMatch ? selectedBlockQuickActionPattern(patternMatch[1]) : null;
  const bars = barsMatch ? Number(barsMatch[1]) : null;

  return {
    blockNumber: blockNumberMatch ? Number(blockNumberMatch[1]) : null,
    section,
    pattern,
    bars: bars !== null && Number.isFinite(bars) ? bars : null
  };
}

export function selectedBlockQuickActionSection(value: string): ArrangementSection | null {
  return arrangementSections.includes(value as ArrangementSection) ? (value as ArrangementSection) : null;
}

export function selectedBlockQuickActionPattern(value: string): PatternSlot | null {
  const pattern = value.toUpperCase();
  return patternSlots.includes(pattern as PatternSlot) ? (pattern as PatternSlot) : null;
}

export function selectedBlockQuickActionStructuralDeltaLabel(
  project: ProjectState,
  actionId: SelectedBlockEditActionId,
  blockIndex: number,
  block: ArrangementBlock | undefined
): string {
  const blockBars = block ? normalizeArrangementBars(block.bars) : 0;
  const nextBlock = project.arrangement[blockIndex + 1] ?? null;
  switch (actionId) {
    case "copy":
      return "clipboard only";
    case "paste":
      return "paste after selected";
    case "duplicate":
      return `+1 block target / +${barCountLabel(blockBars)}`;
    case "split":
      return "split selected block / bars unchanged";
    case "merge":
      return nextBlock
        ? `merge next / ${barCountLabel(blockBars + normalizeArrangementBars(nextBlock.bars))}`
        : "merge unavailable / no next block";
    case "move_left":
      return "order -1";
    case "move_right":
      return "order +1";
    case "delete":
      return `-1 block target / -${barCountLabel(blockBars)}`;
  }
}

export function isArrangementMovePresetApplied(block: ArrangementBlock, preset: ArrangementMovePreset): boolean {
  const transformed = applyArrangementMovePreset(block, preset);
  return (
    normalizeArrangementEnergy(block.energy) === normalizeArrangementEnergy(transformed.energy) &&
    normalizeArrangementMutedTracks(block.mutedTracks).join(",") ===
      normalizeArrangementMutedTracks(transformed.mutedTracks).join(",")
  );
}

export function composerActionQuickActionGroup(action: ComposerAction): string {
  if (action.area === "arrange") {
    return "Arrange";
  }
  if (action.area === "finish") {
    return "Mix";
  }
  return "Create";
}

export function composerActionQuickActionDetail(action: ComposerAction, project: ProjectState): string {
  const followup = composerActionFollowupCues(action, project);
  return [
    action.label,
    action.scope,
    action.impact,
    action.safety,
    action.detail,
    `Route ${quickActionComposerActionRouteLabel(action, action.area)}`,
    `Audition ${followup.auditionCue}`,
    `Next ${followup.nextCheck}`
  ].join(" / ");
}

export function composerActionQuickActionArea(actionId: string): ComposerActionArea | null {
  if (!actionId.startsWith("composer-action-")) {
    return null;
  }

  const actionSlug = actionId.slice("composer-action-".length);
  if (actionSlug.startsWith("drums-")) {
    return "drums";
  }
  if (actionSlug === "bassline" || actionSlug.startsWith("bass-")) {
    return "bass";
  }
  if (actionSlug.startsWith("chord-")) {
    return "harmony";
  }
  if (actionSlug.startsWith("melody-")) {
    return "melody";
  }
  if (actionSlug.startsWith("arrange-")) {
    return "arrange";
  }
  if (actionSlug.startsWith("finish-")) {
    return "finish";
  }

  return null;
}

export function styleGoalActionQuickActionArea(actionId: string): ComposerActionArea | null {
  if (!actionId.startsWith("style-goal-action-")) {
    return null;
  }

  const goalId = actionId.slice("style-goal-action-".length);
  if (isStyleGoalCardId(goalId)) {
    return goalId;
  }

  return null;
}

export function styleGoalCueQuickActionGoal(actionId: string): StyleGoalCardId | null {
  if (!actionId.startsWith("style-goal-cue-")) {
    return null;
  }

  const goalId = actionId.slice("style-goal-cue-".length);
  return isStyleGoalCardId(goalId) ? goalId : null;
}

export function isStyleGoalCardId(value: string): value is StyleGoalCardId {
  return value === "drums" || value === "bass" || value === "harmony" || value === "melody" || value === "arrange";
}

export function styleGoalCueLabel(goalId: StyleGoalCardId): string {
  switch (goalId) {
    case "drums":
      return "drums";
    case "bass":
      return "808/bass";
    case "harmony":
      return "harmony";
    case "melody":
      return "melody";
    case "arrange":
      return "arrangement";
  }
}

export function quickActionComposerActionMoveLabel(
  action: QuickAction,
  composerAction: ComposerAction | null,
  detailParts: string[]
): string {
  const commandLabel = action.title.replace(/^Run Composer Action:\s*/, "").trim();
  const moveLabel = composerAction?.buttonLabel ?? commandLabel;
  const contextLabel = composerAction?.label ?? detailParts[0] ?? "";
  if (!contextLabel || contextLabel === moveLabel) {
    return moveLabel || "Composer Action";
  }

  return `${moveLabel} / ${contextLabel}`;
}

export function quickActionComposerActionMetricLabel(area: ComposerActionArea): string {
  switch (area) {
    case "drums":
      return "Composer drums";
    case "bass":
      return "Composer 808";
    case "harmony":
      return "Composer harmony";
    case "melody":
      return "Composer melody";
    case "arrange":
      return "Composer arrange";
    case "finish":
      return "Composer finish";
  }
}

export function quickActionComposerActionAreaLabel(area: ComposerActionArea): string {
  switch (area) {
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
  }
}

export function quickActionComposerActionRouteLabel(action: ComposerAction | null, area: ComposerActionArea): string {
  const group = area === "arrange" ? "Arrange" : area === "finish" ? "Mix" : "Create";
  if (!action) {
    return `${group} / Composer Actions`;
  }

  return `${group} / ${quickActionComposerActionCommandLabel(action)}`;
}

export function quickActionComposerActionCommandLabel(action: ComposerAction): string {
  const command = action.command;
  switch (command.kind) {
    case "blueprint": {
      const blueprint = beatBlueprints.find((candidate) => candidate.id === command.blueprintId);
      return `Beat Blueprint ${blueprint?.name ?? command.blueprintId}`;
    }
    case "drumFoundation":
      return `Drum Foundation ${drumFoundationLabel(command.foundation)}`;
    case "bassline":
      return `808 Bassline ${basslinePadLabel(command.pad)}`;
    case "chordProgression":
      return `Chord Progression ${quickActionComposerActionPresetLabel(command.preset)}`;
    case "melodyMotif":
      return `Melody Motif ${melodyMotifLabel(command.motif)}`;
    case "patternFill":
      return `Pattern Fill ${patternFillPresetLabel(command.preset)}`;
    case "patternChain":
      return `Pattern Chain ${patternChainLabel(command.chain)}`;
    case "arrangementTemplate":
      return `Arrangement Template ${arrangementTemplateLabel(command.template)}`;
    case "masterFinish":
      return `Master Finish ${masterFinishPadLabel(command.pad)}`;
  }
}

export function quickActionComposerActionPresetLabel(value: string): string {
  return value.replace(/_/g, " ");
}

export function nextMoveIcon(action: NextMoveAction): ReactElement {
  switch (action.command.kind) {
    case "snapshot":
      return <Save size={14} aria-hidden="true" />;
    case "reviewMix":
      return <Gauge size={14} aria-hidden="true" />;
    case "deliveryTarget":
    case "masterFinish":
      return <Gauge size={14} aria-hidden="true" />;
    case "arrangementMove":
    case "patternChain":
    case "chainExpand":
    case "arrangementTemplate":
      return <Waves size={14} aria-hidden="true" />;
    case "blueprint":
    case "patternFill":
      return <Sparkles size={14} aria-hidden="true" />;
  }
}

export function createNextMoveResult(
  action: NextMoveAction,
  beforeProject: ProjectState,
  afterProject: ProjectState
): NextMoveResult {
  const beforeMetric = nextMoveResultMetricSnapshot(beforeProject, action);
  const afterMetric = nextMoveResultMetricSnapshot(afterProject, action);
  const metric: NextMoveResultMetric = {
    id: afterMetric.id,
    label: afterMetric.label,
    before: beforeMetric.value,
    after: afterMetric.value,
    tone: beforeMetric.value === afterMetric.value ? "warn" : "good"
  };
  const changed = beforeProject !== afterProject || metric.before !== metric.after;
  const followup = nextMoveResultFollowup(action, afterProject);

  return {
    actionId: action.id,
    title: `${action.buttonLabel} ${changed ? "applied" : "checked"}`,
    status: changed ? "Applied" : "Checked",
    detail: action.title,
    metric,
    auditionCue: followup.auditionCue,
    nextCheck: followup.nextCheck,
    tone: changed ? "good" : action.tone
  };
}

export function quickActionBeatMapMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  nextMoveAction: NextMoveAction
): { id: string; label: string; value: string } {
  const analysis = analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, analysis);
  const summary = createBeatMapSummary(project, checks, analysis, stemAnalyses);
  const stage = beatMapStageForNextMoveAction(summary, nextMoveAction);
  const target = activeDeliveryTarget(project);
  const packageSummary = createHandoffPackageCheckSummary(project, analysis, stemAnalyses, null);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const stageReadyCount = summary.stages.filter((candidate) => candidate.tone === "good").length;
  const stageReviewCount = summary.stages.filter((candidate) => candidate.tone === "warn").length;
  const stageBlockerCount = summary.stages.filter((candidate) => candidate.tone === "danger").length;
  const followup = nextMoveResultFollowup(nextMoveAction, project);

  return {
    id: "beat-map-result",
    label: "Beat Map result",
    value: [
      `action ${action.title}`,
      "destination Guide / Beat Map",
      `stage ${stage.label} / ${stage.status} / ${stage.detail}`,
      `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
      `completion ${summary.headline} / ${stageReadyCount}/${summary.stages.length} stages ready / ${workflowCountLabel(
        stageReviewCount,
        "review"
      )} / ${workflowCountLabel(stageBlockerCount, "blocker")}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${analysis.status} / H ${formatDb(analysis.headroomDb)}`,
      `stems ${audibleStemCount}/${target.stemGoal} target`,
      `package ${packageSummary.headline}`,
      `route ${beatMapRouteLabel(nextMoveAction)}`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function beatMapStageForNextMoveAction(summary: BeatMapSummary, action: NextMoveAction): BeatMapStage {
  const stageId = beatMapStageIdForNextMoveAction(action);
  return (
    summary.stages.find((candidate) => candidate.id === stageId) ??
    summary.stages.find((candidate) => candidate.tone !== "good") ??
    summary.stages[summary.stages.length - 1]
  );
}

export function beatMapStageIdForNextMoveAction(action: NextMoveAction): string {
  switch (action.command.kind) {
    case "blueprint":
    case "patternFill":
      return "compose";
    case "arrangementMove":
    case "patternChain":
    case "chainExpand":
    case "arrangementTemplate":
      return "arrange";
    case "deliveryTarget":
      return "start";
    case "masterFinish":
    case "reviewMix":
      return "polish";
    case "snapshot":
      return "deliver";
  }
}

export function beatMapRouteLabel(action: NextMoveAction): string {
  switch (action.command.kind) {
    case "blueprint":
      return "Create / Beat Blueprint";
    case "patternFill":
      return "Create / Pattern Fill";
    case "arrangementMove":
      return "Arrange / Arrangement Move";
    case "patternChain":
      return "Arrange / Pattern Chain";
    case "chainExpand":
      return "Arrange / Chain Expand";
    case "arrangementTemplate":
      return "Arrange / Arrangement Template";
    case "deliveryTarget":
      return "Deliver / Delivery Target Align";
    case "masterFinish":
      return "Master / Master Finish";
    case "snapshot":
      return "Project / Save Snapshot";
    case "reviewMix":
      return "Mix / Mix Coach";
  }
}

export function quickActionStructureLensMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  nextMoveAction: NextMoveAction
): { id: string; label: string; value: string } {
  const summary = createStructureLensSummary(project);
  const signal = structureLensSignalForNextMoveAction(summary, nextMoveAction);
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const targetSignal = structureLensSignalById(summary, "target");
  const sectionsSignal = structureLensSignalById(summary, "sections");
  const hookSignal = structureLensSignalById(summary, "hook");
  const arcSignal = structureLensSignalById(summary, "arc");
  const readyCount = summary.signals.filter((candidate) => candidate.tone === "good").length;
  const reviewCount = summary.signals.filter((candidate) => candidate.tone === "warn").length;
  const blockerCount = summary.signals.filter((candidate) => candidate.tone === "danger").length;
  const followup = nextMoveResultFollowup(nextMoveAction, project);

  return {
    id: "structure-lens-result",
    label: "Structure Lens result",
    value: [
      `action ${action.title}`,
      "destination Guide / Structure Lens / Arrange",
      `signal ${signal.label} / ${signal.value} / ${signal.detail}`,
      `target ${target.name} / ${barCountLabel(target.targetBars)}`,
      `completion ${summary.headline} / ${readyCount}/${summary.signals.length} signals ready / ${workflowCountLabel(
        reviewCount,
        "review"
      )} / ${workflowCountLabel(blockerCount, "blocker")}`,
      `target fit ${structureLensSignalMetricLabel(targetSignal)}`,
      `sections ${structureLensSignalMetricLabel(sectionsSignal)}`,
      `hook ${structureLensSignalMetricLabel(hookSignal)}`,
      `arc ${structureLensSignalMetricLabel(arcSignal)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `route ${structureLensRouteLabel(nextMoveAction)}`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function structureLensSignalForNextMoveAction(summary: StructureLensSummary, action: NextMoveAction): StructureLensSignal {
  return structureLensSignalById(summary, structureLensSignalIdForNextMoveAction(action));
}

export function structureLensSignalById(summary: StructureLensSummary, id: StructureLensSignal["id"]): StructureLensSignal {
  return (
    summary.signals.find((candidate) => candidate.id === id) ??
    summary.signals[0] ?? {
      id: "target",
      label: "Target Fit",
      value: "Unavailable",
      detail: summary.detail,
      tone: summary.tone
    }
  );
}

export function structureLensSignalIdForNextMoveAction(action: NextMoveAction): StructureLensSignal["id"] {
  switch (action.command.kind) {
    case "deliveryTarget":
      return "target";
    case "patternChain":
    case "chainExpand":
    case "arrangementTemplate":
      return "sections";
    case "arrangementMove":
      return "hook";
    case "blueprint":
    case "patternFill":
    case "masterFinish":
    case "snapshot":
    case "reviewMix":
      return "arc";
  }
}

export function structureLensSignalMetricLabel(signal: StructureLensSignal): string {
  return `${signal.value} / ${signal.detail}`;
}

export function structureLensRouteLabel(action: NextMoveAction): string {
  switch (action.command.kind) {
    case "blueprint":
      return "Create / Beat Blueprint";
    case "patternFill":
      return "Create / Pattern Fill";
    case "arrangementMove":
      return "Arrange / Arrangement Move";
    case "patternChain":
      return "Arrange / Pattern Chain";
    case "chainExpand":
      return "Arrange / Chain Expand";
    case "arrangementTemplate":
      return "Arrange / Arrangement Template";
    case "deliveryTarget":
      return "Deliver / Delivery Target Align";
    case "masterFinish":
      return "Master / Master Finish";
    case "snapshot":
      return "Project / Save Snapshot";
    case "reviewMix":
      return "Mix / Mix Coach";
  }
}

export function nextMoveResultMetricSnapshot(
  project: ProjectState,
  action: NextMoveAction
): { id: string; label: string; value: string } {
  const metric = nextMoveActionPostureMetricSnapshot(project, action);
  const analysis = analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, analysis);
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const readyCount = checks.filter((check) => check.tone === "good").length;
  const reviewCount = checks.filter((check) => check.tone === "warn").length;
  const blockerCount = checks.filter((check) => check.tone === "danger").length;
  const followup = nextMoveResultFollowup(action, project);

  return {
    id: metric.id,
    label: metric.label,
    value: [
      `action ${action.buttonLabel}`,
      `command ${action.title}`,
      `detail ${action.detail}`,
      `route ${nextMoveRouteLabel(action)}`,
      `posture ${metric.value}`,
      `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
      `readiness ${readyCount}/${checks.length} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(
        blockerCount,
        "blocker"
      )}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${analysis.status} / H ${formatDb(analysis.headroomDb)}`,
      `stems ${audibleStemCount}/${target.stemGoal} target`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function nextMoveActionPostureMetricSnapshot(
  project: ProjectState,
  action: NextMoveAction
): { id: string; label: string; value: string } {
  switch (action.command.kind) {
    case "blueprint":
      return { id: "project-events", label: "Project events", value: `${projectEventTotal(project)} events` };
    case "patternFill":
      return {
        id: "pattern-events",
        label: `Pattern ${project.selectedPattern}`,
        value: `${patternEventTotal(activePattern(project))} events`
      };
    case "arrangementMove":
      return {
        id: "song-energy",
        label: "Song energy",
        value: `${Math.round(arrangementAverageEnergy(project) * 100)}% avg`
      };
    case "patternChain":
    case "chainExpand":
    case "arrangementTemplate":
      return { id: "song-length", label: "Song length", value: barCountLabel(arrangementTotalBars(project)) };
    case "deliveryTarget":
      return {
        id: "target",
        label: "Target",
        value: `${activeDeliveryTarget(project).name} / ${barCountLabel(arrangementTotalBars(project))}`
      };
    case "masterFinish":
      return { id: "master", label: "Master", value: `${project.masterPreset} / ${formatDb(project.masterCeilingDb)}` };
    case "snapshot":
      return { id: "snapshots", label: "Snapshots", value: `${project.snapshots.length} slots` };
    case "reviewMix": {
      const analysis = analyzeExport(project);
      return { id: "export", label: "Export", value: `${analysis.status} / ${formatDb(analysis.headroomDb)}` };
    }
  }
}

export function nextMoveRouteLabel(action: NextMoveAction): string {
  return beatMapRouteLabel(action);
}

export function nextMoveResultFollowup(
  action: NextMoveAction,
  project: ProjectState
): { auditionCue: string; nextCheck: string } {
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);

  switch (action.command.kind) {
    case "blueprint":
      return {
        auditionCue: `Loop Pattern ${project.selectedPattern}; hear drums, 808, chords, and Synth together.`,
        nextCheck: `${patternEventTotal(pattern)} Pattern ${project.selectedPattern} events now; move to Pattern Chain when the hook works.`
      };
    case "patternFill":
      return {
        auditionCue: `Loop Pattern ${project.selectedPattern}; listen to the final bar turn.`,
        nextCheck: `${patternEventTotal(pattern)} events now; compare Pattern A/B/C before arranging.`
      };
    case "arrangementMove":
      return {
        auditionCue: "Loop selected Block; hear energy and mute contrast in context.",
        nextCheck: `${Math.round(arrangementAverageEnergy(project) * 100)}% average energy; scan Song Form next.`
      };
    case "patternChain":
      return {
        auditionCue: "Play Song loop; hear A/B/C pattern contrast across 8 bars.",
        nextCheck: `${project.arrangement.length} blocks now; expand when verse/hook shape is clear.`
      };
    case "chainExpand":
      return {
        auditionCue: "Play Song loop; scan intro, verse, hook, bridge, and outro flow.",
        nextCheck: `${barCountLabel(arrangementTotalBars(project))} now; compare against ${target.name}.`
      };
    case "arrangementTemplate":
      return {
        auditionCue: "Play Song loop; check section order and hook placement.",
        nextCheck: `${barCountLabel(arrangementTotalBars(project))} arranged; adjust block energy before mix.`
      };
    case "deliveryTarget":
      return {
        auditionCue: "Play Song loop; judge length and master posture against the target.",
        nextCheck: `${target.name} target active; confirm stems and handoff context.`
      };
    case "masterFinish": {
      const analysis = analyzeExport(project);
      return {
        auditionCue: `Play full mix; watch ${formatDb(analysis.headroomDb)} headroom.`,
        nextCheck: `${project.masterPreset} selected; use Mix Coach before exporting.`
      };
    }
    case "snapshot":
      return {
        auditionCue: "Keep current loop playing only if you want to compare this saved state.",
        nextCheck: `${project.snapshots.length}/${maxProjectSnapshots} idea slots saved; use Snapshot Compare before major changes.`
      };
    case "reviewMix": {
      const analysis = analyzeExport(project);
      return {
        auditionCue: "Read Mix Coach, then play the full mix if a check needs attention.",
        nextCheck: `${analysis.status} export scan; use an explicit Mix Fix if needed.`
      };
    }
  }
}

export function createNextMoveActions(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis
): NextMoveAction[] {
  const primary = primaryNextMoveAction(project, checks, analysis);
  const arrangementNeedsStructure = readinessCheckForId(checks, "arrangement")?.tone === "warn";
  const target = activeDeliveryTarget(project);
  const candidates: NextMoveAction[] = [
    primary,
    ...(!isDeliveryTargetAligned(project, target) ? [deliveryTargetNextMoveAction(project)] : []),
    ...(arrangementNeedsStructure ? [fullArrangementNextMoveAction()] : []),
    masterFinishNextMoveAction(project, analysis),
    patternFillNextMoveAction(project),
    arrangementLiftNextMoveAction(project),
    snapshotNextMoveAction(project),
    mixReviewNextMoveAction(analysis)
  ];

  const uniqueActions = new Map<string, NextMoveAction>();
  for (const action of candidates) {
    if (!uniqueActions.has(action.id)) {
      uniqueActions.set(action.id, action);
    }
  }

  return [...uniqueActions.values()].slice(0, 4);
}

export function primaryNextMoveAction(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis
): NextMoveAction {
  const drums = readinessCheckForId(checks, "drums");
  const bass = readinessCheckForId(checks, "bass");
  const harmony = readinessCheckForId(checks, "harmony");
  const arrangement = readinessCheckForId(checks, "arrangement");
  const exportCheck = readinessCheckForId(checks, "export");

  if ([drums, bass, harmony].some((check) => check?.tone === "danger")) {
    return blueprintNextMoveAction(project);
  }

  if (arrangement?.tone === "warn") {
    return patternChainNextMoveAction();
  }

  if (exportCheck?.tone !== "good" || analysis.status !== "Ready") {
    return mixReviewNextMoveAction(analysis);
  }

  if (project.snapshots.length === 0) {
    return snapshotNextMoveAction(project);
  }

  return arrangementLiftNextMoveAction(project);
}

export function readinessCheckForId(checks: BeatReadinessCheck[], id: string): BeatReadinessCheck | undefined {
  return checks.find((check) => check.id === id);
}

export function blueprintNextMoveAction(project: ProjectState): NextMoveAction {
  const blueprintId = suggestedBlueprintId(project);
  const blueprint = beatBlueprints.find((candidate) => candidate.id === blueprintId);
  return {
    id: "blueprint",
    title: "Start from an editable beat",
    detail: `${blueprint?.name ?? "Beat"} / drums, 808, chords, arrangement, mix.`,
    buttonLabel: "Blueprint",
    tone: "danger",
    command: { kind: "blueprint", blueprintId }
  };
}

export function patternFillNextMoveAction(project: ProjectState): NextMoveAction {
  const pattern = activePattern(project);
  const preset = suggestedPatternFillPreset(pattern);
  return {
    id: `pattern-${preset}`,
    title: `${patternFillPresetLabel(preset)} on Pattern ${project.selectedPattern}`,
    detail: `Tail variation for Pattern ${project.selectedPattern}.`,
    buttonLabel: patternFillPresetLabel(preset),
    tone: "good",
    command: { kind: "patternFill", preset }
  };
}

export function patternChainNextMoveAction(): NextMoveAction {
  return {
    id: "pattern-chain",
    title: "Sketch an 8-bar Pattern Chain",
    detail: "Use Pattern A/B/C as an editable song outline.",
    buttonLabel: "8 Bar Chain",
    tone: "warn",
    command: { kind: "patternChain", chain: "eight_bar" }
  };
}

export function fullArrangementNextMoveAction(): NextMoveAction {
  return {
    id: "full-arrangement",
    title: "Build a full beat structure",
    detail: "Full Beat template from current Pattern A/B/C data.",
    buttonLabel: "Full Beat",
    tone: "warn",
    command: { kind: "arrangementTemplate", template: "full" }
  };
}

export function arrangementLiftNextMoveAction(project: ProjectState): NextMoveAction {
  return {
    id: "hook-lift",
    title: "Lift the selected song block",
    detail: `Energy and mute lift for Pattern ${project.selectedPattern}.`,
    buttonLabel: "Hook Lift",
    tone: "good",
    command: { kind: "arrangementMove", preset: "hook_lift" }
  };
}

export function snapshotNextMoveAction(project: ProjectState): NextMoveAction {
  return {
    id: "save-snapshot",
    title: "Save this beat state",
    detail: `${project.snapshots.length}/${maxProjectSnapshots} local idea slots are saved in this project.`,
    buttonLabel: "Save Slot",
    tone: project.snapshots.length === 0 ? "good" : "warn",
    command: { kind: "snapshot" }
  };
}

export function mixReviewNextMoveAction(analysis: ExportAnalysis): NextMoveAction {
  const tone: MixCoachTone = analysis.status === "Ready" ? "good" : "warn";
  return {
    id: "mix-review",
    title: "Check export polish",
    detail: `${analysis.status} render with ${formatDb(analysis.headroomDb)} headroom.`,
    buttonLabel: "Mix Check",
    tone,
    command: { kind: "reviewMix" }
  };
}

export function deliveryTargetNextMoveAction(project: ProjectState): NextMoveAction {
  const target = activeDeliveryTarget(project);
  return {
    id: `delivery-target-${target.id}`,
    title: `Align ${target.name} target`,
    detail: `${barCountLabel(target.targetBars)} target with ${target.preferredMasterPreset} posture.`,
    buttonLabel: "Align Target",
    tone: "warn",
    command: { kind: "deliveryTarget", target: target.id }
  };
}

export function suggestedMasterFinishPad(project: ProjectState): MasterFinishPadId {
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

export function masterFinishNextMoveAction(project: ProjectState, analysis: ExportAnalysis): NextMoveAction {
  const padId = suggestedMasterFinishPad(project);
  const pad = masterFinishPadDefinitions.find((definition) => definition.id === padId) ?? masterFinishPadDefinitions[0];
  const tone: MixCoachTone = analysis.status === "Ready" ? "good" : "warn";
  return {
    id: `master-finish-${pad.id}`,
    title: `${pad.label} finish posture`,
    detail: `${pad.preset} / ${formatDb(pad.ceilingDb)} ceiling / ${formatDb(pad.masterVolumeDb)} output.`,
    buttonLabel: `${pad.label} Finish`,
    tone,
    command: { kind: "masterFinish", pad: pad.id }
  };
}

export function chainExpandNextMoveAction(): NextMoveAction {
  return {
    id: "chain-expand",
    title: "Expand to song form",
    detail: "Turn the current chain into a 16-bar intro, verse, hook, bridge, hook, and outro outline.",
    buttonLabel: "Expand",
    tone: "warn",
    command: { kind: "chainExpand" }
  };
}

export function isDeliveryTargetAligned(project: ProjectState, target: DeliveryTarget): boolean {
  return (
    project.deliveryTarget === target.id &&
    project.masterPreset === target.preferredMasterPreset &&
    arrangementTotalBars(project) >= target.targetBars
  );
}

export function createDeliveryTargetAlignmentPreview(
  project: ProjectState,
  target: DeliveryTarget
): DeliveryTargetAlignmentPreviewSummary {
  const currentBars = arrangementTotalBars(project);
  const targetSelected = project.deliveryTarget === target.id;
  const lengthAligned = currentBars >= target.targetBars;
  const masterAligned = project.masterPreset === target.preferredMasterPreset;
  const changeCount = [!targetSelected, !lengthAligned, !masterAligned].filter(Boolean).length;
  const aligned = isDeliveryTargetAligned(project, target);
  const tone: MixCoachTone = aligned ? "good" : currentBars >= Math.min(8, target.targetBars) ? "warn" : "danger";
  const statusLabel = aligned ? "Aligned target" : `${changeCount} align change${changeCount === 1 ? "" : "s"}`;
  const targetLabel = targetSelected ? `${target.name} active` : `Target -> ${target.name}`;
  const lengthLabel = lengthAligned
    ? `${barCountLabel(currentBars)} covers ${barCountLabel(target.targetBars)}`
    : `${barCountLabel(currentBars)} -> ${barCountLabel(target.targetBars)}`;
  const masterLabel = masterAligned
    ? `${target.preferredMasterPreset} ready`
    : `${project.masterPreset} -> ${target.preferredMasterPreset}`;
  const mixLabel = `Mix -> ${mixPostureLabel(target.mixPosture)}`;
  const stemLabel = `${target.stemGoal} stem target`;
  const detailTitle = `${target.name} Align preview: ${target.focus}; ${lengthLabel}; ${masterLabel}; ${mixLabel}; ${stemLabel}`;

  return {
    targetId: target.id,
    statusLabel,
    targetLabel,
    lengthLabel,
    masterLabel,
    mixLabel,
    stemLabel,
    detailTitle,
    tone
  };
}

export function createDeliveryTargetAlignmentResult(
  target: DeliveryTarget,
  beforeProject: ProjectState,
  afterProject: ProjectState
): DeliveryTargetAlignmentResult {
  const afterTarget = activeDeliveryTarget(afterProject);
  const changedMoves = deliveryTargetAlignmentChangedCount(beforeProject, afterProject);
  const changedControls = mixBalanceChangedControlCount(beforeProject.mixer, afterProject.mixer);
  const metrics: DeliveryTargetAlignmentResultMetric[] = [
    createDeliveryTargetAlignmentResultMetric(
      "target",
      "Target",
      activeDeliveryTarget(beforeProject).name,
      afterTarget.name
    ),
    createDeliveryTargetAlignmentResultMetric(
      "length",
      "Length",
      deliveryTargetLengthLabel(beforeProject),
      deliveryTargetLengthLabel(afterProject)
    ),
    createDeliveryTargetAlignmentResultMetric(
      "master",
      "Master",
      deliveryTargetMasterLabel(beforeProject),
      deliveryTargetMasterLabel(afterProject)
    ),
    createDeliveryTargetAlignmentResultMetric(
      "mix",
      "Mix",
      deliveryTargetMixLabel(beforeProject),
      deliveryTargetMixLabel(afterProject)
    ),
    createDeliveryTargetAlignmentResultMetric(
      "stems",
      "Stems",
      deliveryTargetStemLabel(beforeProject),
      deliveryTargetStemLabel(afterProject)
    )
  ];

  return {
    targetId: afterTarget.id,
    title: `${target.name} Delivery Target aligned`,
    status: "Applied",
    detail: afterTarget.focus,
    scope: "Target, arrangement, master, and mix posture",
    impact: `${changedMoves} alignment move${changedMoves === 1 ? "" : "s"} / ${changedControls} mixer controls`,
    metrics,
    auditionCue: "Play Song loop; check arrangement length, hook energy, and Full Mix export posture.",
    nextCheck: "Use Export Preflight or Handoff Pack to confirm WAV/stems/MIDI delivery.",
    tone: changedMoves > 0 ? "good" : "warn"
  };
}

export function createDeliveryTargetAlignmentResultMetric(
  id: DeliveryTargetAlignmentResultMetric["id"],
  label: string,
  before: string,
  after: string
): DeliveryTargetAlignmentResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: before === after ? "warn" : "good"
  };
}

export function deliveryTargetAlignmentChangedCount(beforeProject: ProjectState, afterProject: ProjectState): number {
  const changed = [
    beforeProject.deliveryTarget !== afterProject.deliveryTarget,
    deliveryTargetArrangementFingerprint(beforeProject) !== deliveryTargetArrangementFingerprint(afterProject),
    deliveryTargetMasterLabel(beforeProject) !== deliveryTargetMasterLabel(afterProject),
    mixBalanceChangedControlCount(beforeProject.mixer, afterProject.mixer) > 0,
    deliveryTargetStemLabel(beforeProject) !== deliveryTargetStemLabel(afterProject)
  ];
  return changed.filter(Boolean).length;
}

export function deliveryTargetArrangementFingerprint(project: ProjectState): string {
  return project.arrangement
    .map(
      (block) =>
        `${block.section}:${block.pattern}:${block.bars}:${block.energy}:${block.mutedTracks.join(",")}`
    )
    .join("|");
}

export function deliveryTargetLengthLabel(project: ProjectState): string {
  return `${barCountLabel(arrangementTotalBars(project))} / ${project.arrangement.length} sections`;
}

export function deliveryTargetMasterLabel(project: ProjectState): string {
  return `${project.masterPreset} / ${formatDb(project.masterCeilingDb)} ceiling`;
}

export function deliveryTargetMixLabel(project: ProjectState): string {
  const master = formatDb(masterChannelVolumeDb(project.mixer));
  const drums = mixerTrackVolumeDb(project.mixer, "drum_rack");
  const bass = mixerTrackVolumeDb(project.mixer, "bass_808");
  const synth = mixerTrackVolumeDb(project.mixer, "synth");
  const chords = mixerTrackVolumeDb(project.mixer, "chord");
  return `M ${master} / D ${drums} / 8 ${bass} / S ${synth} / C ${chords}`;
}

export function deliveryTargetStemLabel(project: ProjectState): string {
  return `${activeDeliveryTarget(project).stemGoal} stem target`;
}

export function mixPostureLabel(posture: MixPosture): string {
  return mixPostureOptions.find((option) => option.id === posture)?.label ?? posture.split("_").join(" ");
}

export const sessionBriefFields: (keyof SessionBrief)[] = ["artist", "vibe", "reference", "notes"];

export const sessionBriefStarterPadDefinitions: SessionBriefStarterPadDefinition[] = [
  {
    id: "starter",
    label: "Starter",
    detail: "General song handoff"
  },
  {
    id: "vocal",
    label: "Vocal",
    detail: "Topline room"
  },
  {
    id: "store",
    label: "Store",
    detail: "Beat-store demo"
  },
  {
    id: "club",
    label: "Club",
    detail: "DJ energy"
  }
];

export function sessionBriefStatus(brief: SessionBrief): Pick<BeatMapMetric, "value" | "detail" | "tone"> {
  const filledFields = sessionBriefFilledFields(brief);
  const hasVibe = brief.vibe.trim().length > 0;
  const hasContext = [brief.artist, brief.reference, brief.notes].some((value) => value.trim().length > 0);

  if (hasVibe && hasContext) {
    return {
      value: "Usable",
      detail: `${filledFields}/4 fields captured`,
      tone: "good"
    };
  }

  if (filledFields > 0) {
    return {
      value: `${filledFields}/4 fields`,
      detail: hasVibe ? "Add artist, reference, or notes" : "Add vibe for direction",
      tone: "warn"
    };
  }

  return {
    value: "Empty",
    detail: "Add artist, vibe, reference, or notes",
    tone: "warn"
  };
}

export type SessionBriefCompassFocusTarget = keyof SessionBrief | "deliver";

export function sessionBriefCompassFocusTarget(
  card: SessionBriefCompassCard,
  brief: SessionBrief
): SessionBriefCompassFocusTarget {
  switch (card.id) {
    case "direction":
      return "vibe";
    case "reference":
      return "reference";
    case "artist":
      return brief.artist.trim().length > 0 && brief.notes.trim().length === 0 ? "notes" : "artist";
    case "handoff":
      return "deliver";
  }
}

export function sessionBriefCompassFocusLabel(card: SessionBriefCompassCard, brief: SessionBrief): string {
  const target = sessionBriefCompassFocusTarget(card, brief);
  switch (target) {
    case "artist":
      return "Focus Artist";
    case "vibe":
      return "Focus Vibe";
    case "reference":
      return "Focus Reference";
    case "notes":
      return "Focus Notes";
    case "deliver":
      return "Focus Handoff";
  }
}

export function createSessionBriefCompassFocusResult(
  card: SessionBriefCompassCard,
  summary: SessionBriefCompassSummary,
  brief: SessionBrief
): SessionBriefCompassFocusResult {
  const summaryCard = summary.cards.find((candidate) => candidate.id === card.id) ?? card;
  return {
    cardId: summaryCard.id,
    status: "Focused",
    title: `${summaryCard.label} brief lane focused`,
    detail: `${summaryCard.value}: ${summaryCard.detail}`,
    destination: sessionBriefCompassDestinationLabel(summaryCard, brief),
    metricLabel: "Brief",
    metricValue: sessionBriefCompassFocusResultMetric(summaryCard, summary),
    auditionCue: sessionBriefCompassFocusResultAudition(summaryCard),
    nextCheck: sessionBriefCompassFocusResultNextCheck(summaryCard),
    tone: summaryCard.tone
  };
}

export function sessionBriefCompassDestinationLabel(card: SessionBriefCompassCard, brief: SessionBrief): string {
  const target = sessionBriefCompassFocusTarget(card, brief);
  switch (target) {
    case "artist":
      return "Session Brief / Artist field";
    case "vibe":
      return "Session Brief / Vibe field";
    case "reference":
      return "Session Brief / Reference field";
    case "notes":
      return "Session Brief / Notes field";
    case "deliver":
      return "Deliver / Handoff Pack";
  }
}

export function sessionBriefCompassFocusResultMetric(
  card: SessionBriefCompassCard,
  summary: SessionBriefCompassSummary
): string {
  const readyCount = summary.cards.filter((candidate) => candidate.tone === "good").length;
  return `${card.label}: ${card.value} / ${readyCount}/${summary.cards.length} ready`;
}

export function sessionBriefCompassFocusResultAudition(card: SessionBriefCompassCard): string {
  switch (card.id) {
    case "direction":
      return "Read the vibe against Beat Spine and Composer Guide before adding more writing moves.";
    case "reference":
      return "Use Listening Pass by ear against this text reference; no reference-track import is needed.";
    case "artist":
      return "Play Hook or Topline Space and check whether the arrangement leaves room for the artist context.";
    case "handoff":
      return "Review Handoff Pack and Export Preflight before explicit WAV, stem, MIDI, or sheet exports.";
  }
}

export function sessionBriefCompassFocusResultNextCheck(card: SessionBriefCompassCard): string {
  switch (card.id) {
    case "direction":
      return "Fill Vibe or adjust Style Quick Picks only if the direction still feels unclear.";
    case "reference":
      return "Keep the reference as text; use Listening Pass before changing mix or arrangement choices.";
    case "artist":
      return "Fill Artist or Notes before sending a handoff or applying another vocal-space fix.";
    case "handoff":
      return "Use Handoff Package Check when the brief, stems, and export posture are ready.";
  }
}

export function sessionBriefFilledFields(brief: SessionBrief): number {
  return sessionBriefFields.filter((field) => brief[field].trim().length > 0).length;
}

export function createSessionBriefStarterPadOptions(project: ProjectState): SessionBriefStarterPadOption[] {
  return sessionBriefStarterPadDefinitions.map((pad) => {
    const starterBrief = createSessionBriefStarterBrief(project, pad.id);
    const nextBrief = applySessionBriefStarter(project.sessionBrief, starterBrief);
    const changedCount = sessionBriefChangedFieldCount(project.sessionBrief, nextBrief);
    return {
      ...pad,
      preview: sessionBriefStarterPreview(starterBrief),
      changedCount
    };
  });
}

export function createSessionBriefStarterBrief(project: ProjectState, padId: SessionBriefStarterPadId): SessionBrief {
  const target = activeDeliveryTarget(project);
  const styleProfile = getStyle(project);
  const bars = barCountLabel(arrangementTotalBars(project));
  const mixLabel = mixPostureLabel(target.mixPosture);
  const styleKeyTempo = `${styleProfile.name} / ${project.key} / ${project.bpm} BPM`;
  const titleLabel = boundedSessionBriefText(project.title.trim() || "Untitled Beat", 40);

  switch (padId) {
    case "starter":
      return normalizeSessionBriefStarter({
        artist: "Open artist",
        vibe: `${styleProfile.name} ${target.name}`,
        reference: styleKeyTempo,
        notes: `Title ${titleLabel}; ${target.name}: ${bars}, ${target.stemGoal} stems, ${mixLabel} mix. Build hook, then export WAV/stems/MIDI.`
      });
    case "vocal":
      return normalizeSessionBriefStarter({
        artist: "Vocalist TBD",
        vibe: `${styleProfile.name} pocket for vocal`,
        reference: `${project.key} ${project.bpm} BPM vocal pocket`,
        notes: `Title ${titleLabel}; leave room for topline; keep hook clear; target ${target.name} with ${target.stemGoal} stems.`
      });
    case "store":
      return normalizeSessionBriefStarter({
        artist: "Beat store buyer",
        vibe: `${styleProfile.name} polished demo`,
        reference: `${project.bpm} BPM ${styleProfile.name} beat-store`,
        notes: `Title ${titleLabel}; tag clean demo; check 8 bar hook, mix snapshot, WAV/stems/MIDI, and handoff sheet.`
      });
    case "club":
      return normalizeSessionBriefStarter({
        artist: "DJ / club set",
        vibe: `${styleProfile.name} high-energy bounce`,
        reference: `${project.bpm} BPM club pass`,
        notes: `Title ${titleLabel}; prioritize intro/drop energy, drums/808 punch, and ${mixLabel} mix before export.`
      });
  }
}

export function normalizeSessionBriefStarter(brief: SessionBrief): SessionBrief {
  return {
    artist: boundedSessionBriefText(brief.artist, maxSessionBriefFieldLength),
    vibe: boundedSessionBriefText(brief.vibe, maxSessionBriefFieldLength),
    reference: boundedSessionBriefText(brief.reference, maxSessionBriefFieldLength),
    notes: boundedSessionBriefText(brief.notes, maxSessionBriefNotesLength)
  };
}

export function applySessionBriefStarter(current: SessionBrief, starter: SessionBrief): SessionBrief {
  return {
    artist: current.artist.trim().length > 0 ? current.artist : starter.artist,
    vibe: current.vibe.trim().length > 0 ? current.vibe : starter.vibe,
    reference: current.reference.trim().length > 0 ? current.reference : starter.reference,
    notes: current.notes.trim().length > 0 ? current.notes : starter.notes
  };
}

export function createSessionBriefStarterResult(
  pad: SessionBriefStarterPadDefinition,
  beforeBrief: SessionBrief,
  afterBrief: SessionBrief,
  project: ProjectState
): SessionBriefStarterResult {
  const metrics = sessionBriefFields.map((field) =>
    createSessionBriefStarterResultMetric(field, sessionBriefFieldLabel(field), beforeBrief[field], afterBrief[field])
  );
  const changedCount = metrics.filter((metric) => metric.tone === "good").length;
  return {
    padId: pad.id,
    title: `${pad.label} brief starter applied`,
    status: "Brief updated",
    detail: `${activeDeliveryTarget(project).name} / ${pad.detail}`,
    impact: `${changedCount}/4 fields filled`,
    metrics,
    nextCheck: "Review Handoff Pack",
    tone: changedCount > 0 ? "good" : "warn"
  };
}

export function createSessionBriefStarterResultMetric(
  id: keyof SessionBrief,
  label: string,
  before: string,
  after: string
): SessionBriefStarterResultMetric {
  return {
    id,
    label,
    before: compactSessionBriefValue(before),
    after: compactSessionBriefValue(after),
    tone: before === after ? "warn" : "good"
  };
}

export function sessionBriefStarterPreview(brief: SessionBrief): string {
  return `${brief.vibe} / ${brief.reference}`;
}

export function compactSessionBriefValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "empty";
  }
  return trimmed.length > 28 ? `${trimmed.slice(0, 25)}...` : trimmed;
}

export function sessionBriefChangedFieldCount(beforeBrief: SessionBrief, afterBrief: SessionBrief): number {
  return sessionBriefFields.filter((field) => beforeBrief[field] !== afterBrief[field]).length;
}

export function sameSessionBrief(first: SessionBrief, second: SessionBrief): boolean {
  return sessionBriefFields.every((field) => first[field] === second[field]);
}

export function createSnapshotSlotRoleSummary(project: ProjectState): SnapshotSlotRoleSummary {
  const savedCount = project.snapshots.length;
  const statusLabel = `${savedCount}/${maxProjectSnapshots} slots`;
  const latestSnapshot = project.snapshots[0];

  if (savedCount === 0) {
    return {
      roleLabel: "Save first take",
      statusLabel,
      detailLabel: "Next Save Slot",
      detailTitle: `${statusLabel} / Save a local version before major edits`,
      tone: "warn"
    };
  }

  if (savedCount >= maxProjectSnapshots) {
    return {
      roleLabel: "Slot bank full",
      statusLabel,
      detailLabel: "Compare or clear",
      detailTitle: `${statusLabel} / Latest ${latestSnapshot?.name ?? "saved take"} / Delete a stale slot before saving more`,
      tone: "warn"
    };
  }

  if (savedCount === 1) {
    return {
      roleLabel: "Compare ready",
      statusLabel,
      detailLabel: latestSnapshot ? latestSnapshot.name : "1 saved take",
      detailTitle: `${statusLabel} / Latest ${latestSnapshot?.name ?? "saved take"} / Use Snapshot Compare before big edits`,
      tone: "good"
    };
  }

  return {
    roleLabel: "Version bank",
    statusLabel,
    detailLabel: `${savedCount} takes ready`,
    detailTitle: `${statusLabel} / Latest ${latestSnapshot?.name ?? "saved take"} / Compare takes before restore or delete`,
    tone: "good"
  };
}

export function createTapTempoReadoutSummary(currentBpm: number, tapTempo: TapTempoState): TapTempoReadoutSummary {
  if (tapTempo.bpm !== null) {
    return {
      roleLabel: `${tapTempo.bpm} BPM`,
      statusLabel: `${tapTempo.taps} taps`,
      detailLabel: tapTempo.applied ? "Applied tempo" : "Release to apply",
      detailTitle: tapTempo.applied
        ? `${tapTempo.taps} tap tempo pulses averaged into ${tapTempo.bpm} BPM`
        : `${tapTempo.taps} tap tempo pulses averaging ${tapTempo.bpm} BPM / pause briefly to apply`,
      tone: "good"
    };
  }

  if (tapTempo.taps === 1) {
    return {
      roleLabel: "Keep tapping",
      statusLabel: "1 tap",
      detailLabel: `${currentBpm} BPM now`,
      detailTitle: `One tap captured / Tap again within ${Math.round(tapTempoWindowMs / 1000)} seconds to calculate tempo`,
      tone: "warn"
    };
  }

  return {
    roleLabel: `${currentBpm} BPM`,
    statusLabel: "Tap BPM",
    detailLabel: "2+ taps",
    detailTitle: `Tap repeatedly to set the project BPM between ${minProjectBpm} and ${maxProjectBpm}`,
    tone: "good"
  };
}

export function createProjectSafetyReadoutSummary(
  recovery: LocalDraftRecovery | null,
  recoveryDeferred: boolean,
  localDraftSavedAt: string | null,
  projectStatus: string,
  projectFileLabel: string | null,
  hasUnsavedChanges: boolean
): ProjectSafetyReadoutSummary {
  const trimmedStatus = projectStatus.trim();
  const fileLabel = projectFileLabel?.trim() || null;

  if (recovery && recoveryDeferred) {
    const savedLabel = formatLocalDraftSavedAt(recovery.savedAt);
    return {
      roleLabel: "Current project kept",
      statusLabel: "Recovery set aside",
      detailLabel: `${savedLabel} / available in Actions`,
      detailTitle: `Recovery copy set aside for this session / ${savedLabel} / Current project unchanged / Restore Draft or Clear Draft remains available in Actions`,
      tone: "warn"
    };
  }

  if (recovery) {
    const savedLabel = formatLocalDraftSavedAt(recovery.savedAt);
    return {
      roleLabel: "Restore or clear",
      statusLabel: "Draft found",
      detailLabel: fileLabel ? `${savedLabel} / ${fileLabel}` : `${savedLabel} / local only`,
      detailTitle: `Draft found / ${savedLabel} / ${fileLabel ? `Current file ${fileLabel} / ` : ""}Restore Draft or Clear Draft before deciding what to keep`,
      tone: "warn"
    };
  }

  if (localDraftSavedAt) {
    const savedLabel = formatLocalDraftSavedAt(localDraftSavedAt);
    return {
      roleLabel: fileLabel && hasUnsavedChanges ? "Unsaved edits" : "Safety net",
      statusLabel: `Draft ${savedLabel}`,
      detailLabel: fileLabel ? `${fileLabel} changed` : "Save .grooveforge next",
      detailTitle: `Renderer-local draft written ${savedLabel} / ${fileLabel ? `${fileLabel} has unsaved edits` : "Save a .grooveforge file for a durable copy"}`,
      tone: "warn"
    };
  }

  if (fileLabel && hasUnsavedChanges) {
    return {
      roleLabel: "Unsaved edits",
      statusLabel: "File changed",
      detailLabel: `${fileLabel} / draft pending`,
      detailTitle: `${fileLabel} has unsaved edits / Local draft writes after project edits / Save to refresh the durable file`,
      tone: "warn"
    };
  }

  if (fileLabel) {
    return {
      roleLabel: "Durable copy",
      statusLabel: "File saved",
      detailLabel: fileLabel,
      detailTitle: `${fileLabel} is the current durable project file / Local draft recovery cleared after explicit save or open`,
      tone: "good"
    };
  }

  if (trimmedStatus.startsWith("Saved ") || trimmedStatus.startsWith("Downloaded ")) {
    return {
      roleLabel: "Durable copy",
      statusLabel: "File saved",
      detailLabel: "Draft cleared",
      detailTitle: `${trimmedStatus} / Local draft recovery cleared after explicit save`,
      tone: "good"
    };
  }

  return {
    roleLabel: "Save to keep",
    statusLabel: "Editable now",
    detailLabel: "Local project only",
    detailTitle: `${trimmedStatus || "Editable project"} / Local project only / Use Save for a durable .grooveforge project file`,
    tone: "warn"
  };
}

export function createPatternPlaybackReadoutSummary(
  selectedPattern: PatternSlot,
  playingPattern: PatternSlot | null,
  selectedEventCount: string,
  playingEventCount: string | null
): PatternPlaybackReadoutSummary {
  const roleLabel = `Editing Pattern ${selectedPattern}`;
  if (!playingPattern) {
    return {
      roleLabel,
      statusLabel: "Pattern idle",
      detailLabel: selectedEventCount,
      detailTitle: `${roleLabel} / playback stopped / ${selectedEventCount}`,
      tone: "warn"
    };
  }

  const statusLabel = `Hearing Pattern ${playingPattern}`;
  if (playingPattern === selectedPattern) {
    return {
      roleLabel,
      statusLabel,
      detailLabel: `${selectedEventCount} live`,
      detailTitle: `${roleLabel} / ${statusLabel} / ${selectedEventCount} live`,
      tone: "good"
    };
  }

  const detailLabel = `${selectedEventCount} edit / ${playingEventCount ?? "audible"} heard`;
  return {
    roleLabel,
    statusLabel,
    detailLabel,
    detailTitle: `${roleLabel} / ${statusLabel} / ${detailLabel}`,
    tone: "warn"
  };
}

export function createArrangementPlaybackReadoutSummary(
  project: ProjectState,
  selectedIndex: number,
  playingIndex: number | null
): ArrangementPlaybackReadoutSummary {
  const boundedSelectedIndex = Math.min(Math.max(0, selectedIndex), project.arrangement.length - 1);
  const selectedBlock = project.arrangement[boundedSelectedIndex];
  if (!selectedBlock) {
    return {
      roleLabel: "No block",
      statusLabel: "Arrangement idle",
      detailLabel: "Create a block",
      detailTitle: "Arrangement has no block selected or available for playback context.",
      tone: "danger"
    };
  }

  const selectedLabel = `Block ${boundedSelectedIndex + 1} ${selectedBlock.section}`;
  const roleLabel = `Editing ${selectedLabel}`;
  const selectedDetail = `Pattern ${selectedBlock.pattern} / ${barCountLabel(selectedBlock.bars)}`;

  if (playingIndex === null) {
    return {
      roleLabel,
      statusLabel: "Arrangement idle",
      detailLabel: selectedDetail,
      detailTitle: `${roleLabel} / playback stopped / ${selectedDetail}`,
      tone: "warn"
    };
  }

  const boundedPlayingIndex = Math.min(Math.max(0, playingIndex), project.arrangement.length - 1);
  const playingBlock = project.arrangement[boundedPlayingIndex];
  if (!playingBlock) {
    return {
      roleLabel,
      statusLabel: "Hearing Arrangement",
      detailLabel: selectedDetail,
      detailTitle: `${roleLabel} / arrangement playback snapshot has no matching block / ${selectedDetail}`,
      tone: "warn"
    };
  }

  const playingLabel = `Block ${boundedPlayingIndex + 1} ${playingBlock.section}`;
  const statusLabel = `Hearing ${playingLabel}`;
  if (boundedPlayingIndex === boundedSelectedIndex) {
    return {
      roleLabel,
      statusLabel,
      detailLabel: `${selectedDetail} live`,
      detailTitle: `${roleLabel} / ${statusLabel} / ${selectedDetail} live`,
      tone: "good"
    };
  }

  const detailLabel = `Pattern ${selectedBlock.pattern} edit / Pattern ${playingBlock.pattern} heard`;
  return {
    roleLabel,
    statusLabel,
    detailLabel,
    detailTitle: `${roleLabel} / ${statusLabel} / ${detailLabel}`,
    tone: "warn"
  };
}

export function createEditHistoryEntry(project: ProjectState, status: string): EditHistoryEntry {
  return {
    project,
    label: editHistoryEntryLabel(status)
  };
}

export function editHistoryEntryLabel(status: string): string {
  const label = status.trim();
  return label && label !== "Unsaved changes" ? label : "Project edit";
}

export function createEditHistoryReadoutSummary(
  undoDepth: number,
  redoDepth: number,
  projectStatus: string,
  nextUndoLabel: string | null,
  nextRedoLabel: string | null
): EditHistoryReadoutSummary {
  const statusLabel = `${undoDepth} undo / ${redoDepth} redo`;
  const statusDetail = projectStatus.trim() || "Project ready";
  const undoDetail = nextUndoLabel ? `Undo: ${nextUndoLabel}` : null;
  const redoDetail = nextRedoLabel ? `Redo: ${nextRedoLabel}` : null;
  const actionDetail = [undoDetail, redoDetail].filter(Boolean).join(" / ");

  if (redoDepth > 0) {
    return {
      roleLabel: "Redo window",
      statusLabel,
      detailLabel: actionDetail || `${redoDepth} redo ready`,
      detailTitle: `${statusLabel} / ${actionDetail || "Redo ready"} / ${statusDetail}`,
      nextUndoLabel,
      nextRedoLabel,
      tone: "good"
    };
  }

  if (undoDepth > 0) {
    return {
      roleLabel: "Undo ready",
      statusLabel,
      detailLabel: undoDetail ?? `${undoDepth} ${undoDepth === 1 ? "edit" : "edits"} backed up`,
      detailTitle: `${statusLabel} / ${undoDetail ?? "Undo ready"} / ${statusDetail}`,
      nextUndoLabel,
      nextRedoLabel,
      tone: "good"
    };
  }

  return {
    roleLabel: "Clean slate",
    statusLabel,
    detailLabel: "No edit history",
    detailTitle: `${statusLabel} / ${statusDetail}`,
    nextUndoLabel,
    nextRedoLabel,
    tone: "warn"
  };
}

export function boundedSessionBriefText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").slice(0, maxLength);
}

export function boundedCustomDeliveryText(value: string, maxLength: number): string {
  return value.replace(/\s+/g, " ").slice(0, maxLength);
}

export function sameCustomDeliveryTarget(left: CustomDeliveryTarget, right: CustomDeliveryTarget): boolean {
  return (
    left.name === right.name &&
    left.focus === right.focus &&
    left.targetBars === right.targetBars &&
    left.preferredTemplate === right.preferredTemplate &&
    left.preferredMasterPreset === right.preferredMasterPreset &&
    left.stemGoal === right.stemGoal &&
    left.mixPosture === right.mixPosture
  );
}

export function sessionBriefFieldLabel(field: keyof SessionBrief): string {
  const labels: Record<keyof SessionBrief, string> = {
    artist: "artist",
    vibe: "vibe",
    reference: "reference",
    notes: "notes"
  };
  return labels[field];
}

export function createBeatBlueprintResult(blueprint: BeatBlueprint, beforeProject: ProjectState, afterProject: ProjectState): BeatBlueprintResult {
  const metrics: BeatBlueprintResultMetric[] = [
    createBeatBlueprintResultMetric("style", "Style", beatBlueprintStyleLabel(beforeProject), beatBlueprintStyleLabel(afterProject)),
    createBeatBlueprintResultMetric("key", "Key", beforeProject.key, afterProject.key),
    createBeatBlueprintResultMetric("tempo", "Tempo", `${beforeProject.bpm} BPM`, `${afterProject.bpm} BPM`),
    createBeatBlueprintResultMetric(
      "arrangement",
      "Arrangement",
      beatBlueprintArrangementLabel(beforeProject),
      beatBlueprintArrangementLabel(afterProject)
    ),
    createBeatBlueprintResultMetric(
      "sound",
      "Sound",
      soundPresetLabel(beforeProject.sound.preset),
      soundPresetLabel(afterProject.sound.preset)
    ),
    createBeatBlueprintResultMetric("master", "Master", beatBlueprintMasterLabel(beforeProject), beatBlueprintMasterLabel(afterProject))
  ];
  const changedCount = metrics.filter((metric) => metric.changed).length;
  const tone: MixCoachTone = changedCount === 0 ? "good" : changedCount <= 3 ? "warn" : "danger";

  return {
    blueprintId: blueprint.id,
    title: `${blueprint.name} applied`,
    status: changedCount === 0 ? "Blueprint aligned" : "Blueprint applied",
    detail: `${beatBlueprintStyleLabel(afterProject)} / ${afterProject.key} / ${afterProject.bpm} BPM / ${barCountLabel(arrangementTotalBars(afterProject))}`,
    scope: `${projectEventTotal(afterProject)} events / ${afterProject.arrangement.length} block${afterProject.arrangement.length === 1 ? "" : "s"}`,
    impact: `${changedCount} posture${changedCount === 1 ? "" : "s"} changed`,
    metrics,
    auditionCue: `Play Song to hear ${blueprint.name} across ${barCountLabel(arrangementTotalBars(afterProject))}.`,
    nextCheck: "Open Composer Guide for the next writing focus, then scan Beat Passport before arranging further.",
    tone
  };
}

export function createBeatBlueprintResultMetric(
  id: BeatBlueprintResultMetric["id"],
  label: string,
  before: string,
  after: string
): BeatBlueprintResultMetric {
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

export function beatBlueprintStyleLabel(project: ProjectState): string {
  return styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
}

export function beatBlueprintArrangementLabel(project: ProjectState): string {
  return `${barCountLabel(arrangementTotalBars(project))} / ${compactSectionFlow(project.arrangement)}`;
}

export function beatBlueprintMasterLabel(project: ProjectState): string {
  return `${project.masterPreset} / ${formatDb(project.masterCeilingDb)}`;
}

export function createBeatBlueprintPreviewSummary(project: ProjectState, blueprint: BeatBlueprint): BeatBlueprintPreviewSummary {
  const targetArrangement = createArrangementTemplate(blueprint.arrangementTemplate);
  const targetBars = arrangementBarsFromBlocks(targetArrangement);
  const currentStyleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const targetStyleName = styleProfiles.find((profile) => profile.id === blueprint.styleId)?.name ?? blueprint.styleId;
  const targetSoundLabel = soundPresetLabel(blueprint.soundPreset);
  const currentSoundLabel = soundPresetLabel(project.sound.preset);
  const targetMasterCeiling = masterPresetCeilingDb(blueprint.masterPreset);
  const styleChanged = project.styleId !== blueprint.styleId;
  const keyChanged = project.key !== blueprint.key;
  const tempoChanged = project.bpm !== blueprint.bpm;
  const arrangementChanged = !arrangementMatchesTemplate(project.arrangement, targetArrangement);
  const soundChanged = project.sound.preset !== blueprint.soundPreset;
  const masterChanged = project.masterPreset !== blueprint.masterPreset || project.masterCeilingDb !== targetMasterCeiling;

  const metrics: BeatBlueprintPreviewMetric[] = [
    beatBlueprintPreviewMetric(
      "style",
      "Style",
      targetStyleName,
      styleChanged ? `${currentStyleName} -> ${targetStyleName}` : "Current style",
      styleChanged
    ),
    beatBlueprintPreviewMetric(
      "key",
      "Key",
      blueprint.key,
      keyChanged ? `${project.key} -> ${blueprint.key}` : "Current key",
      keyChanged
    ),
    beatBlueprintPreviewMetric(
      "tempo",
      "Tempo",
      `${blueprint.bpm} BPM`,
      tempoChanged ? `${project.bpm} BPM -> ${blueprint.bpm} BPM` : "Current tempo",
      tempoChanged
    ),
    beatBlueprintPreviewMetric(
      "arrangement",
      "Arrangement",
      arrangementTemplateLabel(blueprint.arrangementTemplate),
      arrangementChanged ? `${barCountLabel(arrangementTotalBars(project))} -> ${barCountLabel(targetBars)}` : "Current form",
      arrangementChanged
    ),
    beatBlueprintPreviewMetric(
      "sound",
      "Sound",
      targetSoundLabel,
      soundChanged ? `${currentSoundLabel} -> ${targetSoundLabel}` : "Current sound",
      soundChanged
    ),
    beatBlueprintPreviewMetric(
      "master",
      "Master",
      blueprint.masterPreset,
      masterChanged ? `${formatDb(project.masterCeilingDb)} -> ${formatDb(targetMasterCeiling)} ceiling` : "Current master",
      masterChanged
    )
  ];
  const changedCount = metrics.filter((metric) => metric.status === "Change").length;

  return {
    blueprintId: blueprint.id,
    name: blueprint.name,
    focus: blueprint.focus,
    statusLabel: changedCount === 0 ? "Current blueprint" : `${changedCount} changes previewed`,
    detailLabel: `${targetStyleName} / ${blueprint.key} / ${blueprint.bpm} BPM / ${barCountLabel(targetBars)} / ${targetSoundLabel}`,
    applyLabel: changedCount === 0 ? "Reapply" : "Apply preview",
    tone: changedCount === 0 ? "good" : "warn",
    metrics
  };
}

export function beatBlueprintPreviewMetric(
  id: BeatBlueprintPreviewMetricId,
  label: string,
  value: string,
  detail: string,
  changed: boolean
): BeatBlueprintPreviewMetric {
  return {
    id,
    label,
    value,
    detail,
    status: changed ? "Change" : "Keep",
    tone: changed ? "warn" : "good"
  };
}

export function arrangementBarsFromBlocks(blocks: ArrangementBlock[]): number {
  return blocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
}

export function arrangementMatchesTemplate(arrangement: ArrangementBlock[], template: ArrangementBlock[]): boolean {
  if (arrangement.length !== template.length) {
    return false;
  }

  return arrangement.every((block, index) => {
    const templateBlock = template[index];
    return (
      block.section === templateBlock.section &&
      block.pattern === templateBlock.pattern &&
      normalizeArrangementBars(block.bars) === normalizeArrangementBars(templateBlock.bars) &&
      normalizeArrangementEnergy(block.energy) === normalizeArrangementEnergy(templateBlock.energy) &&
      normalizeArrangementMutedTracks(block.mutedTracks).join("/") === normalizeArrangementMutedTracks(templateBlock.mutedTracks).join("/")
    );
  });
}

export function createBeatPassportSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): BeatPassportSummary {
  const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const slots = usedPatternSlots(project);
  const readyCount = checks.filter((check) => check.tone === "good").length;
  const audibleStems = audibleStemTracks(stemAnalyses);
  const readinessTone = weakestTone(checks.map((check) => check.tone));
  const lengthTone: MixCoachTone = bars >= target.targetBars ? "good" : bars >= 8 ? "warn" : "danger";
  const patternTone: MixCoachTone = slots.length >= 3 ? "good" : slots.length >= 2 ? "warn" : "danger";
  const exportTone: MixCoachTone = analysis.status === "Ready" ? "good" : analysis.status === "Silent" ? "danger" : "warn";
  const stemTone: MixCoachTone =
    audibleStems.length >= target.stemGoal ? "good" : audibleStems.length >= 2 ? "warn" : "danger";
  const masterTone: MixCoachTone = project.masterPreset === target.preferredMasterPreset ? "good" : "warn";
  const tone = weakestTone([lengthTone, patternTone, readinessTone, exportTone, stemTone, masterTone]);
  const patternLabel = slots.length > 0 ? slots.join("/") : project.selectedPattern;
  const stemLabel = audibleStems.length > 0 ? audibleStems.map(stemTrackLabel).join("/") : "No stems";
  const checksLeft = checks.length - readyCount;

  return {
    headline: `${target.name} / ${barCountLabel(bars)} / Pattern ${patternLabel}`,
    detail: `${styleName} / ${project.key} / ${project.bpm} BPM / ${project.masterPreset}`,
    tone,
    metrics: [
      {
        id: "target",
        focusId: "target",
        label: "Target",
        value: target.name,
        detail: target.focus,
        focusTarget: "deliver",
        focusLabel: "Deliver",
        tone: isDeliveryTargetAligned(project, target) ? "good" : "warn"
      },
      {
        id: "length",
        focusId: "length",
        label: "Length",
        value: barCountLabel(bars),
        detail: `${barCountLabel(target.targetBars)} target`,
        focusTarget: "arrange",
        focusLabel: "Arrange",
        tone: lengthTone
      },
      {
        id: "patterns",
        focusId: "patterns",
        label: "Patterns",
        value: patternLabel,
        detail: `${slots.length}/3 slots used`,
        focusTarget: "compose",
        focusLabel: "Compose",
        tone: patternTone
      },
      {
        id: "readiness",
        focusId: "readiness",
        label: "Ready",
        value: `${readyCount}/${checks.length}`,
        detail: checksLeft === 0 ? "All checks green" : `${checksLeft} checks left`,
        focusTarget: "compose",
        focusLabel: "Compose",
        tone: readinessTone
      },
      {
        id: "export",
        focusId: "export",
        label: "Export",
        value: analysis.status,
        detail: `${formatDb(analysis.headroomDb)} headroom`,
        focusTarget: "deliver",
        focusLabel: "Deliver",
        tone: exportTone
      },
      {
        id: "stems",
        focusId: "stems",
        label: "Stems",
        value: `${audibleStems.length}/${target.stemGoal}`,
        detail: stemLabel,
        focusTarget: "deliver",
        focusLabel: "Deliver",
        tone: stemTone
      },
      {
        id: "master",
        focusId: "master",
        label: "Master",
        value: project.masterPreset,
        detail: `${formatDb(project.masterCeilingDb)} ceiling / ${formatDb(masterChannelVolumeDb(project.mixer))} output`,
        focusTarget: "master",
        focusLabel: "Master",
        tone: masterTone
      }
    ]
  };
}

export function createBeatPassportFocusSummary(summary: BeatPassportSummary, focusedMetricId: BeatPassportFocusId | null): BeatPassportFocusSummary {
  const focusedMetric = focusedMetricId ? summary.metrics.find((metric) => metric.focusId === focusedMetricId) ?? null : null;
  const metric = focusedMetric ?? summary.metrics[0] ?? null;

  if (!metric) {
    return {
      focusId: null,
      statusLabel: "Passport clear",
      areaLabel: "No passport focus",
      detailLabel: "No Beat Passport metrics available",
      actionLabel: "Ready",
      detailTitle: "Beat Passport has no focusable metrics.",
      tone: "warn"
    };
  }

  const statusLabel = focusedMetric ? "Focused Passport" : "Passport Focus";
  const detailLabel = `${metric.focusLabel} panel / ${metric.detail}`;

  return {
    focusId: metric.focusId,
    statusLabel,
    areaLabel: `${metric.label}: ${metric.value}`,
    detailLabel,
    actionLabel: `Open ${metric.focusLabel}`,
    detailTitle: `${statusLabel} / ${metric.label}: ${metric.value} / ${detailLabel}`,
    tone: metric.tone
  };
}

export function createBeatPassportFocusResult(metric: BeatPassportFocusItem, summary: BeatPassportSummary): BeatPassportFocusResult {
  const summaryMetric = summary.metrics.find((item) => item.focusId === metric.focusId) ?? null;

  return {
    metricId: metric.focusId,
    status: "Focused",
    title: `${metric.label} passport focused`,
    detail: `${metric.value}: ${metric.detail}`,
    destination: `${metric.focusLabel} panel`,
    metricLabel: "Passport",
    metricValue: beatPassportFocusResultMetric(summary),
    auditionCue: beatPassportFocusResultAudition(metric),
    nextCheck: beatPassportFocusResultNextCheck(metric),
    tone: summaryMetric?.tone ?? "warn"
  };
}

export function beatPassportFocusResultMetric(summary: BeatPassportSummary): string {
  const readyCount = summary.metrics.filter((metric) => metric.tone === "good").length;
  const reviewCount = summary.metrics.filter((metric) => metric.tone === "warn").length;
  const blockerCount = summary.metrics.filter((metric) => metric.tone === "danger").length;

  return `${readyCount}/${summary.metrics.length} identity metrics ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function beatPassportFocusResultAudition(metric: BeatPassportFocusItem): string {
  switch (metric.focusId) {
    case "target":
      return "Check Delivery Target and Session Brief before changing arrangement or mix posture.";
    case "length":
      return "Play Song loop and scan whether section length matches the selected delivery target.";
    case "patterns":
      return "Audition Pattern A/B/C use across Song Form and confirm each section has the right loop.";
    case "readiness":
      return "Review Beat Readiness and listen for the missing compose, arrange, or export foundation.";
    case "export":
      return "Check the full mix export posture before handing the beat off.";
    case "stems":
      return "Audition Full Mix and stems to confirm audible tracks match handoff needs.";
    case "master":
      return "Play the full mix against the master ceiling and limiter posture.";
  }
}

export function beatPassportFocusResultNextCheck(metric: BeatPassportFocusItem): string {
  switch (metric.focusId) {
    case "target":
      return "Return after target, brief, arrangement length, and mix posture agree.";
    case "length":
      return "Return after the beat has enough bars and sections for the chosen target.";
    case "patterns":
      return "Return after Pattern A/B/C coverage supports verse, hook, or variation decisions.";
    case "readiness":
      return "Return after the core readiness checks are green or intentionally deferred.";
    case "export":
      return "Return after the full-mix export status and headroom are delivery-safe.";
    case "stems":
      return "Return after the audible stem count and stem labels match the handoff expectation.";
    case "master":
      return "Return after the master preset, ceiling, and output level fit the target.";
  }
}

export function createSnapshotCompareProjectProfile(project: ProjectState): SnapshotCompareProjectProfile {
  const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const analysis = analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, analysis);
  const readyCount = checks.filter((check) => check.tone === "good").length;
  const readinessTone = weakestTone(checks.map((check) => check.tone));
  const audibleStems = audibleStemTracks(stemAnalyses);
  const exportTone: MixCoachTone = analysis.status === "Ready" ? "good" : analysis.status === "Silent" ? "danger" : "warn";
  const stemTone: MixCoachTone =
    audibleStems.length >= target.stemGoal ? "good" : audibleStems.length >= 2 ? "warn" : "danger";

  return {
    setup: `${styleName} / ${project.key} / ${project.bpm} BPM`,
    targetName: target.name,
    bars,
    length: barCountLabel(bars),
    readyCount,
    readiness: `${readyCount}/${checks.length}`,
    readinessTone,
    exportStatus: analysis.status,
    exportDetail: `${formatDb(analysis.headroomDb)} headroom`,
    exportTone,
    stemCount: audibleStems.length,
    stemGoal: target.stemGoal,
    stems: `${audibleStems.length}/${target.stemGoal}`,
    stemTone,
    master: project.masterPreset,
    masterDetail: `${formatDb(project.masterCeilingDb)} ceiling / ${formatDb(masterChannelVolumeDb(project.mixer))} output`
  };
}

export function createFinishChecklistSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): FinishChecklistSummary {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const briefFields = sessionBriefFilledFields(project.sessionBrief);
  const drums = readinessCheckForId(checks, "drums");
  const bass = readinessCheckForId(checks, "bass");
  const harmony = readinessCheckForId(checks, "harmony");
  const arrangement = readinessCheckForId(checks, "arrangement");
  const mixChecks = createMixCoachChecks(analysis, stemAnalyses);
  const mixTone = weakestTone(mixChecks.map((check) => check.tone));
  const mixReviewCount = mixChecks.filter((check) => check.tone !== "good").length;
  const structureTone = createStructureLensSummary(project).tone;
  const automationPreset = masterAutomationPresetForProject(project);
  const automationLabel = masterAutomationPresetLabel(automationPreset);
  const automationTone: MixCoachTone = automationPreset === "custom" ? "warn" : "good";
  const composeTone = weakestTone([drums?.tone ?? "danger", bass?.tone ?? "danger", harmony?.tone ?? "danger"]);
  const arrangeTone = weakestTone([
    arrangement?.tone ?? "danger",
    structureTone,
    isDeliveryTargetAligned(project, target) ? "good" : "warn"
  ]);
  const masterTone: MixCoachTone =
    analysis.status === "Silent"
      ? "danger"
      : analysis.status === "Ready" && project.masterPreset === target.preferredMasterPreset
        ? "good"
        : "warn";
  const handoffTone: MixCoachTone =
    analysis.status === "Ready" && audibleStems.length >= target.stemGoal && briefFields >= 2
      ? "good"
      : analysis.status !== "Silent" && (audibleStems.length >= 2 || briefFields > 0)
        ? "warn"
        : "danger";
  const baseCards: Array<Omit<FinishChecklistCard, "focusTarget" | "focusLabel">> = [
    {
      id: "compose",
      label: "Compose",
      status: composeTone === "good" ? "Playable" : composeTone === "warn" ? "Sketch" : "Needs core",
      detail: `${drums?.status ?? "Drums"} / ${bass?.status ?? "808"} / ${harmony?.status ?? "Harmony"}`,
      tone: composeTone
    },
    {
      id: "arrange",
      label: "Arrange",
      status: arrangeTone === "good" ? "Target fit" : arrangeTone === "warn" ? "Review shape" : "Too short",
      detail: `${barCountLabel(bars)} of ${barCountLabel(target.targetBars)} / ${target.name}`,
      tone: arrangeTone
    },
    {
      id: "mix",
      label: "Mix",
      status: mixTone === "good" ? "Balanced" : mixTone === "warn" ? "Check mix" : "Needs signal",
      detail: mixReviewCount === 0 ? "Mix Coach checks green" : `${mixReviewCount} Mix Coach check${mixReviewCount === 1 ? "" : "s"} to review`,
      tone: mixTone
    },
    {
      id: "master",
      label: "Master",
      status: project.masterPreset,
      detail: `${analysis.status} / ${formatDb(project.masterCeilingDb)} ceiling / ${formatDb(analysis.headroomDb)} headroom`,
      tone: masterTone
    },
    {
      id: "automation",
      label: "Automation",
      status: automationLabel,
      detail: `${masterAutomationEventCountLabel(project)} / ${masterAutomationRangeLabel(project)} / playback + export`,
      tone: automationTone
    },
    {
      id: "handoff",
      label: "Handoff",
      status: `${audibleStems.length}/${target.stemGoal} stems`,
      detail: `${briefFields}/4 brief fields / ${handoffSheetFileName(project)}`,
      tone: handoffTone
    }
  ];
  const cards: FinishChecklistCard[] = baseCards.map((card) => {
    const focusTarget = finishChecklistFocusTarget(card.id);
    return {
      ...card,
      focusTarget,
      focusLabel: reviewQueueFocusLabel(focusTarget)
    };
  });
  const tone = weakestTone(cards.map((card) => card.tone));
  const readyCount = cards.filter((card) => card.tone === "good").length;
  const headline =
    tone === "good" ? "Ready to deliver" : tone === "warn" ? "Finish checks need review" : "Build core before export";

  return {
    headline,
    detail: `${readyCount}/${cards.length} ready / ${target.name} / ${analysis.status}`,
    tone,
    cards
  };
}

export function createReviewQueueSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): ReviewQueueSummary {
  const target = activeDeliveryTarget(project);
  const structure = createStructureLensSummary(project);
  const mixChecks = createMixCoachChecks(analysis, stemAnalyses);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const briefFields = sessionBriefFilledFields(project.sessionBrief);
  const candidates: Array<ReviewQueueItem & { order: number }> = [];
  let order = 0;
  const pushIssue = (item: Omit<ReviewQueueItem, "focusTarget" | "focusLabel">): void => {
    const focusTarget = reviewQueueFocusTarget(item);
    candidates.push({ ...item, focusTarget, focusLabel: reviewQueueFocusLabel(focusTarget), order });
    order += 1;
  };

  checks
    .filter((check) => check.tone !== "good")
    .forEach((check) =>
      pushIssue({
        id: `readiness-${check.id}`,
        area: readinessReviewArea(check.id),
        status: `${check.label}: ${check.status}`,
        detail: check.detail,
        tone: check.tone
      })
    );

  structure.signals
    .filter((signal) => signal.tone !== "good")
    .forEach((signal) =>
      pushIssue({
        id: `structure-${signal.id}`,
        area: "Arrange",
        status: `${signal.label}: ${signal.value}`,
        detail: signal.detail,
        tone: signal.tone
      })
    );

  if (!isDeliveryTargetAligned(project, target)) {
    pushIssue({
      id: "target-alignment",
      area: "Target",
      status: "Delivery target mismatch",
      detail: `Align length, master preset, and mix posture for ${target.name}.`,
      tone: "warn"
    });
  }

  mixChecks
    .filter((check) => check.tone !== "good")
    .forEach((check) =>
      pushIssue({
        id: `mix-${check.id}`,
        area: mixReviewArea(check.id),
        status: `${check.label}: ${check.status}`,
        detail: check.detail,
        tone: check.tone
      })
    );

  if (project.masterPreset !== target.preferredMasterPreset) {
    pushIssue({
      id: "master-preset",
      area: "Master",
      status: "Preset target",
      detail: `${project.masterPreset} selected; ${target.preferredMasterPreset} fits ${target.name}.`,
      tone: "warn"
    });
  }

  if (audibleStems.length < target.stemGoal) {
    pushIssue({
      id: "stem-coverage",
      area: "Handoff",
      status: "Stem coverage",
      detail: `${audibleStems.length}/${target.stemGoal} audible stems for ${target.name}.`,
      tone: audibleStems.length > 0 ? "warn" : "danger"
    });
  }

  if (briefFields < 2) {
    pushIssue({
      id: "session-brief",
      area: "Handoff",
      status: "Brief context",
      detail: `${briefFields}/4 Session Brief fields filled for collaborator review.`,
      tone: briefFields > 0 ? "warn" : "danger"
    });
  }

  if (candidates.length === 0) {
    const readyFocusTarget: ReviewQueueFocusTarget = "deliver";
    const items: ReviewQueueItem[] = [
      {
        id: "ready",
        area: "Review",
        status: "No queued issues",
        detail: `${target.name} / ${analysis.status} / ${formatDb(analysis.headroomDb)} headroom`,
        tone: "good",
        focusTarget: readyFocusTarget,
        focusLabel: reviewQueueFocusLabel(readyFocusTarget)
      }
    ];
    return {
      headline: "No queued issues",
      detail: `${target.name} scan is clear`,
      tone: "good",
      items
    };
  }

  const items = candidates
    .sort((first, second) => reviewToneRank(first.tone) - reviewToneRank(second.tone) || first.order - second.order)
    .slice(0, 5)
    .map(({ order: _order, ...item }) => item);
  const tone = weakestTone(items.map((item) => item.tone));
  const hiddenCount = Math.max(0, candidates.length - items.length);
  const headline = tone === "danger" ? "Fix these before export" : "Review before export";
  const issueLabel = `${items.length} issue${items.length === 1 ? "" : "s"}`;

  return {
    headline,
    detail: hiddenCount > 0 ? `${issueLabel} shown / ${hiddenCount} more queued` : `${issueLabel} queued / ${target.name}`,
    tone,
    items
  };
}

export function createWorkflowNavigatorJumpResult(
  item: WorkflowNavigatorItem,
  items: WorkflowNavigatorItem[]
): WorkflowNavigatorJumpResult {
  return {
    zoneId: item.id,
    status: "Jumped",
    title: `${item.label} zone ready`,
    detail: `${item.value} / ${item.detail}`,
    metricLabel: "Workflow",
    metricValue: workflowNavigatorJumpMetricValue(items),
    auditionCue: workflowNavigatorJumpAuditionCue(item),
    nextCheck: workflowNavigatorJumpNextCheck(item),
    tone: item.tone
  };
}

export function workflowNavigatorJumpMetricValue(items: WorkflowNavigatorItem[]): string {
  const readyCount = items.filter((item) => item.tone === "good").length;
  const reviewCount = items.filter((item) => item.tone === "warn").length;
  const blockerCount = items.filter((item) => item.tone === "danger").length;
  return `${readyCount}/${items.length} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function workflowNavigatorJumpAuditionCue(item: WorkflowNavigatorItem): string {
  switch (item.id) {
    case "compose":
      return "Use Pattern loop audition while editing drums, 808/bass, chords, or melody.";
    case "arrange":
      return "Use Song or Block loop audition to check section order, energy, and Pattern A/B/C placement.";
    case "mix":
      return "Use Stem Audition and Mix Coach before choosing any explicit mix or master move.";
    case "deliver":
      return "Use Export Preflight and Handoff Pack before explicit WAV, stems, MIDI, or sheet export.";
  }
}

export function workflowNavigatorJumpNextCheck(item: WorkflowNavigatorItem): string {
  switch (item.id) {
    case "compose":
      return "Return to Workflow Navigator after the core musical layers are ready.";
    case "arrange":
      return "Return after the hook, contrast, and target bar length are clear.";
    case "mix":
      return "Return after headroom, stem balance, low end, and master posture are ready.";
    case "deliver":
      return "Return after exports and handoff context are ready for the selected target.";
  }
}

export function createWorkflowNavigatorItems(
  project: ProjectState,
  beatMap: BeatMapSummary,
  exportPreflight: ExportPreflightSummary,
  analysis: ExportAnalysis
): WorkflowNavigatorItem[] {
  const composeStage = beatMap.stages.find((stage) => stage.id === "compose") ?? beatMap.stages[1];
  const arrangeStage = beatMap.stages.find((stage) => stage.id === "arrange") ?? beatMap.stages[2];
  const polishStage = beatMap.stages.find((stage) => stage.id === "polish") ?? beatMap.stages[3];
  const deliverStage = beatMap.stages.find((stage) => stage.id === "deliver") ?? beatMap.stages[4];

  return [
    {
      id: "compose",
      label: "Compose",
      value: `Pattern ${project.selectedPattern}`,
      detail: `${composeStage.status} / ${composeStage.detail}`,
      tone: composeStage.tone
    },
    {
      id: "arrange",
      label: "Arrange",
      value: barCountLabel(arrangementTotalBars(project)),
      detail: `${arrangeStage.status} / ${arrangeStage.detail}`,
      tone: arrangeStage.tone
    },
    {
      id: "mix",
      label: "Mix",
      value: analysis.status,
      detail: `${polishStage.status} / ${polishStage.detail}`,
      tone: polishStage.tone
    },
    {
      id: "deliver",
      label: "Deliver",
      value: exportPreflight.headline,
      detail: `${deliverStage.status} / ${exportPreflight.detail}`,
      tone: weakestTone([deliverStage.tone, exportPreflight.tone])
    }
  ];
}

export function createExportPreflightSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): ExportPreflightSummary {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const readyCount = checks.filter((check) => check.tone === "good").length;
  const readinessTone = weakestTone(checks.map((check) => check.tone));
  const firstOpenCheck = checks.find((check) => check.tone !== "good");
  const exportTone: MixCoachTone = analysis.status === "Ready" ? "good" : analysis.status === "Silent" ? "danger" : "warn";
  const mixChecks = createMixCoachChecks(analysis, stemAnalyses);
  const mixTone = weakestTone(mixChecks.map((check) => check.tone));
  const openMixChecks = mixChecks.filter((check) => check.tone !== "good").length;
  const audibleStems = audibleStemTracks(stemAnalyses);
  const stemTone: MixCoachTone =
    audibleStems.length >= target.stemGoal ? "good" : audibleStems.length >= 2 ? "warn" : "danger";
  const midiTone: MixCoachTone = bars >= 8 ? "good" : bars >= 4 ? "warn" : "danger";
  const deliverableReady = [exportTone, stemTone, midiTone].filter((tone) => tone === "good").length;
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const automationPreset = masterAutomationPresetForProject(project);
  const automationTone: MixCoachTone = automationPreset === "custom" ? "warn" : "good";
  const cards: ExportPreflightCard[] = [
    {
      id: "readiness",
      focusId: "readiness",
      label: "Readiness",
      value: `${readyCount}/${checks.length} green`,
      detail: firstOpenCheck ? `${firstOpenCheck.label}: ${firstOpenCheck.status}` : "Composition and arrangement checks green",
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: readinessTone
    },
    {
      id: "mix",
      focusId: "mix",
      label: "Mix / Master",
      value: analysis.status,
      detail:
        openMixChecks === 0
          ? `${formatDb(analysis.headroomDb)} headroom / Mix Coach clear`
          : `${formatDb(analysis.headroomDb)} headroom / ${openMixChecks} mix checks`,
      focusTarget: "master",
      focusLabel: "Master",
      tone: weakestTone([exportTone, mixTone])
    },
    {
      id: "automation",
      focusId: "automation",
      label: "Automation",
      value: masterAutomationPresetLabel(automationPreset),
      detail: `${masterAutomationEventCountLabel(project)} / ${masterAutomationRangeLabel(project)} / WAV + stems`,
      focusTarget: "master",
      focusLabel: "Master",
      tone: automationTone
    },
    {
      id: "deliverables",
      focusId: "deliverables",
      label: "Deliverables",
      value: `${deliverableReady}/3 clear`,
      detail: `WAV ${analysis.status} / ${audibleStems.length}/${target.stemGoal} stems / ${barCountLabel(bars)} MIDI`,
      focusTarget: "deliver",
      focusLabel: "Deliver",
      tone: weakestTone([exportTone, stemTone, midiTone])
    },
    {
      id: "handoff",
      focusId: "handoff",
      label: "Handoff",
      value: briefStatus.value,
      detail: `${briefStatus.detail} / ${handoffSheetFileName(project)}`,
      focusTarget: "deliver",
      focusLabel: "Deliver",
      tone: briefStatus.tone
    }
  ];
  const tone = weakestTone(cards.map((card) => card.tone));
  const headline =
    tone === "good" ? "Ready to send" : tone === "warn" ? "Review before send" : "Hold export";

  return {
    headline,
    detail: `${target.name} / ${readyCount}/${checks.length} readiness / ${analysis.status}`,
    tone,
    cards
  };
}

export function createExportPreflightFocusSummary(
  summary: ExportPreflightSummary,
  focusedCardId: ExportPreflightFocusId | null
): ExportPreflightFocusSummary {
  const focusedCard = focusedCardId ? summary.cards.find((card) => card.focusId === focusedCardId) ?? null : null;
  const card = focusedCard ?? summary.cards.find((candidate) => candidate.tone !== "good") ?? summary.cards[0] ?? null;

  if (!card) {
    return {
      focusId: null,
      statusLabel: "Preflight clear",
      areaLabel: "No preflight focus",
      detailLabel: "No Export Preflight cards available",
      detailTitle: "Export Preflight has no focusable cards.",
      tone: "warn"
    };
  }

  const statusLabel = focusedCard ? "Focused Preflight" : "Preflight Focus";
  const detailLabel = `${card.focusLabel} panel / ${card.detail}`;

  return {
    focusId: card.focusId,
    statusLabel,
    areaLabel: `${card.label}: ${card.value}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${card.label}: ${card.value} / ${detailLabel}`,
    tone: card.tone
  };
}

export function createExportPreflightFocusResult(
  card: ExportPreflightFocusItem,
  summary: ExportPreflightSummary
): ExportPreflightFocusResult {
  const summaryCard = summary.cards.find((item) => item.focusId === card.focusId) ?? null;

  return {
    cardId: card.focusId,
    status: "Focused",
    title: `${card.label} preflight focused`,
    detail: `${card.value}: ${card.detail}`,
    destination: `${card.focusLabel} panel`,
    metricLabel: "Preflight",
    metricValue: exportPreflightFocusResultMetric(summary),
    auditionCue: exportPreflightFocusResultAudition(card),
    nextCheck: exportPreflightFocusResultNextCheck(card),
    tone: summaryCard?.tone ?? "warn"
  };
}

export function exportPreflightFocusResultMetric(summary: ExportPreflightSummary): string {
  const readyCount = summary.cards.filter((card) => card.tone === "good").length;
  const reviewCount = summary.cards.filter((card) => card.tone === "warn").length;
  const blockerCount = summary.cards.filter((card) => card.tone === "danger").length;

  return `${readyCount}/${summary.cards.length} delivery risks clear / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function exportPreflightFocusResultAudition(card: ExportPreflightFocusItem): string {
  switch (card.focusId) {
    case "readiness":
      return "Check Beat Readiness and the current Compose or Arrange lane before starting any export.";
    case "mix":
      return "Play Full Mix, then use Mix Coach, Stem Audition, and the export meter before rendering files.";
    case "automation":
      return "Play intro, outro, and transition ranges to confirm fade posture before WAV or stem export.";
    case "deliverables":
      return "Inspect WAV, stem count, MIDI scope, and target length before downloading deliverables.";
    case "handoff":
      return "Read Session Brief and Handoff Sheet context before sending files to a vocalist or collaborator.";
  }
}

export function exportPreflightFocusResultNextCheck(card: ExportPreflightFocusItem): string {
  switch (card.focusId) {
    case "readiness":
      return "Return after composition, arrangement, and readiness blockers are clear or intentionally deferred.";
    case "mix":
      return "Return after headroom, balance, master posture, and meter status are ready for export.";
    case "automation":
      return "Return after fade automation is clear in realtime playback and export scope.";
    case "deliverables":
      return "Return after WAV, stems, and MIDI are ready for the selected delivery target.";
    case "handoff":
      return "Return after brief context and Handoff Sheet details are ready for collaborator review.";
  }
}

export function createModeFocusSummary(
  project: ProjectState,
  composer: ComposerGuideSummary,
  beatMap: BeatMapSummary,
  reviewQueue: ReviewQueueSummary,
  finish: FinishChecklistSummary
): ModeFocusSummary {
  const target = activeDeliveryTarget(project);

  if (project.mode === "studio") {
    const sessionCard = finish.cards.find((card) => card.id === "mix") ?? finish.cards[0];
    const issue = reviewQueue.items[0];
    const handoffCard = finish.cards.find((card) => card.id === "handoff") ?? finish.cards[finish.cards.length - 1];
    const cards: ModeFocusCard[] = [
      {
        id: "session",
        label: "Session scan",
        value: sessionCard.status,
        detail: sessionCard.detail,
        focusTarget: sessionCard.focusTarget,
        focusLabel: sessionCard.focusLabel,
        tone: sessionCard.tone
      },
      {
        id: "issue",
        label: issue.area,
        value: issue.status,
        detail: issue.detail,
        focusTarget: issue.focusTarget,
        focusLabel: issue.focusLabel,
        tone: issue.tone
      },
      {
        id: "handoff",
        label: "Handoff",
        value: handoffCard.status,
        detail: handoffCard.detail,
        focusTarget: handoffCard.focusTarget,
        focusLabel: handoffCard.focusLabel,
        tone: handoffCard.tone
      }
    ];

    return {
      mode: "studio",
      headline: reviewQueue.headline,
      detail: `${target.name} / ${project.masterPreset} / ${finish.detail}`,
      tone: weakestTone(cards.map((card) => card.tone)),
      ...createModeFocusDecision("studio", cards),
      cards
    };
  }

  const stage = beatMap.stages.find((candidate) => candidate.tone !== "good") ?? beatMap.stages[beatMap.stages.length - 1];
  const focus = composer.cards.find((card) => card.tone !== "good") ?? composer.cards[0];
  const check = finish.cards.find((card) => card.tone !== "good") ?? finish.cards[finish.cards.length - 1];
  const stageFocusTarget = modeFocusStageTarget(stage.id);
  const cards: ModeFocusCard[] = [
    {
      id: "stage",
      label: "Current stage",
      value: stage.label,
      detail: `${stage.status} / ${stage.detail}`,
      focusTarget: stageFocusTarget,
      focusLabel: reviewQueueFocusLabel(stageFocusTarget),
      tone: stage.tone
    },
    {
      id: "focus",
      label: "Writing focus",
      value: focus.label,
      detail: `${focus.status} / ${focus.detail}`,
      focusTarget: focus.focusTarget,
      focusLabel: focus.focusLabel,
      tone: focus.tone
    },
    {
      id: "check",
      label: "Local check",
      value: check.label,
      detail: `${check.status} / ${check.detail}`,
      focusTarget: check.focusTarget,
      focusLabel: check.focusLabel,
      tone: check.tone
    }
  ];

  return {
    mode: "guided",
    headline: composer.headline,
    detail: `${beatMap.headline} / Pattern ${project.selectedPattern} / ${target.name}`,
    tone: weakestTone(cards.map((card) => card.tone)),
    ...createModeFocusDecision("guided", cards),
    cards
  };
}

export function createAudienceSessionReadoutSummary(
  project: ProjectState,
  firstBeatPath: FirstBeatPathSummary,
  sessionPass: SessionPassSummary,
  modeFocus: ModeFocusSummary,
  workflowItems: WorkflowNavigatorItem[],
  exportPreflight: ExportPreflightSummary
): AudienceSessionReadoutSummary {
  const target = activeDeliveryTarget(project);
  const style = getStyle(project);
  const guidedPass = sessionPass.cards.find((card) => card.id === "guided") ?? sessionPass.cards[0] ?? null;
  const studioPass = sessionPass.cards.find((card) => card.id === "studio") ?? sessionPass.cards[0] ?? null;
  const finishPass = sessionPass.cards.find((card) => card.id === "finish") ?? sessionPass.cards[0] ?? null;
  const deliverPass = sessionPass.cards.find((card) => card.id === "deliver") ?? sessionPass.cards[0] ?? null;
  const composeItem = workflowItems.find((item) => item.id === "compose") ?? workflowItems[0] ?? null;
  const arrangeItem = workflowItems.find((item) => item.id === "arrange") ?? workflowItems[1] ?? null;
  const mixItem = workflowItems.find((item) => item.id === "mix") ?? workflowItems[2] ?? null;
  const deliverItem = workflowItems.find((item) => item.id === "deliver") ?? workflowItems[3] ?? null;

  const beginnerTones = [
    firstBeatPath.tone,
    guidedPass?.tone ?? "warn",
    composeItem?.tone ?? "warn",
    arrangeItem?.tone ?? "warn"
  ];
  const producerTones = [
    studioPass?.tone ?? "warn",
    finishPass?.tone ?? "warn",
    deliverPass?.tone ?? "warn",
    mixItem?.tone ?? "warn",
    deliverItem?.tone ?? "warn"
  ];
  const beginnerTone = weakestTone(beginnerTones);
  const producerTone = weakestTone(producerTones);
  const activeAudience = project.mode === "guided" ? "beginner" : "producer";
  const activeTone = activeAudience === "beginner" ? beginnerTone : producerTone;
  const activePass = activeAudience === "beginner" ? guidedPass : studioPass;
  const activeFocus = modeFocus.cards.find((card) => card.id === modeFocus.activeCardId) ?? modeFocus.cards[0] ?? null;
  const rows: AudienceSessionReadoutRow[] = [
    {
      id: "beginner",
      label: "First-time composer",
      status: audienceReadinessStatus(beginnerTone),
      value: `${audienceReadyCount(beginnerTones)}/${beginnerTones.length} clear`,
      detail: `${firstBeatPath.countLabel} / ${guidedPass?.value ?? firstBeatPath.decisionLabel}`,
      nextCheck: firstBeatPath.decisionDetail,
      actionLabel: "Enter Guided",
      actionDetail: "Open Guided first-beat workflow",
      tone: beginnerTone
    },
    {
      id: "producer",
      label: "Professional producer",
      status: audienceReadinessStatus(producerTone),
      value: `${audienceReadyCount(producerTones)}/${producerTones.length} clear`,
      detail: `${studioPass?.value ?? "Studio pass"} / ${finishPass?.value ?? "Finish"} / ${deliverPass?.value ?? "Deliver"}`,
      nextCheck: exportPreflight.headline === "Ready to send" ? "Run Export Preflight and Handoff Pack before send." : exportPreflight.detail,
      actionLabel: "Enter Studio",
      actionDetail: "Open Studio producer scan",
      tone: producerTone
    }
  ];
  const tone = weakestTone([beginnerTone, producerTone]);
  const statusLabel =
    tone === "good" ? "Audience session clear" : tone === "warn" ? "Audience session review" : "Audience session blocker";
  const activeLabel = activeAudience === "beginner" ? "First-time composer" : "Professional producer";
  const headline =
    tone === "good" ? "Audience session ready" : tone === "warn" ? "Audience session needs review" : "Build session core";

  return {
    headline,
    detail: `${activeLabel} focus / ${target.name} / ${barCountLabel(arrangementTotalBars(project))} / ${style.name}`,
    statusLabel,
    activeAudience,
    activeAudienceLabel: activeLabel,
    readinessLabel: rows.map((row) => `${row.label}: ${row.status}`).join(" / "),
    nextCheck: `${activePass?.focusLabel ?? activeFocus?.focusLabel ?? "Workflow"}: ${
      activeFocus?.detail ?? activePass?.detail ?? modeFocus.detail
    }`,
    tone: weakestTone([tone, activeTone]),
    rows
  };
}

export function audienceSessionModeForRow(row: AudienceSessionReadoutRow): ProjectState["mode"] {
  return row.id === "beginner" ? "guided" : "studio";
}

export function createAudienceSessionActionResult(
  row: AudienceSessionReadoutRow,
  summary: AudienceSessionReadoutSummary,
  mode: ProjectState["mode"]
): AudienceSessionActionResult {
  const destination = mode === "guided" ? "Guided first-beat workflow" : "Studio producer scan workflow";

  return {
    audienceId: row.id,
    audienceLabel: row.label,
    mode,
    title: `${row.label} route selected`,
    status: `${row.status} path`,
    detail: `${destination} / ${row.actionDetail} / ${summary.detail}`,
    readiness: row.value,
    nextCheck: row.nextCheck,
    tone: row.tone
  };
}

function audienceReadyCount(tones: MixCoachTone[]): number {
  return tones.filter((tone) => tone === "good").length;
}

function audienceReadinessStatus(tone: MixCoachTone): string {
  if (tone === "good") {
    return "Ready";
  }

  if (tone === "warn") {
    return "Review";
  }

  return "Build core";
}

export function createModeFocusDecision(
  mode: ProjectState["mode"],
  cards: ModeFocusCard[]
): Pick<ModeFocusSummary, "activeCardId" | "decisionStatus" | "decisionLabel" | "decisionDetail" | "decisionTitle" | "decisionTone"> {
  const preferredId = preferredModeFocusCardId(mode);
  const activeCard = cards.find((card) => card.id === preferredId) ?? cards[0] ?? null;
  const label = modeLabel(mode);

  if (!activeCard) {
    return {
      activeCardId: preferredId,
      decisionStatus: `${label} ready`,
      decisionLabel: `Jump to ${label}`,
      decisionDetail: `${label} mode has no active orientation card.`,
      decisionTitle: `${label} Mode Focus has no active orientation card.`,
      decisionTone: "good"
    };
  }

  return {
    activeCardId: activeCard.id,
    decisionStatus: modeFocusDecisionStatus(label, activeCard.tone),
    decisionLabel: `Jump to ${activeCard.focusLabel}`,
    decisionDetail: `${activeCard.label}: ${activeCard.value} / ${activeCard.detail}`,
    decisionTitle: `${label} Mode Focus uses ${activeCard.label} as the current decision and jumps to ${activeCard.focusLabel}.`,
    decisionTone: activeCard.tone
  };
}

export function modeFocusDecisionStatus(label: string, tone: MixCoachTone): string {
  if (tone === "danger") {
    return `${label} blocker`;
  }

  if (tone === "warn") {
    return `${label} review`;
  }

  return `${label} ready`;
}

export function preferredModeFocusCardId(mode: ProjectState["mode"]): string {
  return mode === "guided" ? "stage" : "issue";
}

export function modeFocusStageTarget(stageId: string): ReviewQueueFocusTarget {
  switch (stageId) {
    case "arrange":
      return "arrange";
    case "polish":
      return "mix";
    case "deliver":
      return "deliver";
    case "start":
    case "compose":
    default:
      return "compose";
  }
}

export function readinessReviewArea(id: string): string {
  switch (id) {
    case "drums":
    case "bass":
    case "harmony":
      return "Compose";
    case "arrangement":
      return "Arrange";
    case "export":
      return "Export";
    default:
      return "Review";
  }
}

export function mixReviewArea(id: string): string {
  switch (id) {
    case "headroom":
    case "limiter":
    case "dynamics":
      return "Master";
    case "stem-balance":
    case "low-end":
      return "Mix";
    default:
      return "Mix";
  }
}

export function finishChecklistFocusTarget(cardId: FinishChecklistCardId): ReviewQueueFocusTarget {
  switch (cardId) {
    case "compose":
      return "compose";
    case "arrange":
      return "arrange";
    case "mix":
      return "mix";
    case "master":
    case "automation":
      return "master";
    case "handoff":
      return "deliver";
  }
}

export function createFinishChecklistFocusSummary(
  summary: FinishChecklistSummary,
  focusedCardId: FinishChecklistCardId | null
): FinishChecklistFocusSummary {
  const focusedCard = focusedCardId ? summary.cards.find((card) => card.id === focusedCardId) ?? null : null;
  const card = focusedCard ?? summary.cards.find((candidate) => candidate.tone !== "good") ?? summary.cards[0] ?? null;

  if (!card) {
    return {
      cardId: null,
      statusLabel: "Finish clear",
      areaLabel: "No finish cards",
      detailLabel: "No Finish Checklist cards available",
      detailTitle: "Finish Checklist has no cards to focus.",
      tone: "good"
    };
  }

  const statusLabel = focusedCard ? "Focused Finish" : card.tone === "good" ? "Finish clear" : "Top Finish Check";
  const detailLabel = `${card.focusLabel} panel / ${card.detail}`;

  return {
    cardId: card.id,
    statusLabel,
    areaLabel: `${card.label}: ${card.status}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${card.label}: ${card.status} / ${detailLabel}`,
    tone: card.tone
  };
}

export function createFinishChecklistFocusResult(
  card: FinishChecklistCard,
  summary: FinishChecklistSummary
): FinishChecklistFocusResult {
  const summaryCard = summary.cards.find((item) => item.id === card.id) ?? null;

  return {
    cardId: card.id,
    status: "Focused",
    title: `${card.label} finish check focused`,
    detail: `${card.status}: ${card.detail}`,
    destination: `${card.focusLabel} panel`,
    metricLabel: "Checklist",
    metricValue: finishChecklistFocusResultMetric(summary),
    auditionCue: finishChecklistFocusResultAudition(card),
    nextCheck: finishChecklistFocusResultNextCheck(card),
    tone: summaryCard?.tone ?? "warn"
  };
}

export function finishChecklistFocusResultMetric(summary: FinishChecklistSummary): string {
  const readyCount = summary.cards.filter((card) => card.tone === "good").length;
  const reviewCount = summary.cards.filter((card) => card.tone === "warn").length;
  const blockerCount = summary.cards.filter((card) => card.tone === "danger").length;

  return `${readyCount}/${summary.cards.length} finish checks ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function finishChecklistFocusResultAudition(card: FinishChecklistCard): string {
  switch (card.id) {
    case "compose":
      return "Play Pattern loop and confirm drums, 808/bass, chords, and melody hold together before arranging further.";
    case "arrange":
      return "Play Song loop and scan section length, hook lift, Pattern A/B/C spread, and target fit.";
    case "mix":
      return "Play Full Mix, then use Stem Audition and Mix Coach to check headroom, balance, and low end.";
    case "master":
      return "Play the mastered full mix and compare master preset, ceiling, headroom, and output posture.";
    case "automation":
      return "Play intro, outro, and transition ranges to confirm fade automation supports the delivery target.";
    case "handoff":
      return "Check WAV, stems, MIDI, Session Brief, and Handoff Sheet context before sending files.";
  }
}

export function finishChecklistFocusResultNextCheck(card: FinishChecklistCard): string {
  switch (card.id) {
    case "compose":
      return "Return after the core musical layers are playable or intentionally sparse.";
    case "arrange":
      return "Return after song form, section contrast, and target length are ready.";
    case "mix":
      return "Return after Mix Coach and Stem Audition show balance issues are resolved or intentionally deferred.";
    case "master":
      return "Return after master preset, ceiling, headroom, and output role match the delivery target.";
    case "automation":
      return "Return after fade posture is clear in realtime playback and export scope.";
    case "handoff":
      return "Return after deliverables, stems, and brief context are ready for collaborator review.";
  }
}

export function reviewQueueFocusTarget(item: Pick<ReviewQueueItem, "id" | "area">): ReviewQueueFocusTarget {
  if (item.id === "target-alignment" || item.id === "stem-coverage" || item.id === "session-brief") {
    return "deliver";
  }
  if (item.area === "Compose") {
    return "compose";
  }
  if (item.area === "Arrange") {
    return "arrange";
  }
  if (item.area === "Mix") {
    return "mix";
  }
  if (item.area === "Master" || item.area === "Export") {
    return "master";
  }
  if (item.area === "Handoff" || item.area === "Target") {
    return "deliver";
  }
  return "deliver";
}

export function reviewQueueFocusLabel(target: ReviewQueueFocusTarget): string {
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

export function createReviewQueueFocusSummary(
  summary: ReviewQueueSummary,
  focusedItemId: string | null
): ReviewQueueFocusSummary {
  const focusedItem = focusedItemId ? summary.items.find((item) => item.id === focusedItemId) ?? null : null;
  const item = focusedItem ?? summary.items[0] ?? null;

  if (!item) {
    return {
      itemId: null,
      statusLabel: "Review clear",
      areaLabel: "No queued issues",
      detailLabel: "No Review Queue items available",
      detailTitle: "Review Queue has no items to focus.",
      tone: "good"
    };
  }

  const statusLabel = focusedItem ? "Focused Review" : item.tone === "good" ? "Review clear" : "Top Review";
  const detailLabel = `${item.focusLabel} panel / ${item.detail}`;

  return {
    itemId: item.id,
    statusLabel,
    areaLabel: `${item.area}: ${item.status}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${item.area}: ${item.status} / ${detailLabel}`,
    tone: item.tone
  };
}

export function createReviewQueueFocusResult(item: ReviewQueueItem, summary: ReviewQueueSummary): ReviewQueueFocusResult {
  const summaryItem = summary.items.find((queueItem) => queueItem.id === item.id) ?? null;

  return {
    itemId: item.id,
    status: "Focused",
    title: `${item.area} review focused`,
    detail: `${item.status}: ${item.detail}`,
    destination: `${item.focusLabel} panel`,
    metricLabel: "Queue",
    metricValue: reviewQueueFocusResultMetric(summary),
    auditionCue: reviewQueueFocusResultAudition(item),
    nextCheck: reviewQueueFocusResultNextCheck(item),
    tone: summaryItem?.tone ?? item.tone
  };
}

export function reviewQueueFocusResultMetric(summary: ReviewQueueSummary): string {
  const readyCount = summary.items.filter((item) => item.tone === "good").length;
  const reviewCount = summary.items.filter((item) => item.tone === "warn").length;
  const blockerCount = summary.items.filter((item) => item.tone === "danger").length;

  return `${readyCount}/${summary.items.length} review items clear / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function reviewQueueFocusResultAudition(item: ReviewQueueItem): string {
  switch (item.focusTarget) {
    case "compose":
      return "Loop the selected Pattern and inspect the queued composition layer before applying any fix.";
    case "arrange":
      return "Use Song or Block loop audition to inspect section flow, energy, and Pattern A/B/C placement.";
    case "mix":
      return "Play the Full Mix and compare the focused issue against Mix Coach before changing balance.";
    case "master":
      return "Play the Full Mix through Master and check limiter, output, and finish posture before export.";
    case "deliver":
      return "Inspect Export Preflight, Handoff Pack, and Session Brief before sending files.";
  }
}

export function reviewQueueFocusResultNextCheck(item: ReviewQueueItem): string {
  switch (item.focusTarget) {
    case "compose":
      return "Return to Review Queue after the layer is audible and editable in the selected Pattern.";
    case "arrange":
      return "Return to Review Queue after the arrangement issue is fixed or intentionally deferred.";
    case "mix":
      return "Return to Review Queue and Mix Coach after headroom, balance, or low-end posture changes.";
    case "master":
      return "Return to Review Queue after master preset, limiter, and export posture match the target.";
    case "deliver":
      return "Return to Review Queue after deliverable, stem, or handoff context checks are clear.";
  }
}

export function createReviewQueuePriority(summary: ReviewQueueSummary): ReviewQueuePriority {
  const item =
    summary.items.find((candidate) => candidate.tone === "danger") ??
    summary.items.find((candidate) => candidate.tone === "warn") ??
    summary.items[0] ??
    null;

  if (!item) {
    return {
      itemId: null,
      actionLabel: "No issue",
      statusLabel: "Review clear",
      areaLabel: "No priority issue",
      itemLabel: "No Review Queue items available",
      nextCheckLabel: "Next: return after Review Queue items are available.",
      title: "Review Queue priority has no available item.",
      tone: "good"
    };
  }

  const statusLabel =
    item.tone === "danger" ? "Review blocker" : item.tone === "warn" ? "Review priority" : "Review clear";
  const nextCheckLabel = reviewQueuePriorityNextCheck(item);

  return {
    itemId: item.id,
    actionLabel: "Focus issue",
    statusLabel,
    areaLabel: `${item.area}: ${item.status}`,
    itemLabel: `${item.focusLabel} priority / ${item.detail}`,
    nextCheckLabel,
    title: `${statusLabel}: ${item.area}: ${item.status} / ${item.detail} / ${nextCheckLabel}`,
    tone: item.tone
  };
}

export function reviewQueuePriorityNextCheck(item: ReviewQueueItem): string {
  switch (item.focusTarget) {
    case "compose":
      return "Next: loop Pattern and confirm the core musical layer.";
    case "arrange":
      return "Next: play Song or Block loop and check form or contrast.";
    case "mix":
      return "Next: play Full Mix and compare Mix Coach before balance changes.";
    case "master":
      return "Next: check master preset, limiter, ceiling, and headroom.";
    case "deliver":
      return "Next: inspect Export Preflight, stems, and handoff context.";
  }
}

export type ReviewFixAction =
  | {
      kind: "blueprint";
      blueprintId: BeatBlueprintId;
    }
  | {
      kind: "layerStarter";
      starter: LayerStarterId;
    }
  | {
      kind: "patternChain";
      chain: PatternChainId;
    }
  | {
      kind: "chainExpand";
    }
  | {
      kind: "arrangementTemplate";
      template: ArrangementTemplateId;
    }
  | {
      kind: "arrangementMove";
      preset: ArrangementMovePreset;
    }
  | {
      kind: "deliveryTarget";
      target: DeliveryTargetId;
    }
  | {
      kind: "mixFix";
      preset: MixFixPreset;
    }
  | {
      kind: "masterFinish";
      pad: MasterFinishPadId;
    }
  | {
      kind: "sessionBriefStarter";
      pad: SessionBriefStarterPadId;
    };

export type ReviewFixOption = {
  itemId: string;
  fixId: string;
  label: string;
  detail: string;
  group: string;
  action: ReviewFixAction;
  auditionCue: string;
  nextCheck: string;
};

export type ReviewFixPreviewSummary = {
  itemId: string | null;
  fixId: string | null;
  status: string;
  title: string;
  detail: string;
  detailTitle: string;
  scope: string;
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export type ReviewFixResultMetric = {
  id: "item" | "queue" | "project";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type ReviewFixResult = {
  fixId: string;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: ReviewFixResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export function activeReviewFixItem(summary: ReviewQueueSummary): ReviewQueueItem | null {
  return summary.items.find((item) => item.tone !== "good") ?? null;
}

export function createReviewFixPreview(
  summary: ReviewQueueSummary,
  focusedItemId: string | null,
  project: ProjectState,
  analysis: ExportAnalysis
): ReviewFixPreviewSummary {
  const focusedItem = focusedItemId ? summary.items.find((item) => item.id === focusedItemId) ?? null : null;
  const focusedFix = focusedItem ? createReviewFixOption(focusedItem, project, analysis) : null;
  const fallbackItem = summary.items.find((item) => item.tone !== "good" && createReviewFixOption(item, project, analysis) !== null) ?? null;
  const item = focusedFix ? focusedItem : fallbackItem;
  const fix = focusedFix ?? (item ? createReviewFixOption(item, project, analysis) : null);

  if (!item || !fix) {
    return {
      itemId: null,
      fixId: null,
      status: "No fix target",
      title: "Review Fix Preview clear",
      detail: "No one-step Review Fix is available for the current queue.",
      detailTitle: "Review Queue has no one-step fix target.",
      scope: "Review Queue",
      auditionCue: "Keep composing, arranging, mixing, or preparing delivery from the visible workstation panels.",
      nextCheck: "Return when Review Queue shows a warn or danger item with an explicit fix.",
      tone: "good"
    };
  }

  const status = focusedFix ? "Focused fix" : "Next fix";
  const scope = reviewFixScopeLabel(fix);

  return {
    itemId: item.id,
    fixId: fix.fixId,
    status,
    title: `${fix.label} preview`,
    detail: `${item.area}: ${item.status} / ${fix.detail}`,
    detailTitle: `${status} / ${item.area}: ${item.status} / ${scope}`,
    scope,
    auditionCue: fix.auditionCue,
    nextCheck: fix.nextCheck,
    tone: item.tone
  };
}

export function createReviewFixOption(
  item: ReviewQueueItem,
  project: ProjectState,
  analysis: ExportAnalysis
): ReviewFixOption | null {
  if (item.tone === "good") {
    return null;
  }

  const target = activeDeliveryTarget(project);
  const layerStarter = activeLayerStarterQuickActionOption(createLayerStarterOptions(project));
  const layerStarterId = layerStarter?.id ?? "melody";

  if (item.id === "target-alignment") {
    return {
      itemId: item.id,
      fixId: "target-align",
      label: "Align Target",
      detail: `Use the existing Delivery Target Alignment for ${target.name}.`,
      group: "Project",
      action: { kind: "deliveryTarget", target: target.id },
      auditionCue: "Play Song loop and judge length, master posture, and mix target after alignment.",
      nextCheck: "Return to Review Queue and Export Preflight before running delivery exports."
    };
  }

  if (item.id === "master-preset") {
    const padId = suggestedMasterFinishPad(project);
    return {
      itemId: item.id,
      fixId: `master-${padId}`,
      label: "Master Finish",
      detail: "Use the existing Master Finish pad that matches the active delivery target.",
      group: "Master",
      action: { kind: "masterFinish", pad: padId },
      auditionCue: "Play Full Mix and watch the export meter after the master posture changes.",
      nextCheck: "Return to Finish Checklist and Export Preflight before exporting WAV or stems."
    };
  }

  if (item.id === "stem-coverage") {
    return {
      itemId: item.id,
      fixId: "stem-balance",
      label: "Stem Balance Mix Fix",
      detail: "Use the existing Stem Balance Mix Fix to bring audible stems forward.",
      group: "Mix",
      action: { kind: "mixFix", preset: "stem_balance" },
      auditionCue: "Play Full Mix, then compare Drums, 808, Synth, and Chords stem audition pads.",
      nextCheck: "Return to Handoff Package Check and Review Queue to confirm target stem coverage."
    };
  }

  if (item.id === "session-brief") {
    return {
      itemId: item.id,
      fixId: "brief-vocal",
      label: "Vocal Brief Starter",
      detail: "Use the existing Vocal Session Brief Starter to fill blank handoff context.",
      group: "Project",
      action: { kind: "sessionBriefStarter", pad: "vocal" },
      auditionCue: "Read the Session Brief against the current song loop before exporting handoff notes.",
      nextCheck: "Return to Handoff Package Check after the collaborator context is specific enough."
    };
  }

  if (item.id.startsWith("readiness-")) {
    const readinessId = item.id.replace("readiness-", "");
    switch (readinessId) {
      case "drums":
        return reviewLayerStarterFix(item, "drums", "Drums Layer Starter");
      case "bass":
        return reviewLayerStarterFix(item, "bass", "808 Layer Starter");
      case "harmony": {
        const starter: LayerStarterId = activePattern(project).chordEvents.length === 0 ? "chords" : "melody";
        return reviewLayerStarterFix(item, starter, starter === "chords" ? "Chord Layer Starter" : "Melody Layer Starter");
      }
      case "arrangement":
        return {
          itemId: item.id,
          fixId: "arrangement-chain",
          label: "8 Bar Chain",
          detail: "Use the existing 8 Bar Pattern Chain to create an editable song outline.",
          group: "Arrange",
          action: { kind: "patternChain", chain: "eight_bar" },
          auditionCue: "Play Song loop and hear Pattern A/B/C contrast across the new outline.",
          nextCheck: "Return to Song Form Overview before expanding into a longer form."
        };
      case "export":
        if (analysis.status === "Silent") {
          const blueprintId = suggestedBlueprintId(project);
          return {
            itemId: item.id,
            fixId: `blueprint-${blueprintId}`,
            label: "Current Style Starter",
            detail: "Use the existing current-style Beat Blueprint to create editable beat signal.",
            group: "Create",
            action: { kind: "blueprint", blueprintId },
            auditionCue: "Loop Pattern A and confirm drums, 808, chords, and Synth have audible signal.",
            nextCheck: "Return to Review Queue after the starter is editable and non-silent."
          };
        }
        return reviewMixFix(item, "headroom", "Headroom Mix Fix");
    }
  }

  if (item.id.startsWith("structure-")) {
    const signalId = item.id.replace("structure-", "");
    switch (signalId) {
      case "target":
        return arrangementTotalBars(project) < 8
          ? {
              itemId: item.id,
              fixId: "structure-chain",
              label: "8 Bar Chain",
              detail: "Use the existing 8 Bar Pattern Chain before expanding toward the target length.",
              group: "Arrange",
              action: { kind: "patternChain", chain: "eight_bar" },
              auditionCue: "Play Song loop and check whether the 8-bar outline is musical before expanding.",
              nextCheck: "Return to Structure Lens and target alignment after the outline is in place."
            }
          : {
              itemId: item.id,
              fixId: "structure-expand",
              label: "Chain Expand",
              detail: "Use the existing Chain Expand command to stretch the current outline into song form.",
              group: "Arrange",
              action: { kind: "chainExpand" },
              auditionCue: "Play Song loop and check intro, verse, hook, bridge, and outro flow.",
              nextCheck: "Return to Structure Lens and Song Form Overview after expansion."
            };
      case "sections":
        return {
          itemId: item.id,
          fixId: "sections-full",
          label: "Full Beat Template",
          detail: "Use the existing Full Beat Arrangement Template to add section coverage.",
          group: "Arrange",
          action: { kind: "arrangementTemplate", template: "full" },
          auditionCue: "Play Song loop and scan section order before editing block energy.",
          nextCheck: "Return to Song Form Overview and Arrangement Mute Map for section polish."
        };
      case "hook":
        return project.arrangement.some((block) => block.section === "Hook")
          ? {
              itemId: item.id,
              fixId: "hook-lift",
              label: "Hook Lift",
              detail: "Use the existing Hook Lift Arrangement Move on the selected block.",
              group: "Arrange",
              action: { kind: "arrangementMove", preset: "hook_lift" },
              auditionCue: "Loop the selected block and listen for hook energy contrast.",
              nextCheck: "Return to Hook Readiness and Structure Lens after the lift."
            }
          : {
              itemId: item.id,
              fixId: "hook-template",
              label: "Hook First Template",
              detail: "Use the existing Hook First Arrangement Template to create a clear hook section.",
              group: "Arrange",
              action: { kind: "arrangementTemplate", template: "hook_first" },
              auditionCue: "Play Song loop and confirm the Hook section is easy to locate.",
              nextCheck: "Return to Hook Readiness before adding another arrangement move."
            };
      case "arc":
        return {
          itemId: item.id,
          fixId: "arc-lift",
          label: "Hook Lift",
          detail: "Use the existing Hook Lift Arrangement Move to add energy contrast.",
          group: "Arrange",
          action: { kind: "arrangementMove", preset: "hook_lift" },
          auditionCue: "Play Song loop and listen for a clearer high-energy point.",
          nextCheck: "Return to Structure Lens after checking low/high energy spread."
        };
    }
  }

  if (item.id.startsWith("mix-")) {
    const mixId = item.id.replace("mix-", "");
    if (mixId === "headroom" || mixId === "limiter") {
      return reviewMixFix(item, "headroom", "Headroom Mix Fix");
    }
    if (mixId === "low-end") {
      return reviewMixFix(item, "low_end", "Low End Mix Fix");
    }
    return reviewMixFix(item, "stem_balance", "Stem Balance Mix Fix");
  }

  switch (item.focusTarget) {
    case "compose":
      return reviewLayerStarterFix(item, layerStarterId, "Layer Starter");
    case "arrange":
      return {
        itemId: item.id,
        fixId: "review-template",
        label: "Full Beat Template",
        detail: "Use the existing Full Beat Arrangement Template for the review issue.",
        group: "Arrange",
        action: { kind: "arrangementTemplate", template: "full" },
        auditionCue: "Play Song loop and check the arrangement issue after the template applies.",
        nextCheck: "Return to Review Queue before applying another arrangement fix."
      };
    case "mix":
      return reviewMixFix(item, "stem_balance", "Stem Balance Mix Fix");
    case "master":
      return reviewMixFix(item, "headroom", "Headroom Mix Fix");
    case "deliver":
      return {
        itemId: item.id,
        fixId: "deliver-brief",
        label: "Vocal Brief Starter",
        detail: "Use the existing Vocal Session Brief Starter for delivery context.",
        group: "Project",
        action: { kind: "sessionBriefStarter", pad: "vocal" },
        auditionCue: "Read the Handoff context against the current full song.",
        nextCheck: "Return to Handoff Package Check after the review issue changes."
      };
  }
}

export function reviewLayerStarterFix(item: ReviewQueueItem, starter: LayerStarterId, label: string): ReviewFixOption {
  return {
    itemId: item.id,
    fixId: `layer-${starter}`,
    label,
    detail: `Use the existing ${label} path on the selected Pattern.`,
    group: "Create",
    action: { kind: "layerStarter", starter },
    auditionCue: `Loop Pattern ${starter === "drums" ? "A/B/C" : "selected"} and confirm the new layer supports the beat.`,
    nextCheck: "Return to Review Queue and Pattern DNA before adding another layer."
  };
}

export function reviewMixFix(item: ReviewQueueItem, preset: MixFixPreset, label: string): ReviewFixOption {
  return {
    itemId: item.id,
    fixId: `mix-${preset}`,
    label,
    detail: `Use the existing ${label} for this review issue.`,
    group: "Mix",
    action: { kind: "mixFix", preset },
    auditionCue: "Play Full Mix and compare export headroom plus stem posture after the fix.",
    nextCheck: "Return to Mix Coach and Review Queue before applying another mix fix."
  };
}

export function createReviewFixResult(
  fix: ReviewFixOption,
  itemId: string,
  beforeProject: ProjectState,
  afterProject: ProjectState
): ReviewFixResult {
  const beforeSummary = createReviewQueueSummaryForProject(beforeProject);
  const afterSummary = createReviewQueueSummaryForProject(afterProject);
  const beforeItem = beforeSummary.items.find((item) => item.id === itemId) ?? null;
  const afterItem = afterSummary.items.find((item) => item.id === itemId) ?? null;
  const metrics: ReviewFixResultMetric[] = [
    createReviewFixResultMetric("item", beforeItem?.area ?? "Issue", reviewFixItemLabel(beforeItem), reviewFixItemLabel(afterItem)),
    createReviewFixResultMetric("queue", "Queue", beforeSummary.headline, afterSummary.headline),
    createReviewFixResultMetric("project", "Project", reviewFixProjectLabel(beforeProject), reviewFixProjectLabel(afterProject))
  ];
  const changedCount = metrics.filter((metric) => metric.tone === "good").length;
  const itemLabel = afterItem?.area ?? beforeItem?.area ?? "Review";

  return {
    fixId: fix.fixId,
    title: `${fix.label} Review Fix applied`,
    status: changedCount > 0 ? "Applied" : "Already covered",
    detail: `${itemLabel} / ${fix.detail}`,
    scope: reviewFixScopeLabel(fix),
    impact: `${changedCount}/${metrics.length} Review metrics changed`,
    metrics,
    auditionCue: fix.auditionCue,
    nextCheck: fix.nextCheck,
    tone: changedCount > 0 ? "good" : "warn"
  };
}

export function createReviewQueueSummaryForProject(project: ProjectState): ReviewQueueSummary {
  const analysis = analyzeExport(project);
  return createReviewQueueSummary(project, createBeatReadinessChecks(project, analysis), analysis, analyzeStemExports(project));
}

export function createReviewFixResultMetric(
  id: ReviewFixResultMetric["id"],
  label: string,
  before: string,
  after: string
): ReviewFixResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: before === after ? "warn" : "good"
  };
}

export function reviewFixItemLabel(item: ReviewQueueItem | null): string {
  return item ? `${item.status} / ${item.detail}` : "cleared";
}

export function reviewFixProjectLabel(project: ProjectState): string {
  const analysis = analyzeExport(project);
  return `${barCountLabel(arrangementTotalBars(project))} / ${analysis.status} / ${activeDeliveryTarget(project).name}`;
}

export function reviewFixScopeLabel(fix: ReviewFixOption): string {
  switch (fix.action.kind) {
    case "blueprint":
      return "Beat Blueprint / Current Style";
    case "layerStarter":
      return `Layer Starter / ${fix.action.starter}`;
    case "patternChain":
      return `Arrangement / ${patternChainLabel(fix.action.chain)}`;
    case "chainExpand":
      return "Arrangement / Chain Expand";
    case "arrangementTemplate":
      return `Arrangement Template / ${arrangementTemplateLabel(fix.action.template)}`;
    case "arrangementMove":
      return `Arrangement Move / ${arrangementMovePresetLabel(fix.action.preset)}`;
    case "deliveryTarget":
      return "Delivery Target / Align";
    case "mixFix":
      return `Mix Fix / ${mixFixPresetLabel(fix.action.preset)}`;
    case "masterFinish":
      return "Master Finish / Target";
    case "sessionBriefStarter":
      return "Session Brief / Vocal";
  }
}

export function reviewToneRank(tone: MixCoachTone): number {
  switch (tone) {
    case "danger":
      return 0;
    case "warn":
      return 1;
    case "good":
      return 2;
  }
}

export function createHandoffPackItems({
  analysis,
  project,
  stemAnalyses,
  onExportHandoffSheet,
  onExportDeliveryBundle,
  onExportMidi,
  onExportStems,
  onExportWav
}: {
  analysis: ExportAnalysis;
  project: ProjectState;
  stemAnalyses: StemExportAnalyses;
  onExportHandoffSheet: () => void;
  onExportDeliveryBundle?: () => void;
  onExportMidi: () => void;
  onExportStems: () => void;
  onExportWav: () => void;
}): HandoffPackItem[] {
  const bars = arrangementTotalBars(project);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const target = activeDeliveryTarget(project);
  const briefFields = sessionBriefFilledFields(project.sessionBrief);
  const exportTone: MixCoachTone = analysis.status === "Ready" ? "good" : analysis.status === "Silent" ? "danger" : "warn";
  const stemTone: MixCoachTone =
    audibleStems.length === stemTrackIds.length ? "good" : audibleStems.length >= Math.min(2, stemTrackIds.length) ? "warn" : "danger";
  const midiTone: MixCoachTone = bars >= 8 ? "good" : bars >= 4 ? "warn" : "danger";
  const sheetTone: MixCoachTone = briefFields >= 2 ? "good" : briefFields >= 1 ? "warn" : "danger";
  const bundleTone = weakestTone([exportTone, stemTone, midiTone, sheetTone]);
  const audibleStemLabel = audibleStems.length > 0 ? audibleStems.map(stemTrackLabel).join("/") : "No audible stems";

  return [
    {
      id: "wav",
      label: "Mix WAV",
      value: analysis.status,
      detail: `${barCountLabel(bars)} / ${formatDb(analysis.peakDb)} peak`,
      tone: exportTone,
      buttonLabel: "WAV",
      run: onExportWav
    },
    {
      id: "stems",
      label: "Stem WAVs",
      value: `${audibleStems.length}/${stemTrackIds.length}`,
      detail: audibleStemLabel,
      tone: stemTone,
      buttonLabel: "Stems",
      run: onExportStems
    },
    {
      id: "midi",
      label: "Arrangement MIDI",
      value: barCountLabel(bars),
      detail: `Pattern ${usedPatternSlots(project).join("/") || project.selectedPattern} handoff`,
      tone: midiTone,
      buttonLabel: "MIDI",
      run: onExportMidi
    },
    {
      id: "sheet",
      label: "Handoff Sheet",
      value: `${briefFields}/4 brief`,
      detail: `${target.name} / ${handoffSheetFileName(project)}`,
      tone: sheetTone,
      buttonLabel: "Sheet",
      run: onExportHandoffSheet
    },
    {
      id: "bundle",
      label: "Delivery Bundle",
      value: bundleTone === "good" ? "Ready" : bundleTone === "warn" ? "Review" : "Blocked",
      detail: `${deliveryBundleZipFileName(project)} / project, mix, stems, MIDI, sheet, manifest`,
      tone: bundleTone,
      buttonLabel: "Bundle",
      run: onExportDeliveryBundle ?? (() => undefined)
    }
  ];
}

export function createHandoffPackRouteSummary(
  project: ProjectState,
  stemAnalyses: StemExportAnalyses,
  items: HandoffPackItem[],
  tone: MixCoachTone
): HandoffPackRouteSummary {
  const target = activeDeliveryTarget(project);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const briefFields = sessionBriefFilledFields(project.sessionBrief);
  const readyCount = items.filter((item) => item.tone === "good").length;
  const openItems = items.filter((item) => item.tone !== "good").map((item) => item.label);
  const openTitle = openItems.length === 0 ? "all deliverables clear" : `review ${openItems.join("/")}`;

  return {
    routeLabel: `${target.name} handoff`,
    statusLabel: `${readyCount}/${items.length} ready`,
    detailLabel: `${audibleStems.length}/${target.stemGoal} stems / ${briefFields}/4 brief`,
    fileLabel: handoffSheetFileName(project),
    detailTitle: `${target.name} handoff / ${readyCount}/${items.length} ready / ${audibleStems.length}/${target.stemGoal} target stems / ${briefStatus.detail} / ${openTitle} / ${handoffSheetFileName(project)}`,
    tone
  };
}

export function createHandoffPackSendOrderSummary(
  project: ProjectState,
  items: HandoffPackItem[]
): HandoffPackSendOrderSummary {
  const target = activeDeliveryTarget(project);
  const orderedItems = handoffPackSendOrder(items);
  const nextItem = orderedItems.find((item) => item.tone !== "good") ?? null;
  const sequenceLabel = orderedItems.map((item, index) => `${index + 1} ${item.buttonLabel}`).join(" -> ");

  if (!nextItem) {
    const detailLabel = `${target.name} package is ready for explicit exports`;
    return {
      nextItemId: null,
      statusLabel: "Send order clear",
      nextLabel: "All deliverables ready",
      detailLabel,
      sequenceLabel,
      detailTitle: `Send order clear / ${detailLabel} / ${sequenceLabel}`,
      tone: "good"
    };
  }

  const statusLabel = nextItem.tone === "danger" ? "Send blocker" : "Next send step";
  const detailLabel = `${nextItem.label}: ${nextItem.value} / ${nextItem.detail}`;

  return {
    nextItemId: nextItem.id,
    statusLabel,
    nextLabel: `Next: ${nextItem.buttonLabel}`,
    detailLabel,
    sequenceLabel,
    detailTitle: `${statusLabel} / ${nextItem.label}: ${nextItem.value} / ${nextItem.detail} / ${sequenceLabel}`,
    tone: nextItem.tone
  };
}

export function handoffPackSendOrder(items: HandoffPackItem[]): HandoffPackItem[] {
  const order: HandoffPackItem["id"][] = ["wav", "stems", "midi", "sheet", "bundle"];
  return order.flatMap((id) => {
    const item = items.find((candidate) => candidate.id === id);
    return item ? [item] : [];
  });
}

export function createHandoffExportReceipt({
  itemId,
  statusLabel,
  fileLabel,
  detailLabel,
  nextLabel,
  tone
}: Omit<HandoffExportReceipt, "detailTitle">): HandoffExportReceipt {
  return {
    itemId,
    statusLabel,
    fileLabel,
    detailLabel,
    nextLabel,
    detailTitle: `${statusLabel} / ${fileLabel} / ${detailLabel} / ${nextLabel}`,
    tone
  };
}

export function emptyHandoffExportReceipt(): HandoffExportReceipt {
  return createHandoffExportReceipt({
    itemId: null,
    statusLabel: "No export receipt",
    fileLabel: "Run a deliverable",
    detailLabel: "Latest explicit WAV, Stems, MIDI, Sheet, or Bundle result appears here",
    nextLabel: "This readout does not create files",
    tone: "warn"
  });
}

export function createHandoffFileManifest(
  project: ProjectState,
  stemAnalyses: StemExportAnalyses,
  items: HandoffPackItem[]
): HandoffFileManifestItem[] {
  const itemTone = (id: HandoffPackItem["id"]): MixCoachTone => items.find((item) => item.id === id)?.tone ?? "warn";
  const stemFiles = stemWavFileNames(project);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const briefFields = sessionBriefFilledFields(project.sessionBrief);

  return [
    {
      id: "wav",
      label: "Mix WAV",
      fileLabel: mixWavFileName(project),
      detail: `${barCountLabel(arrangementTotalBars(project))} full mix`,
      tone: itemTone("wav")
    },
    {
      id: "stems",
      label: "Stem WAVs",
      fileLabel: stemFiles.join(" / "),
      detail: `${audibleStems.length}/${stemTrackIds.length} audible stems`,
      tone: itemTone("stems")
    },
    {
      id: "midi",
      label: "Arrangement MIDI",
      fileLabel: midiFileName(project),
      detail: `${barCountLabel(arrangementTotalBars(project))} arrangement`,
      tone: itemTone("midi")
    },
    {
      id: "sheet",
      label: "Handoff Sheet",
      fileLabel: handoffSheetFileName(project),
      detail: `${briefFields}/4 brief fields`,
      tone: itemTone("sheet")
    },
    {
      id: "bundle",
      label: "Delivery Bundle",
      fileLabel: deliveryBundleZipFileName(project),
      detail: "Project, mix, stems, MIDI, Handoff Sheet, and manifest ZIP",
      tone: itemTone("bundle")
    }
  ];
}

export function createHandoffManifestAudit(
  project: ProjectState,
  items: HandoffPackItem[],
  manifest: HandoffFileManifestItem[],
  receipt: HandoffExportReceipt,
  sendOrder: HandoffPackSendOrderSummary
): HandoffManifestAuditSummary {
  const target = activeDeliveryTarget(project);
  const readyCount = items.filter((item) => item.tone === "good").length;
  const plannedCount = manifest.length;
  const receiptTone: MixCoachTone = receipt.itemId ? receipt.tone : "warn";
  const tone = weakestTone([...items.map((item) => item.tone), receiptTone]);
  const checks = manifest.map((manifestItem) =>
    createHandoffManifestAuditCheck(manifestItem, items.find((item) => item.id === manifestItem.id), receipt)
  );
  const statusLabel = tone === "good" ? "Manifest clear" : tone === "warn" ? "Manifest review" : "Manifest blocker";
  const titleLabel = `${target.name} package audit`;
  const detailLabel = `${readyCount}/${items.length} ready / ${plannedCount} planned file sets`;
  const receiptLabel = receipt.itemId ? `Latest: ${receipt.statusLabel}` : "Latest: no export receipt";
  const nextLabel = receipt.itemId ? sendOrder.nextLabel : "Run WAV export first";

  return {
    statusLabel,
    titleLabel,
    detailLabel,
    receiptLabel,
    nextLabel,
    detailTitle: `${statusLabel} / ${titleLabel} / ${detailLabel} / ${receipt.fileLabel} / ${nextLabel}`,
    tone,
    checks
  };
}

export function createHandoffExportFormatSummary(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses,
  items: HandoffPackItem[]
): HandoffExportFormatSummary {
  const bars = arrangementTotalBars(project);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const stemFiles = stemWavFileNames(project);
  const target = activeDeliveryTarget(project);
  const briefFields = sessionBriefFilledFields(project.sessionBrief);
  const formatLabel = `${sampleRateLabel(analysis.sampleRate)} ${channelCountLabel(analysis.channels)} WAV`;
  const durationLabel = `${formatExportDuration(analysis.durationSeconds)} / ${barCountLabel(bars)}`;
  const exportTone = analysis.status === "Silent" ? "danger" : analysis.status === "Ready" ? "good" : "warn";
  const stemTone = audibleStems.length === stemTrackIds.length ? "good" : audibleStems.length > 0 ? "warn" : "danger";
  const midiTone: MixCoachTone = bars >= 8 ? "good" : bars >= 4 ? "warn" : "danger";
  const sheetTone: MixCoachTone = briefFields >= 2 ? "good" : briefFields >= 1 ? "warn" : "danger";
  const bundleTone = weakestTone([exportTone, stemTone, midiTone, sheetTone]);
  const tone = weakestTone([exportTone, stemTone, midiTone, sheetTone, bundleTone, ...items.map((item) => item.tone)]);
  const statusLabel = tone === "good" ? "Format ready" : tone === "warn" ? "Format review" : "Format blocker";
  const stemDetail = audibleStems.length > 0 ? audibleStems.map(stemTrackLabel).join("/") : "No audible stems";

  return {
    statusLabel,
    titleLabel: formatLabel,
    detailLabel: `${mixWavFileName(project)} / ${stemFiles.length} stems / ${midiFileName(project)} / ${deliveryBundleZipFileName(project)}`,
    durationLabel,
    detailTitle: `${statusLabel} / ${formatLabel} / ${durationLabel} / ${mixWavFileName(project)} / ${stemFiles.length} stem WAVs / ${midiFileName(project)} / ${handoffSheetFileName(project)} / ${deliveryBundleZipFileName(project)}`,
    tone,
    metrics: [
      {
        id: "wav",
        label: "Mix WAV",
        value: analysis.status,
        detail: `${formatLabel} / ${mixWavFileName(project)}`,
        tone: exportTone
      },
      {
        id: "stems",
        label: "Stem WAVs",
        value: `${audibleStems.length}/${stemTrackIds.length} audible`,
        detail: `${stemFiles.length} files / ${stemDetail}`,
        tone: stemTone
      },
      {
        id: "midi",
        label: "MIDI",
        value: barCountLabel(bars),
        detail: midiFileName(project),
        tone: midiTone
      },
      {
        id: "sheet",
        label: "Sheet",
        value: `${briefFields}/4 brief`,
        detail: `${target.name} / ${handoffSheetFileName(project)}`,
        tone: sheetTone
      },
      {
        id: "bundle",
        label: "Bundle",
        value: bundleTone === "good" ? "Ready" : bundleTone === "warn" ? "Review" : "Blocked",
        detail: `${deliveryBundleZipFileName(project)} / project, mix, stems, MIDI, sheet, manifest`,
        tone: bundleTone
      }
    ]
  };
}

export function createHandoffExportFormatFocusResult(
  metric: HandoffExportFormatMetric,
  summary: HandoffExportFormatSummary
): HandoffExportFormatFocusResult {
  return {
    metricId: metric.id,
    status: "Focused",
    title: `${metric.label} format focused`,
    detail: metric.detail,
    destination: "Deliver / Handoff Pack",
    metricLabel: "Format",
    metricValue: `${metric.value} / ${summary.durationLabel}`,
    auditionCue: handoffExportFormatFocusAudition(metric),
    nextCheck: handoffExportFormatFocusNextCheck(metric),
    tone: metric.tone
  };
}

export function handoffExportFormatFocusAudition(metric: HandoffExportFormatMetric): string {
  switch (metric.id) {
    case "wav":
      return "Play Full Mix and compare the Export Meter before creating the mix WAV.";
    case "stems":
      return "Use Stem Audition to confirm Drums, 808, Synth, and Chords are audible before stem export.";
    case "midi":
      return "Scan Arrangement and Pattern A/B/C assignments so the MIDI reflects the intended song form.";
    case "sheet":
      return "Review Session Brief and Delivery Target so the Handoff Sheet carries useful context.";
    case "bundle":
      return "Confirm mix, stems, MIDI, and sheet posture before creating the single transfer ZIP.";
  }
}

export function handoffExportFormatFocusNextCheck(metric: HandoffExportFormatMetric): string {
  switch (metric.id) {
    case "wav":
      return "Run WAV export explicitly only after mix, master, and format posture are ready.";
    case "stems":
      return "Run stem export after each expected stem is audible or intentionally quiet.";
    case "midi":
      return "Run MIDI export when arrangement length and Pattern assignments match the handoff.";
    case "sheet":
      return "Fill missing brief fields before exporting the Handoff Sheet.";
    case "bundle":
      return "Run bundle export after the planned deliverables are ready or intentionally reviewed.";
  }
}

export function sampleRateLabel(sampleRate: number): string {
  return sampleRate % 1000 === 0 ? `${sampleRate / 1000} kHz` : `${(sampleRate / 1000).toFixed(1)} kHz`;
}

export function channelCountLabel(channels: number): string {
  return channels === 1 ? "mono" : channels === 2 ? "stereo" : `${channels}ch`;
}

export function formatExportDuration(durationSeconds: number): string {
  const boundedSeconds = Math.max(0, Math.round(durationSeconds));
  const minutes = Math.floor(boundedSeconds / 60);
  const seconds = boundedSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function createHandoffManifestAuditCheck(
  manifestItem: HandoffFileManifestItem,
  item: HandoffPackItem | undefined,
  receipt: HandoffExportReceipt
): HandoffManifestAuditCheck {
  const latestReceiptMatches = receipt.itemId === manifestItem.id;
  const tone = latestReceiptMatches ? weakestTone([manifestItem.tone, receipt.tone]) : manifestItem.tone;
  const planStatus =
    manifestItem.tone === "good" ? "Ready plan" : manifestItem.tone === "warn" ? "Review plan" : "Blocked plan";

  return {
    id: manifestItem.id,
    label: manifestItem.label,
    statusLabel: latestReceiptMatches ? receipt.statusLabel : planStatus,
    fileLabel: manifestItem.fileLabel,
    detailLabel: latestReceiptMatches ? receipt.detailLabel : item?.detail ?? manifestItem.detail,
    tone
  };
}

export function createHandoffPackageCheckSummary(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses,
  exportReceipt: HandoffExportReceipt | null
): HandoffPackageCheckSummary {
  const noopExport = (): void => undefined;
  const items = createHandoffPackItems({
    analysis,
    project,
    stemAnalyses,
    onExportHandoffSheet: noopExport,
    onExportMidi: noopExport,
    onExportStems: noopExport,
    onExportWav: noopExport
  });
  const sendOrder = createHandoffPackSendOrderSummary(project, items);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const manifest = createHandoffFileManifest(project, stemAnalyses, items);
  const target = activeDeliveryTarget(project);
  const readyCount = items.filter((item) => item.tone === "good").length;
  const stemFiles = stemWavFileNames(project);
  const plannedFileCount = 1 + stemFiles.length + 1 + 1 + 1;
  const briefFields = sessionBriefFilledFields(project.sessionBrief);
  const receiptTone: MixCoachTone = receipt.itemId ? receipt.tone : "warn";
  const filesTone = weakestTone(items.map((item) => item.tone));
  const contextTone: MixCoachTone = briefFields >= 2 ? "good" : briefFields >= 1 ? "warn" : "danger";
  const cards: HandoffPackageCheckCard[] = [
    {
      id: "files",
      focusId: "files",
      label: "File Set",
      value: `${plannedFileCount} files`,
      status: filesTone === "good" ? "File set ready" : filesTone === "warn" ? "File set needs review" : "File set blocked",
      detail: `${readyCount}/${items.length} deliverables / ${manifest.length} file groups`,
      focusTarget: "deliver",
      focusLabel: "Deliver",
      tone: filesTone
    },
    {
      id: "order",
      focusId: "order",
      label: "Export Order",
      value: sendOrder.nextItemId ? sendOrder.nextLabel : "Clear",
      status:
        sendOrder.tone === "good" ? "Order clear" : sendOrder.tone === "warn" ? "Order needs review" : "Order blocked",
      detail: sendOrder.sequenceLabel,
      focusTarget: "deliver",
      focusLabel: "Deliver",
      tone: sendOrder.tone
    },
    {
      id: "receipt",
      focusId: "receipt",
      label: "Latest Export",
      value: receipt.itemId ? receipt.statusLabel : "None",
      status: receipt.itemId ? receipt.statusLabel : "No receipt yet",
      detail: `${receipt.fileLabel} / ${receipt.nextLabel}`,
      focusTarget: "deliver",
      focusLabel: "Deliver",
      tone: receiptTone
    },
    {
      id: "context",
      focusId: "context",
      label: "Session Context",
      value: `${briefFields}/4 brief`,
      status:
        contextTone === "good" ? "Context ready" : contextTone === "warn" ? "Context partial" : "Context missing",
      detail: `${target.name} / ${handoffSheetFileName(project)}`,
      focusTarget: "deliver",
      focusLabel: "Deliver",
      tone: contextTone
    }
  ];
  const tone = weakestTone(cards.map((card) => card.tone));
  const headline =
    tone === "good" ? "Package ready to send" : tone === "warn" ? "Package needs review" : "Package blocked";
  const detail = `${readyCount}/${items.length} deliverables / ${plannedFileCount} planned files / ${target.name}`;

  return {
    headline,
    detail,
    tone,
    cards
  };
}

export function createHandoffPackageCheckFocusSummary(
  summary: HandoffPackageCheckSummary,
  focusedCardId: HandoffPackageCheckFocusId | null
): HandoffPackageCheckFocusSummary {
  const focusedCard = focusedCardId ? summary.cards.find((card) => card.id === focusedCardId) ?? null : null;
  const card = focusedCard ?? activeHandoffPackageCheckQuickActionCard(summary);

  if (!card) {
    return {
      focusId: null,
      statusLabel: "Package clear",
      areaLabel: "No package focus",
      detailLabel: "No Handoff Package Check cards available",
      detailTitle: "Handoff Package Check has no cards to focus.",
      tone: "warn"
    };
  }

  const statusLabel = focusedCard ? "Focused Package" : "Package Focus";
  const detailLabel = `${card.focusLabel} panel / ${card.detail}`;

  return {
    focusId: card.focusId,
    statusLabel,
    areaLabel: `${card.label}: ${card.value}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${card.label}: ${card.value} / ${detailLabel}`,
    tone: card.tone
  };
}

export function createHandoffPackageCheckFocusResult(
  card: HandoffPackageCheckCard,
  summary: HandoffPackageCheckSummary
): HandoffPackageCheckFocusResult {
  const summaryCard = summary.cards.find((item) => item.focusId === card.focusId) ?? null;

  return {
    cardId: card.focusId,
    status: "Focused",
    title: `${card.label} package focused`,
    detail: `${card.value}: ${card.detail}`,
    destination: `${card.focusLabel} panel`,
    metricLabel: "Package",
    metricValue: handoffPackageCheckFocusResultMetric(summary),
    auditionCue: handoffPackageCheckFocusResultAudition(card),
    nextCheck: handoffPackageCheckFocusResultNextCheck(card),
    tone: summaryCard?.tone ?? "warn"
  };
}

export function handoffPackageCheckFocusResultMetric(summary: HandoffPackageCheckSummary): string {
  const readyCount = summary.cards.filter((card) => card.tone === "good").length;
  const reviewCount = summary.cards.filter((card) => card.tone === "warn").length;
  const blockerCount = summary.cards.filter((card) => card.tone === "danger").length;

  return `${readyCount}/${summary.cards.length} package checks clear / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function handoffPackageCheckFocusResultAudition(card: HandoffPackageCheckCard): string {
  switch (card.focusId) {
    case "files":
      return "Inspect WAV, stems, MIDI, Handoff Sheet, and bundle statuses before sending files.";
    case "order":
      return "Follow Send Order from the next deliverable before rerunning exports.";
    case "receipt":
      return "Check the latest Export Receipt before assuming a deliverable is ready to send.";
    case "context":
      return "Read Session Brief and Handoff Sheet context before sending to a vocalist or collaborator.";
  }
}

export function handoffPackageCheckFocusResultNextCheck(card: HandoffPackageCheckCard): string {
  switch (card.focusId) {
    case "files":
      return "Return after each planned deliverable is exported or intentionally deferred.";
    case "order":
      return "Return after the current next deliverable is exported and receipt status updates.";
    case "receipt":
      return "Return after the latest receipt matches the deliverable you intend to send.";
    case "context":
      return "Return after Session Brief fields carry enough artist, vibe, reference, and notes context.";
  }
}

export function activeHandoffPackageCheckQuickActionCard(summary: HandoffPackageCheckSummary): HandoffPackageCheckCard | null {
  return summary.cards.find((card) => card.tone === "danger") ?? summary.cards.find((card) => card.tone === "warn") ?? summary.cards[0] ?? null;
}

export function handoffExportFormatFocusMetric(summary: HandoffExportFormatSummary): HandoffExportFormatMetric | null {
  return summary.metrics.find((metric) => metric.tone === "danger") ?? summary.metrics.find((metric) => metric.tone === "warn") ?? summary.metrics[0] ?? null;
}

export function createKeyCompassSummary(
  project: ProjectState,
  selectedNote: SelectedNote | null,
  selectedChord: ChordEvent | undefined,
  selectedDrumStep: SelectedDrumStep | null
): KeyCompassSummary {
  const pattern = activePattern(project);
  const scaleNotes = scalePitchNames(project.key);
  const chordRoots = pattern.chordEvents.map((chord) => chord.root);
  const chordRootWarnings = chordRoots.filter((root) => keyCompassScaleDegree(project.key, root) === null).length;
  const bassWarnings = pattern.bassNotes.filter((note) => !keyCompassPitchInKey(project.key, note.pitch)).length;
  const melodyWarnings = pattern.melodyNotes.filter((note) => !keyCompassPitchInKey(project.key, note.pitch)).length;
  const chordTone: MixCoachTone =
    pattern.chordEvents.length === 0 ? "danger" : chordRootWarnings > 0 ? "warn" : pattern.chordEvents.length >= 3 ? "good" : "warn";
  const bassTone: MixCoachTone =
    pattern.bassNotes.length === 0 ? "danger" : bassWarnings > 0 ? "warn" : pattern.bassNotes.length >= 4 ? "good" : "warn";
  const melodyTone: MixCoachTone =
    pattern.melodyNotes.length === 0 ? "danger" : melodyWarnings > 0 ? "warn" : pattern.melodyNotes.length >= 4 ? "good" : "warn";
  const cadence = keyCompassCadence(project.key, pattern.chordEvents);
  const focusCard = keyCompassFocusCard(project, selectedNote, selectedChord, selectedDrumStep);
  const cards: KeyCompassCard[] = [
    {
      id: "scale",
      focusId: "scale",
      label: "Scale",
      value: scaleNotes.join(" "),
      detail: `${scaleNotes.length} safe notes for Pattern ${project.selectedPattern}`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: "good"
    },
    {
      id: "chords",
      focusId: "chords",
      label: "Chords",
      value: keyCompassChordMotion(project.key, pattern.chordEvents),
      detail:
        chordRootWarnings > 0
          ? `${chordRootWarnings} root outside scale`
          : `${pattern.chordEvents.length} chord events in Pattern ${project.selectedPattern}`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: chordTone
    },
    {
      id: "cadence",
      focusId: "cadence",
      label: "Cadence",
      value: cadence.value,
      detail: cadence.detail,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: cadence.tone
    },
    {
      id: "bass",
      focusId: "bass",
      label: "808/Bass",
      value: keyCompassPitchSpread(pattern.bassNotes.map((note) => note.pitch)),
      detail:
        bassWarnings > 0
          ? `${bassWarnings} bass notes outside scale`
          : `${pattern.bassNotes.length} notes / ${keyCompassStepSpread(pattern.bassNotes.map((note) => note.step))}`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: bassTone
    },
    {
      id: "melody",
      focusId: "melody",
      label: "Melody",
      value: keyCompassPitchSpread(pattern.melodyNotes.map((note) => note.pitch)),
      detail:
        melodyWarnings > 0
          ? `${melodyWarnings} melody notes outside scale`
          : `${pattern.melodyNotes.length} notes / ${keyCompassStepSpread(pattern.melodyNotes.map((note) => note.step))}`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: melodyTone
    },
    focusCard
  ];

  return {
    headline: `${project.key} / Pattern ${project.selectedPattern} compass`,
    detail: `${scaleNotes.join(" ")} / ${pattern.chordEvents.length} chords / ${pattern.bassNotes.length} 808 / ${pattern.melodyNotes.length} synth`,
    tone: weakestTone(cards.map((card) => card.tone)),
    scaleNotes,
    cards
  };
}

export function keyCompassCadence(key: string, chords: ChordEvent[]): { value: string; detail: string; tone: MixCoachTone } {
  if (chords.length === 0) {
    return {
      value: "No cadence",
      detail: "Add chords before judging harmonic resolution",
      tone: "danger"
    };
  }

  const ordered = [...chords].sort((first, second) => first.step - second.step);
  const degrees = ordered.map((chord) => keyCompassScaleDegree(key, chord.root));
  const inKeyDegrees = degrees.filter((degree): degree is number => degree !== null);
  const outsideCount = degrees.length - inKeyDegrees.length;
  const uniqueDegrees = new Set(inKeyDegrees);
  const lastDegree = degrees[degrees.length - 1] ?? null;
  const hasHome = inKeyDegrees.includes(0);
  const hasTension = inKeyDegrees.some((degree) => degree === 4 || degree === 6);

  if (outsideCount > 0) {
    return {
      value: "Outside pull",
      detail: `${outsideCount} chord root${outsideCount === 1 ? "" : "s"} outside ${key}`,
      tone: "warn"
    };
  }
  if (chords.length < 2 || uniqueDegrees.size < 2) {
    return {
      value: "Thin cadence",
      detail: `${chords.length} chord event${chords.length === 1 ? "" : "s"} / ${uniqueDegrees.size} degree${uniqueDegrees.size === 1 ? "" : "s"}`,
      tone: "warn"
    };
  }
  if (lastDegree === 0 && hasTension) {
    return {
      value: "Resolving home",
      detail: `${romanDegreeLabel(lastDegree)} ending after tension`,
      tone: "good"
    };
  }
  if (hasTension && !hasHome) {
    return {
      value: "Tension held",
      detail: "Add or land on the home chord if the loop needs release",
      tone: "warn"
    };
  }
  return {
    value: hasHome ? "Home anchored" : "Motion clear",
    detail: `${uniqueDegrees.size} chord degrees / ends ${lastDegree === null ? "outside" : romanDegreeLabel(lastDegree)}`,
    tone: "good"
  };
}

export function romanDegreeLabel(degree: number): string {
  return ["I", "II", "III", "IV", "V", "VI", "VII"][degree] ?? `${degree + 1}`;
}

export function createKeyCompassFocusSummary(summary: KeyCompassSummary, focusedCardId: KeyCompassFocusId | null): KeyCompassFocusSummary {
  const focusedCard = focusedCardId ? summary.cards.find((card) => card.focusId === focusedCardId) ?? null : null;
  const card = focusedCard ?? activeKeyCompassQuickActionItem(summary);

  if (!card) {
    return {
      focusId: null,
      statusLabel: "Key clear",
      areaLabel: "No key focus",
      detailLabel: "No Key Compass cards available",
      detailTitle: "Key Compass has no focusable cards.",
      tone: "warn"
    };
  }

  const statusLabel = focusedCard ? "Focused Key" : keyCompassFocusStatusLabel(card.tone);
  const detailLabel = `${card.focusLabel} panel / ${card.detail}`;

  return {
    focusId: card.focusId,
    statusLabel,
    areaLabel: `${card.label}: ${card.value}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${card.label}: ${card.value} / ${detailLabel}`,
    tone: card.tone
  };
}

export function keyCompassFocusStatusLabel(tone: MixCoachTone): string {
  if (tone === "danger") {
    return "Key blocker";
  }

  if (tone === "warn") {
    return "Key review";
  }

  return "Key ready";
}

export function createKeyCompassFocusResult(item: KeyCompassFocusItem, summary: KeyCompassSummary): KeyCompassFocusResult {
  const cardTone = summary.cards.find((card) => card.focusId === item.focusId)?.tone ?? summary.tone;

  return {
    focusId: item.focusId,
    status: "Focused",
    title: `${item.label} key lane focused`,
    detail: `${item.focusLabel}: ${item.value}`,
    metricLabel: "Key",
    metricValue: keyCompassFocusResultMetric(summary),
    auditionCue: keyCompassFocusResultAudition(item),
    nextCheck: keyCompassFocusResultNextCheck(item),
    tone: cardTone
  };
}

export function keyCompassFocusResultMetric(summary: KeyCompassSummary): string {
  const readyCount = summary.cards.filter((card) => card.tone === "good").length;
  const reviewCount = summary.cards.filter((card) => card.tone === "warn").length;
  const blockerCount = summary.cards.filter((card) => card.tone === "danger").length;

  return `${summary.headline} / ${readyCount}/${summary.cards.length} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function keyCompassFocusResultAudition(item: KeyCompassFocusItem): string {
  switch (item.focusId) {
    case "scale":
      return "Use the scale notes before retargeting or editing pitch.";
    case "chords":
      return "Check chord roots, chord motion, and selected-chord controls before harmonic edits.";
    case "cadence":
      return "Loop the selected Pattern and listen for tension, release, and home resolution.";
    case "bass":
      return "Check 808/bass notes against the key before pitch, glide, or contour edits.";
    case "melody":
      return "Check melody notes against the key before motif, contour, or accent edits.";
    case "focus":
      return "Inspect the selected note or chord degree before editing pitch, root, quality, or inversion.";
    default:
      return `Review ${item.focusLabel.toLowerCase()} before changing harmony.`;
  }
}

export function keyCompassFocusResultNextCheck(item: KeyCompassFocusItem): string {
  switch (item.focusId) {
    case "scale":
      return "Return after the intended key center and safe-note set are clear.";
    case "chords":
      return "Return after chord roots and motion fit the selected key or the outside pull is intentional.";
    case "cadence":
      return "Return after the loop has enough home, tension, or intentional ambiguity.";
    case "bass":
      return "Return after the low end supports the drum pocket and selected key.";
    case "melody":
      return "Return after the hook or motif stays in key or deliberately steps outside.";
    case "focus":
      return "Return after the selected note or chord has a clear scale role.";
    default:
      return `Return after ${item.focusLabel.toLowerCase()} has a clear harmonic role.`;
  }
}

export function createGrooveCompassSummary(project: ProjectState, selectedDrumStep: SelectedDrumStep | null): GrooveCompassSummary {
  const pattern = activePattern(project);
  const lanes = Object.keys(drumLabels) as DrumLane[];
  const laneHits = lanes.reduce<Record<DrumLane, number>>(
    (counts, lane) => ({
      ...counts,
      [lane]: pattern.drumPattern[lane].filter(Boolean).length
    }),
    { kick: 0, clap: 0, hat: 0, perc: 0 }
  );
  const activeSteps = new Set<number>();
  const activeTimings: number[] = [];
  const activeChances: number[] = [];
  const activeVelocities: number[] = [];

  lanes.forEach((lane) => {
    pattern.drumPattern[lane].forEach((enabled, step) => {
      if (!enabled) {
        return;
      }
      activeSteps.add(step);
      activeTimings.push(drumStepTimingMs(pattern, lane, step));
      activeChances.push(drumStepProbability(pattern, lane, step));
      activeVelocities.push(drumStepVelocity(pattern, lane, step));
    });
  });

  const totalHits = drumHitCount(pattern);
  const repeatedHatHits = pattern.drumPattern.hat.reduce(
    (total, enabled, step) => total + (enabled ? hatRepeatCount(pattern, step) - 1 : 0),
    0
  );
  const timingSpread =
    activeTimings.length > 0 ? Math.max(...activeTimings) - Math.min(...activeTimings) : 0;
  const shiftedHits = activeTimings.filter((timing) => timing !== 0).length;
  const earlyHits = activeTimings.filter((timing) => timing < 0).length;
  const lateHits = activeTimings.filter((timing) => timing > 0).length;
  const velocitySpread =
    activeVelocities.length > 0 ? Math.max(...activeVelocities) - Math.min(...activeVelocities) : 0;
  const chanceAverage =
    activeChances.length > 0 ? activeChances.reduce((total, chance) => total + chance, 0) / activeChances.length : 1;
  const chanceFloor = activeChances.length > 0 ? Math.min(...activeChances) : 1;
  const hasDrums = totalHits > 0;
  const densityTone: MixCoachTone = totalHits >= 20 ? "good" : totalHits >= 10 ? "warn" : "danger";
  const anchorTone: MixCoachTone =
    laneHits.kick > 0 && laneHits.clap > 0 ? "good" : laneHits.kick > 0 || laneHits.clap > 0 ? "warn" : "danger";
  const hatTone: MixCoachTone =
    laneHits.hat >= 6 && repeatedHatHits >= 2 ? "good" : laneHits.hat >= 4 || repeatedHatHits > 0 ? "warn" : "danger";
  const timingTone: MixCoachTone =
    !hasDrums || activeTimings.length === 0 ? "danger" : shiftedHits >= 3 && timingSpread >= 8 ? "good" : shiftedHits > 0 ? "warn" : "good";
  const chanceTone: MixCoachTone = !hasDrums ? "danger" : chanceFloor < 0.88 ? "good" : chanceAverage < 0.98 ? "warn" : "good";
  const pocketIsBalanced = shiftedHits >= 2 && Math.abs(earlyHits - lateHits) <= 1;
  const pocketHasMotion = velocitySpread >= 0.18;
  const pocketValue = !hasDrums
    ? "No pocket"
    : shiftedHits === 0 && velocitySpread < 0.12
      ? "Grid-flat"
      : pocketIsBalanced
        ? "Balanced"
        : earlyHits > lateHits
          ? "Early lean"
          : lateHits > earlyHits
            ? "Late lean"
            : pocketHasMotion
              ? "Velocity motion"
              : "Needs shape";
  const pocketTone: MixCoachTone = !hasDrums
    ? "danger"
    : pocketValue === "Grid-flat" || pocketValue === "Needs shape"
      ? "warn"
      : "good";
  const focusCard = grooveCompassFocusCard(pattern, project.selectedPattern, selectedDrumStep);
  const cards: GrooveCompassCard[] = [
    {
      id: "density",
      focusId: "density",
      label: "Density",
      value: `${totalHits} hits`,
      detail: `${activeSteps.size}/16 active steps`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: densityTone
    },
    {
      id: "anchors",
      focusId: "anchors",
      label: "Anchors",
      value: `K${laneHits.kick} / C${laneHits.clap}`,
      detail: `kick + clap foundation / ${laneHits.perc} perc`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: anchorTone
    },
    {
      id: "hats",
      focusId: "hats",
      label: "Hat Motion",
      value: `${laneHits.hat} hats`,
      detail: `${repeatedHatHits} repeat hits`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: hatTone
    },
    {
      id: "timing",
      focusId: "timing",
      label: "Timing Feel",
      value: `${Math.round(timingSpread)} ms spread`,
      detail: `${shiftedHits} shifted hits`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: timingTone
    },
    {
      id: "chance",
      focusId: "chance",
      label: "Chance",
      value: `${Math.round(chanceAverage * 100)}% avg`,
      detail: `${Math.round(chanceFloor * 100)}% floor`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: chanceTone
    },
    {
      id: "pocket",
      focusId: "pocket",
      label: "Pocket Balance",
      value: pocketValue,
      detail: `${earlyHits} early / ${lateHits} late / ${percentLabel(velocitySpread)} vel spread`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: pocketTone
    },
    focusCard
  ];

  return {
    headline: `Pattern ${project.selectedPattern} groove compass`,
    detail: `${totalHits} drum hits / ${activeSteps.size}/16 steps / ${shiftedHits} timed moves / ${pocketValue}`,
    tone: weakestTone(cards.map((card) => card.tone)),
    cards
  };
}

export function createGrooveCompassFocusSummary(
  summary: GrooveCompassSummary,
  focusedCardId: GrooveCompassFocusId | null
): GrooveCompassFocusSummary {
  const focusedCard = focusedCardId ? summary.cards.find((card) => card.focusId === focusedCardId) ?? null : null;
  const card = focusedCard ?? activeGrooveCompassQuickActionItem(summary);

  if (!card) {
    return {
      focusId: null,
      statusLabel: "Groove clear",
      areaLabel: "No groove focus",
      detailLabel: "No Groove Compass cards available",
      detailTitle: "Groove Compass has no focusable cards.",
      tone: "warn"
    };
  }

  const statusLabel = focusedCard ? "Focused Groove" : grooveCompassFocusStatusLabel(card.tone);
  const detailLabel = `${card.focusLabel} panel / ${card.detail}`;

  return {
    focusId: card.focusId,
    statusLabel,
    areaLabel: `${card.label}: ${card.value}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${card.label}: ${card.value} / ${detailLabel}`,
    tone: card.tone
  };
}

export function grooveCompassFocusStatusLabel(tone: MixCoachTone): string {
  if (tone === "danger") {
    return "Groove blocker";
  }

  if (tone === "warn") {
    return "Groove review";
  }

  return "Groove ready";
}

export function createGrooveCompassFocusResult(
  item: GrooveCompassFocusItem,
  summary: GrooveCompassSummary
): GrooveCompassFocusResult {
  const cardTone = summary.cards.find((card) => card.focusId === item.focusId)?.tone ?? summary.tone;

  return {
    focusId: item.focusId,
    status: "Focused",
    title: `${item.label} pocket lane focused`,
    detail: `${item.focusLabel}: ${item.value}`,
    metricLabel: "Groove",
    metricValue: grooveCompassFocusResultMetric(summary),
    auditionCue: grooveCompassFocusResultAudition(item),
    nextCheck: grooveCompassFocusResultNextCheck(item),
    tone: cardTone
  };
}

export function grooveCompassFocusResultMetric(summary: GrooveCompassSummary): string {
  const readyCount = summary.cards.filter((card) => card.tone === "good").length;
  const reviewCount = summary.cards.filter((card) => card.tone === "warn").length;
  const blockerCount = summary.cards.filter((card) => card.tone === "danger").length;

  return `${summary.headline} / ${readyCount}/${summary.cards.length} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function grooveCompassFocusResultAudition(item: GrooveCompassFocusItem): string {
  switch (item.focusId) {
    case "density":
      return "Loop the selected Pattern and listen for whether the drum grid feels empty, busy, or locked.";
    case "anchors":
      return "Check kick and clap placement before adding fills, repeats, or timing offsets.";
    case "hats":
      return "Listen for hat motion, repeat energy, and whether the groove carries the bounce.";
    case "timing":
      return "Audition shifted hits against the metronome or drum pocket before moving steps.";
    case "chance":
      return "Check probability movement only after the core drum hits already hold the groove.";
    case "pocket":
      return "Listen for early/late balance and velocity motion before shaping the pocket further.";
    case "focus":
      return "Inspect the selected drum step before changing timing, velocity, chance, repeat, or placement.";
    default:
      return `Review ${item.focusLabel.toLowerCase()} before changing the groove.`;
  }
}

export function grooveCompassFocusResultNextCheck(item: GrooveCompassFocusItem): string {
  switch (item.focusId) {
    case "density":
      return "Return after the beat has enough hits for the style without crowding the 808 and melody.";
    case "anchors":
      return "Return after kick and clap anchors make the downbeat and backbeat obvious or intentionally loose.";
    case "hats":
      return "Return after hats add motion without masking the vocal pocket or main rhythm.";
    case "timing":
      return "Return after shifted hits feel intentional and still land with the selected Pattern.";
    case "chance":
      return "Return after chance variation feels musical and does not remove essential groove anchors.";
    case "pocket":
      return "Return after early, late, and velocity movement support the bounce instead of fighting it.";
    case "focus":
      return "Return after the selected drum step has a clear pocket role.";
    default:
      return `Return after ${item.focusLabel.toLowerCase()} has a clear rhythm role.`;
  }
}

export function grooveCompassFocusCard(
  pattern: PatternData,
  selectedPattern: PatternSlot,
  selectedDrumStep: SelectedDrumStep | null
): GrooveCompassCard {
  if (!selectedDrumStep) {
    return {
      id: "focus",
      focusId: "focus",
      label: "Focus",
      value: `Pattern ${selectedPattern}`,
      detail: "Select a drum step for pocket detail",
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: "warn"
    };
  }

  const { lane, step } = selectedDrumStep;
  const isActive = Boolean(pattern.drumPattern[lane][step]);
  if (!isActive) {
    return {
      id: "focus",
      focusId: "focus",
      label: "Focus",
      value: `${drumLabels[lane]} ${step + 1}`,
      detail: `Inactive step in Pattern ${selectedPattern}`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: "warn"
    };
  }

  const velocity = drumStepVelocity(pattern, lane, step);
  const chance = drumStepProbability(pattern, lane, step);
  const timing = drumStepTimingMs(pattern, lane, step);
  const repeat = lane === "hat" ? hatRepeatCount(pattern, step) : 1;

  return {
    id: "focus",
    focusId: "focus",
    label: "Focus",
    value: `${drumLabels[lane]} ${step + 1}`,
    detail: `${percentLabel(velocity)} vel / ${percentLabel(chance)} chance / ${timingLabel(timing)} / x${repeat}`,
    focusTarget: "compose",
    focusLabel: "Compose",
    tone: chance < 1 || timing !== 0 || repeat > 1 ? "good" : "warn"
  };
}

export function selectedDrumPocketSummary(
  selectedStep: SelectedDrumStep,
  velocity: number,
  chance: number,
  timingMs: number,
  repeat: number
): DrumPocketSummary {
  const normalizedVelocity = normalizeDrumVelocity(velocity);
  const normalizedChance = normalizeDrumProbability(chance);
  const normalizedTiming = normalizeDrumTimingMs(timingMs);
  const normalizedRepeat = selectedStep.lane === "hat" ? normalizeHatRepeat(repeat) : 1;

  return {
    positionLabel: `${drumLabels[selectedStep.lane]} ${selectedStep.step + 1} / ${drumPocketPositionLabel(selectedStep.step)}`,
    roleLabel: drumPocketRoleLabel(selectedStep.lane, selectedStep.step, normalizedRepeat),
    detailLabel: `${percentLabel(normalizedVelocity)} vel / ${percentLabel(normalizedChance)} chance / ${timingLabel(normalizedTiming)}${
      selectedStep.lane === "hat" ? ` / x${normalizedRepeat}` : " / single"
    }`,
    isShaped: normalizedChance < 1 || normalizedTiming !== 0 || normalizedRepeat > 1 || normalizedVelocity >= 0.9
  };
}

export function drumPocketPositionLabel(step: number): string {
  const beat = Math.floor(step / 4) + 1;
  const slot = (step % 4) + 1;
  return slot === 1 ? `Beat ${beat}` : `Beat ${beat}.${slot}`;
}

export function drumPocketRoleLabel(lane: DrumLane, step: number, repeat: number): string {
  const slot = step % 4;
  if (lane === "clap") {
    if (step === 4 || step === 12) {
      return "Backbeat";
    }
    return slot === 0 ? "Clap anchor" : "Clap fill";
  }
  if (lane === "kick") {
    if (step === 0) {
      return "Downbeat";
    }
    if (slot === 0) {
      return "Anchor";
    }
    return slot === 3 ? "Pickup" : "Kick pocket";
  }
  if (lane === "hat") {
    if (repeat > 1) {
      return "Hat roll";
    }
    return step % 2 === 0 ? "Pulse" : "Offbeat";
  }
  return slot === 3 ? "Pickup" : step % 2 === 0 ? "Texture" : "Syncopation";
}

export function createComposerGuideSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): ComposerGuideSummary {
  const pattern = activePattern(project);
  const target = activeDeliveryTarget(project);
  const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const drumHits = drumHitCount(pattern);
  const bassCount = pattern.bassNotes.length;
  const chordCount = pattern.chordEvents.length;
  const melodyCount = pattern.melodyNotes.length;
  const bars = arrangementTotalBars(project);
  const mixTone = weakestTone(createMixCoachChecks(analysis, stemAnalyses).map((check) => check.tone));
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const drums = readinessCheckForId(checks, "drums");
  const bassTone = bassCount >= 4 ? "good" : bassCount > 0 ? "warn" : "danger";
  const harmonyTone = chordCount >= 3 ? "good" : chordCount > 0 ? "warn" : "danger";
  const melodyTone = melodyCount >= 4 ? "good" : melodyCount > 0 ? "warn" : "danger";
  const arrangeTone: MixCoachTone = bars >= target.targetBars ? "good" : bars >= 8 ? "warn" : "danger";
  const finishTone: MixCoachTone =
    analysis.status === "Silent"
      ? "danger"
      : analysis.status === "Ready" && mixTone === "good" && audibleStemCount >= target.stemGoal
        ? "good"
        : "warn";
  const baseCards: Array<Omit<ComposerGuideCard, "focusTarget" | "focusLabel">> = [
    {
      id: "drums",
      label: "Drums",
      status: drumHits >= 20 ? "Full groove" : drumHits >= 10 ? "Pocket sketch" : "Needs rhythm",
      detail: `${drumHits} hits / ${drums?.status ?? "Drums"}`,
      tone: drums?.tone ?? (drumHits > 0 ? "warn" : "danger")
    },
    {
      id: "bass",
      label: "808/Bass",
      status: bassCount >= 4 ? "Line ready" : bassCount > 0 ? "Seeded" : "Needs low end",
      detail: `${bassCount} notes / ${keyCompassPitchSpread(pattern.bassNotes.map((note) => note.pitch))}`,
      tone: bassTone
    },
    {
      id: "harmony",
      label: "Harmony",
      status: chordCount >= 3 ? "Motion ready" : chordCount > 0 ? "Loop seed" : "Needs chords",
      detail: `${chordCount} chords / ${keyCompassChordMotion(project.key, pattern.chordEvents)}`,
      tone: harmonyTone
    },
    {
      id: "melody",
      label: "Melody",
      status: melodyCount >= 4 ? "Hook seeded" : melodyCount > 0 ? "Motif seed" : "Open lane",
      detail: `${melodyCount} notes / ${keyCompassPitchSpread(pattern.melodyNotes.map((note) => note.pitch))}`,
      tone: melodyTone
    },
    {
      id: "arrange",
      label: "Arrange",
      status: bars >= target.targetBars ? "Target met" : bars >= 8 ? "Song sketch" : "Loop stage",
      detail: `${barCountLabel(bars)} / ${barCountLabel(target.targetBars)} ${target.name}`,
      tone: arrangeTone
    },
    {
      id: "finish",
      label: "Finish",
      status: finishTone === "good" ? "Handoff ready" : finishTone === "warn" ? "Needs polish" : "No signal",
      detail: `${analysis.status} / ${audibleStemCount}/${target.stemGoal} stems`,
      tone: finishTone
    }
  ];
  const cards: ComposerGuideCard[] = baseCards.map((card) => {
    const focusTarget = composerGuideFocusTarget(card.id);
    return {
      ...card,
      focusTarget,
      focusLabel: reviewQueueFocusLabel(focusTarget)
    };
  });
  const focus = composerGuideFocus(cards);

  return {
    headline: focus,
    detail: `${styleName} / Pattern ${project.selectedPattern} / ${drumHits} drums / ${bassCount + chordCount + melodyCount} notes`,
    tone: weakestTone(cards.map((card) => card.tone)),
    cards
  };
}

export function composerGuideFocus(cards: ComposerGuideCard[]): string {
  const firstDanger = cards.find((card) => card.tone === "danger");
  if (firstDanger) {
    return `${firstDanger.label} is the next writing focus`;
  }
  const firstWarn = cards.find((card) => card.tone === "warn");
  if (firstWarn) {
    return `${firstWarn.label} needs one more pass`;
  }
  return "Beat has a complete writing path";
}

export function activeComposerGuideQuickActionCard(summary: ComposerGuideSummary): ComposerGuideCard | null {
  return (
    summary.cards.find((card) => card.tone === "danger") ??
    summary.cards.find((card) => card.tone === "warn") ??
    summary.cards[0] ??
    null
  );
}

export function composerGuideFocusTarget(cardId: ComposerGuideCardId): ReviewQueueFocusTarget {
  switch (cardId) {
    case "drums":
    case "bass":
    case "harmony":
    case "melody":
      return "compose";
    case "arrange":
      return "arrange";
    case "finish":
      return "master";
  }
}

export function createComposerGuideFocusSummary(
  summary: ComposerGuideSummary,
  focusedCardId: ComposerGuideCardId | null
): ComposerGuideFocusSummary {
  const focusedCard = focusedCardId ? summary.cards.find((card) => card.id === focusedCardId) ?? null : null;
  const card = focusedCard ?? summary.cards.find((candidate) => candidate.tone !== "good") ?? summary.cards[0] ?? null;

  if (!card) {
    return {
      cardId: null,
      statusLabel: "Guide clear",
      areaLabel: "No guide cards",
      detailLabel: "No Composer Guide cards available",
      destinationLabel: "No target",
      metricLabel: "0/0 ready",
      auditionCueLabel: "Audition unavailable",
      nextCheckLabel: "Guide card unavailable",
      actionLabel: "No Composer Guide focus target.",
      detailTitle: "Composer Guide has no cards to focus.",
      tone: "good"
    };
  }

  const statusLabel = focusedCard ? "Focused Guide" : card.tone === "good" ? "Guide clear" : "Top Guide Focus";
  const detailLabel = `${card.focusLabel} panel / ${card.detail}`;
  const destinationLabel = `${card.focusLabel} panel`;
  const metricLabel = composerGuideFocusResultMetric(summary);
  const auditionCueLabel = composerGuideFocusResultAudition(card);
  const nextCheckLabel = composerGuideFocusResultNextCheck(card);
  const actionLabel = composerGuideFocusActionLabel(card, summary);

  return {
    cardId: card.id,
    statusLabel,
    areaLabel: `${card.label}: ${card.status}`,
    detailLabel,
    destinationLabel,
    metricLabel,
    auditionCueLabel,
    nextCheckLabel,
    actionLabel,
    detailTitle: `${statusLabel} / ${card.label}: ${card.status} / ${detailLabel} / Guide metric: ${metricLabel} / Audition: ${auditionCueLabel} / Next check: ${nextCheckLabel}`,
    tone: card.tone
  };
}

export function composerGuideFocusActionLabel(card: ComposerGuideCard, summary: ComposerGuideSummary): string {
  const { destinationLabel, metricLabel, auditionCueLabel, nextCheckLabel } = composerGuideFocusActionContext(card, summary);
  return `Focus ${card.focusLabel}: ${card.status} / ${destinationLabel} / ${metricLabel} / ${auditionCueLabel} / ${nextCheckLabel}`;
}

export function composerGuideFocusCommandDetail(card: ComposerGuideCard, summary: ComposerGuideSummary): string {
  const { destinationLabel, metricLabel, auditionCueLabel, nextCheckLabel } = composerGuideFocusActionContext(card, summary);
  return `${card.status} / ${destinationLabel} / ${metricLabel} / ${auditionCueLabel} / ${nextCheckLabel} / ${card.detail}`;
}

export function composerGuideFocusActionContext(
  card: ComposerGuideCard,
  summary: ComposerGuideSummary
): {
  destinationLabel: string;
  metricLabel: string;
  auditionCueLabel: string;
  nextCheckLabel: string;
} {
  return {
    destinationLabel: `${card.focusLabel} panel`,
    metricLabel: composerGuideFocusResultMetric(summary),
    auditionCueLabel: composerGuideFocusResultAudition(card),
    nextCheckLabel: composerGuideFocusResultNextCheck(card)
  };
}

export function createComposerGuideFocusResult(
  card: ComposerGuideCard,
  summary: ComposerGuideSummary
): ComposerGuideFocusResult {
  return {
    cardId: card.id,
    status: "Focused",
    title: `${card.label} guide focused`,
    detail: `${card.focusLabel}: ${card.status}`,
    metricLabel: "Guide",
    metricValue: composerGuideFocusResultMetric(summary),
    auditionCue: composerGuideFocusResultAudition(card),
    nextCheck: composerGuideFocusResultNextCheck(card),
    tone: card.tone
  };
}

export function composerGuideFocusResultMetric(summary: ComposerGuideSummary): string {
  const readyCount = summary.cards.filter((card) => card.tone === "good").length;
  const reviewCount = summary.cards.filter((card) => card.tone === "warn").length;
  const blockerCount = summary.cards.filter((card) => card.tone === "danger").length;
  return `${readyCount}/${summary.cards.length} ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function composerGuideFocusResultAudition(card: ComposerGuideCard): string {
  switch (card.id) {
    case "drums":
      return "Loop the selected Pattern and check kick, clap, hat, perc, velocity, timing, and chance.";
    case "bass":
      return "Loop the selected Pattern and check 808/bass rhythm, pitch role, glide, velocity, and low-end support.";
    case "harmony":
      return "Loop the selected Pattern and check chord motion, voicing, length, velocity, and key fit.";
    case "melody":
      return "Loop the selected Pattern and check motif direction, pitch spread, velocity, chance, and hook seed.";
    case "arrange":
      return "Play Song or Block loop and check section order, Pattern A/B/C use, energy, and target length.";
    case "finish":
      return "Play Full Mix and check headroom, stems, master posture, and handoff readiness before export.";
  }
}

export function composerGuideFocusResultNextCheck(card: ComposerGuideCard): string {
  switch (card.id) {
    case "drums":
      return "Return after the groove has a usable pocket or a clear reason to defer drums.";
    case "bass":
      return "Return after the low-end line supports the drums and selected key.";
    case "harmony":
      return "Return after the chord loop gives the beat enough movement or intentional space.";
    case "melody":
      return "Return after the hook or motif has a repeatable idea for the selected style.";
    case "arrange":
      return "Return after the arrangement reaches the target length or has an intentional sketch boundary.";
    case "finish":
      return "Return after mix, master, stem, and handoff checks are ready for the selected target.";
  }
}

export function createComposerActionsSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): ComposerActionsSummary {
  const pattern = activePattern(project);
  const target = activeDeliveryTarget(project);
  const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const styleActionProfile = composerActionStyleProfile(project);
  const drumHits = drumHitCount(pattern);
  const bassCount = pattern.bassNotes.length;
  const chordCount = pattern.chordEvents.length;
  const melodyCount = pattern.melodyNotes.length;
  const bars = arrangementTotalBars(project);
  const mixTone = weakestTone(createMixCoachChecks(analysis, stemAnalyses).map((check) => check.tone));
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;

  const actions = [
    composerDrumAction(project, checks, drumHits, styleActionProfile),
    composerBassAction(project, bassCount, styleActionProfile),
    composerHarmonyAction(project, chordCount, styleActionProfile),
    composerMelodyAction(project, melodyCount, styleActionProfile),
    composerArrangementAction(project, bars, target, styleActionProfile),
    composerFinishAction(project, analysis, mixTone, audibleStemCount, target, styleActionProfile)
  ].sort(composerActionSort);

  return {
    headline: composerActionsFocus(actions, styleName),
    detail: `${styleName} priority: ${styleActionProfile.focus} / Pattern ${project.selectedPattern} / ${actions.length} moves`,
    tone: weakestTone(actions.map((action) => action.tone)),
    actions
  };
}

export function composerDrumAction(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  drumHits: number,
  styleActionProfile: ComposerStyleActionProfile
): ComposerAction {
  const drums = readinessCheckForId(checks, "drums");
  const goal = styleActionProfile.goals.drumHits;
  const tone = composerActionTone(drumHits, goal);
  if (drumHits < goal || drums?.tone === "danger") {
    const foundation = composerDrumFoundation(project);
    return {
      id: "drums-foundation",
      area: "drums",
      label: "Build rhythm foundation",
      detail: `${styleActionProfile.cues.drums} / ${drumHits}/${goal} hits`,
      buttonLabel: "Drum Foundation",
      scope: `Pattern ${project.selectedPattern} drums`,
      impact: "replace foundation",
      safety: "Undoable pattern edit",
      tone: drums?.tone === "danger" ? "danger" : tone,
      priority: composerActionPriority("drums", drums?.tone === "danger" ? "danger" : tone, styleActionProfile),
      command: { kind: "drumFoundation", foundation }
    };
  }

  return {
    id: "drums-fill",
    area: "drums",
    label: "Add drum movement",
    detail: `${styleActionProfile.cues.drums} / tail move`,
    buttonLabel: "Drum Fill",
    scope: `Pattern ${project.selectedPattern} drums`,
    impact: "add tail fill",
    safety: "Undoable tail edit",
    tone: "good",
    priority: composerActionPriority("drums", "good", styleActionProfile),
    command: { kind: "patternFill", preset: "drum_fill" }
  };
}

export function composerBassAction(
  project: ProjectState,
  bassCount: number,
  styleActionProfile: ComposerStyleActionProfile
): ComposerAction {
  const goal = styleActionProfile.goals.bassNotes;
  const tone = composerActionTone(bassCount, goal);
  if (bassCount < goal) {
    const pad = composerBasslinePad(project);
    return {
      id: "bassline",
      area: "bass",
      label: "Write low end",
      detail: `${styleActionProfile.cues.bass} / ${basslinePadLabel(pad)} ${bassCount}/${goal}`,
      buttonLabel: "808 Bassline",
      scope: `Pattern ${project.selectedPattern} 808`,
      impact: "replace bass lane",
      safety: "Undoable lane edit",
      tone,
      priority: composerActionPriority("bass", tone, styleActionProfile),
      command: { kind: "bassline", pad }
    };
  }

  return {
    id: "bass-pickup",
    area: "bass",
    label: "Add low-end pickup",
    detail: `${styleActionProfile.cues.bass} / tail move`,
    buttonLabel: "808 Pickup",
    scope: `Pattern ${project.selectedPattern} 808`,
    impact: "add tail pickup",
    safety: "Undoable tail edit",
    tone: "good",
    priority: composerActionPriority("bass", "good", styleActionProfile),
    command: { kind: "patternFill", preset: "bass_pickup" }
  };
}

export function composerHarmonyAction(
  project: ProjectState,
  chordCount: number,
  styleActionProfile: ComposerStyleActionProfile
): ComposerAction {
  const preset = composerChordPreset(project);
  const goal = styleActionProfile.goals.chordEvents;
  const tone = composerActionTone(chordCount, goal);
  return {
    id: chordCount < goal ? "chord-progression" : "chord-color",
    area: "harmony",
    label: chordCount < goal ? "Set chord motion" : "Refresh chord color",
    detail: `${styleActionProfile.cues.harmony} / ${chordProgressionPresetLabel(preset)} ${chordCount}/${goal}`,
    buttonLabel: chordCount < goal ? "Chord Progression" : "Chord Color",
    scope: `Pattern ${project.selectedPattern} chords`,
    impact: "replace chord lane",
    safety: "Undoable chord edit",
    tone,
    priority: composerActionPriority("harmony", tone, styleActionProfile),
    command: { kind: "chordProgression", preset }
  };
}

export function composerMelodyAction(
  project: ProjectState,
  melodyCount: number,
  styleActionProfile: ComposerStyleActionProfile
): ComposerAction {
  const goal = styleActionProfile.goals.melodyNotes;
  const tone = composerActionTone(melodyCount, goal);
  if (melodyCount < goal) {
    const motif = composerMelodyMotif(project);
    return {
      id: "melody-motif",
      area: "melody",
      label: "Seed hook motif",
      detail: `${styleActionProfile.cues.melody} / ${melodyMotifLabel(motif)} ${melodyCount}/${goal}`,
      buttonLabel: "Melody Motif",
      scope: `Pattern ${project.selectedPattern} synth`,
      impact: "replace melody lane",
      safety: "Undoable note edit",
      tone,
      priority: composerActionPriority("melody", tone, styleActionProfile),
      command: { kind: "melodyMotif", motif }
    };
  }

  return {
    id: "melody-turn",
    area: "melody",
    label: "Turn the melody tail",
    detail: `${styleActionProfile.cues.melody} / tail move`,
    buttonLabel: "Melody Turn",
    scope: `Pattern ${project.selectedPattern} synth`,
    impact: "add tail turn",
    safety: "Undoable tail edit",
    tone: "good",
    priority: composerActionPriority("melody", "good", styleActionProfile),
    command: { kind: "patternFill", preset: "melody_turn" }
  };
}

export function composerArrangementAction(
  project: ProjectState,
  bars: number,
  target: DeliveryTarget,
  styleActionProfile: ComposerStyleActionProfile
): ComposerAction {
  const styleBarGoal = Math.min(target.targetBars, styleActionProfile.goals.arrangementBars);
  if (bars < styleBarGoal) {
    return {
      id: "arrange-chain",
      area: "arrange",
      label: "Sketch song form",
      detail: `${styleActionProfile.cues.arrange} / ${barCountLabel(bars)} now`,
      buttonLabel: "8 Bar Chain",
      scope: "Arrangement",
      impact: "replace blocks",
      safety: "Undoable form edit",
      tone: "danger",
      priority: composerActionPriority("arrange", "danger", styleActionProfile),
      command: { kind: "patternChain", chain: "eight_bar" }
    };
  }

  if (bars < target.targetBars) {
    return {
      id: "arrange-template",
      area: "arrange",
      label: `Reach ${target.name}`,
      detail: `${styleActionProfile.cues.arrange} / ${barCountLabel(target.targetBars)} target`,
      buttonLabel: arrangementTemplateLabel(target.preferredTemplate),
      scope: "Arrangement",
      impact: "apply template",
      safety: "Undoable form edit",
      tone: "warn",
      priority: composerActionPriority("arrange", "warn", styleActionProfile),
      command: { kind: "arrangementTemplate", template: target.preferredTemplate }
    };
  }

  return {
    id: "arrange-switch",
    area: "arrange",
    label: "Add section contrast",
    detail: `${styleActionProfile.cues.arrange} / ${barCountLabel(bars)} form`,
    buttonLabel: "Hook Switch",
    scope: "Arrangement",
    impact: "replace blocks",
    safety: "Undoable form edit",
    tone: "good",
    priority: composerActionPriority("arrange", "good", styleActionProfile),
    command: { kind: "patternChain", chain: "hook_switch" }
  };
}

export function composerFinishAction(
  project: ProjectState,
  analysis: ExportAnalysis,
  mixTone: MixCoachTone,
  audibleStemCount: number,
  target: DeliveryTarget,
  styleActionProfile: ComposerStyleActionProfile
): ComposerAction {
  const pad = suggestedMasterFinishPad(project);
  const tone: MixCoachTone =
    analysis.status === "Ready" && mixTone === "good" && audibleStemCount >= target.stemGoal ? "good" : "warn";

  return {
    id: "finish-master",
    area: "finish",
    label: "Set output posture",
    detail: `${styleActionProfile.cues.finish} / ${audibleStemCount}/${target.stemGoal} stems`,
    buttonLabel: `${masterFinishPadLabel(pad)} Finish`,
    scope: "Master output",
    impact: "preset/ceiling/gain",
    safety: "Undoable master edit",
    tone,
    priority: composerActionPriority("finish", tone, styleActionProfile),
    command: { kind: "masterFinish", pad }
  };
}

export function composerActionStyleProfile(project: ProjectState): ComposerStyleActionProfile {
  return composerStyleActionProfiles[project.styleId];
}

export function composerActionPriority(
  area: ComposerActionArea,
  tone: MixCoachTone,
  styleActionProfile: ComposerStyleActionProfile
): number {
  const toneOffset = tone === "danger" ? 0 : tone === "warn" ? 20 : 40;
  return toneOffset + styleActionProfile.priorities[area];
}

export function composerActionSort(first: ComposerAction, second: ComposerAction): number {
  return first.priority - second.priority || first.label.localeCompare(second.label);
}

export function composerActionTone(current: number, goal: number): MixCoachTone {
  if (current >= goal) {
    return "good";
  }
  return current > 0 ? "warn" : "danger";
}

export function composerActionsFocus(actions: ComposerAction[], styleName: string): string {
  const firstDanger = actions.find((action) => action.tone === "danger");
  if (firstDanger) {
    return `${styleName}: ${firstDanger.label} is ready to run`;
  }
  const firstWarn = actions.find((action) => action.tone === "warn");
  if (firstWarn) {
    return `${styleName}: ${firstWarn.label} is the next safe move`;
  }
  return `${styleName}: writing actions are ready for variation`;
}

export function createComposerActionResult(
  action: ComposerAction,
  beforeProject: ProjectState,
  afterProject: ProjectState
): ComposerActionResult {
  const beforeMetrics = composerActionResultMetricSnapshots(beforeProject, action);
  const afterMetrics = composerActionResultMetricSnapshots(afterProject, action);
  const metrics = afterMetrics.map((metric, index) => {
    const before = beforeMetrics[index]?.value ?? "n/a";
    const tone: MixCoachTone = before === metric.value ? "warn" : "good";
    return {
      id: metric.id,
      label: metric.label,
      before,
      after: metric.value,
      tone
    };
  });
  const changed = beforeProject !== afterProject || metrics.some((metric) => metric.before !== metric.after);
  const followup = composerActionFollowupCues(action, afterProject);

  return {
    actionId: action.id,
    area: action.area,
    title: `${action.buttonLabel} ${changed ? "applied" : "already current"}`,
    status: changed ? "Applied" : "Already current",
    detail: `${action.label} / ${action.scope}`,
    route: quickActionComposerActionRouteLabel(action, action.area),
    scope: action.scope,
    impact: action.impact,
    safety: action.safety,
    auditionCue: followup.auditionCue,
    nextCheck: followup.nextCheck,
    tone: changed ? "good" : "warn",
    metrics
  };
}

export function composerActionFollowupCues(
  action: ComposerAction,
  project: ProjectState
): { auditionCue: string; nextCheck: string } {
  const pattern = activePattern(project);
  const target = activeDeliveryTarget(project);

  switch (action.area) {
    case "drums":
      return {
        auditionCue: `Loop Pattern ${project.selectedPattern}; check kick/clap against hat motion.`,
        nextCheck: `${drumHitCount(pattern)} drum hits now; check 808 support before adding melody.`
      };
    case "bass":
      return {
        auditionCue: `Loop Pattern ${project.selectedPattern}; hear 808 against the kick.`,
        nextCheck: `${pattern.bassNotes.filter((note) => note.glide).length} glide notes now; leave room before melody.`
      };
    case "harmony":
      return {
        auditionCue: `Loop Pattern ${project.selectedPattern}; hear chords under 808 and Synth.`,
        nextCheck: `${chordMotionLabel(pattern.chordEvents)} motion; confirm hook notes stay in key.`
      };
    case "melody":
      return {
        auditionCue: `Loop Pattern ${project.selectedPattern}; hear the Synth motif against chords.`,
        nextCheck: `${pattern.melodyNotes.length} Synth notes now; check hook contrast before arranging.`
      };
    case "arrange":
      return {
        auditionCue: `Play Song loop; scan ${barCountLabel(arrangementTotalBars(project))} form.`,
        nextCheck: `${project.arrangement.length} blocks now; compare against ${target.name}.`
      };
    case "finish": {
      const analysis = analyzeExport(project);
      return {
        auditionCue: `Play full mix; watch ${formatDb(analysis.headroomDb)} headroom.`,
        nextCheck: `${project.masterPreset} selected; export only after Mix Coach is clear.`
      };
    }
  }
}

export function composerActionResultMetricSnapshots(
  project: ProjectState,
  action: ComposerAction
): { id: string; label: string; value: string }[] {
  const pattern = activePattern(project);

  switch (action.area) {
    case "drums":
      return [
        { id: "drums", label: "Drums", value: `${drumHitCount(pattern)} hits` },
        {
          id: "hat-motion",
          label: "Hat motion",
          value: `${pattern.hatRepeats.filter((repeat) => repeat > 1).length} repeats`
        }
      ];
    case "bass":
      return [
        { id: "bass", label: "808", value: `${pattern.bassNotes.length} notes` },
        { id: "glide", label: "Glide", value: `${pattern.bassNotes.filter((note) => note.glide).length} notes` }
      ];
    case "harmony":
      return [
        { id: "chords", label: "Chords", value: `${pattern.chordEvents.length} events` },
        { id: "roots", label: "Roots", value: chordMotionLabel(pattern.chordEvents) }
      ];
    case "melody":
      return [
        { id: "melody", label: "Synth", value: `${pattern.melodyNotes.length} notes` },
        {
          id: "chance",
          label: "Chance",
          value: `${pattern.melodyNotes.filter((note) => (note.probability ?? 1) < 1).length} varied`
        }
      ];
    case "arrange":
      return [
        { id: "bars", label: "Length", value: barCountLabel(arrangementTotalBars(project)) },
        { id: "blocks", label: "Blocks", value: `${project.arrangement.length} blocks` }
      ];
    case "finish":
      return [
        { id: "master", label: "Master", value: project.masterPreset },
        { id: "ceiling", label: "Ceiling", value: formatDb(project.masterCeilingDb) }
      ];
  }
}

export function chordMotionLabel(chords: ChordEvent[]): string {
  if (chords.length === 0) {
    return "none";
  }
  return chords.map((event) => event.root).join("-");
}

export function basslinePadLabel(pad: BasslinePadId): string {
  return basslinePadDefinitions.find((definition) => definition.id === pad)?.label ?? pad;
}

export function drumFoundationLabel(foundation: DrumFoundationId): string {
  return drumFoundationDefinitions.find((definition) => definition.id === foundation)?.label ?? foundation;
}

export function melodyMotifLabel(motif: MelodyMotifId): string {
  return melodyMotifDefinitions.find((definition) => definition.id === motif)?.label ?? motif;
}

export function masterFinishPadLabel(pad: MasterFinishPadId): string {
  return masterFinishPadDefinitions.find((definition) => definition.id === pad)?.label ?? pad;
}

export function keyCompassFocusCard(
  project: ProjectState,
  selectedNote: SelectedNote | null,
  selectedChord: ChordEvent | undefined,
  selectedDrumStep: SelectedDrumStep | null
): KeyCompassCard {
  if (selectedChord) {
    const degree = keyCompassScaleDegreeLabel(project.key, selectedChord.root);
    return {
      id: "focus",
      focusId: "focus",
      label: "Focus",
      value: `${degree} ${selectedChord.root} ${selectedChord.quality}`,
      detail: `Step ${selectedChord.step + 1} / ${selectedChord.length} step length / ${chordInversionLabel(normalizeChordInversion(selectedChord.inversion))}`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: keyCompassScaleDegree(project.key, selectedChord.root) === null ? "warn" : "good"
    };
  }

  if (selectedNote) {
    const degree = keyCompassPitchScaleDegreeLabel(project.key, selectedNote.pitch);
    const trackLabel = selectedNote.track === "bass" ? "808" : "Synth";
    return {
      id: "focus",
      focusId: "focus",
      label: "Focus",
      value: `${trackLabel} ${selectedNote.pitch}`,
      detail: `${degree} / Step ${selectedNote.step + 1}`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: keyCompassPitchInKey(project.key, selectedNote.pitch) ? "good" : "warn"
    };
  }

  if (selectedDrumStep) {
    return {
      id: "focus",
      focusId: "focus",
      label: "Focus",
      value: `${drumLabels[selectedDrumStep.lane]} step`,
      detail: `Step ${selectedDrumStep.step + 1} selected / harmony unchanged`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: "warn"
    };
  }

  return {
    id: "focus",
    focusId: "focus",
    label: "Focus",
    value: `Pattern ${project.selectedPattern}`,
    detail: "Select a note or chord for degree context",
    focusTarget: "compose",
    focusLabel: "Compose",
    tone: "warn"
  };
}

export function keyCompassChordMotion(key: string, chords: ChordEvent[]): string {
  if (chords.length === 0) {
    return "No chords";
  }
  return chords
    .slice(0, 5)
    .map((chord) => `${keyCompassScaleDegreeLabel(key, chord.root)}:${chord.root}${chord.quality}`)
    .join(" > ");
}

export function keyCompassPitchSpread(pitches: string[]): string {
  if (pitches.length === 0) {
    return "No notes";
  }
  const uniqueNames = Array.from(
    new Set(
      pitches
        .map((pitch) => pitchParts(pitch)?.name)
        .filter((name): name is string => Boolean(name))
    )
  );
  return uniqueNames.length > 0 ? uniqueNames.slice(0, 6).join("/") : `${pitches.length} notes`;
}

export function keyCompassStepSpread(stepsInUse: number[]): string {
  if (stepsInUse.length === 0) {
    return "no steps";
  }
  const low = Math.min(...stepsInUse) + 1;
  const high = Math.max(...stepsInUse) + 1;
  return low === high ? `step ${low}` : `steps ${low}-${high}`;
}

export function keyCompassPitchInKey(key: string, pitch: string): boolean {
  const parts = pitchParts(pitch);
  return Boolean(parts && keyCompassScaleDegree(key, parts.name) !== null);
}

export function keyCompassPitchScaleDegreeLabel(key: string, pitch: string): string {
  const parts = pitchParts(pitch);
  return parts ? keyCompassScaleDegreeLabel(key, parts.name) : "outside scale";
}

export function selectedNoteDegreeSummary(key: string, pitch: string): NoteDegreeSummary {
  const parts = pitchParts(pitch);
  if (!parts) {
    return {
      degreeLabel: "Out",
      roleLabel: "Outside scale",
      pitchLabel: pitch,
      inKey: false
    };
  }

  const degree = keyCompassScaleDegree(key, parts.name);
  if (degree === null) {
    return {
      degreeLabel: "Out",
      roleLabel: "Outside scale",
      pitchLabel: `${parts.name}${parts.octave}`,
      inKey: false
    };
  }

  return {
    degreeLabel: `D${degree + 1}`,
    roleLabel: scaleDegreeRoleLabel(degree),
    pitchLabel: `${parts.name}${parts.octave}`,
    inKey: true
  };
}

export function scaleDegreeRoleLabel(degree: number): string {
  return ["Root", "Step", "Color", "Lift", "Anchor", "Mood", "Lead"][degree] ?? "Scale";
}

export function selectedChordHarmonicSummary(key: string, chord: ChordEvent): ChordHarmonicSummary {
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

export function romanChordLabel(degree: number, quality: ChordQuality): string {
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

export function chordDegreeRoleLabel(degree: number): string {
  return ["Home", "Step", "Color", "Lift", "Tension", "Mood", "Lead"][degree] ?? "Function";
}

export function keyCompassScaleDegreeLabel(key: string, pitchName: string): string {
  const degree = keyCompassScaleDegree(key, pitchName);
  return degree === null ? "out" : `D${degree + 1}`;
}

export function keyCompassScaleDegree(key: string, pitchName: string): number | null {
  const scaleNotes = scalePitchNames(key);
  const normalizedPitchName = normalizePitchNameForCompass(pitchName);
  const index = scaleNotes.findIndex((note) => normalizePitchNameForCompass(note) === normalizedPitchName);
  return index >= 0 ? index : null;
}

export function normalizePitchNameForCompass(pitchName: string): string {
  const enharmonic: Record<string, string> = {
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#"
  };
  return enharmonic[pitchName] ?? pitchName;
}

export function createProductionSnapshotSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): ProductionSnapshotSummary {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const slots = usedPatternSlots(project);
  const sectionLabels = arrangementSections.filter((section) => project.arrangement.some((block) => block.section === section));
  const hasVerse = sectionLabels.includes("Verse");
  const hasHook = sectionLabels.includes("Hook");
  const patternEvents = slots.reduce((total, slot) => total + patternEventTotal(project.patterns[slot]), 0);
  const mixChecks = createMixCoachChecks(analysis, stemAnalyses);
  const mixTone = weakestTone(mixChecks.map((check) => check.tone));
  const audibleStems = audibleStemTracks(stemAnalyses);
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const targetTone: MixCoachTone = bars >= target.targetBars ? "good" : bars >= Math.min(8, target.targetBars) ? "warn" : "danger";
  const formTone: MixCoachTone =
    hasVerse && hasHook && sectionLabels.length >= 4 ? "good" : hasHook && sectionLabels.length >= 3 ? "warn" : "danger";
  const patternTone: MixCoachTone = slots.length >= 3 && patternEvents >= 36 ? "good" : slots.length >= 2 && patternEvents >= 20 ? "warn" : "danger";
  const handoffTone: MixCoachTone =
    analysis.status === "Silent" || audibleStems.length === 0
      ? "danger"
      : analysis.status === "Ready" && audibleStems.length >= target.stemGoal && briefStatus.tone === "good"
        ? "good"
        : "warn";
  const readyCount = checks.filter((check) => check.tone === "good").length;
  const tone = weakestTone([targetTone, formTone, patternTone, mixTone, handoffTone]);
  const headline =
    tone === "good"
      ? `${target.name} production pass`
      : tone === "warn"
        ? `${target.name} production check`
        : `${target.name} needs core work`;
  const detail = `${barCountLabel(bars)} / ${readyCount}/${checks.length} readiness / ${analysis.status} export`;
  const stemLabel = audibleStems.length > 0 ? audibleStems.map(stemTrackLabel).join("/") : "No audible stems";
  const mixIssueCount = mixChecks.filter((check) => check.tone !== "good").length;

  return {
    headline,
    detail,
    tone,
    metrics: [
      {
        id: "target",
        focusId: "target",
        label: "Target",
        value: `${bars}/${target.targetBars} bars`,
        detail: `${target.name} / ${target.mixPosture.replace("_", " ")}`,
        focusTarget: "deliver",
        focusLabel: "Deliver",
        tone: targetTone
      },
      {
        id: "form",
        focusId: "form",
        label: "Form",
        value: `${sectionLabels.length}/${arrangementSections.length} sections`,
        detail: sectionLabels.length > 0 ? sectionLabels.join("/") : "No arrangement blocks",
        focusTarget: "arrange",
        focusLabel: "Arrange",
        tone: formTone
      },
      {
        id: "patterns",
        focusId: "patterns",
        label: "Patterns",
        value: `${slots.length}/3 slots`,
        detail: `${patternEvents} events across Pattern ${slots.join("/") || project.selectedPattern}`,
        focusTarget: "compose",
        focusLabel: "Compose",
        tone: patternTone
      },
      {
        id: "mix",
        focusId: "mix",
        label: "Mix",
        value: mixTone === "good" ? "Balanced" : mixTone === "warn" ? "Check" : "Needs signal",
        detail: `${formatDb(analysis.headroomDb)} headroom / ${mixIssueCount} flagged checks`,
        focusTarget: "mix",
        focusLabel: "Mix",
        tone: mixTone
      },
      {
        id: "handoff",
        focusId: "handoff",
        label: "Handoff",
        value: `${audibleStems.length}/${target.stemGoal} stems`,
        detail: `${stemLabel} / brief ${briefStatus.value}`,
        focusTarget: "deliver",
        focusLabel: "Deliver",
        tone: handoffTone
      }
    ]
  };
}

export function createProductionSnapshotFocusSummary(
  summary: ProductionSnapshotSummary,
  focusedMetricId: ProductionSnapshotFocusId | null
): ProductionSnapshotFocusSummary {
  const focusedMetric = focusedMetricId ? summary.metrics.find((metric) => metric.focusId === focusedMetricId) ?? null : null;
  const metric = focusedMetric ?? summary.metrics[0] ?? null;

  if (!metric) {
    return {
      focusId: null,
      statusLabel: "Snapshot clear",
      areaLabel: "No snapshot focus",
      detailLabel: "No Production Snapshot metrics available",
      detailTitle: "Production Snapshot has no focusable metrics.",
      tone: "warn"
    };
  }

  const statusLabel = focusedMetric ? "Focused Snapshot" : "Snapshot Focus";
  const detailLabel = `${metric.focusLabel} panel / ${metric.detail}`;

  return {
    focusId: metric.focusId,
    statusLabel,
    areaLabel: `${metric.label}: ${metric.value}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${metric.label}: ${metric.value} / ${detailLabel}`,
    tone: metric.tone
  };
}

export function createProductionSnapshotFocusResult(
  metric: ProductionSnapshotFocusItem,
  summary: ProductionSnapshotSummary
): ProductionSnapshotFocusResult {
  const summaryMetric = summary.metrics.find((item) => item.focusId === metric.focusId) ?? null;

  return {
    metricId: metric.focusId,
    status: "Focused",
    title: `${metric.label} snapshot focused`,
    detail: `${metric.value}: ${metric.detail}`,
    destination: `${metric.focusLabel} panel`,
    metricLabel: "Snapshot",
    metricValue: productionSnapshotFocusResultMetric(summary),
    auditionCue: productionSnapshotFocusResultAudition(metric),
    nextCheck: productionSnapshotFocusResultNextCheck(metric),
    tone: summaryMetric?.tone ?? "warn"
  };
}

export function productionSnapshotFocusResultMetric(summary: ProductionSnapshotSummary): string {
  const readyCount = summary.metrics.filter((metric) => metric.tone === "good").length;
  const reviewCount = summary.metrics.filter((metric) => metric.tone === "warn").length;
  const blockerCount = summary.metrics.filter((metric) => metric.tone === "danger").length;

  return `${readyCount}/${summary.metrics.length} session metrics ready / ${workflowCountLabel(reviewCount, "review")} / ${workflowCountLabel(blockerCount, "blocker")}`;
}

export function productionSnapshotFocusResultAudition(metric: ProductionSnapshotFocusItem): string {
  switch (metric.focusId) {
    case "target":
      return "Check the delivery target against the current bar count and mix posture before changing the beat.";
    case "form":
      return "Play Song loop and scan verse, hook, bridge, and outro movement against the target.";
    case "patterns":
      return "Audition Pattern A/B/C across the arrangement and confirm each section has enough contrast.";
    case "mix":
      return "Play Full Mix, then use Mix Coach and Stem Audition to hear balance and headroom.";
    case "handoff":
      return "Check stems, export status, and Session Brief before sending the beat.";
  }
}

export function productionSnapshotFocusResultNextCheck(metric: ProductionSnapshotFocusItem): string {
  switch (metric.focusId) {
    case "target":
      return "Return after target fit, arrangement length, and mix posture agree.";
    case "form":
      return "Return after the song form has enough section movement for the intended delivery.";
    case "patterns":
      return "Return after Pattern coverage supports hook, verse, and variation decisions.";
    case "mix":
      return "Return after mix posture, stem balance, and headroom are ready or intentionally deferred.";
    case "handoff":
      return "Return after export, stems, and brief context are ready for handoff.";
  }
}

export function createBeatMapSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): BeatMapSummary {
  const stages = createBeatMapStages(project, checks, analysis, stemAnalyses);
  const metrics = createBeatMapMetrics(project, analysis, stemAnalyses);
  const tone = weakestTone([...stages.map((stage) => stage.tone), ...metrics.map((metric) => metric.tone)]);
  const bars = arrangementTotalBars(project);
  const patternUsage = usedPatternSlots(project).join("/");
  const target = activeDeliveryTarget(project);
  const headline =
    tone === "danger" ? `${target.name} target needs a starter move` : tone === "warn" ? `${target.name} target in progress` : `${target.name} target ready`;
  const detail = `${barCountLabel(bars)} of ${barCountLabel(target.targetBars)} / Pattern ${patternUsage} / ${analysis.status} export`;

  return {
    headline,
    detail,
    tone,
    stages,
    metrics
  };
}

export function createBeatMapStages(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): BeatMapStage[] {
  const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const drums = readinessCheckForId(checks, "drums");
  const bass = readinessCheckForId(checks, "bass");
  const harmony = readinessCheckForId(checks, "harmony");
  const compositionTone = weakestTone([drums?.tone ?? "danger", bass?.tone ?? "danger", harmony?.tone ?? "danger"]);
  const bars = arrangementTotalBars(project);
  const target = activeDeliveryTarget(project);
  const arrangementTone: MixCoachTone = bars >= target.targetBars ? "good" : bars >= 8 ? "warn" : "danger";
  const mixTone = weakestTone(createMixCoachChecks(analysis, stemAnalyses).map((check) => check.tone));
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const deliveryTone: MixCoachTone =
    analysis.status === "Silent" ? "danger" : analysis.status !== "Ready" || audibleStemCount < target.stemGoal ? "warn" : "good";

  return [
    {
      id: "start",
      label: "Start",
      status: target.name,
      detail: `${styleName} / ${project.key} / ${project.bpm} BPM`,
      tone: "good"
    },
    {
      id: "compose",
      label: "Compose",
      status: compositionTone === "good" ? "Playable" : compositionTone === "warn" ? "Sketch" : "Needs core",
      detail: `${drums?.status ?? "Drums"} / ${bass?.status ?? "808"} / ${harmony?.status ?? "Harmony"}`,
      tone: compositionTone
    },
    {
      id: "arrange",
      label: "Arrange",
      status: bars >= target.targetBars ? "Target met" : bars >= 8 ? "In range" : "Short",
      detail: `${barCountLabel(bars)} of ${barCountLabel(target.targetBars)} target`,
      tone: arrangementTone
    },
    {
      id: "polish",
      label: "Polish",
      status: mixTone === "good" ? "Balanced" : mixTone === "warn" ? "Check mix" : "Needs signal",
      detail: `${formatDb(analysis.headroomDb)} headroom`,
      tone: mixTone
    },
    {
      id: "deliver",
      label: "Deliver",
      status: deliveryTone === "good" ? "Ready" : deliveryTone === "warn" ? "Check exports" : "No signal",
      detail: `${audibleStemCount}/${target.stemGoal} target stems audible`,
      tone: deliveryTone
    }
  ];
}

export function createBeatMapMetrics(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): BeatMapMetric[] {
  const bars = arrangementTotalBars(project);
  const target = activeDeliveryTarget(project);
  const slots = usedPatternSlots(project);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const spread = stemSpreadDb(stemAnalyses);
  const songTone: MixCoachTone = bars >= target.targetBars ? "good" : bars >= 8 ? "warn" : "danger";
  const patternTone: MixCoachTone = slots.length >= 3 ? "good" : slots.length >= 2 ? "warn" : "danger";
  const exportTone: MixCoachTone = analysis.status === "Ready" ? "good" : analysis.status === "Silent" ? "danger" : "warn";
  const stemTone: MixCoachTone =
    audibleStems.length >= target.stemGoal ? "good" : audibleStems.length >= 2 ? "warn" : "danger";
  const briefStatus = sessionBriefStatus(project.sessionBrief);

  return [
    {
      id: "brief",
      label: "Brief",
      value: briefStatus.value,
      detail: briefStatus.detail,
      tone: briefStatus.tone
    },
    {
      id: "song",
      label: "Song",
      value: barCountLabel(bars),
      detail: `${barCountLabel(target.targetBars)} ${target.name} target`,
      tone: songTone
    },
    {
      id: "patterns",
      label: "Patterns",
      value: `${slots.length}/3 used`,
      detail: `Pattern ${slots.join("/")}`,
      tone: patternTone
    },
    {
      id: "export",
      label: "Export",
      value: analysis.status,
      detail: `${formatDb(analysis.peakDb)} peak`,
      tone: exportTone
    },
    {
      id: "stems",
      label: "Stems",
      value: `${audibleStems.length}/${target.stemGoal}`,
      detail: spread === null ? "Need two audible stems" : `${spread.toFixed(1)} dB spread`,
      tone: stemTone
    }
  ];
}

export function createBeatMapActions(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): NextMoveAction[] {
  const drums = readinessCheckForId(checks, "drums");
  const bass = readinessCheckForId(checks, "bass");
  const harmony = readinessCheckForId(checks, "harmony");
  const compositionTone = weakestTone([drums?.tone ?? "danger", bass?.tone ?? "danger", harmony?.tone ?? "danger"]);
  const bars = arrangementTotalBars(project);
  const target = activeDeliveryTarget(project);
  const mixTone = weakestTone(createMixCoachChecks(analysis, stemAnalyses).map((check) => check.tone));
  const candidates: NextMoveAction[] = [
    !isDeliveryTargetAligned(project, target) ? deliveryTargetNextMoveAction(project) : arrangementLiftNextMoveAction(project),
    compositionTone === "danger" ? blueprintNextMoveAction(project) : patternFillNextMoveAction(project),
    bars < 8 ? patternChainNextMoveAction() : bars < target.targetBars ? chainExpandNextMoveAction() : arrangementLiftNextMoveAction(project),
    masterFinishNextMoveAction(project, analysis),
    mixTone === "good" && analysis.status === "Ready" ? snapshotNextMoveAction(project) : mixReviewNextMoveAction(analysis),
    project.snapshots.length === 0 ? snapshotNextMoveAction(project) : mixReviewNextMoveAction(analysis)
  ];
  const uniqueActions = new Map<string, NextMoveAction>();

  for (const action of candidates) {
    if (!uniqueActions.has(action.id)) {
      uniqueActions.set(action.id, action);
    }
  }

  return [...uniqueActions.values()].slice(0, 4);
}

export function createStructureLensSummary(project: ProjectState): StructureLensSummary {
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

export function createStructureLensActions(project: ProjectState): NextMoveAction[] {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const candidates: NextMoveAction[] = [
    !isDeliveryTargetAligned(project, target) ? deliveryTargetNextMoveAction(project) : arrangementLiftNextMoveAction(project),
    bars < 8 ? patternChainNextMoveAction() : chainExpandNextMoveAction(),
    fullArrangementNextMoveAction(),
    arrangementLiftNextMoveAction(project),
    patternChainNextMoveAction()
  ];
  const uniqueActions = new Map<string, NextMoveAction>();

  for (const action of candidates) {
    if (!uniqueActions.has(action.id)) {
      uniqueActions.set(action.id, action);
    }
  }

  return [...uniqueActions.values()].slice(0, 4);
}

export function createHookReadinessSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): HookReadinessSummary {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const hookBlocks = project.arrangement.filter((block) => block.section === "Hook");
  const hookBars = hookBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  const hookPatternSlots = uniquePatternSlots(hookBlocks.map((block) => block.pattern));
  const focusPatternSlots = hookPatternSlots.length > 0 ? hookPatternSlots : [project.selectedPattern];
  const hookPatterns = focusPatternSlots.map((slot) => project.patterns[slot]);
  const readinessReadyCount = checks.filter((check) => check.tone === "good").length;
  const melodyCount = hookPatterns.reduce((total, pattern) => total + pattern.melodyNotes.length, 0);
  const bassCount = hookPatterns.reduce((total, pattern) => total + pattern.bassNotes.length, 0);
  const chordCount = hookPatterns.reduce((total, pattern) => total + pattern.chordEvents.length, 0);
  const drumCount = hookPatterns.reduce((total, pattern) => total + drumHitCount(pattern), 0);
  const eventCount = melodyCount + bassCount + chordCount + drumCount;
  const contrastSignal = structureHookSignal(project);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const briefFields = sessionBriefFilledFields(project.sessionBrief);
  const stemSpread = stemSpreadDb(stemAnalyses);
  const hookSectionTone: MixCoachTone = hookBars >= 4 ? "good" : hookBlocks.length > 0 ? "warn" : "danger";
  const motifTone: MixCoachTone =
    melodyCount >= 4 && bassCount >= 3 && chordCount >= 1 && drumCount >= 8
      ? "good"
      : eventCount >= 10 && (melodyCount > 0 || chordCount > 0)
        ? "warn"
        : "danger";
  const mixTone: MixCoachTone =
    analysis.status === "Silent"
      ? "danger"
      : analysis.status === "Ready" && audibleStems.length >= 3 && (stemSpread === null || stemSpread <= 18)
        ? "good"
        : "warn";
  const handoffTone: MixCoachTone =
    analysis.status === "Ready" && briefFields >= 3 && audibleStems.length >= Math.min(target.stemGoal, stemTrackIds.length)
      ? "good"
      : analysis.status !== "Silent" && briefFields >= 1
        ? "warn"
        : "danger";
  const hookPatternLabel = focusPatternSlots.join("/");
  const cards: HookReadinessCard[] = [
    {
      id: "section",
      focusId: "section",
      label: "Hook Section",
      value: hookBlocks.length > 0 ? `${hookBlocks.length} block${hookBlocks.length === 1 ? "" : "s"}` : "Missing",
      status: hookBlocks.length > 0 ? "Hook section found" : "Hook section missing",
      detail: `${barCountLabel(hookBars)} hook / ${barCountLabel(bars)} song`,
      focusTarget: "arrange",
      focusLabel: "Arrange",
      tone: hookSectionTone
    },
    {
      id: "motif",
      focusId: "motif",
      label: "Motif",
      value: `${melodyCount} Synth / ${bassCount} 808`,
      status: motifTone === "good" ? "Motif carries" : motifTone === "warn" ? "Motif sketched" : "Motif thin",
      detail: `Pattern ${hookPatternLabel} / ${chordCount} chords / ${drumCount} drums`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: motifTone
    },
    {
      id: "contrast",
      focusId: "contrast",
      label: "Contrast",
      value: contrastSignal.value,
      status: contrastSignal.tone === "good" ? "Lift clear" : contrastSignal.tone === "warn" ? "Lift modest" : "Lift weak",
      detail: contrastSignal.detail,
      focusTarget: "arrange",
      focusLabel: "Arrange",
      tone: contrastSignal.tone
    },
    {
      id: "mix",
      focusId: "mix",
      label: "Mix Support",
      value: analysis.status,
      status: mixTone === "good" ? "Mix supports hook" : mixTone === "warn" ? "Mix needs check" : "No hook signal",
      detail: `${formatDb(analysis.headroomDb)} headroom / ${audibleStems.length}/${stemTrackIds.length} stems`,
      focusTarget: mixTone === "danger" ? "master" : "mix",
      focusLabel: mixTone === "danger" ? "Master" : "Mix",
      tone: mixTone
    },
    {
      id: "handoff",
      focusId: "handoff",
      label: "Handoff",
      value: `${briefFields}/4 brief`,
      status: handoffTone === "good" ? "Hook context ready" : handoffTone === "warn" ? "Context partial" : "Context missing",
      detail: `${target.name} / ${audibleStems.length}/${target.stemGoal} target stems`,
      focusTarget: "deliver",
      focusLabel: "Deliver",
      tone: handoffTone
    }
  ];
  const tone = weakestTone(cards.map((card) => card.tone));
  const readyCount = cards.filter((card) => card.tone === "good").length;
  const headline =
    tone === "good" ? "Hook reads ready" : tone === "warn" ? "Hook needs one pass" : "Hook is not clear yet";
  const detail = `${readyCount}/${cards.length} hook / ${readinessReadyCount}/${checks.length} readiness / Pattern ${hookPatternLabel} / ${target.name}`;

  return {
    headline,
    detail,
    tone,
    cards
  };
}

export function createHookReadinessFocusSummary(
  summary: HookReadinessSummary,
  focusedCardId: HookReadinessFocusId | null
): HookReadinessFocusSummary {
  const focusedCard = focusedCardId ? summary.cards.find((card) => card.id === focusedCardId) ?? null : null;
  const card = focusedCard ?? activeHookReadinessQuickActionCard(summary);

  if (!card) {
    return {
      focusId: null,
      statusLabel: "Hook clear",
      areaLabel: "No hook focus",
      detailLabel: "No Hook Readiness cards available",
      detailTitle: "Hook Readiness has no cards to focus.",
      tone: "warn"
    };
  }

  const statusLabel = focusedCard ? "Focused Hook" : "Hook Focus";
  const detailLabel = `${card.focusLabel} panel / ${card.detail}`;

  return {
    focusId: card.focusId,
    statusLabel,
    areaLabel: `${card.label}: ${card.value}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${card.label}: ${card.value} / ${detailLabel}`,
    tone: card.tone
  };
}

export function createHookReadinessPrioritySummary(summary: HookReadinessSummary): HookReadinessPrioritySummary {
  const card = activeHookReadinessQuickActionCard(summary);

  if (!card) {
    return {
      cardId: null,
      actionLabel: "No hook",
      statusLabel: "Hook priority",
      cardLabel: "No hook card",
      reasonLabel: "No Hook Readiness cards available",
      nextCheckLabel: "Add a Hook block, then return to Hook Readiness.",
      tone: "warn"
    };
  }

  return {
    cardId: card.id,
    actionLabel: "Focus hook",
    statusLabel: hookReadinessPriorityStatus(card),
    cardLabel: `${card.label}: ${card.value}`,
    reasonLabel: hookReadinessPriorityReason(card),
    nextCheckLabel: hookReadinessPriorityNextCheck(card),
    tone: card.tone
  };
}

export function hookReadinessPriorityStatus(card: HookReadinessCard): string {
  switch (card.tone) {
    case "danger":
      return "Fix hook first";
    case "warn":
      return "Review hook first";
    case "good":
      return "Confirm hook lane";
  }
}

export function hookReadinessPriorityReason(card: HookReadinessCard): string {
  switch (card.id) {
    case "section":
      return `${card.status}: Hook section location is the current priority.`;
    case "motif":
      return `${card.status}: Motif density is the current priority.`;
    case "contrast":
      return `${card.status}: Hook lift against the previous section is the current priority.`;
    case "mix":
      return `${card.status}: Mix support during the hook is the current priority.`;
    case "handoff":
      return `${card.status}: Handoff context for the hook is the current priority.`;
  }
}

export function hookReadinessPriorityNextCheck(card: HookReadinessCard): string {
  switch (card.id) {
    case "section":
      return "Cue Hook Loop and confirm the Hook block is easy to find.";
    case "motif":
      return "Use Pattern DNA or Hook Fix, then confirm the Hook motif is memorable.";
    case "contrast":
      return "Check Structure Lens after the next Hook Lift or arrangement move.";
    case "mix":
      return "Check Mix Coach after the next Headroom Mix Fix or manual mix trim.";
    case "handoff":
      return "Review Session Brief and Handoff Pack after filling hook context.";
  }
}

export function createHookReadinessFocusResult(
  card: HookReadinessFocusItem,
  summary: HookReadinessSummary
): HookReadinessFocusResult {
  const summaryCard =
    summary.cards.find((candidate) => candidate.id === card.focusId) ??
    ({
      id: card.focusId,
      focusId: card.focusId,
      label: card.label,
      value: card.value,
      status: "Focused",
      detail: card.detail,
      focusTarget: card.focusTarget,
      focusLabel: card.focusLabel,
      tone: summary.tone
    } satisfies HookReadinessCard);

  return {
    cardId: summaryCard.id,
    status: "Focused",
    title: `${summaryCard.label} hook lane focused`,
    detail: `${summaryCard.value}: ${summaryCard.detail}`,
    destination: reviewQueueFocusLabel(summaryCard.focusTarget),
    metricLabel: "Hook",
    metricValue: hookReadinessFocusResultMetric(summaryCard, summary),
    auditionCue: hookReadinessFocusResultAudition(summaryCard),
    nextCheck: hookReadinessFocusResultNextCheck(summaryCard),
    tone: summaryCard.tone
  };
}

export function hookReadinessFocusResultMetric(card: HookReadinessCard, summary: HookReadinessSummary): string {
  const readyCount = summary.cards.filter((candidate) => candidate.tone === "good").length;
  return `${card.label}: ${card.value} / ${readyCount}/${summary.cards.length} ready`;
}

export function hookReadinessFocusResultAudition(card: HookReadinessCard): string {
  switch (card.id) {
    case "section":
      return "Cue the Hook loop and confirm the hook block enters clearly before editing nearby sections.";
    case "motif":
      return "Loop the Hook and listen for a memorable Synth, chord, or 808 idea before adding density.";
    case "contrast":
      return "Play the hook against the previous section and confirm the lift feels intentional.";
    case "mix":
      return "Play the Full Mix and check whether hook elements stay present without clipping.";
    case "handoff":
      return "Inspect Session Brief and Handoff Pack before sending hook notes or exports.";
  }
}

export function hookReadinessFocusResultNextCheck(card: HookReadinessCard): string {
  switch (card.id) {
    case "section":
      return "Use Arrange or Hook Loop cue, then return to Hook Readiness.";
    case "motif":
      return "Use Pattern DNA or Hook Fix if the motif still feels thin.";
    case "contrast":
      return "Check Structure Lens after any Hook Lift or arrangement move.";
    case "mix":
      return "Use Mix Coach or Mix Fix before pushing the master.";
    case "handoff":
      return "Fill missing brief context before export.";
  }
}

export function activeHookReadinessQuickActionCard(summary: HookReadinessSummary): HookReadinessCard | null {
  return summary.cards.find((card) => card.tone === "danger") ?? summary.cards.find((card) => card.tone === "warn") ?? summary.cards[0] ?? null;
}

export type HookFixAction =
  | {
      kind: "patternChain";
      chain: PatternChainId;
    }
  | {
      kind: "patternVariation";
      preset: PatternVariationPreset;
    }
  | {
      kind: "arrangementMove";
      preset: ArrangementMovePreset;
    }
  | {
      kind: "mixFix";
      preset: MixFixPreset;
    }
  | {
      kind: "sessionBriefStarter";
      pad: SessionBriefStarterPadId;
    };

export type HookFixOption = {
  cardId: HookReadinessCardId;
  fixId: string;
  label: string;
  detail: string;
  group: string;
  action: HookFixAction;
  auditionCue: string;
  nextCheck: string;
};

export type HookFixResultMetric = {
  id: "card" | "summary" | "target";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type HookFixResult = {
  fixId: string;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: HookFixResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export function createHookFixOption(card: HookReadinessCard): HookFixOption {
  switch (card.id) {
    case "section":
      return {
        cardId: card.id,
        fixId: "section-chain",
        label: "8 Bar Chain",
        detail: "Use the existing 8 Bar Pattern Chain to make an editable Hook section.",
        group: "Arrange",
        action: { kind: "patternChain", chain: "eight_bar" },
        auditionCue: "Play the Hook loop and confirm the section is easy to find before adding more blocks.",
        nextCheck: "Return to Hook Readiness and confirm Hook Section is no longer the weakest lane."
      };
    case "motif":
      return {
        cardId: card.id,
        fixId: "motif-variation",
        label: "Hook Variation",
        detail: "Use the existing Hook Pattern Variation to strengthen the selected hook motif.",
        group: "Create",
        action: { kind: "patternVariation", preset: "hook" },
        auditionCue: "Loop the Hook Pattern and confirm drums, 808, chords, and Synth form a clear motif.",
        nextCheck: "Return to Pattern DNA or Hook Readiness before adding another melody move."
      };
    case "contrast":
      return {
        cardId: card.id,
        fixId: "contrast-lift",
        label: "Hook Lift",
        detail: "Use the existing Hook Lift Arrangement Move on the Hook block.",
        group: "Arrange",
        action: { kind: "arrangementMove", preset: "hook_lift" },
        auditionCue: "Play the section before and after the Hook block and listen for lift.",
        nextCheck: "Return to Structure Lens or Hook Readiness before adding another arrangement move."
      };
    case "mix":
      return {
        cardId: card.id,
        fixId: "mix-headroom",
        label: "Headroom Mix Fix",
        detail: "Use the existing Headroom Mix Fix so the hook has safer master space.",
        group: "Mix",
        action: { kind: "mixFix", preset: "headroom" },
        auditionCue: "Play Full Mix and watch headroom while the Hook hits.",
        nextCheck: "Return to Mix Coach if the limiter, low end, or stem spread still needs manual trim."
      };
    case "handoff":
      return {
        cardId: card.id,
        fixId: "handoff-vocal",
        label: "Vocal Brief Starter",
        detail: "Use the existing Vocal Session Brief Starter to fill hook handoff context.",
        group: "Project",
        action: { kind: "sessionBriefStarter", pad: "vocal" },
        auditionCue: "Read the Session Brief against the Hook loop before exporting handoff notes.",
        nextCheck: "Return to Handoff Package Check after the hook context feels specific enough."
      };
  }
}

export function createHookFixResult(
  fix: HookFixOption,
  cardId: HookReadinessCardId,
  beforeProject: ProjectState,
  afterProject: ProjectState
): HookFixResult {
  const beforeSummary = createHookReadinessSummaryForProject(beforeProject);
  const afterSummary = createHookReadinessSummaryForProject(afterProject);
  const beforeCard = beforeSummary.cards.find((card) => card.id === cardId) ?? null;
  const afterCard = afterSummary.cards.find((card) => card.id === cardId) ?? null;
  const metrics: HookFixResultMetric[] = [
    createHookFixResultMetric("card", beforeCard?.label ?? "Card", hookFixCardLabel(beforeCard), hookFixCardLabel(afterCard)),
    createHookFixResultMetric("summary", "Hook", beforeSummary.headline, afterSummary.headline),
    createHookFixResultMetric("target", "Target", hookFixTargetLabel(beforeProject), hookFixTargetLabel(afterProject))
  ];
  const changedCount = metrics.filter((metric) => metric.tone === "good").length;
  const cardLabel = afterCard?.label ?? beforeCard?.label ?? "Hook";

  return {
    fixId: fix.fixId,
    title: `${fix.label} Hook Fix applied`,
    status: changedCount > 0 ? "Applied" : "Already covered",
    detail: `${cardLabel} / ${fix.detail}`,
    scope: hookFixScopeLabel(fix),
    impact: `${changedCount}/${metrics.length} Hook metrics changed`,
    metrics,
    auditionCue: fix.auditionCue,
    nextCheck: fix.nextCheck,
    tone: changedCount > 0 ? "good" : "warn"
  };
}

export function createHookReadinessSummaryForProject(project: ProjectState): HookReadinessSummary {
  const analysis = analyzeExport(project);
  return createHookReadinessSummary(project, createBeatReadinessChecks(project, analysis), analysis, analyzeStemExports(project));
}

export function createHookFixResultMetric(
  id: HookFixResultMetric["id"],
  label: string,
  before: string,
  after: string
): HookFixResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: before === after ? "warn" : "good"
  };
}

export function hookFixCardLabel(card: HookReadinessCard | null): string {
  return card ? `${card.value} / ${card.status}` : "missing";
}

export function hookFixTargetLabel(project: ProjectState): string {
  const target = createHookLoopCueTarget(project);
  return target ? hookLoopCueDetail(target) : `No Hook section / Pattern ${project.selectedPattern}`;
}

export function hookFixScopeLabel(fix: HookFixOption): string {
  switch (fix.action.kind) {
    case "patternChain":
      return `Arrangement / ${patternChainLabel(fix.action.chain)}`;
    case "patternVariation":
      return `Pattern Variation / ${patternVariationPresetLabel(fix.action.preset)}`;
    case "arrangementMove":
      return `Arrangement Move / ${arrangementMovePresetLabel(fix.action.preset)}`;
    case "mixFix":
      return `Mix Fix / ${mixFixPresetLabel(fix.action.preset)}`;
    case "sessionBriefStarter":
      return "Session Brief / Vocal";
  }
}

export type HookLoopCueTarget = {
  index: number;
  startBar: number;
  endBar: number;
  bars: number;
  pattern: PatternSlot;
};

export function createHookLoopCueTarget(project: ProjectState): HookLoopCueTarget | null {
  const index = firstArrangementSectionIndex(project, "Hook");
  if (index === null) {
    return null;
  }

  const block = project.arrangement[index];
  if (!block) {
    return null;
  }

  const startBar = arrangementStartBar(project, index);
  const bars = normalizeArrangementBars(block.bars);
  return {
    index,
    startBar,
    endBar: startBar + bars,
    bars,
    pattern: block.pattern
  };
}

export function hookLoopCueDetail(target: HookLoopCueTarget): string {
  return `Block ${target.index + 1} Hook / Bars ${target.startBar + 1}-${target.endBar} / Pattern ${
    target.pattern
  } / ${barCountLabel(target.bars)}`;
}

export function createToplineSpaceSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): ToplineSpaceSummary {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const hookBlocks = project.arrangement.filter((block) => block.section === "Hook");
  const hookBars = hookBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  const hookPatternSlots = uniquePatternSlots(hookBlocks.map((block) => block.pattern));
  const focusPatternSlots = hookPatternSlots.length > 0 ? hookPatternSlots : [project.selectedPattern];
  const focusPatterns = focusPatternSlots.map((slot) => project.patterns[slot]);
  const patternCount = Math.max(1, focusPatterns.length);
  const melodyCount = focusPatterns.reduce((total, pattern) => total + pattern.melodyNotes.length, 0);
  const bassCount = focusPatterns.reduce((total, pattern) => total + pattern.bassNotes.length, 0);
  const chordCount = focusPatterns.reduce((total, pattern) => total + pattern.chordEvents.length, 0);
  const drumCount = focusPatterns.reduce((total, pattern) => total + drumHitCount(pattern), 0);
  const averageMelody = melodyCount / patternCount;
  const averageBass = bassCount / patternCount;
  const averageChords = chordCount / patternCount;
  const averageDrums = drumCount / patternCount;
  const audibleStems = audibleStemTracks(stemAnalyses);
  const stemSpread = stemSpreadDb(stemAnalyses);
  const briefFields = sessionBriefFilledFields(project.sessionBrief);
  const readinessReadyCount = checks.filter((check) => check.tone === "good").length;
  const hasVocalTarget = target.id === "vocal_session" || target.mixPosture === "vocal_headroom";
  const hookPatternLabel = focusPatternSlots.join("/");
  const rhythmTone: MixCoachTone =
    averageDrums >= 8 && averageDrums <= 26 && averageBass >= 2 && averageBass <= 8
      ? "good"
      : averageDrums >= 6 && averageBass >= 1 && averageBass <= 11
        ? "warn"
        : "danger";
  const leadTone: MixCoachTone =
    averageMelody <= 5 && averageChords <= 5 ? "good" : averageMelody <= 9 && averageChords <= 8 ? "warn" : "danger";
  const arrangementTone: MixCoachTone =
    hookBars >= 4 && bars >= 8 ? "good" : hookBlocks.length > 0 && hookBars >= 2 ? "warn" : "danger";
  const mixTone: MixCoachTone =
    analysis.status === "Silent"
      ? "danger"
      : analysis.headroomDb >= 3 && audibleStems.length >= 3 && (stemSpread === null || stemSpread <= 16)
        ? "good"
        : analysis.headroomDb >= 1.5 && audibleStems.length >= 2
          ? "warn"
          : "danger";
  const briefTone: MixCoachTone =
    briefFields >= (hasVocalTarget ? 3 : 2) ? "good" : briefFields >= 1 || !hasVocalTarget ? "warn" : "danger";
  const cards: ToplineSpaceCard[] = [
    {
      id: "pocket",
      focusId: "pocket",
      label: "Pocket",
      value: `${Math.round(averageDrums)} drum / ${Math.round(averageBass)} 808`,
      status: rhythmTone === "good" ? "Pocket leaves room" : rhythmTone === "warn" ? "Pocket needs trim" : "Pocket unclear",
      detail: `Pattern ${hookPatternLabel} / average per pattern`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: rhythmTone
    },
    {
      id: "lead",
      focusId: "lead",
      label: "Lead Room",
      value: `${Math.round(averageMelody)} Synth / ${Math.round(averageChords)} chords`,
      status: leadTone === "good" ? "Lead lane open" : leadTone === "warn" ? "Lead lane busy" : "Lead lane crowded",
      detail: `${melodyCount} Synth notes / ${chordCount} chords across focus patterns`,
      focusTarget: "compose",
      focusLabel: "Compose",
      tone: leadTone
    },
    {
      id: "arrangement",
      focusId: "arrangement",
      label: "Vocal Window",
      value: hookBlocks.length > 0 ? barCountLabel(hookBars) : "Missing",
      status: arrangementTone === "good" ? "Window clear" : arrangementTone === "warn" ? "Window short" : "Window missing",
      detail: `${hookBlocks.length} hook block${hookBlocks.length === 1 ? "" : "s"} / ${barCountLabel(bars)} song`,
      focusTarget: "arrange",
      focusLabel: "Arrange",
      tone: arrangementTone
    },
    {
      id: "mix",
      focusId: "mix",
      label: "Headroom",
      value: formatDb(analysis.headroomDb),
      status: mixTone === "good" ? "Vocal headroom" : mixTone === "warn" ? "Check headroom" : "No safe space",
      detail: `${analysis.status} / ${audibleStems.length}/${stemTrackIds.length} stems / spread ${stemSpread === null ? "n/a" : formatDb(stemSpread)}`,
      focusTarget: mixTone === "danger" ? "master" : "mix",
      focusLabel: mixTone === "danger" ? "Master" : "Mix",
      tone: mixTone
    },
    {
      id: "brief",
      focusId: "brief",
      label: "Artist Cue",
      value: `${briefFields}/4 brief`,
      status: briefTone === "good" ? "Topline context set" : briefTone === "warn" ? "Context partial" : "Context missing",
      detail: `${target.name} / ${hasVocalTarget ? "vocal target" : "general target"}`,
      focusTarget: "deliver",
      focusLabel: "Deliver",
      tone: briefTone
    }
  ];
  const tone = weakestTone(cards.map((card) => card.tone));
  const readyCount = cards.filter((card) => card.tone === "good").length;
  const headline =
    tone === "good" ? "Topline has room" : tone === "warn" ? "Topline needs one pass" : "Topline feels crowded";
  const detail = `${readyCount}/${cards.length} space / ${readinessReadyCount}/${checks.length} readiness / Pattern ${hookPatternLabel} / ${target.name}`;

  return {
    headline,
    detail,
    tone,
    cards
  };
}

export function createToplineSpaceFocusSummary(
  summary: ToplineSpaceSummary,
  focusedCardId: ToplineSpaceFocusId | null
): ToplineSpaceFocusSummary {
  const focusedCard = focusedCardId ? summary.cards.find((card) => card.id === focusedCardId) ?? null : null;
  const card = focusedCard ?? activeToplineSpaceQuickActionCard(summary);

  if (!card) {
    return {
      focusId: null,
      statusLabel: "Topline clear",
      areaLabel: "No topline focus",
      detailLabel: "No Topline Space cards available",
      detailTitle: "Topline Space has no cards to focus.",
      tone: "warn"
    };
  }

  const statusLabel = focusedCard ? "Focused Topline" : "Topline Focus";
  const detailLabel = `${card.focusLabel} panel / ${card.detail}`;

  return {
    focusId: card.focusId,
    statusLabel,
    areaLabel: `${card.label}: ${card.value}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${card.label}: ${card.value} / ${detailLabel}`,
    tone: card.tone
  };
}

export function createToplineSpacePrioritySummary(summary: ToplineSpaceSummary): ToplineSpacePrioritySummary {
  const card = activeToplineSpaceQuickActionCard(summary);

  if (!card) {
    return {
      cardId: null,
      actionLabel: "No topline",
      statusLabel: "Topline priority",
      cardLabel: "No topline card",
      reasonLabel: "No Topline Space cards available",
      nextCheckLabel: "Add a Hook block or selected Pattern, then return to Topline Space.",
      tone: "warn"
    };
  }

  return {
    cardId: card.id,
    actionLabel: "Focus topline",
    statusLabel: toplineSpacePriorityStatus(card),
    cardLabel: `${card.label}: ${card.value}`,
    reasonLabel: toplineSpacePriorityReason(card),
    nextCheckLabel: toplineSpacePriorityNextCheck(card),
    tone: card.tone
  };
}

export function toplineSpacePriorityStatus(card: ToplineSpaceCard): string {
  switch (card.tone) {
    case "danger":
      return "Fix topline space first";
    case "warn":
      return "Review topline space first";
    case "good":
      return "Confirm topline lane";
  }
}

export function toplineSpacePriorityReason(card: ToplineSpaceCard): string {
  switch (card.id) {
    case "pocket":
      return `${card.status}: Rhythm pocket is the current vocal-space priority.`;
    case "lead":
      return `${card.status}: Lead density is the current vocal-space priority.`;
    case "arrangement":
      return `${card.status}: Hook window clarity is the current vocal-space priority.`;
    case "mix":
      return `${card.status}: Mix headroom is the current vocal-space priority.`;
    case "brief":
      return `${card.status}: Artist context is the current vocal-space priority.`;
  }
}

export function toplineSpacePriorityNextCheck(card: ToplineSpaceCard): string {
  switch (card.id) {
    case "pocket":
      return "Cue Topline loop and confirm drums plus 808 leave a stable pocket.";
    case "lead":
      return "Use Clear Tail or Pattern DNA, then confirm the lead lane leaves room.";
    case "arrangement":
      return "Check Song Form or Topline Loop before changing the hook window.";
    case "mix":
      return "Check Mix Coach after the next Headroom Mix Fix or manual space trim.";
    case "brief":
      return "Review Session Brief and Handoff Pack after filling artist context.";
  }
}

export function createToplineSpaceFocusResult(
  card: ToplineSpaceFocusItem,
  summary: ToplineSpaceSummary
): ToplineSpaceFocusResult {
  const summaryCard =
    summary.cards.find((candidate) => candidate.id === card.focusId) ??
    ({
      id: card.focusId,
      focusId: card.focusId,
      label: card.label,
      value: card.value,
      status: "Focused",
      detail: card.detail,
      focusTarget: card.focusTarget,
      focusLabel: card.focusLabel,
      tone: summary.tone
    } satisfies ToplineSpaceCard);

  return {
    cardId: summaryCard.id,
    status: "Focused",
    title: `${summaryCard.label} topline lane focused`,
    detail: `${summaryCard.value}: ${summaryCard.detail}`,
    destination: reviewQueueFocusLabel(summaryCard.focusTarget),
    metricLabel: "Topline",
    metricValue: toplineSpaceFocusResultMetric(summaryCard, summary),
    auditionCue: toplineSpaceFocusResultAudition(summaryCard),
    nextCheck: toplineSpaceFocusResultNextCheck(summaryCard),
    tone: summaryCard.tone
  };
}

export function toplineSpaceFocusResultMetric(card: ToplineSpaceCard, summary: ToplineSpaceSummary): string {
  const readyCount = summary.cards.filter((candidate) => candidate.tone === "good").length;
  return `${card.label}: ${card.value} / ${readyCount}/${summary.cards.length} open`;
}

export function toplineSpaceFocusResultAudition(card: ToplineSpaceCard): string {
  switch (card.id) {
    case "pocket":
      return "Loop the Hook or selected Pattern and check whether drums and 808 leave a stable topline pocket.";
    case "lead":
      return "Listen for lead/Synth density against the hook window before adding a vocal or top melody.";
    case "arrangement":
      return "Cue the topline loop and confirm the hook window gives a clear entry point.";
    case "mix":
      return "Play the Full Mix and check headroom and vocal space before mastering.";
    case "brief":
      return "Inspect Session Brief artist, vibe, and reference notes before deciding topline space is ready.";
  }
}

export function toplineSpaceFocusResultNextCheck(card: ToplineSpaceCard): string {
  switch (card.id) {
    case "pocket":
      return "Use Groove Compass or Pocket Groove Feel before adding more lead density.";
    case "lead":
      return "Use Clear Tail or Pattern DNA if the lead lane still crowds the topline.";
    case "arrangement":
      return "Return to Arrange or Topline Loop before changing section length.";
    case "mix":
      return "Use Mix Coach or Headroom Mix Fix if the topline still feels masked.";
    case "brief":
      return "Fill missing brief context before export or handoff.";
  }
}

export function activeToplineSpaceQuickActionCard(summary: ToplineSpaceSummary): ToplineSpaceCard | null {
  return summary.cards.find((card) => card.tone === "danger") ?? summary.cards.find((card) => card.tone === "warn") ?? summary.cards[0] ?? null;
}

export type ToplineLoopCueTarget =
  | {
      mode: "block";
      index: number;
      startBar: number;
      endBar: number;
      bars: number;
      pattern: PatternSlot;
    }
  | {
      mode: "pattern";
      pattern: PatternSlot;
      bars: number;
    };

export function createToplineLoopCueTarget(project: ProjectState): ToplineLoopCueTarget {
  const index = firstArrangementSectionIndex(project, "Hook");
  if (index !== null) {
    const block = project.arrangement[index];
    if (block) {
      const startBar = arrangementStartBar(project, index);
      const bars = normalizeArrangementBars(block.bars);
      return {
        mode: "block",
        index,
        startBar,
        endBar: startBar + bars,
        bars,
        pattern: block.pattern
      };
    }
  }

  return {
    mode: "pattern",
    pattern: project.selectedPattern,
    bars: 2
  };
}

export function toplineLoopCueDetail(target: ToplineLoopCueTarget): string {
  if (target.mode === "block") {
    return `Hook Block ${target.index + 1} / Bars ${target.startBar + 1}-${target.endBar} / Pattern ${
      target.pattern
    } / ${barCountLabel(target.bars)}`;
  }

  return `Pattern ${target.pattern} / ${barCountLabel(target.bars)} pocket`;
}

export type ToplineFixAction =
  | {
      kind: "grooveFeel";
      feel: GrooveFeelId;
    }
  | {
      kind: "patternFill";
      preset: PatternFillPreset;
    }
  | {
      kind: "patternChain";
      chain: PatternChainId;
    }
  | {
      kind: "mixFix";
      preset: MixFixPreset;
    }
  | {
      kind: "sessionBriefStarter";
      pad: SessionBriefStarterPadId;
    };

export type ToplineFixOption = {
  cardId: ToplineSpaceCardId;
  fixId: string;
  label: string;
  detail: string;
  group: string;
  action: ToplineFixAction;
  auditionCue: string;
  nextCheck: string;
};

export type ToplineFixResultMetric = {
  id: "card" | "summary" | "target";
  label: string;
  before: string;
  after: string;
  tone: MixCoachTone;
};

export type ToplineFixResult = {
  fixId: string;
  title: string;
  status: string;
  detail: string;
  scope: string;
  impact: string;
  metrics: ToplineFixResultMetric[];
  auditionCue: string;
  nextCheck: string;
  tone: MixCoachTone;
};

export function createToplineFixOption(card: ToplineSpaceCard): ToplineFixOption {
  switch (card.id) {
    case "pocket":
      return {
        cardId: card.id,
        fixId: "pocket-feel",
        label: "Pocket Feel",
        detail: "Apply the existing Pocket Groove Feel to the Topline Pattern.",
        group: "Create",
        action: { kind: "grooveFeel", feel: "pocket" },
        auditionCue: "Loop the Topline Pattern and listen for drum/808 space before changing notes.",
        nextCheck: "Return to Topline Space and confirm Pocket is no longer the weakest lane."
      };
    case "lead":
      return {
        cardId: card.id,
        fixId: "lead-clear-tail",
        label: "Clear Tail",
        detail: "Use the existing Clear Tail Pattern Fill to trim end-of-loop lead density.",
        group: "Create",
        action: { kind: "patternFill", preset: "clear_tail" },
        auditionCue: "Loop the Topline Pattern and listen for a cleaner reply space after bar turns.",
        nextCheck: "Return to Lead Room before adding another melody, chord, or contour move."
      };
    case "arrangement":
      return {
        cardId: card.id,
        fixId: "window-chain",
        label: "8 Bar Chain",
        detail: "Use the existing 8 Bar Pattern Chain to create a Hook window.",
        group: "Arrange",
        action: { kind: "patternChain", chain: "eight_bar" },
        auditionCue: "Play the Hook block loop and check whether the vocal window is easy to locate.",
        nextCheck: "Return to Song Form or Topline Space before expanding the chain into a full form."
      };
    case "mix":
      return {
        cardId: card.id,
        fixId: "headroom-mix",
        label: "Headroom Mix Fix",
        detail: "Use the existing Headroom Mix Fix for vocal-safe master space.",
        group: "Mix",
        action: { kind: "mixFix", preset: "headroom" },
        auditionCue: "Play Full Mix and watch the Export meter headroom after the fix.",
        nextCheck: "Return to Mix Coach if the limiter or stem spread still needs manual trim."
      };
    case "brief":
      return {
        cardId: card.id,
        fixId: "brief-vocal",
        label: "Vocal Brief Starter",
        detail: "Use the existing Vocal Session Brief Starter to fill blank artist context fields.",
        group: "Project",
        action: { kind: "sessionBriefStarter", pad: "vocal" },
        auditionCue: "Read the Session Brief aloud against the Topline loop before exporting handoff notes.",
        nextCheck: "Return to Handoff Pack after the artist cue feels specific enough."
      };
  }
}

export function createToplineFixResult(
  fix: ToplineFixOption,
  cardId: ToplineSpaceCardId,
  beforeProject: ProjectState,
  afterProject: ProjectState
): ToplineFixResult {
  const beforeSummary = createToplineSpaceSummaryForProject(beforeProject);
  const afterSummary = createToplineSpaceSummaryForProject(afterProject);
  const beforeCard = beforeSummary.cards.find((card) => card.id === cardId) ?? null;
  const afterCard = afterSummary.cards.find((card) => card.id === cardId) ?? null;
  const metrics: ToplineFixResultMetric[] = [
    createToplineFixResultMetric(
      "card",
      beforeCard?.label ?? "Card",
      toplineFixCardLabel(beforeCard),
      toplineFixCardLabel(afterCard)
    ),
    createToplineFixResultMetric("summary", "Topline", beforeSummary.headline, afterSummary.headline),
    createToplineFixResultMetric("target", "Target", toplineFixTargetLabel(beforeProject), toplineFixTargetLabel(afterProject))
  ];
  const changedCount = metrics.filter((metric) => metric.tone === "good").length;
  const cardLabel = afterCard?.label ?? beforeCard?.label ?? "Topline";

  return {
    fixId: fix.fixId,
    title: `${fix.label} Topline Fix applied`,
    status: changedCount > 0 ? "Applied" : "Already covered",
    detail: `${cardLabel} / ${fix.detail}`,
    scope: toplineFixScopeLabel(fix),
    impact: `${changedCount}/${metrics.length} Topline metrics changed`,
    metrics,
    auditionCue: fix.auditionCue,
    nextCheck: fix.nextCheck,
    tone: changedCount > 0 ? "good" : "warn"
  };
}

export function createToplineSpaceSummaryForProject(project: ProjectState): ToplineSpaceSummary {
  const analysis = analyzeExport(project);
  return createToplineSpaceSummary(project, createBeatReadinessChecks(project, analysis), analysis, analyzeStemExports(project));
}

export function createToplineFixResultMetric(
  id: ToplineFixResultMetric["id"],
  label: string,
  before: string,
  after: string
): ToplineFixResultMetric {
  return {
    id,
    label,
    before,
    after,
    tone: before === after ? "warn" : "good"
  };
}

export function toplineFixCardLabel(card: ToplineSpaceCard | null): string {
  return card ? `${card.value} / ${card.status}` : "missing";
}

export function toplineFixTargetLabel(project: ProjectState): string {
  return toplineLoopCueDetail(createToplineLoopCueTarget(project));
}

export function toplineFixScopeLabel(fix: ToplineFixOption): string {
  switch (fix.action.kind) {
    case "grooveFeel":
      return `Pattern Groove / ${fix.action.feel}`;
    case "patternFill":
      return `Pattern Fill / ${patternFillPresetLabel(fix.action.preset)}`;
    case "patternChain":
      return `Arrangement / ${patternChainLabel(fix.action.chain)}`;
    case "mixFix":
      return `Mix Fix / ${mixFixPresetLabel(fix.action.preset)}`;
    case "sessionBriefStarter":
      return "Session Brief / Vocal";
  }
}

export function createArrangementMuteMapSummary(project: ProjectState): ArrangementMuteMapSummary {
  const totalBlocks = project.arrangement.length;
  const totalBars = arrangementTotalBars(project);
  const normalizedBlocks = project.arrangement.map((block) => ({
    ...block,
    bars: normalizeArrangementBars(block.bars),
    mutedTracks: normalizeArrangementMutedTracks(block.mutedTracks)
  }));
  const lanes: ArrangementMuteMapLane[] = arrangementMuteTrackIds.map((track) => {
    const mutedBlocks = normalizedBlocks.filter((block) => block.mutedTracks.includes(track));
    const mutedBars = mutedBlocks.reduce((total, block) => total + block.bars, 0);
    const tone = arrangementMuteMapLaneTone(mutedBlocks.length, totalBlocks, mutedBars, totalBars);
    const label = arrangementMuteTrackLabel(track);
    const status =
      totalBlocks === 0
        ? "No blocks"
        : mutedBlocks.length === 0
          ? "Always live"
          : mutedBlocks.length === totalBlocks
            ? "Muted all song"
            : "Contrast set";

    return {
      id: track,
      label,
      value: mutedBlocks.length === 0 ? "0 blocks" : `${barCountLabel(mutedBars)} muted`,
      status,
      detail: `${mutedBlocks.length}/${totalBlocks} blocks / ${barCountLabel(totalBars)} song`,
      focusLabel: "Arrange",
      mutedBlocks: mutedBlocks.length,
      mutedBars,
      tone
    };
  });
  const segments = createArrangementMuteMapSegments(project);
  const lanesWithMutes = lanes.filter((lane) => lane.mutedBlocks > 0).length;
  const totalMuteMarks = normalizedBlocks.reduce((total, block) => total + block.mutedTracks.length, 0);
  const allSongMuted = lanes.some((lane) => totalBlocks > 0 && lane.mutedBlocks === totalBlocks);
  const tone: MixCoachTone =
    totalBlocks === 0 || allSongMuted ? "danger" : totalMuteMarks === 0 || lanesWithMutes <= 1 ? "warn" : "good";
  const headline =
    tone === "good"
      ? "Layer space is mapped"
      : tone === "warn"
        ? totalMuteMarks === 0
          ? "No block mutes yet"
          : "Mute map is light"
        : "Mute map needs review";
  const detail = `${totalMuteMarks} block mute${totalMuteMarks === 1 ? "" : "s"} / ${lanesWithMutes}/${arrangementMuteTrackIds.length} lanes / ${barCountLabel(totalBars)}`;

  return {
    headline,
    detail,
    tone,
    lanes,
    segments
  };
}

export function createArrangementMuteMapSegments(project: ProjectState): ArrangementMuteMapSegment[] {
  let startBar = 1;
  return project.arrangement.map((block, index) => {
    const bars = normalizeArrangementBars(block.bars);
    const endBar = startBar + bars - 1;
    const mutedTracks = normalizeArrangementMutedTracks(block.mutedTracks);
    const segment: ArrangementMuteMapSegment = {
      index,
      section: block.section,
      pattern: block.pattern,
      startBar,
      endBar,
      bars,
      mutedTracks,
      muteCount: mutedTracks.length,
      tone: arrangementMuteMapSegmentTone(mutedTracks.length)
    };
    startBar = endBar + 1;
    return segment;
  });
}

export function arrangementMuteMapLaneTone(
  mutedBlocks: number,
  totalBlocks: number,
  mutedBars: number,
  totalBars: number
): MixCoachTone {
  if (totalBlocks === 0 || mutedBlocks === totalBlocks) {
    return "danger";
  }
  if (mutedBlocks === 0 || mutedBars > totalBars * 0.75) {
    return "warn";
  }
  return "good";
}

export function arrangementMuteMapSegmentTone(muteCount: number): MixCoachTone {
  if (muteCount >= arrangementMuteTrackIds.length) {
    return "danger";
  }
  if (muteCount >= 3) {
    return "warn";
  }
  return "good";
}

export function createArrangementMuteMapFocusSummary(
  summary: ArrangementMuteMapSummary,
  focusedLaneId: ArrangementMuteMapFocusId | null
): ArrangementMuteMapFocusSummary {
  const focusedLane = focusedLaneId ? summary.lanes.find((lane) => lane.id === focusedLaneId) ?? null : null;
  const lane = focusedLane ?? activeArrangementMuteMapQuickActionLane(summary);

  if (!lane) {
    return {
      focusId: null,
      statusLabel: "No mute lane",
      areaLabel: "No arrangement focus",
      detailLabel: "Add arrangement blocks before scanning mutes",
      detailTitle: "Arrangement Mute Map has no lanes to focus.",
      tone: "danger"
    };
  }

  const statusLabel = focusedLane ? "Focused Mute Map" : "Mute Map Focus";
  const detailLabel = `${lane.status} / ${lane.detail}`;

  return {
    focusId: lane.id,
    statusLabel,
    areaLabel: `${lane.label}: ${lane.value}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${lane.label}: ${lane.value} / ${detailLabel}`,
    tone: lane.tone
  };
}

export function createArrangementMuteMapPrioritySummary(summary: ArrangementMuteMapSummary): ArrangementMuteMapPrioritySummary {
  const lane = activeArrangementMuteMapQuickActionLane(summary);

  if (!lane) {
    return {
      laneId: null,
      actionLabel: "No lane",
      statusLabel: "No mute priority",
      laneLabel: "No arrangement lane",
      reasonLabel: "Add arrangement blocks before checking layer dropouts",
      nextCheckLabel: "Next: build a song form before editing mutes.",
      detailTitle: "Arrangement Mute Map priority has no available lane.",
      tone: "danger"
    };
  }

  const statusLabel = arrangementMuteMapPriorityStatus(lane);
  const laneLabel = `${lane.label}: ${lane.value}`;
  const reasonLabel = arrangementMuteMapPriorityReason(lane, summary);
  const nextCheckLabel = arrangementMuteMapPriorityNextCheck(lane);

  return {
    laneId: lane.id,
    actionLabel: `Focus ${lane.label}`,
    statusLabel,
    laneLabel,
    reasonLabel,
    nextCheckLabel,
    detailTitle: `${statusLabel} / ${laneLabel} / ${reasonLabel} / ${nextCheckLabel}`,
    tone: lane.tone
  };
}

export function arrangementMuteMapPriorityStatus(lane: ArrangementMuteMapLane): string {
  if (lane.status === "No blocks") {
    return "Build form first";
  }
  if (lane.tone === "danger") {
    return "Review first";
  }
  if (lane.tone === "warn") {
    return lane.mutedBlocks === 0 ? "Add contrast check" : "Contrast check";
  }
  return "Priority lane";
}

export function arrangementMuteMapPriorityReason(lane: ArrangementMuteMapLane, summary: ArrangementMuteMapSummary): string {
  const mappedCount = summary.lanes.filter((candidate) => candidate.mutedBlocks > 0).length;

  if (lane.status === "No blocks") {
    return "No arrangement blocks available / build song form first";
  }
  if (lane.tone === "danger") {
    return `${lane.status} / confirm this layer is not missing from the whole beat`;
  }
  if (lane.mutedBlocks === 0) {
    return `${lane.status} / ${mappedCount}/${summary.lanes.length} lanes currently create space`;
  }
  if (lane.tone === "warn") {
    return `${lane.status} / ${lane.detail} needs a song-form check`;
  }
  return `${lane.status} / ${lane.detail} is the first mapped layer to audition`;
}

export function arrangementMuteMapPriorityNextCheck(lane: ArrangementMuteMapLane): string {
  if (lane.status === "No blocks") {
    return "Next: add or restore arrangement blocks before editing mutes.";
  }
  if (lane.tone === "danger") {
    return "Next: play Song and restore the lane only if the full-song mute is unintended.";
  }
  if (lane.mutedBlocks === 0) {
    return "Next: decide whether the song needs a drop, build, or space moment.";
  }
  if (lane.tone === "warn") {
    return "Next: compare Song Form and Transition Map before changing mutes.";
  }
  return "Next: audition this lane, then check transition handoffs.";
}

export function createArrangementMuteMapFocusResult(
  lane: ArrangementMuteMapLane,
  summary: ArrangementMuteMapSummary
): ArrangementMuteMapFocusResult {
  const summaryLane = summary.lanes.find((candidate) => candidate.id === lane.id) ?? lane;

  return {
    laneId: summaryLane.id,
    status: "Focused",
    title: `${summaryLane.label} mute lane focused`,
    detail: `${summaryLane.value}: ${summaryLane.detail}`,
    destination: reviewQueueFocusLabel("arrange"),
    metricLabel: "Mute Map",
    metricValue: arrangementMuteMapFocusResultMetric(summaryLane, summary),
    auditionCue: arrangementMuteMapFocusResultAudition(summaryLane),
    nextCheck: arrangementMuteMapFocusResultNextCheck(summaryLane),
    tone: summaryLane.tone
  };
}

export function arrangementMuteMapFocusResultMetric(lane: ArrangementMuteMapLane, summary: ArrangementMuteMapSummary): string {
  const mappedCount = summary.lanes.filter((candidate) => candidate.mutedBlocks > 0).length;
  return `${lane.label}: ${lane.value} / ${mappedCount}/${summary.lanes.length} lanes mapped`;
}

export function arrangementMuteMapFocusResultAudition(lane: ArrangementMuteMapLane): string {
  if (lane.mutedBlocks === 0) {
    return `Play the arrangement and confirm ${lane.label} should stay live through every section.`;
  }

  return `Play Song playback and follow where ${lane.label} drops out across sections.`;
}

export function arrangementMuteMapFocusResultNextCheck(lane: ArrangementMuteMapLane): string {
  if (lane.tone === "danger") {
    return "Use selected-block mute controls only if the lane is unintentionally muted for the full song.";
  }
  if (lane.tone === "warn") {
    return "Check Song Form Overview before deciding whether this lane needs more drop or build contrast.";
  }
  return "Use Arrangement Transition Map next to confirm the lane changes support handoffs.";
}

export function activeArrangementMuteMapQuickActionLane(summary: ArrangementMuteMapSummary): ArrangementMuteMapLane | null {
  return summary.lanes.find((lane) => lane.tone === "danger") ?? summary.lanes.find((lane) => lane.tone === "warn") ?? summary.lanes[0] ?? null;
}

export function createArrangementTransitionMapSummary(project: ProjectState): ArrangementTransitionMapSummary {
  const blocks = createArrangementTransitionBlocks(project);
  const transitions: ArrangementTransitionMapTransition[] = [];

  for (let index = 0; index < blocks.length - 1; index += 1) {
    const from = blocks[index];
    const to = blocks[index + 1];
    const energyDelta = to.energy - from.energy;
    const eventDelta = to.eventCount - from.eventCount;
    const patternChanged = from.pattern !== to.pattern;
    const sectionChanged = from.section !== to.section;
    const mutedAdded = to.mutedTracks.filter((track) => !from.mutedTracks.includes(track));
    const mutedRemoved = from.mutedTracks.filter((track) => !to.mutedTracks.includes(track));
    const muteChangeCount = mutedAdded.length + mutedRemoved.length;
    const strongEnergyMove = Math.abs(energyDelta) >= 0.18;
    const modestEnergyMove = Math.abs(energyDelta) >= 0.1;
    const eventShift = Math.abs(eventDelta) >= 4;
    const contrastScore = [patternChanged, strongEnergyMove, muteChangeCount > 0, eventShift].filter(Boolean).length;
    const tone: MixCoachTone =
      !patternChanged && !modestEnergyMove && muteChangeCount === 0 && !eventShift
        ? "danger"
        : contrastScore <= 1 && !strongEnergyMove
          ? "warn"
          : "good";
    const status =
      tone === "danger"
        ? "Flat handoff"
        : energyDelta >= 0.18
          ? "Build turn"
          : energyDelta <= -0.18
            ? "Drop turn"
            : patternChanged
              ? "Pattern turn"
              : muteChangeCount > 0
                ? "Layer turn"
                : sectionChanged
                  ? "Section turn"
                  : "Subtle turn";
    const energyLabel = `Energy ${signedPercentLabel(energyDelta)}`;
    const patternLabel = patternChanged ? `Pattern ${from.pattern}->${to.pattern}` : `Pattern ${to.pattern} held`;
    const muteLabel = arrangementTransitionMuteLabel(mutedAdded, mutedRemoved);

    transitions.push({
      id: index,
      fromIndex: from.index,
      toIndex: to.index,
      fromSection: from.section,
      toSection: to.section,
      fromPattern: from.pattern,
      toPattern: to.pattern,
      boundaryBar: to.startBar,
      value: `${from.section} -> ${to.section}`,
      status,
      detail: `Bar ${to.startBar} / ${from.eventCount}->${to.eventCount} events / ${sectionChanged ? "section change" : "same section"}`,
      energyLabel,
      patternLabel,
      muteLabel,
      focusLabel: "Arrange",
      tone
    });
  }

  const dangerCount = transitions.filter((transition) => transition.tone === "danger").length;
  const warnCount = transitions.filter((transition) => transition.tone === "warn").length;
  const goodCount = transitions.filter((transition) => transition.tone === "good").length;
  const tone: MixCoachTone =
    transitions.length === 0 ? "danger" : dangerCount > 0 ? "danger" : warnCount > 0 ? "warn" : "good";
  const headline =
    transitions.length === 0
      ? "No transitions yet"
      : dangerCount > 0
        ? `${dangerCount} transition${dangerCount === 1 ? "" : "s"} need contrast`
        : warnCount > 0
          ? "Transition contrast is light"
          : "Transitions show contrast";
  const detail =
    transitions.length === 0
      ? "Add at least two arrangement blocks to scan handoffs"
      : `${transitions.length} handoff${transitions.length === 1 ? "" : "s"} / ${goodCount} ready / ${
          warnCount + dangerCount
        } review`;

  return {
    headline,
    detail,
    tone,
    transitions
  };
}

export function createArrangementTransitionBlocks(project: ProjectState): Array<{
  index: number;
  section: ArrangementSection;
  pattern: PatternSlot;
  startBar: number;
  endBar: number;
  energy: number;
  mutedTracks: ArrangementMuteTrack[];
  eventCount: number;
}> {
  let startBar = 1;
  return project.arrangement.map((block, index) => {
    const bars = normalizeArrangementBars(block.bars);
    const endBar = startBar + bars - 1;
    const result = {
      index,
      section: block.section,
      pattern: block.pattern,
      startBar,
      endBar,
      energy: normalizeArrangementEnergy(block.energy),
      mutedTracks: normalizeArrangementMutedTracks(block.mutedTracks),
      eventCount: patternEventTotal(project.patterns[block.pattern])
    };
    startBar = endBar + 1;
    return result;
  });
}

export function arrangementTransitionMuteLabel(added: ArrangementMuteTrack[], removed: ArrangementMuteTrack[]): string {
  const addedLabel = added.length > 0 ? `Mute +${added.map(arrangementMuteTrackLabel).join("/")}` : "";
  const removedLabel = removed.length > 0 ? `Live +${removed.map(arrangementMuteTrackLabel).join("/")}` : "";
  return [addedLabel, removedLabel].filter(Boolean).join(" / ") || "Mutes held";
}

export function createArrangementTransitionMapFocusSummary(
  summary: ArrangementTransitionMapSummary,
  focusedTransitionId: ArrangementTransitionMapFocusId | null
): ArrangementTransitionMapFocusSummary {
  const focusedTransition =
    focusedTransitionId === null ? null : summary.transitions.find((transition) => transition.id === focusedTransitionId) ?? null;
  const transition = focusedTransition ?? activeArrangementTransitionMapQuickActionTransition(summary);

  if (!transition) {
    return {
      focusId: null,
      statusLabel: "No transition",
      areaLabel: "No handoff focus",
      detailLabel: "Add arrangement blocks before scanning transitions",
      detailTitle: "Arrangement Transition Map has no transitions to focus.",
      tone: "danger"
    };
  }

  const statusLabel = focusedTransition ? "Focused Transition" : "Transition Focus";
  const detailLabel = `${transition.energyLabel} / ${transition.patternLabel} / ${transition.muteLabel}`;

  return {
    focusId: transition.id,
    statusLabel,
    areaLabel: `${transition.value}: ${transition.status}`,
    detailLabel,
    detailTitle: `${statusLabel} / ${transition.value}: ${transition.status} / ${detailLabel}`,
    tone: transition.tone
  };
}

export function createArrangementTransitionMapPrioritySummary(
  summary: ArrangementTransitionMapSummary
): ArrangementTransitionMapPrioritySummary {
  const transition = activeArrangementTransitionMapQuickActionTransition(summary);

  if (!transition) {
    return {
      transitionId: null,
      actionLabel: "No handoff",
      statusLabel: "Build form first",
      transitionLabel: "No transition available",
      reasonLabel: "Add at least two arrangement blocks before checking handoffs",
      nextCheckLabel: "Next: create a second section before cueing a transition loop.",
      detailTitle: "Arrangement Transition Map priority has no available transition.",
      tone: "danger"
    };
  }

  const statusLabel = arrangementTransitionMapPriorityStatus(transition);
  const transitionLabel = `${transition.value}: ${transition.status}`;
  const reasonLabel = arrangementTransitionMapPriorityReason(transition);
  const nextCheckLabel = arrangementTransitionMapPriorityNextCheck(transition);

  return {
    transitionId: transition.id,
    actionLabel: "Focus handoff",
    statusLabel,
    transitionLabel,
    reasonLabel,
    nextCheckLabel,
    detailTitle: `${statusLabel} / ${transitionLabel} / ${reasonLabel} / ${nextCheckLabel}`,
    tone: transition.tone
  };
}

export function arrangementTransitionMapPriorityStatus(transition: ArrangementTransitionMapTransition): string {
  if (transition.tone === "danger") {
    return "Review first";
  }
  if (transition.tone === "warn") {
    return "Contrast check";
  }
  return "Priority handoff";
}

export function arrangementTransitionMapPriorityReason(transition: ArrangementTransitionMapTransition): string {
  if (transition.tone === "danger") {
    return `${transition.detail} / flat handoff needs a focused listen`;
  }
  if (transition.tone === "warn") {
    return `${transition.energyLabel} / ${transition.patternLabel} / light transition contrast`;
  }
  return `${transition.energyLabel} / ${transition.patternLabel} / ${transition.muteLabel}`;
}

export function arrangementTransitionMapPriorityNextCheck(transition: ArrangementTransitionMapTransition): string {
  if (transition.tone === "danger") {
    return "Next: cue this turn and decide whether it needs a pattern, layer, fill, or energy move.";
  }
  if (transition.tone === "warn") {
    return "Next: compare this handoff against Song Form before editing adjacent blocks.";
  }
  return "Next: cue the handoff, then keep arranging if the turn supports the hook.";
}

export function createArrangementTransitionMapFocusResult(
  transition: ArrangementTransitionMapTransition,
  summary: ArrangementTransitionMapSummary
): ArrangementTransitionMapFocusResult {
  const summaryTransition = summary.transitions.find((candidate) => candidate.id === transition.id) ?? transition;

  return {
    transitionId: summaryTransition.id,
    status: "Focused",
    title: `${summaryTransition.value} transition focused`,
    detail: `${summaryTransition.status}: ${summaryTransition.detail}`,
    destination: reviewQueueFocusLabel("arrange"),
    metricLabel: "Transition",
    metricValue: arrangementTransitionMapFocusResultMetric(summaryTransition, summary),
    auditionCue: arrangementTransitionMapFocusResultAudition(summaryTransition),
    nextCheck: arrangementTransitionMapFocusResultNextCheck(summaryTransition),
    tone: summaryTransition.tone
  };
}

export function arrangementTransitionMapFocusResultMetric(
  transition: ArrangementTransitionMapTransition,
  summary: ArrangementTransitionMapSummary
): string {
  const readyCount = summary.transitions.filter((candidate) => candidate.tone === "good").length;
  return `${transition.energyLabel} / ${transition.patternLabel} / ${readyCount}/${summary.transitions.length} ready`;
}

export function arrangementTransitionMapFocusResultAudition(transition: ArrangementTransitionMapTransition): string {
  if (transition.tone === "danger") {
    return "Cue the transition loop and listen for missing contrast across the adjacent blocks.";
  }
  if (transition.tone === "warn") {
    return "Play around the boundary and decide whether the handoff needs one stronger energy, pattern, or mute move.";
  }
  return "Play the transition in song context and confirm the turn supports the next section.";
}

export function arrangementTransitionMapFocusResultNextCheck(transition: ArrangementTransitionMapTransition): string {
  if (transition.tone === "danger") {
    return "Use Arrangement Focus, Pattern Fill, or selected-block edits before adding more song length.";
  }
  if (transition.tone === "warn") {
    return "Check Mute Map or Arrangement Focus before editing adjacent blocks.";
  }
  return "Use Song Form Overview next to confirm the full arrangement arc still reads clearly.";
}

export function activeArrangementTransitionMapQuickActionTransition(
  summary: ArrangementTransitionMapSummary
): ArrangementTransitionMapTransition | null {
  return (
    summary.transitions.find((transition) => transition.tone === "danger") ??
    summary.transitions.find((transition) => transition.tone === "warn") ??
    summary.transitions[0] ??
    null
  );
}

export type ArrangementTransitionLoopTarget = {
  transition: ArrangementTransitionMapTransition;
  startBar: number;
  endBar: number;
  bars: number;
};

export function createArrangementTransitionLoopTarget(
  project: ProjectState,
  summary: ArrangementTransitionMapSummary,
  focusedTransitionId: ArrangementTransitionMapFocusId | null,
  selectedIndex: number
): ArrangementTransitionLoopTarget | null {
  const focusedTransition =
    focusedTransitionId === null ? null : summary.transitions.find((transition) => transition.id === focusedTransitionId) ?? null;
  const selectedTransition =
    summary.transitions.find((transition) => transition.fromIndex === selectedIndex) ??
    summary.transitions.find((transition) => transition.toIndex === selectedIndex) ??
    null;
  const transition = focusedTransition ?? selectedTransition ?? activeArrangementTransitionMapQuickActionTransition(summary);
  if (!transition) {
    return null;
  }

  const fromBlock = project.arrangement[transition.fromIndex];
  const toBlock = project.arrangement[transition.toIndex];
  if (!fromBlock || !toBlock) {
    return null;
  }

  const startBar = arrangementStartBar(project, transition.fromIndex);
  const bars = normalizeArrangementBars(fromBlock.bars) + normalizeArrangementBars(toBlock.bars);
  return {
    transition,
    startBar,
    endBar: startBar + bars,
    bars
  };
}

export function arrangementTransitionLoopDetail(target: ArrangementTransitionLoopTarget): string {
  return `Blocks ${target.transition.fromIndex + 1}->${target.transition.toIndex + 1} / Bars ${target.startBar + 1}-${
    target.endBar
  } / ${barCountLabel(target.bars)} / ${target.transition.patternLabel}`;
}

export function uniquePatternSlots(slots: PatternSlot[]): PatternSlot[] {
  return patternSlots.filter((slot) => slots.includes(slot));
}

export function createSongFormPrioritySummary(summary: SongFormOverviewSummary): SongFormPrioritySummary {
  const metric = activeSongFormPriorityMetric(summary);

  if (!metric) {
    return {
      metricId: null,
      targetIndex: null,
      targetLabel: "No block",
      statusLabel: "Song form priority",
      metricLabel: "No form metric",
      reasonLabel: "No Song Form metrics available",
      nextCheckLabel: "Add arrangement blocks, then return to Song Form Overview.",
      tone: "warn"
    };
  }

  const target = songFormPriorityTargetSegment(summary, metric);

  return {
    metricId: metric.id,
    targetIndex: target?.index ?? null,
    targetLabel: target ? `Block ${target.index + 1}` : "No block",
    statusLabel: songFormPriorityStatus(metric),
    metricLabel: `${metric.label}: ${metric.value}`,
    reasonLabel: songFormPriorityReason(metric),
    nextCheckLabel: songFormPriorityNextCheck(metric),
    tone: metric.tone
  };
}

export function songFormPriorityTargetSegment(summary: SongFormOverviewSummary, metric: SongFormMetric): SongFormSegment | null {
  const selected = summary.segments.find((segment) => segment.index === summary.selectedIndex) ?? summary.segments[0] ?? null;

  switch (metric.id) {
    case "flow":
      return summary.segments.find((segment) => segment.section === "Hook") ?? selected;
    case "patterns":
      return summary.segments.find((segment) => segment.tone !== "good") ?? summary.segments.find((segment) => segment.index !== summary.selectedIndex) ?? selected;
    case "selected":
      return selected;
    case "energy":
      return (
        summary.segments.find((segment) => segment.section === "Hook") ??
        summary.segments.reduce<SongFormSegment | null>(
          (loudest, segment) => (loudest === null || segment.energy > loudest.energy ? segment : loudest),
          null
        ) ??
        selected
      );
  }
}

export function activeSongFormPriorityMetric(summary: SongFormOverviewSummary): SongFormMetric | null {
  return summary.metrics.find((metric) => metric.tone === "danger") ?? summary.metrics.find((metric) => metric.tone === "warn") ?? summary.metrics[0] ?? null;
}

export function songFormPriorityStatus(metric: SongFormMetric): string {
  switch (metric.tone) {
    case "danger":
      return "Fix song form first";
    case "warn":
      return "Review song form first";
    case "good":
      return "Confirm song form lane";
  }
}

export function songFormPriorityReason(metric: SongFormMetric): string {
  switch (metric.id) {
    case "flow":
      return `${metric.detail}: Section flow is the current form priority.`;
    case "patterns":
      return `${metric.detail}: Pattern A/B/C spread is the current form priority.`;
    case "selected":
      return `${metric.detail}: Selected block posture is the current form priority.`;
    case "energy":
      return `${metric.detail}: Energy arc contrast is the current form priority.`;
  }
}

export function songFormPriorityNextCheck(metric: SongFormMetric): string {
  switch (metric.id) {
    case "flow":
      return "Use Pattern Chain, Arrangement Template, or Section Locator before detailed block edits.";
    case "patterns":
      return "Use Pattern Compare or Pattern Chain, then confirm A/B/C roles across the form.";
    case "selected":
      return "Use Arrangement Playback Readout or Arrangement Focus before changing the selected block.";
    case "energy":
      return "Use Arrangement Arc or Transition Map before editing block energy.";
  }
}

export function createSongFormOverviewSummary(project: ProjectState, selectedIndex: number): SongFormOverviewSummary {
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const sectionLabels = arrangementSections.filter((section) => project.arrangement.some((block) => block.section === section));
  const patternSlotsUsed = usedPatternSlots(project);
  const segments = createSongFormSegments(project);
  const selectedSegment = segments[selectedIndex] ?? segments[0];
  const flowTone: MixCoachTone =
    sectionLabels.includes("Hook") && sectionLabels.length >= 3 ? "good" : sectionLabels.length >= 2 ? "warn" : "danger";
  const patternTone: MixCoachTone = patternSlotsUsed.length >= 3 ? "good" : patternSlotsUsed.length >= 2 ? "warn" : "danger";
  const lengthTone: MixCoachTone = bars >= target.targetBars ? "good" : bars >= 8 ? "warn" : "danger";
  const energyValues = segments.map((segment) => segment.energy);
  const lowEnergy = energyValues.length > 0 ? Math.min(...energyValues) : 0;
  const highEnergy = energyValues.length > 0 ? Math.max(...energyValues) : 0;
  const energySpread = highEnergy - lowEnergy;
  const energyTone: MixCoachTone = energySpread >= 0.28 ? "good" : energySpread >= 0.14 ? "warn" : "danger";
  const flowLabel = compactSectionFlow(project.arrangement);
  const patternLabel = patternSlotsUsed.length > 0 ? patternSlotsUsed.join("/") : project.selectedPattern;

  return {
    headline: `${barCountLabel(bars)} / ${project.arrangement.length} blocks / ${target.name}`,
    detail: `${sectionLabels.length}/${arrangementSections.length} sections / Pattern ${patternLabel} / target ${barCountLabel(target.targetBars)}`,
    tone: weakestTone([flowTone, patternTone, lengthTone, energyTone]),
    metrics: [
      {
        id: "flow",
        label: "Flow",
        value: flowLabel,
        detail: `${sectionLabels.length}/${arrangementSections.length} sections covered`,
        tone: flowTone
      },
      {
        id: "patterns",
        label: "Patterns",
        value: patternLabel,
        detail: `${patternSlotsUsed.length}/3 Pattern slots in arrangement`,
        tone: patternTone
      },
      {
        id: "selected",
        label: "Selected",
        value: selectedSegment ? `Block ${selectedSegment.index + 1}` : "No block",
        detail: selectedSegment
          ? `${selectedSegment.section} / Pattern ${selectedSegment.pattern} / ${barCountLabel(selectedSegment.bars)}`
          : "No arrangement block selected",
        tone: selectedSegment ? selectedSegment.tone : "danger"
      },
      {
        id: "energy",
        label: "Energy",
        value: `${Math.round(lowEnergy * 100)}-${Math.round(highEnergy * 100)}%`,
        detail: `${Math.round(energySpread * 100)}% spread across blocks`,
        tone: energyTone
      }
    ],
    segments,
    selectedIndex: Math.min(selectedIndex, Math.max(0, segments.length - 1))
  };
}

export function createSongFormSegments(project: ProjectState): SongFormSegment[] {
  const totalBars = Math.max(1, arrangementTotalBars(project));
  let startBar = 1;

  return project.arrangement.map((block, index) => {
    const bars = normalizeArrangementBars(block.bars);
    const endBar = startBar + bars - 1;
    const energy = normalizeArrangementEnergy(block.energy);
    const pattern = project.patterns[block.pattern];
    const eventCount = patternEventTotal(pattern);
    const mutedLabel =
      block.mutedTracks.length === 0 ? "Full mix" : `${block.mutedTracks.map(arrangementMuteTrackLabel).join("/")} muted`;
    const tone = songFormSegmentTone(eventCount, energy, block.mutedTracks.length);
    const segment: SongFormSegment = {
      index,
      section: block.section,
      pattern: block.pattern,
      bars,
      startBar,
      endBar,
      energy,
      mutedLabel,
      eventCount,
      tone,
      widthPercent: Math.max(8, (bars / totalBars) * 100)
    };
    startBar = endBar + 1;
    return segment;
  });
}

export function createSectionLocatorPads(
  project: ProjectState,
  selectedIndex: number,
  playingIndex: number | null
): SectionLocatorPad[] {
  return arrangementSections.map((section) => {
    const index = firstArrangementSectionIndex(project, section);
    if (index === null) {
      return {
        section,
        index: null,
        pattern: null,
        startBar: null,
        endBar: null,
        energy: 0,
        eventCount: 0,
        selected: false,
        playing: false,
        tone: "danger"
      };
    }

    const block = project.arrangement[index];
    const bars = normalizeArrangementBars(block.bars);
    const startBar = arrangementStartBar(project, index) + 1;
    const endBar = startBar + bars - 1;
    const eventCount = patternEventTotal(project.patterns[block.pattern]);
    const energy = normalizeArrangementEnergy(block.energy);
    const mutedTracks = normalizeArrangementMutedTracks(block.mutedTracks);

    return {
      section,
      index,
      pattern: block.pattern,
      startBar,
      endBar,
      energy,
      eventCount,
      selected: selectedIndex === index,
      playing: playingIndex === index,
      tone: songFormSegmentTone(eventCount, energy, mutedTracks.length)
    };
  });
}

export function createSectionLocatorPrioritySummary(pads: SectionLocatorPad[]): SectionLocatorPrioritySummary {
  const pad = activeSectionLocatorPriorityPad(pads);

  if (!pad) {
    return {
      section: null,
      statusLabel: "Section priority",
      sectionLabel: "No section cue",
      reasonLabel: "No arrangement section is available to cue.",
      nextCheckLabel: "Add an arrangement block, then return to Section Locator.",
      detailTitle: "Section priority / No section cue / No arrangement section is available to cue.",
      tone: "warn"
    };
  }

  const sectionLabel = `${pad.section}: ${pad.pattern ? `Pattern ${pad.pattern}` : "Missing"}`;
  const reasonLabel = sectionLocatorPriorityReason(pad);
  const nextCheckLabel = sectionLocatorPriorityNextCheck(pad);
  const statusLabel = sectionLocatorPriorityStatus(pad);

  return {
    section: pad.section,
    statusLabel,
    sectionLabel,
    reasonLabel,
    nextCheckLabel,
    detailTitle: `${statusLabel} / ${sectionLabel} / ${reasonLabel} / ${nextCheckLabel}`,
    tone: pad.tone
  };
}

export function createSectionLocatorCueDecisionSummary(pads: SectionLocatorPad[], disabled: boolean): SectionLocatorCueDecisionSummary {
  const pad = activeSectionLocatorPriorityPad(pads);

  if (!pad) {
    return {
      section: null,
      actionId: "unavailable",
      statusLabel: "Cue unavailable",
      sectionLabel: "No section target",
      metricLabel: "No block",
      detailLabel: "Add an arrangement block before cueing a section.",
      buttonLabel: "No Section Cue",
      disabled: true,
      detailTitle: "Cue unavailable / No section target / Add an arrangement block before cueing a section.",
      tone: "warn"
    };
  }

  const rangeLabel = pad.startBar === null || pad.endBar === null ? "missing bars" : `Bars ${pad.startBar}-${pad.endBar}`;
  const sectionLabel = `${pad.section}: ${pad.pattern ? `Pattern ${pad.pattern}` : "Missing Pattern"}`;
  const metricLabel = `Block ${pad.index === null ? "?" : pad.index + 1} / ${rangeLabel}`;
  const detailLabel = `${Math.round(pad.energy * 100)}% energy / ${pad.eventCount} events`;
  const statusLabel = disabled ? "Stop playback first" : pad.playing ? "Already hearing" : pad.selected ? "Ready to cue edit section" : "Ready to cue";
  const buttonLabel = disabled ? "Stop Playback First" : "Cue Suggested Section";

  return {
    section: pad.section,
    actionId: disabled ? "stop-playback" : "cue-section",
    statusLabel,
    sectionLabel,
    metricLabel,
    detailLabel,
    buttonLabel,
    disabled,
    detailTitle: `${statusLabel} / ${sectionLabel} / ${metricLabel} / ${detailLabel}`,
    tone: disabled ? "warn" : pad.tone
  };
}

export function createSectionCueResult(
  project: ProjectState,
  index: number,
  source: SectionCueResult["source"]
): SectionCueResult | null {
  const block = project.arrangement[index];
  if (!block) {
    return null;
  }

  const blockNumber = index + 1;
  const bars = normalizeArrangementBars(block.bars);
  const startBar = arrangementStartBar(project, index) + 1;
  const endBar = startBar + bars - 1;
  const rangeLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
  const eventCount = patternEventTotal(project.patterns[block.pattern]);
  const energyLabel = percentLabel(normalizeArrangementEnergy(block.energy));
  const mutedLabel = arrangementFocusPreviewMuteLabel(normalizeArrangementMutedTracks(block.mutedTracks));
  const sourceLabel = source === "arrangement-block" ? "Arrangement Block Cue" : "Section Locator";

  return {
    source,
    targetId: `${source}-${blockNumber}-${block.section}-${block.pattern}`,
    status: "Cued",
    title: `${block.section} Block ${blockNumber} loop`,
    detail: `${sourceLabel} / Pattern ${block.pattern} / ${rangeLabel}`,
    patternLabel: `Pattern ${block.pattern}`,
    metricLabel: "Block loop",
    metricValue: `${rangeLabel} / ${eventCount} events / ${energyLabel} energy / ${mutedLabel}`,
    auditionCue: `Play Block loop; hear ${block.section} with Pattern ${block.pattern} before changing song form.`,
    nextCheck:
      block.section === "Hook"
        ? "Check Hook Readiness, Topline Space, or Arrangement Focus before editing the lift."
        : "Compare Song Form Overview and Arrangement Focus before moving or reshaping this block.",
    tone: eventCount > 0 ? "good" : "warn"
  };
}

export function activeSectionLocatorPriorityPad(pads: SectionLocatorPad[]): SectionLocatorPad | null {
  return (
    pads.find((pad) => pad.playing && pad.index !== null) ??
    pads.find((pad) => pad.selected && pad.index !== null) ??
    pads.find((pad) => pad.section === "Hook" && pad.index !== null) ??
    pads.find((pad) => pad.index !== null) ??
    null
  );
}

export function sectionLocatorPriorityStatus(pad: SectionLocatorPad): string {
  if (pad.playing) {
    return "Hearing section";
  }
  if (pad.selected) {
    return "Edit section cue";
  }
  if (pad.section === "Hook") {
    return "Cue hook first";
  }
  return "Cue first section";
}

export function sectionLocatorPriorityReason(pad: SectionLocatorPad): string {
  const rangeLabel = pad.startBar === null || pad.endBar === null ? "missing bars" : `Bars ${pad.startBar}-${pad.endBar}`;

  if (pad.playing) {
    return `${pad.section} is currently playing; confirm the audible section before editing nearby blocks.`;
  }
  if (pad.selected) {
    return `${pad.section} is selected; cue it before changing section role, energy, mutes, or Pattern.`;
  }
  if (pad.section === "Hook") {
    return `Hook is available at ${rangeLabel}; audition the main lift before detailed arrangement edits.`;
  }
  return `${pad.section} is the first available section at ${rangeLabel}; audition the form entry before moving blocks.`;
}

export function sectionLocatorPriorityNextCheck(pad: SectionLocatorPad): string {
  if (pad.playing) {
    return "Compare Arrangement Playback Readout and Song Form before editing.";
  }
  if (pad.selected) {
    return "Cue the selected section, then use Arrangement Focus or Song Form.";
  }
  if (pad.section === "Hook") {
    return "Cue Hook, then check Hook Readiness, Topline Space, or Transition Map.";
  }
  return "Cue this section, then confirm Song Form flow before editing.";
}

export function firstArrangementSectionIndex(project: ProjectState, section: ArrangementSection): number | null {
  const index = project.arrangement.findIndex((block) => block.section === section);
  return index >= 0 ? index : null;
}

export function sectionLocatorTestId(section: ArrangementSection): string {
  return section.toLowerCase();
}

export function sectionLocatorActionSection(actionId: string): ArrangementSection | null {
  return arrangementSections.find((section) => actionId === `section-locator-${sectionLocatorTestId(section)}`) ?? null;
}

export function quickActionSectionLocatorMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id === "section-locator-readout-action") {
    const section = sectionLocatorDecisionActionSection(action);
    const pattern = activePattern(project);
    if (!section) {
      return {
        id: "section-locator-readout",
        label: "Section Locator Readout",
        value: `section locator readout / no section target / Pattern ${project.selectedPattern} / ${patternEventTotal(
          pattern
        )} editable events / ${project.arrangement.length} blocks / ${barCountLabel(arrangementTotalBars(project))}`
      };
    }

    const index = firstArrangementSectionIndex(project, section);
    const totalBars = arrangementTotalBars(project);
    if (index === null) {
      return {
        id: "section-locator-readout",
        label: "Section Locator Readout",
        value: `review section locator readout / ${section} missing / selected Pattern ${
          project.selectedPattern
        } / ${patternEventTotal(pattern)} editable events / ${project.arrangement.length} blocks / ${barCountLabel(
          totalBars
        )}`
      };
    }

    const block = project.arrangement[index];
    const bars = normalizeArrangementBars(block.bars);
    const startBar = arrangementStartBar(project, index) + 1;
    const endBar = startBar + bars - 1;
    const rangeLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
    const eventCount = patternEventTotal(project.patterns[block.pattern]);

    return {
      id: "section-locator-readout",
      label: "Section Locator Readout",
      value: `review section locator readout / ${action.detail} / target ${section} / Block ${index + 1} ${
        block.section
      } / Pattern ${block.pattern} / ${rangeLabel} / ${eventCount} block events / selected Pattern ${
        project.selectedPattern
      } / ${patternEventTotal(pattern)} editable events / ${project.arrangement.length} blocks / ${barCountLabel(totalBars)}`
    };
  }

  const section = sectionLocatorQuickActionSection(action);
  if (!section) {
    return null;
  }

  const actionLabel = action.id === "section-locator-decision" ? `${section} cue decision` : `${section} cue`;
  const index = firstArrangementSectionIndex(project, section);
  const totalBars = arrangementTotalBars(project);
  if (index === null) {
    return {
      id: "section-locator",
      label: "Section cue",
      value: `${actionLabel} / ${section} missing / ${project.arrangement.length} blocks / ${barCountLabel(totalBars)}`
    };
  }

  const block = project.arrangement[index];
  const bars = normalizeArrangementBars(block.bars);
  const startBar = arrangementStartBar(project, index) + 1;
  const endBar = startBar + bars - 1;
  const rangeLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
  const eventCount = patternEventTotal(project.patterns[block.pattern]);

  return {
    id: "section-locator",
    label: "Section cue",
    value: `${actionLabel} / Block ${index + 1} ${block.section} / Pattern ${
      block.pattern
    } / ${rangeLabel} / ${eventCount} events / ${project.arrangement.length} blocks / ${barCountLabel(totalBars)}`
  };
}

export function sectionLocatorQuickActionSection(action: QuickAction): ArrangementSection | null {
  return sectionLocatorActionSection(action.id) ?? sectionLocatorDecisionActionSection(action);
}

export function sectionLocatorDecisionActionSection(action: QuickAction): ArrangementSection | null {
  if (action.id !== "section-locator-decision" && action.id !== "section-locator-readout-action") {
    return null;
  }

  return (
    arrangementSections.find(
      (section) =>
        action.title.includes(`: ${section}:`) ||
        action.title.includes(`${section}: Pattern`) ||
        action.detail.includes(`${section}: Pattern`)
    ) ?? null
  );
}

export function arrangementBlockJumpIndex(actionId: string): number | null {
  const match = /^arrangement-block-jump-(\d+)$/.exec(actionId);
  if (!match) {
    return null;
  }
  const index = Number(match[1]) - 1;
  return Number.isInteger(index) && index >= 0 ? index : null;
}

export function arrangementBlockCueIndex(actionId: string): number | null {
  const match = /^arrangement-block-cue-(\d+)$/.exec(actionId);
  if (!match) {
    return null;
  }
  const index = Number(match[1]) - 1;
  return Number.isInteger(index) && index >= 0 ? index : null;
}

export function quickActionArrangementBlockMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  mode: "jump" | "cue"
): { id: string; label: string; value: string } | null {
  const index = mode === "jump" ? arrangementBlockJumpIndex(action.id) : arrangementBlockCueIndex(action.id);
  if (index === null) {
    return null;
  }

  const identity = arrangementBlockMetricIdentity(mode);
  const block = project.arrangement[index];
  if (!block) {
    return {
      id: identity.id,
      label: identity.label,
      value: `${identity.actionLabel} / Block ${index + 1} missing / ${project.arrangement.length} blocks / ${barCountLabel(
        arrangementTotalBars(project)
      )}`
    };
  }

  const bars = normalizeArrangementBars(block.bars);
  const startBar = arrangementStartBar(project, index) + 1;
  const endBar = startBar + bars - 1;
  const rangeLabel = startBar === endBar ? `Bar ${startBar}` : `Bars ${startBar}-${endBar}`;
  const eventCount = patternEventTotal(project.patterns[block.pattern]);
  const totalBars = arrangementTotalBars(project);

  return {
    id: identity.id,
    label: identity.label,
    value: `${identity.actionLabel} / Block ${index + 1} ${block.section} / Pattern ${
      block.pattern
    } / ${rangeLabel} / ${barCountLabel(bars)} / ${eventCount} events / ${
      project.arrangement.length
    } blocks / ${barCountLabel(totalBars)}`
  };
}

export function arrangementBlockMetricIdentity(mode: "jump" | "cue"): {
  id: string;
  label: string;
  actionLabel: string;
} {
  if (mode === "jump") {
    return {
      id: "arrangement-block-jump",
      label: "Block jump",
      actionLabel: "jump edit focus"
    };
  }

  return {
    id: "arrangement-block-cue",
    label: "Block cue",
    actionLabel: "cue Block loop"
  };
}

export function songFormSegmentTone(eventCount: number, energy: number, mutedTrackCount: number): MixCoachTone {
  if (eventCount === 0 || energy < 0.2 || mutedTrackCount >= arrangementMuteTrackIds.length) {
    return "danger";
  }
  if (eventCount < 8 || energy < 0.42 || mutedTrackCount >= 2) {
    return "warn";
  }
  return "good";
}

export function compactSectionFlow(arrangement: ArrangementBlock[]): string {
  const compact = arrangement.reduce<ArrangementSection[]>((sections, block) => {
    if (sections[sections.length - 1] !== block.section) {
      sections.push(block.section);
    }
    return sections;
  }, []);
  return compact.length > 0 ? compact.join(">") : "No blocks";
}

export function patternEventTotal(pattern: PatternData): number {
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

export function projectEventTotal(project: ProjectState): number {
  return patternSlots.reduce((total, slot) => total + patternEventTotal(project.patterns[slot]), 0);
}

export function arrangementAverageEnergy(project: ProjectState): number {
  if (project.arrangement.length === 0) {
    return 0;
  }
  const energyTotal = project.arrangement.reduce((total, block) => total + block.energy, 0);
  return energyTotal / project.arrangement.length;
}

export function structureHookSignal(project: ProjectState): StructureLensSignal {
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

export function structureArcSignal(project: ProjectState): StructureLensSignal {
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
