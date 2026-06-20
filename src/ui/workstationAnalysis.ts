import type { StemExportAnalyses, StemTrackId } from "../audio/render";
import { stemTrackIds } from "../audio/render";
import type { ExportAnalysis } from "../audio/render";
import type { MixerChannel, MixPosture, ProjectState, SessionBrief } from "../domain/workstation";
import { activeDeliveryTarget, arrangementTotalBars, getStyle } from "../domain/workstation";
import { barCountLabel, formatDb } from "./workstationPatternTools";
import type {
  BeatReadinessCheck,
  MixSnapshot,
  MixSnapshotComparisonMetric,
  MixSnapshotComparisonSummary,
  MixSnapshotMetricId,
  MixSnapshotSlotId,
  MixSnapshotSlotMap,
  MixCoachTone,
  ReferenceAlignmentCard,
  ReferenceAlignmentFocusResult,
  ReferenceAlignmentSummary,
  SessionBriefCompassCard,
  SessionBriefCompassSummary,
  SessionBriefRoleSummary
} from "./workstationUiModel";
import { mixPostureOptions } from "./workstationUiModel";

export function audibleStemTracks(stemAnalyses: StemExportAnalyses): StemTrackId[] {
  return stemTrackIds.filter((track) => Number.isFinite(stemAnalyses[track].rmsDb));
}

export function weakestTone(tones: MixCoachTone[]): MixCoachTone {
  if (tones.includes("danger")) {
    return "danger";
  }
  if (tones.includes("warn")) {
    return "warn";
  }
  return "good";
}

export function masterChannelVolumeDb(mixer: MixerChannel[]): number {
  return mixer.find((channel) => channel.id === "master")?.volumeDb ?? -1;
}

export function stemSpreadDb(stemAnalyses: StemExportAnalyses): number | null {
  const audibleStems = stemTrackIds
    .map((track) => stemAnalyses[track])
    .filter((analysis) => Number.isFinite(analysis.rmsDb));
  if (audibleStems.length < 2) {
    return null;
  }
  const levels = audibleStems.map((analysis) => analysis.rmsDb);
  return Math.max(...levels) - Math.min(...levels);
}

export function createMixSnapshotComparison(snapshots: MixSnapshotSlotMap): MixSnapshotComparisonSummary {
  const { A, B } = snapshots;
  const metrics = createMixSnapshotComparisonMetrics(A, B);

  if (!A && !B) {
    return {
      statusLabel: "No captures",
      winnerLabel: "A/B empty",
      detailLabel: "Capture a current mix into A or B.",
      detailTitle: "Mix Snapshot A/B has no captured mix passes.",
      decisionStatus: "Capture start",
      decisionLabel: "Capture A first",
      decisionDetail: "Save the current mix into A, then make one concrete mix change before B.",
      decisionTitle: "No Mix Snapshot slots are captured. Capture A before comparing A/B.",
      decisionActionId: "capture-a",
      decisionActionLabel: "Capture A",
      tone: "warn",
      metrics
    };
  }

  if (!A || !B) {
    const captured = A ?? B;
    const missingSlot: MixSnapshotSlotId = A ? "B" : "A";
    const capturedSlot = captured?.slot ?? "A";
    return {
      statusLabel: "One capture",
      winnerLabel: `Mix ${capturedSlot} held`,
      detailLabel: `Capture ${missingSlot} to compare against ${captured?.exportLabel ?? "the held mix"}.`,
      detailTitle: `Mix ${capturedSlot} is captured for ${captured?.projectTitle ?? "current project"}; Mix ${missingSlot} is empty.`,
      decisionStatus: "Capture pair",
      decisionLabel: `Capture ${missingSlot} next`,
      decisionDetail: `Keep Mix ${capturedSlot} held, change one mix/master choice, then capture ${missingSlot}.`,
      decisionTitle: `Mix ${capturedSlot} is held. Capture Mix ${missingSlot} before deciding between passes.`,
      decisionActionId: missingSlot === "A" ? "capture-a" : "capture-b",
      decisionActionLabel: `Capture ${missingSlot}`,
      tone: captured?.tone ?? "warn",
      metrics
    };
  }

  const scoreDelta = A.score - B.score;
  if (Math.abs(scoreDelta) <= 2) {
    return {
      statusLabel: "Close passes",
      winnerLabel: "A/B close",
      detailLabel: `${A.exportLabel} vs ${B.exportLabel}; choose by listening context.`,
      detailTitle: `Mix A and Mix B are close. A score ${A.score}, B score ${B.score}; A ${A.balanceLabel}; B ${B.balanceLabel}.`,
      decisionStatus: "Listen close",
      decisionLabel: "Choose by hook context",
      decisionDetail: "Recall A or B explicitly, then play Full Mix and the core stems before committing.",
      decisionTitle: `Mix A and Mix B are close: A score ${A.score}, B score ${B.score}. Choose by listening context.`,
      decisionActionId: "recall-a",
      decisionActionLabel: "Recall A",
      tone: weakestTone([A.tone, B.tone]),
      metrics
    };
  }

  const winner = scoreDelta > 0 ? A : B;
  const runnerUp = scoreDelta > 0 ? B : A;
  return {
    statusLabel: "Safer pass",
    winnerLabel: `Mix ${winner.slot} safer`,
    detailLabel: `${winner.exportLabel}; ${winner.balanceLabel}; ${winner.stemLabel}.`,
    detailTitle: `Mix ${winner.slot} scored ${winner.score} against Mix ${runnerUp.slot} at ${runnerUp.score}; ${winner.masterLabel}.`,
    decisionStatus: "Recall candidate",
    decisionLabel: `Recall Mix ${winner.slot}`,
    decisionDetail: `Play Full Mix after recall; compare against Mix ${runnerUp.slot} before another fix.`,
    decisionTitle: `Mix ${winner.slot} is the safer pass by score. Recall remains explicit and undoable.`,
    decisionActionId: winner.slot === "A" ? "recall-a" : "recall-b",
    decisionActionLabel: `Recall ${winner.slot}`,
    tone: winner.tone === "danger" ? "warn" : winner.tone,
    metrics
  };
}

function createMixSnapshotComparisonMetrics(
  aSnapshot: MixSnapshot | null,
  bSnapshot: MixSnapshot | null
): MixSnapshotComparisonMetric[] {
  const metricLabels: Array<{ id: MixSnapshotMetricId; label: string }> = [
    { id: "headroom", label: "Headroom" },
    { id: "balance", label: "Balance" },
    { id: "master", label: "Master" },
    { id: "stems", label: "Stems" }
  ];

  return metricLabels.map(({ id, label }) => ({
    id,
    label,
    aLabel: mixSnapshotMetricLabel(aSnapshot, id),
    bLabel: mixSnapshotMetricLabel(bSnapshot, id),
    tone: mixSnapshotMetricTone(aSnapshot, bSnapshot, id)
  }));
}

function mixSnapshotMetricLabel(snapshot: MixSnapshot | null, id: MixSnapshotMetricId): string {
  if (!snapshot) {
    return "waiting";
  }
  switch (id) {
    case "headroom":
      return snapshot.exportLabel;
    case "balance":
      return snapshot.balanceLabel;
    case "master":
      return snapshot.masterLabel;
    case "stems":
      return snapshot.stemLabel;
  }
}

function mixSnapshotMetricTone(
  aSnapshot: MixSnapshot | null,
  bSnapshot: MixSnapshot | null,
  id: MixSnapshotMetricId
): MixCoachTone {
  const tones = [mixSnapshotSingleMetricTone(aSnapshot, id), mixSnapshotSingleMetricTone(bSnapshot, id)].filter(
    (tone): tone is MixCoachTone => tone !== null
  );
  return tones.length === 0 ? "warn" : weakestTone(tones);
}

function mixSnapshotSingleMetricTone(snapshot: MixSnapshot | null, id: MixSnapshotMetricId): MixCoachTone | null {
  if (!snapshot) {
    return null;
  }
  switch (id) {
    case "headroom":
      if (snapshot.exportLabel.startsWith("Silent")) {
        return "danger";
      }
      return snapshot.headroomDb < 0.5 || snapshot.limitedPercent > 0 ? "warn" : "good";
    case "balance":
      if (snapshot.balanceSpreadDb === null) {
        return "danger";
      }
      return snapshot.balanceSpreadDb > 18 ? "warn" : "good";
    case "master":
      return snapshot.tone;
    case "stems":
      return snapshot.audibleStemCount === 0 ? "danger" : snapshot.audibleStemCount < 2 ? "warn" : "good";
  }
}

const sessionBriefAnalysisFields: (keyof SessionBrief)[] = ["artist", "vibe", "reference", "notes"];

export function createSessionBriefRoleSummary(brief: SessionBrief): SessionBriefRoleSummary {
  const filledFields = sessionBriefFilledFields(brief);
  const status = sessionBriefStatus(brief);
  const hasArtist = brief.artist.trim().length > 0;
  const hasVibe = brief.vibe.trim().length > 0;
  const hasReference = brief.reference.trim().length > 0;
  const hasNotes = brief.notes.trim().length > 0;
  const hasContext = hasArtist || hasReference || hasNotes;
  const nextField = [
    hasVibe ? null : "Vibe",
    hasContext ? null : "Artist/ref/notes",
    hasArtist ? null : "Artist",
    hasReference ? null : "Reference",
    hasNotes ? null : "Notes"
  ].find(Boolean);

  const roleLabel = hasVibe && hasContext
    ? "Handoff context"
    : hasVibe
      ? "Direction seed"
      : filledFields > 0
        ? "Brief sketch"
        : "Open brief";
  const detailLabel = nextField ? `Next ${nextField}` : "Ready for sheet";

  return {
    roleLabel,
    statusLabel: status.value,
    detailLabel,
    detailTitle: `${filledFields}/4 fields / ${status.detail} / ${detailLabel}`,
    tone: status.tone
  };
}

export function createSessionBriefCompassSummary(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): SessionBriefCompassSummary {
  const brief = project.sessionBrief;
  const target = activeDeliveryTarget(project);
  const style = getStyle(project);
  const bars = arrangementTotalBars(project);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const hasArtist = brief.artist.trim().length > 0;
  const hasVibe = brief.vibe.trim().length > 0;
  const hasReference = brief.reference.trim().length > 0;
  const hasNotes = brief.notes.trim().length > 0;
  const filledFields = sessionBriefFilledFields(brief);
  const contextTone: MixCoachTone = filledFields >= 3 ? "good" : filledFields >= 1 ? "warn" : "danger";
  const requiredStems = Math.min(target.stemGoal, stemTrackIds.length);
  const handoffTone: MixCoachTone =
    filledFields >= 3 && analysis.status !== "Silent" && audibleStems.length >= requiredStems
      ? "good"
      : filledFields >= 2 && analysis.status !== "Silent" && audibleStems.length >= 2
        ? "warn"
        : "danger";
  const cards: SessionBriefCompassCard[] = [
    {
      id: "direction",
      label: "Direction",
      value: hasVibe ? compactSessionBriefValue(brief.vibe) : "No vibe",
      detail: hasVibe
        ? `${style.name} / ${project.key} / ${project.bpm} BPM`
        : `Add a mood or energy cue for ${style.name}.`,
      nextCheck: hasVibe ? "Match Beat Spine and Composer Guide moves to this vibe." : "Fill Vibe before choosing more writing moves.",
      tone: hasVibe ? "good" : "warn"
    },
    {
      id: "reference",
      label: "Reference",
      value: hasReference ? compactSessionBriefValue(brief.reference) : "No reference",
      detail: hasReference
        ? "Use by ear; no track import needed."
        : "Add a track, scene, or sound cue as text.",
      nextCheck: hasReference ? "Use Listening Pass to compare feel by ear." : "Write a text reference before mix decisions.",
      tone: hasReference ? "good" : "warn"
    },
    {
      id: "artist",
      label: target.id === "vocal_session" ? "Vocal Context" : "Artist Context",
      value: hasArtist ? compactSessionBriefValue(brief.artist) : "Open artist",
      detail: hasNotes ? compactSessionBriefValue(brief.notes) : `${target.name} / ${mixPostureLabel(target.mixPosture)}`,
      nextCheck: hasArtist || hasNotes ? "Keep arrangement space aligned with this context." : "Add artist or notes before handoff.",
      tone: hasArtist || hasNotes ? "good" : "warn"
    },
    {
      id: "handoff",
      label: "Handoff",
      value: `${filledFields}/4 fields`,
      detail: `${barCountLabel(bars)} / ${analysis.status} / ${audibleStems.length}/${target.stemGoal} stems`,
      nextCheck: handoffTone === "good" ? "Review Handoff Pack before export." : "Fill brief, confirm stems, then export explicitly.",
      tone: handoffTone
    }
  ];
  const tone = weakestTone([...cards.map((card) => card.tone), contextTone]);
  const readyCount = cards.filter((card) => card.tone === "good").length;
  const headline =
    tone === "good" ? "Brief ready for session decisions" : tone === "warn" ? "Brief needs one more cue" : "Brief blocks handoff";

  return {
    headline,
    detail: `${readyCount}/${cards.length} ready / ${target.name} / local notes only`,
    tone,
    cards
  };
}

export function activeSessionBriefCompassQuickActionCard(summary: SessionBriefCompassSummary): SessionBriefCompassCard {
  const focusCard =
    summary.cards.find((card) => card.tone === "danger") ??
    summary.cards.find((card) => card.tone === "warn") ??
    summary.cards.find((card) => card.id === "handoff") ??
    summary.cards[0];

  if (!focusCard) {
    throw new Error("Session Brief Compass requires at least one card");
  }
  return focusCard;
}

export function createReferenceAlignmentSummary(
  project: ProjectState,
  checks: BeatReadinessCheck[],
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): ReferenceAlignmentSummary {
  const brief = project.sessionBrief;
  const target = activeDeliveryTarget(project);
  const style = getStyle(project);
  const bars = arrangementTotalBars(project);
  const audibleStems = audibleStemTracks(stemAnalyses);
  const filledFields = sessionBriefFilledFields(brief);
  const hasReference = brief.reference.trim().length > 0;
  const hasVibe = brief.vibe.trim().length > 0;
  const arrangementCheck = readinessCheckForId(checks, "arrangement");
  const arrangementTone: MixCoachTone =
    arrangementCheck?.tone ?? (bars >= target.targetBars ? "good" : bars >= 8 ? "warn" : "danger");
  const mixSummary = referenceMixSummary(analysis, stemAnalyses);
  const requiredStems = Math.min(target.stemGoal, stemTrackIds.length);
  const handoffTone: MixCoachTone =
    filledFields >= 3 && hasReference && analysis.status === "Ready" && audibleStems.length >= requiredStems
      ? "good"
      : filledFields >= 2 && (hasReference || hasVibe) && analysis.status !== "Silent" && audibleStems.length >= 2
        ? "warn"
        : "danger";
  const mixCardTone: MixCoachTone = analysis.status === "Silent" ? "danger" : mixSummary.tone === "good" && analysis.status === "Ready" ? "good" : "warn";
  const listenCue = referenceListenCue({
    arrangementTone,
    handoffTone,
    hasReference,
    hasVibe,
    mixCardTone,
    status: analysis.status
  });
  const cards: ReferenceAlignmentCard[] = [
    {
      id: "reference",
      label: "Reference",
      value: hasReference ? compactSessionBriefValue(brief.reference) : "No reference",
      detail: hasReference ? "Text reference only / compare by ear" : "Add a track, scene, or sound cue as text",
      nextCheck: hasReference ? "Run Listening Pass and compare groove, sound, and space by ear." : "Fill Reference before judging final sound fit.",
      focusTarget: "reference",
      focusLabel: "Reference",
      tone: hasReference ? "good" : "warn"
    },
    {
      id: "direction",
      label: "Direction",
      value: hasVibe ? compactSessionBriefValue(brief.vibe) : "No vibe",
      detail: `${style.name} / ${project.key} / ${project.bpm} BPM`,
      nextCheck: hasVibe ? "Keep Composer Actions and sound moves pointed at this cue." : "Fill Vibe before choosing more writing moves.",
      focusTarget: "vibe",
      focusLabel: "Vibe",
      tone: hasVibe ? "good" : "warn"
    },
    {
      id: "arrangement",
      label: "Form",
      value: barCountLabel(bars),
      detail: `${target.name} target ${barCountLabel(target.targetBars)} / ${arrangementCheck?.status ?? "Arrangement check"}`,
      nextCheck:
        arrangementTone === "good"
          ? "Play Song and compare section energy against the reference cue."
          : "Use Arrangement Template, Pattern Chain, or Section Locator before final listening.",
      focusTarget: "arrange",
      focusLabel: "Arrange",
      tone: arrangementTone
    },
    {
      id: "mix",
      label: "Mix",
      value: analysis.status,
      detail: `${formatDb(analysis.headroomDb)} headroom / ${mixSummary.openChecks} mix checks`,
      nextCheck:
        mixCardTone === "good"
          ? "Use Full Mix and stems to compare reference loudness posture by ear."
          : "Use Mix Coach, Mix Fix, or Master Finish before handoff.",
      focusTarget: "master",
      focusLabel: "Master",
      tone: mixCardTone
    },
    {
      id: "listen",
      label: "Listen Cue",
      value: listenCue.value,
      detail: `${target.name} / ${listenCue.detail}`,
      nextCheck: listenCue.nextCheck,
      focusTarget: listenCue.focusTarget,
      focusLabel: listenCue.focusLabel,
      tone: listenCue.tone
    },
    {
      id: "handoff",
      label: "Handoff",
      value: `${filledFields}/4 brief`,
      detail: `${audibleStems.length}/${target.stemGoal} stems / ${target.name}`,
      nextCheck:
        handoffTone === "good"
          ? "Review Handoff Pack after the reference pass."
          : "Fill brief context and confirm WAV/stem delivery before sending.",
      focusTarget: "deliver",
      focusLabel: "Deliver",
      tone: handoffTone
    }
  ];
  const tone = weakestTone(cards.map((card) => card.tone));
  const readyCount = cards.filter((card) => card.tone === "good").length;
  const headline =
    tone === "good" ? "Reference pass ready" : tone === "warn" ? "Reference fit needs review" : "Reference fit blocked";

  return {
    headline,
    detail: `${readyCount}/${cards.length} aligned / ${target.name} / no audio import`,
    tone,
    cards
  };
}

type ReferenceListenCueInput = {
  arrangementTone: MixCoachTone;
  handoffTone: MixCoachTone;
  hasReference: boolean;
  hasVibe: boolean;
  mixCardTone: MixCoachTone;
  status: ExportAnalysis["status"];
};

type ReferenceListenCue = {
  value: string;
  detail: string;
  nextCheck: string;
  focusTarget: ReferenceAlignmentCard["focusTarget"];
  focusLabel: string;
  tone: MixCoachTone;
};

function referenceListenCue(input: ReferenceListenCueInput): ReferenceListenCue {
  if (!input.hasReference) {
    return {
      value: "Reference first",
      detail: "write the comparison cue before listening",
      nextCheck: "Fill Reference, then run Listening Pass without importing audio.",
      focusTarget: "reference",
      focusLabel: "Reference",
      tone: "warn"
    };
  }
  if (!input.hasVibe) {
    return {
      value: "Direction first",
      detail: "write the vibe target before comparing takes",
      nextCheck: "Fill Vibe so the reference pass has a clear sound direction.",
      focusTarget: "vibe",
      focusLabel: "Vibe",
      tone: "warn"
    };
  }
  if (input.arrangementTone !== "good") {
    return {
      value: "Song form first",
      detail: "compare section energy after arrangement is ready",
      nextCheck: "Use Arrange, Section Locator, or Structure Lens before the reference pass.",
      focusTarget: "arrange",
      focusLabel: "Arrange",
      tone: input.arrangementTone
    };
  }
  if (input.status === "Silent") {
    return {
      value: "Signal first",
      detail: "create audible export signal before reference listening",
      nextCheck: "Add or unmute musical events, then run the reference pass again.",
      focusTarget: "master",
      focusLabel: "Master",
      tone: "danger"
    };
  }
  if (input.mixCardTone !== "good") {
    return {
      value: "Mix pass first",
      detail: "compare loudness posture after Mix Coach improves",
      nextCheck: "Use Mix Coach or Master Finish before judging final reference fit.",
      focusTarget: "master",
      focusLabel: "Master",
      tone: "warn"
    };
  }
  if (input.handoffTone !== "good") {
    return {
      value: "Full mix pass",
      detail: "compare groove, hook, space, and finish by ear",
      nextCheck: "Run Listening Pass, then complete the Handoff Pack checks.",
      focusTarget: "master",
      focusLabel: "Master",
      tone: "good"
    };
  }
  return {
    value: "Handoff pass",
    detail: "final compare before WAV, stems, MIDI, and sheet export",
    nextCheck: "Run Listening Pass and Export Preflight before sending files.",
    focusTarget: "deliver",
    focusLabel: "Deliver",
    tone: "good"
  };
}

export function activeReferenceAlignmentQuickActionCard(summary: ReferenceAlignmentSummary): ReferenceAlignmentCard {
  const card =
    summary.cards.find((candidate) => candidate.tone === "danger") ??
    summary.cards.find((candidate) => candidate.tone === "warn") ??
    summary.cards.find((candidate) => candidate.id === "handoff") ??
    summary.cards[0];

  if (!card) {
    throw new Error("Reference Alignment requires at least one card");
  }
  return card;
}

export function createReferenceAlignmentFocusResult(
  card: ReferenceAlignmentCard,
  summary: ReferenceAlignmentSummary
): ReferenceAlignmentFocusResult {
  const summaryCard = summary.cards.find((candidate) => candidate.id === card.id) ?? card;

  return {
    cardId: card.id,
    status: "Focused",
    title: `${card.label} reference lane focused`,
    detail: `${card.value}: ${card.detail}`,
    destination: referenceAlignmentFocusDestination(card),
    metricLabel: "Alignment",
    metricValue: referenceAlignmentFocusResultMetric(summaryCard, summary),
    auditionCue: referenceAlignmentFocusResultAudition(card),
    nextCheck: card.nextCheck,
    tone: summaryCard.tone
  };
}

function referenceAlignmentFocusDestination(card: ReferenceAlignmentCard): string {
  switch (card.focusTarget) {
    case "artist":
      return "Artist field";
    case "vibe":
      return "Vibe field";
    case "reference":
      return "Reference field";
    case "notes":
      return "Notes field";
    case "arrange":
      return "Arrange panel";
    case "master":
      return "Master panel";
    case "deliver":
      return "Deliver panel";
  }
}

function referenceAlignmentFocusResultMetric(card: ReferenceAlignmentCard, summary: ReferenceAlignmentSummary): string {
  const alignedCount = summary.cards.filter((candidate) => candidate.tone === "good").length;
  return `${card.label}: ${card.value} / ${alignedCount}/${summary.cards.length} aligned`;
}

function referenceAlignmentFocusResultAudition(card: ReferenceAlignmentCard): string {
  switch (card.id) {
    case "reference":
      return "Compare the beat by ear against the written reference text, without importing reference audio.";
    case "direction":
      return "Use the vibe field to keep Composer Actions, sound moves, and mix choices pointed at the same direction.";
    case "arrangement":
      return "Play the Song loop and compare section energy, hook shape, and form against the written cue.";
    case "mix":
      return "Play the Full Mix and compare loudness, headroom, and space posture by ear.";
    case "listen":
      return "Run the focused listening pass from the indicated field or panel before changing the beat.";
    case "handoff":
      return "Inspect Deliver and Handoff Pack before sending WAV, stems, MIDI, or sheet files.";
  }
}

function sessionBriefFilledFields(brief: SessionBrief): number {
  return sessionBriefAnalysisFields.filter((field) => brief[field].trim().length > 0).length;
}

function sessionBriefStatus(brief: SessionBrief): { value: string; detail: string; tone: MixCoachTone } {
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

function compactSessionBriefValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "empty";
  }
  return trimmed.length > 28 ? `${trimmed.slice(0, 25)}...` : trimmed;
}

function mixPostureLabel(posture: MixPosture): string {
  return mixPostureOptions.find((option) => option.id === posture)?.label ?? posture.split("_").join(" ");
}

function readinessCheckForId(checks: BeatReadinessCheck[], id: string): BeatReadinessCheck | undefined {
  return checks.find((check) => check.id === id);
}

function referenceMixSummary(
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): { tone: MixCoachTone; openChecks: number } {
  const audibleStems = audibleStemTracks(stemAnalyses);
  const spread = stemSpreadDb(stemAnalyses);
  const headroomTone: MixCoachTone = analysis.status === "Silent" ? "danger" : analysis.headroomDb >= 3 ? "good" : "warn";
  const stemTone: MixCoachTone = audibleStems.length >= 3 ? "good" : audibleStems.length >= 1 ? "warn" : "danger";
  const spreadTone: MixCoachTone = spread === null ? "warn" : spread <= 18 ? "good" : "warn";
  const tones = [headroomTone, stemTone, spreadTone];

  return {
    tone: weakestTone(tones),
    openChecks: tones.filter((tone) => tone !== "good").length
  };
}
