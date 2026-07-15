import {
  activeDeliveryTarget,
  arrangementMuteTrackLabel,
  arrangementTotalBars,
  normalizeProjectTitle,
  patternSlots,
  projectFileName,
  styleProfiles
} from "../domain/workstation";
import type { PatternSlot, ProjectState } from "../domain/workstation";
import { stemTrackIds, stemTrackLabel } from "./render";
import type { ExportAnalysis, StemExportAnalyses } from "./render";

function barCountLabel(bars: number): string {
  return `${bars} ${bars === 1 ? "bar" : "bars"}`;
}

function percentLabel(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "0.00%";
  }
  return `${value.toFixed(2)}%`;
}

function formatDb(value: number): string {
  if (!Number.isFinite(value)) {
    return "-inf dB";
  }
  return `${value.toFixed(1)} dB`;
}

function usedPatternSlots(project: ProjectState): PatternSlot[] {
  const slots = new Set(project.arrangement.map((block) => block.pattern));
  return patternSlots.filter((slot) => slots.has(slot));
}

export function exportDynamicsDb(analysis: ExportAnalysis): number {
  if (!Number.isFinite(analysis.peakDb) || !Number.isFinite(analysis.rmsDb)) {
    return 0;
  }
  return Math.max(0, analysis.peakDb - analysis.rmsDb);
}

export function createHandoffSheet(
  project: ProjectState,
  analysis: ExportAnalysis,
  stemAnalyses: StemExportAnalyses
): string {
  const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(project);
  const patternUsage = usedPatternSlots(project).join("/") || project.selectedPattern;
  const brief = project.sessionBrief;
  const arrangementLines = project.arrangement.map(
    (block, index) =>
      `${index + 1}. ${block.section} / Pattern ${block.pattern} / ${barCountLabel(block.bars)} / Energy ${percentLabel(block.energy)} / Muted ${block.mutedTracks.length === 0 ? "None" : block.mutedTracks.map(arrangementMuteTrackLabel).join(", ")}`
  );
  const stemLines = stemTrackIds.map((track) => {
    const stem = stemAnalyses[track];
    const audible = Number.isFinite(stem.rmsDb);
    return `${stemTrackLabel(track)}: ${audible ? "Audible" : "Silent"} / Peak ${formatDb(stem.peakDb)} / RMS ${formatDb(stem.rmsDb)} / Headroom ${formatDb(stem.headroomDb)}`;
  });
  const sections = [
    "GrooveForge Handoff Sheet",
    "",
    "Project",
    `Title: ${normalizeProjectTitle(project.title)}`,
    `Style: ${styleName}`,
    `BPM: ${project.bpm}`,
    `Key: ${project.key}`,
    `Selected Pattern: ${project.selectedPattern}`,
    `Arrangement: ${barCountLabel(bars)} / Pattern ${patternUsage}`,
    "",
    "Delivery Target",
    `Name: ${target.name}`,
    `Focus: ${target.focus}`,
    `Target Length: ${barCountLabel(target.targetBars)}`,
    `Target Stems: ${target.stemGoal}`,
    `Master Preset: ${project.masterPreset}`,
    `Master Ceiling: ${formatDb(project.masterCeilingDb)}`,
    "",
    "Session Brief",
    `Artist: ${handoffValue(brief.artist)}`,
    `Vibe: ${handoffValue(brief.vibe)}`,
    `Reference: ${handoffValue(brief.reference)}`,
    `Notes: ${handoffValue(brief.notes)}`,
    "",
    "Arrangement Blocks",
    ...arrangementLines,
    "",
    "Export Meter",
    `Status: ${analysis.status}`,
    `Duration: ${analysis.durationSeconds.toFixed(2)} sec`,
    `Peak: ${formatDb(analysis.peakDb)}`,
    `RMS: ${formatDb(analysis.rmsDb)}`,
    `Dynamics: ${formatDb(exportDynamicsDb(analysis))}`,
    `Headroom: ${formatDb(analysis.headroomDb)}`,
    `Limiter Activity: ${formatPercent(analysis.limitedPercent)}`,
    "",
    "Stem Meter",
    ...stemLines,
    "",
    "Notes",
    "Peak, RMS, dynamics, headroom, and limiter activity are local render checks, not platform-compliance, true-peak, LUFS, publishing, or mastering guarantees.",
    "This sheet is generated from local project data and does not include audio media."
  ];

  return `${sections.join("\n")}\n`;
}

export function handoffValue(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "Not set";
}

export function handoffSheetFileName(project: ProjectState): string {
  return `${projectFileName(project).replace(/\.grooveforge\.json$/, "") || "grooveforge-project"}-handoff.txt`;
}
