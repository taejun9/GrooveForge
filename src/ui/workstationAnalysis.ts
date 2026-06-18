import type { StemExportAnalyses, StemTrackId } from "../audio/render";
import { stemTrackIds } from "../audio/render";
import type { MixerChannel } from "../domain/workstation";
import type { MixCoachTone } from "./workstationUiModel";

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
