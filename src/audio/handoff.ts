/**
 * 프로젝트와 로컬 렌더 분석값을 사람이 검토할 수 있는 인수인계 텍스트로 직렬화한다.
 * 편곡·믹스·스템 상태를 요약할 뿐 업로드나 네트워크 요청은 수행하지 않으며,
 * SoundCloud 공개 여부와 권리 확인은 명시적으로 사용자 검토 항목으로 남긴다.
 */
import {
  activeDeliveryTarget,
  arrangementMuteTrackLabel,
  arrangementTotalBars,
  normalizeProjectTitle,
  patternSlots,
  projectArrangement,
  projectBpm,
  projectKey,
  projectMasterCeilingDb,
  projectFileName,
  projectSessionBrief,
  styleProfiles
} from "../domain/workstation";
import type { PatternSlot, ProjectState } from "../domain/workstation";
import { stemTrackIds, stemTrackLabel, wavBitDepth } from "./render";
import type { ExportAnalysis, StemExportAnalyses } from "./render";
import { soundCloudUploadSheetFileName } from "./soundcloud";

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
  // 무음의 -Infinity 같은 비유한 미터값은 문서 계산으로 전파하지 않고 0 dB 차이로 표시한다.
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
  // 파일에 기록하기 전에 편곡을 정규화하여 비정상 bar 값이나 누적 길이가 문서에 그대로 노출되지 않게 한다.
  const arrangement = projectArrangement(project);
  const handoffProject = { ...project, arrangement };
  const styleName = styleProfiles.find((profile) => profile.id === project.styleId)?.name ?? project.styleId;
  const target = activeDeliveryTarget(project);
  const bars = arrangementTotalBars(handoffProject);
  const patternUsage = usedPatternSlots(handoffProject).join("/") || project.selectedPattern;
  const brief = projectSessionBrief(project);
  const arrangementLines = arrangement.map(
    (block, index) =>
      `${index + 1}. ${block.section} / Pattern ${block.pattern} / ${barCountLabel(block.bars)} / Energy ${percentLabel(block.energy)} / Muted ${block.mutedTracks.length === 0 ? "None" : block.mutedTracks.map(arrangementMuteTrackLabel).join(", ")}`
  );
  const stemLines = stemTrackIds.map((track) => {
    const stem = stemAnalyses[track];
    // RMS가 -Infinity인 스템은 숫자 포맷보다 작업자가 이해하기 쉬운 Silent 상태로 구분한다.
    const audible = Number.isFinite(stem.rmsDb);
    return `${stemTrackLabel(track)}: ${audible ? "Audible" : "Silent"} / Peak ${formatDb(stem.peakDb)} / RMS ${formatDb(stem.rmsDb)} / Headroom ${formatDb(stem.headroomDb)}`;
  });
  const sections = [
    "GrooveForge Handoff Sheet",
    "",
    "Project",
    `Title: ${normalizeProjectTitle(project.title)}`,
    `Style: ${styleName}`,
    `BPM: ${projectBpm(project)}`,
    `Key: ${projectKey(project)}`,
    `Selected Pattern: ${project.selectedPattern}`,
    `Arrangement: ${barCountLabel(bars)} / Pattern ${patternUsage}`,
    "",
    "Delivery Target",
    `Name: ${target.name}`,
    `Focus: ${target.focus}`,
    `Target Length: ${barCountLabel(target.targetBars)}`,
    `Target Stems: ${target.stemGoal}`,
    `Master Preset: ${project.masterPreset}`,
    `Master Ceiling: ${formatDb(projectMasterCeilingDb(project))}`,
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
    `Format: ${analysis.sampleRate / 1000} kHz / ${analysis.channels === 2 ? "stereo" : `${analysis.channels} channels`} / signed PCM ${analysis.bitDepth || wavBitDepth}-bit`,
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
    "SoundCloud Preparation",
    `Upload Sheet: ${soundCloudUploadSheetFileName(project)}`,
    "Initial Privacy: Private",
    "Downloads: Off",
    "Rights: Replace artist/rightsholder placeholders and confirm audio/artwork permissions before upload.",
    "Playback Check: Approve the processed stream before making the track Public or enabling monetization/distribution.",
    "",
    "Notes",
    "Peak, RMS, dynamics, headroom, and limiter activity are local render checks, not platform-compliance, true-peak, LUFS, publishing, or mastering guarantees.",
    "This sheet is generated from local project data and does not include audio media."
  ];

  // 줄 끝 개행을 보장해 셸·텍스트 편집기에서 다른 문서를 이어 붙일 때 마지막 줄이 합쳐지지 않게 한다.
  return `${sections.join("\n")}\n`;
}

export function handoffValue(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "Not set";
}

export function handoffSheetFileName(project: ProjectState): string {
  return `${projectFileName(project).replace(/\.grooveforge\.json$/, "") || "grooveforge-project"}-handoff.txt`;
}
