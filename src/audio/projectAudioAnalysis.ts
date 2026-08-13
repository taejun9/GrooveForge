import {
  arrangementTotalBars,
  projectMasterCeilingDb,
  projectStepDurationSeconds
} from "../domain/workstation";
import type { ProjectState } from "../domain/workstation";
import {
  analyzeProjectExports,
  exportTailDurationSeconds,
  stemTrackIds,
  wavBitDepth,
  wavChannels,
  wavSampleRate
} from "./render";
import type { ExportAnalysis, StemExportAnalyses } from "./render";

export type ProjectAudioAnalysis = {
  mix: ExportAnalysis;
  stems: StemExportAnalyses;
};

const projectAudioAnalysisCommitHoldTestIds = new Set([
  "project-title-input",
  "session-brief-artist",
  "session-brief-vibe",
  "session-brief-reference",
  "session-brief-notes"
]);

export function shouldHoldProjectAudioAnalysisCommit(activeTestId: string | null): boolean {
  return activeTestId !== null && projectAudioAnalysisCommitHoldTestIds.has(activeTestId);
}

export function shouldAcceptProjectAudioAnalysisResponse(
  responseId: number,
  currentRequestId: number,
  responseIdentity: string,
  currentIdentity: string
): boolean {
  return responseId === currentRequestId && responseIdentity === currentIdentity;
}

let cachedProjectAudioAnalysis: { identity: string; analysis: ProjectAudioAnalysis } | null = null;

/**
 * Project fields that can alter rendered PCM or its meter values.
 *
 * UI-only posture and metadata (selected Pattern, title, mode, delivery
 * target, session brief, snapshots, metronome posture) is intentionally
 * excluded so those edits can reuse the exact same analysis without another
 * offline render. Arrangement blocks own the rendered Pattern selection.
 */
export function projectAudioAnalysisIdentity(project: ProjectState): string {
  return JSON.stringify({
    arrangement: project.arrangement,
    automation: project.automation,
    bpm: project.bpm,
    key: project.key,
    masterCeilingDb: project.masterCeilingDb,
    mixer: project.mixer,
    patterns: project.patterns,
    sound: project.sound,
    styleId: project.styleId,
    swing: project.swing
  });
}

export function analyzeProjectAudio(project: ProjectState): ProjectAudioAnalysis {
  const identity = projectAudioAnalysisIdentity(project);
  if (cachedProjectAudioAnalysis?.identity === identity) {
    return cachedProjectAudioAnalysis.analysis;
  }
  const analysis = analyzeProjectExports(project);
  cachedProjectAudioAnalysis = { identity, analysis };
  return analysis;
}

function pendingAnalysis(project: ProjectState): ExportAnalysis {
  const durationSeconds =
    arrangementTotalBars(project) * 16 * projectStepDurationSeconds(project) +
    exportTailDurationSeconds(project);
  return {
    sampleRate: wavSampleRate,
    channels: wavChannels,
    bitDepth: wavBitDepth,
    durationSeconds,
    peakDb: Number.NEGATIVE_INFINITY,
    rmsDb: Number.NEGATIVE_INFINITY,
    headroomDb: 99,
    ceilingDb: projectMasterCeilingDb(project),
    limitedSamples: 0,
    limitedPercent: 0,
    status: "Silent"
  };
}

export function pendingProjectAudioAnalysis(project: ProjectState): ProjectAudioAnalysis {
  const mix = pendingAnalysis(project);
  return {
    mix,
    stems: Object.fromEntries(stemTrackIds.map((track) => [track, { ...mix }])) as StemExportAnalyses
  };
}
