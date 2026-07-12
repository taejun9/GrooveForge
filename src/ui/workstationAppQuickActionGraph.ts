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
import {
  beatPassportRouteLabel,
  beatReadinessRouteLabel,
  composerGuideRouteLabel,
  drumKitRouteLabel,
  exportPreflightRouteLabel,
  finishChecklistRouteLabel,
  grooveCompassRouteLabel,
  hookReadinessDestinationLabel,
  hookReadinessRouteLabel,
  keyCompassRouteLabel,
  listeningPassRouteLabel,
  masterAutomationRouteLabel,
  masterFinishRouteLabel,
  mixBalanceRouteLabel,
  mixSnapshotRouteLabel,
  productionSnapshotRouteLabel,
  referenceAlignmentDestinationLabel,
  referenceAlignmentRouteLabel,
  reviewQueueRouteLabel,
  sessionPassRouteLabel,
  soundFocusRouteLabel,
  soundPresetRouteLabel,
  spaceFxRouteLabel,
  stemAuditionRouteLabel,
  toplineSpaceDestinationLabel,
  toplineSpaceRouteLabel,
  workflowNavigatorDestinationLabel,
  workflowNavigatorRouteLabel,
  workflowSpotlightRouteLabel
} from "./workstationAppQuickActionRouteLabels";
import {
  createNextMoveSourceQuickActions,
  createQuickActionPinnedOptions,
  createQuickActionPinnedResult,
  createQuickActionRecentOptions,
  createQuickActionRecentResult,
  createQuickActionScopeOptions,
  createQuickActionScopeResult,
  createQuickActionSearchHintResult,
  createQuickActionSearchRecoveryResult,
  createQuickActionSearchResult,
  createQuickActionSpotlightSummary,
  filterQuickActions,
  nextMoveQuickActionForProject,
  nextMoveQuickActionSource,
  nextMoveQuickActionSourceLabel,
  nextMoveQuickActionTargetId,
  nextMoveSourceQuickActionId,
  normalizeQuickActionPinnedIds,
  prependQuickActionRecent,
  quickActionMatchesQuery,
  quickActionMatchesScope,
  quickActionPinnedResultTarget,
  quickActionRecentResultTarget,
  quickActionScopeDefinitions,
  quickActionScopeLabel,
  quickActionSearchTokens
} from "./workstationAppQuickActionPalette";
import type { NextMoveQuickActionSource } from "./workstationAppQuickActionPalette";
export {
  beatPassportRouteLabel,
  beatReadinessRouteLabel,
  composerGuideRouteLabel,
  drumKitRouteLabel,
  exportPreflightRouteLabel,
  finishChecklistRouteLabel,
  grooveCompassRouteLabel,
  hookReadinessDestinationLabel,
  hookReadinessRouteLabel,
  keyCompassRouteLabel,
  listeningPassRouteLabel,
  masterAutomationRouteLabel,
  masterFinishRouteLabel,
  mixBalanceRouteLabel,
  mixSnapshotRouteLabel,
  productionSnapshotRouteLabel,
  referenceAlignmentDestinationLabel,
  referenceAlignmentRouteLabel,
  reviewQueueRouteLabel,
  sessionPassRouteLabel,
  soundFocusRouteLabel,
  soundPresetRouteLabel,
  spaceFxRouteLabel,
  stemAuditionRouteLabel,
  toplineSpaceDestinationLabel,
  toplineSpaceRouteLabel,
  workflowNavigatorDestinationLabel,
  workflowNavigatorRouteLabel,
  workflowSpotlightRouteLabel
} from "./workstationAppQuickActionRouteLabels";
export {
  createNextMoveSourceQuickActions,
  createQuickActionPinnedOptions,
  createQuickActionPinnedResult,
  createQuickActionRecentOptions,
  createQuickActionRecentResult,
  createQuickActionScopeOptions,
  createQuickActionScopeResult,
  createQuickActionSearchHintResult,
  createQuickActionSearchRecoveryResult,
  createQuickActionSearchResult,
  createQuickActionSpotlightSummary,
  filterQuickActions,
  nextMoveQuickActionForProject,
  nextMoveQuickActionSource,
  nextMoveQuickActionSourceLabel,
  nextMoveQuickActionTargetId,
  nextMoveSourceQuickActionId,
  normalizeQuickActionPinnedIds,
  prependQuickActionRecent,
  quickActionMatchesQuery,
  quickActionMatchesScope,
  quickActionPinnedResultTarget,
  quickActionRecentResultTarget,
  quickActionScopeDefinitions,
  quickActionScopeLabel,
  quickActionSearchTokens
} from "./workstationAppQuickActionPalette";
export type { NextMoveQuickActionSource } from "./workstationAppQuickActionPalette";
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
  AudienceStarterProjectId,
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
  audienceStarterProjectDetail,
  audienceStarterProjectLabel,
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
  PatternContrastSectionFitSummary,
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
  AudienceSessionReadoutRow,
  AudienceSessionReadoutSummary,
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
  createAudienceSessionAcceptanceQuickActions,
  createAudienceDeliveryProofBridgeQuickActions,
  createAudienceSessionProofHandoffQuickActions,
  createAudienceRouteBridgeQuickActions,
  createAudienceRouteBridgeSummary,
  createAudienceCompletionRouteQuickActions,
  createAudienceCompletionRouteRows,
  createAudienceSessionQuickActions,
  createDualAudienceReadinessQuickActions,
  createDualAudienceReadinessRows,
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
  SnapshotCompare,
  createCommandReferenceRouteReadoutSummary
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
  createPatternChainPrioritySummary, createPatternChainResult, createPatternChainResultMetric, createPatternCompareDecisionSummary, createPatternCompareResult, createPatternCompareResultMetric, createPatternCompareSummaries, createPatternContrastSummary, createPatternDnaFocusResult,
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
import { createPatternContrastRoleMapSummary, createPatternContrastSectionFitSummary } from "./workstationAppDerivations";
import type {
  SoundTimbreScore
} from "./workstationAppDerivations";

import {
  activeArrangementMuteMapQuickActionLane, activeArrangementTransitionMapQuickActionTransition, activeBassMoveQuickActionTarget, activeBeatPassportQuickActionMetric, activeBeatReadinessQuickActionCheck, activeBeatSpineQuickActionApplyCard, activeBeatSpineQuickActionCard, activeChordMoveQuickActionTarget, activeComposerGuideQuickActionCard, activeDrumMoveQuickActionTarget, activeExportPreflightQuickActionCard, activeFinishChecklistQuickActionCard, activeFirstBeatPathQuickActionStep, activeGrooveCompassQuickActionItem, activeGuideQuickStartBottleneckQuickActionTarget, activeGuideQuickStartQuickActionTarget, activeHandoffPackageCheckQuickActionCard, activeHookReadinessQuickActionCard, activeKeyCompassQuickActionItem, activeLayerStarterQuickActionOption, activeListeningPassQuickActionItem, activeMelodyMoveQuickActionTarget, activeModeFocusQuickActionCard, activePatternDnaQuickActionCard, activeProductionSnapshotQuickActionMetric, activeReviewFixItem, activeSessionPassQuickActionCard, activeStyleInspectorQuickActionItem, activeToplineSpaceQuickActionCard, applySessionBriefStarter, arrangementAverageEnergy, arrangementMuteMapFocusResultAudition, arrangementMuteMapFocusResultMetric, arrangementMuteMapFocusResultNextCheck, arrangementTransitionLoopDetail, arrangementTransitionMapFocusResultAudition, arrangementTransitionMapFocusResultMetric, arrangementTransitionMapFocusResultNextCheck, beatBlueprintStyleLabel, beatMapRouteLabel, beatMapStageForNextMoveAction, beatPassportFocusResultMetric, beatReadinessCardActionId, beatReadinessQuickActionCheckFromChecks, beatSpineApplyButtonContext, beatSpineJumpButtonContext, chordMotionLabel, compactSectionFlow, compactSessionBriefValue, composerActionForStyleGoal, composerActionQuickActionArea, composerActionQuickActionDetail, composerActionQuickActionGroup, composerGuideFocusCommandDetail, composerGuideFocusResultAudition, composerGuideFocusResultMetric, composerGuideFocusResultNextCheck, createArrangementMovePreviewDecision, createArrangementMovePrioritySummary, createArrangementMuteMapSummary, createArrangementTransitionLoopTarget, createArrangementTransitionMapSummary, createBeatBlueprintPreviewCue, createBeatBlueprintPreviewDecision, createBeatBlueprintPreviewSummary, createBeatMapActions, createBeatMapSummary, createBeatPassportSummary, createComposerActionsSummary, createDeliveryTargetAlignmentPreview, createExportPreflightSummary, createFinishChecklistSummary, createHandoffExportFormatFocusResult, createHandoffExportFormatSummary, createHandoffFileManifest, createHandoffManifestAudit, createHandoffPackageCheckSummary, createHandoffPackItems, createHandoffPackRouteSummary, createHandoffPackSendOrderSummary, createHookFixOption, createHookLoopCueTarget, createHookReadinessSummary, createNextMoveActions, createProductionSnapshotSummary, createReviewFixOption, createReviewQueueSummary, createSectionLocatorCueDecisionSummary, createSelectedBlockEditPreviewDecision, createSelectedBlockEditPrioritySummary, createSessionBriefStarterBrief, createSongFormOverviewSummary, createSongFormPrioritySummary, createStructureLensActions, createStructureLensSummary, createToplineFixOption, createToplineLoopCueTarget, createToplineSpaceSummary, createWorkflowNavigatorItems, deliveryTargetMasterLabel, emptyHandoffExportReceipt, exportPreflightFocusResultMetric, exportPreflightFocusResultNextCheck, finishChecklistFocusResultMetric, firstBeatPathJumpAuditionCue, firstBeatPathJumpNextCheck, formatExportDuration, grooveCompassFocusResultAudition, grooveCompassFocusResultMetric, grooveCompassFocusResultNextCheck, guideQuickStartCommandDetail, guideQuickStartCompletionBreakdownLabel, handoffExportFormatFocusMetric, handoffPackageCheckFocusResultMetric, handoffPackageCheckFocusResultNextCheck, hookLoopCueDetail, hookReadinessFocusResultNextCheck, isArrangementMovePresetApplied, isDeliveryTargetAligned, keyCompassFocusResultAudition, keyCompassFocusResultMetric, keyCompassFocusResultNextCheck, mixPostureLabel, modeFocusCommandDetail, nextMoveActionPostureMetricSnapshot, nextMoveResultFollowup, nextMoveResultMetricSnapshot, nextMoveRouteLabel, normalizeSwingFeelValue, patternEventTotal, productionSnapshotFocusResultMetric, projectEventTotal, quickActionArrangementBlockMetricSnapshot, quickActionBeatMapMetricSnapshot, quickActionComposerActionAreaLabel, quickActionComposerActionMetricLabel, quickActionComposerActionMoveLabel, quickActionComposerActionRouteLabel, quickActionSectionLocatorMetricSnapshot, quickActionSelectedBlockMetricSnapshot, quickActionStructureLensMetricSnapshot, reviewFixScopeLabel, reviewQueueFocusResultMetric, sectionLocatorActionSection, sectionLocatorTestId, selectedArrangementMoveQuickActionPreset, sessionBriefChangedFieldCount, sessionBriefCompassDestinationLabel, sessionBriefCompassFocusLabel, sessionBriefFieldLabel, sessionBriefFields, sessionBriefFilledFields, sessionBriefStarterPadDefinitions, sessionBriefStatus, sessionPassCommandDetail, sessionPassFocusResultAudition, sessionPassFocusResultMetric, sessionPassFocusResultNextCheck, structureLensRouteLabel, structureLensSignalById, structureLensSignalForNextMoveAction, structureLensSignalMetricLabel, styleGoalActionQuickActionArea, styleGoalCueLabel, styleGoalCueQuickActionGoal, suggestedMasterFinishPad, swingFeelPadDetail, swingFeelPadSwing, toplineLoopCueDetail, toplineSpaceFocusResultNextCheck, workflowCountLabel, workflowNavigatorJumpAuditionCue, workflowNavigatorJumpMetricValue, workflowNavigatorJumpNextCheck
} from "./workstationAppHelpers";
import type {
  ArrangementTransitionLoopTarget, BeatBlueprintPreviewCue, BeatBlueprintPreviewDecision, HookLoopCueTarget, ToplineLoopCueTarget
} from "./workstationAppHelpers";

type PatternContrastCueRole = Exclude<PatternContrastRole, "blank">;

const patternContrastCueRoles: PatternContrastCueRole[] = ["anchor", "lift", "break", "switchup"];

function patternContrastCueRoleLabel(role: PatternContrastCueRole): string {
  switch (role) {
    case "anchor":
      return "Anchor";
    case "lift":
      return "Lift";
    case "break":
      return "Break";
    case "switchup":
      return "Switchup";
  }
}

function patternContrastCueSlot(summary: PatternContrastSummary, role: PatternContrastCueRole): PatternContrastSummary["slots"][number] | null {
  return summary.slots.find((slot) => slot.role === role) ?? null;
}

function patternContrastCueQuickActionRole(action: QuickAction): PatternContrastCueRole | null {
  const role = action.id.replace("pattern-contrast-cue-", "");
  return patternContrastCueRoles.includes(role as PatternContrastCueRole) ? (role as PatternContrastCueRole) : null;
}

function patternContrastUseQuickActionRole(action: QuickAction): PatternContrastCueRole | null {
  const role = action.id.replace("pattern-contrast-use-", "");
  return patternContrastCueRoles.includes(role as PatternContrastCueRole) ? (role as PatternContrastCueRole) : null;
}

function patternContrastQuickActionTargetPattern(action: QuickAction): PatternSlot | null {
  const match = /Pattern ([ABC])/.exec(`${action.title} ${action.detail}`);
  const slot = match?.[1];
  return slot === "A" || slot === "B" || slot === "C" ? slot : null;
}

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
  audienceSessionReadoutSummary,
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
  patternContrastRoleMapSummary,
  patternContrastSectionFitSummary,
  patternContrastSummary,
  patternChainPreviewSummary,
  patternStackOptions,
  patternStackPreviewSummary,
  patternFillPreviewPreset,
  patternVariationPreviewPreset,
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
  quickActionRouteQuery,
  quickActionRouteScope,
  quickActionPinnedCount,
  quickActionRecentCount,
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
  onFocusBassMoveRouteReadout,
  onApplyBeatSpine,
  onApplyBlueprint,
  onApplyChordPad,
  onApplyChordRhythm,
  onApplyChordVoicing,
  onFocusChordMoveRouteReadout,
  onAlignDeliveryTarget,
  onSelectDeliveryTarget,
  onApplyDrumAccent,
  onApplyDrumFoundation,
  onApplyDrumKit,
  onFocusDrumKitReadout,
  onFocusDrumKitRouteReadout,
  onFocusDrumMoveRouteReadout,
  onApplyGrooveFeel,
  onApplyLayerStarter,
  onFocusLayerStarterReadout,
  onApplyMasterAutomation,
  onFocusMasterAutomationReadout,
  onFocusMasterAutomationRouteReadout,
  onApplyMasterFinish,
  onFocusMasterFinishReadout,
  onFocusMasterFinishRouteReadout,
  onApplyMelodyMotif,
  onApplyMelodyAccent,
  onApplyMelodyContour,
  onFocusMelodyMoveRouteReadout,
  onApplyMixBalance,
  onApplyMixFix,
  onFocusMixBalanceReadout,
  onFocusMixBalanceRouteReadout,
  onCaptureMixSnapshot,
  onRecallMixSnapshot,
  onClearMixSnapshots,
  onFocusMixSnapshotReadout,
  onFocusMixSnapshotRouteReadout,
  onFocusSpaceFxReadout,
  onFocusSpaceFxRouteReadout,
  onFocusPatternChainReadout,
  onFocusChainExpandReadout,
  onApplyPatternChain,
  onApplyPatternClone,
  onFocusPatternCloneReadout,
  onApplyPatternFill,
  onFocusPatternFillReadout,
  onApplyPatternVariation,
  onFocusPatternVariationReadout,
  onFocusPatternContrastReadout,
  onFocusPatternContrastRoleMapReadout,
  onFocusPatternContrastSectionFitReadout,
  onApplyPatternStack,
  onFocusPatternStackReadout,
  onCopySelectedPattern,
  onClearSelectedPattern,
  onFocusPatternCopyClearReadout,
  onApplySpaceFx,
  onApplyStemAudition,
  onFocusStemAuditionReadout,
  onFocusStemAuditionRouteReadout,
  onApplySoundFocus,
  onFocusSoundFocusReadout,
  onFocusSoundFocusRouteReadout,
  onApplySoundPreset,
  onFocusSoundPresetReadout,
  onFocusSoundPresetRouteReadout,
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
  onCreateAudienceStarter,
  onSelectArrangementBlock,
  onSelectPattern,
  onSelectStyle,
  onSelectAudienceSessionRow,
  onFocusAudienceDeliveryProofBridgeReadout,
  onFocusAudienceSessionAcceptanceReadout,
  onFocusAudienceSessionProofHandoffReadout,
  onFocusAudienceRouteBridgeReadout,
  onFocusAudienceCompletionRouteReadout,
  onFocusDualAudienceReadinessRouteReadout,
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
  onExportDeliveryBundle,
  onExportHandoffSheet,
  onExportMidi,
  onExportStems,
  onExportWav,
  onFocusDirectExportsReadout,
  onFocusHandoffNextExportReadout,
  onFocusBeatMapRouteReadout,
  onFocusStructureLensRouteReadout,
  onFocusNextMoveRouteReadout,
  onJumpFirstBeatPath,
  onJumpBeatSpine,
  onFocusBeatPassport,
  onFocusBeatPassportRouteReadout,
  onFocusBeatReadiness,
  onFocusBeatReadinessRouteReadout,
  onFocusComposerGuide,
  onFocusComposerGuideRouteReadout,
  onFocusComposerActionsReadout,
  onRunComposerAction,
  onRunNextMove,
  onFocusExportPreflight,
  onFocusExportPreflightRouteReadout,
  onFocusFinishChecklist,
  onFocusFinishChecklistRouteReadout,
  onFocusGrooveCompass,
  onFocusGrooveCompassRouteReadout,
  onFocusHandoffExportFormat,
  onFocusHandoffPack,
  onFocusHandoffManifestAudit,
  onFocusHandoffPackageCheck,
  onFocusHookReadiness,
  onFocusHookReadinessRouteReadout,
  onFocusKeyCompass,
  onFocusKeyCompassRouteReadout,
  onFocusListeningPass,
  onFocusListeningPassRouteReadout,
  onFocusLoopScope,
  onFocusMetronomeReadout,
  onFocusTransportPositionReadout,
  onFocusMixCoach,
  onFocusExportMeter,
  onFocusMasterOutputRole,
  onFocusModeFocus,
  onFocusPatternDna,
  onFocusPatternCueReadout,
  onFocusPatternPlaybackReadout,
  onFocusPatternSwitchReadout,
  onFocusPatternUseReadout,
  onFocusProductionSnapshot,
  onFocusProductionSnapshotRouteReadout,
  onFocusReferenceAlignment,
  onFocusReferenceAlignmentRouteReadout,
  onFocusSnapshotCompare,
  onFocusReviewQueue,
  onFocusReviewQueueRouteReadout,
  onApplyReviewFix,
  onFocusSessionPass,
  onFocusSessionPassRouteReadout,
  onFocusStyleInspector,
  onFocusToplineSpace,
  onFocusToplineSpaceRouteReadout,
  onFocusWorkflowNavigatorRouteReadout,
  onFocusWorkflowSpotlightRouteReadout,
  onFocusWorkflowSpotlight,
  onJumpWorkflowZone,
  onFocusQuickActionsRouteReadout,
  onFocusCommandReferenceRouteReadout,
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
  audienceSessionReadoutSummary: AudienceSessionReadoutSummary;
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
  patternContrastRoleMapSummary: PatternContrastRoleMapSummary;
  patternContrastSectionFitSummary: PatternContrastSectionFitSummary;
  patternContrastSummary: PatternContrastSummary;
  patternChainPreviewSummary: PatternChainPreviewSummary;
  patternStackOptions: PatternStackOption[];
  patternStackPreviewSummary: PatternStackPreviewSummary;
  patternFillPreviewPreset: PatternFillPreset;
  patternVariationPreviewPreset: PatternVariationPreset;
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
  quickActionRouteQuery: string;
  quickActionRouteScope: QuickActionScopeId;
  quickActionPinnedCount: number;
  quickActionRecentCount: number;
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
  onFocusBassMoveRouteReadout: () => void;
  onApplyBeatSpine: (action: BeatSpineAction) => void;
  onApplyBlueprint: (blueprintId: BeatBlueprintId) => void;
  onApplyChordPad: (pad: ChordPadId) => void;
  onApplyChordRhythm: (rhythm: ChordRhythmId) => void;
  onApplyChordVoicing: (voicing: ChordVoicingId) => void;
  onFocusChordMoveRouteReadout: () => void;
  onAlignDeliveryTarget: (target: DeliveryTargetId) => void;
  onSelectDeliveryTarget: (target: DeliveryTargetId) => void;
  onApplyDrumAccent: (accent: DrumAccentId) => void;
  onApplyDrumFoundation: (foundation: DrumFoundationId) => void;
  onApplyDrumKit: (pad: DrumKitPadId) => void;
  onFocusDrumKitReadout: () => void;
  onFocusDrumKitRouteReadout: () => void;
  onFocusDrumMoveRouteReadout: () => void;
  onApplyGrooveFeel: (feel: GrooveFeelId) => void;
  onApplyLayerStarter: (starterId: LayerStarterId) => void;
  onFocusLayerStarterReadout: () => void;
  onApplyMasterAutomation: (pad: MasterAutomationPadId) => void;
  onFocusMasterAutomationReadout: () => void;
  onFocusMasterAutomationRouteReadout: () => void;
  onApplyMasterFinish: (pad: MasterFinishPadId) => void;
  onFocusMasterFinishReadout: () => void;
  onFocusMasterFinishRouteReadout: () => void;
  onApplyMelodyMotif: (motif: MelodyMotifId) => void;
  onApplyMelodyAccent: (accent: MelodyAccentId) => void;
  onApplyMelodyContour: (contour: MelodyContourId) => void;
  onFocusMelodyMoveRouteReadout: () => void;
  onApplyMixBalance: (pad: MixBalancePadId) => void;
  onApplyMixFix: (preset: MixFixPreset) => void;
  onFocusMixBalanceReadout: () => void;
  onFocusMixBalanceRouteReadout: () => void;
  onCaptureMixSnapshot: (slot: MixSnapshotSlotId) => void;
  onRecallMixSnapshot: (slot: MixSnapshotSlotId) => void;
  onClearMixSnapshots: () => void;
  onFocusMixSnapshotReadout: () => void;
  onFocusMixSnapshotRouteReadout: () => void;
  onFocusSpaceFxReadout: () => void;
  onFocusSpaceFxRouteReadout: () => void;
  onFocusPatternChainReadout: () => void;
  onFocusChainExpandReadout: () => void;
  onApplyPatternChain: (chain: PatternChainId) => void;
  onApplyPatternClone: (target: PatternSlot, preset: PatternVariationPreset) => void;
  onFocusPatternCloneReadout: () => void;
  onApplyPatternFill: (preset: PatternFillPreset) => void;
  onFocusPatternFillReadout: () => void;
  onApplyPatternVariation: (preset: PatternVariationPreset) => void;
  onFocusPatternVariationReadout: () => void;
  onFocusPatternContrastReadout: () => void;
  onFocusPatternContrastRoleMapReadout: () => void;
  onFocusPatternContrastSectionFitReadout: () => void;
  onApplyPatternStack: (stack: PatternStackId) => void;
  onFocusPatternStackReadout: () => void;
  onCopySelectedPattern: (target: PatternSlot) => void;
  onClearSelectedPattern: () => void;
  onFocusPatternCopyClearReadout: () => void;
  onApplySpaceFx: (pad: SpaceFxPadId) => void;
  onApplyStemAudition: (pad: StemAuditionPadId) => void;
  onFocusStemAuditionReadout: () => void;
  onFocusStemAuditionRouteReadout: () => void;
  onApplySoundFocus: (pad: SoundFocusPadId) => void;
  onFocusSoundFocusReadout: () => void;
  onFocusSoundFocusRouteReadout: () => void;
  onApplySoundPreset: (preset: SoundPresetTarget) => void;
  onFocusSoundPresetReadout: () => void;
  onFocusSoundPresetRouteReadout: () => void;
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
  onSelectAudienceSessionRow: (row: AudienceSessionReadoutRow) => void;
  onCreateAudienceStarter: (starterId: AudienceStarterProjectId) => void;
  onFocusAudienceDeliveryProofBridgeReadout: () => void;
  onFocusAudienceSessionAcceptanceReadout: () => void;
  onFocusAudienceSessionProofHandoffReadout: () => void;
  onFocusAudienceRouteBridgeReadout: () => void;
  onFocusAudienceCompletionRouteReadout: () => void;
  onFocusDualAudienceReadinessRouteReadout: () => void;
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
  onExportDeliveryBundle: () => void;
  onExportHandoffSheet: () => void;
  onExportMidi: () => void;
  onExportStems: () => void;
  onExportWav: () => void;
  onFocusDirectExportsReadout: () => void;
  onFocusHandoffNextExportReadout: () => void;
  onFocusBeatMapRouteReadout: () => void;
  onFocusStructureLensRouteReadout: () => void;
  onFocusNextMoveRouteReadout: () => void;
  onJumpFirstBeatPath: (step: FirstBeatPathStep) => void;
  onJumpBeatSpine: (card: BeatSpineCard) => void;
  onFocusBeatPassport: (metric: BeatPassportFocusItem) => void;
  onFocusBeatPassportRouteReadout: () => void;
  onFocusBeatReadiness: (check: BeatReadinessCheck) => void;
  onFocusBeatReadinessRouteReadout: () => void;
  onFocusComposerGuide: (card: ComposerGuideCard) => void;
  onFocusComposerGuideRouteReadout: () => void;
  onFocusComposerActionsReadout: () => void;
  onRunComposerAction: (action: ComposerAction) => void;
  onRunNextMove: (action: NextMoveAction) => void;
  onFocusExportPreflight: (card: ExportPreflightFocusItem) => void;
  onFocusExportPreflightRouteReadout: () => void;
  onFocusFinishChecklist: (card: FinishChecklistCard) => void;
  onFocusFinishChecklistRouteReadout: () => void;
  onFocusGrooveCompass: (item: GrooveCompassFocusItem) => void;
  onFocusGrooveCompassRouteReadout: () => void;
  onFocusHandoffExportFormat: (metric: HandoffExportFormatMetric) => void;
  onFocusHandoffPack: () => void;
  onFocusHandoffManifestAudit: () => void;
  onFocusHandoffPackageCheck: (card: HandoffPackageCheckCard) => void;
  onFocusHookReadiness: (card: HookReadinessFocusItem) => void;
  onFocusHookReadinessRouteReadout: () => void;
  onFocusKeyCompass: (item: KeyCompassFocusItem) => void;
  onFocusKeyCompassRouteReadout: () => void;
  onFocusListeningPass: (item: ListeningPassItem) => void;
  onFocusListeningPassRouteReadout: () => void;
  onFocusLoopScope: () => void;
  onFocusMetronomeReadout: () => void;
  onFocusTransportPositionReadout: () => void;
  onFocusMixCoach: (check: MixCoachCheck) => void;
  onFocusExportMeter: () => void;
  onFocusMasterOutputRole: () => void;
  onFocusModeFocus: (card: ModeFocusCard) => void;
  onFocusPatternDna: (card: PatternDnaCard) => void;
  onFocusPatternCueReadout: () => void;
  onFocusPatternPlaybackReadout: () => void;
  onFocusPatternSwitchReadout: () => void;
  onFocusPatternUseReadout: () => void;
  onFocusProductionSnapshot: (metric: ProductionSnapshotFocusItem) => void;
  onFocusProductionSnapshotRouteReadout: () => void;
  onFocusReferenceAlignment: (card: ReferenceAlignmentCard) => void;
  onFocusReferenceAlignmentRouteReadout: () => void;
  onFocusSnapshotCompare: (item: SnapshotCompareFocusItem) => void;
  onFocusReviewQueue: (item: ReviewQueueItem) => void;
  onFocusReviewQueueRouteReadout: () => void;
  onApplyReviewFix: (item?: ReviewQueueItem) => void;
  onFocusSessionPass: (card: SessionPassCard) => void;
  onFocusSessionPassRouteReadout: () => void;
  onFocusStyleInspector: (item: StyleInspectorFocusItem) => void;
  onFocusToplineSpace: (card: ToplineSpaceFocusItem) => void;
  onFocusToplineSpaceRouteReadout: () => void;
  onFocusWorkflowNavigatorRouteReadout: () => void;
  onFocusWorkflowSpotlightRouteReadout: () => void;
  onFocusWorkflowSpotlight: (item: WorkflowNavigatorItem) => void;
  onJumpWorkflowZone: (item: WorkflowNavigatorItem) => void;
  onFocusQuickActionsRouteReadout: () => void;
  onFocusCommandReferenceRouteReadout: () => void;
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
  const commandReferenceRouteSummary = createCommandReferenceRouteReadoutSummary();
  const quickActionsRouteLabel = quickActionScopeDefinitions.map((definition) => definition.label).join(" / ");
  const quickActionsRouteScopeLabel = quickActionScopeLabel(quickActionRouteScope);
  const quickActionsRouteQueryLabel = quickActionRouteQuery.trim() ? `search "${quickActionRouteQuery.trim()}"` : "no search";
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
  const beatMapRouteReadoutSummary = createBeatMapSummary(project, beatReadinessChecks, exportAnalysis, stemAnalyses);
  const beatMapRouteReadoutActionTarget = beatMapActions[0] ?? null;
  const beatMapRouteReadoutStage = beatMapRouteReadoutActionTarget
    ? beatMapStageForNextMoveAction(beatMapRouteReadoutSummary, beatMapRouteReadoutActionTarget)
    : (beatMapRouteReadoutSummary.stages.find((stage) => stage.tone !== "good") ??
      beatMapRouteReadoutSummary.stages[beatMapRouteReadoutSummary.stages.length - 1]);
  const beatMapRouteReadoutAction: QuickAction = {
    id: "beat-map-route-readout-action",
    title: beatMapRouteReadoutActionTarget
      ? `Review Beat Map Route: ${beatMapRouteReadoutStage.label}`
      : "Review Beat Map Route",
    detail: beatMapRouteReadoutActionTarget
      ? [
          beatMapRouteReadoutSummary.headline,
          beatMapRouteReadoutSummary.detail,
          `${beatMapRouteReadoutStage.label} / ${beatMapRouteReadoutStage.status} / ${beatMapRouteReadoutStage.detail}`,
          `Route ${beatMapRouteLabel(beatMapRouteReadoutActionTarget)}`,
          `Direct beat-map-action-${beatMapRouteReadoutActionTarget.id} unchanged`,
          "Beat Map action unchanged",
          "Structure Lens unchanged",
          "Next Move unchanged",
          "Readout only"
        ].join(" / ")
      : "No Beat Map route available.",
    group: "Project",
    keywords: `Quick Actions Beat Map Route Readout review beat map route direct beat-map-action-${
      beatMapRouteReadoutActionTarget?.id ?? "none"
    } start compose arrange polish deliver workflow overview selected pattern target export stems package next move structure lens no action no edit no playback no export sample free beginner producer`,
    disabled: !beatMapRouteReadoutActionTarget,
    resultTargetId: beatMapRouteReadoutActionTarget?.id,
    run: onFocusBeatMapRouteReadout
  };
  const beatMapCommandActions = createNextMoveSourceQuickActions("beat-map", beatMapActions, onRunNextMove);
  const structureLensCommandActions = createNextMoveSourceQuickActions(
    "structure-lens",
    structureLensActions,
    onRunNextMove
  );
  const structureLensRouteReadoutSummary = createStructureLensSummary(project);
  const structureLensRouteReadoutActionTarget = structureLensActions[0] ?? null;
  const structureLensRouteReadoutSignal = structureLensRouteReadoutActionTarget
    ? structureLensSignalForNextMoveAction(structureLensRouteReadoutSummary, structureLensRouteReadoutActionTarget)
    : (structureLensRouteReadoutSummary.signals.find((signal) => signal.tone !== "good") ??
      structureLensRouteReadoutSummary.signals[0]);
  const structureLensRouteReadoutAction: QuickAction = {
    id: "structure-lens-route-readout-action",
    title: structureLensRouteReadoutActionTarget
      ? `Review Structure Lens Route: ${structureLensRouteReadoutSignal.label}`
      : "Review Structure Lens Route",
    detail: structureLensRouteReadoutActionTarget
      ? [
          structureLensRouteReadoutSummary.headline,
          structureLensRouteReadoutSummary.detail,
          `${structureLensRouteReadoutSignal.label} / ${structureLensRouteReadoutSignal.value} / ${structureLensRouteReadoutSignal.detail}`,
          `Route ${structureLensRouteLabel(structureLensRouteReadoutActionTarget)}`,
          `Direct structure-lens-action-${structureLensRouteReadoutActionTarget.id} unchanged`,
          "Structure Lens action unchanged",
          "Beat Map unchanged",
          "Next Move unchanged",
          "Readout only"
        ].join(" / ")
      : "No Structure Lens route available.",
    group: "Arrange",
    keywords: `Quick Actions Structure Lens Route Readout review structure lens route direct structure-lens-action-${
      structureLensRouteReadoutActionTarget?.id ?? "none"
    } target fit section coverage hook contrast energy arc arrangement action next move beat map no action no edit no playback no export sample free beginner producer`,
    disabled: !structureLensRouteReadoutActionTarget,
    resultTargetId: structureLensRouteReadoutActionTarget?.id,
    run: onFocusStructureLensRouteReadout
  };
  const nextMoveRouteReadoutActions = createNextMoveActions(project, beatReadinessChecks, exportAnalysis);
  const nextMoveRouteReadoutActionTarget = nextMoveRouteReadoutActions[0] ?? null;
  const nextMoveRouteReadoutPosture = nextMoveRouteReadoutActionTarget
    ? nextMoveActionPostureMetricSnapshot(project, nextMoveRouteReadoutActionTarget)
    : null;
  const nextMoveRouteReadoutFollowup = nextMoveRouteReadoutActionTarget
    ? nextMoveResultFollowup(nextMoveRouteReadoutActionTarget, project)
    : null;
  const nextMoveRouteReadoutAction: QuickAction = {
    id: "next-move-route-readout-action",
    title: nextMoveRouteReadoutActionTarget
      ? `Review Next Move Route: ${nextMoveRouteReadoutActionTarget.buttonLabel}`
      : "Review Next Move Route",
    detail:
      nextMoveRouteReadoutActionTarget && nextMoveRouteReadoutPosture && nextMoveRouteReadoutFollowup
        ? [
            nextMoveRouteReadoutActionTarget.title,
            nextMoveRouteReadoutActionTarget.detail,
            `Route ${nextMoveRouteLabel(nextMoveRouteReadoutActionTarget)}`,
            `${nextMoveRouteReadoutPosture.label} / ${nextMoveRouteReadoutPosture.value}`,
            `Direct next-move-action-${nextMoveRouteReadoutActionTarget.id} unchanged`,
            "Next Move action unchanged",
            "Beat Map unchanged",
            "Structure Lens unchanged",
            nextMoveRouteReadoutFollowup.auditionCue,
            nextMoveRouteReadoutFollowup.nextCheck,
            "Readout only"
          ].join(" / ")
        : "No Next Move route available.",
    group: "Project",
    keywords: `Quick Actions Next Move Route Readout review recommended action route direct next-move-action-${
      nextMoveRouteReadoutActionTarget?.id ?? "none"
    } readiness export stems delivery target selected pattern beat map structure lens workflow navigator spotlight no action no edit no playback no export sample free beginner producer`,
    disabled: !nextMoveRouteReadoutActionTarget,
    resultTargetId: nextMoveRouteReadoutActionTarget?.id,
    run: onFocusNextMoveRouteReadout
  };
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
  const beatReadinessRouteReadoutAction: QuickAction = {
    id: "beat-readiness-route-readout-action",
    title: beatReadinessCheck
      ? `Review Beat Readiness Route: ${beatReadinessCheck.label}`
      : "Review Beat Readiness Route",
    detail: beatReadinessCheck
      ? `${beatReadinessRouteLabel(beatReadinessCheck)} / ${beatReadinessCheck.status} / direct ${beatReadinessCardActionId(
          beatReadinessCheck
        )} unchanged / ${beatReadinessCheck.focusLabel} panel / ${beatReadinessCheck.detail}`
      : "No Beat Readiness check available.",
    group: "Project",
    keywords: `Quick Actions Beat Readiness Route Readout review route readiness direct beat readiness focus command no edit drums 808 bass melody chords arrangement export ${
      beatReadinessCheck?.id ?? "none"
    } ${beatReadinessCheck?.label ?? "none"} ${beatReadinessCheck?.status ?? "none"} ${
      beatReadinessCheck?.focusLabel ?? "none"
    } beginner producer`,
    disabled: !beatReadinessCheck,
    resultTargetId: beatReadinessCheck?.id,
    run: onFocusBeatReadinessRouteReadout
  };
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
  const beatPassportRouteReadoutAction: QuickAction = {
    id: "beat-passport-route-readout-action",
    title: beatPassportMetric ? `Review Beat Passport Route: ${beatPassportMetric.label}` : "Review Beat Passport Route",
    detail: beatPassportMetric
      ? `${beatPassportRouteLabel(beatPassportMetric)} / ${beatPassportMetric.value} / direct beat-passport-metric-${beatPassportMetric.id} unchanged / ${beatPassportMetric.focusLabel} panel / ${beatPassportMetric.detail}`
      : "No Beat Passport metric available.",
    group: "Project",
    keywords: `Quick Actions Beat Passport Route Readout review route identity metric direct beat passport command no edit target length patterns readiness export stems master ${
      beatPassportMetric?.id ?? "none"
    } ${beatPassportMetric?.label ?? "none"} ${beatPassportMetric?.value ?? "none"} ${
      beatPassportMetric?.focusLabel ?? "none"
    } beginner producer sample free`,
    disabled: !beatPassportMetric,
    resultTargetId: beatPassportMetric?.id,
    run: onFocusBeatPassportRouteReadout
  };
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
  const composerGuideRouteReadoutDetail = composerGuideCard
    ? [
        composerGuideCard.status,
        `${composerGuideCard.focusLabel} panel`,
        composerGuideFocusResultMetric(composerGuideSummary),
        composerGuideFocusResultAudition(composerGuideCard),
        composerGuideFocusResultNextCheck(composerGuideCard),
        composerGuideCard.detail,
        `Route ${composerGuideRouteLabel(composerGuideCard, composerGuideSummary)}`,
        `Direct composer-guide-card-${composerGuideCard.id} unchanged`,
        "Readout only"
      ].join(" / ")
    : "No Composer Guide card available.";
  const composerGuideRouteReadoutAction: QuickAction = {
    id: "composer-guide-route-readout-action",
    title: composerGuideCard ? `Review Composer Guide Route: ${composerGuideCard.label}` : "Review Composer Guide Route",
    detail: composerGuideRouteReadoutDetail,
    group: "Create",
    keywords: `Quick Actions Composer Guide Route Readout review writing route direct composer-guide-card-${
      composerGuideCard?.id ?? "none"
    } ${composerGuideCard?.label ?? "none"} ${composerGuideCard?.status ?? "no guide card"} ${
      composerGuideCard?.focusLabel ?? "none"
    } drums 808 bass harmony melody arrange finish selected Pattern ${project.selectedPattern} beginner producer`,
    disabled: !composerGuideCard,
    resultTargetId: composerGuideCard?.id,
    run: onFocusComposerGuideRouteReadout
  };
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
  const composerActionsReadoutMove = composerActionsSummary.actions[0] ?? null;
  const composerActionsReadoutDetail = composerActionsReadoutMove
    ? [
        composerActionsSummary.headline,
        composerActionsReadoutMove.label,
        quickActionComposerActionAreaLabel(composerActionsReadoutMove.area),
        `Route ${quickActionComposerActionRouteLabel(composerActionsReadoutMove, composerActionsReadoutMove.area)}`,
        composerActionsReadoutMove.scope,
        composerActionsReadoutMove.impact,
        composerActionsReadoutMove.safety,
        `Pattern ${project.selectedPattern}`,
        `${patternEventTotal(activePattern(project))} editable events`,
        "direct composer-action preflight"
      ].join(" / ")
    : `${composerActionsSummary.headline} / no Composer Action move available / direct composer-action preflight`;
  const composerActionsReadoutAction: QuickAction = {
    id: "composer-actions-readout-action",
    title: composerActionsReadoutMove
      ? `Review Composer Actions Readout: ${composerActionsReadoutMove.buttonLabel}`
      : "Review Composer Actions Readout",
    detail: composerActionsReadoutDetail,
    group: "Create",
    keywords: `composer actions readout review current style aware writing move route scope impact undo posture selected pattern pattern a b c drums 808 harmony melody arrangement export readiness audition next direct composer-action preflight sample free beginner producer ${
      composerActionsReadoutMove?.id ?? "none"
    } ${composerActionsReadoutMove?.label ?? "none"} ${composerActionsReadoutMove?.area ?? "none"}`,
    run: onFocusComposerActionsReadout
  };
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
  const exportPreflightRouteReadoutAction: QuickAction = {
    id: "export-preflight-route-readout-action",
    title: exportPreflightCard
      ? `Review Export Preflight Route: ${exportPreflightCard.label}`
      : "Review Export Preflight Route",
    detail: exportPreflightCard
      ? `${exportPreflightRouteLabel(exportPreflightCard)} / ${exportPreflightCard.value} / direct export-preflight-card-${exportPreflightCard.id} unchanged / ${exportPreflightCard.focusLabel} panel`
      : "No Export Preflight card available.",
    group: "Export",
    keywords: `Quick Actions Export Preflight Route Readout review route preflight delivery risk direct export preflight focus command no export readiness mix master automation deliverables handoff ${
      exportPreflightCard?.id ?? "none"
    } ${exportPreflightCard?.label ?? "none"} ${exportPreflightCard?.value ?? "none"} ${
      exportPreflightCard?.focusLabel ?? "none"
    } beginner producer`,
    disabled: !exportPreflightCard,
    resultTargetId: exportPreflightCard?.id,
    run: onFocusExportPreflightRouteReadout
  };
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
  const finishChecklistRouteReadoutAction: QuickAction = {
    id: "finish-checklist-route-readout-action",
    title: finishChecklistCard
      ? `Review Finish Checklist Route: ${finishChecklistCard.label}`
      : "Review Finish Checklist Route",
    detail: finishChecklistCard
      ? `${finishChecklistRouteLabel(finishChecklistCard)} / ${finishChecklistCard.status} / direct finish-checklist-card-${finishChecklistCard.id} unchanged / ${finishChecklistCard.focusLabel} panel`
      : "No Finish Checklist card available.",
    group: "Project",
    keywords: `Quick Actions Finish Checklist Route Readout review route finish readiness direct finish checklist command no edit compose arrange mix master automation handoff ${
      finishChecklistCard?.id ?? "none"
    } ${finishChecklistCard?.label ?? "none"} ${finishChecklistCard?.status ?? "none"} ${
      finishChecklistCard?.focusLabel ?? "none"
    } beginner producer sample free`,
    disabled: !finishChecklistCard,
    resultTargetId: finishChecklistCard?.id,
    run: onFocusFinishChecklistRouteReadout
  };
  const grooveCompassItem = activeGrooveCompassQuickActionItem(grooveCompassSummary);
  const grooveCompassRouteReadoutDetail = grooveCompassItem
    ? [
        grooveCompassItem.value,
        `${grooveCompassItem.focusLabel} panel`,
        grooveCompassFocusResultMetric(grooveCompassSummary),
        grooveCompassFocusResultAudition(grooveCompassItem),
        grooveCompassFocusResultNextCheck(grooveCompassItem),
        grooveCompassItem.detail,
        `Route ${grooveCompassRouteLabel(grooveCompassItem, grooveCompassSummary)}`,
        `Direct groove-compass-card-${grooveCompassItem.id} unchanged`,
        "Readout only"
      ].join(" / ")
    : "No Groove Compass card available.";
  const grooveCompassRouteReadoutAction: QuickAction = {
    id: "groove-compass-route-readout-action",
    title: grooveCompassItem ? `Review Groove Compass Route: ${grooveCompassItem.label}` : "Review Groove Compass Route",
    detail: grooveCompassRouteReadoutDetail,
    group: "Create",
    keywords: `Quick Actions Groove Compass Route Readout review pocket route direct groove-compass-card-${
      grooveCompassItem?.id ?? "none"
    } ${grooveCompassItem?.label ?? "none"} ${grooveCompassItem?.value ?? "no groove card"} ${
      grooveCompassItem?.focusLabel ?? "none"
    } density anchors hats timing chance pocket selected drum Pattern ${project.selectedPattern} beginner producer`,
    disabled: !grooveCompassItem,
    resultTargetId: grooveCompassItem?.id,
    run: onFocusGrooveCompassRouteReadout
  };
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
  const keyCompassRouteReadoutDetail = keyCompassItem
    ? [
        keyCompassItem.value,
        `${keyCompassItem.focusLabel} panel`,
        keyCompassFocusResultMetric(keyCompassSummary),
        keyCompassFocusResultAudition(keyCompassItem),
        keyCompassFocusResultNextCheck(keyCompassItem),
        keyCompassItem.detail,
        `Route ${keyCompassRouteLabel(keyCompassItem, keyCompassSummary)}`,
        `Direct key-compass-card-${keyCompassItem.id} unchanged`,
        "Readout only"
      ].join(" / ")
    : "No Key Compass card available.";
  const keyCompassRouteReadoutAction: QuickAction = {
    id: "key-compass-route-readout-action",
    title: keyCompassItem ? `Review Key Compass Route: ${keyCompassItem.label}` : "Review Key Compass Route",
    detail: keyCompassRouteReadoutDetail,
    group: "Create",
    keywords: `Quick Actions Key Compass Route Readout review harmony route direct key-compass-card-${
      keyCompassItem?.id ?? "none"
    } ${keyCompassItem?.label ?? "none"} ${keyCompassItem?.value ?? "no key card"} ${
      keyCompassItem?.focusLabel ?? "none"
    } scale cadence chords 808 bass melody selected note selected chord Pattern ${project.selectedPattern} key ${project.key} beginner producer`,
    disabled: !keyCompassItem,
    resultTargetId: keyCompassItem?.id,
    run: onFocusKeyCompassRouteReadout
  };
  const keyCompassActions: QuickAction[] = keyCompassSummary.cards.map((item) => ({
    id: `key-compass-card-${item.id}`,
    title: `Focus Key Compass: ${item.label}`,
    detail: `${item.value} / ${item.focusLabel} / ${item.detail}`,
    group: "Create",
    keywords: `key compass focus card harmony cadence resolution scale chord 808 bass melody selected note selected chord inspect ${item.id} ${item.label} ${item.value} ${item.focusLabel} ${item.detail} beginner producer`,
    run: () => onFocusKeyCompass(item)
  }));
  const layerStarterOption = activeLayerStarterQuickActionOption(layerStarterOptions);
  const layerStarterReadiness = layerStarterOptions.map((option) => `${option.label} ${option.status}`).join(" / ");
  const layerStarterReadoutAction: QuickAction = {
    id: "layer-starter-readout-action",
    title: layerStarterOption
      ? `Review Layer Starter Readout: ${layerStarterOption.label}`
      : "Review Layer Starter Readout: Layers ready",
    detail: layerStarterOption
      ? `${layerStarterOption.status} / priority ${layerStarterOption.label} / ${layerStarterOption.detail} / direct starter preflight`
      : "Layers ready / no missing or thin starter / direct starter preflight",
    group: "Create",
    keywords: `Quick Actions Layer Starter Readout review selected Pattern ${project.selectedPattern} ${layerStarterReadiness} priority ${
      layerStarterOption?.label ?? "ready"
    } drums 808 chords synth readiness arrangement beginner producer`,
    run: onFocusLayerStarterReadout
  };
  const layerStarterRouteReadoutAction: QuickAction = {
    id: "layer-starter-route-readout-action",
    title: layerStarterOption
      ? `Review Layer Starter Route Readout: ${layerStarterOption.label}`
      : "Review Layer Starter Route Readout: Layers ready",
    detail: layerStarterOption
      ? `${layerStarterOption.status} / route ${layerStarterRouteLabel(layerStarterOption)} / ${layerStarterOption.detail} / starter route preflight`
      : "Layers ready / no starter route needed / starter route preflight",
    group: "Create",
    keywords: `Quick Actions Layer Starter Route Readout review selected Pattern ${
      project.selectedPattern
    } route direct starter command ${layerStarterReadiness} priority ${layerStarterOption?.label ?? "ready"} ${
      layerStarterOption ? layerStarterRouteLabel(layerStarterOption) : "ready"
    } drums 808 chords synth readiness arrangement beginner producer sample free`,
    run: onFocusLayerStarterReadout
  };
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
  const listeningPassRouteReadoutAction: QuickAction = {
    id: "listening-pass-route-readout-action",
    title: listeningPassItem
      ? `Review Listening Pass Route: ${listeningPassItem.label}`
      : "Review Listening Pass Route",
    detail: listeningPassItem
      ? `${listeningPassRouteLabel(listeningPassItem)} / ${listeningPassItem.status} / direct listening-pass-checkpoint-${listeningPassItem.id} unchanged / ${listeningPassItem.focusLabel} panel / ${listeningPassItem.detail}`
      : "No Listening Pass checkpoint available.",
    group: "Project",
    keywords: `Quick Actions Listening Pass Route Readout review route audition checkpoint selected Pattern ${
      project.selectedPattern
    } direct listening pass checkpoint command composition arrangement mix delivery ${listeningPassItem?.id ?? "none"} ${
      listeningPassItem ? listeningPassRouteLabel(listeningPassItem) : "none"
    } ${listeningPassItem?.focusLabel ?? "none"} ${listeningPassItem?.cue ?? "none"} beginner producer sample free`,
    disabled: !listeningPassItem,
    resultTargetId: listeningPassItem?.id,
    run: onFocusListeningPassRouteReadout
  };
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
  const mixSnapshotRouteCommand = `mix-snapshot-${mixSnapshotComparison.decisionActionId}`;
  const mixSnapshotRouteReadoutAction: QuickAction = {
    id: "mix-snapshot-route-readout-action",
    title: `Review Mix Snapshot Route: ${mixSnapshotComparison.decisionActionLabel}`,
    detail: `${mixSnapshotRouteLabel(mixSnapshotComparison.decisionActionId)} / ${mixSnapshotComparison.statusLabel} / ${mixSnapshotComparison.decisionLabel} / direct ${mixSnapshotRouteCommand} unchanged`,
    group: "Mix",
    keywords: `Quick Actions Mix Snapshot Route Readout review route preflight capture recall clear listen next ab headroom balance master stems ${
      mixSnapshotComparison.decisionActionId
    } ${mixSnapshotComparison.decisionActionLabel} ${mixSnapshotComparison.decisionLabel} ${
      mixSnapshotComparison.statusLabel
    } beginner producer mix snapshot route no apply`,
    resultTargetId: mixSnapshotComparison.decisionActionId,
    run: onFocusMixSnapshotRouteReadout
  };
  const mixBalancePreviewPad =
    mixBalancePadOptions.find((pad) => pad.id === mixBalancePreviewSummary.padId) ?? mixBalancePadOptions[0];
  const mixBalanceRouteTarget = mixBalancePreviewPad
    ? mixBalanceRouteLabel(project.mixer, applyMixBalancePadToMixer(project.mixer, mixBalancePreviewPad))
    : "No Mix Balance route needed";
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
  const mixBalanceRouteReadoutAction: QuickAction = {
    id: "mix-balance-route-readout-action",
    title: `Review Mix Balance Route: ${mixBalancePreviewSummary.padLabel}`,
    detail: `${mixBalanceRouteTarget} / ${mixBalancePreviewSummary.statusLabel} / ${mixBalancePreviewSummary.moveLabel} / direct Mix Balance unchanged`,
    group: "Mix",
    keywords: `Quick Actions Mix Balance Route Readout review route preflight rough balance direct mix balance command no apply drums 808 bass synth chords stem audition ${
      mixBalancePreviewSummary.padId
    } ${mixBalancePreviewSummary.padLabel} ${mixBalanceRouteTarget} ${
      mixBalancePreviewSummary.channelLabel
    } mix balance route preflight beginner producer manual trim`,
    run: onFocusMixBalanceRouteReadout
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
  const stemAuditionRoutePad = stemAuditionDecision.targetId
    ? stemAuditionPadOptions.find((pad) => pad.id === stemAuditionDecision.targetId) ?? null
    : null;
  const stemAuditionRouteTarget = stemAuditionRoutePad
    ? stemAuditionRouteLabel(stemAuditionRoutePad)
    : "No Stem Audition route available";
  const stemAuditionRouteCommand = stemAuditionRoutePad ? `stem-audition-${stemAuditionRoutePad.id}` : "stem-audition";
  const stemAuditionRouteReadoutAction: QuickAction = {
    id: "stem-audition-route-readout-action",
    title: `Review Stem Audition Route: ${stemAuditionDecision.targetLabel}`,
    detail: `${stemAuditionRouteTarget} / ${stemAuditionReadout.roleLabel} / ${stemAuditionDecision.statusLabel} / direct ${stemAuditionRouteCommand} unchanged`,
    group: "Mix",
    keywords: `Quick Actions Stem Audition Route Readout review route preflight full mix drums 808 bass synth chords solo mute direct stem audition command no apply ${
      stemAuditionDecision.targetId ?? "none"
    } ${stemAuditionDecision.targetLabel} ${stemAuditionRouteTarget} ${
      stemAuditionReadout.roleLabel
    } stem audition route preflight beginner producer direct composition sample free`,
    run: onFocusStemAuditionRouteReadout
  };
  const bassMoveTarget = activeBassMoveQuickActionTarget(project, bassMovePreviewSummary);
  const chordMoveTarget = activeChordMoveQuickActionTarget(project, selectedChord, chordMovePreviewSummary);
  const drumMoveTarget = activeDrumMoveQuickActionTarget(project, drumMovePreviewSummary);
  const melodyMoveTarget = activeMelodyMoveQuickActionTarget(project, melodyMovePreviewSummary);
  const bassMoveRouteReadoutAction: QuickAction = {
    id: "808-move-route-readout-action",
    title: bassMoveTarget
      ? `Review 808 Move Route Readout: ${bassMoveTarget.label} ${bassMoveTarget.kind}`
      : "Review 808 Move Route Readout: 808 aligned",
    detail: bassMoveTarget
      ? `${bassMovePreviewSummary.phraseLabel} / route ${bassMoveRouteLabel(
          bassMoveTarget
        )} / direct command 808-move / ${bassMovePreviewSummary.moveLabel} / 808 route preflight`
      : `${bassMovePreviewSummary.statusLabel} / no 808 move route needed / ${bassMovePreviewSummary.moveLabel} / 808 route preflight`,
    group: "Create",
    keywords: `Quick Actions 808 Move Route Readout review selected Pattern ${
      project.selectedPattern
    } route direct 808 bass command 808-move ${
      bassMoveTarget ? `${bassMoveTarget.kind} ${bassMoveRouteLabel(bassMoveTarget)} ${bassMoveTarget.label}` : "808 aligned"
    } ${bassMovePreviewSummary.statusLabel} ${bassMovePreviewSummary.basslineLabel} ${
      bassMovePreviewSummary.glideLabel
    } ${bassMovePreviewSummary.contourLabel} ${bassMovePreviewSummary.moveLabel} low end bassline glide contour rhythm chance range beginner producer sample free`,
    run: onFocusBassMoveRouteReadout
  };
  const drumMoveRouteReadoutAction: QuickAction = {
    id: "drum-move-route-readout-action",
    title: drumMoveTarget
      ? `Review Drum Move Route Readout: ${drumMoveTarget.label} ${drumMoveTarget.kind}`
      : "Review Drum Move Route Readout: Drums aligned",
    detail: drumMoveTarget
      ? `${drumMovePreviewSummary.patternLabel} / route ${drumMoveRouteLabel(
          drumMoveTarget
        )} / direct command drum-move / ${drumMovePreviewSummary.moveLabel} / drum route preflight`
      : `${drumMovePreviewSummary.statusLabel} / no drum move route needed / ${drumMovePreviewSummary.moveLabel} / drum route preflight`,
    group: "Create",
    keywords: `Quick Actions Drum Move Route Readout review selected Pattern ${
      project.selectedPattern
    } route direct drum command drum-move ${
      drumMoveTarget ? `${drumMoveTarget.kind} ${drumMoveRouteLabel(drumMoveTarget)} ${drumMoveTarget.label}` : "drums aligned"
    } ${drumMovePreviewSummary.statusLabel} ${drumMovePreviewSummary.foundationLabel} ${
      drumMovePreviewSummary.feelLabel
    } ${drumMovePreviewSummary.accentLabel} ${drumMovePreviewSummary.moveLabel} rhythm pocket foundation feel accent velocity chance timing hats percussion beginner producer sample free`,
    run: onFocusDrumMoveRouteReadout
  };
  const melodyMoveRouteReadoutAction: QuickAction = {
    id: "melody-move-route-readout-action",
    title: melodyMoveTarget
      ? `Review Melody Move Route Readout: ${melodyMoveTarget.label} ${melodyMoveTarget.kind}`
      : "Review Melody Move Route Readout: Melody aligned",
    detail: melodyMoveTarget
      ? `${melodyMovePreviewSummary.phraseLabel} / route ${melodyMoveRouteLabel(
          melodyMoveTarget
        )} / direct command melody-move / ${melodyMovePreviewSummary.moveLabel} / melody route preflight`
      : `${melodyMovePreviewSummary.statusLabel} / no melody move route needed / ${melodyMovePreviewSummary.moveLabel} / melody route preflight`,
    group: "Create",
    keywords: `Quick Actions Melody Move Route Readout review selected Pattern ${
      project.selectedPattern
    } route direct melody synth command melody-move ${
      melodyMoveTarget
        ? `${melodyMoveTarget.kind} ${melodyMoveRouteLabel(melodyMoveTarget)} ${melodyMoveTarget.label}`
        : "melody aligned"
    } ${melodyMovePreviewSummary.statusLabel} ${melodyMovePreviewSummary.motifLabel} ${
      melodyMovePreviewSummary.accentLabel
    } ${melodyMovePreviewSummary.contourLabel} ${melodyMovePreviewSummary.moveLabel} synth hook phrase motif accent contour rhythm density chance range beginner producer sample free`,
    run: onFocusMelodyMoveRouteReadout
  };
  const chordMoveRouteReadoutAction: QuickAction = {
    id: "chord-move-route-readout-action",
    title: chordMoveTarget
      ? `Review Chord Move Route Readout: ${chordMoveTarget.label} ${chordMoveTarget.kind}`
      : `Review Chord Move Route Readout: ${chordMovePreviewSummary.statusLabel}`,
    detail: chordMoveTarget
      ? `${chordMovePreviewSummary.selectedLabel} / route ${chordMoveRouteLabel(
          chordMoveTarget
        )} / direct command chord-move / ${chordMovePreviewSummary.moveLabel} / harmony route preflight`
      : `${chordMovePreviewSummary.statusLabel} / ${chordMovePreviewSummary.selectedLabel} / no chord move route needed / ${chordMovePreviewSummary.moveLabel} / harmony route preflight`,
    group: "Create",
    keywords: `Quick Actions Chord Move Route Readout review selected Pattern ${
      project.selectedPattern
    } route direct chord harmony command chord-move ${
      chordMoveTarget
        ? `${chordMoveTarget.kind} ${chordMoveRouteLabel(chordMoveTarget)} ${chordMoveTarget.label}`
        : "chord route unavailable"
    } ${chordMovePreviewSummary.statusLabel} ${chordMovePreviewSummary.selectedLabel} ${
      chordMovePreviewSummary.harmonicLabel
    } ${chordMovePreviewSummary.rhythmLabel} ${chordMovePreviewSummary.voicingLabel} ${
      chordMovePreviewSummary.moveLabel
    } chord pads rhythm voicing inversion color chance velocity beginner producer sample free`,
    run: onFocusChordMoveRouteReadout
  };
  const modeFocusCard = activeModeFocusQuickActionCard(modeFocusSummary);
  const modeFocusActions: QuickAction[] = modeFocusSummary.cards.map((card) => ({
    id: `mode-focus-card-${card.id}`,
    title: `Jump Mode Focus: ${card.label}`,
    detail: modeFocusCommandDetail(card, modeFocusSummary),
    group: "Project",
    keywords: `mode focus jump card guided studio orientation stage writing check scan issue handoff ${card.id} ${card.label} ${card.value} ${card.focusLabel} ${card.detail} beginner producer`,
    run: () => onFocusModeFocus(card)
  }));
  const audienceSessionActions = createAudienceSessionQuickActions({
    onCreateStarter: onCreateAudienceStarter,
    onSelectAudience: onSelectAudienceSessionRow,
    summary: audienceSessionReadoutSummary
  });
  const audienceDeliveryProofBridgeActions = createAudienceDeliveryProofBridgeQuickActions({
    exportPreflightSummary,
    handoffPackageCheckSummary,
    onFocusExportPreflight,
    onFocusHandoffPackageCheck,
    onFocusRouteReadout: onFocusAudienceDeliveryProofBridgeReadout,
    rows: audienceSessionReadoutSummary.rows
  });
  const audienceSessionProofHandoffActions = createAudienceSessionProofHandoffQuickActions({
    exportPreflightSummary,
    handoffPackageCheckSummary,
    onFocusExportPreflight,
    onFocusHandoffPackageCheck,
    onFocusRouteReadout: onFocusAudienceSessionProofHandoffReadout,
    rows: audienceSessionReadoutSummary.rows
  });
  const audienceSessionAcceptanceActions = createAudienceSessionAcceptanceQuickActions({
    exportPreflightSummary,
    handoffPackageCheckSummary,
    onFocusExportPreflight,
    onFocusHandoffPackageCheck,
    onFocusRouteReadout: onFocusAudienceSessionAcceptanceReadout,
    rows: audienceSessionReadoutSummary.rows
  });
  const audienceRouteBridgeSummary = createAudienceRouteBridgeSummary({
    audienceSessionSummary: audienceSessionReadoutSummary,
    beatReadinessChecks,
    exportPreflightSummary,
    firstBeatPathSummary,
    handoffPackageCheckSummary,
    productionSnapshotSummary,
    sessionPassSummary
  });
  const audienceRouteBridgeActions = createAudienceRouteBridgeQuickActions({
    bridgeSummary: audienceRouteBridgeSummary,
    onFocusExportPreflight,
    onFocusHandoffPackageCheck,
    onFocusProductionSnapshot,
    onFocusRouteReadout: onFocusAudienceRouteBridgeReadout,
    onJumpFirstBeatPath
  });
  const dualAudienceReadinessRows = createDualAudienceReadinessRows({
    beatReadinessChecks,
    exportPreflightSummary,
    firstBeatPathSummary,
    productionSnapshotSummary,
    sessionPassSummary
  });
  const dualAudienceReadinessActions = createDualAudienceReadinessQuickActions({
    onFocusExportPreflight,
    onFocusProductionSnapshot,
    onFocusRouteReadout: onFocusDualAudienceReadinessRouteReadout,
    onJumpFirstBeatPath,
    rows: dualAudienceReadinessRows
  });
  const audienceCompletionRouteRows = createAudienceCompletionRouteRows({
    beatReadinessChecks,
    exportPreflightSummary,
    firstBeatPathSummary,
    handoffPackageCheckSummary,
    productionSnapshotSummary,
    sessionPassSummary
  });
  const audienceCompletionRouteActions = createAudienceCompletionRouteQuickActions({
    onFocusExportPreflight,
    onFocusHandoffPackageCheck,
    onFocusProductionSnapshot,
    onFocusRouteReadout: onFocusAudienceCompletionRouteReadout,
    onJumpFirstBeatPath,
    rows: audienceCompletionRouteRows
  });
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
  const productionSnapshotRouteReadoutAction: QuickAction = {
    id: "production-snapshot-route-readout-action",
    title: productionSnapshotMetric
      ? `Review Production Snapshot Route: ${productionSnapshotMetric.label}`
      : "Review Production Snapshot Route",
    detail: productionSnapshotMetric
      ? `${productionSnapshotRouteLabel(productionSnapshotMetric)} / ${productionSnapshotMetric.value} / direct production-snapshot-metric-${productionSnapshotMetric.id} unchanged / ${productionSnapshotMetric.focusLabel} panel`
      : "No Production Snapshot metric available.",
    group: "Project",
    keywords: `Quick Actions Production Snapshot Route Readout review route session scan metric direct production snapshot command no edit target form patterns mix handoff ${
      productionSnapshotMetric?.id ?? "none"
    } ${productionSnapshotMetric?.label ?? "none"} ${productionSnapshotMetric?.value ?? "none"} ${
      productionSnapshotMetric?.focusLabel ?? "none"
    } beginner producer sample free`,
    disabled: !productionSnapshotMetric,
    resultTargetId: productionSnapshotMetric?.id,
    run: onFocusProductionSnapshotRouteReadout
  };
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
  const hookReadinessRouteReadoutAction: QuickAction = {
    id: "hook-readiness-route-readout-action",
    title: hookReadinessCard ? `Review Hook Readiness Route: ${hookReadinessCard.label}` : "Review Hook Readiness Route",
    detail: hookReadinessCard
      ? [
          hookReadinessCard.value,
          `${hookReadinessCard.focusLabel} panel`,
          hookReadinessSummary.headline,
          hookReadinessSummary.detail,
          hookReadinessCard.detail,
          `Status ${hookReadinessCard.status}`,
          `Cue ${hookLoopCueTarget ? hookLoopCueDetail(hookLoopCueTarget) : "Hook section not in arrangement"}`,
          `Fix ${hookFixOption ? hookFixOption.label : "No hook fix"}`,
          `Route ${hookReadinessRouteLabel(hookReadinessCard, hookReadinessSummary)}`,
          `Direct hook-readiness-card-${hookReadinessCard.id} unchanged`,
          "Hook loop unchanged",
          "Hook fix unchanged",
          "Readout only"
        ].join(" / ")
      : "No Hook Readiness card available.",
    group: "Arrange",
    keywords: `Quick Actions Hook Readiness Route Readout review hook route direct hook-readiness-card-${
      hookReadinessCard?.id ?? "none"
    } section motif contrast mix handoff ${hookReadinessCard?.id ?? "none"} ${
      hookReadinessCard?.label ?? "none"
    } ${hookReadinessCard?.value ?? "none"} ${hookReadinessCard?.focusLabel ?? "none"} ${
      hookReadinessCard?.detail ?? "none"
    } no cue no fix no edit sample free beginner producer`,
    disabled: !hookReadinessCard,
    resultTargetId: hookReadinessCard?.id,
    run: onFocusHookReadinessRouteReadout
  };
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
  const toplineSpaceRouteReadoutAction: QuickAction = {
    id: "topline-space-route-readout-action",
    title: toplineSpaceCard ? `Review Topline Space Route: ${toplineSpaceCard.label}` : "Review Topline Space Route",
    detail: toplineSpaceCard
      ? [
          toplineSpaceCard.value,
          `${toplineSpaceCard.focusLabel} panel`,
          toplineSpaceSummary.headline,
          toplineSpaceSummary.detail,
          toplineSpaceCard.detail,
          `Status ${toplineSpaceCard.status}`,
          `Cue ${toplineLoopCueDetail(toplineLoopCueTarget)}`,
          `Fix ${toplineFixOption ? toplineFixOption.label : "No topline fix"}`,
          `Route ${toplineSpaceRouteLabel(toplineSpaceCard, toplineSpaceSummary)}`,
          `Direct topline-space-card-${toplineSpaceCard.id} unchanged`,
          "Topline loop unchanged",
          "Topline fix unchanged",
          "Readout only"
        ].join(" / ")
      : "No Topline Space card available.",
    group: "Project",
    keywords: `Quick Actions Topline Space Route Readout review topline route direct topline-space-card-${
      toplineSpaceCard?.id ?? "none"
    } pocket lead arrangement mix brief vocal room artist cue ${toplineSpaceCard?.id ?? "none"} ${
      toplineSpaceCard?.label ?? "none"
    } ${toplineSpaceCard?.value ?? "none"} ${toplineSpaceCard?.focusLabel ?? "none"} ${
      toplineSpaceCard?.detail ?? "none"
    } no cue no fix no edit no vocal recording no lyrics sample free beginner producer`,
    disabled: !toplineSpaceCard,
    resultTargetId: toplineSpaceCard?.id,
    run: onFocusToplineSpaceRouteReadout
  };
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
  const reviewQueueRouteReadoutAction: QuickAction = {
    id: "review-queue-route-readout-action",
    title: reviewQueueItem ? `Review Review Queue Route: ${reviewQueueItem.area}` : "Review Review Queue Route",
    detail: reviewQueueItem
      ? `${reviewQueueRouteLabel(reviewQueueItem)} / ${reviewQueueItem.status} / direct review-queue-item-${reviewQueueItem.id} unchanged / review-fix unchanged / ${reviewQueueItem.focusLabel} panel`
      : "No Review Queue item available.",
    group: "Project",
    keywords: `Quick Actions Review Queue Route Readout review route production issue direct review queue command review fix no edit compose arrange mix master deliver ${
      reviewQueueItem?.id ?? "none"
    } ${reviewQueueItem?.area ?? "none"} ${reviewQueueItem?.status ?? "none"} ${
      reviewQueueItem?.focusLabel ?? "none"
    } beginner producer sample free`,
    disabled: !reviewQueueItem,
    resultTargetId: reviewQueueItem?.id,
    run: onFocusReviewQueueRouteReadout
  };
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
  const sessionPassRouteReadoutAction: QuickAction = {
    id: "session-pass-route-readout-action",
    title: `Review Session Pass Route: ${sessionPassCard.label}`,
    detail: [
      sessionPassRouteLabel(sessionPassCard, sessionPassSummary),
      `Destination ${sessionPassCard.focusLabel}`,
      `Session ${sessionPassFocusResultMetric(sessionPassSummary)}`,
      `Context ${sessionPassCard.detail}`,
      `Audition ${sessionPassFocusResultAudition(sessionPassCard)}`,
      `Next ${sessionPassFocusResultNextCheck(sessionPassCard)}`,
      `Direct session-pass-card-${sessionPassCard.id} unchanged`,
      "Readout only"
    ].join(" / "),
    group: "Project",
    keywords: `Quick Actions Session Pass Route Readout review route guided studio finish delivery direct session-pass-card-${sessionPassCard.id} ${sessionPassCard.id} ${sessionPassCard.label} ${sessionPassCard.value} ${sessionPassCard.focusLabel} ${sessionPassCard.detail} current pass route beginner producer`,
    resultTargetId: sessionPassCard.id,
    run: onFocusSessionPassRouteReadout
  };
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
  const referenceAlignmentRouteReadoutAction: QuickAction = {
    id: "reference-alignment-route-readout-action",
    title: `Review Reference Alignment Route: ${referenceAlignmentCard.label}`,
    detail: [
      referenceAlignmentCard.value,
      `${referenceAlignmentCard.focusLabel} panel`,
      referenceAlignmentSummary.headline,
      referenceAlignmentSummary.detail,
      referenceAlignmentCard.detail,
      `Next ${referenceAlignmentCard.nextCheck}`,
      `Route ${referenceAlignmentRouteLabel(referenceAlignmentCard, referenceAlignmentSummary)}`,
      `Direct reference-alignment-card-${referenceAlignmentCard.id} unchanged`,
      "Readout only"
    ].join(" / "),
    group: "Project",
    keywords: `Quick Actions Reference Alignment Route Readout review written reference fit direction form mix listen cue handoff route direct reference-alignment-card-${referenceAlignmentCard.id} ${referenceAlignmentCard.id} ${referenceAlignmentCard.label} ${referenceAlignmentCard.value} ${referenceAlignmentCard.focusLabel} ${referenceAlignmentCard.detail} Session Brief Arrange Mix Master Deliver no audio import sample free beginner producer`,
    resultTargetId: referenceAlignmentCard.id,
    run: onFocusReferenceAlignmentRouteReadout
  };
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
  const workflowNavigatorRouteReadoutAction: QuickAction = {
    id: "workflow-navigator-route-readout-action",
    title: workflowSpotlightItem
      ? `Review Workflow Navigator Route: ${workflowSpotlightItem.label}`
      : "Review Workflow Navigator Route",
    detail: workflowSpotlightItem
      ? [
          workflowSpotlight.statusLabel,
          workflowSpotlight.zoneLabel,
          workflowSpotlight.detailLabel,
          workflowSpotlight.countLabel,
          workflowSpotlightItem.value,
          workflowSpotlightItem.detail,
          `Route ${workflowNavigatorRouteLabel(workflowSpotlightItem, workflowNavigatorItems)}`,
          `Direct workflow-navigator-${workflowSpotlightItem.id} unchanged`,
          "Workflow jump unchanged",
          "Workflow Spotlight unchanged",
          "Readout only"
        ].join(" / ")
      : "No Workflow Navigator route available.",
    group: "Project",
    keywords: `Quick Actions Workflow Navigator Route Readout review workflow route direct workflow-navigator-${
      workflowSpotlightItem?.id ?? "none"
    } compose arrange mix deliver guide beat map structure lens next move selected pattern target export stems ${
      workflowSpotlightItem?.label ?? "none"
    } ${workflowSpotlightItem?.value ?? "none"} ${workflowSpotlightItem?.detail ?? "none"} no jump no edit no playback no export sample free beginner producer`,
    disabled: !workflowSpotlightItem,
    resultTargetId: workflowSpotlightItem?.id,
    run: onFocusWorkflowNavigatorRouteReadout
  };
  const workflowSpotlightRouteReadoutAction: QuickAction = {
    id: "workflow-spotlight-route-readout-action",
    title: workflowSpotlightItem
      ? `Review Workflow Spotlight Route: ${workflowSpotlightItem.label}`
      : "Review Workflow Spotlight Route",
    detail: workflowSpotlightItem
      ? [
          workflowSpotlight.statusLabel,
          workflowSpotlight.zoneLabel,
          workflowSpotlight.detailLabel,
          workflowSpotlight.decisionStatus,
          workflowSpotlight.decisionDetail,
          workflowSpotlight.countLabel,
          workflowSpotlightItem.value,
          workflowSpotlightItem.detail,
          `Route ${workflowSpotlightRouteLabel(workflowSpotlight, workflowSpotlightItem, workflowNavigatorItems)}`,
          "Direct workflow-spotlight-focus unchanged",
          "Workflow Navigator jump unchanged",
          "Readout only"
        ].join(" / ")
      : "No Workflow Spotlight route available.",
    group: "Project",
    keywords: `Quick Actions Workflow Spotlight Route Readout review spotlight route direct workflow-spotlight-focus ${
      workflowSpotlight.zoneId ?? "none"
    } compose arrange mix deliver guide workflow navigator beat map structure lens next move selected pattern target export stems ${
      workflowSpotlightItem?.label ?? "none"
    } ${workflowSpotlightItem?.value ?? "none"} ${workflowSpotlightItem?.detail ?? "none"} no jump no edit no playback no export sample free beginner producer`,
    disabled: !workflowSpotlightItem,
    resultTargetId: workflowSpotlightItem?.id,
    run: onFocusWorkflowSpotlightRouteReadout
  };
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
  const spaceFxPreviewPad = spaceFxPadOptions.find((pad) => pad.id === spaceFxPreviewSummary.padId) ?? spaceFxPadOptions[0];
  const spaceFxRouteTarget = spaceFxPreviewPad
    ? spaceFxRouteLabel(project.mixer, applySpaceFxPadToMixer(project.mixer, spaceFxPreviewPad))
    : "No Space FX route needed";
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
  const spaceFxRouteReadoutAction: QuickAction = {
    id: "space-fx-route-readout-action",
    title: `Review Space FX Route: ${spaceFxPreviewSummary.padLabel}`,
    detail: `${spaceFxRouteTarget} / ${spaceFxPreviewSummary.statusLabel} / ${spaceFxPreviewSummary.changeLabel} / direct Space FX unchanged`,
    group: "Mix",
    keywords: `Quick Actions Space FX Route Readout review route preflight dry room wide wash send ambience reverb direct space fx command no apply drums 808 synth chords ${
      spaceFxPreviewSummary.padId
    } ${spaceFxPreviewSummary.padLabel} ${spaceFxRouteTarget} ${spaceFxPreviewSummary.sendLabel} space fx route preflight beginner producer manual space sliders`,
    run: onFocusSpaceFxRouteReadout
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
  const patternStackRouteOption = patternStackId
    ? patternStackOptions.find((option) => option.id === patternStackId) ?? null
    : null;
  const patternStackReadoutAction: QuickAction = {
    id: "pattern-stack-readout-action",
    title: `Review Pattern Stack Readout: Pattern ${project.selectedPattern}`,
    detail: `${patternStackPreviewSummary.statusLabel} / preview ${patternStackPreviewSummary.stackLabel} / ${patternStackPreviewSummary.moveLabel} / direct stack preflight`,
    group: "Create",
    keywords: `Quick Actions Pattern Stack Readout review selected Pattern ${project.selectedPattern} ${patternStackPreviewSummary.statusLabel} ${patternStackPreviewSummary.stackLabel} ${patternStackPreviewSummary.moveLabel} 808 chord synth posture arrangement beginner producer`,
    run: onFocusPatternStackReadout
  };
  const patternStackRouteReadoutAction: QuickAction = {
    id: "pattern-stack-route-readout-action",
    title: patternStackRouteOption
      ? `Review Pattern Stack Route Readout: ${patternStackRouteOption.label}`
      : "Review Pattern Stack Route Readout: Stack aligned",
    detail: patternStackRouteOption
      ? `${patternStackPreviewSummary.statusLabel} / route ${patternStackRouteLabel(
          patternStackRouteOption
        )} / direct command pattern-stack-pad-${patternStackRouteOption.id} / ${patternStackPreviewSummary.moveLabel} / stack route preflight`
      : `${patternStackPreviewSummary.statusLabel} / no direct stack route needed / ${patternStackPreviewSummary.moveLabel} / stack route preflight`,
    group: "Create",
    keywords: `Quick Actions Pattern Stack Route Readout review selected Pattern ${
      project.selectedPattern
    } route direct stack command pattern-stack ${
      patternStackRouteOption ? `pattern-stack-pad-${patternStackRouteOption.id}` : "no-route"
    } ${patternStackRouteOption ? patternStackRouteLabel(patternStackRouteOption) : "stack aligned"} ${
      patternStackPreviewSummary.statusLabel
    } ${patternStackPreviewSummary.stackLabel} ${patternStackPreviewSummary.moveLabel} 808 chord synth posture arrangement beginner producer sample free`,
    run: onFocusPatternStackReadout
  };
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
  const drumKitRoutePad =
    directDrumKitPadOptions.find((pad) => pad.id === drumKitPreviewSummary.padId) ??
    directDrumKitPadOptions[0] ??
    null;
  const drumKitRouteTarget = drumKitRoutePad ? drumKitRouteLabel(drumKitRoutePad) : "No kit route needed";
  const directSoundFocusPadOptions = createSoundFocusPadOptions(project.sound);
  const soundFocusRoutePad =
    directSoundFocusPadOptions.find((pad) => pad.id === soundFocusPreviewSummary.padId) ??
    directSoundFocusPadOptions[0] ??
    null;
  const soundFocusRouteParameters = soundFocusRoutePad
    ? soundFocusChangedParameters(project.sound, soundFocusRoutePad)
    : [];
  const soundFocusRouteTarget = soundFocusRouteLabel(soundFocusRouteParameters);
  const soundPresetRouteTarget = soundPresetRouteLabel(
    project.sound,
    soundPresetDesign(soundPresetPreviewSummary.presetId)
  );
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
    onExportDeliveryBundle,
    onExportHandoffSheet,
    onExportMidi,
    onExportStems,
    onExportWav
  });
  const handoffReadyCount = handoffPackItems.filter((item) => item.tone === "good").length;
  const handoffReviewCount = handoffPackItems.filter((item) => item.tone === "warn").length;
  const handoffBlockerCount = handoffPackItems.filter((item) => item.tone === "danger").length;
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
  const handoffBlockerItem =
    handoffPackItems.find((item) => item.tone === "danger") ??
    handoffPackItems.find((item) => item.tone === "warn") ??
    null;
  const handoffExportFormatSummary = createHandoffExportFormatSummary(project, exportAnalysis, stemAnalyses, handoffPackItems);
  const handoffBriefStatus = sessionBriefStatus(project.sessionBrief);
  const handoffBriefFields = sessionBriefFilledFields(project.sessionBrief);
  const directExportsReadoutAction: QuickAction = {
    id: "direct-exports-readout-action",
    title: "Review Direct Exports Readout",
    detail: [
      `${handoffReadyCount}/${handoffPackItems.length} deliverables ready`,
      `WAV ${mixWavFileName(project)} / ${exportAnalysis.status}`,
      `stems ${audibleStemTracks(stemAnalyses).length}/${stemTrackIds.length} audible`,
      `MIDI ${midiFileName(project)} / ${barCountLabel(arrangementTotalBars(project))}`,
      `sheet ${handoffSheetFileName(project)} / brief ${sessionBriefFilledFields(project.sessionBrief)}/4`,
      `send ${handoffSendOrder.nextLabel}`,
      "direct export preflight"
    ].join(" / "),
    group: "Export",
    keywords:
      "direct exports readout review export wav stems midi handoff sheet deliverable file delivery target package readiness receipt send order export preflight no render no download sample free beginner producer",
    run: onFocusDirectExportsReadout
  };
  const handoffNextExportReadoutAction: QuickAction = {
    id: "handoff-next-export-readout-action",
    title: nextHandoffItem
      ? `Review Handoff Next Export Readout: ${nextHandoffItem.buttonLabel}`
      : "Review Handoff Next Export Readout",
    detail: [
      handoffSendOrder.statusLabel,
      nextHandoffItem
        ? `${nextHandoffItem.label}: ${nextHandoffItem.value} / ${nextHandoffItem.detail}`
        : "send order clear",
      `receipt ${handoffReceipt.statusLabel}`,
      `package ${handoffPackageCheckSummary.headline}`,
      handoffSendOrder.sequenceLabel,
      "next export preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff next export readout review preflight no render no download current next deliverable wav stems midi sheet package readiness receipt send order delivery target ${
      nextHandoffItem?.id ?? "complete"
    } ${handoffSendOrder.sequenceLabel} sample free beginner producer`,
    run: onFocusHandoffNextExportReadout
  };
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
  const handoffPackageCheckReadoutAction: QuickAction = {
    id: "handoff-package-check-readout-action",
    title: `Review Handoff Package Check Readout: ${handoffPackageCheckSummary.headline}`,
    detail: [
      handoffPackageCheckSummary.headline,
      handoffPackageCheckSummary.detail,
      `priority ${handoffPackageCheckCard?.label ?? "package clear"}`,
      `receipt ${handoffReceipt.statusLabel}`,
      `send ${handoffSendOrder.statusLabel}`,
      "package preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff package check readout review file set send order latest receipt session brief delivery target package priority no render no download ${
      handoffPackageCheckCard?.id ?? "clear"
    } ${handoffPackageCheckSummary.headline} sample free beginner producer`,
    disabled: !handoffPackageCheckCard,
    run: () => {
      if (handoffPackageCheckCard) {
        onFocusHandoffPackageCheck(handoffPackageCheckCard);
      }
    }
  };
  const handoffRouteReadoutAction: QuickAction = {
    id: "handoff-route-readout-action",
    title: `Review Handoff Route Readout: ${handoffRouteSummary.statusLabel}`,
    detail: [
      handoffRouteSummary.routeLabel,
      handoffRouteSummary.detailLabel,
      handoffRouteSummary.fileLabel,
      `target ${activeDeliveryTarget(project).name}`,
      `package ${handoffPackageCheckSummary.headline}`,
      "route preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff route readout review deliver target route status package manifest receipt send order no render no download ${handoffRouteSummary.routeLabel} ${handoffRouteSummary.statusLabel} sample free beginner producer`,
    run: onFocusHandoffPack
  };
  const handoffDeliveryTargetReadoutAction: QuickAction = {
    id: "handoff-delivery-target-readout-action",
    title: `Review Handoff Delivery Target Readout: ${activeDeliveryTarget(project).name}`,
    detail: [
      activeDeliveryTarget(project).name,
      activeDeliveryTarget(project).focus,
      `${barCountLabel(activeDeliveryTarget(project).targetBars)} target / ${barCountLabel(arrangementTotalBars(project))} current`,
      `${audibleStemTracks(stemAnalyses).length}/${activeDeliveryTarget(project).stemGoal} target stems`,
      `package ${handoffPackageCheckSummary.headline}`,
      "target preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff delivery target readout review target focus length stem goal session brief package no render no download ${activeDeliveryTarget(project).name} ${activeDeliveryTarget(project).focus} sample free beginner producer`,
    run: onFocusHandoffPack
  };
  const handoffSessionBriefReadoutAction: QuickAction = {
    id: "handoff-session-brief-readout-action",
    title: `Review Handoff Session Brief Readout: ${handoffBriefFields}/4 fields`,
    detail: [
      `${handoffBriefFields}/4 brief / ${handoffBriefStatus.value}`,
      `artist ${project.sessionBrief.artist.trim() ? compactSessionBriefValue(project.sessionBrief.artist) : "empty"}`,
      `vibe ${project.sessionBrief.vibe.trim() ? compactSessionBriefValue(project.sessionBrief.vibe) : "empty"}`,
      `reference ${project.sessionBrief.reference.trim() ? compactSessionBriefValue(project.sessionBrief.reference) : "empty"}`,
      `sheet ${handoffSheetFileName(project)}`,
      `package ${handoffPackageCheckSummary.headline}`,
      "brief preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff session brief readout review artist vibe reference notes handoff sheet context delivery target package no render no download ${handoffBriefStatus.value} ${handoffSheetFileName(
      project
    )} sample free beginner producer`,
    run: onFocusHandoffPack
  };
  const handoffFinalCheckReadoutAction: QuickAction = {
    id: "handoff-final-check-readout-action",
    title: `Review Handoff Final Check Readout: ${handoffReadyCount}/${handoffPackItems.length} ready`,
    detail: [
      `${handoffReadyCount}/${handoffPackItems.length} ready`,
      workflowCountLabel(handoffReviewCount, "review"),
      workflowCountLabel(handoffBlockerCount, "blocker"),
      `manifest ${handoffManifestAudit.statusLabel}`,
      `receipt ${handoffReceipt.statusLabel}`,
      `send ${handoffSendOrder.nextLabel}`,
      `package ${handoffPackageCheckSummary.headline}`,
      "final send preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff final check readout review send no-send ready review blocker package manifest receipt send order route target brief export format no render no download ${
      handoffSendOrder.nextLabel
    } ${handoffManifestAudit.statusLabel} sample free beginner producer`,
    run: onFocusHandoffPack
  };
  const handoffSendReadinessStatus = handoffSendReadinessLabel(
    handoffPackItems,
    handoffPackageCheckSummary,
    handoffManifestAudit,
    handoffReceipt
  );
  const handoffSendReadinessGate = handoffSendReadinessGateLabel(
    handoffPackageCheckSummary,
    handoffManifestAudit,
    handoffReceipt
  );
  const handoffSendReadinessReadoutAction: QuickAction = {
    id: "handoff-send-readiness-readout-action",
    title: `Review Handoff Send Readiness Readout: ${handoffSendReadinessStatus}`,
    detail: [
      handoffSendReadinessStatus,
      handoffSendReadinessGate,
      `package ${handoffPackageCheckSummary.headline}`,
      `manifest ${handoffManifestAudit.statusLabel}`,
      `receipt ${handoffReceipt.statusLabel}`,
      `send ${handoffSendOrder.nextLabel}`,
      "send readiness preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff send readiness readout review send no-send ready package manifest receipt send order final check no render no download ${handoffSendReadinessStatus} ${handoffSendReadinessGate} ${handoffPackageCheckSummary.headline} sample free beginner producer`,
    run: onFocusHandoffPack
  };
  const handoffBlockerReadoutAction: QuickAction = {
    id: "handoff-blocker-readout-action",
    title: handoffBlockerItem
      ? `Review Handoff Blocker Readout: ${handoffBlockerItem.label}`
      : "Review Handoff Blocker Readout: Clear",
    detail: [
      handoffBlockerItem
        ? `${handoffBlockerItem.label}: ${handoffBlockerItem.value} / ${handoffBlockerItem.detail}`
        : "no blocker lanes",
      workflowCountLabel(handoffReviewCount, "review"),
      workflowCountLabel(handoffBlockerCount, "blocker"),
      `manifest ${handoffManifestAudit.statusLabel}`,
      `receipt ${handoffReceipt.statusLabel}`,
      `send ${handoffSendOrder.nextLabel}`,
      "blocker preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff blocker readout review danger warn blocked review lane deliverable wav stems midi sheet package manifest receipt send order no render no download ${
      handoffBlockerItem?.id ?? "clear"
    } ${handoffBlockerItem?.label ?? "clear"} sample free beginner producer`,
    run: onFocusHandoffPack
  };
  const handoffBlockerRouteReadoutAction: QuickAction = {
    id: "handoff-blocker-route-readout-action",
    title: handoffBlockerItem
      ? `Review Handoff Blocker Route Readout: ${handoffBlockerItem.buttonLabel}`
      : "Review Handoff Blocker Route Readout: Clear",
    detail: [
      handoffBlockerItem
        ? `${handoffBlockerItem.buttonLabel} route / ${handoffBlockerRouteLabel(handoffBlockerItem)}`
        : "no blocker route",
      handoffBlockerItem
        ? `${handoffBlockerItem.label}: ${handoffBlockerItem.value} / ${handoffBlockerItem.detail}`
        : "all deliverable routes clear",
      workflowCountLabel(handoffReviewCount, "review"),
      workflowCountLabel(handoffBlockerCount, "blocker"),
      `manifest ${handoffManifestAudit.statusLabel}`,
      `receipt ${handoffReceipt.statusLabel}`,
      `send ${handoffSendOrder.nextLabel}`,
      "blocker route preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff blocker route readout review danger warn blocked review lane deliverable wav stems midi sheet package manifest receipt send order next route command no render no download ${
      handoffBlockerItem?.id ?? "clear"
    } ${handoffBlockerItem?.label ?? "clear"} ${handoffBlockerRouteLabel(handoffBlockerItem)} sample free beginner producer`,
    run: onFocusHandoffPack
  };
  const handoffExportFormatReadoutAction: QuickAction = {
    id: "handoff-export-format-readout-action",
    title: `Review Handoff Export Format Readout: ${handoffExportFormatSummary.statusLabel}`,
    detail: [
      handoffExportFormatSummary.statusLabel,
      handoffExportFormatSummary.titleLabel,
      handoffExportFormatSummary.durationLabel,
      handoffExportFormatSummary.detailLabel,
      `target ${activeDeliveryTarget(project).name}`,
      `package ${handoffPackageCheckSummary.headline}`,
      "format preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff export format readout review wav stems midi sheet sample rate channel duration full mix file delivery target package no render no download ${handoffExportFormatSummary.statusLabel} ${handoffExportFormatSummary.titleLabel} sample free beginner producer`,
    run: onFocusHandoffPack
  };
  const handoffManifestAuditReadoutAction: QuickAction = {
    id: "handoff-manifest-audit-readout-action",
    title: `Review Handoff Manifest Audit Readout: ${handoffManifestAudit.statusLabel}`,
    detail: [
      handoffManifestAudit.statusLabel,
      handoffManifestAudit.detailLabel,
      handoffManifestAudit.receiptLabel,
      handoffManifestAudit.nextLabel,
      `package ${handoffPackageCheckSummary.headline}`,
      "manifest preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff manifest audit readout review planned files readiness receipt next missing step no render no download package readiness delivery target ${handoffManifestAudit.statusLabel} ${handoffManifestAudit.checks
      .map((check) => `${check.id} ${check.statusLabel}`)
      .join(" ")} sample free beginner producer`,
    run: onFocusHandoffManifestAudit
  };
  const handoffSendOrderReadoutAction: QuickAction = {
    id: "handoff-send-order-readout-action",
    title: `Review Handoff Send Order Readout: ${handoffSendOrder.nextLabel}`,
    detail: [
      handoffSendOrder.statusLabel,
      handoffSendOrder.detailLabel,
      handoffSendOrder.sequenceLabel,
      `package ${handoffPackageCheckSummary.headline}`,
      `receipt ${handoffReceipt.statusLabel}`,
      "send order preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff send order readout review sequence wav stems midi sheet current next deliverable no render no download package readiness latest receipt delivery target ${
      handoffSendOrder.nextItemId ?? "clear"
    } ${handoffSendOrder.sequenceLabel} sample free beginner producer`,
    run: () => {
      if (handoffSendOrderCard) {
        onFocusHandoffPackageCheck(handoffSendOrderCard);
      }
    }
  };
  const handoffExportReceiptReadoutAction: QuickAction = {
    id: "handoff-export-receipt-readout-action",
    title: handoffExportReceiptCard
      ? `Review Handoff Export Receipt Readout: ${handoffExportReceiptCard.value}`
      : "Review Handoff Export Receipt Readout",
    detail: [
      handoffReceipt.statusLabel,
      handoffReceipt.fileLabel,
      handoffReceipt.detailLabel,
      `package ${handoffPackageCheckSummary.headline}`,
      `send ${handoffSendOrder.nextLabel}`,
      "receipt preflight"
    ].join(" / "),
    group: "Export",
    keywords: `handoff export receipt readout review latest downloaded file no render no download wav stems midi sheet deliverable package readiness send order delivery target ${
      handoffReceipt.itemId ?? "none"
    } ${handoffReceipt.statusLabel} sample free beginner producer`,
    run: () => {
      if (handoffExportReceiptCard) {
        onFocusHandoffPackageCheck(handoffExportReceiptCard);
      }
    }
  };
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
  const patternCueReadoutTarget =
    patternCompareDecisionSummary.action === "cue" ? patternCompareDecisionSummary.target : project.selectedPattern;
  const patternCueReadoutEventCount = patternEventTotal(project.patterns[patternCueReadoutTarget]);
  const patternCueReadoutPlacement = patternCueSwitchSelectedBlockPlacement(
    project,
    selectedArrangementIndex,
    patternCueReadoutTarget
  );
  const patternCueReadoutAction: QuickAction = {
    id: "pattern-cue-readout-action",
    title: `Review Pattern Cue Readout: Pattern ${patternCueReadoutTarget}`,
    detail: `${patternCompareDecisionSummary.statusLabel} / ${patternCueReadoutPlacement} / ${patternCueReadoutEventCount} events / ${transportLoopLabel(
      transportLoopScope
    )} loop / edit Pattern ${project.selectedPattern}`,
    group: "Transport",
    keywords: `Quick Actions Pattern Cue Readout review audition loop target Pattern ${patternCueReadoutTarget} current edit Pattern ${project.selectedPattern} selected block placement arrangement compare cue switch a b c beginner producer`,
    run: onFocusPatternCueReadout
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
  const patternContrastReadoutAction: QuickAction = {
    id: "pattern-contrast-readout-action",
    title: `Review Pattern Contrast: ${patternContrastSummary.statusLabel}`,
    detail: `${patternContrastSummary.contrastLabel} / ${patternContrastSummary.metricLabel} / ${patternContrastSummary.detailLabel}`,
    group: "Create",
    keywords: `Quick Actions Pattern Contrast Readout review Pattern A B C roles anchor lift break switchup contrast ${patternContrastSummary.statusLabel} ${patternContrastSummary.headline} ${patternContrastSummary.contrastLabel} ${patternContrastSummary.metricLabel} ${patternContrastSummary.detailLabel} beginner producer direct beat workstation sample free`,
    run: onFocusPatternContrastReadout
  };
  const patternContrastRoleMapReadoutAction: QuickAction = {
    id: "pattern-contrast-role-map-readout-action",
    title: `Review Pattern Role Map: ${patternContrastRoleMapSummary.statusLabel}`,
    detail: `${patternContrastRoleMapSummary.metricLabel} / ${patternContrastRoleMapSummary.detailLabel}`,
    group: "Arrange",
    keywords: `Quick Actions Pattern Contrast Role Map Readout arrangement role map anchor lift break switchup selected block ${patternContrastRoleMapSummary.statusLabel} ${patternContrastRoleMapSummary.headline} ${patternContrastRoleMapSummary.metricLabel} ${patternContrastRoleMapSummary.detailLabel} beginner producer direct beat workstation sample free`,
    run: onFocusPatternContrastRoleMapReadout
  };
  const patternContrastSectionFitReadoutAction: QuickAction = {
    id: "pattern-contrast-section-fit-readout-action",
    title: `Review Pattern Section Fit: ${patternContrastSectionFitSummary.statusLabel}`,
    detail: `${patternContrastSectionFitSummary.styleBasisLabel} / ${patternContrastSectionFitSummary.metricLabel} / ${patternContrastSectionFitSummary.detailLabel}`,
    group: "Arrange",
    keywords: `Quick Actions Pattern Contrast Section Fit Readout arrangement section fit expected roles intro verse hook bridge outro anchor lift break switchup selected block ${patternContrastSectionFitSummary.statusLabel} ${patternContrastSectionFitSummary.headline} ${patternContrastSectionFitSummary.metricLabel} ${patternContrastSectionFitSummary.detailLabel} beginner producer direct beat workstation sample free`,
    run: onFocusPatternContrastSectionFitReadout
  };
  const patternContrastSectionFitCueItem =
    patternContrastSectionFitSummary.items.find((item) => item.selected) ?? patternContrastSectionFitSummary.items[0] ?? null;
  const patternContrastSectionFitPriorityItem = patternContrastSectionFitSummary.priorityItem;
  const patternContrastSectionFitPriorityCueAction: QuickAction = {
    id: "pattern-contrast-section-fit-priority-cue",
    title: patternContrastSectionFitPriorityItem
      ? `Cue Section Fit Priority: Block ${patternContrastSectionFitPriorityItem.index + 1}`
      : "Cue Section Fit Priority",
    detail: patternContrastSectionFitPriorityItem
      ? `${patternContrastSectionFitPriorityItem.fitLabel} / ${patternContrastSectionFitPriorityItem.sectionLabel} expects ${patternContrastSectionFitPriorityItem.expectedLabel} for ${patternContrastSectionFitPriorityItem.styleBasisLabel} / ${patternContrastSectionFitPriorityItem.reasonLabel}`
      : "Create an arrangement block before cueing Section Fit priority.",
    group: "Transport",
    keywords: `Quick Actions Pattern Contrast Section Fit Priority Cue audition priority block loop listen expected role intro verse hook bridge outro anchor lift break switchup ${patternContrastSectionFitSummary.statusLabel} ${patternContrastSectionFitSummary.priorityLabel} ${patternContrastSectionFitPriorityItem?.sectionLabel ?? "no section"} beginner producer direct beat workstation sample free`,
    disabled: isPlaying || !patternContrastSectionFitPriorityItem,
    run: () => {
      if (patternContrastSectionFitPriorityItem) {
        onCueArrangementBlock(patternContrastSectionFitPriorityItem.index);
      }
    }
  };
  const patternContrastSectionFitCueAction: QuickAction = {
    id: "pattern-contrast-section-fit-cue-selected-block",
    title: patternContrastSectionFitCueItem
      ? `Cue Section Fit Block ${patternContrastSectionFitCueItem.index + 1}: ${patternContrastSectionFitCueItem.sectionLabel}`
      : "Cue Section Fit Block",
    detail: patternContrastSectionFitCueItem
      ? `${patternContrastSectionFitCueItem.fitLabel} / expects ${patternContrastSectionFitCueItem.expectedLabel} for ${patternContrastSectionFitCueItem.styleBasisLabel} / ${patternContrastSectionFitCueItem.roleLabel} Pattern ${patternContrastSectionFitCueItem.pattern} / Block loop`
      : "Create an arrangement block before cueing Section Fit.",
    group: "Transport",
    keywords: `Quick Actions Pattern Contrast Section Fit Cue selected block audition loop transport expected roles intro verse hook bridge outro anchor lift break switchup ${patternContrastSectionFitSummary.statusLabel} ${patternContrastSectionFitSummary.metricLabel} ${patternContrastSectionFitCueItem?.sectionLabel ?? "no section"} beginner producer direct beat workstation sample free`,
    disabled: isPlaying || !patternContrastSectionFitCueItem,
    run: () => {
      if (patternContrastSectionFitCueItem) {
        onCueArrangementBlock(patternContrastSectionFitCueItem.index);
      }
    }
  };
  const patternContrastSectionFitAlreadyMatches = Boolean(
    patternContrastSectionFitCueItem &&
      patternContrastSectionFitCueItem.role !== "blank" &&
      patternContrastSectionFitCueItem.expectedRoles.includes(patternContrastSectionFitCueItem.role)
  );
  const patternContrastSectionFitUseSlot = patternContrastSectionFitCueItem
    ? patternContrastSummary.slots.find(
        (slot) => slot.role !== "blank" && patternContrastSectionFitCueItem.expectedRoles.includes(slot.role)
      ) ?? null
    : null;
  const patternContrastSectionFitUseAlreadySelected = Boolean(
    patternContrastSectionFitUseSlot && selectedBlock?.pattern === patternContrastSectionFitUseSlot.slot
  );
  const patternContrastSectionFitUseAction: QuickAction = {
    id: "pattern-contrast-section-fit-use-selected-block",
    title:
      patternContrastSectionFitUseSlot && patternContrastSectionFitCueItem
        ? `Use Section Fit Role: ${patternContrastSectionFitUseSlot.roleLabel} Pattern ${patternContrastSectionFitUseSlot.slot}`
        : "Use Section Fit Role",
    detail:
      patternContrastSectionFitUseSlot && patternContrastSectionFitCueItem
        ? `${selectedBlockLabel} -> ${patternContrastSectionFitUseSlot.roleLabel} Pattern ${patternContrastSectionFitUseSlot.slot} / expects ${patternContrastSectionFitCueItem.expectedLabel} for ${patternContrastSectionFitCueItem.styleBasisLabel}`
        : "No expected Pattern Contrast role is available for this selected section.",
    group: "Arrange",
    keywords: `Quick Actions Pattern Contrast Section Fit Use selected block arrangement expected role assign use intro verse hook bridge outro anchor lift break switchup ${patternContrastSectionFitSummary.statusLabel} ${patternContrastSectionFitSummary.metricLabel} ${patternContrastSectionFitUseSlot?.roleLabel ?? "no role"} beginner producer direct beat workstation sample free`,
    disabled:
      !selectedBlock ||
      !patternContrastSectionFitUseSlot ||
      !patternContrastSectionFitCueItem ||
      patternContrastSectionFitAlreadyMatches ||
      patternContrastSectionFitUseAlreadySelected,
    run: () => {
      if (patternContrastSectionFitUseSlot) {
        onUsePatternInSelectedBlock(patternContrastSectionFitUseSlot.slot);
      }
    }
  };
  const patternContrastSectionFitDecisionKind = patternContrastSectionFitAlreadyMatches
    ? "cue"
    : patternContrastSectionFitUseSlot
      ? "use"
      : "review";
  const patternContrastSectionFitDecisionAction: QuickAction = {
    id: "pattern-contrast-section-fit-decision",
    title:
      patternContrastSectionFitDecisionKind === "cue" && patternContrastSectionFitCueItem
        ? `Section Fit Decision: Cue Block ${patternContrastSectionFitCueItem.index + 1}`
        : patternContrastSectionFitDecisionKind === "use" && patternContrastSectionFitUseSlot
          ? `Section Fit Decision: Use ${patternContrastSectionFitUseSlot.roleLabel} Pattern ${patternContrastSectionFitUseSlot.slot}`
          : "Section Fit Decision: Review roles",
    detail:
      patternContrastSectionFitDecisionKind === "cue" && patternContrastSectionFitCueItem
        ? `${patternContrastSectionFitCueItem.sectionLabel} already fits ${patternContrastSectionFitCueItem.expectedLabel} for ${patternContrastSectionFitCueItem.styleBasisLabel} / cue Block loop`
        : patternContrastSectionFitDecisionKind === "use" && patternContrastSectionFitUseSlot && patternContrastSectionFitCueItem
          ? `${selectedBlockLabel} -> ${patternContrastSectionFitUseSlot.roleLabel} Pattern ${patternContrastSectionFitUseSlot.slot} / expects ${patternContrastSectionFitCueItem.expectedLabel} for ${patternContrastSectionFitCueItem.styleBasisLabel}`
          : "No safe Section Fit cue or use action is available yet.",
    group: patternContrastSectionFitDecisionKind === "cue" ? "Transport" : "Arrange",
    keywords: `Quick Actions Pattern Contrast Section Fit Decision next move selected block cue use review arrangement expected role intro verse hook bridge outro anchor lift break switchup ${patternContrastSectionFitSummary.statusLabel} ${patternContrastSectionFitSummary.metricLabel} beginner producer direct beat workstation sample free`,
    disabled:
      patternContrastSectionFitDecisionKind === "cue"
        ? isPlaying || !patternContrastSectionFitCueItem
        : patternContrastSectionFitDecisionKind === "use"
          ? Boolean(patternContrastSectionFitUseAction.disabled)
          : true,
    run: () => {
      if (patternContrastSectionFitDecisionKind === "cue" && patternContrastSectionFitCueItem) {
        onCueArrangementBlock(patternContrastSectionFitCueItem.index);
      }
      if (patternContrastSectionFitDecisionKind === "use" && patternContrastSectionFitUseSlot) {
        onUsePatternInSelectedBlock(patternContrastSectionFitUseSlot.slot);
      }
    }
  };
  const patternContrastCueActions: QuickAction[] = patternContrastCueRoles.map((role) => {
    const slot = patternContrastCueSlot(patternContrastSummary, role);
    const roleLabel = patternContrastCueRoleLabel(role);
    return {
      id: `pattern-contrast-cue-${role}`,
      title: slot ? `Cue ${roleLabel}: Pattern ${slot.slot}` : `Cue ${roleLabel}: unavailable`,
      detail: slot
        ? `${slot.roleLabel} / Pattern ${slot.slot} / ${slot.detailLabel} / ${patternContrastSummary.contrastLabel}`
        : `${roleLabel} role unavailable / ${patternContrastSummary.statusLabel} / ${patternContrastSummary.detailLabel}`,
      group: "Transport",
      keywords: `Pattern Contrast cue ${roleLabel} ${role} Pattern ${slot?.slot ?? "none"} anchor lift break switchup A B C role audition loop compare direct beat workstation sample free beginner producer`,
      disabled: !slot,
      run: () => {
        if (slot) {
          onCuePattern(slot.slot);
        }
      }
    };
  });
  const patternContrastUseActions: QuickAction[] = patternContrastCueRoles.map((role) => {
    const slot = patternContrastCueSlot(patternContrastSummary, role);
    const roleLabel = patternContrastCueRoleLabel(role);
    const selectedBlockAlreadyUsesSlot = Boolean(slot && selectedBlock?.pattern === slot.slot);
    return {
      id: `pattern-contrast-use-${role}`,
      title: slot
        ? selectedBlockAlreadyUsesSlot
          ? `${roleLabel} already in selected block`
          : `Use ${roleLabel}: Pattern ${slot.slot}`
        : `Use ${roleLabel}: unavailable`,
      detail: slot
        ? selectedBlock
          ? selectedBlockAlreadyUsesSlot
            ? `${selectedBlockLabel} already uses ${slot.roleLabel} Pattern ${slot.slot} / ${slot.detailLabel}`
            : `${selectedBlockLabel} -> ${slot.roleLabel} Pattern ${slot.slot} / ${slot.detailLabel}`
          : `${slot.roleLabel} Pattern ${slot.slot} / select an arrangement block first`
        : `${roleLabel} role unavailable / ${patternContrastSummary.statusLabel} / ${patternContrastSummary.detailLabel}`,
      group: "Arrange",
      keywords: `Pattern Contrast use ${roleLabel} ${role} Pattern ${slot?.slot ?? "none"} selected block arrangement assign anchor lift break switchup A B C role audition direct beat workstation sample free beginner producer`,
      disabled: !slot || !selectedBlock || selectedBlockAlreadyUsesSlot,
      run: () => {
        if (slot && selectedBlock && selectedBlock.pattern !== slot.slot) {
          onUsePatternInSelectedBlock(slot.slot);
        }
      }
    };
  });
  const patternSwitchReadoutTarget = patternCompareDecisionSummary.target;
  const patternSwitchReadoutEventCount = patternEventTotal(project.patterns[patternSwitchReadoutTarget]);
  const patternSwitchReadoutPlacement = patternCueSwitchSelectedBlockPlacement(
    project,
    selectedArrangementIndex,
    patternSwitchReadoutTarget
  );
  const patternSwitchReadoutAction: QuickAction = {
    id: "pattern-switch-readout-action",
    title: `Review Pattern Switch Readout: Pattern ${patternSwitchReadoutTarget}`,
    detail: `${patternCompareDecisionSummary.statusLabel} / ${patternSwitchReadoutPlacement} / ${patternSwitchReadoutEventCount} events / edit Pattern ${project.selectedPattern}`,
    group: "Create",
    keywords: `Quick Actions Pattern Switch Readout review edit focus target Pattern ${patternSwitchReadoutTarget} current edit Pattern ${project.selectedPattern} selected block placement arrangement compare cue switch a b c beginner producer`,
    run: onFocusPatternSwitchReadout
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
  const patternCloneReadoutSummary = createPatternCloneSuggestionSummary(project.selectedPattern, project.patterns);
  const patternCloneReadoutAction: QuickAction = {
    id: "pattern-clone-readout-action",
    title: `Review Pattern Clone Readout: ${patternCloneReadoutSummary.routeLabel}`,
    detail: `${patternCloneReadoutSummary.presetLabel} suggestion / ${patternCloneReadoutSummary.detailLabel} / ${patternCloneReadoutSummary.moveLabel} / target overwrite preflight`,
    group: "Create",
    keywords: `Quick Actions Pattern Clone Readout review ${patternCloneReadoutSummary.source} ${patternCloneReadoutSummary.target} ${patternCloneReadoutSummary.preset} ${patternCloneReadoutSummary.presetLabel} safest target overwrite risk clone variation hook breakdown beginner producer`,
    run: onFocusPatternCloneReadout
  };
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
  const patternCopyClearReadoutTargets = patternSlots.filter((target) => target !== project.selectedPattern).join(", ");
  const patternCopyClearReadoutEventCount = patternEventTotal(project.patterns[project.selectedPattern]);
  const patternCopyClearReadoutAction: QuickAction = {
    id: "pattern-copy-clear-readout-action",
    title: `Review Pattern Copy/Clear Readout: Pattern ${project.selectedPattern}`,
    detail: `${patternCopyClearReadoutEventCount} selected events / copy targets ${patternCopyClearReadoutTargets} / clear keeps arrangement assignments`,
    group: "Create",
    keywords: `Quick Actions Pattern Copy Clear Readout review selected Pattern ${project.selectedPattern} copy targets ${patternCopyClearReadoutTargets} clear risk source target a b c duplicate reset beginner producer`,
    run: onFocusPatternCopyClearReadout
  };
  const patternVariationReadoutSuggestion = createPatternVariationSuggestionSummary(project.selectedPattern, activePattern(project));
  const patternVariationReadoutPreview = createPatternVariationPreviewSummary(
    project.selectedPattern,
    activePattern(project),
    patternVariationPreviewPreset
  );
  const patternVariationReadoutAction: QuickAction = {
    id: "pattern-variation-readout-action",
    title: `Review Pattern Variation Readout: Pattern ${project.selectedPattern}`,
    detail: `${patternVariationReadoutSuggestion.presetLabel} suggestion / preview ${patternVariationReadoutPreview.presetLabel} / ${patternVariationReadoutPreview.moveLabel} / direct variation preflight`,
    group: "Create",
    keywords: `Quick Actions Pattern Variation Readout review selected Pattern ${project.selectedPattern} ${patternVariationReadoutSuggestion.presetLabel} ${patternVariationReadoutPreview.presetLabel} ${patternVariationReadoutPreview.moveLabel} subtle hook break switchup layer change arrangement transition drop beginner producer`,
    run: onFocusPatternVariationReadout
  };
  const patternFillReadoutSuggestion = createPatternFillSuggestionSummary(project.selectedPattern, activePattern(project), project.key);
  const patternFillReadoutPreview = createPatternFillPreviewSummary(
    project.selectedPattern,
    activePattern(project),
    patternFillPreviewPreset,
    project.key
  );
  const patternFillReadoutAction: QuickAction = {
    id: "pattern-fill-readout-action",
    title: `Review Pattern Fill Readout: Pattern ${project.selectedPattern}`,
    detail: `${patternFillReadoutSuggestion.presetLabel} suggestion / preview ${patternFillReadoutPreview.presetLabel} / ${patternFillReadoutPreview.moveLabel} / direct fill preflight`,
    group: "Create",
    keywords: `Quick Actions Pattern Fill Readout review selected Pattern ${project.selectedPattern} ${patternFillReadoutSuggestion.presetLabel} ${patternFillReadoutPreview.presetLabel} ${patternFillReadoutPreview.moveLabel} drum fill 808 pickup melody turn clear tail arrangement beginner producer`,
    run: onFocusPatternFillReadout
  };
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
    patternContrastReadoutAction,
    patternContrastRoleMapReadoutAction,
    patternContrastSectionFitReadoutAction,
    patternContrastSectionFitPriorityCueAction,
    patternContrastSectionFitDecisionAction,
    patternContrastSectionFitCueAction,
    patternContrastSectionFitUseAction,
    ...patternContrastCueActions,
    ...patternContrastUseActions,
    patternCueReadoutAction,
    ...patternCueActions,
    patternSwitchReadoutAction,
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
      id: "quick-actions-route-readout-action",
      title: "Review Quick Actions Route",
      detail: [
        `Route ${quickActionsRouteLabel}`,
        `${quickActionScopeDefinitions.length} scopes`,
        `${quickActionsRouteScopeLabel} current scope`,
        quickActionsRouteQueryLabel,
        `${quickActionPinnedCount}/${maxQuickActionPins} pinned`,
        `${quickActionRecentCount} recent`,
        "Quick Actions open action unchanged",
        "Command Reference unchanged",
        "Search Spotlight unchanged",
        "Readout only"
      ].join(" / "),
      group: "Project",
      keywords: `Quick Actions Route Readout review command palette route scopes search spotlight pinned recent enter target command count direct quick actions unchanged command-reference unchanged no command run no edit no playback no export sample free beginner producer ${quickActionsRouteLabel}`,
      run: onFocusQuickActionsRouteReadout
    },
    {
      id: "command-reference-route-readout-action",
      title: "Review Command Reference Route",
      detail: [
        `Route ${commandReferenceRouteSummary.routeLabel}`,
        `${commandReferenceRouteSummary.filterCount} filters`,
        `${commandReferenceRouteSummary.commandCount} command-map entries`,
        `${commandReferenceRouteSummary.quickActionCommandCount} Quick Actions rows`,
        `${commandReferenceRouteSummary.readoutCommandCount} readout rows`,
        commandReferenceRouteSummary.searchRouteLabel,
        "Command Reference open action unchanged",
        "Quick Actions unchanged",
        "Search Spotlight unchanged",
        "Readout only"
      ].join(" / "),
      group: "Project",
      keywords: `Quick Actions Command Reference Route Readout review command map route help filters search spotlight quick actions readout coverage direct command-reference unchanged no command run no edit no playback no export sample free beginner producer ${commandReferenceRouteSummary.routeLabel}`,
      run: onFocusCommandReferenceRouteReadout
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
    beatMapRouteReadoutAction,
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
    sessionPassRouteReadoutAction,
    {
      id: "session-pass-focus",
      title: `Focus ${sessionPassCard.label}`,
      detail: sessionPassCommandDetail(sessionPassCard, sessionPassSummary),
      group: "Project",
      keywords: `session pass focus guided studio next workflow ${sessionPassCard.id} ${sessionPassCard.focusLabel} beginner producer`,
      run: () => onFocusSessionPass(sessionPassCard)
    },
    ...sessionPassActions,
    ...audienceCompletionRouteActions,
    ...audienceSessionAcceptanceActions,
    ...audienceSessionProofHandoffActions,
    ...audienceDeliveryProofBridgeActions,
    ...dualAudienceReadinessActions,
    ...audienceSessionActions,
    ...audienceRouteBridgeActions,
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
    referenceAlignmentRouteReadoutAction,
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
    composerGuideRouteReadoutAction,
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
    composerActionsReadoutAction,
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
    keyCompassRouteReadoutAction,
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
    grooveCompassRouteReadoutAction,
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
    layerStarterReadoutAction,
    layerStarterRouteReadoutAction,
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
    patternCloneReadoutAction,
    ...patternCloneActions,
    patternCopyClearReadoutAction,
    ...patternCopyActions,
    {
      id: "pattern-clear",
      title: `Clear Pattern ${project.selectedPattern}`,
      detail: `${patternEventTotal(activePattern(project))} events now / shows Pattern Edit Result`,
      group: "Create",
      keywords: `pattern clear reset empty edit result ${project.selectedPattern} a b c loop variation beginner producer`,
      run: onClearSelectedPattern
    },
    patternStackReadoutAction,
    patternStackRouteReadoutAction,
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
    drumMoveRouteReadoutAction,
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
    bassMoveRouteReadoutAction,
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
    melodyMoveRouteReadoutAction,
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
    chordMoveRouteReadoutAction,
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
      id: "drum-kit-route-readout-action",
      title: `Review Drum Kit Route: ${drumKitPreviewSummary.kitLabel}`,
      detail: `${drumKitRouteTarget} / ${drumKitPreviewSummary.statusLabel} / ${drumKitPreviewSummary.moveLabel} / direct Drum Kit unchanged`,
      group: "Create",
      keywords: `Quick Actions Drum Kit Route Readout review route preflight built in kit preview direct drum kit command no apply kick clap snare hat rack ${
        drumKitPreviewSummary.padId
      } ${drumKitPreviewSummary.kitLabel} ${drumKitRouteTarget} ${
        drumKitPreviewSummary.rackLabel
      } drum kit route preflight beginner producer manual drum tone`,
      resultTargetId: drumKitPreviewSummary.padId,
      run: onFocusDrumKitRouteReadout
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
      id: "sound-focus-route-readout-action",
      title: `Review Sound Focus Route: ${soundFocusPreviewSummary.padLabel}`,
      detail: `${soundFocusRouteTarget} / ${soundFocusPreviewSummary.statusLabel} / ${soundFocusPreviewSummary.changeLabel} / direct Sound Focus unchanged`,
      group: "Create",
      keywords: `Quick Actions Sound Focus Route Readout review route preflight tone focus preview direct sound focus command no apply 808 synth chords drums ${
        soundFocusPreviewSummary.padId
      } ${soundFocusPreviewSummary.padLabel} ${soundFocusRouteTarget} ${
        soundFocusPreviewSummary.parameterLabel
      } sound route preflight beginner producer manual sound focus`,
      resultTargetId: soundFocusPreviewSummary.padId,
      run: onFocusSoundFocusRouteReadout
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
      id: "sound-preset-route-readout-action",
      title: `Review Sound Preset Route: ${soundPresetPreviewSummary.presetLabel}`,
      detail: `${soundPresetRouteTarget} / ${soundPresetPreviewSummary.statusLabel} / ${soundPresetPreviewSummary.changeLabel} / direct Sound Preset unchanged`,
      group: "Create",
      keywords: `Quick Actions Sound Preset Route Readout review route preflight full tone preset preview direct sound preset command no apply drums 808 bass duck sidechain synth chords ${
        soundPresetPreviewSummary.presetId
      } ${soundPresetPreviewSummary.presetLabel} ${soundPresetRouteTarget} ${
        soundPresetPreviewSummary.toneLabel
      } sound preset route preflight beginner producer manual sound design`,
      resultTargetId: soundPresetPreviewSummary.presetId,
      run: onFocusSoundPresetRouteReadout
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
    beatReadinessRouteReadoutAction,
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
    listeningPassRouteReadoutAction,
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
    beatPassportRouteReadoutAction,
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
    productionSnapshotRouteReadoutAction,
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
    hookReadinessRouteReadoutAction,
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
    toplineSpaceRouteReadoutAction,
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
    finishChecklistRouteReadoutAction,
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
    reviewQueueRouteReadoutAction,
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
    exportPreflightRouteReadoutAction,
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
    workflowNavigatorRouteReadoutAction,
    workflowSpotlightRouteReadoutAction,
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
      detail: `${suggestedBlueprintName} / editable drums, 808, harmony, arrangement, sound, and master.`,
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
    patternVariationReadoutAction,
    ...patternVariationPresetIds.map((preset): QuickAction => {
      const label = patternVariationPresetLabel(preset);
      return {
        id: `pattern-variation-${preset}`,
        title: `Apply ${label} Variation`,
        detail: `Apply ${label} variation to Pattern ${project.selectedPattern}.`,
        group: "Create",
        keywords: `pattern variation ${preset} ${label} subtle hook break switchup transition drop drums 808 melody chords beginner producer`,
        run: () => onApplyPatternVariation(preset)
      };
    }),
    patternFillReadoutAction,
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
    structureLensRouteReadoutAction,
    ...structureLensCommandActions,
    nextMoveRouteReadoutAction,
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
    stemAuditionRouteReadoutAction,
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
    mixSnapshotRouteReadoutAction,
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
    mixBalanceRouteReadoutAction,
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
    spaceFxRouteReadoutAction,
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
      id: "master-automation-route-readout-action",
      title: `Review Master Automation Route: ${masterAutomationPreviewSummary.padLabel}`,
      detail: `${masterAutomationRouteLabel(masterAutomationPreviewSummary.padId)} / ${masterAutomationPreviewSummary.statusLabel} / direct master-automation-${masterAutomationPreviewSummary.padId} unchanged / ${masterAutomationPreviewSummary.changeLabel}`,
      group: "Mix",
      keywords: `Quick Actions Master Automation Route Readout review route preflight fade lane direct master automation command no apply none fade in fade out intro outro realtime export wav stems ${
        masterAutomationPreviewSummary.padId
      } ${masterAutomationPreviewSummary.padLabel} ${masterAutomationPreviewSummary.statusLabel} ${
        masterAutomationPreviewSummary.eventLabel
      } ${masterAutomationPreviewSummary.rangeLabel} beginner producer manual automation`,
      resultTargetId: masterAutomationPreviewSummary.padId,
      run: onFocusMasterAutomationRouteReadout
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
      id: "master-finish-route-readout-action",
      title: `Review Master Finish Route: ${masterFinishPreviewSummary.padLabel}`,
      detail: `${masterFinishRouteLabel(masterFinishPreviewSummary.padId)} / ${masterFinishPreviewSummary.statusLabel} / direct master-finish-${masterFinishPreviewSummary.padId} unchanged / ${masterFinishPreviewSummary.changeLabel}`,
      group: "Mix",
      keywords: `Quick Actions Master Finish Route Readout review route preflight final output direct master finish command no apply demo vocal store club export meter stems ${
        masterFinishPreviewSummary.padId
      } ${masterFinishPreviewSummary.padLabel} ${masterFinishPreviewSummary.statusLabel} ${
        masterFinishPreviewSummary.presetLabel
      } ${masterFinishPreviewSummary.ceilingLabel} ${
        masterFinishPreviewSummary.outputLabel
      } beginner producer manual trim`,
      resultTargetId: masterFinishPreviewSummary.padId,
      run: onFocusMasterFinishRouteReadout
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
    handoffRouteReadoutAction,
    handoffDeliveryTargetReadoutAction,
    handoffSessionBriefReadoutAction,
    handoffFinalCheckReadoutAction,
    handoffSendReadinessReadoutAction,
    handoffBlockerReadoutAction,
    handoffBlockerRouteReadoutAction,
    handoffExportFormatReadoutAction,
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
    handoffManifestAuditReadoutAction,
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
    handoffSendOrderReadoutAction,
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
    handoffExportReceiptReadoutAction,
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
    handoffPackageCheckReadoutAction,
    ...handoffPackageCheckActions,
    handoffNextExportReadoutAction,
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
    directExportsReadoutAction,
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
    },
    {
      id: "export-delivery-bundle",
      title: "Export delivery bundle",
      detail: "Write one ZIP with project JSON, mix, stems, MIDI, Handoff Sheet, and manifest.",
      group: "Export",
      keywords: "export delivery bundle zip package archive project wav stems midi handoff manifest beginner producer",
      run: onExportDeliveryBundle
    }
  ];
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

// These graph-local pure helpers deliberately mirror the first-render exports.
// Renderer smoke compares their TypeScript AST output so either copy cannot drift unnoticed.
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
export function handoffSendReadinessLabel(
  items: HandoffPackItem[],
  packageSummary: HandoffPackageCheckSummary,
  manifestAudit: HandoffManifestAuditSummary,
  receipt: HandoffExportReceipt
): string {
  const receiptTone = receipt.itemId ? receipt.tone : "warn";
  const tone = weakestTone([...items.map((item) => item.tone), packageSummary.tone, manifestAudit.tone, receiptTone]);
  return tone === "good" ? "Send ready" : tone === "warn" ? "Review before send" : "Do not send";
}
export function handoffSendReadinessGateLabel(
  packageSummary: HandoffPackageCheckSummary,
  manifestAudit: HandoffManifestAuditSummary,
  receipt: HandoffExportReceipt
): string {
  const activeCard = activeHandoffPackageCheckQuickActionCard(packageSummary);

  if (packageSummary.tone === "danger") {
    return `${activeCard?.label ?? "Package"} blocked`;
  }

  if (manifestAudit.tone === "danger") {
    return "Manifest blocked";
  }

  if (!receipt.itemId) {
    return "No export receipt";
  }

  if (packageSummary.tone === "warn") {
    return `${activeCard?.label ?? "Package"} needs review`;
  }

  if (manifestAudit.tone === "warn") {
    return "Manifest needs review";
  }

  return "All send gates clear";
}
export function handoffBlockerRouteLabel(item: HandoffPackItem | null): string {
  switch (item?.id) {
    case "wav":
      return "Explicit WAV export or Handoff Next Export";
    case "stems":
      return "Explicit Stems export or Stem Audition check";
    case "midi":
      return "Explicit MIDI export or Arrangement check";
    case "sheet":
      return "Session Brief or Handoff Sheet context check";
    default:
      return "No blocker route";
  }
}
export function tempoNudgeRouteSummary(bpm: number): string {
  return tempoNudgePads.map((pad) => `${pad.label} ${tempoNudgePadBpm(bpm, pad.id)} BPM`).join(" / ");
}
export function swingFeelRouteSummary(project: ProjectState): string {
  return swingFeelPads.map((pad) => `${pad.label} ${percentLabel(swingFeelPadSwing(pad, project))}`).join(" / ");
}
export function keyRetargetOptionSummary(currentKey: string): string {
  const targets = keys.filter((key) => key !== currentKey);
  return `${keys.length} key options / ${targets.length} targets: ${targets.join(", ")}`;
}
export function keyRetargetPatternSummary(project: ProjectState): string {
  return patternSlots.map((slot) => `Pattern ${slot} ${keyRetargetablePatternEventTotal(project.patterns[slot])}`).join(" / ");
}
export function keyRetargetablePatternEventTotal(pattern: ProjectState["patterns"][PatternSlot]): number {
  return pattern.bassNotes.length + pattern.melodyNotes.length + pattern.chordEvents.length;
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
export function quickActionCaptureStepModeLabel(mode: KeyboardCaptureStepMode): string {
  return mode === "next-free" ? "Next empty" : "Replace selected";
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
export function layerStarterRouteLabel(option: LayerStarterOption): string {
  switch (option.id) {
    case "drums":
      return "Drum Foundation Layer Starter";
    case "bass":
      return "808 Bassline Layer Starter";
    case "chords":
      return "Chord Progression Layer Starter";
    case "melody":
      return "Melody Motif Layer Starter";
  }
}
export function patternStackRouteLabel(stack: PatternStackOption): string {
  return `${stack.label} Pattern Stack Pad`;
}
export function drumMoveRouteLabel(target: DrumMoveQuickActionTarget): string {
  switch (target.kind) {
    case "Foundation":
      return "Drum Foundation route";
    case "Feel":
      return "Groove Feel route";
    case "Accent":
      return "Drum Accent route";
  }
}
export function bassMoveRouteLabel(target: BassMoveQuickActionTarget): string {
  switch (target.kind) {
    case "Bassline":
      return "808 Bassline route";
    case "Glide":
      return "808 Glide route";
    case "Contour":
      return "808 Contour route";
  }
}
export function melodyMoveRouteLabel(target: MelodyMoveQuickActionTarget): string {
  switch (target.kind) {
    case "Motif":
      return "Melody Motif route";
    case "Accent":
      return "Melody Accent route";
    case "Contour":
      return "Melody Contour route";
  }
}
export function chordMoveRouteLabel(target: ChordMoveQuickActionTarget): string {
  switch (target.kind) {
    case "Pad":
      return "Chord Pads route";
    case "Rhythm":
      return "Chord Rhythm route";
    case "Voicing":
      return "Chord Voicing route";
  }
}
