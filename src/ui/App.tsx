/**
 * GrooveForge 렌더러의 최상위 오케스트레이터다. 프로젝트 편집 상태와 재생·분석·저장 상태를 소유하고,
 * 도메인 계산 모듈에서 파생값을 만든 뒤 Compose/Arrange/Mix/Deliver 페이지와 대화상자에 전달한다.
 * 비동기 저장·내보내기·Worker 분석의 최신성, React 배치 업데이트, 네이티브 메뉴/창 닫기 연동이 중요한 부수효과 경계다.
 */
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
  Settings,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  Undo2,
  Waves,
  X
} from "lucide-react";
import type { ChangeEvent, CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactElement, ReactNode, Ref } from "react";
import { Activity, startTransition, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { HeaderActionDock } from "./HeaderActionDock";
import {
  drumGridEntryStep,
  drumGridNavigationTarget,
  isDrumGridActivationKey,
  isDrumGridNavigationKey
} from "./drumGridKeyboardNavigation";
import { deliveryBundleZipFileName, exportDeliveryBundleZip } from "../audio/deliveryBundle";
import { bassStyleLabel } from "../audio/bassVoice";
import { exportMidi, midiFileName } from "../audio/midi";
import { projectAudioAnalysisIdentity } from "../audio/projectAudioAnalysis";
import {
  analyzeExport,
  analyzeStemExports,
  createMixWavBlob,
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
  createEmptyPatternData,
  createAudienceStarterProject,
  defaultCustomDeliveryTarget,
  defaultDrumVelocity,
  deleteProjectSnapshot,
  deliveryTargets,
  deliveryTargetForId,
  drumStepProbability,
  drumStepTimingMs,
  drumStepVelocity,
  drumGroovePresetIds,
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
  maxProjectFileBytes,
  maxProjectArrangementBars,
  maxProjectTitleLength,
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
  normalizeProjectTitle,
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
  projectMasterCeilingDb,
  projectSnapshotSummary,
  projectTimeSignature,
  renameProjectSnapshot,
  resolveMasterCeilingDraft,
  retargetProjectKey,
  restoreProjectSnapshot,
  scalePitches,
  scalePitchNames,
  serializeProjectFile,
  sanitizeProjectTitleInput,
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
  QuickActionRunOutcome,
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
  PatternDnaCard,
  PatternDnaSummary,
  PatternDnaFocusResult,
  LayerStarterId,
  LayerStarterOption,
  LayerStarterResult,
  ListeningPassId,
  ListeningPassItem,
  ListeningPassSummary,
  ListeningPassFocusSummary,
  ListeningPassFocusResult,
  PatternDnaFocusSummary,
  StyleInspectorMetricId,
  StyleInspectorFocusId,
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
  ProductionSnapshotFocusItem,
  ProductionSnapshotMetric,
  ProductionSnapshotSummary,
  ProductionSnapshotFocusSummary,
  ProductionSnapshotFocusResult,
  KeyCompassCardId,
  KeyCompassFocusId,
  KeyCompassFocusItem,
  KeyCompassCard,
  KeyCompassSummary,
  KeyCompassFocusSummary,
  KeyCompassFocusResult,
  GrooveCompassCardId,
  GrooveCompassFocusId,
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
  SessionPassCardId,
  SessionPassCard,
  SessionPassFocusResult,
  SessionPassSummary,
  SnapshotCompareFocusId,
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
  ExportPreflightFocusItem,
  ExportPreflightCard,
  ExportPreflightSummary,
  ExportPreflightFocusSummary,
  ExportPreflightFocusResult,
  WorkflowZoneId,
  WorkspaceMainTabId,
  WorkflowNavigatorItem,
  WorkflowNavigatorJumpResult,
  FirstBeatPathTarget,
  FirstBeatPathStep,
  FirstBeatPathSummary,
  FirstBeatPathJumpResult,
  BeatSpineCardId,
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
  layerStarterPriorityOption,
  projectFileLoadErrorStatus
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
  AudienceRouteBridge,
  AudienceCompletionRouteStrip,
  AudienceSessionReadout,
  DualAudienceReadinessStrip,
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
  createAudienceRouteBridgeSummary,
  createAudienceCompletionRouteRows,
  createDualAudienceReadinessRows,
  createModeSwitchButtonContext,
  createModeSwitchQuickActions,
  createModeSwitchResult,
  createWorkflowSpotlightSummary,
  audienceStarterActionTestIds,
  modeLabel,
  type AudienceStarterFollowupRoute
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
  PatternContrastReadout,
  PatternCompareStrip,
  ProjectSnapshots,
  QuickActionResultStrip,
  QuickActions,
  SnapshotCompare,
  createCommandReferenceRouteReadoutSummary
} from "./workstationShellPanels";
import { WorkspacePageTabs } from "./WorkspacePageTabs";
import { WorkspaceOverview, type OverviewWorkspacePageId } from "./WorkspaceOverview";
import { SettingsDialog } from "./SettingsDialog";
import { useLocalization } from "./localization";
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
  resolveKeyboardCaptureStep,
  resolveKeyboardCapturePlacement,
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
import { resolveLocalDraftWriteGate, shouldCommitLocalDraftClear } from "./localDraftLifecycle";
import { resolveProjectCloseGuard, resolveSaveBeforeCloseDecision } from "./projectCloseGuard";
import {
  resolveProjectReplacementGuard,
  resolveStarterProjectReplacementGuard
} from "./projectReplacementGuard";
import { resolveProjectSaveCompletion, shouldCloseAfterProjectSave } from "./projectSaveCompletion";
import type { ProjectSaveAttempt } from "./projectSaveCompletion";
import {
  bindProjectExportReceipt,
  currentProjectExportReceipt,
  shouldCommitProjectExportResult
} from "./projectExportCompletion";
import { StyleChangeDialog } from "./StyleChangeDialog";
import {
  applyStyleChange,
  createStyleChangePreview,
  type StyleChangePreview
} from "./styleChangePreview";
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
  activeArrangementMuteMapQuickActionLane, activeArrangementTransitionMapQuickActionTransition, activeBassMoveQuickActionTarget, activeBeatPassportQuickActionMetric, activeBeatReadinessQuickActionCheck, activeBeatSpineQuickActionApplyCard, activeBeatSpineQuickActionCard, activeChordMoveQuickActionTarget, activeComposerGuideQuickActionCard, activeDrumMoveQuickActionTarget, activeExportPreflightQuickActionCard, activeFinishChecklistQuickActionCard, activeFirstBeatPathQuickActionStep, activeGrooveCompassQuickActionItem, activeGuideQuickStartBottleneckQuickActionTarget, activeGuideQuickStartQuickActionTarget, activeHandoffPackageCheckQuickActionCard, activeHookReadinessQuickActionCard, activeKeyCompassQuickActionItem, activeLayerStarterQuickActionOption, activeListeningPassQuickActionItem, activeMelodyMoveQuickActionTarget, activeModeFocusQuickActionCard, activePatternDnaQuickActionCard, activeProductionSnapshotQuickActionMetric, activeReviewFixItem, activeSectionLocatorPriorityPad, activeSessionPassQuickActionCard, activeSongFormPriorityMetric, activeStyleInspectorQuickActionItem, activeToplineSpaceQuickActionCard, applySessionBriefStarter, ArrangementArcPads, ArrangementArcPreviewDecision, ArrangementArcPriorityReadout, ArrangementArcResultStrip, arrangementAverageEnergy, arrangementBarsFromBlocks, arrangementBlockCueIndex, arrangementBlockJumpIndex, arrangementBlockMetricIdentity, ArrangementFocusPanel, ArrangementFocusPreviewDecision, ArrangementFocusResultStrip, arrangementLiftNextMoveAction, arrangementMatchesTemplate, ArrangementMovePreviewDecision, ArrangementMovePriorityReadout, arrangementMoveResultAuditionCue, ArrangementMoveResultStrip, ArrangementMuteMap, arrangementMuteMapFocusResultAudition, arrangementMuteMapFocusResultMetric, arrangementMuteMapFocusResultNextCheck, ArrangementMuteMapFocusResultStrip, arrangementMuteMapLaneTone, arrangementMuteMapPriorityNextCheck, arrangementMuteMapPriorityReason, arrangementMuteMapPriorityStatus, arrangementMuteMapSegmentTone, ArrangementTemplateControls, ArrangementTemplatePreviewDecision, ArrangementTemplatePriorityReadout, ArrangementTemplateResultStrip, arrangementTransitionLoopDetail, ArrangementTransitionMap, arrangementTransitionMapFocusResultAudition, arrangementTransitionMapFocusResultMetric, arrangementTransitionMapFocusResultNextCheck, ArrangementTransitionMapFocusResultStrip, arrangementTransitionMapPriorityNextCheck, arrangementTransitionMapPriorityReason, arrangementTransitionMapPriorityStatus, arrangementTransitionMuteLabel, basslinePadLabel, beatBlueprintArrangementLabel, beatBlueprintMasterLabel, beatBlueprintPreviewMetric, BeatBlueprintResultStrip, BeatBlueprints, beatBlueprintStyleLabel, BeatMap, beatMapRouteLabel, beatMapStageForNextMoveAction, beatMapStageIdForNextMoveAction, BeatPassport, beatPassportFocusResultAudition, beatPassportFocusResultMetric, beatPassportFocusResultNextCheck, BeatPassportFocusResultStrip, beatReadinessCardActionId, beatReadinessQuickActionCheck, beatReadinessQuickActionCheckFromChecks, BeatSpine, beatSpineApplyButtonContext, beatSpineApplyResultAudition, beatSpineApplyResultNextCheck, beatSpineApplyResultScope, beatSpineIcon, beatSpineJumpButtonContext, beatSpineJumpResultAudition, beatSpineJumpResultNextCheck, BeatSpineJumpResultStrip, BeatSpineResultStrip, beatSpineTargetLabel, blueprintNextMoveAction, boundedCustomDeliveryText, boundedSessionBriefText, chainExpandNextMoveAction, channelCountLabel, chordDegreeRoleLabel, chordMotionLabel, compactSectionFlow, compactSessionBriefValue, composerActionButtonContext, composerActionFollowupCues, composerActionForStyleGoal, composerActionIcon, composerActionPriority, composerActionQuickActionArea, composerActionQuickActionDetail, composerActionQuickActionGroup, composerActionResultMetricSnapshots, ComposerActionResultStrip, ComposerActions, composerActionsFocus, composerActionSort, composerActionStyleProfile, composerActionTone, composerArrangementAction, composerBassAction, composerDrumAction, composerFinishAction, ComposerGuide, composerGuideFocus, composerGuideFocusActionContext, composerGuideFocusActionLabel, composerGuideFocusCommandDetail, composerGuideFocusResultAudition, composerGuideFocusResultMetric, composerGuideFocusResultNextCheck, ComposerGuideFocusResultStrip, composerGuideFocusTarget, composerHarmonyAction, composerMelodyAction, createArrangementMovePreviewDecision, createArrangementMovePrioritySummary, createArrangementMoveResult, createArrangementMoveResultMetric, createArrangementMuteMapFocusResult, createArrangementMuteMapFocusSummary, createArrangementMuteMapPrioritySummary, createArrangementMuteMapSegments, createArrangementMuteMapSummary, createArrangementPlaybackReadoutSummary, createArrangementTransitionBlocks, createArrangementTransitionLoopTarget, createArrangementTransitionMapFocusResult, createArrangementTransitionMapFocusSummary, createArrangementTransitionMapPrioritySummary, createArrangementTransitionMapSummary, createAudienceSessionActionResult, createBeatBlueprintPreviewCue, createBeatBlueprintPreviewDecision, createBeatBlueprintPreviewSummary, createBeatBlueprintResult, createBeatBlueprintResultMetric, createBeatMapActions, createBeatMapMetrics, createBeatMapStages, createBeatMapSummary, createBeatPassportFocusResult, createBeatPassportFocusSummary, createBeatPassportSummary, createBeatSpineApplyResult, createBeatSpineApplyResultMetric, createBeatSpineJumpResult, createBeatSpineSummary, createComposerActionResult, createComposerActionsSummary, createComposerGuideFocusResult, createComposerGuideFocusSummary, createComposerGuideSummary, audienceSessionModeForRow, createAudienceSessionReadoutSummary, createDeliveryTargetAlignmentPreview, createDeliveryTargetAlignmentResult, createDeliveryTargetAlignmentResultMetric, createEditHistoryEntry, createEditHistoryReadoutSummary, createExportPreflightFocusResult, createExportPreflightFocusSummary, createExportPreflightPriority, createExportPreflightSummary, createFinishChecklistFocusResult, createFinishChecklistFocusSummary, createFinishChecklistPriority, createFinishChecklistSummary, createFirstBeatPathJumpResult, createFirstBeatPathSummary, createGrooveCompassFocusResult, createGrooveCompassFocusSummary, createGrooveCompassSummary, createHandoffExportFormatFocusResult, createHandoffExportFormatPriority, createHandoffExportFormatSummary, createHandoffExportReceipt, createHandoffFileManifest, createHandoffManifestAudit, createHandoffManifestAuditCheck, createHandoffPackageCheckFocusResult, createHandoffPackageCheckFocusSummary, createHandoffPackageCheckPriority, createHandoffPackageCheckSummary, createHandoffPackItems, createHandoffPackRouteSummary, createHandoffPackSendOrderSummary, createHookFixOption, createHookFixResult, createHookFixResultMetric, createHookLoopCueTarget, createHookReadinessFocusResult, createHookReadinessFocusSummary, createHookReadinessPrioritySummary, createHookReadinessSummary, createHookReadinessSummaryForProject, createKeyCompassFocusResult, createKeyCompassFocusSummary, createKeyCompassSummary, createModeFocusDecision, createModeFocusJumpResult, createModeFocusSummary, createNextMoveActions, createNextMoveResult, createPatternPlaybackReadoutSummary, createProductionSnapshotFocusResult, createProductionSnapshotFocusSummary, createProductionSnapshotPriority, createProductionSnapshotSummary, createProjectSafetyReadoutSummary, createReviewFixOption, createReviewFixPreview, createReviewFixResult, createReviewFixResultMetric, createReviewQueueFocusResult, createReviewQueueFocusSummary, createReviewQueuePriority, createReviewQueueSummary, createReviewQueueSummaryForProject, createSectionCueResult, createSectionLocatorCueDecisionSummary, createSectionLocatorPads, createSectionLocatorPrioritySummary, createSelectedBlockEditPreviewDecision, createSelectedBlockEditPrioritySummary, createSelectedBlockEditResult, createSelectedBlockEditResultMetric, createSessionBriefCompassFocusResult, createSessionBriefStarterBrief, createSessionBriefStarterPadOptions, createSessionBriefStarterResult, createSessionBriefStarterResultMetric, createSessionPassFocusResult, createSessionPassSummary, createSnapshotCompareDeferredProjectProfile, createSnapshotCompareProjectProfile, createSnapshotSlotRoleSummary, createSongFormOverviewSummary, createSongFormPrioritySummary, createSongFormSegments, createStructureLensActions, createStructureLensSummary, createStyleGoalCueResult, createSwingFeelResult, createTapTempoReadoutSummary, createToplineFixOption, createToplineFixResult, createToplineFixResultMetric, createToplineLoopCueTarget, createToplineSpaceFocusResult, createToplineSpaceFocusSummary, createToplineSpacePrioritySummary, createToplineSpaceSummary, createToplineSpaceSummaryForProject, createWorkflowNavigatorItems, createWorkflowNavigatorJumpResult, deliveryTargetAlignmentChangedCount, DeliveryTargetAlignmentResultStrip, deliveryTargetArrangementFingerprint, deliveryTargetLengthLabel, deliveryTargetMasterLabel, deliveryTargetMixLabel, deliveryTargetNextMoveAction, DeliveryTargets, deliveryTargetStemLabel, drumFoundationLabel, drumPocketPositionLabel, drumPocketRoleLabel, editHistoryEntryLabel, EditorAuditionResultStrip, emptyHandoffExportReceipt, ExportPreflight, exportPreflightFocusResultAudition, exportPreflightFocusResultMetric, exportPreflightFocusResultNextCheck, ExportPreflightFocusResultStrip, exportPreflightPriorityNextCheck, FinishChecklist, finishChecklistFocusResultAudition, finishChecklistFocusResultMetric, finishChecklistFocusResultNextCheck, FinishChecklistFocusResultStrip, finishChecklistFocusTarget, finishChecklistPriorityNextCheck, firstArrangementSectionIndex, firstBeatPathJumpAuditionCue, firstBeatPathJumpNextCheck, formatExportDuration, fullArrangementNextMoveAction, GrooveCompass, grooveCompassFocusCard, grooveCompassFocusResultAudition, grooveCompassFocusResultMetric, grooveCompassFocusResultNextCheck, GrooveCompassFocusResultStrip, grooveCompassFocusStatusLabel, guideQuickStartCommandDetail, guideQuickStartCompletionBreakdownLabel, guideQuickStartCompletionBreakdownName, guideQuickStartToneRank, handoffExportFormatFocusAudition, handoffExportFormatFocusMetric, handoffExportFormatFocusNextCheck, HandoffExportFormatFocusResultStrip, handoffExportFormatPriorityNextCheck, HandoffPack, handoffPackageCheckFocusResultAudition, handoffPackageCheckFocusResultMetric, handoffPackageCheckFocusResultNextCheck, HandoffPackageCheckFocusResultStrip, handoffPackageCheckPriorityNextCheck, handoffPackSendOrder, hookFixCardLabel, HookFixResultStrip, hookFixScopeLabel, hookFixTargetLabel, hookLoopCueDetail, HookReadiness, hookReadinessFocusResultAudition, hookReadinessFocusResultMetric, hookReadinessFocusResultNextCheck, HookReadinessFocusResultStrip, hookReadinessPriorityNextCheck, hookReadinessPriorityReason, hookReadinessPriorityStatus, InputCaptureResultStrip, isArrangementMovePresetApplied, isDeliveryTargetAligned, isStyleGoalCardId, KeyCompass, keyCompassCadence, keyCompassChordMotion, keyCompassFocusCard, keyCompassFocusResultAudition, keyCompassFocusResultMetric, keyCompassFocusResultNextCheck, KeyCompassFocusResultStrip, keyCompassFocusStatusLabel, keyCompassPitchInKey, keyCompassPitchScaleDegreeLabel, keyCompassPitchSpread, keyCompassScaleDegree, keyCompassScaleDegreeLabel, keyCompassStepSpread, ListeningPass, ListeningPassFocusResultStrip, LocalDraftRecoveryResultStrip, masterFinishNextMoveAction, masterFinishPadLabel, maxProjectSwing, melodyMotifLabel, minProjectSwing, mixPostureLabel, mixReviewArea, mixReviewNextMoveAction, modeFocusCommandDetail, modeFocusDecisionStatus, modeFocusJumpResultAudition, modeFocusJumpResultMetric, modeFocusJumpResultNextCheck, modeFocusStageTarget, NextMove, nextMoveActionPostureMetricSnapshot, nextMoveIcon, nextMoveResultFollowup, nextMoveResultMetricSnapshot, NextMoveResultStrip, nextMoveRouteLabel, normalizePitchNameForCompass, normalizeSessionBriefStarter, normalizeSwingFeelValue, patternChainNextMoveAction, PatternChainPreview, PatternChainPreviewDecision, PatternChainPriorityReadout, PatternChainResultStrip, PatternDna, PatternDnaFocusResultStrip, patternEventTotal, patternFillNextMoveAction, preferredModeFocusCardId, primaryNextMoveAction, ProductionSnapshot, productionSnapshotFocusResultAudition, productionSnapshotFocusResultMetric, productionSnapshotFocusResultNextCheck, ProductionSnapshotFocusResultStrip, productionSnapshotPriorityNextCheck, projectEventTotal, ProjectFileResultStrip, quickActionArrangementBlockMetricSnapshot, quickActionBeatMapMetricSnapshot, quickActionComposerActionAreaLabel, quickActionComposerActionCommandLabel, quickActionComposerActionMetricLabel, quickActionComposerActionMoveLabel, quickActionComposerActionPresetLabel, quickActionComposerActionRouteLabel, quickActionSectionLocatorMetricSnapshot, quickActionSelectedBlockMetricSnapshot, quickActionStructureLensMetricSnapshot, readinessCheckForId, readinessReviewArea, reviewFixItemLabel, ReviewFixPreviewStrip, reviewFixProjectLabel, ReviewFixResultStrip, reviewFixScopeLabel, reviewLayerStarterFix, reviewMixFix, ReviewQueue, reviewQueueFocusLabel, reviewQueueFocusResultAudition, reviewQueueFocusResultMetric, reviewQueueFocusResultNextCheck, ReviewQueueFocusResultStrip, reviewQueueFocusTarget, reviewQueuePriorityNextCheck, reviewToneRank, romanChordLabel, romanDegreeLabel, sameCustomDeliveryTarget, sameSessionBrief, sampleRateLabel, scaleDegreeRoleLabel, SectionCueResultStrip, sectionLocatorActionSection, SectionLocatorCueDecision, sectionLocatorDecisionActionSection, SectionLocatorPads, sectionLocatorPriorityNextCheck, sectionLocatorPriorityReason, sectionLocatorPriorityStatus, sectionLocatorQuickActionSection, sectionLocatorTestId, selectedArrangementMoveQuickActionPreset, selectedBlockEditActionStatus, selectedBlockEditActionTitle, selectedBlockEditAuditionCue, selectedBlockEditBlockLabel, selectedBlockEditDeltaLabel, selectedBlockEditMergeCandidate, selectedBlockEditNextCheck, SelectedBlockEditPreviewDecision, SelectedBlockEditPriorityReadout, SelectedBlockEditResultStrip, selectedBlockQuickActionBlockIndex, selectedBlockQuickActionDescriptor, selectedBlockQuickActionEditAction, selectedBlockQuickActionPattern, selectedBlockQuickActionSection, selectedBlockQuickActionStructuralDeltaLabel, selectedBlockQuickActionTitleAction, selectedChordHarmonicSummary, selectedDrumPocketSummary, SelectedEventDeleteResultStrip, selectedNoteDegreeSummary, sessionBriefChangedFieldCount, sessionBriefCompassDestinationLabel, sessionBriefCompassFocusLabel, sessionBriefCompassFocusResultAudition, sessionBriefCompassFocusResultMetric, sessionBriefCompassFocusResultNextCheck, SessionBriefCompassFocusResultStrip, sessionBriefCompassFocusTarget, sessionBriefFieldLabel, sessionBriefFields, sessionBriefFilledFields, SessionBriefPanel, sessionBriefStarterPadDefinitions, sessionBriefStarterPreview, SessionBriefStarterResultStrip, sessionBriefStatus, sessionPassCommandDetail, sessionPassFocusLabel, sessionPassFocusResultAudition, sessionPassFocusResultMetric, sessionPassFocusResultNextCheck, snapshotNextMoveAction, SongFormOverview, songFormPriorityNextCheck, songFormPriorityReason, songFormPriorityStatus, songFormPriorityTargetSegment, songFormSegmentTone, structureArcSignal, structureHookSignal, StructureLens, structureLensRouteLabel, structureLensSignalById, structureLensSignalForNextMoveAction, structureLensSignalIdForNextMoveAction, structureLensSignalMetricLabel, styleGoalActionQuickActionArea, StyleGoalActionResultStrip, styleGoalCueLabel, styleGoalCueQuickActionGoal, StyleGoalCueResultStrip, styleGoalForComposerActionResult, StyleInspector, StyleInspectorFocusResultStrip, suggestedMasterFinishPad, swingFeelPadDetail, swingFeelPadSwing, toplineFixCardLabel, ToplineFixResultStrip, toplineFixScopeLabel, toplineFixTargetLabel, toplineLoopCueDetail, ToplineSpace, toplineSpaceFocusResultAudition, toplineSpaceFocusResultMetric, toplineSpaceFocusResultNextCheck, ToplineSpaceFocusResultStrip, toplineSpacePriorityNextCheck, toplineSpacePriorityReason, toplineSpacePriorityStatus, UndoRedoResultStrip, uniquePatternSlots, workflowCountLabel, workflowNavigatorJumpAuditionCue, workflowNavigatorJumpMetricValue, workflowNavigatorJumpNextCheck
} from "./workstationAppHelpers";
import { createSnapshotCompareProjectProfileFromAnalysis } from "./workstationAppHelpers";
import { ProjectAudioAnalysisGate } from "./workstationAppHelpers";
import { swingFeelPadLabel } from "./workstationAppHelpers";
import type {
  ArrangementTransitionLoopTarget, BeatBlueprintPreviewCue, BeatBlueprintPreviewDecision, EditHistoryEntry, ExportPreflightPriority, FinishChecklistPriority, GuideQuickStartQuickActionTarget, HandoffExportFormatPriority, HandoffPackageCheckPriority, HookFixAction, HookFixOption, HookFixResult, HookFixResultMetric, HookLoopCueTarget, ProductionSnapshotPriority, ReviewFixAction, ReviewFixOption, ReviewFixPreviewSummary, ReviewFixResult, ReviewFixResultMetric, ReviewQueuePriority, SelectedBlockQuickActionDescriptor, SessionBriefCompassFocusTarget, SessionBriefFieldRefs, StyleGoalCueResult, ToplineFixAction, ToplineFixOption, ToplineFixResult, ToplineFixResultMetric, ToplineLoopCueTarget
} from "./workstationAppHelpers";
import {
  applyQuickActionInputSetupSnapshot, arrangementArcQuickActionPad, arrangementArcQuickActionPadId, arrangementArcQuickActionTextPad, arrangementFocusQuickActionBlockIndex, arrangementFocusQuickActionPreset, arrangementFocusQuickActionPresetId, arrangementFocusQuickActionTextPreset, arrangementMoveQuickActionBlockIndex, arrangementMoveQuickActionPreset, arrangementMoveQuickActionPresetId, arrangementMoveQuickActionTextPreset, arrangementPlaybackReadoutQuickActionHeardIndex, arrangementTemplateQuickActionId, arrangementTemplateQuickActionTarget, arrangementTemplateQuickActionTextTarget, audibleArrangementFollowQuickActionBeforeEditIndex, audibleArrangementFollowQuickActionTargetIndex, audiblePatternFollowQuickActionBeforeEdit, audiblePatternFollowQuickActionTarget, BEAT_SPINE_DETAIL_LABEL_PREFIXES, beatBlueprintForApplyQuickAction, beatBlueprintForPreviewMetricQuickAction, beatBlueprintForPreviewQuickAction, beatBlueprintFromQuickActionText, beatPassportQuickActionMetricId, beatSpineCardLabelFromQuickActionId, beatSpineDestinationLabelFromCardLabel, cloneKeyboardCaptureDefaults, cloneQuickActionInputSetupSnapshot, composerGuideDestinationLabelFromLane, composerGuideLaneLabelFromQuickActionId, createEditorAuditionReadoutSummary, createNextMoveSourceQuickActions, createQuickActionInputSetupResultState, createQuickActionPinnedOptions, createQuickActionPinnedResult, createQuickActionRecentOptions, createQuickActionRecentResult, createQuickActionResult, createQuickActionScopeOptions, createQuickActionScopeResult, createQuickActionSearchHintResult, createQuickActionSearchRecoveryResult, createQuickActionSearchResult, createQuickActionSpotlightSummary, directExportQuickActionFileLabel, directExportQuickActionPosture, directExportQuickActionReadinessLabel, directExportQuickActionReceiptLabel, directExportQuickActionTarget, exportPreflightQuickActionCardId, filterQuickActions, finishChecklistQuickActionCardId, firstBeatPathCommandDetail, firstBeatPathStageDestination, firstBeatPathStageLabelFromQuickActionValue, grooveCompassLaneLabelFromQuickActionId, GUIDE_QUICK_START_DETAIL_LABEL_PREFIXES, handoffExportFormatQuickActionMetricId, handoffExportReceiptItemLabel, handoffNextExportDirectTarget, handoffNextExportReceiptLabel, handoffNextExportTargetItem, isInputSetupQuickAction, isMasterAutomationPadId, isMasterFinishPadId, isMixSnapshotDecisionRecallAction, isSoundSnapshotDecisionRecallAction, keyboardCaptureDefaultSummary, keyboardCapturePitchMapSummary, keyCompassLaneLabelFromQuickActionId, keyRetargetablePatternEventTotal, keyRetargetableProjectEventTotal, keyRetargetOptionSummary, keyRetargetPatternSummary, layerStarterLaneLabelFromQuickActionId, layerStarterOptionForQuickAction, layerStarterQuickActionId, listeningPassQuickActionItemId, masterAutomationQuickActionPad, masterAutomationQuickActionPosture, masterFinishQuickActionPad, masterFinishQuickActionPosture, mixFixQuickActionPreset, mixSnapshotQuickActionPosture, mixSnapshotQuickActionTarget, MODE_FOCUS_DETAIL_LABEL_PREFIXES, modeFocusCardLabelFromQuickActionId, nextMoveQuickActionForProject, nextMoveQuickActionSource, nextMoveQuickActionSourceLabel, nextMoveQuickActionTargetId, nextMoveSourceQuickActionId, normalizeQuickActionPinnedIds, patternChainQuickActionDecisionTarget, patternChainQuickActionId, patternChainQuickActionLabel, patternCloneQuickActionPreset, patternCloneQuickActionRoute, patternCompareDecisionMetricIdentity, patternCompareDecisionQuickActionKind, patternCompareDecisionQuickActionPosture, patternCompareDecisionQuickActionTarget, patternCompareDecisionSelectedBlockPlacement, patternCueSwitchMetricIdentity, patternCueSwitchQuickActionTarget, patternCueSwitchSelectedBlockPlacement, patternDnaDestinationLabelFromLane, patternDnaLaneLabelFromQuickActionId, patternEditQuickActionRoute, patternFillQuickActionPreset, patternSlotFromQuickActionValue, patternStackLaneLabelFromQuickActionId, patternStackOptionForQuickAction, patternStackQuickActionId, patternUseQuickActionTarget, patternUseSelectedBlockPlacement, patternVariationQuickActionPreset, prependQuickActionRecent, productionSnapshotQuickActionMetricId, quickActionArrangementArcMetricSnapshot, quickActionArrangementFocusMetricSnapshot, quickActionArrangementMoveMetricSnapshot, quickActionArrangementMuteLaneSectionPosture, quickActionArrangementMuteMapActionLabel, quickActionArrangementMuteMapDetailParts, quickActionArrangementMuteMapLane, quickActionArrangementMuteMapLaneId, quickActionArrangementMuteMapLaneLabel, quickActionArrangementMuteMapMetricSnapshot, quickActionArrangementMuteMapPosture, quickActionArrangementPlaybackBlockLabel, quickActionArrangementPlaybackReadoutDetailParts, quickActionArrangementPlaybackReadoutMetricSnapshot, quickActionArrangementSelectedBlockLabel, quickActionArrangementTemplateMetricSnapshot, quickActionArrangementTransitionBlockRangeLabel, quickActionArrangementTransitionDetailParts, quickActionArrangementTransitionId, quickActionArrangementTransitionLaneLabel, quickActionArrangementTransitionMapActionLabel, quickActionArrangementTransitionMapMetricSnapshot, quickActionArrangementTransitionMapPosture, quickActionArrangementTransitionMapTransition, quickActionAudibleArrangementFollowMetricSnapshot, quickActionAudiblePatternFollowMetricSnapshot, quickActionBeatBlueprintMetricSnapshot, quickActionBeatBlueprintPreviewActionLabel, quickActionBeatBlueprintPreviewContextLabel, quickActionBeatBlueprintPreviewDetailParts, quickActionBeatBlueprintPreviewMetricSnapshot, quickActionBeatBlueprintPreviewNextCheck, quickActionBeatPassportDetailParts, quickActionBeatPassportLaneLabel, quickActionBeatPassportMetric, quickActionBeatPassportMetricSnapshot, quickActionBeatReadinessDetailParts, quickActionBeatReadinessLaneLabel, quickActionBeatReadinessMetricSnapshot, quickActionBeatSpineCardLabel, quickActionBeatSpineDetailParts, quickActionBeatSpineDetailSegment, quickActionBeatSpineMetricSnapshot, quickActionBeatSpineRouteLabel, quickActionCaptureStepCandidateLabel, quickActionCaptureStepModeLabel, quickActionCaptureStepModeReadoutMetricSnapshot, quickActionCaptureStepSelectedNoteLabel, quickActionComposerActionDetailParts, quickActionComposerActionId, quickActionComposerActionMetricSnapshot, quickActionComposerGuideDetailParts, quickActionComposerGuideLaneLabel, quickActionComposerGuideMetricSnapshot, quickActionDeliveryTargetAlignDetailParts, quickActionDeliveryTargetAlignMetricSnapshot, quickActionDeliveryTargetSelectDetailParts, quickActionDeliveryTargetSelectMetricSnapshot, quickActionDeliveryTargetSelectTarget, quickActionDirectExportDeliveryMetricParts, quickActionDirectExportMetricSnapshot, quickActionDrumKitMetricSnapshot, quickActionDrumKitPadOption, quickActionEditorAuditionReadoutMetricSnapshot, quickActionExportPreflightCard, quickActionExportPreflightDeliveryMetricParts, quickActionExportPreflightDetailParts, quickActionExportPreflightLaneLabel, quickActionExportPreflightMetricSnapshot, quickActionFinishChecklistCard, quickActionFinishChecklistDetailParts, quickActionFinishChecklistLaneLabel, quickActionFinishChecklistMetricSnapshot, quickActionFirstBeatPathDetailParts, quickActionFirstBeatPathMetricSnapshot, quickActionFirstBeatPathStage, quickActionGrooveCompassDetailParts, quickActionGrooveCompassLaneLabel, quickActionGrooveCompassMetricSnapshot, quickActionGuideQuickStartDetailParts, quickActionGuideQuickStartDetailSegment, quickActionGuideQuickStartMetricSnapshot, quickActionGuideQuickStartRouteLabel, quickActionGuideQuickStartTargetLabel, quickActionHandoffExportFormatDetailParts, quickActionHandoffExportFormatLaneLabel, quickActionHandoffExportFormatMetric, quickActionHandoffExportFormatMetricSnapshot, quickActionHandoffExportReceiptDetailParts, quickActionHandoffExportReceiptMetricSnapshot, quickActionHandoffManifestAuditDetailParts, quickActionHandoffManifestAuditMetricSnapshot, quickActionHandoffNextExportDeliveryMetricParts, quickActionHandoffNextExportDetailParts, quickActionHandoffNextExportMetricSnapshot, quickActionHandoffPackageCheckActionLabel, quickActionHandoffPackageCheckCard, quickActionHandoffPackageCheckCardId, quickActionHandoffPackageCheckCardPosture, quickActionHandoffPackageCheckDeliveryMetricParts, quickActionHandoffPackageCheckDetailParts, quickActionHandoffPackageCheckLaneLabel, quickActionHandoffPackageCheckMetricSnapshot, quickActionHandoffPackMetricSnapshot, quickActionHandoffSendOrderDetailParts, quickActionHandoffSendOrderMetricSnapshot, quickActionInputPitchMapLabel, quickActionInputSetupMetricSnapshot, quickActionInputSetupRouteLabel, quickActionInputTargetLabel, quickActionKeyboardCaptureReadoutMetricSnapshot, quickActionKeyCompassDetailParts, quickActionKeyCompassLaneLabel, quickActionKeyCompassMetricSnapshot, quickActionKeyRetargetReadoutMetricSnapshot, quickActionLayerStarterDetailParts, quickActionLayerStarterLaneLabel, quickActionLayerStarterMetricSnapshot, quickActionListeningPassDetailParts, quickActionListeningPassItem, quickActionListeningPassLaneLabel, quickActionListeningPassMetricSnapshot, quickActionLocalDraftActionLabel, quickActionLocalDraftMetricLabel, quickActionLocalDraftMetricSnapshot, quickActionLocalDraftNextCheck, quickActionLocalDraftSafetyLabel, quickActionLoopScopeDetailParts, quickActionLoopScopeMetricSnapshot, quickActionMasterAutomationActionLabel, quickActionMasterAutomationContextLabel, quickActionMasterAutomationMetricSnapshot, quickActionMasterAutomationMetricValue, quickActionMasterAutomationNextCheck, quickActionMasterAutomationPadOption, quickActionMasterAutomationProjectMetricParts, quickActionMasterAutomationTargetId, quickActionMasterFinishActionLabel, quickActionMasterFinishContextLabel, quickActionMasterFinishMetricSnapshot, quickActionMasterFinishMetricValue, quickActionMasterFinishNextCheck, quickActionMasterFinishPadOption, quickActionMasterFinishProjectMetricParts, quickActionMasterFinishTargetId, quickActionMatchesQuery, quickActionMatchesScope, quickActionMetronomeReadoutDetailParts, quickActionMetronomeReadoutMetricSnapshot, quickActionMidiInputReadoutMetricSnapshot, quickActionMidiInputSupportLabel, quickActionMixBalanceActionLabel, quickActionMixBalanceChannelPosture, quickActionMixBalanceContextLabel, quickActionMixBalanceDetailParts, quickActionMixBalanceMetricSnapshot, quickActionMixBalanceMetricValue, quickActionMixBalanceNextCheck, quickActionMixBalancePadOption, quickActionMixBalanceProjectMetricParts, quickActionMixSnapshotActionLabel, quickActionMixSnapshotContextLabel, quickActionMixSnapshotDetailParts, quickActionMixSnapshotMasterPosture, quickActionMixSnapshotMetricLabel, quickActionMixSnapshotMetricSnapshot, quickActionMixSnapshotMetricValue, quickActionMixSnapshotNextCheck, quickActionMixSnapshotProjectMetricParts, quickActionMixSnapshotResultTargetId, quickActionMixSnapshotTargetLabel, quickActionModeFocusCardLabel, quickActionModeFocusDetailParts, quickActionModeFocusDetailSegment, quickActionModeFocusMetricSnapshot, quickActionModeFocusRouteLabel, quickActionPatternChainMetricSnapshot, quickActionPatternCloneMetricSnapshot, quickActionPatternCompareDecisionMetricSnapshot, quickActionPatternCueSwitchMetricSnapshot, quickActionPatternDnaDetailParts, quickActionPatternDnaLaneLabel, quickActionPatternDnaMetricSnapshot, quickActionPatternEditMetricSnapshot, quickActionPatternFillMetricSnapshot, quickActionPatternPlaybackReadoutDetailParts, quickActionPatternPlaybackReadoutMetricSnapshot, quickActionPatternStackDetailParts, quickActionPatternStackLaneLabel, quickActionPatternStackMetricSnapshot, quickActionPatternUseMetricSnapshot, quickActionPatternVariationMetricSnapshot, quickActionPinnedResultTarget, quickActionProductionSnapshotDetailParts, quickActionProductionSnapshotLaneLabel, quickActionProductionSnapshotMetric, quickActionProductionSnapshotMetricSnapshot, quickActionProjectFileActionLabel, quickActionProjectFileMetricLabel, quickActionProjectFileMetricSnapshot, quickActionProjectFileNextCheck, quickActionProjectFileSafetyLabel, quickActionProjectSafetyMetricSnapshot, quickActionProjectSafetyNextCheck, quickActionProjectSnapshotActionLabel, quickActionProjectSnapshotMetricLabel, quickActionProjectSnapshotMetricSnapshot, quickActionProjectSnapshotNextCheck, quickActionProjectSnapshotSafetyLabel, quickActionRecentResultTarget, quickActionReferenceAlignmentCard, quickActionReferenceAlignmentCardId, quickActionReferenceAlignmentDetailParts, quickActionReferenceAlignmentLaneLabel, quickActionReferenceAlignmentMetricSnapshot, quickActionResultFollowup, quickActionResultMetricSnapshot, quickActionReviewFixActionLabel, quickActionReviewFixBeatReadinessPosture, quickActionReviewFixDestinationLabel, quickActionReviewFixDetailParts, quickActionReviewFixFallbackScope, quickActionReviewFixFollowup, quickActionReviewFixImpactLabel, quickActionReviewFixItem, quickActionReviewFixLaneLabel, quickActionReviewFixMetricSnapshot, quickActionReviewFixQueuePosture, quickActionReviewFixTargetId, quickActionReviewQueueDetailParts, quickActionReviewQueueItem, quickActionReviewQueueLaneLabel, quickActionReviewQueueMetricSnapshot, quickActionScopeDefinitions, quickActionScopeLabel, quickActionSearchTokens, quickActionSelectedEventCommandLabel, quickActionSelectedEventDetailParts, quickActionSelectedEventLaneLabel, quickActionSelectedEventMetricLabel, quickActionSelectedEventMetricSnapshot, quickActionSelectedEventNextCheck, quickActionSelectedEventType, quickActionSessionBriefCompassCard, quickActionSessionBriefCompassCardId, quickActionSessionBriefCompassDetailParts, quickActionSessionBriefCompassLaneLabel, quickActionSessionBriefCompassMetricSnapshot, quickActionSessionBriefStarterDetailParts, quickActionSessionBriefStarterFieldPosture, quickActionSessionBriefStarterMetricSnapshot, quickActionSessionBriefStarterPad, quickActionSessionPassDetailParts, quickActionSessionPassDetailSegment, quickActionSessionPassLabel, quickActionSessionPassMetricSnapshot, quickActionSessionPassRouteLabel, quickActionSongFormPriorityAudition, quickActionSongFormPriorityBarRangeLabel, quickActionSongFormPriorityDetailParts, quickActionSongFormPriorityMetricLabel, quickActionSongFormPriorityMetricSnapshot, quickActionSongFormPriorityPosture, quickActionSongFormPriorityTargetLabel, quickActionSoundActionLabel, quickActionSoundDecisionContextLabel, quickActionSoundDecisionDetailParts, quickActionSoundDecisionMetricSnapshot, quickActionSoundDecisionNextCheck, quickActionSoundDesignPosture, quickActionSoundFocusMetricSnapshot, quickActionSoundFocusPadOption, quickActionSoundMetricValue, quickActionSoundPresetMetricSnapshot, quickActionSoundPresetTarget, quickActionSoundPresetTargetFromText, quickActionSoundProjectMetricParts, quickActionSpaceFxActionLabel, quickActionSpaceFxContextLabel, quickActionSpaceFxDetailParts, quickActionSpaceFxMetricSnapshot, quickActionSpaceFxMetricValue, quickActionSpaceFxNextCheck, quickActionSpaceFxPadOption, quickActionSpaceFxProjectMetricParts, quickActionSpaceFxSendPosture, quickActionStemAuditionActionLabel, quickActionStemAuditionContextLabel, quickActionStemAuditionDetailParts, quickActionStemAuditionMetricSnapshot, quickActionStemAuditionMetricValue, quickActionStemAuditionMixerPosture, quickActionStemAuditionNextCheck, quickActionStemAuditionPadOption, quickActionStemAuditionProjectMetricParts, quickActionStemAuditionStatusLabel, quickActionStemAuditionTargetLabel, quickActionStyleDirectionReadoutDetailParts, quickActionStyleDirectionReadoutMetricSnapshot, quickActionStyleInspectorActionLabel, quickActionStyleInspectorDensityPosture, quickActionStyleInspectorDetailParts, quickActionStyleInspectorFocusId, quickActionStyleInspectorGoalPosture, quickActionStyleInspectorItem, quickActionStyleInspectorItems, quickActionStyleInspectorLaneLabel, quickActionStyleInspectorMetricSnapshot, quickActionSwingFeelReadoutMetricSnapshot, quickActionTapTempoReadoutDetailParts, quickActionTapTempoReadoutMetricSnapshot, quickActionTempoNudgeReadoutMetricSnapshot, quickActionTimbreCheckMetricSnapshot, quickActionTransitionLoopActionLabel, quickActionTransitionLoopMetricSnapshot, quickActionTransportPositionDetailParts, quickActionTransportPositionMetricSnapshot, quickActionUndoRedoActionLabel, quickActionUndoRedoEditLabel, quickActionUndoRedoMetricLabel, quickActionUndoRedoMetricSnapshot, quickActionUndoRedoNextCheck, quickActionWorkflowNavigatorContext, quickActionWorkflowNavigatorFollowup, quickActionWorkflowNavigatorMetricSnapshot, quickActionWorkflowSpotlightContext, quickActionWorkflowSpotlightFollowup, quickActionWorkflowSpotlightMetricSnapshot, referenceAlignmentDestinationLabel, reviewQueueQuickActionItemId, SESSION_PASS_DETAIL_LABEL_PREFIXES, sessionPassLabelFromQuickActionId, soundPresetTargetFromQuickActionId, soundSnapshotQuickActionPosture, soundSnapshotQuickActionTarget, styleDirectionCurrentSummary, styleDirectionPatternSummary, styleDirectionTargetSummary, swingFeelRouteSummary, tempoNudgeRouteSummary, transportLoopLabelFromActionDetail, workflowNavigatorZoneFromQuickAction
} from "./workstationAppQuickActions";
import {
  beatPassportRouteLabel,
  beatReadinessRouteLabel,
  composerGuideRouteLabel,
  drumKitRouteLabel,
  exportPreflightRouteLabel,
  finishChecklistRouteLabel,
  grooveCompassRouteLabel,
  hookReadinessRouteLabel,
  keyCompassRouteLabel,
  listeningPassRouteLabel,
  masterAutomationRouteLabel,
  masterFinishRouteLabel,
  mixBalanceRouteLabel,
  mixSnapshotRouteLabel,
  productionSnapshotRouteLabel,
  reviewQueueRouteLabel,
  referenceAlignmentRouteLabel,
  sessionPassRouteLabel,
  soundFocusRouteLabel,
  soundPresetRouteLabel,
  spaceFxRouteLabel,
  stemAuditionRouteLabel,
  toplineSpaceRouteLabel,
  workflowNavigatorRouteLabel,
  workflowSpotlightRouteLabel
} from "./workstationAppQuickActions";
import type {
  EditorAuditionReadoutSummary, MixSnapshotResultTargetId, NextMoveQuickActionSource, PatternEditQuickActionRoute, QuickActionInputSetupResultState, QuickActionInputSetupSnapshot, QuickActionSelectedEventType, SoundSnapshotQuickActionTarget
} from "./workstationAppQuickActions";
import { materializeWhenActive } from "./workstationAppQuickActionPalette";
import { useProjectAudioAnalysis } from "./useProjectAudioAnalysis";
import { useSavedSnapshotAudioAnalyses } from "./useSavedSnapshotAudioAnalyses";
import {
  projectAudioAnalysisCommitEnabledForZone,
  projectAudioAnalysisRetryZone
} from "./projectAudioAnalysisCommitGate";
import {
  applyArrangementArcPadToProject, applyDrumKitPadToProject, applyMasterFinishPadToProject, applyMixBalancePadToMixer, applyMixFixToProject, applySoundFocusPadToSound, applySpaceFxPadToMixer, applyStemAuditionPadToMixer, arrangedPatternData, arrangementArcChangedCount, arrangementArcChangedFieldCount, arrangementArcPointForIndex, arrangementArcPreview, arrangementArcPreviewEnergyLabel, arrangementArcPreviewMuteLabel, arrangementArcPreviewPatternLabel, arrangementArcPreviewSectionLabel, arrangementBlockRoleLabel, arrangementBlocksTotalBars, arrangementFocusChangedFieldCount, arrangementFocusPreviewMuteLabel, arrangementReadinessCheck, arrangementStartBar, arrangementTemplateChangedBlockCount, arrangementTemplateChangedFieldCount, arrangementTemplatePreviewSectionLabel, averageUnitVelocity, bassReadinessCheck, bassStyleRoleLabel, beatReadinessFocusResultAudition, beatReadinessFocusResultMetric, beatReadinessFocusResultNextCheck, clampMixFixVolume, cloneMixerChannels, cloneSoundDesign, compactMixDb, compactUnitPercent, createArrangementArcPadOptions, createArrangementArcPreviewDecision, createArrangementArcPreviewSummary, createArrangementArcPrioritySummary, createArrangementArcResult, createArrangementArcResultMetric, createArrangementFocusPreviewDecision, createArrangementFocusPreviewSummary, createArrangementFocusPrioritySummary, createArrangementFocusResult, createArrangementFocusResultMetric, createArrangementFocusSummary, createArrangementTemplatePreviewDecision, createArrangementTemplatePreviewSummary, createArrangementTemplatePrioritySummary, createArrangementTemplateResult, createArrangementTemplateResultMetric, createBeatReadinessChecks, createBeatReadinessFocusResult, createDrumKitPadOptions, createDrumKitPreviewSummary, createDrumKitResult, createDrumKitResultMetric, createLayerStarterOption, createLayerStarterOptions, createListeningPassFocusResult, createListeningPassFocusSummary, createListeningPassSummary, createMasterAutomationPadOptions, createMasterAutomationPreviewSummary, createMasterAutomationResult, createMasterAutomationResultMetric, createMasterFinishPadOptions, createMasterFinishPreviewSummary, createMasterFinishResult, createMasterFinishResultMetric, createMasterOutputRoleSummary, createMixBalancePadOptions, createMixBalancePreviewSummary, createMixBalanceResult, createMixBalanceResultMetric, createMixCoachChecks, createMixCoachFocusResult, createMixCoachFocusSummary, createMixFixActions, createMixFixPreviewSummary, createMixFixResult, createMixFixResultMetric, createMixSnapshot, createPatternChainPreviewDecision, createPatternChainPreviewSummary, createPatternChainPrioritySummary, createPatternChainResult, createPatternChainResultMetric, createPatternCompareDecisionSummary, createPatternCompareResult, createPatternCompareResultMetric, createPatternCompareSummaries, createPatternContrastSummary, createPatternDnaFocusResult, createPatternDnaFocusSummary, createPatternDnaSummary, createPatternDynamicsCard, createSoundFocusPadOptions, createSoundFocusPreviewSummary, createSoundFocusResult, createSoundFocusResultMetric, createSoundPresetPreviewSummary, createSoundPresetResult, createSoundPresetResultMetric, createSoundSnapshot, createSoundSnapshotComparison, createSoundTimbreCheckSummary, createSpaceFxPadOptions, createSpaceFxPreviewSummary, createSpaceFxResult, createSpaceFxResultMetric, createStemAuditionDecisionSummary, createStemAuditionPadOptions, createStemAuditionReadoutSummary, createStyleGoalCard, createStyleGoalCards, createStyleInspectorFocusResult, createStyleInspectorFocusSummary, createStyleInspectorSummary, createTransportPositionReadoutSummary, defaultSoundPresetPreview, drumHitCount, drumKitClapLabel, drumKitHatLabel, drumKitKickLabel, drumKitMixerChangedControlCount, drumKitPadChangedCount, drumKitPadPreview, drumKitPreviewDrumLabel, drumKitPreviewRackLabel, drumKitRackLabel, drumKitSoundParameters, drumPatternVelocityValues, drumReadinessCheck, emptySoundSnapshotMetrics, exportDynamicsCheck, exportReadinessCheck, harmonyReadinessCheck, isStemAuditionPadActive, limiterCheck, listeningPassFocusLabel, listeningPassFocusResultAudition, listeningPassFocusResultMetric, listeningPassFocusResultNextCheck, lowEndBlendCheck, lowEndDeltaDb, masterAutomationAuditionCue, masterAutomationChangedCount, masterAutomationEventCountLabel, masterAutomationEventSignature, masterAutomationPresetLabel, masterAutomationPreview, masterAutomationRangeLabel, masterFinishChangedCount, masterFinishPreview, masterHeadroomCheck, masterOutputRoleLabel, melodyStyleRoleLabel, mixBalanceChangedControlCount, mixBalanceChannelPosture, mixBalancePreview, mixBalancePreviewChannelLabel, mixBalancePreviewPostureLabel, mixCoachFocusCheck, mixCoachFocusResultAudition, mixCoachFocusResultMetric, mixCoachFocusResultNextCheck, mixCoachSummary, mixerChannelRoleLabel, mixerChannelRoleSummary, mixerTrackVolumeDb, mixFixAuditionCue, mixFixChangedCount, mixFixControlPosture, mixFixExportPosture, mixFixHeadroomPosture, mixFixLowEndPosture, mixFixNextCheck, mixFixPresetLabel, mixFixScopeLabel, mixFixStemPosture, mixSnapshotCapturedAtLabel, mixSnapshotScore, mixSnapshotStatusLabel, nudgeMixFixVolume, patternChainChangedBlockCount, patternChainChangedFieldCount, patternChainPreviewEnergyLabel, patternChainPreviewSectionLabel, patternChainResultSequenceLabel, patternDnaFocusResultAudition, patternDnaFocusResultMetric, patternDnaFocusResultNextCheck, patternVariationSignals, roughStemVolumeTarget, sameArrangementBlockPosture, sameMixerChannel, sameMixerChannels, sameSoundDesign, selectedArrangementBlockRoleSummary, soundFocusBassLabel, soundFocusChangedParameterLabel, soundFocusChangedParameters, soundFocusChordLabel, soundFocusDrumLabel, soundFocusDuckLabel, soundFocusGroupMoveCount, soundFocusParameterLabel, soundFocusParameters, soundFocusPreview, soundFocusPreviewParameterLabel, soundFocusSynthLabel, soundPresetChangedMoveCount, soundPresetToneLabel, soundSnapshotComparisonMetric, soundSnapshotComparisonMetrics, soundSnapshotScore, soundSnapshotSpread, soundTimbreAverage, soundTimbreLeanLabel, soundTimbreMetricTone, soundTimbreNextCheck, spaceFxChangedSendCount, spaceFxPreview, spaceFxTrackPosture, stemAuditionDecisionFromPad, stemAuditionPreview, stemBalanceCheck, styleDensityLabel, styleGoalCountLabel, styleGoalPriorityLabel, styleInspectorFocusResultAudition, styleInspectorFocusResultDetail, styleInspectorFocusResultMetric, styleInspectorFocusResultNextCheck, styleInspectorFocusResultTitle, styleInspectorFocusResultTone, suggestedArrangementFocusPreset, suggestedMasterAutomationPad, transportLoopLabel, transportLoopStatus, usedPatternSlots, velocityLayerLabel
} from "./workstationAppDerivations";
import { createPatternContrastRoleMapSummary, createPatternContrastSectionFitSummary } from "./workstationAppDerivations";
import type {
  SoundTimbreScore
} from "./workstationAppDerivations";
import type { StudioToneBaseline, StudioToneBaselineResult, StudioToneResetResult } from "./studioToneTools";
import {
  createCapturedStudioToneBaseline,
  createStudioToneBaseline,
  createStudioToneBaselineResult,
  createStudioToneDriftSummary,
  createStudioToneResetResult
} from "./studioToneTools";

type QuickActionGraphFactory = typeof import("./workstationAppQuickActionGraph")["createQuickActions"];

const nativeRecoveryDebounceMs = 750;

function workspaceActivityMode(visible: boolean): "visible" | "hidden" {
  return typeof document === "undefined" || visible ? "visible" : "hidden";
}

type ComposeWorkspacePageId = "drums" | "notes" | "instruments";
type ArrangeWorkspacePageId = "timeline" | "structure";
type MixWorkspacePageId = "mixer" | "master";
type DeliverWorkspacePageId = "exports" | "checks";

type MetadataDraftSnapshot =
  | { kind: "title"; value: string }
  | { field: keyof SessionBrief; kind: "session-brief"; value: string };

type WorkspaceRouteTargetId =
  | "transport"
  | "compose"
  | "notes"
  | "sound"
  | "arrange"
  | "arrange-structure"
  | "arrange-mute-map"
  | "mix"
  | "master"
  | "deliver";
type ScrollTargetResolver = HTMLElement | null | (() => HTMLElement | null);

function ProjectTitleInput({
  authoritativeRevision,
  onCommit,
  title
}: {
  authoritativeRevision: number;
  onCommit: (title: string) => void;
  title: string;
}): ReactElement {
  const [draft, setDraft] = useState(title);

  useEffect(() => {
    setDraft(title);
  }, [authoritativeRevision, title]);

  const commitDraft = (value: string): void => {
    const normalized = normalizeProjectTitle(value);
    setDraft(normalized);
    startTransition(() => onCommit(normalized));
  };

  return (
    <input
      data-testid="project-title-input"
      type="text"
      maxLength={maxProjectTitleLength * 2}
      value={draft}
      onChange={(event) => {
        const nextTitle = sanitizeProjectTitleInput(event.target.value);
        setDraft(nextTitle);
      }}
      onBlur={(event) => commitDraft(event.currentTarget.value)}
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
          commitDraft(event.currentTarget.value);
        }
      }}
    />
  );
}

export function App(): ReactElement {
  const { locale, t } = useLocalization();
  const [project, setProject] = useState<ProjectState>(starterProject);
  const [undoStack, setUndoStack] = useState<EditHistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<EditHistoryEntry[]>([]);
  const [metadataDraftRevision, setMetadataDraftRevision] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMixPreviewing, setIsMixPreviewing] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("arrangement");
  const [transportLoopScope, setTransportLoopScope] = useState<TransportLoopScope>("arrangement");
  const [playbackPosition, setPlaybackPosition] = useState<PlaybackSnapshot | null>(null);
  const [selectedNote, setSelectedNote] = useState<SelectedNote | null>(null);
  const [noteClipboard, setNoteClipboard] = useState<NoteClipboard | null>(null);
  const [keyboardCaptureEnabled, setKeyboardCaptureEnabled] = useState(false);
  const [captureIdeasOpen, setCaptureIdeasOpen] = useState(false);
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
  const [soundDesignOpen, setSoundDesignOpen] = useState(false);
  const [harmonyMovesOpen, setHarmonyMovesOpen] = useState(false);
  const [arrangementToolsOpen, setArrangementToolsOpen] = useState(false);
  const [blockMovesOpen, setBlockMovesOpen] = useState(false);
  const [mixMovesOpen, setMixMovesOpen] = useState(false);
  const [mixReviewOpen, setMixReviewOpen] = useState(false);
  const [channelProcessingOpen, setChannelProcessingOpen] = useState<Record<string, boolean>>({});
  const [masterPolishOpen, setMasterPolishOpen] = useState(false);
  const [masterReviewOpen, setMasterReviewOpen] = useState(false);
  const [masterReviewQueueOpen, setMasterReviewQueueOpen] = useState(false);
  const [masterMixCoachOpen, setMasterMixCoachOpen] = useState(false);
  const [transportSessionOpen, setTransportSessionOpen] = useState(false);
  const [deliveryStatusOpen, setDeliveryStatusOpen] = useState(false);
  const [deliveryAuditOpen, setDeliveryAuditOpen] = useState(false);
  const [masterCeilingDraft, setMasterCeilingDraft] = useState(() => starterProject.masterCeilingDb.toFixed(1));
  const [masterCeilingEditing, setMasterCeilingEditing] = useState(false);
  const [selectedArrangementIndex, setSelectedArrangementIndex] = useState(0);
  const [arrangementBlockClipboard, setArrangementBlockClipboard] = useState<ArrangementBlockClipboard | null>(null);
  const [splitAfterBars, setSplitAfterBars] = useState(1);
  const [snapshotNameDrafts, setSnapshotNameDrafts] = useState<Record<string, string>>({});
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const quickActionSessionRef = useRef<QuickAction[] | null>(null);
  const [quickActionGraphFactory, setQuickActionGraphFactory] = useState<QuickActionGraphFactory | null>(null);
  const [quickActionGraphLoadError, setQuickActionGraphLoadError] = useState<string | null>(null);
  const [quickActionGraphLoadAttempt, setQuickActionGraphLoadAttempt] = useState(0);
  const [commandReferenceOpen, setCommandReferenceOpen] = useState(false);
  const modalReturnFocusRef = useRef<HTMLElement | null>(null);
  const [guidanceCenterOpen, setGuidanceCenterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeWorkspaceZone, setActiveWorkspaceZone] = useState<WorkspaceMainTabId>("compose");
  const [activeOverviewWorkspacePage, setActiveOverviewWorkspacePage] = useState<OverviewWorkspacePageId>("snapshot");
  const [activeComposeWorkspacePage, setActiveComposeWorkspacePage] = useState<ComposeWorkspacePageId>("drums");
  const [activeArrangeWorkspacePage, setActiveArrangeWorkspacePage] = useState<ArrangeWorkspacePageId>("timeline");
  const [activeMixWorkspacePage, setActiveMixWorkspacePage] = useState<MixWorkspacePageId>("mixer");
  const [activeDeliverWorkspacePage, setActiveDeliverWorkspacePage] = useState<DeliverWorkspacePageId>("exports");
  const [launchpadOpen, setLaunchpadOpen] = useState(true);
  const [styleChangePreview, setStyleChangePreview] = useState<StyleChangePreview | null>(null);
  const [workspaceCommandDockVisible, setWorkspaceCommandDockVisible] = useState(true);
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
  const [audienceSessionActionResult, setAudienceSessionActionResult] = useState<AudienceSessionActionResult | null>(null);
  const [audienceStarterResult, setAudienceStarterResult] = useState<QuickActionResult | null>(null);
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
  const [studioToneBaseline, setStudioToneBaseline] = useState<StudioToneBaseline>(() =>
    createStudioToneBaseline(starterProject.sound)
  );
  const [studioToneBaselineResult, setStudioToneBaselineResult] = useState<StudioToneBaselineResult | null>(null);
  const [studioToneResetResult, setStudioToneResetResult] = useState<StudioToneResetResult | null>(null);
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
  const [handoffExportReceiptProject, setHandoffExportReceiptProject] = useState<ProjectState | null>(null);
  const [projectStatus, setProjectStatus] = useState("Editable 8-bar foundation");
  const [projectFileLabel, setProjectFileLabel] = useState<string | null>(null);
  const [projectHasUnsavedChanges, setProjectHasUnsavedChangesState] = useState(false);
  const [projectFileResult, setProjectFileResult] = useState<ProjectFileResult | null>(null);
  const [localDraftRecoveryResult, setLocalDraftRecoveryResult] = useState<LocalDraftRecoveryResult | null>(null);
  const [tapTempo, setTapTempo] = useState<TapTempoState>({ taps: 0, bpm: null, applied: true });
  const [localDraftRecovery, setLocalDraftRecoveryState] = useState<LocalDraftRecovery | null>(() => readLocalDraftRecovery());
  const [localDraftRecoveryDeferred, setLocalDraftRecoveryDeferred] = useState(false);
  const [localDraftSavedAt, setLocalDraftSavedAt] = useState<string | null>(localDraftRecovery?.savedAt ?? null);
  const [localDraftWriteArmed, setLocalDraftWriteArmed] = useState(false);
  const projectRef = useRef<ProjectState>(starterProject);
  const undoStackRef = useRef<EditHistoryEntry[]>([]);
  const redoStackRef = useRef<EditHistoryEntry[]>([]);
  const metadataDraftRevisionRef = useRef(0);
  const metadataBlurCommitSuppressedRef = useRef(false);
  const metadataReplacementDraftDirtyRef = useRef(false);
  const pendingMetadataDraftRef = useRef<MetadataDraftSnapshot | null>(null);
  const projectHasUnsavedChangesRef = useRef(false);
  const localDraftRecoveryRef = useRef(localDraftRecovery);
  const projectSaveRequestIdRef = useRef(0);
  const projectExportRequestIdRef = useRef(0);
  const fixedFeedbackIntentEpochRef = useRef(0);
  const activeQuickActionFeedbackIntentEpochRef = useRef<number | null>(null);
  const handoffExportReceiptRef = useRef<HandoffExportReceipt | null>(null);
  const handoffExportReceiptProjectRef = useRef<ProjectState | null>(null);
  const tapTempoTimesRef = useRef<number[]>([]);
  const tapTempoCommitTimerRef = useRef<number | null>(null);
  const nativeRecoveryWriteTimerRef = useRef<number | null>(null);
  const localDraftClearRequestIdRef = useRef(0);
  const localDraftReadyRef = useRef(false);
  const localDraftSkipNextWriteRef = useRef(false);
  const selectedEventDeleteSelectionGuardRef = useRef(false);
  const activeWorkspaceZoneRef = useRef<WorkspaceMainTabId>(activeWorkspaceZone);
  const activeComposeWorkspacePageRef = useRef<ComposeWorkspacePageId>(activeComposeWorkspacePage);
  const activeArrangeWorkspacePageRef = useRef<ArrangeWorkspacePageId>(activeArrangeWorkspacePage);
  const activeMixWorkspacePageRef = useRef<MixWorkspacePageId>(activeMixWorkspacePage);
  const activeDeliverWorkspacePageRef = useRef<DeliverWorkspacePageId>(activeDeliverWorkspacePage);
  const modeAwareToolPanelsModeRef = useRef<ProjectState["mode"] | null>(null);
  const studioExpandedWorkspaceZonesRef = useRef<Set<WorkflowZoneId>>(new Set());
  const controllerRef = useRef<PlaybackController | null>(null);
  const playbackSessionRef = useRef(0);
  const activePlaybackModeRef = useRef<PlaybackMode | null>(null);
  const playbackPositionRef = useRef<PlaybackSnapshot | null>(null);
  const auditionControllerRef = useRef<PlaybackController | null>(null);
  const mixPreviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const mixPreviewUrlRef = useRef<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const styleSelectRef = useRef<HTMLSelectElement | null>(null);
  const styleChangeReturnFocusRef = useRef<HTMLElement | null>(null);
  const styleChangeRequestResolveRef = useRef<((outcome: QuickActionRunOutcome) => void) | null>(null);
  const guidanceCenterRef = useRef<HTMLDetailsElement | null>(null);
  const styleInspectorRef = useRef<HTMLElement | null>(null);
  const beatPassportPanelRef = useRef<HTMLElement | null>(null);
  const productionSnapshotPanelRef = useRef<HTMLElement | null>(null);
  const finishChecklistPanelRef = useRef<HTMLElement | null>(null);
  const reviewQueuePanelRef = useRef<HTMLElement | null>(null);
  const sessionPassPanelRef = useRef<HTMLElement | null>(null);
  const composerGuidePanelRef = useRef<HTMLElement | null>(null);
  const referenceAlignmentPanelRef = useRef<HTMLElement | null>(null);
  const keyCompassPanelRef = useRef<HTMLElement | null>(null);
  const grooveCompassPanelRef = useRef<HTMLElement | null>(null);
  const beatReadinessPanelRef = useRef<HTMLElement | null>(null);
  const beatMapPanelRef = useRef<HTMLElement | null>(null);
  const structureLensPanelRef = useRef<HTMLElement | null>(null);
  const nextMovePanelRef = useRef<HTMLElement | null>(null);
  const hookReadinessPanelRef = useRef<HTMLElement | null>(null);
  const toplineSpacePanelRef = useRef<HTMLElement | null>(null);
  const listeningPassPanelRef = useRef<HTMLElement | null>(null);
  const workflowNavigatorPanelRef = useRef<HTMLElement | null>(null);
  const workspaceTargetRevealFrameRef = useRef<number | null>(null);
  const transportPanelRef = useRef<HTMLElement | null>(null);
  const composePanelRef = useRef<HTMLElement | null>(null);
  const notePanelRef = useRef<HTMLElement | null>(null);
  const patternTabRefs = useRef<Record<PatternSlot, HTMLButtonElement | null>>({ A: null, B: null, C: null });
  const soundPanelRef = useRef<HTMLElement | null>(null);
  const arrangePanelRef = useRef<HTMLElement | null>(null);
  const arrangeStructurePanelRef = useRef<HTMLElement | null>(null);
  const arrangementMuteMapPanelRef = useRef<HTMLElement | null>(null);
  const mixPanelRef = useRef<HTMLElement | null>(null);
  const deliverPanelRef = useRef<HTMLElement | null>(null);
  const masterPanelRef = useRef<HTMLElement | null>(null);
  const beatBlueprintPanelRef = useRef<HTMLElement | null>(null);
  const sessionBriefArtistRef = useRef<HTMLInputElement | null>(null);
  const sessionBriefVibeRef = useRef<HTMLInputElement | null>(null);
  const sessionBriefReferenceRef = useRef<HTMLInputElement | null>(null);
  const sessionBriefNotesRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(
    () => () => {
      if (workspaceTargetRevealFrameRef.current !== null) {
        window.cancelAnimationFrame(workspaceTargetRevealFrameRef.current);
      }
    },
    []
  );
  activeWorkspaceZoneRef.current = activeWorkspaceZone;
  activeComposeWorkspacePageRef.current = activeComposeWorkspacePage;
  activeArrangeWorkspacePageRef.current = activeArrangeWorkspacePage;
  activeMixWorkspacePageRef.current = activeMixWorkspacePage;
  activeDeliverWorkspacePageRef.current = activeDeliverWorkspacePage;
  const style = getStyle(project);
  const deliveryTarget = activeDeliveryTarget(project);
  const currentPattern = activePattern(project);
  const projectAudioAnalysis = useProjectAudioAnalysis(
    project,
    projectAudioAnalysisCommitEnabledForZone(activeWorkspaceZone === "overview" ? "mix" : activeWorkspaceZone)
  );
  const exactProjectAudioAnalysisReady = projectAudioAnalysis.status === "ready";
  const exportAnalysis = projectAudioAnalysis.mix;
  const stemAnalyses = projectAudioAnalysis.stems;
  const currentHandoffExportReceipt = currentProjectExportReceipt(
    handoffExportReceipt && handoffExportReceiptProject
      ? bindProjectExportReceipt(handoffExportReceiptProject, handoffExportReceipt)
      : null,
    project
  );
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
    () => createHandoffPackageCheckSummary(project, exportAnalysis, stemAnalyses, currentHandoffExportReceipt),
    [project, exportAnalysis, stemAnalyses, currentHandoffExportReceipt]
  );
  const workflowNavigatorItems = useMemo(
    () =>
      createWorkflowNavigatorItems(
        project,
        beatMapSummary,
        exportPreflightSummary,
        exportAnalysis,
        projectAudioAnalysis.status
      ),
    [project, beatMapSummary, exportPreflightSummary, exportAnalysis, projectAudioAnalysis.status]
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
  const currentSnapshotCompareProfile = useMemo<SnapshotCompareProjectProfile>(
    () => createSnapshotCompareProjectProfileFromAnalysis(project, exportAnalysis, stemAnalyses),
    [
      projectAudioAnalysis.identity,
      project.customDeliveryTarget,
      project.deliveryTarget,
      project.masterPreset,
      exportAnalysis,
      stemAnalyses
    ]
  );
  const savedSnapshotAnalysisSeed = useMemo(
    () =>
      projectAudioAnalysis.pending
        ? null
        : {
            identity: projectAudioAnalysis.identity,
            analysis: { mix: exportAnalysis, stems: stemAnalyses },
            exact: true
          },
    [exportAnalysis, projectAudioAnalysis.identity, projectAudioAnalysis.pending, stemAnalyses]
  );
  const savedSnapshotAudioAnalyses = useSavedSnapshotAudioAnalyses(
    project.snapshots,
    guidanceCenterOpen && !projectAudioAnalysis.pending && project.snapshots.length > 0,
    savedSnapshotAnalysisSeed
  );
  const resolveSavedSnapshotCompareProfile = useMemo(
    () => (savedProject: ProjectState): SnapshotCompareProjectProfile => {
      const entry = savedSnapshotAudioAnalyses.byIdentity[projectAudioAnalysisIdentity(savedProject)];
      if (entry?.status === "ready" && entry.analysis) {
        return createSnapshotCompareProjectProfileFromAnalysis(
          savedProject,
          entry.analysis.mix,
          entry.analysis.stems
        );
      }
      return createSnapshotCompareDeferredProjectProfile(
        savedProject,
        entry?.status === "error" ? "error" : "pending"
      );
    },
    [savedSnapshotAudioAnalyses.byIdentity]
  );
  const snapshotCompareSummary = useMemo(
    () => createSnapshotCompareSummary(project, currentSnapshotCompareProfile, resolveSavedSnapshotCompareProfile),
    [project.snapshots, currentSnapshotCompareProfile, resolveSavedSnapshotCompareProfile]
  );
  const patternCompareSummaries = useMemo(() => createPatternCompareSummaries(project), [project]);
  const patternContrastSummary = useMemo(() => createPatternContrastSummary(patternCompareSummaries), [patternCompareSummaries]);
  const patternContrastRoleMapSummary = useMemo(
    () => createPatternContrastRoleMapSummary(patternContrastSummary, project.arrangement, selectedArrangementIndex),
    [patternContrastSummary, project.arrangement, selectedArrangementIndex]
  );
  const patternContrastSectionFitSummary = useMemo(
    () => createPatternContrastSectionFitSummary(patternContrastSummary, project.arrangement, selectedArrangementIndex, project.styleId),
    [patternContrastSummary, project.arrangement, selectedArrangementIndex, project.styleId]
  );
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
  const activeChannelLabel = t(activeChannels === 1 ? "mix.activeChannel" : "mix.activeChannels", {
    count: activeChannels
  });
  const mixBalancePadOptions = useMemo(() => createMixBalancePadOptions(project.mixer), [project.mixer]);
  const mixBalancePreviewSummary = useMemo(
    () => createMixBalancePreviewSummary(project.mixer, mixBalancePadOptions, locale),
    [locale, project.mixer, mixBalancePadOptions]
  );
  const mixSnapshotComparison = useMemo(() => createMixSnapshotComparison(mixSnapshots), [mixSnapshots]);
  const mixSnapshotStatusLabel = t(
    !mixSnapshots.A && !mixSnapshots.B
      ? "mix.snapshotNoCaptures"
      : !mixSnapshots.A || !mixSnapshots.B
        ? "mix.snapshotOneCapture"
        : Math.abs(mixSnapshots.A.score - mixSnapshots.B.score) <= 2
          ? "mix.snapshotClosePasses"
          : "mix.snapshotSaferPass"
  );
  const spaceFxPadOptions = useMemo(() => createSpaceFxPadOptions(project.mixer), [project.mixer]);
  const spaceFxPreviewSummary = useMemo(
    () => createSpaceFxPreviewSummary(project.mixer, spaceFxPadOptions, locale),
    [locale, project.mixer, spaceFxPadOptions]
  );
  const stemAuditionPadOptions = useMemo(() => createStemAuditionPadOptions(project.mixer), [project.mixer]);
  const stemAuditionReadout = useMemo(
    () => createStemAuditionReadoutSummary(project.mixer, locale),
    [locale, project.mixer]
  );
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
  const studioToneDrift = useMemo(
    () => createStudioToneDriftSummary(project.sound, studioToneBaseline.sound),
    [project.sound, studioToneBaseline.sound]
  );
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
    () => createMasterOutputRoleSummary(project, exportAnalysis, locale),
    [locale, project, exportAnalysis]
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
    nextRedoLabel,
    locale
  );
  const currentPlaybackStep = playbackPosition ? playbackPosition.loopStep % 16 : null;
  const currentEditorStep = playbackPosition?.pattern === project.selectedPattern ? currentPlaybackStep : null;
  const playingPattern = isPlaying ? playbackPosition?.pattern ?? null : null;
  const audiblePatternFollowTarget = playingPattern && playingPattern !== project.selectedPattern ? playingPattern : null;
  const patternPlaybackReadout = createPatternPlaybackReadoutSummary(
    project.selectedPattern,
    playingPattern,
    t("compose.panel.eventCount", { count: patternEventTotal(currentPattern) }),
    playingPattern ? t("compose.panel.eventCount", { count: patternEventTotal(project.patterns[playingPattern]) }) : null,
    locale
  );
  const playingArrangementIndex =
    isPlaying && playbackPosition?.mode === "arrangement" && typeof playbackPosition.arrangementIndex === "number"
      ? playbackPosition.arrangementIndex
      : null;
  const isFullSongPlaying =
    isPlaying && transportLoopScope === "arrangement" && (playbackPosition?.mode ?? playbackMode) === "arrangement";
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
  const patternCueReadoutTarget =
    patternCompareDecisionSummary.action === "cue" ? patternCompareDecisionSummary.target : project.selectedPattern;
  const patternSwitchReadoutTarget = patternCompareDecisionSummary.target;
  const patternUseReadoutTarget =
    patternCompareDecisionSummary.action === "use" ? patternCompareDecisionSummary.target : project.selectedPattern;
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
    playingArrangementIndex,
    locale
  );
  const selectedArrangementBars = selectedArrangementBlock ? normalizeArrangementBars(selectedArrangementBlock.bars) : 1;
  const selectedArrangementMaximumBars = Math.min(
    maxArrangementBars,
    Math.max(
      minArrangementBars,
      maxProjectArrangementBars - (arrangementTotalBars(project) - selectedArrangementBars)
    )
  );
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
  const localizedBarCountLabel = (bars: number): string =>
    t(bars === 1 ? "arrange.helper.oneBar" : "arrange.helper.barCount", { count: bars });
  const localizedTransportLoopLabel = (scope: TransportLoopScope): string => {
    switch (scope) {
      case "arrangement":
        return t("transport.song");
      case "block":
        return t("transport.block");
      case "transition":
        return t("transport.turn");
      case "pattern":
        return t("transport.pattern");
    }
  };
  const transportLoopReadout = (() => {
    if (transportLoopScope === "pattern") {
      return t("transport.patternLoopStatus", {
        pattern: project.selectedPattern,
        bars: localizedBarCountLabel(2)
      });
    }
    if (transportLoopScope === "block") {
      if (!selectedArrangementBlock) {
        return t("transport.blockLoopUnavailable");
      }
      return t("transport.blockLoopStatus", {
        block: Math.min(selectedArrangementIndex + 1, project.arrangement.length),
        section: selectedArrangementBlock.section,
        pattern: selectedArrangementBlock.pattern,
        bars: localizedBarCountLabel(selectedArrangementBlock.bars)
      });
    }
    if (transportLoopScope === "transition") {
      if (!arrangementTransitionLoopTarget) {
        return t("transport.transitionLoopUnavailable");
      }
      return t("transport.transitionLoopStatus", {
        transition: arrangementTransitionLoopTarget.transition.value,
        start: arrangementTransitionLoopTarget.startBar + 1,
        end: arrangementTransitionLoopTarget.endBar,
        bars: localizedBarCountLabel(arrangementTransitionLoopTarget.bars)
      });
    }
    return t("transport.songLoopStatus", { bars: localizedBarCountLabel(arrangementTotalBars(project)) });
  })();
  const transportPrimary = isPlaying
    ? playbackPosition?.mode === "pattern"
      ? `${t("transport.pattern")} ${playbackPosition.pattern} ${playbackPosition.bar}.${playbackPosition.beat}`
      : `${playbackPosition?.section ?? t("transport.arrangement")} ${playbackPosition?.bar ?? 1}.${playbackPosition?.beat ?? 1}`
    : t("transport.ready");
  const transportSecondary = isPlaying
    ? t("transport.playingStatus", {
        scope: localizedTransportLoopLabel(transportLoopScope),
        pattern: playbackPosition?.pattern ?? project.selectedPattern,
        step: (currentPlaybackStep ?? 0) + 1
      })
    : transportLoopReadout;
  const transportPositionReadout = createTransportPositionReadoutSummary(
    project,
    isPlaying,
    playbackPosition,
    transportLoopScope,
    selectedArrangementIndex,
    selectedArrangementStartBar,
    arrangementTransitionLoopTarget,
    locale
  );
  const songLoopTargetLabel = t("transport.allBars", { bars: localizedBarCountLabel(arrangementTotalBars(project)) });
  const songLoopAccessibleTarget = t("transport.timelineTarget", {
    bars: localizedBarCountLabel(arrangementTotalBars(project))
  });
  const blockLoopTargetLabel = selectedArrangementBlock
    ? `${selectedArrangementBlock.section} · ${localizedBarCountLabel(selectedArrangementBlock.bars)}`
    : t("transport.selectBlock");
  const turnLoopTargetLabel = arrangementTransitionLoopTarget
    ? arrangementTransitionLoopTarget.transition.value.replace(" -> ", " → ")
    : t("transport.selectHandoff");
  const turnLoopAccessibleTarget = arrangementTransitionLoopTarget
    ? `${arrangementTransitionLoopTarget.transition.value.replace(" -> ", t("transport.transitionConnector"))}, ${localizedBarCountLabel(
        arrangementTransitionLoopTarget.bars
      )}`
    : t("transport.handoffUnavailable");
  const patternLoopTargetLabel = `${project.selectedPattern} · ${patternEventCount(currentPattern)}`;
  const transportPlaybackTarget = (() => {
    if (transportLoopScope === "block") {
      if (!selectedArrangementBlock) {
        return {
          detailLabel: t("transport.blockUnavailableDetail"),
          accessibleTarget: t("transport.selectedBlockUnavailable"),
          titleTarget: t("transport.selectedBlockUnavailable")
        };
      }
      const bars = localizedBarCountLabel(selectedArrangementBlock.bars);
      return {
        detailLabel: t("transport.blockDetail", { section: selectedArrangementBlock.section }),
        accessibleTarget: t("transport.blockAccessibleTarget", {
          section: selectedArrangementBlock.section,
          bars,
          pattern: selectedArrangementBlock.pattern
        }),
        titleTarget: t("transport.blockTitleTarget", {
          section: selectedArrangementBlock.section,
          bars,
          pattern: selectedArrangementBlock.pattern
        })
      };
    }

    if (transportLoopScope === "transition") {
      if (!arrangementTransitionLoopTarget) {
        return {
          detailLabel: t("transport.turnUnavailableDetail"),
          accessibleTarget: t("transport.handoffUnavailable"),
          titleTarget: t("transport.handoffUnavailable")
        };
      }
      const transition = arrangementTransitionLoopTarget.transition.value.replace(" -> ", t("transport.transitionConnector"));
      const bars = localizedBarCountLabel(arrangementTransitionLoopTarget.bars);
      return {
        detailLabel: t("transport.turnDetail", { bars }),
        accessibleTarget: `${transition}, ${bars}`,
        titleTarget: `${transition} · ${bars}`
      };
    }

    if (transportLoopScope === "pattern") {
      return {
        detailLabel: t("transport.patternDetail", { pattern: project.selectedPattern }),
        accessibleTarget: t("transport.patternAccessibleTarget", {
          pattern: project.selectedPattern,
          bars: localizedBarCountLabel(2)
        }),
        titleTarget: t("transport.patternTitleTarget", {
          pattern: project.selectedPattern,
          bars: localizedBarCountLabel(2)
        })
      };
    }

    const bars = localizedBarCountLabel(arrangementTotalBars(project));
    return {
      detailLabel: t("transport.songDetail", { bars }),
      accessibleTarget: t("transport.timelineTarget", { bars }),
      titleTarget: t("transport.timelineTarget", { bars })
    };
  })();
  const transportPlaybackAction = isPlaying ? t("transport.stop") : t("transport.play");
  const transportPlaybackScopeLabel = localizedTransportLoopLabel(transportLoopScope);
  const transportPlaybackAccessibleLabel = isPlaying
    ? t("transport.stopLoopAria", {
        scope: transportPlaybackScopeLabel,
        target: transportPlaybackTarget.accessibleTarget,
        bpm: project.bpm
      })
    : t("transport.playLoopAria", {
        scope: transportPlaybackScopeLabel,
        target: transportPlaybackTarget.accessibleTarget,
        bpm: project.bpm
      });
  const transportPlaybackTitle = t("transport.playbackTitle", {
    action: transportPlaybackAction,
    scope: transportPlaybackScopeLabel,
    target: transportPlaybackTarget.titleTarget,
    bpm: project.bpm
  });
  const metronomeStateLabel = project.metronomeEnabled ? t("transport.on") : t("transport.off");
  const metronomeAccessibleStateLabel = project.metronomeEnabled ? t("transport.onLower") : t("transport.offLower");
  const metronomeActionLabel = project.metronomeEnabled ? t("transport.turnOff") : t("transport.turnOn");
  const metronomeDetailLabel = `${metronomeStateLabel} · ${project.bpm} BPM`;
  const metronomeAccessibleLabel = t("transport.metronomeAria", {
    state: metronomeAccessibleStateLabel,
    bpm: project.bpm,
    action: metronomeActionLabel
  });
  function createTempoNudgePadPresentation(pad: TempoNudgePadDefinition, currentBpm: number) {
    const action =
      pad.id === "down"
        ? t("transport.nudgeDown")
        : pad.id === "up"
          ? t("transport.nudgeUp")
          : pad.id === "half"
            ? t("transport.nudgeHalf")
            : t("transport.nudgeDouble");
    const targetBpm = tempoNudgePadBpm(currentBpm, pad.id);
    return {
      pad,
      targetBpm,
      visibleLabel:
        pad.id === "half"
          ? t("transport.nudgeHalfLabel")
          : pad.id === "double"
            ? t("transport.nudgeDoubleLabel")
            : pad.label === "-1"
              ? "-1 BPM"
              : "+1 BPM",
      accessibleLabel: t("transport.nudgeAria", { action, before: currentBpm, after: targetBpm }),
      title: t("transport.nudgeTitle", { action, before: currentBpm, after: targetBpm })
    };
  }
  function localizedDrumGroovePresetLabel(preset: DrumGroovePreset): string {
    return t(
      preset === "tight"
        ? "compose.grooveTight"
        : preset === "pocket"
          ? "compose.groovePocket"
          : preset === "push"
            ? "compose.groovePush"
            : "compose.grooveReset"
    );
  }
  function localizedDrumGroovePresetDetail(preset: DrumGroovePreset): string {
    return t(
      preset === "tight"
        ? "compose.grooveTightDetail"
        : preset === "pocket"
          ? "compose.groovePocketDetail"
          : preset === "push"
            ? "compose.groovePushDetail"
            : "compose.grooveResetDetail"
    );
  }
  const tempoNudgePadPresentations = tempoNudgePads.map((pad) => createTempoNudgePadPresentation(pad, project.bpm));
  const tapTempoReadout = createTapTempoReadoutSummary(project.bpm, tapTempo, locale);
  const tapTempoButtonPresentation = (() => {
    if (tapTempo.bpm !== null) {
      const tapCountLabel = t("transport.tapCount", { count: tapTempo.taps });
      if (tapTempo.applied) {
        return {
          accessibleLabel: t("transport.tapAppliedAria", { taps: tapCountLabel, bpm: tapTempo.bpm }),
          detailLabel: t("transport.tapAppliedDetail", { bpm: tapTempo.bpm }),
          title: t("transport.tapAppliedTitle", { taps: tapCountLabel, bpm: tapTempo.bpm })
        };
      }
      return {
        accessibleLabel: t("transport.tapAveragingAria", {
          taps: tapCountLabel,
          bpm: tapTempo.bpm,
          projectBpm: project.bpm
        }),
        detailLabel: t("transport.tapAveragingDetail", { bpm: tapTempo.bpm }),
        title: t("transport.tapAveragingTitle", {
          taps: tapCountLabel,
          bpm: tapTempo.bpm,
          projectBpm: project.bpm
        })
      };
    }

    if (tapTempo.taps === 1) {
      return {
        accessibleLabel: t("transport.tapSingleAria", { bpm: project.bpm }),
        detailLabel: t("transport.tapAveragingDetail", { bpm: project.bpm }),
        title: t("transport.tapSingleTitle", { bpm: project.bpm })
      };
    }

    return {
      accessibleLabel: t("transport.tapStartAria", { bpm: project.bpm }),
      detailLabel: t("transport.tapStartDetail", { bpm: project.bpm }),
      title: t("transport.tapStartTitle", { bpm: project.bpm })
    };
  })();
  const formattedLocalDraftSavedAt = localDraftSavedAt ? formatLocalDraftSavedAt(localDraftSavedAt) : null;
  const localDraftStatusLabel = formattedLocalDraftSavedAt
    ? t("core.localDraftStatus", {
        savedAt:
          formattedLocalDraftSavedAt === "local draft"
            ? t("core.localDraftFallback")
            : formattedLocalDraftSavedAt
      })
    : t("core.localDraftLocal");
  const projectSafetyReadout = createProjectSafetyReadoutSummary(
    localDraftRecovery,
    localDraftRecoveryDeferred,
    localDraftSavedAt,
    projectStatus,
    projectFileLabel,
    projectHasUnsavedChanges,
    locale
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
    () => selectedArrangementBlockRoleSummary(project, selectedArrangementIndex, locale),
    [locale, project, selectedArrangementIndex]
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
    keyboardCaptureStepMode,
    keyboardCaptureStepMode === "playhead" && playbackPosition?.mode === "pattern" && isPlaying
      ? currentEditorStep
      : null
  );
  const keyboardCapturePlayheadStep =
    keyboardCaptureStepMode === "playhead" && playbackPosition?.mode === "pattern" && isPlaying
      ? currentEditorStep
      : null;
  const keyboardCapturePosture = createKeyboardCapturePostureSummary(
    keyboardCaptureEnabled,
    keyboardCaptureTarget,
    activeKeyboardCaptureDefaults,
    keyboardCaptureNextStep,
    keyboardCaptureStepMode,
    keyboardCapturePlayheadStep,
    locale
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
  const drumGridTabStop = drumGridEntryStep(selectedDrumStep);
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
  const audienceSessionReadoutSummary = useMemo(
    () =>
      createAudienceSessionReadoutSummary(
        project,
        firstBeatPathSummary,
        sessionPassSummary,
        modeFocusSummary,
        workflowNavigatorItems,
        exportPreflightSummary
      ),
    [project, firstBeatPathSummary, sessionPassSummary, modeFocusSummary, workflowNavigatorItems, exportPreflightSummary]
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
    if (project.sound.preset !== "custom") {
      setStudioToneBaseline(createStudioToneBaseline(project.sound));
      setStudioToneBaselineResult(null);
      setStudioToneResetResult(null);
    }
  }, [project.sound.preset]);

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
      playbackSessionRef.current += 1;
      activePlaybackModeRef.current = null;
      controllerRef.current?.stop();
      controllerRef.current = null;
      auditionControllerRef.current?.stop();
      auditionControllerRef.current = null;
      mixPreviewAudioRef.current?.pause();
      mixPreviewAudioRef.current = null;
      if (mixPreviewUrlRef.current) {
        URL.revokeObjectURL(mixPreviewUrlRef.current);
        mixPreviewUrlRef.current = null;
      }
      if (tapTempoCommitTimerRef.current !== null) {
        window.clearTimeout(tapTempoCommitTimerRef.current);
        tapTempoCommitTimerRef.current = null;
      }
      if (nativeRecoveryWriteTimerRef.current !== null) {
        window.clearTimeout(nativeRecoveryWriteTimerRef.current);
        nativeRecoveryWriteTimerRef.current = null;
      }
      styleChangeRequestResolveRef.current?.("canceled");
      styleChangeRequestResolveRef.current = null;
      styleChangeReturnFocusRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mixPreviewAudioRef.current) {
      stopMixPreview("WAV preview stopped after project change");
    }
  }, [project]);

  useEffect(() => {
    const loadProjectRecovery = window.grooveforge?.loadProjectRecovery;
    if (!loadProjectRecovery) {
      return;
    }

    // 비동기 DB 응답이 언마운트 뒤나 사용자가 이미 편집을 시작한 뒤 도착하면 현재 작업 위에 복구본을 올리지 않는다.
    let active = true;
    void loadProjectRecovery()
      .then((nativeRecovery) => {
        if (!active || !nativeRecovery || projectHasUnsavedChangesRef.current) {
          return;
        }
        const currentRecovery = localDraftRecoveryRef.current;
        const currentSavedAt = currentRecovery ? Date.parse(currentRecovery.savedAt) : Number.NEGATIVE_INFINITY;
        const nativeSavedAt = Date.parse(nativeRecovery.savedAt);
        if (currentRecovery && (!Number.isFinite(nativeSavedAt) || currentSavedAt >= nativeSavedAt)) {
          return;
        }

        const recovery: LocalDraftRecovery = {
          savedAt: nativeRecovery.savedAt,
          project: parseProjectFile(nativeRecovery.contents),
          characterCount: nativeRecovery.contents.length
        };
        setLocalDraftRecovery(recovery);
        setLocalDraftSavedAt(recovery.savedAt);
        setLocalDraftRecoveryDeferred(false);
      })
      .catch(() => {
        console.warn("SQLite project recovery is unavailable.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!localDraftReadyRef.current) {
      localDraftReadyRef.current = true;
      return;
    }
    // 프로젝트 교체 직후 effect 한 회차는 건너뛰어 방금 연 새 프로젝트가 이전 복구 초안을 즉시 덮지 않게 한다.
    const writeGate = resolveLocalDraftWriteGate(localDraftWriteArmed, localDraftSkipNextWriteRef.current);
    localDraftSkipNextWriteRef.current = writeGate.skipNextWrite;
    if (!writeGate.shouldWrite) {
      return;
    }

    const savedAt = writeLocalDraft(project);
    if (savedAt) {
      setLocalDraftSavedAt(savedAt);
      setLocalDraftRecovery(null);
      setLocalDraftRecoveryDeferred(false);
    }
    scheduleNativeProjectRecovery(project);
  }, [localDraftWriteArmed, project]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      // React 입력 초안은 DOM이 사라지기 전에 프로젝트에 반영하고 로컬/네이티브 복구 저장을 가능한 즉시 갱신한다.
      flushActiveMetadataDraft("commit");
      commitMasterCeilingDraft();
      const closeGuard = resolveProjectCloseGuard(
        projectHasUnsavedChangesRef.current,
        localDraftRecoveryRef.current !== null
      );
      if (!closeGuard.requiresConfirmation) {
        return;
      }

      if (closeGuard.shouldRefreshLocalDraft) {
        const savedAt = writeLocalDraft(projectRef.current);
        if (savedAt) {
          setLocalDraftSavedAt(savedAt);
          setLocalDraftRecovery(null);
          setLocalDraftRecoveryDeferred(false);
        }
        flushNativeProjectRecovery(projectRef.current);
      }
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [masterCeilingDraft, masterCeilingEditing]);

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
    if (modeAwareToolPanelsModeRef.current !== project.mode) {
      updateModeAwareToolPanels(project.mode);
    }
  }, [project.mode]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }
    const compactTransport = window.matchMedia("(max-width: 1220px)");
    const collapseTransportTools = (): void => {
      setTransportSessionOpen(false);
    };
    const handleTransportViewportChange = (event: MediaQueryListEvent): void => {
      if (event.matches) {
        collapseTransportTools();
      }
    };

    if (compactTransport.matches) {
      collapseTransportTools();
    }
    compactTransport.addEventListener("change", handleTransportViewportChange);
    return () => compactTransport.removeEventListener("change", handleTransportViewportChange);
  }, []);

  useEffect(() => {
    if (!masterCeilingEditing) {
      setMasterCeilingDraft(project.masterCeilingDb.toFixed(1));
    }
  }, [masterCeilingEditing, project.masterCeilingDb]);

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
      input.onmidimessage =
        activeWorkspaceZone === "compose" &&
        activeComposeWorkspacePage === "notes" &&
        midiCaptureArmed &&
        midiInputMatchesSelection(input, midiSelectedInputId)
          ? handleMidiMessage
          : null;
    }

    setMidiCaptureStatus(
      activeWorkspaceZone === "compose" &&
        activeComposeWorkspacePage === "notes" &&
        midiCaptureArmed &&
        listeningInputs.length > 0
        ? "listening"
        : "ready"
    );

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
    activeWorkspaceZone,
    activeComposeWorkspacePage,
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

  const quickActionsAuditActive = window.grooveforge?.launchSmoke === true;
  const quickActionsRequested = quickActionsOpen || quickActionsAuditActive;
  useEffect(() => {
    if (!quickActionsRequested || quickActionGraphFactory) {
      return;
    }

    let active = true;
    setQuickActionGraphLoadError(null);
    void import("./workstationAppQuickActionGraph")
      .then((module) => {
        if (active) {
          setQuickActionGraphFactory(() => module.createQuickActions);
        }
      })
      .catch(() => {
        if (active) {
          setQuickActionGraphLoadError("Quick Actions could not load. Your project is unchanged.");
        }
      });

    return () => {
      active = false;
    };
  }, [quickActionGraphFactory, quickActionGraphLoadAttempt, quickActionsRequested]);

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
    styleChangePreview,
    settingsOpen,
    keyboardCaptureEnabled,
    keyboardCaptureTarget,
    keyboardCaptureDefaults,
    keyboardCaptureStepMode,
    activeWorkspaceZone,
    activeComposeWorkspacePage
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
    styleChangePreview,
    settingsOpen,
    keyboardCaptureEnabled,
    keyboardCaptureTarget,
    keyboardCaptureDefaults,
    keyboardCaptureStepMode,
    masterCeilingDraft,
    masterCeilingEditing
  ]);

  function handleDesktopShortcut(event: KeyboardEvent): void {
    const editableTarget = isEditableShortcutTarget(event.target);
    const key = event.key.toLowerCase();
    const withCommandModifier = event.metaKey || event.ctrlKey;
    const wantsQuickActions = withCommandModifier && !event.shiftKey && key === "k";
    const wantsModifiedCommandReference = withCommandModifier && !event.shiftKey && key === "/";
    const wantsCommandReference = wantsModifiedCommandReference || (!editableTarget && key === "?");
    const wantsUndo = withCommandModifier && !event.shiftKey && key === "z";
    const wantsRedo = withCommandModifier && ((event.shiftKey && key === "z") || key === "y");
    const wantsSave = withCommandModifier && !event.shiftKey && key === "s";
    const wantsOpen = withCommandModifier && !event.shiftKey && key === "o";

    if (styleChangePreview || settingsOpen) {
      return;
    }

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

    const focusedSummary = event.target instanceof HTMLElement ? event.target.closest("summary") : null;
    if (
      focusedSummary instanceof HTMLElement &&
      focusedSummary.parentElement instanceof HTMLDetailsElement &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      (event.key === "Enter" || event.code === "Space")
    ) {
      event.preventDefault();
      if (!event.repeat) {
        focusedSummary.click();
      }
      return;
    }

    if (editableTarget) {
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

    const focusedInteractiveControl =
      event.target instanceof HTMLElement
        ? event.target.closest('button, summary, a[href], [role="button"], [role="tab"]')
        : null;
    if (event.code === "Space") {
      if (focusedInteractiveControl) {
        return;
      }
      event.preventDefault();
      if (!event.repeat) {
        togglePlayback();
      }
      return;
    }

    if (
      activeWorkspaceZoneRef.current === "compose" &&
      activeComposeWorkspacePageRef.current === "notes" &&
      keyboardCaptureEnabled &&
      isKeyboardCaptureKey(key)
    ) {
      event.preventDefault();
      if (!event.repeat) {
        captureKeyboardNote(key);
      }
      return;
    }

    const patternShortcut: Record<string, PatternSlot> = { "1": "A", "2": "B", "3": "C" };
    const nextPattern = patternShortcut[key];
    if (activeWorkspaceZoneRef.current === "compose" && nextPattern) {
      event.preventDefault();
      selectPattern(nextPattern);
      return;
    }

    if (activeWorkspaceZoneRef.current === "compose" && (key === "backspace" || key === "delete")) {
      event.preventDefault();
      if (!event.repeat) {
        deleteSelectedEvent();
      }
    }
  }

  function handleNativeMenuCommand(command: NativeMenuCommand): void {
    if (styleChangePreview || settingsOpen) {
      return;
    }

    switch (command) {
      case "open-project":
        commitMasterCeilingDraft();
        void handleOpenProject();
        return;
      case "save-project":
        commitMasterCeilingDraft();
        void handleSaveProject();
        return;
      case "save-project-and-close":
        commitMasterCeilingDraft();
        void handleSaveProjectAndClose();
        return;
      case "undo":
        resetMasterCeilingEditor(projectRef.current);
        undoProject();
        return;
      case "redo":
        resetMasterCeilingEditor(projectRef.current);
        redoProject();
        return;
      case "quick-actions":
        openQuickActions();
        return;
      case "command-reference":
        openCommandReference();
        return;
      case "toggle-playback":
        commitMasterCeilingDraft();
        togglePlayback();
        return;
      case "delete-selected-event":
        if (activeWorkspaceZoneRef.current !== "compose") {
          setProjectStatus("Delete Selected Event is available in Compose");
          return;
        }
        deleteSelectedEvent();
        return;
    }
  }

  function clearFixedFeedbackLane(): void {
    setModeSwitchResult(null);
    setProjectFileResult(null);
    setLocalDraftRecoveryResult(null);
    setWorkflowNavigatorResult(null);
    setUndoRedoResult(null);
    setQuickActionResult(null);
  }

  function beginFixedFeedbackIntent(): number {
    fixedFeedbackIntentEpochRef.current += 1;
    return fixedFeedbackIntentEpochRef.current;
  }

  function claimFixedFeedbackIntent(): number {
    return activeQuickActionFeedbackIntentEpochRef.current ?? beginFixedFeedbackIntent();
  }

  function fixedFeedbackIntentIsCurrent(intentEpoch: number): boolean {
    return intentEpoch === fixedFeedbackIntentEpochRef.current;
  }

  function showModeSwitchResult(result: ModeSwitchResult, intentEpoch = claimFixedFeedbackIntent()): void {
    if (!fixedFeedbackIntentIsCurrent(intentEpoch)) {
      return;
    }
    clearFixedFeedbackLane();
    setModeSwitchResult(result);
  }

  function showProjectFileResult(result: ProjectFileResult, intentEpoch = claimFixedFeedbackIntent()): void {
    if (!fixedFeedbackIntentIsCurrent(intentEpoch)) {
      return;
    }
    clearFixedFeedbackLane();
    setProjectFileResult(result);
  }

  function showLocalDraftRecoveryResult(
    result: LocalDraftRecoveryResult,
    intentEpoch = claimFixedFeedbackIntent()
  ): void {
    if (!fixedFeedbackIntentIsCurrent(intentEpoch)) {
      return;
    }
    clearFixedFeedbackLane();
    setLocalDraftRecoveryResult(result);
  }

  function showWorkflowNavigatorResult(
    result: WorkflowNavigatorJumpResult,
    intentEpoch = claimFixedFeedbackIntent()
  ): void {
    if (!fixedFeedbackIntentIsCurrent(intentEpoch)) {
      return;
    }
    clearFixedFeedbackLane();
    setWorkflowNavigatorResult(result);
  }

  function showUndoRedoResult(result: UndoRedoResult, intentEpoch = claimFixedFeedbackIntent()): void {
    if (!fixedFeedbackIntentIsCurrent(intentEpoch)) {
      return;
    }
    clearFixedFeedbackLane();
    setUndoRedoResult(result);
  }

  function showQuickActionResult(result: QuickActionResult, intentEpoch = claimFixedFeedbackIntent()): void {
    if (!fixedFeedbackIntentIsCurrent(intentEpoch)) {
      return;
    }
    clearFixedFeedbackLane();
    setQuickActionResult(result);
  }

  function resetProjectDependentUiState(nextProject: ProjectState, invalidatePendingSave = true): void {
    if (invalidatePendingSave) {
      projectSaveRequestIdRef.current += 1;
    }
    projectExportRequestIdRef.current += 1;
    setProjectFileLabel(null);
    setProjectFileResult(null);
    setLocalDraftRecoveryResult(null);
    setSoundPresetPreviewId(defaultSoundPresetPreview(nextProject));
    setSoundSnapshots({ A: null, B: null });
    setStudioToneBaseline(createStudioToneBaseline(nextProject.sound));
    setStudioToneBaselineResult(null);
    setStudioToneResetResult(null);
    setMixSnapshots({ A: null, B: null });
    setHandoffExportFormatFocusId(null);
    setHandoffPackageCheckFocusId(null);
    setHandoffExportFormatResult(null);
    setHandoffPackageCheckResult(null);
    handoffExportReceiptRef.current = null;
    handoffExportReceiptProjectRef.current = null;
    setHandoffExportReceipt(null);
    setHandoffExportReceiptProject(null);
    setDeliveryStatusOpen(false);
  }

  function replaceUndoHistory(nextHistory: EditHistoryEntry[]): void {
    undoStackRef.current = nextHistory;
    setUndoStack(nextHistory);
  }

  function replaceRedoHistory(nextHistory: EditHistoryEntry[]): void {
    redoStackRef.current = nextHistory;
    setRedoStack(nextHistory);
  }

  function advanceMetadataDraftRevision(): void {
    const nextRevision = metadataDraftRevisionRef.current + 1;
    metadataDraftRevisionRef.current = nextRevision;
    pendingMetadataDraftRef.current = null;
    metadataReplacementDraftDirtyRef.current = false;
    setMetadataDraftRevision(nextRevision);
  }

  function invalidateHandoffExportReceipt(): void {
    handoffExportReceiptRef.current = null;
    handoffExportReceiptProjectRef.current = null;
    setHandoffExportReceipt(null);
    setHandoffExportReceiptProject(null);
    setHandoffExportFormatResult(null);
    setHandoffPackageCheckResult(null);
    setDeliveryStatusOpen(false);
    setQuickActionResult(null);
  }

  function updateProject(update: (current: ProjectState) => ProjectState, status = "Unsaved changes"): boolean {
    const current = projectRef.current;
    const nextProject = update(current);
    if (nextProject === current) {
      return false;
    }

    projectRef.current = nextProject;
    replaceUndoHistory(appendHistory(undoStackRef.current, createEditHistoryEntry(current, status)));
    replaceRedoHistory([]);
    setLocalDraftWriteArmed(true);
    setProjectHasUnsavedChanges(true);
    invalidateHandoffExportReceipt();
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
    setAudienceSessionActionResult(null);
    setAudienceStarterResult(null);
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

  /**
   * 제목과 Session Brief 편집은 영속 프로젝트 변경이지만 음악 편집 결과 자체를 무효화하지는 않는다.
   * 빠른 입력 경로를 일반 변경 파급 처리에서 분리하되 저장·닫기 보호가 사용하는 ref, 실행 취소,
   * 미저장 표시와 직렬화 경계는 그대로 공유한다.
   */
  function updateProjectMetadata(
    update: (current: ProjectState) => ProjectState,
    status = "Unsaved changes",
    resetSessionBriefResults = false
  ): boolean {
    const current = projectRef.current;
    const nextProject = update(current);
    if (nextProject === current) {
      return false;
    }

    projectRef.current = nextProject;
    replaceUndoHistory(appendHistory(undoStackRef.current, createEditHistoryEntry(current, status)));
    replaceRedoHistory([]);
    setLocalDraftWriteArmed(true);
    setProjectHasUnsavedChanges(true);
    invalidateHandoffExportReceipt();
    setProject(nextProject);
    setProjectFileResult(null);
    setLocalDraftRecoveryResult(null);
    setUndoRedoResult(null);

    if (resetSessionBriefResults) {
      setSessionBriefStarterResult(null);
      setSessionBriefCompassResult(null);
      setReferenceAlignmentResult(null);
      setBeatPassportResult(null);
      setProductionSnapshotResult(null);
      setSnapshotCompareResult(null);
      setFinishChecklistResult(null);
      setExportPreflightResult(null);
      setHandoffExportFormatResult(null);
      setHandoffPackageCheckResult(null);
      setQuickActionResult(null);
    }

    setProjectStatus(status);
    return true;
  }

  function metadataDraftFromElement(element: HTMLElement | null): MetadataDraftSnapshot | null {
    const testId = element?.getAttribute("data-testid");
    if (testId === "project-title-input" && element instanceof HTMLInputElement) {
      return { kind: "title", value: normalizeProjectTitle(element.value) };
    }

    const sessionBriefFieldByTestId: Partial<Record<string, keyof SessionBrief>> = {
      "session-brief-artist": "artist",
      "session-brief-vibe": "vibe",
      "session-brief-reference": "reference",
      "session-brief-notes": "notes"
    };
    const field = testId ? sessionBriefFieldByTestId[testId] : undefined;
    if (!field || !(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
      return null;
    }

    const maxLength = field === "notes" ? maxSessionBriefNotesLength : maxSessionBriefFieldLength;
    return {
      field,
      kind: "session-brief",
      value: boundedSessionBriefText(element.value, maxLength)
    };
  }

  function metadataDraftDiffers(snapshot: MetadataDraftSnapshot, current: ProjectState): boolean {
    return snapshot.kind === "title"
      ? snapshot.value !== current.title
      : snapshot.value !== current.sessionBrief[snapshot.field];
  }

  function commitMetadataDraft(snapshot: MetadataDraftSnapshot): boolean {
    if (snapshot.kind === "title") {
      return updateProjectMetadata(
        (current) => (current.title === snapshot.value ? current : { ...current, title: snapshot.value }),
        "Unsaved changes"
      );
    }

    const { field, value } = snapshot;
    return updateProjectMetadata(
      (current) =>
        current.sessionBrief[field] === value
          ? current
          : { ...current, sessionBrief: { ...current.sessionBrief, [field]: value } },
      `Updated ${sessionBriefFieldLabel(field)} brief`,
      true
    );
  }

  function blurMetadataDraftElement(element: HTMLElement | null): void {
    if (!metadataDraftFromElement(element)) {
      return;
    }
    metadataBlurCommitSuppressedRef.current = true;
    element?.blur();
    metadataBlurCommitSuppressedRef.current = false;
  }

  function flushActiveMetadataDraft(intent: "commit" | "prepare-replacement" | "discard"): boolean {
    const activeElement =
      typeof document !== "undefined" && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const activeSnapshot = metadataDraftFromElement(activeElement);

    if (intent === "discard") {
      pendingMetadataDraftRef.current = null;
      metadataReplacementDraftDirtyRef.current = false;
      blurMetadataDraftElement(activeElement);
      return false;
    }

    if (intent === "prepare-replacement") {
      if (activeSnapshot) {
        pendingMetadataDraftRef.current = metadataDraftDiffers(activeSnapshot, projectRef.current)
          ? activeSnapshot
          : null;
      }
      metadataReplacementDraftDirtyRef.current = Boolean(
        pendingMetadataDraftRef.current && metadataDraftDiffers(pendingMetadataDraftRef.current, projectRef.current)
      );
      blurMetadataDraftElement(activeElement);
      return metadataReplacementDraftDirtyRef.current;
    }

    const snapshot = activeSnapshot ?? pendingMetadataDraftRef.current;
    const changed = snapshot ? commitMetadataDraft(snapshot) : false;
    pendingMetadataDraftRef.current = null;
    metadataReplacementDraftDirtyRef.current = false;
    blurMetadataDraftElement(activeElement);
    return changed;
  }

  function updatePlaybackPosition(position: PlaybackSnapshot | null): void {
    playbackPositionRef.current = position;
    setPlaybackPosition(position);
  }

  function setProjectHasUnsavedChanges(value: boolean): void {
    projectHasUnsavedChangesRef.current = value;
    setProjectHasUnsavedChangesState(value);
  }

  function setLocalDraftRecovery(value: LocalDraftRecovery | null): void {
    localDraftRecoveryRef.current = value;
    setLocalDraftRecoveryState(value);
  }

  function updateProjectView(update: (current: ProjectState) => ProjectState, status: string): void {
    const current = projectRef.current;
    const nextProject = update(current);
    if (nextProject !== current) {
      projectRef.current = nextProject;
      invalidateHandoffExportReceipt();
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
      setAudienceSessionActionResult(null);
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
    setSwingFeelResult(createSwingFeelResult(pad, beforeProject, afterProject, locale));
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
    flushActiveMetadataDraft("discard");
    advanceMetadataDraftRevision();
    projectSaveRequestIdRef.current += 1;
    projectRef.current = nextProject;
    resetProjectDependentUiState(nextProject, false);
    resetMasterCeilingEditor(nextProject);
    localDraftSkipNextWriteRef.current = true;
    resetTapTempo();
    setProjectFileLabel(fileLabel);
    setProjectHasUnsavedChanges(false);
    setLocalDraftWriteArmed(false);
    setProject(nextProject);
    replaceUndoHistory([]);
    replaceRedoHistory([]);
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
    clearLocalDraftState();
    setProjectStatus(status);
  }

  function restoreProjectFromHistory(nextProject: ProjectState, status: string): void {
    advanceMetadataDraftRevision();
    projectRef.current = nextProject;
    resetMasterCeilingEditor(nextProject);
    resetTapTempo();
    setLocalDraftWriteArmed(true);
    setProjectHasUnsavedChanges(true);
    invalidateHandoffExportReceipt();
    setProject(nextProject);
    setSelectedArrangementIndex((index) => Math.min(index, Math.max(0, nextProject.arrangement.length - 1)));
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
    updatePlaybackPosition(null);
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
    flushActiveMetadataDraft("commit");
    const currentUndoStack = undoStackRef.current;
    const currentRedoStack = redoStackRef.current;
    const previousEntry = currentUndoStack[currentUndoStack.length - 1];
    if (!previousEntry) {
      claimFixedFeedbackIntent();
      setUndoRedoResult(null);
      setProjectStatus("Nothing to undo");
      return;
    }

    const current = projectRef.current;
    const remainingUndoDepth = currentUndoStack.length - 1;
    const remainingRedoDepth = currentRedoStack.length + 1;
    replaceUndoHistory(currentUndoStack.slice(0, -1));
    replaceRedoHistory(prependFuture(currentRedoStack, createEditHistoryEntry(current, previousEntry.label)));
    restoreProjectFromHistory(previousEntry.project, `Undo: ${previousEntry.label}`);
    showUndoRedoResult(createUndoRedoResult("undo", previousEntry.label, previousEntry.project, remainingUndoDepth, remainingRedoDepth));
  }

  function redoProject(): void {
    flushActiveMetadataDraft("commit");
    const currentUndoStack = undoStackRef.current;
    const currentRedoStack = redoStackRef.current;
    const nextEntry = currentRedoStack[0];
    if (!nextEntry) {
      claimFixedFeedbackIntent();
      setUndoRedoResult(null);
      setProjectStatus("Nothing to redo");
      return;
    }

    const current = projectRef.current;
    const remainingUndoDepth = currentUndoStack.length + 1;
    const remainingRedoDepth = currentRedoStack.length - 1;
    replaceRedoHistory(currentRedoStack.slice(1));
    replaceUndoHistory(appendHistory(currentUndoStack, createEditHistoryEntry(current, nextEntry.label)));
    restoreProjectFromHistory(nextEntry.project, `Redo: ${nextEntry.label}`);
    showUndoRedoResult(createUndoRedoResult("redo", nextEntry.label, nextEntry.project, remainingUndoDepth, remainingRedoDepth));
  }

  function cancelScheduledNativeProjectRecovery(): void {
    if (nativeRecoveryWriteTimerRef.current !== null) {
      window.clearTimeout(nativeRecoveryWriteTimerRef.current);
      nativeRecoveryWriteTimerRef.current = null;
    }
  }

  function persistNativeProjectRecovery(projectToRecover: ProjectState): void {
    const saveProjectRecovery = window.grooveforge?.saveProjectRecovery;
    if (!saveProjectRecovery) {
      return;
    }

    try {
      const contents = serializeProjectFile(projectToRecover);
      void saveProjectRecovery(contents).catch(() => {
        console.warn("Unable to update SQLite project recovery.");
      });
    } catch {
      console.warn("Unable to serialize SQLite project recovery.");
    }
  }

  function scheduleNativeProjectRecovery(projectToRecover: ProjectState): void {
    if (!window.grooveforge?.saveProjectRecovery) {
      return;
    }
    // 연속 편집 중에는 마지막 스냅샷만 SQLite로 보내되, 닫기 경로에서는 별도 flush가 타이머를 앞질러 실행한다.
    cancelScheduledNativeProjectRecovery();
    nativeRecoveryWriteTimerRef.current = window.setTimeout(() => {
      nativeRecoveryWriteTimerRef.current = null;
      persistNativeProjectRecovery(projectToRecover);
    }, nativeRecoveryDebounceMs);
  }

  function flushNativeProjectRecovery(projectToRecover: ProjectState): void {
    cancelScheduledNativeProjectRecovery();
    persistNativeProjectRecovery(projectToRecover);
  }

  function clearLocalDraftState(requestNativeClear = true): void {
    cancelScheduledNativeProjectRecovery();
    clearLocalDraftStorage();
    if (requestNativeClear) {
      void window.grooveforge?.clearProjectRecovery?.().catch(() => {
        console.warn("Unable to clear SQLite project recovery.");
      });
    }
    setLocalDraftRecovery(null);
    setLocalDraftRecoveryDeferred(false);
    setLocalDraftSavedAt(null);
  }

  function deferLocalDraftRecovery(): void {
    if (!localDraftRecovery) {
      return;
    }

    setLocalDraftRecoveryDeferred(true);
    setProjectStatus("Kept current project; recovery remains available in Actions");
  }

  function restoreLocalDraft(): void {
    if (!localDraftRecovery) {
      claimFixedFeedbackIntent();
      setLocalDraftRecoveryResult(null);
      setProjectStatus("No local draft to restore");
      return;
    }

    const recovery = localDraftRecovery;
    flushActiveMetadataDraft("prepare-replacement");

    playbackSessionRef.current += 1;
    activePlaybackModeRef.current = null;
    controllerRef.current?.stop();
    controllerRef.current = null;
    updatePlaybackPosition(null);
    setIsPlaying(false);

    const draftProject = recovery.project;
    const changed = updateProject(
      () => draftProject,
      `Restored local draft ${formatLocalDraftSavedAt(recovery.savedAt)}`
    );
    clearLocalDraftState();
    setLaunchpadOpen(false);

    if (changed) {
      advanceMetadataDraftRevision();
      resetProjectDependentUiState(draftProject);
      resetMasterCeilingEditor(projectRef.current);
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      showLocalDraftRecoveryResult(createLocalDraftRecoveryResult("restore", recovery, draftProject));
    }
  }

  async function clearLocalDraftRecovery(intentEpoch = claimFixedFeedbackIntent()): Promise<void> {
    if (!localDraftRecovery) {
      if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
        setLocalDraftRecoveryResult(null);
      }
      return;
    }

    // clear IPC가 끝나는 동안 프로젝트/복구본이 바뀔 수 있으므로 요청 번호와 시작 객체를 함께 고정한다.
    const requestId = ++localDraftClearRequestIdRef.current;
    const recovery = localDraftRecovery;
    const projectAtStart = projectRef.current;
    const clearProjectRecovery = window.grooveforge?.clearProjectRecovery;
    if (clearProjectRecovery) {
      try {
        const result = await clearProjectRecovery();
        if (!result.cleared) {
          if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
            setLocalDraftRecoveryResult(null);
          }
          setProjectStatus("Could not clear SQLite recovery; retry");
          return;
        }
      } catch {
        console.warn("Unable to clear SQLite project recovery.");
        if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
          setLocalDraftRecoveryResult(null);
        }
        setProjectStatus("Could not clear SQLite recovery; retry");
        return;
      }
    }

    if (
      !shouldCommitLocalDraftClear(
        requestId,
        localDraftClearRequestIdRef.current,
        recovery,
        localDraftRecoveryRef.current,
        projectAtStart,
        projectRef.current
      )
    ) {
      if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
        setLocalDraftRecoveryResult(null);
      }
      setProjectStatus("Recovery changed while clearing; current work kept");
      return;
    }

    clearLocalDraftState(false);
    showLocalDraftRecoveryResult(createLocalDraftRecoveryResult("clear", recovery, projectRef.current), intentEpoch);
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
      resetMasterCeilingEditor(projectRef.current);
      setSelectedArrangementIndex(0);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      updatePlaybackPosition(null);
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

  function updatePatternSlot(
    patternSlot: PatternSlot,
    update: (pattern: PatternData) => PatternData,
    status = "Unsaved changes"
  ): boolean {
    return updateProject((current) => {
      const currentPatternData = current.patterns[patternSlot];
      const nextPatternData = update(currentPatternData);
      if (nextPatternData === currentPatternData) {
        return current;
      }
      return {
        ...current,
        patterns: {
          ...current.patterns,
          [patternSlot]: nextPatternData
        }
      };
    }, status);
  }

  function updateCurrentPattern(update: (pattern: PatternData) => PatternData, status = "Unsaved changes"): boolean {
    return updatePatternSlot(projectRef.current.selectedPattern, update, status);
  }

  function updateKeyboardCaptureEnabled(enabled: boolean): void {
    if (enabled) {
      setCaptureIdeasOpen(true);
    }
    setKeyboardCaptureEnabled(enabled);
  }

  function updateKeyboardCaptureStepMode(mode: KeyboardCaptureStepMode): void | "canceled" {
    const activePlaybackMode = activePlaybackModeRef.current;
    if (mode === "playhead" && activePlaybackMode !== null && activePlaybackMode !== "pattern") {
      setProjectStatus("Stop Song, Block, or Turn playback before selecting Live Overdub");
      return "canceled";
    }
    if (mode === "playhead" && activePlaybackMode === null) {
      selectTransportLoopScope("pattern", false);
      setProjectStatus(`Live Overdub ready for Pattern ${projectRef.current.selectedPattern}; press Play to record`);
    }
    setCaptureIdeasOpen(true);
    setKeyboardCaptureStepMode(mode);
  }

  function updateMidiCaptureArmed(armed: boolean): void {
    if (armed) {
      setCaptureIdeasOpen(true);
    }
    setMidiCaptureArmed(armed);
  }

  function expandStudioWorkspaceZone(zone: WorkflowZoneId): void {
    if (studioExpandedWorkspaceZonesRef.current.has(zone)) {
      return;
    }
    studioExpandedWorkspaceZonesRef.current.add(zone);
    if (zone === "compose") {
      setSoundDesignOpen(true);
      setHarmonyMovesOpen(true);
      return;
    }
    if (zone === "arrange") {
      setArrangementToolsOpen(true);
      setBlockMovesOpen(true);
      return;
    }
    if (zone === "mix") {
      setMixMovesOpen(true);
      setMixReviewOpen(true);
      setMasterPolishOpen(true);
      setMasterReviewOpen(true);
      setChannelProcessingOpen(
        Object.fromEntries(projectRef.current.mixer.map((channel) => [channel.id, true]))
      );
      return;
    }
    setDeliveryStatusOpen(true);
    setDeliveryAuditOpen(true);
  }

  function updateModeAwareToolPanels(mode: ProjectState["mode"]): void {
    modeAwareToolPanelsModeRef.current = mode;
    const advancedOpen = mode === "studio";
    setMasterReviewQueueOpen(false);
    setMasterMixCoachOpen(false);
    setTransportSessionOpen(false);
    if (advancedOpen) {
      studioExpandedWorkspaceZonesRef.current = new Set();
      const activeZone = activeWorkspaceZoneRef.current;
      if (activeZone !== "overview") {
        expandStudioWorkspaceZone(activeZone);
      }
      return;
    }
    studioExpandedWorkspaceZonesRef.current = new Set();
    setSoundDesignOpen(false);
    setHarmonyMovesOpen(false);
    setArrangementToolsOpen(false);
    setBlockMovesOpen(false);
    setMixMovesOpen(false);
    setMixReviewOpen(false);
    setMasterPolishOpen(false);
    setMasterReviewOpen(false);
    setDeliveryStatusOpen(false);
    setDeliveryAuditOpen(false);
    setChannelProcessingOpen({});
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
    replaceStep,
    liveOverdub
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
    liveOverdub: boolean;
  }): InputCaptureResult {
    const targetLabel = target === "bass" ? "808" : "Synth";
    const sourceLabel = source === "keyboard" ? "Keyboard" : "MIDI";
    const length = clampStepLength(defaults.length);
    const velocity = clampVelocity(defaults.velocity);
    const degreeIndex = keyboardCapturePitchLanes(projectKey, target, defaults).indexOf(pitch);
    const degreeLabel = degreeIndex >= 0 ? keyboardCaptureDegreeLabel(degreeIndex) : "Scale";
    const articulation = target === "bass" ? (defaults.glide ? "glide" : "no glide") : "melody";
    const status = liveOverdub ? "Overdubbed" : replaceStep ? "Replaced" : "Captured";
    const supportingLayers = target === "bass" ? "drums, chords, and Synth" : "drums, 808, and chords";

    return {
      source,
      targetId: `${source}-${patternSlot}-${target}-${step}-${pitch}`,
      status,
      title: `${targetLabel} ${pitch} step ${step + 1}`,
      detail: `${sourceLabel} ${inputLabel} / ${
        liveOverdub ? "quantized to live playhead" : replaceStep ? "replaced selected step" : "next free step"
      } / ${percentLabel(
        velocity
      )} velocity`,
      patternLabel: `Pattern ${patternSlot}`,
      metricLabel: "Capture",
      metricValue: `${degreeLabel} / length ${length} / ${articulation}`,
      captureCue: `Loop Pattern ${patternSlot}; hear the captured ${targetLabel} against ${supportingLayers}.`,
      nextCheck: liveOverdub
        ? "Keep the Pattern loop playing to overdub another event, then stop and edit the captured notes in the grid."
        : replaceStep
        ? "Undo if the replacement missed the phrase, or switch Capture Step Mode back to Next for additive writing."
        : "Keep capturing while the idea is fresh, then audition the selected note before editing length, glide, or velocity.",
      tone: "good"
    };
  }

  function captureMidiNoteEvent(event: MIDIMessageEvent): void {
    if (
      activeWorkspaceZoneRef.current !== "compose" ||
      activeComposeWorkspacePageRef.current !== "notes" ||
      !event.data
    ) {
      return;
    }

    const note = midiNoteOnFromMessage(event.data);
    if (!note) {
      return;
    }

    const current = projectRef.current;
    const target = keyboardCaptureTarget;
    const captureDefaults = keyboardCaptureDefaults[target];
    const pitch = midiNoteToScalePitch(note.noteNumber, current.key, target);
    if (!pitch) {
      setInputCaptureResult(null);
      setMidiLastNoteLabel(`Ignored ${midiNoteLabel(note.noteNumber)}`);
      setProjectStatus("MIDI note is out of range");
      return;
    }

    const placement = resolveKeyboardCapturePlacement(
      current,
      target,
      selectedNote,
      keyboardCaptureStepMode,
      controllerRef.current ? playbackPositionRef.current : null
    );
    if (!placement) {
      setInputCaptureResult(null);
      setProjectStatus("Live Overdub needs active Pattern playback");
      return;
    }
    const step = placement.step;
    const replaceStep = placement.replaceStep;
    const midiDefaults: KeyboardCaptureDefaults = { ...captureDefaults, velocity: note.velocity };
    const result = createInputCaptureResult({
      source: "midi",
      inputLabel: midiNoteLabel(note.noteNumber),
      patternSlot: placement.pattern,
      projectKey: current.key,
      target,
      step,
      pitch,
      defaults: midiDefaults,
      replaceStep,
      liveOverdub: placement.liveOverdub
    });
    const changed = updatePatternSlot(
      placement.pattern,
      (currentPatternData) => addKeyboardCaptureNote(currentPatternData, target, step, pitch, midiDefaults, replaceStep),
      `MIDI ${placement.liveOverdub ? "overdubbed" : replaceStep ? "replaced" : "captured"} ${
        target === "bass" ? "808" : "Synth"
      } ${pitch}.${step + 1} on Pattern ${placement.pattern}`
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

  function handlePatternTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, pattern: PatternSlot): void {
    const currentIndex = patternSlots.indexOf(pattern);
    let targetIndex: number | null = null;

    if (event.key === "ArrowLeft") {
      targetIndex = (currentIndex - 1 + patternSlots.length) % patternSlots.length;
    } else if (event.key === "ArrowRight") {
      targetIndex = (currentIndex + 1) % patternSlots.length;
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = patternSlots.length - 1;
    }

    if (targetIndex === null) {
      return;
    }

    event.preventDefault();
    const targetPattern = patternSlots[targetIndex];
    if (targetPattern !== pattern) {
      selectPattern(targetPattern);
    }
    patternTabRefs.current[targetPattern]?.focus();
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

    // 이미 활성인 루프 범위를 다시 선택하는 것은 UI 자세를 바꾸지 않는다.
    // 연속 Pattern 오디션 사이에 전체 워크스테이션 재조정을 유발하지 않는다.
    if (!isPlaying && scope === transportLoopScope) {
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
    switch (activeComposeWorkspacePageRef.current) {
      case "drums":
        if (clearSelectedDrumStep()) {
          return;
        }
        setProjectStatus("Select a drum step on the open Drums page to delete");
        break;
      case "notes":
        if (deleteSelectedNote()) {
          return;
        }
        setProjectStatus("Select an 808 or Synth note on the open Bass / Melody page to delete");
        break;
      case "instruments":
        if (deleteSelectedChordEvent()) {
          return;
        }
        setProjectStatus("Select a chord on the open Instruments page to delete");
        break;
    }
    setSelectedEventDeleteResult(null);
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
    setArrangementToolsOpen(true);
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
    setArrangementToolsOpen(true);
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
      const currentBlockBars = normalizeArrangementBars(block.bars);
      const maximumBlockBars = Math.max(
        minArrangementBars,
        maxProjectArrangementBars - (arrangementTotalBars(current) - currentBlockBars)
      );
      const nextBlock: ArrangementBlock = {
        ...block,
        ...update,
        energy: update.energy === undefined ? block.energy : normalizeArrangementEnergy(update.energy),
        bars:
          update.bars === undefined
            ? block.bars
            : Math.min(maximumBlockBars, normalizeArrangementBars(update.bars)),
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
    setArrangementToolsOpen(true);
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
    setBlockMovesOpen(true);
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
    setArrangementToolsOpen(true);
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
    setArrangementToolsOpen(true);
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
    setArrangementToolsOpen(true);
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
    setArrangementToolsOpen(true);
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
    setArrangementToolsOpen(true);
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
    setArrangementToolsOpen(true);
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

  function normalizeMasterCeilingInput(value: number): number {
    return Number.isFinite(value) ? projectMasterCeilingDb({ masterCeilingDb: value }) : projectMasterCeilingDb(projectRef.current);
  }

  function updateMasterCeilingDb(value: number): void {
    const normalized = normalizeMasterCeilingInput(value);
    updateProject((current) =>
      current.masterCeilingDb === normalized ? current : { ...current, masterCeilingDb: normalized }
    );
  }

  function resetMasterCeilingEditor(nextProject: Pick<ProjectState, "masterCeilingDb">): void {
    setMasterCeilingEditing(false);
    setMasterCeilingDraft(projectMasterCeilingDb(nextProject).toFixed(1));
  }

  function commitMasterCeilingDraft(): void {
    if (!masterCeilingEditing) {
      return;
    }
    const normalized = resolveMasterCeilingDraft(projectRef.current, masterCeilingDraft);
    resetMasterCeilingEditor({ masterCeilingDb: normalized });
    updateMasterCeilingDb(normalized);
  }

  function applyMasterFinishPad(padId: MasterFinishPadId, options: { showResult?: boolean } = {}): void {
    setMasterPolishOpen(true);
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
    setMasterPolishOpen(true);
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
    if (!exactAudioAnalysisReadyForSurface("Master", "master")) {
      return;
    }
    setMasterReviewOpen(true);
    setMasterMixCoachOpen(true);
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
    setMixReviewOpen(true);
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
    if (!exactAudioAnalysisReadyForSurface("Mix", "mix")) {
      return;
    }
    setMixReviewOpen(true);
    const snapshot = createMixSnapshot(slot, projectRef.current, exportAnalysis, stemAnalyses);
    setMixSnapshots((current) => ({ ...current, [slot]: snapshot }));
    setProjectStatus(`Captured Mix Snapshot ${slot}: ${snapshot.statusLabel}`);
  }

  function recallMixSnapshot(slot: MixSnapshotSlotId): void {
    setMixReviewOpen(true);
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
    setMixReviewOpen(true);
    if (!mixSnapshots.A && !mixSnapshots.B) {
      setProjectStatus("Mix Snapshot A/B already clear");
      return;
    }
    setMixSnapshots({ A: null, B: null });
    setProjectStatus("Cleared Mix Snapshot A/B");
  }

  function applyMixBalancePad(padId: MixBalancePadId): void {
    setMixMovesOpen(true);
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
    setMixMovesOpen(true);
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
    setSoundDesignOpen(true);
    setSoundPresetPreviewId(preset);
    setSoundPresetResult(null);
    setProjectStatus(`${soundPresetLabel(preset)} sound preset preview`);
  }

  function applySoundPreset(preset: SoundPresetTarget = soundPresetPreviewId): void {
    setSoundDesignOpen(true);
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
    setSoundDesignOpen(true);
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
    setSoundDesignOpen(true);
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

  function updateSoundDesign(update: Partial<Omit<SoundDesign, "preset">>, status = "Unsaved changes"): void {
    updateProject((current) => ({
      ...current,
      sound: {
        ...current.sound,
        ...Object.fromEntries(Object.entries(update).map(([key, value]) => [key, clampUnit(value)])),
        preset: "custom"
      }
    }), status);
  }

  function captureStudioToneBaseline(): void {
    const baseline = createCapturedStudioToneBaseline(projectRef.current.sound);
    setStudioToneBaseline(baseline);
    setStudioToneResetResult(null);
    setStudioToneBaselineResult(createStudioToneBaselineResult(baseline));
    setProjectStatus(`Captured Studio Tone baseline: ${baseline.sourceLabel}`);
  }

  function resetLargestStudioToneDrift(): void {
    const summary = createStudioToneDriftSummary(projectRef.current.sound, studioToneBaseline.sound);
    const target = summary.resetTarget;
    if (!target) {
      setProjectStatus("Studio Tone already matches baseline");
      return;
    }

    setStudioToneResetResult(createStudioToneResetResult(target, studioToneBaseline.sourceLabel));
    updateSoundDesign(
      { [target.parameter]: target.baselineValue } as Partial<Omit<SoundDesign, "preset">>,
      `Reset Studio Tone ${target.label} to ${studioToneBaseline.sourceLabel}`
    );
  }

  function captureSoundSnapshot(slot: SoundSnapshotSlotId): void {
    setSoundDesignOpen(true);
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
    const beforeSource = beforeProject.arrangement[beforeIndex] ?? beforeProject.arrangement[0];
    const beforeRemainingBars = maxProjectArrangementBars - arrangementTotalBars(beforeProject);
    const duplicateStatus =
      beforeSource && normalizeArrangementBars(beforeSource.bars) > beforeRemainingBars
        ? `Duplicated arrangement block within ${maxProjectArrangementBars}-bar limit`
        : "Duplicated arrangement block";
    const changed = updateProject((current) => {
      const source = current.arrangement[selectedArrangementIndex] ?? current.arrangement[0];
      if (!source) {
        return current;
      }
      const remainingBars = maxProjectArrangementBars - arrangementTotalBars(current);
      if (remainingBars <= 0) {
        return current;
      }
      const nextIndex = Math.min(selectedArrangementIndex + 1, current.arrangement.length);
      const duplicatedBlock: ArrangementBlock = {
        ...source,
        bars: Math.min(remainingBars, normalizeArrangementBars(source.bars)),
        mutedTracks: [...source.mutedTracks]
      };
      setSelectedArrangementIndex(nextIndex);
      return {
        ...current,
        selectedPattern: source.pattern,
        arrangement: [
          ...current.arrangement.slice(0, nextIndex),
          duplicatedBlock,
          ...current.arrangement.slice(nextIndex)
        ]
      };
    }, duplicateStatus);
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setSelectedBlockEditResult(createSelectedBlockEditResult("duplicate", beforeProject, projectRef.current, beforeIndex, afterIndex));
    } else {
      setSelectedBlockEditResult(null);
      if (arrangementTotalBars(projectRef.current) >= maxProjectArrangementBars) {
        setProjectStatus(`Arrangement is limited to ${maxProjectArrangementBars} bars`);
      }
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
    const beforeRemainingBars = maxProjectArrangementBars - arrangementTotalBars(beforeProject);
    const pasteStatus =
      normalizeArrangementBars(clipboard.bars) > beforeRemainingBars
        ? `Pasted arrangement block within ${maxProjectArrangementBars}-bar limit`
        : "Pasted arrangement block";
    const changed = updateProject((current) => {
      const selectedBlock = current.arrangement[selectedArrangementIndex];
      if (!selectedBlock) {
        return current;
      }
      const remainingBars = maxProjectArrangementBars - arrangementTotalBars(current);
      if (remainingBars <= 0) {
        return current;
      }
      const nextIndex = Math.min(selectedArrangementIndex + 1, current.arrangement.length);
      const pastedBlock: ArrangementBlock = {
        ...clipboard,
        bars: Math.min(remainingBars, normalizeArrangementBars(clipboard.bars)),
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
    }, pasteStatus);
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
      setSelectedBlockEditResult(createSelectedBlockEditResult("paste", beforeProject, projectRef.current, beforeIndex, afterIndex));
    } else {
      setSelectedBlockEditResult(null);
      setProjectStatus(
        arrangementTotalBars(projectRef.current) >= maxProjectArrangementBars
          ? `Arrangement is limited to ${maxProjectArrangementBars} bars`
          : "Select an arrangement block"
      );
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
    setBlockMovesOpen(true);
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

  function handleDrumGridKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, lane: DrumLane, step: number): void {
    if (isDrumGridActivationKey(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.click();
      return;
    }
    if (!isDrumGridNavigationKey(event.key)) {
      return;
    }
    event.preventDefault();
    const target = drumGridNavigationTarget({ lane, step }, event.key);
    setSelectedDrumStep(target);
    setSelectedNote(null);
    setSelectedChordIndex(null);
    document.querySelector<HTMLButtonElement>(`[data-testid="drum-step-${target.lane}-${target.step}"]`)?.focus();
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
    stopMixPreview();
    const outcome = auditionSelectedDrumHitEvent({ projectRef, auditionControllerRef, setProjectStatus }, selectedDrumStep);
    if (outcome.ok) {
      setEditorAuditionResult(createDrumEditorAuditionResult());
    } else if (outcome.runtimeDetail) {
      setEditorAuditionResult(createDrumEditorAuditionResult("Audio not started", outcome.runtimeDetail));
    }
  }

  function auditionSelectedNote(): void {
    stopMixPreview();
    const outcome = auditionSelectedNoteEvent({ projectRef, auditionControllerRef, setProjectStatus }, selectedNote);
    if (outcome.ok) {
      setEditorAuditionResult(createNoteEditorAuditionResult());
    } else if (outcome.runtimeDetail) {
      setEditorAuditionResult(createNoteEditorAuditionResult("Audio not started", outcome.runtimeDetail));
    }
  }

  function auditionSelectedChord(): void {
    stopMixPreview();
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
      t("compose.grooveAppliedStatus", {
        label: localizedDrumGroovePresetLabel(preset),
        pattern: projectRef.current.selectedPattern
      })
    );
    setSelectedNote(null);
    setSelectedDrumStep(null);
    setSelectedChordIndex(null);
  }

  function selectNoteGridCell(note: SelectedNote): void {
    setSelectedNote(note);
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
    const target = keyboardCaptureTarget;
    const captureDefaults = keyboardCaptureDefaults[target];
    const pitch = keyboardCapturePitchForKey(key, keyboardCapturePitchLanes(current.key, target, captureDefaults));
    if (!pitch) {
      setInputCaptureResult(null);
      setProjectStatus("Keyboard Capture key is out of range");
      return;
    }

    const placement = resolveKeyboardCapturePlacement(
      current,
      target,
      selectedNote,
      keyboardCaptureStepMode,
      controllerRef.current ? playbackPositionRef.current : null
    );
    if (!placement) {
      setInputCaptureResult(null);
      setProjectStatus("Live Overdub needs active Pattern playback");
      return;
    }
    const step = placement.step;
    const replaceStep = placement.replaceStep;
    const result = createInputCaptureResult({
      source: "keyboard",
      inputLabel: keyboardCaptureKeyLabels[key],
      patternSlot: placement.pattern,
      projectKey: current.key,
      target,
      step,
      pitch,
      defaults: captureDefaults,
      replaceStep,
      liveOverdub: placement.liveOverdub
    });
    const changed = updatePatternSlot(
      placement.pattern,
      (currentPatternData) => addKeyboardCaptureNote(currentPatternData, target, step, pitch, captureDefaults, replaceStep),
      `${placement.liveOverdub ? "Overdubbed" : replaceStep ? "Replaced" : "Captured"} ${
        target === "bass" ? "808" : "Synth"
      } ${pitch}.${step + 1} length ${captureDefaults.length} on Pattern ${placement.pattern}`
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
      setProjectStatus("Bassline pad not found");
      return;
    }

    const beforeProject = projectRef.current;
    const bassNotes = createBasslinePadNotes(projectRef.current.key, pad);
    const changed = updateCurrentPattern(
      (pattern) => (sameBassNotes(pattern.bassNotes, bassNotes) ? pattern : { ...pattern, bassNotes }),
      `${pad.label} bassline applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setBassMoveResult(null);
      setProjectStatus(`${pad.label} bassline already selected`);
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
      setProjectStatus("Bass glide pad not found");
      return;
    }

    const currentBassNotes = projectRef.current.patterns[projectRef.current.selectedPattern].bassNotes;
    if (currentBassNotes.length === 0) {
      setBassMoveResult(null);
      setProjectStatus(`Add a Bass note before using ${pad.label} glide`);
      return;
    }

    const beforeProject = projectRef.current;
    const bassNotes = applyBassGlidePadToNotes(currentBassNotes, pad.id);
    const changed = updateCurrentPattern(
      (pattern) => (sameBassNotes(pattern.bassNotes, bassNotes) ? pattern : { ...pattern, bassNotes }),
      `${pad.label} Bass glide applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setBassMoveResult(null);
      setProjectStatus(`${pad.label} Bass glide already selected`);
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
      setProjectStatus("Bass contour pad not found");
      return;
    }

    const currentBassNotes = projectRef.current.patterns[projectRef.current.selectedPattern].bassNotes;
    if (currentBassNotes.length === 0) {
      setBassMoveResult(null);
      setProjectStatus(`Add a Bass note before using ${contour.label} contour`);
      return;
    }

    const beforeProject = projectRef.current;
    const bassNotes = applyBassContourToNotes(projectRef.current.key, currentBassNotes, contour.id);
    const changed = updateCurrentPattern(
      (pattern) => (sameBassNotes(pattern.bassNotes, bassNotes) ? pattern : { ...pattern, bassNotes }),
      `${contour.label} Bass contour applied to Pattern ${projectRef.current.selectedPattern}`
    );
    if (!changed) {
      setBassMoveResult(null);
      setProjectStatus(`${contour.label} Bass contour already selected`);
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

  function updateSelectedGlide(glide: boolean, status = "Edited Bass glide"): void {
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
    setHarmonyMovesOpen(true);
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
    setHarmonyMovesOpen(true);
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
    setHarmonyMovesOpen(true);
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
    setHarmonyMovesOpen(true);
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
    let patternFull = false;
    const changed = updateCurrentPattern(
      (pattern) => {
        const chord = createNextChordEvent(projectRef.current.key, pattern.chordEvents);
        if (!chord) {
          patternFull = true;
          return pattern;
        }
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
    } else if (patternFull) {
      setProjectStatus("Chord grid is full: one chord per step");
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

  function stopPlayback(): void {
    playbackSessionRef.current += 1;
    activePlaybackModeRef.current = null;
    controllerRef.current?.stop();
    controllerRef.current = null;
    updatePlaybackPosition(null);
    setIsPlaying(false);
  }

  function startPlaybackTarget({
    bars,
    mode,
    startBar
  }: {
    bars?: number;
    mode: PlaybackMode;
    startBar?: number;
  }): boolean {
    const playbackSession = playbackSessionRef.current + 1;
    playbackSessionRef.current = playbackSession;
    activePlaybackModeRef.current = mode;
    try {
      stopMixPreview();
      auditionControllerRef.current?.stop();
      auditionControllerRef.current = null;
      setIsPlaying(true);
      controllerRef.current = startRealtimePlayback(projectRef.current, {
        mode,
        bars,
        startBar,
        getProject: () => projectRef.current,
        onStep: (position) => {
          if (playbackSessionRef.current === playbackSession) {
            updatePlaybackPosition(position);
          }
        },
        onStop: () => {
          if (playbackSessionRef.current !== playbackSession) {
            return;
          }
          activePlaybackModeRef.current = null;
          controllerRef.current = null;
          updatePlaybackPosition(null);
          setIsPlaying(false);
        }
      });
      return true;
    } catch (error) {
      console.error(error);
      if (playbackSessionRef.current === playbackSession) {
        playbackSessionRef.current += 1;
        activePlaybackModeRef.current = null;
        controllerRef.current = null;
        setIsPlaying(false);
        updatePlaybackPosition(null);
      }
      return false;
    }
  }

  function togglePlayback(): void {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (transportLoopScope === "transition" && !arrangementTransitionLoopTarget) {
      setProjectStatus("Transition loop unavailable");
      return;
    }

    startPlaybackTarget({
      mode: transportLoopMode,
      bars: transportLoopBars,
      startBar: transportLoopStartBar
    });
  }

  function toggleOverviewSongPlayback(): void {
    if (isPlaying) {
      const stoppedScope = transportLoopScope;
      stopPlayback();
      setProjectStatus(
        stoppedScope === "arrangement"
          ? "Stopped full-song playback"
          : `Stopped ${transportLoopLabel(stoppedScope)} loop; press Play full song to start from bar 1`
      );
      return;
    }

    selectTransportLoopScope("arrangement", false);
    if (startPlaybackTarget({ mode: "arrangement", startBar: 0 })) {
      setProjectStatus("Playing full song from bar 1");
    }
  }

  function stopMixPreview(status?: string): void {
    const audio = mixPreviewAudioRef.current;
    const objectUrl = mixPreviewUrlRef.current;
    mixPreviewAudioRef.current = null;
    mixPreviewUrlRef.current = null;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    setIsMixPreviewing(false);
    if (status && (audio || objectUrl)) {
      setProjectStatus(status);
    }
  }

  function toggleMixPreview(): void {
    if (mixPreviewAudioRef.current) {
      stopMixPreview("Stopped rendered WAV preview");
      return;
    }

    playbackSessionRef.current += 1;
    activePlaybackModeRef.current = null;
    controllerRef.current?.stop();
    controllerRef.current = null;
    auditionControllerRef.current?.stop();
    auditionControllerRef.current = null;
    updatePlaybackPosition(null);
    setIsPlaying(false);

    try {
      const objectUrl = URL.createObjectURL(createMixWavBlob(projectRef.current));
      mixPreviewUrlRef.current = objectUrl;
      const audio = new Audio(objectUrl);
      mixPreviewAudioRef.current = audio;
      audio.addEventListener("ended", () => {
        if (mixPreviewAudioRef.current === audio) {
          stopMixPreview("Finished rendered WAV preview");
        }
      }, { once: true });
      setIsMixPreviewing(true);
      setProjectStatus("Previewing rendered mix WAV");
      void audio.play().catch((error) => {
        console.error(error);
        if (mixPreviewAudioRef.current === audio) {
          stopMixPreview("WAV preview unavailable");
        }
      });
    } catch (error) {
      console.error(error);
      stopMixPreview();
      setProjectStatus("WAV preview unavailable");
    }
  }

  async function handleSaveProjectAndClose(): Promise<void> {
    const decision = resolveSaveBeforeCloseDecision(
      projectHasUnsavedChangesRef.current,
      localDraftRecoveryRef.current !== null
    );
    if (decision === "review-recovery") {
      setLocalDraftRecoveryDeferred(false);
      setProjectStatus("Restore or clear the recovery draft before closing");
      return;
    }
    const completion = await handleSaveProject();
    if (shouldCloseAfterProjectSave(completion)) {
      window.grooveforge?.closeWindow?.();
    }
  }

  async function handleSaveProject(intentEpoch = claimFixedFeedbackIntent()): Promise<ProjectSaveAttempt> {
    let requestId = 0;
    try {
      commitMasterCeilingDraft();
      flushActiveMetadataDraft("commit");
      requestId = ++projectSaveRequestIdRef.current;
      const projectToSave = projectRef.current;
      const contents = serializeProjectFile(projectToSave);
      // 저장 대화상자가 열린 동안 새 편집이나 다른 저장이 발생할 수 있어 요청 id와 불변 프로젝트 스냅샷을 함께 보관한다.
      const defaultName = projectFileName(projectToSave);
      const result = await window.grooveforge?.saveProject?.(contents, defaultName);
      if (result) {
        if (result.canceled) {
          if (requestId !== projectSaveRequestIdRef.current) {
            return "stale";
          }
          if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
            setProjectFileResult(null);
            setLocalDraftRecoveryResult(null);
          }
          setProjectStatus("Save canceled");
          return "canceled";
        }

        // 성공한 파일이 최신 요청인지, 그 사이 프로젝트가 바뀌지 않았는지 구분해 미저장 표시와 닫기 결정을 보수적으로 유지한다.
        const completion = resolveProjectSaveCompletion(
          requestId,
          projectSaveRequestIdRef.current,
          projectRef.current === projectToSave
        );
        if (completion === "stale") {
          return completion;
        }
        const fileLabel = fileDisplayName(result.filePath);
        setProjectFileLabel(fileLabel);
        if (completion === "saved-current") {
          clearLocalDraftState();
          setProjectHasUnsavedChanges(false);
        } else {
          setProjectHasUnsavedChanges(true);
        }
        showProjectFileResult(
          createProjectFileResult(
            "save",
            fileLabel,
            projectToSave,
            completion === "saved-snapshot",
            result.databaseStored !== false
          ),
          intentEpoch
        );
        const statusParts = [
          completion === "saved-current" ? `Saved ${fileLabel}` : `Saved ${fileLabel}; newer changes remain unsaved`,
          ...(result.databaseStored === false ? ["SQLite library update failed"] : [])
        ];
        setProjectStatus(statusParts.join("; "));
        return completion;
      }

      downloadProjectFile(contents, defaultName);
      const completion = resolveProjectSaveCompletion(
        requestId,
        projectSaveRequestIdRef.current,
        projectRef.current === projectToSave
      );
      if (completion === "stale") {
        return completion;
      }
      setProjectFileLabel(defaultName);
      if (completion === "saved-current") {
        clearLocalDraftState();
        setProjectHasUnsavedChanges(false);
      } else {
        setProjectHasUnsavedChanges(true);
      }
      showProjectFileResult(
        createProjectFileResult("download", defaultName, projectToSave, completion === "saved-snapshot"),
        intentEpoch
      );
      setProjectStatus(
        completion === "saved-current"
          ? `Downloaded ${defaultName}`
          : `Downloaded ${defaultName}; newer changes remain unsaved`
      );
      return completion;
    } catch (error) {
      console.error(error);
      if (requestId !== 0 && requestId !== projectSaveRequestIdRef.current) {
        return "stale";
      }
      if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
        setProjectFileResult(null);
        setLocalDraftRecoveryResult(null);
      }
      setProjectStatus("Save failed");
      return "failed";
    }
  }

  async function handleOpenProject(intentEpoch = claimFixedFeedbackIntent()): Promise<void> {
    flushActiveMetadataDraft("prepare-replacement");
    try {
      const result = await window.grooveforge?.openProject?.();
      if (result) {
        if (result.canceled || !result.contents) {
          flushActiveMetadataDraft("commit");
          if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
            setProjectFileResult(null);
            setLocalDraftRecoveryResult(null);
          }
          setProjectStatus("Open canceled");
          return;
        }
        loadProjectText(result.contents, fileDisplayName(result.filePath), "open", intentEpoch);
        return;
      }

      if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
        setProjectFileResult(null);
        setLocalDraftRecoveryResult(null);
      }
      importInputRef.current?.click();
    } catch (error) {
      console.error(error);
      flushActiveMetadataDraft("commit");
      if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
        setProjectFileResult(null);
        setLocalDraftRecoveryResult(null);
      }
      setProjectStatus(projectFileLoadErrorStatus(error, "Open failed"));
    }
  }

  function handleImportFile(event: ChangeEvent<HTMLInputElement>): void {
    const intentEpoch = claimFixedFeedbackIntent();
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) {
      flushActiveMetadataDraft("commit");
      setProjectFileResult(null);
      setLocalDraftRecoveryResult(null);
      return;
    }
    if (file.size > maxProjectFileBytes) {
      flushActiveMetadataDraft("commit");
      setProjectFileResult(null);
      setLocalDraftRecoveryResult(null);
      setProjectStatus("Project file is too large to open safely");
      return;
    }

    void file
      .text()
      .then((contents) => loadProjectText(contents, file.name, "import", intentEpoch))
      .catch((error: unknown) => {
        console.error(error);
        flushActiveMetadataDraft("commit");
        if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
          setProjectFileResult(null);
          setLocalDraftRecoveryResult(null);
        }
        setProjectStatus(projectFileLoadErrorStatus(error, "Open failed"));
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
    resultProject: ProjectState,
    newerChangesRemain = false,
    databaseStored = true
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
    const savedAction = action === "save" || action === "download";
    const safetyCue = !databaseStored
      ? newerChangesRemain
        ? "The project file contains the Save snapshot, but SQLite library indexing failed and newer local edits remain recoverable."
        : "The project file is durable, but its SQLite library mirror could not be updated."
      : newerChangesRemain
        ? "This durable copy contains the project from when Save started; newer local edits and recovery remain unsaved."
      : savedAction
        ? "Local draft recovery was cleared after this durable project copy."
        : "Loaded file is now current; undo and redo history were reset for this project.";
    const nextCheck = newerChangesRemain
      ? "Save again to include the newer edits in a durable project copy."
      : !databaseStored
        ? "Keep the project file; save again after checking local storage access."
      : savedAction
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
      tone: newerChangesRemain || !databaseStored ? "warn" : "good"
    };
  }

  function loadProjectText(
    contents: string,
    sourceName: string,
    action: "open" | "import",
    intentEpoch = claimFixedFeedbackIntent()
  ): void {
    try {
      const nextProject = parseProjectFile(contents);
      commitMasterCeilingDraft();
      flushActiveMetadataDraft("prepare-replacement");
      const replacementGuard = resolveProjectReplacementGuard(
        projectHasUnsavedChangesRef.current || metadataReplacementDraftDirtyRef.current,
        localDraftRecoveryRef.current !== null
      );
      if (replacementGuard.requiresConfirmation && replacementGuard.warning && !window.confirm(replacementGuard.warning)) {
        flushActiveMetadataDraft("commit");
        if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
          setProjectFileResult(null);
          setLocalDraftRecoveryResult(null);
        }
        setProjectStatus("Open canceled; current project kept");
        return;
      }
      playbackSessionRef.current += 1;
      activePlaybackModeRef.current = null;
      controllerRef.current?.stop();
      controllerRef.current = null;
      replaceProject(nextProject, `Loaded ${sourceName}`, sourceName);
      setLaunchpadOpen(false);
      updatePlaybackPosition(null);
      setIsPlaying(false);
      showProjectFileResult(createProjectFileResult(action, sourceName, nextProject), intentEpoch);
    } catch (error) {
      console.error(error);
      flushActiveMetadataDraft("commit");
      if (fixedFeedbackIntentIsCurrent(intentEpoch)) {
        setProjectFileResult(null);
        setLocalDraftRecoveryResult(null);
      }
      setProjectStatus(projectFileLoadErrorStatus(error));
    }
  }

  type ProjectExportRequest = {
    id: number;
    project: ProjectState;
  };

  function beginProjectExportRequest(): ProjectExportRequest {
    return {
      id: ++projectExportRequestIdRef.current,
      project: projectRef.current
    };
  }

  function projectExportRequestIsCurrent(request: ProjectExportRequest): boolean {
    return shouldCommitProjectExportResult(
      request.id,
      projectExportRequestIdRef.current,
      request.project,
      projectRef.current
    );
  }

  function currentHandoffExportReceiptForProject(): HandoffExportReceipt | null {
    const receipt = handoffExportReceiptRef.current;
    const receiptProject = handoffExportReceiptProjectRef.current;
    return currentProjectExportReceipt(
      receipt && receiptProject ? bindProjectExportReceipt(receiptProject, receipt) : null,
      projectRef.current
    );
  }

  function recordHandoffExportReceipt(receipt: HandoffExportReceipt, request: ProjectExportRequest): boolean {
    if (!projectExportRequestIsCurrent(request)) {
      return false;
    }
    setDeliveryStatusOpen(true);
    setHandoffExportFormatResult(null);
    setHandoffPackageCheckResult(null);
    handoffExportReceiptRef.current = receipt;
    handoffExportReceiptProjectRef.current = request.project;
    setHandoffExportReceipt(receipt);
    setHandoffExportReceiptProject(request.project);
    return true;
  }

  function exactAudioAnalysisReadyForDelivery(actionLabel: string): boolean {
    const ready = exactAudioAnalysisReadyForSurface("Deliver", "deliver");
    if (!ready) {
      setProjectStatus(
        projectAudioAnalysis.status === "pending"
          ? `${actionLabel} waits for exact audio meters`
          : `${actionLabel} unavailable; retry exact audio meters`
      );
    }
    return ready;
  }

  function handleExportWav(): void {
    if (!exactAudioAnalysisReadyForDelivery("WAV export")) {
      return;
    }
    const request = beginProjectExportRequest();
    const exportProject = request.project;
    const currentExportAnalysis = analyzeExport(exportProject);
    const fileName = mixWavFileName(exportProject);
    try {
      exportWav(exportProject);
      if (!recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "wav",
          statusLabel: "Exported WAV",
          fileLabel: fileName,
          detailLabel: `${currentExportAnalysis.status} / ${barCountLabel(arrangementTotalBars(exportProject))}`,
          nextLabel: "Confirm mix download or export stems",
          tone: "good"
        }),
        request
      )) {
        return;
      }
      setProjectStatus("Exported mix WAV");
    } catch (error) {
      if (!projectExportRequestIsCurrent(request)) {
        return;
      }
      console.error(error);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "wav",
          statusLabel: "WAV failed",
          fileLabel: fileName,
          detailLabel: "No mix WAV download completed",
          nextLabel: "Review Export Preflight before retry",
          tone: "danger"
        }),
        request
      );
      setProjectStatus("WAV export failed");
    }
  }

  function handleExportStems(): void {
    if (!exactAudioAnalysisReadyForDelivery("Stem export")) {
      return;
    }
    const request = beginProjectExportRequest();
    const exportProject = request.project;
    const currentStemAnalyses = analyzeStemExports(exportProject);
    try {
      const fileNames = exportStems(exportProject);
      const audibleStems = audibleStemTracks(currentStemAnalyses);
      if (!recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "stems",
          statusLabel: "Exported stems",
          fileLabel: `${fileNames.length} stem files`,
          detailLabel: `${audibleStems.length}/${stemTrackIds.length} audible / ${fileNames.join(" / ")}`,
          nextLabel: "Confirm stem downloads or export MIDI",
          tone: "good"
        }),
        request
      )) {
        return;
      }
      setProjectStatus(`Exported ${fileNames.length} stems`);
    } catch (error) {
      if (!projectExportRequestIsCurrent(request)) {
        return;
      }
      console.error(error);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "stems",
          statusLabel: "Stems failed",
          fileLabel: "No stem files downloaded",
          detailLabel: `${stemWavFileNames(exportProject).length} expected stem files`,
          nextLabel: "Check stem status before retry",
          tone: "danger"
        }),
        request
      );
      setProjectStatus("Stem export failed");
    }
  }

  function handleExportMidi(): void {
    if (!exactAudioAnalysisReadyForDelivery("MIDI export")) {
      return;
    }
    const request = beginProjectExportRequest();
    const exportProject = request.project;
    try {
      const fileName = exportMidi(exportProject);
      if (!recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "midi",
          statusLabel: "Exported MIDI",
          fileLabel: fileName,
          detailLabel: `${barCountLabel(arrangementTotalBars(exportProject))} arrangement MIDI`,
          nextLabel: "Confirm MIDI download or export sheet",
          tone: "good"
        }),
        request
      )) {
        return;
      }
      setProjectStatus("Exported MIDI");
    } catch (error) {
      if (!projectExportRequestIsCurrent(request)) {
        return;
      }
      console.error(error);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "midi",
          statusLabel: "MIDI failed",
          fileLabel: midiFileName(exportProject),
          detailLabel: "No arrangement MIDI download completed",
          nextLabel: "Review arrangement before retry",
          tone: "danger"
        }),
        request
      );
      setProjectStatus("MIDI export failed");
    }
  }

  function handleExportHandoffSheet(): void {
    if (!exactAudioAnalysisReadyForDelivery("Handoff Sheet export")) {
      return;
    }
    const request = beginProjectExportRequest();
    const exportProject = request.project;
    const currentExportAnalysis = analyzeExport(exportProject);
    const currentStemAnalyses = analyzeStemExports(exportProject);
    const fileName = handoffSheetFileName(exportProject);
    try {
      const contents = createHandoffSheet(exportProject, currentExportAnalysis, currentStemAnalyses);
      downloadTextFile(contents, fileName);
      if (!recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "sheet",
          statusLabel: "Exported sheet",
          fileLabel: fileName,
          detailLabel: `${sessionBriefFilledFields(exportProject.sessionBrief)}/4 brief fields`,
          nextLabel: "Confirm sheet download with audio files",
          tone: "good"
        }),
        request
      )) {
        return;
      }
      setProjectStatus(`Exported ${fileName}`);
    } catch (error) {
      if (!projectExportRequestIsCurrent(request)) {
        return;
      }
      console.error(error);
      recordHandoffExportReceipt(
        createHandoffExportReceipt({
          itemId: "sheet",
          statusLabel: "Sheet failed",
          fileLabel: fileName,
          detailLabel: "No Handoff Sheet download completed",
          nextLabel: "Review Session Brief before retry",
          tone: "danger"
        }),
        request
      );
      setProjectStatus("Sheet export failed");
    }
  }

  function handleExportDeliveryBundle(): Promise<void> {
    if (!exactAudioAnalysisReadyForDelivery("Delivery Bundle export")) {
      return Promise.resolve();
    }
    const request = beginProjectExportRequest();
    const exportProject = request.project;
    const currentExportAnalysis = analyzeExport(exportProject);
    const currentStemAnalyses = analyzeStemExports(exportProject);
    const fileName = deliveryBundleZipFileName(exportProject);
    return exportDeliveryBundleZip(exportProject, currentExportAnalysis, currentStemAnalyses)
      .then((result) => {
        if (!recordHandoffExportReceipt(
          createHandoffExportReceipt({
            itemId: "bundle",
            statusLabel: "Exported bundle",
            fileLabel: result.fileName,
            detailLabel: `${result.manifest.artifactCount} artifacts / ${result.manifest.entries.length} checked entries`,
            nextLabel: "Confirm ZIP opens before sending",
            tone: "good"
          }),
          request
        )) {
          return;
        }
        setProjectStatus(`Exported ${result.fileName}`);
      })
      .catch((error) => {
        if (!projectExportRequestIsCurrent(request)) {
          return;
        }
        console.error(error);
        recordHandoffExportReceipt(
          createHandoffExportReceipt({
            itemId: "bundle",
            statusLabel: "Bundle failed",
            fileLabel: fileName,
            detailLabel: "No delivery bundle ZIP download completed",
            nextLabel: "Review Handoff Package Check before retry",
            tone: "danger"
          }),
          request
        );
        setProjectStatus("Bundle export failed");
      });
  }

  function toggleMetronome(): void {
    updateProject(
      (current) => ({ ...current, metronomeEnabled: !current.metronomeEnabled }),
      projectRef.current.metronomeEnabled
        ? t("transport.metronomeOffStatus")
        : t("transport.metronomeOnStatus")
    );
  }

  function switchProjectMode(mode: ProjectState["mode"]): void {
    const beforeProject = projectRef.current;
    const changed = updateProject(
      (current) => (current.mode === mode ? current : { ...current, mode }),
      t("mode.switchedStatus", { mode: mode === "guided" ? t("mode.guided") : t("mode.studio") })
    );
    const afterProject = projectRef.current;

    if (changed) {
      updateModeAwareToolPanels(mode);
    }

    const afterFirstBeatPathSummary = changed
      ? createFirstBeatPathSummary(
          afterProject,
          style,
          workflowNavigatorItems,
          beatMapSummary,
          exportPreflightSummary,
          exportAnalysis
        )
      : firstBeatPathSummary;
    const afterSessionPassSummary = changed
      ? createSessionPassSummary(
          afterProject,
          afterFirstBeatPathSummary,
          reviewQueueSummary,
          finishChecklistSummary,
          exportPreflightSummary
        )
      : sessionPassSummary;
    const afterModeFocusSummary = changed
      ? createModeFocusSummary(
          afterProject,
          composerGuideSummary,
          beatMapSummary,
          reviewQueueSummary,
          finishChecklistSummary
        )
      : modeFocusSummary;

    showModeSwitchResult(
      createModeSwitchResult(
        mode,
        beforeProject,
        afterProject,
        afterModeFocusSummary,
        afterSessionPassSummary,
        afterFirstBeatPathSummary,
        changed,
        locale
      )
    );
    if (!changed) {
      setProjectStatus(
        t("mode.activeTitle", { mode: mode === "guided" ? t("mode.guided") : t("mode.studio") })
      );
    }
  }

  function selectAudienceSessionRow(row: AudienceSessionReadoutRow): void {
    const mode = audienceSessionModeForRow(row);
    switchProjectMode(mode);
    setAudienceSessionActionResult(createAudienceSessionActionResult(row, audienceSessionReadoutSummary, mode));
  }

  function focusAudienceRouteBridgeReadout(): void {
    const summary = createAudienceRouteBridgeSummary({
      audienceSessionSummary: audienceSessionReadoutSummary,
      beatReadinessChecks,
      exportPreflightSummary,
      firstBeatPathSummary,
      handoffPackageCheckSummary,
      productionSnapshotSummary,
      sessionPassSummary
    });
    scrollGuidanceTargetIntoView(
      () => document.querySelector<HTMLElement>('[data-testid="audience-route-bridge"]'),
      "start"
    );
    setProjectStatus(
      `Audience Route Bridge Readout Pattern ${project.selectedPattern}: ${summary.activeAudienceLabel} / ${summary.detailLabel} / ${summary.readinessLane.laneLabel} / ${summary.completionLane.laneLabel} / direct bridge actions unchanged`
    );
  }

  function focusAudienceDeliveryProofBridgeReadout(): void {
    const beginner = audienceSessionReadoutSummary.rows.find((row) => row.id === "beginner");
    const producer = audienceSessionReadoutSummary.rows.find((row) => row.id === "producer");
    scrollGuidanceTargetIntoView(
      () => document.querySelector<HTMLElement>('[data-testid="audience-delivery-proof-bridge"]'),
      "start"
    );
    setProjectStatus(
      `Audience Delivery Proof Bridge Readout Pattern ${project.selectedPattern}: ${
        beginner?.label ?? "First-time composer"
      } Export Preflight deliverables / ${
        producer?.label ?? "Professional producer"
      } Handoff Package Check receipt / local package proof unchanged`
    );
  }

  function focusAudienceSessionAcceptanceReadout(): void {
    const beginner = audienceSessionReadoutSummary.rows.find((row) => row.id === "beginner");
    const producer = audienceSessionReadoutSummary.rows.find((row) => row.id === "producer");
    scrollGuidanceTargetIntoView(
      () => document.querySelector<HTMLElement>('[data-testid="audience-session-acceptance"]'),
      "start"
    );
    setProjectStatus(
      `Audience Session Acceptance Pattern ${project.selectedPattern}: ${
        beginner?.label ?? "First-time composer"
      } guided 8-bar local session / ${
        producer?.label ?? "Professional producer"
      } studio handoff pass / acceptance routes unchanged`
    );
  }

  function focusAudienceSessionProofHandoffReadout(): void {
    const beginner = audienceSessionReadoutSummary.rows.find((row) => row.id === "beginner");
    const producer = audienceSessionReadoutSummary.rows.find((row) => row.id === "producer");
    scrollGuidanceTargetIntoView(
      () => document.querySelector<HTMLElement>('[data-testid="audience-session-proof-handoff"]'),
      "start"
    );
    setProjectStatus(
      `Audience Session Proof Handoff Pattern ${project.selectedPattern}: ${
        beginner?.label ?? "First-time composer"
      } guided export proof / ${
        producer?.label ?? "Professional producer"
      } studio handoff receipt / session proof routes unchanged`
    );
  }

  function focusDualAudienceReadinessRouteReadout(): void {
    const rows = createDualAudienceReadinessRows({
      beatReadinessChecks,
      exportPreflightSummary,
      firstBeatPathSummary,
      productionSnapshotSummary,
      sessionPassSummary
    });
    const readyLaneCount = rows.filter((row) => row.tone === "good").length;
    const priorityRow = rows.find((row) => row.tone === "danger") ?? rows.find((row) => row.tone === "warn") ?? rows[0];
    scrollGuidanceTargetIntoView(
      () => document.querySelector<HTMLElement>('[data-testid="dual-audience-readiness"]'),
      "start"
    );
    setProjectStatus(
      `Dual Audience Readiness Route Readout Pattern ${project.selectedPattern}: ${readyLaneCount}/${rows.length} lanes ready / ${
        priorityRow?.laneLabel ?? "Dual Audience Readiness"
      } / ${priorityRow?.nextCheckLabel ?? "Choose the matching audience lane"} / direct lane actions unchanged`
    );
  }

  function focusAudienceCompletionRouteReadout(): void {
    const rows = createAudienceCompletionRouteRows({
      beatReadinessChecks,
      exportPreflightSummary,
      firstBeatPathSummary,
      handoffPackageCheckSummary,
      productionSnapshotSummary,
      sessionPassSummary
    });
    const readyLaneCount = rows.filter((row) => row.tone === "good").length;
    const priorityRow = rows.find((row) => row.tone === "danger") ?? rows.find((row) => row.tone === "warn") ?? rows[0];
    scrollGuidanceTargetIntoView(
      () => document.querySelector<HTMLElement>('[data-testid="audience-completion-route"]'),
      "start"
    );
    setProjectStatus(
      `Audience Completion Route Readout Pattern ${project.selectedPattern}: ${readyLaneCount}/${rows.length} lanes send-ready / ${
        priorityRow?.laneLabel ?? "Audience Completion Route"
      } / ${priorityRow?.nextCheckLabel ?? "Check the matching completion lane"} / direct completion lane actions unchanged`
    );
  }

  function applyProjectKey(key: string): void {
    const changed = updateProject((current) => retargetProjectKey(current, key), `Retargeted project to ${key}`);
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(null);
    }
  }

  function settleStyleChangeRequest(outcome: QuickActionRunOutcome): void {
    const resolve = styleChangeRequestResolveRef.current;
    styleChangeRequestResolveRef.current = null;
    resolve?.(outcome);
  }

  function restoreStyleChangeFocus(): void {
    const requestedTarget = styleChangeReturnFocusRef.current;
    styleChangeReturnFocusRef.current = null;
    window.requestAnimationFrame(() => {
      if (requestedTarget?.isConnected) {
        requestedTarget.focus();
        return;
      }
      styleSelectRef.current?.focus();
    });
  }

  function cancelStyleChange(): void {
    const preview = styleChangePreview;
    setStyleChangePreview(null);
    if (preview) {
      setProjectStatus(`Style change canceled; ${preview.currentStyleName} beat kept`);
    }
    settleStyleChangeRequest("canceled");
    restoreStyleChangeFocus();
  }

  function confirmStyleChange(): void {
    const preview = styleChangePreview;
    if (!preview) {
      settleStyleChangeRequest("canceled");
      return;
    }

    const changed = updateProject(
      (current) => applyStyleChange(current, preview.targetStyleId),
      `Applied ${preview.targetStyleName} groove`
    );
    setStyleChangePreview(null);
    if (changed) {
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(0);
    }
    settleStyleChangeRequest("complete");
    restoreStyleChangeFocus();
  }

  function selectStyle(styleId: ProjectState["styleId"]): Promise<QuickActionRunOutcome> {
    const preview = createStyleChangePreview(projectRef.current, styleId);
    if (!preview) {
      return Promise.resolve("canceled");
    }

    settleStyleChangeRequest("canceled");
    styleChangeReturnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : styleSelectRef.current;
    setStyleChangePreview(preview);
    setProjectStatus(
      `Review ${preview.currentStyleName} to ${preview.targetStyleName} style change; current beat unchanged`
    );
    return new Promise<QuickActionRunOutcome>((resolve) => {
      styleChangeRequestResolveRef.current = resolve;
    });
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
    scrollGuidanceTargetIntoView(() => beatBlueprintPanelRef.current, "start");
  }

  function applyQuickActionBeatBlueprint(blueprintId: BeatBlueprintId): void {
    applySelectedBeatBlueprint(blueprintId);
    focusBeatBlueprintsPanel();
  }

  function previewQuickActionBeatBlueprint(blueprintId: BeatBlueprintId): void {
    previewBeatBlueprint(blueprintId);
    focusBeatBlueprintsPanel();
  }

  function workspaceZoneForTarget(target: HTMLElement | null): WorkspaceMainTabId | null {
    const zone = target?.closest<HTMLElement>("[data-workspace-zone]")?.dataset.workspaceZone;
    return zone === "overview" || zone === "compose" || zone === "arrange" || zone === "mix" || zone === "deliver"
      ? zone
      : null;
  }

  function workspacePageIdentityForTarget(target: HTMLElement | null): string | null {
    const pageRoot = target?.closest<HTMLElement>("[data-workspace-page]");
    const page = pageRoot?.dataset.workspacePage;
    const zone = workspaceZoneForTarget(pageRoot ?? target);
    return zone && page ? `${zone}:${page}` : null;
  }

  function activateComposeWorkspacePage(page: ComposeWorkspacePageId, announce = false): void {
    if (activeComposeWorkspacePageRef.current === page) {
      return;
    }
    activeComposeWorkspacePageRef.current = page;
    setActiveComposeWorkspacePage(page);
    if (announce) {
      const label = page === "drums" ? "Drums" : page === "notes" ? "Bass / Melody" : "Instruments";
      setProjectStatus(`Opened Compose / ${label} page`);
    }
  }

  function activateArrangeWorkspacePage(page: ArrangeWorkspacePageId, announce = false): void {
    if (activeArrangeWorkspacePageRef.current === page) {
      return;
    }
    activeArrangeWorkspacePageRef.current = page;
    setActiveArrangeWorkspacePage(page);
    if (announce) {
      setProjectStatus(`Opened Arrange / ${page === "timeline" ? "Timeline" : "Structure & Transitions"} page`);
    }
  }

  function activateMixWorkspacePage(page: MixWorkspacePageId, announce = false): void {
    if (activeMixWorkspacePageRef.current === page) {
      return;
    }
    activeMixWorkspacePageRef.current = page;
    setActiveMixWorkspacePage(page);
    if (announce) {
      setProjectStatus(`Opened Mix / ${page === "mixer" ? "Mixer" : "Master"} page`);
    }
  }

  function activateDeliverWorkspacePage(page: DeliverWorkspacePageId, announce = false): void {
    if (activeDeliverWorkspacePageRef.current === page) {
      return;
    }
    activeDeliverWorkspacePageRef.current = page;
    setActiveDeliverWorkspacePage(page);
    if (announce) {
      setProjectStatus(`Opened Deliver / ${page === "exports" ? "Exports" : "Checks & Package"} page`);
    }
  }

  function activateWorkspacePageForTarget(target: HTMLElement | null): void {
    const pageRoot = target?.closest<HTMLElement>("[data-workspace-page]");
    const page = pageRoot?.dataset.workspacePage;
    const zone = workspaceZoneForTarget(pageRoot ?? target);
    if (zone === "compose" && (page === "drums" || page === "notes" || page === "instruments")) {
      if (activeComposeWorkspacePageRef.current !== page) {
        // 탭 DOM을 즉시 교체해야 이어지는 포커스/측정이 숨은 이전 페이지를 읽지 않으므로 이 경계만 동기 커밋한다.
        flushSync(() => activateComposeWorkspacePage(page));
      }
      return;
    }
    if (zone === "arrange" && (page === "timeline" || page === "structure")) {
      if (activeArrangeWorkspacePageRef.current !== page) {
        flushSync(() => activateArrangeWorkspacePage(page));
      }
      return;
    }
    if (zone === "mix" && (page === "mixer" || page === "master") && activeMixWorkspacePageRef.current !== page) {
      flushSync(() => activateMixWorkspacePage(page));
      return;
    }
    if (zone === "deliver" && (page === "exports" || page === "checks")) {
      if (activeDeliverWorkspacePageRef.current !== page) {
        flushSync(() => activateDeliverWorkspacePage(page));
      }
    }
  }

  function activateWorkspaceZone(zone: WorkspaceMainTabId): void {
    if (activeWorkspaceZoneRef.current === zone) {
      return;
    }

    // 상태 ref와 렌더된 탭을 한 커밋에 맞춰 같은 이벤트 안의 후속 라우팅이 최신 페이지를 보게 한다.
    flushSync(() => {
      activeWorkspaceZoneRef.current = zone;
      setActiveWorkspaceZone(zone);
      if (projectRef.current.mode === "studio" && zone !== "overview") {
        expandStudioWorkspaceZone(zone);
      }
    });
  }

  function retryCurrentProjectAudioAnalysis(): void {
    const sourceZone = activeWorkspaceZoneRef.current;
    if (sourceZone === "overview") {
      projectAudioAnalysis.retry();
      setProjectStatus("Retrying exact audio meters in Overview");
      return;
    }
    const retryZone = projectAudioAnalysisRetryZone(sourceZone);
    if (retryZone !== sourceZone) {
      activateWorkspaceZone(retryZone);
    }
    projectAudioAnalysis.retry();
    setProjectStatus(
      sourceZone === retryZone
        ? "Retrying exact audio meters"
        : `Moved from ${sourceZone} to Mix to retry exact audio meters`
    );
  }

  function exactAudioAnalysisReadyForSurface(
    surface: "Mix" | "Master" | "Deliver",
    target: Extract<WorkspaceRouteTargetId, "mix" | "master" | "deliver">
  ): boolean {
    if (projectAudioAnalysis.status === "ready") {
      return true;
    }
    routeWorkspaceTargetIntoView(target, "start");
    setProjectStatus(
      projectAudioAnalysis.status === "pending"
        ? `${surface} is analyzing exact meters for the current project`
        : `${surface} meters unavailable; use Retry meters`
    );
    return false;
  }

  function resolveScrollTarget(target: ScrollTargetResolver): HTMLElement | null {
    return typeof target === "function" ? target() : target;
  }

  function cancelScheduledWorkspaceTargetReveal(): void {
    if (workspaceTargetRevealFrameRef.current === null) {
      return;
    }
    window.cancelAnimationFrame(workspaceTargetRevealFrameRef.current);
    workspaceTargetRevealFrameRef.current = null;
  }

  function revealWorkspaceTargetAfterLayout(
    targetResolver: ScrollTargetResolver,
    block: ScrollLogicalPosition = "start",
    zoneHint: WorkspaceMainTabId | null = null,
    focusTarget = false
  ): void {
    cancelScheduledWorkspaceTargetReveal();
    let remainingLayoutFrames = 2;
    const reveal = (): void => {
      remainingLayoutFrames -= 1;
      if (remainingLayoutFrames > 0) {
        workspaceTargetRevealFrameRef.current = window.requestAnimationFrame(reveal);
        return;
      }

      workspaceTargetRevealFrameRef.current = null;
      scrollWorkspaceTargetIntoView(targetResolver, block, zoneHint);
      if (focusTarget) {
        resolveScrollTarget(targetResolver)?.focus({ preventScroll: true });
      }
    };
    workspaceTargetRevealFrameRef.current = window.requestAnimationFrame(reveal);
  }

  function workspaceRouteZone(target: WorkspaceRouteTargetId): WorkflowZoneId | null {
    switch (target) {
      case "compose":
      case "notes":
      case "sound":
        return "compose";
      case "arrange":
      case "arrange-structure":
      case "arrange-mute-map":
        return "arrange";
      case "mix":
      case "master":
        return "mix";
      case "deliver":
        return "deliver";
      case "transport":
        return null;
    }
  }

  function workspaceRouteElement(target: WorkspaceRouteTargetId): HTMLElement | null {
    switch (target) {
      case "transport":
        return transportPanelRef.current;
      case "compose":
        return composePanelRef.current;
      case "notes":
        return notePanelRef.current;
      case "sound":
        return soundPanelRef.current;
      case "arrange":
        return arrangePanelRef.current;
      case "arrange-structure":
        return arrangeStructurePanelRef.current;
      case "arrange-mute-map":
        return arrangementMuteMapPanelRef.current;
      case "mix":
        return mixPanelRef.current;
      case "master":
        return masterPanelRef.current;
      case "deliver":
        return deliverPanelRef.current;
    }
  }

  function activateWorkspaceRoutePage(target: WorkspaceRouteTargetId): void {
    switch (target) {
      case "compose":
        activateComposeWorkspacePage("drums");
        return;
      case "notes":
        activateComposeWorkspacePage("notes");
        return;
      case "sound":
        activateComposeWorkspacePage("instruments");
        return;
      case "arrange":
        activateArrangeWorkspacePage("timeline");
        return;
      case "arrange-structure":
      case "arrange-mute-map":
        activateArrangeWorkspacePage("structure");
        setArrangementToolsOpen(true);
        return;
      case "mix":
        activateMixWorkspacePage("mixer");
        return;
      case "master":
        activateMixWorkspacePage("master");
        return;
      default:
        return;
    }
  }

  function sessionBriefFieldElement(field: keyof SessionBrief): HTMLElement | null {
    switch (field) {
      case "artist":
        return sessionBriefArtistRef.current;
      case "vibe":
        return sessionBriefVibeRef.current;
      case "reference":
        return sessionBriefReferenceRef.current;
      case "notes":
        return sessionBriefNotesRef.current;
    }
  }

  function routeWorkspaceTargetIntoView(
    target: WorkspaceRouteTargetId,
    block: ScrollLogicalPosition = "start"
  ): void {
    cancelScheduledWorkspaceTargetReveal();
    const zone = workspaceRouteZone(target);
    // 상위 탭과 목적 하위 탭을 순서대로 실제 DOM에 드러낸 다음 요소를 조회해야 숨은 Activity의 0px 위치를 읽지 않는다.
    if (zone !== null) {
      activateWorkspaceZone(zone);
    }
    flushSync(() => activateWorkspaceRoutePage(target));
    if (target === "sound" && !soundDesignOpen) {
      flushSync(() => setSoundDesignOpen(true));
    }
    if (target === "arrange-mute-map") {
      // 포커스는 Quick Actions 목적지에 남겨 두고 Structure 패널의 content-visibility만 먼저 깨운다.
      arrangeStructurePanelRef.current?.scrollIntoView({ block, behavior: "auto" });
      requestAnimationFrame(() => {
        scrollWorkspaceTargetIntoView(() => workspaceRouteElement(target), block, zone);
      });
      return;
    }
    scrollWorkspaceTargetIntoView(() => workspaceRouteElement(target), block, zone);
  }

  function scrollWorkspaceTargetIntoView(
    targetResolver: ScrollTargetResolver,
    block: ScrollLogicalPosition = "start",
    zoneHint: WorkspaceMainTabId | null = null
  ): void {
    cancelScheduledWorkspaceTargetReveal();
    const initialTarget = resolveScrollTarget(targetResolver);
    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const activeElementZone = workspaceZoneForTarget(activeElement);
    const activeElementPage = workspacePageIdentityForTarget(activeElement);
    const zone = zoneHint ?? workspaceZoneForTarget(initialTarget);
    const targetPage = workspacePageIdentityForTarget(initialTarget);
    const dismissedModalFocus =
      activeElement === document.body ||
      Boolean(activeElement?.closest('[role="dialog"], [data-testid="quick-actions"]'));
    const shouldTransferFocus =
      dismissedModalFocus ||
      (zone !== null && activeElementZone !== null && activeElementZone !== zone) ||
      (targetPage !== null && activeElementPage !== null && activeElementPage !== targetPage);
    if (zone) {
      activateWorkspaceZone(zone);
    }
    activateWorkspacePageForTarget(initialTarget);

    const target =
      resolveScrollTarget(targetResolver) ??
      (zone ? document.getElementById(`workspace-panel-${zone}`) : initialTarget);
    if (!target) {
      return;
    }

    // 같은 페이지 안에서 사용자가 유지하던 입력 포커스는 빼앗지 않고, 모달 종료나 페이지 전환 때만 목적지로 옮긴다.
    if (shouldTransferFocus) {
      if (dismissedModalFocus && !target.matches('a[href], button, input, select, textarea, [tabindex]')) {
        target.tabIndex = -1;
      }
      target.focus({ preventScroll: true });
      if (zone && document.activeElement !== target) {
        document.getElementById(`workspace-panel-${zone}`)?.focus({ preventScroll: true });
      }
    }

    target.scrollIntoView({ block, behavior: "auto" });
    if (!zone || block !== "start") {
      return;
    }

    const navigator = workflowNavigatorPanelRef.current;
    if (!navigator || getComputedStyle(navigator).position !== "sticky") {
      return;
    }

    const targetTop = target.getBoundingClientRect().top;
    const desiredTop = navigator.getBoundingClientRect().bottom + 12;
    if (targetTop < desiredTop) {
      window.scrollBy({ top: targetTop - desiredTop, behavior: "auto" });
    }
  }

  function scrollGuidanceTargetIntoView(
    targetResolver: ScrollTargetResolver,
    block: ScrollLogicalPosition = "start"
  ): void {
    const deferredTarget = typeof targetResolver === "function";
    const initialTarget = resolveScrollTarget(targetResolver);
    const initialGuidanceCenter = guidanceCenterRef.current;
    const targetInsideGuidance = deferredTarget || Boolean(initialGuidanceCenter?.contains(initialTarget));
    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dismissedModalFocus =
      activeElement === document.body ||
      Boolean(activeElement?.closest('[role="dialog"], [data-testid="quick-actions"]'));
    if (targetInsideGuidance && initialGuidanceCenter && !initialGuidanceCenter.open) {
      flushSync(() => setGuidanceCenterOpen(true));
    }

    const guidanceCenter = guidanceCenterRef.current ?? initialGuidanceCenter;
    const target = resolveScrollTarget(targetResolver) ?? (targetInsideGuidance ? guidanceCenter : initialTarget);
    if (!target) {
      return;
    }

    if (dismissedModalFocus) {
      if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) {
        target.tabIndex = -1;
      }
      target.focus({ preventScroll: true });
      if (document.activeElement !== target) {
        guidanceCenter?.querySelector<HTMLElement>('[data-testid="guidance-center-toggle"]')?.focus({
          preventScroll: true
        });
      }
    }

    target.scrollIntoView({ block, behavior: "auto" });
    if (!targetInsideGuidance || block !== "start") {
      return;
    }

    const navigator = workflowNavigatorPanelRef.current;
    if (!navigator || getComputedStyle(navigator).position !== "sticky") {
      return;
    }

    const targetTop = target.getBoundingClientRect().top;
    const desiredTop = navigator.getBoundingClientRect().bottom + 12;
    if (targetTop < desiredTop) {
      window.scrollBy({ top: targetTop - desiredTop, behavior: "auto" });
    }
  }

  function focusAudienceStarterLanding(starterId: AudienceStarterProjectId): void {
    window.setTimeout(() => {
      if (starterId === "producer") {
        flushSync(() => {
          setMasterReviewOpen(true);
          setMasterReviewQueueOpen(true);
        });
        routeWorkspaceTargetIntoView("master", "start");
        scrollWorkspaceTargetIntoView(() => reviewQueuePanelRef.current, "start", "mix");
        reviewQueuePanelRef.current?.focus({ preventScroll: true });
        return;
      }

      routeWorkspaceTargetIntoView("compose");
      composePanelRef.current?.focus({ preventScroll: true });
    }, 0);
  }

  function createAudienceStarter(
    starterId: AudienceStarterProjectId,
    options: { verifyReplacementGuard?: boolean } = {}
  ) {
    const label = audienceStarterProjectLabel(starterId);
    flushActiveMetadataDraft("prepare-replacement");
    const pendingMasterCeilingChange =
      masterCeilingEditing &&
      resolveMasterCeilingDraft(projectRef.current, masterCeilingDraft) !== projectMasterCeilingDb(projectRef.current);
    const replacementGuard = resolveStarterProjectReplacementGuard(
      projectHasUnsavedChangesRef.current || pendingMasterCeilingChange || metadataReplacementDraftDirtyRef.current,
      localDraftRecoveryRef.current !== null,
      `${label} starter project`
    );
    if (
      replacementGuard.requiresConfirmation &&
      replacementGuard.warning &&
      (!quickActionsAuditActive || options.verifyReplacementGuard === true) &&
      !window.confirm(replacementGuard.warning)
    ) {
      flushActiveMetadataDraft("commit");
      setProjectStatus(`Starter canceled; ${projectRef.current.title} kept`);
      return null;
    }

    const beforeProject = projectRef.current;
    const resultAction = quickActions.find((action) => action.id === `audience-starter-${starterId}`) ?? null;
    const changed = updateProject(() => createAudienceStarterProject(starterId), `Built ${label} starter project`);
    setLaunchpadOpen(false);
    if (changed) {
      advanceMetadataDraftRevision();
      resetProjectDependentUiState(projectRef.current);
      resetMasterCeilingEditor(projectRef.current);
      setSelectedNote(null);
      setSelectedDrumStep(null);
      setSelectedChordIndex(0);
      setSelectedArrangementIndex(0);
      selectTransportLoopScope("arrangement", false);
      focusAudienceStarterLanding(starterId);
      if (resultAction) {
        const result = createQuickActionResult(
          resultAction,
          beforeProject,
          projectRef.current,
          "complete",
          0,
          currentHandoffExportReceiptForProject(),
          null
        );
        showQuickActionResult(result);
        flushSync(() => setAudienceStarterResult(result));
        setQuickActionRecents((recents) => prependQuickActionRecent(recents, resultAction, result));
        setProjectStatus(`Built ${label} starter project`);
        return result;
      }
      setProjectStatus(`Built ${label} starter project`);
    }
    return null;
  }

  function runAudienceStarterQuickAction(starterId: AudienceStarterProjectId): QuickActionRunOutcome {
    return createAudienceStarter(starterId) ? "complete" : "canceled";
  }

  function openAudienceStarterFollowup(starterId: AudienceStarterProjectId, route: AudienceStarterFollowupRoute): void {
    if (starterId === "beginner") {
      if (route === "primary") {
        const nextStep =
          firstBeatPathSummary.steps.find((step) => step.id === firstBeatPathSummary.nextStepId) ??
          firstBeatPathSummary.steps.find((step) => step.tone !== "good") ??
          firstBeatPathSummary.steps[0] ??
          null;

        if (nextStep) {
          jumpToFirstBeatPathStep(nextStep);
          return;
        }

        setProjectStatus("Audience Starter follow-up: no First Beat Path target available");
        return;
      }

      focusDualAudienceReadinessRouteReadout();
      return;
    }

    if (route === "primary") {
      focusReviewQueueRouteReadout();
      return;
    }

    if (route === "readiness") {
      const exportCard = activeExportPreflightQuickActionCard(exportPreflightSummary);
      if (exportCard) {
        focusExportPreflightCard(exportCard);
        return;
      }

      focusExportPreflightRouteReadout();
      return;
    }

    const packageCard = activeHandoffPackageCheckQuickActionCard(handoffPackageCheckSummary);
    if (packageCard) {
      focusHandoffPackageCheckCard(packageCard);
      return;
    }

    focusHandoffPack();
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
    updateProjectMetadata((current) => {
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
    }, `Updated ${sessionBriefFieldLabel(field)} brief`, true);
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

    setSessionBriefCompassFocusId(card.id);
    setSessionBriefCompassResult(createSessionBriefCompassFocusResult(card, sessionBriefCompassSummary, projectRef.current.sessionBrief));
    if (target === "deliver") {
      routeWorkspaceTargetIntoView("deliver");
    } else {
      scrollGuidanceTargetIntoView(() => sessionBriefFieldElement(target), "center");
      sessionBriefFieldElement(target)?.focus({ preventScroll: true });
    }
    setProjectStatus(`Brief ${card.label}: ${card.value}`);
  }

  function focusReferenceAlignmentCard(card: ReferenceAlignmentCard): void {
    setReferenceAlignmentFocusId(card.id);
    if (card.focusTarget === "arrange" || card.focusTarget === "master" || card.focusTarget === "deliver") {
      routeWorkspaceTargetIntoView(card.focusTarget);
    } else {
      const field = card.focusTarget;
      scrollGuidanceTargetIntoView(() => sessionBriefFieldElement(field), "center");
      sessionBriefFieldElement(field)?.focus({ preventScroll: true });
    }
    setReferenceAlignmentResult(createReferenceAlignmentFocusResult(card, referenceAlignmentSummary));
    setProjectStatus(`Reference Alignment ${card.label}: ${card.value}`);
  }

  function focusReferenceAlignmentRouteReadout(): void {
    const card = activeReferenceAlignmentQuickActionCard(referenceAlignmentSummary);
    scrollGuidanceTargetIntoView(() => referenceAlignmentPanelRef.current, "start");
    setProjectStatus(
      `Reference Alignment Route Readout Pattern ${project.selectedPattern}: ${referenceAlignmentRouteLabel(
        card,
        referenceAlignmentSummary
      )} / ${card.value} / direct reference-alignment-card-${card.id} unchanged / ${card.focusLabel} panel`
    );
  }

  function focusMixCoachCheck(check: MixCoachCheck): void {
    if (!exactAudioAnalysisReadyForSurface("Master", "master")) {
      return;
    }
    setMasterReviewOpen(true);
    setMasterMixCoachOpen(true);
    const currentChecks = createMixCoachChecks(exportAnalysis, stemAnalyses);
    const currentCheck = currentChecks.find((candidate) => candidate.id === check.id) ?? check;
    setMixCoachFocusId(check.id);
    setMixCoachResult(createMixCoachFocusResult(currentCheck, currentChecks));
    routeWorkspaceTargetIntoView("master", "center");
    setProjectStatus(`Review ${currentCheck.label}: ${currentCheck.status}`);
  }

  function focusMixCoach(): MixCoachCheck | null {
    if (!exactAudioAnalysisReadyForSurface("Master", "master")) {
      return null;
    }
    setMasterReviewOpen(true);
    setMasterMixCoachOpen(true);
    const check = mixCoachFocusCheck(createMixCoachChecks(exportAnalysis, stemAnalyses));
    if (check) {
      focusMixCoachCheck(check);
    } else {
      setMixCoachFocusId(null);
      setMixCoachResult(null);
      routeWorkspaceTargetIntoView("master", "center");
    }
    return check;
  }

  function focusStemAuditionReadout(): void {
    setMixReviewOpen(true);
    routeWorkspaceTargetIntoView("mix", "start");
    setProjectStatus(
      `Stem Audition ${stemAuditionReadout.statusLabel}: ${stemAuditionReadout.roleLabel} / ${stemAuditionReadout.detailLabel} / Decision ${stemAuditionDecision.targetLabel}`
    );
  }

  function focusStemAuditionRouteReadout(): void {
    setMixReviewOpen(true);
    const pad = stemAuditionDecision.targetId
      ? stemAuditionPadOptions.find((option) => option.id === stemAuditionDecision.targetId) ?? null
      : null;
    const routeLabel = pad ? stemAuditionRouteLabel(pad) : "No Stem Audition route available";
    const directCommand = pad ? `stem-audition-${pad.id}` : "stem-audition";
    routeWorkspaceTargetIntoView("mix", "start");
    setProjectStatus(
      `Stem Audition Route Readout Pattern ${project.selectedPattern}: ${routeLabel} / ${stemAuditionReadout.roleLabel} / Decision ${stemAuditionDecision.targetLabel} / direct ${directCommand} unchanged`
    );
  }

  function focusMixSnapshotReadout(): void {
    if (!exactAudioAnalysisReadyForSurface("Mix", "mix")) {
      return;
    }
    setMixReviewOpen(true);
    routeWorkspaceTargetIntoView("mix", "start");
    setProjectStatus(
      `Mix Snapshot A/B ${mixSnapshotComparison.statusLabel}: ${mixSnapshotComparison.winnerLabel} / Decision ${mixSnapshotComparison.decisionActionLabel}`
    );
  }

  function focusMixSnapshotRouteReadout(): void {
    if (!exactAudioAnalysisReadyForSurface("Mix", "mix")) {
      return;
    }
    setMixReviewOpen(true);
    const directCommand = `mix-snapshot-${mixSnapshotComparison.decisionActionId}`;
    routeWorkspaceTargetIntoView("mix", "start");
    setProjectStatus(
      `Mix Snapshot Route Readout Pattern ${project.selectedPattern}: ${mixSnapshotRouteLabel(
        mixSnapshotComparison.decisionActionId
      )} / ${mixSnapshotComparison.statusLabel} / Decision ${mixSnapshotComparison.decisionActionLabel} / direct ${directCommand} unchanged`
    );
  }

  function focusMixBalanceReadout(): void {
    setMixMovesOpen(true);
    routeWorkspaceTargetIntoView("mix", "start");
    setProjectStatus(
      `Mix Balance ${mixBalancePreviewSummary.statusLabel}: ${mixBalancePreviewSummary.padLabel} / ${mixBalancePreviewSummary.channelLabel}`
    );
  }

  function focusMixBalanceRouteReadout(): void {
    setMixMovesOpen(true);
    const pad =
      mixBalancePadOptions.find((option) => option.id === mixBalancePreviewSummary.padId) ??
      mixBalancePadOptions[0] ??
      null;
    const routeLabel = pad
      ? mixBalanceRouteLabel(project.mixer, applyMixBalancePadToMixer(project.mixer, pad))
      : "No Mix Balance route needed";
    routeWorkspaceTargetIntoView("mix", "start");
    setProjectStatus(
      `Mix Balance Route Readout Pattern ${project.selectedPattern}: ${routeLabel} / ${mixBalancePreviewSummary.padLabel} / ${mixBalancePreviewSummary.channelLabel} / direct Mix Balance unchanged`
    );
  }

  function focusSpaceFxReadout(): void {
    setMixMovesOpen(true);
    routeWorkspaceTargetIntoView("mix", "start");
    setProjectStatus(
      `Space FX ${spaceFxPreviewSummary.statusLabel}: ${spaceFxPreviewSummary.padLabel} / ${spaceFxPreviewSummary.sendLabel}`
    );
  }

  function focusSpaceFxRouteReadout(): void {
    setMixMovesOpen(true);
    const pad =
      spaceFxPadOptions.find((option) => option.id === spaceFxPreviewSummary.padId) ??
      spaceFxPadOptions[0] ??
      null;
    const routeLabel = pad
      ? spaceFxRouteLabel(project.mixer, applySpaceFxPadToMixer(project.mixer, pad))
      : "No Space FX route needed";
    routeWorkspaceTargetIntoView("mix", "start");
    setProjectStatus(
      `Space FX Route Readout Pattern ${project.selectedPattern}: ${routeLabel} / ${spaceFxPreviewSummary.padLabel} / ${spaceFxPreviewSummary.sendLabel} / direct Space FX unchanged`
    );
  }

  function focusPatternChainReadout(): void {
    routeWorkspaceTargetIntoView("arrange-structure", "start");
    setProjectStatus(
      `Pattern Chain ${patternChainPreviewSummary.statusLabel}: ${patternChainPreviewSummary.actionLabel} / ${patternChainPreviewSummary.sequenceLabel}`
    );
  }

  function focusChainExpandReadout(): void {
    const outline = expandPatternChainArrangement(projectRef.current.arrangement);
    routeWorkspaceTargetIntoView("arrange-structure", "start");
    setProjectStatus(
      `Chain Expand ${patternChainPreviewSummary.statusLabel}: ${patternChainReadout(outline)} / ${barCountLabel(
        arrangementTotalBars({ ...projectRef.current, arrangement: outline })
      )}`
    );
  }

  function focusArrangementTemplateReadout(): void {
    const summary = createArrangementTemplatePreviewSummary(projectRef.current.arrangement);
    routeWorkspaceTargetIntoView("arrange-structure", "start");
    setProjectStatus(
      `Arrangement Template ${summary.statusLabel}: ${summary.templateLabel} / ${summary.sectionLabel} / ${summary.patternLabel}`
    );
  }

  function focusArrangementArcReadout(): void {
    routeWorkspaceTargetIntoView("arrange-structure", "start");
    setProjectStatus(
      `Arrangement Arc ${arrangementArcPreviewSummary.statusLabel}: ${arrangementArcPreviewSummary.padLabel} / ${arrangementArcPreviewSummary.energyLabel} / ${arrangementArcPreviewSummary.muteLabel}`
    );
  }

  function focusArrangementFocusReadout(): void {
    routeWorkspaceTargetIntoView("arrange-structure", "start");
    setProjectStatus(
      arrangementFocusPreviewSummary
        ? `Arrangement Focus ${arrangementFocusPreviewSummary.statusLabel}: ${arrangementFocusPreviewSummary.presetLabel} / ${arrangementFocusPreviewSummary.blockLabel} / ${arrangementFocusPreviewSummary.sectionLabel}`
        : "Arrangement Focus: select an arrangement block before applying a focus preset."
    );
  }

  function focusArrangementMoveReadout(): void {
    routeWorkspaceTargetIntoView("arrange", "start");
    setProjectStatus(
      arrangementMovePrioritySummary.presetId !== "none"
        ? `Arrangement Move ${arrangementMovePrioritySummary.statusLabel}: ${arrangementMovePrioritySummary.presetLabel} / ${arrangementMovePrioritySummary.scopeLabel} / ${arrangementMovePrioritySummary.impactLabel}`
        : "Arrangement Move: select an arrangement block before applying a move."
    );
  }

  function focusSectionLocatorReadout(): void {
    const summary = createSectionLocatorCueDecisionSummary(sectionLocatorPads, isPlaying);
    routeWorkspaceTargetIntoView("arrange-structure", "start");
    setProjectStatus(
      summary.section
        ? `Section Locator ${summary.statusLabel}: ${summary.sectionLabel} / ${summary.metricLabel} / ${summary.detailLabel}`
        : "Section Locator: add an arrangement section before cueing."
    );
  }

  function focusSongFormOverviewReadout(): void {
    const priority = createSongFormPrioritySummary(songFormOverviewSummary);
    routeWorkspaceTargetIntoView("arrange-structure", "start");
    setProjectStatus(
      priority.targetIndex === null
        ? `Song Form Overview ${priority.statusLabel}: ${priority.reasonLabel}`
        : `Song Form Overview ${priority.statusLabel}: ${priority.metricLabel} / ${priority.targetLabel} / ${priority.nextCheckLabel}`
    );
  }

  function exactCurrentExportAnalysis(): ExportAnalysis | null {
    const currentProject = projectRef.current;
    return !projectAudioAnalysis.pending &&
      projectAudioAnalysis.identity === projectAudioAnalysisIdentity(currentProject)
      ? exportAnalysis
      : null;
  }

  function focusMasterOutputRole(): void {
    const analysis = exactCurrentExportAnalysis();
    if (!analysis) {
      setProjectStatus("Audio meters updating; retry Master Output Role");
      return;
    }
    const summary = createMasterOutputRoleSummary(projectRef.current, analysis, locale);
    routeWorkspaceTargetIntoView("master", "center");
    setProjectStatus(`Master Output Role: ${summary.roleLabel} / ${summary.detailLabel}`);
  }

  function focusMasterFinishReadout(): void {
    routeWorkspaceTargetIntoView("master", "center");
    setProjectStatus(
      `Master Finish ${masterFinishPreviewSummary.statusLabel}: ${masterFinishPreviewSummary.padLabel} / ${masterFinishPreviewSummary.outputLabel}`
    );
  }

  function focusMasterFinishRouteReadout(): void {
    const directCommand = `master-finish-${masterFinishPreviewSummary.padId}`;
    routeWorkspaceTargetIntoView("master", "center");
    setProjectStatus(
      `Master Finish Route Readout Pattern ${project.selectedPattern}: ${masterFinishRouteLabel(
        masterFinishPreviewSummary.padId
      )} / ${masterFinishPreviewSummary.statusLabel} / ${masterFinishPreviewSummary.presetLabel} / ${masterFinishPreviewSummary.outputLabel} / direct ${directCommand} unchanged`
    );
  }

  function focusMasterAutomationReadout(): void {
    routeWorkspaceTargetIntoView("master", "center");
    setProjectStatus(
      `Master Automation ${masterAutomationPreviewSummary.statusLabel}: ${masterAutomationPreviewSummary.padLabel} / ${masterAutomationPreviewSummary.rangeLabel}`
    );
  }

  function focusMasterAutomationRouteReadout(): void {
    const directCommand = `master-automation-${masterAutomationPreviewSummary.padId}`;
    routeWorkspaceTargetIntoView("master", "center");
    setProjectStatus(
      `Master Automation Route Readout Pattern ${project.selectedPattern}: ${masterAutomationRouteLabel(
        masterAutomationPreviewSummary.padId
      )} / ${masterAutomationPreviewSummary.statusLabel} / ${masterAutomationPreviewSummary.eventLabel} / ${masterAutomationPreviewSummary.rangeLabel} / direct ${directCommand} unchanged`
    );
  }

  function focusExportMeter(): void {
    setMasterReviewOpen(true);
    const analysis = exactCurrentExportAnalysis();
    if (!analysis) {
      setProjectStatus("Audio meters updating; retry Export Meter");
      return;
    }
    routeWorkspaceTargetIntoView("master", "center");
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
    routeWorkspaceTargetIntoView(zone);
  }

  function selectOverviewNavigatorTab(): void {
    if (guidanceCenterRef.current?.open) {
      flushSync(() => setGuidanceCenterOpen(false));
    }
    // 기능 탭 이동 결과와 이전 Quick Action 결과를 같은 fixed 상태 영역에 겹쳐 두지 않는다.
    beginFixedFeedbackIntent();
    clearFixedFeedbackLane();
    scrollWorkspaceTargetIntoView(
      () => document.getElementById("workspace-panel-overview"),
      "start",
      "overview"
    );
    setProjectStatus("Opened project Overview");
  }

  function jumpToWorkflowNavigatorItem(item: WorkflowNavigatorItem): void {
    jumpToWorkflowZone(item.id);
    showWorkflowNavigatorResult(createWorkflowNavigatorJumpResult(item, workflowNavigatorItems));
    setProjectStatus(`Workflow ${item.label}: ${item.value}`);
  }

  function selectWorkflowNavigatorTab(item: WorkflowNavigatorItem): void {
    // 사용자가 기능 탭을 직접 고르면 작업 공간을 전경으로 둔다. Guide 경로는 목적지를 보여 주면서도
    // 안내 패널을 의도적으로 유지할 수 있도록 jumpToWorkflowNavigatorItem 흐름을 계속 사용한다.
    if (guidanceCenterRef.current?.open) {
      flushSync(() => setGuidanceCenterOpen(false));
    }
    // 바깥 Compose/Mix 탭으로 돌아오면 마지막으로 편집한 안쪽 페이지를 유지한다.
    // 명시적 경로는 compose/notes/sound 또는 mix/master 목적지를 사용해 정확한 하위 페이지를 열 수 있다.
    scrollWorkspaceTargetIntoView(
      () => document.getElementById(`workspace-panel-${item.id}`),
      "start",
      item.id
    );
    showWorkflowNavigatorResult(createWorkflowNavigatorJumpResult(item, workflowNavigatorItems));
    setProjectStatus(`Workflow ${item.label}: ${item.value}`);
  }

  function focusWorkflowNavigatorRouteReadout(): void {
    const spotlight = createWorkflowSpotlightSummary(workflowNavigatorItems);
    const item = spotlight.zoneId ? workflowNavigatorItems.find((candidate) => candidate.id === spotlight.zoneId) ?? null : null;
    scrollWorkspaceTargetIntoView(workflowNavigatorPanelRef.current, "start");
    setProjectStatus(
      item
        ? `Workflow Navigator Route Readout Pattern ${project.selectedPattern}: ${workflowNavigatorRouteLabel(
            item,
            workflowNavigatorItems
          )} / ${item.value} / direct workflow-navigator-${item.id} unchanged / workflow jump unchanged / workflow spotlight unchanged / Guide panel`
        : "Workflow Navigator Route Readout: no workflow zone available"
    );
  }

  function focusWorkflowSpotlightRouteReadout(): void {
    const spotlight = createWorkflowSpotlightSummary(workflowNavigatorItems);
    const item = spotlight.zoneId ? workflowNavigatorItems.find((candidate) => candidate.id === spotlight.zoneId) ?? null : null;
    scrollWorkspaceTargetIntoView(workflowNavigatorPanelRef.current, "start");
    setProjectStatus(
      item
        ? `Workflow Spotlight Route Readout Pattern ${project.selectedPattern}: ${workflowSpotlightRouteLabel(
            spotlight,
            item,
            workflowNavigatorItems
          )} / ${spotlight.statusLabel} / direct workflow-spotlight-focus unchanged / workflow navigator jump unchanged / Guide panel`
        : "Workflow Spotlight Route Readout: no spotlight route available"
    );
  }

  function focusBeatMapRouteReadout(): void {
    const action = beatMapActions[0] ?? null;
    const stage = action
      ? beatMapStageForNextMoveAction(beatMapSummary, action)
      : (beatMapSummary.stages.find((candidate) => candidate.tone !== "good") ??
        beatMapSummary.stages[beatMapSummary.stages.length - 1]);
    scrollGuidanceTargetIntoView(() => beatMapPanelRef.current, "start");
    setProjectStatus(
      action
        ? `Beat Map Route Readout Pattern ${project.selectedPattern}: ${stage.label} / ${stage.status} / ${beatMapRouteLabel(
            action
          )} / direct beat-map-action-${action.id} unchanged / Beat Map action unchanged / Structure Lens unchanged / Next Move unchanged / Guide panel`
        : "Beat Map Route Readout: no Beat Map route available"
    );
  }

  function focusStructureLensRouteReadout(): void {
    const action = structureLensActions[0] ?? null;
    const signal = action
      ? structureLensSignalForNextMoveAction(structureLensSummary, action)
      : (structureLensSummary.signals.find((candidate) => candidate.tone !== "good") ?? structureLensSummary.signals[0]);
    scrollGuidanceTargetIntoView(() => structureLensPanelRef.current, "start");
    setProjectStatus(
      action
        ? `Structure Lens Route Readout Pattern ${project.selectedPattern}: ${signal.label} / ${signal.value} / ${structureLensRouteLabel(
            action
          )} / direct structure-lens-action-${action.id} unchanged / Structure Lens action unchanged / Beat Map unchanged / Next Move unchanged / Guide panel`
        : "Structure Lens Route Readout: no Structure Lens route available"
    );
  }

  function focusNextMoveRouteReadout(): void {
    const action = nextMoveActions[0] ?? null;
    const posture = action ? nextMoveActionPostureMetricSnapshot(projectRef.current, action) : null;
    const followup = action ? nextMoveResultFollowup(action, projectRef.current) : null;
    scrollGuidanceTargetIntoView(() => nextMovePanelRef.current, "start");
    setProjectStatus(
      action && posture && followup
        ? `Next Move Route Readout Pattern ${project.selectedPattern}: ${action.buttonLabel} / ${posture.label}: ${
            posture.value
          } / ${nextMoveRouteLabel(
            action
          )} / direct next-move-action-${action.id} unchanged / Next Move action unchanged / Beat Map unchanged / Structure Lens unchanged / ${followup.nextCheck} / Guide panel`
        : "Next Move Route Readout: no Next Move route available"
    );
  }

  function focusBeatReadinessCheck(check: BeatReadinessCheck): void {
    setBeatReadinessFocusId(check.id);
    routeWorkspaceTargetIntoView(check.focusTarget);
    setBeatReadinessResult(createBeatReadinessFocusResult(check, beatReadinessChecks));
    setProjectStatus(`Beat Readiness ${check.label}: ${check.status}`);
  }

  function focusBeatReadinessRouteReadout(): void {
    const check = activeBeatReadinessQuickActionCheck(beatReadinessChecks);
    scrollGuidanceTargetIntoView(() => beatReadinessPanelRef.current, "start");
    setProjectStatus(
      check
        ? `Beat Readiness Route Readout Pattern ${project.selectedPattern}: ${beatReadinessRouteLabel(
            check
          )} / ${check.status} / direct ${beatReadinessCardActionId(check)} unchanged / ${check.focusLabel} panel`
        : "Beat Readiness Route Readout: no priority check available"
    );
  }

  function jumpToFirstBeatPathTarget(target: FirstBeatPathTarget): void {
    routeWorkspaceTargetIntoView(target);
  }

  function jumpToFirstBeatPathStep(step: FirstBeatPathStep): void {
    jumpToFirstBeatPathTarget(step.target);
    setFirstBeatPathResult(createFirstBeatPathJumpResult(step, firstBeatPathSummary));
    setProjectStatus(`First Beat Path ${step.label}: ${step.jumpLabel}`);
  }

  function jumpToBeatSpineTarget(card: BeatSpineCard): void {
    routeWorkspaceTargetIntoView(card.target);
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
    setBeatPassportFocusId(metric.focusId);
    routeWorkspaceTargetIntoView(metric.focusTarget);
    setBeatPassportResult(createBeatPassportFocusResult(metric, beatPassportSummary));
    setProjectStatus(`Passport ${metric.label}: ${metric.value}`);
  }

  function focusBeatPassportRouteReadout(): void {
    const metric = activeBeatPassportQuickActionMetric(beatPassportSummary);
    scrollGuidanceTargetIntoView(() => beatPassportPanelRef.current, "start");
    setProjectStatus(
      metric
        ? `Beat Passport Route Readout Pattern ${project.selectedPattern}: ${beatPassportRouteLabel(
            metric
          )} / ${metric.value} / direct beat-passport-metric-${metric.id} unchanged / ${metric.focusLabel} panel`
        : "Beat Passport Route Readout: no priority metric available"
    );
  }

  function focusProductionSnapshotMetric(metric: ProductionSnapshotFocusItem): void {
    setProductionSnapshotFocusId(metric.focusId);
    routeWorkspaceTargetIntoView(metric.focusTarget);
    setProductionSnapshotResult(createProductionSnapshotFocusResult(metric, productionSnapshotSummary));
    setProjectStatus(`Snapshot ${metric.label}: ${metric.value}`);
  }

  function focusProductionSnapshotRouteReadout(): void {
    const metric = activeProductionSnapshotQuickActionMetric(productionSnapshotSummary);
    scrollGuidanceTargetIntoView(() => productionSnapshotPanelRef.current, "start");
    setProjectStatus(
      metric
        ? `Production Snapshot Route Readout Pattern ${project.selectedPattern}: ${productionSnapshotRouteLabel(metric)} / ${metric.value} / direct production-snapshot-metric-${metric.id} unchanged / ${metric.focusLabel} panel`
        : "Production Snapshot Route Readout: no priority metric available"
    );
  }

  function focusSnapshotCompareMetric(item: SnapshotCompareFocusItem): void {
    setSnapshotCompareFocusId(item.focusId);
    routeWorkspaceTargetIntoView(item.focusTarget);
    setSnapshotCompareResult(createSnapshotCompareFocusResult(item, snapshotCompareSummary));
    setProjectStatus(`Snapshot Compare ${item.cardName} ${item.label}: ${item.value}`);
  }

  function focusHookReadinessCard(card: HookReadinessFocusItem): void {
    setHookReadinessFocusId(card.focusId);
    routeWorkspaceTargetIntoView(card.focusTarget);
    setHookReadinessResult(createHookReadinessFocusResult(card, hookReadinessSummary));
    setProjectStatus(`Hook ${card.label}: ${card.value}`);
  }

  function focusHookReadinessRouteReadout(): void {
    const card = activeHookReadinessQuickActionCard(hookReadinessSummary);
    scrollGuidanceTargetIntoView(() => hookReadinessPanelRef.current, "start");
    setProjectStatus(
      card
        ? `Hook Readiness Route Readout Pattern ${project.selectedPattern}: ${hookReadinessRouteLabel(
            card,
            hookReadinessSummary
          )} / ${card.value} / direct hook-readiness-card-${card.id} unchanged / hook loop unchanged / hook fix unchanged / ${card.focusLabel} panel`
        : "Hook Readiness Route Readout: no priority hook card available"
    );
  }

  function focusToplineSpaceCard(card: ToplineSpaceFocusItem): void {
    setToplineSpaceFocusId(card.focusId);
    routeWorkspaceTargetIntoView(card.focusTarget);
    setToplineSpaceResult(createToplineSpaceFocusResult(card, toplineSpaceSummary));
    setProjectStatus(`Topline ${card.label}: ${card.value}`);
  }

  function focusToplineSpaceRouteReadout(): void {
    const card = activeToplineSpaceQuickActionCard(toplineSpaceSummary);
    scrollGuidanceTargetIntoView(() => toplineSpacePanelRef.current, "start");
    setProjectStatus(
      card
        ? `Topline Space Route Readout Pattern ${project.selectedPattern}: ${toplineSpaceRouteLabel(
            card,
            toplineSpaceSummary
          )} / ${card.value} / direct topline-space-card-${card.id} unchanged / topline loop unchanged / topline fix unchanged / ${card.focusLabel} panel`
        : "Topline Space Route Readout: no priority topline card available"
    );
  }

  function focusArrangementMuteMapLane(lane: ArrangementMuteMapLane): void {
    setArrangementToolsOpen(true);
    flushSync(() => {
      setArrangementMuteMapFocusId(lane.id);
      setArrangementMuteMapResult(createArrangementMuteMapFocusResult(lane, arrangementMuteMapSummary));
    });
    routeWorkspaceTargetIntoView("arrange-mute-map", "start");
    requestAnimationFrame(() => {
      scrollWorkspaceTargetIntoView(
        () => document.querySelector<HTMLElement>('[data-testid="arrangement-mute-map-result"]'),
        "nearest",
        "arrange"
      );
    });
    setProjectStatus(`Mute Map ${lane.label}: ${lane.value}`);
  }

  function focusArrangementMuteMapReadout(): void {
    setArrangementToolsOpen(true);
    const lane = activeArrangementMuteMapQuickActionLane(arrangementMuteMapSummary);
    routeWorkspaceTargetIntoView("arrange-mute-map", "start");
    setProjectStatus(
      lane
        ? `Arrangement Mute Map ${lane.status}: ${lane.label} / ${lane.value} / ${lane.detail}`
        : `Arrangement Mute Map: ${arrangementMuteMapSummary.headline} / ${arrangementMuteMapSummary.detail}`
    );
  }

  function focusArrangementTransitionMapTransition(transition: ArrangementTransitionMapTransition): void {
    setArrangementToolsOpen(true);
    setArrangementTransitionMapFocusId(transition.id);
    routeWorkspaceTargetIntoView("arrange-structure", "start");
    setArrangementTransitionMapResult(createArrangementTransitionMapFocusResult(transition, arrangementTransitionMapSummary));
    setProjectStatus(`Transition ${transition.fromIndex + 1}->${transition.toIndex + 1}: ${transition.status}`);
  }

  function focusArrangementTransitionMapReadout(): void {
    setArrangementToolsOpen(true);
    const transition = activeArrangementTransitionMapQuickActionTransition(arrangementTransitionMapSummary);
    routeWorkspaceTargetIntoView("arrange-structure", "start");
    setProjectStatus(
      transition
        ? `Arrangement Transition Map ${transition.status}: ${transition.value} / ${transition.energyLabel} / ${transition.patternLabel}`
        : `Arrangement Transition Map: ${arrangementTransitionMapSummary.headline} / ${arrangementTransitionMapSummary.detail}`
    );
  }

  function focusModeFocusCard(card: ModeFocusCard): void {
    routeWorkspaceTargetIntoView(card.focusTarget);
    setModeFocusResult(createModeFocusJumpResult(card, modeFocusSummary));
    setProjectStatus(`Mode ${card.label}: ${card.value}`);
  }

  function focusSessionPassCard(card: SessionPassCard): void {
    routeWorkspaceTargetIntoView(card.focusTarget);
    setSessionPassResult(createSessionPassFocusResult(card, sessionPassSummary));
    setProjectStatus(`Session Pass ${card.label}: ${card.value}`);
  }

  function focusSessionPassRouteReadout(): void {
    const card = activeSessionPassQuickActionCard(sessionPassSummary);
    const routeLabel = sessionPassRouteLabel(card, sessionPassSummary);
    scrollGuidanceTargetIntoView(() => sessionPassPanelRef.current, "start");
    setProjectStatus(
      `Session Pass Route Readout Pattern ${project.selectedPattern}: ${routeLabel} / ${card.value} / direct session-pass-card-${card.id} unchanged / ${card.focusLabel} panel`
    );
  }

  function focusComposerGuideCard(card: ComposerGuideCard): void {
    setComposerGuideFocusId(card.id);
    routeWorkspaceTargetIntoView(card.focusTarget);
    setComposerGuideResult(createComposerGuideFocusResult(card, composerGuideSummary));
    setProjectStatus(`Guide ${card.label}: ${card.status}`);
  }

  function focusComposerGuideRouteReadout(): void {
    const card = activeComposerGuideQuickActionCard(composerGuideSummary);
    scrollGuidanceTargetIntoView(() => composerGuidePanelRef.current, "start");

    setProjectStatus(
      card
        ? `Composer Guide Route Readout Pattern ${project.selectedPattern}: ${composerGuideRouteLabel(
            card,
            composerGuideSummary
          )} / ${card.status} / direct composer-guide-card-${card.id} unchanged / ${card.focusLabel} panel`
        : "Composer Guide Route Readout: no writing lane available"
    );
  }

  function focusComposerActionsReadout(): void {
    const action = composerActionsSummary.actions[0] ?? null;
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      action
        ? `Composer Actions Readout ${action.label}: ${quickActionComposerActionAreaLabel(action.area)} / ${quickActionComposerActionRouteLabel(
            action,
            action.area
          )} / ${action.scope} / ${action.impact} / ${action.safety}`
        : `Composer Actions Readout: ${composerActionsSummary.headline} / direct writing unchanged`
    );
  }

  function focusKeyCompassItem(item: KeyCompassFocusItem): void {
    setKeyCompassFocusId(item.focusId);
    routeWorkspaceTargetIntoView(item.focusTarget);
    setKeyCompassResult(createKeyCompassFocusResult(item, keyCompassSummary));
    setProjectStatus(`Key ${item.label}: ${item.value}`);
  }

  function focusKeyCompassRouteReadout(): void {
    const item = activeKeyCompassQuickActionItem(keyCompassSummary);
    scrollGuidanceTargetIntoView(() => keyCompassPanelRef.current, "start");

    setProjectStatus(
      item
        ? `Key Compass Route Readout Pattern ${project.selectedPattern}: ${keyCompassRouteLabel(
            item,
            keyCompassSummary
          )} / ${item.value} / direct key-compass-card-${item.id} unchanged / ${item.focusLabel} panel`
        : "Key Compass Route Readout: no harmony lane available"
    );
  }

  function focusGrooveCompassItem(item: GrooveCompassFocusItem): void {
    setGrooveCompassFocusId(item.focusId);
    routeWorkspaceTargetIntoView(item.focusTarget);
    setGrooveCompassResult(createGrooveCompassFocusResult(item, grooveCompassSummary));
    setProjectStatus(`Groove ${item.label}: ${item.value}`);
  }

  function focusGrooveCompassRouteReadout(): void {
    const item = activeGrooveCompassQuickActionItem(grooveCompassSummary);
    scrollGuidanceTargetIntoView(() => grooveCompassPanelRef.current, "start");

    setProjectStatus(
      item
        ? `Groove Compass Route Readout Pattern ${project.selectedPattern}: ${grooveCompassRouteLabel(
            item,
            grooveCompassSummary
          )} / ${item.value} / direct groove-compass-card-${item.id} unchanged / ${item.focusLabel} panel`
        : "Groove Compass Route Readout: no pocket lane available"
    );
  }

  function focusPatternDnaCard(card: PatternDnaCard): void {
    setPatternDnaFocusId(card.id);
    routeWorkspaceTargetIntoView(card.focusTarget);
    setPatternDnaResult(createPatternDnaFocusResult(card, patternDnaSummary));
    setProjectStatus(`Pattern DNA ${card.label}: ${card.value}`);
  }

  function focusListeningPassItem(item: ListeningPassItem): void {
    setListeningPassFocusId(item.id);
    routeWorkspaceTargetIntoView(item.focusTarget);
    setListeningPassResult(createListeningPassFocusResult(item, listeningPassSummary));
    setProjectStatus(`Listening ${item.label}: ${item.status}`);
  }

  function focusListeningPassRouteReadout(): void {
    const item = activeListeningPassQuickActionItem(listeningPassSummary);
    scrollGuidanceTargetIntoView(() => listeningPassPanelRef.current, "start");
    setProjectStatus(
      item
        ? `Listening Pass Route Readout Pattern ${project.selectedPattern}: ${listeningPassRouteLabel(
            item
          )} / ${item.status} / direct listening-pass-checkpoint-${item.id} unchanged / ${item.focusLabel} panel`
        : "Listening Pass Route Readout: no priority checkpoint available"
    );
  }

  function focusStyleInspectorItem(item: StyleInspectorFocusItem): void {
    setStyleInspectorFocusId(item.focusId);
    routeWorkspaceTargetIntoView(item.focusTarget);
    setStyleInspectorResult(createStyleInspectorFocusResult(item, styleInspectorSummary));
    setProjectStatus(`Style ${item.label}: ${item.value}`);
  }

  function focusStyleDirectionReadout(): void {
    scrollGuidanceTargetIntoView(() => styleInspectorRef.current, "start");
    setProjectStatus(
      `Style Direction ${style.name}: ${styleDirectionCurrentSummary(project)} / ${styleDirectionTargetSummary(project.styleId)}`
    );
  }

  function focusTimbreCheck(): void {
    setSoundDesignOpen(true);
    routeWorkspaceTargetIntoView("sound", "start");
    setProjectStatus(`Timbre Check ${soundTimbreCheckSummary.statusLabel}: ${soundTimbreCheckSummary.balanceLabel}`);
  }

  function focusSoundPresetReadout(): void {
    setSoundDesignOpen(true);
    routeWorkspaceTargetIntoView("sound", "start");
    setProjectStatus(
      `Sound Preset ${soundPresetPreviewSummary.statusLabel}: ${soundPresetPreviewSummary.presetLabel} / ${soundPresetPreviewSummary.toneLabel}`
    );
  }

  function focusSoundPresetRouteReadout(): void {
    setSoundDesignOpen(true);
    const routeLabel = soundPresetRouteLabel(project.sound, soundPresetDesign(soundPresetPreviewSummary.presetId));
    routeWorkspaceTargetIntoView("sound", "start");
    setProjectStatus(
      `Sound Preset Route Readout Pattern ${project.selectedPattern}: ${routeLabel} / ${soundPresetPreviewSummary.presetLabel} / ${soundPresetPreviewSummary.toneLabel} / direct Sound Preset unchanged`
    );
  }

  function focusDrumKitReadout(): void {
    setSoundDesignOpen(true);
    routeWorkspaceTargetIntoView("sound", "start");
    setProjectStatus(
      `Drum Kit ${drumKitPreviewSummary.statusLabel}: ${drumKitPreviewSummary.kitLabel} / ${drumKitPreviewSummary.rackLabel}`
    );
  }

  function focusDrumKitRouteReadout(): void {
    setSoundDesignOpen(true);
    const pad =
      drumKitPadOptions.find((option) => option.id === drumKitPreviewSummary.padId) ??
      drumKitPadOptions[0] ??
      null;
    const routeLabel = pad ? drumKitRouteLabel(pad) : "No kit route needed";
    routeWorkspaceTargetIntoView("sound", "start");
    setProjectStatus(
      `Drum Kit Route Readout Pattern ${project.selectedPattern}: ${routeLabel} / ${drumKitPreviewSummary.kitLabel} / ${drumKitPreviewSummary.rackLabel} / direct Drum Kit unchanged`
    );
  }

  function focusSoundFocusReadout(): void {
    setSoundDesignOpen(true);
    routeWorkspaceTargetIntoView("sound", "start");
    setProjectStatus(
      `Sound Focus ${soundFocusPreviewSummary.statusLabel}: ${soundFocusPreviewSummary.padLabel} / ${soundFocusPreviewSummary.parameterLabel}`
    );
  }

  function focusSoundFocusRouteReadout(): void {
    setSoundDesignOpen(true);
    const pad =
      soundFocusPadOptions.find((option) => option.id === soundFocusPreviewSummary.padId) ??
      soundFocusPadOptions[0] ??
      null;
    const routeLabel = pad ? soundFocusRouteLabel(soundFocusChangedParameters(project.sound, pad)) : "No tone route needed";
    routeWorkspaceTargetIntoView("sound", "start");
    setProjectStatus(
      `Sound Focus Route Readout Pattern ${project.selectedPattern}: ${routeLabel} / ${soundFocusPreviewSummary.padLabel} / ${soundFocusPreviewSummary.parameterLabel} / direct Sound Focus unchanged`
    );
  }

  function focusSoundSnapshotReadout(): void {
    setSoundDesignOpen(true);
    routeWorkspaceTargetIntoView("sound", "start");
    setProjectStatus(
      `Sound Snapshot A/B ${soundSnapshotComparison.statusLabel}: ${soundSnapshotComparison.actionLabel} / ${soundSnapshotComparison.winnerLabel}`
    );
  }

  function focusFinishChecklistCard(card: FinishChecklistCard): void {
    if (!exactAudioAnalysisReadyForSurface("Master", "master")) {
      return;
    }
    setMasterReviewOpen(true);
    setFinishChecklistFocusId(card.id);
    routeWorkspaceTargetIntoView(card.focusTarget);
    setFinishChecklistResult(createFinishChecklistFocusResult(card, finishChecklistSummary));
    setProjectStatus(`Finish ${card.label}: ${card.status}`);
  }

  function focusFinishChecklistRouteReadout(): void {
    if (!exactAudioAnalysisReadyForSurface("Master", "master")) {
      return;
    }
    flushSync(() => setMasterReviewOpen(true));
    const card = activeFinishChecklistQuickActionCard(finishChecklistSummary);
    routeWorkspaceTargetIntoView("master", "start");
    scrollWorkspaceTargetIntoView(() => finishChecklistPanelRef.current, "start", "mix");
    finishChecklistPanelRef.current?.focus({ preventScroll: true });
    setProjectStatus(
      card
        ? `Finish Checklist Route Readout Pattern ${project.selectedPattern}: ${finishChecklistRouteLabel(card)} / ${card.status} / direct finish-checklist-card-${card.id} unchanged / ${card.focusLabel} panel`
        : "Finish Checklist Route Readout: no priority card available"
    );
  }

  function focusExportPreflightCard(card: ExportPreflightFocusItem): void {
    if (!exactAudioAnalysisReadyForSurface("Deliver", "deliver")) {
      return;
    }
    setExportPreflightFocusId(card.focusId);
    if (card.focusTarget === "deliver") {
      activateDeliverWorkspacePage("checks");
    }
    routeWorkspaceTargetIntoView(card.focusTarget);
    setExportPreflightResult(createExportPreflightFocusResult(card, exportPreflightSummary));
    setProjectStatus(`Preflight ${card.label}: ${card.value}`);
  }

  function focusExportPreflightRouteReadout(): void {
    if (!exactAudioAnalysisReadyForSurface("Deliver", "deliver")) {
      return;
    }
    const card = activeExportPreflightQuickActionCard(exportPreflightSummary);
    activateDeliverWorkspacePage("checks");
    routeWorkspaceTargetIntoView("deliver", "start");
    setProjectStatus(
      card
        ? `Export Preflight Route Readout Pattern ${project.selectedPattern}: ${exportPreflightRouteLabel(
            card
          )} / ${card.value} / direct export-preflight-card-${card.id} unchanged / ${card.focusLabel} panel`
        : "Export Preflight Route Readout: no priority card available"
    );
  }

  function focusHandoffPack(): void {
    if (!exactAudioAnalysisReadyForSurface("Deliver", "deliver")) {
      return;
    }
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
    const currentReceipt = currentHandoffExportReceipt ?? emptyHandoffExportReceipt();
    const currentManifest = createHandoffFileManifest(project, stemAnalyses, currentItems);
    const currentAudit = createHandoffManifestAudit(
      project,
      currentItems,
      currentManifest,
      currentReceipt,
      currentSendOrder
    );

    activateDeliverWorkspacePage("exports");
    routeWorkspaceTargetIntoView("deliver", "start");
    setProjectStatus(
      `Handoff Pack ${currentRoute.statusLabel}: ${currentRoute.detailLabel} / ${currentAudit.statusLabel} / ${currentSendOrder.nextLabel}`
    );
  }

  function focusDirectExportsReadout(): void {
    if (!exactAudioAnalysisReadyForSurface("Deliver", "deliver")) {
      return;
    }
    const currentItems = createHandoffPackItems({
      analysis: exportAnalysis,
      project,
      stemAnalyses,
      onExportHandoffSheet: handleExportHandoffSheet,
      onExportMidi: handleExportMidi,
      onExportStems: handleExportStems,
      onExportWav: handleExportWav
    });
    const currentReceipt = currentHandoffExportReceipt ?? emptyHandoffExportReceipt();
    const currentSendOrder = createHandoffPackSendOrderSummary(project, currentItems);
    const readyCount = currentItems.filter((item) => item.tone === "good").length;

    activateDeliverWorkspacePage("exports");
    routeWorkspaceTargetIntoView("deliver", "start");
    setProjectStatus(
      `Direct Exports Readout: ${readyCount}/${currentItems.length} ready / ${currentSendOrder.nextLabel} / ${currentReceipt.statusLabel}`
    );
  }

  function focusHandoffNextExportReadout(): void {
    if (!exactAudioAnalysisReadyForSurface("Deliver", "deliver")) {
      return;
    }
    setDeliveryStatusOpen(true);
    activateDeliverWorkspacePage("checks");
    const currentItems = createHandoffPackItems({
      analysis: exportAnalysis,
      project,
      stemAnalyses,
      onExportHandoffSheet: handleExportHandoffSheet,
      onExportMidi: handleExportMidi,
      onExportStems: handleExportStems,
      onExportWav: handleExportWav
    });
    const currentReceipt = currentHandoffExportReceipt ?? emptyHandoffExportReceipt();
    const currentSendOrder = createHandoffPackSendOrderSummary(project, currentItems);
    const nextItem = currentSendOrder.nextItemId
      ? (currentItems.find((item) => item.id === currentSendOrder.nextItemId) ?? null)
      : null;
    const nextLabel = nextItem ? `${nextItem.label} ${nextItem.value}` : "Send order clear";

    routeWorkspaceTargetIntoView("deliver", "start");
    setProjectStatus(
      `Handoff Next Export Readout: ${currentSendOrder.nextLabel} / ${nextLabel} / ${currentReceipt.statusLabel}`
    );
  }

  function focusHandoffPackageCheckCard(card: HandoffPackageCheckCard): void {
    if (!exactAudioAnalysisReadyForSurface("Deliver", "deliver")) {
      return;
    }
    setDeliveryAuditOpen(true);
    activateDeliverWorkspacePage("checks");
    setHandoffPackageCheckFocusId(card.focusId);
    routeWorkspaceTargetIntoView("deliver", "start");
    setHandoffPackageCheckResult(createHandoffPackageCheckFocusResult(card, handoffPackageCheckSummary));
    setProjectStatus(`Package ${card.label}: ${card.value}`);
  }

  function focusHandoffManifestAudit(): void {
    if (!exactAudioAnalysisReadyForSurface("Deliver", "deliver")) {
      return;
    }
    setDeliveryAuditOpen(true);
    activateDeliverWorkspacePage("checks");
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
    const currentReceipt = currentHandoffExportReceipt ?? emptyHandoffExportReceipt();
    const currentManifest = createHandoffFileManifest(project, stemAnalyses, currentItems);
    const currentAudit = createHandoffManifestAudit(project, currentItems, currentManifest, currentReceipt, currentSendOrder);

    routeWorkspaceTargetIntoView("deliver", "start");
    setProjectStatus(`Manifest ${currentAudit.statusLabel}: ${currentAudit.detailLabel}`);
  }

  function focusHandoffExportFormatMetric(metric: HandoffExportFormatMetric): void {
    if (!exactAudioAnalysisReadyForSurface("Deliver", "deliver")) {
      return;
    }
    setDeliveryAuditOpen(true);
    activateDeliverWorkspacePage("checks");
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
    routeWorkspaceTargetIntoView("deliver", "start");
    setHandoffExportFormatResult(createHandoffExportFormatFocusResult(currentMetric, currentSummary));
    setProjectStatus(`Format ${currentMetric.label}: ${currentMetric.value}`);
  }

  function focusReviewQueueItem(item: ReviewQueueItem): void {
    if (!exactAudioAnalysisReadyForSurface("Master", "master")) {
      return;
    }
    setMasterReviewOpen(true);
    setMasterReviewQueueOpen(true);
    const mixCheckId = item.id.startsWith("mix-") ? item.id.slice(4) : null;

    setReviewQueueFocusId(item.id);
    if (mixCheckId) {
      setMixCoachFocusId(mixCheckId);
    }
    routeWorkspaceTargetIntoView(item.focusTarget);
    setReviewQueueResult(createReviewQueueFocusResult(item, reviewQueueSummary));
    setProjectStatus(`Review ${item.area}: ${item.status}`);
  }

  function focusReviewQueueRouteReadout(): void {
    if (!exactAudioAnalysisReadyForSurface("Master", "master")) {
      return;
    }
    flushSync(() => {
      setGuidanceCenterOpen(false);
      setMasterReviewOpen(true);
      setMasterReviewQueueOpen(true);
    });
    const item = reviewQueueSummary.items[0] ?? null;
    routeWorkspaceTargetIntoView("master", "start");
    // 모달 제거와 두 disclosure의 레이아웃이 확정된 뒤 내부 workspace scroller를 맞춘다.
    // 두 프레임으로 제한해 stale route가 오래 남지 않게 하고, auto scroll로 reduced-motion을 보존한다.
    revealWorkspaceTargetAfterLayout(() => reviewQueuePanelRef.current, "start", "mix", true);
    setProjectStatus(
      item
        ? `Review Queue Route Readout Pattern ${project.selectedPattern}: ${reviewQueueRouteLabel(item)} / ${item.status} / direct review-queue-item-${item.id} unchanged / review-fix unchanged / ${item.focusLabel} panel`
        : "Review Queue Route Readout: no priority issue available"
    );
  }

  function applyReviewFix(item?: ReviewQueueItem): void {
    if (!exactAudioAnalysisReadyForSurface("Master", "master")) {
      return;
    }
    setMasterReviewOpen(true);
    setMasterReviewQueueOpen(true);
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

  function rememberModalReturnFocus(): void {
    if (quickActionsOpen || commandReferenceOpen) {
      return;
    }
    modalReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }

  function restoreModalReturnFocus(): void {
    const target = modalReturnFocusRef.current;
    modalReturnFocusRef.current = null;
    window.setTimeout(() => {
      if (target?.isConnected && !target.matches(":disabled")) {
        target.focus();
      }
    }, 0);
  }

  function openQuickActions(): void {
    if (quickActionsOpen) {
      return;
    }
    rememberModalReturnFocus();
    quickActionSessionRef.current = quickActionGraphFactory ? buildQuickActions() : null;
    setCommandReferenceOpen(false);
    setQuickActionQuery("");
    setQuickActionSearchHintResult(null);
    setQuickActionSearchResult(null);
    setQuickActionSearchRecoveryResult(null);
    setQuickActionScope("all");
    setQuickActionScopeResult(null);
    setQuickActionsOpen(true);
  }

  function retryQuickActionGraphLoad(): void {
    setQuickActionGraphLoadError(null);
    setQuickActionGraphLoadAttempt((attempt) => attempt + 1);
  }

  function focusQuickActionsRouteReadout(): void {
    const currentProject = projectRef.current;
    const target = activeDeliveryTarget(currentProject);
    const pattern = activePattern(currentProject);
    if (!exactCurrentExportAnalysis()) {
      setProjectStatus("Audio meters updating; retry Quick Actions route readout");
      return;
    }
    const normalizedPinnedIds = normalizeQuickActionPinnedIds(quickActionPinnedIds, quickActions);
    const currentScopeLabel = quickActionScopeLabel(quickActionScope);
    const currentQueryLabel = quickActionQuery.trim() ? `search "${quickActionQuery.trim()}"` : "no search";
    const currentScopeOptions = createQuickActionScopeOptions(quickActions, quickActionQuery);
    const currentScopeOption = currentScopeOptions.find((option) => option.id === quickActionScope);
    const currentFilteredActions = filterQuickActions(quickActions, quickActionQuery, quickActionScope);
    const firstRunnableAction = currentFilteredActions.find((action) => !action.disabled);
    const scopeRoute = quickActionScopeDefinitions.map((definition) => definition.label).join(" / ");

    setCommandReferenceOpen(false);
    setQuickActionQuery("");
    setQuickActionSearchHintResult(null);
    setQuickActionSearchResult(null);
    setQuickActionSearchRecoveryResult(null);
    setQuickActionScope("all");
    setQuickActionScopeResult(null);
    setQuickActionsOpen(true);
    setProjectStatus(
      `Quick Actions Route Readout Pattern ${currentProject.selectedPattern}: ${quickActions.length} actions / ${
        quickActionScopeDefinitions.length
      } scopes / route ${scopeRoute} / ${currentScopeLabel} current scope / ${currentQueryLabel} / ${
        currentFilteredActions.length
      } shown / ${currentScopeOption?.count ?? 0} matching / ${normalizedPinnedIds.length}/${maxQuickActionPins} pinned / ${
        quickActionRecents.length
      } recent / ${
        firstRunnableAction ? `Enter target ${firstRunnableAction.title}` : "no Enter target"
      } / direct quick-actions-open unchanged / Command Reference unchanged / Search Spotlight unchanged / target ${
        target.name
      } / ${patternEventTotal(pattern)} selected-pattern events / ${projectEventTotal(currentProject)} editable project events / ${
        currentProject.arrangement.length
      } blocks / ${arrangementTotalBars(currentProject)} bars / export ${exportAnalysis.status} / Command palette`
    );
  }

  function closeQuickActions(restoreFocus = true): void {
    quickActionSessionRef.current = null;
    setQuickActionsOpen(false);
    setQuickActionQuery("");
    setQuickActionScope("all");
    setQuickActionSearchHintResult(null);
    setQuickActionSearchResult(null);
    setQuickActionSearchRecoveryResult(null);
    setQuickActionScopeResult(null);
    if (restoreFocus) {
      restoreModalReturnFocus();
    } else {
      modalReturnFocusRef.current = null;
    }
  }

  function openCommandReference(): void {
    rememberModalReturnFocus();
    quickActionSessionRef.current = null;
    setQuickActionsOpen(false);
    setQuickActionQuery("");
    setQuickActionScope("all");
    setCommandReferenceOpen(true);
  }

  function focusCommandReferenceRouteReadout(): void {
    const currentProject = projectRef.current;
    const summary = createCommandReferenceRouteReadoutSummary();
    const target = activeDeliveryTarget(currentProject);
    const pattern = activePattern(currentProject);
    if (!exactCurrentExportAnalysis()) {
      setProjectStatus("Audio meters updating; retry Command Reference route readout");
      return;
    }

    quickActionSessionRef.current = null;
    setQuickActionsOpen(false);
    setQuickActionQuery("");
    setQuickActionScope("all");
    setCommandReferenceOpen(true);
    setProjectStatus(
      `Command Reference Route Readout Pattern ${currentProject.selectedPattern}: ${summary.filterCount} filters / ${
        summary.commandCount
      } command-map entries / ${summary.quickActionCommandCount} Quick Actions rows / ${
        summary.readoutCommandCount
      } readout rows / ${summary.searchRouteLabel} / direct command-reference unchanged / Quick Actions unchanged / Search Spotlight unchanged / Command Reference filter unchanged / target ${
        target.name
      } / ${patternEventTotal(pattern)} selected-pattern events / ${projectEventTotal(currentProject)} editable project events / ${
        currentProject.arrangement.length
      } blocks / ${arrangementTotalBars(currentProject)} bars / export ${exportAnalysis.status} / Help panel`
    );
  }

  function closeCommandReference(): void {
    setCommandReferenceOpen(false);
    restoreModalReturnFocus();
  }

  function runQuickAction(action: QuickAction): void {
    if (action.disabled) {
      return;
    }
    const feedbackIntentEpoch = beginFixedFeedbackIntent();
    if (action.group === "Project" || action.group === "Export") {
      flushSync(() => setGuidanceCenterOpen(true));
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
    closeQuickActions(false);
    try {
      const previousQuickActionFeedbackIntentEpoch = activeQuickActionFeedbackIntentEpochRef.current;
      let runResult: ReturnType<QuickAction["run"]>;
      try {
        activeQuickActionFeedbackIntentEpochRef.current = feedbackIntentEpoch;
        runResult = action.run();
      } finally {
        activeQuickActionFeedbackIntentEpochRef.current = previousQuickActionFeedbackIntentEpoch;
      }
      const exportRequestId = action.group === "Export" ? projectExportRequestIdRef.current : null;
      void Promise.resolve(runResult)
        .then((runOutcome) => {
          if (
            exportRequestId !== null &&
            !shouldCommitProjectExportResult(
              exportRequestId,
              projectExportRequestIdRef.current,
              beforeProject,
              projectRef.current
            )
          ) {
            return;
          }
          if (!fixedFeedbackIntentIsCurrent(feedbackIntentEpoch)) {
            return;
          }
          const result = createQuickActionResult(
            action,
            beforeProject,
            projectRef.current,
            runOutcome === "canceled" ? "canceled" : "complete",
            selectedArrangementIndex,
            currentHandoffExportReceiptForProject(),
            inputSetupResult
          );
          // 구체적인 Quick Action 결과가 최신 상태이므로 이전 기능 탭 이동 결과를 함께 남기지 않는다.
          showQuickActionResult(result, feedbackIntentEpoch);
          setQuickActionRecents((recents) => prependQuickActionRecent(recents, action, result));
        })
        .catch((error: unknown) => {
          if (
            exportRequestId !== null &&
            !shouldCommitProjectExportResult(
              exportRequestId,
              projectExportRequestIdRef.current,
              beforeProject,
              projectRef.current
            )
          ) {
            return;
          }
          console.error(error);
          if (!fixedFeedbackIntentIsCurrent(feedbackIntentEpoch)) {
            return;
          }
          setProjectStatus("Quick action failed");
          const result = createQuickActionResult(
            action,
            beforeProject,
            projectRef.current,
            "failed",
            selectedArrangementIndex,
            currentHandoffExportReceiptForProject(),
            inputSetupResult
          );
          showQuickActionResult(result, feedbackIntentEpoch);
          setQuickActionRecents((recents) => prependQuickActionRecent(recents, action, result));
        });
    } catch (error) {
      console.error(error);
      if (!fixedFeedbackIntentIsCurrent(feedbackIntentEpoch)) {
        return;
      }
      setProjectStatus("Quick action failed");
      const result = createQuickActionResult(
        action,
        beforeProject,
        projectRef.current,
        "failed",
        selectedArrangementIndex,
        currentHandoffExportReceiptForProject(),
        inputSetupResult
      );
      showQuickActionResult(result, feedbackIntentEpoch);
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
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      `Pattern Playback ${patternPlaybackReadout.statusLabel}: ${patternPlaybackReadout.roleLabel} / ${patternPlaybackReadout.detailLabel}`
    );
  }

  function focusPatternCueReadout(): void {
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      selectedArrangementBlock
        ? `Pattern Cue Readout Pattern ${patternCueReadoutTarget}: ${transportLoopLabel(
            transportLoopScope
          )} loop / edit Pattern ${project.selectedPattern} / Block ${selectedArrangementIndex + 1} ${
            selectedArrangementBlock.section
          } currently Pattern ${selectedArrangementBlock.pattern} / ${patternCompareDecisionSummary.detailLabel}`
        : `Pattern Cue Readout Pattern ${patternCueReadoutTarget}: ${transportLoopLabel(
            transportLoopScope
          )} loop / edit Pattern ${project.selectedPattern} / no selected arrangement block`
    );
  }

  function focusPatternSwitchReadout(): void {
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      selectedArrangementBlock
        ? `Pattern Switch Readout Pattern ${patternSwitchReadoutTarget}: edit Pattern ${project.selectedPattern} / Block ${
            selectedArrangementIndex + 1
          } ${selectedArrangementBlock.section} currently Pattern ${
            selectedArrangementBlock.pattern
          } / ${patternCompareDecisionSummary.detailLabel}`
        : `Pattern Switch Readout Pattern ${patternSwitchReadoutTarget}: edit Pattern ${project.selectedPattern} / no selected arrangement block`
    );
  }

  function focusPatternContrastReadout(): void {
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      `Pattern Contrast ${patternContrastSummary.statusLabel}: ${patternContrastSummary.contrastLabel} / ${patternContrastSummary.metricLabel} / ${patternContrastSummary.detailLabel}`
    );
  }

  function focusPatternContrastRoleMapReadout(): void {
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      `Pattern Contrast Role Map ${patternContrastRoleMapSummary.statusLabel}: ${patternContrastRoleMapSummary.metricLabel} / ${patternContrastRoleMapSummary.detailLabel}`
    );
  }

  function focusPatternContrastSectionFitReadout(): void {
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      `Pattern Contrast Section Fit ${patternContrastSectionFitSummary.statusLabel}: ${patternContrastSectionFitSummary.metricLabel} / ${patternContrastSectionFitSummary.detailLabel}`
    );
  }

  function focusPatternCopyClearReadout(): void {
    const copyTargets = patternSlots.filter((pattern) => pattern !== project.selectedPattern).join(", ");
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      `Pattern Copy/Clear Readout Pattern ${project.selectedPattern}: ${patternEventCount(
        activePattern(project)
      )} events / copy targets ${copyTargets} / clear keeps arrangement assignments unchanged`
    );
  }

  function focusPatternCloneReadout(): void {
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      `Pattern Clone Readout ${patternCloneSuggestionSummary.routeLabel}: ${patternCloneSuggestionSummary.presetLabel} suggestion / ${patternCloneSuggestionSummary.detailLabel} / ${patternCloneSuggestionSummary.moveLabel} / direct clone unchanged`
    );
  }

  function focusPatternVariationReadout(): void {
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      `Pattern Variation Readout ${patternVariationSuggestionSummary.patternLabel}: ${patternVariationSuggestionSummary.presetLabel} suggestion / preview ${patternVariationPreviewSummary.presetLabel} / ${patternVariationPreviewSummary.moveLabel} / direct variation unchanged`
    );
  }

  function focusPatternFillReadout(): void {
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      `Pattern Fill Readout ${patternFillSuggestionSummary.patternLabel}: ${patternFillSuggestionSummary.presetLabel} suggestion / preview ${patternFillPreviewSummary.presetLabel} / ${patternFillPreviewSummary.moveLabel} / direct fill unchanged`
    );
  }

  function focusPatternStackReadout(): void {
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      `Pattern Stack Readout Pattern ${project.selectedPattern}: ${patternStackPreviewSummary.statusLabel} / preview ${patternStackPreviewSummary.stackLabel} / ${patternStackPreviewSummary.moveLabel} / direct stack unchanged`
    );
  }

  function focusDrumMoveRouteReadout(): void {
    const target = activeDrumMoveQuickActionTarget(project, drumMovePreviewSummary);
    const routeLabel = target
      ? target.kind === "Foundation"
        ? "Drum Foundation route"
        : target.kind === "Feel"
          ? "Groove Feel route"
          : "Drum Accent route"
      : "no drum route";
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      target
        ? `Drum Move Route Readout Pattern ${project.selectedPattern}: route ${routeLabel} / target ${target.label} ${target.kind} / direct command drum-move / ${drumMovePreviewSummary.moveLabel} / direct drum move unchanged`
        : `Drum Move Route Readout Pattern ${project.selectedPattern}: ${drumMovePreviewSummary.statusLabel} / no drum move route needed / ${drumMovePreviewSummary.moveLabel} / direct drum move unchanged`
    );
  }

  function focusBassMoveRouteReadout(): void {
    const target = activeBassMoveQuickActionTarget(project, bassMovePreviewSummary);
    const routeLabel = target
      ? target.kind === "Bassline"
        ? "Bassline route"
        : target.kind === "Glide"
          ? "Bass Glide route"
          : "Bass Contour route"
      : "no Bass route";
    routeWorkspaceTargetIntoView("notes", "start");
    setProjectStatus(
      target
        ? `Bass Move Route Readout Pattern ${project.selectedPattern}: route ${routeLabel} / target ${target.label} ${target.kind} / direct command 808-move / ${bassMovePreviewSummary.moveLabel} / direct Bass move unchanged`
        : `Bass Move Route Readout Pattern ${project.selectedPattern}: ${bassMovePreviewSummary.statusLabel} / no Bass move route needed / ${bassMovePreviewSummary.moveLabel} / direct Bass move unchanged`
    );
  }

  function focusMelodyMoveRouteReadout(): void {
    const target = activeMelodyMoveQuickActionTarget(project, melodyMovePreviewSummary);
    const routeLabel = target
      ? target.kind === "Motif"
        ? "Melody Motif route"
        : target.kind === "Accent"
          ? "Melody Accent route"
          : "Melody Contour route"
      : "no melody route";
    routeWorkspaceTargetIntoView("notes", "start");
    setProjectStatus(
      target
        ? `Melody Move Route Readout Pattern ${project.selectedPattern}: route ${routeLabel} / target ${target.label} ${target.kind} / direct command melody-move / ${melodyMovePreviewSummary.moveLabel} / direct melody move unchanged`
        : `Melody Move Route Readout Pattern ${project.selectedPattern}: ${melodyMovePreviewSummary.statusLabel} / no melody move route needed / ${melodyMovePreviewSummary.moveLabel} / direct melody move unchanged`
    );
  }

  function focusChordMoveRouteReadout(): void {
    const target = activeChordMoveQuickActionTarget(project, selectedChord, chordMovePreviewSummary);
    const routeLabel = target
      ? target.kind === "Pad"
        ? "Chord Pads route"
        : target.kind === "Rhythm"
          ? "Chord Rhythm route"
          : "Chord Voicing route"
      : "no chord route";
    routeWorkspaceTargetIntoView("sound", "start");
    setProjectStatus(
      target
        ? `Chord Move Route Readout Pattern ${project.selectedPattern}: route ${routeLabel} / target ${target.label} ${target.kind} / direct command chord-move / ${chordMovePreviewSummary.moveLabel} / direct chord move unchanged`
        : `Chord Move Route Readout Pattern ${project.selectedPattern}: ${chordMovePreviewSummary.statusLabel} / ${chordMovePreviewSummary.selectedLabel} / no chord move route needed / ${chordMovePreviewSummary.moveLabel} / direct chord move unchanged`
    );
  }

  function focusLayerStarterReadout(): void {
    const priorityLayer = layerStarterOptions.find((option) => option.tone !== "good") ?? layerStarterOptions[0] ?? null;
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      priorityLayer
        ? `Layer Starter Readout Pattern ${project.selectedPattern}: ${priorityLayer.status} / priority ${priorityLayer.label} / ${priorityLayer.detail} / direct starter unchanged`
        : `Layer Starter Readout Pattern ${project.selectedPattern}: no layer starter options / direct starter unchanged`
    );
  }

  function focusPatternUseReadout(): void {
    routeWorkspaceTargetIntoView("arrange", "start");
    setProjectStatus(
      selectedArrangementBlock
        ? `Pattern Use Readout Pattern ${patternUseReadoutTarget}: Block ${selectedArrangementIndex + 1} ${
            selectedArrangementBlock.section
          } currently Pattern ${selectedArrangementBlock.pattern} / ${patternCompareDecisionSummary.detailLabel}`
        : `Pattern Use Readout Pattern ${patternUseReadoutTarget}: select an arrangement block before assigning`
    );
  }

  function focusArrangementPlaybackReadout(): void {
    routeWorkspaceTargetIntoView("arrange", "start");
    setProjectStatus(
      `Arrangement Playback ${arrangementPlaybackReadout.statusLabel}: ${arrangementPlaybackReadout.roleLabel} / ${arrangementPlaybackReadout.detailLabel}`
    );
  }

  function focusSelectedArrangementBlockReadout(): void {
    routeWorkspaceTargetIntoView("arrange", "start");
    setProjectStatus(
      selectedArrangementBlock && selectedArrangementBlockRole
        ? `Selected Arrangement Block Readout Block ${selectedArrangementIndex + 1}: ${
            selectedArrangementBlockRole.roleLabel
          } / ${selectedArrangementBlock.section} Pattern ${selectedArrangementBlock.pattern} / ${
            selectedArrangementBlockRole.timelineLabel
          } / ${selectedArrangementBlockRole.detailLabel}`
        : "Selected Arrangement Block Readout: no selected arrangement block"
    );
  }

  function focusAudibleArrangementFollowReadout(): void {
    routeWorkspaceTargetIntoView("arrange", "start");
    setProjectStatus(
      `Audible Arrangement Follow Readout ${arrangementPlaybackReadout.statusLabel}: ${arrangementPlaybackReadout.roleLabel} / ${arrangementPlaybackReadout.detailLabel}`
    );
  }

  function focusTransportPositionReadout(): void {
    routeWorkspaceTargetIntoView("transport", "start");
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

    routeWorkspaceTargetIntoView("transport", "start");
    setProjectStatus(`Loop Scope ${transportLoopLabel(transportLoopScope)}: ${currentLoopStatus}`);
  }

  function focusMetronomeReadout(): void {
    const currentLoopStatus = transportLoopStatus(
      project,
      transportLoopScope,
      selectedArrangementIndex,
      arrangementTransitionLoopTarget
    );

    routeWorkspaceTargetIntoView("transport", "start");
    setProjectStatus(
      `Metronome ${project.metronomeEnabled ? "on" : "off"}: ${project.bpm} BPM / ${currentLoopStatus}`
    );
  }

  function focusTapTempoReadout(): void {
    routeWorkspaceTargetIntoView("transport", "start");
    setProjectStatus(
      `Tap Tempo ${tapTempoReadout.statusLabel}: ${tapTempoReadout.roleLabel} / ${tapTempoReadout.detailLabel}`
    );
  }

  function focusTempoNudgeReadout(): void {
    routeWorkspaceTargetIntoView("transport", "start");
    setProjectStatus(`Tempo Nudge ${project.bpm} BPM: ${tempoNudgeRouteSummary(project.bpm)}`);
  }

  function focusSwingFeelReadout(): void {
    routeWorkspaceTargetIntoView("transport", "start");
    setProjectStatus(
      `Swing Feel ${percentLabel(normalizeSwingFeelValue(project.swing))}: ${swingFeelRouteSummary(project)}`
    );
  }

  function focusKeyRetargetReadout(): void {
    routeWorkspaceTargetIntoView("transport", "start");
    setProjectStatus(`Key Retarget ${project.key}: ${keyRetargetPatternSummary(project)}`);
  }

  function focusKeyboardCaptureReadout(): void {
    routeWorkspaceTargetIntoView("notes", "start");
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
    routeWorkspaceTargetIntoView("notes", "start");
    setProjectStatus(
      `Capture Step Mode ${quickActionCaptureStepModeLabel(
        keyboardCaptureStepMode
      )}: ${targetLabel} / ${selectedLabel} / Step ${keyboardCaptureNextStep + 1}`
    );
  }

  function focusMidiInputReadout(): void {
    routeWorkspaceTargetIntoView("notes", "start");
    setProjectStatus(
      `MIDI Input ${midiCaptureSummary.statusLabel}: ${midiCaptureArmed ? "Armed" : "Disarmed"} / ${
        keyboardCaptureTarget === "bass" ? "808" : "Synth"
      } / ${midiSelectedInputLabel} / ${midiLastNoteLabel}`
    );
  }

  function focusEditorAuditionReadout(): void {
    routeWorkspaceTargetIntoView("compose", "start");
    setProjectStatus(
      `Editor Audition ${editorAuditionReadout.statusLabel}: ${editorAuditionReadout.targetLabel} / ${editorAuditionReadout.metricLabel} ${editorAuditionReadout.metricValue}`
    );
  }

  function buildQuickActions(): QuickAction[] {
    if (!quickActionGraphFactory) {
      return [];
    }

    return quickActionGraphFactory({
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
    audienceSessionReadoutSummary,
    firstBeatPathSummary,
    finishChecklistSummary,
    grooveCompassSummary,
    handoffExportReceipt: currentHandoffExportReceipt,
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
    quickActionRouteQuery: quickActionQuery,
    quickActionRouteScope: quickActionScope,
    quickActionPinnedCount: Math.min(quickActionPinnedIds.length, maxQuickActionPins),
    quickActionRecentCount: quickActionRecents.length,
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
    onFocusArrangementMuteMapReadout: focusArrangementMuteMapReadout,
    onFocusArrangementMuteMap: focusArrangementMuteMapLane,
    onFocusSelectedArrangementBlockReadout: focusSelectedArrangementBlockReadout,
    onFocusArrangementPlaybackReadout: focusArrangementPlaybackReadout,
    onFocusAudibleArrangementFollowReadout: focusAudibleArrangementFollowReadout,
    onFocusArrangementTransitionMapReadout: focusArrangementTransitionMapReadout,
    onFocusArrangementTransitionMap: focusArrangementTransitionMapTransition,
    onApplyBasslinePad: applyBasslinePad,
    onApplyBassGlidePad: applyBassGlidePad,
    onApplyBassContour: applyBassContour,
    onFocusBassMoveRouteReadout: focusBassMoveRouteReadout,
    onApplyBeatSpine: applyBeatSpineAction,
    onApplyBlueprint: applyQuickActionBeatBlueprint,
    onApplyChordPad: applyChordPad,
    onApplyChordRhythm: applyChordRhythm,
    onApplyChordVoicing: applyChordVoicingPad,
    onFocusChordMoveRouteReadout: focusChordMoveRouteReadout,
    onAlignDeliveryTarget: alignDeliveryTarget,
    onSelectDeliveryTarget: selectDeliveryTarget,
    onApplyDrumAccent: applyDrumAccent,
    onApplyDrumFoundation: applyDrumFoundation,
    onApplyDrumKit: applyDrumKitPad,
    onFocusDrumKitReadout: focusDrumKitReadout,
    onFocusDrumKitRouteReadout: focusDrumKitRouteReadout,
    onFocusDrumMoveRouteReadout: focusDrumMoveRouteReadout,
    onApplyGrooveFeel: applyGrooveFeel,
    onApplyLayerStarter: applyLayerStarter,
    onFocusLayerStarterReadout: focusLayerStarterReadout,
    onApplyMasterAutomation: applyMasterAutomationPad,
    onFocusMasterAutomationReadout: focusMasterAutomationReadout,
    onFocusMasterAutomationRouteReadout: focusMasterAutomationRouteReadout,
    onApplyMasterFinish: applyMasterFinishPad,
    onFocusMasterFinishReadout: focusMasterFinishReadout,
    onFocusMasterFinishRouteReadout: focusMasterFinishRouteReadout,
    onApplyMelodyMotif: applyMelodyMotif,
    onApplyMelodyAccent: applyMelodyAccent,
    onApplyMelodyContour: applyMelodyContour,
    onFocusMelodyMoveRouteReadout: focusMelodyMoveRouteReadout,
    onApplyMixBalance: applyMixBalancePad,
    onApplyMixFix: applyMixFixPreset,
    onFocusMixBalanceReadout: focusMixBalanceReadout,
    onFocusMixBalanceRouteReadout: focusMixBalanceRouteReadout,
    onCaptureMixSnapshot: captureMixSnapshot,
    onRecallMixSnapshot: recallMixSnapshot,
    onClearMixSnapshots: clearMixSnapshots,
    onFocusMixSnapshotReadout: focusMixSnapshotReadout,
    onFocusMixSnapshotRouteReadout: focusMixSnapshotRouteReadout,
    onFocusSpaceFxReadout: focusSpaceFxReadout,
    onFocusSpaceFxRouteReadout: focusSpaceFxRouteReadout,
    onFocusPatternChainReadout: focusPatternChainReadout,
    onFocusChainExpandReadout: focusChainExpandReadout,
    onFocusArrangementArcReadout: focusArrangementArcReadout,
    onFocusArrangementFocusReadout: focusArrangementFocusReadout,
    onFocusArrangementMoveReadout: focusArrangementMoveReadout,
    onFocusArrangementTemplateReadout: focusArrangementTemplateReadout,
    onFocusSectionLocatorReadout: focusSectionLocatorReadout,
    onFocusSongFormOverviewReadout: focusSongFormOverviewReadout,
    onApplyPatternChain: applyPatternChain,
    onApplyPatternClone: cloneSelectedPatternVariation,
    onApplyPatternFill: applyPatternFill,
    onApplyPatternVariation: applyPatternVariation,
    onApplyPatternStack: applyPatternStack,
    onFocusPatternFillReadout: focusPatternFillReadout,
    onFocusPatternCloneReadout: focusPatternCloneReadout,
    onFocusPatternStackReadout: focusPatternStackReadout,
    onFocusPatternVariationReadout: focusPatternVariationReadout,
    onFocusPatternContrastReadout: focusPatternContrastReadout,
    onFocusPatternContrastRoleMapReadout: focusPatternContrastRoleMapReadout,
    onFocusPatternContrastSectionFitReadout: focusPatternContrastSectionFitReadout,
    onCopySelectedPattern: copySelectedPattern,
    onClearSelectedPattern: clearSelectedPattern,
    onFocusPatternCopyClearReadout: focusPatternCopyClearReadout,
    onApplySpaceFx: applySpaceFxPad,
    onApplyStemAudition: applyStemAuditionPad,
    onFocusStemAuditionReadout: focusStemAuditionReadout,
    onFocusStemAuditionRouteReadout: focusStemAuditionRouteReadout,
    onApplySoundFocus: applySoundFocusPad,
    onFocusSoundFocusReadout: focusSoundFocusReadout,
    onFocusSoundFocusRouteReadout: focusSoundFocusRouteReadout,
    onApplySoundPreset: applySoundPreset,
    onFocusSoundPresetReadout: focusSoundPresetReadout,
    onFocusSoundPresetRouteReadout: focusSoundPresetRouteReadout,
    onCaptureSoundSnapshot: captureSoundSnapshot,
    onRecallSoundSnapshot: recallSoundSnapshot,
    onClearSoundSnapshots: clearSoundSnapshots,
    onFocusSoundSnapshotReadout: focusSoundSnapshotReadout,
    onCaptureStudioToneBaseline: captureStudioToneBaseline,
    onResetLargestStudioToneDrift: resetLargestStudioToneDrift,
    onResetStudioToneControl: (target) => {
      setStudioToneResetResult(createStudioToneResetResult(target, studioToneBaseline.sourceLabel));
      updateSoundDesign(
        { [target.parameter]: target.baselineValue } as Partial<Omit<SoundDesign, "preset">>,
        `Reset Studio Tone ${target.label} to ${studioToneBaseline.sourceLabel}`
      );
    },
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
    onSelectAudienceSessionRow: selectAudienceSessionRow,
    onCreateAudienceStarter: runAudienceStarterQuickAction,
    onFocusAudienceDeliveryProofBridgeReadout: focusAudienceDeliveryProofBridgeReadout,
    onFocusAudienceSessionAcceptanceReadout: focusAudienceSessionAcceptanceReadout,
    onFocusAudienceSessionProofHandoffReadout: focusAudienceSessionProofHandoffReadout,
    onFocusAudienceRouteBridgeReadout: focusAudienceRouteBridgeReadout,
    onFocusAudienceCompletionRouteReadout: focusAudienceCompletionRouteReadout,
    onFocusDualAudienceReadinessRouteReadout: focusDualAudienceReadinessRouteReadout,
    onSwitchMode: switchProjectMode,
    onUsePatternInSelectedBlock: usePatternInSelectedBlockFromCompare,
    onSetKeyboardCaptureEnabled: updateKeyboardCaptureEnabled,
    onSetKeyboardCaptureStepMode: updateKeyboardCaptureStepMode,
    onSetKeyboardCaptureTarget: setKeyboardCaptureTarget,
    onUpdateKeyboardCaptureDefaults: updateKeyboardCaptureDefaults,
    onSetMidiCaptureArmed: updateMidiCaptureArmed,
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
    onExportDeliveryBundle: handleExportDeliveryBundle,
    onExportHandoffSheet: handleExportHandoffSheet,
    onExportMidi: handleExportMidi,
    onExportStems: handleExportStems,
    onExportWav: handleExportWav,
    onFocusDirectExportsReadout: focusDirectExportsReadout,
    onFocusHandoffNextExportReadout: focusHandoffNextExportReadout,
    onFocusBeatMapRouteReadout: focusBeatMapRouteReadout,
    onFocusStructureLensRouteReadout: focusStructureLensRouteReadout,
    onFocusNextMoveRouteReadout: focusNextMoveRouteReadout,
    onJumpFirstBeatPath: jumpToFirstBeatPathStep,
    onJumpBeatSpine: jumpToBeatSpineTarget,
    onFocusBeatPassport: focusBeatPassportMetric,
    onFocusBeatPassportRouteReadout: focusBeatPassportRouteReadout,
    onFocusBeatReadiness: focusBeatReadinessCheck,
    onFocusBeatReadinessRouteReadout: focusBeatReadinessRouteReadout,
    onFocusComposerGuide: focusComposerGuideCard,
    onFocusComposerGuideRouteReadout: focusComposerGuideRouteReadout,
    onFocusComposerActionsReadout: focusComposerActionsReadout,
    onRunComposerAction: runComposerAction,
    onRunNextMove: runNextMove,
    onFocusExportPreflight: focusExportPreflightCard,
    onFocusExportPreflightRouteReadout: focusExportPreflightRouteReadout,
    onFocusFinishChecklist: focusFinishChecklistCard,
    onFocusFinishChecklistRouteReadout: focusFinishChecklistRouteReadout,
    onFocusGrooveCompass: focusGrooveCompassItem,
    onFocusGrooveCompassRouteReadout: focusGrooveCompassRouteReadout,
    onFocusHandoffExportFormat: focusHandoffExportFormatMetric,
    onFocusHandoffPack: focusHandoffPack,
    onFocusHandoffManifestAudit: focusHandoffManifestAudit,
    onFocusHandoffPackageCheck: focusHandoffPackageCheckCard,
    onFocusHookReadiness: focusHookReadinessCard,
    onFocusHookReadinessRouteReadout: focusHookReadinessRouteReadout,
    onFocusKeyCompass: focusKeyCompassItem,
    onFocusKeyCompassRouteReadout: focusKeyCompassRouteReadout,
    onFocusListeningPass: focusListeningPassItem,
    onFocusListeningPassRouteReadout: focusListeningPassRouteReadout,
    onFocusLoopScope: focusLoopScopeReadout,
    onFocusMetronomeReadout: focusMetronomeReadout,
    onFocusTransportPositionReadout: focusTransportPositionReadout,
    onFocusMixCoach: focusMixCoachCheck,
    onFocusExportMeter: focusExportMeter,
    onFocusMasterOutputRole: focusMasterOutputRole,
    onFocusModeFocus: focusModeFocusCard,
    onFocusPatternDna: focusPatternDnaCard,
    onFocusPatternCueReadout: focusPatternCueReadout,
    onFocusPatternPlaybackReadout: focusPatternPlaybackReadout,
    onFocusPatternSwitchReadout: focusPatternSwitchReadout,
    onFocusPatternUseReadout: focusPatternUseReadout,
    onFocusProductionSnapshot: focusProductionSnapshotMetric,
    onFocusProductionSnapshotRouteReadout: focusProductionSnapshotRouteReadout,
    onFocusReferenceAlignment: focusReferenceAlignmentCard,
    onFocusReferenceAlignmentRouteReadout: focusReferenceAlignmentRouteReadout,
    onFocusSnapshotCompare: focusSnapshotCompareMetric,
    onFocusReviewQueue: focusReviewQueueItem,
    onFocusReviewQueueRouteReadout: focusReviewQueueRouteReadout,
    onFocusSessionPass: focusSessionPassCard,
    onFocusSessionPassRouteReadout: focusSessionPassRouteReadout,
    onFocusStyleInspector: focusStyleInspectorItem,
    onFocusToplineSpace: focusToplineSpaceCard,
    onFocusToplineSpaceRouteReadout: focusToplineSpaceRouteReadout,
    onFocusWorkflowNavigatorRouteReadout: focusWorkflowNavigatorRouteReadout,
    onFocusWorkflowSpotlightRouteReadout: focusWorkflowSpotlightRouteReadout,
    onFocusWorkflowSpotlight: jumpToWorkflowNavigatorItem,
    onJumpWorkflowZone: jumpToWorkflowNavigatorItem,
    onFocusQuickActionsRouteReadout: focusQuickActionsRouteReadout,
    onFocusCommandReferenceRouteReadout: focusCommandReferenceRouteReadout,
    onOpenCommandReference: openCommandReference,
    onOpenProject: handleOpenProject,
    onCheckProjectSafety: checkProjectSafetyReadout,
    onRedo: redoProject,
    onRestoreLocalDraft: restoreLocalDraft,
    onSaveProject: async () => {
      await handleSaveProject();
    },
    onSaveSnapshot: saveCurrentSnapshot,
    onClearLocalDraftRecovery: clearLocalDraftRecovery,
    onSelectTransportLoopScope: selectTransportLoopScope,
    onTogglePlayback: togglePlayback,
    onUndo: undoProject
    });
  }

  const quickActionsMaterialized = quickActionsRequested && quickActionGraphFactory !== null;
  const quickActions = materializeWhenActive(
    quickActionsMaterialized,
    buildQuickActions,
    quickActionsOpen && !quickActionsAuditActive ? quickActionSessionRef.current : null
  );
  useEffect(() => {
    if (quickActionsOpen && quickActionGraphFactory && quickActionSessionRef.current === null) {
      quickActionSessionRef.current = quickActions;
    }
  }, [quickActionGraphFactory, quickActions, quickActionsOpen]);
  useEffect(() => {
    if (!quickActionsMaterialized) {
      return;
    }
    setQuickActionPinnedIds((pinnedIds) => normalizeQuickActionPinnedIds(pinnedIds, quickActions));
    setInspectedQuickActionPinnedId((inspectedId) =>
      inspectedId && quickActions.some((action) => action.id === inspectedId) ? inspectedId : null
    );
  }, [quickActions, quickActionsMaterialized]);
  useEffect(() => {
    setInspectedQuickActionPinnedId((inspectedId) =>
      inspectedId && quickActionPinnedIds.includes(inspectedId) ? inspectedId : null
    );
  }, [quickActionPinnedIds]);
  const quickActionScopeOptions = createQuickActionScopeOptions(quickActions, quickActionQuery);
  const filteredQuickActions = filterQuickActions(quickActions, quickActionQuery, quickActionScope);
  useEffect(() => {
    if (window.grooveforge?.launchSmoke !== true) {
      return;
    }

    const routeEvidence = (query: string, actionId: string): GrooveforgeLaunchSmokeRouteEvidence => {
      const scope = "all";
      const routeActions = filterQuickActions(quickActions, query, scope);
      const firstRunnableAction = routeActions.find((action) => !action.disabled);
      const action = routeActions.find((candidate) => candidate.id === actionId) ?? null;
      const scopeOptions = createQuickActionScopeOptions(quickActions, query);
      const searchResult = createQuickActionSearchResult(query, scope, quickActions);
      const spotlight = createQuickActionSpotlightSummary(routeActions, firstRunnableAction, scope, scopeOptions, query);
      const matchingCount = scopeOptions.find((option) => option.id === scope)?.count ?? 0;
      const guideScopeCount = scopeOptions.find((option) => option.id === "guide")?.count ?? 0;
      const visibleActionLimit = query.trim().length > 0 ? 80 : 48;
      const visibleActionCount = Math.min(routeActions.length, visibleActionLimit);

      return {
        actionPresent: action !== null && action.disabled !== true,
        countText: `${visibleActionCount} shown / ${routeActions.length} results / ${matchingCount} matching`,
        resultMetricValue: "",
        resultNextCheck: "",
        resultStatus: "",
        resultTitle: "",
        scopeCountText: String(guideScopeCount),
        searchMetricValue: searchResult.metricValue,
        searchNextCheck: searchResult.nextCheck,
        spotlightAction: spotlight.actionId ?? "",
        spotlightTitle: spotlight.titleLabel
      };
    };

    const markLaunchSmokePaletteStep = (step: string): void => {
      window.__grooveforgeLaunchSmokePaletteStep = step;
    };

    const runAudienceSessionRoute = (
      actionId: string
    ): Pick<GrooveforgeLaunchSmokeRouteEvidence, "resultMetricValue" | "resultNextCheck" | "resultStatus" | "resultTitle"> => {
      const action = quickActions.find((candidate) => candidate.id === actionId);
      if (!action || action.disabled) {
        return {
          resultMetricValue: "Action unavailable",
          resultNextCheck: "Quick Actions must expose the Audience Session route before launch smoke can run it.",
          resultStatus: "Unavailable",
          resultTitle: actionId
        };
      }

      const row = audienceSessionReadoutSummary.rows.find((candidate) => `audience-session-enter-${candidate.id}` === action.id);
      if (!row) {
        return {
          resultMetricValue: "Audience Session row unavailable",
          resultNextCheck: "Audience Session Readout must include the matching route row.",
          resultStatus: "Unavailable",
          resultTitle: action.title
        };
      }

      const beforeProject = projectRef.current;
      const mode = audienceSessionModeForRow(row);
      switchProjectMode(mode);
      setAudienceSessionActionResult(createAudienceSessionActionResult(row, audienceSessionReadoutSummary, mode));
      const result = createQuickActionResult(
        action,
        beforeProject,
        projectRef.current,
        "complete",
        selectedArrangementIndex,
        currentHandoffExportReceiptForProject(),
        null
      );

      return {
        resultMetricValue: `${result.metric.before} -> ${result.metric.after}`,
        resultNextCheck: result.nextCheck,
        resultStatus: result.status,
        resultTitle: result.title
      };
    };

    const runDualAudienceReadinessRoute = (
      actionId: string
    ): Pick<GrooveforgeLaunchSmokeRouteEvidence, "resultMetricValue" | "resultNextCheck" | "resultStatus" | "resultTitle"> => {
      const action = quickActions.find((candidate) => candidate.id === actionId);
      if (!action || action.disabled) {
        return {
          resultMetricValue: "Action unavailable",
          resultNextCheck: "Quick Actions must expose the Dual Audience Readiness route before launch smoke can run it.",
          resultStatus: "Unavailable",
          resultTitle: actionId
        };
      }

      const beforeProject = projectRef.current;
      action.run();
      const result = createQuickActionResult(
        action,
        beforeProject,
        projectRef.current,
        "complete",
        selectedArrangementIndex,
        currentHandoffExportReceiptForProject(),
        null
      );

      return {
        resultMetricValue: `${result.metric.before} -> ${result.metric.after}`,
        resultNextCheck: result.nextCheck,
        resultStatus: result.status,
        resultTitle: result.title
      };
    };

    const runAudienceRouteBridgeRoute = (
      actionId: string
    ): Pick<GrooveforgeLaunchSmokeRouteEvidence, "resultMetricValue" | "resultNextCheck" | "resultStatus" | "resultTitle"> => {
      const action = quickActions.find((candidate) => candidate.id === actionId);
      if (!action || action.disabled) {
        return {
          resultMetricValue: "Action unavailable",
          resultNextCheck: "Quick Actions must expose the Audience Route Bridge before launch smoke can run it.",
          resultStatus: "Unavailable",
          resultTitle: actionId
        };
      }

      const beforeProject = projectRef.current;
      action.run();
      const result = createQuickActionResult(
        action,
        beforeProject,
        projectRef.current,
        "complete",
        selectedArrangementIndex,
        currentHandoffExportReceiptForProject(),
        null
      );

      return {
        resultMetricValue: `${result.metric.before} -> ${result.metric.after}`,
        resultNextCheck: result.nextCheck,
        resultStatus: result.status,
        resultTitle: result.title
      };
    };

    const runAudienceCompletionRoute = (
      actionId: string
    ): Pick<GrooveforgeLaunchSmokeRouteEvidence, "resultMetricValue" | "resultNextCheck" | "resultStatus" | "resultTitle"> => {
      const action = quickActions.find((candidate) => candidate.id === actionId);
      if (!action || action.disabled) {
        return {
          resultMetricValue: "Action unavailable",
          resultNextCheck: "Quick Actions must expose the Audience Completion Route before launch smoke can run it.",
          resultStatus: "Unavailable",
          resultTitle: actionId
        };
      }

      const beforeProject = projectRef.current;
      action.run();
      const result = createQuickActionResult(
        action,
        beforeProject,
        projectRef.current,
        "complete",
        selectedArrangementIndex,
        currentHandoffExportReceiptForProject(),
        null
      );

      return {
        resultMetricValue: `${result.metric.before} -> ${result.metric.after}`,
        resultNextCheck: result.nextCheck,
        resultStatus: result.status,
        resultTitle: result.title
      };
    };

    const runAudienceDeliveryProofBridgeRoute = (
      actionId: string
    ): Pick<GrooveforgeLaunchSmokeRouteEvidence, "resultMetricValue" | "resultNextCheck" | "resultStatus" | "resultTitle"> => {
      const action = quickActions.find((candidate) => candidate.id === actionId);
      if (!action || action.disabled) {
        return {
          resultMetricValue: "Action unavailable",
          resultNextCheck: "Quick Actions must expose the Audience Delivery Proof Bridge before launch smoke can run it.",
          resultStatus: "Unavailable",
          resultTitle: actionId
        };
      }

      const beforeProject = projectRef.current;
      action.run();
      const result = createQuickActionResult(
        action,
        beforeProject,
        projectRef.current,
        "complete",
        selectedArrangementIndex,
        currentHandoffExportReceiptForProject(),
        null
      );

      return {
        resultMetricValue: `${result.metric.before} -> ${result.metric.after}`,
        resultNextCheck: result.nextCheck,
        resultStatus: result.status,
        resultTitle: result.title
      };
    };

    const quickActionEvidenceById = (
      actionId: string,
      beforeProject: ProjectState = projectRef.current,
      afterProject: ProjectState = projectRef.current
    ): GrooveforgeLaunchSmokeRouteEvidence => {
      const action = quickActions.find((candidate) => candidate.id === actionId);
      if (!action || action.disabled) {
        return {
          actionPresent: false,
          countText: "0 shown / 0 results / 0 matching",
          resultMetricValue: "Action unavailable",
          resultNextCheck: "Quick Actions must expose the requested route before launch smoke can run it.",
          resultStatus: "Unavailable",
          resultTitle: actionId,
          scopeCountText: "0",
          searchMetricValue: "",
          searchNextCheck: "",
          spotlightAction: "",
          spotlightTitle: ""
        };
      }

      const result = createQuickActionResult(
        action,
        beforeProject,
        afterProject,
        "complete",
        selectedArrangementIndex,
        currentHandoffExportReceiptForProject(),
        null
      );

      return {
        actionPresent: true,
        countText: "1 shown / 1 results / 1 matching",
        resultMetricValue: `${result.metric.before} -> ${result.metric.after}`,
        resultNextCheck: result.nextCheck,
        resultStatus: result.status,
        resultTitle: result.title,
        scopeCountText: "1",
        searchMetricValue: action.title,
        searchNextCheck: result.nextCheck,
        spotlightAction: action.id,
        spotlightTitle: action.title
      };
    };

    const readDomText = (selector: string): string =>
      document.querySelector(selector)?.textContent?.trim() ?? "";

    const readAudienceNextStepRailEvidence = (): GrooveforgeLaunchSmokeAudienceNextStepRailEvidence => {
      const rowElements = Array.from(document.querySelectorAll<HTMLElement>('[data-testid^="audience-next-step-"]')).filter(
        (element) => element.dataset.audienceNextStepRow
      );

      return {
        activeAudience:
          document.querySelector<HTMLElement>('[data-testid="audience-next-step-rail"]')?.dataset.audienceNextStepActive ?? "",
        beginnerAction: readDomText('[data-testid="audience-next-step-beginner-action"]'),
        beginnerButtonPresent: document.querySelector('[data-testid="audience-next-step-beginner-action-button"]') !== null,
        beginnerFollowup: readDomText('[data-testid="audience-next-step-beginner-followup"]'),
        beginnerReadiness: readDomText('[data-testid="audience-next-step-beginner-readiness"]'),
        beginnerRoute: readDomText('[data-testid="audience-next-step-beginner-route"]'),
        present: document.querySelector('[data-testid="audience-next-step-rail"]') !== null,
        producerAction: readDomText('[data-testid="audience-next-step-producer-action"]'),
        producerButtonPresent: document.querySelector('[data-testid="audience-next-step-producer-action-button"]') !== null,
        producerFollowup: readDomText('[data-testid="audience-next-step-producer-followup"]'),
        producerReadiness: readDomText('[data-testid="audience-next-step-producer-readiness"]'),
        producerRoute: readDomText('[data-testid="audience-next-step-producer-route"]'),
        rowCount: rowElements.length
      };
    };

    const readAudienceCompletionCheckpointEvidence = (): GrooveforgeLaunchSmokeAudienceCompletionCheckpointEvidence => {
      const rowElements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-testid^="audience-completion-checkpoint-"]')
      ).filter((element) => element.dataset.audienceCompletionCheckpointRow);

      return {
        activeAudience:
          document.querySelector<HTMLElement>('[data-testid="audience-completion-checkpoints"]')?.dataset
            .audienceCompletionCheckpointsActive ?? "",
        beginnerDelivery: readDomText('[data-testid="audience-completion-checkpoint-beginner-delivery"]'),
        beginnerLane: readDomText('[data-testid="audience-completion-checkpoint-beginner-lane"]'),
        beginnerMode: readDomText('[data-testid="audience-completion-checkpoint-beginner-mode"]'),
        beginnerNext: readDomText('[data-testid="audience-completion-checkpoint-beginner-next"]'),
        beginnerReadiness: readDomText('[data-testid="audience-completion-checkpoint-beginner-readiness"]'),
        beginnerStarter: readDomText('[data-testid="audience-completion-checkpoint-beginner-starter"]'),
        present: document.querySelector('[data-testid="audience-completion-checkpoints"]') !== null,
        producerDelivery: readDomText('[data-testid="audience-completion-checkpoint-producer-delivery"]'),
        producerLane: readDomText('[data-testid="audience-completion-checkpoint-producer-lane"]'),
        producerMode: readDomText('[data-testid="audience-completion-checkpoint-producer-mode"]'),
        producerNext: readDomText('[data-testid="audience-completion-checkpoint-producer-next"]'),
        producerReadiness: readDomText('[data-testid="audience-completion-checkpoint-producer-readiness"]'),
        producerStarter: readDomText('[data-testid="audience-completion-checkpoint-producer-starter"]'),
        rowCount: rowElements.length
      };
    };

    const readAudienceSessionProofHandoffEvidence = (): GrooveforgeLaunchSmokeAudienceSessionProofHandoffEvidence => {
      const rowElements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-testid^="audience-session-proof-handoff-"]')
      ).filter((element) => element.dataset.audienceSessionProofHandoffRow);

      return {
        activeAudience:
          document.querySelector<HTMLElement>('[data-testid="audience-session-proof-handoff"]')?.dataset
            .audienceSessionProofHandoffActive ?? "",
        beginnerArtifact: readDomText('[data-testid="audience-session-proof-handoff-beginner-artifact"]'),
        beginnerLane: readDomText('[data-testid="audience-session-proof-handoff-beginner-lane"]'),
        beginnerNext: readDomText('[data-testid="audience-session-proof-handoff-beginner-next"]'),
        beginnerProof: readDomText('[data-testid="audience-session-proof-handoff-beginner-proof"]'),
        beginnerRoute: readDomText('[data-testid="audience-session-proof-handoff-beginner-route"]'),
        present: document.querySelector('[data-testid="audience-session-proof-handoff"]') !== null,
        producerArtifact: readDomText('[data-testid="audience-session-proof-handoff-producer-artifact"]'),
        producerLane: readDomText('[data-testid="audience-session-proof-handoff-producer-lane"]'),
        producerNext: readDomText('[data-testid="audience-session-proof-handoff-producer-next"]'),
        producerProof: readDomText('[data-testid="audience-session-proof-handoff-producer-proof"]'),
        producerRoute: readDomText('[data-testid="audience-session-proof-handoff-producer-route"]'),
        rowCount: rowElements.length
      };
    };

    const readAudienceSessionAcceptanceEvidence = (): GrooveforgeLaunchSmokeAudienceSessionAcceptanceEvidence => {
      const rowElements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-testid^="audience-session-acceptance-"]')
      ).filter((element) => element.dataset.audienceSessionAcceptanceRow);

      return {
        activeAudience:
          document.querySelector<HTMLElement>('[data-testid="audience-session-acceptance"]')?.dataset
            .audienceSessionAcceptanceActive ?? "",
        beginnerEvidence: readDomText('[data-testid="audience-session-acceptance-beginner-evidence"]'),
        beginnerLane: readDomText('[data-testid="audience-session-acceptance-beginner-lane"]'),
        beginnerNext: readDomText('[data-testid="audience-session-acceptance-beginner-next"]'),
        beginnerProof: readDomText('[data-testid="audience-session-acceptance-beginner-proof"]'),
        beginnerTarget: readDomText('[data-testid="audience-session-acceptance-beginner-target"]'),
        present: document.querySelector('[data-testid="audience-session-acceptance"]') !== null,
        producerEvidence: readDomText('[data-testid="audience-session-acceptance-producer-evidence"]'),
        producerLane: readDomText('[data-testid="audience-session-acceptance-producer-lane"]'),
        producerNext: readDomText('[data-testid="audience-session-acceptance-producer-next"]'),
        producerProof: readDomText('[data-testid="audience-session-acceptance-producer-proof"]'),
        producerTarget: readDomText('[data-testid="audience-session-acceptance-producer-target"]'),
        rowCount: rowElements.length
      };
    };

    const readAudienceDeliverySnapshotEvidence = (): GrooveforgeLaunchSmokeAudienceDeliverySnapshotEvidence => {
      const rowElements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-testid^="audience-delivery-snapshot-"]')
      ).filter((element) => element.dataset.audienceDeliverySnapshotRow);

      return {
        activeAudience:
          document.querySelector<HTMLElement>('[data-testid="audience-delivery-snapshot"]')?.dataset
            .audienceDeliverySnapshotActive ?? "",
        beginnerDeliverables: readDomText('[data-testid="audience-delivery-snapshot-beginner-deliverables"]'),
        beginnerFocus: readDomText('[data-testid="audience-delivery-snapshot-beginner-focus"]'),
        beginnerHandoff: readDomText('[data-testid="audience-delivery-snapshot-beginner-handoff"]'),
        beginnerLane: readDomText('[data-testid="audience-delivery-snapshot-beginner-lane"]'),
        beginnerProof: readDomText('[data-testid="audience-delivery-snapshot-beginner-proof"]'),
        present: document.querySelector('[data-testid="audience-delivery-snapshot"]') !== null,
        producerDeliverables: readDomText('[data-testid="audience-delivery-snapshot-producer-deliverables"]'),
        producerFocus: readDomText('[data-testid="audience-delivery-snapshot-producer-focus"]'),
        producerHandoff: readDomText('[data-testid="audience-delivery-snapshot-producer-handoff"]'),
        producerLane: readDomText('[data-testid="audience-delivery-snapshot-producer-lane"]'),
        producerProof: readDomText('[data-testid="audience-delivery-snapshot-producer-proof"]'),
        rowCount: rowElements.length
      };
    };

    const readAudienceDeliveryProofBridgeEvidence = (): GrooveforgeLaunchSmokeAudienceDeliveryProofBridgeEvidence => {
      const rowElements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-testid^="audience-delivery-proof-bridge-"]')
      ).filter((element) => element.dataset.audienceDeliveryProofBridgeRow);

      return {
        activeAudience:
          document.querySelector<HTMLElement>('[data-testid="audience-delivery-proof-bridge"]')?.dataset
            .audienceDeliveryProofBridgeActive ?? "",
        beginnerLane: readDomText('[data-testid="audience-delivery-proof-bridge-beginner-lane"]'),
        beginnerNext: readDomText('[data-testid="audience-delivery-proof-bridge-beginner-next"]'),
        beginnerPackage: readDomText('[data-testid="audience-delivery-proof-bridge-beginner-package"]'),
        beginnerRoute: readDomText('[data-testid="audience-delivery-proof-bridge-beginner-route"]'),
        beginnerStatus: readDomText('[data-testid="audience-delivery-proof-bridge-beginner-status"]'),
        present: document.querySelector('[data-testid="audience-delivery-proof-bridge"]') !== null,
        producerLane: readDomText('[data-testid="audience-delivery-proof-bridge-producer-lane"]'),
        producerNext: readDomText('[data-testid="audience-delivery-proof-bridge-producer-next"]'),
        producerPackage: readDomText('[data-testid="audience-delivery-proof-bridge-producer-package"]'),
        producerRoute: readDomText('[data-testid="audience-delivery-proof-bridge-producer-route"]'),
        producerStatus: readDomText('[data-testid="audience-delivery-proof-bridge-producer-status"]'),
        rowCount: rowElements.length
      };
    };

    const readAudienceStarterFollowupRouteResult = (
      starterId: AudienceStarterProjectId,
      route: AudienceStarterFollowupRoute
    ): string => {
      if (starterId === "beginner" && route === "primary") {
        return `First Beat Path / ${
          readDomText('[data-testid="first-beat-path-result-title"]') || readDomText('[data-testid="first-beat-path-headline"]')
        }`;
      }

      if (starterId === "beginner") {
        return `Dual Audience Readiness / ${readDomText('[data-testid="dual-audience-readiness-headline"]')}`;
      }

      if (route === "primary") {
        return `Review Queue / ${readDomText('[data-testid="review-queue-result-title"]') || readDomText('[data-testid="review-queue-headline"]')}`;
      }

      if (route === "readiness") {
        return `Export Preflight / ${
          readDomText('[data-testid="export-preflight-result-title"]') || readDomText('[data-testid="export-preflight-headline"]')
        }`;
      }

      return `Handoff Package Check / ${
        readDomText('[data-testid="handoff-package-check-result-title"]') ||
        readDomText('[data-testid="handoff-package-check-headline"]')
      }`;
    };

    const readAudienceStarterVisibleResult = () => {
      const followupButtons = Array.from(
        document.querySelectorAll<HTMLButtonElement>('[data-testid^="audience-starter-result-followup-"]')
      );
      const followupLabels = followupButtons.map((button) => button.textContent?.trim() ?? "").filter(Boolean);
      const followupRoutes = new Set(
        followupButtons
          .map((button) => button.dataset.audienceStarterFollowupRoute ?? "")
          .filter((route) => route.length > 0)
      );

      return {
        visibleFollowupActionCount: followupButtons.length,
        visibleFollowupActionLabels: followupLabels.join(" / "),
        visibleFollowupCompletionPresent: followupRoutes.has("completion"),
        visibleFollowupPrimaryPresent: followupRoutes.has("primary"),
        visibleFollowupReadinessPresent: followupRoutes.has("readiness"),
        visibleResultAudition: readDomText('[data-testid="audience-starter-result-audition"]'),
        visibleResultMetricValue: readDomText('[data-testid="audience-starter-result-metric-value"]'),
        visibleResultNextCheck: readDomText('[data-testid="audience-starter-result-next-check"]'),
        visibleResultPresent: document.querySelector('[data-testid="audience-starter-result"]') !== null,
        visibleResultStatus: readDomText('[data-testid="audience-starter-result-status"]'),
        visibleResultTitle: readDomText('[data-testid="audience-starter-result-title"]')
      };
    };

    const clickAudienceStarterFollowupRoute = (
      starterId: AudienceStarterProjectId,
      route: AudienceStarterFollowupRoute
    ): string => {
      const button = document.querySelector<HTMLButtonElement>(`[data-testid="audience-starter-result-followup-${route}"]`);
      if (!button) {
        return "";
      }

      button.click();
      return readAudienceStarterFollowupRouteResult(starterId, route);
    };

    const runAudienceStarterRoute = (
      starterId: AudienceStarterProjectId
    ): GrooveforgeLaunchSmokeAudienceStarterEvidence => {
      const actionId = `audience-starter-${starterId}`;
      const routeQuery =
        starterId === "producer" ? "build professional producer starter" : "build first time composer starter";
      const baseEvidence = routeEvidence(routeQuery, actionId);
      const button = document.querySelector(`[data-testid="${audienceStarterActionTestIds[starterId]}"]`);
      const followupText =
        document.querySelector(`[data-testid="audience-starter-followup-${starterId}"]`)?.textContent?.trim() ?? "";
      const action = quickActions.find((candidate) => candidate.id === actionId);

      if (!action || action.disabled || !button) {
        setQuickActionsOpen(false);
        return {
          ...baseEvidence,
          buttonPresent: button !== null,
          followupPresent: followupText.length > 0,
          followupText,
          resultMetricValue: "Audience Starter unavailable",
          resultNextCheck: "Audience Starter visible control and Quick Action must both be available.",
          resultStatus: "Unavailable",
          resultTitle: action?.title ?? actionId,
          ...readAudienceStarterVisibleResult(),
          visibleFollowupCompletionResult: "",
          visibleFollowupPrimaryResult: "",
          visibleFollowupReadinessResult: ""
        };
      }

      const result = createAudienceStarter(starterId);
      setQuickActionsOpen(false);
      const visibleResult = readAudienceStarterVisibleResult();
      const visibleFollowupPrimaryResult = clickAudienceStarterFollowupRoute(starterId, "primary");
      const visibleFollowupReadinessResult = clickAudienceStarterFollowupRoute(starterId, "readiness");
      const visibleFollowupCompletionResult =
        starterId === "producer" ? clickAudienceStarterFollowupRoute(starterId, "completion") : "";

      return {
        ...baseEvidence,
        buttonPresent: true,
        followupPresent: followupText.length > 0,
        followupText,
        resultMetricValue: result ? `${result.metric.before} -> ${result.metric.after}` : "Audience Starter unchanged",
        resultNextCheck: result?.nextCheck ?? followupText,
        resultStatus: result?.status ?? "Unchanged",
        resultTitle: result?.title ?? action.title,
        ...visibleResult,
        visibleFollowupCompletionResult,
        visibleFollowupPrimaryResult,
        visibleFollowupReadinessResult
      };
    };

    const readAudienceStarterLanding = (
      starterId: AudienceStarterProjectId
    ): GrooveforgeLaunchSmokeStarterLandingRouteEvidence => {
      const landingTarget =
        starterId === "beginner"
          ? document.querySelector<HTMLElement>('[data-testid="workflow-target-compose"]')
          : document.querySelector<HTMLElement>('[data-testid="review-queue"]');
      const landingRect = landingTarget?.getBoundingClientRect() ?? null;
      const navigatorRect = document.querySelector<HTMLElement>('[data-testid="workflow-navigator"]')?.getBoundingClientRect() ?? null;
      const loopScopeGroup = document.querySelector<HTMLElement>(".playback-mode-row");
      const loopScopeButtons = loopScopeGroup
        ? [...loopScopeGroup.querySelectorAll<HTMLButtonElement>("button")]
        : [];
      const loopScopeGroupRect = loopScopeGroup?.getBoundingClientRect() ?? null;
      const loopScopeAccessibleNames = loopScopeButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const loopScopeReadableLabels = loopScopeButtons.filter((button) => {
        const label = button.querySelector<HTMLElement>(":scope > strong");
        const detail = button.querySelector<HTMLElement>(":scope > small");
        return Boolean(
          label &&
            detail &&
            label.clientWidth > 0 &&
            label.scrollWidth <= label.clientWidth + 1 &&
            detail.clientWidth > 0 &&
            detail.scrollWidth <= detail.clientWidth + 1
        );
      });
      const loopScopeContainedButtons = loopScopeButtons.filter((button) => {
        const buttonRect = button.getBoundingClientRect();
        return Boolean(
          loopScopeGroupRect &&
            buttonRect.height >= 44 &&
            buttonRect.left >= loopScopeGroupRect.left - 1 &&
            buttonRect.right <= loopScopeGroupRect.right + 1
        );
      });
      const loopScopeColumnCount = loopScopeGroup
        ? window.getComputedStyle(loopScopeGroup).gridTemplateColumns.trim().split(/\s+/).length
        : 0;
      const loopScopeRowCount = new Set(
        loopScopeButtons.map((button) => Math.round(button.getBoundingClientRect().top))
      ).size;
      const loopScopeStateCopyReady =
        ["Song", "Block", "Turn", "Pattern"].every(
          (label, index) =>
            loopScopeButtons[index]?.querySelector(":scope > strong")?.textContent?.trim() === label &&
            (loopScopeButtons[index]?.querySelector(":scope > small")?.textContent?.trim().length ?? 0) > 0
        ) &&
        loopScopeButtons[2]?.querySelector(":scope > small")?.textContent?.includes("→") === true &&
        /\bevents?$/.test(loopScopeButtons[3]?.querySelector(":scope > small")?.textContent?.trim() ?? "");
      const loopScopeGrammarReady = [
        document.querySelector<HTMLElement>(".pattern-lab-context")?.textContent?.trim() ?? "",
        document.querySelector<HTMLElement>(
          '[data-testid="arrangement-pattern-controls"] .arrangement-control-group-heading small'
        )?.textContent?.trim() ?? ""
      ].every((label) => label.length > 0 && !label.includes("events events"));
      const metronomeButton = document.querySelector<HTMLButtonElement>('[data-testid="metronome-toggle"]');
      const metronomeLabel = metronomeButton?.querySelector<HTMLElement>(":scope strong") ?? null;
      const metronomeDetail = metronomeButton?.querySelector<HTMLElement>(":scope small") ?? null;
      const metronomeRect = metronomeButton?.getBoundingClientRect() ?? null;
      const transportEssentialControls = document.querySelector<HTMLElement>(
        '[data-testid="transport-essential-controls"]'
      );
      const transportEssentialRect = transportEssentialControls?.getBoundingClientRect() ?? null;
      const transportPlaybackButton = document.querySelector<HTMLButtonElement>('[data-testid="transport-play"]');
      const transportPlaybackLabel = transportPlaybackButton?.querySelector<HTMLElement>(":scope strong") ?? null;
      const transportPlaybackDetail = transportPlaybackButton?.querySelector<HTMLElement>(":scope small") ?? null;
      const transportPlaybackRect = transportPlaybackButton?.getBoundingClientRect() ?? null;
      const transportPlaybackPressedState = transportPlaybackButton?.getAttribute("aria-pressed") ?? "";
      const transportPlaybackReadable = Boolean(
        transportPlaybackLabel &&
          transportPlaybackDetail &&
          transportPlaybackLabel.clientWidth > 0 &&
          transportPlaybackLabel.scrollWidth <= transportPlaybackLabel.clientWidth + 1 &&
          transportPlaybackDetail.clientWidth > 0 &&
          transportPlaybackDetail.scrollWidth <= transportPlaybackDetail.clientWidth + 1
      );
      const transportPlaybackContained = Boolean(
        transportPlaybackRect &&
          transportEssentialRect &&
          transportPlaybackRect.height >= 38 &&
          transportPlaybackRect.left >= transportEssentialRect.left - 1 &&
          transportPlaybackRect.right <= transportEssentialRect.right + 1 &&
          transportPlaybackRect.top >= transportEssentialRect.top - 1 &&
          transportPlaybackRect.bottom <= transportEssentialRect.bottom + 1
      );
      const metronomePressedState = metronomeButton?.getAttribute("aria-pressed") ?? "";
      const expectedMetronomeState =
        metronomePressedState === "true" ? "On" : metronomePressedState === "false" ? "Off" : "";
      const expectedMetronomeAction = metronomePressedState === "true" ? "Turn off" : "Turn on";
      const bpmField = [...document.querySelectorAll<HTMLLabelElement>("label.field.compact")].find(
        (field) => field.querySelector(":scope > span")?.textContent?.trim() === "BPM"
      );
      const expectedMetronomeBpm = bpmField?.querySelector<HTMLInputElement>('input[type="number"]')?.value ?? "";
      const expectedTransportPlaybackBars =
        loopScopeButtons[0]?.querySelector<HTMLElement>(":scope > small")?.textContent?.trim().replace(/^All /, "") ?? "";
      const expectedTransportPlaybackAccessibleName =
        expectedTransportPlaybackBars && expectedMetronomeBpm
          ? `Play Song loop, ${expectedTransportPlaybackBars} timeline, ${expectedMetronomeBpm} BPM`
          : "";
      const expectedTransportPlaybackTitle =
        expectedTransportPlaybackBars && expectedMetronomeBpm
          ? `Play Song loop · ${expectedTransportPlaybackBars} timeline · ${expectedMetronomeBpm} BPM · Space`
          : "";
      const expectedMetronomeAccessibleName = expectedMetronomeState && expectedMetronomeBpm
        ? `Metronome ${expectedMetronomeState.toLowerCase()}, ${expectedMetronomeBpm} BPM. ${expectedMetronomeAction}`
        : "";
      const transportSessionDetails = document.querySelector<HTMLDetailsElement>(
        '[data-testid="transport-session-tools"]'
      );
      const transportSessionSummaryDetail = transportSessionDetails?.querySelector<HTMLElement>(
        ':scope > summary small'
      );
      const transportSessionInitiallyOpen = transportSessionDetails?.open ?? false;
      if (starterId === "beginner" && transportSessionDetails && !transportSessionInitiallyOpen) {
        transportSessionDetails.open = true;
      }
      const transportSessionContent = transportSessionDetails?.querySelector<HTMLElement>(
        '[data-testid="transport-session-content"]'
      );
      const transportSessionContentRect = transportSessionContent?.getBoundingClientRect() ?? null;
      const tapTempoButton = transportSessionDetails?.querySelector<HTMLButtonElement>(
        '[data-testid="tap-tempo-button"]'
      );
      const tapTempoButtonLabel = tapTempoButton?.querySelector<HTMLElement>(":scope strong") ?? null;
      const tapTempoButtonDetail = tapTempoButton?.querySelector<HTMLElement>(":scope small") ?? null;
      const tapTempoButtonRect = tapTempoButton?.getBoundingClientRect() ?? null;
      const expectedTapTempoAccessibleName = expectedMetronomeBpm
        ? t("transport.tapStartAria", { bpm: expectedMetronomeBpm })
        : "";
      const expectedTapTempoTitle = expectedMetronomeBpm
        ? t("transport.tapStartTitle", { bpm: expectedMetronomeBpm })
        : "";
      const tapTempoReadable = Boolean(
        tapTempoButtonLabel &&
          tapTempoButtonDetail &&
          tapTempoButtonLabel.clientWidth > 0 &&
          tapTempoButtonLabel.scrollWidth <= tapTempoButtonLabel.clientWidth + 1 &&
          tapTempoButtonDetail.clientWidth > 0 &&
          tapTempoButtonDetail.scrollWidth <= tapTempoButtonDetail.clientWidth + 1
      );
      const tapTempoContained = Boolean(
        tapTempoButtonRect &&
          transportSessionContentRect &&
          tapTempoButtonRect.height >= 38 &&
          tapTempoButtonRect.left >= transportSessionContentRect.left - 1 &&
          tapTempoButtonRect.right <= transportSessionContentRect.right + 1 &&
          tapTempoButtonRect.top >= transportSessionContentRect.top - 1 &&
          tapTempoButtonRect.bottom <= transportSessionContentRect.bottom + 1
      );
      if (transportSessionDetails) {
        transportSessionDetails.open = transportSessionInitiallyOpen;
      }
      const tapTempoSessionStateRestored = transportSessionDetails?.open === transportSessionInitiallyOpen;
      const tempoNudgeGroup = document.querySelector<HTMLElement>('[data-testid="tempo-nudge-pads"]');
      const tempoNudgeButtons = tempoNudgeGroup
        ? [...tempoNudgeGroup.querySelectorAll<HTMLButtonElement>("button")]
        : [];
      const tempoNudgeGroupRect = tempoNudgeGroup?.getBoundingClientRect() ?? null;
      const expectedTempoNudgeBpm = Number(expectedMetronomeBpm);
      const expectedTempoNudgePads = Number.isFinite(expectedTempoNudgeBpm)
        ? tempoNudgePads.map((pad) => ({
            ...createTempoNudgePadPresentation(pad, expectedTempoNudgeBpm),
            testId: tempoNudgePadTestId(pad.id)
          }))
        : [];
      const tempoNudgeAccessibleNames = tempoNudgeButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const tempoNudgeReadableLabels = tempoNudgeButtons.filter((button) => {
        const label = button.querySelector<HTMLElement>(":scope > strong");
        const detail = button.querySelector<HTMLElement>(":scope > small");
        return Boolean(
          label &&
            detail &&
            label.clientWidth > 0 &&
            label.scrollWidth <= label.clientWidth + 1 &&
            detail.clientWidth > 0 &&
            detail.scrollWidth <= detail.clientWidth + 1
        );
      });
      const tempoNudgeContainedButtons = tempoNudgeButtons.filter((button) => {
        const buttonRect = button.getBoundingClientRect();
        return Boolean(
          tempoNudgeGroupRect &&
            buttonRect.height >= 24 &&
            buttonRect.left >= tempoNudgeGroupRect.left - 1 &&
            buttonRect.right <= tempoNudgeGroupRect.right + 1 &&
            buttonRect.top >= tempoNudgeGroupRect.top - 1 &&
            buttonRect.bottom <= tempoNudgeGroupRect.bottom + 1
        );
      });
      const tempoNudgeColumnCount = tempoNudgeGroup
        ? window.getComputedStyle(tempoNudgeGroup).gridTemplateColumns.trim().split(/\s+/).length
        : 0;
      const tempoNudgeRowCount = new Set(
        tempoNudgeButtons.map((button) => Math.round(button.getBoundingClientRect().top))
      ).size;
      const tempoNudgeStateCopyReady =
        expectedTempoNudgePads.length === 4 &&
        expectedTempoNudgePads.every(
          (expected, index) =>
            tempoNudgeButtons[index]?.dataset.testid === expected.testId &&
            tempoNudgeButtons[index]?.querySelector(":scope > strong")?.textContent?.trim() === expected.visibleLabel &&
            tempoNudgeButtons[index]?.querySelector(":scope > small")?.textContent?.trim() === `${expected.targetBpm} BPM`
        );
      const metronomeReadable = Boolean(
        metronomeLabel &&
          metronomeDetail &&
          metronomeLabel.clientWidth > 0 &&
          metronomeLabel.scrollWidth <= metronomeLabel.clientWidth + 1 &&
          metronomeDetail.clientWidth > 0 &&
          metronomeDetail.scrollWidth <= metronomeDetail.clientWidth + 1
      );
      const patternTabGroup = document.querySelector<HTMLElement>(".pattern-tabs");
      const patternTabButtons = patternTabGroup
        ? [...patternTabGroup.querySelectorAll<HTMLButtonElement>("button")]
        : [];
      const patternTabGroupRect = patternTabGroup?.getBoundingClientRect() ?? null;
      const patternTabAccessibleNames = patternTabButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const patternTabReadableLabels = patternTabButtons.filter((button) => {
        const label = button.querySelector<HTMLElement>(":scope > span");
        const detail = button.querySelector<HTMLElement>(":scope > small");
        return Boolean(
          label &&
            detail &&
            label.clientWidth > 0 &&
            label.scrollWidth <= label.clientWidth + 1 &&
            detail.clientWidth > 0 &&
            detail.scrollWidth <= detail.clientWidth + 1
        );
      });
      const patternTabContainedButtons = patternTabButtons.filter((button) => {
        const buttonRect = button.getBoundingClientRect();
        return Boolean(
          patternTabGroupRect &&
            buttonRect.height >= 48 &&
            buttonRect.left >= patternTabGroupRect.left - 1 &&
            buttonRect.right <= patternTabGroupRect.right + 1
        );
      });
      const patternTabColumnCount = patternTabGroup
        ? window.getComputedStyle(patternTabGroup).gridTemplateColumns.trim().split(/\s+/).length
        : 0;
      const patternTabRowCount = new Set(
        patternTabButtons.map((button) => Math.round(button.getBoundingClientRect().top))
      ).size;
      const patternTabStateCopyReady =
        patternTabButtons.every(
          (button, index) =>
            button.querySelector(":scope > span")?.textContent?.trim() === `Pattern ${patternSlots[index]}` &&
            /\bevents?$/.test(button.querySelector(":scope > small > em")?.textContent?.trim() ?? "")
        ) &&
        patternTabButtons.filter((button) => button.dataset.editing === "true").every((button) =>
          button.querySelector(":scope > small > strong")?.textContent?.trim().startsWith("Editing")
        );
      const chordToolGroup = document.querySelector<HTMLElement>('[data-testid="chord-edit-tools"]');
      const chordToolButtons = chordToolGroup
        ? [...chordToolGroup.querySelectorAll<HTMLButtonElement>("button")]
        : [];
      const chordToolGroupRect = chordToolGroup?.getBoundingClientRect() ?? null;
      const chordToolReadableLabels = chordToolButtons.filter((button) => {
        const buttonRect = button.getBoundingClientRect();
        const label = button.querySelector<HTMLElement>("span");
        const labelStyle = label ? window.getComputedStyle(label) : null;
        return Boolean(
          chordToolGroupRect &&
            label &&
            labelStyle &&
            buttonRect.width > 0 &&
            buttonRect.left >= chordToolGroupRect.left - 1 &&
            buttonRect.right <= chordToolGroupRect.right + 1 &&
            label.clientWidth > 0 &&
            label.scrollWidth <= label.clientWidth + 1 &&
            labelStyle.whiteSpace !== "nowrap" &&
            labelStyle.textOverflow === "clip"
        );
      });
      const chordToolAccessibleNames = chordToolButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const chordToolRowCount = new Set(
        chordToolButtons.map((button) => Math.round(button.getBoundingClientRect().top))
      ).size;
      const chordToolColumnCount = chordToolGroup
        ? window.getComputedStyle(chordToolGroup).gridTemplateColumns.trim().split(/\s+/).length
        : 0;
      const arrangementMoveGroup = document.querySelector<HTMLElement>(".arrangement-actions");
      const arrangementMoveButtons = [
        ...document.querySelectorAll<HTMLButtonElement>(
          '[data-testid="arrangement-move-left"], [data-testid="arrangement-move-right"]'
        )
      ];
      const arrangementMoveAccessibleNames = arrangementMoveButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const arrangementMoveReadableLabels = arrangementMoveButtons.filter((button) => {
        const label = button.querySelector<HTMLElement>("span");
        return Boolean(label && label.clientWidth > 0 && label.scrollWidth <= label.clientWidth + 1);
      });
      const arrangementMoveContainedButtons = arrangementMoveButtons.filter((button) => {
        const groupRect = arrangementMoveGroup?.getBoundingClientRect() ?? null;
        const buttonRect = button.getBoundingClientRect();
        return Boolean(
          groupRect &&
            buttonRect.left >= groupRect.left - 1 &&
            buttonRect.right <= groupRect.right + 1
        );
      });
      const arrangementMoveInternalOverflow = arrangementMoveGroup
        ? Math.max(0, arrangementMoveGroup.scrollWidth - arrangementMoveGroup.clientWidth)
        : 0;
      const mixerToggleButtons = [
        ...document.querySelectorAll<HTMLButtonElement>(
          '[data-testid^="mixer-mute-"], [data-testid^="mixer-solo-"]'
        )
      ];
      const mixerToggleAccessibleNames = mixerToggleButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const mixerToggleReadableLabels = mixerToggleButtons.filter((button) => {
        const label = button.querySelector<HTMLElement>("span");
        return Boolean(label && label.clientWidth > 0 && label.scrollWidth <= label.clientWidth + 1);
      });
      const mixerToggleContainedButtons = mixerToggleButtons.filter((button) => {
        const strip = button.closest<HTMLElement>('[data-testid^="mixer-strip-"]');
        const stripRect = strip?.getBoundingClientRect() ?? null;
        const buttonRect = button.getBoundingClientRect();
        return Boolean(
          stripRect &&
            buttonRect.width >= 48 &&
            buttonRect.left >= stripRect.left - 1 &&
            buttonRect.right <= stripRect.right + 1
        );
      });
      const mixerStrips = [
        ...document.querySelectorAll<HTMLElement>('[data-testid^="mixer-strip-"]')
      ];
      const mixerNarrowStrips = mixerStrips.filter((strip) => {
        const stripTop = strip.querySelector<HTMLElement>(".strip-top");
        const trackName = stripTop?.querySelector<HTMLElement>(":scope > span");
        const toggles = stripTop?.querySelector<HTMLElement>(".strip-toggles");
        const trackRect = trackName?.getBoundingClientRect() ?? null;
        const togglesRect = toggles?.getBoundingClientRect() ?? null;
        return Boolean(
          stripTop &&
            trackRect &&
            togglesRect &&
            window.getComputedStyle(stripTop).gridTemplateColumns.trim().split(/\s+/).length === 1 &&
            togglesRect.top >= trackRect.bottom
        );
      });
      const mixerToggleInternalOverflow = mixerStrips.reduce(
        (maximum, strip) => Math.max(maximum, strip.scrollWidth - strip.clientWidth),
        0
      );
      const drumToolGroup = document.querySelector<HTMLElement>(".drum-clipboard-row");
      const drumToolButtons = drumToolGroup
        ? [...drumToolGroup.querySelectorAll<HTMLButtonElement>("button")]
        : [];
      const drumToolGroupRect = drumToolGroup?.getBoundingClientRect() ?? null;
      const drumToolAccessibleNames = drumToolButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const drumToolReadableLabels = drumToolButtons.filter((button) => {
        const label = button.querySelector<HTMLElement>("span");
        const labelStyle = label ? window.getComputedStyle(label) : null;
        return Boolean(
          label &&
            labelStyle &&
            label.clientWidth > 0 &&
            label.clientHeight > 0 &&
            label.scrollWidth <= label.clientWidth + 1 &&
            label.scrollHeight <= label.clientHeight + 1 &&
            labelStyle.whiteSpace !== "nowrap" &&
            labelStyle.textOverflow === "clip"
        );
      });
      const drumToolContainedButtons = drumToolButtons.filter((button) => {
        const buttonRect = button.getBoundingClientRect();
        return Boolean(
          drumToolGroupRect &&
            buttonRect.height >= 48 &&
            buttonRect.left >= drumToolGroupRect.left - 1 &&
            buttonRect.right <= drumToolGroupRect.right + 1
        );
      });
      const drumToolColumnCount = drumToolGroup
        ? window.getComputedStyle(drumToolGroup).gridTemplateColumns.trim().split(/\s+/).length
        : 0;
      const drumToolRowCount = new Set(
        drumToolButtons.map((button) => Math.round(button.getBoundingClientRect().top))
      ).size;
      const drumToolInternalOverflow = drumToolGroup
        ? Math.max(0, drumToolGroup.scrollWidth - drumToolGroup.clientWidth)
        : 0;
      const drumToolSelectedHit =
        document.querySelector<HTMLElement>('[data-testid="drum-step-readout"]')?.textContent?.trim().startsWith("Kick 1 ") ?? false;
      const groovePresetSurface = document.querySelector<HTMLElement>('[data-testid="pattern-groove-presets"]');
      const groovePresetGroup = groovePresetSurface?.querySelector<HTMLElement>(".groove-actions") ?? null;
      const groovePresetButtons = groovePresetGroup
        ? [...groovePresetGroup.querySelectorAll<HTMLButtonElement>("button")]
        : [];
      const groovePresetGroupRect = groovePresetGroup?.getBoundingClientRect() ?? null;
      const groovePresetAccessibleNames = groovePresetButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const groovePresetReadableLabels = groovePresetButtons.filter((button) => {
        const label = button.querySelector<HTMLElement>("strong");
        const detail = button.querySelector<HTMLElement>("span");
        const labelStyle = label ? window.getComputedStyle(label) : null;
        const detailStyle = detail ? window.getComputedStyle(detail) : null;
        return Boolean(
          label &&
            detail &&
            labelStyle &&
            detailStyle &&
            label.clientWidth > 0 &&
            label.clientHeight > 0 &&
            detail.clientWidth > 0 &&
            detail.clientHeight > 0 &&
            label.scrollWidth <= label.clientWidth + 1 &&
            label.scrollHeight <= label.clientHeight + 1 &&
            detail.scrollWidth <= detail.clientWidth + 1 &&
            detail.scrollHeight <= detail.clientHeight + 1 &&
            labelStyle.whiteSpace !== "nowrap" &&
            detailStyle.whiteSpace !== "nowrap" &&
            labelStyle.textOverflow === "clip" &&
            detailStyle.textOverflow === "clip"
        );
      });
      const groovePresetContainedButtons = groovePresetButtons.filter((button) => {
        const buttonRect = button.getBoundingClientRect();
        return Boolean(
          groovePresetGroupRect &&
            buttonRect.height >= 48 &&
            buttonRect.left >= groovePresetGroupRect.left - 1 &&
            buttonRect.right <= groovePresetGroupRect.right + 1
        );
      });
      const groovePresetColumnCount = groovePresetGroup
        ? window.getComputedStyle(groovePresetGroup).gridTemplateColumns.trim().split(/\s+/).length
        : 0;
      const groovePresetRowCount = new Set(
        groovePresetButtons.map((button) => Math.round(button.getBoundingClientRect().top))
      ).size;
      const groovePresetInternalOverflow = groovePresetGroup
        ? Math.max(0, groovePresetGroup.scrollWidth - groovePresetGroup.clientWidth)
        : 0;
      const groovePresetContextReady =
        groovePresetSurface?.querySelector<HTMLElement>("#pattern-groove-label")?.textContent?.trim() ===
          "Pattern groove" &&
        groovePresetSurface?.querySelector<HTMLElement>(".groove-row-heading strong")?.textContent?.trim() ===
          "Pattern A" &&
        groovePresetSurface?.querySelector<HTMLElement>("#pattern-groove-help")?.textContent?.trim() ===
          "Applies editable velocity + timing. Use Undo to compare.";
      const noteToolGroup = document.querySelector<HTMLElement>(".note-action-row");
      const noteToolButtons = noteToolGroup
        ? [...noteToolGroup.querySelectorAll<HTMLButtonElement>("button")]
        : [];
      const noteToolGroupRect = noteToolGroup?.getBoundingClientRect() ?? null;
      const noteToolAccessibleNames = noteToolButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const noteToolReadableLabels = noteToolButtons.filter((button) => {
        const label = button.querySelector<HTMLElement>("span");
        const labelStyle = label ? window.getComputedStyle(label) : null;
        return Boolean(
          label &&
            labelStyle &&
            label.clientWidth > 0 &&
            label.clientHeight > 0 &&
            label.scrollWidth <= label.clientWidth + 1 &&
            label.scrollHeight <= label.clientHeight + 1 &&
            labelStyle.whiteSpace !== "nowrap" &&
            labelStyle.textOverflow === "clip"
        );
      });
      const noteToolContainedButtons = noteToolButtons.filter((button) => {
        const buttonRect = button.getBoundingClientRect();
        return Boolean(
          noteToolGroupRect &&
            buttonRect.height >= 48 &&
            buttonRect.left >= noteToolGroupRect.left - 1 &&
            buttonRect.right <= noteToolGroupRect.right + 1
        );
      });
      const noteToolColumnCount = noteToolGroup
        ? window.getComputedStyle(noteToolGroup).gridTemplateColumns.trim().split(/\s+/).length
        : 0;
      const noteToolRowCount = new Set(
        noteToolButtons.map((button) => Math.round(button.getBoundingClientRect().top))
      ).size;
      const noteToolInternalOverflow = noteToolGroup
        ? Math.max(0, noteToolGroup.scrollWidth - noteToolGroup.clientWidth)
        : 0;
      const reviewQueue = document.querySelector<HTMLElement>('[data-testid="review-queue"]');
      const reviewQueueRect = reviewQueue?.getBoundingClientRect() ?? null;
      const reviewQueueFields = [
        "review-queue-focus-status",
        "review-queue-focus-label",
        "review-queue-focus-detail",
        "review-queue-priority-status",
        "review-queue-priority-label",
        "review-queue-priority-item",
        "review-queue-priority-next-check",
        "review-fix-preview-title",
        "review-fix-preview-detail",
        "review-fix-preview-audition",
        "review-fix-preview-next-check"
      ]
        .map((testId) => document.querySelector<HTMLElement>(`[data-testid="${testId}"]`))
        .filter((field): field is HTMLElement => field !== null);
      const reviewQueueReadableFields = reviewQueueFields.filter((field) => {
        const fieldRect = field.getBoundingClientRect();
        const fieldStyle = window.getComputedStyle(field);
        return Boolean(
          reviewQueueRect &&
            fieldRect.width > 0 &&
            fieldRect.left >= reviewQueueRect.left - 1 &&
            fieldRect.right <= reviewQueueRect.right + 1 &&
            fieldStyle.whiteSpace !== "nowrap" &&
            fieldStyle.overflowWrap === "anywhere"
        );
      });
      const reviewQueueStackedRows = [
        "review-queue-focus-readout",
        "review-queue-priority",
        "review-fix-preview"
      ].filter((testId) => {
        const row = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
        return row ? window.getComputedStyle(row).gridTemplateColumns.trim().split(/\s+/).length === 1 : false;
      });

      return {
        arrangementMoveContainedCount: starterId === "beginner" ? arrangementMoveContainedButtons.length : 0,
        arrangementMoveControlCount: starterId === "beginner" ? arrangementMoveButtons.length : 0,
        arrangementMoveInternalOverflow: starterId === "beginner" ? arrangementMoveInternalOverflow : 0,
        arrangementMoveReadableLabelCount: starterId === "beginner" ? arrangementMoveReadableLabels.length : 0,
        arrangementMoveUniqueAccessibleNameCount:
          starterId === "beginner" ? new Set(arrangementMoveAccessibleNames).size : 0,
        chordToolColumnCount: starterId === "beginner" ? chordToolColumnCount : 0,
        chordToolCount: starterId === "beginner" ? chordToolButtons.length : 0,
        chordToolInternalOverflow:
          starterId === "beginner" && chordToolGroup
            ? Math.max(0, chordToolGroup.scrollWidth - chordToolGroup.clientWidth)
            : 0,
        chordToolReadableLabelCount: starterId === "beginner" ? chordToolReadableLabels.length : 0,
        chordToolRowCount: starterId === "beginner" ? chordToolRowCount : 0,
        chordToolUniqueAccessibleNameCount:
          starterId === "beginner" ? new Set(chordToolAccessibleNames).size : 0,
        clearOfNavigator: Boolean(landingRect && navigatorRect && landingRect.top >= navigatorRect.bottom + 8),
        drumToolColumnCount: starterId === "beginner" ? drumToolColumnCount : 0,
        drumToolContainedCount: starterId === "beginner" ? drumToolContainedButtons.length : 0,
        drumToolControlCount: starterId === "beginner" ? drumToolButtons.length : 0,
        drumToolInternalOverflow: starterId === "beginner" ? drumToolInternalOverflow : 0,
        drumToolReadableLabelCount: starterId === "beginner" ? drumToolReadableLabels.length : 0,
        drumToolRowCount: starterId === "beginner" ? drumToolRowCount : 0,
        drumToolSelectedHit: starterId === "beginner" ? drumToolSelectedHit : false,
        drumToolUniqueAccessibleNameCount:
          starterId === "beginner" ? new Set(drumToolAccessibleNames).size : 0,
        focusTestId: document.activeElement instanceof HTMLElement ? document.activeElement.dataset.testid ?? "" : "",
        groovePresetColumnCount: starterId === "beginner" ? groovePresetColumnCount : 0,
        groovePresetContainedCount: starterId === "beginner" ? groovePresetContainedButtons.length : 0,
        groovePresetContextReady: starterId === "beginner" ? groovePresetContextReady : false,
        groovePresetControlCount: starterId === "beginner" ? groovePresetButtons.length : 0,
        groovePresetInternalOverflow: starterId === "beginner" ? groovePresetInternalOverflow : 0,
        groovePresetReadableLabelCount: starterId === "beginner" ? groovePresetReadableLabels.length : 0,
        groovePresetRowCount: starterId === "beginner" ? groovePresetRowCount : 0,
        groovePresetTitleCount:
          starterId === "beginner"
            ? groovePresetButtons.filter((button) => (button.getAttribute("title")?.trim().length ?? 0) > 0).length
            : 0,
        groovePresetUniqueAccessibleNameCount:
          starterId === "beginner" ? new Set(groovePresetAccessibleNames).size : 0,
        inViewport: Boolean(
          landingRect && landingRect.top >= 0 && landingRect.top < window.innerHeight && landingRect.bottom > 0
        ),
        loopScopeColumnCount: starterId === "beginner" ? loopScopeColumnCount : 0,
        loopScopeContainedCount: starterId === "beginner" ? loopScopeContainedButtons.length : 0,
        loopScopeControlCount: starterId === "beginner" ? loopScopeButtons.length : 0,
        loopScopeGrammarReady: starterId === "beginner" ? loopScopeGrammarReady : false,
        loopScopeInternalOverflow:
          starterId === "beginner" && loopScopeGroup
            ? Math.max(0, loopScopeGroup.scrollWidth - loopScopeGroup.clientWidth)
            : 0,
        loopScopePressedCount:
          starterId === "beginner"
            ? loopScopeButtons.filter((button) => button.getAttribute("aria-pressed") === "true").length
            : 0,
        loopScopeReadableLabelCount: starterId === "beginner" ? loopScopeReadableLabels.length : 0,
        loopScopeRoleReady:
          starterId === "beginner" &&
          loopScopeGroup?.getAttribute("role") === "group" &&
          loopScopeGroup.getAttribute("aria-label") === "Choose audition loop scope" &&
          loopScopeButtons.every((button) => /^(true|false)$/.test(button.getAttribute("aria-pressed") ?? "")),
        loopScopeRowCount: starterId === "beginner" ? loopScopeRowCount : 0,
        loopScopeStateCopyReady: starterId === "beginner" ? loopScopeStateCopyReady : false,
        loopScopeTitleCount:
          starterId === "beginner"
            ? loopScopeButtons.filter((button) => (button.getAttribute("title")?.trim().length ?? 0) > 0).length
            : 0,
        loopScopeUniqueAccessibleNameCount:
          starterId === "beginner" ? new Set(loopScopeAccessibleNames).size : 0,
        transportPlaybackAccessibleNameReady:
          starterId === "beginner" &&
          expectedTransportPlaybackAccessibleName.length > 0 &&
          transportPlaybackButton?.getAttribute("aria-label") === expectedTransportPlaybackAccessibleName,
        transportPlaybackContainedCount:
          starterId === "beginner" && transportPlaybackContained ? 1 : 0,
        transportPlaybackControlCount: starterId === "beginner" && transportPlaybackButton ? 1 : 0,
        transportPlaybackDetailClientWidth:
          starterId === "beginner" ? transportPlaybackDetail?.clientWidth ?? 0 : 0,
        transportPlaybackDetailScrollWidth:
          starterId === "beginner" ? transportPlaybackDetail?.scrollWidth ?? 0 : 0,
        transportPlaybackFocusReady:
          starterId === "beginner" &&
          transportPlaybackButton?.tabIndex === 0 &&
          transportPlaybackButton.disabled === false,
        transportPlaybackHeight: starterId === "beginner" ? transportPlaybackRect?.height ?? 0 : 0,
        transportPlaybackInternalOverflow:
          starterId === "beginner" && transportPlaybackButton
            ? Math.max(0, transportPlaybackButton.scrollWidth - transportPlaybackButton.clientWidth)
            : 0,
        transportPlaybackLabelClientWidth:
          starterId === "beginner" ? transportPlaybackLabel?.clientWidth ?? 0 : 0,
        transportPlaybackLabelScrollWidth:
          starterId === "beginner" ? transportPlaybackLabel?.scrollWidth ?? 0 : 0,
        transportPlaybackPressedStateReady:
          starterId === "beginner" && transportPlaybackPressedState === "false",
        transportPlaybackReadableLabelCount:
          starterId === "beginner" && transportPlaybackReadable ? 1 : 0,
        transportPlaybackStateCopyReady:
          starterId === "beginner" &&
          expectedTransportPlaybackBars.length > 0 &&
          transportPlaybackLabel?.textContent?.trim() === "Play" &&
          transportPlaybackDetail?.textContent?.trim() === `Song · ${expectedTransportPlaybackBars}`,
        transportPlaybackTitleReady:
          starterId === "beginner" &&
          expectedTransportPlaybackTitle.length > 0 &&
          transportPlaybackButton?.getAttribute("title") === expectedTransportPlaybackTitle,
        transportPlaybackWidth: starterId === "beginner" ? transportPlaybackRect?.width ?? 0 : 0,
        metronomeAccessibleNameReady:
          starterId === "beginner" &&
          expectedMetronomeAccessibleName.length > 0 &&
          metronomeButton?.getAttribute("aria-label") === expectedMetronomeAccessibleName,
        metronomeContainedCount:
          starterId === "beginner" &&
          metronomeRect &&
          transportEssentialRect &&
          metronomeRect.height >= 38 &&
          metronomeRect.left >= transportEssentialRect.left - 1 &&
          metronomeRect.right <= transportEssentialRect.right + 1
            ? 1
            : 0,
        metronomeControlCount: starterId === "beginner" && metronomeButton ? 1 : 0,
        metronomeFocusReady:
          starterId === "beginner" && metronomeButton?.tabIndex === 0 && metronomeButton.disabled === false,
        metronomeInternalOverflow:
          starterId === "beginner" && metronomeButton
            ? Math.max(0, metronomeButton.scrollWidth - metronomeButton.clientWidth)
            : 0,
        metronomePressedStateReady:
          starterId === "beginner" &&
          /^(true|false)$/.test(metronomePressedState),
        metronomeReadableLabelCount: starterId === "beginner" && metronomeReadable ? 1 : 0,
        metronomeStateCopyReady:
          starterId === "beginner" &&
          expectedMetronomeState.length > 0 &&
          expectedMetronomeBpm.length > 0 &&
          metronomeLabel?.textContent?.trim() === "Metronome" &&
          metronomeDetail?.textContent?.trim() === `${expectedMetronomeState} · ${expectedMetronomeBpm} BPM`,
        metronomeTitleCount:
          starterId === "beginner" && (metronomeButton?.getAttribute("title")?.trim().length ?? 0) > 0 ? 1 : 0,
        tapTempoAccessibleNameReady:
          starterId === "beginner" &&
          expectedTapTempoAccessibleName.length > 0 &&
          tapTempoButton?.getAttribute("aria-label") === expectedTapTempoAccessibleName,
        tapTempoContainedCount: starterId === "beginner" && tapTempoContained ? 1 : 0,
        tapTempoControlCount: starterId === "beginner" && tapTempoButton ? 1 : 0,
        tapTempoFocusReady:
          starterId === "beginner" && tapTempoButton?.tabIndex === 0 && tapTempoButton.disabled === false,
        tapTempoInternalOverflow:
          starterId === "beginner" && tapTempoButton
            ? Math.max(0, tapTempoButton.scrollWidth - tapTempoButton.clientWidth)
            : 0,
        tapTempoReadableLabelCount: starterId === "beginner" && tapTempoReadable ? 1 : 0,
        tapTempoSessionStateRestored: starterId === "beginner" && tapTempoSessionStateRestored,
        tapTempoStateCopyReady:
          starterId === "beginner" &&
          expectedMetronomeBpm.length > 0 &&
          tapTempoButtonLabel?.textContent?.trim() === "Tap Tempo" &&
          tapTempoButtonDetail?.textContent?.trim() === `Start · ${expectedMetronomeBpm} BPM`,
        tapTempoSummaryDiscoveryReady:
          starterId === "beginner" &&
          transportSessionSummaryDetail?.textContent?.trim() === "Tap Tempo · Undo/Keys",
        tapTempoTitleReady:
          starterId === "beginner" &&
          expectedTapTempoTitle.length > 0 &&
          tapTempoButton?.getAttribute("title") === expectedTapTempoTitle,
        tempoNudgeAccessibleNameCount:
          starterId === "beginner" &&
          expectedTempoNudgePads.every(
            (expected, index) => tempoNudgeButtons[index]?.getAttribute("aria-label") === expected.accessibleLabel
          )
            ? tempoNudgeAccessibleNames.length
            : 0,
        tempoNudgeColumnCount: starterId === "beginner" ? tempoNudgeColumnCount : 0,
        tempoNudgeContainedCount: starterId === "beginner" ? tempoNudgeContainedButtons.length : 0,
        tempoNudgeControlCount: starterId === "beginner" ? tempoNudgeButtons.length : 0,
        tempoNudgeFocusableCount:
          starterId === "beginner"
            ? tempoNudgeButtons.filter((button) => button.tabIndex === 0 && button.disabled === false).length
            : 0,
        tempoNudgeInternalOverflow:
          starterId === "beginner" && tempoNudgeGroup
            ? Math.max(0, tempoNudgeGroup.scrollWidth - tempoNudgeGroup.clientWidth)
            : 0,
        tempoNudgeReadableLabelCount: starterId === "beginner" ? tempoNudgeReadableLabels.length : 0,
        tempoNudgeRoleReady:
          starterId === "beginner" &&
          tempoNudgeGroup?.getAttribute("role") === "group" &&
          tempoNudgeGroup.getAttribute("aria-label") === t("core.tempoNudgePadsAria"),
        tempoNudgeRowCount: starterId === "beginner" ? tempoNudgeRowCount : 0,
        tempoNudgeStateCopyReady: starterId === "beginner" ? tempoNudgeStateCopyReady : false,
        tempoNudgeTitleReadyCount:
          starterId === "beginner"
            ? expectedTempoNudgePads.filter(
                (expected, index) => tempoNudgeButtons[index]?.getAttribute("title") === expected.title
              ).length
            : 0,
        mixerNarrowStripCount: starterId === "beginner" ? mixerNarrowStrips.length : 0,
        mixerToggleContainedCount: starterId === "beginner" ? mixerToggleContainedButtons.length : 0,
        mixerToggleCount: starterId === "beginner" ? mixerToggleButtons.length : 0,
        mixerToggleInternalOverflow: starterId === "beginner" ? mixerToggleInternalOverflow : 0,
        mixerTogglePressedStateCount:
          starterId === "beginner"
            ? mixerToggleButtons.filter((button) => button.hasAttribute("aria-pressed")).length
            : 0,
        mixerToggleReadableLabelCount: starterId === "beginner" ? mixerToggleReadableLabels.length : 0,
        mixerToggleTitleCount:
          starterId === "beginner"
            ? mixerToggleButtons.filter((button) => (button.getAttribute("title")?.trim().length ?? 0) > 0).length
            : 0,
        mixerToggleUniqueAccessibleNameCount:
          starterId === "beginner" ? new Set(mixerToggleAccessibleNames).size : 0,
        patternTabColumnCount: starterId === "beginner" ? patternTabColumnCount : 0,
        patternTabContainedCount: starterId === "beginner" ? patternTabContainedButtons.length : 0,
        patternTabControlCount: starterId === "beginner" ? patternTabButtons.length : 0,
        patternTabInternalOverflow:
          starterId === "beginner" && patternTabGroup
            ? Math.max(0, patternTabGroup.scrollWidth - patternTabGroup.clientWidth)
            : 0,
        patternTabReadableLabelCount: starterId === "beginner" ? patternTabReadableLabels.length : 0,
        patternTabRoleReady:
          starterId === "beginner" &&
          patternTabGroup?.getAttribute("role") === "tablist" &&
          patternTabGroup.getAttribute("aria-orientation") === "horizontal" &&
          patternTabButtons.every((button) => button.getAttribute("role") === "tab"),
        patternTabRovingTabStopCount:
          starterId === "beginner" ? patternTabButtons.filter((button) => button.tabIndex === 0).length : 0,
        patternTabRowCount: starterId === "beginner" ? patternTabRowCount : 0,
        patternTabSelectedCount:
          starterId === "beginner"
            ? patternTabButtons.filter((button) => button.getAttribute("aria-selected") === "true").length
            : 0,
        patternTabStateCopyReady: starterId === "beginner" ? patternTabStateCopyReady : false,
        patternTabTitleCount:
          starterId === "beginner"
            ? patternTabButtons.filter((button) => (button.getAttribute("title")?.trim().length ?? 0) > 0).length
            : 0,
        patternTabUniqueAccessibleNameCount:
          starterId === "beginner" ? new Set(patternTabAccessibleNames).size : 0,
        noteToolColumnCount: starterId === "producer" ? noteToolColumnCount : 0,
        noteToolContainedCount: starterId === "producer" ? noteToolContainedButtons.length : 0,
        noteToolControlCount: starterId === "producer" ? noteToolButtons.length : 0,
        noteToolInternalOverflow: starterId === "producer" ? noteToolInternalOverflow : 0,
        noteToolReadableLabelCount: starterId === "producer" ? noteToolReadableLabels.length : 0,
        noteToolRowCount: starterId === "producer" ? noteToolRowCount : 0,
        noteToolUniqueAccessibleNameCount:
          starterId === "producer" ? new Set(noteToolAccessibleNames).size : 0,
        producerQueueOpen:
          document.querySelector<HTMLDetailsElement>('[data-testid="master-review-queue-tools"]')?.open ?? false,
        producerReviewOpen: document.querySelector<HTMLDetailsElement>('[data-testid="master-review-tools"]')?.open ?? false,
        projectTitle: projectRef.current.title,
        reviewQueueContained: Boolean(
          starterId === "producer" &&
            reviewQueue &&
            reviewQueueRect &&
            reviewQueueRect.left >= 0 &&
            reviewQueueRect.right <= window.innerWidth &&
            reviewQueue.scrollWidth <= reviewQueue.clientWidth + 1
        ),
        reviewQueueFieldCount: starterId === "producer" ? reviewQueueFields.length : 0,
        reviewQueueInternalOverflow:
          starterId === "producer" && reviewQueue ? Math.max(0, reviewQueue.scrollWidth - reviewQueue.clientWidth) : 0,
        reviewQueueReadableFieldCount: starterId === "producer" ? reviewQueueReadableFields.length : 0,
        reviewQueueStackedRowCount: starterId === "producer" ? reviewQueueStackedRows.length : 0,
        viewportWidth: window.innerWidth
      };
    };

    const collectAudienceStarterLandingEvidence = async (): Promise<GrooveforgeLaunchSmokeStarterLandingEvidence> => {
      const collectProjectChangeSafetyEvidence = async (): Promise<GrooveforgeLaunchSmokeProjectChangeSafetyEvidence> => {
        const settleTask = async (): Promise<void> => {
          await new Promise<void>((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = () => {
              channel.port1.close();
              channel.port2.close();
              resolve();
            };
            channel.port2.postMessage(null);
          });
        };
        const settleFocus = async (): Promise<void> => {
          await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
          await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
        };
        window.__grooveforgeLaunchSmokeStarterLandingStep = "project-change-showing-dock";
        flushSync(() => setWorkspaceCommandDockVisible(true));
        const beforeFingerprint = JSON.stringify(projectRef.current);
        const targetStyleId = projectRef.current.styleId === "house" ? "lofi" : "house";
        const styleSelect = document.querySelector<HTMLSelectElement>('[data-testid="style-select"]');
        styleSelect?.focus({ preventScroll: true });
        window.__grooveforgeLaunchSmokeStarterLandingStep = "project-change-cancel";
        let cancelDecision!: Promise<QuickActionRunOutcome>;
        flushSync(() => {
          cancelDecision = selectStyle(targetStyleId);
        });
        await settleFocus();
        const dialogOpened = document.querySelector('[data-testid="style-change-dialog"]') !== null;
        const overlay = document.querySelector<HTMLElement>('[data-testid="style-change-preview"]');
        const dock = document.querySelector<HTMLElement>('[data-testid="workspace-command-dock"]');
        const dockRect = dock?.getBoundingClientRect();
        const dockHitTarget = dockRect
          ? document.elementFromPoint(dockRect.left + dockRect.width / 2, dockRect.top + dockRect.height / 2)
          : null;
        const dockVisibleDuringDialog =
          Boolean(dock && dockRect && dockRect.width > 0 && dockRect.height > 0) &&
          getComputedStyle(dock as HTMLElement).display !== "none";
        const dockCoveredDuringDialog =
          dockVisibleDuringDialog &&
          Boolean(overlay) &&
          Number.parseInt(getComputedStyle(overlay as HTMLElement).zIndex, 10) >
            Number.parseInt(getComputedStyle(dock as HTMLElement).zIndex, 10) &&
          !dock?.contains(dockHitTarget);
        const cancelInitialFocus = document.activeElement?.getAttribute("data-testid") ?? "";
        const previewPatternCount = document.querySelectorAll('[data-testid^="style-change-pattern-"]').length;
        const dialog = document.querySelector<HTMLElement>('[data-testid="style-change-dialog"]');
        const closeButton = document.querySelector<HTMLButtonElement>('[data-testid="style-change-close"]');
        const applyButton = document.querySelector<HTMLButtonElement>('[data-testid="style-change-apply"]');
        applyButton?.focus();
        applyButton?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Tab" }));
        const forwardFocusWrap = document.activeElement === closeButton;
        closeButton?.focus();
        closeButton?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Tab", shiftKey: true }));
        const backwardFocusWrap = document.activeElement === applyButton;
        dialog?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
        const cancelOutcome = await cancelDecision;
        await settleFocus();
        const cancelProjectUnchanged = JSON.stringify(projectRef.current) === beforeFingerprint;
        const escapeClosed = document.querySelector('[data-testid="style-change-dialog"]') === null;
        const cancelFocusRestored = document.activeElement === styleSelect;

        window.__grooveforgeLaunchSmokeStarterLandingStep = "project-change-apply";
        let applyDecision!: Promise<QuickActionRunOutcome>;
        flushSync(() => {
          applyDecision = selectStyle(targetStyleId);
        });
        await settleTask();
        document.querySelector<HTMLButtonElement>('[data-testid="style-change-apply"]')?.click();
        const applyOutcome = await applyDecision;
        await settleTask();
        const applyChangedStyle = projectRef.current.styleId === targetStyleId;
        const applySelectedPatternA = projectRef.current.selectedPattern === "A";
        const applyDialogClosed = document.querySelector('[data-testid="style-change-dialog"]') === null;
        document.querySelector<HTMLButtonElement>('[data-testid="undo-button"]')?.click();
        await settleTask();
        const undoRestoredProject = JSON.stringify(projectRef.current) === beforeFingerprint;

        window.__grooveforgeLaunchSmokeStarterLandingStep = "project-change-starter-cancel";
        const starterBeforeFingerprint = JSON.stringify(projectRef.current);
        const undoButton = document.querySelector<HTMLButtonElement>('[data-testid="undo-button"]');
        const undoTitleBeforeStarter = undoButton?.title ?? "";
        let starterConfirmCallCount = 0;
        const originalConfirm = window.confirm;
        window.confirm = () => {
          starterConfirmCallCount += 1;
          return false;
        };
        let starterResult: ReturnType<typeof createAudienceStarter> = null;
        try {
          starterResult = createAudienceStarter("beginner", { verifyReplacementGuard: true });
        } finally {
          window.confirm = originalConfirm;
        }
        await settleTask();
        flushSync(() => setWorkspaceCommandDockVisible(true));
        return {
          applyChangedStyle,
          applyDialogClosed,
          applyOutcome,
          applySelectedPatternA,
          backwardFocusWrap,
          cancelFocusRestored,
          cancelInitialFocus,
          cancelOutcome,
          cancelProjectUnchanged,
          dialogOpened,
          dirtyGuardActive: projectHasUnsavedChangesRef.current,
          dockCoveredDuringDialog,
          dockVisibleDuringDialog,
          escapeClosed,
          forwardFocusWrap,
          previewPatternCount,
          starterCancelOutcome: starterResult === null,
          starterCancelProjectUnchanged: JSON.stringify(projectRef.current) === starterBeforeFingerprint,
          starterConfirmCalled: starterConfirmCallCount === 1,
          starterUndoPostureUnchanged:
            (document.querySelector<HTMLButtonElement>('[data-testid="undo-button"]')?.title ?? "") === undoTitleBeforeStarter,
          undoRestoredProject
        };
      };

      const projectChangeSafety = await collectProjectChangeSafetyEvidence();
      window.__grooveforgeLaunchSmokeStarterLandingStep = "building-beginner";
      createAudienceStarter("beginner");
      setSelectedDrumStep({ lane: "kick", step: 0 });
      window.__grooveforgeLaunchSmokeStarterLandingStep = "settling-beginner";
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      window.__grooveforgeLaunchSmokeStarterLandingStep = "reading-beginner";
      const beginner = readAudienceStarterLanding("beginner");
      window.__grooveforgeLaunchSmokeStarterLandingStep = "building-producer";
      createAudienceStarter("producer");
      window.__grooveforgeLaunchSmokeStarterLandingStep = "settling-producer";
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      const producerPattern = projectRef.current.patterns[projectRef.current.selectedPattern];
      const producerBassNote = producerPattern.bassNotes[0];
      const producerMelodyNote = producerPattern.melodyNotes[0];
      flushSync(() => {
        setSelectedNote(
          producerBassNote
            ? { track: "bass", step: producerBassNote.step, pitch: producerBassNote.pitch }
            : producerMelodyNote
              ? { track: "melody", step: producerMelodyNote.step, pitch: producerMelodyNote.pitch }
              : null
        );
      });
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      window.__grooveforgeLaunchSmokeStarterLandingStep = "reading-producer";
      const producer = readAudienceStarterLanding("producer");
      window.__grooveforgeLaunchSmokeStarterLandingStep = "complete";
      return { beginner, producer, projectChangeSafety };
    };

    window.__grooveforgeLaunchSmoke = {
      ...(window.__grooveforgeLaunchSmoke ?? {}),
      collectAudienceStarterLandingEvidence,
      setModeAwareToolPanels: (mode) => {
        flushSync(() => updateModeAwareToolPanels(mode));
      },
      collectChordCardKeyboardEvidence: () => {
        const previousPage = activeComposeWorkspacePageRef.current;
        flushSync(() => activateComposeWorkspacePage("instruments"));
        let cards = [...document.querySelectorAll<HTMLElement>('[data-testid^="chord-slot-"]')];
        let initial = cards.find((card) => card.dataset.editorOpen === "true");
        if (!initial && cards[0]) {
          flushSync(() => {
            cards[0]?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));
          });
          cards = [...document.querySelectorAll<HTMLElement>('[data-testid^="chord-slot-"]')];
          initial = cards.find((card) => card.dataset.editorOpen === "true");
        }
        const target = cards.find((card) => card !== initial && card.dataset.editorOpen === "false");
        if (!initial || !target) {
          flushSync(() => activateComposeWorkspacePage(previousPage));
          return { restoreReady: false, selectionReady: false };
        }
        const initialTestId = initial.dataset.testid;
        const targetTestId = target.dataset.testid;
        flushSync(() => {
          target.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));
        });
        const currentTarget = document.querySelector<HTMLElement>('[data-testid="' + targetTestId + '"]');
        const currentTargetEditor = document.querySelector<HTMLElement>(
          '[data-testid="' + targetTestId?.replace("chord-slot-", "chord-event-editor-") + '"]'
        );
        const selectionReady =
          currentTarget?.dataset.editorOpen === "true" &&
          (currentTargetEditor?.getBoundingClientRect().height ?? 0) > 0;
        flushSync(() => {
          document
            .querySelector<HTMLElement>('[data-testid="' + initialTestId + '"]')
            ?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: " " }));
        });
        const evidence = {
          restoreReady:
            document.querySelector<HTMLElement>('[data-testid="' + initialTestId + '"]')?.dataset.editorOpen === "true",
          selectionReady
        };
        flushSync(() => activateComposeWorkspacePage(previousPage));
        return evidence;
      },
      collectAudienceSessionQuickActionEvidence: (options = {}) => {
        const chordCards = window.__grooveforgeLaunchSmoke?.collectChordCardKeyboardEvidence?.() ?? {
          restoreReady: false,
          selectionReady: false
        };
        const initialLaunchpadOpen = document.querySelector<HTMLDetailsElement>('[data-testid="first-run-launchpad"]')?.open ?? false;
        flushSync(() => {
          setKeyboardCaptureEnabled(false);
          setCaptureIdeasOpen(false);
        });
        const initialOpen = document.querySelector<HTMLDetailsElement>('[data-testid="capture-ideas"]')?.open ?? true;
        flushSync(() => updateKeyboardCaptureEnabled(true));
        const autoReveal = document.querySelector<HTMLDetailsElement>('[data-testid="capture-ideas"]')?.open ?? false;
        flushSync(() => {
          setKeyboardCaptureEnabled(false);
          setCaptureIdeasOpen(false);
        });
        const resetOpen = document.querySelector<HTMLDetailsElement>('[data-testid="capture-ideas"]')?.open ?? true;
        const captureIdeas = { autoReveal, initialOpen, resetOpen };
        flushSync(() => updateModeAwareToolPanels("guided"));
        const guidedSoundOpen = document.querySelector<HTMLDetailsElement>('[data-testid="sound-design-tools"]')?.open ?? true;
        const guidedHarmonyOpen = document.querySelector<HTMLDetailsElement>('[data-testid="harmony-moves"]')?.open ?? true;
        const guidedArrangementOpen = document.querySelector<HTMLDetailsElement>('[data-testid="arrangement-tools"]')?.open ?? true;
        const guidedBlockMovesOpen = document.querySelector<HTMLDetailsElement>('[data-testid="block-moves"]')?.open ?? true;
        const guidedMixMovesOpen = document.querySelector<HTMLDetailsElement>('[data-testid="mix-moves"]')?.open ?? true;
        const guidedMixReviewOpen = document.querySelector<HTMLDetailsElement>('[data-testid="mix-review-tools"]')?.open ?? true;
        const guidedProcessingOpen = document.querySelector<HTMLDetailsElement>('[data-testid="mixer-processing-drum_rack"]')?.open ?? true;
        const guidedMasterPolishOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-polish-tools"]')?.open ?? true;
        const guidedMasterReviewOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-review-tools"]')?.open ?? true;
        const guidedMasterReviewQueueOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-review-queue-tools"]')?.open ?? true;
        const guidedMasterMixCoachOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-mix-coach-tools"]')?.open ?? true;
        const guidedDeliveryStatusOpen = document.querySelector<HTMLDetailsElement>('[data-testid="handoff-status-tools"]')?.open ?? true;
        const guidedDeliveryAuditOpen = document.querySelector<HTMLDetailsElement>('[data-testid="handoff-audit-tools"]')?.open ?? true;
        const guidedTransportSessionOpen = document.querySelector<HTMLDetailsElement>('[data-testid="transport-session-tools"]')?.open ?? true;
        const guidedTransportExportsOpen =
          document.querySelector('[data-testid="header-export-trigger"]')?.getAttribute("aria-expanded") === "true";
        flushSync(() => updateModeAwareToolPanels("studio"));
        const studioSoundOpen = document.querySelector<HTMLDetailsElement>('[data-testid="sound-design-tools"]')?.open ?? false;
        const studioHarmonyOpen = document.querySelector<HTMLDetailsElement>('[data-testid="harmony-moves"]')?.open ?? false;
        flushSync(() => expandStudioWorkspaceZone("arrange"));
        const studioArrangementOpen = document.querySelector<HTMLDetailsElement>('[data-testid="arrangement-tools"]')?.open ?? false;
        const studioBlockMovesOpen = document.querySelector<HTMLDetailsElement>('[data-testid="block-moves"]')?.open ?? false;
        flushSync(() => expandStudioWorkspaceZone("mix"));
        const studioMixMovesOpen = document.querySelector<HTMLDetailsElement>('[data-testid="mix-moves"]')?.open ?? false;
        const studioMixReviewOpen = document.querySelector<HTMLDetailsElement>('[data-testid="mix-review-tools"]')?.open ?? false;
        const studioProcessingOpen = document.querySelector<HTMLDetailsElement>('[data-testid="mixer-processing-drum_rack"]')?.open ?? false;
        const studioMasterPolishOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-polish-tools"]')?.open ?? false;
        const studioMasterReviewOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-review-tools"]')?.open ?? false;
        const studioMasterReviewQueueOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-review-queue-tools"]')?.open ?? true;
        const studioMasterMixCoachOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-mix-coach-tools"]')?.open ?? true;
        flushSync(() => expandStudioWorkspaceZone("deliver"));
        const studioDeliveryStatusOpen = document.querySelector<HTMLDetailsElement>('[data-testid="handoff-status-tools"]')?.open ?? false;
        const studioDeliveryAuditOpen = document.querySelector<HTMLDetailsElement>('[data-testid="handoff-audit-tools"]')?.open ?? false;
        const studioTransportSessionOpen = document.querySelector<HTMLDetailsElement>('[data-testid="transport-session-tools"]')?.open ?? false;
        const studioTransportExportsOpen =
          document.querySelector('[data-testid="header-export-trigger"]')?.getAttribute("aria-expanded") === "true";
        const studioBlockMovesElement = document.querySelector<HTMLDetailsElement>('[data-testid="block-moves"]');
        const studioBlockMovesStyle = studioBlockMovesElement ? getComputedStyle(studioBlockMovesElement) : null;
        const studioBlockMovesFullWidth =
          studioBlockMovesStyle?.gridColumnStart === "1" && studioBlockMovesStyle.gridColumnEnd === "-1";
        flushSync(() => updateModeAwareToolPanels("guided"));
        const resetSoundOpen = document.querySelector<HTMLDetailsElement>('[data-testid="sound-design-tools"]')?.open ?? true;
        const resetHarmonyOpen = document.querySelector<HTMLDetailsElement>('[data-testid="harmony-moves"]')?.open ?? true;
        const resetArrangementOpen = document.querySelector<HTMLDetailsElement>('[data-testid="arrangement-tools"]')?.open ?? true;
        const resetBlockMovesOpen = document.querySelector<HTMLDetailsElement>('[data-testid="block-moves"]')?.open ?? true;
        const resetMixMovesOpen = document.querySelector<HTMLDetailsElement>('[data-testid="mix-moves"]')?.open ?? true;
        const resetMixReviewOpen = document.querySelector<HTMLDetailsElement>('[data-testid="mix-review-tools"]')?.open ?? true;
        const resetProcessingOpen = document.querySelector<HTMLDetailsElement>('[data-testid="mixer-processing-drum_rack"]')?.open ?? true;
        const resetMasterPolishOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-polish-tools"]')?.open ?? true;
        const resetMasterReviewOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-review-tools"]')?.open ?? true;
        const resetMasterReviewQueueOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-review-queue-tools"]')?.open ?? true;
        const resetMasterMixCoachOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-mix-coach-tools"]')?.open ?? true;
        const resetDeliveryStatusOpen = document.querySelector<HTMLDetailsElement>('[data-testid="handoff-status-tools"]')?.open ?? true;
        const resetDeliveryAuditOpen = document.querySelector<HTMLDetailsElement>('[data-testid="handoff-audit-tools"]')?.open ?? true;
        const resetTransportSessionOpen = document.querySelector<HTMLDetailsElement>('[data-testid="transport-session-tools"]')?.open ?? true;
        const resetTransportExportsOpen =
          document.querySelector('[data-testid="header-export-trigger"]')?.getAttribute("aria-expanded") === "true";
        const arrangementTools = {
          guidedArrangementOpen,
          guidedBlockMovesOpen,
          resetArrangementOpen,
          resetBlockMovesOpen,
          studioArrangementOpen,
          studioBlockMovesFullWidth,
          studioBlockMovesOpen
        };
        const instrumentTools = {
          guidedHarmonyOpen,
          guidedSoundOpen,
          resetHarmonyOpen,
          resetSoundOpen,
          studioHarmonyOpen,
          studioSoundOpen
        };
        const mixerTools = {
          guidedMixMovesOpen,
          guidedMixReviewOpen,
          guidedProcessingOpen,
          resetMixMovesOpen,
          resetMixReviewOpen,
          resetProcessingOpen,
          studioMixMovesOpen,
          studioMixReviewOpen,
          studioProcessingOpen
        };
        focusReviewQueueRouteReadout();
        const routedMasterReviewQueueOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-review-queue-tools"]')?.open ?? false;
        flushSync(() => {
          setMasterReviewQueueOpen(false);
          focusMixCoach();
        });
        const routedMasterMixCoachOpen = document.querySelector<HTMLDetailsElement>('[data-testid="master-mix-coach-tools"]')?.open ?? false;
        flushSync(() => {
          setMasterReviewQueueOpen(false);
          setMasterMixCoachOpen(false);
          setMasterReviewOpen(false);
        });
        const masterTools = {
          guidedMasterPolishOpen,
          guidedMasterReviewOpen,
          guidedMasterReviewQueueOpen,
          guidedMasterMixCoachOpen,
          resetMasterPolishOpen,
          resetMasterReviewOpen,
          resetMasterReviewQueueOpen,
          resetMasterMixCoachOpen,
          routedMasterReviewQueueOpen,
          routedMasterMixCoachOpen,
          studioMasterPolishOpen,
          studioMasterReviewOpen,
          studioMasterReviewQueueOpen,
          studioMasterMixCoachOpen
        };
        const deliveryTools = {
          guidedAuditOpen: guidedDeliveryAuditOpen,
          guidedStatusOpen: guidedDeliveryStatusOpen,
          resetAuditOpen: resetDeliveryAuditOpen,
          resetStatusOpen: resetDeliveryStatusOpen,
          studioAuditOpen: studioDeliveryAuditOpen,
          studioStatusOpen: studioDeliveryStatusOpen
        };
        const transportTools = {
          guidedExportsOpen: guidedTransportExportsOpen,
          guidedSessionOpen: guidedTransportSessionOpen,
          resetExportsOpen: resetTransportExportsOpen,
          resetSessionOpen: resetTransportSessionOpen,
          studioExportsOpen: studioTransportExportsOpen,
          studioSessionOpen: studioTransportSessionOpen
        };
        markLaunchSmokePaletteStep("producer");
        const producer = quickActionEvidenceById("audience-session-enter-producer", projectRef.current, {
          ...projectRef.current,
          mode: "studio"
        });
        markLaunchSmokePaletteStep("route-bridge-readout");
        const routeBridge = quickActionEvidenceById("audience-route-bridge-readout-action");
        markLaunchSmokePaletteStep("route-bridge-readiness");
        const routeBridgeReadiness = quickActionEvidenceById("audience-route-bridge-readiness-action");
        markLaunchSmokePaletteStep("route-bridge-completion");
        const routeBridgeCompletion = quickActionEvidenceById("audience-route-bridge-completion-action");
        markLaunchSmokePaletteStep("dual-readout");
        const dualReadout = quickActionEvidenceById("dual-audience-readiness-route-readout-action");
        markLaunchSmokePaletteStep("dual-beginner");
        const dualBeginner = quickActionEvidenceById("dual-audience-readiness-beginner-action");
        markLaunchSmokePaletteStep("dual-producer");
        const dualProducer = quickActionEvidenceById("dual-audience-readiness-producer-action");
        markLaunchSmokePaletteStep("completion-readout");
        const completionReadout = quickActionEvidenceById("audience-completion-route-readout-action");
        markLaunchSmokePaletteStep("completion-beginner");
        const completionBeginner = quickActionEvidenceById("audience-completion-route-beginner-action");
        markLaunchSmokePaletteStep("completion-producer");
        const completionProducer = quickActionEvidenceById("audience-completion-route-producer-action");
        markLaunchSmokePaletteStep("session-acceptance");
        const sessionAcceptanceReadout = quickActionEvidenceById("audience-session-acceptance-readout-action");
        const sessionAcceptanceBeginner = quickActionEvidenceById("audience-session-acceptance-beginner-action");
        const sessionAcceptanceProducer = quickActionEvidenceById("audience-session-acceptance-producer-action");
        markLaunchSmokePaletteStep("session-proof");
        const sessionProofReadout = quickActionEvidenceById("audience-session-proof-handoff-readout-action");
        const sessionProofBeginner = quickActionEvidenceById("audience-session-proof-handoff-beginner-action");
        const sessionProofProducer = quickActionEvidenceById("audience-session-proof-handoff-producer-action");
        markLaunchSmokePaletteStep("delivery-proof");
        const deliveryProofReadout = quickActionEvidenceById("audience-delivery-proof-bridge-readout-action");
        const deliveryProofBeginner = quickActionEvidenceById("audience-delivery-proof-bridge-beginner-action");
        const deliveryProofProducer = quickActionEvidenceById("audience-delivery-proof-bridge-producer-action");
        markLaunchSmokePaletteStep("guided");
        const guided = quickActionEvidenceById("audience-session-enter-beginner", projectRef.current, {
          ...projectRef.current,
          mode: "guided"
        });
        const skippedStarterEvidence = (starterId: "beginner" | "producer"): GrooveforgeLaunchSmokeAudienceStarterEvidence => ({
          ...routeEvidence(
            starterId === "producer" ? "build professional producer starter" : "build first time composer starter",
            `audience-starter-${starterId}`
          ),
          buttonPresent: false,
          followupPresent: false,
          followupText: "",
          visibleFollowupActionCount: 0,
          visibleFollowupActionLabels: "",
          visibleFollowupCompletionPresent: false,
          visibleFollowupCompletionResult: "",
          visibleFollowupPrimaryPresent: false,
          visibleFollowupPrimaryResult: "",
          visibleFollowupReadinessPresent: false,
          visibleFollowupReadinessResult: "",
          visibleResultAudition: "",
          visibleResultMetricValue: "",
          visibleResultNextCheck: "",
          visibleResultPresent: false,
          visibleResultStatus: "",
          visibleResultTitle: ""
        });
        markLaunchSmokePaletteStep("starter-beginner");
        const starterBeginner = options.skipStarterRoutes
          ? skippedStarterEvidence("beginner")
          : runAudienceStarterRoute("beginner");
        markLaunchSmokePaletteStep("starter-producer");
        const starterProducer = options.skipStarterRoutes
          ? skippedStarterEvidence("producer")
          : runAudienceStarterRoute("producer");
        const collapsedAfterStarter = options.skipStarterRoutes
          ? false
          : document.querySelector<HTMLDetailsElement>('[data-testid="first-run-launchpad"]')?.open === false;
        let manualReopen = false;
        let sameStarterCollapse = false;
        let manualClose = false;
        if (!options.skipStarterRoutes) {
          flushSync(() => {
            document.querySelector<HTMLElement>('[data-testid="first-run-launchpad-toggle"]')?.click();
          });
          manualReopen = document.querySelector<HTMLDetailsElement>('[data-testid="first-run-launchpad"]')?.open === true;
          flushSync(() => {
            createAudienceStarter("producer");
          });
          sameStarterCollapse =
            document.querySelector<HTMLDetailsElement>('[data-testid="first-run-launchpad"]')?.open === false;
          flushSync(() => {
            document.querySelector<HTMLElement>('[data-testid="first-run-launchpad-toggle"]')?.click();
          });
          flushSync(() => {
            document.querySelector<HTMLElement>('[data-testid="first-run-launchpad-toggle"]')?.click();
          });
          manualClose = document.querySelector<HTMLDetailsElement>('[data-testid="first-run-launchpad"]')?.open === false;
        }
        const launchpad = {
          collapsedAfterStarter,
          initialOpen: initialLaunchpadOpen,
          manualClose,
          manualReopen,
          sameStarterCollapse
        };
        markLaunchSmokePaletteStep("returning");
        return {
          arrangementTools,
          captureIdeas,
          chordCards,
          completionCheckpoints: readAudienceCompletionCheckpointEvidence(),
          completionBeginner,
          completionProducer,
          completionReadout,
          deliveryProofBeginner,
          deliveryProofBridge: readAudienceDeliveryProofBridgeEvidence(),
          deliveryProofProducer,
          deliveryProofReadout,
          deliverySnapshot: readAudienceDeliverySnapshotEvidence(),
          deliveryTools,
          dualBeginner,
          dualProducer,
          dualReadout,
          guided,
          instrumentTools,
          mixerTools,
          masterTools,
          launchpad,
          transportTools,
          nextStepRail: readAudienceNextStepRailEvidence(),
          opened: true,
          producer,
          routeBridge,
          routeBridgeCompletion,
          routeBridgeReadiness,
          sessionAcceptanceBeginner,
          sessionAcceptance: readAudienceSessionAcceptanceEvidence(),
          sessionAcceptanceProducer,
          sessionAcceptanceReadout,
          sessionProofBeginner,
          sessionProofHandoff: readAudienceSessionProofHandoffEvidence(),
          sessionProofProducer,
          sessionProofReadout,
          starterBeginner,
          starterProducer,
          resultPresent:
            guided.resultTitle.length > 0 &&
            producer.resultTitle.length > 0 &&
            routeBridge.resultTitle.length > 0 &&
            routeBridgeReadiness.resultTitle.length > 0 &&
            routeBridgeCompletion.resultTitle.length > 0 &&
            dualReadout.resultTitle.length > 0 &&
            dualBeginner.resultTitle.length > 0 &&
            dualProducer.resultTitle.length > 0 &&
            completionReadout.resultTitle.length > 0 &&
            completionBeginner.resultTitle.length > 0 &&
            completionProducer.resultTitle.length > 0 &&
            sessionAcceptanceReadout.resultTitle.length > 0 &&
            sessionAcceptanceBeginner.resultTitle.length > 0 &&
            sessionAcceptanceProducer.resultTitle.length > 0 &&
            sessionProofReadout.resultTitle.length > 0 &&
            sessionProofBeginner.resultTitle.length > 0 &&
            sessionProofProducer.resultTitle.length > 0 &&
            deliveryProofReadout.resultTitle.length > 0 &&
            deliveryProofBeginner.resultTitle.length > 0 &&
            deliveryProofProducer.resultTitle.length > 0 &&
            (options.skipStarterRoutes ||
              (starterBeginner.resultTitle.length > 0 && starterProducer.resultTitle.length > 0)),
          searchPresent:
            guided.searchMetricValue.length > 0 &&
            producer.searchMetricValue.length > 0 &&
            routeBridge.searchMetricValue.length > 0 &&
            routeBridgeReadiness.searchMetricValue.length > 0 &&
            routeBridgeCompletion.searchMetricValue.length > 0 &&
            dualReadout.searchMetricValue.length > 0 &&
            dualBeginner.searchMetricValue.length > 0 &&
            dualProducer.searchMetricValue.length > 0 &&
            completionReadout.searchMetricValue.length > 0 &&
            completionBeginner.searchMetricValue.length > 0 &&
            completionProducer.searchMetricValue.length > 0 &&
            sessionAcceptanceReadout.searchMetricValue.length > 0 &&
            sessionAcceptanceBeginner.searchMetricValue.length > 0 &&
            sessionAcceptanceProducer.searchMetricValue.length > 0 &&
            sessionProofReadout.searchMetricValue.length > 0 &&
            sessionProofBeginner.searchMetricValue.length > 0 &&
            sessionProofProducer.searchMetricValue.length > 0 &&
            deliveryProofReadout.searchMetricValue.length > 0 &&
            deliveryProofBeginner.searchMetricValue.length > 0 &&
            deliveryProofProducer.searchMetricValue.length > 0 &&
            starterBeginner.searchMetricValue.length > 0 &&
            starterProducer.searchMetricValue.length > 0
        };
      }
    };

    return () => {
      const current = window.__grooveforgeLaunchSmoke;
      if (!current) {
        return;
      }
      delete current.collectAudienceSessionQuickActionEvidence;
      delete current.collectChordCardKeyboardEvidence;
      delete current.collectAudienceStarterLandingEvidence;
      delete current.setModeAwareToolPanels;
      if (!current.collectAudienceRouteBridgeDirectEvidence) {
        delete window.__grooveforgeLaunchSmoke;
      }
    };
  }, [audienceSessionReadoutSummary, quickActions, selectedArrangementIndex]);
  const guidedModeContext =
    locale === "en"
      ? createModeSwitchButtonContext({
          firstBeatPathSummary,
          mode: "guided",
          modeFocusSummary,
          projectMode: project.mode,
          sessionPassSummary
        })
      : t(project.mode === "guided" ? "mode.activeTitle" : "mode.switchTitle", { mode: t("mode.guided") });
  const studioModeContext =
    locale === "en"
      ? createModeSwitchButtonContext({
          firstBeatPathSummary,
          mode: "studio",
          modeFocusSummary,
          projectMode: project.mode,
          sessionPassSummary
        })
      : t(project.mode === "studio" ? "mode.activeTitle" : "mode.switchTitle", { mode: t("mode.studio") });
  const fixedFeedbackOwner = quickActionResult
    ? "quick-action"
    : undoRedoResult
      ? "undo-redo"
      : workflowNavigatorResult
        ? "workflow"
        : localDraftRecoveryResult
          ? "local-draft"
          : projectFileResult
            ? "project-file"
            : modeSwitchResult
              ? "mode-switch"
              : "none";

  return (
    <main
      className="app-shell"
      data-fixed-feedback-active={fixedFeedbackOwner !== "none"}
      data-fixed-feedback-owner={fixedFeedbackOwner}
      data-locale={locale}
      data-workspace-command-dock-visible={workspaceCommandDockVisible}
      data-quick-actions-graph-state={
        quickActionGraphFactory ? "ready" : quickActionGraphLoadError ? "error" : quickActionsRequested ? "loading" : "deferred"
      }
      data-quick-actions-materialized={quickActionsMaterialized}
      data-audio-analysis-state={projectAudioAnalysis.status}
      data-manual-qa-arrangement-json={
        window.grooveforge?.manualQa ? JSON.stringify(project.arrangement) : undefined
      }
      data-manual-qa-automation-json={
        window.grooveforge?.manualQa ? JSON.stringify(project.automation) : undefined
      }
    >
      <a className="skip-link" href="#workspace-main">
        {t("nav.skipToWorkspace")}
      </a>
      <header className="transport-band" data-testid="workflow-target-transport" ref={transportPanelRef}>
        <div className="brand-start">
          <div className="brand-lockup">
            <Disc3 size={28} aria-hidden="true" />
            <div className="brand-copy">
              <h1>GrooveForge</h1>
              <span>{t("app.workstation", { kind: window.grooveforge?.appKind ?? "desktop" })}</span>
            </div>
          </div>
          <details className="first-run-launchpad" data-testid="first-run-launchpad" open={launchpadOpen}>
            <summary
              className="first-run-launchpad-summary"
              data-testid="first-run-launchpad-toggle"
              onClick={(event) => {
                event.preventDefault();
                setLaunchpadOpen((open) => !open);
              }}
            >
              <span className="first-run-launchpad-summary-icon" aria-hidden="true">
                <Sparkles size={15} />
              </span>
              <span className="first-run-launchpad-summary-copy">
                <strong>{t("launch.title")}</strong>
                <small>
                  {launchpadOpen
                    ? t("launch.chooseProject")
                    : t("launch.activeProject", { title: project.title })}
                </small>
              </span>
              <span className="first-run-launchpad-summary-context">
                {project.mode === "studio" ? t("mode.studio") : t("mode.guided")} ·{" "}
                {launchpadOpen ? t("launch.choicesOpen") : t("launch.compact")}
              </span>
              <ArrowDown className="first-run-launchpad-chevron" size={14} aria-hidden="true" />
            </summary>
            <div className="first-run-launchpad-content" data-testid="first-run-launchpad-content">
            <div className="first-run-launchpad-heading">
              <Sparkles size={15} aria-hidden="true" />
              <span>{t("launch.startHere")}</span>
            </div>
            <strong>{t("launch.makeBeat")}</strong>
            <small>{t("launch.detail")}</small>
            <button
              className="first-run-launchpad-action primary"
              data-testid="first-run-start-beat"
              type="button"
              onClick={() => createAudienceStarter("beginner")}
            >
              <Music2 size={15} aria-hidden="true" />
              <span>
                <strong>{t("launch.guidedBeat")}</strong>
                <small>{t("launch.guidedBeatDetail")}</small>
              </span>
            </button>
            <button
              className="first-run-launchpad-action"
              data-testid="first-run-producer-pass"
              type="button"
              onClick={() => createAudienceStarter("producer")}
            >
              <SlidersHorizontal size={15} aria-hidden="true" />
              <span>
                <strong>{t("launch.studioPass")}</strong>
                <small>{t("launch.studioPassDetail")}</small>
              </span>
            </button>
            <button
              className="first-run-launchpad-open"
              data-testid="first-run-open-project"
              type="button"
              onClick={() => void handleOpenProject()}
            >
              <FolderOpen size={14} aria-hidden="true" />
              <span>{t("launch.openProject")}</span>
            </button>
            </div>
          </details>
        </div>

        <div className="transport-controls">
          <label className="field title-field">
            <span>{t("field.title")}</span>
            <ProjectTitleInput
              authoritativeRevision={metadataDraftRevision}
              title={project.title}
              onCommit={(title) => {
                if (metadataBlurCommitSuppressedRef.current) {
                  return;
                }
                pendingMetadataDraftRef.current = null;
                metadataReplacementDraftDirtyRef.current = false;
                updateProjectMetadata(
                  (current) => (current.title === title ? current : { ...current, title }),
                  "Unsaved changes"
                );
              }}
            />
          </label>
          <label className="field compact">
            <span>BPM</span>
            <input
              aria-label={t("core.projectBpmAria")}
              data-testid="project-bpm-input"
              type="number"
              min={minProjectBpm}
              max={maxProjectBpm}
              value={project.bpm}
              onChange={(event) => updateProjectBpm(Number(event.target.value) || projectRef.current.bpm)}
            />
          </label>
          <div
            className="tempo-nudge-pads"
            aria-label={t("core.tempoNudgePadsAria")}
            data-testid="tempo-nudge-pads"
            role="group"
          >
            {tempoNudgePadPresentations.map(({ accessibleLabel, pad, targetBpm, title, visibleLabel }) => (
              <button
                aria-label={accessibleLabel}
                data-testid={tempoNudgePadTestId(pad.id)}
                key={pad.id}
                onClick={() => applyTempoNudgePad(pad)}
                title={title}
                type="button"
              >
                <strong>{visibleLabel}</strong>
                <small>{targetBpm} BPM</small>
              </button>
            ))}
          </div>
          <label className="field">
            <span>{t("field.key")}</span>
            <select
              aria-label={t("core.projectKeyAria")}
              data-testid="project-key-select"
              value={project.key}
              onChange={(event) => applyProjectKey(event.target.value)}
            >
              {keys.map((key) => (
                <option key={key}>{key}</option>
              ))}
            </select>
          </label>
          <div
            aria-label={t("core.timeSignatureAria", { signature: projectTimeSignature })}
            className="field time-signature-field"
            data-testid="project-time-signature"
            role="group"
            title={t("core.fixedGridTitle")}
          >
            <span>{t("field.timeSignature")}</span>
            <output data-testid="project-time-signature-value">
              <strong>{projectTimeSignature}</strong>
              <small>{t("field.fixedGrid")}</small>
            </output>
          </div>
          <label className="field">
            <span className="style-field-label">
              {t("field.style")}
              <small data-testid="style-starting-point" id="style-change-behavior">
                {t("field.styleDetail", { count: styleProfiles.length })}
              </small>
            </span>
            <select
              aria-describedby="style-change-behavior"
              aria-label={t("field.style")}
              data-testid="style-select"
              ref={styleSelectRef}
              title={t("field.styleTitle", { count: styleProfiles.length })}
              value={project.styleId}
              onChange={(event) => void selectStyle(event.target.value as ProjectState["styleId"])}
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
          <div className="transport-status-controls" data-testid="transport-status-controls">
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
          </div>
          <div className="transport-essential-controls" data-testid="transport-essential-controls">
          <div className="segmented playback-mode-row" aria-label={t("core.loopScopeAria")} role="group">
            <button
              aria-label={t("core.songLoopAria", {
                target: songLoopAccessibleTarget,
                selected: transportLoopScope === "arrangement" ? t("core.selectedSuffix") : ""
              })}
              aria-pressed={transportLoopScope === "arrangement"}
              className={transportLoopScope === "arrangement" ? "selected" : ""}
              data-testid="playback-mode-arrangement"
              disabled={isPlaying && transportLoopScope !== "arrangement"}
              onClick={() => selectTransportLoopScope("arrangement")}
              title={t("core.songLoopTitle")}
              type="button"
            >
              <strong>{t("transport.song")}</strong>
              <small>{songLoopTargetLabel}</small>
            </button>
            <button
              aria-label={t("core.blockLoopAria", {
                target: blockLoopTargetLabel,
                selected: transportLoopScope === "block" ? t("core.selectedSuffix") : ""
              })}
              aria-pressed={transportLoopScope === "block"}
              className={transportLoopScope === "block" ? "selected" : ""}
              data-testid="transport-loop-block"
              disabled={isPlaying && transportLoopScope !== "block"}
              onClick={() => selectTransportLoopScope("block")}
              title={t("core.blockLoopTitle")}
              type="button"
            >
              <strong>{t("transport.block")}</strong>
              <small>{blockLoopTargetLabel}</small>
            </button>
            <button
              aria-label={t("core.turnLoopAria", {
                target: turnLoopAccessibleTarget,
                selected: transportLoopScope === "transition" ? t("core.selectedSuffix") : ""
              })}
              aria-pressed={transportLoopScope === "transition"}
              className={transportLoopScope === "transition" ? "selected" : ""}
              data-testid="transport-loop-transition"
              disabled={(isPlaying && transportLoopScope !== "transition") || !arrangementTransitionLoopTarget}
              onClick={() => selectTransportLoopScope("transition")}
              title={
                arrangementTransitionLoopTarget
                  ? t("core.turnLoopTitle", { transition: arrangementTransitionLoopTarget.transition.value })
                  : t("core.turnLoopEmptyTitle")
              }
              type="button"
            >
              <strong>{t("transport.turn")}</strong>
              <small>{turnLoopTargetLabel}</small>
            </button>
            <button
              aria-label={t("core.patternLoopAria", {
                pattern: project.selectedPattern,
                events: patternEventCount(currentPattern),
                selected: transportLoopScope === "pattern" ? t("core.selectedSuffix") : ""
              })}
              aria-pressed={transportLoopScope === "pattern"}
              className={transportLoopScope === "pattern" ? "selected" : ""}
              data-testid="playback-mode-pattern"
              disabled={isPlaying && transportLoopScope !== "pattern"}
              onClick={() => selectTransportLoopScope("pattern")}
              title={t("core.patternLoopTitle")}
              type="button"
            >
              <strong>{t("transport.pattern")}</strong>
              <small>{patternLoopTargetLabel}</small>
            </button>
          </div>
          <button
            aria-label={metronomeAccessibleLabel}
            aria-pressed={project.metronomeEnabled}
            className={`icon-button metronome-toggle ${project.metronomeEnabled ? "selected" : ""}`}
            data-testid="metronome-toggle"
            type="button"
            title={project.metronomeEnabled ? t("core.metronomeOffTitle") : t("core.metronomeOnTitle")}
            onClick={toggleMetronome}
          >
            <strong>{t("transport.metronome")}</strong>
            <small>{metronomeDetailLabel}</small>
          </button>
          <button
            aria-label={transportPlaybackAccessibleLabel}
            aria-keyshortcuts="Space"
            aria-pressed={isPlaying}
            className="icon-button primary transport-play-toggle"
            data-testid="transport-play"
            type="button"
            title={transportPlaybackTitle}
            onClick={togglePlayback}
          >
            {isPlaying ? <CircleStop size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            <span className="transport-play-copy">
              <strong>{transportPlaybackAction}</strong>
              <small>{transportPlaybackTarget.detailLabel}</small>
            </span>
          </button>
          </div>
          <details className="transport-session-tools" data-testid="transport-session-tools" open={transportSessionOpen}>
            <summary
              data-testid="transport-session-toggle"
              onClick={(event) => {
                event.preventDefault();
                setTransportSessionOpen((open) => !open);
              }}
            >
              <Gauge size={16} aria-hidden="true" />
              <span>
                <strong>{t("action.sessionContext")}</strong>
                <small>{t("action.sessionContextDetail")}</small>
              </span>
              <ArrowDown size={14} aria-hidden="true" />
            </summary>
            <div className="transport-tools-content" data-testid="transport-session-content">
              <button
                aria-label={tapTempoButtonPresentation.accessibleLabel}
                className="icon-button tap-tempo-button"
                data-testid="tap-tempo-button"
                type="button"
                title={tapTempoButtonPresentation.title}
                onClick={tapProjectTempo}
              >
                <Gauge size={18} aria-hidden="true" />
                <span className="tap-tempo-button-copy">
                  <strong>{t("action.tapTempo")}</strong>
                  <small>{tapTempoButtonPresentation.detailLabel}</small>
                </span>
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
                data-redo-depth={redoStack.length}
                data-testid="edit-history-readout"
                data-undo-depth={undoStack.length}
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
            </div>
          </details>
        </div>
        <HeaderActionDock
          canRedo={canRedo}
          canUndo={canUndo}
          exportDetail={t("action.exportsDetail")}
          exportIcon={<Download size={17} aria-hidden="true" />}
          exportItems={[
            {
              id: "wav",
              label: "WAV",
              detail: t("core.exportWavTitle"),
              icon: <FileAudio size={17} />,
              testId: "export-wav",
              title: t("core.exportWavTitle"),
              onSelect: handleExportWav
            },
            {
              id: "stems",
              label: t("core.stems"),
              detail: t("core.exportStemsTitle"),
              icon: <Waves size={17} />,
              testId: "export-stems",
              title: t("core.exportStemsTitle"),
              onSelect: handleExportStems
            },
            {
              id: "midi",
              label: "MIDI",
              detail: t("core.exportMidiTitle"),
              icon: <KeyboardMusic size={17} />,
              testId: "export-midi",
              title: t("core.exportMidiTitle"),
              onSelect: handleExportMidi
            },
            {
              id: "sheet",
              label: t("core.sheet"),
              detail: t("core.exportSheetTitle"),
              icon: <ListChecks size={17} />,
              testId: "export-handoff-sheet",
              title: t("core.exportSheetTitle"),
              onSelect: handleExportHandoffSheet
            },
            {
              id: "bundle",
              label: t("core.bundle"),
              detail: t("core.exportBundleTitle"),
              icon: <PackageCheck size={17} />,
              testId: "export-delivery-bundle",
              title: t("core.exportBundleTitle"),
              onSelect: handleExportDeliveryBundle
            }
          ]}
          exportLabel={t("action.exports")}
          onRedo={redoProject}
          onUndo={undoProject}
          redoIcon={<Redo2 size={16} aria-hidden="true" />}
          redoLabel={t("action.redo")}
          redoTitle={t("action.redoTitle")}
          undoIcon={<Undo2 size={16} aria-hidden="true" />}
          undoLabel={t("action.undo")}
          undoTitle={t("action.undoTitle")}
          utilityDetail={t("action.utilityDetail")}
          utilityIcon={<SlidersHorizontal size={17} aria-hidden="true" />}
          utilityItems={[
            {
              id: "open",
              label: t("action.open"),
              detail: t("action.openTitle"),
              icon: <FolderOpen size={17} />,
              keyShortcuts: "Control+O Meta+O",
              testId: "project-open",
              title: t("action.openTitle"),
              onSelect: () => void handleOpenProject()
            },
            {
              id: "save",
              label: t("action.save"),
              detail: t("action.saveTitle"),
              icon: <Save size={17} />,
              keyShortcuts: "Control+S Meta+S",
              testId: "project-save",
              title: t("action.saveTitle"),
              onSelect: () => void handleSaveProject()
            },
            {
              id: "actions",
              label: t("action.actions"),
              detail: t("action.openActionsTitle"),
              icon: <KeyboardMusic size={17} />,
              keyShortcuts: "Control+K Meta+K",
              testId: "quick-actions-open",
              title: t("action.openActionsTitle"),
              onSelect: openQuickActions
            },
            {
              id: "help",
              label: t("action.help"),
              detail: t("action.openHelpTitle"),
              icon: <CircleHelp size={17} />,
              keyShortcuts: "? Control+/ Meta+/",
              testId: "command-reference-open",
              title: t("action.openHelpTitle"),
              onSelect: openCommandReference
            },
            {
              id: "guide",
              label: t("guide.title"),
              detail: project.mode === "guided" ? t("guide.guidedDetail") : t("guide.studioDetail"),
              icon: <Target size={17} />,
              testId: "guidance-center-open",
              title: t("guide.title"),
              onSelect: () => setGuidanceCenterOpen(true)
            },
            {
              id: "settings",
              label: t("action.settings"),
              detail: t("action.settingsTitle"),
              icon: <Settings size={17} />,
              testId: "settings-open",
              title: t("action.settingsTitle"),
              onSelect: () => setSettingsOpen(true)
            }
          ]}
          utilityLabel={t("action.utility")}
        />
      </header>

      {workspaceCommandDockVisible && (
        <div
          aria-label={t("core.commandDockAria")}
          className="workspace-command-dock"
          data-testid="workspace-command-dock"
          role="toolbar"
        >
          <div
            className={`workspace-command-dock-position ${transportPositionReadout.tone}`}
            data-testid="workspace-command-dock-position"
            title={transportPositionReadout.detailTitle}
          >
            <span>{transportPositionReadout.statusLabel}</span>
            <strong>{transportPositionReadout.roleLabel}</strong>
            <small>{transportPositionReadout.detailLabel}</small>
          </div>
          <button
            aria-label={transportPlaybackAccessibleLabel}
            aria-keyshortcuts="Space"
            aria-pressed={isPlaying}
            className="workspace-command-dock-button primary"
            data-testid="workspace-command-dock-play"
            onClick={togglePlayback}
            title={transportPlaybackTitle}
            type="button"
          >
            {isPlaying ? <CircleStop size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            <span>{isPlaying ? t("transport.stop") : t("transport.play")}</span>
          </button>
          <button
            aria-keyshortcuts="Control+K Meta+K"
            className="workspace-command-dock-button"
            data-testid="workspace-command-dock-actions"
            onClick={openQuickActions}
            title={t("action.openActionsTitle")}
            type="button"
          >
            <KeyboardMusic size={16} aria-hidden="true" />
            <span>{t("action.actions")}</span>
          </button>
          <button
            aria-keyshortcuts="Control+Z Meta+Z"
            className="workspace-command-dock-button"
            data-testid="workspace-command-dock-undo"
            disabled={!canUndo}
            onClick={undoProject}
            title={t("action.undoTitle")}
            type="button"
          >
            <Undo2 size={16} aria-hidden="true" />
            <span>{t("action.undo")}</span>
          </button>
          <button
            aria-keyshortcuts="Control+Y Meta+Y Control+Shift+Z Meta+Shift+Z"
            className="workspace-command-dock-button"
            data-testid="workspace-command-dock-redo"
            disabled={!canRedo}
            onClick={redoProject}
            title={t("action.redoTitle")}
            type="button"
          >
            <Redo2 size={16} aria-hidden="true" />
            <span>{t("action.redo")}</span>
          </button>
          <button
            aria-keyshortcuts="Control+S Meta+S"
            className="workspace-command-dock-button"
            data-testid="workspace-command-dock-save"
            onClick={() => void handleSaveProject()}
            title={t("action.saveTitle")}
            type="button"
          >
            <Save size={16} aria-hidden="true" />
            <span>{t("action.save")}</span>
          </button>
        </div>
      )}

      <QuickActions
        actions={filteredQuickActions}
        loading={quickActionsRequested && !quickActionGraphFactory && !quickActionGraphLoadError}
        loadError={quickActionGraphLoadError}
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
        onOpenCommandReference={openCommandReference}
        onRetryLoad={retryQuickActionGraphLoad}
      />
      <CommandReferenceDialog
        open={commandReferenceOpen}
        onClose={closeCommandReference}
        onOpenQuickActions={openQuickActions}
      />
      <StyleChangeDialog
        preview={styleChangePreview}
        onApply={confirmStyleChange}
        onCancel={cancelStyleChange}
      />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {localDraftRecovery && !localDraftRecoveryDeferred && (
        <LocalDraftRecoveryBanner
          draft={localDraftRecovery}
          onClear={() => void clearLocalDraftRecovery(beginFixedFeedbackIntent())}
          onDefer={deferLocalDraftRecovery}
          onRestore={restoreLocalDraft}
        />
      )}

      <section className="mode-row" aria-label={t("mode.label")}>
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
            aria-pressed={project.mode === "guided"}
            className={project.mode === "guided" ? "selected" : ""}
            data-testid="mode-guided"
            title={guidedModeContext}
            type="button"
            onClick={() => switchProjectMode("guided")}
          >
            {t("mode.guided")}
          </button>
          <button
            aria-label={studioModeContext}
            aria-pressed={project.mode === "studio"}
            className={project.mode === "studio" ? "selected" : ""}
            data-testid="mode-studio"
            title={studioModeContext}
            type="button"
            onClick={() => switchProjectMode("studio")}
          >
            {t("mode.studio")}
          </button>
        </div>
        <div className="session-meter">
          <span style={{ "--accent": style.color } as CSSProperties}>{style.name}</span>
          <span>{deliveryTarget.name}</span>
          <span>{project.key}</span>
          <span>{activeChannelLabel}</span>
          <span>{project.masterPreset}</span>
          <span data-testid="audio-analysis-status">
            {projectAudioAnalysis.status === "error"
              ? t("analysis.unavailable")
              : projectAudioAnalysis.pending
                ? t("analysis.updating")
                : t("analysis.ready")}
          </span>
          {projectAudioAnalysis.status === "error" && (
            <button
              className="audio-analysis-retry"
              data-testid="audio-analysis-retry"
              onClick={retryCurrentProjectAudioAnalysis}
              title={t("core.retryMetersTitle")}
              type="button"
            >
              {t("analysis.retry")}
            </button>
          )}
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
        {fixedFeedbackOwner === "mode-switch" && modeSwitchResult && <ModeSwitchResultStrip result={modeSwitchResult} />}
        {fixedFeedbackOwner === "project-file" && projectFileResult && <ProjectFileResultStrip result={projectFileResult} />}
        {fixedFeedbackOwner === "local-draft" && localDraftRecoveryResult && (
          <LocalDraftRecoveryResultStrip result={localDraftRecoveryResult} />
        )}
      </section>

      <WorkflowNavigator
        activeZone={activeWorkspaceZone}
        items={workflowNavigatorItems}
        onOpenOverview={selectOverviewNavigatorTab}
        result={fixedFeedbackOwner === "workflow" ? workflowNavigatorResult : null}
        sectionRef={workflowNavigatorPanelRef}
        onJump={selectWorkflowNavigatorTab}
      />

      <details
        className="guidance-center"
        data-testid="guidance-center"
        open={guidanceCenterOpen}
        onToggle={(event) => setGuidanceCenterOpen(event.currentTarget.open)}
        ref={guidanceCenterRef}
      >
        <summary className="guidance-center-summary" data-testid="guidance-center-toggle">
          <span className="guidance-center-icon" aria-hidden="true">
            <CircleHelp size={18} />
          </span>
          <span className="guidance-center-copy">
            <strong>{t("guide.title")}</strong>
            <small>
              {project.mode === "guided"
                ? t("guide.guidedDetail")
                : t("guide.studioDetail")}
            </small>
          </span>
          <span className="guidance-center-context">
            {project.mode === "guided" ? t("mode.guided") : t("mode.studio")} ·{" "}
            {guidanceCenterOpen ? t("guide.open") : t("guide.onDemand")}
          </span>
          <ArrowDown className="guidance-center-chevron" size={17} aria-hidden="true" />
        </summary>
        <Activity mode={workspaceActivityMode(guidanceCenterOpen)} name="guide-review-center">
        <div className="guidance-center-content" data-testid="guidance-center-content">
      {exactProjectAudioAnalysisReady ? (
        <GuideQuickStart
          firstBeatPathSummary={firstBeatPathSummary}
          sessionPassSummary={sessionPassSummary}
          workflowNavigatorItems={workflowNavigatorItems}
          onJumpFirstBeatPath={jumpToFirstBeatPathStep}
          onFocusSessionPass={focusSessionPassCard}
          onJumpWorkflowSpotlight={jumpToWorkflowNavigatorItem}
          onOpenGuideCenter={() => setGuidanceCenterOpen(true)}
        />
      ) : (
        <ProjectAudioAnalysisGate
          onRetry={retryCurrentProjectAudioAnalysis}
          status={projectAudioAnalysis.status}
          surface="Guide"
        />
      )}
      {exactProjectAudioAnalysisReady && (
      <AudienceSessionReadout
        result={audienceSessionActionResult}
        starterResult={audienceStarterResult}
        summary={audienceSessionReadoutSummary}
        onCreateStarter={createAudienceStarter}
        onOpenStarterFollowup={openAudienceStarterFollowup}
        onSelectAudience={selectAudienceSessionRow}
      />
      )}

      {exactProjectAudioAnalysisReady ? (
        <>
      <AudienceRouteBridge
        audienceSessionSummary={audienceSessionReadoutSummary}
        beatReadinessChecks={beatReadinessChecks}
        exportPreflightSummary={exportPreflightSummary}
        firstBeatPathSummary={firstBeatPathSummary}
        handoffPackageCheckSummary={handoffPackageCheckSummary}
        productionSnapshotSummary={productionSnapshotSummary}
        sessionPassSummary={sessionPassSummary}
        onFocusExportPreflight={focusExportPreflightCard}
        onFocusHandoffPackageCheck={focusHandoffPackageCheckCard}
        onFocusProductionSnapshot={focusProductionSnapshotMetric}
        onJumpFirstBeatPath={jumpToFirstBeatPathStep}
      />

      <DualAudienceReadinessStrip
        beatReadinessChecks={beatReadinessChecks}
        exportPreflightSummary={exportPreflightSummary}
        firstBeatPathSummary={firstBeatPathSummary}
        productionSnapshotSummary={productionSnapshotSummary}
        sessionPassSummary={sessionPassSummary}
        onFocusExportPreflight={focusExportPreflightCard}
        onFocusProductionSnapshot={focusProductionSnapshotMetric}
        onJumpFirstBeatPath={jumpToFirstBeatPathStep}
      />

      <AudienceCompletionRouteStrip
        beatReadinessChecks={beatReadinessChecks}
        exportPreflightSummary={exportPreflightSummary}
        firstBeatPathSummary={firstBeatPathSummary}
        handoffPackageCheckSummary={handoffPackageCheckSummary}
        productionSnapshotSummary={productionSnapshotSummary}
        sessionPassSummary={sessionPassSummary}
        onFocusExportPreflight={focusExportPreflightCard}
        onFocusHandoffPackageCheck={focusHandoffPackageCheckCard}
        onFocusProductionSnapshot={focusProductionSnapshotMetric}
        onJumpFirstBeatPath={jumpToFirstBeatPathStep}
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

      <SessionPass
        result={sessionPassResult}
        sectionRef={sessionPassPanelRef}
        summary={sessionPassSummary}
        onFocus={focusSessionPassCard}
      />
        </>
      ) : (
        <ProjectAudioAnalysisGate
          onRetry={retryCurrentProjectAudioAnalysis}
          status={projectAudioAnalysis.status}
          surface="Guide"
        />
      )}

      {exactProjectAudioAnalysisReady && (
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
      )}

      <KeyCompass
        focusedCardId={keyCompassFocusId}
        onFocus={focusKeyCompassItem}
        result={keyCompassResult}
        sectionRef={keyCompassPanelRef}
        summary={keyCompassSummary}
      />

      <GrooveCompass
        cued={transportLoopScope === "pattern"}
        focusedCardId={grooveCompassFocusId}
        isPlaying={isPlaying}
        onCue={cueGrooveCompass}
        onFocus={focusGrooveCompassItem}
        result={grooveCompassResult}
        sectionRef={grooveCompassPanelRef}
        selectedPattern={project.selectedPattern}
        summary={grooveCompassSummary}
      />

      {exactProjectAudioAnalysisReady && (
        <>
      <ComposerGuide
        summary={composerGuideSummary}
        focusedCardId={composerGuideFocusId}
        result={composerGuideResult}
        sectionRef={composerGuidePanelRef}
        onFocus={focusComposerGuideCard}
      />

      <ComposerActions
        project={project}
        summary={composerActionsSummary}
        result={composerActionResult}
        onRun={runComposerAction}
      />
        </>
      )}

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
        analysisStatus={projectAudioAnalysis.status}
        authoritativeRevision={metadataDraftRevision}
        brief={project.sessionBrief}
        compass={sessionBriefCompassSummary}
        compassResult={sessionBriefCompassResult}
        focusedCompassCardId={sessionBriefCompassFocusId}
        focusedReferenceCardId={referenceAlignmentFocusId}
        referenceAlignment={referenceAlignmentSummary}
        referenceAlignmentResult={referenceAlignmentResult}
        result={sessionBriefStarterResult}
        sectionRef={referenceAlignmentPanelRef}
        starterPads={sessionBriefStarterPads}
        fieldRefs={{
          artist: sessionBriefArtistRef,
          vibe: sessionBriefVibeRef,
          reference: sessionBriefReferenceRef,
          notes: sessionBriefNotesRef
        }}
        onApplyStarter={applySessionBriefStarterPad}
        onChange={(field, value) => {
          if (metadataBlurCommitSuppressedRef.current) {
            return;
          }
          pendingMetadataDraftRef.current = null;
          metadataReplacementDraftDirtyRef.current = false;
          updateSessionBrief(field, value);
        }}
        onClear={clearSessionBrief}
        onFocusCompass={focusSessionBriefCompassCard}
        onFocusReferenceAlignment={focusReferenceAlignmentCard}
        onRetryMeters={retryCurrentProjectAudioAnalysis}
      />

      {exactProjectAudioAnalysisReady && (
        <>
      <BeatPassport
        focusedMetricId={beatPassportFocusId}
        result={beatPassportResult}
        sectionRef={beatPassportPanelRef}
        summary={beatPassportSummary}
        onFocus={focusBeatPassportMetric}
      />

      <ProductionSnapshot
        focusedMetricId={productionSnapshotFocusId}
        result={productionSnapshotResult}
        sectionRef={productionSnapshotPanelRef}
        summary={productionSnapshotSummary}
        onFocus={focusProductionSnapshotMetric}
      />

      <ExportPreflight
        focusedCardId={exportPreflightFocusId}
        result={exportPreflightResult}
        onFocus={focusExportPreflightCard}
        summary={exportPreflightSummary}
      />

      <BeatReadiness
        checks={beatReadinessChecks}
        focusedCheckId={beatReadinessFocusId}
        result={beatReadinessResult}
        onFocus={focusBeatReadinessCheck}
        sectionRef={beatReadinessPanelRef}
      />

      <ListeningPass
        focusedItemId={listeningPassFocusId}
        result={listeningPassResult}
        sectionRef={listeningPassPanelRef}
        summary={listeningPassSummary}
        onFocus={focusListeningPassItem}
      />

      <BeatMap
        actions={beatMapActions}
        onRun={runNextMove}
        sectionRef={beatMapPanelRef}
        summary={beatMapSummary}
      />
        </>
      )}

      <StructureLens
        actions={structureLensActions}
        onRun={runNextMove}
        sectionRef={structureLensPanelRef}
        summary={structureLensSummary}
      />

      {exactProjectAudioAnalysisReady && (
        <>
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
        sectionRef={hookReadinessPanelRef}
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
        sectionRef={toplineSpacePanelRef}
        summary={toplineSpaceSummary}
      />
        </>
      )}

      <SongFormOverview
        playingArrangementIndex={playingArrangementIndex}
        summary={songFormOverviewSummary}
        onSelectBlock={selectArrangementBlock}
      />

      {exactProjectAudioAnalysisReady && (
        <NextMove actions={nextMoveActions} onRun={runNextMove} result={nextMoveResult} sectionRef={nextMovePanelRef} />
      )}

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

      {exactProjectAudioAnalysisReady && (
      <SnapshotCompare
        focusedMetricId={snapshotCompareFocusId}
        focusSummary={createSnapshotCompareFocusSummary(snapshotCompareSummary, snapshotCompareFocusId)}
        onFocus={focusSnapshotCompareMetric}
        result={snapshotCompareResult}
        summary={snapshotCompareSummary}
      />
      )}
        </div>
        </Activity>
      </details>

      <div className="workspace-feedback-anchor" data-testid="workspace-feedback-anchor">
        {fixedFeedbackOwner === "undo-redo" && undoRedoResult && <UndoRedoResultStrip result={undoRedoResult} />}
        {fixedFeedbackOwner === "quick-action" && quickActionResult && <QuickActionResultStrip result={quickActionResult} />}
      </div>

      <div
        aria-label={t("nav.mainTabsAria")}
        className="workspace-tabpanels"
        data-active-workspace-zone={activeWorkspaceZone}
        id="workspace-main"
        tabIndex={-1}
      >
      <section
        aria-labelledby="workspace-tab-overview"
        className="workspace-grid workspace-zone-panel workspace-overview-panel"
        data-testid="workflow-target-overview"
        data-workspace-zone="overview"
        hidden={activeWorkspaceZone !== "overview"}
        id="workspace-panel-overview"
        role="tabpanel"
        tabIndex={activeWorkspaceZone === "overview" ? 0 : -1}
      >
        <Activity mode={workspaceActivityMode(activeWorkspaceZone === "overview")} name="workspace-overview">
          <WorkspaceOverview
            activePage={activeOverviewWorkspacePage}
            analysis={exactProjectAudioAnalysisReady ? exportAnalysis : null}
            analysisState={projectAudioAnalysis.status}
            isFullSongPlaying={isFullSongPlaying}
            isPlaying={isPlaying}
            onSelectPage={(page) => {
              setActiveOverviewWorkspacePage(page);
              setProjectStatus(`Opened Overview / ${page === "snapshot" ? "At a glance" : page === "song-map" ? "Song map" : "Readiness"} page`);
            }}
            onToggleFullSongPlayback={toggleOverviewSongPlayback}
            playbackPosition={playbackPosition}
            project={project}
            workflowItems={workflowNavigatorItems}
          />
        </Activity>
      </section>
      <section
        aria-labelledby="workspace-tab-compose"
        className="workspace-grid workspace-zone-panel workspace-compose-panel"
        data-workspace-zone="compose"
        hidden={activeWorkspaceZone !== "compose"}
        id="workspace-panel-compose"
        role="tabpanel"
        tabIndex={activeWorkspaceZone === "compose" ? 0 : -1}
      >
        <Activity mode={workspaceActivityMode(activeWorkspaceZone === "compose")} name="workspace-compose">
        <WorkspacePageTabs
          activePage={activeComposeWorkspacePage}
          ariaLabel={t("nav.subTabsAria", { title: t("nav.compose") })}
          idPrefix="compose"
          items={[
            {
              id: "drums",
              label: t("nav.drums"),
              detail: t("nav.drumsDetail"),
              meta: t("nav.drumsMeta"),
              icon: <Drum size={18} />
            },
            {
              id: "notes",
              label: t("nav.notes"),
              detail: t("nav.notesDetail"),
              meta: t("nav.notesMeta"),
              icon: <KeyboardMusic size={18} />
            },
            {
              id: "instruments",
              label: t("nav.instruments"),
              detail: t("nav.instrumentsDetail"),
              meta: t("nav.instrumentsMeta"),
              icon: <Sparkles size={18} />
            }
          ]}
          onSelect={(page) => activateComposeWorkspacePage(page, true)}
          title={t("nav.composeEditor")}
        />
        <section
          aria-labelledby="compose-page-tab-drums"
          className="panel pattern-panel workspace-page-panel"
          data-workspace-page="drums"
          data-testid="workflow-target-compose"
          hidden={activeComposeWorkspacePage !== "drums"}
          id="compose-page-panel-drums"
          aria-label={t("compose.patternEditorAria")}
          ref={composePanelRef}
          role="tabpanel"
          tabIndex={activeComposeWorkspacePage === "drums" ? 0 : -1}
        >
          <PanelTitle icon={<Drum size={18} />} title={t("nav.drums")} meta={t("panel.drumsMeta")} />
          <div
            aria-label={t("compose.patternTabsAria")}
            aria-orientation="horizontal"
            className="pattern-tabs"
            role="tablist"
          >
            {patternSlots.map((pattern) => {
              const selected = project.selectedPattern === pattern;
              const playing = playingPattern === pattern;
              const eventLabel = patternEventCount(project.patterns[pattern]);
              const visibleState = selected && playing
                ? t("compose.stateEditingPlayingVisible")
                : selected
                  ? t("compose.stateEditingVisible")
                  : playing
                    ? t("compose.statePlayingVisible")
                    : "";
              const accessibleState = selected && playing
                ? t("compose.stateEditingPlayingAria")
                : selected
                  ? t("compose.stateEditingAria")
                  : playing
                    ? t("compose.statePlayingAria")
                    : "";
              return (
                <button
                  aria-label={t("compose.patternTabAria", {
                    pattern,
                    state: accessibleState ? `, ${accessibleState}` : "",
                    events: eventLabel
                  })}
                  aria-keyshortcuts={String(patternSlots.indexOf(pattern) + 1)}
                  aria-selected={selected}
                  key={pattern}
                  aria-current={playing ? "step" : undefined}
                  className={["pattern-tab", selected ? "selected" : "", playing ? "playing" : ""].filter(Boolean).join(" ")}
                  data-editing={selected ? "true" : "false"}
                  data-playing={playing ? "true" : "false"}
                  data-testid={`pattern-tab-${pattern}`}
                  onKeyDown={(event) => handlePatternTabKeyDown(event, pattern)}
                  ref={(element) => {
                    patternTabRefs.current[pattern] = element;
                  }}
                  role="tab"
                  tabIndex={selected ? 0 : -1}
                  type="button"
                  title={t("compose.editPatternTitle", {
                    pattern,
                    index: patternSlots.indexOf(pattern) + 1
                  })}
                  onClick={() => selectPattern(pattern)}
                >
                  <span>{t("compose.patternLabel", { pattern })}</span>
                  <small>
                    {visibleState && <strong>{visibleState}</strong>}
                    <em>{eventLabel}</em>
                  </small>
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
                  ? t("compose.editAudiblePatternAria", { pattern: audiblePatternFollowTarget })
                  : playingPattern
                    ? t("compose.audiblePatternSynced")
                    : t("compose.noAudiblePattern")
              }
              className="pattern-playback-follow-button"
              data-testid="pattern-playback-follow"
              disabled={!audiblePatternFollowTarget}
              onClick={followAudiblePattern}
              title={
                audiblePatternFollowTarget
                  ? t("compose.switchToAudiblePatternTitle", { pattern: audiblePatternFollowTarget })
                  : playingPattern
                    ? t("compose.audiblePatternSynced")
                    : t("compose.playToFollowPatternTitle")
              }
              type="button"
            >
              <ArrowRight size={13} aria-hidden="true" />
              <span>
                {audiblePatternFollowTarget
                  ? t("compose.editPattern", { pattern: audiblePatternFollowTarget })
                  : playingPattern
                    ? t("compose.inSync")
                    : t("compose.idle")}
              </span>
            </button>
          </div>
          <details className="pattern-lab" data-testid="pattern-lab">
            <summary className="pattern-lab-summary" data-testid="pattern-lab-toggle">
              <span className="pattern-lab-icon" aria-hidden="true">
                <Sparkles size={16} />
              </span>
              <span className="pattern-lab-copy">
                <strong>{t("compose.patternLab")}</strong>
                <small>{t("compose.patternLabDetail")}</small>
              </span>
              <span className="pattern-lab-context">
                {t("compose.patternLabContext", {
                  pattern: project.selectedPattern,
                  events: patternEventCount(currentPattern)
                })}
              </span>
              <ArrowDown className="pattern-lab-chevron" size={16} aria-hidden="true" />
            </summary>
            <div className="pattern-lab-content" data-testid="pattern-lab-content">
          <PatternCompareDecision summary={patternCompareDecisionSummary} onRun={runPatternCompareDecision} />
          <PatternCompareStrip
            playbackMode={playbackMode}
            selectedBlockPattern={selectedArrangementBlock?.pattern ?? project.selectedPattern}
            selectedPattern={project.selectedPattern}
            summaries={patternCompareSummaries}
            onCue={cuePatternFromCompare}
            onUse={usePatternInSelectedBlockFromCompare}
          />
          <PatternContrastReadout
            roleMap={patternContrastRoleMapSummary}
            sectionFit={patternContrastSectionFitSummary}
            summary={patternContrastSummary}
            selectedBlockPattern={selectedArrangementBlock?.pattern ?? null}
            onCuePattern={cuePatternFromCompare}
            onCueSectionFitBlock={() => cueArrangementBlock(selectedArrangementIndex)}
            onCueSectionFitPriorityBlock={cueArrangementBlock}
            onUsePattern={usePatternInSelectedBlockFromCompare}
            onUseSectionFitRole={usePatternInSelectedBlockFromCompare}
            sectionFitCueActive={transportLoopScope === "block" && project.arrangement.length > 0}
            sectionFitCueDisabled={isPlaying || project.arrangement.length === 0}
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
          <div className="pattern-tools" aria-label={t("compose.patternToolsAria")}>
            {patternVariationPresetIds.map((preset) => (
              <button
                key={preset}
                data-testid={`pattern-variation-${preset}`}
                data-previewed={patternVariationPreviewPreset === preset ? "true" : "false"}
                type="button"
                title={t("compose.applyVariationTitle", {
                  variation: patternVariationPresetLabel(preset),
                  pattern: project.selectedPattern
                })}
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
                  title={t("compose.copyPatternTitle", { pattern })}
                  onClick={() => copySelectedPattern(pattern)}
                >
                  <Copy size={14} aria-hidden="true" />
                  <span>{t("compose.copyTo", { pattern })}</span>
                </button>
              ))}
            <button
              className="danger"
              data-testid="pattern-clear"
              type="button"
              title={t("compose.clearPatternTitle", { pattern: project.selectedPattern })}
              onClick={clearSelectedPattern}
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>{t("compose.clearPattern", { pattern: project.selectedPattern })}</span>
            </button>
          </div>
          {patternVariationResult && <PatternVariationResultStrip result={patternVariationResult} />}
          <PatternFillSuggestion summary={patternFillSuggestionSummary} />
          <PatternFillPreview preview={patternFillPreviewSummary} />
          <div className="pattern-fill-row" aria-label={t("compose.patternFillsAria")}>
            {patternFillPresetIds.map((preset) => {
              const isClear = preset === "clear_tail";
              return (
                <button
                  className={isClear ? "danger" : ""}
                  key={preset}
                  data-testid={`pattern-fill-${preset}`}
                  data-previewed={patternFillPreviewPreset === preset ? "true" : "false"}
                  type="button"
                  title={t("compose.applyFillTitle", {
                    fill: patternFillPresetLabel(preset),
                    pattern: project.selectedPattern
                  })}
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
            </div>
          </details>
          <p className="drum-grid-keyboard-help" id="drum-grid-keyboard-help">
            {t("compose.drumGridHelp")}
          </p>
          <div
            aria-describedby="drum-grid-keyboard-help"
            aria-label={t("compose.drumSequencerAria")}
            className="step-grid"
            data-testid="drum-step-grid"
            role="group"
          >
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
                        t("compose.velocityDetail", { velocity: velocityPercent }),
                        hasChanceBadge ? t("compose.chanceDetail", { chance: chanceBadgeLabel(probability) }) : "",
                        lane === "hat" && repeat > 1 ? t("compose.repeatDetail", { repeat }) : "",
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
                      aria-label={t("compose.drumStepAria", {
                        lane: drumLabels[lane],
                        step: step + 1,
                        details: ariaDetails ? ` ${ariaDetails}` : ""
                      })}
                      aria-pressed={active}
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
                      onKeyDown={(event) => handleDrumGridKeyDown(event, lane, step)}
                      style={
                        {
                          "--lane-color": laneColor(lane),
                          "--step-velocity": `${Math.round(velocity * 100)}%`
                        } as CSSProperties
                      }
                      tabIndex={
                        drumGridTabStop.lane === lane && drumGridTabStop.step === step ? 0 : -1
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
              <span>{t("compose.swing")}</span>
              <input
                type="range"
                min={0}
                max={0.24}
                step={0.01}
                value={project.swing}
                onChange={(event) => updateProject((current) => ({ ...current, swing: Number(event.target.value) }))}
              />
            </label>
            <div className="swing-feel-row" aria-label={t("compose.swingFeelPadsAria")} data-testid="swing-feel-pads">
              {swingFeelPads.map((pad) => {
                const targetSwing = swingFeelPadSwing(pad, project);
                const selected = normalizeSwingFeelValue(project.swing) === targetSwing;
                const label = swingFeelPadLabel(pad, locale);
                const detail = swingFeelPadDetail(pad, project, locale);
                return (
                  <button
                    aria-pressed={selected}
                    className={selected ? "selected" : ""}
                    data-testid={`swing-feel-${pad.id}`}
                    key={pad.id}
                    onClick={() => applySwingFeelPad(pad.id)}
                    title={t("compose.swingFeelTitle", {
                      label,
                      detail,
                      percent: percentLabel(targetSwing)
                    })}
                    type="button"
                  >
                    <span>{label}</span>
                    <strong>{percentLabel(targetSwing)}</strong>
                    <small>{detail}</small>
                  </button>
                );
              })}
            </div>
            {swingFeelResult && <SwingFeelResultStrip result={swingFeelResult} />}
            <div
              aria-describedby="pattern-groove-help"
              aria-labelledby="pattern-groove-label"
              className="groove-row"
              data-testid="pattern-groove-presets"
            >
              <div className="groove-row-heading">
                <span id="pattern-groove-label">{t("compose.patternGroove")}</span>
                <strong>{t("compose.patternLabel", { pattern: project.selectedPattern })}</strong>
              </div>
              <small id="pattern-groove-help">{t("compose.grooveDetail")}</small>
              <div
                aria-label={t("compose.groovePresetsAria", { pattern: project.selectedPattern })}
                className="groove-actions"
                role="group"
              >
                {drumGroovePresetIds.map((preset) => {
                  const label = localizedDrumGroovePresetLabel(preset);
                  const detail = localizedDrumGroovePresetDetail(preset);
                  const actionLabel =
                    preset === "reset"
                      ? t("compose.resetGrooveAria", { pattern: project.selectedPattern })
                      : t("compose.applyGrooveAria", {
                          label,
                          pattern: project.selectedPattern,
                          detail
                        });
                  return (
                    <button
                      aria-label={actionLabel}
                      data-testid={`groove-preset-${preset}`}
                      key={preset}
                      onClick={() => applySelectedDrumGroove(preset)}
                      title={actionLabel}
                      type="button"
                    >
                      <strong>{label}</strong>
                      <span>{detail}</span>
                    </button>
                  );
                })}
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

        <section
          aria-label={t("compose.notesEditorAria")}
          aria-labelledby="compose-page-tab-notes"
          className="panel piano-panel workspace-page-panel"
          data-workspace-page="notes"
          data-testid="note-editor-panel"
          hidden={activeComposeWorkspacePage !== "notes"}
          id="compose-page-panel-notes"
          ref={notePanelRef}
          role="tabpanel"
          tabIndex={activeComposeWorkspacePage === "notes" ? 0 : -1}
        >
          <PanelTitle
            icon={<KeyboardMusic size={18} />}
            title={t("nav.notes")}
            meta={t("panel.notesMeta", { voice: bassStyleLabel(style.bassStyle) })}
          />
          <details
            className="capture-ideas"
            data-testid="capture-ideas"
            open={captureIdeasOpen}
            onToggle={(event) => setCaptureIdeasOpen(event.currentTarget.open)}
          >
            <summary className="capture-ideas-summary" data-testid="capture-ideas-toggle">
              <span className="capture-ideas-icon" aria-hidden="true">
                <KeyboardMusic size={16} />
              </span>
              <span className="capture-ideas-copy">
                <strong>{t("compose.captureIdeas")}</strong>
                <small>{t("compose.captureIdeasDetail")}</small>
              </span>
              <span className="capture-ideas-context">
                {keyboardCaptureTarget === "bass"
                  ? t("compose.bass", { style: bassStyleLabel(style.bassStyle) })
                  : t("compose.synth")} · {keyboardCaptureEnabled ? t("compose.keysArmed") : t("compose.keysOff")} ·{" "}
                {midiCaptureArmed ? t("compose.midiArmed") : midiCaptureSummary.statusLabel}
              </span>
              <ArrowDown className="capture-ideas-chevron" size={16} aria-hidden="true" />
            </summary>
            <div className="capture-ideas-content" data-testid="capture-ideas-content">
          <KeyboardCapturePanel
            defaults={activeKeyboardCaptureDefaults}
            enabled={keyboardCaptureEnabled}
            keyMap={keyboardCaptureKeyMap}
            nextStep={keyboardCaptureNextStep}
            playheadStep={keyboardCapturePlayheadStep}
            onDefaultsChange={updateKeyboardCaptureDefaults}
            onEnabledChange={updateKeyboardCaptureEnabled}
            onStepModeChange={updateKeyboardCaptureStepMode}
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
            onArmChange={updateMidiCaptureArmed}
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
            </div>
          </details>
          <div className="note-lanes">
            <NoteEditor
              title={t("compose.bass", { style: bassStyleLabel(style.bassStyle) })}
              track="bass"
              notes={currentPattern.bassNotes}
              pitches={bassPitches}
              color="#ff7a4f"
              currentStep={currentEditorStep}
              selectedNote={selectedNote}
              onSelect={selectNoteGridCell}
              onToggle={toggleBassNote}
            />
            <NoteEditor
              title={t("compose.synth")}
              track="melody"
              notes={currentPattern.melodyNotes}
              pitches={melodyPitches}
              color="#8aa8ff"
              currentStep={currentEditorStep}
              selectedNote={selectedNote}
              onSelect={selectNoteGridCell}
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

        <section
          aria-label={t("compose.instrumentPanelAria")}
          aria-labelledby="compose-page-tab-instruments"
          className="panel instrument-panel workspace-page-panel"
          data-workspace-page="instruments"
          data-testid="workflow-target-sound"
          hidden={activeComposeWorkspacePage !== "instruments"}
          id="compose-page-panel-instruments"
          ref={soundPanelRef}
          role="tabpanel"
          tabIndex={activeComposeWorkspacePage === "instruments" ? 0 : -1}
        >
          <PanelTitle
            icon={<Sparkles size={18} />}
            title={t("panel.instruments")}
            meta={project.mode === "guided" ? t("panel.curated") : t("panel.editable")}
          />
          <div className="instrument-direct-chords" data-testid="instrument-direct-chords">
            <ChordEditor
              advancedOpen={harmonyMovesOpen}
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
              onAdvancedOpenChange={setHarmonyMovesOpen}
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
          </div>
          <details
            className="instrument-tools"
            data-testid="sound-design-tools"
            open={soundDesignOpen}
          >
            <summary
              className="instrument-tools-summary"
              data-testid="sound-design-toggle"
              onClick={(event) => {
                event.preventDefault();
                setSoundDesignOpen((open) => !open);
              }}
            >
              <span className="instrument-tools-icon" aria-hidden="true"><SlidersHorizontal size={16} /></span>
              <span className="instrument-tools-copy">
                <strong>{t("compose.soundDesign")}</strong>
                <small>{t("compose.soundDesignDetail")}</small>
              </span>
              <span className="instrument-tools-context">
                {soundPresetLabel(project.sound.preset)} · {soundTimbreCheckSummary.statusLabel} · {project.mode === "studio" ? t("mode.studio") : t("mode.guided")}
              </span>
              <ArrowDown className="instrument-tools-chevron" size={16} aria-hidden="true" />
            </summary>
            <div className="instrument-tools-content" data-testid="sound-design-content">
              <div className="device-list">
                <Device
                  icon={<Drum size={17} />}
                  name={t("compose.drumRack")}
                  value={t("compose.kit", { preset: soundPresetLabel(project.sound.preset) })}
                  color="#78f0c8"
                />
                <Device
                  icon={<Waves size={17} />}
                  name={t("compose.bassEngine")}
                  value={t("compose.bassDeviceValue", {
                    style: bassStyleLabel(style.bassStyle),
                    drive: percentLabel(project.sound.bassDrive),
                    duck: percentLabel(project.sound.sidechainDuck)
                  })}
                  color="#ff7a4f"
                />
                <Device
                  icon={<Music2 size={17} />}
                  name={t("compose.synth")}
                  value={t("compose.synthDeviceValue", {
                    style: style.melodyStyle,
                    bright: percentLabel(project.sound.synthBrightness)
                  })}
                  color="#8aa8ff"
                />
                <Device
                  icon={<SlidersHorizontal size={17} />}
                  name={t("compose.chordTone")}
                  value={t("compose.chordDeviceValue", { warm: percentLabel(project.sound.chordWarmth) })}
                  color="#d58cff"
                />
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
                studioToneBaseline={studioToneBaseline}
                studioToneBaselineResult={studioToneBaselineResult}
                studioToneDrift={studioToneDrift}
                studioToneResetResult={studioToneResetResult}
                timbreCheck={soundTimbreCheckSummary}
                onChange={updateSoundDesign}
                onApplyPreset={applySoundPreset}
                onDrumKitPad={applyDrumKitPad}
                onFocusPad={applySoundFocusPad}
                onCaptureSoundSnapshot={captureSoundSnapshot}
                onRecallSoundSnapshot={recallSoundSnapshot}
                onClearSoundSnapshots={clearSoundSnapshots}
                onCaptureStudioToneBaseline={captureStudioToneBaseline}
                onPreviewPreset={previewSoundPreset}
                onResetLargestStudioToneDrift={resetLargestStudioToneDrift}
                onStudioToneResetResult={setStudioToneResetResult}
              />
            </div>
          </details>
        </section>

        </Activity>
      </section>
      <section
        aria-labelledby="workspace-tab-arrange"
        className="workspace-grid workspace-zone-panel workspace-arrange-panel"
        data-workspace-zone="arrange"
        hidden={activeWorkspaceZone !== "arrange"}
        id="workspace-panel-arrange"
        role="tabpanel"
        tabIndex={activeWorkspaceZone === "arrange" ? 0 : -1}
      >
        <Activity mode={workspaceActivityMode(activeWorkspaceZone === "arrange")} name="workspace-arrange">
        <WorkspacePageTabs
          activePage={activeArrangeWorkspacePage}
          ariaLabel={t("nav.subTabsAria", { title: t("nav.arrange") })}
          idPrefix="arrange"
          items={[
            {
              id: "timeline",
              label: t("nav.timeline"),
              detail: t("nav.timelineDetail"),
              meta: t("nav.timelineMeta"),
              icon: <Music2 size={18} />
            },
            {
              id: "structure",
              label: t("nav.structure"),
              detail: t("nav.structureDetail"),
              meta: t("nav.structureMeta"),
              icon: <ListChecks size={18} />
            }
          ]}
          onSelect={(page) => {
            activateArrangeWorkspacePage(page, true);
            if (page === "structure") {
              setArrangementToolsOpen(true);
            }
          }}
          title={t("nav.arrangeEditor")}
        />
        <section
          aria-labelledby="arrange-page-tab-timeline"
          className="panel arrangement-panel workspace-page-panel"
          data-workspace-page="timeline"
          data-testid="workflow-target-arrange"
          hidden={activeArrangeWorkspacePage !== "timeline"}
          id="arrange-page-panel-timeline"
          ref={arrangePanelRef}
          role="tabpanel"
          tabIndex={activeArrangeWorkspacePage === "timeline" ? 0 : -1}
        >
          <PanelTitle
            icon={<Music2 size={18} />}
            title={t("panel.arrangement")}
            meta={t("panel.arrangementMeta", {
              blocks: project.arrangement.length,
              bars: localizedBarCountLabel(arrangementTotalBars(project))
            })}
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
                  ? t("arrange.editAudibleBlockAria", { block: audibleArrangementFollowBlockNumber })
                  : editingAudibleArrangementBlock
                    ? t("arrange.audibleBlockSynced")
                    : t("arrange.noAudibleBlock")
              }
              className="arrangement-playback-follow-button"
              data-testid="arrangement-playback-follow"
              disabled={!audibleArrangementFollowBlock}
              onClick={followAudibleArrangementBlock}
              title={
                audibleArrangementFollowBlock
                  ? t("arrange.switchToAudibleBlockTitle", { block: audibleArrangementFollowBlockNumber })
                  : editingAudibleArrangementBlock
                    ? t("arrange.audibleBlockSynced")
                    : t("arrange.playToFollowBlockTitle")
              }
              type="button"
            >
              <ArrowRight size={13} aria-hidden="true" />
              <span>
                {audibleArrangementFollowBlock
                  ? t("arrange.editBlock", { block: audibleArrangementFollowBlockNumber })
                  : editingAudibleArrangementBlock
                    ? t("arrange.inSync")
                    : t("arrange.idle")}
              </span>
            </button>
          </div>
          <div className="arrangement-track" data-testid="arrangement-timeline">
            {project.arrangement.map((block, index) => {
              const selected = selectedArrangementIndex === index;
              const playing = playingArrangementIndex === index;
              return (
                <button
                  aria-label={t("arrange.blockAria", {
                    block: index + 1,
                    section: block.section,
                    pattern: block.pattern,
                    bars: localizedBarCountLabel(block.bars)
                  })}
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
                  <small>{localizedBarCountLabel(block.bars)}</small>
                  {block.mutedTracks.length > 0 && <em>{t("arrange.muteCount", { count: block.mutedTracks.length })}</em>}
                  <i style={{ inlineSize: `${Math.max(18, block.energy * 100)}%` }} />
                </button>
              );
            })}
          </div>
          {selectedArrangementBlock && (
            <div
              className="arrangement-editor"
              aria-label={t("arrange.selectedBlockEditorAria")}
              data-testid="selected-block-editor"
            >
              <div className="arrangement-editor-heading">
                <span>{t("arrange.blockNumber", { block: selectedArrangementIndex + 1 })}</span>
                <strong>
                  {selectedArrangementBlock.section} / {t("arrange.pattern")} {selectedArrangementBlock.pattern}
                </strong>
                <small>{localizedBarCountLabel(selectedArrangementBlock.bars)}</small>
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
                <span>{t("arrange.section")}</span>
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
              <div className="arrangement-control-group" data-testid="arrangement-pattern-controls">
                <div className="arrangement-control-group-heading">
                  <span>{t("arrange.pattern")}</span>
                  <small>
                    {selectedArrangementBlock.pattern} · {patternEventCount(project.patterns[selectedArrangementBlock.pattern])}
                  </small>
                </div>
                <div className="block-pattern-row" aria-label={t("arrange.blockPatternAria")}>
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
              </div>
              <div className="arrangement-control-group" data-testid="arrangement-track-state-controls">
                <div className="arrangement-control-group-heading">
                  <span>{t("arrange.trackState")}</span>
                  <small>
                    {selectedArrangementBlock.mutedTracks.length === 0
                      ? t("arrange.allPlaying")
                      : t("arrange.mutedCount", { count: selectedArrangementBlock.mutedTracks.length })}
                  </small>
                </div>
                <div className="arrangement-mute-row" aria-label={t("arrange.blockTrackMutesAria")}>
                  {arrangementMuteTrackIds.map((track) => {
                    const muted = selectedArrangementBlock.mutedTracks.includes(track);
                    return (
                      <button
                        aria-pressed={muted}
                        className={muted ? "selected" : ""}
                        data-testid={`arrangement-track-mute-${track}`}
                        key={track}
                        onClick={() => toggleArrangementTrackMute(track)}
                        title={t("arrange.trackMuteTitle", {
                          action: muted ? t("arrange.unmute") : t("arrange.mute"),
                          track: arrangementMuteTrackLabel(track)
                        })}
                        type="button"
                      >
                        {arrangementMuteTrackLabel(track)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="arrangement-clipboard-row" aria-label={t("arrange.clipboardAria")}>
                <button
                  data-testid="arrangement-copy"
                  onClick={copySelectedArrangementBlock}
                  title={t("arrange.copyBlockTitle")}
                  type="button"
                >
                  <Copy size={14} aria-hidden="true" />
                  <span>{t("arrange.copyBlock")}</span>
                </button>
                <button
                  data-testid="arrangement-paste"
                  disabled={!arrangementBlockClipboard}
                  onClick={pasteArrangementBlockAfterSelected}
                  title={t("arrange.pasteAfterTitle")}
                  type="button"
                >
                  <Plus size={14} aria-hidden="true" />
                  <span>{t("arrange.pasteAfter")}</span>
                </button>
                <small data-testid="arrangement-clipboard-detail">
                  {arrangementBlockClipboard
                    ? t("arrange.clipboardValue", {
                        section: arrangementBlockClipboard.section,
                        pattern: arrangementBlockClipboard.pattern,
                        bars: localizedBarCountLabel(arrangementBlockClipboard.bars)
                      })
                    : t("arrange.clipboardEmpty")}
                </small>
              </div>
              <div className="arrangement-control-group arrangement-shape-controls" data-testid="arrangement-shape-controls">
                <div className="arrangement-control-group-heading">
                  <span>{t("arrange.blockShape")}</span>
                  <small>
                    {t("arrange.shapeSummary", {
                      bars: localizedBarCountLabel(selectedArrangementBlock.bars),
                      energy: Math.round(selectedArrangementBlock.energy * 100),
                      split: canSplitArrangementBlock ? t("arrange.splitReady") : t("arrange.oneBarNoSplit")
                    })}
                  </small>
                </div>
                <label>
                  <span>{t("arrange.bars")}</span>
                  <input
                    aria-label={t("arrange.blockBarsAria")}
                    data-testid="arrangement-bars-input"
                    type="number"
                    min={minArrangementBars}
                    max={selectedArrangementMaximumBars}
                    step={1}
                    value={selectedArrangementBlock.bars}
                    onChange={(event) => {
                      const requestedBars = Number(event.target.value);
                      updateArrangementBlock(
                        selectedArrangementIndex,
                        { bars: requestedBars },
                        requestedBars > selectedArrangementMaximumBars
                          ? `Arrangement is limited to ${maxProjectArrangementBars} bars`
                          : "Unsaved changes"
                      );
                    }}
                  />
                </label>
                <label>
                  <span>{t("arrange.splitAfter")}</span>
                  <input
                    aria-label={t("arrange.splitAfterAria")}
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
                  <span
                    title={t("arrange.gainTitle", {
                      gain: arrangementEnergyGain(selectedArrangementBlock.energy).toFixed(2)
                    })}
                  >
                    {t("arrange.energy", { energy: Math.round(selectedArrangementBlock.energy * 100) })}
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
                      aria-label={t("arrange.energyPercentAria")}
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
              </div>
              <div className="arrangement-actions" aria-label={t("arrange.structureActionsAria")}>
                <button
                  aria-label={t("arrange.moveLeftAria")}
                  data-testid="arrangement-move-left"
                  disabled={selectedArrangementIndex === 0}
                  onClick={() => moveArrangementBlock(-1)}
                  title={t("arrange.moveLeftTitle")}
                  type="button"
                >
                  <ArrowLeft size={15} aria-hidden="true" />
                  <span>{t("arrange.moveLeft")}</span>
                </button>
                <button
                  aria-label={t("arrange.moveRightAria")}
                  data-testid="arrangement-move-right"
                  disabled={selectedArrangementIndex >= project.arrangement.length - 1}
                  onClick={() => moveArrangementBlock(1)}
                  title={t("arrange.moveRightTitle")}
                  type="button"
                >
                  <ArrowRight size={15} aria-hidden="true" />
                  <span>{t("arrange.moveRight")}</span>
                </button>
                <button
                  data-testid="arrangement-duplicate"
                  onClick={duplicateArrangementBlock}
                  title={t("arrange.duplicateTitle")}
                  type="button"
                >
                  <Copy size={15} aria-hidden="true" />
                  <span>{t("arrange.duplicate")}</span>
                </button>
                <button
                  data-testid="arrangement-split"
                  disabled={!canSplitArrangementBlock}
                  onClick={splitArrangementBlock}
                  title={t("arrange.splitTitle")}
                  type="button"
                >
                  <Scissors size={15} aria-hidden="true" />
                  <span>{t("arrange.split")}</span>
                </button>
                <button
                  data-testid="arrangement-merge"
                  disabled={!canMergeArrangementBlock}
                  onClick={mergeArrangementBlock}
                  title={t("arrange.mergeTitle")}
                  type="button"
                >
                  <Plus size={15} aria-hidden="true" />
                  <span>{t("arrange.merge")}</span>
                </button>
                <button
                  data-testid="arrangement-delete"
                  disabled={project.arrangement.length <= 1}
                  onClick={deleteArrangementBlock}
                  title={t("arrange.deleteTitle")}
                  type="button"
                >
                  <Trash2 size={15} aria-hidden="true" />
                  <span>{t("arrange.delete")}</span>
                </button>
              </div>
              {selectedBlockEditResult?.blockIndex === selectedArrangementIndex && (
                <SelectedBlockEditResultStrip result={selectedBlockEditResult} />
              )}
              <details className="block-moves" data-testid="block-moves" open={blockMovesOpen}>
                <summary
                  className="block-moves-summary"
                  data-testid="block-moves-toggle"
                  onClick={(event) => {
                    event.preventDefault();
                    setBlockMovesOpen((open) => !open);
                  }}
                >
                  <span className="block-moves-copy">
                    <strong>{t("arrange.blockMoves")}</strong>
                    <small>{t("arrange.blockMovesDetail")}</small>
                  </span>
                  <span className="block-moves-context">
                    {t("arrange.blockMovesContext", {
                      block: selectedArrangementIndex + 1,
                      section: selectedArrangementBlock.section,
                      pattern: selectedArrangementBlock.pattern
                    })}
                  </span>
                  <ArrowDown className="block-moves-chevron" size={16} aria-hidden="true" />
                </summary>
                <div className="block-moves-content" data-testid="block-moves-content">
                  <ArrangementMovePreviewDecision
                    summary={createArrangementMovePreviewDecision(arrangementMovePrioritySummary)}
                    onApply={() => {
                      if (arrangementMovePrioritySummary.presetId !== "none") {
                        applyArrangementMoveToSelected(arrangementMovePrioritySummary.presetId);
                      }
                    }}
                  />
                  <ArrangementMovePriorityReadout summary={arrangementMovePrioritySummary} onApply={applyArrangementMoveToSelected} />
                  <div className="arrangement-move-row" aria-label={t("arrange.movesAria")}>
                    {arrangementMovePresetIds.map((preset) => (
                      <button
                        data-testid={`arrangement-move-${preset}`}
                        key={preset}
                        onClick={() => applyArrangementMoveToSelected(preset)}
                        title={t("arrange.applyMoveTitle", { move: arrangementMovePresetLabel(preset) })}
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
                </div>
              </details>
            </div>
          )}
        </section>
        <section
          aria-labelledby="arrange-page-tab-structure"
          className="panel arrangement-panel workspace-page-panel"
          data-workspace-page="structure"
          data-testid="arrange-structure-page"
          hidden={activeArrangeWorkspacePage !== "structure"}
          id="arrange-page-panel-structure"
          ref={arrangeStructurePanelRef}
          role="tabpanel"
          tabIndex={activeArrangeWorkspacePage === "structure" ? 0 : -1}
        >
          <PanelTitle
            icon={<ListChecks size={18} />}
            title={t("panel.structure")}
            meta={t("panel.arrangementMeta", {
              blocks: project.arrangement.length,
              bars: localizedBarCountLabel(arrangementTotalBars(project))
            })}
          />
          <details className="arrangement-tools" data-testid="arrangement-tools" open={arrangementToolsOpen}>
            <summary
              className="arrangement-tools-summary"
              data-testid="arrangement-tools-toggle"
              onClick={(event) => {
                event.preventDefault();
                setArrangementToolsOpen((open) => !open);
              }}
            >
              <span className="arrangement-tools-copy">
                <strong>{t("arrange.tools")}</strong>
                <small>{t("arrange.toolsDetail")}</small>
              </span>
              <span className="arrangement-tools-context">
                {t("arrange.toolsContext", {
                  blocks: project.arrangement.length,
                  bars: localizedBarCountLabel(arrangementTotalBars(project)),
                  mode: project.mode === "studio" ? t("mode.studio") : t("mode.guided")
                })}
              </span>
              <ArrowDown className="arrangement-tools-chevron" size={16} aria-hidden="true" />
            </summary>
            <div className="arrangement-tools-content" data-testid="arrangement-tools-content">
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
              <div className="pattern-chain-row" aria-label={t("arrange.patternChainAria")}>
                <PatternChainPreview preview={patternChainPreviewSummary} />
                <PatternChainPreviewDecision
                  summary={createPatternChainPreviewDecision(patternChainPreviewSummary)}
                  onRun={runPatternChainPriorityAction}
                />
                <PatternChainPriorityReadout summary={patternChainPrioritySummary} onRun={runPatternChainPriorityAction} />
                <div className="pattern-chain-heading">
                  <span>{t("arrange.chain")}</span>
                  <strong data-testid="pattern-chain-current">{patternChainReadout(project.arrangement)}</strong>
                </div>
                <button
                  className="pattern-chain-expand"
                  data-testid="pattern-chain-expand"
                  onClick={expandPatternChain}
                  title={t("arrange.expandChainTitle")}
                  type="button"
                >
                  <ArrowRight size={14} aria-hidden="true" />
                  <span>{t("arrange.expand")}</span>
                  <small>{t("arrange.songForm", { bars: localizedBarCountLabel(16) })}</small>
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
                        title={t("arrange.applyChainTitle", { chain: patternChainLabel(chain) })}
                        type="button"
                      >
                        <ArrowRight size={14} aria-hidden="true" />
                        <span>{patternChainLabel(chain)}</span>
                        <small>{patternChainReadout(chainBlocks)} / {localizedBarCountLabel(chainBars)}</small>
                      </button>
                    );
                  })}
                </div>
                <div
                  className="pattern-chain-editor"
                  aria-label={t("arrange.chainEditorAria")}
                  data-testid="pattern-chain-step-editor"
                >
                  {project.arrangement.slice(0, 8).map((block, index) => {
                    const nextPattern = nextPatternSlot(block.pattern);
                    return (
                      <button
                        aria-label={t("arrange.chainStepAria", {
                          step: index + 1,
                          section: block.section,
                          pattern: block.pattern,
                          bars: localizedBarCountLabel(block.bars),
                          nextPattern
                        })}
                        className={selectedArrangementIndex === index ? "selected" : ""}
                        data-testid={`pattern-chain-step-${index}`}
                        key={`${block.section}-${index}-${block.pattern}`}
                        onClick={() => cyclePatternChainStep(index)}
                        title={t("arrange.switchStepTitle", { step: index + 1, pattern: nextPattern })}
                        type="button"
                      >
                        <span>{t("arrange.step", { step: index + 1 })}</span>
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
                routeRef={arrangementMuteMapPanelRef}
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
            </div>
          </details>
        </section>

        </Activity>
      </section>
      <section
        aria-labelledby="workspace-tab-mix"
        className="workspace-grid workspace-zone-panel workspace-mix-panel"
        data-workspace-zone="mix"
        hidden={activeWorkspaceZone !== "mix"}
        id="workspace-panel-mix"
        role="tabpanel"
        tabIndex={activeWorkspaceZone === "mix" ? 0 : -1}
      >
        <Activity mode={workspaceActivityMode(activeWorkspaceZone === "mix")} name="workspace-mix">
        <WorkspacePageTabs
          activePage={activeMixWorkspacePage}
          ariaLabel={t("nav.subTabsAria", { title: t("nav.mix") })}
          idPrefix="mix"
          items={[
            {
              id: "mixer",
              label: t("nav.mixer"),
              detail: t("nav.mixerDetail"),
              meta: t("nav.audibleChannels", { count: activeChannels }),
              icon: <SlidersHorizontal size={18} />
            },
            {
              id: "master",
              label: t("nav.master"),
              detail: t("nav.masterDetail"),
              meta: project.masterPreset,
              icon: <Gauge size={18} />
            }
          ]}
          onSelect={(page) => activateMixWorkspacePage(page, true)}
          title={t("nav.mixEditor")}
        />
        <section
          aria-label={t("mix.mixerAria")}
          aria-labelledby="mix-page-tab-mixer"
          className="panel mixer-panel workspace-page-panel"
          data-workspace-page="mixer"
          data-testid="workflow-target-mix"
          hidden={activeMixWorkspacePage !== "mixer"}
          id="mix-page-panel-mixer"
          ref={mixPanelRef}
          role="tabpanel"
          tabIndex={activeMixWorkspacePage === "mixer" ? 0 : -1}
        >
          <PanelTitle
            icon={<SlidersHorizontal size={18} />}
            title={t("nav.mixer")}
            meta={t("panel.mixerMeta", { count: activeChannels })}
          />
          {!exactProjectAudioAnalysisReady && (
            <ProjectAudioAnalysisGate
              onRetry={retryCurrentProjectAudioAnalysis}
              status={projectAudioAnalysis.status}
              surface="Mix"
            />
          )}
          <div className="mixer-strips" data-testid="mixer-channel-strips">
            {project.mixer.map((channel) => {
              const roleSummary = mixerChannelRoleSummary(channel, locale);
              return (
                <div
                  className="strip"
                  data-testid={`mixer-strip-${channel.id}`}
                  key={channel.id}
                  style={{ "--strip": channel.accent } as CSSProperties}
                >
                <div className="strip-top">
                  <span>{channel.name}</span>
                  <div
                    aria-label={t("mix.channelTogglesAria", { channel: channel.name })}
                    className="strip-toggles"
                    data-testid={`mixer-toggles-${channel.id}`}
                    role="group"
                  >
                    <button
                      aria-label={t("mix.muteAria", { channel: channel.name })}
                      aria-pressed={channel.muted}
                      className={channel.muted ? "mini-toggle active" : "mini-toggle"}
                      data-testid={`mixer-mute-${channel.id}`}
                      type="button"
                      onClick={() => updateMixerChannel(channel.id, { muted: !channel.muted })}
                      title={channel.muted
                        ? t("mix.unmuteTitle", { channel: channel.name })
                        : t("mix.muteTitle", { channel: channel.name })}
                    >
                      <span>{t("mix.mute")}</span>
                    </button>
                    <button
                      aria-label={t("mix.soloAria", { channel: channel.name })}
                      aria-pressed={channel.solo}
                      className={channel.solo ? "mini-toggle active solo" : "mini-toggle"}
                      data-testid={`mixer-solo-${channel.id}`}
                      disabled={channel.id === "master"}
                      type="button"
                      onClick={() => updateMixerChannel(channel.id, { solo: !channel.solo })}
                      title={
                        channel.id === "master"
                          ? t("mix.soloUnavailableTitle")
                          : channel.solo
                            ? t("mix.stopSoloTitle", { channel: channel.name })
                            : t("mix.soloTitle", { channel: channel.name })
                      }
                    >
                      <span>{t("mix.solo")}</span>
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
                  <span>{t("mix.volume")}</span>
                  <input
                    aria-label={t("mix.channelVolumeAria", { channel: channel.name })}
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
                  <span>{t("mix.pan")}</span>
                  <div className="pan-inputs">
                    <input
                      aria-label={t("mix.channelPanAria", { channel: channel.name })}
                      data-testid={`mixer-pan-${channel.id}`}
                      max={100}
                      min={-100}
                      onChange={(event) => updateMixerChannel(channel.id, { pan: clampPan(Number(event.target.value)) })}
                      step={1}
                      type="range"
                      value={channel.pan}
                    />
                    <input
                      aria-label={t("mix.channelPanValueAria", { channel: channel.name })}
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
                {exactProjectAudioAnalysisReady && isStemTrackId(channel.id) && (
                  <StemLevelMeter analysis={stemAnalyses[channel.id]} trackId={channel.id} />
                )}
                {channel.id !== "master" && (
                  <details
                    className="mixer-processing"
                    data-testid={`mixer-processing-${channel.id}`}
                    open={channelProcessingOpen[channel.id] === true}
                  >
                    <summary
                      className="mixer-processing-summary"
                      data-testid={`mixer-processing-toggle-${channel.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        setChannelProcessingOpen((current) => ({ ...current, [channel.id]: current[channel.id] !== true }));
                      }}
                    >
                      <span>
                        <strong>{t("mix.toneSpace")}</strong>
                        <small>
                          {t("mix.toneSpaceSummary", {
                            cut: percentLabel(channel.lowCut),
                            drive: percentLabel(channel.drive),
                            space: percentLabel(channel.send)
                          })}
                        </small>
                      </span>
                      <ArrowDown className="mixer-processing-chevron" size={14} aria-hidden="true" />
                    </summary>
                    <div className="mixer-processing-content">
                      <div className="eq-controls" aria-label={t("mix.channelEqAria", { channel: channel.name })}>
                    <label className="strip-control">
                      <span>{t("mix.lowCut")}</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={t("mix.channelLowCutAria", { channel: channel.name })}
                          data-testid={`mixer-low-cut-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { lowCut: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.lowCut}
                        />
                        <input
                          aria-label={t("mix.channelLowCutPercentAria", { channel: channel.name })}
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
                      <span>{t("mix.air")}</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={t("mix.channelAirAria", { channel: channel.name })}
                          data-testid={`mixer-air-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { air: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.air}
                        />
                        <input
                          aria-label={t("mix.channelAirPercentAria", { channel: channel.name })}
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
                      <span>{t("mix.drive")}</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={t("mix.channelDriveAria", { channel: channel.name })}
                          data-testid={`mixer-drive-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { drive: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.drive}
                        />
                        <input
                          aria-label={t("mix.channelDrivePercentAria", { channel: channel.name })}
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
                      <span>{t("mix.glue")}</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={t("mix.channelGlueAria", { channel: channel.name })}
                          data-testid={`mixer-glue-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { glue: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.glue}
                        />
                        <input
                          aria-label={t("mix.channelGluePercentAria", { channel: channel.name })}
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
                      <span>{t("mix.space")}</span>
                      <div className="eq-inputs">
                        <input
                          aria-label={t("mix.channelSpaceAria", { channel: channel.name })}
                          data-testid={`mixer-send-${channel.id}`}
                          max={1}
                          min={0}
                          onChange={(event) => updateMixerChannel(channel.id, { send: Number(event.target.value) })}
                          step={0.01}
                          type="range"
                          value={channel.send}
                        />
                        <input
                          aria-label={t("mix.channelSpacePercentAria", { channel: channel.name })}
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
                    </div>
                  </details>
                )}
                <div className="strip-readout">
                  <span>{channel.volumeDb} dB</span>
                  <span>{panLabel(channel.pan)}</span>
                  {channel.id !== "master" && (
                    <>
                      <span>{t("mix.cut")} {percentLabel(channel.lowCut)}</span>
                      <span>{t("mix.air")} {percentLabel(channel.air)}</span>
                      <span>{t("mix.drive")} {percentLabel(channel.drive)}</span>
                      <span>{t("mix.glue")} {percentLabel(channel.glue)}</span>
                      <span>{t("mix.space")} {percentLabel(channel.send)}</span>
                    </>
                  )}
                </div>
                </div>
              );
            })}
          </div>
          <details className="mix-moves" data-testid="mix-moves" open={mixMovesOpen}>
            <summary
              className="mix-tools-summary"
              data-testid="mix-moves-toggle"
              onClick={(event) => {
                event.preventDefault();
                setMixMovesOpen((open) => !open);
              }}
            >
              <span className="mix-tools-copy">
                <strong>{t("mix.moves")}</strong>
                <small>{t("mix.movesDetail")}</small>
              </span>
              <span className="mix-tools-context">
                {mixBalancePreviewSummary.statusLabel} · {spaceFxPreviewSummary.statusLabel} · {project.mode === "studio" ? t("mode.studio") : t("mode.guided")}
              </span>
              <ArrowDown className="mix-tools-chevron" size={16} aria-hidden="true" />
            </summary>
            <div className="mix-tools-content" data-testid="mix-moves-content">
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
            </div>
          </details>
          <details className="mix-review-tools" data-testid="mix-review-tools" open={mixReviewOpen}>
            <summary
              className="mix-tools-summary"
              data-testid="mix-review-toggle"
              onClick={(event) => {
                event.preventDefault();
                setMixReviewOpen((open) => !open);
              }}
            >
              <span className="mix-tools-copy">
                <strong>{t("mix.auditionCompare")}</strong>
                <small>{t("mix.auditionCompareDetail")}</small>
              </span>
              <span className="mix-tools-context">
                {stemAuditionReadout.statusLabel} · {mixSnapshotStatusLabel} · {project.mode === "studio" ? t("mode.studio") : t("mode.guided")}
              </span>
              <ArrowDown className="mix-tools-chevron" size={16} aria-hidden="true" />
            </summary>
            <div className="mix-tools-content" data-testid="mix-review-content">
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
              {exactProjectAudioAnalysisReady && (
                <MixSnapshotAB
                  snapshots={mixSnapshots}
                  summary={mixSnapshotComparison}
                  onCapture={captureMixSnapshot}
                  onRecall={recallMixSnapshot}
                  onClear={clearMixSnapshots}
                />
              )}
            </div>
          </details>
        </section>

        <section
          aria-label={t("master.aria")}
          aria-labelledby="mix-page-tab-master"
          className="panel master-panel workspace-page-panel"
          data-workspace-page="master"
          data-testid="workflow-target-master"
          hidden={activeMixWorkspacePage !== "master"}
          id="mix-page-panel-master"
          ref={masterPanelRef}
          role="tabpanel"
          tabIndex={activeMixWorkspacePage === "master" ? 0 : -1}
        >
          <PanelTitle
            icon={<Gauge size={18} />}
            title={t("panel.master")}
            meta={
              exactProjectAudioAnalysisReady
                ? t("analysis.ready")
                : projectAudioAnalysis.status === "pending"
                  ? t("analysis.updating")
                  : t("analysis.unavailable")
            }
          />
          <div className="master-readout">
            <strong>{project.masterPreset}</strong>
            <span>{project.masterCeilingDb} dB {t("master.ceiling")}</span>
          </div>
          {exactProjectAudioAnalysisReady ? (
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
          ) : (
            <ProjectAudioAnalysisGate
              onRetry={retryCurrentProjectAudioAnalysis}
              status={projectAudioAnalysis.status}
              surface="Master"
            />
          )}
          <div className="master-output-controls" data-testid="master-output-controls">
            <div className="master-ceiling-control">
              <label>
                <span>{t("master.limiterCeiling")}</span>
                <strong>{project.masterCeilingDb.toFixed(1)} dB</strong>
              </label>
              <div className="master-ceiling-inputs">
                <input
                  aria-label={t("master.limiterCeilingAria")}
                  data-testid="master-ceiling"
                  type="range"
                  min={-6}
                  max={0}
                  step={0.1}
                  value={masterCeilingDraft}
                  onBlur={commitMasterCeilingDraft}
                  onChange={(event) => setMasterCeilingDraft(event.target.value)}
                  onFocus={() => setMasterCeilingEditing(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.currentTarget.blur();
                    }
                  }}
                />
                <input
                  aria-label={t("master.limiterCeilingDbAria")}
                  data-testid="master-ceiling-input"
                  type="number"
                  min={-6}
                  max={0}
                  step={0.1}
                  value={project.masterCeilingDb}
                  onChange={(event) => updateMasterCeilingDb(Number(event.target.value))}
                />
              </div>
              <small>{t("master.headroomHint")}</small>
            </div>
            <div className="master-preset-control">
              <span>{t("master.outputPreset")}</span>
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
            </div>
          </div>
          <details className="master-polish-tools" data-testid="master-polish-tools" open={masterPolishOpen}>
            <summary
              className="master-tools-summary"
              data-testid="master-polish-toggle"
              onClick={(event) => {
                event.preventDefault();
                setMasterPolishOpen((open) => !open);
              }}
            >
              <span className="master-tools-copy">
                <strong>{t("master.polishAutomation")}</strong>
                <small>{t("master.polishAutomationDetail")}</small>
              </span>
              <span className="master-tools-context">
                {masterFinishPreviewSummary.statusLabel} · {masterAutomationPreviewSummary.statusLabel} · {project.mode === "studio" ? t("mode.studio") : t("mode.guided")}
              </span>
              <ArrowDown className="master-tools-chevron" size={16} aria-hidden="true" />
            </summary>
            <div className="master-tools-content" data-testid="master-polish-content">
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
            </div>
          </details>
          <details className="master-review-tools" data-testid="master-review-tools" open={masterReviewOpen}>
            <summary
              className="master-tools-summary"
              data-testid="master-review-toggle"
              onClick={(event) => {
                event.preventDefault();
                setMasterReviewOpen((open) => !open);
              }}
            >
              <span className="master-tools-copy">
                <strong>{t("master.reviewExport")}</strong>
                <small>{t("master.reviewExportDetail")}</small>
              </span>
              <span className="master-tools-context">
                {exactProjectAudioAnalysisReady
                  ? `${finishChecklistSummary.headline} · ${exportAnalysis.status}`
                  : projectAudioAnalysis.status === "pending"
                    ? t("master.analyzingDeferred")
                    : t("master.metersUnavailableDeferred")} · {project.mode === "studio" ? t("mode.studio") : t("mode.guided")}
              </span>
              <ArrowDown className="master-tools-chevron" size={16} aria-hidden="true" />
            </summary>
            <div className="master-tools-content" data-testid="master-review-content">
              {exactProjectAudioAnalysisReady ? (
                <>
              <FinishChecklist
                summary={finishChecklistSummary}
                focusedCardId={finishChecklistFocusId}
                result={finishChecklistResult}
                sectionRef={finishChecklistPanelRef}
                onFocus={focusFinishChecklistCard}
              />
              <details className="master-diagnostic-tools" data-testid="master-review-queue-tools" open={masterReviewQueueOpen}>
                <summary
                  className="master-diagnostic-summary"
                  data-testid="master-review-queue-toggle"
                  onClick={(event) => {
                    event.preventDefault();
                    setMasterReviewQueueOpen((open) => !open);
                  }}
                >
                  <span className="master-diagnostic-copy">
                    <strong>{t("master.reviewQueue")}</strong>
                    <small>{t("master.reviewQueueDetail")}</small>
                  </span>
                  <span className="master-diagnostic-context">{reviewQueueSummary.headline}</span>
                  <ArrowDown className="master-diagnostic-chevron" size={15} aria-hidden="true" />
                </summary>
                <div className="master-diagnostic-content" data-testid="master-review-queue-content">
                  <ReviewQueue
                    analysis={exportAnalysis}
                    analysisPending={projectAudioAnalysis.pending}
                    summary={reviewQueueSummary}
                    focusedItemId={reviewQueueFocusId}
                    result={reviewQueueResult}
                    fixResult={reviewFixResult}
                    project={project}
                    sectionRef={reviewQueuePanelRef}
                    onFix={applyReviewFix}
                    onFocus={focusReviewQueueItem}
                  />
                </div>
              </details>
              <ExportMeter analysis={exportAnalysis} />
              <details className="master-diagnostic-tools" data-testid="master-mix-coach-tools" open={masterMixCoachOpen}>
                <summary
                  className="master-diagnostic-summary"
                  data-testid="master-mix-coach-toggle"
                  onClick={(event) => {
                    event.preventDefault();
                    setMasterMixCoachOpen((open) => !open);
                  }}
                >
                  <span className="master-diagnostic-copy">
                    <strong>{t("master.mixCoach")}</strong>
                    <small>{t("master.mixCoachDetail")}</small>
                  </span>
                  <span className="master-diagnostic-context">{mixCoachSummary(mixCoachChecks)}</span>
                  <ArrowDown className="master-diagnostic-chevron" size={15} aria-hidden="true" />
                </summary>
                <div className="master-diagnostic-content" data-testid="master-mix-coach-content">
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
                </div>
              </details>
                </>
              ) : (
                <ProjectAudioAnalysisGate
                  onRetry={retryCurrentProjectAudioAnalysis}
                  status={projectAudioAnalysis.status}
                  surface="Master"
                />
              )}
            </div>
          </details>
        </section>
        </Activity>
      </section>

      <section
        aria-labelledby="workspace-tab-deliver"
        className="workspace-zone-panel workspace-deliver-panel"
        data-workspace-zone="deliver"
        hidden={activeWorkspaceZone !== "deliver"}
        id="workspace-panel-deliver"
        role="tabpanel"
        tabIndex={activeWorkspaceZone === "deliver" ? 0 : -1}
      >
      <Activity mode={workspaceActivityMode(activeWorkspaceZone === "deliver")} name="workspace-deliver">
      <WorkspacePageTabs
        activePage={activeDeliverWorkspacePage}
        ariaLabel={t("nav.subTabsAria", { title: t("nav.deliver") })}
        idPrefix="deliver"
        items={[
          {
            id: "exports",
            label: t("nav.deliverExports"),
            detail: t("nav.deliverExportsDetail"),
            meta: t("nav.deliverExportsMeta"),
            icon: <Download size={18} />
          },
          {
            id: "checks",
            label: t("nav.deliverChecks"),
            detail: t("nav.deliverChecksDetail"),
            meta: t("nav.deliverChecksMeta"),
            icon: <PackageCheck size={18} />
          }
        ]}
        onSelect={(page) => activateDeliverWorkspacePage(page, true)}
        title={t("nav.deliverEditor")}
      />
      {exactProjectAudioAnalysisReady ? (
        <HandoffPack
          activePage={activeDeliverWorkspacePage}
          analysis={exportAnalysis}
          auditOpen={deliveryAuditOpen}
          exportReceipt={currentHandoffExportReceipt}
          exportFormatResult={handoffExportFormatResult}
          focusedExportFormatId={handoffExportFormatFocusId}
          focusedPackageCheckId={handoffPackageCheckFocusId}
          packageCheckSummary={handoffPackageCheckSummary}
          packageCheckResult={handoffPackageCheckResult}
          project={project}
          isWavPreviewing={isMixPreviewing}
          sectionRef={deliverPanelRef}
          statusOpen={deliveryStatusOpen}
          stemAnalyses={stemAnalyses}
          onExportDeliveryBundle={handleExportDeliveryBundle}
          onExportHandoffSheet={handleExportHandoffSheet}
          onExportMidi={handleExportMidi}
          onExportStems={handleExportStems}
          onExportWav={handleExportWav}
          onToggleWavPreview={toggleMixPreview}
          onFocusExportFormat={focusHandoffExportFormatMetric}
          onFocusPackageCheck={focusHandoffPackageCheckCard}
          onToggleAudit={() => setDeliveryAuditOpen((open) => !open)}
          onToggleStatus={() => setDeliveryStatusOpen((open) => !open)}
        />
      ) : (
        <>
          {(["exports", "checks"] as const).map((page) => (
            <section
              aria-labelledby={`deliver-page-tab-${page}`}
              className="panel handoff-pack workspace-page-panel"
              data-testid={page === "exports" ? "workflow-target-deliver" : "handoff-pack-checks"}
              data-workspace-page={page}
              hidden={activeDeliverWorkspacePage !== page}
              id={`deliver-page-panel-${page}`}
              key={page}
              ref={activeDeliverWorkspacePage === page ? deliverPanelRef : undefined}
              role="tabpanel"
              tabIndex={activeDeliverWorkspacePage === page ? 0 : -1}
            >
              <PanelTitle
                icon={page === "exports" ? <Download size={18} /> : <PackageCheck size={18} />}
                title={page === "exports" ? t("nav.deliverExports") : t("nav.deliverChecks")}
                meta={t("panel.exactMetersRequired")}
              />
              <ProjectAudioAnalysisGate
                onRetry={retryCurrentProjectAudioAnalysis}
                status={projectAudioAnalysis.status}
                surface="Deliver"
              />
            </section>
          ))}
        </>
      )}
      </Activity>
      </section>
      </div>
    </main>
  );
}
