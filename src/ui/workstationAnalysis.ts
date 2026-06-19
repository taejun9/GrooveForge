import type { StemExportAnalyses, StemTrackId } from "../audio/render";
import { stemTrackIds } from "../audio/render";
import type { ExportAnalysis } from "../audio/render";
import type { MixerChannel, MixPosture, ProjectState, SessionBrief } from "../domain/workstation";
import { activeDeliveryTarget, arrangementTotalBars, getStyle } from "../domain/workstation";
import { barCountLabel, formatDb } from "./workstationPatternTools";
import type {
  BeatReadinessCheck,
  MixCoachTone,
  ReferenceAlignmentCard,
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
