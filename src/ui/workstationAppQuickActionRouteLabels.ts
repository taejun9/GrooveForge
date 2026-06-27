import type { MixerChannel, SoundDesign } from "../domain/workstation";
import type {
  BeatPassportMetric,
  BeatReadinessCheck,
  ComposerGuideCard,
  ComposerGuideSummary,
  DrumKitPadOption,
  ExportPreflightFocusItem,
  FinishChecklistCard,
  GrooveCompassCard,
  GrooveCompassSummary,
  HookReadinessCard,
  HookReadinessSummary,
  KeyCompassCard,
  KeyCompassSummary,
  ListeningPassItem,
  MasterAutomationPadId,
  MasterFinishPadId,
  MixSnapshotComparisonSummary,
  ProductionSnapshotMetric,
  ReferenceAlignmentCard,
  ReferenceAlignmentSummary,
  ReviewQueueItem,
  SessionPassCard,
  SessionPassSummary,
  SoundFocusParameter,
  StemAuditionPadOption,
  ToplineSpaceCard,
  ToplineSpaceSummary,
  WorkflowNavigatorItem,
  WorkflowSpotlightSummary
} from "./workstationUiModel";
import { mixBalanceChannelPosture, spaceFxTrackPosture } from "./workstationAppDerivations";

export function masterFinishRouteLabel(targetId: MasterFinishPadId): string {
  switch (targetId) {
    case "demo":
      return "Demo finish route";
    case "vocal":
      return "Vocal finish route";
    case "store":
      return "Store finish route";
    case "club":
      return "Club finish route";
  }
}

export function masterAutomationRouteLabel(targetId: MasterAutomationPadId): string {
  switch (targetId) {
    case "none":
      return "No fade automation route";
    case "fade_in":
      return "Fade-in automation route";
    case "fade_out":
      return "Fade-out automation route";
    case "intro_outro":
      return "Intro/outro automation route";
  }
}

export function mixSnapshotRouteLabel(targetId: MixSnapshotComparisonSummary["decisionActionId"]): string {
  switch (targetId) {
    case "capture-a":
      return "Capture A route";
    case "capture-b":
      return "Capture B route";
    case "recall-a":
      return "Recall A route";
    case "recall-b":
      return "Recall B route";
  }
}

export function referenceAlignmentRouteLabel(card: ReferenceAlignmentCard, summary: ReferenceAlignmentSummary): string {
  const routeIndex = summary.cards.findIndex((candidate) => candidate.id === card.id);
  const routePosition = routeIndex >= 0 ? `${routeIndex + 1}/${summary.cards.length}` : `1/${summary.cards.length}`;
  return `${card.label} ${routePosition} to ${referenceAlignmentDestinationLabel(card)}`;
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

export function beatReadinessRouteLabel(check: BeatReadinessCheck): string {
  switch (check.id) {
    case "drums":
      return "Drums route";
    case "bass":
      return "808/bass route";
    case "harmony":
      return "Melody/chords route";
    case "arrangement":
      return "Arrangement route";
    case "export":
      return "Export route";
  }
}

export function hookReadinessRouteLabel(card: HookReadinessCard, summary: HookReadinessSummary): string {
  const routeIndex = summary.cards.findIndex((candidate) => candidate.id === card.id);
  const routePosition = routeIndex >= 0 ? `${routeIndex + 1}/${summary.cards.length}` : `1/${summary.cards.length}`;
  return `${card.label} ${routePosition} to ${hookReadinessDestinationLabel(card)}`;
}

export function hookReadinessDestinationLabel(card: HookReadinessCard): string {
  if (card.id === "handoff") {
    return "Deliver panel / Session Brief";
  }
  return `${card.focusLabel} panel`;
}

export function toplineSpaceRouteLabel(card: ToplineSpaceCard, summary: ToplineSpaceSummary): string {
  const routeIndex = summary.cards.findIndex((candidate) => candidate.id === card.id);
  const routePosition = routeIndex >= 0 ? `${routeIndex + 1}/${summary.cards.length}` : `1/${summary.cards.length}`;
  return `${card.label} ${routePosition} to ${toplineSpaceDestinationLabel(card)}`;
}

export function toplineSpaceDestinationLabel(card: ToplineSpaceCard): string {
  if (card.id === "brief") {
    return "Deliver panel / Session Brief";
  }
  return `${card.focusLabel} panel`;
}

export function listeningPassRouteLabel(item: ListeningPassItem): string {
  switch (item.id) {
    case "composition":
      return "Composition route";
    case "arrangement":
      return "Arrangement route";
    case "mix":
      return "Mix route";
    case "delivery":
      return "Delivery route";
  }
}

export function beatPassportRouteLabel(metric: BeatPassportMetric): string {
  switch (metric.id) {
    case "target":
      return "Target route";
    case "length":
      return "Length route";
    case "patterns":
      return "Pattern A/B/C route";
    case "readiness":
      return "Readiness route";
    case "export":
      return "Export route";
    case "stems":
      return "Stems route";
    case "master":
      return "Master route";
  }
}

export function productionSnapshotRouteLabel(metric: ProductionSnapshotMetric): string {
  switch (metric.id) {
    case "target":
      return "Target route";
    case "form":
      return "Form route";
    case "patterns":
      return "Pattern A/B/C route";
    case "mix":
      return "Mix route";
    case "handoff":
      return "Handoff route";
  }
}

export function finishChecklistRouteLabel(card: FinishChecklistCard): string {
  switch (card.id) {
    case "compose":
      return "Compose route";
    case "arrange":
      return "Arrange route";
    case "mix":
      return "Mix route";
    case "master":
      return "Master route";
    case "automation":
      return "Master Automation route";
    case "handoff":
      return "Handoff route";
  }
}

export function reviewQueueRouteLabel(item: ReviewQueueItem): string {
  return `${item.focusLabel} route`;
}

export function exportPreflightRouteLabel(card: ExportPreflightFocusItem): string {
  switch (card.focusId) {
    case "readiness":
      return "Readiness route";
    case "mix":
      return "Mix/master route";
    case "automation":
      return "Master Automation route";
    case "deliverables":
      return "Deliverables route";
    case "handoff":
      return "Handoff route";
  }
}

export function sessionPassRouteLabel(card: SessionPassCard, summary: SessionPassSummary): string {
  const routeIndex = summary.cards.findIndex((candidate) => candidate.id === card.id);
  const routePosition = routeIndex >= 0 ? `${routeIndex + 1}/${summary.cards.length}` : `1/${summary.cards.length}`;
  return `${card.label} ${routePosition} to ${card.focusLabel}`;
}

export function composerGuideRouteLabel(card: ComposerGuideCard, summary: ComposerGuideSummary): string {
  const routeIndex = summary.cards.findIndex((candidate) => candidate.id === card.id);
  const routePosition = routeIndex >= 0 ? `${routeIndex + 1}/${summary.cards.length}` : `1/${summary.cards.length}`;
  return `${card.label} ${routePosition} to ${card.focusLabel}`;
}

export function keyCompassRouteLabel(item: KeyCompassCard, summary: KeyCompassSummary): string {
  const routeIndex = summary.cards.findIndex((candidate) => candidate.id === item.id);
  const routePosition = routeIndex >= 0 ? `${routeIndex + 1}/${summary.cards.length}` : `1/${summary.cards.length}`;
  return `${item.label} ${routePosition} to ${item.focusLabel}`;
}

export function grooveCompassRouteLabel(item: GrooveCompassCard, summary: GrooveCompassSummary): string {
  const routeIndex = summary.cards.findIndex((candidate) => candidate.id === item.id);
  const routePosition = routeIndex >= 0 ? `${routeIndex + 1}/${summary.cards.length}` : `1/${summary.cards.length}`;
  return `${item.label} ${routePosition} to ${item.focusLabel}`;
}

export function workflowNavigatorRouteLabel(item: WorkflowNavigatorItem, items: WorkflowNavigatorItem[]): string {
  const routeIndex = items.findIndex((candidate) => candidate.id === item.id);
  const routePosition = routeIndex >= 0 ? `${routeIndex + 1}/${items.length}` : `1/${items.length}`;
  return `${item.label} ${routePosition} to ${workflowNavigatorDestinationLabel(item)}`;
}

export function workflowNavigatorDestinationLabel(item: WorkflowNavigatorItem): string {
  return `${item.label} zone`;
}

export function workflowSpotlightRouteLabel(
  spotlight: WorkflowSpotlightSummary,
  item: WorkflowNavigatorItem,
  items: WorkflowNavigatorItem[]
): string {
  const routeIndex = items.findIndex((candidate) => candidate.id === item.id);
  const routePosition = routeIndex >= 0 ? `${routeIndex + 1}/${items.length}` : `1/${items.length}`;
  return `${spotlight.zoneLabel} ${routePosition} to ${item.label} zone via workflow-spotlight-focus`;
}

export function soundFocusRouteLabel(parameters: SoundFocusParameter[]): string {
  if (parameters.length === 0) {
    return "No tone route needed";
  }

  const includesAny = (targets: SoundFocusParameter[]): boolean =>
    targets.some((parameter) => parameters.includes(parameter));
  const routes: string[] = [];
  if (includesAny(["bassDrive", "bassDecay", "sidechainDuck"])) {
    routes.push("808");
  }
  if (includesAny(["synthBrightness", "synthRelease"])) {
    routes.push("Synth");
  }
  if (includesAny(["chordWarmth", "chordWidth"])) {
    routes.push("Chords");
  }
  if (includesAny(["kickPunch", "snareSnap", "hatBrightness"])) {
    routes.push(routes.length > 0 ? "Drum support" : "Drums");
  }

  return `${routes.join(" / ")} route`;
}

export function soundPresetRouteLabel(before: SoundDesign, after: SoundDesign): string {
  const routes: string[] = [];
  if (before.kickPunch !== after.kickPunch || before.snareSnap !== after.snareSnap || before.hatBrightness !== after.hatBrightness) {
    routes.push("Drums");
  }
  if (before.bassDrive !== after.bassDrive || before.bassDecay !== after.bassDecay) {
    routes.push("808");
  }
  if (before.sidechainDuck !== after.sidechainDuck) {
    routes.push("Duck");
  }
  if (before.synthBrightness !== after.synthBrightness || before.synthRelease !== after.synthRelease) {
    routes.push("Synth");
  }
  if (before.chordWarmth !== after.chordWarmth || before.chordWidth !== after.chordWidth) {
    routes.push("Chords");
  }
  if (routes.length === 0 && before.preset !== after.preset) {
    routes.push("Preset identity");
  }

  return routes.length === 0 ? "No preset route needed" : `${routes.join(" / ")} route`;
}

export function drumKitRouteLabel(pad: DrumKitPadOption): string {
  return `${pad.label} kit route (${pad.detail})`;
}

export function spaceFxRouteLabel(before: MixerChannel[], after: MixerChannel[]): string {
  const routes: string[] = [];
  if (spaceFxTrackPosture(before, "drum_rack") !== spaceFxTrackPosture(after, "drum_rack")) {
    routes.push("Drums");
  }
  if (spaceFxTrackPosture(before, "bass_808") !== spaceFxTrackPosture(after, "bass_808")) {
    routes.push("808");
  }
  if (spaceFxTrackPosture(before, "synth") !== spaceFxTrackPosture(after, "synth")) {
    routes.push("Synth");
  }
  if (spaceFxTrackPosture(before, "chord") !== spaceFxTrackPosture(after, "chord")) {
    routes.push("Chords");
  }

  return routes.length === 0 ? "No Space FX route needed" : `${routes.join(" / ")} route`;
}

export function mixBalanceRouteLabel(before: MixerChannel[], after: MixerChannel[]): string {
  const routes: string[] = [];
  if (mixBalanceChannelPosture(before, "drum_rack") !== mixBalanceChannelPosture(after, "drum_rack")) {
    routes.push("Drums");
  }
  if (mixBalanceChannelPosture(before, "bass_808") !== mixBalanceChannelPosture(after, "bass_808")) {
    routes.push("808");
  }
  if (mixBalanceChannelPosture(before, "synth") !== mixBalanceChannelPosture(after, "synth")) {
    routes.push("Synth");
  }
  if (mixBalanceChannelPosture(before, "chord") !== mixBalanceChannelPosture(after, "chord")) {
    routes.push("Chords");
  }

  return routes.length === 0 ? "No Mix Balance route needed" : `${routes.join(" / ")} route`;
}

export function stemAuditionRouteLabel(pad: StemAuditionPadOption): string {
  return pad.trackId === null ? "Full Mix route" : `${pad.label} stem route`;
}
