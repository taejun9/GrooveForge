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
  outcome: "complete" | "canceled" | "failed",
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
  const audienceSessionRouteOnly = action.id.startsWith("audience-session-enter-");
  const patternCompareDecisionKind = patternCompareDecisionQuickActionKind(action);
  const patternCompareDecisionCue = patternCompareDecisionKind === "cue";
  const cueOnly =
    action.id === "groove-compass-cue" ||
    blueprintPreviewCueOnly ||
    action.id.startsWith("style-goal-cue-") ||
    patternCompareDecisionCue;
  const focusOnly =
    action.id === "quick-actions-route-readout-action" ||
    action.id === "command-reference-route-readout-action" ||
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
    action.id === "stem-audition-route-readout-action" ||
    action.id === "timbre-check" ||
    action.id.startsWith("audience-session-acceptance-") ||
    action.id.startsWith("audience-delivery-proof-bridge-") ||
    action.id.startsWith("audience-session-proof-handoff-") ||
    action.id.startsWith("audience-route-bridge-") ||
    action.id.startsWith("audience-completion-route-") ||
    action.id.startsWith("dual-audience-readiness-") ||
    action.id === "session-pass-route-readout-action" ||
    action.id === "session-pass-focus" ||
    action.id.startsWith("session-pass-card-") ||
    action.id === "session-brief-compass-focus" ||
    action.id.startsWith("session-brief-compass-card-") ||
    action.id === "reference-alignment-route-readout-action" ||
    action.id === "reference-alignment-focus" ||
    action.id.startsWith("reference-alignment-card-") ||
    action.id === "first-beat-path-jump" ||
    action.id.startsWith("first-beat-path-step-") ||
    action.id === "composer-guide-route-readout-action" ||
    action.id === "composer-guide-focus" ||
    action.id.startsWith("composer-guide-card-") ||
    action.id === "composer-actions-readout-action" ||
    action.id.startsWith("beat-spine-card-jump-") ||
    action.id === "style-inspector-focus" ||
    action.id.startsWith("style-inspector-item-") ||
    action.id === "style-direction-readout-action" ||
    action.id === "beat-readiness-route-readout-action" ||
    action.id === "beat-readiness-focus" ||
    action.id.startsWith("beat-readiness-check-") ||
    action.id === "listening-pass-route-readout-action" ||
    action.id === "listening-pass-focus" ||
    action.id.startsWith("listening-pass-checkpoint-") ||
    action.id === "key-compass-route-readout-action" ||
    action.id === "key-compass-focus" ||
    action.id.startsWith("key-compass-card-") ||
    action.id === "groove-compass-route-readout-action" ||
    action.id === "groove-compass-focus" ||
    action.id.startsWith("groove-compass-card-") ||
    action.id === "pattern-dna-focus" ||
    action.id.startsWith("pattern-dna-card-") ||
    action.id === "pattern-playback-readout-action" ||
    action.id === "selected-arrangement-block-readout-action" ||
    action.id === "arrangement-playback-readout-action" ||
    action.id === "audible-arrangement-follow-readout-action" ||
    action.id.startsWith("mode-focus-card-") ||
    action.id === "beat-passport-route-readout-action" ||
    action.id === "beat-passport-focus" ||
    action.id.startsWith("beat-passport-metric-") ||
    action.id === "production-snapshot-route-readout-action" ||
    action.id === "production-snapshot-focus" ||
    action.id.startsWith("production-snapshot-metric-") ||
    action.id === "snapshot-compare-focus" ||
    action.id.startsWith("snapshot-compare-metric-") ||
    action.id === "hook-readiness-route-readout-action" ||
    action.id === "topline-space-route-readout-action" ||
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
    action.id === "handoff-route-readout-action" ||
    action.id === "handoff-delivery-target-readout-action" ||
    action.id === "handoff-session-brief-readout-action" ||
    action.id === "handoff-final-check-readout-action" ||
    action.id === "handoff-send-readiness-readout-action" ||
    action.id === "handoff-blocker-readout-action" ||
    action.id === "handoff-blocker-route-readout-action" ||
    action.id === "handoff-package-check-focus" ||
    action.id === "handoff-package-check-readout-action" ||
    action.id.startsWith("handoff-package-check-card-") ||
    action.id === "handoff-manifest-audit-focus" ||
    action.id === "handoff-manifest-audit-readout-action" ||
    action.id === "handoff-send-order-focus" ||
    action.id === "handoff-send-order-readout-action" ||
    action.id === "handoff-export-receipt-focus" ||
    action.id === "handoff-export-receipt-readout-action" ||
    action.id === "handoff-export-format-focus" ||
    action.id.startsWith("handoff-export-format-") ||
    action.id === "song-form-overview-readout-action" ||
    action.id === "song-form-priority" ||
    action.id.startsWith("arrangement-block-cue-") ||
    action.id.startsWith("arrangement-block-jump-") ||
    action.id.startsWith("section-locator-") ||
    action.id === "pattern-cue-readout-action" ||
    action.id.startsWith("pattern-cue-") ||
    action.id === "pattern-switch-readout-action" ||
    action.id.startsWith("pattern-switch-") ||
    action.id === "pattern-use-readout-action" ||
    action.id === "pattern-follow-audible" ||
    action.id === "arrangement-follow-audible" ||
    action.id === "sound-preset-readout-action" ||
    action.id === "sound-preset-route-readout-action" ||
    action.id === "drum-kit-readout-action" ||
    action.id === "drum-kit-route-readout-action" ||
    action.id === "sound-focus-readout-action" ||
    action.id === "sound-focus-route-readout-action" ||
    action.id === "sound-snapshot-readout-action" ||
    action.id === "pattern-chain-readout-action" ||
    action.id === "chain-expand-readout-action" ||
    action.id === "arrangement-template-readout-action" ||
    action.id === "arrangement-arc-readout-action" ||
    action.id === "arrangement-focus-readout-action" ||
    action.id === "arrangement-move-readout-action" ||
    action.id === "layer-starter-readout-action" ||
    action.id === "layer-starter-route-readout-action" ||
    action.id === "pattern-clone-readout-action" ||
    action.id === "pattern-stack-readout-action" ||
    action.id === "pattern-stack-route-readout-action" ||
    action.id === "pattern-variation-readout-action" ||
    action.id === "pattern-fill-readout-action" ||
    action.id === "pattern-copy-clear-readout-action" ||
    action.id === "drum-move-route-readout-action" ||
    action.id === "808-move-route-readout-action" ||
    action.id === "melody-move-route-readout-action" ||
    action.id === "chord-move-route-readout-action" ||
    action.id === "mix-snapshot-readout-action" ||
    action.id === "mix-snapshot-route-readout-action" ||
    action.id === "mix-balance-readout-action" ||
    action.id === "mix-balance-route-readout-action" ||
    action.id === "space-fx-readout-action" ||
    action.id === "space-fx-route-readout-action" ||
    action.id === "master-finish-readout-action" ||
    action.id === "master-finish-route-readout-action" ||
    action.id === "master-automation-readout-action" ||
    action.id === "master-automation-route-readout-action" ||
    action.id === "beat-map-route-readout-action" ||
    action.id === "structure-lens-route-readout-action" ||
    action.id === "next-move-route-readout-action" ||
    action.id === "workflow-navigator-route-readout-action" ||
    action.id === "workflow-spotlight-route-readout-action" ||
    action.id === "workflow-spotlight-focus" ||
    action.id.startsWith("workflow-navigator-") ||
    action.id === "review-queue-route-readout-action" ||
    action.id === "review-queue-focus" ||
    action.id.startsWith("review-queue-item-") ||
    action.id === "finish-checklist-route-readout-action" ||
    action.id.startsWith("finish-checklist-card-") ||
    action.id === "export-preflight-route-readout-action" ||
    action.id === "export-preflight-focus" ||
    action.id.startsWith("export-preflight-card-") ||
    action.id === "direct-exports-readout-action" ||
    action.id === "handoff-next-export-readout-action";
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
        : outcome === "canceled"
          ? "warn"
        : previewOnly || blueprintPreviewDecisionOnly || cueOnly || focusOnly || audienceSessionRouteOnly || uiLocal || exportOnly
          ? "good"
          : nextMoveQuickActionOnly
            ? changed
              ? "good"
              : nextMoveQuickAction.tone
          : changed
            ? "good"
            : "warn"
  };
  const followup =
    outcome === "canceled"
      ? {
          auditionCue: "The current project stayed unchanged; no listening check is needed.",
          nextCheck: "Run the action again only when replacing the current project state is intended."
        }
      : quickActionResultFollowup(action, afterProject, outcome);

  return {
    actionId: action.id,
    title: action.title,
    status:
      outcome === "failed"
        ? "Failed"
        : outcome === "canceled"
          ? "Canceled"
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
            : audienceSessionRouteOnly
              ? "Entered"
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
        : outcome === "canceled"
          ? "warn"
        : previewOnly || blueprintPreviewDecisionOnly || cueOnly || focusOnly || audienceSessionRouteOnly || uiLocal || exportOnly
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

  if (action.id === "master-finish-route-readout-action") {
    const pad = quickActionMasterFinishPadOption(project, action, actionPad);
    if (!pad) {
      return null;
    }
    const exportAnalysis = analysis ?? analyzeExport(project);
    const stemAnalyses = analyzeStemExports(project);
    const targetProject = applyMasterFinishPadToProject(project, pad);
    const changedMoves = masterFinishChangedCount(project, targetProject);
    return {
      id: "master-finish-route-readout",
      label: "Master Finish Route Readout",
      value: quickActionMasterFinishMetricValue(project, exportAnalysis, stemAnalyses, [
        quickActionMasterFinishActionLabel(action),
        `route ${masterFinishRouteLabel(pad.id)}`,
        `direct command master-finish-${pad.id}`,
        `context ${quickActionMasterFinishContextLabel(action)}`,
        `current ${masterFinishQuickActionPosture(project)}`,
        `target ${pad.preset} / ${formatDb(pad.ceilingDb)} ceiling / ${formatDb(pad.masterVolumeDb)} output`,
        `moves ${changedMoves} finish move${changedMoves === 1 ? "" : "s"}`,
        "master finish unchanged"
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
  if (action.id === "master-finish-route-readout-action") {
    return "review master finish route readout";
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
  if (action.id === "master-finish-route-readout-action") {
    return "route readout";
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
  if (action.id === "master-finish-route-readout-action") {
    return "use the named finish route only if it matches the delivery target, then inspect Export meter before applying";
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

  if (action.id === "master-automation-route-readout-action") {
    const pad = quickActionMasterAutomationPadOption(action, actionPad);
    if (!pad) {
      return null;
    }
    const exportAnalysis = analysis ?? analyzeExport(project);
    const stemAnalyses = analyzeStemExports(project);
    const targetProject = applyMasterAutomationPreset(project, pad.id);
    const changedEvents = masterAutomationChangedCount(project, targetProject);
    return {
      id: "master-automation-route-readout",
      label: "Master Automation Route Readout",
      value: quickActionMasterAutomationMetricValue(project, exportAnalysis, stemAnalyses, [
        quickActionMasterAutomationActionLabel(action),
        `route ${masterAutomationRouteLabel(pad.id)}`,
        `direct command master-automation-${pad.id}`,
        `context ${quickActionMasterAutomationContextLabel(action)}`,
        `current ${masterAutomationQuickActionPosture(project)}`,
        `target ${masterAutomationPresetLabel(masterAutomationPresetForProject(targetProject))} / ${masterAutomationEventCountLabel(
          targetProject
        )} / ${masterAutomationRangeLabel(targetProject)}`,
        `events ${changedEvents} automation event${changedEvents === 1 ? "" : "s"}`,
        "master automation unchanged"
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
  if (action.id === "master-automation-route-readout-action") {
    return "review master automation route readout";
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
  if (action.id === "master-automation-route-readout-action") {
    return "route readout";
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
  if (action.id === "master-automation-route-readout-action") {
    return "use the named fade route only if it matches the arrangement delivery target, then play Song before applying";
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

  if (action.id === "mix-snapshot-route-readout-action") {
    const routeTargetId = quickActionMixSnapshotRouteTargetId(action);
    if (!routeTargetId) {
      return null;
    }
    const exportAnalysis = analysis ?? analyzeExport(project);
    const stemAnalyses = analyzeStemExports(project);
    return {
      id: "mix-snapshot-route-readout",
      label: "Mix Snapshot Route Readout",
      value: quickActionMixSnapshotMetricValue(project, exportAnalysis, stemAnalyses, [
        quickActionMixSnapshotActionLabel(action, routeTargetId),
        `route ${mixSnapshotRouteLabel(routeTargetId)}`,
        `direct command mix-snapshot-${routeTargetId}`,
        `slot state ${quickActionMixSnapshotContextLabel(action)}`,
        `current mix ${mixSnapshotQuickActionPosture(project, exportAnalysis)}`,
        `master ${quickActionMixSnapshotMasterPosture(project)}`,
        "mix snapshot unchanged"
      ], "read the capture or recall route before choosing the existing Mix Snapshot command")
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

export function quickActionMixSnapshotRouteTargetId(
  action: QuickAction
): MixSnapshotComparisonSummary["decisionActionId"] | null {
  switch (action.resultTargetId) {
    case "capture-a":
    case "capture-b":
    case "recall-a":
    case "recall-b":
      return action.resultTargetId;
    default:
      return null;
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
  if (action.id === "mix-snapshot-route-readout-action") {
    return "review mix snapshot route readout";
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
    case "export-delivery-bundle":
      return { id: "bundle", label: "Delivery Bundle", metricId: "export-delivery-bundle" };
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
    case "bundle":
      return `${deliveryBundleZipFileName(project)} / project + mix + stems + MIDI + sheet + manifest`;
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

export function quickActionDirectExportsReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "direct-exports-readout-action") {
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
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const directTargets = ["export-wav", "export-stems", "export-midi", "export-handoff-sheet", "export-delivery-bundle"]
    .map(directExportQuickActionTarget)
    .filter((target): target is DirectExportQuickActionTarget => target !== null);
  const targetPosture = directTargets.map((target) =>
    [
      handoffExportReceiptItemLabel(target.id),
      directExportQuickActionFileLabel(project, target),
      directExportQuickActionReadinessLabel(project, target, exportAnalysis, stemAnalyses),
      directExportQuickActionReceiptLabel(target, receipt)
    ].join(" / ")
  );
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "direct-exports-readout",
    label: "Direct Exports Readout",
    value: [
      "review direct exports",
      ...targetPosture,
      `target ${activeDeliveryTarget(project).name} / ${barCountLabel(activeDeliveryTarget(project).targetBars)} / ${
        activeDeliveryTarget(project).stemGoal
      } stems`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      `patterns ${usedSlots.length}/3 ${usedSlots.join("/") || project.selectedPattern}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `send ${sendOrder.statusLabel} / ${sendOrder.nextLabel}`,
      `sequence ${sendOrder.sequenceLabel}`,
      `receipt ${receipt.statusLabel} / ${receipt.fileLabel} / ${receipt.nextLabel}`,
      "export unchanged",
      "receipt unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
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
    `bundle ${deliveryBundleZipFileName(project)} / project + mix + stems + MIDI + sheet + manifest`,
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
    case "bundle":
      return deliveryBundleZipFileName(project);
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
    case "bundle":
      return `bundle ${deliveryBundleZipFileName(project)} / ${stemWavFileNames(project).length} stems / manifest`;
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

export function audienceSessionQuickActionRoute(action: QuickAction): {
  audienceLabel: string;
  nextCheck: string;
  routeLabel: string;
  targetMode: ProjectState["mode"];
} | null {
  if (action.id === "audience-session-enter-beginner" || action.resultTargetId === "beginner") {
    return {
      audienceLabel: "first-time composer",
      nextCheck: "Follow First Beat Path before editing or exporting.",
      routeLabel: "Enter Guided",
      targetMode: "guided"
    };
  }

  if (action.id === "audience-session-enter-producer" || action.resultTargetId === "producer") {
    return {
      audienceLabel: "professional producer",
      nextCheck: "Scan Mode Focus, Review Queue, and Export Preflight before delivery.",
      routeLabel: "Enter Studio",
      targetMode: "studio"
    };
  }

  return null;
}

export function dualAudienceReadinessQuickActionLane(action: QuickAction): {
  laneLabel: string;
  nextCheck: string;
  routeLabel: string;
} | null {
  if (!action.id.startsWith("dual-audience-readiness-")) {
    return null;
  }

  if (action.id === "dual-audience-readiness-route-readout-action") {
    return {
      laneLabel: "Dual Audience Readiness",
      nextCheck: "Choose the first-time composer or professional producer lane before changing the beat.",
      routeLabel: "Dual Audience Readiness Route Readout"
    };
  }

  if (action.id === "dual-audience-readiness-beginner-action" || action.resultTargetId === "beginner") {
    return {
      laneLabel: "First-time composer lane",
      nextCheck: "Follow First Beat Path for the next direct beat-making step.",
      routeLabel: "Open first-time composer lane"
    };
  }

  if (action.id === "dual-audience-readiness-producer-action" || action.resultTargetId === "producer") {
    return {
      laneLabel: "Professional producer lane",
      nextCheck: "Use Export Preflight or Production Snapshot for the next producer delivery check.",
      routeLabel: "Open professional producer lane"
    };
  }

  return null;
}

export function audienceRouteBridgeQuickActionLane(action: QuickAction): {
  laneLabel: string;
  nextCheck: string;
  routeLabel: string;
} | null {
  if (!action.id.startsWith("audience-route-bridge-")) {
    return null;
  }

  if (action.id === "audience-route-bridge-readout-action") {
    return {
      laneLabel: "Audience Route Bridge",
      nextCheck: "Choose the active audience lane, then open its readiness or completion action.",
      routeLabel: "Audience Route Bridge Readout"
    };
  }

  if (action.id === "audience-route-bridge-readiness-action" || action.resultTargetId === "readiness") {
    return {
      laneLabel: "Bridge readiness lane",
      nextCheck: "Open the active Dual Audience Readiness next check before changing the beat.",
      routeLabel: "Open Bridge Readiness"
    };
  }

  if (action.id === "audience-route-bridge-completion-action" || action.resultTargetId === "completion") {
    return {
      laneLabel: "Bridge completion lane",
      nextCheck: "Open the active Audience Completion Route next check before export or handoff.",
      routeLabel: "Open Bridge Completion"
    };
  }

  return null;
}

export function audienceSessionProofHandoffQuickActionLane(action: QuickAction): {
  laneLabel: string;
  nextCheck: string;
  routeLabel: string;
} | null {
  if (!action.id.startsWith("audience-session-proof-handoff-")) {
    return null;
  }

  if (action.id === "audience-session-proof-handoff-readout-action") {
    return {
      laneLabel: "Audience Session Proof Handoff",
      nextCheck: "Choose the first-time composer or professional producer proof handoff lane before sending files.",
      routeLabel: "Audience Session Proof Handoff Readout"
    };
  }

  if (action.id === "audience-session-proof-handoff-beginner-action" || action.resultTargetId === "beginner") {
    return {
      laneLabel: "First-time composer session proof",
      nextCheck: "Open Export Preflight deliverables and confirm the local package reopen path.",
      routeLabel: "Open first-time composer session proof"
    };
  }

  if (action.id === "audience-session-proof-handoff-producer-action" || action.resultTargetId === "producer") {
    return {
      laneLabel: "Professional producer session proof",
      nextCheck: "Open Handoff Package Check receipt and confirm send order plus stem handoff.",
      routeLabel: "Open professional producer session proof"
    };
  }

  return null;
}

export function audienceSessionAcceptanceQuickActionLane(action: QuickAction): {
  laneLabel: string;
  nextCheck: string;
  routeLabel: string;
} | null {
  if (!action.id.startsWith("audience-session-acceptance-")) {
    return null;
  }

  if (action.id === "audience-session-acceptance-readout-action") {
    return {
      laneLabel: "Audience Session Acceptance",
      nextCheck: "Choose the first-time composer or professional producer acceptance lane before export or handoff.",
      routeLabel: "Audience Session Acceptance Readout"
    };
  }

  if (action.id === "audience-session-acceptance-beginner-action" || action.resultTargetId === "beginner") {
    return {
      laneLabel: "First-time composer acceptance",
      nextCheck: "Open Export Preflight deliverables and confirm the guided 8-bar first beat can be delivered locally.",
      routeLabel: "Open first-time composer acceptance"
    };
  }

  if (action.id === "audience-session-acceptance-producer-action" || action.resultTargetId === "producer") {
    return {
      laneLabel: "Professional producer acceptance",
      nextCheck: "Open Handoff Package Check receipt and confirm the studio handoff pass is send-ready.",
      routeLabel: "Open professional producer acceptance"
    };
  }

  return null;
}

export function quickActionAudienceSessionAcceptanceMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const lane = audienceSessionAcceptanceQuickActionLane(action);
  if (!lane) {
    return null;
  }

  const pattern = activePattern(project);

  return {
    id: "audience-session-acceptance",
    label: "Audience Session Acceptance",
    value: [
      lane.routeLabel,
      lane.laneLabel,
      action.detail,
      `${modeLabel(project.mode)} mode`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} selected-pattern events`,
      `${projectEventTotal(project)} editable project events`,
      `${arrangementTotalBars(project)} bars`,
      "local session acceptance readout",
      "project data unchanged",
      "playback unchanged",
      "export unchanged",
      "local-only acceptance route"
    ].join(" / ")
  };
}

export function quickActionAudienceSessionProofHandoffMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const lane = audienceSessionProofHandoffQuickActionLane(action);
  if (!lane) {
    return null;
  }

  const pattern = activePattern(project);

  return {
    id: "audience-session-proof-handoff",
    label: "Audience Session Proof Handoff",
    value: [
      lane.routeLabel,
      lane.laneLabel,
      action.detail,
      `${modeLabel(project.mode)} mode`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} selected-pattern events`,
      `${projectEventTotal(project)} editable project events`,
      `${arrangementTotalBars(project)} bars`,
      "session proof handoff readout",
      "project data unchanged",
      "playback unchanged",
      "export unchanged",
      "local-only proof route"
    ].join(" / ")
  };
}

export function audienceDeliveryProofBridgeQuickActionLane(action: QuickAction): {
  laneLabel: string;
  nextCheck: string;
  routeLabel: string;
} | null {
  if (!action.id.startsWith("audience-delivery-proof-bridge-")) {
    return null;
  }

  if (action.id === "audience-delivery-proof-bridge-readout-action") {
    return {
      laneLabel: "Audience Delivery Proof Bridge",
      nextCheck: "Choose the first-time composer or professional producer proof lane before sending files.",
      routeLabel: "Audience Delivery Proof Bridge Readout"
    };
  }

  if (action.id === "audience-delivery-proof-bridge-beginner-action" || action.resultTargetId === "beginner") {
    return {
      laneLabel: "First-time composer delivery proof",
      nextCheck: "Open Export Preflight deliverables and confirm WAV, stems, MIDI, and Handoff Sheet proof.",
      routeLabel: "Open first-time composer delivery proof"
    };
  }

  if (action.id === "audience-delivery-proof-bridge-producer-action" || action.resultTargetId === "producer") {
    return {
      laneLabel: "Professional producer delivery proof",
      nextCheck: "Open Handoff Package Check receipt and confirm package reopen plus send order proof.",
      routeLabel: "Open professional producer delivery proof"
    };
  }

  return null;
}

export function quickActionAudienceDeliveryProofBridgeMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const lane = audienceDeliveryProofBridgeQuickActionLane(action);
  if (!lane) {
    return null;
  }

  const pattern = activePattern(project);

  return {
    id: "audience-delivery-proof-bridge",
    label: "Audience Delivery Proof Bridge",
    value: [
      lane.routeLabel,
      lane.laneLabel,
      action.detail,
      `${modeLabel(project.mode)} mode`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} selected-pattern events`,
      `${projectEventTotal(project)} editable project events`,
      `${arrangementTotalBars(project)} bars`,
      "local delivery proof bridge",
      "project data unchanged",
      "playback unchanged",
      "export unchanged",
      lane.nextCheck
    ].join(" / ")
  };
}

export function quickActionAudienceRouteBridgeMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const lane = audienceRouteBridgeQuickActionLane(action);
  if (!lane) {
    return null;
  }

  const pattern = activePattern(project);

  return {
    id: "audience-route-bridge",
    label: "Audience Route Bridge",
    value: [
      lane.routeLabel,
      lane.laneLabel,
      action.detail,
      `${modeLabel(project.mode)} mode`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} selected-pattern events`,
      `${projectEventTotal(project)} editable project events`,
      `${arrangementTotalBars(project)} bars`,
      "active audience route bridge",
      "project data unchanged",
      "playback unchanged",
      "export unchanged",
      lane.nextCheck
    ].join(" / ")
  };
}

export function quickActionDualAudienceReadinessMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const lane = dualAudienceReadinessQuickActionLane(action);
  if (!lane) {
    return null;
  }

  const pattern = activePattern(project);

  return {
    id: "dual-audience-readiness-route",
    label: "Dual Audience Readiness",
    value: [
      lane.routeLabel,
      lane.laneLabel,
      action.detail,
      `${modeLabel(project.mode)} mode`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} selected-pattern events`,
      `${projectEventTotal(project)} editable project events`,
      `${arrangementTotalBars(project)} bars`,
      lane.nextCheck
    ].join(" / ")
  };
}

export function audienceCompletionRouteQuickActionLane(action: QuickAction): {
  laneLabel: string;
  nextCheck: string;
  routeLabel: string;
} | null {
  if (!action.id.startsWith("audience-completion-route-")) {
    return null;
  }

  if (action.id === "audience-completion-route-readout-action") {
    return {
      laneLabel: "Audience Completion Route",
      nextCheck: "Choose the first-time composer or professional producer completion lane before final export.",
      routeLabel: "Audience Completion Route Readout"
    };
  }

  if (action.id === "audience-completion-route-beginner-action" || action.resultTargetId === "beginner") {
    return {
      laneLabel: "First-time composer completion",
      nextCheck: "Use First Beat Path, Export Preflight, and Handoff Package Check before sending the first beat.",
      routeLabel: "Open first-time composer completion lane"
    };
  }

  if (action.id === "audience-completion-route-producer-action" || action.resultTargetId === "producer") {
    return {
      laneLabel: "Professional producer completion",
      nextCheck: "Use Production Snapshot, Export Preflight, and Handoff Package Check before delivery.",
      routeLabel: "Open professional producer completion lane"
    };
  }

  return null;
}

export function quickActionAudienceCompletionRouteMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const lane = audienceCompletionRouteQuickActionLane(action);
  if (!lane) {
    return null;
  }

  const pattern = activePattern(project);

  return {
    id: "audience-completion-route",
    label: "Audience Completion Route",
    value: [
      lane.routeLabel,
      lane.laneLabel,
      action.detail,
      `${modeLabel(project.mode)} mode`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} selected-pattern events`,
      `${projectEventTotal(project)} editable project events`,
      `${arrangementTotalBars(project)} bars`,
      lane.nextCheck
    ].join(" / ")
  };
}

export function quickActionAudienceSessionMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const route = audienceSessionQuickActionRoute(action);
  if (!route) {
    return null;
  }

  const pattern = activePattern(project);

  return {
    id: "audience-session-route",
    label: "Audience session route",
    value: [
      `${route.routeLabel} for ${route.audienceLabel}`,
      `${modeLabel(project.mode)} mode`,
      `target ${modeLabel(route.targetMode)}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} selected-pattern events`,
      `${projectEventTotal(project)} editable project events`,
      `${arrangementTotalBars(project)} bars`,
      route.nextCheck
    ].join(" / ")
  };
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
  const isRouteReadout = action.id === "reference-alignment-route-readout-action";
  if (!isRouteReadout && action.id !== "reference-alignment-focus" && !action.id.startsWith("reference-alignment-card-")) {
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
  const contextLabel = isRouteReadout ? detailParts[4] ?? card.detail : detailParts.slice(2).join(" / ") || card.detail;
  const audibleStems = audibleStemTracks(stemAnalyses);
  const routeLabel = quickActionReferenceAlignmentRouteLabel(detailParts, card, summary);
  const directCardId = isRouteReadout
    ? action.resultTargetId ?? ""
    : action.id.startsWith("reference-alignment-card-")
      ? action.id.slice("reference-alignment-card-".length)
      : "";
  const directCardLabel =
    isRouteReadout && directCardId
      ? `direct reference-alignment-card-${directCardId} unchanged`
      : directCardId
        ? `direct reference-alignment-card-${directCardId}`
        : "active reference alignment command";
  const actionLabel = isRouteReadout
    ? "review reference alignment route readout"
    : action.id === "reference-alignment-focus"
      ? "focus active reference alignment"
      : "focus direct reference alignment";

  return {
    id: "reference-alignment",
    label: "Reference alignment",
    value: [
      `action ${actionLabel}`,
      `lane ${quickActionReferenceAlignmentLaneLabel(action, card)}`,
      `route ${routeLabel}`,
      directCardLabel,
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
      isRouteReadout ? "readout only" : "focus command",
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

  if (action.id === "reference-alignment-route-readout-action") {
    return (
      summary.cards.find((card) => card.id === (action.resultTargetId as ReferenceAlignmentCardId | undefined)) ??
      activeReferenceAlignmentQuickActionCard(summary)
    );
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
  const laneType =
    action.id === "reference-alignment-route-readout-action"
      ? "route"
      : action.id === "reference-alignment-focus"
        ? "active"
        : "direct";
  return `${laneType} ${card.label}`;
}

export function quickActionReferenceAlignmentRouteLabel(
  parts: string[],
  card: ReferenceAlignmentCard,
  summary: ReferenceAlignmentSummary
): string {
  const routePart = parts.find((part) => part.startsWith("Route "));
  if (routePart) {
    return routePart.replace(/^Route\s+/, "");
  }
  return referenceAlignmentRouteLabel(card, summary);
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

export function quickActionHandoffNextExportReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-next-export-readout-action") {
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
  const targetItem = sendOrder.nextItemId
    ? (handoffPackItems.find((item) => item.id === sendOrder.nextItemId) ?? null)
    : null;
  const targetId = targetItem?.id ?? sendOrder.nextItemId;
  const directTarget = targetId ? handoffNextExportDirectTarget(targetId) : null;
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const deliverableLabel = targetId ? handoffExportReceiptItemLabel(targetId) : "No next deliverable";
  const routeLabel = targetItem ? targetItem.buttonLabel : "No export route";
  const contextLabel = targetItem ? `${targetItem.value} / ${targetItem.detail}` : "Send order clear";
  const fileLabel = directTarget ? directExportQuickActionFileLabel(project, directTarget) : "No file target";
  const readinessLabel = directTarget
    ? directExportQuickActionReadinessLabel(project, directTarget, exportAnalysis, stemAnalyses)
    : "send order clear";
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "handoff-next-export-readout",
    label: "Handoff Next Export Readout",
    value: [
      "review handoff next export",
      "destination Deliver panel",
      `current next ${sendOrder.nextLabel}`,
      `deliverable ${deliverableLabel}`,
      `route ${routeLabel}`,
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
        targetId ?? null
      ),
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "export unchanged",
      "receipt unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
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
    `bundle ${deliveryBundleZipFileName(project)} / project + mix + stems + MIDI + sheet + manifest`,
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
    case "bundle":
      return { id: "bundle", label: "Delivery Bundle", metricId: "handoff-next-bundle" };
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
  const isReadout = action.id === "handoff-package-check-readout-action";
  if (action.id !== "handoff-package-check-focus" && !isReadout && !action.id.startsWith("handoff-package-check-card-")) {
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
  const statusLabel = isReadout ? (detailParts[0] ?? summary.headline) : card.status;
  const contextLabel = isReadout ? detailParts.slice(1).join(" / ") || summary.detail : detailParts.slice(2).join(" / ") || card.detail;
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: isReadout ? "handoff-package-check-readout" : "handoff-package-check",
    label: isReadout ? "Handoff Package Check Readout" : "Handoff package",
    value: [
      quickActionHandoffPackageCheckActionLabel(action),
      `lane ${quickActionHandoffPackageCheckLaneLabel(action, card)}`,
      `destination ${card.focusLabel} panel`,
      `status ${statusLabel}`,
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
      barCountLabel(arrangementTotalBars(project)),
      "package check unchanged",
      "export unchanged",
      "receipt unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
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
  if (action.id === "handoff-package-check-readout-action") {
    return "review handoff package check";
  }

  return action.id === "handoff-package-check-focus" ? "focus priority handoff package" : "focus direct handoff package";
}

export function quickActionHandoffPackageCheckCard(
  summary: HandoffPackageCheckSummary,
  action: QuickAction
): HandoffPackageCheckCard | null {
  if (action.id === "handoff-package-check-focus" || action.id === "handoff-package-check-readout-action") {
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
  if (action.id === "handoff-package-check-readout-action") {
    return card.label;
  }

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

export function quickActionPatternContrastReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-contrast-readout-action") {
    return null;
  }

  const summary = createPatternContrastSummary(createPatternCompareSummaries(project));
  const slotRoles = summary.slots.map((slot) => `Pattern ${slot.slot} ${slot.roleLabel}`).join(" / ");

  return {
    id: "pattern-contrast-readout",
    label: "Pattern Contrast",
    value: `${summary.statusLabel} / ${summary.contrastLabel} / ${summary.metricLabel} / ${slotRoles} / ${summary.detailLabel} / contrast unchanged / playback unchanged / export unchanged`
  };
}

export function quickActionPatternContrastRoleMapMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-contrast-role-map-readout-action") {
    return null;
  }

  const roleMap = createPatternContrastRoleMapSummary(
    createPatternContrastSummary(createPatternCompareSummaries(project)),
    project.arrangement,
    selectedArrangementIndex
  );
  const selectedBlock = roleMap.blocks.find((block) => block.selected) ?? roleMap.blocks[0] ?? null;
  const roleSequence = roleMap.blocks.map((block) => `${block.sectionLabel}:${block.roleLabel} ${block.pattern}`).join(" / ");

  return {
    id: "pattern-contrast-role-map",
    label: "Pattern Role Map",
    value: `${roleMap.statusLabel} / ${roleMap.metricLabel} / ${
      selectedBlock ? `selected Block ${selectedBlock.index + 1} ${selectedBlock.roleLabel} Pattern ${selectedBlock.pattern}` : "no selected block"
    } / ${roleSequence || "no arrangement blocks"} / arrangement unchanged / playback unchanged / export unchanged`
  };
}

export function quickActionPatternContrastSectionFitMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-contrast-section-fit-readout-action") {
    return null;
  }

  const sectionFit = createPatternContrastSectionFitSummary(
    createPatternContrastSummary(createPatternCompareSummaries(project)),
    project.arrangement,
    selectedArrangementIndex,
    project.styleId
  );
  const selectedItem = sectionFit.items.find((item) => item.selected) ?? sectionFit.items[0] ?? null;
  const fitSequence = sectionFit.items
    .map((item) => `${item.sectionLabel}:${item.fitLabel} ${item.roleLabel} ${item.pattern} (${item.reasonLabel})`)
    .join(" / ");

  return {
    id: "pattern-contrast-section-fit",
    label: "Pattern Section Fit",
    value: `${sectionFit.statusLabel} / ${sectionFit.metricLabel} / ${
      selectedItem
        ? `selected Block ${selectedItem.index + 1} ${selectedItem.sectionLabel} expects ${selectedItem.expectedLabel} for ${sectionFit.styleBasisLabel} because ${selectedItem.reasonLabel} and has ${selectedItem.roleLabel} Pattern ${selectedItem.pattern}`
        : "no selected block"
    } / ${fitSequence || "no arrangement blocks"} / style-aware expectations / arrangement unchanged / playback unchanged / export unchanged`
  };
}

export function quickActionPatternContrastSectionFitCueMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-contrast-section-fit-cue-selected-block") {
    return null;
  }

  const sectionFit = createPatternContrastSectionFitSummary(
    createPatternContrastSummary(createPatternCompareSummaries(project)),
    project.arrangement,
    selectedArrangementIndex,
    project.styleId
  );
  const selectedItem = sectionFit.items.find((item) => item.selected) ?? sectionFit.items[0] ?? null;

  return {
    id: "pattern-contrast-section-fit-cue",
    label: "Section Fit Cue",
    value: selectedItem
      ? `Block ${selectedItem.index + 1} ${selectedItem.sectionLabel} cued as Block loop / ${selectedItem.fitLabel} / expects ${selectedItem.expectedLabel} for ${sectionFit.styleBasisLabel} / reason ${selectedItem.reasonLabel} / ${selectedItem.roleLabel} Pattern ${selectedItem.pattern} / Pattern data unchanged / arrangement unchanged / export unchanged`
      : "No arrangement block available / Pattern data unchanged / arrangement unchanged / export unchanged"
  };
}

export function quickActionPatternContrastSectionFitPriorityCueMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-contrast-section-fit-priority-cue") {
    return null;
  }

  const sectionFit = createPatternContrastSectionFitSummary(
    createPatternContrastSummary(createPatternCompareSummaries(project)),
    project.arrangement,
    selectedArrangementIndex,
    project.styleId
  );
  const priorityItem = sectionFit.priorityItem;

  return {
    id: "pattern-contrast-section-fit-priority-cue",
    label: "Section Fit Priority Cue",
    value: priorityItem
      ? `Priority Block ${priorityItem.index + 1} ${priorityItem.sectionLabel} cued as Block loop / ${priorityItem.fitLabel} / expects ${priorityItem.expectedLabel} for ${sectionFit.styleBasisLabel} / reason ${priorityItem.reasonLabel} / ${priorityItem.roleLabel} Pattern ${priorityItem.pattern} / Pattern data unchanged / arrangement unchanged / export unchanged`
      : "No arrangement block available / Pattern data unchanged / arrangement unchanged / export unchanged"
  };
}

export function quickActionPatternContrastSectionFitUseMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-contrast-section-fit-use-selected-block") {
    return null;
  }

  const sectionFit = createPatternContrastSectionFitSummary(
    createPatternContrastSummary(createPatternCompareSummaries(project)),
    project.arrangement,
    selectedArrangementIndex,
    project.styleId
  );
  const selectedItem = sectionFit.items.find((item) => item.selected) ?? sectionFit.items[0] ?? null;

  return {
    id: "pattern-contrast-section-fit-use",
    label: "Section Fit Use",
    value: selectedItem
      ? `Block ${selectedItem.index + 1} ${selectedItem.sectionLabel} now uses ${selectedItem.roleLabel} Pattern ${selectedItem.pattern} / expects ${selectedItem.expectedLabel} for ${sectionFit.styleBasisLabel} / reason ${selectedItem.reasonLabel} / ${selectedItem.fitLabel} / Pattern events unchanged / selected block assignment explicit / export unchanged`
      : "No arrangement block available / Pattern events unchanged / arrangement unchanged / export unchanged"
  };
}

export function quickActionPatternContrastSectionFitDecisionMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-contrast-section-fit-decision") {
    return null;
  }

  const sectionFit = createPatternContrastSectionFitSummary(
    createPatternContrastSummary(createPatternCompareSummaries(project)),
    project.arrangement,
    selectedArrangementIndex,
    project.styleId
  );
  const selectedItem = sectionFit.items.find((item) => item.selected) ?? sectionFit.items[0] ?? null;

  return {
    id: "pattern-contrast-section-fit-decision",
    label: "Section Fit Decision",
    value: selectedItem
      ? `${action.title} / Block ${selectedItem.index + 1} ${selectedItem.sectionLabel} / expects ${selectedItem.expectedLabel} for ${sectionFit.styleBasisLabel} / reason ${selectedItem.reasonLabel} / now ${selectedItem.roleLabel} Pattern ${selectedItem.pattern} / ${selectedItem.fitLabel} / Pattern events unchanged / export unchanged`
      : `${action.title} / no arrangement block available / Pattern events unchanged / arrangement unchanged / export unchanged`
  };
}

export function quickActionPatternContrastCueMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const role = patternContrastCueQuickActionRole(action);
  if (!role) {
    return null;
  }

  const roleLabel = patternContrastCueRoleLabel(role);
  const summary = createPatternContrastSummary(createPatternCompareSummaries(project));
  const slot = patternContrastCueSlot(summary, role);

  if (!slot) {
    return {
      id: "pattern-contrast-cue",
      label: "Pattern Contrast Cue",
      value: `${roleLabel} role unavailable / ${summary.statusLabel} / ${summary.contrastLabel} / Pattern data unchanged / playback unchanged / export unchanged`
    };
  }

  return {
    id: "pattern-contrast-cue",
    label: "Pattern Contrast Cue",
    value: `cue ${roleLabel} / Pattern ${slot.slot} / ${slot.detailLabel} / ${summary.contrastLabel} / Pattern loop via existing cue / Pattern data unchanged / export unchanged`
  };
}

export function quickActionPatternContrastUseMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  const role = patternContrastUseQuickActionRole(action);
  if (!role) {
    return null;
  }

  const roleLabel = patternContrastCueRoleLabel(role);
  const summary = createPatternContrastSummary(createPatternCompareSummaries(project));
  const slot = patternContrastCueSlot(summary, role);
  const target = patternContrastQuickActionTargetPattern(action) ?? slot?.slot ?? null;

  if (!target) {
    return {
      id: "pattern-contrast-use",
      label: "Pattern Contrast Use",
      value: `${roleLabel} role unavailable / ${summary.statusLabel} / selected block unchanged / Pattern data unchanged / export unchanged`
    };
  }

  const targetPattern = project.patterns[target];
  const eventCount = patternEventTotal(targetPattern);
  const drumCount = drumHitCount(targetPattern);
  const musicEvents = targetPattern.bassNotes.length + targetPattern.chordEvents.length + targetPattern.melodyNotes.length;
  const selectedBlockPlacement = patternUseSelectedBlockPlacement(project, selectedArrangementIndex, target);

  return {
    id: "pattern-contrast-use",
    label: "Pattern Contrast Use",
    value: `use ${roleLabel} / Pattern ${target} / ${selectedBlockPlacement} / ${eventCount} events / ${drumCount} drums / ${musicEvents} music / selected block via existing Pattern Use / Pattern data unchanged / export unchanged`
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

export function quickActionPatternCueReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  const target = patternCueReadoutQuickActionTarget(action);
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
  const selectedBlockPlacement = patternCueSwitchSelectedBlockPlacement(project, selectedArrangementIndex, target);

  return {
    id: "pattern-cue-readout",
    label: "Pattern Cue Readout",
    value: [
      "review pattern cue",
      `target Pattern ${target}`,
      selectedBlockPlacement,
      `${eventCount} events`,
      `${drumCount} drums`,
      `${musicEvents} music`,
      `arrangement ${arrangementUse}`,
      `edit Pattern ${project.selectedPattern}`,
      "loop unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function patternCueReadoutQuickActionTarget(action: QuickAction): PatternSlot | null {
  if (action.id !== "pattern-cue-readout-action") {
    return null;
  }

  const match = /Pattern ([ABC])/.exec(`${action.title} ${action.detail}`);
  const slot = match?.[1];
  return slot === "A" || slot === "B" || slot === "C" ? slot : null;
}

export function quickActionPatternSwitchReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0
): { id: string; label: string; value: string } | null {
  const target = patternSwitchReadoutQuickActionTarget(action);
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
  const selectedBlockPlacement = patternCueSwitchSelectedBlockPlacement(project, selectedArrangementIndex, target);

  return {
    id: "pattern-switch-readout",
    label: "Pattern Switch Readout",
    value: [
      "review pattern switch",
      `target Pattern ${target}`,
      selectedBlockPlacement,
      `${eventCount} events`,
      `${drumCount} drums`,
      `${musicEvents} music`,
      `arrangement ${arrangementUse}`,
      `edit Pattern ${project.selectedPattern}`,
      "edit focus unchanged",
      "loop unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function patternSwitchReadoutQuickActionTarget(action: QuickAction): PatternSlot | null {
  if (action.id !== "pattern-switch-readout-action") {
    return null;
  }

  const match = /Pattern ([ABC])/.exec(`${action.title} ${action.detail}`);
  const slot = match?.[1];
  return slot === "A" || slot === "B" || slot === "C" ? slot : null;
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
  const actionLabel =
    action.id === "beat-readiness-route-readout-action"
      ? "review beat readiness route readout"
      : action.id === "beat-readiness-focus"
        ? "focus priority beat readiness"
        : "focus direct beat readiness";
  const laneLabel = quickActionBeatReadinessLaneLabel(action, check);
  const routeParts =
    action.id === "beat-readiness-route-readout-action"
      ? [`route ${beatReadinessRouteLabel(check)}`, `direct command ${beatReadinessCardActionId(check)}`, "beat readiness unchanged"]
      : [];
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
    id: action.id === "beat-readiness-route-readout-action" ? "beat-readiness-route-readout" : "beat-readiness",
    label: action.id === "beat-readiness-route-readout-action" ? "Beat Readiness Route Readout" : "Beat readiness",
    value: `${actionLabel} / ${routeParts.length > 0 ? `${routeParts.join(" / ")} / ` : ""}lane ${laneLabel} / destination ${
      check.focusLabel
    } panel / status ${check.status} / context ${contextLabel} / Pattern ${
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
  const titleLabel = action.title.replace(/^Focus Beat Readiness:\s*/, "").replace(/^Review Beat Readiness Route:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Beat Readiness" && titleLabel !== "Review Beat Readiness Route" ? titleLabel : check.label;
}

export function quickActionHookReadinessMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const isRouteReadout = action.id === "hook-readiness-route-readout-action";
  if (!isRouteReadout && action.id !== "hook-readiness-focus" && !action.id.startsWith("hook-readiness-card-")) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const hookSummary = createHookReadinessSummary(
    project,
    createBeatReadinessChecks(project, exportAnalysis),
    exportAnalysis,
    stemAnalyses
  );
  const card = quickActionHookReadinessCard(hookSummary, action);
  if (!card) {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const target = activeDeliveryTarget(project);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, null);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const hookLoopTarget = createHookLoopCueTarget(project);
  const hookFixOption = createHookFixOption(card);
  const detailParts = quickActionHookReadinessDetailParts(action);
  const contextLabel = isRouteReadout ? detailParts[4] ?? card.detail : detailParts.slice(2).join(" / ") || card.detail;
  const routeLabel = quickActionHookReadinessRouteLabel(detailParts, card, hookSummary);
  const directCardId = isRouteReadout
    ? action.resultTargetId ?? ""
    : action.id.startsWith("hook-readiness-card-")
      ? action.id.slice("hook-readiness-card-".length)
      : "";
  const directCardLabel =
    isRouteReadout && directCardId
      ? `direct hook-readiness-card-${directCardId} unchanged`
      : directCardId
        ? `direct hook-readiness-card-${directCardId}`
        : "active hook readiness command";
  const actionLabel = isRouteReadout
    ? "review hook readiness route readout"
    : action.id === "hook-readiness-focus"
      ? "focus active hook readiness"
      : "focus direct hook readiness";
  const readyCount = hookSummary.cards.filter((candidate) => candidate.tone === "good").length;
  const reviewCount = hookSummary.cards.filter((candidate) => candidate.tone === "warn").length;
  const blockerCount = hookSummary.cards.filter((candidate) => candidate.tone === "danger").length;

  return {
    id: isRouteReadout ? "hook-readiness-route-readout" : "hook-readiness",
    label: isRouteReadout ? "Hook Readiness Route Readout" : "Hook readiness",
    value: [
      `action ${actionLabel}`,
      `lane ${quickActionHookReadinessLaneLabel(action, card)}`,
      `route ${routeLabel}`,
      directCardLabel,
      `destination ${hookReadinessDestinationLabel(card)}`,
      `status ${card.status}`,
      `value ${card.value}`,
      `context ${contextLabel}`,
      `hook ${hookSummary.headline}`,
      hookSummary.detail,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStems.length}/${target.stemGoal} target / ${audibleStems.length}/${stemTrackIds.length} audible`,
      `target ${target.name}`,
      `brief ${sessionBriefFilledFields(project.sessionBrief)}/4`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `hook loop ${hookLoopTarget ? hookLoopCueDetail(hookLoopTarget) : "No Hook section"}`,
      `hook fix ${hookFixOption.label}`,
      isRouteReadout ? "readout only / hook loop unchanged / hook fix unchanged" : "focus command",
      `next ${hookReadinessFocusResultNextCheck(card)}`
    ].join(" / ")
  };
}

export function quickActionHookReadinessCard(
  summary: HookReadinessSummary,
  action: QuickAction
): HookReadinessCard | null {
  if (action.id === "hook-readiness-focus") {
    return activeHookReadinessQuickActionCard(summary);
  }

  if (action.id === "hook-readiness-route-readout-action") {
    return (
      summary.cards.find((card) => card.id === (action.resultTargetId as HookReadinessCardId | undefined)) ??
      activeHookReadinessQuickActionCard(summary)
    );
  }

  const cardId = quickActionHookReadinessCardId(action.id);
  if (!cardId) {
    return null;
  }

  return summary.cards.find((card) => card.id === cardId) ?? null;
}

export function quickActionHookReadinessCardId(actionId: string): HookReadinessCardId | null {
  if (!actionId.startsWith("hook-readiness-card-")) {
    return null;
  }

  return actionId.slice("hook-readiness-card-".length) as HookReadinessCardId;
}

export function quickActionHookReadinessDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionHookReadinessLaneLabel(action: QuickAction, card: HookReadinessCard): string {
  const titleLabel = action.title.replace(/^Focus Hook Readiness:\s*/, "").replace(/^Review Hook Readiness Route:\s*/, "").trim();
  if (titleLabel && titleLabel !== "Focus Hook Readiness" && titleLabel !== "Review Hook Readiness Route") {
    return titleLabel;
  }
  return card.label;
}

export function quickActionHookReadinessRouteLabel(
  parts: string[],
  card: HookReadinessCard,
  summary: HookReadinessSummary
): string {
  const routePart = parts.find((part) => part.startsWith("Route "));
  if (routePart) {
    return routePart.replace(/^Route\s+/, "");
  }
  return hookReadinessRouteLabel(card, summary);
}

export function quickActionToplineSpaceMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const isRouteReadout = action.id === "topline-space-route-readout-action";
  if (!isRouteReadout && action.id !== "topline-space-focus" && !action.id.startsWith("topline-space-card-")) {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const toplineSummary = createToplineSpaceSummary(
    project,
    createBeatReadinessChecks(project, exportAnalysis),
    exportAnalysis,
    stemAnalyses
  );
  const card = quickActionToplineSpaceCard(toplineSummary, action);
  if (!card) {
    return null;
  }

  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const target = activeDeliveryTarget(project);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, null);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const toplineLoopTarget = createToplineLoopCueTarget(project);
  const toplineFixOption = createToplineFixOption(card);
  const detailParts = quickActionToplineSpaceDetailParts(action);
  const contextLabel = isRouteReadout ? detailParts[4] ?? card.detail : detailParts.slice(2).join(" / ") || card.detail;
  const routeLabel = quickActionToplineSpaceRouteLabel(detailParts, card, toplineSummary);
  const directCardId = isRouteReadout
    ? action.resultTargetId ?? ""
    : action.id.startsWith("topline-space-card-")
      ? action.id.slice("topline-space-card-".length)
      : "";
  const directCardLabel =
    isRouteReadout && directCardId
      ? `direct topline-space-card-${directCardId} unchanged`
      : directCardId
        ? `direct topline-space-card-${directCardId}`
        : "active topline space command";
  const actionLabel = isRouteReadout
    ? "review topline space route readout"
    : action.id === "topline-space-focus"
      ? "focus active topline space"
      : "focus direct topline space";
  const readyCount = toplineSummary.cards.filter((candidate) => candidate.tone === "good").length;
  const reviewCount = toplineSummary.cards.filter((candidate) => candidate.tone === "warn").length;
  const blockerCount = toplineSummary.cards.filter((candidate) => candidate.tone === "danger").length;

  return {
    id: isRouteReadout ? "topline-space-route-readout" : "topline-space",
    label: isRouteReadout ? "Topline Space Route Readout" : "Topline space",
    value: [
      `action ${actionLabel}`,
      `lane ${quickActionToplineSpaceLaneLabel(action, card)}`,
      `route ${routeLabel}`,
      directCardLabel,
      `destination ${toplineSpaceDestinationLabel(card)}`,
      `status ${card.status}`,
      `value ${card.value}`,
      `context ${contextLabel}`,
      `topline ${toplineSummary.headline}`,
      toplineSummary.detail,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStems.length}/${target.stemGoal} target / ${audibleStems.length}/${stemTrackIds.length} audible`,
      `target ${target.name}`,
      `brief ${sessionBriefFilledFields(project.sessionBrief)}/4`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `topline loop ${toplineLoopCueDetail(toplineLoopTarget)}`,
      `topline fix ${toplineFixOption.label}`,
      isRouteReadout ? "readout only / topline loop unchanged / topline fix unchanged" : "focus command",
      `${workflowCountLabel(readyCount, "ready")}`,
      `${workflowCountLabel(reviewCount, "review")}`,
      `${workflowCountLabel(blockerCount, "blocker")}`,
      `next ${toplineSpaceFocusResultNextCheck(card)}`
    ].join(" / ")
  };
}

export function quickActionToplineSpaceCard(
  summary: ToplineSpaceSummary,
  action: QuickAction
): ToplineSpaceCard | null {
  if (action.id === "topline-space-focus") {
    return activeToplineSpaceQuickActionCard(summary);
  }

  if (action.id === "topline-space-route-readout-action") {
    return (
      summary.cards.find((card) => card.id === (action.resultTargetId as ToplineSpaceCardId | undefined)) ??
      activeToplineSpaceQuickActionCard(summary)
    );
  }

  const cardId = quickActionToplineSpaceCardId(action.id);
  if (!cardId) {
    return null;
  }

  return summary.cards.find((card) => card.id === cardId) ?? null;
}

export function quickActionToplineSpaceCardId(actionId: string): ToplineSpaceCardId | null {
  if (!actionId.startsWith("topline-space-card-")) {
    return null;
  }

  return actionId.slice("topline-space-card-".length) as ToplineSpaceCardId;
}

export function quickActionToplineSpaceDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionToplineSpaceLaneLabel(action: QuickAction, card: ToplineSpaceCard): string {
  const titleLabel = action.title.replace(/^Focus Topline Space:\s*/, "").replace(/^Review Topline Space Route:\s*/, "").trim();
  if (titleLabel && titleLabel !== "Focus Topline Space" && titleLabel !== "Review Topline Space Route") {
    return titleLabel;
  }
  return card.label;
}

export function quickActionToplineSpaceRouteLabel(
  parts: string[],
  card: ToplineSpaceCard,
  summary: ToplineSpaceSummary
): string {
  const routePart = parts.find((part) => part.startsWith("Route "));
  if (routePart) {
    return routePart.replace(/^Route\s+/, "");
  }
  return toplineSpaceRouteLabel(card, summary);
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
  const isRouteReadout = action.id === "listening-pass-route-readout-action";
  const actionLabel = isRouteReadout
    ? "review listening pass route readout"
    : action.id === "listening-pass-focus"
      ? "focus priority listening pass"
      : "focus direct listening pass";
  const directCheckpointLabel = `direct listening-pass-checkpoint-${item.id} unchanged`;
  const laneLabel = quickActionListeningPassLaneLabel(action, item);
  const drumCount = drumHitCount(pattern);
  const musicEvents = pattern.bassNotes.length + pattern.chordEvents.length + pattern.melodyNotes.length;

  return {
    id: isRouteReadout ? "listening-pass-route-readout" : "listening-pass",
    label: isRouteReadout ? "Listening Pass Route Readout" : "Listening pass",
    value: `${actionLabel} / route ${listeningPassRouteLabel(item)} / checkpoint ${laneLabel} / ${directCheckpointLabel} / destination ${item.focusLabel} panel / status ${item.status} / context ${
      item.detail
    } / cue ${cueLabel} / metric ${item.metric} / Pattern ${project.selectedPattern} / ${patternEventTotal(
      pattern
    )} events / ${drumCount} drum hits / ${musicEvents} music events / readiness ${listeningPassFocusResultMetric(summary)} / ${
      project.arrangement.length
    } blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionListeningPassItem(summary: ListeningPassSummary, action: QuickAction): ListeningPassItem | null {
  if (action.id === "listening-pass-route-readout-action" || action.id === "listening-pass-focus") {
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
  const titleLabel = action.title.replace(/^Focus Listening Pass:\s*/, "").replace(/^Review Listening Pass Route:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Listening Pass" && titleLabel !== "Review Listening Pass Route" ? titleLabel : item.label;
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
  const isRouteReadout = action.id === "beat-passport-route-readout-action";
  const actionLabel = isRouteReadout
    ? "review beat passport route readout"
    : action.id === "beat-passport-focus"
      ? "focus priority beat passport"
      : "focus direct beat passport";
  const directMetricLabel = `direct beat-passport-metric-${metric.id} unchanged`;
  const laneLabel = quickActionBeatPassportLaneLabel(action, metric);
  const detailParts = quickActionBeatPassportDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || metric.detail;

  return {
    id: isRouteReadout ? "beat-passport-route-readout" : "beat-passport",
    label: isRouteReadout ? "Beat Passport Route Readout" : "Beat passport",
    value: `${actionLabel} / route ${beatPassportRouteLabel(metric)} / metric ${laneLabel} / ${directMetricLabel} / destination ${
      metric.focusLabel
    } panel / status ${metric.value} / context ${contextLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${patternUseLabel} / identity ${summary.headline} / ${summary.detail} / passport ${beatPassportFocusResultMetric(
      summary
    )} / ${project.arrangement.length} blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionBeatPassportMetric(summary: BeatPassportSummary, action: QuickAction): BeatPassportMetric | null {
  if (action.id === "beat-passport-route-readout-action" || action.id === "beat-passport-focus") {
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
  const titleLabel = action.title.replace(/^Focus Beat Passport:\s*/, "").replace(/^Review Beat Passport Route:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Beat Passport" && titleLabel !== "Review Beat Passport Route" ? titleLabel : metric.label;
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
  const isRouteReadout = action.id === "production-snapshot-route-readout-action";
  const actionLabel = isRouteReadout
    ? "review production snapshot route readout"
    : action.id === "production-snapshot-focus"
      ? "focus priority production snapshot"
      : "focus direct production snapshot";
  const directMetricLabel = `direct production-snapshot-metric-${metric.id} unchanged`;
  const laneLabel = quickActionProductionSnapshotLaneLabel(action, metric);
  const detailParts = quickActionProductionSnapshotDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || metric.detail;
  const postureLabel = summary.metrics.map((item) => `${item.label} ${item.value}`).join(" / ");

  return {
    id: isRouteReadout ? "production-snapshot-route-readout" : "production-snapshot",
    label: isRouteReadout ? "Production Snapshot Route Readout" : "Production snapshot",
    value: `${actionLabel} / route ${productionSnapshotRouteLabel(
      metric
    )} / metric ${laneLabel} / ${directMetricLabel} / destination ${
      metric.focusLabel
    } panel / status ${metric.value} / context ${contextLabel} / Pattern ${
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
  if (action.id === "production-snapshot-route-readout-action" || action.id === "production-snapshot-focus") {
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
  const titleLabel = action.title
    .replace(/^Focus Production Snapshot:\s*/, "")
    .replace(/^Review Production Snapshot Route:\s*/, "")
    .trim();
  return titleLabel && titleLabel !== "Focus Production Snapshot" && titleLabel !== "Review Production Snapshot Route"
    ? titleLabel
    : metric.label;
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
  const isRouteReadout = action.id === "finish-checklist-route-readout-action";
  const actionLabel = isRouteReadout
    ? "review finish checklist route readout"
    : action.id === "finish-checklist-focus"
      ? "focus priority finish checklist"
      : "focus direct finish checklist";
  const directCardLabel = `direct finish-checklist-card-${card.id} unchanged`;
  const laneLabel = quickActionFinishChecklistLaneLabel(action, card);
  const detailParts = quickActionFinishChecklistDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || card.detail;
  const postureLabel = summary.cards.map((item) => `${item.label} ${item.status}`).join(" / ");

  return {
    id: isRouteReadout ? "finish-checklist-route-readout" : "finish-checklist",
    label: isRouteReadout ? "Finish Checklist Route Readout" : "Finish checklist",
    value: `${actionLabel} / route ${finishChecklistRouteLabel(
      card
    )} / card ${laneLabel} / ${directCardLabel} / destination ${card.focusLabel} panel / status ${
      card.status
    } / context ${contextLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${patternUseLabel} / finish ${postureLabel} / readiness ${
      summary.headline
    } / ${summary.detail} / checklist ${finishChecklistFocusResultMetric(summary)} / ${
      project.arrangement.length
    } blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionFinishChecklistCard(summary: FinishChecklistSummary, action: QuickAction): FinishChecklistCard | null {
  if (action.id === "finish-checklist-route-readout-action" || action.id === "finish-checklist-focus") {
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
  const titleLabel = action.title
    .replace(/^Focus Finish Checklist:\s*/, "")
    .replace(/^Review Finish Checklist Route:\s*/, "")
    .trim();
  return titleLabel && titleLabel !== "Focus Finish Checklist" && titleLabel !== "Review Finish Checklist Route"
    ? titleLabel
    : card.label;
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
  const isRouteReadout = action.id === "review-queue-route-readout-action";
  const actionLabel = isRouteReadout
    ? "review queue route readout"
    : action.id === "review-queue-focus"
      ? "focus priority review queue"
      : "focus direct review queue";
  const directIssueLabel = `direct review-queue-item-${item.id} unchanged`;
  const laneLabel = quickActionReviewQueueLaneLabel(action, item);
  const detailParts = quickActionReviewQueueDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || item.detail;
  const postureLabel = summary.items.map((queueItem) => `${queueItem.area} ${queueItem.status}`).join(" / ");
  const fix = createReviewFixOption(item, project, exportAnalysis);
  const fixLabel = fix ? `${fix.label} available` : "no one-step fix";

  return {
    id: isRouteReadout ? "review-queue-route-readout" : "review-queue",
    label: isRouteReadout ? "Review Queue Route Readout" : "Review queue",
    value: `${actionLabel} / route ${reviewQueueRouteLabel(
      item
    )} / issue ${laneLabel} / ${directIssueLabel} / review-fix unchanged / destination ${
      item.focusLabel
    } panel / status ${item.status} / context ${contextLabel} / Pattern ${
      project.selectedPattern
    } / ${patternEventTotal(pattern)} events / ${patternUseLabel} / queue ${postureLabel} / review ${
      summary.headline
    } / ${summary.detail} / fix ${fixLabel} / metric ${reviewQueueFocusResultMetric(summary)} / ${
      project.arrangement.length
    } blocks / ${barCountLabel(arrangementTotalBars(project))}`
  };
}

export function quickActionReviewQueueItem(summary: ReviewQueueSummary, action: QuickAction): ReviewQueueItem | null {
  if (action.id === "review-queue-route-readout-action" || action.id === "review-queue-focus") {
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
  const titleLabel = action.title
    .replace(/^Focus Review Queue:\s*/, "")
    .replace(/^Review Review Queue Route:\s*/, "")
    .trim();
  return titleLabel && titleLabel !== "Focus Review Queue" && titleLabel !== "Review Review Queue Route"
    ? titleLabel
    : item.area;
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

export function quickActionComposerActionsReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  selectedArrangementIndex = 0,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "composer-actions-readout-action") {
    return null;
  }

  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, exportAnalysis);
  const summary = createComposerActionsSummary(project, checks, exportAnalysis, stemAnalyses);
  const composerAction = summary.actions[0] ?? null;
  const followup = quickActionResultFollowup(action, project, "complete");
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const target = activeDeliveryTarget(project);

  return {
    id: "composer-actions-readout",
    label: "Composer Actions Readout",
    value: [
      "review composer actions",
      `move ${composerAction?.label ?? summary.headline}`,
      `area ${composerAction ? quickActionComposerActionAreaLabel(composerAction.area) : "no writing area"}`,
      `route ${composerAction ? quickActionComposerActionRouteLabel(composerAction, composerAction.area) : "no route"}`,
      `scope ${composerAction?.scope ?? "read-only composer-action check"}`,
      `impact ${composerAction?.impact ?? "no project change"}`,
      `undo ${composerAction?.safety ?? "no undo entry needed"}`,
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
      `composer ${summary.headline} / ${summary.detail}`,
      "action unchanged",
      "playback unchanged",
      "export unchanged",
      "sampler scope unchanged",
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
    action.id === "export-preflight-route-readout-action"
      ? "review export preflight route readout"
      : action.id === "export-preflight-focus"
        ? "focus priority export preflight"
        : "focus direct export preflight";
  const laneLabel = quickActionExportPreflightLaneLabel(action, card);
  const detailParts = quickActionExportPreflightDetailParts(action);
  const contextLabel = detailParts.slice(2).join(" / ") || card.detail;
  const postureLabel = summary.cards.map((item) => `${item.label} ${item.value}`).join(" / ");
  const routeParts =
    action.id === "export-preflight-route-readout-action"
      ? [
          `route ${exportPreflightRouteLabel(card)}`,
          `direct command export-preflight-card-${card.id}`,
          "export preflight unchanged"
        ]
      : [];

  return {
    id: action.id === "export-preflight-route-readout-action" ? "export-preflight-route-readout" : "export-preflight",
    label: action.id === "export-preflight-route-readout-action" ? "Export Preflight Route Readout" : "Export preflight",
    value: [
      actionLabel,
      ...routeParts,
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
  if (action.id === "export-preflight-route-readout-action" || action.id === "export-preflight-focus") {
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
  const titleLabel = action.title.replace(/^Focus Export Preflight:\s*/, "").replace(/^Review Export Preflight Route:\s*/, "").trim();
  return titleLabel && titleLabel !== "Focus Export Preflight" && titleLabel !== "Review Export Preflight Route"
    ? titleLabel
    : card.label;
}

export function quickActionHandoffPackMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const isRouteReadout = action.id === "handoff-route-readout-action";
  if (action.id !== "handoff-pack" && !isRouteReadout) {
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
  const detailParts = quickActionHandoffRouteDetailParts(action);
  const routeLabel = isRouteReadout ? (detailParts[0] ?? routeSummary.routeLabel) : routeSummary.routeLabel;
  const routeDetail = isRouteReadout ? (detailParts[1] ?? routeSummary.detailLabel) : routeSummary.detailLabel;
  const routeFile = isRouteReadout ? (detailParts[2] ?? routeSummary.fileLabel) : routeSummary.fileLabel;
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: isRouteReadout ? "handoff-route-readout" : "handoff-pack",
    label: isRouteReadout ? "Handoff Route Readout" : "Handoff Pack",
    value: [
      isRouteReadout ? "review handoff route" : "review package readout",
      "destination Deliver / Handoff Pack",
      `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
      `route ${routeLabel} / ${routeSummary.statusLabel} / ${routeDetail}`,
      `route file ${routeFile}`,
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
      `next ${sendOrder.nextLabel}`,
      "route unchanged",
      "export unchanged",
      "receipt unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionHandoffRouteDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionHandoffDeliveryTargetReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-delivery-target-readout-action") {
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
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionHandoffDeliveryTargetDetailParts(action);
  const contextLabel = detailParts.join(" / ") || `${target.name} / ${target.focus}`;
  const lengthFit =
    bars === target.targetBars
      ? "target length matched"
      : bars < target.targetBars
        ? `${barCountLabel(target.targetBars - bars)} short`
        : `${barCountLabel(bars - target.targetBars)} over`;
  const stemFit =
    audibleStemCount >= target.stemGoal
      ? "stem target met"
      : `${Math.max(0, target.stemGoal - audibleStemCount)} target stems open`;
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "handoff-delivery-target-readout",
    label: "Handoff Delivery Target Readout",
    value: [
      "review handoff delivery target",
      "destination Deliver / Handoff Pack",
      `target ${target.name}`,
      `focus ${target.focus}`,
      `target length ${barCountLabel(target.targetBars)} / current ${barCountLabel(bars)} / ${lengthFit}`,
      `template ${arrangementTemplateLabel(target.preferredTemplate)}`,
      `preferred master ${target.preferredMasterPreset}`,
      `current master ${deliveryTargetMasterLabel(project)}`,
      `mix posture ${mixPostureLabel(target.mixPosture)}`,
      `stems ${audibleStemCount}/${target.stemGoal} target / ${audibleStemCount}/${stemTrackIds.length} audible / ${stemFit}`,
      `brief ${sessionBriefFilledFields(project.sessionBrief)}/4 / ${briefStatus.value}`,
      `sheet ${handoffSheetFileName(project)}`,
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `receipt ${receipt.statusLabel} / ${receipt.fileLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      "target selection unchanged",
      "alignment unchanged",
      "export unchanged",
      "receipt unchanged",
      "sampler scope unchanged",
      `context ${contextLabel}`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionHandoffDeliveryTargetDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionHandoffSessionBriefReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-session-brief-readout-action") {
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
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const briefFields = sessionBriefFilledFields(project.sessionBrief);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionHandoffSessionBriefDetailParts(action);
  const contextLabel = detailParts.join(" / ") || `${briefFields}/4 brief / ${handoffSheetFileName(project)}`;
  const sheetItem = handoffPackItems.find((item) => item.id === "sheet") ?? null;
  const fieldPosture = quickActionSessionBriefStarterFieldPosture(project.sessionBrief);
  const artist = project.sessionBrief.artist.trim()
    ? compactSessionBriefValue(project.sessionBrief.artist)
    : "empty";
  const vibe = project.sessionBrief.vibe.trim()
    ? compactSessionBriefValue(project.sessionBrief.vibe)
    : "empty";
  const reference = project.sessionBrief.reference.trim()
    ? compactSessionBriefValue(project.sessionBrief.reference)
    : "empty";
  const notes = project.sessionBrief.notes.trim()
    ? compactSessionBriefValue(project.sessionBrief.notes)
    : "empty";
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "handoff-session-brief-readout",
    label: "Handoff Session Brief Readout",
    value: [
      "review handoff session brief",
      "destination Deliver / Handoff Pack",
      `brief ${briefFields}/4 / ${briefStatus.value}`,
      `brief detail ${briefStatus.detail}`,
      `artist ${artist}`,
      `vibe ${vibe}`,
      `reference ${reference}`,
      `notes ${notes}`,
      `fields ${fieldPosture}`,
      `sheet ${handoffSheetFileName(project)} / ${sheetItem?.value ?? `${briefFields}/4 brief`} / ${
        sheetItem?.detail ?? target.name
      }`,
      `target ${target.name} / ${target.focus}`,
      `stems ${audibleStemCount}/${target.stemGoal} target / ${audibleStemCount}/${stemTrackIds.length} audible`,
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `receipt ${receipt.statusLabel} / ${receipt.fileLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(bars),
      "brief unchanged",
      "sheet unchanged",
      "export unchanged",
      "receipt unchanged",
      "sampler scope unchanged",
      `context ${contextLabel}`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionHandoffSessionBriefDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionHandoffFinalCheckReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-final-check-readout-action") {
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
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const routeTone = weakestTone(handoffPackItems.map((item) => item.tone));
  const routeSummary = createHandoffPackRouteSummary(project, stemAnalyses, handoffPackItems, routeTone);
  const sendOrder = createHandoffPackSendOrderSummary(project, handoffPackItems);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const manifest = createHandoffFileManifest(project, stemAnalyses, handoffPackItems);
  const manifestAudit = createHandoffManifestAudit(project, handoffPackItems, manifest, receipt, sendOrder);
  const formatSummary = createHandoffExportFormatSummary(project, exportAnalysis, stemAnalyses, handoffPackItems);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
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
  const finalDecision =
    blockerCount > 0 ? "blocked before send" : reviewCount > 0 ? "review before send" : "ready for explicit handoff";
  const detailParts = quickActionHandoffFinalCheckDetailParts(action);
  const contextLabel = detailParts.join(" / ") || `${finalDecision} / ${sendOrder.nextLabel}`;
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "handoff-final-check-readout",
    label: "Handoff Final Check Readout",
    value: [
      "review handoff final check",
      "destination Deliver / Handoff Pack",
      `final ${finalDecision}`,
      `checks ${readyCount}/${handoffPackItems.length} ready`,
      workflowCountLabel(reviewCount, "review"),
      workflowCountLabel(blockerCount, "blocker"),
      `target ${target.name} / ${target.focus} / ${barCountLabel(target.targetBars)}`,
      `brief ${sessionBriefFilledFields(project.sessionBrief)}/4 / ${briefStatus.value}`,
      `sheet ${handoffSheetFileName(project)}`,
      `route ${routeSummary.routeLabel} / ${routeSummary.statusLabel} / ${routeSummary.detailLabel}`,
      `items ${itemPosture}`,
      `wav ${mixWavFileName(project)} / ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStemCount}/${target.stemGoal} target / ${audibleStemCount}/${stemTrackIds.length} audible`,
      `midi ${midiFileName(project)} / ${barCountLabel(bars)}`,
      `format ${formatSummary.statusLabel} / ${formatSummary.titleLabel} / ${formatSummary.durationLabel}`,
      `formats ${formatPosture}`,
      `manifest ${manifestAudit.statusLabel} / ${manifestAudit.detailLabel}`,
      `planned ${manifestPosture}`,
      `receipt ${receipt.statusLabel} / ${receipt.fileLabel} / ${receipt.nextLabel}`,
      `send ${sendOrder.statusLabel} / ${sendOrder.nextLabel} / ${nextItemLabel}`,
      `sequence ${sendOrder.sequenceLabel}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(bars),
      "final check unchanged",
      "export unchanged",
      "receipt unchanged",
      "package unchanged",
      "sampler scope unchanged",
      `context ${contextLabel}`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionHandoffFinalCheckDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
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

export function quickActionHandoffSendReadinessReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-send-readiness-readout-action") {
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
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const sendOrder = createHandoffPackSendOrderSummary(project, handoffPackItems);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const manifest = createHandoffFileManifest(project, stemAnalyses, handoffPackItems);
  const manifestAudit = createHandoffManifestAudit(project, handoffPackItems, manifest, receipt, sendOrder);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const readinessLabel = handoffSendReadinessLabel(handoffPackItems, packageSummary, manifestAudit, receipt);
  const gateLabel = handoffSendReadinessGateLabel(packageSummary, manifestAudit, receipt);
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const itemPosture = handoffPackItems.map((item) => `${item.buttonLabel} ${item.value}`).join(" / ");
  const packageCards = packageSummary.cards.map((card) => `${card.label} ${card.status}`).join(" / ");
  const detailParts = quickActionHandoffSendReadinessDetailParts(action);
  const contextLabel = detailParts.join(" / ") || `${readinessLabel} / ${gateLabel}`;
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "handoff-send-readiness-readout",
    label: "Handoff Send Readiness Readout",
    value: [
      "review handoff send readiness",
      "destination Deliver / Handoff Pack",
      `readiness ${readinessLabel}`,
      `gate ${gateLabel}`,
      `checks ${readyCount}/${handoffPackItems.length} ready`,
      workflowCountLabel(reviewCount, "review"),
      workflowCountLabel(blockerCount, "blocker"),
      `target ${target.name} / ${target.focus}`,
      `brief ${sessionBriefFilledFields(project.sessionBrief)}/4 / ${briefStatus.value}`,
      `sheet ${handoffSheetFileName(project)}`,
      `wav ${mixWavFileName(project)} / ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStemCount}/${target.stemGoal} target / ${audibleStemCount}/${stemTrackIds.length} audible`,
      `midi ${midiFileName(project)} / ${barCountLabel(bars)}`,
      `items ${itemPosture}`,
      `cards ${packageCards}`,
      `manifest ${manifestAudit.statusLabel} / ${manifestAudit.detailLabel}`,
      `receipt ${receipt.statusLabel} / ${receipt.fileLabel}`,
      `send ${sendOrder.statusLabel} / ${sendOrder.nextLabel}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(bars),
      "send readiness unchanged",
      "export unchanged",
      "receipt unchanged",
      "package unchanged",
      "sampler scope unchanged",
      `context ${contextLabel}`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionHandoffSendReadinessDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionHandoffBlockerReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-blocker-readout-action") {
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
  const blockerItem =
    handoffPackItems.find((item) => item.tone === "danger") ??
    handoffPackItems.find((item) => item.tone === "warn") ??
    null;
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const sendOrder = createHandoffPackSendOrderSummary(project, handoffPackItems);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const manifest = createHandoffFileManifest(project, stemAnalyses, handoffPackItems);
  const manifestAudit = createHandoffManifestAudit(project, handoffPackItems, manifest, receipt, sendOrder);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const itemPosture = handoffPackItems.map((item) => `${item.buttonLabel} ${item.value}`).join(" / ");
  const detailParts = quickActionHandoffBlockerDetailParts(action);
  const blockerLevel = blockerItem ? (blockerItem.tone === "danger" ? "blocker" : "review") : "clear";
  const blockerLabel = blockerItem ? `${blockerItem.label} ${blockerItem.value} / ${blockerItem.detail}` : "No blocker lanes";
  const contextLabel = detailParts.join(" / ") || `${blockerLevel} / ${blockerLabel}`;
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "handoff-blocker-readout",
    label: "Handoff Blocker Readout",
    value: [
      "review handoff blocker",
      "destination Deliver / Handoff Pack",
      `priority ${blockerLevel}`,
      `lane ${blockerLabel}`,
      `button ${blockerItem?.buttonLabel ?? "none"}`,
      `checks ${readyCount}/${handoffPackItems.length} ready`,
      workflowCountLabel(reviewCount, "review"),
      workflowCountLabel(blockerCount, "blocker"),
      `target ${target.name} / ${target.focus}`,
      `brief ${sessionBriefFilledFields(project.sessionBrief)}/4 / ${briefStatus.value}`,
      `sheet ${handoffSheetFileName(project)}`,
      `wav ${mixWavFileName(project)} / ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStemCount}/${target.stemGoal} target / ${audibleStemCount}/${stemTrackIds.length} audible`,
      `midi ${midiFileName(project)} / ${barCountLabel(bars)}`,
      `items ${itemPosture}`,
      `manifest ${manifestAudit.statusLabel} / ${manifestAudit.detailLabel}`,
      `receipt ${receipt.statusLabel} / ${receipt.fileLabel}`,
      `send ${sendOrder.statusLabel} / ${sendOrder.nextLabel}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(bars),
      "blocker unchanged",
      "export unchanged",
      "receipt unchanged",
      "package unchanged",
      "sampler scope unchanged",
      `context ${contextLabel}`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionHandoffBlockerDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
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

export function quickActionHandoffBlockerRouteReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-blocker-route-readout-action") {
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
  const blockerItem =
    handoffPackItems.find((item) => item.tone === "danger") ??
    handoffPackItems.find((item) => item.tone === "warn") ??
    null;
  const routeLabel = handoffBlockerRouteLabel(blockerItem);
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const sendOrder = createHandoffPackSendOrderSummary(project, handoffPackItems);
  const receipt = exportReceipt ?? emptyHandoffExportReceipt();
  const manifest = createHandoffFileManifest(project, stemAnalyses, handoffPackItems);
  const manifestAudit = createHandoffManifestAudit(project, handoffPackItems, manifest, receipt, sendOrder);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const briefStatus = sessionBriefStatus(project.sessionBrief);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const itemPosture = handoffPackItems.map((item) => `${item.buttonLabel} ${item.value}`).join(" / ");
  const detailParts = quickActionHandoffBlockerRouteDetailParts(action);
  const blockerLevel = blockerItem ? (blockerItem.tone === "danger" ? "blocker" : "review") : "clear";
  const blockerLabel = blockerItem ? `${blockerItem.label} ${blockerItem.value} / ${blockerItem.detail}` : "No blocker lanes";
  const contextLabel = detailParts.join(" / ") || `${blockerLevel} / ${blockerLabel} / ${routeLabel}`;
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "handoff-blocker-route-readout",
    label: "Handoff Blocker Route Readout",
    value: [
      "review handoff blocker route",
      "destination Deliver / Handoff Pack",
      `priority ${blockerLevel}`,
      `lane ${blockerLabel}`,
      `route ${routeLabel}`,
      `button ${blockerItem?.buttonLabel ?? "none"}`,
      `checks ${readyCount}/${handoffPackItems.length} ready`,
      workflowCountLabel(reviewCount, "review"),
      workflowCountLabel(blockerCount, "blocker"),
      `target ${target.name} / ${target.focus}`,
      `brief ${sessionBriefFilledFields(project.sessionBrief)}/4 / ${briefStatus.value}`,
      `sheet ${handoffSheetFileName(project)}`,
      `wav ${mixWavFileName(project)} / ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStemCount}/${target.stemGoal} target / ${audibleStemCount}/${stemTrackIds.length} audible`,
      `midi ${midiFileName(project)} / ${barCountLabel(bars)}`,
      `items ${itemPosture}`,
      `manifest ${manifestAudit.statusLabel} / ${manifestAudit.detailLabel}`,
      `receipt ${receipt.statusLabel} / ${receipt.fileLabel}`,
      `send ${sendOrder.statusLabel} / ${sendOrder.nextLabel}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `${project.arrangement.length} blocks`,
      barCountLabel(bars),
      "blocker route unchanged",
      "export unchanged",
      "receipt unchanged",
      "package unchanged",
      "sampler scope unchanged",
      `context ${contextLabel}`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionHandoffBlockerRouteDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionHandoffExportReceiptMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const isReadout = action.id === "handoff-export-receipt-readout-action";
  if (action.id !== "handoff-export-receipt-focus" && !isReadout) {
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
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionHandoffExportReceiptDetailParts(action);
  const statusLabel = detailParts[0] ?? receipt.statusLabel;
  const contextLabel = detailParts.slice(1).join(" / ") || `${receipt.fileLabel} / ${receipt.detailLabel}`;
  const deliverableLabel = receipt.itemId ? handoffExportReceiptItemLabel(receipt.itemId) : "No deliverable";
  const directTarget = receipt.itemId ? handoffNextExportDirectTarget(receipt.itemId) : null;
  const fileTargetLabel = directTarget ? directExportQuickActionFileLabel(project, directTarget) : "No file target";
  const readinessLabel = directTarget
    ? directExportQuickActionReadinessLabel(project, directTarget, exportAnalysis, stemAnalyses)
    : "No receipt deliverable yet";
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: isReadout ? "handoff-export-receipt-readout" : "handoff-export-receipt",
    label: isReadout ? "Handoff Export Receipt Readout" : "Handoff receipt",
    value: [
      isReadout ? "review export receipt" : "focus export receipt",
      "destination Deliver panel",
      `status ${statusLabel}`,
      `deliverable ${deliverableLabel}`,
      `file ${receipt.fileLabel}`,
      `file target ${fileTargetLabel}`,
      `context ${contextLabel}`,
      `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
      readinessLabel,
      `next ${receipt.nextLabel}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `send ${sendOrder.statusLabel} / ${sendOrder.nextLabel}`,
      `sequence ${sendOrder.sequenceLabel}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `${project.arrangement.length} blocks`,
      barCountLabel(bars),
      "receipt unchanged",
      "export unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
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
    case "bundle":
      return "Delivery Bundle";
  }
}

export function quickActionHandoffSendOrderMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  const isReadout = action.id === "handoff-send-order-readout-action";
  if (action.id !== "handoff-send-order-focus" && !isReadout) {
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
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
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
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: isReadout ? "handoff-send-order-readout" : "handoff-send-order",
    label: isReadout ? "Handoff Send Order Readout" : "Handoff send order",
    value: [
      isReadout ? "review send order" : "focus send order",
      "destination Deliver panel",
      `next ${nextLabel}`,
      `status ${statusLabel}`,
      `context ${contextLabel}`,
      `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
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
      barCountLabel(bars),
      "send order unchanged",
      "export unchanged",
      "receipt unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
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
  const isReadout = action.id === "handoff-manifest-audit-readout-action";
  if (action.id !== "handoff-manifest-audit-focus" && !isReadout) {
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
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionHandoffManifestAuditDetailParts(action);
  const statusLabel = isReadout ? (detailParts[0] ?? summary.statusLabel) : summary.statusLabel;
  const contextLabel = (isReadout ? detailParts[1] : detailParts[0]) ?? summary.detailLabel;
  const receiptLabel = (isReadout ? detailParts[2] : detailParts[1]) ?? summary.receiptLabel;
  const nextLabel = (isReadout ? detailParts[3] : detailParts[2]) ?? summary.nextLabel;
  const manifestPosture = summary.checks.map((check) => `${check.label} ${check.statusLabel}`).join(" / ");
  const readyCount = summary.checks.filter((check) => check.tone === "good").length;
  const reviewCount = summary.checks.filter((check) => check.tone === "warn").length;
  const blockerCount = summary.checks.filter((check) => check.tone === "danger").length;
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: isReadout ? "handoff-manifest-audit-readout" : "handoff-manifest-audit",
    label: isReadout ? "Handoff Manifest Audit Readout" : "Handoff manifest",
    value: [
      isReadout ? "review manifest audit" : "focus manifest audit",
      "destination Deliver panel",
      `status ${statusLabel}`,
      `context ${contextLabel}`,
      `target ${target.name} / ${barCountLabel(target.targetBars)} / ${target.stemGoal} stems`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `manifest ${manifestPosture}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `receipt ${receiptLabel}`,
      `file ${receipt.fileLabel}`,
      `next ${nextLabel}`,
      `send ${sendOrder.statusLabel}`,
      `sequence ${sendOrder.sequenceLabel}`,
      `checks ${readyCount}/${summary.checks.length} clear`,
      workflowCountLabel(reviewCount, "review"),
      workflowCountLabel(blockerCount, "blocker"),
      `${project.arrangement.length} blocks`,
      barCountLabel(bars),
      "manifest unchanged",
      "export unchanged",
      "receipt unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionHandoffManifestAuditDetailParts(action: QuickAction): string[] {
  return action.detail
    .split(" / ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function quickActionHandoffExportFormatReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction,
  exportReceipt: HandoffExportReceipt | null,
  analysis?: ExportAnalysis
): { id: string; label: string; value: string } | null {
  if (action.id !== "handoff-export-format-readout-action") {
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
  const summary = createHandoffExportFormatSummary(project, exportAnalysis, stemAnalyses, handoffPackItems);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, exportReceipt);
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const patternUseLabel = usedSlots.length > 0 ? `${usedSlots.join("/")} used` : `Pattern ${project.selectedPattern} only`;
  const detailParts = quickActionHandoffExportFormatDetailParts(action);
  const contextLabel = detailParts.join(" / ") || summary.detailTitle;
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const formatPosture = summary.metrics.map((metric) => `${metric.label} ${metric.value}`).join(" / ");
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "handoff-export-format-readout",
    label: "Handoff Export Format Readout",
    value: [
      "review handoff export format",
      "destination Deliver panel",
      `format ${summary.statusLabel}`,
      `wav ${summary.titleLabel}`,
      `duration ${summary.durationLabel}`,
      `file ${mixWavFileName(project)}`,
      `stems ${stemWavFileNames(project).length} files / ${audibleStemCount}/${stemTrackIds.length} audible`,
      `midi ${midiFileName(project)} / ${barCountLabel(arrangementTotalBars(project))}`,
      `sheet ${handoffSheetFileName(project)} / brief ${sessionBriefFilledFields(project.sessionBrief)}/4`,
      `target ${target.name}`,
      `package ${packageSummary.headline}`,
      packageSummary.detail,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} editable events`,
      patternUseLabel,
      `formats ${formatPosture}`,
      `${project.arrangement.length} blocks`,
      barCountLabel(arrangementTotalBars(project)),
      "export unchanged",
      "receipt unchanged",
      "format derivation unchanged",
      "sampler scope unchanged",
      `context ${contextLabel}`,
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
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

export const SESSION_PASS_DETAIL_LABEL_PREFIXES = [
  "Destination ",
  "Session ",
  "Context ",
  "Audition ",
  "Next ",
  "Direct ",
  "Readout "
] as const;

export function quickActionSessionPassMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const isRouteReadout = action.id === "session-pass-route-readout-action";
  if (!isRouteReadout && action.id !== "session-pass-focus" && !action.id.startsWith("session-pass-card-")) {
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
  const directCardId = isRouteReadout
    ? action.resultTargetId ?? ""
    : action.id.startsWith("session-pass-card-")
      ? action.id.slice("session-pass-card-".length)
      : "";
  const directCardLabel =
    isRouteReadout && directCardId
      ? `direct session-pass-card-${directCardId} unchanged`
      : directCardId
        ? `direct session-pass-card-${directCardId}`
        : "active session pass command";
  const actionLabel = isRouteReadout
    ? "review session pass route readout"
    : action.id === "session-pass-focus"
      ? "focus active session pass"
      : "focus direct session pass";

  return {
    id: "session-pass",
    label: "Session pass",
    value: `${actionLabel} / pass ${passLabel} / route ${routeLabel} / ${directCardLabel} / ${destinationLabel} / ${sessionLabel} / ${contextLabel} / ${auditionLabel} / ${nextCheckLabel} / mode ${modeLabel(
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
  const directId = action.id.startsWith("session-pass-card-")
    ? action.id.slice("session-pass-card-".length)
    : action.id === "session-pass-route-readout-action"
      ? action.resultTargetId ?? ""
      : "";
  const directLabel = directId ? sessionPassLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title
    .replace(/^Review Session Pass Route:\s*/, "")
    .replace(/^Focus Session Pass:\s*/, "")
    .replace(/^Focus\s*/, "")
    .trim();
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
  const isRouteReadout = action.id === "composer-guide-route-readout-action";
  if (!isRouteReadout && action.id !== "composer-guide-focus" && !action.id.startsWith("composer-guide-card-")) {
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
  const routeLabel = quickActionComposerGuideRouteLabel(parts, laneLabel);
  const directCardId = isRouteReadout
    ? action.resultTargetId ?? ""
    : action.id.startsWith("composer-guide-card-")
      ? action.id.slice("composer-guide-card-".length)
      : "";
  const directCardLabel =
    isRouteReadout && directCardId
      ? `direct composer-guide-card-${directCardId} unchanged`
      : directCardId
        ? `direct composer-guide-card-${directCardId}`
        : "active composer guide command";
  const actionLabel = isRouteReadout
    ? "review composer guide route readout"
    : action.id === "composer-guide-focus"
      ? "focus active composer guide"
      : "focus direct composer guide";

  return {
    id: "composer-guide",
    label: "Composer guide",
    value: `${actionLabel} / lane ${laneLabel} / route ${routeLabel} / ${directCardLabel} / destination ${destinationLabel} / status ${statusLabel} / metric ${metricLabel} / audition ${auditionLabel} / next ${nextCheckLabel} / detail ${detailLabel} / mode ${modeLabel(
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
  const directId = action.id.startsWith("composer-guide-card-")
    ? action.id.slice("composer-guide-card-".length)
    : action.id === "composer-guide-route-readout-action"
      ? action.resultTargetId ?? ""
      : "";
  const directLabel = directId ? composerGuideLaneLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title
    .replace(/^Review Composer Guide Route:\s*/, "")
    .replace(/^Focus Composer Guide:\s*/, "")
    .trim();
  return directLabel || titleLabel || "writing lane unavailable";
}

export function quickActionComposerGuideRouteLabel(parts: string[], laneLabel: string): string {
  const routePart = parts.find((part) => part.startsWith("Route "));
  if (routePart) {
    return routePart.replace(/^Route\s+/, "");
  }
  return `${laneLabel} to ${composerGuideDestinationLabelFromLane(laneLabel)}`;
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
  const isRouteReadout = action.id === "key-compass-route-readout-action";
  if (!isRouteReadout && action.id !== "key-compass-focus" && !action.id.startsWith("key-compass-card-")) {
    return null;
  }

  const parts = quickActionKeyCompassDetailParts(action);
  const laneLabel = quickActionKeyCompassLaneLabel(action);
  const keyMetricLabel = isRouteReadout ? parts[2] ?? parts[0] ?? project.key : parts[0] ?? project.key;
  const destinationLabel = parts[1] ?? "Compose";
  const auditionLabel = isRouteReadout ? parts[3] ?? "audition unavailable" : "focus audition after route";
  const nextCheckLabel = isRouteReadout ? parts[4] ?? "next check unavailable" : "return after harmony lane changes";
  const detailLabel = parts.slice(isRouteReadout ? 5 : 2).join(" / ") || "current harmony lane";
  const routeLabel = quickActionKeyCompassRouteLabel(parts, laneLabel);
  const directCardId = isRouteReadout
    ? action.resultTargetId ?? ""
    : action.id.startsWith("key-compass-card-")
      ? action.id.slice("key-compass-card-".length)
      : "";
  const directCardLabel =
    isRouteReadout && directCardId
      ? `direct key-compass-card-${directCardId} unchanged`
      : directCardId
        ? `direct key-compass-card-${directCardId}`
        : "active key compass command";
  const actionLabel = isRouteReadout
    ? "review key compass route readout"
    : action.id === "key-compass-focus"
      ? "focus active key compass"
      : "focus direct key compass";

  return {
    id: "key-compass",
    label: "Key compass",
    value: `${actionLabel} / lane ${laneLabel} / route ${routeLabel} / ${directCardLabel} / destination ${destinationLabel} / key ${project.key} / metric ${keyMetricLabel} / audition ${auditionLabel} / next ${nextCheckLabel} / detail ${detailLabel} / Pattern ${
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
  const directId = action.id.startsWith("key-compass-card-")
    ? action.id.slice("key-compass-card-".length)
    : action.id === "key-compass-route-readout-action"
      ? action.resultTargetId ?? ""
      : "";
  const directLabel = directId ? keyCompassLaneLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title.replace(/^Review Key Compass Route:\s*/, "").replace(/^Focus Key Compass:\s*/, "").trim();
  return directLabel || titleLabel || "harmony lane unavailable";
}

export function quickActionKeyCompassRouteLabel(parts: string[], laneLabel: string): string {
  const routePart = parts.find((part) => part.startsWith("Route "));
  if (routePart) {
    return routePart.replace(/^Route\s+/, "");
  }
  return `${laneLabel} to Compose`;
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
  const isRouteReadout = action.id === "groove-compass-route-readout-action";
  if (!isRouteReadout && action.id !== "groove-compass-focus" && !action.id.startsWith("groove-compass-card-")) {
    return null;
  }

  const pattern = activePattern(project);
  const parts = quickActionGrooveCompassDetailParts(action);
  const laneLabel = quickActionGrooveCompassLaneLabel(action);
  const grooveMetricLabel = isRouteReadout
    ? parts[2] ?? parts[0] ?? `${drumHitCount(pattern)} drum hits`
    : parts[0] ?? `${drumHitCount(pattern)} drum hits`;
  const destinationLabel = parts[1] ?? "Compose";
  const auditionLabel = isRouteReadout ? parts[3] ?? "audition unavailable" : "focus audition after route";
  const nextCheckLabel = isRouteReadout ? parts[4] ?? "next check unavailable" : "return after pocket lane changes";
  const detailLabel = parts.slice(isRouteReadout ? 5 : 2).join(" / ") || "current pocket lane";
  const routeLabel = quickActionGrooveCompassRouteLabel(parts, laneLabel);
  const directCardId = isRouteReadout
    ? action.resultTargetId ?? ""
    : action.id.startsWith("groove-compass-card-")
      ? action.id.slice("groove-compass-card-".length)
      : "";
  const directCardLabel =
    isRouteReadout && directCardId
      ? `direct groove-compass-card-${directCardId} unchanged`
      : directCardId
        ? `direct groove-compass-card-${directCardId}`
        : "active groove compass command";
  const actionLabel = isRouteReadout
    ? "review groove compass route readout"
    : action.id === "groove-compass-focus"
      ? "focus active groove compass"
      : "focus direct groove compass";

  return {
    id: "groove-compass",
    label: "Groove compass",
    value: `${actionLabel} / lane ${laneLabel} / route ${routeLabel} / ${directCardLabel} / destination ${destinationLabel} / metric ${grooveMetricLabel} / audition ${auditionLabel} / next ${nextCheckLabel} / detail ${detailLabel} / Pattern ${
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
  const directId = action.id.startsWith("groove-compass-card-")
    ? action.id.slice("groove-compass-card-".length)
    : action.id === "groove-compass-route-readout-action"
      ? action.resultTargetId ?? ""
      : "";
  const directLabel = directId ? grooveCompassLaneLabelFromQuickActionId(directId) : "";
  const titleLabel = action.title.replace(/^Review Groove Compass Route:\s*/, "").replace(/^Focus Groove Compass:\s*/, "").trim();
  return directLabel || titleLabel || "pocket lane unavailable";
}

export function quickActionGrooveCompassRouteLabel(parts: string[], laneLabel: string): string {
  const routePart = parts.find((part) => part.startsWith("Route "));
  if (routePart) {
    return routePart.replace(/^Route\s+/, "");
  }
  return `${laneLabel} to Compose`;
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
): {
  item: WorkflowNavigatorItem;
  items: WorkflowNavigatorItem[];
  exportAnalysis: ExportAnalysis;
  stemAnalyses: StemExportAnalyses;
  isRouteReadout: boolean;
} | null {
  const exportAnalysis = analysis ?? analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, exportAnalysis);
  const beatMap = createBeatMapSummary(project, checks, exportAnalysis, stemAnalyses);
  const exportPreflight = createExportPreflightSummary(project, checks, exportAnalysis, stemAnalyses);
  const items = createWorkflowNavigatorItems(project, beatMap, exportPreflight, exportAnalysis);
  const isRouteReadout = action.id === "workflow-navigator-route-readout-action";
  const zone = isRouteReadout
    ? quickActionWorkflowNavigatorRouteReadoutZone(action, items)
    : workflowNavigatorZoneFromQuickAction(action.id);
  if (!zone) {
    return null;
  }

  const item = items.find((candidate) => candidate.id === zone);
  return item ? { item, items, exportAnalysis, stemAnalyses, isRouteReadout } : null;
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

  const { item, items, exportAnalysis, stemAnalyses, isRouteReadout } = context;
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const routeLabel = workflowNavigatorRouteLabel(item, items);
  const directCommandLabel = isRouteReadout
    ? `direct workflow-navigator-${item.id} unchanged`
    : `direct workflow-navigator-${item.id}`;

  return {
    id: isRouteReadout ? "workflow-navigator-route-readout" : "workflow-navigator",
    label: isRouteReadout ? "Workflow Navigator Route Readout" : "Workflow navigator",
    value: [
      `command ${isRouteReadout ? "review workflow navigator route readout" : action.title}`,
      `detail ${action.detail}`,
      `route ${routeLabel}`,
      directCommandLabel,
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
      isRouteReadout ? "readout only / workflow jump unchanged / workflow spotlight unchanged" : "jump command",
      `audition ${workflowNavigatorJumpAuditionCue(item)}`,
      `next ${workflowNavigatorJumpNextCheck(item)}`
    ].join(" / ")
  };
}

export function quickActionWorkflowNavigatorRouteReadoutZone(
  action: QuickAction,
  items: WorkflowNavigatorItem[]
): WorkflowZoneId | null {
  const targetId = action.resultTargetId;
  if (targetId === "compose" || targetId === "arrange" || targetId === "mix" || targetId === "deliver") {
    return targetId;
  }

  return createWorkflowSpotlightSummary(items).zoneId;
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

  if (context.isRouteReadout) {
    return {
      auditionCue:
        "Read the Workflow Navigator route, then inspect Compose, Arrange, Mix, or Deliver before jumping zones or running workflow actions.",
      nextCheck:
        "Use Workflow Navigator jumps only when the named route matches the beat-making question; otherwise leave playback and project data unchanged."
    };
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
  const isRouteReadout = action.id === "workflow-spotlight-route-readout-action";
  if (!isRouteReadout && action.id !== "workflow-spotlight-focus") {
    return null;
  }

  const { item, items, spotlight, exportAnalysis, stemAnalyses } = quickActionWorkflowSpotlightContext(project, analysis);
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const auditionCue = item ? workflowNavigatorJumpAuditionCue(item) : "Inspect Workflow Navigator before choosing another zone.";
  const nextCheck = item ? workflowNavigatorJumpNextCheck(item) : "Return to Workflow Navigator after zones are available.";
  const routeLabel = item ? workflowSpotlightRouteLabel(spotlight, item, items) : `${spotlight.zoneLabel} route unavailable`;

  return {
    id: isRouteReadout ? "workflow-spotlight-route-readout" : "workflow-spotlight",
    label: isRouteReadout ? "Workflow Spotlight Route Readout" : "Workflow spotlight",
    value: [
      `command ${isRouteReadout ? "review workflow spotlight route readout" : action.title}`,
      `detail ${action.detail}`,
      `route ${routeLabel}`,
      isRouteReadout ? "direct workflow-spotlight-focus unchanged" : "direct workflow-spotlight-focus",
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
      isRouteReadout ? "readout only / workflow spotlight focus unchanged / workflow navigator jump unchanged" : "focus command",
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
  const isRouteReadout = action.id === "workflow-spotlight-route-readout-action";
  if (!isRouteReadout && action.id !== "workflow-spotlight-focus") {
    return null;
  }

  const { item } = quickActionWorkflowSpotlightContext(project, analysis);
  if (!item) {
    return null;
  }

  if (isRouteReadout) {
    return {
      auditionCue:
        "Read the Workflow Spotlight route, then inspect the highlighted Compose, Arrange, Mix, or Deliver zone before focusing or jumping.",
      nextCheck:
        "Use Workflow Spotlight focus only when the named route matches the current bottleneck; otherwise leave playback and project data unchanged."
    };
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

export function beatMapRouteReadoutActionForProject(project: ProjectState, action?: QuickAction) {
  const exportAnalysis = analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const checks = createBeatReadinessChecks(project, exportAnalysis);
  const summary = createBeatMapSummary(project, checks, exportAnalysis, stemAnalyses);
  const actions = createBeatMapActions(project, checks, exportAnalysis, stemAnalyses);
  const targetId = action?.resultTargetId;
  const nextMoveAction = (targetId ? actions.find((candidate) => candidate.id === targetId) : null) ?? actions[0] ?? null;
  return { nextMoveAction, summary, exportAnalysis, stemAnalyses };
}

export function quickActionBeatMapRouteReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "beat-map-route-readout-action") {
    return null;
  }

  const { nextMoveAction, summary, exportAnalysis, stemAnalyses } = beatMapRouteReadoutActionForProject(project, action);
  if (!nextMoveAction) {
    return null;
  }

  const stage = beatMapStageForNextMoveAction(summary, nextMoveAction);
  const target = activeDeliveryTarget(project);
  const packageSummary = createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, null);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const stageReadyCount = summary.stages.filter((candidate) => candidate.tone === "good").length;
  const stageReviewCount = summary.stages.filter((candidate) => candidate.tone === "warn").length;
  const stageBlockerCount = summary.stages.filter((candidate) => candidate.tone === "danger").length;
  const followup = nextMoveResultFollowup(nextMoveAction, project);

  return {
    id: "beat-map-route-readout",
    label: "Beat Map Route Readout",
    value: [
      "command review beat map route readout",
      `detail ${action.detail}`,
      `route ${beatMapRouteLabel(nextMoveAction)}`,
      `direct beat-map-action-${nextMoveAction.id} unchanged`,
      "Beat Map action unchanged / Structure Lens unchanged / Next Move unchanged",
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
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      `stems ${audibleStemCount}/${target.stemGoal} target`,
      `package ${packageSummary.headline}`,
      "readout only",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function structureLensRouteReadoutActionForProject(project: ProjectState, action?: QuickAction) {
  const summary = createStructureLensSummary(project);
  const actions = createStructureLensActions(project);
  const targetId = action?.resultTargetId;
  const nextMoveAction = (targetId ? actions.find((candidate) => candidate.id === targetId) : null) ?? actions[0] ?? null;
  return { nextMoveAction, summary };
}

export function quickActionStructureLensRouteReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "structure-lens-route-readout-action") {
    return null;
  }

  const { nextMoveAction, summary } = structureLensRouteReadoutActionForProject(project, action);
  if (!nextMoveAction) {
    return null;
  }

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
    id: "structure-lens-route-readout",
    label: "Structure Lens Route Readout",
    value: [
      "command review structure lens route readout",
      `detail ${action.detail}`,
      `route ${structureLensRouteLabel(nextMoveAction)}`,
      `direct structure-lens-action-${nextMoveAction.id} unchanged`,
      "Structure Lens action unchanged / Beat Map unchanged / Next Move unchanged",
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
      "readout only",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function nextMoveRouteReadoutActionForProject(project: ProjectState, action?: QuickAction) {
  const analysis = analyzeExport(project);
  const checks = createBeatReadinessChecks(project, analysis);
  const actions = createNextMoveActions(project, checks, analysis);
  const targetId = action?.resultTargetId;
  const nextMoveAction = (targetId ? actions.find((candidate) => candidate.id === targetId) : null) ?? actions[0] ?? null;
  return { checks, nextMoveAction };
}

export function quickActionNextMoveRouteReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "next-move-route-readout-action") {
    return null;
  }

  const { checks, nextMoveAction } = nextMoveRouteReadoutActionForProject(project, action);
  if (!nextMoveAction) {
    return null;
  }

  const posture = nextMoveActionPostureMetricSnapshot(project, nextMoveAction);
  const analysis = analyzeExport(project);
  const stemAnalyses = analyzeStemExports(project);
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);
  const usedSlots = usedPatternSlots(project);
  const audibleStemCount = audibleStemTracks(stemAnalyses).length;
  const readyCount = checks.filter((check) => check.tone === "good").length;
  const reviewCount = checks.filter((check) => check.tone === "warn").length;
  const blockerCount = checks.filter((check) => check.tone === "danger").length;
  const followup = nextMoveResultFollowup(nextMoveAction, project);

  return {
    id: "next-move-route-readout",
    label: "Next Move Route Readout",
    value: [
      "command review next move route readout",
      `detail ${action.detail}`,
      `recommended ${nextMoveAction.buttonLabel} / ${nextMoveAction.title} / ${nextMoveAction.detail}`,
      `route ${nextMoveRouteLabel(nextMoveAction)}`,
      `direct next-move-action-${nextMoveAction.id} unchanged`,
      "Next Move action unchanged / Beat Map unchanged / Structure Lens unchanged",
      "destination Guide / Next Move",
      `posture ${posture.label} / ${posture.value}`,
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
      "readout only",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionCommandReferenceRouteReadoutMetricSnapshot(project: ProjectState, action: QuickAction): {
  id: string;
  label: string;
  value: string;
} {
  const summary = createCommandReferenceRouteReadoutSummary();
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);
  const exportAnalysis = analyzeExport(project);

  return {
    id: "command-reference-route-readout",
    label: "Command Reference Route Readout",
    value: [
      "command review command reference route readout",
      action.detail,
      `route ${summary.routeLabel}`,
      `${summary.filterCount} filters`,
      `${summary.commandCount} command-map entries`,
      `${summary.quickActionCommandCount} Quick Actions rows`,
      `${summary.readoutCommandCount} readout rows`,
      summary.searchRouteLabel,
      "direct command-reference unchanged",
      "Quick Actions unchanged",
      "Search Spotlight unchanged",
      "Command Reference filter unchanged",
      "project data unchanged",
      "playback unchanged",
      "export unchanged",
      `destination Help / Command Reference`,
      `target ${target.name}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} selected-pattern events`,
      `${projectEventTotal(project)} editable project events`,
      `${project.arrangement.length} blocks`,
      `${arrangementTotalBars(project)} bars`,
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      "readout only",
      "audition scan the command-map category before running commands",
      "next open Quick Actions only when the named command route matches the current beat-making question"
    ].join(" / ")
  };
}

export function quickActionQuickActionsRouteReadoutMetricSnapshot(project: ProjectState, action: QuickAction): {
  id: string;
  label: string;
  value: string;
} {
  const target = activeDeliveryTarget(project);
  const pattern = activePattern(project);
  const exportAnalysis = analyzeExport(project);
  const scopeRoute = quickActionScopeDefinitions.map((definition) => definition.label).join(" / ");

  return {
    id: "quick-actions-route-readout",
    label: "Quick Actions Route Readout",
    value: [
      "command review quick actions route readout",
      action.detail,
      `route ${scopeRoute}`,
      `${quickActionScopeDefinitions.length} scopes`,
      "direct quick-actions-open unchanged",
      "Command Reference unchanged",
      "Search Spotlight unchanged",
      "Quick Actions command execution unchanged",
      "project data unchanged",
      "playback unchanged",
      "export unchanged",
      "destination Command palette / Quick Actions",
      `target ${target.name}`,
      `Pattern ${project.selectedPattern}`,
      `${patternEventTotal(pattern)} selected-pattern events`,
      `${projectEventTotal(project)} editable project events`,
      `${project.arrangement.length} blocks`,
      `${arrangementTotalBars(project)} bars`,
      `export ${exportAnalysis.status} / H ${formatDb(exportAnalysis.headroomDb)}`,
      "readout only",
      "audition scan the command-palette scope before running commands",
      "next run a Quick Action only when the named route matches the current beat-making question"
    ].join(" / ")
  };
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

  if (action.id === "command-reference-route-readout-action") {
    return quickActionCommandReferenceRouteReadoutMetricSnapshot(project, action);
  }

  if (action.id === "quick-actions-route-readout-action") {
    return quickActionQuickActionsRouteReadoutMetricSnapshot(project, action);
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

  if (action.id === "beat-map-route-readout-action") {
    return (
      quickActionBeatMapRouteReadoutMetricSnapshot(project, action) ?? {
        id: "beat-map-route-readout",
        label: "Beat Map Route Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "structure-lens-route-readout-action") {
    return (
      quickActionStructureLensRouteReadoutMetricSnapshot(project, action) ?? {
        id: "structure-lens-route-readout",
        label: "Structure Lens Route Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "next-move-route-readout-action") {
    return (
      quickActionNextMoveRouteReadoutMetricSnapshot(project, action) ?? {
        id: "next-move-route-readout",
        label: "Next Move Route Readout",
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

  if (action.id.startsWith("audience-delivery-proof-bridge-")) {
    return (
      quickActionAudienceDeliveryProofBridgeMetricSnapshot(project, action) ?? {
        id: "audience-delivery-proof-bridge",
        label: "Audience Delivery Proof Bridge",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("audience-session-acceptance-")) {
    return (
      quickActionAudienceSessionAcceptanceMetricSnapshot(project, action) ?? {
        id: "audience-session-acceptance",
        label: "Audience Session Acceptance",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("audience-session-proof-handoff-")) {
    return (
      quickActionAudienceSessionProofHandoffMetricSnapshot(project, action) ?? {
        id: "audience-session-proof-handoff",
        label: "Audience Session Proof Handoff",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("audience-route-bridge-")) {
    return (
      quickActionAudienceRouteBridgeMetricSnapshot(project, action) ?? {
        id: "audience-route-bridge",
        label: "Audience Route Bridge",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("audience-completion-route-")) {
    return (
      quickActionAudienceCompletionRouteMetricSnapshot(project, action) ?? {
        id: "audience-completion-route",
        label: "Audience Completion Route",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("dual-audience-readiness-")) {
    return (
      quickActionDualAudienceReadinessMetricSnapshot(project, action) ?? {
        id: "dual-audience-readiness-route",
        label: "Dual Audience Readiness",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("audience-session-enter-")) {
    return (
      quickActionAudienceSessionMetricSnapshot(project, action) ?? {
        id: "audience-session-route",
        label: "Audience session route",
        value: `${modeLabel(project.mode)} mode`
      }
    );
  }

  if (action.id.startsWith("audience-starter-")) {
    const starterId: AudienceStarterProjectId = action.id.endsWith("producer") ? "producer" : "beginner";
    const target = activeDeliveryTarget(project);
    const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
    return {
      id: "audience-starter",
      label: "Audience Starter",
      value: [
        phase === "before" ? "current project" : "starter project",
        audienceStarterProjectLabel(starterId),
        audienceStarterProjectDetail(starterId),
        `${project.mode === "studio" ? "Studio" : "Guided"} mode`,
        `${styleName} / ${project.key} / ${project.bpm} BPM`,
        barCountLabel(arrangementTotalBars(project)),
        `${projectEventTotal(project)} editable events`,
        `delivery ${target.name}`
      ].join(" / ")
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

  if (action.id === "session-pass-route-readout-action" || action.id === "session-pass-focus") {
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

  if (action.id === "reference-alignment-route-readout-action") {
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

  if (action.id === "composer-guide-route-readout-action" || action.id === "composer-guide-focus") {
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

  if (action.id === "composer-actions-readout-action") {
    return (
      quickActionComposerActionsReadoutMetricSnapshot(project, action, selectedArrangementIndex, analysis ?? undefined) ?? {
        id: "composer-actions-readout",
        label: "Composer Actions Readout",
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

  if (action.id === "key-compass-route-readout-action" || action.id === "key-compass-focus") {
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

  if (action.id === "pattern-switch-readout-action") {
    return (
      quickActionPatternSwitchReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-switch-readout",
        label: "Pattern Switch Readout",
        value: action.detail
      }
    );
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

  if (action.id === "pattern-cue-readout-action") {
    return (
      quickActionPatternCueReadoutMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-cue-readout",
        label: "Pattern Cue Readout",
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

  if (action.id === "pattern-contrast-readout-action") {
    return (
      quickActionPatternContrastReadoutMetricSnapshot(project, action) ?? {
        id: "pattern-contrast-readout",
        label: "Pattern Contrast",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-contrast-role-map-readout-action") {
    return (
      quickActionPatternContrastRoleMapMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-contrast-role-map",
        label: "Pattern Role Map",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-contrast-section-fit-readout-action") {
    return (
      quickActionPatternContrastSectionFitMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-contrast-section-fit",
        label: "Pattern Section Fit",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-contrast-section-fit-decision") {
    return (
      quickActionPatternContrastSectionFitDecisionMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-contrast-section-fit-decision",
        label: "Section Fit Decision",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-contrast-section-fit-priority-cue") {
    return (
      quickActionPatternContrastSectionFitPriorityCueMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-contrast-section-fit-priority-cue",
        label: "Section Fit Priority Cue",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-contrast-section-fit-cue-selected-block") {
    return (
      quickActionPatternContrastSectionFitCueMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-contrast-section-fit-cue",
        label: "Section Fit Cue",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-contrast-section-fit-use-selected-block") {
    return (
      quickActionPatternContrastSectionFitUseMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-contrast-section-fit-use",
        label: "Section Fit Use",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("pattern-contrast-cue-")) {
    return (
      quickActionPatternContrastCueMetricSnapshot(project, action) ?? {
        id: "pattern-contrast-cue",
        label: "Pattern Contrast Cue",
        value: action.detail
      }
    );
  }

  if (action.id.startsWith("pattern-contrast-use-")) {
    return (
      quickActionPatternContrastUseMetricSnapshot(project, action, selectedArrangementIndex) ?? {
        id: "pattern-contrast-use",
        label: "Pattern Contrast Use",
        value: action.detail
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

  if (action.id === "pattern-copy-clear-readout-action") {
    return (
      quickActionPatternCopyClearReadoutMetricSnapshot(project, action) ?? {
        id: "pattern-copy-clear-readout",
        label: "Pattern Copy/Clear Readout",
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

  if (action.id === "groove-compass-route-readout-action" || action.id === "groove-compass-focus") {
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

  if (action.id === "layer-starter-readout-action") {
    return (
      quickActionLayerStarterReadoutMetricSnapshot(project, action) ?? {
        id: "layer-starter-readout",
        label: "Layer Starter Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "layer-starter-route-readout-action") {
    return (
      quickActionLayerStarterRouteReadoutMetricSnapshot(project, action) ?? {
        id: "layer-starter-route-readout",
        label: "Layer Starter Route Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-stack-readout-action") {
    return (
      quickActionPatternStackReadoutMetricSnapshot(project, action) ?? {
        id: "pattern-stack-readout",
        label: "Pattern Stack Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-stack-route-readout-action") {
    return (
      quickActionPatternStackRouteReadoutMetricSnapshot(project, action) ?? {
        id: "pattern-stack-route-readout",
        label: "Pattern Stack Route Readout",
        value: action.detail
      }
    );
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

  if (action.id === "drum-move-route-readout-action") {
    return (
      quickActionDrumMoveRouteReadoutMetricSnapshot(project, action) ?? {
        id: "drum-move-route-readout",
        label: "Drum Move Route Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "drum-move") {
    const pattern = activePattern(project);
    return {
      id: "drum-move",
      label: "Drum move",
      value: `${drumPatternHitLabel(pattern)} / ${drumAverageTimingLabel(pattern)} / ${drumAverageVelocityLabel(pattern)}`
    };
  }

  if (action.id === "808-move-route-readout-action") {
    return (
      quickActionBassMoveRouteReadoutMetricSnapshot(project, action) ?? {
        id: "808-move-route-readout",
        label: "808 Move Route Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "808-move") {
    const bassNotes = activePattern(project).bassNotes;
    return {
      id: "808-move",
      label: "808 move",
      value: `${bassNotes.length} notes / ${bassGlideLabel(bassNotes)} / ${bassPitchSpanLabel(bassNotes)}`
    };
  }

  if (action.id === "melody-move-route-readout-action") {
    return (
      quickActionMelodyMoveRouteReadoutMetricSnapshot(project, action) ?? {
        id: "melody-move-route-readout",
        label: "Melody Move Route Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "melody-move") {
    const melodyNotes = activePattern(project).melodyNotes;
    return {
      id: "melody-move",
      label: "Melody move",
      value: `${melodyNotes.length} notes / ${melodyRangeLabel(melodyNotes)} / ${melodyVelocityLabel(melodyNotes)}`
    };
  }

  if (action.id === "chord-move-route-readout-action") {
    return (
      quickActionChordMoveRouteReadoutMetricSnapshot(project, action) ?? {
        id: "chord-move-route-readout",
        label: "Chord Move Route Readout",
        value: action.detail
      }
    );
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

  if (
    action.id === "beat-readiness-route-readout-action" ||
    action.id === "beat-readiness-focus" ||
    action.id.startsWith("beat-readiness-check-")
  ) {
    const readinessMetric = quickActionBeatReadinessMetricSnapshot(project, action);
    if (readinessMetric) {
      return readinessMetric;
    }
  }

  if (
    action.id === "listening-pass-route-readout-action" ||
    action.id === "listening-pass-focus" ||
    action.id.startsWith("listening-pass-checkpoint-")
  ) {
    const listeningMetric = quickActionListeningPassMetricSnapshot(project, action);
    if (listeningMetric) {
      return listeningMetric;
    }
  }

  if (
    action.id === "beat-passport-route-readout-action" ||
    action.id === "beat-passport-focus" ||
    action.id.startsWith("beat-passport-metric-")
  ) {
    const passportMetric = quickActionBeatPassportMetricSnapshot(project, action);
    if (passportMetric) {
      return passportMetric;
    }
  }

  if (
    action.id === "production-snapshot-route-readout-action" ||
    action.id === "production-snapshot-focus" ||
    action.id.startsWith("production-snapshot-metric-")
  ) {
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

  if (action.id === "hook-readiness-route-readout-action" || action.id === "hook-readiness-focus") {
    const hookReadinessMetric = quickActionHookReadinessMetricSnapshot(project, action, analysis ?? undefined);
    if (hookReadinessMetric) {
      return hookReadinessMetric;
    }

    return {
      id: "hook-readiness",
      label: "Hook readiness",
      value: action.detail
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
    const hookReadinessMetric = quickActionHookReadinessMetricSnapshot(project, action, analysis ?? undefined);
    if (hookReadinessMetric) {
      return hookReadinessMetric;
    }

    return {
      id: "hook-readiness",
      label: "Hook readiness",
      value: action.detail
    };
  }

  if (action.id === "topline-space-route-readout-action" || action.id === "topline-space-focus") {
    const toplineSpaceMetric = quickActionToplineSpaceMetricSnapshot(project, action, analysis ?? undefined);
    if (toplineSpaceMetric) {
      return toplineSpaceMetric;
    }

    return {
      id: "topline-space",
      label: "Topline space",
      value: action.detail
    };
  }

  if (action.id.startsWith("topline-space-card-")) {
    const toplineSpaceMetric = quickActionToplineSpaceMetricSnapshot(project, action, analysis ?? undefined);
    if (toplineSpaceMetric) {
      return toplineSpaceMetric;
    }

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

  if (action.id === "handoff-pack" || action.id === "handoff-route-readout-action") {
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
      id: action.id === "handoff-route-readout-action" ? "handoff-route-readout" : "handoff-pack",
      label: action.id === "handoff-route-readout-action" ? "Handoff Route Readout" : "Handoff Pack",
      value: action.detail
    };
  }

  if (action.id === "handoff-delivery-target-readout-action") {
    return (
      quickActionHandoffDeliveryTargetReadoutMetricSnapshot(project, action, handoffExportReceipt, analysis ?? undefined) ?? {
        id: "handoff-delivery-target-readout",
        label: "Handoff Delivery Target Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "handoff-session-brief-readout-action") {
    return (
      quickActionHandoffSessionBriefReadoutMetricSnapshot(project, action, handoffExportReceipt, analysis ?? undefined) ?? {
        id: "handoff-session-brief-readout",
        label: "Handoff Session Brief Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "handoff-final-check-readout-action") {
    return (
      quickActionHandoffFinalCheckReadoutMetricSnapshot(project, action, handoffExportReceipt, analysis ?? undefined) ?? {
        id: "handoff-final-check-readout",
        label: "Handoff Final Check Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "handoff-send-readiness-readout-action") {
    return (
      quickActionHandoffSendReadinessReadoutMetricSnapshot(project, action, handoffExportReceipt, analysis ?? undefined) ?? {
        id: "handoff-send-readiness-readout",
        label: "Handoff Send Readiness Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "handoff-blocker-readout-action") {
    return (
      quickActionHandoffBlockerReadoutMetricSnapshot(project, action, handoffExportReceipt, analysis ?? undefined) ?? {
        id: "handoff-blocker-readout",
        label: "Handoff Blocker Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "handoff-blocker-route-readout-action") {
    return (
      quickActionHandoffBlockerRouteReadoutMetricSnapshot(project, action, handoffExportReceipt, analysis ?? undefined) ?? {
        id: "handoff-blocker-route-readout",
        label: "Handoff Blocker Route Readout",
        value: action.detail
      }
    );
  }

  if (
    action.id === "handoff-package-check-focus" ||
    action.id === "handoff-package-check-readout-action" ||
    action.id.startsWith("handoff-package-check-card-")
  ) {
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
      id: action.id === "handoff-package-check-readout-action" ? "handoff-package-check-readout" : "handoff-package-check",
      label: action.id === "handoff-package-check-readout-action" ? "Handoff Package Check Readout" : "Handoff package",
      value: action.detail
    };
  }

  if (action.id === "handoff-export-receipt-focus" || action.id === "handoff-export-receipt-readout-action") {
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
      id: action.id === "handoff-export-receipt-readout-action" ? "handoff-export-receipt-readout" : "handoff-export-receipt",
      label: action.id === "handoff-export-receipt-readout-action" ? "Handoff Export Receipt Readout" : "Handoff receipt",
      value: action.detail
    };
  }

  if (action.id === "handoff-send-order-focus" || action.id === "handoff-send-order-readout-action") {
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
      id: action.id === "handoff-send-order-readout-action" ? "handoff-send-order-readout" : "handoff-send-order",
      label: action.id === "handoff-send-order-readout-action" ? "Handoff Send Order Readout" : "Handoff send order",
      value: action.detail
    };
  }

  if (action.id === "handoff-manifest-audit-focus" || action.id === "handoff-manifest-audit-readout-action") {
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
      id: action.id === "handoff-manifest-audit-readout-action" ? "handoff-manifest-audit-readout" : "handoff-manifest-audit",
      label: action.id === "handoff-manifest-audit-readout-action" ? "Handoff Manifest Audit Readout" : "Handoff manifest",
      value: action.detail
    };
  }

  if (action.id === "handoff-export-format-readout-action") {
    return (
      quickActionHandoffExportFormatReadoutMetricSnapshot(project, action, handoffExportReceipt, analysis ?? undefined) ?? {
        id: "handoff-export-format-readout",
        label: "Handoff Export Format Readout",
        value: action.detail
      }
    );
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

  if (
    action.id === "finish-checklist-route-readout-action" ||
    action.id === "finish-checklist-focus" ||
    action.id.startsWith("finish-checklist-card-")
  ) {
    const finishChecklistMetric = quickActionFinishChecklistMetricSnapshot(project, action);
    if (finishChecklistMetric) {
      return finishChecklistMetric;
    }
  }

  if (
    action.id === "review-queue-route-readout-action" ||
    action.id === "review-queue-focus" ||
    action.id.startsWith("review-queue-item-")
  ) {
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

  if (
    action.id === "export-preflight-route-readout-action" ||
    action.id === "export-preflight-focus" ||
    action.id.startsWith("export-preflight-card-")
  ) {
    const exportPreflightMetric = quickActionExportPreflightMetricSnapshot(project, action, analysis ?? undefined);
    if (exportPreflightMetric) {
      return exportPreflightMetric;
    }
  }

  if (action.id === "direct-exports-readout-action") {
    return (
      quickActionDirectExportsReadoutMetricSnapshot(project, action, handoffExportReceipt, analysis ?? undefined) ?? {
        id: "direct-exports-readout",
        label: "Direct Exports Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "handoff-next-export-readout-action") {
    return (
      quickActionHandoffNextExportReadoutMetricSnapshot(project, action, handoffExportReceipt, analysis ?? undefined) ?? {
        id: "handoff-next-export-readout",
        label: "Handoff Next Export Readout",
        value: action.detail
      }
    );
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

  if (action.id === "workflow-spotlight-route-readout-action" || action.id === "workflow-spotlight-focus") {
    const workflowSpotlightMetric = quickActionWorkflowSpotlightMetricSnapshot(project, action, analysis ?? undefined);
    if (workflowSpotlightMetric) {
      return workflowSpotlightMetric;
    }

    return {
      id: action.id === "workflow-spotlight-route-readout-action" ? "workflow-spotlight-route-readout" : "workflow-spotlight",
      label: action.id === "workflow-spotlight-route-readout-action" ? "Workflow Spotlight Route Readout" : "Workflow spotlight",
      value: `${project.selectedPattern} / ${barCountLabel(arrangementTotalBars(project))}`
    };
  }

  if (action.id === "workflow-navigator-route-readout-action") {
    const workflowNavigatorMetric = quickActionWorkflowNavigatorMetricSnapshot(project, action, analysis ?? undefined);
    if (workflowNavigatorMetric) {
      return workflowNavigatorMetric;
    }

    return {
      id: "workflow-navigator-route-readout",
      label: "Workflow Navigator Route Readout",
      value: action.detail
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

  if (action.id === "pattern-clone-readout-action") {
    return (
      quickActionPatternCloneReadoutMetricSnapshot(project, action) ?? {
        id: "pattern-clone-readout",
        label: "Pattern Clone Readout",
        value: action.detail
      }
    );
  }

  if (action.id === "pattern-variation-readout-action") {
    return (
      quickActionPatternVariationReadoutMetricSnapshot(project, action) ?? {
        id: "pattern-variation-readout",
        label: "Pattern Variation Readout",
        value: action.detail
      }
    );
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

  if (action.id === "pattern-fill-readout-action") {
    return (
      quickActionPatternFillReadoutMetricSnapshot(project, action) ?? {
        id: "pattern-fill-readout",
        label: "Pattern Fill Readout",
        value: action.detail
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
    action.id === "sound-preset-route-readout-action" ||
    action.id === "sound-preset-decision" ||
    action.id === "sound-preset" ||
    action.id.startsWith("sound-preset-pad-")
  ) {
    return quickActionSoundPresetMetricSnapshot(project, action, analysis);
  }

  if (
    action.id === "drum-kit-readout-action" ||
    action.id === "drum-kit-route-readout-action" ||
    action.id === "drum-kit-decision" ||
    action.id === "drum-kit" ||
    action.id.startsWith("drum-kit-pad-")
  ) {
    return quickActionDrumKitMetricSnapshot(project, action, analysis);
  }

  if (
    action.id === "sound-focus-readout-action" ||
    action.id === "sound-focus-route-readout-action" ||
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

  if (action.id === "sound-preset-route-readout-action") {
    const target = quickActionSoundPresetTarget(project, action) ?? defaultSoundPresetPreview(project);
    const targetSound = soundPresetDesign(target);
    const summary = createSoundPresetPreviewSummary(project.sound, target);
    return {
      id: "sound-preset-route-readout",
      label: "Sound Preset Route Readout",
      value: quickActionSoundMetricValue(project, action, analysis, [
        quickActionSoundActionLabel(action),
        `route ${soundPresetRouteLabel(project.sound, targetSound)}`,
        "direct command sound-preset",
        `target ${summary.presetLabel}`,
        `status ${summary.statusLabel}`,
        `preview ${summary.toneLabel}`,
        `moves ${summary.changeLabel}`,
        "sound preset unchanged"
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

  if (action.id === "drum-kit-route-readout-action") {
    return {
      id: "drum-kit-route-readout",
      label: "Drum Kit Route Readout",
      value: quickActionSoundMetricValue(project, action, analysis, [
        quickActionSoundActionLabel(action),
        `route ${drumKitRouteLabel(pad)}`,
        "direct command drum-kit",
        `target ${pad.label} kit`,
        `status ${pad.changedCount === 0 ? "Kit aligned" : "Suggested kit"}`,
        `drums ${drumKitPreviewDrumLabel(pad)}`,
        `rack ${drumKitPreviewRackLabel(pad)}`,
        `moves ${pad.changedCount} kit move${pad.changedCount === 1 ? "" : "s"}`,
        "drum kit unchanged"
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
  const routeLabel = soundFocusRouteLabel(changedParameters);
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

  if (action.id === "sound-focus-route-readout-action") {
    return {
      id: "sound-focus-route-readout",
      label: "Sound Focus Route Readout",
      value: quickActionSoundMetricValue(project, action, analysis, [
        quickActionSoundActionLabel(action),
        `route ${routeLabel}`,
        `direct command sound-focus`,
        `target ${pad.label} focus`,
        `status ${pad.changedCount === 0 ? "Sound aligned" : "Suggested focus"}`,
        `focus ${pad.detail} tone posture`,
        `parameters ${soundFocusPreviewParameterLabel(pad)}`,
        `moves ${pad.changedCount} tone move${pad.changedCount === 1 ? "" : "s"} / ${changedLabel}`,
        "sound focus unchanged"
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

  if (action.id === "sound-preset-route-readout-action") {
    return "read the Drums, 808, Duck, Synth, and Chords route before choosing the existing Sound Preset command";
  }

  if (action.id === "sound-preset-decision" || action.id === "sound-preset" || action.id.startsWith("sound-preset-pad-")) {
    return "loop drums, 808, Synth, and Chords together before trimming with Sound Focus or Studio controls";
  }

  if (action.id === "drum-kit-readout-action") {
    return "loop kick, clap, hat, and 808 before applying a built-in kit or trimming drum rack controls manually";
  }

  if (action.id === "drum-kit-route-readout-action") {
    return "read the built-in kick, clap, and hat kit route before choosing the existing Drum Kit command";
  }

  if (action.id === "drum-kit-decision" || action.id === "drum-kit" || action.id.startsWith("drum-kit-pad-")) {
    return "loop kick, clap, hat, and 808 balance before changing another kit or drum rack control";
  }

  if (action.id === "sound-focus-readout-action") {
    return "loop the focused 808, Synth, or Chords tone against the full Pattern before applying a focus pad manually";
  }

  if (action.id === "sound-focus-route-readout-action") {
    return "read the 808, Synth, or Chords route before choosing the existing Sound Focus command";
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
  if (action.id === "sound-preset-route-readout-action") {
    return "review sound preset route readout";
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
  if (action.id === "drum-kit-route-readout-action") {
    return "review drum kit route readout";
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
  if (action.id === "sound-focus-route-readout-action") {
    return "review sound focus route readout";
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

  if (
    action.id !== "sound-preset-readout-action" &&
    action.id !== "sound-preset-route-readout-action" &&
    action.id !== "sound-preset-decision" &&
    action.id !== "sound-preset"
  ) {
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

  if (
    action.id !== "drum-kit-readout-action" &&
    action.id !== "drum-kit-route-readout-action" &&
    action.id !== "drum-kit-decision" &&
    action.id !== "drum-kit"
  ) {
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

  if (
    action.id !== "sound-focus-readout-action" &&
    action.id !== "sound-focus-route-readout-action" &&
    action.id !== "sound-focus-decision" &&
    action.id !== "sound-focus"
  ) {
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

  if (action.id === "space-fx-route-readout-action") {
    const options = createSpaceFxPadOptions(project.mixer);
    const preview = createSpaceFxPreviewSummary(project.mixer, options);
    const pad = options.find((candidate) => candidate.id === preview.padId) ?? options[0];
    if (!pad) {
      return null;
    }
    const transformed = applySpaceFxPadToMixer(project.mixer, pad);
    const changedSends = spaceFxChangedSendCount(project.mixer, transformed);
    return {
      id: "space-fx-route-readout",
      label: "Space FX Route Readout",
      value: quickActionSpaceFxMetricValue(project, action, analysis, [
        quickActionSpaceFxActionLabel(action),
        `route ${spaceFxRouteLabel(project.mixer, transformed)}`,
        "direct command space-fx",
        `target ${preview.padLabel}`,
        `status ${preview.statusLabel}`,
        `target sends ${preview.sendLabel}`,
        `current sends ${quickActionSpaceFxSendPosture(project.mixer)}`,
        `moves ${changedSends} send${changedSends === 1 ? "" : "s"}`,
        "space fx unchanged"
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

  if (action.id === "space-fx-route-readout-action") {
    return "read the Drums, 808, Synth, and Chords send route before choosing the existing Space FX command";
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
  if (action.id === "space-fx-route-readout-action") {
    return "review space fx route readout";
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
    action.id.startsWith("space-fx-") &&
    action.id !== "space-fx-readout-action" &&
    action.id !== "space-fx-route-readout-action" &&
    action.id !== "space-fx-decision"
      ? action.id.slice("space-fx-".length)
      : null;
  if (directId) {
    return options.find((pad) => pad.id === directId) ?? null;
  }

  if (
    action.id !== "space-fx-readout-action" &&
    action.id !== "space-fx-route-readout-action" &&
    action.id !== "space-fx-decision" &&
    action.id !== "space-fx"
  ) {
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

  if (action.id === "mix-balance-route-readout-action") {
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
      id: "mix-balance-route-readout",
      label: "Mix Balance Route Readout",
      value: quickActionMixBalanceMetricValue(project, action, analysis, stemAnalyses, [
        quickActionMixBalanceActionLabel(action),
        `route ${mixBalanceRouteLabel(project.mixer, transformed)}`,
        "direct command mix-balance",
        `target ${preview.padLabel}`,
        `status ${preview.statusLabel}`,
        `target channels ${preview.channelLabel}`,
        `current channels ${quickActionMixBalanceChannelPosture(project.mixer)}`,
        `moves ${preview.changedChannels} channels / ${changedControls} controls`,
        "mix balance unchanged"
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

  if (action.id === "mix-balance-route-readout-action") {
    return "read the Drums, 808, Synth, and Chords rough-balance route before choosing the existing Mix Balance command";
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
  if (action.id === "mix-balance-route-readout-action") {
    return "review mix balance route readout";
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

  if (
    action.id !== "mix-balance-readout-action" &&
    action.id !== "mix-balance-route-readout-action" &&
    action.id !== "mix-balance-decision" &&
    action.id !== "mix-balance"
  ) {
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

  if (action.id === "stem-audition-route-readout-action") {
    const options = createStemAuditionPadOptions(project.mixer);
    const readout = createStemAuditionReadoutSummary(project.mixer);
    const decision = createStemAuditionDecisionSummary(options, readout);
    const pad = decision.targetId ? options.find((candidate) => candidate.id === decision.targetId) ?? null : null;
    if (!pad) {
      return null;
    }
    const transformed = applyStemAuditionPadToMixer(project.mixer, pad);
    const targetReadout = createStemAuditionReadoutSummary(transformed);
    const stemAnalyses = analyzeStemExports(project);
    return {
      id: "stem-audition-route-readout",
      label: "Stem Audition Route Readout",
      value: quickActionStemAuditionMetricValue(project, action, analysis, stemAnalyses, [
        quickActionStemAuditionActionLabel(action),
        `route ${stemAuditionRouteLabel(pad)}`,
        `direct command stem-audition-${pad.id}`,
        `current ${readout.roleLabel} / ${readout.detailLabel}`,
        `decision ${decision.targetLabel} / ${decision.detailLabel}`,
        `target audition ${targetReadout.roleLabel} / ${targetReadout.detailLabel}`,
        `mixer ${quickActionStemAuditionMixerPosture(project.mixer)}`,
        `moves ${pad.changedCount} mixer change${pad.changedCount === 1 ? "" : "s"}`,
        "stem audition unchanged"
      ], quickActionStemAuditionNextCheck(action, decision, pad))
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
  if (action.id === "stem-audition-route-readout-action") {
    return "read the Full Mix, Drums, 808, Synth, or Chords audition route before choosing the existing Stem Audition command";
  }

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
  if (action.id === "stem-audition-route-readout-action") {
    return "review stem audition route readout";
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
  if (action.id === "stem-audition-readout-action" || action.id === "stem-audition-route-readout-action") {
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

export function quickActionLayerStarterReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "layer-starter-readout-action") {
    return null;
  }

  const options = createLayerStarterOptions(project);
  const option =
    layerStarterReadoutQuickActionOption(action, options) ?? activeLayerStarterQuickActionOption(options) ?? options[0] ?? null;
  const pattern = activePattern(project);
  const drumHits = drumHitCount(pattern);
  const bassNotes = pattern.bassNotes.length;
  const chordEvents = pattern.chordEvents.length;
  const melodyNotes = pattern.melodyNotes.length;
  const musicEvents = bassNotes + chordEvents + melodyNotes;
  const readyLayerCount = [drumHits > 0, bassNotes > 0, chordEvents > 0, melodyNotes > 0].filter(Boolean).length;
  const readiness = options.map((item) => `${item.label} ${item.status}`).join(" / ");
  const arrangementUse = patternArrangementUseLabel(project, project.selectedPattern);

  return {
    id: "layer-starter-readout",
    label: "Layer Starter Readout",
    value: [
      "review layer starter",
      `selected Pattern ${project.selectedPattern}`,
      option ? `priority ${option.label}` : "priority unavailable",
      option?.status ?? "layers unavailable",
      option?.detail ?? "no starter detail",
      `readiness ${readiness}`,
      `${patternEventTotal(pattern)} events`,
      `${drumHits} drums`,
      `${bassNotes} 808`,
      `${chordEvents} chords`,
      `${melodyNotes} synth`,
      `${musicEvents} music`,
      `${readyLayerCount}/4 layers`,
      `arrangement ${arrangementUse}`,
      "starter unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
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

export function quickActionLayerStarterRouteReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "layer-starter-route-readout-action") {
    return null;
  }

  const options = createLayerStarterOptions(project);
  const option = activeLayerStarterQuickActionOption(options) ?? options[0] ?? null;
  const pattern = activePattern(project);
  const drumHits = drumHitCount(pattern);
  const bassNotes = pattern.bassNotes.length;
  const chordEvents = pattern.chordEvents.length;
  const melodyNotes = pattern.melodyNotes.length;
  const musicEvents = bassNotes + chordEvents + melodyNotes;
  const readyLayerCount = [drumHits > 0, bassNotes > 0, chordEvents > 0, melodyNotes > 0].filter(Boolean).length;
  const readiness = options.map((item) => `${item.label} ${item.status}`).join(" / ");
  const arrangementUse = patternArrangementUseLabel(project, project.selectedPattern);
  const routeLabel = option ? layerStarterRouteLabel(option) : "No starter route";
  const directCommand = option ? `layer-starter-${option.id}` : "none";
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "layer-starter-route-readout",
    label: "Layer Starter Route Readout",
    value: [
      "review layer starter route",
      `selected Pattern ${project.selectedPattern}`,
      option ? `priority ${option.label}` : "priority unavailable",
      option?.status ?? "layers unavailable",
      `route ${routeLabel}`,
      `direct command ${directCommand}`,
      option?.detail ?? "no starter detail",
      `readiness ${readiness}`,
      `${patternEventTotal(pattern)} events`,
      `${drumHits} drums`,
      `${bassNotes} 808`,
      `${chordEvents} chords`,
      `${melodyNotes} synth`,
      `${musicEvents} music`,
      `${readyLayerCount}/4 layers`,
      `arrangement ${arrangementUse}`,
      "starter route unchanged",
      "starter unchanged",
      "playback unchanged",
      "export unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function layerStarterReadoutQuickActionOption(
  action: QuickAction,
  options: LayerStarterOption[]
): LayerStarterOption | null {
  if (action.id !== "layer-starter-readout-action") {
    return null;
  }

  const text = `${action.title} ${action.detail} ${action.keywords}`;
  return options.find((option) => text.includes(` ${option.label} `) || text.includes(option.id)) ?? null;
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

export function quickActionPatternStackReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-stack-readout-action") {
    return null;
  }

  const pattern = activePattern(project);
  const options = createPatternStackOptions(project.key);
  const preview = createPatternStackPreviewSummary(project.key, pattern, options);
  const stack =
    patternStackReadoutQuickActionOption(action, options) ??
    options.find((option) => option.id === preview.stackId) ??
    options[0] ??
    null;
  const drumHits = drumHitCount(pattern);
  const bassNotes = pattern.bassNotes.length;
  const chordEvents = pattern.chordEvents.length;
  const melodyNotes = pattern.melodyNotes.length;
  const musicEvents = bassNotes + chordEvents + melodyNotes;
  const readyLayerCount = [drumHits > 0, bassNotes > 0, chordEvents > 0, melodyNotes > 0].filter(Boolean).length;
  const arrangementUse = patternArrangementUseLabel(project, project.selectedPattern);

  return {
    id: "pattern-stack-readout",
    label: "Pattern Stack Readout",
    value: [
      "review pattern stack",
      `selected Pattern ${project.selectedPattern}`,
      preview.statusLabel,
      `preview ${preview.stackLabel}`,
      preview.moveLabel,
      stack ? `stack ${stack.label}` : "stack unavailable",
      `${patternEventTotal(pattern)} events`,
      `${drumHits} drums`,
      `${bassNotes} 808`,
      `${chordEvents} chords`,
      `${melodyNotes} synth`,
      `${musicEvents} music`,
      `${readyLayerCount}/4 layers`,
      `arrangement ${arrangementUse}`,
      "stack unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function patternStackRouteLabel(stack: PatternStackOption): string {
  return `${stack.label} Pattern Stack Pad`;
}

export function quickActionPatternStackRouteReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-stack-route-readout-action") {
    return null;
  }

  const pattern = activePattern(project);
  const options = createPatternStackOptions(project.key);
  const preview = createPatternStackPreviewSummary(project.key, pattern, options);
  const stack =
    preview.stackId === "none" || preview.statusLabel === "Stack aligned"
      ? null
      : (options.find((option) => option.id === preview.stackId) ?? patternStackReadoutQuickActionOption(action, options));
  const drumHits = drumHitCount(pattern);
  const bassNotes = pattern.bassNotes.length;
  const chordEvents = pattern.chordEvents.length;
  const melodyNotes = pattern.melodyNotes.length;
  const musicEvents = bassNotes + chordEvents + melodyNotes;
  const readyLayerCount = [drumHits > 0, bassNotes > 0, chordEvents > 0, melodyNotes > 0].filter(Boolean).length;
  const arrangementUse = patternArrangementUseLabel(project, project.selectedPattern);
  const routeLabel = stack ? patternStackRouteLabel(stack) : "No stack route";
  const directCommand = stack ? `pattern-stack-pad-${stack.id}` : "none";
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "pattern-stack-route-readout",
    label: "Pattern Stack Route Readout",
    value: [
      "review pattern stack route",
      `selected Pattern ${project.selectedPattern}`,
      preview.statusLabel,
      `preview ${preview.stackLabel}`,
      preview.moveLabel,
      stack ? `stack ${stack.label}` : "stack unavailable",
      `route ${routeLabel}`,
      "preview command pattern-stack",
      `direct command ${directCommand}`,
      `${patternEventTotal(pattern)} events`,
      `${drumHits} drums`,
      `${bassNotes} 808`,
      `${chordEvents} chords`,
      `${melodyNotes} synth`,
      `${musicEvents} music`,
      `${readyLayerCount}/4 layers`,
      `arrangement ${arrangementUse}`,
      "stack route unchanged",
      "stack unchanged",
      "playback unchanged",
      "export unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function patternStackReadoutQuickActionOption(
  action: QuickAction,
  options: PatternStackOption[]
): PatternStackOption | null {
  if (action.id !== "pattern-stack-readout-action" && action.id !== "pattern-stack-route-readout-action") {
    return null;
  }

  const text = `${action.title} ${action.detail} ${action.keywords}`;
  return (
    options.find((option) => text.includes(`${option.label}:`) || text.includes(` ${option.id} `)) ??
    options.find((option) => text.includes(option.label)) ??
    null
  );
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

export function quickActionChordMoveRouteReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "chord-move-route-readout-action") {
    return null;
  }

  const pattern = activePattern(project);
  const chords = pattern.chordEvents;
  const arrangementUse = patternArrangementUseLabel(project, project.selectedPattern);
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "chord-move-route-readout",
    label: "Chord Move Route Readout",
    value: [
      "review chord move route",
      `selected Pattern ${project.selectedPattern}`,
      action.title.replace(/^Review Chord Move Route Readout:\s*/, "target "),
      action.detail,
      "direct command chord-move",
      `${patternEventTotal(pattern)} events`,
      chordCountLabel(chords),
      chordHarmonyLabel(chords),
      chordInversionSummaryLabel(chords),
      chordRhythmSummaryLabel(chords),
      chordVelocityLabel(chords),
      chordChanceLabel(chords),
      `arrangement ${arrangementUse}`,
      "chord route unchanged",
      "chords unchanged",
      "playback unchanged",
      "export unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionMelodyMoveRouteReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "melody-move-route-readout-action") {
    return null;
  }

  const pattern = activePattern(project);
  const notes = pattern.melodyNotes;
  const preview = createMelodyMovePreviewSummary(
    project.key,
    notes,
    createMelodyMotifOptions(project.key),
    createMelodyAccentOptions(notes),
    createMelodyContourOptions(project.key, notes)
  );
  const target = activeMelodyMoveQuickActionTarget(project, preview);
  const arrangementUse = patternArrangementUseLabel(project, project.selectedPattern);
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "melody-move-route-readout",
    label: "Melody Move Route Readout",
    value: [
      "review melody move route",
      `selected Pattern ${project.selectedPattern}`,
      preview.statusLabel,
      `preview ${preview.phraseLabel}`,
      `motif ${preview.motifLabel}`,
      `accent ${preview.accentLabel}`,
      `contour ${preview.contourLabel}`,
      preview.moveLabel,
      target ? `target ${target.label} ${target.kind}` : "target unavailable",
      target ? `route ${melodyMoveRouteLabel(target)}` : "route unavailable",
      "direct command melody-move",
      `${patternEventTotal(pattern)} events`,
      melodyNoteCountLabel(notes),
      melodyRhythmLabel(notes),
      melodyRangeLabel(notes),
      melodyVelocityLabel(notes),
      melodyChanceLabel(notes),
      `arrangement ${arrangementUse}`,
      "melody route unchanged",
      "melody unchanged",
      "playback unchanged",
      "export unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionBassMoveRouteReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "808-move-route-readout-action") {
    return null;
  }

  const pattern = activePattern(project);
  const notes = pattern.bassNotes;
  const preview = createBassMovePreviewSummary(
    project.key,
    notes,
    createBasslinePadOptions(project.key),
    createBassGlidePadOptions(notes),
    createBassContourOptions(project.key, notes)
  );
  const target = activeBassMoveQuickActionTarget(project, preview);
  const arrangementUse = patternArrangementUseLabel(project, project.selectedPattern);
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "808-move-route-readout",
    label: "808 Move Route Readout",
    value: [
      "review 808 move route",
      `selected Pattern ${project.selectedPattern}`,
      preview.statusLabel,
      `preview ${preview.phraseLabel}`,
      `bassline ${preview.basslineLabel}`,
      `glide ${preview.glideLabel}`,
      `contour ${preview.contourLabel}`,
      preview.moveLabel,
      target ? `target ${target.label} ${target.kind}` : "target unavailable",
      target ? `route ${bassMoveRouteLabel(target)}` : "route unavailable",
      "direct command 808-move",
      `${patternEventTotal(pattern)} events`,
      bassNoteCountLabel(notes),
      bassRhythmLabel(notes),
      bassGlideLabel(notes),
      bassChanceLabel(notes),
      bassRangeLabel(notes),
      `arrangement ${arrangementUse}`,
      "808 route unchanged",
      "808 unchanged",
      "playback unchanged",
      "export unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export function quickActionDrumMoveRouteReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "drum-move-route-readout-action") {
    return null;
  }

  const pattern = activePattern(project);
  const preview = createDrumMovePreviewSummary(
    pattern,
    createDrumFoundationOptions(),
    createGrooveFeelOptions(),
    createDrumAccentOptions()
  );
  const target = activeDrumMoveQuickActionTarget(project, preview);
  const arrangementUse = patternArrangementUseLabel(project, project.selectedPattern);
  const followup = quickActionResultFollowup(action, project, "complete");

  return {
    id: "drum-move-route-readout",
    label: "Drum Move Route Readout",
    value: [
      "review drum move route",
      `selected Pattern ${project.selectedPattern}`,
      preview.statusLabel,
      `preview ${preview.patternLabel}`,
      `foundation ${preview.foundationLabel}`,
      `feel ${preview.feelLabel}`,
      `accent ${preview.accentLabel}`,
      preview.moveLabel,
      target ? `target ${target.label} ${target.kind}` : "target unavailable",
      target ? `route ${drumMoveRouteLabel(target)}` : "route unavailable",
      "direct command drum-move",
      `${patternEventTotal(pattern)} events`,
      `${activeDrumHitCount(pattern)} drum hits`,
      drumAverageTimingLabel(pattern),
      drumAverageChanceLabel(pattern),
      drumAverageVelocityLabel(pattern),
      `arrangement ${arrangementUse}`,
      "drum route unchanged",
      "drums unchanged",
      "playback unchanged",
      "export unchanged",
      "sampler scope unchanged",
      `audition ${followup.auditionCue}`,
      `next ${followup.nextCheck}`
    ].join(" / ")
  };
}

export type PatternEditQuickActionRoute = {
  action: "copy" | "clear";
  source: PatternSlot;
  target: PatternSlot;
};

export function quickActionPatternCopyClearReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const source = patternCopyClearReadoutQuickActionSource(action);
  if (!source) {
    return null;
  }

  const sourcePattern = project.patterns[source];
  const eventCount = patternEventTotal(sourcePattern);
  const drumCount = drumHitCount(sourcePattern);
  const musicEvents = sourcePattern.bassNotes.length + sourcePattern.chordEvents.length + sourcePattern.melodyNotes.length;
  const copyTargets = patternSlots.filter((target) => target !== source);
  const arrangedBlocks = project.arrangement.filter((block) => block.pattern === source);
  const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  const arrangementUse =
    arrangedBlocks.length === 0
      ? "not arranged"
      : `${arrangedBlocks.length} block${arrangedBlocks.length === 1 ? "" : "s"} / ${barCountLabel(arrangedBars)}`;

  return {
    id: "pattern-copy-clear-readout",
    label: "Pattern Copy/Clear Readout",
    value: [
      "review pattern copy clear",
      `selected Pattern ${source}`,
      `copy targets ${copyTargets.join(", ")}`,
      `${eventCount} events`,
      `${drumCount} drums`,
      `${musicEvents} music`,
      `arrangement ${arrangementUse}`,
      "clear risk reviewed",
      `edit Pattern ${project.selectedPattern}`,
      "copy unchanged",
      "clear unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function patternCopyClearReadoutQuickActionSource(action: QuickAction): PatternSlot | null {
  if (action.id !== "pattern-copy-clear-readout-action") {
    return null;
  }

  const match = /Pattern ([ABC])/.exec(`${action.title} ${action.detail}`);
  const slot = match?.[1];
  return slot === "A" || slot === "B" || slot === "C" ? slot : null;
}

export function quickActionPatternCloneReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  const route = patternCloneReadoutQuickActionRoute(action) ?? createPatternCloneSuggestionSummary(project.selectedPattern, project.patterns);
  if (action.id !== "pattern-clone-readout-action") {
    return null;
  }

  const sourcePattern = project.patterns[route.source];
  const targetPattern = project.patterns[route.target];
  const sourceEvents = patternEventTotal(sourcePattern);
  const targetEvents = patternEventTotal(targetPattern);
  const sourceDrums = drumHitCount(sourcePattern);
  const sourceMusicEvents = sourcePattern.bassNotes.length + sourcePattern.chordEvents.length + sourcePattern.melodyNotes.length;
  const targetDrums = drumHitCount(targetPattern);
  const targetMusicEvents = targetPattern.bassNotes.length + targetPattern.chordEvents.length + targetPattern.melodyNotes.length;
  const sourceArrangement = patternArrangementUseLabel(project, route.source);
  const targetArrangement = patternArrangementUseLabel(project, route.target);
  const overwriteRisk = targetEvents === 0 ? "target empty" : `target has ${targetEvents} existing events`;

  return {
    id: "pattern-clone-readout",
    label: "Pattern Clone Readout",
    value: [
      "review pattern clone",
      `Pattern ${route.source} -> ${route.target}`,
      `${patternVariationPresetLabel(route.preset)} suggestion`,
      `source ${sourceEvents} events`,
      `${sourceDrums} source drums`,
      `${sourceMusicEvents} source music`,
      `target ${targetEvents} events`,
      `${targetDrums} target drums`,
      `${targetMusicEvents} target music`,
      `source arrangement ${sourceArrangement}`,
      `target arrangement ${targetArrangement}`,
      `overwrite risk ${overwriteRisk}`,
      `edit Pattern ${project.selectedPattern}`,
      "clone unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function patternCloneReadoutQuickActionRoute(
  action: QuickAction
): { source: PatternSlot; target: PatternSlot; preset: PatternVariationPreset } | null {
  if (action.id !== "pattern-clone-readout-action") {
    return null;
  }

  const text = `${action.title} ${action.detail}`;
  const routeMatch = /Pattern ([ABC]) -> ([ABC])/.exec(text);
  const source = routeMatch ? patternSlotFromQuickActionValue(routeMatch[1]) : null;
  const target = routeMatch ? patternSlotFromQuickActionValue(routeMatch[2]) : null;
  const preset = /\bHook\b/.test(text) ? "hook" : /\bBreak\b/.test(text) ? "breakdown" : null;
  if (!source || !target || !preset) {
    return null;
  }

  return { source, target, preset };
}

export function patternArrangementUseLabel(project: ProjectState, pattern: PatternSlot): string {
  const arrangedBlocks = project.arrangement.filter((block) => block.pattern === pattern);
  const arrangedBars = arrangedBlocks.reduce((total, block) => total + normalizeArrangementBars(block.bars), 0);
  return arrangedBlocks.length === 0
    ? "not arranged"
    : `${arrangedBlocks.length} block${arrangedBlocks.length === 1 ? "" : "s"} / ${barCountLabel(arrangedBars)}`;
}

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

export function quickActionPatternVariationReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-variation-readout-action") {
    return null;
  }

  const pattern = activePattern(project);
  const suggestion = createPatternVariationSuggestionSummary(project.selectedPattern, pattern);
  const previewPreset = patternVariationReadoutQuickActionPreviewPreset(action) ?? suggestion.preset;
  const preview = createPatternVariationPreviewSummary(project.selectedPattern, pattern, previewPreset);
  const drumHits = drumHitCount(pattern);
  const bassNotes = pattern.bassNotes.length;
  const chordEvents = pattern.chordEvents.length;
  const melodyNotes = pattern.melodyNotes.length;
  const musicEvents = bassNotes + chordEvents + melodyNotes;
  const arrangementUse = patternArrangementUseLabel(project, project.selectedPattern);

  return {
    id: "pattern-variation-readout",
    label: "Pattern Variation Readout",
    value: [
      "review pattern variation",
      `selected Pattern ${project.selectedPattern}`,
      `${suggestion.presetLabel} suggestion`,
      `preview ${preview.presetLabel}`,
      `${preview.moveLabel}`,
      `${patternEventTotal(pattern)} events`,
      `${drumHits} drums`,
      `${bassNotes} 808`,
      `${chordEvents} chords`,
      `${melodyNotes} synth`,
      `${musicEvents} music`,
      `arrangement ${arrangementUse}`,
      "variation unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function patternVariationReadoutQuickActionPreviewPreset(action: QuickAction): PatternVariationPreset | null {
  if (action.id !== "pattern-variation-readout-action") {
    return null;
  }

  const text = `${action.title} ${action.detail}`;
  if (/\bSubtle target\b/.test(text)) {
    return "subtle";
  }
  if (/\bHook target\b/.test(text)) {
    return "hook";
  }
  if (/\bBreak target\b/.test(text)) {
    return "breakdown";
  }
  if (/\bSwitchup target\b/.test(text)) {
    return "switchup";
  }

  return null;
}

export function quickActionPatternFillReadoutMetricSnapshot(
  project: ProjectState,
  action: QuickAction
): { id: string; label: string; value: string } | null {
  if (action.id !== "pattern-fill-readout-action") {
    return null;
  }

  const pattern = activePattern(project);
  const suggestion = createPatternFillSuggestionSummary(project.selectedPattern, pattern, project.key);
  const previewPreset = patternFillReadoutQuickActionPreviewPreset(action) ?? suggestion.preset;
  const preview = createPatternFillPreviewSummary(project.selectedPattern, pattern, previewPreset, project.key);
  const drumHits = drumHitCount(pattern);
  const bassNotes = pattern.bassNotes.length;
  const chordEvents = pattern.chordEvents.length;
  const melodyNotes = pattern.melodyNotes.length;
  const musicEvents = bassNotes + chordEvents + melodyNotes;
  const arrangementUse = patternArrangementUseLabel(project, project.selectedPattern);

  return {
    id: "pattern-fill-readout",
    label: "Pattern Fill Readout",
    value: [
      "review pattern fill",
      `selected Pattern ${project.selectedPattern}`,
      `${suggestion.presetLabel} suggestion`,
      `preview ${preview.presetLabel}`,
      `${preview.moveLabel}`,
      `${patternEventTotal(pattern)} events`,
      `${drumHits} drums`,
      `${bassNotes} 808`,
      `${chordEvents} chords`,
      `${melodyNotes} synth`,
      `${musicEvents} music`,
      `arrangement ${arrangementUse}`,
      "fill unchanged",
      "playback unchanged",
      "export unchanged"
    ].join(" / ")
  };
}

export function patternFillReadoutQuickActionPreviewPreset(action: QuickAction): PatternFillPreset | null {
  if (action.id !== "pattern-fill-readout-action") {
    return null;
  }

  const text = `${action.title} ${action.detail}`;
  if (/\bDrum Fill target\b/.test(text)) {
    return "drum_fill";
  }
  if (/\b808 Pickup target\b/.test(text)) {
    return "bass_pickup";
  }
  if (/\bMelody Turn target\b/.test(text)) {
    return "melody_turn";
  }
  if (/\bClear Tail target\b/.test(text)) {
    return "clear_tail";
  }

  return null;
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
    case "pattern-variation-switchup":
      return "switchup";
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

  if (action.id === "audience-starter-beginner") {
    return {
      auditionCue:
        "Loop the first-time composer starter, then use First Beat Path or Dual Audience Readiness before editing notes, arrangement, mix, or export.",
      nextCheck:
        "Audience Starter follow-up: open First Beat Path for the next guided beat-making step, then use Audience Completion Route before export."
    };
  }

  if (action.id === "audience-starter-producer") {
    return {
      auditionCue:
        "Loop the professional producer starter, then scan Review Queue, Production Snapshot, and Export Preflight before changing the beat.",
      nextCheck:
        "Audience Starter follow-up: open Review Queue or Export Preflight, then confirm Handoff Package Check before delivery."
    };
  }

  if (action.id === "beat-map-route-readout-action") {
    return {
      auditionCue:
        "Read the Beat Map route, then audition the current Pattern or Full Mix before running Beat Map, Structure Lens, or Next Move actions.",
      nextCheck:
        "Use Beat Map actions only when the named Start, Compose, Arrange, Polish, or Deliver route matches the beat-making question; otherwise leave playback and project data unchanged."
    };
  }

  if (action.id === "structure-lens-route-readout-action") {
    return {
      auditionCue:
        "Read the Structure Lens route, then audition the current Full Mix or Song loop before running Structure Lens, Beat Map, or Next Move actions.",
      nextCheck:
        "Use Structure Lens actions only when the named Target Fit, Section Coverage, Hook Contrast, or Energy Arc route matches the arrangement question; otherwise leave playback and project data unchanged."
    };
  }

  if (action.id === "next-move-route-readout-action") {
    return {
      auditionCue:
        "Read the Next Move route, then audition the suggested Pattern, Block, or Full Mix before running the recommended action.",
      nextCheck:
        "Run Next Move only when the named recommended action and route match the current beat-making question; otherwise leave playback and project data unchanged."
    };
  }

  if (action.id === "command-reference-route-readout-action") {
    return {
      auditionCue:
        "Scan the Command Reference route and category count, then audition the relevant Pattern, Block, or Full Mix before running commands.",
      nextCheck:
        "Open Quick Actions or run a command only when the named command-map category matches the current beat-making question; otherwise leave playback and project data unchanged."
    };
  }

  if (action.id === "quick-actions-route-readout-action") {
    return {
      auditionCue:
        "Scan the Quick Actions route, scope, search, pinned, and recent posture, then audition the relevant Pattern, Block, or Full Mix before running commands.",
      nextCheck:
        "Run a Quick Action only when the named command-palette route matches the current beat-making question; otherwise leave playback and project data unchanged."
    };
  }

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
      nextCheck: "Use Beat Spine, Pattern DNA, and First Beat Path to edit the starter as musical events instead of treating it as fixed audio."
    };
  }

  if (action.id.startsWith("delivery-target-set-")) {
    return {
      auditionCue: "Keep the beat playing only if you are comparing the same music against the new session goal.",
      nextCheck: "Run Delivery Target Align only when arrangement length, master, mix posture, and stem expectation should change."
    };
  }

  const audienceDeliveryProofBridgeLane = audienceDeliveryProofBridgeQuickActionLane(action);
  if (audienceDeliveryProofBridgeLane) {
    if (action.id === "audience-delivery-proof-bridge-readout-action") {
      return {
        auditionCue:
          "Read the Audience Delivery Proof Bridge before choosing the beginner package proof or producer handoff proof lane.",
        nextCheck:
          "Open first-time composer delivery proof for Export Preflight deliverables, or professional producer delivery proof for Handoff Package Check receipt."
      };
    }

    return audienceDeliveryProofBridgeLane.laneLabel === "First-time composer delivery proof"
      ? {
          auditionCue:
            "Use the first-time composer delivery proof lane to confirm the local package can be reopened before sending files.",
          nextCheck:
            "Confirm the result names Export Preflight deliverables, WAV, stems, MIDI, and Handoff Sheet proof."
        }
      : {
          auditionCue:
            "Use the professional producer delivery proof lane to confirm the studio handoff package receipt before delivery.",
          nextCheck:
            "Confirm the result names Handoff Package Check receipt, package reopen, send order, and stem handoff proof."
        };
  }

  const audienceSessionAcceptanceLane = audienceSessionAcceptanceQuickActionLane(action);
  if (audienceSessionAcceptanceLane) {
    if (action.id === "audience-session-acceptance-readout-action") {
      return {
        auditionCue:
          "Read the Audience Session Acceptance strip before choosing the beginner or professional producer acceptance lane.",
        nextCheck:
          "Open first-time composer acceptance for Export Preflight deliverables, or professional producer acceptance for Handoff Package Check receipt."
      };
    }

    return audienceSessionAcceptanceLane.laneLabel === "First-time composer acceptance"
      ? {
          auditionCue:
            "Use the first-time composer acceptance lane to confirm the guided 8-bar session is ready for local delivery proof.",
          nextCheck:
            "Confirm the result names rendered path, workflow, package, reopen, export, Handoff, and Export Preflight deliverables."
        }
      : {
          auditionCue:
            "Use the professional producer acceptance lane to confirm the studio session is ready for handoff proof.",
          nextCheck:
            "Confirm the result names rendered path, workflow, package, reopen, receipt, send order, and Handoff Package Check."
        };
  }

  const audienceSessionProofHandoffLane = audienceSessionProofHandoffQuickActionLane(action);
  if (audienceSessionProofHandoffLane) {
    if (action.id === "audience-session-proof-handoff-readout-action") {
      return {
        auditionCue:
          "Read the Audience Session Proof Handoff before choosing the beginner export proof or producer handoff proof lane.",
        nextCheck:
          "Open first-time composer session proof for Export Preflight deliverables, or professional producer session proof for Handoff Package Check receipt."
      };
    }

    return audienceSessionProofHandoffLane.laneLabel === "First-time composer session proof"
      ? {
          auditionCue:
            "Use the first-time composer session proof lane to confirm the local package reopen path before sending files.",
          nextCheck:
            "Confirm the result names Export Preflight deliverables, WAV, stems, MIDI, Handoff Sheet, and local package reopen proof."
        }
      : {
          auditionCue:
            "Use the professional producer session proof lane to confirm the studio receipt and handoff posture before delivery.",
          nextCheck:
            "Confirm the result names Handoff Package Check receipt, send order, stem handoff, and persona package reopen proof."
        };
  }

  const audienceRouteBridgeLane = audienceRouteBridgeQuickActionLane(action);
  if (audienceRouteBridgeLane) {
    if (action.id === "audience-route-bridge-readout-action") {
      return {
        auditionCue:
          "Read the Audience Route Bridge before choosing the active first-time composer or professional producer next check.",
        nextCheck:
          "Open Bridge Readiness for First Beat Path, Export Preflight, or Production Snapshot, then Bridge Completion for Export Preflight or Handoff Package Check."
      };
    }

    return action.id === "audience-route-bridge-readiness-action"
      ? {
          auditionCue:
            "Use Bridge Readiness to audition the active audience lane before changing notes, arrangement, mix, export, or handoff.",
          nextCheck:
            "Confirm the Audience Route Bridge readiness result names First Beat Path, Export Preflight, or Production Snapshot before the next workflow action."
        }
      : {
          auditionCue:
            "Use Bridge Completion to confirm the active audience lane can move from beat-making into export or handoff.",
          nextCheck:
            "Confirm the Audience Route Bridge completion result names First Beat Path, Export Preflight, Production Snapshot, or Handoff Package Check before delivery."
        };
  }

  const audienceCompletionRouteLane = audienceCompletionRouteQuickActionLane(action);
  if (audienceCompletionRouteLane) {
    if (action.id === "audience-completion-route-readout-action") {
      return {
        auditionCue:
          "Read both Audience Completion Route lanes before choosing a final beginner handoff check or producer delivery scan.",
        nextCheck:
          "Open the first-time composer completion lane for First Beat Path and Export Preflight, or the professional producer completion lane for Production Snapshot and Handoff Package Check."
      };
    }

    return audienceCompletionRouteLane.laneLabel === "First-time composer completion"
      ? {
          auditionCue:
            "Use the first-time composer completion lane to confirm the first beat has composition, export, and handoff checks before sending.",
          nextCheck:
            "Confirm the Audience Completion Route result names First Beat Path, Export Preflight, or Handoff Package Check before final export."
        }
      : {
          auditionCue:
            "Use the professional producer completion lane to scan production, delivery, and handoff posture before sending files.",
          nextCheck:
            "Confirm the Audience Completion Route result names Production Snapshot, Export Preflight, or Handoff Package Check before delivery."
        };
  }

  const dualAudienceReadinessLane = dualAudienceReadinessQuickActionLane(action);
  if (dualAudienceReadinessLane) {
    if (action.id === "dual-audience-readiness-route-readout-action") {
      return {
        auditionCue:
          "Read both Dual Audience Readiness lanes before choosing Guided first-beat work or Studio delivery review.",
        nextCheck:
          "Open the first-time composer lane for First Beat Path or the professional producer lane for Export Preflight and Production Snapshot."
      };
    }

    return dualAudienceReadinessLane.laneLabel === "First-time composer lane"
      ? {
          auditionCue:
            "Use the first-time composer lane to audition the current direct beat-writing step before changing notes, arrangement, mix, or export.",
          nextCheck:
            "Confirm the Dual Audience Readiness result names First Beat Path, then complete the next guided beat-making step."
        }
      : {
          auditionCue:
            "Use the professional producer lane to scan delivery, mix, and handoff posture before changing the beat.",
          nextCheck:
            "Confirm the Dual Audience Readiness result names Export Preflight or Production Snapshot before the next delivery check."
        };
  }

  const audienceSessionRoute = audienceSessionQuickActionRoute(action);
  if (audienceSessionRoute) {
    return audienceSessionRoute.targetMode === "guided"
      ? {
          auditionCue:
            "Use Guided mode to audition each direct beat-making step from First Beat Path before changing notes, arrangement, mix, or export.",
          nextCheck:
            "Confirm the Audience Session result says Enter Guided, then follow First Beat Path for the next sample-free composition move."
        }
      : {
          auditionCue:
            "Use Studio mode to scan Mode Focus, Review Queue, Production Snapshot, and Export Preflight before changing the beat.",
          nextCheck:
            "Confirm the Audience Session result says Enter Studio, then use Review Queue or Export Preflight for the next producer check."
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

  if (action.id === "session-pass-route-readout-action") {
    return {
      auditionCue:
        "Read the Session Pass route, then inspect the matching Transport, Compose, Arrange, Mix, Master, or Deliver area before focusing a pass card.",
      nextCheck:
        "Use Session Pass focus only when the named Guided, Studio, Finish, or Delivery route matches the current pass question; otherwise leave playback and project data unchanged."
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

  if (action.id === "reference-alignment-route-readout-action") {
    return {
      auditionCue:
        "Read the Reference Alignment route, then inspect the matching Session Brief, Arrange, Mix, Master, or Deliver area before focusing or editing reference direction.",
      nextCheck:
        "Use Reference Alignment focus only when the named written-reference route matches the session question; otherwise leave playback and project data unchanged."
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

  if (action.id === "composer-guide-route-readout-action") {
    return {
      auditionCue:
        "Read the Composer Guide route, then inspect the matching Compose, Arrange, Mix, Master, or Deliver area before focusing a writing lane.",
      nextCheck:
        "Use Composer Guide focus only when the named drums, 808, harmony, melody, arrangement, or finish route matches the writing question; otherwise leave playback and project data unchanged."
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

  if (action.id === "composer-actions-readout-action") {
    return {
      auditionCue:
        "Review the current style-aware writing move, route, scope, impact, undo posture, and selected Pattern posture before running a Composer Action.",
      nextCheck: "Run a direct Composer Action only when that local writing move should change the beat."
    };
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

  if (action.id === "key-compass-route-readout-action") {
    return {
      auditionCue:
        "Read the Key Compass route, then inspect the matching scale, cadence, chord, 808/bass, melody, or selected-focus lane before focusing or editing harmony.",
      nextCheck:
        "Use Key Compass focus or key retargeting only when the named harmony route matches the writing question; otherwise leave playback and project data unchanged."
    };
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

  if (action.id === "pattern-variation-readout-action") {
    return {
      auditionCue:
        "Review the selected Pattern event posture, suggested variation, preview target, layer-change count, and arrangement usage before applying a variation.",
      nextCheck: "Run a direct Pattern Variation command only when the selected Pattern should be rewritten by that variation."
    };
  }

  if (action.id.startsWith("pattern-variation-")) {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; confirm the applied variation's drums, 808, chords, and Synth before arranging.`,
      nextCheck: "Use Pattern Compare, Pattern DNA, Pattern Clone, or Pattern Chain when the variation should feed the arrangement."
    };
  }

  if (action.id === "pattern-clone-readout-action") {
    return {
      auditionCue:
        "Review the selected Pattern clone source, suggested target, variation, target overwrite risk, and arrangement usage before cloning Pattern data.",
      nextCheck: "Run a direct Pattern Clone command only when that target Pattern slot should be overwritten by the clone."
    };
  }

  if (action.id === "pattern-fill-readout-action") {
    return {
      auditionCue:
        "Review the selected Pattern event posture, suggested fill, preview target, tail-change count, and arrangement usage before applying a fill.",
      nextCheck: "Run a direct Pattern Fill command only when the selected Pattern tail should be rewritten by that move."
    };
  }

  if (action.id === "pattern-switch-readout-action") {
    return {
      auditionCue:
        "Review the target Pattern's event posture, selected-block placement, and arrangement usage before switching edit focus.",
      nextCheck: "Run a direct Pattern Switch command only when that Pattern should become the editable Pattern."
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

  if (action.id === "pattern-cue-readout-action") {
    return {
      auditionCue:
        "Review the target Pattern's event posture, selected-block placement, and arrangement usage before cueing the Pattern loop.",
      nextCheck: "Run a direct Pattern Cue command only when that Pattern should become the audition loop."
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

  if (action.id === "pattern-contrast-readout-action") {
    const summary = createPatternContrastSummary(createPatternCompareSummaries(project));
    return {
      auditionCue: summary.auditionCue,
      nextCheck: summary.nextCheck
    };
  }

  if (action.id === "pattern-contrast-role-map-readout-action") {
    const roleMap = createPatternContrastRoleMapSummary(
      createPatternContrastSummary(createPatternCompareSummaries(project)),
      project.arrangement,
      0
    );
    return {
      auditionCue: roleMap.auditionCue,
      nextCheck: roleMap.nextCheck
    };
  }

  if (action.id === "pattern-contrast-section-fit-readout-action") {
    const sectionFit = createPatternContrastSectionFitSummary(
      createPatternContrastSummary(createPatternCompareSummaries(project)),
      project.arrangement,
      0,
      project.styleId
    );
    return {
      auditionCue: sectionFit.auditionCue,
      nextCheck: sectionFit.nextCheck
    };
  }

  if (action.id === "pattern-contrast-section-fit-decision") {
    const sectionFit = createPatternContrastSectionFitSummary(
      createPatternContrastSummary(createPatternCompareSummaries(project)),
      project.arrangement,
      0,
      project.styleId
    );
    const selectedItem = sectionFit.items.find((item) => item.selected) ?? sectionFit.items[0] ?? null;
    return {
      auditionCue: selectedItem
        ? `Play Block loop; confirm the Decision result for ${selectedItem.sectionLabel} against its ${sectionFit.styleBasisLabel} ${selectedItem.expectedLabel} role because ${selectedItem.reasonLabel}.`
        : "Create an arrangement block before running a Section Fit Decision.",
      nextCheck: `Read Section Fit again, then keep the block cued or use Role Map before making another ${sectionFit.styleBasisLabel} placement.`
    };
  }

  if (action.id === "pattern-contrast-section-fit-priority-cue") {
    const sectionFit = createPatternContrastSectionFitSummary(
      createPatternContrastSummary(createPatternCompareSummaries(project)),
      project.arrangement,
      0,
      project.styleId
    );
    const priorityItem = sectionFit.priorityItem;
    return {
      auditionCue: priorityItem
        ? `Play Block loop; hear Priority Block ${priorityItem.index + 1} ${priorityItem.sectionLabel} against its ${sectionFit.styleBasisLabel} ${priorityItem.expectedLabel} role because ${priorityItem.reasonLabel}.`
        : "Create an arrangement block before cueing Section Fit priority.",
      nextCheck: "After the Priority Cue, use Section Fit Decision only if the section still needs a cue or role placement."
    };
  }

  if (action.id === "pattern-contrast-section-fit-cue-selected-block") {
    const sectionFit = createPatternContrastSectionFitSummary(
      createPatternContrastSummary(createPatternCompareSummaries(project)),
      project.arrangement,
      0,
      project.styleId
    );
    const selectedItem = sectionFit.items.find((item) => item.selected) ?? sectionFit.items[0] ?? null;
    return {
      auditionCue: selectedItem
        ? `Play Block loop; hear whether ${selectedItem.sectionLabel} works as ${selectedItem.roleLabel} against its ${sectionFit.styleBasisLabel} ${selectedItem.expectedLabel} role because ${selectedItem.reasonLabel}.`
        : "Create an arrangement block before cueing Section Fit.",
      nextCheck: `Compare the cued Block loop with Song loop, then use Role Map or Pattern Use only if the section needs a different ${sectionFit.styleBasisLabel} role.`
    };
  }

  if (action.id === "pattern-contrast-section-fit-use-selected-block") {
    const sectionFit = createPatternContrastSectionFitSummary(
      createPatternContrastSummary(createPatternCompareSummaries(project)),
      project.arrangement,
      0,
      project.styleId
    );
    const selectedItem = sectionFit.items.find((item) => item.selected) ?? sectionFit.items[0] ?? null;
    return {
      auditionCue: selectedItem
        ? `Play Block loop; confirm ${selectedItem.sectionLabel} now supports its ${sectionFit.styleBasisLabel} ${selectedItem.expectedLabel} role with Pattern ${selectedItem.pattern} because ${selectedItem.reasonLabel}.`
        : "Create an arrangement block before using Section Fit.",
      nextCheck: "Read Section Fit again, then cue the block or Song loop before making another role placement."
    };
  }

  if (action.id.startsWith("pattern-contrast-cue-")) {
    const role = patternContrastCueQuickActionRole(action);
    const summary = createPatternContrastSummary(createPatternCompareSummaries(project));
    const slot = role ? patternContrastCueSlot(summary, role) : null;
    const roleLabel = role ? patternContrastCueRoleLabel(role) : "Contrast";
    return {
      auditionCue: slot
        ? `Play Pattern loop; hear ${roleLabel} Pattern ${slot.slot} against the current Anchor/Lift/Break/Switchup spread.`
        : `Play Pattern loop only after a ${roleLabel} role exists in Pattern Contrast.`,
      nextCheck:
        "Read Pattern Compare Result, then use Pattern Switch for edits or Pattern Use when that role should support the selected arrangement block."
    };
  }

  if (action.id.startsWith("pattern-contrast-use-")) {
    const role = patternContrastUseQuickActionRole(action);
    const target = patternContrastQuickActionTargetPattern(action) ?? project.selectedPattern;
    const roleLabel = role ? patternContrastCueRoleLabel(role) : "Contrast";
    return {
      auditionCue: `Play Block loop; confirm ${roleLabel} Pattern ${target} now supports the selected arrangement block.`,
      nextCheck: "Scan Song Form Overview, Arrangement Playback Readout, and Pattern Contrast before placing another role."
    };
  }

  if (action.id.startsWith("pattern-use-")) {
    return {
      auditionCue: `Play Block loop; confirm the selected arrangement block now works with Pattern ${project.selectedPattern}.`,
      nextCheck: "Scan Song Form Overview, Pattern Compare, and Arrangement Playback Readout before placing the next variation."
    };
  }

  if (action.id === "pattern-copy-clear-readout-action") {
    return {
      auditionCue:
        "Review the selected Pattern event posture, copy targets, arrangement usage, and clear risk before copying or clearing Pattern data.",
      nextCheck: "Run a direct Pattern Copy or Clear command only when that Pattern edit should mutate the A/B/C loop."
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

  if (action.id === "groove-compass-route-readout-action") {
    return {
      auditionCue:
        "Read the Groove Compass route, then inspect the matching density, anchors, hats, timing, chance, pocket, or selected-drum lane before focusing, cueing, or editing drums.",
      nextCheck:
        "Use Groove Compass focus or cue only when the named pocket route matches the drum question; otherwise leave playback and project data unchanged."
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

  if (action.id === "layer-starter-readout-action") {
    return {
      auditionCue:
        "Review the selected Pattern Drums/808/Chords/Synth readiness, priority layer, event posture, and arrangement usage before starting a layer.",
      nextCheck: "Run a direct Layer Starter command only when the selected Pattern needs that missing or thin layer started."
    };
  }

  if (action.id === "layer-starter-route-readout-action") {
    return {
      auditionCue:
        "Read the starter route and loop the selected Pattern before choosing a direct layer-start command.",
      nextCheck:
        "Use only the named Layer Starter route when that layer is still missing or thin; otherwise return to Pattern DNA or Composer Actions."
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

  if (action.id === "pattern-stack-readout-action") {
    return {
      auditionCue:
        "Review the selected Pattern 808/chord/Synth posture, suggested stack, preview target, arrangement usage, and layer readiness before applying a stack.",
      nextCheck: "Run a direct Pattern Stack command only when the selected Pattern 808/chord/Synth layers should be rewritten by that stack."
    };
  }

  if (action.id === "pattern-stack-route-readout-action") {
    return {
      auditionCue:
        "Read the stack route and loop the selected Pattern before choosing the preview Pattern Stack command or a direct stack pad.",
      nextCheck:
        "Use only the named Pattern Stack route when the selected Pattern 808/chord/Synth layers should be rewritten; otherwise return to Pattern DNA or selected-event tools."
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

  if (action.id === "drum-move-route-readout-action") {
    return {
      auditionCue:
        "Read the drum route and loop the selected Pattern before choosing the existing Drum Move command.",
      nextCheck:
        "Use Drum Move only when the named Foundation, Feel, or Accent route should reshape the selected Pattern drums; otherwise use selected-drum tools."
    };
  }

  if (action.id === "808-move-route-readout-action") {
    return {
      auditionCue:
        "Read the 808 route and loop the selected Pattern before choosing the existing 808 Move command.",
      nextCheck:
        "Use 808 Move only when the named Bassline, Glide, or Contour route should reshape the selected Pattern low end; otherwise use selected-note tools."
    };
  }

  if (action.id === "808-move") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; check kick-to-808 lock, slides, and low-end contour.`,
      nextCheck: "Use the 808 Move Result plus selected-note degree/role and 808 edit tools for manual corrections."
    };
  }

  if (action.id === "melody-move-route-readout-action") {
    return {
      auditionCue:
        "Read the melody route and loop the selected Pattern before choosing the existing Melody Move command.",
      nextCheck:
        "Use Melody Move only when the named Motif, Accent, or Contour route should reshape the selected Pattern Synth phrase; otherwise use selected-note tools."
    };
  }

  if (action.id === "melody-move") {
    return {
      auditionCue: `Loop Pattern ${project.selectedPattern}; check Synth phrase shape against chords, 808, and drums.`,
      nextCheck: "Use the Melody Move Result plus selected-note degree/role and melody edit tools for manual corrections."
    };
  }

  if (action.id === "chord-move-route-readout-action") {
    return {
      auditionCue:
        "Read the chord route and loop the selected Pattern before choosing the existing Chord Move command.",
      nextCheck:
        "Use Chord Move only when the named Pads, Rhythm, or Voicing route should reshape the selected Pattern harmony; otherwise use selected-chord tools."
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

  if (action.id === "sound-preset-route-readout-action") {
    return {
      auditionCue: `Read the Sound Preset route and loop Pattern ${project.selectedPattern} before choosing the existing Sound Preset command.`,
      nextCheck:
        "Use Sound Preset only when the named Drums, 808, Duck, Synth, or Chords route should reshape the full beat tone; otherwise trim Drum Kit, Sound Focus, or Studio tone manually."
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

  if (action.id === "drum-kit-route-readout-action") {
    return {
      auditionCue: `Read the Drum Kit route and loop Pattern ${project.selectedPattern} before choosing the existing Drum Kit command.`,
      nextCheck:
        "Use Drum Kit only when the named kick, clap, or hat kit route should reshape the local drum tone; otherwise trim drum rack or Studio tone controls manually."
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

  if (action.id === "sound-focus-route-readout-action") {
    return {
      auditionCue: `Read the Sound Focus route and loop Pattern ${project.selectedPattern} before choosing the existing Sound Focus command.`,
      nextCheck:
        "Use Sound Focus only when the named 808, Synth, or Chords route should reshape the local tone; otherwise trim Studio tone controls manually."
    };
  }

  if (action.id === "beat-readiness-route-readout-action") {
    return {
      auditionCue: `Read the Beat Readiness route, then loop Pattern ${project.selectedPattern} before focusing a readiness check or editing notes.`,
      nextCheck:
        "Use Beat Readiness focus only when the named drums, 808/bass, melody/chords, arrangement, or export route matches the next production blocker; otherwise leave the beat unchanged."
    };
  }

  if (action.id === "beat-readiness-focus" || action.id.startsWith("beat-readiness-check-")) {
    return {
      auditionCue: "Use the focused panel to inspect the readiness issue before changing project data.",
      nextCheck: "Return to Beat Readiness after the next explicit drums, 808, harmony, arrangement, or export move."
    };
  }

  if (action.id === "listening-pass-route-readout-action") {
    return {
      auditionCue: `Read the Listening Pass route, then audition Pattern ${project.selectedPattern}, Song, Full Mix, or the matching stem before focusing a checkpoint.`,
      nextCheck:
        "Use Listening Pass focus only when the named composition, arrangement, mix, or delivery route matches the listening question; otherwise leave playback and project data unchanged."
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

  if (action.id === "beat-passport-route-readout-action") {
    return {
      auditionCue: `Read the Beat Passport route, then audition Pattern ${project.selectedPattern}, Song, Full Mix, or the matching deliverable before focusing an identity metric.`,
      nextCheck:
        "Use Beat Passport focus only when the named target, length, Pattern, readiness, export, stems, or master route matches the identity question; otherwise leave playback and project data unchanged."
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

  if (action.id === "production-snapshot-route-readout-action") {
    return {
      auditionCue:
        "Read the Production Snapshot route, then audition Pattern A/B/C, Song, Full Mix, or the matching handoff area before focusing a session metric.",
      nextCheck:
        "Use Production Snapshot focus only when the named target, form, Pattern, mix, or handoff route matches the session question; otherwise leave playback and project data unchanged."
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

  if (action.id === "hook-readiness-route-readout-action") {
    return {
      auditionCue:
        "Read the Hook Readiness route, then inspect the matching Compose, Arrange, Mix, Master, Deliver, or Session Brief area before focusing, cueing, or applying a hook fix.",
      nextCheck:
        "Use Hook Readiness focus/cue/fix only when the named hook route matches the hook question; otherwise leave playback and project data unchanged."
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

  if (action.id === "topline-space-route-readout-action") {
    return {
      auditionCue:
        "Read the Topline Space route, then inspect the matching Compose, Arrange, Mix, Master, Deliver, or Session Brief area before focusing, cueing, or applying a topline fix.",
      nextCheck:
        "Use Topline Space focus/cue/fix only when the named topline route matches the vocal or lead-room question; otherwise leave playback and project data unchanged."
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

  if (action.id === "handoff-route-readout-action") {
    return {
      auditionCue: "Review the handoff route, delivery target, and package posture before sending the beat package.",
      nextCheck:
        "Run Handoff Next Export or the matching explicit export only after the route, receipt, package check, and send order agree."
    };
  }

  if (action.id === "handoff-delivery-target-readout-action") {
    return {
      auditionCue: "Review the selected delivery target, target length, stem goal, and handoff context before exporting deliverables.",
      nextCheck:
        "Run Delivery Target Align or an explicit export only after target fit, package posture, and Session Brief context agree."
    };
  }

  if (action.id === "handoff-session-brief-readout-action") {
    return {
      auditionCue: "Review artist, vibe, reference, notes, and the Handoff Sheet filename before exporting or sending files.",
      nextCheck:
        "Use Brief Compass or Session Brief Starter only if context is missing; otherwise continue to Handoff Package Check or explicit export."
    };
  }

  if (action.id === "handoff-final-check-readout-action") {
    return {
      auditionCue: "Read the final handoff posture and confirm target, brief, format, manifest, receipt, send order, and package state agree.",
      nextCheck:
        "If any blocker or review lane remains, use the matching Handoff readout; otherwise run only the explicit export you intend to deliver."
    };
  }

  if (action.id === "handoff-send-readiness-readout-action") {
    return {
      auditionCue: "Read the send/no-send posture before choosing any explicit export, package, or handoff command.",
      nextCheck:
        "Use the named gate first; only send or package outside GrooveForge after send readiness, manifest, receipt, and send order agree."
    };
  }

  if (action.id === "handoff-blocker-readout-action") {
    return {
      auditionCue: "Read the current blocker or review lane before choosing the next explicit export or handoff check.",
      nextCheck:
        "Use the named Handoff Pack lane or matching explicit export only after the blocker context matches the deliverable you intend to fix."
    };
  }

  if (action.id === "handoff-blocker-route-readout-action") {
    return {
      auditionCue: "Read the blocker route before choosing the next explicit export, Session Brief, or handoff check.",
      nextCheck:
        "Use only the named existing lane or command family; avoid Handoff Next Export until blocker route and deliverable intent agree."
    };
  }

  if (action.id === "handoff-package-check-focus") {
    return {
      auditionCue: "Use the focused Handoff Package Check card to inspect file set, export order, latest receipt, or session context before sending.",
      nextCheck: "Return to Handoff Package Check after the focused package lane is ready or intentionally deferred."
    };
  }

  if (action.id === "handoff-package-check-readout-action") {
    return {
      auditionCue: "Review file set, send order, latest receipt, and session context before sending the beat package.",
      nextCheck:
        "Run Handoff Next Export or the matching explicit export only after the package priority, receipt, send order, and delivery target agree."
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

  if (action.id === "handoff-export-receipt-readout-action") {
    return {
      auditionCue: "Review the latest receipt file, package readiness, and send order before sending the beat package.",
      nextCheck:
        "Run Handoff Next Export or the matching explicit export only if the latest receipt does not match the deliverable you need."
    };
  }

  if (action.id === "handoff-send-order-readout-action") {
    return {
      auditionCue: "Review the delivery sequence and current next deliverable before running Handoff Next Export.",
      nextCheck:
        "Run Handoff Next Export only after the sequence, package readiness, latest receipt, and delivery target point to the same next item."
    };
  }

  if (action.id === "handoff-send-order-focus") {
    return {
      auditionCue: "Read Handoff Send Order before running Handoff Next Export so the next WAV, stems, MIDI, or Handoff Sheet step is deliberate.",
      nextCheck: "If the next step is correct, run Handoff Next Export or the matching explicit export button."
    };
  }

  if (action.id === "handoff-manifest-audit-readout-action") {
    return {
      auditionCue: "Review planned file readiness and latest receipt before sending the beat package.",
      nextCheck:
        "Run the specific missing export only after Manifest Audit, receipt, send order, and delivery target agree."
    };
  }

  if (action.id === "handoff-manifest-audit-focus") {
    return {
      auditionCue: "Read Manifest Audit before sending files so planned WAV, stems, MIDI, and Handoff Sheet readiness match the latest receipt.",
      nextCheck: "If any file lane is not ready, use Handoff Send Order, Handoff Export Receipt, or the explicit deliverable export before sending."
    };
  }

  if (action.id === "handoff-export-format-readout-action") {
    return {
      auditionCue: "Review WAV format, duration, stem count, MIDI scope, and Handoff Sheet context before exporting deliverables.",
      nextCheck:
        "Run the matching explicit export only after the format posture, package readiness, delivery target, and receipt context agree."
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

  if (action.id === "finish-checklist-route-readout-action") {
    return {
      auditionCue:
        "Read the Finish Checklist route, then audition Pattern A/B/C, Song, Full Mix, Master, or the matching Handoff area before focusing a finish card.",
      nextCheck:
        "Use Finish Checklist focus only when the named Compose, Arrange, Mix, Master, Master Automation, or Handoff route matches the finish question; otherwise leave playback and project data unchanged."
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

  if (action.id === "review-queue-route-readout-action") {
    return {
      auditionCue:
        "Read the Review Queue route, then audition the matching Compose, Arrange, Mix, Master, or Deliver area before focusing an issue or applying Review Fix.",
      nextCheck:
        "Use Review Queue focus or Review Fix only when the named route matches the production issue; otherwise leave playback, export, and project data unchanged."
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

  if (action.id === "export-preflight-route-readout-action") {
    return {
      auditionCue: `Read the Export Preflight route and play Pattern ${project.selectedPattern} or Full Mix before focusing a card or exporting files.`,
      nextCheck:
        "Use Export Preflight focus only when the named readiness, mix/master, automation, deliverables, or handoff route matches the delivery risk; otherwise leave export state unchanged."
    };
  }

  if (action.id.startsWith("export-preflight-card-")) {
    return {
      auditionCue: "Use the focused Export Preflight card to inspect that delivery-risk lane before exporting.",
      nextCheck: "Return to Export Preflight when you need another direct readiness, mix, deliverable, or handoff focus."
    };
  }

  if (action.id === "workflow-spotlight-route-readout-action") {
    return (
      quickActionWorkflowSpotlightFollowup(project, action, analysis) ?? {
        auditionCue:
          "Read the Workflow Spotlight route, then inspect the highlighted Compose, Arrange, Mix, or Deliver zone before focusing or jumping.",
        nextCheck:
          "Use Workflow Spotlight focus only when the named route matches the current bottleneck; otherwise leave playback and project data unchanged."
      }
    );
  }

  if (action.id === "workflow-spotlight-focus") {
    return (
      quickActionWorkflowSpotlightFollowup(project, action, analysis) ?? {
        auditionCue: "Use the focused workflow panel to inspect the highlighted blocker or review zone.",
        nextCheck: "Return to Workflow Spotlight after the zone looks ready and run the command again for the next jump."
      }
    );
  }

  if (action.id === "workflow-navigator-route-readout-action") {
    return (
      quickActionWorkflowNavigatorFollowup(project, action, analysis) ?? {
        auditionCue:
          "Read the Workflow Navigator route, then inspect Compose, Arrange, Mix, or Deliver before jumping zones or running workflow actions.",
        nextCheck:
          "Use Workflow Navigator jumps only when the named route matches the beat-making question; otherwise leave playback and project data unchanged."
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

  if (action.id === "mix-balance-route-readout-action") {
    return {
      auditionCue: `Read the Mix Balance route and loop Pattern ${project.selectedPattern} before choosing the existing Mix Balance command.`,
      nextCheck:
        "Use Mix Balance only when the named Drums, 808, Synth, or Chords channel route should reshape the rough balance; otherwise trim level, pan, EQ, Drive/Glue, or Space manually."
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

  if (action.id === "stem-audition-route-readout-action") {
    return {
      auditionCue: `Read the Stem Audition route and loop Pattern ${project.selectedPattern} before choosing the existing Stem Audition command.`,
      nextCheck:
        "Use Stem Audition only when the named Full Mix, Drums, 808, Synth, or Chords route matches the comparison you need; otherwise leave solo/mute unchanged and trim manually."
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

  if (action.id === "mix-snapshot-route-readout-action") {
    return {
      auditionCue: `Read the Mix Snapshot route and loop Pattern ${project.selectedPattern} before choosing the existing Mix Snapshot command.`,
      nextCheck:
        "Use Mix Snapshot Decision only when the named capture or recall route matches the A/B comparison you need; otherwise leave slots and mixer/master unchanged."
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

  if (action.id === "master-finish-route-readout-action") {
    return {
      auditionCue: `Read the Master Finish route and play Pattern ${project.selectedPattern} or Full Mix before choosing the existing Master Finish command.`,
      nextCheck:
        "Use Master Finish only when the named demo, vocal, store, or club route matches the delivery target; otherwise leave master preset, ceiling, and output unchanged."
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

  if (action.id === "master-automation-route-readout-action") {
    return {
      auditionCue: `Read the Master Automation route and play Pattern ${project.selectedPattern} or Song before choosing the existing Master Automation command.`,
      nextCheck:
        "Use Master Automation only when the named none, fade-in, fade-out, or intro/outro route matches the arrangement; otherwise leave automation events unchanged."
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

  if (action.id === "direct-exports-readout-action") {
    return {
      auditionCue: "Review WAV, stem, MIDI, and Handoff Sheet posture before exporting files.",
      nextCheck:
        "Run one explicit export only after the delivery target, filenames, package readiness, and send order match the handoff need."
    };
  }

  if (action.id === "handoff-next-export-readout-action") {
    return {
      auditionCue: "Review Handoff Send Order and latest receipt before exporting the next WAV, stems, MIDI, or Handoff Sheet item.",
      nextCheck:
        "Run Handoff Next Export only after the next deliverable, file target, package readiness, and receipt posture match the handoff need."
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

  if (action.id === "space-fx-route-readout-action") {
    return {
      auditionCue: `Read the Space FX route and loop Pattern ${project.selectedPattern} before choosing the existing Space FX command.`,
      nextCheck:
        "Use Space FX only when the named Drums, 808, Synth, or Chords send route should reshape the beat space; otherwise trim Space sliders manually."
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
